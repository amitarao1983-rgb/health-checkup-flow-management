"""Fine-tune FLAN-T5 to generate validated hospital routing JSON.

Example (from the ml/ folder):

    python generate_dataset.py --out-dir data
    python train.py --data-dir data --output-dir checkpoints --epochs 3

Use --quick for a short CPU smoke test.
"""

from __future__ import annotations

import argparse
import json
import os
import random
from pathlib import Path

import numpy as np
import torch
from datasets import Dataset
from transformers import (
    AutoModelForSeq2SeqLM,
    AutoTokenizer,
    DataCollatorForSeq2Seq,
    EarlyStoppingCallback,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    set_seed,
)

from config import DEFAULT_MODEL, MAX_SOURCE_LENGTH, MAX_TARGET_LENGTH
from generate_dataset import build_split, write_jsonl


def load_jsonl(path: Path) -> list[dict]:
    rows = []
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def tokenize_split(rows: list[dict], tokenizer) -> Dataset:
    def _map(batch):
        model_inputs = tokenizer(
            batch["input"],
            max_length=MAX_SOURCE_LENGTH,
            truncation=True,
        )
        labels = tokenizer(
            text_target=batch["output"],
            max_length=MAX_TARGET_LENGTH,
            truncation=True,
        )
        model_inputs["labels"] = labels["input_ids"]
        return model_inputs

    ds = Dataset.from_list([{"input": r["input"], "output": r["output"]} for r in rows])
    return ds.map(_map, batched=True, remove_columns=ds.column_names)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the routing generator")
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--data-dir", default="data")
    parser.add_argument("--output-dir", default="checkpoints")
    parser.add_argument("--epochs", type=float, default=3.0)
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--lr", type=float, default=3e-4)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--generate", action="store_true", help="Create dataset if missing")
    parser.add_argument("--quick", action="store_true")
    args = parser.parse_args()

    set_seed(args.seed)
    random.seed(args.seed)
    np.random.seed(args.seed)
    torch.manual_seed(args.seed)

    data_dir = Path(args.data_dir)
    train_path = data_dir / "train.jsonl"
    val_path = data_dir / "val.jsonl"
    if args.generate or not train_path.exists() or not val_path.exists():
        train_n, val_n, test_n = (200, 40, 40) if args.quick else (4000, 500, 500)
        write_jsonl(data_dir / "train.jsonl", build_split(train_n, seed=11))
        write_jsonl(data_dir / "val.jsonl", build_split(val_n, seed=22))
        write_jsonl(data_dir / "test.jsonl", build_split(test_n, seed=33))
        print(f"Generated dataset in {data_dir.resolve()}")

    tokenizer = AutoTokenizer.from_pretrained(args.model)
    model = AutoModelForSeq2SeqLM.from_pretrained(args.model)

    train_ds = tokenize_split(load_jsonl(train_path), tokenizer)
    val_ds = tokenize_split(load_jsonl(val_path), tokenizer)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    on_cpu = not torch.cuda.is_available()
    training_args = Seq2SeqTrainingArguments(
        output_dir=str(output_dir / "runs"),
        evaluation_strategy="epoch",
        save_strategy="epoch",
        learning_rate=args.lr,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        num_train_epochs=1.0 if args.quick else args.epochs,
        weight_decay=0.01,
        warmup_ratio=0.06,
        logging_steps=20,
        predict_with_generate=False,
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        save_total_limit=2,
        fp16=torch.cuda.is_available(),
        seed=args.seed,
        report_to=[],
        gradient_accumulation_steps=2 if on_cpu else 1,
    )

    trainer_kwargs = dict(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=val_ds,
        data_collator=DataCollatorForSeq2Seq(tokenizer=tokenizer, model=model),
        callbacks=[EarlyStoppingCallback(early_stopping_patience=2)],
    )
    try:
        trainer = Seq2SeqTrainer(processing_class=tokenizer, **trainer_kwargs)
    except TypeError:
        trainer = Seq2SeqTrainer(tokenizer=tokenizer, **trainer_kwargs)
    trainer.train()

    best_dir = output_dir / "best"
    trainer.save_model(str(best_dir))
    tokenizer.save_pretrained(str(best_dir))
    metrics = trainer.evaluate()
    (best_dir / "eval_metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print("Saved best model to", best_dir.resolve())
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    os.chdir(Path(__file__).resolve().parent)
    main()
