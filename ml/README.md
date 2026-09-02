# Hospital Queue Routing — Generative Model Training

This folder is a self-contained sample project: **fine-tune a small generative model so it recommends the next health-check department from a live queue snapshot**. The output is structured JSON, not free-form chat, so a hospital system can act on it.

## 1. Task

A patient is already in a health-check pathway (for example Comprehensive: Lab → ECG → X-Ray → USG → 2D Echo → Doctor). They are physically at one department, other tests are still pending, and each room has a different queue.

The model must generate a routing decision:

- **`stay`** — keep the patient in the current department
- **`redirect`** — send them to a faster pending department first

Each prediction also includes estimated wait at the current room, estimated wait at the suggested room, minutes saved, a confidence score, whether the current queue is over its target, and a short reason a coordinator can read.

A redirect is allowed only if another **pending** department is at least **5 minutes** faster. The model may not invent a department that is not on the patient’s remaining list.

## 2. Data

Real hospital logs are not included. Labels are built with a **simulator** (`generate_dataset.py`) that matches the department list used in the product (ECG, X-Ray, USG, Mammography, 2D Echo, TMT, Dental, Laboratory, Doctor Consultation) and the same health packages (Basic, Standard, Comprehensive, Executive, Cardiac, Women’s Health).

Each example records:

- package, hour of day (8–18), and staffing (0.75 / 1.0 / 1.25)
- current department and remaining departments
- waiting and in-progress counts for every room

Wait time is **deterministic** (`teacher.py`): queue length, exam duration, capacity, staffing, and a peak-hour factor (09:00–11:00 and 14:00–16:00). There is no random noise in the labels, so the model learns a stable policy.

Default split:

| Split | Size | File |
|-------|------|------|
| Train | 4,000 | `data/train.jsonl` |
| Validation | 500 | `data/val.jsonl` |
| Test | 500 | `data/test.jsonl` |

Each JSONL line has an instruction-style `input` string and a JSON `output` string (the teacher label). `--quick` builds 200 / 40 / 40 rows for a CPU smoke test.

## 3. Model

The generator is **[FLAN-T5-small](https://huggingface.co/google/flan-t5-small)** (`google/flan-t5-small`, about 77 million parameters). It is an encoder–decoder model already instruction-tuned, which fits “read a queue snapshot → write JSON.”

Training (`train.py`) uses Hugging Face `Seq2SeqTrainer`:

- learning rate `3e-4`, 3 epochs by default (1 epoch with `--quick`)
- early stopping on validation loss
- greedy/beam decoding at inference (`num_beams=4`, `do_sample=False`) so the same snapshot yields the same text
- CPU is supported; a GPU is optional (`fp16` when CUDA is available)

Checkpoints are written to `checkpoints/best`.

## 4. Reliable output (JSON + clamping)

Generative models can drift (invalid JSON, a department the patient does not need, or a “redirect” that goes nowhere). Two layers keep the result usable:

1. **JSON targets during training.** Every label is a single JSON object with fixed keys (`action`, `to_department`, wait fields, `confidence`, `over_target`, `reason`). The model is trained to copy that shape.

2. **Clamping at inference** (`clamp_prediction` in `teacher.py`):
   - extract the first `{...}` from the generated text and `json.loads` it
   - if parsing fails, fall back to the teacher decision for numeric fields and the reason
   - if `to_department` is not in `{current} ∪ pending`, force **stay** at the current room
   - if `action` is not `stay` / `redirect`, derive it from whether the destination changed
   - clamp confidence to (0.01, 0.99) and waits to integers

The neural net proposes the plan; the clamp layer **guarantees a valid department and action** before anything is shown to staff.

## 5. Metrics

`evaluate.py` scores the held-out split after clamping:

| Metric | What a good score means |
|--------|-------------------------|
| `json_valid_rate` | Raw generations parse as JSON (model learned the format) |
| `action_accuracy` | `stay` vs `redirect` matches the teacher |
| `department_accuracy` | Suggested room matches the teacher |
| `wait_mae_minutes` | Mean absolute error on current-room wait |

Use **department accuracy** and **wait MAE** as the main quality checks. JSON validity shows format learning; clamping can still save a bad parse, but a high parse rate is required for a trustworthy generator.

## 6. How to run

From this `ml/` directory, after `python -m pip install -r requirements.txt`:

**1. Build data** (skip if `data/*.jsonl` already exist; `train.py --generate` can also create them):

```powershell
python generate_dataset.py --out-dir data
```

**2. Train:**

```powershell
python train.py --generate --epochs 3 --output-dir checkpoints
```

Smoke test on CPU: `python train.py --generate --quick --output-dir checkpoints`

**3. Evaluate, then run one example:**

```powershell
python evaluate.py --checkpoint checkpoints/best --split test
python infer.py --checkpoint checkpoints/best --input sample_input.json
```

Without a trained checkpoint, the same sample still runs the teacher policy:

```powershell
python infer.py --teacher-only --input sample_input.json
```

On `sample_input.json` the teacher redirects **ECG → X-Ray** because X-Ray is much faster than the overloaded ECG queue. After training, compare `prediction` to `teacher_reference` in the infer output.
