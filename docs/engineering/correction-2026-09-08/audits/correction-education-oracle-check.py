import json,importlib.util,hashlib
from pathlib import Path
from fractions import Fraction
R=Path('reviews'); G=Path('generation/correction-run-01')
# Independently transcribed from visible final stems, before reading actual path tables.
def case(v,repl=True,stat='mean',event=None):
 d={'units':[{'id':chr(65+i),'value':x} for i,x in enumerate(v)],'sample_size':2,'replacement':repl,'statistic':stat}
 if event:d['event']=event
 return d
cases={'main-wr':case([2,4,6],event={'op':'eq','value':3}),'main-nr':case([2,4,6],False),'example-max':case([1,5],True,'maximum'),'construct':case([0,4,10],False),'duplicates':case([0,0,6],False,event={'op':'ge','value':3}),'repair-equal':case([1,5,9],event={'op':'eq','value':5}),'repair-reverse':case([1,3,7],event={'op':'eq','value':4}),'repair-weight':case([2,5,11],False,event={'op':'eq','value':'13/2'})}
p=R/'correction-education-cases.json';p.write_text(json.dumps(cases,ensure_ascii=False,indent=2));h=hashlib.sha256(p.read_bytes()).hexdigest()
s=importlib.util.spec_from_file_location('independent_oracle',R/'correction-s2-fraction-oracle.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
expected={k:m.solve_case(c) for k,c in cases.items()};(R/'correction-education-oracle-output.json').write_text(json.dumps(expected,ensure_ascii=False,indent=2))
actual=json.loads((G/'exact-math.json').read_text())['cases'];print('actual case IDs',list(actual))
def f(x):return Fraction(x['numerator'],x['denominator'])
checks=[]
for k,e in expected.items():
 a=actual[k]; ap={tuple(x['unitIds']):x for x in a['paths']};ep={tuple(x['ids']):x for x in e['paths']};assert set(ap)==set(ep),k
 for ids,p in ep.items():
  q=ap[ids];assert [f(x) for x in q['values']]==[Fraction(x) for x in p['values']];assert [f(x) for x in q['conditionalFactors']]==[Fraction(x) for x in p['conditional_factors']];assert f(q['probability'])==Fraction(p['probability']);assert f(q['statisticValue'])==Fraction(p['statistic_value'])
 # Expected grouping independently derived; inspect authored group schema separately.
 checks.append({'case':k,'paths':len(ep),'path_ids_values_factors_weights_mapping':'PASS','pmf':e['distribution'],'event':e.get('event')})
print('group sample',json.dumps(actual['main-wr'],ensure_ascii=False)[-2500:])
(R/'correction-education-oracle-comparison.json').write_text(json.dumps({'input_sha256':h,'checks':checks},ensure_ascii=False,indent=2));print('PASS independent paths',sum(x['paths'] for x in checks),'inputs hash',h)
