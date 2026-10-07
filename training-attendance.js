/* EkVeera — Training Attendance (Website से) + Day-wise Training Material (हर Day की File सिर्फ़ एक बार)
   सारे नियम Server (EkVeera_Training.gs) जाँचता है: कौन सा Batch चल रहा है, Class का समय, Fee Paid, Attendance "P",
   और File पहले Download हुई या नहीं। यहां सिर्फ़ दिखाया जाता है। */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function say(t, kind) {
    var m = $('attMsg'); if (!m) return;
    m.style.color = kind === 'ok' ? '#1b7f3b' : (kind === 'warn' ? '#a35c00' : '#C0392B');
    m.textContent = t;
  }
  function creds() {
    var id = ($('attId').value || '').trim().toUpperCase(), mob = ($('attMobile').value || '').replace(/\D/g, '');
    if (!id) { say(__t('कृपया अपनी Training ID डालें।'), 'err'); return null; }
    if (mob.length < 10) { say(__t('फॉर्म में दिया 10 अंकों का Mobile Number डालें।'), 'err'); return null; }
    try { sessionStorage.setItem('ekv_att_id', id); sessionStorage.setItem('ekv_att_mob', mob); } catch (e) {}
    return { trainingId: id, mobile: mob };
  }
  function busy(on) {
    ['attMarkBtn', 'attListBtn'].forEach(function (b) { var el = $(b); if (el) el.disabled = on; });
  }

  window.markAttendance = async function () {
    var c = creds(); if (!c) return;
    c.website = ($('attWebsite') || {}).value || '';
    say(__t('⏳ Attendance लगाई जा रही है...'), 'warn'); busy(true);
    try {
      var d = await vcSecurePost(Object.assign({ action: 'markattendance' }, c));
      if (d.status === 'ok') {
        say('✅ ' + __t('Day ') + d.day + __t(' की Attendance लग गई') + (d.name ? ' — ' + d.name : '') + ' (' + d.batch + ')', 'ok');
        await window.loadMaterial(true);
      } else if (d.status === 'already') {
        say('✅ ' + (d.message || ''), 'ok'); await window.loadMaterial(true);
      } else if (d.status === 'too_early' || d.status === 'not_started' || d.status === 'no_class') {
        say('⏰ ' + (d.message || ''), 'warn');
      } else {
        say(d.message || __t('Attendance नहीं लग पाई।'), 'err');
      }
    } catch (err) { say(__t('Server से जवाब नहीं मिल पाया — Internet चेक करके दोबारा कोशिश करें।'), 'err'); }
    busy(false);
  };

  window.loadMaterial = async function (quiet) {
    var c = creds(); if (!c) return;
    if (!quiet) say(__t('⏳ आपका Material लोड हो रहा है...'), 'warn');
    busy(true);
    var box = $('attBox');
    try {
      var d = await vcSecurePost(Object.assign({ action: 'gettrainingmaterial' }, c));
      if (d.status !== 'ok') { box.innerHTML = ''; say(d.message || __t('लोड नहीं हो पाया।'), 'err'); busy(false); return; }
      if (!quiet) say('', 'ok');
      var h = '<div class="att-who"><span class="att-chip">' + esc(d.name || c.trainingId) + '</span><span class="att-chip">' + esc(d.batch || '') + '</span>' +
        (d.todayDay ? '<span class="att-chip" style="background:#E4F4EA;">' + __t('आज Day ') + d.todayDay + '</span>' : '') + '</div><div class="att-days">';
      d.days.forEach(function (x) {
        var cls = 'att-day' + (d.todayDay === x.day ? ' is-today' : ''), body;
        if (x.downloaded) body = '<span class="att-st ok">✔ ' + __t('Download हो चुकी') + '</span><small>' + esc(x.downloadedAt) + '</small>';
        else if (x.attended && x.hasFile && x.waitUntil) body = '<span class="att-st wait">⏳ ' + __t('आज की Class ख़त्म होने के बाद मिलेगी') + '</span><small>' + esc(x.waitUntil) + __t(' के बाद') + '</small>';
        else if (x.attended && x.hasFile) body = '<span class="att-st ok">✅ ' + __t('Attendance लगी है') + '</span><button type="button" class="att-dl" onclick="downloadDay(' + x.day + ',this)">' + __t('⬇ File Download करें (एक बार)') + '</button>';
        else if (x.attended) body = '<span class="att-st wait">⏳ ' + __t('File जल्दी जोड़ी जाएगी') + '</span>';
        else body = '<span class="att-st lock">🔒 ' + __t('Attendance (P) लगने पर मिलेगी') + '</span>';
        h += '<div class="' + cls + '"><b>Day ' + x.day + '</b>' + (x.title ? '<small>' + esc(x.title) + '</small>' : '') + body + '</div>';
      });
      box.innerHTML = h + '</div>';
    } catch (err) { say(__t('Server से जवाब नहीं मिल पाया — Internet चेक करके दोबारा कोशिश करें।'), 'err'); }
    busy(false);
  };

  function b64ToBlob(b64, type) {
    var bin = atob(b64), len = bin.length, arr = new Uint8Array(len);
    for (var i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: type || 'application/octet-stream' });
  }

  window.downloadDay = async function (day, btn) {
    var c = creds(); if (!c) return;
    if (!window.confirm(__t('यह File सिर्फ़ एक बार Download होगी। Internet ठीक है तो आगे बढ़ें।') + '\n\nDay ' + day)) return;
    var old = btn.textContent; btn.disabled = true; btn.textContent = __t('⏳ File आ रही है...');
    try {
      var d = await vcSecurePost(Object.assign({ action: 'downloadmaterial', day: day }, c));
      if (d.status === 'ok') {
        var url = URL.createObjectURL(b64ToBlob(d.base64, d.mimeType));
        var a = document.createElement('a'); a.href = url; a.download = d.fileName || ('EkVeera_Day_' + day); a.style.display = 'none';
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 2000);
        say('✅ Day ' + day + __t(' की File Download हो गई — "Downloads" folder में देखें।'), 'ok');
        await window.loadMaterial(true);
        return;
      }
      say(d.message || __t('File नहीं मिल पाई।'), d.status === 'already' ? 'warn' : 'err');
      await window.loadMaterial(true);
    } catch (err) {
      say(__t('Server से जवाब नहीं मिल पाया — Internet चेक करके दोबारा कोशिश करें।'), 'err');
    }
    btn.disabled = false; btn.textContent = old;
  };

  document.addEventListener('DOMContentLoaded', function () {
    try {
      var i = sessionStorage.getItem('ekv_att_id'), m = sessionStorage.getItem('ekv_att_mob');
      if (i && $('attId')) $('attId').value = i; if (m && $('attMobile')) $('attMobile').value = m;
    } catch (e) {}
  });
})();
