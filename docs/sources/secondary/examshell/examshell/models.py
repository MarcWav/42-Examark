import ast

from pydantic import BaseModel, Field
from pydantic import field_validator


class Description(BaseModel):
    en: str
    de: str
    fr: str
    es: str
    it: str


class Example(BaseModel):
    input: str
    output: str

    @field_validator("input")
    @classmethod
    def input_must_be_function_call(cls, value: str) -> str:
        try:
            expression = ast.parse(value, mode="eval").body
            if not isinstance(expression, ast.Call) or not isinstance(
                expression.func, ast.Name
            ):
                raise ValueError("must be a call to a named function")
            for argument in expression.args:
                ast.literal_eval(argument)
            for keyword in expression.keywords:
                if keyword.arg is None:
                    raise ValueError("cannot use unpacked keyword arguments")
                ast.literal_eval(keyword.value)
        except (SyntaxError, ValueError, TypeError) as exc:
            raise ValueError(
                "must be a function call with literal arguments"
            ) from exc
        return value


class Task(BaseModel):
    id: int
    level: int
    difficulty: str
    name: str
    file: str
    description: Description
    signature: str
    examples: list[Example]
    forbidden: list[str] = Field(default_factory=list)
