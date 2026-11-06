'use strict';
/* app.js : 화면 연결, 재생/조작, 편집 패널, 저장·녹화 */
const cv = $('#cv'), cx = cv.getContext('2d'), REC = { on: false }; let last = performance.now(), syncT = 0;
function fit() {
  const [w, h] = DIM[S.mode], avail = $('.stage').clientWidth - 24, maxH = innerWidth < 960 ? innerHeight * .46 : innerHeight - 130, k = Math.min(avail / w, maxH / h, 1.6);
  cv.style.width = w * k + 'px'; cv.style.height = h * k + 'px'; cv._s = Math.min(3, Math.max(1.5, k * (devicePixelRatio || 1))); needs = true;
}
function draw() {
  const [w, h] = DIM[S.mode], s = cv._s || 2, W = Math.round(w * s), H = Math.round(h * s); if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, W, H); cx.setTransform(s, 0, 0, s, 0, 0); R.hits = []; paint(cx, REC.on);
  const p = R.press; if (p && !p.bar) { cx.fillStyle = 'rgba(128,128,128,.28)'; rr(cx, p.x, p.y, p.w, p.h, Math.min(12, Math.min(p.w, p.h) / 2)); cx.fill(); }
}

/* ----- 조작 (누르기 / 끌기) ----- */
const swapTrack = () => { [S.title, S.nx_title] = [S.nx_title, S.title]; [S.artist, S.nx_artist] = [S.nx_artist, S.artist]; [S.tot, S.nx_tot] = [S.nx_tot, S.tot]; S.el = 0; };
function act(a, i) {
  const w = S.mode === 'widget', pk = w ? 'wplay' : 'play', list = S.mode === 'list';
  if (a === 'play') { S[pk] = !S[pk]; if (w) S.wph = false; }
  else if (a === 'next') { if (list) { S.np = S.np < S.tracks.length ? S.np + 1 : 1; S.play = true; } else swapTrack(); }
  else if (a === 'prev') { if (S.el > 3) S.el = 0; else swapTrack(); }
  else if (a === 'shuf') S.shuf = !S.shuf; else if (a === 'rep') S.rep = !S.rep; else if (a === 'fav') S.fav = !S.fav;
  else if (a === 'line') { S.cur = +i; S.lsec = 0; }
  else if (a === 'row') { S.np = +i + 1; S.play = true; }
  else if (a === 'playall') { S.np = 1; S.play = true; } else if (a === 'shufall') { S.np = 1 + Math.floor(Math.random() * S.tracks.length); S.play = true; }
  render(); upd();
}
const pt = e => { const b = cv.getBoundingClientRect(), [w, h] = DIM[S.mode]; return { x: (e.clientX - b.left) / b.width * w, y: (e.clientY - b.top) / b.height * h }; };
const find = p => { for (let i = R.hits.length - 1; i >= 0; i--) { const h = R.hits[i]; if (p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h) return h; } return null; };
let dragH = null;
function setBar(h, p) {
  const f = Math.min(1, Math.max(0, (p.x - h.bx) / h.bw)); if (h.bar === 'vol') S.vol = Math.round(f * 100); else { S.el = f * S.tot; if (S.mode === 'widget') S.wph = false; } render(); upd();
}
cv.addEventListener('pointerdown', e => { const h = find(pt(e)); if (!h) return; e.preventDefault(); cv.setPointerCapture(e.pointerId); R.press = h; if (h.bar) { dragH = h; setBar(h, pt(e)); } render(); });
cv.addEventListener('pointermove', e => { if (dragH) setBar(dragH, pt(e)); });
const rel = e => { const h = R.press; R.press = null; dragH = null; if (h && !h.bar && e.type === 'pointerup') { const q = find(pt(e)); if (q && q.act === h.act && q.i === h.i) act(h.act, h.i); } render(); };
cv.addEventListener('pointerup', rel); cv.addEventListener('pointercancel', rel);

/* ----- 실시간 재생 ----- */
function tick(dt) {
  if (!playing()) return; const m = S.mode;
  if (m === 'pad' || m === 'pod' || m === 'widget') { S.el += dt; if (S.el >= S.tot) { if (S.rep) S.el = 0; else swapTrack(); } }
  if ((m === 'lyric' || m === 'pad') && S.lyr.length) { S.lsec += dt; if (S.lsec >= S.lineSec) { if (S.cur < S.lyr.length - 1) { S.cur++; S.lsec -= S.lineSec; } else S.lsec = S.lineSec; } }
  needs = true; syncT += dt; if (syncT > .5) { syncT = 0; upd(); }
}
function syncUI() {
  const fab = $('#fab'), rec = $('#rec'); fab.hidden = S.mode !== 'lyric'; fab.textContent = S.play ? '❚❚' : '▶'; rec.hidden = S.mode === 'list';
  rec.textContent = REC.on ? `■ 정지  ${Math.floor((performance.now() - REC.t0) / 1000)}초` : '● 녹화'; rec.classList.toggle('on', REC.on);
}
function frame(now) { const dt = Math.min(.1, (now - last) / 1000); last = now; tick(dt); if (needs || REC.on || R.press) { needs = false; draw(); syncUI(); } requestAnimationFrame(frame); }

/* ----- 편집 패널 ----- */
const PG = {};
const stCard = (ipad, pod) => card('상태 표시줄', ...(pod ? [] : [F('네트워크', SEG('net', [['wifi', '와이파이'], ['5g', '5G'], ['lte', 'LTE'], ['none', '없음']]))]), ...(ipad || pod ? [] : [F('신호 세기', RG('sig', 0, 4, 1, v => v + '칸'))]), F('배터리 (20% 이하는 빨간색)', RG('batt', 1, 100, 1, v => v + '%')), TG('chg', '충전 중 (초록 + 번개)'), ...(pod ? [] : [TG('lowp', '저전력 모드 (노란색)')]));
function buildPanel() {
  ups = []; const p = $('#panel'), m = S.mode, pg = PG[m] || 'c'; p.innerHTML = '';
  const tabs = el('div', 'seg ptabs'); [['c', '내용'], ['d', '디자인'], ['x', '내보내기']].forEach(([k, l]) => { const b = el('button', k === pg ? 'on' : '', l); b.onclick = () => { PG[m] = k; buildPanel(); }; tabs.append(b); }); p.append(tabs);
  const song = () => card('곡 정보', coverCtl(), F('제목', T('title')), F('아티스트', T('artist')), ...(m === 'pod' ? [F('앨범', T('album'))] : []));
  const plist = () => card('플레이리스트', coverCtl(), F('이름', T('lname')), F('설명 (아티스트 줄)', T('lart')), F('업데이트 문구', T('upd')));
  const tracks = () => card('곡 목록', trackEd());
  const time = () => card('재생 시간', F('현재 위치 (재생바)', RG('el', 0, 0, 1, fmt, () => S.tot)), two(F('현재 (분:초)', durTM('el')), F('총 길이 (분:초)', totTM())), ...(m === 'widget' ? [TG('wph', '시간 대기 표시 (–:––)')] : []));
  const next = () => card('다음 곡 (다음 버튼을 누르면 바뀌어요)', F('제목', T('nx_title')), F('아티스트', T('nx_artist')), F('길이 (분:초)', dTM('nx_tot')));
  const lyr = () => card('가사', LyrEd(), F('가사 넘어가는 속도 (한 줄당)', RG('lineSec', 1, 8, .5, v => v + '초')));
  const cols = () => card('배경 색', F('배경 1 · 2', two(COL('c1'), COL('c2'))), F('배경 3', COL('c3')));
  const clock = () => F('시간 (24시간)', clockTM(() => S.clock));
  const X = {
    lyric: { c: [song, lyr], d: [cols, () => card('화면', F('글자 크기', RG('fs', 22, 40, 1, v => v + 'px')), TG('star', '별 버튼'), TG('sbar', '상태바 표시'), clock()), stCard] },
    list: { c: [plist, tracks], d: [() => card('화면', TG('dark', '다크 모드'), F('글자 크기', RG('lfs', 70, 120, 1, v => v + '%')), TG('sbar', '상태바 표시'), clock()), stCard] },
    pad: { c: [song, lyr, time, next], d: [cols, () => card('화면', F('가사 글자 크기', RG('pfs', 30, 60, 1, v => v + 'px')), TG('star', '별 버튼')), () => card('상단 시간 · 날짜', F('시간', TM({ get: () => S.pclock.h, set: n => mut(() => S.pclock.h = n), min: 1, max: 12 }, { get: () => S.pclock.m, set: n => mut(() => S.pclock.m = n), min: 0, max: 59, pad: 1 })), F('오전 / 오후', SEG('ap', [['AM', '오전'], ['PM', '오후']])), F('날짜 형식', SEG('dfmt', [['en', 'Thu Sep 26'], ['ko', '9월 26일 (목)']])), F('날짜 선택', CAL('date'))), () => stCard(true)] },
    pod: { c: [song, time, next], d: [() => card('아이팟', F('본체 프리셋', SEG('podpre', [['silver', '실버'], ['black', '블랙'], ['white', '화이트']], v => { const q = { silver: ['#cfcfcf', '#ffffff'], black: ['#262626', '#333333'], white: ['#f2f2f2', '#ffffff'] }[v]; S.podb = q[0]; S.podw = q[1]; })), two(F('본체 색', COL('podb')), F('휠 색', COL('podw'))), F('상단 문구', T('bar')), TG('pshuf', '셔플 아이콘')), () => stCard(false, true)] },
    widget: { c: [song, time, next], d: [() => card('잠금화면 플레이어', two(F('카드 색', COL('wc')), F('글자 색', COL('wt'))), TG('wdots', '우측 상단 점선'), TG('wtr', '바깥 배경 투명 (PNG)'), F('바깥 배경 색 (투명을 끄면 적용)', COL('wbg')))] }
  };
  if (pg === 'x') {
    const b = (t, f, c = 'btn pri big') => { const x = el('button', c, t); x.onclick = f; return x; };
    p.append(card('이미지로 저장', ...(m === 'pod' || m === 'widget' ? [] : [TG('round', '모서리 둥글게 (모서리가 투명해요)')]), b('PNG로 저장', savePNG)));
    if (m !== 'list') p.append(card('움짤 · 영상 만들기', el('div', 'hint big', '1. 형식을 고르고 [녹화 시작]을 눌러요.<br>2. 왼쪽 화면을 직접 눌러 보세요. ▶ 재생, 재생바 끌기, 다음 곡 누르기 … 누르는 그대로 담겨요.<br>3. 끝나면 [■ 정지]를 누르면 완성돼요. (재생 속도는 실제 속도 그대로예요)'), F('형식', SEG('fmt', [['video', '영상'], ['gif', 'GIF 움짤']])), F('GIF 크기 (클수록 용량이 커요)', SEG('gsc', [[.5, '작게'], [.75, '보통'], [1, '크게']])), b('● 녹화 시작', recToggle)));
  } else X[m][pg].forEach(f => p.append(f()));
  upd();
}

/* ----- 저장 / 녹화 ----- */
let lastUrl = '';
function closeModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; if (lastUrl) { URL.revokeObjectURL(lastUrl); lastUrl = ''; } }
function showResult(blob, type = 'image/png', ext = 'png') {
  closeModal(); lastUrl = URL.createObjectURL(blob); const m = $('#modal'), name = `music-ui-${S.mode}.${ext}`, file = new File([blob], name, { type }), vid = type.startsWith('video');
  m.innerHTML = (vid ? `<video src="${lastUrl}" controls autoplay muted loop playsinline></video>` : `<img src="${lastUrl}" alt="결과">`) + `<p>${vid ? '아래 [저장 / 공유]에서 "비디오 저장"을 고르세요.' : '아이폰: 이미지를 길게 눌러 "사진에 추가"를 고르거나 [저장 / 공유]를 누르세요.'}</p><div class="bs"></div>`; m.hidden = false;
  const bs = $('.bs', m), sh = el('button', 'btn pri', '저장 / 공유'), dl = el('a', 'btn', '다운로드'), cl = el('button', 'btn', '닫기'); dl.href = lastUrl; dl.download = name;
  sh.onclick = async () => { try { if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file] }); else dl.click(); } catch (e) { } }; cl.onclick = closeModal; m.onclick = e => { if (e.target === m) closeModal(); }; bs.append(sh, dl, cl);
}
function savePNG() {
  const [w, h] = DIM[S.mode], s = { lyric: 3, list: 3, pad: 2, pod: 3, widget: 3 }[S.mode], oc = document.createElement('canvas'); oc.width = Math.round(w * s); oc.height = Math.round(h * s);
  const c = oc.getContext('2d'), hs = R.hits; c.scale(s, s); R.hits = []; paint(c, false); R.hits = hs; oc.toBlob(b => b ? showResult(b) : alert('저장하지 못했어요'), 'image/png');
}
const KEEP = ['el', 'tot', 'title', 'artist', 'nx_title', 'nx_artist', 'nx_tot', 'np', 'cur', 'lsec', 'play', 'wplay', 'wph', 'shuf', 'rep', 'fav', 'vol'];
function recToggle() { REC.on ? recStop() : recStart(); }
function recStart() {
  if (S.fmt === 'video' && !window.MediaRecorder) { alert('이 브라우저는 영상 녹화를 지원하지 않아요. GIF를 골라 주세요.'); return; }
  REC.snap = {}; KEEP.forEach(k => REC.snap[k] = S[k]); REC.on = true; REC.t0 = performance.now(); needs = true;
  if (S.fmt === 'video') {
    const mt = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t)) || ''; REC.ch = [];
    REC.mr = new MediaRecorder(cv.captureStream(30), mt ? { mimeType: mt, videoBitsPerSecond: 8e6 } : { videoBitsPerSecond: 8e6 }); REC.mr.ondataavailable = e => e.data && e.data.size && REC.ch.push(e.data); REC.mr.start(200);
  } else {
    const [w, h] = DIM[S.mode]; REC.fr = []; REC.gc = document.createElement('canvas'); REC.gc.width = Math.round(w * S.gsc); REC.gc.height = Math.round(h * S.gsc); REC.gx = REC.gc.getContext('2d', { willReadFrequently: true });
    REC.iv = setInterval(() => { REC.gx.drawImage(cv, 0, 0, REC.gc.width, REC.gc.height); REC.fr.push({ d: REC.gx.getImageData(0, 0, REC.gc.width, REC.gc.height), t: performance.now() }); if (REC.fr.length >= 200) recStop(); }, 100);
  }
}
async function recStop() {
  if (!REC.on) return; const fmt = S.fmt; clearInterval(REC.iv);
  if (fmt === 'video') await new Promise(r => { REC.mr.onstop = r; REC.mr.stop(); });
  REC.on = false; KEEP.forEach(k => S[k] = REC.snap[k]); needs = true; upd(); syncUI();
  if (fmt === 'video') { const type = (REC.mr.mimeType || 'video/webm').split(';')[0]; showResult(new Blob(REC.ch, { type }), type, type.includes('mp4') ? 'mp4' : 'webm'); } else await encodeGif();
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

async function encodeGif() {
  const fr = REC.fr, n = fr.length; if (n < 2) { alert('너무 짧아요. 조금 더 길게 녹화해 주세요.'); return; }
  const m = $('#modal'); m.hidden = false; m.onclick = null; m.innerHTML = '<p id="mp">GIF 만드는 중...</p>'; await new Promise(r => setTimeout(r, 30));
  const W = fr[0].d.width, H = fr[0].d.height, pal = makePalette([fr[0].d, fr[n >> 1].d, fr[n - 1].d]), cache = new Int16Array(32768).fill(-1), w16 = (o, v) => o.push(v & 255, (v >> 8) & 255), hd = [71, 73, 70, 56, 57, 97];
  w16(hd, W); w16(hd, H); hd.push(0xF7, 0, 0); pal.forEach(c => hd.push(c[0], c[1], c[2])); hd.push(0x21, 0xFF, 11, ...'NETSCAPE2.0'.split('').map(c => c.charCodeAt(0)), 3, 1, 0, 0, 0); const parts = [new Uint8Array(hd)];
  for (let i = 0; i < n; i++) {
    const dl = Math.max(2, Math.round((i < n - 1 ? fr[i + 1].t - fr[i].t : 100) / 10)), g = [0x21, 0xF9, 4, 4]; w16(g, dl); g.push(0, 0, 0x2C); w16(g, 0); w16(g, 0); w16(g, W); w16(g, H); g.push(0); parts.push(new Uint8Array(g), lzw(quant(fr[i].d, pal, W, H, cache)));
    if (i % 2 === 0) { const e = $('#mp'); if (e) e.textContent = `GIF 만드는 중... ${Math.round(i / n * 100)}%`; await new Promise(r => setTimeout(r)); }
  }
  parts.push(new Uint8Array([0x3B])); showResult(new Blob(parts, { type: 'image/gif' }), 'image/gif', 'gif');
}

/* ----- 시작 ----- */
const MODES = [['lyric', '가사'], ['list', '재생목록'], ['pad', '아이패드'], ['pod', '아이팟'], ['widget', '잠금화면']], mb = $('#modes');
MODES.forEach(([k, l]) => { const b = el('button', k === S.mode ? 'on' : '', l); b.onclick = () => { S.mode = k; [...mb.children].forEach((c, i) => c.classList.toggle('on', MODES[i][0] === k)); buildPanel(); fit(); }; mb.append(b); });
$('#saveBtn').onclick = savePNG; $('#fab').onclick = () => act('play'); $('#rec').onclick = recToggle; addEventListener('resize', fit);
buildPanel(); fit(); requestAnimationFrame(frame);
