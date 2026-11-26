"""One-time migration of the existing portfolio to editable CMS data."""
from html.parser import HTMLParser
from html import unescape
from pathlib import Path
import json, re, subprocess

root=Path(__file__).resolve().parents[1]
source=(root/'dist/index.html').read_text(encoding='utf-8')
class Element:
    def __init__(self,tag='',attrs=(),start=0,parent=None):
        self.tag=tag; self.attrs=dict(attrs); self.start=start; self.parent=parent; self.children=[]; self.end=start; self.open_end=start
    def all(self,tag=None,cls=None):
        result=[]
        for c in self.children:
            if (not tag or c.tag==tag) and (not cls or cls in c.attrs.get('class','').split()): result.append(c)
            result.extend(c.all(tag,cls))
        return result
    def one(self,tag=None,cls=None): return self.all(tag,cls)[0]
    def raw(self): return source[self.start:self.end]
    def inner(self): return source[self.open_end:self.close_start]
    def text(self): return re.sub(r'\s+',' ',unescape(re.sub('<[^>]+>',' ',self.inner()))).strip()
class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False); self.root=Element(); self.stack=[self.root]; self.lines=[0]
        for m in re.finditer('\n',source):self.lines.append(m.end())
    def pos(self):
        l,c=self.getpos();return self.lines[l-1]+c
    def handle_starttag(self,t,a):
        n=Element(t,a,self.pos(),self.stack[-1]);n.open_end=n.start+len(self.get_starttag_text());self.stack[-1].children.append(n)
        if t not in ['meta','link','img','br','input','hr','source','wbr']:self.stack.append(n)
        else:n.end=n.open_end;n.close_start=n.open_end
    def handle_endtag(self,t):
        if not any(n.tag==t for n in self.stack):return
        while self.stack[-1].tag!=t:self.stack.pop()
        n=self.stack.pop();n.close_start=self.pos();n.end=source.index('>',n.close_start)+1
p=Parser();p.feed(source);dom=p.root
lang=(root/'dist/languages.js').read_text(encoding='utf-8')
extract="const dictionary="+lang.split('const dictionary=',1)[1].split(';\nconst projects=',1)[0]+";\nconst projects="+lang.split('const projects=',1)[1].split(';\nconst about=',1)[0]+";\nconst about="+lang.split('const about=',1)[1].split(';\nconst toggle=',1)[0]+"; console.log(JSON.stringify({dictionary,projects,about}));"
translations=json.loads(subprocess.check_output(['node','-e',extract],text=True,encoding='utf-8'))
dictionary=translations['dictionary']; dump=lambda path,value:(root/path).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def so(text):return dictionary.get(text,'')
replacements=[]
def replace(n,key,inner=False):replacements.append((n.open_end if inner else n.start,n.close_start if inner else n.end,'{{'+key+'}}'))
hero=dom.one('section','hero'); intro=hero.one('p','intro'); edu=hero.one('p','education-summary')
profile={'name':'Mohamed Hussein Mohamed','headline':hero.one('p','eyebrow').text(),'headline_so':so(hero.one('p','eyebrow').text()),'intro':intro.text(),'intro_so':'Waxaan ahay arday cilmiga kombiyuutarka, naqshadeeye garaafik iyo xirfadle warbaahineed oo khibrad u leh tiknoolajiyada, waxbarashada iyo isgaarsiinta dijitaalka ah. Waxaan isku daraa aqoon farsamo iyo fikir hal-abuur leh si aan u dhiso xalal waxtar leh, fikradahana si hufan u gudbiyo.','degree':'Bachelor in Computer Science (Honours)','university':'Studying at Kuala Lumpur University of Science and Technology (KLUST)','progress':'Semester 5 · CGPA 3.7','portrait':hero.one('img').attrs['src'],'years':'3+ years'}
replace(hero.one('p','eyebrow'),'HEADLINE');replace(hero.one('h1'),'NAME');replace(intro,'INTRO');replace(edu,'EDUCATION');replace(hero.one('img'),'PORTRAIT');replace(hero.one('div','hero-meta'),'METRICS')
about=dom.one('div','about-copy'); profile['about']=[{'text':x.text(),'text_so':translations['about'][i]} for i,x in enumerate(about.children) if x.tag=='p']; replace(about,'ABOUT',True)
profile['about_title']='Creative by experience.';profile['about_subtitle']='Driven by technology.'
profile['facts']=[{'label':d.one('span').text(),'value':d.one('strong').text(),'value_so':so(d.one('strong').text())} for d in about.one('div','about-facts').children]
replace(next(s for s in dom.all('section') if s.attrs.get('id')=='about').one('h2'),'ABOUT_TITLE')
contact=dom.one('div','contact-links');profile['contacts']=[{'label':a.one('span').text(),'name':a.one('strong').text().replace(' ↗',''),'url':a.attrs['href']} for a in contact.children];replace(contact,'CONTACTS',True)
skills=dom.one('div','skills-grid');profile['skill_groups']=[]
for a in skills.children:
    items=[{'name':li.text(),'detail':''} for li in a.all('li')]
    if not items:items=[{'name':d.one('dt').text(),'detail':d.one('dd').text()} for d in a.one('dl').children]
    profile['skill_groups'].append({'title':a.one('h3').text(),'items':items})
replace(skills,'SKILLS',True);dump('content/profile.json',profile)
experiences=[];grid=dom.one('div','experience-grid')
for a in grid.children:
    desc=a.one('p').text();role=a.one('h3').text();status=a.one('span','role-status').text()
    experiences.append({'role':role,'role_so':so(role),'organization':a.one('h4').text(),'status':status,'status_so':so(status),'description':desc,'description_so':so(desc)})
replace(grid,'EXPERIENCE',True);dump('content/experience.json',{'items':experiences})
projects=[];categories=[];i=0
for cat in dom.all('section','project-category'):
    ident=cat.attrs['id'];label=cat.one('h3').text();categories.append({'id':ident,'title':label,'title_so':so(label)})
    for item in cat.all('details','project'):
        body=item.one('div','project-body');description=body.one('p').text(); links=[];images=[]
        for a in body.all('a'):links.append({'label':a.text().replace(' ↗','').replace(' ↓',''),'url':a.attrs['href']})
        for b in body.all('button'):
            if b.attrs.get('data-image'):images.append({'label':b.attrs.get('data-title',b.text()),'image':b.attrs['data-image']})
        methods=body.all('p','methods')
        projects.append({'title':item.one('span','project-title').text(),'category':ident,'kind':item.one('span','project-kind').text(),'description':description,'description_so':translations['projects'][i],'methods':methods[0].text() if methods else '', 'images':images,'links':links,'anchor':item.attrs.get('id','')});i+=1
    container=next(c for c in cat.children if c.all('details','project'));replace(container,'PROJECTS_'+ident,True)
dump('content/projects.json',{'items':projects});dump('content/categories.json',{'items':categories})
certs=[]
for b in dom.all('button','certificate'):
    certs.append({'title':b.attrs['data-title'],'issuer':b.one('span','cert-issuer').text(),'date':b.one('span','cert-date').text().replace(' ↗',''),'image':b.attrs['data-image'],'document':b.attrs.get('data-document','')})
grid=dom.one('div','cert-grid') if dom.all('div','cert-grid') else dom.one('div','certificate-grid')
replace(grid,'CERTIFICATES',True);dump('content/certificates.json',{'items':certs})
for start,end,value in sorted(replacements,reverse=True):source=source[:start]+value+source[end:]
(root/'src/index.template.html').write_text(source,encoding='utf-8')
dump('src/translations.json',dictionary)
print(f'Migrated {len(projects)} projects, {len(certs)} certificates, {len(experiences)} roles.')
