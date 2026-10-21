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

  /* ---------------- सामान के प्रकार + Plan (1 सामान ₹49 | 2 सामान ₹89 | 2 से ज़्यादा ₹299) ---------------- */
  const CATS = ['Bike / Scooter', 'Cycle', 'Car', 'E-Rickshaw / Auto', 'Tractor / Kheti ka Saman', 'Camera / Video', 'Laptop / Computer', 'Mobile / Tablet', 'Tent / Pandal / Shamiyana', 'Chair / Table / Furniture', 'Sound System / DJ / Speaker', 'Generator', 'Power Tools / Drill / Machine', 'Ladder / Seedhi', 'Wheelchair / Medical Saman', 'Bartan / Catering Saman', 'Cooler / Fan / AC', 'Shaadi / Function ka Saman', 'Kitaabein / Study Material', 'Kapde / Costume', 'Other'];
  const FEE = { '1': 49, '2': 89, 'U': 299 };
  const planFor = n => n <= 1 ? '1' : (n === 2 ? '2' : 'U');
  const catOpts = '<option value="">' + esc(T('— चुनें —')) + '</option>' + CATS.map(c => '<option value="' + esc(c) + '">' + esc(c) + '</option>').join('');
  $('sCat').innerHTML = catOpts;

  /* एक "सामान" का Form-खंड — Giver जितने चाहे उतने जोड़ सकता है */
  function itemBlock(no) {
    return '<div class="rent-item"><div class="ri-h"><span>📦 ' + esc(T('सामान')) + ' ' + no + '</span>' + (no > 1 ? '<button type="button" class="ri-x" data-rm="1">✖ ' + esc(T('हटाएँ')) + '</button>' : '') + '</div>' +
      '<div class="rent-form">' +
      '<div><label>' + esc(T('सामान का प्रकार')) + '</label><select class="ri-cat">' + catOpts + '</select></div>' +
      '<div><label>' + esc(T('सामान का नाम (लिस्ट में न हो तो यहाँ लिखें)')) + '</label><input class="ri-name" type="text" maxlength="80" placeholder="' + esc(T('जैसे: Royal Enfield 350')) + '"></div>' +
      '<div class="full"><label>' + esc(T('सामान की जानकारी (मॉडल, साल, खासियत)')) + '</label><textarea class="ri-det" maxlength="300"></textarea></div>' +
      '<div><label>' + esc(T('किराया (₹)')) + '</label><input class="ri-rent" type="number" inputmode="decimal" min="1" max="10000000"></div>' +
      '<div><label>' + esc(T('किराया किस हिसाब से')) + '</label><select class="ri-per"><option value="Day">' + esc(T('प्रति दिन')) + '</option><option value="Week">' + esc(T('प्रति हफ़्ता')) + '</option><option value="Month">' + esc(T('प्रति महीना')) + '</option><option value="Event">' + esc(T('एक Event / Function के लिए')) + '</option></select></div>' +
      '<div class="full"><label>' + esc(T('सामान की हालत')) + '</label><select class="ri-cond"><option value="">' + esc(T('— चुनें —')) + '</option><option value="New like">' + esc(T('नया जैसा')) + '</option><option value="Good">' + esc(T('अच्छी हालत')) + '</option><option value="Average">' + esc(T('ठीक-ठाक')) + '</option></select></div>' +
      '</div></div>';
  }
  /* box = Items का container, addBtn = "और सामान" बटन, onChange = बिल दोबारा दिखाने को */
  function mountItems(box, addBtn, onChange) {
    function renum() { Array.prototype.forEach.call(box.children, function (el, i) { const h = el.querySelector('.ri-h span'); if (h) h.textContent = '📦 ' + T('सामान') + ' ' + (i + 1); }); }
    function add() { box.insertAdjacentHTML('beforeend', itemBlock(box.children.length + 1)); onChange(); }
    addBtn.addEventListener('click', add);
    box.addEventListener('click', function (e) { const x = e.target.closest('[data-rm]'); if (x) { x.closest('.rent-item').remove(); renum(); onChange(); } });
    return { add: add, reset: function () { box.innerHTML = ''; }, read: function () {
      return Array.prototype.map.call(box.children, function (el) {
        const g = c => (el.querySelector(c) || {}).value || '';
        return { category: g('.ri-cat'), itemName: g('.ri-name').trim(), details: g('.ri-det').trim(), rent: g('.ri-rent'), rentPer: g('.ri-per'), condition: g('.ri-cond') };
      });
    } };
  }
  function itemErr(list) {
    for (let i = 0; i < list.length; i++) {
      const it = list[i], pre = list.length > 1 ? T('सामान') + ' ' + (i + 1) + ': ' : '';
      if (!it.category) return pre + T('सामान का प्रकार चुनें।');
      if (it.category === 'Other' && !it.itemName) return pre + T("'Other' चुना है तो सामान का नाम लिखना ज़रूरी है।");
      if (!(parseFloat(it.rent) > 0)) return pre + T('सही किराया (₹) लिखें।');
      if (!it.condition) return pre + T('सामान की हालत चुनें।');
    }
    return '';
  }

  /* ---------------- Giver ---------------- */
  function billText(n, base) {          // base = अभी की Plan {plan, count} (Paid Giver के लिए)
    if (!base) { const pl = planFor(n); return '🧾 ' + n + ' ' + T('सामान') + ' → ' + (pl === 'U' ? T('Unlimited Plan') : T('Plan')) + ' ₹' + FEE[pl] + ' ' + T('(पूरे 1 साल के लिए)'); }
    const total = base.count + n, cap = base.plan === 'U' ? 1e9 : (base.plan === '2' ? 2 : 1);
    if (total <= cap) return '🧾 ' + T('आपके Plan में जगह है — कोई नई Payment नहीं लगेगी।');
    const np = planFor(total), diff = FEE[np] - FEE[base.plan];
    return '🧾 ' + T('कुल') + ' ' + total + ' ' + T('सामान') + ' → ' + (np === 'U' ? T('Unlimited Plan') : T('Plan')) + ' ₹' + FEE[np] + ' — ' + T('आप पहले ₹') + FEE[base.plan] + ' ' + T('दे चुके हैं, इसलिए सिर्फ़ फ़र्क़ ₹') + diff + ' ' + T('देना होगा।');
  }
  const gBox = $('gItems'), gM = mountItems(gBox, $('gAddItem'), function () { $('gBill').textContent = billText(gBox.children.length); $('gBtn').textContent = '💳 ' + T('सामान दर्ज करें और ₹') + FEE[planFor(gBox.children.length)] + T(' Pay करें'); });
  gM.add();

  function showItemIds(r) { return (r.itemIds && r.itemIds.length > 1) ? r.itemIds.join(' , ') : r.itemId; }
  window.rentRegister = async function () {
    const btn = $('gBtn');
    const v = id => ($(id) ? $(id).value.trim() : '');
    if (!v('gName') || v('gName').length < 2) return say('gMsg', T('अपना पूरा नाम लिखें।'), 'err');
    if (digits10(v('gMobile')).length !== 10) return say('gMsg', T('10 अंकों का सही Mobile Number लिखें।'), 'err');
    if (!v('gLoc') || (document.getElementById('gLoc_di') && !document.getElementById('gLoc_di').value)) return say('gMsg', T('ज़िला, तहसील और शहर / गाँव चुनें (या Other में लिखें)।'), 'err');
    const list = gM.read(), ie = itemErr(list); if (ie) return say('gMsg', ie, 'err');
    if (!$('gTerms').checked) return say('gMsg', T('आगे बढ़ने के लिए शर्तों पर ✔ लगाएँ।'), 'err');
    btn.disabled = true; say('gMsg', T('⏳ दर्ज किया जा रहा है...'), '');
    const r = await api({ action: 'rentregister', name: v('gName'), mobile: digits10(v('gMobile')), email: v('gEmail'), location: v('gLoc'), address: v('gAddr'),
      items: JSON.stringify(list), terms: '1', website: v('gWebsite'),
      staff: (window.ekvStaffRef && window.ekvStaffRef()) || '' });
    btn.disabled = false;
    if (!r || r.status !== 'ok') return say('gMsg', (r && r.message) || T('कुछ गड़बड़ हो गई — फिर कोशिश करें।'), 'err');
    say('gMsg', '', '');
    $('gDoneGid').textContent = r.giverId; $('gDoneIid').textContent = showItemIds(r);
    $('gDone').style.display = 'block';
    if (r.alreadyPaid || !r.amount) {
      $('gDonePay').innerHTML = '<div style="font-weight:800;color:#11766F;font-size:16px">✅ ' + esc(T('आपकी Registration पहले से Active है — यह सामान तुरंत दिखने लगा, कोई नई Payment नहीं।')) + '</div>';
      $('gDoneTxt').textContent = r.validTill ? T('आपकी Registration इस तारीख़ तक चलेगी: ') + r.validTill : '';
    } else {
      $('gDonePay').innerHTML = payBtn(r.payLink, r.amount);
      $('gDoneTxt').textContent = r.upgrade ? T('Plan बढ़ाने की Payment होते ही नया सामान दिखने लगेगा; पुराना सामान दिखता रहेगा।') : T('⏰ 1 घंटे में Payment न करने पर आपकी Entry छुपा दी जाएगी। Payment होते ही यहीं अपने-आप "Active" दिखेगा।');
      poll('giver', () => api({ action: 'rentmylisting', giverId: r.giverId, mobile: digits10(v('gMobile')) }), function (s) {
        const ok = s.status === 'ok' && s.active && (!r.upgrade || !s.upgradeAmount);
        if (ok) {
          $('gDonePay').innerHTML = '<div style="font-weight:800;color:#11766F;font-size:17px">✅ ' + esc(T('Payment मिल गई — आपका सामान अब 1 साल तक खोज में दिखेगा।')) + '</div>';
          $('gDoneTxt').textContent = T('आपकी Registration इस तारीख़ तक चलेगी: ') + s.validTill;
          return true;
        }
        return false;
      });
    }
    $('gDone').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  /* ---------- मेरी Listing + और सामान जोड़ना (Giver ID + Mobile से) ---------- */
  let myBase = null, myCred = null;
  const aBox = $('aItems'), aM = mountItems(aBox, $('aAddItem'), function () { $('aBill').textContent = billText(aBox.children.length, myBase); });
  window.rentMyListing = async function () {
    const gid = $('mGid').value.trim().toUpperCase(), mob = digits10($('mMob').value);
    if (!gid || mob.length !== 10) return say('mMsg', T('Giver ID और 10 अंकों का Mobile डालें।'), 'err');
    say('mMsg', T('⏳ देखा जा रहा है...'), '');
    const r = await api({ action: 'rentmylisting', giverId: gid, mobile: mob });
    if (!r || r.status !== 'ok') { $('mOut').innerHTML = ''; $('aBox').style.display = 'none'; return say('mMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err'); }
    say('mMsg', '', '');
    const planName = r.plan === 'U' ? T('Unlimited (₹299)') : (r.plan === '2' ? T('2 सामान (₹89)') : T('1 सामान (₹49)'));
    let h = '<div class="rent-detail"><h3>' + esc(r.giverId) + ' — ' + esc(r.name) + '</h3><table>';
    h += '<tr><td>' + esc(T('Registration')) + '</td><td>' + (r.active ? '✅ ' + esc(T('Active — इस तारीख़ तक: ')) + esc(r.validTill)
      : (r.paid ? '⌛ ' + esc(T('1 साल पूरा हो चुका — नीचे Renew करें (वही ID, सारा सामान वैसा ही)')) : '⏳ ' + esc(T('Payment बाकी — सामान अभी छुपा है')))) + '</td></tr>';
    h += '<tr><td>Plan</td><td>' + esc(planName) + ' · ' + esc(r.itemCount) + ' ' + esc(T('सामान')) + '</td></tr>';
    (r.items || []).forEach(function (it) { h += '<tr><td>' + esc(it.itemId) + '</td><td>' + esc(it.name) + ' — ₹' + esc(it.rent) + ' ' + esc(T(PER[it.per] || it.per)) + (/^pending/i.test(it.visible) ? ' <b style="color:#8a5a00">⏳ ' + esc(T('Plan बढ़ाने की Payment बाकी')) + '</b>' : '') +
      (r.active && !/^pending/i.test(it.visible) ? '<br>' + (it.itemStatus === 'Closed'
        ? '<b style="color:#a12a1f">🔒 ' + esc(T('Close')) + '</b> <button type="button" class="btn btn-primary" style="padding:5px 12px;font-size:13px" data-ist="open" data-iid="' + esc(it.itemId) + '">' + esc(T('Open करें (सामान वापस आ गया)')) + '</button>'
        : '<b style="color:#1b7f3b">🟢 ' + esc(T('Open')) + '</b> <button type="button" class="btn" style="padding:5px 12px;font-size:13px" data-ist="close" data-iid="' + esc(it.itemId) + '">' + esc(T('Close करें')) + '</button>') : '') + '</td></tr>'; });
    h += '</table>';
    if (!r.paid) h += payBtn(r.payLink, r.amount);
    if (r.active && r.upgradeAmount) h += '<p style="margin:12px 0 0;font-size:14px">' + esc(T('Plan बढ़ाने की बाक़ी Payment (सिर्फ़ फ़र्क़):')) + '</p>' + payBtn(r.upgradeLink, r.upgradeAmount);
    if (r.paid && r.renewable) h += '<div style="margin-top:12px;padding:12px;border-radius:10px;background:#FFF8E5;border:1px solid #f0d58a"><b>🔁 ' + esc(T('Registration Renew करें')) + '</b><p style="margin:6px 0 8px;font-size:14px">' +
      esc(T('एक साल की फ़ीस आपकी ID की होती है, हर सामान की अलग नहीं। आज की सामान-संख्या के हिसाब से Renew फ़ीस: ₹')) + esc(r.renewAmount) + '</p><button type="button" class="btn btn-primary" id="rentRenewBtn">' + esc(T('Renew का Payment Link बनाएँ')) + '</button><div id="rentRenewOut"></div></div>';
    h += '</div>';
    $('mOut').innerHTML = h;
    if (r.active) {
      myBase = { plan: r.plan, count: r.itemCount }; myCred = { gid: r.giverId, mob: mob };
      $('aBox').style.display = 'block'; aM.reset(); aM.add(); $('aPay').innerHTML = ''; say('aMsg', '', '');
    } else { $('aBox').style.display = 'none'; myBase = null; myCred = null; }
  };
  $('mOut').addEventListener('click', async function (e) {
    const rb = e.target.closest('#rentRenewBtn');
    if (rb) {
      const gid = $('mGid').value.trim().toUpperCase(), mob = digits10($('mMob').value);
      rb.disabled = true; $('rentRenewOut').innerHTML = esc(T('⏳ देखा जा रहा है...'));
      const rr = await api({ action: 'rentrenew', giverId: gid, mobile: mob });
      rb.disabled = false;
      if (!rr || rr.status !== 'ok') { $('rentRenewOut').innerHTML = '<p class="err">' + esc((rr && rr.message) || T('कुछ गड़बड़ हो गई।')) + '</p>'; return; }
      $('rentRenewOut').innerHTML = payBtn(rr.payLink, rr.amount) + '<p class="rent-note" style="margin-top:8px">' + esc(T('Payment होते ही वही ID एक साल और चालू हो जाएगी; बचे दिन जुड़ जाएँगे।')) + '</p>';
      return;
    }
    const b = e.target.closest('[data-ist]'); if (!b || !myCred) return;
    const to = b.getAttribute('data-ist');
    if (!confirm(T(to === 'open' ? 'सामान वापस आ गया है? Open करने पर यह फिर से Taker को दिखेगा।' : 'Close करने पर यह सामान किसी को चुनने के लिए नहीं दिखेगा। ठीक है?'))) return;
    b.disabled = true;
    const r = await api({ action: 'rentsetstatus', giverId: myCred.gid, mobile: myCred.mob, itemId: b.getAttribute('data-iid'), status: to });
    if (!r || r.status !== 'ok') { b.disabled = false; return say('mMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err'); }
    window.rentMyListing();
  });
  window.rentAddMore = async function () {
    if (!myCred) return say('aMsg', T('पहले ऊपर अपनी Listing देखें।'), 'err');
    const list = aM.read(), ie = itemErr(list); if (ie) return say('aMsg', ie, 'err');
    $('aBtn').disabled = true; say('aMsg', T('⏳ जोड़ा जा रहा है...'), '');
    const r = await api({ action: 'rentadditem', giverId: myCred.gid, mobile: myCred.mob, items: JSON.stringify(list) });
    $('aBtn').disabled = false;
    if (!r || r.status !== 'ok') return say('aMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err');
    say('aMsg', '✅ ' + T('सामान जुड़ गया — ID:') + ' ' + showItemIds(r), 'ok');
    $('aPay').innerHTML = r.amount ? '<p class="rent-note" style="margin-top:10px">' + esc(T('Plan बढ़ाने के लिए सिर्फ़ फ़र्क़ की रक़म दें — Payment के बाद नया सामान दिखने लगेगा:')) + '</p>' + payBtn(r.payLink, r.amount) : '';
    aM.reset(); aM.add(); myBase = null;
    setTimeout(function () { window.rentMyListing(); }, 400);
  };

  /* ---------------- Taker ---------------- */
  /* ---- खोज: पहले 10, फिर "और देखें" से 11–20, फिर 21–30 (सिर्फ़ ID + Location) ---- */
  const S = { cat: '', q: '', loc: '', shown: [], next: 0, busy: false };
  function cardHtml(x) {
    return '<div class="rent-card"><b>' + esc(x.itemId) + '</b><div class="loc">📍 ' + esc(x.location) + '</div>' +
      (x.closed
        ? '<div class="rent-closed" style="margin-top:8px;padding:8px 10px;border-radius:8px;background:#fdecea;color:#a12a1f;font-weight:700;font-size:13.5px">🔒 ' + esc(T('Close — अभी किराए पर है')) + '</div>' +
          '<button type="button" class="btn" disabled style="margin-top:6px;opacity:.5;cursor:not-allowed">' + esc(T('अभी उपलब्ध नहीं')) + '</button></div>'
        : '<button type="button" class="btn btn-primary" data-pick="' + esc(x.itemId) + '">' + esc(T('यह सामान चाहिए')) + '</button></div>');
  }
  async function runSearch(offset) {
    if (S.busy) return; S.busy = true;
    const first = offset === 0;
    if (first) { S.cat = $('sCat').value; S.q = $('sQ').value.trim(); S.loc = ($('sLoc').value || '').trim(); S.shown = []; $('sOut').innerHTML = ''; $('sMoreBox').innerHTML = ''; }
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

  /* ---------- Page की ginti: Giver / Taker / सामान ---------- */
  (async function () {
    const KEY = 'ekv_rent_stats_v1', nz = v => (v == null || v === '' || isNaN(Number(v))) ? 0 : v, paint = d => { $('rsGivers').textContent = nz(d.givers); $('rsTakers').textContent = nz(d.takers); $('rsItems').textContent = nz(d.items); };
    try { const c = localStorage.getItem(KEY); if (c) paint(JSON.parse(c)); } catch (e) {}
    const d = await api({ action: 'rentpubstats' });
    if (d && d.status === 'ok') { paint(d); try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  })();
})();
