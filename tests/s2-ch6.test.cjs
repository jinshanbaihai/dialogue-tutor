'use strict';
// Archived 1.7.0 run-03 compatibility regressions; not validation of the current course.
// They execute the assembled course; jsdom provides no visual-rendering evidence.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM, VirtualConsole} = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '../docs/engineering/v1.7.0/runs/run-03/lesson.html'), 'utf8');
const oracle = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/engineering/v1.7.0/reviews/run-03-math-oracle.json'), 'utf8'));
const NOW = Date.UTC(2026, 8, 8, 12), DAY = 86400000;
const copy = value => JSON.parse(JSON.stringify(value));
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const fraction = value => { const [n, d = '1'] = value.split('/'); return Number(n) / Number(d); };

async function page(t, {stored, time = NOW} = {}) {
  const errors = [], virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  let clock = time;
  const dom = new JSDOM(html, {url: 'https://s2-course.test/lesson.html', runScripts: 'dangerously', virtualConsole,
    beforeParse(win) {
      const NativeDate = win.Date;
      win.Date = class extends NativeDate {
        constructor(...args) { super(...(args.length ? args : [clock])); }
        static now() { return clock; }
      };
      win.HTMLElement.prototype.scrollIntoView = function () {};
      if (stored) Object.entries(stored).forEach(([key, value]) => win.localStorage.setItem(key, value));
    }});
  const win = dom.window, doc = win.document;
  if (doc.readyState === 'loading') await new Promise(resolve => doc.addEventListener('DOMContentLoaded', resolve, {once: true}));
  await tick();
  const api = win.DialogueTutor.instance;
  assert(api);
  t.after(() => {win.close(); assert.deepEqual(errors, []);});
  const q = selector => { const node = doc.querySelector(selector); assert(node, selector); return node; };
  const p = {win, doc, api, q,
    state: (id = 'sample-lab') => copy(api.getState().activities[id]),
    navigate(id) { api.navigate(id); assert.equal(api.getState().currentActivity, id); },
    click(selector) { const node = q(selector); assert(!node.disabled); clock++; node.click(); },
    change(selector, value, event = 'change') {
      const node = q(selector); assert(!node.disabled); clock++; node.value = value;
      if (node.type === 'radio') node.checked = true;
      node.dispatchEvent(new win.Event(event, {bubbles: true}));
    },
    storage() { return Object.fromEntries(Array.from({length: win.localStorage.length}, (_, i) => win.localStorage.key(i)).map(key => [key, win.localStorage.getItem(key)])); }
  };
  return p;
}
const box = (id, control) => `#dt-activity-${id} [data-dt-control="${control}"]`;
const lab = p => p.state().exploration;
const metrics = state => Object.fromEntries(['attempts', 'explorationCount', 'participated', 'lastInteractionAt', 'review'].map(key => [key, state[key]]));
function freeze(p, answer) { p.change(`input[name="r3-prediction"][value="${answer}"]`, answer); p.click('#r3-freeze'); }
function submit(p, id, answer) { p.navigate(id); p.change(box(id, 'answer'), answer, 'input'); p.click(box(id, 'submit')); }

test('S2 exact distributions, displayed probabilities and comparison agree for all 12 conditions', async t => {
  const p = await page(t); p.navigate('sample-lab');
  for (const expected of oracle.laboratory) {
    p.change('#r3-n', String(expected.n));
    p.change('#r3-mechanism', expected.replacement ? 'with' : 'without');
    p.change('#r3-threshold', String(expected.threshold)); p.click('#r3-direct');
    const rows = [...p.q('#r3-path-table').querySelectorAll('tbody tr')];
    const bars = [...p.q('#r3-distribution').children];
    assert.equal(rows.length, expected.distribution.length); assert.equal(bars.length, rows.length);
    expected.distribution.forEach((value, index) => {
      assert.equal(Number(rows[index].children[0].textContent), fraction(value.value));
      assert.equal(fraction(rows[index].children[2].textContent.split(' = ')[1]), fraction(value.probability));
      assert.equal(fraction(bars[index].children[2].textContent), fraction(value.probability));
      assert(Math.abs(parseFloat(bars[index].querySelector('.r3-bar').style.width) / 100 - fraction(value.probability)) < 1e-12);
    });
    const comparison = p.q('#r3-comparison').textContent;
    assert(comparison.includes(`P(样本均值≥${expected.threshold})=${expected.event}`));
    assert(comparison.includes({less: '小于', equal: '等于', greater: '大于'}[expected.relation] + '单卡概率'));
  }
});

test('S2 older imports persist reference and result contacts without inventing actions or changing frozen predictions', async t => {
  const p = await page(t); p.navigate('sample-lab');
  const blank = p.api.exportState(), before = metrics(p.state());
  p.q('#dt-explanation-lab').open = true; await tick();
  p.q('#dt-explanation-lab').open = false; await tick();
  p.api.importState(blank);
  assert(p.api.exportState().state.activities['sample-lab'].exploration.referenceViewed);
  assert.deepEqual(metrics(p.state()), before);
  const restored = await page(t, {stored: p.storage()}); restored.navigate('sample-lab');
  assert.deepEqual(metrics(restored.state()), before); freeze(restored, 'greater');
  assert(lab(restored).predictionHadReference);

  const r = await page(t); r.navigate('sample-lab'); const old = r.api.exportState();
  freeze(r, 'less'); const original = lab(r);
  r.q('#dt-explanation-lab').open = true; r.click('#r3-reveal');
  assert.equal(lab(r).predictionAt, original.predictionAt); assert(!lab(r).predictionHadReference);
  r.api.importState(old);
  const merged = r.api.exportState().state.activities['sample-lab'].exploration;
  assert(merged.resultContacts.length > 0);
  assert(merged.history.some(item => item.roundId === original.roundId && item.prediction === 'less' && !item.predictionHadReference));
  assert.deepEqual(metrics(r.state()), metrics(copy(old.state.activities['sample-lab'])));
  const again = await page(t, {stored: r.storage()}); again.navigate('sample-lab'); freeze(again, 'greater');
  assert(lab(again).predictionHadResult); assert(lab(again).predictionHadReference);
});

test('S2 actual recommendation buttons distinguish wrong, assisted, independent and skipped responses', async t => {
  for (const [kind, target] of [['wrong', 'worked-distribution'], ['assisted', 'distribution-independent'], ['independent', 'distribution-probability'], ['skipped', 'worked-distribution']]) {
    const p = await page(t); p.navigate('distribution-completion');
    if (kind === 'skipped') p.click(box('distribution-completion', 'skip'));
    else {
      if (kind === 'assisted') p.click(box('distribution-completion', 'hint'));
      submit(p, 'distribution-completion', kind === 'wrong' ? '1/9' : '1/3');
    }
    const recommendation = p.api.getRecommendations('distribution-completion')[0];
    assert.equal(recommendation.to, target);
    const button = [...p.q('#dt-activity-distribution-completion').querySelectorAll('button')].find(node => node.textContent.includes(recommendation.label));
    assert(button); button.click(); assert.equal(p.api.getState().currentActivity, target);
    const attempts = p.state('distribution-completion').attempts;
    if (kind === 'skipped') assert.equal(attempts.length, 0);
    else { assert.equal(attempts[0].assisted, kind === 'assisted'); assert.equal(attempts[0].correct, kind !== 'wrong'); }
  }
});

test('S2 closing review preserves a draft, opens a real due session and keeps early practice distinct', async t => {
  const p = await page(t); p.navigate('evidence-close'); p.click('#r3-review');
  p.change(box('distribution-probability', 'answer'), '4/', 'input');
  p.navigate('evidence-close'); assert(p.q('#r3-review').textContent.includes('继续未完成')); p.click('#r3-review');
  assert.equal(p.state('distribution-probability').draft, '4/');
  submit(p, 'distribution-probability', '4/9'); const stored = p.storage();
  p.navigate('evidence-close'); assert(p.q('#r3-review').textContent.includes('提前练习')); p.click('#r3-review');
  assert.equal(p.state('distribution-probability').draft, '');
  submit(p, 'distribution-probability', '4/9');
  assert(p.state('distribution-probability').attempts[1].assisted);
  assert.equal(p.state('distribution-probability').review.intervalIndex, 0);
  const due = await page(t, {stored, time: NOW + 7 * DAY}); due.navigate('evidence-close');
  assert(due.q('#r3-review').textContent.includes('到期回顾')); due.click('#r3-review');
  assert.equal(due.state('distribution-probability').draft, '');
  assert(!due.state('distribution-probability').answerRevealed);
  submit(due, 'distribution-probability', '4/9');
  assert(!due.state('distribution-probability').attempts[1].assisted);
  assert.equal(due.state('distribution-probability').review.intervalIndex, 1);
});
