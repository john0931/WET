(()=>{'use strict';
const $=id=>document.getElementById(id),stage=$('design-stage'),image=$('design-image'),mobile=$('design-mobile-source'),imageWrap=$('design-image-wrap');
const views={
 sink:{title:'Sink wall · Ashley’s V.4 design',source:'Intentional Space · A.09',image:'assets/design/sink-a09.webp',mobile:'assets/design/sink-perspective-a09.webp',alt:'V.4 sink wall with cream lower cabinets, cherry glass uppers, apron sink, and existing white refrigerator'},
 range:{title:'Range wall · Ashley’s V.4 design',source:'Intentional Space · A.11',image:'assets/design/range-a11.webp',alt:'V.4 range wall perspective with plaster hood, blue patterned tile, cherry glass uppers and cream lowers'},
 peninsula:{title:'Peninsula · Ashley’s V.4 design',source:'Intentional Space · Kitchen v.4 cover perspective',image:'assets/design/peninsula-cover.webp',alt:'V.4 peninsula and adjoining sink wall perspective with cream and cherry cabinets'},
 plan:{title:'Cabinet plan · Ashley’s V.4 design',source:'Intentional Space · A.05',image:'assets/design/plan-a05.webp',alt:'V.4 dimensioned cabinet plan'}
};
let planKind='cabinet',floorMode='size',currentView='sink';
const active=()=>currentView;
function setViewState(view){currentView=view;document.querySelectorAll('.view-tabs [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));}
const layout=()=>window.MUSIE_FLOOR_LAYOUT;
function renderFloor(){
 const L=layout(); if(!L)return;
 const map=$('floor-map'),legend=$('floor-legend'); map.replaceChildren();
 $('floor-mode-size').setAttribute('aria-pressed',String(floorMode==='size'));
 $('floor-mode-natural').setAttribute('aria-pressed',String(floorMode==='natural'));
 $('floor-mode-size').classList.toggle('active',floorMode==='size');$('floor-mode-natural').classList.toggle('active',floorMode==='natural');
 const top=document.createElement('span');top.className='floor-map-label floor-map-top';top.textContent='SINK WALL ↑ · 208⅛″';map.append(top);
 const edge=document.createElement('span');edge.className='floor-map-label floor-map-edge';edge.textContent='DINING SIDE · 141¾″';map.append(edge);
 L.tiles.forEach(t=>{
  const el=document.createElement('div');el.className='floor-tile'+(t.cut?' is-cut':'')+(t.sliver?' is-sliver':'');
  el.style.left=t.l+'%';el.style.top=t.t+'%';el.style.width=t.wp+'%';el.style.height=t.hp+'%';
  el.style.background=floorMode==='size'?L.COLORS[t.index]:t.natural;
  el.title=t.short+' · '+(t.cut?(t.sliver?'small edge cut':'cut piece'):'full tile');
  map.append(el);
 });
 const hatch=document.createElement('div');hatch.className='floor-chamfer';hatch.textContent='45° HARDWOOD';map.append(hatch);
 legend.replaceChildren();
 L.counts.forEach(c=>{
  const item=document.createElement('div');item.className='floor-legend-item';
  const sw=document.createElement('i');sw.style.background=floorMode==='size'?L.COLORS[c.index]:L.NATURAL[c.index];
  const copy=document.createElement('span');copy.innerHTML='<b>'+c.size+' · '+c.total+'</b><small>'+ (c.total-c.cut)+' full · '+c.cut+' cut</small><small>top-up box: '+[4,7,13,26][c.index]+' pcs</small>';
  item.append(sw,copy);legend.append(item);
 });
 const sf=n=>n.toLocaleString('en-CA',{maximumFractionDigits:1});
 $('floor-summary').textContent=L.total+' pieces · tiled floor ≈ '+sf(L.floorArea)+' sq ft · gross tile area represented ≈ '+sf(L.pieceArea)+' sq ft · ordered 240.25 sq ft (31 cartons). Dashed = cut piece; '+L.slivers+' cuts are under 2½″ (heavy outline). Shift the start line to remove slivers if possible.';
 $('floor-assumptions').textContent='Draft from A.03 (208⅛″ × 141¾″), not field-measured. Sink wall is at top; tile runs under cabinets. Full tiles align to the dining edge with a ¼″ movement gap; a roughly 7⅞″ cut row is hidden under the sink-wall cabinets, with roughly 5⅝″ cuts balanced at both side walls. The drawing shows the 45° hardwood transition. Assumes a ⅛″ grout joint. '+L.slivers+' cuts are under 2½″; installer should adjust the start line, confirm room measurements and carton mix, and approve the setting-out before work.';
}
function render(){
 const v=views[active()]||views.sink;const src=v.image||(window.MUSIE_DRAWINGS||[])[0]?.src;
 if(!src)return;
 const isPlan=active()==='plan';stage.classList.toggle('has-plan-nav',isPlan);const isFloor=isPlan&&planKind==='floor';
 if(isFloor&&matchMedia('(max-width:700px)').matches&&document.querySelector('.inspector.controls-open'))$('panel-toggle').click();
 $('design-plan-nav').hidden=active()!=='plan';
 $('design-plan-cabinet').setAttribute('aria-pressed',String(!isFloor));$('design-plan-floor').setAttribute('aria-pressed',String(isFloor));
 $('design-plan-cabinet').classList.toggle('active',!isFloor);$('design-plan-floor').classList.toggle('active',isFloor);
 $('design-floor-view').hidden=!isFloor;if(imageWrap)imageWrap.hidden=isFloor;
 if(isFloor){
  $('design-title').textContent='Valdorcia floor tile layout · draft';
  $('design-source').textContent='A.03 room outline · 208⅛″ × 141¾″ · verify onsite';
  $('design-dimensions').hidden=true;
  renderFloor();return;
 }
 image.src=src;mobile.srcset=v.mobile||src;image.alt=v.alt;
 $('design-title').textContent=v.title;$('design-source').textContent=v.source;
 $('design-dimensions').hidden=active()==='plan';
}
function close(){stage.hidden=true;const refs=$('source-ref-toggle');if(refs.getAttribute('aria-expanded')==='true')refs.click();document.querySelector('.view-count').textContent='ASHLEY’S LAYOUT · CONCEPT PREVIEW';}
function open(){window.MUSIE_ELEVATION?.close(false);stage.hidden=false;document.querySelector('.view-count').textContent='ASHLEY’S V.4 DESIGN';render();}
function showFloor(){
 planKind='floor';
 window.MUSIE?.setView?.('plan');setViewState('plan');
 open();render();
 requestAnimationFrame(()=>$('stage').scrollIntoView({behavior:'smooth',block:'nearest'}));
}
$('design-dimensions').addEventListener('click',()=>window.MUSIE_ELEVATION?.open());
$('design-3d').addEventListener('click',()=>document.querySelector('.view-tabs [data-view="overview"]').click());
document.querySelector('.view-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(!b)return;setViewState(b.dataset.view);if(b.dataset.view!=='plan')planKind='cabinet';requestAnimationFrame(()=>b.dataset.view==='overview'?close():open());});
$('design-plan-nav').addEventListener('click',e=>{const b=e.target.closest('[data-plan-kind]');if(!b)return;planKind=b.dataset.planKind;render();});
$('floor-modes').addEventListener('click',e=>{const b=e.target.closest('[data-floor-mode]');if(!b)return;floorMode=b.dataset.floorMode;renderFloor();});
document.addEventListener('click',e=>{if(e.target.closest('[data-floor-layout]'))showFloor();});
window.MUSIE_DESIGN={open,close,showFloor};
document.querySelector('.view-tabs [data-view="overview"]').click();
})();