#!/usr/bin/env python3
"""Independent exact arithmetic oracle: never imports author code."""
from itertools import product, permutations
from collections import Counter
from fractions import Fraction
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parent.parent
lesson=json.loads((ROOT/'lesson.json').read_text())
report={'method':'Independent Python Fraction arithmetic over product/permutations; no author code imported.','checks':[],'lab':[]}

def exact_distribution(values,n,replace,stat):
    sequences=list(product(values,repeat=n)) if replace else list(permutations(values,n))
    counts=Counter(stat(s) for s in sequences)
    distribution={str(v):str(Fraction(k,len(sequences))) for v,k in sorted(counts.items())}
    assert sum(Fraction(v) for v in distribution.values())==1
    assert all(Fraction(v)>0 for v in distribution.values())
    return sequences,distribution

def check(name,actual,expected,inputs):
    if actual!=expected: raise AssertionError((name,actual,expected))
    report['checks'].append({'name':name,'inputs':inputs,'actual':str(actual),'expected':str(expected),'pass':True})

for n in (1,2):
    for replacement in (True,False):
        seq,dist=exact_distribution((2,4,8),n,replacement,lambda s:Fraction(sum(s),n))
        for threshold in (5,6,8):
            probability=Fraction(sum(Fraction(sum(s),n)>=threshold for s in seq),len(seq))
            single=Fraction(sum(x>=threshold for x in (2,4,8)),3)
            relation='less' if probability<single else 'greater' if probability>single else 'equal'
            report['lab'].append({'parameters':{'n':n,'mechanism':'with' if replacement else 'without','threshold':threshold},'distribution':dist,'probability':str(probability),'singleProbability':str(single),'relation':relation,'orderedSamples':[list(s) for s in seq]})

_,worked=exact_distribution((1,7),2,True,lambda s:Fraction(sum(s),2))
check('worked distribution',worked,{'1':'1/4','4':'1/2','7':'1/4'},[1,7])
_,comp=exact_distribution((0,3,6),2,True,lambda s:Fraction(sum(s),2))
check('completion answer',Fraction(comp['3']),Fraction(1,3),[0,3,6])
_,maximum=exact_distribution((1,4,9),2,True,max)
check('independent maximum distribution',maximum,{'1':'1/9','4':'1/3','9':'5/9'},[1,4,9])
seq,spread=exact_distribution((2,5,10),2,True,lambda s:max(s)-min(s))
check('range distribution',spread,{'0':'1/3','3':'2/9','5':'2/9','8':'2/9'},[2,5,10])
check('range tail probability',sum(Fraction(v) for k,v in spread.items() if Fraction(k)>=5),Fraction(4,9),[2,5,10])
_,without=exact_distribution((3,6,12),2,False,lambda s:Fraction(sum(s),2))
check('without replacement distribution',without,{'9/2':'1/3','15/2':'1/3','9':'1/3'},[3,6,12])
answers={a['id']:a.get('answer') for a in lesson['activities']}
check('JSON numeric completion',Fraction(answers['distribution-completion']),Fraction(1,3),'lesson.json')
check('JSON numeric transfer',Fraction(answers['distribution-probability']),Fraction(4,9),'lesson.json')
check('default lab tail',Fraction(report['lab'][6]['probability']),Fraction(5,9),'n=2 with replacement threshold=5')
assert {'less','equal','greater'} <= {r['relation'] for r in report['lab']}
report['status']='PASS'
(ROOT/'records/math-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'exactChecks':len(report['checks']),'labConditions':len(report['lab'])},ensure_ascii=False))
