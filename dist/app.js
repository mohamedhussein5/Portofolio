const viewer=document.querySelector('#viewer');const picture=document.querySelector('#viewer-image');const title=document.querySelector('#viewer-title');const download=document.querySelector('#download-image');document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{picture.src=button.dataset.image;picture.alt=button.dataset.title;title.textContent=button.dataset.title;download.href=button.dataset.image;viewer.showModal()}));document.querySelector('#close-viewer').addEventListener('click',()=>viewer.close());viewer.addEventListener('click',event=>{if(event.target===viewer){const r=viewer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)viewer.close()}});
const themeToggle=document.querySelector('#theme-toggle');
const menuToggle=document.querySelector('#menu-toggle');
const navigation=document.querySelector('#main-navigation');
function syncTheme(){const dark=document.documentElement.dataset.theme==='dark';themeToggle.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');themeToggle.title=dark?'Switch to light mode':'Switch to dark mode';themeToggle.querySelector('span').textContent=dark?'☀':'◐';}
syncTheme();
themeToggle.addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('portfolio-theme',document.documentElement.dataset.theme)}catch(e){}syncTheme()});
function closeMenu(){navigation.classList.remove('is-open');menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open navigation menu')}
menuToggle.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';navigation.classList.toggle('is-open',open);menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu')});
navigation.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menuToggle.focus()}});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu()});
matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches)closeMenu()});
const sectionObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){navigation.querySelectorAll('a').forEach(a=>{const active=a.hash==='#'+entry.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}})},{rootMargin:'-15% 0px -65% 0px'});
navigation.querySelectorAll('a').forEach(a=>{const section=document.querySelector(a.hash);if(section)sectionObserver.observe(section)});
