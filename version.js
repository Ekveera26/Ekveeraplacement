/* EkVeera — App ka Version (har naye Update par sirf yahi ek Number badlein, jaise 'v19') */
window.EKV_VERSION = 'v27';
(function () {
  function paint() {
    try {
      var v = window.EKV_VERSION, c = document.querySelector('.copyright');
      if (c && !document.getElementById('ekvVer')) { var s = document.createElement('span'); s.id = 'ekvVer'; s.style.cssText = 'display:block;margin-top:4px;font-size:12px;opacity:.8;'; s.textContent = 'Version ' + v; c.appendChild(s); }
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint); else paint();
})();
