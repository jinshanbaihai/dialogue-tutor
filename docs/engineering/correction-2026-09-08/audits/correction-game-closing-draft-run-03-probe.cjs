'use strict';
const fs=require('fs'),crypto=require('crypto'),{JSDOM,VirtualConsole}=require('../repo/node_modules/jsdom');
const html=fs.readFileSync(__dirname+'/'+(process.env.SNAPSHOT||'game-closing-draft-run-03-snapshot-v2')+'/lesson.html','utf8');
const results={htmlSHA:crypto.createHash('sha256').update(html).digest('hex'),scope:'independent bounded closing draft DOM review; no Image load stub, no browser layout or whole-course claim',scenes:[]};
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
async function scene(name,fn,opts){if(process.env.SCENE&&!name.includes(process.env.SCENE))return;current={name,assertions:[]};results.scenes.push(current);let p;try{p=await page(opts);await fn(p);check('no uncaught page error',p.errors.length===0,p.errors);}catch(e){current.error=e.stack;}finally{p?.w.close();}}

function closing(p){return p.d.getElementById('course-closing').textContent;}
function end(p,c='closing-recall-primary'){return rc(p,'end-recall-navigation',c);}
function cc(p,c='closing-primary'){return rc(p,'course-closing',c);}
function reveal(p){for(let i=0;i<2&&state(p,'mean-lab',p.api.getState().activities['mean-lab'].exploration.condition).targets.length<2;i++)cc(p).click();}
function cards(p){return p.api.getState().activities['recall-core'].flash;}
function reviews(p){return p.w.DialogueTutor.getReviews(JSON.parse(p.d.getElementById('dt-lesson').textContent),p.api.getState(),p.w.Date.now()).filter(x=>x.activityId==='recall-core');}
(async()=>{
await scene('empty-partial-observed-no-answer',p=>{
 check('fresh closing withholds comparison',closing(p).includes('尚未核看')&&!closing(p).includes('精确结果'),closing(p));
 cc(p).click();check('first actual target is mean WR group4',p.w.lastScrolled==='mean-wr-group-4',p.w.lastScrolled);
 check('one target still withholds comparison',closing(p).includes('尚需核看均值6')&&!closing(p).includes('精确结果'),closing(p));
 cc(p).click();check('second actual target is mean WR group6',p.w.lastScrolled==='mean-wr-group-6',p.w.lastScrolled);
 check('observation gives exact WR facts without own answer',closing(p).includes('P(均值=6)=1/3，P(均值=4)=2/9')&&closing(p).includes('尚未提交自己的判断'),closing(p));
 check('observing creates no submission',state(p,'mean-lab').history.length===0,state(p,'mean-lab'));
 cc(p,'closing-next-condition').click();check('next actually switches to WOR',p.api.getState().activities['mean-lab'].exploration.condition==='wor');
 check('new unseen condition does not inherit comparison',closing(p).includes('尚未核看')&&!closing(p).includes('精确结果'),closing(p));
});
for(const c of ['wr','wor'])for(const assisted of [false,true])for(const correct of [false,true])await scene(`closing-${c}-${assisted?'assisted':'independent'}-${correct?'correct':'wrong'}`,async p=>{
 click(p,'mean-lab','condition-'+c);if(assisted){ref(p,'mean-lab',c);await pause();}
 click(p,'mean-lab','compare-'+(correct?(c==='wr'?'gt':'eq'):'lt'));click(p,'mean-lab','submit');const first=plain(state(p,'mean-lab',c).history[0]);
 if(!assisted)check('prediction alone does not reveal facts',!closing(p).includes('精确结果')&&closing(p).includes('待核对'),closing(p));
 reveal(p);const text=closing(p);check('exact presented probabilities match mechanism',text.includes(c==='wr'?'P(均值=6)=1/3，P(均值=4)=2/9':'P(均值=6)=1/3，P(均值=4)=1/3'),text);
 check('feedback names match or discrepancy',text.includes(correct?'结果一致':'结果有差异'),text);
 check('frozen assisted identity stated',text.includes(assisted?'保留辅助身份':'不会改写该首答身份'),text);
 check('first answer content and assistance unchanged; presented may advance',JSON.stringify({...first,presented:true})===JSON.stringify(state(p,'mean-lab',c).history[0]));
 if(!correct){cc(p).click();check('wrong closing leads into current repair',!!p.d.querySelector('#mean-lab-repair [data-r3-control="repair-source"]'),p.d.getElementById('mean-lab-repair').textContent);click(p,'mean-lab','repair-source');check('repair actually locates same-condition complete source',p.w.lastScrolled==='mean-'+c+'-complete',p.w.lastScrolled);const back=p.d.querySelector('[data-r3-return="mean-lab"][data-condition="'+c+'"]');back.click();check('source returns actual owner/condition',p.api.getState().currentActivity==='mean-lab'&&p.api.getState().activities['mean-lab'].exploration.condition===c);}
 click(p,'mean-lab','restart');check('restart distinguishes new draft and retained history',closing(p).includes('重新打开的新草稿')&&state(p,'mean-lab',c).history.length===1,closing(p));check('restart has no new answer',state(p,'mean-lab',c).active===null,state(p,'mean-lab',c));
});
for(const mode of ['unseen-max','seen-max','all-max-done','q4-done'])await scene('closing-next-'+mode,async p=>{
 if(mode==='seen-max')ref(p,'max-board','wr');if(mode==='all-max-done'||mode==='q4-done'){for(const c of ['wr','wor']){setMax(p,c);click(p,'max-board','submit');}if(mode==='q4-done'){p.d.querySelector('#dt-activity-q4a [data-dt-control="choice-0"]').click();p.d.querySelector('#dt-activity-q4a [data-dt-control="submit"]').click();}}
 for(const c of ['wr','wor']){click(p,'mean-lab','condition-'+c);ref(p,'mean-lab',c);click(p,'mean-lab','compare-'+(c==='wr'?'gt':'eq'));click(p,'mean-lab','submit');}await pause();
 const label=cc(p,'closing-next-condition').textContent;check('next label matches destination evidence',mode==='seen-max'?label.includes('带参考'):mode==='q4-done'?label.includes('回看'):mode==='all-max-done'?label.includes('Q4'):label.includes('开始'),label);
 cc(p,'closing-next-condition').click();check('closing actually reaches intended activity',p.api.getState().currentActivity===(mode.includes('max')&&!mode.startsWith('all')?'max-board':'q4a'),p.api.getState().currentActivity);
});
await scene('closing-native-card-priority-immediate-refresh',async p=>{
 check('initial exact card1',end(p).textContent.includes('开始卡1'),end(p).textContent);end(p).click();check('initial reaches card index0 front',cards(p).index===0&&!cards(p).cards['0']?.revealed,cards(p));
 native(p,'flash-flip');await pause();check('native flip immediately changes closing to unfinished card1',end(p).textContent.includes('卡1尚未自评'),end(p).textContent);
 native(p,'flash-good');await pause();const first=plain(reviews(p)[0]);check('rated first card has real review item',first.cardIndex===0,first);check('initial card2 priority after real first rating',end(p).textContent.includes('开始卡2'),end(p).textContent);
 end(p).click();native(p,'flash-flip');await pause();const second=plain(cards(p).cards['1']);check('unfinished card2 priority',end(p).textContent.includes('卡2尚未自评'),end(p).textContent);end(p).click();check('continue preserves card2 back without rating',cards(p).index===1&&cards(p).cards['1'].revealed&&cards(p).cards['1'].rating===null,cards(p));
 end(p,'recall-review-0').click();check('explicit early review uses actual card0 item front',cards(p).index===0&&!cards(p).cards['0']?.revealed,cards(p));check('early reopen preserves card2 and previous review',JSON.stringify(cards(p).cards['1'])===JSON.stringify(second)&&JSON.stringify(reviews(p)[0])===JSON.stringify(first),reviews(p));
});
await scene('closing-due-real-item-priority',async p=>{
 end(p).click();native(p,'flash-flip');native(p,'flash-good');await pause();end(p).click();native(p,'flash-flip');native(p,'flash-good');await pause();const before=plain(reviews(p));
 check('both cards have distinct saved review items',before.length===2&&new Set(before.map(x=>x.cardIndex)).size===2,before);
 check('both rated offers early review',end(p).textContent.includes('提前复习'),end(p).textContent);
 p.w.Date.now=()=>Math.max(...before.map(x=>x.review.dueAt))+1;
 p.d.querySelector('[data-r3-return="mean-lab"][data-condition="wor"]').click();
 check('native return refreshes actual due label without scroll event',end(p).textContent.includes('到期复习卡1'),end(p).textContent);
 end(p).click();check('due priority targets real earliest card0 front',cards(p).index===0&&!cards(p).cards['0']?.revealed,cards(p));check('opening due review does not add rating/history',JSON.stringify(reviews(p).map(x=>x.review))===JSON.stringify(before.map(x=>x.review)),reviews(p));
});
await scene('closing-skipped-restored-fixture',async p=>{
 const saved=p.api.exportState();saved.state.activities['mean-lab'].status='skipped';
 check('valid skipped fixture imports through public boundary',p.api.importState(saved)!==false);
 p.d.querySelector('[data-r3-return="mean-lab"][data-condition="wr"]').click();
 check('closing distinguishes skipped from wrong',closing(p).includes('跳过不是错误')&&!closing(p).includes('有差异'),closing(p));
 reveal(p);check('after observed results skipped returns to same activity',cc(p).textContent.includes('返回这项作答'),cc(p).textContent);cc(p).click();
 check('return reaches actual draft without creating answer',p.api.getState().currentActivity==='mean-lab'&&state(p,'mean-lab').history.length===0);
 check('closing demands no typed answer',p.d.querySelectorAll('#course-closing input,#course-closing textarea,#end-recall-navigation input,#end-recall-navigation textarea').length===0);
});
results.totalAssertions=results.scenes.reduce((n,s)=>n+s.assertions.length,0);results.failed=results.scenes.flatMap(s=>s.assertions.filter(a=>!a.pass).map(a=>({scene:s.name,...a})));results.errors=results.scenes.filter(s=>s.error).map(s=>({scene:s.name,error:s.error}));fs.writeFileSync(__dirname+'/'+(process.env.RESULT||'correction-game-closing-draft-run-03-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({scenes:results.scenes.length,assertions:results.totalAssertions,failures:results.failed,errors:results.errors},null,2));})();
