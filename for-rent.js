/* EkVeera — For Rent (Giver / Taker) — सारा हिसाब Server (EkVeera_Rent.gs) में है; यहाँ सिर्फ़ फॉर्म, खोज और दिखाना */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const T = s => (typeof __t === 'function' ? __t(s) : s);
  const PER = { Day: 'प्रति दिन', Week: 'प्रति हफ़्ता', Month: 'प्रति महीना', Event: 'एक Event / Function के लिए' };
  const digits10 = s => String(s || '').replace(/\D/g, '').slice(-10);

  function say(id, text, kind) { const el = $(id); if (!el) return; el.className = 'rent-msg' + (kind ? ' ' + kind : ''); el.textContent = text || ''; }
  async function api(params) {
    try { return await vcSecurePost(params); }
    catch (e) { return { status: 'error', message: T('इंटरनेट / Server की दिक्कत — थोड़ी देर बाद फिर कोशिश करें।') }; }
  }
  function payBtn(link, amount) {
    if (!link) return '<p class="rent-warn" style="margin-top:10px">' + esc(T('Payment Link अभी नहीं बन पाया — कृपया WhatsApp (9766284669) पर अपनी ID भेजें।')) + '</p>';
    return '<a class="btn btn-primary rent-pay" href="' + esc(link) + '" target="_blank" rel="noopener">💳 ' + esc(T('अभी Pay करें')) + ' ₹' + esc(amount) + '</a>';
  }

  /* ---------- हर 6 सेकंड में Payment की Status देखना (पेज बंद होने तक, अधिकतम ~12 मिनट) ---------- */
  const timers = {};
  function poll(key, fn, doneFn) {
    if (timers[key]) clearInterval(timers[key]);
    let n = 0;
    timers[key] = setInterval(async function () {
      if (++n > 120 || document.hidden) { if (n > 120) clearInterval(timers[key]); return; }
      const r = await fn();
      if (r && doneFn(r)) clearInterval(timers[key]);
    }, 6000);
  }

  /* ---------------- Giver ---------------- */
  window.rentRegister = async function () {
    const btn = $('gBtn');
    const v = id => ($(id) ? $(id).value.trim() : '');
    if (!v('gName') || v('gName').length < 2) return say('gMsg', T('अपना पूरा नाम लिखें।'), 'err');
    if (digits10(v('gMobile')).length !== 10) return say('gMsg', T('10 अंकों का सही Mobile Number लिखें।'), 'err');
    if (!v('gLoc')) return say('gMsg', T('सामान की Location (शहर / इलाका) लिखें।'), 'err');
    if (!v('gCat')) return say('gMsg', T('सामान का प्रकार चुनें।'), 'err');
    if (v('gCat') === 'Other' && !v('gItem')) return say('gMsg', T("'Other' चुना है तो सामान का नाम लिखना ज़रूरी है।"), 'err');
    if (!(parseFloat(v('gRent')) > 0)) return say('gMsg', T('सही किराया (₹) लिखें।'), 'err');
    if (!v('gCond')) return say('gMsg', T('सामान की हालत चुनें।'), 'err');
    if (!$('gTerms').checked) return say('gMsg', T('आगे बढ़ने के लिए शर्तों पर ✔ लगाएँ।'), 'err');
    btn.disabled = true; say('gMsg', T('⏳ दर्ज किया जा रहा है...'), '');
    const r = await api({ action: 'rentregister', name: v('gName'), mobile: digits10(v('gMobile')), email: v('gEmail'), location: v('gLoc'), address: v('gAddr'),
      category: v('gCat'), itemName: v('gItem'), details: v('gDetails'), rent: v('gRent'), rentPer: v('gPer'), condition: v('gCond'), terms: '1', website: v('gWebsite'),
      staff: (window.ekvStaffRef && window.ekvStaffRef()) || '' });
    btn.disabled = false;
    if (!r || r.status !== 'ok') return say('gMsg', (r && r.message) || T('कुछ गड़बड़ हो गई — फिर कोशिश करें।'), 'err');
    say('gMsg', '', '');
    $('gDoneGid').textContent = r.giverId; $('gDoneIid').textContent = r.itemId;
    $('gDone').style.display = 'block';
    if (r.alreadyPaid) {
      $('gDonePay').innerHTML = '<div style="font-weight:800;color:#11766F;font-size:16px">✅ ' + esc(T('आपकी Registration पहले से Active है — यह सामान तुरंत दिखने लगा, कोई नई Payment नहीं।')) + '</div>';
      $('gDoneTxt').textContent = r.validTill ? T('आपकी Registration इस तारीख़ तक चलेगी: ') + r.validTill : '';
    } else {
      $('gDonePay').innerHTML = payBtn(r.payLink, r.amount);
      $('gDoneTxt').textContent = T('⏰ 1 घंटे में Payment न करने पर आपकी Entry छुपा दी जाएगी। Payment होते ही यहीं अपने-आप "Active" दिखेगा।');
      poll('giver', () => api({ action: 'rentmylisting', giverId: r.giverId, mobile: digits10(v('gMobile')) }), function (s) {
        if (s.status === 'ok' && s.active) {
          $('gDonePay').innerHTML = '<div style="font-weight:800;color:#11766F;font-size:17px">✅ ' + esc(T('Payment मिल गई — आपका सामान अब 1 साल तक खोज में दिखेगा।')) + '</div>';
          $('gDoneTxt').textContent = T('आपकी Registration इस तारीख़ तक चलेगी: ') + s.validTill;
          return true;
        }
        return false;
      });
    }
    $('gDone').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  window.rentMyListing = async function () {
    const gid = $('mGid').value.trim().toUpperCase(), mob = digits10($('mMob').value);
    if (!gid || mob.length !== 10) return say('mMsg', T('Giver ID और 10 अंकों का Mobile डालें।'), 'err');
    say('mMsg', T('⏳ देखा जा रहा है...'), '');
    const r = await api({ action: 'rentmylisting', giverId: gid, mobile: mob });
    if (!r || r.status !== 'ok') { $('mOut').innerHTML = ''; return say('mMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err'); }
    say('mMsg', '', '');
    let h = '<div class="rent-detail"><h3>' + esc(r.giverId) + ' — ' + esc(r.name) + '</h3><table>';
    h += '<tr><td>' + esc(T('Registration')) + '</td><td>' + (r.active ? '✅ ' + esc(T('Active — इस तारीख़ तक: ')) + esc(r.validTill)
      : (r.paid ? '⌛ ' + esc(T('1 साल पूरा हो चुका — दोबारा Register करें')) : '⏳ ' + esc(T('Payment बाकी — सामान अभी छुपा है')))) + '</td></tr>';
    (r.items || []).forEach(function (it) { h += '<tr><td>' + esc(it.itemId) + '</td><td>' + esc(it.name) + ' — ₹' + esc(it.rent) + ' ' + esc(T(PER[it.per] || it.per)) + '</td></tr>'; });
    h += '</table>';
    if (!r.paid) h += payBtn(r.payLink, r.amount);
    if (r.active) h += '<p style="margin:12px 0 0;font-size:14px">' + esc(T('और सामान जोड़ना है? ऊपर का फॉर्म इसी Mobile Number से भरें — नई Payment नहीं लगेगी।')) + '</p>';
    h += '</div>';
    $('mOut').innerHTML = h;
  };

  /* ---------------- Taker ---------------- */
  /* ---- खोज: पहले 10, फिर "और देखें" से 11–20, फिर 21–30 (सिर्फ़ ID + Location) ---- */
  const S = { cat: '', q: '', loc: '', shown: [], next: 0, busy: false };
  function cardHtml(x) {
    return '<div class="rent-card"><b>' + esc(x.itemId) + '</b><div class="loc">📍 ' + esc(x.location) + '</div>' +
      '<button type="button" class="btn btn-primary" data-pick="' + esc(x.itemId) + '">' + esc(T('यह सामान चाहिए')) + '</button></div>';
  }
  async function runSearch(offset) {
    if (S.busy) return; S.busy = true;
    const first = offset === 0;
    if (first) { S.cat = $('sCat').value; S.q = $('sQ').value.trim(); S.loc = $('sLoc').value.trim(); S.shown = []; $('sOut').innerHTML = ''; $('sMoreBox').innerHTML = ''; }
    if (!S.cat && !S.q) { S.busy = false; return say('sMsg', T('सामान का प्रकार चुनें (या सामान का नाम लिखें)।'), 'err'); }
    say('sMsg', T('⏳ खोजा जा रहा है...'), '');
    const r = await api({ action: 'rentsearch', category: S.cat, q: S.q, location: S.loc, offset: offset });
    S.busy = false;
    if (!r || r.status !== 'ok') { if (first) $('sOut').innerHTML = ''; return say('sMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err'); }
    const seen = new Set(S.shown.map(x => x.itemId)), fresh = (r.results || []).filter(x => !seen.has(x.itemId));    // बीच में नया सामान जुड़ने पर दोहराव न हो
    if (first && !fresh.length) return say('sMsg', T('अभी इस प्रकार का सामान नहीं मिला। थोड़ी देर बाद या दूसरा प्रकार चुनकर देखें।'), 'err');
    S.shown = S.shown.concat(fresh); S.next = r.nextOffset || (offset + 10);
    $('sOut').insertAdjacentHTML('beforeend', fresh.map(cardHtml).join(''));
    say('sMsg', S.shown.length + ' ' + T('सामान दिख रहे हैं। बाक़ी जानकारी ₹29 की Payment के बाद दिखेगी।'), 'ok');
    let more = '';
    if (r.hasMore) more = '<button type="button" class="btn btn-primary" onclick="rentMore()">' + esc(T('⬇ और देखें')) + '</button>';
    else if (r.capped) more = '<p class="rent-note">' + esc(T('इससे ज़्यादा सामान हैं — शहर या सामान का नाम लिखकर खोज और सटीक करें।')) + '</p>';
    $('sMoreBox').innerHTML = more;
  }
  window.rentSearch = function () { return runSearch(0); };
  window.rentMore = function () { return runSearch(S.next); };
  $('sOut').addEventListener('click', function (e) { const b = e.target.closest('[data-pick]'); if (b) rentPick(b.getAttribute('data-pick')); });

  let pickedItem = '';
  window.rentPick = function (itemId) {
    pickedItem = itemId;
    $('oTitle').textContent = T('सामान ID: ') + itemId + ' — ' + T('₹29 का Order');
    $('oBox').style.display = 'block'; $('oPay').innerHTML = ''; say('oMsg', '', '');
    $('oBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  function detailHtml(d) {
    const it = d.item, g = d.giver, wa = 'https://wa.me/91' + esc(g.mobile);
    return '<div class="rent-detail"><h3>✅ ' + esc(T('आपकी Payment मिल गई — सामान की पूरी जानकारी')) + '</h3><table>' +
      '<tr><td>' + esc(T('सामान ID')) + '</td><td>' + esc(it.itemId) + '</td></tr>' +
      '<tr><td>' + esc(T('सामान')) + '</td><td>' + esc(it.name) + ' (' + esc(it.category) + ')</td></tr>' +
      (it.details ? '<tr><td>' + esc(T('जानकारी')) + '</td><td>' + esc(it.details) + '</td></tr>' : '') +
      '<tr><td>' + esc(T('किराया')) + '</td><td>₹' + esc(it.rent) + ' ' + esc(T(PER[it.per] || it.per)) + '</td></tr>' +
      '<tr><td>' + esc(T('हालत')) + '</td><td>' + esc(it.condition) + '</td></tr>' +
      '<tr><td>' + esc(T('सामान देने वाले का नाम')) + '</td><td><b>' + esc(g.name) + '</b></td></tr>' +
      '<tr><td>Mobile</td><td><b><a href="tel:+91' + esc(g.mobile) + '">' + esc(g.mobile) + '</a></b> &nbsp; <a href="' + wa + '" target="_blank" rel="noopener">💬 WhatsApp</a></td></tr>' +
      '<tr><td>Location</td><td>' + esc(g.location) + (g.address ? '<br>' + esc(g.address) : '') + '</td></tr></table>' +
      '<p class="rent-warn" style="margin:12px 0 0">⚠️ ' + esc(T('सामान जिस हालत में ले जा रहे हैं, उसी हालत में वापस करना है। सामान ख़राब होने पर Extra शुल्क लिया जाएगा।')) + '</p></div>';
  }

  window.rentOrder = async function () {
    const name = $('oName').value.trim(), mob = digits10($('oMobile').value), email = $('oEmail').value.trim();
    if (!pickedItem) return say('oMsg', T('पहले सामान चुनें।'), 'err');
    if (name.length < 2) return say('oMsg', T('अपना पूरा नाम लिखें।'), 'err');
    if (mob.length !== 10) return say('oMsg', T('10 अंकों का सही Mobile Number लिखें।'), 'err');
    if (!$('oTerms').checked) return say('oMsg', T('सामान की शर्त पर ✔ लगाना ज़रूरी है।'), 'err');
    $('oBtn').disabled = true; say('oMsg', T('⏳ Order बन रहा है...'), '');
    const r = await api({ action: 'rentorder', itemId: pickedItem, name: name, mobile: mob, email: email, terms: '1' });
    $('oBtn').disabled = false;
    if (!r || r.status !== 'ok') return say('oMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err');
    say('oMsg', '', '');
    $('oPay').innerHTML = '<div class="rent-done" style="display:block"><div><span class="rent-id">' + esc(r.orderId) + '</span></div>' +
      '<p style="margin:8px 0">' + esc(T('यह Order ID संभालकर रखें। Payment के बाद Details यहीं अपने-आप दिख जाएँगी।')) + '</p>' + payBtn(r.payLink, r.amount) + '</div>';
    poll('order', () => api({ action: 'rentgetorder', orderId: r.orderId, mobile: mob }), function (s) {
      if (s.status === 'ok' && s.paid) { $('oPay').innerHTML = ''; $('oBox').style.display = 'none'; $('oDetail').innerHTML = detailHtml(s); $('oDetail').scrollIntoView({ behavior: 'smooth', block: 'center' }); return true; }
      return false;
    });
  };

  window.rentGetOrder = async function () {
    const oid = $('qOid').value.trim().toUpperCase(), mob = digits10($('qMob').value);
    if (!oid || mob.length !== 10) return say('qMsg', T('Order ID और 10 अंकों का Mobile डालें।'), 'err');
    say('qMsg', T('⏳ देखा जा रहा है...'), '');
    const r = await api({ action: 'rentgetorder', orderId: oid, mobile: mob });
    if (!r || r.status !== 'ok') { $('qOut').innerHTML = ''; return say('qMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err'); }
    say('qMsg', '', '');
    $('qOut').innerHTML = r.paid ? detailHtml(r) :
      '<div class="rent-detail" style="border-color:#f0d9a0"><h3 style="color:#8a5a00">⏳ ' + esc(T('Payment बाकी है')) + '</h3>' + payBtn(r.payLink, r.amount) + '</div>';
  };
})();
