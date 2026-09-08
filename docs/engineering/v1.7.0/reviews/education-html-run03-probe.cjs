'use strict';
// Independent evaluator of the frozen assembled HTML; never evaluates author scripts separately.
const fs = require('fs'), path = require('path'), assert = require('assert'), crypto = require('crypto');
const {JSDOM, VirtualConsole} = require('../repo/node_modules/jsdom');
const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'generation/run-03/lesson.html'), 'utf8');
const oracle = JSON.parse(fs.readFileSync(path.join(__dirname, 'education-html-run03-math.json'), 'utf8'));
const report = {kind: 'Independent education probes of actual run-03 HTML with jsdom; no browser rendering or learner outcome data',
  sha256: crypto.createHash('sha256').update(html).digest('hex'), cases: []};
const BASE = Date.UTC(2026, 8, 8, 12), DAY = 86400000;
const copy = x => JSON.parse(JSON.stringify(x));
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
let active;
function record(input, observation) { active.observations.push({input, observation: copy(observation)}); }
async function scenario(name, fn) {
  active = {name, observations: []}; report.cases.push(active);
  try { await fn(); active.status = 'PASS'; }
  catch (error) { active.status = 'FAIL'; active.error = error.stack; }
}
async function page(storage, at = BASE) {
  const errors = [], vc = new VirtualConsole(); vc.on('jsdomError', error => errors.push(error.message));
  let clock = at;
  const dom = new JSDOM(html, {url: 'https://education-run03.invalid/lesson.html', runScripts: 'dangerously',
    virtualConsole: vc, beforeParse(w) {
      w.HTMLElement.prototype.scrollIntoView = function () {};
      const NativeDate = w.Date;
      w.Date = class extends NativeDate {
        constructor(...args) { super(...(args.length ? args : [clock])); }
        static now() { return clock; }
      };
      if (storage) Object.entries(storage).forEach(([key, value]) => w.localStorage.setItem(key, value));
    }});
  if (dom.window.document.readyState === 'loading') await new Promise(resolve => dom.window.document.addEventListener('DOMContentLoaded', resolve, {once: true}));
  await tick(); assert.equal(errors.length, 0, errors.join('\n'));
  const p = {dom, w: dom.window, d: dom.window.document, i: dom.window.DialogueTutor.instance, errors,
    advance(ms = 1) { clock += ms; }, close() { dom.window.close(); }};
  assert(p.i); return p;
}
const q = (p, selector) => { const el = p.d.querySelector(selector); assert(el, selector); return el; };
const card = (id, selector) => `#dt-activity-${id} ${selector}`;
function click(p, selector) { const el = q(p, selector); assert(!el.disabled, `${selector} disabled`); p.advance(); el.click(); }
function change(p, selector, value) { const el = q(p, selector); assert(!el.disabled); p.advance(); el.value = value; if (el.type === 'radio') el.checked = true; el.dispatchEvent(new p.w.Event('change', {bubbles: true})); }
function input(p, selector, value) { const el = q(p, selector); p.advance(); el.value = value; el.dispatchEvent(new p.w.Event('input', {bubbles: true})); }
function navigate(p, id) { p.i.navigate(id); assert.equal(p.i.getState().currentActivity, id); }
const activity = (p, id = 'sample-lab') => copy(p.i.getState().activities[id]);
const lab = p => activity(p).exploration;
const learning = state => Object.fromEntries(['attempts','explorationCount','participated','lastInteractionAt','review','exposure'].map(k => [k,state[k]]));
const metrics = state => Object.fromEntries(['attempts','explorationCount','participated','lastInteractionAt','review'].map(k => [k,state[k]]));
const summary = p => ({loop:q(p,'#r3-close-loop').textContent, objective:q(p,'#r3-evidence-list').textContent,
  open:q(p,'#r3-open-evidence').textContent, review:q(p,'#r3-review').textContent, schedule:q(p,'#r3-review-status').textContent});
const storageDump = p => Object.fromEntries(Array.from({length:p.w.localStorage.length},(_,i)=>p.w.localStorage.key(i)).map(key=>[key,p.w.localStorage.getItem(key)]));
function freeze(p, prediction) { change(p, `input[name="r3-prediction"][value="${prediction}"]`, prediction); click(p, '#r3-freeze'); }
function submit(p, id, value) { navigate(p,id); input(p,card(id,'[data-dt-control="answer"]'),value); click(p,card(id,'[data-dt-control="submit"]')); }
function reduceFraction(text) { const [a,b='1'] = text.split('/'); return Number(a)/Number(b); }
function closeAt(p) { navigate(p,'evidence-close'); return summary(p); }
function actualMath(p) {
  return {rows:[...q(p,'#r3-path-table').querySelectorAll('tbody tr')].map(row => [...row.children].map(cell=>cell.textContent)),
    bars:[...q(p,'#r3-distribution').children].map(row=>({label:row.children[0].textContent, probability:row.children[2].textContent, width:row.querySelector('.r3-bar').style.width})),
    comparison:q(p,'#r3-comparison').textContent, total:q(p,'#r3-total').textContent, path:q(p,'#r3-path-view').textContent};
}

(async () => {
  await scenario('full explanation → older import → immediate export and actual storage refresh (open and closed panel)', async () => {
    for (const closeBeforeImport of [false,true]) {
      const p = await page(); navigate(p,'sample-lab'); const old = p.i.exportState(); const pre = metrics(activity(p));
      q(p,'#dt-explanation-lab').open = true; await tick();
      assert(activity(p).exposure.reference); assert(lab(p).referenceViewed);
      if (closeBeforeImport) { q(p,'#dt-explanation-lab').open = false; await tick(); }
      p.i.importState(old); const immediate = p.i.exportState(); const persisted = storageDump(p);
      assert(lab(p).referenceViewed); assert(immediate.state.activities['sample-lab'].exploration.referenceViewed);
      assert.deepStrictEqual(metrics(activity(p)),pre); assert(activity(p).exposure.reference);
      record({closeBeforeImport,action:'read reference, import unmodified older state, export without another interaction'},
        {reference:lab(p),learning:learning(activity(p)),panelOpen:q(p,'#dt-explanation-lab').open,
         immediateExportMatchesRuntime:JSON.stringify(immediate.state.activities['sample-lab'].exploration)===JSON.stringify(lab(p))});
      fs.writeFileSync(path.join(__dirname,`education-html-run03-reference-${closeBeforeImport?'closed':'open'}-immediate.json`),JSON.stringify(immediate,null,2));
      p.close(); const r = await page(persisted); navigate(r,'sample-lab');
      assert.deepStrictEqual(metrics(activity(r)),pre); assert(lab(r).referenceViewed); freeze(r,'greater');
      assert(lab(r).predictionHadReference); assert(!lab(r).predictionHadResult); click(r,'#r3-reveal');
      record({action:'new document from actual localStorage, then freeze greater and reveal'}, {lab:lab(r),response:q(r,'#r3-prediction-response').textContent,close:closeAt(r)}); r.close();
    }
  });

  await scenario('synchronous reference contact and frozen prediction chronology', async () => {
    const p = await page(); navigate(p,'sample-lab'); q(p,'#dt-explanation-lab').open = true;
    freeze(p,'greater'); assert(lab(p).predictionHadReference);
    record({action:'open full solution then freeze with no await for toggle'},lab(p)); p.close();
    const r = await page(); navigate(r,'sample-lab'); freeze(r,'less'); const original = lab(r);
    assert(q(r,'#r3-results').hidden); assert(q(r,'input[name="r3-prediction"]').disabled);
    q(r,'#dt-explanation-lab').open = true; await tick(); click(r,'#r3-reveal');
    assert(!lab(r).predictionHadReference); assert(lab(r).revealHadReference); assert.equal(lab(r).predictionAt,original.predictionAt);
    click(r,'#r3-new'); freeze(r,'greater'); assert(lab(r).predictionHadReference);
    const stored = lab(r).history.find(x=>x.roundId===original.roundId);
    assert.equal(stored.prediction,'less'); assert(!stored.predictionHadReference);
    record({action:'freeze less → read reference → reveal → same-condition new greater prediction'}, {original,history:lab(r).history,current:lab(r)}); r.close();
  });

  await scenario('result and submitted history → old import → immediate storage refresh, identity isolation', async () => {
    const p = await page(); navigate(p,'sample-lab'); const old = p.i.exportState(); const before = metrics(activity(p));
    freeze(p,'less'); click(p,'#r3-reveal'); const original = lab(p);
    p.i.importState(old); const immediate = p.i.exportState();
    assert.deepStrictEqual(metrics(activity(p)),before); assert.equal(lab(p).resultContacts.length,1);
    assert(lab(p).history.some(x=>x.roundId===original.roundId && x.prediction==='less' && !x.predictionHadReference));
    record({action:'unassisted less prediction → reveal → original blank import → immediate export'}, {old:before,after:learning(activity(p)),exploration:lab(p)});
    fs.writeFileSync(path.join(__dirname,'education-html-run03-result-immediate.json'),JSON.stringify(immediate,null,2));
    const storage = storageDump(p); p.close(); const r = await page(storage); navigate(r,'sample-lab');
    assert.deepStrictEqual(metrics(activity(r)),before); freeze(r,'greater');
    assert(lab(r).predictionHadResult); assert(!lab(r).predictionHadReference); click(r,'#r3-reveal');
    const same = lab(r); change(r,'#r3-mechanism','without'); freeze(r,'greater');
    assert(!lab(r).predictionHadResult); assert(!lab(r).predictionHadReference);
    record({action:'refresh, same-condition prediction; then new without-replacement mechanism prediction'}, {sameCondition:same,newCondition:lab(r)});
    click(r,'#r3-reveal'); change(r,'#r3-mechanism','with'); freeze(r,'greater'); assert(lab(r).predictionHadResult);
    record({action:'return to previously revealed with-replacement conditions'},lab(r)); r.close();
  });

  await scenario('all 12 actual tables, paths and bar widths versus independent exact oracle', async () => {
    const p = await page(); navigate(p,'sample-lab');
    for (const expected of oracle.lab) {
      change(p,'#r3-n',String(expected.parameters.n)); change(p,'#r3-mechanism',expected.parameters.mechanism); change(p,'#r3-threshold',String(expected.parameters.threshold)); click(p,'#r3-direct');
      const displayed = actualMath(p), expectedValues = Object.entries(expected.distribution);
      assert.equal(displayed.rows.length,expectedValues.length); assert.equal(displayed.bars.length,expectedValues.length);
      expectedValues.forEach(([value,probability], index) => {
        const row = displayed.rows[index], bar = displayed.bars[index];
        assert.equal(Number(row[0]),reduceFraction(value)); assert.equal(reduceFraction(row[2].split(' = ')[1]),reduceFraction(probability));
        const paths = [...row[1].matchAll(/\(([^)]+)\)/g)].map(match=>match[1].split(',').map(x=>Number(x.trim())));
        const expectedPaths = expected.samples.filter(sample=>sample.reduce((a,b)=>a+b,0)/sample.length===reduceFraction(value));
        assert.deepStrictEqual(paths,expectedPaths);
        assert.equal(Number(bar.label.replace(' 分','')),reduceFraction(value)); assert.equal(reduceFraction(bar.probability),reduceFraction(probability));
        assert(Math.abs(parseFloat(bar.width)/100-reduceFraction(probability))<1e-12);
      });
      const event = displayed.comparison.match(/P\(样本均值≥\d+\)=([\d/]+)/)[1];
      assert.equal(reduceFraction(event),reduceFraction(expected.probability));
      const relation = {less:'小于',equal:'等于',greater:'大于'}[expected.relation]; assert(displayed.comparison.includes(relation+'单卡概率'));
      if (expected.relation === 'equal') assert(!displayed.comparison.includes('差异'));
      record(expected.parameters,displayed);
    }
    p.close();
  });

  await scenario('summary states: no work, only reference, only reveal, manual path, only assisted and self assessment, actual independent answers', async () => {
    for (const kind of ['none','reference-only','reveal-only','manual-path','reference-and-reveal','assisted-and-self','independent']) {
      const p = await page(); navigate(p,'sample-lab');
      if (kind==='reference-only'||kind==='reference-and-reveal') { q(p,'#dt-explanation-lab').open = true; await tick(); }
      if (['reveal-only','manual-path','reference-and-reveal'].includes(kind)) click(p,'#r3-direct');
      if (kind==='manual-path') change(p,'#r3-path-select','2');
      if (kind==='assisted-and-self') {
        navigate(p,'distribution-probability'); q(p,'#dt-explanation-probability').open = true; await tick(); submit(p,'distribution-probability','4/9');
        submit(p,'distribution-independent','M=1,4,9；概率1/9,1/3,5/9；9条有序样本各1/9，按最大值合并。M=9是本次观测。');
        click(p,card('distribution-independent','[data-dt-control="self-good"]'));
        assert(activity(p,'distribution-probability').attempts[0].assisted); assert.equal(activity(p,'distribution-independent').attempts[0].source,'self');
      }
      if (kind==='independent') { submit(p,'distribution-completion','1/3'); submit(p,'distribution-probability','4/9'); }
      const seen = closeAt(p);
      if (kind==='none'||kind==='reference-only') assert(seen.loop.includes('尚未揭示'));
      if (kind==='reveal-only') { assert(seen.loop.includes('未提交预测')); assert(seen.loop.includes('没有主动选择路径')); assert.equal(activity(p).attempts.length,0); }
      if (kind==='manual-path') { assert(seen.loop.includes('1 次主动选择路径查看')); assert.equal(activity(p).attempts.length,0); }
      if (kind==='reference-and-reveal') assert(seen.loop.includes('揭示结果前已查看实验全解'));
      if (kind==='assisted-and-self') { assert(seen.objective.includes('提交前有提示／参考接触')); assert(seen.open.includes('自评达到要点')); assert(!seen.objective.includes('独立客观核对正确')); }
      if (kind==='independent') { assert.equal((seen.objective.match(/独立客观核对正确/g)||[]).length,2); assert(seen.open.includes('数值核对也不能单独证明完整推导')); }
      record({kind}, {summary:seen,lab:lab(p),numeric:activity(p,'distribution-probability').attempts,open:activity(p,'distribution-independent').attempts}); p.close();
    }
  });

  await scenario('actual completion pathways: wrong, hint, independent correct, skipped; links clicked', async () => {
    for (const kind of ['wrong','assisted','independent','skipped']) {
      const p = await page(); navigate(p,'distribution-completion');
      const priorText = q(p,'#dt-activity-distribution-completion').textContent;
      const visibleTables = q(p,'#dt-activity-distribution-completion').querySelectorAll('table').length;
      if (kind==='skipped') click(p,card('distribution-completion','[data-dt-control="skip"]'));
      else {
        if (kind==='assisted') click(p,card('distribution-completion','[data-dt-control="hint"]'));
        submit(p,'distribution-completion',kind==='wrong'?'1/9':'1/3');
      }
      const state = activity(p,'distribution-completion'), rec = p.i.getRecommendations('distribution-completion')[0]; assert(rec);
      const expected = {wrong:'worked-distribution',assisted:'distribution-independent',independent:'distribution-probability',skipped:'worked-distribution'}[kind];
      assert.equal(rec.to,expected);
      const button = [...q(p,'#dt-activity-distribution-completion').querySelectorAll('button')].find(el=>el.textContent.includes(rec.label));
      assert(button,'actual recommendation button'); button.click(); assert.equal(p.i.getState().currentActivity,expected);
      if (kind==='skipped') assert.equal(state.attempts.length,0);
      else { assert.equal(state.attempts[0].assisted,kind==='assisted'); assert.equal(state.attempts[0].correct,kind!=='wrong'); }
      record({kind,answer:kind==='skipped'?null:kind==='wrong'?'1/9':'1/3'}, {priorPrompt:priorText,visibleTables,record:state,recommendation:rec,actualTarget:p.i.getState().currentActivity}); p.close();
    }
  });

  await scenario('concept and design objectives accept actual reasons, preserve originals and keep self source', async () => {
    const p = await page();
    const answers = {
      'survey-plan':'总体为本月120个灯罩，样本是抽中的24个灯罩，单位是一个灯罩，抽样框是108个编号的登记册。遗漏12个，需先补齐抽样框。选抽样调查，可少损坏产品并节省预算；代价是有抽样变异。普查没有抽样误差，也仍可能测量或记录错误。',
      'without-replacement':'允许的有序样本为(3,6),(3,12),(6,3),(6,12),(12,3),(12,6)，各概率1/6。均值4.5、7.5、9各有两条路径，所以各为1/3，和为1。抽到3后第二次为3的概率0而原来边际为1/3，故不独立。均值只需样本和已知常数2，不需未知μ，所以是统计量。抽之前均值是随机变量，抽到(3,12)后7.5是一次观测值。'
    };
    for (const [id,raw] of Object.entries(answers)) {
      submit(p,id,raw); const original=activity(p,id).attempts[0];
      assert.equal(original.answer,raw); assert.equal(original.correct,null); assert.equal(original.source,'self'); assert(!original.assisted);
      click(p,card(id,'[data-dt-control="self-good"]')); const rated=activity(p,id).attempts[0];
      assert.equal(rated.answer,raw); assert.equal(rated.source,'self'); assert.equal(rated.correct,true); assert.equal(p.i.getRecommendations(id).length,0);
      record({activityId:id,raw,action:'submit original explanation, then self-rate good'}, {original,rated,summary:closeAt(p)});
      if (id==='without-replacement') {
        const label=q(p,'#r3-challenge').textContent, before=activity(p,id); click(p,'#r3-challenge');
        assert.equal(p.i.getState().currentActivity,id); const after=activity(p,id);
        assert.equal(after.draft,raw); assert.equal(after.attempts.length,before.attempts.length); assert(after.answerRevealed);
        record({activityId:id,action:'after completed self assessment, click the closing challenge button'},
          {label,actualTarget:p.i.getState().currentActivity,before,after});
      }
    }
    navigate(p,'statistic-check'); change(p,card('statistic-check','input[value="sample"]'),'sample'); click(p,card('statistic-check','[data-dt-control="submit"]'));
    const correct=activity(p,'statistic-check').attempts[0], rec=p.i.getRecommendations('statistic-check')[0];
    assert(correct.correct && !correct.assisted && correct.source==='objective'); assert.equal(rec.to,'sample-lab');
    const button=[...q(p,'#dt-activity-statistic-check').querySelectorAll('button')].find(el=>el.textContent.includes(rec.label)); assert(button); button.click();
    assert.equal(p.i.getState().currentActivity,'sample-lab');
    record({activityId:'statistic-check',answer:'sample',action:'submit fresh correct choice then actual recommendation button'}, {correct,recommendation:rec,actualTarget:p.i.getState().currentActivity}); p.close();
  });

  await scenario('real review entry: first task, pending draft, normal browse, early practice, due practice in new document', async () => {
    const p = await page(); let seen = closeAt(p); assert(seen.review.includes('初次作答')); click(p,'#r3-review');
    assert.equal(p.i.getState().currentActivity,'distribution-probability'); input(p,card('distribution-probability','[data-dt-control="answer"]'),'4/');
    seen = closeAt(p); assert(seen.review.includes('继续未完成')); click(p,'#r3-review'); assert.equal(activity(p,'distribution-probability').draft,'4/');
    submit(p,'distribution-probability','4/9'); const first = activity(p,'distribution-probability'); const saved = storageDump(p);
    closeAt(p); navigate(p,'distribution-probability'); assert.equal(activity(p,'distribution-probability').draft,'4/9'); assert.equal(activity(p,'distribution-probability').attempts.length,1);
    seen = closeAt(p); assert(seen.review.includes('提前练习')); click(p,'#r3-review'); const entry = activity(p,'distribution-probability');
    assert.equal(entry.draft,''); assert(!entry.answerRevealed); assert.equal(entry.attempts.length,1); assert.equal(entry.review.dueAt,first.review.dueAt);
    submit(p,'distribution-probability','4/9'); const early = activity(p,'distribution-probability'); assert(early.attempts[1].assisted); assert.equal(early.review.intervalIndex,0);
    record({action:'first → pending 4/ → complete 4/9 → normal browse → actual early review → repeat 4/9'}, {first,entry,early,summary:seen}); p.close();
    const r = await page(saved, BASE+7*DAY); seen = closeAt(r); assert(seen.review.includes('到期回顾'));
    click(r,'#r3-review'); const dueEntry = activity(r,'distribution-probability');
    assert.equal(dueEntry.draft,''); assert(!dueEntry.answerRevealed); assert(!q(r,'#dt-explanation-probability').open); assert.equal(dueEntry.attempts.length,1);
    submit(r,'distribution-probability','4/9'); const due = activity(r,'distribution-probability'); assert(!due.attempts[1].assisted); assert.equal(due.review.intervalIndex,1);
    const challenge = closeAt(r); click(r,'#r3-challenge'); assert.equal(r.i.getState().currentActivity,'without-replacement');
    record({action:'new document with controlled 7-day clock → real due review button → 4/9 → challenge button'}, {entry:dueEntry,after:due,summary:seen,challengeTarget:r.i.getState().currentActivity,challengeSummary:challenge}); r.close();
  });
})().catch(error=>{report.fatal=error.stack;}).finally(()=>{
  report.status = report.fatal || report.cases.some(x=>x.status==='FAIL') ? 'FAIL':'PASS';
  fs.writeFileSync(path.join(__dirname,'education-html-run03-probe.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,cases:report.cases.map(x=>({name:x.name,status:x.status,error:x.error})),fatal:report.fatal},null,2));
  if(report.status!=='PASS')process.exitCode=1;
});
