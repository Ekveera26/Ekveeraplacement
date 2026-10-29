/* EkVeera — 🔔 Notification (Firebase Cloud Messaging). Sirf tab chalta hai jab user khud 🔔 dabaye. */
(function () {
  'use strict';
  var CFG = { apiKey: 'AIzaSyCYucPeuadIGAIDe9Wnd9YnburocspCpa8', authDomain: 'ekveera-b3d43.firebaseapp.com', projectId: 'ekveera-b3d43',
    storageBucket: 'ekveera-b3d43.firebasestorage.app', messagingSenderId: '895967431456', appId: '1:895967431456:web:43d55f20183e1db20c6545' };
  var VAPID = 'BHQhaZZ0kkGaUir5WSPAuDNtrCgKKa8bXXMdVhfk08uRCsvYf1EH2eHecAgR39t6ylCDdiVTG7Rg_JuGZSxAA2s';
  var SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
  var ADMIN = /placement\.html/i.test(location.pathname) && /[?&]admin=1/.test(location.search);   // v20: Candidate/Company भी Placement पेज पर अपनी सूचना चालू कर सकें
  var KEY = 'ekv_push_v1';
  function $(id) { return document.getElementById(id); }
  function T(s) { try { return typeof __t === 'function' ? __t(s) : s; } catch (e) { return s; } }
  function lsGet() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function lsSet(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function load(src) { return new Promise(function (ok, no) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  function supported() { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; }
  function say(t, cls) { var m = $('ekvPushMsg'); if (m) { m.textContent = t; m.className = 'ekv-push-msg ' + (cls || ''); } }

  async function enable(forMob) {
    var pw = '', mob = '';
    if (ADMIN) { pw = ($('ekvPushPw').value || '').trim(); if (!pw) return say(T('Admin Password लिखें।'), 'err'); }
    else { mob = String(forMob || ($('ekvPushMob') ? $('ekvPushMob').value : '') || '').replace(/\D/g, '').slice(-10); if (mob.length !== 10) return say(T('10 अंकों का सही Mobile Number लिखें।'), 'err'); }
    if (!supported()) return say(T('इस Browser में Notification नहीं चलता। (iPhone पर पहले "Add to Home Screen" करें।)'), 'err');
    var btn = $('ekvPushGo') || { disabled: false }; btn.disabled = true; say(T('⏳ चालू किया जा रहा है...'), '');
    try {
      var perm = await Notification.requestPermission();
      if (perm !== 'granted') { btn.disabled = false; return say(T('Notification की अनुमति (Allow) नहीं मिली। Browser की Settings में Allow करें।'), 'err'); }
      if (!window.firebase) { await load(SDK + 'firebase-app-compat.js'); await load(SDK + 'firebase-messaging-compat.js'); }
      if (!firebase.apps.length) firebase.initializeApp(CFG);
      var reg = await navigator.serviceWorker.ready;
      var token = await firebase.messaging().getToken({ vapidKey: VAPID, serviceWorkerRegistration: reg });
      if (!token) throw new Error('no token');
      var body = { action: 'pushsave', token: token, role: ADMIN ? 'admin' : 'user', device: (navigator.userAgent || '').slice(0, 60) };
      if (ADMIN) body.password = pw; else { body.mobile = mob; var ac0 = acGet(); if (ac0.token && ac0.mobile === mob) { body.acToken = ac0.token; body.deviceId = devId(); } }   // v21: Login हो तो Token साथ
      var r = await vcSecurePost(body);
      if (!r || r.status !== 'ok') { btn.disabled = false; return say((r && r.message) || T('कुछ गड़बड़ हुई — दोबारा कोशिश करें।'), 'err'); }
      lsSet({ token: token, on: 1, mob: mob }); render(); closeOffer();
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
                 : (acGet().mobile ? '' : '<input id="ekvPushMob" type="tel" inputmode="numeric" maxlength="10" placeholder="' + T('अपना 10 अंकों का Mobile Number') + '">'))
        + '<button type="button" id="ekvPushGo" class="ekv-push-btn">' + T('🔔 Notification चालू करें') + '</button>';
    var g = $('ekvPushGo'); if (g) g.onclick = function () { enable(acGet().mobile || undefined); }; var o = $('ekvPushOff'); if (o) o.onclick = disable;
    renderAcct();
    if (ADMIN && !$('ekvPushSend')) {                                                  // 📣 Admin: किसी ID / Mobile / सबको Notification भेजना
      var sd = document.createElement('div'); sd.id = 'ekvPushSend'; sd.style.cssText = 'margin-top:12px;padding-top:10px;border-top:1px solid #dde';
      sd.innerHTML = '<b style="font-size:13px">' + T('📣 Notification भेजें') + '</b>'
        + '<input id="ekvSdTo" placeholder="' + T('किसे? Mobile / ID (GIV001, KAR003…) / ALL') + '" autocomplete="off">'
        + '<input id="ekvSdTitle" maxlength="80" placeholder="' + T('Title') + '"><input id="ekvSdBody" maxlength="200" placeholder="' + T('Message') + '">'
        + '<input id="ekvSdPw" type="password" placeholder="' + T('Admin Password') + '" autocomplete="off">'
        + '<button type="button" id="ekvSdGo" class="ekv-push-btn">' + T('भेजें') + '</button>';
      $('ekvPushPanel').appendChild(sd);
      $('ekvSdGo').onclick = async function () {
        var b = this, to = $('ekvSdTo').value.trim(), ti = $('ekvSdTitle').value.trim(), bo = $('ekvSdBody').value.trim(), pw2 = $('ekvSdPw').value.trim();
        if (!to || !ti || !bo || !pw2) return say(T('सब खाने भरें (किसे, Title, Message, Password)।'), 'err');
        b.disabled = true; say(T('⏳ भेजा जा रहा है...'), '');
        try {
          var r = await vcSecurePost({ action: 'pushsend', password: pw2, target: to, title: ti, body: bo, url: 'index.html' });
          say((r && r.message) || T('कुछ गड़बड़ हुई।'), r && r.status === 'ok' ? 'ok' : 'err');
        } catch (e) { say(T('भेजा नहीं जा सका — दोबारा कोशिश करें।'), 'err'); }
        b.disabled = false; $('ekvSdPw').value = '';
      };
    }
  }

  /* ================= v21: 🔐 अपना Login (Mobile + OTP) और 📥 Inbox ================= */
  var AKEY = 'ekv_acct', DKEY = 'ekv_dev', SEEN = 'ekv_inbox_seen';
  function acGet() { try { return JSON.parse(localStorage.getItem(AKEY) || '{}') || {}; } catch (e) { return {}; } }
  function acSet(o) { try { localStorage.setItem(AKEY, JSON.stringify(o)); } catch (e) {} }
  function devId() {
    try {
      var d = localStorage.getItem(DKEY);
      if (!d || d.length < 16) { var a = new Uint8Array(20); (window.crypto || window.msCrypto).getRandomValues(a); d = Array.prototype.map.call(a, function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); localStorage.setItem(DKEY, d); }
      return d;
    } catch (e) { return 'tmp' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2); }
  }
  function seenGet() { try { return parseInt(localStorage.getItem(SEEN) || '0', 10) || 0; } catch (e) { return 0; } }
  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
  function acSay(t, cls) { var m = $('ekvAcMsg'); if (m) { m.textContent = t; m.className = 'ekv-push-msg ' + (cls || ''); } }
  function badge(n) {
    var b = $('ekvPushBadge'), bell = $('ekvPushBell'); if (!bell) return;
    if (!b) { b = el('span'); b.id = 'ekvPushBadge'; bell.parentNode.appendChild(b); }
    b.textContent = n > 9 ? '9+' : String(n); b.style.display = n > 0 ? 'block' : 'none';
  }
  async function acCall(action, extra) {
    var a = acGet(), p = { action: action, mobile: a.mobile || '', token: a.token || '', deviceId: devId() };
    for (var k in extra) p[k] = extra[k];
    var r = await vcSecurePost(p);
    if (r && r.code === 'RELOGIN') { acSet({}); renderAcct(); render(); }
    return r;
  }
  function renderAcct() {
    if (ADMIN) return;
    var panel = $('ekvPushPanel'); if (!panel) return;
    var box = $('ekvAcBox'); if (!box) { box = el('div'); box.id = 'ekvAcBox'; panel.insertBefore(box, panel.firstChild); }
    box.textContent = '';
    var a = acGet();
    if (a.token && a.mobile) {
      var h = el('div', 'ekv-ac-h', '📥 ' + T('मेरा Inbox')); box.appendChild(h);
      var list = el('div', 'ekv-ac-list'); list.id = 'ekvAcList'; list.appendChild(el('p', 'ekv-ac-empty', T('⏳ ...'))); box.appendChild(list);
      var row = el('div', 'ekv-ac-row');
      var rb = el('button', 'ekv-push-btn alt', T('✔ सब पढ़ लिया')); rb.type = 'button'; rb.onclick = markRead;
      var lb = el('button', 'ekv-push-btn alt', T('Logout')); lb.type = 'button'; lb.onclick = logout;
      row.appendChild(rb); row.appendChild(lb); box.appendChild(row);
      box.appendChild(el('div', 'ekv-ac-who', (a.name ? a.name + ' · ' : '') + (a.regId ? a.regId + ' · ' : '') + '+91 ' + a.mobile));
      var ms = el('div', 'ekv-push-msg'); ms.id = 'ekvAcMsg'; box.appendChild(ms);
      loadInbox();
    } else {
      box.appendChild(el('div', 'ekv-ac-h', '🔐 ' + T('Login — अपना Inbox देखें')));
      box.appendChild(el('p', '', T('User ID (REG…) या Mobile और Password से Login करें। नए हैं तो पहले Register करें।')));
      var im = el('input'); im.id = 'ekvAcMob'; im.type = 'text'; im.maxLength = 20; im.autocomplete = 'username'; im.placeholder = T('User ID (REG012) या Mobile'); box.appendChild(im);
      var io = el('input'); io.id = 'ekvAcPass'; io.type = 'password'; io.maxLength = 40; io.autocomplete = 'current-password'; io.placeholder = 'Password'; box.appendChild(io);
      var bg = el('button', 'ekv-push-btn', T('🔓 Login')); bg.id = 'ekvAcGo'; bg.type = 'button'; bg.style.marginTop = '8px'; bg.onclick = pwLogin; box.appendChild(bg);
      var lk = el('p', ''); lk.innerHTML = '<a href="register.html">' + T('🆕 नया Account बनाएँ') + '</a> · <a href="index.html?gate=1" onclick="try{localStorage.removeItem(\'ekv_acct\')}catch(e){}">' + T('🆘 Password भूल गए') + '</a>'; box.appendChild(lk);
      var ms2 = el('div', 'ekv-push-msg'); ms2.id = 'ekvAcMsg'; box.appendChild(ms2);
      box.appendChild(el('hr', 'ekv-ac-hr'));
    }
  }
  async function pwLogin() {
    var u = ($('ekvAcMob').value || '').trim(), p = $('ekvAcPass').value || '';
    if (!u || !p) return acSay(T('User ID (या Mobile) और Password लिखें।'), 'err');
    var b = $('ekvAcGo'); b.disabled = true; acSay(T('⏳ जाँच हो रही है...'), '');
    try {
      var r = await vcSecurePost({ action: 'aclogin', userid: u, password: p, deviceId: devId() });
      if (r && r.status === 'ok') { acSet({ mobile: r.mobile, token: r.token, level: r.level, name: r.name || '', regId: r.regId || '' }); renderAcct(); render(); }
      else { acSay((r && r.message) || T('कुछ गड़बड़ हुई — दोबारा कोशिश करें।'), 'err'); b.disabled = false; }
    } catch (e) { acSay(T('Internet चेक करके दोबारा कोशिश करें।'), 'err'); b.disabled = false; }
  }
  async function loadInbox() {
    var list = $('ekvAcList'); if (!list) return;
    try {
      var r = await acCall('acinbox', { seen: seenGet() });
      if (!r || r.status !== 'ok') { list.textContent = ''; list.appendChild(el('p', 'ekv-ac-empty', (r && r.message) || T('अभी Inbox नहीं खुल सका।'))); return; }
      list.textContent = '';
      if (!r.items.length) list.appendChild(el('p', 'ekv-ac-empty', T('अभी कोई सूचना नहीं है।')));
      r.items.forEach(function (it) {
        var d = el('div', 'ekv-ac-item' + (it.unread ? ' un' : '')); d.appendChild(el('b', '', it.title)); d.appendChild(el('div', 'ekv-ac-b', it.body)); d.appendChild(el('small', '', it.time));
        if (it.choices && it.choices.length) {                       // v24: App ke andar jawab — Selected / Vacancy chalu-Close
          var en = (localStorage.getItem('ekveera_lang') === 'en'), bx = el('div', 'ekv-ac-ans'), st = el('div', 'ekv-ac-ansmsg');
          it.choices.forEach(function (c) {
            var b = el('button', 'ekv-ac-ansbtn' + (/^(not_selected|closed)$/.test(c.v) ? ' no' : ''), en ? c.en : c.hi); b.type = 'button';
            b.onclick = function (ev) {
              ev.stopPropagation(); if (!window.confirm((en ? 'Confirm: ' : 'पक्का करें: ') + (en ? c.en : c.hi) + ' ?')) return;
              Array.prototype.forEach.call(bx.querySelectorAll('button'), function (x) { x.disabled = true; }); st.textContent = '⏳ ...';
              acCall('acanswer', { key: it.key, answer: c.v }).then(function (r) {
                if (r && r.status === 'ok') { bx.style.display = 'none'; st.textContent = r.message || '✅'; st.className = 'ekv-ac-ansmsg ok'; }
                else { st.textContent = (r && r.message) || T('कुछ गड़बड़ हुई — दोबारा कोशिश करें।'); st.className = 'ekv-ac-ansmsg err'; Array.prototype.forEach.call(bx.querySelectorAll('button'), function (x) { x.disabled = false; }); }
              }).catch(function () { st.textContent = T('Internet चेक करके दोबारा कोशिश करें।'); st.className = 'ekv-ac-ansmsg err'; Array.prototype.forEach.call(bx.querySelectorAll('button'), function (x) { x.disabled = false; }); });
            };
            bx.appendChild(b);
          });
          d.appendChild(bx); d.appendChild(st); d.classList.add('un');
        } else if (it.answer) { d.appendChild(el('div', 'ekv-ac-ansmsg ok', '✔ ' + it.answer)); }
        if (!(it.choices && it.choices.length) && it.url && it.url !== 'index.html') { d.style.cursor = 'pointer'; d.onclick = function () { location.href = it.url; }; }
        list.appendChild(d);
      });
      badge(r.unread || 0);
    } catch (e) { list.textContent = ''; list.appendChild(el('p', 'ekv-ac-empty', T('Internet चेक करें।'))); }
  }
  async function markRead() {
    try { await acCall('acread', {}); try { localStorage.setItem(SEEN, String(Date.now())); } catch (e) {} badge(0); loadInbox(); } catch (e) {}
  }
  async function logout() { if (typeof window.__ekvLogout === 'function') return window.__ekvLogout(); try { await acCall('aclogout', {}); } catch (e) {} acSet({}); badge(0); renderAcct(); render(); }
  async function initBadge() {
    var a = acGet(); if (ADMIN || !a.token) return;
    try { var r = await acCall('acunread', { seen: seenGet() }); if (r && r.status === 'ok') badge(r.unread || 0); } catch (e) {}
  }

  function css() {
    var s = document.createElement('style');
    s.textContent = '#ekvPush{position:fixed;right:22px;bottom:96px;z-index:9990;font-family:inherit}'
      + '#ekvPushBell{width:46px;height:46px;border-radius:50%;border:0;background:#fff;box-shadow:0 4px 16px rgba(0,0,0,.22);font-size:22px;cursor:pointer}'
      + '#ekvPushPanel{display:none;max-height:70vh;overflow:auto;position:absolute;right:0;bottom:56px;width:min(290px,calc(100vw - 28px));background:#fff;color:#222;border-radius:14px;padding:14px;box-shadow:0 8px 28px rgba(0,0,0,.25);font-size:14px}'
      + '#ekvPush.open #ekvPushPanel{display:block}#ekvPushPanel p{margin:0 0 10px;line-height:1.5}'
      + '#ekvPushPanel input{width:100%;box-sizing:border-box;padding:10px;border:1px solid #ccd;border-radius:8px;margin-bottom:8px;font-size:15px}'
      + '.ekv-push-btn{width:100%;padding:10px;border:0;border-radius:8px;background:#1a56db;color:#fff;font-size:15px;font-weight:600;cursor:pointer}.ekv-push-btn.alt{background:#64748b}.ekv-push-btn:disabled{opacity:.6}'
      + '.ekv-push-msg{margin-top:8px;font-size:13px}.ekv-push-msg.err{color:#b91c1c}.ekv-push-msg.ok{color:#15803d}'
      + '#ekvPushBadge{display:none;position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;line-height:18px;padding:0 4px;border-radius:9px;background:#dc2626;color:#fff;font-size:11px;font-weight:700;text-align:center;box-sizing:border-box}'
      + '.ekv-ac-h{font-weight:700;margin-bottom:8px}.ekv-ac-list{max-height:240px;overflow:auto;margin-bottom:8px}.ekv-ac-item{padding:8px 10px;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:6px;font-size:13.5px;line-height:1.45}'
      + '.ekv-ac-ans{display:flex;flex-direction:column;gap:6px;margin:8px 0 2px}.ekv-ac-ansbtn{padding:10px;border:0;border-radius:9px;background:#16a34a;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit}.ekv-ac-ansbtn.no{background:#c0392b}.ekv-ac-ansbtn:disabled{opacity:.6}.ekv-ac-ansmsg{font-size:13px;margin-top:4px}.ekv-ac-ansmsg.ok{color:#15803d}.ekv-ac-ansmsg.err{color:#b91c1c}'
      + '.ekv-ac-item.un{background:#eff6ff;border-color:#93c5fd}.ekv-ac-b{margin:2px 0;color:#334155}.ekv-ac-item small{color:#64748b}.ekv-ac-empty{color:#64748b;font-size:13px;margin:4px 0}'
      + '.ekv-ac-row{display:flex;gap:8px}.ekv-ac-row .ekv-push-btn{padding:8px;font-size:13px}.ekv-ac-who{font-size:12px;color:#64748b;margin-top:6px}.ekv-ac-hr{border:0;border-top:1px solid #dde;margin:12px 0 10px}';
    document.head.appendChild(s);
  }

  /* ---------- v20: काम पूरा होने पर "सूचना इसी फ़ोन पर पाएँ" का बटन (अपने-आप Permission नहीं माँगता; बटन दबाने पर ही) ---------- */
  function closeOffer() { var o = $('ekvPushOffer'); if (o && o.parentNode) o.parentNode.removeChild(o); }
  function offer(mobile) {
    try {
      var m = String(mobile || '').replace(/\D/g, '').slice(-10);
      if (ADMIN || m.length !== 10 || $('ekvPushOffer')) return;
      var st = lsGet(); if (st.on && st.mob === m) return;                      // इसी Mobile के लिए पहले से चालू
      var b = document.createElement('div'); b.id = 'ekvPushOffer';
      b.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9995;max-width:460px;margin:0 auto;background:#0B1F3A;color:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 8px 28px rgba(0,0,0,.35);font-size:14px;line-height:1.5';
      var ios = /iPad|iPhone|iPod/.test(navigator.userAgent || '') && !(window.matchMedia && matchMedia('(display-mode: standalone)').matches);
      b.innerHTML = '<div style="font-weight:700;margin-bottom:4px">' + T('🔔 अपडेट की सूचना इसी फ़ोन पर पाएँ') + '</div>'
        + '<div style="opacity:.9">' + T('ID, Payment, Order और Interview की खबर तुरंत मिलेगी — मुफ़्त है। बाद में कभी भी बंद कर सकते हैं।') + '</div>'
        + (ios ? '<div style="opacity:.8;margin-top:4px;font-size:12px">' + T('iPhone पर पहले वेबसाइट को "Add to Home Screen" करें (iOS 16.4+), फिर यहाँ चालू करें।') + '</div>' : '')
        + '<div style="display:flex;gap:8px;margin-top:10px"><button type="button" id="ekvOfferGo" class="ekv-push-btn" style="flex:1">' + T('🔔 चालू करें') + '</button>'
        + '<button type="button" id="ekvOfferNo" class="ekv-push-btn alt" style="flex:0 0 auto;width:auto;padding:10px 14px">' + T('अभी नहीं') + '</button></div>'
        + '<div id="ekvOfferMsg" style="margin-top:6px;font-size:12px"></div>';
      document.body.appendChild(b);
      $('ekvOfferNo').onclick = closeOffer;
      $('ekvOfferGo').onclick = async function () {
        var g = this; g.disabled = true;
        await enable(m);
        var mm = $('ekvPushMsg'); var o = $('ekvOfferMsg');
        if (o && mm && mm.textContent && $('ekvPushOffer')) { o.textContent = mm.textContent; g.disabled = false; }
      };
    } catch (e) {}
  }
  window.ekvOfferPush = offer;

  // इन काम के सफल होते ही बटन दिखाओ (Request/Response की जाँच से; किसी पेज का कोड बदलना नहीं पड़ता)
  var OFFER_ACTIONS = { submitregistration: 1, applytojob: 1, rentregister: 1, rentorder: 1, tutregister: 1, tutorder: 1, hsregister: 1, hsorder: 1 };
  function hookFetch() {
    if (!window.fetch || window.__ekvPushHook) return; window.__ekvPushHook = 1;
    var orig = window.fetch;
    window.fetch = function (input, init) {
      var p = orig.apply(this, arguments);
      try {
        var body = init && init.body, act = '', mob = '';
        if (body && typeof body.get === 'function') { act = body.get('action') || ''; mob = body.get('mobile') || body.get('mobile number') || body.get('contact number') || ''; }
        if (OFFER_ACTIONS[act] && mob) p.then(function (res) { try { res.clone().json().then(function (j) { if (j && j.status === 'ok') offer(mob); }).catch(function () {}); } catch (e) {} }).catch(function () {});
      } catch (e) {}
      return p;
    };
  }
  hookFetch();

  function init() {
    if ($('ekvPush')) return; css();
    var d = document.createElement('div'); d.id = 'ekvPush';
    d.innerHTML = '<button type="button" id="ekvPushBell" aria-label="Notification">🔕</button><div id="ekvPushPanel"><div id="ekvPushBody"></div><div id="ekvPushMsg" class="ekv-push-msg"></div></div>';
    document.body.appendChild(d);
    $('ekvPushBell').onclick = function () { d.classList.toggle('open'); if (d.classList.contains('open') && acGet().token) loadInbox(); };
    render(); initBadge();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
