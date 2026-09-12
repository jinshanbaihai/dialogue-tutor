import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "plugins/dialogue-tutor/skills/dialogue-tutor"
SPEC = importlib.util.spec_from_file_location("build_lesson", SKILL / "scripts/build_lesson.py")
builder = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(builder)


def small_lesson():
    return {
        "schemaVersion": 1, "lessonId": "builder-regression", "revision": "1", "title": "生成验证",
        "mode": "olct", "objectives": [{"id": "obj", "title": "分数等值", "kind": "procedure"}],
        "sections": [{"id": "section-one", "title": "独立作答", "bodyHtml": '<p>计算四分之一。</p><div data-dt-activity="answer"></div><details id="solution"><summary>完整解答</summary><p>1÷4=0.25</p></details>', "activityIds": ["answer"]}],
        "activities": [{"id": "answer", "objectiveId": "obj", "type": "quiz", "format": "numeric", "title": "分数", "prompt": "把 1/4 写成小数。", "answer": "1/4", "explanation": "用分子除以分母。", "solutionId": "solution", "source": "web/components/quiz/QuizViewer.tsx"}],
    }


class BuilderTests(unittest.TestCase):
    def test_original_markup_roundtrips_including_svg_case(self):
        source = (SKILL / "examples/s2-source.html").read_text()
        self.assertEqual(builder.Document(source).root.render(), source)

    def test_s2_placements_and_solutions_preserve_every_worked_section(self):
        lesson = json.loads((SKILL / "examples/s2-interactive.json").read_text())
        doc = builder.Document((SKILL / "examples/s2-source.html").read_text())
        builder.validate_lesson(lesson)
        builder.wrap_solutions(doc, lesson)
        builder.place_activities(doc, lesson)
        solutions = builder.select(doc.root, "details.dt-worked-solution")
        self.assertEqual(len(solutions), 6)
        self.assertTrue(all("open" not in node.attrs for node in solutions))
        for node in solutions:
            self.assertEqual(len(builder.select(node, ".six")), 6)
        self.assertEqual(len([node for node in doc.root.descendants() if "data-dt-activity" in node.attrs]), 15)
        for part in ("q1a", "q1b", "q1c", "q2a", "q2b", "q2c"):
            heading = builder.unique(doc.root, f"#{part} > h4")
            element_children = [node for node in heading.parent.children if node.tag]
            self.assertEqual(element_children[0].tag, "h4")
            self.assertIn("data-dt-activity", element_children[1].attrs)
            self.assertEqual(element_children[2].tag, "details")

    def test_ambiguous_or_missing_anchor_fails_instead_of_silently_misplacing(self):
        doc = builder.Document("<main><p>A</p><p>B</p></main>")
        with self.assertRaisesRegex(builder.LessonError, "matched 2"):
            builder.unique(doc.root, "p")
        with self.assertRaisesRegex(builder.LessonError, "matched 0"):
            builder.unique(doc.root, "#missing")

    def test_duplicate_identity_and_invalid_open_grading_are_rejected(self):
        lesson = small_lesson()
        lesson["activities"].append(copy.deepcopy(lesson["activities"][0]))
        with self.assertRaisesRegex(builder.LessonError, "Duplicate activity"):
            builder.validate_lesson(lesson)
        lesson = small_lesson()
        lesson["activities"][0]["format"] = "open"
        lesson["activities"][0]["modelAnswer"] = "解释"
        with self.assertRaisesRegex(builder.LessonError, "rubric"):
            builder.validate_lesson(lesson)

    def test_embedded_mount_preserves_problem_activity_solution_order(self):
        result = builder.assemble(small_lesson())
        doc = builder.Document(result)
        section = builder.unique(doc.root, "#section-one")
        children = [node for node in section.children if node.tag]
        self.assertEqual([node.tag for node in children], ["h2", "p", "div", "details"])
        self.assertEqual(sum(node.attrs.get("data-dt-activity") == "answer" for node in doc.root.descendants()), 1)

    def test_duplicate_mount_and_unknown_activity_type_are_rejected(self):
        lesson = small_lesson()
        lesson["sections"][0]["bodyHtml"] += '<div data-dt-activity="answer"></div>'
        with self.assertRaisesRegex(builder.LessonError, "exactly one mount"):
            builder.assemble(lesson)
        lesson = small_lesson()
        lesson["activities"][0]["type"] = "not-implemented"
        with self.assertRaisesRegex(builder.LessonError, "type is not supported"):
            builder.validate_lesson(lesson)

    def test_reserved_runtime_names_and_document_id_collisions_fail_before_generation(self):
        for name in ("constructor", "prototype"):
            lesson = small_lesson()
            lesson["objectives"][0]["id"] = name
            lesson["activities"][0]["objectiveId"] = name
            with self.assertRaisesRegex(builder.LessonError, "reserved runtime name"):
                builder.assemble(lesson)
        for name in ("dt-lesson", "dt-runtime", "dt-runtime-style", "dt-activity-answer", "solution"):
            lesson = small_lesson()
            lesson["sections"][0]["id"] = name
            with self.assertRaisesRegex(builder.LessonError, "Duplicate or reserved DOM ID"):
                builder.assemble(lesson)

    def test_json_content_cannot_close_the_data_script(self):
        lesson = small_lesson()
        lesson["activities"][0]["prompt"] = '按原文解释 </script><p id="accidental-markup">内容</p>'
        result = builder.assemble(lesson)
        doc = builder.Document(result)
        data = builder.unique(doc.root, "#dt-lesson")
        recovered = json.loads("".join(node.raw for node in data.children))
        self.assertEqual(recovered["activities"][0]["prompt"], lesson["activities"][0]["prompt"])
        self.assertFalse(builder.select(doc.root, "#accidental-markup"))

    def test_tts_answer_track_is_separate_and_activity_linked(self):
        lesson = small_lesson()
        lesson["tts"] = {"segments": [
            {"id": "intro", "kind": "narration", "text": "这一节学习等值表达。"},
            {"id": "question", "kind": "activity", "activityId": "answer", "text": "先填写小数。"},
            {"id": "reference", "kind": "feedback", "activityId": "answer", "text": "参考结果为零点二五。"},
        ]}
        builder.validate_lesson(lesson)
        with tempfile.TemporaryDirectory() as temp:
            paths = builder.write_tts(lesson, Path(temp) / "lesson.html")
            self.assertEqual(len(paths), 3)
            self.assertNotIn("零点二五", paths[0].read_text())
            self.assertIn("暂停伴读", paths[0].read_text())
            self.assertIn("[answer]", paths[1].read_text())
            self.assertIn("零点二五", paths[1].read_text())
        lesson["tts"]["segments"][1]["activityId"] = "not-present"
        with self.assertRaisesRegex(builder.LessonError, "valid activityId"):
            builder.validate_lesson(lesson)

    def test_numeric_references_are_finite_and_support_equivalent_fractions(self):
        for value in ("1/8", "3/256", "−1.4", "2.6", "2e-3"):
            self.assertTrue(builder.finite_numeric(value), value)
        for value in ("1/0", float("nan"), True, "__import__('os')", "1+1"):
            self.assertFalse(builder.finite_numeric(value), value)

    def test_speech_text_overrides_validate_without_requiring_tts_tracks(self):
        lesson = small_lesson()
        lesson["activities"][0]["speechText"] = "把四分之一写成小数。"
        result = builder.assemble(lesson)
        self.assertIn("speechText", result)
        self.assertNotIn("tts", lesson)
        for invalid in ("", "  ", None, 1, {"answer": "hidden"}):
            lesson["activities"][0]["speechText"] = invalid
            with self.assertRaisesRegex(builder.LessonError, "speechText must be nonempty text"):
                builder.validate_lesson(lesson)
        lesson = json.loads((SKILL / "examples/s2-interactive.json").read_text())
        for activity in lesson["activities"]:
            for field in ("choices", "cards", "steps"):
                for item in activity.get(field, []):
                    item["speechText"] = "公式的口语读法"
        builder.validate_lesson(lesson)
        for field in ("choices", "cards", "steps"):
            example = copy.deepcopy(lesson)
            activity = next(a for a in example["activities"] if a.get(field))
            activity[field][0]["speechText"] = None
            with self.assertRaisesRegex(builder.LessonError, "speechText must be nonempty text"):
                builder.validate_lesson(example)

    def test_new_document_theme_has_matching_light_dark_variables(self):
        self.assertIn("--paper:#f5f5f7", builder.BASE_CSS)
        light, dark = builder.BASE_CSS.split("@media(prefers-color-scheme:dark)")
        for variable in ("paper", "surface", "ink", "muted", "line", "accent"):
            self.assertIn("--" + variable + ":", light)
            self.assertIn("--" + variable + ":", dark)
        self.assertNotIn("#faf8f2", builder.BASE_CSS)

    def test_external_sources_require_public_https_attribution_not_a_fictional_code_path(self):
        lesson = small_lesson()
        for source in (
            {"name": "Brilliant", "url": "https://blog.brilliant.org/solving-equations/", "case": "独立改编的天平建构"},
            {"repository": "HKUDS/DeepTutor", "path": "web/components/quiz/QuizViewer.tsx", "commit": "abc", "case": "quiz"},
            {"path": "web/components/quiz/QuizViewer.tsx"},
            "web/components/quiz/QuizViewer.tsx",
        ):
            lesson["activities"][0]["source"] = source
            builder.validate_lesson(lesson)
        for source in (
            {"name": "Brilliant"},
            {"name": "", "url": "https://brilliant.org/"},
            {"name": "Brilliant", "url": "http://brilliant.org/"},
            {"name": "Brilliant", "url": "https:///"},
            {"name": "Brilliant", "url": "https://brilliant.org/", "path": "web/fake.tsx"},
            {"repository": "Brilliant", "path": "web/fake.tsx"},
        ):
            lesson["activities"][0]["source"] = source
            with self.assertRaises(builder.LessonError):
                builder.validate_lesson(lesson)


if __name__ == "__main__":
    unittest.main()
