'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { JSDOM, VirtualConsole } = require('/workspace/scratch/b4c4b2db70f4/repo/node_modules/jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'generation/run-03/lesson.html'), 'utf8');
const lesson = JSON.parse(fs.readFileSync(path.join(root, 'generation/run-03/lesson.json'), 'utf8'));
const out = {
  kind: 'independent narrative DOM probe on frozen run-03 lesson.html',
  claim: 'DOM/state/text evidence only; no visual or learner-effect claim',
  lesson: { lessonId: lesson.lessonId, revision: lesson.revision },
  scenarios: []
};

const wait = () => new Promise(resolve => setTimeout(resolve, 0));
const clone = value => JSON.parse(JSON.stringify(value));

async function page(envelope) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'https://run03-narrative.invalid/lesson.html',
    virtualConsole: vc,
    beforeParse(window) {
      window.HTMLElement.prototype.scrollIntoView = function () {};
      if (envelope) {
        const key = 'dialoguetutor:v1:' + encodeURIComponent(lesson.lessonId) + ':' + encodeURIComponent(lesson.revision);
        window.localStorage.setItem(key, JSON.stringify(envelope));
      }
    }
  });
  await new Promise(resolve => dom.window.document.addEventListener('DOMContentLoaded', resolve, { once: true }));
  await wait();
  assert(dom.window.DialogueTutor.instance, 'runtime did not mount');
  assert.strictEqual(errors.length, 0, errors.join('\n'));
  return { dom, window: dom.window, document: dom.window.document, tutor: dom.window.DialogueTutor.instance, errors };
}

function lab(pageState) {
  return pageState.tutor.getState().activities['sample-lab'].exploration;
}
function metrics(pageState, id = 'sample-lab') {
  const saved = pageState.tutor.getState().activities[id];
  return {
    explorationCount: saved.explorationCount,
    attempts: saved.attempts.length,
    participated: saved.participated,
    lastInteractionAt: saved.lastInteractionAt
  };
}
function navigate(pageState, id) {
  pageState.tutor.navigate(id);
}
function control(pageState, id, selector) {
  const node = pageState.document.querySelector('#dt-activity-' + id + ' ' + selector);
  assert(node, id + ' ' + selector);
  return node;
}
function click(pageState, selector, id) {
  const node = id ? control(pageState, id, selector) : pageState.document.querySelector(selector);
  assert(node, selector);
  assert(!node.disabled, selector + ' disabled');
  node.click();
}
function change(pageState, selector, value, id) {
  const node = id ? control(pageState, id, selector) : pageState.document.querySelector(selector);
  assert(node, selector);
  node.value = value;
  node.dispatchEvent(new pageState.window.Event('change', { bubbles: true }));
}
function input(pageState, selector, value, id) {
  const node = id ? control(pageState, id, selector) : pageState.document.querySelector(selector);
  assert(node, selector);
  node.value = value;
  node.dispatchEvent(new pageState.window.Event('input', { bubbles: true }));
}
function freeze(pageState, prediction) {
  change(pageState, 'input[name="r3-prediction"][value="' + prediction + '"]', prediction, 'sample-lab');
  click(pageState, '#r3-freeze', 'sample-lab');
}
function reveal(pageState) {
  if (lab(pageState).phase === 'draft') click(pageState, '#r3-direct', 'sample-lab');
  else click(pageState, '#r3-reveal', 'sample-lab');
}
function closeText(pageState) {
  navigate(pageState, 'evidence-close');
  return {
    loop: pageState.document.querySelector('#r3-close-loop').textContent,
    evidence: pageState.document.querySelector('#r3-evidence-list').textContent,
    open: pageState.document.querySelector('#r3-open-evidence').textContent,
    review: pageState.document.querySelector('#r3-review').textContent
  };
}
async function scenario(name, fn) {
  const item = { name, status: 'PASS' };
  out.scenarios.push(item);
  try {
    await fn(item);
  } catch (error) {
    item.status = 'FAIL';
    item.error = error.stack;
  }
}

(async () => {
  await scenario('prediction-consistent-default', async item => {
    const p = await page();
    navigate(p, 'sample-lab');
    freeze(p, 'greater');
    const frozen = clone(lab(p));
    reveal(p);
    const state = clone(lab(p));
    const comparison = control(p, 'sample-lab', '#r3-comparison').textContent;
    const response = control(p, 'sample-lab', '#r3-prediction-response').textContent;
    const close = closeText(p);
    assert.strictEqual(state.prediction, 'greater');
    assert.strictEqual(state.predictionAt, frozen.predictionAt);
    assert(comparison.includes('大于'));
    assert(response.includes('与本轮精确枚举一致'));
    assert(close.loop.includes('开场的概率比较'));
    assert(close.loop.includes('当前总体为 2、4、8 分钟；n=2；有放回'));
    assert(close.loop.includes('P(样本均值≥5)=5/9'));
    assert(close.loop.includes('原预测：大于'));
    assert(close.loop.includes('与本轮精确枚举一致'));
    assert(close.loop.includes('可在“无放回”新题中自行组织样本空间'));
    item.input = { prediction: 'greater', parameters: state.parameters };
    item.output = { comparison, response, close, state, metrics: metrics(p) };
    p.dom.window.close();
  });

  await scenario('prediction-inconsistent-less', async item => {
    const p = await page();
    navigate(p, 'sample-lab');
    change(p, '#r3-threshold', '8', 'sample-lab');
    freeze(p, 'greater');
    reveal(p);
    const state = clone(lab(p));
    const comparison = control(p, 'sample-lab', '#r3-comparison').textContent;
    const response = control(p, 'sample-lab', '#r3-prediction-response').textContent;
    const close = closeText(p);
    assert.strictEqual(state.parameters.threshold, 8);
    assert(comparison.includes('小于'));
    assert(response.includes('与本轮结果不一致，枚举给出“小于”'));
    assert(close.loop.includes('P(样本均值≥8)=1/9'));
    assert(close.loop.includes('小于单卡概率'));
    assert(close.loop.includes('原预测：大于'));
    assert(close.loop.includes('与本轮结果不一致'));
    item.input = { prediction: 'greater', parameters: state.parameters };
    item.output = { comparison, response, close, state };
    p.dom.window.close();
  });

  await scenario('unpredicted-direct-reveal-close', async item => {
    const p = await page();
    navigate(p, 'sample-lab');
    click(p, '#r3-direct', 'sample-lab');
    const state = clone(lab(p));
    const close = closeText(p);
    assert.strictEqual(state.prediction, null);
    assert.strictEqual(state.pathSelections.length, 0);
    assert(close.loop.includes('未提交预测'));
    assert(close.loop.includes('没有主动选择路径的记录'));
    assert(close.loop.includes('展示过的默认路径不算你亲自计算'));
    assert(close.loop.includes('开场的概率比较'));
    assert(!close.loop.includes('原预测：'));
    item.input = { action: 'direct-observation', prediction: null };
    item.output = { close, state, metrics: metrics(p) };
    p.dom.window.close();
  });

  await scenario('reference-before-direct-observation-uses-honest-tense', async item => {
    const p = await page();
    navigate(p, 'sample-lab');
    const solution = p.document.getElementById('dt-explanation-lab');
    solution.open = true;
    await wait();
    click(p, '#r3-direct', 'sample-lab');
    await wait();
    const state = clone(lab(p));
    const close = closeText(p);
    assert.strictEqual(state.referenceViewed, true);
    assert.strictEqual(state.revealHadReference, true);
    assert(close.loop.includes('揭示结果前已查看实验全解'));
    assert(!close.loop.includes('首次观察'));
    assert(close.loop.includes('未提交预测'));
    item.input = { action: 'open-full-explanation-then-direct-observation' };
    item.output = { close, state };
    p.dom.window.close();
  });

  await scenario('after-prediction-reference-does-not-rewrite-frozen-snapshot', async item => {
    const p = await page();
    navigate(p, 'sample-lab');
    freeze(p, 'greater');
    const frozen = clone(lab(p));
    p.document.getElementById('dt-explanation-lab').open = true;
    await wait();
    assert.strictEqual(lab(p).predictionHadReference, false);
    assert.strictEqual(lab(p).predictionAt, frozen.predictionAt);
    assert.strictEqual(lab(p).referenceViewed, true);
    reveal(p);
    const state = clone(lab(p));
    const response = control(p, 'sample-lab', '#r3-prediction-response').textContent;
    const close = closeText(p);
    assert.strictEqual(state.predictionHadReference, false);
    assert.strictEqual(state.revealHadReference, true);
    assert(response.includes('提交前尚无本实验参考或同条件结果接触记录'));
    assert(close.loop.includes('本次揭示结果前已查看实验全解'));
    item.input = { prediction: 'greater', action: 'view-reference-after-freeze' };
    item.output = { frozen, state, response, close };
    p.dom.window.close();
  });

  await scenario('equal-relation-n1', async item => {
    const p = await page();
    navigate(p, 'sample-lab');
    change(p, '#r3-n', '1', 'sample-lab');
    freeze(p, 'equal');
    reveal(p);
    const state = clone(lab(p));
    const comparison = control(p, 'sample-lab', '#r3-comparison').textContent;
    const response = control(p, 'sample-lab', '#r3-prediction-response').textContent;
    const close = closeText(p);
    assert.strictEqual(state.parameters.n, 1);
    assert(comparison.includes('等于单卡概率'));
    assert(comparison.includes('n=1 时样本均值就是单张卡值，所以两事件相同'));
    assert(response.includes('与本轮精确枚举一致'));
    assert(close.loop.includes('等于单卡概率'));
    assert(!close.loop.includes('找出这个差异'));
    item.input = { parameters: state.parameters, prediction: 'equal' };
    item.output = { comparison, response, close, state };
    p.dom.window.close();
  });

  await scenario('assisted-correction-then-close', async item => {
    const p = await page();
    navigate(p, 'distribution-completion');
    input(p, '[data-dt-control="answer"]', '1/9', 'distribution-completion');
    click(p, '[data-dt-control="submit"]', 'distribution-completion');
    const first = clone(p.tutor.getState().activities['distribution-completion']);
    click(p, '[data-dt-control="retry"]', 'distribution-completion');
    click(p, '[data-dt-control="hint"]', 'distribution-completion');
    input(p, '[data-dt-control="answer"]', '1/3', 'distribution-completion');
    click(p, '[data-dt-control="submit"]', 'distribution-completion');
    const second = clone(p.tutor.getState().activities['distribution-completion']);
    const close = closeText(p);
    assert.strictEqual(first.attempts[0].correct, false);
    assert.strictEqual(second.attempts[1].correct, true);
    assert.strictEqual(second.attempts[1].assisted, true);
    assert(close.evidence.includes('提交前有提示／参考接触'));
    item.input = { wrong: '1/9', corrected: '1/3', hint: true };
    item.output = { close, firstAttempt: first.attempts[0], secondAttempt: second.attempts[1], metrics: metrics(p, 'distribution-completion') };
    p.dom.window.close();
  });

  await scenario('only-reveal-then-close-does-not-claim-calculation', async item => {
    const p = await page();
    navigate(p, 'sample-lab');
    click(p, '#r3-direct', 'sample-lab');
    const before = clone(lab(p));
    const close = closeText(p);
    assert(close.evidence.includes('尚无已提交作答'));
    assert(close.loop.includes('没有主动选择路径的记录'));
    assert(close.loop.includes('默认路径不算你亲自计算'));
    assert(!close.loop.includes('你已经'));
    item.input = { action: 'reveal-only', state: before };
    item.output = { close, state: before };
    p.dom.window.close();
  });

  await scenario('actual-path-selection-then-close', async item => {
    const p = await page();
    navigate(p, 'sample-lab');
    freeze(p, 'greater');
    reveal(p);
    change(p, '#r3-path-select', '2', 'sample-lab');
    const state = clone(lab(p));
    const close = closeText(p);
    assert.strictEqual(state.pathSelections.length, 1);
    assert(close.loop.includes('本轮记录了 1 次主动选择路径查看'));
    assert(!close.loop.includes('没有主动选择路径的记录'));
    item.input = { prediction: 'greater', selectedPath: 2 };
    item.output = { close, state };
    p.dom.window.close();
  });

  await scenario('actual-numeric-submit-then-close', async item => {
    const p = await page();
    navigate(p, 'distribution-probability');
    input(p, '[data-dt-control="answer"]', '4/9', 'distribution-probability');
    click(p, '[data-dt-control="submit"]', 'distribution-probability');
    const saved = clone(p.tutor.getState().activities['distribution-probability']);
    const close = closeText(p);
    assert(saved.attempts[0].correct === true);
    assert(saved.attempts[0].assisted === false);
    assert(close.evidence.includes('最新数值或选项独立客观核对正确'));
    assert(close.loop.includes('尚未揭示结果'));
    assert(close.open.includes('数值核对也不能单独证明完整推导'));
    item.input = { activity: 'distribution-probability', answer: '4/9' };
    item.output = { close, savedAttempt: saved.attempts[0] };
    p.dom.window.close();
  });

  await scenario('same-result-new-round-shows-seen-result', async item => {
    const p = await page();
    navigate(p, 'sample-lab');
    click(p, '#r3-direct', 'sample-lab');
    click(p, '#r3-new', 'sample-lab');
    freeze(p, 'greater');
    const state = clone(lab(p));
    const response = control(p, 'sample-lab', '#r3-status').textContent;
    const history = control(p, 'sample-lab', '#r3-history').textContent;
    assert.strictEqual(state.predictionHadResult, true);
    assert(p.document.querySelector('#r3-contact').textContent.includes('同条件结果接触记录'));
    assert(history.includes('同条件结果接触：有'));
    assert(!response.includes('首次观察'));
    item.input = { action: 'direct-reveal-then-same-condition-new-round-and-predict' };
    item.output = { state, status: response, history, contact: control(p, 'sample-lab', '#r3-contact').textContent, metrics: metrics(p) };
    p.dom.window.close();
  });

  out.status = out.scenarios.every(x => x.status === 'PASS') ? 'PASS' : 'FAIL';
  fs.writeFileSync(path.join(__dirname, 'narrative-dom-run-03.json'), JSON.stringify(out, null, 2));
  process.stdout.write(JSON.stringify({ status: out.status, scenarios: out.scenarios.map(x => ({ name: x.name, status: x.status, error: x.error })), record: 'reviews/narrative-dom-run-03.json' }) + '\n');
  if (out.status !== 'PASS') process.exitCode = 1;
})().catch(error => {
  out.status = 'FAIL';
  out.error = error.stack;
  fs.writeFileSync(path.join(__dirname, 'narrative-dom-run-03.json'), JSON.stringify(out, null, 2));
  process.stderr.write(error.stack + '\n');
  process.exitCode = 1;
});
