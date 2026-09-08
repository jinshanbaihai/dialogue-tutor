const fs = require('fs'), crypto = require('crypto');
const {JSDOM, VirtualConsole} = require('../repo/node_modules/jsdom');
const root = 'generation/correction-run-01/';
const html = fs.readFileSync(root+'lesson.html','utf8');
const lesson = JSON.parse(fs.readFileSync(root+'lesson.json','utf8'));
const result={method:'Independent jsdom DOM-event review; no browser layout, PNG decoding, or human learning evidence. Image completion and scrollIntoView stubbed.',hashes:{html:crypto.createHash('sha256').update(html).digest('hex'),json:crypto.createHash('sha256').update(fs.readFileSync(root+'lesson.json')).digest('hex')},scenarios:[],errors:[]};
const pause=()=>new Promise(r=>setTimeout(r,40));
async function boot(){const vc=new VirtualConsole();vc.on('jsdomError',e=>result.errors.push(e.message));const d=new JSDOM(html,{url:'https://narrative-review.invalid/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.HTMLElement.prototype.scrollIntoView=function(){};w.Image=class{set src(v){this.value=v;setTimeout(()=>this.onload?.(),0)}get src(){return this.value}};}});await pause();return d;}
const txt=(w,s)=>w.document.querySelector(s)?.textContent.replace(/\s+/g,' ').trim()||'';
function click(w,s){const x=w.document.querySelector(s);if(!x)throw Error('Missing selector '+s);x.click();}
function choose(w,s,value){const x=w.document.querySelector(s);if(!x)throw Error('Missing selector '+s);if(x.tagName==='SELECT')x.value=value;else x.checked=true;x.dispatchEvent(new w.Event('change',{bubbles:true}));}
function snapshot(w,label,extra={}){click(w,'[data-report-refresh]');result.scenarios.push({label,report:txt(w,'#course-report'),closing:txt(w,'#closing'),...extra});}
(async()=>{
 let d=await boot(),w=d.window;
 const sections=lesson.sections.map(s=>{const x=new JSDOM(s.bodyHtml).window.document;return{id:s.id,paragraphs:x.querySelectorAll('p').length,text:x.body.textContent.replace(/\s+/g,' ').trim()}});
 fs.writeFileSync('reviews/correction-narrative-independent-sections.json',JSON.stringify(sections,null,2));
 snapshot(w,'fresh no prediction/no reveal');
 for(const [id,wrong] of [['main-reverse','drop'],['main-equal','five'],['main-weight','old']]){
  const a=lesson.activities.find(a=>a.id===id);const selected=a.choices.find(c=>c.id!==a.answer).id;
  choose(w,`[name="dt-choice-${id}"][value="${selected}"]`);
  click(w,`[data-dt-activity="${id}"] [data-dt-control="submit"]`);await pause();
  const host=w.document.querySelector(`[data-dt-activity="${id}"]`);
  result.scenarios.push({label:'wrong '+id,selected,activityText:host.textContent.replace(/\s+/g,' ').trim(),links:Array.from(host.querySelectorAll('a')).map(a=>({text:a.textContent,href:a.getAttribute('href')})),attempts:w.DialogueTutor.instance.getState().activities[id].attempts});
 }
 for(const branch of ['equal','reverse','weight']){
  const s=w.document.querySelector('#branch-'+branch);result.scenarios.push({label:'repair '+branch,text:s?.textContent.replace(/\s+/g,' ').trim(),links:Array.from(s?.querySelectorAll('a')||[]).map(a=>({text:a.textContent,href:a.getAttribute('href')}))});
  const id='repair-'+branch+'-q-answer',a=lesson.activities.find(a=>a.id===id);choose(w,`[name="dt-choice-${id}"][value="${a.answer}"]`);click(w,`[data-dt-activity="${id}"] [data-dt-control="submit"]`);await pause();
  result.scenarios.push({label:'new item '+branch,text:txt(w,`[data-dt-activity="${id}"]`)});
 }
 snapshot(w,'after three incorrect choices and three new correct checks');
 click(w,'#sampling-explorer [data-path="AC"]');await pause();
 for(const stage of ['paths','mapping','grouping']){click(w,`#sampling-explorer [data-stage="${stage}"]`);await pause();result.scenarios.push({label:'with replacement AC '+stage,formula:txt(w,'[data-explorer-formula]'),target:txt(w,'[data-explorer-target]'),caption:txt(w,'[data-explorer-caption]'),state:w.CourseInspect.getState('sampling-explorer')});}
 snapshot(w,'with replacement grouping, mean 4');
 click(w,'#sampling-explorer [data-condition="main-nr"]');await pause();click(w,'#sampling-explorer [data-path="AC"]');click(w,'#sampling-explorer [data-stage="grouping"]');await pause();
 snapshot(w,'without replacement grouping, mean 4',{formula:txt(w,'[data-explorer-formula]'),target:txt(w,'[data-explorer-target]'),caption:txt(w,'[data-explorer-caption]'),state:w.CourseInspect.getState('sampling-explorer')});
 d.window.close();d=await boot();w=d.window;
 choose(w,'[name="preimage-path"][value="AC"]');click(w,'[data-preimage-submit]');await pause();result.scenarios.push({label:'preimage omission',text:txt(w,'#preimage-work'),state:w.CourseInspect.getState('preimage-four')});
 click(w,'[data-preimage-retry]');for(const p of ['AC','BB','CA'])choose(w,`[name="preimage-path"][value="${p}"]`);click(w,'[data-preimage-submit]');await pause();result.scenarios.push({label:'preimage correction after feedback',text:txt(w,'#preimage-work'),state:w.CourseInspect.getState('preimage-four')});
 snapshot(w,'preimage corrected');d.window.close();
 d=await boot();w=d.window;click(w,'[data-open-all]');await pause();snapshot(w,'direct full reference without answering');
 click(w,'[data-construct-skip]');await pause();snapshot(w,'skip full construction',{constructText:txt(w,'#construction-work')});d.window.close();
 fs.writeFileSync('reviews/correction-narrative-independent-evidence.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify({scenarios:result.scenarios.map(s=>s.label),errors:result.errors,hashes:result.hashes}));
})().catch(e=>{console.error(e);process.exitCode=1;});
