'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const { JSDOM, VirtualConsole } = require(path.join(root, 'repo/node_modules/jsdom'));
const html = fs.readFileSync(path.join(root, 'generation/run-01/lesson.html'), 'utf8');
const lesson = JSON.parse(fs.readFileSync(path.join(root, 'generation/run-01/lesson.json'), 'utf8'));
const math = JSON.parse(fs.readFileSync(path.join(__dirname, 'education-html-run01-math.json'), 'utf8'));
const NOW = 1788739200000;
const plain = value => JSON.parse(JSON.stringify(value));
const observations = [];
async function page(envelope, time = NOW) {
  const errors = [], vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(html, {
    url: 'https://example.test/education-extra-run01', runScripts: 'dangerously', virtualConsole: vc,
    beforeParse(win) {
      win.Date.now = () => time;
      win.HTMLElement.prototype.scrollIntoView = function () {};
      if (envelope) win.localStorage.setItem('dialoguetutor:v1:' + encodeURIComponent(lesson.lessonId) + ':' + encodeURIComponent(lesson.revision), JSON.stringify(envelope));
    }
  });
  const win = dom.window, doc = win.document;
  await new Promise(resolve => doc.addEventListener('dt:ready', resolve, { once: true }));
  const api = win.DialogueTutor.instance;
  const q = selector => doc.querySelector(selector);
  const control = (id, name) => q('[data-dt-activity="' + id + '"] [data-dt-control="' + name + '"]');
  return {
    api, win, doc, q, control,
    state: id => plain(api.getState().activities[id]),
    click(selector) { const node = q(selector); assert.ok(node, selector); node.click(); },
    change(selector, value) { const node = q(selector); assert.ok(node, selector); node.value = value; node.dispatchEvent(new win.Event('change', { bubbles: true })); },
    finish() { assert.deepEqual(errors, []); dom.window.close(); }
  };
}
function note(name, input, observation) { observations.push({ name, input, observation }); }
(async function () {
  for (const expected of math.cases.filter(item => item.id.startsWith('lab-'))) {
    const p = await page();
    p.change('[data-lab-n]', String(expected.n));
    p.change('[data-lab-replacement]', expected.replacement ? 'yes' : 'no');
    p.change('[data-lab-prediction]', expected.n === 1 ? 'equal' : 'centre');
    p.click('[data-lab-freeze]');
    p.click('[data-lab-reveal]');
    const rows = [...p.q('[data-lab-table]').rows].map(row => [...row.cells].slice(0, 3).map(cell => cell.textContent));
    assert.deepEqual(rows, expected.rows);
    assert.equal(p.q('[data-lab-path]').options.length, expected.orderedPaths);
    note('all-live-distributions-' + expected.id,
      { activityId: 'sampling-lab', n: expected.n, replacement: expected.replacement },
      { rows, orderedPaths: p.q('[data-lab-path]').options.length, comparison: p.q('[data-lab-comparison]').textContent });
    p.finish();
  }

  const repeated = await page();
  repeated.click('[data-lab-skip]');
  repeated.click('[data-lab-reset]');
  repeated.change('[data-lab-prediction]', 'centre');
  repeated.click('[data-lab-freeze]');
  repeated.click('[data-lab-reveal]');
  note('repeat-known-conditions-after-observation',
    { activityId: 'sampling-lab', sequence: ['direct observation', 'new round without changing n=2/replacement', 'centre', 'freeze', 'reveal'] },
    { current: repeated.state('sampling-lab').exploration, comparison: repeated.q('[data-lab-comparison]').textContent, referenceText: repeated.q('[data-lab-reference]').textContent });
  repeated.finish();

  const input = await page();
  input.api.navigate('mean-independent');
  input.control('mean-independent', 'answer').value = '5/9';
  input.control('mean-independent', 'answer').dispatchEvent(new input.win.Event('input', { bubbles: true }));
  input.control('mean-independent', 'submit').click();
  const envelope = input.api.exportState();
  const originalReview = input.state('mean-independent').review;
  input.finish();
  for (const mode of ['ordinary', 'early', 'late-seven-days']) {
    const time = mode === 'late-seven-days' ? NOW + 7 * 86400000 + 1 : NOW + 1000;
    const p = await page(envelope, time);
    p.api.navigate('evidence-close');
    const label = p.q('[data-close-review]').textContent;
    if (mode === 'ordinary') p.click('[data-close-independent]');
    else p.click('[data-close-review]');
    const before = p.state('mean-independent');
    if (mode !== 'ordinary') {
      assert.equal(before.answerRevealed, false);
      assert.equal(before.draft, '');
      p.control('mean-independent', 'answer').value = '5/9';
      p.control('mean-independent', 'answer').dispatchEvent(new p.win.Event('input', { bubbles: true }));
      p.control('mean-independent', 'submit').click();
    }
    const after = p.state('mean-independent');
    assert.equal(after.attempts.length, mode === 'ordinary' ? 1 : 2);
    assert.equal(after.review.intervalIndex, mode === 'late-seven-days' ? 1 : 0);
    if (mode !== 'ordinary') assert.equal(after.attempts[1].assisted, mode === 'early');
    note('review-' + mode,
      { activityId: 'mean-independent', entry: mode === 'ordinary' ? 'data-close-independent' : 'data-close-review', controlledTime: time },
      { label, before: { status: before.status, draft: before.draft, answerRevealed: before.answerRevealed, attempts: before.attempts.length }, originalReview, after: { review: after.review, attempts: after.attempts } });
    p.finish();
  }
  fs.writeFileSync(path.join(__dirname, 'education-html-run01-extra-log.json'), JSON.stringify({ artifact: lesson.lessonId, revision: lesson.revision, method: 'Fresh jsdom instances; exact independent Fraction enumeration read from separate Python output; controlled timestamps; no browser rendering or learner outcome claim', observations }, null, 2) + '\n');
  console.log(JSON.stringify({ observations: observations.length, allSixLiveTablesMatchIndependentEnumeration: true, log: 'reviews/education-html-run01-extra-log.json', reviews: observations.filter(item => item.name.startsWith('review-')).map(item => ({ name: item.name, ...item.observation })) }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
