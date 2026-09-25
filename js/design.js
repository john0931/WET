(()=>{'use strict';
const $=id=>document.getElementById(id),stage=$('design-stage'),image=$('design-image'),mobile=$('design-mobile-source');
const views={
 sink:{title:'Sink wall · Ashley’s V.4 design',source:'Intentional Space · A.09',image:'assets/design/sink-a09.webp',mobile:'assets/design/sink-perspective-a09.webp',alt:'V.4 sink wall with cream lower cabinets, cherry glass uppers, apron sink, and existing white refrigerator'},
 range:{title:'Range wall · Ashley’s V.4 design',source:'Intentional Space · A.11',image:'assets/design/range-a11.webp',alt:'V.4 range wall perspective with plaster hood, blue patterned tile, cherry glass uppers and cream lowers'},
 peninsula:{title:'Peninsula · Ashley’s V.4 design',source:'Intentional Space · Kitchen v.4 cover perspective',image:'assets/design/peninsula-cover.webp',alt:'V.4 peninsula and adjoining sink wall perspective with cream and cherry cabinets'},
 plan:{title:'Cabinet plan · Ashley’s V.4 design',source:'Intentional Space · A.05',image:null,alt:'V.4 dimensioned cabinet plan'}
};
const active=()=>document.querySelector('.view-tabs [data-view].active')?.dataset.view||'sink';
function render(){const v=views[active()]||views.sink;const src=v.image||(window.MUSIE_DRAWINGS||[])[0]?.src;
 if(!src)return;
 image.src=src;mobile.srcset=v.mobile||src;image.alt=v.alt;
 $('design-title').textContent=v.title;$('design-source').textContent=v.source;
 $('design-dimensions').hidden=active()==='plan';
}
function close(){stage.hidden=true;const refs=$('source-ref-toggle');if(refs.getAttribute('aria-expanded')==='true')refs.click();document.querySelector('.view-count').textContent='ASHLEY’S LAYOUT · CONCEPT PREVIEW';}
function open(){window.MUSIE_ELEVATION?.close(false);stage.hidden=false;document.querySelector('.view-count').textContent='ASHLEY’S V.4 DESIGN';render();}
$('design-dimensions').addEventListener('click',()=>window.MUSIE_ELEVATION?.open());
$('design-3d').addEventListener('click',()=>document.querySelector('.view-tabs [data-view="overview"]').click());
document.querySelector('.view-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(!b)return;requestAnimationFrame(()=>b.dataset.view==='overview'?close():open());});
window.MUSIE_DESIGN={open,close};
open();
})();
