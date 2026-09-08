import json,re,xml.etree.ElementTree as ET
from fractions import Fraction as F
R='reviews/correction-education-run-02-'
rows={r['id']:r for r in json.load(open(R+'dom-math.json'))};oracle=json.load(open(R+'oracle-results.json'));out=[]
def tag(x):return x.tag.split('}')[-1]
def value(x):
 t=tag(x)
 if t=='mn':return F(x.text)
 if t=='mfrac':return value(x[0])/value(x[1])
 return seq(list(x))
def seq(xs):
 if len(xs)==1:return value(xs[0])
 if ''.join(xs[0].itertext())=='max':return max(value(x) for x in xs if tag(x) not in ['mo','mi'])
 vals=[];ops=[]
 for x in xs:
  if tag(x)=='mo':ops.append(x.text)
  else:vals.append(value(x))
 assert len(vals)==len(ops)+1,(vals,ops)
 v=vals[0]
 for op,n in zip(ops,vals[1:]):
  assert op in ['+','×','−'],op
  v=v+n if op=='+' else v*n if op=='×' else v-n
 return v
def rhs(row):
 root=ET.fromstring(row['math']);xs=list(root[0]);eq=[i for i,x in enumerate(xs) if tag(x)=='mo' and x.text=='='];return seq(xs[eq[-1]+1:])
for k,e in oracle.items():
 prefix=k.split('-mean-v1')[0].split('-maximum-v1')[0]
 for p in e['paths']:
  path=''.join(p['ids']);base=prefix+'-'+path
  tails=['sub','result']+(['sum'] if 'mean' in k else [])
  for tail in tails+['weight-sub','weight-product','weight-numerator','weight']:
   id=base+'-'+tail;expected=F(p['probability'] if tail.startswith('weight') else p['statistic_value']);actual=rhs(rows[id]);out.append({'id':id,'expected':str(expected),'actual':str(actual),'pass':actual==expected})
 for b in e['distribution']:
  id=prefix+'-bar-'+str(F(b['value']));actual=rhs(rows[id]);expected=F(b['probability']);out.append({'id':id,'expected':str(expected),'actual':str(actual),'pass':actual==expected})
json.dump({'checks':out,'count':len(out),'failures':[x for x in out if not x['pass']]},open(R+'dom-math-results.json','w'),indent=2)
print(len(out),'checks;',sum(not x['pass'] for x in out),'failures')
