'use strict';
(()=>{
  let mode='welcome', recoverySession=false;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const message=(text,type='ok')=>{const el=document.querySelector('[data-auth-message]');if(el){el.textContent=text;el.className='auth-message '+type}};
  const landscape=()=>'<div class="auth-landscape" aria-hidden="true"><i class="tree t1"></i><i class="tree t2"></i><i class="tree t3"></i><i class="house"><b></b></i><i class="hill h1"></i><i class="hill h2"></i></div>';
  const shell=body=>`<div class="auth-page"><section class="auth-phone"><div class="auth-brand"><img src="icon-512.png" alt=""><h1>Familia<span>EnEquipo</span></h1><p>Diferentes hogares,<br>la misma familia</p></div>${body}${landscape()}</section></div>`;
  function welcome(){return shell(`<div class="auth-actions"><button class="auth-primary" data-auth-mode="login">Iniciar sesión</button><button class="auth-secondary" data-auth-mode="signup">Crear cuenta</button><button class="auth-link" data-auth-mode="recover">¿Has olvidado tu contraseña?</button></div>`)}
  function form(kind){
    const signup=kind==='signup', recover=kind==='recover';
    const title=signup?'Crear cuenta':recover?'Recuperar contraseña':'Iniciar sesión';
    const help=signup?'Introduce tus datos para crear una cuenta.':recover?'Te enviaremos un enlace para crear una contraseña nueva.':'Accede con tu correo y contraseña.';
    return shell(`<div class="auth-form-card"><button class="auth-back" type="button" data-auth-mode="welcome" aria-label="Volver">‹</button><h2>${title}</h2><p>${help}</p><form data-auth-form="${kind}"><label>Correo<input name="email" type="email" autocomplete="email" required></label>${recover?'':`<label>Contraseña<input name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" minlength="6" required></label>`}<button class="auth-primary">${recover?'Enviar enlace':signup?'Crear cuenta':'Entrar'}</button><div class="auth-message" data-auth-message aria-live="polite"></div></form>${!recover?'<button class="auth-link" type="button" data-auth-mode="recover">¿Has olvidado tu contraseña?</button>':''}</div>`)}
  function updateForm(){return shell(`<div class="auth-form-card"><h2>Nueva contraseña</h2><p>Escribe y confirma la contraseña que quieres utilizar.</p><form data-auth-form="update"><label>Nueva contraseña<input name="password" type="password" autocomplete="new-password" minlength="6" required></label><label>Confirmar contraseña<input name="confirm" type="password" autocomplete="new-password" minlength="6" required></label><button class="auth-primary">Guardar contraseña</button><div class="auth-message" data-auth-message aria-live="polite"></div></form></div>`)}
  function renderAuth(a){a.innerHTML=recoverySession?updateForm():mode==='welcome'?welcome():form(mode);bind(a)}
  function bind(a){
    a.querySelectorAll('[data-auth-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.authMode;renderAuth(a)});
    const f=a.querySelector('[data-auth-form]');if(!f)return;
    f.onsubmit=async e=>{
      e.preventDefault();const btn=f.querySelector('button');btn.disabled=true;const data=new FormData(f),kind=f.dataset.authForm,email=String(data.get('email')||'').trim();
      try{
        if(kind==='recover'){
          const redirectTo=location.origin+location.pathname;
          localStorage.setItem('fe-password-recovery','1');
          const {error}=await FE.db.auth.resetPasswordForEmail(email,{redirectTo});if(error){localStorage.removeItem('fe-password-recovery');throw error;}
          message('Si el correo está registrado, recibirás un enlace para cambiar la contraseña.');f.reset();
        }else if(kind==='update'){
          const password=String(data.get('password')||''),confirm=String(data.get('confirm')||'');if(password!==confirm)throw new Error('Las contraseñas no coinciden.');
          const {error}=await FE.db.auth.updateUser({password});if(error)throw error;
          recoverySession=false;localStorage.removeItem('fe-password-recovery');history.replaceState(null,'',location.pathname);message('Contraseña actualizada. Ya puedes continuar.');setTimeout(()=>FEApp.render(),800);
        }else{
          const password=String(data.get('password')||'');
          const r=kind==='signup'?await FE.db.auth.signUp({email,password}):await FE.db.auth.signInWithPassword({email,password});if(r.error)throw r.error;
        }
      }catch(err){message(err?.message||'No se ha podido completar la operación.','error')}finally{btn.disabled=false}
    };
  }
  function install(){
    if(!window.FEApp||!window.FE||!FE.db)return setTimeout(install,20);
    const original=FEApp.auth.bind(FEApp);FEApp.auth=a=>renderAuth(a);
    const recoveryLink=window.FE_RECOVERY_LINK===true;
    const showRecovery=()=>{recoverySession=true;mode='welcome';setTimeout(()=>{const a=document.getElementById('app');if(a)renderAuth(a)},0)};
    FE.db.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')showRecovery()});
    if(recoveryLink)showRecovery();
    else{localStorage.removeItem('fe-password-recovery');if(!FE.session){mode='welcome';FEApp.render()}}
  }
  install();
})();
