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
  var KR = 'ekveera_staff_ref', KL = 'ekveera_staff_locked', OK = /^[A-Za-z0-9 _.\-]{1,40}$/;
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
    ss(KR, q);                                                                              // Browser: naya link = naya Staff
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
})();
