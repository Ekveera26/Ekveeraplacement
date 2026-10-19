/* EkVeera — हर पेज पर "कठिनाई हो तो Help में देखें" की पट्टी (v18)
   हर पेज के Header के ठीक नीचे एक पतली पट्टी जोड़ती है, जो Help Center (help.html) पर ले जाती है —
   और इस पेज के काम का सीधा Help-जवाब भी खोलती है (help.html?help=<id>)।
   भाषा: Hindi/English अपने-आप (EKV_LANG) — शब्दकोश की ज़रूरत नहीं। */
(function () {
  'use strict';
  var EN = window.EKV_LANG === 'en';
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page === 'help.html') return;
  var MAP = {
    'for-rent.html': 'rent-giver', 'home-service.html': 'hs-karigar', 'tution.html': 'tut-teacher', 'contractor.html': 'contractor-invoice',
    'staff-profile.html': 'staff-profile-create', 'register.html': 'register-notify', 'training.html': 'training-admission',
    'placement.html': 'resume-upload', 'resume-builder.html': 'resume-builder'
  };
  var id = MAP[page] || '';
  function go() {
    if (document.getElementById('ekvHelpNote')) return;
    var h = document.querySelector('header'); if (!h) return;
    var d = document.createElement('div'); d.id = 'ekvHelpNote'; d.className = 'help-note notranslate';
    d.innerHTML = '<div class="container help-note-in"><span class="hn-t">❓ ' +
      (EN ? 'Facing difficulty in any task? Go to <b>EkVeera Help</b> to find out — every task is explained there step by step.'
          : 'किसी काम को करने में कठिनाई हो रही है? <b>EkVeera Help</b> में जाकर पता करें — सभी कामों की Step-by-Step जानकारी वहाँ है।') +
      '</span><span class="hn-b"><a class="hn-btn" href="help.html">💬 ' + (EN ? 'Open Help' : 'Help खोलें') + '</a>' +
      (id ? '<a class="hn-btn hn-alt" href="help.html?help=' + id + '#help">📖 ' + (EN ? 'Help for this page' : 'इस पेज का Help') + '</a>' : '') + '</span></div>';
    h.parentNode.insertBefore(d, h.nextSibling);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
