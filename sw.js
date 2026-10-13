// sw.js – funcionamento offline do Kolb-MFC
// Caminhos relativos: funciona na raiz do domínio ou em subpastas,
// como https://usuario.github.io/kolb-mfc/
// Ao publicar uma nova versão, aumente o número do cache.
const CACHE_NAME = "kolb-mfc-v4";
const ARQUIVOS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./images/icon-192.png",
  "./images/icon-512.png"
];
// Bibliotecas externas (Tailwind, Chart.js e fonte) guardadas após o primeiro uso
const CDNS = ["cdn.tailwindcss.com", "cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(nomes => Promise.all(nomes.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const mesmoSite = url.origin === self.location.origin;
  const cdn = CDNS.includes(url.hostname);
  if (!mesmoSite && !cdn) return; // Firebase e outros seguem direto pela rede
  if (mesmoSite) {
    // Arquivos do app: busca primeiro na rede (pega sempre a versão nova) e usa o cache sem internet
    event.respondWith(
      fetch(req).then(net => {
        if (net.ok) { const copia = net.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copia)); }
        return net;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("./index.html")))
    );
    return;
  }
  // Bibliotecas externas: cache primeiro
  event.respondWith(
    caches.match(req).then(resp => resp || fetch(req).then(net => {
      if (net.ok || net.type === "opaque") {
        const copia = net.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copia));
      }
      return net;
    }))
  );
});
