const fs = require('fs');
const assert = require('assert/strict');
const { JSDOM, VirtualConsole } = require('/workspace/scratch/b4c4b2db70f4/repo/node_modules/jsdom');
const html = fs.readFileSync(__dirname + '/lesson.html', 'utf8');
const logs = [], errors = [];
const wait = () => new Promise(resolve => setTimeout(resolve, 12));
async function fresh(storage) {
  const vc = new VirtualConsole(); vc.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://dialoguetutor.local/lesson.html', virtualConsole: vc,
    beforeParse(window) { if (storage) Object.entries(storage).forEach(([key,value]) => window.localStorage.setItem(key,value)); }
  });
  await wait(); return dom;
}
const check = (name, assertion, details) => { assertion(); logs.push({name,result:'PASS',details:details||null}); };
function activity(dom,id) { return dom.window.document.getElementById('dt-activity-'+id); }
function state(dom,id) { return dom.window.DialogueTutor.instance.getState().activities[id]; }
function control(dom,id,key) { return activity(dom,id).querySelector('[data-dt-control="'+key+'"]'); }
function change(dom,node,value) { node.value=value; node.dispatchEvent(new dom.window.Event('change',{bubbles:true})); }
function enter(dom,id,value) { const input=control(dom,id,'answer'); input.value=value; input.dispatchEvent(new dom.window.Event('input',{bubbles:true})); }
function submit(dom,id) { activity(dom,id).querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})); }
function pick(dom,id,value) { const input=activity(dom,id).querySelector('input[value="'+value+'"]'); input.checked=true; input.dispatchEvent(new dom.window.Event('change',{bubbles:true})); }
function click(dom,id,key) { const button=control(dom,id,key); assert(button, 'missing control '+id+':'+key); assert(!button.disabled,'disabled control '+id+':'+key); button.click(); }
function lab(dom,selector) { return activity(dom,'sampling-lab').querySelector(selector); }

(async () => {
  const dom=await fresh(), win=dom.window, instance=win.DialogueTutor.instance, doc=win.document;
  check('initial studio mounts and closed full solutions',()=>{assert.equal(doc.querySelectorAll('[data-dt-mounted]').length,17);assert.equal(doc.querySelectorAll('.dt-scene:not([hidden])').length,1);assert.equal(doc.querySelectorAll('[data-dt-solution][open]').length,0);});
  check('prediction result absent before submission',()=>{assert.equal(lab(dom,'[data-lab-results]').hidden,true);assert.equal(lab(dom,'.lab-chart').childElementCount,0);assert.equal(lab(dom,'[data-lab-comparison]').textContent,'');assert.equal(lab(dom,'[data-lab-freeze]').disabled,true);});
  change(dom,lab(dom,'[data-lab-prediction]'),'equal');
  check('draft records an ungraded prediction only',()=>{assert.equal(state(dom,'sampling-lab').exploration.predictionDraft,'equal');assert.equal(state(dom,'sampling-lab').attempts.length,0);assert.equal(state(dom,'sampling-lab').exploration.phase,'draft');});
  lab(dom,'[data-lab-freeze]').click();
  const predictionAt=state(dom,'sampling-lab').exploration.predictionAt;
  check('prediction freezes before reveal',()=>{assert.equal(state(dom,'sampling-lab').exploration.prediction,'equal');assert.equal(lab(dom,'[data-lab-n]').disabled,true);assert.equal(lab(dom,'[data-lab-prediction]').disabled,true);assert.equal(lab(dom,'[data-lab-results]').hidden,true);assert(predictionAt>0);});
  lab(dom,'[data-lab-reveal]').click();
  check('mismatching prediction receives concrete enumeration evidence',()=>{assert.match(lab(dom,'[data-lab-comparison]').textContent,/1\/3/);assert.match(lab(dom,'[data-lab-comparison]').textContent,/1\/9/);assert.match(lab(dom,'[data-lab-comparison]').textContent,/不同/);assert.equal(lab(dom,'[data-lab-path]').options.length,9);assert.equal(lab(dom,'[data-lab-table]').children.length,5);assert.equal(lab(dom,'svg').getAttribute('role'),'img');});
  let calls=0;win.Math.random=()=>[0.1,0.9][calls++%2];lab(dom,'[data-lab-one]').click();
  check('one random sample produces one statistic observation',()=>{const x=state(dom,'sampling-lab').exploration;assert.equal(x.simulation.B,1);assert.deepEqual(Array.from(x.simulation.last.sample),[0,2]);assert.equal(x.simulation.last.sum,6);assert.equal(x.simulation.counts['6'],1);});
  change(dom,lab(dom,'[data-lab-path]'),'7');
  check('manual path selection never changes simulated frequency denominator',()=>{assert.equal(state(dom,'sampling-lab').exploration.simulation.B,1);assert.match(lab(dom,'[data-lab-trace]').textContent,/非随机/);});
  win.Math.random=()=>0.4;lab(dom,'[data-lab-many]').click();
  check('repeat count differs from sample size',()=>{const x=state(dom,'sampling-lab').exploration;assert.equal(x.parameters.n,2);assert.equal(x.simulation.B,21);assert.equal(Object.values(x.simulation.counts).reduce((a,b)=>a+b,0),21);});
  const envelope=instance.exportState();
  const restored=await fresh();restored.window.DialogueTutor.instance.importState(envelope);await wait();
  check('export and import restores graph, locked prediction and simulation',()=>{assert.equal(state(restored,'sampling-lab').exploration.predictionAt,predictionAt);assert.equal(lab(restored,'[data-lab-prediction]').disabled,true);assert.equal(lab(restored,'[data-lab-path]').value,'7');assert.equal(lab(restored,'[data-lab-results]').hidden,false);assert.equal(state(restored,'sampling-lab').exploration.simulation.B,21);assert.equal(state(restored,'sampling-lab').explorationCount,state(dom,'sampling-lab').explorationCount);});
  const storeKey=instance.storageKey;const refreshed=await fresh({[storeKey]:win.localStorage.getItem(storeKey)});
  check('browser-storage reload restores custom exploration',()=>{assert.equal(state(refreshed,'sampling-lab').exploration.phase,'revealed');assert.equal(state(refreshed,'sampling-lab').exploration.simulation.B,21);assert.equal(lab(refreshed,'[data-lab-prediction]').value,'equal');});
  lab(dom,'[data-lab-reset]').click();change(dom,lab(dom,'[data-lab-n]'),'1');change(dom,lab(dom,'[data-lab-replacement]'),'no');change(dom,lab(dom,'[data-lab-prediction]'),'equal');lab(dom,'[data-lab-freeze]').click();lab(dom,'[data-lab-reveal]').click();
  check('new parameters preserve original prediction history and match a different result',()=>{const x=state(dom,'sampling-lab').exploration;assert.equal(x.history.length,1);assert.equal(x.history[0].predictionAt,predictionAt);assert.equal(x.history[0].parameters.n,2);assert.equal(x.parameters.n,1);assert.equal(x.parameters.replacement,false);assert.match(lab(dom,'[data-lab-comparison]').textContent,/一致/);assert.equal(lab(dom,'[data-lab-path]').options.length,3);});
  lab(dom,'[data-lab-reset]').click();change(dom,lab(dom,'[data-lab-n]'),'3');lab(dom,'[data-lab-skip]').click();
  check('skip-prediction route has no fabricated prior belief',()=>{const x=state(dom,'sampling-lab').exploration;assert.equal(x.prediction,null);assert.equal(x.predictionAt,null);assert.match(lab(dom,'[data-lab-phase]').textContent,/未提交预测/);assert.match(lab(dom,'[data-lab-comparison]').textContent,/尚无预测可比较/);assert.equal(lab(dom,'[data-lab-path]').options.length,6);assert.equal(lab(dom,'[data-lab-table]').children.length,1);});
  doc.getElementById('dt-explanation-opening-scene').open=true;await wait();lab(dom,'[data-lab-reset]').click();change(dom,lab(dom,'[data-lab-prediction]'),'centre');lab(dom,'[data-lab-freeze]').click();lab(dom,'[data-lab-reveal]').click();
  check('viewing full reference is retained in later prediction',()=>{assert.equal(state(dom,'sampling-lab').answerRevealed,true);assert.equal(state(dom,'sampling-lab').exploration.predictionHadReference,true);assert.match(lab(dom,'[data-lab-comparison]').textContent,/提交该判断前已看过参考/);});
  instance.navigate('population-check');pick(dom,'population-check','frame');
  check('choice selection alone does not reveal correctness',()=>{assert.equal(state(dom,'population-check').attempts.length,0);assert.equal(activity(dom,'population-check').querySelector('.dt-reference'),null);});
  submit(dom,'population-check');
  check('wrong choice leads to a named repair with actual feedback',()=>{assert.equal(state(dom,'population-check').attempts[0].correct,false);assert.match(activity(dom,'population-check').textContent,/对换/);assert.equal(instance.getRecommendations('population-check')[0].to,'frame-repair');});
  instance.navigate('mean-completion');enter(dom,'mean-completion','1/9');submit(dom,'mean-completion');const firstReview=state(dom,'mean-completion').review.dueAt;submit(dom,'mean-completion');
  check('duplicate submission makes no second attempt',()=>assert.equal(state(dom,'mean-completion').attempts.length,1));
  click(dom,'mean-completion','retry');enter(dom,'mean-completion','2/9');submit(dom,'mean-completion');
  check('retry after feedback remains assisted and does not advance interval',()=>{const s=state(dom,'mean-completion');assert.equal(s.attempts.length,2);assert.equal(s.attempts[1].correct,true);assert.equal(s.attempts[1].assisted,true);assert.equal(s.review.intervalIndex,0);assert(s.review.dueAt>=firstReview);assert.equal(instance.getRecommendations('mean-completion')[0].to,'mean-independent');});
  instance.navigate('mean-independent');enter(dom,'mean-independent','5/9');submit(dom,'mean-independent');
  check('independent new numerical result is correctly labelled',()=>{assert.equal(state(dom,'mean-independent').attempts[0].correct,true);assert.equal(state(dom,'mean-independent').attempts[0].assisted,false);assert.equal(instance.getRecommendations('mean-independent')[0].to,'mechanism-transfer');});
  instance.navigate('mechanism-transfer');click(dom,'mechanism-transfer','hint');enter(dom,'mechanism-transfer','2/3');submit(dom,'mechanism-transfer');
  check('hint before correct submission stays assisted',()=>{assert.equal(state(dom,'mechanism-transfer').attempts[0].assisted,true);assert.equal(state(dom,'mechanism-transfer').attempts[0].correct,true);assert.equal(instance.getRecommendations('mechanism-transfer')[0].on,'assisted');});
  instance.navigate('repeated-values');doc.getElementById('dt-explanation-repeated-scene').open=true;enter(dom,'repeated-values','3/8');submit(dom,'repeated-values');
  check('full-solution exposure is captured even before native toggle fires',()=>assert.equal(state(dom,'repeated-values').attempts[0].assisted,true));
  instance.navigate('frame-repair');const own='总体800次借阅；补齐150次纸本，不能判断方向。';enter(dom,'frame-repair',own);submit(dom,'frame-repair');
  check('open response is saved before self-assessment',()=>{const attempt=state(dom,'frame-repair').attempts[0];assert.equal(attempt.answer,own);assert.equal(attempt.source,'self');assert.equal(attempt.correct,null);});
  click(dom,'frame-repair','self-good');
  check('positive self-report never becomes independent objective success',()=>{assert.equal(state(dom,'frame-repair').attempts[0].source,'self');assert.equal(win.DialogueTutor.pathwayOutcome(JSON.parse(doc.getElementById('dt-lesson').textContent).activities.find(a=>a.id==='frame-repair'),state(dom,'frame-repair')),null);});
  instance.navigate('survey-justify');click(dom,'survey-justify','skip');
  check('skip has no incorrect attempt',()=>{assert.equal(state(dom,'survey-justify').status,'skipped');assert.equal(state(dom,'survey-justify').attempts.length,0);});
  instance.navigate('mean-worked');click(dom,'mean-worked','step-next');click(dom,'mean-worked','step-next');click(dom,'mean-worked','step-prev');check('step forward and back restore correct stage',()=>assert.equal(state(dom,'mean-worked').stepIndex,1));click(dom,'mean-worked','step-reset');check('step reset is exploration only',()=>{assert.equal(state(dom,'mean-worked').stepIndex,0);assert.equal(state(dom,'mean-worked').attempts.length,0);});
  instance.navigate('return-recall');check('flashcard front has no self-grade before revealing',()=>assert.equal(control(dom,'return-recall','flash-good'),null));click(dom,'return-recall','flash-flip');click(dom,'return-recall','flash-good');const originalDue=state(dom,'return-recall').flash.cards['0'].review.dueAt;
  check('flashcard self-report is distinct from objective evidence',()=>{assert.equal(state(dom,'return-recall').attempts[0].source,'self');assert.equal(state(dom,'return-recall').attempts[0].assisted,false);});
  click(dom,'return-recall','flash-next');click(dom,'return-recall','flash-hint');click(dom,'return-recall','flash-flip');click(dom,'return-recall','flash-good');click(dom,'return-recall','flash-prev');
  check('flashcard hint and navigation persist card-specific state',()=>{assert.equal(state(dom,'return-recall').flash.index,0);assert.equal(state(dom,'return-recall').attempts[1].assisted,true);});
  instance.navigate('evidence-close');
  check('closure reports real records and offers actual next actions',()=>{const text=activity(dom,'evidence-close').textContent;assert.match(text,/有独立客观核对通过记录/);assert.match(text,/有辅助尝试/);assert.match(text,/有自评记录/);assert.match(text,/提前练习/);assert(!activity(dom,'evidence-close').querySelector('[data-close-review]').textContent.startsWith('到期'));});
  activity(dom,'evidence-close').querySelector('[data-close-review]').click();
  check('early review entry closes old answer and preserves history',()=>{const s=state(dom,'return-recall');assert.equal(instance.getState().currentActivity,'return-recall');assert.equal(s.flash.cards[String(s.flash.index)].revealed,false);assert.equal(s.attempts.length,2);assert.equal(s.flash.cards['0'].review.dueAt,originalDue);});
  instance.navigate('mean-independent');const note=activity(dom,'mean-independent').querySelector('.dt-note textarea');note.value='门槛包含等号；先检查和≥10。';note.dispatchEvent(new win.Event('input',{bubbles:true}));click(dom,'mean-independent','bookmark');click(dom,'mean-independent','copy-context');await wait();
  check('notes bookmarks and context copy use actual question state',()=>{assert.equal(state(dom,'mean-independent').bookmarked,true);assert.match(state(dom,'mean-independent').notes,/等号/);assert.match(activity(dom,'mean-independent').querySelector('.dt-copy-fallback').value,/门槛包含等号/);});
  const export2=instance.exportState();const restored2=await fresh();restored2.window.DialogueTutor.instance.importState(export2);await wait();
  check('import retains attempts, original answer, notes and bookmarks',()=>{assert.equal(state(restored2,'mean-independent').notes,state(dom,'mean-independent').notes);assert.equal(state(restored2,'mean-independent').bookmarked,true);assert.equal(state(restored2,'frame-repair').attempts[0].answer,own);assert.equal(state(restored2,'mean-completion').attempts.length,2);});
  const bad=JSON.parse(JSON.stringify(export2));bad.revision='another-question-set';check('different revision is rejected',()=>assert.throws(()=>restored2.window.DialogueTutor.instance.importState(bad)));
  const freshClose=await fresh();freshClose.window.DialogueTutor.instance.navigate('evidence-close');
  check('fresh closure invents no achievement or due review',()=>{const text=activity(freshClose,'evidence-close').textContent;assert.match(text,/尚无作答证据/);assert.match(text,/尚无复习记录/);assert(!text.includes('有独立客观核对通过记录'));assert.match(activity(freshClose,'evidence-close').querySelector('[data-close-review]').textContent,/建立回访入口/);});
  check('all generated MathML and SVG text use rendered-markup structures',()=>{assert(doc.querySelectorAll('math').length>5);assert.equal(lab(dom,'svg').querySelector('text').getAttribute('fill'),'var(--dt-ink)');assert.equal(new Set([...doc.querySelectorAll('[id]')].map(n=>n.id)).size,doc.querySelectorAll('[id]').length);});
  check('no jsdom runtime errors observed',()=>assert.deepEqual(errors,[]));
  [dom,restored,refreshed,restored2,freshClose].forEach(d=>d.window.close());
  fs.writeFileSync(__dirname+'/dom-checks.json',JSON.stringify({environment:'Node '+process.version+'; jsdom '+require('/workspace/scratch/b4c4b2db70f4/repo/node_modules/jsdom/package.json').version,scope:'Real generated HTML executed in a DOM environment. No rendered-browser layout, screenshot, actual font size or visual contrast claims.',tests:logs,errorMessages:errors,status:'PASS'},null,2)+'\n');
  console.log(JSON.stringify({status:'PASS',tests:logs.length,errors:errors.length}));
})().catch(error=>{fs.writeFileSync(__dirname+'/dom-checks.json',JSON.stringify({status:'FAIL',completed:logs,error:String(error.stack),errorMessages:errors},null,2)+'\n');console.error(error);process.exitCode=1;});
