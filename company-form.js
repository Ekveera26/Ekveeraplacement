/* EkVeera — Company Benefits Form (placement.html)
   - Company online form bhar sakti hai, ya Excel download karke bhar ke upload kar sakti hai
   - Admin (?admin=1 + password) ko list, Excel download aur live alert milta hai
   Ye file app.js ke BAAD load hoti hai (SEARCH_WEB_APP_URL, vcSecurePost, ekveeraAdminPassword etc. app.js se aate hain) */
(function () {
  'use strict';

  var DATA = [{"en": "COMPANY & JOB DETAILS", "hi": "कंपनी और काम की जानकारी", "items": [{"n": 1, "en": "Company name", "hi": "कंपनी का नाम", "yn": 0}, {"n": 2, "en": "Complete company address", "hi": "कंपनी का पूरा पता", "yn": 0}, {"n": 3, "en": "Contact person's name & designation", "hi": "संपर्क व्यक्ति का नाम और पद", "yn": 0}, {"n": 4, "en": "Contact person's mobile / WhatsApp number", "hi": "संपर्क व्यक्ति का मोबाइल / व्हाट्सऐप नंबर", "yn": 0}, {"n": 5, "en": "Email ID", "hi": "ईमेल आईडी", "yn": 0}, {"n": 6, "en": "Job post / designation", "hi": "नौकरी का पद", "yn": 0}, {"n": 7, "en": "Department / type of work", "hi": "विभाग / काम का प्रकार", "yn": 0}, {"n": 8, "en": "Number of candidates required (vacancies)", "hi": "कितने उम्मीदवार चाहिए (रिक्तियां)", "yn": 0}, {"n": 9, "en": "Work location", "hi": "काम करने की जगह", "yn": 0}, {"n": 10, "en": "Job type (Permanent / Contract / Trainee / Daily wages)", "hi": "नौकरी का प्रकार (स्थायी / कॉन्ट्रैक्ट / ट्रेनी / दैनिक मजदूरी)", "yn": 0}, {"n": 11, "en": "Joining date (by when candidate must join)", "hi": "जॉइनिंग की तारीख (कब तक जॉइन करना है)", "yn": 0}, {"n": 12, "en": "Contract duration (if contract job)", "hi": "कॉन्ट्रैक्ट की अवधि (यदि कॉन्ट्रैक्ट जॉब है)", "yn": 0}, {"n": 13, "en": "Probation period (in months)", "hi": "परिवीक्षा अवधि (कितने महीने)", "yn": 0}]}, {"en": "DUTY TIME", "hi": "ड्यूटी का समय", "items": [{"n": 14, "en": "Shift type (Day / Night / Rotational)", "hi": "शिफ्ट का प्रकार (दिन / रात / बदलती शिफ्ट)", "yn": 0}, {"n": 15, "en": "Duty start time", "hi": "ड्यूटी शुरू होने का समय", "yn": 0}, {"n": 16, "en": "Duty end time", "hi": "ड्यूटी खत्म होने का समय", "yn": 0}, {"n": 17, "en": "Duty hours per day", "hi": "प्रतिदिन ड्यूटी के घंटे", "yn": 0}, {"n": 18, "en": "Working days per week", "hi": "सप्ताह में कितने दिन काम", "yn": 0}, {"n": 19, "en": "Weekly off (which day)", "hi": "साप्ताहिक छुट्टी (कौन सा दिन)", "yn": 0}, {"n": 20, "en": "Break / rest time during duty (how long and when)", "hi": "ड्यूटी के बीच ब्रेक / आराम का समय (कितना और कब)", "yn": 0}, {"n": 21, "en": "Is overtime (OT) available?", "hi": "क्या ओवरटाइम (OT) होता है?", "yn": 1}, {"n": 22, "en": "OT rate (per hour / double)", "hi": "OT की दर (प्रति घंटा / डबल)", "yn": 0}, {"n": 23, "en": "Is night shift allowance given?", "hi": "क्या नाइट शिफ्ट भत्ता मिलता है?", "yn": 1}, {"n": 24, "en": "Is duty required on Sundays / holidays?", "hi": "क्या रविवार / छुट्टी के दिन ड्यूटी लगती है?", "yn": 1}, {"n": 25, "en": "Shift change rule (after how many days)", "hi": "शिफ्ट बदलने का नियम (कितने दिन में)", "yn": 0}]}, {"en": "SALARY / PAYMENT", "hi": "वेतन / भुगतान", "items": [{"n": 26, "en": "Monthly salary (Gross) Rs.", "hi": "मासिक वेतन (ग्रॉस) रु.", "yn": 0}, {"n": 27, "en": "Basic salary Rs.", "hi": "मूल वेतन (बेसिक) रु.", "yn": 0}, {"n": 28, "en": "HRA / Allowances Rs.", "hi": "HRA / भत्ते रु.", "yn": 0}, {"n": 29, "en": "In-hand salary Rs.", "hi": "हाथ में मिलने वाला वेतन (इन-हैंड) रु.", "yn": 0}, {"n": 30, "en": "Deductions from salary (PF, ESI, food, room, etc.)", "hi": "वेतन से कटौतियां (PF, ESI, खाना, कमरा आदि)", "yn": 0}, {"n": 31, "en": "Is PF (Provident Fund) provided?", "hi": "क्या PF (भविष्य निधि) मिलता है?", "yn": 1}, {"n": 32, "en": "Is ESI provided?", "hi": "क्या ESI मिलता है?", "yn": 1}, {"n": 33, "en": "Salary payment date", "hi": "वेतन मिलने की तारीख", "yn": 0}, {"n": 34, "en": "Payment mode (Bank / Cash / UPI)", "hi": "भुगतान का तरीका (बैंक / नकद / UPI)", "yn": 0}, {"n": 35, "en": "Is salary advance available?", "hi": "क्या एडवांस वेतन मिलता है?", "yn": 1}, {"n": 36, "en": "Incentive / Bonus / Commission", "hi": "इंसेंटिव / बोनस / कमीशन", "yn": 0}, {"n": 37, "en": "Salary increment (when and how much)", "hi": "वेतन वृद्धि (कब और कितनी)", "yn": 0}, {"n": 38, "en": "Notice period", "hi": "नोटिस अवधि", "yn": 0}, {"n": 39, "en": "Candidate's joining bonus / referral amount", "hi": "उम्मीदवार का जॉइनिंग बोनस / रेफरल राशि", "yn": 0}]}, {"en": "FOOD & TEA", "hi": "चाय, नाश्ता और खाना", "items": [{"n": 40, "en": "Is tea provided?", "hi": "क्या चाय मिलती है?", "yn": 1}, {"n": 41, "en": "Tea timings / how many times a day", "hi": "चाय का समय / दिन में कितनी बार", "yn": 0}, {"n": 42, "en": "Is breakfast provided?", "hi": "क्या नाश्ता मिलता है?", "yn": 1}, {"n": 43, "en": "Breakfast time", "hi": "नाश्ते का समय", "yn": 0}, {"n": 44, "en": "What is served for breakfast", "hi": "नाश्ते में क्या मिलता है", "yn": 0}, {"n": 45, "en": "Is lunch provided?", "hi": "क्या दोपहर का खाना मिलता है?", "yn": 1}, {"n": 46, "en": "Lunch time", "hi": "दोपहर के खाने का समय", "yn": 0}, {"n": 47, "en": "What is served for lunch", "hi": "दोपहर के खाने में क्या मिलता है", "yn": 0}, {"n": 48, "en": "Is dinner provided?", "hi": "क्या रात का खाना मिलता है?", "yn": 1}, {"n": 49, "en": "Dinner time", "hi": "रात के खाने का समय", "yn": 0}, {"n": 50, "en": "What is served for dinner", "hi": "रात के खाने में क्या मिलता है", "yn": 0}, {"n": 51, "en": "Are snacks / evening refreshments provided?", "hi": "क्या शाम का नाश्ता / स्नैक्स मिलते हैं?", "yn": 1}, {"n": 52, "en": "Extra food / tea during night shift?", "hi": "क्या नाइट शिफ्ट में अतिरिक्त खाना / चाय मिलती है?", "yn": 1}, {"n": 53, "en": "Food type: Veg / Non-veg / Both", "hi": "खाने का प्रकार: शाकाहारी / मांसाहारी / दोनों", "yn": 0}, {"n": 54, "en": "Food is free or amount deducted (how much)", "hi": "खाना मुफ्त है या पैसे कटेंगे (कितने)", "yn": 0}, {"n": 55, "en": "Is canteen / mess facility available?", "hi": "क्या कैंटीन / मेस की सुविधा है?", "yn": 1}, {"n": 56, "en": "Is clean drinking water (RO) provided?", "hi": "क्या साफ पीने का पानी (RO) मिलता है?", "yn": 1}]}, {"en": "ACCOMMODATION", "hi": "रहने की सुविधा", "items": [{"n": 57, "en": "Is accommodation (room) provided?", "hi": "क्या रहने की जगह (कमरा) मिलती है?", "yn": 1}, {"n": 58, "en": "Room type (Flat / Hostel / Dormitory / Camp)", "hi": "कमरे का प्रकार (फ्लैट / हॉस्टल / डॉर्मिटरी / कैंप)", "yn": 0}, {"n": 59, "en": "Number of people sharing a room", "hi": "एक कमरे में कितने लोग रहेंगे", "yn": 0}, {"n": 60, "en": "Are bed, mattress, cupboard / locker provided?", "hi": "क्या बिस्तर, गद्दा, अलमारी / लॉकर मिलता है?", "yn": 1}, {"n": 61, "en": "Room is free or rent deducted (how much)", "hi": "कमरा मुफ्त है या किराया कटेगा (कितना)", "yn": 0}, {"n": 62, "en": "Distance from room to workplace", "hi": "कमरे से काम की जगह की दूरी", "yn": 0}, {"n": 63, "en": "Electricity, fan / AC / cooler", "hi": "बिजली, पंखा / AC / कूलर", "yn": 0}, {"n": 64, "en": "Bathroom & toilet (attached / common)", "hi": "बाथरूम और शौचालय (अटैच्ड / कॉमन)", "yn": 0}, {"n": 65, "en": "Laundry facility (washing machine / laundry)", "hi": "कपड़े धोने की सुविधा (वॉशिंग मशीन / लॉन्ड्री)", "yn": 0}, {"n": 66, "en": "WiFi / charging point", "hi": "वाई-फाई / चार्जिंग पॉइंट", "yn": 0}, {"n": 67, "en": "Permission for cooking", "hi": "खाना बनाने की अनुमति", "yn": 0}]}, {"en": "TRANSPORT", "hi": "आने-जाने की सुविधा", "items": [{"n": 68, "en": "Is pick-up / drop (bus / van) provided?", "hi": "क्या पिक-अप / ड्रॉप (बस / वैन) मिलता है?", "yn": 1}, {"n": 69, "en": "Pick-up point and time", "hi": "पिक-अप स्थान और समय", "yn": 0}, {"n": 70, "en": "Travel allowance (how much)", "hi": "यात्रा भत्ता (कितना)", "yn": 0}, {"n": 71, "en": "Will travel fare from home to joining place be reimbursed?", "hi": "क्या जॉइनिंग के लिए घर से आने का किराया मिलेगा?", "yn": 1}, {"n": 72, "en": "Company vehicle / parking facility", "hi": "कंपनी वाहन / पार्किंग की सुविधा", "yn": 0}]}, {"en": "LEAVE, BENEFITS & SAFETY", "hi": "छुट्टी, लाभ और सुरक्षा", "items": [{"n": 73, "en": "Paid leave (how many per year)", "hi": "सवेतन छुट्टी (साल में कितनी)", "yn": 0}, {"n": 74, "en": "Sick leave / Casual leave", "hi": "बीमारी की छुट्टी / आकस्मिक छुट्टी", "yn": 0}, {"n": 75, "en": "Are public holidays (festivals) paid?", "hi": "क्या सार्वजनिक छुट्टियां (त्योहार) सवेतन हैं?", "yn": 1}, {"n": 76, "en": "Medical insurance / accident insurance", "hi": "मेडिकल बीमा / दुर्घटना बीमा", "yn": 0}, {"n": 77, "en": "Medical facility / first aid / doctor", "hi": "चिकित्सा सुविधा / प्राथमिक उपचार / डॉक्टर", "yn": 0}, {"n": 78, "en": "Bonus / Gratuity", "hi": "बोनस / ग्रेच्युटी", "yn": 0}, {"n": 79, "en": "Is uniform provided?", "hi": "क्या यूनिफॉर्म मिलती है?", "yn": 1}, {"n": 80, "en": "Safety shoes / helmet / gloves / safety kit", "hi": "सेफ्टी शूज़ / हेलमेट / दस्ताने / सेफ्टी किट", "yn": 0}, {"n": 81, "en": "Is ID card provided?", "hi": "क्या पहचान पत्र (ID कार्ड) मिलता है?", "yn": 1}, {"n": 82, "en": "Will appointment / offer letter be given?", "hi": "क्या नियुक्ति पत्र / ऑफर लेटर मिलेगा?", "yn": 1}, {"n": 83, "en": "Will training be provided? (how many days)", "hi": "क्या प्रशिक्षण दिया जाएगा? (कितने दिन)", "yn": 1}, {"n": 84, "en": "Skill / career growth (promotion)", "hi": "कौशल / करियर विकास (पदोन्नति)", "yn": 0}]}, {"en": "CANDIDATE REQUIREMENTS", "hi": "उम्मीदवार से अपेक्षाएं", "items": [{"n": 85, "en": "Minimum qualification", "hi": "न्यूनतम योग्यता", "yn": 0}, {"n": 86, "en": "Experience (fresher / how many years)", "hi": "अनुभव (फ्रेशर / कितने साल)", "yn": 0}, {"n": 87, "en": "Age limit (min - max)", "hi": "आयु सीमा (न्यूनतम - अधिकतम)", "yn": 0}, {"n": 88, "en": "Gender (Male / Female / Both)", "hi": "लिंग (पुरुष / महिला / दोनों)", "yn": 0}, {"n": 89, "en": "Skills / languages (Hindi, English, etc.)", "hi": "कौशल / भाषा (हिंदी, अंग्रेज़ी आदि)", "yn": 0}, {"n": 90, "en": "Is medical fitness test required?", "hi": "क्या मेडिकल फिटनेस टेस्ट ज़रूरी है?", "yn": 1}, {"n": 91, "en": "Is police verification required?", "hi": "क्या पुलिस वेरिफिकेशन ज़रूरी है?", "yn": 1}, {"n": 92, "en": "Interview / trade test process (when and where)", "hi": "इंटरव्यू / ट्रेड टेस्ट की प्रक्रिया (कब और कहां)", "yn": 0}, {"n": 93, "en": "Documents required (Aadhaar, PAN, bank passbook, photo, certificates, etc.)", "hi": "ज़रूरी दस्तावेज़ (आधार, पैन, बैंक पासबुक, फोटो, प्रमाणपत्र आदि)", "yn": 0}]}, {"en": "RULES & OTHER TERMS", "hi": "नियम और अन्य शर्तें", "items": [{"n": 94, "en": "Dress code", "hi": "ड्रेस कोड", "yn": 0}, {"n": 95, "en": "Is mobile phone allowed?", "hi": "क्या मोबाइल फोन की अनुमति है?", "yn": 1}, {"n": 96, "en": "Leave approval rule", "hi": "छुट्टी स्वीकृति का नियम", "yn": 0}, {"n": 97, "en": "Rule for salary cut on late arrival / absence", "hi": "देर से आने / अनुपस्थिति पर वेतन कटौती का नियम", "yn": 0}, {"n": 98, "en": "Rule for resignation / termination", "hi": "नौकरी छोड़ने / निकाले जाने का नियम", "yn": 0}, {"n": 99, "en": "Replacement / guarantee period (if candidate leaves)", "hi": "रिप्लेसमेंट / गारंटी अवधि (यदि उम्मीदवार छोड़ दे)", "yn": 0}, {"n": 100, "en": "Agency commission / service charge (if any)", "hi": "एजेंसी का कमीशन / सर्विस चार्ज (यदि हो)", "yn": 0}, {"n": 101, "en": "Any other facility or condition not listed above", "hi": "कोई अन्य सुविधा या शर्त जो ऊपर नहीं लिखी है", "yn": 0}]}];
  var DRAFT_KEY = 'ekveera_cf_draft_v1';
  var lang = (window.EKV_LANG === 'en') ? 'en' : 'hi';   // वेबसाइट के Header वाली भाषा ही चलेगी
  var state = { meta: { companyId: '', companyName: '', contactName: '', mobile: '', email: '' }, vals: {} };

  var UI = {
    hi: {
      choose: '-- चुनें --', yes: 'हाँ', no: 'नहीं', na: 'लागू नहीं',
      detail: 'समय / राशि / विवरण लिखें', remark: 'टिप्पणी (वैकल्पिक)',
      filled: 'भरे', submit: '✅ Form जमा करें', sending: 'भेजा जा रहा है...',
      needId: 'कृपया सही Company ID भरें (जैसे COMP001)।',
      needName: 'कृपया Company का नाम भरें।',
      needMobile: 'कृपया 10 अंकों का सही Mobile Number भरें।',
      needAnswer: 'कृपया कम-से-कम एक जानकारी भरें।',
      needFile: 'कृपया भरी हुई Excel (.xlsx) फ़ाइल चुनें।',
      badFile: 'सिर्फ .xlsx फ़ाइल (2 MB तक) चुनें।',
      ok: '✅ धन्यवाद! आपका Form मिल गया है। Form No.: ',
      fail: 'कुछ गड़बड़ हो गई — Internet चेक करके दोबारा कोशिश करें।',
      draft: '📝 आपका पिछला अधूरा भरा हुआ Form वापस लोड किया गया है।'
    },
    en: {
      choose: '-- Select --', yes: 'Yes', no: 'No', na: 'N/A',
      detail: 'Write time / amount / details', remark: 'Remarks (optional)',
      filled: 'filled', submit: '✅ Submit Form', sending: 'Sending...',
      needId: 'Please enter a valid Company ID (e.g. COMP001).',
      needName: 'Please enter the Company name.',
      needMobile: 'Please enter a valid 10-digit mobile number.',
      needAnswer: 'Please fill at least one detail.',
      needFile: 'Please choose the filled Excel (.xlsx) file.',
      badFile: 'Only .xlsx files up to 2 MB are allowed.',
      ok: '✅ Thank you! We have received your form. Form No.: ',
      fail: 'Something went wrong — check your internet and try again.',
      draft: '📝 Your earlier unfinished form has been restored.'
    }
  };

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function ynLabel(v) { return v === 'Yes' ? UI[lang].yes : v === 'No' ? UI[lang].no : v === 'N/A' ? UI[lang].na : ''; }

  // ---------- Draft (अधूरा Form Phone में सुरक्षित) ----------
  var saveTimer = null;
  function saveDraft() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ lang: lang, state: state })); } catch (e) {}
    }, 400);
  }
  function loadDraft() {
    try {
      var d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (d && d.state && d.state.vals) { state = d.state; return true; }
    } catch (e) {}
    return false;
  }
  function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }

  // ---------- Company details (दोनों तरीकों के लिए common) ----------
  var META_IDS = { companyId: 'cfCompanyId', companyName: 'cfCompanyName', contactName: 'cfContactName', mobile: 'cfMobile', email: 'cfEmail' };
  function readMeta() {
    Object.keys(META_IDS).forEach(function (k) { var i = $(META_IDS[k]); if (i) state.meta[k] = i.value.trim(); });
  }
  function fillMeta() {
    Object.keys(META_IDS).forEach(function (k) { var i = $(META_IDS[k]); if (i) i.value = state.meta[k] || ''; });
  }
  function validateMeta() {
    readMeta();
    var m = state.meta, u = UI[lang];
    if (!/^COMP\d{1,8}$/i.test(m.companyId)) return u.needId;
    if (m.companyName.length < 2) return u.needName;
    var digits = m.mobile.replace(/\D/g, '');
    if (digits.length < 10) return u.needMobile;
    return '';
  }
  function metaPayload() {
    var m = state.meta;
    return {
      companyId: m.companyId.toUpperCase(), companyName: m.companyName, contactName: m.contactName,
      mobile: m.mobile.replace(/\D/g, '').slice(-10), email: m.email, lang: lang
    };
  }
  function showMsg(text, ok) {
    var m = $('cfMsg'); if (!m) return;
    m.style.color = ok ? '#11766F' : '#a33131';
    m.textContent = text;
    m.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ---------- Online form render ----------
  function countFilled() {
    var c = 0;
    Object.keys(state.vals).forEach(function (n) {
      var v = state.vals[n]; if (v && (v.yn || v.d || v.r)) c++;
    });
    return c;
  }
  function updateProgress() {
    var p = $('cfProgress'); if (!p) return;
    p.textContent = countFilled() + ' / 101 ' + UI[lang].filled;
    DATA.forEach(function (sec, si) {
      var c = 0;
      sec.items.forEach(function (it) { var v = state.vals[it.n]; if (v && (v.yn || v.d || v.r)) c++; });
      var b = $('cfSecCount' + si); if (b) b.textContent = c + '/' + sec.items.length;
    });
  }
  function getVal(n) { if (!state.vals[n]) state.vals[n] = { yn: '', d: '', r: '' }; return state.vals[n]; }

  function renderForm() {
    var host = $('cfFormBody'); if (!host) return;
    host.textContent = '';
    var u = UI[lang];
    DATA.forEach(function (sec, si) {
      var det = el('details', 'cf-sec');
      if (si === 0) det.open = true;
      var sum = el('summary', 'cf-sum');
      sum.appendChild(el('span', 'cf-sum-t', (si + 1) + '. ' + sec[lang]));
      var cnt = el('span', 'cf-sum-c', ''); cnt.id = 'cfSecCount' + si; sum.appendChild(cnt);
      det.appendChild(sum);
      sec.items.forEach(function (it) {
        var row = el('div', 'cf-row');
        var q = el('div', 'cf-q');
        q.appendChild(el('span', 'cf-no', String(it.n)));
        q.appendChild(document.createTextNode(' ' + it[lang]));
        row.appendChild(q);
        var box = el('div', 'cf-inputs');
        var v = getVal(it.n);
        if (it.yn) {
          var sel = el('select', 'cf-yn');
          [['', u.choose], ['Yes', u.yes], ['No', u.no], ['N/A', u.na]].forEach(function (o) {
            var op = el('option', null, o[1]); op.value = o[0]; if (v.yn === o[0]) op.selected = true; sel.appendChild(op);
          });
          sel.addEventListener('change', function () { getVal(it.n).yn = sel.value; saveDraft(); updateProgress(); });
          box.appendChild(sel);
        }
        var d = el('input', 'cf-d'); d.type = 'text'; d.maxLength = 300; d.placeholder = u.detail; d.value = v.d || '';
        d.addEventListener('input', function () { getVal(it.n).d = d.value; saveDraft(); updateProgress(); });
        box.appendChild(d);
        var r = el('input', 'cf-r'); r.type = 'text'; r.maxLength = 200; r.placeholder = u.remark; r.value = v.r || '';
        r.addEventListener('input', function () { getVal(it.n).r = r.value; saveDraft(); updateProgress(); });
        box.appendChild(r);
        row.appendChild(box);
        det.appendChild(row);
      });
      host.appendChild(det);
    });
    var sb = $('cfSubmitBtn'); if (sb) sb.textContent = u.submit;
    ['cfLangHi', 'cfLangEn'].forEach(function (id) {
      var b = $(id); if (b) b.classList.toggle('is-on', (id === 'cfLangHi') === (lang === 'hi'));
    });
    updateProgress();
  }

  function buildAnswers() {
    var rows = [];
    DATA.forEach(function (sec) {
      sec.items.forEach(function (it) {
        var v = state.vals[it.n];
        if (v && (v.yn || v.d || v.r)) rows.push({ n: it.n, s: sec[lang], q: it[lang], yn: v.yn || '', d: v.d || '', r: v.r || '' });
      });
    });
    return rows;
  }

  var sending = false;
  async function submitPayload(extra, btn) {
    if (sending) return;
    sending = true;
    var u = UI[lang], old = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = u.sending; }
    try {
      var params = metaPayload();
      Object.keys(extra).forEach(function (k) { params[k] = extra[k]; });
      params.action = 'submitcompanyinfo';
      var data = await vcSecurePost(params);
      if (data && data.status === 'ok') {
        showMsg(u.ok + data.submissionId, true);
        clearDraft();
        return true;
      }
      showMsg((data && data.message) || u.fail, false);
    } catch (e) {
      showMsg(u.fail, false);
    } finally {
      sending = false;
      if (btn) { btn.disabled = false; btn.textContent = old; }
    }
    return false;
  }

  window.cfSubmitOnline = async function () {
    var u = UI[lang];
    var err = validateMeta();
    if (err) return showMsg(err, false);
    var rows = buildAnswers();
    if (!rows.length) return showMsg(u.needAnswer, false);
    var ok = await submitPayload({ mode: 'online', answers: JSON.stringify(rows) }, $('cfSubmitBtn'));
    if (ok) { state.vals = {}; renderForm(); }
  };

  window.cfSetLang = function (l) { lang = l === 'en' ? 'en' : 'hi'; renderForm(); saveDraft(); };

  window.cfShowPanel = function (which) {
    ['cfOnlineWrap', 'cfUploadWrap'].forEach(function (id) {
      var p = $(id); if (p) p.style.display = (id === (which === 'online' ? 'cfOnlineWrap' : 'cfUploadWrap')) ? 'block' : 'none';
    });
    var m = $('cfMetaBox'); if (m) { m.style.display = 'block'; }
    var t = $(which === 'online' ? 'cfOnlineWrap' : 'cfUploadWrap');
    if (t) setTimeout(function () { $('cfMetaBox').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
  };

  // ---------- Excel upload ----------
  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { reject(new Error('read')); };
      r.readAsDataURL(file);
    });
  }
  function fileToBuffer(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(new Error('read')); };
      r.readAsArrayBuffer(file);
    });
  }
  function normYn(s) {
    var t = String(s == null ? '' : s).trim();
    if (t === 'हाँ' || t === 'हां' || /^yes$/i.test(t)) return 'Yes';
    if (t === 'नहीं' || /^no$/i.test(t)) return 'No';
    if (t === 'लागू नहीं' || /^n\/?a$/i.test(t)) return 'N/A';
    return '';
  }
  // हमारे template की Excel से Answers पढ़ना (मिल जाएं तो Admin Panel में साफ़ दिखेंगे; न मिलें तो सिर्फ़ फ़ाइल जाएगी)
  async function parseExcelAnswers(file) {
    try {
      if (typeof XLSX === 'undefined') return [];
      var wb = XLSX.read(await fileToBuffer(file), { type: 'array' });
      var ws = wb.Sheets[wb.SheetNames[0]];
      var aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      var rows = [], section = '';
      aoa.forEach(function (r) {
        var a = r[0], b = String(r[1] || '').trim();
        if (typeof a === 'string' && /^\d+\.\s/.test(a.trim()) && !b) { section = a.replace(/^\d+\.\s*/, '').trim(); return; }
        if (typeof a !== 'number' || !b) return;
        var yn = normYn(r[2]), extraYn = yn ? '' : String(r[2] || '').trim();
        var d = (extraYn ? extraYn + ' ' : '') + String(r[3] || '').trim();
        var rem = String(r[4] || '').trim();
        if (yn || d.trim() || rem) rows.push({ n: a, s: section, q: b.slice(0, 200), yn: yn, d: d.trim().slice(0, 300), r: rem.slice(0, 200) });
      });
      return rows.slice(0, 150);
    } catch (e) { return []; }
  }

  window.cfSubmitExcel = async function () {
    var u = UI[lang];
    var err = validateMeta();
    if (err) return showMsg(err, false);
    var f = $('cfFile') && $('cfFile').files[0];
    if (!f) return showMsg(u.needFile, false);
    if (!/\.xlsx$/i.test(f.name) || f.size > 2 * 1024 * 1024) return showMsg(u.badFile, false);
    var btn = $('cfUploadBtn');
    var b64 = await fileToBase64(f);
    var rows = await parseExcelAnswers(f);
    var ok = await submitPayload({ mode: 'excel', fileBase64: b64, answers: JSON.stringify(rows) }, btn);
    if (ok) $('cfFile').value = '';
  };

  // ---------- Admin: list / Excel download / seen ----------
  function fmtDate(s) { try { return new Date(s).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return s; } }
  function adminPw() { return (typeof ekveeraAdminPassword !== 'undefined') ? ekveeraAdminPassword : ''; }

  var lastNewest = null;
  window.cfAdminLoad = async function () {
    var host = $('adminCfList'); if (!host) return null;
    if (!adminPw()) { host.textContent = __t('पहले Admin Login करें।'); return null; }
    host.textContent = __t('लोड हो रहा है...');
    try {
      var data = await vcSecurePost({ action: 'listcompanyforms', password: adminPw() });
      if (data.status !== 'ok') { host.textContent = data.message || __t('लोड नहीं हो पाया।'); return null; }
      host.textContent = '';
      if (!data.items.length) { host.textContent = __t('अभी तक किसी Company ने Form नहीं भरा।'); return data; }
      data.items.forEach(function (it) {
        var card = el('div', 'cf-adm-card' + (it.status === 'New' ? ' is-new' : ''));
        var top = el('div', 'cf-adm-top');
        top.appendChild(el('strong', null, it.companyId + ' — ' + it.companyName));
        if (it.status === 'New') top.appendChild(el('span', 'cf-badge', 'NEW'));
        card.appendChild(top);
        var meta = el('div', 'cf-adm-meta');
        meta.appendChild(document.createTextNode(it.submissionId + ' • ' + fmtDate(it.timestamp) + ' • ' + (it.mode === 'excel' ? 'Excel Upload' : 'Online Form') + ' • ' + (it.lang === 'en' ? 'English' : __t('हिंदी'))));
        card.appendChild(meta);
        var who = el('div', 'cf-adm-meta');
        who.appendChild(document.createTextNode((it.contactName ? it.contactName + ' • ' : '')));
        var tel = el('a', null, it.mobile); tel.href = 'tel:' + it.mobile; who.appendChild(tel);
        if (it.email) who.appendChild(document.createTextNode(' • ' + it.email));
        card.appendChild(who);
        var ver = el('div', 'cf-adm-meta', it.verified === 'Mobile differs' ? __t('⚠️ Company ID सही है, पर Mobile Number Company Database वाले Number से अलग है — जांच लें।') : it.verified === 'Yes' ? __t('✔ Company ID और Mobile मैच हुए') : '');
        if (it.verified === 'Mobile differs') ver.style.color = '#a33131';
        if (ver.textContent) card.appendChild(ver);
        var acts = el('div', 'cf-adm-acts');
        var bx = el('button', 'cf-adm-btn', '⬇ Excel'); bx.onclick = function () { cfAdminDownload(it); };
        acts.appendChild(bx);
        if (it.fileLink) { var fl = el('a', 'cf-adm-btn', '📎 Original File'); fl.href = it.fileLink; fl.target = '_blank'; fl.rel = 'noopener'; acts.appendChild(fl); }
        if (it.status === 'New') { var bs = el('button', 'cf-adm-btn', __t('✔ देख लिया')); bs.onclick = function () { cfAdminSeen(it.submissionId); }; acts.appendChild(bs); }
        card.appendChild(acts);
        host.appendChild(card);
      });
      return data;
    } catch (e) { host.textContent = __t('कुछ गड़बड़ हो गई।'); return null; }
  };

  window.cfAdminSeen = async function (id) {
    try { await vcSecurePost({ action: 'markcompanyformseen', submissionId: id, password: adminPw() }); } catch (e) {}
    await cfAdminLoad();
    pollCF(true);
  };

  window.cfAdminDownload = async function (it) {
    try {
      var data = await vcSecurePost({ action: 'getcompanyformanswers', submissionId: it.submissionId, password: adminPw() });
      if (data.status !== 'ok') return alert(data.message || __t('Download नहीं हो पाया।'));
      if (!data.answers.length) {
        if (it.fileLink) return window.open(it.fileLink, '_blank');
        return alert(__t('इस Form में कोई जानकारी नहीं मिली।'));
      }
      var head = [
        ['Company ID', it.companyId], ['Company', it.companyName], ['Contact', it.contactName], ['Mobile', it.mobile],
        ['Email', it.email], ['Form No.', it.submissionId], ['Date', fmtDate(it.timestamp)], []
      ];
      var body = [['No.', 'Section', 'Details', 'Yes/No', 'Company Answer / Detail', 'Remarks']];
      data.answers.forEach(function (a) { body.push([a.n, a.section, a.question, a.yn, a.detail, a.remarks]); });
      var ws = XLSX.utils.aoa_to_sheet(head.concat(body));
      ws['!cols'] = [{ wch: 12 }, { wch: 26 }, { wch: 52 }, { wch: 10 }, { wch: 46 }, { wch: 30 }];
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Company Info');
      var out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      var url = URL.createObjectURL(new Blob([out], { type: 'application/octet-stream' }));
      var a = document.createElement('a');
      a.href = url; a.download = 'CompanyInfo_' + it.companyId + '_' + it.submissionId + '.xlsx'; a.style.display = 'none';
      document.body.appendChild(a); a.click();
      setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
    } catch (e) { alert(__t('Excel बनाने में दिक्कत आई।')); }
  };

  // ---------- Live alert (सिर्फ़ उसी Device पर जहाँ Admin ने "Live Alert चालू करें" दबाया है) ----------
  var lastCfCount = parseInt(localStorage.getItem('ekveera_last_cf_count') || '0', 10);
  async function pollCF(silent) {
    if (typeof ekveeraAlertsEnabled === 'undefined' || !ekveeraAlertsEnabled) return;
    try {
      var res = await fetch(SEARCH_WEB_APP_URL + '?action=checkpendingcompanyforms&_=' + Date.now());
      var data = await res.json();
      if (data.status !== 'ok') return;
      var banner = $('adminCfBanner');
      if (banner) {
        if (data.count > 0) { banner.style.display = 'block'; banner.textContent = '📋 ' + data.count + __t(' नया Company Form आया है — नीचे "Company Benefits Forms" में देखें।'); }
        else banner.style.display = 'none';
      }
      if (!silent && data.count > lastCfCount) {
        if (typeof playAlertBeep === 'function') playAlertBeep();
        var body = __t('किसी Company ने Candidate Benefits Form भरा है।');
        if (adminPw()) {
          var list = await cfAdminLoad();
          var first = list && list.items && list.items.filter(function (x) { return x.status === 'New'; })[0];
          if (first) body = first.companyId + ' — ' + first.companyName + __t(' ने Form भरा है।');
        }
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(__t('EkVeera — नया Company Form'), { body: body });
        }
      }
      lastCfCount = data.count;
      localStorage.setItem('ekveera_last_cf_count', String(lastCfCount));
    } catch (e) { /* अगली बार फिर कोशिश होगी */ }
  }

  window.cfPollNow = function () { return pollCF(); };

  // Admin login hote hi list apne-aap khul jaye (button dabana na pade)
  var cfListAutoLoaded = false;
  setInterval(function () {
    if (!cfListAutoLoaded && $('adminCfList') && adminPw()) { cfListAutoLoaded = true; cfAdminLoad(); pollCF(true); }
  }, 1500);

  // ---------- Init ----------
  function init() {
    if (!$('cfFormBody')) { setInterval(pollCF, 20000); pollCF(); return; }
    var restored = loadDraft();
    // Email ke link (?cid=COMP001) se aane par Company ID pehle se bhari mile aur Online Form seedha khule
    var cidParam = '';
    try { cidParam = (new URLSearchParams(window.location.search).get('cid') || '').trim().toUpperCase(); } catch (e) {}
    if (/^COMP\d{1,8}$/.test(cidParam)) state.meta.companyId = cidParam; else cidParam = '';
    fillMeta();
    renderForm();
    if (restored && countFilled() > 0) {
      var n = $('cfDraftNote'); if (n) { n.textContent = UI[lang].draft; n.style.display = 'block'; }
    }
    Object.keys(META_IDS).forEach(function (k) {
      var i = $(META_IDS[k]); if (i) i.addEventListener('input', function () { readMeta(); saveDraft(); });
    });
    if (cidParam) cfShowPanel('online');
    setInterval(pollCF, 20000); pollCF();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
