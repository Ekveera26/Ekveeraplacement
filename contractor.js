/* EkVeera — Contractor / Party Payment (website par) — हिसाब Server में (EkVeera_PartyPay.gs); यहाँ सिर्फ़ फॉर्म, जोड़ और बटन */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const T = s => (typeof __t === 'function' ? __t(s) : s);
  const inr = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const d10 = s => String(s || '').replace(/\D/g, '').slice(-10);
  const OTHER = '__other__';
  let RATES = [], last = null;
  function say(id, t, kind) { const el = $(id); if (!el) return; el.className = 'rent-msg' + (kind ? ' ' + kind : ''); el.textContent = t || ''; }
  async function api(o) { try { return await vcSecurePost(o); } catch (e) { return { status: 'error', message: T('इंटरनेट / Server की दिक्कत — थोड़ी देर बाद फिर कोशिश करें।') }; } }
  function payBtn(link, amount) {
    if (!link) return '<p class="rent-warn">' + esc(T('Payment Link अभी नहीं बन पाया — कृपया WhatsApp (9766284669) पर अपनी ID बताएँ।')) + '</p>';
    return '<a class="btn btn-primary rent-pay" href="' + esc(link) + '" target="_blank" rel="noopener">💳 ' + esc(T('अभी Pay करें')) + ' ' + inr(amount) + '</a>';
  }
  $('pType').onchange = function () { $('pTypeOtherBox').style.display = $('pType').value === OTHER || $('pType').value === 'Other' ? '' : 'none'; };

  /* ---------- Lines: Grade | संख्या | Rate | Total ---------- */
  function lineHtml(n) {
    return '<div class="rent-item"><div class="ri-h"><span>👷 ' + esc(T('Grade')) + ' ' + n + '</span>' + (n > 1 ? '<button type="button" class="ri-x" data-rm="1">✖ ' + esc(T('हटाएँ')) + '</button>' : '') + '</div><div class="rent-form">' +
      '<div class="full"><label>' + esc(T('Grade / काम')) + '</label><select class="pl-g"><option value="">' + esc(T('— चुनें —')) + '</option>' + RATES.map(r => '<option value="' + esc(r.work) + '">' + esc(r.work) + ' — ' + inr(r.rate) + '</option>').join('') + '<option value="' + OTHER + '">' + esc(T('अन्य (Other) — खुद लिखें')) + '</option></select></div>' +
      '<div class="full pl-ob" style="display:none"><label>' + esc(T('अपना Grade / काम लिखें')) + '</label><input class="pl-on" type="text" maxlength="60"></div>' +
      '<div><label>' + esc(T('कितने Candidate')) + '</label><input class="pl-n" type="number" inputmode="numeric" min="1" max="100000"></div>' +
      '<div><label>' + esc(T('Rate (₹ प्रति Candidate)')) + '</label><input class="pl-r" type="number" inputmode="decimal" min="1" readonly placeholder="' + esc(T('अपने-आप')) + '"></div>' +
      '<div class="full pl-t" style="font-weight:700;color:#11766F"></div></div></div>';
  }
  const box = $('pLines');
  function readLines() {
    return Array.prototype.map.call(box.children, el => {
      const g = el.querySelector('.pl-g').value, other = g === OTHER;
      return { work: other ? el.querySelector('.pl-on').value.trim() : g, people: el.querySelector('.pl-n').value, rate: el.querySelector('.pl-r').value, other: other };
    });
  }
  function recalc() {
    let tot = 0, ppl = 0;
    Array.prototype.forEach.call(box.children, (el, i) => {
      const g = el.querySelector('.pl-g').value, n = parseInt(el.querySelector('.pl-n').value, 10) || 0, rIn = el.querySelector('.pl-r');
      if (g && g !== OTHER) { const c = RATES.filter(r => r.work === g)[0]; rIn.value = c ? c.rate : ''; rIn.readOnly = true; }
      else if (g === OTHER) { rIn.readOnly = false; } else { rIn.value = ''; rIn.readOnly = true; }
      el.querySelector('.pl-ob').style.display = g === OTHER ? '' : 'none';
      const r = parseFloat(rIn.value) || 0, t = Math.round(r * n * 100) / 100;
      el.querySelector('.pl-t').textContent = (r && n) ? n + ' × ' + inr(r) + ' = ' + inr(t) : '';
      el.querySelector('.ri-h span').textContent = '👷 ' + T('Grade') + ' ' + (i + 1);
      tot += t; ppl += n;
    });
    $('pTotal').textContent = '🧾 ' + (ppl ? T('कुल') + ': ' + ppl + ' ' + T('Candidate') + ' = ' + inr(tot) : T('कुल: —'));
  }
  function addLine() { box.insertAdjacentHTML('beforeend', lineHtml(box.children.length + 1)); recalc(); }
  $('pAddLine').addEventListener('click', addLine);
  box.addEventListener('click', e => { const x = e.target.closest('[data-rm]'); if (x) { x.closest('.rent-item').remove(); recalc(); } });
  box.addEventListener('input', recalc); box.addEventListener('change', recalc);
  (async function () { const r = await api({ action: 'ptpubinfo' }); if (r && r.status === 'ok') RATES = r.rates || []; addLine(); })();

  /* ---------- Invoice बनाओ + Pay ---------- */
  window.ptpCreate = async function () {
    const v = id => $(id).value.trim(), lines = readLines();
    if (v('pName').length < 2) return say('pMsg', T('Party / Contractor का नाम लिखें।'), 'err');
    if (d10(v('pMobile')).length !== 10) return say('pMsg', T('10 अंकों का सही Mobile Number लिखें।'), 'err');
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i], pre = lines.length > 1 ? T('Grade') + ' ' + (i + 1) + ': ' : '';
      if (!l.work) return say('pMsg', pre + T('Grade / काम चुनें (या Other में लिखें)।'), 'err');
      if (!(parseInt(l.people, 10) >= 1)) return say('pMsg', pre + T('Candidate की सही संख्या लिखें।'), 'err');
      if (l.other && !(parseFloat(l.rate) > 0)) return say('pMsg', pre + T('Other के लिए अपना Rate (₹) लिखें।'), 'err');
    }
    if (!$('pTerms').checked) return say('pMsg', T('शर्तों पर ✔ लगाएँ।'), 'err');
    $('pBtn').disabled = true; say('pMsg', T('⏳ Invoice बनाया जा रहा है...'), '');
    const r = await api({ action: 'ptpubcreate', name: v('pName'), type: $('pType').value, typeOther: v('pTypeOther'), person: v('pPerson'), mobile: d10(v('pMobile')), email: v('pEmail'), gstin: v('pGst'), address: v('pAddr'),
      lines: JSON.stringify(lines), terms: '1', website: v('pWebsite') });
    $('pBtn').disabled = false;
    if (!r || r.status !== 'ok') return say('pMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err');
    say('pMsg', '', ''); last = { partyId: r.partyId, dueId: r.dueId, mobile: d10(v('pMobile')) };
    $('pdParty').textContent = r.partyId; $('pdDue').textContent = r.dueId; $('pdInv').textContent = r.invoiceNo;
    $('pdTable').innerHTML = '<table class="sf-tbl" style="width:100%"><tr><th>' + esc(T('Grade')) + '</th><th>' + esc(T('संख्या')) + '</th><th>Rate</th><th>' + esc(T('Total')) + '</th></tr>' +
      r.lines.map(l => '<tr><td>' + esc(l.work) + '</td><td>' + l.people + '</td><td>' + inr(l.rate) + '</td><td>' + inr(l.amount) + '</td></tr>').join('') +
      '<tr><td colspan="3"><b>' + esc(T('कुल')) + ' (' + r.people + ' ' + esc(T('Candidate')) + ')</b></td><td><b>' + inr(r.total) + '</b></td></tr></table>';
    $('pdPay').innerHTML = payBtn(r.payLink, r.total);
    $('pDone').style.display = 'block'; $('pDone').scrollIntoView({ behavior: 'smooth', block: 'center' });
    let n = 0; const iv = setInterval(async function () {
      if (++n > 120) return clearInterval(iv); if (document.hidden) return;
      const s = await api({ action: 'ptpubmy', partyId: last.partyId, mobile: last.mobile });
      const d = s && s.status === 'ok' ? s.dues.filter(x => x.dueId === last.dueId)[0] : null;
      if (d && d.status === 'Paid') { $('pdPay').innerHTML = '<div style="font-weight:800;color:#11766F;font-size:16px">✅ ' + esc(T('Payment मिल गई — धन्यवाद!')) + '</div>'; clearInterval(iv); }
    }, 6000);
  };
  window.ptpDownloadLast = function () { if (!last) return; window.ekvDownloadPartyInvoicePublic(last.partyId, last.mobile, last.dueId, (t, ok) => say('pdMsg', t, ok ? 'ok' : 'err')); };

  /* ---------- मेरा बकाया / Invoice ---------- */
  window.ptpMy = async function () {
    const pid = $('qParty').value.trim().toUpperCase(), mob = d10($('qMob').value);
    if (!pid || mob.length !== 10) return say('qMsg', T('Party ID और 10 अंकों का Mobile डालें।'), 'err');
    say('qMsg', T('⏳ देखा जा रहा है...'), '');
    const r = await api({ action: 'ptpubmy', partyId: pid, mobile: mob });
    if (!r || r.status !== 'ok') { $('qOut').innerHTML = ''; return say('qMsg', (r && r.message) || T('कुछ गड़बड़ हो गई।'), 'err'); }
    say('qMsg', '', '');
    if (!r.dues.length) { $('qOut').innerHTML = '<p>' + esc(T('अभी कोई Invoice नहीं है।')) + '</p>'; return; }
    $('qOut').innerHTML = '<div class="rent-detail"><h3>' + esc(r.partyId) + ' — ' + esc(r.name) + '</h3><table>' + r.dues.map(d =>
      '<tr><td>' + esc(d.dueId) + '<br><small>' + esc(d.invoiceNo) + '</small></td><td>' + d.people + ' ' + esc(T('Candidate')) + ' · ' + inr(d.amount) + ' · ' + (d.status === 'Paid' ? '✅ ' + esc(T('चुकता')) : esc(T('बाकी')) + ' ' + inr(d.balance)) +
      '<br>' + (d.payLink ? '<a class="btn btn-primary" style="padding:6px 12px;font-size:13px" href="' + esc(d.payLink) + '" target="_blank" rel="noopener">💳 ' + esc(T('Pay करें')) + '</a> ' : '') +
      '<button type="button" class="btn" style="padding:6px 12px;font-size:13px" data-inv="' + esc(d.dueId) + '">📄 ' + esc(T('Invoice Download')) + '</button></td></tr>').join('') + '</table><p id="qInvMsg" class="rent-msg"></p></div>';
    $('qOut').dataset.pid = r.partyId; $('qOut').dataset.mob = mob;
  };
  $('qOut').addEventListener('click', function (e) {
    const b = e.target.closest('[data-inv]'); if (!b) return;
    window.ekvDownloadPartyInvoicePublic($('qOut').dataset.pid, $('qOut').dataset.mob, b.getAttribute('data-inv'), (t, ok) => say('qInvMsg', t, ok ? 'ok' : 'err'));
  });
})();
