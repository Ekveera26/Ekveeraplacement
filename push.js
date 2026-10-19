/* EkVeera — 🔔 Notification (Firebase Cloud Messaging). Sirf tab chalta hai jab user khud 🔔 dabaye. */
(function () {
  'use strict';
  var CFG = { apiKey: 'AIzaSyCYucPeuadIGAIDe9Wnd9YnburocspCpa8', authDomain: 'ekveera-b3d43.firebaseapp.com', projectId: 'ekveera-b3d43',
    storageBucket: 'ekveera-b3d43.firebasestorage.app', messagingSenderId: '895967431456', appId: '1:895967431456:web:43d55f20183e1db20c6545' };
  var VAPID = 'BHQhaZZ0kkGaUir5WSPAuDNtrCgKKa8bXXMdVhfk08uRCsvYf1EH2eHecAgR39t6ylCDdiVTG7Rg_JuGZSxAA2s';
  var SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
  var ADMIN = /placement\.html/i.test(location.pathname);
  var KEY = 'ekv_push_v1';
  function $(id) { return document.getElementById(id); }
  function T(s) { try { return typeof __t === 'function' ? __t(s) : s; } catch (e) { return s; } }
  function lsGet() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function lsSet(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function load(src) { return new Promise(function (ok, no) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  function supported() { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; }
  function say(t, cls) { var m = $('ekvPushMsg'); if (m) { m.textContent = t; m.className = 'ekv-push-msg ' + (cls || ''); } }

  async function enable() {
    var pw = '', mob = '';
    if (ADMIN) { pw = ($('ekvPushPw').value || '').trim(); if (!pw) return say(T('Admin Password लिखें।'), 'err'); }
    else { mob = ($('ekvPushMob').value || '').replace(/\D/g, '').slice(-10); if (mob.length !== 10) return say(T('10 अंकों का सही Mobile Number लिखें।'), 'err'); }
    if (!supported()) return say(T('इस Browser में Notification नहीं चलता। (iPhone पर पहले "Add to Home Screen" करें।)'), 'err');
    var btn = $('ekvPushGo'); btn.disabled = true; say(T('⏳ चालू किया जा रहा है...'), '');
    try {
      var perm = await Notification.requestPermission();
      if (perm !== 'granted') { btn.disabled = false; return say(T('Notification की अनुमति (Allow) नहीं मिली। Browser की Settings में Allow करें।'), 'err'); }
      if (!window.firebase) { await load(SDK + 'firebase-app-compat.js'); await load(SDK + 'firebase-messaging-compat.js'); }
      if (!firebase.apps.length) firebase.initializeApp(CFG);
      var reg = await navigator.serviceWorker.ready;
      var token = await firebase.messaging().getToken({ vapidKey: VAPID, serviceWorkerRegistration: reg });
      if (!token) throw new Error('no token');
      var body = { action: 'pushsave', token: token, role: ADMIN ? 'admin' : 'user', device: (navigator.userAgent || '').slice(0, 60) };
      if (ADMIN) body.password = pw; else body.mobile = mob;
      var r = await vcSecurePost(body);
      if (!r || r.status !== 'ok') { btn.disabled = false; return say((r && r.message) || T('कुछ गड़बड़ हुई — दोबारा कोशिश करें।'), 'err'); }
      lsSet({ token: token, on: 1 }); render();
      say(T('🔔 Notification चालू हो गया।'), 'ok');
    } catch (e) { btn.disabled = false; say(T('Notification चालू नहीं हो पाया — दोबारा कोशिश करें।'), 'err'); }
  }
  async function disable() {
    var s = lsGet(); try { if (s.token) await vcSecurePost({ action: 'pushoff', token: s.token }); } catch (e) {}
    try { if (window.firebase && firebase.apps.length) await firebase.messaging().deleteToken(); } catch (e) {}
    lsSet({}); render(); say(T('Notification बंद कर दिया।'), 'ok');
  }
  function render() {
    var on = !!lsGet().on, box = $('ekvPushBody'); if (!box) return;
    $('ekvPushBell').textContent = on ? '🔔' : '🔕';
    box.innerHTML = on
      ? '<p>' + T('इस फ़ोन/कंप्यूटर पर Notification चालू है।') + '</p><button type="button" id="ekvPushOff" class="ekv-push-btn alt">' + T('Notification बंद करें') + '</button>'
      : '<p>' + T('Payment, Order और ज़रूरी बातों की सूचना सीधे फ़ोन पर पाएँ।') + '</p>'
        + (ADMIN ? '<input id="ekvPushPw" type="password" placeholder="' + T('Admin Password') + '" autocomplete="off">'
                 : '<input id="ekvPushMob" type="tel" inputmode="numeric" maxlength="10" placeholder="' + T('अपना 10 अंकों का Mobile Number') + '">')
        + '<button type="button" id="ekvPushGo" class="ekv-push-btn">' + T('🔔 Notification चालू करें') + '</button>';
    var g = $('ekvPushGo'); if (g) g.onclick = enable; var o = $('ekvPushOff'); if (o) o.onclick = disable;
  }
  function css() {
    var s = document.createElement('style');
    s.textContent = '#ekvPush{position:fixed;right:22px;bottom:96px;z-index:9990;font-family:inherit}'
      + '#ekvPushBell{width:46px;height:46px;border-radius:50%;border:0;background:#fff;box-shadow:0 4px 16px rgba(0,0,0,.22);font-size:22px;cursor:pointer}'
      + '#ekvPushPanel{display:none;position:absolute;right:0;bottom:56px;width:min(290px,calc(100vw - 28px));background:#fff;color:#222;border-radius:14px;padding:14px;box-shadow:0 8px 28px rgba(0,0,0,.25);font-size:14px}'
      + '#ekvPush.open #ekvPushPanel{display:block}#ekvPushPanel p{margin:0 0 10px;line-height:1.5}'
      + '#ekvPushPanel input{width:100%;box-sizing:border-box;padding:10px;border:1px solid #ccd;border-radius:8px;margin-bottom:8px;font-size:15px}'
      + '.ekv-push-btn{width:100%;padding:10px;border:0;border-radius:8px;background:#1a56db;color:#fff;font-size:15px;font-weight:600;cursor:pointer}.ekv-push-btn.alt{background:#64748b}.ekv-push-btn:disabled{opacity:.6}'
      + '.ekv-push-msg{margin-top:8px;font-size:13px}.ekv-push-msg.err{color:#b91c1c}.ekv-push-msg.ok{color:#15803d}';
    document.head.appendChild(s);
  }
  function init() {
    if ($('ekvPush')) return; css();
    var d = document.createElement('div'); d.id = 'ekvPush';
    d.innerHTML = '<button type="button" id="ekvPushBell" aria-label="Notification">🔕</button><div id="ekvPushPanel"><div id="ekvPushBody"></div><div id="ekvPushMsg" class="ekv-push-msg"></div></div>';
    document.body.appendChild(d);
    $('ekvPushBell').onclick = function () { d.classList.toggle('open'); };
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
