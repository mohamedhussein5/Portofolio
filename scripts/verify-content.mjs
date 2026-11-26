import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/cms-config.mjs']);
execFileSync(process.execPath,['scripts/build.mjs']);
const data=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const projects=data('content/projects.json'),certs=data('content/certificates.json');
const html=fs.readFileSync('dist/index.html','utf8');
assert.equal((html.match(/<details class="project"/g)||[]).length,projects.items.length);
assert.equal((html.match(/class="certificate"/g)||[]).length,certs.items.length);
assert(!/\{\{[A-Z_]+\}\}/.test(html));
for(const f of ['dist/app.js','dist/languages.js'])execFileSync(process.execPath,['--check',f]);
const values=[];
function visit(value){if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object'){for(const [key,v] of Object.entries(value)){if(['image','document','portrait','url'].includes(key)&&typeof v==='string'&&/^(\/?)(assets|reports|downloads)\//.test(v))values.push(v);else visit(v);}}}
for(const file of ['profile','projects','certificates','experience'])visit(data('content/'+file+'.json'));
for(const value of values)assert(fs.existsSync('dist/'+value.replace(/^\//,'')),`Missing resource: ${value}`);
// Prove edits, additions and deletion feed the generated website, then restore the real content.
const original=fs.readFileSync('content/certificates.json','utf8');
try{
 certs.items.unshift({title:'CMS verification certificate',issuer:'Test',date:'Test',document:'/reports/aws-security-best-practices-computing.pdf'});
 fs.writeFileSync('content/certificates.json',JSON.stringify(certs));execFileSync(process.execPath,['scripts/build.mjs']);
 const changed=fs.readFileSync('dist/index.html','utf8');assert(changed.includes('CMS verification certificate'));assert(changed.includes('certificate-pdf'));
}finally{fs.writeFileSync('content/certificates.json',original);execFileSync(process.execPath,['scripts/build.mjs']);}
const config=data('dist/admin/config.yml');
assert.equal(config.backend.name,'git-gateway');assert.equal(config.backend.branch,'main');
assert(!config.local_backend,'Never ship a local authentication bypass');
assert(!fs.readFileSync('dist/index.html','utf8').includes('CMS verification certificate'));
console.log(`Verified ${projects.items.length} projects, ${certs.items.length-1} certificates, media paths, bilingual build and CMS edit flow.`);
