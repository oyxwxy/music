'use strict';
/* tools.js : 이미지 자르기 / 정밀 색 추출 (anim.js 다음, app.js 이전에 불러옵니다) */
const SMPK = { lyric: ['c1', 'c2', 'c3'], pad: ['c1', 'c2', 'c3'], list: ['c1', 'c2', 'c3'], pod: ['podb', 'podw'], widget: ['wc', 'wt', 'wbg'] };

function openCropper(src, cb) {
  const ov = el('div', 'ov'); document.body.append(ov);
  const im = new Image(), RS = [['1:1', 1], ['4:3', 4 / 3], ['3:4', 3 / 4], ['16:9', 16 / 9], ['자유', 0]];
  let r = 1, R = { x: 0, y: 0, w: 0, h: 0 }, dw = 0, dh = 0, sc = 1, op = null;
  const seg = el('div', 'seg wrap'), st = el('div', 'crst'), box = el('div', 'crop', '<i data-c="tl"></i><i data-c="tr"></i><i data-c="bl"></i><i data-c="br"></i>'), bs = el('div', 'bs'), ok = el('button', 'btn pri', '자르기'), no = el('button', 'btn', '취소');
  const show = () => { box.style.cssText = `left:${R.x}px;top:${R.y}px;width:${R.w}px;height:${R.h}px`; };
  const setR = nr => {
    r = nr; const cx = R.w ? R.x + R.w / 2 : dw / 2, cy = R.h ? R.y + R.h / 2 : dh / 2, w = r ? Math.min(dw, dh * r) * .85 : (R.w || dw * .85), h = r ? w / r : (R.h || dh * .85);
    R = { x: Math.max(0, Math.min(dw - w, cx - w / 2)), y: Math.max(0, Math.min(dh - h, cy - h / 2)), w, h }; show(); [...seg.children].forEach((b, i) => b.classList.toggle('on', RS[i][1] === r));
  };
  const pt = e => { const b = st.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
  const mv = e => {
    if (!op) return; const p = pt(e);
    if (op.mv) { R.x = Math.max(0, Math.min(dw - R.w, p.x - op.dx)); R.y = Math.max(0, Math.min(dh - R.h, p.y - op.dy)); }
    else {
      const l = op.c.includes('l'), t = op.c.includes('t'); let w = Math.abs(p.x - op.fx), h = Math.abs(p.y - op.fy); const mw = l ? op.fx : dw - op.fx, mh = t ? op.fy : dh - op.fy;
      if (r) { w = Math.max(30, Math.min(w, mw, mh * r)); h = w / r; } else { w = Math.max(30, Math.min(w, mw)); h = Math.max(30, Math.min(h, mh)); }
      R = { x: l ? op.fx - w : op.fx, y: t ? op.fy - h : op.fy, w, h };
    } show();
  };
  const up = () => { op = null; };
  const close = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); ov.remove(); };
  st.onpointerdown = e => { const c = e.target.dataset.c, p = pt(e); if (c) op = { c, fx: c.includes('l') ? R.x + R.w : R.x, fy: c.includes('t') ? R.y + R.h : R.y }; else if (e.target === box) op = { mv: 1, dx: p.x - R.x, dy: p.y - R.y }; if (op) e.preventDefault(); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
  RS.forEach(([l, v]) => { const b = el('button', '', l); b.onclick = () => setR(v); seg.append(b); });
  no.onclick = close;
  ok.onclick = () => { const sx = R.x / sc, sy = R.y / sc, sw = R.w / sc, sh = R.h / sc, k = Math.min(1, 800 / Math.max(sw, sh)), c = document.createElement('canvas'); c.width = Math.round(sw * k); c.height = Math.round(sh * k); c.getContext('2d').drawImage(im, sx, sy, sw, sh, 0, 0, c.width, c.height); close(); cb(c.toDataURL('image/jpeg', .92)); };
  im.onload = () => {
    sc = Math.min(Math.min(innerWidth - 32, 640) / im.width, innerHeight * .6 / im.height); dw = im.width * sc; dh = im.height * sc;
    im.draggable = false; im.style.cssText = `width:${dw}px;height:${dh}px;display:block;user-select:none;-webkit-user-select:none`; st.style.cssText = `width:${dw}px;height:${dh}px`;
    st.append(im, box); bs.append(no, ok); ov.append(seg, st, el('div', 'hint', '네모를 끌어 위치를, 모서리를 끌어 크기를 바꿔요.'), bs); setR(1);
  };
  im.src = src;
}

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
