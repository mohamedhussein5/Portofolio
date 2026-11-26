// Provide a useful form error instead of allowing an incomplete certificate
// to fail later during deployment. Authentication remains server-managed.
if(window.CMS){
 CMS.registerEventListener({name:'preSave',handler:({entry})=>{
  if(entry.get('slug')==='certificates'){
   const items=entry.getIn(['data','items']);
   items?.forEach(item=>{
    if(!item.get('image')&&!item.get('document'))throw new Error('Add a preview image or PDF for '+(item.get('title')||'each certificate')+'.');
   });
  }
 }});
}
