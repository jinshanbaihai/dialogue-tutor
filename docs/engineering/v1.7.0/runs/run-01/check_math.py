#!/usr/bin/env python3
"""Independent exact enumeration of the authored examples and assessment keys."""
from collections import Counter
from fractions import Fraction
from itertools import product, permutations
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
lesson = json.loads((ROOT/'lesson.json').read_text())
activities = {a['id']: a for a in lesson['activities']}
results = []

def distribution(values, n, statistic, replacement=True):
    identities = range(len(values))
    samples = list(product(identities, repeat=n) if replacement else permutations(identities, n))
    counts = Counter(statistic([values[i] for i in ids]) for ids in samples)
    probabilities = {key: Fraction(value,len(samples)) for key,value in counts.items()}
    assert sum(probabilities.values()) == 1
    return samples, probabilities

def record(name, values, n, statistic_name, statistic, expected, replacement=True, answer_id=None, event=None):
    samples, probabilities = distribution(values,n,statistic,replacement)
    assert probabilities == expected, (name,probabilities,expected)
    if answer_id:
        answer = sum((prob for value,prob in probabilities.items() if event(value)), Fraction(0))
        assert answer == Fraction(str(activities[answer_id]['answer']))
    results.append({'name':name,'values':values,'n':n,'sampling':'uniform ordered labelled units with replacement and independent' if replacement else 'uniform ordered labelled units without replacement','statistic':statistic_name,'basicOutcomes':len(samples),'distribution':{str(k):str(v) for k,v in sorted(probabilities.items())},'answerActivity':answer_id,'result':'PASS'})

mean=lambda xs:Fraction(sum(xs),len(xs))
for n in (1,2,3):
    for replacement in (True,False):
        _, probs = distribution([1,3,5],n,mean,replacement)
        centre = probs.get(Fraction(3),Fraction(0)); edge=probs.get(Fraction(1),Fraction(0))
        expected_pairs={(1,True):(Fraction(1,3),Fraction(1,3)),(1,False):(Fraction(1,3),Fraction(1,3)),(2,True):(Fraction(1,3),Fraction(1,9)),(2,False):(Fraction(1,3),Fraction(0)),(3,True):(Fraction(7,27),Fraction(1,27)),(3,False):(Fraction(1),Fraction(0))}
        assert (centre,edge)==expected_pairs[(n,replacement)]
        record('opening n='+str(n)+' replacement='+str(replacement),[1,3,5],n,'sample mean',mean,probs,replacement)

record('worked example',[2,8],2,'sample mean',mean,{Fraction(2):Fraction(1,4),Fraction(5):Fraction(1,2),Fraction(8):Fraction(1,4)})
record('completion',[1,3,4],2,'sample mean',mean,{Fraction(1):Fraction(1,9),Fraction(2):Fraction(2,9),Fraction(5,2):Fraction(2,9),Fraction(3):Fraction(1,9),Fraction(7,2):Fraction(2,9),Fraction(4):Fraction(1,9)},answer_id='mean-completion',event=lambda t:t==Fraction(7,2))
record('independent event',[0,4,10],2,'sample mean',mean,{Fraction(0):Fraction(1,9),Fraction(2):Fraction(2,9),Fraction(4):Fraction(1,9),Fraction(5):Fraction(2,9),Fraction(7):Fraction(2,9),Fraction(10):Fraction(1,9)},answer_id='mean-independent',event=lambda t:t>=5)
record('maximum distribution',[1,3,7],2,'sample maximum',max,{1:Fraction(1,9),3:Fraction(1,3),7:Fraction(5,9)})
record('no replacement transfer',[2,4,10],2,'sample maximum',max,{4:Fraction(1,3),10:Fraction(2,3)},replacement=False,answer_id='mechanism-transfer',event=lambda t:t==10)
record('repeated values transfer',[1,1,1,5],2,'sample range',lambda xs:max(xs)-min(xs),{0:Fraction(5,8),4:Fraction(3,8)},answer_id='repeated-values',event=lambda t:t!=0)
assert sum(Fraction(t)*p for t,p in {2:Fraction(1,4),5:Fraction(1,2),8:Fraction(1,4)}.items())==5
assert len(activities)==17 and len(lesson['objectives'])==6
for activity in activities.values():
    if activity['type']=='quiz' and activity['format']=='choice':
        assert sum(c['id']==activity['answer'] for c in activity['choices'])==1
    if activity['type']=='quiz' and activity['format']=='open':
        assert activity.get('modelAnswer') and activity.get('rubric')
for pathway in lesson['pathways']:
    assert pathway['from'] in activities and pathway['to'] in activities
report={'exactEnumerationCases':results,'meanExpectationCheck':'5 minutes, matches the stated two-point population mean','numericalKeys':['mean-completion=2/9','mean-independent=5/9','mechanism-transfer=2/3','repeated-values=3/8'],'conceptualManualChecks':['Population/sample/unit/frame are separate objects and coverage direction is not invented.','Unknown population mean is explicitly unknown in statistic questions.','Census removes sampling variation from sampling a subset, not measurement/recording errors.','Finite simulation frequency is separate from theoretical probability.'],'status':'PASS'}
(ROOT/'math-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'PASS','enumerationCases':len(results),'numericalKeys':report['numericalKeys']}))
