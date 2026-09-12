'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {JSDOM} = require('jsdom');
const runtime = require('../plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js');
const fixture = require('../plugins/dialogue-tutor/skills/dialogue-tutor/examples/s2-interactive.json');
const xiaoxiao = {name: 'Microsoft Xiaoxiao Online (Natural)', lang: 'zh-CN'};
const fallback = {name: 'System Mandarin', lang: 'zh-CN'};

function page(t, {voices = [fallback, xiaoxiao], supported = true, source, fastTimeout = false, stepHtml} = {}) {
  const lesson = JSON.parse(JSON.stringify(fixture));
  if (source) lesson.activities[0].source = source;
  const steps = lesson.activities.find(a => a.type === 'steps');
  steps.steps[0].bodyHtml = stepHtml || '<p>VISIBLE_STEP</p><p hidden>HIDDEN_SECRET</p>';
  steps.steps[1].bodyHtml = '<p>FUTURE_SECRET</p>';
  const dom = new JSDOM('<main><div data-dt-study></div>' + lesson.activities.map(a => '<div data-dt-activity="' + a.id + '"></div>').join('') + '</main>', {url: 'https://example.test'});
  const win = dom.window;
  win.HTMLElement.prototype.scrollIntoView = function () {};
  // jsdom 26 cannot compute MathML styles. Use an HTML style host only for
  // that API; the runtime still traverses actual MathML nodes and attributes.
  const computedStyle = win.getComputedStyle.bind(win);
  win.getComputedStyle = node => {
    if (node.namespaceURI === 'http://www.w3.org/1998/Math/MathML') {
      const styleHost = win.document.createElement('span'); styleHost.setAttribute('style', node.getAttribute('style') || '');
      return computedStyle(styleHost);
    }
    return computedStyle(node);
  };
  if (fastTimeout) { const timeout = win.setTimeout.bind(win); win.setTimeout = (fn, ms) => timeout(fn, ms === 2500 ? 5 : ms); }
  const synth = new win.EventTarget();
  Object.assign(synth, {voices, spoken: [], started: [], queue: [], current: null, paused: false,
    cancellations: 0, pauses: 0, resumes: 0, resumedQueues: [],
    getVoices() { return this.voices; },
    startNext() { if (!this.paused && !this.current && this.queue.length) { this.current = this.queue.shift(); this.started.push(this.current); } },
    speak(utterance) { this.spoken.push(utterance); this.queue.push(utterance); this.startNext(); },
    // Web Speech API: cancel and speak both preserve the global paused state.
    cancel() { this.cancellations++; this.queue = []; this.current = null; },
    pause() { this.pauses++; this.paused = true; },
    resume() { this.resumes++; this.resumedQueues.push([this.current, ...this.queue].filter(Boolean)); this.paused = false; this.startNext(); }});
  if (supported) {
    win.speechSynthesis = synth;
    win.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  }
  const api = runtime.mount(lesson, win.document, {sessionId: 'speech-test'});
  t.after(() => { api.destroy(); dom.window.close(); });
  const box = id => win.document.querySelector('[data-dt-activity="' + id + '"]');
  const control = (id, name) => box(id).querySelector('[data-dt-control="' + name + '"]');
  return {win, lesson, synth, api, box, control, click: (id, name) => control(id, name).click()};
}

test('every activity has controls; read/pause/resume/stop uses real Xiaoxiao at 1.5x without learning evidence', t => {
  const p = page(t), quiz = p.lesson.activities.find(a => a.format === 'choice');
  assert.equal(p.win.document.querySelectorAll('.dt-speech').length, p.lesson.activities.length);
  const before = p.api.getState();
  p.click(quiz.id, 'speech-play');
  const utterance = p.synth.spoken[0];
  assert.equal(utterance.voice, xiaoxiao); assert.equal(utterance.rate, 1.5); assert.equal(utterance.lang, 'zh-CN');
  assert.equal(utterance.text, [quiz.prompt, ...quiz.choices.map((c, i) => (i + 1) + '. ' + c.text)].join('\n\n'));
  assert.ok(!utterance.text.includes(quiz.explanation));
  p.click(quiz.id, 'speech-pause'); assert.equal(p.synth.pauses, 1);
  assert.match(p.control(quiz.id, 'speech-play').textContent, /继续/);
  p.click(quiz.id, 'speech-play'); assert.equal(p.synth.resumes, 1); assert.equal(p.synth.spoken.length, 1);
  p.click(quiz.id, 'speech-stop'); assert.equal(p.synth.cancellations, 1);
  assert.deepEqual(p.api.getState(), before);
});

test('voiceschanged resolves delayed voices; stopping a pending request prevents surprise playback', t => {
  const p = page(t, {voices: []}), id = p.lesson.activities[0].id;
  p.click(id, 'speech-play'); assert.equal(p.synth.spoken.length, 0);
  assert.match(p.box(id).querySelector('.dt-speech-status').textContent, /等待/);
  p.synth.voices = [xiaoxiao]; p.synth.dispatchEvent(new p.win.Event('voiceschanged'));
  assert.equal(p.synth.spoken.length, 1); assert.equal(p.synth.spoken[0].voice, xiaoxiao);
  p.click(id, 'speech-stop');
  p.synth.voices = []; p.synth.dispatchEvent(new p.win.Event('voiceschanged'));
  p.click(id, 'speech-play'); p.click(id, 'speech-stop');
  p.synth.voices = [xiaoxiao]; p.synth.dispatchEvent(new p.win.Event('voiceschanged'));
  assert.equal(p.synth.spoken.length, 1);
});

test('reading after pause then stop clears the engine pause before a fresh utterance starts', t => {
  const p = page(t), id = p.lesson.activities[0].id;
  p.click(id, 'speech-play'); const old = p.synth.current;
  p.click(id, 'speech-pause'); assert.equal(p.synth.paused, true);
  p.click(id, 'speech-stop');
  assert.equal(p.synth.paused, true, 'cancel preserves the engine pause');
  assert.equal(p.synth.current, null);
  p.click(id, 'speech-play');
  assert.equal(p.synth.paused, false);
  assert.equal(p.synth.current, p.synth.spoken.at(-1));
  assert.notEqual(p.synth.current, old);
  assert.deepEqual(p.synth.started, p.synth.spoken, 'both utterances actually start, rather than only entering a paused queue');
  assert.deepEqual(p.synth.resumedQueues.at(-1), [], 'resume cannot revive any canceled content');
});

test('switching activities while paused starts only the new activity and never resumes the old queue', t => {
  const p = page(t), first = p.lesson.activities[0].id, next = p.lesson.activities[1].id;
  p.click(first, 'speech-play'); const old = p.synth.current;
  p.click(first, 'speech-pause'); p.click(next, 'speech-play');
  assert.equal(p.synth.paused, false);
  assert.equal(p.synth.current, p.synth.spoken.at(-1));
  assert.notEqual(p.synth.current, old);
  assert.deepEqual(p.synth.resumedQueues.at(-1), []);
  assert.equal(p.synth.queue.length, 0);
  assert.equal(p.synth.started.length, 2);
  assert.equal(p.control(first, 'speech-pause').disabled, true);
  assert.equal(p.control(next, 'speech-pause').disabled, false);
});

test('missing voices and unsupported browsers are reported honestly; late voices recover after timeout', async t => {
  const p = page(t, {voices: [], fastTimeout: true}), id = p.lesson.activities[0].id;
  p.click(id, 'speech-play'); await new Promise(resolve => setTimeout(resolve, 15));
  assert.match(p.box(id).querySelector('.dt-speech-status').textContent, /没有可用/);
  assert.equal(p.synth.spoken.length, 0); assert.equal(p.control(id, 'speech-play').disabled, false);
  p.synth.voices = [fallback]; p.synth.dispatchEvent(new p.win.Event('voiceschanged'));
  p.click(id, 'speech-play'); assert.equal(p.synth.spoken[0].voice, fallback);
  assert.match(p.box(id).querySelector('.dt-speech-status').textContent, /未使用 zh-CN Xiaoxiao.*System Mandarin/);
  p.synth.voices = [fallback, xiaoxiao]; p.synth.dispatchEvent(new p.win.Event('voiceschanged'));
  assert.match(p.box(id).querySelector('.dt-speech-status').textContent, /实际语音：System Mandarin/, 'voice loading does not rename an utterance already in flight');
  const unavailable = page(t, {supported: false});
  assert.equal(unavailable.control(id, 'speech-play').disabled, true);
  assert.match(unavailable.box(id).querySelector('.dt-speech-status').textContent, /不支持/);
});

test('live rate changes restart at the selected speed and stale callbacks cannot overwrite new playback', t => {
  const p = page(t), id = p.lesson.activities[0].id;
  p.click(id, 'speech-play'); const old = p.synth.spoken[0];
  const rate = p.control(id, 'speech-rate'); rate.value = '2'; rate.dispatchEvent(new p.win.Event('change'));
  assert.equal(p.synth.cancellations, 1); assert.equal(p.synth.spoken[1].rate, 2);
  old.onend(); old.onerror({error: 'canceled'});
  assert.equal(p.control(id, 'speech-pause').disabled, false);
  assert.match(p.box(id).querySelector('.dt-speech-status').textContent, /新语速/);
  p.synth.spoken[1].onerror({error: 'network'});
  assert.match(p.box(id).querySelector('.dt-speech-status').textContent, /失败.*network/);
  assert.equal(p.control(id, 'speech-play').disabled, false);
});

test('card/step changes, retry, activity navigation and import cancel speech with answer isolation', t => {
  const p = page(t), card = p.lesson.activities.find(a => a.type === 'flashcards');
  const steps = p.lesson.activities.find(a => a.type === 'steps');
  const quiz = p.lesson.activities.find(a => a.format === 'numeric');
  p.click(card.id, 'speech-play');
  assert.equal(p.synth.spoken.at(-1).text, card.prompt + '\n\n' + card.cards[0].front);
  p.click(card.id, 'flash-flip'); assert.equal(p.synth.cancellations, 1);
  p.click(card.id, 'speech-play'); assert.ok(p.synth.spoken.at(-1).text.includes(card.cards[0].back));
  p.click(card.id, 'flash-next'); assert.equal(p.synth.cancellations, 2);
  p.click(steps.id, 'speech-play');
  assert.match(p.synth.spoken.at(-1).text, /VISIBLE_STEP/);
  assert.doesNotMatch(p.synth.spoken.at(-1).text, /HIDDEN_SECRET|FUTURE_SECRET/);
  p.click(steps.id, 'step-next'); assert.equal(p.synth.cancellations, 3);
  p.click(steps.id, 'speech-play'); assert.match(p.synth.spoken.at(-1).text, /FUTURE_SECRET/);
  p.control(quiz.id, 'speech-play').focus(); assert.equal(p.synth.cancellations, 4);
  p.click(quiz.id, 'reveal'); p.click(quiz.id, 'speech-play');
  assert.equal(p.synth.spoken.at(-1).text, quiz.prompt);
  p.click(quiz.id, 'retry'); assert.equal(p.synth.cancellations, 5);
  p.click(quiz.id, 'speech-play'); p.api.importState(p.api.exportState());
  assert.equal(p.synth.cancellations, 6);
});

test('provider source renders its true attribution while legacy source remains accepted', t => {
  const p = page(t, {source: {provider: 'Brilliant', url: 'https://brilliant.org/courses/', mechanism: 'Guided reasoning'}});
  const source = p.box(p.lesson.activities[0].id).querySelector('.dt-source');
  assert.match(source.textContent, /Brilliant.*https:\/\/brilliant.org\/courses\/.*Guided reasoning/s);
  assert.doesNotMatch(source.textContent, /DeepTutor/);
  const invalid = JSON.parse(JSON.stringify(p.lesson)); invalid.activities[0].source.url = 'javascript:alert(1)';
  assert.throws(() => runtime.validateLesson(invalid), /HTTPS/);
  assert.doesNotThrow(() => runtime.validateLesson(fixture));
});

test('visible MathML uses its complete fraction/exponent aria-label and excludes hidden formula labels', t => {
  const p = page(t, {stepHtml: '<p>分数 <math aria-label="二分之一"><mfrac><mn>1</mn><mn>2</mn></mfrac></math></p>' +
    '<p>指数 <math aria-label="三的四次方"><msup><mn>3</mn><mn>4</mn></msup></math></p>' +
    '<math hidden aria-label="HIDDEN_ATTRIBUTE_SECRET"><mn>91</mn></math>' +
    '<math aria-hidden="true" aria-label="ARIA_HIDDEN_SECRET"><mn>92</mn></math>' +
    '<math style="display:none" aria-label="DISPLAY_NONE_SECRET"><mn>93</mn></math>' +
    '<math style="visibility:hidden" aria-label="VISIBILITY_HIDDEN_SECRET"><mn>94</mn></math>' +
    '<div hidden><math aria-label="HIDDEN_PARENT_SECRET"><mn>95</mn></math></div>' +
    '<details><summary>关闭的参考</summary><math aria-label="CLOSED_REFERENCE_SECRET"><mn>96</mn></math></details>'});
  const steps = p.lesson.activities.find(a => a.type === 'steps');
  p.click(steps.id, 'speech-play');
  const text = p.synth.spoken.at(-1).text;
  assert.match(text, /分数\s+二分之一/); assert.match(text, /指数\s+三的四次方/);
  assert.doesNotMatch(text, /1\s+2|3\s+4|SECRET|9[1-6]/);
});
