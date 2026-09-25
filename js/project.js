(()=>{'use strict';
const $=id=>document.getElementById(id),B=window.MUSIE_BUDGET,DECISION_KEY='musie-studio-v4-decisions';
const money=n=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(n);
const phases=[
 ['Design','V.4 layout and signed cabinet-front scope.','Done'],
 ['Order','Swedish Door and Centura paid; OGP deposit paid. IKEA, hardware, hood insert and sink still need action.','In progress'],
 ['Demo & site prep','Temporary kitchen, floor / room protection and disposal; dates and bookings not recorded.','Not scheduled'],
 ['Rough-in','Electrical, plumbing, hood duct and return-air route while walls are open.','Not scheduled'],
 ['Drywall & paint prep','Close walls only after rough-ins and any required inspection are complete.','Not scheduled'],
 ['Floor','Install Valdorcia tile before cabinets; confirm pickup and floor installer.','Not scheduled'],
 ['Cabinets','IKEA boxes first; then level, install Swedish Door fronts, panels, fillers and hardware.','Not scheduled'],
 ['Counter template','Requires level installed cabinets plus the selected sink and faucet on site.','Blocked'],
 ['Counters','OGP site measure, fabrication and installation after template.','Not scheduled'],
 ['Backsplash & hood cover','Quartz backsplash X, range tile and hood cover after the insert fit is confirmed.','Blocked'],
 ['Punch list & close-out','Finish checks, touch-ups, adjustments, warranty records and spare-material inventory.','Not scheduled']
];
const blockers=[
 {id:'sink-choice',title:'Choose the apron sink',holds:'Counter template, faucet-hole layout and RO fit.'},
 {id:'countertop-choice',title:'Confirm the paid slab and thickness',holds:'OGP fabrication ticket: reconcile Musq vs Prado and 2 cm vs 3 cm.'},
 {id:'hood-fit',title:'Confirm the hood insert fits the 8″ band',holds:'Insert order and approval of the custom hood cover.'},
 {id:'ikea-list',title:'Reconcile IKEA items before ordering',holds:'October box purchase and cabinet installation.'}
];
const path=[
 ['Close open checks','Sink, slab, hood insert and IKEA scope.','1–2 wk (typ.)'],
 ['Swedish Door production','Paid Sep 16–18; production noted as started Sep 25. Longest known lead.','6–10 wk (typ.)'],
 ['Demo → rough-in → inspection','Can proceed while fronts are being made; inspection timing is local / permit dependent.','2–3 wk (typ.)'],
 ['Drywall → floor tile','Close after rough-in approval; tile floor before cabinets.','1–2 wk (typ.)'],
 ['Cabinet installation','IKEA boxes, level and fit; install fronts and panels when available.','3–5 days (typ.)'],
 ['Counter template → fabrication → install','After level cabinets; sink and faucet details must be ready at template.','1–2 wk after template (typ.)'],
 ['Backsplash → hood cover → finish','Counters first; then tile, electrical finish, paint touch-ups and punch list.','About 1 wk (typ.)']
];
const orders=[
 ['Swedish Door fronts + hood cover','Paid Sep 16–18 · production Sep 25','6–10 wk (typ.); rough window Nov 6–Dec 4, unconfirmed','Cabinet install','Paid'],
 ['Centura Valdorcia kitchen tile','Paid Sep 24 · order 6058089','Ashley expects mid-November; tentative, call for update','Floor','Paid'],
 ['OGP quartz + backsplash X','Deposit paid Sep 24 · $3,100','1–2 wk after template (typ.); slab / balance to confirm','Counters','Deposit paid'],
 ['IKEA SEKTION boxes / drawers','Planned for October · list 499998627','Stock / 1–2 wk (typ.); recheck price and availability','Cabinet install','To order'],
 ['Cabinet hardware','Quote expired Sep 24 · QT00184447','Re-quote quantities and verify stock / tariff','Cabinet install','Re-quote'],
 ['Sink pendant · Dunbridge','Quote expired Sep 24 · D5279','Refresh stock and lead time','Electrical finish','Re-quote'],
 ['Apron sink + RO fit','Not selected · Turner / DeerValley finalists','Supplier lead time not confirmed','Counter template','Decide'],
 ['TruArctic hood insert + filters','Not ordered · TAIN28SS kit unpriced','Supplier lead time not confirmed','Hood cover fit','Decide'],
 ['Decorative range backsplash tile','Not selected · product and quantity open','Product lead time not confirmed','Backsplash','Decide']
];
function renderPhases(){const root=$('project-phases');if(!root)return;root.innerHTML=phases.map((p,i)=>`<li class="project-phase ${i===0?'phase-done':''} ${i===1?'phase-active':''} ${p[2]==='Blocked'?'phase-blocked':''}"><span class="phase-dot" aria-hidden="true"></span><div><strong>${p[0]}</strong><small>${p[1]}</small></div><span class="phase-state">${p[2]}</span></li>`).join('');}
function savedChecks(){try{const r=JSON.parse(localStorage.getItem(DECISION_KEY)||'{}');return r&&typeof r==='object'&&!Array.isArray(r)?r:{}}catch{return {}}}
function renderBlockers(){const root=$('project-blockers');if(!root)return;const records=savedChecks(),open=blockers.filter(b=>records[b.id]?.resolved!==true);$('project-open-count').textContent=String(open.length);root.innerHTML=open.length?open.map((b,i)=>`<button type="button" class="project-blocker" data-project-check-target="${b.id}"><span class="blocker-number">${String(i+1).padStart(2,'0')}</span><span class="blocker-copy"><strong>${b.title}</strong><small>Holds up: ${b.holds}</small></span><span class="blocker-arrow" aria-hidden="true">›</span></button>`).join(''):'<p class="project-clear">Nothing blocking in the four priority checks. Review the remaining orders and trade bookings below.</p>';}
function renderPath(){const root=$('project-path');if(!root)return;root.innerHTML=path.map((p,i)=>`<li class="path-step"><span class="path-node" aria-hidden="true"></span><div><strong>${p[0]}</strong><small>${p[1]}</small></div><span class="path-duration">${p[2]}</span></li>`).join('');}
function renderOrders(){const root=$('project-orders');if(!root)return;root.innerHTML=orders.map(o=>`<article class="project-order"><div class="project-order-head"><h4>${o[0]}</h4><span class="order-state ${o[4]==='Paid'?'order-paid':o[4]==='Deposit paid'?'order-deposit':''}">${o[4]}</span></div><div class="order-facts"><div><span>Order / date</span><strong>${o[1]}</strong></div><div><span>Lead time / ETA</span><strong>${o[2]}</strong></div><div><span>Needed for</span><strong>${o[3]}</strong></div></div></article>`).join('');}
function updateBudget(){if(!B)return;const r=B.result();$('project-priced').textContent=money(r.priced);$('project-unpriced').textContent=String(r.missing);$('project-headline').textContent=`Phase 2 of 11 · ordering. ${savedChecksCount()} priority checks open · ${r.missing} budget lines unpriced. Swedish Door production is the longest known lead.`;}
function savedChecksCount(){return blockers.filter(b=>savedChecks()[b.id]?.resolved!==true).length;}
function openCheck(id){const tab=document.querySelector('[data-tab="decisions"]');tab?.click();window.setTimeout(()=>{const card=document.querySelector('[data-project-check="'+id+'"]');card?.scrollIntoView({behavior:'smooth',block:'center'});card?.focus({preventScroll:true});},80);}
document.addEventListener('click',e=>{const check=e.target.closest('[data-project-check-target]');if(check){openCheck(check.dataset.projectCheckTarget);return}const jump=e.target.closest('[data-project-tab]');if(jump){document.querySelector('[data-tab="'+jump.dataset.projectTab+'"]')?.click();return}const scroll=e.target.closest('[data-project-scroll]');if(scroll){$(scroll.dataset.projectScroll)?.scrollIntoView({behavior:'smooth',block:'start'});}});
document.addEventListener('musie:budgetchange',updateBudget);document.addEventListener('musie:budgetdraw',updateBudget);document.addEventListener('musie:decisionchange',()=>{renderBlockers();updateBudget();});
renderPhases();renderBlockers();renderPath();renderOrders();updateBudget();
})();
