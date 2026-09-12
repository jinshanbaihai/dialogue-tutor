'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM, VirtualConsole} = require('jsdom');
const installMathStyleShim = require('./helpers/math-style.cjs');

test('generated perimeter lesson links the route, complete reasoning, answers and question speech', {timeout: 10000}, async t => {
  const errors = [], spoken = [];
  const vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(fs.readFileSync(__dirname + '/../docs/rectangle-perimeter.html', 'utf8'), {
    url: 'https://example.test/perimeter', runScripts: 'dangerously', virtualConsole: vc,
    beforeParse(w) {
      w.HTMLElement.prototype.scrollIntoView = () => {};
      w.SpeechSynthesisUtterance = function (text) { this.text = text; };
      w.speechSynthesis = {getVoices: () => [{name: 'Test Mandarin', lang: 'zh-CN'}],
        speak: u => spoken.push(u), cancel() {}, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {}};
      installMathStyleShim(w);
    }
  });
  t.after(() => {dom.window.DialogueTutor?.instance?.destroy(); dom.window.close();});
  const w = dom.window, d = w.document;
  await new Promise(resolve => d.addEventListener('dt:ready', resolve, {once: true}));
  const api = w.DialogueTutor.instance;
  const box = id => d.querySelector('[data-dt-activity="' + id + '"]');
  const control = (id, name) => box(id).querySelector('[data-dt-control="' + name + '"]');
  const answer = (id, value) => {
    control(id, 'answer').value = value;
    control(id, 'answer').dispatchEvent(new w.Event('input', {bubbles: true}));
    control(id, 'submit').click();
  };
  assert.equal(d.querySelectorAll('.dt-speech').length, 5);
  const model = box('trace-boundary');
  for (let i = 0; i < 4; i++) model.querySelector('[data-next]').click();
  assert.equal(model.querySelectorAll('.traced').length, 4);
  assert.match(model.querySelector('[data-status]').textContent, /回到起点/);
  model.querySelector('[data-prev]').click(); assert.equal(model.querySelectorAll('.traced').length, 3);
  model.querySelector('[data-reset]').click(); assert.equal(api.getState().activities['trace-boundary'].exploration.edge, 0);
  const choose = id => {
    const radio = box('perimeter-choice').querySelector('input[value="' + id + '"]');
    radio.checked = true; radio.dispatchEvent(new w.Event('change', {bubbles: true}));
    control('perimeter-choice', 'submit').click();
  };
  choose('half'); assert.equal(api.getState().activities['perimeter-choice'].attempts[0].correct, false);
  assert.match(box('perimeter-choice').textContent, /只数了一条/);
  control('perimeter-choice', 'retry').click(); choose('all');
  assert.equal(api.getState().activities['perimeter-choice'].attempts[1].assisted, true);
  assert.equal(d.getElementById('original-solution').open, false);
  const before = JSON.stringify(api.getState());
  control('original-width', 'speech-play').click();
  assert.equal(spoken.at(-1).rate, 1.5); assert.doesNotMatch(spoken.at(-1).text, /4 cm/);
  assert.equal(JSON.stringify(api.getState()), before);
  answer('original-width', '4'); assert.equal(api.getState().activities['original-width'].attempts[0].correct, true);
  d.getElementById('original-solution').open = true;
  control('width-steps', 'speech-play').click(); assert.match(spoken.at(-1).text, /perimeter 数值等于/);
  assert.doesNotMatch(spoken.at(-1).text, /width 为 4 cm/);
  for (let i = 0; i < 11; i++) control('width-steps', 'step-next').click();
  assert.match(box('width-steps').querySelector('.dt-step-stage').textContent, /w=4/);
  control('width-steps', 'step-prev').click(); assert.match(box('width-steps').querySelector('.dt-step-stage').textContent, /4=w/);
  control('width-steps', 'step-view').click(); assert.equal(box('width-steps').querySelectorAll('.dt-step-stage').length, 12);
  answer('transfer-width', '5'); assert.equal(api.getState().activities['transfer-width'].attempts[0].correct, true);
  const exported = api.exportState(); api.importState(exported);
  assert.equal(api.getState().activities['original-width'].attempts[0].answer, '4');
  assert.deepEqual(errors, []);
});
