/* EkVeera — 🛡️ App Scan (Admin Panel)
   Ye koi Antivirus nahi hai (website ke andar Antivirus chal hi nahi sakta). Ye ek "Chowkidar" hai jo jaanchta hai:
     1) Website ki har file wahi hai jo aapne daali thi? (SHA-256 se milan, integrity-manifest.json ke saath)
     2) Kisi file me anjaan bahari Website/Script to nahi ghus gaya?   3) Suraksha ki settings (HTTPS, CSP) chalu hain?
     4) Khatarnak code ke nishan (eval, document.write, atob se code chalana) to nahi?
   Jab aap khud koi file badlen: scan chala kar "Naya Manifest Download" dabayein aur use GitHub par daal dein. */
(function () {
  'use strict';
  var OKH = ['script.google.com', 'script.googleusercontent.com', 'docs.google.com', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com',
             'wa.me', 'www.facebook.com', 'maps.google.com', 'www.google.com', 'mail.google.com', 'api.razorpay.com', 'rzp.io', 'razorpay.com', 'www.w3.org', 'schemas.openxmlformats.org',
             'schemas.microsoft.com', 'purl.org', 'github.com', 'ekveera26.github.io', 'www.instagram.com', 'developers.google.com', 'localhost', '127.0.0.1', 'www.youtube.com', 'opensource.org',
             'purl.oclc.org', 'openxmlformats.org', 'www.apache.org', 'jszip.com', 'stuk.github.io', 'docx.js.org', 'github.io', 'fb.me'];
  var FILES = ['index.html', 'training.html', 'placement.html', 'help.html', 'resume-builder.html', 'styles.css', 'app.js', 'i18n.js', 'i18n-en.js', 'staff-ref.js', 'company-form.js',
               'registration-forms.js', 'apply-job.js', 'company-details.js', 'reviews.js', 'staff-profile.js', 'staff-profile-admin.js', 'staff-profile.html', 'payment-log.js', 'receipt.js', 'staff-pay.js', 'training-attendance.js', 'help-center.js',
               'resume-builder.js', 'ekv-scan.js', 'service-worker.js', 'manifest.json', 'docx.min.js'];
  var RISK = [[/\beval\s*\(/, 'eval('], [/new\s+Function\s*\(/, 'new Function('], [/document\.write\s*\(/, 'document.write('], [/atob\s*\([^)]*\)\s*\)?\s*;?\s*(?:eval|Function)/, 'atob→eval'],
              [/String\.fromCharCode\s*\(\s*(?:\d+\s*,\s*){25,}/, 'लंबा fromCharCode (छुपा code)'], [/unescape\s*\(\s*['"]%/, 'unescape(%..)'], [/<iframe[^>]+display\s*:\s*none/i, 'छुपा iframe']];
  var IGNORE_RISK = { 'docx.min.js': 1, 'i18n.js': 1, 'ekv-scan.js': 1 };   // docx library me ye patterns normal hain; ekv-scan.js me patterns sirf dhoondhne ke liye likhe hain
  var ALLOW = { 'help-center.js': ['new Function('] };               // Help ke apne "pre" steps chalane ke liye jaan-boojhkar (pehle se maujood)

  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  async function sha(text) { var d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return hex(d); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function line(ok, txt) { return '<div class="scan-l ' + (ok === true ? 'ok' : ok === false ? 'bad' : 'warn') + '">' + (ok === true ? '✅' : ok === false ? '❌' : '⚠️') + ' ' + txt + '</div>'; }
  var lastManifest = null;

  window.ekvScanRun = async function () {
    var out = document.getElementById('ekvScanOut'); if (!out) return;
    out.innerHTML = '<p>⏳ Scan चल रहा है...</p>';
    var html = '', bad = 0, warn = 0;
    function add(ok, t) { html += line(ok, t); if (ok === false) bad++; else if (ok === null) warn++; }
    var secure = location.protocol === 'https:' || location.hostname === 'localhost';
    add(secure, secure ? 'वेबसाइट सुरक्षित कनेक्शन (HTTPS) पर है' : 'वेबसाइट HTTPS पर नहीं है — असुरक्षित!');
    var csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    add(!!csp, csp ? 'Security Policy (CSP) लगी है — अनजान बाहरी Script चलने से रुकेगा' : 'Security Policy (CSP) नहीं मिली');
    var hosts = {}, extScripts = [];
    document.querySelectorAll('script[src]').forEach(function (s) { try { var u = new URL(s.src, location.href); if (u.origin !== location.origin) extScripts.push(u.hostname); } catch (e) {} });
    var badS = extScripts.filter(function (h) { return OKH.indexOf(h) < 0; });
    add(badS.length === 0, badS.length ? 'अनजान बाहरी Script: ' + esc(badS.join(', ')) : 'इस पेज पर कोई अनजान बाहरी Script नहीं');
    var ifr = Array.prototype.filter.call(document.querySelectorAll('iframe'), function (f) { try { return OKH.indexOf(new URL(f.src, location.href).hostname) < 0; } catch (e) { return true; } });
    add(ifr.length === 0, ifr.length ? 'अनजान iframe मिला' : 'कोई अनजान iframe नहीं');
    var noRel = document.querySelectorAll('a[target="_blank"]:not([rel*="noopener"])').length;
    add(noRel === 0 ? true : null, noRel ? noRel + ' बाहरी लिंक में rel="noopener" नहीं' : 'बाहरी लिंक सुरक्षित (noopener) हैं');

    // ---- Manifest ----
    var man = null;
    try { var r = await fetch('integrity-manifest.json?_=' + Date.now(), { cache: 'no-store' }); if (r.ok) man = await r.json(); } catch (e) {}
    var cur = {}, changed = [], missing = [], risky = [], newHosts = {};
    for (var i = 0; i < FILES.length; i++) {
      var f = FILES[i];
      try {
        var res = await fetch(f + '?_=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) { if (man && man.files && man.files[f]) missing.push(f); continue; }
        var txt = await res.text();
        cur[f] = await sha(txt);
        if (man && man.files && man.files[f] && man.files[f] !== cur[f]) changed.push(f);
        if (!IGNORE_RISK[f] && /\.(js|html)$/.test(f)) {
          RISK.forEach(function (rk) { if (rk[0].test(txt) && (ALLOW[f] || []).indexOf(rk[1]) < 0) risky.push(f + ' → ' + rk[1]); });
          (txt.match(/https?:\/\/[a-z0-9.-]+/gi) || []).forEach(function (u) { var h = u.replace(/^https?:\/\//i, '').toLowerCase(); if (OKH.indexOf(h) < 0) newHosts[h] = f; });
        }
      } catch (e) { /* file nahi mili — ignore */ }
    }
    lastManifest = cur;
    if (!man) add(null, 'integrity-manifest.json नहीं मिली — फ़ाइलों का मिलान नहीं हो सका (नीचे "नया Manifest" बनाकर GitHub पर डालें)');
    else {
      add(changed.length === 0, changed.length ? 'ये फ़ाइलें Manifest से अलग हैं (' + changed.length + '): <b>' + esc(changed.join(', ')) + '</b> — अगर आपने खुद बदली हैं तो ठीक; वरना तुरंत GitHub की History देखें' : 'सभी ' + Object.keys(cur).length + ' फ़ाइलें बिल्कुल वही हैं जो डाली गई थीं');
      if (missing.length) add(null, 'Manifest में हैं पर Website पर नहीं: ' + esc(missing.join(', ')));
    }
    add(risky.length === 0, risky.length ? 'संदिग्ध code: ' + esc(risky.slice(0, 6).join('; ')) : 'कोई संदिग्ध (छुपा हुआ/खतरनाक) code नहीं मिला');
    var nh = Object.keys(newHosts);
    add(nh.length === 0 ? true : null, nh.length ? 'फ़ाइलों में ये अनजान Website नाम मिले: ' + esc(nh.slice(0, 8).map(function (h) { return h + ' (' + newHosts[h] + ')'; }).join(', ')) : 'फ़ाइलों में सिर्फ़ जाने-पहचाने Website नाम हैं');
    var sw = 'serviceWorker' in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0;
    add(sw > 0 ? true : null, sw ? 'ऐप (Service Worker) सही चल रहा है' : 'Service Worker अभी चालू नहीं');

    var head = bad ? '<p class="scan-h bad">❌ ' + bad + ' गंभीर बात मिली — नीचे देखें</p>' : warn ? '<p class="scan-h warn">⚠️ सब ठीक है, पर ' + warn + ' बात देखने लायक है</p>' : '<p class="scan-h ok">🎉 सब ठीक है — कोई खतरा नहीं मिला</p>';
    out.innerHTML = head + html + '<button class="btn" style="margin-top:10px;background:#f1f4f9;border:1px solid #cfd6e0;color:#0B1F3A;width:100%;justify-content:center;" onclick="ekvScanManifest()">⬇ नया Manifest बनाएँ (बदलाव के बाद)</button>' +
      '<p style="font-size:11.5px;color:#6b778c;margin-top:6px;">ध्यान: यह Scan सिर्फ़ Website की फ़ाइलें और Security सेटिंग जाँचता है। असली बचाव — Google/GitHub Account पर 2-Step Verification, मज़बूत Password, और Apps Script का Password न बाँटना। (गाइड: 4_guides/05_Suraksha_Guide.md)</p>';
    try { localStorage.setItem('ekv_last_scan', JSON.stringify({ t: Date.now(), bad: bad, warn: warn })); } catch (e) {}
  };
  window.ekvScanManifest = function () {
    if (!lastManifest) { alert('पहले Scan चलाएँ।'); return; }
    var blob = new Blob([JSON.stringify({ made: new Date().toISOString(), files: lastManifest }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'integrity-manifest.json'; a.style.display = 'none'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  };
})();
