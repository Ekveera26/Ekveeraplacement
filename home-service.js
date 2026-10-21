/* EkVeera Home Service — कारीगर रजिस्ट्रेशन + ग्राहक (Customer) खोज, Order, रेटिंग — सब इसी एक फ़ाइल में।
 * For Rent जैसा ही सिस्टम: सारा हिसाब EkVeera के मुख्य Apps Script (EkVeera_HomeService.gs) में है — अलग Apps Script / अलग Sheet / अलग URL की ज़रूरत नहीं।
 *   कारीगर : रजिस्ट्रेशन + दस्तावेज़ → ₹49 (1 साल) → Payment के बाद Admin की मंज़ूरी → खोज में दिखता है
 *   ग्राहक  : खोज में सिर्फ़ कारीगर की ID + Location → ₹29 का Order → Payment के बाद ही नाम, Mobile, Location */
(function () {
  'use strict';
  /* ===== सेटिंग: जिन राज्यों में सेवा चालू है। नया राज्य खोलना हो तो पहले data/UP.json डालें, फिर यहाँ 'UP' जोड़ें ===== */
  const ACTIVE = ['MP'];
  const DATA = {"CATS":{"⚡ बिजली व इलेक्ट्रॉनिक":["इलेक्ट्रिशियन","इन्वर्टर/बैटरी मैकेनिक","सोलर पैनल इंस्टॉलर","सीसीटीवी कैमरा इंस्टॉलर","टीवी मैकेनिक","वाशिंग मशीन मैकेनिक","माइक्रोवेव/ओवन मैकेनिक","गीज़र मैकेनिक","पंखा/कूलर मैकेनिक","मोटर रिवाइंडिंग मिस्त्री","मोबाइल रिपेयर","कंप्यूटर/लैपटॉप रिपेयर","प्रिंटर रिपेयर","वाई-फाई/केबल इंस्टॉलर","डिश/DTH एंटीना इंस्टॉलर","अलार्म/इंटरकॉम इंस्टॉलर","जनरेटर मैकेनिक","सजावटी लाइट फिटर"],"🚰 पानी व सेनेटरी":["प्लंबर","पाइपलाइन फिटर","बोरवेल/हैंडपंप मिस्त्री","सबमर्सिबल पंप मैकेनिक","RO वाटर प्यूरीफायर मैकेनिक","पानी टंकी सफाई वाला","सेप्टिक टैंक सफाई","सीवर/नाली खोलने वाला","बाथरूम फिटिंग मिस्त्री","टैंक वॉटरप्रूफिंग मिस्त्री","सोलर वॉटर हीटर मिस्त्री"],"🧱 निर्माण व सिविल":["मिस्त्री/राजमिस्त्री","मज़दूर/हेल्पर","ठेकेदार (सिविल)","प्लास्टर मिस्त्री","टाइल्स/मार्बल फिटर","पत्थर/ग्रेनाइट मिस्त्री","बार-बेंडर (सरिया)","शटरिंग मिस्त्री","सेंट्रिंग मिस्त्री","छत ढलाई मिस्त्री","वॉटरप्रूफिंग मिस्त्री","पीओपी/फॉल्स सीलिंग मिस्त्री","खुदाई/जेसीबी ऑपरेटर","कुआँ/गड्ढा खोदने वाला","चौखट/दरवाज़ा फिटर","आर्किटेक्ट/ड्राफ्ट्समैन","सर्वेयर","इंटीरियर डिज़ाइनर"],"🪵 लकड़ी व फर्नीचर":["कारपेंटर (बढ़ई)","मॉड्यूलर किचन फिटर","वार्डरोब/अलमारी बनाने वाला","दरवाज़ा-खिड़की बढ़ई","फर्नीचर रिपेयर","सोफ़ा/गद्दी रिपेयर","पॉलिश करने वाला","प्लाईवुड/लैमिनेट फिटर","लकड़ी नक्काशी कारीगर","पर्दा/ब्लाइंड्स फिटर"],"🔩 धातु व वेल्डिंग":["वेल्डर","लोहार","ग्रिल/गेट बनाने वाला","शेड/टीन छत मिस्त्री","स्टील/एल्युमिनियम फैब्रिकेटर","ताला-चाबी मिस्त्री","कांच/शीशा फिटर","एल्युमिनियम खिड़की फिटर","सीढ़ी/रेलिंग मिस्त्री","बर्तन कलई वाला"],"🎨 पेंट व सजावट":["पेंटर","वॉल पुट्टी मिस्त्री","वॉलपेपर लगाने वाला","टेक्सचर/डिज़ाइन पेंटर","साइन बोर्ड/पोस्टर पेंटर","रंगोली/सजावट कलाकार","स्टिकर/ग्लास फिल्म फिटर","फ्लोर पॉलिश वाला","पीवीसी पैनल फिटर"],"❄️ एसी व कूलिंग":["एसी/फ्रिज मैकेनिक","एसी इंस्टॉलेशन टेक्नीशियन","कूलर रिपेयर","कोल्ड रूम टेक्नीशियन","वाटर कूलर मैकेनिक"],"🧹 सफाई":["घर की सफाई कर्मचारी","डीप क्लीनिंग टीम","सोफ़ा/कालीन क्लीनर","किचन/चिमनी क्लीनर","बाथरूम क्लीनर","खिड़की/कांच सफाई","पानी की टंकी सफाई","छत/बालकनी सफाई","झाड़ू-पोछा वाली","कपड़े धोने/प्रेस वाला","कचरा उठाने वाला","निर्माण के बाद की सफाई","पुताई के बाद की सफाई","गाड़ी धुलाई वाला"],"🐜 कीट व बागवानी":["पेस्ट कंट्रोल","दीमक नियंत्रण","माली/बगीचा देखभाल","पौधा/नर्सरी सप्लायर","लॉन घास कटाई","ड्रिप सिंचाई फिटर","पेड़ कटाई वाला","गमला/टैरेस गार्डन डिज़ाइनर"],"💇 ब्यूटी व पर्सनल केयर (घर पर)":["ब्यूटीशियन (फेशियल)","हेयर कटिंग/नाई","दुल्हन मेकअप आर्टिस्ट","मेहंदी आर्टिस्ट","मसाज थेरेपिस्ट","मैनीक्योर/पेडीक्योर","थ्रेडिंग/वैक्सिंग","फिजियोथेरेपिस्ट (घर पर)","योग प्रशिक्षक","पर्सनल ट्रेनर","आयुर्वेदिक मालिश","ज्योतिषी/पंडित"],"🏠 घरेलू मदद":["कुक/रसोइया","घरेलू नौकर/मेड","बच्चों की आया","बुज़ुर्ग देखभाल सहायक","घरेलू नर्स","ड्राइवर","गार्ड/चौकीदार","होम ट्यूटर","पूजा/हवन पंडित","टिफ़िन सेवा","खाना बनाने वाली (पार्टी)"],"🚚 शिफ्टिंग व ट्रांसपोर्ट":["पैकर्स एंड मूवर्स","छोटा हाथी/टेम्पो","ट्रैक्टर-ट्रॉली","क्रेन/लिफ्टिंग","सामान उठाने वाला (कुली)","रिक्शा/ई-रिक्शा"],"🚗 वाहन सेवा":["कार मैकेनिक","बाइक मैकेनिक","पंक्चर वाला","कार वॉशिंग","कार इलेक्ट्रिशियन","बैटरी चार्जिंग/बदलाव","रोडसाइड असिस्टेंस","ड्राइविंग सिखाने वाला"],"🧵 सिलाई व कपड़े":["दर्ज़ी (पुरुष)","दर्ज़ी (महिला/बुटीक)","कढ़ाई/एम्ब्रॉयडरी कारीगर","चप्पल/जूता मरम्मत","छाता/बैग मरम्मत","गद्दा/रज़ाई बनाने वाला","पर्दा सिलाई वाला","ड्राई क्लीनिंग सेवा"],"🎉 इवेंट व पार्टी":["टेंट/डेकोरेशन वाला","साउंड/DJ सिस्टम","फोटोग्राफर","वीडियोग्राफर","हलवाई/केटरर","बैंड-बाजा","फूलवाला/माला सजावट","वेटर/सर्विस स्टाफ"],"🔧 अन्य सेवाएँ":["गैस चूल्हा/सिलेंडर मैकेनिक","घड़ी/ताला मरम्मत","साइकिल मरम्मत","सिलबट्टा/चक्की मरम्मत","तराज़ू/नाप-तौल मरम्मत","बिजली मीटर/सोलर सर्वे","स्कैफ़ोल्डिंग/मचान वाला","पुराना सामान खरीदने वाला","नोटरी/दस्तावेज़ सहायक"]},"STATES":[["AP","आंध्र प्रदेश"],["AR","अरुणाचल प्रदेश"],["AS","असम"],["BR","बिहार"],["CG","छत्तीसगढ़"],["GA","गोवा"],["GJ","गुजरात"],["HR","हरियाणा"],["HP","हिमाचल प्रदेश"],["JH","झारखंड"],["KA","कर्नाटक"],["KL","केरल"],["MP","मध्य प्रदेश"],["MH","महाराष्ट्र"],["MN","मणिपुर"],["ML","मेघालय"],["MZ","मिज़ोरम"],["NL","नगालैंड"],["OD","ओडिशा"],["PB","पंजाब"],["RJ","राजस्थान"],["SK","सिक्किम"],["TN","तमिलनाडु"],["TS","तेलंगाना"],["TR","त्रिपुरा"],["UP","उत्तर प्रदेश"],["UK","उत्तराखंड"],["WB","पश्चिम बंगाल"],["AN","अंडमान और निकोबार द्वीप समूह"],["CH","चंडीगढ़"],["DN","दादरा-नगर हवेली व दमन-दीव"],["DL","दिल्ली"],["JK","जम्मू और कश्मीर"],["LA","लद्दाख"],["LD","लक्षद्वीप"],["PY","पुदुचेरी"]],"LOC":{"मध्य प्रदेश":{"सतना":{"मैहर":["मैहर शहर","कोठार","अमरपाटन"],"रघुराजनगर":["रघुराजनगर","नागौद"]},"पन्ना":{"पन्ना":["पन्ना शहर","रानीगंज"]}},"महाराष्ट्र":{"पुणे":{"हवेली":["पुणे शहर","वाघोली"]}},"उत्तर प्रदेश":{"लखनऊ":{"लखनऊ सदर":["लखनऊ शहर","चिनहट"]}}}};

  const $ = id => document.getElementById(id);
  const T = s => (typeof __t === 'function' ? __t(s) : s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const digits10 = s => String(s || '').replace(/\D/g, '').slice(-10);
  // ⚠️ value हमेशा असली (हिंदी) नाम रहता है, दिखने वाला नाम अनुवाद हो सकता है — इसलिए Language बदलने से खोज/Sheet का मिलान कभी नहीं बिगड़ता
  const opt = (v, label) => '<option value="' + esc(v) + '">' + esc(label == null ? T(v) : label) + '</option>';
  const SHOW = DATA.STATES.filter(x => ACTIVE.indexOf(x[0]) > -1);
  const stateName = code => { const f = DATA.STATES.filter(x => x[0] === code)[0]; return f ? f[1] : ''; };
  function say(id, text, kind) { const el = $(id); if (!el) return; el.className = 'rent-msg' + (kind ? ' ' + kind : ''); el.textContent = text || ''; }
  async function api(params) {
    try { return await vcSecurePost(params); }
    catch (e) { return { status: 'error', message: T('इंटरनेट / Server की दिक्कत — थोड़ी देर बाद फिर कोशिश करें।') }; }
  }
  function payBtn(link, amount) {
    if (!link) return '<p class="rent-warn" style="margin-top:10px">' + esc(T('Payment Link अभी नहीं बन पाया — कृपया WhatsApp (9766284669) पर अपनी ID भेजें।')) + '</p>';
    return '<a class="btn btn-primary rent-pay" href="' + esc(link) + '" target="_blank" rel="noopener">💳 ' + esc(T('अभी Pay करें')) + ' ₹' + esc(amount) + '</a>';
  }
  const timers = {};
  function poll(key, fn, doneFn) {                       // हर 6 सेकंड में Payment की Status देखना (अधिकतम ~12 मिनट)
    if (timers[key]) clearInterval(timers[key]);
    let n = 0;
    timers[key] = setInterval(async function () {
      if (++n > 120 || document.hidden) { if (n > 120) clearInterval(timers[key]); return; }
      const r = await fn();
      if (r && doneFn(r)) clearInterval(timers[key]);
    }, 6000);
  }

  /* ---------------- राज्य → ज़िला → तहसील → शहर/गाँव ---------------- */
  const fill = (el, arr, all) => { el.innerHTML = (all ? '<option value="">' + esc(all) + '</option>' : '') + arr.map(x => opt(x)).join(''); };
  function cascade(ids, allLabel, preselect) {
    const st = $(ids[0]), di = $(ids[1]), te = $(ids[2]), pl = $(ids[3]); let D = {};
    st.innerHTML = '<option value="">' + esc(allLabel === 'all' ? T('सभी राज्य') : T('चुनें')) + '</option>' + SHOW.map(x => opt(x[0], T(x[1]))).join('');
    const lbl = k => allLabel === 'all' ? T(k) : T('चुनें');
    async function load() {
      D = {}; const c = st.value; if (!c) return;
      try { const r = await fetch('data/' + c + '.json'); if (!r.ok) throw 0; D = await r.json(); }
      catch (e) { D = DATA.LOC[stateName(c)] || {}; try { const w = document.getElementById('ekvLocWarn'); if (!w) { const n = document.createElement('div'); n.id = 'ekvLocWarn'; n.style.cssText = 'margin:8px 0;padding:9px 12px;border-radius:10px;background:#fdecea;color:#a12a1f;font-size:13.5px;font-weight:700'; n.textContent = T('⚠️ पूरे ज़िले/तहसील/गाँव की सूची (data/MP.json) लोड नहीं हुई, इसलिए सिर्फ़ छोटी नमूना सूची दिख रही है। Admin: GitHub पर "data" फ़ोल्डर में MP.json जाँचें।'); st.parentNode.insertBefore(n, st); } } catch (e2) {} }                    // LGD की फ़ाइल न मिले तो नमूना सूची + चेतावनी
    }
    function redraw() {
      const d = di.value, t = te.value;
      fill(di, Object.keys(D), lbl('सभी ज़िले')); di.value = D[d] ? d : '';
      const TT = D[di.value] || {};
      fill(te, Object.keys(TT), lbl('सभी तहसील')); te.value = TT[t] ? t : '';
      fill(pl, TT[te.value] || [], lbl('सभी शहर/गाँव'));
    }
    st.onchange = async () => { di.value = ''; te.value = ''; await load(); redraw(); };
    di.onchange = () => { te.value = ''; redraw(); };
    te.onchange = redraw;
    redraw();
    if (SHOW.length === 1) { st.value = SHOW[0][0]; load().then(redraw); }
  }
  const catGroups = (first) => (first ? '<option value="">' + esc(first) + '</option>' : '') + Object.keys(DATA.CATS).map(g => '<optgroup label="' + esc(T(g)) + '">' + DATA.CATS[g].map(x => opt(x)).join('') + '</optgroup>').join('');

  /* =================== कारीगर रजिस्ट्रेशन =================== */
  cascade(['kSt', 'kDi', 'kTe', 'kPl'], 'pick');
  const otherOpt = '<option value="__other__">' + esc(T('अन्य (Other) — खुद लिखें')) + '</option>';
  $('kSv').innerHTML = catGroups(T('चुनें')) + otherOpt;
  $('kSv2').innerHTML = catGroups(T('कोई नहीं')) + otherOpt;
  [['kSv', 'kSvOther', 'मुख्य काम का नाम लिखें'], ['kSv2', 'kSv2Other', 'दूसरे काम का नाम लिखें']].forEach(function (a) {   // Other चुनने पर लिखने का Box
    const sel = $(a[0]), inp = document.createElement('input');
    inp.type = 'text'; inp.id = a[1]; inp.maxLength = 80; inp.placeholder = T(a[2]); inp.style.cssText = 'display:none;margin-top:8px;width:100%;padding:11px 12px;border-radius:10px;border:1px solid var(--line);';
    sel.parentNode.appendChild(inp); sel.addEventListener('change', function () { inp.style.display = sel.value === '__other__' ? '' : 'none'; if (sel.value !== '__other__') inp.value = ''; });
  });

  async function enc(file) {                             // फोटो छोटी करके (1000px, JPEG) भेजते हैं; PDF 2 MB तक
    if (file.type === 'application/pdf') {
      if (file.size > 2e6) throw new Error(T('PDF 2 MB से छोटी होनी चाहिए:') + ' ' + file.name);
      const u = await new Promise(r => { const x = new FileReader(); x.onload = () => r(x.result); x.readAsDataURL(file); });
      return { name: file.name, mime: file.type, data: u.split(',')[1] };
    }
    if (!file.type.startsWith('image/')) throw new Error(T('सिर्फ़ फोटो या PDF चुनें:') + ' ' + file.name);
    const b = await createImageBitmap(file), k = Math.min(1, 1000 / Math.max(b.width, b.height)), c = document.createElement('canvas');
    c.width = b.width * k; c.height = b.height * k; c.getContext('2d').drawImage(b, 0, 0, c.width, c.height);
    return { name: file.name.replace(/\.\w+$/, '') + '.jpg', mime: 'image/jpeg', data: c.toDataURL('image/jpeg', .72).split(',')[1] };
  }
  function doneBox(r, mob) {
    $('kDoneId').textContent = r.karigarId; $('kDone').style.display = 'block'; $('kForm').style.display = 'none';
    $('kDonePay').innerHTML = payBtn(r.payLink, r.amount);
    $('kDoneTxt').textContent = T('⏰ आप 1 घंटे में Payment नहीं करते हैं तो आपकी Entry छुपा (Hide) दी जाएगी। Payment के बाद हमारी टीम आपके दस्तावेज़ जाँचेगी और फिर आपकी प्रोफ़ाइल खोज में दिखने लगेगी।');
    poll('karigar', () => api({ action: 'hsmylisting', karigarId: r.karigarId, mobile: mob }), function (s) {
      if (s.status === 'ok' && s.paid && s.active) {
        $('kDonePay').innerHTML = '<div style="font-weight:800;color:#11766F;font-size:17px">✅ ' + esc(T('Payment मिल गई!')) + '</div>';
        $('kDoneTxt').textContent = T('दस्तावेज़ों की जाँच के बाद आपकी प्रोफ़ाइल 1 साल तक खोज में दिखेगी। Registration इस तारीख़ तक: ') + s.validTill;
        return true;
      }
      return false;
    });
    $('kDone').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  $('kForm').onsubmit = async e => {
    e.preventDefault();
    const f = e.target, er = $('kErr'); er.textContent = '';
    if (!f.checkValidity()) { f.reportValidity(); return; }
    const age = (Date.now() - new Date(f.dob.value)) / 31557600000;
    if (age < 18) { er.textContent = T('रजिस्ट्रेशन के लिए उम्र कम से कम 18 साल होनी चाहिए।'); return; }
    if (f.mobile.value === f.r1m.value || f.mobile.value === f.r2m.value || f.r1m.value === f.r2m.value) { er.textContent = T('मोबाइल और दोनों रेफरेंस के नंबर अलग-अलग होने चाहिए।'); return; }
    const btn = $('kBtn'); btn.disabled = true; btn.textContent = T('भेज रहे हैं…');
    const reset = () => { btn.disabled = false; btn.textContent = T('💳 रजिस्ट्रेशन भेजें और ₹49 Pay करें'); };
    const obj = {};
    for (const [k, v] of new FormData(f).entries()) { if (!(v instanceof File)) obj[k] = v; }
    obj.rajya = stateName($('kSt').value); obj.terms = '1'; delete obj.rajya_code;
    if (obj.kaam1 === '__other__') { obj.kaam1 = ($('kSvOther').value || '').trim(); if (obj.kaam1.length < 2) { er.textContent = T('मुख्य काम (Other) का नाम लिखें।'); reset(); return; } }
    if (obj.kaam2 === '__other__') obj.kaam2 = ($('kSv2Other').value || '').trim();
    obj.staff = (window.ekvStaffRef && window.ekvStaffRef()) || '';
    const files = [];
    try { for (const n of ['photo', 'idproof', 'pcc', 'work']) for (const file of f[n].files) files.push(Object.assign({ field: n }, await enc(file))); }
    catch (x) { er.textContent = x.message; reset(); return; }
    obj.files = JSON.stringify(files); obj.action = 'hsregister';
    const r = await api(obj);
    if (!r || r.status !== 'ok') { er.textContent = (r && r.message) || T('भेजने में दिक्कत हुई। इंटरनेट देखकर दोबारा कोशिश करें।'); reset(); return; }
    doneBox(r, digits10(f.mobile.value)); window.scrollTo({ top: $('karigar').offsetTop - 80, behavior: 'smooth' });
  };

  /* ---------- 🔍 कारीगर की ID जाँचना (ग्राहक) ---------- */
  window.hsCheck = async function () {
    const v = id => $(id).value.trim(), kid = v('cId').toUpperCase(), nm = v('cName'), mob = digits10(v('cMob'));
    if (!kid || nm.length < 3) return say('cMsg', T('कारीगर की ID और उसका नाम (कम से कम 3 अक्षर) डालें।'), 'err');
    if (mob.length !== 10) return say('cMsg', T('अपना 10 अंकों का Mobile Number डालें।'), 'err');
    say('cMsg', T('⏳ जाँचा जा रहा है...'), ''); $('cOut').innerHTML = '';
    const r = await api({ action: 'hscheck', karigarId: kid, name: nm, mobile: mob, checkerName: v('cMe') });
    if (!r || r.status !== 'ok') { say('cMsg', '', ''); $('cOut').innerHTML = '<div style="padding:14px;border-radius:12px;background:#fdecea;color:#a12a1f;font-weight:700;line-height:1.6">❌ ' + esc((r && r.message) || T('जाँच नहीं हो पाई।')) + '</div>'; return; }
    say('cMsg', '', '');
    const c = r.checks || {}, tick = (ok, t) => '<div>' + (ok ? '✅' : '➖') + ' ' + esc(T(t)) + '</div>';
    $('cOut').innerHTML = '<div style="border:2px solid #1b7f3b;border-radius:14px;padding:14px;background:#f1fbf4"><div style="font-weight:800;color:#1b7f3b;font-size:16px;margin-bottom:10px">✅ ' + esc(T('यह EkVeera का मंज़ूर कारीगर है')) + ' — ' + esc(r.karigarId) + '</div>' +
      '<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">' +
      (r.photo ? '<img src="' + esc(r.photo) + '" alt="' + esc(T('कारीगर की फोटो')) + '" style="width:130px;height:160px;object-fit:cover;border-radius:10px;border:1px solid #cfd6e0">' : '<div style="width:130px;height:160px;border-radius:10px;border:1px dashed #cfd6e0;display:flex;align-items:center;justify-content:center;text-align:center;font-size:12px;color:#a12a1f;padding:6px">' + esc(T('फोटो नहीं दिख रही — सामने वाले की पहचान सावधानी से करें')) + '</div>') +
      '<div style="flex:1;min-width:200px;line-height:1.7"><div style="font-size:18px;font-weight:800">' + esc(r.name) + '</div><div>📍 ' + esc(r.location) + '</div><div>🛠️ ' + esc(r.work1) + (r.work2 ? ', ' + esc(r.work2) : '') + '</div>' + (r.experience ? '<div>' + esc(T('अनुभव:')) + ' ' + esc(r.experience) + '</div>' : '') +
      '<div style="margin-top:6px"><b>' + esc(T('Verification स्तर:')) + ' ' + esc(r.level) + '</b></div>' + tick(c.phone, 'मोबाइल नंबर जाँचा गया') + tick(c.aadhaar, 'पहचान पत्र (Aadhaar) जाँचा गया') + tick(c.pcc, 'पुलिस जाँच (PCC) जाँची गई' + (r.pccDate ? ' — ' + r.pccDate : '')) + tick(c.reference, 'स्थानीय रेफरेंस जाँचे गए') + '</div></div>' +
      '<div style="margin-top:12px;padding:10px;border-radius:10px;background:#fff;border:1px solid #cfe8d7;font-size:13.5px;line-height:1.6"><b>' + esc(T('अब ज़रूर देखें:')) + '</b> ' + esc(T('सामने खड़े व्यक्ति का चेहरा इस फोटो से मिलता है? नाम और ID वही है? मिलता है तभी घर में आने दें। ज़रा भी शक हो तो रोकें और EkVeera Office (9766284669) को बताएँ।')) + '</div></div>';
    $('cOut').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  window.hsMyListing = async function () {
    const kid = $('mKid').value.trim().toUpperCase(), mob = digits10($('mMob').value);
    if (!kid || mob.length !== 10) return say('mMsg', T('Karigar ID और 10 अंकों का Mobile डालें।'), 'err');
    say('mMsg', T('⏳ देखा जा रहा है...'), '');
    const r = await api({ action: 'hsmylisting', karigarId: kid, mobile: mob });
    if (!r || r.status !== 'ok') { $('mOut').innerHTML = ''; return say('mMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err'); }
    say('mMsg', '', '');
    const pay = r.paid ? (r.active ? '✅ ' + esc(T('Payment हो चुकी — इस तारीख़ तक: ')) + esc(r.validTill) : '⌛ ' + esc(T('1 साल पूरा हो चुका — नीचे Renew करें (वही ID)'))) : '⏳ ' + esc(T('Payment बाकी — प्रोफ़ाइल अभी छुपी है'));
    const ap = r.rejected ? '❌ ' + esc(T('मंज़ूर नहीं हुई — हमारी टीम से WhatsApp पर संपर्क करें')) : (r.approved ? '✅ ' + esc(T('दस्तावेज़ मंज़ूर')) : '🔎 ' + esc(T('दस्तावेज़ों की जाँच जारी है')));
    $('mOut').innerHTML = '<div class="rent-detail"><h3>' + esc(r.karigarId) + ' — ' + esc(r.name) + '</h3><table><tr><td>' + esc(T('Payment')) + '</td><td>' + pay + '</td></tr><tr><td>' + esc(T('जाँच')) + '</td><td>' + ap + '</td></tr><tr><td>' + esc(T('खोज में'))
      + '</td><td>' + (r.live ? '🟢 ' + esc(T('दिख रही है')) : '⚪ ' + esc(T('अभी नहीं दिख रही'))) + '</td></tr></table>' + (!r.paid ? payBtn(r.payLink, r.amount) : '') +
      (r.live || (r.active && r.approved) ? '<div style="margin-top:12px;padding:10px;border-radius:10px;background:' + (r.availability === 'Closed' ? '#fdecea' : '#e8f6ec') + '"><b>' + (r.availability === 'Closed' ? '🔒 ' + esc(T(/^auto/i.test(r.closedBy || '') ? 'Close — ग्राहक का Order पक्का होने पर आप अपने-आप Close हो गए हैं। काम से फ़्री होते ही नीचे Open दबाएँ, वरना नया Order नहीं आएगा।' : 'Close — आप अभी किसी के काम पर हैं, खोज में चुने नहीं जा सकते')) : '🟢 ' + esc(T('Open — ग्राहक आपको चुन सकते हैं'))) + '</b><br>' +
        '<button type="button" class="btn ' + (r.availability === 'Closed' ? 'btn-primary' : '') + '" style="margin-top:8px" data-kst="' + (r.availability === 'Closed' ? 'open' : 'close') + '">' + esc(T(r.availability === 'Closed' ? 'Open करें (मैं फ्री हूँ)' : 'Close करें (काम पर हूँ)')) + '</button></div>' : '') + '</div>';
    if (r.paid && r.renewable) {
      const rd = $('mOut').querySelector('.rent-detail');
      if (rd) rd.insertAdjacentHTML('beforeend', '<div style="margin-top:12px;padding:12px;border-radius:10px;background:#FFF8E5;border:1px solid #f0d58a"><b>🔁 ' + esc(T('Registration Renew करें')) + '</b><p style="margin:6px 0 8px;font-size:14px">' + esc(T('वही Karigar ID एक साल और चालू — Renew फ़ीस: ₹')) + esc(r.renewAmount) + '</p><button type="button" class="btn btn-primary" id="hsRenewBtn">' + esc(T('Renew का Payment Link बनाएँ')) + '</button><div id="hsRenewOut"></div></div>');
    }
    myK = { kid: r.karigarId, mob: mob };
  };
  let myK = null;
  $('mOut').addEventListener('click', async function (e) {
    const rb = e.target.closest('#hsRenewBtn');
    if (rb && myK) {
      rb.disabled = true; $('hsRenewOut').textContent = T('⏳ देखा जा रहा है...');
      const rr = await api({ action: 'hsrenew', karigarId: myK.kid, mobile: myK.mob });
      rb.disabled = false;
      if (!rr || rr.status !== 'ok') { $('hsRenewOut').innerHTML = '<p class="err">' + esc((rr && rr.message) || T('कुछ गड़बड़ हो गई।')) + '</p>'; return; }
      $('hsRenewOut').innerHTML = payBtn(rr.payLink, rr.amount) + '<p class="rent-note" style="margin-top:8px">' + esc(T('Payment होते ही वही ID एक साल और चालू हो जाएगी; बचे दिन जुड़ जाएँगे।')) + '</p>';
      return;
    }
    const b = e.target.closest('[data-kst]'); if (!b || !myK) return;
    const to = b.getAttribute('data-kst');
    if (!confirm(T(to === 'open' ? 'काम पूरा हो गया? Open करने पर आप फिर से खोज में चुने जा सकेंगे।' : 'Close करने पर ग्राहक आपको चुन नहीं पाएँगे। ठीक है?'))) return;
    b.disabled = true;
    const r = await api({ action: 'hssetstatus', karigarId: myK.kid, mobile: myK.mob, status: to });
    if (!r || r.status !== 'ok') { b.disabled = false; return say('mMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err'); }
    window.hsMyListing();
  });

  /* =================== ग्राहक (Customer) खोज =================== */
  cascade(['sSt', 'sDi', 'sTe', 'sPl'], 'all');
  $('sSv').innerHTML = catGroups('');
  $('sSv').value = 'इलेक्ट्रिशियन';
  const S = { sv: '', shown: 0, next: 0, busy: false };
  const cardHtml = x => '<div class="rent-card"><b>' + esc(x.karigarId) + '</b><div class="loc">📍 ' + esc(x.location) + '</div><div class="loc" style="margin-top:-6px">🛠️ ' + esc(T(S.sv)) + '</div>' +
    (x.closed
      ? '<div style="margin:0 0 8px;padding:8px 10px;border-radius:8px;background:#fdecea;color:#a12a1f;font-weight:700;font-size:13.5px">🔒 ' + esc(T('Close — अभी किसी के काम पर है')) + '</div><button type="button" class="btn" disabled style="opacity:.5;cursor:not-allowed">' + esc(T('अभी उपलब्ध नहीं')) + '</button></div>'
      : '<button type="button" class="btn btn-primary" data-pick="' + esc(x.karigarId) + '">' + esc(T('यह कारीगर चाहिए')) + '</button></div>');
  async function runSearch(offset) {
    if (S.busy) return; S.busy = true;
    const first = offset === 0;
    if (first) { S.sv = $('sSv').value; S.shown = 0; $('sOut').innerHTML = ''; $('sMoreBox').innerHTML = ''; }
    if (!S.sv) { S.busy = false; return say('sMsg', T('ज़रूरत का काम चुनें।'), 'err'); }
    say('sMsg', T('⏳ खोजा जा रहा है...'), '');
    const st = $('sSt').value;
    const r = await api({ action: 'hssearch', kaam: S.sv, rajya: st ? stateName(st) : '', jila: $('sDi').value, tehsil: $('sTe').value, gaon: $('sPl').value, verified: $('sVo').checked ? '1' : '', offset: offset });
    S.busy = false;
    if (!r || r.status !== 'ok') { if (first) $('sOut').innerHTML = ''; return say('sMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err'); }
    if (first && !(r.results || []).length) return say('sMsg', T('इस चुनाव में अभी कोई कारीगर रजिस्टर नहीं है। दूसरा इलाका या "सभी" चुनकर देखें।'), 'err');
    S.shown += r.results.length; S.next = r.nextOffset || (offset + 10);
    $('sOut').insertAdjacentHTML('beforeend', r.results.map(cardHtml).join(''));
    say('sMsg', S.shown + ' ' + T('कारीगर दिख रहे हैं। नाम, मोबाइल और बाक़ी जानकारी ₹29 की Payment के बाद दिखेगी।'), 'ok');
    let more = '';
    if (r.hasMore) more = '<button type="button" class="btn btn-primary" onclick="hsMore()">' + esc(T('⬇ और देखें')) + '</button>';
    else if (r.capped) more = '<p class="rent-note">' + esc(T('इससे ज़्यादा कारीगर हैं — ज़िला / तहसील / गाँव चुनकर खोज और सटीक करें।')) + '</p>';
    $('sMoreBox').innerHTML = more;
  }
  window.hsSearch = () => runSearch(0);
  window.hsMore = () => runSearch(S.next);
  $('sOut').addEventListener('click', function (e) { const b = e.target.closest('[data-pick]'); if (b) hsPick(b.getAttribute('data-pick')); });

  let picked = '', lastOrder = null;
  window.hsPick = function (kid) {
    picked = kid; $('oTitle').textContent = T('कारीगर ID: ') + kid + ' — ' + T('₹29 का Order');
    $('oBox').style.display = 'block'; $('oPay').innerHTML = ''; say('oMsg', '', '');
    $('oBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const LV = { 3: ['🥇 ' + 'गोल्ड – पूरी जाँच', 'y'], 2: ['🥈 ' + 'सिल्वर', 'y'], 1: ['🥉 ' + 'बेसिक – पुलिस जाँच बाकी', 'n'] };
  function detailHtml(d) {
    const k = d.karigar, wa = 'https://wa.me/91' + esc(k.mobile), lv = LV[k.level] || LV[1];
    let h = '<div class="rent-detail"><h3>✅ ' + esc(T('आपकी Payment मिल गई — कारीगर की जानकारी')) + '</h3><table>' +
      '<tr><td>' + esc(T('कारीगर ID')) + '</td><td>' + esc(k.id) + '</td></tr>' +
      '<tr><td>' + esc(T('नाम')) + '</td><td><b>' + esc(k.name) + '</b></td></tr>' +
      '<tr><td>Mobile</td><td><b><a href="tel:+91' + esc(k.mobile) + '">' + esc(k.mobile) + '</a></b> &nbsp; <a href="' + wa + '" target="_blank" rel="noopener">💬 WhatsApp</a></td></tr>' +
      '<tr><td>Location</td><td>' + esc(k.location) + (k.address ? '<br>' + esc(k.address) : '') + '</td></tr>' +
      '<tr><td>' + esc(T('काम')) + '</td><td>' + esc((k.work || []).map(T).join(', ')) + '</td></tr>' +
      (k.experience ? '<tr><td>' + esc(T('अनुभव')) + '</td><td>' + esc(k.experience) + ' ' + esc(T('साल')) + '</td></tr>' : '') +
      (k.rate ? '<tr><td>' + esc(T('मेहनताना')) + '</td><td>₹' + esc(k.rate) + '</td></tr>' : '') +
      '<tr><td>' + esc(T('जाँच का स्तर')) + '</td><td><span class="hs-b ' + lv[1] + '">' + esc(T(lv[0])) + '</span>' + (k.rating ? ' &nbsp; ⭐ ' + esc(k.rating) + ' (' + esc(k.ratingCount) + ')' : '') + '</td></tr></table>' +
      '<p class="rent-warn" style="margin:12px 0 0">⚠️ ' + esc(T('घर में बुलाने / काम शुरू करने से पहले कारीगर का पहचान पत्र ज़रूर देखें।')) + '</p>';
    h += '<div class="hs-after"><b>' + esc(T('काम पूरा होने पर')) + '</b>';
    h += d.rated ? '<p class="meta" style="margin:6px 0">' + esc(T('आप इस काम की रेटिंग दे चुके हैं। धन्यवाद!')) + '</p>' :
      '<div class="hs-stars" id="hsStars" role="radiogroup"></div><div class="rent-form" style="margin-top:6px"><div class="full"><label>' + esc(T('क्या कारीगर ने अपना पहचान पत्र दिखाया?')) + '</label><select id="hsIdShown"><option value="हाँ">' + esc(T('हाँ')) + '</option><option value="नहीं">' + esc(T('नहीं')) + '</option></select></div>' +
      '<div class="full"><label>' + esc(T('टिप्पणी (सिर्फ़ हमारी टीम देखेगी)')) + '</label><input id="hsCmt" type="text" maxlength="300"></div></div><button type="button" class="btn btn-primary" id="hsRateBtn" style="margin-top:8px">' + esc(T('रेटिंग भेजें')) + '</button>';
    h += '<div style="margin-top:10px"><button type="button" class="hs-link" id="hsCpBtn">🚩 ' + esc(T('शिकायत करें')) + '</button></div><div id="hsCpBox" style="display:none;margin-top:8px"><input id="hsCpTxt" class="rent-in" type="text" maxlength="300" placeholder="' + esc(T('शिकायत क्या है?')) + '"><button type="button" class="btn btn-primary" id="hsCpSend" style="margin-top:8px">' + esc(T('शिकायत भेजें')) + '</button></div>';
    h += '<p id="hsAfMsg" class="rent-msg" role="status"></p></div></div>';
    return h;
  }
  function bindAfter(root) {
    let star = 0; const box = root.querySelector('#hsStars');
    if (box) {
      for (let i = 1; i <= 5; i++) { const b = document.createElement('button'); b.type = 'button'; b.textContent = '★'; b.setAttribute('aria-label', i + ' ' + T('स्टार'));
        b.onclick = () => { star = i; Array.prototype.forEach.call(box.children, (x, j) => x.classList.toggle('on', j < i)); }; box.appendChild(b); }
      root.querySelector('#hsRateBtn').onclick = async function () {
        if (!star) return say('hsAfMsg', T('पहले स्टार चुनें।'), 'err');
        this.disabled = true;
        const r = await api({ action: 'hsrate', orderId: lastOrder.oid, mobile: lastOrder.mob, stars: star, idshown: root.querySelector('#hsIdShown').value, comment: root.querySelector('#hsCmt').value });
        if (r && r.status === 'ok') { say('hsAfMsg', T('धन्यवाद! आपकी रेटिंग दर्ज हो गई।'), 'ok'); box.remove(); this.remove(); }
        else { say('hsAfMsg', (r && r.message) || T('रेटिंग दर्ज नहीं हो सकी।'), 'err'); this.disabled = false; }
      };
    }
    const cb = root.querySelector('#hsCpBtn'); if (cb) cb.onclick = () => { root.querySelector('#hsCpBox').style.display = 'block'; };
    const cs = root.querySelector('#hsCpSend');
    if (cs) cs.onclick = async function () {
      const t = root.querySelector('#hsCpTxt').value.trim(); if (t.length < 3) return say('hsAfMsg', T('शिकायत लिखें।'), 'err');
      this.disabled = true; const r = await api({ action: 'hscomplain', orderId: lastOrder.oid, mobile: lastOrder.mob, detail: t });
      this.disabled = false; say('hsAfMsg', r && r.status === 'ok' ? T('शिकायत दर्ज हो गई — हमारी टीम जाँच करेगी।') : ((r && r.message) || T('कुछ गड़बड़ हो गई।')), r && r.status === 'ok' ? 'ok' : 'err');
    };
  }
  function showDetail(target, d) { target.innerHTML = detailHtml(d); bindAfter(target); }

  window.hsOrder = async function () {
    const name = $('oName').value.trim(), mob = digits10($('oMobile').value), email = $('oEmail').value.trim();
    if (!picked) return say('oMsg', T('पहले कारीगर चुनें।'), 'err');
    if (name.length < 2) return say('oMsg', T('अपना पूरा नाम लिखें।'), 'err');
    if (mob.length !== 10) return say('oMsg', T('10 अंकों का सही Mobile Number लिखें।'), 'err');
    if (!$('oTerms').checked) return say('oMsg', T('शर्त पर ✔ लगाना ज़रूरी है।'), 'err');
    $('oBtn').disabled = true; say('oMsg', T('⏳ Order बन रहा है...'), '');
    const r = await api({ action: 'hsorder', karigarId: picked, name: name, mobile: mob, email: email, terms: '1' });
    $('oBtn').disabled = false;
    if (!r || r.status !== 'ok') return say('oMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err');
    say('oMsg', '', '');
    $('oPay').innerHTML = '<div class="rent-done" style="display:block"><div><span class="rent-id">' + esc(r.orderId) + '</span></div><p style="margin:8px 0">' + esc(T('यह Order ID संभालकर रखें। Payment के बाद Details यहीं अपने-आप दिख जाएँगी।')) + '</p>' + payBtn(r.payLink, r.amount) + '</div>';
    poll('order', () => api({ action: 'hsgetorder', orderId: r.orderId, mobile: mob }), function (s) {
      if (s.status === 'ok' && s.paid) { lastOrder = { oid: r.orderId, mob: mob }; $('oPay').innerHTML = ''; $('oBox').style.display = 'none'; showDetail($('oDetail'), s); $('oDetail').scrollIntoView({ behavior: 'smooth', block: 'center' }); return true; }
      return false;
    });
  };
  window.hsGetOrder = async function () {
    const oid = $('qOid').value.trim().toUpperCase(), mob = digits10($('qMob').value);
    if (!oid || mob.length !== 10) return say('qMsg', T('Order ID और 10 अंकों का Mobile डालें।'), 'err');
    say('qMsg', T('⏳ देखा जा रहा है...'), '');
    const r = await api({ action: 'hsgetorder', orderId: oid, mobile: mob });
    if (!r || r.status !== 'ok') { $('qOut').innerHTML = ''; return say('qMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err'); }
    say('qMsg', '', '');
    if (r.paid) { lastOrder = { oid: oid, mob: mob }; showDetail($('qOut'), r); }
    else $('qOut').innerHTML = '<div class="rent-detail" style="border-color:#f0d9a0"><h3 style="color:#8a5a00">⏳ ' + esc(T('Payment बाकी है')) + '</h3>' + payBtn(r.payLink, r.amount) + '</div>';
  };
  const fb = new URLSearchParams(location.search).get('fb');                  // पुराना "रेटिंग लिंक" (?fb=HSO001) — Order देखने के खाने में ID भर दो
  if (fb && $('qOid')) { $('qOid').value = fb.toUpperCase(); setTimeout(() => { const q = $('myOrder'); if (q) q.scrollIntoView(); }, 300); }

  /* ---------- Page की ginti: कारीगर / ग्राहक ---------- */
  (async function () {
    const KEY = 'ekv_hs_stats_v1', nz = v => (v == null || v === '' || isNaN(Number(v))) ? 0 : v, paint = d => { $('hsStK').textContent = nz(d.karigar); $('hsStC').textContent = nz(d.customers); };
    try { const c = localStorage.getItem(KEY); if (c) paint(JSON.parse(c)); } catch (e) {}
    const d = await api({ action: 'hspubstats' });
    if (d && d.status === 'ok') { paint(d); try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  })();
})();
