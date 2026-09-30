/* EkVeera — Help Center (Search karo, Step-by-Step jawab pao)
   Placement page ke #help section mein chalta hai. Naya sawal-jawab jodna ho to neeche ARTICLES mein
   ek naya {...} block jod dein — search apne-aap use pakad lega. */
(function () {
  'use strict';

  var WA_NUMBER = '919766284669';

  /* ---------- CSS (isi file se judta hai) ---------- */
  var hcCss = '.hc-root{margin-bottom:26px}.hc-search{display:flex;align-items:center;gap:8px;background:#fff;border:2px solid #1F9D95;border-radius:14px;padding:6px 10px;box-shadow:0 6px 20px rgba(31,157,149,.12)}' +
    '.hc-search span{font-size:20px}.hc-search input{flex:1;border:0;outline:0;font-size:16px;padding:10px 4px;font-family:inherit;background:transparent;min-width:0}' +
    '.hc-search button{border:0;background:#eef1f5;border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:14px}' +
    '.hc-pop{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 4px;align-items:center}.hc-pop-l{font-size:13px;color:#596579;font-weight:700}' +
    '.hc-q{border:1px solid #cfd6e0;background:#fff;border-radius:18px;padding:7px 13px;font-size:13px;cursor:pointer;color:#0B1F3A;font-family:inherit}.hc-q:hover{border-color:#1F9D95;background:#f0faf9}' +
    '.hc-cats{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0}.hc-chip{border:1px solid #0B1F3A;background:#fff;color:#0B1F3A;border-radius:18px;padding:6px 13px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}.hc-chip.is-on{background:#0B1F3A;color:#fff}' +
    '.hc-h{margin:20px 0 8px;color:#0B1F3A;font-size:15px}.hc-count{font-size:13px;color:#596579;margin:6px 0 10px}' +
    '.hc-card{background:#fff;border:1px solid #dde3ec;border-radius:12px;margin-bottom:10px;overflow:hidden}.hc-card[open]{border-color:#1F9D95;box-shadow:0 4px 16px rgba(31,157,149,.12)}' +
    '.hc-card summary{list-style:none;cursor:pointer;padding:13px 14px;display:flex;align-items:center;gap:10px}.hc-card summary::-webkit-details-marker{display:none}' +
    '.hc-ic{font-size:22px}.hc-t{flex:1;font-weight:700;color:#0B1F3A;font-size:15px;line-height:1.35}.hc-tag{font-size:11px;background:#D9E1F2;color:#0B1F3A;border-radius:10px;padding:3px 9px;white-space:nowrap}' +
    '.hc-body{padding:2px 16px 16px;border-top:1px solid #eef1f5}.hc-steps{list-style:none;margin:12px 0 0;padding:0}' +
    '.hc-steps li{display:flex;gap:11px;align-items:flex-start;margin-bottom:11px;font-size:14.5px;line-height:1.55;color:#2d3748}' +
    '.hc-n{flex:none;width:26px;height:26px;border-radius:50%;background:#0B1F3A;color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;margin-top:1px}' +
    '.hc-tips{background:#fff9e6;border:1px solid #efd98a;border-radius:10px;padding:10px 14px;margin-top:6px;font-size:13.5px}.hc-tips ul{margin:6px 0 0;padding-left:18px}.hc-tips li{margin-bottom:4px}' +
    '.hc-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.hc-go,.hc-copy{border-radius:9px;padding:9px 14px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit}' +
    '.hc-go{background:#1F9D95;color:#fff;border:0}.hc-copy{background:#fff;border:1px solid #cfd6e0;color:#0B1F3A}' +
    '.hc-empty{background:#fff;border:1px dashed #cfd6e0;border-radius:12px;padding:18px;text-align:center;color:#4a5568}' +
    '.hc-foot{margin-top:16px;padding:16px;background:#E4F4EA;border:1px solid #8fd6a8;border-radius:12px;text-align:center}.hc-foot p{margin:0 0 10px;font-weight:700;color:#0B1F3A}.hc-foot-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}' +
    '@keyframes hcPulse{0%,100%{box-shadow:0 0 0 0 rgba(31,157,149,0)}30%{box-shadow:0 0 0 8px rgba(31,157,149,.45)}}.hc-pulse{animation:hcPulse 1.1s ease 3;outline:3px solid #1F9D95;outline-offset:3px;border-radius:8px}';
  var hcStyle = document.createElement('style'); hcStyle.textContent = hcCss; document.head.appendChild(hcStyle);

  var CATS = [
    { id: 'all',   label: 'सब' },
    { id: 'cand',  label: '👤 Candidate' },
    { id: 'comp',  label: '🏢 Company' },
    { id: 'train', label: '🎓 Training' },
    { id: 'pay',   label: '💳 Payment' },
    { id: 'id',    label: '🪪 ID & Certificate' },
    { id: 'gen',   label: 'ℹ️ General' }
  ];
  var CAT_LABEL = { cand: 'Candidate', comp: 'Company', train: 'Training', pay: 'Payment', id: 'ID & Certificate', gen: 'General' };

  /* go: [{label, sel (isi page ka element), pre (pehle chalane wala function), href (dusra page)}] */
  var ARTICLES = [
    {
      id: 'start', cats: ['gen'], icon: '🧭', pop: 1,
      title: 'शुरुआत कहां से करूं? (Candidate / Company / Training)',
      kw: 'start shuru shuruat kaha se kare kya karu kaise use website guide samajh nahi aa raha help pehle',
      steps: [
        'अगर आप **Job ढूंढ रहे हैं** और सिर्फ Resume जमा करना है → Placement page पर "📄 Resume For Upload" फॉर्म भरें।',
        'अगर आपको **Call Center Training** सीखनी है → Training page पर "🎓 Admission For Training" फॉर्म भरें (₹99 Fee)।',
        'अगर आप **Company** हैं और Candidate चाहिए → Placement page पर "🏢 Requirement Of Candidate" फॉर्म भरें।',
        'फॉर्म भरते ही आपकी **ID ईमेल पर** आ जाती है (Candidate: CAND001, Training: TRA-CAND001, Company: COMP001)। इस ID को संभालकर रखें।',
        'हर काम के लिए इसी Help में नीचे Step-by-Step बताया गया है — ऊपर खोज-बॉक्स में अपना सवाल लिखें।'
      ],
      go: [{ label: '📝 फॉर्म वाला हिस्सा दिखाएं', sel: '#apply' }, { label: '🎓 Training Admission', href: 'training.html#apply' }]
    },
    {
      id: 'resume-upload', cats: ['cand'], icon: '📄', pop: 1,
      title: 'Resume कैसे जमा करूं? (Job के लिए Registration)',
      kw: 'resume rezume cv biodata bio data naukri job jobs rojgar kaam dalna dalu dalo daalna bharna form upload jama register registration candidate apply vacancy mujhe job chahiye',
      steps: [
        'इसी Placement page पर **"📝 फॉर्म भरें"** वाले हिस्से में जाएं (ऊपर Menu → Placement → 📝 फॉर्म भरें)।',
        '**"01 📄 Resume For Upload"** वाले कार्ड में **"📝 Resume फॉर्म भरें"** बटन दबाएं — फॉर्म इसी पेज पर खुल जाएगा।',
        'अपनी जानकारी भरें: नाम, Mobile Number, Email, योग्यता, अनुभव, Skills, शहर, कैसी Job चाहिए, Salary। (जिन पर लाल तारा ✱ लगा है, वह जानकारी ज़रूरी है)',
        '**"अपना Resume Upload करें"** में अपना Resume चुनें (PDF या Word, 3 MB तक)।',
        'सबसे नीचे **सहमति (✔)** पर टिक करके **"✅ जमा करें"** दबाएं।',
        'कुछ सेकंड में स्क्रीन पर आपकी **Candidate ID (जैसे CAND001)** दिख जाएगी — वही ID आपके Email पर भी आ जाएगी (Spam/Promotions folder भी देखें)।'
      ],
      tips: [
        'Mobile Number और Email बिल्कुल सही डालें — ID इसी पर आती है, और Company आपसे इसी से संपर्क करेगी।',
        'Resume सिर्फ़ PDF या Word (.doc/.docx) चलेगा, 3 MB से छोटा। फ़ाइल न खुले तो PDF बनाकर दोबारा चुनें।',
        'फॉर्म अधूरा छोड़ दें तो आपकी भरी जानकारी उसी Phone में सुरक्षित रहती है — दोबारा खोलने पर वापस मिल जाती है।',
        'अगर किसी Staff के Link से आए हैं तो उसका नाम फॉर्म में अपने-आप लिखा दिखेगा — वह बदला नहीं जा सकता।',
        'गलत/फ़र्ज़ी जानकारी पर कानूनी कार्रवाई हो सकती है — सही जानकारी ही भरें।'
      ],
      go: [{ label: '📝 Resume फॉर्म अभी खोलें', sel: '#regHost', pre: "regOpen('candidate')" }]
    },
    {
      id: 'privacy', cats: ['cand'], icon: '🔒',
      title: 'मेरी जानकारी (नाम, Mobile) कौन देख सकता है?',
      kw: 'privacy suraksha safe surakshit mera number mobile naam kaun dekh sakta data leak private personal jankari kisko milegi company ko',
      steps: [
        'Search में Company को आपका **नाम, Mobile और Email नहीं दिखता** — सिर्फ शहर, योग्यता, अनुभव, Skills जैसी बातें और आपकी ID दिखती है।',
        'आपकी पूरी जानकारी Company को तभी मिलती है जब वह आपकी ID चुनकर **Payment** करती है और Request Approve होती है।',
        'Company के Interview के लिए बुलाने पर आपको Email आता है — Selected हुए या नहीं, आप खुद बताते हैं।'
      ],
      tips: ['Job की कोई गारंटी नहीं है — Selection Interview और Company की ज़रूरत पर निर्भर करता है।']
    },
    {
      id: 'search-company', cats: ['cand'], icon: '🔍', pop: 1,
      title: 'Job / Company कैसे खोजूं?',
      kw: 'company khojna khoj search dhundna dhundhna vacancy job opening naukri kahan hai city sahar dekhna find',
      steps: [
        'Placement page पर **"🔍 खोजें"** वाले हिस्से में जाएं।',
        '**"🏢 मुझे Company चाहिए"** बटन दबाएं।',
        'खोज-बॉक्स में लिखें, जैसे: **call center, sales, Maihar** — फिर **"खोजें"** दबाएं।',
        'नीचे नतीजों में Company की Job और उसकी **ID** दिखेगी (जिनकी Closing Date निकल चुकी है वे नहीं दिखतीं)।',
        'जो Company पसंद आए उसकी ID नोट करें (या "⬇ Excel Download" दबाएं) और यह ID **EkVeera को WhatsApp पर बताएं** — हम आपका Resume उस Company को भेज देंगे।'
      ],
      tips: ['Search बिल्कुल मुफ़्त है।'],
      go: [{ label: '📍 Company खोज वाला हिस्सा', sel: '#searchCompInput', pre: "switchSearchTab('company')" }]
    },
    {
      id: 'interview-result', cats: ['cand'], icon: '📧',
      title: 'Interview का नतीजा (Selected / Not Selected) कैसे बताऊं?',
      kw: 'interview result natija selected select nahi hua not selected email button confirm placed job mil gayi reply jawab',
      steps: [
        'जब कोई Company आपकी जानकारी लेती है, तो आपके Email पर **"आपके Interview का नतीजा बताइए — EkVeera"** नाम का Email आता है।',
        'Email खोलकर दो में से एक बटन दबाएं: **"✅ हां, Selected हुआ"** या **"❌ नहीं, Selected नहीं हुआ"**।',
        'बटन दबाते ही वेबसाइट खुलेगी और **"✅ धन्यवाद!"** दिखेगा — आपका जवाब दर्ज हो गया।'
      ],
      tips: [
        'जवाब ज़रूर दें: "Selected नहीं हुआ" बताने पर आप फिर से Companies की Search में आ जाते हैं, और नई Job के मौके मिलते हैं।',
        'Email न मिले तो Spam/Promotions folder देखें।'
      ]
    },
    {
      id: 'training-admission', cats: ['train'], icon: '🎓', pop: 1,
      title: 'Call Center Training में Admission कैसे लूं?',
      kw: 'training admission admision ad mission course seekhna padhai call center class join kaise le form bharna 12th graduate 15 din google meet',
      steps: [
        'Training page खोलें और **"अभी Admission लें"** दबाएं (या Menu → 📝 Admission Form)।',
        '**"🎓 Admission For Training"** कार्ड में **"📝 Admission फॉर्म भरें"** दबाएं। नाम, Mobile, Email, योग्यता, शहर भरें, सहमति (✔) दें और **"✅ जमा करें"** दबाएं।',
        'स्क्रीन पर आपकी **Training ID (जैसे TRA-CAND001)**, **Batch No.** और **"💳 अभी ₹99 Pay करें"** बटन दिख जाएगा — यही सब Email पर भी आता है।',
        'Fee भरने के बाद WhatsApp पर मिले **Access Code** से Student ID Card बना सकते हैं (अलग Help देखें: "Student ID Card")।'
      ],
      tips: [
        'योग्यता: 12वीं पास या Graduate। Training 15 दिन की, रोज़ 1 घंटे की Live Class (Google Meet) — मोबाइल/लैपटॉप और इंटरनेट काफ़ी है।',
        'Email न मिले तो Spam/Promotions देखें, या "ID देखें" वाले बॉक्स में अपना Mobile/Email डालें।'
      ],
      go: [{ label: '🎓 Admission फॉर्म खोलें', href: 'training.html?open=training#apply' }]
    },
    {
      id: 'training-fee', cats: ['train', 'pay'], icon: '💳', pop: 1,
      title: 'Training की ₹99 Fee कैसे भरूं?',
      kw: 'training fee fees phees paisa paise payment pay bhugtan 99 rupay razorpay upi card netbanking screenshot kaise bharu jama',
      steps: [
        'Admission Form भरने के बाद आपके Email में **₹99 Payment Link** आता है — उसे खोलकर Pay करें (UPI / Card / Netbanking)।',
        'या Training page पर **"💰 फीस"** वाले हिस्से में **"💳 Razorpay से ₹99 Pay करें"** बटन दबाएं।',
        'Payment के बाद अपना **नाम और Payment Screenshot WhatsApp (9766284669)** पर भेजें।',
        'Payment Verify होते ही आपको WhatsApp पर **Access Code (जैसे EKV-001)** मिल जाएगा — इससे आप Student ID Card बनाएंगे।'
      ],
      tips: [
        'यह Fee सिर्फ Training के लिए है। Company का Payment अलग है (Placement page पर) — Training वाला Link Company इस्तेमाल न करे।',
        'Batch शुरू होने से पहले Admission Cancel करने पर पूरा Refund मिलता है।'
      ],
      go: [{ label: '💰 Fee वाला हिस्सा (Training page)', href: 'training.html#fee' }, { label: '💬 WhatsApp पर Screenshot भेजें', wa: 'Namaste EkVeera, maine ₹99 training fee pay ki hai. Payment screenshot share kar raha hoon.' }]
    },
    {
      id: 'batch', cats: ['train'], icon: '📅', pop: 1,
      title: 'मेरा Batch कब शुरू होगा?',
      kw: 'batch kab shuru start hoga date time schedule class timing kitne baje countdown timer taareekh tarikh',
      steps: [
        'इसी Help section में नीचे **"📅 अपना Batch कब शुरू होगा?"** वाला बॉक्स देखें।',
        '**"Batch Schedule देखें"** बटन दबाएं — सभी Batch की Date/Time की List दिखेगी।',
        'अपना **Batch No.** (जो Admission Email में लिखा आया था, जैसे "Batch 1") ढूंढें और उसकी Date/Time देखें।',
        'पूरी List चाहिए तो **"⬇ Excel Download करें"** दबाएं।'
      ],
      tips: ['Home और Training page के ऊपर भी "नया Batch शुरू हो रहा है" का Countdown दिखता है।'],
      go: [{ label: '📍 Batch Schedule वाला बॉक्स', sel: '#batchScheduleTable' }]
    },
    {
      id: 'id-card', cats: ['id', 'train'], icon: '🪪', pop: 1,
      title: 'Student ID Card कैसे बनाऊं और Download करूं?',
      kw: 'id card idcard student card photo access code ekv download nahi ho raha generate banana kaise ek baar identity kard',
      steps: [
        'पहले ₹99 Fee भरें और WhatsApp पर **Access Code (जैसे EKV-001)** मिलने का इंतज़ार करें।',
        'Training page पर **"🪪 ID Card"** वाले हिस्से में जाएं।',
        '**Access Code**, **Student का नाम**, Mobile Number, Batch/Start Date भरें और **अपनी फोटो चुनें**।',
        '**"ID Card Generate करें"** दबाएं — नीचे Preview दिखेगा।',
        '**"ID Card Download करें"** दबाकर PNG के रूप में Save कर लें।'
      ],
      tips: [
        '⚠️ हर Access Code से ID Card **सिर्फ एक बार** ही Download होता है — इसलिए नाम और फोटो पहले ठीक से जांच लें।',
        'नाम वही लिखें जो Admission Form में दिया था, वरना "नाम मेल नहीं खा रहा" का संदेश आएगा।',
        'Access Code नहीं मिला तो WhatsApp पर Payment Screenshot भेजकर पूछें।'
      ],
      go: [{ label: '🪪 ID Card वाला हिस्सा (Training page)', href: 'training.html#idcard' }]
    },
    {
      id: 'certificate', cats: ['id', 'train'], icon: '🎓',
      title: 'Training Certificate कब और कैसे मिलेगा?',
      kw: 'certificate sertificate certificat pramanpatra prmaan patra training complete kab milega download pura hone ke baad 80 attendance',
      steps: [
        'Certificate के लिए **15 दिन की पूरी Training** और कम-से-कम **80% उपस्थिति** ज़रूरी है।',
        'Training पूरी होने पर EkVeera Team आपका Status **"Completed"** करती है।',
        'उसके बाद Team आपके लिए Certificate बनाकर देती है — आप **WhatsApp (9766284669)** पर अपना नाम और Training ID भेजकर पूछ सकते हैं।'
      ],
      tips: ['Certificate बनाने का Tool सिर्फ EkVeera Team के लिए है; Student को सीधे Password की ज़रूरत नहीं।'],
      go: [{ label: '💬 WhatsApp पर पूछें', wa: 'Namaste EkVeera, meri training complete ho gayi hai. Mujhe certificate chahiye.' }]
    },
    {
      id: 'id-missing', cats: ['id', 'gen'], icon: '🔎', pop: 1,
      title: 'मेरी ID Email पर नहीं आई / ID भूल गया',
      kw: 'id nahi aayi nahi mili bhool gaya bhul gayi lost missing email spam promotions check dekhna candidate id company id training id mobile se',
      steps: [
        'पहले Email का **Spam / Promotions folder** देखें — कभी-कभी वहां चला जाता है।',
        'Placement (या Training) page पर **"✅ फॉर्म भर दिया? अपनी ID यहीं तुरंत देखें"** वाला बॉक्स खोलें।',
        'फॉर्म भरते वक्त जो **Mobile Number या Email** दिया था, वही डालें।',
        '**"ID देखें"** दबाएं — आपकी ID (Candidate / Company / Training) तुरंत दिख जाएगी।'
      ],
      tips: ['"ID नहीं मिली" दिखे तो वही Mobile/Email डालें जो फॉर्म में दिया था — दूसरा नंबर काम नहीं करेगा।'],
      go: [{ label: '📍 ID देखने वाला बॉक्स', sel: '#checkIdContact' }]
    },
    {
      id: 'company-register', cats: ['comp'], icon: '🏢', pop: 1,
      title: 'Company की Requirement कैसे दें? (Company ID कैसे बनाएं)',
      kw: 'company registration register requirement candidate chahiye hire vacancy job post naukri dena comapny form bharna comp id company id banana',
      steps: [
        'Placement page पर **"📝 फॉर्म भरें"** वाले हिस्से में जाएं।',
        '**"02 🏢 Requirement Of Candidate"** कार्ड में **"📝 Requirement फॉर्म भरें"** दबाएं।',
        'Company का नाम, Contact Person, Mobile, Email, पता, शहर और **Job की जानकारी** (पद, कितने Candidate, Salary, योग्यता, अनुभव, Skills, Closing Date) भरें।',
        '**सहमति (✔)** पर टिक करके **"✅ जमा करें"** दबाएं।',
        'स्क्रीन पर आपकी **Company ID (जैसे COMP001)** दिख जाएगी और Email पर भी आएगी।',
        'उसी स्क्रीन पर **"अभी Benefits Form भरें"** बटन भी मिलेगा — Candidate को क्या-क्या मिलेगा (अलग Help देखें)।'
      ],
      tips: ['आपकी Job Candidates को Search में दिखने लगती है, पर Company की निजी जानकारी (नाम/Mobile) नहीं दिखती।'],
      go: [{ label: '📝 Requirement फॉर्म अभी खोलें', sel: '#regHost', pre: "regOpen('company')" }]
    },
    {
      id: 'search-candidate', cats: ['comp'], icon: '👥', pop: 1,
      title: 'Candidate कैसे खोजूं?',
      kw: 'candidate khojna search khoj dhundna worker employee karmchari staff hire chahiye tele caller operator sales skills city dekhna find',
      steps: [
        'Placement page पर **"🔍 खोजें"** वाले हिस्से में जाएं।',
        '**"👤 मुझे Candidate चाहिए"** बटन दबाएं।',
        'खोज-बॉक्स में लिखें, जैसे: **computer operator, tele caller, Satna** — फिर **"खोजें"** दबाएं।',
        'नतीजों में Candidate की **ID**, शहर, योग्यता, अनुभव और Skills दिखेंगे (नाम/Mobile/Email नहीं दिखते)।',
        'जो Candidate पसंद आएं उनकी **ID नोट** कर लें (जैसे CAND001, TRA-CAND004) — या "⬇ Excel Download" दबाएं।',
        'पूरी जानकारी (नाम, Mobile, Email) चाहिए तो अगला Help देखें: **"Candidate की पूरी जानकारी कैसे पाऊं"**।'
      ],
      tips: ['Search मुफ़्त है। जो Candidate पहले ही "Placed" हो चुके हैं वे नहीं दिखते।'],
      go: [{ label: '📍 Candidate खोज वाला हिस्सा', sel: '#searchCandInput', pre: "switchSearchTab('candidate')" }]
    },
    {
      id: 'unlock-details', cats: ['comp', 'pay'], icon: '🔓', pop: 1,
      title: 'Candidate की पूरी जानकारी (नाम, Mobile, Email) कैसे पाऊं?',
      kw: 'candidate ka number mobile naam email details jankari puri data download unlock payment request pay kaise mile contact hire company excel 99 29',
      steps: [
        'पहले ऊपर बताए तरीके से **Candidate खोजें** और जिन्हें चाहिए उनकी ID नोट करें।',
        'उसी Search वाले हिस्से में नीचे **"🔒 चुनी हुई ID की पूरी जानकारी चाहिए?"** बॉक्स में जाएं।',
        'भरें: **आपकी Company ID** (जैसे COMP001), **कितनी अलग-अलग Post** हैं, और **चुनी हुई IDs** (कॉमा से अलग, जैसे CAND001, TRA-CAND004)।',
        '**कुल राशि अपने-आप** दिख जाएगी: ₹99 प्रति Post + ₹29 प्रति Candidate।',
        '**"Request भेजें"** दबाएं — आपको **Request ID (जैसे PAY001)** मिलेगी और **"💳 अभी ₹… Pay करें"** बटन दिखेगा।',
        'उस बटन से Payment करें (UPI / Card / Netbanking) और फिर **इसी Page पर वापस आ जाएं**।',
        'Payment Verify होते ही नीचे **"⬇ पूरी जानकारी Excel में Download करें"** बटन अपने-आप दिख जाता है (लगभग 3 मिनट तक अपने-आप Check होता है)। उसे दबाकर Excel Download करें।'
      ],
      tips: [
        'उदाहरण: 2 Post + 20 Candidate = ₹99×2 + ₹29×20 = **₹778**।',
        'Amount **बिल्कुल उतना ही** भरें जितना दिखा — कम या ज़्यादा होने पर Download अपने-आप नहीं खुलेगा।',
        'Download के बाद उन Candidates को Interview का Email जाता है और वे किसी और की Search में नहीं आते।'
      ],
      go: [{ label: '📍 Request वाला बॉक्स', sel: '#reqCompanyId', pre: "switchSearchTab('candidate')" }]
    },
    {
      id: 'payment-status', cats: ['comp', 'pay'], icon: '⏳',
      title: 'Payment कर दिया, पर Download बटन नहीं दिख रहा',
      kw: 'payment ho gaya download nahi dikh raha button pending approve approved amount mismatch status check request id pay kar diya paisa kata excel nahi khul raha',
      steps: [
        'थोड़ा इंतज़ार करें — Payment Verify होने में कुछ मिनट लग सकते हैं।',
        '**"Payment करने के बाद यहां Status चेक करें"** वाले बॉक्स में अपनी **Company ID** और **Request ID (जैसे PAY001)** डालें।',
        '**"Status चेक करें"** दबाएं।',
        'अगर **"✅ Approved"** दिखे → नीचे आया **"⬇ पूरी जानकारी Excel में Download करें"** बटन दबाएं।',
        'अगर **"⏳ Pending"** दिखे → थोड़ी देर बाद फिर चेक करें।',
        'अगर **"Amount Mismatch"** दिखे → Payment की राशि सही राशि से कम/ज़्यादा है। संदेश में लिखी बाकी राशि भरें, या ज़्यादा भरी हो तो WhatsApp करें।'
      ],
      tips: [
        'Request ID भूल गए? Request भेजते समय जो Request ID मिली थी वही डालनी होती है — Invoice वाले बॉक्स से भी आपके सारे Request देखे जा सकते हैं।',
        'फिर भी न खुले तो Payment Screenshot + Company ID WhatsApp (9766284669) पर भेजें।'
      ],
      go: [{ label: '📍 Status चेक वाला बॉक्स', sel: '#checkCompanyId', pre: "switchSearchTab('candidate')" }, { label: '💬 WhatsApp पर बताएं', wa: 'Namaste EkVeera, maine payment kar diya hai lekin download nahi khul raha. Meri Company ID: ' }]
    },
    {
      id: 'amount', cats: ['comp', 'pay'], icon: '🧮',
      title: 'Company को कितना पैसा लगेगा? (₹99 / Post + ₹29 / Candidate)',
      kw: 'kitna paisa lagega charge fee rate price cost amount rashi kimat commission company payment kitne rupay 99 29 calculate hisab',
      steps: [
        'Search और Candidate चुनना **बिल्कुल मुफ़्त** है।',
        'पूरी जानकारी (नाम, Mobile, Email) के लिए शुल्क: **₹99 प्रति Post + ₹29 प्रति Candidate**।',
        'उदाहरण: 2 Post (Computer Operator + Office Boy) और 20 Candidate → 99 + 99 + 20 × 29 = **₹778**।',
        'आपने जो Data चुना होगा, वही आपको मिलेगा। राशि Request भेजते समय अपने-आप दिख जाती है।'
      ],
      tips: ['यह शुल्क सिर्फ उसी Company पर लागू है जो Candidate जानकारी मांग रही है।']
    },
    {
      id: 'invoice', cats: ['comp', 'pay'], icon: '🧾',
      title: 'Payment Receipt / Invoice कैसे लूं?',
      kw: 'invoice receipt raseed rasid bill payment record download company hisab tax gst',
      steps: [
        'Placement page पर **"🔍 खोजें"** हिस्से में Candidate वाले टैब के नीचे जाएं।',
        '**"🧾 अपनी Payment Receipt / Invoice चाहिए?"** बॉक्स में अपनी **Company ID** डालें।',
        '**"⬇ Invoice Download करें"** दबाएं — आपकी सारी Payment का Record Download हो जाएगा।'
      ],
      tips: ['Invoice में वही Payment दिखते हैं जो आपकी Company ID से हुए हैं।'],
      go: [{ label: '📍 Invoice वाला बॉक्स', sel: '#invoiceCompanyId', pre: "switchSearchTab('candidate')" }]
    },
    {
      id: 'benefits-form', cats: ['comp'], icon: '📋', pop: 1,
      title: 'Candidate को क्या-क्या मिलेगा (Salary, Duty Time, खाना) वाला Form कैसे भरूं?',
      kw: 'benefits form salary tankhwah vetan duty time shift khana chai nashta lunch dinner rehna room transport chutti suvidha candidate ko kya milega excel upload online hindi english',
      steps: [
        'पहले अपनी **Company ID** तैयार रखें (जैसे COMP001) — यह Requirement Form भरने पर Email में मिलती है।',
        'Placement page पर **"📋 Candidate को क्या-क्या मिलेगा — Company Benefits Form"** वाले हिस्से में जाएं। यहां तीन तरीके हैं:',
        '**तरीका 1 – Excel Download:** "📥 हिंदी Format" या "📥 English Format" दबाकर खाली Excel Download करें, भरें, फिर तरीका 3 से भेज दें।',
        '**तरीका 2 – यहीं Online भरें:** "Online Form खोलें" दबाएं → **Company की पहचान** (Company ID, नाम, Mobile) भरें → **हिंदी / English** चुनें → हर हिस्सा (Duty Time, Salary, चाय-नाश्ता-खाना, रहना, Transport…) खोलकर जानकारी भरें → **"✅ Form जमा करें"**।',
        '**तरीका 3 – भरी Excel भेजें:** "Excel Upload करें" दबाएं → Company की पहचान भरें → भरी हुई .xlsx फ़ाइल चुनें → **"⬆ Excel भेजें"**।',
        'जमा होते ही **Form No. (जैसे INFO001)** दिख जाएगा — हमें आपका Form मिल गया।'
      ],
      tips: [
        'Online Form अधूरा छोड़ दें तो वह उसी Phone/Computer में सुरक्षित रहता है, बाद में आकर पूरा कर सकते हैं।',
        'Company की पहचान में **Company ID और Mobile वही डालें जो Requirement Form में दिए थे** — नहीं तो Form नहीं जाएगा।',
        'जो बात लागू नहीं है वहां "N/A" या "लागू नहीं" चुनें।'
      ],
      go: [{ label: '📍 Benefits Form वाला हिस्सा', sel: '#companyinfo' }]
    },
    {
      id: 'refund', cats: ['train', 'pay'], icon: '↩️',
      title: 'Admission Cancel / पैसे वापस (Refund) कैसे होंगे?',
      kw: 'refund paisa wapas vapas cancel admission chhod dena money back return rokna batch cancel',
      steps: [
        '**Batch शुरू होने से पहले** Admission Cancel करने पर जमा शुल्क का **पूरा (100%) Refund** मिलता है।',
        '**Batch शुरू होने के बाद** बीच में छोड़ने पर शुल्क Refund नहीं होता (Training Material और Trainer का समय पहले ही लग चुका होता है)।',
        'अगर EkVeera की तरफ से Batch रद्द हो जाए → आपकी इच्छा से **पूरा Refund या अगले Batch में मुफ़्त प्रवेश** मिलता है।',
        'Cancel करने के लिए WhatsApp (9766284669) पर अपना नाम, Training ID और Payment की जानकारी भेजें।'
      ],
      go: [{ label: '📜 पूरी Terms & Refund Policy', href: 'training.html#terms' }, { label: '💬 WhatsApp पर बताएं', wa: 'Namaste EkVeera, mujhe apna admission cancel karna hai. Meri Training ID: ' }]
    },
    {
      id: 'job-guarantee', cats: ['cand', 'train', 'gen'], icon: '💼',
      title: 'क्या Job की गारंटी है? Training के बाद Placement कैसे होता है?',
      kw: 'job guarantee gyaranti placement training ke baad naukri milegi interview support sahayata pakki',
      steps: [
        'EkVeera **Job की गारंटी नहीं देता** — Selection आपके Interview Performance और Company की ज़रूरत पर निर्भर करता है।',
        'Training पूरी करने वालों को **Interview की तैयारी** (Mock Call, Personality Development) और उपलब्ध **Placement मौकों की जानकारी** दी जाती है।',
        'Training Candidate भी Companies की Search में दिखते हैं (नाम/Mobile छुपे रहते हैं) — Company पसंद करे तो आपको Interview का Email आता है।',
        'हम WhatsApp से लगातार संपर्क में रहते हैं।'
      ]
    },
    {
      id: 'install-app', cats: ['gen'], icon: '📲', pop: 1,
      title: 'Website को Mobile App की तरह Install कैसे करूं?',
      kw: 'app install download mobile home screen shortcut play store apk android chrome icon phone me rakhna',
      steps: [
        'Website को **Chrome (Android / Computer) या Edge** में खोलें।',
        'ऊपर Menu (☰) खोलकर **"⬇️ App Install करें"** दबाएं।',
        'जो Box आए उसमें **Install / Add** दबाएं।',
        'अब Phone की Home Screen पर **EkVeera का Icon** आ जाएगा — वहीं से App की तरह खोलें।'
      ],
      tips: ['अगर "App पहले से Install है" का संदेश आए तो Home Screen / App List में EkVeera देखें।']
    },
    {
      id: 'share', cats: ['gen'], icon: '🔗',
      title: 'Website दूसरों को Share कैसे करूं?',
      kw: 'share bhejna link dost whatsapp forward website bata',
      steps: [
        'ऊपर Menu में **"🔗 Share करें"** बटन दबाएं।',
        'WhatsApp या जिस App में भेजना हो उसे चुनें।'
      ]
    },
    {
      id: 'contact', cats: ['gen'], icon: '☎️', pop: 1,
      title: 'EkVeera Team से बात कैसे करूं? (WhatsApp / Enquiry / Office)',
      kw: 'contact sampark baat call phone number whatsapp email address office enquiry madad help sahayata dikkat problem shikayat complaint puchna',
      steps: [
        '**WhatsApp:** 9766284669 (Head Office, Maihar) — सबसे तेज़ जवाब यहीं मिलता है।',
        '**इसी Page पर Enquiry:** नीचे **"अपनी बात सीधे हमें बताइए"** में नाम, Mobile/Email और अपना सवाल लिखकर **"Enquiry भेजें"** दबाएं। Email दिया हो तो तुरंत पुष्टि का Email भी आता है।',
        '**Email:** ekveeraplacement26@gmail.com',
        '**Sub Office (Panna):** 9174777074'
      ],
      tips: ['जल्दी मदद के लिए संदेश में अपनी ID (CAND / TRA-CAND / COMP) ज़रूर लिखें।'],
      go: [{ label: '💬 WhatsApp खोलें', wa: 'Namaste EkVeera, mujhe madad chahiye.' }, { label: '📍 Enquiry Form', sel: '#enqMessage' }]
    }
  ];

  /* ------------ Search ki taiyari ------------ */
  var STOP = ('mujhe mujhko mera meri mere hai hain ho hu hun hoon kya kaise kese kaisa kahan kaha kab ko ka ki ke se me mein main karna karni karne karein kare karo kar chahiye chahie chahta chahti aur ya ye yeh wo woh ' +
    'how to do i want need my the a an is are of in on and for can where what when please pls sir madam bhai batao bataiye bataye btao mai hum ham apna apni apne liye lie ' +
    'मुझे मेरा मेरी मेरे है हैं हो हूं हूँ क्या कैसे कहां कहाँ कब को का की के से में मैं करना करनी करें करे करो कर चाहिए और या ये यह वो वह अपना अपनी अपने लिए').split(' ');
  var STOPSET = {}; STOP.forEach(function (w) { STOPSET[w] = 1; });

  // Ek jaise matlab ke shabd (Hindi / Hinglish / English)
  var GROUPS = [
    'resume rezume rezumey resumee cv biodata रिज्यूमे रेज्यूमे रिज्युमे सीवी बायोडाटा',
    'job jobs naukri naukari rojgar rozgar vacancy opening नौकरी रोजगार जॉब वैकेंसी',
    'dalna dalu dalo dalein daalna daal daalu daalo bharna bharu bharo bhare bharein upload uploading jama submit fill डालना डालूं भरना भरूं भरें अपलोड जमा सबमिट',
    'form phorm farm फॉर्म फार्म फॉरम',
    'register registration registar रजिस्टर रजिस्ट्रेशन',
    'company comapny compny firm employer कंपनी कम्पनी फर्म',
    'candidate canditate candidat worker employee karmchari उम्मीदवार कैंडिडेट कर्मचारी',
    'search khoj khojna khojen dhundna dhundhna dhoondh find खोज खोजें खोजना ढूंढ ढूंढना',
    'payment paymnt peyment pay paisa paise bhugtan fee fees phees shulk razorpay upi amount rashi rupay rupaye rupee charge price cost पेमेंट पैसा पैसे भुगतान फीस शुल्क राशि रुपये',
    'download dowload donwload utarna डाउनलोड',
    'id aid identity आईडी आइडी',
    'idcard identitycard studentcard आईडीकार्ड',
    'access code kod एक्सेस कोड',
    'certificate sertificate certificat pramanpatra सर्टिफिकेट प्रमाणपत्र',
    'batch baich बैच',
    'schedule shuru start begin tarikh taarikh date कब शुरू तारीख',
    'training trening ट्रेनिंग course kors कोर्स seekhna padhai',
    'admission admision ad एडमिशन प्रवेश',
    'invoice receipt raseed rasid bill रसीद इनवॉइस बिल',
    'install installation इंस्टॉल app application एप ऐप',
    'contact sampark whatsapp call phone helpline संपर्क व्हाट्सऐप व्हाट्सएप',
    'help madad sahayata support मदद सहायता',
    'enquiry inquiry puchna पूछना',
    'interview intervew इंटरव्यू',
    'selected select result natija natijaa सिलेक्ट रिजल्ट नतीजा',
    'refund rifund wapas vapas cancel रिफंड वापस कैंसिल',
    'lost missing bhool bhul gum nahi aayi nahi mili नहीं आई नहीं मिली भूल',
    'salary tankhwah tankhah vetan वेतन तनख्वाह सैलरी',
    'khana chai nashta lunch dinner food खाना चाय नाश्ता',
    'rehna room hostel accommodation रहना कमरा',
    'benefits suvidha suvidhaen सुविधा',
    'duty shift timing ड्यूटी शिफ्ट',
    'number mobile phone मोबाइल नंबर',
    'email mail ईमेल',
    'name naam नाम',
    'photo picture फोटो',
    'privacy private safe surakshit suraksha सुरक्षा'
  ];

  function normText(s) {
    s = String(s || '').toLowerCase();
    s = s.replace(/[\u093C]/g, '').replace(/\u0901/g, '\u0902');           // nukta hatao, chandrabindu -> bindu
    s = s.replace(/[₹]/g, ' rupay ');
    s = s.replace(/\bid[\s\-]*card\b/g, 'idcard').replace(/\bbio[\s\-]*data\b/g, 'biodata')
         .replace(/\baccess[\s\-]*code\b/g, 'access code').replace(/आईडी\s*कार्ड|आइडी\s*कार्ड/g, 'idcard');
    s = s.replace(/[^a-z0-9\u0900-\u097F\s]/g, ' ');
    return s.replace(/\s+/g, ' ').trim();
  }
  function tokens(s) {
    return normText(s).split(' ').filter(function (t) { return t && !STOPSET[t]; });
  }

  var GMAP = {};
  GROUPS.forEach(function (g, i) { tokens(g).forEach(function (w) { if (!(w in GMAP)) GMAP[w] = i; }); });

  function lev1(a, b) {                       // 1 galti tak ka fark (typo)
    if (Math.abs(a.length - b.length) > 1) return false;
    var i = 0, j = 0, diff = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++diff > 1) return false;
      if (a.length > b.length) i++; else if (a.length < b.length) j++; else { i++; j++; }
    }
    return diff + (a.length - i) + (b.length - j) <= 1;
  }

  // Har article ke liye index: title / keyword / body tokens aur unke groups
  var INDEX = ARTICLES.map(function (a) {
    var t = tokens(a.title), k = tokens(a.kw || ''), b = tokens((a.steps || []).join(' ') + ' ' + (a.tips || []).join(' '));
    function set(arr) { var o = {}; arr.forEach(function (w) { o[w] = 1; }); return o; }
    function gset(arr) { var o = {}; arr.forEach(function (w) { if (w in GMAP) o[GMAP[w]] = 1; }); return o; }
    return { a: a, t: set(t), k: set(k), b: set(b), tg: gset(t), kg: gset(k), bg: gset(b),
             all: Object.keys(set(t.concat(k, b))) };
  });
  var GDF = {};
  INDEX.forEach(function (ix) {
    var seen = {};
    [ix.tg, ix.kg, ix.bg].forEach(function (g) { Object.keys(g).forEach(function (id) { seen[id] = 1; }); });
    Object.keys(seen).forEach(function (id) { GDF[id] = (GDF[id] || 0) + 1; });
  });
  var N = ARTICLES.length;
  function idf(gid) { return Math.max(0.6, Math.log((N + 1) / ((GDF[gid] || 0) + 0.5))); }

  function scoreArticle(ix, qTokens) {
    var total = 0, hits = 0;
    qTokens.forEach(function (q) {
      var s = 0;
      if (ix.t[q]) s = Math.max(s, 7); else if (ix.k[q]) s = Math.max(s, 5); else if (ix.b[q]) s = Math.max(s, 2);
      if (q in GMAP) {
        var g = GMAP[q], w = idf(g);
        if (ix.tg[g]) s = Math.max(s, 6 * w); else if (ix.kg[g]) s = Math.max(s, 4.5 * w); else if (ix.bg[g]) s = Math.max(s, 1.8 * w);
      }
      if (!s && q.length >= 3) {                                     // adhoora shabd / typo
        for (var i = 0; i < ix.all.length; i++) {
          var w2 = ix.all[i];
          if ((w2.length >= 3 && (w2.indexOf(q) === 0 || (q.length >= 4 && q.indexOf(w2) === 0 && w2.length >= 4))) || (q.length >= 5 && lev1(q, w2))) {
            s = Math.max(s, ix.t[w2] ? 4 : ix.k[w2] ? 3 : 1.2);
          }
        }
      }
      if (s) hits++;
      total += s;
    });
    if (hits === qTokens.length && qTokens.length > 1) total *= 1.25;   // sab shabd mile
    return total;
  }

  function searchArticles(query, cat) {
    var q = tokens(query);
    var pool = INDEX.filter(function (ix) { return cat === 'all' || ix.a.cats.indexOf(cat) > -1; });
    if (!q.length) return pool.map(function (ix) { return { a: ix.a, score: 0 }; });
    var scored = pool.map(function (ix) { return { a: ix.a, score: scoreArticle(ix, q) }; })
      .filter(function (r) { return r.score > 0; })
      .sort(function (x, y) { return y.score - x.score; });
    if (!scored.length) return [];
    var top = scored[0].score;
    return scored.filter(function (r) { return r.score >= top * 0.35; }).slice(0, 6);
  }

  /* ------------ Screen ------------ */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); }

  var state = { cat: 'all', q: '', openId: '' };

  function goTo(g) {
    if (g.wa !== undefined) { window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(g.wa), '_blank', 'noopener'); return; }
    if (g.href && !/^#/.test(g.href)) { window.location.href = g.href; return; }
    try { if (g.pre) (new Function(g.pre))(); } catch (e) {}
    var el = document.querySelector(g.sel || g.href);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('hc-pulse');
    setTimeout(function () { el.classList.remove('hc-pulse'); }, 3200);
    if (el.focus && /^(INPUT|TEXTAREA)$/.test(el.tagName)) { try { el.focus({ preventScroll: true }); } catch (e) {} }
  }

  function articleHtml(a, open, query) {
    var steps = (a.steps || []).map(function (s, i) { return '<li><span class="hc-n">' + (i + 1) + '</span><div>' + md(s) + '</div></li>'; }).join('');
    var tips = (a.tips || []).length ? '<div class="hc-tips"><strong>💡 ध्यान दें</strong><ul>' + a.tips.map(function (t) { return '<li>' + md(t) + '</li>'; }).join('') + '</ul></div>' : '';
    var go = (a.go || []).map(function (g, i) { return '<button type="button" class="hc-go" data-art="' + esc(a.id) + '" data-go="' + i + '">' + esc(g.label) + '</button>'; }).join('');
    return '<details class="hc-card" data-id="' + esc(a.id) + '"' + (open ? ' open' : '') + '>' +
      '<summary><span class="hc-ic">' + a.icon + '</span><span class="hc-t">' + esc(a.title) + '</span><span class="hc-tag">' + esc(CAT_LABEL[a.cats[0]]) + '</span></summary>' +
      '<div class="hc-body"><ol class="hc-steps">' + steps + '</ol>' + tips +
      '<div class="hc-actions">' + go + '<button type="button" class="hc-copy" data-art="' + esc(a.id) + '">🔗 इस Help का Link Copy करें</button></div></div></details>';
  }

  function render() {
    var res = $('hcResults'), foot = $('hcFoot');
    var q = state.q.trim();
    var list = searchArticles(q, state.cat);
    var html = '';
    if (q && !list.length) {
      html = '<div class="hc-empty"><p>😕 "<strong>' + esc(q) + '</strong>" के लिए सीधा जवाब नहीं मिला।</p><p>दूसरे शब्दों में लिखकर देखें (जैसे: <em>resume, payment, ID, batch, certificate</em>) या नीचे से सीधे हमसे पूछें।</p></div>';
    } else {
      if (q) html += '<p class="hc-count">' + list.length + ' जवाब मिले — सबसे सही ऊपर है</p>';
      if (!q && state.cat === 'all') {
        // Bina search ke: category ke hisaab se
        CATS.slice(1).forEach(function (c) {
          var items = list.filter(function (r) { return r.a.cats[0] === c.id; });
          if (!items.length) return;
          html += '<h4 class="hc-h">' + esc(c.label) + '</h4>';
          items.forEach(function (r) { html += articleHtml(r.a, state.openId === r.a.id, q); });
        });
      } else {
        list.forEach(function (r, i) { html += articleHtml(r.a, state.openId === r.a.id || (q && list.length === 1) || (q && i === 0), q); });
      }
    }
    res.innerHTML = html;
    var pop = $('hcPop');
    pop.style.display = q ? 'none' : '';
    foot.innerHTML = '<p>जवाब नहीं मिला या कुछ समझ नहीं आया?</p><div class="hc-foot-btns">' +
      '<button type="button" class="btn btn-primary" id="hcAsk">✉️ हमें सीधे लिखें</button>' +
      '<button type="button" class="btn" id="hcWa" style="background:#25D366;color:#fff;">💬 WhatsApp पर पूछें</button></div>';
    $('hcClear').hidden = !q;
  }

  function renderCats() {
    $('hcCats').innerHTML = CATS.map(function (c) {
      return '<button type="button" class="hc-chip' + (state.cat === c.id ? ' is-on' : '') + '" data-cat="' + c.id + '">' + esc(c.label) + '</button>';
    }).join('');
  }
  function renderPop() {
    $('hcPop').innerHTML = '<span class="hc-pop-l">लोग अक्सर पूछते हैं:</span>' + ARTICLES.filter(function (a) { return a.pop; }).map(function (a) {
      return '<button type="button" class="hc-q" data-open="' + esc(a.id) + '">' + esc(a.icon + ' ' + a.title.replace(/\s*\(.*?\)/g, '').replace(/\?$/, '')) + '</button>';
    }).join('');
  }

  function init() {
    var root = $('hcRoot'); if (!root) return;
    renderCats(); renderPop(); render();

    var input = $('hcInput'), t = null;
    input.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { state.q = input.value; state.openId = ''; render(); }, 120);
    });
    $('hcClear').addEventListener('click', function () { input.value = ''; state.q = ''; state.openId = ''; render(); input.focus(); });

    root.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.cat) { state.cat = b.dataset.cat; renderCats(); render(); return; }
      if (b.dataset.open) { state.q = ''; input.value = ''; state.cat = 'all'; state.openId = b.dataset.open; renderCats(); render();
        var card = root.querySelector('details[data-id="' + b.dataset.open + '"]'); if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      if (b.classList.contains('hc-go')) {
        var art = ARTICLES.filter(function (a) { return a.id === b.dataset.art; })[0];
        if (art) goTo(art.go[parseInt(b.dataset.go, 10)]);
        return;
      }
      if (b.classList.contains('hc-copy')) {
        var url = location.origin + location.pathname + '?help=' + encodeURIComponent(b.dataset.art) + '#help';
        var done = function () { var old = b.textContent; b.textContent = '✅ Link Copy हो गया'; setTimeout(function () { b.textContent = old; }, 1800); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { window.prompt('Link Copy करें:', url); });
        else window.prompt('Link Copy करें:', url);
        return;
      }
      if (b.id === 'hcAsk') { var m = $('enqMessage'); if (m) { if (state.q && !m.value) m.value = state.q; goTo({ sel: '#enqMessage' }); } return; }
      if (b.id === 'hcWa') { goTo({ wa: 'Namaste EkVeera, mujhe madad chahiye.' + (state.q ? ' Mera sawal: ' + state.q : '') }); return; }
    });

    // Link se seedha kisi Help par aana:  placement.html?help=resume-upload   ya   ?helpq=payment
    try {
      var sp = new URLSearchParams(location.search), hid = sp.get('help'), hq = sp.get('helpq');
      if (hid && ARTICLES.some(function (a) { return a.id === hid; })) { state.openId = hid; render(); }
      else if (hq) { input.value = hq; state.q = hq; render(); }
      if (hid || hq) setTimeout(function () { var s = document.getElementById('help'); if (s) s.scrollIntoView({ behavior: 'smooth' }); }, 400);
    } catch (e) {}
  }

  // Test ke liye bahar dikhana (Browser mein koi asar nahi)
  window.__hc = { search: searchArticles, articles: ARTICLES, tokens: tokens };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
