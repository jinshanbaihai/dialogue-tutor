'use strict';
// Generated-document DOM contracts only; jsdom cannot verify Manim or layout.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {JSDOM, VirtualConsole} = require('jsdom');
const runtime = require('../plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js');

function fixture() {
  return {
    schemaVersion: 1, lessonId: 'document-policy', revision: '1', title: '路径到均值',
    generationPolicy: 'no-typing', theme: 'light',
    objectives: [{id: 'mapping', title: '由有序路径构造均值', kind: 'procedure'}],
    sections: [{id: 'construction', title: '逐行构造', activityIds: ['path'],
      bodyHtml: '<p id="premise">有放回抽两次，保留顺序。</p><div data-dt-activity="path"></div><details id="solution"><summary>直接看完整讲解</summary><p id="line-mean">两个数相加，再除以二。</p></details>'}],
    activities: [{id: 'path', objectiveId: 'mapping', type: 'interactive', title: '选择一条路径', prompt: '选择有序对后观察均值。', solutionId: 'solution',
      source: {repository: 'DialogueTutor', path: 'assets/interactive/lesson-runtime.js'},
      bodyHtml: '<button id="path-select" type="button">选择 (2,4)</button><output id="path-value">尚未选择</output>',
      script: `(function () {
        var id = 'path';
        function draw(state) { document.getElementById('path-value').textContent = state.path || '尚未选择'; }
        document.addEventListener('dt:activity-mounted', function (event) {
          if (event.detail.activityId !== id) return;
          if (!DialogueTutor.instance) throw new Error('instance unavailable');
          draw(event.detail.state);
          document.getElementById('path-select').addEventListener('click', function () {
            document.dispatchEvent(new CustomEvent('dt:exploration', {detail: {activityId: id, state: {path: '(2,4)', mean: '3'}}}));
            draw({path: '(2,4)'});
          });
        });
        document.addEventListener('dt:restore', function (event) {
          if (event.detail.activityId !== id) return;
          DialogueTutor.instance.restoreExploration(id, event.detail.state);
          draw(event.detail.state);
        });
      }());`}]
  };
}

test('new no-typing generation rejects typed quiz formats without removing legacy support', () => {
  const lesson = fixture();
  lesson.activities[0] = {id: 'path', objectiveId: 'mapping', type: 'quiz', title: '均值', prompt: '均值是多少', source: 'web/quiz', format: 'numeric', answer: 3};
  assert.throws(() => runtime.validateLesson(lesson), /No-typing/);
  delete lesson.generationPolicy;
  assert.equal(runtime.validateLesson(lesson), lesson);
  lesson.theme = 'dark-only';
  assert.throws(() => runtime.validateLesson(lesson), /theme/);
});

test('inline construction mounts once beside a static premise, restores its choice and keeps the study panel closed', async t => {
  const source = path.resolve(__dirname, '../plugins/dialogue-tutor/skills/dialogue-tutor/scripts/build_lesson.py');
  const built = spawnSync('python', ['-c', 'import importlib.util,json,sys\ns=importlib.util.spec_from_file_location("builder",sys.argv[1]);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)\nprint(m.assemble(json.load(sys.stdin)))', source], {input: JSON.stringify(fixture()), encoding: 'utf8'});
  assert.equal(built.status, 0, built.stderr);
  const errors = [], virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(built.stdout, {runScripts: 'dangerously', url: 'https://example.test/construction', virtualConsole});
  t.after(() => dom.window.close());
  const win = dom.window, doc = win.document;
  await new Promise(resolve => doc.addEventListener('dt:ready', resolve, {once: true}));
  const api = win.DialogueTutor.instance;
  assert.equal(doc.documentElement.dataset.dtTheme, 'light');
  assert.equal(doc.querySelector('.dt-study-panel').open, false);
  assert.equal(doc.querySelector('[data-dt-activity]').previousElementSibling.id, 'premise');
  assert.equal(doc.getElementById('solution').open, false);
  assert.equal(doc.querySelectorAll('.dt-custom input, .dt-custom textarea').length, 0);
  const select = doc.getElementById('path-select');
  select.click();
  const saved = api.exportState();
  assert.equal(saved.state.activities.path.explorationCount, 1);
  assert.equal(saved.state.activities.path.attempts.length, 0, 'construction remains exploration in the common record');
  api.refresh();
  assert.equal(doc.getElementById('path-select'), select, 'refresh preserves custom controls and bindings');
  api.importState(saved);
  assert.equal(doc.getElementById('path-value').textContent, '(2,4)');
  assert.equal(api.exportState().state.activities.path.explorationCount, 1, 'restore itself is not a learner action');
  select.click();
  assert.equal(api.getState().activities.path.explorationCount, 2, 'one click still has one listener');
  assert.deepEqual(errors, []);
});
