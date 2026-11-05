'use strict';
/* anim.js : app.js보다 먼저 불러옵니다 (함수 선언만 있어요) */

/* ===== 잠금화면 플레이어 위젯 ===== */
function vWidget() {
  const t = S.wt, sub = hexA(t, .55), ph = S.wph, pct = ph || !S.tot ? 0 : S.el / S.tot * 100;
  const air = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${hexA(t, .55)}" stroke-width="1.800" stroke-linecap="round"><path d="M5.500 17.500A9 9 0 1 1 18.500 17.500"/><path d="M8.600 14.600A4.800 4.800 0 1 1 15.400 14.600"/><path d="M12 14.500l5.500 6h-11z" fill="${hexA(t, .55)}" stroke="none"/></svg>`;
  const ab = (h, l, tp) => `<span style="position:absolute;left:${l}px;top:${tp}px">${h}</span>`;
  return `<div class="wid ${S.round ? 'r' : ''}" style="background:${S.wbg}"><div class="wcard" style="background:${S.wc};color:${t}">
<div class="wcv" style="${img(S.cover)}"></div>
<div class="wti"><b>${esc(S.title)}</b><span style="color:${sub}">${esc(S.artist)}</span></div>
<div class="wdt" style="color:${hexA(t, .4)}">${S.wdots ? '······' : ''}</div>
<div class="wtl" style="color:${hexA(t, .75)}">${ph ? '–:––' : fmt(S.el)}</div><div class="wbar" style="background:${hexA(t, .35)}"><i style="width:${pct}%;background:${hexA(t, .85)}"></i></div><div class="wtr" style="color:${hexA(t, .75)}">${ph ? '--:--' : '-' + fmt(S.tot - S.el)}</div>
${ab(I.rew(t, 36), 95, 122)}${S.wplay ? ab(I.pause(t, 26), 178, 120) : ab(I.play(t, 40), 171, 115)}${ab(I.fwd(t, 36), 249, 122)}${ab(air, 331, 123)}</div></div>`;
}

/* ===== 내보내기 패널 ===== */
function expBox() {
  const d = el('div'), anim = S.mode === 'lyric' || S.mode === 'pad'; d.append(TG('round', '둥근 모서리로 저장 (PNG)'));
  if (anim) d.append(F('움직임 끝 줄 (현재 줄 → 끝 줄로 가사가 올라가요)', STP('aend', () => S.lyrics.split('\n').length - 1)), F('줄당 시간', RG('lt', 1, 6, .5, v => v + '초')), F('GIF 크기', SEG('gsc', [[.5, '작게'], [.75, '보통'], [1, '크게']])));
  const r = el('div', 'cvc'), b1 = el('button', 'btn pri', 'PNG 이미지'); b1.onclick = save; r.append(b1);
  if (anim) { const b2 = el('button', 'btn', 'GIF 움짤'), b3 = el('button', 'btn', '영상'); b2.onclick = () => exportAnim('gif'); b3.onclick = () => exportAnim('video'); r.append(b2, b3); }
  d.append(r); if (anim) d.append(el('div', 'hint', '움짤·영상은 가사 화면과 아이패드에서 만들 수 있어요.<br>영상은 사파리는 MP4, 크롬은 WebM이에요. 만드는 동안 창을 닫지 마세요.')); return d;
}

/* ===== 가사 애니메이션 ===== */
const easeIO = x => x * x * (3 - 2 * x);
const mp = t => { const e = $('#mp'); if (e) e.textContent = t; };
const tick = () => new Promise(r => setTimeout(r, 0));
async function prepAnim(sc) {
  const pad = S.mode === 'pad', w = pad ? 509 : 330, fs = pad ? S.pfs : S.fs, mb = Math.round(fs * .8), L = S.lyrics.split('\n'), n = L.length, a0 = S.cur, a1 = Math.min(n - 1, S.aend);
  if (a1 <= a0) throw new Error('range');
  const sh = L.map(t => blurLine(t || ' ', fs, w, 0, 1)), Y = [0]; sh.forEach((r, i) => Y.push(Y[i] + r.H + mb));
  const lv = (i, d) => { d = Math.min(d, 8); return d <= 0 ? sh[i] : blurLine(L[i] || ' ', fs, w, Math.min(1.5 + d * 1.1, 6), Math.max(.42 - d * .03, .22)); };
  mp('가사 준비 중...'); for (let i = 0; i < n; i++) { for (let d = 1; d <= Math.min(8, n); d++) lv(i, d); if (i % 2 === 0) await tick(); }
  mp('배경 만드는 중...');
  const h = el('div'); h.style.cssText = 'position:fixed;left:-99999px;top:0'; document.body.append(h); const rr = S.round; S.round = false; renderInto(h, false); S.round = rr;
  $('.ly', h).style.display = 'none'; await Promise.all([...h.querySelectorAll('img')].map(i => i.decode ? i.decode().catch(() => { }) : 0)); await new Promise(r => setTimeout(r, 100));
  const base = await html2canvas(h.firstElementChild, { scale: sc, backgroundColor: null, logging: false }); h.remove();
  const hold = .8, per = S.lt, tr = Math.min(.6, per * .4), total = hold + (a1 - a0) * per + 1, A = pad ? 256 : 205, X = pad ? 495 : 30, clip = pad ? [495, 0, 509, 768] : [30, 140, 330, 704];
  const posAt = t => { if (t < hold) return a0; const u = t - hold, k = Math.floor(u / per); if (k >= a1 - a0) return a1; const q = u - k * per, s = per - tr; return a0 + k + (q > s ? easeIO((q - s) / tr) : 0); };
  const draw = (ctx, t) => {
    const p = posAt(t), k = Math.min(Math.floor(p), n - 1), yp = Y[k] + (p - k) * (Y[k + 1] - Y[k]);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(base, 0, 0); ctx.setTransform(sc, 0, 0, sc, 0, 0); ctx.save(); ctx.beginPath(); ctx.rect(...clip); ctx.clip();
    for (let i = 0; i < n; i++) {
      const y = A + Y[i] - yp; if (y > clip[1] + clip[3] + 20 || y + sh[i].H < clip[1] - 20) continue;
      const d = Math.abs(i - p), lo = Math.floor(d), f = d - lo, put = (r, al) => { if (al <= 0) return; ctx.globalAlpha = al; ctx.drawImage(r.c, X - r.pd, y - r.pd, w + 2 * r.pd, r.H + 2 * r.pd); };
      if (lo >= 8) put(lv(i, 8), 1); else { put(lv(i, lo), 1 - f); put(lv(i, lo + 1), f); }
    }
    ctx.restore(); ctx.globalAlpha = 1;
  };
  return { W: base.width, H: base.height, total, draw };
}

/* ===== GIF 인코더 (직접 구현) ===== */
function makePalette(samples) {
  const hist = new Map(); samples.forEach(d => { const p = d.data; for (let i = 0; i < p.length; i += 16) { const k = (p[i] >> 3 << 10) | (p[i + 1] >> 3 << 5) | (p[i + 2] >> 3); hist.set(k, (hist.get(k) || 0) + 1); } });
  const boxes = [[...hist].map(([k, c]) => ({ r: k >> 10, g: (k >> 5) & 31, b: k & 31, c }))];
  while (boxes.length < 256) {
    let bi = -1, bs = 0; boxes.forEach((b, i) => { if (b.length < 2) return; const s = b.reduce((a, x) => a + x.c, 0); if (s > bs) { bs = s; bi = i; } }); if (bi < 0) break;
    const b = boxes[bi], rg = ch => { let mn = 31, mx = 0; b.forEach(x => { mn = Math.min(mn, x[ch]); mx = Math.max(mx, x[ch]); }); return mx - mn; };
    const ch = ['r', 'g', 'b'].sort((a, c) => rg(c) - rg(a))[0]; b.sort((x, y) => x[ch] - y[ch]); const tot = b.reduce((a, x) => a + x.c, 0); let acc = 0, m = 0;
    for (; m < b.length - 1; m++) { acc += b[m].c; if (acc >= tot / 2) break; } m = Math.min(m, b.length - 2); boxes.splice(bi, 1, b.slice(0, m + 1), b.slice(m + 1));
  }
  const pal = boxes.map(b => { const t = b.reduce((a, x) => a + x.c, 0) || 1; return ['r', 'g', 'b'].map(ch => Math.round(b.reduce((a, x) => a + x[ch] * x.c, 0) / t * 8 + 4)); });
  while (pal.length < 256) pal.push([0, 0, 0]); return pal;
}
const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function quant(d, pal, W, H, cache) {
  const p = d.data, out = new Uint8Array(W * H);
  for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
    const o = i * 4, t = (BAY[(y & 3) * 4 + (x & 3)] - 7.5) * .8, r = Math.max(0, Math.min(255, p[o] + t)) | 0, g = Math.max(0, Math.min(255, p[o + 1] + t)) | 0, b = Math.max(0, Math.min(255, p[o + 2] + t)) | 0, k = (r >> 3 << 10) | (g >> 3 << 5) | (b >> 3);
    let c = cache[k]; if (c < 0) { const cr = (k >> 10) * 8 + 4, cg = ((k >> 5) & 31) * 8 + 4, cb = (k & 31) * 8 + 4; let bd = 1e9; for (let j = 0; j < 256; j++) { const e = (pal[j][0] - cr) ** 2 + (pal[j][1] - cg) ** 2 + (pal[j][2] - cb) ** 2; if (e < bd) { bd = e; c = j; } } cache[k] = c; }
    out[i] = c;
  } return out;
}
function lzw(idx) {
  const mc = 8, clear = 256, eoi = 257, out = []; let size = 9, next = 258, dict = new Map(), cur = 0, bits = 0;
  const emit = c => { cur |= c << bits; bits += size; while (bits >= 8) { out.push(cur & 255); cur >>= 8; bits -= 8; } };
  emit(clear); let pre = idx[0];
  for (let i = 1; i < idx.length; i++) {
    const k = idx[i], key = pre << 8 | k, c = dict.get(key);
    if (c !== undefined) pre = c; else { emit(pre); if (next === 4096) { emit(clear); next = 258; size = 9; dict = new Map(); } else { if (next >= (1 << size)) size++; dict.set(key, next++); } pre = k; }
  }
  emit(pre); emit(eoi); if (bits > 0) out.push(cur & 255);
  const res = [mc]; for (let i = 0; i < out.length; i += 255) { const n = Math.min(255, out.length - i); res.push(n); for (let j = 0; j < n; j++) res.push(out[i + j]); } res.push(0); return new Uint8Array(res);
}
async function exportGif() {
  const sc = S.gsc, fps = 12, A = await prepAnim(sc), W = A.W, H = A.H, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d', { willReadFrequently: true });
  const N = Math.max(2, Math.round(A.total * fps)), samples = [];
  [0, .5, 1].forEach(f => { A.draw(ctx, A.total * f * .98); samples.push(ctx.getImageData(0, 0, W, H)); }); const pal = makePalette(samples), cache = new Int16Array(32768).fill(-1);
  const w16 = (o, n) => o.push(n & 255, (n >> 8) & 255), hd = [71, 73, 70, 56, 57, 97]; w16(hd, W); w16(hd, H); hd.push(0xF7, 0, 0); pal.forEach(c => hd.push(c[0], c[1], c[2])); hd.push(0x21, 0xFF, 11, ...'NETSCAPE2.0'.split('').map(c => c.charCodeAt(0)), 3, 1, 0, 0, 0);
  const parts = [new Uint8Array(hd)], delay = Math.round(100 / fps);
  for (let f = 0; f < N; f++) {
    A.draw(ctx, f / fps); const q = quant(ctx.getImageData(0, 0, W, H), pal, W, H, cache), g = [0x21, 0xF9, 4, 4]; w16(g, delay); g.push(0, 0, 0x2C); w16(g, 0); w16(g, 0); w16(g, W); w16(g, H); g.push(0);
    parts.push(new Uint8Array(g), lzw(q)); if (f % 2 === 0) { mp(`GIF 만드는 중... ${Math.round(f / N * 100)}%`); await tick(); }
  }
  parts.push(new Uint8Array([0x3B])); showResult(new Blob(parts, { type: 'image/gif' }), 'image/gif', 'gif');
}

/* ===== 영상 (MediaRecorder: 사파리 MP4 / 크롬 WebM) ===== */
async function exportVideo() {
  if (!window.MediaRecorder) throw new Error('이 브라우저는 영상 녹화를 지원하지 않아요');
  const mt = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t)) || '';
  const sc = S.mode === 'pad' ? 1.5 : 2, A = await prepAnim(sc), cv = document.createElement('canvas'); cv.width = A.W & ~1; cv.height = A.H & ~1; const ctx = cv.getContext('2d');
  cv.style.cssText = 'max-width:100%;max-height:60vh;border-radius:12px'; $('#modal').append(cv); A.draw(ctx, 0);
  const rec = new MediaRecorder(cv.captureStream(30), mt ? { mimeType: mt, videoBitsPerSecond: 8e6 } : { videoBitsPerSecond: 8e6 }), ch = [];
  rec.ondataavailable = e => e.data && e.data.size && ch.push(e.data);
  await new Promise(res => { rec.onstop = res; rec.start(); const t0 = performance.now(); const step = now => { const t = (now - t0) / 1000; A.draw(ctx, Math.min(t, A.total)); mp(`영상 녹화 중... ${Math.min(100, Math.round(t / A.total * 100))}%`); if (t < A.total) requestAnimationFrame(step); else setTimeout(() => rec.stop(), 200); }; requestAnimationFrame(step); });
  const type = (rec.mimeType || mt || 'video/webm').split(';')[0]; showResult(new Blob(ch, { type }), type, type.includes('mp4') ? 'mp4' : 'webm');
}
async function exportAnim(kind) {
  closePicker(); const m = $('#modal'); m.hidden = false; m.onclick = null; m.innerHTML = '<p id="mp">준비 중...</p>';
  try { await (kind === 'gif' ? exportGif() : exportVideo()); }
  catch (e) { closeModal(); alert(e.message === 'range' ? '움직임 끝 줄이 현재 줄보다 뒤에 있어야 해요.' : '만들지 못했어요: ' + e.message); }
}
