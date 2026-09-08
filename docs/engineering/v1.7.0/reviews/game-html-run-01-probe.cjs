'use strict';
// Independent reviewer probe: operates the delivered HTML unchanged.
// JSDOM verifies DOM/state behavior, not real browser layout or real learning.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {JSDOM, VirtualConsole} = require('../repo/node_modules/jsdom');
const base = path.resolve(__dirname, '../generation/run-01');
const html = fs.readFileSync(path.join(base, 'lesson.html'), 'utf8');
const lesson = JSON.parse(fs.readFileSync(path.join(base, 'lesson.json'), 'utf8'));
const NOW = Date.UTC(2026, 8, 7, 12);
const DAY = 86400000;
const plain = v => JSON.parse(JSON.stringify(v));
const transcript = {reviewer: 'game_design', artifact: 'generation/run-01/lesson.html', sha256: crypto.createHash('sha256').update(html).digest('hex'),
  environment: 'JSDOM; controlled Date.now; controlled Math.random for traceable draws; no browser layout assertion', cases: [], errors: []};
const live = [];
const tick = () => new Promise(r => setTimeout(r, 0));
async function page({stored, time = NOW} = {}) {
  const errors = [], vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(html, {url: 'https://review.example/s2-ch6', runScripts: 'dangerously', virtualConsole: vc,
    beforeParse(win) {
      win.Date.now = () => time;
      const sequence = [0, 0.999999, 0.4, 0.4, 0.999999, 0]; let i = 0;
      win.Math.random = () => sequence[(i++) % sequence.length];
      win.HTMLElement.prototype.scrollIntoView = function () {};
      if (stored) Object.entries(stored).forEach(([k,v]) => win.localStorage.setItem(k,v));
    }});
  const win = dom.window, doc = win.document;
  await new Promise(resolve => doc.addEventListener('dt:ready', resolve, {once: true}));
  const api = win.DialogueTutor.instance;
  const p = {dom, win, doc, api, errors, time,
    box: id => doc.getElementById('dt-activity-' + id),
    state: id => plain(api.getState().activities[id]),
    lab: () => plain(api.getState().activities['sampling-lab'].exploration),
    stored: () => ({[api.storageKey]: win.localStorage.getItem(api.storageKey)})};
  live.push(p); return p;
}
function node(p, id, selector) {const n = p.box(id).querySelector(selector); if (!n) throw Error(id + ' missing ' + selector); return n;}
function click(p, id, selector) {const n=node(p,id,selector); if(n.disabled) throw Error('disabled '+selector); n.click();}
function value(p,id,selector,v) {const n=node(p,id,selector); n.value=v; n.dispatchEvent(new p.win.Event(n.tagName==='SELECT' || n.type==='radio'?'change':'input',{bubbles:true}));}
function text(p,id,selector) {return node(p,id,selector).textContent.replace(/\s+/g,' ').trim();}
function ctl(name) {return '[data-dt-control="'+name+'"]';}
function q(p,id,answer) {
  const a=lesson.activities.find(a=>a.id===id);p.api.navigate(id);
  if(a.format==='choice') {const index=a.choices.findIndex(c=>c.id===answer);const n=node(p,id,ctl('choice-'+index));n.checked=true;n.dispatchEvent(new p.win.Event('change',{bubbles:true}));}
  else value(p,id,ctl('answer'),answer);
  click(p,id,ctl('submit'));
}
function feedback(p,id) {const box=p.box(id);return [...box.querySelectorAll('.dt-feedback,.dt-recommendations')].map(n=>n.textContent.replace(/\s+/g,' ').trim()).filter(Boolean);}
function navigatePath(p,id,outcome,target) {click(p,id,ctl('pathway-'+outcome+'-'+target));return p.api.getState().currentActivity;}
function summary(p) {p.api.navigate('evidence-close'); return {story:text(p,'evidence-close','[data-close-story]'),evidence:text(p,'evidence-close','[data-close-evidence]'),challenge:text(p,'evidence-close','[data-close-challenge]'),review:text(p,'evidence-close','[data-close-review]'),reviewNote:text(p,'evidence-close','[data-close-review-note]')};}
function assert(condition,description) {if(!condition)throw Error(description);}
async function run(name,fn) {try {transcript.cases.push({name,status:'observed',...await fn()});}catch(e){transcript.cases.push({name,status:'probe-failed',error:e.stack});}}
(async()=>{
  await run('G1-consistent-prediction-and-visible-sample-consequence',async()=>{
    const p=await page();const initial={current:p.api.getState().currentActivity,resultsHidden:node(p,'sampling-lab','[data-lab-results]').hidden,chartCount:p.box('sampling-lab').querySelectorAll('.lab-chart svg').length};
    value(p,'sampling-lab','[data-lab-prediction]','centre');click(p,'sampling-lab','[data-lab-freeze]');
    const frozen=p.lab();assert(frozen.phase==='frozen'&&frozen.prediction==='centre','prediction not frozen');assert(node(p,'sampling-lab','[data-lab-results]').hidden,'premature results');
    click(p,'sampling-lab','[data-lab-reveal]');const comparison=text(p,'sampling-lab','[data-lab-comparison]');
    value(p,'sampling-lab','[data-lab-path]','2');const selected={trace:text(p,'sampling-lab','[data-lab-trace]'),B:p.lab().simulation.B,selectedPath:p.lab().selectedPath};
    assert(selected.B===0,'manual enumeration polluted random frequency');
    click(p,'sampling-lab','[data-lab-one]');const one={last:text(p,'sampling-lab','[data-lab-last]'),simulation:p.lab().simulation};assert(one.simulation.B===1,'one random sample does not mean one statistic');
    click(p,'sampling-lab','[data-lab-many]');const batch={simulation:p.lab().simulation,table:text(p,'sampling-lab','[data-lab-table]')};assert(batch.simulation.B===21,'batch sample count');
    click(p,'sampling-lab','[data-lab-completion]');assert(p.api.getState().currentActivity==='mean-completion','continuation destination');
    return {input:['centre','freeze','reveal','select path 2 (A,C)','random 1','random 20','new probability task'],initial,frozen,comparison,selected,one,batch,next:p.api.getState().currentActivity};
  });
  await run('G1-inconsistent-prediction-compare-paths-and-preserve-history',async()=>{
    const p=await page();value(p,'sampling-lab','[data-lab-prediction]','equal');click(p,'sampling-lab','[data-lab-freeze]');click(p,'sampling-lab','[data-lab-reveal]');
    const mismatch=text(p,'sampling-lab','[data-lab-comparison]');value(p,'sampling-lab','[data-lab-path]','0');const a=text(p,'sampling-lab','[data-lab-trace]');value(p,'sampling-lab','[data-lab-path]','4');const b=text(p,'sampling-lab','[data-lab-trace]');
    click(p,'sampling-lab','[data-lab-reset]');value(p,'sampling-lab','[data-lab-replacement]','no');value(p,'sampling-lab','[data-lab-prediction]','centre');click(p,'sampling-lab','[data-lab-freeze]');click(p,'sampling-lab','[data-lab-reveal]');
    const changed={comparison:text(p,'sampling-lab','[data-lab-comparison]'),count:text(p,'sampling-lab','[data-lab-count]'),state:p.lab()};assert(changed.state.history[0].prediction==='equal','history overwrote original prediction');
    const restored=await page({stored:p.stored()});const reload=restored.lab();assert(reload.history[0].prediction==='equal'&&reload.parameters.replacement===false,'reload changed identity');
    const envelope=p.api.exportState();click(p,'sampling-lab','[data-lab-reset]');p.api.importState(envelope);assert(p.lab().phase==='revealed'&&p.lab().history[0].prediction==='equal','import changed frozen comparison');
    return {input:['equal','freeze','reveal','compare AA and BB','reset','without replacement','centre','freeze','reveal','reload','export/import'],mismatch,pathComparison:[a,b],changed,reloaded:reload};
  });
  await run('G1-skip-prediction-and-closure-action-attribution',async()=>{
    const p=await page();click(p,'sampling-lab','[data-lab-skip]');const state=p.lab();const comparison=text(p,'sampling-lab','[data-lab-comparison]');const closing=summary(p);
    assert(state.prediction===null&&state.simulation.B===0&&state.selectedPath===0,'skip manufactured activity');
    return {input:['click 不预测，直接观察 once','navigate to evidence-close'],comparison,lab:state,closing,issue:closing.story.includes('你已经在实验中把一份样本映射为一个均值，再把同值的路径合并')?'Closing attributes mapping and grouping to learner although only reveal was clicked.':null};
  });
  await run('G1-reference-assisted-prediction',async()=>{
    const p=await page();p.doc.getElementById('dt-explanation-opening-scene').open=true;await tick();
    value(p,'sampling-lab','[data-lab-prediction]','centre');click(p,'sampling-lab','[data-lab-freeze]');click(p,'sampling-lab','[data-lab-reveal]');
    assert(p.lab().predictionHadReference===true,'reference assistance missing in ordinary sequence');
    return {input:['open full solution','centre','freeze','reveal'],comparison:text(p,'sampling-lab','[data-lab-comparison]'),state:p.lab(),runtimeExposure:p.state('sampling-lab').exposure};
  });
  await run('G1-equal-result-when-n-is-one',async()=>{
    const p=await page();value(p,'sampling-lab','[data-lab-n]','1');value(p,'sampling-lab','[data-lab-prediction]','equal');click(p,'sampling-lab','[data-lab-freeze]');click(p,'sampling-lab','[data-lab-reveal]');
    return {input:['n=1','equal','freeze','reveal'],comparison:text(p,'sampling-lab','[data-lab-comparison]'),issue:'Correct equality feedback still invites learner to explain “这个差异”.'};
  });
  await run('G2-error-specific-repair-assisted-correction-fresh-problem',async()=>{
    const p=await page();q(p,'mean-completion','1/9');const wrong={feedback:feedback(p,'mean-completion'),state:p.state('mean-completion')};
    navigatePath(p,'mean-completion','incorrect','mean-worked');click(p,'mean-worked',ctl('step-next'));const repairedRelation=text(p,'mean-worked','.dt-step-stage');click(p,'mean-worked',ctl('step-next'));const merged=text(p,'mean-worked','.dt-step-stage');
    p.doc.querySelector(ctl('studio-next')).click();click(p,'mean-completion',ctl('retry'));q(p,'mean-completion','2/9');const corrected={feedback:feedback(p,'mean-completion'),attempt:p.state('mean-completion').attempts.at(-1)};
    assert(corrected.attempt.assisted===true,'same-item correction lost assistance');
    navigatePath(p,'mean-completion','assisted','mean-independent');const fresh=p.state('mean-independent');assert(fresh.status==='idle'&&fresh.draft===''&&!fresh.answerRevealed,'next problem not fresh');
    return {input:['mean-completion 1/9','recommended worked example','read mapping and merging stages','return and retry 2/9','recommended independent event'],wrong,repairedRelation,merged,corrected,next:{id:p.api.getState().currentActivity,state:fresh}};
  });
  await run('G2-hint-correct-new-problem',async()=>{
    const p=await page();p.api.navigate('mean-completion');click(p,'mean-completion',ctl('hint'));q(p,'mean-completion','2/9');const response=feedback(p,'mean-completion');
    const next=navigatePath(p,'mean-completion','assisted','mean-independent');assert(!p.state(next).answerRevealed&&p.state(next).attempts.length===0,'assisted path lacks unexposed next problem');
    return {input:['hint','2/9','assisted recommendation'],response,next,prompt:lesson.activities.find(a=>a.id===next).prompt,attempt:p.state('mean-completion').attempts.at(-1)};
  });
  await run('G2-independent-correct-condition-challenge-and-ending',async()=>{
    const p=await page();q(p,'mean-independent','5/9');const independent={feedback:feedback(p,'mean-independent'),attempt:p.state('mean-independent').attempts.at(-1)};
    const change=navigatePath(p,'mean-independent','correct','mechanism-transfer');q(p,'mechanism-transfer','2/3');const mechanism={id:change,prompt:lesson.activities.find(a=>a.id===change).prompt,feedback:feedback(p,change)};
    const next=navigatePath(p,'mechanism-transfer','correct','repeated-values');q(p,'repeated-values','3/8');return {input:['5/9 independently','without-replacement recommendation','2/3','repeated values recommendation','3/8','ending'],independent,mechanism,next,prompt:lesson.activities.find(a=>a.id===next).prompt,closing:summary(p)};
  });
  await run('G2-task-skip-support-and-free-navigation',async()=>{
    const p=await page();p.api.navigate('mean-independent');click(p,'mean-independent',ctl('skip'));const response=feedback(p,'mean-independent');const next=navigatePath(p,'mean-independent','skipped','mean-worked');
    p.api.navigate('evidence-close');p.api.navigate('mean-independent');return {input:['skip independent task','choose worked example','jump ending','return skipped task'],response,next,returned:p.state('mean-independent')};
  });
  await run('G3-empty-ending-and-real-start-choices',async()=>{
    const p=await page();const closing=summary(p);click(p,'evidence-close','[data-close-review]');const recall=p.api.getState().currentActivity;assert(recall==='return-recall','empty ending dead return');p.api.navigate('evidence-close');click(p,'evidence-close','[data-close-challenge]');
    return {input:['directly navigate ending with no work','recall entry','return ending','condition challenge'],closing,recall,challenge:p.api.getState().currentActivity};
  });
  await run('G3-assisted-and-self-only-ending',async()=>{
    const p=await page();p.api.navigate('mean-completion');click(p,'mean-completion',ctl('hint'));q(p,'mean-completion','2/9');q(p,'sampling-conclusion','不同样本导致不同均值；需固定总体、样本量、放回条件与统计量。');click(p,'sampling-conclusion',ctl('self-good'));
    const closing=summary(p);assert(!closing.evidence.includes('独立客观核对通过记录'),'self/assisted upgraded to independent');
    return {input:['hint + 2/9','open explanation','self report meets criteria','ending'],closing};
  });
  await run('G3-actual-due-flashcard-return-and-next-interval',async()=>{
    const p=await page();p.api.navigate('return-recall');click(p,'return-recall',ctl('flash-flip'));click(p,'return-recall',ctl('flash-good'));const first=p.state('return-recall');const before=summary(p);
    const due=await page({stored:p.stored(),time:NOW+DAY+1});const closing=summary(due);click(due,'evidence-close','[data-close-review]');const entering={current:due.api.getState().currentActivity,card:due.state('return-recall').flash.cards['0'],solutionOpen:due.doc.getElementById('dt-explanation-recall-scene').open};assert(!entering.card.revealed&&!entering.solutionOpen,'old answer exposed at due return');
    click(due,'return-recall',ctl('flash-flip'));click(due,'return-recall',ctl('flash-good'));const after=due.state('return-recall');assert(after.flash.cards['0'].review.intervalIndex===1,'due success failed to advance');
    return {input:['first card self report','ending','reopen at +24h+1ms','click actual due review','self report'],before,firstCard:first.flash.cards['0'],closing,entering,afterCard:after.flash.cards['0'],lastAttempt:after.attempts.at(-1)};
  });
  await run('G3-early-review-does-not-advance',async()=>{
    const p=await page();q(p,'mean-independent','5/9');const closing=summary(p);click(p,'evidence-close','[data-close-review]');const entering=p.state('mean-independent');assert(!entering.answerRevealed&&entering.draft==='','early actual review did not reset input');q(p,'mean-independent','5/9');const after=p.state('mean-independent');assert(after.review.intervalIndex===0&&after.attempts.at(-1).assisted,'immediate repeat became independent delayed pass');
    return {input:['5/9','ending','early review button','5/9 again'],closing,entering,after};
  });
  await run('G3-unfinished-draft-and-pending-self-review',async()=>{
    const p=await page();q(p,'sampling-conclusion','随机样本不同，均值会变；固定总体、n、机制和统计量。');click(p,'sampling-conclusion',ctl('self-good'));summary(p);
    const next=await page({stored:p.stored(),time:NOW+DAY+1});next.api.navigate('sampling-conclusion');value(next,'sampling-conclusion',ctl('answer'),'我的下一次解释尚未写完');const draftClosing=summary(next);click(next,'evidence-close','[data-close-review]');const draftReturned=node(next,'sampling-conclusion',ctl('answer')).value;assert(draftReturned==='我的下一次解释尚未写完','return erased unfinished draft');
    click(next,'sampling-conclusion',ctl('submit'));const pendingClosing=summary(next);click(next,'evidence-close','[data-close-review]');const pendingReturned=next.state('sampling-conclusion');assert(pendingReturned.attempts.at(-1).correct===null&&pendingReturned.status==='submitted','return erased pending self-review');
    return {input:['first self-reviewed explanation','reopen at +24h+1ms','write new draft','ending','continue','submit without self-rating','ending','continue'],draftClosing,draftReturned,pendingClosing,pendingReturned};
  });
  await run('G3-import-while-at-ending-refreshes-summary-and-controls',async()=>{
    const p=await page();summary(p);const empty=p.api.exportState();const before={story:text(p,'evidence-close','[data-close-story]'),evidence:text(p,'evidence-close','[data-close-evidence]'),review:text(p,'evidence-close','[data-close-review]')};
    q(p,'mean-independent','5/9');summary(p);const completed=p.api.exportState();const withPass={evidence:text(p,'evidence-close','[data-close-evidence]'),review:text(p,'evidence-close','[data-close-review]')};
    const restoreEvents=[];p.doc.addEventListener('dt:restore',e=>restoreEvents.push({keys:Object.keys(e.detail),activityId:e.detail.activityId}));
    p.api.importState(empty);const afterEmpty={current:p.api.getState().currentActivity,evidence:text(p,'evidence-close','[data-close-evidence]'),review:text(p,'evidence-close','[data-close-review]'),attempts:p.state('mean-independent').attempts.length};
    p.api.importState(completed);const afterCompleted={current:p.api.getState().currentActivity,evidence:text(p,'evidence-close','[data-close-evidence]'),review:text(p,'evidence-close','[data-close-review]'),attempts:p.state('mean-independent').attempts.length};
    return {input:['empty ending export','5/9 independent and ending export','import empty while staying at ending','import completed while staying at ending'],before,withPass,afterEmpty,afterCompleted,restoreEvents};
  });
  for(const p of live){transcript.errors.push(...p.errors);p.dom.window.close();}
  fs.writeFileSync(path.join(__dirname,'game-html-run-01-transcript.json'),JSON.stringify(transcript,null,2)+'\n');
  console.log(JSON.stringify({cases:transcript.cases.map(c=>({name:c.name,status:c.status,error:c.error,issue:c.issue})),unhandledErrors:transcript.errors},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
