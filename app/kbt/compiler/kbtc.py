#!/usr/bin/env python3
"""KidBright Text compiler front-end alpha: parse, validate and emit Blockly XML."""
from __future__ import annotations
import argparse, json, sys
from pathlib import Path
from kbt_parser import parse_source, to_dict, KBTParseError
from kbt_semantic import SemanticChecker, SemanticError
from kbt_blockly import BlocklyTranslator, BlocklyTranslationError

VERSION="0.5.2-alpha"
ROOT=Path(__file__).resolve().parents[1]
REGISTRY=ROOT/"KBT-API-Registry-v0.5.csv"

class KBTCompileError(Exception): pass

def load_program(path: Path, profile: str):
    source=path.read_text(encoding="utf-8")
    program=parse_source(source,str(path))
    checker=SemanticChecker(REGISTRY,profile).check(program)
    if checker.errors: raise SemanticError(checker.errors[0],checker.errors)
    return source,program,checker

def main(argv=None):
    p=argparse.ArgumentParser(prog="kbtc",description="KidBright Text compiler front-end")
    p.add_argument("command",choices=["version","check","parse","ast","blockly"])
    p.add_argument("source",nargs="?")
    p.add_argument("--profile",choices=["core","advanced","plugins"],default="core")
    p.add_argument("--json",action="store_true",help="pretty-print AST JSON")
    p.add_argument("-o","--output",help="output file for blockly command (default stdout)")
    args=p.parse_args(argv)
    if args.command=="version":
        print(f"kbtc {VERSION}"); return 0
    if not args.source: p.error("source file is required")
    path=Path(args.source)
    try:
        source,program,checker=load_program(path,args.profile)
        if args.command in ("check","parse"):
            top=len(program.body); funcs=sum(type(x).__name__=="Function" for x in program.body); tasks=sum(type(x).__name__=="Task" for x in program.body)
            print(f"OK: {path} ({args.profile} profile)")
            print(f"  top-level statements: {top}; functions: {funcs}; tasks: {tasks}")
            print(f"  variables inferred: {len(checker.variables)}")
            if args.command=="check":
                print("  Note: parsed and semantically validated; firmware build/upload not performed.")
            return 0
        if args.command=="ast":
            obj={"language":"KBT","language_version":"0.1","compiler_version":VERSION,"profile":args.profile,"source":str(path),"ast":to_dict(program)}
            print(json.dumps(obj,indent=2,ensure_ascii=False)); return 0
        if args.command=="blockly":
            xml=BlocklyTranslator().translate(program)
            if args.output:
                Path(args.output).write_text(xml,encoding="utf-8")
                print(f"Wrote Blockly XML: {args.output}")
                print("  Note: XML export only; load this workspace in the matching KidBright IDE to invoke its existing generators.")
            else: sys.stdout.write(xml)
            return 0
    except (OSError,UnicodeError) as e:
        print(f"{path}: error: {e}",file=sys.stderr); return 2
    except KBTParseError as e:
        print(e.render(str(path)),file=sys.stderr); return 1
    except SemanticError as e:
        for d in e.all_diagnostics:
            print(d.render(str(path)),file=sys.stderr)
        return 1
    except BlocklyTranslationError as e:
        print(e.render(str(path)),file=sys.stderr); return 1
    return 0

if __name__=="__main__": raise SystemExit(main())
