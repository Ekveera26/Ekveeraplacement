/* EkVeera — Register (Naam + Mobile + kis ke liye) — Server: EkVeera_AdminExtra.gs (action: appregister) */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const T = s => (typeof __t === 'function' ? __t(s) : s);
  const KEY = 'ekv_reg_v1';
  const digits10 = s => String(s || '').replace(/\D/g, '').slice(-10);
  function say(text, kind) { const el = $('rgMsg'); el.className = 'rent-msg' + (kind ? ' ' + kind : ''); el.textContent = text || ''; }
  function ints() { return Array.prototype.filter.call($('rgInts').querySelectorAll('input'), c => c.checked).map(c => c.value); }
  try {                                                  // पिछली बार भरी जानकारी वापस दिखाओ
    const old = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (old.name) $('rgName').value = old.name;
    if (old.mobile) $('rgMobile').value = old.mobile;
    (old.ints || []).forEach(v => { const c = $('rgInts').querySelector('input[value="' + v + '"]'); if (c) c.checked = true; });
  } catch (e) {}
  window.appRegister = async function () {
    const name = $('rgName').value.trim(), mob = digits10($('rgMobile').value), list = ints();
    if (name.length < 2) return say(T('अपना पूरा नाम लिखें।'), 'err');
    if (mob.length !== 10) return say(T('10 अंकों का सही Mobile Number लिखें।'), 'err');
    if (!list.length) return say(T('कम से कम एक चुनें कि आप किसके लिए Register हो रहे हैं।'), 'err');
    if (!$('rgTerms').checked) return say(T('आगे बढ़ने के लिए सहमति पर ✔ लगाएँ।'), 'err');
    $('rgBtn').disabled = true; say(T('⏳ Register किया जा रहा है...'), '');
    let r; try { r = await vcSecurePost({ action: 'appregister', name: name, mobile: mob, interests: list.join(','), terms: '1', website: $('rgWebsite').value, staff: (window.ekvStaffRef && window.ekvStaffRef()) || '' }); }
    catch (e) { r = { status: 'error', message: T('इंटरनेट / Server की दिक्कत — थोड़ी देर बाद फिर कोशिश करें।') }; }
    $('rgBtn').disabled = false;
    if (!r || r.status !== 'ok') return say((r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err');
    try { localStorage.setItem(KEY, JSON.stringify({ name: name, mobile: mob, ints: list })); } catch (e) {}
    say('', '');
    $('rgDoneId').textContent = r.regId;
    $('rgDoneTxt').textContent = r.updated ? T('आपकी पसंद बदल दी गई है।') : T('अब आपको चुनी हुई सेवाओं की जानकारी मिलेगी।');
    $('rgDone').style.display = 'block'; $('rgDone').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  window.appRegNotify = function () {                      // push.js का 🔔 खोलकर Mobile भर देना
    const bell = $('ekvPushBell'); if (!bell) return alert(T('इस Browser में Notification उपलब्ध नहीं है।'));
    const panel = $('ekvPush'); if (panel && !panel.classList.contains('open')) bell.click();
    setTimeout(function () { const m = $('ekvPushMob'); if (m && !m.value) m.value = digits10($('rgMobile').value); }, 150);
  };
})();
