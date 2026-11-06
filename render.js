'use strict';
/* render.js : 모든 화면을 캔버스에 직접 그려요 (저장·움짤·영상도 같은 그림을 써서 화질이 깨지지 않아요) */
const DIM = { lyric: [390, 844], list: [390, 844], pad: [1024, 768], pod: [347, 600], widget: [404, 195] };
const R = { hits: [], press: null };
let needs = true; const dirty = () => { needs = true; }; const render = dirty;
const RED = '#fa2d48', IM = {};
function getImg(src) { if (!src) return null; let i = IM[src]; if (!i) { i = IM[src] = new Image(); i.onload = dirty; i.src = src; } return i.complete && i.naturalWidth ? i : null; }
const ease = x => x * x * (3 - 2 * x);

/* ---------- 그리기 도구 ---------- */
function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
const fillRR = (c, x, y, w, h, r, f) => { rr(c, x, y, w, h, r); c.fillStyle = f; c.fill(); };
function tx(c, s, x, y, o) {
  c.font = `${o.w || 400} ${o.s}px ${FONT}`; c.fillStyle = o.c; c.textAlign = o.a || 'left'; c.textBaseline = 'middle'; let t = String(s);
  if (o.m) { while (c.measureText(t).width > o.m && t.length > 1) t = t.slice(0, -1); if (t !== String(s)) t = t.trimEnd() + '…'; } c.fillText(t, x, y);
}
function pic(c, src, x, y, w, h, r, ph) {
  c.save(); rr(c, x, y, w, h, r); c.clip(); const im = getImg(src);
  if (im) { const k = Math.max(w / im.naturalWidth, h / im.naturalHeight), dw = im.naturalWidth * k, dh = im.naturalHeight * k; c.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); } else { c.fillStyle = ph || 'rgba(128,128,128,.35)'; c.fillRect(x, y, w, h); }
  c.restore();
}
const hit = (x, y, w, h, act, i, ex) => R.hits.push(Object.assign({ x, y, w, h, act, i }, ex));
const P2 = {}; const p2d = d => P2[d] || (P2[d] = new Path2D(d));
const Q = {
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  shuf: 'M1 5h4c5 0 6 10 11 10h4M1 15h4c2 0 3.5-1 4.5-2.5M13 7c1-1.2 2.2-2 4-2h3M20 1.5L23.5 5 20 8.5M20 11.5l3.5 3.5-3.5 3.5',
  rep: 'M4 7h14l-3-3M20 13H6l3 3', play: 'M3 1.5v15l13-7.5z',
  fwd: 'M1 2.5q0-2 2-.9l15 10.8q1.5 1.6 0 3.2L3 26.4q-2 1.1-2-.9zM20 2.5q0-2 2-.9l15 10.8q1.5 1.6 0 3.2L22 26.4q-2 1.1-2-.9z',
  wifi: 'M8.5 2.3c2.3 0 4.4.9 6 2.4l1.1-1.2A10.7 10.7 0 0 0 8.5.6C5.7.6 3.2 1.7 1.4 3.5l1.1 1.2a8.7 8.7 0 0 1 6-2.4zm0 3.7c1.3 0 2.5.5 3.4 1.3l1.1-1.2a7 7 0 0 0-9 0l1.1 1.2c.9-.8 2.1-1.3 3.4-1.3zm0 3.5c-.7 0-1.3.3-1.8.7l1.8 2 1.8-2c-.5-.4-1.1-.7-1.8-.7z',
  bolt: 'M6 0L0 7h4l-1 5 6-7H5z', home: 'M14 3L2 13h3v11h7v-7h4v7h7V13h3z',
  a1: 'M5.5 17.5A9 9 0 1 1 18.5 17.5', a2: 'M8.6 14.6A4.8 4.8 0 1 1 15.4 14.6', a3: 'M12 14.5l5.5 6h-11z',
  podp: 'M0 1h4v20H0zM6 11L18 1v20zM18 11L30 1v20z', radio: 'M9 9a7 7 0 0 0 0 10M19 9a7 7 0 0 1 0 10M5 5a13 13 0 0 0 0 18M23 5a13 13 0 0 1 0 18'
};
const ic = {
  fill(c, d, vw, vh, cx, cy, w, col, flip) { const s = w / vw; c.save(); c.translate(cx, cy); c.scale(flip ? -s : s, s); c.translate(-vw / 2, -vh / 2); c.fillStyle = col; c.fill(p2d(d)); c.restore(); },
  line(c, d, vw, vh, cx, cy, w, col, lw, fill) { const s = w / vw; c.save(); c.translate(cx, cy); c.scale(s, s); c.translate(-vw / 2, -vh / 2); c.lineWidth = lw; c.strokeStyle = col; c.lineCap = c.lineJoin = 'round'; if (fill) { c.fillStyle = fill; c.fill(p2d(d)); } c.stroke(p2d(d)); c.restore(); }
};
const iPlay = (c, x, y, w, k) => ic.fill(c, Q.play, 18, 18, x, y, w, k);
const iFwd = (c, x, y, w, k, fl) => ic.fill(c, Q.fwd, 38, 28, x, y, w, k, fl);
const iPause = (c, x, y, w, k) => { const h = w * 1.15, bw = w * .38; fillRR(c, x - w / 2, y - h / 2, bw, h, w * .08, k); fillRR(c, x + w / 2 - bw, y - h / 2, bw, h, w * .08, k); };
const iStar = (c, x, y, w, k, f) => ic.line(c, Q.star, 24, 24, x, y, w, k, 2, f ? k : null);
const iShuf = (c, x, y, w, k) => ic.line(c, Q.shuf, 26, 20, x, y, w, k, 2.4);
const iRep = (c, x, y, w, k) => ic.line(c, Q.rep, 24, 20, x, y, w, k, 2.2);
const iEll = (c, x, y, k, r = 1.6, g = 5.5) => [-1, 0, 1].forEach(i => { c.beginPath(); c.arc(x + i * g, y, r, 0, 7); c.fillStyle = k; c.fill(); });
const iAir = (c, x, y, w, k) => { ic.line(c, Q.a1, 24, 24, x, y, w, k, 1.8); ic.line(c, Q.a2, 24, 24, x, y, w, k, 1.8); ic.fill(c, Q.a3, 24, 24, x, y, w, k); };
const iList = (c, x, y, k) => { [0, 8, 16].forEach(o => { c.fillStyle = k; c.beginPath(); c.arc(x - 12, y - 8 + o, 2, 0, 7); c.fill(); c.fillRect(x - 6, y - 9.5 + o, 20, 3); }); };
function iTab(c, i, x, y, k) {
  c.save(); c.translate(x - 15, y - 15); c.scale(30 / 28, 30 / 28); c.fillStyle = c.strokeStyle = k; c.lineCap = 'round';
  if (i === 0) c.fill(p2d(Q.home));
  if (i === 1) [[3, 3], [15, 3], [3, 15], [15, 15]].forEach(([a, b]) => { rr(c, a, b, 10, 10, 2); c.fill(); });
  if (i === 2) { c.beginPath(); c.arc(14, 14, 2.5, 0, 7); c.fill(); c.lineWidth = 2.4; c.stroke(p2d(Q.radio)); }
  if (i === 3) { rr(c, 4, 12, 20, 12, 3); c.fill(); rr(c, 7, 7, 14, 3, 1.5); c.fill(); rr(c, 10, 2, 8, 3, 1.5); c.fill(); }
  if (i === 4) { c.lineWidth = 2.8; c.beginPath(); c.arc(12, 12, 8, 0, 7); c.stroke(); c.beginPath(); c.moveTo(18, 18); c.lineTo(25, 25); c.stroke(); }
  c.restore();
}

/* ---------- 상태바 ---------- */
function bat(c, x, y, col) {
  const p = S.batt / 100, f = S.chg ? '#34c759' : S.lowp ? '#ffd60a' : S.batt <= 20 ? '#ff3b30' : col;
  c.globalAlpha = .4; c.strokeStyle = col; c.lineWidth = 1; rr(c, x + .5, y + .5, 22, 12, 3.5); c.stroke(); c.globalAlpha = .45; fillRR(c, x + 24, y + 4.5, 1.5, 4, .75, col); c.globalAlpha = 1;
  fillRR(c, x + 2, y + 2, Math.max(2, 19 * p), 9, 2, f); if (S.chg) ic.fill(c, Q.bolt, 9, 12, x + 11.5, y + 6.5, 7, 'rgba(0,0,0,.65)');
}
function stat(c, col, xr, y, ipad) {
  let x = xr; bat(c, x - 27, y - 6.5, col); x -= 33;
  if (ipad) { tx(c, S.batt + '%', x, y, { s: 14, w: 600, c: col, a: 'right' }); c.font = `600 14px ${FONT}`; x -= c.measureText(S.batt + '%').width + 8; }
  if (S.net === 'wifi') { ic.fill(c, Q.wifi, 17, 12, x - 8.5, y, 17, col); x -= 23; }
  else if (S.net !== 'none') { const t = S.net === 'lte' ? 'LTE' : '5G'; c.font = `600 13px ${FONT}`; const w = c.measureText(t).width; tx(c, t, x, y, { s: 13, w: 600, c: col, a: 'right' }); x -= w + 6; }
  if (!ipad) for (let i = 0; i < 4; i++) { const h = [4, 6.5, 9, 12][i]; c.globalAlpha = i < S.sig ? 1 : .3; fillRR(c, x - 18 + i * 5, y + 6 - h, 3, h, 1, col); } c.globalAlpha = 1;
}
const clockStr = () => S.clock.h + ':' + p2(S.clock.m);
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], KOW = ['일', '월', '화', '수', '목', '금', '토'];
function dateStr() { const [y, m, d] = S.date.split('-').map(Number), w = new Date(y, m - 1, d).getDay(); return S.dfmt === 'ko' ? `${m}월 ${d}일 (${KOW[w]})` : `${DOW[w]} ${MON[m - 1]} ${d}`; }
const playing = () => S.mode === 'widget' ? S.wplay : S.play;
const lyP = () => { const n = S.lyr.length; if (S.cur >= n - 1) return Math.min(S.cur, n - 1); return S.cur + ease(Math.max(0, Math.min(1, (S.lsec - (S.lineSec - .5)) / .5))); };

/* ---------- 가사 ---------- */
function lyrics(c, x, A, clip, w, fs) {
  const L = S.lyr, n = L.length, p = lyP(), mb = Math.round(fs * .8), sh = L.map(t => blurLine(t || ' ', fs, w, 0, 1)), Y = [0]; sh.forEach((r, i) => Y.push(Y[i] + r.H + mb));
  const lv = (i, d) => { d = Math.min(d, 8); return d <= 0 ? sh[i] : blurLine(L[i] || ' ', fs, w, Math.min(1.5 + d * 1.1, 6), Math.max(.42 - d * .03, .22)); };
  const k = Math.min(Math.floor(p), n - 1), yp = Y[k] + (p - k) * (Y[k + 1] - Y[k]);
  c.save(); c.beginPath(); c.rect(...clip); c.clip();
  for (let i = 0; i < n; i++) {
    const y = A + Y[i] - yp; if (y > clip[1] + clip[3] + 20 || y + sh[i].H < clip[1] - 20) continue;
    const d = Math.abs(i - p), lo = Math.floor(d), f = d - lo, put = (r, al) => { if (al <= 0) return; c.globalAlpha = al; c.drawImage(r.c, x - r.pd, y - r.pd, w + 2 * r.pd, r.H + 2 * r.pd); };
    if (lo >= 8) put(lv(i, 8), 1); else { put(lv(i, lo), 1 - f); put(lv(i, lo + 1), f); } c.globalAlpha = 1; hit(x, Math.max(y, clip[1]), w, sh[i].H, 'line', i);
  }
  c.restore();
}
function blobs(c, w, h, list) {
  const m = [S.c1, S.c2, S.c3].map(rgb), av = [0, 1, 2].map(i => m.reduce((s, v) => s + v[i], 0) / 3); c.fillStyle = hex(av[0] * .28, av[1] * .28, av[2] * .28); c.fillRect(0, 0, w, h);
  const Rr = Math.max(w, h); list.forEach(([px, py, r, col]) => { const g = c.createRadialGradient(w * px, h * py, 0, w * px, h * py, Rr * r); g.addColorStop(0, hexA(col, 1)); g.addColorStop(1, hexA(col, 0)); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  c.fillStyle = 'rgba(0,0,0,.16)'; c.fillRect(0, 0, w, h);
}
const circ = (c, x, y, r, f) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = f; c.fill(); };

/* ---------- 화면들 ---------- */
function sceneLyric(c) {
  blobs(c, 390, 844, [[0, .58, .65, S.c1], [1, .9, .6, S.c2], [.85, .05, .5, S.c3]]);
  if (S.sbar) { tx(c, clockStr(), 34, 28, { s: 16, w: 600, c: '#fff' }); stat(c, '#fff', 360, 28); }
  fillRR(c, 177, 50, 36, 5, 2.5, 'rgba(255,255,255,.5)'); pic(c, S.cover, 30, 75, 56, 56, 6); hit(30, 75, 56, 56, 'play');
  tx(c, S.title, 100, 94, { s: 17, w: 600, c: '#fff', m: S.star ? 180 : 220 }); tx(c, S.artist, 100, 114, { s: 17, c: 'rgba(255,255,255,.6)', m: S.star ? 180 : 220 });
  circ(c, 344, 103, 16, 'rgba(255,255,255,.25)'); iEll(c, 344, 103, '#fff');
  if (S.star) { circ(c, 302, 103, 16, 'rgba(255,255,255,.25)'); iStar(c, 302, 103, 16, '#fff', S.fav); hit(286, 87, 32, 32, 'fav'); }
  lyrics(c, 30, 205, [30, 140, 330, 704], 330, S.fs);
}
function sceneList(c) {
  const dk = S.dark, fg = dk ? '#fff' : '#000', k = S.lfs / 100, sub = '#8e8e93', ln = dk ? '#2c2c2e' : '#e5e5ea';
  c.fillStyle = dk ? '#000' : '#fff'; c.fillRect(0, 0, 390, 844);
  if (S.sbar) { tx(c, clockStr(), 34, 28, { s: 16, w: 600, c: fg }); stat(c, fg, 360, 28); }
  c.save(); c.shadowColor = 'rgba(0,0,0,.22)'; c.shadowBlur = 34; c.shadowOffsetY = 14; fillRR(c, 72, 56, 246, 246, 12, '#d8d8dc'); c.restore(); pic(c, S.cover, 72, 56, 246, 246, 12, '#d8d8dc');
  tx(c, S.lname, 195, 334, { s: 20 * k, w: 700, c: fg, a: 'center', m: 350 }); tx(c, S.lart, 195, 364, { s: 19 * k, c: sub, a: 'center', m: 350 }); tx(c, S.upd, 195, 390, { s: 12 * k, w: 600, c: sub, a: 'center' });
  [[20, 'playall', 0, '재생'], [199, 'shufall', 1, '임의 재생']].forEach(([x, a, s, lb]) => {
    fillRR(c, x, 412, 171, 42, 12, dk ? '#1c1c1e' : '#f2f2f7'); c.font = `600 ${15 * k}px ${FONT}`; const w = c.measureText(lb).width, x0 = x + (171 - (28 + w)) / 2;
    s ? iShuf(c, x0 + 10, 433, 20, RED) : iPlay(c, x0 + 8, 433, 16, RED); tx(c, lb, x0 + 28, 433, { s: 15 * k, w: 600, c: RED }); hit(x, 412, 171, 42, a);
  });
  c.save(); c.beginPath(); c.rect(0, 476, 390, 284); c.clip(); c.fillStyle = ln; c.fillRect(0, 476, 390, 1);
  S.tracks.forEach((t, i) => {
    const y = 477 + i * 62; pic(c, t.img || (i === S.np - 1 ? S.cover : ''), 20, y + 7, 48, 48, 5, '#e5e5ea');
    tx(c, t.t, 82, y + 23, { s: 16 * k, c: fg, m: 250 }); tx(c, t.a, 82, y + 43, { s: 16 * k, c: sub, m: 250 }); iEll(c, 368, y + 31, dk ? '#fff' : '#222'); c.fillStyle = ln; c.fillRect(82, y + 61, 308, 1); hit(0, y, 390, 62, 'row', i);
  }); c.restore();
  const np = S.tracks[S.np - 1];
  if (np) {
    c.save(); c.shadowColor = 'rgba(0,0,0,.2)'; c.shadowBlur = 20; c.shadowOffsetY = 2; fillRR(c, 12, 704, 366, 56, 18, dk ? '#2c2c2e' : '#fff'); c.restore();
    pic(c, np.img || S.cover, 20, 712, 40, 40, 6, '#999'); tx(c, np.t, 68, 732, { s: 16 * k, w: 500, c: fg, m: 190 });
    S.play ? iPause(c, 295, 732, 17, fg) : iPlay(c, 295, 732, 19, fg); hit(273, 710, 44, 44, 'play'); iFwd(c, 347, 732, 29, fg); hit(325, 710, 44, 44, 'next');
  }
  c.fillStyle = dk ? '#121214' : 'rgba(248,248,250,.96)'; c.fillRect(0, 760, 390, 84); c.fillStyle = ln; c.fillRect(0, 760, 390, 1);
  for (let i = 0; i < 5; i++) iTab(c, i, 39 + i * 78, 787, i === 3 ? RED : '#8e8e93');
}
function scenePad(c) {
  blobs(c, 1024, 768, [[.1, 1, .75, S.c1], [.95, .72, .6, S.c2], [.6, 0, .5, S.c3]]); const pc = S.pclock;
  tx(c, `${pc.h}:${p2(pc.m)} ${pc.ap}   ${dateStr()}`, 14, 18, { s: 14, w: 600, c: '#fff' }); stat(c, '#fff', 1010, 18, true); fillRR(c, 494, 32, 36, 5, 2.5, 'rgba(255,255,255,.45)');
  c.save(); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 30; c.shadowOffsetY = 10; fillRR(c, 50, 80, 356, 356, 8, '#555'); c.restore(); pic(c, S.cover, 50, 80, 356, 356, 8, 'rgba(255,255,255,.18)');
  tx(c, S.title, 50, 474, { s: 19, w: 600, c: '#fff', m: 250 }); tx(c, S.artist, 50, 498, { s: 19, c: 'rgba(255,255,255,.55)', m: 250 });
  circ(c, 390, 480, 16, 'rgba(255,255,255,.25)'); iEll(c, 390, 480, '#fff');
  if (S.star) { circ(c, 348, 480, 16, 'rgba(255,255,255,.25)'); iStar(c, 348, 480, 16, '#fff', S.fav); hit(332, 464, 32, 32, 'fav'); }
  const pct = S.tot ? S.el / S.tot : 0; fillRR(c, 50, 530, 356, 6, 3, 'rgba(255,255,255,.3)'); fillRR(c, 50, 530, Math.max(6, 356 * pct), 6, 3, 'rgba(255,255,255,.78)'); hit(44, 518, 368, 30, null, 0, { bar: 'el', bx: 50, bw: 356 });
  tx(c, fmt(S.el), 50, 556, { s: 11, c: 'rgba(255,255,255,.55)' }); tx(c, '-' + fmt(S.tot - S.el), 406, 556, { s: 11, c: 'rgba(255,255,255,.55)', a: 'right' });
  if (S.shuf) fillRR(c, 50, 589, 40, 38, 8, 'rgba(255,255,255,.28)'); iShuf(c, 70, 608, 24, '#fff'); hit(50, 589, 40, 38, 'shuf');
  iFwd(c, 150, 608, 44, '#fff', true); hit(124, 586, 52, 44, 'prev'); S.play ? iPause(c, 228, 608, 30, '#fff') : iPlay(c, 228, 608, 34, '#fff'); hit(202, 586, 52, 44, 'play'); iFwd(c, 306, 608, 44, '#fff'); hit(280, 586, 52, 44, 'next');
  if (S.rep) fillRR(c, 366, 589, 40, 38, 8, 'rgba(255,255,255,.28)'); iRep(c, 386, 608, 24, '#fff'); hit(366, 589, 40, 38, 'rep');
  fillRR(c, 50, 672, 356, 6, 3, 'rgba(255,255,255,.3)'); fillRR(c, 50, 672, Math.max(6, 356 * S.vol / 100), 6, 3, 'rgba(255,255,255,.78)'); hit(44, 660, 368, 30, null, 0, { bar: 'vol', bx: 50, bw: 356 });
  lyrics(c, 495, 256, [495, 0, 509, 768], 509, S.pfs);
}
function scenePod(c) {
  const b = S.podb, w = S.podw; let g = c.createLinearGradient(0, 0, 347, 0);
  [[0, shade(b, -.2)], [.18, shade(b, .05)], [.5, b], [.82, shade(b, .03)], [1, shade(b, -.22)]].forEach(([o, k]) => g.addColorStop(o, k)); fillRR(c, 0, 0, 347, 600, 34, g);
  c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1; rr(c, .5, .5, 346, 599, 34); c.stroke();
  c.save(); rr(c, 13, 13, 321, 250, 9); c.clip(); c.fillStyle = '#fff'; c.fillRect(13, 13, 321, 250);
  g = c.createLinearGradient(0, 15, 0, 37); g.addColorStop(0, '#f4f5f7'); g.addColorStop(.5, '#cfd3d8'); g.addColorStop(1, '#aab0b6'); c.fillStyle = g; c.fillRect(13, 13, 321, 24); c.fillStyle = '#8a8f94'; c.fillRect(13, 37, 321, 1);
  tx(c, S.bar, 21, 26, { s: 14, w: 700, c: '#000' });
  if (S.play) { c.fillStyle = '#7d7d7d'; c.beginPath(); c.moveTo(270, 20); c.lineTo(270, 32); c.lineTo(279, 26); c.fill(); } else { c.fillStyle = '#7d7d7d'; c.fillRect(270, 20, 3.5, 12); c.fillRect(276, 20, 3.5, 12); }
  const pl = S.batt / 100; fillRR(c, 290, 19, 32, 14, 3, '#e8e8e8'); c.strokeStyle = '#555'; c.lineWidth = 1; rr(c, 290.5, 19.5, 28, 13, 2.5); c.stroke(); fillRR(c, 319, 23, 2.5, 5, 1, '#555'); fillRR(c, 292, 21.5, Math.max(1, 25 * pl), 9, 1.5, S.chg ? '#58b838' : S.batt <= 20 ? '#e04040' : '#58b838');
  if (S.pshuf) iShuf(c, 268, 56, 26, '#8d8d8d'); iList(c, 300, 56, '#8d8d8d');
  c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 3; c.shadowOffsetX = 1; c.shadowOffsetY = 1; c.fillStyle = '#c8c8c8'; c.fillRect(27, 53, 98, 98); c.restore(); pic(c, S.cover, 27, 53, 98, 98, 0, '#c8c8c8');
  const im = getImg(S.cover); c.save(); c.beginPath(); c.rect(27, 151, 98, 46); c.clip(); if (im) { const k = Math.max(98 / im.naturalWidth, 98 / im.naturalHeight), dw = im.naturalWidth * k, dh = im.naturalHeight * k; c.translate(0, 151); c.scale(1, -1); c.drawImage(im, 27 + (98 - dw) / 2, -98 + (98 - dh) / 2, dw, dh); } c.restore();
  g = c.createLinearGradient(0, 151, 0, 197); g.addColorStop(0, 'rgba(255,255,255,.62)'); g.addColorStop(.9, '#fff'); c.fillStyle = g; c.fillRect(27, 151, 98, 46);
  tx(c, S.title, 153, 78, { s: 17, w: 700, c: '#000', m: 170 }); tx(c, S.artist, 153, 99, { s: 16, w: 600, c: '#8a8a8e', m: 170 }); tx(c, S.album, 153, 120, { s: 16, w: 600, c: '#8a8a8e', m: 170 });
  const pct = S.tot ? S.el / S.tot : 0; g = c.createLinearGradient(0, 219, 0, 229); g.addColorStop(0, '#f2f2f2'); g.addColorStop(1, '#fff'); c.fillStyle = g; c.fillRect(27, 219, 293, 10); c.strokeStyle = '#dcdcdc'; c.lineWidth = 1; c.strokeRect(27.5, 219.5, 292, 9);
  c.save(); c.shadowColor = '#5ab4f5'; c.shadowBlur = 3; c.fillStyle = '#5ab4f5'; c.fillRect(27 + Math.min(290, 290 * pct), 218, 3, 12); c.restore();
  tx(c, fmt(S.el), 27, 241, { s: 11, w: 700, c: '#333' }); tx(c, '-' + fmt(S.tot - S.el), 320, 241, { s: 11, w: 700, c: '#333', a: 'right' }); c.restore();
  c.strokeStyle = '#0a0a0a'; c.lineWidth = 2; rr(c, 14, 14, 319, 248, 8); c.stroke(); hit(21, 208, 305, 30, null, 0, { bar: 'el', bx: 27, bw: 293 });
  const cx = 173.5, cy = 393, wt = lum(w) > .5 ? '#8a8a8a' : '#e4e4e4'; c.fillStyle = w; c.beginPath(); c.arc(cx, cy, 125, 0, 7); c.fill(); c.strokeStyle = 'rgba(0,0,0,.14)'; c.lineWidth = 1; c.stroke();
  g = c.createRadialGradient(cx, cy, 0, cx, cy, 56); g.addColorStop(0, shade(w, -.03)); g.addColorStop(1, shade(w, -.1)); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 56, 0, 7); c.fill(); c.strokeStyle = 'rgba(0,0,0,.12)'; c.stroke();
  tx(c, 'MENU', cx, 300, { s: 19, w: 700, c: wt, a: 'center' });
  ic.fill(c, Q.podp, 32, 22, 92.5, cy, 32, wt); hit(60, 358, 64, 54, 'prev'); ic.fill(c, Q.podp, 32, 22, 254.5, cy, 32, wt, true); hit(222, 358, 64, 54, 'next');
  if (S.play) { c.fillStyle = wt; c.beginPath(); c.moveTo(cx - 17, 478); c.lineTo(cx - 17, 498); c.lineTo(cx - 3, 488); c.fill(); c.fillRect(cx + 2, 478, 5, 20); c.fillRect(cx + 10, 478, 5, 20); } else { c.fillStyle = wt; c.beginPath(); c.moveTo(cx - 17, 478); c.lineTo(cx - 17, 498); c.lineTo(cx - 3, 488); c.fill(); c.fillRect(cx + 2, 478, 5, 20); c.fillRect(cx + 10, 478, 5, 20); }
  hit(cx - 40, 466, 80, 44, 'play');
}
function sceneWidget(c) {
  const t = S.wt, ph = S.wph; if (!S.wtr) { c.fillStyle = S.wbg; c.fillRect(0, 0, 404, 195); }
  fillRR(c, 12, 12, 380, 171, 26, S.wc); pic(c, S.cover, 26, 26, 58, 58, 10, 'rgba(255,255,255,.55)');
  tx(c, S.title, 95, 44, { s: 17, w: 700, c: t, m: 230 }); tx(c, S.artist, 95, 66, { s: 16, c: hexA(t, .55), m: 230 });
  if (S.wdots) for (let i = 0; i < 6; i++) circ(c, 346 + i * 5.5, 40, 1.1, hexA(t, .4));
  const pct = ph || !S.tot ? 0 : S.el / S.tot; tx(c, ph ? '–:––' : fmt(S.el), 32, 103, { s: 13, w: 600, c: hexA(t, .75) }); tx(c, ph ? '--:--' : '-' + fmt(S.tot - S.el), 372, 103, { s: 13, w: 600, c: hexA(t, .75), a: 'right' });
  fillRR(c, 65, 100.5, 266, 7, 3.5, hexA(t, .35)); if (pct > 0) fillRR(c, 65, 100.5, Math.max(7, 266 * pct), 7, 3.5, hexA(t, .85)); hit(59, 90, 278, 28, null, 0, { bar: 'el', bx: 65, bw: 266 });
  iFwd(c, 125, 147, 36, t, true); hit(97, 122, 56, 50, 'prev'); S.wplay ? iPause(c, 203, 147, 26, t) : iPlay(c, 203, 147, 40, t); hit(175, 122, 56, 50, 'play'); iFwd(c, 279, 147, 36, t); hit(251, 122, 56, 50, 'next');
  iAir(c, 355, 147, 24, hexA(t, .55));
}
const SC = { lyric: sceneLyric, list: sceneList, pad: scenePad, pod: scenePod, widget: sceneWidget };
function paint(c, opq) {
  const [w, h] = DIM[S.mode]; c.save();
  if (opq) { c.fillStyle = S.mode === 'widget' ? S.wbg : S.mode === 'pod' ? S.podb : '#000'; c.fillRect(0, 0, w, h); }
  else if (S.round && S.mode !== 'pod' && S.mode !== 'widget') { rr(c, 0, 0, w, h, S.mode === 'pad' ? 22 : 44); c.clip(); }
  SC[S.mode](c); c.restore();
}

/* ---------- 가사 블러 ---------- */
const bc = new Map();
function wrap(x, t, w) { const o = []; for (const par of t.split('\n')) { let l = ''; for (const wd of par.split(' ')) { const tt = l ? l + ' ' + wd : wd; if (x.measureText(tt).width <= w || !l) l = tt; else { o.push(l); l = wd; } } o.push(l); } return o; }
function pass(s, o, w, h, r, hor) { const n = hor ? h : w, m = hor ? w : h, st = hor ? 1 : w, ls = hor ? w : 1; for (let L = 0; L < n; L++) { const b = L * ls; let sum = 0; for (let i = -r; i <= r; i++) sum += s[b + Math.min(m - 1, Math.max(0, i)) * st]; for (let i = 0; i < m; i++) { o[b + i * st] = sum / (2 * r + 1); sum += s[b + Math.min(m - 1, i + r + 1) * st] - s[b + Math.max(0, i - r) * st]; } } }
function blurAlpha(d, r) { const { data, width: w, height: h } = d, a = new Float32Array(w * h), t = new Float32Array(w * h); for (let i = 0; i < w * h; i++) a[i] = data[i * 4 + 3]; for (let k = 0; k < 2; k++) { pass(a, t, w, h, r, true); pass(t, a, w, h, r, false); } for (let i = 0; i < w * h; i++) { data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = 255; data[i * 4 + 3] = a[i]; } }
function blurLine(t, fs, w, b, a) {
  const k = [t, fs, w, b, a].join('|'); if (bc.has(k)) return bc.get(k);
  const K = 3, c = document.createElement('canvas'), x = c.getContext('2d'), f = `700 ${fs}px ${FONT}`; x.font = f;
  const ls = wrap(x, t, w), lh = fs * 1.2, H = Math.ceil(ls.length * lh), pd = Math.ceil(b * 3);
  c.width = (w + pd * 2) * K; c.height = (H + pd * 2) * K; x.scale(K, K); x.font = f; x.textBaseline = 'middle'; x.fillStyle = `rgba(255,255,255,${a})`;
  ls.forEach((l, i) => x.fillText(l, pd, pd + i * lh + lh / 2));
  const d = x.getImageData(0, 0, c.width, c.height); if (b > 0) { blurAlpha(d, Math.max(1, Math.round(b * K))); x.putImageData(d, 0, 0); }
  const r = { src: b > 0 ? c.toDataURL() : '', H, pd, c }; bc.set(k, r); return r;
}
