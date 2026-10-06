
  window.addEventListener('scroll', function () {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;
    btn.style.display = (window.scrollY > 500) ? 'flex' : 'none';
  });



  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));

  // Countdown — अब यह Admin द्वारा Set किए गए Date/Time से चलेगा (Backend से लिया जाता है)
  let ekveeraBatchTarget = null;
  async function loadBatchTimer() {
    try {
      const res = await fetch('https://script.google.com/macros/s/AKfycbycx5J5DMOVq3hpfbVPvyD6yDHXX2C2TEA9HdptFEEmv73g5VeiJ9Ov608hnK15AlpzHA/exec?action=getbatchtimer&_=' + Date.now());
      const data = await res.json();
      const banner = document.querySelector('.countdown-banner');
      if (data.status === 'ok' && data.datetime) {
        ekveeraBatchTarget = new Date(data.datetime);
        const labelEl = document.getElementById('cd-label');
        if (labelEl && data.label) labelEl.textContent = data.label;
        if (banner) banner.style.display = 'block';
      } else if (banner) {
        banner.style.display = 'none'; // जब तक Admin कोई Date सेट नहीं करता, बैनर छुपा रहेगा
      }
    } catch (err) { /* चुपचाप छोड़ दें */ }
  }
  function updateCountdown(){
    if (!ekveeraBatchTarget) return;
    const now = new Date();
    let diff = ekveeraBatchTarget - now;
    if (diff < 0) diff = 0;
    const d = Math.floor(diff/(1000*60*60*24));
    const h = Math.floor((diff/(1000*60*60))%24);
    const m = Math.floor((diff/(1000*60))%60);
    const s = Math.floor((diff/1000)%60);
    const dEl = document.getElementById('cd-days'), hEl = document.getElementById('cd-hours'),
          mEl = document.getElementById('cd-mins'), sEl = document.getElementById('cd-secs');
    if (dEl) dEl.textContent = d;
    if (hEl) hEl.textContent = h;
    if (mEl) mEl.textContent = m;
    if (sEl) sEl.textContent = s;
  }
  loadBatchTimer();
  setInterval(updateCountdown, 1000);
  setInterval(loadBatchTimer, 60000); // हर 1 मिनट में दोबारा चेक — ताकि नया Set किया Time भी दिख जाए

  // Live Trust Numbers
  // पहले localStorage में जो पिछली बार का Cache मिला है वही तुरंत दिखा दो (ताकि "--" कभी न दिखे,
  // न ही Number गायब होकर दोबारा आए) — फिर background में नया, ताज़ा Data लाकर उसकी जगह अपडेट कर दो।
  const EKVEERA_STATS_CACHE_KEY = 'ekveera_stats_cache_v1';
  function paintStats(stats) {
    const cEl = document.getElementById('statTotalCandidates');
    if (!cEl) return;
    cEl.textContent = stats.totalCandidates;
    document.getElementById('statTotalPlaced').textContent = stats.totalPlaced;
    document.getElementById('statTotalCompanies').textContent = stats.totalCompanies;
  }
  async function loadStats() {
    const cEl = document.getElementById('statTotalCandidates');
    if (!cEl) return; // इस Page पर Stats Cards नहीं हैं — कुछ न करें

    // Step 1: Cache में जो पहले से सेव है उसे तुरंत दिखाएं (कोई flicker/"--" नहीं)
    try {
      const cached = localStorage.getItem(EKVEERA_STATS_CACHE_KEY);
      if (cached) paintStats(JSON.parse(cached));
    } catch (err) { /* cache खराब हो तो अनदेखा करें */ }

    // Step 2: पीछे से असली, ताज़ा नंबर लाकर चुपचाप अपडेट कर दें
    try {
      const res = await fetch('https://script.google.com/macros/s/AKfycbycx5J5DMOVq3hpfbVPvyD6yDHXX2C2TEA9HdptFEEmv73g5VeiJ9Ov608hnK15AlpzHA/exec?action=getstats&_=' + Date.now());
      const data = await res.json();
      if (data.status === 'ok') {
        paintStats(data);
        localStorage.setItem(EKVEERA_STATS_CACHE_KEY, JSON.stringify(data));
      }
    } catch (err) { /* चुपचाप छोड़ दें — Cache वाला नंबर वैसे ही दिख रहा है */ }
  }
  loadStats();

  // ---- Mobile Menu के अंदर Submenu खोलना/बंद करना (जैसे "Call Center Training" के नीचे कोर्स/फीस/ID Card आदि) ----
  function toggleMobileSubmenu(id, evt) {
    if (evt) evt.preventDefault();
    const sub = document.getElementById(id);
    if (!sub) return;
    sub.style.display = (sub.style.display === 'block') ? 'none' : 'block';
  }

  // ---- Nav Dropdown (Desktop पर hover से खुलता है, Mobile/Tap पर click से) ----
  function toggleNavDropdown(el, evt) {
    if (window.innerWidth > 850) return; // Desktop पर hover से CSS खुद खुल जाता है
    if (evt) evt.preventDefault();
    const dd = el.closest('.nav-dropdown');
    if (!dd) return;
    const wasOpen = dd.classList.contains('open');
    document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
    if (!wasOpen) dd.classList.add('open');
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });

  // भाषा (Hindi/English) बदलना अब i18n.js में है — Header का "हिं | EN" बटन वहीं से चलता है

  // Admin password gate
  const CERT_ADMIN_PASSWORD = "EkVeera@2026";
  function checkCertPassword(){
    // छुपे Space / अदृश्य अक्षर हटाकर मिलान (मोबाइल Keyboard / Copy-Paste से अक्सर जुड़ जाते हैं)
    const val = String(document.getElementById('certPasswordInput').value || '').replace(/[\u200B-\u200D\u2060\uFEFF\u00A0]/g, '').trim();
    if (val === CERT_ADMIN_PASSWORD){
      document.getElementById('certLockScreen').style.display = 'none';
      document.getElementById('certGeneratorArea').style.display = 'block';
    } else {
      document.getElementById('certPasswordError').style.display = 'block';
    }
  }

  // Dynamic Certificate generator using official transparent logo
  const certLogo = new Image();
  certLogo.src = 'logo.png';

  const CERT_VERIFY_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbycx5J5DMOVq3hpfbVPvyD6yDHXX2C2TEA9HdptFEEmv73g5VeiJ9Ov608hnK15AlpzHA/exec';

  async function checkTrainingCompleted(regNo){
    const url = CERT_VERIFY_WEB_APP_URL + '?action=cert&code=' + encodeURIComponent(regNo) + '&_=' + Date.now();
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Verify request failed');
    return await res.json(); // { status: 'ok' | 'not_completed' | 'not_found' | 'no_training_record' | 'error', ... }
  }

  async function generateCertificate(){
    const errorEl = document.getElementById('certError');
    errorEl.style.display = 'none';

    const name = document.getElementById('certName').value.trim() || 'Student Name';
    const idNo = document.getElementById('certId').value.trim() || '—';
    const dateVal = document.getElementById('certDate').value.trim() || new Date().toLocaleDateString('en-GB');
    const location = document.getElementById('certLocation').value.trim() || 'Maihar';

    if (!document.getElementById('certId').value.trim()){
      errorEl.textContent = __t('❌ कृपया Reg. No. / ID डालें, तभी Training Database से वेरीफाई हो पाएगा।');
      errorEl.style.display = 'block';
      return;
    }

    const genBtn = document.querySelector('button[onclick="generateCertificate()"]');
    const originalBtnText = genBtn ? genBtn.textContent : '';
    if (genBtn){ genBtn.disabled = true; genBtn.textContent = __t('जांच हो रही है...'); }

    let result;
    try {
      result = await checkTrainingCompleted(idNo);
    } catch (err){
      if (genBtn){ genBtn.disabled = false; genBtn.textContent = originalBtnText; }
      errorEl.textContent = __t('⚠️ अभी वेरीफाई नहीं हो पाया (इंटरनेट/सर्वर समस्या) — कृपया थोड़ी देर बाद फिर कोशिश करें।');
      errorEl.style.display = 'block';
      return;
    }
    if (genBtn){ genBtn.disabled = false; genBtn.textContent = originalBtnText; }

    if (result.status === 'not_found'){
      errorEl.textContent = __t('❌ यह Reg. No. Candidate Database में नहीं मिला। पहले उसका Reg. No. (column N) भरें।');
      errorEl.style.display = 'block';
      return;
    }
    if (result.status === 'no_training_record'){
      errorEl.textContent = __t('❌ इस कैंडिडेट का Training Database में कोई रिकॉर्ड नहीं मिला।');
      errorEl.style.display = 'block';
      return;
    }
    if (result.status === 'not_completed'){
      errorEl.textContent = __t('⚠️ Training अभी "Completed" नहीं है (मौजूदा status: ') + (result.trainingStatus || __t('खाली')) + __t(')। पहले Training Database में status "Completed" करें।');
      errorEl.style.display = 'block';
      return;
    }
    if (result.status === 'already_issued'){
      errorEl.textContent = __t('⚠️ इस कैंडिडेट का Certificate पहले ही बन चुका है। दोबारा नहीं बन सकता।');
      errorEl.style.display = 'block';
      return;
    }
    if (result.status !== 'ok'){
      errorEl.textContent = __t('⚠️ अभी वेरीफाई नहीं हो पाया — कृपया थोड़ी देर बाद फिर कोशिश करें।');
      errorEl.style.display = 'block';
      return;
    }

    const canvas = document.getElementById('certCanvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    function star(cx, cy, r, fill){
      ctx.save();
      ctx.beginPath();
      for (let i=0;i<10;i++){
        const ang = -Math.PI/2 + i*Math.PI/5;
        const rad = i%2===0 ? r : r*0.42;
        const x = cx + rad*Math.cos(ang), y = cy + rad*Math.sin(ang);
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();
    }

    function draw(){
      ctx.fillStyle = '#FBF7EE';
      ctx.fillRect(0,0,W,H);

      // Borders
      ctx.strokeStyle = '#C9A24B';
      ctx.lineWidth = 10;
      ctx.strokeRect(18,18,W-36,H-36);
      ctx.strokeStyle = '#E8C878';
      ctx.lineWidth = 2;
      ctx.strokeRect(32,32,W-64,H-64);
      ctx.strokeStyle = '#152241';
      ctx.lineWidth = 2;
      ctx.strokeRect(46,46,W-92,H-92);

      // Corner ornaments
      function corner(cx, cy, sx, sy){
        ctx.strokeStyle = '#C9A24B'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+sx*24,cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx,cy+sy*24); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx,cy,4,0,Math.PI*2); ctx.fillStyle='#C9A24B'; ctx.fill();
      }
      corner(46,46,1,1); corner(W-46,46,-1,1); corner(46,H-46,1,-1); corner(W-46,H-46,-1,-1);

      // Logo
      if (certLogo.complete && certLogo.naturalWidth > 0){
        ctx.drawImage(certLogo, 70, 55, 140, 140);
      }
      ctx.textAlign = 'left';
      ctx.fillStyle = '#5B6478';
      ctx.font = '600 13px "Work Sans", sans-serif';
      ctx.fillText('Reg. No.:- 28916', 70, 218);

      // Header (true center)
      ctx.textAlign = 'center';
      ctx.fillStyle = '#152241';
      ctx.font = '700 42px "Space Grotesk", sans-serif';
      ctx.fillText('EKVEERA', W/2, 98);
      ctx.font = '600 14px "Work Sans", sans-serif';
      ctx.fillStyle = '#3A4258';
      ctx.fillText('PLACEMENT  &  CONSULTING  SERVICES', W/2, 121);

      const pillW = 360, pillH = 30, pillX = W/2-pillW/2, pillY = 134;
      ctx.fillStyle = '#152241';
      ctx.beginPath();
      ctx.moveTo(pillX+pillH/2, pillY);
      ctx.lineTo(pillX+pillW-pillH/2, pillY);
      ctx.arcTo(pillX+pillW, pillY, pillX+pillW, pillY+pillH/2, pillH/2);
      ctx.arcTo(pillX+pillW, pillY+pillH, pillX+pillW-pillH/2, pillY+pillH, pillH/2);
      ctx.lineTo(pillX+pillH/2, pillY+pillH);
      ctx.arcTo(pillX, pillY+pillH, pillX, pillY+pillH/2, pillH/2);
      ctx.arcTo(pillX, pillY, pillX+pillH/2, pillY, pillH/2);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#E8C878';
      ctx.font = '600 12px "Space Grotesk", sans-serif';
      ctx.fillText('TRAINING   ·   PLACEMENT   ·   CONSULTING', W/2, pillY+20);

      ctx.fillStyle = '#5B6478';
      ctx.font = 'italic 400 13px "Work Sans", sans-serif';
      ctx.fillText('YOUR TRUST, OUR COMMITMENT', W/2, 186);

      ctx.strokeStyle = '#C9A24B'; ctx.lineWidth = 1.25;
      ctx.beginPath(); ctx.moveTo(70, 205); ctx.lineTo(W-70, 205); ctx.stroke();

      // CERTIFICATE OF COMPLETION
      ctx.fillStyle = '#152241';
      ctx.font = '700 50px "Space Grotesk", sans-serif';
      ctx.fillText('CERTIFICATE', W/2, 272);
      ctx.font = '400 15px "Work Sans", sans-serif';
      ctx.fillStyle = '#5B6478';
      ctx.fillText('OF', W/2, 297);
      ctx.fillStyle = '#C9A24B';
      ctx.font = '700 32px "Space Grotesk", sans-serif';
      ctx.fillText('COMPLETION', W/2, 332);
      star(W/2-30, 350, 6, '#C9A24B'); star(W/2, 350, 6, '#C9A24B'); star(W/2+30, 350, 6, '#C9A24B');

      // Certify line + Name
      ctx.fillStyle = '#5B6478';
      ctx.font = 'italic 400 16px "Work Sans", sans-serif';
      ctx.fillText('This is to certify that', W/2, 378);

      ctx.fillStyle = '#152241';
      ctx.font = '700 34px "Space Grotesk", sans-serif';
      ctx.fillText(name, W/2, 415);
      const nameW = ctx.measureText(name).width;
      ctx.strokeStyle = '#C9A24B'; ctx.lineWidth = 1.25;
      ctx.beginPath(); ctx.moveTo(W/2-nameW/2-20, 428); ctx.lineTo(W/2+nameW/2+20, 428); ctx.stroke();
      star(W/2, 428, 5, '#C9A24B');

      // Description
      ctx.fillStyle = '#5B6478';
      ctx.font = '400 14px "Work Sans", sans-serif';
      ctx.fillText('has successfully completed the comprehensive training program on', W/2, 452);
      ctx.fillStyle = '#152241';
      ctx.font = '700 19px "Space Grotesk", sans-serif';
      ctx.fillText('"Advanced Call Center Skills and Customer Service Training"', W/2, 477);
      ctx.font = '400 13px "Work Sans", sans-serif';
      ctx.fillStyle = '#5B6478';
      ctx.fillText('conducted by EkVeera Placement & Consulting Services', W/2, 497);

      // Info box (ID / Reg / Date / Location)
      const ibX = 100, ibY = 512, ibW = W-200, ibH = 46;
      ctx.strokeStyle = '#C9A24B'; ctx.lineWidth = 1.25;
      ctx.strokeRect(ibX, ibY, ibW, ibH);
      ctx.beginPath(); ctx.moveTo(W/2, ibY+7); ctx.lineTo(W/2, ibY+ibH-7); ctx.stroke();

      function infoCell(x, label, value, align){
        ctx.textAlign = align;
        ctx.fillStyle = '#5B6478';
        ctx.font = '600 10px "Work Sans", sans-serif';
        ctx.fillText(label, x, ibY+18);
        ctx.fillStyle = '#152241';
        ctx.font = '700 17px "Space Grotesk", sans-serif';
        ctx.fillText(value, x, ibY+38);
      }
      infoCell(ibX+22, 'ID NO.', idNo, 'left');
      infoCell(W/2-22, 'REG. NO.', '28916', 'right');
      infoCell(W/2+22, 'DATE OF COMPLETION', dateVal, 'left');
      infoCell(ibX+ibW-22, 'LOCATION', location, 'right');
      ctx.textAlign = 'center';

      // Signatures
      ctx.strokeStyle = '#152241'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(130, 610); ctx.lineTo(330, 610); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W-330, 610); ctx.lineTo(W-130, 610); ctx.stroke();
      ctx.fillStyle = '#152241';
      ctx.font = 'italic 700 18px "Space Grotesk", sans-serif';
      ctx.fillText('Ekveera Patel', 230, 602);
      ctx.fillText('Pankaj V.K', W-230, 602);
      ctx.font = '600 11px "Work Sans", sans-serif';
      ctx.fillStyle = '#5B6478';
      ctx.fillText('DIRECTOR', 230, 624);
      ctx.fillText('TRAINING COORDINATOR', W-230, 624);

      // Gold seal medallion
      const sx = W/2, sy = 605, sr = 38;
      const rings = [[sr,'#A9812F'],[sr-6,'#C9A24B'],[sr-13,'#E8C878'],[sr-19,'#C9A24B']];
      rings.forEach(([rr,col])=>{
        ctx.beginPath(); ctx.arc(sx,sy,rr,0,Math.PI*2);
        ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
      });
      star(sx, sy-4, 15, '#ffffff');
      ctx.fillStyle = '#152241';
      ctx.font = '700 9px "Work Sans", sans-serif';
      ctx.fillText('CERTIFIED', sx, sy+21);
      ctx.fillStyle = '#A9812F';
      ctx.beginPath(); ctx.moveTo(sx-20,sy+30); ctx.lineTo(sx-4,sy+16); ctx.lineTo(sx-4,sy+56); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#C9A24B';
      ctx.beginPath(); ctx.moveTo(sx+20,sy+30); ctx.lineTo(sx+4,sy+16); ctx.lineTo(sx+4,sy+56); ctx.closePath(); ctx.fill();

      // Bottom navy ribbon
      const barY0 = H-102, barY1 = H-44;
      ctx.fillStyle = '#152241';
      ctx.fillRect(46, barY0, W-92, barY1-barY0);
      const items = [
        ['EXPERT TRAINERS','Industry Experienced Professionals'],
        ['PRACTICAL LEARNING','Real-Time Scenarios & Case Studies'],
        ['PLACEMENT SUPPORT','Better Opportunities & Future'],
        ['100% COMMITMENT','Quality Training Assured Success'],
      ];
      const segW = (W-92)/4;
      items.forEach((it,i)=>{
        const cx = 46 + segW*i + segW/2;
        ctx.font = '700 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#E8C878';
        ctx.fillText(it[0], cx, barY0+22);
        ctx.font = '400 10px "Work Sans", sans-serif';
        ctx.fillStyle = '#D7DAE6';
        ctx.fillText(it[1], cx, barY0+40);
        if (i>0){
          ctx.strokeStyle = '#33406A'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(46+segW*i, barY0+10); ctx.lineTo(46+segW*i, barY1-10); ctx.stroke();
        }
      });

      document.getElementById('certPreviewWrap').style.display = 'block';
      document.getElementById('certDownloadBtn').href = canvas.toDataURL('image/png');
      document.getElementById('certPreviewWrap').scrollIntoView({behavior:'smooth', block:'center'});
    }

    if (certLogo.complete) { draw(); } else { certLogo.onload = draw; certLogo.onerror = draw; }
  }

  // ===== Student ID Card Generator =====
  const idLogo = new Image();
  idLogo.src = 'logo.png';
  let idPhotoImg = null;

  const idPhotoEl = document.getElementById('idPhoto');
  if (idPhotoEl) idPhotoEl.addEventListener('change', function(e){
    const file = e.target.files[0];
    if (!file) { idPhotoImg = null; return; }
    const reader = new FileReader();
    reader.onload = function(ev){
      idPhotoImg = new Image();
      idPhotoImg.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  function idCardStorageKey(code){
    return 'ekveera_idcard_used_' + code.trim().toUpperCase();
  }

  // ID Card Verification Web App — Attendance Database mein live check + one-time lock
  const ID_VERIFY_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbycx5J5DMOVq3hpfbVPvyD6yDHXX2C2TEA9HdptFEEmv73g5VeiJ9Ov608hnK15AlpzHA/exec';

  async function verifyAccessCode(code, name){
    const url = ID_VERIFY_WEB_APP_URL + '?code=' + encodeURIComponent(code) + '&name=' + encodeURIComponent(name) + '&_=' + Date.now();
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Verify request failed');
    return await res.json(); // { status: 'ok' | 'used' | 'name_mismatch' | 'not_found' | 'error', message, name }
  }

  async function generateIdCard(){
    const errorEl = document.getElementById('idCardError');
    errorEl.style.display = 'none';

    const code = document.getElementById('idAccessCode').value.trim().toUpperCase();
    const name = document.getElementById('idName').value.trim();
    const mobile = document.getElementById('idMobile').value.trim();
    const batch = document.getElementById('idBatch').value.trim() || '—';

    if (!code){
      errorEl.textContent = __t('❌ कृपया अपना Access Code डालें (Payment के बाद WhatsApp पर मिलेगा)।');
      errorEl.style.display = 'block';
      return;
    }
    if (!name){
      errorEl.textContent = __t('❌ कृपया अपना नाम डालें।');
      errorEl.style.display = 'block';
      return;
    }

    // one-time-download check (per browser/device)
    if (localStorage.getItem(idCardStorageKey(code))){
      errorEl.textContent = __t('⚠️ इस Access Code से ID Card पहले ही इस डिवाइस पर डाउनलोड किया जा चुका है। अगर कोई गड़बड़ी लगे तो WhatsApp पर संपर्क करें।');
      errorEl.style.display = 'block';
      document.getElementById('idCardPreviewWrap').style.display = 'none';
      return;
    }

    // Attendance Database mein Reg. No. check karein — bina isse ID Card nahi banega
    const genBtn = document.querySelector('button[onclick="generateIdCard()"]');
    const originalBtnText = genBtn ? genBtn.textContent : '';
    if (genBtn){ genBtn.disabled = true; genBtn.textContent = __t('जांच हो रही है...'); }

    let result;
    try {
      result = await verifyAccessCode(code, name);
    } catch (err){
      if (genBtn){ genBtn.disabled = false; genBtn.textContent = originalBtnText; }
      errorEl.textContent = __t('⚠️ अभी वेरीफाई नहीं हो पाया (इंटरनेट/सर्वर समस्या) — कृपया थोड़ी देर बाद फिर कोशिश करें।');
      errorEl.style.display = 'block';
      document.getElementById('idCardPreviewWrap').style.display = 'none';
      return;
    }
    if (genBtn){ genBtn.disabled = false; genBtn.textContent = originalBtnText; }

    if (result.status === 'used'){
      errorEl.textContent = __t('⚠️ यह Access Code से ID Card पहले ही बन चुका है। दोबारा नहीं बन सकता। किसी गड़बड़ी के लिए WhatsApp (9766284669) पर संपर्क करें।');
      errorEl.style.display = 'block';
      document.getElementById('idCardPreviewWrap').style.display = 'none';
      return;
    }
    if (result.status === 'name_mismatch'){
      errorEl.textContent = __t('❌ यह नाम इस Access Code से मेल नहीं खा रहा। कृपया वही नाम भरें जो Attendance रिकॉर्ड में दर्ज है (Batch/WhatsApp पर पूछ सकते हैं)।');
      errorEl.style.display = 'block';
      document.getElementById('idCardPreviewWrap').style.display = 'none';
      return;
    }
    if (result.status === 'not_found'){
      errorEl.textContent = __t('❌ यह Access Code अभी तक हमारे Attendance रिकॉर्ड में नहीं मिला। कृपया सही Access Code डालें, या हमें WhatsApp (9766284669) पर संपर्क करें।');
      errorEl.style.display = 'block';
      document.getElementById('idCardPreviewWrap').style.display = 'none';
      return;
    }
    if (result.status !== 'ok'){
      errorEl.textContent = __t('⚠️ अभी वेरीफाई नहीं हो पाया — कृपया थोड़ी देर बाद फिर कोशिश करें।');
      errorEl.style.display = 'block';
      document.getElementById('idCardPreviewWrap').style.display = 'none';
      return;
    }

    const canvas = document.getElementById('idCardCanvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    function draw(){
      // background
      ctx.fillStyle = '#FAF7F1';
      ctx.fillRect(0,0,W,H);

      // top navy strip
      ctx.fillStyle = '#152241';
      ctx.fillRect(0,0,W,120);
      ctx.fillStyle = '#E8A33D';
      ctx.fillRect(0,120,W,6);

      if (idLogo.complete && idLogo.naturalWidth > 0){
        ctx.drawImage(idLogo, 28, 20, 80, 80);
      }
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fff';
      ctx.font = '700 30px "Space Grotesk", sans-serif';
      ctx.fillText('EKVEERA TRAINING CENTER', 122, 55);
      ctx.font = '600 15px "Work Sans", sans-serif';
      ctx.fillStyle = '#C9CFE0';
      ctx.fillText('STUDENT IDENTITY CARD', 122, 82);

      // photo box
      const px = 40, py = 155, pw = 220, ph = 260;
      ctx.fillStyle = '#EDEBE3';
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = '#C9A24B';
      ctx.lineWidth = 3;
      ctx.strokeRect(px, py, pw, ph);
      if (idPhotoImg && idPhotoImg.complete && idPhotoImg.naturalWidth > 0){
        // cover-fit the photo into the box
        const ir = idPhotoImg.naturalWidth / idPhotoImg.naturalHeight;
        const br = pw / ph;
        let sx, sy, sw, sh;
        if (ir > br){ sh = idPhotoImg.naturalHeight; sw = sh*br; sx = (idPhotoImg.naturalWidth-sw)/2; sy = 0; }
        else { sw = idPhotoImg.naturalWidth; sh = sw/br; sx = 0; sy = (idPhotoImg.naturalHeight-sh)/2; }
        ctx.drawImage(idPhotoImg, sx, sy, sw, sh, px, py, pw, ph);
      } else {
        ctx.fillStyle = '#9AA3BC';
        ctx.font = '600 14px "Work Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PHOTO', px+pw/2, py+ph/2);
        ctx.textAlign = 'left';
      }

      // details
      const dx = 300;
      let dy = 175;
      ctx.fillStyle = '#5B6478';
      ctx.font = '600 13px "Work Sans", sans-serif';
      ctx.fillText('NAME', dx, dy);
      ctx.fillStyle = '#152241';
      ctx.font = '700 24px "Space Grotesk", sans-serif';
      ctx.fillText(name, dx, dy+30);

      dy += 75;
      ctx.fillStyle = '#5B6478';
      ctx.font = '600 13px "Work Sans", sans-serif';
      ctx.fillText('ID / ACCESS CODE', dx, dy);
      ctx.fillStyle = '#E8A33D';
      ctx.font = '700 22px "Space Grotesk", sans-serif';
      ctx.fillText(code, dx, dy+28);

      dy += 68;
      ctx.fillStyle = '#5B6478';
      ctx.font = '600 13px "Work Sans", sans-serif';
      ctx.fillText('COURSE', dx, dy);
      ctx.fillStyle = '#152241';
      ctx.font = '600 17px "Work Sans", sans-serif';
      ctx.fillText('Call Center & Customer Service Training', dx, dy+24);

      dy += 55;
      ctx.fillStyle = '#5B6478';
      ctx.font = '600 13px "Work Sans", sans-serif';
      ctx.fillText('BATCH', dx, dy);
      ctx.fillStyle = '#152241';
      ctx.font = '600 17px "Work Sans", sans-serif';
      ctx.fillText(batch, dx, dy+24);

      if (mobile){
        dy += 55;
        ctx.fillStyle = '#5B6478';
        ctx.font = '600 13px "Work Sans", sans-serif';
        ctx.fillText('MOBILE', dx, dy);
        ctx.fillStyle = '#152241';
        ctx.font = '600 17px "Work Sans", sans-serif';
        ctx.fillText(mobile, dx, dy+24);
      }

      // footer
      ctx.fillStyle = '#152241';
      ctx.fillRect(0, H-70, W, 70);
      ctx.fillStyle = '#fff';
      ctx.font = '600 13px "Work Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(__t('यह कार्ड सिर्फ Training Batch के दौरान मान्य है  ·  9766284669'), W/2, H-32);
      ctx.textAlign = 'left';

      document.getElementById('idCardPreviewWrap').style.display = 'block';
      document.getElementById('idCardDownloadBtn').href = canvas.toDataURL('image/png');
      document.getElementById('idCardDownloadBtn').setAttribute('data-code', code);
      document.getElementById('idCardPreviewWrap').scrollIntoView({behavior:'smooth', block:'center'});
    }

    if (idLogo.complete && (!idPhotoImg || idPhotoImg.complete)) { draw(); }
    else {
      idLogo.onload = draw; idLogo.onerror = draw;
      if (idPhotoImg) { idPhotoImg.onload = draw; idPhotoImg.onerror = draw; }
    }
  }

  function markIdCardDownloaded(){
    const code = document.getElementById('idCardDownloadBtn').getAttribute('data-code');
    if (code){ localStorage.setItem(idCardStorageKey(code), '1'); }
  }



function toggleMobileMenu(){
  const m=document.getElementById('mobileMenu');
  if(m) m.classList.toggle('open');
}
function copyUPI(){
  const id='9766284669@ybl';
  navigator.clipboard?.writeText(id).then(()=>{
    const b=document.querySelector('.upi-id-box button');
    if(b){const old=b.textContent;b.textContent='Copied ✓';setTimeout(()=>b.textContent=old,1400);}
  });
}

// ---- PWA: Service Worker + Install App button ----
if ('serviceWorker' in navigator) {
  let _ekvUserAskedUpdate = false;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').then((reg) => {
      const showUpdate = (worker) => ekvShowUpdateBar(worker);
      if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate(nw);
        });
      });
      const check = () => { try { reg.update().catch(() => {}); } catch (e) {} };
      check();
      setInterval(check, 30 * 60 * 1000);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
    }).catch(() => {});
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (_ekvUserAskedUpdate) location.reload();     // Update dabane ke baad hi naya Version laga kar page ek baar Reload hota hai
  });
  window.ekvShowUpdateBar = function (worker) {
    if (document.getElementById('ekvUpdateBar')) return;
    const bar = document.createElement('div');
    bar.id = 'ekvUpdateBar';
    bar.className = 'ekv-update-bar';
    bar.innerHTML = '<span>' + __t('🔄 EkVeera का नया Version आ गया है।') + '</span>'
      + '<button type="button" class="ekv-up-go">' + __t('अभी Update करें') + '</button>'
      + '<button type="button" class="ekv-up-later">' + __t('बाद में') + '</button>';
    document.body.appendChild(bar);
    bar.querySelector('.ekv-up-go').onclick = function () {
      this.textContent = __t('⏳ Update हो रहा है...'); this.disabled = true;
      _ekvUserAskedUpdate = true;
      try { worker.postMessage('SKIP_WAITING'); } catch (e) { location.reload(); }
      setTimeout(() => location.reload(), 4000);    // surakshit tareeka: agar signal na mile to bhi Reload
    };
    bar.querySelector('.ekv-up-later').onclick = function () { bar.remove(); };
  };
}
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById('pwaInstallBtn');
  if (btn) btn.style.display = 'inline-flex';
  const mBtn = document.getElementById('pwaInstallBtnMobile');
  if (mBtn) mBtn.style.display = 'block';
});
function installEkVeeraApp(){
  if (!deferredInstallPrompt) {
    alert(__t('App पहले से Install है, या आपका Browser अभी Install Support नहीं करता। Chrome/Edge (Android/Desktop) में सबसे अच्छे से काम करता है।'));
    return;
  }
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.finally(() => {
    deferredInstallPrompt = null;
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.style.display = 'none';
    const mBtn = document.getElementById('pwaInstallBtnMobile');
    if (mBtn) mBtn.style.display = 'none';
  });
}
window.addEventListener('appinstalled', () => {
  const btn = document.getElementById('pwaInstallBtn');
  if (btn) btn.style.display = 'none';
  const mBtn = document.getElementById('pwaInstallBtnMobile');
  if (mBtn) mBtn.style.display = 'none';
});

// ---- Share App button ----
function shareEkVeeraApp(){
  const shareData = {
    title: 'EkVeera Training Center',
    text: __t('EkVeera Training Center — Call Center & Customer Service Training. Admission Form, ID Card, Certificate सब यहीं से करें:'),
    url: window.location.href.split('#')[0]
  };
  if (navigator.share){
    navigator.share(shareData).catch(() => {});
  } else if (navigator.clipboard){
    navigator.clipboard.writeText(shareData.url).then(() => {
      const btn = document.getElementById('shareAppBtn');
      if (btn){
        const old = btn.innerHTML;
        btn.innerHTML = __t('✅ Link Copy हो गया');
        setTimeout(() => { btn.innerHTML = old; }, 1800);
      }
    });
  } else {
    window.prompt(__t('इस लिंक को कॉपी करके भेज दीजिए:'), shareData.url);
  }
}



// ---------------- टॉपिक 2: Search Features ----------------
const SEARCH_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbycx5J5DMOVq3hpfbVPvyD6yDHXX2C2TEA9HdptFEEmv73g5VeiJ9Ov608hnK15AlpzHA/exec'; // वही Web App, बस अलग action पैरामीटर के साथ

// Password जैसी संवेदनशील चीज़ें अब हमेशा POST (छुपे तरीके) से भेजी जाती हैं — कभी URL में नहीं
async function vcSecurePost(params) {
  const res = await fetch(SEARCH_WEB_APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params)
  });
  return res.json();
}
let lastSearchCandResults = [];
let lastSearchCompResults = [];

function switchSearchTab(tab) {
  const candBox = document.getElementById('searchCandBox');
  const compBox = document.getElementById('searchCompBox');
  const candBtn = document.getElementById('tabSearchCand');
  const compBtn = document.getElementById('tabSearchComp');
  if (tab === 'candidate') {
    candBox.style.display = 'block';
    compBox.style.display = 'none';
    candBtn.classList.add('is-active');
    compBtn.classList.remove('is-active');
  } else {
    candBox.style.display = 'none';
    compBox.style.display = 'block';
    compBtn.classList.add('is-active');
    candBtn.classList.remove('is-active');
  }
}

function _rtEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function renderResultsTable(containerId, rows, opts) {
  const el = document.getElementById(containerId);
  if (!rows || !rows.length) {
    el.innerHTML = __t('<p style="padding:18px;color:#555;">कोई नतीजा नहीं मिला।</p>');
    return;
  }
  const cols = Object.keys(rows[0]);
  const withApply = !!(opts && opts.apply);
  const withSelect = !!(opts && opts.select);
  const withPickCo = !!(opts && opts.pickCo);
  const thS = 'padding:8px 10px;text-align:left;white-space:nowrap;';
  let html = '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
  html += '<tr style="background:var(--navy);color:#fff;">'
    + (withSelect ? '<th style="' + thS + 'position:sticky;left:0;background:var(--navy);z-index:1;"><label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="selAllCand" onclick="selAllCand(this)" style="width:17px;height:17px;"> ' + __t('चुनें') + '</label></th>' : '')
    + (withPickCo ? '<th style="' + thS + '">' + __t('Details चुनें') + '</th>' : '')
    + (withApply ? '<th style="' + thS + '">Apply</th>' : '')
    + cols.map(c => `<th style="${thS}">${_rtEsc(c)}</th>`).join('') + '</tr>';
  rows.forEach((r, i) => {
    const cid = withSelect ? _candIdOf(r) : '';
    const on = withSelect && cid && _selCand.has(cid);
    const bg = on ? '#fff3d6' : (i % 2 ? '#f5f7fa' : '#fff');
    html += `<tr data-i="${i}" ${withSelect && cid ? `onclick="selRowCand(${i},event)" style="cursor:pointer;background:${bg};"` : `style="background:${bg};"`}>`
      + (withSelect ? `<td style="padding:6px 10px;position:sticky;left:0;background:${bg};">${cid ? `<input type="checkbox" class="sel-cb" data-i="${i}" ${on ? 'checked' : ''} onclick="event.stopPropagation();selCbCand(this)" style="width:18px;height:18px;">` : ''}</td>` : '')
      + (withPickCo ? `<td style="padding:6px 10px;text-align:center;"><input type="checkbox" class="co-cb" data-i="${i}" ${window.ekvCoIsPicked && window.ekvCoIsPicked(i) ? 'checked' : ''} onclick="ekvCoPick(${i},this.checked)" style="width:18px;height:18px;" aria-label="Company Details"></td>` : '')
      + (withApply ? `<td style="padding:6px 10px;"><button type="button" class="apply-btn" onclick="openApply(${i}${__t(`)">📨 Apply करें</button></td>`)}` : '')
      + cols.map(c => `<td style="padding:8px 10px;white-space:nowrap;">${_rtEsc(r[c])}</td>`).join('') + '</tr>';
  });
  html += '</table>';
  el.innerHTML = html;
  if (withSelect) _selBarUpdate();
}

// ✅ Company: Candidate की सूची में Row दबाकर चुनना → "OK" दबाते ही IDs "चुनी हुई Candidate ID" बॉक्स में
const _selCand = new Set();
function _candIdOf(r) {
  if (!r) return '';
  const re = /^(?:TRA-)?CAND\d+$/i;
  let k, v;
  for (k in r) { if (/candidate\s*id|^id$|training.*id|reg\.?\s*no/i.test(k)) { v = String(r[k] == null ? '' : r[k]).trim(); if (re.test(v)) return v.toUpperCase(); } }
  for (k in r) { v = String(r[k] == null ? '' : r[k]).trim(); if (re.test(v)) return v.toUpperCase(); }
  for (k in r) { if (/candidate\s*id/i.test(k)) { v = String(r[k] == null ? '' : r[k]).trim(); if (v) return v.toUpperCase(); } }
  return '';
}
function _selPaint() {
  document.querySelectorAll('#searchCandResults tr[data-i]').forEach(function (tr) {
    const cb = tr.querySelector('.sel-cb'); if (!cb) return;
    const id = _candIdOf(lastSearchCandResults[+tr.getAttribute('data-i')]);
    const on = _selCand.has(id), i = +tr.getAttribute('data-i');
    cb.checked = on;
    const bg = on ? '#fff3d6' : (i % 2 ? '#f5f7fa' : '#fff');
    tr.style.background = bg;
    const td = tr.firstElementChild; if (td) td.style.background = bg;
  });
  const all = document.getElementById('selAllCand');
  if (all) {
    const ids = lastSearchCandResults.map(_candIdOf).filter(Boolean);
    all.checked = ids.length > 0 && ids.every(function (x) { return _selCand.has(x); });
  }
  _selBarUpdate();
}
function _selFlip(i) {
  const id = _candIdOf(lastSearchCandResults[i]); if (!id) return;
  if (_selCand.has(id)) _selCand.delete(id); else _selCand.add(id);
}
function selRowCand(i, ev) {
  if (ev && ev.target && /^(A|BUTTON|INPUT)$/.test(ev.target.tagName)) return;
  if (window.getSelection && String(window.getSelection()).length > 0) return;   // text copy कर रहे हों तो Row न बदले
  _selFlip(i); _selPaint();
}
function selCbCand(cb) { _selFlip(+cb.getAttribute('data-i')); _selPaint(); }
function selAllCand(cb) {
  lastSearchCandResults.map(_candIdOf).filter(Boolean).forEach(function (id) { if (cb.checked) _selCand.add(id); else _selCand.delete(id); });
  _selPaint();
}
function selClearCand() { _selCand.clear(); _selPaint(); }
function _selBarUpdate() {
  const bar = document.getElementById('candSelBar'); if (!bar) return;
  if (!_selCand.size) { bar.style.display = 'none'; bar.innerHTML = ''; return; }
  bar.style.display = 'flex';
  bar.innerHTML = '<span class="csb-n">✅ ' + _selCand.size + __t(' Candidate चुने गए') + '</span>'
    + '<button type="button" class="csb-ok" onclick="selOkCand()">' + __t('OK — IDs भर दें') + '</button>'
    + '<button type="button" class="csb-clr" onclick="selClearCand()">' + __t('सब हटाएँ') + '</button>';
}
function selOkCand() {
  const box = document.getElementById('reqIds'); if (!box || !_selCand.size) return;
  const have = box.value.split(',').map(function (s) { return s.trim().toUpperCase(); }).filter(Boolean);
  const merged = have.slice();
  _selCand.forEach(function (id) { if (merged.indexOf(id) === -1) merged.push(id); });
  box.value = merged.join(', ');
  try { updateReqPrice(); } catch (e) {}
  const msg = document.getElementById('reqResultMsg');
  if (msg) { msg.style.color = '#1b7f3b'; msg.textContent = __t('✅ चुनी हुई Candidate ID नीचे वाले बॉक्स में भर दी गई हैं। अब Company ID और Post की संख्या भरकर "Request भेजें" दबाएँ।'); }
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  box.classList.add('flash-box'); setTimeout(function () { box.classList.remove('flash-box'); }, 2200);
  _selCand.clear(); _selPaint();
}

// ⚡ तेज़ Search: पूरी सूची एक बार आती है (Server उसे Cache से देता है), फिर हर नई खोज आपके Phone/Computer में ही
// तुरंत छन जाती है — दोबारा Server तक जाना नहीं पड़ता। (सूची 3 मिनट ताज़ा मानी जाती है; बहुत बड़ी हो जाए तो पुराने तरीके से Server से खोज)
const _srchAll = {};            // action -> { t, rows } ; rows=null मतलब सूची बहुत बड़ी, Server से ही खोजेंगे
const _srchCache = {};          // (बड़ी सूची की हालत में) हर खोज का जवाब 90 सेकंड याद रखना
let _srchSeqCand = 0, _srchSeqComp = 0;
const _SRCH_MAX_ROWS = 4000, _SRCH_TTL = 180000;

function _srchRowText(o) {
  let t = '';
  for (const k in o) { if (k !== 'List' && Object.prototype.hasOwnProperty.call(o, k)) t += ' ' + o[k]; }
  return t.toLowerCase();
}
function _srchLoadAll(action) {
  const hit = _srchAll[action];
  if (hit && Date.now() - hit.t < _SRCH_TTL) return Promise.resolve(hit);
  if (hit && hit.pending) return hit.pending;
  const pending = fetch(SEARCH_WEB_APP_URL + '?action=' + action + '&q=')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d || d.status !== 'ok') { delete _srchAll[action]; return d; }
      const rows = d.results || [];
      const entry = { t: Date.now(), rows: rows.length <= _SRCH_MAX_ROWS ? rows.map(function (o) { return { o: o, t: _srchRowText(o) }; }) : null };
      _srchAll[action] = entry; return entry;
    })
    .catch(function (e) { delete _srchAll[action]; throw e; });
  _srchAll[action] = Object.assign({}, hit || {}, { pending: pending, t: 0 });
  return pending;
}
function _srchFetch(action, q) {
  const key = action + '|' + q.toLowerCase();
  return _srchLoadAll(action).then(function (entry) {
    if (entry && entry.status && entry.status !== 'ok') return entry;               // Server की गलती वैसी ही लौटाएं
    if (entry && entry.rows) {                                                        // ⚡ यहीं छानना — तुरंत
      const ql = q.trim().toLowerCase();
      const out = entry.rows.filter(function (r) { return !ql || r.t.indexOf(ql) !== -1; }).map(function (r) { return r.o; });
      return { status: 'ok', count: out.length, results: out };
    }
    const hit = _srchCache[key];                                                      // बड़ी सूची: Server से खोज
    if (hit && Date.now() - hit.t < 90000) return hit.data;
    return fetch(SEARCH_WEB_APP_URL + '?action=' + action + '&q=' + encodeURIComponent(q))
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.status === 'ok') _srchCache[key] = { t: Date.now(), data: d }; return d; });
  });
}
let _srchWarmed = 0;
function _srchWarm() {
  if (Date.now() - _srchWarmed < 100000) return;
  _srchWarmed = Date.now();
  ['searchcompany', 'searchcandidate'].forEach(function (a, i) {
    setTimeout(function () { try { _srchLoadAll(a).catch(function () {}); } catch (e) {} }, i * 300);
  });
}
// हर पेज पर: खुलते ही (फ़ुर्सत मिलने पर) Server को एक हल्का "ping" भेजकर जगा देना, ताकि पहली खोज/पहला काम धीमा न पड़े
(function () {
  if (typeof SEARCH_WEB_APP_URL === 'undefined') return;
  const go = function () { try { fetch(SEARCH_WEB_APP_URL + '?action=ping').catch(function () {}); } catch (e) {} };
  if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 2500 }); else setTimeout(go, 1200);
})();
(function () {
  const target = document.getElementById('search');
  if (!target) return;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (en) { if (en.some(function (x) { return x.isIntersecting; })) { _srchWarm(); io.disconnect(); } }, { rootMargin: '300px' });
    io.observe(target);
  } else _srchWarm();
  target.addEventListener('focusin', _srchWarm);
  target.addEventListener('pointerdown', _srchWarm);
})();

async function runSearchCandidate() {
  const q = document.getElementById('searchCandInput').value.trim();
  const el = document.getElementById('searchCandResults');
  el.innerHTML = __t('<p style="padding:18px;color:#555;">खोजा जा रहा है...</p>');
  const mySeq = ++_srchSeqCand;
  try {
    const data = await _srchFetch('searchcandidate', q);
    if (mySeq !== _srchSeqCand) return;       // इस बीच नई खोज हो चुकी है — पुराना जवाब न दिखाएं
    lastSearchCandResults = data.results || [];
    renderResultsTable('searchCandResults', lastSearchCandResults, { select: true });
    if (lastSearchCandResults.length) {
      el.insertAdjacentHTML('afterbegin', '<p style="padding:6px 4px 12px;color:#c9d6e8;font-size:13.5px;">✅ ' + lastSearchCandResults.length + __t(' नतीजे मिले — जिन्हें चुनना है उनकी Row दबाएँ (✔ लग जाएगा), फिर "OK — IDs भर दें" दबाएँ; IDs नीचे अपने-आप भर जाएँगी। चाहें तो "⬇ Excel Download" भी कर सकते हैं।</p>'));
    }
  } catch (err) {
    el.innerHTML = __t('<p style="padding:18px;color:#C0392B;">कुछ गड़बड़ हो गई: ') + _rtEsc(err.message) + '</p>';
  }
}

async function runSearchCompany() {
  const q = document.getElementById('searchCompInput').value.trim();
  const el = document.getElementById('searchCompResults');
  el.innerHTML = __t('<p style="padding:18px;color:#555;">खोजा जा रहा है...</p>');
  const mySeq = ++_srchSeqComp;
  try {
    const data = await _srchFetch('searchcompany', q);
    if (mySeq !== _srchSeqComp) return;
    lastSearchCompResults = data.results || [];
    if (window.ekvCoReset) window.ekvCoReset();
    renderResultsTable('searchCompResults', lastSearchCompResults, { apply: true, pickCo: true });
    if (lastSearchCompResults.length) {
      el.insertAdjacentHTML('afterbegin', '<p style="padding:6px 4px 12px;color:#c9d6e8;font-size:13.5px;">✅ ' + lastSearchCompResults.length + __t(' नतीजे मिले — जो Company पसंद आए उसकी Row में <strong>"📨 Apply करें"</strong> दबाकर अपनी जानकारी भेजें (बिल्कुल Free)। Company का पता चाहिए तो <strong>"Details चुनें"</strong> में ✔ लगाएँ।</p>'));
    }
  } catch (err) {
    el.innerHTML = __t('<p style="padding:18px;color:#C0392B;">कुछ गड़बड़ हो गई: ') + err.message + '</p>';
  }
}

// 🔁 Excel Download के लिए भरोसेमंद तरीका — Manual Blob + अपना-अलग <a> टैग हर बार बनाना और
// इस्तेमाल के बाद तुरंत हटा देना, ताकि बार-बार Download करने पर भी हर बार सही से काम करे
// (सिर्फ XLSX.writeFile() पर भरोसा करने से कुछ Mobile Browsers में सिर्फ पहली बार ही Download होता है)
function vcDownloadXlsx(rows, sheetLabel, fileNamePrefix) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetLabel);
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileNamePrefix + '_' + Date.now() + '.xlsx';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

function downloadSearchResults(which) {
  const rows = which === 'cand' ? lastSearchCandResults : lastSearchCompResults;
  if (!rows || !rows.length) {
    alert(__t('पहले खोज लीजिए (कम-से-कम 1 नतीजा आना चाहिए), उसके बाद Download करें।'));
    return;
  }
  try {
    vcDownloadXlsx(rows, 'Results', which === 'cand' ? 'EkVeera_Candidates' : 'EkVeera_Companies');
    alert(__t('✅ Excel Download हो गया है! अपने Phone/Computer के "Downloads" Folder में देखें। (हर बार दोबारा Download कर सकते हैं)'));
  } catch (err) {
    alert(__t('Excel बनाने में दिक्कत आई: ') + err.message + __t('\n\nकृपया इस Message का Screenshot EkVeera को भेजें।'));
  }
}

// ---------------- 💰 Payment-Gated Detail Download ----------------
function updateReqPrice() {
  const numPosts = parseInt(document.getElementById('reqNumPosts').value, 10) || 0;
  const ids = document.getElementById('reqIds').value.split(',').map(s => s.trim()).filter(Boolean);
  if (numPosts <= 0 || ids.length === 0) {
    document.getElementById('reqPrice').textContent = '__';
    return;
  }
  const price = numPosts * 99 + ids.length * 29;
  document.getElementById('reqPrice').textContent = price;
}

async function sendUnlockRequest() {
  const companyId = document.getElementById('reqCompanyId').value.trim();
  const numPosts = document.getElementById('reqNumPosts').value.trim();
  const ids = document.getElementById('reqIds').value.trim();
  const msgEl = document.getElementById('reqResultMsg');
  if (!companyId || !numPosts || !ids) {
    msgEl.style.color = '#ff8080';
    msgEl.textContent = __t('कृपया Company ID, Post की संख्या और कम-से-कम एक ID भरें।');
    return;
  }
  msgEl.style.color = '#9fe3a0';
  msgEl.textContent = __t('भेजा जा रहा है...');
  try {
    const url = SEARCH_WEB_APP_URL + '?action=requestunlock&companyId=' + encodeURIComponent(companyId) +
      '&numPosts=' + encodeURIComponent(numPosts) + '&ids=' + encodeURIComponent(ids) + '&_=' + Date.now();
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'ok') {
      document.getElementById('checkRequestId').value = data.requestId;
      document.getElementById('checkCompanyId').value = companyId;
      if (data.paymentLink) {
        msgEl.innerHTML = __t('✅ Request भेज दी गई! Request ID: <strong>') + data.requestId + __t('</strong> (राशि ₹') + data.amount + ')' +
          '<br><a class="btn btn-primary" style="margin-top:12px;display:inline-block;" href="' + data.paymentLink + __t('" target="_blank" rel="noopener">💳 अभी ₹') + data.amount + __t(' Pay करें</a>') +
          __t('<br><span style="font-size:12.5px;">Payment करके इसी Page पर वापस आ जाएं — यहां अपने-आप Check होकर नीचे Download Button दिख जाएगा, कुछ और करने की ज़रूरत नहीं।</span>');
        vcAutoPollUnlockStatus(companyId, data.requestId);
      } else {
        msgEl.textContent = __t('✅ Request भेज दी गई! Request ID: ') + data.requestId + __t(' (राशि ₹') + data.amount + __t(') — Payment Link बनाने में दिक्कत आई, कृपया WhatsApp पर संपर्क करें।');
      }
    } else {
      msgEl.style.color = '#ff8080';
      msgEl.textContent = data.message || __t('कुछ गड़बड़ हो गई।');
    }
  } catch (err) {
    msgEl.style.color = '#ff8080';
    msgEl.textContent = __t('कुछ गड़बड़ हो गई, दोबारा कोशिश करें।');
  }
}

// 🔄 Payment Link दिखने के बाद हर 5 सेकंड में अपने-आप Status Check करना — Company को खुद
// Button दबाने की ज़रूरत नहीं, Payment होते ही थोड़ी देर में अपने-आप Download Button आ जाएगा
let vcUnlockPollTimer = null;
function vcAutoPollUnlockStatus(companyId, reqId) {
  if (vcUnlockPollTimer) clearInterval(vcUnlockPollTimer);
  document.getElementById('checkCompanyId').value = companyId;
  document.getElementById('checkRequestId').value = reqId;
  let tries = 0;
  vcUnlockPollTimer = setInterval(async function () {
    tries++;
    if (tries > 36) { clearInterval(vcUnlockPollTimer); return; } // ~3 मिनट बाद अपने-आप रुक जाए
    try {
      const url = SEARCH_WEB_APP_URL + '?action=checkunlock&companyId=' + encodeURIComponent(companyId) +
        '&requestId=' + encodeURIComponent(reqId) + '&_=' + Date.now();
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'ok' && data.requestStatus === 'Approved') {
        clearInterval(vcUnlockPollTimer);
        const msgEl = document.getElementById('checkStatusMsg');
        const dlBtn = document.getElementById('downloadDetailsBtn');
        if (msgEl) { msgEl.style.color = 'green'; msgEl.textContent = __t('✅ Payment Verify हो गया! नीचे Download बटन दबाएं।'); }
        if (dlBtn) dlBtn.style.display = 'inline-flex';
      } else if (data.status === 'ok' && data.requestStatus && data.requestStatus.indexOf('Amount Mismatch') === 0) {
        clearInterval(vcUnlockPollTimer);
        const msgEl = document.getElementById('checkStatusMsg');
        if (msgEl) { msgEl.style.color = '#C0392B'; msgEl.textContent = '⚠️ ' + data.requestStatus; }
      }
    } catch (err) { /* अगली बार फिर कोशिश हो जाएगी, अभी चुपचाप छोड़ दें */ }
  }, 5000);
}

async function checkUnlockStatus() {
  const companyId = document.getElementById('checkCompanyId').value.trim();
  const reqId = document.getElementById('checkRequestId').value.trim();
  const msgEl = document.getElementById('checkStatusMsg');
  const dlBtn = document.getElementById('downloadDetailsBtn');
  dlBtn.style.display = 'none';
  const plBtn = document.getElementById('checkPayLinkBtn'); if (plBtn) plBtn.style.display = 'none';
  if (!companyId || !reqId) {
    msgEl.textContent = __t('कृपया Company ID और Request ID दोनों भरें।');
    return;
  }
  msgEl.textContent = __t('जांचा जा रहा है...');
  try {
    const url = SEARCH_WEB_APP_URL + '?action=checkunlock&companyId=' + encodeURIComponent(companyId) +
      '&requestId=' + encodeURIComponent(reqId) + '&_=' + Date.now();
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'ok' && data.requestStatus === 'Approved') {
      msgEl.style.color = 'green';
      msgEl.textContent = __t('✅ Approved हो चुका है! नीचे Download बटन दबाएं।');
      dlBtn.style.display = 'inline-flex';
    } else if (data.status === 'ok' && data.requestStatus && data.requestStatus.indexOf('Amount Mismatch') === 0) {
      msgEl.style.color = '#C0392B';
      msgEl.textContent = '⚠️ ' + data.requestStatus;
    } else if (data.status === 'ok') {
      msgEl.style.color = '';
      msgEl.textContent = __t('⏳ अभी भी Pending है — Payment verify होने का इंतज़ार करें। (अगर Payment अभी तक नहीं किया है तो नीचे बटन से करें)');
      showCompanyPayLink(companyId, reqId);
    } else {
      msgEl.style.color = '';
      msgEl.textContent = __t('यह Request ID/Company ID नहीं मिली।');
    }
  } catch (err) {
    msgEl.textContent = __t('कुछ गड़बड़ हो गई, दोबारा कोशिश करें।');
  }
}

// Payment बाकी हो तो उसी Request का अपना Payment Link दोबारा दिखाना (Link खो जाने पर)
async function showCompanyPayLink(companyId, reqId) {
  try {
    const d = await vcSecurePost({ action: 'getpaymentlink', kind: 'company', companyId: companyId, requestId: reqId });
    const b = document.getElementById('checkPayLinkBtn');
    if (b && d.status === 'ok' && d.payLink) {
      b.href = d.payLink;
      b.textContent = __t('💳 अभी ₹') + d.amount + __t(' Pay करें (Request ') + reqId.toUpperCase() + ')';
      b.style.display = 'inline-flex';
    }
  } catch (e) { /* Link न मिले तो बाकी सब चलता रहे */ }
}

async function downloadCandidateDetails() {
  const companyId = document.getElementById('checkCompanyId').value.trim();
  const reqId = document.getElementById('checkRequestId').value.trim();
  const msgEl = document.getElementById('checkStatusMsg');
  try {
    const url = SEARCH_WEB_APP_URL + '?action=getcandidatedetails&companyId=' + encodeURIComponent(companyId) +
      '&requestId=' + encodeURIComponent(reqId) + '&_=' + Date.now();
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'ok' && data.results && data.results.length) {
      vcDownloadXlsx(data.results, 'Candidate Database', 'EkVeera_Candidate_Database_' + companyId);
      if (data.missingIds && data.missingIds.length && msgEl) {
        msgEl.style.color = '#C0392B';
        msgEl.textContent = __t('✅ Download हो गया, लेकिन इन ID का Data नहीं मिला (चेक करें, शायद Typo है): ') + data.missingIds.join(', ');
      } else if (msgEl) {
        msgEl.style.color = 'green';
        msgEl.textContent = __t('✅ Candidate Database Excel Download हो गई।');
      }
    } else if (data.status === 'not_approved') {
      alert(__t('अभी यह Request Approved नहीं हुई है — पहले Admin से Payment Verify/Approve करवाएं।'));
    } else if (data.status === 'not_found') {
      alert(__t('यह Company ID / Request ID सही नहीं लग रही — दोबारा जांच लें।'));
    } else {
      alert(data.message || __t('Download नहीं हो पाया, दोबारा कोशिश करें।'));
    }
  } catch (err) {
    alert(__t('Server से जवाब नहीं मिल पाया — Internet चेक करके दोबारा कोशिश करें।'));
  }
}

// ---------------- 📝 Form को इसी Page पर खोलना (ताकि Submit करने के बाद Tab बदलकर वापस न आना पड़े) ----------------
function embedGoogleForm(anchorId, evt) {
  if (evt) evt.preventDefault();
  const a = document.getElementById(anchorId);
  const wrap = document.getElementById(anchorId + 'Embed');
  if (!a || !wrap) return false;

  // दोबारा दबाने पर बंद हो जाए (Toggle)
  if (wrap.style.display === 'block') {
    wrap.style.display = 'none';
    a.textContent = a.dataset.origLabel || __t('फॉर्म भरें (यहीं इसी Page पर)');
    return false;
  }

  let url = a.getAttribute('href');
  url += (url.indexOf('?') > -1 ? '&' : '?') + 'embedded=true';

  wrap.innerHTML =
    '<div style="background:#fff;border:1px solid var(--line);border-radius:14px;padding:10px;">' +
    __t('<p style="font-size:13px;color:#596579;margin:0 0 8px;">👇 नीचे फॉर्म भरें — Submit करते ही यहीं "Your response has been recorded" दिखेगा, कहीं जाना नहीं पड़ेगा। आपकी ID कुछ ही मिनट में ईमेल पर आ जाएगी।</p>') +
    '<iframe src="' + url + '" width="100%" height="1100" frameborder="0" style="border-radius:10px;">Loading…</iframe>' +
    '</div>';
  wrap.style.display = 'block';
  a.dataset.origLabel = a.dataset.origLabel || a.textContent;
  a.textContent = __t('🔼 फॉर्म बंद करें');
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return false;
}

// ---------------- 🧾 Fee Receipt अब receipt.js में है (Word .docx) ----------------

// ---------------- ⚙ Admin Unlock ----------------
// ---------------- 🔐 Admin Panel (सिर्फ ?admin=1 वाले Link से दिखता है) ----------------
let ekveeraAdminPassword = '';

(function () {
  const params = new URLSearchParams(window.location.search);
  const panel = document.getElementById('adminPanelSection');
  if (params.get('admin') === '1' && panel) {
    panel.style.display = 'block';
  }
})();

function adminLogin() {
  const password = document.getElementById('adminLoginPassword').value.trim();
  const msgEl = document.getElementById('adminLoginMsg');
  if (!password) {
    msgEl.style.color = 'red';
    msgEl.textContent = __t('Password डालें।');
    return;
  }
  msgEl.style.color = '#333';
  msgEl.textContent = __t('जांचा जा रहा है...');
  vcSecurePost({ action: 'verifyadmin', password: password })
    .then(data => {
      if (data.status === 'ok') {
        ekveeraAdminPassword = password;
        document.getElementById('adminLoginBox').style.display = 'none';
        document.getElementById('adminControlsBox').style.display = 'block';
      } else {
        msgEl.style.color = 'red';
        const lockMsg = /लॉक|locked/i.test(data.message || '');
        msgEl.textContent = (data.message || __t('गलत Password।')) + (lockMsg ? '' : __t(' — यहां वही Password चलता है जो Apps Script के "ADMIN_UNLOCK_PASSWORD" में सेट है (Certificate वाला Password अलग है)। पक्का करने के लिए Apps Script में testPassword चलाएं।'));
        const pw = document.getElementById('adminLoginPassword'); if (pw) { pw.value = ''; try { pw.focus(); } catch (e) {} }
      }
    })
    .catch(() => {
      msgEl.style.color = 'red';
      msgEl.textContent = __t('Server से जवाब नहीं आया — Internet चेक करें, या Apps Script का "Deploy → New version" हुआ है या नहीं देखें।');
    });
}

async function approveUnlockRequest() {
  const reqId = document.getElementById('adminReqId').value.trim();
  const companyId = document.getElementById('adminCompanyId').value.trim();
  const msgEl = document.getElementById('adminApproveMsg');
  msgEl.style.color = '#333';
  msgEl.textContent = __t('Approve किया जा रहा है...');
  try {
    const data = await vcSecurePost({ action: 'approveunlock', requestId: reqId, companyId: companyId, password: ekveeraAdminPassword });
    if (data.status === 'ok') {
      msgEl.style.color = 'green';
      msgEl.textContent = __t('✅ Approve हो गया।');
    } else {
      msgEl.style.color = 'red';
      msgEl.textContent = data.message || __t('Approve नहीं हो पाया।');
    }
  } catch (err) {
    msgEl.style.color = 'red';
    msgEl.textContent = __t('कुछ गड़बड़ हो गई।');
  }
}

async function setBatchTimer() {
  const label = document.getElementById('timerLabel').value.trim();
  const datetime = document.getElementById('timerDateTime').value.trim();
  const msgEl = document.getElementById('timerSetMsg');
  if (!datetime) {
    msgEl.style.color = 'red';
    msgEl.textContent = __t('Date/Time भरें।');
    return;
  }
  msgEl.style.color = '#333';
  msgEl.textContent = __t('Set किया जा रहा है...');
  try {
    const data = await vcSecurePost({ action: 'setbatchtimer', datetime: datetime, label: label, password: ekveeraAdminPassword });
    if (data.status === 'ok') {
      msgEl.style.color = 'green';
      msgEl.textContent = __t('✅ Timer Set हो गया। पेज Refresh करके देख सकते हैं।');
    } else {
      msgEl.style.color = 'red';
      msgEl.textContent = data.message || __t('Set नहीं हो पाया।');
    }
  } catch (err) {
    msgEl.style.color = 'red';
    msgEl.textContent = __t('कुछ गड़बड़ हो गई।');
  }
}

async function setBatchSchedule() {
  const batchNo = document.getElementById('schedBatchNo').value.trim();
  const date = document.getElementById('schedDate').value.trim();
  const time = document.getElementById('schedTime').value.trim();
  const msgEl = document.getElementById('schedSetMsg');
  if (!batchNo || !date) {
    msgEl.style.color = 'red';
    msgEl.textContent = __t('Batch No. और Date दोनों भरें।');
    return;
  }
  msgEl.style.color = '#333';
  msgEl.textContent = __t('Set किया जा रहा है...');
  try {
    const data = await vcSecurePost({ action: 'setbatchschedule', batchNo: batchNo, date: date, time: time, password: ekveeraAdminPassword });
    if (data.status === 'ok') {
      msgEl.style.color = 'green';
      msgEl.textContent = '✅ ' + batchNo + __t(' की Schedule Set/Update हो गई।');
      document.getElementById('schedBatchNo').value = '';
      document.getElementById('schedDate').value = '';
      document.getElementById('schedTime').value = '';
    } else {
      msgEl.style.color = 'red';
      msgEl.textContent = data.message || __t('Set नहीं हो पाया।');
    }
  } catch (err) {
    msgEl.style.color = 'red';
    msgEl.textContent = __t('कुछ गड़बड़ हो गई।');
  }
}

// ---------------- 👤 Staff Performance — Date-wise / Month-wise (Admin) ----------------
// नया Backend Action: getstaffreport (EkVeera_Staff_Report.gs) — from/to खाली हों तो सारा Data
function _spEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function _spIso(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function _spSetRange(prefix, from, to) {
  document.getElementById(prefix + 'From').value = from ? _spIso(from) : '';
  document.getElementById(prefix + 'To').value = to ? _spIso(to) : '';
}
function _spReload(prefix) {
  if (prefix === 'staff') loadStaffPerformance(); else loadMyPerformance();
}
// prefix: 'staff' (Admin Panel) या 'my' (Staff का अपना View)
function staffRangeQuick(prefix, kind) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const mp = document.getElementById(prefix + 'Month'); if (mp) mp.value = '';
  if (kind === 'this') _spSetRange(prefix, new Date(y, m, 1), new Date(y, m + 1, 0));
  else if (kind === 'last') _spSetRange(prefix, new Date(y, m - 1, 1), new Date(y, m, 0));
  else _spSetRange(prefix, null, null);
  _spReload(prefix);
}
function staffRangeFromMonth(prefix) {
  const v = document.getElementById(prefix + 'Month').value; // YYYY-MM
  if (!v) return;
  const parts = v.split('-').map(Number);
  _spSetRange(prefix, new Date(parts[0], parts[1] - 1, 1), new Date(parts[0], parts[1], 0));
  _spReload(prefix);
}
function _spRange(prefix) {
  return { from: document.getElementById(prefix + 'From').value, to: document.getElementById(prefix + 'To').value };
}
function _spRangeLabel(data) {
  if (data.from || data.to) return '📅 ' + (data.from || __t('शुरू')) + __t(' से ') + (data.to || __t('आज तक')) + __t(' तक की Entry');
  return __t('📅 सारा Data (कोई तारीख सीमा नहीं)');
}
const _SP_UNDATED_LABELS = { trainingCandidates: 'Admission', candidates: 'Resume', companies: 'Company', placed: 'Placed', postsFilled: 'Posts Filled' };
function _spUndatedNote(data) {
  const u = data.undated || {};
  const parts = Object.keys(u).filter(function (k) { return u[k] > 0; }).map(function (k) { return _SP_UNDATED_LABELS[k] + ': ' + u[k]; });
  if (!(data.from || data.to) || !parts.length) return '';
  return __t('⚠️ कुछ पुरानी Entry में तारीख दर्ज नहीं है, इसलिए वे इस Range में नहीं गिनी गईं (') + parts.join(', ') + __t('). "सारा Data" चुनने पर ये गिनती में आ जाती हैं।');
}
function _spDownload(fileBase, rows, details, rangeLabel, staffTitle) {
  const head = [['EkVeera Staff Performance' + (staffTitle ? ' — ' + staffTitle : '')], [rangeLabel], []];
  const cols = ['Staff ID', 'Name', 'Admission Candidate', 'Resume Upload', 'Company Joined', 'Candidate Placed', 'Posts Filled (Commission)'];
  const body = rows.map(function (r) { return [r.staffCode, r.staffName || '', r.trainingCandidates, r.candidates, r.companies, r.placed, r.postsFilled]; });
  const tot = ['TOTAL', ''];
  for (let c = 2; c <= 6; c++) tot.push(body.reduce(function (s, r) { return s + (Number(r[c]) || 0); }, 0));
  const ws = XLSX.utils.aoa_to_sheet(head.concat([cols], body, rows.length > 1 ? [tot] : []));
  ws['!cols'] = [{ wch: 20 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 24 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Summary');
  const det = (details || []).slice().sort(function (a, b) {
    return String(a.staffCode).localeCompare(String(b.staffCode)) || String(a.type).localeCompare(String(b.type));
  }).map(function (d) { return [d.staffCode, d.type, d.id, d.name, d.date]; });
  const ws2 = XLSX.utils.aoa_to_sheet([['Staff ID', 'Type', 'ID', 'Name', 'Date']].concat(det));
  ws2['!cols'] = [{ wch: 20 }, { wch: 22 }, { wch: 16 }, { wch: 40 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Details');
  XLSX.writeFile(wb, fileBase + '_' + Date.now() + '.xlsx');
}

let lastStaffPerfResults = [];
let lastStaffPerfData = null;
async function loadStaffPerformance() {
  const el = document.getElementById('staffPerfTable');
  const noteEl = document.getElementById('staffPerfNote');
  const detEl = document.getElementById('staffPerfDetail');
  el.innerHTML = __t('<p>लोड हो रहा है...</p>'); noteEl.textContent = ''; detEl.innerHTML = '';
  try {
    const r = _spRange('staff');
    let data = await vcSecurePost({ action: 'getstaffreport', password: ekveeraAdminPassword, from: r.from, to: r.to });
    if (data.status !== 'ok' && /code missing/i.test(data.message || '')) {   // नई Staff Report file अभी नहीं जुड़ी — पुराना (बिना तारीख) चलाओ
      const old = await vcSecurePost({ action: 'getstaffperformance', password: ekveeraAdminPassword });
      data = old.status === 'ok' ? { status: 'ok', from: '', to: '', results: old.results || [], undated: {}, details: [], legacy: true } : old;
    }
    if (data.status !== 'ok') {
      el.innerHTML = '<p style="color:red;">' + _spEsc(data.message || __t('लोड नहीं हो पाया')) + '</p>';
      return;
    }
    lastStaffPerfData = data;
    lastStaffPerfResults = data.results || [];
    document.getElementById('staffPerfRange').textContent = _spRangeLabel(data);
    noteEl.textContent = _spUndatedNote(data);
    if (!lastStaffPerfResults.length) {
      el.innerHTML = __t('<p>अभी तक किसी Staff Code से कोई Entry नहीं आई है।</p>');
      document.getElementById('staffPerfDownloadBtn').style.display = 'none';
      return;
    }
    const th = 'padding:6px;';
    let html = '<table style="width:100%;border-collapse:collapse;"><tr style="background:var(--navy);color:#fff;"><th style="' + th + '">Staff</th><th style="' + th + '">Admission</th><th style="' + th + '">Resume</th><th style="' + th + '">Company</th><th style="' + th + '">Placed</th><th style="' + th + '">Posts Filled</th></tr>';
    const tot = [0, 0, 0, 0, 0];
    lastStaffPerfResults.forEach(function (r, i) {
      tot[0] += r.trainingCandidates; tot[1] += r.candidates; tot[2] += r.companies; tot[3] += r.placed; tot[4] += r.postsFilled;
      html += '<tr onclick="showStaffDetail(' + i + ')" style="cursor:pointer;background:' + (i % 2 ? '#f5f7fa' : '#fff') + ';"><td style="' + th + '"><strong>' + _spEsc(r.staffCode) + '</strong>' + (r.staffName ? '<br><span style="color:#596579;font-size:11.5px;">' + _spEsc(r.staffName) + '</span>' : '') + '</td><td style="' + th + 'text-align:center;">' + r.trainingCandidates + '</td><td style="' + th + 'text-align:center;">' + r.candidates + '</td><td style="' + th + 'text-align:center;">' + r.companies + '</td><td style="' + th + 'text-align:center;">' + r.placed + '</td><td style="' + th + 'text-align:center;font-weight:700;">' + r.postsFilled + '</td></tr>';
    });
    if (lastStaffPerfResults.length > 1) {
      html += '<tr style="background:#D9E1F2;font-weight:800;"><td style="' + th + '">TOTAL</td>' + tot.map(function (t) { return '<td style="' + th + 'text-align:center;">' + t + '</td>'; }).join('') + '</tr>';
    }
    html += __t('</table><p style="font-size:11.5px;color:#596579;margin:6px 0 0;">किसी Staff की Row दबाने पर उसकी Entry की List नीचे खुलेगी।</p>');
    el.innerHTML = html;
    document.getElementById('staffPerfDownloadBtn').style.display = 'inline-flex';
  } catch (err) {
    el.innerHTML = __t('<p style="color:red;">कुछ गड़बड़ हो गई।</p>');
  }
}

function showStaffDetail(i) {
  const r = lastStaffPerfResults[i];
  const box = document.getElementById('staffPerfDetail');
  if (!r || !lastStaffPerfData) return;
  const rows = (lastStaffPerfData.details || []).filter(function (d) { return d.staffCode === r.staffCode; });
  if (!rows.length) { box.innerHTML = '<p style="font-size:13px;">' + _spEsc(r.staffCode) + __t(' की इस Range में कोई Entry नहीं है।</p>'); return; }
  let html = '<p style="font-weight:700;margin:12px 0 6px;">📋 ' + _spEsc(r.staffCode) + __t(' की Entry (') + rows.length + __t(')</p><div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12.5px;"><tr style="background:#D9E1F2;"><th style="padding:5px;text-align:left;">तारीख</th><th style="padding:5px;text-align:left;">Type</th><th style="padding:5px;text-align:left;">ID</th><th style="padding:5px;text-align:left;">नाम</th></tr>');
  rows.forEach(function (d) {
    html += '<tr style="border-bottom:1px solid #eee;"><td style="padding:5px;">' + _spEsc(d.date || '—') + '</td><td style="padding:5px;">' + _spEsc(d.type) + '</td><td style="padding:5px;">' + _spEsc(d.id) + '</td><td style="padding:5px;">' + _spEsc(d.name) + '</td></tr>';
  });
  box.innerHTML = html + '</table></div>';
}

function downloadStaffPerformance() {
  if (!lastStaffPerfData || !lastStaffPerfResults.length) return;
  _spDownload('EkVeera_Staff_Performance', lastStaffPerfResults, lastStaffPerfData.details, _spRangeLabel(lastStaffPerfData), '');
}

// ---------------- 👤 Staff का अपना Individual View (?staffview=Naam) ----------------
let ekveeraStaffName = '';
let ekveeraStaffPassword = '';
let lastMyPerfResult = null;
let lastMyPerfData = null;

(function () {
  const params = new URLSearchParams(window.location.search);
  const staffName = params.get('staffview');
  const panel = document.getElementById('staffPanelSection');
  if (staffName && panel) {
    ekveeraStaffName = staffName;
    panel.style.display = 'block';
    const nameEl = document.getElementById('staffLoginName');
    if (nameEl) nameEl.textContent = staffName;
  }
})();

function staffLogin() {
  const password = document.getElementById('staffLoginPassword').value.trim();
  const msgEl = document.getElementById('staffLoginMsg');
  if (!password) {
    msgEl.style.color = 'red';
    msgEl.textContent = __t('Password डालें।');
    return;
  }
  msgEl.style.color = '#333';
  msgEl.textContent = __t('जांचा जा रहा है...');
  ekveeraStaffPassword = password;
  loadMyPerformance(true);
}

async function loadMyPerformance(isLogin) {
  const msgEl = document.getElementById('staffLoginMsg');
  const tableEl = document.getElementById('staffDataTable');
  try {
    const r = isLogin ? { from: '', to: '' } : _spRange('my');
    let data = await vcSecurePost({ action: 'getstaffreportone', password: ekveeraStaffPassword, staff: ekveeraStaffName, from: r.from, to: r.to });
    if (data.status !== 'ok' && /code missing/i.test(data.message || '')) {   // Apps Script में नई Staff Report file अभी नहीं जुड़ी — पुराना तरीका चलाओ
      const old = await vcSecurePost({ action: 'getstaffperformanceone', password: ekveeraStaffPassword, staff: ekveeraStaffName });
      data = old.status === 'ok' ? { status: 'ok', from: '', to: '', result: old.result, undated: {}, details: [], legacy: true } : old;
    }
    if (data.status !== 'ok') {
      if (isLogin) { msgEl.style.color = 'red'; msgEl.textContent = (data.message || __t('गलत Password।')) + (/लॉक|locked/i.test(data.message || '') ? '' : __t(' — Staff Password वही है जो Apps Script के "STAFF_VIEW_PASSWORD" में सेट है (Admin Password अलग होता है)।')); ekveeraStaffPassword = ''; const sp = document.getElementById('staffLoginPassword'); if (sp) { sp.value = ''; try { sp.focus(); } catch (e) {} } }
      else tableEl.innerHTML = '<p style="color:red;">' + _spEsc(data.message || __t('लोड नहीं हो पाया')) + '</p>';
      return;
    }
    document.getElementById('staffLoginBox').style.display = 'none';
    document.getElementById('staffDataBox').style.display = 'block';
    document.getElementById('staffDataName').textContent = ekveeraStaffName;
    lastMyPerfResult = data.result;
    lastMyPerfData = data;
    const x = data.result;
    document.getElementById('myPerfRange').textContent = _spRangeLabel(data);
    document.getElementById('myPerfNote').textContent = _spUndatedNote(data);
    tableEl.innerHTML = `
      <table style="width:100%;border-collapse:collapse;">
        <tr style="background:#f5f7fa;"><td style="padding:8px;">Total Admission Candidate</td><td style="padding:8px;text-align:right;font-weight:700;">${x.trainingCandidates}</td></tr>
        <tr><td style="padding:8px;">Total Resume Upload</td><td style="padding:8px;text-align:right;font-weight:700;">${x.candidates}</td></tr>
        <tr style="background:#f5f7fa;"><td style="padding:8px;">Total Company Joined</td><td style="padding:8px;text-align:right;font-weight:700;">${x.companies}</td></tr>
        <tr><td style="padding:8px;">Total Candidate Placed</td><td style="padding:8px;text-align:right;font-weight:700;">${x.placed}</td></tr>
        <tr style="background:#f5f7fa;"><td style="padding:8px;">Posts Filled (Commission)</td><td style="padding:8px;text-align:right;font-weight:700;color:#2ecc71;">${x.postsFilled}</td></tr>
      </table>`;
  } catch (err) {
    if (isLogin) { msgEl.style.color = 'red'; msgEl.textContent = __t('कुछ गड़बड़ हो गई, दोबारा कोशिश करें।'); }
    else tableEl.innerHTML = __t('<p style="color:red;">कुछ गड़बड़ हो गई।</p>');
  }
}

function downloadMyPerformance() {
  if (!lastMyPerfResult || !lastMyPerfData) return;
  _spDownload('EkVeera_' + ekveeraStaffName + '_Performance', [lastMyPerfResult], lastMyPerfData.details, _spRangeLabel(lastMyPerfData), ekveeraStaffName);
}

// ---------------- 🆘 Help Section — Enquiry भेजना ----------------
let lastBatchScheduleResults = [];
async function loadBatchSchedule() {
  const el = document.getElementById('batchScheduleTable');
  el.innerHTML = __t('<p>लोड हो रहा है...</p>');
  try {
    const res = await fetch(SEARCH_WEB_APP_URL + '?action=getbatchschedule&_=' + Date.now());
    const data = await res.json();
    lastBatchScheduleResults = data.results || [];
    if (!lastBatchScheduleResults.length) {
      el.innerHTML = __t('<p style="color:var(--ink-soft);">अभी कोई Batch Schedule नहीं डाली गई है।</p>');
      return;
    }
    let html = '<table style="width:100%;border-collapse:collapse;"><tr style="background:var(--navy);color:#fff;"><th style="padding:8px;text-align:left;">Batch No.</th><th style="padding:8px;text-align:left;">Date</th><th style="padding:8px;text-align:left;">Time</th></tr>';
    lastBatchScheduleResults.forEach((r, i) => {
      html += `<tr style="background:${i % 2 ? '#f5f7fa' : '#fff'};"><td style="padding:8px;">${r['Batch No.'] || ''}</td><td style="padding:8px;">${r['Date'] || ''}</td><td style="padding:8px;">${r['Time'] || ''}</td></tr>`;
    });
    html += '</table>';
    el.innerHTML = html;
  } catch (err) {
    el.innerHTML = __t('<p style="color:#C0392B;">कुछ गड़बड़ हो गई, दोबारा कोशिश करें।</p>');
  }
}

function downloadBatchSchedule() {
  if (!lastBatchScheduleResults.length) {
    alert(__t('पहले "Batch Schedule देखें" दबाइए, उसके बाद Download करें।'));
    return;
  }
  const ws = XLSX.utils.json_to_sheet(lastBatchScheduleResults);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Batch Schedule');
  XLSX.writeFile(wb, 'EkVeera_Batch_Schedule_' + Date.now() + '.xlsx');
}

// ---------------- 🔎 अपनी ID चेक करना (Mobile/Email से) ----------------
async function checkMyId() {
  const contact = document.getElementById('checkIdContact').value.trim();
  const el = document.getElementById('checkIdResult');
  if (!contact) {
    el.innerHTML = __t('<p style="color:#C0392B;font-size:14px;">कृपया अपना Mobile Number या Email डालें।</p>');
    return;
  }
  el.innerHTML = __t('<p style="color:var(--ink-soft);font-size:14px;">ढूंढा जा रहा है...</p>');
  try {
    const data = await vcSecurePost({ action: 'checkmyid', contact: contact });
    if (data.status === 'ok' && data.results && data.results.length) {
      let html = '';
      data.results.forEach(r => {
        html += `<div style="background:#E4F4EA;border-radius:8px;padding:10px 14px;margin-top:6px;font-size:14.5px;"><strong>${r.type}:</strong> ${r.id}</div>`;
      });
      el.innerHTML = html;
    } else {
      el.innerHTML = __t('<p style="color:#C0392B;font-size:14px;">इस Mobile/Email से कोई ID नहीं मिली। कृपया वही Mobile/Email डालें जो फॉर्म भरते वक्त दिया था।</p>');
    }
  } catch (err) {
    el.innerHTML = __t('<p style="color:#C0392B;font-size:14px;">कुछ गड़बड़ हो गई, दोबारा कोशिश करें।</p>');
  }
}

async function sendEnquiry() {
  const name = document.getElementById('enqName').value.trim();
  const contact = document.getElementById('enqContact').value.trim();
  const message = document.getElementById('enqMessage').value.trim();
  const msgEl = document.getElementById('enqMsg');
  if (!name || !contact || !message) {
    msgEl.style.color = '#ff8080';
    msgEl.textContent = __t('कृपया अपना नाम, मोबाइल/ईमेल और सवाल — तीनों भरें।');
    return;
  }
  msgEl.style.color = '#1F9D95';
  msgEl.textContent = __t('भेजा जा रहा है...');
  try {
    const data = await vcSecurePost({ action: 'sendenquiry', name: name, contact: contact, message: message });
    if (data.status === 'ok') {
      msgEl.textContent = __t('✅ आपकी Enquiry भेज दी गई है, हम जल्द संपर्क करेंगे।');
      document.getElementById('enqName').value = '';
      document.getElementById('enqContact').value = '';
      document.getElementById('enqMessage').value = '';
    } else {
      msgEl.style.color = '#ff8080';
      msgEl.textContent = data.message || __t('कुछ गड़बड़ हो गई।');
    }
  } catch (err) {
    msgEl.style.color = '#ff8080';
    msgEl.textContent = __t('कुछ गड़बड़ हो गई, दोबारा कोशिश करें।');
  }
}

// ---------------- 📋 Candidate का Interview Result Confirm करना (ईमेल के लिंक से आने पर) ----------------
async function handleConfirmFromEmailLink() {
  const params = new URLSearchParams(window.location.search);
  const candidateId = params.get('confirm');
  const companyId = params.get('company');
  const result = params.get('result');
  if (!candidateId || !companyId || !result) return;

  const box = document.createElement('div');
  box.style = "position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;";
  box.innerHTML = `${__t(`<div style="background:#fff;padding:30px;border-radius:12px;max-width:380px;text-align:center;">
      <h3 style="margin-top:0;">आपका जवाब दर्ज किया जा रहा है...</h3>
    </div>`)}`;
  document.body.appendChild(box);

  try {
    const url = SEARCH_WEB_APP_URL + '?action=confirmstatus&candidateId=' + encodeURIComponent(candidateId) +
      '&companyId=' + encodeURIComponent(companyId) + '&result=' + encodeURIComponent(result) + '&_=' + Date.now();
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'ok') {
      box.innerHTML = `${__t(`<div style="background:#fff;padding:30px;border-radius:12px;max-width:380px;text-align:center;">
        <h3 style="margin-top:0;color:#2ecc71;">✅ धन्यवाद!</h3>
        <p>आपका जवाब (`)}${result === 'selected' ? __t('Selected हुआ') : __t('Selected नहीं हुआ')}${__t(`) दर्ज कर लिया गया है।</p>
      </div>`)}`;
    } else {
      box.innerHTML = `${__t(`<div style="background:#fff;padding:30px;border-radius:12px;max-width:380px;text-align:center;">
        <h3 style="margin-top:0;color:#C0392B;">कुछ गड़बड़ हो गई</h3>
        <p>`)}${data.message || __t('कृपया थोड़ी देर बाद दोबारा कोशिश करें।')}</p>
      </div>`;
    }
  } catch (err) {
    box.innerHTML = `${__t(`<div style="background:#fff;padding:30px;border-radius:12px;max-width:380px;text-align:center;">
      <h3 style="margin-top:0;color:#C0392B;">कुछ गड़बड़ हो गई</h3>
      <p>कृपया थोड़ी देर बाद दोबारा कोशिश करें।</p>
    </div>`)}`;
  }
}
handleConfirmFromEmailLink();

// ---------------- 🔔 Live Admin Alert (वेबसाइट खुली रहने पर) ----------------
let ekveeraLastPendingCount = parseInt(localStorage.getItem('ekveera_last_pending_count') || '0', 10);
let ekveeraAlertsEnabled = localStorage.getItem('ekveera_alerts_enabled') === 'yes';

function enableAdminAlerts() {
  const msgEl = document.getElementById('alertEnableMsg');
  ekveeraAlertsEnabled = true;
  localStorage.setItem('ekveera_alerts_enabled', 'yes');
  if ('Notification' in window) Notification.requestPermission();
  playAlertBeep();
  msgEl.style.color = 'green';
  msgEl.textContent = __t('✅ Live Alert चालू हो गया है। यह Tab खुली रखें।');
}

function playAlertBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.35, ctx.currentTime + i * 0.5);
      osc.start(ctx.currentTime + i * 0.5);
      osc.stop(ctx.currentTime + i * 0.5 + 0.35);
    }
  } catch (err) { /* आवाज़ न बजे तो भी कोई दिक्कत नहीं */ }
}

async function pollPendingRequests() {
  if (!ekveeraAlertsEnabled) return;
  try {
    const res = await fetch(SEARCH_WEB_APP_URL + '?action=checkpendingrequests&_=' + Date.now());
    const data = await res.json();
    if (data.status !== 'ok') return;

    const banner = document.getElementById('adminPendingBanner');
    if (banner) {
      if (data.count > 0) {
        banner.style.display = 'block';
        banner.textContent = '🔔 ' + data.count + __t(' Payment Request अभी Pending है — नीचे Admin Unlock में जाकर देखें।');
      } else {
        banner.style.display = 'none';
      }
    }

    if (data.count > ekveeraLastPendingCount) {
      playAlertBeep();
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(__t('EkVeera — नई Payment Request'), { body: __t('किसी Company ने पूरी जानकारी की Request भेजी है।') });
      }
    }
    ekveeraLastPendingCount = data.count;
    localStorage.setItem('ekveera_last_pending_count', ekveeraLastPendingCount);
  } catch (err) { /* चुपचाप छोड़ दें, अगली बार फिर कोशिश होगी */ }
}
setInterval(pollPendingRequests, 20000);
pollPendingRequests();

// ---------------- 👤 Staff Referral Tracking ----------------
(function () {
  // Staff ka naam ab staff-ref.js se aata hai: Browser me link wala Staff, Installed App me Install ke samay wala Staff
  const staff = (window.ekvStaffRef ? window.ekvStaffRef() : (localStorage.getItem('ekveera_staff_ref') || ''));
  if (!staff) return;

  const formEntries = {
    formLinkTraining:  { base: 'https://docs.google.com/forms/d/e/1FAIpQLScrcEd6bqNes1bh-uJ02W32zdk8Wgj8gFmiR90UCJ0ylhyo7A/viewform', entry: 'entry.1665672028' },
    formLinkCandidate: { base: 'https://docs.google.com/forms/d/e/1FAIpQLSeWvKb8B-Yst5GjB4hFHFl-CWvjMzQeD46xAXZtmjy6Oe8qaQ/viewform', entry: 'entry.1377740379' },
    formLinkCompany:   { base: 'https://docs.google.com/forms/d/e/1FAIpQLSemiB-GFNQ0YInNTCJNxkxHztrrSv2X_tYA2TowQ3V89MMb-Q/viewform', entry: 'entry.113592844' }
  };

  Object.keys(formEntries).forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    const info = formEntries[id];
    el.href = info.base + '?usp=pp_url&' + info.entry + '=' + encodeURIComponent(staff);
  });
})();

