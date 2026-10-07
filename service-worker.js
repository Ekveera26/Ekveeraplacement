// EkVeera Training Center — Service Worker
// Ye file PWA "Install App" feature ke kaam karne ke liye zaroori hai
// (Chrome/Edge/Android par bina is file ke "Add to Home Screen" prompt nahi aata)

const CACHE_NAME = 'ekveera-cache-v11';
const PRECACHE_URLS = [
  './index.html',
  './training.html',
  './placement.html',
  './styles.css',
  './app.js',
  './company-form.js',
  './registration-forms.js',
  './help-center.js',
  './i18n.js',
  './i18n-en.js',
  './staff-ref.js',
  './staff-profile.html',
  './staff-profile.js',
  './staff-profile-admin.js',
  './reviews.js',
  './ekv-scan.js',
  './company-details.js',
  './help.html',
  './apply-job.js',
  './payment-log.js',
  './receipt.js',
  './staff-pay.js',
  './training-attendance.js',
  './resume-builder.html',
  './resume-builder.js',
  './logo.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {}) // koi file na mile to bhi install fail na ho
  );
  // skipWaiting ab apne-aap nahi: user "Update karein" dabaye tabhi naya Version lagta hai
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first strategy: pehle live internet se try karo (taaki Form/Stats/Search hamesha fresh rahe),
// internet na ho to jo pehle se Cache me hai wahi dikha do (basic offline support)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Google Apps Script / Forms jaisi live API calls ko cache mat karo
  if (event.request.url.indexOf('script.google.com') !== -1 ||
      event.request.url.indexOf('docs.google.com') !== -1) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
