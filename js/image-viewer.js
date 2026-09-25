(()=>{'use strict';
const $=id=>document.getElementById(id),dialog=$('image-dialog'),frame=$('image-dialog-frame'),img=$('image-dialog-image');
let fitWidth=0,scale=1;
function fit(){if(!img.naturalWidth||!dialog.open)return;
 fitWidth=Math.min(img.naturalWidth,frame.clientWidth-24,(frame.clientHeight-24)*img.naturalWidth/img.naturalHeight);
 scale=1;draw();frame.scrollTo(0,0);
}
function draw(){img.style.width=Math.max(1,Math.round(fitWidth*scale))+'px';$('image-zoom-level').textContent=Math.round(scale*100)+'%';}
function zoom(factor){if(!fitWidth)return;const x=(frame.scrollLeft+frame.clientWidth/2)/(fitWidth*scale),y=(frame.scrollTop+frame.clientHeight/2)/(fitWidth*scale*img.naturalHeight/img.naturalWidth);
 scale=Math.max(.6,Math.min(4,scale*factor));draw();requestAnimationFrame(()=>{frame.scrollLeft=x*img.clientWidth-frame.clientWidth/2;frame.scrollTop=y*img.clientHeight-frame.clientHeight/2;});}
function open(source,title,alt){if(!source)return;img.onload=fit;img.alt=alt||title;$('image-dialog-title').textContent=title||'V.4 drawing';img.src=source;dialog.showModal();if(img.complete)fit();}
$('design-open-large').addEventListener('click',()=>{const current=$('design-image');open(current.currentSrc||current.src,$('design-title').textContent,current.alt);});
$('source-open-large').addEventListener('click',()=>{const current=$('source-drawing-image');open(current.currentSrc||current.src,$('source-drawing-caption').textContent,current.alt);});
$('image-dialog-close').addEventListener('click',()=>dialog.close());$('image-fit').addEventListener('click',fit);
$('image-zoom-in').addEventListener('click',()=>zoom(1.4));$('image-zoom-out').addEventListener('click',()=>zoom(1/1.4));
window.addEventListener('resize',()=>{if(dialog.open)fit();});
})();
