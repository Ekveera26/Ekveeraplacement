/* EkVeera — Website ke Registration Forms (Google Form ki jagah)
   1) candidate = Resume For Upload   2) training = Admission For Training   3) company = Requirement Of Candidate
   Data backend (EkVeera_Registration.gs) ke zariye usi Response sheet mein jata hai jismein Google Form jata tha.
   Ye file app.js ke BAAD load hoti hai (SEARCH_WEB_APP_URL app.js se aata hai). */
(function () {
  'use strict';

  var WA = '919766284669';
  var GENDER = [['Male', 'पुरुष (Male)'], ['Female', 'महिला (Female)'], ['Other', 'अन्य (Other)']];
  var QUAL = ['8th Pass', '10th Pass', '12th Pass', 'ITI / Diploma', 'Graduate', 'Post Graduate', 'Other'];
  var QUAL_TRAIN = ['12th Pass', 'ITI / Diploma', 'Graduate', 'Post Graduate', 'Other'];
  var JOBTYPE = ['Full Time', 'Part Time', 'Work From Home', 'Any / कोई भी'];
  var JOBTYPE_CO = ['Full Time', 'Part Time', 'Work From Home', 'Contract'];
  var INDUSTRY = ['Call Center / BPO', 'IT / Software', 'Manufacturing / Factory', 'Retail / Shop', 'Hotel / Restaurant', 'Hospital / Medical', 'School / Education', 'Construction', 'Transport / Logistics', 'Security Services', 'Bank / Finance / Insurance', 'Other'];
  var CATEGORY = ['Customer Support / Call Center', 'Sales / Marketing', 'Computer Operator / Data Entry', 'Accounts / Finance', 'Admin / HR / Office', 'Technician / ITI', 'Driver / Delivery', 'Security / Guard', 'Helper / Labour', 'Teaching / Training', 'Other'];
  var SALARY_CAND = ['₹8,000 से कम', '₹8,000 - ₹12,000', '₹12,000 - ₹18,000', '₹18,000 - ₹25,000', '₹25,000 से ज़्यादा', 'Negotiable / बातचीत से'];

  var FORMS = {
    candidate: {
      title: '📄 Resume For Upload — Candidate Registration',
      intro: 'अपनी जानकारी और Resume भरें। जमा करते ही आपकी <strong>Candidate ID (जैसे CAND001)</strong> यहीं स्क्रीन पर दिख जाएगी और Email पर भी आएगी।',
      consent: 'मैं अपनी जानकारी सभी प्रकार की Company को देने के लिए EkVeera Placement & Consulting Services को अनुमति देता/देती हूं।',
      groups: [
        ['👤 आपकी जानकारी', [
          { k: 'name', l: 'पूरा नाम', t: 'text', req: 1, max: 80, ph: 'जैसे: Ramesh Kumar' },
          { k: 'mobile number', l: 'Mobile Number', t: 'tel', req: 1, ph: '10 अंकों का नंबर', mob: 1 },
          { k: 'email id', l: 'Email ID', t: 'email', req: 1, max: 120, ph: 'name@gmail.com', help: 'ID और जानकारी इसी Email पर आएगी — सही Email डालें' },
          { k: 'gender', l: 'लिंग (Gender)', t: 'select', opts: GENDER },
          { k: 'age', l: 'उम्र (Age)', t: 'number', min: 14, max: 70, ph: 'जैसे: 24' },
          { k: 'city', l: 'शहर / गांव (City)', t: 'text', req: 1, max: 60, ph: 'जैसे: Satna' }
        ]],
        ['🎓 योग्यता और अनुभव', [
          { k: 'qualification', l: 'योग्यता (Qualification)', t: 'select', req: 1, opts: QUAL },
          { k: 'experience (years)', l: 'अनुभव (कितने साल) — Fresher हों तो 0', t: 'number', min: 0, max: 50, ph: '0' },
          { k: 'key skills', l: 'मुख्य Skills', t: 'text', req: 1, max: 200, ph: 'जैसे: MS Excel, Typing, Communication', full: 1 }
        ]],
        ['💼 कैसी Job चाहिए', [
          { k: 'job description', l: 'कैसी Job / कौन सा काम चाहिए', t: 'textarea', max: 300, ph: 'जैसे: Computer Operator, Tele Caller, Office Boy...', full: 1 },
          { k: 'salary range (₹)', l: 'उम्मीद की Salary', t: 'select', opts: SALARY_CAND },
          { k: 'job type', l: 'Job का प्रकार', t: 'select', opts: JOBTYPE }
        ]],
        ['📎 Resume', [
          { k: 'file', l: 'अपना Resume Upload करें (PDF / Word, 3 MB तक)', t: 'file', req: 1, full: 1 },
          { k: 'remarks', l: 'कोई और बात (वैकल्पिक)', t: 'textarea', max: 300, full: 1 }
        ]]
      ]
    },
    training: {
      title: '🎓 Admission For Training',
      intro: '15 दिन की Call Center Training (रोज़ 1 घंटा, Google Meet) — <strong>Fee ₹99</strong>। प्रवेश योग्यता: 12वीं पास या Graduate। जमा करते ही आपकी <strong>Training ID (जैसे TRA-CAND001)</strong> और Payment Link यहीं दिख जाएगा।',
      consent: 'मैं अपनी जानकारी सभी प्रकार की Company को देने के लिए EkVeera Placement & Consulting Services को अनुमति देता/देती हूं।',
      groups: [
        ['👤 आपकी जानकारी', [
          { k: 'name', l: 'पूरा नाम', t: 'text', req: 1, max: 80, ph: 'जैसे: Ramesh Kumar', help: 'ID Card और Certificate पर यही नाम आएगा' },
          { k: 'mobile number', l: 'Mobile Number', t: 'tel', req: 1, ph: '10 अंकों का नंबर', mob: 1 },
          { k: 'email id', l: 'Email ID', t: 'email', req: 1, max: 120, ph: 'name@gmail.com', help: 'ID, Batch और Payment Link इसी Email पर आएगा' },
          { k: 'gender', l: 'लिंग (Gender)', t: 'select', opts: GENDER },
          { k: 'age', l: 'उम्र (Age)', t: 'number', min: 14, max: 70, ph: 'जैसे: 20' },
          { k: 'city', l: 'शहर / गांव (City)', t: 'text', req: 1, max: 60, ph: 'जैसे: Maihar' },
          { k: 'qualification', l: 'योग्यता (Qualification)', t: 'select', req: 1, opts: QUAL_TRAIN },
          { k: 'remarks', l: 'कोई और बात (वैकल्पिक)', t: 'textarea', max: 300, full: 1 }
        ]]
      ]
    },
    company: {
      title: '🏢 Requirement Of Candidate — Company Registration',
      intro: 'अपनी Company और Job की Requirement भरें। जमा करते ही आपकी <strong>Company ID (जैसे COMP001)</strong> यहीं दिख जाएगी और Email पर भी आएगी।',
      consent: 'मैं अपनी जानकारी सभी प्रकार के Candidate को देने के लिए EkVeera Placement & Consulting Services को अनुमति देता/देती हूं।',
      groups: [
        ['🏢 Company की जानकारी', [
          { k: 'company name', l: 'Company का नाम', t: 'text', req: 1, max: 120 },
          { k: 'industry type', l: 'Industry का प्रकार', t: 'select', opts: INDUSTRY },
          { k: 'contact person', l: 'संपर्क व्यक्ति का नाम', t: 'text', req: 1, max: 80 },
          { k: 'contact number', l: 'Contact Number (Mobile)', t: 'tel', req: 1, ph: '10 अंकों का नंबर', mob: 1 },
          { k: 'email id', l: 'Email ID', t: 'email', req: 1, max: 120, ph: 'hr@company.com', help: 'Company ID इसी Email पर आएगी' },
          { k: 'city', l: 'शहर (City)', t: 'text', req: 1, max: 60 },
          { k: 'address', l: 'पूरा पता', t: 'textarea', max: 250, full: 1 }
        ]],
        ['💼 Job की Requirement', [
          { k: 'job title', l: 'Job का पद (Job Title)', t: 'text', req: 1, max: 100, ph: 'जैसे: Tele Caller' },
          { k: 'job category', l: 'Job Category', t: 'select', opts: CATEGORY },
          { k: 'job type', l: 'Job का प्रकार', t: 'select', opts: JOBTYPE_CO },
          { k: 'no. of openings', l: 'कितने Candidate चाहिए', t: 'number', req: 1, min: 1, max: 5000, ph: 'जैसे: 10' },
          { k: 'salary offered (₹)', l: 'Salary (₹ प्रति माह)', t: 'text', req: 1, max: 40, ph: 'जैसे: 12000 या 10000-15000' },
          { k: 'closing date', l: 'Requirement की आखिरी तारीख (Closing Date)', t: 'date', req: 1, help: 'इस तारीख के बाद आपकी Job Candidates को नहीं दिखेगी' },
          { k: 'job description', l: 'Job का विवरण (काम क्या होगा)', t: 'textarea', max: 400, full: 1 }
        ]],
        ['🎯 Candidate से अपेक्षा', [
          { k: 'min qualification', l: 'न्यूनतम योग्यता', t: 'select', opts: QUAL },
          { k: 'min experience', l: 'न्यूनतम अनुभव (साल) — Fresher हो तो 0', t: 'number', min: 0, max: 50, ph: '0' },
          { k: 'required skills', l: 'ज़रूरी Skills', t: 'text', max: 200, ph: 'जैसे: Hindi typing, Communication', full: 1 },
          { k: 'remarks', l: 'कोई और बात (वैकल्पिक)', t: 'textarea', max: 300, full: 1 }
        ]]
      ]
    }
  };

  /* ---------- CSS (isi file se judta hai — alag CSS file nahi chahiye) ---------- */
  var css = '.rf-host{display:none;margin-top:26px}.rf-box{background:#fff;border:1px solid var(--line,#dde3ec);border-radius:16px;padding:22px 22px 26px;max-width:860px;margin:0 auto;box-shadow:0 8px 28px rgba(15,31,58,.07)}' +
    '.rf-h{margin:0 0 6px;color:var(--navy,#0B1F3A);font-size:21px}.rf-intro{font-size:14px;color:#4a5568;margin:0 0 16px;line-height:1.55}' +
    '.rf-grp{margin:18px 0 6px;padding:8px 12px;background:#D9E1F2;border-radius:8px;font-weight:700;color:#0B1F3A;font-size:14.5px}' +
    '.rf-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px;margin-top:10px}.rf-f{display:flex;flex-direction:column;gap:5px}.rf-f.full{grid-column:1/-1}' +
    '.rf-f label{font-size:13px;font-weight:600;color:#2d3748}.rf-f label i{color:#c0392b;font-style:normal}' +
    '.rf-f input,.rf-f select,.rf-f textarea{padding:11px 12px;border:1px solid #cfd6e0;border-radius:10px;font-size:15px;font-family:inherit;background:#fff;width:100%;box-sizing:border-box}' +
    '.rf-f input:focus,.rf-f select:focus,.rf-f textarea:focus{outline:2px solid #1F9D95;border-color:#1F9D95}.rf-f textarea{min-height:74px;resize:vertical}' +
    '.rf-f small{font-size:12px;color:#6b778c}.rf-f.bad input,.rf-f.bad select,.rf-f.bad textarea{border-color:#c0392b;background:#fff6f5}.rf-err{color:#c0392b;font-size:12px;font-weight:600}' +
    '.rf-staff{background:#eef6ff;border:1px dashed #7aa7d9;border-radius:10px;padding:9px 12px;font-size:13px;color:#1f3b63;margin:12px 0 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap}' +
    '.rf-staff input{background:#e5eaf1!important;color:#33415c;font-weight:700;cursor:not-allowed;max-width:220px;padding:6px 10px;border:1px solid #c5cfdd;border-radius:8px}' +
    '.rf-consent{margin-top:16px;padding:12px 14px;background:#fff9e6;border:1px solid #efd98a;border-radius:10px;font-size:13.5px;display:flex;gap:10px;align-items:flex-start}.rf-consent input{margin-top:3px;width:18px;height:18px;flex:none}' +
    '.rf-warn{margin-top:12px;font-size:12.5px;color:#a33131;font-weight:600}.rf-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}' +
    '.rf-msg{margin-top:12px;font-size:14px;font-weight:700}.rf-hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0}' +
    '.rf-ok{text-align:center;padding:10px 6px}.rf-ok h3{color:#11766F;margin:6px 0 4px;font-size:22px}.rf-id{display:inline-block;margin:10px 0;padding:14px 26px;font-size:30px;font-weight:800;letter-spacing:1px;color:#0B1F3A;background:#E4F4EA;border:2px solid #8fd6a8;border-radius:14px}' +
    '.rf-ok p{color:#4a5568;font-size:14.5px;margin:6px 0}.rf-ok .btn{margin:6px 4px}.rf-tip{background:#fff9e6;border:1px solid #efd98a;border-radius:10px;padding:10px 14px;margin:12px auto;max-width:520px;font-size:13.5px;text-align:left}' +
    '@media (max-width:640px){.rf-grid{grid-template-columns:1fr}.rf-box{padding:16px 14px 22px}.rf-id{font-size:24px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function staffCode() {
    var s = '';
    try { s = (localStorage.getItem('ekveera_staff_ref') || '').trim(); } catch (e) {}
    return /^[A-Za-z0-9 _.\-]{1,40}$/.test(s) ? s : '';
  }
  function todayIso() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  var cur = null, openedAt = 0, sending = false, saveT = null;

  function draftKey(f) { return 'ekveera_reg_draft_' + f; }
  function saveDraft() {
    clearTimeout(saveT);
    saveT = setTimeout(function () {
      if (!cur) return;
      var d = {};
      FORMS[cur].groups.forEach(function (g) { g[1].forEach(function (f) {
        if (f.t === 'file') return; var i = $('rf_' + f.k.replace(/\W/g, '_')); if (i) d[f.k] = i.value; }); });
      try { localStorage.setItem(draftKey(cur), JSON.stringify(d)); } catch (e) {}
    }, 400);
  }
  function loadDraft(f) { try { return JSON.parse(localStorage.getItem(draftKey(f)) || '{}'); } catch (e) { return {}; } }

  function fieldEl(f, val) {
    var id = 'rf_' + f.k.replace(/\W/g, '_');
    var w = el('div', 'rf-f' + (f.full ? ' full' : ''));
    w.appendChild(el('label', null, esc(f.l) + (f.req ? ' <i>*</i>' : '')));
    w.lastChild.setAttribute('for', id);
    var inp;
    if (f.t === 'select') {
      inp = document.createElement('select');
      var o0 = document.createElement('option'); o0.value = ''; o0.textContent = '-- चुनें --'; inp.appendChild(o0);
      f.opts.forEach(function (o) {
        var v = Array.isArray(o) ? o[0] : o, lb = Array.isArray(o) ? o[1] : o;
        var op = document.createElement('option'); op.value = v; op.textContent = lb; inp.appendChild(op);
      });
      inp.value = val || '';
    } else if (f.t === 'textarea') {
      inp = document.createElement('textarea'); inp.value = val || ''; if (f.max) inp.maxLength = f.max;
    } else if (f.t === 'file') {
      inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else {
      inp = document.createElement('input'); inp.type = f.t === 'tel' ? 'tel' : f.t; inp.value = val || '';
      if (f.max && f.t === 'text') inp.maxLength = f.max; if (f.t === 'email') inp.maxLength = 120;
      if (f.t === 'tel') { inp.maxLength = 15; inp.inputMode = 'numeric'; }
      if (f.t === 'number') { inp.inputMode = 'numeric'; if (f.min != null) inp.min = f.min; if (f.max != null) inp.max = f.max; }
      if (f.t === 'date') inp.min = todayIso();
    }
    inp.id = id; if (f.ph) inp.placeholder = f.ph;
    inp.addEventListener('input', function () { w.classList.remove('bad'); var e = w.querySelector('.rf-err'); if (e) e.remove(); saveDraft(); });
    inp.addEventListener('change', function () { w.classList.remove('bad'); var e = w.querySelector('.rf-err'); if (e) e.remove(); });
    w.appendChild(inp);
    if (f.help) w.appendChild(el('small', null, esc(f.help)));
    return w;
  }

  window.regOpen = function (name) {
    var cfg = FORMS[name], host = $('regHost'); if (!cfg || !host) return;
    cur = name; openedAt = Date.now(); sending = false;
    var draft = loadDraft(name), sc = staffCode();
    host.textContent = '';
    var box = el('div', 'rf-box');
    box.appendChild(el('h3', 'rf-h', esc(cfg.title)));
    box.appendChild(el('p', 'rf-intro', cfg.intro));
    var warn = el('p', 'rf-warn', '⚠️ कृपया अपनी सही और सत्य जानकारी ही भरें। गलत/फ़र्ज़ी जानकारी पर कानूनी कार्रवाई हो सकती है। (Security Purpose)');
    box.appendChild(warn);
    if (sc) {
      var s = el('div', 'rf-staff', '🔒 <span>आपको यह Link जिस Staff से मिला:</span>');
      var si = document.createElement('input'); si.type = 'text'; si.id = 'rf_staff'; si.value = sc; si.readOnly = true; si.tabIndex = -1; si.setAttribute('aria-readonly', 'true');
      s.appendChild(si); s.appendChild(el('span', null, '<small>(बदला नहीं जा सकता)</small>'));
      box.appendChild(s);
    }
    cfg.groups.forEach(function (g) {
      box.appendChild(el('div', 'rf-grp', esc(g[0])));
      var grid = el('div', 'rf-grid');
      g[1].forEach(function (f) { grid.appendChild(fieldEl(f, draft[f.k])); });
      box.appendChild(grid);
    });
    var hp = el('div', 'rf-hp'); hp.innerHTML = '<label>Website<input type="text" id="rf_website" tabindex="-1" autocomplete="off"></label>'; box.appendChild(hp);
    var cons = el('label', 'rf-consent'); cons.innerHTML = '<input type="checkbox" id="rf_consent"><span>' + esc(cfg.consent) + ' <i style="color:#c0392b;font-style:normal">*</i></span>'; box.appendChild(cons);
    var acts = el('div', 'rf-actions');
    var sb = el('button', 'btn btn-primary', '✅ जमा करें'); sb.type = 'button'; sb.id = 'rfSubmit'; sb.style.cssText = 'flex:1;min-width:200px;justify-content:center;'; sb.onclick = submit;
    var cb = el('button', 'btn', 'बंद करें'); cb.type = 'button'; cb.style.cssText = 'background:#fff;border:1px solid #cfd6e0;color:#0B1F3A;'; cb.onclick = function () { host.style.display = 'none'; cur = null; };
    acts.appendChild(sb); acts.appendChild(cb); box.appendChild(acts);
    box.appendChild(el('p', 'rf-msg', '')); box.lastChild.id = 'rfMsg';
    host.appendChild(box); host.style.display = 'block';
    if (name === 'candidate') applyBuiltResume(box);
    setTimeout(function () { host.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
  };

  // Resume Builder se aaya ho to: bana hua Word Resume file-box mein lagao + naam/mobile/email pehle se bharo
  function applyBuiltResume(box) {
    var built = null, pre = null;
    try { built = JSON.parse(sessionStorage.getItem('ekveera_built_resume') || 'null'); pre = JSON.parse(localStorage.getItem('ekveera_resume_prefill') || 'null'); } catch (e) {}
    if (pre) Object.keys(pre).forEach(function (k) { var i = $('rf_' + k.replace(/\W/g, '_')); if (i && !i.value && pre[k]) { i.value = pre[k]; i.dispatchEvent(new Event('input')); } });
    if (!built || !built.b64) return;
    try {
      var bin = atob(built.b64), u8 = new Uint8Array(bin.length); for (var n = 0; n < bin.length; n++) u8[n] = bin.charCodeAt(n);
      var file = new File([u8], built.name, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      var dt = new DataTransfer(); dt.items.add(file); var fi = $('rf_file'); fi.files = dt.files;
      fi.parentNode.appendChild(el('small', null, '✅ आपका बनाया हुआ Resume (<strong>' + esc(built.name) + '</strong>) अपने-आप लग गया है — चाहें तो दूसरा चुन सकते हैं।'));
      sessionStorage.removeItem('ekveera_built_resume');
    } catch (e) { /* पुराना Browser: ख़ुद फ़ाइल चुननी होगी */ }
  }

  function setMsg(t, ok) { var m = $('rfMsg'); if (!m) return; m.style.color = ok ? '#11766F' : '#c0392b'; m.textContent = t; }
  function markBad(f, text) {
    var i = $('rf_' + f.k.replace(/\W/g, '_')); if (!i) return; var w = i.parentNode; w.classList.add('bad');
    var e = w.querySelector('.rf-err'); if (e) e.remove(); w.appendChild(el('span', 'rf-err', esc(text)));
  }
  function fileToB64(file) {
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1] || ''); }; r.onerror = rej; r.readAsDataURL(file); });
  }

  async function submit() {
    if (sending || !cur) return;
    var cfg = FORMS[cur], params = { action: 'submitregistration', form: cur }, firstBad = null, file = null;
    document.querySelectorAll('.rf-f.bad').forEach(function (w) { w.classList.remove('bad'); var e = w.querySelector('.rf-err'); if (e) e.remove(); });
    cfg.groups.forEach(function (g) { g[1].forEach(function (f) {
      var i = $('rf_' + f.k.replace(/\W/g, '_')); if (!i) return;
      var v = f.t === 'file' ? '' : String(i.value || '').trim(), bad = '';
      if (f.t === 'file') {
        file = i.files && i.files[0];
        if (!file && f.req) bad = 'कृपया Resume चुनें';
        else if (file) {
          if (!/\.(pdf|docx?)$/i.test(file.name)) bad = 'सिर्फ़ PDF या Word फ़ाइल चुनें';
          else if (file.size > 3 * 1024 * 1024) bad = 'फ़ाइल 3 MB से छोटी होनी चाहिए';
        }
      } else if (f.req && !v) bad = 'यह ज़रूरी है';
      else if (v && f.mob && v.replace(/\D/g, '').length < 10) bad = '10 अंकों का सही नंबर डालें';
      else if (v && f.t === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) bad = 'सही Email डालें (name@gmail.com)';
      else if (v && f.t === 'number' && (isNaN(Number(v)) || (f.min != null && Number(v) < f.min) || (f.max != null && Number(v) > f.max))) bad = 'सही संख्या डालें';
      else if (v && f.t === 'date' && v < todayIso()) bad = 'आज या आगे की तारीख चुनें';
      if (bad) { markBad(f, bad); if (!firstBad) firstBad = i; }
      else if (f.t !== 'file') params[f.k] = v;
    }); });
    var sc = $('rf_staff'); params['staff code'] = sc ? sc.value : '';
    if (firstBad) { setMsg('कृपया लाल निशान वाली जानकारी ठीक करें।', false); firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (!$('rf_consent').checked) { setMsg('आगे बढ़ने के लिए नीचे सहमति (✔) पर टिक करें।', false); $('rf_consent').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    params.consent = 'yes'; params.website = $('rf_website').value; params.elapsed = String(Math.round((Date.now() - openedAt) / 1000));

    sending = true;
    var btn = $('rfSubmit'), old = btn.textContent; btn.disabled = true; btn.textContent = '⏳ जमा हो रहा है...';
    setMsg('कृपया रुकें — आपकी जानकारी सुरक्षित की जा रही है, ID बनने में 10–40 सेकंड लग सकते हैं। पेज बंद न करें।', true);
    var ctrl = new AbortController(), to = setTimeout(function () { ctrl.abort(); }, 150000);
    try {
      if (file) params.fileBase64 = await fileToB64(file);
      var res = await fetch(SEARCH_WEB_APP_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params), signal: ctrl.signal });
      var data = await res.json();
      if (data && data.status === 'ok') { try { localStorage.removeItem(draftKey(cur)); } catch (e) {} showSuccess(cur, data, params); return; }
      setMsg((data && data.message) || 'कुछ गड़बड़ हो गई — दोबारा कोशिश करें।', false);
    } catch (err) {
      setMsg(err && err.name === 'AbortError'
        ? 'जवाब आने में ज़्यादा समय लग रहा है। कृपया दोबारा फॉर्म न भरें — 2 मिनट बाद "अपनी ID यहीं देखें" बॉक्स में अपना Mobile/Email डालकर ID देखें।'
        : 'Internet चेक करके दोबारा कोशिश करें।', false);
    } finally { clearTimeout(to); sending = false; btn.disabled = false; btn.textContent = old; }
  }

  function showSuccess(name, data, params) {
    var host = $('regHost'); host.textContent = '';
    var box = el('div', 'rf-box'), ok = el('div', 'rf-ok');
    var label = name === 'training' ? 'Training ID' : name === 'company' ? 'Company ID' : 'Candidate ID';
    ok.appendChild(el('div', null, '<div style="font-size:46px">✅</div>'));
    ok.appendChild(el('h3', null, 'धन्यवाद! आपका फॉर्म जमा हो गया'));
    ok.appendChild(el('p', null, 'आपकी <strong>' + label + '</strong>:'));
    ok.appendChild(el('div', 'rf-id', esc(data.id || '— (Email देखें)')));
    var cp = el('div', null, ''); var cpb = el('button', 'btn', '📋 ID Copy करें'); cpb.type = 'button'; cpb.style.cssText = 'background:#fff;border:1px solid #cfd6e0;color:#0B1F3A;';
    cpb.onclick = function () { try { navigator.clipboard.writeText(data.id); cpb.textContent = '✅ Copy हो गई'; } catch (e) { window.prompt('ID Copy करें:', data.id); } };
    if (data.id) { cp.appendChild(cpb); ok.appendChild(cp); }
    ok.appendChild(el('p', null, '📧 यह ID आपके Email (<strong>' + esc(params['email id']) + '</strong>) पर भी भेजी गई है — Spam/Promotions folder भी देखें। इसे संभालकर रखें।'));
    if (name === 'training') {
      if (data.batch) ok.appendChild(el('p', null, '📅 आपका Batch: <strong>' + esc(data.batch) + '</strong> (शुरू होने की तारीख के लिए Help → "मेरा Batch कब शुरू होगा")'));
      if (data.payLink) {
        ok.appendChild(el('div', 'rf-tip', '💳 <strong>अगला कदम — ₹99 Training Fee:</strong> नीचे बटन से Pay करें (UPI / Card / Netbanking)। Payment के बाद अपना नाम + Payment Screenshot WhatsApp पर भेजें — तब आपको ID Card का Access Code मिलेगा।'));
        var pb = el('a', 'btn btn-primary', '💳 अभी ₹99 Pay करें'); pb.href = data.payLink; pb.target = '_blank'; pb.rel = 'noopener'; ok.appendChild(pb);
      } else {
        ok.appendChild(el('div', 'rf-tip', '💳 ₹99 Fee का Payment Link आपके Email में आएगा। अगर न आए तो नीचे WhatsApp बटन से हमें बताएं।'));
      }
      var wa = el('a', 'btn', '💬 Screenshot WhatsApp पर भेजें'); wa.style.cssText = 'background:#25D366;color:#fff;';
      wa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Namaste EkVeera, maine ₹99 training fee pay ki hai. Meri Training ID: ' + (data.id || '') + '. Payment screenshot share kar raha hoon.');
      wa.target = '_blank'; wa.rel = 'noopener'; ok.appendChild(wa);
    } else if (name === 'company') {
      ok.appendChild(el('div', 'rf-tip', '📋 <strong>अगला कदम:</strong> Candidate को बताने के लिए हमें आपसे यह जानकारी भी चाहिए — Duty Time, Salary, चाय-नाश्ता-खाना, रहना आदि (Company Benefits Form)।'));
      var nb = el('button', 'btn btn-primary', '📋 अभी Benefits Form भरें'); nb.type = 'button';
      nb.onclick = function () {
        host.style.display = 'none';
        var a = $('cfCompanyId'), b = $('cfCompanyName'), c = $('cfMobile'), d = $('cfContactName'), em = $('cfEmail');
        if (a) { a.value = data.id || ''; b.value = params['company name'] || ''; c.value = params['contact number'] || ''; d.value = params['contact person'] || ''; em.value = params['email id'] || '';
          [a, b, c, d, em].forEach(function (x) { x.dispatchEvent(new Event('input')); }); }
        if (window.cfShowPanel) window.cfShowPanel('online'); else location.href = 'placement.html?cid=' + encodeURIComponent(data.id || '') + '#companyinfo';
      };
      ok.appendChild(nb);
    } else {
      var sb = el('button', 'btn btn-primary', '🏢 अब Company / Job खोजें'); sb.type = 'button';
      sb.onclick = function () { host.style.display = 'none'; if (window.switchSearchTab) switchSearchTab('company'); var s = $('search'); if (s) s.scrollIntoView({ behavior: 'smooth' }); };
      ok.appendChild(sb);
      ok.appendChild(el('div', 'rf-tip', '💡 आपकी जानकारी Companies को Search में दिखेगी (आपका नाम/Mobile/Email छुपा रहता है)। Company पसंद करेगी तो आपको Email आएगा।'));
    }
    var again = el('button', 'btn', 'नया फॉर्म भरें'); again.type = 'button'; again.style.cssText = 'background:#fff;border:1px solid #cfd6e0;color:#0B1F3A;';
    again.onclick = function () { regOpen(name); }; ok.appendChild(again);
    box.appendChild(ok); host.appendChild(box); host.style.display = 'block';
    host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Training page: Payment Link kho gaya to Training ID + Mobile se dobara paana
  window.regGetPayLink = async function () {
    var id = $('plTid'), mob = $('plMob'), msg = $('plMsg'), btn = $('plBtn');
    if (!id || !mob) return;
    btn.style.display = 'none'; msg.style.color = '#334056';
    if (!id.value.trim() || mob.value.replace(/\D/g, '').length < 10) { msg.style.color = '#c0392b'; msg.textContent = 'Training ID और 10 अंकों का Mobile Number डालें।'; return; }
    msg.textContent = 'जांचा जा रहा है...';
    try {
      var d = await (await fetch(SEARCH_WEB_APP_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ action: 'getpaymentlink', kind: 'training', id: id.value.trim(), mobile: mob.value.trim() }) })).json();
      if (d.status !== 'ok') { msg.style.color = '#c0392b'; msg.textContent = d.message || 'Link नहीं मिला।'; return; }
      if (d.paid) { msg.style.color = '#11766F'; msg.textContent = '✅ आपका ₹99 Payment हो चुका है। अब ID Card के Access Code के लिए नीचे WhatsApp बटन दबाएं।'; return; }
      msg.style.color = '#11766F'; msg.textContent = (d.name ? d.name + ', ' : '') + 'यह रहा आपका Payment Link:'; btn.href = d.payLink; btn.style.display = 'inline-flex';
    } catch (e) { msg.style.color = '#c0392b'; msg.textContent = 'Internet चेक करके दोबारा कोशिश करें।'; }
  };

  // Link se seedha khulna:  ?open=candidate | company | training  (Help Center bhi yahi use karta hai)
  function init() {
    try {
      var o = new URLSearchParams(location.search).get('open');
      if (o && FORMS[o] && $('regHost')) setTimeout(function () { regOpen(o); }, 500);
    } catch (e) {}
  }
  window.__rf = { FORMS: FORMS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
