"""A source-position-aware parser for the KBT language subset (Stage 5 alpha).

KBT is Python-inspired, but this parser intentionally accepts only the grammar
specified by the KidBright Text project. It does not execute Python code.
"""
from __future__ import annotations
from dataclasses import dataclass, field
import ast as py_ast
import io
import tokenize
from typing import Any, Iterable

@dataclass(frozen=True)
class Span:
    line: int
    column: int
    end_line: int | None = None
    end_column: int | None = None

@dataclass
class Node:
    span: Span

@dataclass
class Program(Node):
    body: list[Node] = field(default_factory=list)

@dataclass
class Assign(Node):
    name: str = ""
    value: Node | None = None

@dataclass
class ExprStmt(Node):
    value: Node | None = None

@dataclass
class If(Node):
    branches: list[tuple[Node, list[Node]]] = field(default_factory=list)
    otherwise: list[Node] = field(default_factory=list)

@dataclass
class While(Node):
    condition: Node | None = None
    body: list[Node] = field(default_factory=list)
    mode: str = "while"  # while | until | forever

@dataclass
class Function(Node):
    name: str = ""
    body: list[Node] = field(default_factory=list)

@dataclass
class Task(Node):
    name: str = ""
    body: list[Node] = field(default_factory=list)

@dataclass
class EventHandler(Node):
    event: str = ""
    body: list[Node] = field(default_factory=list)

@dataclass
class Break(Node): pass
@dataclass
class Continue(Node): pass
@dataclass
class Pass(Node): pass

@dataclass
class Number(Node):
    value: int | float = 0
    raw: str = ""  # Original literal spelling, retained for exact C++ numeric precision.
@dataclass
class String(Node):
    value: str = ""
@dataclass
class Boolean(Node):
    value: bool = False
@dataclass
class Name(Node):
    value: str = ""
@dataclass
class Attribute(Node):
    value: Node | None = None
    attribute: str = ""
@dataclass
class Call(Node):
    function: Node | None = None
    args: list[Node] = field(default_factory=list)
    keywords: dict[str, Node] = field(default_factory=dict)
@dataclass
class Unary(Node):
    operator: str = ""
    operand: Node | None = None
@dataclass
class Binary(Node):
    operator: str = ""
    left: Node | None = None
    right: Node | None = None
@dataclass
class Compare(Node):
    operator: str = ""
    left: Node | None = None
    right: Node | None = None
@dataclass
class ListLiteral(Node):
    items: list[Node] = field(default_factory=list)

class KBTParseError(Exception):
    def __init__(self, code: str, message: str, span: Span):
        super().__init__(message)
        self.code, self.message, self.span = code, message, span
    def render(self, filename: str) -> str:
        return f"{filename}:{self.span.line}:{self.span.column}: error {self.code}: {self.message}"

@dataclass(frozen=True)
class Tok:
    kind: str
    value: str
    span: Span

class Parser:
    PRECEDENCE = {"or": 1, "and": 2, "==": 3, "!=": 3, "<": 3, "<=": 3, ">": 3, ">=": 3,
                  "+": 4, "-": 4, "*": 5, "/": 5, "%": 5}
    COMPARE = {"==", "!=", "<", "<=", ">", ">="}

    def __init__(self, source: str, filename: str = "<memory>"):
        self.source = source
        self.filename = filename
        self.tokens: list[Tok] = []
        try:
            raw_tokens = tokenize.generate_tokens(io.StringIO(source).readline)
            for t in raw_tokens:
                if t.type in (tokenize.ENCODING, tokenize.NL, tokenize.COMMENT):
                    continue
                self.tokens.append(Tok(tokenize.tok_name[t.type], t.string,
                    Span(t.start[0], t.start[1] + 1, t.end[0], t.end[1] + 1)))
        except (tokenize.TokenError, IndentationError) as exc:
            msg = str(exc.args[0]) if exc.args else "Invalid indentation or token"
            pos = exc.args[1] if len(exc.args) > 1 and isinstance(exc.args[1], tuple) else (1, 0)
            raise KBTParseError("KBT-LEX-001", msg, Span(pos[0], pos[1] + 1)) from exc
        self.i = 0

    def current(self) -> Tok:
        return self.tokens[min(self.i, len(self.tokens)-1)]
    def peek(self, offset: int = 1) -> Tok:
        return self.tokens[min(self.i + offset, len(self.tokens)-1)]
    def at(self, value: str) -> bool: return self.current().value == value
    def kind(self, kind: str) -> bool: return self.current().kind == kind
    def advance(self) -> Tok:
        t = self.current(); self.i += 1; return t
    def accept(self, value: str) -> Tok | None:
        if self.at(value): return self.advance()
        return None
    def expect(self, value: str, code="KBT-PARSE-001") -> Tok:
        if not self.at(value): self.fail(code, f"Expected '{value}', found {self.current().value or self.current().kind}.")
        return self.advance()
    def fail(self, code: str, message: str, tok: Tok | None = None):
        t = tok or self.current(); raise KBTParseError(code, message, t.span)
    def skip_newlines(self):
        while self.kind("NEWLINE"): self.advance()

    def parse(self) -> Program:
        start = self.current().span
        body=[]; self.skip_newlines()
        while not self.kind("ENDMARKER"):
            if self.kind("INDENT"):
                self.fail("KBT-LEX-002", "Unexpected indentation at top level.")
            body.append(self.parse_statement())
            self.skip_newlines()
        return Program(start, body)

    def parse_statement(self) -> Node:
        t=self.current()
        if t.kind == "NAME":
            if t.value == "if": return self.parse_if()
            if t.value in ("while", "until", "forever"): return self.parse_loop()
            if t.value == "def": return self.parse_function()
            if t.value == "task": return self.parse_task()
            if t.value == "on": return self.parse_event_handler()
            if t.value == "break": self.advance(); self.finish_simple(); return Break(t.span)
            if t.value == "continue": self.advance(); self.finish_simple(); return Continue(t.span)
            if t.value == "pass": self.advance(); self.finish_simple(); return Pass(t.span)
            if self.peek().value == "=": return self.parse_assignment()
        expr=self.parse_expression()
        if not isinstance(expr, Call):
            self.fail("KBT-PARSE-002", "Only function-call expressions can be used as standalone statements.", t)
        self.finish_simple()
        return ExprStmt(t.span, expr)

    def finish_simple(self):
        if self.kind("NEWLINE"): self.advance(); return
        if self.kind("ENDMARKER") or self.kind("DEDENT"): return
        self.fail("KBT-PARSE-003", "Expected end of line.")

    def parse_assignment(self) -> Assign:
        name=self.advance(); self.expect("=")
        value=self.parse_expression(); self.finish_simple()
        return Assign(name.span, name.value, value)

    def parse_suite(self) -> list[Node]:
        self.expect(":")
        if not self.kind("NEWLINE"):
            self.fail("KBT-PARSE-004", "A compound statement must be followed by a newline and an indented block.")
        self.advance(); self.skip_newlines()
        if not self.kind("INDENT"):
            self.fail("KBT-PARSE-005", "Expected an indented block after ':' .")
        self.advance(); body=[]; self.skip_newlines()
        while not self.kind("DEDENT") and not self.kind("ENDMARKER"):
            if self.kind("INDENT"):
                self.fail("KBT-LEX-002", "Unexpected extra indentation.")
            body.append(self.parse_statement()); self.skip_newlines()
        if not self.kind("DEDENT"):
            self.fail("KBT-PARSE-006", "Unclosed indented block.")
        self.advance()
        if not body: self.fail("KBT-PARSE-007", "Empty blocks are not allowed; use 'pass' if intentionally empty.")
        return body

    def parse_if(self) -> If:
        start=self.expect("if").span
        branches=[]
        cond=self.parse_expression(); body=self.parse_suite(); branches.append((cond,body))
        while self.kind("NAME") and self.at("elif"):
            self.advance(); cond=self.parse_expression(); body=self.parse_suite(); branches.append((cond,body))
        otherwise=[]
        if self.kind("NAME") and self.at("else"):
            self.advance(); otherwise=self.parse_suite()
        return If(start, branches, otherwise)

    def parse_loop(self) -> While:
        t=self.advance(); mode=t.value
        if mode == "forever": cond=Boolean(t.span, True)
        else: cond=self.parse_expression()
        body=self.parse_suite()
        return While(t.span, cond, body, mode)

    def parse_function(self) -> Function:
        t=self.expect("def"); name=self.expect_name("function name")
        self.expect("("); self.expect(")")
        body=self.parse_suite()
        return Function(t.span, name.value, body)

    def parse_task(self) -> Task:
        t=self.expect("task"); name=self.expect_name("task name")
        body=self.parse_suite()
        return Task(t.span, name.value, body)

    def parse_event_handler(self) -> EventHandler:
        """Parse a dotted plugin event declaration such as on plugins.x.event:."""
        start = self.expect("on").span
        parts = [self.expect_name("event namespace").value]
        while self.accept("."):
            parts.append(self.expect_name("event name component").value)
        if len(parts) < 3:
            self.fail("KBT-PARSE-011", "Plugin events must use a fully qualified name such as 'plugins.bluetooth.ble_uart.data'.")
        event = ".".join(parts)
        body = self.parse_suite()
        return EventHandler(start, event, body)

    def expect_name(self, what: str) -> Tok:
        if not self.kind("NAME"): self.fail("KBT-PARSE-001", f"Expected {what}.")
        return self.advance()

    def parse_expression(self, min_prec: int = 0) -> Node:
        left=self.parse_prefix()
        left=self.parse_postfix(left)
        while True:
            op=self.current().value
            prec=self.PRECEDENCE.get(op, -1)
            if prec < min_prec: break
            tok=self.advance()
            if op in self.COMPARE:
                right=self.parse_expression(prec+1)
                if self.current().value in self.COMPARE:
                    self.fail("KBT-PARSE-008", "Chained comparisons are not supported; combine comparisons with 'and'.")
                left=Compare(tok.span, op, left, right)
            else:
                right=self.parse_expression(prec+1)
                left=Binary(tok.span, op, left, right)
        return left

    def parse_prefix(self) -> Node:
        t=self.current()
        if t.value == "-":
            self.advance(); return Unary(t.span, "-", self.parse_expression(6))
        if t.value == "not":
            self.advance(); return Unary(t.span, "not", self.parse_expression(3))
        if t.value == "(":
            self.advance(); value=self.parse_expression(); self.expect(")"); return value
        if t.value == "[":
            self.advance(); items=[]
            if not self.at("]"):
                while True:
                    items.append(self.parse_expression())
                    if not self.accept(","): break
                    if self.at("]"): break
            self.expect("]")
            return ListLiteral(t.span, items)
        if t.kind == "NUMBER":
            self.advance()
            try: value=float(t.value.replace("_", "")) if any(c in t.value for c in ".eE") else int(t.value.replace("_", ""), 0)
            except ValueError: self.fail("KBT-LEX-003", f"Invalid number literal '{t.value}'.", t)
            return Number(t.span, value, t.value.replace("_", ""))
        if t.kind == "STRING":
            self.advance()
            try: value=py_ast.literal_eval(t.value)
            except Exception: self.fail("KBT-LEX-004", "Invalid string literal.", t)
            if not isinstance(value, str): self.fail("KBT-LEX-004", "Only text string literals are supported.", t)
            return String(t.span, value)
        if t.kind == "NAME":
            self.advance()
            if t.value in ("true", "false"): return Boolean(t.span, t.value == "true")
            if t.value in ("True", "False"):
                self.fail("KBT-LEX-005", "Use lowercase 'true' or 'false' in KBT.", t)
            return Name(t.span, t.value)
        self.fail("KBT-PARSE-009", f"Unexpected token '{t.value or t.kind}' in expression.", t)

    def parse_postfix(self, node: Node) -> Node:
        while True:
            if self.accept("."):
                attr=self.expect_name("attribute name")
                node=Attribute(attr.span, node, attr.value); continue
            if self.accept("("):
                args=[]; kwargs={}
                if not self.at(")"):
                    while True:
                        if self.kind("NAME") and self.peek().value == "=":
                            k=self.advance().value; self.advance(); kwargs[k]=self.parse_expression()
                        else:
                            args.append(self.parse_expression())
                        if not self.accept(","): break
                        if self.at(")"): break
                self.expect(")")
                node=Call(node.span, node, args, kwargs); continue
            break
        return node


def parse_source(source: str, filename: str = "<memory>") -> Program:
    return Parser(source, filename).parse()


def to_dict(node: Any) -> Any:
    if isinstance(node, list): return [to_dict(x) for x in node]
    if isinstance(node, tuple): return [to_dict(x) for x in node]
    if hasattr(node, "__dataclass_fields__"):
        out={"node": type(node).__name__}
        for key, value in vars(node).items():
            out[key]=to_dict(value)
        return out
    return node
