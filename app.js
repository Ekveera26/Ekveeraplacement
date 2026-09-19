
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

  // Language toggle
  let currentLang = 'hi';
  function toggleLang(){
    currentLang = currentLang === 'hi' ? 'en' : 'hi';
    document.querySelectorAll('[data-hi]').forEach(el => {
      el.innerHTML = currentLang === 'hi' ? el.getAttribute('data-hi') : el.getAttribute('data-en');
    });
    const btn = document.getElementById('langToggleBtn');
    if (btn) btn.textContent = currentLang === 'hi' ? 'EN' : 'HI';
  }

  // Admin password gate
  const CERT_ADMIN_PASSWORD = "EkVeera@2026";
  function checkCertPassword(){
    const val = document.getElementById('certPasswordInput').value;
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
      errorEl.textContent = '❌ कृपया Reg. No. / ID डालें, तभी Training Database से वेरीफाई हो पाएगा।';
      errorEl.style.display = 'block';
      return;
    }

    const genBtn = document.querySelector('button[onclick="generateCertificate()"]');
    const originalBtnText = genBtn ? genBtn.textContent : '';
    if (genBtn){ genBtn.disabled = true; genBtn.textContent = 'जांच हो रही है...'; }

    let result;
    try {
      result = await checkTrainingCompleted(idNo);
    } catch (err){
      if (genBtn){ genBtn.disabled = false; genBtn.textContent = originalBtnText; }
      errorEl.textContent = '⚠️ अभी वेरीफाई नहीं हो पाया (इंटरनेट/सर्वर समस्या) — कृपया थोड़ी देर बाद फिर कोशिश करें।';
      errorEl.style.display = 'block';
      return;
    }
    if (genBtn){ genBtn.disabled = false; genBtn.textContent = originalBtnText; }

    if (result.status === 'not_found'){
      errorEl.textContent = '❌ यह Reg. No. Candidate Database में नहीं मिला। पहले उसका Reg. No. (column N) भरें।';
      errorEl.style.display = 'block';
      return;
    }
    if (result.status === 'no_training_record'){
      errorEl.textContent = '❌ इस कैंडिडेट का Training Database में कोई रिकॉर्ड नहीं मिला।';
      errorEl.style.display = 'block';
      return;
    }
    if (result.status === 'not_completed'){
      errorEl.textContent = '⚠️ Training अभी "Completed" नहीं है (मौजूदा status: ' + (result.trainingStatus || 'खाली') + ')। पहले Training Database में status "Completed" करें।';
      errorEl.style.display = 'block';
      return;
    }
    if (result.status === 'already_issued'){
      errorEl.textContent = '⚠️ इस कैंडिडेट का Certificate पहले ही बन चुका है। दोबारा नहीं बन सकता।';
      errorEl.style.display = 'block';
      return;
    }
    if (result.status !== 'ok'){
      errorEl.textContent = '⚠️ अभी वेरीफाई नहीं हो पाया — कृपया थोड़ी देर बाद फिर कोशिश करें।';
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
      errorEl.textContent = '❌ कृपया अपना Access Code डालें (Payment के बाद WhatsApp पर मिलेगा)।';
      errorEl.style.display = 'block';
      return;
    }
    if (!name){
      errorEl.textContent = '❌ कृपया अपना नाम डालें।';
      errorEl.style.display = 'block';
      return;
    }

    // one-time-download check (per browser/device)
    if (localStorage.getItem(idCardStorageKey(code))){
      errorEl.textContent = '⚠️ इस Access Code से ID Card पहले ही इस डिवाइस पर डाउनलोड किया जा चुका है। अगर कोई गड़बड़ी लगे तो WhatsApp पर संपर्क करें।';
      errorEl.style.display = 'block';
      document.getElementById('idCardPreviewWrap').style.display = 'none';
      return;
    }

    // Attendance Database mein Reg. No. check karein — bina isse ID Card nahi banega
    const genBtn = document.querySelector('button[onclick="generateIdCard()"]');
    const originalBtnText = genBtn ? genBtn.textContent : '';
    if (genBtn){ genBtn.disabled = true; genBtn.textContent = 'जांच हो रही है...'; }

    let result;
    try {
      result = await verifyAccessCode(code, name);
    } catch (err){
      if (genBtn){ genBtn.disabled = false; genBtn.textContent = originalBtnText; }
      errorEl.textContent = '⚠️ अभी वेरीफाई नहीं हो पाया (इंटरनेट/सर्वर समस्या) — कृपया थोड़ी देर बाद फिर कोशिश करें।';
      errorEl.style.display = 'block';
      document.getElementById('idCardPreviewWrap').style.display = 'none';
      return;
    }
    if (genBtn){ genBtn.disabled = false; genBtn.textContent = originalBtnText; }

    if (result.status === 'used'){
      errorEl.textContent = '⚠️ यह Access Code से ID Card पहले ही बन चुका है। दोबारा नहीं बन सकता। किसी गड़बड़ी के लिए WhatsApp (9766284669) पर संपर्क करें।';
      errorEl.style.display = 'block';
      document.getElementById('idCardPreviewWrap').style.display = 'none';
      return;
    }
    if (result.status === 'name_mismatch'){
      errorEl.textContent = '❌ यह नाम इस Access Code से मेल नहीं खा रहा। कृपया वही नाम भरें जो Attendance रिकॉर्ड में दर्ज है (Batch/WhatsApp पर पूछ सकते हैं)।';
      errorEl.style.display = 'block';
      document.getElementById('idCardPreviewWrap').style.display = 'none';
      return;
    }
    if (result.status === 'not_found'){
      errorEl.textContent = '❌ यह Access Code अभी तक हमारे Attendance रिकॉर्ड में नहीं मिला। कृपया सही Access Code डालें, या हमें WhatsApp (9766284669) पर संपर्क करें।';
      errorEl.style.display = 'block';
      document.getElementById('idCardPreviewWrap').style.display = 'none';
      return;
    }
    if (result.status !== 'ok'){
      errorEl.textContent = '⚠️ अभी वेरीफाई नहीं हो पाया — कृपया थोड़ी देर बाद फिर कोशिश करें।';
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
      ctx.fillText('यह कार्ड सिर्फ Training Batch के दौरान मान्य है  ·  9766284669', W/2, H-32);
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
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
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
    alert('App पहले से Install है, या आपका Browser अभी Install Support नहीं करता। Chrome/Edge (Android/Desktop) में सबसे अच्छे से काम करता है।');
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
    text: 'EkVeera Training Center — Call Center & Customer Service Training. Admission Form, ID Card, Certificate सब यहीं से करें:',
    url: window.location.href.split('#')[0]
  };
  if (navigator.share){
    navigator.share(shareData).catch(() => {});
  } else if (navigator.clipboard){
    navigator.clipboard.writeText(shareData.url).then(() => {
      const btn = document.getElementById('shareAppBtn');
      if (btn){
        const old = btn.innerHTML;
        btn.innerHTML = '✅ Link Copy हो गया';
        setTimeout(() => { btn.innerHTML = old; }, 1800);
      }
    });
  } else {
    window.prompt('इस लिंक को कॉपी करके भेज दीजिए:', shareData.url);
  }
}



// ---------------- टॉपिक 2: Search Features ----------------
const SEARCH_WEB_APP_URL = ID_VERIFY_WEB_APP_URL; // वही Web App, बस अलग action पैरामीटर के साथ

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

function renderResultsTable(containerId, rows) {
  const el = document.getElementById(containerId);
  if (!rows || !rows.length) {
    el.innerHTML = '<p style="padding:18px;color:#555;">कोई नतीजा नहीं मिला।</p>';
    return;
  }
  const cols = Object.keys(rows[0]);
  let html = '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
  html += '<tr style="background:var(--navy);color:#fff;">' + cols.map(c => `<th style="padding:8px 10px;text-align:left;white-space:nowrap;">${c}</th>`).join('') + '</tr>';
  rows.forEach((r, i) => {
    html += `<tr style="background:${i % 2 ? '#f5f7fa' : '#fff'};">` + cols.map(c => `<td style="padding:8px 10px;white-space:nowrap;">${r[c] != null ? r[c] : ''}</td>`).join('') + '</tr>';
  });
  html += '</table>';
  el.innerHTML = html;
}

async function runSearchCandidate() {
  const q = document.getElementById('searchCandInput').value.trim();
  const el = document.getElementById('searchCandResults');
  el.innerHTML = '<p style="padding:18px;color:#555;">खोजा जा रहा है...</p>';
  try {
    const res = await fetch(SEARCH_WEB_APP_URL + '?action=searchcandidate&q=' + encodeURIComponent(q) + '&_=' + Date.now());
    const data = await res.json();
    lastSearchCandResults = data.results || [];
    renderResultsTable('searchCandResults', lastSearchCandResults);
  } catch (err) {
    el.innerHTML = '<p style="padding:18px;color:#C0392B;">कुछ गड़बड़ हो गई, दोबारा कोशिश करें।</p>';
  }
}

async function runSearchCompany() {
  const q = document.getElementById('searchCompInput').value.trim();
  const el = document.getElementById('searchCompResults');
  el.innerHTML = '<p style="padding:18px;color:#555;">खोजा जा रहा है...</p>';
  try {
    const res = await fetch(SEARCH_WEB_APP_URL + '?action=searchcompany&q=' + encodeURIComponent(q) + '&_=' + Date.now());
    const data = await res.json();
    lastSearchCompResults = data.results || [];
    renderResultsTable('searchCompResults', lastSearchCompResults);
  } catch (err) {
    el.innerHTML = '<p style="padding:18px;color:#C0392B;">कुछ गड़बड़ हो गई, दोबारा कोशिश करें।</p>';
  }
}

function downloadSearchResults(which) {
  const rows = which === 'cand' ? lastSearchCandResults : lastSearchCompResults;
  if (!rows || !rows.length) {
    alert('पहले खोज लीजिए, उसके बाद Download करें।');
    return;
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Results');
  XLSX.writeFile(wb, (which === 'cand' ? 'EkVeera_Candidates' : 'EkVeera_Companies') + '_' + Date.now() + '.xlsx');
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
    msgEl.textContent = 'कृपया Company ID, Post की संख्या और कम-से-कम एक ID भरें।';
    return;
  }
  msgEl.style.color = '#9fe3a0';
  msgEl.textContent = 'भेजा जा रहा है...';
  try {
    const url = SEARCH_WEB_APP_URL + '?action=requestunlock&companyId=' + encodeURIComponent(companyId) +
      '&numPosts=' + encodeURIComponent(numPosts) + '&ids=' + encodeURIComponent(ids) + '&_=' + Date.now();
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'ok') {
      msgEl.textContent = '✅ Request भेज दी गई! आपकी Request ID है: ' + data.requestId + ' (राशि ₹' + data.amount + ') — कृपया Payment करके नीचे Status चेक करें। यह Request ID संभालकर रखें।';
      document.getElementById('checkRequestId').value = data.requestId;
      document.getElementById('checkCompanyId').value = companyId;
    } else {
      msgEl.style.color = '#ff8080';
      msgEl.textContent = data.message || 'कुछ गड़बड़ हो गई।';
    }
  } catch (err) {
    msgEl.style.color = '#ff8080';
    msgEl.textContent = 'कुछ गड़बड़ हो गई, दोबारा कोशिश करें।';
  }
}

async function checkUnlockStatus() {
  const companyId = document.getElementById('checkCompanyId').value.trim();
  const reqId = document.getElementById('checkRequestId').value.trim();
  const msgEl = document.getElementById('checkStatusMsg');
  const dlBtn = document.getElementById('downloadDetailsBtn');
  dlBtn.style.display = 'none';
  if (!companyId || !reqId) {
    msgEl.textContent = 'कृपया Company ID और Request ID दोनों भरें।';
    return;
  }
  msgEl.textContent = 'जांचा जा रहा है...';
  try {
    const url = SEARCH_WEB_APP_URL + '?action=checkunlock&companyId=' + encodeURIComponent(companyId) +
      '&requestId=' + encodeURIComponent(reqId) + '&_=' + Date.now();
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'ok' && data.requestStatus === 'Approved') {
      msgEl.textContent = '✅ Approved हो चुका है! नीचे Download बटन दबाएं।';
      dlBtn.style.display = 'inline-flex';
    } else if (data.status === 'ok') {
      msgEl.textContent = '⏳ अभी भी Pending है — Payment verify होने का इंतज़ार करें।';
    } else {
      msgEl.textContent = 'यह Request ID/Company ID नहीं मिली।';
    }
  } catch (err) {
    msgEl.textContent = 'कुछ गड़बड़ हो गई, दोबारा कोशिश करें।';
  }
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
      const ws = XLSX.utils.json_to_sheet(data.results);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Candidate Database');
      XLSX.writeFile(wb, 'EkVeera_Candidate_Database_' + companyId + '_' + Date.now() + '.xlsx');
      if (data.missingIds && data.missingIds.length && msgEl) {
        msgEl.style.color = '#C0392B';
        msgEl.textContent = '✅ Download हो गया, लेकिन इन ID का Data नहीं मिला (चेक करें, शायद Typo है): ' + data.missingIds.join(', ');
      } else if (msgEl) {
        msgEl.style.color = 'green';
        msgEl.textContent = '✅ Candidate Database Excel Download हो गई।';
      }
    } else if (data.status === 'not_approved') {
      alert('अभी यह Request Approved नहीं हुई है — पहले Admin से Payment Verify/Approve करवाएं।');
    } else if (data.status === 'not_found') {
      alert('यह Company ID / Request ID सही नहीं लग रही — दोबारा जांच लें।');
    } else {
      alert(data.message || 'Download नहीं हो पाया, दोबारा कोशिश करें।');
    }
  } catch (err) {
    alert('Server से जवाब नहीं मिल पाया — Internet चेक करके दोबारा कोशिश करें।');
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
    a.textContent = a.dataset.origLabel || 'फॉर्म भरें (यहीं इसी Page पर)';
    return false;
  }

  let url = a.getAttribute('href');
  url += (url.indexOf('?') > -1 ? '&' : '?') + 'embedded=true';

  wrap.innerHTML =
    '<div style="background:#fff;border:1px solid var(--line);border-radius:14px;padding:10px;">' +
    '<p style="font-size:13px;color:#596579;margin:0 0 8px;">👇 नीचे फॉर्म भरें — Submit करते ही यहीं "Your response has been recorded" दिखेगा, कहीं जाना नहीं पड़ेगा। आपकी ID कुछ ही मिनट में ईमेल पर आ जाएगी।</p>' +
    '<iframe src="' + url + '" width="100%" height="1100" frameborder="0" style="border-radius:10px;">Loading…</iframe>' +
    '</div>';
  wrap.style.display = 'block';
  a.dataset.origLabel = a.dataset.origLabel || a.textContent;
  a.textContent = '🔼 फॉर्म बंद करें';
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return false;
}

// ---------------- 🧾 Payment Receipt / Invoice Download ----------------
async function downloadInvoice() {
  const companyId = document.getElementById('invoiceCompanyId').value.trim();
  const msgEl = document.getElementById('invoiceMsg');
  if (!companyId) {
    msgEl.style.color = '#C0392B';
    msgEl.textContent = 'कृपया अपनी Company ID डालें।';
    return;
  }
  msgEl.style.color = '#333';
  msgEl.textContent = 'तैयार किया जा रहा है...';
  try {
    const url = SEARCH_WEB_APP_URL + '?action=getinvoice&companyId=' + encodeURIComponent(companyId) + '&_=' + Date.now();
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'ok') {
      msgEl.style.color = '#C0392B';
      msgEl.textContent = data.message || 'इस Company ID से कोई Payment Record नहीं मिला।';
      return;
    }
    const headerRows = [
      ['EkVeera Placement & Consulting Services — Payment Invoice / Receipt'],
      [],
      ['Company ID', data.companyId],
      ['Company Name', data.companyName || '—'],
      ['Contact Person', data.contactPerson || '—'],
      []
    ];
    const tableHeader = ['Request ID', 'Date', 'Candidate/Training IDs', 'Num Posts', 'Amount (₹)', 'Status'];
    const tableRows = data.results.map(r => [
      r['Request ID'], r['Date'], r['Candidate/Training IDs'], r['Num Posts'], r['Amount (₹)'], r['Status']
    ]);
    const totalPaid = data.results
      .filter(r => (r['Status'] || '').toString().toLowerCase() === 'approved')
      .reduce((sum, r) => sum + (parseFloat(r['Amount (₹)']) || 0), 0);
    const aoa = headerRows.concat([tableHeader], tableRows, [[], ['', '', '', 'Total Paid (Approved)', totalPaid]]);
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoice');
    XLSX.writeFile(wb, 'EkVeera_Invoice_' + data.companyId + '_' + Date.now() + '.xlsx');
    msgEl.style.color = 'green';
    msgEl.textContent = '✅ Invoice Download हो गई।';
  } catch (err) {
    msgEl.style.color = '#C0392B';
    msgEl.textContent = 'Server से जवाब नहीं मिल पाया — दोबारा कोशिश करें।';
  }
}

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
    msgEl.textContent = 'Password डालें।';
    return;
  }
  msgEl.style.color = '#333';
  msgEl.textContent = 'जांचा जा रहा है...';
  vcSecurePost({ action: 'verifyadmin', password: password })
    .then(data => {
      if (data.status === 'ok') {
        ekveeraAdminPassword = password;
        document.getElementById('adminLoginBox').style.display = 'none';
        document.getElementById('adminControlsBox').style.display = 'block';
      } else {
        msgEl.style.color = 'red';
        msgEl.textContent = data.message || 'गलत Password।';
      }
    })
    .catch(() => {
      msgEl.style.color = 'red';
      msgEl.textContent = 'कुछ गड़बड़ हो गई, दोबारा कोशिश करें।';
    });
}

async function approveUnlockRequest() {
  const reqId = document.getElementById('adminReqId').value.trim();
  const companyId = document.getElementById('adminCompanyId').value.trim();
  const msgEl = document.getElementById('adminApproveMsg');
  msgEl.style.color = '#333';
  msgEl.textContent = 'Approve किया जा रहा है...';
  try {
    const data = await vcSecurePost({ action: 'approveunlock', requestId: reqId, companyId: companyId, password: ekveeraAdminPassword });
    if (data.status === 'ok') {
      msgEl.style.color = 'green';
      msgEl.textContent = '✅ Approve हो गया।';
    } else {
      msgEl.style.color = 'red';
      msgEl.textContent = data.message || 'Approve नहीं हो पाया।';
    }
  } catch (err) {
    msgEl.style.color = 'red';
    msgEl.textContent = 'कुछ गड़बड़ हो गई।';
  }
}

async function setBatchTimer() {
  const label = document.getElementById('timerLabel').value.trim();
  const datetime = document.getElementById('timerDateTime').value.trim();
  const msgEl = document.getElementById('timerSetMsg');
  if (!datetime) {
    msgEl.style.color = 'red';
    msgEl.textContent = 'Date/Time भरें।';
    return;
  }
  msgEl.style.color = '#333';
  msgEl.textContent = 'Set किया जा रहा है...';
  try {
    const data = await vcSecurePost({ action: 'setbatchtimer', datetime: datetime, label: label, password: ekveeraAdminPassword });
    if (data.status === 'ok') {
      msgEl.style.color = 'green';
      msgEl.textContent = '✅ Timer Set हो गया। पेज Refresh करके देख सकते हैं।';
    } else {
      msgEl.style.color = 'red';
      msgEl.textContent = data.message || 'Set नहीं हो पाया।';
    }
  } catch (err) {
    msgEl.style.color = 'red';
    msgEl.textContent = 'कुछ गड़बड़ हो गई।';
  }
}

async function setBatchSchedule() {
  const batchNo = document.getElementById('schedBatchNo').value.trim();
  const date = document.getElementById('schedDate').value.trim();
  const time = document.getElementById('schedTime').value.trim();
  const msgEl = document.getElementById('schedSetMsg');
  if (!batchNo || !date) {
    msgEl.style.color = 'red';
    msgEl.textContent = 'Batch No. और Date दोनों भरें।';
    return;
  }
  msgEl.style.color = '#333';
  msgEl.textContent = 'Set किया जा रहा है...';
  try {
    const data = await vcSecurePost({ action: 'setbatchschedule', batchNo: batchNo, date: date, time: time, password: ekveeraAdminPassword });
    if (data.status === 'ok') {
      msgEl.style.color = 'green';
      msgEl.textContent = '✅ ' + batchNo + ' की Schedule Set/Update हो गई।';
      document.getElementById('schedBatchNo').value = '';
      document.getElementById('schedDate').value = '';
      document.getElementById('schedTime').value = '';
    } else {
      msgEl.style.color = 'red';
      msgEl.textContent = data.message || 'Set नहीं हो पाया।';
    }
  } catch (err) {
    msgEl.style.color = 'red';
    msgEl.textContent = 'कुछ गड़बड़ हो गई।';
  }
}

let lastStaffPerfResults = [];
async function loadStaffPerformance() {
  const el = document.getElementById('staffPerfTable');
  el.innerHTML = '<p>लोड हो रहा है...</p>';
  try {
    const data = await vcSecurePost({ action: 'getstaffperformance', password: ekveeraAdminPassword });
    if (data.status !== 'ok') {
      el.innerHTML = '<p style="color:red;">' + (data.message || 'लोड नहीं हो पाया') + '</p>';
      return;
    }
    lastStaffPerfResults = data.results || [];
    if (!lastStaffPerfResults.length) {
      el.innerHTML = '<p>अभी तक किसी Staff Code से कोई Entry नहीं आई है।</p>';
      document.getElementById('staffPerfDownloadBtn').style.display = 'none';
      return;
    }
    let html = '<table style="width:100%;border-collapse:collapse;"><tr style="background:var(--navy);color:#fff;"><th style="padding:6px;">Staff</th><th style="padding:6px;">Total Admission Candidate</th><th style="padding:6px;">Total Resume Upload</th><th style="padding:6px;">Total Company Joined</th><th style="padding:6px;">Total Candidate Placed</th><th style="padding:6px;">Posts Filled (Commission)</th></tr>';
    lastStaffPerfResults.forEach((r, i) => {
      html += `<tr style="background:${i % 2 ? '#f5f7fa' : '#fff'};"><td style="padding:6px;">${r.staffCode}</td><td style="padding:6px;text-align:center;">${r.trainingCandidates}</td><td style="padding:6px;text-align:center;">${r.candidates}</td><td style="padding:6px;text-align:center;">${r.companies}</td><td style="padding:6px;text-align:center;">${r.placed}</td><td style="padding:6px;text-align:center;font-weight:700;">${r.postsFilled}</td></tr>`;
    });
    html += '</table>';
    el.innerHTML = html;
    document.getElementById('staffPerfDownloadBtn').style.display = 'inline-flex';
  } catch (err) {
    el.innerHTML = '<p style="color:red;">कुछ गड़बड़ हो गई।</p>';
  }
}

function downloadStaffPerformance() {
  if (!lastStaffPerfResults.length) return;
  const ws = XLSX.utils.json_to_sheet(lastStaffPerfResults);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Staff Performance');
  XLSX.writeFile(wb, 'EkVeera_Staff_Performance_' + Date.now() + '.xlsx');
}

// ---------------- 👤 Staff का अपना Individual View (?staffview=Naam) ----------------
let ekveeraStaffName = '';
let lastMyPerfResult = null;

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
    msgEl.textContent = 'Password डालें।';
    return;
  }
  msgEl.style.color = '#333';
  msgEl.textContent = 'जांचा जा रहा है...';
  vcSecurePost({ action: 'getstaffperformanceone', password: password, staff: ekveeraStaffName })
    .then(data => {
      if (data.status === 'ok') {
        document.getElementById('staffLoginBox').style.display = 'none';
        document.getElementById('staffDataBox').style.display = 'block';
        document.getElementById('staffDataName').textContent = ekveeraStaffName;
        lastMyPerfResult = data.result;
        const r = data.result;
        document.getElementById('staffDataTable').innerHTML = `
          <table style="width:100%;border-collapse:collapse;">
            <tr style="background:#f5f7fa;"><td style="padding:8px;">Total Admission Candidate</td><td style="padding:8px;text-align:right;font-weight:700;">${r.trainingCandidates}</td></tr>
            <tr><td style="padding:8px;">Total Resume Upload</td><td style="padding:8px;text-align:right;font-weight:700;">${r.candidates}</td></tr>
            <tr style="background:#f5f7fa;"><td style="padding:8px;">Total Company Joined</td><td style="padding:8px;text-align:right;font-weight:700;">${r.companies}</td></tr>
            <tr><td style="padding:8px;">Total Candidate Placed</td><td style="padding:8px;text-align:right;font-weight:700;">${r.placed}</td></tr>
            <tr style="background:#f5f7fa;"><td style="padding:8px;">Posts Filled (Commission)</td><td style="padding:8px;text-align:right;font-weight:700;color:#2ecc71;">${r.postsFilled}</td></tr>
          </table>`;
      } else {
        msgEl.style.color = 'red';
        msgEl.textContent = data.message || 'गलत Password।';
      }
    })
    .catch(() => {
      msgEl.style.color = 'red';
      msgEl.textContent = 'कुछ गड़बड़ हो गई, दोबारा कोशिश करें।';
    });
}

function downloadMyPerformance() {
  if (!lastMyPerfResult) return;
  const ws = XLSX.utils.json_to_sheet([lastMyPerfResult]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'My Performance');
  XLSX.writeFile(wb, 'EkVeera_' + ekveeraStaffName + '_Performance_' + Date.now() + '.xlsx');
}

// ---------------- 🆘 Help Section — Enquiry भेजना ----------------
let lastBatchScheduleResults = [];
async function loadBatchSchedule() {
  const el = document.getElementById('batchScheduleTable');
  el.innerHTML = '<p>लोड हो रहा है...</p>';
  try {
    const res = await fetch(ID_VERIFY_WEB_APP_URL + '?action=getbatchschedule&_=' + Date.now());
    const data = await res.json();
    lastBatchScheduleResults = data.results || [];
    if (!lastBatchScheduleResults.length) {
      el.innerHTML = '<p style="color:var(--ink-soft);">अभी कोई Batch Schedule नहीं डाली गई है।</p>';
      return;
    }
    let html = '<table style="width:100%;border-collapse:collapse;"><tr style="background:var(--navy);color:#fff;"><th style="padding:8px;text-align:left;">Batch No.</th><th style="padding:8px;text-align:left;">Date</th><th style="padding:8px;text-align:left;">Time</th></tr>';
    lastBatchScheduleResults.forEach((r, i) => {
      html += `<tr style="background:${i % 2 ? '#f5f7fa' : '#fff'};"><td style="padding:8px;">${r['Batch No.'] || ''}</td><td style="padding:8px;">${r['Date'] || ''}</td><td style="padding:8px;">${r['Time'] || ''}</td></tr>`;
    });
    html += '</table>';
    el.innerHTML = html;
  } catch (err) {
    el.innerHTML = '<p style="color:#C0392B;">कुछ गड़बड़ हो गई, दोबारा कोशिश करें।</p>';
  }
}

function downloadBatchSchedule() {
  if (!lastBatchScheduleResults.length) {
    alert('पहले "Batch Schedule देखें" दबाइए, उसके बाद Download करें।');
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
    el.innerHTML = '<p style="color:#C0392B;font-size:14px;">कृपया अपना Mobile Number या Email डालें।</p>';
    return;
  }
  el.innerHTML = '<p style="color:var(--ink-soft);font-size:14px;">ढूंढा जा रहा है...</p>';
  try {
    const data = await vcSecurePost({ action: 'checkmyid', contact: contact });
    if (data.status === 'ok' && data.results && data.results.length) {
      let html = '';
      data.results.forEach(r => {
        html += `<div style="background:#E4F4EA;border-radius:8px;padding:10px 14px;margin-top:6px;font-size:14.5px;"><strong>${r.type}:</strong> ${r.id}</div>`;
      });
      el.innerHTML = html;
    } else {
      el.innerHTML = '<p style="color:#C0392B;font-size:14px;">इस Mobile/Email से कोई ID नहीं मिली। कृपया वही Mobile/Email डालें जो फॉर्म भरते वक्त दिया था।</p>';
    }
  } catch (err) {
    el.innerHTML = '<p style="color:#C0392B;font-size:14px;">कुछ गड़बड़ हो गई, दोबारा कोशिश करें।</p>';
  }
}

async function sendEnquiry() {
  const name = document.getElementById('enqName').value.trim();
  const contact = document.getElementById('enqContact').value.trim();
  const message = document.getElementById('enqMessage').value.trim();
  const msgEl = document.getElementById('enqMsg');
  if (!name || !contact || !message) {
    msgEl.style.color = '#ff8080';
    msgEl.textContent = 'कृपया अपना नाम, मोबाइल/ईमेल और सवाल — तीनों भरें।';
    return;
  }
  msgEl.style.color = '#1F9D95';
  msgEl.textContent = 'भेजा जा रहा है...';
  try {
    const data = await vcSecurePost({ action: 'sendenquiry', name: name, contact: contact, message: message });
    if (data.status === 'ok') {
      msgEl.textContent = '✅ आपकी Enquiry भेज दी गई है, हम जल्द संपर्क करेंगे।';
      document.getElementById('enqName').value = '';
      document.getElementById('enqContact').value = '';
      document.getElementById('enqMessage').value = '';
    } else {
      msgEl.style.color = '#ff8080';
      msgEl.textContent = data.message || 'कुछ गड़बड़ हो गई।';
    }
  } catch (err) {
    msgEl.style.color = '#ff8080';
    msgEl.textContent = 'कुछ गड़बड़ हो गई, दोबारा कोशिश करें।';
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
  box.innerHTML = `<div style="background:#fff;padding:30px;border-radius:12px;max-width:380px;text-align:center;">
      <h3 style="margin-top:0;">आपका जवाब दर्ज किया जा रहा है...</h3>
    </div>`;
  document.body.appendChild(box);

  try {
    const url = SEARCH_WEB_APP_URL + '?action=confirmstatus&candidateId=' + encodeURIComponent(candidateId) +
      '&companyId=' + encodeURIComponent(companyId) + '&result=' + encodeURIComponent(result) + '&_=' + Date.now();
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'ok') {
      box.innerHTML = `<div style="background:#fff;padding:30px;border-radius:12px;max-width:380px;text-align:center;">
        <h3 style="margin-top:0;color:#2ecc71;">✅ धन्यवाद!</h3>
        <p>आपका जवाब (${result === 'selected' ? 'Selected हुआ' : 'Selected नहीं हुआ'}) दर्ज कर लिया गया है।</p>
      </div>`;
    } else {
      box.innerHTML = `<div style="background:#fff;padding:30px;border-radius:12px;max-width:380px;text-align:center;">
        <h3 style="margin-top:0;color:#C0392B;">कुछ गड़बड़ हो गई</h3>
        <p>${data.message || 'कृपया थोड़ी देर बाद दोबारा कोशिश करें।'}</p>
      </div>`;
    }
  } catch (err) {
    box.innerHTML = `<div style="background:#fff;padding:30px;border-radius:12px;max-width:380px;text-align:center;">
      <h3 style="margin-top:0;color:#C0392B;">कुछ गड़बड़ हो गई</h3>
      <p>कृपया थोड़ी देर बाद दोबारा कोशिश करें।</p>
    </div>`;
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
  msgEl.textContent = '✅ Live Alert चालू हो गया है। यह Tab खुली रखें।';
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
        banner.textContent = '🔔 ' + data.count + ' Payment Request अभी Pending है — नीचे Admin Unlock में जाकर देखें।';
      } else {
        banner.style.display = 'none';
      }
    }

    if (data.count > ekveeraLastPendingCount) {
      playAlertBeep();
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('EkVeera — नई Payment Request', { body: 'किसी Company ने पूरी जानकारी की Request भेजी है।' });
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
  const params = new URLSearchParams(window.location.search);
  const staffFromUrl = params.get('staff');
  if (staffFromUrl) {
    localStorage.setItem('ekveera_staff_ref', staffFromUrl);
  }
  const staff = localStorage.getItem('ekveera_staff_ref');
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

