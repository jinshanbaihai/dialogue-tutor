"""Independent exact enumeration of the run-03 blueprint's finite populations.

This reads no author implementation or reference answers. It creates expected
values for later comparison with the frozen HTML; it is not an HTML pass.
"""
from collections import Counter
from fractions import Fraction
from itertools import product, permutations
from pathlib import Path
import json


def distribution(values, n, replacement, statistic):
    indices = product(range(len(values)), repeat=n) if replacement else permutations(range(len(values)), n)
    counts = Counter(statistic(tuple(values[i] for i in row)) for row in indices)
    total = sum(counts.values())
    return {value: Fraction(count, total) for value, count in sorted(counts.items())}


def mean(row):
    return Fraction(sum(row), len(row))


def serial(dist):
    assert sum(dist.values()) == 1
    return [{'value': str(value), 'probability': str(prob)} for value, prob in dist.items()]


results = {'status': 'independent expected values; compare with frozen artifact separately', 'laboratory': []}
for n, replacement, threshold in product((1, 2), (True, False), (5, 6, 8)):
    dist = distribution((2, 4, 8), n, replacement, mean)
    event = sum((p for x, p in dist.items() if x >= threshold), Fraction(0))
    baseline = Fraction(sum(x >= threshold for x in (2, 4, 8)), 3)
    results['laboratory'].append({'n': n, 'replacement': replacement, 'threshold': threshold,
        'distribution': serial(dist), 'event': str(event), 'single_card_event': str(baseline),
        'relation': 'equal' if event == baseline else 'greater' if event > baseline else 'less'})
results['worked'] = serial(distribution((1, 7), 2, True, mean))
complete = distribution((0, 3, 6), 2, True, mean)
results['completion'] = {'distribution': serial(complete), 'mean_equals_three': str(complete[Fraction(3)])}
results['independent_maximum'] = serial(distribution((1, 4, 9), 2, True, max))
ranges = distribution((2, 5, 10), 2, True, lambda row: max(row) - min(row))
results['range_transfer'] = {'distribution': serial(ranges), 'range_at_least_five': str(sum(p for r, p in ranges.items() if r >= 5))}
results['without_replacement_mean'] = serial(distribution((3, 6, 12), 2, False, mean))
out = Path(__file__).with_suffix('.json')
out.write_text(json.dumps(results, indent=2, ensure_ascii=False) + '\n')
print(json.dumps({'laboratory_cases': len(results['laboratory']), 'completion': results['completion']['mean_equals_three'], 'range_transfer': results['range_transfer']['range_at_least_five'], 'output': str(out)}))
