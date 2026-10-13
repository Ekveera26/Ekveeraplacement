/* EkVeera Home Service — कारीगर रजिस्ट्रेशन फ़ॉर्म
 * सारा हिसाब Home Service वाले अलग Apps Script (6_home_service/Code.gs) में है — EkVeera के बाक़ी Logic से इसका कोई लेना-देना नहीं। */
(function () {
  'use strict';
  const CFG = window.HS_CONFIG || {}, DATA = window.HS_DATA || {}, ENDPOINT = CFG.ENDPOINT || '';
  const ACTIVE = CFG.ACTIVE || ['MP'];
  const $ = id => document.getElementById(id);
  const T = s => (typeof __t === 'function' ? __t(s) : s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const opt = (v, label) => '<option value="' + esc(v) + '">' + esc(label == null ? T(v) : label) + '</option>';
  const SHOW = (DATA.STATES || []).filter(x => ACTIVE.indexOf(x[0]) > -1);
  const stateName = code => { const f = (DATA.STATES || []).filter(x => x[0] === code)[0]; return f ? f[1] : ''; };
  let D = {};
  const fill = (el, arr, all) => { el.innerHTML = (all ? '<option value="">' + esc(all) + '</option>' : '') + arr.map(x => opt(x)).join(''); };
  const grp = () => Object.keys(DATA.CATS || {}).map(g => '<optgroup label="' + esc(T(g)) + '">' + DATA.CATS[g].map(x => opt(x)).join('') + '</optgroup>').join('');

  $('hsSt').innerHTML = '<option value="">' + esc(T('चुनें')) + '</option>' + SHOW.map(x => opt(x[0], T(x[1]))).join('');
  $('hsSv').innerHTML = '<option value="">' + esc(T('चुनें')) + '</option>' + grp();
  $('hsSv2').innerHTML = '<option value="">' + esc(T('कोई नहीं')) + '</option>' + grp();

  async function loadState() {
    const c = $('hsSt').value; D = {};
    if (!c) return;
    try { const r = await fetch('data/' + c + '.json'); if (!r.ok) throw 0; D = await r.json(); }
    catch (e) { D = (DATA.LOC || {})[stateName(c)] || {}; }
  }
  function cascade() {
    const d = $('hsDi').value, t = $('hsTe').value;
    fill($('hsDi'), Object.keys(D), T('चुनें')); $('hsDi').value = D[d] ? d : '';
    const TT = D[$('hsDi').value] || {};
    fill($('hsTe'), Object.keys(TT), T('चुनें')); $('hsTe').value = TT[t] ? t : '';
    fill($('hsPl'), TT[$('hsTe').value] || [], T('चुनें'));
  }
  $('hsSt').onchange = async () => { await loadState(); $('hsDi').value = ''; $('hsTe').value = ''; cascade(); };
  $('hsDi').onchange = () => { $('hsTe').value = ''; cascade(); };
  $('hsTe').onchange = cascade;
  cascade();
  if (SHOW.length === 1) { $('hsSt').value = SHOW[0][0]; loadState().then(cascade); }

  // फोटो छोटी करके (1000px, JPEG) भेजते हैं; PDF 2 MB तक
  async function enc(file) {
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

  const reset = btn => { btn.disabled = false; btn.textContent = T('रजिस्ट्रेशन भेजें'); };
  $('hsForm').onsubmit = async e => {
    e.preventDefault();
    const f = e.target, er = $('hsErr'); er.textContent = '';
    if (!f.checkValidity()) { f.reportValidity(); return; }
    const age = (Date.now() - new Date(f.dob.value)) / 31557600000;
    if (age < 18) { er.textContent = T('रजिस्ट्रेशन के लिए उम्र कम से कम 18 साल होनी चाहिए।'); return; }
    if (f.mobile.value === f.r1m.value || f.mobile.value === f.r2m.value || f.r1m.value === f.r2m.value) { er.textContent = T('मोबाइल और दोनों रेफरेंस के नंबर अलग-अलग होने चाहिए।'); return; }
    const btn = f.querySelector('button.go'); btn.disabled = true; btn.textContent = T('भेज रहे हैं…');
    const fd = new FormData(f), obj = {};
    for (const [k, v] of fd.entries()) { if (!(v instanceof File)) obj[k] = v; }
    obj.rajya = stateName($('hsSt').value);          // ✅ सुधार: पहले यहाँ "MP" (कोड) सेव होता था, जबकि खोज नाम से ढूँढती है — अब हमेशा हिंदी नाम
    obj.time = new Date().toISOString(); obj.files = [];
    try { for (const n of ['photo', 'idproof', 'pcc', 'work']) for (const file of f[n].files) obj.files.push(Object.assign({ field: n }, await enc(file))); }
    catch (x) { er.textContent = x.message; reset(btn); return; }
    let id = '';
    if (ENDPOINT) {
      try {
        const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(obj) });
        const j = await res.json();
        if (!j || !j.ok) { er.textContent = (j && j.msg) || T('भेजने में दिक्कत हुई। इंटरनेट देखकर दोबारा कोशिश करें।'); reset(btn); return; }
        id = j.id || '';
      } catch (x) {
        er.textContent = T('जवाब नहीं मिल सका। दोबारा भेजने से पहले थोड़ा रुकें — हो सकता है रजिस्ट्रेशन हो चुका हो (दोबारा भेजने पर "पहले से रजिस्टर" आए तो समझें हो गया)।');
        reset(btn); return;
      }
    }
    f.style.display = 'none'; const o = $('hsOk'); o.style.display = 'block';
    o.textContent = T('धन्यवाद') + ' ' + fd.get('naam') + '! ' + T('आपका रजिस्ट्रेशन मिल गया है। मोबाइल OTP और दस्तावेज़ों की जाँच के बाद आपकी प्रोफ़ाइल लाइव होगी। हम आपको WhatsApp पर बताएँगे.') +
      (id ? ' ' + T('आपकी रजिस्ट्रेशन ID:') + ' ' + id : '') + (ENDPOINT ? '' : ' ' + T('(डेमो: अभी डेटा कहीं सेव नहीं हुआ)'));
    window.scrollTo(0, 0);
  };
  if (!ENDPOINT) $('hsDemo').style.display = 'block';
})();
