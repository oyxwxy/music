'use strict';
/* ui.js : 직접 만든 입력 도구들 (글자칸, 슬라이더, 시간, 달력, 가사 편집, 이미지 편집, 색 고르기) */
let ups = []; const upd = () => ups.forEach(f => f());
const mut = f => { f(S); render(); upd(); };
const set = (k, v) => { S[k] = v; render(); upd(); };
const F = (lb, n) => { const f = el('div', 'fld'); f.append(el('label', '', lb), n); return f; };
const card = (t, ...n) => { const c = el('section', 'card', t ? `<h3>${t}</h3>` : ''); c.append(...n); return c; };
const two = (...n) => { const d = el('div', 'two'); d.append(...n); return d; };
const T = k => { const w = el('div', 'tf'), i = el('input'), x = el('button', 'x', '×'); i.type = 'text'; i.value = S[k]; i.oninput = () => set(k, i.value); x.onclick = () => { i.value = ''; set(k, ''); i.focus(); }; ups.push(() => { if (document.activeElement !== i) i.value = S[k]; }); w.append(i, x); return w; };
const TG = (k, tx) => { const l = el('label', 'tg', `<input type="checkbox"><i></i><span>${tx}</span>`), c = l.firstChild; c.checked = S[k]; c.onchange = () => set(k, c.checked); ups.push(() => c.checked = S[k]); return l; };
const SEG = (k, opts, after) => { const g = el('div', 'seg'); opts.forEach(([v, l]) => { const b = el('button', '', l); b.onclick = () => { S[k] = v; after && after(v); render(); upd(); }; b._v = v; g.append(b); }); const sy = () => [...g.children].forEach(b => b.classList.toggle('on', b._v === S[k])); ups.push(sy); sy(); return g; };
function SL(min, max, step, get, put) {
  const tr = el('div', 'sl', '<i></i><b></b>'), f = () => Math.min(1, Math.max(0, (get() - min) / ((max() - min) || 1)));
  const sy = () => { const p = f() * 100 + '%'; tr.firstChild.style.width = p; tr.lastChild.style.left = p; };
  const mv = e => { const b = tr.getBoundingClientRect(), q = Math.min(1, Math.max(0, (e.clientX - b.left) / b.width)); put(+(Math.round((min + q * (max() - min)) / step) * step).toFixed(3)); sy(); };
  tr.onpointerdown = e => { tr.setPointerCapture(e.pointerId); mv(e); tr.onpointermove = mv; }; tr.onpointerup = tr.onpointercancel = () => tr.onpointermove = null; return { el: tr, sy };
}
const RG = (k, min, max, step, fm = v => v, getMax) => {
  const w = el('div', 'rg'), o = el('output'), s = SL(min, () => getMax ? getMax() : max, step, () => +S[k], v => { S[k] = v; render(); o.textContent = fm(v); upd(); });
  const sy = () => { s.sy(); o.textContent = fm(+S[k]); }; ups.push(sy); sy(); w.append(s.el, o); return w;
};
const mkTM = (a, b, ca, cb) => TM({ get: a[0], set: n => mut(() => a[1](n)), min: 0, max: ca, pad: 0 }, { get: b[0], set: n => mut(() => b[1](n)), min: 0, max: cb, pad: 1 });

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
const dTM = k => TM({ get: () => Math.floor(S[k] / 60), set: n => mut(() => S[k] = n * 60 + S[k] % 60), min: 0, max: 99 }, { get: () => S[k] % 60, set: n => mut(() => S[k] = Math.floor(S[k] / 60) * 60 + n), min: 0, max: 59, pad: 1 });
const COL = k => { const b = el('button', 'sw', '<i></i><span></span>'); const sy = () => { b.firstChild.style.background = S[k]; b.lastChild.textContent = S[k].toUpperCase(); }; b.onclick = () => openPicker(b, S[k], v => { S[k] = v; render(); upd(); }); ups.push(sy); sy(); return b; };

/* ----- 달력 ----- */
function CAL(k) {
  const w = el('div', 'cal'); let [vy, vm] = S[k].split('-').map(Number); vm--;
  const build = () => {
    w.innerHTML = ''; const hd = el('div', 'ch'), pv = el('button', '', '‹'), nx = el('button', '', '›'), tt = el('b', '', `${vy}년 ${vm + 1}월`), td = el('button', 'btn sm', '오늘');
    pv.onclick = () => { if (--vm < 0) { vm = 11; vy--; } build(); }; nx.onclick = () => { if (++vm > 11) { vm = 0; vy++; } build(); };
    td.onclick = () => { const d = new Date(); vy = d.getFullYear(); vm = d.getMonth(); set(k, `${vy}-${p2(vm + 1)}-${p2(d.getDate())}`); build(); }; hd.append(pv, tt, nx, td);
    const g = el('div', 'cg'); KOW.forEach(d => g.append(el('span', 'dw', d))); for (let i = new Date(vy, vm, 1).getDay(); i > 0; i--) g.append(el('span'));
    for (let d = 1, n = new Date(vy, vm + 1, 0).getDate(); d <= n; d++) { const iso = `${vy}-${p2(vm + 1)}-${p2(d)}`, b = el('button', iso === S[k] ? 'on' : '', d); b.onclick = () => { set(k, iso); build(); }; g.append(b); }
    w.append(hd, g);
  }; build(); return w;
}

/* ----- 가사 편집기 ----- */
const splitLy = s => String(s).replace(/\r/g, '').split(/\n|\s\/\s/).map(x => x.trim()).filter(x => x && !/^\[[^\]]*\]$/.test(x));
let lyMode = 'text';
function LyrText() {
  const w = el('div', 'lytx'), ta = el('textarea'), val = () => S.lyr.join('\n');
  ta.value = val(); ta.placeholder = '한 줄에 가사 한 줄씩 적어요.\n줄바꿈하면 다음 가사 줄이 돼요.'; ta.spellcheck = false; ta.rows = 6;
  const grow = () => { ta.style.height = 'auto'; ta.style.height = Math.max(150, ta.scrollHeight + 2) + 'px'; };
  const upCur = () => { const ls = ta.value.split('\n'), li = ta.value.slice(0, ta.selectionStart).split('\n').length - 1; let n = 0; for (let i = 0; i <= li && i < ls.length; i++) if (ls[i].trim()) n++; const c = Math.max(0, Math.min(S.lyr.length - 1, n - 1)); if (c !== S.cur) { S.cur = c; S.lsec = 0; render(); upd(); } };
  ta.oninput = () => { const ls = ta.value.split('\n').map(x => x.trim()).filter(Boolean); S.lyr = ls.length ? ls : ['']; S.cur = Math.min(S.cur, S.lyr.length - 1); grow(); upCur(); render(); upd(); };
  ta.onpaste = e => { const s = (e.clipboardData && e.clipboardData.getData('text')) || ''; if (/\s\/\s|^\s*\[[^\]]*\]\s*$/m.test(s)) setTimeout(() => { ta.value = splitLy(ta.value).join('\n'); ta.oninput(); }, 0); };
  ['keyup', 'click', 'focus'].forEach(ev => ta.addEventListener(ev, upCur));
  w.append(ta, el('div', 'hint', '커서가 있는 줄이 미리보기의 현재 줄이 돼요. 통째로 붙여넣으면 줄이 자동으로 나뉘어요.'));
  ups.push(() => { if (document.activeElement !== ta && ta.value !== val()) ta.value = val(); grow(); }); setTimeout(grow, 0); return w;
}
function LyrEd() {
  const box = el('div', 'lyw'), sg = el('div', 'seg'), body = el('div');
  const show = () => { [...sg.children].forEach(b => b.classList.toggle('on', b._v === lyMode)); body.innerHTML = ''; body.append(lyMode === 'text' ? LyrText() : LyrRows()); upd(); };
  [['text', '한 번에 쓰기'], ['rows', '줄별 편집']].forEach(([v, l]) => { const b = el('button', '', l); b._v = v; b.onclick = () => { lyMode = v; show(); }; sg.append(b); });
  box.append(sg, body); show(); return box;
}
function LyrRows() {
  const box = el('div', 'lyed'); let rows;
  const build = () => {
    box.innerHTML = ''; S.lyr.forEach((t, i) => {
      const r = el('div', 'lr' + (i === S.cur ? ' on' : '')), n = el('button', 'n', i + 1), inp = el('input'), d = el('button', 'x', '×'); inp.type = 'text'; inp.value = t; inp.placeholder = '가사를 입력하세요';
      const foc = j => { const q = box.querySelectorAll('input')[j]; if (q) q.focus(); };
      n.onclick = () => { S.cur = i; S.lsec = 0; render(); upd(); }; inp.oninput = () => { S.lyr[i] = inp.value; render(); };
      inp.onkeydown = e => {
        if (e.key === 'Enter') { e.preventDefault(); S.lyr.splice(i + 1, 0, ''); build(); foc(i + 1); render(); }
        if (e.key === 'Backspace' && !inp.value && S.lyr.length > 1) { e.preventDefault(); S.lyr.splice(i, 1); S.cur = Math.min(S.cur, S.lyr.length - 1); build(); foc(Math.max(0, i - 1)); render(); }
      };
      inp.onpaste = e => { const s = (e.clipboardData.getData('text') || ''); if (/\n|\s\/\s/.test(s.trim())) { e.preventDefault(); const a = inp.selectionStart ?? inp.value.length, b = inp.selectionEnd ?? a, ls = splitLy(inp.value.slice(0, a) + '\n' + s + '\n' + inp.value.slice(b)); if (ls.length) { S.lyr.splice(i, 1, ...ls); build(); render(); upd(); } } };
      d.onclick = () => { if (S.lyr.length > 1) { S.lyr.splice(i, 1); S.cur = Math.min(S.cur, S.lyr.length - 1); build(); render(); } }; r.append(n, inp, d); box.append(r);
    });
    const add = el('button', 'btn sm', '+ 줄 추가'); add.onclick = () => { S.lyr.push(''); build(); render(); const q = box.querySelectorAll('input'); q[q.length - 1].focus(); }; const bulk = el('details', 'bulk', '<summary>가사 한 번에 붙여넣기</summary>'), ta = el('textarea'), ap = el('button', 'btn pri big', '줄 나눠서 적용'), bh = el('div', 'hint', '줄바꿈, 빈 줄, " / "로 자동으로 나눠요. [Verse] 같은 구간 표시는 빼요. 지금 가사는 새 가사로 바뀌어요.');
    ta.rows = 6; ta.placeholder = '여기에 가사를 통째로 붙여넣으세요'; ta.spellcheck = false;
    const apply = () => { const ls = splitLy(ta.value); if (!ls.length) return; S.lyr = ls; S.cur = Math.min(S.cur, ls.length - 1); S.lsec = 0; build(); render(); upd(); };
    ta.onpaste = () => setTimeout(apply, 0); ap.onclick = apply; bulk.append(ta, ap, bh);
    box.append(add, bulk, el('div', 'hint', '번호를 누르면 그 줄이 현재 줄이 돼요. 여러 줄을 복사해서 칸에 붙여넣으면 줄이 자동으로 나뉘어요.'));
  };
  ups.push(() => box.querySelectorAll('.lr').forEach((r, i) => r.classList.toggle('on', i === S.cur))); build(); return box;
}

/* ----- 이미지 편집기 (확대/이동/회전/반전/밝기/비율) ----- */
function extract(src, done) {
  const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 6; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 6, 6); const d = x.getImageData(0, 0, 6, 6).data;
    const reg = (x0, y0, x1, y1) => { let r = 0, g = 0, b = 0, n = 0; for (let j = y0; j < y1; j++) for (let i = x0; i < x1; i++) { const o = (j * 6 + i) * 4; r += d[o]; g += d[o + 1]; b += d[o + 2]; n++; } return hex(r / n * .72, g / n * .72, b / n * .72); };
    done(reg(0, 2, 3, 5), reg(3, 3, 6, 6), reg(3, 0, 6, 3)); }; im.src = src;
}
function pickImage(file, cb) {
  if (!file || !file.type.startsWith('image/')) return; const r = new FileReader();
  r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 1600 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); const src = c.toDataURL('image/jpeg', .95); openImgEd(src, u => cb(u, src)); }; im.src = r.result; }; r.readAsDataURL(file);
}
function openImgEd(src, cb) {
  const ov = el('div', 'ov ed'), im = new Image(), dpr = Math.min(2, devicePixelRatio || 1), ptr = new Map(); document.body.append(ov);
  let ratio = 1, z = 1, ox = 0, oy = 0, rot = 0, flip = false, br = 100, ct = 100, fw = 1, fh = 1, pd = 0;
  const cv = el('canvas', 'edc'), RS = [['1:1', 1], ['4:3', 4 / 3], ['3:4', 3 / 4], ['16:9', 16 / 9], ['9:16', 9 / 16]];
  const place = (c, W) => {
    const s = W / fw, iw = im.naturalWidth, ih = im.naturalHeight, q = rot % 180, rw = q ? ih : iw, rh = q ? iw : ih, k = Math.max(fw / rw, fh / rh) * z, mx = Math.max(0, (rw * k - fw) / 2), my = Math.max(0, (rh * k - fh) / 2);
    ox = Math.max(-mx, Math.min(mx, ox)); oy = Math.max(-my, Math.min(my, oy)); c.save(); c.translate((fw / 2 + ox) * s, (fh / 2 + oy) * s); c.rotate(rot * Math.PI / 180); if (flip) c.scale(-1, 1); c.scale(k * s, k * s); c.drawImage(im, -iw / 2, -ih / 2); c.restore();
  };
  const draw = () => { const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#111'; c.fillRect(0, 0, cv.width, cv.height); place(c, cv.width); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(cv.width * i / 3, 0); c.lineTo(cv.width * i / 3, cv.height); c.moveTo(0, cv.height * i / 3); c.lineTo(cv.width, cv.height * i / 3); c.stroke(); } cv.style.filter = `brightness(${br}%) contrast(${ct}%)`; };
  const layout = () => { fw = Math.min(Math.min(innerWidth - 24, 560), innerHeight * .46 * ratio); fh = fw / ratio; cv.width = fw * dpr; cv.height = fh * dpr; cv.style.width = fw + 'px'; cv.style.height = fh + 'px'; draw(); };
  const dist = () => { const p = [...ptr.values()]; return p.length < 2 ? 0 : Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); };
  const zs = SL(1, () => 4, .01, () => z, v => { z = v; draw(); }), bs = SL(50, () => 150, 1, () => br, v => { br = v; draw(); }), cs = SL(50, () => 150, 1, () => ct, v => { ct = v; draw(); });
  cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); ptr.set(e.pointerId, [e.clientX, e.clientY]); pd = dist(); };
  cv.onpointermove = e => { if (!ptr.has(e.pointerId)) return; const o = ptr.get(e.pointerId); if (ptr.size === 1) { ox += e.clientX - o[0]; oy += e.clientY - o[1]; } ptr.set(e.pointerId, [e.clientX, e.clientY]); if (ptr.size === 2) { const d = dist(); if (pd) z = Math.max(1, Math.min(4, z * d / pd)); pd = d; zs.sy(); } draw(); };
  cv.onpointerup = cv.onpointercancel = e => { ptr.delete(e.pointerId); pd = 0; };
  cv.onwheel = e => { e.preventDefault(); z = Math.max(1, Math.min(4, z * Math.exp(-e.deltaY * .002))); zs.sy(); draw(); };
  const close = () => { removeEventListener('resize', layout); ov.remove(); };
  const top = el('div', 'edtop'), no = el('button', 'btn', '취소'), ok = el('button', 'btn pri', '적용'), seg = el('div', 'seg wrap'), tools = el('div', 'bs'), rows = el('div', 'edrows');
  top.append(no, el('b', '', '사진 편집'), ok); no.onclick = close;
  RS.forEach(([l, v]) => { const b = el('button', v === ratio ? 'on' : '', l); b.onclick = () => { ratio = v; [...seg.children].forEach(x => x.classList.toggle('on', x === b)); layout(); }; seg.append(b); });
  const bt = (t, f) => { const b = el('button', 'btn sm', t); b.onclick = f; tools.append(b); };
  bt('⟳ 회전', () => { rot = (rot + 90) % 360; draw(); }); bt('⇋ 좌우반전', () => { flip = !flip; draw(); }); bt('초기화', () => { z = 1; ox = oy = 0; rot = 0; flip = false; br = ct = 100; zs.sy(); bs.sy(); cs.sy(); draw(); });
  const row = (t, s) => { const r = el('div', 'edrow'); r.append(el('span', '', t), s.el); rows.append(r); }; row('확대', zs); row('밝기', bs); row('대비', cs);
  ok.onclick = () => {
    const s = Math.min(4, 800 / Math.max(fw, fh)), oc = document.createElement('canvas'); oc.width = Math.round(fw * s); oc.height = Math.round(fh * s); const c = oc.getContext('2d'); c.fillStyle = '#111'; c.fillRect(0, 0, oc.width, oc.height); place(c, oc.width);
    if (br !== 100 || ct !== 100) { const d = c.getImageData(0, 0, oc.width, oc.height), p = d.data; for (let i = 0; i < p.length; i += 4) for (let j = 0; j < 3; j++) p[i + j] = Math.max(0, Math.min(255, ((p[i + j] / 255 - .5) * ct / 100 + .5) * 255 * br / 100)); c.putImageData(d, 0, 0); }
    close(); cb(oc.toDataURL('image/jpeg', .92));
  };
  ov.append(top, cv, el('div', 'hint', '끌어서 위치를 옮기고, 두 손가락(또는 마우스 휠)으로 확대해요.'), seg, tools, rows);
  addEventListener('resize', layout); im.onload = layout; im.src = src;
}
function coverCtl() {
  const w = el('div', 'cvc'), th = el('button', 'thumb', '사진'), f = el('input'), bs = el('div', 'bs'); f.type = 'file'; f.accept = 'image/*'; f.hidden = true;
  const pick = file => pickImage(file, (u, src) => { S.cover = u; S.coverSrc = src; extract(u, (a, b, c) => { S.c1 = a; S.c2 = b; S.c3 = c; render(); upd(); }); });
  th.onclick = () => f.click(); f.onchange = () => { pick(f.files[0]); f.value = ''; };
  w.ondragover = e => { e.preventDefault(); w.classList.add('drag'); }; w.ondragleave = () => w.classList.remove('drag'); w.ondrop = e => { e.preventDefault(); w.classList.remove('drag'); pick(e.dataTransfer.files[0]); };
  const mk = (t, fn) => { const b = el('button', 'btn sm', t); b.onclick = fn; bs.append(b); };
  mk('사진 선택', () => f.click()); mk('다시 편집', () => S.coverSrc ? openImgEd(S.coverSrc, u => { S.cover = u; render(); upd(); }) : alert('새로 올린 사진부터 다시 편집할 수 있어요.')); mk('색 정밀 추출', () => openSampler({ keys: SMPK[S.mode] })); mk('삭제', () => set('cover', ''));
  w.append(th, f, bs); ups.push(() => { th.style.backgroundImage = S.cover ? `url(${S.cover})` : ''; th.textContent = S.cover ? '' : '사진'; }); return w;
}
function trackEd() {
  const box = el('div'); const build = () => {
    box.innerHTML = ''; S.tracks.forEach((t, i) => {
      const r = el('div', 'trk'), th = el('button', 'thumb'), f = el('input'), np = el('button', 'np', '▶'), x = el('button', 'x', '×'), mk = k => { const w = el('div', 'tf'), q = el('input'); q.type = 'text'; q.value = t[k]; q.oninput = () => { t[k] = q.value; render(); }; w.append(q); return w; };
      f.type = 'file'; f.accept = 'image/*'; f.hidden = true; th.style.backgroundImage = t.img ? `url(${t.img})` : ''; th.onclick = () => f.click(); f.onchange = () => { pickImage(f.files[0], u => { t.img = u; th.style.backgroundImage = `url(${u})`; render(); }); f.value = ''; };
      np.classList.toggle('on', S.np === i + 1); np.onclick = () => { S.np = S.np === i + 1 ? 0 : i + 1; render(); build(); }; x.onclick = () => { S.tracks.splice(i, 1); if (S.np > S.tracks.length) S.np = 0; render(); build(); };
      const col = el('div', 'tcol'); col.append(mk('t'), mk('a')); r.append(th, f, col, np, x); box.append(r);
    });
    const ad = el('button', 'btn sm', '+ 곡 추가'); ad.onclick = () => { if (S.tracks.length < 12) { S.tracks.push({ t: '새 곡', a: '아티스트', img: '' }); render(); build(); } }; box.append(ad, el('div', 'hint', '▶ = 하단 플레이어에 올라간 곡 · 네모를 누르면 곡 사진을 바꿔요'));
  }; build(); return box;
}

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


const SMPK = { lyric: ['c1', 'c2', 'c3'], pad: ['c1', 'c2', 'c3'], list: ['c1', 'c2', 'c3'], pod: ['podb', 'podw'], widget: ['wc', 'wt', 'wbg'] };

function openSampler(o) {
  if (!S.cover) { alert('먼저 커버 이미지를 올려주세요.'); return; }
  const LB = { c1: '배경 1', c2: '배경 2', c3: '배경 3', podb: '본체', podw: '휠', wc: '카드', wt: '글자', wbg: '바깥' };
  const keys = o.keys || ['_'], vals = {}; keys.forEach(k => vals[k] = o.single ? o.color : S[k]); let act = keys[0];
  const ov = el('div', 'ov'); document.body.append(ov); const im = new Image();
  im.onload = () => {
    const nc = document.createElement('canvas'); nc.width = im.width; nc.height = im.height; const nx = nc.getContext('2d', { willReadFrequently: true }); nx.drawImage(im, 0, 0);
    const k = Math.min(Math.min(innerWidth - 32, 620) / im.width, innerHeight * .6 / im.height), dw = im.width * k, dh = im.height * k;
    const chips = el('div', 'seg wrap'), stg = el('div', 'crst'), cv = el('canvas'), lp = el('canvas', 'loupe'), bs = el('div', 'bs'), ok = el('button', 'btn pri', '적용'), no = el('button', 'btn', '취소');
    cv.width = im.width; cv.height = im.height; cv.getContext('2d').drawImage(im, 0, 0); cv.style.cssText = `width:${dw}px;height:${dh}px;display:block;touch-action:none;cursor:crosshair`; stg.style.cssText = `width:${dw}px;height:${dh}px`; lp.width = lp.height = 108; lp.hidden = true;
    const paint = () => { chips.innerHTML = ''; keys.forEach(kk => { const b = el('button', kk === act ? 'on' : '', `<span class="dot" style="background:${vals[kk]}"></span> ${o.single ? '선택한 색' : LB[kk]} ${vals[kk].toUpperCase()}`); b.onclick = () => { act = kk; paint(); }; chips.append(b); }); };
    const pick = e => {
      const b = cv.getBoundingClientRect(), px = Math.max(0, Math.min(b.width - 1, e.clientX - b.left)), py = Math.max(0, Math.min(b.height - 1, e.clientY - b.top)), x = Math.floor(px / b.width * im.width), y = Math.floor(py / b.height * im.height), d = nx.getImageData(x, y, 1, 1).data;
      vals[act] = hex(d[0], d[1], d[2]); paint();
      const l = lp.getContext('2d'); l.imageSmoothingEnabled = false; l.clearRect(0, 0, 108, 108); l.drawImage(nc, x - 4, y - 4, 9, 9, 0, 0, 108, 108); l.lineWidth = 3; l.strokeStyle = '#fff'; l.strokeRect(48, 48, 12, 12); l.lineWidth = 1; l.strokeStyle = '#000'; l.strokeRect(48, 48, 12, 12);
      lp.style.left = Math.max(0, Math.min(b.width - 108, px - 54)) + 'px'; lp.style.top = Math.max(0, py - 140) + 'px'; lp.hidden = false;
    };
    cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); pick(e); cv.onpointermove = pick; }; cv.onpointerup = () => { cv.onpointermove = null; lp.hidden = true; };
    no.onclick = () => ov.remove();
    ok.onclick = () => { ov.remove(); if (o.single) o.done(vals._); else { keys.forEach(kk => { if (vals[kk] !== S[kk]) { S[kk] = vals[kk]; addHist(vals[kk]); } }); render(); upd(); } };
    paint(); stg.append(cv, lp); bs.append(no, ok); ov.append(chips, stg, el('div', 'hint', '사진을 누르면 그 색이 선택돼요. 누른 채로 움직이면 돋보기로 정확한 픽셀을 볼 수 있어요.'), bs);
  };
  im.src = S.cover;
}
