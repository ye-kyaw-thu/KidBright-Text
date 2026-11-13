from __future__ import annotations

import sys
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
COMPILER_DIR = REPOSITORY_ROOT / "app" / "kbt" / "compiler"
EXAMPLES_DIR = REPOSITORY_ROOT / "app" / "kbt" / "examples"

sys.path.insert(0, str(COMPILER_DIR))

from kbtc import load_program  # noqa: E402
from kbt_blockly import BlocklyTranslator  # noqa: E402


class KBTExampleRegressionTests(unittest.TestCase):
    def test_all_examples_validate_and_generate_blockly_xml(self) -> None:
        examples = sorted(EXAMPLES_DIR.glob("*/*.kbt"))
        self.assertEqual(
            len(examples),
            60,
            "Expected 60 checked-in examples (48 core, 5 advanced, 7 plugins).",
        )

        counts = {"core": 0, "advanced": 0, "plugins": 0}
        for example in examples:
            profile = example.parent.name
            with self.subTest(profile=profile, example=example.name):
                self.assertIn(profile, counts)
                counts[profile] += 1

                _source, program, _checker = load_program(example, profile)
                xml_text = BlocklyTranslator().translate(program)

                self.assertIn("<xml", xml_text)
                root = ET.fromstring(xml_text)
                self.assertTrue(root.tag.endswith("xml"))
                block_count = sum(
                    1 for node in root.iter()
                    if node.tag.endswith("block") or node.tag.endswith("shadow")
                )
                self.assertGreater(
                    block_count,
                    0,
                    "Each example should produce at least one Blockly block.",
                )

        self.assertEqual(counts, {"core": 48, "advanced": 5, "plugins": 7})


if __name__ == "__main__":
    unittest.main(verbosity=2)
