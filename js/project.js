(()=>{'use strict';
const $=id=>document.getElementById(id),B=window.MUSIE_BUDGET;
const cad=n=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(n);
function updateBudget(){if(!B)return;const r=B.result();$('project-priced').textContent=cad(r.priced);$('project-forecast').textContent=r.forecast===null?'TBD':cad(r.forecast);}
document.addEventListener('musie:budgetchange',updateBudget);updateBudget();
document.querySelectorAll('[data-project-tab]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('[data-tab="'+button.dataset.projectTab+'"]')?.click();}));
})();
