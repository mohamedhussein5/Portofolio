// Invitation/recovery email links sometimes land on the public home page.
// Keep the token in the fragment and forward it only to our same-origin editor.
if(/^#(?:invite_token|recovery_token|confirmation_token)=/.test(location.hash)){
 location.replace('/admin/'+location.hash);
}
