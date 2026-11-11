/* EkVeera — Admin: 👁️ Link Visits (sab Staff ki ginti, Page aur src ke saath) — Apps Script: EkVeera_Visits.gs (action vadmin) */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var last = null;
  function td(v, c) { return '<td style="padding:5px;border-top:1px solid #e3e9ef;' + (c ? 'text-align:center;' : '') + '">' + v + '</td>'; }
  function th(v, c) { return '<th style="padding:5px;' + (c ? '' : 'text-align:left;') + '">' + esc(v) + '</th>'; }
  function list(title, arr) {
    return '<p style="font-weight:700;margin:12px 0 4px">' + esc(title) + '</p>' + (arr.length ? '<table style="width:100%;border-collapse:collapse;font-size:12.5px"><tr style="background:#eef3f8">' + th(__t('नाम')) + th(__t('खुला'), 1) + th(__t('अलग Device'), 1) + '</tr>' +
      arr.map(function (x) { return '<tr>' + td(esc(x.name)) + td(x.opens, 1) + td(x.uniq, 1) + '</tr>'; }).join('') + '</table>' : '<p style="font-size:12.5px">' + esc(__t('अभी कोई Visit नहीं।')) + '</p>');
  }
  window.visLoad = async function (fresh) {
    var m = $('visMsg'), out = $('visOut'); if (!m || !out) return;
    m.style.color = '#333'; m.textContent = __t('⏳ हिसाब आ रहा है...');
    try {
      var p = { action: 'vadmin', password: window.ekveeraAdminPassword }; if (fresh) p.fresh = '1';
      var d = await vcSecurePost(p);
      if (!d || d.status !== 'ok') { m.style.color = 'red'; m.textContent = (d && d.message) || __t('हिसाब नहीं आ पाया।'); return; }
      last = d; m.textContent = '';
      var rows = d.staff.map(function (s) {
        return '<tr>' + td('<b>' + esc(s.code || __t('(No staff)')) + '</b>' + (s.name ? '<br><span style="font-size:11.5px;color:#596579">' + esc(s.name) + '</span>' : '')) +
          td(s.today.opens + ' / ' + s.today.uniq, 1) + td(s.d7.opens + ' / ' + s.d7.uniq, 1) + td(s.d30.opens + ' / ' + s.d30.uniq, 1) + td(s.total, 1) + '</tr>';
      }).join('');
      out.innerHTML = '<p style="font-size:12.5px;margin:6px 0">' + esc(__t('हर खाने में: खुला / अलग Device')) + '</p><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12.5px"><tr style="background:#eef3f8">' + th(__t('Staff')) + th(__t('आज'), 1) + th(__t('7 दिन'), 1) + th(__t('30 दिन'), 1) + th(__t('कुल'), 1) + '</tr>' + (rows || '<tr><td colspan="5" style="padding:8px">' + esc(__t('अभी कोई Visit नहीं।')) + '</td></tr>') + '</table></div>' +
        '<p style="font-size:13px;margin:10px 0 0">' + esc(__t('सब मिलाकर (30 दिन)')) + ': <b>' + d.d30.opens + '</b> ' + esc(__t('बार, अलग Device')) + ': <b>' + d.d30.uniq + '</b></p>' +
        list(__t('📄 कौन सा Page खुला (30 दिन)'), d.pages) + list(__t('📍 किस जगह (src) से आए (30 दिन)'), d.srcs) +
        '<button type="button" class="btn" onclick="visExcel()" style="border:1px solid var(--line);width:100%;justify-content:center;margin-top:10px">⬇️ ' + esc(__t('Excel में Download करें')) + '</button>' +
        '<p style="font-size:12px;color:#596579;margin-top:8px">' + esc(__t('Visit Log 90 दिन रखा जाता है; उससे पुराना हिसाब "Visit Summary" Sheet में जुड़कर "कुल" में बना रहता है।')) + '</p>';
    } catch (e) { m.style.color = 'red'; m.textContent = __t('Server से जवाब नहीं मिला — Internet देखें।'); }
  };
  window.visExcel = function () {
    if (!last) return; if (typeof XLSX === 'undefined') { var m = $('visMsg'); if (m) { m.style.color = 'red'; m.textContent = __t('Excel बनाने वाली Library अभी लोड नहीं हुई — Internet देखें।'); } return; }
    var rows = [['Staff ID', 'Name', 'Aaj Opens', 'Aaj Devices', '7 din Opens', '7 din Devices', '30 din Opens', '30 din Devices', 'Total Opens']].concat(last.staff.map(function (s) { return [s.code || '(No staff)', s.name, s.today.opens, s.today.uniq, s.d7.opens, s.d7.uniq, s.d30.opens, s.d30.uniq, s.total]; }));
    var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Visits');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Page', 'Opens', 'Devices']].concat(last.pages.map(function (x) { return [x.name, x.opens, x.uniq]; }))), 'Pages');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Src', 'Opens', 'Devices']].concat(last.srcs.map(function (x) { return [x.name, x.opens, x.uniq]; }))), 'Src');
    XLSX.writeFile(wb, 'EkVeera_Link_Visits.xlsx');
  };
})();
