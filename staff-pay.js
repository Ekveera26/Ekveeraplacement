/* EkVeera — Admin Dashboard + Staff Payment (Commission)
   • Admin Panel में: 📊 Dashboard, 💰 Staff Payment (सारे Staff + Admin का हिस्सा + मिलान)
   • Staff के अपने View (?staffview=नाम) में: अपनी Candidate/Company/Payment की गिनती और कितना बना
   यह फ़ाइल app.js के बाद चलती है (vcSecurePost, ekveeraAdminPassword, ekveeraStaffName ... वहीं से आते हैं)।
   हिसाब Server (EkVeera_StaffPay.gs) बनाता है — यहां सिर्फ़ दिखाया जाता है। */
(function () {
  'use strict';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function money(n) {
    n = Math.round((Number(n) || 0) * 100) / 100;
    var s = n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return '₹' + s;
  }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function rangeOf(prefix) {
    var f = $(prefix + 'From'), t = $(prefix + 'To');
    return { from: f ? f.value : '', to: t ? t.value : '' };
  }
  function rangeLabel(d) {
    if (d.from || d.to) return '📅 ' + (d.from || __t('शुरू')) + __t(' से ') + (d.to || __t('आज तक')) + __t(' तक');
    return __t('📅 सारा Data (कोई तारीख सीमा नहीं)');
  }
  function roleText(role) {
    if (/^own/i.test(role)) return __t('अपनी ID से आया');
    if (/^admin/i.test(role)) return 'Admin';
    return __t('Team के Staff से (Team Lead हिस्सा)');
  }
  function card(num, label, color, sub) {
    return '<div class="dash-card" style="border-top-color:' + (color || '#1F9D95') + ';"><div class="dash-num">' + num + '</div><div class="dash-lab">' + label + '</div>' + (sub ? '<div class="dash-sub">' + sub + '</div>' : '') + '</div>';
  }

  /* =====================================================================
     📊 Admin Dashboard
     ===================================================================== */
  window.loadDashboard = async function () {
    var box = $('dashBox'), di = $('dashDate');
    if (!box) return;
    if (di && !di.value) di.value = today();
    box.innerHTML = '<p>' + __t('लोड हो रहा है...') + '</p>';
    try {
      var d = await vcSecurePost({ action: 'getadmindashboard', password: ekveeraAdminPassword, date: di ? di.value : '' });
      if (d.status !== 'ok') { box.innerHTML = '<p style="color:red;">' + esc(d.message || __t('लोड नहीं हो पाया')) + '</p>'; return; }
      var c = d.companies, k = d.candidates, p = d.payments;
      var h = '<p class="dash-date">📅 ' + esc(d.date) + '</p>';
      h += '<p class="dash-h">🏢 Company</p><div class="dash-grid">' +
        card(c.joinedToday, __t('आज नई Company आईं'), '#1F9D95') +
        card(c.selectedToday, __t('आज Candidate चुनने वाली Company'), '#2e7d32', __t('जिन्होंने Payment करके Candidate चुने')) +
        card(c.requirementPending, __t('Requirement बाकी वाली Company'), '#E8A33D', c.openVacancies + __t(' Vacancy · ') + c.openPosts + __t(' Post खुली')) +
        card(c.selectedTotal, __t('अब तक Candidate चुनने वाली Company'), '#0B1F3A') +
        card(c.total, __t('कुल Company'), '#6b778c') + '</div>';
      h += '<p class="dash-h">👤 Candidate</p><div class="dash-grid">' +
        card(k.selectedToday, __t('आज चुने गए Candidate'), '#2e7d32') +
        card(k.remaining, __t('बचे हुए Candidate'), '#E8A33D', __t('जिन्हें अभी किसी ने नहीं चुना / Placement नहीं हुआ')) +
        card(k.registeredToday, __t('आज नए Candidate जुड़े'), '#1F9D95') +
        card(k.selectedTotal, __t('अब तक चुने गए Candidate'), '#0B1F3A') +
        card(k.total, __t('कुल Candidate'), '#6b778c', __t('Resume ') + k.resumeTotal + __t(' + Training ') + k.trainingTotal) + '</div>';
      h += '<p class="dash-h">💳 Payment</p><div class="dash-grid">' +
        card(p.today, __t('आज की Payment (संख्या)'), '#1F9D95') + card(money(p.amountToday), __t('आज कुल रकम'), '#2e7d32') +
        card(p.trainingToday, __t('आज Training Fee भरने वाले'), '#1F9D95', money(p.trainingAmountToday)) + card(p.trainingTotal, __t('अब तक Training Fee भरने वाले'), '#0B1F3A') + '</div>';
      h += '<p class="dash-note">' + __t('बचे हुए Candidate = कुल Candidate − (जो Placed हुए या जिन्हें किसी Company ने Payment करके चुन लिया)।') + '</p>';
      box.innerHTML = h;
    } catch (err) { box.innerHTML = '<p style="color:red;">' + __t('कुछ गड़बड़ हो गई।') + '</p>'; }
  };

  /* =====================================================================
     💰 Admin — सारे Staff का Payment हिसाब
     ===================================================================== */
  var lastComm = null;

  window.loadStaffCommission = async function () {
    var box = $('commTable'), tot = $('commTotals'), det = $('commDetail'), btn = $('commDownloadBtn'), nt = $('commRange');
    if (!box) return;
    box.innerHTML = '<p>' + __t('लोड हो रहा है...') + '</p>'; tot.innerHTML = ''; det.innerHTML = ''; if (btn) btn.style.display = 'none';
    try {
      var r = rangeOf('staff');
      var d = await vcSecurePost({ action: 'getstaffcommission', password: ekveeraAdminPassword, from: r.from, to: r.to });
      if (d.status !== 'ok') { box.innerHTML = '<p style="color:red;">' + esc(d.message || __t('लोड नहीं हो पाया')) + '</p>'; return; }
      lastComm = d;
      if (nt) nt.textContent = rangeLabel(d);
      var t = d.totals;
      var ok = t.matched;
      tot.innerHTML = '<div class="dash-grid">' +
        card(money(t.collected), __t('कुल Payment मिली (Company + Training)'), '#0B1F3A', money(t.companyCollected) + __t(' Company · ') + money(t.trainingCollected) + __t(' Training')) +
        card(money(t.staffShare), __t('सारे Staff का कुल हिस्सा'), '#1F9D95') +
        card(money(t.adminShare), __t('Admin का हिस्सा'), '#2e7d32') + '</div>' +
        '<p class="comm-check" style="color:' + (ok ? '#1b7f3b' : '#c0392b') + ';">' + (ok ? __t('✅ मिलान ठीक है: Staff + Admin का जोड़ = कुल Payment (Company + Training)') : __t('❌ मिलान नहीं बैठा — नीचे की सूचना देखें और EkVeera को बताएं')) + '</p>';
      var warn = '';
      if (d.unmappedStaff && d.unmappedStaff.length) warn += '<p class="comm-warn">⚠️ ' + __t('ये Staff Code "Staff List" शीट में नहीं मिले (इन्हें सीधा 01 माना गया): ') + esc(d.unmappedStaff.join(', ')) + '</p>';
      (d.issues || []).slice(0, 8).forEach(function (x) { warn += '<p class="comm-warn">⚠️ ' + esc(x) + '</p>'; });
      tot.innerHTML += warn;

      var th = 'padding:6px;';
      var rows = d.staff.filter(function (s) { return s.earned > 0 || s.registeredCandidates || s.registeredCompanies || s.payments; });
      if (!rows.length) { box.innerHTML = '<p>' + __t('अभी किसी Staff के नाम कोई Entry/Payment नहीं है।') + '</p>'; return; }
      var html = '<div style="overflow-x:auto;"><table class="comm-tbl"><tr><th style="' + th + '">Staff</th><th style="' + th + '">' + __t('Level') + '</th><th style="' + th + '">' + __t('फॉर्म भरे Candidate') + '</th><th style="' + th + '">' + __t('फॉर्म भरी Company') + '</th><th style="' + th + '">' + __t('Payment वाली Company') + '</th><th style="' + th + '">' + __t('चुने गए Candidate') + '</th><th style="' + th + '">' + __t('कुल बना') + '</th><th style="' + th + '">Paid</th><th style="' + th + '">' + __t('बाकी') + '</th></tr>';
      var sums = { rc: 0, rco: 0, pc: 0, sc: 0, tr: 0, e: 0, p: 0, b: 0 };
      rows.forEach(function (s, i) {
        sums.rc += s.registeredCandidates; sums.rco += s.registeredCompanies; sums.pc += s.paidCompanies; sums.sc += s.selectedCandidates; sums.tr += s.paidTrainees; sums.e += s.earned; sums.p += s.paid; sums.b += s.pending;
        html += '<tr onclick="showCommDetail(' + i + ')" style="cursor:pointer;background:' + (i % 2 ? '#f5f7fa' : '#fff') + ';"><td style="' + th + '"><strong>' + esc(s.staffCode) + '</strong>' + (s.staffName ? '<br><span style="font-size:11px;color:#596579;">' + esc(s.staffName) + '</span>' : '') + (s.inList ? '' : '<br><span style="font-size:11px;color:#c0392b;">' + __t('List में नहीं') + '</span>') + (s.profileStatus === 'Approved' ? '<br><span style="font-size:11px;color:#1b7f3b;">✅ ' + __t('Profile Approved') + '</span>' : '<br><span style="font-size:11px;color:#c0392b;font-weight:700;">⛔ ' + __t('Commission Hold') + (s.onHold ? ' (₹' + s.onHold + ')' : '') + '</span>') + '</td>' +
          '<td style="' + th + 'text-align:center;">' + esc(s.level) + (s.under ? '<br><span style="font-size:11px;color:#596579;">' + esc(s.under) + '</span>' : '') + '</td>' +
          '<td style="' + th + 'text-align:center;">' + s.registeredCandidates + '</td><td style="' + th + 'text-align:center;">' + s.registeredCompanies + '</td>' +
          '<td style="' + th + 'text-align:center;font-weight:700;">' + s.paidCompanies + '</td><td style="' + th + 'text-align:center;font-weight:700;">' + s.selectedCandidates + '</td>' +
          '<td style="' + th + 'text-align:right;font-weight:800;color:#1b7f3b;">' + money(s.earned) + '</td><td style="' + th + 'text-align:right;">' + money(s.paid) + '</td><td style="' + th + 'text-align:right;">' + money(s.pending) + '</td></tr>';
      });
      html += '<tr style="background:#D9E1F2;font-weight:800;"><td style="' + th + '">TOTAL</td><td></td><td style="' + th + 'text-align:center;">' + sums.rc + '</td><td style="' + th + 'text-align:center;">' + sums.rco + '</td><td style="' + th + 'text-align:center;">' + sums.pc + '</td><td style="' + th + 'text-align:center;">' + sums.sc + '</td><td style="' + th + 'text-align:center;">' + sums.tr + '</td><td style="' + th + 'text-align:right;">' + money(sums.e) + '</td><td style="' + th + 'text-align:right;">' + money(sums.p) + '</td><td style="' + th + 'text-align:right;">' + money(sums.b) + '</td></tr>';
      html += '<tr style="background:#E4F4EA;font-weight:800;"><td style="' + th + '">ADMIN</td><td></td><td colspan="5"></td><td style="' + th + 'text-align:right;">' + money(t.adminShare) + '</td><td colspan="2"></td></tr>';
      html += '</table></div><p style="font-size:11.5px;color:#596579;margin:6px 0 0;">' + __t('किसी Staff की Row दबाने पर उसके हिसाब की पूरी List नीचे खुलेगी। "Paid / बाकी" बदलने के लिए Google Sheet की "Staff Commission" शीट में "Payout Status" कॉलम में Paid लिखें।') + '</p>';
      box.innerHTML = html;
      lastComm._rows = rows;
      if (btn) btn.style.display = 'inline-flex';
    } catch (err) { box.innerHTML = '<p style="color:red;">' + __t('कुछ गड़बड़ हो गई।') + '</p>'; }
  };

  window.showCommDetail = function (i) {
    var s = lastComm && lastComm._rows && lastComm._rows[i], box = $('commDetail');
    if (!s || !box) return;
    var key = String(s.staffCode).toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, '');
    var list = (lastComm.entries || []).filter(function (e) { return String(e.beneficiary).toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, '') === key; });
    if (!list.length) { box.innerHTML = '<p style="font-size:13px;">' + esc(s.staffCode) + __t(' का इस Range में कोई Payment हिसाब नहीं है।') + '</p>'; return; }
    var th = 'padding:5px;text-align:left;';
    var h = '<p style="font-weight:700;margin:12px 0 6px;">💰 ' + esc(s.staffCode) + ' (' + list.length + ')</p><div style="overflow-x:auto;"><table class="comm-tbl"><tr style="background:#D9E1F2;"><th style="' + th + '">Date</th><th style="' + th + '">Request</th><th style="' + th + '">Company</th><th style="' + th + '">' + __t('किस बात का') + '</th><th style="' + th + '">' + __t('किसकी ID से आया') + '</th><th style="' + th + '">' + __t('भूमिका') + '</th><th style="' + th + 'text-align:right;">' + __t('हिस्सा') + '</th><th style="' + th + '">Status</th></tr>';
    list.forEach(function (e) {
      h += '<tr style="border-bottom:1px solid #eee;"><td style="padding:5px;">' + esc(String(e.paidOn).slice(0, 10)) + '</td><td style="padding:5px;">' + esc(e.requestId) + '</td><td style="padding:5px;">' + esc(e.companyId) + '<br><span style="font-size:11px;color:#596579;">' + esc(e.companyName) + '</span></td><td style="padding:5px;">' + esc(e.feeType) + '<br><span style="font-size:11px;color:#596579;">' + esc(e.itemIds) + '</span></td><td style="padding:5px;">' + esc(e.broughtBy) + '</td><td style="padding:5px;">' + esc(roleText(e.role)) + '</td><td style="padding:5px;text-align:right;font-weight:700;">' + money(e.share) + '</td><td style="padding:5px;">' + esc(e.payoutStatus) + '</td></tr>';
    });
    box.innerHTML = h + '</table></div>';
  };

  window.downloadStaffCommission = function () {
    if (!lastComm || typeof XLSX === 'undefined') return;
    var t = lastComm.totals;
    var head = [['EkVeera — Staff Payment (Commission) Report'], [rangeLabel(lastComm)], ['Total collected', t.collected, 'Staff share', t.staffShare, 'Admin share', t.adminShare, t.matched ? 'Matched' : 'NOT MATCHED'], []];
    var cols = ['Staff ID', 'Name', 'Level', 'Under', 'Registered Candidates', 'Registered Companies', 'Paid Companies', 'Selected Candidates', 'Training Fee Payers', 'Training Share (₹)', 'Total Earned (₹)', 'Paid (₹)', 'Pending (₹)'];
    var body = (lastComm._rows || lastComm.staff).map(function (s) { return [s.staffCode, s.staffName, s.level, s.under, s.registeredCandidates, s.registeredCompanies, s.paidCompanies, s.selectedCandidates, s.paidTrainees, s.trainingEarned, s.earned, s.paid, s.pending]; });
    var ws = XLSX.utils.aoa_to_sheet(head.concat([cols], body, [['ADMIN', '', '', '', '', '', '', '', '', '', t.adminShare]]));
    ws['!cols'] = [{ wch: 20 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 12 }];
    var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Summary');
    var cols2 = ['Request ID', 'Paid On', 'Company ID', 'Company Name', 'Fee Type', 'Items', 'Item IDs', 'Fee Amount (₹)', 'Brought By', 'Beneficiary', 'Role', 'Share (₹)', 'Payout Status', 'Payout Date', 'Note'];
    var det = (lastComm.entries || []).map(function (e) { return [e.requestId, e.paidOn, e.companyId, e.companyName, e.feeType, e.items, e.itemIds, e.feeAmount, e.broughtBy, e.beneficiary, e.role, e.share, e.payoutStatus, e.payoutDate, e.note]; });
    var ws2 = XLSX.utils.aoa_to_sheet([cols2].concat(det)); ws2['!cols'] = [{ wch: 11 }, { wch: 17 }, { wch: 11 }, { wch: 24 }, { wch: 26 }, { wch: 7 }, { wch: 30 }, { wch: 13 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 11 }, { wch: 12 }, { wch: 12 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Details');
    XLSX.writeFile(wb, 'EkVeera_Staff_Payment_' + Date.now() + '.xlsx');
  };

  /* =====================================================================
     👤 Staff का अपना Payment View
     ===================================================================== */
  var lastMine = null;
  window.loadMyCommission = async function () {
    var box = $('myCommBox');
    if (!box || typeof ekveeraStaffName === 'undefined' || !ekveeraStaffName) return;
    try {
      var r = rangeOf('my');
      var d = await vcSecurePost({ action: 'getstaffcommissionone', password: ekveeraStaffPassword, staff: ekveeraStaffName, from: r.from, to: r.to });
      if (d.status !== 'ok') { box.innerHTML = ''; return; }          // पुराना Apps Script हो तो चुपचाप छुपा रहे
      lastMine = d;
      var h = '<hr style="margin:18px 0;"><h4 style="margin:0 0 4px;">💰 ' + __t('आपकी Payment का हिसाब') + '</h4>';
      h += '<p style="font-size:12px;color:#596579;margin:0 0 10px;">' + (d.level === '?' ? '' : 'Level ' + esc(d.level) + (d.under ? ' · ' + esc(d.under) + ' ' + __t('की Team') : '')) + '</p>';
      if (!d.inList) h += '<p class="comm-warn">⚠️ ' + __t('आपका Staff Code "Staff List" में नहीं मिला — Admin से जुड़वाएं, तभी हिसाब सही बनेगा।') + '</p>';
      h += '<div class="dash-grid">' +
        card(d.registered.candidates + d.registered.trainingCandidates, __t('आपकी ID से फॉर्म भरने वाले Candidate'), '#1F9D95', __t('Resume ') + d.registered.candidates + __t(' + Admission ') + d.registered.trainingCandidates) +
        card(d.registered.companies, __t('आपकी ID से फॉर्म भरने वाली Company'), '#1F9D95') +
        card(d.paid.companies, __t('Payment करने वाली Company'), '#2e7d32', __t('आपकी ID से आई, जिसने Payment किया')) +
        card(d.paid.candidates, __t('चुने गए Candidate'), '#2e7d32', __t('आपकी ID से आए, जिन्हें Company ने Payment करके चुना')) +
        card(d.paid.trainees, __t('Training Fee भरने वाले'), '#2e7d32', __t('आपकी ID से Admission लेकर ₹99 Fee भरी') + ' · ' + money(d.money.trainingEarned)) +
        card(money(d.money.earned), __t('आपके कुल बने'), '#0B1F3A') +
        card(money(d.money.paid), __t('आपको मिल चुके (Paid)'), '#2e7d32') +
        card(money(d.money.pending), __t('बाकी'), '#E8A33D') + '</div>';
      h += '<p class="dash-note">' + __t('सिर्फ़ तब गिना जाता है जब Company या Training Candidate ने सच में Payment किया हो — सिर्फ़ फॉर्म भरने पर नहीं।') + '</p>';
      if (d.entries && d.entries.length) {
        var th = 'padding:5px;text-align:left;';
        h += '<div style="overflow-x:auto;"><table class="comm-tbl"><tr style="background:#D9E1F2;"><th style="' + th + '">Date</th><th style="' + th + '">Company</th><th style="' + th + '">' + __t('किस बात का') + '</th><th style="' + th + '">' + __t('भूमिका') + '</th><th style="' + th + 'text-align:right;">' + __t('आपका हिस्सा') + '</th><th style="' + th + '">Status</th></tr>';
        d.entries.slice().reverse().forEach(function (e) {
          h += '<tr style="border-bottom:1px solid #eee;"><td style="padding:5px;">' + esc(String(e.paidOn).slice(0, 10)) + '</td><td style="padding:5px;">' + esc(e.companyId) + '<br><span style="font-size:11px;color:#596579;">' + esc(e.companyName) + '</span></td><td style="padding:5px;">' + esc(e.feeType) + '<br><span style="font-size:11px;color:#596579;">' + esc(e.itemIds) + '</span></td><td style="padding:5px;">' + esc(roleText(e.role)) + '</td><td style="padding:5px;text-align:right;font-weight:700;">' + money(e.share) + '</td><td style="padding:5px;">' + esc(e.payoutStatus) + '</td></tr>';
        });
        h += '</table></div>';
        h += '<button class="btn" style="background:#2ecc71;color:#fff;width:100%;justify-content:center;margin-top:10px;" onclick="downloadMyCommission()">' + __t('⬇️ Payment हिसाब Excel Download करें') + '</button>';
      } else h += '<p style="font-size:13px;">' + __t('इस Range में अभी कोई Payment हिसाब नहीं बना।') + '</p>';
      box.innerHTML = h;
    } catch (err) { box.innerHTML = ''; }
  };

  window.downloadMyCommission = function () {
    if (!lastMine || typeof XLSX === 'undefined') return;
    var d = lastMine;
    var head = [['EkVeera — ' + d.staffCode + ' Payment Statement'], [rangeLabel(d)], ['Total earned', d.money.earned, 'Paid', d.money.paid, 'Pending', d.money.pending], []];
    var cols = ['Request ID', 'Paid On', 'Company ID', 'Company Name', 'Fee Type', 'Item IDs', 'Brought By', 'Role', 'Your Share (₹)', 'Payout Status', 'Payout Date'];
    var rows = (d.entries || []).map(function (e) { return [e.requestId, e.paidOn, e.companyId, e.companyName, e.feeType, e.itemIds, e.broughtBy, e.role, e.share, e.payoutStatus, e.payoutDate]; });
    var ws = XLSX.utils.aoa_to_sheet(head.concat([cols], rows));
    ws['!cols'] = [{ wch: 11 }, { wch: 17 }, { wch: 11 }, { wch: 24 }, { wch: 26 }, { wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 13 }, { wch: 12 }, { wch: 12 }];
    var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, 'EkVeera_' + d.staffCode + '_Payments_' + Date.now() + '.xlsx');
  };

  /* Staff Login/Refresh के बाद अपने-आप हिसाब भी लोड हो; Admin की तारीख बदलने पर Commission भी बदले */
  var origMy = window.loadMyPerformance;
  if (typeof origMy === 'function') {
    window.loadMyPerformance = async function (isLogin) { var r = await origMy.apply(this, arguments); window.loadMyCommission(); return r; };
  }
  var origRel = window._spReload;
  if (typeof origRel === 'function') {
    window._spReload = function (prefix) { origRel(prefix); if (prefix === 'staff') window.loadStaffCommission(); };
  }
})();
