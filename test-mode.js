/* EkVeera — 🧪 TEST MODE (v37). Sirf tab chalta hai jab is browser me Test Key save ho (test-mode.html se).
   ON hone par: har Server-call ke saath Test Key jaati hai → Server entry ASLI Sheet me nahi, alag TEST Database me rakhta hai;
   Email/WhatsApp/Push kisi ko nahi jaate. Har page par laal patti dikhti hai. Aam visitors par iska koi asar nahi (unke paas Key hoti hi nahi). */
(function () {
  'use strict';
  var KEY_NAME = 'ekv_test_key', key = '';
  try { key = localStorage.getItem(KEY_NAME) || ''; } catch (e) {}
  window.EKV_TEST_MODE = !!key;
  if (!key) return;

  // Front Door (Cloudflare) Test me band — Test ki entry asli raste (Apps Script → Test Database) se jaaye
  try { Object.defineProperty(window, 'EKV_INTAKE_URL', { get: function () { return ''; }, set: function () {} }); } catch (e) {}

  var GS = /^https:\/\/script\.google(usercontent)?\.com\//;
  var of = window.fetch;
  window.fetch = function (input, init) {
    try {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      if (GS.test(url)) {
        init = init || {};
        var b = init.body;
        if (b instanceof URLSearchParams) { b = new URLSearchParams(b); b.set('testmode', key); init = Object.assign({}, init, { body: b }); }
        else if (typeof b === 'string') { init = Object.assign({}, init, { body: b + (b ? '&' : '') + 'testmode=' + encodeURIComponent(key) }); }
        else if (typeof FormData !== 'undefined' && b instanceof FormData) { b.set('testmode', key); }
        else if (!b && typeof input === 'string') { input = input + (input.indexOf('?') > -1 ? '&' : '?') + 'testmode=' + encodeURIComponent(key); }
      }
    } catch (e) {}
    return of.call(this, input, init);
  };

  function banner() {
    if (document.getElementById('ekvTestBar')) return;
    var d = document.createElement('div'); d.id = 'ekvTestBar';
    d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483000;background:#c0392b;color:#fff;font:600 13px/1.3 system-ui,sans-serif;padding:6px 10px;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.3)';
    d.innerHTML = '🧪 TEST MODE — yahan ki entry ASLI Sheet me nahi jaati, Email/WhatsApp kisi ko nahi jaate. &nbsp;<a href="test-mode.html" style="color:#fff;text-decoration:underline">Test Panel</a> &nbsp;<button type="button" id="ekvTestOff" style="background:#fff;color:#c0392b;border:0;border-radius:6px;padding:3px 10px;font-weight:700;cursor:pointer">Test Mode band</button>';
    document.body.appendChild(d); document.body.style.paddingTop = (d.offsetHeight + (parseInt(getComputedStyle(document.body).paddingTop) || 0)) + 'px';
    document.getElementById('ekvTestOff').onclick = function () { try { localStorage.removeItem(KEY_NAME); } catch (e) {} location.reload(); };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', banner); else banner();
})();
