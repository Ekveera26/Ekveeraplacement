/* EkVeera — Ekveera Tution (Teacher / Student) — सारा हिसाब Server (EkVeera_Tution.gs) में है; यहाँ सिर्फ़ फॉर्म, खोज और दिखाना */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const T = s => (typeof __t === 'function' ? __t(s) : s);
  const digits10 = s => String(s || '').replace(/\D/g, '').slice(-10);
  const PER = { Class: 'प्रति Class', Month: 'प्रति महीना', Course: 'पूरे Course की' };
  const MODE = { Online: 'Online', Home: 'घर पर आकर', Center: 'मेरे Center पर', Any: 'कहीं भी (Online / घर / Center)' };

  /* ---------------- Skill की पहले से बनी सूची (Teacher और Student दोनों को चुनना आसान) ---------------- */
  const SKILLS = {
    '💃 नृत्य (Dance)': ['Kathak', 'Bharatanatyam', 'लोक नृत्य (Folk)', 'Bollywood Dance', 'Hip-Hop', 'Garba / Dandiya', 'Zumba / Aerobics', 'Wedding / Sangeet Dance'],
    '🎵 संगीत (Music)': ['तबला', 'हारमोनियम', 'गिटार', 'कीबोर्ड / पियानो', 'बाँसुरी', 'वायलिन', 'ढोलक / ढोल', 'ड्रम्स', 'सितार', 'शास्त्रीय गायन (Vocal)', 'भजन / सुगम संगीत', 'Film Songs / Singing'],
    '🍳 खाना बनाना (Cooking)': ['घर का खाना / Indian Cooking', 'Chinese / Fast Food', 'Cake / Baking', 'मिठाई बनाना', 'Street Food / Chaat', 'Tiffin / Mess चलाना', 'अचार / पापड़ / बड़ी', 'Catering / हलवाई का काम'],
    '🧵 सिलाई-कढ़ाई': ['सिलाई (Tailoring)', 'Blouse / Suit Designing', 'कढ़ाई (Embroidery)', 'बुनाई (Knitting)', 'Zari / Zardozi', 'Boutique का काम'],
    '💄 सौंदर्य (Beauty)': ['Beautician Course', 'Makeup', 'मेहंदी (Mehndi)', 'Hair Style / Hair Cut', 'Nail Art', 'Facial / Skin Care'],
    '🎨 कला और शिल्प': ['Drawing / Sketching', 'Painting', 'रंगोली', 'Craft / Handmade सामान', 'मिट्टी के बर्तन (Pottery)', 'Calligraphy / सुलेख', 'Candle / Soap बनाना'],
    '🗣️ भाषा (Language)': ['Spoken English', 'हिंदी लेखन / व्याकरण', 'संस्कृत', 'उर्दू', 'अन्य भाषा'],
    '💻 कंप्यूटर': ['Basic Computer', 'MS Office (Word / Excel)', 'Tally / Accounting', 'Typing (Hindi / English)', 'Web Designing', 'Photoshop / DTP', 'Mobile चलाना सीखना', 'Mobile Repairing'],
    '📚 स्कूल / कोचिंग': ['कक्षा 1–5 सभी विषय', 'कक्षा 6–8 (Maths / Science)', 'कक्षा 9–10 (Board)', 'कक्षा 11–12 (Board)', 'Maths', 'Science', 'Commerce / Accounts', 'अंग्रेज़ी विषय', 'प्रतियोगी परीक्षा (Competitive Exam)', 'सरकारी नौकरी की तैयारी'],
    '🧘 खेल और फ़िटनेस': ['योग', 'Gym / Fitness Training', 'Cricket Coaching', 'Football', 'तैराकी (Swimming)', 'Karate / Self Defence', 'Skating', 'Badminton / Table Tennis'],
    '🛠️ हुनर / रोज़गार': ['Electrician', 'Plumber', 'AC / Fridge Repair', 'Car Driving', 'Bike / Scooter चलाना', 'Carpenter (बढ़ई)', 'Welding', 'Photography', 'Video Editing', 'Driving License में मदद'],
    '🌾 खेती और पशुपालन': ['जैविक खेती', 'डेयरी / पशुपालन', 'मुर्गी पालन', 'मछली पालन', 'मशरूम की खेती'],
    '🎤 व्यक्तित्व विकास': ['Public Speaking', 'Interview की तैयारी', 'Call Center / Customer Service Skills', 'Communication Skills', 'Business शुरू करना'],
    '➕ अन्य (Other)': ['Other (खुद लिखें)']
  };
  const GROUPS = Object.keys(SKILLS);
  const grpOpts = '<option value="">' + esc(T('— चुनें —')) + '</option>' + GROUPS.map(g => '<option value="' + esc(g) + '">' + esc(g) + '</option>').join('');
  $('sGrp').innerHTML = grpOpts;

  function say(id, text, kind) { const el = $(id); if (!el) return; el.className = 'rent-msg' + (kind ? ' ' + kind : ''); el.textContent = text || ''; }
  async function api(params) {
    try { return await vcSecurePost(params); }
    catch (e) { return { status: 'error', message: T('इंटरनेट / Server की दिक्कत — थोड़ी देर बाद फिर कोशिश करें।') }; }
  }
  function payBtn(link, amount) {
    if (!link) return '<p class="rent-warn" style="margin-top:10px">' + esc(T('Payment Link अभी नहीं बन पाया — कृपया WhatsApp (9766284669) पर अपनी ID बताएँ।')) + '</p>';
    return '<a class="btn btn-primary rent-pay" href="' + esc(link) + '" target="_blank" rel="noopener">💳 ' + esc(T('अभी Pay करें')) + ' ₹' + esc(amount) + '</a>';
  }
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

  /* ---------------- ऊपर की गिनती ---------------- */
  (async function () {
    const r = await api({ action: 'tutpubstats' });
    if (r && r.status === 'ok') { $('tsTeachers').textContent = r.teachers; $('tsStudents').textContent = r.students; $('tsSkills').textContent = r.skills; }
  })();

  /* ---------------- एक "Skill" का Form-खंड ---------------- */
  function skillBlock(no) {
    return '<div class="rent-item"><div class="ri-h"><span>🎯 ' + esc(T('Skill')) + ' ' + no + '</span>' + (no > 1 ? '<button type="button" class="ri-x" data-rm="1">✖ ' + esc(T('हटाएँ')) + '</button>' : '') + '</div>' +
      '<div class="rent-form">' +
      '<div><label>' + esc(T('Skill का प्रकार')) + '</label><select class="ri-grp">' + grpOpts + '</select></div>' +
      '<div><label>' + esc(T('कौन सी Skill')) + '</label><select class="ri-sk"><option value="">' + esc(T('पहले प्रकार चुनें')) + '</option></select></div>' +
      '<div class="full ri-oth" style="display:none"><label>' + esc(T('Skill का नाम खुद लिखें')) + '</label><input class="ri-other" type="text" maxlength="80"></div>' +
      '<div class="full"><label>' + esc(T('आप क्या-क्या सिखाएँगे (Level, Batch, खासियत)')) + '</label><textarea class="ri-det" maxlength="300"></textarea></div>' +
      '<div><label>' + esc(T('फ़ीस (₹)')) + '</label><input class="ri-fee" type="number" inputmode="decimal" min="1" max="10000000"></div>' +
      '<div><label>' + esc(T('फ़ीस किस हिसाब से')) + '</label><select class="ri-per"><option value="Month">' + esc(T('प्रति महीना')) + '</option><option value="Class">' + esc(T('प्रति Class')) + '</option><option value="Course">' + esc(T('पूरे Course की')) + '</option></select></div>' +
      '<div class="full"><label>' + esc(T('पढ़ाने का तरीका')) + '</label><select class="ri-mode"><option value="">' + esc(T('— चुनें —')) + '</option><option value="Online">Online</option><option value="Home">' + esc(T('घर पर आकर')) + '</option><option value="Center">' + esc(T('मेरे Center पर')) + '</option><option value="Any">' + esc(T('कहीं भी (Online / घर / Center)')) + '</option></select></div>' +
      '</div></div>';
  }
  function mountSkills(box, addBtn) {
    function renum() { Array.prototype.forEach.call(box.children, function (el, i) { const h = el.querySelector('.ri-h span'); if (h) h.textContent = '🎯 ' + T('Skill') + ' ' + (i + 1); }); }
    function add() { box.insertAdjacentHTML('beforeend', skillBlock(box.children.length + 1)); }
    addBtn.addEventListener('click', add);
    box.addEventListener('click', function (e) { const x = e.target.closest('[data-rm]'); if (x) { x.closest('.rent-item').remove(); renum(); } });
    box.addEventListener('change', function (e) {
      const el = e.target.closest('.rent-item'); if (!el) return;
      if (e.target.classList.contains('ri-grp')) {
        const list = SKILLS[e.target.value] || [];
        el.querySelector('.ri-sk').innerHTML = '<option value="">' + esc(T('— चुनें —')) + '</option>' + list.map(s => '<option value="' + esc(s) + '">' + esc(s) + '</option>').join('');
        el.querySelector('.ri-oth').style.display = 'none';
      }
      if (e.target.classList.contains('ri-sk')) el.querySelector('.ri-oth').style.display = /^Other/.test(e.target.value) ? '' : 'none';
    });
    return { add: add, reset: function () { box.innerHTML = ''; }, read: function () {
      return Array.prototype.map.call(box.children, function (el) {
        const g = c => (el.querySelector(c) || {}).value || '', sk = g('.ri-sk'), oth = g('.ri-other').trim();
        return { group: g('.ri-grp'), skill: /^Other/.test(sk) ? oth : sk, details: g('.ri-det').trim(), fee: g('.ri-fee'), feePer: g('.ri-per'), mode: g('.ri-mode') };
      });
    } };
  }
  function skillErr(list) {
    for (let i = 0; i < list.length; i++) {
      const it = list[i], pre = list.length > 1 ? T('Skill') + ' ' + (i + 1) + ': ' : '';
      if (!it.group) return pre + T('Skill का प्रकार चुनें।');
      if (!it.skill) return pre + T('कौन सी Skill है — चुनें (या Other में नाम लिखें)।');
      if (!(parseFloat(it.fee) > 0)) return pre + T('सही फ़ीस (₹) लिखें।');
      if (!it.mode) return pre + T('पढ़ाने का तरीका चुनें।');
    }
    return '';
  }

  /* ---------------- Teacher ---------------- */
  const gBox = $('gItems'), gM = mountSkills(gBox, $('gAddItem')); gM.add();
  window.tutRegister = async function () {
    const btn = $('gBtn'), v = id => ($(id) ? $(id).value.trim() : '');
    if (v('gName').length < 2) return say('gMsg', T('अपना पूरा नाम लिखें।'), 'err');
    if (digits10(v('gMobile')).length !== 10) return say('gMsg', T('10 अंकों का सही Mobile Number लिखें।'), 'err');
    if (!v('gLoc')) return say('gMsg', T('पढ़ाने की Location (शहर / इलाका) लिखें।'), 'err');
    const list = gM.read(), ie = skillErr(list); if (ie) return say('gMsg', ie, 'err');
    if (!$('gTerms').checked) return say('gMsg', T('आगे बढ़ने के लिए शर्तों पर ✔ लगाएँ।'), 'err');
    btn.disabled = true; say('gMsg', T('⏳ दर्ज किया जा रहा है...'), '');
    const r = await api({ action: 'tutregister', name: v('gName'), mobile: digits10(v('gMobile')), email: v('gEmail'), location: v('gLoc'), address: v('gAddr'), qualification: v('gQual'), experience: v('gExp'),
      skills: JSON.stringify(list), terms: '1', website: v('gWebsite'), staff: (window.ekvStaffRef && window.ekvStaffRef()) || '' });
    btn.disabled = false;
    if (!r || r.status !== 'ok') return say('gMsg', (r && r.message) || T('कुछ गड़बड़ हो गई — फिर कोशिश करें।'), 'err');
    say('gMsg', '', '');
    $('gDoneGid').textContent = r.teacherId; $('gDoneIid').textContent = (r.skillIds || [r.skillId]).join(' , ');
    $('gDone').style.display = 'block';
    if (r.alreadyPaid || !r.amount) {
      $('gDonePay').innerHTML = '<div style="font-weight:800;color:#11766F;font-size:16px">✅ ' + esc(T('आपकी Registration पहले से Active है — यह Skill तुरंत दिखने लगी, कोई नई Payment नहीं।')) + '</div>';
      $('gDoneTxt').textContent = r.validTill ? T('आपकी Registration इस तारीख़ तक चलेगी: ') + r.validTill : '';
    } else {
      $('gDonePay').innerHTML = payBtn(r.payLink, r.amount);
      $('gDoneTxt').textContent = T('Payment होते ही आपकी Skill Student को दिखने लगेगी। 1 घंटे में Payment न हुई तो Entry छुप जाएगी।');
      poll('teacher', () => api({ action: 'tutmylisting', teacherId: r.teacherId, mobile: digits10(v('gMobile')) }), function (s) {
        if (s.status === 'ok' && s.active) { $('gDonePay').innerHTML = '<div style="font-weight:800;color:#11766F;font-size:16px">✅ ' + esc(T('Payment मिल गई — आपकी Skill अब चालू है।')) + '</div>'; return true; } return false;
      });
    }
    gM.reset(); gM.add(); $('gDone').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  let myCred = null;
  const aBox = $('aItems'), aM = mountSkills(aBox, $('aAddItem'));
  window.tutMyListing = async function () {
    const tid = $('mGid').value.trim().toUpperCase(), mob = digits10($('mMob').value);
    if (!tid || mob.length !== 10) return say('mMsg', T('Teacher ID और 10 अंकों का Mobile डालें।'), 'err');
    say('mMsg', T('⏳ देखा जा रहा है...'), '');
    const r = await api({ action: 'tutmylisting', teacherId: tid, mobile: mob });
    if (!r || r.status !== 'ok') { $('mOut').innerHTML = ''; $('aBox').style.display = 'none'; return say('mMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err'); }
    say('mMsg', '', '');
    let h = '<div class="rent-detail"><h3>' + esc(r.teacherId) + ' — ' + esc(r.name) + '</h3><table>';
    h += '<tr><td>' + esc(T('Registration')) + '</td><td>' + (r.active ? '✅ ' + esc(T('Active — इस तारीख़ तक: ')) + esc(r.validTill) : (r.paid ? '⌛ ' + esc(T('1 साल पूरा हो चुका — दोबारा Register करें')) : '⏳ ' + esc(T('Payment बाकी — Skill अभी छुपी है')))) + '</td></tr>';
    (r.skills || []).forEach(function (it) {
      h += '<tr><td>' + esc(it.skillId) + '</td><td>' + esc(it.skill) + ' — ₹' + esc(it.fee) + ' ' + esc(T(PER[it.per] || it.per)) + ' · ' + esc(T(MODE[it.mode] || it.mode));
      if (r.active) h += '<br>' + (it.skillStatus === 'Closed'
        ? '<b style="color:#a12a1f">🔒 ' + esc(T('Close')) + '</b> <button type="button" class="btn btn-primary" style="padding:5px 12px;font-size:13px" data-sst="open" data-sid="' + esc(it.skillId) + '">' + esc(T('Open करें')) + '</button>'
        : '<b style="color:#1b7f3b">🟢 ' + esc(T('Open (Live)')) + '</b> <button type="button" class="btn" style="padding:5px 12px;font-size:13px" data-sst="close" data-sid="' + esc(it.skillId) + '">' + esc(T('Close करें')) + '</button>');
      h += '</td></tr>';
    });
    h += '</table>' + (!r.paid ? payBtn(r.payLink, r.amount) : '') + '</div>';
    $('mOut').innerHTML = h;
    if (r.active) { myCred = { tid: r.teacherId, mob: mob }; $('aBox').style.display = 'block'; aM.reset(); aM.add(); say('aMsg', '', ''); }
    else { $('aBox').style.display = 'none'; myCred = null; }
  };
  $('mOut').addEventListener('click', async function (e) {
    const b = e.target.closest('[data-sst]'); if (!b || !myCred) return;
    const to = b.getAttribute('data-sst');
    if (!confirm(T(to === 'open' ? 'यह Skill फिर से Student को दिखेगी। ठीक है?' : 'Close करने पर यह Skill Student को "Close" दिखेगी और चुनी नहीं जा सकेगी। ठीक है?'))) return;
    b.disabled = true;
    const r = await api({ action: 'tutsetstatus', teacherId: myCred.tid, mobile: myCred.mob, skillId: b.getAttribute('data-sid'), status: to });
    if (!r || r.status !== 'ok') { b.disabled = false; return say('mMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err'); }
    window.tutMyListing();
  });
  window.tutAddMore = async function () {
    if (!myCred) return say('aMsg', T('पहले ऊपर अपनी Listing देखें।'), 'err');
    const list = aM.read(), ie = skillErr(list); if (ie) return say('aMsg', ie, 'err');
    $('aBtn').disabled = true; say('aMsg', T('⏳ जोड़ा जा रहा है...'), '');
    const r = await api({ action: 'tutaddskill', teacherId: myCred.tid, mobile: myCred.mob, skills: JSON.stringify(list) });
    $('aBtn').disabled = false;
    if (!r || r.status !== 'ok') return say('aMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err');
    say('aMsg', '✅ ' + T('Skill जुड़ गई — ID:') + ' ' + (r.skillIds || [r.skillId]).join(' , '), 'ok');
    setTimeout(function () { window.tutMyListing(); }, 400);
  };

  /* ---------------- Student ---------------- */
  const S = { grp: '', q: '', loc: '', shown: [], busy: false };
  function cardHtml(x) {
    return '<div class="rent-card"><b>' + esc(x.skillId) + '</b><div class="loc">🎯 ' + esc(x.skill) + '</div><div class="loc" style="margin-top:-6px">📍 ' + esc(x.location) + '</div>' +
      (x.closed
        ? '<div style="margin:0 0 8px;padding:8px 10px;border-radius:8px;background:#fdecea;color:#a12a1f;font-weight:700;font-size:13.5px">🔒 ' + esc(T('Close — अभी नए Student नहीं ले रहे')) + '</div><button type="button" class="btn" disabled style="opacity:.5;cursor:not-allowed">' + esc(T('अभी उपलब्ध नहीं')) + '</button></div>'
        : '<button type="button" class="btn btn-primary" data-pick="' + esc(x.skillId) + '">' + esc(T('यह Skill सीखनी है')) + '</button></div>');
  }
  async function runSearch(offset) {
    if (S.busy) return; S.busy = true;
    const first = offset === 0;
    if (first) { S.grp = $('sGrp').value; S.q = $('sQ').value.trim(); S.loc = $('sLoc').value.trim(); S.shown = []; $('sOut').innerHTML = ''; $('sMoreBox').innerHTML = ''; }
    if (!S.grp && !S.q) { S.busy = false; return say('sMsg', T('Skill का प्रकार चुनें (या Skill का नाम लिखें)।'), 'err'); }
    say('sMsg', T('⏳ खोजा जा रहा है...'), '');
    const r = await api({ action: 'tutsearch', group: S.grp, q: S.q, location: S.loc, offset: offset });
    S.busy = false;
    if (!r || r.status !== 'ok') return say('sMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err');
    const seen = new Set(S.shown.map(x => x.skillId)), fresh = (r.results || []).filter(x => !seen.has(x.skillId));
    fresh.forEach(x => S.shown.push(x));
    if (first && !S.shown.length) { say('sMsg', T('इस खोज में अभी कोई Skill नहीं मिली — दूसरी Skill या इलाका आज़माएँ।'), 'err'); return; }
    say('sMsg', S.shown.length + ' ' + T('Skill मिलीं — सिर्फ़ ID और Location दिख रही है; Teacher की Details ₹29 की Payment के बाद।'), 'ok');
    $('sOut').insertAdjacentHTML('beforeend', fresh.map(cardHtml).join(''));
    $('sMoreBox').innerHTML = r.hasMore ? '<button type="button" class="btn" id="sMore">' + esc(T('और देखें')) + '</button>' : (r.capped ? '<p class="rent-note">' + esc(T('30 से ज़्यादा Skill हैं — खोज में इलाका या नाम जोड़कर सटीक करें।')) + '</p>' : '');
    if ($('sMore')) $('sMore').onclick = function () { runSearch(r.nextOffset); };
  }
  window.tutSearch = function () { runSearch(0); };
  let picked = '';
  $('sOut').addEventListener('click', function (e) {
    const b = e.target.closest('[data-pick]'); if (!b) return;
    picked = b.getAttribute('data-pick');
    $('oTitle').textContent = T('Skill चुनी:') + ' ' + picked; $('oBox').style.display = 'block'; $('oPay').innerHTML = ''; say('oMsg', '', '');
    $('oBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  window.tutOrder = async function () {
    const v = id => $(id).value.trim();
    if (!picked) return say('oMsg', T('पहले कोई Skill चुनें।'), 'err');
    if (v('oName').length < 2) return say('oMsg', T('अपना पूरा नाम लिखें।'), 'err');
    if (digits10(v('oMobile')).length !== 10) return say('oMsg', T('10 अंकों का सही Mobile Number लिखें।'), 'err');
    if (!$('oTerms').checked) return say('oMsg', T('शर्त पर ✔ लगाना ज़रूरी है।'), 'err');
    $('oBtn').disabled = true; say('oMsg', T('⏳ Order बनाया जा रहा है...'), '');
    const r = await api({ action: 'tutorder', skillId: picked, name: v('oName'), mobile: digits10(v('oMobile')), email: v('oEmail'), terms: '1' });
    $('oBtn').disabled = false;
    if (!r || r.status !== 'ok') return say('oMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err');
    say('oMsg', '✅ ' + T('Order ID:') + ' ' + r.orderId + ' — ' + T('इसे संभालकर रखें।'), 'ok');
    $('oPay').innerHTML = payBtn(r.payLink, r.amount);
    const mob = digits10(v('oMobile'));
    poll('order', () => api({ action: 'tutgetorder', orderId: r.orderId, mobile: mob }), function (s) { if (s.status === 'ok' && s.paid) { showOrder(s, 'oDetail'); return true; } return false; });
  };
  function showOrder(r, target) {
    const k = r.skill || {}, t = r.teacher || {};
    $(target).innerHTML = '<div class="rent-detail"><h3>✅ ' + esc(T('Payment हो गई — Teacher की जानकारी')) + '</h3><table>' +
      '<tr><td>' + esc(T('Skill')) + '</td><td>' + esc(k.skill) + ' (' + esc(k.skillId) + ')</td></tr>' +
      '<tr><td>' + esc(T('फ़ीस')) + '</td><td>₹' + esc(k.fee) + ' ' + esc(T(PER[k.per] || k.per)) + ' · ' + esc(T(MODE[k.mode] || k.mode)) + '</td></tr>' +
      (k.details ? '<tr><td>' + esc(T('जानकारी')) + '</td><td>' + esc(k.details) + '</td></tr>' : '') +
      '<tr><td>' + esc(T('Teacher')) + '</td><td>' + esc(t.name) + (t.qualification ? ' — ' + esc(t.qualification) : '') + (t.experience ? ' · ' + esc(t.experience) + ' ' + esc(T('साल अनुभव')) : '') + '</td></tr>' +
      '<tr><td>Mobile</td><td><a href="tel:' + esc(t.mobile) + '">' + esc(t.mobile) + '</a></td></tr>' +
      '<tr><td>' + esc(T('Location')) + '</td><td>' + esc(t.location) + (t.address ? ', ' + esc(t.address) : '') + '</td></tr></table></div>';
  }
  window.tutGetOrder = async function () {
    const oid = $('qOid').value.trim().toUpperCase(), mob = digits10($('qMob').value);
    if (!oid || mob.length !== 10) return say('qMsg', T('Order ID और 10 अंकों का Mobile डालें।'), 'err');
    say('qMsg', T('⏳ देखा जा रहा है...'), '');
    const r = await api({ action: 'tutgetorder', orderId: oid, mobile: mob });
    if (!r || r.status !== 'ok') { $('qOut').innerHTML = ''; return say('qMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err'); }
    say('qMsg', '', '');
    if (!r.paid) { $('qOut').innerHTML = '<div class="rent-detail"><p>' + esc(T('इस Order की Payment अभी बाकी है।')) + '</p>' + payBtn(r.payLink, r.amount) + '</div>'; return; }
    showOrder(r, 'qOut');
  };
})();
