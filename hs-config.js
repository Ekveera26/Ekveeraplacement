/* =====================================================================================
 *  🏠 EkVeera HOME SERVICE — सेटिंग (सिर्फ़ यही फ़ाइल बदलनी है)
 *  ENDPOINT : Home Service वाले Apps Script का Web App URL (…/exec).
 *             ⚠️ यह EkVeera वाले Apps Script से ALAG है (6_home_service/Code.gs) — दोनों का URL अलग होगा।
 *             खाली ("") रहने पर पेज "डेमो मोड" में चलते हैं (नकली नाम दिखते हैं, कुछ सेव नहीं होता)।
 *  PAGE_SIZE / MAX_SHOW : एक बार में कितने कारीगर दिखें ("और देखें" से अगले 10) और कुल कितने तक।
 *  ACTIVE   : जिन राज्यों में सेवा चालू है। नया राज्य खोलने पर पहले data/UP.json डालें, फिर यहाँ ["MP","UP"] करें।
 * ===================================================================================== */
window.HS_CONFIG = {
  ENDPOINT: "https://script.google.com/macros/s/AKfycbyI5Bh6RCDRAfVXs_ewOWFFpidxAPY98_ZyXkJWhjSixnyLb6xhMqg3baMETDfYlW4E/exec",
  ACTIVE: ["MP"],
  PAGE_SIZE: 10,      // ek baar me kitne kaarigar dikhen; "और देखें" dabane par agle 10
  MAX_SHOW: 0         // 0 = jitne mile sab (10-10 karke). For Rent ki tarah 30 par rokna ho to 30 likhein
};
