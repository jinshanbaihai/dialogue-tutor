from pathlib import Path
from fractions import Fraction
from itertools import product
from collections import defaultdict
import json,hashlib

p=Path('generation/correction-run-02/exact-data.json'); raw=p.read_bytes(); data=json.loads(raw)
# Fixed problem inputs from the written contract, independent of the implementation.
expected={
 'main-wr-mean-v1':([('A',1),('B',5),('C',9)],True,'mean'),
 'main-wo-mean-v1':([('A',1),('B',5),('C',9)],False,'mean'),
 'task-wr-mean-v1':([('D',2),('E',2),('F',8)],True,'mean'),
 'task-wo-mean-v1':([('D',2),('E',2),('F',8)],False,'mean'),
 'example-wr-maximum-v1':(None,True,'maximum'),
 'challenge-wr-maximum-v1':([('G',1),('H',5),('J',9)],True,'maximum'),
}
def f(x):return Fraction(x['n'],x['d'])
results=[]
assert set(data['conditions'])==set(expected)
for key,(units,wr,stat) in expected.items():
 c=data['conditions'][key];actual_units=[(u['id'],f(u['value'])) for u in c['units']]
 if units is None:
  assert sorted(x for _,x in actual_units)==[0,2]
  assert len({i for i,_ in actual_units})==2
  units=actual_units
 else:assert actual_units==units
 assert c['statistic']==stat and c['sampleSize']==2 and c['mechanism']==('wr' if wr else 'wo')
 want={};bars=defaultdict(lambda:{'paths':[],'p':Fraction()});n=len(units)
 for (a,x),(b,y) in product(units,repeat=2):
  allow=wr or a!=b
  weight=Fraction(1,n*(n if wr else n-1)) if allow else Fraction()
  value=Fraction(x+y,2) if stat=='mean' else Fraction(max(x,y))
  want[a+b]=(x,y,value,allow,weight)
  bars[value]['p']+=weight
  if allow:bars[value]['paths'].append(a+b)
 assert len(c['paths'])==len(want)
 for got in c['paths']:
  x,y,v,allow,w=want[got['id']]
  assert (f(got['x1']),f(got['x2']),f(got['stat']),got['allowed'],f(got['weight']))==(x,y,v,allow,w)
  assert f(got['firstProbability'])==Fraction(1,n)
  assert f(got['secondProbability'])==(Fraction(1,n if wr else n-1) if allow else 0)
  if stat=='mean':assert f(got['sum'])==x+y
 assert len(c['bars'])==len(bars)
 for got in c['bars']:
  wantbar=bars[f(got['value'])]
  assert f(got['probability'])==wantbar['p'] and sorted(got['pathIds'])==sorted(wantbar['paths'])
 assert sum(f(b['probability']) for b in c['bars'])==1
 results.append({'condition':key,'path_records':len(c['paths']),'allowed_paths':sum(v[3] for v in want.values()),'bars':len(c['bars']),'pass':True})
out={'dataSHA256':hashlib.sha256(raw).hexdigest(),'method':'Root independent product enumeration from fixed blueprint inputs; no author calculation functions used. Zero-weight forbidden identities retained and checked.','results':results,'html_validated':False}
Path('reviews/correction-root-run-02-data-check.json').write_text(json.dumps(out,indent=2)+'\n');print(out)
