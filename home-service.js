/* EkVeera Home Service — ग्राहक का खोज पेज (पहले राज्य/ज़िला/तहसील/गाँव, फिर काम चुनकर कारीगर खोजें)
 * सारा हिसाब Home Service वाले अलग Apps Script (6_home_service/Code.gs) में है — EkVeera के बाक़ी Logic से इसका कोई लेना-देना नहीं। */
(function () {
  'use strict';
  const CFG = window.HS_CONFIG || {}, DATA = window.HS_DATA || {}, ENDPOINT = CFG.ENDPOINT || '';
  const ACTIVE = CFG.ACTIVE || ['MP'];
  const $ = id => document.getElementById(id);
  const T = s => (typeof __t === 'function' ? __t(s) : s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // ⚠️ value हमेशा असली (हिंदी) नाम रहता है, दिखने वाला नाम अनुवाद हो सकता है — इसलिए Language बदलने से खोज/Sheet का मिलान कभी नहीं बिगड़ता
  const opt = (v, label) => '<option value="' + esc(v) + '">' + esc(label == null ? T(v) : label) + '</option>';
  const SHOW = (DATA.STATES || []).filter(x => ACTIVE.indexOf(x[0]) > -1);
  const stateName = code => { const f = (DATA.STATES || []).filter(x => x[0] === code)[0]; return f ? f[1] : ''; };
  let D = {}, seq = 0;

  const fill = (el, arr, all) => { el.innerHTML = (all ? '<option value="">' + esc(all) + '</option>' : '') + arr.map(x => opt(x)).join(''); };

  $('hsSt').innerHTML = '<option value="">' + esc(T('सभी राज्य')) + '</option>' + SHOW.map(x => opt(x[0], T(x[1]))).join('');
  $('hsSv').innerHTML = Object.keys(DATA.CATS || {}).map(g => '<optgroup label="' + esc(T(g)) + '">' + DATA.CATS[g].map(x => opt(x)).join('') + '</optgroup>').join('');
  $('hsSv').value = 'इलेक्ट्रिशियन';

  async function loadState() {
    const c = $('hsSt').value; D = {};
    if (!c) return;
    try { const r = await fetch('data/' + c + '.json'); if (!r.ok) throw 0; D = await r.json(); }
    catch (e) { D = (DATA.LOC || {})[stateName(c)] || {}; }                    // LGD की फ़ाइल न मिले तो नमूना सूची
  }
  function cascade() {
    const d = $('hsDi').value, t = $('hsTe').value;
    fill($('hsDi'), Object.keys(D), T('सभी ज़िले')); $('hsDi').value = D[d] ? d : '';
    const TT = D[$('hsDi').value] || {};
    fill($('hsTe'), Object.keys(TT), T('सभी तहसील')); $('hsTe').value = TT[t] ? t : '';
    fill($('hsPl'), TT[$('hsTe').value] || [], T('सभी शहर/गाँव'));
  }
  $('hsSt').onchange = async () => { $('hsDi').value = ''; $('hsTe').value = ''; await loadState(); cascade(); };
  $('hsDi').onchange = () => { $('hsTe').value = ''; cascade(); };
  $('hsTe').onchange = cascade;
  cascade();
  if (SHOW.length === 1) { $('hsSt').value = SHOW[0][0]; loadState().then(cascade); }

  const OLD = DATA.OLD || [];
  function lvl(v) {
    const k = v[0] + v[1] + v[2] + v[3];
    return k === 4 ? [T('🥇 गोल्ड – पूरी जाँच'), 'y'] : (v[1] && v[2]) ? [T('🥈 सिल्वर'), 'y'] : [T('🥉 बेसिक – पुलिस जाँच बाकी'), 'n'];
  }
  const num = x => { const n = Number(x); return isFinite(n) ? n : 0; };

  async function render() {
    const s = $('hsSt').value, d = $('hsDi').value, t = $('hsTe').value, p = $('hsPl').value, sv = $('hsSv').value;
    const me = ++seq; let r;
    if (ENDPOINT) {
      $('hsCnt').textContent = T('खोज रहे हैं…');
      try {
        const q = new URLSearchParams({ kaam: sv, rajya: s ? stateName(s) : '', jila: d, tehsil: t, gaon: p });
        r = await (await fetch(ENDPOINT + '?' + q)).json(); if (!Array.isArray(r)) throw 0;
      } catch (e) { $('hsCnt').textContent = T('डेटा नहीं आ सका। इंटरनेट देखकर दोबारा खोजें।'); return; }
      if (me !== seq) return;
      r = r.filter(w => !$('hsVo').checked || (w.v && w.v[2]));
    } else {
      r = (DATA.DEMO || []).filter(w => OLD[w.s] === sv && (!s || w.st === stateName(s)) && (!d || w.d === d) && (!t || w.t === t) && (!p || w.p === p) && (!$('hsVo').checked || w.v[2]));
    }
    r.sort((a, b) => ((b.v && b.v[2] || 0) - (a.v && a.v[2] || 0)) || (num(b.r) - num(a.r)));
    list = (CFG.MAX_SHOW > 0) ? r.slice(0, CFG.MAX_SHOW) : r; total = r.length; shown = 0; cnt = T(p || t || d || (s ? stateName(s) : T('पूरे भारत'))) + ' · ' + T(sv) + ': ' + total + ' ' + T('कारीगर मिले');
    $('hsRes').innerHTML = list.length ? '' : '<div class="empty">' + esc(T('इस चुनाव में अभी कोई कारीगर रजिस्टर नहीं है। दूसरा इलाका या "सभी" चुनकर देखें।')) + '</div>';
    curSv = sv; showMore();
  }

  // ---- "और देखें": एक बार में 10 कारीगर, फिर अगले 10 ... ----
  const PAGE = Math.max(1, CFG.PAGE_SIZE || 10);
  let list = [], total = 0, shown = 0, cnt = '', curSv = '';
  const bd = [['मोबाइल OTP', 0], ['आधार e-KYC', 1], ['पुलिस वेरिफिकेशन', 2], ['स्थानीय रेफरेंस', 3]];
  function card(w) {
    const v = (w.v && w.v.length === 4) ? w.v : [0, 0, 0, 0], lc = lvl(v), name = String(w.n || '');
    const wid = String(w.id || 'DEMO').replace(/[^A-Za-z0-9\-]/g, '');
    return '<article class="worker"><div class="av" aria-hidden="true">' + esc(Array.from(name)[0] || '?') + '</div><div><h3>' + esc(name) + '</h3>' +
      '<div class="meta">' + esc(T(curSv)) + ' · ' + esc(num(w.e)) + ' ' + esc(T('साल अनुभव')) + (num(w.r) ? ' · ⭐ ' + esc(num(w.r)) + ' (' + esc(num(w.j)) + ' ' + esc(T('काम')) + ')' : '') +
      (w.rate ? ' · ₹' + esc(w.rate) : '') + ' · ' + esc(w.p) + ', ' + esc(w.d) + '</div><div class="badges">' +
      bd.map(function (x) { const i = x[1]; return '<span class="b ' + (v[i] ? 'y' : 'n') + '">' + (v[i] ? '✔' : '✖') + ' ' + esc(T(x[0])) + (i === 2 && v[2] && w.dt ? ' (' + esc(w.dt) + ')' : '') + (v[i] ? '' : ' ' + esc(T('बाकी'))) + '</span>'; }).join('') +
      '</div></div><div class="act"><div class="lvl b ' + lc[1] + '">' + esc(lc[0]) + '</div>' +
      '<a class="call" href="#" data-contact="' + wid + '">' + esc(T('संपर्क करें')) + '</a>' +
      '<button type="button" class="rep" data-report="' + wid + '">' + esc(T('शिकायत करें')) + '</button></div></article>';
  }
  function showMore() {
    const upto = Math.min(list.length, shown + PAGE);
    let h = ''; for (let i = shown; i < upto; i++) h += card(list[i]);
    $('hsRes').insertAdjacentHTML('beforeend', h); shown = upto;
    $('hsCnt').textContent = cnt + (total > PAGE ? ' · ' + shown + ' ' + T('दिख रहे हैं') : '');
    let more = '';
    if (shown < list.length) more = '<button type="button" class="go" id="hsMoreBtn">' + esc(T('⬇ और देखें')) + ' (' + (list.length - shown) + ')</button>';
    else if (list.length < total) more = '<p class="meta">' + esc(T('इससे ज़्यादा कारीगर हैं — ज़िला / तहसील / गाँव चुनकर खोज और सटीक करें।')) + '</p>';
    $('hsMoreBox').innerHTML = more;
    const bt = $('hsMoreBtn'); if (bt) bt.onclick = showMore;
  }

  $('hsRes').addEventListener('click', function (e) {
    const a = e.target.closest('[data-contact],[data-report]'); if (!a) return;
    e.preventDefault();
    contact(a.getAttribute('data-contact') || a.getAttribute('data-report'), a.hasAttribute('data-report'));
  });

  let cid = '', ctype = '';
  function contact(id, rep) {
    cid = id; ctype = rep ? 'शिकायत' : 'संपर्क';          // ⚠️ Sheet/Code.gs इन्हीं दो शब्दों से पहचानते हैं — अनुवाद न करें
    $('hsCt').textContent = rep ? T('शिकायत दर्ज करें') : T('कारीगर से संपर्क');
    $('hsCl').textContent = rep ? T('शिकायत क्या है?') : T('काम की जानकारी');
    $('hsCs').textContent = ''; $('hsCf').reset(); $('hsDlg').showModal();
  }
  $('hsClose').onclick = () => $('hsDlg').close();
  $('hsCf').onsubmit = async e => {
    e.preventDefault(); const b = $('hsCb'); b.disabled = true;
    const o = { action: 'contact', type: ctype, worker: cid, naam: $('hsCn').value, mobile: $('hsCm').value, detail: $('hsCw').value };
    if (ENDPOINT) {
      try {
        const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(o) });
        const j = await res.json();
        if (!j || !j.ok) { $('hsCs').textContent = (j && j.msg) || T('भेजने में दिक्कत हुई। दोबारा कोशिश करें।'); b.disabled = false; return; }
      } catch (x) { $('hsCs').textContent = T('भेजने में दिक्कत हुई। दोबारा कोशिश करें।'); b.disabled = false; return; }
    }
    $('hsCs').textContent = T('भेज दिया गया। हमारी टीम जल्द आपको कॉल करेगी.') + (ENDPOINT ? '' : ' ' + T('(डेमो)'));
    setTimeout(() => { $('hsDlg').close(); b.disabled = false; }, 1800);
  };
  $('hsGo').onclick = render; $('hsVo').onchange = render;
  if (!ENDPOINT) $('hsDemo').style.display = 'block';      // बिना URL के सिर्फ़ डेमो — असली ग्राहक को नकली नाम न दिखें, इसलिए साफ़ चेतावनी
  render();
})();
