'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const runtime = require('../plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js');
const lesson = {
  schemaVersion: 1, lessonId: 'speech-test', revision: '1', title: 'Read questions', language: 'zh-CN',
  objectives: [{id: 'goal', title: 'Recall', kind: 'concept'}],
  activities: [
    {id: 'quiz', objectiveId: 'goal', type: 'quiz', source: 'web/DeepTutor', title: 'Question', prompt: 'What is x?', speechText: 'x 的平方是多少？', format: 'choice', choices: [{id: 'a', text: 'x²', speechText: 'x 的平方', feedback: 'SECRET_FEEDBACK'}, {id: 'b', text: 'zero'}], answer: 'a', explanation: 'SECRET_EXPLANATION', modelAnswer: 'SECRET_MODEL', hint: 'SECRET_HINT', followups: [{question: 'More', answer: 'SECRET_FOLLOWUP'}]},
    {id: 'cards', objectiveId: 'goal', type: 'flashcards', source: 'web/DeepTutor', title: 'Cards', prompt: 'Recall', cards: [{front: 'First front', back: 'SECRET_BACK'}, {front: 'Second front', speechText: '第二张正面', back: 'SECRET_BACK_2'}]},
    {id: 'steps', objectiveId: 'goal', type: 'steps', source: 'web/DeepTutor', title: 'Derivation', prompt: 'Explore', steps: [{title: 'First', bodyHtml: '<p>x²</p><span hidden>HIDDEN</span>', speechText: 'x 的平方'}, {title: 'Second', bodyHtml: '<p>Then finish</p>'}]},
    {id: 'open', objectiveId: 'goal', type: 'quiz', source: 'web/DeepTutor', title: 'Open question', prompt: 'Explain why', format: 'open', modelAnswer: 'SECRET_OPEN', explanation: 'SECRET_OPEN_EXPLANATION', rubric: ['SECRET_RUBRIC']},
    {id: 'custom', objectiveId: 'goal', type: 'interactive', source: {name: 'Brilliant', url: 'https://blog.brilliant.org/solving-equations/', case: '独立改编的天平建构'}, title: 'Explore', prompt: 'Change a parameter', bodyHtml: '<p>SECRET_WIDGET_ANSWER</p>'}
  ],
  tts: {segments: [{id: 'feedback', kind: 'feedback', activityId: 'quiz', text: 'SECRET_TTS_FEEDBACK'}]}
};
const zh = {name: 'Chinese system', lang: 'zh-CN', voiceURI: 'zh'};
const xiao = {name: 'Microsoft Xiaoxiao Online (Natural)', lang: 'zh-CN', voiceURI: 'zh-CN-XiaoxiaoNeural'};
function page(t, initialVoices = [zh], supported = true, lessonData = lesson) {
  const dom = new JSDOM('<main><aside data-dt-study></aside>' + lessonData.activities.map(a => '<div data-dt-activity="' + a.id + '"></div>').join('') + '</main>', {url: 'https://example.test/'});
  const win = dom.window, doc = win.document;
  let voices = initialVoices;
  const events = new Map(), calls = {utterances: [], cancel: 0, pause: 0, resume: 0};
  const synth = {getVoices: () => voices, speak: u => calls.utterances.push(u), cancel: () => calls.cancel++, pause: () => calls.pause++, resume: () => calls.resume++, addEventListener: (k,v) => events.set(k,v), removeEventListener: k => events.delete(k)};
  if (supported) { win.speechSynthesis = synth; win.SpeechSynthesisUtterance = function (text) { this.text = text; }; }
  win.HTMLElement.prototype.scrollIntoView = function () {};
  const api = runtime.mount(lessonData, doc);
  const control = (id, name) => doc.querySelector('[data-dt-activity="' + id + '"] [data-dt-control="' + name + '"]');
  const click = (id, name) => control(id, name).click();
  t.after(() => {api.destroy(); dom.window.close();});
  return {win, doc, api, calls, events, control, click, last: () => calls.utterances.at(-1), setVoices(value) { voices = value; events.get('voiceschanged')(); }};
}
test('readers are available for every module; default rate and available Xiaoxiao are used', t => {
  const p = page(t, [zh, xiao]);
  assert.equal(p.doc.querySelectorAll('.dt-speech').length, lesson.activities.length);
  const attribution = p.doc.querySelector('[data-dt-activity="custom"] .dt-source');
  assert.match(attribution.querySelector('summary').textContent, /Brilliant/);
  assert.match(attribution.textContent, /https:\/\/blog.brilliant.org\/solving-equations\//);
  assert.match(attribution.textContent, /独立改编的天平建构/);
  assert.doesNotMatch(attribution.textContent, /DeepTutor/);
  p.click('quiz', 'speech-play');
  assert.equal(p.last().voice, xiao); assert.equal(p.last().rate, 1.5);
  assert.match(p.last().text, /x 的平方是多少/); assert.match(p.last().text, /选项 1: x 的平方/); assert.match(p.last().text, /zero/);
  assert.doesNotMatch(p.last().text, /SECRET/);
  assert.equal(p.api.getState().activities.quiz.attempts.length, 0);
});
test('question reading never includes answer fields, even after explicit reveal or card flip', t => {
  const p = page(t);
  for (const id of ['quiz', 'open', 'custom']) {p.click(id, 'speech-play'); assert.doesNotMatch(p.last().text, /SECRET/);}
  p.click('quiz', 'reveal'); p.click('quiz', 'speech-play'); assert.doesNotMatch(p.last().text, /SECRET/);
  p.click('cards', 'flash-flip'); p.click('cards', 'speech-play');
  assert.match(p.last().text, /First front/); assert.doesNotMatch(p.last().text, /SECRET_BACK/);
});
test('voice fallback is honest and asynchronously loaded voices update the controls', t => {
  const p = page(t, []);
  assert.match(p.doc.querySelector('.dt-speech-status').textContent, /系统默认.*未提供名称/);
  p.setVoices([zh]); p.click('quiz', 'speech-play');
  assert.equal(p.last().voice, zh); assert.match(p.doc.querySelector('.dt-speech-status').textContent, /Chinese system.*未提供 Xiaoxiao/);
  p.setVoices([zh, xiao]); assert.equal(p.calls.cancel, 1);
  p.click('quiz', 'speech-play'); assert.equal(p.last().voice, xiao);
  const voice = p.control('quiz', 'speech-voice'); voice.value = 'zh'; voice.dispatchEvent(new p.win.Event('change'));
  p.click('quiz', 'speech-play'); assert.equal(p.last().voice, zh);
  assert.match(p.doc.querySelector('.dt-speech-status').textContent, /已选择其他声音/);
  assert.doesNotMatch(p.doc.querySelector('.dt-speech-status').textContent, /未提供 Xiaoxiao/);
  p.setVoices([zh, xiao]); p.click('quiz', 'speech-play'); assert.equal(p.last().voice, zh, 'manual voice choice survives voiceschanged');
});
test('pause, resume, stop, replay and speed changes control the active utterance', t => {
  const p = page(t);
  p.click('quiz', 'speech-play'); p.click('quiz', 'speech-play'); assert.equal(p.calls.pause, 1);
  p.click('quiz', 'speech-play'); assert.equal(p.calls.resume, 1);
  const old = p.last();
  const speed = p.control('quiz', 'speech-rate'); speed.value = '1.75'; speed.dispatchEvent(new p.win.Event('change'));
  assert.equal(p.calls.cancel, 1); p.click('quiz', 'speech-replay'); assert.equal(p.last().rate, 1.75);
  old.onend(); assert.equal(p.control('quiz', 'speech-stop').disabled, false, 'stale events cannot stop new speech');
  p.click('quiz', 'speech-play');
  const resumes = p.calls.resume;
  p.click('quiz', 'speech-replay');
  assert.equal(p.calls.resume, resumes + 1, 'replay clears a browser pause retained after cancellation');
  p.click('quiz', 'speech-stop'); assert.equal(p.control('quiz', 'speech-stop').disabled, true);
});
test('card, stage, module, review navigation and page exit stop previous speech', t => {
  const p = page(t);
  const stops = action => {const before = p.calls.cancel; action(); assert.equal(p.calls.cancel, before + 1);};
  p.click('cards', 'speech-play'); stops(() => p.click('cards', 'flash-next'));
  p.click('cards', 'speech-play'); assert.match(p.last().text, /第二张正面/); assert.doesNotMatch(p.last().text, /First front/);
  stops(() => p.control('quiz', 'speech-play').focus());
  p.click('steps', 'speech-play'); stops(() => p.click('steps', 'step-next'));
  p.click('steps', 'speech-play'); stops(() => p.doc.querySelector('[data-dt-control="nav-quiz"]').click());
  p.click('quiz', 'speech-play'); stops(() => p.win.dispatchEvent(new p.win.Event('pagehide')));
  p.click('quiz', 'speech-play'); stops(() => p.control('cards', 'speech-play').dispatchEvent(new p.win.Event('pointerdown', {bubbles: true})));
  p.click('quiz', 'speech-play'); stops(() => p.api.destroy());
});
test('non-Chinese fallback and speech errors report actual availability without pretending Xiaoxiao', t => {
  const voice = {name: 'English system', lang: 'en-US', voiceURI: 'english', default: true};
  const p = page(t, [voice]);
  p.click('quiz', 'speech-play'); assert.equal(p.last().voice, voice); assert.equal(p.last().lang, 'en-US');
  assert.match(p.doc.querySelector('.dt-speech-status').textContent, /English system.*未提供 Xiaoxiao/);
  p.last().onerror({error: 'voice-unavailable'});
  assert.equal(p.control('quiz', 'speech-stop').disabled, true);
  assert.match(p.doc.querySelector('[data-dt-activity="quiz"] .dt-status').textContent, /朗读未能完成/);
});
test('full derivation preserves stage and reads only its current visible scope', t => {
  const p = page(t);
  p.click('steps', 'speech-play'); assert.match(p.last().text, /x 的平方/); assert.doesNotMatch(p.last().text, /Then finish|HIDDEN/);
  p.click('steps', 'step-next'); p.click('steps', 'step-view');
  assert.equal(p.doc.querySelectorAll('[data-dt-activity="steps"] .dt-step-stage').length, 2);
  p.click('steps', 'speech-play'); assert.match(p.last().text, /x 的平方/); assert.match(p.last().text, /Then finish/);
  p.click('steps', 'step-view'); assert.equal(p.api.getState().activities.steps.stepIndex, 1);
  assert.equal(p.doc.querySelectorAll('[data-dt-activity="steps"] .dt-step-stage').length, 1);
});
test('steps without speechText read live visible DOM and exclude closed details and CSS-hidden answers', t => {
  const fixture = JSON.parse(JSON.stringify(lesson));
  const activity = fixture.activities.find(a => a.id === 'steps');
  activity.steps = [
    {title: 'Visible stage', bodyHtml: '<p>VISIBLE_BODY</p><details><summary>VISIBLE_SUMMARY</summary><p>SECRET_CLOSED_ANSWER</p></details><span hidden>SECRET_HIDDEN</span><span aria-hidden="true">SECRET_ARIA</span><span style="display:none">SECRET_INLINE_DISPLAY</span><span style="visibility:hidden">SECRET_INLINE_VISIBILITY</span><div class="css-hidden"><p>SECRET_CSS_DISPLAY</p></div><div class="css-invisible"><span>SECRET_CSS_VISIBILITY</span></div><script>SECRET_SCRIPT</script><style>/* SECRET_STYLE */</style>'},
    {title: 'Next stage', bodyHtml: '<p>VISIBLE_NEXT_STAGE</p><details><summary>NEXT_SUMMARY</summary>SECRET_NEXT_ANSWER</details>'}
  ];
  assert.ok(activity.steps.every(step => !Object.hasOwn(step, 'speechText')));
  const p = page(t, [zh], true, fixture);
  const stylesheet = p.doc.createElement('style');
  stylesheet.textContent = '.css-hidden {display:none} .css-invisible {visibility:hidden}';
  p.doc.head.appendChild(stylesheet);
  const stage = p.doc.querySelector('[data-dt-activity="steps"] .dt-step-stage');
  const before = stage.innerHTML;
  assert.equal(p.win.getComputedStyle(stage.querySelector('.css-hidden')).display, 'none');
  assert.equal(p.win.getComputedStyle(stage.querySelector('.css-invisible')).visibility, 'hidden');
  p.click('steps', 'speech-play');
  assert.match(p.last().text, /VISIBLE_BODY/); assert.match(p.last().text, /VISIBLE_SUMMARY/);
  assert.doesNotMatch(p.last().text, /SECRET_|VISIBLE_NEXT_STAGE/);
  assert.equal(stage.innerHTML, before, 'reading does not remove authored nodes');
  stage.querySelector('details').open = true;
  p.click('steps', 'speech-replay'); assert.match(p.last().text, /SECRET_CLOSED_ANSWER/, 'explicitly opened details become visible content');
  stage.querySelector('details').open = false;
  p.click('steps', 'speech-replay'); assert.doesNotMatch(p.last().text, /SECRET_/);
  p.click('steps', 'step-view'); p.click('steps', 'speech-play');
  assert.match(p.last().text, /VISIBLE_BODY/); assert.match(p.last().text, /VISIBLE_NEXT_STAGE/);
  assert.doesNotMatch(p.last().text, /SECRET_/);
  p.click('steps', 'step-view'); p.click('steps', 'step-next'); p.click('steps', 'speech-play');
  assert.match(p.last().text, /VISIBLE_NEXT_STAGE/); assert.doesNotMatch(p.last().text, /VISIBLE_BODY|SECRET_/);
});
test('unsupported browser disables audio while retaining fully usable activities', t => {
  const p = page(t, [], false);
  assert.equal(p.control('quiz', 'speech-play').disabled, true);
  assert.match(p.doc.querySelector('.dt-speech-status').textContent, /不支持朗读/);
  p.click('cards', 'flash-flip'); assert.match(p.doc.querySelector('[data-dt-activity="cards"]').textContent, /SECRET_BACK/);
});
test('visible MathML uses its spoken label once, while hidden labels remain excluded', t => {
  const fixture = JSON.parse(JSON.stringify(lesson));
  fixture.activities.find(a => a.id === 'steps').steps = [{title: 'Fraction', bodyHtml:
    '<math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="八除以二"><mfrac><mn>8</mn><mn>2</mn></mfrac></math>' +
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>7</mn></math>' +
    '<div hidden><math aria-label="SECRET_PARENT"><mn>99</mn></math></div>' +
    '<math style="display:none" aria-label="SECRET_CSS"><mn>99</mn></math>' +
    '<details><summary>解释</summary><math aria-label="SECRET_CLOSED"><mn>99</mn></math></details>'}];
  const p = page(t, [zh], true, fixture);
  require('./helpers/math-style.cjs')(p.win);
  p.click('steps', 'speech-play');
  assert.equal(p.last().text.split('八除以二').length - 1, 1);
  assert.match(p.last().text, /7/);
  assert.doesNotMatch(p.last().text, /SECRET|8|2|99/);
});
test('theme defines complete light and dark semantic color sets and reduced motion', () => {
  const css = fs.readFileSync(path.join(__dirname, '../plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.css'), 'utf8');
  const blocks = [css.slice(0, css.indexOf('.dt-activity *,')), css.slice(css.indexOf('@media (prefers-color-scheme: dark)'))];
  const keys = ['paper', 'surface', 'ink', 'muted', 'line', 'accent', 'accent-soft', 'good', 'good-soft', 'again', 'again-soft', 'focus', 'on-accent', 'accent-hover', 'hint', 'error', 'guide', 'dot-second', 'shadow'];
  for (const block of blocks) for (const key of keys) assert.match(block, new RegExp('--dt-' + key + ':'));
  assert.doesNotMatch(css, /#fffdf7|#35685c|#24241f|transition:\s*all/);
  assert.match(css, /prefers-reduced-motion/); assert.match(css, /hover: hover/); assert.match(css, /prefers-contrast: more/);
});
test('high contrast wins the CSS cascade in both light and dark color schemes', () => {
  const css = fs.readFileSync(path.join(__dirname, '../plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.css'), 'utf8');
  const dom = new JSDOM('<style></style><div class="dt-activity"></div>');
  const style = dom.window.document.querySelector('style'); style.textContent = css;
  const rules = Array.from(style.sheet.cssRules);
  // jsdom does not emulate OS media settings. Resolve only the two independent
  // media signals, preserving stylesheet order, then exercise its real cascade.
  for (const [dark, contrast, expected] of [[false, false, '#d8d8dd'], [true, false, '#48484f'], [false, true, 'currentColor'], [true, true, 'currentColor']]) {
    style.textContent = rules.flatMap(rule => {
      if (!rule.media) return [rule.cssText];
      const active = (dark && rule.conditionText === '(prefers-color-scheme: dark)') || (contrast && rule.conditionText === '(prefers-contrast: more)');
      return active ? Array.from(rule.cssRules, item => item.cssText) : [];
    }).join('\n');
    assert.equal(dom.window.getComputedStyle(dom.window.document.querySelector('.dt-activity')).getPropertyValue('--dt-line').trim(), expected, `dark=${dark}, contrast=${contrast}`);
  }
  dom.window.close();
});
