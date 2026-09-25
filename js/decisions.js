(()=>{'use strict';
const $=id=>document.getElementById(id), key='musie-studio-v4-decisions';
const fmt=n=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0}).format(n);
let records={};try{const saved=JSON.parse(localStorage.getItem(key)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))records=saved;}catch{}
const cards=[...document.querySelectorAll('#panel-decisions .decision-card')];
const ids=['ikea-list','centura-payment','countertop-choice','floor-pattern'];
const fixedStatus=card=>/\b(SELECTED|CONFIRMED|PAID)\b/i.test(card.querySelector('.decision-heading span')?.textContent||'');
function updateCount(){const count=cards.filter((card,i)=>!fixedStatus(card)&&!records[ids[i]]?.resolved).length;
 for(const id of ['header-open-count','tab-open-count'])$(id).textContent=String(count);
 $('decision-shortcut').setAttribute('aria-label',count+' open checks before ordering');
 $('decision-shortcut').classList.toggle('all-clear',count===0);
}
function redraw(){cards.forEach((card,i)=>{
 if(fixedStatus(card))return;
 const id=ids[i],record=records[id],heading=card.querySelector('.decision-heading span'),button=card.querySelector('.decision-action'),note=card.querySelector('.decision-note'),stamp=card.querySelector('.decision-stamp');
 card.classList.toggle('recorded',!!record?.resolved);
 heading.textContent=record?.resolved?'RECORDED':heading.dataset.originalStatus;
 button.textContent=record?.resolved?'Reopen check':'Record decision';
 button.setAttribute('aria-label',(record?.resolved?'Reopen ':'Record ')+card.querySelector('.decision-heading strong').textContent);
 if(document.activeElement!==note)note.value=record?.note||'';
 stamp.textContent=record?.resolved?'Recorded '+new Date(record.date).toLocaleDateString('en-CA')+(record.note?' · '+record.note:''):'';
 });updateCount();}
cards.forEach((card,i)=>{
 if(fixedStatus(card))return;
 const head=card.querySelector('.decision-heading span');head.dataset.originalStatus=head.textContent;
 const controls=document.createElement('div');controls.className='decision-controls';
 const label=document.createElement('label');label.textContent='Decision or confirmation note';
 const note=document.createElement('textarea');note.className='decision-note';note.rows=2;note.maxLength=500;note.placeholder='What was confirmed, and by whom?';label.append(note);
 const action=document.createElement('button');action.type='button';action.className='decision-action';
 const stamp=document.createElement('p');stamp.className='decision-stamp';stamp.setAttribute('aria-live','polite');
 controls.append(label,action,stamp);card.append(controls);
 action.addEventListener('click',()=>{
 const id=ids[i];if(records[id]?.resolved){delete records[id];}
 else{records[id]={resolved:true,note:note.value.trim(),date:new Date().toISOString()};}
 try{localStorage.setItem(key,JSON.stringify(records));}catch{$('status').textContent='Decision saved for this session; export a copy to keep it.';}
 redraw();
 });
});
function syncBudget(result){let data;try{data=JSON.parse($('budget-data').textContent)}catch{}
 const ceiling=Number(result?.ceiling||data?.ceiling||30000);
 const total=Number.isFinite(result?.priced)?result.priced:(data?.rows||[]).reduce((sum,r)=>sum+(Number.isFinite(r.amount)?r.amount:0),0);
 const fill=Math.min(100,Math.max(0,total/ceiling*100));
 $('header-priced').textContent=fmt(total);$('header-ceiling').textContent=fmt(ceiling);
 $('header-priced-bar').style.width=fill+'%';$('header-priced-bar').closest('.status-meter').setAttribute('aria-valuenow',String(fill));
 $('header-priced-bar').classList.toggle('over',total>ceiling);
}
$('export-decisions').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify({type:'musie-project-decisions',version:1,records},null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Musie-decision-record.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),30000);
});
$('import-decisions').addEventListener('click',()=>$('decisions-file').click());
$('decisions-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{const parsed=JSON.parse(await file.text());if(parsed.type!=='musie-project-decisions'||parsed.version!==1||!parsed.records||typeof parsed.records!=='object'||Array.isArray(parsed.records))throw Error('Invalid decision record');
  const next={};for(const id of ids){const r=parsed.records[id];if(r?.resolved===true&&typeof r.note==='string'&&typeof r.date==='string'&&!Number.isNaN(Date.parse(r.date)))next[id]={resolved:true,note:r.note.slice(0,500),date:r.date};}
  records=next;localStorage.setItem(key,JSON.stringify(records));redraw();$('status').textContent='Decision record imported.';
 }catch{$('status').textContent='Could not import that decision record.';}finally{e.target.value='';}
});
redraw();syncBudget();window.addEventListener('musie:budgetdraw',e=>syncBudget(e.detail?.result));
})();
