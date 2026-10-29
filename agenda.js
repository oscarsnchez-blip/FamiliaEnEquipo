(()=>{'use strict';
const calendarPage=FE.pages.calendario,expensesPage=FE.pages.gastos,KEY='fee-agenda-view';
let view=localStorage.getItem(KEY)==='gastos'?'gastos':'calendario';
window.FEOpenAgenda=function(next='calendario'){view=next==='gastos'?'gastos':'calendario';localStorage.setItem(KEY,view);if(FE.page==='agenda')FE.render();else FE.go('agenda',1)};
FE.register('agenda',{render(){let page=view==='gastos'?expensesPage:calendarPage;return `<div class="agenda-switch" role="tablist"><button data-agenda="calendario" class="${view==='calendario'?'active':''}">Calendario</button><button data-agenda="gastos" class="${view==='gastos'?'active':''}">Gastos</button></div><div class="agenda-content" data-agenda-content>${page.render()}</div>`},bind:r=>{r.querySelectorAll('[data-agenda]').forEach(b=>b.onclick=()=>{view=b.dataset.agenda;localStorage.setItem(KEY,view);FE.render()});let content=r.querySelector('[data-agenda-content]');if(view==='gastos'&&!content.querySelector('[data-new]'))return;if(view==='calendario'&&!content.querySelector('[data-new-event]'))return;(view==='gastos'?expensesPage:calendarPage).bind(content)}});
})();
