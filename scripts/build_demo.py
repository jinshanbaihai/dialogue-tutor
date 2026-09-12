#!/usr/bin/env python3
"""Rebuild the S2 course and interactive-first example from editable sources."""
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
    "--lesson", str(skill / "examples/rectangle-perimeter.json"),
    "--output", str(root / "docs/interactive-first.html"),
], check=True)
