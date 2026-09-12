# Dialogue Tutor interactive-first redesign

## Scope and design

The user requests a major skill revision, with visual interaction > visual models > prose; novice-complete line-by-line explanations; Socratic learning; English terms in Chinese explanations; always-available question TTS (Xiaoxiao at 1.5× preferred); and Apple/Emil visual quality. The deliverable is the existing GitHub skill and its reusable generator, not a new tutoring platform.

Observed failures at base `e6c02d94d1bf1958702cead5c61dcc166f5415e2`: the entrypoint is 162,264 bytes; §0.5 prioritizes complete prose before interaction and permits only DeepTutor inspiration; §4 prohibits visual tools in ordinary follow-ups; CSS uses cream/dark-green defaults; runtime has no speech synthesis. The existing explanation example also compresses several transformations into one line.

Choose a small authoritative entrypoint plus conditional references and retain the existing builder/runtime. Appending requirements leaves contradictory defaults; rebuilding the application discards useful state handling. The selected design requires reference routing to preserve old scope and pedagogical depth.

## Implementation and validation plan

1. Rewrite `SKILL.md`; move mode/scope, worked solutions, TTS, design/model selection, and review instructions to focused references. Retain original question coverage, prerequisite reasoning, mode aliases and learning-record semantics. Remove historical duplicate instructions; history remains in Git.
2. Update `references/interactive-html.md` to permit evidence-backed product sources and document runtime speech fields. Preserve schema v1 compatibility. Add a concise official-source interaction catalogue.
3. Update reusable CSS/builder defaults and JS speech controls. Speech reads question/front/current step, never hidden answers. Add behavioral tests for rate, voice selection, cancellation, and answer separation. Keep `plustts` exports distinct.
4. Produce one compact, runnable example that demonstrates linked model, four-choice prediction, novice-complete derivation and speech. Use independent skill forward-use plus document/code review; record concrete findings and dispositions below.
5. Run the repository Python/Node suites, build its existing demo, validate the skill frontmatter and references, rebuild the deterministic ZIP, inspect desktop/mobile rendering, then commit and push the reviewed GitHub change. Update packaging/version metadata together.

Private design/writing skills were consulted, but their contents are not redistributed. The engineering changes apply their principles independently. General skill-installation workflows do not apply: the user explicitly chose this GitHub repository.

## Review record

Review performed on 2026-09-12. Independent roles covered preservation, official-source research, skill usability, runtime behavior and a forward-use lesson. Reviewers read the actual working files; no claim of external human or student validation is made.

| Finding | Disposition | Verification |
| --- | --- | --- |
| Skill review I1: mandatory schema reference retained a prose-first copyable example and Chinese-only technical terms | Replaced duplicate example with the single packaged interactive-first example; corrected speech snippets | Scoped independent re-review closed I1 |
| Skill review M1: two historical reference links pointed to removed sections or absent files | Repointed applicable references and removed the absent-file dependency | Scoped independent re-review closed M1; all local Markdown links resolve |
| Runtime review I1: default step narration could expose closed details or CSS-hidden answers | Traverse the actual displayed step DOM; respect closed details and computed visibility without modifying the DOM | Independent re-review closed I1; regression intentionally omits speechText and exercises open/close and full/step views |
| Runtime review M1: dark theme overrode increased-contrast borders | Place contrast overrides after dark theme | Independent re-review closed M1; all four color-scheme/contrast combinations checked |
| Forward use: an author needed to create an unfamiliar lesson from the revised skill | Author produced a working balance model for 2x + 3 = 11, complete derivation and transfer problem; packaged example adds four-choice and concept-card modules | Generated HTML executed in jsdom; model transitions, state restoration, independent/assisted attempts, export/import and speech controls passed |

No blocking findings remain in these scoped reviews. Preserved requirements include all mode aliases, original question coverage, novice prerequisite chains, complete solutions, Socratic detours, bilingual terminology, and distinct exploration/independent/assisted/self-report records.

## Execution evidence

- `npm test`: **63/63 passed**, including execution of both generated pages. Speech uses a test double; this verifies payload selection and controls, not audible output.
- `python3 -m unittest discover -s tests -p 'test_*.py'`: **13/13 passed**.
- `python3 scripts/build_demo.py`: existing S2 compatibility page has 15 activities / 8 objectives; new balance example has 4 activities / 2 objectives.
- `python3 scripts/package_skill.py`: deterministic 2.0.0 package, 21 files, SHA-256 `b0df33341b13a4082f36bf55f8134af316dd54ea8214a89026f7a7bbdfccf73d`.
- Skill frontmatter validation, local Markdown-link checks and `git diff --check` passed.
- Core `SKILL.md`: 162,264 → 9,020 UTF-8 bytes (94.4% reduction). This is an entrypoint byte measurement, not a measured token reduction for the entire task. Detailed references load when needed.

## Remaining limits

Actual desktop/mobile screenshots, browser layout, keyboard focus appearance and audio playback were **not verified**. Playwright had no browser executable; attempted browser installation/download failed in this environment. jsdom does not establish visual quality or speech quality. The new theme implements the requested Apple/Emil principles, but should receive a real-browser visual pass before calling its appearance fully validated.

Xiaoxiao is preferred only when the browser exposes that voice. Otherwise the UI names the actual fallback. No Azure account, paid voice service, or pre-generated audio was configured. Exact Xiaoxiao synthesis is documented as a separate optional path. Manim/3D guidance is included; the small equation example appropriately uses interactive 2D SVG and does not claim to demonstrate every rendering backend.

The original S2 page remains a compatibility fixture with updated runtime components; the new page is the interactive-first authoring reference. Existing historical 1.6.0 provenance and release archive remain labeled as historical evidence.
