import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const profile=read('content/profile.json'), projects=read('content/projects.json').items;
const certificates=read('content/certificates.json').items, roles=read('content/experience.json').items;
const categories=read('content/categories.json').items;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function url(value){
  const s=String(value??'').trim();
  if(!s)return '';
  if(/^https:\/\//i.test(s)||/^(mailto:|tel:)/i.test(s))return esc(s);
  if(/^(?:\/?)(?:assets|reports|downloads)\/[a-z0-9_./% ()@+,&-]+$/i.test(s)&&!s.includes('..'))return esc(s.replace(/^\//,''));
  throw new Error(`Unsupported link or media path: ${s}`);
}
const bi=(tag,cls,en,so)=>`<${tag}${cls?` class="${cls}"`:''}${so?` data-so="${esc(so)}"`:''}>${esc(en)}</${tag}>`;
const paragraphs=(en,so)=>String(en||'').split(/\n\s*\n/).map((p,i)=>bi('p','',p,String(so||'').split(/\n\s*\n/)[i])).join('');
const name=profile.name.trim().split(/\s+/);const last=name.pop();
const values={
  HEADLINE:bi('p','eyebrow',profile.headline,profile.headline_so),
  NAME:`<h1>${esc(name.join(' '))}<br><em>${esc(last)}.</em></h1>`,
  INTRO:`<p class="intro"${profile.intro_so?` data-so="${esc(profile.intro_so)}"`:''}>${esc(profile.intro).replace(/Computer Science student|graphic designer/g,text=>`<strong class="highlight">${text}</strong>`)}</p>`,
  EDUCATION:`<p class="education-summary">${bi('span','',profile.degree,profile.degree_so)}<br>${bi('span','',profile.university,profile.university_so)}<br>${bi('strong','',profile.progress,profile.progress_so)}</p>`,
  PORTRAIT:`<img src="${url(profile.portrait)}" alt="${esc(profile.name)}" width="853" height="1280" fetchpriority="high">`,
  METRICS:`<div class="hero-meta"><span><strong>${esc(profile.years)}</strong>Graphic design experience</span><span><strong>${projects.length} projects</strong>Independent and academic work</span></div>`,
  ABOUT_TITLE:`<h2>${bi('span','',profile.about_title,profile.about_title_so)}<br>${bi('em','',profile.about_subtitle,profile.about_subtitle_so)}</h2>`,
  ABOUT:profile.about.map(p=>bi('p','',p.text,p.text_so)).join('')+`<div class="about-facts">${profile.facts.map(f=>`<div><span>${esc(f.label)}</span>${bi('strong','',f.value,f.value_so)}</div>`).join('')}</div>`,
  CONTACTS:profile.contacts.map(c=>`<a href="${url(c.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(c.label)}</span><strong>${esc(c.name)}</strong></a>`).join(''),
  SKILLS:profile.skill_groups.map((g,i)=>`<article><span class="skill-number">${String(i+1).padStart(2,'0')}</span><h3>${esc(g.title)}</h3>${g.items.some(x=>x.detail)?`<dl class="languages">${g.items.map(x=>`<div><dt>${esc(x.name)}</dt><dd>${esc(x.detail)}</dd></div>`).join('')}</dl>`:`<ul class="skill-chips">${g.items.map(x=>`<li>${esc(x.name)}</li>`).join('')}</ul>`}</article>`).join(''),
  EXPERIENCE:roles.map(r=>`<article class="experience-card">${bi('span','role-status',r.status,r.status_so)}${bi('h3','',r.role,r.role_so)}<h4>${esc(r.organization)}</h4>${bi('p','',r.description,r.description_so)}</article>`).join(''),
  CERTIFICATES:certificates.map(c=>{
    if(!c.title||!c.issuer||(!c.image&&!c.document))throw new Error('A certificate needs a title, issuer and image or PDF.');
    const copy=`<span class="cert-copy"><span class="cert-issuer">${esc(c.issuer)}</span><strong>${esc(c.title)}</strong><span class="cert-date">${esc(c.date)}</span></span>`;
    if(!c.image)return `<a class="certificate" href="${url(c.document)}" target="_blank" rel="noopener"><span class="certificate-image certificate-pdf">PDF<br>View certificate</span>${copy}</a>`;
    return `<button class="certificate" data-image="${url(c.image)}" data-title="${esc(c.title)}"${c.document?` data-document="${url(c.document)}"`:''}><span class="certificate-image"><img loading="lazy" src="${url(c.image)}" alt="${esc(c.title)}"></span>${copy}</button>`;
  }).join('')
};
for(const c of categories){
 values['PROJECTS_'+c.id]=projects.filter(p=>p.category===c.id).map((p,i)=>`<details class="project"${p.anchor?` id="${esc(p.anchor)}"`:''}><summary><span class="project-index">${String(i+1).padStart(2,'0')}</span><span><span class="project-kind">${esc(p.kind)}</span><span class="project-title">${esc(p.title)}</span></span><span class="plus" aria-hidden="true">+</span></summary><div class="project-body">${paragraphs(p.description,p.description_so)}<p class="methods">${esc(p.methods)}</p>${p.images?.length?`<div class="cyber-gallery">${p.images.map(x=>`<button class="cyber-gallery-item" data-image="${url(x.image)}" data-title="${esc(x.label)}"><img loading="lazy" src="${url(x.image)}" alt="${esc(x.label)}"><span>${esc(x.label)}</span></button>`).join('')}</div>`:''}${p.links?.length?`<div class="project-actions">${p.links.map(l=>`<a class="report-link" href="${url(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</div>`:''}</div></details>`).join('');
}
for(const p of projects)if(!categories.some(c=>c.id===p.category))throw new Error('Unknown project category: '+p.category);
let html=fs.readFileSync(path.join(root,'src/index.template.html'),'utf8').replace(/\{\{([A-Z_a-z0-9-]+)\}\}/g,(_,key)=>{
 if(!(key in values))throw new Error('Unknown template key '+key);return values[key];
});
html=html.replace('49 projects',`${projects.length} projects`);
html=html.replace(/Mohamed Hussein Mhamed|Mohamed Hussein Mohamed/g,()=>esc(profile.name)).replace(/MOHAMED HUSSEIN MHAMED/g,()=>esc(profile.name.toUpperCase()));
fs.writeFileSync(path.join(root,'dist/index.html'),html);
const languageRuntime=fs.readFileSync(path.join(root,'src/languages-runtime.js'),'utf8');
fs.writeFileSync(path.join(root,'dist/languages.js'),'(()=>{\nconst dictionary='+JSON.stringify(read('src/translations.json'))+';\n'+languageRuntime+'\n})();\n');
console.log(`Built ${projects.length} projects, ${certificates.length} certificates, ${roles.length} roles.`);
