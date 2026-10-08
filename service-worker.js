// EkVeera — Service Worker  (Offline + Fast + "Update" ka sawaal)
// ---------------------------------------------------------------------------------
//  • APP KHULNA / PAGE DIKHNA = Internet ke bina bhi (saari Pages, CSS, JS, Logo pehle se phone mein rakhi rehti hain).
//  • PAGE BADALNA 1 second ke andar = Page seedha phone ki Cache se aata hai (Internet ka intezaar nahi).
//  • Form bharna / Search / Payment = Internet se hi hote hain (Google Script ki calls Cache nahi hoti).
//  • Naya Version aane par App khud Candidate/Company se puchta hai: "Update karein?" (app.js mein).
//
//  ⚠️ HAR NAYE DEPLOY par neeche ki VERSION line badal dein (jaise 2026-10-15-v1). Nahi bhi badli to bhi naya Content
//     milne par App apne-aap pata laga leta hai aur Update ka sawaal puchta hai — par VERSION badalna sabse pakka hai.
const VERSION = '2026-10-08-v12';
const CACHE_NAME = 'ekveera-cache-' + VERSION;

const PRECACHE_URLS = [
  './', './index.html', './training.html', './placement.html', './help.html', './resume-builder.html', './staff-profile.html',
  './styles.css', './app.js', './i18n.js', './i18n-en.js', './staff-ref.js', './ekv-files.js', './ekv-scan.js',
  './company-form.js', './registration-forms.js', './help-center.js', './staff-profile.js', './staff-profile-admin.js',
  './reviews.js', './company-details.js', './apply-job.js', './payment-log.js', './receipt.js', './staff-pay.js',
  './training-attendance.js', './resume-builder.js', './docx.min.js',
  './manifest.json', './logo.png', './icon-192.png', './icon-512.png', './icon-maskable-192.png', './icon-maskable-512.png',
  './favicon-32.png', './favicon-64.png', './EPCS_Agreement_Form.pdf', './EPCS_Agreement_Form.docx'
];
// Bahar ki library / fonts — ek baar Internet par aate hi phone mein rakh li jaati hain (Offline mein bhi chalti hain)
const EXTERNAL_WARM = [
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Work+Sans:wght@400;500;600;700;800&display=swap'
];
const EXTERNAL_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Har file alag-alag: ek na mile to baaki rukti nahi. cache:'reload' = Browser ki purani Cache nahi, seedha Server se.
    await Promise.all(PRECACHE_URLS.map(async (u) => {
      try { const r = await fetch(new Request(u, { cache: 'reload' })); if (r && r.ok) await cache.put(new Request(u), r); } catch (e) {}
    }));
    await Promise.all(EXTERNAL_WARM.map(async (u) => {
      try { const r = await fetch(new Request(u, { mode: 'no-cors' })); await cache.put(u, r); } catch (e) {}
    }));
  })());
  // skipWaiting ab apne-aap nahi: Candidate/Company "Update karein" dabaye tabhi naya Version lagta hai
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME && k.indexOf('ekveera') === 0).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function refreshAll() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(PRECACHE_URLS.map(async (u) => {
    try { const r = await fetch(new Request(u, { cache: 'reload' })); if (r && r.ok) await cache.put(new Request(u), r); } catch (e) {}
  }));
}

self.addEventListener('message', (event) => {
  const d = event.data;
  if (d === 'SKIP_WAITING') { self.skipWaiting(); return; }
  if (d === 'REFRESH_CACHE') {
    event.waitUntil(refreshAll().then(() => { if (event.source && event.source.postMessage) event.source.postMessage('REFRESHED'); }));
  }
});

// ---- Naya Content aaya hai ya nahi (VERSION na badli ho tab bhi) ----
const lastCheck = {};
async function checkForChange(req) {
  try {
    const key = new URL(req.url).pathname;
    const now = Date.now();
    if (lastCheck[key] && now - lastCheck[key] < 10 * 60 * 1000) return;       // 10 min mein ek baar
    lastCheck[key] = now;
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req, { ignoreSearch: true });
    if (!cached) return;
    const fresh = await fetch(new Request(req.url.split('?')[0], { cache: 'no-store' }));
    if (!fresh || !fresh.ok) return;
    const a = await cached.clone().text(), b = await fresh.clone().text();
    if (a !== b) {
      const cs = await self.clients.matchAll({ type: 'window' });
      cs.forEach((c) => c.postMessage({ type: 'CONTENT_UPDATE' }));
    }
  } catch (e) { /* Offline hai — koi baat nahi */ }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Apps Script / Forms / Maps jaisi live calls kabhi Cache nahi hoti (Form, Search, Payment hamesha Internet se)
  if (url.hostname === 'script.google.com' || url.hostname === 'script.googleusercontent.com' || url.hostname === 'docs.google.com' ||
      url.hostname.indexOf('maps.google') > -1 || url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com') return;

  // Bahar ki library / fonts: Cache pehle, peeche se taaza kar do
  if (EXTERNAL_HOSTS.indexOf(url.hostname) > -1) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const hit = await cache.match(req);
      const net = fetch(req).then((r) => { if (r && (r.ok || r.type === 'opaque')) cache.put(req, r.clone()); return r; }).catch(() => null);
      return hit || (await net) || new Response('', { status: 504 });
    })());
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Page (HTML) kholna: pehle phone ki Cache se TURANT; peeche se check ki Server par naya to nahi
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') > -1) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      let hit = await cache.match(req, { ignoreSearch: true });
      if (!hit && /\/$/.test(url.pathname)) hit = await cache.match('./index.html');
      if (hit) { event.waitUntil(checkForChange(req)); return hit; }
      try {
        const r = await fetch(req);
        if (r && r.ok) cache.put(new Request(url.origin + url.pathname), r.clone());
        return r;
      } catch (e) {
        return (await cache.match('./index.html')) || new Response('<h3 style="font-family:sans-serif;padding:24px">📴 Offline — Internet चालू करके एक बार App खोलें।</h3>', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  // JS / CSS / Image / Font: Cache pehle (turant). Cache mein na ho to Internet se laakar rakh lo.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const r = await fetch(req);
      if (r && r.ok) cache.put(req, r.clone());
      return r;
    } catch (e) { return new Response('', { status: 504 }); }
  })());
});
