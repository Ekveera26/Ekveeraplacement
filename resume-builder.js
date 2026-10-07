/* EkVeera — Resume Builder (MS Word .docx banane wala, Free)
   Form bharo -> saamne Live Preview -> "Word (.docx) Download" ya "Is Resume se Job ke liye Register karo".
   Word file Browser mein hi banti hai (docx.min.js, isi site se) — koi data kisi server par nahi jata. */
(function () {
  'use strict';

  var THEMES = {
    navy:   { n: __t('गहरा नीला (Classic)'), main: '1F3864', light: 'DCE6F4' },
    teal:   { n: __t('हरा-नीला (Modern)'),   main: '11766F', light: 'D8EFEC' },
    maroon: { n: __t('मरून (Formal)'),        main: '7B1E2B', light: 'F4DEE1' },
    black:  { n: __t('काला-सफ़ेद (Simple)'), main: '222222', light: 'E9E9E9' },
    purple: { n: __t('जामुनी (Royal)'),       main: '4B2E83', light: 'E7E0F4' },
    orange: { n: __t('नारंगी (Energetic)'),   main: 'C2571A', light: 'FBE6D6' },
    green:  { n: __t('हरा (Fresh)'),          main: '2E7D32', light: 'DDEFDD' },
    slate:  { n: __t('स्लेट (Premium)'),      main: '334155', light: 'E8EDF3' }
  };
  var LAYOUTS = {
    classic: __t('Classic (सीधा)'),
    banner:  __t('Banner (ऊपर रंगीन पट्टी)'),
    sidebar: __t('Modern (साइड कॉलम)')
  };
  var DRAFT = 'ekveera_resume_draft_v1';
  var D = fresh();

  function fresh() {
    return { theme: 'navy', layout: 'classic', link: '', achievements: '', photo: '', name: '', title: '', mobile: '', email: '', address: '', dob: '', gender: '', marital: '', languages: '',
      objective: '', fresher: false,
      edu: [{ deg: '', inst: '', year: '', score: '' }, { deg: '', inst: '', year: '', score: '' }, { deg: '', inst: '', year: '', score: '' }],
      exp: [{ co: '', role: '', from: '', to: '', points: '' }],
      skills: '', extras: '', strengths: '', hobbies: '', decl: true, place: '', date: '' };
  }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function lines(s) { return String(s || '').split(/\r?\n|;/).map(function (x) { return x.replace(/^[\s\-•*·]+/, '').trim(); }).filter(Boolean); }
  function items(s) { return String(s || '').split(/\r?\n|,/).map(function (x) { return x.replace(/^[\s\-•*·]+/, '').trim(); }).filter(Boolean); }
  function fmtDate(iso) { var m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? m[3] + '-' + m[2] + '-' + m[1] : (iso || ''); }
  function hasEdu(e) { return e.deg || e.inst || e.year || e.score; }
  function hasExp(e) { return e.co || e.role || e.points; }

  /* ================= FORM ================= */
  var SECTIONS = [
    { t: __t('👤 निजी जानकारी (Personal Details)'), open: 1, f: [
      { k: 'name', l: __t('पूरा नाम *'), ph: __t('जैसे: Ramesh Kumar'), full: 1, max: 60 },
      { k: 'title', l: __t('किस पद / Job के लिए (Resume का Title)'), ph: __t('जैसे: Tele Caller / Computer Operator'), full: 1, max: 70 },
      { k: 'mobile', l: 'Mobile Number *', ph: __t('10 अंकों का नंबर'), type: 'tel', max: 15 },
      { k: 'email', l: 'Email ID *', ph: 'name@gmail.com', type: 'email', max: 80 },
      { k: 'address', l: __t('पता (Address)'), ph: __t('गांव/मोहल्ला, शहर, ज़िला, राज्य - पिन'), full: 1, max: 160 },
      { k: 'link', l: __t('LinkedIn / Portfolio Link (वैकल्पिक)'), ph: 'linkedin.com/in/yourname', full: 1, max: 100 },
      { k: 'dob', l: __t('जन्म तिथि (Date of Birth)'), type: 'date' },
      { k: 'gender', l: __t('लिंग'), sel: ['', 'Male', 'Female', 'Other'] },
      { k: 'marital', l: __t('वैवाहिक स्थिति'), sel: ['', 'Single', 'Married'] },
      { k: 'languages', l: __t('भाषाएं (Languages Known)'), ph: __t('जैसे: Hindi, English'), max: 70 }
    ] },
    { t: __t('🎯 Career Objective (अपने बारे में 2-3 लाइन)'), f: [
      { k: 'objective', l: '', ph: __t('जैसे: Customer Support क्षेत्र में एक मेहनती और सीखने के लिए उत्सुक पद पाना, जहाँ मैं अपनी Communication Skills का उपयोग कर कंपनी की तरक्की में योगदान दे सकूँ।'), ta: 1, full: 1, max: 400 }
    ] },
    { t: __t('🎓 शिक्षा (Educational Qualification)'), rep: 'edu' },
    { t: __t('💼 अनुभव (Work Experience)'), rep: 'exp' },
    { t: __t('🏆 उपलब्धियां (Key Achievements — वैकल्पिक)'), f: [
      { k: 'achievements', l: __t('हर उपलब्धि नई लाइन में — हो सके तो संख्या के साथ लिखें'), ph: 'Achieved 110% of monthly target\nEmployee of the Month — March 2025', ta: 1, full: 1, max: 500 }
    ] },
    { t: __t('🛠️ Skills (कौशल)'), f: [
      { k: 'skills', l: __t('अपनी Skills लिखें — हर Skill नई लाइन में या कॉमा से अलग'), ph: 'MS Word, MS Excel, Typing (Hindi/English), Communication, Customer Handling', ta: 1, full: 1, max: 500 }
    ] },
    { t: __t('📜 Certificates / Training / Projects (वैकल्पिक)'), f: [
      { k: 'extras', l: __t('हर बात नई लाइन में'), ph: 'Basic Computer Course (6 months)\nCall Center Training — EkVeera (15 days)', ta: 1, full: 1, max: 600 }
    ] },
    { t: __t('⭐ ताकत और शौक (वैकल्पिक)'), f: [
      { k: 'strengths', l: __t('Strengths (अपनी खूबियां)'), ph: 'Hard working, Team player, Quick learner', ta: 1, full: 1, max: 300 },
      { k: 'hobbies', l: __t('Hobbies (शौक)'), ph: 'Reading, Cricket, Music', full: 1, max: 160 }
    ] },
    { t: '✍️ Declaration', f: [] }
  ];

  function inputEl(f, val, onchange) {
    var el;
    if (f.sel) { el = document.createElement('select'); f.sel.forEach(function (o) { var op = document.createElement('option'); op.value = o; op.textContent = o || __t('-- चुनें --'); el.appendChild(op); }); el.value = val || ''; }
    else if (f.ta) { el = document.createElement('textarea'); el.value = val || ''; el.rows = 3; }
    else { el = document.createElement('input'); el.type = f.type || 'text'; el.value = val || ''; }
    if (f.ph) el.placeholder = f.ph; if (f.max && !f.sel) el.maxLength = f.max;
    el.addEventListener('input', function () { onchange(el.value); }); el.addEventListener('change', function () { onchange(el.value); });
    return el;
  }
  function field(f, val, onchange) {
    var w = document.createElement('div'); w.className = 'rb-f' + (f.full ? ' full' : '');
    if (f.l) { var lb = document.createElement('label'); lb.textContent = f.l; w.appendChild(lb); }
    w.appendChild(inputEl(f, val, onchange)); return w;
  }
  function addBtn(text, fn) { var b = document.createElement('button'); b.type = 'button'; b.className = 'rb-add'; b.textContent = text; b.onclick = fn; return b; }

  function renderForm() {
    var host = $('rbForm'); host.textContent = '';
    // theme + photo
    var top = document.createElement('div'); top.className = 'rb-card';
    top.innerHTML = __t('<h3>🎨 Resume का Style</h3><div class="rb-themes" id="rbThemes"></div>') +
      __t('<div class="rb-f full" style="margin-top:12px;"><label>📷 अपनी फोटो (वैकल्पिक — Passport Size)</label><input type="file" id="rbPhoto" accept="image/*"><div id="rbPhotoNote" class="rb-small"></div></div>');
    host.appendChild(top);
    var th = top.querySelector('#rbThemes');
    Object.keys(THEMES).forEach(function (k) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'rb-theme' + (D.theme === k ? ' on' : ''); b.innerHTML = '<span style="background:#' + THEMES[k].main + '"></span>' + THEMES[k].n;
      b.onclick = function () { D.theme = k; renderForm(); update(); }; th.appendChild(b);
    });
    var lay = document.createElement('div'); lay.className = 'rb-themes'; lay.style.marginTop = '4px';
    var layLb = document.createElement('div'); layLb.className = 'rb-small'; layLb.style.cssText = 'width:100%;font-weight:700;margin-top:6px;'; layLb.textContent = __t('Layout चुनें:');
    th.parentNode.insertBefore(layLb, th.nextSibling); th.parentNode.insertBefore(lay, layLb.nextSibling);
    Object.keys(LAYOUTS).forEach(function (k) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'rb-theme' + ((D.layout || 'classic') === k ? ' on' : ''); b.textContent = LAYOUTS[k];
      b.onclick = function () { D.layout = k; renderForm(); update(); }; lay.appendChild(b);
    });
    top.querySelector('#rbPhoto').addEventListener('change', onPhoto);
    if (D.photo) { top.querySelector('#rbPhotoNote').innerHTML = __t('✅ फोटो जुड़ गई — <a href="#" id="rbPhotoDel">हटाएं</a>'); top.querySelector('#rbPhotoDel').onclick = function (e) { e.preventDefault(); D.photo = ''; renderForm(); update(); }; }

    SECTIONS.forEach(function (s, si) {
      var det = document.createElement('details'); det.className = 'rb-card'; if (s.open) det.open = true;
      var sm = document.createElement('summary'); sm.textContent = s.t; det.appendChild(sm);
      var body = document.createElement('div'); body.className = 'rb-body'; det.appendChild(body);
      if (s.f) {
        var grid = document.createElement('div'); grid.className = 'rb-grid';
        s.f.forEach(function (f) { grid.appendChild(field(f, D[f.k], function (v) { D[f.k] = v; update(); })); });
        body.appendChild(grid);
      }
      if (s.rep === 'edu') {
        D.edu.forEach(function (e, i) {
          var row = document.createElement('div'); row.className = 'rb-rep';
          var g = document.createElement('div'); g.className = 'rb-grid';
          [{ k: 'deg', l: __t('डिग्री / कक्षा'), ph: __t('जैसे: B.A. / 12th / 10th'), max: 50 }, { k: 'inst', l: 'Board / University / School', ph: __t('जैसे: MP Board / A.P.S. University Rewa'), max: 80 },
           { k: 'year', l: __t('पास होने का वर्ष'), ph: '2024', max: 9 }, { k: 'score', l: __t('प्रतिशत / CGPA'), ph: '72%', max: 12 }]
            .forEach(function (f) { g.appendChild(field(f, e[f.k], function (v) { e[f.k] = v; update(); })); });
          row.appendChild(g);
          if (D.edu.length > 1) { var rm = addBtn(__t('✕ हटाएं'), function () { D.edu.splice(i, 1); renderForm(); update(); }); rm.className = 'rb-rm'; row.appendChild(rm); }
          body.appendChild(row);
        });
        if (D.edu.length < 6) body.appendChild(addBtn(__t('+ एक और शिक्षा जोड़ें'), function () { D.edu.push({ deg: '', inst: '', year: '', score: '' }); renderForm(); update(); }));
      }
      if (s.rep === 'exp') {
        var fr = document.createElement('label'); fr.className = 'rb-check';
        fr.innerHTML = '<input type="checkbox" id="rbFresher"' + (D.fresher ? ' checked' : '') + __t('> मैं Fresher हूं (अभी कोई अनुभव नहीं)');
        body.appendChild(fr); fr.querySelector('input').onchange = function (e) { D.fresher = e.target.checked; renderForm(); update(); };
        if (!D.fresher) {
          D.exp.forEach(function (e, i) {
            var row = document.createElement('div'); row.className = 'rb-rep';
            var g = document.createElement('div'); g.className = 'rb-grid';
            [{ k: 'co', l: __t('कंपनी / संस्था का नाम'), ph: __t('जैसे: ABC Call Centre, Satna'), max: 70 }, { k: 'role', l: __t('पद (Designation)'), ph: __t('जैसे: Tele Caller'), max: 50 },
             { k: 'from', l: __t('कब से'), ph: 'Jan 2023', max: 14 }, { k: 'to', l: __t('कब तक'), ph: 'Dec 2024 / Present', max: 14 },
             { k: 'points', l: __t('काम / ज़िम्मेदारियां (हर बात नई लाइन में)'), ph: __t('Outbound calls करना\nCustomer queries solve करना'), ta: 1, full: 1, max: 600 }]
              .forEach(function (f) { g.appendChild(field(f, e[f.k], function (v) { e[f.k] = v; update(); })); });
            row.appendChild(g);
            if (D.exp.length > 1) { var rm = addBtn(__t('✕ हटाएं'), function () { D.exp.splice(i, 1); renderForm(); update(); }); rm.className = 'rb-rm'; row.appendChild(rm); }
            body.appendChild(row);
          });
          if (D.exp.length < 5) body.appendChild(addBtn(__t('+ एक और अनुभव जोड़ें'), function () { D.exp.push({ co: '', role: '', from: '', to: '', points: '' }); renderForm(); update(); }));
        }
      }
      if (si === SECTIONS.length - 1) {
        var c = document.createElement('label'); c.className = 'rb-check';
        c.innerHTML = '<input type="checkbox" id="rbDecl"' + (D.decl ? ' checked' : '') + __t('> Resume के अंत में Declaration जोड़ें ("मैं घोषणा करता/करती हूं कि ऊपर दी गई जानकारी सही है")');
        body.appendChild(c); c.querySelector('input').onchange = function (e) { D.decl = e.target.checked; update(); };
        var g2 = document.createElement('div'); g2.className = 'rb-grid';
        g2.appendChild(field({ k: 'place', l: __t('स्थान (Place)'), ph: __t('जैसे: Maihar'), max: 40 }, D.place, function (v) { D.place = v; update(); }));
        g2.appendChild(field({ k: 'date', l: __t('दिनांक (Date)'), type: 'date' }, D.date, function (v) { D.date = v; update(); }));
        body.appendChild(g2);
      }
      host.appendChild(det);
    });
  }

  function onPhoto(e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    if (!/^image\//.test(f.type)) { msg(__t('कृपया फोटो (JPG/PNG) चुनें।'), false); return; }
    var img = new Image(), url = URL.createObjectURL(f);
    img.onload = function () {
      var maxW = 300, maxH = 380, r = Math.min(maxW / img.width, maxH / img.height, 1), w = Math.round(img.width * r), h = Math.round(img.height * r);
      var cv = document.createElement('canvas'); cv.width = w; cv.height = h; var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h); cx.drawImage(img, 0, 0, w, h);
      D.photo = cv.toDataURL('image/jpeg', 0.85); D.photoW = w; D.photoH = h; URL.revokeObjectURL(url); renderForm(); update();
    };
    img.onerror = function () { msg(__t('यह फोटो खुल नहीं पाई, दूसरी चुनें।'), false); };
    img.src = url;
  }

  /* ================= LIVE PREVIEW ================= */
  function preview() { if (D.layout === 'sidebar') previewSidebar(); else previewClassic(); renderScore(); }

  /* ---- Resume ki mazbooti (ATS jaisi jaanch) ---- */
  function scoreItems() {
    var sk = items(D.skills).length, hasExpPts = D.fresher || D.exp.some(function (e) { return hasExp(e) && lines(e.points).length >= 2; });
    return [
      [10, !!D.name.trim(), __t('अपना पूरा नाम भरें'), 'Add your full name'],
      [10, D.mobile.replace(/\D/g, '').length >= 10, __t('सही 10 अंकों का Mobile जोड़ें'), 'Add a valid 10-digit Mobile'],
      [10, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(D.email.trim()), __t('सही Email ID जोड़ें'), 'Add a valid Email ID'],
      [5, !!D.title.trim(), __t('Resume का Title (किस पद के लिए) लिखें'), 'Add a Resume Title (the role you want)'],
      [5, !!D.address.trim(), __t('अपना पता जोड़ें'), 'Add your address'],
      [10, D.objective.trim().length >= 60, __t('Career Objective कम से कम 2 लाइन का लिखें'), 'Write a Career Objective of at least 2 lines'],
      [10, D.edu.filter(hasEdu).length >= 1, __t('कम से कम एक शिक्षा जोड़ें'), 'Add at least one qualification'],
      [15, hasExpPts, __t('अनुभव में 2-3 काम की बातें लिखें (या Fresher चुनें)'), 'Write 2-3 points under experience (or tick Fresher)'],
      [15, sk >= 5 ? true : (sk >= 3 ? 0.5 : false), __t('कम से कम 5 Skills लिखें'), 'List at least 5 Skills'],
      [10, lines(D.extras).length + lines(D.achievements).length >= 1, __t('Certificate / Training या उपलब्धि जोड़ें'), 'Add a Certificate / Training or an achievement']
    ];
  }
  function renderScore() {
    var host = $('rbScore');
    if (!host) { var paper = $('rbPaper'); if (!paper) return; host = document.createElement('div'); host.id = 'rbScore'; host.className = 'rb-score'; paper.parentNode.insertBefore(host, paper); }
    var it = scoreItems(), tot = 0, tips = [];
    it.forEach(function (x) { var v = x[1] === true ? 1 : (x[1] || 0); tot += x[0] * v; if (v < 1) tips.push((window.EKV_LANG === 'en') ? x[3] : x[2]); });
    tot = Math.round(tot);
    var col = tot >= 80 ? '#1b7f3b' : (tot >= 50 ? '#c98a00' : '#c0392b');
    host.innerHTML = '<div class="rb-score-top"><b>' + __t('📊 Resume की मज़बूती') + '</b><span style="color:' + col + ';font-weight:800;">' + tot + '/100</span></div>' +
      '<div class="rb-score-bar"><i style="width:' + tot + '%;background:' + col + '"></i></div>' +
      (tips.length ? '<div class="rb-score-tips">💡 ' + tips.slice(0, 3).map(esc).join(' • ') + '</div>' : '<div class="rb-score-tips">✅ ' + __t('बहुत बढ़िया! आपका Resume पूरा और मज़बूत है।') + '</div>');
  }

  function previewSidebar() {
    var T = THEMES[D.theme], m = '#' + T.main, h = '';
    function lsec(t, inner) { return '<div class="pv-lsec">' + t + '</div>' + inner; }
    function rsec(t, inner) { return '<div class="pv-sec" style="color:' + m + ';border-bottom:1.5px solid ' + m + ';">' + t + '</div>' + inner; }
    var L = '', R = '';
    if (D.photo) L += '<div style="text-align:center;margin-bottom:8px"><img class="pv-photo" src="' + D.photo + '" alt="" style="border-color:#fff"></div>';
    var ct = []; if (D.mobile) ct.push('📞 ' + esc(D.mobile)); if (D.email) ct.push('✉ ' + esc(D.email)); if (D.address) ct.push('📍 ' + esc(D.address)); if (D.link) ct.push('🔗 ' + esc(D.link));
    L += lsec('CONTACT', '<div class="pv-lt">' + (ct.join('<br>') || 'Mobile | Email') + '</div>');
    var sk = items(D.skills); if (sk.length) L += lsec('SKILLS', '<div class="pv-lt">' + sk.map(function (x) { return '• ' + esc(x); }).join('<br>') + '</div>');
    var st = items(D.strengths); if (st.length) L += lsec('STRENGTHS', '<div class="pv-lt">' + st.map(function (x) { return '• ' + esc(x); }).join('<br>') + '</div>');
    var pd = [['DOB', fmtDate(D.dob)], ['Gender', D.gender], ['Marital', D.marital], ['Languages', D.languages]].filter(function (x) { return x[1]; });
    if (pd.length) L += lsec('PERSONAL', '<div class="pv-lt">' + pd.map(function (x) { return '<b>' + x[0] + ':</b> ' + esc(x[1]); }).join('<br>') + '</div>');
    if (D.hobbies.trim()) L += lsec('HOBBIES', '<div class="pv-lt">' + esc(items(D.hobbies).join(', ')) + '</div>');
    R += '<div class="pv-name" style="color:' + m + '">' + esc((D.name || __t('आपका नाम')).toUpperCase()) + '</div>' + (D.title ? '<div class="pv-title">' + esc(D.title) + '</div>' : '') + '<div class="pv-rule" style="background:' + m + '"></div>';
    if (D.objective.trim()) R += rsec('CAREER OBJECTIVE', '<p class="pv-p">' + esc(D.objective.trim()) + '</p>');
    var exp = D.fresher ? [] : D.exp.filter(hasExp);
    if (exp.length) R += rsec('WORK EXPERIENCE', exp.map(function (e) {
      return '<div class="pv-exp"><div class="pv-row"><b>' + esc(e.role) + (e.role && e.co ? ' — ' : '') + esc(e.co) + '</b><span>' + esc([e.from, e.to].filter(Boolean).join(' – ')) + '</span></div>' +
        (lines(e.points).length ? '<ul>' + lines(e.points).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' : '') + '</div>'; }).join(''));
    else if (D.fresher) R += rsec('WORK EXPERIENCE', '<p class="pv-p">Fresher</p>');
    var edu = D.edu.filter(hasEdu);
    if (edu.length) R += rsec('EDUCATION', edu.map(function (e) { return '<div class="pv-exp"><div class="pv-row"><b>' + esc(e.deg) + '</b><span>' + esc(e.year) + '</span></div><div>' + esc(e.inst) + (e.score ? ' — ' + esc(e.score) : '') + '</div></div>'; }).join(''));
    var ac = lines(D.achievements); if (ac.length) R += rsec('KEY ACHIEVEMENTS', '<ul>' + ac.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>');
    var ex = lines(D.extras); if (ex.length) R += rsec('CERTIFICATIONS / TRAINING', '<ul>' + ex.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>');
    if (D.decl) R += rsec('DECLARATION', '<p class="pv-p">I hereby declare that the information furnished above is true and correct to the best of my knowledge and belief.</p><div class="pv-row" style="margin-top:12px"><span>Place: ' + esc(D.place) + '<br>Date: ' + esc(fmtDate(D.date)) + '</span><span style="text-align:right"><br>(' + esc(D.name || 'Name') + ')</span></div>');
    $('rbPaper').innerHTML = '<div class="pv-side"><div class="pv-sl" style="background:' + m + '">' + L + '</div><div class="pv-sr">' + R + '</div></div>';
  }

  function previewClassic() {
    var T = THEMES[D.theme], m = '#' + T.main, l = '#' + T.light, h = '', bn = D.layout === 'banner';
    function sec(t, inner) { return '<div class="pv-sec" style="color:' + m + ';border-bottom:1.5px solid ' + m + ';">' + t + '</div>' + inner; }
    var contact = [];
    if (D.mobile) contact.push('Mobile: ' + esc(D.mobile)); if (D.email) contact.push('Email: ' + esc(D.email)); if (D.link) contact.push(esc(D.link));
    h += '<div class="pv-head"' + (bn ? ' style="background:' + m + ';color:#fff;padding:14px 16px;margin:-4px -4px 0;"' : '') + '><div class="pv-hl"><div class="pv-name" style="color:' + (bn ? '#fff' : m) + '">' + esc((D.name || __t('आपका नाम')).toUpperCase()) + '</div>' +
      (D.title ? '<div class="pv-title"' + (bn ? ' style="color:#fff"' : '') + '>' + esc(D.title) + '</div>' : '') +
      '<div class="pv-contact">' + (contact.join(' &nbsp;|&nbsp; ') || 'Mobile | Email') + '</div>' + (D.address ? '<div class="pv-contact">' + esc(D.address) + '</div>' : '') + '</div>' +
      (D.photo ? '<img class="pv-photo" src="' + D.photo + '" alt="">' : '') + '</div>' + (bn ? '' : '<div class="pv-rule" style="background:' + m + '"></div>');
    if (D.objective.trim()) h += sec('CAREER OBJECTIVE', '<p class="pv-p">' + esc(D.objective.trim()) + '</p>');
    var edu = D.edu.filter(hasEdu);
    if (edu.length) h += sec('EDUCATIONAL QUALIFICATION', '<table class="pv-tb"><tr style="background:' + l + '"><th>Qualification</th><th>Board / University</th><th>Year</th><th>Score</th></tr>' +
      edu.map(function (e) { return '<tr><td>' + esc(e.deg) + '</td><td>' + esc(e.inst) + '</td><td>' + esc(e.year) + '</td><td>' + esc(e.score) + '</td></tr>'; }).join('') + '</table>');
    var exp = D.fresher ? [] : D.exp.filter(hasExp);
    if (exp.length) h += sec('WORK EXPERIENCE', exp.map(function (e) {
      return '<div class="pv-exp"><div class="pv-row"><b>' + esc(e.role) + (e.role && e.co ? ' — ' : '') + esc(e.co) + '</b><span>' + esc([e.from, e.to].filter(Boolean).join(' – ')) + '</span></div>' +
        (lines(e.points).length ? '<ul>' + lines(e.points).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' : '') + '</div>'; }).join(''));
    else if (D.fresher) h += sec('WORK EXPERIENCE', '<p class="pv-p">Fresher</p>');
    var ac0 = lines(D.achievements); if (ac0.length) h += sec('KEY ACHIEVEMENTS', '<ul>' + ac0.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>');
    var sk = items(D.skills); if (sk.length) h += sec('SKILLS', '<ul class="pv-2c">' + sk.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>');
    var ex = lines(D.extras); if (ex.length) h += sec('CERTIFICATIONS / TRAINING / PROJECTS', '<ul>' + ex.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>');
    var st = items(D.strengths); if (st.length) h += sec('STRENGTHS', '<ul class="pv-2c">' + st.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>');
    if (D.hobbies.trim()) h += sec('HOBBIES', '<p class="pv-p">' + esc(items(D.hobbies).join(', ')) + '</p>');
    var pd = [['Date of Birth', fmtDate(D.dob)], ['Gender', D.gender], ['Marital Status', D.marital], ['Languages Known', D.languages]].filter(function (x) { return x[1]; });
    if (pd.length) h += sec('PERSONAL DETAILS', '<table class="pv-pd">' + pd.map(function (x) { return '<tr><td>' + x[0] + '</td><td>: ' + esc(x[1]) + '</td></tr>'; }).join('') + '</table>');
    if (D.decl) h += sec('DECLARATION', '<p class="pv-p">I hereby declare that the information furnished above is true and correct to the best of my knowledge and belief.</p>' +
      '<div class="pv-row" style="margin-top:14px"><span>Place: ' + esc(D.place) + '<br>Date: ' + esc(fmtDate(D.date)) + '</span><span style="text-align:right"><br>(' + esc(D.name || 'Name') + ')</span></div>');
    $('rbPaper').innerHTML = h;
  }
  var saveT = null;
  function update() { preview(); clearTimeout(saveT); saveT = setTimeout(function () { try { localStorage.setItem(DRAFT, JSON.stringify(D)); } catch (e) {} }, 500); }

  /* ================= WORD (.docx) ================= */
  function loadDocx() {
    if (window.docx) return Promise.resolve();
    return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = 'docx.min.js'; s.onload = res; s.onerror = function () { rej(new Error('docx')); }; document.head.appendChild(s); });
  }
  function dataUrlToU8(d) { var b = atob(d.split(',')[1]), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }

  function buildDoc() {
    if (D.layout === 'sidebar') return buildDocSidebar();
    var X = window.docx, T = THEMES[D.theme], W = 10426;   // A4 width 11906 − दोनों तरफ़ 740 margin
    var FONT = { ascii: 'Calibri', hAnsi: 'Calibri', cs: 'Mangal', eastAsia: 'Calibri' };
    function run(t, o) { o = o || {}; return new X.TextRun(Object.assign({ text: t, font: FONT }, o)); }
    function para(ch, o) { return new X.Paragraph(Object.assign({ children: ch }, o || {})); }
    function heading(t) {
      return para([run(t, { bold: true, size: 23, color: T.main })], { spacing: { before: 150, after: 60 }, keepNext: true,
        border: { bottom: { style: X.BorderStyle.SINGLE, size: 8, color: T.main, space: 2 } } });
    }
    function bullet(t) { return para([run(t, { size: 21 })], { numbering: { reference: 'bul', level: 0 }, spacing: { after: 15 } }); }
    var none = { style: X.BorderStyle.NONE, size: 0, color: 'FFFFFF' }, noB = { top: none, bottom: none, left: none, right: none };
    var thin = { style: X.BorderStyle.SINGLE, size: 4, color: 'A6A6A6' }, allB = { top: thin, bottom: thin, left: thin, right: thin };
    function cell(children, w, o) { return new X.TableCell(Object.assign({ children: children, width: { size: w, type: X.WidthType.DXA }, margins: { top: 40, bottom: 40, left: 100, right: 100 } }, o || {})); }

    var kids = [], contact = [];
    if (D.mobile) contact.push('Mobile: ' + D.mobile); if (D.email) contact.push('Email: ' + D.email); if (D.link) contact.push(D.link);
    var banner = D.layout === 'banner';
    var headParas = [para([run((D.name || '').toUpperCase(), { bold: true, size: 40, color: banner ? 'FFFFFF' : T.main })], { spacing: { after: 20 } })];
    if (D.title) headParas.push(para([run(D.title, { size: 24, color: banner ? 'FFFFFF' : '444444' })], { spacing: { after: 40 } }));
    if (contact.length) headParas.push(para([run(contact.join('   |   '), banner ? { size: 21, color: 'FFFFFF' } : { size: 21 })], { spacing: { after: 20 } }));
    if (D.address) headParas.push(para([run(D.address, banner ? { size: 21, color: 'FFFFFF' } : { size: 21 })], { spacing: { after: 20 } }));
    var shade = banner ? { shading: { type: X.ShadingType.CLEAR, color: 'auto', fill: T.main } } : {};
    if (D.photo || banner) {
      var ph = 112, pw = 84;
      if (D.photo) { pw = Math.round(ph * (D.photoW || 3) / (D.photoH || 4)); if (pw > 100) { pw = 100; ph = Math.round(pw * (D.photoH || 4) / (D.photoW || 3)); } }
      var lw = D.photo ? W - 1900 : W;
      var hcells = [cell(headParas, lw, Object.assign({ borders: noB, margins: { top: banner ? 180 : 0, bottom: banner ? 180 : 0, left: banner ? 220 : 0, right: 100 } }, shade))];
      if (D.photo) hcells.push(cell([para([new X.ImageRun({ type: 'jpg', data: dataUrlToU8(D.photo), transformation: { width: pw, height: ph } })], { alignment: X.AlignmentType.RIGHT })], 1900,
        Object.assign({ borders: noB, margins: { top: banner ? 120 : 0, bottom: banner ? 120 : 0, left: 0, right: banner ? 180 : 0 }, verticalAlign: X.VerticalAlign.TOP }, shade)));
      kids.push(new X.Table({ width: { size: W, type: X.WidthType.DXA }, columnWidths: D.photo ? [W - 1900, 1900] : [W], borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
        rows: [new X.TableRow({ children: hcells })] }));
    } else { headParas.forEach(function (p) { kids.push(p); }); }
    if (banner) kids.push(para([], { spacing: { before: 0, after: 60 } }));
    else kids.push(para([], { spacing: { before: 0, after: 0 }, run: { size: 4 }, border: { bottom: { style: X.BorderStyle.SINGLE, size: 18, color: T.main, space: 4 } } }));

    if (D.objective.trim()) { kids.push(heading('CAREER OBJECTIVE')); kids.push(para([run(D.objective.trim(), { size: 21 })], { alignment: X.AlignmentType.JUSTIFIED, spacing: { after: 40 } })); }

    var edu = D.edu.filter(hasEdu);
    if (edu.length) {
      kids.push(heading('EDUCATIONAL QUALIFICATION'));
      var cw = [2500, W - 5900, 1300, 2100];
      function hc(t, w) { return cell([para([run(t, { bold: true, size: 20, color: T.main })])], w, { borders: allB, shading: { type: X.ShadingType.CLEAR, color: 'auto', fill: T.light } }); }
      var rows = [new X.TableRow({ tableHeader: true, children: [hc('Qualification', cw[0]), hc('Board / University', cw[1]), hc('Year', cw[2]), hc('Score', cw[3])] })];
      edu.forEach(function (e) { rows.push(new X.TableRow({ cantSplit: true, children: [e.deg, e.inst, e.year, e.score].map(function (v, i) { return cell([para([run(v || '', { size: 20 })])], cw[i], { borders: allB }); }) })); });
      kids.push(new X.Table({ width: { size: W, type: X.WidthType.DXA }, columnWidths: cw, rows: rows }));
    }

    var exp = D.fresher ? [] : D.exp.filter(hasExp);
    if (exp.length || D.fresher) {
      kids.push(heading('WORK EXPERIENCE'));
      if (D.fresher) kids.push(para([run('Fresher', { size: 21 })]));
      exp.forEach(function (e) {
        var title = (e.role || '') + (e.role && e.co ? ' — ' : '') + (e.co || ''), dates = [e.from, e.to].filter(Boolean).join(' – ');
        kids.push(para([run(title, { bold: true, size: 22 }), new X.TextRun({ children: [new X.Tab(), dates], font: FONT, size: 21, italics: true })],
          { tabStops: [{ type: X.TabStopType.RIGHT, position: W }], spacing: { before: 80, after: 30 }, keepNext: true }));
        lines(e.points).forEach(function (p) { kids.push(bullet(p)); });
      });
    }

    var acd = lines(D.achievements); if (acd.length) { kids.push(heading('KEY ACHIEVEMENTS')); acd.forEach(function (x) { kids.push(bullet(x)); }); }

    function twoCol(list) {
      var half = Math.ceil(list.length / 2), a = list.slice(0, half), b = list.slice(half), w = Math.floor(W / 2), w2 = W - w;
      function col(arr, cw2) { return cell(arr.length ? arr.map(bullet) : [para([run('')])], cw2, { borders: noB, margins: { top: 0, bottom: 0, left: 0, right: 100 } }); }
      return new X.Table({ width: { size: W, type: X.WidthType.DXA }, columnWidths: [w, w2], borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
        rows: [new X.TableRow({ children: [col(a, w), col(b, w2)] })] });
    }
    var sk = items(D.skills); if (sk.length) { kids.push(heading('SKILLS')); kids.push(twoCol(sk)); }
    var ex = lines(D.extras); if (ex.length) { kids.push(heading('CERTIFICATIONS / TRAINING / PROJECTS')); ex.forEach(function (x) { kids.push(bullet(x)); }); }
    var st = items(D.strengths); if (st.length) { kids.push(heading('STRENGTHS')); kids.push(twoCol(st)); }
    if (D.hobbies.trim()) { kids.push(heading('HOBBIES')); kids.push(para([run(items(D.hobbies).join(', '), { size: 21 })])); }

    var pd = [['Date of Birth', fmtDate(D.dob)], ['Gender', D.gender], ['Marital Status', D.marital], ['Languages Known', D.languages]].filter(function (x) { return x[1]; });
    if (pd.length) {
      kids.push(heading('PERSONAL DETAILS'));
      kids.push(new X.Table({ width: { size: W, type: X.WidthType.DXA }, columnWidths: [2600, W - 2600], borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
        rows: pd.map(function (x) { return new X.TableRow({ children: [cell([para([run(x[0], { bold: true, size: 21 })])], 2600, { borders: noB }), cell([para([run(': ' + x[1], { size: 21 })])], W - 2600, { borders: noB })] }); }) }));
    }
    if (D.decl) {
      kids.push(heading('DECLARATION'));
      kids.push(para([run('I hereby declare that the information furnished above is true and correct to the best of my knowledge and belief.', { size: 21 })], { alignment: X.AlignmentType.JUSTIFIED, spacing: { after: 160 } }));
      kids.push(para([run('Place: ' + (D.place || '')), new X.TextRun({ children: [new X.Tab(), '(' + (D.name || '') + ')'], font: FONT, size: 21, bold: true })], { tabStops: [{ type: X.TabStopType.RIGHT, position: W }] }));
      kids.push(para([run('Date: ' + fmtDate(D.date))]));
    }

    return new X.Document({
      creator: 'EkVeera EPCS Resume Builder', title: 'Resume - ' + (D.name || ''),
      styles: { default: { document: { run: { font: FONT, size: 21 } } } },
      numbering: { config: [{ reference: 'bul', levels: [{ level: 0, format: X.LevelFormat.BULLET, text: '•', alignment: X.AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 480, hanging: 240 } } } }] }] },
      sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 680, bottom: 620, left: 740, right: 740 } } }, children: kids }]
    });
  }


  function buildDocSidebar() {
    var X = window.docx, T = THEMES[D.theme], W = 10426, LW = 3300, RW = W - LW;
    var FONT = { ascii: 'Calibri', hAnsi: 'Calibri', cs: 'Mangal', eastAsia: 'Calibri' };
    function run(t, o) { o = o || {}; return new X.TextRun(Object.assign({ text: t, font: FONT }, o)); }
    function para(ch, o) { return new X.Paragraph(Object.assign({ children: ch }, o || {})); }
    var none = { style: X.BorderStyle.NONE, size: 0, color: 'FFFFFF' }, noB = { top: none, bottom: none, left: none, right: none };
    function lh(t) { return para([run(t, { bold: true, size: 21, color: 'FFFFFF' })], { spacing: { before: 170, after: 50 }, keepNext: true, border: { bottom: { style: X.BorderStyle.SINGLE, size: 6, color: 'FFFFFF', space: 2 } } }); }
    function lt(t, o) { return para([run(t, Object.assign({ size: 20, color: 'FFFFFF' }, o || {}))], { spacing: { after: 30 } }); }
    function rh(t) { return para([run(t, { bold: true, size: 23, color: T.main })], { spacing: { before: 150, after: 60 }, keepNext: true, border: { bottom: { style: X.BorderStyle.SINGLE, size: 8, color: T.main, space: 2 } } }); }
    function bullet(t) { return para([run(t, { size: 21 })], { numbering: { reference: 'bul', level: 0 }, spacing: { after: 15 } }); }
    var Lc = [], Rc = [];
    if (D.photo) {
      var ph = 120, pw = Math.round(ph * (D.photoW || 3) / (D.photoH || 4)); if (pw > 100) { pw = 100; ph = Math.round(pw * (D.photoH || 4) / (D.photoW || 3)); }
      Lc.push(para([new X.ImageRun({ type: 'jpg', data: dataUrlToU8(D.photo), transformation: { width: pw, height: ph } })], { alignment: X.AlignmentType.CENTER, spacing: { after: 80 } }));
    }
    Lc.push(lh('CONTACT'));
    if (D.mobile) Lc.push(lt('Mobile: ' + D.mobile)); if (D.email) Lc.push(lt('Email: ' + D.email)); if (D.address) Lc.push(lt(D.address)); if (D.link) Lc.push(lt(D.link));
    var sk = items(D.skills); if (sk.length) { Lc.push(lh('SKILLS')); sk.forEach(function (x) { Lc.push(lt('• ' + x)); }); }
    var st = items(D.strengths); if (st.length) { Lc.push(lh('STRENGTHS')); st.forEach(function (x) { Lc.push(lt('• ' + x)); }); }
    var pd = [['DOB', fmtDate(D.dob)], ['Gender', D.gender], ['Marital', D.marital], ['Languages', D.languages]].filter(function (x) { return x[1]; });
    if (pd.length) { Lc.push(lh('PERSONAL')); pd.forEach(function (x) { Lc.push(para([run(x[0] + ': ', { bold: true, size: 20, color: 'FFFFFF' }), run(x[1], { size: 20, color: 'FFFFFF' })], { spacing: { after: 30 } })); }); }
    if (D.hobbies.trim()) { Lc.push(lh('HOBBIES')); Lc.push(lt(items(D.hobbies).join(', '))); }

    Rc.push(para([run((D.name || '').toUpperCase(), { bold: true, size: 42, color: T.main })], { spacing: { after: 20 } }));
    if (D.title) Rc.push(para([run(D.title, { size: 24, color: '444444' })], { spacing: { after: 60 }, border: { bottom: { style: X.BorderStyle.SINGLE, size: 18, color: T.main, space: 4 } } }));
    if (D.objective.trim()) { Rc.push(rh('CAREER OBJECTIVE')); Rc.push(para([run(D.objective.trim(), { size: 21 })], { alignment: X.AlignmentType.JUSTIFIED, spacing: { after: 40 } })); }
    var exp = D.fresher ? [] : D.exp.filter(hasExp);
    if (exp.length || D.fresher) {
      Rc.push(rh('WORK EXPERIENCE'));
      if (D.fresher) Rc.push(para([run('Fresher', { size: 21 })]));
      exp.forEach(function (e) {
        var title = (e.role || '') + (e.role && e.co ? ' — ' : '') + (e.co || ''), dates = [e.from, e.to].filter(Boolean).join(' – ');
        Rc.push(para([run(title, { bold: true, size: 22 })], { spacing: { before: 80, after: 0 }, keepNext: true }));
        if (dates) Rc.push(para([run(dates, { italics: true, size: 20, color: '555555' })], { spacing: { after: 30 }, keepNext: true }));
        lines(e.points).forEach(function (p) { Rc.push(bullet(p)); });
      });
    }
    var edu = D.edu.filter(hasEdu);
    if (edu.length) {
      Rc.push(rh('EDUCATION'));
      edu.forEach(function (e) {
        Rc.push(para([run(e.deg || '', { bold: true, size: 21 }), run(e.year ? '   (' + e.year + ')' : '', { size: 20, color: '555555' })], { spacing: { before: 50, after: 0 }, keepNext: true }));
        Rc.push(para([run([e.inst, e.score].filter(Boolean).join(' — '), { size: 20 })], { spacing: { after: 30 } }));
      });
    }
    var ac = lines(D.achievements); if (ac.length) { Rc.push(rh('KEY ACHIEVEMENTS')); ac.forEach(function (x) { Rc.push(bullet(x)); }); }
    var ex = lines(D.extras); if (ex.length) { Rc.push(rh('CERTIFICATIONS / TRAINING / PROJECTS')); ex.forEach(function (x) { Rc.push(bullet(x)); }); }
    if (D.decl) {
      Rc.push(rh('DECLARATION'));
      Rc.push(para([run('I hereby declare that the information furnished above is true and correct to the best of my knowledge and belief.', { size: 21 })], { alignment: X.AlignmentType.JUSTIFIED, spacing: { after: 140 } }));
      Rc.push(para([run('Place: ' + (D.place || '') + '      Date: ' + fmtDate(D.date), { size: 21 })]));
      Rc.push(para([run('(' + (D.name || '') + ')', { bold: true, size: 21 })], { alignment: X.AlignmentType.RIGHT }));
    }
    var fill = { type: X.ShadingType.CLEAR, color: 'auto', fill: T.main };
    var table = new X.Table({ width: { size: W, type: X.WidthType.DXA }, columnWidths: [LW, RW], borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
      rows: [new X.TableRow({ height: { value: 15200, rule: X.HeightRule.ATLEAST }, children: [
        new X.TableCell({ children: Lc, width: { size: LW, type: X.WidthType.DXA }, borders: noB, shading: fill, margins: { top: 200, bottom: 160, left: 200, right: 160 } }),
        new X.TableCell({ children: Rc, width: { size: RW, type: X.WidthType.DXA }, borders: noB, margins: { top: 200, bottom: 160, left: 260, right: 60 } })
      ] })] });
    return new X.Document({
      creator: 'EkVeera EPCS Resume Builder', title: 'Resume - ' + (D.name || ''),
      styles: { default: { document: { run: { font: FONT, size: 21 } } } },
      numbering: { config: [{ reference: 'bul', levels: [{ level: 0, format: X.LevelFormat.BULLET, text: '•', alignment: X.AlignmentType.LEFT, style: { paragraph: { indent: { left: 480, hanging: 240 } } } }] }] },
      sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 500, bottom: 400, left: 740, right: 740 } } }, children: [table] }]
    });
  }

  function validate() {
    if (!D.name.trim()) return __t('कृपया अपना पूरा नाम भरें।');
    if (D.mobile.replace(/\D/g, '').length < 10) return __t('कृपया 10 अंकों का सही Mobile Number भरें।');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(D.email.trim())) return __t('कृपया सही Email ID भरें।');
    return '';
  }
  function msg(t, ok) { var m = $('rbMsg'); if (!m) return; m.style.color = ok ? '#11766F' : '#c0392b'; m.textContent = t; }
  function fileName() { return 'Resume_' + (D.name.trim().replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'EkVeera') + '.docx'; }
  async function makeBlob() { await loadDocx(); return window.docx.Packer.toBlob(buildDoc()); }

  async function download() {
    var e = validate(); if (e) { msg(e, false); return; }
    var b = $('rbDownload'), old = b.textContent; b.disabled = true; b.textContent = __t('⏳ Word file बन रही है...'); msg('', true);
    try {
      var blob = await makeBlob(), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = fileName(); a.style.display = 'none'; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      msg(__t('✅ आपका Resume (Word .docx) Download हो गया — "Downloads" folder में देखें। MS Word में खोलकर चाहें तो और बदलाव कर सकते हैं।'), true);
    } catch (err) { msg(__t('Word file नहीं बन पाई — Internet चेक करके दोबारा कोशिश करें।'), false); }
    b.disabled = false; b.textContent = old;
  }

  // Bana hua Resume seedha "Job ke liye Register" form mein lagana
  async function useForJob() {
    var e = validate(); if (e) { msg(e, false); return; }
    var b = $('rbUse'), old = b.textContent; b.disabled = true; b.textContent = __t('⏳ तैयार हो रहा है...');
    try {
      var blob = await makeBlob(), buf = new Uint8Array(await blob.arrayBuffer()), bin = '';
      for (var i = 0; i < buf.length; i += 8192) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 8192));
      sessionStorage.setItem('ekveera_built_resume', JSON.stringify({ name: fileName(), b64: btoa(bin) }));
      localStorage.setItem('ekveera_resume_prefill', JSON.stringify({ name: D.name, 'mobile number': D.mobile, 'email id': D.email, city: (D.address.split(',').slice(-3)[0] || '').trim(),
        'key skills': items(D.skills).slice(0, 8).join(', '), gender: D.gender, 'job description': D.title }));
      window.location.href = 'placement.html?open=candidate#apply';
    } catch (err) { msg(__t('कुछ गड़बड़ हुई — पहले "Word Download" करके देखें।'), false); b.disabled = false; b.textContent = old; }
  }

  function sample() {
    D = Object.assign(fresh(), { theme: D.theme, name: 'Ramesh Kumar', title: 'Customer Support Executive', mobile: '9876543210', email: 'ramesh.kumar@gmail.com',
      address: 'Ward No. 5, Maihar, District Satna, Madhya Pradesh - 485771', dob: '2001-06-15', gender: 'Male', marital: 'Single', languages: 'Hindi, English',
      objective: 'To secure a challenging position in the customer support domain where I can utilise my communication and computer skills to contribute to the growth of the organisation while enhancing my own professional skills.',
      edu: [{ deg: 'B.A.', inst: 'A.P.S. University, Rewa', year: '2023', score: '68%' }, { deg: '12th', inst: 'MP Board', year: '2020', score: '72%' }, { deg: '10th', inst: 'MP Board', year: '2018', score: '75%' }],
      exp: [{ co: 'ABC Call Centre, Satna', role: 'Tele Caller', from: 'Jan 2024', to: 'Present', points: 'Handled 60+ outbound and inbound customer calls daily\nResolved customer queries and updated records in CRM\nAchieved monthly targets for three consecutive months' }],
      skills: 'MS Word, MS Excel, Typing (Hindi & English), Customer Handling, Communication, Email Writing', extras: 'Basic Computer Course — 6 months\nCall Center Training — EkVeera (15 days)',
      strengths: 'Hard working, Team player, Quick learner', hobbies: 'Reading, Cricket', place: 'Maihar', date: new Date().toISOString().slice(0, 10) });
    renderForm(); update(); msg(__t('नमूना भर दिया गया — अब इसे अपनी जानकारी से बदल लें।'), true);
  }

  function init() {
    if (!$('rbForm')) return;
    try { var d = JSON.parse(localStorage.getItem(DRAFT) || 'null'); if (d && d.edu && d.exp) { D = Object.assign(fresh(), d); $('rbDraftNote').style.display = 'block'; } } catch (e) {}
    renderForm(); preview();
    $('rbDownload').onclick = download; $('rbUse').onclick = useForJob; $('rbSample').onclick = sample;
    $('rbClear').onclick = function () { if (confirm(__t('सारी भरी हुई जानकारी हटानी है?'))) { D = fresh(); try { localStorage.removeItem(DRAFT); } catch (e) {} $('rbDraftNote').style.display = 'none'; renderForm(); preview(); msg('', true); } };
    ['rbTabForm', 'rbTabPrev'].forEach(function (id) { $(id).onclick = function () { var f = id === 'rbTabForm'; $('rbTabForm').classList.toggle('on', f); $('rbTabPrev').classList.toggle('on', !f); $('rbLeft').classList.toggle('rb-hide', !f); $('rbRight').classList.toggle('rb-hide', f); if (!f) window.scrollTo({ top: $('rbTabs').offsetTop - 80, behavior: 'smooth' }); }; });
  }
  window.__rb = { D: function () { return D; }, set: function (o) { D = Object.assign(fresh(), o); renderForm(); update(); }, build: buildDoc };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
