from pathlib import Path
import hashlib,json,zipfile,tarfile,io,lzma,re
W=Path(__file__).resolve().parents[1];repo=W/'repo';d=repo/'docs/engineering/correction-2026-09-08/run-03';checks=[]
H=lambda b:hashlib.sha256(b).hexdigest()
def ck(n,v,e=None):checks.append(dict(name=n,pass_=bool(v),evidence=e))
def read(p):return p.read_bytes()
freeze=json.loads((d/'FREEZE.json').read_text());approval=json.loads((d/'approval.json').read_text())
for target,key in [('docs/s2-ch6.html','htmlSha256'),('docs/lessons/s2-ch6.json','jsonSha256')]:ck('installed/'+target,H(read(repo/target))==freeze[key]==approval[key],H(read(repo/target)))
for r in approval['reviews']:ck('approval/report/'+r['seat'],H(read(d/r['report']))==r['sha256'] and r['decision']=='approved' and sum(r[k] for k in ['Critical','Important','Minor'])==0)
ck('approval/skill-link',(d/approval['skillApproval']).exists());ck('approval/frozen-manifest',H(read(d/'final-hashes.json'))==approval['frozenManifestSha256'])
source=repo/'plugins/dialogue-tutor/skills/dialogue-tutor';approved=freeze['inputApproval']['approvedSources'];z=zipfile.ZipFile(repo/'dist/dialogue-tutor-1.7.1.zip');names=z.namelist();ck('zip/exact-20-entries',len(names)==20 and set(names)=={'dialogue-tutor/'+p for p in approved}|{'dialogue-tutor/LICENSE'});ck('zip/all19-approved-bytes',all(H(z.read('dialogue-tutor/'+p))==h==H(read(source/p)) for p,h in approved.items()));ck('zip/license',z.read('dialogue-tutor/LICENSE')==read(repo/'LICENSE'));ck('zip/crc',z.testzip() is None);ziphash=H(read(repo/'dist/dialogue-tutor-1.7.1.zip'))
base=W/'reviews/correction-code-last-delta-run-03-ci-fixed-execution.cjs';current=(repo/'tests/s2-ch6-current.test.cjs').read_text();expected=base.read_text().replace("require('../repo/node_modules/jsdom')","require('jsdom')").replace("'correction-code-last-delta-run-03-refresh-snapshot/lesson.html'","'../docs/s2-ch6.html'");ck('tests/only-install-path-adaptations',current==expected)
archives=[]
for stem in ['correction-run-03-source','correction-run-03-review-data']:
 m=json.loads((d/(stem+'.json')).read_text());pieces=[]
 for part in m['transportPieces']:
  data=read(d/part['path']);ck('archive/piece/'+part['path'],len(data)==part['bytes'] and H(data)==part['sha256']);pieces.append(data)
 data=b''.join(pieces);ck('archive/reassembled/'+stem,len(data)==m['bytes'] and H(data)==m['sha256'],H(data));plain=lzma.decompress(data);t=tarfile.open(fileobj=io.BytesIO(plain),mode='r:');members=[x for x in t.getmembers() if x.isfile() or x.islnk()];ck('archive/count/'+stem,len(members)==m['files'],len(members));ck('archive/safe-paths/'+stem,all(not Path(x.name).is_absolute() and '..' not in Path(x.name).parts for x in t.getmembers()));membermap={x.name:x for x in members}
 if stem.endswith('source'):
  entries=json.loads((d/'final-hashes.json').read_text())['files']+[{'path':p,'bytes':(d/p).stat().st_size,'sha256':H(read(d/p))} for p in ['FREEZE.json','final-hashes.json']]
 else:entries=m['entries']
 bad=[];prefixes=set()
 for e in entries:
  matches=[n for n in membermap if n==e['path'] or n.endswith('/'+e['path'])]
  if len(matches)!=1:bad.append([e['path'],'missing-or-ambiguous']);continue
  name=matches[0];prefixes.add(name[:-len(e['path'])]);b=t.extractfile(membermap[name]).read()
  if len(b)!=e['bytes'] or H(b)!=e['sha256']:bad.append([e['path'],'bytes-or-hash'])
 ck('archive/all-members/'+stem,not bad,bad);archives.append({'name':stem,'sha256':H(data),'members':len(members),'prefixes':sorted(prefixes),'hardlinks':sum(x.islnk() for x in members)})
 del t,plain,data
links=[]
for p in [repo/'README.md',d.parent/'README.md',d/'README.md']:
 for url in re.findall(r'\]\(([^)]+)\)',p.read_text()):
  if re.match(r'[a-zA-Z]+:',url) or url.startswith('#'):continue
  target=(p.parent/url.split('#')[0]);links.append({'from':str(p.relative_to(repo)),'url':url,'exists':target.exists()})
ck('docs/relative-links',all(x['exists'] for x in links),[x for x in links if not x['exists']])
out={'checks':checks,'archives':archives,'zipSha256':ziphash,'links':links,'summary':{'checks':len(checks),'passed':sum(x['pass_'] for x in checks),'failed':[x['name'] for x in checks if not x['pass_']]}}
(W/'reviews/correction-code-delivery-run-03-results.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps(out['summary']));print(json.dumps(archives));print('ZIP',ziphash)
