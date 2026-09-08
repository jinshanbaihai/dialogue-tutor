'use strict';
// Independent game-design review of frozen run-03 HTML. No browser rendering or learner-effect claim.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('../repo/node_modules/jsdom');
const base = path.resolve(__dirname, '../generation/run-03');
const html = fs.readFileSync(path.join(base, 'lesson.html'), 'utf8');
const lesson = JSON.parse(fs.readFileSync(path.join(base, 'lesson.json'), 'utf8'));
const NOW = Date.UTC(2026, 8, 8, 15, 20);
const DAY = 86400000;
const plain = value => JSON.parse(JSON.stringify(value));
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const live = [];
const report = {
  reviewer: 'game_design_run03_independent',
  scope: 'Targeted actual-HTML DOM/state operations. Not the runtime regression suite, a rendered browser check, or real learner retention/motivation evidence.',
  files: Object.fromEntries(['lesson.html', 'lesson.json', 'blueprint.md'].map(name => [name, crypto.createHash('sha256').update(fs.readFileSync(path.join(base, name))).digest('hex')])),
  cases: [], errors: []
};
assert.equal(report.files['lesson.html'], 'd9624b533e838edf4b06b974f15c07b0bb3bf653f36e4ea3b5e663c5adfe7c2c');
async function page({ stored, time = NOW } = {}) {
  const errors = [], events = [], vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(html, { url: 'https://game-review.invalid/run03', runScripts: 'dangerously', virtualConsole: vc,
    beforeParse(w) {
      w.Date.now = () => time;
      w.HTMLElement.prototype.scrollIntoView = function () {};
      if (stored) Object.entries(stored).forEach(([key, value]) => w.localStorage.setItem(key, value));
    }
  });
  const w = dom.window, d = w.document;
  await new Promise(resolve => d.addEventListener('dt:ready', resolve, { once: true }));
  const api = w.DialogueTutor.instance;
  assert.deepEqual(JSON.parse(d.getElementById('dt-lesson').textContent), lesson);
  for (const name of ['dt:exploration', 'dt:restore', 'dt:navigate']) d.addEventListener(name, event => events.push({ name, activityId: event.detail.activityId }));
  const p = { dom, w, d, api, errors, events,
    state: id => plain(api.getState().activities[id]),
    lab: () => plain(api.getState().activities['sample-lab'].exploration),
    stored: () => ({ [api.storageKey]: w.localStorage.getItem(api.storageKey) })
  };
  live.push(p); return p;
}
const ctl = name => `[data-dt-control="${name}"]`;
const box = (p, id) => p.d.getElementById('dt-activity-' + id);
function node(p, selector, id) { const el = (id ? box(p, id) : p.d).querySelector(selector); assert(el, 'Missing ' + selector); return el; }
function text(p, selector, id) { return node(p, selector, id).textContent.replace(/\s+/g, ' ').trim(); }
function click(p, selector, id) { const el = node(p, selector, id); assert(!el.disabled, 'Disabled ' + selector); el.click(); }
function value(p, selector, input, id) { const el = node(p, selector, id); el.value = input; el.dispatchEvent(new p.w.Event(el.tagName === 'SELECT' || el.type === 'radio' ? 'change' : 'input', { bubbles: true })); }
function freeze(p, prediction) { value(p, `input[name="r3-prediction"][value="${prediction}"]`, prediction); click(p, '#r3-freeze'); }
function answer(p, id, input) { p.api.navigate(id); value(p, ctl('answer'), input, id); click(p, ctl('submit'), id); }
function metrics(p) { const s = p.state('sample-lab'); return { explorationCount: s.explorationCount, participated: s.participated, lastInteractionAt: s.lastInteractionAt, attempts: s.attempts.length, review: s.review }; }
function labOutput(p) { return Object.fromEntries(['condition','status','contact','comparison','prediction-response','path-view','path-table','distribution','total','history'].map(k => [k, text(p, '#r3-' + k)])); }
function closeOutput(p, navigate = true) {
  if (navigate) p.api.navigate('evidence-close');
  return Object.fromEntries(['close-loop','evidence-list','open-evidence','challenge','review','review-status'].map(k => [k, text(p, '#r3-' + k)]));
}
function recommended(p, id) {
  return { records: plain(p.api.getRecommendations(id)), buttons: [...box(p,id).querySelectorAll('.dt-recommendations button')].map(el => el.textContent) };
}
function follow(p, id, target) {
  const rec = plain(p.api.getRecommendations(id)).find(r => r.to === target); assert(rec, 'No recommendation ' + id + ' -> ' + target);
  const button = [...box(p,id).querySelectorAll('.dt-recommendations button')].find(el => el.textContent.includes(rec.label));
  assert(button, 'No actual recommendation button'); button.click(); assert.equal(p.api.getState().currentActivity, target);
}
function pristine(p, id) {
  const s = p.state(id);
  assert.equal(s.draft, ''); assert.equal(s.answerRevealed, false); assert.equal(s.attempts.length, 0);
  assert.equal(p.d.getElementById(lesson.activities.find(x => x.id === id).solutionId).open, false);
  return { prompt: text(p, '.dt-prompt', id), answerRevealed: s.answerRevealed, draft: s.draft, attempts: s.attempts.length };
}
async function run(name, fn) {
  try { report.cases.push({ name, probeStatus: 'completed', ...await fn() }); }
  catch (error) { report.cases.push({ name, probeStatus: 'failed', error: error.stack }); }
}
(async () => {
  await run('G01-concordant-prediction-freeze-reload-and-path-mapping', async () => {
    const p = await page(); p.api.navigate('sample-lab');
    assert.equal(node(p,'#r3-results').hidden,true); assert.equal(text(p,'#r3-path-table'),'');
    assert.equal(metrics(p).explorationCount,0); assert.equal(p.lab().selectedPath,null);
    freeze(p,'greater'); const frozen=p.lab();
    assert.equal(node(p,'#r3-results').hidden,true); assert.equal(node(p,'input[name="r3-prediction"]').disabled,true);
    const q=await page({stored:p.stored(),time:NOW+1000});
    assert.equal(q.lab().predictionAt,frozen.predictionAt); assert.equal(q.lab().prediction,'greater');
    assert.equal(node(q,'#r3-results').hidden,true); assert.equal(node(q,'input[name="r3-prediction"]').disabled,true);
    click(q,'#r3-reveal'); assert.match(text(q,'#r3-comparison'),/5\/9.*大于.*1\/3/);
    assert.match(text(q,'#r3-prediction-response'),/与本轮精确枚举一致/);
    value(q,'#r3-path-select','2'); assert.match(text(q,'#r3-path-view'),/\(2, 8\).*\(2\+8\)\/2=5/);
    assert.equal(q.lab().pathSelections.length,1); assert.equal(q.state('sample-lab').attempts.length,0);
    const output=labOutput(q); click(q,'#r3-completion'); assert.equal(q.api.getState().currentActivity,'distribution-completion');
    return { activityId:'sample-lab', input:['greater','save prediction','reload actual localStorage','reveal','select path 2','click probability completion'], frozen, output, next:pristine(q,'distribution-completion'), closing:closeOutput(q) };
  });
  await run('G02-discordant-prediction-and-meaningful-mechanism-choice',async()=>{
    const p=await page();p.api.navigate('sample-lab');freeze(p,'less');click(p,'#r3-reveal');const first=p.lab(),firstOutput=labOutput(p);
    assert.match(firstOutput['prediction-response'],/不一致.*大于/);
    click(p,'#r3-switch');assert.equal(p.lab().parameters.mechanism,'without');assert.equal(node(p,'#r3-results').hidden,true);
    assert(p.lab().history.some(x=>x.prediction==='less'&&x.predictionAt===first.predictionAt&&x.parameters.mechanism==='with'));
    freeze(p,'greater');click(p,'#r3-reveal');assert.match(text(p,'#r3-comparison'),/2\/3.*大于.*1\/3/);
    assert.equal(node(p,'#r3-path-select').options.length,6);assert.match(text(p,'#r3-total'),/不独立.*1\/6/);
    return {activityId:'sample-lab',input:['less, save, reveal','click change-to-without','greater, save, reveal'],first:firstOutput,changed:labOutput(p),history:p.lab().history,closing:closeOutput(p)};
  });
  await run('G03-equal-and-smaller-relations-use-the-actual-result',async()=>{
    const rows=[];
    for(const [n,mechanism,threshold,prediction,fraction] of [[1,'with',5,'equal','1/3'],[1,'without',5,'equal','1/3'],[2,'with',6,'equal','1/3'],[2,'without',6,'greater','1/3'],[2,'with',8,'less','1/9'],[2,'without',8,'less','0/1']]){
      const p=await page();p.api.navigate('sample-lab');value(p,'#r3-n',String(n));value(p,'#r3-mechanism',mechanism);value(p,'#r3-threshold',String(threshold));freeze(p,prediction);click(p,'#r3-reveal');
      const output=labOutput(p),closing=closeOutput(p);assert(output.comparison.includes('='+fraction));
      if(threshold!==8){assert.match(output.comparison,/等于单卡概率/);assert(!output.comparison.includes('这个差异'));assert.match(output.comparison,n===1?/两事件相同/:/概率恰好相同/);}
      else assert.match(output.comparison,/小于单卡概率/);
      p.api.navigate('sample-lab');click(p,'#r3-new');freeze(p,prediction);assert.equal(p.lab().predictionHadResult,true);click(p,'#r3-reveal');
      assert.match(text(p,'#r3-prediction-response'),/提交前已见同条件结果/);
      rows.push({activityId:'sample-lab',input:{n,mechanism,threshold,prediction},output,closing,newRoundResponse:text(p,'#r3-prediction-response')});
    }
    return {rows};
  });
  await run('G04-reveal-only-and-prediction-only-reveal-close-without-invented-work',async()=>{
    const rows=[];
    for(const prediction of [null,'greater']){const p=await page();p.api.navigate('sample-lab');if(prediction){freeze(p,prediction);click(p,'#r3-reveal');}else click(p,'#r3-direct');
      const state=p.lab(),output=closeOutput(p);assert.equal(state.pathSelections.length,0);assert.equal(state.selectedPath,null);assert.equal(p.state('sample-lab').attempts.length,0);
      assert.match(output['close-loop'],/没有主动选择路径.*默认路径不算你亲自计算/);assert.match(output['close-loop'],/5\/9.*大于.*1\/3/);
      assert(!output['close-loop'].includes('你已经在实验中把'));if(!prediction)assert.match(output['close-loop'],/未提交预测.*直接查看结果/);
      rows.push({activityId:'evidence-close',input:prediction?['greater','save','reveal','close']:['direct observe','close'],state,output});}
    return {rows};
  });
  await run('G05-reference-immediate-prediction-and-direct-observation-tense',async()=>{
    const rows=[];
    for(const predict of [true,false]){const p=await page();p.api.navigate('sample-lab');p.d.getElementById('dt-explanation-lab').open=true;
      if(predict){freeze(p,'greater');assert.equal(p.lab().predictionHadReference,true);click(p,'#r3-reveal');}else click(p,'#r3-direct');
      assert.equal(p.lab().revealHadReference,true);const output=labOutput(p),closing=closeOutput(p);
      assert.match(closing['close-loop'],/揭示结果前已查看实验全解/);assert(!closing['close-loop'].includes('首次观察'));
      if(!predict)assert.match(output['prediction-response'],/未提交预测/);
      rows.push({activityId:'sample-lab',input:['open full explanation',predict?'immediately greater, freeze, reveal':'immediately direct observe','close'],output,closing,state:p.lab()});}
    return {rows};
  });
  await run('G06-reference-old-import-immediate-export-and-storage-refresh-no-action',async()=>{
    const rows=[];
    for(const leaveOpen of [true,false]){const p=await page();p.api.navigate('sample-lab');const old=p.api.exportState();p.d.getElementById('dt-explanation-lab').open=true;await tick();await tick();
      if(!leaveOpen){p.d.getElementById('dt-explanation-lab').open=false;await tick();}
      assert.equal(p.state('sample-lab').exposure.reference,true);const before=metrics(p),eventIndex=p.events.length;
      p.api.importState(old);const exported=p.api.exportState(),stored=p.stored(),after=metrics(p),restoreEvents=p.events.slice(eventIndex);
      assert.equal(exported.state.activities['sample-lab'].exploration.referenceViewed,true);assert.equal(p.state('sample-lab').exposure.reference,true);
      assert.equal(after.explorationCount,0);assert.equal(after.attempts,0);assert.equal(after.participated,false);assert.equal(after.lastInteractionAt,null);
      assert.equal(restoreEvents.filter(x=>x.name==='dt:exploration').length,0);
      const savedEnvelope=JSON.parse(stored[p.api.storageKey]);assert.equal(savedEnvelope.state.activities['sample-lab'].exploration.referenceViewed,true);
      const q=await page({stored,time:NOW+1000});assert.equal(q.lab().referenceViewed,true);assert.deepEqual(metrics(q),after);
      freeze(q,'greater');assert.equal(q.lab().predictionHadReference,true);click(q,'#r3-reveal');
      rows.push({activityId:'sample-lab',input:['export cold','read full explanation',leaveOpen?'keep open':'close full explanation','import cold','immediate export','refresh from actual localStorage','greater, freeze, reveal'],before,after,restoreEvents,exportedExploration:exported.state.activities['sample-lab'].exploration,refreshedResponse:text(q,'#r3-prediction-response'),refreshedState:q.lab()});}
    return {rows};
  });
  await run('G07-result-old-import-immediate-export-refresh-history-and-identity',async()=>{
    const p=await page();p.api.navigate('sample-lab');const old=p.api.exportState();freeze(p,'less');click(p,'#r3-reveal');const original=p.lab();const eventIndex=p.events.length;
    p.api.importState(old);const exported=p.api.exportState(),after=metrics(p),stored=p.stored();
    assert.equal(after.explorationCount,0);assert.equal(after.participated,false);assert.equal(after.lastInteractionAt,null);assert.equal(after.attempts,0);
    assert.equal(p.events.slice(eventIndex).filter(e=>e.name==='dt:exploration').length,0);
    assert.equal(exported.state.activities['sample-lab'].exploration.resultContacts.length,1);assert(p.lab().history.some(x=>x.prediction==='less'&&x.predictionAt===original.predictionAt&&x.predictionHadResult===false));
    const q=await page({stored,time:NOW+1000});assert.deepEqual(metrics(q),after);freeze(q,'greater');assert.equal(q.lab().predictionHadResult,true);assert.equal(q.lab().predictionHadReference,false);click(q,'#r3-reveal');
    const same=labOutput(q);value(q,'#r3-threshold','8');freeze(q,'less');assert.equal(q.lab().predictionHadResult,false);assert.equal(q.lab().predictionHadReference,false);click(q,'#r3-reveal');
    return {activityId:'sample-lab',input:['cold export','less, freeze, reveal','import cold','immediate export and actual storage reload','same conditions greater, freeze, reveal','threshold8 less, freeze, reveal'],original,after,exportedExploration:exported.state.activities['sample-lab'].exploration,sameCondition:same,changedCondition:labOutput(q),history:q.lab().history};
  });
  await run('G08-later-reference-does-not-rewrite-original-frozen-snapshot',async()=>{
    const p=await page();p.api.navigate('sample-lab');freeze(p,'less');const original=p.lab(),frozenExport=p.api.exportState();p.d.getElementById('dt-explanation-lab').open=true;await tick();await tick();
    assert.equal(p.lab().predictionHadReference,false);assert.equal(p.lab().predictionAt,original.predictionAt);
    p.api.importState(frozenExport);const exported=p.api.exportState();assert.equal(p.lab().predictionHadReference,false);assert.equal(p.lab().referenceViewed,true);
    const q=await page({stored:p.stored(),time:NOW+2000});assert.equal(q.lab().predictionHadReference,false);assert.equal(q.lab().predictionAt,original.predictionAt);click(q,'#r3-reveal');
    const oldResponse=text(q,'#r3-prediction-response');assert.match(oldResponse,/提交前尚无/);assert.equal(q.lab().revealHadReference,true);
    click(q,'#r3-new');freeze(q,'greater');assert.equal(q.lab().predictionHadReference,true);assert(q.lab().history.some(x=>x.predictionAt===original.predictionAt&&x.predictionHadReference===false));
    return {activityId:'sample-lab',input:['less, freeze, export','open full explanation afterwards','import frozen','immediate export and storage reload','reveal','new round greater, freeze'],original,exportedExploration:exported.state.activities['sample-lab'].exploration,oldResponse,newState:q.lab()};
  });
  await run('G09-error-local-repair-and-assisted-route-to-unseen-max-task',async()=>{
    const p=await page();answer(p,'distribution-completion','1/9');const wrong={state:p.state('distribution-completion'),feedback:text(p,'.dt-activity-body','distribution-completion'),next:recommended(p,'distribution-completion')};
    assert.equal(wrong.state.attempts[0].correct,false);assert.equal(wrong.state.attempts[0].assisted,false);assert.match(wrong.feedback,/\(0,6\).*\(3,3\).*\(6,0\)/);
    follow(p,'distribution-completion','worked-distribution');const steps=[];
    steps.push(text(p,'.dt-step-stage','worked-distribution'));click(p,ctl('step-next'),'worked-distribution');steps.push(text(p,'.dt-step-stage','worked-distribution'));click(p,ctl('step-next'),'worked-distribution');steps.push(text(p,'.dt-step-stage','worked-distribution'));
    assert.match(steps[1],/1、4、4、7/);assert.match(steps[2],/1\/4\+1\/4=1\/2/);assert.equal(p.state('worked-distribution').attempts.length,0);
    p.api.navigate('distribution-completion');click(p,ctl('retry'),'distribution-completion');answer(p,'distribution-completion','1/3');const repaired={state:p.state('distribution-completion'),feedback:text(p,'.dt-feedback','distribution-completion'),next:recommended(p,'distribution-completion')};
    assert.equal(repaired.state.attempts.at(-1).assisted,true);assert.equal(repaired.state.attempts.at(-1).correct,true);
    follow(p,'distribution-completion','distribution-independent');const next=pristine(p,'distribution-independent');assert.match(next.prompt,/M=max/);
    return {activityId:'distribution-completion',input:['1/9','click recommended complete worked example','next step twice','return, retry, 1/3','click recommendation to max task'],wrong,steps,repaired,next};
  });
  await run('G10-hint-correct-open-self-report-and-next-new-statistic',async()=>{
    const p=await page();p.api.navigate('distribution-completion');click(p,ctl('hint'),'distribution-completion');const hint=text(p,'.dt-hint','distribution-completion');answer(p,'distribution-completion','1/3');
    const assisted=p.state('distribution-completion');assert.equal(assisted.attempts[0].assisted,true);assert.equal(assisted.attempts[0].correct,true);follow(p,'distribution-completion','distribution-independent');const before=pristine(p,'distribution-independent');
    const raw='M可取1、4、9，概率分别为1/9、3/9、5/9；每次等概率放回，9条有序样本等可能。按较大值归组，合计1+3+5=9。抽到(1,9)只给观测M=9，分布列出全部可能值及概率。';
    answer(p,'distribution-independent',raw);const pending=p.state('distribution-independent');assert.equal(pending.attempts[0].source,'self');assert.equal(pending.attempts[0].correct,null);
    click(p,ctl('self-good'),'distribution-independent');const self=p.state('distribution-independent');assert.equal(self.attempts[0].source,'self');assert.equal(self.attempts[0].assisted,false);assert.equal(plain(p.api.getRecommendations('distribution-independent')).length,0);
    click(p,ctl('studio-next'));assert.equal(p.api.getState().currentActivity,'distribution-probability');const range=pristine(p,'distribution-probability');
    const closing=closeOutput(p);assert.match(closing['evidence-list'],/提交前有提示／参考接触/);assert.match(closing['open-evidence'],/自评达到要点/);
    return {activityIds:['distribution-completion','distribution-independent','distribution-probability','evidence-close'],input:['hint','1/3','recommendation to max','original open response','self meets criteria','actual next button'],hint,assisted,before,raw,pending,self,range,closing};
  });
  await run('G11-independent-success-actual-close-and-new-mechanism-challenge',async()=>{
    const p=await page();answer(p,'distribution-completion','1/3');assert.equal(p.state('distribution-completion').attempts[0].assisted,false);
    follow(p,'distribution-completion','distribution-probability');const range=pristine(p,'distribution-probability');answer(p,'distribution-probability','4/9');
    const objective=p.state('distribution-probability');assert.equal(objective.attempts[0].assisted,false);assert.equal(objective.attempts[0].correct,true);follow(p,'distribution-probability','evidence-close');const closing=closeOutput(p,false);
    click(p,'#r3-challenge');assert.equal(p.api.getState().currentActivity,'without-replacement');const challenge=pristine(p,'without-replacement');
    assert.match(challenge.prompt,/不放回.*不独立.*未知总体均值.*抽取前的随机变量/);
    return {activityIds:['distribution-completion','distribution-probability','evidence-close','without-replacement'],input:['independent 1/3','actual recommendation to range','independent 4/9','actual recommendation to close','click no-replacement challenge'],range,objective,closing,challenge};
  });
  await run('G12-choice-error-feedback-and-skipping-preserve-agency',async()=>{
    const p=await page();p.api.navigate('statistic-check');value(p,'input[value="ratio"]','ratio','statistic-check');click(p,ctl('submit'),'statistic-check');
    const wrong=text(p,'.dt-feedback','statistic-check');assert.match(wrong,/未知μ.*无法得到唯一数值/);follow(p,'statistic-check','worked-distribution');
    p.api.navigate('distribution-probability');click(p,ctl('skip'),'distribution-probability');const skipped=p.state('distribution-probability'),feedback=text(p,'.dt-feedback','distribution-probability');assert.equal(skipped.attempts.length,0);assert.equal(skipped.review,null);assert.match(feedback,/没有计入答错/);
    follow(p,'distribution-probability','distribution-completion');p.api.navigate('evidence-close');const closing=closeOutput(p,false);click(p,'#r3-return-lab');assert.equal(p.api.getState().currentActivity,'sample-lab');
    return {activityIds:['statistic-check','distribution-probability','evidence-close'],input:['ratio choice','submit','actual support recommendation','range skip','actual completion recommendation','free navigate close','return lab'],wrong,skipped,feedback,closing,destination:p.api.getState().currentActivity};
  });
  await run('G13-cold-close-and-import-update-live-review-entry',async()=>{
    const p=await page();const coldOutput=closeOutput(p),cold=p.api.exportState();assert.match(coldOutput['review'],/初次作答/);assert.match(coldOutput['review-status'],/还没有复习记录/);assert.match(coldOutput['close-loop'],/尚未揭示结果/);
    click(p,'#r3-review');assert.equal(p.api.getState().currentActivity,'distribution-probability');const first=pristine(p,'distribution-probability');answer(p,'distribution-probability','4/9');closeOutput(p);const done=p.api.exportState();
    p.api.importState(cold);const empty=closeOutput(p,false);assert.match(empty['review'],/初次作答/);click(p,'#r3-review');assert.equal(p.state('distribution-probability').attempts.length,0);
    p.api.importState(done);const filled=closeOutput(p,false);assert.match(filled['review'],/提前练习/);click(p,'#r3-review');assert.equal(p.api.getState().currentActivity,'distribution-probability');assert.equal(p.state('distribution-probability').attempts.length,1);assert.equal(p.state('distribution-probability').answerRevealed,false);
    return {activityId:'evidence-close',input:['cold close','click first attempt','4/9, close, export','import empty while close','click review','import answered','click review'],coldOutput,first,empty,filled,final:p.state('distribution-probability')};
  });
  await run('G14-normal-return-versus-early-review-and-pending-draft',async()=>{
    const p=await page();answer(p,'distribution-probability','4/9');const original=p.state('distribution-probability');closeOutput(p);p.api.navigate('distribution-probability');const normal=p.state('distribution-probability');
    assert.equal(normal.answerRevealed,true);assert.equal(normal.draft,'4/9');assert.equal(normal.attempts.length,1);assert.deepEqual(normal.review,original.review);
    const closing=closeOutput(p);click(p,'#r3-review');const retrieval=p.state('distribution-probability');assert.equal(retrieval.draft,'');assert.equal(retrieval.answerRevealed,false);assert.equal(retrieval.attempts.length,1);assert.deepEqual(retrieval.review,original.review);
    answer(p,'distribution-probability','4/9');const early=p.state('distribution-probability');assert.equal(early.attempts.at(-1).assisted,true);assert.equal(early.review.intervalIndex,0);
    closeOutput(p);click(p,'#r3-review');value(p,ctl('answer'),'4/','distribution-probability');const pendingClose=closeOutput(p);assert.match(pendingClose['review'],/继续未完成/);click(p,'#r3-review');assert.equal(p.state('distribution-probability').draft,'4/');
    return {activityId:'distribution-probability',input:['4/9','ordinary return','close early review','4/9','early review again','draft 4/','close and return pending'],original,normal,closing,retrieval,early,pendingClose,pending:p.state('distribution-probability')};
  });
  await run('G15-actual-due-entry-with-controlled-time-is-new-retrieval',async()=>{
    const p=await page();answer(p,'distribution-probability','4/9');const original=p.state('distribution-probability');
    const q=await page({stored:p.stored(),time:NOW+DAY+1});const closing=closeOutput(q);assert.match(closing['review'],/到期回顾/);assert.match(closing['review-status'],/当前已到期/);
    click(q,'#r3-review');const retrieval=q.state('distribution-probability');assert.equal(retrieval.draft,'');assert.equal(retrieval.answerRevealed,false);assert.equal(retrieval.attempts.length,1);assert.equal(q.d.getElementById('dt-explanation-probability').open,false);
    answer(q,'distribution-probability','4/9');const recalled=q.state('distribution-probability');assert.equal(recalled.attempts.at(-1).assisted,false);assert.equal(recalled.attempts.at(-1).source,'objective');assert.equal(recalled.review.intervalIndex,1);assert.equal(recalled.review.dueAt,NOW+4*DAY+1);
    return {activityId:'distribution-probability',input:['independent 4/9','reload actual storage with Date.now advanced 24h+1ms','close','click actual due entry','4/9'],original,closing,retrieval,recalled,limit:'Only scheduler behavior; no human delayed-retention result.'};
  });
  await run('G16-completed-challenge-entry-and-actual-completion-prompt',async()=>{
    const p=await page();p.api.navigate('distribution-completion');const prompt=text(p,'.dt-prompt','distribution-completion'),initialTables=box(p,'distribution-completion').querySelectorAll('table').length;
    const raw='6条有序样本各为1/6；(3,6),(6,3)给4.5；(3,12),(12,3)给7.5；(6,12),(12,6)给9。各均值概率1/3。第一次取3后第二次取3概率为0，所以不独立。均值只用样本和常数2，仍是统计量。抽前取值随机，(3,12)后7.5是一次观测值。';
    answer(p,'without-replacement',raw);click(p,ctl('self-good'),'without-replacement');const before=p.state('without-replacement'),closing=closeOutput(p);click(p,'#r3-challenge');const after=p.state('without-replacement');
    assert.equal(p.api.getState().currentActivity,'without-replacement');assert.equal(after.attempts.length,before.attempts.length);assert.equal(after.draft,raw);assert.equal(after.answerRevealed,true);
    return {activityIds:['distribution-completion','without-replacement','evidence-close'],input:['inspect initial completion prompt','complete no-replacement open task','self meets criteria','close','click challenge again'],completion:{prompt,initialTables,solutionOpen:p.d.getElementById('dt-explanation-completion').open},before,closing,after,observations:['The completion prompt says paths have been listed, but its initial activity contains no path table.','The completed challenge button still says challenge and uses ordinary navigation to the existing answer; it does not reset or add an attempt.']};
  });
  for(const p of live){report.errors.push(...p.errors);p.dom.window.close();}
  fs.writeFileSync(path.join(__dirname,'game-html-run-03-transcript.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({cases:report.cases.map(({name,probeStatus,error})=>({name,probeStatus,error})),unhandledErrors:report.errors},null,2));
  if(report.cases.some(x=>x.probeStatus==='failed')||report.errors.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
