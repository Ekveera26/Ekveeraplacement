/* EkVeera — File ko 100 KB se chhota karna + Preview (ek jagah ka common code)
   -------------------------------------------------------------------------
   • Resume / Document / Photo ka size 100 KB se kam hona chahiye.
   • Photo (JPG/PNG/WebP): bina kaate, poori photo ko chhota (scale + quality) karke 100 KB ke andar laata hai.
   • Word (.docx): andar ki badi photos ko chhota karta hai (text/layout waisa hi rehta hai).
   • PDF: Browser mein PDF ko bina kharab kiye chhota karna mumkin nahi — isliye badi PDF par saaf sandesh deta hai.
   • Chhota karne ke baad file ka PREVIEW dikhata hai taaki Candidate khud dekh le ki file kahin se kati to nahi.
   • Preview mein Download / Save ka button nahi hota (view-only).
*/
(function (root) {
  'use strict';
  var MAX = 100 * 1024;          // 100 KB (kam se kam, isse upar file nahi jayegi)
  var TARGET = 97 * 1024;        // thoda margin, taaki base64/header ke baad bhi 100 KB se upar na jaye
  function t(s) { return (typeof root.__t === 'function') ? root.__t(s) : s; }
  function kb(n) { return Math.max(1, Math.round(n / 1024)) + ' KB'; }
  function ext(name) { var m = /\.([A-Za-z0-9]+)$/.exec(name || ''); return m ? m[1].toLowerCase() : ''; }
  function kind(file) {
    var e = ext(file.name), ty = file.type || '';
    if (/^image\//.test(ty) || /^(jpe?g|png|webp|gif|bmp)$/.test(e)) return 'image';
    if (ty === 'application/pdf' || e === 'pdf') return 'pdf';
    if (e === 'docx') return 'docx';
    if (e === 'doc') return 'doc';
    return 'other';
  }

  /* ---------- Image ---------- */
  function loadImg(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { URL.revokeObjectURL(u); res(im); };
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('img')); };
      im.src = u;
    });
  }
  function toBlob(canvas, type, q) { return new Promise(function (res) { canvas.toBlob(res, type, q); }); }

  /* Poori image (bina crop) ko JPEG mein, limit ke andar. Naya File lautata hai. */
  async function shrinkImage(file, limit) {
    limit = limit || TARGET;
    var im = await loadImg(file), w0 = im.naturalWidth || im.width, h0 = im.naturalHeight || im.height;
    var scale = Math.min(1, 1800 / Math.max(w0, h0)), floorEdge = 480, best = null;
    for (var round = 0; round < 14; round++) {
      var w = Math.max(1, Math.round(w0 * scale)), h = Math.max(1, Math.round(h0 * scale));
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);   // PNG ka transparent hissa safed
      g.imageSmoothingQuality = 'high'; g.drawImage(im, 0, 0, w, h);
      var qs = [0.88, 0.8, 0.72, 0.64, 0.56, 0.48, 0.4];
      for (var i = 0; i < qs.length; i++) {
        var b = await toBlob(c, 'image/jpeg', qs[i]);
        if (b && (!best || b.size < best.size)) best = b;
        if (b && b.size <= limit) {
          var nm = (file.name || 'photo').replace(/\.[A-Za-z0-9]+$/, '') + '.jpg';
          return new File([b], nm, { type: 'image/jpeg' });
        }
      }
      if (Math.max(w, h) <= floorEdge) break;
      scale *= 0.82;
    }
    return null;   // itna chhota nahi ho paya
  }

  /* ---------- Mini ZIP (docx ke andar ki photos chhoti karne ke liye) ---------- */
  var CRC_T = null;
  function crc32(u8) {
    if (!CRC_T) { CRC_T = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); CRC_T[n] = c >>> 0; } }
    var crc = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) crc = CRC_T[(crc ^ u8[i]) & 255] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  async function streamBytes(u8, Ctor, fmt) {
    var s = new Blob([u8]).stream().pipeThrough(new Ctor(fmt));
    return new Uint8Array(await new Response(s).arrayBuffer());
  }
  function haveStreams() { return typeof root.DecompressionStream === 'function' && typeof root.CompressionStream === 'function'; }

  async function readZip(buf) {
    var dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength), n = buf.length, eocd = -1;
    for (var i = n - 22; i >= Math.max(0, n - 22 - 65535); i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
    if (eocd < 0) throw new Error('zip');
    var count = dv.getUint16(eocd + 10, true), cdOff = dv.getUint32(eocd + 16, true), p = cdOff, out = [], dec = new TextDecoder();
    for (var e = 0; e < count; e++) {
      if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('zip');
      var flags = dv.getUint16(p + 8, true), method = dv.getUint16(p + 10, true), time = dv.getUint16(p + 12, true), date = dv.getUint16(p + 14, true);
      var csize = dv.getUint32(p + 20, true), usize = dv.getUint32(p + 24, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lho = dv.getUint32(p + 42, true);
      var name = dec.decode(buf.subarray(p + 46, p + 46 + nl));
      var ln = dv.getUint16(lho + 26, true), lx = dv.getUint16(lho + 28, true), ds = lho + 30 + ln + lx;
      out.push({ name: name, flags: flags, method: method, time: time, date: date, csize: csize, usize: usize, data: buf.subarray(ds, ds + csize) });
      p += 46 + nl + xl + cl;
    }
    return out;
  }
  async function entryBytes(en) {
    if (en.method === 0) return en.data;
    if (en.method === 8) return await streamBytes(en.data, root.DecompressionStream, 'deflate-raw');
    throw new Error('method');
  }
  async function writeZip(entries) {
    var enc = new TextEncoder(), parts = [], cd = [], off = 0;
    function u16(v) { return [v & 255, (v >>> 8) & 255]; } function u32(v) { return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; }
    for (var i = 0; i < entries.length; i++) {
      var en = entries[i], nm = enc.encode(en.name), crc = en.crc, comp = en.comp, method = en.method;
      var lh = new Uint8Array([0x50, 0x4b, 3, 4].concat(u16(20), u16(0x0800), u16(method), u16(en.time), u16(en.date), u32(crc), u32(comp.length), u32(en.raw), u16(nm.length), u16(0)));
      parts.push(lh, nm, comp);
      cd.push({ nm: nm, crc: crc, csize: comp.length, usize: en.raw, method: method, time: en.time, date: en.date, off: off });
      off += lh.length + nm.length + comp.length;
    }
    var cdStart = off, cdParts = [];
    cd.forEach(function (c) {
      var h = new Uint8Array([0x50, 0x4b, 1, 2].concat(u16(20), u16(20), u16(0x0800), u16(c.method), u16(c.time), u16(c.date), u32(c.crc), u32(c.csize), u32(c.usize), u16(c.nm.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(c.off)));
      cdParts.push(h, c.nm); off += h.length + c.nm.length;
    });
    var end = new Uint8Array([0x50, 0x4b, 5, 6].concat(u16(0), u16(0), u16(cd.length), u16(cd.length), u32(off - cdStart), u32(cdStart), u16(0)));
    return new Blob(parts.concat(cdParts, [end]), { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  /* docx ke andar word/media/ ki photos ko chhota karna (size ka sabse bada hissa wahi hota hai) */
  async function shrinkDocx(file, limit) {
    limit = limit || TARGET;
    if (!haveStreams()) return null;
    var buf = new Uint8Array(await file.arrayBuffer()), ents = await readZip(buf);
    var passes = [{ edge: 1400, q: 0.7 }, { edge: 1000, q: 0.6 }, { edge: 800, q: 0.5 }, { edge: 600, q: 0.42 }, { edge: 450, q: 0.35 }];
    var best = null;
    for (var pi = 0; pi < passes.length; pi++) {
      var ps = passes[pi], outEntries = [];
      for (var i = 0; i < ents.length; i++) {
        var en = ents[i], raw = await entryBytes(en), isMedia = /^word\/media\/[^/]+\.(jpe?g|png)$/i.test(en.name), method = 8, comp, data = raw;
        if (isMedia && !/\/$/.test(en.name)) {
          try {
            var isPng = /\.png$/i.test(en.name), blob = new Blob([raw], { type: isPng ? 'image/png' : 'image/jpeg' });
            var im = await loadImg(blob), w0 = im.naturalWidth, h0 = im.naturalHeight, sc = Math.min(1, ps.edge / Math.max(w0, h0));
            var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w0 * sc)); c.height = Math.max(1, Math.round(h0 * sc));
            var g = c.getContext('2d'); if (!isPng) { g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); } g.drawImage(im, 0, 0, c.width, c.height);
            var nb = await toBlob(c, isPng ? 'image/png' : 'image/jpeg', ps.q);
            var nbytes = new Uint8Array(await nb.arrayBuffer());
            if (isPng && nbytes.length > raw.length) nbytes = raw;      // PNG bada ho gaya to purana hi rakho
            data = nbytes;
          } catch (e) { data = raw; }
          method = 0;                                                    // photo pehle se compressed hai
          comp = data;
        } else if (data.length > 0 && !/\/$/.test(en.name)) {
          comp = await streamBytes(data, root.CompressionStream, 'deflate-raw');
          if (comp.length >= data.length) { comp = data; method = 0; }
        } else { comp = data; method = 0; }
        outEntries.push({ name: en.name, time: en.time, date: en.date, crc: crc32(data), raw: data.length, comp: comp, method: method });
      }
      var blob2 = await writeZip(outEntries);
      if (!best || blob2.size < best.size) best = blob2;
      if (blob2.size <= limit) break;
    }
    if (!best || best.size > limit) return null;
    return new File([best], file.name, { type: best.type });
  }

  /* ---------- Preview (sirf dekhne ke liye — Download ka button nahi) ---------- */
  function preview(file, info) {
    return new Promise(function (resolve) {
      var k = kind(file), url = URL.createObjectURL(file);
      var ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(8,16,30,.78);display:flex;align-items:center;justify-content:center;padding:12px;';
      var box = document.createElement('div');
      box.style.cssText = 'background:#fff;border-radius:14px;max-width:560px;width:100%;max-height:94vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.4);';
      var head = document.createElement('div'); head.style.cssText = 'padding:12px 16px;border-bottom:1px solid #e3e8ef;font-weight:700;color:#0B1F3A;font-size:15px;';
      head.textContent = (info && info.viewOnly) ? t('👁️ Resume Preview (सिर्फ़ देखने के लिए)') : t('👁️ फ़ाइल का Preview — पूरी फ़ाइल देख लें');
      var body = document.createElement('div'); body.style.cssText = 'padding:10px 14px;overflow:auto;flex:1;background:#f4f6fa;text-align:center;';
      body.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      if (k === 'image') {
        var im = document.createElement('img'); im.src = url; im.alt = 'preview'; im.draggable = false;
        im.style.cssText = 'max-width:100%;max-height:60vh;object-fit:contain;border-radius:8px;background:#fff;border:1px solid #d5dce6;-webkit-user-drag:none;user-select:none;';
        body.appendChild(im);
      } else if (k === 'pdf') {
        var fr = document.createElement('iframe'); fr.src = url + '#toolbar=0&navpanes=0&scrollbar=1&view=FitH'; fr.title = 'preview';
        fr.style.cssText = 'width:100%;height:60vh;border:1px solid #d5dce6;border-radius:8px;background:#fff;';
        body.appendChild(fr);
        var pn = document.createElement('p'); pn.style.cssText = 'font-size:12px;color:#5b6478;margin:8px 0 0;'; pn.textContent = t('अगर PDF यहाँ नहीं दिख रही (कुछ मोबाइल में), तो भी वह सही तरह जमा होगी।'); body.appendChild(pn);
      } else {
        var dd = document.createElement('div'); dd.style.cssText = 'padding:26px 10px;color:#334056;font-size:14px;line-height:1.6;';
        dd.innerHTML = '<div style="font-size:44px">📄</div><strong></strong><br><span></span>';
        dd.querySelector('strong').textContent = file.name; dd.querySelector('span').textContent = t('Word फ़ाइल का Preview Browser में नहीं बन सकता — फ़ाइल का नाम और साइज़ ऊपर दिख रहा है।');
        body.appendChild(dd);
      }
      var meta = document.createElement('div'); meta.style.cssText = 'padding:8px 16px;font-size:13px;color:#334056;border-top:1px solid #e3e8ef;line-height:1.5;';
      meta.textContent = (info && info.note) ? info.note : (t('साइज़: ') + kb(file.size));
      var warn = document.createElement('div'); warn.style.cssText = 'padding:0 16px 8px;font-size:12.5px;color:#9a5b00;';
      if (k === 'image' && !(info && info.viewOnly)) warn.textContent = t('✔ जाँचें: फोटो/Resume कहीं से कटा तो नहीं? पूरा दिख रहा हो तभी \"ठीक है\" दबाएं।');
      var acts = document.createElement('div'); acts.style.cssText = 'display:flex;gap:10px;padding:10px 14px 14px;flex-wrap:wrap;';
      var ok = document.createElement('button'); ok.type = 'button'; ok.textContent = t('✅ ठीक है, यही भेजें'); ok.style.cssText = 'flex:1;min-width:160px;padding:11px;border:0;border-radius:9px;background:#0B1F3A;color:#fff;font-weight:700;font-size:14px;cursor:pointer;';
      var no = document.createElement('button'); no.type = 'button'; no.textContent = t('❌ दूसरी फ़ाइल चुनें'); no.style.cssText = 'flex:1;min-width:160px;padding:11px;border:1px solid #cfd6e0;border-radius:9px;background:#fff;color:#0B1F3A;font-weight:600;font-size:14px;cursor:pointer;';
      function done(v) { try { URL.revokeObjectURL(url); } catch (e) {} ov.remove(); resolve(v); }
      ok.onclick = function () { done(true); }; no.onclick = function () { done(false); };
      if (info && info.viewOnly) { ok.textContent = t('बंद करें'); acts.appendChild(ok); } else { acts.appendChild(ok); acts.appendChild(no); }
      box.appendChild(head); box.appendChild(body); box.appendChild(meta); if (warn.textContent) box.appendChild(warn); box.appendChild(acts);
      ov.appendChild(box); document.body.appendChild(ov);
    });
  }

  /* ---------- Sab ek saath: file lo -> (zarurat ho to) chhota karo -> Preview -> final File ---------- */
  /* opts: { allow: ['image','pdf','docx','doc'], max: bytes, noPreview: bool }
     Lautata hai: { file } (final, <= max)  |  { error: 'sandesh' }  |  { cancelled: true } */
  async function process(file, opts) {
    opts = opts || {}; var max = opts.max || MAX, allow = opts.allow || ['image', 'pdf', 'docx', 'doc'];
    var k = kind(file);
    if (allow.indexOf(k) < 0) return { error: t('यह फ़ाइल नहीं चलेगी। सिर्फ़ ये चुनें: ') + allow.map(function (a) { return a === 'image' ? 'JPG/PNG' : a.toUpperCase(); }).join(', ') };
    var out = file, note = '';
    if (file.size > max) {
      var orig = file.size;
      try {
        if (k === 'image') out = await shrinkImage(file, Math.min(TARGET, max - 2048));
        else if (k === 'docx') out = await shrinkDocx(file, Math.min(TARGET, max - 2048));
        else out = null;
      } catch (e) { out = null; }
      if (!out || out.size > max) {
        if (k === 'pdf') return { error: t('यह PDF ') + kb(orig) + t(' की है और 100 KB से बड़ी है। PDF को Browser में बिना बिगाड़े छोटा नहीं किया जा सकता — कृपया (1) PDF की जगह Resume की साफ़ फोटो (JPG) चुनें, या (2) हमारे \"Resume बनाएं\" पेज से Resume बनाकर लगाएं, या (3) कोई PDF-Compress ऐप से PDF को 100 KB से छोटा करके दोबारा चुनें।') };
        if (k === 'doc') return { error: t('पुरानी .doc फ़ाइल 100 KB से बड़ी है। कृपया उसे .docx या PDF में सेव करके, या फोटो (JPG) के रूप में चुनें।') };
        return { error: t('फ़ाइल 100 KB से छोटी नहीं हो पा रही — कृपया कम साइज़ की / साफ़ और सरल फ़ाइल चुनें।') };
      }
      note = t('साइज़ घटाकर ') + kb(orig) + ' → ' + kb(out.size) + t(' किया गया (100 KB से कम)। पूरी फ़ाइल सुरक्षित है, कुछ कटा नहीं — नीचे खुद देख लें।');
    } else { note = t('साइज़: ') + kb(file.size) + t(' (100 KB से कम ✔)'); }
    if (!opts.noPreview) { var okk = await preview(out, { note: note }); if (!okk) return { cancelled: true }; }
    return { file: out, note: note };
  }

  /* ---------- Company/Candidate ke liye: sirf dekhne wala Viewer (base64 se) — Download button nahi ---------- */
  function viewOnly(mime, b64, title) {
    var bytes = Uint8Array.from(atob(b64), function (c) { return c.charCodeAt(0); }), blob = new Blob([bytes], { type: mime });
    return preview(new File([blob], title || 'resume', { type: mime }), { note: t('सिर्फ़ देखने के लिए — Download की सुविधा नहीं है।'), viewOnly: true }).then(function () { return true; });
  }

  root.EKV_FILES = { MAX: MAX, TARGET: TARGET, kind: kind, shrinkImage: shrinkImage, shrinkDocx: shrinkDocx, preview: preview, process: process, viewOnly: viewOnly, _zip: { readZip: readZip, writeZip: writeZip, crc32: crc32 } };
})(typeof window !== 'undefined' ? window : globalThis);
