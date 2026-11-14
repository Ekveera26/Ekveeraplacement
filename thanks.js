/* EkVeera — 🙏 धन्यवाद Card (Register / ID बनने के बाद, ID के साथ हर बार वही अपनापन वाला संदेश)
   Use: window.ekvThanks(hostElement, {name:'अनिल', kind:'candidate'|'company'|'training'|'app'|'rent'|'home'|'tution'}) */
(function () {
  'use strict';
  var T = function (s) { return typeof __t === 'function' ? __t(s) : s; };
  var LINE = {
    candidate: 'आपके सही अवसर की हमारी ओर से शुभकामनाएँ। 🌟',
    company: 'आपको सही Staff मिले — यही हमारी कोशिश रहेगी। 🌟',
    training: 'सीखने का आपका फ़ैसला आपकी तरक़्क़ी की पहली सीढ़ी है। 🌟',
    app: 'अब आपको अपने काम की जानकारी सबसे पहले मिलेगी। 🌟',
    rent: 'आपका सामान सही ज़रूरतमंद तक पहुँचे — यही हमारी कोशिश है। 🌟',
    home: 'आपका हुनर अब आपके शहर के लोगों तक पहुँचेगा। 🌟',
    tution: 'आपकी Skill से कई लोगों की राह बनेगी। 🌟',
    taker: 'आपको ज़रूरत का सामान आसानी से मिले — यही हमारी कोशिश है। 🌟',
    student: 'सीखने का आपका फ़ैसला आपकी तरक़्क़ी की पहली सीढ़ी है। 🌟',
    customer: 'आपको भरोसेमंद कारीगर मिले — यही हमारी कोशिश है। 🌟'
  };
  var CSS = '.ekv-thanks{margin:12px 0;padding:14px 16px;border-radius:16px;background:linear-gradient(135deg,#FFF7E0,#E9F7F5);border:2px solid #F2B33D;text-align:left;color:#0B1F3A;line-height:1.65;font-size:14.5px}' +
    '.ekv-thanks b.h{display:block;font-size:17px;color:#11766F;margin-bottom:4px}.ekv-thanks small{display:block;margin-top:6px;color:#44526b;font-size:12.5px}';
  function css() { if (document.getElementById('ekvThanksCss')) return; var s = document.createElement('style'); s.id = 'ekvThanksCss'; s.textContent = CSS; document.head.appendChild(s); }
  window.ekvThanks = function (host, o) {
    try {
      if (!host) return; css(); o = o || {};
      var old = host.querySelector('.ekv-thanks'); if (old) old.remove();
      var nm = String(o.name || '').trim().slice(0, 40);
      var d = document.createElement('div'); d.className = 'ekv-thanks';
      var h = document.createElement('b'); h.className = 'h';
      h.textContent = '🙏 ' + (nm ? T('धन्यवाद, ') + nm + T(' जी!') : T('धन्यवाद!'));
      var p = document.createElement('div');
      p.textContent = T('आपने EkVeera से जुड़ने का फ़ैसला किया — यह हमारे लिए सम्मान की बात है। अब आप अकेले नहीं, EkVeera परिवार का हिस्सा हैं। 🤝') + ' ' + T(LINE[o.kind] || LINE.app);
      var s = document.createElement('small'); s.textContent = T('कोई भी सवाल हो तो WhatsApp पर "Hi" लिखें — हम साथ हैं। — टीम EkVeera');
      d.appendChild(h); d.appendChild(p); d.appendChild(s);
      var anchor = host.querySelector(o.after || 'h3');
      while (anchor && anchor.parentNode && anchor.parentNode !== host) anchor = anchor.parentNode;
      if (anchor && anchor.parentNode === host) host.insertBefore(d, anchor.nextSibling); else host.insertBefore(d, host.firstChild);  // ID/शीर्षक के ठीक बाद; न मिले तो सबसे ऊपर
    } catch (e) { /* संदेश न दिखे तो भी Register/ID पर कोई असर नहीं */ }
  };
})();
