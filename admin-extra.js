/* EkVeera — Admin ke naye hisse (Placement page → Admin panel):
   ✅ Approvals (ek list, ID yaad nahi rakhni) · 📨 Enquiries · 📝 Registrations · 🎓 Tution hisaab · 🧪 Admin Test · 🆘 Admin Help
   Server: EkVeera_AdminExtra.gs  (actions: adminapprovals, adminenqlist, adminregs, adminkarigardecide, adminselftest) */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function T(s) { return typeof __t === 'function' ? __t(s) : s; }
  function pw() { return window.ekveeraAdminPassword; }
  async function call(o) { o.password = pw(); try { return await vcSecurePost(o); } catch (e) { return { status: 'error', message: T('Server से जवाब नहीं मिला।') }; } }
  function inr(n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); }
  function row(l, v, b) { return '<div style="display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px solid #eef1f5;' + (b ? 'font-weight:800;' : '') + '"><span>' + esc(l) + '</span><span>' + esc(v) + '</span></div>'; }
  var BTN = 'padding:7px 12px;border-radius:8px;border:1px solid #cfd6e0;background:#fff;font-weight:700;font-size:13px;cursor:pointer;margin:4px 6px 0 0;';
  var BTN_OK = BTN.replace('background:#fff', 'background:#1b7f3b;color:#fff;border-color:#1b7f3b');
  var BTN_NO = BTN.replace('background:#fff', 'background:#fff;color:#a12a1f;border-color:#e3b3ad');

  /* ---------- 🎓 Tution ka hisaab: purane "हिसाब दिखाएँ" ke neeche jodo ---------- */
  var orig = window.rentAdminStats;
  window.rentAdminStats = async function () {
    if (orig) await orig();
    var out = document.getElementById('rentAdminOut'); if (!out) return;
    var d = await call({ action: 'tutstats' });
    if (d && d.status === 'ok') out.innerHTML += '<div style="font-weight:700;margin:16px 0 4px;">🎓 ' + esc(T('Tution — आज')) + '</div>' +
      row(T('नए Teacher Register'), d.teachersToday) + row(T('Teacher की Payment हुई (₹49)'), d.teachersPaidToday) + row(T('आज जुड़ी Skill'), d.skillsToday) + row(T('Student Order'), d.ordersToday) + row(T('Order की Payment हुई (₹29)'), d.ordersPaidToday) + row(T('आज की कमाई'), inr(d.collectedToday), true) +
      '<div style="font-weight:700;margin:10px 0 4px;">' + esc(T('कुल')) + '</div>' + row(T('चालू Teacher'), d.activeTeachers) + row(T('कुल Skill'), d.skills) + row(T('कुल Order (Payment हुई)'), d.ordersPaid) + row(T('कुल कमाई'), inr(d.collectedTotal), true);
  };

  /* ---------- Panel ka dhaancha ---------- */
  function sec(id, title, sub, inner) {
    return '<details id="' + id + '" style="border:1px solid #dfe5ee;border-radius:10px;padding:10px 14px;margin:10px 0;background:#fafbfd"><summary style="cursor:pointer;font-weight:800;font-size:14.5px">' + title + '</summary>' +
      '<p style="font-size:12.5px;color:#596579;margin:8px 0">' + sub + '</p>' + inner + '</details>';
  }
  function mount() {
    var box = document.getElementById('adminExtraBox'); if (!box || box.dataset.ok) return; box.dataset.ok = '1';
    box.innerHTML =
      sec('axApr', '✅ Approvals — जहाँ Admin की मंज़ूरी चाहिए (एक ही List)', 'Staff Profile, Staff की Edit Request, नया Phone/Login, Karigar की मंज़ूरी — सब यहीं। ID याद रखने या Box में भरने की ज़रूरत नहीं, बस बटन दबाएँ।',
        '<button class="btn btn-primary" style="width:100%;justify-content:center" onclick="axApprovals()">🔄 List दिखाएँ</button><div id="axAprOut" style="margin-top:10px;font-size:13.5px"></div>') +
      sec('axEnq', '📨 Enquiries — कितनी Enquiry आईं', 'Help पेज के Enquiry Form से जो भी आई, यहाँ दिखती है (नई पहले)।',
        '<button class="btn btn-primary" style="width:100%;justify-content:center" onclick="axEnquiries()">📨 Enquiry दिखाएँ</button><div id="axEnqOut" style="margin-top:10px;font-size:13.5px"></div>') +
      sec('axReg', '📝 Register हुए लोग', 'किसने, किस सेवा के लिए Register किया (Notification इन्हीं Mobile पर भेजे जाएँगे)।',
        '<select id="axRegFilter" style="width:100%;padding:8px;margin-bottom:8px;border:1px solid var(--line);border-radius:6px"><option value="">सभी</option><option value="training">Call Center Training</option><option value="placement">Placement</option><option value="rent">For Rent</option><option value="home">Home Service</option><option value="tution">Ekveera Tution</option></select>' +
        '<button class="btn btn-primary" style="width:100%;justify-content:center" onclick="axRegs()">📝 List दिखाएँ</button><div id="axRegOut" style="margin-top:10px;font-size:13.5px"></div>') +
      sec('axRm', '🗑️ Details हटाएँ (ID और हिसाब सुरक्षित रखकर)', 'किसी की Details हटवानी हों तो उसकी ID लिखें। पहले Preview दिखेगा, फिर पक्का करना होगा। Row delete नहीं होती — Serial Number, ID और Commission का हिसाब नहीं बिगड़ता; सिर्फ़ नाम, Mobile, Email, पता, Document जैसे खाने छुप जाते हैं और Search से हट जाते हैं।',
        '<input id="axRmId" placeholder="ID (GIV001 / KAR003 / TCH002 / Candidate ID …)" style="width:100%;padding:9px;margin-bottom:8px;border:1px solid var(--line);border-radius:6px" autocomplete="off">' +
        '<button class="btn btn-primary" style="width:100%;justify-content:center" onclick="axRmPreview()">🔍 पहले Preview देखें</button><div id="axRmOut" style="margin-top:10px;font-size:13.5px"></div>') +
      sec('axExp', '⏳ Registration खत्म होने वाली (For Rent / Home Service / Tution)', 'किसकी Registration कितने दिन में खत्म हो रही है — जल्दी खत्म होने वाली ऊपर। Excel में Download भी कर सकते हैं। रोज़ सुबह 9 बजे Email + Push Alert भी आता है।',
        '<select id="axExpDays" style="width:100%;padding:8px;margin-bottom:8px;border:1px solid var(--line);border-radius:6px"><option value="15">15 दिन में खत्म</option><option value="30" selected>30 दिन में खत्म</option><option value="60">60 दिन में खत्म</option><option value="365">पूरी List (सभी)</option></select>' +
        '<button class="btn btn-primary" style="width:100%;justify-content:center" onclick="axExpiring()">🔄 List दिखाएँ</button><div id="axExpOut" style="margin-top:10px;font-size:13.5px"></div>') +
      sec('axTest', '🧪 Admin Test — पूरी Web एक Click में जाँचें', 'हर Update के बाद यह एक बार चलाएँ: Pages, Scripts, Server, Sheets, हर नया Function — सब Pass / Fail दिखेगा। सारे पेज हाथ से खोलकर देखने की ज़रूरत नहीं।',
        '<button class="btn btn-primary" style="width:100%;justify-content:center" onclick="axRunTest()">▶️ पूरा Test चलाएँ</button><button class="btn" style="width:100%;justify-content:center;margin-top:8px;border:1px solid #cfd6e0;background:#fff" onclick="axSetupSheets()">🗂️ सारी Sheets बनाएँ / ठीक करें (Home Service, Rent, Tution, Register)</button><div id="axTestOut" style="margin-top:10px;font-size:13.5px"></div>') +
      sec('axHelp', '🆘 Admin Help — कोई काम भूल जाएँ या दिक्कत आए तो', 'Admin के काम में जो दिक्कतें आ सकती हैं, उनके हल।', helpHtml());
  }

  /* ---------- ⏳ Registration खत्म होने वाली ---------- */
  var EXP_ROWS = [];
  window.axExpiring = async function () {
    var out = document.getElementById('axExpOut'); out.textContent = T('⏳ आ रहा है...');
    var d = await call({ action: 'adminexpiring', days: document.getElementById('axExpDays').value });
    if (!d || d.status !== 'ok') { out.innerHTML = '<span style="color:#a12a1f">' + esc((d && d.message) || T('कुछ गड़बड़ हुई।')) + '</span>'; return; }
    EXP_ROWS = d.items || [];
    if (!EXP_ROWS.length) { out.textContent = T('इस अवधि में कोई Registration खत्म नहीं हो रही। ✅'); return; }
    var c = d.counts || {};
    out.innerHTML = '<p>' + esc(T('खत्म हो चुकी')) + ': <b>' + (c.expired || 0) + '</b> · 7 ' + esc(T('दिन या कम')) + ': <b>' + (c.d7 || 0) + '</b> · 8–15: <b>' + (c.d15 || 0) + '</b> · 16–30: <b>' + (c.d30 || 0) + '</b></p>' +
      '<button style="' + BTN_OK + '" onclick="axExpDownload()">⬇ Excel (CSV) Download</button>' +
      EXP_ROWS.map(function (x) {
        var col = x.daysLeft < 0 ? '#a12a1f' : (x.daysLeft <= 7 ? '#b4540a' : '#1b7f3b');
        return '<div style="padding:7px 0;border-bottom:1px solid #eef1f5"><b>' + esc(x.service) + ' · ' + esc(x.id) + '</b> — ' + esc(x.name) + ' (' + esc(x.mobile) + ')<br><span style="color:' + col + ';font-weight:700">' +
          (x.daysLeft < 0 ? esc(T('खत्म हुए ')) + (-x.daysLeft) + esc(T(' दिन हुए')) : x.daysLeft + ' ' + esc(T('दिन बचे'))) + '</span> · ' + esc(x.validTill) + '</div>';
      }).join('');
  };
  window.axExpDownload = function () {
    function q(v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    var head = ['Service', 'ID', 'Name', 'Mobile', 'Valid Till', 'Days Left', 'Staff Code'];
    var lines = [head.join(',')].concat(EXP_ROWS.map(function (x) { return [x.service, x.id, x.name, x.mobile, x.validTill, x.daysLeft, x.staff].map(q).join(','); }));
    var blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'EkVeera_Registration_Expiry_' + new Date().toISOString().slice(0, 10) + '.csv'; a.style.display = 'none';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  };

  /* ---------- 🗑️ Details हटाएँ ---------- */
  window.axRmPreview = async function () {
    var out = document.getElementById('axRmOut'), id = (document.getElementById('axRmId').value || '').trim().toUpperCase();
    if (!id) { out.textContent = T('पहले ID लिखें।'); return; }
    out.textContent = T('⏳ देखा जा रहा है...');
    var d = await call({ action: 'adminremove', id: id });
    if (!d || d.status !== 'ok') { out.innerHTML = '<span style="color:#a12a1f">' + esc((d && d.message) || T('कुछ गड़बड़ हुई।')) + '</span>'; return; }
    out.innerHTML = '<p>' + esc(d.message) + '</p>' + (d.plan || []).map(function (x) { return '<div style="padding:6px 0;border-bottom:1px solid #eef1f5"><b>' + esc(x.sheet) + '</b> (Row ' + esc(x.row) + ')<br><span style="font-size:12.5px;color:#596579">' + esc(x.columns.join(', ') || '—') + '</span></div>'; }).join('') +
      '<p style="margin:8px 0 0;font-size:13px">' + esc(T('छुपने वाले Saman/Skill: ')) + esc(d.hiddenItems || 0) + '</p>' +
      '<button style="' + BTN_NO + '" onclick="axRmDo(\'' + esc(id) + '\')">' + esc(T('⚠️ पक्का हटाएँ')) + '</button>';
  };
  window.axRmDo = async function (id) {
    if (!confirm(T('पक्का? Details वापस नहीं आएँगी (ID और हिसाब सुरक्षित रहेगा)।') + ' ' + id)) return;
    var out = document.getElementById('axRmOut'); out.textContent = T('⏳ हटाया जा रहा है...');
    var d = await call({ action: 'adminremove', id: id, confirm: '1' });
    out.innerHTML = (d && d.status === 'ok') ? '<b style="color:#1b7f3b">' + esc(d.message) + '</b>' : '<span style="color:#a12a1f">' + esc((d && d.message) || T('कुछ गड़बड़ हुई।')) + '</span>';
  };

  /* ---------- ✅ Approvals ---------- */
  var APR = {};
  window.axApprovals = async function () {
    var out = document.getElementById('axAprOut'); out.textContent = T('⏳ आ रहा है...');
    var d = await call({ action: 'adminapprovals' });
    if (!d || d.status !== 'ok') { out.style.color = 'red'; out.textContent = (d && d.message) || T('List नहीं आ पाई।'); return; }
    out.style.color = '#333'; APR = {};
    if (!d.items.length) { out.innerHTML = '<div style="padding:12px;background:#e8f6ec;border-radius:8px;font-weight:700">✅ ' + esc(T('अभी कुछ भी बाकी नहीं है।')) + '</div>'; return; }
    out.innerHTML = '<div style="font-weight:800;margin-bottom:6px">' + esc(T('कुल बाकी:')) + ' ' + d.count + '</div>' + d.items.map(function (x, i) {
      APR[i] = x;
      var b = { approve: '<button style="' + BTN_OK + '" onclick="axDecide(' + i + ',\'approve\')">✅ ' + esc(T('Approve')) + '</button>', reject: '<button style="' + BTN_NO + '" onclick="axDecide(' + i + ',\'reject\')">❌ ' + esc(T('Reject')) + '</button>',
        reopen: '<button style="' + BTN_OK + '" onclick="axDecide(' + i + ',\'reopen\')">✅ ' + esc(T('मंज़ूर — Profile खोलें')) + '</button>', denyedit: '<button style="' + BTN_NO + '" onclick="axDecide(' + i + ',\'denyedit\')">❌ ' + esc(T('मना करें')) + '</button>' };
      return '<div style="border:1px solid #e3e8ef;border-radius:10px;padding:10px 12px;margin-bottom:8px;background:#fff"><div style="font-weight:800">' + esc(x.title) + '</div><div>' + esc(x.who) + '</div><div style="color:#596579;font-size:12.5px;margin:2px 0 4px">' + esc(x.detail) + '</div>' + x.actions.map(function (a) { return b[a]; }).join('') + '</div>';
    }).join('');
  };
  window.axDecide = async function (i, dec) {
    var x = APR[i]; if (!x) return;
    var note = '';
    if (dec === 'reject') { note = prompt(T('Reject का कारण लिखें (सामने वाले को यही दिखेगा):')) || ''; if (!note.trim() && x.kind !== 'karigar') return; }
    else if (!confirm(T('पक्का?'))) return;
    var r;
    if (x.kind === 'staff' || x.kind === 'staffedit') r = await call({ action: 'sfadmindecide', staffKey: x.key, decision: dec, note: note });
    else if (x.kind === 'recovery') r = await call({ action: 'sfadminrecoverydecide', requestId: x.id, decision: dec, note: note });
    else if (x.kind === 'karigar') r = await call({ action: 'adminkarigardecide', id: x.id, decision: dec });
    if (!r || r.status !== 'ok') return alert((r && r.message) || T('काम नहीं हो पाया।'));
    window.axApprovals();
  };

  /* ---------- 📨 Enquiries ---------- */
  window.axEnquiries = async function () {
    var out = document.getElementById('axEnqOut'); out.textContent = T('⏳ आ रहा है...');
    var d = await call({ action: 'adminenqlist' });
    if (!d || d.status !== 'ok') { out.style.color = 'red'; out.textContent = (d && d.message) || T('List नहीं आ पाई।'); return; }
    out.style.color = '#333';
    out.innerHTML = '<div style="padding:10px;background:#eef6ff;border-radius:8px;font-weight:800;margin-bottom:8px">' + esc(T('कुल Enquiry:')) + ' ' + d.total + ' &nbsp;·&nbsp; ' + esc(T('आज:')) + ' ' + d.today + '</div>' +
      (d.items.length ? d.items.map(function (x) { return '<div style="border:1px solid #e3e8ef;border-radius:8px;padding:8px 10px;margin-bottom:6px;background:#fff"><b>' + esc(x.name) + '</b> · <span style="color:#1f3b63">' + esc(x.contact) + '</span> <span style="float:right;color:#8892a6;font-size:12px">' + esc(x.at) + '</span><div style="margin-top:4px">' + esc(x.message) + '</div></div>'; }).join('') : '<p>' + esc(T('अभी कोई Enquiry नहीं आई।')) + '</p>') +
      (d.total > d.items.length ? '<p style="font-size:12px;color:#596579">' + esc(T('सिर्फ़ ताज़ा 200 दिख रही हैं — बाक़ी "Enquiries" Sheet में हैं।')) + '</p>' : '');
  };

  /* ---------- 📝 Registrations ---------- */
  window.axRegs = async function () {
    var out = document.getElementById('axRegOut'); out.textContent = T('⏳ आ रहा है...');
    var d = await call({ action: 'adminregs', filter: document.getElementById('axRegFilter').value });
    if (!d || d.status !== 'ok') { out.style.color = 'red'; out.textContent = (d && d.message) || T('List नहीं आ पाई।'); return; }
    out.style.color = '#333'; var c = d.counts;
    out.innerHTML = '<div style="padding:10px;background:#eef6ff;border-radius:8px;margin-bottom:8px;line-height:1.7"><b>' + esc(T('कुल Register:')) + ' ' + c.total + '</b><br>Training ' + c.training + ' · Placement ' + c.placement + ' · For Rent ' + c.rent + ' · Home Service ' + c.home + ' · Tution ' + c.tution + '</div>' +
      (d.items.length ? '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="background:#f1f4f9"><th style="text-align:left;padding:6px">ID</th><th style="text-align:left;padding:6px">' + esc(T('नाम')) + '</th><th style="text-align:left;padding:6px">Mobile</th><th style="text-align:left;padding:6px">' + esc(T('किसके लिए')) + '</th></tr>' +
        d.items.map(function (x) { return '<tr style="border-bottom:1px solid #eef1f5"><td style="padding:6px">' + esc(x.regId) + '</td><td style="padding:6px">' + esc(x.name) + '</td><td style="padding:6px">' + esc(x.mobile) + '</td><td style="padding:6px">' + esc(x.interests) + '</td></tr>'; }).join('') + '</table></div>' : '<p>' + esc(T('अभी कोई नहीं।')) + '</p>');
  };

  /* ---------- 🧪 Admin Test ---------- */
  var FILES = [
    ['index.html', 'tution.html', 'Home पर Tution का Link'], ['index.html', 'register.html', 'Home पर Register का Link'],
    ['tution.html', 'tutRegister', 'Tution पेज'], ['tution.js', 'tutsetstatus', 'Tution — Open/Close'], ['tution.js', 'tutregister', 'Tution — Teacher Register'],
    ['register.html', 'appRegister', 'Register पेज'], ['contractor.html', 'ptpCreate', 'Contractor Payment पेज'], ['contractor.js', 'ptpubcreate', 'Contractor — Server से जुड़ाव'], ['mp-loc.js', 'MP', 'मध्य प्रदेश ज़िला/तहसील/गाँव'], ['swipe-nav.js', 'touchstart', 'Swipe से पेज बदलना'], ['ekv-scan.js', 'scanHelp', 'App Scan की मदद'], ['register.js', 'appregister', 'Register — Server से जुड़ाव'],
    ['for-rent.js', 'rentsetstatus', 'For Rent — Open/Close'], ['for-rent.js', 'rent-closed', 'For Rent — Close दिखना'],
    ['home-service.js', 'hssetstatus', 'Home Service — Open/Close'], ['home-service.js', 'hscheck', 'Home Service — कारीगर की ID जाँच'], ['home-service.html', 'idcheck', 'Home Service — ID जाँच का Section'], ['version.js', 'EKV_VERSION', 'Version दिखाना'], ['reviews.js', 'data-group', 'Review अपने-अपने पेज पर'], ['tution.js', 'planFor', 'Tution — Plan (₹49 / ₹89 / ₹299)'], ['home-service.js', 'data-kst', 'Home Service — कारीगर का Open बटन'],
    ['ekv-files.js', 'cropImage', 'Photo Crop'], ['staff-profile.js', 'sfeditreq', 'Staff — Edit की Permission'],
    ['placement.html', 'adminExtraBox', 'Admin के नए हिस्से'], ['admin-extra.js', 'adminselftest', 'Admin Test'],
    ['for-rent.html', 'tution.html', 'For Rent पेज पर Tution Link'], ['help.html', 'register.html', 'Help पेज पर Register Link']
  ];
  window.axRunTest = async function () {
    var out = document.getElementById('axTestOut'); out.style.color = '#333'; out.textContent = T('⏳ Test चल रहा है... (30 सेकंड तक लग सकते हैं)');
    var res = [];
    function add(g, n, ok, d) { res.push({ g: g, n: n, ok: !!ok, d: d || '' }); }
    var cache = {};
    async function get(f) { if (cache[f] != null) return cache[f]; try { var r = await fetch(f + (f.indexOf('?') > -1 ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' }); cache[f] = r.ok ? await r.text() : null; if (!r.ok) cache[f + '_s'] = r.status; } catch (e) { cache[f] = null; } return cache[f]; }
    /* 1) Pages load */
    var pages = ['index.html', 'training.html', 'placement.html', 'for-rent.html', 'home-service.html', 'tution.html', 'register.html', 'contractor.html', 'help.html', 'resume-builder.html', 'staff-profile.html'];
    for (var i = 0; i < pages.length; i++) { var t = await get(pages[i]); add('📄 Pages', pages[i] + ' खुलता है', t != null, t == null ? 'नहीं खुला' : ''); }
    /* 2) Page markers + scripts load */
    for (var j = 0; j < FILES.length; j++) { var f = FILES[j], tx = await get(f[0]); add('🧩 Features', f[2], tx != null && tx.indexOf(f[1]) > -1, tx == null ? f[0] + ' नहीं मिली' : (tx.indexOf(f[1]) > -1 ? '' : f[0] + ' में नया कोड नहीं मिला — पुरानी File तो नहीं?')); }
    /* 3) Scripts referenced by pages exist */
    var jsSeen = {};
    for (var k = 0; k < pages.length; k++) { var h = cache[pages[k]]; if (!h) continue; (h.match(/<script[^>]+src="([^"]+\.js)"/g) || []).forEach(function (m) { var u = m.match(/src="([^"]+)"/)[1]; if (!/^https?:/.test(u)) jsSeen[u] = pages[k]; }); }
    var jsList = Object.keys(jsSeen);
    for (var q = 0; q < jsList.length; q++) { var jt = await get(jsList[q]); add('📜 Scripts', jsList[q] + ' (' + jsSeen[jsList[q]] + ')', jt != null, jt == null ? 'File नहीं मिली — GitHub पर डालना भूल गए?' : ''); }
    /* 4) Footer */
    var ix = cache['index.html'] || '', ft = (ix.match(/<footer[\s\S]*?<\/footer>/) || [''])[0];
    add('🦶 Footer', 'नाम "Ekveera Placement & Services"', /Ekveera Placement (&amp;|&) Services/.test(ft) && !/Training Center/.test(ft), '');
    add('🦶 Footer', 'Resume / For Rent / Home Service / Help के आइकन हटे', !/(📄|🏍️|🏠|💬)\s*(Resume|For Rent|Home Service|Help)/.test(ft), '');
    add('🏷️ Version', 'Website का Version: ' + (window.EKV_VERSION || 'नहीं मिला'), !!window.EKV_VERSION, '');
    /* 5) Browser */
    try { localStorage.setItem('ekv_t', '1'); localStorage.removeItem('ekv_t'); add('🌐 Browser', 'Storage चलता है', true); } catch (e) { add('🌐 Browser', 'Storage चलता है', false, 'Private mode?'); }
    try { var reg = await navigator.serviceWorker.getRegistration(); add('🌐 Browser', 'Service Worker चालू', !!reg, reg ? '' : 'पेज एक बार Refresh करें'); } catch (e2) { add('🌐 Browser', 'Service Worker चालू', false); }
    add('🌐 Browser', 'Notification सुविधा', 'Notification' in window && 'PushManager' in window, 'Permission: ' + (window.Notification ? Notification.permission : '-'));
    add('🌐 Browser', 'Photo Crop मौजूद', !!(window.EKV_FILES && window.EKV_FILES.crop), '');
    /* 6) Server pings (public, padhne wale) */
    var pings = [['rentpubstats', 'For Rent'], ['hspubstats', 'Home Service'], ['tutpubstats', 'Tution']];
    for (var s = 0; s < pings.length; s++) { var t0 = Date.now(), r; try { r = await vcSecurePost({ action: pings[s][0] }); } catch (e3) { r = null; } add('📡 Server', pings[s][1] + ' जवाब देता है', r && r.status === 'ok', r && r.status === 'ok' ? (Date.now() - t0) + ' ms' : ((r && r.message) || 'जवाब नहीं आया')); }
    /* 7) Server ke andar ki jaanch */
    var sv = await call({ action: 'adminselftest' });
    if (sv && sv.status === 'ok') sv.results.forEach(function (x) { add('🖥️ Server — ' + x.group, x.name, x.ok, x.detail); });
    else add('🖥️ Server', 'Admin Self-Test', false, (sv && sv.message) || 'EkVeera_AdminExtra.gs जोड़कर नया Deploy किया?');
    var pass = res.filter(function (x) { return x.ok; }).length, fail = res.length - pass, groups = {}, order = [];
    res.forEach(function (x) { if (!groups[x.g]) { groups[x.g] = []; order.push(x.g); } groups[x.g].push(x); });
    var html = '<div style="padding:12px;border-radius:10px;font-weight:800;margin-bottom:10px;background:' + (fail ? '#fdecea;color:#a12a1f' : '#e8f6ec;color:#1b7f3b') + '">' + (fail ? '⚠️ ' + fail + ' ' + esc(T('चीज़ें ठीक नहीं')) : '✅ ' + esc(T('सब ठीक है'))) + ' — ' + pass + '/' + res.length + ' Pass</div>';
    order.forEach(function (g) {
      var bad = groups[g].filter(function (x) { return !x.ok; }).length;
      html += '<details ' + (bad ? 'open' : '') + ' style="margin-bottom:6px"><summary style="font-weight:700;cursor:pointer">' + esc(g) + ' ' + (bad ? '<span style="color:#a12a1f">(' + bad + ' ✖)</span>' : '<span style="color:#1b7f3b">✔</span>') + '</summary>' +
        groups[g].map(function (x) { return '<div style="padding:4px 0 4px 12px;border-bottom:1px solid #f0f2f6">' + (x.ok ? '✅' : '❌') + ' ' + esc(x.n) + (x.d ? ' <span style="color:#596579;font-size:12px">— ' + esc(x.d) + '</span>' : '') + '</div>'; }).join('') + '</details>';
    });
    html += '<button style="' + BTN + '" onclick="axCopyTest()">📋 रिपोर्ट Copy करें</button>';
    out.innerHTML = html;
    window.__axReport = res.map(function (x) { return (x.ok ? 'PASS ' : 'FAIL ') + x.g + ' | ' + x.n + (x.d ? ' | ' + x.d : ''); }).join('\n');
  };
  window.axSetupSheets = async function () {
    var out = document.getElementById('axTestOut'); out.style.color = '#333'; out.textContent = T('⏳ Sheets बनाई जा रही हैं...');
    var d = await call({ action: 'adminsetupsheets' });
    if (!d || d.status !== 'ok') { out.style.color = 'red'; out.textContent = (d && d.message) || T('काम नहीं हो पाया — EkVeera_AdminExtra.gs नया Deploy किया?'); return; }
    out.innerHTML = '<div style="padding:10px;background:#e8f6ec;border-radius:8px;font-weight:700;margin-bottom:6px">✅ ' + esc(d.message) + '</div>' + d.made.map(function (x) { return '<div>' + esc(x) + '</div>'; }).join('');
  };
  window.axCopyTest = function () { try { navigator.clipboard.writeText(window.__axReport || ''); alert(T('Copy हो गया — WhatsApp / Claude को भेज सकते हैं।')); } catch (e) { prompt(T('यह रिपोर्ट Copy करें:'), window.__axReport || ''); } };

  /* ---------- 🆘 Admin Help ---------- */
  function helpHtml() {
    var H = [
      ['Admin Password गलत / "लॉक" बता रहा है', 'कई बार गलत Password डालने पर कुछ मिनट के लिए लॉक हो जाता है — संदेश में लिखे मिनट रुकें, फिर सही Password डालें।'],
      ['Payment हो गई पर Teacher / Karigar / Giver की Entry चालू नहीं हुई', '1) संबंधित Ledger Sheet (Rent Ledger / Home Service Ledger / Tution Ledger) में Payment ID देखें। 2) नहीं है तो Razorpay में Payment और Webhook देखें। 3) WhatsApp पर "Amount Mismatch" या "Duplicate" संदेश आया हो तो रकम जाँचें / Razorpay से Refund करें। 4) मजबूरी में Sheet में "Payment Status" = Paid, "Valid Till" = आज से 1 साल बाद और "Listing Status" = Active खुद भर दें।'],
      ['"Duplicate ⚠️" या "Amount Mismatch ⚠️" का संदेश आया', 'Duplicate = एक ही ID की दोबारा Payment आई — Razorpay से Refund करें। Mismatch = रकम गलत आई (Teacher/Karigar ₹49, Student/Customer ₹29, Rent Plan ₹49/₹89/₹299) — सही रकम की Payment कराएँ या Refund दें।'],
      ['सामान Close रह गया / Giver Open नहीं कर पा रहा', 'Rent Items Sheet में उस Item ID की "Item Status" कॉलम में Open लिख दें (या खाली छोड़ दें)। Giver अपनी Giver ID + Mobile से "मेरी Listing" में खुद Open भी कर सकता है। Order की Payment होते ही सामान अपने-आप Close होता है।'],
      ['Home Service / Rent / Tution की Sheet नहीं दिख रही', 'ये Sheets पहली Entry आने पर बनती हैं। ऊपर "🧪 Admin Test" में "🗂️ सारी Sheets बनाएँ" दबाएँ — सब एक साथ बन जाएँगी। फिर भी न बने तो Apps Script में नई .gs Files जोड़ीं और "New version" Deploy किया, यह देखें; Karigar Form भरने पर Apps Script की Executions में दिखे Error बताएँ।'],
      ['कारीगर Search में नहीं दिख रहा', 'ये चारों ज़रूरी हैं: Payment हुई, Status "मंज़ूर", 1 साल पूरा नहीं हुआ, और "Availability" Open है। Availability "Closed" हो तो कारीगर अपने ID+Mobile से Open करे (या Sheet में Availability = Open लिखें)। मंज़ूरी के लिए ऊपर "✅ Approvals" देखें।'],
      ['Teacher की Skill Student को नहीं दिख रही', 'Tution Teachers Sheet में Payment Status = Paid और Valid Till आगे की तारीख हो, Tution Skills Sheet में Skill Status "Close" न हो। Teacher अपनी Teacher ID + Mobile से "मेरी Listing" में Skill Open/Close कर सकता है।'],
      ['Contractor / Party ने Website से Payment किया पर Bakaya "Paid" नहीं हुआ', 'Razorpay में Payment और Webhook देखें। Payment का Reference "DUE001" जैसा होना चाहिए। Party Dues Sheet में "Status / Paid" देखें; WhatsApp पर "अपने-आप नहीं जुड़ी" संदेश आए तो ऊपर "📝 Party" वाले बॉक्स से Payment हाथ से दर्ज करें। हर Grade का Rate "Party Rate Card" Sheet में भरें (Work Type | Rate | Active); जो Grade वहाँ नहीं है वह Contractor "Other" से खुद लिखता है और आपको WhatsApp पर "Other Rate जाँचें" आता है।'],
      ['App Scan में ❌ / ⚠️ आए', 'Scan के नीचे "🆘 गड़बड़ / Virus / Malware मिले तो क्या करें" खोलें — हर लाल निशान के सामने "👉 क्या करें" भी लिखा है। Scan खुद कोई फ़ाइल नहीं हटाता, ताकि कुछ बिगड़े नहीं; सुधार GitHub के History / Revert से करें, फिर "नया Manifest बनाएँ"।'],
      ['कारीगर की ID जाँच (ग्राहक की तरफ़ से) का Record कहाँ है', 'Sheet "Home Service Checks" में — कौन (Mobile), किस कारीगर की ID, कब, और नतीजा (सही / नाम मेल नहीं / ID नहीं मिली / मंज़ूर नहीं)। ID नहीं मिले या नाम मेल न खाए तो आपको WhatsApp पर 🚨 संदेश आता है — तुरंत उस ग्राहक को फोन करके पूछें और ज़रूरत हो तो कारीगर की ID बंद करें।'],
      ['कारीगर के Document सही हैं या नहीं — Admin कैसे जाँचे', '1) Aadhaar: कारीगर से mAadhaar App / e-Aadhaar का QR दिखवाकर Aadhaar QR Scanner से स्कैन करें — नाम, फोटो, पता Form से मिलाएँ (पूरा Aadhaar नंबर Sheet में न रखें, सिर्फ़ आख़िरी 4 अंक)। 2) पुलिस जाँच (PCC): MP Police Citizen Portal (citizen.mppolice.gov.in) से बना Character Certificate हो; उसका आवेदन / Certificate नंबर लेकर स्थानीय थाने से एक बार पूछ लें; तारीख़ 6 महीने से पुरानी न हो। 3) फोन पर Verification Call करके नंबर कारीगर का है यह पक्का करें और Video Call में चेहरा फोटो से मिलाएँ। 4) दोनों Reference को फोन करें। चारों हो जाने पर ही Sheet में "OTP Check / Aadhaar Check / PCC Check / Reference Check" में "हाँ" लिखें और फिर "✅ Approvals" से मंज़ूरी दें।'],
      ['Staff का Commission "Hold" में है', 'Staff की Profile "Approved" नहीं है। ऊपर "✅ Approvals" से Profile Approve करें — Hold अपने-आप हट जाएगा। Staff ने बदलाव माँगे हों तो भी यहीं "Permission" की Request दिखेगी।'],
      ['Staff को Document बाद में जोड़ना है', 'Staff अपने Profile पेज पर "बदलाव की Permission माँगें" दबाता है → आपके पास "✅ Approvals" में Request आती है → "मंज़ूर" करने पर उसकी Profile खुलती है। तब तक वह "Unverified" दिखता है और Commission Hold रहता है। Document जोड़कर "Admin को भेजें" दबाने पर आप दोबारा Approve करेंगे तभी Verified होगा। आपकी मंज़ूरी के बिना वह दोबारा बदलाव नहीं कर सकता।'],
      ['Staff का नया Phone / Login बदलना है', 'Staff "Recovery Request" भेजता है → "✅ Approvals" में दिखती है। पहले Staff को फोन करके पक्का करें कि वही है, फिर Approve करें। Request 48 घंटे तक मान्य रहती है।'],
      ['Staff Document Upload नहीं हो रहा', 'WhatsApp पर "Staff Document Drive में Save नहीं हो पा रहा" संदेश आए तो 3_extra/EkVeera_ResumeUploader.gs जोड़ें (guide: 08_Resume_Uploader_Guide.md) और Script Property EKV_STAFF_DOC_FOLDER_ID जाँचें।'],
      ['Push Notification नहीं जा रहा', '1) Script Property FCM_SERVICE_ACCOUNT लगी हो। 2) सामने वाले ने 🔔 चालू किया हो और Allow दिया हो (iPhone पर पहले "Add to Home Screen")। 3) उसका Mobile "Push Tokens" Sheet की Key में हो। 4) Register पेज वाले लोगों की सूची "📝 Register हुए लोग" में देखें।'],
      ['Enquiry कहाँ दिखेगी', 'ऊपर "📨 Enquiries" में — कुल, आज की और सारी Enquiry। हर नई Enquiry पर WhatsApp संदेश भी आता है।'],
      ['नया Update डाला पर पुराना पेज दिख रहा है', 'पेज को Hard Refresh करें (Ctrl+Shift+R / फोन में App बंद करके दोबारा खोलें)। फिर भी न बदले तो service-worker.js का VERSION बढ़ाकर GitHub पर डालें।'],
      ['"Security Scan" बदलाव / गड़बड़ बता रहा है', 'हर Update के बाद integrity-manifest.json भी नई बननी चाहिए (Deploy Guide का Manifest वाला Step)। पुरानी Manifest रह जाए तो Scan बदलाव दिखाता है।'],
      ['Apps Script में बदलाव लगाए पर असर नहीं दिखा', 'Apps Script में Deploy → Manage deployments → ✏️ → Version: New version → Deploy। (नई .gs File जोड़ने पर भी यही करें।)'],
      ['Sheet के कॉलम / Sheet का नाम बदल दिया', 'Sheet का नाम और कॉलम के नाम न बदलें — Code इन्हीं नामों से पढ़ता है। नया कॉलम ज़रूरत हो तो सबसे आख़िर में जोड़ें।'],
      ['Refund देना है', 'Razorpay से Refund करें, फिर "Refund दर्ज करें" वाले Admin बॉक्स में Status दर्ज करें ताकि Commission अपने-आप घट जाए।'],
      ['हर Update के बाद सब चेक करना है', 'ऊपर "🧪 Admin Test" चलाएँ — सब Page, Script, Server और Sheet एक साथ जाँच लेगा। कोई ❌ हो तो उसके सामने कारण लिखा होगा, रिपोर्ट Copy करके भेज सकते हैं।']
    ];
    return H.map(function (x) { return '<details style="border-top:1px solid #e8ecf2;padding:6px 0"><summary style="cursor:pointer;font-weight:700;font-size:13.5px">❓ ' + esc(x[0]) + '</summary><div style="padding:6px 0 4px 8px;font-size:13px;line-height:1.7;color:#333">' + esc(x[1]) + '</div></details>'; }).join('');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
