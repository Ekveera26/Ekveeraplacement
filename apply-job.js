/* EkVeera — Candidate se Company ko "Apply" + Company ke "Applications" (placement.html)
   Privacy: Company ko SIRF Job Master / Job Master 1 wali jaankari jaati hai (shahar, yogyata, anubhav, skills, umar, salary, job type).
   Naam / Mobile / Email / Resume Company ko nahi dikhte — wo poori jaankari sirf purane Payment wale tareeke se milti hai.
   backend: EkVeera_Applications.gs (applytojob, getcompanyapplicants) */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pick(row, name) { var k = Object.keys(row).filter(function (x) { return x.trim().toLowerCase() === name; })[0]; return k ? String(row[k] == null ? '' : row[k]).trim() : ''; }

  var cur = null;

  /* ---------------- Candidate: Apply popup ---------------- */
  window.openApply = function (i) {
    var row = (typeof lastSearchCompResults !== 'undefined') ? lastSearchCompResults[i] : null; if (!row) return;
    cur = { vacancyId: pick(row, 'vacancy id'), companyId: pick(row, 'company id'), title: pick(row, 'job title'), city: pick(row, 'city') };
    if (!cur.vacancyId || !cur.companyId) { alert('इस Row में Vacancy की जानकारी पूरी नहीं है — कृपया दोबारा Search करें।'); return; }
    $('apJob').textContent = (cur.title || 'Job') + (cur.city ? ' • ' + cur.city : '') + '  (' + cur.companyId + ' / ' + cur.vacancyId + ')';
    $('apMsg').textContent = ''; $('apDone').style.display = 'none'; $('apForm').style.display = 'block';
    try { var saved = JSON.parse(localStorage.getItem('ekveera_apply_me') || '{}'); if (saved.id && !$('apId').value) $('apId').value = saved.id; if (saved.mob && !$('apMob').value) $('apMob').value = saved.mob; } catch (e) {}
    $('applyModal').style.display = 'flex'; document.body.style.overflow = 'hidden';
    setTimeout(function () { try { ($('apId').value ? $('apMob') : $('apId')).focus(); } catch (e) {} }, 80);
  };
  window.closeApply = function () { $('applyModal').style.display = 'none'; document.body.style.overflow = ''; cur = null; };

  window.submitApply = async function () {
    if (!cur) return;
    var id = $('apId').value.trim(), mob = $('apMob').value.trim(), msg = $('apMsg'), btn = $('apBtn');
    msg.style.color = '#c0392b';
    if (!/^(CAND|TRA-CAND)\d+$/i.test(id.replace(/\s+/g, ''))) { msg.textContent = 'अपनी ID सही डालें (जैसे CAND001 या TRA-CAND001)।'; return; }
    if (mob.replace(/\D/g, '').length < 10) { msg.textContent = 'फॉर्म में दिया 10 अंकों का Mobile Number डालें।'; return; }
    if (!$('apConsent').checked) { msg.textContent = 'नीचे सहमति (✔) पर टिक करें।'; return; }
    btn.disabled = true; var old = btn.textContent; btn.textContent = '⏳ भेजा जा रहा है...'; msg.style.color = '#334056'; msg.textContent = '';
    try {
      var d = await vcSecurePost({ action: 'applytojob', candidateId: id, mobile: mob, vacancyId: cur.vacancyId, companyId: cur.companyId, consent: 'yes', website: $('apWebsite').value });
      if (d.status === 'ok') {
        try { localStorage.setItem('ekveera_apply_me', JSON.stringify({ id: id.toUpperCase().replace(/\s+/g, ''), mob: mob })); } catch (e) {}
        $('apForm').style.display = 'none'; $('apDone').style.display = 'block';
        $('apDoneId').textContent = d.applicationId;
        $('apDoneTxt').textContent = '"' + (d.title || cur.title) + '" (' + d.companyId + ') के लिए आपका Application भेज दिया गया है।' + (d.mailed ? ' Company को Email से सूचना भी चली गई है।' : '');
      } else { msg.style.color = '#c0392b'; msg.textContent = d.message || 'Apply नहीं हो पाया।'; }
    } catch (e) { msg.style.color = '#c0392b'; msg.textContent = 'Internet चेक करके दोबारा कोशिश करें।'; }
    btn.disabled = false; btn.textContent = old;
  };

  /* ---------------- Company: apne Applications dekhna ---------------- */
  var appRows = [];
  window.loadApplicants = async function () {
    var cid = $('appCompanyId').value.trim(), mob = $('appCompanyMobile').value.trim(), box = $('appList'), msg = $('appMsg');
    msg.style.color = '#ffb4a8'; msg.textContent = ''; box.textContent = '';
    if (!/^COMP\d+$/i.test(cid)) { msg.textContent = 'अपनी Company ID डालें (जैसे COMP001)।'; return; }
    if (mob.replace(/\D/g, '').length < 10) { msg.textContent = 'Requirement फॉर्म में दिया Contact Mobile (10 अंक) डालें।'; return; }
    msg.style.color = '#c9d6e8'; msg.textContent = 'देखा जा रहा है...';
    try {
      var d = await vcSecurePost({ action: 'getcompanyapplicants', companyId: cid, mobile: mob });
      if (d.status !== 'ok') { msg.style.color = '#ffb4a8'; msg.textContent = d.message || 'लोड नहीं हो पाया।'; return; }
      appRows = d.items || []; msg.textContent = '';
      if (!appRows.length) { box.innerHTML = '<p style="color:#c9d6e8;font-size:13.5px;">अभी तक आपकी Vacancy पर किसी Candidate ने Apply नहीं किया है। (नया Application आने पर आपको Email भी आएगा।)</p>'; return; }
      var h = '<p style="color:#c9d6e8;font-size:13px;margin:0 0 8px;">✅ ' + esc(d.companyName || cid) + ' — ' + appRows.length + ' Application। 🔒 Candidate का नाम / Mobile / Email / Resume यहां नहीं दिखते।</p><div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12.5px;"><tr style="background:var(--navy);color:#fff;"><th style="padding:7px;">चुनें</th><th style="padding:7px;text-align:left;">ID</th><th style="padding:7px;text-align:left;">Vacancy</th><th style="padding:7px;text-align:left;">शहर</th><th style="padding:7px;text-align:left;">योग्यता</th><th style="padding:7px;">अनुभव</th><th style="padding:7px;">उम्र</th><th style="padding:7px;text-align:left;">Skills</th><th style="padding:7px;text-align:left;">Salary / Job</th><th style="padding:7px;text-align:left;">Status</th></tr>';
      appRows.forEach(function (r, i) {
        var p = r.profile || {}, off = /Placed/.test(r.status);
        h += '<tr style="background:' + (i % 2 ? '#f5f7fa' : '#fff') + ';color:#152241;' + (off ? 'opacity:.55;' : '') + '"><td style="padding:6px;text-align:center;"><input type="checkbox" class="app-pick" value="' + esc(r.candidateId) + '"' + (off ? ' disabled' : '') + '></td>' +
          '<td style="padding:6px;"><strong>' + esc(r.candidateId) + '</strong></td><td style="padding:6px;">' + esc(r.jobTitle) + '<br><span style="font-size:11px;color:#596579;">' + esc(r.vacancyId) + '</span></td><td style="padding:6px;">' + esc(p.city) + '</td><td style="padding:6px;">' + esc(p.qualification) + '</td><td style="padding:6px;text-align:center;">' + esc(p.experience) + '</td><td style="padding:6px;text-align:center;">' + esc(p.age) + '</td><td style="padding:6px;max-width:220px;">' + esc(p.skills) + '</td><td style="padding:6px;">' + esc(p.salary) + (p.jobType ? '<br><span style="font-size:11px;color:#596579;">' + esc(p.jobType) + '</span>' : '') + '</td><td style="padding:6px;">' + esc(r.status) + '</td></tr>';
      });
      h += '</table></div><button type="button" class="btn btn-primary" style="margin-top:12px;width:100%;justify-content:center;" onclick="useSelectedApplicants()">✅ चुने हुए Candidate की पूरी जानकारी पाने के लिए आगे बढ़ें (₹99/post + ₹29/candidate)</button>';
      box.innerHTML = h;
    } catch (e) { msg.style.color = '#ffb4a8'; msg.textContent = 'Internet चेक करके दोबारा कोशिश करें।'; }
  };

  window.useSelectedApplicants = function () {
    var ids = Array.prototype.map.call(document.querySelectorAll('.app-pick:checked'), function (c) { return c.value; });
    if (!ids.length) { alert('पहले Table में से कम-से-कम एक Candidate चुनें।'); return; }
    $('reqCompanyId').value = $('appCompanyId').value.trim().toUpperCase();
    $('reqIds').value = ids.join(', ');
    if (typeof updateReqPrice === 'function') updateReqPrice();
    $('reqIds').scrollIntoView({ behavior: 'smooth', block: 'center' });
    var m = $('reqResultMsg'); if (m) { m.style.color = '#c9d6e8'; m.textContent = '✅ चुनी हुई IDs भर दी गई हैं — "कितनी अलग-अलग Post हैं?" जांचकर "Request भेजें" दबाएं।'; }
  };

  /* ---------------- Help page / dusre page se seedha kaam par aana: ?do=... ---------------- */
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('applyModal') && $('applyModal').style.display === 'flex') closeApply(); });
})();
