FAMILIAENEQUIPO 1.0.2

SUBIR A GITHUB SOLO ESTOS TRES ARCHIVOS:
- index.html
- app.js
- sw.js

No reemplazar config.js: conserva la URL y la Publishable key actuales.
No reemplazar styles.css, manifest ni iconos.

CORRECCIONES:
- El formulario ya no se cierra mientras se escribe.
- Los eventos de autenticacion solo redibujan si cambia el usuario.
- Realtime aplaza el refresco mientras hay formulario o campo activo.
- Service Worker clona la respuesta antes de almacenarla.
- Version y cache elevadas a 1.0.2 / v102.
