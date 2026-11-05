import ast as _ast
import builtins as _builtins
import contextlib as _contextlib
import io as _io
import json as _json
import traceback as _traceback
import copy as _copy
import time as _time
import sys as _sys


class _LimitedOutput(_io.StringIO):
    def write(self, value):
        remaining = max(0, 20000 - self.tell())
        if remaining:
            super().write(value[:remaining])
        return len(value)


def _repr(value):
    try:
        text = repr(value)
        return text if len(text) <= 20000 else text[:20000] + '… [representação limitada a 20.000 caracteres]'
    except BaseException:
        return '<repr indisponível>'


def _strict_equal(actual, expected):
    if type(actual) is not type(expected):
        return False
    if isinstance(expected, list):
        return len(actual) == len(expected) and all(_strict_equal(a, b) for a, b in zip(actual, expected))
    if isinstance(expected, dict):
        return actual.keys() == expected.keys() and all(_strict_equal(actual[k], expected[k]) for k in expected)
    return actual == expected


def _difference(actual, expected, path='retorno'):
    if type(actual) is not type(expected):
        return {'path': path, 'expected': _repr(expected), 'actual': _repr(actual), 'reason': 'Tipos diferentes: esperado ' + type(expected).__name__ + ', recebido ' + type(actual).__name__ + '.'}
    if isinstance(expected, list):
        for i, (a, b) in enumerate(zip(actual, expected)):
            if not _strict_equal(a, b):
                return _difference(a, b, path + '[' + str(i) + ']')
        if len(actual) != len(expected):
            return {'path': path + '.comprimento', 'expected': str(len(expected)), 'actual': str(len(actual)), 'reason': 'Quantidades de itens diferentes.'}
    if isinstance(expected, str):
        for i, (a, b) in enumerate(zip(actual, expected)):
            if a != b:
                return {'path': path + '[' + str(i) + ']', 'expected': _repr(b), 'actual': _repr(a), 'reason': 'Primeiro caractere diferente (índice começa em zero).'}
        if len(actual) != len(expected):
            return {'path': path + '.comprimento', 'expected': str(len(expected)), 'actual': str(len(actual)), 'reason': 'Quantidades de caracteres diferentes.'}
    return {'path': path, 'expected': _repr(expected), 'actual': _repr(actual), 'reason': 'O valor retornado difere do esperado.'}


def _arguments(case):
    call = _ast.parse(case['input'], mode='eval').body
    if not isinstance(call, _ast.Call) or not isinstance(call.func, _ast.Name) or call.keywords:
        raise ValueError('O teste precisa conter uma chamada literal simples.')
    return call.func.id, [_ast.literal_eval(arg) for arg in call.args]


def _grade(payload):
    started = _time.perf_counter()
    checks = []
    try:
        tree = _ast.parse(payload['code'])
        compiled = compile(tree, '<solucao>', 'exec')
    except SyntaxError:
        return {'results': [], 'errorType': 'syntax', 'error': _traceback.format_exc(), 'checks': [], 'planned': len(payload['tests']), 'durationMs': (_time.perf_counter() - started) * 1000}
    except BaseException:
        return {'results': [], 'errorType': 'internal', 'error': _traceback.format_exc(), 'checks': [], 'planned': len(payload['tests'])}
    if payload.get('restricted'):
        forbidden = next((node for node in _ast.walk(tree) if (isinstance(node, _ast.Name) and node.id == 'sorted') or (isinstance(node, _ast.Attribute) and node.attr in ('sorted', 'sort')) or (isinstance(node, _ast.ImportFrom) and any(alias.name == 'sorted' for alias in node.names))), None)
        checks.append({'id': 'no-builtin-sort', 'name': 'Sem sorted() ou list.sort()', 'passed': forbidden is None, 'expected': 'Não acessar sorted() nem list.sort()', 'actual': 'Nenhum uso ou alias direto encontrado na AST.' if forbidden is None else 'Uso ou alias direto encontrado na linha ' + str(forbidden.lineno) + '.', 'explanation': 'Restrição explícita da versão padrão de cryptic_sorter. A AST também verifica aliases diretos; não é análise formal contra ofuscação.', 'line': None if forbidden is None else forbidden.lineno})
        if forbidden is not None:
            return {'results': [], 'errorType': 'restriction', 'restriction': 'Esta versão proíbe sorted() e list.sort(), inclusive aliases diretos.', 'checks': checks, 'planned': len(payload['tests']), 'durationMs': (_time.perf_counter() - started) * 1000}
    results = []
    for case in (payload['tests'] if payload['tests'] else [None]):
        case_started = _time.perf_counter()
        stdout, stderr = _LimitedOutput(), _LimitedOutput()
        actual = expected = None
        available = False
        error = kind = difference = None
        passed = False
        if case:
            try:
                name, args = _arguments(case)
                original_args = _copy.deepcopy(args)
                expected = _ast.literal_eval(case['output'])
            except BaseException:
                return {'results': results, 'errorType': 'internal', 'error': 'Teste local inválido: ' + _traceback.format_exc(), 'checks': checks, 'planned': len(payload['tests'])}
        with _contextlib.redirect_stdout(stdout), _contextlib.redirect_stderr(stderr):
            try:
                scope = {'__name__': '__main__', '__builtins__': dict(vars(_builtins))}
                if payload.get('restricted'):
                    def blocked(*args, **kwargs):
                        raise RuntimeError('sorted() é proibido nesta versão')
                    scope['__builtins__']['sorted'] = blocked
                exec(compiled, scope)
                if case:
                    if name not in scope or not callable(scope[name]):
                        raise NameError('A função exigida ' + name + ' não foi definida como uma função chamável.')
                    actual = scope[name](*args)
                    available = True
                    passed = _strict_equal(actual, expected)
                    if not passed:
                        kind = 'type' if type(actual) is not type(expected) else 'value'
                        difference = _difference(actual, expected)
                    if payload.get('newMatrix') and (args != original_args or actual is args[0]):
                        passed = False
                        kind = 'mutation'
                        difference = {'path': 'entrada / identidade da matriz', 'expected': _repr(original_args), 'actual': _repr(args), 'reason': 'É necessário retornar uma nova matriz e preservar a entrada; igualdade dos valores não basta.'}
                    if stdout.getvalue() or stderr.getvalue():
                        passed = False
                        kind = kind or 'side_effect'
            except BaseException:
                error = _traceback.format_exc()
                kind = 'runtime'
        if not case:
            return {'results': [], 'stdout': stdout.getvalue(), 'stderr': stderr.getvalue(), 'error': error, 'errorType': kind, 'durationMs': (_time.perf_counter() - started) * 1000}
        result = {'id': case.get('meta', {}).get('id'), 'input': case['input'], 'expected': _repr(expected), 'expectedType': type(expected).__name__, 'actual': _repr(actual) if available else '', 'actualType': type(actual).__name__ if available else None, 'actualAvailable': available, 'passed': passed, 'status': 'error' if error else 'passed' if passed else 'failed', 'hidden': case.get('hidden', False), 'error': error, 'errorType': kind, 'difference': difference, 'stdout': stdout.getvalue(), 'stderr': stderr.getvalue(), 'durationMs': (_time.perf_counter() - case_started) * 1000, 'metadata': case.get('meta')}
        results.append(result)
        if callable(globals().get('_emit_case')):
            _emit_case(_json.dumps(result, ensure_ascii=False))
    return {'results': results, 'checks': checks, 'planned': len(payload['tests']), 'durationMs': (_time.perf_counter() - started) * 1000}


def _variable(value):
    result = {'type': type(value).__name__, 'repr': _repr(value)[:2500]}
    try:
        plain = _json.loads(_json.dumps(value, ensure_ascii=False))
        if len(_json.dumps(plain)) <= 12000:
            result['value'] = plain
    except (TypeError, ValueError, OverflowError):
        pass
    return result


def _trace_reference(payload):
    steps = []
    latest_condition = None
    truncated = False
    source = payload['code']
    call_name, args = _arguments({'input': payload['input']})
    tree = _ast.parse(source)

    class Conditions(_ast.NodeTransformer):
        def wrap(self, node):
            self.generic_visit(node)
            test = node.test
            node.test = _ast.copy_location(_ast.Call(func=_ast.Name(id='_condition', ctx=_ast.Load()), args=[_ast.Constant(value=node.lineno), _ast.Constant(value=_ast.unparse(test)), test], keywords=[]), test)
            return node
        visit_If = wrap
        visit_While = wrap
        visit_IfExp = wrap

    tree = _ast.fix_missing_locations(Conditions().visit(tree))
    def condition(line, expression, value):
        nonlocal latest_condition
        latest_condition = {'line': line, 'expression': expression, 'result': bool(value)}
        return value
    def trace(frame, event, arg):
        nonlocal truncated
        if frame.f_code.co_filename != '<referencia>' or frame.f_code.co_name.startswith('<'):
            return trace
        if event not in ('line', 'return', 'exception'):
            return trace
        if len(steps) >= 800:
            truncated = True
            return trace
        variables = {name: _variable(value) for name, value in frame.f_locals.items() if not name.startswith('_') and not callable(value)}
        step = {'index': len(steps), 'line': frame.f_lineno, 'event': event, 'function': frame.f_code.co_name, 'variables': variables}
        if latest_condition:
            step['condition'] = dict(latest_condition)
        if event == 'return':
            step['returnValue'] = _variable(arg)
        steps.append(step)
        return trace
    scope = {'__name__': '__reference__', '__builtins__': dict(vars(_builtins)), '_condition': condition}
    exec(compile(tree, '<referencia>', 'exec'), scope)
    try:
        _sys.settrace(trace)
        result = scope[call_name](*args)
    finally:
        _sys.settrace(None)
    return {'results': [], 'trace': {'steps': steps, 'input': payload['input'], 'output': _variable(result), 'truncated': truncated, 'source': source}}


def _run(payload):
    try:
        return _trace_reference(payload) if payload.get('action') == 'trace' else _grade(payload)
    except BaseException:
        return {'results': [], 'errorType': 'internal', 'error': 'Falha interna do avaliador: ' + _traceback.format_exc()}


_json.dumps(_run(_json.loads(_payload)), ensure_ascii=False)
