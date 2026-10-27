/* EkVeera — 📣 Advertisement (v22b)
   -------------------------------------------------------------------------------------------------
   Server: EkVeera_Ads.gs  (actions: adfeed, admark, adadmin, adcampsave, adtargetadd, adtargetset, adset)
   Do hisse:
     1) ekvAds.renderPosting(el, getAuth)  — Staff / Admin ke liye "Aaj ka Kaam": Matter + Group list, ek Tap me Copy + Group khulta hai, ✅ Ho gaya
        getAuth() = { staffId, token, deviceId }  (Staff Login)   ya   { password }  (Admin)
     2) ekvAds.renderAdmin(el)             — Admin: ON/OFF button, Campaign (roz ka Matter), Group/Page ki List, Staff-wise Hisab
   ⚠️ Ye Post khud nahi karta (Facebook/LinkedIn/Instagram bahar ke Software se Post rokte hain, Account Ban ho sakta hai) — Post taiyaar karke deta hai, Post Staff khud dabata hai. */
(function () {
  'use strict';
  var T = function (s) { try { return typeof __t === 'function' ? __t(s) : s; } catch (e) { return s; } };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var ICON = { Facebook: '📘', WhatsApp: '🟢', LinkedIn: '💼', Instagram: '📸', Telegram: '✈️', YouTube: '▶️', X: '✖️', Other: '🔗' };
  var BTN = 'padding:9px 12px;border-radius:9px;border:1px solid #cfd6e0;background:#fff;font-weight:700;font-size:13.5px;cursor:pointer;font-family:inherit;';
  var BTN_OK = BTN.replace('background:#fff', 'background:#1b7f3b;color:#fff;border-color:#1b7f3b');
  var BTN_NO = BTN.replace('background:#fff', 'background:#fff;color:#a12a1f;border-color:#e3b3ad');
  var BTN_BLUE = BTN.replace('background:#fff', 'background:#0B5CAD;color:#fff;border-color:#0B5CAD');
  var INP = 'width:100%;box-sizing:border-box;padding:9px;border:1px solid #cfd6e0;border-radius:8px;font-size:14px;font-family:inherit;margin-bottom:8px;';

  function post(o) { return Promise.resolve().then(function () { return vcSecurePost(o); }).catch(function () { return { status: 'error', message: T('Internet चेक करके दोबारा कोशिश करें।') }; }); }
  function merge(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } }
  function copy(text) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text); return true; } } catch (e) {}
    try { var t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(t); t.select(); var ok = document.execCommand('copy'); document.body.removeChild(t); return ok; } catch (e2) { return false; }
  }
  function toast(el, msg, ok) { if (!el) return; el.textContent = msg; el.style.color = ok === false ? '#a12a1f' : '#1b7f3b'; }

  /* ===================== 1) Aaj ka Kaam ===================== */
  function renderPosting(el, getAuth) {
    if (!el) return;
    el.innerHTML = '<p>⏳ ' + esc(T('आज का काम आ रहा है...')) + '</p>';
    post(merge({ action: 'adfeed' }, getAuth())).then(function (d) {
      if (d && d.code === 'RELOGIN') { el.innerHTML = '<p style="color:#a12a1f">' + esc(d.message || T('कृपया दोबारा Login करें।')) + '</p>'; return; }
      if (!d || d.status !== 'ok') { el.innerHTML = '<p style="color:#a12a1f">' + esc((d && d.message) || T('अभी काम नहीं खुल सका।')) + '</p>'; return; }
      if (!d.on) { el.innerHTML = '<div style="padding:14px;border-radius:12px;background:#fff6e5;border:1.5px solid #f0c36d;color:#7a4b00;font-weight:700;line-height:1.6">⏸️ ' + esc(d.msg) + '</div>'; return; }
      draw(el, d, getAuth);
    });
  }

  function draw(el, d, getAuth) {
    var state = d, h = '';
    function totals() { var dn = 0, tt = 0; state.campaigns.forEach(function (c) { c.targets.forEach(function (t) { tt++; if (t.done) dn++; }); }); return [dn, tt]; }
    function bar() {
      var x = totals(), pc = x[1] ? Math.round(x[0] * 100 / x[1]) : 0;
      return '<div style="font-weight:800;margin-bottom:4px">📣 ' + esc(T('आज का Advertisement')) + ' — ' + esc(d.date) + '</div>' +
        '<div style="height:12px;background:#e6ebf2;border-radius:8px;overflow:hidden"><div id="adsBarFill" style="height:100%;width:' + pc + '%;background:#1b7f3b;transition:width .3s"></div></div>' +
        '<div id="adsBarTxt" style="font-size:13px;margin:5px 0 10px;color:#334155"><b>' + x[0] + '</b> / ' + x[1] + ' ' + esc(T('जगह पर Post हो चुका')) + (x[1] && x[0] === x[1] ? ' 🎉' : '') + '</div>';
    }
    if (!state.campaigns.length) { el.innerHTML = '<div style="padding:14px;border-radius:12px;background:#eef6ff;border:1.5px solid #bcd7f5;color:#1f3b63;line-height:1.6">' + esc(T('आज के लिए अभी कोई Advertisement नहीं है। Admin जब नया Matter डालेंगे, यहीं दिखेगा।')) + '</div>'; return; }
    h += '<div id="adsTop">' + bar() + '</div>';
    h += '<div style="font-size:12.5px;color:#596579;margin-bottom:8px;line-height:1.5">' + esc(T('हर जगह के आगे "📋 Copy + खोलें" दबाएँ → Group खुलेगा, Post-Box में Paste करें (Poster / Video भी जोड़ें) → Post करके "✅ हो गया" दबाएँ। एक Group में रोज़ एक बार ही Post करें।')) + '</div>';
    state.campaigns.forEach(function (c, ci) {
      var firstTxt = c.variants[0] + '\n\n👉 ' + c.link;
      h += '<div style="border:1.5px solid #dfe5ee;border-radius:12px;padding:11px 12px;margin:10px 0;background:#fff">' +
        '<div style="font-weight:800;font-size:15px">' + esc(c.title) + '</div>' +
        '<pre style="white-space:pre-wrap;word-break:break-word;font-family:inherit;font-size:13px;background:#f6f8fb;border-radius:8px;padding:9px;margin:8px 0;max-height:140px;overflow:auto">' + esc(firstTxt) + '</pre>' +
        (c.variants.length > 1 ? '<div style="font-size:12px;color:#596579;margin:-2px 0 6px">' + esc(T('हर Group को अलग-अलग शब्दों वाला Matter मिलता है (Spam से बचने के लिए) — नीचे जो Copy होगा वही Post करें।')) + '</div>' : '') +
        '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
        (c.media ? '<a href="' + esc(c.media) + '" target="_blank" rel="noopener" style="' + BTN_BLUE + 'text-decoration:none;display:inline-block">🖼️ ' + esc(T('Poster / Video खोलें')) + '</a>' : '') +
        '<button type="button" style="' + BTN + '" data-ads-share="' + ci + '">📤 ' + esc(T('Share करें (WhatsApp आदि)')) + '</button>' +
        '<button type="button" style="' + BTN + '" data-ads-link="' + ci + '">🔗 ' + esc(T('मेरा Link Copy')) + '</button></div>' +
        '<div style="margin-top:10px">';
      c.targets.forEach(function (t, ti) {
        h += '<div data-ads-row="' + ci + '-' + ti + '" style="display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px solid #eef1f5">' +
          '<div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (ICON[t.platform] || '🔗') + ' ' + esc(t.name || host(t.url)) + '</div>' +
          '<div style="font-size:11.5px;color:#7a8696">' + esc(t.platform) + '</div></div>' +
          '<button type="button" style="' + BTN + 'white-space:nowrap" data-ads-open="' + ci + '-' + ti + '">📋 ' + esc(T('Copy + खोलें')) + '</button>' +
          '<button type="button" style="' + (t.done ? BTN_OK : BTN) + 'white-space:nowrap" data-ads-done="' + ci + '-' + ti + '">' + (t.done ? '✅' : '☐') + '</button></div>';
      });
      h += '</div></div>';
    });
    h += '<div id="adsMsg" style="font-weight:700;font-size:13px;margin-top:6px"></div>';
    el.innerHTML = h;

    function textFor(c, t) { return c.variants[t.v % c.variants.length] + '\n\n👉 ' + c.link; }
    function refresh() { var x = totals(), pc = x[1] ? Math.round(x[0] * 100 / x[1]) : 0; var f = el.querySelector('#adsBarFill'), tx = el.querySelector('#adsBarTxt'); if (f) f.style.width = pc + '%'; if (tx) tx.innerHTML = '<b>' + x[0] + '</b> / ' + x[1] + ' ' + esc(T('जगह पर Post हो चुका')) + (x[1] && x[0] === x[1] ? ' 🎉' : ''); }
    var msg = el.querySelector('#adsMsg');

    Array.prototype.forEach.call(el.querySelectorAll('[data-ads-open]'), function (b) {
      b.onclick = function () {
        var ix = b.getAttribute('data-ads-open').split('-'), c = state.campaigns[+ix[0]], t = c.targets[+ix[1]], ok = copy(textFor(c, t));
        toast(msg, ok ? T('✅ Matter Copy हो गया — अब Post-Box में Paste करें।') : T('Copy नहीं हो पाया — Matter ऊपर के डिब्बे से हाथ से Copy करें।'), ok);
        try { window.open(t.url, '_blank', 'noopener'); } catch (e) {}
      };
    });
    Array.prototype.forEach.call(el.querySelectorAll('[data-ads-done]'), function (b) {
      b.onclick = function () {
        var ix = b.getAttribute('data-ads-done').split('-'), c = state.campaigns[+ix[0]], t = c.targets[+ix[1]], want = !t.done;
        b.disabled = true;
        post(merge({ action: 'admark', campaignId: c.id, targetId: t.id, done: want ? '1' : '0' }, getAuth())).then(function (r) {
          b.disabled = false;
          if (r && r.status === 'ok') { t.done = want; b.textContent = want ? '✅' : '☐'; b.style.cssText = (want ? BTN_OK : BTN) + 'white-space:nowrap'; refresh(); toast(msg, want ? T('✅ दर्ज हो गया।') : T('निशान हटा दिया।'), true); }
          else toast(msg, (r && r.message) || T('कुछ गड़बड़ हुई।'), false);
        });
      };
    });
    Array.prototype.forEach.call(el.querySelectorAll('[data-ads-share]'), function (b) {
      b.onclick = function () {
        var c = state.campaigns[+b.getAttribute('data-ads-share')], txt = c.variants[0] + '\n\n👉 ' + c.link;
        if (navigator.share) { navigator.share({ text: txt }).catch(function () {}); }
        else { window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank', 'noopener'); }
      };
    });
    Array.prototype.forEach.call(el.querySelectorAll('[data-ads-link]'), function (b) {
      b.onclick = function () { var c = state.campaigns[+b.getAttribute('data-ads-link')]; toast(msg, copy(c.link) ? T('✅ आपका Link Copy हो गया।') : T('Copy नहीं हो पाया।'), true); };
    });
  }

  /* ===================== 2) Admin ===================== */
  function renderAdmin(el) {
    if (!el) return;
    var pw = window.ekveeraAdminPassword;
    if (!pw) { el.innerHTML = '<p style="color:#a12a1f">' + esc(T('पहले Admin Login करें।')) + '</p>'; return; }
    var A = function () { return { password: window.ekveeraAdminPassword }; };
    el.innerHTML = '<p>⏳ ...</p>';
    post(merge({ action: 'adadmin' }, A())).then(function (d) {
      if (!d || d.status !== 'ok') { el.innerHTML = '<p style="color:#a12a1f">' + esc((d && d.message) || T('कुछ गड़बड़ हुई।')) + '</p>'; return; }
      drawAdmin(el, d, A);
    });
  }

  function drawAdmin(el, d, A) {
    var on = d.cfg.on, h = '';
    h += '<div style="border:2px solid ' + (on ? '#9bd3ad' : '#f0c36d') + ';border-radius:12px;padding:11px;margin-bottom:12px;background:' + (on ? '#f1faf4' : '#fffaf0') + '">' +
      '<div style="font-weight:800;font-size:15px">' + (on ? '🟢 ' + esc(T('Advertisement चालू है')) : '⏸️ ' + esc(T('Advertisement बंद है'))) + '</div>' +
      '<input id="adsOffMsg" maxlength="300" placeholder="' + esc(T('बंद होने पर Staff को दिखने वाला संदेश (खाली = मानक)')) + '" value="' + esc(d.cfg.msg || '') + '" style="' + INP + 'margin-top:8px">' +
      '<button type="button" id="adsToggle" style="' + (on ? BTN_NO : BTN_OK) + 'width:100%">' + (on ? '⏸️ ' + esc(T('Advertisement बंद करें (सभी Staff के लिए)')) : '▶️ ' + esc(T('Advertisement चालू करें'))) + '</button>' +
      '<div style="font-size:12px;color:#596579;margin-top:6px">' + esc(T('बंद करते ही Staff को काम दिखना और रोज़ की Notification बंद हो जाती है। Campaign / Group सुरक्षित रहते हैं।')) + '</div></div>';

    h += '<div style="font-weight:800;margin:8px 0 4px">📊 ' + esc(T('आज का हिसाब')) + '</div>' +
      '<div style="font-size:13.5px;line-height:1.7">' + esc(T('चालू Campaign')) + ': <b>' + d.today.liveCampaigns + '</b> · ' + esc(T('चालू Group/Page')) + ': <b>' + d.today.liveTargets + '</b> · ' + esc(T('हर Staff का लक्ष्य')) + ': <b>' + d.today.expectedPerStaff + '</b> Post · ' + esc(T('आज कुल Post')) + ': <b>' + d.today.total + '</b></div>';
    if (d.today.byStaff.length) h += '<div style="margin:6px 0;font-size:13px">' + d.today.byStaff.map(function (s) { return '<div style="display:flex;justify-content:space-between;border-bottom:1px solid #eef1f5;padding:3px 0"><span>' + esc(s.staff) + '</span><b>' + s.done + '</b></div>'; }).join('') + '</div>';
    else h += '<div style="font-size:13px;color:#596579;margin:4px 0">' + esc(T('आज अभी किसी ने Post दर्ज नहीं किया।')) + '</div>';

    /* ---- Campaign ---- */
    h += '<div style="font-weight:800;margin:16px 0 4px">📝 ' + esc(T('आज का Matter (Campaign)')) + '</div>' +
      '<div style="border:1px solid #dfe5ee;border-radius:10px;padding:10px;background:#fafbfd">' +
      '<input id="adsCId" type="hidden"><input id="adsCTitle" placeholder="' + esc(T('नाम (जैसे: Call Center Training — अक्टूबर)')) + '" maxlength="100" style="' + INP + '">' +
      '<textarea id="adsCText" rows="6" maxlength="1500" placeholder="' + esc(T('Post का Matter यहाँ लिखें। Link अपने-आप हर Staff का अपना जुड़ जाएगा।\n\nSpam से बचने के लिए एक से ज़्यादा रूप लिख सकते हैं — हर रूप के बीच एक लाइन में सिर्फ़ --- लिखें।')) + '" style="' + INP + '"></textarea>' +
      '<input id="adsCMedia" placeholder="' + esc(T('Poster / Video का Link (Google Drive / YouTube — खाली छोड़ सकते हैं)')) + '" style="' + INP + '">' +
      '<select id="adsCPage" style="' + INP + '"><option value="main">' + esc(T('Link किस पेज का: Home (index)')) + '</option><option value="training">' + esc(T('Training पेज')) + '</option><option value="placement">' + esc(T('Placement पेज')) + '</option></select>' +
      '<div style="display:flex;gap:8px"><label style="flex:1;font-size:12.5px">' + esc(T('शुरू')) + '<input id="adsCStart" type="date" style="' + INP + 'margin:3px 0 8px"></label><label style="flex:1;font-size:12.5px">' + esc(T('आख़िरी (खाली = जब तक रोकें नहीं)')) + '<input id="adsCEnd" type="date" style="' + INP + 'margin:3px 0 8px"></label></div>' +
      '<div style="display:flex;gap:8px"><button type="button" id="adsCSave" style="' + BTN_OK + 'flex:1">💾 ' + esc(T('Campaign सेव करें')) + '</button><button type="button" id="adsCNew" style="' + BTN + '">' + esc(T('नया')) + '</button></div>' +
      '<div id="adsCMsg" style="margin-top:6px;font-weight:700;font-size:13px"></div></div>';
    h += '<div style="margin-top:8px">';
    d.campaigns.forEach(function (c) {
      h += '<div style="border-top:1px solid #eef1f5;padding:8px 0;display:flex;gap:8px;align-items:center"><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13.5px">' + (c.live ? '🟢' : '⚪') + ' ' + esc(c.id) + ' · ' + esc(c.title) + '</div>' +
        '<div style="font-size:11.5px;color:#7a8696">' + esc(c.start || '') + ' → ' + esc(c.end || T('खुला')) + ' · ' + esc(c.status === 'Paused' ? T('रुका हुआ') : T('चालू')) + '</div></div>' +
        '<button type="button" style="' + BTN + 'padding:6px 9px;font-size:12.5px" data-ads-edit="' + esc(c.id) + '">✏️</button>' +
        '<button type="button" style="' + (c.status === 'Paused' ? BTN_OK : BTN_NO) + 'padding:6px 9px;font-size:12.5px" data-ads-cset="' + esc(c.id) + '">' + (c.status === 'Paused' ? '▶️' : '⏸️') + '</button></div>';
    });
    h += '</div>';

    /* ---- Groups / Pages ---- */
    h += '<div style="font-weight:800;margin:18px 0 4px">🌐 ' + esc(T('Group / Page की List (जहाँ आपने पहली बार Post किया)')) + '</div>' +
      '<div style="border:1px solid #dfe5ee;border-radius:10px;padding:10px;background:#fafbfd">' +
      '<textarea id="adsTLinks" rows="5" placeholder="' + esc(T('हर लाइन में एक Link। नाम भी लिख सकते हैं:\nमैहर Jobs Group | https://facebook.com/groups/...\nhttps://chat.whatsapp.com/...')) + '" style="' + INP + '"></textarea>' +
      '<button type="button" id="adsTAdd" style="' + BTN_OK + 'width:100%">➕ ' + esc(T('List में जोड़ें (पहले से जुड़ा हो तो दोबारा नहीं जुड़ता)')) + '</button>' +
      '<div id="adsTMsg" style="margin-top:6px;font-weight:700;font-size:13px"></div></div>' +
      '<div style="font-size:12.5px;color:#596579;margin:8px 0 2px">' + esc(T('कुल')) + ': <b>' + d.targets.length + '</b> · ' + esc(T('आज Post')) + ' ↓</div>';
    d.targets.forEach(function (t) {
      h += '<div style="display:flex;gap:8px;align-items:center;border-top:1px solid #eef1f5;padding:7px 0"><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (ICON[t.platform] || '🔗') + ' ' + (t.status === 'Paused' ? '⏸️ ' : '') + '<a href="' + esc(t.url) + '" target="_blank" rel="noopener" style="color:inherit">' + esc(t.name || host(t.url)) + '</a></div>' +
        '<div style="font-size:11.5px;color:#7a8696">' + esc(t.id) + ' · ' + esc(t.platform) + ' · ' + esc(T('पहली बार')) + ': ' + esc(t.first || '—') + ' · ' + esc(T('आज')) + ': ' + t.postsToday + '</div></div>' +
        '<button type="button" style="' + (t.status === 'Paused' ? BTN_OK : BTN_NO) + 'padding:6px 9px;font-size:12.5px" data-ads-tset="' + esc(t.id) + '" data-st="' + (t.status === 'Paused' ? 'Active' : 'Paused') + '">' + (t.status === 'Paused' ? '▶️' : '⏸️') + '</button></div>';
    });

    /* ---- Admin ka apna Kaam ---- */
    h += '<div style="font-weight:800;margin:20px 0 6px;padding-top:12px;border-top:2px solid #dfe5ee">🙋 ' + esc(T('मेरा आज का Post (Admin)')) + '</div><div id="adsMine"></div>';
    el.innerHTML = h;

    var $ = function (id) { return el.querySelector('#' + id); };
    $('adsToggle').onclick = function () {
      var want = on ? '0' : '1';
      if (on && !confirm(T('पक्का? सभी Staff के लिए Advertisement का काम बंद हो जाएगा।'))) return;
      this.disabled = true;
      post(merge({ action: 'adset', on: want, msg: $('adsOffMsg').value.trim() }, A())).then(function (r) { if (r && r.status === 'ok') renderAdmin(el); else alert((r && r.message) || T('कुछ गड़बड़ हुई।')); });
    };
    var camps = {}; d.campaigns.forEach(function (c) { camps[c.id] = c; });
    function fill(c) {
      $('adsCId').value = c ? c.id : ''; $('adsCTitle').value = c ? c.title : ''; $('adsCText').value = c ? c.text : ''; $('adsCMedia').value = c ? c.media : '';
      $('adsCPage').value = c ? c.page : 'main'; $('adsCStart').value = c ? c.start : ''; $('adsCEnd').value = c ? c.end : '';
      $('adsCSave').setAttribute('data-status', c ? c.status : 'Active');
    }
    $('adsCNew').onclick = function () { fill(null); $('adsCMsg').textContent = ''; };
    $('adsCSave').onclick = function () {
      var b = this, id = $('adsCId').value;
      b.disabled = true; toast($('adsCMsg'), T('⏳ सेव हो रहा है...'), true);
      post(merge({ action: 'adcampsave', id: id, title: $('adsCTitle').value, text: $('adsCText').value, media: $('adsCMedia').value.trim(), page: $('adsCPage').value, start: $('adsCStart').value, end: $('adsCEnd').value, status: b.getAttribute('data-status') || 'Active' }, A())).then(function (r) {
        b.disabled = false;
        if (r && r.status === 'ok') { toast($('adsCMsg'), r.message, true); setTimeout(function () { renderAdmin(el); }, 700); } else toast($('adsCMsg'), (r && r.message) || T('कुछ गड़बड़ हुई।'), false);
      });
    };
    Array.prototype.forEach.call(el.querySelectorAll('[data-ads-edit]'), function (b) { b.onclick = function () { fill(camps[b.getAttribute('data-ads-edit')]); try { $('adsCTitle').scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} }; });
    Array.prototype.forEach.call(el.querySelectorAll('[data-ads-cset]'), function (b) {
      b.onclick = function () {
        var c = camps[b.getAttribute('data-ads-cset')]; b.disabled = true;
        post(merge({ action: 'adcampsave', id: c.id, title: c.title, text: c.text, media: c.media, page: c.page, start: c.start, end: c.end, status: c.status === 'Paused' ? 'Active' : 'Paused' }, A())).then(function () { renderAdmin(el); });
      };
    });
    $('adsTAdd').onclick = function () {
      var b = this; b.disabled = true; toast($('adsTMsg'), T('⏳ जुड़ रहा है...'), true);
      post(merge({ action: 'adtargetadd', links: $('adsTLinks').value }, A())).then(function (r) {
        b.disabled = false;
        if (r && r.status === 'ok') { toast($('adsTMsg'), r.message, true); setTimeout(function () { renderAdmin(el); }, 900); } else toast($('adsTMsg'), (r && r.message) || T('कुछ गड़बड़ हुई।'), false);
      });
    };
    Array.prototype.forEach.call(el.querySelectorAll('[data-ads-tset]'), function (b) {
      b.onclick = function () { b.disabled = true; post(merge({ action: 'adtargetset', id: b.getAttribute('data-ads-tset'), status: b.getAttribute('data-st') }, A())).then(function () { renderAdmin(el); }); };
    });
    renderPosting($('adsMine'), A);
  }

  window.ekvAds = { renderPosting: renderPosting, renderAdmin: renderAdmin };
  /* Admin Panel ke button ke liye */
  window.axAdsOpen = function () { renderAdmin(document.getElementById('axAdsRoot')); };
})();
