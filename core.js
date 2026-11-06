'use strict';
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

/* ===== 상태 ===== */
const S = {
  mode: 'lyric', title: 'Try Again', artist: 'd.ear & JAEHYUN', album: 'Try Again', cover: '', coverSrc: '',
  lyr: ['여기에 가사를 입력하세요', 'So whenever you ask me again how I feel', '한 줄씩 칸에 적거나, 여러 줄을 붙여넣어도 돼요', '재생 버튼을 누르면 가사가 흘러가요', '마지막 줄입니다'],
  cur: 1, lsec: 0, lineSec: 3, fs: 31, pfs: 44, clock: { h: 16, m: 17 }, sbar: true, star: true, fav: false, round: true,
  net: 'wifi', sig: 4, batt: 80, chg: false, lowp: false, c1: '#6b5a2a', c2: '#2f5a4a', c3: '#2a3a45',
  lname: 'winter', lart: 'Yeojuhee', upd: '1일 전 업데이트됨', dark: false, np: 4, lfs: 100,
  tracks: [{ t: '겨울이오면', a: '다이나믹 듀오', img: '' }, { t: 'Remember', a: 'Sam Ock', img: '' }, { t: 'Thousand Trips', a: 'WELOVE', img: '' }, { t: '눈이 내리면', a: '도', img: '' }],
  pclock: { h: 11, m: 31, ap: 'PM' }, date: '2024-09-26', dfmt: 'en', vol: 12, shuf: true, rep: false, play: false, el: 2, tot: 229,
  nx_title: 'Next Song', nx_artist: 'Artist', nx_tot: 200,
  podb: '#cfcfcf', podw: '#ffffff', bar: 'Now Playing', pshuf: true,
  wc: '#969696', wt: '#f6f6f6', wbg: '#efefef', wtr: true, wph: true, wplay: false, wdots: true,
  fmt: 'video', gsc: .75
};
Object.defineProperty(S, 'ap', { get() { return S.pclock.ap; }, set(v) { S.pclock.ap = v; }, enumerable: false });
