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
      loadServiceDash(box, d.date);
    } catch (err) { box.innerHTML = '<p style="color:red;">' + __t('कुछ गड़बड़ हो गई।') + '</p>'; }
  };

  /* v18: For Rent / Home Service / Ekveera Tution / Register का पूरा हिसाब — Candidate/Company के नीचे जुड़ता है */
  async function loadServiceDash(box, dayLabel) {
    var host = document.createElement('div'); host.id = 'dashServices';
    host.innerHTML = '<p class="dash-note">' + __t('For Rent / Home Service / Tution का हिसाब आ रहा है...') + '</p>';
    var old = $('dashServices'); if (old) old.remove();
    box.appendChild(host);
    var di = $('dashDate'), d2 = null, legacy = false;
    try { d2 = await vcSecurePost({ action: 'admindash', password: ekveeraAdminPassword, date: di ? di.value : '' }); } catch (e) { d2 = null; }
    if (!d2 || d2.status !== 'ok') {          // Apps Script में नई फ़ाइल अभी नहीं डली — पुराने 3 Action से "आज" का हिसाब दिखाएँ
      var pw = ekveeraAdminPassword, r1 = null, r2 = null, r3 = null;
      try { r1 = await vcSecurePost({ action: 'rentstats', password: pw }); r2 = await vcSecurePost({ action: 'hsstats', password: pw }); r3 = await vcSecurePost({ action: 'tutstats', password: pw }); } catch (e) {}
      if (r1 && r1.status === 'ok' && r2 && r2.status === 'ok' && r3 && r3.status === 'ok') {
        legacy = true;
        d2 = { status: 'ok', date: __t('आज'),
          rent: { givers: r1.givers, giversDay: r1.giversToday, giversPaid: r1.giversPaid, giversPaidDay: r1.giversPaidToday, active: r1.activeGivers, items: r1.items, itemsDay: r1.itemsToday, orders: r1.orders, ordersDay: r1.ordersToday, ordersPaid: r1.ordersPaid, ordersPaidDay: r1.ordersPaidToday, income: r1.collectedTotal, incomeDay: r1.collectedToday },
          tut: { teachers: r3.teachers, teachersDay: r3.teachersToday, teachersPaid: r3.teachersPaid, teachersPaidDay: r3.teachersPaidToday, active: r3.activeTeachers, skills: r3.skills, skillsDay: r3.skillsToday, orders: r3.orders, ordersDay: r3.ordersToday, ordersPaid: r3.ordersPaid, ordersPaidDay: r3.ordersPaidToday, income: r3.collectedTotal, incomeDay: r3.collectedToday },
          hs: { karigar: r2.karigar, karigarDay: r2.karigarToday, karigarPaid: r2.karigarPaid, karigarPaidDay: r2.karigarPaidToday, active: r2.active, approved: null, pendingApproval: r2.pendingApproval, orders: r2.orders, ordersDay: r2.ordersToday, ordersPaid: r2.ordersPaid, ordersPaidDay: r2.ordersPaidToday, checks: null, checksDay: null, income: r2.collectedTotal, incomeDay: r2.collectedToday },
          reg: null, grandIncome: (r1.collectedTotal || 0) + (r2.collectedTotal || 0) + (r3.collectedTotal || 0), grandIncomeDay: (r1.collectedToday || 0) + (r2.collectedToday || 0) + (r3.collectedToday || 0) };
      }
    }
    if (!d2 || d2.status !== 'ok') { host.innerHTML = '<p class="dash-note" style="color:#c0392b;">' + esc((d2 && d2.message) || __t('For Rent / Home Service / Tution का हिसाब नहीं आ पाया — Internet देखें, या Apps Script में नई EkVeera_AdminExtra फ़ाइल डालकर Deploy → New version करें।')) + '</p>'; return; }
    var day = esc(legacy ? __t('आज') : d2.date), n = function (v) { return v == null ? '—' : v; };
    var C = '#1F9D95', G = '#2e7d32', N = '#0B1F3A', A = '#E8A33D', Z = '#6b778c', h = '';
    h += '<p class="dash-h">💰 ' + __t('तीनों सेवाओं की कमाई (For Rent + Home Service + Tution)') + '</p><div class="dash-grid">' +
      card(money(d2.grandIncomeDay), __t('इस दिन की कुल कमाई'), G, day) + card(money(d2.grandIncome), __t('अब तक की कुल कमाई'), N, __t('For Rent ') + money(d2.rent.income) + ' · ' + __t('Home Service ') + money(d2.hs.income) + ' · Tution ' + money(d2.tut.income)) + '</div>';
    if (d2.reg) {
      var by = d2.reg.by || {};
      h += '<p class="dash-h">📝 ' + __t('Register (Notification के लिए जुड़े लोग)') + '</p><div class="dash-grid">' +
        card(d2.reg.day, __t('इस दिन नए Register'), C, day) + card(d2.reg.total, __t('कुल Register'), N,
          __t('Training ') + (by.training || 0) + ' · ' + __t('Placement ') + (by.placement || 0) + ' · For Rent ' + (by.rent || 0) + ' · ' + __t('Home Service ') + (by.home || 0) + ' · Tution ' + (by.tution || 0)) + '</div>';
    }
    var r = d2.rent;
    h += '<p class="dash-h">🏍️ For Rent</p><div class="dash-grid">' +
      card(n(r.giversDay), __t('इस दिन नए Giver Register'), C, day) + card(n(r.giversPaidDay), __t('इस दिन Payment करने वाले Giver'), G, money(r.incomeDay) + __t(' कमाई (सभी Payment)')) +
      card(n(r.givers), __t('कुल Giver Register'), N, __t('Payment हुई: ') + n(r.giversPaid) + __t(' · चालू: ') + n(r.active)) + card(n(r.items), __t('कुल सामान जुड़े'), Z, __t('इस दिन नए: ') + n(r.itemsDay)) +
      card(n(r.ordersDay), __t('इस दिन Taker Order'), C, __t('Payment हुई: ') + n(r.ordersPaidDay)) + card(n(r.ordersPaid), __t('कुल Taker (Payment हुई)'), N, __t('कुल Order: ') + n(r.orders)) +
      card(money(r.income), __t('For Rent की कुल कमाई'), A) + '</div>';
    var k = d2.hs;
    h += '<p class="dash-h">🏠 Home Service</p><div class="dash-grid">' +
      card(n(k.karigarDay), __t('इस दिन नए कारीगर Register'), C, day) + card(n(k.karigarPaidDay), __t('इस दिन Payment करने वाले कारीगर'), G, money(k.incomeDay) + __t(' कमाई (सभी Payment)')) +
      card(n(k.karigar), __t('कुल कारीगर Register'), N, __t('Payment हुई: ') + n(k.karigarPaid) + __t(' · चालू: ') + n(k.active)) +
      card(n(k.pendingApproval), __t('जाँच / मंज़ूरी बाकी कारीगर'), A, __t('मंज़ूर: ') + n(k.approved)) +
      card(n(k.ordersDay), __t('इस दिन Customer Order'), C, __t('Payment हुई: ') + n(k.ordersPaidDay)) + card(n(k.ordersPaid), __t('कुल Customer (Payment हुई)'), N, __t('कुल Order: ') + n(k.orders)) +
      card(n(k.checksDay), __t('इस दिन ग्राहक ने कारीगर की ID जाँची'), Z, __t('कुल जाँच: ') + n(k.checks)) + card(money(k.income), __t('Home Service की कुल कमाई'), A) + '</div>';
    var t = d2.tut;
    h += '<p class="dash-h">🎓 Ekveera Tution</p><div class="dash-grid">' +
      card(n(t.teachersDay), __t('इस दिन नए Teacher Register'), C, day) + card(n(t.teachersPaidDay), __t('इस दिन Payment करने वाले Teacher'), G, money(t.incomeDay) + __t(' कमाई (सभी Payment)')) +
      card(n(t.teachers), __t('कुल Teacher Register'), N, __t('Payment हुई: ') + n(t.teachersPaid) + __t(' · चालू: ') + n(t.active)) + card(n(t.skills), __t('कुल Skill जुड़ीं'), Z, __t('इस दिन नई: ') + n(t.skillsDay)) +
      card(n(t.ordersDay), __t('इस दिन Student Order'), C, __t('Payment हुई: ') + n(t.ordersPaidDay)) + card(n(t.ordersPaid), __t('कुल Student (Payment हुई)'), N, __t('कुल Order: ') + n(t.orders)) +
      card(money(t.income), __t('Tution की कुल कमाई'), A) + '</div>';
    if (legacy) h += '<p class="dash-note" style="color:#8a5a00;">' + __t('⚠️ अभी Apps Script में पुरानी फ़ाइल है, इसलिए सिर्फ़ "आज" का हिसाब दिख रहा है। पूरा (तारीख़ के हिसाब से) हिसाब पाने के लिए नई EkVeera_AdminExtra फ़ाइल डालकर Deploy → New version करें।') + '</p>';
    h += '<p class="dash-note">' + __t('"Payment हुई" = जिन्होंने Payment कर दी। "कुल Register" में वे भी हैं जिन्होंने Form भरा पर Payment अभी नहीं की। कमाई Payment-Ledger से आती है।') + '</p>';
    host.innerHTML = h;
  }

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

  /* 🏍️ For Rent / 🏠 Home Service / 🎓 Tution — Staff ka apna hisaab (v25) */
  function servicesPanel(list) {
    if (!list || !list.length) return '';
    var h = '<div style="border:2px solid #dbe4f0;border-radius:12px;padding:12px;margin:14px 0;background:#fbfcfe"><h4 style="margin:0 0 8px;">🧾 ' + __t('For Rent · Home Service · Tution का हिसाब') + '</h4>';
    list.forEach(function (x) {
      h += '<div style="border:1px solid #e3e9f2;border-radius:10px;padding:10px;margin-bottom:10px;background:#fff"><div style="font-weight:800;color:#0B1F3A;margin-bottom:6px">' + x.icon + ' ' + esc(x.label) + '</div>' +
        '<div class="dash-grid">' +
        card(x.registered, __t('आपकी ID से जुड़े') + ' ' + esc(x.who), '#1F9D95') +
        card(x.regPaid, __t('Registration Payment हुई'), '#2e7d32', __t('आपकी ID वाले')) +
        card(x.orders, __t('Order Payment (₹29)'), '#2e7d32', __t('आपकी ID वाले की')) +
        card(money(x.earned), __t('आपके बने'), '#0B1F3A') +
        card(money(x.paid), __t('आपको मिल चुके'), '#2e7d32') +
        card(money(x.pending), __t('बाकी'), '#E8A33D') + '</div></div>';
    });
    return h + '<p class="dash-note" style="margin:4px 0 0;">' + __t('सिर्फ़ तब गिना जाता है जब उसने सच में Payment किया हो। नीचे की सूची में हर Payment अलग दिखती है।') + '</p></div>';
  }

  /* 💸 भुगतान का हिसाब (पूरे समय का): मिला / Advance / बाकी — Admin जो भुगतान दर्ज करता है वही यहाँ दिखता है */
  function dmy(x) { var m = String(x || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '-' + m[2] + '-' + m[1] : String(x || ''); }
  function payoutPanel(p) {
    if (!p) return '';
    var h = '<div style="border:2px solid #cfe5d6;border-radius:12px;padding:12px;margin:14px 0;background:#f6fbf8"><h4 style="margin:0 0 6px;">💸 ' + __t('आपके भुगतान का हिसाब (अब तक का)') + '</h4>';
    h += '<div class="dash-grid">' + card(money(p.earned), __t('अब तक कुल बने'), '#0B1F3A') +
      card(money(p.payoutPaid + p.paidBefore), __t('आपको मिल चुके'), '#2e7d32') +
      card(money(p.advance || 0), __t('Advance लिया'), '#8a5a00', __t('कुल में से कटता है')) +
      card(money(p.netDue > 0 ? p.netDue : 0), __t('अभी बाकी'), p.netDue > 0 ? '#E8A33D' : '#2e7d32') + '</div>';
    if (p.lastPayout) h += '<p style="margin:8px 0 0;font-size:13.5px;font-weight:700;color:#1b7f3b">✅ ' + __t('आपकी Payment हो चुकी है') + ' — ' + __t('आख़िरी भुगतान') + ' ' + dmy(p.lastPayout.date) + ' ' + __t('को') + ' ' + money(p.lastPayout.amount) + ' (' + esc(p.lastPayout.mode) + (p.lastPayout.ref ? ' · ' + esc(p.lastPayout.ref) : '') + ')' + (p.paidUpTo ? ' — ' + esc(p.paidUpTo) + ' ' + __t('तक की कमाई का हिसाब चुकता') : '') + '</p>';
    if (p.advanceBalance > 0) h += '<p style="margin:6px 0 0;font-size:13px;color:#8a5a00">ℹ️ ' + __t('आपका Advance') + ' ' + money(p.advanceBalance) + ' ' + __t('अभी बाक़ी है — यह आगे की कमाई में अपने-आप कटेगा।') + '</p>';
    else if (p.netDue <= 0 && p.earned > 0) h += '<p style="margin:6px 0 0;font-size:13px;color:#1b7f3b">' + __t('अभी आपका कुछ बाकी नहीं है।') + '</p>';
    if (p.recent && p.recent.length) {
      h += '<div style="overflow-x:auto;margin-top:8px"><table class="comm-tbl"><tr style="background:#D9E1F2;"><th style="padding:5px;text-align:left;">' + __t('तारीख़') + '</th><th style="padding:5px;text-align:left;">' + __t('प्रकार') + '</th><th style="padding:5px;text-align:right;">' + __t('रकम') + '</th><th style="padding:5px;text-align:left;">Mode / UTR</th></tr>';
      p.recent.forEach(function (r) { h += '<tr style="border-bottom:1px solid #eee;"><td style="padding:5px;">' + dmy(r.date) + '</td><td style="padding:5px;">' + (r.type === 'Advance' ? 'Advance' : __t('भुगतान')) + '</td><td style="padding:5px;text-align:right;font-weight:700;">' + money(r.amount) + '</td><td style="padding:5px;">' + esc(r.mode) + (r.ref ? '<br><span style="font-size:11px;color:#596579;">' + esc(r.ref) + '</span>' : '') + '</td></tr>'; });
      h += '</table></div>';
    }
    return h + '<p class="dash-note" style="margin:8px 0 0;">' + __t('बाकी = कुल बने − मिले − Advance। यह Admin के दर्ज किए भुगतान से अपने-आप बनता है।') + '</p></div>';
  }

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
      h += servicesPanel(d.services);
      h += payoutPanel(d.payout);
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
