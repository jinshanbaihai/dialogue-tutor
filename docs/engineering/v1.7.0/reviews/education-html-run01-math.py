from collections import Counter
from fractions import Fraction
from itertools import product, permutations
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
lesson = json.loads((ROOT / 'generation/run-01/lesson.json').read_text())
activities = {a['id']: a for a in lesson['activities']}

def distribution(values, n, replacement, statistic='mean'):
    indices = range(len(values))
    paths = product(indices, repeat=n) if replacement else permutations(indices, n)
    counts = Counter()
    total = 0
    for sample in paths:
        data = [values[i] for i in sample]
        t = Fraction(sum(data), n) if statistic == 'mean' else Fraction(max(data)) if statistic == 'max' else Fraction(max(data)-min(data))
        counts[t] += 1
        total += 1
    rows = [[str(t), str(counts[t]), str(Fraction(counts[t], total))] for t in sorted(counts)]
    assert sum(Fraction(row[2]) for row in rows) == 1
    return {'values': values, 'n': n, 'replacement': replacement, 'statistic': statistic, 'orderedPaths': total, 'rows': rows}

cases = []
for replacement in (True, False):
    for n in (1,2,3):
        item = distribution([1,3,5], n, replacement)
        item['id'] = f'lab-{n}-'+('replacement' if replacement else 'no-replacement')
        cases.append(item)
for activity_id, values, replacement, statistic in [
    ('mean-worked',[2,8],True,'mean'),
    ('mean-completion',[1,3,4],True,'mean'),
    ('mean-independent',[0,4,10],True,'mean'),
    ('max-distribution',[1,3,7],True,'max'),
    ('mechanism-transfer',[2,4,10],False,'max'),
    ('repeated-values',[1,1,1,5],True,'range')
]:
    item = distribution(values, 2, replacement, statistic)
    item['id'] = activity_id
    probability = None
    if activity_id == 'mean-completion': probability = sum(Fraction(r[2]) for r in item['rows'] if Fraction(r[0]) == Fraction(7,2))
    if activity_id == 'mean-independent': probability = sum(Fraction(r[2]) for r in item['rows'] if Fraction(r[0]) >= 5)
    if activity_id == 'mechanism-transfer': probability = sum(Fraction(r[2]) for r in item['rows'] if Fraction(r[0]) == 10)
    if activity_id == 'repeated-values': probability = sum(Fraction(r[2]) for r in item['rows'] if Fraction(r[0]) != 0)
    if probability is not None:
        item['independentAnswer'] = str(probability)
        item['authoredAnswer'] = activities[activity_id]['answer']
        assert probability == Fraction(item['authoredAnswer'])
    cases.append(item)
out = {'method':'Independent Python itertools enumeration with exact Fraction arithmetic; original numeric/card identities; no author validation code imported', 'cases':cases}
(ROOT/'reviews/education-html-run01-math.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'cases':len(cases),'allProbabilitiesSumToOne':True,'scoredAnswersMatch':4,'answers':{x['id']:x['independentAnswer'] for x in cases if 'independentAnswer' in x}},ensure_ascii=False))
