"""Hospital queue routing task — aligned with backend/src/data/departments.ts."""

from __future__ import annotations

DEPARTMENTS = {
    "ecg": {"name": "ECG", "target_wait": 15, "avg_exam": 10, "capacity": 2},
    "xray": {"name": "X-Ray", "target_wait": 20, "avg_exam": 15, "capacity": 3},
    "usg": {"name": "USG", "target_wait": 25, "avg_exam": 20, "capacity": 2},
    "mammography": {"name": "Mammography", "target_wait": 30, "avg_exam": 25, "capacity": 1},
    "echo2d": {"name": "2D Echo", "target_wait": 20, "avg_exam": 30, "capacity": 2},
    "tmt": {"name": "TMT", "target_wait": 30, "avg_exam": 45, "capacity": 1},
    "dental": {"name": "Dental", "target_wait": 15, "avg_exam": 20, "capacity": 2},
    "lab": {"name": "Laboratory", "target_wait": 10, "avg_exam": 5, "capacity": 4},
    "doctor": {"name": "Doctor Consultation", "target_wait": 20, "avg_exam": 15, "capacity": 3},
}

PACKAGE_DEPARTMENTS = {
    "basic": ["lab", "ecg", "doctor"],
    "standard": ["lab", "ecg", "xray", "doctor"],
    "comprehensive": ["lab", "ecg", "xray", "usg", "echo2d", "doctor"],
    "executive": ["lab", "ecg", "xray", "usg", "echo2d", "tmt", "dental", "doctor"],
    "cardiac": ["lab", "ecg", "echo2d", "tmt", "doctor"],
    "womens_health": ["lab", "usg", "mammography", "doctor"],
}

TASK_PREFIX = "hospital queue routing:"
REDIRECT_THRESHOLD_MINUTES = 5
DEFAULT_MODEL = "google/flan-t5-small"
MAX_SOURCE_LENGTH = 384
MAX_TARGET_LENGTH = 192
