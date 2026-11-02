'use strict';
(()=>{
  let mode='welcome', recoverySession=false, turnstileWidget=null, captchaToken='';
  const PASSWORD_HELP='Mínimo 10 caracteres, con mayúscula, minúscula y número.';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const message=(text,type='ok')=>{const el=document.querySelector('[data-auth-message]');if(el){el.textContent=text;el.className='auth-message '+type}};
  const friendlyError=err=>{const m=String(err?.message||'');if(/captcha|turnstile/i.test(m))return 'No se ha podido completar la verificación de seguridad. Inténtalo de nuevo.';if(/invalid login credentials/i.test(m))return 'El correo o la contraseña no son correctos.';if(/user already registered|already been registered/i.test(m))return 'Ya existe una cuenta con este correo.';if(/password should be|password.*characters|weak password/i.test(m))return 'La contraseña no cumple los requisitos: '+PASSWORD_HELP;if(/email.*invalid/i.test(m))return 'Introduce un correo válido.';if(/rate limit|too many requests/i.test(m))return 'Demasiados intentos. Espera unos minutos y vuelve a probar.';return m||'No se ha podido completar la operación.'};
  const validPassword=p=>p.length>=10&&/[a-záéíóúñ]/.test(p)&&/[A-ZÁÉÍÓÚÑ]/.test(p)&&/\d/.test(p);
  const landscape=()=>'<div class="auth-landscape" aria-hidden="true"><i class="tree t1"></i><i class="tree t2"></i><i class="tree t3"></i><i class="house"><b></b></i><i class="hill h1"></i><i class="hill h2"></i></div>';
  const googleButton=()=>`<div class="auth-divider"><span>o</span></div><button class="auth-google" type="button" data-google-auth><span>G</span>Continuar con Google</button>`;
  const captchaBox=()=>`<div class="auth-captcha" data-captcha><div data-turnstile></div><small data-captcha-status>Comprobación de seguridad</small></div>`;
  const shell=body=>`<div class="auth-page"><section class="auth-phone"><div class="auth-brand"><img src="icon-512.png" alt=""><h1>Familia<span>EnEquipo</span></h1><p>Diferentes hogares,<br>la misma familia</p></div>${body}${landscape()}</section></div>`;
  function welcome(){return shell(`<div class="auth-actions"><button class="auth-primary" data-auth-mode="login">Iniciar sesión</button><button class="auth-secondary" data-auth-mode="signup">Crear cuenta</button>${googleButton()}<button class="auth-link" data-auth-mode="recover">¿Has olvidado tu contraseña?</button></div>`)}
  function form(kind){
    const signup=kind==='signup', recover=kind==='recover';
    const title=signup?'Crear cuenta':recover?'Recuperar contraseña':'Iniciar sesión';
    const help=signup?'Introduce tus datos para crear una cuenta.':recover?'Te enviaremos un enlace para crear una contraseña nueva.':'Accede con tu correo y contraseña.';
    const rules=signup?`<small class="auth-password-rules">${PASSWORD_HELP}</small>`:'';
    return shell(`<div class="auth-form-card"><button class="auth-back" type="button" data-auth-mode="welcome" aria-label="Volver">‹</button><h2>${title}</h2><p>${help}</p><form data-auth-form="${kind}"><label>Correo<input name="email" type="email" autocomplete="email" required></label>${recover?'':`<label>Contraseña<input name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" minlength="${signup?10:6}" ${signup?'pattern="(?=.*[a-záéíóúñ])(?=.*[A-ZÁÉÍÓÚÑ])(?=.*[0-9]).{10,}"':''} required>${rules}</label>`}${captchaBox()}<button class="auth-primary">${recover?'Enviar enlace':signup?'Crear cuenta':'Entrar'}</button><div class="auth-message" data-auth-message aria-live="polite"></div></form>${!recover?googleButton()+'<button class="auth-link" type="button" data-auth-mode="recover">¿Has olvidado tu contraseña?</button>':''}</div>`)}
  function updateForm(){return shell(`<div class="auth-form-card"><h2>Nueva contraseña</h2><p>Escribe y confirma la contraseña que quieres utilizar.</p><form data-auth-form="update"><label>Nueva contraseña<input name="password" type="password" autocomplete="new-password" minlength="10" pattern="(?=.*[a-záéíóúñ])(?=.*[A-ZÁÉÍÓÚÑ])(?=.*[0-9]).{10,}" required><small class="auth-password-rules">${PASSWORD_HELP}</small></label><label>Confirmar contraseña<input name="confirm" type="password" autocomplete="new-password" minlength="10" required></label><button class="auth-primary">Guardar contraseña</button><div class="auth-message" data-auth-message aria-live="polite"></div></form></div>`)}
  function resetCaptcha(){captchaToken='';if(turnstileWidget!==null&&window.turnstile){try{turnstile.reset(turnstileWidget)}catch{}}}
  function mountCaptcha(a){let target=a.querySelector('[data-turnstile]'),status=a.querySelector('[data-captcha-status]'),key=window.FE_CONFIG?.turnstileSiteKey;if(!target)return;turnstileWidget=null;captchaToken='';let tries=0,go=()=>{if(!window.turnstile){if(++tries<100)return setTimeout(go,100);status.textContent='No se pudo cargar la comprobación. Revisa la conexión.';return}turnstileWidget=turnstile.render(target,{sitekey:key,theme:'auto',size:'flexible',language:'es','response-field':false,callback:t=>{captchaToken=t;status.textContent='Verificación completada.'},'expired-callback':()=>{captchaToken='';status.textContent='La verificación ha caducado.'},'error-callback':()=>{captchaToken='';status.textContent='No se pudo completar la verificación.';return true}})};go()}
  function renderAuth(a){a.innerHTML=recoverySession?updateForm():mode==='welcome'?welcome():form(mode);bind(a);if(!recoverySession&&mode!=='welcome')mountCaptcha(a)}
  function bind(a){
    a.querySelectorAll('[data-google-auth]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{let redirectTo=location.origin+location.pathname,{error}=await FE.db.auth.signInWithOAuth({provider:'google',options:{redirectTo}});if(error)throw error}catch(err){message(friendlyError(err),'error');b.disabled=false}});
    a.querySelectorAll('[data-auth-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.authMode;renderAuth(a)});
    const f=a.querySelector('[data-auth-form]');if(!f)return;
    f.onsubmit=async e=>{
      e.preventDefault();const btn=f.querySelector('button.auth-primary');if(btn.disabled)return;const kind=f.dataset.authForm;if(kind!=='update'&&!captchaToken){message('Completa la comprobación de seguridad.','error');return}btn.disabled=true;const data=new FormData(f),email=String(data.get('email')||'').trim();const guard=FE.rateGuard('auth-'+kind,{limit:6,windowMs:60000,cooldownMs:1200});if(!guard.ok){btn.disabled=false;message('Demasiados intentos. Espera '+Math.max(1,Math.ceil(guard.wait/1000))+' segundos.','error');return;}
      try{
        if(kind==='recover'){
          const redirectTo=location.origin+location.pathname;localStorage.setItem('fe-password-recovery','1');
          const {error}=await FE.db.auth.resetPasswordForEmail(email,{redirectTo,captchaToken});if(error){localStorage.removeItem('fe-password-recovery');throw error;}
          message('Solicitud enviada. Si la cuenta existe y el proveedor entrega el mensaje, recibirás un enlace para cambiar la contraseña.');f.reset();resetCaptcha();
        }else if(kind==='update'){
          const password=String(data.get('password')||''),confirm=String(data.get('confirm')||'');if(!validPassword(password))throw new Error('La contraseña no cumple los requisitos: '+PASSWORD_HELP);if(password!==confirm)throw new Error('Las contraseñas no coinciden.');
          const {error}=await FE.db.auth.updateUser({password});if(error)throw error;
          recoverySession=false;localStorage.removeItem('fe-password-recovery');history.replaceState(null,'',location.pathname);message('Contraseña actualizada. Ya puedes continuar.');setTimeout(()=>FEApp.render(),800);
        }else if(kind==='signup'){
          const password=String(data.get('password')||'');if(!validPassword(password))throw new Error('La contraseña no cumple los requisitos: '+PASSWORD_HELP);
          const r=await FE.db.auth.signUp({email,password,options:{captchaToken}});if(r.error)throw r.error;
          if(r.data?.session){FE.session=r.data.session;await FEApp.load();FEApp.render();setTimeout(()=>FE.notice?.('Usuario creado correctamente','La cuenta está lista y ya has iniciado sesión.'),150)}
          else{mode='login';renderAuth(a);message('Usuario creado correctamente. Ya puedes iniciar sesión.','ok')}
        }else{
          const password=String(data.get('password')||''),r=await FE.db.auth.signInWithPassword({email,password,options:{captchaToken}});if(r.error)throw r.error;if(r.data?.session){FE.session=r.data.session;await FEApp.load();FEApp.render()}
        }
      }catch(err){message(friendlyError(err),'error');if(kind!=='update')resetCaptcha()}finally{btn.disabled=false}
    };
  }
  function install(){
    if(!window.FEApp||!window.FE||!FE.db)return setTimeout(install,20);
const originalRender=FEApp.render.bind(FEApp);
    FEApp.auth=a=>renderAuth(a);
    FEApp.render=(...args)=>{const a=document.getElementById('app');return recoverySession&&a?renderAuth(a):originalRender(...args)};
    const recoveryLink=window.FE_RECOVERY_LINK===true;
    const showRecovery=()=>{recoverySession=true;mode='welcome';setTimeout(()=>{const a=document.getElementById('app');if(a)renderAuth(a)},0)};
    FE.db.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')showRecovery();if(event==='SIGNED_OUT'){recoverySession=false;mode='welcome';localStorage.removeItem('fe-password-recovery');window.FE_RECOVERY_LINK=false;FE.session=null;FE.profile=null;FE.family=null;setTimeout(()=>{const a=document.getElementById('app');if(a)renderAuth(a)},0)}});
    if(recoveryLink)showRecovery();
    else{localStorage.removeItem('fe-password-recovery');if(!FE.session){mode='welcome';FEApp.render()}}
  }
  install();
})();
