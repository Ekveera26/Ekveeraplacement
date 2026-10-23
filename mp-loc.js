/* EkVeera — राज्य → ज़िला → तहसील → शहर/गाँव (data/<राज्य-कोड>.json) — For Rent, Tution के लिए एक जैसा Location बॉक्स (v19o)
   HTML में:  <div class="mp-loc" data-mp="gLoc" data-mode="full" data-req="1"></div>   (data-mode="search" = सबसे खास चुना हुआ नाम; full = "गाँव, तहसील, ज़िला[, राज्य]")
   यही बॉक्स एक छिपा <input id="gLoc"> बना देता है, जिसमें चुनी हुई Location लिखी रहती है — (MP में राज्य का नाम नहीं जुड़ता, बाक़ी राज्यों में अंत में जुड़ता है)।
   🆕 v19o — "Other" अब हर स्तर पर: ज़िला / तहसील / शहर-गाँव, तीनों में "अन्य (Other)" चुनने पर लिखने का अपना बॉक्स खुलता है।
        ज़िला Other हो तो तहसील और शहर-गाँव भी लिखने होते हैं; तहसील Other हो तो शहर-गाँव लिखना होता है।
        फ़ॉर्म सफल भेजने के बाद फ़ॉर्म की JS  EkvLoc.save('gLoc')  बुलाती है -> लिखी हुई जगह Server (EkVeera_Places.gs, "Custom Places" शीट) में सेव होती है
        और अगली बार हर आदमी को वह जगह सीधे list में दिखती है (Server से list आकर पुरानी JSON में जुड़ जाती है)।
   नया राज्य जोड़ना हो: data/XX.json रखें और नीचे STATES में एक पंक्ति जोड़ें (और EkVeera_Places.gs के EKV_PL.STATES में कोड)। */
(function () {
  'use strict';
  var STATES = [['MP', 'मध्य प्रदेश', '', 'Madhya Pradesh'], ['UP', 'उत्तर प्रदेश', 'Uttar Pradesh', 'Uttar Pradesh'], ['BR', 'बिहार', 'Bihar', 'Bihar'], ['RJ', 'राजस्थान', 'Rajasthan', 'Rajasthan'], ['MH', 'महाराष्ट्र', 'Maharashtra', 'Maharashtra'],
                ['GJ', 'गुजरात', 'Gujarat', 'Gujarat'], ['HR', 'हरियाणा', 'Haryana', 'Haryana'], ['DL', 'दिल्ली', 'Delhi', 'Delhi'], ['CG', 'छत्तीसगढ़', 'Chhattisgarh', 'Chhattisgarh']];   // [कोड, हिंदी नाम, Location में जुड़ने वाला नाम ('' = न जुड़े), English नाम]
  var CACHE = {}, LOADING = {}, STATIC = {};
  function T(s) { return typeof __t === 'function' ? __t(s) : s; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function low(s) { return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim(); }

  /* ---------- Server से बात (वही तरीका जो For Rent / Tution इस्तेमाल करते हैं) ---------- */
  function api(params) {
    if (typeof vcSecurePost === 'function') return vcSecurePost(params);
    if (typeof SEARCH_WEB_APP_URL !== 'undefined') return fetch(SEARCH_WEB_APP_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params) }).then(function (r) { return r.json(); });
    return Promise.reject(new Error('no api'));
  }

  /* ---------- सूचियाँ मिलाना: पुरानी JSON + लोगों की "Other" वाली जगहें (बिना दोहराव, बड़े-छोटे अक्षर का फ़र्क नहीं) ---------- */
  function findKey(obj, name) { var k = low(name), ks = Object.keys(obj); for (var i = 0; i < ks.length; i++) if (low(ks[i]) === k) return ks[i]; return null; }
  function mergeCustom(base, extra) {
    var out = {}, d, t;
    Object.keys(base).forEach(function (dk) { out[dk] = {}; Object.keys(base[dk]).forEach(function (tk) { out[dk][tk] = base[dk][tk].slice(); }); });
    Object.keys(extra || {}).forEach(function (cd) {
      if (!cd || cd === '—') return;
      d = findKey(out, cd) || cd; if (!out[d]) out[d] = {};
      Object.keys(extra[cd] || {}).forEach(function (ct) {
        if (!ct || ct === '—') return;
        t = findKey(out[d], ct) || ct; if (!out[d][t]) out[d][t] = [];
        (extra[cd][ct] || []).forEach(function (v) { if (v && !out[d][t].some(function (x) { return low(x) === low(v); })) out[d][t].push(v); });
      });
    });
    return out;
  }
  function load(code) {
    code = code || 'MP';
    if (CACHE[code]) return Promise.resolve(CACHE[code]);
    if (!LOADING[code]) {
      var base = fetch('data/' + code + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).catch(function () { return {}; });
      var extra = api({ action: 'placesget', state: code }).then(function (r) { return (r && r.status === 'ok' && r.data) || {}; }).catch(function () { return {}; });
      LOADING[code] = Promise.all([base, extra]).then(function (a) { STATIC[code] = a[0]; CACHE[code] = mergeCustom(a[0], a[1]); return CACHE[code]; }).catch(function () { LOADING[code] = null; return {}; });
    }
    return LOADING[code];
  }
  var OTHER = '__other__';
  function opts(arr, first) { return '<option value="">' + esc(first) + '</option>' + arr.map(function (x) { return '<option value="' + esc(x) + '">' + esc(x) + '</option>'; }).join('') + '<option value="' + OTHER + '">' + esc(T('अन्य (Other) — खुद लिखें')) + '</option>'; }

  function mount(box) {
    var id = box.getAttribute('data-mp'), mode = box.getAttribute('data-mode') || 'full', req = box.getAttribute('data-req') === '1', search = mode === 'search';
    var st = 'width:100%;padding:11px 12px;border-radius:10px;border:1px solid var(--line);font-size:14.5px;background:#fff;';
    function inp(suffix, ph) { return '<input id="' + id + suffix + '" type="text" maxlength="40" autocomplete="off" placeholder="' + esc(T(ph)) + '" style="' + st + 'display:none">'; }
    box.innerHTML = '<label style="font-weight:700">' + esc(T(search ? 'राज्य / ज़िला / तहसील / शहर-गाँव (ज़रूरी नहीं)' : 'राज्य / ज़िला / तहसील / शहर-गाँव')) + (req ? ' <span style="color:#c0392b">*</span>' : '') + '</label>' +
      '<div style="display:grid;gap:8px;margin-top:6px"><select id="' + id + '_st" style="' + st + '">' + STATES.map(function (s) { return '<option value="' + s[0] + '">' + esc(window.EKV_LANG === 'en' ? s[3] : T(s[1])) + '</option>'; }).join('') + '</select>' +
      '<select id="' + id + '_di" style="' + st + '"></select>' + inp('_od', 'अपने ज़िले का नाम लिखें') +
      '<select id="' + id + '_te" style="' + st + '"></select>' + inp('_ot', 'अपनी तहसील का नाम लिखें') +
      '<select id="' + id + '_vi" style="' + st + '"></select>' + inp('_ov', 'अपना शहर / गाँव / इलाका लिखें') +
      '</div><input type="hidden" id="' + id + '">';
    var $ = function (s) { return document.getElementById(id + s); };
    var ss = $('_st'), di = $('_di'), te = $('_te'), vi = $('_vi'), od = $('_od'), ot = $('_ot'), ov = $('_ov'), out = document.getElementById(id), D = {};
    function stName() { var c = ss.value, f = STATES.filter(function (s) { return s[0] === c; })[0]; return f ? f[2] : ''; }
    function flags() { var a = di.value === OTHER, b = a || te.value === OTHER, c = b || vi.value === OTHER; return { d: a, t: b, v: c }; }
    function parts() {
      var f = flags();
      return { d: f.d ? od.value.trim() : di.value, t: f.t ? ot.value.trim() : te.value, v: f.v ? ov.value.trim() : vi.value, f: f };
    }
    function val() {
      var p = parts(), sn = stName();
      out.value = search ? (p.v || p.t || p.d || sn || '') : [p.v, p.t, p.d, sn].filter(String).join(', ');
      out.setAttribute('data-district', p.d ? '1' : '');
    }
    function show() {
      var f = flags();
      te.style.display = f.d ? 'none' : ''; vi.style.display = f.t ? 'none' : '';
      od.style.display = f.d ? '' : 'none'; ot.style.display = f.t ? '' : 'none'; ov.style.display = f.v ? '' : 'none';
    }
    function draw() {
      var d = di.value, t = te.value, TT = (D[d] && d !== OTHER) ? D[d] : {};
      te.innerHTML = opts(Object.keys(TT), search ? T('सभी तहसील') : T('— तहसील चुनें —')); te.value = (TT[t] || t === OTHER) ? t : '';
      var VV = (TT[te.value] && te.value !== OTHER) ? TT[te.value] : [], v = vi.value;
      vi.innerHTML = opts(VV, search ? T('सभी शहर/गाँव') : T('— शहर / गाँव चुनें —')); vi.value = (VV.indexOf(v) > -1 || v === OTHER) ? v : '';
      show(); val();
    }
    function loadState() {
      D = {}; di.innerHTML = opts([], search ? T('सभी ज़िले') : T('— ज़िला चुनें —')); draw();
      var code = ss.value, old = box.querySelector('.mp-warn'); if (old) old.remove();
      load(code).then(function (d) {
        if (ss.value !== code) return;                                     // बीच में राज्य बदल गया तो पुराना जवाब छोड़ दें
        var keep = di.value; D = d; di.innerHTML = opts(Object.keys(D), search ? T('सभी ज़िले') : T('— ज़िला चुनें —')); di.value = (D[keep] || keep === OTHER) ? keep : ''; draw();
        if (!Object.keys(D).length && !box.querySelector('.mp-warn')) {     // सूची न मिले तो चुपचाप खाली न रहे — साफ़ चेतावनी
          var w = document.createElement('div'); w.className = 'mp-warn';
          w.style.cssText = 'margin-top:8px;padding:9px 12px;border-radius:10px;background:#fdecea;color:#a12a1f;font-size:13.5px;font-weight:700';
          w.textContent = T('⚠️ ज़िलों की सूची (data/' + code + '.json) लोड नहीं हुई — नीचे "अन्य (Other)" चुनकर खुद लिखें। Admin: GitHub पर "data" फ़ोल्डर में यह file है या नहीं देखें।');
          box.appendChild(w);
        }
      });
    }
    ss.onchange = function () { di.value = ''; te.value = ''; vi.value = ''; od.value = ot.value = ov.value = ''; loadState(); };
    di.onchange = function () { te.value = ''; vi.value = ''; draw(); };
    te.onchange = function () { vi.value = ''; draw(); };
    vi.onchange = draw; od.oninput = ot.oninput = ov.oninput = val;
    box._ekv = { parts: parts, state: function () { return ss.value; }, search: search, data: function () { return D; }, add: function (d, t, v) { CACHE[ss.value] = mergeCustom(CACHE[ss.value] || {}, (function () { var o = {}; o[d] = {}; if (t) o[d][t] = v ? [v] : []; return o; })()); } };
    loadState();
  }

  /* फ़ॉर्म सफल भेजने के बाद: "Other" में लिखी जगह Server में सेव (सबकी list में जुड़ने के लिए). सिर्फ़ तब जो सूची में पहले से न हो */
  function save(id) {
    var box = document.querySelector('.mp-loc[data-mp="' + id + '"]'); if (!box || !box._ekv || box._ekv.search) return Promise.resolve(0);
    var h = box._ekv, p = h.parts(), code = h.state();
    if (!p.f.d && !p.f.t && !p.f.v) return Promise.resolve(0);          // सब सूची से चुना था — कुछ नया नहीं
    if (!p.d) return Promise.resolve(0);
    if (p.v && !p.t) return Promise.resolve(0);                          // शहर/गाँव बिना तहसील के सेव नहीं होता
    var base = STATIC[code] || {}, dk = findKey(base, p.d), tk = dk ? findKey(base[dk], p.t) : null;
    if (dk && tk && p.v && base[dk][tk].some(function (x) { return low(x) === low(p.v); })) return Promise.resolve(0);   // पहले से सूची में है
    return api({ action: 'placesadd', state: code, district: p.d, tehsil: p.t || '', place: p.v || '' }).then(function (r) {
      if (r && r.status === 'ok') { h.add(p.d, p.t, p.v); return r.added || 0; }
      return 0;
    }).catch(function () { return 0; });
  }
  function hasDistrict(id) { var h = document.getElementById(id); return !!(h && h.getAttribute('data-district')); }

  function init() { document.querySelectorAll('.mp-loc').forEach(function (b) { if (!b.dataset.ok) { b.dataset.ok = '1'; mount(b); } }); }
  window.EkvLoc = { init: init, ready: load, save: save, hasDistrict: hasDistrict, merge: mergeCustom, api: api };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
