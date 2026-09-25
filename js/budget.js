(()=>{
'use strict';
const $=id=>document.getElementById(id), s=MUSIE.state;
const clone=v=>JSON.parse(JSON.stringify(v));
const initial=JSON.parse($('budget-data').textContent);
const canonical=initial.rows.map(r=>({row:r.row,name:r.name,keys:[...r.keys]}));
const knownRows=new Set(canonical.map(r=>String(r.row)));
const baseline={upper:'cherry',lower:'cream',upperColor:'#985f36',lowerColor:'#eadfc2',glass:'v3',mullions:true,hardware:'brass',counterThickness:'2',showRug:false,floor:'terra',tile:'blue',counter:'musq',appliance:'steel',cabinetOverrides:{},featureOverrides:{}};
const cabinetIds=Array.from({length:16},(_,i)=>'CAB-'+(i+1)).concat('CAB-18');
const upperIds=new Set(['CAB-11','CAB-12','CAB-13','CAB-14','CAB-16','CAB-18']);
const v2Ids=new Set(['CAB-11','CAB-16','CAB-18']);
let data=clone(initial), overrides={}, source='Executive Summary baseline updated 23 September 2026. Excel remains the cost master; several labour/services remain unpriced.';
const money=n=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(n);
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&(Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null);
const safeNumber=(v,max=1e9)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max;
function paint(finish,color){return [finish,finish==='custom'?String(color||'#f4f0e6').toLowerCase():null];}
function cabinetConfig(id,st){
  const upper=upperIds.has(id),o=st.cabinetOverrides?.[id]||{},finish=o.finish||st[upper?'upper':'lower'],color=o.color||st[upper?'upperColor':'lowerColor'];
  const glass=upper&&(o.front?o.front==='glass':st.glass==='v3'||st.glass==='v2'&&v2Ids.has(id));
  return [id,...paint(finish,color),glass,glass?(typeof o.mullions==='boolean'?o.mullions:!!st.mullions):false];
}
function featureConfig(id,st){
  const o=st.featureOverrides?.[id]||{};
  const inheritedFinish=id==='Peninsula bookcase'?st.lower:'white';
  const inheritedColor=id==='Peninsula bookcase'?st.lowerColor:'#f9f6ed';
  return paint(o.finish||inheritedFinish,o.color||inheritedColor);
}
function signature(r,st=s){
  let values;
  if(r.row===12)values=['cherry-uppers',...Array.from(upperIds).map(id=>cabinetConfig(id,st))];
  else if(r.row===13)values=['natural-cream-lowers',...cabinetIds.filter(id=>!upperIds.has(id)).map(id=>cabinetConfig(id,st)),['bookcase',featureConfig('Peninsula bookcase',st)]];
  else if(r.row===14)values=['hood-cover',featureConfig('Custom hood cover',st)];
  else if(r.row===19)values=['hardware',st.hardware];
  else values=r.keys.map(k=>[k,st[k],k==='upper'&&st[k]==='custom'?st.upperColor:k==='lower'&&st[k]==='custom'?st.lowerColor:null]);
  return JSON.stringify(values);
}
function changed(r){return signature(r)!==signature(r,baseline);}
function activeOverride(r){const o=overrides[String(r.row)];return o&&o.signature===signature(r)?o:null;}
function knownCounterCost(r){if(r.row!==21)return null;if(s.counter==='musq')return r.amount;if(s.counter==='prado')return 7348.96;return null;}
function cost(r){const o=activeOverride(r);if(o)return o.amount;const kc=knownCounterCost(r);if(kc!==null)return kc;return changed(r)?null:r.amount;}
function decoratedRows(){return data.rows.map(r=>({...clone(r),cost:cost(r),changed:changed(r),hasReplacement:!!activeOverride(r),signature:signature(r),basis:activeOverride(r)?'Owner scenario replacement — not an approved commitment':r.row===21&&s.counter==='prado'?'Known OGP price-match alternative — Prado + backsplash X':r.row===21&&s.counter==='musq'?'OGP Musq price-match planning reference + backsplash X':changed(r)?'Changed concept — replacement quote needed':'Excel carry-forward — provisional',hasStaleReplacement:!!overrides[String(r.row)]&&!activeOverride(r)}));}
function result(){
  let priced=0,missing=0;
  data.rows.forEach(r=>{const n=cost(r);if(n===null)missing++;else priced+=n;});
  priced=Math.round(priced*100)/100;
  const reserve=Math.round(data.ceiling*data.reserveRate*100)/100;
  return {priced,missing,reserve,ceiling:data.ceiling,remaining:Math.round((data.ceiling-reserve-priced)*100)/100,forecast:missing?null:Math.round((priced+reserve)*100)/100};
}
function emitChange(reason){document.dispatchEvent(new CustomEvent('musie:budgetchange',{detail:{reason,result:result()}}));}
function text(id,value){const el=$(id);if(el)el.textContent=value;}
function draw(){
  const active=document.activeElement;
  const focusId=active&&/^(budget-price|budget-summary)-\d+$/.test(active.id||'')?active.id:null;
  const v=result();
  text('budget-total',money(v.priced));text('budget-left',money(v.remaining));text('budget-limit',money(data.ceiling));text('budget-reserve',money(v.reserve));
  text('budget-open',v.missing+' cost lines need pricing');
  text('budget-forecast',v.missing?'Full project forecast: TBD. The subtotal covers priced scope only.':'Planning forecast with reserve: '+money(v.forecast));
  text('budget-source',source);
  if($('budget-left'))$('budget-left').style.color=v.remaining<0?'#a52b25':'#233c33';
  const list=$('budget-lines');
  if(list){
    const opened=new Set([...list.querySelectorAll('details[open]')].map(el=>el.dataset.row));
    list.replaceChildren();
    decoratedRows().forEach(r=>{
      const line=document.createElement('details');line.className='budget-line';line.dataset.row=String(r.row);line.open=opened.has(String(r.row));
      const summary=document.createElement('summary');summary.id='budget-summary-'+r.row;
      const label=document.createElement('span');label.textContent=r.name;
      const value=document.createElement('strong');value.textContent=r.cost===null?'TBD':money(r.cost);value.className=r.cost===null?'budget-unpriced':'';
      summary.append(label,value);
      const content=document.createElement('div');content.className='budget-line-content';
      const basis=document.createElement('small');basis.className='budget-basis';basis.textContent=r.basis+(r.hasStaleReplacement?'. Earlier replacement does not apply to this design.':'.');
      const note=document.createElement('p');note.className='budget-scope';note.textContent=r.note;
      const inputLabel=document.createElement('label');inputLabel.textContent='Scenario replacement (CAD, including applicable taxes)';
      const input=document.createElement('input');input.id='budget-price-'+r.row;input.type='number';input.min='0';input.max='1000000000';input.step='.01';input.inputMode='decimal';input.placeholder='TBD';input.setAttribute('aria-label',r.name+' scenario replacement in Canadian dollars, including taxes');
      const current=activeOverride(r);if(current)input.value=String(current.amount);
      const error=document.createElement('small');error.className='budget-input-error';error.setAttribute('role','status');
      input.onchange=()=>{
        if(input.value==='')delete overrides[String(r.row)];
        else if(safeNumber(input.valueAsNumber))overrides[String(r.row)]={amount:Math.round(input.valueAsNumber*100)/100,signature:signature(r)};
        else {error.textContent='Enter a non-negative amount, or clear the field to keep it unpriced.';input.setAttribute('aria-invalid','true');return;}
        draw();emitChange('price');
      };
      const help=document.createElement('small');help.textContent='Replaces this line once; it is not added on top. Use $0 only when the scope is expressly included elsewhere or excluded. No order or approval is created.';
      inputLabel.append(input);content.append(basis,note,inputLabel,error,help);line.append(summary,content);list.append(line);
    });
  }
  if(focusId)$(focusId)?.focus({preventScroll:true});
  document.dispatchEvent(new CustomEvent('musie:budgetdraw',{detail:{result:v}}));
}
function validateState(snapshot){
  if(!plain(snapshot))throw Error('Budget snapshot must be an object.');
  if(snapshot.version!==undefined&&snapshot.version!==1)throw Error('Unsupported budget snapshot version.');
  const d=snapshot.data;
  if(!plain(d)||!safeNumber(d.ceiling)||d.ceiling===0||!safeNumber(d.reserveRate,1)||!Array.isArray(d.rows)||d.rows.length!==canonical.length)throw Error('Budget snapshot has invalid totals or cost rows.');
  const rows=d.rows.map((r,i)=>{
    const c=canonical[i];
    if(!plain(r)||r.row!==c.row||r.name!==c.name||!(r.amount===null||safeNumber(r.amount))||typeof r.note!=='string'||r.note.length>10000)throw Error('Budget snapshot cost row '+c.row+' is invalid.');
    if(!Array.isArray(r.keys)||JSON.stringify(r.keys)!==JSON.stringify(c.keys))throw Error('Budget snapshot pricing rules were modified at row '+c.row+'.');
    return {row:c.row,name:c.name,amount:r.amount,note:r.note,keys:[...c.keys]};
  });
  if(!plain(snapshot.overrides))throw Error('Budget replacements must be an object.');
  const cleanOverrides={};
  for(const [key,o] of Object.entries(snapshot.overrides)){
    if(!knownRows.has(key)||!plain(o)||!safeNumber(o.amount)||typeof o.signature!=='string'||o.signature.length>20000)throw Error('Budget replacement is invalid.');
    let sig;try{sig=JSON.parse(o.signature);}catch{throw Error('Budget replacement design reference is invalid.');}
    if(!Array.isArray(sig))throw Error('Budget replacement design reference is invalid.');
    cleanOverrides[key]={amount:o.amount,signature:o.signature};
  }
  const nextSource=snapshot.source===undefined?'Saved concept budget. No automatic synchronization.':snapshot.source;
  if(typeof nextSource!=='string'||nextSource.length>2000)throw Error('Budget source is invalid.');
  return {version:1,data:{ceiling:d.ceiling,reserveRate:d.reserveRate,rows},overrides:cleanOverrides,source:nextSource};
}
function exportState(){return clone({version:1,data,overrides,source});}
function importState(snapshot){const next=validateState(snapshot);data=next.data;overrides=next.overrides;source=next.source;draw();return exportState();}
if($('loadBudget'))$('loadBudget').onclick=()=>$('budgetFile')?.click();
if($('budgetFile'))$('budgetFile').onchange=async e=>{
  try{
    const f=e.target.files[0];if(!f)return;
    if(f.size>25000000)throw Error('Workbook exceeds the 25 MB import limit.');
    const w=XLSX.read(await f.arrayBuffer(),{type:'array'}),sheet=w.Sheets['Executive Summary'];
    if(!sheet)throw Error('Executive Summary sheet missing.');
    const number=a=>typeof sheet[a]?.v==='number'&&Number.isFinite(sheet[a].v)?sheet[a].v:null;
    const ceiling=number('B3'),rate=number('B4');
    if(!safeNumber(ceiling)||ceiling===0||!safeNumber(rate,1))throw Error('Budget ceiling or contingency rate is invalid.');
    const rows=data.rows.map(r=>{
      if(sheet['A'+r.row]?.v!==r.name)throw Error('Budget layout changed at row '+r.row+'. Please reconcile before importing.');
      const amount=number('B'+r.row);if(amount!==null&&!safeNumber(amount))throw Error('Invalid or negative line cost needs review.');
      return {...r,amount,note:String(sheet['C'+r.row]?.v||r.note)};
    });
    const next=validateState({version:1,data:{ceiling,reserveRate:rate,rows},overrides:{},source:'Loaded '+f.name+' at '+new Date().toLocaleString()+'. No automatic synchronization.'});
    data=next.data;overrides=next.overrides;source=next.source;draw();emitChange('workbook-import');
  }catch(err){text('budget-source','Import not applied: '+err.message);}
  e.target.value='';
};
if($('budgetCSV'))$('budgetCSV').onclick=()=>{
  // Prefix potentially executable spreadsheet strings while preserving numeric cells.
  const q=v=>{let value=v===null||v===undefined?'TBD':String(v);if(typeof v!=='number'&&/^[\s\uFEFF]*[=+\-@]/.test(value))value="'"+value;return '"'+value.replaceAll('"','""')+'"';};
  const v=result(),rows=[['Concept',s.conceptName],['Owner ceiling CAD',data.ceiling],['Contingency reserve CAD',v.reserve],['Priced subtotal CAD',v.priced],['Available for pending scope CAD',v.remaining],['Unpriced lines',v.missing],['Full forecast CAD',v.forecast],['Source',source],[],['Budget row','Item','Working cost CAD','Basis','Scope notes'],...decoratedRows().map(r=>[r.row,r.name,r.cost,r.basis,r.note]),[],['MODEL SETTINGS'],...Object.entries(s).filter(([,v])=>v===null||typeof v!=='object'),['Per-cabinet choices',JSON.stringify(s.cabinetOverrides||{})],['Feature choices',JSON.stringify(s.featureOverrides||{})]];
  const blob=new Blob(['\ufeff'+rows.map(r=>r.map(q).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='Musie_Concept_Budget.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
if($('clearBudget'))$('clearBudget').onclick=()=>{overrides={};draw();emitChange('clear-replacements');};
document.addEventListener('musie:designchange',draw);
// Compatibility with the previous standalone controls and concept imports.
document.addEventListener('change',e=>{if(!e.target.closest('#budget-panel'))setTimeout(draw,0);});
window.MUSIE_BUDGET={result,draw,data:()=>clone(data),rows:decoratedRows,exportState,importState,validateState};
draw();
})();

