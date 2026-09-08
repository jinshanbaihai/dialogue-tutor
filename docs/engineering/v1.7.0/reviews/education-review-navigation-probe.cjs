'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const repo = path.resolve(__dirname, '../../../..');
const rt = require(path.join(repo, 'plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js'));
const {JSDOM} = require(path.join(repo, 'node_modules/jsdom'));
const NOW = 1788739200000;
const source = {repository: 'DialogueTutor', path: 'review-fixture'};
const lesson = {
  schemaVersion: 1, lessonId: 'education-navigation-probe', revision: '1', presentation: 'studio', title: 'Navigation probe', language: 'en',
  objectives: [{id: 'apply', title: 'Apply and explain', kind: 'procedure'}],
  sections: [{id: 'scene', title: 'Scene', bodyHtml: 'Complete references', activityIds: ['calculate', 'explain']}],
  activities: [
    {id: 'calculate', objectiveId: 'apply', type: 'quiz', format: 'numeric', title: 'Calculate', prompt: 'Compute 1/2', answer: 0.5, explanation: 'Half.', solutionId: 'solution', source},
    {id: 'explain', objectiveId: 'apply', type: 'quiz', format: 'open', title: 'Explain', prompt: 'Explain a fraction', modelAnswer: 'A fraction is division.', rubric: ['Connect the fraction with division'], explanation: 'Reference.', solutionId: 'solution', source}
  ]
};
function page(now, sessionId, envelope) {
  const dom = new JSDOM('<main><nav data-dt-studio-nav></nav><section id="scene" data-dt-scene="scene"><div data-dt-activity="calculate"></div><div data-dt-activity="explain"></div><details id="solution"><summary>Complete reference</summary>A fraction is division.</details></section><nav data-dt-studio-sequence></nav><aside data-dt-study></aside></main>', {url: 'https://example.test/review'});
  if (envelope) dom.window.localStorage.setItem(rt.storageKey(lesson), JSON.stringify(envelope));
  const doc = dom.window.document;
  const api = rt.mount(lesson, doc, {now: () => now, sessionId});
  const control = (id, name) => doc.querySelector('[data-dt-activity="' + id + '"] [data-dt-control="' + name + '"]');
  return {dom, doc, api, control, state: id => api.getState().activities[id], answer(id, text) {
    api.navigate(id); const input = control(id, 'answer'); input.value = text;
    input.dispatchEvent(new dom.window.Event('input')); control(id, 'submit').click();
  }, item: id => rt.getReviews(lesson, api.getState(), now).find(item => item.activityId === id)};
}
(async () => {
  const first = page(NOW, 'first'); await Promise.resolve();
  first.answer('calculate', '0.5'); first.answer('explain', 'A fraction represents division.');
  first.control('explain', 'self-good').click();
  first.api.navigate('calculate');
  assert.equal(first.state('calculate').answerRevealed, true, 'ordinary navigation preserves the completed attempt');
  const saved = first.api.exportState(); first.dom.window.close();
  const due = page(NOW + rt.DAY + 1, 'due', saved); await Promise.resolve();
  const numericItem = due.item('calculate'); assert.equal(numericItem.due, true);
  due.api.navigate(numericItem.activityId, numericItem);
  assert.equal(due.state('calculate').answerRevealed, false);
  assert.equal(due.control('calculate', 'answer').value, '');
  assert.equal(due.doc.getElementById('solution').open, false);
  const draft = due.control('calculate', 'answer'); draft.value = '0.';
  draft.dispatchEvent(new due.dom.window.Event('input'));
  due.api.navigate('explain'); due.api.navigate(numericItem.activityId, numericItem);
  assert.equal(due.control('calculate', 'answer').value, '0.', 'the review entry preserves an unfinished draft');
  const openItem = due.item('explain'); assert.equal(openItem.due, true);
  due.api.navigate(openItem.activityId, openItem); due.answer('explain', 'Division explains the fraction.');
  const originalId = due.state('explain').submittedAttemptId;
  due.api.navigate('calculate'); due.api.navigate(openItem.activityId, openItem);
  assert.equal(due.state('explain').submittedAttemptId, originalId);
  assert.equal(due.control('explain', 'answer').value, 'Division explains the fraction.');
  assert.equal(due.state('explain').status, 'submitted');
  assert.equal(due.state('explain').attempts.at(-1).correct, null, 'the pending self-review was not replaced by a new attempt');
  console.log(JSON.stringify({ordinaryNavigationPreservesReference: true, actualDueItemUsed: true, freshDueQuestionHidesAnswer: true, unfinishedNumericDraftPreserved: true, pendingOpenResponsePreserved: true, numericHistoryCount: due.state('calculate').attempts.length, openHistoryCount: due.state('explain').attempts.length}, null, 2));
  due.dom.window.close();
})().catch(error => {console.error(error); process.exitCode = 1;});
