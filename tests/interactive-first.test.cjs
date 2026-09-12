const {test}=require('node:test');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(__dirname+'/../docs/interactive-first.html','utf8');
const results=[];
async function make(stored,speech=false){
 const errors=[],spoken=[],downloads=[],blobs=[];let cancels=0,pauses=0,resumes=0;
 const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://example.test/balance',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
  w.HTMLElement.prototype.scrollIntoView=()=>{};w.URL.createObjectURL=b=>{blobs.push(b);return 'blob:download'};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){downloads.push(this.download)};
  if(stored)Object.entries(stored).forEach(([k,v])=>w.localStorage.setItem(k,v));
  if(speech){w.SpeechSynthesisUtterance=function(t){this.text=t};w.speechSynthesis={getVoices:()=>[{name:'zh-CN-XiaoxiaoNeural',lang:'zh-CN',voiceURI:'test-xiaoxiao'}],speak:u=>spoken.push(u),cancel:()=>cancels++,pause:()=>pauses++,resume:()=>resumes++,addEventListener:()=>{},removeEventListener:()=>{}};}
 }});
 await new Promise(r=>dom.window.document.addEventListener('dt:ready',r,{once:true}));
 const w=dom.window,d=w.document,api=w.DialogueTutor.instance;
 const q=s=>{const n=d.querySelector(s);assert.ok(n,'missing '+s);return n};
 const ctl=(id,n)=>q(`[data-dt-activity="${id}"] [data-dt-control="${n}"]`);
 return {w,d,api,q,ctl,errors,spoken,downloads,blobs,getSpeech:()=>({cancels,pauses,resumes}),close:()=>{assert.deepEqual(errors,[]);dom.window.close()}};
}
async function run(){
 let p=await make();
 assert.match(p.q('[data-formula]').textContent,/2x\+3=11/);
 assert.equal(p.q('[data-drawing]').querySelectorAll('rect').length,16);
 p.q('[data-one]').click();assert.match(p.q('[data-reason]').textContent,/右盘下沉/);assert.match(p.q('[data-formula]').textContent,/≠/);
 p.q('[data-next]').click();assert.match(p.q('[data-formula]').textContent,/2x\+3=11/);
 const expected=['(2x+3)−3=11−3','2x=11−3','2x=8','(2x)÷2=8÷2','x=8÷2','x=4','2×4+3=11','8+3=11','11=11'];
 for(const value of expected){p.q('[data-next]').click();assert.equal(p.q('[data-formula]').textContent,value);}
 assert.equal(p.q('[data-next]').disabled,true);
 p.q('[data-prev]').click();assert.equal(p.q('[data-formula]').textContent,'8+3=11');
 p.q('[data-reset]').click();for(let i=0;i<4;i++)p.q('[data-next]').click();
 assert.equal(p.q('[data-drawing]').querySelectorAll('[stroke-dasharray]').length,4);
 assert.equal(p.api.getState().activities['balance-main'].exploration.step,4);
 results.push('初始模型、单侧失衡、恢复、9次前进、回退、重置、平均分组通过；方程与状态对应。');
 p.ctl('balance-main','bookmark').click();
 const note=p.q('[data-dt-activity="balance-main"] .dt-note textarea');note.value='两边必须做相同操作';note.dispatchEvent(new p.w.Event('input',{bubbles:true}));
 const stored=Object.fromEntries(Object.entries(p.w.localStorage));p.close();p=await make(stored);
 assert.equal(p.api.getState().activities['balance-main'].exploration.step,4);assert.equal(p.q('[data-formula]').textContent,'(2x)÷2=8÷2');assert.equal(p.api.getState().activities['balance-main'].bookmarked,true);assert.equal(p.api.getState().activities['balance-main'].notes,'两边必须做相同操作');
 results.push('刷新模拟恢复天平第4步、书签、笔记通过。');
 p.ctl('practice','answer').value='6';p.ctl('practice','answer').dispatchEvent(new p.w.Event('input',{bubbles:true}));p.ctl('practice','submit').click();
 assert.equal(p.api.getState().activities.practice.attempts[0].correct,false);
 p.ctl('practice','retry').click();p.ctl('practice','answer').value='5';p.ctl('practice','answer').dispatchEvent(new p.w.Event('input',{bubbles:true}));p.ctl('practice','submit').click();
 const ats=p.api.getState().activities.practice.attempts;assert.equal(ats[1].correct,true);assert.equal(ats[1].assisted,true);
 results.push('错误6、重试正确5通过；看过反馈后的正确保留 assisted。');
 p.q('[data-dt-control="export"]').click();assert.equal(p.downloads.length,1);
 const exported=await new Promise(resolve=>{let r=new p.w.FileReader();r.onload=()=>resolve(r.result);r.readAsText(p.blobs[0]);});
 p.q('[data-reset]').click();const upload=p.q('[data-dt-study] input[type=file]');Object.defineProperty(upload,'files',{value:[{size:exported.length,text:async()=>exported}]});upload.dispatchEvent(new p.w.Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,25));assert.equal(p.api.getState().activities['balance-main'].exploration.step,4);assert.equal(p.q('[data-formula]').textContent,'(2x)÷2=8÷2');
 results.push('导出 JSON 并通过文件 change 事件导入：模型状态恢复通过。');p.close();
 p=await make();p.ctl('practice','answer').value='5';p.ctl('practice','answer').dispatchEvent(new p.w.Event('input',{bubbles:true}));p.ctl('practice','submit').click();assert.equal(p.api.getState().activities.practice.attempts[0].assisted,false);assert.equal(p.api.getState().activities.practice.attempts[0].correct,true);p.close();
 p=await make();p.ctl('practice','hint').click();assert.equal(p.api.getState().activities.practice.hintUsed,true);p.ctl('practice','skip').click();assert.equal(p.api.getState().activities.practice.status,'skipped');assert.equal(p.api.getState().activities.practice.attempts.length,0);p.ctl('practice','reveal').click();assert.equal(p.api.getState().activities.practice.answerRevealed,true);p.close();
 results.push('新会话独立正确、提示标记、跳过不计答错、主动揭示通过。');
 p=await make(undefined,true);p.ctl('practice','speech-play').click();assert.equal(p.spoken[0].rate,1.5);assert.equal(p.spoken[0].voice.name,'zh-CN-XiaoxiaoNeural');assert.ok(!p.spoken[0].text.includes('每袋有 5'));p.ctl('practice','speech-play').click();assert.equal(p.getSpeech().pauses,1);p.ctl('practice','speech-play').click();assert.equal(p.getSpeech().resumes,1);p.ctl('practice','speech-stop').click();p.ctl('practice','speech-replay').click();assert.equal(p.spoken.length,2);p.ctl('balance-main','speech-play').click();const before=p.getSpeech().cancels;p.q('[data-next]').click();assert.ok(p.getSpeech().cancels>before);
 results.push('语音替身：1.5×、可用 Xiaoxiao 优先、题目不含答案、暂停/继续/停止/重播、操作模型后停止旧朗读通过。');p.close();
 assert.equal(results.length,6);
}
test('generated balance lesson supports linked derivation, restoration, transfer and speech', {timeout: 10000}, run);
