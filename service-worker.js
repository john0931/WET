(()=>{'use strict';
const status=document.getElementById('offline-status'),label=document.getElementById('offline-status-label'),installButton=document.getElementById('install-app');
let ready=false,failed=false,installPrompt=null;
function paint(){
 if(!status||!label)return;
 const online=navigator.onLine;
 let text,state,aria;
 if(!('serviceWorker'in navigator)){state='error';text=online?'Online only':'Offline · unavailable';aria='Offline use is unavailable in this browser.';}
 else if(failed&&!ready){state='error';text=online?'Offline setup failed':'Offline · unavailable';aria='Offline copy could not be prepared. Connect to the internet and reload.';}
 else if(!online){state=ready?'offline':'error';text=ready?'Offline · cached':'Offline · not ready';aria=ready?'Offline; using the saved app copy.':'Offline copy is not ready on this device.';}
 else if(ready){state='ready';text='Offline copy ready';aria='Offline copy is ready on this device.';}
 else{state='checking';text='Preparing offline copy';aria='Downloading app files for offline use.';}
 status.dataset.state=state;label.textContent=text;status.setAttribute('aria-label',aria);
}
function bindWorker(registration){
 const update=()=>{if(registration.active){ready=true;failed=false;paint();}};
 update();
 if(registration.installing)registration.installing.addEventListener('statechange',()=>{
  if(registration.installing?.state==='redundant'&&!registration.active){failed=true;paint();}
  update();
 });
 registration.addEventListener('updatefound',()=>{
  const worker=registration.installing;if(!worker)return;
  worker.addEventListener('statechange',()=>{
   if(worker.state==='redundant'&&!registration.active){failed=true;paint();}
   update();
  });
 });
 navigator.serviceWorker.ready.then(reg=>{ready=!!reg.active;failed=false;paint();}).catch(()=>{failed=true;paint();});
}
if('serviceWorker'in navigator){
 navigator.serviceWorker.register('./service-worker.js',{scope:'./'}).then(bindWorker).catch(()=>{failed=true;paint();});
}else{failed=true;}
window.addEventListener('online',paint);window.addEventListener('offline',paint);paint();
window.addEventListener('beforeinstallprompt',event=>{
 event.preventDefault();installPrompt=event;
 if(installButton)installButton.hidden=false;
});
if(installButton)installButton.addEventListener('click',async()=>{
 if(!installPrompt)return;
 installPrompt.prompt();const choice=await installPrompt.userChoice;
 installPrompt=null;installButton.hidden=true;
 const main=document.getElementById('status');
 if(main)main.textContent=choice?.outcome==='accepted'?'Kitchen Studio installed.':'Install can be started from your browser menu.';
});
window.addEventListener('appinstalled',()=>{if(installButton)installButton.hidden=true;});
})();