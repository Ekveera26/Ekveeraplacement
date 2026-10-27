/* EkVeera — 🔐 App Login Gate (v22)
   ------------------------------------------------------------------------------------------------
   KYA KARTA HAI
     Jab EkVeera ko phone me "App ki tarah Install" (PWA / Play Store wala app) karke kholte hain, to pehle Login screen aati hai.
     Mobile → OTP → Login hote hi app khulta hai. Login ka matlab: Admin jis ID / Mobile par Notification (Inbox) bheje, wahi use paye;
     isse Email / SMS ki zarurat bahut kam ho jaati hai.

   KAB CHALTA HAI
     • Sirf Install kiye hue App me (display-mode: standalone / Play Store TWA / iPhone Home-Screen).
     • Normal Browser (Google se website kholne wale) par KABHI nahi — website sabke liye khuli rehti hai (Google ko dikhne ke liye zaroori).
     • Test ke liye Browser me:  index.html?gate=1   (band karne ke liye ?gate=0)

   MODE  (neeche MODE badlein, ya kisi page par is file se pehle  window.EKV_GATE_MODE = 'soft'  likhein)
     'hard' = bina Login ke App nahi khulta (sirf Register / Help / Privacy / Account-Delete page khule rehte hain — Play Store ka niyam).
     'soft' = Login screen aati hai, par "Bina Login ke dekhein" ka button bhi hai.
     'off'  = Gate band.

   SURAKSHA
     • Login Server (EkVeera_Account.gs) hi jaanchta hai — yahan sirf screen hai. Token Device se bandha hai, 30 din chalta hai.
     • Yahi file naya Login-Token banati nahi; wahi 'ekv_acct' / 'ekv_dev' Storage use karti hai jo push.js (🔔 Inbox) use karta hai.
*/
(function () {
  'use strict';

  var MODE = (window.EKV_GATE_MODE || 'hard');           // 'hard' | 'soft' | 'off'
  var AKEY = 'ekv_acct', DKEY = 'ekv_dev', SKIP = 'ekv_gate_skip';

  /* Ye pages bina Login ke hamesha khule rehne chahiye (naya user Register kare; Play Store ke liye Privacy + Account-Delete; Help/Enquiry; Staff apna alag Login) */
  var OPEN_PAGES = /(^|\/)(register|privacy|delete-data|help|staff-profile)\.html$/i;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  function lang() { var l = lsGet('ekveera_lang'); return l === 'en' ? 'en' : 'hi'; }
  function L(hi, en) { return lang() === 'en' ? en : hi; }

  function isInstalledApp() {
    try {
      var q = location.search || '';
      if (/[?&]gate=0\b/.test(q)) return false;
      if (/[?&]gate=1\b/.test(q)) return true;
      if (window.matchMedia) {
        if (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: minimal-ui)').matches) return true;
      }
      if (window.navigator && window.navigator.standalone === true) return true;                       // iPhone Home-Screen
      if (document.referrer && document.referrer.indexOf('android-app://') === 0) return true;          // Play Store (TWA)
    } catch (e) {}
    return false;
  }
  function isAdminOrStaff() { return /[?&]admin=1\b/.test(location.search || ''); }

  /* Token ki Expiry local jaanch (Token = mobile.devHash.expiry.level.hmac). Asli jaanch Server karta hai; wahan se RELOGIN aaye to push.js Token mita deta hai */
  function loggedIn() {
    try {
      var a = JSON.parse(lsGet(AKEY) || '{}') || {};
      if (!a.token || !a.mobile) return false;
      var parts = String(a.token).split('.');
      if (parts.length !== 5 || parts[0] !== String(a.mobile)) return false;
      return parseInt(parts[2], 10) > Date.now();
    } catch (e) { return false; }
  }
  function devId() {
    var d = lsGet(DKEY);
    if (!d || d.length < 16) {
      try { var a = new Uint8Array(20); (window.crypto || window.msCrypto).getRandomValues(a); d = Array.prototype.map.call(a, function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
      catch (e) { d = 'tmp' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2); }
      lsSet(DKEY, d);
    }
    return d;
  }

  /* ---- ye sab bahar se jaanchne ke liye (tests) ---- */
  window.__ekvGate = { isInstalledApp: isInstalledApp, loggedIn: loggedIn, openPages: OPEN_PAGES, mode: function () { return MODE; } };

  if (MODE === 'off') return;
  if (!isInstalledApp()) return;
  if (isAdminOrStaff()) return;
  if (OPEN_PAGES.test(location.pathname || '')) return;
  if (loggedIn()) return;
  if (MODE === 'soft' && ssGet(SKIP) === '1') return;

  /* ---- Login screen dikhani hai: pehle baaki page chhupao (jhalak bhi na dikhe) ---- */
  var hideCss = document.createElement('style');
  hideCss.id = 'ekvGateHide';
  hideCss.textContent = 'html.ekv-gating body > *:not(#ekvGate){display:none !important}html.ekv-gating,html.ekv-gating body{background:#0B1F3A !important;overflow:hidden !important}';
  (document.head || document.documentElement).appendChild(hideCss);
  document.documentElement.classList.add('ekv-gating');

  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
  function $(id) { return document.getElementById(id); }
  function post(params) {
    if (typeof vcSecurePost === 'function') return vcSecurePost(params);
    return Promise.reject(new Error('no api'));
  }

  function build() {
    if ($('ekvGate')) return;
    var css = document.createElement('style');
    css.textContent =
      '#ekvGate{position:fixed;inset:0;z-index:2147483000;background:linear-gradient(160deg,#0B1F3A 0%,#12365f 60%,#1F9D95 140%);color:#fff;display:flex;align-items:center;justify-content:center;padding:18px;font-family:inherit;overflow:auto}' +
      '#ekvGate .eg-card{width:100%;max-width:400px;background:#fff;color:#1b2430;border-radius:18px;padding:24px 20px 18px;box-shadow:0 18px 50px rgba(0,0,0,.35)}' +
      '#ekvGate .eg-logo{display:block;width:76px;height:76px;margin:0 auto 10px;border-radius:16px;object-fit:contain}' +
      '#ekvGate h1{font-size:20px;margin:0 0 4px;text-align:center;color:#0B1F3A}' +
      '#ekvGate .eg-sub{font-size:13.5px;text-align:center;color:#596579;margin:0 0 16px;line-height:1.5}' +
      '#ekvGate label{display:block;font-size:13px;font-weight:700;margin:10px 0 5px;color:#0B1F3A}' +
      '#ekvGate input{width:100%;box-sizing:border-box;padding:13px 12px;border:1.5px solid #cfd6e0;border-radius:10px;font-size:17px;letter-spacing:.5px;font-family:inherit}' +
      '#ekvGate input:focus{outline:0;border-color:#1F9D95}' +
      '#ekvGate .eg-btn{width:100%;margin-top:12px;padding:13px;border:0;border-radius:10px;background:#1F9D95;color:#fff;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit}' +
      '#ekvGate .eg-btn.alt{background:#fff;color:#0B1F3A;border:1.5px solid #0B1F3A}#ekvGate .eg-btn:disabled{opacity:.6}' +
      '#ekvGate .eg-msg{min-height:20px;margin-top:10px;font-size:13.5px;line-height:1.45;text-align:center}' +
      '#ekvGate .eg-msg.err{color:#b91c1c}#ekvGate .eg-msg.ok{color:#15803d}' +
      '#ekvGate .eg-links{display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;margin-top:14px;font-size:13px}' +
      '#ekvGate .eg-links a{color:#0B5CAD;text-decoration:underline}' +
      '#ekvGate .eg-note{font-size:11.5px;color:#7a8696;text-align:center;margin-top:12px;line-height:1.5}';
    document.head.appendChild(css);

    var wrap = el('div'); wrap.id = 'ekvGate'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
    var card = el('div', 'eg-card'); wrap.appendChild(card);
    var logo = el('img', 'eg-logo'); logo.src = 'logo.png'; logo.alt = 'EkVeera'; logo.onerror = function () { logo.style.display = 'none'; }; card.appendChild(logo);
    card.appendChild(el('h1', '', L('EkVeera में Login करें', 'Login to EkVeera')));
    card.appendChild(el('p', 'eg-sub', L('अपने Mobile Number से Login करें। आपकी ID, Payment, Order और Interview की सूचनाएँ यहीं सुरक्षित मिलेंगी।', 'Login with your mobile number. Your ID, payment, order and interview updates will be safely available here.')));

    card.appendChild(el('label', '', L('Mobile Number (+91)', 'Mobile number (+91)')));
    var im = el('input'); im.id = 'egMob'; im.type = 'tel'; im.inputMode = 'numeric'; im.maxLength = 10; im.autocomplete = 'tel-national'; im.placeholder = L('10 अंकों का Mobile', '10-digit mobile'); card.appendChild(im);

    var otpBox = el('div'); otpBox.style.display = 'none';
    otpBox.appendChild(el('label', '', L('6 अंक का Code', '6-digit code')));
    var io = el('input'); io.id = 'egOtp'; io.type = 'tel'; io.inputMode = 'numeric'; io.maxLength = 6; io.autocomplete = 'one-time-code'; io.placeholder = '• • • • • •'; otpBox.appendChild(io);
    card.appendChild(otpBox);

    var bSend = el('button', 'eg-btn', L('📩 Code भेजें', '📩 Send code')); bSend.type = 'button'; card.appendChild(bSend);
    var bGo = el('button', 'eg-btn', L('🔓 Login', '🔓 Login')); bGo.type = 'button'; bGo.style.display = 'none'; card.appendChild(bGo);
    var msg = el('div', 'eg-msg'); msg.setAttribute('aria-live', 'polite'); card.appendChild(msg);

    function say(t, cls) { msg.textContent = t; msg.className = 'eg-msg ' + (cls || ''); }
    function mob() { return (im.value || '').replace(/\D/g, '').slice(-10); }

    bSend.onclick = function () {
      var m = mob();
      if (m.length !== 10) return say(L('10 अंकों का सही Mobile Number लिखें।', 'Enter a valid 10-digit mobile number.'), 'err');
      bSend.disabled = true; say(L('⏳ Code भेजा जा रहा है...', '⏳ Sending code...'), '');
      post({ action: 'acstart', mobile: m }).then(function (r) {
        if (r && r.status === 'ok') {
          otpBox.style.display = 'block'; bGo.style.display = 'block'; bSend.textContent = L('🔁 दोबारा Code भेजें', '🔁 Send again'); io.focus();
          say(r.message || L('Code भेज दिया गया है।', 'Code sent.'), 'ok');
        } else say((r && r.message) || L('कुछ गड़बड़ हुई — दोबारा कोशिश करें।', 'Something went wrong — try again.'), 'err');
      }).catch(function () { say(L('Internet चेक करके दोबारा कोशिश करें।', 'Check your internet and try again.'), 'err'); })
        .then(function () { setTimeout(function () { bSend.disabled = false; }, 20000); });
    };
    bGo.onclick = function () {
      var m = mob(), o = (io.value || '').replace(/\D/g, '');
      if (m.length !== 10 || o.length !== 6) return say(L('Mobile और 6 अंक का Code सही लिखें।', 'Enter your mobile and the 6-digit code correctly.'), 'err');
      bGo.disabled = true; say(L('⏳ जाँच हो रही है...', '⏳ Checking...'), '');
      post({ action: 'acverify', mobile: m, otp: o, deviceId: devId() }).then(function (r) {
        if (r && r.status === 'ok') {
          lsSet(AKEY, JSON.stringify({ mobile: r.mobile, token: r.token, level: r.level }));
          say(L('✅ Login हो गया', '✅ Logged in'), 'ok');
          setTimeout(function () { location.reload(); }, 400);       // push.js अपना Inbox / 🔔 नए Login के साथ उठा ले
        } else { say((r && r.message) || L('कुछ गड़बड़ हुई — दोबारा कोशिश करें।', 'Something went wrong — try again.'), 'err'); bGo.disabled = false; }
      }).catch(function () { say(L('Internet चेक करके दोबारा कोशिश करें।', 'Check your internet and try again.'), 'err'); bGo.disabled = false; });
    };
    im.addEventListener('keydown', function (e) { if (e.key === 'Enter') bSend.onclick(); });
    io.addEventListener('keydown', function (e) { if (e.key === 'Enter') bGo.onclick(); });

    if (MODE === 'soft') {
      var bSkip = el('button', 'eg-btn alt', L('अभी बिना Login के देखें', 'Continue without login')); bSkip.type = 'button';
      bSkip.onclick = function () { ssSet(SKIP, '1'); close(); };
      card.appendChild(bSkip);
    }

    var links = el('div', 'eg-links');
    var a1 = el('a', '', L('🆕 नए हैं? Register करें', '🆕 New here? Register')); a1.href = 'register.html';
    var a2 = el('a', '', L('❓ Login में दिक्कत? Help', '❓ Trouble logging in? Help')); a2.href = 'help.html';
    var a3 = el('a', '', L('🔒 Privacy Policy', '🔒 Privacy Policy')); a3.href = 'privacy.html';
    links.appendChild(a1); links.appendChild(a2); links.appendChild(a3); card.appendChild(links);
    card.appendChild(el('div', 'eg-note', L('Code आपके Registration वाले Email / Mobile पर आएगा। यह Code किसी को न बताएँ — EkVeera का कोई भी व्यक्ति इसे नहीं माँगता।', 'The code goes to the email / mobile used at registration. Never share it — EkVeera staff never ask for it.')));

    document.body.appendChild(wrap);
    try { im.focus(); } catch (e) {}
  }
  function close() {
    var g = $('ekvGate'); if (g && g.parentNode) g.parentNode.removeChild(g);
    document.documentElement.classList.remove('ekv-gating');
    var h = $('ekvGateHide'); if (h && h.parentNode) h.parentNode.removeChild(h);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
