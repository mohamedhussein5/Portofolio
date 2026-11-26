const toggle=document.querySelector('#language-toggle');
const nodes=[];
const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('script,style,[data-so]')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
while(walker.nextNode()){
 const node=walker.currentNode,key=node.textContent.trim();
 if(dictionary[key])nodes.push({node,en:node.textContent,so:node.textContent.replace(key,dictionary[key])});
}
const bilingual=[...document.querySelectorAll('[data-so]')].map(el=>({el,en:el.innerHTML,so:el.dataset.so}));
function applyLanguage(lang){
 document.documentElement.lang=lang;
 nodes.forEach(x=>x.node.textContent=lang==='so'?x.so:x.en);
 bilingual.forEach(x=>{if(lang==='so'&&x.so)x.el.textContent=x.so;else x.el.innerHTML=x.en;});
 toggle.textContent=lang==='so'?'EN':'SO';toggle.setAttribute('aria-label',lang==='so'?'Switch to English':'U beddel Af-Soomaali');toggle.title=lang==='so'?'English':'Af-Soomaali';
 try{localStorage.setItem('portfolio-language',lang)}catch(e){}
}
toggle.addEventListener('click',()=>applyLanguage(document.documentElement.lang==='so'?'en':'so'));
let initial='en';try{initial=localStorage.getItem('portfolio-language')==='so'?'so':'en'}catch(e){}applyLanguage(initial);
