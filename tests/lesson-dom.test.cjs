'use strict';
// Execute the generated HTML and use DOM events. jsdom does not verify visual layout.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM, VirtualConsole} = require('jsdom');
// Exercise today's runtime against the unchanged legacy generated document.
const runtimeSource = fs.readFileSync(path.join(__dirname,
  '../plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8')
  .replace(/(<script id="dt-runtime">)[\s\S]*?(<\/script>)/, (_, start, end) => start + runtimeSource.replace(/<\/script/gi, '<\\/script') + end);
const lesson = JSON.parse(fs.readFileSync(path.join(__dirname,
  '../plugins/dialogue-tutor/skills/dialogue-tutor/examples/s2-interactive.json'), 'utf8'));
const plain = value => JSON.parse(JSON.stringify(value));
const pause = () => new Promise(resolve => setTimeout(resolve, 10));
const activities = type => lesson.activities.filter(a => a.type === type);

async function page(t, {stored, time = 1788739200000, blockedStorage = false, lessonData} = {}) {
  const errors = [], downloads = [], blobs = [], copied = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const content = lessonData ? html.replace(/(<script type="application\/json" id="dt-lesson">)[\s\S]*?(<\/script>)/,
    (_, start, end) => start + JSON.stringify(lessonData).replace(/</g, '\\u003c') + end) : html;
  const dom = new JSDOM(content, {
    url: 'https://example.test/dialogue-tutor/', runScripts: 'dangerously', virtualConsole,
    beforeParse(win) {
      win.Date.now = () => time;
      win.HTMLElement.prototype.scrollIntoView = function () {};
      win.URL.createObjectURL = blob => { blobs.push(blob); return 'blob:progress'; };
      win.URL.revokeObjectURL = () => {};
      const anchorClick = win.HTMLAnchorElement.prototype.click;
      win.HTMLAnchorElement.prototype.click = function () {
        if (this.download) downloads.push(this.download); else anchorClick.call(this);
      };
      Object.defineProperty(win.navigator, 'clipboard', {value: {writeText: async text => copied.push(text)}, configurable: true});
      if (stored) Object.entries(stored).forEach(([key, value]) => win.localStorage.setItem(key, value));
      if (blockedStorage) Object.defineProperty(win, 'localStorage', {get() { throw new Error('storage denied'); }});
    }
  });
  const win = dom.window, doc = win.document;
  await new Promise(resolve => doc.addEventListener('dt:ready', resolve, {once: true}));
  const api = win.DialogueTutor.instance;
  assert.ok(api, 'generated script mounts automatically');
  t.after(() => { dom.window.close(); assert.deepEqual(errors, [], 'no unhandled runtime errors'); });
  return {win, doc, api, copied, downloads, blobs,
    box: id => doc.querySelector('[data-dt-activity="' + id + '"]'),
    state: id => plain(api.getState().activities[id])};
}
function control(p, id, name) {
  const root = id ? p.box(id) : p.doc.querySelector('[data-dt-study]');
  const node = root.querySelector('[data-dt-control="' + name + '"]');
  assert.ok(node, `control ${id || 'study'}:${name} exists`); return node;
}
function click(p, id, name) { control(p, id, name).click(); }
function input(p, id, name, value) {
  const node = control(p, id, name); node.value = value;
  node.dispatchEvent(new p.win.Event(node.type === 'radio' ? 'change' : 'input', {bubbles: true}));
}
function answer(p, activity, value) {
  if (activity.format === 'choice') {
    const index = activity.choices.findIndex(c => c.id === value);
    const radio = control(p, activity.id, 'choice-' + index); radio.checked = true;
    radio.dispatchEvent(new p.win.Event('change', {bubbles: true}));
  } else input(p, activity.id, 'answer', value);
  click(p, activity.id, 'submit');
}
async function importFile(p, data) {
  const upload = p.doc.querySelector('[data-dt-study] input[type=file]');
  Object.defineProperty(upload, 'files', {value: [{size: data.length, text: async () => data}], configurable: true});
  upload.dispatchEvent(new p.win.Event('change', {bubbles: true}));
  await pause();
}

test('the built S2 page mounts all 15 activities and preserves six closed complete solutions', async t => {
  const p = await page(t);
  assert.equal(p.doc.querySelectorAll('[data-dt-mounted=true]').length, 15);
  assert.equal(p.doc.querySelectorAll('.dt-worked-solution').length, 6);
  for (const item of p.doc.querySelectorAll('.dt-worked-solution')) {
    assert.equal(item.open, false); assert.equal(item.querySelectorAll('.six').length, 6);
    assert.ok(item.previousElementSibling.matches('[data-dt-activity]'));
  }
  assert.equal(p.doc.querySelectorAll('.dt-reference').length, 0);
  assert.equal(p.doc.querySelectorAll('.dt-activity input:not([type=radio]), .dt-activity textarea').length > 0, true);
  for (const node of p.doc.querySelectorAll('.dt-activity input, .dt-activity textarea')) {
    assert.ok(node.closest('label') || node.getAttribute('aria-label'), 'form controls have accessible names');
  }
});

test('flashcard flip, navigation, hints and ratings persist per card with self-report evidence', async t => {
  const p = await page(t), card = activities('flashcards')[0];
  assert.equal(control(p, card.id, 'flash-prev').disabled, true);
  click(p, card.id, 'flash-flip');
  assert.match(p.box(card.id).textContent, new RegExp(card.cards[0].back.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  click(p, card.id, 'flash-good'); click(p, card.id, 'flash-good');
  assert.equal(p.state(card.id).attempts.length, 1);
  assert.equal(p.state(card.id).attempts[0].source, 'self');
  assert.equal(p.state(card.id).attempts[0].assisted, false);
  click(p, card.id, 'flash-next');
  if (card.cards[1].hint) click(p, card.id, 'flash-hint');
  click(p, card.id, 'flash-flip'); click(p, card.id, 'flash-again');
  assert.equal(p.state(card.id).attempts.length, 2);
  assert.equal(p.state(card.id).flash.cards['1'].rating, 'again');
  click(p, card.id, 'flash-prev');
  assert.equal(control(p, card.id, 'flash-good').disabled, true);
});

test('choice requires submit, gives distractor feedback, prevents duplicate attempts and supports retry', async t => {
  const p = await page(t), quiz = activities('quiz').find(a => a.format === 'choice');
  const wrong = quiz.choices.find(c => c.id !== quiz.answer);
  const radio = control(p, quiz.id, 'choice-' + quiz.choices.indexOf(wrong)); radio.click();
  assert.equal(p.state(quiz.id).attempts.length, 0);
  assert.equal(p.box(quiz.id).querySelector('.dt-reference'), null);
  click(p, quiz.id, 'submit');
  assert.equal(p.state(quiz.id).attempts[0].correct, false);
  assert.ok(p.box(quiz.id).textContent.includes(wrong.feedback));
  click(p, quiz.id, 'submit'); assert.equal(p.state(quiz.id).attempts.length, 1);
  const due = p.state(quiz.id).review.dueAt;
  click(p, quiz.id, 'retry'); answer(p, quiz, quiz.answer);
  assert.equal(p.state(quiz.id).attempts[1].correct, true);
  assert.equal(p.state(quiz.id).attempts[1].assisted, true);
  assert.equal(p.state(quiz.id).review.dueAt, due);
  assert.equal(p.state(quiz.id).review.intervalIndex, 0);
});

test('numeric checks accept equivalent fractions and reject expressions or infinite values without scoring', async t => {
  const p = await page(t), quiz = activities('quiz').find(a => a.format === 'numeric');
  answer(p, quiz, '1/0'); assert.equal(p.state(quiz.id).attempts.length, 0);
  assert.ok(p.box(quiz.id).querySelector('.dt-error').textContent.length);
  answer(p, quiz, String(quiz.answer));
  assert.equal(p.state(quiz.id).attempts[0].correct, true);
  assert.equal(p.state(quiz.id).attempts[0].assisted, false);
  click(p, quiz.id, 'retry');
  answer(p, quiz, 'Math.random()'); assert.equal(p.state(quiz.id).attempts.length, 1);
});

test('a numeric fraction reference is rendered as native MathML rather than slash notation', async t => {
  const fixture = plain(lesson), quiz = fixture.activities.find(a => a.format === 'numeric');
  quiz.answer = '13/5';
  const p = await page(t, {lessonData: fixture});
  answer(p, quiz, String(quiz.answer));
  const fraction = p.box(quiz.id).querySelector('.dt-reference-answer math mfrac');
  assert.ok(fraction);
  assert.deepEqual([...fraction.children].map(node => node.textContent), String(quiz.answer).split('/'));
  assert.equal(fraction.namespaceURI, 'http://www.w3.org/1998/Math/MathML');
});

test('showing a hint or opening an original worked solution before submission marks assistance', async t => {
  const p = await page(t), quiz = activities('quiz').find(a => a.solutionId && a.format === 'numeric');
  const solution = p.doc.getElementById(quiz.solutionId); solution.open = true;
  // The submit handler must also handle a details toggle still in the event queue.
  answer(p, quiz, String(quiz.answer));
  assert.equal(p.state(quiz.id).attempts[0].assisted, true);
  await pause();
  assert.equal(p.state(quiz.id).attempts.length, 1);
  const other = activities('quiz').find(a => a.hint && a.id !== quiz.id);
  click(p, other.id, 'hint');
  answer(p, other, other.format === 'open' ? '我先写下理由。' : String(other.answer));
  assert.equal(p.state(other.id).attempts[0].assisted, true);
});

test('opening feedback after an independent submission does not change the saved attempt', async t => {
  const p = await page(t), quiz = activities('quiz').find(a => a.solutionId && a.format === 'numeric');
  answer(p, quiz, String(quiz.answer));
  p.doc.getElementById(quiz.solutionId).open = true; await pause();
  assert.equal(p.state(quiz.id).attempts[0].assisted, false);
});

test('open responses retain original text, reveal a rubric and require explicit self-evaluation', async t => {
  const p = await page(t), quiz = activities('quiz').find(a => a.format === 'open');
  const original = '<img src=x onerror="alert(1)"> 我将密度积分并令总面积为一。';
  answer(p, quiz, original);
  assert.equal(p.state(quiz.id).attempts[0].answer, original);
  assert.equal(p.state(quiz.id).attempts[0].correct, null);
  assert.equal(p.box(quiz.id).querySelectorAll('.dt-rubric li').length, quiz.rubric.length);
  assert.equal(p.box(quiz.id).querySelector('img'), null);
  click(p, quiz.id, 'self-good'); click(p, quiz.id, 'self-good');
  assert.equal(p.state(quiz.id).attempts.length, 1);
  assert.equal(p.state(quiz.id).attempts[0].source, 'self');
  assert.equal(p.state(quiz.id).attempts[0].correct, true);
});

test('skip is reversible and does not create an incorrect or passing attempt', async t => {
  const p = await page(t), quiz = activities('quiz')[0];
  click(p, quiz.id, 'skip');
  assert.equal(p.state(quiz.id).status, 'skipped');
  assert.equal(p.state(quiz.id).attempts.length, 0);
  click(p, quiz.id, 'retry'); assert.equal(p.state(quiz.id).status, 'idle');
});

test('step controls change the displayed reasoning without generating a score', async t => {
  const p = await page(t), steps = activities('steps')[0];
  click(p, steps.id, 'step-next');
  assert.equal(p.state(steps.id).stepIndex, 1);
  assert.ok(p.box(steps.id).querySelector('.dt-step-stage').textContent.includes(steps.steps[1].title));
  click(p, steps.id, 'step-prev'); click(p, steps.id, 'step-' + (steps.steps.length - 1));
  assert.equal(control(p, steps.id, 'step-next').disabled, true);
  click(p, steps.id, 'step-reset');
  assert.equal(p.state(steps.id).stepIndex, 0); assert.equal(p.state(steps.id).attempts.length, 0);
});

test('both probability explorers update SVG and computed metrics, reset and retain exploration only', async t => {
  const p = await page(t);
  for (const activity of activities('explore')) {
    const start = p.state(activity.id).exploration;
    const graphBefore = p.box(activity.id).querySelector('.dt-plots').innerHTML;
    const key = activity.model === 'uniform' ? 'upper' : 'b';
    input(p, activity.id, 'parameter-' + key, activity.model === 'uniform' ? '9' : '0.8');
    assert.notEqual(p.box(activity.id).querySelector('.dt-plots').innerHTML, graphBefore);
    assert.ok(p.box(activity.id).querySelector('.dt-metrics').textContent.length > 0);
    assert.equal(p.state(activity.id).attempts.length, 0);
    click(p, activity.id, 'explore-reset'); assert.deepEqual(p.state(activity.id).exploration, start);
  }
});

test('uniform event markers distinguish original endpoints from the shaded intersection and matching CDF', async t => {
  const p = await page(t), activity = activities('explore').find(item => item.model === 'uniform');
  const cases = [
    {a: -2, b: 10, clipped: [0, 8], area: true, cdfA: 0, cdfB: 1, probability: 1},
    {a: -2, b: 4, clipped: [0], area: true, cdfA: 0, cdfB: 0.5, probability: 0.5},
    {a: 4, b: 10, clipped: [8], area: true, cdfA: 0.5, cdfB: 1, probability: 0.5},
    {a: 9, b: 10, clipped: [], area: false, cdfA: 1, cdfB: 1, probability: 0},
    {a: -4, b: -2, clipped: [], area: false, cdfA: 0, cdfB: 0, probability: 0},
    {a: 4, b: 4, clipped: [], area: false, cdfA: 0.5, cdfB: 0.5, probability: 0}
  ];
  for (const scenario of cases) {
    // Set the upper endpoint first so the control's ordering guard cannot clamp a.
    input(p, activity.id, 'parameter-eventB', '10');
    input(p, activity.id, 'parameter-eventA', String(scenario.a));
    input(p, activity.id, 'parameter-eventB', String(scenario.b));
    const [density, cdf] = p.box(activity.id).querySelectorAll('.dt-graph');
    const points = (graph, kind) => [...graph.querySelectorAll('[data-dt-marker-kind="' + kind + '"]')];
    const values = (graph, kind) => points(graph, kind).map(node => Number(node.dataset.dtValue));
    assert.deepEqual(values(density, 'event'), [scenario.a, scenario.b]);
    assert.deepEqual(values(cdf, 'event'), [scenario.a, scenario.b], 'CDF keeps original event endpoints');
    assert.deepEqual(values(density, 'clipped'), scenario.clipped);
    assert.ok(points(density, 'event').every(node => node.tagName === 'circle'));
    assert.ok(points(density, 'clipped').every(node => node.tagName === 'rect'));
    assert.equal(Boolean(density.querySelector('.dt-graph-area')), scenario.area, 'empty intersections have no shaded region');
    assert.deepEqual(points(cdf, 'event').map(node => Number(node.getAttribute('cy'))), [207 - scenario.cdfA * 159, 207 - scenario.cdfB * 159]);
    const summary = p.box(activity.id).querySelector('.dt-event-summary').textContent;
    assert.ok(summary.includes('a = ' + scenario.a)); assert.ok(summary.includes('b = ' + scenario.b));
    assert.ok(summary.includes('F(a) = ' + scenario.cdfA)); assert.ok(summary.includes('F(b) = ' + scenario.cdfB));
    assert.ok(summary.includes('F(b) − F(a) = ' + scenario.probability));
    if (scenario.a > 8 || scenario.b < 0) assert.match(summary, /无交集/);
    for (const graph of [density, cdf]) {
      const labels = [...graph.querySelectorAll('.dt-graph-event-label')];
      assert.deepEqual(labels.map(node => node.textContent), ['a', 'b']);
      assert.ok(labels.every(node => Number(node.getAttribute('y')) > 230), 'event labels sit below numeric ticks');
      assert.notEqual(labels[0].getAttribute('y'), labels[1].getAttribute('y'), 'coincident endpoints retain separate labels');
    }
  }
  assert.equal(p.state(activity.id).attempts.length, 0);
});

test('notes, bookmarks, drafts and last position restore in a fresh page', async t => {
  const p = await page(t), quiz = activities('quiz').find(a => a.format === 'numeric');
  input(p, quiz.id, 'answer', '13/5');
  const note = p.box(quiz.id).querySelector('.dt-note textarea');
  note.value = '明天重新解释为什么面积是一。'; note.dispatchEvent(new p.win.Event('input', {bubbles: true}));
  click(p, quiz.id, 'note-save'); click(p, quiz.id, 'bookmark');
  const stored = {[p.api.storageKey]: p.win.localStorage.getItem(p.api.storageKey)};
  const next = await page(t, {stored});
  assert.deepEqual(next.state(quiz.id), p.state(quiz.id));
  assert.equal(control(next, quiz.id, 'answer').value, '13/5');
  assert.equal(control(next, quiz.id, 'bookmark').getAttribute('aria-pressed'), 'true');
  assert.equal(next.api.getState().currentActivity, quiz.id);
  click(next, null, 'resume');
});

test('copy context includes the learner response and notes; clipboard fallback remains usable', async t => {
  const p = await page(t), quiz = activities('quiz').find(a => a.format === 'numeric');
  input(p, quiz.id, 'answer', '0.2'); click(p, quiz.id, 'copy-context'); await pause();
  assert.ok(p.copied[0].includes('0.2')); assert.ok(p.copied[0].includes(quiz.prompt));
  Object.defineProperty(p.win.navigator, 'clipboard', {value: undefined});
  click(p, quiz.id, 'copy-context'); await pause();
  assert.ok(p.box(quiz.id).querySelector('.dt-copy-fallback').value.includes(quiz.prompt));
});

test('export UI initiates a JSON download and file import restores records or rejects mismatched revisions', async t => {
  const p = await page(t), quiz = activities('quiz').find(a => a.format === 'numeric');
  answer(p, quiz, String(quiz.answer));
  const saved = JSON.stringify(p.api.exportState());
  click(p, null, 'export'); assert.equal(p.downloads[0], lesson.lessonId + '-progress.json');
  assert.equal(p.blobs[0].type, 'application/json');
  click(p, quiz.id, 'retry'); await importFile(p, saved);
  assert.equal(p.state(quiz.id).status, 'submitted');
  const wrong = JSON.parse(saved); wrong.revision = 'other';
  await importFile(p, JSON.stringify(wrong));
  assert.equal(p.state(quiz.id).status, 'submitted');
  assert.match(p.doc.querySelector('[data-dt-study]').textContent, /导入未应用/);
});

test('a due review advances on the next day, while an immediate retry does not advance again', async t => {
  const time = 1788739200000, p = await page(t, {time});
  const quiz = activities('quiz').find(a => a.format === 'numeric');
  answer(p, quiz, String(quiz.answer));
  const stored = {[p.api.storageKey]: p.win.localStorage.getItem(p.api.storageKey)};
  const next = await page(t, {stored, time: time + 86400000 + 1});
  assert.equal(next.box(quiz.id).querySelector('.dt-reference'), null, 'old reference is hidden before any review click');
  assert.equal(control(next, quiz.id, 'answer').value, '', 'old answer does not prefill a due review');
  click(next, null, 'review-' + quiz.id + '-undefined');
  assert.equal(next.state(quiz.id).answerRevealed, false);
  answer(next, quiz, String(quiz.answer)); assert.equal(next.state(quiz.id).review.intervalIndex, 1);
  const due = next.state(quiz.id).review.dueAt;
  click(next, quiz.id, 'retry'); answer(next, quiz, String(quiz.answer));
  assert.equal(next.state(quiz.id).attempts.at(-1).assisted, true);
  assert.ok(next.state(quiz.id).review.dueAt < due, 'an assisted retry returns to the next-day interval');
  assert.equal(next.state(quiz.id).review.intervalIndex, 0);
});

test('direct reveal followed by retry never becomes an independent pass', async t => {
  const p = await page(t), quiz = activities('quiz').find(a => a.format === 'numeric');
  click(p, quiz.id, 'reveal');
  assert.equal(p.state(quiz.id).attempts.length, 0);
  assert.match(p.doc.querySelector('.dt-review-row').textContent, /尚未作答/);
  click(p, quiz.id, 'retry'); answer(p, quiz, String(quiz.answer));
  assert.equal(p.state(quiz.id).attempts[0].assisted, true);
  const summary = p.win.DialogueTutor.evidenceSummary(lesson, p.api.getState(), p.win.Date.now());
  assert.equal(summary.independentPassed, 0);
});

test('due open-response drafts and pending self-review survive page reload', async t => {
  const time = 1788739200000, p = await page(t, {time});
  const quiz = activities('quiz').find(a => a.format === 'open');
  answer(p, quiz, '第一次完整解释。'); click(p, quiz.id, 'self-good');
  const stored = {[p.api.storageKey]: p.win.localStorage.getItem(p.api.storageKey)};
  const next = await page(t, {stored, time: time + 86400000 + 1});
  input(next, quiz.id, 'answer', '第二次回忆：我的证明还没有写完。');
  const resumed = await page(t, {stored: {[next.api.storageKey]: next.win.localStorage.getItem(next.api.storageKey)}, time: time + 86400000 + 2});
  assert.equal(control(resumed, quiz.id, 'answer').value, '第二次回忆：我的证明还没有写完。');
  click(resumed, quiz.id, 'submit');
  const pending = await page(t, {stored: {[resumed.api.storageKey]: resumed.win.localStorage.getItem(resumed.api.storageKey)}, time: time + 86400000 + 3});
  assert.equal(pending.state(quiz.id).status, 'submitted');
  assert.equal(control(pending, quiz.id, 'answer').value, '第二次回忆：我的证明还没有写完。');
  assert.equal(pending.state(quiz.id).attempts.at(-1).correct, null);
  click(pending, quiz.id, 'self-good');
  assert.equal(pending.state(quiz.id).attempts.at(-1).assisted, false);
  assert.equal(pending.state(quiz.id).review.intervalIndex, 1);
});

test('a hint used during a due review survives refresh and cannot lengthen the interval', async t => {
  const time = 1788739200000, p = await page(t, {time});
  const quiz = activities('quiz').find(a => a.format === 'numeric' && a.hint);
  answer(p, quiz, String(quiz.answer));
  const next = await page(t, {stored: {[p.api.storageKey]: p.win.localStorage.getItem(p.api.storageKey)}, time: time + 86400000 + 1});
  click(next, quiz.id, 'hint');
  const resumed = await page(t, {stored: {[next.api.storageKey]: next.win.localStorage.getItem(next.api.storageKey)}, time: time + 86400000 + 2});
  assert.equal(resumed.state(quiz.id).hintUsed, true);
  answer(resumed, quiz, String(quiz.answer));
  assert.equal(resumed.state(quiz.id).attempts.at(-1).assisted, true);
  assert.equal(resumed.state(quiz.id).review.intervalIndex, 0);
});

test('a due flashcard opens on the question side before navigation or rating', async t => {
  const time = 1788739200000, p = await page(t, {time}), card = activities('flashcards')[0];
  click(p, card.id, 'flash-flip'); click(p, card.id, 'flash-good');
  const next = await page(t, {stored: {[p.api.storageKey]: p.win.localStorage.getItem(p.api.storageKey)}, time: time + 86400000 + 1});
  assert.equal(next.state(card.id).flash.cards['0'].revealed, false);
  assert.equal(next.box(card.id).querySelector('.dt-flashcard-back'), null);
  assert.equal(next.box(card.id).querySelector('[data-dt-control=flash-good]'), null);
  click(next, card.id, 'flash-flip'); click(next, card.id, 'flash-good');
  assert.equal(next.state(card.id).attempts.at(-1).assisted, false);
  assert.equal(next.state(card.id).flash.cards['0'].review.intervalIndex, 1);
});

test('linked flashcard details opened before a flip mark assistance even before native toggle fires', async t => {
  const fixture = plain(lesson), card = fixture.activities.find(activity => activity.type === 'flashcards');
  card.solutionId = fixture.activities.find(activity => activity.solutionId).solutionId;
  const p = await page(t, {lessonData: fixture}), solution = p.doc.getElementById(card.solutionId);
  solution.open = true;
  click(p, card.id, 'flash-flip'); click(p, card.id, 'flash-good');
  assert.equal(p.state(card.id).attempts.at(-1).assisted, true);
  assert.equal(p.state(card.id).attempts.at(-1).source, 'self');
  click(p, card.id, 'flash-next'); click(p, card.id, 'flash-flip'); click(p, card.id, 'flash-good');
  assert.equal(p.state(card.id).attempts.at(-1).assisted, true, 'a still-open solution constrains the next card');
  await pause();
  const stored = {[p.api.storageKey]: p.win.localStorage.getItem(p.api.storageKey)};
  const next = await page(t, {stored, time: 1788739200000 + 86400000 + 1, lessonData: fixture});
  const due = next.win.DialogueTutor.getReviews(fixture, next.api.getState(), next.win.Date.now()).find(item => item.activityId === card.id && item.cardIndex === 0);
  assert.equal(due.due, true); next.api.navigate(card.id, due);
  assert.equal(next.doc.getElementById(card.solutionId).open, false);
  assert.equal(next.state(card.id).flash.cards['0'].revealed, false);
  click(next, card.id, 'flash-flip'); click(next, card.id, 'flash-good');
  assert.equal(next.state(card.id).attempts.at(-1).assisted, false);
  assert.equal(next.state(card.id).flash.cards['0'].review.intervalIndex, 1);
  next.doc.getElementById(card.solutionId).open = true;
  click(next, card.id, 'flash-next'); click(next, card.id, 'flash-flip'); click(next, card.id, 'flash-good');
  assert.equal(next.state(card.id).attempts.at(-1).assisted, true, 'reopening on a due day records new assistance');
});

test('linked flashcard details opened after the first flip preserve that recall and constrain later cards', async t => {
  const fixture = plain(lesson), card = fixture.activities.find(activity => activity.type === 'flashcards');
  card.solutionId = fixture.activities.find(activity => activity.solutionId).solutionId;
  const p = await page(t, {lessonData: fixture});
  click(p, card.id, 'flash-flip'); p.doc.getElementById(card.solutionId).open = true;
  click(p, card.id, 'flash-good'); await pause();
  assert.equal(p.state(card.id).attempts[0].assisted, false);
  assert.equal(p.state(card.id).exposure.reference, true);
  click(p, card.id, 'flash-next'); click(p, card.id, 'flash-flip'); click(p, card.id, 'flash-good');
  assert.equal(p.state(card.id).attempts.at(-1).assisted, true);
  click(p, card.id, 'flash-prev'); click(p, card.id, 'flash-restart'); click(p, card.id, 'flash-flip'); click(p, card.id, 'flash-good');
  assert.equal(p.state(card.id).attempts.at(-1).assisted, true);
  assert.equal(p.state(card.id).attempts[0].assisted, false);
  const stored = {[p.api.storageKey]: p.win.localStorage.getItem(p.api.storageKey)};
  const next = await page(t, {stored, time: 1788739200000 + 86400000 + 1, lessonData: fixture});
  const due = next.win.DialogueTutor.getReviews(fixture, next.api.getState(), next.win.Date.now()).find(item => item.activityId === card.id && item.cardIndex === 0);
  next.api.navigate(card.id, due); click(next, card.id, 'flash-flip');
  next.doc.getElementById(card.solutionId).open = true; click(next, card.id, 'flash-good');
  await pause();
  assert.equal(next.state(card.id).attempts.at(-1).assisted, false);
  assert.equal(next.state(card.id).flash.cards['0'].review.intervalIndex, 1, 'a delayed toggle does not retroactively undo a due recall');
});

test('activities remain usable when browser storage is unavailable', async t => {
  const p = await page(t, {blockedStorage: true});
  const quiz = activities('quiz').find(a => a.format === 'numeric');
  answer(p, quiz, String(quiz.answer));
  assert.equal(p.state(quiz.id).attempts[0].correct, true);
  assert.match(p.doc.querySelector('[data-dt-study]').textContent, /请导出记录/);
  click(p, null, 'export'); assert.equal(p.downloads.length, 1);
});
