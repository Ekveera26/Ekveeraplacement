/* EkVeera — राज्य → ज़िला → तहसील → शहर/गाँव (data/<राज्य-कोड>.json) — For Rent, Tution के लिए एक जैसा Location बॉक्स (v19n: अब कई राज्य)
   HTML में:  <div class="mp-loc" data-mp="gLoc" data-mode="full" data-req="1"></div>   (data-mode="search" = सबसे खास चुना हुआ नाम; full = "गाँव, तहसील, ज़िला[, राज्य]")
   यही बॉक्स एक छिपा <input id="gLoc"> बना देता है, जिसमें चुनी हुई Location लिखी रहती है — पुराना MP का रूप जैसा था वैसा ही (MP में राज्य का नाम नहीं जुड़ता, बाक़ी राज्यों में अंत में राज्य का नाम जुड़ता है)।
   नया राज्य जोड़ना हो: data/XX.json रखें (3_extra/lgd_state_json_to_data.py से बनती है) और नीचे STATES में एक पंक्ति जोड़ें। हर राज्य की file तभी खुलती है जब वह राज्य चुना जाए (फ़ोन का डेटा बचता है)। */
(function () {
  'use strict';
  var STATES = [['MP', 'मध्य प्रदेश', '', 'Madhya Pradesh'], ['UP', 'उत्तर प्रदेश', 'Uttar Pradesh', 'Uttar Pradesh'], ['BR', 'बिहार', 'Bihar', 'Bihar'], ['RJ', 'राजस्थान', 'Rajasthan', 'Rajasthan'], ['MH', 'महाराष्ट्र', 'Maharashtra', 'Maharashtra'],
                ['GJ', 'गुजरात', 'Gujarat', 'Gujarat'], ['HR', 'हरियाणा', 'Haryana', 'Haryana'], ['DL', 'दिल्ली', 'Delhi', 'Delhi'], ['CG', 'छत्तीसगढ़', 'Chhattisgarh', 'Chhattisgarh']];   // [कोड, हिंदी नाम, Location में जुड़ने वाला नाम ('' = न जुड़े)]
  var CACHE = {}, LOADING = {};
  function T(s) { return typeof __t === 'function' ? __t(s) : s; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function load(code) {
    code = code || 'MP';
    if (CACHE[code]) return Promise.resolve(CACHE[code]);
    if (!LOADING[code]) LOADING[code] = fetch('data/' + code + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) { CACHE[code] = d; return d; }).catch(function () { LOADING[code] = null; return {}; });
    return LOADING[code];
  }
  var OTHER = '__other__';
  function opts(arr, first) { return '<option value="">' + esc(first) + '</option>' + arr.map(function (x) { return '<option value="' + esc(x) + '">' + esc(x) + '</option>'; }).join('') + '<option value="' + OTHER + '">' + esc(T('अन्य (Other) — खुद लिखें')) + '</option>'; }
  function mount(box) {
    var id = box.getAttribute('data-mp'), mode = box.getAttribute('data-mode') || 'full', req = box.getAttribute('data-req') === '1', search = mode === 'search';
    var st = 'width:100%;padding:11px 12px;border-radius:10px;border:1px solid var(--line);font-size:14.5px;background:#fff;';
    box.innerHTML = '<label style="font-weight:700">' + esc(T(search ? 'राज्य / ज़िला / तहसील / शहर-गाँव (ज़रूरी नहीं)' : 'राज्य / ज़िला / तहसील / शहर-गाँव')) + (req ? ' <span style="color:#c0392b">*</span>' : '') + '</label>' +
      '<div style="display:grid;gap:8px;margin-top:6px"><select id="' + id + '_st" style="' + st + '">' + STATES.map(function (s) { return '<option value="' + s[0] + '">' + esc(window.EKV_LANG === 'en' ? s[3] : T(s[1])) + '</option>'; }).join('') + '</select>' +
      '<select id="' + id + '_di" style="' + st + '"></select><select id="' + id + '_te" style="' + st + '"></select><select id="' + id + '_vi" style="' + st + '"></select>' +
      '<input id="' + id + '_ot" type="text" maxlength="60" placeholder="' + esc(T('अपना शहर / गाँव / इलाका लिखें')) + '" style="' + st + 'display:none"></div><input type="hidden" id="' + id + '">';
    var ss = document.getElementById(id + '_st'), di = document.getElementById(id + '_di'), te = document.getElementById(id + '_te'), vi = document.getElementById(id + '_vi'), ot = document.getElementById(id + '_ot'), out = document.getElementById(id), D = {};
    function stName() { var c = ss.value, f = STATES.filter(function (s) { return s[0] === c; })[0]; return f ? f[2] : ''; }
    function val() {
      var d = di.value === OTHER ? '' : di.value, t = te.value === OTHER ? '' : te.value, v = vi.value === OTHER ? ot.value.trim() : vi.value;
      if (!v && vi.value === OTHER) v = '';
      var sn = stName();
      out.value = search ? (v || t || d || sn || '') : [v, t, d, sn].filter(String).join(', ');
    }
    function draw() {
      var d = di.value, t = te.value, TT = (D[d] && d !== OTHER) ? D[d] : {};
      te.innerHTML = opts(Object.keys(TT), search ? T('सभी तहसील') : T('— तहसील चुनें —')); te.value = TT[t] ? t : '';
      var VV = (TT[te.value] && te.value !== OTHER) ? TT[te.value] : [], v = vi.value;
      vi.innerHTML = opts(VV, search ? T('सभी शहर/गाँव') : T('— शहर / गाँव चुनें —')); vi.value = VV.indexOf(v) > -1 || v === OTHER ? v : '';
      ot.style.display = vi.value === OTHER ? '' : 'none'; val();
    }
    function loadState() {
      D = {}; di.innerHTML = opts([], search ? T('सभी ज़िले') : T('— ज़िला चुनें —')); draw();
      var code = ss.value, old = box.querySelector('.mp-warn'); if (old) old.remove();
      load(code).then(function (d) {
        if (ss.value !== code) return;                                     // बीच में राज्य बदल गया तो पुराना जवाब छोड़ दें
        D = d; di.innerHTML = opts(Object.keys(D), search ? T('सभी ज़िले') : T('— ज़िला चुनें —')); draw();
        if (!Object.keys(D).length && !box.querySelector('.mp-warn')) {     // सूची न मिले तो चुपचाप खाली न रहे — साफ़ चेतावनी
          var w = document.createElement('div'); w.className = 'mp-warn';
          w.style.cssText = 'margin-top:8px;padding:9px 12px;border-radius:10px;background:#fdecea;color:#a12a1f;font-size:13.5px;font-weight:700';
          w.textContent = T('⚠️ ज़िलों की सूची (data/' + code + '.json) लोड नहीं हुई — नीचे "अन्य (Other)" चुनकर खुद लिखें। Admin: GitHub पर "data" फ़ोल्डर में यह file है या नहीं देखें।');
          box.appendChild(w);
        }
      });
    }
    ss.onchange = function () { di.value = ''; te.value = ''; vi.value = ''; loadState(); };
    di.onchange = function () { te.value = ''; vi.value = ''; draw(); };
    te.onchange = function () { vi.value = ''; draw(); };
    vi.onchange = draw; ot.oninput = val;
    loadState();
  }
  function init() { document.querySelectorAll('.mp-loc').forEach(function (b) { if (!b.dataset.ok) { b.dataset.ok = '1'; mount(b); } }); }
  window.EkvLoc = { init: init, ready: load };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
