# Contributing to KidBright Text

Thank you for your interest in improving KidBright Text.

## Before opening a change

1. Read `README.md`, `THIRD_PARTY_NOTICES.md` and `docs/LICENSING.md`.
2. Keep upstream KidBright IDE changes distinct from KBT-specific changes where practical.
3. Do not commit `node_modules`, downloaded toolchains, generated firmware, local data, credentials or backup directories.
4. Preserve original copyright and license notices.
5. Add or update a KBT example when changing language or Blockly translation behavior.

## Run the KBT tests

Use Python 3.10 or newer:

```bash
python -m unittest discover -s tests -v
```

The test suite checks all packaged KBT examples through parsing, semantic validation and Blockly XML generation.

## Pull requests

Please describe:
- the problem being solved;
- affected source files and Blockly block types;
- test commands and results;
- whether hardware testing was performed;
- any new third-party dependency or license.
