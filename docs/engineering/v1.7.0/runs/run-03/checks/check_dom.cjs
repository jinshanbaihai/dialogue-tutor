'use strict';
// Scripted evaluator operations, not real learners or learning-outcome data.
const fs=require('fs'), path=require('path'), assert=require('assert');
const {JSDOM,VirtualConsole}=require('/workspace/scratch/b4c4b2db70f4/repo/node_modules/jsdom');
const root=path.resolve(__dirname,'..'), html=fs.readFileSync(path.join(root,'lesson.html'),'utf8');
const lessonSource=JSON.parse(fs.readFileSync(path.join(root,'lesson.json'),'utf8'));
const oracle=JSON.parse(fs.readFileSync(path.join(root,'records/math-check.json'),'utf8'));
const log={kind:'scripted DOM evaluator on actual assembled lesson.html; no browser rendering or learner-effect claim',scenarios:[]};
let activeScenario;
function record(action,input,output){activeScenario.events.push({action,input,output});}
function equal(actual,expected,message){assert.deepStrictEqual(actual,expected,message);}
const wait=()=>new Promise(resolve=>setTimeout(resolve,0));
async function page(envelope){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://run03-evaluator.invalid/lesson.html',virtualConsole:vc,beforeParse(w){
    w.HTMLElement.prototype.scrollIntoView=function(){};
    if(envelope)w.localStorage.setItem('dialoguetutor:v1:'+encodeURIComponent(lessonSource.lessonId)+':'+encodeURIComponent(lessonSource.revision),JSON.stringify(envelope));
  }});
  await new Promise(resolve=>dom.window.document.addEventListener('DOMContentLoaded',resolve,{once:true}));await wait();
  assert(dom.window.DialogueTutor.instance,'Runtime mounted');assert.equal(errors.length,0,errors.join('\n'));
  return {dom,w:dom.window,d:dom.window.document,i:dom.window.DialogueTutor.instance,errors};
}
function click(p,selector){const el=p.d.querySelector(selector);assert(el,selector);assert(!el.disabled,selector+' disabled');el.click();}
function change(p,selector,value){const el=p.d.querySelector(selector);assert(el,selector);el.value=value;el.dispatchEvent(new p.w.Event('change',{bubbles:true}));}
function input(p,selector,value){const el=p.d.querySelector(selector);assert(el,selector);el.value=value;el.dispatchEvent(new p.w.Event('input',{bubbles:true}));}
const a=(id,s)=>`#dt-activity-${id} ${s}`;
const lab=p=>p.i.getState().activities['sample-lab'].exploration;
const metrics=p=>{const s=p.i.getState().activities['sample-lab'];return {explorationCount:s.explorationCount,attempts:s.attempts.length,participated:s.participated,lastInteractionAt:s.lastInteractionAt};};
const clone=v=>JSON.parse(JSON.stringify(v));
function freeze(p,prediction){change(p,`input[name="r3-prediction"][value="${prediction}"]`,prediction);click(p,'#r3-freeze');}
function submit(p,id,value){p.i.navigate(id);input(p,a(id,'[data-dt-control="answer"]'),value);click(p,a(id,'[data-dt-control="submit"]'));}
async function scenario(name,fn){activeScenario={name,events:[]};log.scenarios.push(activeScenario);try{await fn();activeScenario.status='PASS';}catch(error){activeScenario.status='FAIL';activeScenario.error=error.stack;throw error;}}

(async()=>{
 await scenario('initialization adds no learner activity',async()=>{const p=await page();
   equal(metrics(p),{explorationCount:0,attempts:0,participated:false,lastInteractionAt:null});
   equal(lab(p).phase,'draft');assert(p.d.querySelector('#r3-results').hidden);assert(p.d.querySelector('#r3-freeze').disabled);
   assert([...p.d.querySelectorAll('details[data-dt-solution]')].every(x=>!x.open));
   assert(p.d.querySelector('#r3-path-table').textContent==='');
   record('open fresh lesson',null,{metrics:metrics(p),lab:lab(p),hiddenResults:true});p.dom.window.close();
 });
 await scenario('prediction freezes before reveal; correct, wrong and equal narratives',async()=>{
   for(const [prediction,threshold,expected] of [['greater','5','一致'],['less','5','不一致'],['equal','6','一致']]){
     const p=await page();p.i.navigate('sample-lab');if(threshold!=='5')change(p,'#r3-threshold',threshold);
     freeze(p,prediction);const frozen=clone(lab(p));assert(p.d.querySelector('#r3-results').hidden);assert(p.d.querySelector('input[name="r3-prediction"]').disabled);
     click(p,'#r3-reveal');equal(lab(p).predictionAt,frozen.predictionAt);equal(lab(p).prediction,prediction);equal(lab(p).predictionHadReference,false);
     assert(p.d.querySelector('#r3-prediction-response').textContent.includes(expected));equal(p.i.getState().activities['sample-lab'].attempts.length,0);
     record('freeze then reveal',{prediction,threshold},{frozen,output:p.d.querySelector('#r3-comparison').textContent,response:p.d.querySelector('#r3-prediction-response').textContent,metrics:metrics(p)});p.dom.window.close();
   }
 });
 await scenario('all 12 model conditions match independent exact oracle',async()=>{const p=await page();p.i.navigate('sample-lab');
   for(const entry of oracle.lab){const v=entry.parameters;change(p,'#r3-n',String(v.n));change(p,'#r3-mechanism',v.mechanism);change(p,'#r3-threshold',String(v.threshold));click(p,'#r3-direct');
     const result=p.w.R3Sampling.enumerate(v),fr=p.w.R3Sampling.fraction(result.eventCount,result.total);
     equal(fr,entry.probability.includes('/')?entry.probability:entry.probability+'/1');equal(result.relation,entry.relation);
     equal(result.paths.length,entry.orderedSamples.length);assert(p.d.querySelector('#r3-total').textContent.includes('=1'));
     const actualDistribution=Object.fromEntries(result.groups.map(g=>[String(g.value),p.w.R3Sampling.fraction(g.count,result.total).replace(/\/1$/,'')]));
     equal(actualDistribution,entry.distribution);
     record('change conditions and directly reveal',v,{comparison:p.d.querySelector('#r3-comparison').textContent,total:p.d.querySelector('#r3-total').textContent,distribution:p.d.querySelector('#r3-path-table').textContent});
   }p.dom.window.close();
 });
 await scenario('direct reveal is not personal calculation; same condition contact persists',async()=>{const p=await page();p.i.navigate('sample-lab');click(p,'#r3-direct');
   equal(lab(p).prediction,null);equal(lab(p).pathSelections.length,0);p.i.navigate('evidence-close');
   const text=p.d.querySelector('#r3-close-loop').textContent;assert(text.includes('未提交预测'));assert(text.includes('没有主动选择路径'));
   record('direct reveal then close',null,{text,lab:lab(p)});
   p.i.navigate('sample-lab');click(p,'#r3-new');freeze(p,'greater');equal(lab(p).predictionHadResult,true);equal(lab(p).predictionHadReference,false);
   const old=clone(lab(p));click(p,'#r3-reveal');change(p,'#r3-threshold','8');freeze(p,'less');equal(lab(p).predictionHadResult,false);
   assert(lab(p).history.some(x=>x.predictionAt===old.predictionAt&&x.prediction==='greater'));
   click(p,'#r3-reveal');change(p,'#r3-path-select','2');equal(lab(p).pathSelections.length,1);p.i.navigate('evidence-close');
   assert(p.d.querySelector('#r3-close-loop').textContent.includes('1 次主动选择'));
   record('same condition then new threshold then path selection',{same:'5',changed:'8',path:2},{state:lab(p),close:p.d.querySelector('#r3-close-loop').textContent});p.dom.window.close();
 });
 await scenario('full explanation synchronous contact; after-prediction exposure never rewrites snapshot',async()=>{const p=await page();p.i.navigate('sample-lab');freeze(p,'greater');const frozen=clone(lab(p));
   p.d.querySelector('#dt-explanation-lab').open=true;await wait();equal(lab(p).predictionHadReference,false);equal(lab(p).predictionAt,frozen.predictionAt);assert(lab(p).referenceViewed);
   click(p,'#r3-reveal');click(p,'#r3-new');freeze(p,'greater');assert(lab(p).predictionHadReference);equal(lab(p).history[0].predictionHadReference,false);
   record('freeze, then read reference, then new prediction',null,{first:frozen,latest:lab(p)});p.dom.window.close();
   const q=await page();q.d.querySelector('#dt-explanation-lab').open=true;freeze(q,'greater');assert(lab(q).predictionHadReference);
   record('open full explanation and immediately freeze before toggle delivery',null,{latest:lab(q)});q.dom.window.close();
 });
 await scenario('reference then direct observation uses honest tense',async()=>{const p=await page();p.d.querySelector('#dt-explanation-lab').open=true;await wait();click(p,'#r3-direct');p.i.navigate('evidence-close');
   const close=p.d.querySelector('#r3-close-loop').textContent;assert(close.includes('未提交预测'));assert(!close.includes('首次观察'));assert(close.includes('揭示结果前已查看实验全解'));assert(lab(p).referenceViewed);
   record('read reference then directly reveal then close',null,{close,lab:lab(p)});p.dom.window.close();
 });
 await scenario('old import keeps page reference; immediate export and refresh preserve merge without participation',async()=>{const p=await page();const old=p.i.exportState();
   p.d.querySelector('#dt-explanation-lab').open=true;await wait();p.d.querySelector('#dt-explanation-lab').open=false;await wait();const before=metrics(p);p.i.importState(old);const immediate=p.i.exportState();
   assert(lab(p).referenceViewed);equal(metrics(p).explorationCount,old.state.activities['sample-lab'].explorationCount);equal(metrics(p).attempts,0);
   assert(immediate.state.activities['sample-lab'].exploration.referenceViewed);const importedMetrics=metrics(p);
   record('read full solution, import earlier snapshot, export immediately',{oldMetrics:old.state.activities['sample-lab'],before},{after:importedMetrics,merged:immediate.state.activities['sample-lab'].exploration});
   fs.writeFileSync(path.join(root,'records/reference-merged-immediate-export.json'),JSON.stringify(immediate,null,2));p.dom.window.close();
   const q=await page(immediate);assert(lab(q).referenceViewed);equal(metrics(q),importedMetrics);freeze(q,'greater');assert(lab(q).predictionHadReference);
   record('reload from actual immediate export then submit new prediction',null,{metrics:metrics(q),prediction:lab(q)});q.dom.window.close();
 });
 await scenario('old import keeps result identities and frozen history without new observation',async()=>{const p=await page();const old=p.i.exportState();freeze(p,'less');click(p,'#r3-reveal');const submitted=clone(lab(p));
   p.i.importState(old);equal(lab(p).phase,'draft');assert(lab(p).resultContacts.length===1);assert(lab(p).history.some(x=>x.predictionAt===submitted.predictionAt&&x.prediction==='less'));
   const immediate=p.i.exportState();equal(metrics(p).explorationCount,0);equal(metrics(p).participated,false);equal(metrics(p).lastInteractionAt,null);
   fs.writeFileSync(path.join(root,'records/result-merged-immediate-export.json'),JSON.stringify(immediate,null,2));
   record('predict and reveal, import older blank, export immediately',null,{metrics:metrics(p),merged:lab(p)});p.dom.window.close();
   const q=await page(immediate);equal(metrics(q).explorationCount,0);freeze(q,'greater');assert(lab(q).predictionHadResult);assert(!lab(q).predictionHadReference);
   record('reload actual merged export and predict same condition',null,lab(q));q.dom.window.close();
 });
 await scenario('objective errors, hint, assisted retry, skip and distinct pathways',async()=>{const p=await page();
   submit(p,'distribution-completion','1/9');let saved=p.i.getState().activities['distribution-completion'];equal(saved.attempts[0].correct,false);equal(saved.attempts[0].assisted,false);
   equal(p.i.getRecommendations('distribution-completion')[0].to,'worked-distribution');const firstDue=saved.review.dueAt;
   const locked=p.d.querySelector(a('distribution-completion','[data-dt-control="submit"]'));assert(locked.disabled);locked.click();equal(p.i.getState().activities['distribution-completion'].attempts.length,1);
   click(p,a('distribution-completion','[data-dt-control="retry"]'));click(p,a('distribution-completion','[data-dt-control="hint"]'));submit(p,'distribution-completion','1/3');saved=p.i.getState().activities['distribution-completion'];
   assert(saved.attempts[1].assisted);equal(saved.attempts[1].correct,true);equal(saved.review.intervalIndex,0);equal(p.i.getRecommendations('distribution-completion')[0].to,'distribution-independent');
   p.i.navigate('distribution-probability');click(p,a('distribution-probability','[data-dt-control="skip"]'));equal(p.i.getState().activities['distribution-probability'].attempts.length,0);equal(p.i.getRecommendations('distribution-probability')[0].to,'distribution-completion');
   record('incorrect, duplicate submit, retry with hint, correct, skip',{wrong:'1/9',right:'1/3'},{completion:saved,firstDue,skip:p.i.getState().activities['distribution-probability']});p.dom.window.close();
   const q=await page();submit(q,'distribution-probability','4/9');equal(q.i.getRecommendations('distribution-probability')[0].to,'evidence-close');assert(!q.i.getState().activities['distribution-probability'].attempts[0].assisted);
   record('fresh independent numeric pass','4/9',q.i.getState().activities['distribution-probability']);q.dom.window.close();
 });
 await scenario('open raw answer and self assessment stay separate',async()=>{const p=await page();const raw='M=1,4,9；概率1/9,1/3,5/9。9条等可能有序样本按最大值合并，一次M=9不是全部分布。';
   submit(p,'distribution-independent',raw);let s=p.i.getState().activities['distribution-independent'];equal(s.attempts[0].answer,raw);equal(s.attempts[0].correct,null);equal(s.attempts[0].source,'self');
   click(p,a('distribution-independent','[data-dt-control="self-good"]'));s=p.i.getState().activities['distribution-independent'];equal(s.attempts[0].correct,true);equal(s.attempts[0].source,'self');equal(qArray(p.i.getRecommendations('distribution-independent')),[]);
   p.i.navigate('evidence-close');assert(p.d.querySelector('#r3-open-evidence').textContent.includes('自评达到要点'));
   record('submit original explanation then self-rate',raw,{attempt:s.attempts[0],summary:p.d.querySelector('#r3-open-evidence').textContent});p.dom.window.close();
 });
 await scenario('choice correction and public worked-example controls',async()=>{const p=await page();p.i.navigate('statistic-check');
   change(p,a('statistic-check','input[value="ratio"]'),'ratio');click(p,a('statistic-check','[data-dt-control="submit"]'));
   equal(p.i.getState().activities['statistic-check'].attempts[0].correct,false);equal(p.i.getRecommendations('statistic-check')[0].to,'worked-distribution');
   const incorrect=p.d.querySelector(a('statistic-check','.dt-feedback')).textContent;assert(incorrect.includes('未知μ'));
   click(p,a('statistic-check','[data-dt-control="retry"]'));change(p,a('statistic-check','input[value="sample"]'),'sample');click(p,a('statistic-check','[data-dt-control="submit"]'));
   const correct=p.i.getState().activities['statistic-check'].attempts[1];assert(correct.assisted&&correct.correct);
   p.i.navigate('worked-distribution');click(p,a('worked-distribution','[data-dt-control="step-2"]'));equal(p.i.getState().activities['worked-distribution'].stepIndex,2);
   click(p,a('worked-distribution','[data-dt-control="step-0"]'));equal(p.i.getState().activities['worked-distribution'].stepIndex,0);
   equal(p.i.getState().activities['worked-distribution'].attempts.length,0);
   record('wrong choice, corrected assisted choice, step to end and back',{wrong:'ratio',correct:'sample',steps:[2,0]},{incorrect,correct,worked:p.i.getState().activities['worked-distribution']});p.dom.window.close();
 });
 await scenario('real review item, early retry, pending draft, notes/bookmark and refresh',async()=>{const p=await page();p.i.navigate('evidence-close');assert(p.d.querySelector('#r3-review').textContent.includes('初次'));click(p,'#r3-review');
   equal(p.i.getState().currentActivity,'distribution-probability');input(p,a('distribution-probability','[data-dt-control="answer"]'),'4/');p.i.navigate('evidence-close');assert(p.d.querySelector('#r3-review').textContent.includes('继续未完成'));click(p,'#r3-review');equal(p.i.getState().activities['distribution-probability'].draft,'4/');
   submit(p,'distribution-probability','4/9');let before=p.i.getState().activities['distribution-probability'];p.i.navigate('evidence-close');assert(p.d.querySelector('#r3-review').textContent.includes('提前练习'));click(p,'#r3-review');
   let after=p.i.getState().activities['distribution-probability'];equal(after.draft,'');equal(after.answerRevealed,false);equal(after.attempts.length,1);equal(after.review.dueAt,before.review.dueAt);
   click(p,a('distribution-probability','[data-dt-control="bookmark"]'));input(p,a('distribution-probability','.dt-note textarea'),'记得分别计算5和8的路径。');click(p,a('distribution-probability','[data-dt-control="note-save"]'));
   const exported=p.i.exportState();p.i.importState(exported);equal(p.i.getState().activities['distribution-probability'].notes,'记得分别计算5和8的路径。');
   record('review entry and actual early review item',null,{before,after,notes:p.i.getState().activities['distribution-probability'].notes});p.dom.window.close();
   const q=await page(exported);assert(q.i.getState().activities['distribution-probability'].bookmarked);equal(q.i.getState().activities['distribution-probability'].notes,'记得分别计算5和8的路径。');record('refresh from exported actual record',null,q.i.getState().activities['distribution-probability']);q.dom.window.close();
 });
 await scenario('structural accessibility and all targets exist (not visual rendering)',async()=>{const p=await page();
   const ids=[...p.d.querySelectorAll('[id]')].map(x=>x.id);equal(new Set(ids).size,ids.length);
   assert(p.d.querySelectorAll('math').length>0);assert(p.d.querySelector('meta[name="viewport"]'));
   p.d.querySelectorAll('#r3-lab-root select').forEach(el=>assert(p.d.querySelector(`label[for="${el.id}"]`)));
   const defs=JSON.parse(p.d.querySelector('#dt-lesson').textContent);defs.activities.forEach(x=>{if(x.solutionId)assert(p.d.getElementById(x.solutionId));});
   const saved=p.i.getState();defs.pathways.forEach(x=>assert(saved.activities[x.from]&&saved.activities[x.to]));
   assert(!p.d.querySelector('script[src]'));assert(!p.d.querySelector('img[src^="http"]'));
   record('DOM structure checks',null,{uniqueIds:ids.length,mathElements:p.d.querySelectorAll('math').length,activities:defs.activities.length,pathways:defs.pathways.length,externalScripts:0,visualRendering:'NOT PERFORMED'});p.dom.window.close();
 });
 log.status='PASS';
})().catch(error=>{log.status='FAIL';log.error=error.stack;process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.join(root,'records/dom-check.json'),JSON.stringify(log,null,2));console.log(JSON.stringify({status:log.status,scenarios:log.scenarios.map(x=>({name:x.name,status:x.status,error:x.error})),record:'records/dom-check.json'}));});
function qArray(v){return JSON.parse(JSON.stringify(v));}
