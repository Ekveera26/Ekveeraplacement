/* EkVeera — "अपनी ID यहीं तुरंत देखें" (For Rent और Home Service पेज)
   For Rent  → EkVeera का Apps Script (action: rentmyids)  — Giver ID, Item ID, Order ID
   Home Service → EkVeera का वही Apps Script (action: hsmyids) — Karigar ID, Order ID
   सिर्फ़ ID + स्थिति दिखती है; नाम/मोबाइल/पता कुछ नहीं। */
(function () {
  'use strict';
  const T = s => (typeof __t === 'function' ? __t(s) : s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MSG = { err: T('कुछ गड़बड़ हो गई, दोबारा कोशिश करें।') };
  function note(out, text, color) { out.innerHTML = '<p style="color:' + color + ';font-size:14px;margin:0;">' + esc(text) + '</p>'; }
  function rows(out, list, tail) {
    out.innerHTML = list.map(function (r) {
      return '<div style="background:#fff;border:1px solid #bfe3cc;border-radius:8px;padding:10px 14px;margin-top:6px;font-size:14.5px;"><strong>' + esc(r.type) + ':</strong> ' + esc(r.id) +
        (r.note ? ' <span style="color:#596579;font-size:13px;">— ' + esc(r.note) + '</span>' : '') + '</div>';
    }).join('') + '<p style="color:#596579;font-size:12.5px;margin:10px 0 0;">' + esc(tail) + '</p>';
  }
  async function run(box) {
    const kind = box.getAttribute('data-myids'), out = box.querySelector('.mi-out'), v = (box.querySelector('.mi-in').value || '').trim(), btn = box.querySelector('.mi-btn');
    if (!v) return note(out, kind === 'home' ? T('कृपया अपना मोबाइल नंबर डालें।') : T('कृपया अपना Mobile Number या Email डालें।'), '#C0392B');
    btn.disabled = true; note(out, T('ढूंढा जा रहा है...'), '#596579');
    try {
      if (kind === 'tution') {
        const d = await vcSecurePost({ action: 'tutmyids', contact: v });
        if (d.status !== 'ok') note(out, d.message || MSG.err, '#C0392B');
        else if (!d.results.length) note(out, T('इस Mobile/Email से Tution की कोई ID नहीं मिली। वही Mobile/Email डालें जो Register करते समय दिया था।'), '#C0392B');
        else rows(out, d.results, T('इन ID को संभालकर रखें (Screenshot ले लें)।'));
      } else if (kind === 'rent') {
        const d = await vcSecurePost({ action: 'rentmyids', contact: v });
        if (d.status !== 'ok') note(out, d.message || MSG.err, '#C0392B');
        else if (!d.results.length) note(out, T('इस Mobile/Email से For Rent की कोई ID नहीं मिली। वही Mobile/Email डालें जो Register करते समय दिया था।'), '#C0392B');
        else rows(out, d.results, T('इन ID को संभालकर रखें (Screenshot ले लें)।'));
      } else {
        const d = await vcSecurePost({ action: 'hsmyids', contact: v });
        if (d.status !== 'ok') note(out, d.message || MSG.err, '#C0392B');
        else if (!d.results.length) note(out, T('इस मोबाइल से Home Service की कोई ID नहीं मिली। वही मोबाइल डालें जो रजिस्ट्रेशन या Order के समय दिया था।'), '#C0392B');
        else rows(out, d.results, T('इन ID को संभालकर रखें (Screenshot ले लें)।'));
      }
    } catch (e) { note(out, MSG.err, '#C0392B'); }
    btn.disabled = false;
  }
  document.querySelectorAll('.myids[data-myids]').forEach(function (box) {
    box.querySelector('.mi-btn').addEventListener('click', function () { run(box); });
    box.querySelector('.mi-in').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); run(box); } });
  });
})();
