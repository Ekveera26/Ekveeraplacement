/* EkVeera — Admin: 💸 Refund Requests + ✅ Company Verify (v35). Server: EkVeera_Refund.gs, EkVeera_CompanyVerify.gs
   Password + 2FA Token window.ekveeraAdminPassword me rehta hai (app.js). Role ki ijazat Server dekhta hai. */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pw() { return window.ekveeraAdminPassword; }
  async function api(p) { p.password = pw(); try { return await vcSecurePost(p); } catch (e) { return { status: 'error', message: __t('Internet / Server से जवाब नहीं मिला।') }; } }
  function say(id, t, ok) { var m = $(id); if (m) { m.style.color = ok ? '#1b7f3b' : '#b3261e'; m.textContent = t || ''; } }

  /* ---------------- 💸 Refund Requests ---------------- */
  var BADGE = { Pending: '#e8a33d', Refunded: '#1b7f3b', Rejected: '#b3261e' };
  async function rfLoad() {
    say('rfaMsg', __t('⏳ ...'), true);
    var r = await api({ action: 'refundlist' });
    if (r.status !== 'ok') { $('rfaList').innerHTML = ''; return say('rfaMsg', r.message, false); }
    say('rfaMsg', r.pending ? ('⏳ ' + r.pending + ' ' + __t('Request पर फ़ैसला बाकी')) : '✅ ' + __t('कोई Pending Refund नहीं'), !r.pending ? true : false);
    $('rfaList').innerHTML = (r.items || []).map(function (x) {
      var pend = x.refStatus === 'Pending';
      return '<div style="border:1px solid #dfe5ee;border-radius:10px;padding:10px;margin:8px 0;background:#fff"><div><b>' + esc(x.refundId) + '</b> · ' + esc(x.kind) + ' · ' + esc(x.refId) + ' · ₹' + esc(x.amount) +
        ' <span style="background:' + (BADGE[x.refStatus] || '#888') + ';color:#fff;border-radius:6px;padding:1px 8px;font-size:12px">' + esc(x.refStatus) + '</span></div>' +
        '<div style="font-size:13px;color:#4a5568">' + esc(x.name) + ' · 📞 ' + esc(x.mobile) + ' · ' + esc(x.at) + '</div><div style="font-size:13.5px;margin:4px 0">“' + esc(x.reason) + '”</div>' +
        (pend ? '<div style="display:flex;gap:6px;flex-wrap:wrap"><input id="rfn_' + esc(x.refundId) + '" placeholder="' + esc(__t('नोट / Reject का कारण / Razorpay Refund Ref')) + '" maxlength="150" style="flex:1;min-width:160px;padding:7px;border:1px solid #cfd8e1;border-radius:8px">' +
          '<button type="button" class="btn btn-primary" style="padding:6px 12px" data-rf="approve" data-id="' + esc(x.refundId) + '">✅ Approve</button><button type="button" class="btn" style="padding:6px 12px;border:1px solid #b3261e;color:#b3261e" data-rf="reject" data-id="' + esc(x.refundId) + '">❌ Reject</button></div>'
          : '<div style="font-size:12.5px;color:#596579">' + esc(x.decidedAt) + ' · ' + esc(x.by) + (x.note ? ' · ' + esc(x.note) : '') + '</div>') + '</div>';
    }).join('') || '<p style="color:#596579">' + esc(__t('अभी कोई Refund Request नहीं।')) + '</p>';
  }
  async function rfDecide(id, dec) {
    var v = ($('rfn_' + id) || {}).value || '';
    if (!window.confirm((dec === 'approve' ? '✅ ' : '❌ ') + id + ' — ' + (dec === 'approve' ? __t('Approve करें? (Payment "Refunded" और Commission माइनस हो जाएगा)') : __t('Reject करें?')))) return;
    var r = await api({ action: 'refunddecide', refundId: id, decision: dec, note: dec === 'reject' ? v : '', via: dec === 'approve' ? v : '' });
    say('rfaMsg', r.message, r.status === 'ok'); if (r.status === 'ok') rfLoad();
  }

  /* ---------------- ✅ Company Verify ---------------- */
  var cvFilter = 'pending';
  async function cvLoad() {
    say('cvaMsg', __t('⏳ ...'), true);
    var r = await api({ action: 'companyverifylist', filter: cvFilter });
    if (r.status !== 'ok') { $('cvaList').innerHTML = ''; return say('cvaMsg', r.message, false); }
    var c = r.counts || {};
    say('cvaMsg', 'Pending ' + (c.Pending || 0) + ' · Verified ' + (c.Verified || 0) + ' · Rejected ' + (c.Rejected || 0), true);
    $('cvaList').innerHTML = (r.items || []).map(function (x) {
      return '<div style="border:1px solid #dfe5ee;border-radius:10px;padding:10px;margin:8px 0;background:#fff"><div><b>' + esc(x.companyId) + '</b> · ' + esc(x.name) + ' <span style="color:#596579;font-size:12.5px">' + esc(x.city) + '</span> ' +
        '<span style="background:' + ({ Verified: '#1b7f3b', Rejected: '#b3261e', Pending: '#e8a33d' }[x.verification]) + ';color:#fff;border-radius:6px;padding:1px 8px;font-size:12px">' + esc(x.verification) + '</span></div>' +
        '<div style="font-size:13px;color:#4a5568">📞 ' + esc(x.mobile) + ' · ✉️ ' + esc(x.email) + (x.note ? ' · ' + esc(x.note) : '') + '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><input id="cvn_' + esc(x.companyId) + '" placeholder="' + esc(__t('Reject का कारण')) + '" maxlength="150" style="flex:1;min-width:150px;padding:7px;border:1px solid #cfd8e1;border-radius:8px">' +
        '<button type="button" class="btn btn-primary" style="padding:6px 12px" data-cv="verified" data-id="' + esc(x.companyId) + '">✅ Verify</button><button type="button" class="btn" style="padding:6px 12px;border:1px solid #b3261e;color:#b3261e" data-cv="rejected" data-id="' + esc(x.companyId) + '">❌ Reject</button>' +
        (x.verification !== 'Pending' ? '<button type="button" class="btn" style="padding:6px 12px;border:1px solid #cfd8e1" data-cv="pending" data-id="' + esc(x.companyId) + '">↩️ Pending</button>' : '') + '</div></div>';
    }).join('') || '<p style="color:#596579">' + esc(__t('इस सूची में कोई Company नहीं।')) + '</p>';
  }
  async function cvDecide(id, dec) {
    var note = ($('cvn_' + id) || {}).value || '';
    var r = await api({ action: 'companyverifydecide', companyId: id, decision: dec, note: note });
    say('cvaMsg', r.message, r.status === 'ok'); if (r.status === 'ok') cvLoad();
  }

  function init() {
    if (!$('rfaBtn')) return;
    $('rfaBtn').onclick = rfLoad; $('cvaBtn').onclick = cvLoad;
    var sel = $('cvaFilter'); if (sel) sel.onchange = function () { cvFilter = sel.value; cvLoad(); };
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-rf],[data-cv]') : null; if (!b) return;
      if (b.getAttribute('data-rf')) rfDecide(b.getAttribute('data-id'), b.getAttribute('data-rf')); else cvDecide(b.getAttribute('data-id'), b.getAttribute('data-cv'));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
