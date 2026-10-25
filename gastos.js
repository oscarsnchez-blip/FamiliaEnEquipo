(()=>{
'use strict';
let members=[],loaded=false;
let filters={month:new Date().toLocaleDateString('en-CA').slice(0,7),child:'',payer:'',category:''};
async function load(){
 if(loaded)return;
 const fm=await FE.db.from('family_members').select('user_id').eq('family_id',FE.profile.family_id);
 const ids=(fm.data||[]).map(x=>x.user_id);
 const pr=ids.length?await FE.db.from('profiles').select('id,display_name').in('id',ids):{data:[]};
 members=pr.data||[];loaded=true;FE.render();
}
const who=id=>id===FE.session.user.id?'Tú':members.find(x=>x.id===id)?.display_name||'Miembro';
function filtered(){return FE.data.expenses.filter(x=>(!filters.month||x.expense_date.startsWith(filters.month))&&(!filters.child||x.child_id===filters.child)&&(!filters.payer||x.paid_by===filters.payer)&&(!filters.category||x.category===filters.category))}
function edit(input={}){
 const x=typeof input==='string'?FE.data.expenses.find(y=>y.id===input)||{}:input;
 const cats=['Colegio','Comedor','Ropa','Salud','Actividades','Transporte','Ocio','Otros'];
 const payerOptions=members.map(m=>`<option value="${m.id}" ${x.paid_by===m.id?'selected':''}>${FE.esc(who(m.id))}</option>`).join('')||`<option value="${FE.session.user.id}">Tú</option>`;
 const childOptions=FE.data.children.map(c=>`<option value="${c.id}" ${x.child_id===c.id?'selected':''}>${FE.esc(c.name)}</option>`).join('');
 const categoryOptions=cats.map(c=>`<option ${x.category===c?'selected':''}>${c}</option>`).join('');
 FEModal.open({title:x.id?'Editar gasto':'Nuevo gasto',body:`<form class="form-grid">
 <label>Concepto<input name="title" value="${FE.esc(x.title||'')}" required></label>
 <label>Importe<input name="amount" type="number" step=".01" value="${x.amount||''}" required></label>
 <label>Fecha<input name="date" type="date" value="${x.expense_date||new Date().toLocaleDateString('en-CA')}"></label>
 <label>Pagado por<select name="payer">${payerOptions}</select></label>
 <label>Hijo<select name="child"><option value="">General</option>${childOptions}</select></label>
 <label>Categoría<select name="category">${categoryOptions}</select></label>
 <label class="full-field">Observaciones<textarea name="notes">${FE.esc(x.notes||'')}</textarea></label>
 <label class="full-field">Justificante o foto<input name="file" type="file" accept="image/*,.pdf"></label>
 ${x.attachment_name?`<div class="full-field detail-block">Adjunto: <button type="button" class="secondary" data-open-file>${FE.esc(x.attachment_name)}</button></div>`:''}
 <div class="modal-actions"><button class="round-action save">✓</button><button type="button" class="round-action cancel" data-cancel>×</button></div></form>`,onBind:m=>{
  m.querySelector('[data-cancel]').onclick=FEModal.close;
  m.querySelector('[data-open-file]')?.addEventListener('click',()=>FE.openAttachment(x.attachment_path));
  m.querySelector('form').onsubmit=async e=>{
   e.preventDefault();const f=new FormData(e.target),file=f.get('file');
   const att=file?.size?await FE.upload(file,'expenses'):null;if(att===false)return;
   const d={family_id:FE.profile.family_id,created_by:x.created_by||FE.session.user.id,paid_by:f.get('payer')||FE.session.user.id,title:f.get('title'),amount:Number(f.get('amount')),expense_date:f.get('date'),child_id:f.get('child')||null,category:f.get('category'),notes:f.get('notes')};
   if(att)Object.assign(d,{attachment_path:att.path,attachment_name:att.name,attachment_mime:att.mime});
   const q=x.id?await FE.db.from('expenses').update(d).eq('id',x.id):await FE.db.from('expenses').insert(d);
   if(q.error)return FE.notice('No se pudo guardar',q.error.message);FEModal.close();await FE.refresh();FE.render();
  };
 }});
}
FE.register('gastos',{
 render(){
  if(!loaded){load();return '<div class="page-head"><h1>Gastos</h1></div>'}
  const arr=filtered(),cats=[...new Set(FE.data.expenses.map(x=>x.category))];
  const childFilters=FE.data.children.map(c=>`<option value="${c.id}" ${filters.child===c.id?'selected':''}>${FE.esc(c.name)}</option>`).join('');
  const payerFilters=members.map(m=>`<option value="${m.id}" ${filters.payer===m.id?'selected':''}>${FE.esc(who(m.id))}</option>`).join('');
  const categoryFilters=cats.map(c=>`<option value="${FE.esc(c)}" ${filters.category===c?'selected':''}>${FE.esc(c)}</option>`).join('');
  const rows=arr.map(x=>card(x.attachment_path?'📎':'€',x.title,`${who(x.paid_by)} · ${x.expense_date} · ${Number(x.amount).toFixed(2)} €`,x.id)).join('');
  return pageHead('Gastos','Nuevo gasto')+`<div class="expense-filters">
   <label>Periodo<input type="month" data-filter="month" value="${filters.month}"></label>
   <label>Hijo<select data-filter="child"><option value="">Todos</option>${childFilters}</select></label>
   <label>Pagado por<select data-filter="payer"><option value="">Todos</option>${payerFilters}</select></label>
   <label>Categoría<select data-filter="category"><option value="">Todas</option>${categoryFilters}</select></label>
   </div><div class="entity-list">${rows||empty('No hay gastos.')}</div>`;
 },
 bind:r=>{
  r.querySelector('[data-new]').onclick=()=>edit();
  r.querySelectorAll('[data-filter]').forEach(x=>x.onchange=()=>{filters[x.dataset.filter]=x.value;FE.render()});
  r.querySelectorAll('[data-open]').forEach(x=>x.onclick=e=>{if(!e.target.closest('[data-delete]'))edit(x.dataset.open)});
  r.querySelectorAll('[data-delete]').forEach(x=>x.onclick=e=>{e.stopPropagation();FE.remove('expenses',x.dataset.delete)});
 }
});
})();
