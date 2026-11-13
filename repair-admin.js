/* EkVeera — Admin: 🛠️ Repair Center (Problem likhna -> Jaanch -> Dekho -> Repair -> Verify). Apps Script: EkVeera_Repair.gs (actions rp*) */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var T = function (s) { return typeof __t === 'function' ? __t(s) : s; };
  var MSG = { id: 'rpMsg' }, data = null;
  function msg(t, bad) { var m = $('rpMsg'); if (m) { m.style.color = bad ? '#c0392b' : '#14663f'; m.textContent = t || ''; } }
  function post(o) { o.password = window.ekveeraAdminPassword; return vcSecurePost(o); }
  function badge(st) { var c = st === 'Fixed' ? '#14663f' : st === 'Needs Dev' ? '#b3541e' : st === 'Repaired (check)' ? '#2b5fd9' : '#7b5a00'; return '<span style="background:' + c + ';color:#fff;border-radius:10px;padding:2px 9px;font-size:11.5px">' + esc(T(st)) + '</span>'; }
  function out(id, html) { var o = $('rpOut_' + id); if (o) o.innerHTML = html; }
  function stepsHtml(steps) {
    return '<table style="width:100%;border-collapse:collapse;font-size:12.5px">' + steps.map(function (s) {
      return '<tr><td style="padding:4px;border-top:1px solid #e3e9ef;width:22px">' + (s.ok ? (s.changed ? '🔧' : '✅') : '❌') + '</td><td style="padding:4px;border-top:1px solid #e3e9ef"><b>' + esc(s.label) + '</b><br><span style="color:#44526b">' + esc(s.detail) + '</span></td></tr>';
    }).join('') + '</table>';
  }
  window.rpLoad = async function () {
    var lst = $('rpList'); if (!lst) return;
    try {
      var d = await post({ action: 'rplist' });
      if (!d || d.status !== 'ok') { msg((d && d.message) || T('सूची नहीं आई।'), true); return; }
      data = d;
      var sel = $('rpArea'); if (sel && !sel.options.length) Object.keys(d.areas).forEach(function (k) { var o = document.createElement('option'); o.value = k; o.textContent = d.areas[k]; sel.appendChild(o); });
      lst.innerHTML = d.rows.length ? d.rows.map(function (r) {
        var done = r.status === 'Fixed';
        return '<div style="border:1px solid var(--line,#dfe6f0);border-radius:12px;padding:10px 12px;margin:8px 0;background:#fff">' +
          '<div style="display:flex;gap:8px;justify-content:space-between;align-items:center;flex-wrap:wrap"><b>' + esc(r.id) + '</b> ' + badge(r.status) + '<span style="font-size:11.5px;color:#596579">' + esc(r.date) + '</span></div>' +
          '<div style="font-size:12.5px;color:#596579;margin-top:2px">' + esc(r.areaLabel) + (r.example ? ' · ' + esc(r.example) : '') + '</div>' +
          '<div style="font-size:13.5px;margin:6px 0">' + esc(r.note) + '</div>' +
          (r.result ? '<div style="font-size:12px;color:#44526b">🕒 ' + esc(r.lastRun) + ' — ' + esc(r.result) + '</div>' : '') +
          (done ? '' : '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">' +
            '<button type="button" class="btn" style="border:1px solid var(--line)" onclick="rpDiag(\'' + r.id + '\')">🔍 ' + esc(T('जाँच')) + '</button>' +
            '<button type="button" class="btn" style="border:1px solid var(--line)" onclick="rpRun(\'' + r.id + '\',1)">👀 ' + esc(T('देखो (कुछ बदलेगा नहीं)')) + '</button>' +
            '<button type="button" class="btn btn-primary" onclick="rpRun(\'' + r.id + '\',0)">🛠️ ' + esc(T('Repair करो')) + '</button>' +
            '<button type="button" class="btn" style="border:1px solid var(--line)" onclick="rpReport(\'' + r.id + '\')">📋 ' + esc(T('Report कॉपी')) + '</button>' +
            '<button type="button" class="btn" style="border:1px solid var(--line)" onclick="rpClose(\'' + r.id + '\',\'Fixed\')">✅ ' + esc(T('ठीक हो गया')) + '</button>' +
            '<button type="button" class="btn" style="border:1px solid var(--line)" onclick="rpClose(\'' + r.id + '\',\'Needs Dev\')">🧑‍💻 ' + esc(T('Developer को चाहिए')) + '</button></div>') +
          '<div id="rpOut_' + r.id + '" style="margin-top:8px;font-size:12.5px"></div></div>';
      }).join('') : '<p style="font-size:12.5px">' + esc(T('अभी कोई Problem दर्ज नहीं।')) + '</p>';
    } catch (e) { msg(T('Server से जवाब नहीं मिला — Internet देखें।'), true); }
  };
  window.rpSubmit = async function () {
    var note = ($('rpNote') || {}).value || '', area = ($('rpArea') || {}).value || 'other';
    if (String(note).trim().length < 5) { msg(T('थोड़ा लिखें — क्या काम नहीं कर रहा और पहले कैसे चलता था।'), true); return; }
    msg(T('⏳ दर्ज हो रहा है...'));
    try {
      var d = await post({ action: 'rpsubmit', area: area, note: note, example: ($('rpEx') || {}).value || '' });
      if (!d || d.status !== 'ok') { msg((d && d.message) || T('दर्ज नहीं हुआ।'), true); return; }
      $('rpNote').value = ''; $('rpEx').value = ''; msg('✅ ' + d.id + ' ' + T('दर्ज हो गया — अब नीचे "जाँच" दबाएँ।')); rpLoad();
    } catch (e) { msg(T('Server से जवाब नहीं मिला — Internet देखें।'), true); }
  };
  window.rpDiag = async function (id) {
    var r = (data && data.rows || []).filter(function (x) { return x.id === id; })[0] || {};
    out(id, '⏳ ...');
    var d = await post({ action: 'rpdiag', id: id, example: r.example || '' });
    if (!d || d.status !== 'ok') { out(id, '<span style="color:#c0392b">' + esc((d && d.message) || T('जाँच नहीं हो पाई।')) + '</span>'); return; }
    var h = '<b>' + esc(T('Self-Test')) + ':</b> ' + d.diag.pass + '/' + d.diag.total + ' ' + esc(T('ठीक')) + ', <b style="color:' + (d.diag.fail ? '#c0392b' : '#14663f') + '">' + d.diag.fail + ' ' + esc(T('में दिक्कत')) + '</b>';
    if (d.diag.fails.length) h += '<ul style="margin:6px 0 0 18px">' + d.diag.fails.map(function (f) { return '<li>[' + esc(f.group) + '] ' + esc(f.name) + (f.detail ? ' — <span style="color:#44526b">' + esc(f.detail) + '</span>' : '') + '</li>'; }).join('') + '</ul>';
    if (d.find) h += '<p style="font-weight:700;margin:10px 0 2px">' + esc(r.example) + ' ' + esc(T('कहाँ-कहाँ मिला')) + ':</p><ul style="margin:0 0 0 18px">' + d.find.map(function (x) { return '<li>' + (x.found ? '✅' : '—') + ' ' + esc(x.sheet) + ': ' + esc(x.note) + '</li>'; }).join('') + '</ul>';
    out(id, h); rpLoad2(id, h);
  };
  function rpLoad2() { /* जाँच का नतीजा Screen पर बना रहे — सूची दोबारा नहीं खींचते */ }
  window.rpRun = async function (id, dry) {
    if (!dry && !confirm(T('Repair चलाएँ? कोई Data Delete नहीं होता — सिर्फ़ Cache साफ़, कम Column/Header जोड़ना जैसे सुरक्षित काम होंगे।'))) return;
    out(id, '⏳ ...');
    var d = await post({ action: 'rprun', id: id, dry: dry ? '1' : '0' });
    if (!d || d.status !== 'ok') { out(id, '<span style="color:#c0392b">' + esc((d && d.message) || T('Repair नहीं हो पाया।')) + '</span>'); return; }
    var h = '<b>' + esc(dry ? T('👀 देखा — कुछ बदला नहीं:') : T('🛠️ Repair हो गया:')) + '</b>' + stepsHtml(d.steps);
    if (!dry && d.before && d.after) h += '<p style="margin:8px 0 0"><b>✅ ' + esc(T('जाँच')) + ':</b> ' + d.before.fail + ' → <b style="color:' + (d.after.fail ? '#b3541e' : '#14663f') + '">' + d.after.fail + '</b> ' + esc(T('में दिक्कत')) + '. ' + esc(d.after.fail ? T('अब वह काम खुद चलाकर देखें; न चले तो "Developer को चाहिए" दबाकर Report भेजें।') : T('अब वह काम खुद चलाकर देखें; चले तो "ठीक हो गया" दबाएँ।')) + '</p>';
    if (dry) h += '<p style="margin:8px 0 0">' + esc(T('ठीक लगे तो "Repair करो" दबाएँ।')) + '</p>';
    out(id, h); if (!dry) setTimeout(rpLoad, 400);
  };
  window.rpReport = async function (id) {
    var d = await post({ action: 'rpreport', id: id });
    if (!d || d.status !== 'ok') { out(id, esc((d && d.message) || '')); return; }
    try { await navigator.clipboard.writeText(d.text); out(id, '<b>📋 ' + esc(T('Report कॉपी हो गई — Developer / Claude को भेज दें:')) + '</b><pre style="white-space:pre-wrap;background:#f4f7fb;padding:8px;border-radius:8px;max-height:260px;overflow:auto">' + esc(d.text) + '</pre>'); }
    catch (e) { out(id, '<pre style="white-space:pre-wrap;background:#f4f7fb;padding:8px;border-radius:8px;max-height:260px;overflow:auto" id="rpTxt_' + id + '">' + esc(d.text) + '</pre><p>' + esc(T('ऊपर का Text चुनकर कॉपी करें।')) + '</p>'); }
  };
  window.rpClose = async function (id, st) {
    var d = await post({ action: 'rpclose', id: id, result: st });
    if (d && d.status === 'ok') rpLoad(); else msg((d && d.message) || '', true);
  };
  window.rpClearBrowser = async function () {
    try {
      if ('serviceWorker' in navigator) { var rs = await navigator.serviceWorker.getRegistrations(); for (var i = 0; i < rs.length; i++) await rs[i].unregister(); }
      if (window.caches) { var ks = await caches.keys(); for (var j = 0; j < ks.length; j++) await caches.delete(ks[j]); }
      msg(T('✅ इस Browser का पुराना Cache साफ़ — Page दोबारा खुल रहा है...'));
      setTimeout(function () { location.reload(); }, 900);
    } catch (e) { msg(T('Cache साफ़ नहीं हो पाया।'), true); }
  };
})();
