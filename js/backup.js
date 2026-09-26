(()=>{'use strict';
const $=id=>document.getElementById(id), STUDIO=window.MUSIE_STUDIO, BUDGET=window.MUSIE_BUDGET;
const FORMAT='musie-project-backup',VERSION=1,PROJECT='79 Chemin Musie · Kitchen Studio';
const WORK='musie-studio-v4-working',STORE='musie-studio-v4',DECISIONS='musie-studio-v4-decisions';
const LEGACY=['musie3d-v1-A','musie3d-v1-B'],MAX_BYTES=25000000,MAX_CONCEPTS=100;
const decisionIds=['ikea-list','centura-payment','countertop-choice','floor-pattern','sink-choice','hood-fit'];
let staged=null;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),plain=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
function parse(raw,label){try{return JSON.parse(raw);}catch{throw Error(label+' is not valid JSON.');}}
function stored(key,fallback){const value=localStorage.getItem(key);return value===null?fallback:parse(value,key);}
function validateDecisions(raw){
 if(!plain(raw))throw Error('Decision records must be an object.');
 const out={};
 for(const [id,r] of Object.entries(raw)){
  if(!decisionIds.includes(id)||!plain(r)||r.resolved!==true||typeof r.note!=='string'||r.note.length>500||typeof r.date!=='string'||!Number.isFinite(Date.parse(r.date)))throw Error('Decision record '+id+' is invalid.');
  out[id]={resolved:true,note:r.note,date:r.date};
 }
 return out;
}
function validateStore(raw){
 if(!plain(raw)||raw.version!==3||!Array.isArray(raw.concepts)||raw.concepts.length>MAX_CONCEPTS)throw Error('Saved concepts have an unsupported format or count.');
 const seen=new Set();
 const concepts=raw.concepts.map((c,i)=>{
  if(!plain(c)||typeof c.id!=='string'||!c.id||c.id.length>120||seen.has(c.id)||typeof c.name!=='string'||!c.name.trim()||c.name.length>60)throw Error('Saved concept '+(i+1)+' has an invalid identity.');
  seen.add(c.id);
  if(!plain(c.snapshot))throw Error('Saved concept '+c.name+' is missing its design snapshot.');
  const snapshot=STUDIO.validateSnapshot(c.snapshot);
  if(c.image!==undefined&&c.image!==null&&(typeof c.image!=='string'||c.image.length>500000))throw Error('Saved concept image is invalid.');
  return {...c,snapshot};
 });
 if(raw.activeId!==null&&raw.activeId!==undefined&&(typeof raw.activeId!=='string'||!seen.has(raw.activeId)))throw Error('Selected concept is missing from the saved concepts.');
 return {version:3,concepts,activeId:raw.activeId||null};
}
function validatePayload(raw){
 if(!plain(raw)||raw.format!==FORMAT||raw.version!==VERSION)throw Error('Choose a supported full project backup file.');
 if(raw.projectName!==PROJECT)throw Error('This backup is for a different project.');
 if(!plain(raw.project))throw Error('The backup is missing project data.');
 if(!STUDIO||!BUDGET)throw Error('The studio is still loading. Reload the page and try again.');
 const work=STUDIO.validateSnapshot(raw.project.working);
 const concepts=validateStore(raw.project.concepts);
 const decisions=validateDecisions(raw.project.decisions||{});
 const legacy=plain(raw.project.legacy)?raw.project.legacy:{};
 for(const key of LEGACY)if(legacy[key]!==null&&legacy[key]!==undefined&&(typeof legacy[key]!=='string'||legacy[key].length>1000000))throw Error('A legacy concept snapshot is too large.');
 return {format:FORMAT,version:VERSION,projectName:PROJECT,exportedAt:typeof raw.exportedAt==='string'&&Number.isFinite(Date.parse(raw.exportedAt))?raw.exportedAt:null,project:{working:work,concepts,decisions,legacy:Object.fromEntries(LEGACY.map(k=>[k,legacy[k]??null]))}};
}
function makePayload(){
 if(!STUDIO||!BUDGET)throw Error('The studio is still loading. Reload the page and try again.');
 const work=STUDIO.validateSnapshot(stored(WORK,STUDIO.capture()));
 const concepts=validateStore(stored(STORE,{version:3,concepts:STUDIO.concepts(),activeId:null}));
 const decisions=validateDecisions(stored(DECISIONS,{}));
 const legacy=Object.fromEntries(LEGACY.map(k=>[k,localStorage.getItem(k)]));
 return {format:FORMAT,version:VERSION,projectName:PROJECT,exportedAt:new Date().toISOString(),project:{working:work,concepts,decisions,legacy}};
}
function download(){
 try{
  const payload=makePayload(),json=JSON.stringify(payload,null,2),blob=new Blob([json],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Musie-Full-Project-Backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),30000);
  $('status').textContent='Full project backup exported. Store it privately; it contains budget and decision data.';
 }catch(e){$('status').textContent='Backup export failed: '+e.message;}
}
function preview(payload){
 staged=payload;$('workspace-backup-preview').hidden=false;
 const date=payload.exportedAt?new Date(payload.exportedAt).toLocaleString('en-CA'):'date not recorded';
 const count=payload.project.concepts.concepts.length,done=Object.keys(payload.project.decisions).length;
 $('workspace-backup-summary').textContent='Backup created '+date+'. It contains the working design and budget, '+count+' saved '+(count===1?'concept':'concepts')+', and '+done+' recorded '+(done===1?'check':'checks')+'. Confirming will replace this browser’s current design, budget, saved concepts and decision records.';
 $('workspace-backup-confirm').focus({preventScroll:true});
}
function rollback(previous){
 for(const [key,value] of Object.entries(previous)){try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}catch{}}
}
function commitImport(){
 if(!staged)return;
 const keys=[WORK,STORE,DECISIONS,...LEGACY],previous=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));
 try{
  localStorage.setItem(WORK,JSON.stringify(staged.project.working));
  localStorage.setItem(STORE,JSON.stringify(staged.project.concepts));
  localStorage.setItem(DECISIONS,JSON.stringify(staged.project.decisions));
  for(const key of LEGACY){const value=staged.project.legacy[key];if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}
  $('status').textContent='Project backup imported. Reloading the studio…';location.reload();
 }catch(e){rollback(previous);$('status').textContent='Import was not applied: browser storage could not save the complete backup.';}
}
$('workspace-backup-export').addEventListener('click',download);
$('workspace-backup-import').addEventListener('click',()=>$('workspace-backup-file').click());
$('workspace-backup-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{if(file.size>MAX_BYTES)throw Error('Backup file exceeds the 25 MB limit.');const payload=validatePayload(parse(await file.text(),'Backup file'));preview(payload);}
 catch(err){staged=null;$('workspace-backup-preview').hidden=true;$('status').textContent='Import preview failed: '+err.message;}
 finally{e.target.value='';}
});
$('workspace-backup-confirm').addEventListener('click',commitImport);
$('workspace-backup-cancel').addEventListener('click',()=>{staged=null;$('workspace-backup-preview').hidden=true;$('status').textContent='Import cancelled. No project data was changed.';});
})();