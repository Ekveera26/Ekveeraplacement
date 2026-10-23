/* EkVeera — Website Control (सबके लिए): Admin ने कोई फ़ॉर्म बंद किया हो या "वेबसाइट पर काम चल रहा है" चालू किया हो तो वही दिखाना।
   Server: EkVeera_Controls.gs (action=getcontrols). Admin इसे Placement → Admin Panel → "🔧 Website Control" से बदलता है।
   • Maintenance चालू: पूरी स्क्रीन पर संदेश (सिर्फ़ ?admin=1 वाला Admin पेज खुला रहता है)
   • फ़ॉर्म बंद: उस फ़ॉर्म की जगह साफ़ संदेश (Server भी नई Entry रोकता है, इसलिए यह सिर्फ़ सही दिखावट है)
   • Server न मिले / इंटरनेट बंद हो तो चुपचाप कुछ नहीं करता — वेबसाइट पहले जैसी चलती है। */
(function () {
  'use strict';
  var T = function (s) { return typeof __t === 'function' ? __t(s) : s; };
  var isAdmin = /[?&]admin=1/.test(location.search);
  var C = null, timer = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function url() { try { return typeof SEARCH_WEB_APP_URL !== 'undefined' ? SEARCH_WEB_APP_URL : ''; } catch (e) { return ''; } }
  function fetchControls() {
    var u = url(); if (!u) return Promise.resolve(null);
    return fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ action: 'getcontrols' }) })
      .then(function (r) { return r.json(); }).then(function (d) { return d && d.status === 'ok' ? d : null; }).catch(function () { return null; });
  }
  function msgFor(entry, def) { return (entry && entry.msg) ? entry.msg : T(def); }

  /* ---------- 🛠️ पूरी स्क्रीन का संदेश ---------- */
  function maintenance(on, text) {
    var el = document.getElementById('ekvMaint');
    if (!on || isAdmin) { if (el) el.remove(); document.documentElement.style.overflow = ''; return; }
    if (!el) {
      el = document.createElement('div'); el.id = 'ekvMaint'; el.setAttribute('role', 'alertdialog'); el.setAttribute('aria-modal', 'true');
      el.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(11,31,58,.96);display:flex;align-items:center;justify-content:center;padding:20px;text-align:center;color:#fff;font-family:inherit';
      document.body.appendChild(el);
    }
    el.innerHTML = '<div style="max-width:480px;background:#fff;color:#0B1F3A;border-radius:18px;padding:28px 22px;box-shadow:0 20px 60px rgba(0,0,0,.4)">' +
      '<div style="font-size:46px;line-height:1">🛠️</div><h2 style="margin:10px 0 8px;font-size:21px">' + esc(T('वेबसाइट पर काम चल रहा है')) + '</h2>' +
      '<p style="margin:0 0 16px;line-height:1.65;font-size:15.5px">' + esc(text) + '</p>' +
      '<a href="https://wa.me/919766284669" target="_blank" rel="noopener" style="display:inline-block;background:#1b7f3b;color:#fff;font-weight:800;text-decoration:none;padding:11px 18px;border-radius:10px">💬 ' + esc(T('WhatsApp पर संपर्क करें')) + '</a>' +
      '<div style="margin-top:12px;font-size:12.5px;color:#596579">' + esc(T('EkVeera Placement & Services')) + '</div></div>';
    document.documentElement.style.overflow = 'hidden';
  }

  /* ---------- 🔒 बंद फ़ॉर्म का संदेश ---------- */
  function notice(text) {
    return '<div class="ekv-closed-note" style="margin:10px 0;padding:14px 16px;border-radius:12px;background:#fff6e5;border:1.5px solid #f0c36d;color:#7a4b00;font-weight:700;line-height:1.6">🔒 ' + esc(text.replace(/^🔒\s*/, '')) + '</div>';
  }
  function lockSection(sel, text) {
    var sec = document.querySelector(sel); if (!sec) return;
    var n = sec.previousElementSibling;
    if (!(n && n.classList && n.classList.contains('ekv-closed-wrap'))) {
      n = document.createElement('div'); n.className = 'ekv-closed-wrap'; sec.parentNode.insertBefore(n, sec);
    }
    n.innerHTML = notice(text);
    sec.setAttribute('inert', ''); sec.style.opacity = '.35'; sec.style.pointerEvents = 'none';
  }
  function unlockSection(sel) {
    var sec = document.querySelector(sel); if (!sec) return;
    var n = sec.previousElementSibling; if (n && n.classList && n.classList.contains('ekv-closed-wrap')) n.remove();
    sec.removeAttribute('inert'); sec.style.opacity = ''; sec.style.pointerEvents = '';
  }

  var PAGE_FORM = [['#giver', 'rent'], ['#teacher', 'tution'], ['#karigar', 'home']];   // पेज के हिस्से -> फ़ॉर्म की चाबी
  function apply() {
    if (!C) return;
    maintenance(!!(C.maint && C.maint.on), msgFor(C.maint, (C.defaults && C.defaults.maint) || 'वेबसाइट पर अभी सुधार (Maintenance) का काम चल रहा है। कृपया थोड़ी देर बाद फिर आएँ।'));
    var defF = (C.defaults && C.defaults.form) || 'यह फ़ॉर्म अभी कुछ समय के लिए बंद है। कृपया थोड़ी देर बाद फिर कोशिश करें।';
    PAGE_FORM.forEach(function (pf) { var f = C.forms && C.forms[pf[1]]; if (f && !f.on && !isAdmin) lockSection(pf[0], msgFor(f, defF)); else unlockSection(pf[0]); });
    window.__ekvClosed = function (key) { var f = C.forms && C.forms[key]; return (f && !f.on && !isAdmin) ? msgFor(f, defF) : ''; };
    if (typeof window.__ekvCtlHook === 'function') window.__ekvCtlHook(C);
  }

  /* Placement / Training पेज के 3 फ़ॉर्म (Admission, Resume, Company): फ़ॉर्म खोलने वाले function को लपेटना */
  function wrapRegOpen() {
    if (typeof window.regOpen !== 'function' || window.regOpen.__ekv) return;
    var orig = window.regOpen;
    window.regOpen = function (name, edit) {
      var m = window.__ekvClosed ? window.__ekvClosed(name) : '';
      if (m && !edit) { var host = document.getElementById('regHost'); if (host) { host.innerHTML = notice(m); try { host.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} } return; }
      return orig.apply(this, arguments);
    };
    window.regOpen.__ekv = 1;
  }

  function run() {
    fetchControls().then(function (d) { if (d) { C = d; apply(); } wrapRegOpen(); });
  }
  function start() {
    run(); wrapRegOpen(); setTimeout(wrapRegOpen, 1500);
    timer = setInterval(function () { if (!document.hidden) run(); }, 90000);          // हर 90 सेकंड में नई सेटिंग देखना
    document.addEventListener('visibilitychange', function () { if (!document.hidden) run(); });
  }
  window.ekvControlsRefresh = run;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
