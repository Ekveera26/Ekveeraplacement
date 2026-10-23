/* EkVeera — 👥 "मेरी Team": 01 Staff (जैसे Anak-01, Pankaj-01) अपने ?staffview=... पेज पर अपने Password से नया Staff (02) जोड़े।
   Server: EkVeera_StaffTeam.gs (staffteamlist / staffteamadd). यह फ़ाइल app.js और staff-pay.js के बाद चलती है।
   • 02 Staff को यह बॉक्स नहीं दिखता (सिर्फ़ 01 Team जोड़ सकता है)  • ID अपने-आप: Naam-<01 का नाम>-02 (जैसे Sudhir-Pankaj-02) */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function base() { return location.origin + location.pathname.replace(/[^\/]*$/, ''); }
  function auth() { return { staff: typeof ekveeraStaffName !== 'undefined' ? ekveeraStaffName : '', password: typeof ekveeraStaffPassword !== 'undefined' ? ekveeraStaffPassword : '', base: base() }; }
  function copy(text, btn) {
    var ok = function () { if (!btn) return; var o = btn.textContent; btn.textContent = __t('✅ Copy हो गया'); setTimeout(function () { btn.textContent = o; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, function () { window.prompt(__t('Link Copy करें:'), text); }); else window.prompt(__t('Link Copy करें:'), text);
  }
  function memberCard(m, hl) {
    var wa = 'https://wa.me/?text=' + encodeURIComponent(__t('EkVeera Placement & Services — Training, Job Placement, For Rent, Home Service और Tution, सब एक ही जगह। यह Link खोलें:') + ' ' + m.links.main);
    return '<div style="border:' + (hl ? '2px solid #2e9b57;background:#e7f7ee' : '1px solid #d9e1e8;background:#fff') + ';border-radius:10px;padding:10px;margin:8px 0">' +
      '<div style="font-weight:800">' + esc(m.id) + (m.name ? ' — ' + esc(m.name) : '') + '</div>' +
      '<div style="display:flex;gap:6px;align-items:center;margin-top:6px"><input readonly value="' + esc(m.links.main) + '" onclick="this.select()" style="flex:1;min-width:0;padding:7px;border:1px solid var(--line);border-radius:6px;font-size:12.5px;background:#fff">' +
      '<button type="button" data-st-copy="' + esc(m.links.main) + '" class="btn" style="padding:6px 12px;font-size:12.5px;border:1px solid var(--line)">📋 Copy</button></div>' +
      '<a class="btn btn-primary" target="_blank" rel="noopener" href="' + wa + '" style="margin-top:8px;padding:6px 12px;font-size:12.5px;display:inline-flex">💬 ' + esc(__t('WhatsApp पर भेजें')) + '</a></div>';
  }
  function render(d) {
    var box = $('staffTeamBox'); if (!box) return;
    if (!d || d.status !== 'ok' || !d.canAdd) { box.style.display = 'none'; return; }                  // 02 Staff / गड़बड़ — कुछ नहीं दिखाना
    box.style.display = 'block';
    box.innerHTML = '<h3 style="margin:0 0 4px;font-size:16px">👥 ' + esc(__t('मेरी Team')) + ' <span style="font-size:12px;color:#596579;font-weight:600">(' + esc(d.staff) + ')</span></h3>' +
      '<p style="font-size:12.5px;color:#596579;margin:0 0 8px">' + esc(__t('अपनी Team में नया Staff जोड़ें। उसका Link अलग बनेगा; उसके हर Payment का हिस्सा: उसे आधा, आपको बचे का आधा, बाकी Admin को।')) + '</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><input id="stNm" maxlength="60" placeholder="' + esc(__t('नए Staff का नाम')) + '" style="flex:1;min-width:160px;padding:9px;border:1px solid var(--line);border-radius:6px">' +
      '<button id="stBtn" class="btn btn-primary" onclick="stTeamAdd()" style="padding:9px 14px">➕ ' + esc(__t('Team में जोड़ें')) + '</button></div>' +
      '<div id="stMsg" style="margin-top:8px;font-weight:700;font-size:13.5px"></div><div id="stOut"></div>' +
      '<div style="font-weight:800;margin:12px 0 2px">' + esc(__t('आपकी Team')) + ' (' + (d.members || []).length + '/' + d.max + ')</div>' +
      ((d.members || []).length ? d.members.map(function (m) { return memberCard(m, false); }).join('') : '<p style="font-size:13px;color:#596579">' + esc(__t('अभी कोई Staff नहीं जुड़ा।')) + '</p>');
  }
  function ensureBox() {
    var host = $('staffDataBox'); if (!host) return null;
    var b = $('staffTeamBox');
    if (!b) { b = document.createElement('div'); b.id = 'staffTeamBox'; b.style.cssText = 'display:none;margin-top:16px;padding:14px;border:1.5px solid #d9e1e8;border-radius:12px;background:#fafbfd'; host.appendChild(b); b.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-st-copy]'); if (t) copy(t.getAttribute('data-st-copy'), t); }); }
    return b;
  }
  async function load() {
    if (!ensureBox()) return;
    var a = auth(); if (!a.staff) return;
    try { var d = await vcSecurePost(Object.assign({ action: 'staffteamlist' }, a)); render(d); } catch (e) { var b = $('staffTeamBox'); if (b) b.style.display = 'none'; }
  }
  window.stTeamAdd = async function () {
    var nm = ($('stNm').value || '').trim(), msg = $('stMsg'), btn = $('stBtn');
    if (nm.length < 2) { msg.style.color = '#a12a1f'; msg.textContent = __t('Staff का नाम लिखें।'); return; }
    btn.disabled = true; msg.style.color = '#333'; msg.textContent = __t('⏳ जोड़ा जा रहा है...');
    var d = null; try { d = await vcSecurePost(Object.assign({ action: 'staffteamadd', name: nm }, auth())); } catch (e) { d = null; }
    btn.disabled = false;
    if (!d || d.status !== 'ok') { msg.style.color = '#a12a1f'; msg.textContent = (d && d.message) || __t('Server से जवाब नहीं मिला — Internet देखें।'); return; }
    msg.style.color = '#1b7f3b'; msg.textContent = d.message;
    await load();
    var out = $('stOut'); if (out && d.staff) out.innerHTML = memberCard(d.staff, true);
  };
  /* Login के बाद (staff-pay.js की तरह loadMyPerformance को लपेटना) */
  function hook() {
    if (typeof window.loadMyPerformance !== 'function' || window.loadMyPerformance.__st) return;
    var orig = window.loadMyPerformance;
    window.loadMyPerformance = async function (isLogin) { var r = await orig.apply(this, arguments); if (isLogin) load(); return r; };
    window.loadMyPerformance.__st = 1;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else hook();
  setTimeout(hook, 800);
})();
