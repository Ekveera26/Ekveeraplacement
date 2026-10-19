/* EkVeera — Admin: Staff का Referral Link बनाना (Advertisement के लिए)
   Staff "Staff List" Sheet में जुड़ता है (Apps Script: EkVeera_AdminExtra.gs → stafflinkadd / stafflinklist), वेबसाइट की किसी फ़ाइल में नहीं —
   इसलिए वेबसाइट की फ़ाइलें बदलने / दोबारा GitHub पर डालने पर भी Staff और उसका Commission-हिसाब (कौन किसके under है) कभी नहीं खोता। */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pw() { return window.ekveeraAdminPassword; }
  function base() { return location.origin + location.pathname.replace(/[^\/]*$/, ''); }
  function say(t, color) { var m = $('slMsg'); if (!m) return; m.style.color = color || '#333'; m.textContent = t || ''; }
  var staff = [];

  function fillUnder() {
    var sel = $('slUnder'); if (!sel) return; var keep = sel.value;
    sel.innerHTML = '<option value="">' + esc(__t('सीधा Admin के under (कोई Team Leader नहीं)')) + '</option>' +
      staff.map(function (s) { return '<option value="' + esc(s.id) + '">' + esc(s.id + (s.name ? ' — ' + s.name : '')) + '</option>'; }).join('');
    sel.value = keep;
  }
  function copy(text, btn) {
    var ok = function () { if (!btn) return; var o = btn.textContent; btn.textContent = __t('✅ Copy हो गया'); setTimeout(function () { btn.textContent = o; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, function () { window.prompt(__t('Link Copy करें:'), text); });
    else window.prompt(__t('Link Copy करें:'), text);
  }
  function waText(s) { return __t('EkVeera Placement & Services — Training, Job Placement, For Rent, Home Service और Tution, सब एक ही जगह। यह Link खोलें:') + ' ' + s.links.main; }
  function linkRow(label, url) {
    return '<div style="margin:6px 0"><div style="font-size:12px;color:#596579;font-weight:700">' + esc(label) + '</div>' +
      '<div style="display:flex;gap:6px;align-items:center"><input readonly value="' + esc(url) + '" onclick="this.select()" style="flex:1;min-width:0;padding:7px;border:1px solid var(--line);border-radius:6px;font-size:12.5px;background:#fff">' +
      '<button type="button" class="btn" data-sl-copy="' + esc(url) + '" style="padding:6px 12px;font-size:12.5px;border:1px solid var(--line)">📋 Copy</button></div></div>';
  }
  function card(s, hl) {
    return '<div style="border:' + (hl ? '2px solid #2e9b57;background:#e7f7ee' : '1px solid #d9e1e8;background:#fff') + ';border-radius:10px;padding:10px;margin-bottom:10px">' +
      '<div style="font-weight:800">' + esc(s.id) + (s.name ? ' — ' + esc(s.name) : '') + '</div>' +
      '<div style="font-size:12px;color:#596579">' + esc(s.under ? __t('Team Leader: ') + s.under : __t('सीधा Admin के under')) + '</div>' +
      linkRow(__t('🔗 Main Link — Advertisement / सबको यही भेजें'), s.links.main) +
      '<details style="margin-top:4px"><summary style="cursor:pointer;font-size:12.5px;font-weight:700">' + esc(__t('और Link (Training / Placement / Staff का Performance)')) + '</summary>' +
      linkRow(__t('🎓 Training Page Link'), s.links.training) + linkRow(__t('💼 Placement Page Link'), s.links.placement) + linkRow(__t('📊 Staff View Link (Staff अपना Performance देखे)'), s.links.view) + '</details>' +
      '<a class="btn btn-primary" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(waText(s)) + '" style="margin-top:8px;padding:6px 12px;font-size:12.5px;display:inline-flex">💬 ' + esc(__t('WhatsApp पर भेजें')) + '</a></div>';
  }

  window.slLoad = async function (quiet) {
    if (quiet !== true) say(__t('⏳ सूची आ रही है...'));
    try {
      var d = await vcSecurePost({ action: 'stafflinklist', password: pw(), base: base() });
      if (d.status !== 'ok') { if (quiet !== true) say(d.message || __t('सूची नहीं आ पाई।'), 'red'); return; }
      staff = d.staff || []; fillUnder();
      if (quiet === true) return;
      say('');
      $('slList').innerHTML = staff.length ? '<p style="font-weight:700;margin:6px 0">' + esc(__t('कुल Staff: ')) + staff.length + '</p>' + staff.map(function (s) { return card(s, false); }).join('') +
        '<button type="button" class="btn" onclick="slExcel()" style="border:1px solid var(--line);width:100%;justify-content:center">⬇️ ' + esc(__t('सारे Link Excel में Download करें')) + '</button>' :
        '<p>' + esc(__t('अभी Staff List खाली है।')) + '</p>';
    } catch (e) { if (quiet !== true) say(__t('Server से जवाब नहीं मिला — Internet देखें।'), 'red'); }
  };
  window.slCreate = async function () {
    var name = $('slName').value.trim(), id = $('slId').value.trim(), under = $('slUnder').value;
    if (name.length < 2) return say(__t('Staff का नाम लिखें।'), 'red');
    var btn = $('slBtn'); btn.disabled = true; say(__t('⏳ Link बन रहा है...'));
    var d = null; try { d = await vcSecurePost({ action: 'stafflinkadd', password: pw(), name: name, staffId: id, under: under, base: base() }); } catch (e) { d = null; }
    btn.disabled = false;
    if (!d) {      // जवाब नहीं आया — हो सकता है बन चुका हो: सूची देखकर बताएँ
      await slLoad(true);
      var f = staff.filter(function (s) { return s.name.toLowerCase() === name.toLowerCase() && (!id || s.id.toLowerCase() === id.toLowerCase()); })[0];
      if (f) { say('✅ ' + __t('Staff जुड़ चुका है (Server ने जवाब देर से दिया)।'), 'green'); $('slOut').innerHTML = card(f, true); return; }
      return say(__t('Internet / Server से जवाब नहीं मिला। "सभी Staff के Link" दबाकर देखें, न दिखे तो दोबारा कोशिश करें।'), 'red');
    }
    if (d.status !== 'ok') return say(d.message || __t('Link नहीं बन पाया।'), 'red');
    say(d.message, 'green'); $('slOut').innerHTML = card(d.staff, true); $('slName').value = ''; $('slId').value = '';
    staff.push(d.staff); fillUnder(); try { $('slOut').scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e2) {}
  };
  window.slExcel = function () {
    if (typeof XLSX === 'undefined') return say(__t('Excel बनाने वाली Library अभी लोड नहीं हुई — Internet देखें।'), 'red');
    var rows = [['Staff ID', 'Name', 'Under (Team Leader)', 'Main Link', 'Training Link', 'Placement Link', 'Staff View Link']].concat(staff.map(function (s) { return [s.id, s.name, s.under || '—', s.links.main, s.links.training, s.links.placement, s.links.view]; }));
    var ws = XLSX.utils.aoa_to_sheet(rows); ws['!cols'] = [{ wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 60 }, { wch: 60 }, { wch: 60 }, { wch: 60 }];
    var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Staff Links'); XLSX.writeFile(wb, 'EkVeera_Staff_Links.xlsx');
  };
  document.addEventListener('click', function (e) { var b = e.target.closest ? e.target.closest('[data-sl-copy]') : null; if (b) copy(b.getAttribute('data-sl-copy'), b); });
})();
