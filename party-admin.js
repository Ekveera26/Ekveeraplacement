/* EkVeera — Admin: Party / Contractor का बकाया + Invoice (Placement page → Admin panel)
   Party के साथ कई तरह के आदमी (Helper, Supervisor, Fitter, Welder...), हर तरह का अपना Rate; कुल = Σ (Rate × संख्या).
   सारा हिसाब Server (EkVeera_Party.gs) में है; यहाँ सिर्फ़ फॉर्म, सूची और बटन। Invoice Word file receipt.js बनाती है। */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function inr(n) { return '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
  function say(t, color) { var m = $('ptMsg'); if (!m) return; m.style.color = color || '#333'; m.textContent = t || ''; }
  function pw() { return window.ekveeraAdminPassword; }
  var parties = [], editId = '', payDue = '';
  var BADGE = { 'Open': ['#fdecea', '#a1281c', 'बकाया'], 'Part Paid': ['#fff3d6', '#8a5a00', 'आंशिक'], 'Paid': ['#e4f5ec', '#14673a', 'चुकता'], 'Closed': ['#eee', '#555', 'बंद'] };

  /* ---------- आदमियों की Lines का Editor ---------- */
  function lineRow(l) {
    l = l || {};
    var d = document.createElement('div');
    d.className = 'pt-line'; d.style.cssText = 'border:1px solid #cfe6e3;border-radius:8px;padding:8px;margin-bottom:8px;background:#fff;';
    d.innerHTML = '<div style="display:flex;gap:6px;flex-wrap:wrap;"><input class="pt-work" list="ptWorkList" type="text" maxlength="60" placeholder="' + esc(__t('काम / Post (जैसे Helper)')) + '" style="flex:2;min-width:130px;padding:7px;border:1px solid var(--line);border-radius:6px;">' +
      '<input class="pt-rate" type="number" min="1" step="0.01" placeholder="' + esc(__t('Rate ₹ / आदमी / दिन')) + '" style="flex:1;min-width:90px;padding:7px;border:1px solid var(--line);border-radius:6px;">' +
      '<input class="pt-people" type="number" min="1" step="1" placeholder="' + esc(__t('कितने आदमी')) + '" style="flex:1;min-width:90px;padding:7px;border:1px solid var(--line);border-radius:6px;">' +
      '<input class="pt-days" type="number" min="1" max="366" step="1" placeholder="' + esc(__t('कितने दिन')) + '" style="flex:1;min-width:80px;padding:7px;border:1px solid var(--line);border-radius:6px;">' +
      '<button type="button" class="pt-del" title="' + esc(__t('यह Line हटाएँ')) + '" style="border:1px solid var(--line);background:#fff;border-radius:6px;padding:0 10px;cursor:pointer;">✖</button></div>' +
      '<input class="pt-cands" type="text" maxlength="500" placeholder="' + esc(__t('Candidate ID (ज़रूरी नहीं, कॉमा से अलग — Invoice में नाम छपेंगे)')) + '" style="width:100%;margin-top:6px;padding:7px;border:1px solid var(--line);border-radius:6px;box-sizing:border-box;">' +
      '<div class="pt-rowtot" style="font-size:12.5px;color:#596579;margin-top:4px;"></div>';
    d.querySelector('.pt-work').value = l.work || ''; d.querySelector('.pt-rate').value = l.rate || ''; d.querySelector('.pt-people').value = l.people || ''; d.querySelector('.pt-days').value = l.days || 1; d.querySelector('.pt-cands').value = l.cands || '';
    return d;
  }
  function readLines() {
    return Array.prototype.map.call($('ptLines').querySelectorAll('.pt-line'), function (r) {
      return { work: r.querySelector('.pt-work').value.trim(), rate: r.querySelector('.pt-rate').value, people: r.querySelector('.pt-people').value, days: r.querySelector('.pt-days').value || 1, cands: r.querySelector('.pt-cands').value.trim() };
    });
  }
  function preview() {
    var tot = 0, ppl = 0;
    Array.prototype.forEach.call($('ptLines').querySelectorAll('.pt-line'), function (r) {
      var rate = parseFloat(r.querySelector('.pt-rate').value) || 0, n = parseInt(r.querySelector('.pt-people').value, 10) || 0, dy = parseInt(r.querySelector('.pt-days').value, 10) || 1, t = Math.round(rate * n * dy * 100) / 100;
      r.querySelector('.pt-rowtot').textContent = (rate && n) ? n + ' ' + __t('आदमी') + ' × ' + inr(rate) + ' × ' + dy + ' ' + __t('दिन') + ' = ' + inr(t) : '';
      tot += t; ppl += n;
    });
    $('ptPreview').textContent = ppl ? __t('कुल') + ': ' + ppl + ' ' + __t('आदमी') + ' = ' + inr(tot) + ($('ptBilling').value === 'monthly' && !editId ? ' ' + __t('(हर महीने)') : '') : '';
  }
  window.ptAddLine = function (l) { $('ptLines').appendChild(lineRow(l && l.work !== undefined ? l : null)); preview(); };
  window.ptExample = function () {
    $('ptLines').innerHTML = '';
    [{ work: 'Helper', rate: 500, people: 10, days: 26 }, { work: 'Supervisor', rate: 700, people: 2, days: 26 }, { work: 'Fitter', rate: 600, people: 4, days: 20 }, { work: 'Welder', rate: 800, people: 3, days: 15 }].forEach(function (l) { $('ptLines').appendChild(lineRow(l)); });
    preview(); say(__t('यह सिर्फ़ उदाहरण है — अपने असली Rate और संख्या भरें।'), '#a35c00');
  };
  document.addEventListener('input', function (e) { if (e.target.closest && e.target.closest('#ptLines')) preview(); });
  document.addEventListener('click', function (e) {
    var del = e.target.closest ? e.target.closest('.pt-del') : null;
    if (del) { var row = del.closest('.pt-line'); if (row) { row.remove(); preview(); } }
  });

  /* ---------- फॉर्म: नई Party / बदलाव ---------- */
  function showForm(edit) {
    $('ptForm').style.display = 'block'; $('ptPayForm').style.display = 'none';
    $('ptBillBox').style.display = edit ? 'none' : 'block'; $('ptName').disabled = !!edit; $('ptType').disabled = !!edit;
    $('ptSaveBtn').textContent = edit ? '💾 ' + __t('बदलाव सेव करें') : '💾 ' + __t('Party बनाएँ');
    $('ptFormTitle').textContent = edit ? '✏️ ' + edit.partyId + ' — ' + edit.name + ' · ' + __t('आदमी / Rate बदलें (अगले बकाये से लागू; पुराने बकाये और Invoice नहीं बदलेंगे)') : '➕ ' + __t('नई Party / Agreement');
    $('ptForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  window.ptBillingChanged = function () { $('ptMonthlyBox').style.display = $('ptBilling').value === 'monthly' ? 'block' : 'none'; preview(); };
  window.ptNew = function () {
    editId = ''; ['ptName', 'ptPerson', 'ptMobile', 'ptEmail', 'ptAddress', 'ptGstin', 'ptBillDay', 'ptEnd', 'ptNote'].forEach(function (k) { $(k).value = ''; });
    $('ptType').value = 'Placement Contractor'; $('ptBilling').value = 'once'; $('ptStart').value = new Date().toISOString().slice(0, 10); ptBillingChanged();
    $('ptLines').innerHTML = ''; ptAddLine(); showForm(null); say('');
  };
  window.ptCancel = function () { $('ptForm').style.display = 'none'; editId = ''; };
  function openEdit(id) {
    var p = parties.filter(function (x) { return x.partyId === id; })[0]; if (!p) return;
    editId = id; $('ptName').value = p.name; $('ptType').value = p.type || 'Other'; $('ptPerson').value = p.person; $('ptMobile').value = p.mobile; $('ptEmail').value = p.email; $('ptAddress').value = p.address; $('ptGstin').value = p.gstin; $('ptNote').value = p.note;
    $('ptLines').innerHTML = ''; (p.lines || []).forEach(function (l) { $('ptLines').appendChild(lineRow(l)); }); if (!(p.lines || []).length) ptAddLine();
    preview(); showForm(p); say('');
  }
  /* v18: Party बनने/बदलने का नतीजा साफ़ दिखे — बड़ा हरा Box (ID के साथ), और बाद की "सूची" वाली Request फेल हो तो भी वह मिटे नहीं */
  var saving = false;
  function showDone(html, ok) {
    var b = $('ptDone');
    if (!b) { b = document.createElement('div'); b.id = 'ptDone'; $('ptTotals').parentNode.insertBefore(b, $('ptTotals')); }
    b.style.cssText = 'margin:12px 0;padding:14px 16px;border-radius:12px;font-size:15px;font-weight:700;line-height:1.55;border:2px solid ' + (ok ? '#2e9b57' : '#c0392b') + ';background:' + (ok ? '#e7f7ee' : '#fdecea') + ';color:' + (ok ? '#14673a' : '#a1281c') + ';';
    b.innerHTML = html + '<div style="margin-top:6px"><button type="button" onclick="this.parentNode.parentNode.remove()" style="border:1px solid #cfd6e0;background:#fff;border-radius:8px;padding:4px 12px;font-size:12.5px;cursor:pointer">' + esc(__t('ठीक है')) + '</button></div>';
    try { b.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
  }
  function listNote(msg) {      // सूची न आए तो Success संदेश के नीचे हल्की चेतावनी जोड़ें (मिटाएँ नहीं)
    var b = $('ptDone'); if (!b) { var m0 = $('ptMsg'); if (m0 && m0.textContent) { m0.textContent += ' — ' + __t('(सूची अभी ताज़ा नहीं हो पाई, "बकाया सूची" बटन दबाएँ)'); return; } return say(msg || __t('सूची नहीं आ पाई।'), 'red'); }
    if (!b.querySelector('.pt-soft')) b.insertAdjacentHTML('afterbegin', '<div class="pt-soft" style="font-weight:600;font-size:13px;color:#8a5a00;margin-bottom:6px">' + esc(__t('⚠️ आपकी जानकारी सेव हो चुकी है, पर नीचे की सूची अभी ताज़ा नहीं हो पाई — "बकाया सूची" बटन दबाकर दोबारा देखें।')) + '</div>');
  }
  async function findParty(name) {      // Server का जवाब न आए तब जाँचें कि Party सच में बनी या नहीं
    for (var i = 0; i < 2; i++) {
      await new Promise(function (r) { setTimeout(r, i ? 3000 : 1500); });
      try {
        var d = await vcSecurePost({ action: 'partylist', password: pw() });
        if (d && d.status === 'ok') {
          parties = d.parties || [];
          var f = parties.filter(function (x) { return String(x.name || '').toLowerCase() === String(name || '').toLowerCase() && x.status === 'Active'; })[0];
          return f || null;
        }
        if (d && d.message) return { err: d.message };
      } catch (e) {}
    }
    return null;
  }
  window.ptSave = async function () {
    if (saving) return;
    var lines = readLines(), o = { password: pw(), lines: JSON.stringify(lines), person: $('ptPerson').value.trim(), mobile: $('ptMobile').value.trim(), email: $('ptEmail').value.trim(), address: $('ptAddress').value.trim(), gstin: $('ptGstin').value.trim(), note: $('ptNote').value.trim() };
    var wasEdit = !!editId;
    if (!editId) {
      o.action = 'partycreate'; o.name = $('ptName').value.trim(); o.type = $('ptType').value; o.billing = $('ptBilling').value; o.start = $('ptStart').value; o.billDay = $('ptBillDay').value; o.end = $('ptEnd').value;
      if (o.name.length < 2) return say(__t('Party का नाम लिखें।'), 'red');
    } else { o.action = 'partyupdate'; o.partyId = editId; }
    var ok = lines.filter(function (l) { return l.work && l.rate && l.people; });
    if (!ok.length) return say(__t('कम से कम एक पूरी Line भरें (काम, Rate, कितने आदमी)।'), 'red');
    if (ok.length !== lines.length) return say(__t('कोई Line अधूरी है — भरें या ✖ से हटा दें।'), 'red');
    saving = true; var btn = $('ptSaveBtn'), btnTxt = btn ? btn.textContent : ''; if (btn) { btn.disabled = true; btn.textContent = '⏳ ' + __t('सेव हो रहा है...'); }
    say(__t('⏳ सेव हो रहा है...'));
    function done() { saving = false; if (btn) { btn.disabled = false; btn.textContent = btnTxt; } }
    function saved(msg, pid) {
      $('ptForm').style.display = 'none'; editId = ''; say('');
      showDone('✅ ' + esc(wasEdit ? __t('बदलाव सेव हो गया।') : __t('नई Party बन गई!')) + (pid ? ' <span style="background:#fff;border-radius:8px;padding:2px 10px;border:1px solid #2e9b57">' + esc(pid) + '</span>' : '') + (msg ? '<div style="font-weight:600;font-size:13.5px;margin-top:4px">' + esc(msg) + '</div>' : ''), true);
      done(); ptLoad(true);
    }
    var d = null;
    try { d = await vcSecurePost(o); } catch (e) { d = null; }
    if (d && d.status === 'ok') return saved(d.message, d.partyId || editId);
    if (d) {      // Server ने साफ़ मना किया (जैसे गलत Password / नाम पहले से है) — वही वजह दिखाएँ
      var m = d.message || __t('सेव नहीं हो पाया।'), pwBad = /password|पासवर्ड|लॉक/i.test(m);
      showDone('❌ ' + esc(__t('Party नहीं बनी।')) + '<div style="font-weight:600;font-size:13.5px;margin-top:4px">' + esc(m) + (pwBad ? ' — ' + esc(__t('Admin Panel से Logout करके सही Password से दोबारा Login करें।')) : '') + '</div>', false);
      say(''); return done();
    }
    // जवाब ही नहीं आया (Internet / Server धीमा) — पर हो सकता है Party बन चुकी हो: जाँचकर बताएँ
    say(__t('⏳ Server का जवाब नहीं आया — जाँच रहे हैं कि Party बनी या नहीं...'));
    if (!wasEdit) {
      var f = await findParty(o.name);
      if (f && f.partyId) return saved(__t('(Server ने जवाब देर से दिया, पर जाँच में Party मिल गई।)'), f.partyId);
      if (f && f.err) { showDone('❌ ' + esc(f.err), false); say(''); return done(); }
    } else { await ptLoad(true); }
    showDone('⚠️ ' + esc(__t('Internet / Server से जवाब नहीं मिला, इसलिए पक्का नहीं कि सेव हुआ। नीचे की सूची में देखें — न दिखे तो दोबारा "Party बनाएँ" दबाएँ।')), false);
    say(''); done();
  };

  /* ---------- सूची ---------- */
  window.ptLoad = async function (keepMsg) {
    if (keepMsg !== true) say(__t('⏳ सूची आ रही है...'));
    try {
      var d = await vcSecurePost({ action: 'partylist', password: pw() });
      if (d.status !== 'ok') { if (keepMsg === true) return listNote(d.message); return say(d.message || __t('सूची नहीं आ पाई।'), 'red'); }
      parties = d.parties || []; var t = d.totals || {};
      $('ptTotals').innerHTML = t.outstanding > 0 ? '<span style="color:#a1281c;">💰 ' + esc(__t('कुल लेना बाकी')) + ': ' + esc(inr(t.outstanding)) + ' (' + esc(t.parties) + ' Party, ' + esc(t.openDues) + ' ' + esc(__t('बकाये')) + ')</span>' : '<span style="color:#14673a;">✅ ' + esc(__t('किसी Party का बकाया नहीं')) + '</span>';
      if (!parties.length) { $('ptList').innerHTML = ''; if (keepMsg !== true) say(__t('अभी कोई Party नहीं है। "➕ नई Party" से जोड़ें।'), '#596579'); return; }
      if (keepMsg !== true) say('');
      $('ptList').innerHTML = parties.map(cardHtml).join('');
      var sn = document.querySelector('#ptDone .pt-soft'); if (sn) sn.remove();
    } catch (e) { if (keepMsg === true) return listNote(); say(__t('Server से जवाब नहीं मिला।'), 'red'); }
  };
  function cardHtml(p) {
    var active = p.status === 'Active', lines = (p.lines || []).map(function (l) { return '<div style="display:flex;justify-content:space-between;gap:8px;"><span>' + esc(l.work) + ' — ' + esc(l.people) + ' × ' + esc(inr(l.rate)) + ' × ' + esc(l.days || 1) + ' ' + esc(__t('दिन')) + '</span><b>' + esc(inr(l.people * l.rate * (l.days || 1))) + '</b></div>'; }).join('');
    var dues = (p.dues || []).map(function (u) {
      var b = BADGE[u.status] || ['#eee', '#555', u.status], open = u.status === 'Open' || u.status === 'Part Paid';
      return '<div style="border-top:1px dashed #d9e1e8;padding:6px 0;"><b>' + esc(u.dueId) + '</b> · ' + esc(u.invoiceNo) + ' · ' + esc(u.period) + ' <span style="background:' + b[0] + ';color:' + b[1] + ';border-radius:99px;padding:1px 8px;font-size:11.5px;font-weight:700;">' + esc(__t(b[2])) + '</span><br>' +
        '<span style="color:#596579;font-size:12px;">' + esc(u.people) + ' ' + esc(__t('आदमी')) + ' · ' + esc(__t('कुल')) + ' ' + esc(inr(u.amount)) + ' · ' + esc(__t('मिले')) + ' ' + esc(inr(u.paid)) + ' · <b style="color:' + (u.balance > 0 ? '#a1281c' : '#14673a') + ';">' + esc(__t('बाकी')) + ' ' + esc(inr(u.balance)) + '</b>' + (open && u.ageDays ? ' · ' + esc(u.ageDays) + ' ' + esc(__t('दिन से')) : '') + '</span><div style="margin-top:4px;">' +
        '<button type="button" class="btn" style="padding:4px 10px;font-size:12px;border:1px solid var(--line);" data-pt-inv="' + esc(u.dueId) + '">🧾 Invoice</button> ' +
        (open ? '<button type="button" class="btn" style="padding:4px 10px;font-size:12px;border:1px solid var(--line);" data-pt-days="' + esc(u.dueId) + '">📆 ' + esc(__t('दिन बदलें')) + '</button> ' : '') +
        (open ? '<button type="button" class="btn btn-primary" style="padding:4px 10px;font-size:12px;" data-pt-pay="' + esc(u.dueId) + '" data-pt-bal="' + esc(u.balance) + '" data-pt-who="' + esc(p.name) + '">💵 ' + esc(__t('भुगतान')) + '</button> <button type="button" class="btn" style="padding:4px 10px;font-size:12px;border:1px solid var(--line);" data-pt-closedue="' + esc(u.dueId) + '">🗂 ' + esc(__t('बंद')) + '</button>' : '') + '</div></div>';
    }).join('');
    return '<div style="border:1px solid #d9e1e8;border-radius:10px;padding:10px;margin-bottom:10px;background:' + (active ? '#fff' : '#f6f6f6') + ';"><div><b>' + esc(p.name) + '</b> (' + esc(p.partyId) + ') · ' + esc(p.type) + ' ' +
      (active ? '' : '<span style="background:#eee;color:#555;border-radius:99px;padding:1px 8px;font-size:11.5px;font-weight:700;">' + esc(p.status === 'Completed' ? __t('पूरा') : __t('बंद')) + '</span>') + '</div>' +
      '<div style="color:#596579;font-size:12px;">' + esc(p.person) + (p.mobile ? ' · 📞 ' + esc(p.mobile) : '') + ' · ' + esc(p.billing === 'Monthly' ? __t('हर महीना') + (p.billDay ? ' (' + p.billDay + ' ' + __t('तारीख़') + ')' : '') : __t('एक बार')) + '</div>' +
      '<div style="margin:6px 0;padding:6px 8px;background:#f4f7fb;border-radius:6px;">' + (lines || '<i>' + esc(__t('कोई Line नहीं')) + '</i>') + '<div style="display:flex;justify-content:space-between;border-top:1px solid #d9e1e8;margin-top:4px;padding-top:4px;"><span>' + esc(p.totalPeople) + ' ' + esc(__t('आदमी')) + ' · ' + esc(__t('हर बार')) + '</span><b>' + esc(inr(p.perCycle)) + '</b></div></div>' +
      (p.outstanding > 0 ? '<div style="color:#a1281c;font-weight:700;">💰 ' + esc(__t('इस Party से लेना बाकी')) + ': ' + esc(inr(p.outstanding)) + '</div>' : '') + dues +
      '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">' + (active ? '<button type="button" class="btn" style="padding:5px 12px;font-size:12.5px;border:1px solid var(--line);" data-pt-edit="' + esc(p.partyId) + '">✏️ ' + esc(__t('आदमी / Rate बदलें')) + '</button> <button type="button" class="btn" style="padding:5px 12px;font-size:12.5px;background:#C0392B;color:#fff;" data-pt-closeparty="' + esc(p.partyId) + '" data-pt-out="' + esc(p.outstanding) + '">🔒 ' + esc(__t('Party बंद करें')) + '</button>' : '') + '</div></div>';
  }

  /* ---------- भुगतान / बंद / Invoice / Alert ---------- */
  document.addEventListener('click', async function (e) {
    var t = e.target.closest ? e.target : null; if (!t) return;
    var b;
    if ((b = t.closest('[data-pt-edit]'))) return openEdit(b.getAttribute('data-pt-edit'));
    if ((b = t.closest('[data-pt-pay]'))) {
      payDue = b.getAttribute('data-pt-pay'); $('ptPaySel').textContent = '💵 ' + payDue + ' — ' + b.getAttribute('data-pt-who') + ' · ' + __t('बाकी') + ' ' + inr(b.getAttribute('data-pt-bal'));
      $('ptPayAmt').value = b.getAttribute('data-pt-bal'); $('ptPayOn').value = new Date().toISOString().slice(0, 10); $('ptPayNote').value = '';
      $('ptPayForm').style.display = 'block'; $('ptForm').style.display = 'none'; $('ptPayForm').scrollIntoView({ behavior: 'smooth', block: 'center' }); return;
    }
    if ((b = t.closest('[data-pt-closedue]'))) { var id = b.getAttribute('data-pt-closedue'); if (!confirm(id + '\n' + __t('इस बकाये को बंद करें? बाकी रकम छोड़ दी जाएगी और इसका Alert आना बंद हो जाएगा।'))) return; return closeIt('due', id); }
    if ((b = t.closest('[data-pt-closeparty]'))) { var pid = b.getAttribute('data-pt-closeparty'), out = parseFloat(b.getAttribute('data-pt-out')) || 0; if (!confirm(pid + '\n' + (out > 0 ? __t('इस Party का') + ' ' + inr(out) + ' ' + __t('बकाया अभी बाकी है — बंद करने पर वह भी छोड़ दिया जाएगा।') + '\n' : '') + __t('Party बंद करें? आगे कोई नया बकाया नहीं बनेगा।'))) return; return closeIt('party', pid); }
    if ((b = t.closest('[data-pt-days]'))) return openDays(b.getAttribute('data-pt-days'), b.parentNode);
    if ((b = t.closest('[data-pt-dsave]'))) return saveDays(b.getAttribute('data-pt-dsave'), b.parentNode);
    if ((b = t.closest('[data-pt-dcancel]'))) { var bx = b.closest('.pt-dbox'); if (bx) bx.remove(); return; }
    if ((b = t.closest('[data-pt-inv]'))) {
      var old = b.textContent; b.disabled = true; b.textContent = '⏳'; say(__t('⏳ Invoice बन रहा है...'));
      await window.ekvDownloadPartyInvoice(b.getAttribute('data-pt-inv'), function (m, ok) { say(m, ok ? 'green' : 'red'); });
      b.disabled = false; b.textContent = old;
    }
  });
  /* बकाये के असली दिन बदलना — Candidate × Rate × दिन फिर से बनता है */
  async function openDays(dueId, host) {
    var old = host.querySelector('.pt-dbox'); if (old) { old.remove(); return; }
    say(__t('⏳ Lines देखी जा रही हैं...'));
    try {
      var d = await vcSecurePost({ action: 'partyinvoice', password: pw(), dueId: dueId });
      if (d.status !== 'ok') return say(d.message || __t('Lines नहीं मिलीं।'), 'red'); say('');
      var rows = (d.invoice.lines || []).map(function (l) {
        return '<div style="display:flex;gap:6px;align-items:center;margin:4px 0;flex-wrap:wrap;"><span style="flex:2;min-width:120px;">' + esc(l.work) + ' (' + esc(l.people) + ' × ' + esc(inr(l.rate)) + ')</span>' +
          '<input type="number" min="1" max="366" class="pt-dv" data-no="' + esc(l.no) + '" value="' + esc(l.days || 1) + '" style="width:80px;padding:6px;border:1px solid var(--line);border-radius:6px;"> <span>' + esc(__t('दिन')) + '</span></div>';
      }).join('');
      var box = document.createElement('div'); box.className = 'pt-dbox'; box.style.cssText = 'margin-top:6px;padding:8px;background:#fffbea;border:1px solid #f0d9a0;border-radius:8px;';
      box.innerHTML = '<div style="font-size:12.5px;color:#7a5a00;margin-bottom:4px;">' + esc(__t('हर Line के असली दिन लिखें — कुल रकम = आदमी × Rate × दिन।')) + '</div>' + rows +
        '<button type="button" class="btn btn-primary" style="padding:5px 12px;font-size:12.5px;" data-pt-dsave="' + esc(dueId) + '">✅ ' + esc(__t('सेव करें')) + '</button> <button type="button" class="btn" style="padding:5px 12px;font-size:12.5px;border:1px solid var(--line);" data-pt-dcancel="1">' + esc(__t('रद्द')) + '</button>';
      host.appendChild(box);
    } catch (e) { say(__t('Server से जवाब नहीं मिला।'), 'red'); }
  }
  async function saveDays(dueId, box) {
    var map = {}; Array.prototype.forEach.call(box.querySelectorAll('.pt-dv'), function (i) { map[i.getAttribute('data-no')] = i.value; });
    say(__t('⏳ सेव हो रहा है...'));
    try { var d = await vcSecurePost({ action: 'partydays', password: pw(), dueId: dueId, days: JSON.stringify(map) }); if (d.status !== 'ok') return say(d.message || __t('सेव नहीं हो पाया।'), 'red'); say('✅ ' + d.message, 'green'); ptLoad(true); }
    catch (e) { say(__t('Server से जवाब नहीं मिला।'), 'red'); }
  }
  async function closeIt(kind, id) {
    say(__t('⏳ बंद हो रहा है...'));
    try { var d = await vcSecurePost({ action: 'partyclose', password: pw(), kind: kind, id: id }); if (d.status !== 'ok') return say(d.message || __t('बंद नहीं हो पाया।'), 'red'); say('✅ ' + d.message, 'green'); ptLoad(true); }
    catch (e) { say(__t('Server से जवाब नहीं मिला।'), 'red'); }
  }
  window.ptPayCancel = function () { $('ptPayForm').style.display = 'none'; payDue = ''; };
  window.ptPaySave = async function () {
    if (!payDue) return say(__t('पहले बकाया चुनें।'), 'red');
    var amt = parseFloat($('ptPayAmt').value); if (!(amt > 0)) return say(__t('सही रकम (₹) लिखें।'), 'red');
    say(__t('⏳ दर्ज हो रहा है...'));
    try {
      var d = await vcSecurePost({ action: 'partypay', password: pw(), dueId: payDue, amount: amt, mode: $('ptPayMode').value, on: $('ptPayOn').value, note: $('ptPayNote').value.trim() });
      if (d.status !== 'ok') return say(d.message || __t('दर्ज नहीं हो पाया।'), 'red');
      say('✅ ' + d.message, 'green'); $('ptPayForm').style.display = 'none'; payDue = ''; ptLoad(true);
    } catch (e) { say(__t('Server से जवाब नहीं मिला।'), 'red'); }
  };
  window.ptAlert = async function () {
    say(__t('⏳ Alert भेजा जा रहा है...'));
    try { var d = await vcSecurePost({ action: 'partyalert', password: pw() }); say(d.status === 'ok' ? '✅ ' + d.message : (d.message || __t('Alert नहीं जा पाया।')), d.status === 'ok' ? 'green' : 'red'); }
    catch (e) { say(__t('Server से जवाब नहीं मिला।'), 'red'); }
  };
})();
