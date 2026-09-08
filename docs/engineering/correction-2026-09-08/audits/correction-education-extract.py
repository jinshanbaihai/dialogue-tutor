from pathlib import Path
from html.parser import HTMLParser
import hashlib,json
class Text(HTMLParser):
 def __init__(self): super().__init__();self.skip=0;self.parts=[]
 def handle_starttag(self,t,a):
  if t in ('style','script'):self.skip+=1
  elif t in ('p','div','tr','h1','h2','h3','h4','li','summary'):self.parts.append('\n')
  elif t in ('td','th'): self.parts.append(' | ')
 def handle_endtag(self,t):
  if t in ('script','style'):self.skip-=1
  elif t in ('p','div','tr','h1','h2','h3','h4','li','summary'):self.parts.append('\n')
 def handle_data(self,s):
  if not self.skip:self.parts.append(s)
 def value(self):return '\n'.join(x.strip() for x in ''.join(self.parts).splitlines() if x.strip())
def plain(s):p=Text();p.feed(s);return p.value()
r=Path('generation/correction-run-01')
for f in ['lesson.html','lesson.json','delivery-manifest.json']:print(f,hashlib.sha256((r/f).read_bytes()).hexdigest())
Path('reviews/correction-education-static.txt').write_text(plain((r/'lesson.html').read_text()))
l=json.loads((r/'lesson.json').read_text())
out=[]
for a in l['activities']:
 out.append('\nACTIVITY '+a['id']+' '+a['type']+' '+a.get('format',''))
 for k,v in a.items():
  if k in ('script','id','type','format'):continue
  if k=='bodyHtml':out.append(k+': '+plain(v))
  elif isinstance(v,(list,dict)):out.append(k+': '+json.dumps(v,ensure_ascii=False))
  else:out.append(k+': '+str(v))
Path('reviews/correction-education-activities.txt').write_text('\n'.join(out))
print('ACTIVITIES', [(a['id'],a['type'],a.get('format')) for a in l['activities']]);print('SECTIONS',[(s['id'],s['title']) for s in l['sections']])
print('STATIC_LINES',len(Path('reviews/correction-education-static.txt').read_text().splitlines()))
print('ACTIVITY_LINES',len('\n'.join(out).splitlines()))
