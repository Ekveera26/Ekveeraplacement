/* v26 — 🤖 EkVeera Sahayak: help page par AI se sawal-jawab (secret sawalon ka jawab server mana kar deta hai) */
(function () {
  'use strict';
  var root = document.getElementById('hcRoot'); if (!root || document.getElementById('aiHelpBox')) return;
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var en = lsGet('ekveera_lang') === 'en';
  function L(hi, e) { return en ? e : hi; }
  var cid = lsGet('ekv_ai_cid'); if (!cid) { cid = 'c' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36); lsSet('ekv_ai_cid', cid); }
  var box = document.createElement('div'); box.id = 'aiHelpBox';
  box.style.cssText = 'margin:0 0 20px;background:#fff;border:1.5px solid #cfe3e1;border-radius:14px;padding:14px;color:#172033';
  function mk(t, tx, st) { var e = document.createElement(t); if (tx) e.textContent = tx; if (st) e.style.cssText = st; return e; }
  box.appendChild(mk('h3', L('🤖 EkVeera Sahayak — कुछ भी पूछिए', '🤖 EkVeera Sahayak — ask anything'), 'margin:0 0 4px;color:#0B1F3A;font-size:17px'));
  box.appendChild(mk('p', L('App से जुड़ा कोई भी सवाल — Help में हो या न हो — यहाँ लिखिए। (Password, निजी या गोपनीय जानकारी नहीं बताई जाती।)', 'Any question about the app — in Help or not. (Passwords and private or confidential data are never shared.)'), 'margin:0 0 10px;font-size:13px;color:#556'));
  var log = mk('div', '', 'max-height:340px;overflow:auto;display:flex;flex-direction:column;gap:8px;margin-bottom:8px'); log.id = 'aiLog'; log.setAttribute('aria-live', 'polite');
  var row = mk('div', '', 'display:flex;gap:8px');
  var inp = mk('input', '', 'flex:1;min-width:0;padding:10px;border:1.5px solid #cbd5e1;border-radius:9px;font-size:15px'); inp.id = 'aiQ'; inp.maxLength = 400; inp.placeholder = L('अपना सवाल लिखें...', 'Type your question...');
  var go = mk('button', L('पूछें', 'Ask'), 'padding:10px 16px;border:0;border-radius:9px;background:#1F9D95;color:#fff;font-weight:700;cursor:pointer'); go.id = 'aiGo';
  row.appendChild(inp); row.appendChild(go); box.appendChild(log); box.appendChild(row);
  root.parentNode.insertBefore(box, root);
  var prev = null, busy = false;
  function bubble(t, me) { var b = mk('div', t, 'white-space:pre-wrap;line-height:1.55;font-size:14.5px;padding:9px 12px;border-radius:12px;max-width:92%;' + (me ? 'align-self:flex-end;background:#e8f4f3' : 'align-self:flex-start;background:#f3f5f9')); log.appendChild(b); log.scrollTop = log.scrollHeight; return b; }
  function ask() {
    var q = inp.value.trim(); if (!q || busy || typeof vcSecurePost !== 'function') return;
    busy = true; go.disabled = true; inp.value = ''; bubble(q, true);
    var w = bubble(L('⏳ सोच रहा हूँ...', '⏳ Thinking...'), false);
    var p = { action: 'askhelp', q: q, lang: en ? 'en' : 'hi', cid: cid }; if (prev) { p.pq = prev.q; p.pa = prev.a; }
    vcSecurePost(p).then(function (r) {
      var t = (r && (r.answer || r.message)) || L('अभी जवाब नहीं मिला — WhatsApp 9766284669 पर पूछें।', 'No answer right now — please WhatsApp 9766284669.');
      w.textContent = t; if (r && r.status === 'ok') prev = { q: q.slice(0, 300), a: t.slice(0, 600) };
    }).catch(function () { w.textContent = L('Internet चेक करके दोबारा कोशिश करें।', 'Check your internet and try again.'); })
      .then(function () { busy = false; go.disabled = false; log.scrollTop = log.scrollHeight; });
  }
  go.onclick = ask; inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') ask(); });
})();
