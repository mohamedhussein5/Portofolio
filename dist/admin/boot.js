const loading=document.getElementById('loading');
const load=src=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.append(script);});
(async()=>{
 try{
  const settings=await fetch('/.netlify/identity/settings');
  if(settings.status===404){
   loading.innerHTML='<h1>One-time sign-in setup needed</h1><p>Your portfolio editor is installed. The site owner must enable Netlify Identity and Git Gateway, set registration to <strong>Invite only</strong>, then invite their email address.</p><p><a href="https://app.netlify.com/projects/mohamedhusseinmohamed/identity" target="_blank" rel="noopener">Open Netlify setup</a></p><p>After activation, reload this page to sign in with your email and password.</p><a href="/">View portfolio</a>';
   return;
  }
  if(!settings.ok)throw new Error('Sign-in service unavailable');
  await load('https://identity.netlify.com/v1/netlify-identity-widget.js');
  await load('https://unpkg.com/decap-cms@3.8.3/dist/decap-cms.js');
  await load('/admin/editor.js');
  if(window.CMS)loading.hidden=true;
 }catch(error){
  loading.querySelector('p').textContent='The editor could not connect. Check your internet connection and reload. Your public portfolio is still available.';
 }
})();
