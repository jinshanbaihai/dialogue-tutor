'use strict';
// Read-only root review extraction. Run against the formally frozen course.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM}=require('../repo/node_modules/jsdom');
const root=path.resolve(__dirname,'../generation/correction-run-02');
const dst=path.resolve(__dirname,'correction-root-run-02-read');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const raw=fs.readFileSync(path.join(root,'lesson.json'));const lesson=JSON.parse(raw);
fs.mkdirSync(dst,{recursive:true});
const blocks=new Set(['P','DIV','SECTION','ARTICLE','H1','H2','H3','H4','H5','H6','LI','TR','DT','DD','SUMMARY','FIGCAPTION','BUTTON','LABEL','DETAILS']);
function text(n){
 if(n.nodeType===3)return n.nodeValue;
 if(n.nodeType!==1)return '';
 const tag=n.tagName.toUpperCase();if(['SCRIPT','STYLE','NOSCRIPT'].includes(tag))return '';
 const children=[...n.childNodes].map(text);
 if(tag==='MFRAC')return '('+children[0]+')/('+children[1]+')';
 if(tag==='MSUB')return children[0]+'_{'+children[1]+'}';
 if(tag==='MSUP')return children[0]+'^{'+children[1]+'}';
 if(tag==='MSUBSUP')return children[0]+'_{'+children[1]+'}^{'+children[2]+'}';
 if(tag==='MSQRT')return 'sqrt('+children.join('')+')';
 if(tag==='IMG')return '\n[图 '+(n.getAttribute('alt')||'无alt')+']\n';
 const s=children.join('');return blocks.has(tag)?'\n'+s+'\n':s;
}
const entries=[];
for(const [i,s] of lesson.sections.entries()){
 const h=s.bodyHtml||s.html||'';const dom=new JSDOM(h);const readable=text(dom.window.document.body).replace(/[ \t]+/g,' ').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
 const filename=String(i).padStart(2,'0')+'-'+s.id+'.txt';fs.writeFileSync(path.join(dst,filename),s.title+'\n\n'+readable+'\n');entries.push({id:s.id,file:filename,textSHA256:hash(readable),sourceBodySHA256:hash(h),characters:readable.length});dom.window.close();
}
const activities=lesson.activities.map(a=>{const x={...a};if(x.script){x.scriptSHA256=hash(x.script);x.scriptCharacters=x.script.length;delete x.script;}if(x.bodyHtml){const dom=new JSDOM(x.bodyHtml);x.bodyText=text(dom.window.document.body);delete x.bodyHtml;dom.window.close();}return x;});
fs.writeFileSync(path.join(dst,'activities.json'),JSON.stringify(activities,null,2)+'\n');
const snapshot={lessonJSONSHA256:hash(raw),lessonHTMLSHA256:hash(fs.readFileSync(path.join(root,'lesson.html'))),sectionCount:entries.length,activityCount:activities.length,entries,scope:'Static authored sections and activity descriptors. Fractions/subscripts preserved in readable notation. Does not execute runtime or inspect image pixels.'};
fs.writeFileSync(path.join(dst,'snapshot.json'),JSON.stringify(snapshot,null,2)+'\n');console.log(snapshot);
