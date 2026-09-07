/* DialogueTutor portable learning interactions, contract v1.
 * Design sources: HKUDS/DeepTutor Books FlashCardsBlock, QuizBlock,
 * InteractiveBlock, PageReader, BookLearningOverlay; shared QuizViewer;
 * learning/scheduler.py. This implementation is independent vanilla JS.
 * Review intervals are a disclosed heuristic, not a fitted forgetting curve.
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.document) {
    root.DialogueTutor = api;
    var start = function () {
      var data = root.document.getElementById("dt-lesson");
      if (data && !api.instance) {
        try { api.instance = api.mount(JSON.parse(data.textContent), root.document); }
        catch (error) {
          var target = root.document.querySelector("[data-dt-study]") || data.parentNode;
          var notice = root.document.createElement("p");
          notice.className = "dt-error";
          notice.textContent = "学习活动载入错误：" + error.message;
          target.appendChild(notice);
        }
      }
    };
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  var DAY = 86400000;
  var INTERVAL_DAYS = [1, 3, 7, 14, 30];
  var TYPES = ["flashcards", "quiz", "steps", "explore", "interactive"];
  var has = function (object, key) { return Object.prototype.hasOwnProperty.call(object, key); };
  var copy = function (value) { return JSON.parse(JSON.stringify(value)); };
  var clamp = function (value, lower, upper) { return Math.min(upper, Math.max(lower, value)); };
  var finite = function (value) { return typeof value === "number" && Number.isFinite(value); };
  var record = function (value) { return value !== null && typeof value === "object" && !Array.isArray(value); };
  var safeId = function (value) { return typeof value === "string" && value.length > 0 && !["__proto__", "prototype", "constructor"].includes(value); };

  function parseNumeric(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value !== "string") return null;
    var input = value.trim().replace(/\u2212/g, "-");
    var number = "[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][+-]?\\d+)?";
    if (new RegExp("^" + number + "$", "u").test(input)) {
      var decimal = Number(input);
      return Number.isFinite(decimal) ? decimal : null;
    }
    var fraction = input.match(new RegExp("^(" + number + ")\\s*/\\s*(" + number + ")$", "u"));
    if (!fraction || Number(fraction[2]) === 0) return null;
    var result = Number(fraction[1]) / Number(fraction[2]);
    return Number.isFinite(result) ? result : null;
  }

  function evaluateQuiz(activity, answer) {
    var text = String(answer == null ? "" : answer).trim();
    if (!text) return { valid: false, correct: null, error: "empty" };
    if (activity.format === "open") return { valid: true, correct: null, source: "self" };
    if (activity.format === "choice") {
      if (!activity.choices.some(function (choice) { return choice.id === text; })) return { valid: false, correct: null, error: "choice" };
      return { valid: true, correct: text === String(activity.answer), source: "objective" };
    }
    var actual = parseNumeric(text);
    var expected = parseNumeric(activity.answer);
    if (actual === null || expected === null) return { valid: false, correct: null, error: "numeric" };
    var tolerance = activity.tolerance === undefined ? 1e-8 : activity.tolerance;
    return { valid: true, correct: Math.abs(actual - expected) <= tolerance, source: "objective" };
  }

  function scheduleReview(previous, evidence, now, sessionId) {
    if (evidence.skipped) return previous ? copy(previous) : null;
    var next = previous ? copy(previous) : null;
    var failedOrAssisted = evidence.correct === false || evidence.assisted === true;
    if (evidence.correct === null && !failedOrAssisted) return next;
    if (!next || failedOrAssisted) {
      return { intervalIndex: 0, dueAt: now + DAY, lastReviewedAt: now, lastSessionId: sessionId, evidenceSource: evidence.source };
    }
    // Early practice and repeated actions in this browser session do not move the due date.
    if (evidence.correct === true && !evidence.assisted && now >= next.dueAt && next.lastSessionId !== sessionId) {
      next.intervalIndex = Math.min(INTERVAL_DAYS.length - 1, next.intervalIndex + 1);
      next.dueAt = now + INTERVAL_DAYS[next.intervalIndex] * DAY;
      next.lastReviewedAt = now;
      next.lastSessionId = sessionId;
      next.evidenceSource = evidence.source;
    }
    return next;
  }

  function linearDensity(interval) {
    if (!finite(Number(interval.a)) || !finite(Number(interval.b))) throw new Error("Invalid density interval");
    var a = clamp(Number(interval.a), 0, 1);
    var b = clamp(Number(interval.b), a, 1);
    var cdf = function (x) { return x <= 0 ? 0 : x >= 1 ? 1 : 2 * x - x * x; };
    return { a: a, b: b, fa: 2 - 2 * a, fb: 2 - 2 * b, cdfA: cdf(a), cdfB: cdf(b), probability: cdf(b) - cdf(a) };
  }

  function uniformDistribution(parameters) {
    var lower = Number(parameters.lower), upper = Number(parameters.upper);
    var eventA = Number(parameters.eventA), eventB = Number(parameters.eventB);
    if (![lower, upper, eventA, eventB].every(Number.isFinite) || upper <= lower || eventB < eventA) throw new Error("Invalid uniform parameters");
    var cdf = function (x) { return clamp((x - lower) / (upper - lower), 0, 1); };
    return {
      lower: lower, upper: upper, eventA: eventA, eventB: eventB,
      height: 1 / (upper - lower), mean: (lower + upper) / 2,
      clippedA: clamp(eventA, lower, upper), clippedB: clamp(eventB, lower, upper),
      cdfA: cdf(eventA), cdfB: cdf(eventB), probability: cdf(eventB) - cdf(eventA)
    };
  }

  function defaultExploration(model) {
    return model === "linear-density" ? { a: 0.2, b: 0.5 } : { lower: 0, upper: 8, eventA: 2, eventB: 5 };
  }

  function updateParameter(model, parameters, key, value) {
    var next = Object.assign({}, parameters);
    if (!finite(Number(value)) || !has(next, key)) return next;
    if (model === "linear-density") {
      next[key] = clamp(Number(value), 0, 1);
      if (key === "a") next.a = Math.min(next.a, next.b);
      else next.b = Math.max(next.b, next.a);
    } else {
      next[key] = clamp(Number(value), -5, 10);
      if (key === "lower") next.lower = Math.min(next.lower, next.upper - 0.1);
      if (key === "upper") next.upper = Math.max(next.upper, next.lower + 0.1);
      if (key === "eventA") next.eventA = Math.min(next.eventA, next.eventB);
      if (key === "eventB") next.eventB = Math.max(next.eventB, next.eventA);
      next[key] = Math.round(next[key] * 10000) / 10000;
    }
    return next;
  }

  function blankActivity(activity) {
    return {
      id: activity.id, objectiveId: activity.objectiveId, type: activity.type,
      draft: "", status: "idle", answerRevealed: false, hintUsed: false,
      exposure: null,
      attempts: [], submittedAttemptId: null, review: null,
      participated: false, lastInteractionAt: null, notes: "", bookmarked: false,
      flash: { index: 0, cards: {} }, stepIndex: 0,
      exploration: activity.type === "explore" ? defaultExploration(activity.model) : {}, explorationCount: 0
    };
  }

  function createState(lesson, now) {
    var activities = {};
    lesson.activities.forEach(function (activity) { activities[activity.id] = blankActivity(activity); });
    return { lessonId: lesson.lessonId, revision: lesson.revision, createdAt: now, updatedAt: now, currentActivity: null, activities: activities };
  }

  function flashCardState(state, index) {
    if (!has(state.flash.cards, String(index))) state.flash.cards[String(index)] = {
      revealed: false, hintUsed: false, rating: null, review: null, attemptId: null,
      exposure: null, recallAssisted: false, recallSessionId: null
    };
    return state.flash.cards[String(index)];
  }

  function markExposure(previous, kind, now, sessionId) {
    var next = previous && previous.sessionId === sessionId && !previous.inferred ? copy(previous) : {
      sessionId: sessionId, hint: false, reference: false, observedAt: now, inferred: false
    };
    next[kind] = true;
    next.observedAt = now;
    next.inferred = false;
    return next;
  }

  function exposureAssists(exposure, review, now, sessionId) {
    if (!exposure || (!exposure.hint && !exposure.reference)) return false;
    if (exposure.sessionId === sessionId) return true;
    // An early new-tab retry is still practice after seeing the reference.
    var nextIndependentAt = Math.max(review ? review.dueAt : 0, exposure.observedAt + DAY);
    return now < nextIndependentAt;
  }

  function prepareSession(lesson, savedState, now, sessionId, previousState) {
    var prepared = copy(savedState);
    lesson.activities.forEach(function (activity) {
      var saved = prepared.activities[activity.id];
      var previous = previousState && previousState.activities[activity.id];
      // Importing an older file must not erase references already seen in this open page.
      if (previous && previous.exposure && previous.exposure.sessionId === sessionId) saved.exposure = copy(previous.exposure);
      if (activity.type === "quiz") {
        var submitted = saved.attempts.find(function (attempt) { return attempt.id === saved.submittedAttemptId; });
        var pendingSelfReview = saved.status === "submitted" && submitted && submitted.source === "self" && submitted.correct === null;
        // A due timestamp is not an attempt status: preserve an unfinished response.
        if (saved.review && saved.review.dueAt <= now && saved.status === "submitted" && !pendingSelfReview) {
          saved.status = "idle"; saved.draft = ""; saved.answerRevealed = false;
          saved.hintUsed = false; saved.submittedAttemptId = null;
        } else {
          if (saved.answerRevealed) {
            saved.exposure = markExposure(saved.exposure, "reference", now, sessionId);
            // Feedback shown after a submitted response only constrains future attempts;
            // it must not rewrite the pending response's original due-review eligibility.
            if (!pendingSelfReview) saved.review = scheduleReview(saved.review, { correct: null, assisted: true, source: activity.format === "open" ? "self" : "objective" }, now, sessionId);
          }
          if (saved.hintUsed && activity.hint) {
            saved.exposure = markExposure(saved.exposure, "hint", now, sessionId);
            if (!pendingSelfReview) saved.review = scheduleReview(saved.review, { correct: null, assisted: true, source: activity.format === "open" ? "self" : "objective" }, now, sessionId);
          }
        }
      }
      if (activity.type === "flashcards") {
        if (previous) Object.keys(previous.flash.cards).forEach(function (key) {
          var oldCard = previous.flash.cards[key];
          if (oldCard.exposure && oldCard.exposure.sessionId === sessionId) flashCardState(saved, Number(key)).exposure = copy(oldCard.exposure);
        });
        Object.keys(saved.flash.cards).forEach(function (key) {
          var card = saved.flash.cards[key];
          var oldCard = previous && previous.flash.cards[key];
          if (oldCard && oldCard.exposure && oldCard.exposure.sessionId === sessionId) card.exposure = copy(oldCard.exposure);
          if (card.review && card.review.dueAt <= now && card.rating !== null) {
            card.revealed = false; card.hintUsed = false; card.rating = null; card.attemptId = null;
            card.recallAssisted = exposureAssists(card.exposure, card.review, now, sessionId);
            card.recallSessionId = null;
          } else if (Number(key) === saved.flash.index) {
            if (card.revealed) {
              card.exposure = markExposure(card.exposure, "reference", now, sessionId);
              card.review = scheduleReview(card.review, { correct: null, assisted: true, source: "self" }, now, sessionId);
            }
            if (card.hintUsed && activity.cards[Number(key)].hint) {
              card.exposure = markExposure(card.exposure, "hint", now, sessionId);
              card.review = scheduleReview(card.review, { correct: null, assisted: true, source: "self" }, now, sessionId);
            }
          }
        });
      }
    });
    return prepared;
  }

  function reduceActivity(activity, current, event, now, sessionId) {
    var state = copy(current);
    var attempt, card, grade;
    function makeAttempt(answer, correct, source, assisted, cardIndex) {
      var result = { id: activity.id + ":" + now + ":" + (state.attempts.length + 1), answer: answer,
        correct: correct, source: source, assisted: !!assisted, time: now, sessionId: sessionId };
      if (cardIndex !== undefined) result.cardIndex = cardIndex;
      state.attempts.push(result);
      return result;
    }
    switch (event.type) {
      case "draft":
        if (state.status !== "idle") return state;
        state.draft = String(event.value); break;
      case "hint":
        state.hintUsed = true;
        state.exposure = markExposure(state.exposure, "hint", now, sessionId);
        state.review = scheduleReview(state.review, { correct: null, assisted: true, source: activity.format === "open" ? "self" : "objective" }, now, sessionId);
        break;
      case "reveal":
        if (!state.answerRevealed && state.status !== "submitted") {
          state.review = scheduleReview(state.review, { correct: null, assisted: true, source: activity.format === "open" ? "self" : "objective" }, now, sessionId);
        }
        state.answerRevealed = true;
        state.exposure = markExposure(state.exposure, "reference", now, sessionId);
        break;
      case "submit":
        if (state.status !== "idle") return state;
        grade = evaluateQuiz(activity, state.draft);
        if (!grade.valid) return state;
        attempt = makeAttempt(state.draft, grade.correct, grade.source, state.hintUsed || state.answerRevealed || exposureAssists(state.exposure, state.review, now, sessionId));
        state.submittedAttemptId = attempt.id;
        state.status = "submitted";
        state.answerRevealed = true;
        state.review = scheduleReview(state.review, attempt, now, sessionId);
        // Freeze the just-submitted attempt before exposing its feedback.
        state.exposure = markExposure(state.exposure, "reference", now, sessionId);
        break;
      case "self-assess":
        if (activity.format !== "open" || state.status !== "submitted" || typeof event.correct !== "boolean") return state;
        attempt = state.attempts.find(function (item) { return item.id === state.submittedAttemptId; });
        if (!attempt || attempt.correct !== null) return state;
        attempt.correct = event.correct;
        attempt.selfRating = event.correct ? "meets-rubric" : "needs-practice";
        attempt.assessedAt = now;
        state.review = scheduleReview(state.review, attempt, now, sessionId);
        break;
      case "retry":
        state.status = "idle"; state.draft = ""; state.answerRevealed = false; state.hintUsed = false; state.submittedAttemptId = null; break;
      case "skip":
        if (state.status !== "idle") return state;
        state.status = "skipped"; break;
      case "flash-index":
        state.flash.index = clamp(event.index, 0, activity.cards.length - 1);
        card = flashCardState(state, state.flash.index);
        if (card.revealed) card.exposure = markExposure(card.exposure, "reference", now, sessionId);
        if (card.hintUsed && activity.cards[state.flash.index].hint) card.exposure = markExposure(card.exposure, "hint", now, sessionId);
        break;
      case "flash-flip":
        card = flashCardState(state, state.flash.index);
        if (!card.revealed) {
          card.recallAssisted = !!card.recallAssisted || exposureAssists(card.exposure, card.review, now, sessionId);
          card.recallSessionId = sessionId;
          card.exposure = markExposure(card.exposure, "reference", now, sessionId);
        }
        card.revealed = !card.revealed;
        break;
      case "flash-hint":
        card = flashCardState(state, state.flash.index); card.hintUsed = true;
        card.recallAssisted = true;
        card.exposure = markExposure(card.exposure, "hint", now, sessionId);
        card.review = scheduleReview(card.review, { correct: null, assisted: true, source: "self" }, now, sessionId);
        break;
      case "flash-rate":
        card = flashCardState(state, state.flash.index);
        if (!card.revealed || card.rating !== null || typeof event.correct !== "boolean") return state;
        card.rating = event.correct ? "recalled" : "again";
        attempt = makeAttempt(event.correct ? "自评：翻面前已回忆" : "自评：仍需回忆", event.correct, "self", card.hintUsed || card.recallAssisted || card.recallSessionId !== sessionId, state.flash.index);
        card.attemptId = attempt.id;
        card.review = scheduleReview(card.review, attempt, now, sessionId);
        break;
      case "flash-restart":
        if (event.index !== undefined) state.flash.index = clamp(event.index, 0, activity.cards.length - 1);
        card = flashCardState(state, state.flash.index);
        card.revealed = false; card.hintUsed = false; card.rating = null; card.attemptId = null;
        card.recallAssisted = exposureAssists(card.exposure, card.review, now, sessionId);
        card.recallSessionId = null;
        break;
      case "step": state.stepIndex = clamp(event.index, 0, activity.steps.length - 1); break;
      case "explore":
        state.exploration = activity.type === "explore" ? updateParameter(activity.model, state.exploration, event.key, event.value) : copy(event.state || {});
        state.explorationCount += 1; break;
      case "explore-reset":
        state.exploration = defaultExploration(activity.model); state.explorationCount += 1; break;
      case "note": state.notes = String(event.value); break;
      case "bookmark": state.bookmarked = !state.bookmarked; break;
      default: return state;
    }
    if (!["bookmark", "draft"].includes(event.type)) state.participated = true;
    state.lastInteractionAt = now;
    return state;
  }

  function getReviews(lesson, state, now) {
    var items = [];
    lesson.activities.forEach(function (activity) {
      var saved = state.activities[activity.id];
      if (saved.review) items.push({ activityId: activity.id, title: activity.title, review: saved.review, due: saved.review.dueAt <= now });
      Object.keys(saved.flash.cards).forEach(function (key) {
        var card = saved.flash.cards[key];
        if (card.review) items.push({ activityId: activity.id, cardIndex: Number(key), title: activity.title + " · " + (Number(key) + 1), review: card.review, due: card.review.dueAt <= now });
      });
    });
    return items.sort(function (a, b) { return a.review.dueAt - b.review.dueAt; });
  }

  function evidenceSummary(lesson, state, now) {
    var summary = { participated: 0, independentPassed: 0, selfReviewed: 0, due: 0, total: lesson.activities.length };
    lesson.activities.forEach(function (activity) {
      var saved = state.activities[activity.id];
      if (saved.participated) summary.participated += 1;
      if (saved.attempts.some(function (attempt) { return attempt.source === "objective" && attempt.correct === true && !attempt.assisted; })) summary.independentPassed += 1;
      if (saved.attempts.some(function (attempt) { return attempt.source === "self" && attempt.correct !== null; })) summary.selfReviewed += 1;
    });
    summary.due = getReviews(lesson, state, now).filter(function (item) { return item.due; }).length;
    return summary;
  }

  function reviewEvidenceKind(state, item) {
    var saved = state.activities[item.activityId];
    var attempts = saved.attempts.filter(function (attempt) { return item.cardIndex === undefined || attempt.cardIndex === item.cardIndex; });
    if (!attempts.length) return item.cardIndex === undefined ? "not-attempted" : "not-self-reviewed";
    var latest = attempts[attempts.length - 1];
    if (latest.source === "self" && latest.correct === null) return "not-self-reviewed";
    return latest.source;
  }

  function validateLesson(lesson) {
    if (!record(lesson) || lesson.schemaVersion !== 1 || !safeId(lesson.lessonId) || !["string", "number"].includes(typeof lesson.revision)) throw new Error("Invalid lesson identity/version");
    if (!Array.isArray(lesson.objectives) || !Array.isArray(lesson.activities)) throw new Error("Missing lesson objectives or activities");
    var objectiveIds = new Set();
    lesson.objectives.forEach(function (objective) {
      if (!safeId(objective.id) || objectiveIds.has(objective.id)) throw new Error("Invalid or duplicate objective ID");
      objectiveIds.add(objective.id);
    });
    var activityIds = new Set();
    lesson.activities.forEach(function (activity) {
      if (!safeId(activity.id) || activityIds.has(activity.id) || !objectiveIds.has(activity.objectiveId) || !TYPES.includes(activity.type)) throw new Error("Invalid activity identity/type");
      activityIds.add(activity.id);
      if (!(typeof activity.source === "string" && activity.source.trim()) && !(record(activity.source) && typeof activity.source.path === "string" && activity.source.path.trim())) throw new Error("Activity needs its DeepTutor source");
      if (activity.type === "flashcards" && (!Array.isArray(activity.cards) || !activity.cards.length)) throw new Error("Flashcards need cards");
      if (activity.type === "steps" && (!Array.isArray(activity.steps) || !activity.steps.length)) throw new Error("Steps need stages");
      if (activity.type === "explore" && !["linear-density", "uniform"].includes(activity.model)) throw new Error("Unknown exploration model");
      if (activity.type === "quiz") {
        if (!["choice", "numeric", "open"].includes(activity.format)) throw new Error("Unknown quiz format");
        if (activity.format === "choice" && (!Array.isArray(activity.choices) || !activity.choices.some(function (choice) { return choice.id === activity.answer; }))) throw new Error("Choice quiz needs a valid answer");
        if (activity.format === "numeric" && (parseNumeric(activity.answer) === null || (activity.tolerance !== undefined && (!finite(activity.tolerance) || activity.tolerance < 0)))) throw new Error("Numeric quiz needs a finite answer and tolerance");
      }
    });
    return lesson;
  }

  function exportEnvelope(lesson, state, now) {
    return { kind: "dialoguetutor-progress", schemaVersion: 1, lessonId: lesson.lessonId, revision: lesson.revision, exportedAt: now, state: copy(state) };
  }

  function validateImport(lesson, value) {
    var input = typeof value === "string" ? JSON.parse(value) : value;
    if (!record(input) || input.kind !== "dialoguetutor-progress" || input.schemaVersion !== 1) throw new Error("记录格式或版本不匹配 / Invalid progress format");
    if (input.lessonId !== lesson.lessonId || input.revision !== lesson.revision) throw new Error("课程身份或内容版本不匹配 / Lesson or revision mismatch");
    var raw = input.state;
    if (!record(raw) || raw.lessonId !== lesson.lessonId || raw.revision !== lesson.revision || !record(raw.activities)) throw new Error("记录身份字段缺失 / Invalid state identity");
    if (!finite(raw.createdAt) || !finite(raw.updatedAt)) throw new Error("记录时间格式错误 / Invalid timestamp");
    var definitions = new Map(lesson.activities.map(function (activity) { return [activity.id, activity]; }));
    if (Object.keys(raw.activities).some(function (id) { return !definitions.has(id); })) throw new Error("记录含有其他活动 / Unknown activity");
    if (raw.currentActivity !== null && !definitions.has(raw.currentActivity)) throw new Error("当前位置标识错误 / Unknown current activity");
    var result = createState(lesson, raw.createdAt);
    result.updatedAt = raw.updatedAt;
    result.currentActivity = raw.currentActivity;
    function validReview(review) {
      return review === null || (record(review) && Number.isInteger(review.intervalIndex) && review.intervalIndex >= 0 && review.intervalIndex < INTERVAL_DAYS.length && finite(review.dueAt) && finite(review.lastReviewedAt) && typeof review.lastSessionId === "string" && ["self", "objective"].includes(review.evidenceSource));
    }
    function validExposure(exposure) {
      return exposure === null || (record(exposure) && (exposure.sessionId === null || typeof exposure.sessionId === "string") && typeof exposure.hint === "boolean" && typeof exposure.reference === "boolean" && finite(exposure.observedAt) && typeof exposure.inferred === "boolean");
    }
    function legacyExposure(saved, latestAttempt, revealed) {
      if (!saved.hintUsed && !revealed && !latestAttempt) return null;
      // Older v1 files recorded display flags and attempts, but no exposure event.
      // Keep that reconstruction explicitly inferred; observedAt is the snapshot time.
      return {
        sessionId: latestAttempt ? latestAttempt.sessionId : saved.review ? saved.review.lastSessionId : null,
        hint: saved.hintUsed, reference: !!(revealed || latestAttempt), observedAt: raw.updatedAt, inferred: true
      };
    }
    lesson.activities.forEach(function (activity) {
      if (!has(raw.activities, activity.id)) return;
      var saved = raw.activities[activity.id];
      if (!record(saved) || saved.id !== activity.id || saved.objectiveId !== activity.objectiveId || saved.type !== activity.type) throw new Error("活动与学习目标不匹配 / Activity identity mismatch");
      if (typeof saved.draft !== "string" || typeof saved.notes !== "string" || !["idle", "submitted", "skipped"].includes(saved.status) || !Array.isArray(saved.attempts)) throw new Error("作答记录格式错误 / Invalid response state");
      if (![saved.answerRevealed, saved.hintUsed, saved.participated, saved.bookmarked].every(function (field) { return typeof field === "boolean"; })) throw new Error("活动状态标识错误 / Invalid state flags");
      if (has(saved, "exposure") && !validExposure(saved.exposure)) throw new Error("参考接触记录格式错误 / Invalid exposure record");
      if (!validReview(saved.review) || !record(saved.flash) || !record(saved.flash.cards) || !Number.isInteger(saved.flash.index)) throw new Error("复习记录格式错误 / Invalid review state");
      if (saved.review && (activity.type !== "quiz" || saved.review.evidenceSource !== (activity.format === "open" ? "self" : "objective"))) throw new Error("复习证据类别不匹配 / Invalid review evidence source");
      if (!Number.isInteger(saved.stepIndex) || saved.stepIndex < 0 || !Number.isInteger(saved.explorationCount) || saved.explorationCount < 0 || !record(saved.exploration)) throw new Error("探索记录格式错误 / Invalid exploration state");
      if (saved.lastInteractionAt !== null && !finite(saved.lastInteractionAt)) throw new Error("活动时间格式错误 / Invalid activity timestamp");
      var attemptIds = new Set();
      saved.attempts.forEach(function (attempt) {
        if (!record(attempt) || !safeId(attempt.id) || attemptIds.has(attempt.id) || typeof attempt.answer !== "string" || ![true, false, null].includes(attempt.correct) || !["self", "objective"].includes(attempt.source) || typeof attempt.assisted !== "boolean" || !finite(attempt.time) || typeof attempt.sessionId !== "string") throw new Error("尝试记录格式错误 / Invalid attempt");
        if ((activity.type === "flashcards" || activity.format === "open") && attempt.source !== "self") throw new Error("自评证据类别不匹配 / Invalid self-report source");
        if (activity.type === "quiz" && activity.format !== "open" && attempt.source !== "objective") throw new Error("自动核对证据类别不匹配 / Invalid automatic-check source");
        if (activity.type !== "quiz" && activity.type !== "flashcards") throw new Error("探索活动不能含评分记录 / Exploration cannot contain scores");
        if (activity.type === "flashcards" && (!Number.isInteger(attempt.cardIndex) || attempt.cardIndex < 0 || attempt.cardIndex >= activity.cards.length)) throw new Error("闪卡尝试标识错误 / Invalid flashcard attempt");
        attemptIds.add(attempt.id);
      });
      if (saved.submittedAttemptId !== null && !attemptIds.has(saved.submittedAttemptId)) throw new Error("提交尝试标识错误 / Missing submitted attempt");
      if (saved.status === "submitted" && !saved.submittedAttemptId) throw new Error("提交结果缺失 / Missing submitted result");
      Object.keys(saved.flash.cards).forEach(function (key) {
        var card = saved.flash.cards[key];
        if (activity.type !== "flashcards" || !/^\d+$/.test(key) || Number(key) >= activity.cards.length || !record(card) || typeof card.revealed !== "boolean" || typeof card.hintUsed !== "boolean" || ![null, "recalled", "again"].includes(card.rating) || !validReview(card.review) || (card.review && card.review.evidenceSource !== "self") || (card.attemptId !== null && !attemptIds.has(card.attemptId))) throw new Error("闪卡记录格式错误 / Invalid flashcard state");
        if ((has(card, "exposure") && !validExposure(card.exposure)) || (has(card, "recallAssisted") && typeof card.recallAssisted !== "boolean") || (has(card, "recallSessionId") && card.recallSessionId !== null && typeof card.recallSessionId !== "string")) throw new Error("闪卡回忆记录格式错误 / Invalid flashcard recall state");
      });
      if (activity.type === "flashcards" && (saved.flash.index < 0 || saved.flash.index >= activity.cards.length)) throw new Error("闪卡位置超出范围 / Invalid card index");
      if (activity.type === "steps" && saved.stepIndex >= activity.steps.length) throw new Error("阶段位置超出范围 / Invalid stage index");
      if (activity.type === "explore") {
        if (activity.model === "linear-density") {
          if (!finite(saved.exploration.a) || !finite(saved.exploration.b) || saved.exploration.a < 0 || saved.exploration.b > 1 || saved.exploration.a > saved.exploration.b) throw new Error("概率区间记录错误 / Invalid interval");
        } else {
          uniformDistribution(saved.exploration);
          if (Object.keys(defaultExploration("uniform")).some(function (key) { return saved.exploration[key] < -5 || saved.exploration[key] > 10; })) throw new Error("均匀分布参数超出范围 / Invalid uniform range");
        }
      }
      // Rebuild on a known shape; imported display strings are always rendered as text.
      var clean = blankActivity(activity);
      Object.keys(clean).forEach(function (key) { if (has(saved, key)) clean[key] = copy(saved[key]); });
      if (activity.type === "quiz" && !has(saved, "exposure")) clean.exposure = legacyExposure(saved, saved.attempts[saved.attempts.length - 1], saved.answerRevealed);
      if (activity.type === "flashcards") Object.keys(clean.flash.cards).forEach(function (key) {
        var card = clean.flash.cards[key];
        var attempts = clean.attempts.filter(function (attempt) { return attempt.cardIndex === Number(key); });
        if (!has(card, "exposure")) card.exposure = legacyExposure(card, attempts[attempts.length - 1], card.revealed);
        if (!has(card, "recallAssisted")) card.recallAssisted = false;
        if (!has(card, "recallSessionId")) card.recallSessionId = null;
      });
      result.activities[activity.id] = clean;
    });
    return result;
  }

  function storageKey(lesson) { return "dialoguetutor:v1:" + encodeURIComponent(lesson.lessonId) + ":" + encodeURIComponent(String(lesson.revision)); }

  function mount(lesson, doc, options) {
    validateLesson(lesson);
    options = options || {};
    var win = doc.defaultView;
    var en = /^en\b/i.test(lesson.language || "zh-CN");
    var t = function (zh, english) { return en ? english : zh; };
    var now = options.now || Date.now;
    var sessionId = options.sessionId || "session-" + now() + "-" + Math.random().toString(36).slice(2);
    var state = createState(lesson, now());
    var key = storageKey(lesson), storage = null, storageMessage = "", panelMessage = "";
    var views = new Map(), definitions = new Map();
    lesson.activities.forEach(function (activity) { definitions.set(activity.id, activity); });
    try {
      storage = options.storage === undefined ? win.localStorage : options.storage;
      var stored = storage && storage.getItem(key);
      if (stored) state = validateImport(lesson, stored);
    } catch (error) {
      storageMessage = t("浏览器记录暂未保存；当前页面仍可使用，请导出记录。", "Browser storage is unavailable. You can keep working and export progress.");
    }
    state = prepareSession(lesson, state, now(), sessionId);
    function closeDueSolutions() {
      lesson.activities.forEach(function (activity) {
        var saved = state.activities[activity.id];
        if (activity.solutionId && saved.review && saved.review.dueAt <= now()) {
          var solution = doc.getElementById(activity.solutionId);
          if (solution) solution.open = false;
        }
      });
    }
    closeDueSolutions();

    function el(tag, className, text) {
      var node = doc.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined && text !== null) node.textContent = String(text);
      return node;
    }
    function button(label, action, className, control) {
      var node = el("button", "dt-button" + (className ? " " + className : ""), label);
      node.type = "button";
      if (control) node.dataset.dtControl = control;
      node.addEventListener("click", action);
      return node;
    }
    function message(view, text) { view.status.textContent = text; }
    function dateLabel(time) { return new Date(time).toLocaleDateString(en ? "en-GB" : "zh-CN", { year: "numeric", month: "short", day: "numeric" }); }
    function save() {
      state.updatedAt = now();
      try { if (storage) storage.setItem(key, JSON.stringify(exportEnvelope(lesson, state, now()))); else throw new Error("storage"); }
      catch (error) { storageMessage = t("浏览器记录暂未保存；当前页面仍可使用，请导出记录。", "Browser storage is unavailable. Keep working, then export progress."); }
    }
    function transition(activity, event, render) {
      state.activities[activity.id] = reduceActivity(activity, state.activities[activity.id], event, now(), sessionId);
      state.currentActivity = activity.id;
      save();
      if (render !== false) renderActivity(activity);
      renderPanel();
      return state.activities[activity.id];
    }
    function announce(activity, text) { var view = views.get(activity.id); if (view) message(view, text); }
    function pretty(value) { return Number(value.toFixed(5)).toLocaleString(en ? "en-GB" : "zh-CN", { maximumFractionDigits: 5 }); }

    function renderFlash(activity, view, saved) {
      var index = saved.flash.index;
      var content = activity.cards[index];
      var cardState = saved.flash.cards[String(index)] || { revealed: false, hintUsed: false, rating: null };
      var caption = el("div", "dt-row dt-spread");
      caption.append(el("span", "dt-small", t("先尝试回忆，再翻面核对。", "Try to recall before turning the card.")), el("span", "dt-counter", (index + 1) + " / " + activity.cards.length));
      view.body.appendChild(caption);
      var card = button("", function () { transition(activity, { type: "flash-flip" }); announce(activity, cardState.revealed ? t("问题正面", "Question side") : t("参考背面", "Answer side")); }, "dt-flashcard" + (cardState.revealed ? " dt-flashcard-back" : ""), "flash-flip");
      card.setAttribute("aria-label", (cardState.revealed ? t("参考答案：", "Reference answer: ") : t("回忆问题：", "Recall question: ")) + (cardState.revealed ? content.back : content.front));
      card.append(el("span", "dt-eyebrow", cardState.revealed ? t("参考背面", "Answer side") : t("回忆正面", "Question side")), el("span", "dt-flashcard-text", cardState.revealed ? content.back : content.front), el("span", "dt-small", t("点击或按回车翻面", "Click or press Enter to turn")));
      view.body.appendChild(card);
      if (content.hint) {
        if (cardState.hintUsed) view.body.appendChild(el("p", "dt-hint", content.hint));
        else view.body.appendChild(button(t("查看提示", "Show hint"), function () { transition(activity, { type: "flash-hint" }); }, "dt-button-quiet", "flash-hint"));
      }
      var navigation = el("div", "dt-row dt-spread");
      var prev = button(t("上一张", "Previous card"), function () { transition(activity, { type: "flash-index", index: index - 1 }); }, "", "flash-prev");
      var next = button(t("下一张", "Next card"), function () { transition(activity, { type: "flash-index", index: index + 1 }); }, "", "flash-next");
      prev.disabled = index === 0; next.disabled = index === activity.cards.length - 1;
      navigation.append(prev, next); view.body.appendChild(navigation);
      if (cardState.revealed) {
        var rating = el("div", "dt-self-rating");
        rating.appendChild(el("p", "dt-small", t("自评记录：依据翻面之前的回忆作出选择。", "Self-report: rate what you recalled before turning the card.")));
        var good = button(t("自评：翻面前已回忆", "Self-report: recalled before turning"), function () { transition(activity, { type: "flash-rate", correct: true }); }, "dt-button-primary", "flash-good");
        var again = button(t("自评：继续练习", "Self-report: practise again"), function () { transition(activity, { type: "flash-rate", correct: false }); }, "", "flash-again");
        good.disabled = again.disabled = cardState.rating !== null;
        rating.append(good, again);
        if (cardState.rating !== null) rating.appendChild(el("p", "dt-small", cardState.rating === "recalled" ? t("已保存「翻面前已回忆」自评；这不是自动核对结果。", "Saved your recalled-before-turning rating; this is not an automatically checked result.") : t("已保存「继续练习」自评。", "Saved your practise-again rating.")));
        if (cardState.rating !== null && cardState.attemptId) {
          var cardAttempt = saved.attempts.find(function (item) { return item.id === cardState.attemptId; });
          if (cardAttempt && cardAttempt.assisted) rating.appendChild(el("p", "dt-small", t("本次回忆已接触提示或参考，保留辅助标识；同会话重复核对不会成为独立回忆。", "This recall followed hint or reference exposure and is marked assisted; same-session checking does not become independent recall.")));
        }
        view.body.appendChild(rating);
      }
      if (cardState.rating !== null) view.body.appendChild(button(t("再次回忆本卡", "Recall this card again"), function () { transition(activity, { type: "flash-restart" }); }, "dt-button-quiet", "flash-restart"));
      if (cardState.review) view.body.appendChild(el("p", "dt-small", t("本卡复习：", "Review this card: ") + dateLabel(cardState.review.dueAt)));
    }

    function quizReference(activity, body, saved) {
      if (!saved.answerRevealed) return;
      var reference = el("div", "dt-reference");
      reference.appendChild(el("h4", "dt-small-heading", t("参考与解析", "Reference and explanation")));
      var answer;
      if (activity.format === "choice") {
        var choice = activity.choices.find(function (item) { return item.id === String(activity.answer); });
        answer = choice ? choice.text : activity.answer;
      } else answer = activity.format === "open" ? activity.modelAnswer || activity.answer : activity.answer;
      if (answer !== undefined) {
        var answerLine = el("p", "dt-reference-answer");
        if (activity.format === "numeric" && typeof answer === "string" && answer.includes("/") && parseNumeric(answer) !== null) {
          var mathNamespace = "http://www.w3.org/1998/Math/MathML";
          var math = doc.createElementNS(mathNamespace, "math");
          var fraction = doc.createElementNS(mathNamespace, "mfrac");
          answer.split("/").forEach(function (part) {
            var number = doc.createElementNS(mathNamespace, "mn");
            number.textContent = part.trim(); fraction.appendChild(number);
          });
          math.appendChild(fraction); answerLine.appendChild(math);
        } else answerLine.textContent = String(answer);
        reference.appendChild(answerLine);
      }
      if (activity.explanation) reference.appendChild(el("p", "", activity.explanation));
      if (activity.format === "open" && activity.rubric && activity.rubric.length) {
        reference.appendChild(el("h4", "dt-small-heading", t("自评要点", "Self-review criteria")));
        var list = el("ul", "dt-rubric");
        activity.rubric.forEach(function (criterion) { list.appendChild(el("li", "", criterion)); });
        reference.appendChild(list);
      }
      body.appendChild(reference);
    }

    function renderQuiz(activity, view, saved) {
      var form = el("form", "dt-quiz");
      var locked = saved.status !== "idle";
      var input, submit;
      var controls = [];
      var error = el("p", "dt-error"); error.setAttribute("role", "status");
      if (activity.format === "choice") {
        var fieldset = el("fieldset", "dt-choices");
        var legend = el("legend", "dt-sr", t("选择一个答案，然后提交", "Choose one answer, then submit"));
        fieldset.appendChild(legend);
        activity.choices.forEach(function (choice, index) {
          var label = el("label", "dt-choice" + (saved.draft === choice.id ? " dt-choice-selected" : ""));
          var radio = el("input", "dt-radio");
          radio.type = "radio"; radio.name = "dt-choice-" + activity.id; radio.value = choice.id;
          radio.checked = saved.draft === choice.id; radio.disabled = locked;
          radio.dataset.dtControl = "choice-" + index;
          radio.addEventListener("change", function () {
            transition(activity, { type: "draft", value: choice.id }, false);
            Array.from(fieldset.querySelectorAll(".dt-choice")).forEach(function (item) { item.classList.toggle("dt-choice-selected", item.contains(radio)); });
            submit.disabled = false;
          });
          label.append(radio, el("span", "dt-choice-label", choice.text)); fieldset.appendChild(label); controls.push(radio);
        });
        form.appendChild(fieldset);
      } else {
        var label = el("label", "dt-input-label", activity.format === "open" ? t("写下你的解释", "Write your explanation") : t("填写数值，可使用小数或简单分数", "Enter a decimal or a simple fraction"));
        input = el(activity.format === "open" ? "textarea" : "input", "dt-input");
        if (activity.format === "open") input.rows = 5;
        else { input.type = "text"; input.inputMode = "text"; input.autocomplete = "off"; input.spellcheck = false; }
        input.value = saved.draft; input.disabled = locked;
        input.dataset.dtControl = "answer";
        input.addEventListener("input", function () { transition(activity, { type: "draft", value: input.value }, false); submit.disabled = !input.value.trim(); error.textContent = ""; });
        label.appendChild(input); form.appendChild(label); controls.push(input);
      }
      var actions = el("div", "dt-row");
      submit = button(t("提交作答", "Submit answer"), function () {}, "dt-button-primary", "submit");
      submit.type = "submit"; submit.disabled = locked || !saved.draft.trim();
      actions.appendChild(submit);
      if (!locked) actions.appendChild(button(t("暂时跳过", "Skip for now"), function () { transition(activity, { type: "skip" }); announce(activity, t("已跳过，没有计入答错。", "Skipped; no incorrect attempt was recorded.")); }, "dt-button-quiet", "skip"));
      form.append(actions, error);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        // Native details toggle events may arrive after the submit event.
        var visibleSolution = activity.solutionId && doc.getElementById(activity.solutionId);
        if (visibleSolution && visibleSolution.open && !state.activities[activity.id].answerRevealed) transition(activity, { type: "reveal" }, false);
        var current = state.activities[activity.id];
        var result = evaluateQuiz(activity, current.draft);
        if (!result.valid) {
          error.textContent = result.error === "numeric" ? t("请输入有限数值，例如 0.375 或 3/8。", "Enter a finite number such as 0.375 or 3/8.") : t("请先填写作答。", "Enter an answer first.");
          if (input) input.focus(); return;
        }
        transition(activity, { type: "submit" });
        announce(activity, result.correct === null ? t("回答已保存，请依据参考要点自行评价。", "Response saved. Compare it with the criteria and self-review.") : result.correct ? t("数值或选项核对通过。", "Your answer matches the reference.") : t("本次作答与参考不符，请阅读反馈。", "Your answer differs from the reference. Read the feedback."));
      });
      view.body.appendChild(form);
      if (saved.status === "skipped") view.body.appendChild(el("p", "dt-feedback", t("本题已暂时跳过，没有计入答错。", "Skipped for now; no incorrect attempt was recorded.")));
      var attempt = saved.attempts.find(function (item) { return item.id === saved.submittedAttemptId; });
      if (attempt) {
        var feedback = el("div", "dt-feedback" + (attempt.correct === true ? " dt-feedback-good" : attempt.correct === false ? " dt-feedback-again" : ""));
        feedback.tabIndex = -1;
        var status = attempt.source === "self" ? (attempt.correct === null ? t("回答已保存，等待自行评价", "Response saved; self-review pending") : attempt.correct ? t("自评：达到要点", "Self-report: meets the criteria") : t("自评：仍需练习", "Self-report: more practice needed")) : attempt.correct ? (attempt.assisted ? t("参考辅助后核对通过", "Correct with assistance") : t("独立作答核对通过", "Correct without assistance")) : t("本次作答需要修正", "This answer needs revision");
        feedback.appendChild(el("strong", "", status));
        if (attempt.assisted) feedback.appendChild(el("p", "dt-small", t("本次提交前已接触提示或参考，包括本会话前次作答的反馈；记录保留辅助标识。", "This attempt followed hint or reference exposure, including feedback from an earlier attempt in this session; it is marked assisted.")));
        if (activity.format === "choice") {
          var picked = activity.choices.find(function (choice) { return choice.id === attempt.answer; });
          if (picked && picked.feedback) feedback.appendChild(el("p", "", picked.feedback));
        }
        view.body.appendChild(feedback);
      }
      if (activity.hint && !saved.hintUsed && !locked) view.body.appendChild(button(t("查看提示（记录辅助）", "Show hint (marks assistance)"), function () { transition(activity, { type: "hint" }); }, "dt-button-quiet", "hint"));
      if (saved.hintUsed && activity.hint) view.body.appendChild(el("p", "dt-hint", activity.hint));
      if (!saved.answerRevealed) view.body.appendChild(button(t("直接查看参考", "Reveal reference"), function () {
        transition(activity, { type: "reveal" }); announce(activity, t("参考已展开；后续提交会标记参考辅助。", "Reference revealed; a later submission will be marked assisted."));
      }, "dt-button-quiet", "reveal"));
      quizReference(activity, view.body, saved);
      if (attempt && activity.format === "open") {
        var self = el("div", "dt-self-rating");
        self.appendChild(el("p", "dt-small", t("以下结果来自你的自评；页面不会用字面匹配判断解释质量。", "These are your self-reports; this page does not string-match explanations.")));
        [true, false].forEach(function (correct) {
          var rating = button(correct ? t("自评：达到要点", "Self-report: meets criteria") : t("自评：仍需练习", "Self-report: needs practice"), function () { transition(activity, { type: "self-assess", correct: correct }); }, correct ? "dt-button-primary" : "", correct ? "self-good" : "self-again");
          rating.disabled = attempt.correct !== null; self.appendChild(rating);
        });
        view.body.appendChild(self);
      }
      if (attempt && attempt.correct === false && activity.remediation) {
        var remediation = el("details", "dt-followup");
        remediation.appendChild(el("summary", "", t("针对本题的预备补充解释", "Prepared explanation for this question")));
        if (typeof activity.remediation === "string") remediation.appendChild(el("p", "", activity.remediation));
        else if (activity.remediation.bodyHtml) { var authored = el("div", "dt-authored"); authored.innerHTML = activity.remediation.bodyHtml; remediation.appendChild(authored); }
        else remediation.appendChild(el("p", "", activity.remediation.text || activity.remediation.body || ""));
        view.body.appendChild(remediation);
      }
      if (locked || saved.answerRevealed) view.body.appendChild(button(t("重新作答", "Try again"), function () {
        if (activity.solutionId) { var solution = doc.getElementById(activity.solutionId); if (solution) solution.open = false; }
        transition(activity, { type: "retry" }); announce(activity, t("已开始新尝试；本会话已有的提示或参考接触仍记为辅助。", "New attempt started; hints or references already seen in this session remain assistance."));
      }, "", "retry"));
      if (saved.review) view.body.appendChild(el("p", "dt-small", t("本题复习：", "Review this question: ") + dateLabel(saved.review.dueAt)));
    }

    function renderSteps(activity, view, saved) {
      var index = saved.stepIndex, step = activity.steps[index];
      var markers = el("ol", "dt-step-markers");
      activity.steps.forEach(function (item, i) {
        var marker = el("li", "");
        var jump = button((i + 1) + ". " + item.title, function () { transition(activity, { type: "step", index: i }); }, i === index ? "dt-step-current" : "", "step-" + i);
        if (i === index) jump.setAttribute("aria-current", "step");
        marker.appendChild(jump); markers.appendChild(marker);
      });
      var stage = el("div", "dt-step-stage dt-authored");
      stage.appendChild(el("h4", "dt-small-heading", step.title));
      var body = el("div", ""); body.innerHTML = step.bodyHtml; stage.appendChild(body);
      view.body.append(markers, stage);
      var nav = el("div", "dt-row");
      var prev = button(t("上一步", "Previous step"), function () { transition(activity, { type: "step", index: index - 1 }); }, "", "step-prev"); prev.disabled = index === 0;
      var next = button(t("下一步", "Next step"), function () { transition(activity, { type: "step", index: index + 1 }); }, "dt-button-primary", "step-next"); next.disabled = index === activity.steps.length - 1;
      nav.append(prev, next, button(t("回到起点", "Reset steps"), function () { transition(activity, { type: "step", index: 0 }); }, "dt-button-quiet", "step-reset"));
      view.body.append(nav, el("p", "dt-small", t("分步浏览记录探索过程，不作为答题通过证据。", "Step navigation records exploration, not a passed answer.")));
    }

    function svgElement(tag, attributes, text) {
      var node = doc.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.keys(attributes || {}).forEach(function (key) { node.setAttribute(key, String(attributes[key])); });
      if (text !== undefined) node.textContent = String(text);
      return node;
    }
    function graph(title, xMin, xMax, yMax, curvePoints, shadePoints, markers, ticks) {
      var svg = svgElement("svg", { viewBox: "0 0 420 252", role: "img", "aria-label": title, class: "dt-graph" });
      svg.appendChild(svgElement("title", {}, title));
      var x = function (value) { return 49 + (value - xMin) / (xMax - xMin) * 345; };
      var y = function (value) { return 207 - value / yMax * 159; };
      svg.appendChild(svgElement("text", { x: 49, y: 23, class: "dt-graph-title" }, title));
      [0, yMax / 2, yMax].forEach(function (value) {
        svg.appendChild(svgElement("line", { x1: 49, y1: y(value), x2: 394, y2: y(value), class: "dt-graph-grid" }));
        svg.appendChild(svgElement("text", { x: 42, y: y(value) + 4, "text-anchor": "end", class: "dt-graph-label" }, pretty(value)));
      });
      svg.appendChild(svgElement("path", { d: "M49 43V207H398", class: "dt-graph-axis", fill: "none" }));
      (ticks || [xMin, (xMin + xMax) / 2, xMax]).forEach(function (value) {
        svg.appendChild(svgElement("line", { x1: x(value), y1: 207, x2: x(value), y2: 212, class: "dt-graph-axis" }));
        svg.appendChild(svgElement("text", { x: x(value), y: 230, "text-anchor": "middle", class: "dt-graph-label" }, pretty(value)));
      });
      if (shadePoints && shadePoints.length) svg.appendChild(svgElement("polygon", { points: shadePoints.map(function (point) { return x(point[0]) + "," + y(point[1]); }).join(" "), class: "dt-graph-area" }));
      svg.appendChild(svgElement("polyline", { points: curvePoints.map(function (point) { return x(point[0]) + "," + y(point[1]); }).join(" "), class: "dt-graph-curve", fill: "none" }));
      (markers || []).forEach(function (point, index) {
        svg.appendChild(svgElement("line", { x1: x(point[0]), y1: 207, x2: x(point[0]), y2: y(point[1]), class: "dt-graph-guide" }));
        svg.appendChild(svgElement("circle", { cx: x(point[0]), cy: y(point[1]), r: 4.4, class: index ? "dt-graph-dot dt-graph-dot-second" : "dt-graph-dot" }));
      });
      return svg;
    }

    function renderExplore(activity, view, saved) {
      if (activity.instructions) view.body.appendChild(el("p", "dt-small", activity.instructions));
      var plot = el("div", "dt-plots"), values = el("div", "dt-metrics"), controls = el("div", "dt-parameters");
      var inputs = {};
      var linear = activity.model === "linear-density";
      var specifications = linear ? [["a", t("区间起点 a", "Interval start a"), 0, 1, 0.01], ["b", t("区间终点 b", "Interval end b"), 0, 1, 0.01]] : [["lower", t("分布左界 L", "Support lower bound L"), -5, 10, 0.1], ["upper", t("分布右界 U", "Support upper bound U"), -5, 10, 0.1], ["eventA", t("事件起点 a", "Event start a"), -5, 10, 0.1], ["eventB", t("事件终点 b", "Event end b"), -5, 10, 0.1]];
      specifications.forEach(function (spec) {
        var label = el("label", "dt-parameter");
        var row = el("span", "dt-row dt-spread");
        var output = el("output", "dt-parameter-value");
        var range = el("input", "dt-range");
        range.type = "range"; range.min = String(spec[2]); range.max = String(spec[3]); range.step = String(spec[4]); range.value = saved.exploration[spec[0]];
        range.dataset.dtControl = "parameter-" + spec[0];
        row.append(el("span", "", spec[1]), output); label.append(row, range); controls.appendChild(label);
        inputs[spec[0]] = { input: range, output: output };
        range.addEventListener("input", function () {
          transition(activity, { type: "explore", key: spec[0], value: Number(range.value) }, false); update();
        });
      });
      view.body.append(controls, plot, values);
      view.body.appendChild(button(t("恢复初始参数", "Reset parameters"), function () { transition(activity, { type: "explore-reset" }, false); update(); }, "dt-button-quiet", "explore-reset"));
      view.body.appendChild(el("p", "dt-small", t("参数变化记录为探索，不计入独立答对。", "Parameter changes count as exploration, not independent correct answers.")));
      function metric(label, value) { var cell = el("div", "dt-metric"); cell.append(el("span", "dt-small", label), el("strong", "", value)); values.appendChild(cell); }
      function update() {
        var parameters = state.activities[activity.id].exploration;
        Object.keys(inputs).forEach(function (name) { inputs[name].input.value = String(parameters[name]); inputs[name].input.setAttribute("aria-valuetext", pretty(parameters[name])); inputs[name].output.textContent = pretty(parameters[name]); });
        plot.replaceChildren(); values.replaceChildren();
        if (linear) {
          var result = linearDensity(parameters);
          plot.appendChild(graph("f(x) = 2 − 2x", 0, 1, 2, [[0, 2], [1, 0]], [[result.a, 0], [result.a, result.fa], [result.b, result.fb], [result.b, 0]], [[result.a, result.fa], [result.b, result.fb]], [0, 0.25, 0.5, 0.75, 1]));
          var cdf = []; for (var i = 0; i <= 40; i++) { var point = i / 40; cdf.push([point, 2 * point - point * point]); }
          plot.appendChild(graph("F(x) = 2x − x²", 0, 1, 1, cdf, null, [[result.a, result.cdfA], [result.b, result.cdfB]], [0, 0.25, 0.5, 0.75, 1]));
          metric("F(a)", pretty(result.cdfA)); metric("F(b)", pretty(result.cdfB)); metric("P(a ≤ X ≤ b) = F(b) − F(a)", pretty(result.probability));
        } else {
          var distribution = uniformDistribution(parameters);
          var ceiling = Math.max(0.5, distribution.height * 1.2);
          plot.appendChild(graph(t("均匀分布密度", "Uniform density"), -5, 10, ceiling, [[-5, 0], [distribution.lower, 0], [distribution.lower, distribution.height], [distribution.upper, distribution.height], [distribution.upper, 0], [10, 0]], [[distribution.clippedA, 0], [distribution.clippedA, distribution.height], [distribution.clippedB, distribution.height], [distribution.clippedB, 0]], null, [-5, 0, 5, 10]));
          plot.appendChild(graph(t("累积概率 F(x)", "Cumulative probability F(x)"), -5, 10, 1, [[-5, 0], [distribution.lower, 0], [distribution.upper, 1], [10, 1]], null, [[distribution.eventA, distribution.cdfA], [distribution.eventB, distribution.cdfB]], [-5, 0, 5, 10]));
          metric(t("密度高度", "Density height"), pretty(distribution.height)); metric(t("均值（端点的平均值）", "Mean (midpoint of the support)"), pretty(distribution.mean)); metric("P(a ≤ X ≤ b)", pretty(distribution.probability));
        }
      }
      update();
    }

    function followups(activity, view) {
      if (!activity.followups || !activity.followups.length) return;
      var group = el("div", "dt-followups");
      group.appendChild(el("h4", "dt-small-heading", t("继续理解 · 预先准备的解释", "Go further · prepared explanations")));
      activity.followups.forEach(function (followup) {
        var details = el("details", "dt-followup");
        details.append(el("summary", "", followup.question), el("p", "", followup.answer)); group.appendChild(details);
      });
      view.body.appendChild(group);
    }

    function renderActivity(activity) {
      var view = views.get(activity.id); if (!view) return;
      var saved = state.activities[activity.id];
      var focus = view.body.contains(doc.activeElement) ? doc.activeElement.dataset.dtControl : null;
      // Custom widget nodes retain their own event listeners and DOM state.
      if (activity.type !== "interactive" || !view.customMounted) {
        if (win.MathJax && typeof win.MathJax.typesetClear === "function") win.MathJax.typesetClear([view.body]);
        view.body.replaceChildren();
        if (activity.type === "flashcards") renderFlash(activity, view, saved);
        else if (activity.type === "quiz") renderQuiz(activity, view, saved);
        else if (activity.type === "steps") renderSteps(activity, view, saved);
        else if (activity.type === "explore") renderExplore(activity, view, saved);
        else {
          var authored = el("div", "dt-authored dt-custom"); authored.innerHTML = activity.bodyHtml;
          view.body.appendChild(authored); view.customMounted = true;
        }
        // Quiz follow-ups can contain the solution and therefore appear only after reveal.
        if (activity.type !== "quiz" || saved.answerRevealed) followups(activity, view);
        if (win.MathJax && typeof win.MathJax.typesetPromise === "function") win.MathJax.typesetPromise([view.body]).catch(function () {});
      }
      view.bookmark.textContent = saved.bookmarked ? t("已收藏", "Bookmarked") : t("收藏活动", "Bookmark activity");
      view.bookmark.setAttribute("aria-pressed", String(saved.bookmarked));
      if (doc.activeElement !== view.noteInput) view.noteInput.value = saved.notes;
      if (focus) {
        var candidates = Array.from(view.body.querySelectorAll("[data-dt-control]"));
        var target = candidates.find(function (item) { return item.dataset.dtControl === focus && !item.disabled; });
        if (target) target.focus({ preventScroll: true });
        else { var feedback = view.body.querySelector(".dt-feedback"); if (feedback) feedback.focus({ preventScroll: true }); }
      }
    }

    function conversationText(activity) {
      var saved = state.activities[activity.id];
      var selection = win.getSelection && String(win.getSelection()).trim();
      var lines = [t("课程：", "Lesson: ") + lesson.title, t("活动：", "Activity: ") + activity.title, t("问题：", "Question: ") + activity.prompt];
      if (selection) lines.push(t("选中内容：", "Selected text: ") + selection);
      if (saved.draft) lines.push(t("我的作答：", "My response: ") + saved.draft);
      if (activity.type === "flashcards") {
        var card = activity.cards[saved.flash.index], cardState = saved.flash.cards[String(saved.flash.index)];
        lines.push(t("当前闪卡：", "Current card: ") + card.front);
        if (cardState && cardState.revealed) lines.push(t("已查看的参考：", "Revealed reference: ") + card.back);
      }
      if (saved.answerRevealed && activity.explanation) lines.push(t("已查看的解析：", "Revealed explanation: ") + activity.explanation);
      if (activity.type === "explore" || activity.type === "interactive") lines.push(t("探索参数：", "Exploration state: ") + JSON.stringify(saved.exploration));
      if (saved.notes) lines.push(t("我的笔记：", "My note: ") + saved.notes);
      lines.push(t("请围绕以上上下文继续解释我的疑问：", "Please help me explore this question in the context above: "));
      return lines.join("\n\n");
    }

    function notifyCustomRestore() {
      lesson.activities.filter(function (activity) { return activity.type === "interactive" && views.has(activity.id); }).forEach(function (activity) {
        doc.dispatchEvent(new win.CustomEvent("dt:restore", { detail: { activityId: activity.id, state: copy(state.activities[activity.id].exploration) } }));
      });
    }

    function createActivityView(activity, target) {
      target.classList.add("dt-activity");
      target.setAttribute("role", "group"); target.setAttribute("aria-label", activity.title);
      target.dataset.dtMounted = "true";
      if (!target.id) target.id = "dt-activity-" + activity.id;
      var header = el("div", "dt-activity-heading");
      var typeLabels = { flashcards: t("回忆闪卡", "Recall cards"), quiz: t("就地自测", "Quick check"), steps: t("分步探索", "Step through"), explore: t("参数探索", "Explore parameters"), interactive: t("交互探索", "Interactive exploration") };
      header.append(el("span", "dt-eyebrow", typeLabels[activity.type]), el("h3", "dt-activity-title", activity.title));
      var prompt = el("p", "dt-prompt", activity.prompt);
      var body = el("div", "dt-activity-body"), footer = el("div", "dt-activity-footer");
      var bookmark = button(t("收藏活动", "Bookmark activity"), function () { transition(activity, { type: "bookmark" }, false); renderActivity(activity); }, "dt-button-quiet", "bookmark");
      var note = el("details", "dt-note");
      note.appendChild(el("summary", "", t("本地笔记", "Local note")));
      var noteLabel = el("label", "dt-input-label", t("写下疑问、思路或容易混淆的地方", "Record questions, reasoning or points of confusion"));
      var noteInput = el("textarea", "dt-input"); noteInput.rows = 3; noteInput.value = state.activities[activity.id].notes;
      noteInput.addEventListener("input", function () { transition(activity, { type: "note", value: noteInput.value }, false); });
      noteLabel.appendChild(noteInput); note.appendChild(noteLabel);
      note.appendChild(button(t("保存笔记", "Save note"), function () { transition(activity, { type: "note", value: noteInput.value }, false); announce(activity, storageMessage || t("笔记已保存在当前浏览器。", "Note saved in this browser.")); }, "", "note-save"));
      var copyButton = button(t("复制上下文，继续对话", "Copy context to continue in chat"), async function () {
        var content = conversationText(activity);
        try {
          if (!win.navigator.clipboard || !win.navigator.clipboard.writeText) throw new Error("clipboard");
          await win.navigator.clipboard.writeText(content);
          announce(activity, t("上下文已复制，请粘贴到原对话继续提问。", "Context copied. Paste it into your conversation to continue."));
        } catch (error) {
          var fallback = view.footer.querySelector(".dt-copy-fallback");
          if (!fallback) { fallback = el("textarea", "dt-input dt-copy-fallback"); fallback.rows = 8; fallback.readOnly = true; fallback.setAttribute("aria-label", t("请手动复制这些上下文", "Copy this context manually")); view.footer.appendChild(fallback); }
          fallback.value = content; fallback.focus(); fallback.select();
          announce(activity, t("上下文已选中，请使用复制快捷键后粘贴到原对话。", "Context selected. Copy it and paste it into your conversation."));
        }
      }, "dt-button-quiet", "copy-context");
      var row = el("div", "dt-row"); row.append(bookmark, copyButton); footer.append(row, note);
      var source = el("details", "dt-source"); source.appendChild(el("summary", "", t("交互来源 · DeepTutor", "Interaction source · DeepTutor")));
      var sourceText = typeof activity.source === "string" ? activity.source : [activity.source.path, activity.source.commit, activity.source.case].filter(Boolean).join("\n");
      source.appendChild(el("p", "dt-small", sourceText)); footer.appendChild(source);
      var status = el("p", "dt-status"); status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
      target.append(header, prompt, body, footer, status);
      var view = { root: target, body: body, footer: footer, bookmark: bookmark, noteInput: noteInput, status: status, customMounted: false };
      views.set(activity.id, view);
      target.addEventListener("focusin", function () { if (state.currentActivity !== activity.id) { state.currentActivity = activity.id; save(); } });
      renderActivity(activity);
      if (activity.solutionId) {
        var solution = doc.getElementById(activity.solutionId);
        if (solution) {
          var watch = function () {
            if (solution.open && state.activities[activity.id].status !== "submitted" && !state.activities[activity.id].answerRevealed) {
              transition(activity, { type: "reveal" }); announce(activity, t("已查看原题详解；当前尝试保留参考辅助标识。", "Worked solution revealed. This attempt is marked assisted."));
            }
          };
          solution.addEventListener("toggle", watch); watch();
        }
      }
    }

    var panelTarget = doc.querySelector("[data-dt-study]");
    var panel = null, panelSummary, panelBody;
    if (panelTarget) {
      panelTarget.classList.add("dt-study");
      panel = el("details", "dt-study-panel");
      panelSummary = el("summary", "dt-study-summary");
      panelBody = el("div", "dt-study-body"); panel.append(panelSummary, panelBody); panelTarget.appendChild(panel);
    }
    function navigate(activityId, reviewItem) {
      var activity = definitions.get(activityId), view = views.get(activityId);
      if (!activity || !view) return;
      if (reviewItem) {
        if (activity.type === "quiz") {
          if (activity.solutionId) { var solution = doc.getElementById(activity.solutionId); if (solution) solution.open = false; }
          transition(activity, { type: "retry" });
        } else if (activity.type === "flashcards") transition(activity, { type: "flash-restart", index: reviewItem.cardIndex });
      }
      view.root.scrollIntoView({ behavior: win.matchMedia && win.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      var focus = view.body.querySelector("button:not([disabled]),input:not([disabled]),textarea:not([disabled])");
      if (focus) focus.focus({ preventScroll: true });
      state.currentActivity = activityId; save();
    }

    function renderPanel() {
      if (!panel) return;
      var summary = evidenceSummary(lesson, state, now());
      panelSummary.textContent = t("学习记录", "Study record") + " · " + t("参与 ", "Participation ") + summary.participated + "/" + summary.total + " · " + t("待复习 ", "Due ") + summary.due;
      var wasFocused = panelBody.contains(doc.activeElement) ? doc.activeElement.dataset.dtControl : null;
      panelBody.replaceChildren();
      var stats = el("div", "dt-study-stats");
      [[summary.participated, t("参与活动", "Activities explored")], [summary.independentPassed, t("独立核对通过", "Independent passes")], [summary.selfReviewed, t("自行评价活动", "Self-reviewed activities")], [summary.due, t("到期复习项目", "Reviews due")]].forEach(function (item) { var box = el("div", "dt-study-stat"); box.append(el("strong", "", item[0]), el("span", "dt-small", item[1])); stats.appendChild(box); });
      panelBody.append(stats, el("p", "dt-small", t("这些数量分别表示参与、独立作答与自行评价，不代表掌握百分比。记录仅保存在当前设备的浏览器中。", "These counts distinguish participation, independent checks and self-reports; they are not mastery percentages. Records stay in this browser on this device.")));
      if (storageMessage) panelBody.appendChild(el("p", "dt-storage-warning", storageMessage));
      if (panelMessage) { var notice = el("p", "dt-status", panelMessage); notice.setAttribute("role", "status"); panelBody.appendChild(notice); }
      var objectiveList = el("div", "dt-objectives");
      lesson.objectives.forEach(function (objective) {
        var row = el("div", "dt-objective"); row.appendChild(el("strong", "dt-small-heading", objective.title));
        var matching = lesson.activities.filter(function (activity) { return activity.objectiveId === objective.id; });
        var links = el("div", "dt-row");
        matching.forEach(function (activity) {
          var saved = state.activities[activity.id];
          var label = activity.title + (saved.participated ? t(" · 已参与", " · explored") : "");
          links.appendChild(button(label, function () { navigate(activity.id); }, "dt-button-quiet dt-activity-link", "nav-" + activity.id));
        });
        row.appendChild(links); objectiveList.appendChild(row);
      }); panelBody.appendChild(objectiveList);
      var reviewDetails = el("details", "dt-panel-section");
      reviewDetails.appendChild(el("summary", "", t("复习安排与依据", "Review schedule and method")));
      reviewDetails.appendChild(el("p", "dt-small", t("当前规则依次采用 1、3、7、14、30 天，仅到期且无辅助的成功复习推进间隔。独立复习还需距离最近接触提示或参考至少一天；同一会话的重试不推进间隔。答错、查看提示或参考回到次日，查看本身不会添加答错记录。此规则是公开的工程启发式，没有拟合个人遗忘曲线。闪卡与开放回答保留自评标签。", "The disclosed heuristic uses 1, 3, 7, 14 and 30 days. Only successful unassisted due reviews advance the interval, at least a day after the latest hint or reference exposure. Same-session retries do not advance it. Incorrect answers and hint/reference viewing return to the next day; viewing alone adds no incorrect attempt. This is not a fitted personal forgetting curve. Card and open-response evidence stays labelled self-report.")));
      var reviews = getReviews(lesson, state, now());
      if (!reviews.length) reviewDetails.appendChild(el("p", "dt-small", t("提交并核对作答，或完成闪卡自评后，这里会出现复习日期。", "Review dates appear after a checked answer or a flashcard self-rating.")));
      reviews.forEach(function (item) {
        var row = el("div", "dt-review-row" + (item.due ? " dt-review-due" : ""));
        row.appendChild(button(item.title, function () { navigate(item.activityId, item); }, "dt-button-quiet", "review-" + item.activityId + "-" + item.cardIndex));
        var evidenceLabels = { "not-attempted": t("尚未作答", "Not attempted"), "not-self-reviewed": t("尚未自评", "Not self-reviewed"), "self": t("已有自评记录", "Has self-report"), "objective": t("已有自动核对记录", "Has automatically checked attempt") };
        row.appendChild(el("span", "dt-small", (item.due ? t("已经到期 · ", "Due · ") : "") + dateLabel(item.review.dueAt) + " · " + evidenceLabels[reviewEvidenceKind(state, item)])); reviewDetails.appendChild(row);
      });
      if (summary.due) reviewDetails.open = true;
      panelBody.appendChild(reviewDetails);
      var collected = lesson.activities.filter(function (activity) { var saved = state.activities[activity.id]; return saved.bookmarked || saved.notes; });
      if (collected.length) {
        var collection = el("details", "dt-panel-section"); collection.appendChild(el("summary", "", t("收藏与笔记", "Bookmarks and notes")));
        collected.forEach(function (activity) {
          var saved = state.activities[activity.id];
          var entry = el("div", "dt-note-entry");
          entry.appendChild(button((saved.bookmarked ? "★ " : "") + activity.title, function () { navigate(activity.id); }, "dt-button-quiet", "note-nav-" + activity.id));
          if (saved.notes) entry.appendChild(el("p", "dt-note-text", saved.notes)); collection.appendChild(entry);
        }); panelBody.appendChild(collection);
      }
      var actions = el("div", "dt-row dt-transfer");
      actions.appendChild(button(t("导出学习记录", "Export progress"), function () {
        var blob = new win.Blob([JSON.stringify(exportEnvelope(lesson, state, now()), null, 2)], { type: "application/json" });
        var url = win.URL.createObjectURL(blob), link = el("a", "");
        link.href = url; link.download = lesson.lessonId.replace(/[^a-zA-Z0-9_-]/g, "-") + "-progress.json"; doc.body.appendChild(link); link.click(); link.remove();
        win.setTimeout(function () { win.URL.revokeObjectURL(url); }, 1000);
        panelMessage = t("记录导出已发起。导入时需要相同课程与内容版本。", "Progress export started. Import requires the same lesson and content revision."); renderPanel();
      }, "", "export"));
      var upload = el("input", "dt-sr"); upload.type = "file"; upload.accept = "application/json,.json"; upload.tabIndex = -1; upload.setAttribute("aria-label", t("选择学习记录 JSON 文件", "Choose a progress JSON file"));
      upload.addEventListener("change", async function () {
        if (!upload.files || !upload.files[0]) return;
        try {
          if (upload.files[0].size > 5000000) throw new Error(t("记录文件超过 5 MB。", "Progress file exceeds 5 MB."));
          state = prepareSession(lesson, validateImport(lesson, await upload.files[0].text()), now(), sessionId, state);
          closeDueSolutions(); save();
          lesson.activities.forEach(renderActivity);
          notifyCustomRestore();
          panelMessage = t("已导入相同课程版本的记录。", "Imported records for this lesson revision.");
        } catch (error) { panelMessage = t("导入未应用：", "Import not applied: ") + error.message; }
        renderPanel();
      });
      actions.appendChild(button(t("导入学习记录", "Import progress"), function () { upload.click(); }, "", "import")); actions.appendChild(upload); panelBody.appendChild(actions);
      if (state.currentActivity) panelBody.appendChild(button(t("返回上次活动", "Return to last activity"), function () { navigate(state.currentActivity); }, "dt-button-quiet", "resume"));
      if (wasFocused) {
        var candidate = Array.from(panelBody.querySelectorAll("[data-dt-control]")).find(function (node) { return node.dataset.dtControl === wasFocused; });
        if (candidate) candidate.focus({ preventScroll: true });
      }
    }

    lesson.activities.forEach(function (activity) {
      var target = Array.from(doc.querySelectorAll("[data-dt-activity]")).find(function (node) { return node.dataset.dtActivity === activity.id; });
      if (target && target.dataset.dtMounted !== "true") createActivityView(activity, target);
    });
    save(); renderPanel();
    var explorationListener = function (event) {
      var detail = event.detail;
      if (!record(detail) || !definitions.has(detail.activityId)) return;
      var activity = definitions.get(detail.activityId);
      if (activity.type !== "interactive" || !record(detail.state)) return;
      try {
        var serialized = JSON.stringify(detail.state);
        if (serialized.length > 100000) return;
        transition(activity, { type: "explore", state: JSON.parse(serialized) }, false);
      } catch (error) { announce(activity, t("本次探索状态未保存，活动仍可继续。", "This exploration state was not saved; you can continue.")); }
    };
    doc.addEventListener("dt:exploration", explorationListener);
    // A microtask lets the UMD auto-mount expose DialogueTutor.instance before callbacks run.
    Promise.resolve().then(function () {
      lesson.activities.filter(function (activity) { return activity.type === "interactive" && views.has(activity.id); }).forEach(function (activity) {
        doc.dispatchEvent(new win.CustomEvent("dt:activity-mounted", { detail: { activityId: activity.id, state: copy(state.activities[activity.id].exploration) } }));
      });
      doc.dispatchEvent(new win.CustomEvent("dt:ready", { detail: { lessonId: lesson.lessonId, revision: lesson.revision } }));
    });
    return {
      storageKey: key,
      getState: function () { return copy(state); },
      exportState: function () { return exportEnvelope(lesson, state, now()); },
      importState: function (value) { state = prepareSession(lesson, validateImport(lesson, value), now(), sessionId, state); closeDueSolutions(); save(); lesson.activities.forEach(renderActivity); notifyCustomRestore(); renderPanel(); return copy(state); },
      refresh: function () { lesson.activities.forEach(renderActivity); renderPanel(); },
      destroy: function () { doc.removeEventListener("dt:exploration", explorationListener); }
    };
  }

  return {
    version: "1.0.0", DAY: DAY, INTERVAL_DAYS: INTERVAL_DAYS.slice(),
    parseNumeric: parseNumeric, evaluateQuiz: evaluateQuiz, scheduleReview: scheduleReview,
    linearDensity: linearDensity, uniformDistribution: uniformDistribution, updateParameter: updateParameter,
    defaultExploration: defaultExploration, blankActivity: blankActivity, createState: createState,
    markExposure: markExposure, exposureAssists: exposureAssists, prepareSession: prepareSession,
    reduceActivity: reduceActivity, getReviews: getReviews, evidenceSummary: evidenceSummary, reviewEvidenceKind: reviewEvidenceKind,
    validateLesson: validateLesson, exportEnvelope: exportEnvelope, validateImport: validateImport,
    storageKey: storageKey, mount: mount
  };
});
