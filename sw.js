const CACHE='quet-lot-id-v2';
const LIBS=['https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js','https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'];
const LOCAL=['./','index.html','manifest.json','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(async c=>{
    await Promise.all(LOCAL.map(u=>c.add(u).catch(()=>{})));
    await Promise.all(LIBS.map(u=>c.add(u).catch(()=>{})));
  }).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(r=>{
      if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}
      return r;
    }).catch(()=>hit);
    return hit||net;
  }));
});
