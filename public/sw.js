/* NOVAPROJE service worker: makes the site installable and shows an offline page.
   Never stores panel pages, API answers, documents or anything personal. */
const VERSION = 'np-v1';
const SHELL = ['/offline.html', '/icons/icon-192.png', '/img/revmark_big.webp'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
const STATIC = /^\/(_next\/static\/|img\/|icons\/|usta\/(?!.*\.glb$))/;
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).catch(() => caches.match('/offline.html')));
    return;
  }
  if (!STATIC.test(u.pathname)) return; // api, files, videos, panel data: always from the network
  e.respondWith(caches.open(VERSION).then(async (c) => {
    const hit = await c.match(r);
    const net = fetch(r).then((res) => { if (res.ok && res.type === 'basic') c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
