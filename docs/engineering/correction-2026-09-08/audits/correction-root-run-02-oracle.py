"""Independent expectations from the run-02 written problem contract, not author data/code."""
from fractions import Fraction
from itertools import product, permutations
from collections import defaultdict
from pathlib import Path
import json

CASES = [
    ('main-wr-mean-v1', [('A',1),('B',5),('C',9)], True, 'mean'),
    ('main-wo-mean-v1', [('A',1),('B',5),('C',9)], False, 'mean'),
    ('task-wr-mean-v1', [('D',2),('E',2),('F',8)], True, 'mean'),
    ('task-wo-mean-v1', [('D',2),('E',2),('F',8)], False, 'mean'),
    ('example-maximum', [('L',0),('M',2)], True, 'maximum'),
    ('q4-maximum', [('G',1),('H',5),('J',9)], True, 'maximum'),
]

def exact(v):
    return str(Fraction(v))

def run():
    cases=[]
    for key, units, replacement, statistic in CASES:
        draws=list(product(units,repeat=2) if replacement else permutations(units,2))
        first=Fraction(1,len(units)); second=Fraction(1,len(units) if replacement else len(units)-1)
        weight=first*second
        groups=defaultdict(list);paths=[]
        for (a,x),(b,y) in draws:
            value=Fraction(x+y,2) if statistic=='mean' else Fraction(max(x,y))
            path=a+b; groups[value].append(path)
            paths.append({'path':path,'x1':exact(x),'x2':exact(y),'statistic':exact(value),'weight':exact(weight)})
        distribution=[{'value':exact(value),'paths':ids,'probability':exact(sum((weight for _ in ids),Fraction()))} for value,ids in sorted(groups.items())]
        assert sum((Fraction(x['probability']) for x in distribution),Fraction())==1
        cases.append({'conditionKey':key,'replacement':replacement,'statistic':statistic,'paths':paths,'distribution':distribution})
    expected={c['conditionKey']:{x['value']:x['probability'] for x in c['distribution']} for c in cases}
    assert expected['main-wr-mean-v1']=={'1':'1/9','3':'2/9','5':'1/3','7':'2/9','9':'1/9'}
    assert expected['main-wo-mean-v1']=={'3':'1/3','5':'1/3','7':'1/3'}
    assert expected['task-wr-mean-v1']=={'2':'4/9','5':'4/9','8':'1/9'}
    assert expected['task-wo-mean-v1']=={'2':'1/3','5':'2/3'}
    assert expected['example-maximum']=={'0':'1/4','2':'3/4'}
    assert expected['q4-maximum']=={'1':'1/9','5':'1/3','9':'5/9'}
    return {'scope':'Independent mathematical expectations from written blueprint. Does not validate any HTML or author dataset yet. Example L/M identities are oracle labels; compare observed values if author uses other IDs.','cases':cases,'pathCount':sum(len(c['paths']) for c in cases)}

if __name__=='__main__':
    out=run();p=Path(__file__).with_suffix('.json');p.write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n');print({'conditions':len(out['cases']),'paths':out['pathCount'],'identities_checked':True,'html_validated':False})
