"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const runtime = require("../plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js");
const DAY = runtime.DAY;
const NOW = Date.UTC(2026, 8, 7, 12);
const source = "HKUDS/DeepTutor/web/app/(workspace)/books/components/blocks/QuizBlock.tsx";

function fixture() {
  return {
    schemaVersion: 1, lessonId: "probability-example", revision: "r1", title: "Probability", language: "en", mode: "bgct",
    objectives: [{ id: "understanding", title: "Distinguish density and probability", kind: "concept" }],
    activities: [
      { id: "choice", objectiveId: "understanding", type: "quiz", format: "choice", title: "Density", prompt: "Choose the density", source,
        choices: [{ id: "a", text: "1/8" }, { id: "b", text: "8" }], answer: "a", explanation: "The area is one.", hint: "Use the support width." },
      { id: "numeric", objectiveId: "understanding", type: "quiz", format: "numeric", title: "Area", prompt: "Find the probability", source,
        answer: 0.45, tolerance: 1e-8, explanation: "The event width is 3.6 of 8." },
      { id: "open", objectiveId: "understanding", type: "quiz", format: "open", title: "Explain", prompt: "Explain the distinction", source,
        modelAnswer: "Probability is area, not height.", rubric: ["Explain the area."] },
      { id: "cards", objectiveId: "understanding", type: "flashcards", title: "Recall", prompt: "Recall first", source,
        cards: [{ front: "What does density mean?", back: "Probability per unit interval", hint: "Think about units." }, { front: "What does CDF mean?", back: "Cumulative probability" }] },
      { id: "steps", objectiveId: "understanding", type: "steps", title: "Derive", prompt: "Follow the derivation", source,
        steps: [{ title: "Set up", bodyHtml: "<p>Normalize.</p>" }, { title: "Evaluate", bodyHtml: "<p>Integrate.</p>" }] },
      { id: "linear", objectiveId: "understanding", type: "explore", model: "linear-density", title: "Interval", prompt: "Move endpoints", source },
      { id: "uniform", objectiveId: "understanding", type: "explore", model: "uniform", title: "Uniform", prompt: "Change support", source },
      { id: "custom", objectiveId: "understanding", type: "interactive", title: "Other subject", prompt: "Explore", source, bodyHtml: "<button>Explore</button>" }
    ]
  };
}

function reducer(activity) {
  let state = runtime.blankActivity(activity), clock = NOW, session = "session-a";
  return {
    event(event) { state = runtime.reduceActivity(activity, state, event, clock, session); return state; },
    get value() { return state; },
    at(time, sessionId) { clock = time; if (sessionId) session = sessionId; return this; }
  };
}

test("numeric input accepts decimal, signed values and simple fractions without evaluating expressions", () => {
  const accepted = new Map([["0.45", 0.45], [" 9 / 20 ", 0.45], ["−3/4", -0.75], [".5", 0.5], ["1.", 1], ["1e-3", 0.001], ["+4/-8", -0.5]]);
  for (const [input, expected] of accepted) assert.equal(runtime.parseNumeric(input), expected, input);
  for (const input of ["", " ", "1/0", "0/0", "Infinity", "NaN", "1+2", "Math.PI", "2 ** 3", "2/3/4", "9/20;process.exit()", "0x20", "1e999", "1,000", {}, null]) assert.equal(runtime.parseNumeric(input), null, String(input));
});

test("numeric and choice grading checks reference identity; explanations remain self-reviewed", () => {
  const lesson = fixture();
  const choice = lesson.activities[0], numeric = lesson.activities[1], open = lesson.activities[2];
  assert.deepEqual(runtime.evaluateQuiz(choice, "a"), { valid: true, correct: true, source: "objective" });
  assert.equal(runtime.evaluateQuiz(choice, "b").correct, false);
  assert.equal(runtime.evaluateQuiz(choice, "1/8").valid, false);
  assert.equal(runtime.evaluateQuiz(numeric, "9/20").correct, true);
  assert.equal(runtime.evaluateQuiz(numeric, "0.4501").correct, false);
  assert.equal(runtime.evaluateQuiz(numeric, "1/0").valid, false);
  assert.deepEqual(runtime.evaluateQuiz(open, "A valid explanation in entirely different words."), { valid: true, correct: null, source: "self" });
});

test("submitting is idempotent until an explicit retry; skipped questions add no failed attempts", () => {
  const practice = reducer(fixture().activities[0]);
  practice.event({ type: "draft", value: "b" });
  let state = practice.event({ type: "submit" });
  assert.equal(state.attempts.length, 1);
  assert.equal(state.attempts[0].correct, false);
  const firstId = state.submittedAttemptId;
  assert.equal(practice.event({ type: "submit" }).attempts.length, 1);
  assert.equal(practice.event({ type: "draft", value: "a" }).draft, "b", "submitted answer stays locked");
  assert.equal(practice.event({ type: "skip" }).status, "submitted");
  practice.event({ type: "retry" });
  state = practice.event({ type: "skip" });
  assert.equal(state.status, "skipped");
  assert.equal(state.attempts.length, 1);
  practice.event({ type: "retry" });
  practice.event({ type: "draft", value: "a" });
  state = practice.event({ type: "submit" });
  assert.equal(state.attempts.length, 2);
  assert.notEqual(state.submittedAttemptId, firstId);
  assert.equal(state.attempts[1].correct, true);
  assert.equal(state.review.intervalIndex, 0);
});

test("hints and reference reveal mark pre-submission assistance; reveal alone creates no passing evidence", () => {
  for (const assistance of ["hint", "reveal"]) {
    const practice = reducer(fixture().activities[0]);
    practice.event({ type: assistance });
    assert.equal(practice.value.attempts.length, 0);
    practice.event({ type: "draft", value: "a" });
    const state = practice.event({ type: "submit" });
    assert.equal(state.attempts[0].correct, true);
    assert.equal(state.attempts[0].assisted, true);
    assert.equal(state.review.dueAt, NOW + DAY);
    practice.event({ type: "retry" });
    assert.equal(practice.value.answerRevealed, false);
    assert.equal(practice.value.hintUsed, false);
  }
});

test("reference exposure survives retry without falsifying current hint or reveal display flags", () => {
  const practice = reducer(fixture().activities[0]);
  practice.event({ type: "reveal" });
  let state = practice.event({ type: "retry" });
  assert.equal(state.answerRevealed, false);
  assert.equal(state.hintUsed, false);
  assert.equal(state.exposure.reference, true);
  assert.equal(state.exposure.hint, false, "seeing a reference is not recorded as opening a hint");
  assert.equal(state.exposure.inferred, false);
  practice.event({ type: "draft", value: "a" });
  state = practice.event({ type: "submit" });
  assert.equal(state.attempts[0].assisted, true);
  assert.equal(state.review.intervalIndex, 0);
});

test("wrong-answer feedback followed by a correct same-session retry does not become an independent pass", () => {
  const lesson = fixture(), choice = lesson.activities[0], practice = reducer(choice);
  practice.event({ type: "draft", value: "b" });
  const first = practice.event({ type: "submit" }).attempts[0];
  assert.equal(first.assisted, false, "the first attempt is frozen before feedback is revealed");
  practice.event({ type: "retry" });
  practice.event({ type: "draft", value: "a" });
  const saved = practice.event({ type: "submit" });
  assert.equal(saved.attempts[1].correct, true);
  assert.equal(saved.attempts[1].assisted, true);
  assert.deepEqual(saved.attempts[0], first, "later feedback does not retroactively change an earlier attempt");
  const state = runtime.createState(lesson, NOW); state.activities.choice = saved;
  assert.equal(runtime.evidenceSummary(lesson, state, NOW).independentPassed, 0);
});

test("hint then skip then retry retains genuine hint exposure without inventing reference viewing", () => {
  const practice = reducer(fixture().activities[0]);
  practice.event({ type: "hint" }); practice.event({ type: "skip" });
  const retry = practice.event({ type: "retry" });
  assert.equal(retry.hintUsed, false);
  assert.equal(retry.answerRevealed, false);
  assert.equal(retry.exposure.hint, true);
  assert.equal(retry.exposure.reference, false);
  assert.equal(retry.attempts.length, 0);
  practice.event({ type: "draft", value: "a" });
  assert.equal(practice.event({ type: "submit" }).attempts[0].assisted, true);
});

test("first independent success remains independent after its feedback and later assisted attempts", () => {
  const practice = reducer(fixture().activities[0]);
  practice.event({ type: "draft", value: "a" });
  const first = practice.event({ type: "submit" }).attempts[0];
  assert.equal(first.correct, true); assert.equal(first.assisted, false);
  assert.equal(practice.value.exposure.reference, true);
  practice.event({ type: "retry" }); practice.event({ type: "draft", value: "a" });
  const saved = practice.event({ type: "submit" });
  assert.equal(saved.attempts[1].assisted, true);
  assert.deepEqual(saved.attempts[0], first);
});

test("a new due session starts before the old answer is displayed and permits fresh independent evidence", () => {
  const lesson = fixture(), activity = lesson.activities[0], practice = reducer(activity);
  practice.event({ type: "draft", value: "b" }); practice.event({ type: "submit" });
  practice.event({ type: "note", value: "Check the interval width." }); practice.event({ type: "bookmark" });
  const prior = runtime.createState(lesson, NOW); prior.activities.choice = practice.value;
  const before = JSON.stringify(prior);
  const prepared = runtime.prepareSession(lesson, prior, NOW + DAY, "session-b");
  const fresh = prepared.activities.choice;
  assert.equal(fresh.status, "idle"); assert.equal(fresh.draft, "");
  assert.equal(fresh.answerRevealed, false); assert.equal(fresh.hintUsed, false);
  assert.equal(fresh.submittedAttemptId, null);
  assert.equal(fresh.notes, "Check the interval width."); assert.equal(fresh.bookmarked, true);
  assert.deepEqual(fresh.attempts, prior.activities.choice.attempts);
  assert.deepEqual(fresh.review, prior.activities.choice.review);
  assert.equal(JSON.stringify(prior), before, "session preparation is immutable");
  let next = runtime.reduceActivity(activity, fresh, { type: "draft", value: "a" }, NOW + DAY, "session-b");
  next = runtime.reduceActivity(activity, next, { type: "submit" }, NOW + DAY, "session-b");
  assert.equal(next.attempts[1].assisted, false);
  assert.equal(next.review.intervalIndex, 1);
  assert.equal(next.review.dueAt, NOW + 4 * DAY);
});

test("a tab opened before due records the visible old reference and cannot later call it independent", () => {
  const lesson = fixture(), activity = lesson.activities[0], practice = reducer(activity);
  practice.event({ type: "draft", value: "a" }); practice.event({ type: "submit" });
  const prior = runtime.createState(lesson, NOW); prior.activities.choice = practice.value;
  const early = runtime.prepareSession(lesson, prior, NOW + DAY / 2, "session-b");
  assert.equal(early.activities.choice.answerRevealed, true);
  assert.equal(early.activities.choice.exposure.sessionId, "session-b");
  assert.equal(early.activities.choice.exposure.reference, true);
  let next = runtime.reduceActivity(activity, early.activities.choice, { type: "retry" }, NOW + DAY, "session-b");
  next = runtime.reduceActivity(activity, next, { type: "draft", value: "a" }, NOW + DAY, "session-b");
  next = runtime.reduceActivity(activity, next, { type: "submit" }, NOW + DAY, "session-b");
  assert.equal(next.attempts[1].assisted, true);
  assert.equal(next.review.intervalIndex, 0);
});

test("refreshing an in-progress due open response preserves its draft rather than restarting the attempt", () => {
  const lesson = fixture(), activity = lesson.activities[2], practice = reducer(activity);
  practice.event({ type: "draft", value: "First explanation." }); practice.event({ type: "submit" }); practice.event({ type: "self-assess", correct: true });
  const prior = runtime.createState(lesson, NOW); prior.activities.open = practice.value;
  const started = runtime.prepareSession(lesson, prior, NOW + DAY, "session-b");
  const draft = "My detailed proof is still in progress: integrate the density over the event interval.";
  started.activities.open = runtime.reduceActivity(activity, started.activities.open, { type: "draft", value: draft }, NOW + DAY + 1, "session-b");
  const restored = runtime.prepareSession(lesson, runtime.validateImport(lesson, runtime.exportEnvelope(lesson, started, NOW + DAY + 2)), NOW + DAY + 2, "session-c");
  assert.equal(restored.activities.open.draft, draft);
  assert.equal(restored.activities.open.status, "idle");
  assert.equal(restored.activities.open.answerRevealed, false);
  assert.equal(restored.activities.open.attempts.length, 1);
  const submitted = runtime.reduceActivity(activity, restored.activities.open, { type: "submit" }, NOW + DAY + 3, "session-c");
  assert.equal(submitted.attempts[1].answer, draft);
  assert.equal(submitted.attempts[1].assisted, false);
});

test("refresh preserves a submitted due open response awaiting self-review and its original review eligibility", () => {
  const lesson = fixture(), activity = lesson.activities[2], practice = reducer(activity);
  practice.event({ type: "draft", value: "First explanation." }); practice.event({ type: "submit" }); practice.event({ type: "self-assess", correct: true });
  const prior = runtime.createState(lesson, NOW); prior.activities.open = practice.value;
  const due = runtime.prepareSession(lesson, prior, NOW + DAY, "session-b");
  const answer = "My new explanation identifies area, units and the interval endpoints.";
  due.activities.open = runtime.reduceActivity(activity, due.activities.open, { type: "draft", value: answer }, NOW + DAY, "session-b");
  due.activities.open = runtime.reduceActivity(activity, due.activities.open, { type: "submit" }, NOW + DAY, "session-b");
  const pending = due.activities.open.attempts[1];
  assert.equal(pending.correct, null); assert.equal(pending.assisted, false);
  const beforeReview = { ...due.activities.open.review };
  const restored = runtime.prepareSession(lesson, runtime.validateImport(lesson, runtime.exportEnvelope(lesson, due, NOW + DAY + 100)), NOW + DAY + 100, "session-c");
  assert.equal(restored.activities.open.status, "submitted");
  assert.equal(restored.activities.open.draft, answer);
  assert.equal(restored.activities.open.submittedAttemptId, pending.id);
  assert.deepEqual(restored.activities.open.attempts[1], pending);
  assert.deepEqual(restored.activities.open.review, beforeReview, "normal feedback does not postpone this submitted response's review eligibility");
  assert.equal(restored.activities.open.exposure.reference, true);
  assert.equal(restored.activities.open.exposure.sessionId, "session-c", "visible feedback is tracked for future attempts");
  let reviewed = runtime.reduceActivity(activity, restored.activities.open, { type: "self-assess", correct: true }, NOW + DAY + 101, "session-c");
  assert.equal(reviewed.attempts.length, 2);
  assert.equal(reviewed.attempts[1].id, pending.id);
  assert.equal(reviewed.attempts[1].assisted, false);
  assert.equal(reviewed.review.intervalIndex, 1);
  assert.equal(reviewed.review.dueAt, NOW + 4 * DAY + 101);
  reviewed = runtime.reduceActivity(activity, reviewed, { type: "retry" }, NOW + DAY + 102, "session-c");
  reviewed = runtime.reduceActivity(activity, reviewed, { type: "draft", value: answer }, NOW + DAY + 102, "session-c");
  reviewed = runtime.reduceActivity(activity, reviewed, { type: "submit" }, NOW + DAY + 102, "session-c");
  assert.equal(reviewed.attempts[2].assisted, true, "a later attempt still records the reference already viewed");
});

test("a due numeric hint survives refresh and stays assisted without a fabricated wrong answer", () => {
  const lesson = fixture(); lesson.activities[1].hint = "Compare event width with support width.";
  const activity = lesson.activities[1], practice = reducer(activity);
  practice.event({ type: "draft", value: "0.1" }); practice.event({ type: "submit" });
  const prior = runtime.createState(lesson, NOW); prior.activities.numeric = practice.value;
  const due = runtime.prepareSession(lesson, prior, NOW + DAY, "session-b");
  due.activities.numeric = runtime.reduceActivity(activity, due.activities.numeric, { type: "hint" }, NOW + DAY + 1, "session-b");
  assert.equal(due.activities.numeric.attempts.length, 1, "hint viewing adds no attempt");
  assert.equal(due.activities.numeric.review.dueAt, NOW + 2 * DAY + 1);
  const refreshed = runtime.prepareSession(lesson, due, NOW + DAY + 2, "session-c");
  assert.equal(refreshed.activities.numeric.hintUsed, true);
  assert.equal(refreshed.activities.numeric.exposure.hint, true);
  let next = runtime.reduceActivity(activity, refreshed.activities.numeric, { type: "draft", value: "9/20" }, NOW + DAY + 2, "session-c");
  next = runtime.reduceActivity(activity, next, { type: "submit" }, NOW + DAY + 2, "session-c");
  assert.equal(next.attempts[1].correct, true);
  assert.equal(next.attempts[1].assisted, true);
  assert.equal(next.review.intervalIndex, 0);
  assert.equal(next.attempts.length, 2);
});

test("recent exposure cannot be bypassed by a fresh session ID and an older due timestamp", () => {
  const exposure = runtime.markExposure(null, "hint", NOW + DAY + 1, "session-b");
  const oldDue = { intervalIndex: 0, dueAt: NOW + DAY, lastReviewedAt: NOW, lastSessionId: "session-a", evidenceSource: "objective" };
  assert.equal(runtime.exposureAssists(exposure, oldDue, NOW + DAY + 2, "session-c"), true);
  assert.equal(runtime.exposureAssists(exposure, oldDue, NOW + 2 * DAY, "session-d"), true);
  assert.equal(runtime.exposureAssists(exposure, oldDue, NOW + 2 * DAY + 1, "session-d"), false);
});

test("an early new-session retry with hidden reference still waits for the scheduled due review", () => {
  const activity = fixture().activities[0], practice = reducer(activity);
  practice.event({ type: "draft", value: "a" }); practice.event({ type: "submit" }); practice.event({ type: "retry" });
  practice.at(NOW + DAY / 2, "session-b").event({ type: "draft", value: "a" });
  assert.equal(practice.event({ type: "submit" }).attempts[1].assisted, true);
});

test("open response text is retained, and a self-evaluation updates exactly the submitted attempt", () => {
  const practice = reducer(fixture().activities[2]);
  const response = "An area over a small interval approximates density × width. <script>learner text</script>";
  practice.event({ type: "draft", value: response });
  let state = practice.event({ type: "submit" });
  assert.equal(state.draft, response);
  assert.equal(state.attempts[0].answer, response);
  assert.equal(state.attempts[0].correct, null);
  assert.equal(state.attempts[0].source, "self");
  assert.equal(state.review, null);
  const id = state.attempts[0].id;
  state = practice.event({ type: "self-assess", correct: true });
  assert.equal(state.attempts.length, 1);
  assert.equal(state.attempts[0].id, id);
  assert.equal(state.attempts[0].correct, true);
  assert.equal(state.review.evidenceSource, "self");
  assert.equal(practice.event({ type: "self-assess", correct: false }).attempts[0].correct, true, "same attempt cannot be re-scored repeatedly");
});

test("flashcards separate revealing, self-rating, navigation, hint use and per-card reviews", () => {
  const practice = reducer(fixture().activities[3]);
  assert.equal(practice.event({ type: "flash-rate", correct: true }).attempts.length, 0);
  practice.event({ type: "flash-hint" });
  let state = practice.event({ type: "flash-flip" });
  assert.equal(state.attempts.length, 0, "turning a card is not evidence of recall");
  state = practice.event({ type: "flash-rate", correct: true });
  assert.equal(state.attempts[0].source, "self");
  assert.equal(state.attempts[0].assisted, true);
  assert.equal(state.attempts[0].cardIndex, 0);
  assert.equal(state.attempts[0].answer, "自评：翻面前已回忆");
  assert.equal(practice.event({ type: "flash-rate", correct: false }).attempts.length, 1);
  practice.event({ type: "flash-index", index: 1 });
  practice.event({ type: "flash-flip" });
  state = practice.event({ type: "flash-rate", correct: false });
  assert.equal(state.attempts.length, 2);
  assert.equal(state.flash.cards["0"].rating, "recalled");
  assert.equal(state.flash.cards["1"].rating, "again");
  assert.equal(state.flash.cards["1"].review.evidenceSource, "self");
  practice.event({ type: "flash-restart", index: 0 });
  assert.equal(practice.value.flash.cards["0"].revealed, false);
  assert.equal(practice.value.flash.cards["0"].hintUsed, false);
  assert.equal(practice.value.flash.cards["0"].rating, null);
  assert.ok(practice.value.flash.cards["0"].review);
});

test("same-card checks remain assisted within a session, while a due new session restores the front first", () => {
  const lesson = fixture(), activity = lesson.activities[3], practice = reducer(activity);
  practice.event({ type: "flash-flip" });
  let saved = practice.event({ type: "flash-rate", correct: true });
  assert.equal(saved.attempts[0].source, "self"); assert.equal(saved.attempts[0].assisted, false);
  practice.event({ type: "flash-restart" }); practice.event({ type: "flash-flip" });
  saved = practice.event({ type: "flash-rate", correct: true });
  assert.equal(saved.attempts[1].assisted, true);
  assert.equal(saved.attempts[0].assisted, false);
  const prior = runtime.createState(lesson, NOW); prior.activities.cards = saved;
  const fresh = runtime.prepareSession(lesson, prior, NOW + DAY, "session-b").activities.cards;
  assert.equal(fresh.flash.cards["0"].revealed, false);
  assert.equal(fresh.flash.cards["0"].rating, null);
  assert.equal(fresh.flash.cards["0"].hintUsed, false);
  assert.equal(fresh.flash.cards["0"].recallAssisted, false);
  let next = runtime.reduceActivity(activity, fresh, { type: "flash-flip" }, NOW + DAY, "session-b");
  next = runtime.reduceActivity(activity, next, { type: "flash-rate", correct: true }, NOW + DAY, "session-b");
  assert.equal(next.attempts[2].assisted, false);
  assert.equal(next.attempts[2].source, "self");
  assert.equal(next.flash.cards["0"].review.intervalIndex, 1);
});

test("linked flashcard solutions constrain every subsequent recall without rewriting a frozen self-report", () => {
  const activity = {...fixture().activities[3], solutionId: "shared-solution"};
  const before = reducer(activity);
  before.event({type: "reveal"}); before.event({type: "flash-flip"});
  let saved = before.event({type: "flash-rate", correct: true});
  assert.equal(saved.exposure.reference, true);
  assert.equal(saved.attempts[0].assisted, true, "a complete solution read before the first flip assists recall");
  assert.equal(saved.attempts[0].source, "self");
  before.event({type: "flash-index", index: 1}); before.event({type: "flash-flip"});
  saved = before.event({type: "flash-rate", correct: true});
  assert.equal(saved.attempts[1].assisted, true, "the linked solution also applies to an unflipped card");

  const after = reducer(activity);
  after.event({type: "flash-flip"}); after.at(NOW + 1).event({type: "reveal"});
  saved = after.event({type: "flash-rate", correct: true});
  assert.equal(saved.attempts[0].assisted, false, "first-flip evidence precedes a later complete-solution view");
  after.at(NOW + 2).event({type: "reveal"});
  assert.equal(after.value.attempts[0].assisted, false, "a completed self-report is immutable");
  after.event({type: "flash-restart"}); after.event({type: "flash-flip"});
  saved = after.event({type: "flash-rate", correct: true});
  assert.equal(saved.attempts[1].assisted, true, "the subsequent recall retains reference exposure");
});

test("linked flashcard solutions obey the same before-flip boundary on a due review and after import", () => {
  const lesson = fixture(), activity = lesson.activities[3]; activity.solutionId = "shared-solution";
  const practice = reducer(activity); practice.event({type: "flash-flip"}); practice.event({type: "flash-rate", correct: true});
  const prior = runtime.createState(lesson, NOW); prior.activities.cards = practice.value;
  const due = NOW + DAY;
  let before = runtime.prepareSession(lesson, prior, due, "session-b");
  before.activities.cards = runtime.reduceActivity(activity, before.activities.cards, {type: "reveal"}, due, "session-b");
  // Importing the older snapshot cannot erase a solution seen in this open page.
  let restored = runtime.prepareSession(lesson, prior, due, "session-b", before).activities.cards;
  restored = runtime.reduceActivity(activity, restored, {type: "flash-flip"}, due, "session-b");
  restored = runtime.reduceActivity(activity, restored, {type: "flash-rate", correct: true}, due, "session-b");
  assert.equal(restored.attempts.at(-1).assisted, true); assert.equal(restored.flash.cards["0"].review.intervalIndex, 0);

  let after = runtime.prepareSession(lesson, prior, due, "session-c").activities.cards;
  after = runtime.reduceActivity(activity, after, {type: "flash-flip"}, due, "session-c");
  after = runtime.reduceActivity(activity, after, {type: "reveal"}, due + 1, "session-c");
  after = runtime.reduceActivity(activity, after, {type: "flash-rate", correct: true}, due + 1, "session-c");
  assert.equal(after.attempts.at(-1).assisted, false); assert.equal(after.flash.cards["0"].review.intervalIndex, 1);
  assert.equal(after.attempts.at(-1).source, "self");

  const waiting = runtime.createState(lesson, NOW); waiting.activities.cards = restored;
  const nextTime = due + DAY;
  let fresh = runtime.prepareSession(lesson, waiting, nextTime, "session-d").activities.cards;
  assert.equal(fresh.answerRevealed, false, "old linked-details display state is not a fresh exposure");
  fresh = runtime.reduceActivity(activity, fresh, {type: "flash-flip"}, nextTime, "session-d");
  fresh = runtime.reduceActivity(activity, fresh, {type: "flash-rate", correct: true}, nextTime, "session-d");
  assert.equal(fresh.attempts.at(-1).assisted, false); assert.equal(fresh.flash.cards["0"].review.intervalIndex, 1);
});

test("import preparation hides due references but retains exposure already recorded in the current page", () => {
  const lesson = fixture(), activity = lesson.activities[0], practice = reducer(activity);
  practice.event({ type: "draft", value: "b" }); practice.event({ type: "submit" });
  const imported = runtime.createState(lesson, NOW); imported.activities.choice = practice.value;
  const current = runtime.prepareSession(lesson, imported, NOW + DAY, "session-b");
  current.activities.choice = runtime.reduceActivity(activity, current.activities.choice, { type: "reveal" }, NOW + DAY, "session-b");
  const prepared = runtime.prepareSession(lesson, imported, NOW + DAY, "session-b", current);
  assert.equal(prepared.activities.choice.answerRevealed, false);
  assert.equal(prepared.activities.choice.exposure.sessionId, "session-b");
  let next = runtime.reduceActivity(activity, prepared.activities.choice, { type: "draft", value: "a" }, NOW + DAY, "session-b");
  next = runtime.reduceActivity(activity, next, { type: "submit" }, NOW + DAY, "session-b");
  assert.equal(next.attempts[1].assisted, true);
  assert.equal(next.review.intervalIndex, 0);
});

test("legacy v1 imports infer missing exposure explicitly without forging hint flags", () => {
  const lesson = fixture(), activity = lesson.activities[0], practice = reducer(activity);
  practice.event({ type: "draft", value: "b" }); practice.event({ type: "submit" }); practice.event({ type: "retry" });
  const state = runtime.createState(lesson, NOW); state.activities.choice = practice.value;
  const envelope = runtime.exportEnvelope(lesson, state, NOW);
  for (const saved of Object.values(envelope.state.activities)) delete saved.exposure;
  const restored = runtime.validateImport(lesson, envelope);
  assert.equal(restored.activities.choice.hintUsed, false);
  assert.equal(restored.activities.choice.answerRevealed, false);
  assert.equal(restored.activities.choice.exposure.inferred, true);
  assert.equal(restored.activities.choice.exposure.hint, false);
  assert.equal(restored.activities.choice.exposure.reference, true);
  assert.deepEqual(restored.activities.choice.attempts, state.activities.choice.attempts);
  let next = runtime.reduceActivity(activity, restored.activities.choice, { type: "draft", value: "a" }, NOW, "session-a");
  next = runtime.reduceActivity(activity, next, { type: "submit" }, NOW, "session-a");
  assert.equal(next.attempts[1].assisted, true);
  const invalid = runtime.exportEnvelope(lesson, restored, NOW);
  invalid.state.activities.choice.exposure.hint = "not-a-boolean";
  assert.throws(() => runtime.validateImport(lesson, invalid), /exposure/);
});

test("review labels distinguish reference-only scheduling from submitted objective and self evidence", () => {
  const lesson = fixture(), state = runtime.createState(lesson, NOW);
  const quiz = lesson.activities[0], cards = lesson.activities[3], open = lesson.activities[2];
  state.activities.choice = runtime.reduceActivity(quiz, state.activities.choice, { type: "reveal" }, NOW, "a");
  state.activities.cards = runtime.reduceActivity(cards, state.activities.cards, { type: "flash-hint" }, NOW, "a");
  let reviews = runtime.getReviews(lesson, state, NOW);
  assert.equal(runtime.reviewEvidenceKind(state, reviews.find(item => item.activityId === "choice")), "not-attempted");
  assert.equal(runtime.reviewEvidenceKind(state, reviews.find(item => item.activityId === "cards")), "not-self-reviewed");
  assert.equal(state.activities.choice.review.evidenceSource, "objective", "record type is not rewritten to suit a label");
  state.activities.choice = runtime.reduceActivity(quiz, state.activities.choice, { type: "draft", value: "a" }, NOW, "a");
  state.activities.choice = runtime.reduceActivity(quiz, state.activities.choice, { type: "submit" }, NOW, "a");
  assert.equal(runtime.reviewEvidenceKind(state, reviews.find(item => item.activityId === "choice")), "objective");
  state.activities.open = runtime.reduceActivity(open, state.activities.open, { type: "reveal" }, NOW, "a");
  state.activities.open = runtime.reduceActivity(open, state.activities.open, { type: "draft", value: "An explanation" }, NOW, "a");
  state.activities.open = runtime.reduceActivity(open, state.activities.open, { type: "submit" }, NOW, "a");
  reviews = runtime.getReviews(lesson, state, NOW);
  const openReview = reviews.find(item => item.activityId === "open");
  assert.equal(runtime.reviewEvidenceKind(state, openReview), "not-self-reviewed");
  state.activities.open = runtime.reduceActivity(open, state.activities.open, { type: "self-assess", correct: true }, NOW, "a");
  assert.equal(runtime.reviewEvidenceKind(state, openReview), "self");
});

test("review intervals advance only for successful unassisted due reviews in a new session", () => {
  const success = { correct: true, assisted: false, source: "objective" };
  let review = runtime.scheduleReview(null, success, NOW, "a");
  assert.equal(review.intervalIndex, 0);
  assert.equal(review.dueAt, NOW + DAY);
  const early = runtime.scheduleReview(review, success, NOW + DAY - 1, "b");
  assert.deepEqual(early, review, "a refresh or early retry does not move the due date");
  const sameSession = runtime.scheduleReview(review, success, NOW + 2 * DAY, "a");
  assert.deepEqual(sameSession, review, "even a long open session cannot repeatedly advance the interval");
  review = runtime.scheduleReview(review, success, NOW + DAY, "b");
  assert.equal(review.intervalIndex, 1);
  assert.equal(review.dueAt, NOW + 4 * DAY);
  review = runtime.scheduleReview(review, success, NOW + 4 * DAY, "c");
  assert.equal(review.intervalIndex, 2);
  assert.equal(review.dueAt, NOW + 11 * DAY);
  review = runtime.scheduleReview(review, { correct: true, assisted: true, source: "objective" }, NOW + 5 * DAY, "d");
  assert.equal(review.intervalIndex, 0);
  assert.equal(review.dueAt, NOW + 6 * DAY);
  const skipped = runtime.scheduleReview(review, { skipped: true }, NOW + 6 * DAY, "e");
  assert.deepEqual(skipped, review);
  const wrong = runtime.scheduleReview(review, { correct: false, assisted: false, source: "objective" }, NOW + 8 * DAY, "e");
  assert.equal(wrong.dueAt, NOW + 9 * DAY);
});

test("CDF difference equals integrated linear density, including zero-width and complete intervals", () => {
  for (const [a, b] of [[0, 1], [0.2, 0.5], [0.9, 1], [0.4, 0.4]]) {
    const result = runtime.linearDensity({ a, b });
    const integral = 2 * b - b * b - (2 * a - a * a);
    assert.ok(Math.abs(result.probability - integral) < 1e-12);
    assert.ok(result.probability >= 0 && result.probability <= 1);
  }
  assert.equal(runtime.linearDensity({ a: 0, b: 1 }).probability, 1);
  assert.equal(runtime.linearDensity({ a: 0.4, b: 0.4 }).probability, 0);
  assert.deepEqual(runtime.updateParameter("linear-density", { a: 0.2, b: 0.5 }, "a", 0.9), { a: 0.5, b: 0.5 });
});

test("uniform model handles support changes, partial overlap and events outside the support", () => {
  const parameters = { lower: -1.4, upper: 6.6, eventA: 3, eventB: 6.6 };
  const result = runtime.uniformDistribution(parameters);
  assert.equal(result.height, 0.125);
  assert.ok(Math.abs(result.mean - 2.6) < 1e-12);
  assert.ok(Math.abs(result.probability - 0.45) < 1e-12);
  assert.equal(runtime.uniformDistribution({ lower: 0, upper: 1, eventA: -4, eventB: 3 }).probability, 1);
  assert.equal(runtime.uniformDistribution({ lower: 0, upper: 1, eventA: 2, eventB: 3 }).probability, 0);
  assert.equal(runtime.uniformDistribution({ lower: 0, upper: 2, eventA: -1, eventB: 1 }).probability, 0.5);
  assert.throws(() => runtime.uniformDistribution({ lower: 1, upper: 1, eventA: 0, eventB: 2 }), /Invalid uniform/);
  assert.ok(runtime.updateParameter("uniform", parameters, "lower", 10).lower < parameters.upper);
  assert.ok(runtime.updateParameter("uniform", parameters, "upper", -5).upper > parameters.lower);
});

test("uniform exploration starts with general teaching parameters, separate from the later S2 question", () => {
  const parameters = runtime.defaultExploration("uniform");
  assert.deepEqual(parameters, { lower: 0, upper: 8, eventA: 2, eventB: 5 });
  const result = runtime.uniformDistribution(parameters);
  assert.equal(result.mean, 4);
  assert.equal(result.probability, 3 / 8);
  assert.notEqual(result.mean, 2.6, "the later Q1 mean is not the initial displayed metric");
  assert.notEqual(result.probability, 9 / 20, "the later Q1 probability is not the initial displayed metric");
  const activity = fixture().activities.find(item => item.id === "uniform");
  const practice = reducer(activity);
  practice.event({ type: "explore", key: "eventA", value: 3 });
  assert.deepEqual(practice.event({ type: "explore-reset" }).exploration, parameters);
});

test("steps, parameter changes, custom exploration, notes and bookmarks do not manufacture correct answers", () => {
  const lesson = fixture();
  const state = runtime.createState(lesson, NOW);
  for (const id of ["steps", "linear", "custom"]) {
    const activity = lesson.activities.find(item => item.id === id);
    const event = id === "steps" ? { type: "step", index: 1 } : id === "linear" ? { type: "explore", key: "a", value: 0.3 } : { type: "explore", state: { temperature: 25, correctness: 100 } };
    state.activities[id] = runtime.reduceActivity(activity, state.activities[id], event, NOW, "a");
    assert.equal(state.activities[id].attempts.length, 0);
  }
  let summary = runtime.evidenceSummary(lesson, state, NOW);
  assert.equal(summary.participated, 3);
  assert.equal(summary.independentPassed, 0);
  assert.equal(summary.selfReviewed, 0);
  const choice = lesson.activities[0];
  state.activities.choice = runtime.reduceActivity(choice, state.activities.choice, { type: "note", value: "Keep the area separate from height." }, NOW, "a");
  state.activities.choice = runtime.reduceActivity(choice, state.activities.choice, { type: "bookmark" }, NOW, "a");
  assert.equal(state.activities.choice.bookmarked, true);
  assert.match(state.activities.choice.notes, /area/);
  assert.equal(runtime.evidenceSummary(lesson, state, NOW).independentPassed, 0);
});

test("objective checks and self-review counts remain distinct; due cards count individually", () => {
  const lesson = fixture(), state = runtime.createState(lesson, NOW);
  for (const [id, answer] of [["choice", "a"], ["numeric", "9/20"], ["open", "Density integrates to probability."]]) {
    const activity = lesson.activities.find(item => item.id === id);
    let saved = runtime.reduceActivity(activity, state.activities[id], { type: "draft", value: answer }, NOW, "a");
    if (id === "numeric") saved = runtime.reduceActivity(activity, saved, { type: "hint" }, NOW, "a");
    saved = runtime.reduceActivity(activity, saved, { type: "submit" }, NOW, "a");
    if (id === "open") saved = runtime.reduceActivity(activity, saved, { type: "self-assess", correct: true }, NOW, "a");
    state.activities[id] = saved;
  }
  const cards = lesson.activities.find(item => item.id === "cards");
  for (const index of [0, 1]) {
    let saved = runtime.reduceActivity(cards, state.activities.cards, { type: "flash-index", index }, NOW, "a");
    saved = runtime.reduceActivity(cards, saved, { type: "flash-flip" }, NOW, "a");
    state.activities.cards = runtime.reduceActivity(cards, saved, { type: "flash-rate", correct: true }, NOW, "a");
  }
  const summary = runtime.evidenceSummary(lesson, state, NOW + DAY);
  assert.equal(summary.independentPassed, 1, "assisted numeric pass and self-reports excluded");
  assert.equal(summary.selfReviewed, 2);
  assert.equal(summary.due, 5, "three quiz reviews and two independent card reviews");
});

test("progress round-trip preserves answers, identity, evidence, custom state and literal learner text", () => {
  const lesson = fixture(), state = runtime.createState(lesson, NOW);
  const open = lesson.activities.find(item => item.id === "open");
  state.activities.open = runtime.reduceActivity(open, state.activities.open, { type: "draft", value: "<img src=x onerror=alert(1)> is literal learner text" }, NOW, "a");
  state.activities.open = runtime.reduceActivity(open, state.activities.open, { type: "submit" }, NOW, "a");
  state.activities.open = runtime.reduceActivity(open, state.activities.open, { type: "note", value: "A note with <b>literal brackets</b>." }, NOW, "a");
  state.currentActivity = "open";
  const envelope = runtime.exportEnvelope(lesson, state, NOW);
  assert.deepEqual(runtime.validateImport(lesson, JSON.stringify(envelope)), state);
  assert.notStrictEqual(runtime.validateImport(lesson, envelope), state);
  assert.notEqual(runtime.storageKey(lesson), runtime.storageKey({ ...lesson, revision: "r2" }));
  assert.notEqual(runtime.storageKey(lesson), runtime.storageKey({ ...lesson, lessonId: "another" }));
});

test("imports reject mismatched versions, activities, objectives, malformed attempts and forged evidence types", () => {
  const lesson = fixture();
  const envelope = () => runtime.exportEnvelope(lesson, runtime.createState(lesson, NOW), NOW);
  const mutations = [
    value => { value.schemaVersion = 2; },
    value => { value.lessonId = "another"; },
    value => { value.revision = "r2"; },
    value => { value.state.activities.choice.objectiveId = "another"; },
    value => { value.state.activities.unknown = value.state.activities.choice; },
    value => { value.state.activities.choice.status = "submitted"; },
    value => { value.state.activities.choice.review = { intervalIndex: 100, dueAt: NOW }; },
    value => { value.state.activities.linear.exploration.a = 2; },
    value => { value.state.activities.steps.stepIndex = 99; },
    value => { value.state.activities.cards.flash.index = -1; }
  ];
  for (const mutate of mutations) { const value = envelope(); mutate(value); assert.throws(() => runtime.validateImport(lesson, value)); }
  const forged = envelope();
  forged.state.activities.open.attempts.push({ id: "one", answer: "pass", correct: true, source: "objective", assisted: false, time: NOW, sessionId: "a" });
  assert.throws(() => runtime.validateImport(lesson, forged), /self-report/);
  const exploration = envelope();
  exploration.state.activities.custom.attempts.push({ id: "one", answer: "pass", correct: true, source: "objective", assisted: false, time: NOW, sessionId: "a" });
  assert.throws(() => runtime.validateImport(lesson, exploration), /Exploration/);
});

test("the reducer is immutable and runtime lesson validation rejects invalid identities and missing answers", () => {
  const lesson = fixture();
  assert.strictEqual(runtime.validateLesson(lesson), lesson);
  const state = runtime.blankActivity(lesson.activities[0]), before = JSON.stringify(state);
  runtime.reduceActivity(lesson.activities[0], state, { type: "draft", value: "a" }, NOW, "session-a");
  assert.equal(JSON.stringify(state), before);
  const duplicate = fixture(); duplicate.activities[1].id = "choice";
  assert.throws(() => runtime.validateLesson(duplicate), /identity/);
  const missingAnswer = fixture(); delete missingAnswer.activities[0].answer;
  assert.throws(() => runtime.validateLesson(missingAnswer), /answer/);
  const invalidTolerance = fixture(); invalidTolerance.activities[1].tolerance = -1;
  assert.throws(() => runtime.validateLesson(invalidTolerance), /tolerance/);
  const invalidId = fixture(); invalidId.objectives[0].id = "__proto__";
  assert.throws(() => runtime.validateLesson(invalidId), /objective/);
});
