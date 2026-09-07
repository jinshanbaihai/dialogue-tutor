'use strict';
// Isolated in-memory DOM fixture: no user records, no final course generation.
const path = require('node:path');
const repo = path.resolve(__dirname, '../../../..');
const rt = require(path.join(repo, 'plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js'));
const {JSDOM} = require(path.join(repo, 'node_modules/jsdom'));
const source = {repository: 'DialogueTutor', path: 'review-fixture'};
const lesson = {
  schemaVersion: 1, lessonId: 'education-api-probe', revision: '1', presentation: 'studio', title: 'API probe', language: 'en',
  objectives: [{id: 'memory', title: 'Recall a definition', kind: 'memory'}],
  sections: [{id: 'scene', title: 'Scene', bodyHtml: 'Recall reference', activityIds: ['recall', 'predict', 'explain']}],
  activities: [
    {id: 'recall', objectiveId: 'memory', type: 'flashcards', title: 'Recall', prompt: 'Recall first', cards: [{front: 'What is a sample?', back: 'Observed units.'}], solutionId: 'shared', source},
    {id: 'predict', objectiveId: 'memory', type: 'quiz', format: 'numeric', title: 'Prediction', prompt: 'Predict the probability', answer: '1/3', explanation: 'The probability is one third.', hint: 'Use the denominator.', source},
    {id: 'explain', objectiveId: 'memory', type: 'quiz', format: 'open', title: 'Explain', prompt: 'Explain', modelAnswer: 'An explanation.', rubric: ['Explain the condition'], explanation: 'Reference.', source}
  ],
  pathways: [
    {from: 'predict', on: 'assisted', to: 'explain', label: 'After assisted correctness'},
    {from: 'explain', on: 'incorrect', to: 'recall', label: 'Repair an error'}
  ]
};
const dom = new JSDOM('<main><nav data-dt-studio-nav></nav><section id="scene" data-dt-scene="scene"><div data-dt-activity="recall"></div><div data-dt-activity="predict"></div><div data-dt-activity="explain"></div><details id="shared"><summary>Complete explanation</summary>Sample means observed units.</details></section><nav data-dt-studio-sequence></nav><aside data-dt-study></aside></main>', {url: 'https://example.test/education'});
const doc = dom.window.document;
const api = rt.mount(lesson, doc, {now: () => 1788739200000, sessionId: 'education-probe'});
const control = (id, name) => doc.querySelector('[data-dt-activity="' + id + '"] [data-dt-control="' + name + '"]');
function answer(id, value) {
  const input = control(id, 'answer'); input.value = value;
  input.dispatchEvent(new dom.window.Event('input')); control(id, 'submit').click();
}
(async () => {
  await Promise.resolve();
  const observations = [];
  doc.getElementById('shared').open = true;
  doc.getElementById('shared').dispatchEvent(new dom.window.Event('toggle'));
  control('recall', 'flash-flip').click(); control('recall', 'flash-good').click();
  const recall = api.getState().activities.recall;
  observations.push({probe: 'linked-flashcard-exposure', activityExposure: recall.exposure, cardAttempt: recall.attempts[0]});
  api.navigate('predict'); control('predict', 'hint').click();
  observations.push({probe: 'hint-before-any-answer', status: api.getState().activities.predict.status, attempts: api.getState().activities.predict.attempts.length, recommendations: api.getRecommendations()});
  answer('predict', '1/3');
  const reference = doc.querySelector('[data-dt-activity="predict"] .dt-reference');
  observations.push({probe: 'prediction-quiz-feedback', answerRevealed: api.getState().activities.predict.answerRevealed, referenceOpen: reference.open, referenceText: reference.textContent});
  api.navigate('explain'); answer('explain', 'My uncertain explanation'); control('explain', 'self-again').click();
  observations.push({probe: 'negative-self-report-route', source: api.getState().activities.explain.attempts[0].source, recommendations: api.getRecommendations()});
  console.log(JSON.stringify(observations, null, 2));
  dom.window.close();
})().catch(error => {console.error(error); dom.window.close(); process.exitCode = 1;});
