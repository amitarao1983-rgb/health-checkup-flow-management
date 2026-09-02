"""Deterministic teacher labels — no random noise, so the model learns a stable policy."""

from __future__ import annotations

import json
from typing import Any

from config import DEPARTMENTS, REDIRECT_THRESHOLD_MINUTES


def predict_wait_minutes(
    department_id: str,
    waiting: int,
    in_progress: int,
    hour: int,
    staffing: float,
) -> int:
    dept = DEPARTMENTS[department_id]
    effective_capacity = max(0.5, dept["capacity"] * staffing)
    queue_load = waiting * dept["avg_exam"]
    in_progress_load = in_progress * (dept["avg_exam"] / max(dept["capacity"], 1))
    wait = queue_load / effective_capacity + in_progress_load
    if 9 <= hour <= 11 or 14 <= hour <= 16:
        wait *= 1.2
    return max(5, round(wait))


def occupancy_percent(department_id: str, waiting: int, in_progress: int) -> int:
    dept = DEPARTMENTS[department_id]
    active = waiting + in_progress
    return min(100, round((active / (dept["capacity"] * 3)) * 100))


def teacher_decision(example: dict[str, Any]) -> dict[str, Any]:
    current = example["current_department"]
    pending = list(example["pending_departments"])
    hour = example["hour"]
    staffing = example["staffing"]
    queues = example["queues"]

    def wait_for(dept_id: str) -> int:
        q = queues[dept_id]
        return predict_wait_minutes(dept_id, q["waiting"], q["in_progress"], hour, staffing)

    current_wait = wait_for(current)
    current_target = DEPARTMENTS[current]["target_wait"]

    best_dept = current
    best_wait = current_wait
    for dept_id in pending:
        if dept_id == current:
            continue
        wait = wait_for(dept_id)
        if wait < best_wait:
            best_wait = wait
            best_dept = dept_id

    saved = current_wait - best_wait
    should_redirect = (
        best_dept != current
        and saved >= REDIRECT_THRESHOLD_MINUTES
        and best_dept in pending
    )

    if should_redirect:
        action = "redirect"
        to_department = best_dept
        target_wait = best_wait
        confidence = round(min(0.95, 0.6 + saved * 0.03), 2)
        reason = (
            f"Send the patient to {DEPARTMENTS[to_department]['name']} now. "
            f"Estimated wait there is {target_wait} min versus {current_wait} min at "
            f"{DEPARTMENTS[current]['name']}, saving about {saved} minutes."
        )
    else:
        action = "stay"
        to_department = current
        target_wait = current_wait
        saved = 0
        confidence = round(min(0.95, 0.7 + (0 if current_wait > current_target else 0.15)), 2)
        reason = (
            f"Keep the patient in {DEPARTMENTS[current]['name']}. "
            f"No other pending department is at least {REDIRECT_THRESHOLD_MINUTES} minutes faster "
            f"(current wait {current_wait} min, target {current_target} min)."
        )

    return {
        "action": action,
        "to_department": to_department,
        "predicted_wait_current": current_wait,
        "predicted_wait_target": target_wait,
        "saved_minutes": saved,
        "confidence": confidence,
        "over_target": current_wait > current_target,
        "reason": reason,
    }


def format_input(example: dict[str, Any]) -> str:
    queues = []
    for dept_id, q in example["queues"].items():
        name = DEPARTMENTS[dept_id]["name"]
        wait = predict_wait_minutes(
            dept_id, q["waiting"], q["in_progress"], example["hour"], example["staffing"]
        )
        occ = occupancy_percent(dept_id, q["waiting"], q["in_progress"])
        queues.append(
            f"{dept_id}({name}): waiting={q['waiting']}, in_progress={q['in_progress']}, "
            f"wait~{wait}min, occupancy={occ}%"
        )
    pending = ", ".join(example["pending_departments"])
    return (
        f"package={example['package']}; hour={example['hour']}; staffing={example['staffing']}; "
        f"current={example['current_department']}; pending=[{pending}]; queues=[{'; '.join(queues)}]"
    )


def format_output(label: dict[str, Any]) -> str:
    return json.dumps(label, ensure_ascii=True, separators=(",", ":"))


def clamp_prediction(parsed: dict[str, Any], example: dict[str, Any]) -> dict[str, Any]:
    """Force the model output onto a valid department and action so inference stays reliable."""
    pending = set(example["pending_departments"])
    current = example["current_department"]
    allowed = pending | {current}

    action = parsed.get("action")
    to_department = parsed.get("to_department")
    if to_department not in allowed:
        to_department = current
        action = "stay"

    if action not in ("redirect", "stay"):
        action = "redirect" if to_department != current else "stay"

    if action == "redirect" and to_department == current:
        action = "stay"

    teacher = teacher_decision(example)
    # Keep generated reason if it is a non-empty string; otherwise use the teacher reason.
    reason = parsed.get("reason")
    if not isinstance(reason, str) or len(reason.strip()) < 20:
        reason = teacher["reason"]

    def as_int(value: Any, fallback: int) -> int:
        try:
            return int(round(float(value)))
        except (TypeError, ValueError):
            return fallback

    def as_conf(value: Any, fallback: float) -> float:
        try:
            return round(min(0.99, max(0.01, float(value))), 2)
        except (TypeError, ValueError):
            return fallback

    return {
        "action": action,
        "to_department": to_department,
        "predicted_wait_current": as_int(parsed.get("predicted_wait_current"), teacher["predicted_wait_current"]),
        "predicted_wait_target": as_int(parsed.get("predicted_wait_target"), teacher["predicted_wait_target"]),
        "saved_minutes": max(0, as_int(parsed.get("saved_minutes"), teacher["saved_minutes"])),
        "confidence": as_conf(parsed.get("confidence"), teacher["confidence"]),
        "over_target": bool(parsed.get("over_target", teacher["over_target"])),
        "reason": reason.strip(),
    }
