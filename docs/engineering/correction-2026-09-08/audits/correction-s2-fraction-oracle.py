"""Independent finite-population sampling oracle; no lesson/runtime imports.

Input rationals are integers or strings, never binary floats.
CLI: python correction-s2-fraction-oracle.py --case case.json
     python correction-s2-fraction-oracle.py --self-test
This validator's fixture data are not prescribed lesson questions.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
from fractions import Fraction
from itertools import permutations, product
from math import factorial
import json
from pathlib import Path


def rational(value):
    if type(value) not in (int, str, Fraction):
        raise ValueError("rational must be int, str, or Fraction; floats/bools rejected")
    return Fraction(value)


def encode(value):
    value = rational(value)
    return f"{value.numerator}/{value.denominator}"


def normalize_units(units):
    if not isinstance(units, list) or not units:
        raise ValueError("units must be a non-empty list")
    result = {}
    for unit in units:
        if not isinstance(unit, dict) or set(unit) != {"id", "value"}:
            raise ValueError("each unit needs exactly id and value")
        uid = unit["id"]
        if not isinstance(uid, str) or not uid or uid in result:
            raise ValueError("unit IDs must be distinct non-empty strings")
        result[uid] = rational(unit["value"])
    return result


def enumerate_paths(units, sample_size, replacement, max_paths=100_000):
    """Uniform independent draws if replacement; uniform remaining IDs otherwise."""
    mapping = normalize_units(units)
    N = len(mapping)
    if type(sample_size) is not int or sample_size < 1:
        raise ValueError("sample_size must be a positive integer")
    if type(replacement) is not bool:
        raise ValueError("replacement must be boolean")
    if not replacement and sample_size > N:
        raise ValueError("cannot draw more than N units without replacement")
    if type(max_paths) is not int or max_paths < 1:
        raise ValueError("max_paths must be a positive integer")
    count = N ** sample_size if replacement else factorial(N) // factorial(N - sample_size)
    if count > max_paths:
        raise ValueError("exact enumeration budget exceeded; no simulation fallback")
    ids = tuple(mapping)
    candidates = product(ids, repeat=sample_size) if replacement else permutations(ids, sample_size)
    rows = []
    for path in candidates:
        available = set(ids)
        factors = []
        weight = Fraction(1)
        for uid in path:
            factor = Fraction(1, N if replacement else len(available))
            factors.append(factor)
            weight *= factor
            if not replacement:
                available.remove(uid)
        rows.append({"ids": path, "values": tuple(mapping[uid] for uid in path),
                     "factors": tuple(factors), "probability": weight})
    if len(rows) != count or sum((r["probability"] for r in rows), Fraction(0)) != 1:
        raise AssertionError("sample-space invariant failed")
    return rows


def statistic(name, values):
    """Reference definitions. Extra names do not imply syllabus requirements."""
    if name == "mean":
        return sum(values, Fraction(0)) / len(values)
    if name == "sum":
        return sum(values, Fraction(0))
    if name == "minimum":
        return min(values)
    if name == "maximum":
        return max(values)
    if name == "range":
        return max(values) - min(values)
    if name == "first":
        return values[0]
    if name == "median":
        ordered = sorted(values)
        m = len(ordered) // 2
        return ordered[m] if len(ordered) % 2 else (ordered[m - 1] + ordered[m]) / 2
    raise ValueError(f"unregistered statistic: {name}")


def distribution(rows, statistic_fn):
    """statistic_fn receives sample values only; reviewer supplies it independently."""
    masses = defaultdict(Fraction)
    members = defaultdict(list)
    for row in rows:
        value = rational(statistic_fn(row["values"]))
        masses[value] += row["probability"]
        members[value].append(row["ids"])
    if sum(masses.values(), Fraction(0)) != 1 or any(p <= 0 for p in masses.values()):
        raise AssertionError("distribution invariant failed")
    return dict(sorted(masses.items())), dict(members)


def event_accepts(value, event):
    if not isinstance(event, dict) or set(event) != {"op", "value"}:
        raise ValueError("event needs exactly op and value")
    threshold = rational(event["value"])
    comparisons = {"eq": value == threshold, "ne": value != threshold,
                   "lt": value < threshold, "le": value <= threshold,
                   "gt": value > threshold, "ge": value >= threshold}
    if event["op"] not in comparisons:
        raise ValueError("unknown event operator")
    return comparisons[event["op"]]


def solve_case(case):
    required = {"units", "sample_size", "replacement", "statistic"}
    if not required <= set(case) or set(case) - required - {"event", "max_paths"}:
        raise ValueError("unknown/missing case fields")
    rows = enumerate_paths(case["units"], case["sample_size"], case["replacement"],
                           case.get("max_paths", 100_000))
    fn = lambda values: statistic(case["statistic"], values)
    pmf, members = distribution(rows, fn)
    result = {
        "model": "uniform_by_unit_identity",
        "sample_size": case["sample_size"],
        "replacement": case["replacement"],
        "statistic": case["statistic"],
        "path_count": len(rows),
        "paths": [{"ids": list(r["ids"]), "values": [encode(v) for v in r["values"]],
                   "conditional_factors": [encode(p) for p in r["factors"]],
                   "probability": encode(r["probability"]), "statistic_value": encode(fn(r["values"]))}
                  for r in rows],
        "distribution": [{"value": encode(v), "probability": encode(p),
                          "path_ids": [list(path) for path in members[v]]} for v, p in pmf.items()],
        "total_probability": encode(sum(pmf.values(), Fraction(0))),
    }
    if "event" in case:
        selected = [r for r in rows if event_accepts(fn(r["values"]), case["event"])]
        direct = sum((r["probability"] for r in selected), Fraction(0))
        grouped = sum((p for v, p in pmf.items() if event_accepts(v, case["event"])), Fraction(0))
        if direct != grouped:
            raise AssertionError("path/group event probabilities disagree")
        result["event"] = {**case["event"], "value": encode(case["event"]["value"]),
                           "probability": encode(direct),
                           "path_ids": [list(r["ids"]) for r in selected]}
    return result


def self_test():
    """Synthetic validator fixtures; not authoring requirements or course assessment."""
    units = [{"id": "uA", "value": "0"}, {"id": "uB", "value": "0"},
             {"id": "uC", "value": "6"}]
    checks = []

    def check(name, condition):
        if not condition:
            raise AssertionError(name)
        checks.append(name)

    def masses(us, n, repl, stat="mean"):
        return distribution(enumerate_paths(us, n, repl), lambda xs: statistic(stat, xs))[0]

    check("duplicate values retain nine identity paths", len(enumerate_paths(units, 2, True)) == 9)
    check("replacement multiplicities", masses(units, 2, True) == {Fraction(0): Fraction(4, 9), Fraction(3): Fraction(4, 9), Fraction(6): Fraction(1, 9)})
    check("no replacement permits equal observed values", masses(units, 2, False) == {Fraction(0): Fraction(1, 3), Fraction(3): Fraction(2, 3)})
    check("n=1 distribution ignores replacement toggle", masses(units, 1, False) == masses(units, 1, True))
    check("full census mean is degenerate", masses(units, 3, False) == {Fraction(2): Fraction(1)})
    equal = [{"id": str(i), "value": "5/7"} for i in range(3)]
    check("all equal values still distinct units", len(enumerate_paths(equal, 2, False)) == 6 and masses(equal, 2, False) == {Fraction(5, 7): Fraction(1)})
    check("population reorder invariance", masses(list(reversed(units)), 2, True) == masses(units, 2, True))
    base = solve_case({"units": units, "sample_size": 2, "replacement": True,
                       "statistic": "mean", "event": {"op": "ge", "value": "3"}})
    check("event boundary included exactly", base["event"]["probability"] == "5/9")
    shifted = [{**u, "value": encode(rational(u["value"]) + Fraction(2, 3))} for u in units]
    expected = {v + Fraction(2, 3): p for v, p in masses(units, 2, True).items()}
    check("rational translation covariance of mean", masses(shifted, 2, True) == expected)
    for name, fn in [
        ("reject duplicate IDs", lambda: enumerate_paths([units[0], units[0]], 1, True)),
        ("reject float values", lambda: enumerate_paths([{"id": "a", "value": 0.1}], 1, True)),
        ("reject impossible sample size", lambda: enumerate_paths(units, 4, False)),
        ("reject non-boolean replacement", lambda: enumerate_paths(units, 2, "false")),
        ("reject silent enumeration truncation", lambda: enumerate_paths(units, 2, True, 8)),
    ]:
        try:
            fn()
        except ValueError:
            checks.append(name)
        else:
            raise AssertionError(name)
    return {"status": "passed", "checks": len(checks), "passed": checks,
            "scope": "oracle self-tests only; no authored lesson evaluated"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--case", type=Path)
    group.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    output = self_test() if args.self_test else solve_case(json.loads(args.case.read_text()))
    print(json.dumps(output, ensure_ascii=False, indent=2))
