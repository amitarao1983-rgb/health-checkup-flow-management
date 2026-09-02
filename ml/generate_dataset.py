"""Build a labeled instruction dataset from a hospital queue simulator."""

from __future__ import annotations

import argparse
import json
import random
from pathlib import Path

from config import DEPARTMENTS, PACKAGE_DEPARTMENTS, TASK_PREFIX
from teacher import format_input, format_output, teacher_decision


def sample_example(rng: random.Random) -> dict:
    package = rng.choice(list(PACKAGE_DEPARTMENTS))
    pathway = list(PACKAGE_DEPARTMENTS[package])
    done_count = rng.randint(0, max(0, len(pathway) - 2))
    remaining = pathway[done_count:]
    current = remaining[0]
    pending = remaining[1:] if len(remaining) > 1 else []
    # Patient is physically at `current` and may still visit `pending`.
    visitable = [current, *pending]

    hour = rng.randint(8, 18)
    staffing = rng.choice([0.75, 1.0, 1.0, 1.25])

    queues = {}
    for dept_id in DEPARTMENTS:
        cap = DEPARTMENTS[dept_id]["capacity"]
        waiting = rng.randint(0, cap * 6)
        in_progress = rng.randint(0, cap)
        queues[dept_id] = {"waiting": waiting, "in_progress": in_progress}

    return {
        "package": package,
        "hour": hour,
        "staffing": staffing,
        "current_department": current,
        "pending_departments": visitable,
        "queues": queues,
    }


def build_split(n: int, seed: int) -> list[dict]:
    rng = random.Random(seed)
    rows = []
    for i in range(n):
        example = sample_example(rng)
        label = teacher_decision(example)
        rows.append(
            {
                "id": f"{seed}-{i}",
                "input": f"{TASK_PREFIX} {format_input(example)}",
                "output": format_output(label),
                "example": example,
                "label": label,
            }
        )
    return rows


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=True) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate routing dataset")
    parser.add_argument("--out-dir", default="data")
    parser.add_argument("--train", type=int, default=4000)
    parser.add_argument("--val", type=int, default=500)
    parser.add_argument("--test", type=int, default=500)
    parser.add_argument("--quick", action="store_true", help="Tiny split for a smoke test")
    args = parser.parse_args()

    if args.quick:
        args.train, args.val, args.test = 200, 40, 40

    out = Path(args.out_dir)
    write_jsonl(out / "train.jsonl", build_split(args.train, seed=11))
    write_jsonl(out / "val.jsonl", build_split(args.val, seed=22))
    write_jsonl(out / "test.jsonl", build_split(args.test, seed=33))
    print(f"Wrote {args.train}/{args.val}/{args.test} examples to {out.resolve()}")


if __name__ == "__main__":
    main()
