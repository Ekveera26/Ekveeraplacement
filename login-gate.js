/* EkVeera — 🔐 App Login Gate (v23: User ID / Mobile + PASSWORD)
   ------------------------------------------------------------------------------------------------
   KYA KARTA HAI
     Install kiye hue App me pehle Login screen aati hai. Jab tak Register + Login nahi, App nahi khulta.
       • Login:   User ID (REG001...) ya Mobile  +  Password.      (OTP Login nahi)
       • Naya:    "नया Account बनाएँ" → register.html (Naam + Mobile + Password).  Register hote hi Login ho jaata hai.
       • Bhool:   "Password भूल गए / Mobile गुम" → Request → Admin ki manzoori → Code → naya Password.   (OTP sirf yahin, wo bhi Admin ke "Approve" ke baad)
       • Login ke baad har page par  👤 Naam · Reg ID  wala button  →  "Mera Account": Naam, Reg ID, Password badalna, Logout.

   KAB CHALTA HAI
     • Sirf Install kiye hue App me (display-mode: standalone / Play Store TWA / iPhone Home-Screen).
     • Normal Browser (Google se website kholne wale) par KABHI nahi — website sabke liye khuli rehti hai (Google ko dikhne ke liye zaroori).
     • Test ke liye Browser me:  index.html?gate=1   (band karne ke liye ?gate=0)

   MODE  (neeche MODE badlein, ya kisi page par is file se pehle  window.EKV_GATE_MODE = 'soft'  likhein)
     'hard' = bina Login ke App nahi khulta (sirf Register / Help / Privacy / Account-Delete page khule rehte hain — Play Store ka niyam).
     'soft' = Login screen aati hai, par "Bina Login ke dekhein" ka button bhi hai.
     'off'  = Gate band.

   SURAKSHA
     • Password ki jaanch Server (EkVeera_Auth.gs) karta hai — yahan sirf screen hai. Token Device se bandha hai, 60 din chalta hai.
     • Password badalne / Reset hone par purane sab Phone ka Login band ho jaata hai.
     • 'ekv_acct' / 'ekv_dev' Storage wahi hai jo push.js (🔔 Inbox) use karta hai.
*/
(function () {
  'use strict';

  var MODE = (window.EKV_GATE_MODE || 'hard');           // 'hard' | 'soft' | 'off'
  var AKEY = 'ekv_acct', DKEY = 'ekv_dev', SKIP = 'ekv_gate_skip', FKEY = 'ekv_fg_req';

  /* Ye pages bina Login ke hamesha khule rehne chahiye (naya user Register kare; Play Store ke liye Privacy + Account-Delete; Help/Enquiry; Staff apna alag Login) */
  var OPEN_PAGES = /(^|\/)(register|privacy|delete-data|help|staff-profile)\.html$/i;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  function lang() { var l = lsGet('ekveera_lang'); return l === 'en' ? 'en' : 'hi'; }
  function L(hi, en) { return lang() === 'en' ? en : hi; }
  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
  function $(id) { return document.getElementById(id); }
  function digits10(s) { return String(s || '').replace(/\D/g, '').slice(-10); }

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
  function acct() { try { return JSON.parse(lsGet(AKEY) || '{}') || {}; } catch (e) { return {}; } }
  function loggedIn() {
    try {
      var a = acct();
      if (!a.token || !a.mobile) return false;
      var parts = String(a.token).split('.');
      if (parts.length !== 5 || parts[0] !== String(a.mobile)) return false;
      return parseInt(parts[2], 10) > Date.now();
    } catch (e) { return false; }
  }
  function saveAcct(r) {
    var o = { mobile: r.mobile, token: r.token, level: r.level || 'pw', name: r.name || '', regId: r.regId || '' };
    lsSet(AKEY, JSON.stringify(o)); return o;
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
  function post(params) {
    if (typeof vcSecurePost === 'function') return vcSecurePost(params);
    return Promise.reject(new Error('no api'));
  }
  function netErr() { return L('Internet चेक करके दोबारा कोशिश करें।', 'Check your internet and try again.'); }
  function odd() { return L('कुछ गड़बड़ हुई — दोबारा कोशिश करें।', 'Something went wrong — try again.'); }

  /* ---- ye sab bahar se jaanchne ke liye (tests) aur register.js ke liye ---- */
  window.__ekvGate = { isInstalledApp: isInstalledApp, loggedIn: loggedIn, openPages: OPEN_PAGES, mode: function () { return MODE; } };
  window.__ekvAuth = { saveAcct: saveAcct, devId: devId, loggedIn: loggedIn, acct: acct, pwField: pwField };

  /* ---- Password box + "👁 dikhao" button ---- */
  function pwField(parent, id, labelHi, labelEn, auto) {
    parent.appendChild(el('label', '', L(labelHi, labelEn)));
    var box = el('div'); box.style.cssText = 'position:relative';
    var inp = el('input'); inp.id = id; inp.type = 'password'; inp.autocomplete = auto || 'current-password'; inp.maxLength = 40; inp.style.paddingRight = '48px';
    var eye = el('button', '', '👁'); eye.type = 'button'; eye.setAttribute('aria-label', L('Password दिखाएँ / छुपाएँ', 'Show / hide password'));
    eye.style.cssText = 'position:absolute;right:4px;top:50%;transform:translateY(-50%);border:0;background:none;font-size:20px;padding:8px 10px;cursor:pointer;line-height:1';
    eye.onclick = function () { inp.type = inp.type === 'password' ? 'text' : 'password'; };
    box.appendChild(inp); box.appendChild(eye); parent.appendChild(box);
    return inp;
  }

  /* ---- v22b: 🚪 Logout बटन + v23: 👤 Naam · Reg ID (Mera Account) — Login होते ही हर पेज पर साफ़ दिखते हैं ---- */
  function doLogout(btn) {
    if (btn) { btn.textContent = L('⏳ ...', '⏳ ...'); btn.style.pointerEvents = 'none'; }
    var a = acct();
    var ps = {}; try { ps = JSON.parse(lsGet('ekv_push_v1') || '{}') || {}; } catch (e) {}
    function wipe() {
      try { localStorage.removeItem(AKEY); localStorage.removeItem('ekv_inbox_seen'); localStorage.removeItem('ekv_push_v1'); } catch (e) {}
      try { sessionStorage.removeItem(SKIP); } catch (e) {}
      location.replace((location.pathname || 'index.html') + (/[?&]gate=1\b/.test(location.search || '') ? '?gate=1' : ''));
    }
    var jobs = [];
    try {
      if (typeof vcSecurePost === 'function') {
        jobs.push(vcSecurePost({ action: 'aclogout', mobile: a.mobile || '', token: a.token || '', deviceId: devId() }));
        if (ps.token) jobs.push(vcSecurePost({ action: 'pushoff', token: ps.token }));
      }
    } catch (e) {}
    var done = false; function fin() { if (!done) { done = true; wipe(); } }
    Promise.all(jobs.map(function (j) { return Promise.resolve(j).catch(function () {}); })).then(fin, fin);
    setTimeout(fin, 3500);                                  // Internet न भी हो तो भी इस फ़ोन से Logout हो जाए
  }
  function addAccountUi() {
    if (isAdminOrStaff() || $('ekvAcctBtn') || !loggedIn()) return;
    var css = document.createElement('style');
    css.textContent =
      '#ekvAcctBar{display:flex;justify-content:center;padding:8px 12px;background:#0B1F3A}' +
      '.page-heading #ekvAcctBar{background:none;padding:12px 0 0;position:relative;z-index:2}' +
      '#ekvAcctBtn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:1.5px solid rgba(255,255,255,.55);border-radius:22px;background:rgba(255,255,255,.12);color:#fff;font:600 14px/1 inherit;font-family:inherit;cursor:pointer;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      'footer .foot-links a#ekvLogoutBtn{color:#ffb4b4;cursor:pointer}' +
      '#ekvAcctWrap{position:fixed;inset:0;z-index:2147482000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto}' +
      '#ekvAcctWrap .ea-card{width:100%;max-width:400px;background:#fff;color:#1b2430;border-radius:18px;padding:20px 18px;box-shadow:0 18px 50px rgba(0,0,0,.4);margin:auto}' +
      '#ekvAcctWrap h2{margin:0 0 10px;font-size:19px;color:#0B1F3A;text-align:center}#ekvAcctWrap .ea-row{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid #eef1f5;font-size:14.5px}' +
      '#ekvAcctWrap .ea-row b{color:#0B1F3A}#ekvAcctWrap .ea-id{font-size:18px;letter-spacing:1px;color:#0C6F69}' +
      '#ekvAcctWrap label{display:block;font-size:13px;font-weight:700;margin:10px 0 5px;color:#0B1F3A}' +
      '#ekvAcctWrap input{width:100%;box-sizing:border-box;padding:12px;border:1.5px solid #cfd6e0;border-radius:10px;font-size:16px;font-family:inherit}' +
      '#ekvAcctWrap .ea-btn{width:100%;margin-top:12px;padding:12px;border:0;border-radius:10px;background:#1F9D95;color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit}#ekvAcctWrap .ea-btn.alt{background:#fff;color:#0B1F3A;border:1.5px solid #0B1F3A}#ekvAcctWrap .ea-btn.red{background:#fff;color:#b91c1c;border:1.5px solid #b91c1c}#ekvAcctWrap .ea-btn:disabled{opacity:.6}' +
      '#ekvAcctWrap .ea-msg{min-height:18px;margin-top:8px;font-size:13.5px;text-align:center;line-height:1.45}#ekvAcctWrap .ea-msg.err{color:#b91c1c}#ekvAcctWrap .ea-msg.ok{color:#15803d}';
    document.head.appendChild(css);

    /* 👤 Naam · REG-ID — Page ke Header (neeli patti) ke andar, kisi cheez ke upar tairta nahi */
    var ab = el('button', '', ''); ab.id = 'ekvAcctBtn'; ab.type = 'button'; ab.setAttribute('aria-label', L('मेरा Account', 'My account'));
    function paintChip() {
      var a = acct(), first = String(a.name || '').trim().split(/\s+/)[0] || '';
      ab.textContent = '👤 ' + ((first || a.regId) ? (first + (first && a.regId ? ' · ' : '') + (a.regId || '')) : L('मेरा Account', 'My account'));
    }
    paintChip(); ab.onclick = openAccount;
    var bar = el('div'); bar.id = 'ekvAcctBar'; bar.appendChild(ab);
    var ph = document.querySelector('.page-heading');
    if (ph) ph.appendChild(bar);
    else { var hd = document.querySelector('header'); if (hd && hd.parentNode) hd.parentNode.insertBefore(bar, hd.nextSibling); else document.body.insertBefore(bar, document.body.firstChild); }

    /* 🚪 Logout — Footer me "Staff Profile" ke theek neeche (saare Pages par) */
    var b = el('a', '', L('🚪 Logout', '🚪 Logout')); b.id = 'ekvLogoutBtn'; b.href = '#'; b.setAttribute('role', 'button');
    b.onclick = function (ev) { ev.preventDefault(); if (window.confirm(L('क्या आप Logout करना चाहते हैं?', 'Do you want to log out?'))) doLogout(b); };
    var cols = document.querySelectorAll('footer .foot-links'), col = cols.length ? cols[cols.length - 1] : null;
    if (col) { var sp = col.querySelector('a[href="staff-profile.html"]'); if (sp && sp.nextSibling) col.insertBefore(b, sp.nextSibling); else col.appendChild(b); }
    else { var ft = document.querySelector('footer'); (ft || document.body).appendChild(b); }

    /* Purane Login (Naam/Reg ID Storage me nahi): Server se Naam + Reg ID le aao */
    var a0 = acct();
    if ((!a0.regId || !a0.name) && a0.token) {
      post({ action: 'acme', mobile: a0.mobile, token: a0.token, deviceId: devId() }).then(function (r) {
        if (r && r.status === 'ok' && (r.regId || r.name)) { var a1 = acct(); a1.name = r.name || a1.name || ''; a1.regId = r.regId || a1.regId || ''; lsSet(AKEY, JSON.stringify(a1)); paintChip(); }
      }).catch(function () {});
    }
  }
  function openAccount() {
    if ($('ekvAcctWrap')) return;
    var a = acct(), wrap = el('div'); wrap.id = 'ekvAcctWrap'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
    wrap.onclick = function (e) { if (e.target === wrap) wrap.parentNode.removeChild(wrap); };
    var card = el('div', 'ea-card'); wrap.appendChild(card);
    card.appendChild(el('h2', '', L('👤 मेरा Account', '👤 My account')));
    function row(k, v, cls) { var r = el('div', 'ea-row'); r.appendChild(el('span', '', k)); var b = el('b', cls || '', v); r.appendChild(b); card.appendChild(r); }
    row(L('नाम', 'Name'), a.name || '—');
    row(L('User ID (Register ID)', 'User ID (Register ID)'), a.regId || '—', 'ea-id');
    row(L('Mobile', 'Mobile'), '+91 ' + (a.mobile || ''));

    card.appendChild(el('h2', '', '')).style.marginTop = '14px';
    card.lastChild.textContent = L('🔁 Password बदलें', '🔁 Change password');
    var po, pn, pn2;
    if (a.level === 'pw') {
      po = pwField(card, 'eaOld', 'पुराना Password', 'Current password', 'current-password');
      pn = pwField(card, 'eaNew', 'नया Password (कम से कम 6 अक्षर)', 'New password (at least 6 characters)', 'new-password');
      pn2 = pwField(card, 'eaNew2', 'नया Password दोबारा', 'New password again', 'new-password');
      var bc = el('button', 'ea-btn', L('✅ Password बदलें', '✅ Change password')); bc.type = 'button'; card.appendChild(bc);
      var msg = el('div', 'ea-msg'); msg.setAttribute('aria-live', 'polite'); card.appendChild(msg);
      var say = function (t, c) { msg.textContent = t; msg.className = 'ea-msg ' + (c || ''); };
      bc.onclick = function () {
        if (!po.value || !pn.value) return say(L('पुराना और नया Password लिखें।', 'Enter the current and the new password.'), 'err');
        if (pn.value !== pn2.value) return say(L('दोनों नए Password एक जैसे नहीं हैं।', 'The two new passwords do not match.'), 'err');
        bc.disabled = true; say(L('⏳ बदला जा रहा है...', '⏳ Changing...'), '');
        post({ action: 'acchpw', mobile: a.mobile, token: a.token, deviceId: devId(), oldPassword: po.value, newPassword: pn.value, newPassword2: pn2.value }).then(function (r) {
          if (r && r.status === 'ok') {
            var cur = acct(); cur.token = r.token; cur.level = 'pw'; lsSet(AKEY, JSON.stringify(cur));
            po.value = pn.value = pn2.value = ''; say(L('✅ Password बदल गया। बाकी Phone पर Login बंद हो गया।', '✅ Password changed. Other phones were logged out.'), 'ok');
          } else if (r && r.code === 'RELOGIN') { say(L('कृपया दोबारा Login करें।', 'Please log in again.'), 'err'); }
          else say((r && r.message) || odd(), 'err');
        }).catch(function () { say(netErr(), 'err'); }).then(function () { bc.disabled = false; });
      };
    } else {
      card.appendChild(el('p', '', L('आप पुराने (OTP) Login से हैं। Password बनाने के लिए Logout करके नया Account बनाएँ / "Password भूल गए" चुनें।', 'You are on the old (OTP) login. To set a password log out and register / choose "Forgot password".'))).style.cssText = 'font-size:13.5px;color:#596579';
    }
    var cl = el('button', 'ea-btn alt', L('बंद करें', 'Close')); cl.type = 'button'; cl.onclick = function () { wrap.parentNode.removeChild(wrap); }; card.appendChild(cl);
    var lo = el('button', 'ea-btn red', L('🚪 Logout', '🚪 Logout')); lo.type = 'button'; lo.onclick = function () { if (window.confirm(L('क्या आप Logout करना चाहते हैं?', 'Do you want to log out?'))) doLogout(lo); }; card.appendChild(lo);
    document.body.appendChild(wrap);
  }
  if (MODE !== 'off') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addAccountUi); else addAccountUi(); }
  window.__ekvLogout = function () { doLogout(null); };
  window.__ekvAuth.openAccount = openAccount;

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

  function build() {
    if ($('ekvGate')) return;
    var css = document.createElement('style');
    css.textContent =
      '#ekvGate{position:fixed;inset:0;z-index:2147483000;background:linear-gradient(160deg,#0B1F3A 0%,#12365f 60%,#1F9D95 140%);color:#fff;display:flex;padding:18px;font-family:inherit;overflow:auto}' +
      '#ekvGate .eg-card{width:100%;max-width:400px;margin:auto;background:#fff;color:#1b2430;border-radius:18px;padding:24px 20px 18px;box-shadow:0 18px 50px rgba(0,0,0,.35)}' +
      '#ekvGate .eg-logo{display:block;width:76px;height:76px;margin:0 auto 10px;border-radius:16px;object-fit:contain}' +
      '#ekvGate h1{font-size:20px;margin:0 0 4px;text-align:center;color:#0B1F3A}' +
      '#ekvGate .eg-sub{font-size:13.5px;text-align:center;color:#596579;margin:0 0 14px;line-height:1.5}' +
      '#ekvGate label{display:block;font-size:13px;font-weight:700;margin:10px 0 5px;color:#0B1F3A}' +
      '#ekvGate input[type=text],#ekvGate input[type=tel],#ekvGate input[type=password]{width:100%;box-sizing:border-box;padding:13px 12px;border:1.5px solid #cfd6e0;border-radius:10px;font-size:17px;font-family:inherit}' +
      '#ekvGate input:focus,#ekvGate textarea:focus{outline:0;border-color:#1F9D95}' +
      '#ekvGate .eg-rad{display:flex;flex-direction:column;gap:6px;margin-top:6px;font-size:14px}#ekvGate .eg-rad label{display:flex;gap:8px;align-items:center;font-weight:500;margin:0}' +
      '#ekvGate .eg-btn{width:100%;margin-top:12px;padding:13px;border:0;border-radius:10px;background:#1F9D95;color:#fff;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit}' +
      '#ekvGate .eg-btn.alt{background:#fff;color:#0B1F3A;border:1.5px solid #0B1F3A}#ekvGate .eg-btn:disabled{opacity:.6}' +
      '#ekvGate .eg-msg{min-height:20px;margin-top:10px;font-size:13.5px;line-height:1.45;text-align:center}' +
      '#ekvGate .eg-msg.err{color:#b91c1c}#ekvGate .eg-msg.ok{color:#15803d}' +
      '#ekvGate .eg-links{display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;margin-top:14px;font-size:13px}' +
      '#ekvGate .eg-links a,#ekvGate .eg-links button{color:#0B5CAD;text-decoration:underline;background:none;border:0;padding:0;font:inherit;cursor:pointer}' +
      '#ekvGate .eg-new{display:block;text-align:center;margin-top:14px;padding:12px;border:1.5px solid #1F9D95;border-radius:10px;color:#0C6F69;font-weight:700;text-decoration:none;font-size:15px}' +
      '#ekvGate .eg-box{background:#f2f8f7;border:1px solid #cfe5e2;border-radius:10px;padding:10px 12px;font-size:13.5px;line-height:1.5;margin:8px 0}' +
      '#ekvGate .eg-note{font-size:11.5px;color:#7a8696;text-align:center;margin-top:12px;line-height:1.5}';
    document.head.appendChild(css);

    var wrap = el('div'); wrap.id = 'ekvGate'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
    var card = el('div', 'eg-card'); wrap.appendChild(card);
    document.body.appendChild(wrap);

    function head(h, sub) {
      card.textContent = '';
      var logo = el('img', 'eg-logo'); logo.src = 'logo.png'; logo.alt = 'EkVeera'; logo.onerror = function () { logo.style.display = 'none'; }; card.appendChild(logo);
      card.appendChild(el('h1', '', h)); card.appendChild(el('p', 'eg-sub', sub));
    }
    function msgBox() { var m = el('div', 'eg-msg'); m.setAttribute('aria-live', 'polite'); card.appendChild(m); return function (t, cls) { m.textContent = t; m.className = 'eg-msg ' + (cls || ''); }; }
    function footLinks(withBack) {
      var links = el('div', 'eg-links');
      if (withBack) { var bk = el('button', '', L('← Login पर वापस', '← Back to login')); bk.type = 'button'; bk.onclick = showLogin; links.appendChild(bk); }
      var a2 = el('a', '', L('❓ Help', '❓ Help')); a2.href = 'help.html';
      var a3 = el('a', '', L('🔒 Privacy Policy', '🔒 Privacy Policy')); a3.href = 'privacy.html';
      links.appendChild(a2); links.appendChild(a3); card.appendChild(links);
    }
    function finishLogin(r, say) {
      saveAcct(r); say(L('✅ Login हो गया', '✅ Logged in'), 'ok');
      setTimeout(function () { location.reload(); }, 400);       // push.js अपना Inbox / 🔔 नए Login के साथ उठा ले
    }

    /* ================= 🔓 Login ================= */
    function showLogin() {
      head(L('EkVeera में Login करें', 'Login to EkVeera'), L('अपनी User ID (REG…) या Mobile Number और Password से Login करें।', 'Log in with your User ID (REG…) or mobile number and your password.'));
      card.appendChild(el('label', '', L('User ID या Mobile', 'User ID or mobile')));
      var iu = el('input'); iu.id = 'egUser'; iu.type = 'text'; iu.autocomplete = 'username'; iu.setAttribute('autocapitalize', 'characters'); iu.maxLength = 20; iu.placeholder = L('जैसे REG012 या 9876543210', 'e.g. REG012 or 9876543210'); card.appendChild(iu);
      var ip = pwField(card, 'egPass', 'Password', 'Password', 'current-password');
      var bGo = el('button', 'eg-btn', L('🔓 Login', '🔓 Login')); bGo.id = 'egLogin'; bGo.type = 'button'; card.appendChild(bGo);
      var say = msgBox();
      bGo.onclick = function () {
        var u = iu.value.trim(), p = ip.value;
        if (!u || !p) return say(L('User ID (या Mobile) और Password दोनों लिखें।', 'Enter both the User ID (or mobile) and the password.'), 'err');
        bGo.disabled = true; say(L('⏳ जाँच हो रही है...', '⏳ Checking...'), '');
        post({ action: 'aclogin', userid: u, password: p, deviceId: devId() }).then(function (r) {
          if (r && r.status === 'ok') finishLogin(r, say);
          else { say((r && r.message) || odd(), 'err'); bGo.disabled = false; if (r && r.code === 'NOPASS') { var f = el('button', 'eg-btn alt', L('🆘 Password बनाने के लिए Request भेजें', '🆘 Request a password')); f.type = 'button'; f.onclick = function () { showForgot(u); }; card.insertBefore(f, card.querySelector('.eg-links')); } }
        }).catch(function () { say(netErr(), 'err'); bGo.disabled = false; });
      };
      iu.addEventListener('keydown', function (e) { if (e.key === 'Enter') ip.focus(); });
      ip.addEventListener('keydown', function (e) { if (e.key === 'Enter') bGo.onclick(); });

      var nw = el('a', 'eg-new', L('🆕 नए हैं? नया Account बनाएँ (Register)', '🆕 New here? Create account (Register)')); nw.href = 'register.html'; card.appendChild(nw);
      if (MODE === 'soft') {
        var bSkip = el('button', 'eg-btn alt', L('अभी बिना Login के देखें', 'Continue without login')); bSkip.type = 'button';
        bSkip.onclick = function () { ssSet(SKIP, '1'); close(); };
        card.appendChild(bSkip);
      }
      var links = el('div', 'eg-links');
      var fg = el('button', '', L('🆘 Password भूल गए / Mobile गुम', '🆘 Forgot password / lost mobile')); fg.type = 'button'; fg.id = 'egForgot'; fg.onclick = function () { showForgot(iu.value.trim()); }; links.appendChild(fg);
      var a2 = el('a', '', L('❓ Help', '❓ Help')); a2.href = 'help.html';
      var a3 = el('a', '', L('🔒 Privacy Policy', '🔒 Privacy Policy')); a3.href = 'privacy.html';
      links.appendChild(a2); links.appendChild(a3); card.appendChild(links);
      card.appendChild(el('div', 'eg-note', L('Login के लिए OTP नहीं चाहिए। अपना Password किसी को न बताएँ — EkVeera का कोई भी कर्मचारी इसे नहीं माँगता।', 'No OTP is needed to log in. Never share your password — no EkVeera staff will ask for it.')));
      try { iu.focus(); } catch (e) {}
    }

    /* ================= 🆘 Password bhool gaye / Mobile gum — Admin ki manzoori ================= */
    function savedReq() { try { return JSON.parse(lsGet(FKEY) || 'null'); } catch (e) { return null; } }
    function showForgot(prefill) {
      var rq = savedReq();
      if (rq && rq.reqId && rq.mobile) return showReqStatus(rq);
      head(L('🆘 Password भूल गए / Mobile गुम', '🆘 Forgot password / lost mobile'), L('Admin पहचान जाँचकर मंज़ूरी देंगे, तभी Code मिलेगा और आप नया Password रख पाएँगे।', 'The admin will verify you and approve — only then you get a code to set a new password.'));
      card.appendChild(el('label', '', L('User ID या Mobile', 'User ID or mobile')));
      var iu = el('input'); iu.id = 'egFgUser'; iu.type = 'text'; iu.maxLength = 20; iu.value = prefill || ''; iu.placeholder = L('जैसे REG012 या 9876543210', 'e.g. REG012 or 9876543210'); card.appendChild(iu);
      var rad = el('div', 'eg-rad'), r1 = el('label'), r2 = el('label');
      var i1 = el('input'); i1.type = 'radio'; i1.name = 'egWhy'; i1.value = 'password'; i1.checked = true; r1.appendChild(i1); r1.appendChild(document.createTextNode(L('Password भूल गया', 'I forgot my password')));
      var i2 = el('input'); i2.type = 'radio'; i2.name = 'egWhy'; i2.value = 'mobile'; r2.appendChild(i2); r2.appendChild(document.createTextNode(L('Mobile गुम हुआ / बदल गया', 'My mobile was lost / changed')));
      rad.appendChild(r1); rad.appendChild(r2); card.appendChild(rad);
      card.appendChild(el('label', '', L('अपना पूरा नाम और गाँव/शहर (Admin पहचान के लिए)', 'Your full name and village/city (so the admin can verify you)')));
      var inote = el('input'); inote.id = 'egFgNote'; inote.type = 'text'; inote.maxLength = 80; card.appendChild(inote);
      var bs = el('button', 'eg-btn', L('📨 Admin को Request भेजें', '📨 Send request to admin')); bs.id = 'egFgSend'; bs.type = 'button'; card.appendChild(bs);
      var say = msgBox();
      bs.onclick = function () {
        var u = iu.value.trim(); if (!u) return say(L('अपना User ID (REG…) या Mobile लिखें।', 'Enter your User ID (REG…) or mobile.'), 'err');
        bs.disabled = true; say(L('⏳ भेजा जा रहा है...', '⏳ Sending...'), '');
        post({ action: 'acforgot', userid: u, reason: i2.checked ? 'mobile' : 'password', note: inote.value.trim() }).then(function (r) {
          if (r && r.status === 'ok' && r.reqId) { var o = { reqId: r.reqId, mobile: r.mobile }; lsSet(FKEY, JSON.stringify(o)); showReqStatus(o, r.message); }
          else { say((r && r.message) || odd(), 'err'); bs.disabled = false; }
        }).catch(function () { say(netErr(), 'err'); bs.disabled = false; });
      };
      footLinks(true);
    }
    function showReqStatus(rq, firstMsg) {
      head(L('⏳ Request: ', '⏳ Request: ') + rq.reqId, L('Admin की मंज़ूरी मिलने पर यहीं Code डालकर नया Password रखें। थोड़ी देर बाद "Status देखें" दबाएँ।', 'When the admin approves, enter the code here and set a new password. Tap "Check status" after a while.'));
      var box = el('div', 'eg-box'); box.id = 'egFgBox'; box.textContent = firstMsg || L('Request Admin के पास है।', 'Your request is with the admin.'); card.appendChild(box);
      var bc = el('button', 'eg-btn', L('🔄 Status देखें', '🔄 Check status')); bc.id = 'egFgCheck'; bc.type = 'button'; card.appendChild(bc);
      var codeBox = el('div'); codeBox.style.display = 'none'; card.appendChild(codeBox);
      codeBox.appendChild(el('label', '', L('6 अंक का Code', '6-digit code')));
      var ic = el('input'); ic.id = 'egFgCode'; ic.type = 'tel'; ic.inputMode = 'numeric'; ic.maxLength = 6; ic.autocomplete = 'one-time-code'; ic.placeholder = '• • • • • •'; codeBox.appendChild(ic);
      var pn = pwField(codeBox, 'egFgNew', 'नया Password (कम से कम 6 अक्षर)', 'New password (at least 6 characters)', 'new-password');
      var pn2 = pwField(codeBox, 'egFgNew2', 'नया Password दोबारा', 'New password again', 'new-password');
      var bd = el('button', 'eg-btn', L('✅ Password बदलें और Login करें', '✅ Set password and log in')); bd.id = 'egFgDo'; bd.type = 'button'; codeBox.appendChild(bd);
      var say = msgBox();
      function again() { lsDel(FKEY); showForgot(''); }
      bc.onclick = function () {
        bc.disabled = true; say(L('⏳ देख रहे हैं...', '⏳ Checking...'), '');
        post({ action: 'acforgotstatus', reqId: rq.reqId, mobile: rq.mobile }).then(function (r) {
          bc.disabled = false;
          if (!r || r.status !== 'ok') { if (r && r.code === 'NOREQ') { again(); return; } return say((r && r.message) || odd(), 'err'); }
          box.textContent = r.message || ''; say('', '');
          codeBox.style.display = r.state === 'approved' ? 'block' : 'none';
          if (r.state === 'approved') { try { ic.focus(); } catch (e) {} }
          if (r.state === 'rejected' || r.state === 'expired' || r.state === 'locked' || r.state === 'done') { lsDel(FKEY); }
        }).catch(function () { bc.disabled = false; say(netErr(), 'err'); });
      };
      bd.onclick = function () {
        var code = ic.value.replace(/\D/g, '');
        if (code.length !== 6) return say(L('6 अंक का Code लिखें।', 'Enter the 6-digit code.'), 'err');
        if (!pn.value) return say(L('नया Password लिखें।', 'Enter a new password.'), 'err');
        if (pn.value !== pn2.value) return say(L('दोनों Password एक जैसे नहीं हैं।', 'The two passwords do not match.'), 'err');
        bd.disabled = true; say(L('⏳ बदला जा रहा है...', '⏳ Changing...'), '');
        post({ action: 'acforgotdo', reqId: rq.reqId, mobile: rq.mobile, code: code, newPassword: pn.value, newPassword2: pn2.value, deviceId: devId() }).then(function (r) {
          if (r && r.status === 'ok') { lsDel(FKEY); finishLogin(r, say); }
          else { say((r && r.message) || odd(), 'err'); bd.disabled = false; }
        }).catch(function () { say(netErr(), 'err'); bd.disabled = false; });
      };
      var nr = el('button', 'eg-btn alt', L('नई Request भेजें', 'Send a new request')); nr.type = 'button'; nr.onclick = again; card.appendChild(nr);
      footLinks(true);
    }

    showLogin();
  }
  function close() {
    var g = $('ekvGate'); if (g && g.parentNode) g.parentNode.removeChild(g);
    document.documentElement.classList.remove('ekv-gating');
    var h = $('ekvGateHide'); if (h && h.parentNode) h.parentNode.removeChild(h);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
