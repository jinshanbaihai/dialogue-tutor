# HTML interaction contract v1

The approved goal is a portable DialogueTutor lesson with DeepTutor-derived learning interactions embedded where the content needs them. Every activity carries a `source` identifying the DeepTutor module; learning science qualifies behavior and evidence labels. The prototype uses the existing S2 lesson and fifteen activity placements. The original prose and six worked questions remain available.

## Files and ownership

- Skill root: `plugins/dialogue-tutor/skills/dialogue-tutor/`.
- Shared runtime: `assets/interactive/lesson-runtime.js` and `lesson-runtime.css`.
- Deterministic Python assembler: `scripts/build_lesson.py` (root agent).
- Lesson data: `examples/s2-interactive.json` (sample author).
- Integration instruction: `references/interactive-html.md` and SKILL.md (skill author).
- Runtime reads `<script id="dt-lesson" type="application/json">…</script>` and mounts an activity in each `[data-dt-activity="ACTIVITY_ID"]`. It mounts a study panel in `[data-dt-study]`.
- Builder accepts `--lesson lesson.json --output lesson.html [--base-html existing.html]`. New lesson data includes `sections`; augmenting an existing HTML uses activity `placement` selectors. Builder embeds CSS, JS and JSON. Required learning interactions do not depend on a DeepTutor server or a model API.

## Lesson schema

Top-level fields: `schemaVersion: 1`, stable `lessonId`, `revision`, `title`, `language` (default `zh-CN`), `mode` (`bgct`, `bbct`, `olct`, `onct`), `objectives`, `activities`, optional `sections`, optional `tts`.

`objectives`: `{id, title, kind}` where kind is `memory`, `concept`, `procedure`, or `design`. IDs are unique and stable. Activity IDs are unique and reference an existing objective.

Each activity: `{id, objectiveId, type, title, prompt, source, ...payload}`. `source` is a nonempty DeepTutor source path or object with path/commit/case. Prompt and ordinary labels are text; fields ending `Html` are author-produced lesson markup. The runtime uses text rendering for learner answers and notes.

Placement for an existing HTML: `{selector, position: "before"|"after"|"append"}`. Selectors are builder-side structural anchors; a missing or ambiguous selector fails assembly. Activities can additionally refer to `solutionId`, the ID of a `<details>` containing the original worked solution. Revealing that details before answering marks the attempt as assisted. The sample author supplies `solutionWraps: [{id,startSelector,endSelector}]` to wrap a run of sibling nodes starting after the selected heading and ending before the next boundary; the builder preserves the heading and places the activity immediately after it. For new lessons, sections are `{id,title,bodyHtml,activityIds}` and may include authored accessible math/SVG markup.

### Supported activity payloads

1. `flashcards`: `cards: [{front,back,hint?}]`. Flip, previous/next, optional hint, self-rating only after reveal. Reading the card or revealing an answer never becomes objective evidence. Save index, revealed state, self-rating and whether hint was used.
2. `quiz`: `format: "choice"|"numeric"|"open"`, `choices: [{id,text,feedback?}]` for choice, `answer` for choice/numeric, optional `tolerance` (numeric absolute tolerance, default 1e-8), `explanation`, optional `hint`, `modelAnswer`, `rubric: [string]` for open, `followups: [{question,answer}]`, optional `remediation`. Choices/numeric answers require explicit submit. Allow decimal and simple fractional numeric answers, never evaluate arbitrary input code. Open responses retain the learner's text, reveal reference/rubric after submit or explicit reveal, and use explicitly labelled self-evaluation; do not string-match an explanation. Give retry and skip independent states. Submission is idempotent until retry starts another attempt.
3. `steps`: `steps: [{title,bodyHtml}]`. Previous/next/reset, current step indicated, learner controls progression. Stepping is exploration evidence, not correctness evidence.
4. `explore`: `model: "linear-density"|"uniform"`, `instructions`, optional `followups`. `linear-density` explores f(x)=2−2x on [0,1] with adjustable interval endpoints and linked density shading/CDF difference. `uniform` explores adjustable support bounds and event interval, with linked height, mean and interval probability. Controls must update actual diagrams and numbers and support reset. Parameter movement is recorded as exploration, not a correct answer.
5. `interactive`: `bodyHtml` and optional `script` (author-supplied custom widget JS). This is the reusable extension for other subjects. The assembler puts the script into the generated document; the runtime does not eval lesson JSON. Custom widgets can dispatch `dt:exploration` with `{activityId, state}` for exploration recording. They do not write correctness or mastery values.

Every activity offers a relevant local note/bookmark affordance. Prepared follow-up content is labelled as prepared explanation; no mock AI conversation box. A “continue in conversation” action can copy the selected question, learner response and explanation for the host conversation without claiming automatic delivery.

## State and evidence

Namespace persisted data by `lessonId` and `revision`; never silently attach an earlier content revision's evidence to new content. Save objective/activity identity, drafts, submitted answers, reveal/hint flags, attempts, timestamps, self-rating, exploration state, notes, bookmarks and current activity. Storage errors leave current-session interactions working and offer export. Export/import uses a versioned JSON envelope and validates lesson identity/revision. Browser storage is local to the current device/browser; exported data supports intentional transfer.

Attempt evidence includes: learner answer; `correct: true|false|null`; `source: "objective"|"self"`; `assisted` (hint or answer revealed before submission); time; attempt identity. Separate “participation”, “independent answer passed”, “self-reviewed” and “review due”. Do not display a calibrated mastery percentage or claim a personal forgetting curve.

The runtime distinguishes visible controls from prior answer exposure. Retrying within a session does not erase a hint/reference already seen. Normal feedback freezes the preceding attempt before recording exposure for subsequent attempts. Due items restore to an unrevealed retrieval view with a blank current response; prior attempts and notes remain in history. Flashcard self-ratings explicitly refer to recall before the first flip.

Independent review additionally requires at least 24 hours since the most recent recorded hint/reference exposure; a fresh tab cannot erase recent assistance. This minimum is a disclosed engineering parameter. Due timestamps do not restart unfinished responses: drafts and submitted open responses awaiting self-review survive restoration, and normal feedback cannot change their frozen pre-submission evidence. Viewing a hint schedules review without creating an incorrect answer.

Review is a disclosed engineering heuristic, inspired by DeepTutor Mastery: 1, 3, 7, 14, 30 days. Only a successful unassisted due review advances the interval. Fresh same-session retries cannot advance the interval. Wrong/revealed responses return to the next-day interval; skipping does not create a wrong answer. Keep self-reported card/open-answer review evidence distinct from automatically checked answers. Store due timestamps; a small due list navigates back to activities. Do not create notifications or background services.

## Frozen verification before implementation

- Original-component observation: independently execute original DeepTutor FlashCards/Quiz source in an isolated harness if runtime dependencies permit; label harness evidence distinctly from public screenshots and full-app behavior.
- S2 content checks: all six questions retain original task and correct worked result; fifteen activity placements cover concepts, graphs, derivations and exercises. No answer visible before a quiz attempt except explicit learner reveal or the preceding legitimate teaching content.
- Functional actions: flip/card navigation/hint/self-rating; wrong and correct choice; numeric fraction parsing; open answer retained and explicitly self-graded; reveal before submission; duplicate submit; retry; skip; stepping/backtracking; both parameter models; prepared follow-up; note/bookmark; export/import; refresh restore.
- State checks: no same-session review advancement; assistance/self-rating are not objective mastery; activity identity/revision mismatch does not reuse evidence; blocked browser storage preserves active use.
- UI checks: narrow screen, keyboard focus/actions, SVG and formula readability, long content, no inert primary controls.
- Generator checks: actual Python assembler runs; unknown types, missing IDs/answers/anchors and duplicate IDs fail clearly; inline JSON cannot prematurely close its script; two generated non-S2 lessons exercise different modes and content types.
- Skill behavior: two independent realistic generation tasks, fresh context, skill and raw requested task only; compare outputs to the contract and repair concrete failures. One task includes plustts answer ordering.

## Portable custom activities and narration

New sections may place `[data-dt-activity]` inline in `bodyHtml`; `activityIds` lists all of the section's activities. Only those not pre-placed are appended. Missing/duplicate/unknown mounts fail assembly.

Custom scripts listen on `document` for `dt:activity-mounted` and `dt:restore`, using `detail.activityId` and `detail.state`. Binding happens on mount, while restore only updates existing controls. Learner changes dispatch `dt:exploration` with `{activityId,state}`. `dt:ready` runs after `DialogueTutor.instance` is available; `getState()` returns a copy. Exploration never generates correctness evidence.

`tts.segments` contains unique `{id,kind,text,activityId?}` records. Kinds are `narration`, `activity`, `feedback`; the latter two reference a real activity. The builder emits a first-attempt listening text, a separate answer text, and the complete segment JSON. Plain text does not automatically pause playback or synchronize with the webpage.

Runtime contributors may refine implementation details while preserving this contract; communicate any schema change before editing other contributors' files.
