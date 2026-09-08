#!/usr/bin/env python3
"""Rebuild only from original author files and the unmodified skill assembler."""
from pathlib import Path
import subprocess
import hashlib
import json
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parent.parent
SKILL=Path('/workspace/scratch/b4c4b2db70f4/repo/plugins/dialogue-tutor/skills/dialogue-tutor')
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else None
before={name:digest(ROOT/name) for name in ('lesson.json','lesson.html')}
commands=[
    (['python3',str(ROOT/'author/generate.py')],str(ROOT)),
    (['python3','scripts/build_lesson.py','--lesson',str(ROOT/'lesson.json'),'--output',str(ROOT/'lesson.html')],str(SKILL)),
]
record={'utc':datetime.now(timezone.utc).isoformat(),'runs':[]}
for args,cwd in commands:
    process=subprocess.run(args,cwd=cwd,capture_output=True,text=True)
    record['runs'].append({'args':args,'cwd':cwd,'exitCode':process.returncode,'stdout':process.stdout,'stderr':process.stderr})
    if process.returncode:break
record['before']=before
record['after']={name:digest(ROOT/name) for name in ('lesson.json','lesson.html')}
record['identicalToPreviouslyCheckedArtifacts']=record['before']==record['after']
(ROOT/'records/build-check.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(record,ensure_ascii=False))
if any(run['exitCode'] for run in record['runs']):raise SystemExit(1)
