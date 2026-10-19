/* EkVeera — भरोसे वाले दो Note (v19)
   1) Payment की चेतावनी: जहाँ Payment होता है उन पेजों पर ऊपर एक पट्टी + हर "💳 Pay" बटन / Payment Link के ठीक नीचे —
      "जितनी रकम स्क्रीन पर दिख रही है ठीक उतनी ही दें, कम-ज़्यादा Payment मान्य नहीं।"
   2) Details हटवाने का Note: हर पेज पर Footer से ठीक पहले, उभरा हुआ — "अपनी Details हटवानी हों तो EkVeera से संपर्क करें।"
   भाषा: Hindi/English अपने-आप (EKV_LANG); शब्दकोश की ज़रूरत नहीं। */
(function () {
  'use strict';
  var EN = window.EKV_LANG === 'en';
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page === 'privacy.html') return;                                   // Privacy पेज पर यही बात पहले से सबसे ऊपर लिखी है
  var PAY_PAGES = ['training.html', 'placement.html', 'for-rent.html', 'home-service.html', 'tution.html', 'contractor.html'];
  var PAY_HI = '⚠️ <b>ज़रूरी — Payment की रकम:</b> आपकी Payment Screen पर जितनी रकम दिख रही है, <b>ठीक उतनी ही</b> Payment करें — न कम, न ज़्यादा। रकम कम या ज़्यादा होने पर जिस काम के लिए आप Payment कर रहे हैं वह <b>नहीं होगा</b>, आपकी Payment <b>मान्य नहीं</b> होगी और आपको दोबारा सही रकम की Payment करनी पड़ेगी — या EkVeera Office (<b>9766284669</b>) से संपर्क करें। Payment सिर्फ़ इसी वेबसाइट के Pay बटन / Link से करें।';
  var PAY_EN = '⚠️ <b>Important — Payment amount:</b> Pay <b>exactly the amount shown</b> on your payment screen — not less, not more. If you pay a lower or higher amount, the work you are paying for <b>will not be done</b>, your payment will be <b>treated as invalid</b> and you will have to pay the correct amount again — or contact the EkVeera Office (<b>9766284669</b>). Pay only through the Pay button / link on this website.';
  var PAY = EN ? PAY_EN : PAY_HI;

  /* ---------- 1) Payment चेतावनी ---------- */
  function isPayEl(el) {
    if (!el || el.closest('.pay-warn, #adminPanel, .adm-panel, [id^="admin"]')) return false;
    var t = el.textContent || '', h = (el.getAttribute && el.getAttribute('href')) || '';
    if (/rzp\.io|razorpay\.com/i.test(h)) return true;
    return /💳/.test(t) && /Pay|पे/i.test(t);
  }
  function visible(el) { return !!(el.offsetParent || (el.getClientRects && el.getClientRects().length)); }
  var timer = 0;
  function sweep() {
    timer = 0;
    var els = document.querySelectorAll('main a.btn, main button.btn, main a[href*="rzp.io"], main a[href*="razorpay"], section a.btn, section button.btn, #pdPay a, .rent-pay');
    Array.prototype.forEach.call(els, function (el) {
      if (!isPayEl(el)) return;
      var nx = el.nextElementSibling, note = (nx && nx.classList && nx.classList.contains('pay-warn')) ? nx : null;
      if (!note) { note = document.createElement('div'); note.className = 'pay-warn notranslate'; note.innerHTML = PAY; el.parentNode.insertBefore(note, el.nextSibling); }
      var want = visible(el) ? '' : 'none'; if (note.style.display !== want) note.style.display = want;
    });
  }
  function later() { if (!timer) timer = setTimeout(sweep, 250); }

  function top() {
    if (PAY_PAGES.indexOf(page) < 0 || document.getElementById('ekvPayTop')) return;
    var anchor = document.getElementById('ekvHelpNote') || document.querySelector('header'); if (!anchor) return;
    var d = document.createElement('div'); d.id = 'ekvPayTop'; d.className = 'container';
    d.innerHTML = '<div class="pay-warn pay-warn-top notranslate">' + PAY + '</div>';
    anchor.parentNode.insertBefore(d, anchor.nextSibling);
  }

  /* ---------- 2) Details हटवाने का Note ---------- */
  function removal() {
    if (document.getElementById('ekvRmNote')) return;
    var f = document.querySelector('footer'); if (!f) return;
    var msg = EN ? '🔒 <b>Want your details removed?</b> You can contact EkVeera at any time and have your details deleted — it is free. We never sell your information; read how we protect it in our Privacy Policy.'
                 : '🔒 <b>अपनी Details हटवाना चाहते हैं?</b> कोई भी व्यक्ति EkVeera से संपर्क करके कभी भी अपनी Details हटवा सकता है — यह मुफ़्त है। हम आपकी जानकारी बेचते नहीं; कैसे सुरक्षित रखते हैं यह Privacy Policy में पढ़ें।';
    var wa = 'https://wa.me/919766284669?text=' + encodeURIComponent(EN ? 'Hello EkVeera, I want my details removed. My ID: ____ and registered mobile: ____' : 'नमस्ते EkVeera, मैं अपनी Details हटवाना चाहता/चाहती हूँ। मेरी ID: ____ और Registered Mobile: ____');
    var d = document.createElement('div'); d.id = 'ekvRmNote'; d.className = 'rm-note notranslate';
    d.innerHTML = '<div class="container rm-note-in"><span>' + msg + '</span><a class="rm-btn" href="' + wa + '" target="_blank" rel="noopener">💬 ' + (EN ? 'Contact on WhatsApp' : 'WhatsApp पर संपर्क करें') + '</a><a class="rm-btn" href="privacy.html">📄 ' + (EN ? 'Privacy Policy' : 'Privacy Policy पढ़ें') + '</a></div>';
    f.parentNode.insertBefore(d, f);
  }

  function go() {
    top(); removal();
    if (PAY_PAGES.indexOf(page) >= 0) { sweep(); try { new MutationObserver(later).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'hidden'] }); } catch (e) { setInterval(sweep, 1500); } }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
