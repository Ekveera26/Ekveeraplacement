/* EkVeera — Mobile par Left / Right Swipe se agle-pichhle Page par jaana
   Home → Call Center Training → Placement → For Rent → Home Service → Tution → Register
   Left swipe (उँगली दाएँ से बाएँ) = अगला पेज; Right swipe = पिछला पेज.
   Form bharte samay, Table / Slider scroll karte samay, Admin Panel khule hone par, ya Text chunte samay Swipe kaam NAHI karta. */
(function () {
  'use strict';
  var ORDER = ['index.html', 'training.html', 'placement.html', 'for-rent.html', 'home-service.html', 'tution.html', 'register.html'];
  var cur = (location.pathname.split('/').pop() || 'index.html').toLowerCase(); if (cur === '') cur = 'index.html';
  var idx = ORDER.indexOf(cur); if (idx < 0) return;                       // सिर्फ़ इन्हीं पेज पर
  var sx = 0, sy = 0, st = 0, ok = false, go = false;
  function inScroller(el) {                                                // जिसके अंदर आड़ा Scroll हो सकता है (Table, Slider) वहाँ Swipe न करें
    var n = 0;
    while (el && el !== document.body && n++ < 12) {                       // ⚡ बहुत गहरे DOM में भी देर न लगे (12 स्तर काफ़ी)
      var tg = el.tagName;
      if (tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT' || el.isContentEditable) return true;
      if (el.scrollWidth > el.clientWidth + 4) {                           // पहले सस्ती जाँच; महँगा getComputedStyle सिर्फ़ तब
        var ox = window.getComputedStyle(el).overflowX;
        if (ox === 'auto' || ox === 'scroll') return true;
      }
      el = el.parentElement;
    }
    return false;
  }
  function leave(dx) {                                                     // ⚡ तुरंत चलो — पहले की तरह 150ms रुकना नहीं
    if (go) return; go = true;
    var to = dx < 0 ? ORDER[idx + 1] : ORDER[idx - 1]; if (!to) { go = false; return; }
    var b = document.body; b.style.transition = 'opacity .09s linear'; b.style.opacity = '.4';
    location.href = to;
  }
  document.addEventListener('touchstart', function (e) {
    ok = false; if (e.touches.length !== 1) return;
    if (document.body.classList.contains('adm-lock')) return;
    var pu = document.getElementById('ekvPush'); if (pu && pu.classList.contains('open')) return;
    if (inScroller(e.target)) return;
    var t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); ok = true;
  }, { passive: true });
  document.addEventListener('touchmove', function (e) {                    // ⚡ उँगली उठाने का इंतज़ार नहीं: ज़रूरी दूरी पार होते ही पेज बदल जाए
    if (!ok || go) return;
    var t = e.touches[0], dx = t.clientX - sx, dy = t.clientY - sy, adx = Math.abs(dx), ady = Math.abs(dy);
    if (ady > 70 || (adx > 20 && adx < ady * 1.8)) { if (ady > 70) ok = false; return; }   // ऊपर-नीचे Scroll है तो छोड़ दो
    if (adx < 70) return;
    var sel = window.getSelection && String(window.getSelection() || ''); if (sel && sel.length > 0) { ok = false; return; }
    ok = false; leave(dx);
  }, { passive: true });
  document.addEventListener('touchend', function (e) {                     // तेज़ छोटा Flick भी चले (दूरी कम पर रफ़्तार ज़्यादा)
    if (!ok) return; ok = false;
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy, dt = Math.max(1, Date.now() - st), adx = Math.abs(dx), ady = Math.abs(dy);
    if (ady > 70 || adx < ady * 1.8 || dt > 900) return;
    if (adx < 70 && !(adx >= 42 && adx / dt > 0.45)) return;
    var sel = window.getSelection && String(window.getSelection() || ''); if (sel && sel.length > 0) return;
    leave(dx);
  }, { passive: true });
  window.addEventListener('pageshow', function () { go = false; document.body.style.transition = ''; document.body.style.transform = ''; document.body.style.opacity = ''; });
})();
