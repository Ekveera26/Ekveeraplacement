/* EkVeera — Review / Rating (Home page) + Admin moderation (Placement page ka Admin Panel)
   Server: EkVeera_Reviews.gs */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function stars(n, big) { var s = ''; for (var i = 1; i <= 5; i++) s += '<span class="rv-s' + (i <= n ? ' on' : '') + '">★</span>'; return '<span class="rv-st' + (big ? ' big' : '') + '">' + s + '</span>'; }
  var rating = 0, openedAt = Date.now();

  /* ---------------- Public: Home page ---------------- */
  async function loadPublic() {
    var list = $('rvList'); if (!list) return;
    try {
      var d = await vcSecurePost({ action: 'getreviews' });
      if (!d || d.status !== 'ok') throw new Error('x');
      var sum = $('rvSum');
      if (!d.count) { sum.innerHTML = ''; list.innerHTML = '<p class="rv-empty">' + esc(__t('अभी कोई Review नहीं है — सबसे पहले अपना अनुभव आप लिखें! 👇')) + '</p>'; return; }
      var rows = '';
      for (var k = 5; k >= 1; k--) {
        var c = d.dist[k - 1] || 0, pct = Math.round(c / d.count * 100);
        rows += '<div class="rv-bar"><span>' + k + '★</span><i><b style="width:' + pct + '%"></b></i><em>' + c + '</em></div>';
      }
      sum.innerHTML = '<div class="rv-avg"><div class="rv-num">' + d.avg.toFixed(1) + '</div>' + stars(Math.round(d.avg), true) + '<div class="rv-cnt">' + d.count + ' ' + esc(__t('Review')) + '</div></div><div class="rv-bars">' + rows + '</div>';
      list.innerHTML = d.items.map(function (r) {
        return '<div class="rv-card"><div class="rv-top">' + stars(r.rating) + '<b>' + esc(r.name) + '</b><span class="rv-tag">' + esc(r.type === 'Company' ? __t('Company') : __t('Candidate')) + '</span><small>' + esc(r.date) + '</small></div><p>' + esc(r.comment) + '</p>' +
          (r.reply ? '<div class="rv-reply">💬 <b>EkVeera:</b> ' + esc(r.reply) + '</div>' : '') + '</div>';
      }).join('');
    } catch (e) { list.innerHTML = '<p class="rv-empty">' + esc(__t('Review अभी नहीं आ पाए — थोड़ी देर बाद पेज दोबारा खोलें।')) + '</p>'; }
  }

  function buildStars() {
    var host = $('rvStars'); if (!host) return;
    host.innerHTML = '';
    for (var i = 1; i <= 5; i++) (function (n) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'rv-pick'; b.setAttribute('aria-label', n + ' star'); b.textContent = '★';
      b.onclick = function () { rating = n; paint(); };
      host.appendChild(b);
    })(i);
    var t = document.createElement('span'); t.id = 'rvStarTxt'; t.className = 'rv-startxt'; host.appendChild(t);
  }
  function paint() {
    var bs = document.querySelectorAll('#rvStars .rv-pick');
    for (var i = 0; i < bs.length; i++) bs[i].classList.toggle('on', i < rating);
    var names = ['', __t('बहुत खराब'), __t('खराब'), __t('ठीक-ठाक'), __t('अच्छा'), __t('बहुत बढ़िया')];
    $('rvStarTxt').textContent = rating ? names[rating] : __t('स्टार चुनें');
  }

  window.rvSubmit = async function () {
    var id = $('rvId').value.replace(/\s+/g, '').toUpperCase(), mob = $('rvMob').value.replace(/\D/g, '').slice(-10), txt = $('rvText').value.trim(), m = $('rvMsg'), b = $('rvBtn');
    m.style.color = '#c0392b';
    if (!rating) { m.textContent = __t('कृपया 1 से 5 स्टार चुनें।'); return; }
    if (!/^(CAND|TRA-CAND|COMP)\d+$/.test(id)) { m.textContent = __t('अपनी ID सही डालें (जैसे CAND001, TRA-CAND001 या COMP001)।'); return; }
    if (mob.length !== 10) { m.textContent = __t('फॉर्म में दिया 10 अंकों का Mobile Number डालें।'); return; }
    if (txt.length < 10) { m.textContent = __t('अपना अनुभव कम-से-कम 10 अक्षर में लिखें।'); return; }
    b.disabled = true; m.style.color = '#1f3b63'; m.textContent = __t('⏳ भेजा जा रहा है...');
    try {
      var d = await vcSecurePost({ action: 'submitreview', reviewerId: id, mobile: mob, rating: rating, comment: txt, website: $('rvWebsite').value, elapsed: Math.round((Date.now() - openedAt) / 1000) });
      if (d && d.status === 'ok') {
        m.style.color = '#1b7f3b'; m.textContent = __t('✅ धन्यवाद! आपका Review मिल गया। Admin की जाँच के बाद यह सबको दिखेगा।');
        $('rvText').value = ''; rating = 0; paint(); $('rvCount').textContent = '0/500'; return;
      }
      m.style.color = '#c0392b'; m.textContent = (d && d.message) || __t('कुछ गड़बड़ हो गई — दोबारा कोशिश करें।');
    } catch (e) { m.style.color = '#c0392b'; m.textContent = __t('Internet चेक करके दोबारा कोशिश करें।'); }
    b.disabled = false;
  };

  /* ---------------- Admin: Approve / Reject ---------------- */
  var adminItems = [];
  window.rvAdminLoad = async function () {
    var box = $('rvAdminBox'); if (!box) return;
    box.innerHTML = '<p>⏳ ...</p>';
    try {
      var d = await vcSecurePost({ action: 'adminreviews', password: ekveeraAdminPassword });
      if (!d || d.status !== 'ok') { box.innerHTML = '<p style="color:#c0392b;">' + esc((d && d.message) || 'Error') + '</p>'; return; }
      adminItems = d.items || [];
      if (!adminItems.length) { box.innerHTML = '<p>' + esc(__t('अभी कोई Review नहीं आया।')) + '</p>'; return; }
      var col = { Pending: '#b26a00', Approved: '#1b7f3b', Rejected: '#c0392b', Hidden: '#6b778c' };
      box.innerHTML = '<p style="font-weight:700;">⏳ Pending: ' + d.pending + '</p>' + adminItems.map(function (r, i) {
        return '<div class="rv-adm"><div><b>' + esc(r.id) + '</b> • ' + stars(r.rating) + ' • ' + esc(r.type) + ' <small>(' + esc(r.reviewerId) + ' — ' + esc(r.name) + ')</small> • <span style="color:' + (col[r.status] || '#333') + ';font-weight:700;">' + esc(r.status) + '</span> <small>' + esc(r.at) + '</small></div>' +
          '<p>' + esc(r.comment) + '</p>' + (r.reply ? '<p class="rv-reply">💬 ' + esc(r.reply) + '</p>' : '') +
          '<div class="rv-adm-btns"><button onclick="rvAdminAct(' + i + ',\'approve\')" style="background:#1b7f3b;">✔ Approve</button><button onclick="rvAdminAct(' + i + ',\'reject\')" style="background:#c0392b;">✖ Reject</button><button onclick="rvAdminAct(' + i + ',\'hide\')" style="background:#6b778c;">🙈 Hide</button><button onclick="rvAdminAct(' + i + ',\'reply\')" style="background:#0b5ed7;">💬 Reply</button></div></div>';
      }).join('');
    } catch (e) { box.innerHTML = '<p style="color:#c0392b;">Internet?</p>'; }
  };
  window.rvAdminAct = async function (i, act) {
    var r = adminItems[i]; if (!r) return;
    var params = { action: 'reviewdecision', reviewId: r.id, decision: act, password: ekveeraAdminPassword };
    if (act === 'reply') { var t = prompt(__t('Review पर आपका जवाब (सबको दिखेगा):'), r.reply || ''); if (t === null) return; params.reply = t; }
    try { var d = await vcSecurePost(params); if (d && d.status === 'ok') rvAdminLoad(); else alert((d && d.message) || 'Error'); } catch (e) { alert('Internet?'); }
  };

  function init() {
    if ($('rvList')) {
      buildStars(); paint(); loadPublic();
      var ta = $('rvText'); if (ta) ta.addEventListener('input', function () { $('rvCount').textContent = ta.value.length + '/500'; });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
