"""Independent exact oracle for run-03; no author enumerator or check outputs."""
from collections import Counter
from fractions import Fraction
from itertools import product, permutations
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'generation/run-03/lesson.json'
lesson = json.loads(SOURCE.read_text())

def enumerate_units(population, n, replacement, statistic):
    indices = (product(range(len(population)), repeat=n) if replacement
               else permutations(range(len(population)), n))
    samples = [tuple(population[i] for i in positions) for positions in indices]
    counts = Counter(statistic(sample) for sample in samples)
    probabilities = {str(value): str(Fraction(count, len(samples)))
                     for value, count in sorted(counts.items())}
    assert sum(Fraction(value) for value in probabilities.values()) == 1
    return samples, probabilities

mean = lambda values: Fraction(sum(values), len(values))
lab = []
for n, replacement, threshold in product((1, 2), (True, False), (5, 6, 8)):
    samples, distribution = enumerate_units((2, 4, 8), n, replacement, mean)
    probability = Fraction(sum(mean(sample) >= threshold for sample in samples), len(samples))
    single = Fraction(1, 3)
    lab.append({'parameters': {'n': n, 'mechanism': 'with' if replacement else 'without',
                               'threshold': threshold},
                'samples': samples, 'distribution': distribution,
                'probability': str(probability), 'single': str(single),
                'relation': 'equal' if probability == single else 'less' if probability < single else 'greater'})

cases = []
for activity_id, population, replacement, statistic, event, expected in (
    ('worked-distribution', (1, 7), True, mean, lambda x: x == 4, Fraction(1, 2)),
    ('distribution-completion', (0, 3, 6), True, mean, lambda x: x == 3, Fraction(1, 3)),
    ('distribution-independent', (1, 4, 9), True, max, lambda x: x == 9, Fraction(5, 9)),
    ('distribution-probability', (2, 5, 10), True, lambda x: max(x) - min(x), lambda x: x >= 5, Fraction(4, 9)),
    ('without-replacement', (3, 6, 12), False, mean, lambda x: x == Fraction(15, 2), Fraction(1, 3)),
):
    samples, distribution = enumerate_units(population, 2, replacement, statistic)
    probability = Fraction(sum(event(statistic(sample)) for sample in samples), len(samples))
    assert probability == expected
    activity = next(x for x in lesson['activities'] if x['id'] == activity_id)
    if activity.get('format') == 'numeric':
        assert Fraction(activity['answer']) == probability
    cases.append({'activityId': activity_id, 'samples': samples, 'distribution': distribution,
                  'eventProbability': str(probability), 'quizAnswer': activity.get('answer'),
                  'result': 'PASS'})

record = {'kind': 'Independent exact mathematics from actual question conditions; index samples and Fraction',
          'lessonSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
          'lab': lab, 'cases': cases, 'result': 'PASS'}
destination = ROOT / 'reviews/education-html-run03-math.json'
destination.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'result': record['result'], 'labConditions': len(lab), 'tasks': len(cases)}, ensure_ascii=False))
