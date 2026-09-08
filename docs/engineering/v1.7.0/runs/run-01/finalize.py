#!/usr/bin/env python3
import hashlib
import json
import platform
from datetime import datetime, timezone
from pathlib import Path
from html.parser import HTMLParser

ROOT=Path(__file__).resolve().parent
SKILL=Path('/workspace/scratch/b4c4b2db70f4/repo/plugins/dialogue-tutor/skills/dialogue-tutor')
lesson=json.loads((ROOT/'lesson.json').read_text())
hashes=json.loads((ROOT/'skill-hashes.json').read_text())

class Audit(HTMLParser):
    def __init__(self): super().__init__(); self.scripts=[]; self.network_dependencies=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='script' and 'src' in attrs:self.network_dependencies.append(attrs['src'])
        if tag in ['img','video','audio','iframe'] and 'src' in attrs:self.network_dependencies.append(attrs['src'])
        if tag=='link' and attrs.get('rel')=='stylesheet':self.network_dependencies.append(attrs.get('href'))

audit=Audit();audit.feed((ROOT/'lesson.html').read_text());assert not audit.network_dependencies
consumed=['SKILL.md','references/modes-and-explanations.md','references/teaching-design.md','references/interactive-html.md','references/visual-design.md','references/engagement-and-narrative.md','references/统计术语中英对照.md','references/考纲与考试局.md','references/expert-review.md','references/deeptutor-provenance.md','scripts/build_lesson.py','assets/interactive/lesson-runtime.css','assets/interactive/lesson-runtime.js']
for key in consumed:assert hashlib.sha256((SKILL/key).read_bytes()).hexdigest()==hashes[key]
manifest={
 'generatedAtUTC':datetime.now(timezone.utc).isoformat(),
 'generatorRole':'/root/lesson_generator',
 'exactBackendModelIdentifier':None,
 'modelConfigurationDisclosure':'Inherited parent configuration; exact model identifier, temperature, top_p and generation seed were not exposed to this executor. No model override or subagent was used.',
 'temperature':None,'topP':None,'generationSeed':None,
 'skillVersion':'DialogueTutor 1.7.0','skillCandidateCommitAsReportedByParent':'6191990',
 'skillEntrySHA256':hashes['SKILL.md'],
 'skillFilesActuallyRead':{key:hashes[key] for key in consumed},
 'taskScopeSource':'/workspace/scratch/b4c4b2db70f4/repo/docs/engineering/v1.7.0/official-scope.md',
 'sourceVerificationDate':'2026-09-07','textbookChapterFullTextAvailable':False,
 'officialSources':[
  {'url':'https://www.pearson.com/content/dam/one-dot-com/one-dot-com/international-schools/pdfs/secondary-curriculum/international-a-levels/mathematics/International-A-Level-Mathematics-Statistics-2-Student-Book-sample.pdf','use':'Chapter contents and sections 6.1–6.3; PDF pages 3 and 5'},
  {'url':'https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Mathematics/2018/Specification-and-Sample-Assessment/international-a-level-maths-spec.pdf','use':'Issue 3 Unit S2 4.1–4.2; printed page 59, PDF page 65'}],
 'generation':{'mode':lesson['mode'],'presentation':lesson['presentation'],'language':lesson['language'],'schemaVersion':lesson['schemaVersion'],'lessonId':lesson['lessonId'],'revision':lesson['revision'],'activities':len(lesson['activities']),'sections':len(lesson['sections']),'objectives':len(lesson['objectives']),'pathways':len(lesson['pathways']),'origin':'Original course, numerical examples, questions, narration and custom widgets; no base HTML or prior demo used.','builderCommand':'python3 scripts/build_lesson.py --lesson /workspace/scratch/b4c4b2db70f4/generation/run-01/lesson.json --output /workspace/scratch/b4c4b2db70f4/generation/run-01/lesson.html','builderWorkingDirectory':str(SKILL),'pythonVersion':platform.python_version(),'ttsRequested':False,'externalRuntimeDependencies':audit.network_dependencies},
 'simulation':{'population':{'A':1,'B':3,'C':5},'unit':'minutes','allowedSampleSizes':[1,2,3],'mechanisms':['uniform independent draws with replacement','uniform draws among remaining labels without replacement'],'defaultSampleSize':2,'defaultReplacement':True,'randomSource':'Browser Math.random; no fixed seed configured','repetitionButtons':[1,20],'manualEnumerationContributesToSimulation':False},
 'checks':{'exactEnumerationCases':12,'domAssertions':36,'domErrors':0,'realBrowserVisualVerification':'NOT EXECUTED; preview infrastructure unavailable as reported by parent','expertReviewOfOutput':'NOT PERFORMED BY GENERATOR'},
 'writesConfinedTo':str(ROOT),
}
(ROOT/'generation-config.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
files=['lesson.html','lesson.json','blueprint.md','activity-map.json','author.py','sampling-lab.js','evidence-close.js','check_math.py','check_dom.cjs','math-checks.json','dom-checks.json','skill-hashes.json','validation.md','generation-config.json','finalize.py']
out={name:{'sha256':hashlib.sha256((ROOT/name).read_bytes()).hexdigest(),'bytes':(ROOT/name).stat().st_size} for name in files}
(ROOT/'artifact-hashes.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({'lesson.html':out['lesson.html'],'skillEntrySHA256':manifest['skillEntrySHA256'],'files':len(files)},ensure_ascii=False))
