// The page opens without signal. The plan itself (data.enc) never goes through here: the page keeps its own copy.
const C = 'jp-shell-v1';
const SHELL = ['index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable.png','apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.pathname.endsWith('data.enc')) return;
  if (/^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open(C).then(c => c.match(r).then(hit => hit || fetch(r).then(n => { c.put(r, n.clone()); return n; }))));
    return;
  }
  if (u.origin !== location.origin) return;
  const key = r.mode === 'navigate' ? 'index.html' : r;
  e.respondWith(caches.open(C).then(c => c.match(key, { ignoreSearch:true }).then(hit => {
    const net = fetch(r).then(n => { if (n.ok) c.put(key, n.clone()); return n; });
    if (hit){ net.catch(() => {}); e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  })));
});
