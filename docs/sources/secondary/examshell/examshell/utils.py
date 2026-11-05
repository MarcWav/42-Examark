import ast
import json
from pathlib import Path

import requests
from pyjsparser import PyJsParser
from pydantic import TypeAdapter

from .models import Task


def _to_python(node: dict) -> object:
    match node["type"]:
        case "Literal":
            return node["value"]
        case "ArrayExpression":
            return [_to_python(item) for item in node["elements"]]
        case "ObjectExpression":
            result = {}
            for prop in node["properties"]:
                key_node = prop["key"]
                key = key_node.get("name", key_node.get("value"))
                result[key] = _to_python(prop["value"])
            return result
        case "UnaryExpression" if node["operator"] == "-":
            return -_to_python(node["argument"])
        case _:
            raise ValueError(f"Unsupported JavaScript value: {node['type']}")


def _extract_subjects(source: str) -> list[dict]:
    tree = PyJsParser().parse(source)
    for statement in tree["body"]:
        if statement["type"] != "VariableDeclaration":
            continue
        for declaration in statement["declarations"]:
            if declaration["id"].get("name") == "SUBJECTS":
                subjects = _to_python(declaration["init"])
                TypeAdapter(list[Task]).validate_python(subjects)
                return subjects
    raise ValueError("SUBJECTS was not found in the downloaded JavaScript")


def download_subjects(url: str, output_path: str) -> None:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    subjects = _extract_subjects(response.text)

    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = path.with_name(path.name + ".tmp")
    try:
        with temporary_path.open("w", encoding="utf-8") as file:
            json.dump(subjects, file, ensure_ascii=False, indent=2)
        temporary_path.replace(path)
    finally:
        temporary_path.unlink(missing_ok=True)


def download_solution(url: str, output_path: str) -> bool:
    path = Path(output_path)
    if path.is_file():
        return True

    response = requests.get(url, timeout=10)
    if response.status_code == 404:
        return False
    response.raise_for_status()
    ast.parse(response.text)

    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = path.with_name(path.name + ".tmp")
    try:
        temporary_path.write_text(response.text, encoding="utf-8")
        temporary_path.replace(path)
    finally:
        temporary_path.unlink(missing_ok=True)
    return True