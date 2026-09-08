import json,xml.etree.ElementTree as E,re
from fractions import Fraction as F
from pathlib import Path
R=Path('reviews');rows={r['id']:r for r in json.loads((R/'correction-education-dom-proof-rows.json').read_text())}; oracle=json.loads((R/'correction-education-oracle-output.json').read_text());actual=json.loads(Path('generation/correction-run-01/exact-math.json').read_text())['cases']
def tag(n):return n.tag.rsplit('}',1)[-1]
def numeric(n):
 t=tag(n)
 if t=='mn':return F(n.text)
 if t=='mfrac':return numeric(n[0])/numeric(n[1])
 if t in ('mrow','math'):
  cs=list(n)
  if len(cs)==1:return numeric(cs[0])
  vals=[];ops=[]
  for c in cs:
   if tag(c)=='mo':ops.append(c.text)
   else:vals.append(numeric(c))
  if len(vals)!=len(ops)+1:raise ValueError('unsupported expression')
  if len(set(ops))>1:raise ValueError('mixed precedence')
  r=vals[0]
  for op,v in zip(ops,vals[1:]):
   if op=='+':r+=v
   elif op in ('×','·'):r*=v
   elif op in ('÷','/'):r/=v
   elif op in ('−','-'):r-=v
   else:raise ValueError(op)
  return r
 raise ValueError(t)
def rhs(id):
 root=E.fromstring(rows[id]['math']);cs=list(root[0]);eq=[i for i,n in enumerate(cs) if tag(n)=='mo' and n.text=='='];assert eq,id
 temp=E.Element('mrow');temp.extend(cs[eq[-1]+1:]);return numeric(temp)
checks=[]
for cid,c in oracle.items():
 expected_paths={''.join(p['ids']):p for p in c['paths']}
 for pid,p in expected_paths.items():
  if cid=='example-max':
   # max rows are comparison and result, inspect actual ID then numeric final.
   ids=[id for id in rows if id.startswith(cid+'-'+pid+'-')]
   final=cid+'-'+pid+'-add'
  else:final=cid+'-'+pid+'-div'
  assert rhs(final)==F(p['statistic_value']),(cid,pid,final)
  checks.append(final)
  if cid!='example-max':
   for stage in ('sub','add'):
    lid=cid+'-'+pid+'-'+stage;assert rhs(lid)==F(p['statistic_value']),lid;checks.append(lid)
 assert rhs(cid+'-weight')==F(c['paths'][0]['probability']),cid;checks.append(cid+'-weight')
 # Actual authored data group quantities versus independent oracle, and actual DOM final line.
 for i,g in enumerate(c['distribution']):
  a=actual[cid]['distribution'][i]
  assert F(a['value']['numerator'],a['value']['denominator'])==F(g['value'])
  assert F(a['probability']['numerator'],a['probability']['denominator'])==F(g['probability'])
  assert set(a['pathIds'])=={''.join(p) for p in g['path_ids']}
  lid=cid+'-group-'+str(i);assert rhs(lid)==F(g['probability']);checks.append(lid)
  pathrow=rows[lid+'-paths']['text'];assert all(''.join(p) in pathrow for p in g['path_ids'])
for cid,prefix in [('duplicates','q4-b'),('repair-equal','repair-equal-q'),('repair-reverse','repair-reverse-q'),('repair-weight','repair-weight-q')]:
 e=oracle[cid]['event'];lid=prefix+'-event-answer';assert rhs(lid)==F(e['probability']);checks.append(lid)
 for s in ('sub','common','joined','num'):
  lid=prefix+'-event-'+s;assert rhs(lid)==F(e['probability']);checks.append(lid)
out={'status':'PASS numeric equality only; semantic rationale mismatches separately rejected','actual_source':'MathML serialized from final assembled HTML by own jsdom script','numeric_lines_compared':len(checks),'line_ids':checks,'cases':8,'identity_paths':55,'pmf_groups':29,'limitations':'Does not treat equivalent repeated rows as valid teaching transformations.'};(R/'correction-education-dom-math-results.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps(out,ensure_ascii=False)[:400])
