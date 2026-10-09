import json
import tempfile
import unittest
from pathlib import Path

from convert_cc_cedict import convert_line


class ConverterTests(unittest.TestCase):
    def test_parses_simplified_and_traditional(self):
        entry = convert_line("學習 学习 [xue2 xi2] /to learn/to study/", 1)
        self.assertEqual(entry["headword"], "学习")
        self.assertEqual(entry["alternate"], "學習")
        self.assertEqual(entry["definitions"], ["to learn", "to study"])
        self.assertEqual(entry["direction"], "zhToEn")

    def test_skips_comments(self):
        self.assertIsNone(convert_line("# CC-CEDICT", 1))


if __name__ == "__main__":
    unittest.main()
