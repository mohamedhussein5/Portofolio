import fs from 'node:fs';
const field=(name,label,widget='string',extra={})=>({name,label,widget,...extra});
const optional=(name,label,widget='string',extra={})=>field(name,label,widget,{required:false,...extra});
const bilingual=(name,label,widget='string')=>[field(name,label,widget),optional(name+'_so',label+' — Somali',widget,{hint:'Optional. English is shown if this translation is empty.'})];
const list=(name,label,fields,extra={})=>field(name,label,'list',{collapsed:true,fields,...extra});
const file=(name,label,fields)=>({name,label,file:'content/'+name+'.json',format:'json',fields});
const config={backend:{name:'git-gateway',branch:'main'},site_url:'https://mohamedhusseinmohamed.netlify.app',display_url:'https://mohamedhusseinmohamed.netlify.app',logo_url:'/favicon.svg',media_folder:'dist/assets/uploads',public_folder:'/assets/uploads',publish_mode:'simple',editor:{preview:false},collections:[{name:'portfolio',label:'Manage portfolio',description:'Edit your content, upload files and publish. The order of list items controls their order on the website. Changes go live after Netlify finishes deploying.',files:[
 file('profile','Profile, About, skills & contact',[
 field('name','Your full name'),...bilingual('headline','Introduction heading'),...bilingual('intro','Introduction','text'),field('portrait','Profile photo','image'),...bilingual('degree','Degree'),...bilingual('university','University'),...bilingual('progress','Semester and CGPA'),field('years','Graphic design experience'),...bilingual('about_title','About heading — first line'),...bilingual('about_subtitle','About heading — second line'),
 list('about','About paragraphs',bilingual('text','Paragraph','text')),
 list('facts','About information',[field('label','Label'),...bilingual('value','Value')]),
 list('skill_groups','Skills and languages',[field('title','Group title'),list('items','Skills / languages',[field('name','Skill or language'),optional('detail','Language proficiency (leave empty for skills)')])]),
 list('contacts','Contact and social links',[field('label','Label'),field('name','Displayed text'),field('url','Link','string',{hint:'Use https:// for websites, mailto: for email, or tel: for calls.'})])
 ]),
 file('certificates','Certificates & awards',[list('items','Certificates',[
 field('title','Certificate title'),field('issuer','Issuing organization'),field('date','Date / qualification details'),optional('image','Certificate preview image','image'),optional('document','Original PDF','file',{media_folder:'/dist/reports/uploads',public_folder:'/reports/uploads',hint:'Upload a PDF. Add a preview image too if you want an image card; otherwise visitors open the PDF directly.'})
 ],{summary:'{{fields.title}} — {{fields.issuer}}'})]),
 file('projects','Projects',[list('items','Projects',[
 field('title','Project title'),field('category','Project group','select',{options:[{label:'Independent projects',value:'independent-projects'},{label:'Academic — Data & databases',value:'category-0'},{label:'Academic — Design & graphics',value:'category-1'},{label:'Academic — Software & systems',value:'category-2'},{label:'Academic — Networks & computing',value:'category-3'},{label:'Academic — Business & research',value:'category-4'},{label:'Academic — Sustainability & communication',value:'category-5'}]}),
 field('kind','Type / your contribution'),...bilingual('description','Project description','text'),optional('methods','Tools, technology and methods','text'),list('images','Screenshots and previews',[field('label','Caption'),field('image','Image','image')],{required:false}),list('links','Report, code and design links',[field('label','Button label'),field('url','URL or uploaded report','file',{media_folder:'/dist/reports/uploads',public_folder:'/reports/uploads',hint:'Upload a report or select Insert from URL for a GitHub, Figma or other https:// link.'})],{required:false}),optional('anchor','Section link ID (normally leave unchanged)')
 ],{summary:'{{fields.title}}'})]),
 file('experience','Work & volunteer experience',[list('items','Experience',[
 ...bilingual('role','Role'),field('organization','Organization'),...bilingual('status','Current / Previous / Volunteer'),...bilingual('description','Responsibilities','text')
 ],{summary:'{{fields.role}} — {{fields.organization}}'})])
 ]}]};
fs.mkdirSync('dist/admin',{recursive:true});fs.writeFileSync('dist/admin/config.yml',JSON.stringify(config,null,2)+'\n');
