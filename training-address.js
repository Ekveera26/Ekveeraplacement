/* EkVeera — Training के बाद Company Address (Candidate की तरफ़ से Request)
   सारे नियम Server (EkVeera_TrainAddress.gs) जाँचता है: Training ID + Mobile, Fee Paid, Training Complete, Email।
   यहाँ सिर्फ़ फॉर्म और जवाब दिखाया जाता है। */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function say(t, kind) {
    var m = $('adMsg'); if (!m) return;
    m.style.color = kind === 'ok' ? '#1b7f3b' : (kind === 'warn' ? '#a35c00' : '#C0392B');
    m.textContent = t;
  }
  try {                                                         // Attendance वाले बॉक्स में जो ID डाली हो, वही यहाँ भर दें
    var sid = sessionStorage.getItem('ekv_att_id'), smob = sessionStorage.getItem('ekv_att_mob');
    if (sid && $('adId') && !$('adId').value) $('adId').value = sid;
    if (smob && $('adMobile') && !$('adMobile').value) $('adMobile').value = smob;
  } catch (e) {}

  window.requestAddress = async function () {
    var id = ($('adId').value || '').trim().toUpperCase(), mob = ($('adMobile').value || '').replace(/\D/g, '');
    if (!id) return say(__t('कृपया अपनी Training ID डालें।'), 'err');
    if (mob.length < 10) return say(__t('फॉर्म में दिया 10 अंकों का Mobile Number डालें।'), 'err');
    var btn = $('adBtn'); btn.disabled = true; say(__t('⏳ Request भेजी जा रही है...'), 'warn');
    try {
      var d = await vcSecurePost({ action: 'addrrequest', trainingId: id, mobile: mob, website: ($('adWebsite') || {}).value || '' });
      if (d.status === 'ok') say('✅ ' + d.message, 'ok');
      else if (d.status === 'exists') say('ℹ️ ' + d.message, 'warn');
      else say(d.message || __t('Request नहीं हो पाई।'), 'err');
    } catch (err) { say(__t('Server से जवाब नहीं मिल पाया — Internet चेक करके दोबारा कोशिश करें।'), 'err'); }
    btn.disabled = false;
  };
})();
