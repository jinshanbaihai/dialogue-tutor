"""Compare an independently prepared oracle with frozen JSON and actual DOM observations."""
import hashlib
import json
from fractions import Fraction
from pathlib import Path

root = Path(__file__).resolve().parents[1]
run = root / "generation/run-03"
review = root / "reviews"
oracle = json.loads((review / "run-03-math-oracle.json").read_text())
lesson = json.loads((run / "lesson.json").read_text())
probe = json.loads((review / "education-html-run03-probe.json").read_text())
html_hash = hashlib.sha256((run / "lesson.html").read_bytes()).hexdigest()
assert probe["sha256"] == html_hash
assert html_hash == "d9624b533e838edf4b06b974f15c07b0bb3bf653f36e4ea3b5e663c5adfe7c2c"
checks = []
actual_cases = next(c for c in probe["cases"] if c["name"].startswith("all 12 actual"))["observations"]
assert len(actual_cases) == 12
for expected in oracle["laboratory"]:
    params = {"n": expected["n"], "mechanism": "with" if expected["replacement"] else "without", "threshold": expected["threshold"]}
    actual = next(c["observation"] for c in actual_cases if c["input"] == params)
    values = {Fraction(x["value"]): Fraction(x["probability"]) for x in expected["distribution"]}
    table = {Fraction(r[0]): Fraction(r[2].split("=")[-1].strip()) for r in actual["rows"]}
    bars = {Fraction(b["label"].split()[0]): Fraction(b["probability"]) for b in actual["bars"]}
    assert table == bars == values, params
    for b in actual["bars"]:
        assert abs(float(b["width"].rstrip("%")) / 100 - float(Fraction(b["probability"]))) < 1e-12
    text = actual["comparison"]
    assert f'P(样本均值≥{expected["threshold"]})={expected["event"]}' in text
    assert {"less": "小于", "equal": "等于", "greater": "大于"}[expected["relation"]] in text
    checks.append({"parameters": params, "distribution": actual["rows"], "comparison": text, "result": "PASS"})
for activity_id, expected in (
    ("distribution-completion", oracle["completion"]["mean_equals_three"]),
    ("distribution-probability", oracle["range_transfer"]["range_at_least_five"]),
):
    actual = next(a["answer"] for a in lesson["activities"] if a["id"] == activity_id)
    assert Fraction(actual) == Fraction(expected)
    checks.append({"activityId": activity_id, "actualAnswer": actual, "expectedAnswer": expected, "result": "PASS"})
result = {
    "result": "PASS",
    "htmlSha256": html_hash,
    "lessonJsonSha256": hashlib.sha256((run / "lesson.json").read_bytes()).hexdigest(),
    "method": "Root's precomputed exact oracle compared with frozen lesson JSON and education reviewer's recorded DOM observations; no author computation imported. This comparison did not run a second browser or claim visual evidence.",
    "domObservationSource": "education-html-run03-probe.json",
    "checks": checks,
}
(review / "root-math-run-03.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"result": "PASS", "checks": len(checks), "htmlSha256": html_hash}))
