(()=>{'use strict';
const W=208.125,D=141.75,U=20/2.54,DIAGONAL=24,DIAG_START=D-DIAGONAL,GAP=.125;
const P=[
 {x:0,z:0,w:3,h:2,size:'40×60 cm',short:'16×24″'},
 {x:3,z:0,w:2,h:2,size:'40×40 cm',short:'16×16″'},
 {x:0,z:2,w:2,h:1,size:'20×40 cm',short:'8×16″'},
 {x:2,z:2,w:1,h:1,size:'20×20 cm',short:'8×8″'}
];
const COLORS=['#8C3F22','#C27448','#E0B08A','#F2DCC7'];
const NATURAL=['#B8683F','#A95C38','#C27448','#9E5634'];
const ox=-(U-(W-25*U)/2),oz=(D-.25)-18*U,tiles=[];
const counts=P.map((p,index)=>({index,size:p.size,short:p.short,total:0,cut:0,sliver:0,area:p.w*p.h*U*U/144}));
for(let i=-20;i<=20;i++)for(let j=-20;j<=20;j++){
 const bx=(3*i-2*j)*U+ox,bz=(2*i+3*j)*U+oz;
 P.forEach((p,n)=>{
  const x0=bx+p.x*U,z0=bz+p.z*U,x1=x0+p.w*U,z1=z0+p.h*U;
  if(x1<=0||z1<=0||x0>=W||z0>=D)return;
  const cx0=Math.max(0,x0),cz0=Math.max(0,z0),cx1=Math.min(W,x1),cz1=Math.min(D,z1);
  if(!(cx1>=DIAGONAL||cz0<DIAG_START+cx1-.01))return;
  const cut=x0<0||z0<0||x1>W||z1>D||!(x0>=DIAGONAL||z1<=DIAG_START+x0);
  const sliver=cut&&Math.min(cx1-cx0,cz1-cz0)<2.5,rec=counts[n];
  rec.total++;if(cut)rec.cut++;if(sliver)rec.sliver++;
  tiles.push({index:n,size:p.size,short:p.short,x:cx0,z:cz0,w:cx1-cx0,h:cz1-cz0,original:{x:x0,z:z0,w:x1-x0,h:z1-z0},cut,sliver,natural:NATURAL[Math.abs(i*7+j*13+n*5)%4],
   l:((cx0+GAP/2)/W*100),t:((cz0+GAP/2)/D*100),wp:((cx1-cx0-GAP)/W*100),hp:((cz1-cz0-GAP)/D*100)});
 });
}
const floorArea=(W*D-DIAGONAL*DIAGONAL/2)/144,pieceArea=counts.reduce((sum,c)=>sum+c.total*c.area,0),total=counts.reduce((sum,c)=>sum+c.total,0),slivers=counts.reduce((sum,c)=>sum+c.sliver,0);
window.MUSIE_FLOOR_LAYOUT={W,D,U,DIAGONAL,DIAG_START,GAP,P,COLORS,NATURAL,tiles,counts,floorArea,pieceArea,total,slivers,diagonalW:DIAGONAL/W*100,diagonalH:DIAGONAL/D*100};
})();