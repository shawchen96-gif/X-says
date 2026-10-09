#!/usr/bin/env python3
"""Build QingDict's bundled 15,006-entry English-Chinese dictionary."""

from __future__ import annotations

import csv
import json
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ECDICT = ROOT / "work" / "ECDICT" / "ecdict.csv"
ECDICT_LICENSE = ROOT / "work" / "ECDICT" / "LICENSE"
TATOEBA = ROOT / "work" / "cmn-eng-v1" / "cmn.txt"
TATOEBA_ABOUT = ROOT / "work" / "cmn-eng-v1" / "_about.txt"
RESOURCES = ROOT / "QingDict" / "Resources"
OUTPUT = RESOURCES / "ecdict_dictionary.json"
TARGET_COUNT = 15_006

WORD_RE = re.compile(r"^[a-z][a-z'-]{1,31}$")
CHINESE_RE = re.compile(r"[\u3400-\u9fff]")
PART_RE = re.compile(r"^([a-z]+\.)\s*", re.I)


def positive_number(value: str) -> int:
    try:
        number = int(value or 0)
        return number if number > 0 else 999_999
    except ValueError:
        return 999_999


def compact(value: str, limit: int) -> str:
    value = re.sub(r"\s*\n\s*", "；", value or "")
    value = re.sub(r"\[网络\][^；]*", "", value)
    value = re.sub(r"\s+", " ", value).strip(" ；")
    return value[:limit].rstrip("；,， ")


def load_ecdict() -> list[dict]:
    rows = []
    with ECDICT.open("r", encoding="utf-8", newline="") as source:
        for row in csv.DictReader(source):
            word = (row.get("word") or "").strip().lower()
            translation = compact(row.get("translation") or "", 320)
            if not WORD_RE.fullmatch(word) or not CHINESE_RE.search(translation):
                continue

            match = PART_RE.match(translation)
            inferred_part = match.group(1).lower() if match else ""
            meaning = translation[match.end():].strip() if match else translation
            tags = set((row.get("tag") or "").lower().split())
            rows.append(
                {
                    "word": word,
                    "phonetic": compact(row.get("phonetic") or "", 80),
                    "part": compact(row.get("pos") or inferred_part, 40),
                    "meaning": meaning or translation,
                    "definition": compact(row.get("definition") or "", 320),
                    "tags": tags,
                    "rank": min(positive_number(row.get("frq") or ""), positive_number(row.get("bnc") or "")),
                    "oxford": (row.get("oxford") or "") == "1",
                    "collins": int(row.get("collins") or 0) if (row.get("collins") or "").isdigit() else 0,
                }
            )
    rows.sort(key=lambda item: (item["rank"], len(item["word"]), item["word"]))
    return rows


def choose(rows: list[dict], count: int, predicates: list) -> list[dict]:
    selected = []
    seen = set()
    for predicate in predicates + [lambda _: True]:
        for item in rows:
            if len(selected) >= count:
                break
            if item["word"] in seen or not predicate(item):
                continue
            seen.add(item["word"])
            selected.append(item)
    return selected


def select_words(rows: list[dict]) -> list[dict]:
    plans = [
        (600, [lambda x: x["oxford"] and x["rank"] <= 6000 and len(x["word"]) <= 10]),
        (1600, [lambda x: "zk" in x["tags"], lambda x: x["oxford"]]),
        (3500, [lambda x: "gk" in x["tags"], lambda x: "cet4" in x["tags"]]),
        (1200, [lambda x: x["oxford"] and x["rank"] <= 10_000, lambda x: x["collins"] >= 3]),
        (2607, [lambda x: "cet4" in x["tags"]]),
        (2078, [lambda x: "cet6" in x["tags"]]),
        (3421, [lambda x: "ielts" in x["tags"]]),
    ]

    unique: dict[str, dict] = {}
    for count, predicates in plans:
        for item in choose(rows, count, predicates):
            unique.setdefault(item["word"], item)

    # The old website's seven collections totalled 15,006 slots but overlapped.
    # Fill with the next highest-ranked valid terms so the iOS dictionary has
    # exactly 15,006 distinct headwords instead of duplicate records.
    for item in rows:
        if len(unique) >= TARGET_COUNT:
            break
        unique.setdefault(item["word"], item)
    return list(unique.values())


def load_examples(words: set[str]) -> dict[str, dict]:
    examples: dict[str, dict] = {}
    scores: dict[str, tuple] = {}
    with TATOEBA.open("r", encoding="utf-8") as source:
        for line in source:
            fields = line.rstrip("\n").split("\t")
            if len(fields) < 3:
                continue
            english, chinese, attribution = fields[:3]
            tokens = set(re.findall(r"[a-z][a-z'-]*", english.lower()))
            length = len(tokens)
            if length < 3 or length > 16:
                continue
            score = (0 if 5 <= length <= 12 else 1, abs(length - 8), len(english))
            for word in tokens & words:
                if word not in scores or score < scores[word]:
                    scores[word] = score
                    examples[word] = {
                        "source": english,
                        "translation": chinese,
                        "attribution": attribution,
                    }
    return examples


def main() -> None:
    rows = load_ecdict()
    selected = select_words(rows)
    if len(selected) != TARGET_COUNT:
        raise RuntimeError(f"Expected {TARGET_COUNT} unique entries, got {len(selected)}")

    examples = load_examples({item["word"] for item in selected})
    entries = []
    for item in selected:
        definitions = [item["meaning"]]
        if item["definition"]:
            definitions.append(item["definition"])
        example = examples.get(item["word"])
        entries.append(
            {
                "id": f"ecdict-{item['word']}",
                "headword": item["word"],
                "alternate": None,
                "pronunciation": f"/{item['phonetic'].strip('/')} /".replace(" /", "/") if item["phonetic"] else None,
                "partOfSpeech": item["part"] or None,
                "direction": "enToZh",
                "definitions": definitions,
                "examples": [example] if example else [],
                "sourceName": "ECDICT" + (" + Tatoeba" if example else ""),
                "sourceURL": "https://github.com/skywind3000/ECDICT",
                "license": "MIT" + ("; example CC BY 2.0 (France)" if example else ""),
            }
        )

    OUTPUT.write_text(json.dumps(entries, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    shutil.copyfile(ECDICT_LICENSE, RESOURCES / "ECDICT-LICENSE.txt")
    shutil.copyfile(TATOEBA_ABOUT, RESOURCES / "TATOEBA-ATTRIBUTION.txt")
    print(
        json.dumps(
            {
                "entries": len(entries),
                "entries_with_examples": sum(bool(entry["examples"]) for entry in entries),
                "bytes": OUTPUT.stat().st_size,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
