(()=>{
'use strict';
const sorted=()=>[...FE.data.notes].sort((a,b)=>(a.sort_order??999)-(b.sort_order??999));
function edit(input={}){
 const id=typeof input==='string'?input:input?.id;const n=id?FE.data.notes.find(x=>x.id===id)||{}:input;
 const attachment=n.attachment_name?`<div class="full-field detail-block">Adjunto: <button type="button" class="secondary" data-open-file>${FE.esc(n.attachment_name)}</button></div>`:'';
 FEModal.open({
  title:n.id?'Editar nota':'Nueva nota',
  body:`<form class="form-grid">
   <label>Título<input name="title" value="${FE.esc(n.title||'')}" required></label>
   <label>Visibilidad<select name="visibility"><option value="family" ${n.visibility!=='private'?'selected':''}>Familiar</option><option value="private" ${n.visibility==='private'?'selected':''}>Solo para mí</option></select></label>
   <label class="full-field">Contenido<textarea name="body" rows="5">${FE.esc(n.body||'')}</textarea></label>
   <label class="full-field">Archivo o foto<input name="file" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"></label>
   ${attachment}
   <div class="modal-actions"><button class="round-action save">✓</button><button type="button" class="round-action cancel" data-cancel>×</button></div>
  </form>`,
  onBind:m=>{
   m.querySelector('[data-cancel]').onclick=FEModal.close;
   m.querySelector('[data-open-file]')?.addEventListener('click',()=>FE.openAttachment(n.attachment_path));
   m.querySelector('form').onsubmit=async e=>{
    e.preventDefault();
    const f=new FormData(e.target),file=f.get('file');
    const att=file?.size?await FE.upload(file,'notes'):null;if(att===false)return;
    const d={family_id:FE.profile.family_id,owner_id:FE.session.user.id,title:f.get('title'),body:f.get('body'),visibility:f.get('visibility'),sort_order:n.sort_order??FE.data.notes.length,updated_at:new Date().toISOString()};
    if(att)Object.assign(d,{attachment_path:att.path,attachment_name:att.name,attachment_mime:att.mime});
    const q=n.id?await FE.db.from('notes').update(d).eq('id',n.id):await FE.db.from('notes').insert(d);
    if(q.error)return FE.notice('No se pudo guardar',q.error.message);
    FEModal.close();await FE.refresh();FE.render();
   };
  }
 });
}
async function persist(box){
 const ids=[...box.querySelectorAll('.note-card')].map(x=>x.dataset.open);
 await Promise.all(ids.map((id,i)=>FE.db.from('notes').update({sort_order:i}).eq('id',id)));
 ids.forEach((id,i)=>{let n=FE.data.notes.find(x=>x.id===id);if(n)n.sort_order=i});
}
FE.register('notas',{
 render(){
  const cards=sorted().map(n=>`<article class="entity-card note-card" data-open="${n.id}"><button class="drag-handle">⠿</button><span class="avatar fallback">${n.visibility==='private'?'🔒':n.attachment_path?'📎':'📝'}</span><div class="entity-main"><b>${FE.esc(n.title||'Sin título')}</b><small>${n.visibility==='private'?'Privada · ':''}${FE.esc(n.body||'')}</small></div><button class="icon-delete" data-delete="${n.id}">🗑</button></article>`).join('');
  return pageHead('Notas','Nueva nota')+`<div class="entity-list notes-sortable">${cards||empty('No hay notas.')}</div>`;
 },
 bind:r=>{
  bindList(r,'notes',edit);
  const box=r.querySelector('.notes-sortable');if(!box)return;
  box.querySelectorAll('.drag-handle').forEach(h=>{
   let state={card:null,ghost:null,timer:null,drag:false,pointer:null};
   const move=e=>{if(e.pointerId!==state.pointer||!state.drag)return;e.preventDefault();state.ghost.style.left=(e.clientX-20)+'px';state.ghost.style.top=(e.clientY-25)+'px';state.ghost.hidden=true;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.note-card');state.ghost.hidden=false;if(target&&target!==state.card){const z=target.getBoundingClientRect();box.insertBefore(state.card,e.clientY<z.top+z.height/2?target:target.nextSibling)}};
   const end=async e=>{if(state.pointer!==null&&e.pointerId!==state.pointer)return;window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);window.removeEventListener('pointercancel',end);clearTimeout(state.timer);state.card?.classList.remove('drag-source');state.ghost?.remove();document.body.classList.remove('is-sorting');if(state.drag)await persist(box);state={card:null,ghost:null,timer:null,drag:false,pointer:null}};
   h.onpointerdown=e=>{e.preventDefault();e.stopPropagation();state.card=h.closest('.note-card');state.pointer=e.pointerId;state.timer=setTimeout(()=>{state.drag=true;document.body.classList.add('is-sorting');state.card.classList.add('drag-source');state.ghost=state.card.cloneNode(true);state.ghost.className='note-ghost';state.ghost.style.width=state.card.getBoundingClientRect().width+'px';document.body.appendChild(state.ghost)},120);window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',end);window.addEventListener('pointercancel',end)};
  });
 }
});
})();
