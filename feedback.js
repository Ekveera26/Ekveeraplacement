/* EkVeera Home Service — काम के बाद रेटिंग पेज (ग्राहक को WhatsApp पर feedback.html?fb=REQ-0001 जैसा लिंक जाता है)
 * सारा हिसाब Home Service वाले अलग Apps Script (6_home_service/Code.gs) में है — EkVeera के बाक़ी Logic से इसका कोई लेना-देना नहीं। */
(function () {
  'use strict';
  const ENDPOINT = (window.HS_CONFIG || {}).ENDPOINT || '';
  const $ = id => document.getElementById(id);
  const T = s => (typeof __t === 'function' ? __t(s) : s);
  const req = new URLSearchParams(location.search).get('fb');
  let star = 0;
  const say = t => { $('hsFb').innerHTML = '<p class="msg"></p>'; $('hsFb').firstChild.textContent = t; };

  async function init() {
    if (!ENDPOINT) $('hsDemo').style.display = 'block';
    if (!req) return say(T('यह लिंक सही नहीं है।'));
    if (!ENDPOINT) return show({ naam: T('डेमो कारीगर'), kaam: T('इलेक्ट्रिशियन') }, true);
    try {
      const r = await (await fetch(ENDPOINT + '?action=fb&req=' + encodeURIComponent(req))).json();
      r.ok ? show(r) : say(r.msg || T('यह लिंक सही नहीं है।'));
    } catch (e) { say(T('लिंक नहीं खुल सका। इंटरनेट देखकर दोबारा खोलें।')); }
  }

  function show(r, demo) {
    // सिर्फ़ तय Markup — कारीगर का नाम/काम textContent से डाला जाता है (HTML की तरह नहीं), इसलिए सुरक्षित
    $('hsFb').innerHTML = '<p><b></b> — <span></span></p><p>' + T('काम कैसा रहा?') + '</p><div class="stars" role="radiogroup"></div>' +
      '<label for="hsId">' + T('क्या कारीगर ने अपना पहचान पत्र दिखाया?') + '</label><select id="hsId"><option value="हाँ">' + T('हाँ') + '</option><option value="नहीं">' + T('नहीं') + '</option></select>' +
      '<label for="hsCm" style="margin-top:10px">' + T('टिप्पणी (वैकल्पिक)') + '</label><textarea id="hsCm" rows="3" maxlength="300"></textarea>' +
      '<p class="err" id="hsE" role="alert"></p><button class="go" id="hsB" type="button" style="width:100%;margin-top:10px">' + T('रेटिंग भेजें') + '</button>' +
      '<p class="meta" style="margin-top:10px">' + T('आपकी टिप्पणी सार्वजनिक नहीं दिखेगी, सिर्फ़ हमारी टीम देखेगी।') + '</p>';
    $('hsFb').querySelector('b').textContent = r.naam; $('hsFb').querySelector('span').textContent = r.kaam;
    const box = $('hsFb').querySelector('.stars');
    for (let i = 1; i <= 5; i++) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = '★'; b.setAttribute('aria-label', i + ' ' + T('स्टार'));
      b.onclick = () => { star = i; Array.prototype.forEach.call(box.children, (x, j) => x.classList.toggle('on', j < i)); };
      box.appendChild(b);
    }
    $('hsB').onclick = async () => {
      if (!star) { $('hsE').textContent = T('पहले स्टार चुनें।'); return; }
      $('hsB').disabled = true;
      if (!demo) {
        try {
          const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'rating', req: req, stars: star, idshown: $('hsId').value, comment: $('hsCm').value }) });
          const j = await res.json();
          if (!j || !j.ok) { $('hsE').textContent = T('रेटिंग दर्ज नहीं हो सकी — शायद आप पहले दे चुके हैं या लिंक सही नहीं है।'); $('hsB').disabled = false; return; }
        } catch (e) { $('hsE').textContent = T('भेजने में दिक्कत हुई। दोबारा कोशिश करें।'); $('hsB').disabled = false; return; }
      }
      say(T('धन्यवाद! आपकी रेटिंग दर्ज हो गई।') + (demo ? ' ' + T('(डेमो)') : ''));
    };
  }
  init();
})();
