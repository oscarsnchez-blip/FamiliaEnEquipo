const CACHE='familia-en-equipo-1.0.2';
const FILES=['./','index.html','styles.css?v=101','config.js?v=101','app.js?v=102','manifest.webmanifest?v=102','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(FILES.map(f=>c.add(f)))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith((async()=>{try{const response=await fetch(e.request,{cache:'no-store'});if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});}return response;}catch(_){return (await caches.match(e.request))||(await caches.match('./'));}})())});
