from pathlib import Path

from .models import Task
from .task_generator import TaskManager, get_available_ranks
from .utils import download_solution, download_subjects

from rich.console import Console
from rich.panel import Panel

from rich.prompt import Prompt
from rich.table import Table

from rich.progress import Progress, BarColumn, TextColumn
from rich.align import Align

from rich import box

console = Console()
RANK_URLS = {
    3: "https://rank03.42exam.net/js/data.js",
    4: "https://rank04.42exam.net/js/data.js",
    5: "https://rank05.42exam.net/js/data.js",
}
SOLUTIONS_BASE_URL = (
    "https://raw.githubusercontent.com/Denishttps/examshell-solutions/main"
)


def update_rank_files() -> None:
    data_dir = Path(__file__).parent / "data"
    console.print("[dim]Checking for exam rank updates...[/dim]")
    for rank, url in RANK_URLS.items():
        try:
            download_subjects(url, str(data_dir / f"rank{rank}.json"))
            console.print(f"[green]Rank {rank:02d} updated.[/green]")
        except Exception:
            console.print(
                f"[yellow]Could not update rank {rank:02d}; "
                "using local data if available.[/yellow]"
            )


def choose_mode() -> str | None:
    console.clear()
    console.print(
        Panel.fit(
            "[bold cyan]Real mode[/bold cyan] [dim](1)[/dim]\n"
            "[bold yellow]Practice mode[/bold yellow] [dim](2)[/dim]\n"
            "[bold green]Best solutions[/bold green] [dim](3)[/dim]\n"
            "[dim]Back to rank selection (b)[/dim]",
            title="[bold]Choose your Exam mode[/bold]",
            border_style="cyan",
        )
    )
    mode = Prompt.ask(
        "Your answer", choices=["1", "2", "3", "b"], show_choices=False
    )
    if mode == "b":
        return None
    return {"1": "real", "2": "practice", "3": "solutions"}[mode]


def choose_rank() -> int:
    ranks = get_available_ranks()
    if not ranks:
        console.print(
            Panel(
                "[bold red]No exam ranks are available.[/bold red]",
                border_style="red",
            )
        )
        raise SystemExit(1)

    if len(ranks) == 1:
        return ranks[0]

    console.clear()
    choices = [str(rank) for rank in ranks]
    console.print(
        Panel.fit(
            "\n".join(
                f"[bold cyan]Rank {rank:02d}[/bold cyan] [dim]({rank})[/dim]"
                for rank in ranks
            ),
            title="[bold]Choose your Exam rank[/bold]",
            border_style="cyan",
        )
    )
    return int(
        Prompt.ask("Your answer", choices=choices, show_choices=False)
    )


def points_bar(points: int, total: int = 100) -> Progress:
    progress = Progress(
        TextColumn("[bold]Progress[/bold]"),
        BarColumn(bar_width=40),
        TextColumn(f"[bold green]{points}[/bold green]/{total}"),
    )
    progress.add_task("points", total=total, completed=points)
    return progress


def real_mode_screen(manager: TaskManager, task: Task) -> None:
    upld_path = manager.path / "rendu" / task.name / task.file

    console.print(
        Panel.fit(
            "[bold]Welcome to the exam[/bold]",
            border_style="cyan",
            box=box.HEAVY,
        )
    )
    console.rule(f"[bold cyan]{task.name}[/bold cyan]", style="cyan")
    console.print(points_bar(manager.points))

    info = Table.grid(padding=(0, 1))
    info.add_column(style="bold")
    info.add_column()
    info.add_row("Level:", str(manager.current_level))
    info.add_row("Upload to:", f"[italic]{upld_path}[/italic]")
    console.print(info)

    commands = Table(
        title="Commands",
        box=box.SIMPLE,
        show_header=False,
        title_style="bold magenta",
    )
    commands.add_column(style="bold green")
    commands.add_column(style="dim")
    commands.add_row("grademe", "check the answer")
    commands.add_row("status", "show this message again")
    commands.add_row("finish", "finish the exam")
    console.print(commands)


def grademe(manager: TaskManager, task: Task) -> Task:
    check = manager.check_task()

    if check:
        manager.complete_current_level()

        if manager.points >= 100:
            console.print(
                Panel.fit(
                    Align.center(
                        f"[bold green]You passed the exam"
                        f", congratulations![/bold green]\n"
                        f"[bold]{manager.points}/100[/bold]"
                    ),
                    border_style="green",
                    box=box.DOUBLE,
                )
            )
            raise SystemExit(0)

        console.print(
            Panel(
                f"[bold green]Task passed[/bold green] "
                f"({manager.points}/100)",
                border_style="green",
            )
        )

        next_task = manager.get_next_task()
        if next_task is None:
            console.print(
                Panel.fit(
                    Align.center(
                        "[bold yellow]No more tasks left.[/bold yellow]\n"
                        f"[bold]Final score: {manager.points}/100[/bold]"
                    ),
                    border_style="yellow",
                    box=box.DOUBLE,
                )
            )
            raise SystemExit(0)

        return next_task
    else:
        console.print(
            Panel(
                "[bold red]Failed.[/bold red] You can retry",
                border_style="red",
            )
        )
        return task


def real_mode(rank: int) -> None:
    manager = TaskManager(rank=rank)
    task = manager.get_next_task()

    if task is None:
        console.clear()
        console.print(
            Panel(
                "[bold red]No tasks available to start the exam.[/bold red]",
                border_style="red",
            )
        )
        raise SystemExit(1)

    console.clear()
    manager.create_task_files()
    real_mode_screen(manager, task)

    while True:
        user_input = Prompt.ask(
            "[bold cyan]exam42[/bold cyan]",
        ).strip()

        match user_input:
            case "status":
                console.clear()
                real_mode_screen(manager, task)
            case "grademe":
                console.clear()
                real_mode_screen(manager, task)
                task = grademe(manager, task)
                manager.create_task_files()
            case "finish":
                console.clear()
                console.print("[yellow]Exam finished by user.[/yellow]")
                raise SystemExit(0)
            case _:
                console.clear()
                real_mode_screen(manager, task)
                console.print(f"[red]Unknown command:[/red] {user_input!r}")


def solutions_mode(rank: int) -> None:
    manager = TaskManager(real_mode=False, rank=rank)
    solution_root = manager.path / "solutions"
    solution_root.mkdir(parents=True, exist_ok=True)

    table = Table(title=f"Best solutions for rank {rank:02d}")
    table.add_column("Task")
    table.add_column("Status")

    found = 0
    for task in manager.data:
        manager.set_current_task(task)
        manager.create_task_files()
        solution_path = solution_root / task.name / task.file
        url = (
            f"{SOLUTIONS_BASE_URL}/rank{rank}/"
            f"{task.name}/{task.file}"
        )
        try:
            downloaded = download_solution(url, str(solution_path))
        except Exception as exc:
            table.add_row(task.name, f"[yellow]Unavailable: {exc}[/yellow]")
        else:
            if downloaded:
                found += 1
                table.add_row(task.name, "[green]Downloaded[/green]")
            else:
                table.add_row(task.name, "[dim]Not found in repository[/dim]")

    console.clear()
    console.print(table)
    console.print(
        f"[green]Downloaded {found} of {len(manager.data)} solutions.[/green]"
    )
    console.print(f"[dim]Solutions folder: {solution_root}[/dim]")
    Prompt.ask("[bold green]Press Enter to return to rank selection[/bold green]", default="")


def task_list_table(manager: TaskManager) -> Table:
    table = Table(title="Available tasks", header_style="bold magenta")
    table.add_column("#", justify="right")
    table.add_column("Name")
    table.add_column("Level", justify="center")

    for idx, task in enumerate(manager.data, start=1):
        table.add_row(str(idx), task.name, str(task.level))

    return table


def practice_mode_screen(manager: TaskManager, task: Task) -> None:
    upld_path = manager.path / "rendu" / task.name / task.file

    console.print(
        Panel.fit(
            "[bold]Welcome to practice mode[/bold]",
            border_style="yellow",
            box=box.HEAVY,
        )
    )
    console.rule(f"[bold yellow]{task.name}[/bold yellow]", style="yellow")

    info = Table.grid(padding=(0, 1))
    info.add_column(style="bold")
    info.add_column()
    info.add_row("Level:", str(task.level))
    info.add_row("Upload to:", f"[italic]{upld_path}[/italic]")
    console.print(info)

    commands = Table(
        title="Commands",
        box=box.SIMPLE,
        show_header=False,
        title_style="bold magenta",
    )
    commands.add_column(style="bold yellow")
    commands.add_column(style="dim")
    commands.add_row("grademe", "check the answer")
    commands.add_row("list", "show all available tasks")
    commands.add_row("choose", "pick a task by number")
    commands.add_row("skip", "move to the next task in order")
    commands.add_row("status", "show this message again")
    commands.add_row("finish", "finish practice")
    console.print(commands)


def choose_task(manager: TaskManager) -> Task:
    console.print(task_list_table(manager))

    numbers = [str(i) for i in range(1, len(manager.data) + 1)]
    choice = Prompt.ask(
        "Pick a task number", choices=numbers, show_choices=False
    )

    task = manager.data[int(choice) - 1]
    manager.set_current_task(task)
    return task


def practice_mode(rank: int = 3) -> None:
    console.clear()
    console.print(
        Panel.fit(
            "[bold]Welcome to practice mode[/bold]",
            border_style="yellow",
            box=box.HEAVY,
        )
    )

    manager = TaskManager(real_mode=False, rank=rank)

    console.print("[dim]Pick a task to start with.[/dim]")
    task = choose_task(manager)

    console.clear()
    manager.create_task_files()
    practice_mode_screen(manager, task)

    while True:
        user_input = Prompt.ask(
            "[bold yellow]practice42[/bold yellow]",
        ).strip()

        match user_input:
            case "status":
                console.clear()
                practice_mode_screen(manager, task)
            case "list":
                console.clear()
                practice_mode_screen(manager, task)
                console.print(task_list_table(manager))
            case "choose":
                console.clear()
                practice_mode_screen(manager, task)
                task = choose_task(manager)
                manager.create_task_files()
                console.clear()
                practice_mode_screen(manager, task)
            case "skip":
                next_task = manager.get_next_task()
                console.clear()
                if next_task is None:
                    practice_mode_screen(manager, task)
                    console.print(
                        Panel(
                            "[yellow]No more tasks after this one.[/yellow]",
                            border_style="yellow",
                        )
                    )
                else:
                    task = next_task
                    manager.create_task_files()
                    practice_mode_screen(manager, task)
            case "grademe":
                console.clear()
                practice_mode_screen(manager, task)
                check = manager.check_task()
                if check:
                    console.print(
                        Panel(
                            "[bold green]Correct! Well done.[/bold green]",
                            border_style="green",
                        )
                    )
                else:
                    console.print(
                        Panel(
                            "[bold red]Failed.[/bold red] You can retry",
                            border_style="red",
                        )
                    )
            case "finish":
                console.clear()
                console.print("[yellow]Practice finished by user.[/yellow]")
                raise SystemExit(0)
            case _:
                console.clear()
                practice_mode_screen(manager, task)
                console.print(f"[red]Unknown command:[/red] {user_input!r}")


def cli() -> None:
    update_rank_files()
    while True:
        rank = choose_rank()
        mode = choose_mode()
        if mode is None:
            continue
        if mode == "real":
            real_mode(rank)
        elif mode == "practice":
            practice_mode(rank)
        else:
            solutions_mode(rank)
        return


if __name__ == "__main__":
    cli()
