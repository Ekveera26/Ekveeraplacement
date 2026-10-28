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
             'facebook.com', 'chat.whatsapp.com', 'www.gstatic.com', 'fcm.googleapis.com', 'fcmregistrations.googleapis.com', 'firebaseinstallations.googleapis.com', 'purl.oclc.org', 'openxmlformats.org', 'www.apache.org', 'jszip.com', 'stuk.github.io', 'docx.js.org', 'github.io', 'fb.me'];
  var FILES = ['staff-payout.js', 'ads.js', 'i18n-gu.js', 'i18n-mr.js', 'site-controls.js', 'staff-team.js', 'index.html', 'training.html', 'placement.html', 'help.html', 'resume-builder.html', 'styles.css', 'app.js', 'i18n.js', 'i18n-en.js', 'staff-ref.js', 'company-form.js',
               'registration-forms.js', 'apply-job.js', 'company-details.js', 'reviews.js', 'staff-profile.js', 'staff-profile-admin.js', 'staff-profile.html', 'payment-log.js', 'receipt.js', 'staff-pay.js', 'training-attendance.js', 'help-center.js',
               'resume-builder.js', 'for-rent.html', 'terms.html', 'for-rent.js', 'push.js', 'training-address.js', 'my-ids.js', 'party-admin.js', 'rent-admin.js', 'address-admin.js', 'home-service.html', 'home-service.js', 'tution.html', 'tution.js', 'register.html', 'register.js', 'contractor.html', 'contractor.js', 'mp-loc.js', 'help-more.js', 'trust-notes.js', 'privacy.html', 'delete-data.html', 'help-note.js', 'staff-link-admin.js', 'swipe-nav.js', 'admin-extra.js', 'ekv-scan.js', 'service-worker.js', 'manifest.json', 'docx.min.js'];
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
    add(secure, secure ? 'वेबसाइट सुरक्षित कनेक्शन (HTTPS) पर है' : 'वेबसाइट HTTPS पर नहीं है — असुरक्षित!<br><span class="scan-do">👉 क्या करें: GitHub Pages के Settings → Pages में "Enforce HTTPS" चालू करें और Link https:// से खोलें।</span>');
    var csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    add(!!csp, csp ? 'Security Policy (CSP) लगी है — अनजान बाहरी Script चलने से रुकेगा' : 'Security Policy (CSP) नहीं मिली<br><span class="scan-do">👉 क्या करें: index.html की &lt;head&gt; में Content-Security-Policy वाली &lt;meta&gt; लाइन वापस जोड़ें (पुराने सही Version से Copy करें)।</span>');
    var hosts = {}, extScripts = [];
    document.querySelectorAll('script[src]').forEach(function (s) { try { var u = new URL(s.src, location.href); if (u.origin !== location.origin) extScripts.push(u.hostname); } catch (e) {} });
    var badS = extScripts.filter(function (h) { return OKH.indexOf(h) < 0; });
    add(badS.length === 0, badS.length ? 'अनजान बाहरी Script: ' + esc(badS.join(', ')) + '<br><span class="scan-do">👉 क्या करें: जिस पेज में यह Script जुड़ी है उसका HTML खोलकर वह &lt;script src=...&gt; लाइन हटाएँ (अगर आपने नहीं जोड़ी)। नीचे Step 2-3 भी करें।</span>' : 'इस पेज पर कोई अनजान बाहरी Script नहीं');
    var ifr = Array.prototype.filter.call(document.querySelectorAll('iframe'), function (f) { try { return OKH.indexOf(new URL(f.src, location.href).hostname) < 0; } catch (e) { return true; } });
    add(ifr.length === 0, ifr.length ? 'अनजान iframe मिला<br><span class="scan-do">👉 क्या करें: उस पेज के HTML से अनजान &lt;iframe&gt; लाइन हटाएँ और नीचे Step 2-3 करें।</span>' : 'कोई अनजान iframe नहीं');
    var noRel = document.querySelectorAll('a[target="_blank"]:not([rel*="noopener"])').length;
    add(noRel === 0 ? true : null, noRel ? noRel + ' बाहरी लिंक में rel="noopener" नहीं' : 'बाहरी लिंक सुरक्षित (noopener) हैं');

    // ---- Manifest ----
    var man = null;
    try { var r = await fetch('integrity-manifest.json?_=' + Date.now(), { cache: 'no-store' }); if (r.ok) man = await r.json(); } catch (e) {}
    var cur = {}, changed = [], missing = [], risky = [], newHosts = {};
    var LIST = FILES.slice(); if (man && man.files) Object.keys(man.files).forEach(function (k) { if (LIST.indexOf(k) < 0) LIST.push(k); });   // Manifest की हर नई File भी जाँचो
    for (var i = 0; i < LIST.length; i++) {
      var f = LIST[i];
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
      add(changed.length === 0, changed.length ? 'ये फ़ाइलें Manifest से अलग हैं (' + changed.length + '): <b>' + esc(changed.join(', ')) + '</b><br><span class="scan-do">👉 क्या करें: अगर आपने ये फ़ाइलें अभी खुद बदली/डाली हैं → नीचे "नया Manifest बनाएँ" दबाकर उसे GitHub पर डालें। अगर आपने नहीं बदलीं → नीचे "गड़बड़ मिले तो क्या करें" का Step 1-4 करें।</span>' : 'सभी ' + Object.keys(cur).length + ' फ़ाइलें बिल्कुल वही हैं जो डाली गई थीं');
      if (missing.length) add(null, 'Manifest में हैं पर Website पर नहीं: ' + esc(missing.join(', ')));
    }
    add(risky.length === 0, risky.length ? 'संदिग्ध code: ' + esc(risky.slice(0, 6).join('; ')) + '<br><span class="scan-do">👉 क्या करें: यह वह file है जिसमें छुपा/खतरनाक code मिला। अगर आपने इसमें खुद ऐसा कुछ नहीं डाला → GitHub पर उस file की History खोलकर पुराना सही Version "Revert" करें (नीचे Step 2)।</span>' : 'कोई संदिग्ध (छुपा हुआ/खतरनाक) code नहीं मिला');
    var nh = Object.keys(newHosts);
    add(nh.length === 0 ? true : null, nh.length ? 'फ़ाइलों में ये अनजान Website नाम मिले: ' + esc(nh.slice(0, 8).map(function (h) { return h + ' (' + newHosts[h] + ')'; }).join(', ')) : 'फ़ाइलों में सिर्फ़ जाने-पहचाने Website नाम हैं');
    var sw = 'serviceWorker' in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0;
    add(sw > 0 ? true : null, sw ? 'ऐप (Service Worker) सही चल रहा है' : 'Service Worker अभी चालू नहीं');
    // v18: ज़िला/तहसील/गाँव की सूची (data/MP.json) जाँच — For Rent, Tution, Home Service इसी से चलते हैं
    try {
      var mr = await fetch('data/MP.json?_=' + Date.now(), { cache: 'no-store' });
      if (!mr.ok) throw 0;
      var md = await mr.json(), nd = Object.keys(md).length, nt = 0; Object.keys(md).forEach(function (k) { nt += Object.keys(md[k]).length; });
      add(nd > 40, nd > 40 ? 'ज़िला/तहसील/गाँव की सूची (data/MP.json) ठीक है — ' + nd + ' ज़िले, ' + nt + ' तहसील' : 'data/MP.json अधूरी है (सिर्फ़ ' + nd + ' ज़िले)<br><span class="scan-do">👉 क्या करें: ZIP वाली पूरी data/MP.json फ़ाइल GitHub पर "data" फ़ोल्डर में दोबारा डालें।</span>');
    } catch (e) { add(false, 'ज़िला/तहसील/गाँव की सूची (data/MP.json) नहीं मिली<br><span class="scan-do">👉 क्या करें: GitHub में "data" नाम का फ़ोल्डर बनाकर उसके अंदर MP.json डालें (रास्ता ठीक यही होना चाहिए: data/MP.json — बाहर या दूसरे नाम से नहीं)।</span>'); }

    var head = bad ? '<p class="scan-h bad">❌ ' + bad + ' गंभीर बात मिली — नीचे देखें</p>' : warn ? '<p class="scan-h warn">⚠️ सब ठीक है, पर ' + warn + ' बात देखने लायक है</p>' : '<p class="scan-h ok">🎉 सब ठीक है — कोई खतरा नहीं मिला</p>';
    out.innerHTML = head + html + '<button class="btn" style="margin-top:10px;background:#f1f4f9;border:1px solid #cfd6e0;color:#0B1F3A;width:100%;justify-content:center;" onclick="ekvScanManifest()">⬇ नया Manifest बनाएँ (बदलाव के बाद)</button>' +
      '<p style="font-size:11.5px;color:#6b778c;margin-top:6px;">ध्यान: यह Scan सिर्फ़ Website की फ़ाइलें और Security सेटिंग जाँचता है। असली बचाव — Google/GitHub Account पर 2-Step Verification, मज़बूत Password, और Apps Script का Password न बाँटना। (गाइड: 4_guides/05_Suraksha_Guide.md)</p>';
    out.insertAdjacentHTML('beforeend', '<button class="btn" style="margin-top:8px;background:#f1f4f9;border:1px solid #cfd6e0;color:#0B1F3A;width:100%;justify-content:center;" onclick="ekvScanCopy()">📋 रिपोर्ट Copy करें</button>' + scanHelp());
    try { localStorage.setItem('ekv_last_scan', JSON.stringify({ t: Date.now(), bad: bad, warn: warn })); } catch (e) {}
  };

  function scanHelp() {
    return '<details class="scan-help" style="margin-top:12px;border:1px solid #dfe5ee;border-radius:10px;padding:10px 14px;background:#fffdf5"><summary style="cursor:pointer;font-weight:800">🆘 Scan में गड़बड़ / Virus / Malware / Spyware मिले तो क्या करें</summary>' +
      '<div style="font-size:13px;line-height:1.75;margin-top:8px">' +
      '<p><b>पहले समझ लें:</b> आपकी Website की फ़ाइलें GitHub पर रहती हैं, इसलिए Website खुद Virus नहीं "पकड़ती"। असली खतरा दो जगह से आता है — (1) कोई आपके GitHub / Google Account में घुसकर फ़ाइल बदल दे, (2) आपके Computer / Phone में Virus हो जिससे Password चोरी हो। नीचे के Step दोनों के लिए हैं।</p>' +
      '<p><b>Step 1 — पक्का करें कि बदलाव किसने किया:</b> GitHub में Repository खोलें → उस फ़ाइल पर क्लिक → <b>History</b>। अगर आख़िरी बदलाव आपका या आपके Developer का है → ठीक है, "नया Manifest बनाएँ" दबाकर उसे GitHub पर डालें। अगर किसी अनजान नाम / समय का है → Step 2।</p>' +
      '<p><b>Step 2 — गड़बड़ वाली फ़ाइल हटाएँ (सुरक्षित तरीका):</b> History में पिछला सही Version खोलें → <b>"Revert"</b> (या पुरानी सही फ़ाइल दोबारा Upload करें)। अनजान फ़ाइल (जो आपने नहीं डाली) GitHub में खोलकर 🗑 <b>Delete</b> करें। <b>अपने Computer में फ़ाइलें कभी हाथ से Delete/Edit न करें</b> — बस GitHub से सही Version वापस लाएँ। हर बदलाव से पहले पूरा Folder Zip करके Backup रखें।</p>' +
      '<p><b>Step 3 — Password और पहुँच बंद करें:</b> GitHub का Password बदलें और <b>2-Step Verification</b> चालू करें → Settings → <b>Sessions / SSH keys / Personal access tokens / Applications</b> में जो अनजान दिखे हटा दें → Repository → Settings → <b>Collaborators</b> में अनजान नाम हटाएँ। वही सब Google Account (जिसमें Apps Script है) के लिए करें और Apps Script में <b>Deploy → Manage deployments</b> देखें कि कोई अनजान Version न हो। Razorpay / Email के Password भी बदलें।</p>' +
      '<p><b>Step 4 — अपना Computer / Phone साफ़ करें:</b> Computer: Windows Security → Virus &amp; threat protection → <b>Full scan</b> (फिर Microsoft Defender Offline scan); चाहें तो Malwarebytes (मुफ़्त) से दोबारा scan। Phone: Play Store → Play Protect → Scan; जिन Apps को आपने नहीं डाला या जो Accessibility / Device-admin माँगें उन्हें Uninstall करें। Browser में अनजान Extension हटाएँ। Spyware का शक हो तो Phone को Factory Reset करके ही नए Password डालें।</p>' +
      '<p><b>Step 5 — दोबारा Scan:</b> सब ठीक करके Website दोबारा Deploy होने दें, फिर यहाँ "अभी Scan करें" दबाएँ। सब ✅ आए तो "नया Manifest बनाएँ" से Manifest बनाकर GitHub पर डालें, ताकि अगली बार सही Version से मिलान हो।</p>' +
      '<p><b>⚠️ ज़रूरी:</b> यह Scan खुद कोई फ़ाइल नहीं हटाता / बदलता — जानबूझकर, ताकि कोई सही फ़ाइल गलती से न बिगड़े। हटाना या वापस लाना सिर्फ़ GitHub से, आपकी जानकारी में होता है।</p>' +
      '<p style="margin-bottom:0"><b>मदद चाहिए?</b> Scan की पूरी रिपोर्ट (नीचे "रिपोर्ट Copy करें") भेजें — Head Office 9766284669।</p></div></details>';
  }
  window.ekvScanCopy = function () {
    var t = (document.getElementById('ekvScanOut') || {}).innerText || '';
    try { navigator.clipboard.writeText(t); alert('रिपोर्ट Copy हो गई — भेज सकते हैं।'); } catch (e) { prompt('यह रिपोर्ट Copy करें:', t); }
  };
  window.ekvScanManifest = function () {
    if (!lastManifest) { alert('पहले Scan चलाएँ।'); return; }
    var blob = new Blob([JSON.stringify({ made: new Date().toISOString(), files: lastManifest }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'integrity-manifest.json'; a.style.display = 'none'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  };
})();
