/* EkVeera — Candidate ke liye Company ki Details (Paid ₹29 per Company)
   Job Inquiry / Apply = FREE.  Company ka Pata + Benefits Form = ₹29 PER COMPANY (2 Company = ₹58).
   Server: EkVeera_CompanyDetails.gs   (actions: requestcompanydetails , getcompanydetails) */
(function () {
  'use strict';
  var PRICE = 29;
  var picked = {};                       // row-index -> {vacancyId, companyId, title}
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pick(row, name) { var k = Object.keys(row || {}).filter(function (x) { return x.trim().toLowerCase() === name; })[0]; return k ? String(row[k] == null ? '' : row[k]).trim() : ''; }
  function rows() { return (typeof lastSearchCompResults !== 'undefined' && lastSearchCompResults) || []; }

  function companies() {            // chuni hui Rows me se alag-alag Company
    var seen = {}, list = [];
    Object.keys(picked).forEach(function (i) { var c = picked[i]; if (!seen[c.companyId]) { seen[c.companyId] = 1; list.push(c); } });
    return list;
  }
  function vacIds() { return Object.keys(picked).map(function (i) { return picked[i].vacancyId; }); }

  window.ekvCoReset = function () { picked = {}; bar(); };
  window.ekvCoIsPicked = function (i) { return !!picked[i]; };
  window.ekvCoPick = function (i, on) {
    var r = rows()[i];
    if (on && r) {
      var v = pick(r, 'vacancy id'), c = pick(r, 'company id');
      if (!v || !c) { alert(__t('इस Row में Vacancy की जानकारी पूरी नहीं है — कृपया दोबारा Search करें।')); var cb = document.querySelector('.co-cb[data-i="' + i + '"]'); if (cb) cb.checked = false; return; }
      picked[i] = { vacancyId: v, companyId: c, title: pick(r, 'job title'), city: pick(r, 'city') };
    } else delete picked[i];
    bar();
  };
  function bar() {
    var b = $('coSelBar'); if (!b) return;
    var n = companies().length;
    if (!n) { b.style.display = 'none'; b.innerHTML = ''; return; }
    b.style.display = 'flex';
    b.innerHTML = '<span class="csb-n">🏢 ' + n + ' ' + esc(__t('Company चुनी')) + ' — ₹' + (n * PRICE) + '</span>' +
      '<button type="button" class="csb-ok" onclick="cdOpen()">' + esc(__t('Details लें')) + '</button>' +
      '<button type="button" class="csb-clr" onclick="cdClear()">' + esc(__t('सब हटाएँ')) + '</button>';
  }
  window.cdClear = function () { picked = {}; document.querySelectorAll('.co-cb').forEach(function (c) { c.checked = false; }); bar(); };

  window.cdOpen = function () {
    var list = companies(); if (!list.length) return;
    $('cdSummary').textContent = list.length + ' ' + __t('Company') + ' × ₹' + PRICE + ' = ₹' + (list.length * PRICE) + '  (' + list.map(function (c) { return c.companyId; }).join(', ') + ')';
    $('cdMsg').textContent = ''; $('cdDone').style.display = 'none'; $('cdForm').style.display = 'block'; $('cdBtn').disabled = false;
    try { var s = JSON.parse(localStorage.getItem('ekveera_apply_me') || '{}'); if (s.id && !$('cdId').value) $('cdId').value = s.id; if (s.mob && !$('cdMob').value) $('cdMob').value = s.mob; } catch (e) {}
    $('cdModal').style.display = 'flex'; document.body.style.overflow = 'hidden';
  };
  window.cdClose = function () { $('cdModal').style.display = 'none'; document.body.style.overflow = ''; };

  window.cdSubmit = async function () {
    var id = $('cdId').value.replace(/\s+/g, '').toUpperCase(), mob = $('cdMob').value.replace(/\D/g, '').slice(-10), msg = $('cdMsg'), btn = $('cdBtn');
    msg.style.color = '#c0392b';
    if (!/^(CAND|TRA-CAND)\d+$/.test(id)) { msg.textContent = __t('अपनी ID सही डालें (जैसे CAND001 या TRA-CAND001)।'); return; }
    if (mob.length !== 10) { msg.textContent = __t('फॉर्म में दिया 10 अंकों का Mobile Number डालें।'); return; }
    if (!$('cdConsent').checked) { msg.textContent = __t('आगे बढ़ने के लिए सहमति (✔) देना ज़रूरी है।'); return; }
    btn.disabled = true; msg.style.color = '#1f3b63'; msg.textContent = __t('⏳ Payment Link बन रहा है...');
    try {
      var d = await vcSecurePost({ action: 'requestcompanydetails', candidateId: id, mobile: mob, vacancyIds: vacIds().join(','), consent: 'yes', website: $('cdWebsite').value });
      if (!d || d.status !== 'ok') { msg.style.color = '#c0392b'; msg.textContent = (d && d.message) || __t('कुछ गड़बड़ हो गई — दोबारा कोशिश करें।'); btn.disabled = false; return; }
      try { localStorage.setItem('ekveera_apply_me', JSON.stringify({ id: id, mob: mob })); localStorage.setItem('ekveera_cd_last', JSON.stringify({ req: d.requestId, id: id, mob: mob })); } catch (e) {}
      $('cdForm').style.display = 'none'; $('cdDone').style.display = 'block';
      $('cdDoneId').textContent = d.requestId;
      var extra = d.alreadyHad ? ' ' + __t('(जिनकी Details आप पहले ले चुके हैं, उनका दोबारा पैसा नहीं लगा।)') : '';
      $('cdDoneTxt').textContent = d.companies + ' ' + __t('Company') + ' — ₹' + d.amount + '.' + extra;
      var pb = $('cdPayBtn');
      if (d.payLink) { pb.href = d.payLink; pb.style.display = 'flex'; }
      else { pb.style.display = 'none'; $('cdDoneTxt').textContent += ' ' + __t('Payment Link अभी नहीं बन पाया — कृपया WhatsApp (9766284669) पर Request ID भेजें।'); }
      cdClear();
      var q = $('cdMineReq'); if (q) { q.value = d.requestId; $('cdMineId').value = id; $('cdMineMob').value = mob; }
    } catch (err) { msg.style.color = '#c0392b'; msg.textContent = __t('Internet चेक करके दोबारा कोशिश करें।'); btn.disabled = false; }
  };

  /* ---- Payment ke baad Details dekhna ---- */
  window.cdLoadMine = async function () {
    var req = $('cdMineReq').value.replace(/\s+/g, '').toUpperCase(), id = $('cdMineId').value.replace(/\s+/g, '').toUpperCase(), mob = $('cdMineMob').value.replace(/\D/g, '').slice(-10);
    var m = $('cdMineMsg'), out = $('cdMineOut'); out.innerHTML = ''; m.style.color = '#c0392b';
    if (!/^CDR\d+$/.test(req)) { m.textContent = __t('Request ID सही डालें (जैसे CDR001)।'); return; }
    if (!/^(CAND|TRA-CAND)\d+$/.test(id) || mob.length !== 10) { m.textContent = __t('अपनी ID और फॉर्म में दिया 10 अंकों का Mobile डालें।'); return; }
    m.style.color = '#1f3b63'; m.textContent = __t('⏳ देख रहे हैं...');
    try {
      var d = await vcSecurePost({ action: 'getcompanydetails', requestId: req, candidateId: id, mobile: mob });
      if (!d || d.status !== 'ok') { m.style.color = '#c0392b'; m.textContent = (d && d.message) || __t('कुछ गड़बड़ हो गई — दोबारा कोशिश करें।'); return; }
      if (d.requestStatus !== 'Approved') {
        m.style.color = '#b26a00'; m.textContent = __t('अभी Payment नहीं मिला। Payment होते ही यह अपने-आप खुल जाएगा (1-2 मिनट लग सकते हैं)।');
        if (d.payLink) out.innerHTML = '<a class="btn btn-primary" href="' + esc(d.payLink) + '" target="_blank" rel="noopener" style="margin-top:8px;">' + esc(__t('💳 अभी Pay करें')) + ' (₹' + esc(d.amount) + ')</a>';
        return;
      }
      m.style.color = '#1b7f3b'; m.textContent = __t('✅ Payment मिल गया — आपकी Company Details नीचे हैं।');
      out.innerHTML = (d.companies || []).map(card).join('');
    } catch (e) { m.style.color = '#c0392b'; m.textContent = __t('Internet चेक करके दोबारा कोशिश करें।'); }
  };
  function card(c) {
    var jobs = (c.jobs || []).map(function (j) { return '<li>' + esc(j.title) + (j.closing ? ' — ' + esc(__t('आख़िरी तारीख')) + ': ' + esc(j.closing) : '') + '</li>'; }).join('');
    var ben;
    if (c.benefitsFilled) {
      ben = '<details class="cd-ben"><summary>' + esc(__t('📋 Company Benefits Form (Company ने भरा है)')) + '</summary><table>' +
        c.benefits.map(function (b) { return '<tr><td>' + esc(b.question) + '</td><td><b>' + esc(b.answer) + '</b>' + (b.detail ? '<br><span>' + esc(b.detail) + '</span>' : '') + '</td></tr>'; }).join('') + '</table></details>';
    } else ben = '<p class="cd-nob">' + esc(__t('📋 इस Company ने अभी Benefits Form नहीं भरा है।')) + '</p>';
    return '<div class="cd-card"><h4>' + esc(c.name || c.companyId) + ' <small>(' + esc(c.companyId) + ')</small></h4>' +
      '<p>📍 ' + esc(c.address || __t('पता दर्ज नहीं है')) + (c.city ? ', ' + esc(c.city) : '') + '</p>' +
      (c.industry ? '<p>🏭 ' + esc(c.industry) + '</p>' : '') + (jobs ? '<ul>' + jobs + '</ul>' : '') + ben + '</div>';
  }
  (function prefill() {
    try { var l = JSON.parse(localStorage.getItem('ekveera_cd_last') || 'null'); if (l && $('cdMineReq')) { $('cdMineReq').value = l.req; $('cdMineId').value = l.id; $('cdMineMob').value = l.mob; } } catch (e) {}
  })();
})();
