(()=>{'use strict';
const $=id=>document.getElementById(id),stage=$('elevation-stage'),grid=$('elevation-grid'),image=$('elevation-reference'),toggle=$('elevation-toggle'),drawToggle=$('source-ref-toggle');
const catalog=window.MUSIE_CABINETS;let selected='',roughVisible=false;
const view=()=>document.querySelector('.view-tabs [data-view].active')?.dataset.view||'sink';
const toggleRough=$('roughin-toggle'),warning=$('roughin-warning'),detail=$('roughin-detail');
const roughInData=[
 {trade:'plumbing',label:'Sink drain',height:'18″ AFF · draft',note:'Placeholder location. Confirm drain centreline, trap, disposal and dishwasher high-loop clearance on site.',x:48,y:72},
 {trade:'plumbing',label:'Hot / cold supply',height:'20″ AFF · draft',note:'Placeholder location. Confirm spacing from drain, shut-off access and sink specifications.',x:52,y:70},
 {trade:'electrical',label:'Dishwasher / disposal power',height:'24″ AFF · draft',note:'Placeholder only. Electrician to determine circuit, receptacle location, switching and code compliance.',x:42,y:68},
 {trade:'electrical',label:'Counter receptacle',height:'42″ AFF · draft',note:'Placeholder only. Set final height from finished floor and counter/tile dimensions; electrician to confirm local code and spacing.',x:25,y:50},
 {trade:'electrical',label:'Under-cabinet lighting / driver',height:'54″ AFF · draft',note:'Placeholder only. Coordinate driver location, wiring route and cabinet details with electrician and cabinet supplier.',x:75,y:35}
];
const overlayLayer=document.createElement('div');overlayLayer.className='roughin-layer';overlayLayer.id='rough-in-layer';overlayLayer.hidden=true;overlayLayer.setAttribute('aria-label','Draft plumbing and electrical rough-in markers');
function paintRoughIn(){
 overlayLayer.replaceChildren();overlayLayer.hidden=!roughVisible;warning.hidden=!roughVisible;detail.hidden=!roughVisible;
 toggleRough.setAttribute('aria-pressed',String(roughVisible));toggleRough.textContent=roughVisible?'Hide rough-in overlay':'Show rough-in overlay';
 if(!roughVisible)return;
 for(const item of roughInData){
  const pin=document.createElement('button');pin.type='button';pin.className='roughin-pin '+item.trade;pin.style.left=item.x+'%';pin.style.top=item.y+'%';
  pin.setAttribute('aria-label',item.label+', '+item.height+'. Draft only; verify with trade.');pin.title=item.label+' · '+item.height;pin.textContent=item.trade==='plumbing'?'P':'E';
  pin.addEventListener('click',()=>{detail.replaceChildren();const h=document.createElement('strong'),p=document.createElement('span');h.textContent=item.label+' · '+item.height;p.textContent=item.note;detail.append(h,p);});
  overlayLayer.append(pin);
 }
 const key=document.createElement('div');key.className='roughin-key';key.innerHTML='<span><b class="p">P</b> Plumbing</span><span><b class="e">E</b> Electrical</span>';overlayLayer.append(key);
}
function render(){const v=view(),key=v==='range'?'range':'sink';roughVisible=roughVisible&&v==='sink';toggleRough.hidden=v!=='sink';if(v!=='sink')paintRoughIn();
 $('elevation-title').textContent=v==='plan'?'Plan · V.4 reference':v==='peninsula'?'Peninsula · V.4 reference':(key==='sink'?'Sink wall':'Range wall')+' · V.4 cabinet schedule';
 $('elevation-subtitle').textContent=v==='plan'||v==='peninsula'?'Open the drawing references for the complete annotated sheet. Cabinet elevations use scheduled box dimensions.':'198-column elevation · V.4 cabinet box dimensions; check drawing for installation clearances.';
 if(v==='plan'||v==='peninsula'){grid.hidden=true;image.hidden=false;const ref=(window.MUSIE_DRAWINGS||[])[v==='plan'?0:4];if(ref){image.src=ref.src;image.alt=ref.label+' reference drawing'}return;}
 image.hidden=true;grid.hidden=false;grid.replaceChildren();
 for(const [cl,label] of [['upper','Upper cabinets'],['splash','Backsplash'],['counter','Countertop'],['lower','Base cabinets'],['floor','Floor']]){const band=document.createElement('div');band.className='elevation-band '+cl;band.setAttribute('aria-hidden','true');band.textContent=label;grid.append(band);}
 const records=Object.entries(catalog).filter(([,box])=>box.wall===key&&box.x!=null);
 for(const [id,box] of records){const {width,height,x,kind}=box,b=document.createElement('button');b.type='button';b.className='elevation-cabinet '+kind;b.dataset.cabinet=id;
 const start=Math.max(1,Math.floor((x-width/2)/208.125*198)+1),span=Math.max(1,Math.round(width/208.125*198));b.style.gridColumn=start+' / span '+span;
 const cfg=window.MUSIE?.getCabinetConfig?.(id);if(cfg?.color)b.style.background=cfg.color;
 b.classList.toggle('glazed',cfg?.front==='glass');b.classList.toggle('mullions',cfg?.front==='glass'&&cfg?.mullions);
 b.setAttribute('aria-pressed',String(id===selected));b.setAttribute('aria-label',id+', '+width+' inches wide by '+height+' inches high, V.4 cabinet schedule');
 b.title=id+' · '+width+' × '+height+' in · V.4 cabinet schedule';
 const name=document.createElement('b'),size=document.createElement('small');name.textContent=id;size.textContent=width+' × '+height+' in';b.append(name,size);
 b.addEventListener('click',()=>{selected=id;grid.querySelectorAll('[data-cabinet]').forEach(node=>node.setAttribute('aria-pressed',String(node.dataset.cabinet===id)));$('elevation-selection').textContent=id+' · '+width+' W × '+height+' H in · V.4 cabinet schedule';window.MUSIE?.selectItem?.(id);});grid.append(b);}
 grid.append(overlayLayer);paintRoughIn();
 $('elevation-selection').textContent=selected&&catalog[selected]?.wall===key?selected+' · '+catalog[selected].width+' W × '+catalog[selected].height+' H in · V.4 cabinet schedule':'Dimensions are cabinet box sizes in inches, from the V.4 schedule.';
}
function close(returnToDesign=true){stage.hidden=true;toggle.setAttribute('aria-pressed','false');toggle.textContent='Cabinet dimensions';if(returnToDesign&&view()!=='overview')window.MUSIE_DESIGN?.open();}
function open(){if(drawToggle.getAttribute('aria-expanded')==='true')drawToggle.click();window.MUSIE_DESIGN?.close();stage.hidden=false;toggle.setAttribute('aria-pressed','true');toggle.textContent='Back to V.4 design';render();}
toggleRough.addEventListener('click',()=>{roughVisible=!roughVisible;paintRoughIn();});toggle.addEventListener('click',()=>stage.hidden?open():close());$('elevation-close').addEventListener('click',()=>close());
document.querySelector('.view-tabs').addEventListener('click',e=>{if(!e.target.closest('[data-view]'))return;requestAnimationFrame(()=>{if(view()==='overview')close(false);else if(!stage.hidden)render();});});
window.addEventListener('musie:rebuilt',()=>{if(!stage.hidden)render();});
window.addEventListener('musie:selection',e=>{selected=e.detail.id||'';if(!stage.hidden)render();});
window.MUSIE_ELEVATION={open,close};
})();
