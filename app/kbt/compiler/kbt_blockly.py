"""Translate a validated KBT AST into Blockly XML for the audited KidBright IDE.

This module emits workspace XML. The browser-hosted KidBright IDE must load the
XML into its own Blockly workspace and invoke its existing JavaScript generators.
It does not run Blockly generators or build firmware by itself.
"""
from __future__ import annotations
from dataclasses import dataclass, field
import html, json, re
from typing import Any
from kbt_parser import *
from kbt_semantic import expr_path, call_key
from kbt_plugins import PLUGIN_APIS, PLUGIN_EVENTS, bind_plugin_arguments

class BlocklyTranslationError(Exception):
    def __init__(self, code: str, message: str, span: Span):
        super().__init__(message); self.code=code; self.message=message; self.span=span
    def render(self, filename): return f"{filename}:{self.span.line}:{self.span.column}: error {self.code}: {self.message}"

@dataclass
class BBlock:
    type: str
    fields: dict[str, tuple[str,str|None]] = field(default_factory=dict)  # value, optional variable id
    values: dict[str, 'BBlock'] = field(default_factory=dict)
    statements: dict[str, 'BBlock | None'] = field(default_factory=dict)
    next: 'BBlock | None' = None
    mutation: dict[str,str] | None = None
    data: str | None = None  # Blockly <data> metadata for stable KBT function identity

class BlocklyTranslator:
    def __init__(self): self.variable_names: dict[str,str]={}; self.block_count=0
    def _escape(self, value: Any) -> str: return html.escape(str(value), quote=False)
    def var_id(self,name):
        if name not in self.variable_names:
            safe=re.sub(r"[^A-Za-z0-9_]","_",name)
            self.variable_names[name]="kbt_var_"+safe
        return self.variable_names[name]
    def block(self, typ, fields=None, values=None, statements=None, mutation=None, data=None):
        return BBlock(typ, fields or {}, values or {}, statements or {}, None, mutation, data)

    def _number_literal(self, expr: Number) -> str:
        raw = getattr(expr, "raw", "") or str(expr.value)
        raw = raw.replace("_", "")
        # Python-style octal is not a C++ literal; normalize it to decimal.
        if raw.lower().startswith("0o"):
            return str(int(raw, 0))
        return raw

    def _plugin_block(self, call: Call, spec: dict) -> BBlock:
        bound, errors = bind_plugin_arguments(call, spec)
        if errors:
            raise BlocklyTranslationError("KBT-PLUGIN-002", "; ".join(errors), call.span)
        fields = {}
        for arg_name, field_name in spec.get("fields", {}).items():
            value = bound[arg_name]
            if isinstance(value, Boolean):
                # Existing KidBright plugin dropdowns use numeric strings (0/1),
                # not Blockly boolean field literals.
                field_value = "1" if value.value else "0"
            elif isinstance(value, Number):
                field_value = self._number_literal(value)
            elif isinstance(value, String):
                field_value = value.value
            else:
                field_value = str(value)
            fields[field_name] = (field_value, None)
        values = {}
        for arg_name, input_name in spec.get("value_inputs", {}).items():
            value = bound[arg_name]
            if isinstance(value, Node):
                values[input_name] = self.value_expr(value)
            elif isinstance(value, bool):
                values[input_name] = self.block("logic_boolean", {"BOOL": ("TRUE" if value else "FALSE", None)})
            elif isinstance(value, (int, float)):
                values[input_name] = self.block("kbt_number", {"VALUE": (str(value), None)})
            elif isinstance(value, str):
                values[input_name] = self.block("basic_string", {"VALUE": (value, None)})
            else:
                raise BlocklyTranslationError("KBT-PLUGIN-003", "Unsupported plugin argument value.", call.span)
        return self.block(spec["block"], fields=fields, values=values)

    def value_expr(self, expr: Node) -> BBlock:
        if isinstance(expr,Number): return self.block("kbt_number",{"VALUE":(self._number_literal(expr),None)})
        if isinstance(expr,String): return self.block("basic_string",{"VALUE":(expr.value,None)})
        if isinstance(expr,Boolean): return self.block("logic_boolean",{"BOOL":("TRUE" if expr.value else "FALSE",None)})
        if isinstance(expr,Name): return self.block("math_variables_get",{"VAR":(expr.value,self.var_id(expr.value))})
        if isinstance(expr,Unary):
            if expr.operator=="not":
                # This legacy KidBright Blockly bundle has no logic_negate block.
                # Express boolean NOT as an equality comparison with FALSE using
                # the original, bundled logic_compare + logic_boolean blocks.
                return self.block("logic_compare", fields={"OP": ("EQ", None)}, values={
                    "A": self.value_expr(expr.operand),
                    "B": self.block("logic_boolean", {"BOOL": ("FALSE", None)})
                })
            if expr.operator=="-": return self.block("math_single",fields={"OP":("NEG",None)},values={"NUM":self.value_expr(expr.operand)})
        if isinstance(expr,Binary):
            if expr.operator in ("and","or"):
                op="AND" if expr.operator=="and" else "OR"
                return self.block("logic_operation",fields={"OP":(op,None)},values={"A":self.value_expr(expr.left),"B":self.value_expr(expr.right)})
            op={"+":"ADD","-":"MINUS","*":"MULTIPLY","/":"DIVIDE","%":"MODULO"}[expr.operator]
            return self.block("math_arithmetic",fields={"OP":(op,None)},values={"A":self.value_expr(expr.left),"B":self.value_expr(expr.right)})
        if isinstance(expr,Compare):
            op={"==":"EQ","!=":"NEQ","<":"LT","<=":"LTE",">":"GT",">=":"GTE"}[expr.operator]
            return self.block("logic_compare",fields={"OP":(op,None)},values={"A":self.value_expr(expr.left),"B":self.value_expr(expr.right)})
        if isinstance(expr,Attribute):
            path=expr_path(expr)
            prop={
                "clock.year":"rtc_get_year","clock.month":"rtc_get_month","clock.day":"rtc_get_day",
                "clock.day_of_week":"rtc_get_day_of_week","clock.hour":"rtc_get_hour","clock.minute":"rtc_get_minute",
                "clock.second":"rtc_get_second"
            }
            if path in prop: return self.block(prop[path])
            raise BlocklyTranslationError("KBT-BLOCK-001",f"No Blockly expression adapter for '{path}'.",expr.span)
        if isinstance(expr,Call):
            key=call_key(expr)
            plugin_spec = PLUGIN_APIS.get(key)
            if plugin_spec and plugin_spec.get("kind") == "expression":
                return self._plugin_block(expr, plugin_spec)
            if key=="sensors.temperature_c": return self.block("sensor_lm73")
            if key=="sensors.light_percent": return self.block("sensor_ldr")
            if key=="buttons.one.is_pressed": return self.block("logic_sw1_pressed")
            if key=="buttons.one.is_released": return self.block("logic_sw1_released")
            if key=="buttons.two.is_pressed": return self.block("logic_sw2_pressed")
            if key=="buttons.two.is_released": return self.block("logic_sw2_released")
            if key=="display.is_idle": return self.block("logic_led16x8_scroll_ready")
            if key=="clock.datetime": return self.block("rtc_get")
            if key=="clock.date": return self.block("rtc_get_date")
            if key=="clock.time": return self.block("rtc_get_time")
            if key=="music.get_volume": return self.block("music_get_volume")
            if key=="text.with_number":
                prefix = expr.args[0]
                if not isinstance(prefix, String):
                    raise BlocklyTranslationError("KBT-BLOCK-007", "text.with_number() requires a string-literal prefix.", prefix.span)
                return self.block("string_with_number", fields={"TEXT": (prefix.value, None)},
                                  values={"NAME": self.value_expr(expr.args[1])})
            if key=="text.join":
                args = expr.args
                if len(args) < 2:
                    raise BlocklyTranslationError("KBT-BLOCK-008", "text.join() requires at least two values.", expr.span)
                return self.block("string_join", values={f"ADD{i}": self.value_expr(arg) for i, arg in enumerate(args)},
                                  mutation={"items": str(len(args))})
            if key in ("io.output().read", "io.input().read"):
                # The port selector is the nested call in the method receiver:
                # io.output(1).read() -> Attribute(value=Call(...), attribute="read").
                port_call = expr.function.value if isinstance(expr.function, Attribute) else None
                if not isinstance(port_call, Call) or len(port_call.args) != 1 or not isinstance(port_call.args[0], Number):
                    raise BlocklyTranslationError("KBT-BLOCK-009", "I/O read requires a literal port selector.", expr.span)
                port = str(int(port_call.args[0].value))
                if key == "io.output().read":
                    return self.block("output_read", fields={"OUTPUT": (port, None)})
                return self.block("input_read", fields={"INPUT": (port, None)})
            if key=="io.usb_power.read": return self.block("usbsw_read")
            if key=="pow": return self.block("math_pow",values={"NUM1":self.value_expr(expr.args[0]),"NUM2":self.value_expr(expr.args[1])})
            if key in ("round", "ceil", "floor"):
                op = {"round": "ROUND", "ceil": "ROUNDUP", "floor": "ROUNDDOWN"}[key]
                return self.block("math_round", fields={"OP": (op, None)}, values={"NUM": self.value_expr(expr.args[0])})
            number_property = {"is_even": "EVEN", "is_odd": "ODD", "is_prime": "PRIME", "is_positive": "POSITIVE", "is_negative": "NEGATIVE"}
            if key in number_property:
                return self.block("math_number_property", fields={"PROPERTY": (number_property[key], None)}, values={"NUMBER_TO_CHECK": self.value_expr(expr.args[0])})
            if key in ("radians", "degrees"):
                op = "DE_TO_RA" if key == "radians" else "RA_TO_DE"
                return self.block("convert_ra_de", fields={"OP": (op, None)}, values={"NUM": self.value_expr(expr.args[0])})
            if key == "text.length": return self.block("string_length", values={"NAME": self.value_expr(expr.args[0])})
            if key == "text.char_at": return self.block("string_charAt", values={"input": self.value_expr(expr.args[0]), "index": self.value_expr(expr.args[1])})
            if key == "text.substring": return self.block("string_substring", values={"input": self.value_expr(expr.args[0]), "from": self.value_expr(expr.args[1]), "to": self.value_expr(expr.args[2])})
            if key == "text.compare": return self.block("string_compare", values={"TEXT1": self.value_expr(expr.args[0]), "TEXT2": self.value_expr(expr.args[1])})
            single={"abs":"ABS","sqrt":"ROOT","log":"LN","log10":"LOG10","exp":"EXP","pow10":"POW10"}
            trig={"sin_deg":"SIN","cos_deg":"COS","tan_deg":"TAN","asin_deg":"ASIN","acos_deg":"ACOS","atan_deg":"ATAN"}
            if key in single: return self.block("math_single",fields={"OP":(single[key],None)},values={"NUM":self.value_expr(expr.args[0])})
            if key in trig: return self.block("math_trig",fields={"OP":(trig[key],None)},values={"NUM":self.value_expr(expr.args[0])})
            if isinstance(expr.function,Name) and expr.function.value in ("show_status",):
                raise BlocklyTranslationError("KBT-BLOCK-002","User function calls are translated as statements, not expressions.",expr.span)
            raise BlocklyTranslationError("KBT-BLOCK-001",f"No Blockly expression adapter for '{key}'.",expr.span)
        if isinstance(expr,ListLiteral):
            raise BlocklyTranslationError("KBT-BLOCK-003","List literal is only supported inside display.bitmap().",expr.span)
        raise BlocklyTranslationError("KBT-BLOCK-001",f"Unsupported expression node {type(expr).__name__}.",expr.span)

    def call_statement(self, call: Call) -> BBlock:
        key=call_key(call)
        plugin_spec = PLUGIN_APIS.get(key)
        if plugin_spec and plugin_spec.get("kind") == "statement":
            return self._plugin_block(call, plugin_spec)
        if key=="display.clear": return self.block("basic_led16x8_clr")
        if key=="display.show_2chars": return self.block("basic_led16x8_2chars",values={"VALUE":self.value_expr(call.args[0])})
        if key=="display.scroll": return self.block("basic_led16x8_scroll",values={"VALUE":self.value_expr(call.args[0])})
        if key=="display.scroll_if_idle": return self.block("basic_led16x8_scroll_when_ready",values={"VALUE":self.value_expr(call.args[0])})
        if key=="display.wait_ready": return self.block("wait_led_matrix_ready")
        if key=="wait_seconds": return self.block("basic_delay",fields={"VALUE":(str(call.args[0].value),None)})
        waits={"buttons.one.wait_pressed":"wait_sw1_pressed","buttons.one.wait_released":"wait_sw1_released",
               "buttons.two.wait_pressed":"wait_sw2_pressed","buttons.two.wait_released":"wait_sw2_released"}
        if key in waits: return self.block(waits[key])
        if key=="display.bitmap":
            rows=[x.value for x in call.args[0].items]
            fields={}
            # KBT rows are top-to-bottom; the KidBright block's visual field rows are Y7 down to Y0.
            for row_index,row in enumerate(rows):
                y=7-row_index
                for x,ch in enumerate(row): fields[f"POS_X{x}_Y{y}"]=("TRUE" if ch=="#" else "FALSE",None)
            return self.block("basic_led16x8",fields=fields)
        if key=="music.play":
            pitch=self.note_value(call.args[0].value); duration=self.duration_value(call.args[1].value)
            return self.block("music_note",fields={"NOTE":(str(pitch),None),"DURATION":(str(duration),None)})
        if key=="music.rest":
            return self.block("music_rest",fields={"DURATION":(str(self.duration_value(call.args[0].value)),None)})
        if key=="music.set_volume": return self.block("music_set_volume",fields={"VALUE":(str(call.args[0].value),None)})
        if key in ("io.output().write","io.output().toggle"):
            port_call=call.function.value
            port=str(int(port_call.args[0].value))
            if key.endswith(".write"): return self.block("output_write",fields={"OUTPUT":(port,None),"STATUS":("1" if call.args[0].value else "0",None)})
            return self.block("output_toggle",fields={"OUTPUT":(port,None)})
        if key=="io.usb_power.write": return self.block("usbsw_write",fields={"STATUS":("1" if call.args[0].value else "0",None)})
        if key=="io.usb_power.toggle": return self.block("usbsw_toggle")
        if isinstance(call.function,Name):
            # The original KidBright Blockly function block may normalize a
            # duplicate name while the workspace is populated. Keep the KBT
            # source-level identity separately so the bridge can bind calls to
            # the actual Blockly name after import.
            metadata = json.dumps({"kbt": "function", "kind": "call", "name": call.function.value}, ensure_ascii=False, separators=(",", ":"))
            return self.block("call_function", fields={"NAME":(call.function.value,None)}, data=metadata)
        raise BlocklyTranslationError("KBT-BLOCK-004",f"No Blockly statement adapter for '{key}'.",call.span)

    @staticmethod
    def note_value(note: str) -> int:
        m=re.fullmatch(r"([A-G])([#b]?)([4-7])",note)
        if not m: raise ValueError(f"Invalid music note {note}")
        base={"C":0,"D":2,"E":4,"F":5,"G":7,"A":9,"B":11}[m.group(1)]
        accidental={"#":1,"b":-1,"":0}[m.group(2)]
        return (int(m.group(3))-4)*12+base+accidental
    @staticmethod
    def duration_value(duration: str) -> int:
        return {"whole":0,"half":1,"quarter":2,"eighth":3,"sixteenth":4}[duration]

    def statement(self, node: Node) -> BBlock:
        if isinstance(node,Assign):
            return self.block("math_variables_set",fields={"VAR":(node.name,self.var_id(node.name))},values={"VALUE":self.value_expr(node.value)})
        if isinstance(node,EventHandler):
            event_spec = PLUGIN_EVENTS.get(node.event)
            if not event_spec:
                raise BlocklyTranslationError("KBT-PLUGIN-004", f"No Blockly event adapter for '{node.event}'.", node.span)
            return self.block(event_spec["block"], statements={event_spec["statement_input"]: self.chain(node.body)})
        if isinstance(node,ExprStmt): return self.call_statement(node.value)
        if isinstance(node,Break): return self.block("loop_break")
        if isinstance(node,Continue): return self.block("loop_continue")
        if isinstance(node,Pass): raise BlocklyTranslationError("KBT-BLOCK-005","pass has no KidBright block equivalent; omit empty suites before translation.",node.span)
        if isinstance(node,If):
            first_cond,first_body=node.branches[0]
            fields={}; values={}; statements={}
            for i,(cond,body) in enumerate(node.branches):
                values[f"IF{i}"]=self.value_expr(cond); statements[f"DO{i}"]=self.chain(body)
            if node.otherwise: statements["ELSE"]=self.chain(node.otherwise)
            mutation={"elseif":str(max(0,len(node.branches)-1)),"else":"1" if node.otherwise else "0"}
            return self.block("controls_if",fields,values,statements,mutation)
        if isinstance(node,While):
            if node.mode=="forever": return self.block("basic_forever",statements={"HANDLER":self.chain(node.body)})
            return self.block("controls_whileUntil",fields={"MODE":("UNTIL" if node.mode=="until" else "WHILE",None)},values={"BOOL":self.value_expr(node.condition)},statements={"DO":self.chain(node.body)})
        if isinstance(node,Function):
            metadata = json.dumps({"kbt": "function", "kind": "definition", "name": node.name}, ensure_ascii=False, separators=(",", ":"))
            return self.block("function", fields={"NAME":(node.name,None)},
                              statements={"CODE":self.chain(node.body)}, data=metadata)
        if isinstance(node,Task): return self.block("advance_task",fields={"NAME":(node.name,None)},statements={"STACK":self.chain(node.body)})
        raise BlocklyTranslationError("KBT-BLOCK-006",f"No statement adapter for {type(node).__name__}.",node.span)

    def chain(self, body: list[Node]) -> BBlock | None:
        first=None; prev=None
        for stmt in body:
            current=self.statement(stmt)
            if first is None: first=current
            if prev is not None: prev.next=current
            prev=current
        return first

    def _field_xml(self,name,value,variable_id=None,level=0):
        attrs=f' name="{self._escape(name)}"'
        if variable_id: attrs+=f' id="{self._escape(variable_id)}"'
        return "  "*level+f"<field{attrs}>{self._escape(value)}</field>\n"
    def _block_xml(self,b:BBlock,level=0):
        pad="  "*level; out=[pad+f'<block type="{self._escape(b.type)}">\n']
        if b.mutation is not None:
            attrs=" ".join(f'{k}="{self._escape(v)}"' for k,v in b.mutation.items())
            out.append("  "*(level+1)+f"<mutation {attrs}/>\n")
        if b.data is not None:
            out.append("  "*(level+1)+f"<data>{self._escape(b.data)}</data>\n")
        for name,(value,varid) in b.fields.items(): out.append(self._field_xml(name,value,varid,level+1))
        for name,child in b.values.items():
            out.append("  "*(level+1)+f'<value name="{self._escape(name)}">\n')
            if child: out.extend(self._block_xml(child,level+2))
            out.append("  "*(level+1)+"</value>\n")
        for name,child in b.statements.items():
            out.append("  "*(level+1)+f'<statement name="{self._escape(name)}">\n')
            if child: out.extend(self._block_xml(child,level+2))
            out.append("  "*(level+1)+"</statement>\n")
        if b.next:
            out.append("  "*(level+1)+"<next>\n"); out.extend(self._block_xml(b.next,level+2)); out.append("  "*(level+1)+"</next>\n")
        out.append(pad+"</block>\n")
        return out

    def translate(self, program: Program) -> str:
        # Emit function/task declarations before the main statement chain.
        # KidBright's call_function block builds its dropdown from the live workspace
        # while the XML is imported, so declarations must exist before call blocks.
        declarations=[n for n in program.body if isinstance(n,(Function,Task))]
        main=[n for n in program.body if not isinstance(n,(Function,Task))]
        root=['<xml xmlns="https://developers.google.com/blockly/xml">\n']
        blocks=[self.statement(n) for n in declarations]
        main_chain=self.chain(main)
        if main_chain: blocks.append(main_chain)
        if self.variable_names:
            root.append("  <variables>\n")
            for name,varid in self.variable_names.items():
                root.append(f'    <variable type="" id="{self._escape(varid)}">{self._escape(name)}</variable>\n')
            root.append("  </variables>\n")
        for b in blocks: root.extend(self._block_xml(b,1))
        root.append("</xml>\n")
        return "".join(root)


def translate(program: Program) -> str:
    return BlocklyTranslator().translate(program)
