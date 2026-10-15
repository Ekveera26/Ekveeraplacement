/* EkVeera — Admin: Training Candidate के Company Address Requests (Placement page → Admin panel)
   Address Candidate की Email पर जाता है; Candidate के Reply (SELECTED / NOT SELECTED) Gmail में पढ़कर यहाँ दर्ज होते हैं। */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function say(t, color) { var m = $('adAdminMsg'); if (!m) return; m.style.color = color || '#333'; m.textContent = t || ''; }
  var BADGE = { 'Pending': ['#fff3d6', '#8a5a00', 'Address भेजना बाक़ी'], 'Address Sent': ['#e3f0ff', '#1d4f91', 'Reply का इंतज़ार'], 'Not Selected': ['#fdecea', '#a1281c', 'Not Selected — नया Address भेजें'], 'Selected': ['#e4f5ec', '#14673a', 'Selected ✅'], 'Closed': ['#eee', '#555', 'बंद'] };
  var chosen = '';

  window.adAdminLoad = async function () {
    say(__t('⏳ List आ रही है...')); $('adAdminList').innerHTML = ''; $('adAdminForm').style.display = 'none';
    try {
      var d = await vcSecurePost({ action: 'addrlist', password: ekveeraAdminPassword });
      if (d.status !== 'ok') return say(d.message || __t('List नहीं आ पाई।'), 'red');
      var c = d.counts || {};
      $('adAdminCounts').textContent = __t('Address भेजना बाक़ी') + ': ' + (c['Pending'] || 0) + ' · ' + __t('Reply का इंतज़ार') + ': ' + (c['Address Sent'] || 0) + ' · Not Selected: ' + (c['Not Selected'] || 0) + ' · Selected: ' + (c['Selected'] || 0);
      if (!d.requests.length) return say(__t('✅ अभी कोई Address Request नहीं है।'), 'green');
      say('');
      $('adAdminList').innerHTML = d.requests.map(function (r) {
        var b = BADGE[r.status] || ['#eee', '#555', r.status], btns = '';
        if (r.status === 'Pending' || r.status === 'Not Selected') btns += '<button type="button" class="btn btn-primary" style="padding:6px 12px;font-size:12.5px;" data-ad-pick="' + esc(r.requestId) + '" data-ad-name="' + esc(r.name) + '">📧 ' + esc(__t('Address भेजें')) + '</button> ';
        if (r.status === 'Address Sent') btns += '<button type="button" class="btn" style="padding:6px 12px;font-size:12.5px;background:#1b7f4b;color:#fff;" data-ad-mark="selected" data-ad-id="' + esc(r.requestId) + '">✅ Selected</button> ' +
          '<button type="button" class="btn" style="padding:6px 12px;font-size:12.5px;background:#C0392B;color:#fff;" data-ad-mark="not_selected" data-ad-id="' + esc(r.requestId) + '">❌ Not Selected</button> ';
        if (r.status !== 'Selected' && r.status !== 'Closed') btns += '<button type="button" class="btn" style="padding:6px 12px;font-size:12.5px;" data-ad-mark="closed" data-ad-id="' + esc(r.requestId) + '">🗂 ' + esc(__t('बंद करें')) + '</button>';
        return '<div style="border-bottom:1px solid #eef1f5;padding:10px 4px;"><b>' + esc(r.requestId) + '</b> · ' + esc(r.name) + ' · ' + esc(r.trainingId) +
          ' <span style="background:' + b[0] + ';color:' + b[1] + ';border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;">' + esc(__t(b[2])) + '</span><br>' +
          '<span style="color:#596579;font-size:12px;">📞 ' + esc(r.mobile) + ' · ✉️ ' + esc(r.email) + ' · ' + esc(r.requestedAt) + '</span><br>' +
          '<span style="color:#596579;font-size:12px;">' + esc(__t('भेजे गए Address')) + ': ' + esc(r.sent) + (r.lastCompany ? ' · ' + esc(__t('आख़िरी')) + ': ' + esc(r.lastCompany) + ' (' + esc(r.lastReply) + ')' : '') + '</span><div style="margin-top:6px;">' + btns + '</div></div>';
      }).join('');
    } catch (e) { say(__t('Server से जवाब नहीं मिला।'), 'red'); }
  };

  document.addEventListener('click', function (e) {
    var pick = e.target.closest ? e.target.closest('[data-ad-pick]') : null;
    if (pick) {
      chosen = pick.getAttribute('data-ad-pick');
      $('adAdminSel').textContent = '📨 ' + chosen + ' — ' + pick.getAttribute('data-ad-name');
      $('adAdminForm').style.display = 'block'; $('adCompany').focus(); $('adAdminForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    var mk = e.target.closest ? e.target.closest('[data-ad-mark]') : null;
    if (mk) markReply(mk.getAttribute('data-ad-id'), mk.getAttribute('data-ad-mark'));
  });

  window.adAdminSend = async function () {
    if (!chosen) return say(__t('पहले List से Request चुनें।'), 'red');
    var o = { action: 'addrsend', password: ekveeraAdminPassword, requestId: chosen };
    ['Company:company', 'Address:address', 'Person:person', 'Phone:phone', 'Post:post', 'When:when', 'Note:note'].forEach(function (x) { var p = x.split(':'); o[p[1]] = ($('ad' + p[0]).value || '').trim(); });
    if (!o.company || !o.address) return say(__t('Company का नाम और पूरा पता ज़रूरी है।'), 'red');
    say(__t('⏳ Address भेजा जा रहा है...'));
    try {
      var d = await vcSecurePost(o);
      if (d.status !== 'ok') return say(d.message || __t('Address नहीं भेजा जा सका।'), 'red');
      say('✅ ' + d.message, 'green');
      ['Company', 'Address', 'Person', 'Phone', 'Post', 'When', 'Note'].forEach(function (k) { $('ad' + k).value = ''; });
      $('adAdminForm').style.display = 'none'; chosen = ''; adAdminLoad();
    } catch (e) { say(__t('Server से जवाब नहीं मिला।'), 'red'); }
  };

  async function markReply(id, result) {
    var label = { selected: 'SELECTED', not_selected: 'NOT SELECTED', closed: __t('बंद (Reply नहीं आया)') }[result];
    if (!confirm(id + ' → ' + label + '\n' + __t('क्या आप यह दर्ज करना चाहते हैं?'))) return;
    say(__t('⏳ दर्ज हो रहा है...'));
    try {
      var d = await vcSecurePost({ action: 'addrmark', password: ekveeraAdminPassword, requestId: id, result: result });
      if (d.status !== 'ok') return say(d.message || __t('दर्ज नहीं हो पाया।'), 'red');
      say('✅ ' + d.message, 'green'); adAdminLoad();
    } catch (e) { say(__t('Server से जवाब नहीं मिला।'), 'red'); }
  }
})();
