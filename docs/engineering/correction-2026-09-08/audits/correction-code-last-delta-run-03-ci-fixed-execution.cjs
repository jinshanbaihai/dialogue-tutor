// Regression for the newly generated course. Native DOM events; no browser-layout claim.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('../repo/node_modules/jsdom');
const html=fs.readFileSync(path.join(__dirname,'correction-code-last-delta-run-03-refresh-snapshot/lesson.html'),'utf8');
async function open(t){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM(html,{url:'https://course.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.HTMLElement.prototype.scrollIntoView=function(){};}});
  t.after(()=>{dom.window.close();assert.deepEqual(errors,[]);});
  await new Promise(resolve=>setImmediate(resolve));
  return dom.window;
}
function click(w,owner,key){
  const b=w.document.querySelector('#dt-activity-'+owner+' [data-r3-control="'+key+'"]');
  assert(b,'missing '+owner+'/'+key);assert(!b.disabled);b.click();
}
test('finite construction separates incomplete, complete wrong, and repair return',async t=>{
  const w=await open(t),state=()=>w.Run03.getState('max-board').conditions.wr;
  click(w,'max-board','path-RR');click(w,'max-board','submit');
  assert.equal(state().history.length,0);assert.equal(state().active,null);
  assert.match(w.document.getElementById('max-board-message').textContent,/待填/);
  click(w,'max-board','mapping-RR-1');click(w,'max-board','weight-wr');
  click(w,'max-board','distribution-1-1');click(w,'max-board','distribution-5-1');
  click(w,'max-board','submit');
  assert.equal(state().history.length,1);assert.equal(state().history[0].judge.correct,false);
  const first=JSON.stringify(state().history[0]);
  click(w,'max-board','next-action');assert(!w.document.getElementById('max-board-repair').hidden);
  click(w,'max-board','repair-source');click(w,'max-board','repair-return');
  assert.equal(w.Run03.getState('max-board').condition,'wr');
  assert.equal(JSON.stringify(state().history[0]),first);
  const answerInputs=[...w.document.querySelectorAll('.dt-activity textarea,.dt-activity input[type="text"],.dt-activity input[type="number"]')].filter(n=>!n.closest('.dt-note'));
  assert.equal(answerInputs.length,0);
});
test('prediction stays pending without presentation and source feedback names the formula',async t=>{
  const w=await open(t);click(w,'mean-lab','compare-eq');click(w,'mean-lab','submit');
  const s=w.Run03.getState('mean-lab').conditions.wr;
  assert.equal(s.history.length,1);assert.equal(s.history[0].presented,false);
  assert.match(w.document.getElementById('mean-lab-feedback').textContent,/待核对/);
  const lesson=JSON.parse(w.document.getElementById('dt-lesson').textContent);
  const a=lesson.activities.find(x=>x.id==='stat-opening');
  assert.equal(a.choices.find(x=>x.id===a.answer).text,'(3+7+11)/3');
  assert(!/第一项|第二项/.test(a.explanation),'feedback must survive option reordering');
  assert.match(a.explanation,/μ/);
});
