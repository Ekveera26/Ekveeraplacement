/* EkVeera — Staff Referral (Staff ka link) ko App me pakka rakhna
   -----------------------------------------------------------------------
   Maan lijiye: Candidate ne Anak-01 ke link se App Install kiya.
   • Install ke baad wo Browser me Pankaj-01 ka link kholta hai  -> Browser me Pankaj-01 hi dikhega/lagega.
   • Lekin Installed App kholne par teeno Form (Admission / Resume / Company) me Staff hamesha Anak-01 hi jayega.
   Kaise:
   1) Install ke samay ka Staff alag Key ("ekveera_staff_locked") me pakka (lock) ho jata hai.
   2) Install ke samay App ka "start_url" me Staff ka naam jod diya jata hai (taaki jin phones me App ki Storage
      alag hoti hai, wahan bhi App apne Staff ko pehchane).
   3) Installed App me URL ka ?staff=... kabhi Staff nahi badalta. */
(function () {
  'use strict';
  var KR = 'ekveera_staff_ref', KL = 'ekveera_staff_locked', KA = 'ekveera_staff_ref_at', OK = /^[A-Za-z0-9 _.\-]{1,40}$/;
  function gs(k) { try { return (localStorage.getItem(k) || '').trim(); } catch (e) { return ''; } }
  function ss(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function standalone() {
    try { return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true; }
    catch (e) { return false; }
  }
  var q = '';
  try { q = (new URLSearchParams(location.search).get('staff') || '').trim(); } catch (e) {}
  if (q && !OK.test(q)) q = '';
  var inApp = standalone();

  if (inApp) {
    if (!gs(KL)) { var first = q || gs(KR); if (first && OK.test(first)) ss(KL, first); }   // App ka pehla Staff pakka
  } else if (q) {
    // 🔒 v31: PEHLA Staff pakka (first link wins). Doosre Staff ka Link kholne par Form / Commission NAHI badalta.
    //         Sirf tab badlega jab purana Staff 30 din se purana ho (tab tak Candidate ne kisi aur ka Link shayad bhula diya).
    var cur = gs(KR), at = parseInt(gs(KA), 10) || 0, same = cur && cur.toLowerCase().replace(/[^a-z0-9]/g, '') === q.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cur || !OK.test(cur) || (!same && at && Date.now() - at > 30 * 86400000)) { ss(KR, q); ss(KA, String(Date.now())); }
    else if (!at) ss(KA, String(Date.now()));
  }

  window.ekvIsApp = inApp;
  window.ekvStaffRef = function () {
    var v = inApp ? (gs(KL) || gs(KR)) : gs(KR);
    return OK.test(v) ? v : '';
  };

  if (!inApp) {
    // Install hote hi us samay ka Staff pakka
    window.addEventListener('appinstalled', function () { var r = gs(KR); if (r && OK.test(r)) ss(KL, r); });

    // Install se pehle manifest me start_url ke saath Staff jodna
    var r0 = gs(KR);
    if (r0 && OK.test(r0) && window.fetch && window.Blob && window.URL && URL.createObjectURL) {
      fetch('manifest.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (m) {
        var base = location.href.split('#')[0].split('?')[0].replace(/[^\/]*$/, '');
        m.start_url = base + 'index.html?staff=' + encodeURIComponent(r0) + '&app=1';
        m.scope = base; m.id = base;
        (m.icons || []).forEach(function (i) { try { i.src = new URL(i.src, base).href; } catch (e) {} });
        var b = new Blob([JSON.stringify(m)], { type: 'application/manifest+json' });
        var l = document.querySelector('link[rel="manifest"]');
        if (!l) { l = document.createElement('link'); l.rel = 'manifest'; document.head.appendChild(l); }
        l.href = URL.createObjectURL(b);
      }).catch(function () {});
    }
  }

  /* Home page par dikhao: kiske Staff Code ke Link se aaye (isi Code se Form / Payment ka Commission banta hai) */
  /* Neeli patti (sirf Home page): left me "Staff : Anak-01", right me "👤 Naam · REG-ID" (login-gate.js bharta hai) — ek hi line me */
  function homeStrip() {
    var st = document.getElementById('ekvHomeStrip'); if (st) return st;
    st = document.createElement('div'); st.id = 'ekvHomeStrip';
    st.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;background:#0B1F3A;color:#fff;padding:8px 14px;font-size:13.5px;font-weight:700;border-bottom:1px solid rgba(255,255,255,.15);';
    var l = document.createElement('span'); l.id = 'ekvStripL'; l.style.cssText = 'min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
    var r = document.createElement('span'); r.id = 'ekvStripR'; r.style.cssText = 'margin-left:auto;min-width:0;display:flex;justify-content:flex-end';
    st.appendChild(l); st.appendChild(r);
    var h = document.querySelector('header'); if (h && h.parentNode) h.parentNode.insertBefore(st, h.nextSibling); else document.body.insertBefore(st, document.body.firstChild);
    return st;
  }
  window.ekvHomeStrip = homeStrip;
  function showBadge() {
    try {
      if (!/(^|\/)(index\.html)?$/.test(location.pathname)) return;
      var c = window.ekvStaffRef(); if (!c) return;
      homeStrip(); var l = document.getElementById('ekvStripL'); if (l && !l.textContent) l.textContent = '🔗 Staff : ' + c;
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBadge); else showBadge();

  /* 👁️ v41 — Link Visit Counter: Staff ke Link (?staff= / ?src=) ka khulna Server ko chupchap batana.
     Naam / Mobile / IP kuch nahi jaata — sirf Staff Code, Page, Src aur ek random Device-ID. Kabhi koi kaam nahi rokta. */
  function trackVisit() {
    try {
      var path = location.pathname || '', page = (path.split('/').pop() || 'index').replace(/\.html$/i, '') || 'index';
      if (/^(staff-profile|test-mode)$/.test(page)) return;
      if (inApp || navigator.webdriver || /bot|crawl|spider|preview|facebookexternalhit/i.test(navigator.userAgent || '')) return;
      var sp = new URLSearchParams(location.search);
      if (sp.get('app') || sp.get('admin') || sp.get('staffview')) return;
      var st = (sp.get('staff') || '').trim(), src = (sp.get('src') || '').trim().toLowerCase();
      if (st && !OK.test(st)) st = '';
      if (!/^[a-z0-9_\-]{1,20}$/.test(src)) src = '';
      if (!st && !src) return;                                   // Link se nahi aaya (seedha khola) — ginti nahi
      var day = new Date().toISOString().slice(0, 10), key = 'ekveera_vt_' + day + '_' + st + '_' + page + '_' + src;
      if (gs(key)) return;
      var vid = gs('ekveera_vid');
      if (!/^[A-Za-z0-9\-]{16,64}$/.test(vid)) {
        vid = ''; for (var i = 0; i < 24; i++) vid += 'abcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 36));
        ss('ekveera_vid', vid);
      }
      if (gs('ekveera_vid') !== vid) return;                     // Storage band hai — gino mat (warna har baar nayi ID banegi)
      ss(key, '1');
      for (var j = localStorage.length - 1; j >= 0; j--) { var kk = localStorage.key(j); if (kk && kk.indexOf('ekveera_vt_') === 0 && kk.indexOf('ekveera_vt_' + day) !== 0) localStorage.removeItem(kk); }
      var url = (typeof SEARCH_WEB_APP_URL !== 'undefined') ? SEARCH_WEB_APP_URL : '';
      if (!url || !window.fetch) return;
      fetch(url, { method: 'POST', mode: 'no-cors', keepalive: true, body: new URLSearchParams({ action: 'vtrack', vid: vid, staff: st, src: src, page: page, kind: 'link' }) }).catch(function () {});
    } catch (e) {}
  }
  if (document.readyState === 'complete') setTimeout(trackVisit, 1500); else window.addEventListener('load', function () { setTimeout(trackVisit, 1500); });
})();
