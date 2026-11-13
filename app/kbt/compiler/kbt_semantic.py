"""Semantic validation for the Stage 3 KBT parser."""
from __future__ import annotations
import csv, re
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from kbt_parser import *
from kbt_plugins import PLUGIN_APIS, PLUGIN_EVENTS, bind_plugin_arguments

@dataclass
class Diagnostic:
    code: str
    message: str
    span: Span
    severity: str = "error"
    def render(self, filename: str) -> str:
        return f"{filename}:{self.span.line}:{self.span.column}: {self.severity} {self.code}: {self.message}"

@dataclass
class Api:
    signature: str
    return_type: str
    status: str
    constraints: str
    source_block_ids: str


def api_key(signature: str) -> str:
    # Remove all formal parameter lists while retaining the chained call marker.
    key=re.sub(r"\([^()]*\)", "()", signature)
    return key[:-2] if key.endswith("()") else key


def expr_path(node: Node | None) -> str | None:
    if isinstance(node, Name): return node.value
    if isinstance(node, Attribute):
        left=expr_path(node.value)
        return f"{left}.{node.attribute}" if left else None
    if isinstance(node, Call):
        left=expr_path(node.function)
        return f"{left}()" if left else None
    return None


def call_key(node: Call) -> str:
    path=expr_path(node.function) or ""
    # Collapse a numeric port argument to the registry's symbolic port signature.
    path=re.sub(r"\.(input|output)\(\)", r".\1()", path)
    return path

class SemanticChecker:
    ROOTS={"display","sensors","buttons","clock","music","io","text","math","devices","netpie","kbiot","plugins"}
    RESERVED=ROOTS | {"true","false","if","elif","else","while","until","forever","def","task","break","continue","pass","on","and","or","not"}
    def __init__(self, registry: Path, profile: str="core"):
        self.registry_path=registry; self.profile=profile
        self.apis: dict[str,Api]={}; self.properties: dict[str,Api]={}
        with registry.open(encoding="utf-8-sig",newline="") as f:
            for row in csv.DictReader(f):
                sig=row["signature"].strip(); status=row["status"].strip()
                api=Api(sig,row["return_type"].strip(),status,row.get("constraints","").strip(),row.get("source_block_ids","").strip())
                key=api_key(sig)
                if "(" in sig: self.apis[key]=api
                else: self.properties[sig]=api
        self.errors: list[Diagnostic]=[]; self.warnings: list[Diagnostic]=[]
        self.variables: dict[str,str]={}; self.functions: set[str]=set(); self.tasks: set[str]=set(); self.loop_depth=0; self.in_task=False

    def err(self, code, msg, node, severity="error"):
        d=Diagnostic(code,msg,node.span,severity)
        (self.errors if severity=="error" else self.warnings).append(d)

    def check(self, program: Program):
        for n in program.body:
            if isinstance(n,Function):
                if n.name in self.RESERVED or n.name.startswith("__kbt_"):
                    self.err("KBT-NAME-001",f"'{n.name}' is reserved and cannot be used as a function name.",n)
                if n.name in self.functions or n.name in self.tasks:
                    self.err("KBT-NAME-002",f"Duplicate function/task name '{n.name}'.",n)
                self.functions.add(n.name)
            if isinstance(n,Task):
                if n.name in self.RESERVED or n.name.startswith("__kbt_"):
                    self.err("KBT-NAME-001",f"'{n.name}' is reserved and cannot be used as a task name.",n)
                if n.name in self.functions or n.name in self.tasks:
                    self.err("KBT-NAME-002",f"Duplicate function/task name '{n.name}'.",n)
                self.tasks.add(n.name)
        if self.profile=="core" and any(isinstance(n,(Function,Task)) for n in program.body):
            self.err("KBT-PROFILE-001","Function and task declarations require --profile advanced.",next(n for n in program.body if isinstance(n,(Function,Task))))
        if any(isinstance(n,Task) for n in program.body):
            for n in program.body:
                if isinstance(n,While) and ((n.mode=="forever") or (n.mode=="while" and isinstance(n.condition,Boolean) and n.condition.value) or (n.mode=="until" and isinstance(n.condition,Boolean) and not n.condition.value)):
                    self.err("KBT-RUN-001","A top-level infinite loop prevents tasks from being initialized. Put the loop inside a task.",n)
                    break
        self._check_declarations_top_level(program.body, True)
        self._check_statements(program.body)
        return self


    def _check_declarations_top_level(self, body: list[Node], top_level: bool):
        for n in body:
            if isinstance(n,(Function,Task)) and not top_level:
                self.err("KBT-FLOW-003","Function and task declarations must be at the top level.",n)
            if isinstance(n,EventHandler) and not top_level:
                self.err("KBT-FLOW-006","Plugin event handlers must be declared at the top level.",n)
            if isinstance(n,If):
                for _, branch in n.branches: self._check_declarations_top_level(branch,False)
                self._check_declarations_top_level(n.otherwise,False)
            elif isinstance(n,While): self._check_declarations_top_level(n.body,False)
            elif isinstance(n,(Function,Task,EventHandler)): self._check_declarations_top_level(n.body,False)

    def _check_statements(self, body: list[Node]):
        for n in body:
            if isinstance(n,Assign):
                if n.name in self.RESERVED or n.name.startswith("__kbt_"):
                    self.err("KBT-NAME-001",f"'{n.name}' is reserved and cannot be assigned.",n); continue
                typ=self._expr(n.value)
                if typ=="text":
                    self.err("KBT-TYPE-001","Mutable text variables are not supported in KBT 0.1; pass text literals or text expressions directly to an API.",n)
                elif typ=="boolean":
                    self.err("KBT-TYPE-010","KBT 0.1 variables are numeric only because the audited KidBright variable blocks accept Number values. Use boolean sensor expressions directly in if/while conditions.",n)
                prior=self.variables.get(n.name)
                if prior and typ not in ("unknown",prior):
                    self.err("KBT-TYPE-002",f"Variable '{n.name}' was inferred as {prior}, but this assignment has type {typ}.",n)
                elif typ!="unknown": self.variables[n.name]=typ
            elif isinstance(n,ExprStmt): self._expr(n.value)
            elif isinstance(n,If):
                for cond, branch in n.branches:
                    typ=self._expr(cond)
                    if typ not in ("boolean","unknown"): self.err("KBT-TYPE-003","if/elif condition must be boolean.",cond)
                    self._check_statements(branch)
                self._check_statements(n.otherwise)
            elif isinstance(n,While):
                if n.mode!="forever":
                    typ=self._expr(n.condition)
                    if typ not in ("boolean","unknown"): self.err("KBT-TYPE-003","while/until condition must be boolean.",n.condition)
                self.loop_depth+=1; self._check_statements(n.body); self.loop_depth-=1
            elif isinstance(n,(Function,Task)):
                prev=self.in_task; self.in_task=isinstance(n,Task)
                self._check_statements(n.body); self.in_task=prev
            elif isinstance(n,EventHandler):
                if self.profile != "plugins":
                    self.err("KBT-EXT-002", "Plugin event handlers require --profile plugins.", n)
                if n.event not in PLUGIN_EVENTS:
                    self.err("KBT-EXT-003", f"Unsupported plugin event '{n.event}'.", n)
                self._check_statements(n.body)
            elif isinstance(n,(Break,Continue)):
                if self.loop_depth==0: self.err("KBT-FLOW-001",f"{type(n).__name__.lower()} must be inside a loop.",n)
            elif isinstance(n,Pass): pass
            else: self.err("KBT-PARSE-010",f"Unsupported statement node {type(n).__name__}.",n)

    def _expr(self,node: Node | None) -> str:
        if node is None: return "unknown"
        if isinstance(node,Number): return "number"
        if isinstance(node,String):
            if any(c in node.value for c in ('"','\\','\n','\r','\x00')):
                self.err("KBT-STRING-001","KBT Stage 3 alpha string literals cannot contain double quotes, backslashes or control characters because the existing C++ generator does not escape them safely.",node)
            return "text"
        if isinstance(node,Boolean): return "boolean"
        if isinstance(node,Name):
            if node.value in self.variables: return self.variables[node.value]
            if node.value in self.functions: return "function"
            if node.value in self.tasks: return "task"
            self.err("KBT-NAME-003",f"Name '{node.value}' is used before assignment or declaration.",node); return "unknown"
        if isinstance(node,Attribute):
            path=expr_path(node)
            if path in self.properties:
                api=self.properties[path]
                if api.status=="needs-patch": self.err("KBT-API-003",f"'{path}' is disabled until its source generator is fixed.",node)
                return api.return_type
            root=(path or "").split(".")[0]
            if root not in self.ROOTS and root not in self.variables:
                self.err("KBT-API-004",f"Unknown namespace or variable '{root}'.",node)
            else:
                self.err("KBT-API-005",f"'{path}' is not a registered KBT property.",node)
            return "unknown"
        if isinstance(node,ListLiteral):
            for x in node.items: self._expr(x)
            return "list"
        if isinstance(node,Unary):
            typ=self._expr(node.operand)
            expected="boolean" if node.operator=="not" else "number"
            if typ not in (expected,"unknown"): self.err("KBT-TYPE-004",f"Unary '{node.operator}' requires {expected}, got {typ}.",node)
            return expected
        if isinstance(node,Binary):
            left=self._expr(node.left); right=self._expr(node.right)
            expected="boolean" if node.operator in ("and","or") else "number"
            if node.operator in ("and","or"):
                if left not in ("boolean","unknown") or right not in ("boolean","unknown"):
                    self.err("KBT-TYPE-005",f"'{node.operator}' requires boolean operands.",node)
            elif left not in ("number","unknown") or right not in ("number","unknown"):
                self.err("KBT-TYPE-006",f"Arithmetic '{node.operator}' requires numeric operands.",node)
            if node.operator in ("/","%") and isinstance(node.right,Number) and node.right.value==0:
                self.err("KBT-MATH-001","Division or modulo by zero.",node)
            return expected
        if isinstance(node,Compare):
            left=self._expr(node.left); right=self._expr(node.right)
            if left!=right and "unknown" not in (left,right):
                self.err("KBT-TYPE-007",f"Comparison operands must have matching types, got {left} and {right}.",node)
            if left not in ("number","text","boolean","unknown"):
                self.err("KBT-TYPE-008",f"Values of type {left} cannot be compared.",node)
            return "boolean"
        if isinstance(node,Call): return self._call(node)
        self.err("KBT-PARSE-011",f"Unsupported expression node {type(node).__name__}.",node)
        return "unknown"

    def _literal(self,node):
        if isinstance(node,(String,Number,Boolean)): return node.value
        return None

    def _check_plugin_call(self, node: Call, key: str, spec: dict) -> str:
        if self.profile != "plugins":
            self.err("KBT-EXT-001", f"'{key}' requires --profile plugins and the corresponding KidBright plugin to be installed.", node)
        bound, bind_errors = bind_plugin_arguments(node, spec)
        for message in bind_errors:
            self.err("KBT-PLUGIN-001", f"{key}: {message}.", node)
        for name, value in bound.items():
            if isinstance(value, Node):
                actual = self._expr(value)
                expected = spec.get("types", {}).get(name)
                if expected and actual not in tuple(expected) + ("unknown",):
                    self.err("KBT-PLUGIN-005", f"{key} argument '{name}' must be {' or '.join(expected)}, not {actual}.", value)
                literal = self._literal(value)
            else:
                literal = value
            if name in spec.get("ranges", {}) and literal is not None:
                low, high = spec["ranges"][name]
                try: ok = low <= float(literal) <= high and float(literal).is_integer() if name in ("channel", "column", "row", "precision", "ain") else low <= float(literal) <= high
                except (TypeError, ValueError): ok = False
                if not ok:
                    self.err("KBT-PLUGIN-006", f"{key} argument '{name}' must be between {low} and {high}.", value if isinstance(value, Node) else node)
            if name in spec.get("choices", {}) and literal is not None:
                try: valid = int(literal) in spec["choices"][name] and float(literal).is_integer()
                except (TypeError, ValueError): valid = False
                if not valid:
                    self.err("KBT-PLUGIN-007", f"{key} argument '{name}' must be one of {spec['choices'][name]}.", value if isinstance(value, Node) else node)
        return spec["return_type"]

    def _call(self,node: Call) -> str:
        key=call_key(node)
        plugin_spec = PLUGIN_APIS.get(key)
        if plugin_spec:
            return self._check_plugin_call(node, key, plugin_spec)
        if node.keywords and self.profile=="core":
            self.err("KBT-API-002","Keyword arguments are not supported in KBT Core 0.1.",node)
        if isinstance(node.function,Name) and node.function.value in self.tasks:
            self.err("KBT-FLOW-005",f"Task '{node.function.value}' is started by the KidBright runtime and cannot be called like a function.",node)
            return "none"
        if isinstance(node.function,Name) and node.function.value in self.functions:
            if node.args or node.keywords: self.err("KBT-FLOW-002","User-defined KBT functions take no arguments.",node)
            return "none"
        api=self.apis.get(key)
        if not api:
            # Walk nested call arguments before reporting the unresolved API.
            for arg in node.args: self._expr(arg)
            if key.startswith(("netpie.","kbiot.","devices.","plugins.")):
                self.err("KBT-EXT-001",f"'{key}' is not included in the current Stage 5 plugin adapter set.",node)
            else:
                self.err("KBT-API-001",f"Unknown or unsupported KBT API '{key}'.",node)
            return "unknown"
        if api.status=="advanced-conditional" and self.profile not in ("advanced", "plugins"):
            self.err("KBT-API-006",f"'{key}' requires --profile advanced or plugins.",node)
        if api.status=="needs-patch":
            self.err("KBT-API-003",f"'{key}' is disabled until its source generator is fixed.",node)
        if api.status in ("plugin-only","extension-preview"):
            self.err("KBT-EXT-001",f"'{key}' is a plugin/preview API and has no KBT adapter yet.",node)
        # Verify the final method's positional arity against its registered signature.
        # Port APIs such as io.output(port).write(state) have one nested port argument
        # plus the ordinary method arguments; both are checked explicitly.
        params_match=re.search(r"\(([^()]*)\)$",api.signature)
        if params_match:
            params=params_match.group(1).strip()
            if params:
                names=[x.strip() for x in params.split(",")]
                variadic=any("..." in x for x in names)
                required=sum(1 for x in names if x and "..." not in x)
                if (not variadic and len(node.args)!=required) or (variadic and len(node.args)<required):
                    expectation=f"at least {required}" if variadic else str(required)
                    self.err("KBT-API-007",f"{key} expects {expectation} argument(s), got {len(node.args)}.",node)
            elif node.args:
                self.err("KBT-API-007",f"{key} expects no arguments, got {len(node.args)}.",node)
        arg_types=[self._expr(a) for a in node.args]
        if key in ("display.show_2chars","display.scroll","display.scroll_if_idle"):
            if len(node.args)!=1: self.err("KBT-API-007",f"{key} expects exactly one argument.",node)
            elif arg_types[0] not in ("number","text","unknown"): self.err("KBT-TYPE-009",f"{key} accepts number or text.",node.args[0])
        elif key=="text.with_number":
            if len(node.args)!=2 or not isinstance(node.args[0],String):
                self.err("KBT-TEXT-001", "text.with_number() requires a literal text prefix followed by a numeric value.", node)
            elif arg_types[1] not in ("number", "unknown"):
                self.err("KBT-TEXT-002", "text.with_number() value must be numeric.", node.args[1])
        elif key=="text.join":
            if len(node.args)<2:
                self.err("KBT-TEXT-003", "text.join() requires at least two values.", node)
            for arg, typ in zip(node.args, arg_types):
                if typ not in ("number", "text", "unknown"):
                    self.err("KBT-TEXT-004", "text.join() accepts only text and numeric values in this release.", arg)
        elif key=="display.bitmap":
            if len(node.args)!=1 or not isinstance(node.args[0],ListLiteral):
                self.err("KBT-BITMAP-001","display.bitmap() requires one 8-row list of 16-character strings.",node)
            else:
                rows=node.args[0].items
                if len(rows)!=8 or any(not isinstance(r,String) or len(r.value)!=16 or set(r.value)-set('.#') for r in rows):
                    self.err("KBT-BITMAP-002","Bitmap must contain exactly 8 strings, each 16 characters using only '.' and '#'.",node.args[0])
        elif key=="wait_seconds":
            if len(node.args)!=1 or not isinstance(node.args[0],Number):
                self.err("KBT-TIME-001","wait_seconds() requires a numeric literal in this compiler milestone.",node)
            else:
                seconds=float(node.args[0].value)
                if seconds<0.02 or seconds>86400 or abs(seconds*100-round(seconds*100)) > 1e-7:
                    self.err("KBT-TIME-001","wait_seconds() must be 0.02..86400 seconds in 0.01-second steps.",node)
        elif key in ("music.play",):
            if len(node.args)!=2 or not all(isinstance(x,String) for x in node.args):
                self.err("KBT-MUSIC-001","music.play() requires a note string and duration string literal.",node)
            else:
                if not re.fullmatch(r"[A-G](?:#|b)?[4-7]",node.args[0].value): self.err("KBT-MUSIC-002","Note must be between C4 and C7 using forms such as C4, F#5 or Bb4.",node.args[0])
                if node.args[1].value not in {"whole","half","quarter","eighth","sixteenth"}: self.err("KBT-MUSIC-003","Duration must be whole, half, quarter, eighth or sixteenth.",node.args[1])
        elif key=="music.rest":
            if len(node.args)!=1 or not isinstance(node.args[0],String) or node.args[0].value not in {"whole","half","quarter","eighth","sixteenth"}:
                self.err("KBT-MUSIC-003","music.rest() requires a supported duration string literal.",node)
        elif key=="music.set_volume":
            if len(node.args)!=1 or not isinstance(node.args[0],Number) or not 0<=float(node.args[0].value)<=100:
                self.err("KBT-MUSIC-004","music.set_volume() requires a numeric literal from 0 to 100.",node)
        if key in ("io.input().read", "io.output().write", "io.output().toggle", "io.output().read"):
            port_call=node.function.value if isinstance(node.function,Attribute) else None
            port_args=port_call.args if isinstance(port_call,Call) else []
            if len(port_args)!=1 or not isinstance(port_args[0],Number) or int(port_args[0].value)!=port_args[0].value:
                self.err("KBT-IO-002","I/O port selector must be one integer literal.",port_call or node)
            else:
                port=int(port_args[0].value)
                limit=4 if key.startswith("io.input") else 2
                if port<1 or port>limit:
                    self.err("KBT-IO-002",f"Port must be an integer from 1 to {limit}.",port_call)
        if key in ("io.output().write","io.usb_power.write"):
            # Existing Blockly blocks expose STATUS as dropdown fields, not value inputs.
            if len(node.args)<1 or not isinstance(node.args[-1],Boolean): self.err("KBT-IO-001","This output write must use a literal true or false in the current Blockly adapter.",node)
        if node.keywords:
            for v in node.keywords.values(): self._expr(v)
        return api.return_type


def check_program(program: Program, registry: Path, profile: str="core") -> SemanticChecker:
    checker=SemanticChecker(registry,profile)
    checker.check(program)
    if checker.errors: raise SemanticError(checker.errors[0], checker.errors)
    return checker

class SemanticError(Exception):
    def __init__(self, diagnostic: Diagnostic, all_diagnostics: list[Diagnostic]):
        super().__init__(diagnostic.message); self.diagnostic=diagnostic; self.all_diagnostics=all_diagnostics
