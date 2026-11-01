/* Basketball Touch Analyst v12 offline cache */
const CACHE = 'bta-v14-portrait-chart-20261101';
const CORE = ['./index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil((async()=> {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE.map(x => new Request(x, {cache:'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async()=> {
    for (const name of await caches.keys()) { if (name.startsWith('bta-') && name !== CACHE) await caches.delete(name); }
    await self.clients.claim();
  })());
});
self.addEventListener('message', e => { if(e.data && e.data.type==='SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  if(event.request.method!=='GET') return;
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;
  if(event.request.mode==='navigate') {
    event.respondWith((async()=>{
      try { return await fetch(event.request); }
      catch(_) { const cache=await caches.open(CACHE); return (await cache.match('./index.html')) || Response.error(); }
    })());
    return;
  }
  event.respondWith((async()=> {
    const cache=await caches.open(CACHE);
    const cached=await cache.match(event.request);
    if(cached) return cached;
    try { const response=await fetch(event.request); if(response.ok) await cache.put(event.request,response.clone()); return response; }
    catch(_) { return Response.error(); }
  })());
});
