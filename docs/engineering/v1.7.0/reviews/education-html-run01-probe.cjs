'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const {JSDOM,VirtualConsole}=require(path.join(root,'repo/node_modules/jsdom'));
const html=fs.readFileSync(path.join(root,'generation/run-01/lesson.html'),'utf8');
const lesson=JSON.parse(fs.readFileSync(path.join(root,'generation/run-01/lesson.json'),'utf8'));
const NOW=1788739200000;
const logs=[];
const plain=x=>JSON.parse(JSON.stringify(x));
const pause=()=>new Promise(resolve=>setTimeout(resolve,15));
async function page({envelope,time=NOW}={}) {
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 let tick=time;
 const dom=new JSDOM(html,{url:'https://example.test/education-run01',runScripts:'dangerously',virtualConsole:vc,beforeParse(win){
  win.Date.now=()=>tick;win.HTMLElement.prototype.scrollIntoView=function(){};
  if(envelope)win.localStorage.setItem('dialoguetutor:v1:'+encodeURIComponent(lesson.lessonId)+':'+encodeURIComponent(lesson.revision),JSON.stringify(envelope));
 }});
 const win=dom.window,doc=win.document;
 await new Promise(resolve=>doc.addEventListener('dt:ready',resolve,{once:true}));
 const api=win.DialogueTutor.instance;
 const q=selector=>doc.querySelector(selector);
 const control=(id,name)=>q('[data-dt-activity="'+id+'"] [data-dt-control="'+name+'"]');
 const state=id=>plain(api.getState().activities[id]);
 const change=(selector,value)=>{const node=q(selector);assert.ok(node,selector);node.value=value;node.dispatchEvent(new win.Event('change',{bubbles:true}));};
 const click=selector=>{const node=q(selector);assert.ok(node,selector);node.click();};
 return {win,doc,api,q,control,state,change,click,errors,dom,tick(){tick++;},visible(){return [...doc.querySelectorAll('[data-dt-activity]')].filter(n=>!n.hidden&&!n.closest('[data-dt-scene]').hidden).map(n=>n.dataset.dtActivity);},text(selector){return q(selector)?.textContent;},answer(id,text){api.navigate(id);const node=control(id,'answer');node.value=text;node.dispatchEvent(new win.Event('input',{bubbles:true}));control(id,'submit').click();},choice(id,index){api.navigate(id);control(id,'choice-'+index).click();control(id,'submit').click();},finish(){assert.deepEqual(errors,[]);dom.window.close();}};
}
function note(name,input,observation){logs.push({name,input,observation});}
(async()=>{
 const p=await page();
 note('cold-start',{activityId:'sampling-lab'},{visible:p.visible(),phase:p.state('sampling-lab').exploration.phase,resultsHidden:p.q('[data-lab-results]').hidden,allFullExplanationsClosed:p.doc.querySelectorAll('.dt-scene-explanation[open]').length===0,chartCount:p.q('.lab-chart').childElementCount});
 p.change('[data-lab-prediction]','equal');p.click('[data-lab-freeze]');
 const frozen=p.state('sampling-lab').exploration;
 assert.equal(frozen.prediction,'equal');assert.equal(p.q('[data-lab-results]').hidden,true);assert.equal(p.q('[data-lab-prediction]').disabled,true);
 p.change('[data-lab-prediction]','centre');
 assert.equal(p.state('sampling-lab').exploration.prediction,'equal');
 p.click('[data-lab-reveal]');
 note('incorrect-prediction-freeze',{activityId:'sampling-lab',prediction:'equal',attemptedOverwrite:'centre'},{original:p.state('sampling-lab').exploration.prediction,comparison:p.text('[data-lab-comparison]'),table:p.text('[data-lab-table]')});
 const beforeB=p.state('sampling-lab').exploration.simulation.B;
 p.change('[data-lab-path]','2');assert.equal(p.state('sampling-lab').exploration.simulation.B,beforeB);
 p.win.Math.random=()=>0.9;p.click('[data-lab-one]');
 note('one-sample-one-statistic',{activityId:'sampling-lab',selectedPath:2,controlledRandom:0.9},{manualTrace:p.text('[data-lab-trace]'),B:p.state('sampling-lab').exploration.simulation.B,last:p.text('[data-lab-last]'),counts:p.state('sampling-lab').exploration.simulation.counts});
 const exported=p.api.exportState();
 p.click('[data-lab-reset]');p.change('[data-lab-n]','1');p.change('[data-lab-prediction]','equal');p.click('[data-lab-freeze]');p.click('[data-lab-reveal]');
 note('correct-prediction-and-history',{activityId:'sampling-lab',n:1,prediction:'equal'},{history:p.state('sampling-lab').exploration.history.map(h=>({prediction:h.prediction,n:h.parameters.n})),comparison:p.text('[data-lab-comparison]')});
 p.api.importState(exported);assert.equal(p.state('sampling-lab').exploration.prediction,'equal');assert.equal(p.state('sampling-lab').exploration.parameters.n,2);
 const reload=await page({envelope:exported});
 note('export-import-reload',{activityId:'sampling-lab'},{imported:p.state('sampling-lab').exploration,reloaded:reload.state('sampling-lab').exploration});reload.finish();p.finish();

 const reference=await page();const beforeReference=reference.api.exportState();
 reference.q('#dt-explanation-opening-scene').open=true;await pause();
 note('reference-before-import',{activityId:'sampling-lab',action:'open complete explanation'},{widget:reference.state('sampling-lab').exploration.referenceViewed,runtimeExposure:reference.state('sampling-lab').exposure,open:reference.q('#dt-explanation-opening-scene').open});
 reference.api.importState(beforeReference);
 reference.change('[data-lab-prediction]','centre');reference.click('[data-lab-freeze]');reference.click('[data-lab-reveal]');
 note('older-import-after-reference',{activityId:'sampling-lab',action:'import own earlier no-reference envelope, then freeze centre'},{widget:reference.state('sampling-lab').exploration.referenceViewed,predictionHadReference:reference.state('sampling-lab').exploration.predictionHadReference,runtimeExposure:reference.state('sampling-lab').exposure,comparison:reference.text('[data-lab-comparison]'),referenceText:reference.text('[data-lab-reference]'),solutionStillOpen:reference.q('#dt-explanation-opening-scene').open});reference.finish();

 for(const outcome of ['incorrect','assisted','correct','skipped']){
  const flow=await page();flow.api.navigate('mean-completion');
  if(outcome==='skipped')flow.control('mean-completion','skip').click();
  else{if(outcome==='assisted')flow.control('mean-completion','hint').click();flow.answer('mean-completion',outcome==='incorrect'?'1/9':'2/9');}
  const rec=plain(flow.api.getRecommendations('mean-completion'));
  const feedback=flow.doc.querySelector('[data-dt-activity="mean-completion"]').textContent;
  flow.control('mean-completion','pathway-'+outcome+'-'+rec[0].to).click();
  note('completion-'+outcome,{activityId:'mean-completion',answer:outcome==='skipped'?null:outcome==='incorrect'?'1/9':'2/9',hint:outcome==='assisted',skip:outcome==='skipped'},{attempts:flow.state('mean-completion').attempts,recommendations:rec,arrived:flow.visible(),feedback});flow.finish();
 }
 const program=await page();program.api.navigate('mean-worked');
 for(let i=0;i<3;i++)program.control('mean-worked','step-next').click();
 program.answer('mean-completion','2/9');program.answer('mean-independent','5/9');
 program.answer('max-distribution','T=1:1/9; T=3:1/3; T=7:5/9. Nine ordered pairs each have probability 1/9; group by maximum, or subtract cumulative probabilities; total=1.');program.control('max-distribution','self-good').click();
 program.answer('mechanism-transfer','2/3');program.answer('repeated-values','3/8');
 note('worked-completion-independent-transfer',{activities:['mean-worked','mean-completion','mean-independent','max-distribution','mechanism-transfer','repeated-values']},{workedAttempts:program.state('mean-worked').attempts,attempts:Object.fromEntries(['mean-completion','mean-independent','max-distribution','mechanism-transfer','repeated-values'].map(id=>[id,program.state(id).attempts]))});
 program.api.navigate('evidence-close');note('ending-independent-and-self',{activityId:'evidence-close'},{story:program.text('[data-close-story]'),evidence:program.text('[data-close-evidence]'),review:program.text('[data-close-review]'),note:program.text('[data-close-review-note]')});program.finish();

 const direct=await page();direct.api.navigate('evidence-close');note('ending-direct',{activityId:'evidence-close'},{story:direct.text('[data-close-story]'),evidence:direct.text('[data-close-evidence]'),review:direct.text('[data-close-review]')});direct.api.navigate('sampling-lab');direct.click('[data-lab-skip]');direct.api.navigate('evidence-close');note('ending-reveal-only',{activityId:'sampling-lab',action:'click 不预测，直接观察 then navigate evidence-close'},{labState:direct.state('sampling-lab').exploration,story:direct.text('[data-close-story]'),evidence:direct.text('[data-close-evidence]')});direct.finish();

 const assisted=await page();assisted.api.navigate('mean-independent');assisted.q('#dt-explanation-independent-scene').open=true;await pause();assisted.answer('mean-independent','5/9');assisted.answer('statistic-explain','R=7 and is a statistic. Q needs unknown mu.');assisted.control('statistic-explain','self-good').click();assisted.api.navigate('evidence-close');
 note('ending-assisted-and-self',{activityId:'evidence-close'},{evidence:assisted.text('[data-close-evidence]'),attempt:assisted.state('mean-independent').attempts});assisted.finish();

 const cards=await page();cards.api.navigate('return-recall');cards.q('#dt-explanation-recall-scene').open=true;cards.control('return-recall','flash-flip').click();cards.control('return-recall','flash-good').click();await pause();
 note('linked-flashcards',{activityId:'return-recall',action:'open linked full explanation before first flip'},{attempt:cards.state('return-recall').attempts[0],exposure:cards.state('return-recall').exposure});
 const cardExport=cards.api.exportState();cards.finish();
 const due=await page({envelope:cardExport,time:NOW+86400001});due.api.navigate('evidence-close');const reviewLabel=due.text('[data-close-review]');due.click('[data-close-review]');
 note('real-ending-due-return',{activityId:'evidence-close',controlledTime:NOW+86400001},{label:reviewLabel,arrived:due.visible(),referenceOpen:due.q('#dt-explanation-recall-scene').open,cardRevealed:due.state('return-recall').flash.cards['0'].revealed,history:due.state('return-recall').attempts.length});due.finish();
 fs.writeFileSync(path.join(__dirname,'education-html-run01-log.json'),JSON.stringify({artifact:lesson.lessonId,revision:lesson.revision,method:'Independent jsdom operations; controlled time/random where noted; no learner outcome claims',observations:logs},null,2)+'\n');
 console.log(JSON.stringify({observations:logs.length,log:'reviews/education-html-run01-log.json',highlight:logs.filter(x=>['older-import-after-reference','ending-reveal-only','linked-flashcards','real-ending-due-return'].includes(x.name))},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
