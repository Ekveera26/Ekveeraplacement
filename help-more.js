/* EkVeera — Help Center: बाकी सारे कामों की Step-by-Step जानकारी + "ये दिक्कत आए तो क्या करें"
   (For Rent · Home Service · Ekveera Tution · Staff · Contractor · App/भाषा/Notification · Payment की दिक्कतें · Admin)
   help-center.js इसे पढ़कर अपनी सूची में जोड़ लेती है — खोज (Search) अपने-आप इन्हें भी पकड़ेगी।
   नया जवाब जोड़ना हो तो नीचे LIST में एक {…} जोड़ें। हर वाक्य B('हिंदी', 'English') में लिखें — तब Hindi/English बटन से पूरा जवाब अपनी भाषा में आएगा।
   Admin वाले जवाब सिर्फ़ तब दिखते हैं जब पेज  help.html?admin=1  से खुले। */
(function () {
  'use strict';
  var EN = window.EKV_LANG === 'en';
  function B(hi, en) { return EN ? en : hi; }
  var ADMIN = /[?&]admin=1(&|$)/.test(location.search);

  window.EKV_HELP_CATS = [
    { id: 'rent',  label: '🏍️ For Rent' },
    { id: 'hs',    label: '🏠 Home Service' },
    { id: 'tut',   label: '🎓 Tution' },
    { id: 'party', label: '🤝 Contractor' },
    { id: 'staff', label: '👤 Staff' },
    { id: 'app',   label: B('📱 App / भाषा', '📱 App / Language') },
    { id: 'prob',  label: B('🛠️ दिक्कतें', '🛠️ Problems') }
  ];
  if (ADMIN) window.EKV_HELP_CATS.push({ id: 'admin', label: '🔐 Admin' });
  window.EKV_HELP_LABELS = { rent: 'For Rent', hs: 'Home Service', tut: 'Tution', party: 'Contractor', staff: 'Staff', app: 'App', prob: B('दिक्कत', 'Problem'), admin: 'Admin' };

  var WA = 'Namaste EkVeera, mujhe madad chahiye.';
  var PAYWA = { wa: 'Namaste EkVeera, meri Payment kat gayi par ID / kaam nahi hua. Payment ID: ' };

  var LIST = [
    /* ================= FOR RENT ================= */
    {
      id: 'rent-giver', cats: ['rent'], icon: '📦', pop: 1,
      title: B('सामान किराए पर देना है — कैसे जुड़ें? (Giver)', 'I want to give items on rent — how do I join? (Giver)'),
      kw: 'rent giver for rent kiraya kiraye samaan saman bike camera tent dena dalna listing item register paisa plan 49 89 299',
      steps: [
        B('**For Rent** पेज खोलें → "📦 सामान किराए पर देना है? (Giver)" में **सामान दर्ज करें** दबाएँ।', 'Open the **For Rent** page → in "📦 Want to give items on rent? (Giver)" tap **Add your items**.'),
        B('अपना **पूरा नाम, Mobile, Email, पूरा पता** और **ज़िला / तहसील / गाँव** चुनकर भरें।', 'Fill your **full name, Mobile, Email, full address** and choose **District / Tehsil / Village**.'),
        B('"📦 आपका सामान" में सामान का प्रकार, नाम, किराया और हालत भरें। और सामान हो तो **➕ और सामान जोड़ें** दबाएँ।', 'Under "📦 Your items" fill the type, name, rent and condition. For more items tap **➕ Add more items**.'),
        B('शर्तों पर ✔ लगाएँ और **💳 सामान दर्ज करें और Pay करें** दबाएँ। Plan: 1 सामान ₹49, 2 सामान ₹89, 2 से ज़्यादा ₹299 — पूरे 1 साल के लिए।', 'Tick the terms and tap **💳 Add items and Pay**. Plan: 1 item ₹49, 2 items ₹89, more than 2 ₹299 — for a full year.'),
        B('खुले Payment पेज पर Pay करें। Payment होते ही आपकी **Giver ID और Item ID** स्क्रीन पर आ जाती हैं — Screenshot ले लें।', 'Pay on the payment page that opens. As soon as the payment is done your **Giver ID and Item ID** appear on screen — take a screenshot.')
      ],
      tips: [B('1 घंटे में Payment न करने पर आपकी Entry छुपा दी जाती है; बाद में Payment करते ही फिर दिखने लगती है।', 'If you do not pay within 1 hour your entry is hidden; it shows again as soon as you pay.'),
             B('Plan बाद में बढ़ाना हो तो सिर्फ़ फ़र्क़ की रक़म देनी होती है।', 'If you upgrade your plan later you pay only the difference.')],
      go: [{ label: B('🏍️ For Rent पेज खोलें', '🏍️ Open For Rent'), href: 'for-rent.html' }]
    },
    {
      id: 'rent-taker', cats: ['rent'], icon: '🔎', pop: 1,
      title: B('किराए पर सामान चाहिए — कैसे खोजें और लें? (Taker)', 'I need something on rent — how do I search and book? (Taker)'),
      kw: 'rent taker for rent kiraye par saman chahiye khojna search order 29 bike camera tent',
      steps: [
        B('**For Rent** पेज → "🔎 सामान खोजें (Taker)" खोलें।', 'On the **For Rent** page open "🔎 Find items (Taker)".'),
        B('अपना **ज़िला / तहसील / गाँव** और **सामान का प्रकार** चुनकर **🔎 खोजें** दबाएँ। खोज में सिर्फ़ Item ID और Location दिखती है।', 'Choose your **District / Tehsil / Village** and the **item type**, then tap **🔎 Search**. Search shows only the Item ID and location.'),
        B('जो सामान पसंद आए उस पर **Order** दबाएँ → अपना नाम, Mobile, Email भरें, शर्त पर ✔ लगाएँ → **₹29 Pay करें और Details पाएँ**।', 'Tap **Order** on the item you like → fill your name, Mobile, Email, tick the condition → **Pay ₹29 and get details**.'),
        B('Payment के बाद सामान वाले का **नाम, Mobile और Location** दिखता है। किराया उसी से सीधे तय करें।', 'After payment you see the owner\'s **name, Mobile and location**. Settle the rent directly with them.'),
        B('अपना Order बाद में देखना हो तो "मेरा Order देखें" में **Order ID + Mobile** डालें।', 'To see your order later enter **Order ID + Mobile** in "View my order".')
      ],
      tips: [B('सामान जिस हालत में लें, उसी हालत में वापस करना है। देते-लेते समय फोटो/वीडियो ज़रूर लें।', 'Return the item in the same condition you took it. Take photos/videos while handing over and taking back.')],
      go: [{ label: B('🏍️ For Rent पेज खोलें', '🏍️ Open For Rent'), href: 'for-rent.html' }]
    },
    {
      id: 'rent-open-close', cats: ['rent', 'tut'], icon: '🔁', pop: 0,
      title: B('सामान / Skill को Close या Open कैसे करें? नया सामान कैसे जोड़ें?', 'How do I Close / Open an item or skill? How do I add more?'),
      kw: 'close open band chalu listing mera saman add jodna aur samaan skill rent tution giver teacher edit',
      steps: [
        B('For Rent या Tution पेज पर "**मेरी Listing देखें**" खोलें।', 'On the For Rent or Tution page open "**View my listing**".'),
        B('अपनी **Giver ID / Teacher ID** और **Mobile** डालकर **देखें** दबाएँ।', 'Enter your **Giver ID / Teacher ID** and **Mobile** and tap **View**.'),
        B('हर सामान / Skill के आगे **Close** (अभी नहीं दे सकते) या **Open** (फिर से उपलब्ध) बटन है — दबाएँ।', 'Each item / skill has a **Close** (not available now) or **Open** (available again) button — tap it.'),
        B('नया सामान / Skill जोड़ना हो तो वहीं **➕ एक और सामान / Skill** दबाएँ। अगर Plan से ज़्यादा हो जाए तो फ़र्क़ की रक़म का Pay Link आएगा।', 'To add another item / skill tap **➕ One more** there. If it exceeds your plan you get a Pay Link for the difference.')
      ],
      tips: [B('जिसे "हाँ" कह दिया उसके बाद Entry Close करना और सामान वापस आने पर Open करना आपकी ज़िम्मेदारी है।', 'After you agree to someone, closing the entry — and opening it again when the item is back — is your responsibility.')],
      go: [{ label: B('🏍️ For Rent', '🏍️ For Rent'), href: 'for-rent.html' }, { label: '🎓 Tution', href: 'tution.html' }]
    },

    /* ================= HOME SERVICE ================= */
    {
      id: 'hs-karigar', cats: ['hs'], icon: '🛠️', pop: 1,
      title: B('कारीगर बनकर कैसे जुड़ें? (Registration + दस्तावेज़)', 'How do I join as a worker (karigar)? (Registration + documents)'),
      kw: 'home service karigar mistri electrician plumber register registration document aadhaar photo pcc police reference 49 kaam',
      steps: [
        B('**Home Service** पेज → "🛠️ आप कारीगर हैं?" → **कारीगर बनकर जुड़ें** दबाएँ।', 'On the **Home Service** page → "🛠️ Are you a worker?" → tap **Join as a worker**.'),
        B('**1. व्यक्तिगत जानकारी:** नाम, पिता/पति का नाम, जन्म तिथि (उम्र 18+), अपना असली Mobile (इसी पर Verification Call आएगी), आधार के **आख़िरी 4 अंक ही** लिखें।', '**1. Personal info:** name, father/husband name, date of birth (18+), your own real Mobile (the Verification Call comes here), and only the **last 4 digits** of Aadhaar.'),
        B('**2. पता:** राज्य → ज़िला → तहसील → शहर/गाँव चुनें।', '**2. Address:** choose State → District → Tehsil → City/Village.'),
        B('**3. काम:** मुख्य काम, अनुभव (साल), अंदाज़न मेहनताना।', '**3. Work:** main work, experience (years), approximate rate.'),
        B('**4. दस्तावेज़:** अपनी साफ़ फोटो और पहचान पत्र (आधार/वोटर ID/DL) ज़रूरी हैं। पुलिस क्लीयरेंस (PCC) हो तो Level ऊँचा मिलता है।', '**4. Documents:** a clear photo and an ID (Aadhaar/Voter ID/DL) are required. A police clearance (PCC) gives a higher level.'),
        B('**5. रेफरेंस:** 2 ऐसे लोग जो आपको और आपके काम को जानते हों (रिश्तेदार नहीं), उनके अलग-अलग Mobile।', '**5. References:** 2 people who know you and your work (not relatives), with different Mobile numbers.'),
        B('सहमति पर ✔ लगाकर **💳 रजिस्ट्रेशन भेजें और ₹49 Pay करें**। Payment के बाद टीम दस्तावेज़ जाँचकर प्रोफ़ाइल लाइव करती है।', 'Tick the consent and tap **💳 Submit and Pay ₹49**. After payment our team checks the documents and makes your profile live.')
      ],
      tips: [B('फ़ाइल / फोटो बड़ी हो तो छोटी करके डालें। गलत या नकली जानकारी पर प्रोफ़ाइल हटाई जा सकती है।', 'If a file/photo is large, reduce it first. Wrong or fake information can lead to removal of your profile.'),
             B('1 घंटे में Payment न करने पर Entry छुपा दी जाती है।', 'If you do not pay within 1 hour your entry is hidden.')],
      go: [{ label: B('🏠 Home Service खोलें', '🏠 Open Home Service'), href: 'home-service.html' }]
    },
    {
      id: 'hs-karigar-status', cats: ['hs'], icon: '✅', pop: 0,
      title: B('कारीगर: मेरी Registration कहाँ तक पहुँची? काम Open/Close कैसे करें?', 'Worker: where is my registration? How to set work Open/Close?'),
      kw: 'karigar status manzoor approve verification call profile live nahi dikh raha availability open close kaam poora',
      steps: [
        B('Home Service पेज पर "**मेरा Registration देखें**" में **Karigar ID + Mobile** डालकर **देखें** दबाएँ।', 'On Home Service open "**View my registration**", enter **Karigar ID + Mobile** and tap **View**.'),
        B('यहाँ Payment की स्थिति, मंज़ूरी (Approval) और Verification का स्तर दिखता है।', 'You see the payment status, approval and verification level here.'),
        B('Payment के बाद EkVeera Office आपके Mobile पर **Verification Call** करता है और दस्तावेज़ जाँचता है। मंज़ूर होते ही प्रोफ़ाइल ग्राहकों को दिखने लगती है।', 'After payment EkVeera Office makes a **Verification Call** to your Mobile and checks documents. Once approved your profile starts showing to customers.'),
        B('अगर आप किसी काम में व्यस्त हैं तो यहीं **Close** दबाएँ; काम पूरा होने पर **Open**।', 'If you are busy on a job tap **Close** here; tap **Open** when you are free.')
      ],
      tips: [B('प्रोफ़ाइल नहीं दिख रही? पहले Payment हुई है यह देखें, फिर 1–2 दिन Verification के लिए दें; फिर भी न दिखे तो WhatsApp करें (9766284669)।', 'Profile not showing? First check that payment is done, allow 1–2 days for verification; if still missing, WhatsApp us (9766284669).')],
      go: [{ label: B('🏠 Home Service खोलें', '🏠 Open Home Service'), href: 'home-service.html' }]
    },
    {
      id: 'hs-customer', cats: ['hs'], icon: '🔎', pop: 1,
      title: B('कारीगर चाहिए — कैसे खोजें और संपर्क पाएँ? (Customer)', 'I need a worker — how do I search and get contact? (Customer)'),
      kw: 'home service customer karigar chahiye khojna search electrician mistri plumber order 29 contact mobile',
      steps: [
        B('**Home Service** → "🔎 कारीगर खोजें (Customer)" में अपना **राज्य → ज़िला → तहसील → शहर/गाँव** और **ज़रूरत (काम)** चुनें।', 'On **Home Service** → "🔎 Find a worker (Customer)" choose your **State → District → Tehsil → City/Village** and the **work needed**.'),
        B('चाहें तो "सिर्फ़ पुलिस-वेरिफाइड कारीगर दिखाएँ" पर ✔ लगाएँ, फिर **🔎 खोजें**।', 'Optionally tick "Show only police-verified workers", then **🔎 Search**.'),
        B('खोज में सिर्फ़ कारीगर की ID और Location दिखती है। पसंद की ID पर **Order** → नाम, Mobile, Email भरें → **₹29 Pay करें और Details पाएँ**।', 'Search shows only the worker\'s ID and location. Tap **Order** on the one you like → fill name, Mobile, Email → **Pay ₹29 and get details**.'),
        B('Payment के बाद कारीगर का नाम, Mobile और Location दिखता है। मेहनताना सीधे उसी से तय करें।', 'After payment you see the worker\'s name, Mobile and location. Settle the charges with the worker directly.')
      ],
      tips: [B('घर पर आने से पहले कारीगर की ID ज़रूर जाँचें (अगला जवाब देखें)।', 'Always verify the worker\'s ID before letting them in (see the next answer).')],
      go: [{ label: B('🏠 Home Service खोलें', '🏠 Open Home Service'), href: 'home-service.html' }]
    },
    {
      id: 'hs-idcheck', cats: ['hs'], icon: '🪪', pop: 1,
      title: B('घर पर आए कारीगर की ID कैसे जाँचें? (सुरक्षा)', 'How do I verify the ID of a worker who comes to my home? (Safety)'),
      kw: 'karigar id jaanch check verify suraksha safe ghar aaya naam photo chor dhokha fake',
      steps: [
        B('कारीगर से उसकी **EkVeera ID और नाम** पूछें — घर के अंदर आने देने से **पहले**।', 'Ask the worker for his **EkVeera ID and name** — **before** letting him in.'),
        B('**Home Service** पेज पर "🔍 कारीगर की ID जाँचें" खोलें → कारीगर की ID, उसका बताया नाम और अपना Mobile डालकर **🔍 ID जाँचें**।', 'On **Home Service** open "🔍 Verify worker ID" → enter his ID, the name he gave and your Mobile → **🔍 Verify ID**.'),
        B('आपको उसकी **फोटो, नाम, इलाका, काम और Verification स्तर** दिखेगा। सामने खड़े व्यक्ति से मिलान करें।', 'You will see his **photo, name, area, work and verification level**. Match it with the person standing in front of you.'),
        B('मेल न खाए या ID न मिले तो उसे घर में न आने दें और EkVeera Office (9766284669) को तुरंत बताएँ।', 'If it does not match or the ID is not found do not let him in and inform EkVeera Office (9766284669) immediately.')
      ],
      tips: [B('हर जाँच का रिकॉर्ड EkVeera में रखा जाता है — इससे आपकी और कारीगर दोनों की सुरक्षा रहती है।', 'Every check is recorded at EkVeera — this protects both you and the worker.')],
      go: [{ label: B('🔍 ID जाँचें', '🔍 Verify an ID'), href: 'home-service.html' }]
    },

    /* ================= TUTION ================= */
    {
      id: 'tut-teacher', cats: ['tut'], icon: '🎓', pop: 1,
      title: B('कुछ सिखाना है — Teacher कैसे बनें?', 'I want to teach — how do I become a Teacher?'),
      kw: 'tution tuition teacher skill sikhana padhana nach tabla silai khana banana register plan 49 89 299',
      steps: [
        B('**Ekveera Tution** पेज → "🎓 कुछ सिखाना है? (Teacher)" → **Teacher बनें**।', 'On the **Ekveera Tution** page → "🎓 Want to teach? (Teacher)" → **Become a Teacher**.'),
        B('नाम, Mobile, Email, पता, **पढ़ाई/अनुभव का प्रमाण** और अनुभव (साल) भरें; **ज़िला / तहसील / गाँव** चुनें।', 'Fill name, Mobile, Email, address, **qualification/experience proof** and years of experience; choose **District / Tehsil / Village**.'),
        B('"🎯 आप क्या सिखाएँगे" में Skill चुनें, अपनी फ़ीस लिखें; और Skill हों तो **➕ और Skill जोड़ें**।', 'Under "🎯 What will you teach" choose a skill and write your fee; tap **➕ Add more skills** for more.'),
        B('शर्त पर ✔ लगाकर **Skill दर्ज करें और Pay करें**। Plan: 1 Skill ₹49, 2 Skill ₹89, 2 से ज़्यादा ₹299 (1 साल)।', 'Tick the terms and tap **Add skill and Pay**. Plan: 1 skill ₹49, 2 skills ₹89, more than 2 ₹299 (1 year).'),
        B('Payment के बाद **Teacher ID और Skill ID** आती है — Screenshot ले लें। नए Student न लेने हों तो "मेरी Listing" से Skill **Close** कर दें।', 'After payment you get your **Teacher ID and Skill ID** — take a screenshot. If you do not want new students, **Close** the skill from "My listing".')
      ],
      go: [{ label: '🎓 Tution', href: 'tution.html' }]
    },
    {
      id: 'tut-student', cats: ['tut'], icon: '🙋', pop: 1,
      title: B('कुछ सीखना है — Teacher कैसे खोजें? (Student)', 'I want to learn — how do I find a Teacher? (Student)'),
      kw: 'tution tuition student seekhna sikhna padhna teacher khojna search skill order 29',
      steps: [
        B('**Ekveera Tution** → "🙋 Skill खोजें (Student)" में अपना इलाका और **Skill का प्रकार** (या नाम) चुनकर **🔎 खोजें**।', 'On **Ekveera Tution** → "🙋 Find a skill (Student)" choose your area and the **skill type** (or name), then **🔎 Search**.'),
        B('पसंद की Skill पर **Order** → नाम, Mobile, Email भरें, शर्त पर ✔ → **₹29 Pay करें और Teacher की Details पाएँ**।', 'Tap **Order** on the skill you like → fill name, Mobile, Email, tick the terms → **Pay ₹29 and get Teacher\'s details**.'),
        B('Payment के बाद Teacher का नाम, Mobile और Location दिखता है। फ़ीस और समय उसी से तय करें।', 'After payment you see the Teacher\'s name, Mobile and location. Fix the fee and timing directly with the Teacher.')
      ],
      tips: [B('"Close" दिख रही Skill अभी Teacher नहीं ले रहा — दूसरी Skill/Teacher चुनें।', 'A skill that shows "Close" is not taking students now — choose another skill/teacher.')],
      go: [{ label: '🎓 Tution', href: 'tution.html' }]
    },

    /* ================= CONTRACTOR ================= */
    {
      id: 'contractor-invoice', cats: ['party'], icon: '🤝', pop: 1,
      title: B('Contractor / Party — आदमी लेने के लिए Invoice और Payment कैसे करें?', 'Contractor / Party — how to create an invoice and pay for manpower'),
      kw: 'contractor party thekedar invoice payment grade helper supervisor fitter welder rate bakaya due bill gstin',
      steps: [
        B('**Contractor** पेज (नीचे Footer में "Contractor Payment") खोलें। यह उनके लिए है जो Company नहीं हैं पर हमसे आदमी लेते हैं।', 'Open the **Contractor** page ("Contractor Payment" in the footer). It is for those who are not a Company but take manpower from us.'),
        B('Party/Contractor का नाम, प्रकार, संपर्क व्यक्ति, Mobile, Email, (हो तो GSTIN) और पता भरें।', 'Fill the Party/Contractor name, type, contact person, Mobile, Email, (GSTIN if any) and address.'),
        B('**Grade / काम** चुनें, **कितने Candidate** और **कितने दिन** काम होगा लिखें। Rate (प्रति Candidate प्रति दिन) EkVeera का तय है; **कुल = Candidate × Rate × दिन अपने-आप बनता है** — सारे Grade का जोड़ ही आपका Final Bill है। जो Grade सूची में नहीं, उसके लिए "अन्य (Other)" चुनें।', 'Choose **Grade / work**, then enter **how many candidates** and **how many days** they will work. The rate (per candidate per day) is fixed by EkVeera and the **total = Candidates × Rate × Days is calculated automatically** — the sum of all grades is your final bill. For a grade not in the list choose "Other".'),
        B('शर्तों पर ✔ लगाकर **💳 Invoice बनाएँ और Payment करें**। Payment होते ही Invoice "Paid" हो जाता है और Word में Download कर सकते हैं।', 'Tick the terms and tap **💳 Create invoice and Pay**. The invoice becomes "Paid" as soon as you pay and you can download it as Word.'),
        B('बाद में बकाया / Invoice देखना हो तो "मेरा बकाया / Invoice Download" में **Party ID + Mobile** डालें।', 'To see dues / invoices later enter **Party ID + Mobile** in "My dues / Invoice download".')
      ],
      tips: [B('Party ID और Due ID का Screenshot संभालकर रखें।', 'Keep a screenshot of the Party ID and Due ID.'), B('Payment की रकम Invoice पर लिखी रकम के **ठीक बराबर** दें — कम/ज़्यादा Payment मान्य नहीं होती।', 'Pay **exactly** the amount written on the invoice — a lower or higher payment is not valid.')],
      go: [{ label: B('🤝 Contractor पेज', '🤝 Contractor page'), href: 'contractor.html' }]
    },

    /* ================= STAFF ================= */
    {
      id: 'staff-profile-create', cats: ['staff'], icon: '👤', pop: 0,
      title: B('Staff: अपनी Profile और ID Card कैसे बनाएँ?', 'Staff: how to create my Profile and ID Card'),
      kw: 'staff profile id card banana create commission documents approve staff id',
      steps: [
        B('**Staff Profile** पेज खोलें → "📝 अपनी Profile बनाएँ"।', 'Open the **Staff Profile** page → "📝 Create your Profile".'),
        B('EkVeera Office से मिली **Staff ID**, नाम, अपना Mobile, **Recovery Mobile** (घर के किसी भरोसेमंद का, अलग नंबर), Email, जन्म तारीख, पता, शहर, ID Proof के आख़िरी 4 अंक और **नया Password** (कम-से-कम 6) भरें।', 'Fill the **Staff ID** from EkVeera Office, name, your Mobile, **Recovery Mobile** (a trusted family member, different number), Email, date of birth, address, city, last 4 digits of ID proof and a **new Password** (min 6).'),
        B('**✅ Profile बनाएँ** दबाएँ, फिर Documents भेजें। Admin Approve करे तभी आप EkVeera के Staff माने जाते हैं और ID Card मिलता है।', 'Tap **✅ Create Profile**, then send your documents. You count as EkVeera Staff only after Admin approves, and then you get the ID Card.')
      ],
      tips: [B('"Staff ID List में नहीं है" आए तो Admin से कहें कि आपकी ID Admin Panel के "🔗 Staff का Link बनाएँ" से जोड़ दें।', 'If it says "Staff ID is not in the list" ask the Admin to add your ID via "🔗 Create Staff link" in the Admin Panel.')],
      go: [{ label: '👤 Staff Profile', href: 'staff-profile.html' }]
    },
    {
      id: 'staff-login-problem', cats: ['staff', 'prob'], icon: '🔑', pop: 0,
      title: B('Staff: Password भूल गए या Mobile खो गया / बदल गया', 'Staff: forgot password or lost / changed Mobile'),
      kw: 'staff password bhool login nahi khul raha mobile kho gaya badal recovery request approve 48 ghante',
      steps: [
        B('**Staff Profile** पेज → "📱 Mobile खो गया / बदला · 🔑 Password भूल गए" खोलें।', 'On the **Staff Profile** page open "📱 Lost / changed Mobile · 🔑 Forgot Password".'),
        B('Staff ID, Profile में दिया **पुराना Mobile**, जन्म तारीख और **Recovery Mobile** डालें; कारण चुनें → **📨 Admin से मंज़ूरी माँगें**।', 'Enter Staff ID, the **old Mobile** in your profile, date of birth and **Recovery Mobile**; choose the reason → **📨 Ask Admin for approval**.'),
        B('Admin आपको फोन करके पक्का करेंगे और मंज़ूरी देंगे (मंज़ूरी 48 घंटे चलती है, एक बार की)।', 'Admin will call you to confirm and then approve (valid for 48 hours, one time).'),
        B('**🔄 स्थिति देखें** दबाएँ → मंज़ूरी मिलने पर **नया Password** लगाकर Profile खोलें।', 'Tap **🔄 Check status** → once approved set a **new Password** and open your profile.')
      ],
      go: [{ label: '👤 Staff Profile', href: 'staff-profile.html' }]
    },
    {
      id: 'staff-verify-complaint', cats: ['staff'], icon: '🚨', pop: 0,
      title: B('कोई खुद को EkVeera का Staff बताए — असली है या नहीं? शिकायत कैसे करें?', 'Someone claims to be EkVeera Staff — real or not? How to complain?'),
      kw: 'staff asli nakli fake verify shikayat complaint paise maange badtameezi',
      steps: [
        B('**Staff Profile** पेज → "✅ क्या यह Staff असली है? जाँचें" में उसके ID Card की **Staff ID और Card Code** डालकर **जाँचें**।', 'On the **Staff Profile** page → "✅ Is this Staff real?" enter the **Staff ID and Card Code** from his ID card and tap **Check**.'),
        B('असली हो तो नाम का पहला हिस्सा और पद दिखता है; न मिले तो उससे कोई पैसा या जानकारी न दें।', 'If real you see the first name and position; if not found give him no money or information.'),
        B('शिकायत के लिए "🚨 Staff की शिकायत करें" में बताएँ कि क्या हुआ। यह सिर्फ़ Admin को दिखती है।', 'To complain use "🚨 Complain about Staff" and describe what happened. Only Admin can see it.')
      ],
      go: [{ label: '👤 Staff Profile', href: 'staff-profile.html#verify' }]
    },

    /* ================= APP / BHASHA / NOTIFICATION ================= */
    {
      id: 'language', cats: ['app'], icon: '🌐', pop: 1,
      title: B('भाषा बदलना — Hindi / English', 'Change language — Hindi / English'),
      kw: 'language bhasha hindi english angrezi change badalna lang translate',
      steps: [
        B('हर पेज के ऊपर (Header में) **हिं | EN** बटन हैं।', 'At the top of every page (in the header) there are **हिं | EN** buttons.'),
        B('**EN** दबाएँ तो पूरी वेबसाइट — बटन, फॉर्म, संदेश, Help — English में हो जाती है; **हिं** दबाएँ तो वापस Hindi में।', 'Tap **EN** and the whole website — buttons, forms, messages, Help — turns English; tap **हिं** to return to Hindi.'),
        B('भाषा बदलते ही पेज एक बार अपने-आप दोबारा खुलता है — यह सामान्य है। आपकी चुनी भाषा हर पेज पर याद रहती है।', 'The page reloads once when you change the language — that is normal. Your choice is remembered on every page.')
      ],
      tips: [B('कहीं कोई हिस्सा दूसरी भाषा में दिखे तो उसका Screenshot WhatsApp (9766284669) पर भेजें, हम ठीक कर देंगे।', 'If any part shows in the wrong language send a screenshot to WhatsApp (9766284669) and we will fix it.')]
    },
    {
      id: 'register-notify', cats: ['app'], icon: '🔔', pop: 1,
      title: B('Register और Notification — नया Batch / Job की सूचना कैसे पाएँ?', 'Register & Notifications — how to get updates on new batches / jobs'),
      kw: 'register notification suchna sandesh jaankari batch job alert bell push chalu on',
      steps: [
        B('**Register** पेज खोलें (नीचे Footer में "Register" लिंक) → अपना **नाम और Mobile** लिखें।', 'Open the **Register** page ("Register" link in the footer) → enter your **name and Mobile**.'),
        B('जिन सेवाओं की जानकारी चाहिए (Training / Placement / For Rent / Home Service / Tution) उन पर ✔ लगाएँ और सहमति देकर **✅ Register करें**।', 'Tick the services you want updates for (Training / Placement / For Rent / Home Service / Tution), agree and tap **✅ Register**.'),
        B('फिर **🔔 अभी Notification चालू करें** दबाएँ और फोन का "Allow" दें (वही Mobile Number डालें जिससे Register हुए)।', 'Then tap **🔔 Turn on Notifications now** and tap "Allow" on your phone (use the same Mobile Number you registered with).'),
        B('बदलाव करना हो तो उसी पेज पर दोबारा भरें।', 'To change anything fill the same page again.')
      ],
      tips: [B('Notification न आए तो फोन की Settings में इस App/Browser के Notification चालू हैं या नहीं देखें; iPhone पर पहले App को Home Screen पर Install करना पड़ता है।', 'If notifications do not arrive check that notifications are allowed for this app/browser in phone settings; on iPhone you must first install the app to the Home Screen.')],
      go: [{ label: B('📝 Register पेज', '📝 Register page'), href: 'register.html' }]
    },
    {
      id: 'review-write', cats: ['app'], icon: '⭐', pop: 0,
      title: B('Review / Rating कैसे लिखें?', 'How do I write a Review / Rating?'),
      kw: 'review rating feedback anubhav likhna star comment',
      steps: [
        B('**Home** पेज पर नीचे "⭐ अपना Review यहाँ लिखें" तक जाएँ (Review सिर्फ़ यहीं लिखे जाते हैं)।', 'Scroll down on the **Home** page to "⭐ Write your Review here" (reviews are written only there).'),
        B('Stars चुनें, अपनी **ID** (Candidate / Company / Giver / Taker / कारीगर / ग्राहक / Teacher / Student / Staff) और फॉर्म में दिया **Mobile** डालें।', 'Choose the stars and enter your **ID** (Candidate / Company / Giver / Taker / Worker / Customer / Teacher / Student / Staff) and the **Mobile** you gave in the form.'),
        B('अनुभव लिखें (कम-से-कम 10 अक्षर; Link, Phone Number या गाली नहीं) → **⭐ Review भेजें**।', 'Write your experience (at least 10 characters; no links, phone numbers or abuse) → **⭐ Send Review**.'),
        B('Admin जाँचकर Approve करता है, तभी Review अपनी सेवा के पेज (Training / Placement / For Rent / Home Service / Tution) पर दिखता है।', 'The Admin checks and approves; only then the review shows on its service page (Training / Placement / For Rent / Home Service / Tution).')
      ],
      tips: [B('सिर्फ़ आपका पहला नाम दिखता है; ID, Mobile, Email कभी नहीं।', 'Only your first name shows; your ID, Mobile and Email never do.')],
      go: [{ label: B('⭐ Review लिखें', '⭐ Write a review'), href: 'index.html#reviews' }]
    },
    {
      id: 'my-ids', cats: ['app', 'prob'], icon: '🆔', pop: 1,
      title: B('मेरी ID भूल गया — For Rent / Home Service / Tution की ID कहाँ देखूँ?', 'I forgot my ID — where do I see my For Rent / Home Service / Tution ID?'),
      kw: 'id bhool gaya kho gayi giver karigar teacher order id dekhna mobile email',
      steps: [
        B('उस सेवा का पेज खोलें (For Rent / Home Service / Tution)।', 'Open that service page (For Rent / Home Service / Tution).'),
        B('"**अपनी ID यहीं तुरंत देखें**" में Register करते समय दिया **Mobile Number** (या Email) डालकर **ID देखें** दबाएँ।', 'In "**See your ID right here**" enter the **Mobile Number** (or Email) you registered with and tap **See ID**.'),
        B('आपकी सारी ID (Giver / Karigar / Teacher ID, Item / Skill ID, Order ID) वहीं दिख जाएँगी।', 'All your IDs (Giver / Worker / Teacher ID, Item / Skill ID, Order ID) appear there.'),
        B('Candidate / Training / Company की ID के लिए Placement पेज का "ID नहीं मिली" वाला जवाब देखें।', 'For Candidate / Training / Company IDs see the "ID not found" answer for the Placement page.')
      ],
      go: [{ label: '🏍️ For Rent', href: 'for-rent.html' }, { label: '🏠 Home Service', href: 'home-service.html' }, { label: '🎓 Tution', href: 'tution.html' }]
    },

    /* ================= DIKKATEN (PROBLEMS) ================= */
    {
      id: 'pay-exact-amount', cats: ['prob', 'app'], icon: '💰', pop: 1,
      title: B('Payment कितनी करें? (कम या ज़्यादा करने पर क्या होगा)', 'How much should I pay? (what happens if I pay less or more)'),
      kw: 'payment amount rakam kam jyada zyada exact barabar utni hi galat amount invalid dobara payment',
      steps: [
        B('Payment करने से पहले अपनी Payment Screen / Pay बटन पर लिखी **रकम ध्यान से देखें**।', 'Before paying, look carefully at the **amount** shown on your payment screen / Pay button.'),
        B('**ठीक उतनी ही रकम** दें — न कम, न ज़्यादा। Plan बदलने पर (जैसे ₹49 → ₹89) सिर्फ़ वही रकम दें जो स्क्रीन पर दिख रही हो।', 'Pay **exactly that amount** — not less, not more. When you upgrade a plan (e.g. ₹49 → ₹89) pay only the amount shown on the screen.'),
        B('Payment सिर्फ़ इसी वेबसाइट के **Pay बटन / Link** से करें, किसी और Link या नंबर पर नहीं।', 'Pay only through the **Pay button / link** on this website — not any other link or number.'),
        B('अगर रकम कम या ज़्यादा चली गई: जिस काम के लिए Payment की थी वह **नहीं होगा** और Payment **मान्य नहीं** मानी जाएगी। दोबारा सही रकम की Payment करें, या **EkVeera Office (9766284669)** से संपर्क करके Payment ID बताएँ।', 'If a lower or higher amount went through: the work you paid for **will not be done** and the payment will be **treated as invalid**. Pay the correct amount again, or **contact the EkVeera Office (9766284669)** with your Payment ID.')
      ],
      go: [{ label: B('💬 WhatsApp पर बताएँ', '💬 Tell us on WhatsApp'), wa: B('Namaste EkVeera, meri Payment ki rakam galat chali gayi. Payment ID: ', 'Namaste EkVeera, I paid a wrong amount. Payment ID: ') }]
    },
    {
      id: 'remove-my-details', cats: ['app', 'prob'], icon: '🗑️', pop: 1,
      title: B('अपनी Details / Resume / Listing कैसे हटवाएँ?', 'How do I get my details / resume / listing removed?'),
      kw: 'details hatana delete remove data privacy resume listing band account mita hatwana',
      steps: [
        B('**WhatsApp 9766284669** (Head Office) / **9174777074** (Sub Office) पर या **ekveeraplacement26@gmail.com** पर लिखें कि आप अपनी Details हटवाना चाहते हैं।', 'Write on **WhatsApp 9766284669** (Head Office) / **9174777074** (Sub Office) or email **ekveeraplacement26@gmail.com** that you want your details removed.'),
        B('अपनी **ID (जैसे CAND001, GIV001, KAR001) और Registered Mobile** बताएँ — ताकि कोई और आपकी Details न हटवा सके।', 'Give your **ID (e.g. CAND001, GIV001, KAR001) and registered mobile** so nobody else can get your details deleted.'),
        B('पहचान की पुष्टि के बाद हम आम तौर पर 7 कार्य-दिवस में Details हटाकर आपको बता देते हैं। यह **मुफ़्त** है।', 'After verifying your identity we usually delete your details within 7 working days and confirm it to you. It is **free**.')
      ],
      tips: [B('क़ानून / हिसाब के लिए ज़रूरी Payment-Invoice के रिकॉर्ड हटाए नहीं जा सकते। पूरी जानकारी Privacy Policy में है।', 'Payment / invoice records needed for legal or accounting reasons cannot be deleted. Full details are in the Privacy Policy.')],
      go: [{ label: B('📄 Privacy Policy', '📄 Privacy Policy'), href: 'privacy.html' }, { label: B('💬 WhatsApp पर बताएँ', '💬 Tell us on WhatsApp'), wa: B('Namaste EkVeera, main apni Details hatwana chahta/chahti hoon. Meri ID: ', 'Namaste EkVeera, I want my details removed. My ID: ') }]
    },
    {
      id: 'pay-cut-no-id', cats: ['prob'], icon: '💳', pop: 1,
      title: B('Payment कट गई पर ID / काम नहीं मिला, या दो बार कट गई', 'Payment deducted but no ID / nothing happened, or deducted twice'),
      kw: 'payment kat gayi paisa kata id nahi mili do baar double refund wapas razorpay pending',
      steps: [
        B('घबराएँ नहीं — पहले 5–10 मिनट रुकें और पेज **Refresh** करें; कई बार Payment की पुष्टि में थोड़ा समय लगता है।', 'Do not panic — wait 5–10 minutes and **refresh** the page; confirmation sometimes takes a little time.'),
        B('अपनी सेवा के पेज पर "अपनी ID यहीं तुरंत देखें" में Mobile डालकर देखें कि ID आ चुकी है या नहीं।', 'On your service page check "See your ID right here" with your Mobile to see whether the ID has arrived.'),
        B('अपने Bank / UPI App में **Payment ID** (Razorpay / UTR / Transaction ID) का Screenshot लें।', 'Take a screenshot of the **Payment ID** (Razorpay / UTR / Transaction ID) from your Bank / UPI app.'),
        B('**7 दिन के अंदर** वह Payment ID + अपना नाम और Mobile **WhatsApp (9766284669)** पर भेजें। जाँच के बाद ID दी जाएगी या पैसा वापस होगा।', 'Within **7 days** send that Payment ID + your name and Mobile on **WhatsApp (9766284669)**. After checking we will issue the ID or refund the money.')
      ],
      tips: [B('जानकारी दे दिए जाने के बाद फ़ीस वापस नहीं होती; पर एक ही Payment दो बार कटे या ID न मिले तो वापसी होती है।', 'Fees are not refunded after information is given; but a double deduction or a missing ID is refunded.')],
      go: [{ label: B('💬 WhatsApp पर बताएँ', '💬 Tell us on WhatsApp'), wa: B('Namaste EkVeera, meri Payment kat gayi par ID / kaam nahi hua. Payment ID: ', 'Namaste EkVeera, my payment was deducted but I did not get the ID / work done. Payment ID: ') }]
    },
    {
      id: 'entry-hidden', cats: ['prob'], icon: '⏰', pop: 0,
      title: B('मेरी Entry / सामान / प्रोफ़ाइल खोज में नहीं दिख रही', 'My entry / item / profile is not showing in search'),
      kw: 'entry hide chhup gayi nahi dikh rahi listing search payment 1 ghanta approve band close',
      steps: [
        B('सबसे आम कारण: **1 घंटे में Payment नहीं हुई** — तब Entry छुप जाती है। Payment करते ही फिर दिखने लगती है।', 'Most common reason: **payment was not made within 1 hour** — the entry gets hidden. It shows again as soon as you pay.'),
        B('दूसरा कारण: आपने ही सामान / Skill / काम को **Close** किया हुआ है — "मेरी Listing" / "मेरा Registration देखें" में **Open** दबाएँ।', 'Second reason: you have set the item / skill / work to **Close** — press **Open** in "My listing" / "View my registration".'),
        B('Home Service में Payment के बाद **Verification और Admin की मंज़ूरी** भी चाहिए — 1–2 दिन दें।', 'In Home Service, after payment you also need **verification and Admin approval** — allow 1–2 days.'),
        B('1 साल पूरा हो गया हो तो दोबारा Register करना होगा।', 'If the 1-year period has ended you need to register again.'),
        B('फिर भी समस्या हो तो अपनी ID के साथ WhatsApp करें (9766284669)।', 'If still stuck WhatsApp us with your ID (9766284669).')
      ],
      go: [{ label: B('💬 WhatsApp खोलें', '💬 Open WhatsApp'), wa: WA }]
    },
    {
      id: 'server-error', cats: ['prob'], icon: '📶', pop: 1,
      title: B('"Server से जवाब नहीं मिला" / "Internet की दिक्कत" / पेज नहीं खुल रहा', '"No response from server" / "Internet problem" / page not loading'),
      kw: 'server error jawab nahi mila internet connection fail slow page nahi khul raha load nahi ho raha loading atka',
      steps: [
        B('अपना **Internet** (Mobile Data / Wi-Fi) चालू है या नहीं देखें; कमज़ोर Network हो तो पास की जगह जाएँ।', 'Check that your **Internet** (Mobile Data / Wi-Fi) is on; move to a better-signal place if it is weak.'),
        B('पेज **Refresh** करें (नीचे खींचें) और 1–2 मिनट बाद फिर कोशिश करें — Server कभी-कभी व्यस्त होता है।', '**Refresh** the page (pull down) and try again after 1–2 minutes — the server is sometimes busy.'),
        B('**ज़रूरी:** Form भरने / Payment के बाद यह संदेश आए तो **दोबारा Submit न करें** — हो सकता है काम हो चुका हो। पहले "अपनी ID यहीं तुरंत देखें" या अपना Email / WhatsApp देखें।', '**Important:** if this appears after submitting a form / payment, **do not submit again** — it may already be done. First check "See your ID right here" or your Email / WhatsApp.'),
        B('अगर App पुराना हो गया है तो Browser का Cache साफ़ करें या App बंद करके दोबारा खोलें (नया Update आने पर App पूछता है — "Update" दबाएँ)।', 'If the app is outdated clear the browser cache or close and reopen the app (when a new update comes the app asks — tap "Update").'),
        B('फिर भी न चले तो Screenshot के साथ WhatsApp करें (9766284669)।', 'If it still does not work WhatsApp us with a screenshot (9766284669).')
      ],
      go: [{ label: B('💬 WhatsApp खोलें', '💬 Open WhatsApp'), wa: WA }]
    },
    {
      id: 'location-list', cats: ['prob'], icon: '📍', pop: 0,
      title: B('ज़िला / तहसील / गाँव की सूची नहीं आ रही', 'District / Tehsil / Village list is not loading'),
      kw: 'zila jila tehsil gaon gav city shahar list dropdown nahi aa raha khali location mp madhya pradesh',
      steps: [
        B('पहले Internet जाँचें और पेज **Refresh** करें — सूची पहली बार थोड़ी देर में आती है।', 'First check your Internet and **refresh** the page — the list takes a moment the first time.'),
        B('क्रम से चुनें: पहले **ज़िला**, फिर **तहसील**, फिर **शहर / गाँव** — अगला डिब्बा पिछला चुनने पर ही भरता है।', 'Choose in order: first **District**, then **Tehsil**, then **City / Village** — the next box fills only after the previous one.'),
        B('आपका गाँव सूची में न हो तो **"अन्य (Other) — खुद लिखें"** चुनकर अपना गाँव / इलाका लिख दें।', 'If your village is not in the list choose **"Other — write yourself"** and type your village / area.'),
        B('अभी सेवा सिर्फ़ **मध्य प्रदेश** के लिए है। अगर लाल चेतावनी दिखे कि "सूची लोड नहीं हुई", तो WhatsApp पर बताएँ — Admin वेबसाइट की data/MP.json फ़ाइल जाँचेंगे।', 'The service is for **Madhya Pradesh** only for now. If a red warning says "list did not load", tell us on WhatsApp — the Admin will check the website\'s data/MP.json file.')
      ],
      go: [{ label: B('💬 WhatsApp खोलें', '💬 Open WhatsApp'), wa: WA }]
    },
    {
      id: 'install-update', cats: ['app', 'prob'], icon: '🔄', pop: 0,
      title: B('App में नया बदलाव / नया Version नहीं दिख रहा (Update कैसे करें)', 'New changes / new version not showing (how to update)'),
      kw: 'update version purana naya badlav app refresh cache nahi dikh raha v17 v18',
      steps: [
        B('पेज के सबसे नीचे "**Version vXX**" लिखा होता है — इससे पता चलता है आप कौन सा Version देख रहे हैं।', 'At the very bottom of the page it says "**Version vXX**" — that tells which version you are viewing.'),
        B('नया Version आने पर App खुद पूछता है — **Update** दबाएँ।', 'When a new version is available the app asks you — tap **Update**.'),
        B('न पूछे तो App पूरी तरह बंद करके दोबारा खोलें, या Browser में पेज को 2 बार **Refresh** करें।', 'If it does not ask close the app completely and open it again, or **refresh** the page twice in the browser.'),
        B('फिर भी पुराना दिखे तो Browser Settings → Site data / Cache साफ़ करें।', 'If it still looks old clear Site data / Cache in browser settings.')
      ]
    },

    /* ================= ADMIN (सिर्फ़ ?admin=1) ================= */
    {
      id: 'admin-login', cats: ['admin'], icon: '🔐', admin: 1,
      title: B('Admin: Login नहीं हो रहा / "गलत Password" / लॉक', 'Admin: cannot log in / "Wrong Password" / locked'),
      kw: 'admin login password galat lock wrong setpasswords testpassword',
      steps: [
        B('Admin Panel सिर्फ़ **placement.html?admin=1** से खुलता है। वहाँ वही Password चलता है जो Apps Script के **ADMIN_UNLOCK_PASSWORD** में है।', 'The Admin Panel opens only via **placement.html?admin=1**. The password there is the one set in Apps Script **ADMIN_UNLOCK_PASSWORD**.'),
        B('Password में आगे-पीछे Space न हो; Mobile Keyboard / Copy-Paste से जुड़े छुपे अक्षर अब अपने-आप हटा दिए जाते हैं।', 'No spaces before/after; hidden characters from mobile keyboards / copy-paste are now removed automatically.'),
        B('कई गलत कोशिशों पर कुछ देर के लिए लॉक हो जाता है — संदेश में बचे मिनट लिखे होते हैं, इंतज़ार करें।', 'After several wrong attempts it locks for a while — the message shows the minutes left; wait.'),
        B('Password याद न हो तो Apps Script में **testPassword** चलाकर देखें और ज़रूरत हो तो **setPasswords** से नया लगाएँ; फिर **Deploy → Manage deployments → ✏️ → New version → Deploy**।', 'If you do not remember it run **testPassword** in Apps Script and, if needed, set a new one with **setPasswords**; then **Deploy → Manage deployments → ✏️ → New version → Deploy**.')
      ]
    },
    {
      id: 'admin-review-reply', cats: ['admin'], icon: '💬', admin: 1,
      title: B('Admin: Review / Rating पर EkVeera का जवाब कैसे दें?', 'Admin: how to reply to a Review / Rating as EkVeera'),
      kw: 'admin review reply jawab rating trust bharosa approve',
      steps: [
        B('Admin Panel खोलकर **Reviews** वाला हिस्सा देखें (Placement पेज पर Admin Panel में)।', 'Open the Admin Panel and go to the **Reviews** section (in the Admin Panel on the Placement page).'),
        B('जिस Review का जवाब देना है उसके नीचे **💬 EkVeera का जवाब दें** दबाएँ — जवाब का Box खुलेगा।', 'Under the review you want to answer, tap **💬 Reply as EkVeera** — a reply box opens.'),
        B('जवाब लिखें (300 अक्षर तक) → **✅ जवाब सेव करें**। जवाब उसी Review के ठीक नीचे **"EkVeera का जवाब ✔ आधिकारिक"** के हरे Box में सबको दिखता है।', 'Write the reply (up to 300 characters) → **✅ Save reply**. It shows to everyone right under that review in a green **"EkVeera reply ✔ Official"** box.'),
        B('जवाब बदलना हो तो **जवाब बदलें** दबाएँ; Box खाली करके सेव करने पर जवाब हट जाता है।', 'To change it tap **Change reply**; saving an empty box removes the reply.')
      ],
      tips: [B('जवाब तभी सबको दिखेगा जब Review **Approve** हो चुका हो।', 'The reply is shown publicly only once the review is **Approved**.')]
    },
    {
      id: 'admin-party', cats: ['admin'], icon: '🤝', admin: 1,
      title: B('Admin: नई Party / Contractor कैसे बनाएँ और कैसे पता चले कि बन गई?', 'Admin: how to create a new Party / Contractor and confirm it was created'),
      kw: 'admin party banana contractor naya agreement ptNew bakaya invoice',
      steps: [
        B('Admin Panel → "🤝 Party / Contractor — बकाया और Invoice" → **➕ नई Party**।', 'Admin Panel → "🤝 Party / Contractor — dues and Invoice" → **➕ New Party**.'),
        B('Party का नाम, प्रकार, संपर्क, Mobile भरें; हर तरह के आदमी की Line में **काम, Rate (प्रति आदमी प्रति दिन), कितने आदमी और कितने दिन** लिखें (एक बार / हर महीने का बिल चुनें)।', 'Fill Party name, type, contact, Mobile; in each line enter **work, rate, number of people** (choose one-time / monthly billing).'),
        B('**💾 Party बनाएँ** दबाएँ। बन जाने पर ऊपर एक **बड़ा हरा Box "नई Party बन गई!"** आता है जिसमें **Party ID (PTY…)** लिखा होता है और नीचे सूची अपने-आप भर जाती है।', 'Tap **💾 Create Party**. When it is created a **big green box "New Party created!"** appears with the **Party ID (PTY…)** and the list below refreshes.'),
        B('**लाल Box** आए तो वही कारण लिखा होता है (जैसे "गलत Password" → Logout करके दोबारा Login; "इस नाम की Party पहले से है")। **पीला/लाल "जवाब नहीं मिला"** आए तो **दोबारा न दबाएँ** — पहले "📋 बकाया सूची" देखें, ज़्यादातर Party बन चुकी होती है।', 'A **red box** gives the exact reason (e.g. "Wrong Password" → log out and log in again; "A party with this name already exists"). If a **yellow/red "no response"** box appears **do not press again** — first check "📋 Dues list"; usually the party is already created.')
      ]
    },
    {
      id: 'admin-dashboard', cats: ['admin'], icon: '📊', admin: 1,
      title: B('Admin: Dashboard में क्या-क्या दिखता है?', 'Admin: what does the Dashboard show?'),
      kw: 'admin dashboard hisaab ginti kamai income register rent home service tution',
      steps: [
        B('Admin Panel → "📊 Dashboard" → तारीख चुनकर **देखें / Refresh करें**।', 'Admin Panel → "📊 Dashboard" → choose a date and tap **View / Refresh**.'),
        B('ऊपर **Company, Candidate, Payment** का हिसाब है; उसके नीचे **कुल कमाई, Register, For Rent, Home Service, Ekveera Tution** — हर सेवा में कितने लोग Register हुए, कितनों ने Payment की और कितनी कमाई हुई (उस दिन की + अब तक की)।', 'On top are **Company, Candidate, Payment**; below are **total income, Register, For Rent, Home Service, Ekveera Tution** — how many people registered, how many paid and how much was earned in each (that day + overall).'),
        B('अगर नीचे पीला संदेश आए कि सिर्फ़ "आज" का हिसाब है, तो Apps Script में नई **EkVeera_AdminExtra** फ़ाइल डालकर **Deploy → New version** करें।', 'If a yellow note says only "today" is shown, paste the new **EkVeera_AdminExtra** file in Apps Script and do **Deploy → New version**.')
      ]
    },
    {
      id: 'admin-staff-link', cats: ['admin'], icon: '🔗', admin: 1,
      title: B('Admin: Staff का Link कैसे बनाएँ (Advertisement के लिए)?', 'Admin: how to create a Staff link (for advertising)'),
      kw: 'admin staff link referral banana advertisement anak pankaj staff list under team leader',
      steps: [
        B('Admin Panel → "🔗 Staff का Link बनाएँ" खोलें।', 'Admin Panel → open "🔗 Create Staff link".'),
        B('**Staff का नाम** लिखें। Staff ID खाली छोड़ें तो अपने-आप बनती है (जैसे Anak-01, फिर Anak-02); चाहें तो खुद लिखें।', 'Enter the **Staff name**. Leave Staff ID blank to auto-create (e.g. Anak-01, then Anak-02) or type your own.'),
        B('अगर यह Staff किसी Team Leader के under है तो सूची से उसे चुनें, नहीं तो "सीधा Admin" रहने दें।', 'If this Staff works under a Team Leader choose him from the list, otherwise keep "Directly under Admin".'),
        B('**🔗 Link बनाएँ** दबाएँ → **Main Link** Copy करें या सीधे WhatsApp पर भेजें। "📋 सभी Staff के Link" से सब Link देख या Excel में Download कर सकते हैं।', 'Tap **🔗 Create link** → copy the **Main Link** or send it straight on WhatsApp. "📋 All Staff links" shows every link and downloads them as Excel.')
      ],
      tips: [B('Staff अपने-आप Google Sheet की "Staff List" में जुड़ता है, वेबसाइट की फ़ाइल में नहीं — इसलिए वेबसाइट की फ़ाइल बदलने या दोबारा डालने पर भी Staff और उसका Payment-हिसाब बना रहता है।', 'The Staff is added to the "Staff List" in Google Sheet, not in a website file — so replacing or re-uploading website files never loses a staff member or his payment accounting.')]
    },
    {
      id: 'admin-approvals', cats: ['admin'], icon: '✅', admin: 1,
      title: B('Admin: Approve / Payment Request / Refund / कारीगर की मंज़ूरी', 'Admin: approvals / payment requests / refunds / worker approval'),
      kw: 'admin approve pending payment request refund karigar manzoori staff profile',
      steps: [
        B('**✅ Approvals** (एक ही List): Staff Profile, Staff की Edit/Recovery Request, कारीगर की मंज़ूरी — "🔄 List दिखाएँ" दबाकर वहीं से Approve/Reject करें।', '**✅ Approvals** (one list): Staff Profile, Staff edit/recovery requests, worker approval — tap "🔄 Show list" and approve/reject right there.'),
        B('**💰 Pending Payment Requests**: जो Request अपने-आप Approve नहीं हुई उन पर ✔ लगाकर Approve करें।', '**💰 Pending Payment Requests**: tick the requests that were not auto-approved and approve them.'),
        B('**↩️ Refund दर्ज करें**: Training ID या Request ID डालकर बताएँ कि पैसा किस तरह लौटाया (इससे Staff का Commission अपने-आप घट जाता है)।', '**↩️ Record Refund**: enter the Training ID or Request ID and say how the money was returned (the Staff commission reduces automatically).')
      ]
    },
    {
      id: 'admin-deploy', cats: ['admin'], icon: '🚀', admin: 1,
      title: B('Admin: Apps Script / Website की फ़ाइलें अपडेट कैसे करें?', 'Admin: how to update Apps Script / website files'),
      kw: 'admin deploy update gs apps script new version github upload file version manifest scan',
      steps: [
        B('**Apps Script:** जिन .gs फ़ाइलों का नाम गाइड में लिखा हो, उनका पूरा कोड पुराने की जगह पेस्ट करें → **Deploy → Manage deployments → ✏️ → New version → Deploy**। (Deploy किए बिना बदलाव लागू नहीं होते।)', '**Apps Script:** paste the full code of the .gs files named in the guide over the old ones → **Deploy → Manage deployments → ✏️ → New version → Deploy**. (Changes do not apply without deploying.)'),
        B('**Website:** `1_website` फ़ोल्डर की सारी फ़ाइलें (नई सहित, और **data** फ़ोल्डर के साथ) GitHub पर डालें।', '**Website:** upload all files of the `1_website` folder (including new ones, and the **data** folder) to GitHub.'),
        B('**Admin Panel → 🛡️ App Scan** चलाकर देखें कि सब फ़ाइलें सही पहुँचीं (यह data/MP.json भी जाँचता है)। नई फ़ाइलें डालने पर "नया Manifest Download" करके उसे भी GitHub पर डालें।', 'Run **Admin Panel → 🛡️ App Scan** to confirm every file arrived (it also checks data/MP.json). After uploading new files download the "new Manifest" and upload that too.'),
        B('हर Update पर `version.js` में Version नंबर बदलें (जैसे v18 → v19) ताकि सबके App में Update का संदेश आए।', 'On every update change the version number in `version.js` (e.g. v18 → v19) so every app shows the update prompt.')
      ]
    }
  ];

  window.EKV_HELP_MORE = LIST.filter(function (a) { return !a.admin || ADMIN; });
})();
