#!/usr/bin/env python3
"""Build a reproducible, self-contained skill ZIP from the reviewed source tree."""
import argparse
import hashlib
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / 'plugins/dialogue-tutor/skills/dialogue-tutor'


def package(output: Path) -> tuple[int, str]:
    files = [SKILL / name for name in ('SKILL.md', 'references/math-conflicting-readings.md', 'references/stats-glossary-en-zh.md', 'references/syllabus-and-boards.md')]
    assert SKILL / 'SKILL.md' in files
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in files:
            entry = zipfile.ZipInfo('dialogue-tutor/' + path.relative_to(SKILL).as_posix(), (2026, 9, 7, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, path.read_bytes())
    with zipfile.ZipFile(output) as archive:
        assert archive.testzip() is None
        for path in files:
            assert archive.read('dialogue-tutor/' + path.relative_to(SKILL).as_posix()) == path.read_bytes()
    return len(files), hashlib.sha256(output.read_bytes()).hexdigest()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'dist/dialogue-tutor-2.0.1.zip')
    args = parser.parse_args()
    count, digest = package(args.output)
    print(f'{args.output}: {count} files; SHA-256 {digest}')
