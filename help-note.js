/* EkVeera — हर पेज पर नीचे (दाईं तरफ़) छोटा "?" Help आइकन (v19k)
   पहले Header के नीचे पट्टी थी — अब हटा दी गई है। यह आइकन WhatsApp / ऊपर-जाएँ / 🔔 के ऊपर अलग जगह पर रहता है (आपस में टकराते नहीं)।
   दबाने पर Help Center खुलता है, और इस पेज के काम का सीधा जवाब (help.html?help=<id>) भी। */
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
    var old = document.getElementById('ekvHelpNote'); if (old) old.remove();          // पुरानी पट्टी (अगर कहीं cache में हो)
    if (document.getElementById('ekvHelpFab')) return;
    var a = document.createElement('a');
    a.id = 'ekvHelpFab'; a.className = 'notranslate';
    a.href = 'help.html' + (id ? '?help=' + id + '#help' : '');
    a.setAttribute('aria-label', EN ? 'Help' : 'Help — कहाँ क्या करना है');
    a.title = EN ? 'Help' : 'Help — कहाँ क्या करना है';
    a.textContent = '?';
    document.body.appendChild(a);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
