'use strict';
const fs=require('fs'),crypto=require('crypto'),{JSDOM,VirtualConsole}=require('../repo/node_modules/jsdom');
const html=fs.readFileSync(__dirname+'/game-course-run-03-snapshot/lesson.html','utf8');
const results={htmlSHA:crypto.createHash('sha256').update(html).digest('hex'),scope:'independent frozen complete-course component DOM review; no Image load stub, no browser layout claim',scenes:[]};
const plain=x=>JSON.parse(JSON.stringify(x));let current;const pause=()=>new Promise(r=>setTimeout(r,10));
function check(name,value,actual){current.assertions.push({name,pass:!!value,actual});}
async function page({stored,time=1800000000000}={}){const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(html,{url:'https://example.test/run03',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.Date.now=()=>time;w.HTMLElement.prototype.scrollIntoView=function(){w.lastScrolled=this.id};if(stored)for(const[k,v]of Object.entries(stored))w.localStorage.setItem(k,v);}});await pause();return {dom,w:dom.window,d:dom.window.document,api:dom.window.DialogueTutor.instance,errors};}
function rc(p,o,c){const n=p.d.querySelector('#dt-activity-'+o+' [data-r3-control="'+c+'"]')||p.d.querySelector('#'+o+' [data-r3-control="'+c+'"]');if(!n)throw Error('missing '+o+' '+c);return n;}
function click(p,o,c){rc(p,o,c).click();}
function native(p,c){p.d.querySelector('#dt-activity-recall-core [data-dt-control="'+c+'"]').click();}
function state(p,o,c='wr'){return p.api.getState().activities[o].exploration.conditions[c];}
function feedback(p,o){return p.d.getElementById(o+'-feedback').textContent;}
function ref(p,o,c){p.d.querySelector('#'+(o==='mean-lab'?'mean':'max')+'-'+c+'-reference > summary').click();}
function setMax(p,c,{omit=[],extra=[],mapping,weight,dist,skipMapping=false,skipWeight=false,skipDist=false}={}){click(p,'max-board','condition-'+c);let paths=['RR','RS','RT','SR','SS','ST','TR','TS','TT'].filter(x=>c==='wr'||x[0]!==x[1]).filter(x=>!omit.includes(x));paths=[...new Set([...paths,...extra])];for(const x of paths)click(p,'max-board','path-'+x);for(const x of paths)if(!(skipMapping&&x===paths[0]))click(p,'max-board','mapping-'+x+'-'+(mapping&&mapping[x]|| (x.includes('T')?'5':'1')));if(!skipWeight)click(p,'max-board','weight-'+(weight||c));if(!skipDist)for(const[v,a]of Object.entries(dist||(c==='wr'?{'1':'4/9','5':'5/9'}:{'1':'1/3','5':'2/3'})))click(p,'max-board','distribution-'+v+'-'+a);}
async function scene(name,fn,opts){current={name,assertions:[]};results.scenes.push(current);let p;try{p=await page(opts);await fn(p);check('no uncaught page error',p.errors.length===0,p.errors);}catch(e){current.error=e.stack;}finally{p?.w.close();}}

function nc(p,id,c){const n=p.d.querySelector('#dt-activity-'+id+' [data-dt-control="'+c+'"]');if(!n)throw Error('missing native '+id+' '+c);n.click();}
const quizCases=[['frame-opening',0,'pop-act3'],['e1a',1,'solution-e1a'],['e1b',2,'solution-e1b'],['stat-opening',1,'stat-act3'],['e2a',1,'solution-e2a'],['e2b',2,'solution-e2b'],['path-choice',0,'mean-first-AB-1'],['weight-wr',1,'mean-wr-AB-path'],['group-wr',2,'mean-wr-group-4'],['weight-wor',0,'mean-wor-AB-path'],['group-wor',1,'mean-wor-group-4'],['e3a',2,'solution-e3a'],['e3b',0,'solution-e3b'],['q1a',1,'solution-q1a'],['q1b',2,'solution-q1b'],['q2a',0,'solution-q2a'],['q2b',1,'solution-q2b'],['q3c',2,'solution-q3c'],['q4a',0,'solution-q4a'],['q4b',1,'solution-q4b']];
(async()=>{
await scene('twenty-finite-questions-wrong-source-return-retry',async p=>{
 for(const[id,correct,sourceId]of quizCases){
  const root=()=>p.d.getElementById('dt-activity-'+id);const n=root().querySelectorAll('input[type="radio"]').length;
  check(id+' finite pre-authored alternatives',n>=2&&n<=3&&!root().querySelector('.dt-quiz input[type=text],.dt-quiz textarea'),n);
  nc(p,id,'skip');check(id+' native skip creates no wrong attempt',p.api.getState().activities[id].status==='skipped'&&p.api.getState().activities[id].attempts.length===0,root().textContent.slice(-200));
  nc(p,id,'retry');check(id+' explicit return from skip unlocks choices',!root().querySelector('input[type=radio]').disabled);
  nc(p,id,'choice-'+((correct+1)%n));nc(p,id,'submit');await pause();
  const before=plain(p.api.getState().activities[id].attempts[0]);check(id+' wrong answer gets timely correction and reference explanation',before.correct===false&&root().textContent.includes('需要修正')&&!!p.d.querySelector('#native-help-'+id+' [data-r3-control="native-repair-'+id+'"]'),root().textContent.slice(-900));
  p.d.querySelector('#native-help-'+id+' [data-r3-control="native-repair-'+id+'"]').click();
  const src=p.d.getElementById(sourceId);check(id+' repair locates actual necessary source',p.w.lastScrolled===sourceId,p.w.lastScrolled);
  check(id+' source retains actual explanation or formula',!!src.querySelector('math')||src.textContent.length>70,{length:src.textContent.length,tail:src.textContent.slice(-300)});if(id==='path-choice')check('AB necessary definition and three calculation rows remain adjacent and reachable',[1,2,3,4].every(i=>{const row=p.d.getElementById('mean-first-AB-'+i);return row&&row.querySelector('math')&&!row.hidden;}));
  const back=src.querySelector('[data-r3-native-target="'+id+'"]');check(id+' exact return inside source',!!back);back.click();
  check(id+' return preserves frozen wrong answer and actual destination',p.api.getState().currentActivity===id&&JSON.stringify(p.api.getState().activities[id].attempts[0])===JSON.stringify(before));
  nc(p,id,'retry');nc(p,id,'choice-'+correct);nc(p,id,'submit');await pause();const after=p.api.getState().activities[id];
  check(id+' retry succeeds with reference-assisted identity',after.attempts.length===2&&after.attempts[1].correct===true&&after.attempts[1].assisted===true,after.attempts);
  check(id+' first answer remains unchanged after successful repair',JSON.stringify(after.attempts[0])===JSON.stringify(before));
 }
 const storage={[p.api.storageKey]:p.w.localStorage.getItem(p.api.storageKey)};const q=await page({stored:storage});check('pause and actual new window preserve native attempted work',quizCases.every(([id])=>JSON.stringify(q.api.getState().activities[id].attempts)===JSON.stringify(p.api.getState().activities[id].attempts)));check('reopen causes no page errors',q.errors.length===0,q.errors);q.w.close();
});
await scene('five-checkpoints-live-inside-derivation-and-choice-only',p=>{
 const order=(a,b)=>!!(p.d.getElementById(a).compareDocumentPosition(p.d.getElementById(b))&p.w.Node.DOCUMENT_POSITION_FOLLOWING);
 check('path distinction after AB result, before exploration',order('mean-first-AB-4','dt-activity-path-choice')&&order('dt-activity-path-choice','dt-activity-mean-lab'));
 for(const c of ['wr','wor']){check(c+' probability check occurs between AB and BA path derivations',order('mean-'+c+'-AB-path','dt-activity-weight-'+c)&&order('dt-activity-weight-'+c,'mean-'+c+'-BA-path'));check(c+' grouping check occurs between output4 and output6',order('mean-'+c+'-group-4','dt-activity-group-'+c)&&order('dt-activity-group-'+c,'mean-'+c+'-group-6'));}
 const inputs=[...p.d.querySelectorAll('input,textarea,[contenteditable]')].filter(n=>!n.closest('.dt-note')&&!['file','radio','checkbox'].includes(n.type)&&!n.readOnly);check('complete course main answers require no typing',inputs.length===0,inputs.map(n=>n.outerHTML));
 check('actual closing and recall controls occur after worked exercises',order('question-q4b','course-closing')&&order('course-closing','end-recall-navigation'));
});
results.totalAssertions=results.scenes.reduce((n,s)=>n+s.assertions.length,0);results.failed=results.scenes.flatMap(s=>s.assertions.filter(a=>!a.pass).map(a=>({scene:s.name,...a})));results.errors=results.scenes.filter(s=>s.error).map(s=>({scene:s.name,error:s.error}));fs.writeFileSync(__dirname+'/correction-game-course-run-03-native-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({scenes:results.scenes.length,assertions:results.totalAssertions,failures:results.failed,errors:results.errors},null,2));})();
