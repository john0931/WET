(()=>{'use strict';
const $=id=>document.getElementById(id),B=window.MUSIE_BUDGET,DECISION_KEY='musie-studio-v4-decisions';
const money=n=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(n);
const phases=[
 ['Design','V.4 layout and signed cabinet-front scope.','Done'],
 ['Order','Swedish Door and Centura paid; OGP deposit paid. IKEA, hardware, hood insert and sink still need action.','In progress'],
 ['Demo & site prep','Temporary kitchen, floor / room protection and disposal; dates and bookings not recorded.','Not scheduled'],
 ['Rough-in','Electrical, plumbing, hood duct and return-air route while walls are open.','Not scheduled'],
 ['Drywall & paint prep','Close walls only after rough-ins and any required inspection are complete.','Not scheduled'],
 ['Floor','Install Valdorcia tile inside Ty’s month, before cabinets; confirm pickup and floor installer.','Not scheduled'],
 ['Cabinets','IKEA boxes first; then level, install Swedish Door fronts, panels, fillers and hardware.','Not scheduled'],
 ['Counter template','Requires level installed cabinets plus the selected sink and faucet on site.','Blocked'],
 ['Counters','OGP site measure, fabrication and installation after template.','Not scheduled'],
 ['Backsplash & hood cover','After counters, likely 1–2 weeks after template; plan tile installer separately from Ty.','Blocked'],
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
 ['Swedish Door production','Paid Sep 16–18; 6–10 week lead gives a rough late-Oct to late-Nov arrival window. Confirm ship and delivery dates.','6–10 wk (typ.)'],
 ['Demo → rough-in → inspection','Start Ty’s month only when fronts’ delivery timing is confirmed; rough-ins and any required inspection precede closing walls.','2–3 wk (typ.)'],
 ['Drywall → floor tile','Close after rough-ins / required inspection; Ty lays the floor tile before cabinets.','1–2 wk (typ.)'],
 ['Cabinet installation','IKEA boxes, level and fit; install Swedish Door fronts and panels when available.','3–5 days (typ.)'],
 ['Counter template → fabrication → install','Fit template into Ty’s reserved month; cabinets must be installed and level, with sink details ready.','1–2 wk after template (typ.)'],
 ['Backsplash → hood cover → finish','After counter installation; likely 1–2 weeks after template and outside Ty’s month.','Separate booking']
];
const orders=[
 ['Swedish Door fronts + hood cover','Paid Sep 16–18 · production noted Sep 25','6–10 wk (typ.); rough arrival late Oct–late Nov, unconfirmed. Reserve Ty only from confirmed ship/delivery date.','Cabinet install','Paid'],
 ['Centura Valdorcia kitchen tile','Paid Sep 24 · order 6058089','Ashley expects mid-November; tentative, call for update','Floor','Paid'],
 ['OGP quartz + backsplash X','Deposit paid Sep 24 · $3,100','1–2 wk after template (typ.); slab / balance to confirm','Counters','Deposit paid'],
 ['IKEA SEKTION boxes / drawers','Plan to buy during the IKEA Kitchen Event · list 499998627','Event starts Oct 1; October reward terms are not posted yet. Reconcile the list and confirm eligibility before checkout.','Cabinet install','To order'],
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
function updateBudget(){if(!B)return;const r=B.result();$('project-priced').textContent=money(r.priced);$('project-unpriced').textContent=String(r.missing);$('project-headline').textContent=`Phase 2 of 11 · ordering. ${savedChecksCount()} priority checks open · ${r.missing} budget lines unpriced. Reserve Ty’s month from Swedish Door’s confirmed delivery date.`;}
function savedChecksCount(){return blockers.filter(b=>savedChecks()[b.id]?.resolved!==true).length;}
const PROJECT_STATE='musie-project-state-v1',PRIVATE_CONTACTS='musie-private-contacts-v1';
const assumptions=[
 ['Confirm Swedish Door ship / delivery date before booking Ty','Paid Sept 16–18; the 6–10 week estimate is only a rough late-Oct to late-Nov window. Reserve one month from the supplier-confirmed date.','Critical'],
 ['Fit demo through counter template into Ty’s month','The month needs to cover demo, rough-in, required inspection, drywall, floor, cabinets and countertop template. Confirm Ty’s exact scope and dates.','Critical'],
 ['Book backsplash separately after the counters','Allow roughly 1–2 weeks after template. Recommended split: Ty installs floor tile; a tile installer does backsplash after counter installation.','High'],
 ['Set up a temporary kitchen','Plan for 4–6 weeks from demo until counters: fridge, induction burner, microwave, water and dishwashing.','High'],
 ['Confirm heated, dry, flat storage','Doors, boxes, slab and tile will arrive before installation; ask suppliers / installer about storage and handling.','High'],
 ['Book electrician site visit and rough-in','Do this now. Electrical rough-in and any required inspection determine when walls can close. Verify licensing requirements and work scope with the appropriate Québec authority.','High'],
 ['Arrange two plumbing visits','Rough-in after demo; final hook-up after counters. Confirm sink, RO system and faucet models before booking.','High'],
 ['Verify permit requirements','“No permit” is unconfirmed. Check with the municipality before changing walls, plumbing or electrical.','High'],
 ['Confirm contractor / owner-builder responsibilities','Confirm who contracts and coordinates each trade, and verify any licence requirements that apply to the actual work and arrangement.','High'],
 ['Measure the site before the IKEA order','Verify room dimensions, out-of-square walls, ceiling height and filler clearances against V.4 before buying boxes.','High'],
 ['Reconcile labour and contingency against the budget','Labour and trades remain unpriced, so the $30,000 ceiling plus 10% reserve has not been tested. Keep the forecast open until quotes are added.','High']
];
const contactRoles=['Designer / project lead','Cabinet supplier','Countertop supplier','Tile supplier','Cabinet boxes / IKEA','Installer / Ty','Electrician','Plumber'];
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function projectState(){try{const d=JSON.parse(localStorage.getItem(PROJECT_STATE)||'{}');return d&&typeof d==='object'?d:{}}catch{return {}}}
function saveProjectState(d){try{localStorage.setItem(PROJECT_STATE,JSON.stringify(d))}catch{}}
function renderAssumptions(){const root=$('project-assumptions');if(!root)return;const st=projectState();root.innerHTML=assumptions.map((a,i)=>`<label class="assumption-card ${st[i]?'assumption-settled':''}"><input type="checkbox" data-assumption="${i}" ${st[i]?'checked':''}><span class="assumption-copy"><strong>${esc(a[0])}</strong><small>${esc(a[1])}</small></span><span class="assumption-risk">${esc(st[i]?'Settled':a[2])}</span></label>`).join('')}
function blankContact(){return {company:'',person:'',phone:'',email:'',url:'',reference:'',scope:''}}
function contactsState(){try{const d=JSON.parse(localStorage.getItem(PRIVATE_CONTACTS)||'{}');return d&&typeof d==='object'?d:{}}catch{return {}}}
function saveContacts(d){try{localStorage.setItem(PRIVATE_CONTACTS,JSON.stringify(d))}catch{}}
function renderContacts(){const root=$('private-contact-list');if(!root)return;const data=contactsState();root.innerHTML=contactRoles.map((role,i)=>{const c={...blankContact(),...(data[i]||{})},phone=String(c.phone||'').replace(/[^\d+]/g,'');return `<details class="private-contact"><summary>${esc(role)}<span>${esc(c.company||'Add details')}</span></summary><div class="contact-fields"><label>Company<input data-contact="${i}" data-key="company" value="${esc(c.company)}" autocomplete="organization"></label><label>Person<input data-contact="${i}" data-key="person" value="${esc(c.person)}" autocomplete="name"></label><label>Phone<input type="tel" data-contact="${i}" data-key="phone" value="${esc(c.phone)}" autocomplete="tel"></label><label>Email<input type="email" data-contact="${i}" data-key="email" value="${esc(c.email)}" autocomplete="email"></label><label>Website<input type="url" data-contact="${i}" data-key="url" value="${esc(c.url)}" placeholder="https://…"></label><label>Quote / order #<input data-contact="${i}" data-key="reference" value="${esc(c.reference)}"></label><label class="contact-wide">Scope / approval notes<textarea data-contact="${i}" data-key="scope" rows="2">${esc(c.scope)}</textarea></label><div class="contact-links">${phone?`<a href="tel:${phone}">Call</a> · <a href="sms:${phone}">Text</a>`:''}${c.email?`${phone?' · ':''}<a href="mailto:${encodeURIComponent(c.email)}">Email</a>`:''}${/^https?:\/\//i.test(c.url)?`${phone||c.email?' · ':''}<a href="${esc(c.url)}" target="_blank" rel="noopener">Website</a>`:''}</div></div></details>`}).join('')}
document.addEventListener('change',e=>{const el=e.target.closest('[data-assumption]');if(!el)return;const st=projectState();st[el.dataset.assumption]=el.checked;saveProjectState(st);renderAssumptions()});
document.addEventListener('input',e=>{const el=e.target.closest('[data-contact][data-key]');if(!el)return;const d=contactsState(),i=el.dataset.contact;d[i]={...blankContact(),...(d[i]||{}),[el.dataset.key]:el.value};saveContacts(d);const details=el.closest('details');const summary=details?.querySelector('summary span');if(summary&&el.dataset.key==='company')summary.textContent=el.value||'Add details'});
function openCheck(id){const tab=document.querySelector('[data-tab="decisions"]');tab?.click();window.setTimeout(()=>{const card=document.querySelector('[data-project-check="'+id+'"]');card?.scrollIntoView({behavior:'smooth',block:'center'});card?.focus({preventScroll:true});},80);}
document.addEventListener('click',e=>{const check=e.target.closest('[data-project-check-target]');if(check){openCheck(check.dataset.projectCheckTarget);return}const jump=e.target.closest('[data-project-tab]');if(jump){document.querySelector('[data-tab="'+jump.dataset.projectTab+'"]')?.click();return}const scroll=e.target.closest('[data-project-scroll]');if(scroll){$(scroll.dataset.projectScroll)?.scrollIntoView({behavior:'smooth',block:'start'});}});
document.addEventListener('musie:budgetchange',updateBudget);document.addEventListener('musie:budgetdraw',updateBudget);document.addEventListener('musie:decisionchange',()=>{renderBlockers();updateBudget();});
renderPhases();renderBlockers();renderPath();renderOrders();renderAssumptions();renderContacts();updateBudget();
})();
