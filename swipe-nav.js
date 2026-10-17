/* EkVeera — Mobile par Left / Right Swipe se agle-pichhle Page par jaana
   Home → Call Center Training → Placement → For Rent → Home Service → Tution → Register
   Left swipe (उँगली दाएँ से बाएँ) = अगला पेज; Right swipe = पिछला पेज.
   Form bharte samay, Table / Slider scroll karte samay, Admin Panel khule hone par, ya Text chunte samay Swipe kaam NAHI karta. */
(function () {
  'use strict';
  var ORDER = ['index.html', 'training.html', 'placement.html', 'for-rent.html', 'home-service.html', 'tution.html', 'register.html'];
  var cur = (location.pathname.split('/').pop() || 'index.html').toLowerCase(); if (cur === '') cur = 'index.html';
  var idx = ORDER.indexOf(cur); if (idx < 0) return;                       // सिर्फ़ इन्हीं पेज पर
  var sx = 0, sy = 0, st = 0, ok = false;
  function inScroller(el) {                                                // जिसके अंदर आड़ा Scroll हो सकता है (Table, Slider) वहाँ Swipe न करें
    while (el && el !== document.body) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable) return true;
      var cs = window.getComputedStyle(el), ox = cs.overflowX;
      if ((ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 4) return true;
      el = el.parentElement;
    }
    return false;
  }
  document.addEventListener('touchstart', function (e) {
    ok = false; if (e.touches.length !== 1) return;
    if (document.body.classList.contains('adm-lock')) return;
    if (document.getElementById('ekvPush') && document.getElementById('ekvPush').classList.contains('open')) return;
    if (inScroller(e.target)) return;
    var t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); ok = true;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!ok) return; ok = false;
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy, dt = Date.now() - st;
    if (Math.abs(dx) < 90 || Math.abs(dy) > 55 || Math.abs(dx) < Math.abs(dy) * 2.2 || dt > 700) return;   // साफ़, तेज़, आड़ा Swipe ही
    var sel = window.getSelection && String(window.getSelection() || ''); if (sel && sel.length > 0) return;
    var to = dx < 0 ? ORDER[idx + 1] : ORDER[idx - 1]; if (!to) return;
    var b = document.body; b.style.transition = 'transform .18s ease, opacity .18s ease'; b.style.transform = 'translateX(' + (dx < 0 ? '-' : '') + '28px)'; b.style.opacity = '.25';
    setTimeout(function () { location.href = to; }, 150);
  }, { passive: true });
  window.addEventListener('pageshow', function () { document.body.style.transform = ''; document.body.style.opacity = ''; });
})();
