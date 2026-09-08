import json,hashlib,importlib.util
from pathlib import Path
from fractions import Fraction as F
R=Path('reviews');G=Path('generation/correction-run-02')
# Transcribed from final visible opening, E3, Q3(a/b), Q4 stems, not author functions.
def make(ids,vals,repl,stat='mean',event=None):
 d={'units':[{'id':i,'value':v} for i,v in zip(ids,vals)],'sample_size':2,'replacement':repl,'statistic':stat}
 if event:d['event']=event
 return d
cases={'main-wr-mean-v1':make('ABC',[1,5,9],True),'main-wo-mean-v1':make('ABC',[1,5,9],False),'task-wr-mean-v1':make('DEF',[2,2,8],True),'task-wo-mean-v1':make('DEF',[2,2,8],False),'example-wr-maximum-v1':make('KL',[0,2],True,'maximum'),'challenge-wr-maximum-v1':make('GHJ',[1,5,9],True,'maximum',{'op':'eq','value':5})}
p=R/'correction-education-run-02-cases.json';p.write_text(json.dumps(cases,ensure_ascii=False,indent=2));h=hashlib.sha256(p.read_bytes()).hexdigest();sp=importlib.util.spec_from_file_location('oracle',R/'correction-s2-fraction-oracle.py');o=importlib.util.module_from_spec(sp);sp.loader.exec_module(o);ex={k:o.solve_case(v) for k,v in cases.items()};(R/'correction-education-run-02-oracle-results.json').write_text(json.dumps(ex,ensure_ascii=False,indent=2))
a=json.loads((G/'exact-data.json').read_text())['conditions'];checks=[]
def f(q):return F(q['n'],q['d'])
for k,e in ex.items():
 c=a[k];ap={p['id']:p for p in c['paths'] if p['allowed']};ep={''.join(p['ids']):p for p in e['paths']};assert set(ap)==set(ep),k
 for pid,p in ep.items():
  x=ap[pid];assert [f(x['x1']),f(x['x2'])]==list(map(F,p['values']));assert [f(x['firstProbability']),f(x['secondProbability'])]==list(map(F,p['conditional_factors']));assert f(x['stat'])==F(p['statistic_value']);assert f(x['weight'])==F(p['probability'])
 actual={f(b['value']):(f(b['probability']),set(b['pathIds'])) for b in c['bars'] if f(b['probability'])>0};expected={F(b['value']):(F(b['probability']),{''.join(p) for p in b['path_ids']}) for b in e['distribution']};assert actual==expected,k
 for b in c['bars']:
  if f(b['probability'])==0:assert b['pathIds']==[]
 checks.append({'condition':k,'paths':len(ap),'groups':len(actual),'status':'PASS'})
(R/'correction-education-run-02-oracle-comparison.json').write_text(json.dumps({'cases_sha256':h,'checks':checks,'scope':'Independent expected path/values/factors/weights/mapping/pmf compared with authored data. Final DOM MathML compared separately.'},ensure_ascii=False,indent=2));print(h,checks)
