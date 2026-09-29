/*****************************************************************
 *  EkVeera — Company Benefits Form (Candidate ko kya-kya milega)
 *  =================================================================
 *  Ye file "Ekveera training center" Apps Script project ki apps-script-company-form.gs
 *  file mein POORI paste (purana sab hata kar) karni hai.
 *
 *  Ye file aapki mojooda files ke helper use karti hai (dono ek hi project mein hain):
 *    IDCard_Certificate_Verify.gs se -> vcHeaderMap, vcFindRowByValue, vcNowStr, vcSendAdminEmail,
 *                                      vcCheckPasswordLock, vcRecordFailedPassword, vcResetFailedPassword,
 *                                      ADMIN_UNLOCK_PASSWORD (wahi Admin password jo website Admin Login mein hai)
 *
 *  Naye Google Sheet tab (apne-aap ban jayenge):
 *    "Company Info Forms"   -> kis Company ne kab form bhara (ek row = ek form)
 *    "Company Info Answers" -> us form ke sawal-wise jawab
 *  Upload ki hui Excel Google Drive ke "EkVeera Company Forms" folder mein save hoti hai.
 *****************************************************************/

var EKV_CI = {
  DRIVE_FOLDER: "EkVeera Company Forms",
  THROTTLE_SECONDS: 30   // ek hi Company ID se baar-baar (spam) submit rokne ke liye
};

var EKV_MAIN_SHEET = "Company Info Forms";
var EKV_ANS_SHEET = "Company Info Answers";
var EKV_MAIN_HEAD = ["Submission ID", "Timestamp", "Company ID", "Company Name", "Contact Name", "Mobile", "Email",
                     "Language", "Mode", "ID Check", "Status", "File Link", "Answers Count"];
var EKV_ANS_HEAD = ["Submission ID", "No", "Section", "Question", "Yes/No", "Detail", "Remarks"];

/* ---- doGet() ka dispatcher in dono functions se is file ko jodta hai ---- */
function ekvIsCompanyInfoAction_(action) {
  return ["submitcompanyinfo", "checkpendingcompanyforms", "listcompanyforms",
          "getcompanyformanswers", "markcompanyformseen"].indexOf(action) > -1;
}

function ekvHandleCompanyInfo_(action, e) {
  if (action === "submitcompanyinfo") return ekvSubmit_(e);
  if (action === "checkpendingcompanyforms") return ekvPendingCount_();

  // baaki sab sirf Admin ke liye — wahi Password + 3 galat try par 30 min Lock jo baaki Admin features mein hai
  var deny = ekvAdminCheck_(e);
  if (deny) return deny;
  if (action === "listcompanyforms") return ekvList_();
  if (action === "getcompanyformanswers") return ekvAnswers_(e);
  if (action === "markcompanyformseen") return ekvMarkSeen_(e);
  return { status: "error", message: "अज्ञात action" };
}

function ekvAdminCheck_(e) {
  var lockInfo = vcCheckPasswordLock();
  if (lockInfo.locked) {
    return { status: "error", message: "बहुत सारी गलत कोशिशों की वजह से यह अस्थायी रूप से लॉक है — " + lockInfo.minutesLeft + " मिनट बाद फिर कोशिश करें।" };
  }
  var password = ((e.parameter.password || "") + "").trim();
  if (password !== ADMIN_UNLOCK_PASSWORD) {
    vcRecordFailedPassword();
    return { status: "error", message: "गलत Password" };
  }
  vcResetFailedPassword();
  return null;
}

/* ---- Sheets ---- */
function ekvSheet_(name, head) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight("bold").setBackground("#D9E1F2");
    sh.setFrozenRows(1);
  }
  return sh;
}

/* Sheet mein formula-injection rokna (=, +, -, @ se shuru hone wali value) + lambai limit */
function ekvSafe_(v, max) {
  var s = String(v == null ? "" : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max || 200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

/* "Company Database" mein Company ID dhoondhna (wahi sheet jo aapki Master file banati hai) */
function ekvLookupCompany_(companyId) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Company Database");
  if (!sh) return { found: null };                       // sheet hi na ho to check chhod do
  var map = vcHeaderMap(sh);
  var row = vcFindRowByValue(sh, map["company id"], companyId);
  if (!row) return { found: false };
  var mobile = map["contact number"]
    ? String(sh.getRange(row, map["contact number"]).getValue()).replace(/\D/g, "").slice(-10) : "";
  var name = map["company name"] ? String(sh.getRange(row, map["company name"]).getValue()).trim() : "";
  return { found: true, mobile: mobile, name: name };
}

/* ---- Company ka form save karna (sabke liye khula, par Company ID hamare record mein honi zaroori) ---- */
function ekvSubmit_(e) {
  var p = e.parameter || {};
  var companyId = String(p.companyId || "").trim().toUpperCase();
  if (!/^COMP\d{1,8}$/.test(companyId)) return { status: "error", message: "Company ID सही नहीं है (जैसे COMP001)।" };
  var companyName = ekvSafe_(p.companyName, 120);
  if (companyName.length < 2) return { status: "error", message: "Company का नाम ज़रूरी है।" };
  var mobile = String(p.mobile || "").replace(/\D/g, "").slice(-10);
  if (mobile.length !== 10) return { status: "error", message: "Mobile Number सही नहीं है।" };

  // Sirf wahi Company jiski ID Company Database mein hai (Drive/Sheet mein kachra rokne ke liye)
  var co = ekvLookupCompany_(companyId);
  if (co.found === false) {
    return { status: "error", message: "यह Company ID हमारे रिकॉर्ड में नहीं मिली। कृपया सही ID डालें, या पहले ऊपर के \"Requirement Of Candidate\" फॉर्म से अपनी ID बनवाएं।" };
  }
  var idCheck = co.found === null ? "Not checked" : (co.mobile && co.mobile !== mobile ? "Mobile differs" : "Yes");

  var cache = CacheService.getScriptCache();
  var ck = "ekvci_" + companyId;
  if (cache.get(ck)) return { status: "error", message: "कृपया " + EKV_CI.THROTTLE_SECONDS + " सेकंड बाद दोबारा भेजें।" };

  var mode = p.mode === "excel" ? "excel" : "online";
  var lang = p.lang === "en" ? "en" : "hi";

  var answers = [];
  try { answers = JSON.parse(p.answers || "[]"); } catch (err) { answers = []; }
  if (!Array.isArray(answers)) answers = [];
  answers = answers.slice(0, 150);
  if (!answers.length && !(mode === "excel" && p.fileBase64)) return { status: "error", message: "कोई जानकारी नहीं मिली।" };

  var blob = null;
  if (mode === "excel" && p.fileBase64) {
    if (String(p.fileBase64).length > 3000000) return { status: "error", message: "फ़ाइल बहुत बड़ी है (2 MB तक)।" };
    var bytes = Utilities.base64Decode(p.fileBase64);
    if (bytes.length > 2 * 1024 * 1024 || bytes[0] !== 80 || bytes[1] !== 75) { // 'PK' = xlsx (zip) ki pehchaan
      return { status: "error", message: "सिर्फ़ .xlsx फ़ाइल भेजें।" };
    }
    blob = Utilities.newBlob(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }

  var subId = "";
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var main = ekvSheet_(EKV_MAIN_SHEET, EKV_MAIN_HEAD);
    var ansSh = ekvSheet_(EKV_ANS_SHEET, EKV_ANS_HEAD);
    var seq = main.getLastRow();                                    // header ki wajah se pehla form = INFO001
    subId = "INFO" + (seq < 1000 ? ("000" + seq).slice(-3) : String(seq));

    var fileLink = "";
    if (blob) {
      var it = DriveApp.getFoldersByName(EKV_CI.DRIVE_FOLDER);
      var folder = it.hasNext() ? it.next() : DriveApp.createFolder(EKV_CI.DRIVE_FOLDER);
      blob.setName(subId + "_" + companyId + ".xlsx");
      fileLink = folder.createFile(blob).getUrl();
    }

    main.appendRow([subId, new Date(), companyId, companyName, ekvSafe_(p.contactName, 80), "'" + mobile,
                    ekvSafe_(p.email, 120), lang, mode, idCheck, "New", fileLink, answers.length]);

    if (answers.length) {
      var rows = answers.map(function (a) {
        var yn = String(a.yn || "");
        if (["Yes", "No", "N/A"].indexOf(yn) < 0) yn = "";
        return [subId, Number(a.n) || "", ekvSafe_(a.s, 120), ekvSafe_(a.q, 200), yn, ekvSafe_(a.d, 300), ekvSafe_(a.r, 200)];
      });
      ansSh.getRange(ansSh.getLastRow() + 1, 1, rows.length, EKV_ANS_HEAD.length).setValues(rows);
    }
    cache.put(ck, "1", EKV_CI.THROTTLE_SECONDS);
  } finally {
    lock.releaseLock();
  }

  // Admin ko turant Email (website band ho tab bhi) — wahi ADMIN_EMAIL jo baaki alerts ke liye hai
  try {
    vcSendAdminEmail("📋 EkVeera — नया Company Form: " + companyId + " (" + companyName + ")",
      "Company: " + companyName + " (" + companyId + ")\nMobile: " + mobile +
      "\nतरीका: " + (mode === "excel" ? "Excel Upload" : "Online Form") +
      "\nForm No.: " + subId + "\nID Check: " + idCheck +
      (idCheck === "Mobile differs" ? "  ⚠️ (Company Database वाले Contact Number से अलग है — जांच लें)" : "") +
      "\n\nदेखने के लिए वेबसाइट पर ?admin=1 वाले Link से Admin Login करें → Company Benefits Forms।");
  } catch (mailErr) { /* mail na bhi jaye to form save ho chuka hai */ }

  return { status: "ok", submissionId: subId };
}

function ekvPendingCount_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EKV_MAIN_SHEET);
  if (!sh || sh.getLastRow() < 2) return { status: "ok", count: 0 };
  var st = sh.getRange(2, 11, sh.getLastRow() - 1, 1).getValues();
  var n = 0;
  for (var i = 0; i < st.length; i++) if (st[i][0] === "New") n++;
  return { status: "ok", count: n };
}

function ekvList_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EKV_MAIN_SHEET);
  if (!sh || sh.getLastRow() < 2) return { status: "ok", items: [] };
  var start = Math.max(2, sh.getLastRow() - 199);              // sabse naye 200 form
  var vals = sh.getRange(start, 1, sh.getLastRow() - start + 1, EKV_MAIN_HEAD.length).getValues();
  var items = vals.map(function (r) {
    return {
      submissionId: r[0], timestamp: r[1] instanceof Date ? r[1].toISOString() : String(r[1]),
      companyId: r[2], companyName: String(r[3]).replace(/^'/, ""), contactName: String(r[4]).replace(/^'/, ""),
      mobile: String(r[5]).replace(/\D/g, ""), email: String(r[6]).replace(/^'/, ""),
      lang: r[7], mode: r[8], verified: r[9], status: r[10], fileLink: r[11]
    };
  }).reverse();
  return { status: "ok", items: items };
}

function ekvAnswers_(e) {
  var id = String((e.parameter && e.parameter.submissionId) || "");
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EKV_ANS_SHEET);
  if (!sh || sh.getLastRow() < 2) return { status: "ok", answers: [] };
  var vals = sh.getRange(2, 1, sh.getLastRow() - 1, EKV_ANS_HEAD.length).getValues();
  var out = [];
  vals.forEach(function (r) {
    if (r[0] === id) {
      out.push({ n: r[1], section: String(r[2]).replace(/^'/, ""), question: String(r[3]).replace(/^'/, ""),
                 yn: r[4], detail: String(r[5]).replace(/^'/, ""), remarks: String(r[6]).replace(/^'/, "") });
    }
  });
  return { status: "ok", answers: out };
}

function ekvMarkSeen_(e) {
  var id = String((e.parameter && e.parameter.submissionId) || "");
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EKV_MAIN_SHEET);
  if (!sh || sh.getLastRow() < 2) return { status: "error", message: "नहीं मिला।" };
  var ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) { sh.getRange(i + 2, 11).setValue("Seen"); return { status: "ok" }; }
  }
  return { status: "error", message: "नहीं मिला।" };
}
