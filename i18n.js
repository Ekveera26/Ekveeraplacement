/* EkVeera — पूरी वेबसाइट Hindi / English (Bilingual Engine)
   -------------------------------------------------------------------------
   • Header के "हिं | EN" बटन से भाषा बदलती है; चुनी हुई भाषा हर पेज पर याद रहती है।
   • Hindi = वेबसाइट जैसी लिखी है वैसी। English = हर वाक्य, बटन, फॉर्म, popup, Help, Error संदेश पूरी तरह English में।
   • कैसे काम करता है:
       1) HTML का हर Hindi हिस्सा  -> i18n-en.js के शब्दकोश (dictionary) से English में बदलता है
       2) JS के हर Hindi वाक्य     -> __t("...") से English में बदलता है
       3) Server (Apps Script) के Hindi संदेश -> fetch के जवाब में अपने-आप English हो जाते हैं
       4) बाद में जुड़ने वाली कोई भी चीज़ -> MutationObserver पकड़कर बदल देता है
   • English का शब्दकोश सिर्फ़ तब लोड होता है जब English चुनी हो (Hindi वालों का Load नहीं बढ़ता)।
   • भाषा बदलते ही पेज एक बार Reload होता है ताकि हर चीज़ (Popup, Form, Help) साफ़-साफ़ नई भाषा में बने। */
(function (root) {
  'use strict';

  var DEV = /[\u0900-\u097F]/;
  var KEY = 'ekveera_lang';
  var IS_BROWSER = typeof document !== 'undefined' && typeof location !== 'undefined';

  function readLang() {
    try {
      var q = new URLSearchParams(location.search).get('lang');
      if (q === 'en' || q === 'hi') { localStorage.setItem(KEY, q); return q; }
      return localStorage.getItem(KEY) === 'en' ? 'en' : 'hi';
    } catch (e) { return 'hi'; }
  }
  var LANG = IS_BROWSER ? (root.__EKV_FORCE_LANG || readLang()) : 'hi';

  /* ---------- Key / hash (JS और Tool दोनों में एक जैसा) ---------- */
  function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function hash(s) {
    var h = 0x811c9dc5 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('00000000' + h.toString(16)).slice(-8);
  }
  function dict() { return root.EKV_EN || {}; }

  /* Hinglish (Roman) WhatsApp आदि वाक्यों के लिए भी वही Dictionary चलती है */
  function needs(s) { return DEV.test(s) || /^\s*Namaste\b|\bkar raha hoon\b/.test(s); }

  /* ---------- Template नियम: जहाँ वाक्य के बीच में बदलने वाली संख्या/नाम हो ---------- */
  function applyRules(s) {
    var rules = root.EKV_RULES || [];
    for (var i = 0; i < rules.length; i++) {
      var m = rules[i][0].exec(s);
      if (m) return s.replace(rules[i][0], rules[i][1]);
    }
    return null;
  }

  /* सबसे अहम function: एक Hindi टुकड़े का English लौटाता है (न मिले तो वही टुकड़ा) */
  function tx(str) {
    if (LANG !== 'en' || str == null) return str;
    str = String(str);
    if (!needs(str)) return str;
    var lead = /^\s/.test(str) ? ' ' : '', trail = /\s$/.test(str) ? ' ' : '';
    var n = norm(str), v = dict()[hash(n)];
    if (v == null) { v = applyRules(n); }
    if (v == null) { if (root.__EKV_MISS) root.__EKV_MISS.push(n); return str; }
    return lead + v + trail;
  }

  /* ---------- DOM का अनुवाद ---------- */
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, SVG: 1, CANVAS: 1, TEMPLATE: 1 };
  var INLINE = { A: 1, B: 1, STRONG: 1, EM: 1, I: 1, SPAN: 1, SMALL: 1, U: 1, MARK: 1, CODE: 1, BR: 1, SUP: 1, SUB: 1, ABBR: 1, S: 1, DEL: 1, INS: 1, FONT: 1 };
  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];

  function inlineOnly(el) {
    for (var c = el.firstElementChild; c; c = c.nextElementSibling) {
      if (!INLINE[c.tagName] || !inlineOnly(c)) return false;
    }
    return true;
  }

  /* Element के अंदर का "सुरक्षित रूप" — inline tag <1>..</1> बनकर, ताकि वाक्य पूरा एक साथ बदल सके */
  function serialize(el, ctx) {
    var out = '';
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3) out += n.nodeValue.replace(/\s+/g, ' ');
      else if (n.nodeType === 1) {
        if (n.tagName === 'BR') out += '<br>';
        else { var i = ++ctx.n; ctx.els[i] = n; out += '<' + i + '>' + serialize(n, ctx) + '</' + i + '>'; }
      }
    }
    return out;
  }
  function unitKey(el) { var ctx = { n: 0, els: [] }; var s = serialize(el, ctx).replace(/\s+/g, ' ').trim(); return { key: s, ctx: ctx }; }

  function tokensOk(tr, count) {
    var open = {}, close = {}, m, re = /<(\/?)(\d+)>/g, seen = 0;
    while ((m = re.exec(tr))) { (m[1] ? close : open)[m[2]] = (((m[1] ? close : open)[m[2]]) || 0) + 1; }
    for (var i = 1; i <= count; i++) { if (open[i] !== 1 || close[i] !== 1) return false; seen++; }
    return Object.keys(open).length === count && Object.keys(close).length === count;
  }

  function build(el, tr, ctx) {
    var doc = el.ownerDocument, parts = tr.split(/(<\/?\d+>|<br>)/), stack = [el], i, p, cur;
    while (el.firstChild) el.removeChild(el.firstChild);
    for (i = 0; i < ctx.els.length; i++) { var o = ctx.els[i]; if (o) while (o.firstChild) o.removeChild(o.firstChild); }
    for (i = 0; i < parts.length; i++) {
      p = parts[i]; if (p === '') continue; cur = stack[stack.length - 1];
      var m = /^<(\/?)(\d+)>$/.exec(p);
      if (p === '<br>') cur.appendChild(doc.createElement('br'));
      else if (m && !m[1]) { var node = ctx.els[parseInt(m[2], 10)]; cur.appendChild(node); stack.push(node); }
      else if (m) { stack.pop(); }
      else cur.appendChild(doc.createTextNode(p));
    }
  }

  function trUnit(el) {
    var u = unitKey(el);
    if (!DEV.test(u.key)) return;
    var v = dict()[hash(u.key)];
    if (v == null) { v = applyRules(u.key); }
    if (v == null) { if (root.__EKV_MISS) root.__EKV_MISS.push(u.key); return; }
    if (u.ctx.n && !tokensOk(v, u.ctx.n)) { if (root.__EKV_BAD) root.__EKV_BAD.push(u.key); return; }
    build(el, v, u.ctx);
  }

  function trTextNode(n) {
    var s = n.nodeValue;
    if (!needs(s)) return;
    var r = tx(s);
    if (r !== s) n.nodeValue = r;
  }

  function walkText(el) {
    if (SKIP[el.tagName] || (el.classList && el.classList.contains('notranslate'))) return;
    if (!DEV.test(el.textContent)) return;
    if (inlineOnly(el)) { trUnit(el); return; }
    var kids = Array.prototype.slice.call(el.childNodes);
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k.nodeType === 3) trTextNode(k);
      else if (k.nodeType === 1) walkText(k);
    }
  }

  function trWaHref(el) {                                   // wa.me?text=... वाले Hinglish संदेश
    var h = el.getAttribute('href') || '';
    var m = /^(https:\/\/wa\.me\/\d+\?text=)(.+)$/.exec(h);
    if (!m) return;
    var t; try { t = decodeURIComponent(m[2]); } catch (e) { return; }
    var r = tx(t);
    if (r !== t) el.setAttribute('href', m[1] + encodeURIComponent(r));
  }

  function trAttrs(rootEl) {
    var list = [];
    if (rootEl.nodeType === 1) list.push(rootEl);
    var all = rootEl.querySelectorAll ? rootEl.querySelectorAll('*') : [];
    for (var i = 0; i < all.length; i++) list.push(all[i]);
    list.forEach(function (el) {
      if (SKIP[el.tagName] && el.tagName !== 'TEMPLATE') return;
      ATTRS.forEach(function (a) {
        var v = el.getAttribute && el.getAttribute(a);
        if (v && needs(v)) { var r = tx(v); if (r !== v) el.setAttribute(a, r); }
      });
      if (el.tagName === 'META' && el.getAttribute('content') && /description|title/i.test((el.getAttribute('name') || '') + (el.getAttribute('property') || ''))) {
        var c = el.getAttribute('content'); if (needs(c)) { var rc = tx(c); if (rc !== c) el.setAttribute('content', rc); }
      }
      if (el.tagName === 'INPUT' && /^(button|submit|reset)$/i.test(el.type || '')) {
        var vv = el.getAttribute('value'); if (vv && needs(vv)) { var rv = tx(vv); if (rv !== vv) el.setAttribute('value', rv); }
      }
      if (el.tagName === 'A') trWaHref(el);
      if (el.hasAttribute && el.hasAttribute('data-en') && LANG === 'en') el.innerHTML = el.getAttribute('data-en');   // पुराने data-en वाले हिस्से
    });
  }

  function translateTree(node) {
    if (LANG !== 'en' || !node) return;
    if (node.nodeType === 3) { trTextNode(node); return; }
    if (node.nodeType !== 1 && node.nodeType !== 9 && node.nodeType !== 11) return;
    var el = node.nodeType === 9 ? node.documentElement : node;
    if (el.nodeType === 1) { trAttrs(el); walkText(el); }
    else { for (var c = el.firstChild; c; c = c.nextSibling) translateTree(c); }
  }

  /* ---------- Server (Apps Script) के जवाब का अनुवाद ---------- */
  function deepTr(v) {
    if (typeof v === 'string') return needs(v) ? tx(v) : v;
    if (Array.isArray(v)) { for (var i = 0; i < v.length; i++) v[i] = deepTr(v[i]); return v; }
    if (v && typeof v === 'object') { for (var k in v) if (Object.prototype.hasOwnProperty.call(v, k)) v[k] = deepTr(v[k]); return v; }
    return v;
  }
  function patchFetch() {
    if (!root.fetch || root.fetch.__ekv) return;
    var of = root.fetch.bind(root);
    var nf = function () {
      return of.apply(null, arguments).then(function (res) {
        try {
          var oj = res.json.bind(res);
          res.json = function () { return oj().then(function (d) { return deepTr(d); }); };
        } catch (e) {}
        return res;
      });
    };
    nf.__ekv = 1; root.fetch = nf;
  }

  /* ---------- भाषा बदलना ---------- */
  function setLang(l) {
    l = l === 'en' ? 'en' : 'hi';
    try { localStorage.setItem(KEY, l); } catch (e) {}
    try {
      var u = new URL(location.href); u.searchParams.delete('lang');
      if (l === LANG) { markButtons(); return; }
      location.replace(u.toString());
    } catch (e) { location.reload(); }
  }
  function toggleLang() { setLang(LANG === 'en' ? 'hi' : 'en'); }
  function markButtons() {
    var bs = document.querySelectorAll('[data-lang]');
    for (var i = 0; i < bs.length; i++) {
      var on = bs[i].getAttribute('data-lang') === LANG;
      bs[i].classList.toggle('is-on', on); bs[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  /* ---------- पहली बार आने वाले (Hindi न जानने वाले) को English का सुझाव ---------- */
  function suggestBanner() {
    try {
      if (LANG !== 'hi' || localStorage.getItem(KEY) || localStorage.getItem('ekveera_lang_hint')) return;
      var nl = String(navigator.language || '').toLowerCase();
      if (/^hi\b/.test(nl) || !nl) return;
      var b = document.createElement('div'); b.className = 'lang-hint notranslate';
      b.innerHTML = '<span>🌐 This website is in Hindi. Read it in English?</span><button type="button" class="lh-en">Switch to English</button><button type="button" class="lh-x" aria-label="Close">✕</button>';
      b.querySelector('.lh-en').onclick = function () { setLang('en'); };
      b.querySelector('.lh-x').onclick = function () { try { localStorage.setItem('ekveera_lang_hint', '1'); } catch (e) {} b.remove(); };
      document.body.insertBefore(b, document.body.firstChild);
    } catch (e) {}
  }

  /* ---------- शुरुआत ---------- */
  if (IS_BROWSER) {
    var de = document.documentElement;
    de.lang = LANG === 'en' ? 'en' : 'hi';
    if (LANG === 'en') {
      de.classList.add('i18n-wait');
      var st = document.createElement('style'); st.textContent = 'html.i18n-wait body{visibility:hidden}'; document.head.appendChild(st);
      patchFetch();
      setTimeout(function () { de.classList.remove('i18n-wait'); }, 3000);   // किसी वजह से अटके तो भी पेज दिखे
    }
    var tries = 0;
    var run = function () {
      if (LANG === 'en' && !root.EKV_EN && tries++ < 100) { setTimeout(run, 30); return; }   // शब्दकोश आने तक रुकें
      if (LANG === 'en') {
        translateTree(document);
        document.title = tx(document.title);
        de.classList.remove('i18n-wait');
        try {
          var mo = new MutationObserver(function (recs) {
            for (var i = 0; i < recs.length; i++) {
              var r = recs[i];
              if (r.type === 'childList') { for (var j = 0; j < r.addedNodes.length; j++) translateTree(r.addedNodes[j]); }
              else if (r.type === 'characterData') { trTextNode(r.target); }
              else if (r.type === 'attributes') { var v = r.target.getAttribute(r.attributeName); if (v && needs(v)) { var t = tx(v); if (t !== v) r.target.setAttribute(r.attributeName, t); } }
            }
          });
          mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
        } catch (e) {}
      }
      markButtons(); suggestBanner();
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  }

  /* ---------- बाहर के लिए ---------- */
  root.EKV_LANG = LANG;
  root.__t = tx;
  root.setLang = setLang;
  root.toggleLang = toggleLang;
  root.EKV_I18N = { hash: hash, norm: norm, tx: tx, unitKey: unitKey, walkText: walkText, translateTree: translateTree, inlineOnly: inlineOnly, needs: needs, DEV: DEV, SKIP: SKIP, INLINE: INLINE, ATTRS: ATTRS, deepTr: deepTr, tokensOk: tokensOk };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.EKV_I18N;

  /* English शब्दकोश: सिर्फ़ English चुनी हो तब (पेज को रोककर) लोड होता है */
  if (IS_BROWSER && LANG === 'en' && !root.EKV_EN) {
    document.write('<script src="i18n-en.js"><\/script>');
  }
})(typeof window !== 'undefined' ? window : globalThis);
