import ast
import json

import random
from .models import Task

from pydantic import TypeAdapter

from pathlib import Path
import importlib.util

from rich.console import Console
from rich.markup import escape
from rich.panel import Panel

from rich.table import Table
from importlib import resources


console = Console()


def get_available_ranks() -> list[int]:
    ranks = []
    for data_file in resources.files("examshell.data").iterdir():
        name = data_file.name
        if name.startswith("rank") and name.endswith(".json"):
            rank = name[4:-5]
            if rank.isdigit():
                ranks.append(int(rank))
    return sorted(ranks)


def get_tasks(file: str) -> list[Task]:
    adapter = TypeAdapter(list[Task])
    data_file = resources.files("examshell.data").joinpath(file)
    with data_file.open("r", encoding="utf-8") as f:
        return adapter.validate_python(json.load(f))


def find_forbidden_usages(
    source: str, forbidden: list[str]
) -> list[tuple[str, int]]:
    if not forbidden:
        return []

    tree = ast.parse(source)
    aliases = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                local_name = alias.asname or alias.name.split(".")[0]
                aliases[local_name] = alias.name if alias.asname else local_name
        elif isinstance(node, ast.ImportFrom) and node.module:
            for alias in node.names:
                local_name = alias.asname or alias.name
                aliases[local_name] = f"{node.module}.{alias.name}"

    normalized = [(name, name.removesuffix("()")) for name in forbidden]

    def qualified_name(node: ast.AST) -> str | None:
        if isinstance(node, ast.Name):
            return aliases.get(node.id, node.id)
        if isinstance(node, ast.Attribute):
            base = qualified_name(node.value)
            return f"{base}.{node.attr}" if base else node.attr
        return None

    def forbidden_name(name: str) -> str | None:
        for original, target in normalized:
            if target.startswith("."):
                if name.endswith(target):
                    return original
            elif name == target or (
                "." not in target and name == f"builtins.{target}"
            ):
                return original
        return None

    usages = []
    seen = set()
    for node in ast.walk(tree):
        if isinstance(node, (ast.Name, ast.Attribute)):
            name = qualified_name(node)
            match = forbidden_name(name) if name else None
            if match and (match, node.lineno) not in seen:
                usages.append((match, node.lineno))
                seen.add((match, node.lineno))
    return usages


class TaskManager:
    def __init__(self, real_mode: bool = True, rank: int = 3):
        self.data = sorted(get_tasks(f"rank{rank}.json"), key=lambda a: a.level)
        self.real_mode = real_mode
        self.points = 0
        self.current_level = 1
        self.current_task: int | None = None
        self.path = self._create_folder()

    def _create_folder(
        self, path_str: str = "exam42", fallback: int = 1
    ) -> Path:
        path = Path(f"./{path_str}")
        if path.exists():
            return self._create_folder(
                "exam42" + "-" + str(fallback), fallback=fallback + 1
            )
        path.mkdir(parents=True)
        (path / "subjects").mkdir(parents=True)
        (path / "rendu").mkdir(parents=True)
        return path

    def get_next_task(self) -> Task:
        if self.real_mode:
            return self._get_task_by_real_mode()
        else:
            return self._get_next_task()

    def get_data_by_level(self, level) -> list[Task]:
        data = []
        for d in self.data:
            if d.level == level:
                data.append(d)
        return data

    def get_task_by_id(self, id) -> Task | None:
        for t in self.data:
            if t.id == id:
                return t

    def set_current_task(self, task: Task) -> None:
        self.current_task = task.id

    def _get_task_by_real_mode(self) -> Task | None:
        data = self.get_data_by_level(self.current_level)
        if not data:
            return None
        task = random.choice(data)
        self.current_task = task.id
        return task

    def _get_next_task(self) -> Task:
        if not self.current_task:
            self.current_task = self.data[0].id
            return self.data[0]

        task = self.get_task_by_id(self.current_task)
        next_task_index = self.data.index(task) + 1

        if next_task_index < len(self.data):
            next_task = self.data[next_task_index]
            self.current_task = next_task.id
            return next_task

        return None

    @property
    def level_count(self) -> int:
        return len({task.level for task in self.data})

    def complete_current_level(self) -> None:
        completed_levels = sum(
            level <= self.current_level
            for level in {task.level for task in self.data}
        )
        self.points = 100 * completed_levels // self.level_count
        self.current_level += 1

    def create_task_files(self):
        task = self.get_task_by_id(self.current_task)
        if not task:
            raise FileExistsError()

        path_subject = self.path / "subjects" / task.name
        if not path_subject.exists():
            path_subject.mkdir(parents=True)

        path_rendu = self.path / "rendu" / task.name
        if not path_rendu.exists():
            path_rendu.mkdir(parents=True)

        text_examples = "\n\n"
        for e in task.examples:
            text_examples += e.input + "\n"
            text_examples += e.output + "\n\n"

        for lang, text in task.description.model_dump().items():
            file_name = f"{task.name}.{lang}.txt"
            file_path = path_subject / file_name

            with open(file_path, "w", encoding="utf-8") as f:
                f.write(
                    text + "\n\n" + task.signature + text_examples
                )

    def check_task(self) -> bool:
        task = self.get_task_by_id(self.current_task)

        file_path = self.path / "rendu" / task.name / task.file

        console.rule(f"[bold cyan]Checking: {task.name}[/bold cyan]")

        if not file_path.is_file():
            console.print(
                Panel(
                    f"[red]File not found:[/red] {file_path}",
                    title="[bold red]Error[/bold red]",
                    border_style="red",
                )
            )
            return False

        if task.forbidden:
            try:
                source = file_path.read_text(encoding="utf-8")
                forbidden_usages = find_forbidden_usages(
                    source, task.forbidden
                )
            except (OSError, SyntaxError) as exc:
                console.print(
                    Panel(
                        f"[red]Failed to read or parse solution:[/red]\n{exc}",
                        title="[bold red]Solution error[/bold red]",
                        border_style="red",
                    )
                )
                return False

            if forbidden_usages:
                details = "\n".join(
                    f"{escape(name)} at line {line}"
                    for name, line in forbidden_usages
                )
                console.print(
                    Panel(
                        "[bold red]Check failed: forbidden function used.[/bold red]\n"
                        + details,
                        title="[bold red]Forbidden usage[/bold red]",
                        border_style="red",
                    )
                )
                return False

        module_name = task.file[:-3]

        try:
            spec = importlib.util.spec_from_file_location(
                module_name, file_path
            )
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
        except Exception as exc:
            console.print(
                Panel(
                    f"[red]Failed to import module:[/red]\n{exc}",
                    title="[bold red]Import error[/bold red]",
                    border_style="red",
                )
            )
            return False

        table = Table(show_header=True, header_style="bold magenta")
        table.add_column("Test", justify="right")
        table.add_column("Input", overflow="fold")
        table.add_column("Expected", overflow="fold")
        table.add_column("Got", overflow="fold")
        table.add_column("Status", justify="center")

        all_passed = True

        for idx, example in enumerate(task.examples, start=1):
            try:
                expression = ast.parse(example.input, mode="eval").body
                function = getattr(module, expression.func.id)
                arguments = [ast.literal_eval(argument) for argument in expression.args]
                keyword_arguments = {
                    keyword.arg: ast.literal_eval(keyword.value)
                    for keyword in expression.keywords
                }
                result = function(*arguments, **keyword_arguments)
                expected_result = ast.literal_eval(example.output)

                if result != expected_result:
                    all_passed = False
                    table.add_row(
                        str(idx),
                        example.input,
                        repr(expected_result),
                        f"[red]{result!r}[/red]",
                        "[bold red]FAIL[/bold red]",
                    )
                else:
                    table.add_row(
                        str(idx),
                        example.input,
                        repr(expected_result),
                        f"[green]{result!r}[/green]",
                        "[bold green]OK[/bold green]",
                    )
            except Exception as exc:
                all_passed = False
                table.add_row(
                    str(idx),
                    example.input,
                    example.output,
                    f"[red]Exception: {exc}[/red]",
                    "[bold red]ERROR[/bold red]",
                )

        console.print(table)

        if all_passed:
            console.print(
                Panel(
                    f"[bold green]All tests passed![/bold green] "
                    f"({len(task.examples)}/{len(task.examples)})",
                    border_style="green",
                )
            )
        else:
            console.print(
                Panel(
                    "[bold red]Some tests failed.[/bold red]",
                    border_style="red",
                )
            )

        return all_passed
