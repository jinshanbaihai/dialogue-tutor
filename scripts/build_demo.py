#!/usr/bin/env python3
"""Rebuild the legacy demo and the independently generated S2 chapter 6 lesson."""
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
skill = root / "plugins/dialogue-tutor/skills/dialogue-tutor"
subprocess.run([
    sys.executable, str(skill / "scripts/build_lesson.py"),
    "--lesson", str(skill / "examples/s2-interactive.json"),
    "--base-html", str(skill / "examples/s2-source.html"),
    "--output", str(root / "docs/index.html"),
], check=True)
subprocess.run([
    sys.executable, str(skill / "scripts/build_lesson.py"),
    "--lesson", str(root / "docs/lessons/s2-ch6.json"),
    "--output", str(root / "docs/s2-ch6.html"),
], check=True)
