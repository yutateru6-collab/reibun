#!/usr/bin/env python3
"""Convert the supplied final-check DOCX pair into validated app data.

The two documents are treated as the source of truth.  Questions and answers
are joined only by round, section, and the printed question number; missing or
duplicate entries stop generation instead of being guessed.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

from docx import Document


SECTION_IDS = {
    "時制・完了形①": "tense1",
    "時制・完了形②": "tense2",
    "動詞①": "verb1",
    "動詞②": "verb2",
}
SECTION_LABELS = {value: key for key, value in SECTION_IDS.items()}
EXPECTED_PER_ROUND = {"tense1": 26, "tense2": 26, "verb1": 25, "verb2": 23}
CIRCLED = {"①": 0, "②": 1, "③": 2, "④": 3}
JAPANESE_CHAR = r"[\u3040-\u30ff\u3400-\u9fff]"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def paragraphs(path: Path) -> list[str]:
    values: list[str] = []
    for paragraph in Document(path).paragraphs:
        text = re.sub(rf"(?<={JAPANESE_CHAR})[ \t]*\n[ \t]*(?={JAPANESE_CHAR})", "", paragraph.text)
        text = re.sub(r"[ \t]*\n[ \t]*", " ", text).strip()
        if text:
            values.append(text)
    return values


def parse_document(path: Path, *, answers: bool) -> tuple[dict[tuple[int, str, int], str], list[str]]:
    result: dict[tuple[int, str, int], str] = {}
    notes: list[str] = []
    current_round: int | None = None
    current_section: str | None = None
    pending_note_index: int | None = None

    for text in paragraphs(path):
        round_match = re.fullmatch(r"◆\s*第([12])ラウンド", text)
        if round_match:
            current_round = int(round_match.group(1))
            current_section = None
            pending_note_index = None
            continue

        heading = text.replace("｜解答・解説", "") if answers else text
        if heading in SECTION_IDS:
            current_section = SECTION_IDS[heading]
            pending_note_index = None
            continue

        question_match = re.match(r"^(\d+)\.\s*(.*)$", text, flags=re.DOTALL)
        if question_match and current_round is not None and current_section is not None:
            number = int(question_match.group(1))
            key = (current_round, current_section, number)
            if key in result:
                raise ValueError(f"Duplicate entry {key} in {path}")
            result[key] = question_match.group(2).strip()
            pending_note_index = None
            continue

        if current_round is not None and current_section is not None and text.startswith("※"):
            notes.append(f"第{current_round}ラウンド {SECTION_LABELS[current_section]}: {text}")
            pending_note_index = len(notes) - 1
        elif pending_note_index is not None:
            glue = ""
            if not (re.search(rf"{JAPANESE_CHAR}$", notes[pending_note_index]) and re.match(JAPANESE_CHAR, text)):
                glue = " "
            notes[pending_note_index] += glue + text

    return result, notes


def split_choices(problem: str) -> tuple[str, list[str] | None]:
    markers = list(re.finditer(r"[①②③④]", problem))
    if len(markers) < 2:
        return problem, None

    prompt = problem[: markers[0].start()].strip()
    choices: list[str] = []
    for index, marker in enumerate(markers):
        end = markers[index + 1].start() if index + 1 < len(markers) else len(problem)
        choices.append(problem[marker.end() : end].strip())
    return prompt, choices


def classify(prompt: str, choices: list[str] | None) -> str:
    if choices:
        return "choice"
    if "並べかえて" in prompt or "並べ替え" in prompt or re.search(r"\([^\n()]*\s/\s[^\n()]*\)", prompt):
        return "order"
    if "書き換え" in prompt or "同じ意味" in prompt:
        return "rewrite"
    if "誤りを直" in prompt or "動詞の形を" in prompt and "直しなさい" in prompt or "直しなさい" in prompt:
        return "correction"
    if "空所" in prompt or "空欄" in prompt or "______" in prompt or "( )" in prompt:
        return "fill"
    return "written"


def build(question_path: Path, answer_path: Path) -> dict[str, object]:
    questions, question_notes = parse_document(question_path, answers=False)
    answers, answer_notes = parse_document(answer_path, answers=True)
    if set(questions) != set(answers):
        missing_answers = sorted(set(questions) - set(answers))
        missing_questions = sorted(set(answers) - set(questions))
        raise ValueError(f"Question/answer mismatch. Missing answers={missing_answers}; missing questions={missing_questions}")

    rows: list[dict[str, object]] = []
    for round_number, section, number in sorted(questions, key=lambda key: (key[0], list(EXPECTED_PER_ROUND).index(key[1]), key[2])):
        raw_problem = questions[(round_number, section, number)]
        solution = answers[(round_number, section, number)]
        prompt, choices = split_choices(raw_problem)
        correct_index = None
        if choices:
            answer_marker = re.search(r"[①②③④]", solution)
            if not answer_marker:
                raise ValueError(f"Choice question has no marked answer: {(round_number, section, number)}")
            correct_index = CIRCLED[answer_marker.group(0)]
            if correct_index >= len(choices):
                raise ValueError(f"Marked answer is outside choices: {(round_number, section, number)}")

        row: dict[str, object] = {
            "id": f"vq2-final-r{round_number}-{section}-{number:02d}",
            "round": round_number,
            "section": section,
            "number": number,
            "format": classify(prompt, choices),
            "prompt": prompt,
            "solution": solution,
        }
        if choices:
            row["choices"] = choices
            row["correctIndex"] = correct_index
        rows.append(row)

    counts = Counter((row["round"], row["section"]) for row in rows)
    for round_number in (1, 2):
        for section, expected in EXPECTED_PER_ROUND.items():
            actual = counts[(round_number, section)]
            if actual != expected:
                raise ValueError(f"Unexpected count for round {round_number} / {section}: {actual}, expected {expected}")

    if len(rows) != 200 or len({row["id"] for row in rows}) != 200:
        raise ValueError("The generated bank must contain exactly 200 unique questions")

    return {
        "meta": {
            "version": "vq2-final-check-2026-v1",
            "questionSourceSha256": digest(question_path),
            "answerSourceSha256": digest(answer_path),
            "total": len(rows),
            "counts": {
                section: sum(1 for row in rows if row["section"] == section)
                for section in EXPECTED_PER_ROUND
            },
            "sourceNotes": question_notes + answer_notes,
        },
        "questions": rows,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--questions", type=Path, required=True)
    parser.add_argument("--answers", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    payload = build(args.questions, args.answers)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload["meta"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
