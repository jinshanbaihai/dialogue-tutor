// Recheck of immutable run-01, retaining original probe and evidence. DOM only, no browser screenshots.
const fs = require('fs');
const crypto = require('crypto');
const { JSDOM, VirtualConsole } = require('/workspace/scratch/b4c4b2db70f4/repo/node_modules/jsdom');
const dir = '/workspace/scratch/b4c4b2db70f4/generation/run-01';
const html = fs.readFileSync(dir + '/lesson.html', 'utf8');
const output = { environment: { node: process.version, jsdom: require('/workspace/scratch/b4c4b2db70f4/repo/node_modules/jsdom/package.json').version, browser: false }, sha256: crypto.createHash('sha256').update(html).digest('hex'), routes: [], errors: [] };
const pause = () => new Promise(resolve => setTimeout(resolve, 20));
async function fresh(storage) {
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => output.errors.push(e.message));
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://dialoguetutor.local/narrative-review.html', virtualConsole: vc, beforeParse(w) { if (storage) for (const [key,value] of Object.entries(storage)) w.localStorage.setItem(key,value); } });
  await pause();
  if (!dom.window.DialogueTutor?.instance) throw new Error('Runtime instance missing');
  return dom;
}
const root = (dom,id) => dom.window.document.getElementById('dt-activity-'+id);
const api = dom => dom.window.DialogueTutor.instance;
const saved = (dom,id) => api(dom).getState().activities[id];
const lab = (dom,s) => root(dom,'sampling-lab').querySelector(s);
const text = (node) => node ? node.textContent.replace(/\s+/g,' ').trim() : null;
function labSnapshot(dom) {
  const state = saved(dom,'sampling-lab');
  return { activityId:'sampling-lab', phase:text(lab(dom,'[data-lab-phase]')), conditions:text(lab(dom,'[data-lab-current]')), comparison:lab(dom,'[data-lab-results]').hidden ? null : text(lab(dom,'[data-lab-comparison]')), trace:lab(dom,'[data-lab-results]').hidden ? null : text(lab(dom,'[data-lab-trace]')), question:lab(dom,'[data-lab-results]').hidden ? null : text(lab(dom,'[data-lab-question]')), reference:text(lab(dom,'[data-lab-reference]')), resultsHidden:lab(dom,'[data-lab-results]').hidden, predictionLocked:lab(dom,'[data-lab-prediction]').disabled, svgCount:lab(dom,'.lab-chart').querySelectorAll('svg').length, table:lab(dom,'[data-lab-results]').hidden ? [] : Array.from(lab(dom,'[data-lab-table]').rows).map(r=>Array.from(r.cells).map(text)), exploration:state.exploration, attempts:state.attempts };
}
function closure(dom) {
  api(dom).navigate('evidence-close');
  const r=root(dom,'evidence-close');
  return { activityId:'evidence-close', story:text(r.querySelector('[data-close-story]')), evidence:Array.from(r.querySelectorAll('[data-close-evidence] li')).map(text), actions:Array.from(r.querySelectorAll('button')).map(n=>({text:text(n),control:n.dataset.dtControl||null})), recall:text(r.querySelector('[data-close-review-note]')) };
}
function change(dom,node,value) { node.value=value; node.dispatchEvent(new dom.window.Event('change',{bubbles:true})); }
function enter(dom,id,value) { const node=root(dom,id).querySelector('[data-dt-control="answer"]'); node.value=value; node.dispatchEvent(new dom.window.Event('input',{bubbles:true})); }
function submit(dom,id) { root(dom,id).querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})); }
function click(dom,id,control) { const n=root(dom,id).querySelector('[data-dt-control="'+control+'"]'); if(!n || n.disabled) throw new Error('Missing/disabled control '+id+':'+control); n.click(); }
function quizSnapshot(dom,id) { const r=root(dom,id); return {activityId:id, feedback:text(r.querySelector('.dt-feedback')), reference:text(r.querySelector('.dt-reference')), recommendations:api(dom).getRecommendations(id), state:saved(dom,id)}; }
function pick(dom,id,value) { const n=root(dom,id).querySelector('input[value="'+value+'"]'); n.checked=true; n.dispatchEvent(new dom.window.Event('change',{bubbles:true})); }
(async()=>{
  for(const spec of [{name:'prediction-matches',prediction:'centre'},{name:'prediction-differs',prediction:'equal'}]) {
    const dom=await fresh();
    const route={name:spec.name,inputs:[],snapshots:[{stage:'initial',...labSnapshot(dom)}]};
    change(dom,lab(dom,'[data-lab-prediction]'),spec.prediction); route.inputs.push({action:'change prediction',value:spec.prediction});
    lab(dom,'[data-lab-freeze]').click(); route.inputs.push({action:'click',control:'data-lab-freeze'});route.snapshots.push({stage:'frozen before result',...labSnapshot(dom)});
    const frozenTime=saved(dom,'sampling-lab').exploration.predictionAt;
    lab(dom,'[data-lab-reveal]').click(); route.inputs.push({action:'click',control:'data-lab-reveal'});route.snapshots.push({stage:'revealed',...labSnapshot(dom)});
    route.closureAfterRevealOnly=closure(dom);
    api(dom).navigate('sampling-lab');
    route.pathChecks=[];
    for(const path of ['0','2','4','6']) { change(dom,lab(dom,'[data-lab-path]'),path);route.pathChecks.push({input:path,trace:text(lab(dom,'[data-lab-trace]')),chartBars:Array.from(lab(dom,'.lab-chart').querySelectorAll('rect')).map(rect=>({fill:rect.getAttribute('fill'),strokeWidth:rect.getAttribute('stroke-width'),x:rect.getAttribute('x')})),predictionAt:saved(dom,'sampling-lab').exploration.predictionAt}); }
    route.originalTimePreserved=route.pathChecks.every(p=>p.predictionAt===frozenTime);
    lab(dom,'[data-lab-next]').click();route.nextAction={label:'确定调查中的总体与样本',arrived:api(dom).getState().currentActivity};
    output.routes.push(route);dom.window.close();
  }
  {
    const dom=await fresh();const route={name:'no-prediction',inputs:[{action:'click',control:'data-lab-skip'}]};
    lab(dom,'[data-lab-skip]').click();route.observation=labSnapshot(dom);route.closure=closure(dom);
    route.actionsPerformed=['skip prediction / reveal result','navigate to closure'];
    route.noPathSelectionOrSimulation={selectedPath:saved(dom,'sampling-lab').exploration.selectedPath,simulation:saved(dom,'sampling-lab').exploration.simulation,attempts:saved(dom,'sampling-lab').attempts};
    root(dom,'evidence-close').querySelector('[data-close-review]').click();route.returnEntry={arrived:api(dom).getState().currentActivity,flashState:saved(dom,'return-recall').flash,cardText:text(root(dom,'return-recall').querySelector('.dt-flashcard'))};
    output.routes.push(route);dom.window.close();
  }
  {
    const dom=await fresh();const route={name:'assisted-repair',inputs:[]};api(dom).navigate('mean-completion');
    enter(dom,'mean-completion','1/9');submit(dom,'mean-completion');route.inputs.push({activityId:'mean-completion',action:'submit',value:'1/9'});route.wrong=quizSnapshot(dom,'mean-completion');
    click(dom,'mean-completion','retry');click(dom,'mean-completion','hint');route.hint=text(root(dom,'mean-completion').querySelector('.dt-hint'));
    enter(dom,'mean-completion','2/9');submit(dom,'mean-completion');route.inputs.push({activityId:'mean-completion',action:'retry, hint, submit',value:'2/9'});route.correctAfterHelp=quizSnapshot(dom,'mean-completion');
    route.assistedClosure=closure(dom);
    api(dom).navigate('mean-completion');const next=root(dom,'mean-completion').querySelector('[data-dt-control="pathway-assisted-mean-independent"]');if(!next)throw new Error('Assisted pathway button missing');route.nextLabel=text(next);next.click();route.nextActivity=api(dom).getState().currentActivity;
    enter(dom,'mean-independent','5/9');submit(dom,'mean-independent');route.inputs.push({activityId:'mean-independent',action:'first submit, no hint',value:'5/9'});route.independent=quizSnapshot(dom,'mean-independent');route.mixedClosure=closure(dom);
    output.routes.push(route);dom.window.close();
  }
  {
    const dom=await fresh();const route={name:'wrong-choice-and-skipped-task',inputs:[]};api(dom).navigate('population-check');pick(dom,'population-check','frame');submit(dom,'population-check');route.inputs.push({activityId:'population-check',value:'frame'});route.wrong=quizSnapshot(dom,'population-check');
    const next=root(dom,'population-check').querySelector('[data-dt-control="pathway-incorrect-frame-repair"]');route.nextLabel=text(next);next.click();route.arrived=api(dom).getState().currentActivity;
    click(dom,'frame-repair','skip');route.skipped=quizSnapshot(dom,'frame-repair');
    output.routes.push(route);dom.window.close();
  }
  {
    const dom=await fresh();const route={name:'direct-to-closure'};route.closure=closure(dom);root(dom,'evidence-close').querySelector('[data-close-challenge]').click();route.challengeArrived=api(dom).getState().currentActivity;output.routes.push(route);dom.window.close();
  }
  {
    const dom=await fresh();api(dom).navigate('mean-independent');enter(dom,'mean-independent','5/9');submit(dom,'mean-independent');const route={name:'independent-only-closure',result:quizSnapshot(dom,'mean-independent'),closure:closure(dom)};output.routes.push(route);dom.window.close();
  }
  {
    const dom=await fresh();api(dom).navigate('sampling-conclusion');enter(dom,'sampling-conclusion','两份随机样本可以不同，均值因而可以不同，不能仅凭均值差异认定计算错误。');submit(dom,'sampling-conclusion');click(dom,'sampling-conclusion','self-good');const route={name:'self-assessment-only-closure',closure:closure(dom)};output.routes.push(route);dom.window.close();
  }
  {
    const dom=await fresh();change(dom,lab(dom,'[data-lab-n]'),'1');change(dom,lab(dom,'[data-lab-prediction]'),'equal');lab(dom,'[data-lab-freeze]').click();lab(dom,'[data-lab-reveal]').click();const route={name:'equal-result-wording',snapshot:labSnapshot(dom)};output.routes.push(route);dom.window.close();
  }
  {
    const dom=await fresh();change(dom,lab(dom,'[data-lab-prediction]'),'equal');lab(dom,'[data-lab-freeze]').click();const route={name:'frozen-reload'};route.before=labSnapshot(dom);const k=api(dom).storageKey;const storage={[k]:dom.window.localStorage.getItem(k)};dom.window.close();const restored=await fresh(storage);route.after=labSnapshot(restored);output.routes.push(route);restored.window.close();
  }

  {
    const dom=await fresh();
    const source=JSON.parse(fs.readFileSync(dir+'/lesson.json','utf8'));
    const embedded=JSON.parse(dom.window.document.getElementById('dt-lesson').textContent);
    output.sourceJsonEqualsEmbedded=JSON.stringify(source)===JSON.stringify(embedded);
    output.recheckedAt=new Date().toISOString();
    dom.window.close();
  }
  for(const spec of [
    {name:'reference-before-prediction',prediction:'centre',when:'before'},
    {name:'reference-after-prediction',prediction:'equal',when:'after'},
    {name:'reference-before-direct-observation',prediction:null,when:'before'}
  ]) {
    const dom=await fresh();const route={name:spec.name,inputs:[],snapshots:[]};
    const openReference=async()=>{
      const detail=dom.window.document.getElementById('dt-explanation-opening-scene');
      detail.open=true;await pause();
      route.inputs.push({action:'open full explanation',solutionId:detail.id});
      route.snapshots.push({stage:'reference opened',...labSnapshot(dom)});
    };
    if(spec.when==='before')await openReference();
    if(spec.prediction){
      change(dom,lab(dom,'[data-lab-prediction]'),spec.prediction);
      lab(dom,'[data-lab-freeze]').click();
      route.inputs.push({action:'freeze prediction',value:spec.prediction});
      route.snapshots.push({stage:'frozen',...labSnapshot(dom)});
      if(spec.when==='after')await openReference();
      lab(dom,'[data-lab-reveal]').click();
      route.inputs.push({action:'reveal enumeration'});
    }else{
      lab(dom,'[data-lab-skip]').click();route.inputs.push({action:'direct observation'});
    }
    route.snapshots.push({stage:'revealed',...labSnapshot(dom)});
    route.closure=closure(dom);output.routes.push(route);dom.window.close();
  }
  {
    const dom=await fresh();const route={name:'new-round-retains-old-prediction',inputs:[]};
    change(dom,lab(dom,'[data-lab-prediction]'),'equal');
    lab(dom,'[data-lab-freeze]').click();lab(dom,'[data-lab-reveal]').click();
    route.inputs.push({n:2,replacement:true,prediction:'equal',action:'freeze and reveal'});
    route.old=labSnapshot(dom);
    lab(dom,'[data-lab-reset]').click();
    change(dom,lab(dom,'[data-lab-n]'),'1');
    route.inputs.push({action:'new round',n:1});
    route.newDraft=labSnapshot(dom);
    route.history=text(lab(dom,'[data-lab-history]'));
    change(dom,lab(dom,'[data-lab-prediction]'),'equal');
    lab(dom,'[data-lab-freeze]').click();lab(dom,'[data-lab-reveal]').click();
    route.inputs.push({n:1,prediction:'equal',action:'freeze and reveal'});
    route.newRevealed=labSnapshot(dom);route.closure=closure(dom);
    output.routes.push(route);dom.window.close();
  }

  fs.writeFileSync('/workspace/scratch/b4c4b2db70f4/reviews/narrative-dom-recheck-evidence-run-01.json',JSON.stringify(output,null,2)+'\n');
  console.log(JSON.stringify({routes:output.routes.length,errors:output.errors,sha256:output.sha256}));
})().catch(e=>{output.fatal=String(e.stack);fs.writeFileSync('/workspace/scratch/b4c4b2db70f4/reviews/narrative-dom-recheck-evidence-run-01.json',JSON.stringify(output,null,2)+'\n');console.error(e);process.exitCode=1;});
