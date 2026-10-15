/* EkVeera — Staff Profile (sirf EkVeera ke Staff ke liye)
   Server: EkVeera_StaffProfile.gs
   SURAKSHA:
   • Profile ka koi data is Link/Page me nahi hota. Data sirf Login ke baad aur usi Mobile (Device) par aata hai.
   • Is Mobile par sirf ek "Device ID" aur "Login Token" rakhe jate hain — Photo / Naam / Documents kabhi Phone ki Storage me nahi rakhe jate.
   • Link doosre ko bhejne par wahan sirf normal App khulta hai. */
(function () {
  'use strict';
  var DEV_KEY = 'ekveera_sf_dev', SESS_KEY = 'ekveera_sf_sess', REC_KEY = 'ekveera_sf_rec', RULES_VERSION = 'v1';
  var SITE_URL = 'ekveera26.github.io/Ekveeraplacement/staff-profile.html';
  var openedAt = Date.now(), state = null, photoData = null, curTab = 'profile';

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function rand() { var a = new Uint8Array(16); (window.crypto || window.msCrypto).getRandomValues(a); return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function deviceId() { var d = lsGet(DEV_KEY); if (!d || d.length < 16) { d = rand(); lsSet(DEV_KEY, d); } return d; }
  function deviceLabel() { return (navigator.userAgent || '').replace(/\s+/g, ' ').slice(0, 78); }
  function sess() { try { return JSON.parse(lsGet(SESS_KEY) || 'null'); } catch (e) { return null; } }
  function msg(id, text, color) { var m = $(id); if (!m) return; m.style.color = color || '#c0392b'; m.textContent = text || ''; }
  function mob10(v) { return String(v || '').replace(/\D/g, '').slice(-10); }

  var C1 = 'मैं मानता/मानती हूँ कि EkVeera का कोई भी Staff किसी भी प्रकार से न तो किसी Company से और न ही किसी Candidate से ₹1 की भी माँग करेगा। मैं भी किसी से कोई पैसा (Cash / UPI / गिफ्ट / किसी भी रूप में) न माँगूँगा/माँगूँगी और न लूँगा/लूँगी। सारा Payment सिर्फ़ EkVeera के आधिकारिक Payment Link से होगा। अगर मैं पैसों का लेन-देन करते हुए पाया गया, तो मेरे खिलाफ़ कड़ी कानूनी कार्यवाही होगी और मेरा Commission ज़ब्त कर लिया जाएगा।';
  var C2 = 'मैंने जो जानकारी और Documents दिए हैं वे बिल्कुल सही और असली हैं। अगर बाद में मेरा कोई Criminal Record मिलता है, या मैंने कोई गलत / नकली Document दिया है, तो उसका पूरा ज़िम्मेदार मैं खुद हूँगा/हूँगी और मेरे खिलाफ़ कानूनी कार्यवाही की जाएगी।';
  var C3 = 'मैंने ऊपर लिखे बाकी सभी नियम पढ़ लिए हैं और उन्हें मानता/मानती हूँ। मैं समझता/समझती हूँ कि Admin की मंज़ूरी और ID Card बनने के बाद ही मैं EkVeera का Staff कहलाऊँगा/कहलाऊँगी और बिना ID Card के मेरा Commission नहीं जाएगा।';
  var RULES = [
    'अपना Password, Profile और ID Card किसी को नहीं दूँगा/दूँगी। अपनी Profile किसी दूसरे के Mobile पर नहीं खोलूँगा/खोलूँगी।',
    'Candidate और Company की जानकारी (नाम, Mobile, Email) किसी को Share नहीं करूँगा/करूँगी — सिर्फ़ EkVeera के काम के लिए इस्तेमाल करूँगा/करूँगी।',
    'नौकरी / Placement की झूठी गारंटी या झूठा वादा नहीं करूँगा/करूँगी।',
    'EkVeera के नाम पर अपना निजी UPI / QR / Bank Account या अपना अलग Form / Link कभी नहीं चलाऊँगा/चलाऊँगी।',
    'Candidate और Company से हमेशा अच्छा व्यवहार करूँगा/करूँगी। बदतमीज़ी या गलत व्यवहार पर मेरा Access बंद (Suspend) हो सकता है।',
    'ID Card सिर्फ़ मेरे अपने काम के लिए है। खो जाए तो तुरंत Admin को बताऊँगा/बताऊँगी।',
    'Commission सिर्फ़ Admin से Approved Profile और ID Card के बाद ही जाएगा। नियम तोड़ने पर Commission रोका या ज़ब्त किया जा सकता है।',
    'EkVeera किसी भी समय, बिना कारण बताए, मेरा Staff Access बंद कर सकता है।'
  ];

  function api(action, params) {
    var p = { action: action }; for (var k in params) p[k] = params[k];
    return vcSecurePost(p);
  }
  function authP(extra) { var s = sess() || {}; var p = { staffId: s.staffId, token: s.token, deviceId: deviceId() }; for (var k in extra) p[k] = extra[k]; return p; }
  function relogin(d, where) {
    if (d && (d.code === 'RELOGIN' || d.code === 'DEVICE' || d.code === 'SUSPENDED')) {
      lsDel(SESS_KEY); state = null; photoData = null; sfShow('login');
      msg('lgMsg', d.message || __t('कृपया दोबारा Login करें।'));
      return true;
    }
    return false;
  }

  /* ---------------- Views ---------------- */
  window.sfShow = function (v) {
    ['Home', 'Login', 'Register', 'Recover', 'Dash'].forEach(function (n) { var e = $('sf' + n); if (e) e.style.display = (n.toLowerCase() === v) ? 'block' : 'none'; });
    var note = $('sfNote'); if (note) note.style.display = (v === 'dash') ? 'none' : 'block';
    if (v === 'home') homeButtons();
    if (v === 'recover') recoverResume();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  function homeButtons() {
    var a = document.querySelector('#sfHome .sf-actions'); if (!a) return;
    var old = $('sfOpenMine'); if (old) old.remove();
    if (sess()) { var b = document.createElement('button'); b.type = 'button'; b.id = 'sfOpenMine'; b.className = 'btn btn-primary'; b.textContent = __t('👤 मेरी Profile खोलें'); b.onclick = function () { loadDash('profile'); }; a.insertBefore(b, a.firstChild); }
  }

  /* ---------------- Register ---------------- */
  function fillRules() {
    var box = $('sfRulesBox'); if (!box) return;
    box.innerHTML = '<h4>' + esc(__t('📜 Staff के नियम (पूरे पढ़ें)')) + '</h4><div class="sf-money">' + esc('⚠️ ' + __t(C1)) + '</div><ol>' + RULES.map(function (r) { return '<li>' + esc(__t(r)) + '</li>'; }).join('') + '</ol>';
    $('rgC1t').textContent = __t(C1); $('rgC2t').textContent = __t(C2); $('rgC3t').textContent = __t(C3);
  }
  window.sfRegister = async function () {
    var g = function (id) { return ($(id).value || '').trim(); }, btn = $('rgBtn');
    var d = { staffId: g('rgId'), name: g('rgName'), mobile: mob10(g('rgMob')), altMobile: mob10(g('rgAlt')), email: g('rgMail'), dob: g('rgDob'), address: g('rgAddr'), city: g('rgCity'), upi: g('rgUpi'),
              idType: $('rgIdType').value, idLast4: g('rgLast4').replace(/\D/g, ''), password: $('rgPw').value };
    if (!d.staffId || d.name.length < 3) return msg('rgMsg', __t('Staff ID और पूरा नाम भरें।'));
    if (d.mobile.length !== 10 || d.altMobile.length !== 10) return msg('rgMsg', __t('दोनों Mobile Number 10 अंकों के डालें।'));
    if (d.mobile === d.altMobile) return msg('rgMsg', __t('Recovery Mobile आपके अपने Number से अलग होना चाहिए।'));
    if (!d.email || !d.dob || d.address.length < 10 || d.city.length < 2) return msg('rgMsg', __t('Email, जन्म तारीख, पता और शहर ठीक से भरें।'));
    if (d.idLast4.length !== 4) return msg('rgMsg', __t('ID Proof के आख़िरी 4 अंक डालें।'));
    if (d.password.length < 6) return msg('rgMsg', __t('Password कम-से-कम 6 अक्षर/अंक का रखें।'));
    if (d.password !== $('rgPw2').value) return msg('rgMsg', __t('दोनों Password एक जैसे नहीं हैं।'));
    if (!$('rgC1').checked || !$('rgC2').checked || !$('rgC3').checked) return msg('rgMsg', __t('आगे बढ़ने के लिए तीनों घोषणाओं (✔) को मानना ज़रूरी है।'));
    btn.disabled = true; msg('rgMsg', __t('⏳ Profile बन रही है...'), '#1f3b63');
    d.deviceId = deviceId(); d.deviceLabel = deviceLabel(); d.c1 = d.c2 = d.c3 = 'yes'; d.rulesVersion = RULES_VERSION; d.website = $('rgWeb').value; d.elapsed = Math.round((Date.now() - openedAt) / 1000);
    try {
      var r = await api('sfregister', d);
      if (r && r.status === 'ok') { lsSet(SESS_KEY, JSON.stringify({ staffId: r.staffId, token: r.token })); $('rgPw').value = $('rgPw2').value = ''; loadDash('docs'); return; }
      msg('rgMsg', (r && r.message) || __t('कुछ गड़बड़ हो गई — दोबारा कोशिश करें।'));
    } catch (e) { msg('rgMsg', __t('Internet चेक करके दोबारा कोशिश करें।')); }
    btn.disabled = false;
  };

  /* ---------------- Login ---------------- */
  window.sfLogin = async function () {
    var id = ($('lgId').value || '').trim(), pw = $('lgPw').value, btn = $('lgBtn');
    if (!id || !pw) return msg('lgMsg', __t('Staff ID और Password डालें।'));
    btn.disabled = true; msg('lgMsg', __t('⏳ जाँच हो रही है...'), '#1f3b63');
    try {
      var r = await api('sflogin', { staffId: id, password: pw, deviceId: deviceId() });
      if (r && r.status === 'ok') { lsSet(SESS_KEY, JSON.stringify({ staffId: r.staffId, token: r.token })); $('lgPw').value = ''; msg('lgMsg', ''); loadDash('profile'); }
      else {
        msg('lgMsg', (r && r.message) || __t('कुछ गड़बड़ हो गई — दोबारा कोशिश करें।'));
        if (r && r.code === 'DEVICE') { lsSet(REC_KEY, JSON.stringify({ staffId: id })); }
      }
    } catch (e) { msg('lgMsg', __t('Internet चेक करके दोबारा कोशिश करें।')); }
    btn.disabled = false;
  };
  window.sfLogout = function () { lsDel(SESS_KEY); state = null; photoData = null; sfShow('home'); };

  /* ---------------- Dashboard ---------------- */
  async function loadDash(tab) {
    curTab = tab || curTab || 'profile';
    sfShow('dash'); $('dsBody').innerHTML = '<p>⏳ ...</p>';
    try {
      var r = await api('sfprofile', authP({}));
      if (relogin(r)) return;
      if (!r || r.status !== 'ok') { $('dsBody').innerHTML = '<p style="color:#c0392b;">' + esc((r && r.message) || __t('कुछ गड़बड़ हो गई — दोबारा कोशिश करें।')) + '</p>'; return; }
      state = r; renderBanner(); renderTabs(); renderTab();
      if (!photoData) loadPhoto();
    } catch (e) { $('dsBody').innerHTML = '<p style="color:#c0392b;">' + esc(__t('Internet चेक करके दोबारा कोशिश करें।')) + '</p>'; }
  }
  async function loadPhoto() {
    try { var r = await api('sfphoto', authP({})); if (r && r.status === 'ok' && r.has) { photoData = 'data:' + r.mime + ';base64,' + r.data; var im = $('dsPhoto'); if (im) im.src = photoData; if (curTab === 'card') renderTab(); } } catch (e) {}
  }
  function renderBanner() {
    var st = state.profileStatus, note = state.profile.adminNote || '', col = { Draft: ['#fff6e0', '#b26a00'], Pending: ['#eef6ff', '#1f3b63'], Approved: ['#eaf6ee', '#1b7f3b'], Rejected: ['#fdecea', '#7a1f1f'] }[st] || ['#fff6e0', '#b26a00'];
    var txt = {
      Draft: __t('📝 आपकी Profile अभी अधूरी है। "Documents" में सारे ज़रूरी Documents डालकर "Admin को भेजें" दबाएँ।'),
      Pending: __t('⏳ आपकी Profile Admin की जाँच में है। Approve होते ही आप EkVeera के Staff कहलाएँगे और ID Card बनेगा।'),
      Approved: __t('✅ आप EkVeera के Approved Staff हैं। आपका ID Card और Commission नीचे उपलब्ध है।'),
      Rejected: __t('❌ Admin ने बदलाव माँगे हैं:') + ' ' + note + ' — ' + __t('सुधारकर दोबारा "Admin को भेजें" दबाएँ।')
    }[st] || '';
    $('dsBanner').innerHTML = '<div class="sf-banner" style="background:' + col[0] + ';color:' + col[1] + ';">' + esc(txt) + '</div>';
  }
  function renderTabs() {
    var ap = state.profileStatus === 'Approved', t = [['profile', '👤 Profile'], ['docs', '📎 Documents']];
    if (ap) { t.push(['card', '🪪 ID Card']); t.push(['money', '💰 Commission']); }
    t.push(['pw', '🔑 Password']); t.push(['cmp', '🚨 शिकायत']);
    $('dsTabs').innerHTML = t.map(function (x) { return '<button type="button" class="sf-tab' + (curTab === x[0] ? ' on' : '') + '" onclick="sfTab(\'' + x[0] + '\')">' + esc(__t(x[1])) + '</button>'; }).join('');
  }
  window.sfTab = function (t) { curTab = t; renderTabs(); renderTab(); };
  function renderTab() {
    var b = $('dsBody'), p = state.profile;
    if (curTab === 'profile') {
      var ed = state.editable;
      b.innerHTML = '<div class="sf-head"><img id="dsPhoto" class="sf-photo" alt="" src="' + (photoData || '') + '" style="' + (photoData ? '' : 'visibility:hidden;') + '"><div><h3 style="margin:0;">' + esc(p.name) + '</h3><div class="sf-small">' + esc(__t('Staff ID')) + ': <strong>' + esc(p.staffId) + '</strong> · ' + esc(p.designation || 'Staff') + '</div><div class="sf-small">' + esc(__t('Mobile')) + ': ' + esc(p.mobile) + '</div></div></div>' +
        '<div class="sf-grid2">' +
        '<label class="sf-l">' + esc(__t('पूरा नाम')) + '<input id="edName" class="ap-i" value="' + esc(p.name) + '"' + (ed ? '' : ' disabled') + '></label>' +
        '<label class="sf-l">Email<input id="edMail" class="ap-i" value="' + esc(p.email) + '"' + (ed ? '' : ' disabled') + '></label>' +
        '<label class="sf-l" style="grid-column:1/-1;">' + esc(__t('पूरा पता')) + '<input id="edAddr" class="ap-i" value="' + esc(p.address) + '"' + (ed ? '' : ' disabled') + '></label>' +
        '<label class="sf-l">' + esc(__t('शहर')) + '<input id="edCity" class="ap-i" value="' + esc(p.city) + '"' + (ed ? '' : ' disabled') + '></label>' +
        '<label class="sf-l">Recovery Mobile<input id="edAlt" class="ap-i" value="' + esc(p.altMobile) + '"' + (ed ? '' : ' disabled') + '></label>' +
        '<label class="sf-l">UPI / Bank<input id="edUpi" class="ap-i" value="' + esc(p.upi) + '"' + (ed ? '' : ' disabled') + '></label>' +
        '<label class="sf-l">' + esc(__t('जन्म तारीख')) + '<input class="ap-i" value="' + esc(p.dob) + '" disabled></label>' +
        '<label class="sf-l">' + esc(__t('ID Proof')) + '<input class="ap-i" value="' + esc(p.idType + ' ••••' + p.idLast4) + '" disabled></label></div>' +
        (ed ? '<button type="button" class="btn btn-primary" onclick="sfSaveProfile()">' + esc(__t('💾 बदलाव सहेजें')) + '</button>' : '<p class="sf-small">🔒 ' + esc(__t('Admin को भेजने के बाद नाम, Mobile, जन्म तारीख, पता और UPI बदलने के लिए EkVeera Office से संपर्क करें — इससे आपकी Profile सुरक्षित रहती है।')) + '</p>') +
        '<p id="edMsg" class="sf-msg"></p>' +
        '<p class="sf-small">🔒 ' + esc(__t('यह सारी जानकारी सिर्फ़ इसी Mobile पर, Login के बाद दिखती है। इस पेज का Link दूसरों को भेजने पर उन्हें आपकी Photo या जानकारी नहीं दिखेगी।')) + '</p>';
    } else if (curTab === 'docs') renderDocs();
    else if (curTab === 'card') renderCard();
    else if (curTab === 'money') renderMoney();
    else if (curTab === 'pw') {
      b.innerHTML = '<h3>' + esc(__t('🔑 Password बदलें')) + '</h3><div class="sf-grid2"><label class="sf-l">' + esc(__t('पुराना Password')) + '<input id="pwOld" class="ap-i" type="password" autocomplete="current-password"></label><label class="sf-l">' + esc(__t('नया Password')) + '<input id="pwNew" class="ap-i" type="password" autocomplete="new-password"></label><label class="sf-l">' + esc(__t('नया Password दोबारा')) + '<input id="pwNew2" class="ap-i" type="password" autocomplete="new-password"></label></div><button type="button" class="btn btn-primary" onclick="sfChangePw()">' + esc(__t('Password बदलें')) + '</button><p id="pwMsg" class="sf-msg"></p><p class="sf-small">' + esc(__t('Password बदलते ही पुराने सभी Login बंद हो जाते हैं।')) + '</p>';
    } else if (curTab === 'cmp') {
      b.innerHTML = '<h3>' + esc(__t('🚨 शिकायत')) + '</h3><p class="sf-small">' + esc(__t('किसी Staff के गलत व्यवहार या पैसे माँगने की शिकायत Admin तक पहुँचाने के लिए नीचे का बटन दबाएँ। शिकायत सिर्फ़ Admin को दिखती है।')) + '</p><button type="button" class="btn btn-primary" onclick="sfShow(\'home\');setTimeout(function(){var c=document.getElementById(\'complaint\');if(c)c.scrollIntoView({behavior:\'smooth\'})},200)">' + esc(__t('🚨 शिकायत का फॉर्म खोलें')) + '</button>';
    }
  }
  window.sfSaveProfile = async function () {
    var g = function (id) { return ($(id).value || '').trim(); };
    msg('edMsg', __t('⏳ सहेज रहे हैं...'), '#1f3b63');
    try {
      var r = await api('sfupdate', authP({ name: g('edName'), email: g('edMail'), address: g('edAddr'), city: g('edCity'), altMobile: mob10(g('edAlt')), upi: g('edUpi') }));
      if (relogin(r)) return;
      if (r && r.status === 'ok') { msg('edMsg', __t('✅ सहेज लिया गया।'), '#1b7f3b'); loadDash('profile'); } else msg('edMsg', (r && r.message) || 'Error');
    } catch (e) { msg('edMsg', __t('Internet चेक करके दोबारा कोशिश करें।')); }
  };

  /* ---------------- Documents ---------------- */
  function renderDocs() {
    var ed = state.editable, miss = state.requiredMissing || [];
    var rows = state.docs.map(function (d) {
      return '<div class="sf-doc"><div><strong>' + esc(__t(d.label)) + '</strong>' + (d.required ? ' <span style="color:#c0392b;">*</span>' : '') + '<div class="sf-small">' + (d.uploaded ? '✅ ' + esc(__t('जमा हो गया')) + (d.at ? ' · ' + esc(d.at) : '') : '❌ ' + esc(d.required ? __t('ज़रूरी — अभी जमा नहीं') : __t('वैकल्पिक'))) + '</div></div>' +
        (ed ? '<label class="btn sf-up">' + esc(d.uploaded ? __t('बदलें') : __t('चुनें')) + '<input type="file" accept="' + (d.type === 'photo' ? 'image/*' : 'image/*,application/pdf') + '" style="display:none" onchange="sfUpload(\'' + d.type + '\',this)"></label>' : '') + '</div>';
    }).join('');
    $('dsBody').innerHTML = '<h3>' + esc(__t('📎 Documents')) + '</h3><p class="sf-small">' + esc(__t('फोटो साफ़ और पूरी दिखनी चाहिए। फ़ाइल का साइज़ 100 KB से कम होना चाहिए, नहीं तो अपलोड नहीं होगी — बड़ी फोटो अपने-आप छोटी कर दी जाती है। ये Documents सिर्फ़ Admin देख सकते हैं।')) + '</p>' + rows +
      (ed ? '<button type="button" class="btn btn-primary" style="margin-top:12px;" onclick="sfSubmit()"' + (miss.length ? ' disabled' : '') + '>' + esc(__t('📨 Admin को भेजें')) + '</button>' + (miss.length ? '<p class="sf-small">' + esc(__t('पहले सभी ज़रूरी (*) Documents जमा करें।')) + '</p>' : '') : '') + '<p id="dcMsg" class="sf-msg"></p>';
  }
  function loadImg(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { URL.revokeObjectURL(u); res(im); }; im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('img')); }; im.src = u;
    });
  }
  async function prepare(file, type) {
    if (window.EKV_FILES) {   // 100 KB se kam (photo apne-aap chhoti, Preview ke saath)
      var r = await window.EKV_FILES.process(file, { allow: type === 'photo' ? ['image'] : ['image', 'pdf'] });
      if (r.cancelled) throw new Error(__t('फ़ाइल नहीं भेजी गई।'));
      if (r.error) throw new Error(r.error);
      return await new Promise(function (res, rej) { var rd = new FileReader(); rd.onload = function () { res(String(rd.result).split(',')[1]); }; rd.onerror = rej; rd.readAsDataURL(r.file); });
    }
    if (file.type === 'application/pdf') {
      if (file.size > 1300000) throw new Error(__t('PDF 1.3 MB से छोटी होनी चाहिए।'));
      return await new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1]); }; r.onerror = rej; r.readAsDataURL(file); });
    }
    if (!/^image\//.test(file.type)) throw new Error(__t('सिर्फ़ फोटो या PDF चुनें।'));
    var im = await loadImg(file), max = type === 'photo' ? 700 : 1600, q = 0.8, out = '';
    var sc = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas');
    c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    for (var i = 0; i < 6; i++) { out = c.toDataURL('image/jpeg', q).split(',')[1]; if (out.length < 1900000) break; q -= 0.12; }
    if (out.length >= 2100000) throw new Error(__t('फोटो बहुत बड़ी है — छोटी फोटो चुनें।'));
    return out;
  }
  window.sfUpload = async function (type, input) {
    var f = input.files && input.files[0]; if (!f) return;
    msg('dcMsg', __t('⏳ भेज रहे हैं...'), '#1f3b63');
    try {
      var b64 = await prepare(f, type);
      var r = await api('sfupload', authP({ docType: type, fileBase64: b64 }));
      if (relogin(r)) return;
      if (r && r.status === 'ok') { if (type === 'photo') photoData = null; await loadDash('docs'); msg('dcMsg', __t('✅ जमा हो गया।'), '#1b7f3b'); }
      else msg('dcMsg', (r && r.message) || 'Error');
    } catch (e) { msg('dcMsg', e && e.message && e.message !== 'img' ? e.message : __t('फोटो पढ़ी नहीं जा सकी — दूसरी फोटो चुनें।')); }
    input.value = '';
  };
  window.sfSubmit = async function () {
    if (!confirm(__t('Admin को भेजने के बाद आप जानकारी नहीं बदल सकेंगे। क्या सब सही है?'))) return;
    msg('dcMsg', __t('⏳ भेज रहे हैं...'), '#1f3b63');
    try {
      var r = await api('sfsubmit', authP({}));
      if (relogin(r)) return;
      if (r && r.status === 'ok') loadDash('profile'); else msg('dcMsg', (r && r.message) || 'Error');
    } catch (e) { msg('dcMsg', __t('Internet चेक करके दोबारा कोशिश करें।')); }
  };

  /* ---------------- ID Card (browser me hi banta hai) ---------------- */
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function wrap(ctx, text, x, y, maxW, lh) {
    var words = String(text).split(' '), line = '';
    words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); line = w; y += lh; } else line = t; });
    if (line) ctx.fillText(line, x, y); return y;
  }
  function imgFrom(src) { return new Promise(function (res) { if (!src) return res(null); var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(null); }; i.src = src; }); }
  async function drawCard(canvas, card) {
    var W = 1011, H = 638, ctx = canvas.getContext('2d'); canvas.width = W; canvas.height = H * 2 + 30;
    ctx.fillStyle = '#e9eef5'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    var logo = await imgFrom('logo.png'), ph = await imgFrom(photoData), F = 'Work Sans, Noto Sans Devanagari, Arial, sans-serif';
    // ----- Front -----
    ctx.save(); rr(ctx, 0, 0, W, H, 34); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    var g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#0B1F3A'); g.addColorStop(1, '#17406b'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 150);
    if (logo) ctx.drawImage(logo, 26, 18, 112, 112);
    ctx.fillStyle = '#fff'; ctx.font = '800 44px ' + F; ctx.fillText('EKVEERA', 160, 68);
    ctx.font = '600 20px ' + F; ctx.fillStyle = '#E1A33C'; ctx.fillText('PLACEMENT & SERVICES', 160, 100);
    ctx.fillStyle = '#c9d6e8'; ctx.font = '500 17px ' + F; ctx.fillText('Connecting Talent With Opportunity', 160, 126);
    ctx.fillStyle = '#E1A33C'; ctx.fillRect(0, 150, W, 8);
    // photo
    ctx.save(); rr(ctx, 40, 195, 270, 340, 22); ctx.clip(); ctx.fillStyle = '#dfe5ee'; ctx.fillRect(40, 195, 270, 340);
    if (ph) { var sc = Math.max(270 / ph.width, 340 / ph.height), w = ph.width * sc, h = ph.height * sc; ctx.drawImage(ph, 40 + (270 - w) / 2, 195 + (340 - h) / 2, w, h); }
    ctx.restore(); ctx.strokeStyle = '#0B1F3A'; ctx.lineWidth = 4; rr(ctx, 40, 195, 270, 340, 22); ctx.stroke();
    ctx.fillStyle = '#0B1F3A'; ctx.font = '800 46px ' + F; wrap(ctx, card.name.toUpperCase(), 345, 240, 620, 52);
    ctx.fillStyle = '#17406b'; ctx.font = '700 28px ' + F; ctx.fillText(card.designation || 'Staff', 345, 322);
    ctx.fillStyle = '#596579'; ctx.font = '600 21px ' + F; ctx.fillText('STAFF ID', 345, 372); ctx.fillText('MOBILE', 345, 452);
    ctx.fillStyle = '#0B1F3A'; ctx.font = '800 36px ' + F; ctx.fillText(card.staffId, 345, 412); ctx.fillText(card.mobile, 345, 492);
    ctx.fillStyle = '#1b7f3b'; rr(ctx, 640, 380, 340, 62, 31); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '800 22px ' + F; ctx.textAlign = 'center'; ctx.fillText('\u2714 AUTHORISED STAFF', 810, 420); ctx.textAlign = 'left';
    ctx.fillStyle = '#0B1F3A'; ctx.fillRect(0, 565, W, 73);
    ctx.fillStyle = '#fff'; ctx.font = '700 22px ' + F; ctx.fillText('CARD CODE: ' + card.code, 40, 610);
    ctx.fillStyle = '#c9d6e8'; ctx.font = '500 18px ' + F; ctx.fillText('Issued: ' + String(card.issuedAt || '').slice(0, 10), 560, 610);
    ctx.restore();
    // ----- Back -----
    var y0 = H + 30; ctx.save(); ctx.translate(0, y0); rr(ctx, 0, 0, W, H, 34); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#0B1F3A'; ctx.fillRect(0, 0, W, 90); ctx.fillStyle = '#fff'; ctx.font = '800 32px ' + F; ctx.fillText('IMPORTANT / ज़रूरी सूचना', 40, 58);
    ctx.fillStyle = '#7a1f1f'; ctx.font = '800 28px ' + F; var y = wrap(ctx, 'EkVeera Staff never asks for money. Pay ONLY through the official EkVeera Payment Link.', 40, 150, 930, 36);
    ctx.fillStyle = '#0B1F3A'; ctx.font = '700 26px ' + F; y = wrap(ctx, 'EkVeera का कोई भी Staff किसी से ₹1 भी नहीं माँगता। Payment सिर्फ़ EkVeera के आधिकारिक Payment Link से करें।', 40, y + 50, 930, 36);
    ctx.fillStyle = '#17406b'; ctx.font = '600 23px ' + F; y = wrap(ctx, 'यह Card सिर्फ़ ऊपर लिखे Staff के लिए है। मिलने पर EkVeera Office को लौटाएँ। Card की जाँच / शिकायत के लिए नीचे देखें।', 40, y + 50, 930, 32);
    ctx.fillStyle = '#f1f5fa'; rr(ctx, 40, 420, 930, 150, 16); ctx.fill(); ctx.fillStyle = '#0B1F3A'; ctx.font = '700 22px ' + F;
    ctx.fillText('Verify: ' + SITE_URL, 62, 462); ctx.fillText('Staff ID: ' + card.staffId + '   Code: ' + card.code, 62, 500); ctx.fillText('Complaint / WhatsApp: 9766284669', 62, 538);
    ctx.fillStyle = '#E1A33C'; ctx.fillRect(0, H - 14, W, 14); ctx.restore();
  }
  function renderCard() {
    var c = state.card; if (!c) { $('dsBody').innerHTML = '<p>' + esc(__t('ID Card Admin की मंज़ूरी के बाद बनेगा।')) + '</p>'; return; }
    $('dsBody').innerHTML = '<h3>' + esc(__t('🪪 मेरा ID Card')) + '</h3><canvas id="cardCv" class="sf-card"></canvas><div class="sf-actions"><button type="button" class="btn btn-primary" onclick="sfDownloadCard()">' + esc(__t('⬇ ID Card Download करें')) + '</button></div><p class="sf-small">' + esc(__t('Card पर आपका Card Code है। कोई भी इसे "Staff जाँचें" में डालकर असली Staff की पहचान कर सकता है। यह Card किसी और को न दें।')) + '</p>';
    drawCard($('cardCv'), c);
  }
  window.sfDownloadCard = function () {
    var cv = $('cardCv'); if (!cv) return;
    cv.toBlob(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'EkVeera_ID_' + (state.card.staffId || 'staff') + '.png'; a.style.display = 'none'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }, 'image/png');
  };

  /* ---------------- Commission (Approved ko hi) ---------------- */
  async function renderMoney() {
    $('dsBody').innerHTML = '<p>⏳ ...</p>';
    try {
      var r = await api('sfcommission', authP({ from: '', to: '' }));
      if (relogin(r)) return;
      if (!r || r.status !== 'ok') { $('dsBody').innerHTML = '<p style="color:#c0392b;">' + esc((r && r.message) || 'Error') + '</p>'; return; }
      var m = r.money || {}, h = '<h3>' + esc(__t('💰 मेरा Commission')) + '</h3><div class="sf-grid2"><div class="sf-stat"><span>' + esc(__t('कुल कमाई')) + '</span><b>₹' + (m.earned || 0) + '</b></div><div class="sf-stat"><span>' + esc(__t('मिल चुका')) + '</span><b>₹' + (m.paid || 0) + '</b></div><div class="sf-stat"><span>' + esc(__t('बाकी')) + '</span><b>₹' + (m.pending || 0) + '</b></div><div class="sf-stat"><span>' + esc(__t('Registered')) + '</span><b>' + ((r.registered && (r.registered.candidates + r.registered.trainingCandidates)) || 0) + ' C / ' + ((r.registered && r.registered.companies) || 0) + ' Co</b></div></div>';
      var rows = (r.entries || []).slice(-30).reverse();
      h += rows.length ? '<div style="overflow-x:auto;"><table class="sf-tbl"><tr><th>' + esc(__t('तारीख')) + '</th><th>' + esc(__t('मद')) + '</th><th>' + esc(__t('मेरा हिस्सा')) + '</th><th>' + esc(__t('स्थिति')) + '</th></tr>' + rows.map(function (e) { return '<tr><td>' + esc(String(e.paidOn || '').slice(0, 10)) + '</td><td>' + esc(e.feeType || '') + '</td><td>₹' + esc(e.share) + '</td><td>' + esc(e.payoutStatus || 'Pending') + '</td></tr>'; }).join('') + '</table></div>' : '<p class="sf-small">' + esc(__t('अभी कोई Commission नहीं बना।')) + '</p>';
      h += '<p class="sf-small">⚠️ ' + esc(__t('Commission सिर्फ़ EkVeera के आधिकारिक Payment Link से हुई Payment पर बनता है। किसी से नकद / UPI में पैसे लेने पर कानूनी कार्यवाही होगी।')) + '</p>';
      $('dsBody').innerHTML = h;
    } catch (e) { $('dsBody').innerHTML = '<p style="color:#c0392b;">' + esc(__t('Internet चेक करके दोबारा कोशिश करें।')) + '</p>'; }
  }

  /* ---------------- Password ---------------- */
  window.sfChangePw = async function () {
    var o = $('pwOld').value, n = $('pwNew').value;
    if (n.length < 6) return msg('pwMsg', __t('नया Password कम-से-कम 6 अक्षर/अंक का रखें।'));
    if (n !== $('pwNew2').value) return msg('pwMsg', __t('दोनों नए Password एक जैसे नहीं हैं।'));
    msg('pwMsg', __t('⏳ बदल रहे हैं...'), '#1f3b63');
    try {
      var r = await api('sfchangepw', authP({ oldPassword: o, newPassword: n }));
      if (relogin(r)) return;
      if (r && r.status === 'ok') { var s = sess(); lsSet(SESS_KEY, JSON.stringify({ staffId: s.staffId, token: r.token })); $('pwOld').value = $('pwNew').value = $('pwNew2').value = ''; msg('pwMsg', __t('✅ Password बदल गया।'), '#1b7f3b'); }
      else msg('pwMsg', (r && r.message) || 'Error');
    } catch (e) { msg('pwMsg', __t('Internet चेक करके दोबारा कोशिश करें।')); }
  };

  /* ---------------- Recovery ---------------- */
  function recoverResume() {
    var rec; try { rec = JSON.parse(lsGet(REC_KEY) || 'null'); } catch (e) { rec = null; }
    if (rec && rec.staffId) { $('rcId').value = rec.staffId; if (rec.req) { $('rcStep1').style.display = 'none'; $('rcStep2').style.display = 'block'; $('rcReqId').textContent = rec.req; sfRecoverStatus(false); } }
  }
  window.sfRecoverReq = async function () {
    var g = function (id) { return ($(id).value || '').trim(); }, btn = $('rcBtn');
    if (!g('rcId') || mob10(g('rcMob')).length !== 10 || mob10(g('rcAlt')).length !== 10 || !g('rcDob')) return msg('rcMsg', __t('Staff ID, पुराना Mobile, जन्म तारीख और Recovery Mobile चारों भरें।'));
    btn.disabled = true; msg('rcMsg', __t('⏳ भेज रहे हैं...'), '#1f3b63');
    try {
      var r = await api('sfrecover', { staffId: g('rcId'), mobile: mob10(g('rcMob')), dob: g('rcDob'), altMobile: mob10(g('rcAlt')), type: $('rcType').value, note: g('rcNote'), deviceId: deviceId(), deviceLabel: deviceLabel() });
      if (r && r.status === 'ok') { lsSet(REC_KEY, JSON.stringify({ staffId: g('rcId'), req: r.requestId })); $('rcStep1').style.display = 'none'; $('rcStep2').style.display = 'block'; $('rcReqId').textContent = r.requestId; msg('rcMsg', ''); sfRecoverStatus(false); }
      else msg('rcMsg', (r && r.message) || 'Error');
    } catch (e) { msg('rcMsg', __t('Internet चेक करके दोबारा कोशिश करें।')); }
    btn.disabled = false;
  };
  window.sfRecoverStatus = async function (manual) {
    var rec; try { rec = JSON.parse(lsGet(REC_KEY) || 'null'); } catch (e) { rec = null; } if (!rec) return;
    try {
      var r = await api('sfrecoverstatus', { staffId: rec.staffId, deviceId: deviceId() }), s = $('rcState'), fin = $('rcFinish');
      if (!r || r.status !== 'ok') { s.style.color = '#c0392b'; s.textContent = (r && r.message) || 'Error'; return; }
      fin.style.display = 'none';
      if (r.state === 'Pending') { s.style.color = '#b26a00'; s.textContent = __t('⏳ Admin की मंज़ूरी का इंतज़ार है। Admin आपको फोन करके पक्का करेंगे। थोड़ी देर बाद "स्थिति देखें" दबाएँ।'); }
      else if (r.state === 'Approved') { s.textContent = ''; fin.style.display = 'block'; }
      else if (r.state === 'Rejected') { s.style.color = '#c0392b'; s.textContent = __t('❌ Admin ने यह Request मंज़ूर नहीं की।') + (r.adminNote ? ' ' + r.adminNote : '') + ' ' + __t('EkVeera Office से संपर्क करें।'); }
      else if (r.state === 'Expired') { s.style.color = '#c0392b'; s.textContent = __t('मंज़ूरी का समय निकल गया — नई Request करें।'); lsDel(REC_KEY); $('rcStep1').style.display = 'block'; $('rcStep2').style.display = 'none'; }
      else if (r.state === 'Used') { s.style.color = '#1b7f3b'; s.textContent = __t('यह Request पहले ही इस्तेमाल हो चुकी है — Login करें।'); lsDel(REC_KEY); }
      else if (manual) { s.textContent = ''; }
    } catch (e) { msg('rcState', __t('Internet चेक करके दोबारा कोशिश करें।')); }
  };
  window.sfRecoverFinish = async function () {
    var rec; try { rec = JSON.parse(lsGet(REC_KEY) || 'null'); } catch (e) { rec = null; } if (!rec) return;
    var dob = $('rfDob').value, pw = $('rfPw').value;
    if (!dob || pw.length < 6) return msg('rcMsg', __t('जन्म तारीख और कम-से-कम 6 अक्षर का नया Password डालें।'));
    $('rfBtn').disabled = true; msg('rcMsg', __t('⏳ ...'), '#1f3b63');
    try {
      var r = await api('sfrecoverfinish', { staffId: rec.staffId, deviceId: deviceId(), dob: dob, newPassword: pw });
      if (r && r.status === 'ok') { lsSet(SESS_KEY, JSON.stringify({ staffId: r.staffId, token: r.token })); lsDel(REC_KEY); $('rfPw').value = ''; msg('rcMsg', ''); loadDash('profile'); }
      else msg('rcMsg', (r && r.message) || 'Error');
    } catch (e) { msg('rcMsg', __t('Internet चेक करके दोबारा कोशिश करें।')); }
    $('rfBtn').disabled = false;
  };

  /* ---------------- Public: Verify + Complaint ---------------- */
  window.sfVerify = async function () {
    var id = ($('vfId').value || '').trim(), code = ($('vfCode').value || '').trim();
    if (!id || !code) return msg('vfMsg', __t('Staff ID और Card Code दोनों डालें।'));
    msg('vfMsg', __t('⏳ जाँच हो रही है...'), '#1f3b63');
    try {
      var r = await api('sfverify', { staffId: id, code: code });
      if (r && r.status === 'ok' && r.valid) msg('vfMsg', '✅ ' + __t('यह EkVeera का असली Staff है:') + ' ' + r.firstName + ' (' + r.designation + ')' + (r.since ? ' · ' + __t('Card जारी') + ': ' + r.since : ''), '#1b7f3b');
      else if (r && r.status === 'ok') msg('vfMsg', '❌ ' + __t('यह Staff ID / Code EkVeera के रिकॉर्ड में सक्रिय नहीं मिला। कृपया कोई पैसा न दें और WhatsApp 9766284669 पर बताएँ।'));
      else msg('vfMsg', (r && r.message) || 'Error');
    } catch (e) { msg('vfMsg', __t('Internet चेक करके दोबारा कोशिश करें।')); }
  };
  window.sfComplaint = async function () {
    var text = ($('cmText').value || '').trim(), btn = $('cmBtn');
    if (text.length < 15) return msg('cmMsg', __t('शिकायत थोड़ी विस्तार से लिखें (कम-से-कम 15 अक्षर)।'));
    var mob = ($('cmMob').value || '').replace(/\D/g, ''); if (mob && mob.length < 10) return msg('cmMsg', __t('Mobile 10 अंकों का डालें (या खाली छोड़ दें)।'));
    btn.disabled = true; msg('cmMsg', __t('⏳ भेज रहे हैं...'), '#1f3b63');
    try {
      var r = await api('sfcomplaint', { byType: $('cmType').value, byName: $('cmName').value, byMobile: mob.slice(-10), against: $('cmAgainst').value, text: text, website: $('cmWeb').value, elapsed: Math.round((Date.now() - openedAt) / 1000) });
      if (r && r.status === 'ok') { msg('cmMsg', __t('✅ आपकी शिकायत Admin तक पहुँच गई। शिकायत नंबर:') + ' ' + r.complaintId, '#1b7f3b'); $('cmText').value = ''; }
      else msg('cmMsg', (r && r.message) || 'Error');
    } catch (e) { msg('cmMsg', __t('Internet चेक करके दोबारा कोशिश करें।')); }
    btn.disabled = false;
  };

  function init() {
    fillRules();
    var rec; try { rec = JSON.parse(lsGet(REC_KEY) || 'null'); } catch (e) { rec = null; }
    var h = location.hash;
    if (sess() && h !== '#verify' && h !== '#complaint') { loadDash('profile'); return; }
    sfShow('home');
    if (h === '#verify' || h === '#complaint') setTimeout(function () { var e = $(h.slice(1)); if (e) e.scrollIntoView({ behavior: 'smooth' }); }, 300);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
