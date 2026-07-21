import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "work" / "ECDICT" / "ecdict.csv"
EXAMPLE_SOURCE = ROOT / "work" / "cmn-eng-v1" / "cmn.txt"
OUTPUT = ROOT / "public" / "data"

TARGETS = {
    "primary": 600,
    "junior": 1600,
    "senior": 3500,
    "daily": 1200,
    "cet4": 2607,
    "cet6": 2078,
    "ielts": 3421,
}

WORD_RE = re.compile(r"^[a-z][a-z'-]{1,23}$")
CHINESE_RE = re.compile(r"[\u3400-\u9fff]")
PART_RE = re.compile(r"^([a-z]+\.)\s*", re.I)


def number(value: str) -> int:
    try:
        result = int(value or 0)
        return result if result > 0 else 999999
    except ValueError:
        return 999999


def compact(value: str, limit: int) -> str:
    value = re.sub(r"\s*\n\s*", "；", value or "")
    value = re.sub(r"\[网络\][^；]*", "", value)
    value = re.sub(r"\s+", " ", value).strip(" ；")
    return value[:limit].rstrip("；,， ")


def load_rows():
    rows = []
    with SOURCE.open("r", encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            word = (row.get("word") or "").strip().lower()
            translation = compact(row.get("translation") or "", 180)
            definition = compact(row.get("definition") or "", 180)
            if not WORD_RE.fullmatch(word) or not CHINESE_RE.search(translation) or not definition:
                continue
            match = PART_RE.match(translation)
            part = match.group(1).lower() if match else ""
            meaning = translation[match.end():].strip() if match else translation
            tags = set((row.get("tag") or "").lower().split())
            rank = min(number(row.get("frq") or ""), number(row.get("bnc") or ""))
            rows.append({
                "w": word,
                "p": compact(row.get("phonetic") or "", 60),
                "t": part,
                "m": meaning or translation,
                "d": definition,
                "tags": tags,
                "rank": rank,
                "oxford": (row.get("oxford") or "") == "1",
                "collins": number(row.get("collins") or "") if (row.get("collins") or "").isdigit() else 0,
            })
    rows.sort(key=lambda item: (item["rank"], len(item["w"]), item["w"]))
    return rows


def choose(rows, count, predicates):
    selected = []
    seen = set()
    for predicate in predicates + [lambda _: True]:
        for item in rows:
            if len(selected) >= count:
                break
            if item["w"] in seen or not predicate(item):
                continue
            seen.add(item["w"])
            selected.append({key: item[key] for key in ("w", "p", "t", "m", "d")})
        if len(selected) >= count:
            break
    if len(selected) != count:
        raise RuntimeError(f"wanted {count} words, found {len(selected)}")
    return selected


def load_examples(words):
    examples = {}
    scores = {}
    with EXAMPLE_SOURCE.open("r", encoding="utf-8") as handle:
        for line in handle:
            fields = line.rstrip("\n").split("\t")
            if len(fields) < 3:
                continue
            english, chinese, attribution = fields[:3]
            tokens = re.findall(r"[a-z][a-z'-]*", english.lower())
            if len(tokens) < 3 or len(tokens) > 16:
                continue
            sentence_score = (0 if 5 <= len(tokens) <= 12 else 1, abs(len(tokens) - 8), len(english))
            for word in set(tokens) & words:
                if word not in scores or sentence_score < scores[word]:
                    scores[word] = sentence_score
                    examples[word] = {"e": english, "z": chinese, "a": attribution}
    return examples


def main():
    rows = load_rows()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    plans = {
        "primary": [lambda x: x["oxford"] and x["rank"] <= 6000 and len(x["w"]) <= 10, lambda x: "zk" in x["tags"] and len(x["w"]) <= 12],
        "junior": [lambda x: "zk" in x["tags"], lambda x: x["oxford"], lambda x: x["rank"] <= 12000],
        "senior": [lambda x: "gk" in x["tags"], lambda x: "cet4" in x["tags"], lambda x: x["rank"] <= 22000],
        "daily": [lambda x: x["oxford"] and x["rank"] <= 10000, lambda x: x["collins"] >= 3, lambda x: x["rank"] <= 8000],
        "cet4": [lambda x: "cet4" in x["tags"]],
        "cet6": [lambda x: "cet6" in x["tags"]],
        "ielts": [lambda x: "ielts" in x["tags"]],
    }
    selections = {library_id: choose(rows, count, plans[library_id]) for library_id, count in TARGETS.items()}
    target_words = {item["w"] for words in selections.values() for item in words}
    examples = load_examples(target_words)
    manifest = {}
    for library_id, count in TARGETS.items():
        words = selections[library_id]
        matched = 0
        for item in words:
            example = examples.get(item["w"])
            if example:
                item.update(example)
                matched += 1
            else:
                item.update({
                    "e": f'We learned the word "{item["w"]}" in today\'s lesson.',
                    "z": f'我们在今天的课上学习了“{item["w"]}”这个单词。',
                    "a": "",
                })
        destination = OUTPUT / f"{library_id}.json"
        destination.write_text(json.dumps(words, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        manifest[library_id] = {"count": len(words), "examples": matched, "bytes": destination.stat().st_size}
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
