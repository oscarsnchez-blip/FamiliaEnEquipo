(()=>{'use strict';
const HELP={
inicio:['Inicio resume la actividad y ofrece accesos a las funciones principales.','Los módulos visibles pueden cambiarse desde Configuración > Inicio y navegación.'],
agenda:['Los eventos familiares son visibles para toda la familia; los privados, solo para su creador.','Todos los miembros pueden editar un evento familiar, pero solo quien lo creó puede eliminarlo.'],
compra:['Añade productos a un supermercado y marca los artículos cuando estén comprados.','Los productos habituales se reutilizan para agilizar listas futuras.'],
menu:['Planifica comidas y cenas por día. Puedes indicar una cena distinta para cada menor cuando sea necesario.'],
horario:['Configura franjas, asignaturas y actividades extraescolares. Los cambios se aplican solo a la familia actual.'],
notas:['Las notas pueden ser familiares o privadas. El clip 📎 indica que existe un adjunto.','Solo el creador puede eliminar una nota; los miembros pueden editar las notas familiares.'],
chat:['El Chat es familiar. Tus mensajes aparecen a la derecha y los de otros miembros a la izquierda.','Los mensajes no se editan ni se eliminan desde la aplicación.'],
configuracion:['Gestiona tu perfil, apariencia, módulos, privacidad y sesión.','Si eres administrador verás también el Centro de administración familiar.']};
const FAQ=[['¿Cómo invito a alguien?','Comparte el código familiar desde Mi perfil. No lo publiques en redes o lugares abiertos.'],['¿Qué diferencia hay entre familiar y privado?','El contenido familiar lo ven los miembros de la familia; el privado solo su propietario.'],['¿Cómo descargo mis datos?','Ve a Configuración > Privacidad y datos > Descargar copia de mis datos.'],['¿Cómo recupero la contraseña?','En la pantalla de acceso pulsa “¿Has olvidado tu contraseña?”.'],['¿Cómo elimino mi cuenta?','Ve a Configuración > Aplicación y sesión. La eliminación es definitiva.']];
function open(){let page=FE.page||'inicio',context=HELP[page]||HELP.inicio,items=[...context.map((x,i)=>`<details class="help-item" ${i===0?'open':''}><summary>${i===0?'Ayuda de esta pantalla':'Consejo'}</summary><p>${FE.esc(x)}</p></details>`),...FAQ.map(([q,a])=>`<details class="help-item"><summary>${FE.esc(q)}</summary><p>${FE.esc(a)}</p></details>`)].join('');FEModal.open({title:'Ayuda',body:`<div class="help-context"><b>${page.charAt(0).toUpperCase()+page.slice(1)}</b><small>Información contextual y preguntas frecuentes</small></div><div class="help-list">${items}</div><a class="help-support" href="mailto:soporte.familiaenequipo@gmail.com">Contactar con soporte</a>`})}
window.FEHelp={open};
})();
