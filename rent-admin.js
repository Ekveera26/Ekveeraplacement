/* EkVeera — Admin: For Rent का आज का हिसाब (Placement page → Admin panel)
   Server (EkVeera_Rent.gs, action: rentstats) से गिनती आती है; यहाँ सिर्फ़ दिखाना। रोज़ का Email अलग से (Trigger: ekvRentDailyReport)। */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function inr(n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); }
  function row(label, val, bold) { return '<div style="display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px solid #eef1f5;' + (bold ? 'font-weight:800;' : '') + '"><span>' + esc(label) + '</span><span>' + esc(val) + '</span></div>'; }
  window.rentAdminStats = async function () {
    var out = document.getElementById('rentAdminOut'); if (!out) return;
    out.style.color = '#333'; out.textContent = __t('⏳ हिसाब आ रहा है...');
    try {
      var d = await vcSecurePost({ action: 'rentstats', password: window.ekveeraAdminPassword });
      if (d.status !== 'ok') { out.style.color = 'red'; out.textContent = d.message || __t('हिसाब नहीं आ पाया।'); return; }
      out.innerHTML = '<div style="font-weight:700;margin-bottom:4px;">' + esc(__t('आज')) + '</div>' +
        row(__t('नए Giver (सामान दर्ज किया)'), d.giversToday) + row(__t('Giver की Payment हुई'), d.giversPaidToday) + row(__t('Plan Upgrade की Payment'), d.upgradesToday) + row(__t('आज जुड़े सामान'), d.itemsToday) +
        row(__t('Taker Order (सामान लिया)'), d.ordersToday) + row(__t('Order की Payment हुई (₹29)'), d.ordersPaidToday) + row(__t('आज की कमाई'), inr(d.collectedToday), true) +
        '<div style="font-weight:700;margin:10px 0 4px;">' + esc(__t('कुल')) + '</div>' +
        row(__t('अभी चालू Giver'), d.activeGivers) + row(__t('कुल सामान'), d.items) + row(__t('कुल Order (Payment हुई)'), d.ordersPaid) + row(__t('कुल कमाई'), inr(d.collectedTotal), true);
      var h = await vcSecurePost({ action: 'hsstats', password: window.ekveeraAdminPassword });
      if (h.status === 'ok') out.innerHTML += '<div style="font-weight:700;margin:16px 0 4px;">🏠 ' + esc(__t('Home Service — आज')) + '</div>' +
        row(__t('नए कारीगर Register'), h.karigarToday) + row(__t('कारीगर की Payment हुई (₹49)'), h.karigarPaidToday) + row(__t('ग्राहक Order'), h.ordersToday) + row(__t('Order की Payment हुई (₹29)'), h.ordersPaidToday) + row(__t('आज की कमाई'), inr(h.collectedToday), true) +
        '<div style="font-weight:700;margin:10px 0 4px;">' + esc(__t('कुल')) + '</div>' +
        row(__t('जाँच के लिए बाकी कारीगर (Payment हो चुकी)'), h.pendingApproval) + row(__t('चालू कारीगर'), h.active) + row(__t('कुल Order (Payment हुई)'), h.ordersPaid) + row(__t('कुल कमाई'), inr(h.collectedTotal), true);
    } catch (e) { out.style.color = 'red'; out.textContent = __t('Server से जवाब नहीं मिला।'); }
  };
})();
