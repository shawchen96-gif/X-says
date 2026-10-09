#!/usr/bin/env python3
import csv
import sqlite3
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "work" / "ECDICT" / "ecdict.csv"
DESTINATION = ROOT / "ios" / "XSays" / "Resources" / "Dictionary.sqlite"


def rank(value: str) -> int:
    try:
        number = int(value or 0)
        return number if number > 0 else 2_147_483_647
    except ValueError:
        return 2_147_483_647


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Dictionary source is missing: {SOURCE}")
    DESTINATION.unlink(missing_ok=True)
    temporary = Path(tempfile.gettempdir()) / "xsays-dictionary.sqlite"
    temporary.unlink(missing_ok=True)
    connection = sqlite3.connect(temporary)
    connection.executescript("""
        PRAGMA journal_mode=OFF;
        PRAGMA synchronous=OFF;
        PRAGMA temp_store=MEMORY;
        CREATE TABLE words (
            id INTEGER PRIMARY KEY,
            word TEXT NOT NULL COLLATE NOCASE,
            phonetic TEXT NOT NULL DEFAULT '',
            definition TEXT NOT NULL DEFAULT '',
            translation TEXT NOT NULL DEFAULT '',
            exchange TEXT NOT NULL DEFAULT '',
            frequency INTEGER NOT NULL
        );
    """)
    insert = "INSERT INTO words(word, phonetic, definition, translation, exchange, frequency) VALUES(?,?,?,?,?,?)"
    count = 0
    with SOURCE.open("r", encoding="utf-8", newline="") as source:
        reader = csv.DictReader(source)
        batch = []
        for row in reader:
            word = (row.get("word") or "").strip()
            translation = (row.get("translation") or "").strip()
            definition = (row.get("definition") or "").strip()
            if not word or not (translation or definition):
                continue
            batch.append((word, row.get("phonetic") or "", definition, translation, row.get("exchange") or "", min(rank(row.get("frq") or ""), rank(row.get("bnc") or ""))))
            if len(batch) == 5_000:
                connection.executemany(insert, batch); count += len(batch); batch.clear()
        if batch:
            connection.executemany(insert, batch); count += len(batch)
    connection.executescript("CREATE INDEX words_word ON words(word); CREATE INDEX words_frequency ON words(frequency);")
    connection.execute("PRAGMA optimize")
    connection.commit()
    connection.close()
    DESTINATION.write_bytes(temporary.read_bytes())
    temporary.unlink(missing_ok=True)
    print(f"Created {DESTINATION} with {count:,} searchable entries")


if __name__ == "__main__":
    main()
