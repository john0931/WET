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
function csvCell(value){let text=String(value??'');if(/^[\s\uFEFF]*[=+\-@]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
function parseCSV(text){
 text=String(text||'').replace(/^\uFEFF/,'');const rows=[];let row=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){const ch=text[i];
  if(quoted){if(ch==='"'&&text[i+1]==='"'){field+='"';i++;}else if(ch==='"')quoted=false;else field+=ch;}
  else if(ch==='"'&&field==='')quoted=true;
  else if(ch===','){row.push(field.replace(/\r$/,''));field='';}
  else if(ch==='\n'){row.push(field.replace(/\r$/,''));field='';if(row.some(v=>v!==''))rows.push(row);row=[];}
  else field+=ch;
 }
 if(quoted)throw Error('CSV has an unmatched quotation mark.');
 if(field!==''||row.length){row.push(field.replace(/\r$/,''));if(row.some(v=>v!==''))rows.push(row);}
 return rows;
}
$('export-decisions').addEventListener('click',()=>{
 const rows=[['id','title','status','note','recorded_at']];
 cards.forEach((card,i)=>{const id=ids[i];if(fixedStatus(card))return;const record=records[id];rows.push([id,card.querySelector('.decision-heading strong').textContent,record?.resolved?'Recorded':'Open',record?.note||'',record?.date||'']);});
 const csv='\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n'),blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download='Musie-decision-record.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),30000);
});
$('import-decisions').addEventListener('click',()=>$('decisions-file').click());
$('decisions-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  const table=parseCSV(await file.text());if(!table.length)throw Error('CSV is empty.');
  const header=table.shift().map(v=>v.trim().toLowerCase()),required=['id','title','status','note','recorded_at'];
  if(required.some((name,i)=>header[i]!==name))throw Error('CSV columns do not match the decision-record format.');
  const next={},seen=new Set();
  for(const row of table){
   if(row.length!==required.length)throw Error('A CSV row has the wrong number of columns.');
   const [id,title,status,note,date]=row;
   if(!ids.includes(id)||seen.has(id))throw Error('CSV contains an unknown or duplicate decision.');
   seen.add(id);const card=cards[ids.indexOf(id)];
   if(fixedStatus(card)||title!==card.querySelector('.decision-heading strong').textContent)throw Error('A decision name does not match this project.');
   if(status==='Recorded'){
    if(note.length>500||!date||Number.isNaN(Date.parse(date)))throw Error('A recorded decision needs a note of 500 characters or fewer and a valid date.');
    next[id]={resolved:true,note,date};
   }else if(status!=='Open'||note||date)throw Error('An open decision must not contain a note or recorded date.');
  }
  records=next;localStorage.setItem(key,JSON.stringify(records));redraw();$('status').textContent='CSV decision record imported.';
 }catch(err){$('status').textContent='Could not import that CSV decision record: '+err.message;}
 finally{e.target.value='';}
});
redraw();syncBudget();window.addEventListener('musie:budgetdraw',e=>syncBudget(e.detail?.result));
})();
