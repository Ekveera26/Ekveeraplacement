/* v26 — Giver / Karigar / Teacher: ID, Profile, Saman, Skill, Service BADALNE ke liye Login (User ID/Mobile + Password).
   Dekhna / Search / Order pehle jaisa khula. Edit wale actions par Token apne aap judta hai; Login na ho to popup khulta hai. */
(function () {
  'use strict';
  if (window.__ekvOwnerLogin || typeof window.vcSecurePost !== 'function') return;
  window.__ekvOwnerLogin = true;
  var AKEY = 'ekv_acct', DKEY = 'ekv_dev';
  var EDIT = /^(rent|hs|tut)(additem|addwork|addskill|mylisting|myids|setstatus|renew)$/;
  var REG = /^(rentregister|hsregister|tutregister)$/;
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function acct() { try { return JSON.parse(lsGet(AKEY) || '{}') || {}; } catch (e) { return {}; } }
  function lang() { return lsGet('ekveera_lang') === 'en' ? 'en' : 'hi'; }
  function L(hi, en) { return lang() === 'en' ? en : hi; }
  function devId() {
    if (window.__ekvAuth && window.__ekvAuth.devId) return window.__ekvAuth.devId();
    var d = lsGet(DKEY); if (!d || d.length < 16) { d = 'o' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2) + '0000000000000000'; lsSet(DKEY, d); } return d;
  }
  function valid(a) { var t = String(a.token || '').split('.'); return !!(a.token && a.mobile && t.length === 5 && parseInt(t[2], 10) > Date.now()); }
  var base = window.vcSecurePost, waiting = null;
  function attach(params) {
    var a = acct(), q = {}, k; for (k in params) q[k] = params[k];
    if (valid(a)) { q.token = a.token; q.deviceId = devId(); if (/myids$/.test(q.action)) q.mobile = a.mobile; }
    return q;
  }
  function popup() {
    if (waiting) return waiting;
    waiting = new Promise(function (resolve) {
      var w = document.createElement('div'); w.id = 'ekvOwnLogin'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
      w.style.cssText = 'position:fixed;inset:0;background:rgba(11,31,58,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px';
      var c = document.createElement('div'); c.style.cssText = 'background:#fff;border-radius:14px;max-width:380px;width:100%;padding:20px;font-family:inherit;box-sizing:border-box';
      function mk(t, tx, st) { var e = document.createElement(t); if (tx) e.textContent = tx; if (st) e.style.cssText = st; return e; }
      c.appendChild(mk('h3', L('🔐 पहले Login करें', '🔐 Please login first'), 'margin:0 0 6px;color:#0B1F3A'));
      c.appendChild(mk('p', L('अपनी ID / Profile / सामान / Skill / Service बदलने के लिए Login ज़रूरी है — ताकि कोई और आपकी details न बदल सके। देखना और Search करना बिना Login के चालू है।', 'Login is required to change your ID, profile, items, skills or services, so nobody else can edit them. Viewing and searching stay open.'), 'font-size:13.5px;color:#445;margin:0 0 10px'));
      var iu = mk('input', '', 'width:100%;padding:10px;margin:4px 0 8px;border:1.5px solid #cbd5e1;border-radius:8px;font-size:15px;box-sizing:border-box'); iu.id = 'ownUser'; iu.placeholder = L('User ID (REG…) या Mobile', 'User ID (REG…) or mobile'); iu.autocomplete = 'username';
      var ip = mk('input', '', 'width:100%;padding:10px;margin:0 0 8px;border:1.5px solid #cbd5e1;border-radius:8px;font-size:15px;box-sizing:border-box'); ip.id = 'ownPass'; ip.type = 'password'; ip.placeholder = 'Password'; ip.autocomplete = 'current-password';
      var m = mk('div', '', 'min-height:18px;font-size:13px;color:#c0392b;margin-bottom:8px');
      var go = mk('button', L('🔓 Login', '🔓 Login'), 'width:100%;padding:11px;border:0;border-radius:9px;background:#0B1F3A;color:#fff;font-weight:700;font-size:15px;cursor:pointer'); go.id = 'ownGo';
      var rg = mk('a', L('नए हैं? पहले Register करें', 'New? Register first'), 'display:block;text-align:center;margin-top:10px;font-size:13px'); rg.href = 'register.html';
      var cx = mk('button', L('बंद करें', 'Close'), 'display:block;margin:8px auto 0;border:0;background:none;color:#667;font-size:13px;cursor:pointer');
      [iu, ip, m, go, rg, cx].forEach(function (e) { c.appendChild(e); }); w.appendChild(c); document.body.appendChild(w);
      function done(ok) { try { w.remove(); } catch (e) {} waiting = null; resolve(ok); }
      cx.onclick = function () { done(false); };
      go.onclick = function () {
        var u = iu.value.trim(), p = ip.value;
        if (!u || !p) { m.textContent = L('User ID (या Mobile) और Password दोनों लिखें।', 'Enter both User ID (or mobile) and password.'); return; }
        go.disabled = true; m.style.color = '#556'; m.textContent = L('⏳ जाँच हो रही है...', '⏳ Checking...');
        base({ action: 'aclogin', userid: u, password: p, deviceId: devId() }).then(function (r) {
          if (r && r.status === 'ok') {
            if (window.__ekvAuth && window.__ekvAuth.saveAcct) window.__ekvAuth.saveAcct(r); else lsSet(AKEY, JSON.stringify({ mobile: r.mobile, token: r.token, level: r.level || 'pw', name: r.name || '', regId: r.regId || '' }));
            done(true);
          } else { m.style.color = '#c0392b'; m.textContent = (r && r.message) || L('Login नहीं हुआ।', 'Login failed.'); go.disabled = false; }
        }).catch(function () { m.style.color = '#c0392b'; m.textContent = L('Internet चेक करें।', 'Check your internet.'); go.disabled = false; });
      };
      ip.addEventListener('keydown', function (e) { if (e.key === 'Enter') go.onclick(); });
      setTimeout(function () { try { iu.focus(); } catch (e) {} }, 50);
    });
    return waiting;
  }
  window.vcSecurePost = async function (params) {
    var act = params && params.action;
    if (!act || !(EDIT.test(act) || REG.test(act))) return base(params);
    var r = await base(attach(params));
    if (r && (r.code === 'NEEDLOGIN' || r.code === 'RELOGIN')) {
      if (r.code === 'RELOGIN') { try { var o = acct(); o.token = ''; lsSet(AKEY, JSON.stringify(o)); } catch (e) {} }
      if (await popup()) r = await base(attach(params));
    }
    return r;
  };
})();
