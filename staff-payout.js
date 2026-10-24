/* EkVeera — 💸 Staff Payout (Admin Panel): Staff को भुगतान + Advance — Manual / System / Excel File, तीनों तरीके.
   Server: EkVeera_StaffPayout.gs (actions: payoutstate, payoutadd, payoutpaynet, payoutimport, payoutcancel)
   ⚠️ "System" का मतलब: System बाकी रकम खुद गिनकर दर्ज कर देता है। पैसा आप PhonePe/Cash/Bank से ही भेजते हैं — System पैसा नहीं भेजता।
   यह फ़ाइल app.js और admin-extra.js के बाद चलती है। Staff अपना हिसाब staff-pay.js वाले "आपकी Payment का हिसाब" में देखता है। */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function T(s) { return typeof __t === 'function' ? __t(s) : s; }
  function $(id) { return document.getElementById(id); }
  function inr(n) { n = Math.round((Number(n) || 0) * 100) / 100; return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function month() { return today().slice(0, 7); }
  function dmy(s) { var m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '-' + m[2] + '-' + m[1] : String(s || ''); }
  async function call(o) { o.password = window.ekveeraAdminPassword; try { return await vcSecurePost(o); } catch (e) { return { status: 'error', message: T('Server से जवाब नहीं मिला।') }; } }
  var BTN = 'padding:7px 12px;border-radius:8px;border:1px solid #cfd6e0;background:#fff;font-weight:700;font-size:13px;cursor:pointer;margin:4px 6px 0 0;';
  var OK = BTN.replace('background:#fff', 'background:#1b7f3b;color:#fff;border-color:#1b7f3b'), NO = BTN.replace('background:#fff', 'background:#fff;color:#a12a1f;border-color:#e3b3ad'), BL = BTN.replace('background:#fff', 'background:#0B1F3A;color:#fff;border-color:#0B1F3A');
  var IN = 'padding:8px;border:1px solid #cfd6e0;border-radius:6px;font-size:13.5px;width:100%;box-sizing:border-box;';
  var S = null, pend = null;

  function card(num, label, color) { return '<div style="flex:1;min-width:130px;border:1px solid #e3e8ef;border-radius:10px;padding:9px 11px;background:#fff"><div style="font-size:19px;font-weight:800;color:' + color + '">' + esc(num) + '</div><div style="font-size:12px;color:#596579">' + esc(label) + '</div></div>'; }
  function opt(list, sel) { return list.map(function (x) { return '<option value="' + esc(x[0]) + '"' + (x[0] === sel ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join(''); }
  function modeOpts(sel) { return opt((S && S.modes || ['PhonePe', 'Cash', 'Bank', 'UPI', 'Other']).map(function (m) { return [m, m]; }), sel || 'PhonePe'); }

  /* ---------------------------- मुख्य स्क्रीन ---------------------------- */
  window.poLoad = async function () {
    var root = $('poRoot'); if (!root) return;
    root.innerHTML = '<p>' + esc(T('⏳ हिसाब आ रहा है...')) + '</p>';
    var d = await call({ action: 'payoutstate' });
    if (!d || d.status !== 'ok') { root.innerHTML = '<p style="color:#a12a1f">' + esc((d && d.message) || T('हिसाब नहीं मिला — Apps Script में EkVeera_StaffPayout.gs डालकर Deploy → New version करें।')) + '</p>'; return; }
    S = d; draw();
  };
  function draw() {
    var d = S, root = $('poRoot'), keep = { mode: ($('poMode') || {}).value, date: ($('poDate') || {}).value, ref: ($('poRef') || {}).value, period: ($('poPeriod') || {}).value };
    var h = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0">' + card(inr(d.totals.due), T('सब Staff का कुल बाकी (Net)'), '#E8A33D') + card(inr(d.totals.advance), T('Advance दिया (कुल)'), '#8a5a00') + card(inr(d.totals.paid), T('अब तक Paid (कुल)'), '#1b7f3b') + '</div>';
    h += '<div style="border:1px solid #dfe5ee;border-radius:10px;padding:10px;margin:10px 0;background:#fff"><b>' + esc(T('भुगतान की सामान्य जानकारी (नीचे के सारे बटन इसी को लेते हैं)')) + '</b>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px"><label style="font-size:12px">' + esc(T('Mode')) + '<select id="poMode" style="' + IN + '">' + modeOpts(keep.mode) + '</select></label>' +
      '<label style="font-size:12px">' + esc(T('तारीख़')) + '<input id="poDate" type="date" value="' + esc(keep.date || today()) + '" style="' + IN + '"></label>' +
      '<label style="font-size:12px">' + esc(T('Ref / UTR (ज़रूरी नहीं)')) + '<input id="poRef" maxlength="60" value="' + esc(keep.ref || '') + '" style="' + IN + '"></label>' +
      '<label style="font-size:12px">' + esc(T('किस महीने का')) + '<input id="poPeriod" type="month" value="' + esc(keep.period || month()) + '" style="' + IN + '"></label></div></div>';

    /* Staff की सूची */
    h += '<div style="font-weight:800;margin:12px 0 4px">👥 ' + esc(T('Staff का हिसाब')) + '</div><div style="overflow-x:auto"><table class="comm-tbl" style="width:100%;border-collapse:collapse;font-size:13px"><tr style="background:#D9E1F2"><th style="padding:6px;text-align:left">Staff</th><th style="padding:6px;text-align:right">' + esc(T('कुल बने')) + '</th><th style="padding:6px;text-align:right">' + esc(T('मिले')) + '</th><th style="padding:6px;text-align:right">Advance</th><th style="padding:6px;text-align:right">' + esc(T('बाकी (Net)')) + '</th><th></th></tr>';
    d.staff.forEach(function (s, i) {
      var got = s.legacyPaid + s.payoutPaid, due = s.netDue;
      h += '<tr style="border-bottom:1px solid #eee;background:' + (i % 2 ? '#f5f7fa' : '#fff') + '"><td style="padding:6px"><b>' + esc(s.staffCode) + '</b>' + (s.staffName ? '<br><span style="font-size:11px;color:#596579">' + esc(s.staffName) + ' · ' + esc(s.level) + '</span>' : '') +
        (s.onHold ? '<br><span style="font-size:11px;color:#a12a1f">⛔ ' + esc(T('Profile Approve नहीं (Hold)')) + '</span>' : '') +
        (s.lastPayout ? '<br><span style="font-size:11px;color:#1b7f3b">' + esc(T('आख़िरी')) + ': ' + inr(s.lastPayout.amount) + ' · ' + dmy(s.lastPayout.date) + ' · ' + esc(s.lastPayout.mode) + '</span>' : '') + '</td>' +
        '<td style="padding:6px;text-align:right">' + inr(s.earned) + '</td><td style="padding:6px;text-align:right;color:#1b7f3b">' + inr(got) + '</td><td style="padding:6px;text-align:right;color:#8a5a00">' + (s.advance ? inr(s.advance) : '—') + '</td>' +
        '<td style="padding:6px;text-align:right;font-weight:800;color:' + (due > 0 ? '#b36b00' : (due < 0 ? '#a12a1f' : '#1b7f3b')) + '">' + (due < 0 ? '−' + inr(-due) + '<br><span style="font-size:10.5px;font-weight:600">' + esc(T('Advance ज़्यादा — आगे कटेगा')) + '</span>' : inr(due)) + '</td>' +
        '<td style="padding:6px;white-space:nowrap">' + (due > 0 ? '<button style="' + OK + '" onclick="poPayOne(' + i + ')">💸 ' + esc(T('बाकी चुकाएँ')) + '</button>' : '') + '<button style="' + BTN + '" onclick="poPick(' + i + ')">✍️ Manual / Advance</button></td></tr>';
    });
    if (!d.staff.length) h += '<tr><td colspan="6" style="padding:10px">' + esc(T('अभी किसी Staff का हिसाब नहीं बना।')) + '</td></tr>';
    h += '</table></div>';
    var payable = d.staff.filter(function (s) { return s.netDue > 0 && !s.onHold; });
    h += '<button style="' + BL + 'width:100%;padding:11px;margin-top:10px" onclick="poPayAll()"' + (payable.length ? '' : ' disabled') + '>💸 ' + esc(T('सबका बाकी एक साथ चुकता दर्ज करें')) + ' (' + payable.length + ' Staff · ' + inr(payable.reduce(function (a, s) { return a + s.netDue; }, 0)) + ')</button>' +
      '<p style="font-size:12px;color:#596579;margin:6px 0 0">' + esc(T('पहले PhonePe/Cash से पैसे भेजें, फिर यह बटन दबाएँ — System हिसाब "Paid" कर देगा और Staff को भी दिखेगा। System खुद पैसे नहीं भेजता।')) + '</p>';

    /* Manual / Advance फ़ॉर्म */
    h += '<div id="poForm" style="border:1px solid #dfe5ee;border-radius:10px;padding:10px;margin:14px 0;background:#fff"><b>✍️ ' + esc(T('Manual भुगतान / Advance दर्ज करें')) + '</b><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">' +
      '<label style="font-size:12px;grid-column:1/3">Staff<select id="poStaff" style="' + IN + '"><option value="">' + esc(T('— Staff चुनें —')) + '</option>' + d.staff.map(function (s) { return '<option value="' + esc(s.staffCode) + '">' + esc(s.staffCode + (s.staffName ? ' — ' + s.staffName : '') + ' (बाकी ' + inr(s.netDue) + ')') + '</option>'; }).join('') + '</select></label>' +
      '<label style="font-size:12px">' + esc(T('प्रकार')) + '<select id="poType" style="' + IN + '"><option value="Payout">' + esc(T('भुगतान (Commission)')) + '</option><option value="Advance">Advance</option></select></label>' +
      '<label style="font-size:12px">' + esc(T('रकम (₹)')) + '<input id="poAmt" type="number" min="1" step="0.01" inputmode="decimal" style="' + IN + '"></label>' +
      '<label style="font-size:12px;grid-column:1/3">' + esc(T('टिप्पणी (ज़रूरी नहीं)')) + '<input id="poNote" maxlength="150" style="' + IN + '"></label></div>' +
      '<button style="' + OK + 'width:100%;padding:11px;margin-top:8px" onclick="poSave()">💾 ' + esc(T('दर्ज करें')) + '</button><div id="poSaveMsg" style="margin-top:6px;font-weight:700"></div></div>';

    /* Excel */
    h += '<div style="border:1px solid #dfe5ee;border-radius:10px;padding:10px;margin:14px 0;background:#fff"><b>📄 ' + esc(T('Excel File से (सबका महीने का भुगतान एक साथ)')) + '</b>' +
      '<ol style="font-size:12.5px;color:#34445a;padding-left:18px;margin:6px 0"><li>' + esc(T('"Payout File Download" दबाएँ — हर Staff की बाकी रकम भरी मिलेगी।')) + '</li><li>' + esc(T('PhonePe से सबको भेजें; जिनका भुगतान हो गया उनकी Row में Done = Yes लिखें (रकम/UTR चाहें तो बदल दें)।')) + '</li><li>' + esc(T('File Upload करें → Preview देखें → "लागू करें"।')) + '</li></ol>' +
      '<button style="' + BTN + '" onclick="poDownload()">⬇️ ' + esc(T('Payout File Download')) + '</button>' +
      '<label style="' + BTN + 'display:inline-block">⬆️ ' + esc(T('भरी हुई File Upload')) + '<input id="poFile" type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="poUpload(this)"></label>' +
      '<p style="font-size:12px;color:#596579;margin:4px 0 0">' + esc(T('अपनी खुद की File भी चलेगी: बस कॉलम के नाम Staff ID, Amount, Mode, Date, Ref/UTR, Done जैसे हों। Done कॉलम न हो तो जिन Rows में Amount है वे सब गिनी जाएँगी (Preview में दिखेंगी)।')) + '</p><div id="poPrev"></div></div>';

    /* हाल के भुगतान */
    h += '<div style="font-weight:800;margin:12px 0 4px">🧾 ' + esc(T('हाल के भुगतान / Advance')) + '</div><div style="overflow-x:auto"><table class="comm-tbl" style="width:100%;border-collapse:collapse;font-size:12.5px"><tr style="background:#D9E1F2"><th style="padding:5px;text-align:left">' + esc(T('तारीख़')) + '</th><th style="padding:5px;text-align:left">Staff</th><th style="padding:5px;text-align:left">' + esc(T('प्रकार')) + '</th><th style="padding:5px;text-align:right">' + esc(T('रकम')) + '</th><th style="padding:5px;text-align:left">Mode / UTR</th><th style="padding:5px;text-align:left">' + esc(T('स्रोत')) + '</th><th></th></tr>';
    d.recent.forEach(function (r) {
      var gone = r.status !== 'Active';
      h += '<tr style="border-bottom:1px solid #eee;' + (gone ? 'opacity:.5;text-decoration:line-through' : '') + '"><td style="padding:5px">' + dmy(r.date) + '</td><td style="padding:5px">' + esc(r.staff) + '</td><td style="padding:5px">' + esc(r.type === 'Advance' ? 'Advance' : T('भुगतान')) + '</td><td style="padding:5px;text-align:right;font-weight:700">' + inr(r.amount) + '</td><td style="padding:5px">' + esc(r.mode) + (r.ref ? '<br><span style="font-size:11px;color:#596579">' + esc(r.ref) + '</span>' : '') + '</td><td style="padding:5px">' + esc(r.source) + '</td><td style="padding:5px">' + (gone ? esc(T('रद्द')) : '<button style="' + NO + 'margin:0" onclick="poCancel(\'' + esc(r.id) + '\')">↩️ ' + esc(T('रद्द')) + '</button>') + '</td></tr>';
    });
    if (!d.recent.length) h += '<tr><td colspan="7" style="padding:8px">' + esc(T('अभी कोई भुगतान दर्ज नहीं।')) + '</td></tr>';
    root.innerHTML = h + '</table></div>';
  }

  function common() { return { mode: $('poMode').value, date: $('poDate').value || today(), ref: ($('poRef').value || '').trim(), period: $('poPeriod').value || '' }; }

  window.poPick = function (i) {
    var s = S.staff[i]; $('poStaff').value = s.staffCode; $('poAmt').value = s.netDue > 0 ? s.netDue : '';
    $('poForm').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('poAmt').focus();
  };
  window.poSave = async function (force) {
    var m = $('poSaveMsg'), c = common(), staff = $('poStaff').value, amt = $('poAmt').value;
    if (!staff) { m.style.color = '#a12a1f'; m.textContent = T('Staff चुनें।'); return; }
    if (!(parseFloat(amt) > 0)) { m.style.color = '#a12a1f'; m.textContent = T('सही रकम लिखें।'); return; }
    m.style.color = '#333'; m.textContent = T('⏳ दर्ज हो रहा है...');
    var d = await call({ action: 'payoutadd', staff: staff, type: $('poType').value, amount: amt, mode: c.mode, date: c.date, ref: c.ref, period: c.period, note: $('poNote').value, force: force ? '1' : '' });
    if (d && d.needsConfirm) { if (confirm(d.message)) return window.poSave(true); m.textContent = T('दर्ज नहीं किया।'); return; }
    if (!d || d.status !== 'ok') { m.style.color = '#a12a1f'; m.textContent = (d && d.message) || T('कुछ गड़बड़ हुई।'); return; }
    await window.poLoad(); var m2 = $('poSaveMsg'); if (m2) { m2.style.color = '#1b7f3b'; m2.textContent = d.message; }
  };
  window.poPayOne = async function (i) {
    var s = S.staff[i], c = common();
    if (!confirm(s.staffCode + ' — ' + inr(s.netDue) + ' (' + c.mode + ', ' + dmy(c.date) + ')\n\n' + T('क्या यह भुगतान हो चुका है? "ठीक है" दबाने पर System इसे Paid दर्ज कर देगा।'))) return;
    var d = await call({ action: 'payoutpaynet', staffs: JSON.stringify([s.staffCode]), mode: c.mode, date: c.date, ref: c.ref, period: c.period });
    if (!d || d.status !== 'ok') { alert((d && d.message) || T('कुछ गड़बड़ हुई।')); return; }
    if (d.skipped && d.skipped.length) alert(d.skipped.map(function (x) { return x.staff + ': ' + x.reason; }).join('\n'));
    window.poLoad();
  };
  window.poPayAll = async function () {
    var c = common(), list = S.staff.filter(function (s) { return s.netDue > 0 && !s.onHold; }), tot = list.reduce(function (a, s) { return a + s.netDue; }, 0);
    if (!list.length) return;
    if (!confirm(list.length + ' Staff · ' + inr(tot) + ' (' + c.mode + ', ' + dmy(c.date) + ')\n\n' + T('क्या इन सबका भुगतान हो चुका है? "ठीक है" दबाने पर सब Paid दर्ज हो जाएँगे।'))) return;
    var d = await call({ action: 'payoutpaynet', staffs: 'ALL', mode: c.mode, date: c.date, ref: c.ref, period: c.period });
    if (!d || d.status !== 'ok') { alert((d && d.message) || T('कुछ गड़बड़ हुई।')); return; }
    alert('✅ ' + d.paid.length + ' Staff · ' + inr(d.total) + (d.skipped && d.skipped.length ? '\n\n' + T('छोड़े गए:') + '\n' + d.skipped.map(function (x) { return x.staff + ': ' + x.reason; }).join('\n') : ''));
    window.poLoad();
  };
  window.poCancel = async function (id) {
    var why = prompt(T('रद्द करने का कारण (जैसे: गलत Staff / गलत रकम):'), ''); if (why === null) return;
    var d = await call({ action: 'payoutcancel', id: id, reason: why });
    if (!d || d.status !== 'ok') { alert((d && d.message) || T('कुछ गड़बड़ हुई।')); return; }
    window.poLoad();
  };

  /* ---------------------------- Excel ---------------------------- */
  window.poDownload = function () {
    if (typeof XLSX === 'undefined') { alert(T('Excel Library लोड नहीं हुई — पेज Refresh करें।')); return; }
    var c = common(), head = ['Staff ID', 'Name', 'Level', 'बाकी (Net) ₹ — सिर्फ़ देखने के लिए', 'Type (Payout / Advance)', 'Amount (₹)', 'Mode', 'Date (YYYY-MM-DD)', 'Ref / UTR', 'Period (YYYY-MM)', 'Note', 'Done (Yes / No)'];
    var body = S.staff.map(function (s) { return [s.staffCode, s.staffName, s.level, s.netDue, 'Payout', s.netDue > 0 && !s.onHold ? s.netDue : '', c.mode, c.date, '', c.period, s.onHold ? 'Hold: Profile Approve नहीं' : '', 'No']; });
    var ws = XLSX.utils.aoa_to_sheet([head].concat(body)); ws['!cols'] = [{ wch: 20 }, { wch: 16 }, { wch: 7 }, { wch: 22 }, { wch: 14 }, { wch: 13 }, { wch: 10 }, { wch: 16 }, { wch: 20 }, { wch: 14 }, { wch: 26 }, { wch: 13 }];
    var info = [['EkVeera — Monthly Staff Payout File'], [''], ['1) PhonePe / Cash / Bank से भुगतान करें।'], ['2) जिनका भुगतान हो गया उनकी Row में "Done" = Yes लिखें (Amount / Date / UTR बदल सकते हैं)।'], ['3) Advance दर्ज करना हो तो Type = Advance लिखें।'], ['4) यह File EkVeera Admin Panel → Staff Payout → "भरी हुई File Upload" में डालें। पहले Preview दिखेगा।'], ['5) एक ही File दोबारा Upload करने पर Duplicate अपने-आप छूट जाते हैं।']];
    var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Payout'); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(info), 'Instructions');
    XLSX.writeFile(wb, 'EkVeera_Staff_Payout_' + (c.period || month()) + '.xlsx');
  };
  function norm(h) { return String(h || '').toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, ''); }
  var ALIAS = { staff: ['staffid', 'staff', 'staffcode', 'id', 'स्टाफ'], type: ['type', 'typepayoutadvance', 'प्रकार'], amount: ['amount', 'amountrs', 'amountinr', 'paynow', 'paidamount', 'payout', 'रकम', 'राशि'], mode: ['mode', 'paymentmode', 'मोड'], date: ['date', 'dateyyyymmdd', 'paiddate', 'paymentdate', 'तारीख', 'तारीख़'], ref: ['ref', 'refutr', 'utr', 'reference', 'transactionid', 'txnid', 'refno'], period: ['period', 'periodyyyymm', 'month', 'महीना'], note: ['note', 'remark', 'remarks', 'टिप्पणी'], done: ['done', 'doneyesno', 'status', 'paymentdone', 'हुआ'] };
  function colOf(heads, key) { for (var i = 0; i < heads.length; i++) if (ALIAS[key].indexOf(heads[i]) > -1) return i; return -1; }
  window.poUpload = function (inp) {
    var f = inp.files && inp.files[0]; if (!f) return;
    var box = $('poPrev'); box.innerHTML = '<p>' + esc(T('⏳ File पढ़ी जा रही है...')) + '</p>';
    var rd = new FileReader();
    rd.onload = async function () {
      try {
        var wb = XLSX.read(new Uint8Array(rd.result), { type: 'array' }), ws = wb.Sheets[wb.SheetNames[0]];
        var aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false, dateNF: 'yyyy-mm-dd' });
        var hi = -1; for (var i = 0; i < Math.min(aoa.length, 8); i++) { if (colOf(aoa[i].map(norm), 'staff') > -1 && colOf(aoa[i].map(norm), 'amount') > -1) { hi = i; break; } }
        if (hi < 0) { box.innerHTML = '<p style="color:#a12a1f">' + esc(T('File में "Staff ID" और "Amount" कॉलम नहीं मिले। ऊपर से Template Download करके उसमें भरें।')) + '</p>'; return; }
        var H = aoa[hi].map(norm), ix = {}; Object.keys(ALIAS).forEach(function (k) { ix[k] = colOf(H, k); });
        var yes = /^(y|yes|done|paid|ok|true|1|✓|✔|हाँ|हां|हो गया|हुआ)/i, rows = [], skipped = 0;
        for (var r = hi + 1; r < aoa.length; r++) {
          var a = aoa[r], g = function (k) { return ix[k] > -1 ? a[ix[k]] : ''; };
          if (!String(g('staff')).trim()) continue;
          if (ix.done > -1 && !yes.test(String(g('done')).trim())) { skipped++; continue; }            // Done = Yes वाली ही
          if (!String(g('amount')).trim()) { skipped++; continue; }
          rows.push({ n: r + 1, staff: g('staff'), type: g('type'), amount: g('amount'), mode: g('mode'), date: g('date'), ref: g('ref'), period: g('period'), note: g('note') });
        }
        if (!rows.length) { box.innerHTML = '<p style="color:#a12a1f">' + esc(T('कोई Row लागू करने लायक नहीं मिली (Done = Yes और Amount चाहिए)।')) + '</p>'; return; }
        var c = common(); rows.forEach(function (x) { if (!String(x.mode).trim()) x.mode = c.mode; if (!String(x.date).trim()) x.date = c.date; if (!String(x.period).trim()) x.period = c.period; });
        var d = await call({ action: 'payoutimport', dry: '1', rows: JSON.stringify(rows) });
        if (!d || d.status !== 'ok') { box.innerHTML = '<p style="color:#a12a1f">' + esc((d && d.message) || T('कुछ गड़बड़ हुई।')) + '</p>'; return; }
        pend = rows; showPreview(d, skipped);
      } catch (e) { box.innerHTML = '<p style="color:#a12a1f">' + esc(T('File पढ़ी नहीं जा सकी — .xlsx या .csv रखें।')) + '</p>'; }
      inp.value = '';
    };
    rd.readAsArrayBuffer(f);
  };
  function showPreview(d, skipped) {
    var box = $('poPrev'), ico = { ok: '✅', warn: '⚠️', dup: '🔁', error: '❌' }, col = { ok: '#1b7f3b', warn: '#b36b00', dup: '#596579', error: '#a12a1f' };
    var n = d.counts.ok + d.counts.warn, h = '<div style="margin-top:10px;font-weight:800">🔎 Preview — ✅ ' + d.counts.ok + ' · ⚠️ ' + d.counts.warn + ' · 🔁 ' + d.counts.dup + ' · ❌ ' + d.counts.error + (skipped ? ' · ' + skipped + ' ' + esc(T('Row Done नहीं (छोड़ी)')) : '') + '</div>' +
      '<div style="overflow-x:auto"><table class="comm-tbl" style="width:100%;border-collapse:collapse;font-size:12.5px"><tr style="background:#D9E1F2"><th style="padding:5px">#</th><th style="padding:5px;text-align:left">Staff</th><th style="padding:5px;text-align:right">' + esc(T('रकम')) + '</th><th style="padding:5px;text-align:left">' + esc(T('नतीजा')) + '</th></tr>';
    d.results.forEach(function (r) { h += '<tr style="border-bottom:1px solid #eee"><td style="padding:5px">' + esc(r.n) + '</td><td style="padding:5px">' + esc(r.staff) + (r.type === 'Advance' ? ' <i>(Advance)</i>' : '') + '</td><td style="padding:5px;text-align:right">' + (r.amount != null ? inr(r.amount) : '') + '</td><td style="padding:5px;color:' + col[r.status] + '">' + ico[r.status] + ' ' + esc(r.message || (r.status === 'ok' ? T('ठीक') : '')) + '</td></tr>'; });
    h += '</table></div>' + (n ? '<button style="' + OK + 'width:100%;padding:11px;margin-top:8px" onclick="poApply()">✅ ' + esc(T('लागू करें')) + ' (' + n + ' Row · ' + inr(d.payoutTotal) + ' ' + esc(T('भुगतान')) + ')</button>' : '<p style="color:#a12a1f">' + esc(T('लागू करने लायक कोई Row नहीं।')) + '</p>') + '<div id="poApplyMsg" style="margin-top:6px;font-weight:700"></div>';
    box.innerHTML = h;
  }
  window.poApply = async function () {
    if (!pend) return; var m = $('poApplyMsg'); m.textContent = T('⏳ लागू हो रहा है...');
    var d = await call({ action: 'payoutimport', dry: '0', rows: JSON.stringify(pend) });
    if (!d || d.status !== 'ok') { m.style.color = '#a12a1f'; m.textContent = (d && d.message) || T('कुछ गड़बड़ हुई।'); return; }
    pend = null; await window.poLoad(); var p = $('poPrev'); if (p) p.innerHTML = '<p style="color:#1b7f3b;font-weight:800">✅ ' + d.applied + ' ' + esc(T('Row दर्ज हो गईं।')) + '</p>';
  };
})();
