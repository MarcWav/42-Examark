const CACHE='42-python-0.27.7-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||!url.pathname.startsWith('/runtime/'))return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
   const cached=await cache.match(event.request);if(cached)return cached;
   const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;
 }));
});
