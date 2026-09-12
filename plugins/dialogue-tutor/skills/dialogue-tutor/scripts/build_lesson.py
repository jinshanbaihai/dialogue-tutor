#!/usr/bin/env python3
"""Assemble a portable DialogueTutor lesson using only the Python standard library."""

from __future__ import annotations

import argparse
import html
from html.parser import HTMLParser
import json
import math
from pathlib import Path
import re
import sys

SKILL_ROOT = Path(__file__).resolve().parents[1]
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
KINDS = {"memory", "concept", "procedure", "design"}
TYPES = {"flashcards", "quiz", "steps", "explore", "interactive"}
MODES = {"bgct", "bbct", "olct", "onct"}
ID = re.compile(r"^[A-Za-z][A-Za-z0-9_-]*$")
RESERVED_NAMES = {"__proto__", "prototype", "constructor"}
RUNTIME_IDS = {"dt-lesson", "dt-runtime", "dt-runtime-style"}


class LessonError(ValueError):
    """A lesson cannot be assembled without changing its intended behavior."""


def require(ok, message):
    if not ok:
        raise LessonError(message)


def text_field(obj, key, context, required=True):
    value = obj.get(key)
    if value is None and not required:
        return
    require(isinstance(value, str) and bool(value.strip()), f"{context}.{key} must be nonempty text")


def identifier(value, context):
    require(isinstance(value, str) and ID.fullmatch(value), f"{context} must be a stable HTML-compatible ID")
    require(value not in RESERVED_NAMES, f"{context} uses a reserved runtime name: {value}")


def finite_numeric(value):
    if isinstance(value, bool):
        return False
    if isinstance(value, (int, float)):
        return math.isfinite(value)
    if not isinstance(value, str):
        return False
    number = r"[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?"
    normalized = value.strip().replace("−", "-")
    if not re.fullmatch(rf"{number}(?:\s*/\s*{number})?", normalized):
        return False
    parts = normalized.split("/")
    try:
        result = float(parts[0]) / float(parts[1]) if len(parts) == 2 else float(parts[0])
        return math.isfinite(result)
    except (ValueError, ZeroDivisionError):
        return False


def validate_lesson(lesson):
    require(isinstance(lesson, dict), "Lesson must be a JSON object")
    require(lesson.get("schemaVersion") == 1, "schemaVersion must be 1")
    identifier(lesson.get("lessonId"), "lessonId")
    for field in ("revision", "title"):
        text_field(lesson, field, "lesson")
    require(lesson.get("mode", "bgct") in MODES, "mode must be bgct, bbct, olct or onct")
    objectives = lesson.get("objectives")
    require(isinstance(objectives, list) and objectives, "objectives must be a nonempty array")
    objective_ids = set()
    for index, objective in enumerate(objectives):
        context = f"objectives[{index}]"
        require(isinstance(objective, dict), f"{context} must be an object")
        identifier(objective.get("id"), context + ".id")
        require(objective["id"] not in objective_ids, f"Duplicate objective ID: {objective['id']}")
        objective_ids.add(objective["id"])
        text_field(objective, "title", context)
        require(objective.get("kind") in KINDS, f"{context}.kind is not supported")
    activities = lesson.get("activities")
    require(isinstance(activities, list) and activities, "activities must be a nonempty array")
    activity_ids = set()
    for index, activity in enumerate(activities):
        context = f"activities[{index}]"
        require(isinstance(activity, dict), f"{context} must be an object")
        identifier(activity.get("id"), context + ".id")
        require(activity["id"] not in activity_ids, f"Duplicate activity ID: {activity['id']}")
        activity_ids.add(activity["id"])
        require(activity.get("objectiveId") in objective_ids, f"{context}.objectiveId does not exist")
        require(activity.get("type") in TYPES, f"{context}.type is not supported")
        for field in ("title", "prompt"):
            text_field(activity, field, context)
        source = activity.get("source")
        if isinstance(source, dict) and "provider" in source:
            for field in ("provider", "url", "mechanism"):
                text_field(source, field, context + ".source")
            require(re.fullmatch(r"https://[^\s/]+(?:/[^\s]*)?", source["url"]), f"{context}.source.url must be an HTTPS URL")
        elif isinstance(source, dict):
            text_field(source, "path", context + ".source")
            require(source.get("repository", "HKUDS/DeepTutor") == "HKUDS/DeepTutor", f"{context}.source must identify HKUDS/DeepTutor")
        else:
            require(isinstance(source, str) and (source.startswith(("deeptutor/", "web/")) or "HKUDS/DeepTutor" in source), f"{context}.source must identify a DeepTutor implementation")
        placement = activity.get("placement")
        if placement is not None:
            require(isinstance(placement, dict), f"{context}.placement must be an object")
            text_field(placement, "selector", context + ".placement")
            require(placement.get("position") in {"before", "after", "append"}, f"{context}.placement.position is not supported")
        if activity.get("solutionId") is not None:
            identifier(activity["solutionId"], context + ".solutionId")
        for field in ("hint", "explanation", "modelAnswer", "instructions"):
            if field in activity:
                text_field(activity, field, context)
        for item in activity.get("followups", []):
            require(isinstance(item, dict), f"{context}.followups entries must be objects")
            text_field(item, "question", context + ".followups")
            text_field(item, "answer", context + ".followups")
        kind = activity["type"]
        if kind == "flashcards":
            cards = activity.get("cards")
            require(isinstance(cards, list) and cards, f"{context}.cards must be nonempty")
            for card in cards:
                require(isinstance(card, dict), f"{context}.cards entries must be objects")
                text_field(card, "front", context + ".cards")
                text_field(card, "back", context + ".cards")
                text_field(card, "hint", context + ".cards", required=False)
        elif kind == "quiz":
            format_ = activity.get("format")
            require(format_ in {"choice", "numeric", "open"}, f"{context}.format is not supported")
            text_field(activity, "explanation", context)
            if format_ == "choice":
                choices = activity.get("choices")
                require(isinstance(choices, list) and len(choices) >= 2, f"{context}.choices needs at least two choices")
                choice_ids = set()
                for choice in choices:
                    require(isinstance(choice, dict), f"{context}.choices entries must be objects")
                    text_field(choice, "id", context + ".choices")
                    text_field(choice, "text", context + ".choices")
                    require(choice["id"] not in choice_ids, f"{context} has duplicate choice IDs")
                    choice_ids.add(choice["id"])
                require(activity.get("answer") in choice_ids, f"{context}.answer must match a choice ID")
            elif format_ == "numeric":
                require(finite_numeric(activity.get("answer")), f"{context}.answer must be a finite number or simple fraction")
                tolerance = activity.get("tolerance", 1e-8)
                require(isinstance(tolerance, (int, float)) and not isinstance(tolerance, bool) and math.isfinite(tolerance) and tolerance >= 0, f"{context}.tolerance must be finite and nonnegative")
            else:
                text_field(activity, "modelAnswer", context)
                rubric = activity.get("rubric")
                require(isinstance(rubric, list) and rubric and all(isinstance(x, str) and x.strip() for x in rubric), f"{context}.rubric must contain evaluation criteria")
        elif kind == "steps":
            steps = activity.get("steps")
            require(isinstance(steps, list) and len(steps) >= 2, f"{context}.steps needs at least two steps")
            for step in steps:
                require(isinstance(step, dict), f"{context}.steps entries must be objects")
                text_field(step, "title", context + ".steps")
                text_field(step, "bodyHtml", context + ".steps")
        elif kind == "explore":
            require(activity.get("model") in {"linear-density", "uniform"}, f"{context}.model is not supported; use an interactive block for a custom model")
        else:
            text_field(activity, "bodyHtml", context)
            text_field(activity, "script", context, required=False)
    section_ids = set()
    assigned = []
    for index, section in enumerate(lesson.get("sections", [])):
        context = f"sections[{index}]"
        require(isinstance(section, dict), f"{context} must be an object")
        identifier(section.get("id"), context + ".id")
        require(section["id"] not in section_ids, f"Duplicate section ID: {section['id']}")
        section_ids.add(section["id"])
        text_field(section, "title", context)
        text_field(section, "bodyHtml", context)
        section_activities = section.get("activityIds", [])
        require(isinstance(section_activities, list), f"{context}.activityIds must be an array")
        for activity_id in section_activities:
            require(activity_id in activity_ids, f"{context} refers to unknown activity: {activity_id}")
            assigned.append(activity_id)
    if lesson.get("sections"):
        require(set(assigned) == activity_ids and len(assigned) == len(activity_ids), "sections must place every activity exactly once")
    wrap_ids = set()
    for index, wrap in enumerate(lesson.get("solutionWraps", [])):
        require(isinstance(wrap, dict), f"solutionWraps[{index}] must be an object")
        identifier(wrap.get("id"), f"solutionWraps[{index}].id")
        require(wrap["id"] not in wrap_ids, f"Duplicate solution wrapper ID: {wrap['id']}")
        wrap_ids.add(wrap["id"])
        for field in ("startSelector", "endSelector"):
            text_field(wrap, field, f"solutionWraps[{index}]")
    tts = lesson.get("tts")
    if tts is not None:
        require(isinstance(tts, dict) and isinstance(tts.get("segments"), list) and tts["segments"], "tts.segments must be a nonempty array")
        segment_ids = set()
        for segment in tts["segments"]:
            require(isinstance(segment, dict), "TTS segment must be an object")
            identifier(segment.get("id"), "TTS segment id")
            require(segment["id"] not in segment_ids, "Duplicate TTS segment ID")
            segment_ids.add(segment["id"])
            require(segment.get("kind") in {"narration", "activity", "feedback"}, "TTS segment kind is not supported")
            text_field(segment, "text", "TTS segment")
            if segment["kind"] != "narration":
                require(segment.get("activityId") in activity_ids, "TTS activity/feedback segment needs a valid activityId")
    return lesson


class Node:
    def __init__(self, tag=None, attrs=None, raw="", end="", parent=None):
        self.tag, self.attrs, self.raw, self.end = tag, dict(attrs or []), raw, end
        self.parent, self.children = parent, []

    def append(self, child):
        child.parent = self
        self.children.append(child)

    def descendants(self):
        for child in self.children:
            if child.tag:
                yield child
            yield from child.descendants()

    def render(self):
        return self.raw + "".join(child.render() for child in self.children) + self.end


class Document(HTMLParser):
    def __init__(self, content):
        super().__init__(convert_charrefs=False)
        self.source = content
        self.line_offsets = [0] + [match.end() for match in re.finditer("\n", content)]
        self.root = Node()
        self.stack = [self.root]
        self.feed(content)
        self.close()

    def raw(self, content):
        self.stack[-1].append(Node(raw=content))

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.get_starttag_text())
        self.stack[-1].append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].append(Node(tag, attrs, self.get_starttag_text()))

    def handle_endtag(self, tag):
        line, column = self.getpos()
        offset = self.line_offsets[line - 1] + column
        closing = self.source[offset:self.source.index(">", offset) + 1]
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                self.stack[index].end = closing
                del self.stack[index:]
                return
        self.raw(closing)

    def handle_data(self, data):
        self.raw(data)

    def handle_entityref(self, name):
        self.raw(f"&{name};")

    def handle_charref(self, name):
        self.raw(f"&#{name};")

    def handle_comment(self, data):
        self.raw(f"<!--{data}-->")

    def handle_decl(self, decl):
        self.raw(f"<!{decl}>")

    def handle_pi(self, data):
        self.raw(f"<?{data}>")


def simple_match(node, selector):
    nth = re.search(r":nth-of-type\((\d+)\)$", selector)
    if nth:
        siblings = [x for x in node.parent.children if x.tag == node.tag]
        if siblings.index(node) + 1 != int(nth.group(1)):
            return False
        selector = selector[:nth.start()]
    require(":" not in selector and "[" not in selector and "," not in selector, f"Unsupported placement selector: {selector}")
    token = re.fullmatch(r"([A-Za-z][A-Za-z0-9_-]*|\*)?((?:[#.][A-Za-z_][A-Za-z0-9_-]*)*)", selector)
    require(token is not None, f"Unsupported placement selector: {selector}")
    if token.group(1) and token.group(1) not in {"*", node.tag}:
        return False
    for marker, value in re.findall(r"([#.])([A-Za-z_][A-Za-z0-9_-]*)", token.group(2)):
        if marker == "#" and node.attrs.get("id") != value:
            return False
        if marker == "." and value not in node.attrs.get("class", "").split():
            return False
    return True


def select(root, selector):
    normalized = re.sub(r"\s*([>+])\s*", r"\1", selector.strip())
    tokens = re.split(r"([>+]|\s+)", normalized)
    require(bool(tokens) and tokens[0], f"Empty selector: {selector}")
    candidates = [node for node in root.descendants() if simple_match(node, tokens[0])]
    for index in range(1, len(tokens), 2):
        relation, target = tokens[index], tokens[index + 1]
        next_nodes = []
        for node in candidates:
            if relation == ">":
                possible = [x for x in node.children if x.tag]
            elif relation == "+":
                siblings = node.parent.children
                possible = [x for x in siblings[siblings.index(node) + 1:] if x.tag][:1]
            else:
                possible = list(node.descendants())
            next_nodes.extend(x for x in possible if simple_match(x, target))
        candidates = list(dict.fromkeys(next_nodes))
    return candidates


def unique(root, selector):
    nodes = select(root, selector)
    require(len(nodes) == 1, f"Selector must match exactly one element: {selector!r} (matched {len(nodes)})")
    return nodes[0]


def fragment(markup):
    return Document(markup).root.children


def activity_mount(activity_id):
    return f'<div data-dt-activity="{html.escape(activity_id, quote=True)}"></div>'


def wrap_solutions(document, lesson):
    for wrapper in lesson.get("solutionWraps", []):
        require(not select(document.root, "#" + wrapper["id"]), f"Solution ID already exists: {wrapper['id']}")
        start = unique(document.root, wrapper["startSelector"])
        end = unique(document.root, wrapper["endSelector"])
        parent = start.parent
        start_index = parent.children.index(start) + 1
        if end.parent is parent:
            end_index = parent.children.index(end)
            require(end_index >= start_index, "Solution end must follow its heading")
        else:
            boundary = parent
            while boundary.parent is not None and boundary.parent is not end.parent:
                boundary = boundary.parent
            require(boundary.parent is end.parent, "Solution boundary must follow the heading's container")
            siblings = [x for x in end.parent.children if x.tag]
            require(siblings.index(end) == siblings.index(boundary) + 1, "Cross-container solution end must be the next element boundary")
            end_index = len(parent.children)
        content = parent.children[start_index:end_index]
        require(any(node.tag or node.raw.strip() for node in content), f"Empty solution: {wrapper['id']}")
        detail = Node("details", {"id": wrapper["id"], "class": "dt-worked-solution", "data-dt-solution": ""}, f'<details id="{html.escape(wrapper["id"], quote=True)}" class="dt-worked-solution" data-dt-solution>', "</details>", parent)
        summary = wrapper.get("summary", "查看完整解答")
        for node in fragment(f'<summary>{html.escape(summary)}</summary>'):
            detail.append(node)
        for node in content:
            detail.append(node)
        parent.children[start_index:end_index] = [detail]


def place_activities(document, lesson):
    # Resolve all anchors first: inserted siblings must not change a later CSS match.
    anchors = []
    for activity in lesson["activities"]:
        placement = activity.get("placement")
        require(placement is not None, f"Activity {activity['id']} needs a placement when using --base-html")
        anchors.append((activity, unique(document.root, placement["selector"]), placement["position"]))
    after_tails = {}
    for activity, anchor, position in anchors:
        node = fragment(activity_mount(activity["id"]))[0]
        if position == "append":
            anchor.append(node)
        else:
            parent = anchor.parent
            reference = after_tails.get(anchor, anchor) if position == "after" else anchor
            index = parent.children.index(reference) + (position == "after")
            node.parent = parent
            parent.children.insert(index, node)
            if position == "after":
                after_tails[anchor] = node


BASE_CSS = """
:root{color-scheme:light dark;--paper:#f5f5f7;--ink:#1d1d1f;--muted:#626269;--line:#d8d8de;--accent:#164f9e}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;line-height:1.8}strong{color:var(--accent);font-weight:700}
main{max-width:52rem;margin:0 auto;padding:3rem 1.3rem 6rem}h1{font-size:clamp(1.8rem,4vw,2.6rem);line-height:1.35}h2{margin-top:3rem;font-size:1.5rem}h3{font-size:1.2rem}p{margin:1rem 0}a{color:var(--accent)}figure{margin:1.7rem 0}svg{max-width:100%;height:auto}table{border-collapse:collapse;width:100%}th,td{padding:.6rem;border-bottom:1px solid var(--line);text-align:left}math{font-size:1.08em}pre{overflow:auto;padding:1rem;background:#eaeaee}code{overflow-wrap:anywhere}.dt-lesson-kicker{color:var(--accent);font-size:.8rem;letter-spacing:.12em}.dt-worked-solution{margin:1.2rem 0}.dt-worked-solution>summary{cursor:pointer;font-weight:600;padding:.7rem 0}
@media(prefers-color-scheme:dark){:root{--paper:#161618;--ink:#f2f2f5;--muted:#b0b0b8;--line:#414147;--accent:#8ab7ff}pre{background:#242427}}
"""


def make_new_document(lesson):
    require(lesson.get("sections"), "New lessons need sections; existing lessons need --base-html")
    title = html.escape(lesson["title"])
    language = html.escape(lesson.get("language", "zh-CN"), quote=True)
    content = [f'<!doctype html><html lang="{language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title><style>{BASE_CSS}</style></head><body><main><header><p class="dt-lesson-kicker">DIALOGUETUTOR · 互动学习</p><h1>{title}</h1></header>']
    for section in lesson["sections"]:
        content.append(f'<section id="{html.escape(section["id"], quote=True)}"><h2>{html.escape(section["title"])}</h2>{section["bodyHtml"]}')
        embedded = [node.attrs["data-dt-activity"] for node in Document(section["bodyHtml"]).root.descendants() if "data-dt-activity" in node.attrs]
        require(set(embedded).issubset(set(section.get("activityIds", []))), f"Section {section['id']} contains an unassigned activity mount")
        content.extend(activity_mount(activity_id) for activity_id in section.get("activityIds", []) if activity_id not in embedded)
        content.append("</section>")
    content.append("</main></body></html>")
    return Document("".join(content))


def inline_script(script):
    return re.sub(r"</script", r"<\\/script", script, flags=re.IGNORECASE)


def assemble(lesson, base_html=None, asset_root=None):
    validate_lesson(lesson)
    assets = Path(asset_root) if asset_root else SKILL_ROOT / "assets" / "interactive"
    css = (assets / "lesson-runtime.css").read_text(encoding="utf-8")
    js = (assets / "lesson-runtime.js").read_text(encoding="utf-8")
    if base_html is None:
        document = make_new_document(lesson)
    else:
        document = Document(base_html)
        require(not select(document.root, "#dt-lesson"), "Base HTML already has a DialogueTutor lesson; use the original content source to rebuild")
        wrap_solutions(document, lesson)
        place_activities(document, lesson)
    main = unique(document.root, "main")
    head = unique(document.root, "head")
    body = unique(document.root, "body")
    all_mount_ids = [node.attrs["data-dt-activity"] for node in document.root.descendants() if "data-dt-activity" in node.attrs]
    require(set(all_mount_ids) == {activity["id"] for activity in lesson["activities"]}, "Document contains unknown or missing activity mounts")
    for activity in lesson["activities"]:
        require(all_mount_ids.count(activity["id"]) == 1, f"Activity {activity['id']} must have exactly one mount")
    # Validate the DOM before adding runtime nodes. A duplicate dt-lesson would make
    # getElementById read prose instead of JSON; auto-generated activity IDs also
    # need to remain unique after mounting.
    dom_ids = set(RUNTIME_IDS)
    for node in document.root.descendants():
        node_id = node.attrs.get("id")
        if not node_id and "data-dt-activity" in node.attrs:
            node_id = "dt-activity-" + node.attrs["data-dt-activity"]
        if node_id:
            require(node_id not in dom_ids, f"Duplicate or reserved DOM ID: {node_id}")
            dom_ids.add(node_id)
    study = fragment('<aside data-dt-study aria-label="学习记录与复习"></aside>')[0]
    study.parent = main
    # Keep the lesson title as the first visible content where a header is present.
    first_header = next((node for node in main.children if node.tag == "header"), None)
    insertion = main.children.index(first_header) + 1 if first_header else 0
    main.children.insert(insertion, study)
    head.append(Node(raw=f'<style id="dt-runtime-style">{css}</style>'))
    for activity in lesson["activities"]:
        solution_id = activity.get("solutionId")
        if solution_id:
            solution = unique(document.root, "#" + solution_id)
            require(solution.tag == "details" and "open" not in solution.attrs, f"Solution {solution_id} must be a closed details element")
    data = json.dumps(lesson, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    body.append(Node(raw=f'<script type="application/json" id="dt-lesson">{data}</script>'))
    body.append(Node(raw=f'<script id="dt-runtime">{inline_script(js)}</script>'))
    for activity in lesson["activities"]:
        if activity["type"] == "interactive" and activity.get("script"):
            body.append(Node(raw=f'<script data-dt-widget="{html.escape(activity["id"], quote=True)}">{inline_script(activity["script"])}</script>'))
    body.append(Node(raw='<noscript><p>这份讲义的交互活动需要浏览器启用 JavaScript；正文与完整解答仍可阅读。</p></noscript>'))
    return document.root.render()


def write_tts(lesson, output):
    if not lesson.get("tts"):
        return []
    segments = lesson["tts"]["segments"]
    listening, answers = [], []
    for segment in segments:
        label = f"[{segment.get('activityId', segment['id'])}]"
        if segment["kind"] == "feedback":
            answers.append(f"{label}\n{segment['text']}")
        else:
            listening.append(segment["text"])
            if segment["kind"] == "activity":
                listening.append(f"{label} 暂停伴读，先在页面完成这项活动；核对后再继续。")
    paths = []
    for suffix, content in (("-listening.txt", "\n\n".join(listening)), ("-answers.txt", "参考讲解轨：请在作答或主动揭示后，按活动编号查阅。\n\n" + "\n\n".join(answers)), ("-tts.json", json.dumps(lesson["tts"], ensure_ascii=False, indent=2))):
        path = output.with_name(output.stem + suffix)
        path.write_text(content + "\n", encoding="utf-8")
        paths.append(path)
    return paths


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lesson", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--base-html", type=Path)
    args = parser.parse_args(argv)
    try:
        lesson = json.loads(args.lesson.read_text(encoding="utf-8"))
        base = args.base_html.read_text(encoding="utf-8") if args.base_html else None
        result = assemble(lesson, base)
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(result, encoding="utf-8")
        companions = write_tts(lesson, args.output)
    except (LessonError, OSError, json.JSONDecodeError, TypeError, KeyError) as error:
        parser.exit(2, f"Lesson build failed: {error}\n")
    print(json.dumps({"html": str(args.output), "activities": len(lesson["activities"]), "objectives": len(lesson["objectives"]), "tts": [str(path) for path in companions]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
