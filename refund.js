/* EkVeera — Refund Request / Status (refund.html). Server: EkVeera_Refund.gs (refundrequest / refundstatus) */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  async function api(p) { try { return await vcSecurePost(p); } catch (e) { return { status: 'error', message: __t('Internet चेक करके दोबारा कोशिश करें।') }; } }
  function say(id, t, ok) { var m = $(id); if (m) { m.style.color = ok ? '#1b7f3b' : '#b3261e'; m.textContent = t || ''; } }
  var LAB = { Pending: '⏳ जाँच जारी (Pending)', Refunded: '✅ Refund मंज़ूर — पैसा भेजा जा रहा है', Rejected: '❌ Refund नहीं हो सका' };
  async function send() {
    var b = $('rfSend'); b.disabled = true; say('rfMsg', __t('⏳ भेजा जा रहा है...'), true);
    var r = await api({ action: 'refundrequest', kind: $('rfKind').value, id: $('rfId').value.trim(), mobile: $('rfMob').value.trim(), reason: $('rfWhy').value.trim() });
    b.disabled = false; say('rfMsg', r.message || __t('कुछ गड़बड़ हो गई।'), r.status === 'ok');
    if (r.status === 'ok' && r.refundId) { $('rsId').value = r.refundId; $('rsMob').value = $('rfMob').value; }
  }
  async function status() {
    var out = $('rsOut'); out.textContent = __t('⏳ देख रहे हैं...');
    var r = await api({ action: 'refundstatus', id: $('rsId').value.trim(), mobile: $('rsMob').value.trim() });
    if (r.status !== 'ok') { out.style.color = '#b3261e'; out.textContent = r.message || ''; return; }
    out.style.color = '#111';
    out.innerHTML = '<b>' + esc(r.refundId) + '</b> — ' + esc(__t(LAB[r.refStatus] || r.refStatus)) + '<br>' + esc(__t('माँगा गया: ')) + esc(r.requestedAt) + (r.amount ? ' · ₹' + esc(r.amount) : '') +
      (r.decidedAt ? '<br>' + esc(__t('फ़ैसला: ')) + esc(r.decidedAt) : '') + (r.note ? '<br>' + esc(__t('कारण / नोट: ')) + esc(r.note) : '') + (r.via ? '<br>' + esc(__t('Refund Ref: ')) + esc(r.via) : '');
  }
  function init() { if ($('rfSend')) { $('rfSend').onclick = send; $('rsBtn').onclick = status; var q = new URLSearchParams(location.search); if (q.get('id')) $('rsId').value = q.get('id'); } }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
