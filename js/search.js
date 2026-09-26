(()=>{'use strict';
const $=id=>document.getElementById(id),areaNames={project:'Project',design:'Design',item:'Item',decisions:'Checks',concepts:'Concepts',budget:'Budget',sourcing:'Products'};
const txt=el=>(el?.innerText||el?.textContent||'').replace(/\s+/g,' ').trim(),norm=s=>String(s).toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const escape=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dialog=document.createElement('dialog');dialog.id='studio-search-dialog';dialog.className='studio-search-dialog';dialog.setAttribute('aria-label','Search the kitchen studio');
dialog.innerHTML='<div class="studio-search-shell"><div class="studio-search-head"><div class="studio-search-title"><strong>Search the studio</strong><button type="button" class="studio-search-close" aria-label="Close search">Close</button></div><label class="studio-search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4"></circle><path d="m16 16 5 5"></path></svg><input id="studio-search-input" type="search" enterkeyhint="search" autocomplete="off" placeholder="Cabinet, product, check, cost…"></label><p class="studio-search-hint">Search project notes, checks, costs, cabinets and product references.</p></div><div id="studio-search-results" class="studio-search-results" role="listbox" aria-label="Search results"><div class="studio-search-empty">Type to search this studio.</div></div></div>';document.body.append(dialog);
const input=$('studio-search-input'),results=$('studio-search-results'),selector='h2,h3,h4,summary,article,li,label,.project-phase,.project-step,.project-order,.project-blocker,.decision-card,.budget-line,.budget-row,.shopping-item,.source-card,.source-item,.option-card';
let current=[],active=-1;
function rows(){
 const all=[];
 document.querySelectorAll('.tab-panel').forEach(panel=>{
  const tab=panel.id.replace('panel-','');
  panel.querySelectorAll(selector).forEach(el=>{
   const body=txt(el);if(body.length<3||body.length>1800)return;
   let target=el;
   if(el.matches('li,label')&&!el.matches('label.field'))target=el.closest('article,details,.budget-line,.decision-card')||el;
   if(el.matches('h2,h3,h4,summary'))target=el.closest('details,article')||el.closest('section:not(.tab-panel)')||el;
   const full=txt(target);if(!full||full.length>1800)return;
   const title=(el.matches('h2,h3,h4,summary')?body:(target.querySelector('h2,h3,h4,summary,strong')?.textContent||body)).trim();
   all.push({tab,el,target,title,full});
  });
 });
 const picker=$('item-picker');
 if(picker)[...picker.options].filter(o=>o.value).forEach(o=>all.push({tab:'item',el:picker,target:picker,title:o.textContent.trim(),full:o.textContent.trim(),pickerValue:o.value}));
 const seen=new Set();
 return all.filter(x=>{const k=x.tab+'|'+(x.pickerValue||x.target.tagName+':'+txt(x.target).slice(0,160));if(seen.has(k))return false;seen.add(k);return true;});
}
function search(q){
 const terms=norm(q).split(/\s+/).filter(Boolean);
 if(!terms.length){current=[];active=-1;results.innerHTML='<div class="studio-search-empty">Type to search this studio.</div>';return;}
 current=rows().map(r=>{
  const title=norm(r.title),text=norm(r.title+' '+r.full),hit=terms.filter(t=>text.includes(t)).length;
  if(hit!==terms.length)return null;
  return {...r,score:hit*10+(title.startsWith(terms[0])?6:0)+(terms.length===1&&title===terms[0]?12:0)-Math.min(r.full.length/1000,1)};
 }).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,20);active=current.length?0:-1;
 if(!current.length){results.innerHTML='<div class="studio-search-empty">No matches. Try a cabinet ID, supplier, product name, check or budget keyword.</div>';return;}
 results.innerHTML=current.map((r,i)=>'<button type="button" class="studio-search-result" role="option" aria-selected="'+(i===active)+'" data-result="'+i+'"><span class="studio-search-result-main"><span class="studio-search-result-title">'+escape(r.title)+'</span><span class="studio-search-result-context">'+escape(r.full.slice(0,150))+(r.full.length>150?'…':'')+'</span></span><span class="studio-search-result-area">'+escape(areaNames[r.tab]||r.tab)+'</span></button>').join('');
}
function open(){if(!dialog.open)dialog.showModal();input.value='';search('');requestAnimationFrame(()=>input.focus());}
function close(){if(dialog.open)dialog.close();}
function activate(i){
 const row=current[i];if(!row)return;const api=window.MUSIE_STUDIO;
 if(api?.showTab)api.showTab(row.tab);else document.querySelector('[data-tab="'+row.tab+'"]')?.click();
 if(row.pickerValue){const picker=$('item-picker');if(picker){picker.value=row.pickerValue;picker.dispatchEvent(new Event('change',{bubbles:true}));}}
 else{const details=row.target.closest('details');if(details)details.open=true;requestAnimationFrame(()=>row.target.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));}
 close();
}
$('studio-search-open').addEventListener('click',open);dialog.querySelector('.studio-search-close').addEventListener('click',close);
dialog.addEventListener('click',e=>{if(e.target===dialog)close();});dialog.addEventListener('close',()=>$('studio-search-open')?.focus({preventScroll:true}));
input.addEventListener('input',()=>search(input.value));results.addEventListener('click',e=>{const b=e.target.closest('[data-result]');if(b)activate(+b.dataset.result);});
input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!current.length)return;active=(active+(e.key==='ArrowDown'?1:current.length-1))%current.length;results.querySelectorAll('[data-result]').forEach((b,i)=>b.setAttribute('aria-selected',String(i===active)));results.querySelector('[aria-selected=true]')?.scrollIntoView({block:'nearest'});}if(e.key==='Enter'&&active>=0){e.preventDefault();activate(active);}if(e.key==='Escape'){e.preventDefault();close();}});
document.addEventListener('keydown',e=>{if(dialog.open)return;const typing=/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName)||e.target?.isContentEditable;if(!typing&&e.key==='/'){e.preventDefault();open();}if(!typing&&e.key.toLowerCase()==='k'&&(e.metaKey||e.ctrlKey)){e.preventDefault();open();}});
})();