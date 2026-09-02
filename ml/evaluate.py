"""Measure how reliable the trained generator is on held-out queue scenes."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

from config import MAX_SOURCE_LENGTH, MAX_TARGET_LENGTH
from teacher import clamp_prediction, teacher_decision


def load_jsonl(path: Path) -> list[dict]:
    rows = []
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def parse_json_object(text: str) -> dict | None:
    text = text.strip()
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        parsed = json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None
    return parsed if isinstance(parsed, dict) else None


@torch.inference_mode()
def generate_batch(model, tokenizer, prompts: list[str], device: torch.device) -> list[str]:
    encoded = tokenizer(
        prompts,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=MAX_SOURCE_LENGTH,
    ).to(device)
    outputs = model.generate(
        **encoded,
        max_new_tokens=MAX_TARGET_LENGTH,
        num_beams=4,
        do_sample=False,
        early_stopping=True,
    )
    return tokenizer.batch_decode(outputs, skip_special_tokens=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate routing generator")
    parser.add_argument("--checkpoint", default="checkpoints/best")
    parser.add_argument("--data-dir", default="data")
    parser.add_argument("--split", default="test", choices=["train", "val", "test"])
    parser.add_argument("--limit", type=int, default=0, help="0 = all rows")
    parser.add_argument("--batch-size", type=int, default=8)
    args = parser.parse_args()

    rows = load_jsonl(Path(args.data_dir) / f"{args.split}.jsonl")
    if args.limit:
        rows = rows[: args.limit]

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tokenizer = AutoTokenizer.from_pretrained(args.checkpoint)
    model = AutoModelForSeq2SeqLM.from_pretrained(args.checkpoint).to(device)
    model.eval()

    raw_valid = 0
    action_hits = 0
    dept_hits = 0
    wait_errors: list[float] = []
    predictions = []

    for i in range(0, len(rows), args.batch_size):
        batch = rows[i : i + args.batch_size]
        texts = generate_batch(model, tokenizer, [r["input"] for r in batch], device)
        for row, text in zip(batch, texts):
            parsed = parse_json_object(text)
            if parsed is not None:
                raw_valid += 1
            clamped = clamp_prediction(parsed or {}, row["example"])
            gold = row["label"]
            action_hits += int(clamped["action"] == gold["action"])
            dept_hits += int(clamped["to_department"] == gold["to_department"])
            wait_errors.append(abs(clamped["predicted_wait_current"] - gold["predicted_wait_current"]))
            predictions.append(
                {
                    "id": row["id"],
                    "gold": gold,
                    "raw": text,
                    "parsed": parsed,
                    "clamped": clamped,
                    "teacher_check": teacher_decision(row["example"]),
                }
            )

    n = max(len(rows), 1)
    report = {
        "n": len(rows),
        "json_valid_rate": round(raw_valid / n, 4),
        "action_accuracy": round(action_hits / n, 4),
        "department_accuracy": round(dept_hits / n, 4),
        "wait_mae_minutes": round(sum(wait_errors) / n, 3),
    }
    out_path = Path(args.checkpoint) / f"eval_{args.split}.json"
    out_path.write_text(json.dumps({"metrics": report, "predictions": predictions[:50]}, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    print("Wrote", out_path.resolve())


if __name__ == "__main__":
    os.chdir(Path(__file__).resolve().parent)
    main()
