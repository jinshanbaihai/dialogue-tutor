'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('../repo/node_modules/jsdom');
const ROOT=path.resolve(__dirname,'../generation/correction-run-01');
const html=fs.readFileSync(path.join(ROOT,'lesson.html'),'utf8');
const lesson=JSON.parse(fs.readFileSync(path.join(ROOT,'lesson.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'manim-manifest.json'),'utf8'));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),cp=x=>JSON.parse(JSON.stringify(x));
const frames=new Map(manifest.frames.map(x=>[x.sha256,x]));
const report={htmlHash:sha(html),scope:'actual final inline JS; no Image stub, no synthetic load/error/seek; src setter observes then calls original',checks:[],scenarios:[],requests:[],limitations:['jsdom does not complete image decoding/load here; explorer onload commit/display and image-load race NOT tested','No real browser layout, Tab traversal, media playback or mobile/learner evidence']};
if(report.htmlHash!=='98b5e20e7ba17f01ae691f67b91050a493d3efad702020349acad50eea6e4392')throw Error('Final HTML changed');
function ck(id,ok,evidence){report.checks.push({id,pass:!!ok,evidence});}
const tick=()=>new Promise(r=>setTimeout(r,0));
async function open(name,storage={},failStorage=false){
 const row={name,actions:[],errors:[],requested:[]};report.scenarios.push(row);const vc=new VirtualConsole();vc.on('jsdomError',e=>row.errors.push({source:'jsdomError',message:e.message}));
 let ready;const readyP=new Promise(r=>ready=r);
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://independent-review.test/course',virtualConsole:vc,beforeParse(w){
  w.document.addEventListener('dt:ready',()=>ready());w.addEventListener('error',e=>row.errors.push({source:'error',message:e.message}));w.addEventListener('unhandledrejection',e=>row.errors.push({source:'unhandledrejection',message:String(e.reason)}));
  const d=Object.getOwnPropertyDescriptor(w.HTMLImageElement.prototype,'src');Object.defineProperty(w.HTMLImageElement.prototype,'src',{...d,set(v){if(String(v).startsWith('data:image/png;base64,')){const b=Buffer.from(String(v).split(',')[1],'base64'),h=sha(b),m=frames.get(h);row.requested.push({hash:h,bytes:b.length,frameId:m?.frameId||null});}return d.set.call(this,v);}});
  if(failStorage)Object.defineProperty(w,'localStorage',{get(){throw new Error('independent-review storage unavailable')}});else Object.entries(storage).forEach(([k,v])=>w.localStorage.setItem(k,v));
 }});
 await Promise.race([readyP,new Promise((_,rej)=>setTimeout(()=>rej(Error('No dt:ready')),15000))]);await tick();
 const w=dom.window,doc=w.document,api=w.DialogueTutor.instance;
 const q=s=>{const n=doc.querySelector(s);if(!n)throw Error('Missing '+s);return n};
 function click(s){row.actions.push(s);q(s).click();}
 function select(s,value){const n=q(s);row.actions.push(s+' = '+value);n.value=value;n.dispatchEvent(new w.Event('change',{bubbles:true}));}
 function state(id){return cp(w.CourseInspect.getState(id));}
 function store(){return Object.fromEntries(Array.from({length:w.localStorage.length},(_,i)=>{const k=w.localStorage.key(i);return[k,w.localStorage.getItem(k)]}));}
 function scan(label){let bad=[];for(const n of doc.querySelectorAll('input,textarea,[contenteditable]')){
  if(n.closest('.dt-note,.dt-copy-fallback')||n.readOnly)continue;if(n.tagName==='INPUT'&&['radio','checkbox','range','button','submit','reset','hidden','image','file'].includes(n.type))continue;
  if(n.hasAttribute('contenteditable')&&n.getAttribute('contenteditable').toLowerCase()==='false')continue;
  bad.push({tag:n.tagName,type:n.type,id:n.id,activity:n.closest('[data-dt-activity]')?.dataset.dtActivity});}
  ck('P02/'+name+'/'+label,bad.length===0,bad);
 }
 function finish(){ck('P01/errors/'+name,row.errors.length===0,row.errors);dom.window.close();if(global.gc)global.gc();}
 return {w,doc,api,q,click,select,state,store,scan,finish,row};
}
function construction(t,wrong=false){const ids=['AB','AC','BA','BC','CA','CB'];for(const id of ids)if(!t.q('[name="construct-path"][value="'+id+'"]').checked)t.click('[name="construct-path"][value="'+id+'"]');
 const vals={AB:'2',AC:'5',BA:'2',BC:'7',CA:'5',CB:'7'};for(const [id,v]of Object.entries(vals))t.select('[name="construct-map"][data-map-path="'+id+'"]',v);
 t.click('[name="construct-reason"][value="'+(wrong?'old':'remaining')+'"]');t.click('[name="construct-distribution"][value="thirds"]');
}
function preimage(t){for(const id of ['AC','BB','CA'])t.click('[name="preimage-path"][value="'+id+'"]');}
function counts(t){return Object.fromEntries(Object.entries(t.api.getState().activities).map(([id,s])=>[id,{attempts:s.attempts.length,explorationCount:s.explorationCount}]));}
(async()=>{
 // P01 P02 P09: all actual inline bytes, initial DOM, original resource files.
 let t=await open('load-and-media');t.scan('initial');ck('P01/all-mounts',t.doc.querySelectorAll('[data-dt-mounted="true"]').length===lesson.activities.length,{expected:lesson.activities.length,mounted:t.doc.querySelectorAll('[data-dt-mounted="true"]').length});
 const ids=Array.from(t.doc.querySelectorAll('[id]')).map(n=>n.id);ck('P01/id-unique',ids.length===new Set(ids).size,{count:ids.length});
 ck('P01/panel-closed',!t.q('.dt-study-panel').open);ck('P01/inline-json-identical',JSON.stringify(JSON.parse(t.q('#dt-lesson').textContent))===JSON.stringify(lesson));
 report.inlineScripts=Array.from(t.doc.scripts).map(s=>({id:s.id,widget:s.dataset.dtWidget||null,type:s.type,bytes:Buffer.byteLength(s.textContent),sha256:sha(s.textContent)}));
 const staticImages=Array.from(t.doc.images).map(im=>{let h=sha(Buffer.from(im.src.split(',')[1]||'','base64'));return{hash:h,frameId:frames.get(h)?.frameId||null,alt:im.alt,hidden:im.hidden}});report.staticImages=staticImages;ck('P09/static-images-match',staticImages.every(x=>x.frameId),staticImages.map(x=>x.frameId));
 const fileIssues=[];for(const m of manifest.frames){let b=fs.readFileSync(path.join(ROOT,'media/frames',m.frameId+'.png'));if(sha(b)!==m.sha256)fileIssues.push(m.frameId);for(const id of m.lineIds)if(!t.doc.getElementById(id))fileIssues.push(m.frameId+':missing-line:'+id);}
 ck('P09/55-files-and-lines',fileIssues.length===0,{frames:manifest.frames.length,issues:fileIssues});
 ck('P09/data-source-hashes',sha(fs.readFileSync(path.join(ROOT,'exact-math.json')))===manifest.dataHash&&sha(fs.readFileSync(path.join(ROOT,'manim_scene.py')))===manifest.sceneSourceHash&&sha(fs.readFileSync(path.join(ROOT,'frame-contract.json')))===manifest.frameContractHash);
 t.finish();
 // Each of 45 selected path/stage frames + two overview frames: actual src assignment recorded with no load stub.
 t=await open('all-frame-requests');for(const cid of ['main-wr','main-nr']){t.click('#sampling-explorer [data-condition="'+cid+'"]');const allowed=cid==='main-wr'?['AA','AB','AC','BA','BB','BC','CA','CB','CC']:['AB','AC','BA','BC','CA','CB'];
 ck('P04/allowed/'+cid,Array.from(t.doc.querySelectorAll('#sampling-explorer [data-path]')).filter(b=>!b.disabled).map(b=>b.dataset.path).join(',')===allowed.join(','));
 for(const p of allowed){t.click('#sampling-explorer [data-path="'+p+'"]');for(const stage of ['paths','mapping','grouping']){t.click('#sampling-explorer [data-stage="'+stage+'"]');let actual=t.row.requested.at(-1);ck('P09/request/'+cid+'/'+p+'/'+stage,actual.frameId===cid+'-'+p+'-'+stage,actual);}}
 t.scan(cid);}
 report.requests=t.row.requested;ck('P09/request-count',new Set(t.row.requested.map(x=>x.frameId)).size===47,{uniqueFrames:new Set(t.row.requested.map(x=>x.frameId)).size});
 const beforeC=t.state('construction-four');t.click('#sampling-explorer [data-condition="main-wr"]');ck('P04/construct-isolated',JSON.stringify(beforeC)===JSON.stringify(t.state('construction-four')));
 t.click('#sampling-explorer [data-path="AA"]');t.click('#sampling-explorer [data-condition="main-nr"]');ck('P04/no-excluded-selected',t.state('sampling-explorer').selectedPath===null);
 ck('P10/no-fake-load',t.q('[data-explorer-image]').hidden&&t.state('sampling-explorer').currentFrame===null,{status:t.q('[data-explorer-status]').textContent,environmentLimitation:true});t.finish();
 // construction freeze and actual old-import union persisted immediately into a fresh runtime page
 t=await open('construction-and-import');t.click('[data-construct-submit]');ck('P03/incomplete-no-record',t.state('construction-four').submissions.length===0,{status:t.q('[data-construct-status]').textContent});
 t.click('[name="construct-path"][value="AB"]');const old=cp(t.api.exportState());ck('P03/no-early-checks',t.q('[data-construct-result]').textContent.trim()==='');construction(t);t.scan('filled');t.click('[data-construct-submit]');const first=cp(t.state('construction-four').submissions[0]);t.click('[data-construct-submit]');ck('P03/single-freeze',t.state('construction-four').submissions.length===1&&first.assistedAtSubmit===false&&Object.values(first.componentChecks).every(Boolean),first);
 t.click('[data-construct-retry]');construction(t,true);t.click('[data-construct-submit]');ck('P05/retry-assisted-and-first-unchanged',t.state('construction-four').submissions[1].assistedAtSubmit&&JSON.stringify(t.state('construction-four').submissions[0])===JSON.stringify(first));
 t.q('#q3-d-solution>summary').click();await tick();t.api.importState(old);const merged=cp(t.api.exportState()),cs=t.state('construction-four'),key=cs.conditionKey;
 ck('P06/union-and-submissions',cs.contacts[key].feedback&&cs.contacts[key].reference&&cs.submissions.length===2&&JSON.stringify(cs.submissions[0])===JSON.stringify(first),{contact:cs.contacts[key],submissions:cs.submissions.length,selection:cs.selection});
 ck('P06/immediate-export',JSON.stringify(merged.state.activities['construction-four'].exploration)===JSON.stringify(cs));
 const countBefore=counts(t),store=t.store();t.scan('imported');t.finish();
 t=await open('reopen-merged',store);ck('P06/reopen-preserves-union',JSON.stringify(t.state('construction-four'))===JSON.stringify(cs),{reopened:t.state('construction-four').contacts[key],submissions:t.state('construction-four').submissions.length});ck('P06/restore-no-new-actions',JSON.stringify(counts(t))===JSON.stringify(countBefore));t.scan('restored');t.finish();
 // Immediate native-summary race: actual summaries, no manually dispatched toggle events.
 t=await open('reference-same-task');preimage(t);t.click('#main-wr-distribution-solution>summary');t.click('[data-preimage-submit]');const ps=t.state('preimage-four').submissions[0];ck('P05/preimage-synchronous-reference',ps.assistedAtSubmit,{solutionOpen:t.q('#main-wr-distribution-solution').open,submission:ps});await tick();ck('P05/preimage-first-not-retrochanged',JSON.stringify(ps)===JSON.stringify(t.state('preimage-four').submissions[0]));
 construction(t);t.click('#q3-a-solution>summary');t.click('[data-construct-submit]');ck('P05/construction-synchronous-reference',t.state('construction-four').submissions[0].assistedAtSubmit,t.state('construction-four').submissions[0].assistanceSnapshot);t.finish();
 // Critical stale-contact import before async native toggle.
 t=await open('reference-immediate-import');const blank=cp(t.api.exportState());t.click('#q3-d-solution>summary');t.api.importState(blank);const instant=cp(t.api.exportState()),cInstant=instant.state.activities['construction-four'].exploration,kInstant=t.state('construction-four').conditionKey;ck('P06/immediate-reference-import-union',cInstant.contacts[kInstant].reference,{solutionOpen:t.q('#q3-d-solution').open,exportedContact:cInstant.contacts[kInstant]});const instantStore=t.store();await tick();t.finish();
 t=await open('reopen-immediate-reference',instantStore);construction(t);t.click('[data-construct-submit]');ck('P06/immediate-reopen-reference-preserved',t.state('construction-four').submissions[0].assistedAtSubmit,t.state('construction-four').submissions[0].assistanceSnapshot);t.finish();
 // Normal reference then tick recovery and clear schema/data identity validation probe through the supported import API.
 t=await open('normal-reference-and-validation');t.click('#q3-a-solution>summary');await tick();const referenceExport=cp(t.api.exportState()),referenceStore=t.store();t.finish();
 t=await open('normal-reference-reopen',referenceStore);let st=t.state('construction-four');ck('P07/reference-contact-restored',st.contacts[st.conditionKey].reference);ck('P07/revealed-detail-restored',t.q('#q3-a-solution').open,{storedRevealedThrough:st.contacts[st.conditionKey].revealedThrough,open:t.q('#q3-a-solution').open});
 const bad=cp(t.api.exportState());bad.state.activities['construction-four'].exploration.dataHash='different-data';bad.state.activities['construction-four'].exploration.schemaVersion=999;bad.state.activities['construction-four'].exploration.componentId='other-component';bad.state.activities['construction-four'].exploration.selection={paths:['AA'],mapping:{AB:'999'},probabilityReason:'invalid',distribution:'invalid'};let rejected=false;try{t.api.importState(bad)}catch(e){rejected=true}const loaded=t.state('construction-four');ck('P07/reject-or-reset-foreign-component-state',rejected||Object.keys(loaded.selection).length===0,{rejected,loadedSelection:loaded.selection,loadedDataHash:loaded.dataHash});t.finish();
 // Every runtime quiz and every flashcard via real controls; no author grading function invocation.
 t=await open('all-main-branches-and-links');for(const a of lesson.activities){const root='[data-dt-activity="'+a.id+'"]';if(a.type==='quiz'){t.click(root+' input[type="radio"]');t.click(root+' [data-dt-control="submit"]');ck('P02/quiz/'+a.id,t.api.getState().activities[a.id].attempts.length===1);t.scan(a.id);}else if(a.type==='flashcards'){for(let i=0;i<a.cards.length;i++){t.click(root+' [data-dt-control="flash-flip"]');t.click(root+' [data-dt-control="flash-good"]');if(i<a.cards.length-1)t.click(root+' [data-dt-control="flash-next"]');}ck('P12/flash-self/'+a.id,t.api.getState().activities[a.id].attempts.every(x=>x.source==='self'));}}
 t.click('[data-construct-hint]');t.click('[data-construct-skip]');t.click('[data-open-all]');await tick();t.scan('all-open');
 const dead=[],hiddenTargets=[];for(const a of Array.from(t.doc.querySelectorAll('a[href^="#"]'))){const n=t.doc.getElementById(a.getAttribute('href').slice(1));if(!n)dead.push(a.getAttribute('href'));else{a.click();let p=n;while(p){if(p.matches('details')&&!p.open)hiddenTargets.push(n.id);p=p.parentElement;}}}
 ck('P11/all-local-links',!dead.length&&!hiddenTargets.length,{links:t.doc.querySelectorAll('a[href^="#"]').length,dead,hiddenTargets});
 for(const s of ['[data-report-refresh]','[data-report-next]','[data-report-construction]','[data-report-memory]'])t.click(s);ck('P11/report-buttons-no-dead-target',!!t.api.getState().currentActivity);
 const unnamed=Array.from(t.doc.querySelectorAll('button')).filter(b=>!b.textContent.trim()&&!b.getAttribute('aria-label')).map(b=>b.outerHTML);ck('P11/buttons-named',!unnamed.length,unnamed);const custom=t.q('[data-construct-submit]');custom.focus();ck('P11/native-focus',t.doc.activeElement===custom);report.reportText=t.q('[data-report-text]').textContent;ck('P12/no-common-construction-attempts',t.api.getState().activities['construction-four'].attempts.length===0);t.finish();
 // storage failure environmental hook only: no author/state changes
 t=await open('storage-unavailable',{},true);construction(t);t.click('[data-construct-submit]');t.click('[data-construct-skip]');t.click('[data-open-all]');const exported=t.api.exportState();ck('P08/continue-and-export',exported.state.activities['construction-four'].exploration.submissions.length===1&&t.q('#q3-d-solution').open);t.scan('failure-path');report.storageStatus=t.q('[data-construct-status]').textContent;t.finish();
 report.summary={checks:report.checks.length,passed:report.checks.filter(x=>x.pass).length,failed:report.checks.filter(x=>!x.pass).map(x=>x.id),scenarios:report.scenarios.length};
 fs.writeFileSync(path.join(__dirname,'correction-code-course-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report.summary,null,2));
})().catch(e=>{report.harnessError=e.stack;fs.writeFileSync(path.join(__dirname,'correction-code-course-results.json'),JSON.stringify(report,null,2));console.error(e.stack);process.exitCode=1});
