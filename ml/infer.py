"""Run the trained generator on one queue snapshot. Falls back to the teacher if JSON is invalid."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from config import MAX_SOURCE_LENGTH, MAX_TARGET_LENGTH, TASK_PREFIX
from teacher import clamp_prediction, format_input, teacher_decision

SAMPLE = {
    "package": "comprehensive",
    "hour": 10,
    "staffing": 1.0,
    "current_department": "ecg",
    "pending_departments": ["ecg", "xray", "usg", "echo2d", "doctor"],
    "queues": {
        "ecg": {"waiting": 8, "in_progress": 2},
        "xray": {"waiting": 1, "in_progress": 1},
        "usg": {"waiting": 4, "in_progress": 2},
        "mammography": {"waiting": 2, "in_progress": 1},
        "echo2d": {"waiting": 3, "in_progress": 1},
        "tmt": {"waiting": 2, "in_progress": 1},
        "dental": {"waiting": 0, "in_progress": 0},
        "lab": {"waiting": 6, "in_progress": 3},
        "doctor": {"waiting": 5, "in_progress": 2},
    },
}


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


def predict(example: dict, checkpoint: Path) -> dict:
    import torch
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tokenizer = AutoTokenizer.from_pretrained(str(checkpoint))
    model = AutoModelForSeq2SeqLM.from_pretrained(str(checkpoint)).to(device)
    model.eval()
    prompt = f"{TASK_PREFIX} {format_input(example)}"
    with torch.inference_mode():
        encoded = tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=MAX_SOURCE_LENGTH,
        ).to(device)
        output_ids = model.generate(
            **encoded,
            max_new_tokens=MAX_TARGET_LENGTH,
            num_beams=4,
            do_sample=False,
            early_stopping=True,
        )
    raw = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    parsed = parse_json_object(raw)
    clamped = clamp_prediction(parsed or {}, example)
    return {
        "prompt": prompt,
        "raw_generation": raw,
        "json_valid": parsed is not None,
        "prediction": clamped,
        "teacher_reference": teacher_decision(example),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate one routing decision")
    parser.add_argument("--checkpoint", default="checkpoints/best")
    parser.add_argument("--input", help="JSON file with one queue snapshot")
    parser.add_argument("--teacher-only", action="store_true", help="Skip the neural model")
    args = parser.parse_args()

    example = SAMPLE
    if args.input:
        example = json.loads(Path(args.input).read_text(encoding="utf-8"))

    if args.teacher_only or not Path(args.checkpoint).exists():
        result = {
            "prediction": teacher_decision(example),
            "source": "teacher",
            "note": "Neural checkpoint missing or --teacher-only set.",
        }
    else:
        result = predict(example, Path(args.checkpoint))
        result["source"] = "flan-t5"

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    os.chdir(Path(__file__).resolve().parent)
    main()
