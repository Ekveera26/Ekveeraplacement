/* EkVeera — Fee Receipt (MS Word .docx)
   Company अपनी Company ID + Contact Mobile डालकर अपनी हर Paid Request की Receipt Word में Download करती है।
   Word file Browser में ही बनती है (docx.min.js, इसी site से) — ज़रूरत पड़ने पर ही लोड होती है।
   Receipt हमेशा English में बनती है (Standard Business Format), ताकि Company अपने Accounts में लगा सके। */
(function () {
  'use strict';

  var ORG = {
    name: 'EkVeera Placement & Consulting Services',
    short: 'EPCS',
    tagline: 'Connecting Talent With Opportunity',
    head: 'Head Office: Vivek Nagar, Ward No. 19, Rewa Road, Maihar, Madhya Pradesh – 485771',
    sub: 'Sub Office: Ground Floor, New Meet Market, Raniganj, Panna, Madhya Pradesh – 488001',
    phone: '9766284669 / 9174777074',
    email: 'ekveeraplacement26@gmail.com',
    web: 'https://ekveera26.github.io/Ekveeraplacement/'
  };
  var PRICE_POST = 99, PRICE_CAND = 29;
  var NAVY = '0B1F3A', TEAL = '11766F', LIGHT = 'E9F2F8', GREY = '5A6577';

  var state = { data: null, paid: [] };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function msg(t, ok) { var m = $('invoiceMsg'); if (!m) return; m.style.color = ok ? 'green' : '#C0392B'; m.textContent = t; }

  /* ---------- छोटे हेल्पर ---------- */
  function money(n) { return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function parseDate(s) {
    var m = String(s || '').match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
    return m ? new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0)) : null;
  }
  function fmtDate(d, withTime) {
    if (!d) return '—';
    var mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
    var out = ('0' + d.getDate()).slice(-2) + ' ' + mon + ' ' + d.getFullYear();
    if (withTime) out += ', ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    return out;
  }
  function finYear(d) {
    var y = d.getFullYear(), s = d.getMonth() >= 3 ? y : y - 1;
    return s + '-' + String(s + 1).slice(-2);
  }
  function words(n) {                     // भारतीय पद्धति: Lakh / Crore
    n = Math.floor(Number(n) || 0);
    if (n === 0) return 'Zero';
    var a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    var b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    function two(x) { return x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : ''); }
    function three(x) { var h = Math.floor(x / 100), r = x % 100; return (h ? a[h] + ' Hundred' + (r ? ' ' : '') : '') + (r ? two(r) : ''); }
    var out = [], cr = Math.floor(n / 10000000), lk = Math.floor(n / 100000) % 100, th = Math.floor(n / 1000) % 100, rest = n % 1000;
    if (cr) out.push(three(cr) + ' Crore'); if (lk) out.push(two(lk) + ' Lakh'); if (th) out.push(two(th) + ' Thousand'); if (rest) out.push(three(rest));
    return out.join(' ');
  }

  /* ---------- Receipts की सूची ---------- */
  async function loadReceipts() {
    var cid = ($('invoiceCompanyId').value || '').trim(), mob = ($('invoiceMobile').value || '').replace(/\D/g, '');
    var list = $('invoiceList'); if (list) list.innerHTML = '';
    if (!cid) { msg(__t('कृपया अपनी Company ID डालें।'), false); return; }
    if (mob.length < 10) { msg(__t('Requirement फॉर्म में दिया Contact Mobile (10 अंक) डालें।'), false); return; }
    msg(__t('तैयार किया जा रहा है...'), true); $('invoiceMsg').style.color = '#333';
    try {
      var data = await vcSecurePost({ action: 'getinvoice', companyId: cid, mobile: mob });
      if (data.status !== 'ok') { msg(data.message || __t('इस Company ID से कोई Payment Record नहीं मिला।'), false); return; }
      state.data = data;
      state.paid = (data.results || []).filter(function (r) { return String(r['Status']).toLowerCase() === 'approved'; });
      var pending = (data.results || []).length - state.paid.length;
      if (!state.paid.length) { msg(__t('अभी कोई Paid Request नहीं मिली — Payment Verify होने के बाद Receipt यहीं मिलेगी।'), false); return; }
      var html = '<div class="rc-list">';
      state.paid.forEach(function (r, i) {
        var ids = String(r['Candidate/Training IDs'] || '').split(',').filter(function (x) { return x.trim(); }).length;
        html += '<div class="rc-row"><div class="rc-info"><b>' + esc(r['Request ID']) + '</b> · ₹' + esc(money(r['Amount (₹)'])) +
          '<br><span>' + esc(r['Paid At'] || r['Date'] || '') + ' · ' + esc(r['Num Posts']) + ' Post · ' + ids + ' Candidate</span></div>' +
          '<button type="button" class="btn btn-primary rc-btn" onclick="downloadReceipt(' + i + ',this)">' + __t('⬇ Receipt (Word)') + '</button></div>';
      });
      html += '</div>';
      if (pending > 0) html += '<p class="rc-note">' + pending + __t(' Request की Payment अभी बाकी/Pending है — उसकी Receipt Payment के बाद मिलेगी।') + '</p>';
      list.innerHTML = html;
      msg(__t('✅ आपकी Paid Requests नीचे हैं — Receipt Download करें।'), true);
    } catch (err) {
      msg(__t('Server से जवाब नहीं मिल पाया — दोबारा कोशिश करें।'), false);
    }
  }

  /* ---------- docx लाइब्रेरी और Logo ---------- */
  function loadDocx() {
    if (window.docx) return Promise.resolve();
    return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = 'docx.min.js'; s.onload = res; s.onerror = function () { rej(new Error('docx')); }; document.head.appendChild(s); });
  }
  function loadLogo() {                    // logo.png हो तो Receipt के ऊपर लगाएं; न मिले तो बिना Logo के भी Receipt बन जाती है
    return new Promise(function (res) {
      try {
        var im = new Image();
        im.onload = function () {
          try {
            var c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
            c.getContext('2d').drawImage(im, 0, 0);
            var b = atob(c.toDataURL('image/png').split(',')[1]), u = new Uint8Array(b.length);
            for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
            res({ data: u, w: im.naturalWidth, h: im.naturalHeight });
          } catch (e) { res(null); }
        };
        im.onerror = function () { res(null); };
        im.src = 'logo.png?v=1';
      } catch (e) { res(null); }
    });
  }

  /* ---------- Word Receipt ---------- */
  function buildDoc(X, c, r, logo) {
    var W = 10466;                               // A4 (11906) − दोनों तरफ़ 720
    var FONT = { ascii: 'Calibri', hAnsi: 'Calibri', cs: 'Calibri', eastAsia: 'Calibri' };
    var none = { style: X.BorderStyle.NONE, size: 0, color: 'FFFFFF' }, noB = { top: none, bottom: none, left: none, right: none };
    var thin = { style: X.BorderStyle.SINGLE, size: 4, color: 'B7C2D0' }, allB = { top: thin, bottom: thin, left: thin, right: thin };
    function run(t, o) { return new X.TextRun(Object.assign({ text: t, font: FONT, size: 20 }, o || {})); }
    function para(ch, o) { return new X.Paragraph(Object.assign({ children: ch }, o || {})); }
    function cell(children, w, o) { return new X.TableCell(Object.assign({ children: children, width: { size: w, type: X.WidthType.DXA }, margins: { top: 60, bottom: 60, left: 110, right: 110 } }, o || {})); }
    function tbl(widths, rows, o) { return new X.Table(Object.assign({ width: { size: W, type: X.WidthType.DXA }, columnWidths: widths, rows: rows }, o || {})); }
    function shade(fill) { return { type: X.ShadingType.CLEAR, color: 'auto', fill: fill }; }
    function sp(after) { return para([], { spacing: { before: 0, after: after || 0 }, run: { size: 4 } }); }

    var posts = parseInt(r['Num Posts'], 10) || 0;
    var ids = String(r['Candidate/Training IDs'] || '').split(',').map(function (s) { return s.trim(); }).filter(String);
    var amount = Number(r['Amount (₹)']) || 0;
    var paidAt = parseDate(r['Paid At']) || parseDate(r['Date']) || new Date();
    var rcNo = ORG.short + '/RCPT/' + finYear(paidAt) + '/' + r['Request ID'];
    var kids = [];

    /* 1) Letterhead */
    var head = [
      para([run(ORG.name.toUpperCase(), { bold: true, size: 34, color: NAVY })], { alignment: X.AlignmentType.CENTER, spacing: { after: 20 } }),
      para([run(ORG.tagline, { italics: true, size: 21, color: TEAL })], { alignment: X.AlignmentType.CENTER, spacing: { after: 40 } }),
      para([run(ORG.head, { size: 18, color: GREY })], { alignment: X.AlignmentType.CENTER, spacing: { after: 0 } }),
      para([run(ORG.sub, { size: 18, color: GREY })], { alignment: X.AlignmentType.CENTER, spacing: { after: 0 } }),
      para([run('Phone: ' + ORG.phone + '   |   Email: ' + ORG.email, { size: 18, color: GREY })], { alignment: X.AlignmentType.CENTER, spacing: { after: 0 } }),
      para([run('Website: ' + ORG.web, { size: 18, color: GREY })], { alignment: X.AlignmentType.CENTER, spacing: { after: 0 } })
    ];
    if (logo) {
      var lh = 62, lw = Math.round(lh * logo.w / logo.h); if (lw > 110) { lw = 110; lh = Math.round(lw * logo.h / logo.w); }
      kids.push(tbl([1500, W - 1500], [new X.TableRow({ children: [
        cell([para([new X.ImageRun({ type: 'png', data: logo.data, transformation: { width: lw, height: lh } })], { alignment: X.AlignmentType.LEFT })], 1500, { borders: noB, margins: { top: 0, bottom: 0, left: 0, right: 0 }, verticalAlign: X.VerticalAlign.CENTER }),
        cell(head, W - 1500, { borders: noB, margins: { top: 0, bottom: 0, left: 0, right: 1500 } })
      ] })], { borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none } }));
    } else head.forEach(function (p) { kids.push(p); });
    kids.push(para([], { spacing: { before: 40, after: 100 }, run: { size: 4 }, border: { bottom: { style: X.BorderStyle.SINGLE, size: 18, color: TEAL, space: 4 } } }));

    /* 2) Title bar */
    kids.push(tbl([W - 2600, 2600], [new X.TableRow({ children: [
      cell([para([run('FEE RECEIPT', { bold: true, size: 30, color: 'FFFFFF' })])], W - 2600, { shading: shade(NAVY), borders: noB, verticalAlign: X.VerticalAlign.CENTER }),
      cell([para([run('PAID', { bold: true, size: 26, color: 'FFFFFF' })], { alignment: X.AlignmentType.RIGHT })], 2600, { shading: shade(TEAL), borders: noB, verticalAlign: X.VerticalAlign.CENTER })
    ] })]));
    kids.push(sp(100));

    /* 3) Receipt details */
    var lw1 = 1900, vw1 = Math.floor((W - 2 * lw1) / 2), vw2 = W - 2 * lw1 - vw1;
    function lab(t) { return cell([para([run(t, { bold: true, size: 19, color: NAVY })])], lw1, { borders: allB, shading: shade(LIGHT) }); }
    function val(t, w) { return cell([para([run(t || '—', { size: 20 })])], w, { borders: allB }); }
    kids.push(tbl([lw1, vw1, lw1, vw2], [
      new X.TableRow({ children: [lab('Receipt No.'), val(rcNo, vw1), lab('Receipt Date'), val(fmtDate(paidAt), vw2)] }),
      new X.TableRow({ children: [lab('Request ID'), val(r['Request ID'], vw1), lab('Payment Date & Time'), val(fmtDate(paidAt, true), vw2)] }),
      new X.TableRow({ children: [lab('Payment Reference ID'), val(r['Payment ID'], vw1), lab('Payment Mode'), val('Online (Razorpay: UPI / Card / Net Banking)', vw2)] })
    ]));
    kids.push(sp(110));

    /* 4) Received from */
    kids.push(para([run('RECEIVED FROM', { bold: true, size: 21, color: TEAL })], { spacing: { after: 40 }, keepNext: true }));
    kids.push(tbl([lw1, vw1, lw1, vw2], [
      new X.TableRow({ children: [lab('Company Name'), val(c.companyName, vw1), lab('Company ID'), val(c.companyId, vw2)] }),
      new X.TableRow({ children: [lab('Contact Person'), val(c.contactPerson, vw1), lab('City'), val(c.city, vw2)] }),
      new X.TableRow({ children: [lab('Paid By'), val(r['Paid By'], vw1), lab('Payment Status'), cell([para([run('PAID / RECEIVED', { bold: true, size: 20, color: '1B7F3B' })])], vw2, { borders: allB })] })
    ]));
    kids.push(sp(110));

    /* 5) Services table */
    kids.push(para([run('PARTICULARS', { bold: true, size: 21, color: TEAL })], { spacing: { after: 40 }, keepNext: true }));
    var cw = [700, W - 700 - 900 - 1500 - 1900, 900, 1500, 1900];
    function th(t, w, al) { return cell([para([run(t, { bold: true, size: 19, color: 'FFFFFF' })], { alignment: al || X.AlignmentType.LEFT })], w, { borders: allB, shading: shade(NAVY) }); }
    function td(t, w, al, o) { return cell([para([run(t, Object.assign({ size: 20 }, o || {}))], { alignment: al || X.AlignmentType.LEFT })], w, { borders: allB }); }
    var R = X.AlignmentType.RIGHT, Cn = X.AlignmentType.CENTER;
    var rows = [new X.TableRow({ tableHeader: true, children: [th('S.No', cw[0], Cn), th('Description of Service', cw[1]), th('Qty', cw[2], Cn), th('Rate (₹)', cw[3], R), th('Amount (₹)', cw[4], R)] })];
    rows.push(new X.TableRow({ cantSplit: true, children: [td('1', cw[0], Cn),
      cell([para([run('Company Registration & Job-Post Listing Fee', { bold: true, size: 20 })]), para([run('Charged per Post for listing the requirement and candidate search service', { size: 17, color: GREY })])], cw[1], { borders: allB }),
      td(String(posts), cw[2], Cn), td(money(PRICE_POST), cw[3], R), td(money(posts * PRICE_POST), cw[4], R)] }));
    rows.push(new X.TableRow({ cantSplit: true, children: [td('2', cw[0], Cn),
      cell([para([run('Candidate Information Access Fee', { bold: true, size: 20 })]), para([run('Charged per selected Candidate (full details: name, mobile, email & resume)', { size: 17, color: GREY })])], cw[1], { borders: allB }),
      td(String(ids.length), cw[2], Cn), td(money(PRICE_CAND), cw[3], R), td(money(ids.length * PRICE_CAND), cw[4], R)] }));
    var computed = posts * PRICE_POST + ids.length * PRICE_CAND;
    rows.push(new X.TableRow({ children: [cell([para([run('TOTAL AMOUNT RECEIVED', { bold: true, size: 22, color: NAVY })], { alignment: R })], W - cw[4], { borders: allB, shading: shade(LIGHT), columnSpan: 4 }),
      cell([para([run('₹ ' + money(amount), { bold: true, size: 22, color: NAVY })], { alignment: R })], cw[4], { borders: allB, shading: shade(LIGHT) })] }));
    kids.push(tbl(cw, rows));
    kids.push(para([run('Amount in words: ', { bold: true, size: 20 }), run('Rupees ' + words(amount) + ' Only', { size: 20 })], { spacing: { before: 80, after: 0 } }));
    if (Math.round(computed * 100) !== Math.round(amount * 100)) kids.push(para([run('Note: Total includes adjustments recorded against this Request.', { size: 17, italics: true, color: GREY })]));
    kids.push(sp(100));

    /* 6) Candidate IDs */
    kids.push(para([run('CANDIDATES SELECTED BY THE COMPANY  (' + ids.length + ')', { bold: true, size: 21, color: TEAL })], { spacing: { after: 40 }, keepNext: true }));
    var cols = 5, cwid = Math.floor(W / cols), idRows = [];
    for (var i = 0; i < ids.length; i += cols) {
      var cells = [];
      for (var j = 0; j < cols; j++) cells.push(cell([para([run(ids[i + j] || '', { size: 19 })], { alignment: Cn })], j === cols - 1 ? W - cwid * (cols - 1) : cwid, { borders: allB, shading: ids[i + j] ? undefined : shade('F7F9FB') }));
      idRows.push(new X.TableRow({ cantSplit: true, children: cells }));
    }
    var idW = []; for (var k = 0; k < cols; k++) idW.push(k === cols - 1 ? W - cwid * (cols - 1) : cwid);
    if (idRows.length) kids.push(tbl(idW, idRows));
    kids.push(para([run('Full candidate details were provided to the Company through the downloaded Excel after payment verification.', { size: 17, italics: true, color: GREY })], { spacing: { before: 50, after: 100 } }));

    /* 7) Terms */
    kids.push(para([run('TERMS & NOTES', { bold: true, size: 21, color: TEAL })], { spacing: { after: 30 }, keepNext: true }));
    ['This is a computer-generated receipt issued by ' + ORG.name + ' and is valid without a physical signature.',
     'The fee is towards listing and candidate-information services only. Selection, joining and salary are decided solely by the Company; EkVeera does not guarantee any hiring outcome.',
     'Candidate information is shared for the Company\'s own direct recruitment only. It must not be resold, shared or used by any placement agency, contractor or third party. Misuse will invite legal action.',
     'The fee is non-refundable once the candidate information has been delivered. For any query, quote the Receipt No. and Request ID above.'
    ].forEach(function (t, n) { kids.push(para([run((n + 1) + '.  ' + t, { size: 17, color: '333333' })], { spacing: { after: 20 }, alignment: X.AlignmentType.JUSTIFIED })); });
    kids.push(sp(140));

    /* 8) Signature */
    kids.push(tbl([W / 2, W / 2], [new X.TableRow({ children: [
      cell([para([run('Thank you for choosing EkVeera!', { bold: true, size: 20, color: NAVY })]), para([run('We wish you the best in your recruitment.', { size: 18, color: GREY })])], W / 2, { borders: noB, margins: { top: 0, bottom: 0, left: 0, right: 100 } }),
      cell([para([], { spacing: { before: 380 } }), para([run('For ' + ORG.name, { bold: true, size: 19, color: NAVY })], { alignment: R, border: { top: { style: X.BorderStyle.SINGLE, size: 6, color: '7A8699', space: 4 } } }), para([run('Authorised Signatory', { size: 18, color: GREY })], { alignment: R })], W / 2, { borders: noB, margins: { top: 0, bottom: 0, left: 0, right: 0 } })
    ] })], { borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none } }));

    return new X.Document({
      creator: ORG.name, title: 'Fee Receipt ' + rcNo, description: 'Fee Receipt — ' + c.companyName,
      styles: { default: { document: { run: { font: FONT, size: 20 } } } },
      sections: [{
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 600, bottom: 800, left: 720, right: 720 } } },
        footers: { default: new X.Footer({ children: [
          para([run(ORG.name + '  |  ' + ORG.phone + '  |  ' + ORG.email, { size: 16, color: '7A8699' })], { alignment: Cn, border: { top: { style: X.BorderStyle.SINGLE, size: 4, color: 'C9D2DE', space: 4 } } }),
          para([run('Receipt ' + rcNo + '  ·  Page ', { size: 16, color: '7A8699' }), new X.TextRun({ children: [X.PageNumber.CURRENT], font: FONT, size: 16, color: '7A8699' }), run(' of ', { size: 16, color: '7A8699' }), new X.TextRun({ children: [X.PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: '7A8699' })], { alignment: Cn })
        ] }) },
        children: kids
      }]
    });
  }

  async function downloadReceipt(i, btn) {
    var r = state.paid[i], c = state.data; if (!r || !c) return;
    var old = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = __t('⏳ Word file बन रही है...'); }
    try {
      await loadDocx();
      var logo = await loadLogo();
      var blob = await window.docx.Packer.toBlob(buildDoc(window.docx, c, r, logo));
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'EkVeera_Fee_Receipt_' + c.companyId + '_' + r['Request ID'] + '.docx';
      a.style.display = 'none'; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      msg(__t('✅ Receipt (Word .docx) Download हो गई — "Downloads" folder में देखें।'), true);
    } catch (err) {
      msg(__t('Word file नहीं बन पाई — Internet चेक करके दोबारा कोशिश करें।'), false);
    }
    if (btn) { btn.disabled = false; btn.textContent = old; }
  }

  window.loadReceipts = loadReceipts;
  window.downloadReceipt = downloadReceipt;
  window.EKV_RECEIPT = { buildDoc: buildDoc, words: words, finYear: finYear, parseDate: parseDate };   // जाँच के लिए
})();
