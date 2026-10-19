/* EkVeera — Admin: Staff Profiles Approve / Documents / Recovery / Shikayat (Placement page ka Admin Panel) */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var COL = { Pending: '#b26a00', Approved: '#1b7f3b', Draft: '#6b778c', Rejected: '#c0392b', Suspended: '#7a1f1f', None: '#9aa5b8' };
  var LAB = { Pending: 'जाँच बाकी', Approved: 'Approved', Draft: 'अधूरी', Rejected: 'बदलाव माँगे', Suspended: 'Suspended', None: 'Profile नहीं बनी' };
  function call(a, p) { var q = { action: a, password: ekveeraAdminPassword }; for (var k in p) q[k] = p[k]; return vcSecurePost(q); }
  function box(h) { $('sfAdminBox').innerHTML = h; }

  window.sfAdminLoad = async function () {
    box('<p>⏳ ...</p>');
    try {
      var d = await call('sfadminlist', {});
      if (!d || d.status !== 'ok') return box('<p style="color:#c0392b;">' + esc((d && d.message) || 'Error') + '</p>');
      var c = d.counts || {};
      var h = '<p><b>⏳ जाँच बाकी: ' + (c.Pending || 0) + '</b> · ✅ Approved: ' + (c.Approved || 0) + ' · अधूरी: ' + (c.Draft || 0) + ' · Profile नहीं बनी: ' + (c.None || 0) + (d.pendingRecovery ? ' · <b style="color:#b26a00;">🔑 Recovery: ' + d.pendingRecovery + '</b>' : '') + (d.newComplaints ? ' · <b style="color:#c0392b;">🚨 नई शिकायत: ' + d.newComplaints + '</b>' : '') + '</p>' +
        '<p style="font-size:12px;color:#596579;">Commission Hold: ' + (d.enforceHold ? 'चालू (बिना Approve के Commission नहीं जाएगा)' : 'बंद') + '</p>';
      h += d.items.map(function (r, i) {
        return '<div class="sf-adm-row" onclick="sfAdminOpen(\'' + esc(r.key) + '\')"><div><b>' + esc(r.staffId) + '</b> — ' + esc(r.name || r.listName || '') + (r.under ? ' <small>(Under: ' + esc(r.under) + ')</small>' : '') + '<br><small>' + (r.mobile ? esc(r.mobile) + ' · ' : '') + 'Docs ' + esc(r.docs) + (r.submittedAt ? ' · ' + esc(r.submittedAt) : '') + '</small></div><span class="sf-pill" style="background:' + (COL[r.status] || '#333') + '">' + esc(LAB[r.status] || r.status) + '</span></div>';
      }).join('');
      box(h);
    } catch (e) { box('<p style="color:#c0392b;">Internet?</p>'); }
  };

  window.sfAdminOpen = async function (key) {
    box('<p>⏳ ...</p>');
    try {
      var d = await call('sfadmindetail', { staffKey: key });
      if (!d || d.status !== 'ok') return box('<p style="color:#c0392b;">' + esc((d && d.message) || 'Profile नहीं बनी') + ' <a href="#" onclick="sfAdminLoad();return false;">← वापस</a></p>');
      var p = d.profile, row = function (a, b) { return '<tr><td>' + esc(a) + '</td><td>' + b + '</td></tr>'; };
      var h = '<p><a href="#" onclick="sfAdminLoad();return false;">← सूची पर वापस</a></p><div class="sf-adm-detail"><table>' +
        row('Staff ID', '<b>' + esc(p.staffId) + '</b> <span class="sf-pill" style="background:' + (COL[p.status] || '#333') + '">' + esc(LAB[p.status] || p.status) + '</span>') +
        row('नाम (Profile)', esc(p.name) + (p.nameMismatch ? ' <b style="color:#c0392b;">⚠️ Staff List का नाम: ' + esc(p.listName) + '</b>' : '')) +
        row('Under', esc(p.under || '—')) + row('Mobile', esc(p.mobile)) + row('Recovery Mobile', esc(p.altMobile)) + row('Email', esc(p.email)) + row('जन्म तारीख', esc(p.dob)) +
        row('पता', esc(p.address) + ', ' + esc(p.city)) + row('ID Proof', esc(p.idType) + ' ••••' + esc(p.idLast4)) + row('UPI / Bank', esc(p.upi || '—')) +
        row('घोषणाएँ', 'नियम ' + esc(p.rulesVersion) + ' · ' + esc(p.rulesAt) + ' (पैसा-नियम + सही Document + बाकी नियम — तीनों माने)') +
        row('बनी / भेजी', esc(p.createdAt) + ' / ' + esc(p.submittedAt || '—')) + row('ID Card Code', esc(p.cardCode || '—') + (p.cardIssuedAt ? ' · ' + esc(p.cardIssuedAt) : '')) +
        row('पिछला Login', esc(p.lastLogin || '—')) + row('Admin Note', esc(p.adminNote || '—')) + '</table></div>';
      h += '<p style="font-weight:700;margin:8px 0 4px;">📎 Documents</p>' + d.docs.map(function (x) {
        return '<div class="sf-adm-row" style="cursor:default;"><span>' + (x.uploaded ? '✅' : (x.required ? '❌' : '—')) + ' ' + esc(x.label) + (x.required ? ' *' : '') + '</span>' + (x.uploaded ? '<button class="btn btn-primary" style="padding:5px 12px;font-size:12px;" onclick="sfAdminDoc(\'' + esc(p.key) + '\',\'' + x.type + '\')">देखें</button>' : '') + '</div>';
      }).join('');
      h += '<div id="sfDocView"></div><p style="font-weight:700;margin:8px 0 4px;">📱 Devices</p>' + (d.devices.length ? d.devices.map(function (x) { return '<div class="sf-adm-row" style="cursor:default;"><span>' + esc(x.label || '—') + '</span><small>' + esc(x.status) + ' · ' + esc(x.addedAt) + '</small></div>'; }).join('') : '<p class="sf-small">—</p>');
      var k = esc(p.key), b = function (act, label, bg) { return '<button style="background:' + bg + ';color:#fff;border:0;border-radius:8px;padding:8px 13px;font-weight:700;cursor:pointer;" onclick="sfAdminAct(\'' + k + '\',\'' + act + '\')">' + label + '</button>'; };
      h += '<p style="font-weight:700;margin:12px 0 4px;">कार्रवाई</p><div style="display:flex;gap:6px;flex-wrap:wrap;">';
      if (p.status === 'Pending') h += b('approve', '✔ Approve + ID Card', '#1b7f3b') + b('reject', '✖ बदलाव माँगें', '#c0392b');
      if (p.status === 'Approved') h += b('reopen', '✏️ Edit के लिए खोलें', '#0b5ed7') + b('suspend', '⛔ Suspend', '#7a1f1f');
      if (p.status === 'Suspended') h += b('reinstate', '↩ वापस चालू', '#1b7f3b');
      h += b('reset', '🗑 Profile मिटाएँ (Reset)', '#6b778c') + '</div><p class="sf-small">Approve से पहले: Documents की फोटो में नाम / ID असली लग रही है? Profile की फोटो और ID की फोटो एक ही व्यक्ति की है? Staff List का नाम मिलता है?</p>';
      box(h);
    } catch (e) { box('<p style="color:#c0392b;">Internet?</p>'); }
  };

  window.sfAdminDoc = async function (key, type) {
    var v = $('sfDocView'); v.innerHTML = '<p>⏳ ...</p>';
    try {
      var d = await call('sfadmindoc', { staffKey: key, docType: type });
      if (!d || d.status !== 'ok') { v.innerHTML = '<p style="color:#c0392b;">' + esc((d && d.message) || 'Error') + '</p>'; return; }
      var uri = 'data:' + d.mime + ';base64,' + d.data;
      v.innerHTML = d.mime === 'application/pdf' ? '<p><a href="' + uri + '" download="' + esc(d.name) + '" class="btn btn-primary">⬇ PDF खोलें / Download</a></p>' : '<img src="' + uri + '" alt="" style="max-width:100%;border:2px solid #0B1F3A;border-radius:10px;margin:6px 0;">';
    } catch (e) { v.innerHTML = '<p style="color:#c0392b;">Internet?</p>'; }
  };

  window.sfAdminAct = async function (key, act) {
    var p = { staffKey: key, decision: act };
    if (act === 'approve') { var dz = prompt('इस Staff का पद (Designation) लिखें — ID Card पर छपेगा:', 'Staff Executive'); if (dz === null) return; p.designation = dz; p.note = ''; }
    else if (act === 'reject') { var n = prompt('क्या सुधारना है? (Staff को यही दिखेगा):', ''); if (!n) return; p.note = n; }
    else if (act === 'reopen') { var n2 = prompt('कारण (Staff को दिखेगा):', 'नए Documents / सुधार के लिए खोली गई'); if (n2 === null) return; p.note = n2; }
    else if (act === 'suspend') { var n3 = prompt('Suspend का कारण (सिर्फ़ आपके रिकॉर्ड के लिए):', ''); if (n3 === null) return; p.note = n3; }
    else if (act === 'reset') { if (!confirm('पूरी Profile और Devices मिट जाएँगे (Documents Drive में रहेंगे)। पक्का?')) return; p.confirm = 'yes'; }
    try {
      var d = await call('sfadmindecide', p);
      if (d && d.status === 'ok') { act === 'reset' ? sfAdminLoad() : sfAdminOpen(key); } else alert((d && d.message) || 'Error');
    } catch (e) { alert('Internet?'); }
  };

  /* ---- 🔧 System Check ---- */
  window.ekvSysCheck = async function () {
    var b = $('ekvSysBox'); b.innerHTML = '<p>⏳ ...</p>';
    try {
      var d = await call('admincheckstorage', {});
      if (!d || d.status !== 'ok') { b.innerHTML = '<p style="color:#c0392b;">' + esc((d && d.message) || 'Error') + '</p>'; return; }
      var line = function (ok, t) { return '<div class="scan-l ' + (ok === true ? 'ok' : ok === false ? 'bad' : 'warn') + '">' + (ok === true ? '✅' : ok === false ? '❌' : '⚠️') + ' ' + esc(t) + '</div>'; };
      b.innerHTML = line(d.resumeWorks, d.resumeWorks ? 'Resume / Documents Drive में Save हो पाएँगे' : 'अभी Resume Drive में Save नहीं हो पाएगा (Backup में सुरक्षित रहेगा) — Resume Uploader जोड़ें (guide: 08_Resume_Uploader_Guide)') +
        line(d.uploader.configured ? d.uploader.ok : null, d.uploader.msg) + line(d.drive.ok ? true : null, d.drive.msg) +
        line(d.pendingResumes ? null : true, d.pendingResumes ? 'Backup में ' + d.pendingResumes + ' Resume Drive में जाने का इंतज़ार कर रहे हैं' : 'कोई Resume अटका नहीं है') +
        line(d.mailQuota > 15 ? true : null, 'आज की बची Mail: ' + d.mailQuota);
    } catch (e) { b.innerHTML = '<p style="color:#c0392b;">Internet?</p>'; }
  };
  window.ekvSysSync = async function () {
    var b = $('ekvSysBox'); b.innerHTML = '<p>⏳ Resume भेजे जा रहे हैं...</p>';
    try {
      var d = await call('adminresumesync', {});
      b.innerHTML = (d && d.status === 'ok') ? '<div class="scan-l ' + (d.left ? 'warn' : 'ok') + '">' + (d.left ? '⚠️' : '✅') + ' ' + d.done + ' Resume Drive में लग गए' + (d.left ? ' — ' + d.left + ' अभी भी बाकी (Drive / Uploader चेक करें)' : ' — कोई बाकी नहीं') + '</div>' : '<p style="color:#c0392b;">' + esc((d && d.message) || 'Error') + '</p>';
    } catch (e) { b.innerHTML = '<p style="color:#c0392b;">Internet?</p>'; }
  };

  window.sfAdminRecovery = async function () {
    box('<p>⏳ ...</p>');
    try {
      var d = await call('sfadminrecovery', {});
      if (!d || d.status !== 'ok') return box('<p style="color:#c0392b;">' + esc((d && d.message) || 'Error') + '</p>');
      if (!d.items.length) return box('<p>कोई Recovery Request नहीं।</p>');
      box('<p class="sf-small">⚠️ Approve करने से पहले Staff को उसके पुराने Mobile / Recovery Mobile पर फोन करके पक्का करें कि वही माँग रहा है।</p>' + d.items.map(function (r) {
        return '<div class="sf-adm-detail"><b>' + esc(r.id) + '</b> — ' + esc(r.staffId) + ' (' + esc(r.name) + ') <span class="sf-pill" style="background:' + (r.status === 'Pending' ? '#b26a00' : r.status === 'Approved' ? '#1b7f3b' : '#6b778c') + '">' + esc(r.status) + '</span><br>' + esc(r.type) + ' · ' + esc(r.at) + '<br>📞 पुराना Mobile: <b>' + esc(r.mobile) + '</b> · Recovery: <b>' + esc(r.altMobile) + '</b><br><small>नया Device: ' + esc(r.device) + (r.note ? ' · ' + esc(r.note) : '') + (r.expires ? ' · समय सीमा: ' + esc(r.expires) : '') + '</small>' +
          (r.status === 'Pending' ? '<div style="display:flex;gap:6px;margin-top:6px;"><button style="background:#1b7f3b;color:#fff;border:0;border-radius:8px;padding:7px 12px;font-weight:700;cursor:pointer;" onclick="sfAdminRec(\'' + esc(r.id) + '\',\'approve\')">✔ मंज़ूर (48 घंटे)</button><button style="background:#c0392b;color:#fff;border:0;border-radius:8px;padding:7px 12px;font-weight:700;cursor:pointer;" onclick="sfAdminRec(\'' + esc(r.id) + '\',\'reject\')">✖ मना करें</button></div>' : '') + '</div>';
      }).join(''));
    } catch (e) { box('<p style="color:#c0392b;">Internet?</p>'); }
  };
  window.sfAdminRec = async function (id, dec) {
    var note = dec === 'reject' ? (prompt('कारण:', '') || '') : '';
    try { var d = await call('sfadminrecoverydecide', { requestId: id, decision: dec, note: note }); if (d && d.status === 'ok') sfAdminRecovery(); else alert((d && d.message) || 'Error'); } catch (e) { alert('Internet?'); }
  };

  window.sfAdminComplaints = async function () {
    box('<p>⏳ ...</p>');
    try {
      var d = await call('sfadmincomplaints', {});
      if (!d || d.status !== 'ok') return box('<p style="color:#c0392b;">' + esc((d && d.message) || 'Error') + '</p>');
      if (!d.items.length) return box('<p>कोई शिकायत नहीं।</p>');
      box('<p class="sf-small">🔒 ये शिकायतें सिर्फ़ आपको (Admin को) दिखती हैं।</p>' + d.items.map(function (r) {
        return '<div class="sf-adm-detail"><b>' + esc(r.id) + '</b> <span class="sf-pill" style="background:' + (r.status === 'New' ? '#c0392b' : r.status === 'Closed' ? '#6b778c' : '#1b7f3b') + '">' + esc(r.status) + '</span> · ' + esc(r.at) + '<br>किसने: <b>' + esc(r.byType) + '</b> ' + esc(r.byName) + (r.byMobile ? ' · 📞 ' + esc(r.byMobile) : '') + '<br>किस Staff की: <b>' + esc(r.against || '—') + '</b><p style="margin:6px 0;">' + esc(r.text) + '</p>' + (r.note ? '<small>आपका Note: ' + esc(r.note) + '</small><br>' : '') +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;"><button class="btn" style="padding:5px 11px;font-size:12px;background:#eef6ff;border:1px solid #9fd3ff;" onclick="sfAdminCmp(\'' + esc(r.id) + '\',\'Seen\')">देख ली</button><button class="btn" style="padding:5px 11px;font-size:12px;background:#eaf6ee;border:1px solid #8fd6a8;" onclick="sfAdminCmp(\'' + esc(r.id) + '\',\'Action Taken\')">कार्रवाई हुई</button><button class="btn" style="padding:5px 11px;font-size:12px;background:#f1f4f9;border:1px solid #cfd6e0;" onclick="sfAdminCmp(\'' + esc(r.id) + '\',\'Closed\')">बंद</button></div></div>';
      }).join(''));
    } catch (e) { box('<p style="color:#c0392b;">Internet?</p>'); }
  };
  window.sfAdminCmp = async function (id, st) {
    var note = prompt('Note (वैकल्पिक):', '') || '';
    try { var d = await call('sfadmincomplaintdecide', { complaintId: id, decision: st, note: note }); if (d && d.status === 'ok') sfAdminComplaints(); else alert((d && d.message) || 'Error'); } catch (e) { alert('Internet?'); }
  };
})();
