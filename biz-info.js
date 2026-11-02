/* EkVeera — Business / Udyam / Grievance Officer ki jankari (EK jagah). Sirf yahi file badlein.
   Udyam number aane par UDYAM me daalein (jaise "UDYAM-MP-00-0000000"); khali rahe to Udyam wali line dikhti hi nahi. */
(function () {
  var BIZ = {
    name: 'EkVeera Placement & Services',
    kind_hi: 'एकल स्वामित्व (Sole Proprietorship) फ़र्म', kind_en: 'Sole Proprietorship firm',
    UDYAM: 'UDYAM-MP-54-0005405',
    owner: 'Anak Kumar Patel (Proprietor)',
    address: 'Vivek Nagar, Ward No. 19, Near Shiv Temple, Rewa Road, Maihar (M.P.) 485771',
    sub: 'New Meet Market, Raniganj, Panna (M.P.) 488001',
    wa: '9766284669', mail: 'ekveeraplacement26@gmail.com'
  };
  window.EKV_BIZ = BIZ;
  function html(l) {
    var hi = l === 'hi', o = BIZ.owner || (hi ? 'Proprietor (स्वामी)' : 'Proprietor');
    var u = BIZ.UDYAM ? '<li><b>' + (hi ? 'Udyam Registration No.:' : 'Udyam Registration No.:') + '</b> ' + BIZ.UDYAM + '</li>' : '';
    return '<ul class="biz-list">' +
      '<li><b>' + (hi ? 'व्यवसाय:' : 'Business:') + '</b> ' + BIZ.name + ' — ' + (hi ? BIZ.kind_hi : BIZ.kind_en) + '</li>' + u +
      '<li><b>' + (hi ? 'पंजीकृत / मुख्य पता:' : 'Registered / head office:') + '</b> ' + BIZ.address + '</li>' +
      '<li><b>' + (hi ? 'शाखा:' : 'Sub office:') + '</b> ' + BIZ.sub + '</li>' +
      '<li><b>' + (hi ? 'शिकायत अधिकारी (Grievance Officer):' : 'Grievance Officer:') + '</b> ' + o + ' — WhatsApp <b>' + BIZ.wa + '</b> · Email <b>' + BIZ.mail + '</b></li>' +
      '<li>' + (hi ? 'हम शिकायत मिलने के <b>48 घंटे में जवाब</b> और अधिकतम <b>15 दिन में समाधान</b> की कोशिश करते हैं।' :
        'We aim to <b>reply within 48 hours</b> and <b>resolve within 15 days</b> of receiving a complaint.') + '</li></ul>';
  }
  function fill() {
    var n = document.querySelectorAll('.ekv-biz');
    for (var i = 0; i < n.length; i++) n[i].innerHTML = html(n[i].getAttribute('data-l') === 'en' ? 'en' : 'hi');
    var f = document.querySelectorAll('.ekv-biz-line');
    for (var j = 0; j < f.length; j++) f[j].textContent = BIZ.name + ' · ' + BIZ.kind_en + (BIZ.UDYAM ? ' · Udyam: ' + BIZ.UDYAM : '') + ' · ' + BIZ.address;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill); else fill();
})();
