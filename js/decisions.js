(()=>{'use strict';
const $=id=>document.getElementById(id),key='musie-studio-v4-decisions';
const fmt=n=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0}).format(n);
const ids=['ikea-list','centura-payment','countertop-choice','floor-pattern','sink-choice','hood-fit'];
let records={};try{const saved=JSON.parse(localStorage.getItem(key)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))records=saved;}catch{}
const cards=[...document.querySelectorAll('#panel-decisions .decision-card')];
const fixedStatus=card=>/\b(SELECTED|CONFIRMED|PAID)\b/i.test(card.querySelector('.decision-heading span')?.textContent||'');
function updateCount(){const count=cards.filter((card,i)=>!fixedStatus(card)&&!records[ids[i]]?.resolved).length;
 for(const id of ['header-open-count','tab-open-count'])$(id).textContent=String(count);
 $('decision-shortcut').setAttribute('aria-label',count+' open checks before ordering');
 $('decision-shortcut').classList.toggle('all-clear',count===0);
 document.dispatchEvent(new CustomEvent('musie:decisionchange',{detail:{openCount:count}}));
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
function csvCell(v){let value=String(v??'');if(/^[\s\uFEFF]*[=+\-@]/.test(value))value="'"+value;return '"'+value.replaceAll('"','""')+'"';}
function parseCSV(input){const s=input.replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<s.length;i++){const c=s[i];if(quoted){if(c==='"'&&s[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}
  else if(c==='"'){quoted=true;}else if(c===','){row.push(cell);cell='';}else if(c==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw Error('The CSV has an unfinished quoted field.');if(cell!==''||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}return rows;
}
$('export-decisions').addEventListener('click',()=>{
 const rows=[['record_type','version','decision_id','resolved','date','note'],...ids.map(id=>{const r=records[id]||{};return['musie-project-decisions','1',id,r.resolved===true?'true':'false',r.date||'',r.note||''];})];
 const blob=new Blob(['\ufeff'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Musie-decision-record.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),30000);
});
$('import-decisions').addEventListener('click',()=>$('decisions-file').click());
$('decisions-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{const rows=parseCSV(await file.text());if(!rows.length)throw Error('Empty CSV');
  const header=rows[0].map(x=>x.trim().toLowerCase()),expected=['record_type','version','decision_id','resolved','date','note'];
  if(expected.some((x,i)=>header[i]!==x)||header.length!==expected.length)throw Error('Unexpected CSV columns');
  const next={};for(const row of rows.slice(1)){if(row.every(v=>!v))continue;if(row.length!==expected.length||row[0]!=='musie-project-decisions'||row[1]!=='1'||!ids.includes(row[2]))throw Error('Invalid decision record row');
   const resolved=row[3].trim().toLowerCase();if(!['true','false'].includes(resolved))throw Error('Invalid resolved value');
   if(resolved==='true'){if(typeof row[4]!=='string'||Number.isNaN(Date.parse(row[4])))throw Error('Invalid decision date');next[row[2]]={resolved:true,note:row[5].slice(0,500),date:row[4]};}}
  records=next;localStorage.setItem(key,JSON.stringify(records));redraw();$('status').textContent='Decision record CSV imported.';
 }catch{$('status').textContent='Could not import that decision record CSV.';}finally{e.target.value='';}
});
redraw();syncBudget();window.addEventListener('musie:budgetdraw',e=>syncBudget(e.detail?.result));
})();
