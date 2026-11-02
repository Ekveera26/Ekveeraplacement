/* EkVeera — 📣 Outreach (सिर्फ़ Anak-01 / Pankaj-01): State चुनो → Company/School/College के PUBLIC Business Email डालो → रोज़ की सीमा तक Mail भेजो।
   Server: EkVeera_Outreach.gs (outinfo / outadd / outlist / outsend). Candidate का कोई Data Mail में नहीं जाता। */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function auth() { return { staff: typeof ekveeraStaffName !== 'undefined' ? ekveeraStaffName : '', password: typeof ekveeraStaffPassword !== 'undefined' ? ekveeraStaffPassword : '' }; }
  var STATES = ['Madhya Pradesh', 'Maharashtra', 'Gujarat', 'Uttar Pradesh', 'Rajasthan', 'Chhattisgarh', 'Bihar', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Punjab', 'Haryana', 'Odisha', 'Jharkhand', 'Other'];
  var info = null;
  function msg(t, ok) { var m = $('ouMsg'); if (!m) return; m.style.color = ok ? '#1b7f3b' : '#a12a1f'; m.textContent = t; }
  function curState() { var s = $('ouState'); return s ? (s.value === 'Other' ? ($('ouOther').value || '').trim() : s.value) : ''; }
  function searchLink() {
    var st = curState(), ty = ($('ouType') || {}).value || 'Company';
    return 'https://www.google.com/search?q=' + encodeURIComponent(st + ' ' + (($('ouInd') || {}).value || '') + ' ' + ty + ' HR careers contact email official website');
  }
  function render() {
    var box = $('staffOutBox'); if (!box || !info) return;
    var rows = (info.states || []).map(function (s) { return '<tr><td>' + esc(s.state) + '</td><td style="text-align:center">' + s.New + '</td><td style="text-align:center">' + s.Sent + '</td><td style="text-align:center">' + s.Other + '</td></tr>'; }).join('');
    box.style.display = 'block';
    box.innerHTML = '<h3 style="margin:0 0 4px;font-size:16px">📣 ' + esc(__t('Company / School / College को Mail')) + '</h3>' +
      '<p style="font-size:12.5px;color:#596579;margin:0 0 8px">' + esc(__t('सिर्फ़ उन्हीं के Business Email डालें जो उनकी Official Website / सरकारी Portal पर सबके लिए लिखे हों (Gmail/Yahoo जैसे Personal Email नहीं चलेंगे)। हर Email के साथ वह Source Link देना ज़रूरी है। Candidate का कोई Data Mail में नहीं जाता।')) + '</p>' +
      '<div style="font-weight:700;font-size:13px;margin-bottom:6px">' + esc(__t('आज')) + ': ' + info.today + '/' + info.cap + ' · ' + esc(__t('अभी भेज सकते हैं')) + ': ' + info.left + '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">' +
      '<select id="ouState" style="padding:9px;border:1px solid #cfd8e1;border-radius:8px">' + STATES.map(function (s) { return '<option>' + esc(s) + '</option>'; }).join('') + '</select>' +
      '<input id="ouOther" placeholder="State" maxlength="40" style="display:none;padding:9px;border:1px solid #cfd8e1;border-radius:8px;width:120px">' +
      '<select id="ouType" style="padding:9px;border:1px solid #cfd8e1;border-radius:8px"><option value="Company">Company</option><option value="School">School</option><option value="College">College</option></select>' +
      '<select id="ouInd" style="padding:9px;border:1px solid #cfd8e1;border-radius:8px"><option value="">' + esc(__t('सभी Industry')) + '</option>' + (info.industries || []).map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('') + '</select>' +
      '<input id="ouFrom" type="email" placeholder="' + esc(__t('Sender Mail ID (खाली = Default)')) + '" maxlength="80" style="padding:9px;border:1px solid #cfd8e1;border-radius:8px;min-width:200px">' +
      '<a id="ouSearch" target="_blank" rel="noopener" class="btn" style="padding:8px 12px;border:1px solid var(--line);font-size:13px">🔎 ' + esc(__t('Google पर खोजें')) + '</a></div>' +
      '<textarea id="ouLines" rows="5" placeholder="' + esc(__t('हर Line में:  नाम, email, Source Link\nजैसे:  ABC Pvt Ltd, hr@abc.com, https://abc.com/contact')) + '" style="width:100%;box-sizing:border-box;padding:9px;border:1px solid #cfd8e1;border-radius:8px;font-size:13px"></textarea>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><button id="ouAdd" class="btn btn-primary" style="padding:9px 14px">➕ ' + esc(__t('Lead जोड़ें')) + '</button>' +
      '<button id="ouSend" class="btn" style="padding:9px 14px;background:#1b7f3b;color:#fff;border:0">📤 ' + esc(__t('इस State को Mail भेजो')) + '</button></div>' +
      '<div id="ouMsg" style="margin-top:8px;font-weight:700;font-size:13.5px"></div><div id="ouSkip" style="font-size:12.5px;color:#a12a1f"></div>' +
      '<div style="font-weight:800;margin:12px 0 4px">' + esc(__t('State-वार स्थिति')) + '</div>' +
      '<table style="width:100%;font-size:13px;border-collapse:collapse"><tr style="background:#eef2f6"><th align="left">State</th><th>New</th><th>Sent</th><th>Other</th></tr>' + (rows || '<tr><td colspan="4" style="color:#596579">' + esc(__t('अभी कोई Lead नहीं')) + '</td></tr>') + '</table>';
    var up = function () { $('ouOther').style.display = $('ouState').value === 'Other' ? '' : 'none'; $('ouSearch').href = searchLink(); };
    $('ouState').onchange = up; $('ouType').onchange = up; $('ouInd').onchange = up; $('ouOther').oninput = up; up();
    $('ouAdd').onclick = add; $('ouSend').onclick = send;
  }
  async function call(action, extra) { var d = null; try { d = await vcSecurePost(Object.assign({ action: action }, auth(), extra || {})); } catch (e) { d = null; } return d; }
  async function load() {
    var box = $('staffOutBox'); if (!box) return;
    var a = auth(); if (!a.staff) return;
    var d = await call('outinfo');
    if (!d || d.status !== 'ok') { box.style.display = 'none'; return; }          // दूसरे Staff को यह बॉक्स दिखता ही नहीं
    info = d; render();
  }
  async function add() {
    var st = curState(); if (!st) return msg(__t('State लिखें।'));
    var btn = $('ouAdd'); btn.disabled = true; msg(__t('⏳ जोड़ा जा रहा है...'), true);
    var d = await call('outadd', { state: st, type: $('ouType').value, industry: $('ouInd').value, lines: $('ouLines').value });
    btn.disabled = false;
    if (!d || d.status !== 'ok') return msg((d && d.message) || __t('Server से जवाब नहीं मिला।'));
    msg(d.message, true); $('ouSkip').innerHTML = (d.skipped || []).map(esc).join('<br>');
    if (d.added) $('ouLines').value = '';
    var keep = $('ouSkip').innerHTML; await load(); if ($('ouSkip')) $('ouSkip').innerHTML = keep; msg(d.message, true);
  }
  async function send() {
    var st = curState(); if (!st) return msg(__t('State लिखें।'));
    if (!window.confirm(__t('इस State की "New" Leads को अभी Mail भेजें? (रोज़ की सीमा तक ही जाएगी)'))) return;
    var btn = $('ouSend'); btn.disabled = true; msg(__t('⏳ Mail भेजी जा रही हैं... (थोड़ा समय लगेगा, पेज बंद न करें)'), true);
    var d = await call('outsend', { state: st, industry: $('ouInd').value, from: $('ouFrom').value.trim() });
    btn.disabled = false;
    if (!d || d.status !== 'ok') return msg((d && d.message) || __t('Server से जवाब नहीं मिला।'));
    await load(); msg(d.message, true);
  }
  function hook() {
    if (typeof window.loadMyPerformance !== 'function' || window.loadMyPerformance.__ou) return;
    var orig = window.loadMyPerformance;
    window.loadMyPerformance = async function (isLogin) { var r = await orig.apply(this, arguments); if (isLogin) { ensure(); load(); } return r; };
    window.loadMyPerformance.__ou = 1;
  }
  function ensure() {
    var host = $('staffDataBox'); if (!host || $('staffOutBox')) return;
    var b = document.createElement('div'); b.id = 'staffOutBox'; b.style.cssText = 'display:none;margin-top:16px;padding:14px;border:1.5px solid #d9e1e8;border-radius:12px;background:#fafbfd'; host.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else hook();
  setTimeout(hook, 900);
})();
