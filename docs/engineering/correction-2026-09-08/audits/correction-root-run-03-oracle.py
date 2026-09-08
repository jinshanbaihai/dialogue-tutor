"""Independent fixed-problem arithmetic; author data is only the comparison target."""
from fractions import Fraction as F
from itertools import product
from collections import defaultdict
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'generation/correction-run-03/exact-data.json'
author=json.loads(source.read_text())
# Independently transcribed from the reviewed question contract, never from author judge.
problems=[('mean',[('A',2),('B',6),('C',10)],'mean',['wr','wor']),('max',[('R',1),('S',1),('T',5)],'maximum',['wr','wor']),('range',[('D',0),('E',3),('F',9)],'range',['wr']),('shelf',[('J',2),('K',5),('L',9)],'mean',['wor'])]
q=lambda x:F(x['n'],x['d'])
records=[];cases=[]; failures=[]
def check(ok,label):
 if not ok: failures.append(label)
for name,units,stat,mechanisms in problems:
 dataset=next(d for d in author['datasets'] if d['id']==name)
 check([(x['id'],q(x['value'])) for x in dataset['units']]==units,name+' units')
 for mechanism in mechanisms:
  observed=dataset['conditions'][mechanism]; paths={x['id']:x for x in observed['paths']}; distribution=defaultdict(F);preimages=defaultdict(list)
  for (i,x),(j,y) in product(units,repeat=2):
   ident=i+j;allowed=mechanism=='wr' or i!=j
   first=F(1,3);second=F(1,3) if mechanism=='wr' else F(0) if i==j else F(1,2)
   weight=first*second
   value=F(x+y,2) if stat=='mean' else F(max(x,y)) if stat=='maximum' else F(abs(x-y))
   p=paths[ident]
   check(p['allowed']==allowed,f'{name}/{mechanism}/{ident} allowed')
   check((q(p['x1']),q(p['x2']),q(p['stat']),q(p['weight']))==(x,y,value,weight),f'{name}/{mechanism}/{ident} values')
   records.append(dict(dataset=name,condition=mechanism,path=ident,x1=x,x2=y,statistic=str(value),first=str(first),second=str(second),weight=str(weight),allowed=allowed))
   if allowed: distribution[value]+=weight;preimages[value].append(ident)
  check(len(paths)==9,f'{name}/{mechanism} candidate coverage')
  check(observed['pathCount']==(9 if mechanism=='wr' else 6),f'{name}/{mechanism} allowed count')
  check(sum(distribution.values())==1,f'{name}/{mechanism} mass')
  bars={q(b['value']):b for b in observed['bars']}
  check(set(bars)==set(distribution),f'{name}/{mechanism} support')
  for value,probability in distribution.items():
   check(q(bars[value]['probability'])==probability,f'{name}/{mechanism}/{value} probability')
   check(bars[value]['pathIds']==preimages[value],f'{name}/{mechanism}/{value} preimages')
  cases.append(dict(dataset=name,condition=mechanism,distribution={str(k):str(v) for k,v in sorted(distribution.items())},preimages={str(k):v for k,v in sorted(preimages.items())}))
check(F(1,3)>F(2,9),'opening wr greater')
check(F(1,3)==F(1,3),'opening wor equal')
result=dict(scope='Root independent arithmetic against exact-data only; no DOM/course approval',authorDataSha256=hashlib.sha256(source.read_bytes()).hexdigest(),cases=cases,paths=records,pathRecords=len(records),q4={'singleGroupMeanAtLeast7':'1/3','twoIndependentGroups':'1/9','requires':'independent groups; replacement alone is insufficient'},failures=failures,passed=not failures)
(ROOT/'reviews/correction-root-run-03-oracle.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['paths','cases']},ensure_ascii=False))
assert not failures
