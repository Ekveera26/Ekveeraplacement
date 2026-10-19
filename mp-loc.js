/* EkVeera — मध्य प्रदेश: ज़िला → तहसील → शहर/गाँव (data/MP.json) — For Rent, Tution (और Home Service) के लिए एक जैसा।
   HTML में:  <div class="mp-loc" data-mp="gLoc" data-mode="full" data-req="1"></div>   (data-mode="search" = सबसे खास चुना हुआ नाम; full = "गाँव, तहसील, ज़िला")
   यही बॉक्स एक छिपा <input id="gLoc"> बना देता है, जिसमें चुनी हुई Location लिखी रहती है — पुराना कोड वही input पढ़ता है।
   आगे दूसरा राज्य जोड़ना हो तो data/XX.json रखकर ACTIVE में कोड जोड़ें। */
(function () {
  'use strict';
  var ACTIVE = ['MP'], DATA = null, loading = null;
  function T(s) { return typeof __t === 'function' ? __t(s) : s; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function load() {
    if (DATA) return Promise.resolve(DATA);
    if (!loading) loading = fetch('data/' + ACTIVE[0] + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) { DATA = d; return d; }).catch(function () { DATA = {}; return DATA; });
    return loading;
  }
  var OTHER = '__other__';
  function opts(arr, first) { return '<option value="">' + esc(first) + '</option>' + arr.map(function (x) { return '<option value="' + esc(x) + '">' + esc(x) + '</option>'; }).join('') + '<option value="' + OTHER + '">' + esc(T('अन्य (Other) — खुद लिखें')) + '</option>'; }
  function mount(box) {
    var id = box.getAttribute('data-mp'), mode = box.getAttribute('data-mode') || 'full', req = box.getAttribute('data-req') === '1', search = mode === 'search';
    var st = 'width:100%;padding:11px 12px;border-radius:10px;border:1px solid var(--line);font-size:14.5px;background:#fff;';
    box.innerHTML = '<label style="font-weight:700">' + esc(T(search ? 'ज़िला / तहसील / शहर-गाँव (ज़रूरी नहीं) — मध्य प्रदेश' : 'ज़िला / तहसील / शहर-गाँव — मध्य प्रदेश')) + (req ? ' <span style="color:#c0392b">*</span>' : '') + '</label>' +
      '<div style="display:grid;gap:8px;margin-top:6px"><select id="' + id + '_di" style="' + st + '"></select><select id="' + id + '_te" style="' + st + '"></select><select id="' + id + '_vi" style="' + st + '"></select>' +
      '<input id="' + id + '_ot" type="text" maxlength="60" placeholder="' + esc(T('अपना शहर / गाँव / इलाका लिखें')) + '" style="' + st + 'display:none"></div><input type="hidden" id="' + id + '">';
    var di = document.getElementById(id + '_di'), te = document.getElementById(id + '_te'), vi = document.getElementById(id + '_vi'), ot = document.getElementById(id + '_ot'), out = document.getElementById(id), D = {};
    var any = search ? T('सभी') : T('— चुनें —');
    function val() {
      var d = di.value === OTHER ? '' : di.value, t = te.value === OTHER ? '' : te.value, v = vi.value === OTHER ? ot.value.trim() : vi.value;
      if (!v && vi.value === OTHER) v = '';
      out.value = search ? (v || t || d || '') : [v, t, d].filter(String).join(', ');
    }
    function draw() {
      var d = di.value, t = te.value, TT = (D[d] && d !== OTHER) ? D[d] : {};
      te.innerHTML = opts(Object.keys(TT), search ? T('सभी तहसील') : T('— तहसील चुनें —')); te.value = TT[t] ? t : '';
      var VV = (TT[te.value] && te.value !== OTHER) ? TT[te.value] : [], v = vi.value;
      vi.innerHTML = opts(VV, search ? T('सभी शहर/गाँव') : T('— शहर / गाँव चुनें —')); vi.value = VV.indexOf(v) > -1 || v === OTHER ? v : '';
      ot.style.display = vi.value === OTHER ? '' : 'none'; val();
    }
    di.innerHTML = opts(Object.keys(D), search ? T('सभी ज़िले') : T('— ज़िला चुनें —'));
    load().then(function (d) {
      D = d; di.innerHTML = opts(Object.keys(D), search ? T('सभी ज़िले') : T('— ज़िला चुनें —')); draw();
      if (!Object.keys(D).length && !box.querySelector('.mp-warn')) {   // v18: सूची न मिले तो चुपचाप खाली न रहे — साफ़ चेतावनी
        var w = document.createElement('div'); w.className = 'mp-warn';
        w.style.cssText = 'margin-top:8px;padding:9px 12px;border-radius:10px;background:#fdecea;color:#a12a1f;font-size:13.5px;font-weight:700';
        w.textContent = T('⚠️ ज़िलों की सूची (data/MP.json) लोड नहीं हुई — नीचे "अन्य (Other)" चुनकर खुद लिखें। Admin: GitHub पर "data" फ़ोल्डर में MP.json जाँचें।');
        box.appendChild(w);
      }
    });
    di.onchange = function () { te.value = ''; vi.value = ''; draw(); };
    te.onchange = function () { vi.value = ''; draw(); };
    vi.onchange = draw; ot.oninput = val; draw();
  }
  function init() { document.querySelectorAll('.mp-loc').forEach(function (b) { if (!b.dataset.ok) { b.dataset.ok = '1'; mount(b); } }); }
  window.EkvLoc = { init: init, ready: load };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
