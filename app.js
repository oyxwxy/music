'use strict';
/* ===== utils ===== */
const $ = (s, r = document) => r.querySelector(s);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
const p2 = n => String(n).padStart(2, '0');
const fmt = s => Math.floor(Math.max(0, s) / 60) + ':' + p2(Math.max(0, Math.round(s)) % 60);
const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Display","Apple SD Gothic Neo","Pretendard",sans-serif';
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const hex = (r, g, b) => '#' + [r, g, b].map(v => p2(Math.max(0, Math.min(255, Math.round(v))).toString(16))).join('');
const hexA = (h, a) => { const [r, g, b] = rgb(h); return `rgba(${r},${g},${b},${a})`; };
const shade = (h, f) => { const c = rgb(h).map(v => f < 0 ? v * (1 + f) : v + (255 - v) * f); return hex(...c); };
const lum = h => { const [r, g, b] = rgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

/* ===== state ===== */
const S = {
  mode: 'lyric', title: 'Try Again', artist: 'd.ear & JAEHYUN', album: 'Try Again', cover: '',
  lyrics: '여기에 가사를 입력하세요\nSo whenever you ask me again how I feel\n한 줄에 한 문장씩 적어주세요\n현재 줄은 미리보기를 눌러 바꿀 수 있어요\n마지막 줄입니다',
  cur: 1, fs: 31, clock: { h: 16, m: 17 }, sbar: true, star: true, round: true,
  c1: '#6b5a2a', c2: '#2f5a4a', c3: '#2a3a45',
  lname: 'winter', lart: 'Yeojuhee', upd: '1일 전 업데이트됨', dark: false, np: 4,
  tracks: [{ t: '겨울이오면', a: '다이나믹 듀오', img: '' }, { t: 'Remember', a: 'Sam Ock', img: '' }, { t: 'Thousand Trips', a: 'WELOVE', img: '' }, { t: '눈이 내리면', a: '도', img: '' }],
  pclock: { h: 11, m: 31, ap: 'PM' }, pdate: 'Thu Sep 26', batt: 87, vol: 12, shuf: true, rep: false, play: true, pfs: 44,
  tot: 229, el: 2, podb: '#cfcfcf', podw: '#ffffff', bar: 'Now Playing', pshuf: true, pbatt: 100,
  lfs: 100, wtr: true, coverSrc: '', adur: 6, arate: 10, sk_on: false, sk_at: 2, sk_to: 120, tg_on: false, tg_at: 2, nx_on: false, nx_at: 3, nx_title: 'Next Song', nx_artist: 'Artist', nx_tot: 200,
  aend: 4, lt: 2.5, gsc: .75, wc: '#969696', wt: '#f6f6f6', wbg: '#efefef', wph: true, wplay: false, wdots: true
};

/* ===== icons (모든 색은 직접 지정: 이미지 저장 때 SVG 색이 깨지지 않도록) ===== */
const I = {
  sig: c => `<svg width="18" height="12" viewBox="0 0 18 12" fill="${c}"><rect y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" width="3" height="12" rx="1"/></svg>`,
  wifi: c => `<svg width="17" height="12" viewBox="0 0 17 12" fill="${c}"><path d="M8.5 2.3c2.3 0 4.4.9 6 2.4l1.1-1.2A10.7 10.7 0 0 0 8.5.6C5.7.6 3.2 1.7 1.4 3.5l1.1 1.2a8.700 8.700 0 0 1 6-2.400zm0 3.700c1.300 0 2.500.5 3.400 1.300l1.100-1.200a7 7 0 0 0-9 0l1.100 1.200c.9-.8 2.100-1.300 3.400-1.300zm0 3.500c-.7 0-1.300.3-1.800.7l1.800 2 1.800-2c-.5-.4-1.100-.7-1.800-.7z"/></svg>`,
  bat: (c, p = 100) => `<svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="22" height="12" rx="3.500" fill="none" stroke="${c}" opacity=".4"/><rect x="2" y="2" width="${Math.max(1, 19 * p / 100)}" height="9" rx="2" fill="${c}"/><path d="M24 4.500v4c.8-.3 1.500-1.100 1.500-2s-.7-1.700-1.500-2z" fill="${c}" opacity=".45"/></svg>`,
  star: c => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z"/></svg>`,
  ell: c => `<svg width="16" height="16" viewBox="0 0 16 16" fill="${c}"><circle cx="2.500" cy="8" r="1.600"/><circle cx="8" cy="8" r="1.600"/><circle cx="13.500" cy="8" r="1.600"/></svg>`,
  shuf: (c, w = 26) => `<svg width="${w}" height="${w * .77}" viewBox="0 0 26 20" fill="none" stroke="${c}" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5h4c5 0 6 10 11 10h4M1 15h4c2 0 3.500-1 4.500-2.500M13 7c1-1.200 2.200-2 4-2h3M20 1.500L23.500 5 20 8.500M20 11.500l3.500 3.500-3.500 3.500"/></svg>`,
  rep: c => `<svg width="24" height="20" viewBox="0 0 24 20" fill="none" stroke="${c}" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h14l-3-3M20 13H6l3 3"/></svg>`,
  play: (c, w = 18) => `<svg width="${w}" height="${w}" viewBox="0 0 18 18" fill="${c}"><path d="M3 1.500v15l13-7.500z"/></svg>`,
  pause: (c, w = 24) => `<svg width="${w}" height="${w * 1.15}" viewBox="0 0 26 30" fill="${c}"><rect x="1" y="1" width="9" height="28" rx="2"/><rect x="16" y="1" width="9" height="28" rx="2"/></svg>`,
  fwd: (c, w = 34) => `<svg width="${w}" height="${w * .74}" viewBox="0 0 38 28" fill="${c}"><path d="M1 2.500q0-2 2-.9l15 10.800q1.500 1.600 0 3.200L3 26.400q-2 1.100-2-.9zM20 2.500q0-2 2-.9l15 10.800q1.500 1.600 0 3.200L22 26.400q-2 1.100-2-.9z"/></svg>`,
  rew: (c, w = 34) => `<svg width="${w}" height="${w * .74}" viewBox="0 0 38 28" fill="${c}" style="transform:scaleX(-1)"><path d="M1 2.500q0-2 2-.9l15 10.800q1.500 1.600 0 3.200L3 26.400q-2 1.100-2-.9zM20 2.500q0-2 2-.9l15 10.800q1.500 1.600 0 3.200L22 26.400q-2 1.100-2-.9z"/></svg>`,
  list: c => `<svg width="30" height="22" viewBox="0 0 30 22" fill="${c}"><circle cx="3" cy="3" r="2"/><circle cx="3" cy="11" r="2"/><circle cx="3" cy="19" r="2"/><rect x="9" y="1.500" width="20" height="3"/><rect x="9" y="9.500" width="20" height="3"/><rect x="9" y="17.500" width="20" height="3"/></svg>`,
  tabs: (c, on) => ['<path d="M14 3L2 13h3v11h7v-7h4v7h7V13h3z" fill="X"/>', '<g fill="X"><rect x="3" y="3" width="10" height="10" rx="2"/><rect x="15" y="3" width="10" height="10" rx="2"/><rect x="3" y="15" width="10" height="10" rx="2"/><rect x="15" y="15" width="10" height="10" rx="2"/></g>', '<g fill="none" stroke="X" stroke-width="2.400" stroke-linecap="round"><circle cx="14" cy="14" r="2.500" fill="X"/><path d="M9 9a7 7 0 0 0 0 10M19 9a7 7 0 0 1 0 10M5 5a13 13 0 0 0 0 18M23 5a13 13 0 0 1 0 18"/></g>', '<g fill="X"><rect x="4" y="12" width="20" height="12" rx="3"/><rect x="7" y="7" width="14" height="3" rx="1.500"/><rect x="10" y="2" width="8" height="3" rx="1.500"/></g>', '<g fill="none" stroke="X" stroke-width="2.800" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M18 18l7 7"/></g>'].map((p, i) => `<svg width="30" height="30" viewBox="0 0 28 28">${p.replace(/X/g, i === 3 ? on : c)}</svg>`)
};

/* ===== 가사 블러 이미지 (CSS filter 대신 캔버스로 직접 → 사파리/이미지 저장에서도 동일) ===== */
const bc = new Map();
function wrap(x, t, w) { const o = []; for (const par of t.split('\n')) { let l = ''; for (const wd of par.split(' ')) { const tt = l ? l + ' ' + wd : wd; if (x.measureText(tt).width <= w || !l) l = tt; else { o.push(l); l = wd; } } o.push(l); } return o; }
function pass(s, o, w, h, r, hor) { const n = hor ? h : w, m = hor ? w : h, st = hor ? 1 : w, ls = hor ? w : 1; for (let L = 0; L < n; L++) { const b = L * ls; let sum = 0; for (let i = -r; i <= r; i++) sum += s[b + Math.min(m - 1, Math.max(0, i)) * st]; for (let i = 0; i < m; i++) { o[b + i * st] = sum / (2 * r + 1); sum += s[b + Math.min(m - 1, i + r + 1) * st] - s[b + Math.max(0, i - r) * st]; } } }
function blurAlpha(d, r) { const { data, width: w, height: h } = d, a = new Float32Array(w * h), t = new Float32Array(w * h); for (let i = 0; i < w * h; i++) a[i] = data[i * 4 + 3]; for (let k = 0; k < 2; k++) { pass(a, t, w, h, r, true); pass(t, a, w, h, r, false); } for (let i = 0; i < w * h; i++) { data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = 255; data[i * 4 + 3] = a[i]; } }
function blurLine(t, fs, w, b, a) {
  const k = [t, fs, w, b, a].join('|'); if (bc.has(k)) return bc.get(k);
  const K = 2, c = document.createElement('canvas'), x = c.getContext('2d'), f = `700 ${fs}px ${FONT}`; x.font = f;
  const ls = wrap(x, t, w), lh = fs * 1.2, H = Math.ceil(ls.length * lh), pd = Math.ceil(b * 3);
  c.width = (w + pd * 2) * K; c.height = (H + pd * 2) * K; x.scale(K, K); x.font = f; x.textBaseline = 'middle'; x.fillStyle = `rgba(255,255,255,${a})`;
  ls.forEach((l, i) => x.fillText(l, pd, pd + i * lh + lh / 2));
  const d = x.getImageData(0, 0, c.width, c.height); if (b > 0) { blurAlpha(d, Math.max(1, Math.round(b * K))); x.putImageData(d, 0, 0); }
  const r = { src: b > 0 ? c.toDataURL() : '', H, pd, c }; bc.set(k, r); return r;
}
function lyricHTML(w, fs) {
  const mb = Math.round(fs * .8);
  return S.lyrics.split('\n').map((t, i) => {
    const d = Math.abs(i - S.cur);
    if (!d) return `<p class="ln a" data-i="${i}" style="font-size:${fs}px;margin-bottom:${mb}px">${esc(t) || '&nbsp;'}</p>`;
    const r = blurLine(t || ' ', fs, w, Math.min(1.5 + d * 1.1, 6), Math.max(.42 - d * .03, .22));
    return `<div class="ln bl" data-i="${i}" style="height:${r.H}px;margin-bottom:${mb}px"><img src="${r.src}" style="left:-${r.pd}px;top:-${r.pd}px;width:${w + r.pd * 2}px;height:${r.H + r.pd * 2}px"></div>`;
  }).join('');
}

/* ===== 배경 (캔버스로 직접 그림) ===== */
function paintBg(root) {
  root.querySelectorAll('.bgc').forEach(h => {
    const w = +h.dataset.w, H = +h.dataset.h, c = document.createElement('canvas'); c.width = w; c.height = H; c.className = 'bgc'; const x = c.getContext('2d');
    const m = [S.c1, S.c2, S.c3].map(rgb), av = [0, 1, 2].map(i => m.reduce((s, v) => s + v[i], 0) / 3);
    x.fillStyle = hex(av[0] * .28, av[1] * .28, av[2] * .28); x.fillRect(0, 0, w, H);
    const R = Math.max(w, H), pos = h.dataset.k === 'pad' ? [[.1, 1, .75, S.c1], [.95, .72, .6, S.c2], [.6, 0, .5, S.c3]] : [[0, .58, .65, S.c1], [1, .9, .6, S.c2], [.85, .05, .5, S.c3]];
    pos.forEach(([px, py, r, col]) => { const g = x.createRadialGradient(w * px, H * py, 0, w * px, H * py, R * r); g.addColorStop(0, hexA(col, 1)); g.addColorStop(1, hexA(col, 0)); x.fillStyle = g; x.fillRect(0, 0, w, H); });
    x.fillStyle = 'rgba(0,0,0,.16)'; x.fillRect(0, 0, w, H); h.replaceWith(c);
  });
}

/* ===== 화면(뷰) ===== */
const img = u => u ? `background-image:url('${u}')` : '';
const clock24 = () => `${S.clock.h}:${p2(S.clock.m)}`;
function sb(c) { return S.sbar ? `<div class="sb" style="color:${c}"><span>${clock24()}</span><span>${I.sig(c)}${I.wifi(c)}${I.bat(c)}</span></div>` : ''; }
function vLyric() {
  return `<div class="phone lyric ${S.round ? 'r' : ''}"><div class="bgc" data-w="390" data-h="844" data-k="lyric"></div>${sb('#fff')}<div class="grab"></div>
<div class="lh"><div class="cv" style="${img(S.cover)}"></div><div class="t"><b>${esc(S.title)}</b><span>${esc(S.artist)}</span></div><div class="bt">${S.star ? `<div class="dots">${I.star('#fff')}</div>` : ''}<div class="dots">${I.ell('#fff')}</div></div></div>
<div class="ly" data-t="65"><div class="in">${lyricHTML(330, S.fs)}</div></div></div>`;
}
function vList() {
  const fg = S.dark ? '#fff' : '#000', rows = S.tracks.map((t, i) => `<div class="tr"><div class="th" style="${img(t.img)}"></div><div class="x"><div><b>${esc(t.t)}</b><small>${esc(t.a)}</small></div>${I.ell(S.dark ? '#fff' : '#222')}</div></div>`).join('');
  const np = S.tracks[S.np - 1];
  return `<div class="phone list ${S.dark ? 'dk' : ''} ${S.round ? 'r' : ''}" style="--k:${S.lfs / 100}">${sb(fg)}<div class="lcov" style="${img(S.cover)}"></div><h2>${esc(S.lname)}</h2><div class="art">${esc(S.lart)}</div><div class="upd">${esc(S.upd)}</div>
<div class="btns"><div>${I.play('#fa2d48', 16)}재생</div><div>${I.shuf('#fa2d48', 20)}임의 재생</div></div><div class="tl">${rows}</div>
${np ? `<div class="mini"><div class="th" style="${img(np.img || S.cover)}"></div><b>${esc(np.t)}</b><span data-act="play">${S.play ? I.pause(fg, 22) : I.play(fg, 22)}</span>${I.fwd(fg, 34)}</div>` : ''}
<div class="tabbar">${I.tabs('#8e8e93', '#fa2d48').join('')}</div></div>`;
}
function vPad() {
  const pc = S.pclock, el = S.el, pct = S.tot ? el / S.tot * 100 : 0;
  return `<div class="pad ${S.round ? 'r' : ''}"><div class="bgc" data-w="1024" data-h="768" data-k="pad"></div>
<div class="psb a"><span>${pc.h}:${p2(pc.m)} ${pc.ap}&nbsp;&nbsp;${esc(S.pdate)}</span><span>${I.wifi('#fff')}${S.batt}%${I.bat('#fff', S.batt)}</span></div>
<div class="pcv a" style="${img(S.cover)}"></div>
<div class="pti a"><b>${esc(S.title)}</b><span>${esc(S.artist)}</span></div><div class="pbt a">${S.star ? `<div class="dots">${I.star('#fff')}</div>` : ''}<div class="dots">${I.ell('#fff')}</div></div>
<div class="bar a" data-bar="el" style="top:530px"><i style="width:${pct}%"></i></div><div class="tt a"><span>${fmt(el)}</span><span>-${fmt(S.tot - el)}</span></div>
<div class="cr a"><div class="rb ${S.shuf ? 'on' : ''}">${I.shuf('#fff', 24)}</div>${I.rew('#fff', 44)}<span data-act="play" style="cursor:pointer">${S.play ? I.pause('#fff', 30) : I.play('#fff', 34)}</span>${I.fwd('#fff', 44)}<div class="rb ${S.rep ? 'on' : ''}">${I.rep('#fff')}</div></div>
<div class="bar a" data-bar="vol" style="top:672px"><i style="width:${S.vol}%"></i></div>
<div class="ly" data-t="256"><div class="in">${lyricHTML(509, S.pfs)}</div></div></div>`;
}
function vPod() {
  const b = S.podb, w = S.podw, wt = lum(w) > .5 ? '#8a8a8a' : '#e4e4e4', pl = S.pbatt;
  const body = `linear-gradient(90deg,${shade(b, -.2)},${shade(b, .05)} 18%,${b} 50%,${shade(b, .03)} 82%,${shade(b, -.22)})`, bg = img(S.cover);
  return `<div class="pod ${S.round ? 'r' : ''}" style="background:${body}"><div class="pscr"><div class="ptb"><span>${esc(S.bar)}</span><span><span style="color:#7d7d7d;font-size:11px">${S.play ? '▶' : '❚❚'}</span><svg width="32" height="14" viewBox="0 0 32 14"><rect x=".5" y=".5" width="28" height="12" rx="2.500" fill="#e8e8e8" stroke="#555"/><rect x="29" y="4" width="2.500" height="5" fill="#555"/><rect x="2" y="2" width="${Math.max(1, 25 * pl / 100)}" height="9" rx="1.500" fill="#58b838"/></svg></span></div>
<div class="pic">${S.pshuf ? I.shuf('#8d8d8d', 26) : ''}${I.list('#8d8d8d')}</div>
<div class="pcov" style="${bg}"></div><div class="prf"><div style="${bg}"></div><i></i></div>
<div class="ptx"><b>${esc(S.title)}</b><span>${esc(S.artist)}</span><span>${esc(S.album)}</span></div>
<div class="pbar" data-bar="el"><i style="left:calc(${S.tot ? S.el / S.tot * 100 : 0}% - 1px)"></i></div><div class="pt"><span>${fmt(S.el)}</span><span>-${fmt(S.tot - S.el)}</span></div></div>
<div class="wheel" style="background:${w};color:${wt}"><span class="w" style="left:0;right:0;top:22px;text-align:center;font-size:19px">MENU</span>
<span class="w" style="left:28px;top:107px"><svg width="32" height="20" viewBox="0 0 32 22" fill="${wt}"><rect y="1" width="4" height="20"/><path d="M6 11L18 1v20zM18 11L30 1v20z"/></svg></span>
<span class="w" style="right:28px;top:107px"><svg width="32" height="20" viewBox="0 0 32 22" fill="${wt}"><rect x="28" y="1" width="4" height="20"/><path d="M26 11L14 1v20zM14 11L2 1v20z"/></svg></span>
<span class="w" id="pp" style="left:0;right:0;bottom:20px;display:flex;justify-content:center"><svg width="34" height="20" viewBox="0 0 34 20" fill="${wt}"><path d="M2 1l12 9L2 19z"/><rect x="19" y="1" width="5" height="18"/><rect x="27" y="1" width="5" height="18"/></svg></span>
<div class="c" style="background:radial-gradient(${shade(w, -.03)},${shade(w, -.1)})"></div></div></div>`;
}
const VIEWS = { lyric: vLyric, list: vList, pad: vPad, pod: vPod, widget: vWidget };
function hiSvg(root, sc) {
  root.querySelectorAll('svg').forEach(v => {
    const w = parseFloat(v.getAttribute('width')), h = parseFloat(v.getAttribute('height')); if (!w || !h) return;
    const c = v.cloneNode(true); c.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); c.setAttribute('width', Math.ceil(w * sc * 2)); c.setAttribute('height', Math.ceil(h * sc * 2)); c.removeAttribute('style');
    const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(c)); im.style.cssText = `width:${w}px;height:${h}px;` + (v.getAttribute('style') || ''); v.replaceWith(im);
  });
}
function renderInto(root, live, sc) {
  root.innerHTML = VIEWS[S.mode](); paintBg(root); if (sc) hiSvg(root, sc);
  const ly = $('.ly', root), a = ly && $('.a', ly); if (a) $('.in', ly).style.transform = `translateY(${+ly.dataset.t - a.offsetTop}px)`;
  const pp = $('#pp', root); if (pp && live) pp.onclick = () => { S.play = !S.play; render(); upd(); };
}
function render() { renderInto($('#view'), true); fit(); }
function fit() {
  const v = $('#view').firstElementChild; if (!v) return; const w = v.offsetWidth, h = v.offsetHeight, bx = $('.stage').clientWidth - 24;
  const s = Math.min(1, bx / w, (innerHeight - 110) / h > .4 ? (innerHeight - 110) / h : 1); $('#scale').style.transform = `scale(${s})`; $('#stageBox').style.cssText = `width:${w * s}px;height:${h * s}px`; $('#scale').style.width = w + 'px';
}
$('#view').addEventListener('click', e => { const l = e.target.closest('[data-i]'); if (l) { S.cur = +l.dataset.i; render(); upd(); } });

/* ===== 컨트롤 ===== */
let ups = []; const upd = () => ups.forEach(f => f());
const mut = f => { f(S); render(); upd(); };
const set = (k, v) => mut(s => s[k] = v);
const F = (lb, n) => { const f = el('div', 'fld'); f.append(el('label', '', lb), n); return f; };
const T = k => { const i = el('input'); i.type = 'text'; i.value = S[k]; i.oninput = () => set(k, i.value); ups.push(() => { if (document.activeElement !== i) i.value = S[k]; }); return i; };
const TA = k => { const i = el('textarea'); i.value = S[k]; i.oninput = () => { S[k] = i.value; render(); upd(); }; ups.push(() => { if (document.activeElement !== i) i.value = S[k]; }); return i; };
const TG = (k, tx) => { const l = el('label', 'tg', `<input type="checkbox"><i></i><span>${tx}</span>`), c = l.firstChild; c.checked = S[k]; c.onchange = () => set(k, c.checked); ups.push(() => c.checked = S[k]); return l; };
const RG = (k, min, max, step, f = v => v, getMax) => { const w = el('div', 'rg'), r = el('input'), o = el('output'); r.type = 'range'; r.min = min; r.step = step; const sy = () => { r.max = getMax ? getMax() : max; r.value = S[k]; o.textContent = f(+S[k]); }; r.oninput = () => { S[k] = +r.value; render(); o.textContent = f(S[k]); upd(); }; ups.push(sy); sy(); w.append(r, o); return w; };
const SEG = (k, opts, after) => { const g = el('div', 'seg'); opts.forEach(([v, l]) => { const b = el('button', '', l); b.onclick = () => { S[k] = v; after && after(v); render(); upd(); }; b._v = v; g.append(b); }); const sy = () => [...g.children].forEach(b => b.classList.toggle('on', b._v === S[k])); ups.push(sy); sy(); return g; };
const STP = (k, getMax) => { const w = el('div', 'stp'), m = el('button', 'btn sm', '◀'), p = el('button', 'btn sm', '▶'), b = el('b'); const go = d => set(k, Math.max(0, Math.min(getMax(), S[k] + d))); m.onclick = () => go(-1); p.onclick = () => go(1); ups.push(() => b.textContent = (S[k] + 1) + ' / ' + (getMax() + 1)); b.textContent = (S[k] + 1) + ' / ' + (getMax() + 1); w.append(m, b, p); return w; };
function part(p) {
  const w = el('div', 'tp'), i = el('input'), u = el('button', '', '▲'), d = el('button', '', '▼'); i.inputMode = 'numeric'; i.maxLength = 2;
  const f = () => String(p.get()).padStart(p.pad ? 2 : 1, '0'), put = n => { const R = p.max - p.min + 1; p.set(((n - p.min) % R + R) % R + p.min); i.value = f(); };
  i.oninput = () => { const n = parseInt(i.value.replace(/\D/g, ''), 10); if (!isNaN(n)) p.set(Math.min(p.max, Math.max(p.min, n))); };
  i.onblur = () => i.value = f(); i.onfocus = () => i.select();
  u.onclick = () => put(p.get() + 1); d.onclick = () => put(p.get() - 1);
  i.onkeydown = e => { if (e.key === 'ArrowUp') { e.preventDefault(); put(p.get() + 1); } if (e.key === 'ArrowDown') { e.preventDefault(); put(p.get() - 1); } };
  i.onwheel = e => { if (document.activeElement === i) { e.preventDefault(); put(p.get() + (e.deltaY < 0 ? 1 : -1)); } };
  ups.push(() => { if (document.activeElement !== i) i.value = f(); }); i.value = f(); w.append(u, i, d); return w;
}
const TM = (...ps) => { const w = el('div', 'tm'); ps.forEach((p, i) => { if (i) w.append(el('b', '', ':')); w.append(part(p)); }); return w; };
const clockTM = o => TM({ get: () => o().h, set: n => mut(() => o().h = n), min: 0, max: 23, pad: 0 }, { get: () => o().m, set: n => mut(() => o().m = n), min: 0, max: 59, pad: 1 });
const durTM = k => TM({ get: () => Math.floor(S[k] / 60), set: n => mut(() => S[k] = Math.min(S.tot || 5999, n * 60 + S[k] % 60)), min: 0, max: 99 }, { get: () => S[k] % 60, set: n => mut(() => S[k] = Math.min(S.tot || 5999, Math.floor(S[k] / 60) * 60 + n)), min: 0, max: 59, pad: 1 });
const totTM = () => TM({ get: () => Math.floor(S.tot / 60), set: n => mut(() => { S.tot = n * 60 + S.tot % 60; S.el = Math.min(S.el, S.tot); }), min: 0, max: 99 }, { get: () => S.tot % 60, set: n => mut(() => { S.tot = Math.floor(S.tot / 60) * 60 + n; S.el = Math.min(S.el, S.tot); }), min: 0, max: 59, pad: 1 });
const COL = k => { const b = el('button', 'sw', '<i></i><span></span>'); const sy = () => { b.firstChild.style.background = S[k]; b.lastChild.textContent = S[k].toUpperCase(); }; b.onclick = () => openPicker(b, S[k], v => { S[k] = v; render(); upd(); }); ups.push(sy); sy(); return b; };
const card = (t, ...n) => { const c = el('section', 'card', `<h3>${t}</h3>`); c.append(...n); return c; };
const two = (...n) => { const d = el('div', 'two'); d.append(...n); return d; };

/* ===== 이미지 업로드 / 색 추출 ===== */
function loadImg(file, cb) {
  if (!file || !file.type.startsWith('image/')) return; const r = new FileReader();
  r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 1600 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); const src = c.toDataURL('image/jpeg', .95); openCropper(src, u => cb(u, src)); }; im.src = r.result; }; r.readAsDataURL(file);
}
function extract(src, done) {
  const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 6; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 6, 6); const d = x.getImageData(0, 0, 6, 6).data;
    const reg = (x0, y0, x1, y1) => { let r = 0, g = 0, b = 0, n = 0; for (let j = y0; j < y1; j++)for (let i = x0; i < x1; i++) { const o = (j * 6 + i) * 4; r += d[o]; g += d[o + 1]; b += d[o + 2]; n++; } return hex(r / n * .72, g / n * .72, b / n * .72); };
    done(reg(0, 2, 3, 5), reg(3, 3, 6, 6), reg(3, 0, 6, 3)); }; im.src = src;
}
function coverCtl() {
  const w = el('div', 'cvc'), th = el('button', 'thumb', '이미지'), f = el('input'), bs = el('div', 'bs'); f.type = 'file'; f.accept = 'image/*'; f.hidden = true;
  const pick = file => loadImg(file, (u, src) => { S.cover = u; S.coverSrc = src; extract(u, (a, b, c) => { S.c1 = a; S.c2 = b; S.c3 = c; render(); upd(); }); });
  th.onclick = () => f.click(); f.onchange = () => { pick(f.files[0]); f.value = ''; };
  w.ondragover = e => { e.preventDefault(); w.classList.add('drag'); }; w.ondragleave = () => w.classList.remove('drag'); w.ondrop = e => { e.preventDefault(); w.classList.remove('drag'); pick(e.dataTransfer.files[0]); };
  const b1 = el('button', 'btn sm', '파일 선택'), b2 = el('button', 'btn sm', '색 다시 추출'), b3 = el('button', 'btn sm', '삭제'), b4 = el('button', 'btn sm', '색 정밀 추출'), b5 = el('button', 'btn sm', '다시 자르기');
  b1.onclick = () => f.click(); b2.onclick = () => S.cover && extract(S.cover, (a, b, c) => { S.c1 = a; S.c2 = b; S.c3 = c; render(); upd(); }); b3.onclick = () => set('cover', ''); b4.onclick = () => openSampler({ keys: SMPK[S.mode] }); b5.onclick = () => S.coverSrc ? openCropper(S.coverSrc, u => { S.cover = u; render(); upd(); }) : alert('새로 올린 이미지부터 다시 자를 수 있어요.');
  bs.append(b1, b5, b2, b4, b3, el('div', 'hint', '이미지를 끌어다 놓아도 돼요.<br>올리면 배경색이 자동으로 정해져요.')); w.append(th, f, bs);
  ups.push(() => { th.style.backgroundImage = S.cover ? `url(${S.cover})` : ''; th.textContent = S.cover ? '' : '이미지'; }); return w;
}
function trackEd() {
  const box = el('div'); const build = () => { box.innerHTML = '';
    S.tracks.forEach((t, i) => { const r = el('div', 'trk'), th = el('button', 'thumb'), f = el('input'), a = T2(t, 't'), b = T2(t, 'a'), np = el('button', 'np', '▶'), x = el('button', 'btn sm', '✕'); f.type = 'file'; f.accept = 'image/*'; f.hidden = true;
      th.style.backgroundImage = t.img ? `url(${t.img})` : ''; th.onclick = () => f.click(); f.onchange = () => { loadImg(f.files[0], u => { t.img = u; th.style.backgroundImage = `url(${u})`; render(); }); f.value = ''; };
      np.classList.toggle('on', S.np === i + 1); np.title = '현재 재생 곡'; np.onclick = () => { S.np = S.np === i + 1 ? 0 : i + 1; render(); build(); }; x.onclick = () => { S.tracks.splice(i, 1); if (S.np > S.tracks.length) S.np = 0; render(); build(); };
      r.append(th, f, a, b, np, x); box.append(r); });
    const ad = el('button', 'btn sm', '+ 곡 추가'); ad.onclick = () => { if (S.tracks.length < 12) { S.tracks.push({ t: '새 곡', a: '아티스트', img: '' }); render(); build(); } }; box.append(ad); };
  const T2 = (o, k) => { const i = el('input'); i.type = 'text'; i.value = o[k]; i.oninput = () => { o[k] = i.value; render(); }; return i; }; build(); return box;
}

/* ===== 패널 구성 ===== */
const MODES = [['lyric', '가사'], ['list', '재생목록'], ['pad', '아이패드'], ['pod', '아이팟'], ['widget', '잠금화면']];
const PAGES = {
  lyric: [['info', '곡'], ['lyr', '가사'], ['look', '디자인'], ['png', '저장'], ['anim', '움짤']],
  list: [['info', '정보'], ['trk', '곡 목록'], ['look', '디자인'], ['png', '저장'], ['anim', '움짤']],
  pad: [['info', '곡'], ['lyr', '가사'], ['play', '재생'], ['look', '디자인'], ['png', '저장'], ['anim', '움짤']],
  pod: [['info', '곡'], ['play', '재생'], ['look', '디자인'], ['png', '저장'], ['anim', '움짤']],
  widget: [['info', '곡'], ['play', '재생'], ['look', '디자인'], ['png', '저장'], ['anim', '움짤']]
};
const PG = {};
function buildPanel() {
  ups = []; const p = $('#panel'), m = S.mode, pages = PAGES[m]; p.innerHTML = ''; if (!pages.some(x => x[0] === PG[m])) PG[m] = pages[0][0];
  const tabs = el('div', 'seg ptabs'); pages.forEach(([k, l]) => { const b = el('button', k === PG[m] ? 'on' : '', l); b.onclick = () => { PG[m] = k; buildPanel(); }; tabs.append(b); }); p.append(tabs);
  const prog = [F('재생 위치', RG('el', 0, 100, 1, fmt, () => S.tot)), two(F('현재 시간 (분 : 초)', durTM('el')), F('총 길이 (분 : 초)', totTM()))];
  const sbar = [F('상태바 시간 (24시간)', clockTM(() => S.clock)), TG('sbar', '상태바 표시')];
  const cols = card('배경 색', F('배경 1 · 2', two(COL('c1'), COL('c2'))), F('배경 3', COL('c3')));
  const song = () => card('곡 정보', coverCtl(), F('제목', T('title')), F('아티스트', T('artist')), ...(m === 'pod' ? [F('앨범', T('album'))] : []));
  const plist = () => card('플레이리스트', coverCtl(), F('이름', T('lname')), F('설명 (아티스트 줄)', T('lart')), F('업데이트 문구', T('upd')));
  const lyr = () => card('가사', F('가사 (한 줄에 한 문장)', TA('lyrics')), F('현재 줄 (미리보기의 줄을 눌러도 돼요)', STP('cur', () => S.lyrics.split('\n').length - 1)), F('가사 글자 크기', m === 'pad' ? RG('pfs', 30, 60, 1, v => v + 'px') : RG('fs', 22, 40, 1, v => v + 'px')));
  const LOOK = {
    lyric: () => [cols, card('화면', TG('star', '별(즐겨찾기) 버튼'), ...sbar)],
    list: () => [card('화면', TG('dark', '다크 모드'), F('글자 크기', RG('lfs', 70, 120, 1, v => v + '%')), ...sbar)],
    pad: () => [cols, card('화면', TG('star', '별(즐겨찾기) 버튼')), card('상단 상태바', F('시간', TM({ get: () => S.pclock.h, set: n => mut(() => S.pclock.h = n), min: 1, max: 12 }, { get: () => S.pclock.m, set: n => mut(() => S.pclock.m = n), min: 0, max: 59, pad: 1 })), F('오전 / 오후', SEG('pclockap', [['AM', 'AM'], ['PM', 'PM']])), F('날짜', T('pdate')), F('배터리', RG('batt', 1, 100, 1, v => v + '%')))],
    pod: () => [card('아이팟', F('본체 프리셋', SEG('podpre', [['silver', '실버'], ['black', '블랙'], ['white', '화이트']], v => { const q = { silver: ['#cfcfcf', '#ffffff'], black: ['#262626', '#333333'], white: ['#f2f2f2', '#ffffff'] }[v]; S.podb = q[0]; S.podw = q[1]; })), two(F('본체 색', COL('podb')), F('휠 색', COL('podw'))), F('상단 문구', T('bar')), F('배터리', RG('pbatt', 5, 100, 1, v => v + '%')), TG('pshuf', '셔플 아이콘'))],
    widget: () => [card('잠금화면 플레이어', two(F('카드 색', COL('wc')), F('글자 색', COL('wt'))), TG('wtr', '바깥 배경 투명 (PNG)'), F('바깥 배경 색 (투명을 끄면 적용)', COL('wbg')), TG('wdots', '우측 상단 점선'))]
  };
  const X = {
    info: () => [m === 'list' ? plist() : song()], lyr: () => [lyr()], trk: () => [card('곡 목록 (▶ = 현재 재생 곡, 썸네일을 눌러 이미지 변경)', trackEd())],
    play: () => [card('재생 상태', ...prog, TG(m === 'widget' ? 'wplay' : 'play', '재생 중 (끄면 ▶)'), ...(m === 'widget' ? [TG('wph', '시간 대기 표시 (–:––)')] : []), ...(m === 'pad' ? [F('볼륨', RG('vol', 0, 100, 1, v => v + '%')), TG('shuf', '셔플 켜짐'), TG('rep', '반복 켜짐')] : []))],
    look: () => LOOK[m](), png: () => [card('이미지 저장', pngBox())], anim: () => [card('움짤 · 영상', animBox())]
  };
  X[PG[m]]().forEach(c => p.append(c)); upd();
}
/* AM/PM, 프리셋은 객체/파생 값이라 별도 매핑 */
Object.defineProperty(S, 'pclockap', { get() { return S.pclock.ap; }, set(v) { S.pclock.ap = v; }, enumerable: false });
Object.defineProperty(S, 'podpre', { get() { return null; }, set() { }, enumerable: false });
const mb = $('#modes'); MODES.forEach(([k, l]) => { const b = el('button', '', l); b.onclick = () => { S.mode = k; [...mb.children].forEach((c, i) => c.classList.toggle('on', MODES[i][0] === k)); buildPanel(); render(); }; mb.append(b); });

/* ===== 컬러피커 (최종 선택한 색만 기록) ===== */
const HK = 'mui_color_history'; let hist = []; try { hist = JSON.parse(localStorage.getItem(HK)) || []; } catch (e) { }
function addHist(c) { c = c.toLowerCase(); hist = [c, ...hist.filter(x => x !== c)].slice(0, 14); try { localStorage.setItem(HK, JSON.stringify(hist)); } catch (e) { } }
function hsv2hex(h, s, v) { const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return hex(f(5) * 255, f(3) * 255, f(1) * 255); }
function hex2hsv(h) { let [r, g, b] = rgb(h).map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let H = 0; if (d) H = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [H * 60, mx ? d / mx : 0, mx]; }
let pk = null;
function openPicker(anchor, color, onChange) {
  closePicker(); const pop = $('#pop'); pop.hidden = false; pop.innerHTML = '';
  const st = { hsv: hex2hsv(color), start: color.toLowerCase(), cur: color.toLowerCase() };
  const sv = el('canvas'), hu = el('canvas', 'hu'), row = el('div', 'r'), chip = el('i'), hx = el('input', 'hx'), ok = el('button', 'btn sm', '확인'), hs = el('div', 'hist');
  sv.width = 480; sv.height = 300; sv.style.cssText = 'width:240px;height:150px'; hu.width = 480; hu.height = 28; hu.style.cssText = 'width:240px;height:14px'; hx.type = 'text'; hx.maxLength = 7;
  const drawHue = () => { const x = hu.getContext('2d'), g = x.createLinearGradient(0, 0, 480, 0); for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, hsv2hex(i * 60 % 360, 1, 1)); x.fillStyle = g; x.fillRect(0, 0, 480, 28); const px = st.hsv[0] / 360 * 480; x.strokeStyle = '#fff'; x.lineWidth = 4; x.strokeRect(px - 4, 2, 8, 24); };
  const drawSV = () => { const x = sv.getContext('2d'); x.fillStyle = hsv2hex(st.hsv[0], 1, 1); x.fillRect(0, 0, 480, 300); let g = x.createLinearGradient(0, 0, 480, 0); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 480, 300); g = x.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, '#000'); x.fillStyle = g; x.fillRect(0, 0, 480, 300); x.beginPath(); x.arc(st.hsv[1] * 480, (1 - st.hsv[2]) * 300, 11, 0, 7); x.lineWidth = 3; x.strokeStyle = '#fff'; x.stroke(); x.lineWidth = 1; x.strokeStyle = 'rgba(0,0,0,.5)'; x.stroke(); };
  const apply = (fromHex) => { st.cur = hsv2hex(...st.hsv); chip.style.background = st.cur; if (!fromHex) hx.value = st.cur; drawSV(); drawHue(); onChange(st.cur); };
  const drag = (cv, fn) => { cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); mv(e); cv.onpointermove = mv; cv.onpointerup = () => cv.onpointermove = null; }; const mv = e => { const r = cv.getBoundingClientRect(); fn(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))); apply(); }; };
  drag(sv, (x, y) => { st.hsv[1] = x; st.hsv[2] = 1 - y; }); drag(hu, x => { st.hsv[0] = Math.min(359.9, x * 360); });
  hx.oninput = () => { let v = hx.value.trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{6}$/i.test(v)) { st.hsv = hex2hsv(v); apply(true); } };
  hx.onkeydown = e => { if (e.key === 'Enter') closePicker(); };
  hist.forEach(c => { const b = el('button'); b.style.background = c; b.onclick = () => { st.hsv = hex2hsv(c); apply(); }; hs.append(b); }); if (!hist.length) hs.textContent = '아직 기록이 없어요';
  const eb = el('button', 'btn sm', '스포이드'); eb.onclick = async () => { if (window.EyeDropper) { try { const r = await new EyeDropper().open(); st.hsv = hex2hsv(r.sRGBHex); apply(); } catch (e) { } } else openSampler({ single: true, color: st.cur, done: h => { st.hsv = hex2hsv(h); apply(); } }); }; ok.onclick = closePicker; row.append(chip, hx, eb, ok); pop.append(sv, hu, row, hs, el('small', '', '닫을 때 최종으로 고른 색만 기록돼요'));
  const a = anchor.getBoundingClientRect(); pop.style.left = Math.max(8, Math.min(innerWidth - 276, a.left)) + 'px'; pop.style.top = Math.min(innerHeight - pop.offsetHeight - 8, a.bottom + 8) + 'px';
  chip.style.background = st.cur; hx.value = st.cur; drawSV(); drawHue(); pk = st;
  setTimeout(() => document.addEventListener('pointerdown', outside, true), 0);
}
const outside = e => { if (!$('#pop').contains(e.target) && !e.target.closest('.ov')) closePicker(); };
function closePicker() { const pop = $('#pop'); if (pop.hidden) return; if (pk && pk.cur !== pk.start) addHist(pk.cur); pk = null; pop.hidden = true; document.removeEventListener('pointerdown', outside, true); }
addEventListener('keydown', e => { if (e.key === 'Escape') { closePicker(); closeModal(); } });

/* ===== 이미지 저장 (사파리 대응: 미리보기 창 + 공유/길게 눌러 저장/다운로드) ===== */
const SCALES = { lyric: 3, list: 3, pod: 3, pad: 2, widget: 3 };
let lastUrl = '';
function closeModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; if (lastUrl) { URL.revokeObjectURL(lastUrl); lastUrl = ''; } }
async function save() {
  const btn = $('#saveBtn'); if (typeof html2canvas === 'undefined') { alert('이미지 저장 라이브러리를 불러오지 못했어요. 인터넷 연결을 확인하거나 html2canvas를 같은 폴더에 두고 index.html의 주소를 바꿔주세요.'); return; }
  btn.disabled = true; btn.textContent = '만드는 중...'; closePicker();
  const h = el('div'); h.style.cssText = 'position:fixed;left:-99999px;top:0;pointer-events:none'; document.body.append(h);
  try {
    renderInto(h, false, SCALES[S.mode]); if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await Promise.all([...h.querySelectorAll('img')].map(i => i.decode ? i.decode().catch(() => { }) : 0)); await new Promise(r => setTimeout(r, 120));
    const cv = await html2canvas(h.firstElementChild, { scale: SCALES[S.mode], backgroundColor: null, useCORS: true, logging: false });
    const blob = await new Promise(r => cv.toBlob(r, 'image/png')); if (!blob) throw new Error('blob');
    showResult(blob);
  } catch (e) { alert('이미지를 만들지 못했어요. 새로고침 후 다시 시도해 주세요.'); }
  h.remove(); btn.disabled = false; btn.textContent = '이미지 저장';
}
function showResult(blob, type = 'image/png', ext = 'png') {
  closeModal(); lastUrl = URL.createObjectURL(blob); const m = $('#modal'), name = `music-ui-${S.mode}.${ext}`, file = new File([blob], name, { type });
  m.innerHTML = (type.startsWith('video') ? `<video src="${lastUrl}" controls autoplay muted loop playsinline></video>` : `<img src="${lastUrl}" alt="결과">`) + `<p>아이폰·사파리: ${type.startsWith('video') ? '아래 [저장 / 공유]에서 "비디오 저장"을 고르세요.' : '이미지를 길게 눌러 "사진에 추가"를 고르거나, 아래 [저장 / 공유]를 누르세요.'}</p><div class="bs"></div>`; m.hidden = false;
  const bs = $('.bs', m), sh = el('button', 'btn pri', '저장 / 공유'), dl = el('a', 'btn', '다운로드'), cl = el('button', 'btn', '닫기'); dl.href = lastUrl; dl.download = name;
  sh.onclick = async () => { try { if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file] }); else dl.click(); } catch (e) { } };
  cl.onclick = closeModal; m.onclick = e => { if (e.target === m) closeModal(); }; bs.append(sh, dl, cl);
}
$('#saveBtn').onclick = save;

/* ===== 미리보기에서 재생바 드래그 / 재생 토글 ===== */
let drag = null;
const dragMv = e => { if (!drag) return; const f = Math.min(1, Math.max(0, (e.clientX - drag.r.left) / drag.r.width)); if (drag.k === 'vol') set('vol', Math.round(f * 100)); else { if (S.mode === 'widget') S.wph = false; set('el', Math.round(f * S.tot)); } };
$('#view').addEventListener('pointerdown', e => {
  if (e.target.closest('[data-act]')) { const k = S.mode === 'widget' ? 'wplay' : 'play'; set(k, !S[k]); return; }
  const b = e.target.closest('[data-bar]'); if (!b) return; e.preventDefault(); drag = { k: b.dataset.bar, r: b.getBoundingClientRect() }; dragMv(e);
});
addEventListener('pointermove', dragMv); addEventListener('pointerup', () => drag = null); addEventListener('pointercancel', () => drag = null);

/* ===== 시작 ===== */
addEventListener('resize', fit);
[...mb.children][0].classList.add('on'); buildPanel(); render();
