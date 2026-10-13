const CACHE='quet-lot-id-v13';
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
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  const isLib=LIBS.includes(req.url);
  // Không can thiệp vào request khác (vd: api.github.com) để luôn lấy dữ liệu mới
  if(url.origin!==location.origin&&!isLib)return;
  // API đồng bộ GitHub: luôn gọi thẳng server, không cache
  if(url.pathname.startsWith('/api/'))return;
  if(isLib){
    // thư viện: ưu tiên cache
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{
      if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}
      return r;
    })));
    return;
  }
  // file của app: ưu tiên mạng (luôn nhận bản mới), mất mạng thì dùng cache
  e.respondWith(fetch(req).then(r=>{
    if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}
    return r;
  }).catch(()=>caches.match(req).then(hit=>hit||caches.match('index.html'))));
});
