const fs=require('fs'),path=require('path'),crypto=require('crypto'),{JSDOM}=require('../repo/node_modules/jsdom');
const root=__dirname,dir=path.join(root,'correction-code-last-delta-run-03-shelf-snapshot'),read=(d,f)=>fs.readFileSync(path.join(d,f),'utf8'),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const html=read(dir,'lesson.html'),doc=new JSDOM(html).window.document,frames=JSON.parse(read(dir,'html-frame-map.json')),checks=[];
const ck=(name,pass,evidence)=>checks.push({name,pass:!!pass,evidence});
const prior=path.join(root,'correction-code-last-delta-run-03-refresh-snapshot'),a=JSON.parse(read(prior,'lesson.json')),b=JSON.parse(read(dir,'lesson.json'));
b.sections[4].bodyHtml=b.sections[4].bodyHtml.replaceAll('shelf-wor-group-7over2','shelf-wor-group-7-2').replaceAll('shelf-wor-group-11over2','shelf-wor-group-11-2');
ck('lesson JSON exact equality after reversing two anchor prefixes',JSON.stringify(a)===JSON.stringify(b));
ck('components JS byte identical',read(prior,'components.js')===read(dir,'components.js'));
const shelf=frames.find(f=>f.frameId==='shelf-wor-bars');
for(const [id,paths] of [['shelf-wor-group-7over2',['JK','KJ']],['shelf-wor-group-11over2',['JL','LJ']]]){
 const nodes=doc.querySelectorAll('[id="'+id+'"]'),node=nodes[0];
 ck(id+'/unique actual section',nodes.length===1&&node.tagName==='SECTION');
 ck(id+'/metadata and complete written group',shelf.lineIds.includes(id)&&shelf.proofLineIds.includes(id)&&paths.every(p=>node.textContent.includes(p))&&node.querySelectorAll('.r3-line').length===7,{lines:node.querySelectorAll('.r3-line').length});
}
ck('all shelf metadata anchors actual and unique',shelf.lineIds.concat(shelf.proofLineIds,shelf.returnLineId).every(id=>doc.querySelectorAll('[id="'+id+'"]').length===1));
const imgs=[...doc.images],png=imgs.find(x=>x.src.startsWith('data:image/png;base64,')&&sha(Buffer.from(x.src.split(',')[1],'base64'))===shelf.pngSha256);
ck('actual static image bytes match shelf manifest',!!png,{expected:shelf.pngSha256});
const result={htmlHash:sha(html),scope:'Static DOM parse of final anchor-only draft delta; no JS execution or image decode asserted.',checks,summary:{checks:checks.length,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass)}};
fs.writeFileSync(path.join(root,'correction-code-last-delta-run-03-shelf-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result.summary));if(result.summary.failed.length)process.exitCode=1;
