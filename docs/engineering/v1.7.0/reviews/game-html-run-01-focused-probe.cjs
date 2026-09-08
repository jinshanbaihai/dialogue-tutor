'use strict';
// Re-review of the fixed artifact. This is a DOM/state probe, not a browser or a learning-outcome study.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { JSDOM, VirtualConsole } = require('../repo/node_modules/jsdom');
const base = path.resolve(__dirname, '../generation/run-01');
const html = fs.readFileSync(path.join(base, 'lesson.html'), 'utf8');
const lesson = JSON.parse(fs.readFileSync(path.join(base, 'lesson.json'), 'utf8'));
const NOW = Date.UTC(2026, 8, 8, 12);
const DAY = 86400000;
const live = [];
const plain = x => JSON.parse(JSON.stringify(x));
const waitEvent = () => new Promise(resolve => setTimeout(resolve, 0));
const transcript = {
  reviewer: 'game_design_resumed',
  environment: 'JSDOM; controlled Date.now. No rendering, contrast, mobile layout, real elapsed retention or causal motivation claim.',
  files: Object.fromEntries(['lesson.html', 'lesson.json', 'blueprint.md'].map(name => [name, crypto.createHash('sha256').update(fs.readFileSync(path.join(base, name))).digest('hex')])),
  cases: [],
  errors: []
};
async function page({ stored, time = NOW } = {}) {
  const errors = [], vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(html, { url: 'https://review.example/s2-ch6-focused', runScripts: 'dangerously', virtualConsole: vc,
    beforeParse(win) {
      win.Date.now = () => time;
      win.HTMLElement.prototype.scrollIntoView = function () {};
      if (stored) Object.entries(stored).forEach(([key, value]) => win.localStorage.setItem(key, value));
    }
  });
  const win = dom.window, doc = win.document;
  await new Promise(resolve => doc.addEventListener('dt:ready', resolve, { once: true }));
  const api = win.DialogueTutor.instance;
  const p = { dom, win, doc, api, errors,
    box: id => doc.getElementById('dt-activity-' + id),
    state: id => plain(api.getState().activities[id]),
    lab: () => plain(api.getState().activities['sampling-lab'].exploration),
    stored: () => ({ [api.storageKey]: win.localStorage.getItem(api.storageKey) })
  };
  assert(JSON.stringify(JSON.parse(doc.getElementById('dt-lesson').textContent)) === JSON.stringify(lesson), 'Embedded lesson differs from delivered JSON');
  live.push(p); return p;
}
function assert(condition, message) { if (!condition) throw Error(message); }
function node(p, id, selector) { const n = p.box(id).querySelector(selector); assert(n, id + ': missing ' + selector); return n; }
function click(p, id, selector) { const n = node(p, id, selector); assert(!n.disabled, 'Disabled ' + selector); n.click(); }
function value(p, id, selector, v) { const n = node(p, id, selector); n.value = v; n.dispatchEvent(new p.win.Event(n.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); }
function text(p, id, selector) { return node(p, id, selector).textContent.replace(/\s+/g, ' ').trim(); }
function ctl(name) { return '[data-dt-control="' + name + '"]'; }
function answer(p, id, v) { p.api.navigate(id); value(p, id, ctl('answer'), v); click(p, id, ctl('submit')); }
function closing(p) {
  p.api.navigate('evidence-close');
  return { story: text(p, 'evidence-close', '[data-close-story]'), evidence: text(p, 'evidence-close', '[data-close-evidence]'), review: text(p, 'evidence-close', '[data-close-review]'), note: text(p, 'evidence-close', '[data-close-review-note]') };
}
async function run(name, fn) {
  try { transcript.cases.push({ name, probeStatus: 'completed', ...await fn() }); }
  catch (error) { transcript.cases.push({ name, probeStatus: 'failed', error: error.stack }); }
}
(async () => {
  await run('F1-reveal-only-does-not-evidence-learner-mapping-or-grouping', async () => {
    const rows = [];
    for (const prediction of [null, 'centre']) {
      const p = await page();
      if (prediction) {
        value(p, 'sampling-lab', '[data-lab-prediction]', prediction);
        click(p, 'sampling-lab', '[data-lab-freeze]');
        click(p, 'sampling-lab', '[data-lab-reveal]');
      } else click(p, 'sampling-lab', '[data-lab-skip]');
      const state = p.lab(), output = closing(p);
      assert(state.simulation.B === 0 && state.selectedPath === 0 && p.state('sampling-lab').attempts.length === 0, 'Unexpected additional action');
      assert(output.story.includes('你已经在实验中把一份样本映射为一个均值，再把同值的路径合并'), 'Reported attribution issue not reproduced');
      rows.push({ input: prediction ? ['centre', 'freeze', 'reveal', 'navigate evidence-close'] : ['skip prediction / reveal', 'navigate evidence-close'], state, output, finding: 'Important: automatic reveal is attributed to learner mapping and grouping.' });
    }
    return { rows };
  });
  await run('F2-equal-feedback-with-n-one', async () => {
    const rows = [];
    for (const replacement of ['yes', 'no']) {
      const p = await page();
      value(p, 'sampling-lab', '[data-lab-n]', '1'); value(p, 'sampling-lab', '[data-lab-replacement]', replacement);
      value(p, 'sampling-lab', '[data-lab-prediction]', 'equal'); click(p, 'sampling-lab', '[data-lab-freeze]'); click(p, 'sampling-lab', '[data-lab-reveal]');
      const output = text(p, 'sampling-lab', '[data-lab-comparison]');
      assert(output.includes('P(均值=3)=1/3，P(均值=1)=1/3') && output.includes('这个差异'), 'Reported equality copy issue not reproduced');
      rows.push({ input: ['n=1', 'replacement=' + replacement, 'equal', 'freeze', 'reveal'], output });
    }
    return { finding: 'Minor: equal probabilities are followed by an instruction to explain a difference.', rows };
  });
  await run('F3-import-old-state-after-reference-must-not-forget-assistance', async () => {
    const p = await page(); const cold = p.api.exportState();
    p.doc.getElementById('dt-explanation-opening-scene').open = true; await waitEvent(); await waitEvent();
    const before = { lab: p.lab(), exposure: p.state('sampling-lab').exposure, solutionOpen: p.doc.getElementById('dt-explanation-opening-scene').open };
    assert(before.lab.referenceViewed && before.exposure.reference, 'Reference was not captured before import');
    p.api.importState(cold);
    const restored = { lab: p.lab(), exposure: p.state('sampling-lab').exposure, solutionOpen: p.doc.getElementById('dt-explanation-opening-scene').open, referenceMessage: text(p, 'sampling-lab', '[data-lab-reference]') };
    value(p, 'sampling-lab', '[data-lab-prediction]', 'centre'); click(p, 'sampling-lab', '[data-lab-freeze]'); click(p, 'sampling-lab', '[data-lab-reveal]');
    const final = { lab: p.lab(), exposure: p.state('sampling-lab').exposure, comparison: text(p, 'sampling-lab', '[data-lab-comparison]') };
    assert(restored.exposure.reference && !restored.lab.referenceViewed && restored.solutionOpen, 'Reported import/reference state divergence not reproduced');
    assert(!final.lab.predictionHadReference && !final.comparison.includes('提交该判断前已看过参考'), 'Reference disclosure unexpectedly recovered');
    return { input: ['export cold state', 'open opening full explanation', 'import cold state through public API', 'centre', 'freeze', 'reveal'], before, restored, final, finding: 'Important: custom prediction claims no prior reference even though runtime preserves that exposure and the answer is still open.' };
  });
  await run('F4-ending-import-refresh-and-live-destinations', async () => {
    const p = await page(); closing(p); const cold = p.api.exportState();
    answer(p, 'mean-independent', '5/9'); closing(p); const complete = p.api.exportState();
    const currentOutput = () => ({ story: text(p, 'evidence-close', '[data-close-story]'), evidence: text(p, 'evidence-close', '[data-close-evidence]'), review: text(p, 'evidence-close', '[data-close-review]'), note: text(p, 'evidence-close', '[data-close-review-note]') });
    const restoreIds = []; p.doc.addEventListener('dt:restore', event => restoreIds.push(event.detail.activityId));
    p.api.importState(cold);
    const empty = { output: currentOutput(), attempts: p.state('mean-independent').attempts.length };
    click(p, 'evidence-close', '[data-close-review]'); empty.destination = p.api.getState().currentActivity;
    p.api.importState(complete);
    const filled = { output: currentOutput(), attempts: p.state('mean-independent').attempts.length };
    click(p, 'evidence-close', '[data-close-review]'); filled.destination = p.api.getState().currentActivity;
    assert(empty.attempts === 0 && empty.destination === 'return-recall', 'Empty import kept old destination');
    assert(filled.attempts === 1 && filled.destination === 'mean-independent', 'Completed import kept empty destination');
    assert(restoreIds.filter(id => id === 'evidence-close').length === 2, 'Expected per-activity restore missing');
    return { input: ['empty ending export', 'independent 5/9 ending export', 'import empty', 'click actual review button', 'import completed', 'click actual review button'], empty, filled, restoreIds, finding: 'Suspected dt:restore activityId filtering failure not reproduced; both text and onclick destination refresh.' };
  });
  await run('F5-frozen-reload-preserves-identity-and-hidden-results', async () => {
    const p = await page(); value(p, 'sampling-lab', '[data-lab-prediction]', 'edge'); click(p, 'sampling-lab', '[data-lab-freeze]');
    const saved = p.lab(); const reloaded = await page({ stored: p.stored() });
    const restored = { lab: reloaded.lab(), resultsHidden: node(reloaded, 'sampling-lab', '[data-lab-results]').hidden, predictionDisabled: node(reloaded, 'sampling-lab', '[data-lab-prediction]').disabled, nDisabled: node(reloaded, 'sampling-lab', '[data-lab-n]').disabled };
    assert(restored.lab.prediction === saved.prediction && restored.lab.predictionAt === saved.predictionAt && restored.lab.phase === 'frozen', 'Reload changed original prediction');
    assert(restored.resultsHidden && restored.predictionDisabled && restored.nDisabled, 'Reload revealed or unlocked frozen prediction');
    click(reloaded, 'sampling-lab', '[data-lab-reveal]');
    return { input: ['edge', 'freeze', 'reload with stored state', 'reveal'], restored, comparison: text(reloaded, 'sampling-lab', '[data-lab-comparison]') };
  });
  await run('F6-ordinary-return-versus-actual-due-recall', async () => {
    const p = await page(); answer(p, 'mean-independent', '5/9'); const schedule = p.state('mean-independent').review;
    closing(p); p.api.navigate('mean-independent');
    const ordinary = { draft: p.state('mean-independent').draft, answerRevealed: p.state('mean-independent').answerRevealed, attemptCount: p.state('mean-independent').attempts.length, review: p.state('mean-independent').review };
    assert(ordinary.answerRevealed && ordinary.attemptCount === 1 && ordinary.review.dueAt === schedule.dueAt, 'Ordinary navigation unexpectedly became new recall');
    const due = await page({ stored: p.stored(), time: NOW + DAY + 1 });
    const afterDueReload = { draft: due.state('mean-independent').draft, answerRevealed: due.state('mean-independent').answerRevealed, attempts: due.state('mean-independent').attempts.length };
    const close = closing(due); click(due, 'evidence-close', '[data-close-review]');
    const recall = { draft: due.state('mean-independent').draft, answerRevealed: due.state('mean-independent').answerRevealed, attempts: due.state('mean-independent').attempts.length, review: due.state('mean-independent').review };
    assert(recall.draft === '' && !recall.answerRevealed && recall.attempts === 1, 'Actual due entry failed to hide old answer or preserve history');
    answer(due, 'mean-independent', '5/9'); const after = due.state('mean-independent');
    assert(after.attempts.at(-1).assisted === false && after.review.intervalIndex === 1, 'Due independent recall failed to advance scheduled interval');
    return { input: ['independent 5/9', 'ending and ordinary return in same session', 'reopen with clock advanced by 24h+1ms', 'ending', 'click actual due entry', 'independent 5/9'], schedule, ordinary, afterDueReload, close, recall, lastAttempt: after.attempts.at(-1), nextReview: after.review };
  });
  for (const p of live) { transcript.errors.push(...p.errors); p.dom.window.close(); }
  fs.writeFileSync(path.join(__dirname, 'game-html-run-01-focused-transcript.json'), JSON.stringify(transcript, null, 2) + '\n');
  console.log(JSON.stringify({ cases: transcript.cases.map(({ name, probeStatus, finding, error }) => ({ name, probeStatus, finding, error })), unhandledErrors: transcript.errors }, null, 2));
  if (transcript.cases.some(c => c.probeStatus === 'failed') || transcript.errors.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
