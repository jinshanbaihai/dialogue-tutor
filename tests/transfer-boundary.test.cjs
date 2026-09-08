'use strict';
// Real runtime/DOM control paths; jsdom does not certify browser layout/media.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {JSDOM, VirtualConsole} = require('jsdom');
const runtime = require('../plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js');
const NOW = 1800000000000, tick = () => new Promise(resolve => setTimeout(resolve, 0));
const plain = x => JSON.parse(JSON.stringify(x));
async function page(t, {due = false, stored, blockedStorage = false} = {}) {
  const lesson = {schemaVersion: 1, lessonId: 'transfer-contract', revision: 'one', title: 'Transfer', language: 'en',
    objectives: [{id: 'reason', title: 'Reason'}], activities: [
      {id: 'quiz', objectiveId: 'reason', type: 'quiz', format: 'choice', title: 'Choose', prompt: 'Choose',
        source: 'fixture', choices: [{id: 'a', text: 'A'}, {id: 'b', text: 'B'}], answer: 'a', explanation: 'A', ...(due ? {solutionId: 'reference'} : {})},
      ...['first', 'second'].map(id => ({id, objectiveId: 'reason', type: 'interactive', title: id, prompt: 'Explore', source: 'fixture', bodyHtml: '<button type="button">Explore</button>'}))]};
  const errors = [], downloads = [], vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM('<!doctype html><details id="reference"><summary>Reference</summary><p>Answer</p></details>' + lesson.activities.map(a => `<div data-dt-activity="${a.id}"></div>`).join('') + '<div data-dt-study></div>', {url: 'https://example.test/transfer', virtualConsole: vc});
  const win = dom.window, doc = win.document; let blob;
  win.HTMLElement.prototype.scrollIntoView = function () {};
  win.URL.createObjectURL = value => { blob = value; return 'blob:progress'; };
  win.URL.revokeObjectURL = () => {};
  win.HTMLAnchorElement.prototype.click = function () { if (this.download) downloads.push(blob); };
  if (stored) win.localStorage.setItem(runtime.storageKey(lesson), stored);
  const api = runtime.mount(lesson, doc, {now: () => NOW, sessionId: 'current', ...(blockedStorage ? {storage: null} : {})});
  await tick();
  t.after(() => { win.close(); assert.deepEqual(errors, [], 'no unhandled runtime errors'); });
  return {lesson, win, doc, api, downloads, reference: doc.getElementById('reference'), saved: () => win.localStorage.getItem(api.storageKey), open: () => doc.querySelector('#reference > summary').click()};
}
function fileImport(p, text, {size = text.length, readError} = {}) {
  const upload = p.doc.querySelector('[data-dt-study] input[type=file]');
  const file = new p.win.File([text], 'progress.json', {type: 'application/json'});
  // jsdom lacks File.text; the actual input change handler still reads this File.
  Object.defineProperty(file, 'text', {value: async () => { if (readError) throw readError; return text; }});
  if (size !== text.length) Object.defineProperty(file, 'size', {value: size});
  Object.defineProperty(upload, 'files', {value: [file], configurable: true});
  upload.dispatchEvent(new p.win.Event('change', {bubbles: true}));
}
const transferImport = async (p, source, data) => {
  if (source === 'api') return p.api.importState(data);
  fileImport(p, typeof data === 'string' ? data : JSON.stringify(data)); await tick();
};
async function blobText(p, blob) { return new Promise((resolve, reject) => { const r = new p.win.FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsText(blob); }); }
function component(p, id, order = []) {
  let local = {componentId: id, stateVersion: 1, dataHash: 'data-one', draft: 'trusted', contacts: [], submissions: [{id: id + '-first', assistedAtSubmit: false, answer: 'original'}]};
  p.api.restoreExploration(id, local);
  const capture = () => {
    if (p.reference.open && !local.contacts.length) { local.contacts.push({id: 'reference', time: NOW}); p.api.restoreExploration(id, local); }
  };
  p.api.beforeImport(ctx => {
    order.push('before-' + id); capture();
    if (!ctx.incomingState) return;
    const incoming = ctx.incomingState.activities[id].exploration;
    if (incoming.componentId !== id || incoming.stateVersion !== 1 || incoming.dataHash !== 'data-one') throw new Error(id + ': invalid component identity');
  });
  p.api.beforeExport(() => { order.push('export-' + id); capture(); });
  p.doc.addEventListener('dt:restore', e => {
    if (e.detail.activityId !== id) return;
    order.push('restore-' + id);
    const incoming = plain(e.detail.state);
    for (const key of ['contacts', 'submissions']) incoming[key] = [...new Map([...incoming[key], ...local[key]].map(x => [x.id, x])).values()];
    local = incoming; p.api.restoreExploration(id, local);
  });
}
function noActions(before, after) {
  for (const id of ['first', 'second']) {
    const a = plain(before.activities[id]), b = plain(after.activities[id]); delete a.exploration; delete b.exploration;
    assert.deepEqual(b, a, 'no participation, attempts, count, note or timestamp changes');
  }
}
for (const source of ['api', 'file']) {
  test(`${source}: capture/validate precede state replacement, due closure and restore; merged state immediately persists`, async t => {
    const p = await page(t, {due: true}), order = []; component(p, 'first', order); component(p, 'second', order);
    const old = p.api.exportState(); order.length = 0; old.state.activities.first.exploration.draft = 'imported';
    let q = runtime.reduceActivity(p.lesson.activities[0], old.state.activities.quiz, {type: 'draft', value: 'a'}, NOW - 2 * runtime.DAY, 'old');
    old.state.activities.quiz = runtime.reduceActivity(p.lesson.activities[0], q, {type: 'submit'}, NOW - 2 * runtime.DAY, 'old');
    const before = p.api.getState(), body = p.doc.querySelector('[data-dt-activity="quiz"] .dt-activity-body'), node = body.firstChild;
    p.open();
    p.api.beforeImport(ctx => {
      order.push('validated'); assert.equal(ctx.source, source); assert.equal(ctx.validationError, null);
      assert.equal(p.reference.open, true); assert.strictEqual(body.firstChild, node);
      assert.equal(p.api.getState().activities.first.exploration.draft, 'trusted');
      assert.equal(ctx.currentState.activities.first.exploration.contacts.length, 1);
      ctx.incomingState.activities.first.exploration.draft = 'tamper'; ctx.currentState.activities.first.exploration.draft = 'tamper'; return true;
    });
    p.doc.addEventListener('dt:restore', () => assert.equal(p.reference.open, false));
    await transferImport(p, source, old);
    assert.deepEqual(order, ['before-first', 'before-second', 'validated', 'restore-first', 'restore-second']);
    const after = p.api.getState(); assert.equal(after.activities.first.exploration.draft, 'imported'); noActions(before, after);
    assert.deepEqual(after.activities.first.exploration.contacts, [{id: 'reference', time: NOW}]);
    assert.equal(after.activities.first.exploration.submissions[0].assistedAtSubmit, false);
    const serialized = p.saved(); assert.equal(JSON.parse(serialized).state.activities.second.exploration.contacts.length, 1);
    const reopened = await page(t, {stored: serialized}); assert.deepEqual(reopened.api.getState().activities.first.exploration, after.activities.first.exploration); noActions(after, reopened.api.getState());
  });
  for (const reject of ['cancel', 'throw']) test(`${source}: ${reject} preserves trusted state/storage and activity DOM`, async t => {
    const p = await page(t), before = p.api.getState(), storage = p.saved(), body = p.doc.querySelector('[data-dt-activity="quiz"] .dt-activity-body'), node = body.firstChild;
    let restores = 0, later = 0; p.doc.addEventListener('dt:restore', () => restores++);
    p.api.beforeImport(() => { if (reject === 'throw') throw new Error('invalid dataHash'); return false; }); p.api.beforeImport(() => { later++; });
    const incoming = p.api.exportState(); incoming.state.activities.quiz.draft = 'a';
    if (source === 'api') assert.throws(() => p.api.importState(incoming), /cancelled|dataHash/); else await transferImport(p, source, incoming);
    assert.deepEqual(p.api.getState(), before); assert.equal(p.saved(), storage); assert.strictEqual(body.firstChild, node); assert.equal(restores, 0); assert.equal(later, 1);
    assert.match(p.doc.querySelector('[data-dt-study]').textContent, /Import not applied:.*(cancelled|dataHash)/);
    assert.equal(p.doc.querySelector('.dt-study-panel').open, true);
  });
  test(`${source}: identity rejection preserves pending contact from every registered component`, async t => {
    const p = await page(t), order = []; component(p, 'first', order); component(p, 'second', order);
    const incoming = p.api.exportState(); incoming.state.activities.first.exploration.dataHash = 'alien'; incoming.state.activities.second.exploration.draft = 'untrusted';
    const before = p.api.getState(); order.length = 0; p.open();
    if (source === 'api') assert.throws(() => p.api.importState(incoming), /invalid component identity/); else await transferImport(p, source, incoming);
    assert.deepEqual(order, ['before-first', 'before-second']); const after = p.api.getState(); noActions(before, after);
    for (const id of ['first', 'second']) {
      assert.equal(after.activities[id].exploration.draft, 'trusted'); assert.equal(after.activities[id].exploration.dataHash, 'data-one');
      assert.deepEqual(after.activities[id].exploration.submissions, before.activities[id].exploration.submissions);
      assert.deepEqual(after.activities[id].exploration.contacts, [{id: 'reference', time: NOW}]);
    }
    assert.equal(p.reference.open, true); assert.deepEqual(JSON.parse(p.saved()).state, after);
  });
  test(`${source}: malformed JSON still captures current references before rejection`, async t => {
    const p = await page(t); component(p, 'first'); component(p, 'second'); let invalid; p.api.beforeImport(ctx => { invalid = ctx; }); p.open();
    if (source === 'api') assert.throws(() => p.api.importState('{broken'), /JSON|property/); else await transferImport(p, source, '{broken');
    assert.equal(invalid.incomingState, null); assert.equal(typeof invalid.validationError, 'string');
    assert.equal(p.api.getState().activities.first.exploration.contacts.length, 1); assert.equal(JSON.parse(p.saved()).state.activities.second.exploration.contacts.length, 1);
  });
  test(`${source}: export captures native summary synchronously and survives reopening`, async t => {
    const p = await page(t); component(p, 'first'); component(p, 'second'); const before = p.api.getState(); let observed; p.api.beforeExport(ctx => { observed = ctx; }); p.open();
    let output;
    if (source === 'api') output = p.api.exportState(); else { p.doc.querySelector('[data-dt-control="export"]').click(); assert.equal(p.downloads.length, 1); output = JSON.parse(await blobText(p, p.downloads[0])); }
    assert.equal(observed.source, source); for (const id of ['first', 'second']) assert.equal(output.state.activities[id].exploration.contacts.length, 1); noActions(before, output.state);
    const reopened = await page(t, {stored: JSON.stringify(output)}); assert.deepEqual(reopened.api.getState().activities.first.exploration, output.state.activities.first.exploration); noActions(before, reopened.api.getState());
  });
  test(`${source}: export cancellation/exception prevent incomplete downloads`, async t => {
    const p = await page(t); let later = 0; const cancel = p.api.beforeExport(() => false); p.api.beforeExport(() => { later++; });
    for (const error of [/cancelled/, /collector failed/]) {
      if (source === 'api') assert.throws(() => p.api.exportState(), error); else p.doc.querySelector('[data-dt-control="export"]').click();
      assert.equal(p.downloads.length, 0); assert.match(p.doc.querySelector('[data-dt-study]').textContent, /Export not completed:/); cancel();
      if (later === 1) p.api.beforeExport(() => { throw new Error('collector failed'); });
    }
    assert.equal(later, 2);
  });
}

test('invalid/async guards reject; unsubscribe and recursive transfer boundaries are enforced', async t => {
  const p = await page(t), incoming = p.api.exportState(), before = p.api.getState();
  for (const kind of ['Import', 'Export']) for (const make of [() => 0, () => 'yes', () => ({}), () => Promise.resolve(true), () => Promise.reject(new Error('async rejected'))]) {
    const off = p.api['before' + kind](make); assert.throws(() => kind === 'Import' ? p.api.importState(incoming) : p.api.exportState(), /synchronous|return undefined/); off(); off();
  }
  for (const nested of [() => p.api.importState(incoming), () => p.api.exportState(), () => p.api.navigate('quiz'), () => p.api.refresh()]) {
    const off = p.api.beforeImport(nested); assert.throws(() => p.api.importState(incoming), /already in progress|unavailable during transfer/); assert.deepEqual(p.api.getState(), before); off();
  }
  let called = 0; const fn = () => { called++; }; const off = p.api.beforeImport(fn); p.api.beforeImport(fn); off(); p.api.importState(incoming); assert.equal(called, 1);
  p.api.destroy(); p.api.importState(incoming); assert.equal(called, 1); assert.throws(() => p.api.beforeImport(null), /must be a function/);
});

test('unreadable and oversized file inputs still preserve pending contact', async t => {
  for (const options of [{size: 5000001}, {readError: new Error('file read failed')}]) {
    const p = await page(t); component(p, 'first'); p.open(); fileImport(p, '{}', options); await tick();
    assert.equal(JSON.parse(p.saved()).state.activities.first.exploration.contacts.length, 1); assert.match(p.doc.querySelector('[data-dt-study]').textContent, /Import not applied:/);
  }
});
test('storage failure keeps captured contact in public memory export without participation', async t => {
  const p = await page(t, {blockedStorage: true}); component(p, 'first'); p.open(); const output = p.api.exportState();
  assert.equal(output.state.activities.first.exploration.contacts.length, 1); assert.equal(output.state.activities.first.explorationCount, 0);
  assert.match(p.doc.querySelector('[data-dt-study]').textContent, /storage is unavailable/);
});
