#!/usr/bin/env python3
"""Convert a downloaded CC-CEDICT text file to QingDict's import JSON.

This script does not download data. Obtain the current release and confirm its
license at https://cc-cedict.org/editor/editor.php?handler=Download first.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


ENTRY = re.compile(
    r"^(?P<traditional>\S+)\s+(?P<simplified>\S+)\s+\[(?P<pinyin>[^]]+)]\s+/(?P<definitions>.*)/$"
)


def tone_number_pinyin(value: str) -> str:
    """Keep CC-CEDICT's readable numbered pinyin while normalizing spaces."""
    return " ".join(value.split())


def convert_line(line: str, line_number: int) -> dict | None:
    line = line.strip()
    if not line or line.startswith("#"):
        return None

    match = ENTRY.match(line)
    if not match:
        raise ValueError(f"Unsupported CC-CEDICT record at line {line_number}: {line[:80]}")

    traditional = match.group("traditional")
    simplified = match.group("simplified")
    definitions = [item.strip() for item in match.group("definitions").split("/") if item.strip()]
    return {
        "id": f"cc-cedict-{traditional}-{simplified}",
        "headword": simplified,
        "alternate": traditional if traditional != simplified else None,
        "pronunciation": tone_number_pinyin(match.group("pinyin")),
        "partOfSpeech": None,
        "direction": "zhToEn",
        "definitions": definitions,
        "examples": [],
        "sourceName": "CC-CEDICT",
        "sourceURL": "https://cc-cedict.org/",
        "license": "CC BY-SA 4.0",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="CC-CEDICT UTF-8 text file")
    parser.add_argument("output", type=Path, help="QingDict JSON output file")
    args = parser.parse_args()

    entries = []
    with args.input.open("r", encoding="utf-8-sig") as source:
        for number, line in enumerate(source, start=1):
            entry = convert_line(line, number)
            if entry is not None:
                entries.append(entry)

    args.output.write_text(
        json.dumps(entries, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Converted {len(entries):,} entries to {args.output}")


if __name__ == "__main__":
    main()
