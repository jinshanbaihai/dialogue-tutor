'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {JSDOM, VirtualConsole} = require('jsdom');
const skill = path.join(__dirname, '../plugins/dialogue-tutor/skills/dialogue-tutor');
const runtime = require(path.join(skill, 'assets/interactive/lesson-runtime.js'));
const NOW = 1788739200000;
const plain = value => JSON.parse(JSON.stringify(value));
const pause = () => new Promise(resolve => setTimeout(resolve, 10));

function fixture() {
  const source = {repository: 'DialogueTutor', path: 'assets/interactive/lesson-runtime.js'};
  const quiz = (id, title, answer) => ({id, title, objectiveId: 'apply', type: 'quiz', format: 'numeric',
    prompt: 'Write the requested value.', answer, explanation: 'The arithmetic gives ' + answer + '.', hint: 'Use division.', source});
  return {
    schemaVersion: 1, lessonId: 'studio-regression', revision: '1', presentation: 'studio', title: 'An activity first lesson', language: 'en',
    objectives: [{id: 'apply', title: 'Apply an arithmetic method', kind: 'procedure'}, {id: 'explain', title: 'Explain a result', kind: 'concept'}],
    sections: [
      {id: 'start', title: 'Predict first', lead: 'Make a prediction before checking.', bodyHtml: '<p>The first answer is 0.25. A fraction is division.</p>', activityIds: ['diagnostic', 'reflection']},
      {id: 'repair', title: 'Work through an example', bodyHtml: '<p>Divide the numerator by the denominator.</p>', activityIds: ['worked']},
      {id: 'apply', title: 'Use the method', bodyHtml: '<p>The practice answer is 0.5.</p>', activityIds: ['practice', 'challenge', 'recall']},
      {id: 'explore', title: 'Change and observe', bodyHtml: '<p>Compare predictions with the changed model.</p>', activityIds: ['plot', 'custom']}
    ],
    activities: [
      {...quiz('diagnostic', 'Predict a fraction', 0.25), solutionId: 'dt-explanation-start'},
      {id: 'reflection', objectiveId: 'explain', type: 'quiz', format: 'open', title: 'Explain your prediction', prompt: 'Explain the role of division.', modelAnswer: 'A fraction expresses division.', rubric: ['Connect the fraction to division.'], explanation: 'Explain the relationship.', solutionId: 'dt-explanation-start', source},
      {id: 'worked', objectiveId: 'apply', type: 'steps', title: 'Division example', prompt: 'Follow the example.', steps: [{title: 'Set up', bodyHtml: '<p>Take 3/4.</p>'}, {title: 'Divide', bodyHtml: '<p>3÷4=0.75</p>'}], source},
      {...quiz('practice', 'Fresh practice', 0.5), solutionId: 'dt-explanation-apply'},
      quiz('challenge', 'Transfer challenge', 0.75),
      {id: 'recall', objectiveId: 'explain', type: 'flashcards', title: 'Recall the idea', prompt: 'Recall before turning.', cards: [{front: 'What is a fraction?', back: 'A division expression.'}], source},
      {id: 'plot', objectiveId: 'explain', type: 'explore', model: 'linear-density', title: 'Observe a model', prompt: 'Move an endpoint.', source},
      {id: 'custom', objectiveId: 'explain', type: 'interactive', title: 'Record a prediction', prompt: 'Change your observation.', source,
        bodyHtml: '<button type="button" data-count>Observe</button><output data-observed>0</output>',
        script: `document.addEventListener('dt:activity-mounted', function (event) {
          if (event.detail.activityId !== 'custom') return;
          var node = document.querySelector('[data-dt-activity="custom"]'), value = event.detail.state.value || 0;
          var output = node.querySelector('[data-observed]'); output.textContent = value;
          node.querySelector('[data-count]').addEventListener('click', function () {
            value += 1; output.textContent = value;
            document.dispatchEvent(new CustomEvent('dt:exploration', {detail: {activityId: 'custom', state: {value: value}}}));
          });
          document.addEventListener('dt:restore', function (restored) {
            if (restored.detail.activityId === 'custom') {value = restored.detail.state.value || 0; output.textContent = value;}
          });
        });`}
    ],
    pathways: [
      {from: 'diagnostic', on: 'incorrect', to: 'worked', label: 'Review division in two steps'},
      {from: 'diagnostic', on: 'assisted', to: 'practice', label: 'Try a fresh fraction'},
      {from: 'diagnostic', on: 'correct', to: 'challenge', label: 'Apply the idea in a challenge'},
      {from: 'diagnostic', on: 'skipped', to: 'worked', label: 'Start from a worked example'},
      {from: 'reflection', on: 'correct', to: 'challenge', label: 'Must never count a self-rating as a pass'},
      {from: 'reflection', on: 'incorrect', to: 'worked', label: 'Revisit the explanation'},
      {from: 'recall', on: 'correct', to: 'challenge', label: 'Must never count recalled as a pass'},
      {from: 'plot', on: 'correct', to: 'challenge', label: 'Must never score parameter changes'},
      {from: 'custom', on: 'correct', to: 'challenge', label: 'Must never score participation'},
      {from: 'worked', on: 'skipped', to: 'practice', label: 'Continue to practice'}
    ]
  };
}

const html = execFileSync('python3', ['-c',
  'import json,sys;sys.path.insert(0,sys.argv[1]);import build_lesson;print(build_lesson.assemble(json.load(sys.stdin)))',
  path.join(skill, 'scripts')], {input: JSON.stringify(fixture()), encoding: 'utf8', maxBuffer: 2000000});

async function page(t, {stored, time = NOW} = {}) {
  const errors = [], copied = [];
  const virtualConsole = new VirtualConsole(); virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(html, {url: 'https://example.test/studio', runScripts: 'dangerously', virtualConsole,
    beforeParse(win) {
      win.Date.now = () => time;
      win.HTMLElement.prototype.scrollIntoView = function () {};
      Object.defineProperty(win.navigator, 'clipboard', {value: {writeText: async text => copied.push(text)}});
      if (stored) Object.entries(stored).forEach(([key, value]) => win.localStorage.setItem(key, value));
    }});
  const {window: win} = dom, doc = win.document;
  await new Promise(resolve => doc.addEventListener('dt:ready', resolve, {once: true}));
  const api = win.DialogueTutor.instance;
  t.after(() => {win.close(); assert.deepEqual(errors, []);});
  const box = id => doc.querySelector('[data-dt-activity="' + id + '"]');
  return {win, doc, api, box, copied, state: id => plain(api.getState().activities[id]),
    control: (id, name) => (id ? box(id) : doc).querySelector('[data-dt-control="' + name + '"]'),
    visible: () => [...doc.querySelectorAll('[data-dt-activity]')].filter(node => !node.hidden && !node.closest('[data-dt-scene]').hidden).map(node => node.dataset.dtActivity)};
}
function answer(p, id, value) {
  const input = p.control(id, 'answer'); input.value = value;
  input.dispatchEvent(new p.win.Event('input', {bubbles: true})); p.control(id, 'submit').click();
}

test('studio starts on an actionable task with closed explanations and unscored navigation', async t => {
  const p = await page(t);
  assert.deepEqual(p.visible(), ['diagnostic']);
  assert.equal(p.control('diagnostic', 'answer').disabled, false);
  assert.equal(p.doc.querySelectorAll('[data-dt-scene]:not([hidden])').length, 1);
  assert.equal(p.doc.querySelectorAll('.dt-scene-explanation[open]').length, 0);
  assert.equal(p.box('diagnostic').querySelector('.dt-tools').open, false);
  assert.equal(p.doc.querySelector('.dt-study-panel').open, false);
  assert.equal(p.api.getState().currentActivity, 'diagnostic');
  p.control(null, 'studio-next').click(); assert.deepEqual(p.visible(), ['reflection']);
  p.control(null, 'studio-prev').click(); assert.deepEqual(p.visible(), ['diagnostic']);
  const scene = p.control(null, 'scene-select'); scene.value = 'repair'; scene.dispatchEvent(new p.win.Event('change'));
  assert.deepEqual(p.visible(), ['worked']);
  assert.equal(p.api.navigate('challenge'), true); assert.deepEqual(p.visible(), ['challenge']);
  assert.equal(p.api.navigate('unknown'), false);
  assert.equal(runtime.evidenceSummary(fixture(), p.api.getState(), NOW).participated, 0);
  assert.ok(p.doc.querySelector('.dt-studio-progress').textContent.includes('Independent checks'));
});

test('incorrect, assisted, correct and skipped results recommend named reachable tasks', async t => {
  for (const outcome of ['incorrect', 'assisted', 'correct', 'skipped']) {
    const p = await page(t);
    if (outcome === 'skipped') p.control('diagnostic', 'skip').click();
    else {
      if (outcome === 'assisted') p.control('diagnostic', 'hint').click();
      answer(p, 'diagnostic', outcome === 'incorrect' ? '0.3' : '0.25');
    }
    const recommendation = plain(p.api.getRecommendations('diagnostic'));
    assert.equal(recommendation.length, 1); assert.equal(recommendation[0].on, outcome);
    const action = p.control('diagnostic', 'pathway-' + outcome + '-' + recommendation[0].to);
    assert.ok(action.textContent.includes(recommendation[0].label));
    assert.ok(action.textContent.includes(recommendation[0].targetTitle));
    action.click(); assert.deepEqual(p.visible(), [recommendation[0].to]);
    assert.equal(p.api.getState().currentActivity, recommendation[0].to);
    if (outcome === 'skipped') assert.equal(p.state('diagnostic').attempts.length, 0);
  }
});

test('open self-ratings, flashcard recall, steps and exploration never trigger an independent route', async t => {
  const p = await page(t);
  p.api.navigate('reflection'); answer(p, 'reflection', 'The numerator is divided by the denominator.');
  p.control('reflection', 'self-good').click(); assert.deepEqual(plain(p.api.getRecommendations()), []);
  p.api.navigate('recall'); p.control('recall', 'flash-flip').click(); p.control('recall', 'flash-good').click();
  assert.deepEqual(plain(p.api.getRecommendations()), []);
  p.api.navigate('worked'); p.control('worked', 'step-next').click();
  p.api.navigate('plot'); const range = p.control('plot', 'parameter-b'); range.value = '0.8'; range.dispatchEvent(new p.win.Event('input'));
  assert.deepEqual(plain(p.api.getRecommendations()), []);
  p.api.navigate('custom'); p.box('custom').querySelector('[data-count]').click();
  assert.deepEqual(plain(p.api.getRecommendations()), []);
  assert.equal(runtime.evidenceSummary(fixture(), p.api.getState(), NOW).independentPassed, 0);
  assert.equal(runtime.evidenceSummary(fixture(), p.api.getState(), NOW).selfReviewed, 2);
});

test('a shared full explanation marks every linked response without changing the current activity', async t => {
  const p = await page(t);
  p.doc.getElementById('dt-explanation-start').open = true;
  // Submission may beat the asynchronous native details toggle event.
  answer(p, 'diagnostic', '0.25'); await pause();
  assert.equal(p.state('diagnostic').attempts[0].assisted, true);
  assert.equal(p.state('reflection').exposure.reference, true);
  assert.equal(p.api.getState().currentActivity, 'diagnostic');
  assert.deepEqual(p.visible(), ['diagnostic']);
  p.api.navigate('reflection'); answer(p, 'reflection', 'A fraction is division.');
  assert.equal(p.state('reflection').attempts[0].assisted, true);
  p.api.navigate('practice'); p.doc.getElementById('dt-explanation-apply').open = true; await pause();
  assert.equal(p.state('practice').exposure.reference, true);
  p.api.navigate('challenge'); answer(p, 'challenge', '0.75');
  assert.equal(p.state('challenge').attempts[0].assisted, false, 'a different target with no shared answer is independent');
});

test('skipping an exploration is reversible and does not inflate participation', async t => {
  const p = await page(t); p.api.navigate('worked'); p.control('worked', 'skip').click();
  assert.equal(p.state('worked').status, 'skipped');
  assert.equal(p.state('worked').participated, false);
  assert.equal(p.api.getRecommendations()[0].to, 'practice');
  p.control('worked', 'retry').click(); assert.equal(p.state('worked').status, 'idle');
  p.control('worked', 'skip').click(); p.control('worked', 'step-next').click();
  assert.equal(p.state('worked').status, 'idle'); assert.equal(p.state('worked').attempts.length, 0);
});

test('due-review links reveal their scene and preserve an unfinished due response', async t => {
  const p = await page(t); p.api.navigate('practice'); answer(p, 'practice', '0.5');
  p.api.navigate('diagnostic');
  const stored = {[p.api.storageKey]: p.win.localStorage.getItem(p.api.storageKey)};
  const next = await page(t, {stored, time: NOW + runtime.DAY + 1});
  assert.deepEqual(next.visible(), ['diagnostic']);
  next.control(null, 'studio-review').click(); assert.deepEqual(next.visible(), ['practice']);
  assert.equal(next.doc.getElementById('dt-explanation-apply').open, false);
  assert.equal(next.state('practice').answerRevealed, false);
  const input = next.control('practice', 'answer'); input.value = '0.'; input.dispatchEvent(new next.win.Event('input'));
  next.api.navigate('diagnostic'); next.control(null, 'review-practice-undefined').click();
  assert.deepEqual(next.visible(), ['practice']); assert.equal(next.control('practice', 'answer').value, '0.');
  answer(next, 'practice', '0.5'); assert.equal(next.state('practice').review.intervalIndex, 1);
});

test('current scenes, drafts, tools and custom state survive reload and progress import', async t => {
  const p = await page(t);
  const node = p.control('diagnostic', 'answer'); node.value = '0.2'; node.dispatchEvent(new p.win.Event('input'));
  p.control('diagnostic', 'bookmark').click();
  const note = p.box('diagnostic').querySelector('.dt-note textarea'); note.value = 'Explain the denominator.'; note.dispatchEvent(new p.win.Event('input'));
  p.control('diagnostic', 'copy-context').click(); await pause(); assert.ok(p.copied[0].includes(note.value));
  assert.match(p.box('diagnostic').querySelector('.dt-source summary').textContent, /DialogueTutor/);
  assert.doesNotMatch(p.box('diagnostic').querySelector('.dt-source summary').textContent, /DeepTutor/);
  p.api.navigate('custom'); const customButton = p.box('custom').querySelector('[data-count]'); customButton.click();
  const exported = plain(p.api.exportState());
  p.api.navigate('diagnostic'); p.api.navigate('custom');
  assert.equal(p.box('custom').querySelector('[data-count]'), customButton, 'custom listeners retain the same DOM node');
  customButton.click(); assert.equal(p.state('custom').exploration.value, 2);
  p.api.importState(exported); assert.equal(p.box('custom').querySelector('[data-observed]').textContent, '1');
  assert.deepEqual(p.visible(), ['custom']);
  const next = await page(t, {stored: {[p.api.storageKey]: JSON.stringify(exported)}});
  assert.deepEqual(next.visible(), ['custom']);
  assert.equal(next.state('diagnostic').draft, '0.2'); assert.equal(next.state('diagnostic').bookmarked, true);
  assert.equal(next.state('diagnostic').notes, 'Explain the denominator.');
  assert.equal(next.box('custom').querySelector('[data-observed]').textContent, '1');
  assert.equal(next.api.exportState().schemaVersion, 1);
});

test('runtime rejects invalid pathways and uncovered studio objectives while retaining legacy v1', () => {
  for (const changes of [{to: 'missing'}, {from: 'missing'}, {on: 'participated'}, {label: ''}]) {
    const lesson = fixture(); Object.assign(lesson.pathways[0], changes); assert.throws(() => runtime.validateLesson(lesson), /pathway/);
  }
  const lesson = fixture(); lesson.objectives.push({id: 'orphan', title: 'Missing task', kind: 'concept'});
  assert.throws(() => runtime.validateLesson(lesson), /objectives/); delete lesson.presentation; runtime.validateLesson(lesson);
  lesson.sections.unshift({id: 'introduction', title: 'A legacy prose section', bodyHtml: '<p>Introduction.</p>'});
  runtime.validateLesson(lesson);  // Legacy prose-only sections can omit activityIds.
  const unsupported = fixture(); unsupported.activities[0].source.repository = 'invented';
  assert.throws(() => runtime.validateLesson(unsupported), /source repository/);
});
