/* EkVeera — Admin Payment Log (किसने Payment किया) + Password दिखाने वाला 👁 बटन
   backend: EkVeera_Payments.gs (getpaymentlog). placement.html पर app.js के बाद load होती है. */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  window.togglePw = function (id, btn) {
    var i = $(id); if (!i) return;
    var show = i.type === 'password';
    i.type = show ? 'text' : 'password';
    btn.textContent = show ? '🙈' : '👁';
    btn.setAttribute('aria-label', show ? __t('Password छुपाएं') : __t('Password दिखाएं'));
  };

  var rows = [];
  function bad(r) { return /❌|⚠️/.test(String(r.result || '')); }
  function fmt(s) { try { return new Date(s).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return s; } }

  window.payLogLoad = async function () {
    var host = $('adminPayLog'); if (!host) return;
    var pw = (typeof ekveeraAdminPassword !== 'undefined') ? ekveeraAdminPassword : '';
    if (!pw) { host.textContent = __t('पहले Admin Login करें।'); return; }
    host.textContent = __t('लोड हो रहा है...');
    try {
      var d = await vcSecurePost({ action: 'getpaymentlog', password: pw });
      if (d.status !== 'ok') { host.textContent = (/code missing/i.test(d.message || '') ? __t('Apps Script में EkVeera_Payments file अभी नहीं जुड़ी है।') : (d.message || __t('लोड नहीं हो पाया।'))); return; }
      rows = d.items || [];
      payLogRender();
    } catch (e) { host.textContent = __t('कुछ गड़बड़ हो गई।'); }
  };

  window.payLogRender = function () {
    var host = $('adminPayLog'); if (!host) return;
    var only = $('payLogOnlyBad') && $('payLogOnlyBad').checked;
    var list = only ? rows.filter(bad) : rows;
    $('payLogDownloadBtn').style.display = rows.length ? 'inline-flex' : 'none';
    if (!list.length) { host.textContent = only ? __t('👍 कोई Payment जांच के लिए बाकी नहीं है।') : __t('अभी तक कोई Payment दर्ज नहीं हुआ।'); return; }
    host.textContent = '';
    list.forEach(function (r) {
      var isBad = bad(r), card = document.createElement('div');
      card.style.cssText = 'border:1px solid ' + (isBad ? '#E8A0A0' : '#cfe3d6') + ';background:' + (isBad ? '#FFF5F4' : '#F4FBF6') + ';border-radius:10px;padding:10px 12px;margin-bottom:8px;';
      var payer = (r.name ? r.name + ' • ' : '') + (r.mobile ? '📞 ' + r.mobile : '') + (r.email ? ' • ' + r.email : '');
      card.innerHTML =
        '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;"><strong>₹' + esc(r.amount) + ' — ' + (r.matched ? esc(r.matched) : __t('<span style="color:#c0392b;">पहचान नहीं हुई</span>')) + '</strong>' +
        '<span style="font-size:11.5px;font-weight:800;color:' + (isBad ? '#c0392b' : '#11766F') + ';">' + esc(r.result) + '</span></div>' +
        '<div style="font-size:12.5px;color:#334056;margin-top:4px;">' + (payer ? esc(payer) : __t('<em>Payer की जानकारी Razorpay ने नहीं भेजी</em>')) + '</div>' +
        (r.method ? '<div style="font-size:12px;color:#596579;">' + esc(r.method) + '</div>' : '') +
        '<div style="font-size:11.5px;color:#596579;margin-top:2px;">' + esc(fmt(r.at)) + ' • ' + esc(r.paymentId) + (r.how ? ' • ' + esc(r.how) : '') + '</div>';
      host.appendChild(card);
    });
  };

  window.payLogDownload = function () {
    if (!rows.length || typeof XLSX === 'undefined') return;
    var data = [['Date', 'Payment ID', 'Amount (₹)', 'Payer Name', 'Payer Mobile', 'Payer Email', 'Method / UPI', 'Matched To', 'How Matched', 'Result']]
      .concat(rows.map(function (r) { return [fmt(r.at), r.paymentId, r.amount, r.name, r.mobile, r.email, r.method, r.matched, r.how, r.result]; }));
    var ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 20 }, { wch: 22 }, { wch: 12 }, { wch: 20 }, { wch: 14 }, { wch: 26 }, { wch: 22 }, { wch: 16 }, { wch: 34 }, { wch: 26 }];
    var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, 'EkVeera_Payment_Log_' + Date.now() + '.xlsx');
  };
})();
