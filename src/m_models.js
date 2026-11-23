'use strict';
/* ===== Mesh builder + low-poly models ===== */
const _C = c => typeof c === 'number' ? hex(c) : c;
const IDX6 = [0, 1, 2, 0, 2, 3];

class MB {
  constructor() { this.a = []; }
  get n() { return this.a.length / 11; }
  vtx(p, n, c, u, v) { this.a.push(p[0], p[1], p[2], n[0], n[1], n[2], c[0], c[1], c[2], u || 0, v || 0); }
  quadN(P, n, c, uv) { for (const i of IDX6) this.vtx(P[i], n, c, uv ? uv[i][0] : 0, uv ? uv[i][1] : 0); }
  quadVN(P, N, c) { for (const i of IDX6) this.vtx(P[i], N[i], c); }
  triN(p0, p1, p2, n, c) { this.vtx(p0, n, c); this.vtx(p1, n, c); this.vtx(p2, n, c); }
  tri(p0, p1, p2, c, hint) {
    c = _C(c);
    let n = V3.norm(V3.cross(V3.sub(p1, p0), V3.sub(p2, p0)));
    if (hint && V3.dot(n, hint) < 0) n = [-n[0], -n[1], -n[2]];
    this.triN(p0, p1, p2, n, c);
  }
  quad(p0, p1, p2, p3, c, hint, uv) {
    c = _C(c);
    let n = V3.norm(V3.cross(V3.sub(p2, p0), V3.sub(p3, p1)));
    if (hint && V3.dot(n, hint) < 0) n = [-n[0], -n[1], -n[2]];
    this.quadN([p0, p1, p2, p3], n, c, uv);
  }
  /* axis-aligned box in local space then transformed. uvc=[cellW,cellH] repeat mapping; uvFull = 0..1 per face */
  box(col, size, pos, rot, uvc, uvFull) {
    col = _C(col);
    const m = M.xf(pos || [0, 0, 0], rot);
    const h = [size[0] / 2, size[1] / 2, size[2] / 2];
    for (let a = 0; a < 3; a++) for (const s of [-1, 1]) {
      const u = (a + 1) % 3, v = (a + 2) % 3;
      const mk = (su, sv) => { const p = [0, 0, 0]; p[a] = s * h[a]; p[u] = su * h[u]; p[v] = sv * h[v]; return p; };
      const cs = [mk(-1, -1), mk(1, -1), mk(1, 1), mk(-1, 1)];
      const nl = [0, 0, 0]; nl[a] = s;
      const P = cs.map(c => M.pt(m, c[0], c[1], c[2]));
      const N = M.dir(m, nl[0], nl[1], nl[2]);
      let uv = null;
      if (uvFull) uv = [[0, 0], [1, 0], [1, 1], [0, 1]];
      else if (uvc) uv = cs.map(c => a === 1 ? [c[0] / uvc[0], c[2] / uvc[0]] : a === 0 ? [c[2] / uvc[0], c[1] / uvc[1]] : [c[0] / uvc[0], c[1] / uvc[1]]);
      this.quadN(P, N, col, uv);
    }
  }
  /* cylinder along local Y, rt = top radius, rb = bottom radius */
  cyl(col, rt, rb, h, seg, pos, rot, caps) {
    col = _C(col); seg = seg || 10; caps = caps !== false;
    const m = M.xf(pos || [0, 0, 0], rot);
    const slope = (rb - rt) / h, hh = h / 2;
    for (let i = 0; i < seg; i++) {
      const a0 = TAU * i / seg, a1 = TAU * (i + 1) / seg;
      const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      const P = [M.pt(m, rb * c0, -hh, rb * s0), M.pt(m, rb * c1, -hh, rb * s1), M.pt(m, rt * c1, hh, rt * s1), M.pt(m, rt * c0, hh, rt * s0)];
      const n0 = V3.norm([c0, slope, s0]), n1 = V3.norm([c1, slope, s1]);
      const N0 = M.dir(m, n0[0], n0[1], n0[2]), N1 = M.dir(m, n1[0], n1[1], n1[2]);
      this.quadVN(P, [N0, N1, N1, N0], col);
      if (caps) {
        if (rt > 0.001) this.triN(M.pt(m, 0, hh, 0), M.pt(m, rt * c0, hh, rt * s0), M.pt(m, rt * c1, hh, rt * s1), M.dir(m, 0, 1, 0), col);
        if (rb > 0.001) this.triN(M.pt(m, 0, -hh, 0), M.pt(m, rb * c1, -hh, rb * s1), M.pt(m, rb * c0, -hh, rb * s0), M.dir(m, 0, -1, 0), col);
      }
    }
  }
  /* cylinder between two world/local points; r0 at p0, r1 at p1 */
  cylAxis(col, r0, r1, p0, p1, seg, caps) {
    const d = V3.sub(p1, p0), len = Math.hypot(d[0], d[1], d[2]);
    if (len < 1e-5) return;
    const a = Math.acos(clamp(d[1] / len, -1, 1)), yaw = Math.atan2(d[0], d[2]);
    this.cyl(col, r1, r0, len, seg || 6, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2], [a, yaw, 0], caps);
  }
  /* ellipsoid */
  sph(col, r, pos, rot, segs, rings) {
    col = _C(col); segs = segs || 9; rings = rings || 6;
    const R = Array.isArray(r) ? r : [r, r, r];
    const m = M.xf(pos || [0, 0, 0], rot);
    const vp = (i, j) => {
      const phi = -Math.PI / 2 + Math.PI * i / rings, lam = TAU * j / segs;
      const cx = Math.cos(phi) * Math.cos(lam), cy = Math.sin(phi), cz = Math.cos(phi) * Math.sin(lam);
      const p = M.pt(m, cx * R[0], cy * R[1], cz * R[2]);
      const nn = V3.norm([cx / R[0], cy / R[1], cz / R[2]]);
      return [p, M.dir(m, nn[0], nn[1], nn[2])];
    };
    for (let i = 0; i < rings; i++) for (let j = 0; j < segs; j++) {
      const A = vp(i, j), B = vp(i, j + 1), C = vp(i + 1, j + 1), D = vp(i + 1, j);
      this.quadVN([A[0], B[0], C[0], D[0]], [A[1], B[1], C[1], D[1]], col);
    }
  }
  /* box-ish limb between two points */
  limb(col, p0, p1, tx, ty) {
    const d = V3.sub(p1, p0), len = Math.hypot(d[0], d[1], d[2]);
    if (len < 1e-5) return;
    const pitch = -Math.asin(clamp(d[1] / len, -1, 1)), yaw = Math.atan2(d[0], d[2]);
    this.box(col, [tx, ty === undefined ? tx : ty, len], [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2], [pitch, yaw, 0]);
  }
  data() { return new Float32Array(this.a); }
}

/* ===== procedural textures (canvas) ===== */
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
const TEXFN = {
  facade() {
    const c = mkCanvas(128, 128), g = c.getContext('2d');
    g.fillStyle = '#2a3150'; g.fillRect(0, 0, 128, 128);
    const rnd = mulberry32(5), lit = ['#ffe9a0', '#ffd27a', '#9fe8ff', '#ffc0ea'];
    for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) {
      const x = q * 32 + 5, y = r * 32 + 6;
      g.fillStyle = rnd() < 0.5 ? lit[Math.floor(rnd() * lit.length)] : '#151a2e';
      g.fillRect(x, y, 22, 18);
      g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x, y, 22, 3);
    }
    g.fillStyle = 'rgba(0,0,0,0.25)'; for (let r = 0; r < 4; r++) g.fillRect(0, r * 32 + 28, 128, 4);
    return c;
  },
  facadeDay() {
    const c = mkCanvas(128, 128), g = c.getContext('2d');
    g.fillStyle = '#f3f1ec'; g.fillRect(0, 0, 128, 128);
    const rnd = mulberry32(9);
    for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) {
      const x = q * 32 + 5, y = r * 32 + 7;
      g.fillStyle = '#4d7098'; g.fillRect(x, y, 22, 17);
      g.fillStyle = 'rgba(190,225,255,0.55)'; g.fillRect(x, y, 22, 6);
      g.fillStyle = '#c9c4ba'; g.fillRect(x - 1, y + 17, 24, 3);
      if (rnd() < 0.14) { g.fillStyle = '#e8e8ee'; g.fillRect(x + 2, y + 5, 18, 6); }
    }
    g.fillStyle = 'rgba(0,0,0,0.10)'; for (let r = 0; r < 4; r++) g.fillRect(0, r * 32 + 28, 128, 3);
    return c;
  },
  sign() {
    const c = mkCanvas(256, 128), g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#e9b84a'; g.fillRect(0, 0, 256, 9); g.fillRect(0, 119, 256, 9);
    g.fillStyle = '#1c473a'; g.fillRect(0, 9, 256, 3); g.fillRect(0, 116, 256, 3);
    if (typeof LOGO_IMG !== 'undefined' && LOGO_IMG.naturalWidth) {
      const w = 228, h = w * LOGO_IMG.naturalHeight / LOGO_IMG.naturalWidth;
      g.drawImage(LOGO_IMG, 14, 62 - h / 2, w, h);
    } else { g.fillStyle = '#1c473a'; g.font = '900 56px Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NUMIND', 128, 60); }
    g.fillStyle = '#1c473a'; g.font = 'bold 15px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('NUSANTARA RACING', 128, 101);
    return c;
  },
  banner() {
    // quad is ~12.9:1 but texture 8:1, so draw with a horizontal compensation factor
    const c = mkCanvas(1024, 128), g = c.getContext('2d'), F = 1.607;
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 1024, 128);
    g.save(); g.scale(1 / F, 1);
    const W = 1024 * F;
    for (let i = 0; i < 46; i++) { g.fillStyle = i % 2 ? '#fff' : '#1c1c1c'; g.fillRect(i * 36, 0, 36, 18); g.fillStyle = i % 2 ? '#1c1c1c' : '#fff'; g.fillRect(i * 36, 110, 36, 18); }
    g.fillStyle = '#e9b84a'; g.fillRect(0, 18, W, 5); g.fillRect(0, 105, W, 5);
    if (typeof LOGO_IMG !== 'undefined' && LOGO_IMG.naturalWidth) {
      const h = 74, w = h * LOGO_IMG.naturalWidth / LOGO_IMG.naturalHeight;
      g.drawImage(LOGO_IMG, W / 2 - w / 2, 64 - h / 2, w, h);
    }
    g.fillStyle = '#1c473a'; g.font = '900 56px Impact, "Arial Black", sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'center';
    g.fillText('START', W * 0.17, 66); g.fillText('FINISH', W * 0.83, 66);
    g.restore();
    return c;
  },
  qmark() {
    const c = mkCanvas(64, 64), g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 64, 64); gr.addColorStop(0, '#2b6bff'); gr.addColorStop(1, '#7a2bff');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    g.strokeStyle = '#ffd23a'; g.lineWidth = 6; g.strokeRect(3, 3, 58, 58);
    g.fillStyle = '#ffffff'; g.font = '900 52px Impact, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('?', 32, 36);
    return c;
  },
  trukSide() {
    const c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 512, 256);
    // generic blue geometric emblem (fork/spoon + leaf motif)
    g.save(); g.translate(86, 128);
    g.fillStyle = '#1a47c8';
    g.beginPath(); g.arc(0, 0, 66, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 50, 0, TAU); g.fill();
    g.fillStyle = '#1a47c8';
    g.beginPath(); g.ellipse(-16, -4, 13, 24, -0.4, 0, TAU); g.fill();
    g.fillRect(-19, 8, 6, 34);
    g.fillRect(14, -30, 6, 72);
    g.beginPath(); g.moveTo(8, -34); g.lineTo(28, -34); g.lineTo(26, -6); g.lineTo(10, -6); g.closePath(); g.fill();
    g.fillStyle = '#2fb35a'; g.beginPath(); g.ellipse(0, 36, 26, 9, 0, 0, TAU); g.fill();
    g.restore();
    g.fillStyle = '#1a47c8'; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.font = '900 54px Impact, "Arial Black", sans-serif'; g.fillText('SATUAN', 168, 70);
    g.fillText('PELAYANAN', 168, 128);
    g.fillStyle = '#2fb35a'; g.fillText('PEMENUHAN', 168, 186);
    g.fillStyle = '#1a47c8'; g.font = '900 38px Impact, "Arial Black", sans-serif'; g.fillText('GIZI  •  NUSANTARA', 168, 232);
    g.fillRect(0, 248, 512, 8);
    return c;
  },
  pickupSide() {
    const c = mkCanvas(256, 128), g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 128);
    // generic house icon (red/white)
    g.save(); g.translate(40, 64);
    g.fillStyle = '#d4121a'; g.fillRect(-26, -2, 52, 36);
    g.beginPath(); g.moveTo(-34, -2); g.lineTo(0, -34); g.lineTo(34, -2); g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.fillRect(-8, 10, 16, 24); g.fillRect(-20, 4, 9, 9); g.fillRect(11, 4, 9, 9);
    g.restore();
    g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillStyle = '#d4121a'; g.font = '900 38px Impact, "Arial Black", sans-serif'; g.fillText('KOPERASI DESA', 84, 48);
    g.fillStyle = '#111'; g.font = '900 30px Impact, "Arial Black", sans-serif'; g.fillText('MERAH PUTIH', 84, 92);
    return c;
  },
  fruitTag() { return TEXFN.qmark(); },
};

/* ===== wheel ===== */
function wheelData(r, w, tire, hub) {
  const b = new MB();
  b.cyl(tire || 0x1b1b20, r, r, w, 14, [0, 0, 0], [0, 0, Math.PI / 2]);
  b.cyl(hub || 0xdedede, r * 0.55, r * 0.55, w + 0.03, 8, [0, 0, 0], [0, 0, Math.PI / 2]);
  b.box(tire || 0x222228, [w + 0.05, r * 1.15, r * 0.16], [0, 0, 0]);
  b.box(0xffffff, [w + 0.06, r * 0.16, r * 0.8], [0, 0, 0]);
  return b.data();
}

/* ===== vehicles ===== */
const VEH_BUILD = {
  /* white box truck "Truk Gizi" */
  truk() {
    const b = new MB(), g = new MB(), WHITE = 0xf4f6f8, GREY = 0x4a4f58;
    b.box(GREY, [1.7, 0.35, 4.3], [0, 0.62, 0]);
    // cab
    b.box(WHITE, [1.8, 1.15, 1.55], [0, 1.45, 1.35]);
    b.box(WHITE, [1.8, 0.1, 1.55], [0, 2.12, 1.35]);
    b.box(WHITE, [1.78, 0.62, 0.6], [0, 1.1, 2.0]);
    b.box(0x2a2d34, [1.4, 0.35, 0.05], [0, 1.0, 2.31]);       // grille
    b.box(GREY, [1.85, 0.22, 0.2], [0, 0.55, 2.25]);          // bumper
    b.box(0xfff1a8, [0.32, 0.2, 0.05], [0.62, 1.12, 2.31]);
    b.box(0xfff1a8, [0.32, 0.2, 0.05], [-0.62, 1.12, 2.31]);
    b.box(0xffa21a, [0.16, 0.12, 0.05], [0.82, 0.88, 2.3]);
    b.box(0xffa21a, [0.16, 0.12, 0.05], [-0.82, 0.88, 2.3]);
    // cargo box
    b.box(WHITE, [1.9, 1.95, 2.6], [0, 1.78, -0.95]);
    b.box(0x1a47c8, [1.94, 0.12, 2.64], [0, 0.86, -0.95]);
    b.box(0xd5dae0, [1.8, 0.08, 2.5], [0, 2.78, -0.95]);
    b.box(0xc22222, [0.35, 0.18, 0.06], [0.75, 0.95, -2.27]);
    b.box(0xc22222, [0.35, 0.18, 0.06], [-0.75, 0.95, -2.27]);
    b.box(0x333840, [1.7, 0.2, 0.18], [0, 0.55, -2.25]);
    // door emblem
    b.cyl(0x14246e, 0.22, 0.22, 0.02, 14, [0.915, 1.45, 1.35], [0, 0, Math.PI / 2]);
    b.cyl(0x14246e, 0.22, 0.22, 0.02, 14, [-0.915, 1.45, 1.35], [0, 0, Math.PI / 2]);
    b.cyl(0xffffff, 0.1, 0.1, 0.03, 8, [0.92, 1.45, 1.35], [0, 0, Math.PI / 2]);
    b.cyl(0xffffff, 0.1, 0.1, 0.03, 8, [-0.92, 1.45, 1.35], [0, 0, Math.PI / 2]);
    // mirrors
    b.box(0x222222, [0.08, 0.3, 0.2], [1.0, 1.75, 2.0]);
    b.box(0x222222, [0.08, 0.3, 0.2], [-1.0, 1.75, 2.0]);
    // glass
    g.box(0x9fd8ff, [1.62, 0.7, 0.05], [0, 1.8, 2.1], [-0.2, 0, 0]);
    g.box(0x9fd8ff, [0.04, 0.62, 1.15], [0.905, 1.8, 1.35]);
    g.box(0x9fd8ff, [0.04, 0.62, 1.15], [-0.905, 1.8, 1.35]);
    const dec = [];
    const dR = new MB(), dL = new MB(); // quads for decals: right side x<0, left side x>0
    const yc = 1.8, hh = 0.65, z0 = -2.15, z1 = 0.2;
    dR.quadN([[-0.96, yc - hh, z0], [-0.96, yc - hh, z1], [-0.96, yc + hh, z1], [-0.96, yc + hh, z0]], [-1, 0, 0], [1, 1, 1], [[0, 0], [1, 0], [1, 1], [0, 1]]);
    dL.quadN([[0.96, yc - hh, z0], [0.96, yc - hh, z1], [0.96, yc + hh, z1], [0.96, yc + hh, z0]], [1, 0, 0], [1, 1, 1], [[1, 0], [0, 0], [0, 1], [1, 1]]);
    dec.push({ data: dR.data(), tex: 'trukSide' }, { data: dL.data(), tex: 'trukSide' });
    return {
      id: 'truk', body: b.data(), glass: g.data(), decals: dec, kind: 'car', lean: 1, leanAmt: 0.03,
      wheels: [
        { pos: [0.86, 0.45, 1.4], r: 0.45, w: 0.3, front: true }, { pos: [-0.86, 0.45, 1.4], r: 0.45, w: 0.3, front: true },
        { pos: [0.86, 0.45, -1.55], r: 0.45, w: 0.32 }, { pos: [-0.86, 0.45, -1.55], r: 0.45, w: 0.32 }],
      seat: [-0.42, 1.24, 1.3], charScale: 0.8, exhaust: [0.6, 0.4, -2.3], len: 4.4, wid: 1.9, camH: 5.4, camD: 11.5,
    };
  },
  /* 4x4 pickup "Koperasi Desa" */
  pickup() {
    const b = new MB(), g = new MB(), WHITE = 0xf5f5f2, BLACK = 0x17171a;
    b.box(0x3b3f46, [1.8, 0.35, 4.9], [0, 0.78, 0]);
    // hood + front
    b.box(WHITE, [1.9, 0.6, 1.5], [0, 1.2, 1.75]);
    b.box(WHITE, [1.9, 0.2, 1.4], [0, 1.52, 1.7], [0.08, 0, 0]);
    b.box(BLACK, [1.45, 0.4, 0.06], [0, 1.15, 2.52]);
    b.box(BLACK, [2.0, 0.3, 0.25], [0, 0.72, 2.5]);
    b.cyl(0xfff1a8, 0.17, 0.17, 0.08, 10, [0.7, 1.25, 2.52], [Math.PI / 2, 0, 0]);
    b.cyl(0xfff1a8, 0.17, 0.17, 0.08, 10, [-0.7, 1.25, 2.52], [Math.PI / 2, 0, 0]);
    // cab
    b.box(WHITE, [1.9, 0.7, 1.7], [0, 1.58, 0.35]);
    b.box(WHITE, [1.9, 0.1, 1.7], [0, 2.56, 0.35]);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(WHITE, [0.1, 0.9, 0.1], [sx * 0.9, 2.1, 0.35 + sz * 0.78]);
    // bed
    b.box(WHITE, [1.9, 0.14, 2.0], [0, 1.25, -1.62]);
    b.box(WHITE, [0.1, 0.5, 2.0], [0.93, 1.5, -1.62]);
    b.box(WHITE, [0.1, 0.5, 2.0], [-0.93, 1.5, -1.62]);
    b.box(WHITE, [1.9, 0.5, 0.1], [0, 1.5, -2.62]);
    b.box(WHITE, [1.9, 0.5, 0.1], [0, 1.5, -0.65]);
    // roll cage
    for (const sx of [-1, 1]) for (const z of [-0.85, -2.35]) b.cylAxis(BLACK, 0.045, 0.045, [sx * 0.82, 1.3, z], [sx * 0.82, 2.5, z], 6);
    for (const sx of [-1, 1]) b.cylAxis(BLACK, 0.045, 0.045, [sx * 0.82, 2.5, -0.85], [sx * 0.82, 2.5, -2.35], 6);
    b.cylAxis(BLACK, 0.045, 0.045, [-0.82, 2.5, -0.85], [0.82, 2.5, -0.85], 6);
    b.cylAxis(BLACK, 0.045, 0.045, [-0.82, 2.5, -2.35], [0.82, 2.5, -2.35], 6);
    // fender flares + lights
    b.box(BLACK, [0.14, 0.14, 1.1], [1.0, 0.95, 1.55]); b.box(BLACK, [0.14, 0.14, 1.1], [-1.0, 0.95, 1.55]);
    b.box(0xc22222, [0.3, 0.2, 0.06], [0.8, 1.25, -2.68]); b.box(0xc22222, [0.3, 0.2, 0.06], [-0.8, 1.25, -2.68]);
    b.box(BLACK, [0.08, 0.3, 0.2], [1.02, 2.0, 1.1]); b.box(BLACK, [0.08, 0.3, 0.2], [-1.02, 2.0, 1.1]);
    // glass
    g.box(0x9fd8ff, [1.7, 0.7, 0.05], [0, 2.08, 1.16], [-0.25, 0, 0]);
    g.box(0x9fd8ff, [0.04, 0.62, 1.5], [0.955, 2.1, 0.35]);
    g.box(0x9fd8ff, [0.04, 0.62, 1.5], [-0.955, 2.1, 0.35]);
    g.box(0x9fd8ff, [1.7, 0.6, 0.05], [0, 2.1, -0.5]);
    const dR = new MB(), dL = new MB(), yc = 1.55, hh = 0.32, z0 = -0.38, z1 = 1.08;
    dR.quadN([[-0.96, yc - hh, z0], [-0.96, yc - hh, z1], [-0.96, yc + hh, z1], [-0.96, yc + hh, z0]], [-1, 0, 0], [1, 1, 1], [[0, 0], [1, 0], [1, 1], [0, 1]]);
    dL.quadN([[0.96, yc - hh, z0], [0.96, yc - hh, z1], [0.96, yc + hh, z1], [0.96, yc + hh, z0]], [1, 0, 0], [1, 1, 1], [[1, 0], [0, 0], [0, 1], [1, 1]]);
    const dec = [{ data: dR.data(), tex: 'pickupSide' }, { data: dL.data(), tex: 'pickupSide' }];
    // red/white stripe on bed
    b.box(0xd4121a, [1.96, 0.08, 2.05], [0, 1.2, -1.62]);
    return {
      id: 'pickup', body: b.data(), glass: g.data(), decals: dec, kind: 'car', lean: 1, leanAmt: 0.035,
      wheels: [
        { pos: [0.98, 0.52, 1.6], r: 0.52, w: 0.36, front: true }, { pos: [-0.98, 0.52, 1.6], r: 0.52, w: 0.36, front: true },
        { pos: [0.98, 0.52, -1.75], r: 0.52, w: 0.38 }, { pos: [-0.98, 0.52, -1.75], r: 0.52, w: 0.38 }],
      seat: [-0.45, 1.5, 0.35], charScale: 0.8, exhaust: [0.6, 0.5, -2.7], len: 5.2, wid: 2.1, camH: 5.0, camD: 11,
    };
  },
  /* scooter builder shared by the two delivery bikes */
  _scooter(o) {
    const b = new MB(), body = o.body, trim = o.trim, dark = 0x1d1d22;
    b.box(dark, [0.46, 0.12, 1.05], [0, 0.4, 0.05]);                 // floorboard
    b.box(body, [0.5, 0.44, 0.8], [0, 0.66, -0.55]);                   // rear body
    b.box(trim, [0.52, 0.1, 0.82], [0, 0.45, -0.55]);
    b.box(dark, [0.42, 0.11, 0.78], [0, 0.93, -0.35]);                 // seat
    b.box(body, [0.52, 0.66, 0.16], [0, 0.82, 0.55], [-0.28, 0, 0]);   // leg shield
    b.box(trim, [0.54, 0.2, 0.2], [0, 1.1, 0.5]);                      // front cowl
    b.box(dark, [0.82, 0.07, 0.07], [0, 1.2, 0.42]);                   // handlebar
    b.sph(dark, 0.06, [0.41, 1.2, 0.42], null, 5, 4); b.sph(dark, 0.06, [-0.41, 1.2, 0.42], null, 5, 4);
    b.box(0xfff2b0, [0.2, 0.12, 0.06], [0, 1.06, 0.62]);               // headlight
    b.box(0x222222, [0.04, 0.2, 0.04], [0.32, 1.3, 0.46]); b.box(0x222222, [0.04, 0.2, 0.04], [-0.32, 1.3, 0.46]);
    b.box(trim, [0.1, 0.07, 0.07], [0.32, 1.42, 0.46]); b.box(trim, [0.1, 0.07, 0.07], [-0.32, 1.42, 0.46]);
    b.cyl(0x8a8a90, 0.07, 0.07, 0.6, 7, [0.24, 0.3, -0.85], [Math.PI / 2, 0, 0]);   // exhaust
    b.box(0xd01818, [0.22, 0.1, 0.05], [0, 0.78, -0.96]);              // taillight
    b.box(body, [0.22, 0.05, 0.62], [0, 0.66, 0.85]);                  // (front fender is on the wheel mesh side)
    // delivery box
    b.box(o.box, [0.62, 0.55, 0.56], [0, 1.28, -0.92]);
    b.box(o.boxTrim, [0.64, 0.1, 0.58], [0, 1.18, -0.92]);
    b.box(0xffffff, [0.5, 0.32, 0.02], [0, 1.3, -1.21]);
    b.box(o.box, [0.12, 0.12, 0.12], [0, 1.0, -0.6]);
    const wheels = [
      { pos: [0, o.r, 0.82], r: o.r, w: 0.17, front: true, tire: 0x17171b, hub: o.hub },
      { pos: [0, o.r, -0.82], r: o.r, w: 0.2, tire: 0x17171b, hub: o.hub }];
    return {
      id: o.id, body: b.data(), glass: null, decals: [], kind: 'bike', lean: -1, leanAmt: 0.32, wheels,
      seat: [0, 0.9, -0.3], charScale: 0.74, exhaust: [0.24, 0.3, -1.15], len: 2.1, wid: 0.9, camH: 4.3, camD: 9.5,
    };
  },
  ojol() {
    return VEH_BUILD._scooter({ id: 'ojol', body: 0xe9e4d2, trim: 0x18a845, box: 0x10b33c, boxTrim: 0x0a7a2a, hub: 0x18a845, r: 0.34 });
  },
  kurir() {
    return VEH_BUILD._scooter({ id: 'kurir', body: 0xf3efe6, trim: 0xd3281e, box: 0xff6a1a, boxTrim: 0xc24300, hub: 0xd3281e, r: 0.3 });
  },
};

/* ===== characters (original cartoon avatars) — origin at hips, +Z forward ===== */
const CHAR_BUILD = (id, kind) => {
  const b = new MB(), bike = kind === 'bike';
  const def = {
    peci: { skin: 0xb5835a, suit: 0x121218, shirt: 0xf4f4f4, hr: [0.29, 0.28, 0.28] },
    bendera: { skin: 0xcb9a6e, suit: 0x151a30, shirt: 0xf4f4f4, hr: [0.25, 0.29, 0.25] },
    putih: { skin: 0xb07c55, suit: 0xf7f7f7, shirt: 0xf7f7f7, hr: [0.27, 0.27, 0.27] },
    eyang: { skin: 0x9a6a46, suit: 0x2b1d17, shirt: 0xcbb99a, hr: [0.27, 0.28, 0.27] },
    mhs: { skin: 0xc99468, suit: 0xf2c230, shirt: 0xf6f6f6, hr: [0.27, 0.28, 0.27] },
    skripsi: { skin: 0xd9a47a, suit: 0x3a62d8, shirt: 0x2a3a78, hr: [0.28, 0.28, 0.28] },
    dokter: { skin: 0xc08a62, suit: 0xf6f6f6, shirt: 0x2fb7a9, hr: [0.27, 0.28, 0.27] },
    batik: { skin: 0xd3a070, suit: 0x7a4219, shirt: 0xe9c46a, hr: [0.26, 0.28, 0.26] },
    betawi: { skin: 0xa8714a, suit: 0xf2f2f2, shirt: 0xf2f2f2, hr: [0.28, 0.28, 0.28] },
    pendaki: { skin: 0xb87a52, suit: 0xf26a1a, shirt: 0x4a4f5a, hr: [0.28, 0.28, 0.28] },
    chef: { skin: 0xc9906a, suit: 0xf8f8f8, shirt: 0xf8f8f8, hr: [0.3, 0.28, 0.29] },
    numibot: { skin: 0xdfe5ea, suit: 0x1c473a, shirt: 0xe9b84a, hr: [0.29, 0.27, 0.27], robot: true },
  }[id];
  const headY = 0.99, hr = def.hr;
  // torso
  b.box(def.suit, [0.6, 0.58, 0.36], [0, 0.39, 0]);
  b.box(def.suit, [0.66, 0.14, 0.36], [0, 0.64, 0]);
  b.cyl(def.skin, 0.085, 0.095, 0.12, 7, [0, 0.74, 0]);
  // head
  if (!def.robot) {
    b.sph(def.skin, hr, [0, headY, 0], null, 12, 8);
    for (const s of [-1, 1]) {
      b.sph(def.skin, 0.055, [s * hr[0] * 0.97, headY - 0.01, 0], null, 6, 4);
      b.sph(0xffffff, [0.06, 0.07, 0.04], [s * 0.1, headY + 0.03, hr[2] * 0.88], null, 7, 5);
      b.sph(0x1a1010, [0.036, 0.045, 0.03], [s * 0.1, headY + 0.03, hr[2] * 0.88 + 0.025], null, 6, 4);
      b.box(0x241610, [0.11, 0.028, 0.03], [s * 0.1, headY + 0.125, hr[2] * 0.86], [0, 0, s * -0.12]);
    }
    b.sph(mixc(hex(def.skin), [0.3, 0.15, 0.1], 0.2), 0.05, [0, headY - 0.04, hr[2] * 0.98], null, 6, 4);
    b.box(0x5a1d16, [0.13, 0.025, 0.03], [0, headY - 0.125, hr[2] * 0.9]);
    b.box(0x5a1d16, [0.04, 0.025, 0.03], [0.075, headY - 0.108, hr[2] * 0.88], [0, 0, 0.5]);
    b.box(0x5a1d16, [0.04, 0.025, 0.03], [-0.075, headY - 0.108, hr[2] * 0.88], [0, 0, -0.5]);

  }
  // per character costume
  const peci = (h) => {
    b.cyl(0x0d0d10, 0.205, 0.22, h, 14, [0, headY + hr[1] * 0.78 + h / 2 - 0.02, -0.01], [-0.12, 0, 0]);
    b.cyl(0x2a2a30, 0.2, 0.2, 0.025, 14, [0, headY + hr[1] * 0.78 + h - 0.015, -0.03], [-0.12, 0, 0]);
  };
  const tie = (col) => { b.box(col, [0.075, 0.3, 0.02], [0, 0.42, 0.185]); b.box(col, [0.095, 0.07, 0.03], [0, 0.57, 0.185]); };
  const shirtV = () => b.box(def.shirt, [0.2, 0.36, 0.02], [0, 0.45, 0.182]);
  let sleeve = def.suit, rolled = false;
  if (id === 'peci') {
    peci(0.17); shirtV(); tie(0xc4161c);
    for (const s of [-1, 1]) b.box(0xbdbdbd, [0.07, 0.11, 0.2], [s * 0.26, headY + 0.07, -0.03]);
    b.sph(0xffd24a, 0.045, [0.19, 0.52, 0.185], null, 6, 4);
    b.box(0xd4121a, [0.05, 0.11, 0.02], [0.19, 0.44, 0.185]);
  } else if (id === 'bendera') {
    peci(0.2); shirtV(); tie(0xc4161c);
    b.box(0xd4121a, [0.68, 0.09, 0.42], [0, 0.69, 0.0]);
    b.box(0xffffff, [0.68, 0.05, 0.42], [0, 0.64, 0.0]);
    b.limb(0xd4121a, [0.1, 0.68, -0.18], [0.14, 0.78, -0.82], 0.15, 0.04);
    b.limb(0xffffff, [0.14, 0.78, -0.82], [0.18, 0.8, -1.15], 0.15, 0.04);
    b.box(0xd4121a, [0.05, 0.05, 0.02], [0.2, 0.5, 0.185]); b.box(0xffffff, [0.05, 0.05, 0.02], [0.2, 0.45, 0.185]);
  } else if (id === 'putih') {
    b.sph(0x111111, [hr[0] * 1.05, 0.19, hr[2] * 1.03], [0, headY + 0.1, -0.025], null, 10, 6);
    for (const s of [-1, 1]) b.box(0x111111, [0.06, 0.14, 0.2], [s * 0.255, headY + 0.03, -0.02]);
    b.box(0xd4121a, [0.05, 0.06, 0.02], [0.2, 0.52, 0.185]); b.box(0xffffff, [0.05, 0.06, 0.02], [0.2, 0.46, 0.185]);
    b.box(0xe2e2e2, [0.16, 0.04, 0.03], [0, 0.66, 0.17]);
    rolled = true; sleeve = 0xf7f7f7;
  } else if (id === 'eyang') {
    const gray = 0xdadada;
    b.sph(gray, [hr[0] * 1.08, 0.22, hr[2] * 1.06], [0, headY + 0.07, -0.03], null, 10, 6);
    b.box(gray, [0.56, 0.62, 0.14], [0, headY - 0.18, -0.25]);
    for (const s of [-1, 1]) b.box(gray, [0.07, 0.5, 0.12], [s * 0.27, headY - 0.17, -0.02]);
    b.cyl(gray, 0.16, 0.025, 0.36, 8, [0, headY - 0.27, 0.12]);
    b.box(gray, [0.2, 0.04, 0.05], [0, headY - 0.07, hr[2] * 0.98], [0, 0, 0.0]);
    b.cyl(0x7b3f14, 0.292, 0.292, 0.075, 14, [0, headY + 0.12, -0.02]);
    b.cyl(0xd9a441, 0.294, 0.294, 0.02, 14, [0, headY + 0.12, -0.02]);
    b.box(0x7b3f14, [0.14, 0.12, 0.09], [0, headY + 0.12, -0.32]);
    // pipe + cane + beads
    b.limb(0x5a3418, [0.07, headY - 0.1, 0.25], [0.2, headY - 0.04, 0.4], 0.035, 0.035);
    b.cyl(0x3a2412, 0.06, 0.05, 0.1, 7, [0.22, headY - 0.0, 0.41]);
    b.sph(0xff6a1a, 0.025, [0.22, headY + 0.05, 0.41], null, 5, 3);
    b.limb(0x3a2412, [0.42, 0.0, 0.2], [0.5, 0.95, -0.02], 0.05, 0.05);
    b.sph(0xd9a441, 0.07, [0.5, 0.97, -0.02], null, 6, 4);
    b.box(0xcbb99a, [0.22, 0.34, 0.02], [0, 0.46, 0.182]);
    for (let i = 0; i < 5; i++) b.sph(0x7b3f14, 0.03, [(i - 2) * 0.05, 0.62 - Math.abs(i - 2) * 0.02, 0.19], null, 4, 3);
  }
  const cap = (col, h, dy) => b.sph(col, [hr[0] * 1.05, h || 0.19, hr[2] * 1.03], [0, headY + (dy === undefined ? 0.1 : dy), -0.025], null, 10, 6);
  const ring = (x, y, z, r, t, col) => { const len = 2 * r * Math.tan(Math.PI / 8) + 0.012; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; b.box(col, [len, t, t], [x + Math.cos(a) * r, y + Math.sin(a) * r, z], [0, 0, a + Math.PI / 2]); } };
  if (id === 'mhs') {
    const hij = 0xf3ecd9;
    cap(hij, 0.21, 0.09);
    for (const s of [-1, 1]) b.box(hij, [0.08, 0.36, 0.32], [s * 0.255, headY - 0.1, -0.03]);
    b.box(hij, [0.62, 0.64, 0.14], [0, headY - 0.2, -0.24]);
    b.box(hij, [0.52, 0.08, 0.42], [0, headY - 0.265, 0.0]);
    b.box(hij, [0.74, 0.1, 0.46], [0, 0.69, 0.0]);
    b.sph(0xffd24a, 0.035, [0.19, headY - 0.24, 0.17], null, 5, 4);
    shirtV(); b.cyl(0x3b2a10, 0.045, 0.045, 0.02, 8, [0.2, 0.5, 0.186], [Math.PI / 2, 0, 0]);
    b.box(0x3b2a10, [0.36, 0.035, 0.02], [0, 0.64, 0.186]);
  } else if (id === 'skripsi') {
    cap(0x1a1410, 0.2, 0.1);
    for (const [x, z] of [[-0.12, 0.06], [0.06, 0.1], [0.14, -0.06]]) b.sph(0x1a1410, 0.085, [x, headY + 0.28, z], null, 6, 4);
    for (const s of [-1, 1]) ring(s * 0.1, headY + 0.03, 0.266, 0.078, 0.016, 0x181820);
    b.box(0x181820, [0.05, 0.016, 0.016], [0, headY + 0.045, 0.266]);
    b.box(def.suit, [0.5, 0.2, 0.2], [0, 0.68, -0.2]);
    for (const s of [-1, 1]) b.box(0xffffff, [0.025, 0.17, 0.02], [s * 0.075, 0.52, 0.19]);
    b.box(0x2e50b0, [0.4, 0.14, 0.03], [0, 0.2, 0.19]);
    b.box(0xf4f4f4, [0.1, 0.07, 0.03], [0.17, 0.5, 0.19]);
  } else if (id === 'dokter') {
    cap(0x3fc7d4, 0.21, 0.1); b.sph(0x3fc7d4, 0.1, [0, headY + 0.07, -0.27], null, 6, 4);
    b.box(0x9fe0ec, [0.27, 0.13, 0.05], [0, headY - 0.1, 0.235]);
    for (const s of [-1, 1]) b.box(0xffffff, [0.012, 0.012, 0.2], [s * 0.145, headY - 0.07, 0.14]);
    shirtV();
    const sp = [[-0.15, 0.68, 0.13], [-0.1, 0.5, 0.2], [-0.04, 0.38, 0.21], [0.04, 0.38, 0.21], [0.1, 0.5, 0.2], [0.15, 0.68, 0.13]];
    for (let i = 0; i < sp.length - 1; i++) b.limb(0x222226, sp[i], sp[i + 1], 0.03, 0.03);
    b.cyl(0xc9ced6, 0.045, 0.045, 0.03, 8, [0, 0.36, 0.205], [Math.PI / 2, 0, 0]);
    b.box(0xffffff, [0.08, 0.05, 0.02], [0.2, 0.48, 0.19]); b.box(0xd4121a, [0.025, 0.03, 0.02], [0.2, 0.5, 0.2]);
  } else if (id === 'batik') {
    const hair = 0x15110f;
    cap(hair, 0.2, 0.1);
    b.sph(hair, 0.14, [0, headY + 0.3, -0.13], null, 8, 6);
    b.sph(0xd4121a, 0.06, [0.11, headY + 0.29, -0.08], null, 6, 4); b.sph(0xffd24a, 0.025, [0.11, headY + 0.31, -0.04], null, 5, 4);
    b.box(hair, [0.48, 0.5, 0.1], [0, headY - 0.12, -0.22]);
    for (const s of [-1, 1]) { b.box(hair, [0.05, 0.3, 0.13], [s * 0.268, headY - 0.04, -0.08]); b.sph(0xffd24a, 0.028, [s * 0.272, headY - 0.13, 0.04], null, 5, 4); }
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { if ((r + c) & 1) continue; b.box(0xe9c46a, [0.06, 0.06, 0.02], [-0.21 + c * 0.14, 0.2 + r * 0.14, 0.186], [0, 0, 0.785]); }
    b.box(0xe9c46a, [0.66, 0.06, 0.4], [0, 0.14, 0.0]);
    shirtV();
  } else if (id === 'betawi') {
    const red = 0xc0151b;
    cap(red, 0.17, 0.14); b.cyl(red, 0.292, 0.292, 0.07, 14, [0, headY + 0.1, -0.02]);
    b.sph(red, 0.07, [0.28, headY + 0.1, -0.06], null, 6, 4); b.limb(red, [0.28, headY + 0.07, -0.06], [0.33, headY - 0.06, -0.1], 0.05, 0.03);
    b.box(0xffffff, [0.05, 0.03, 0.02], [0.1, headY + 0.14, 0.285]);
    b.box(0x16100c, [0.17, 0.04, 0.04], [0, headY - 0.075, 0.255]);
    const a0 = [-0.27, 0.68, 0.2], a1 = [0.27, 0.12, 0.2];
    for (let i = 0; i < 7; i++) { const t0 = i / 7, t1 = (i + 1) / 7; b.limb(i & 1 ? 0x1a1a1a : 0xb01a1a, [lerp(a0[0], a1[0], t0), lerp(a0[1], a1[1], t0), 0.2], [lerp(a0[0], a1[0], t1), lerp(a0[1], a1[1], t1), 0.2], 0.035, 0.15); }
    b.box(0xb01a1a, [0.6, 0.12, 0.4], [0, 0.12, 0.0]);
    shirtV();
  } else if (id === 'pendaki') {
    b.sph(0xff7a1a, [hr[0] * 1.06, 0.2, hr[2] * 1.04], [0, headY + 0.1, -0.02], null, 10, 6);
    b.cyl(0xe05a10, 0.295, 0.295, 0.07, 14, [0, headY + 0.07, -0.02]);
    b.sph(0xffe14a, 0.075, [0, headY + 0.33, -0.02], null, 6, 4);
    b.cyl(0x22252c, 0.3, 0.3, 0.04, 14, [0, headY + 0.145, -0.02]);
    for (const s of [-1, 1]) b.box(0x7fd8f0, [0.12, 0.07, 0.03], [s * 0.1, headY + 0.145, 0.285]);
    b.cyl(0xffd24a, 0.17, 0.2, 0.1, 10, [0, 0.72, 0]);
    b.box(0xd4451a, [0.5, 0.6, 0.28], [0, 0.45, -0.34]); b.box(0x2d3038, [0.46, 0.2, 0.1], [0, 0.6, -0.5]);
    b.cyl(0x2f6fd0, 0.1, 0.1, 0.55, 8, [0, 0.86, -0.36], [0, 0, Math.PI / 2]);
    for (const s of [-1, 1]) b.box(0x2d3038, [0.06, 0.5, 0.03], [s * 0.17, 0.45, 0.19]);
    b.box(0xd8dde4, [0.62, 0.05, 0.38], [0, 0.3, 0]);
  } else if (id === 'chef') {
    b.cyl(0xffffff, 0.21, 0.21, 0.2, 14, [0, headY + 0.32, -0.01]);
    b.sph(0xffffff, [0.3, 0.2, 0.3], [0, headY + 0.52, -0.01], null, 10, 6);
    for (const [x, z] of [[-0.14, 0.05], [0.15, 0.04], [0, -0.14]]) b.sph(0xffffff, 0.13, [x, headY + 0.47, z], null, 7, 5);
    b.box(0x2a1a10, [0.2, 0.045, 0.04], [0, headY - 0.075, 0.255]);
    for (const s of [-1, 1]) b.sph(0x2a1a10, 0.032, [s * 0.115, headY - 0.055, 0.25], null, 5, 4);
    b.box(0xd4121a, [0.17, 0.17, 0.02], [0, 0.6, 0.186], [0, 0, 0.785]);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) b.sph(0x2a2a2a, 0.025, [s * 0.1, 0.45 - i * 0.12, 0.19], null, 4, 3);
  } else if (id === 'numibot') {
    b.box(0xdfe5ea, [0.6, 0.5, 0.5], [0, headY, 0]);
    b.box(0xb9c2cb, [0.62, 0.06, 0.52], [0, headY + 0.26, 0]);
    b.box(0x0e1c26, [0.48, 0.28, 0.05], [0, headY + 0.02, 0.255]);
    for (const s of [-1, 1]) { b.box(0x46e8ff, [0.1, 0.11, 0.03], [s * 0.11, headY + 0.04, 0.285]); b.cyl(0xe9b84a, 0.09, 0.09, 0.06, 10, [s * 0.32, headY, 0], [0, 0, Math.PI / 2]); }
    b.box(0x46e8ff, [0.15, 0.025, 0.03], [0, headY - 0.06, 0.285]);
    b.cylAxis(0x7a8590, 0.022, 0.022, [0, headY + 0.28, 0], [0, headY + 0.46, 0], 5, true);
    b.sph(0xe9b84a, 0.065, [0, headY + 0.5, 0], null, 6, 4);
    b.cyl(0xe9b84a, 0.1, 0.1, 0.03, 8, [0, 0.46, 0.186], [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; b.box(0xe9b84a, [0.04, 0.04, 0.03], [Math.cos(a) * 0.12, 0.46 + Math.sin(a) * 0.12, 0.186], [0, 0, a]); }
    b.box(0xffffff, [0.18, 0.04, 0.02], [0, 0.3, 0.186]);
  }
  // arms
  const sh = 0.3;
  for (const s of [-1, 1]) {
    const S = [s * sh, 0.56, 0], hand = bike ? [s * 0.34, 0.33, 0.98] : [s * 0.2, 0.38, 0.46];
    const E = bike ? [s * 0.4, 0.42, 0.5] : [s * 0.34, 0.34, 0.2];
    b.limb(sleeve, S, E, 0.14, 0.14);
    b.limb(rolled ? def.skin : sleeve, E, hand, 0.12, 0.12);
    b.sph(def.skin, 0.075, hand, null, 6, 4);
    if (!bike) { /* steering wheel */ }
  }
  if (bike) {
    for (const s of [-1, 1]) {
      b.limb(def.suit === 0xf7f7f7 ? 0x30343c : def.suit, [s * 0.2, 0.02, 0.05], [s * 0.26, -0.12, 0.5], 0.17, 0.17);
      b.limb(def.suit === 0xf7f7f7 ? 0x30343c : def.suit, [s * 0.26, -0.12, 0.5], [s * 0.26, -0.6, 0.62], 0.15, 0.15);
      b.box(0x222226, [0.14, 0.08, 0.28], [s * 0.26, -0.63, 0.68]);
    }
  } else {
    // steering wheel (car)
    b.cyl(0x222226, 0.17, 0.17, 0.035, 12, [0, 0.33, 0.52], [1.0, 0, 0]);
    b.cyl(0x888890, 0.04, 0.04, 0.04, 6, [0, 0.33, 0.52], [1.0, 0, 0]);
  }
  return b.data();
};

/* ===== pickups, projectiles ===== */
const PICK_BUILD = {
  mango() {
    const b = new MB();
    b.sph(0xffb21a, [0.45, 0.58, 0.42], [0, 0, 0], null, 9, 7);
    b.sph(0xff6a2a, [0.3, 0.36, 0.2], [0.05, 0.08, 0.24], null, 7, 5);
    b.sph(0x2f9a3a, [0.24, 0.07, 0.14], [0.06, 0.64, 0], [0, 0, -0.5], 6, 4);
    b.cylAxis(0x5a3a1a, 0.03, 0.03, [0, 0.5, 0], [0.0, 0.7, 0], 5);
    return b.data();
  },
  crate() {
    const b = new MB();
    b.box(0xffffff, [1.5, 1.5, 1.5], [0, 0, 0], null, null, true);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0xffc21a, [0.14, 1.56, 0.14], [sx * 0.75, 0, sz * 0.75]);
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) b.box(0xffc21a, [1.56, 0.14, 0.14], [0, sy * 0.75, sz * 0.75]);
    for (const sy of [-1, 1]) for (const sx of [-1, 1]) b.box(0xffc21a, [0.14, 0.14, 1.56], [sx * 0.75, sy * 0.75, 0]);
    return b.data();
  },
  mine() {
    const b = new MB();
    b.sph(0x2c2c34, 0.42, [0, 0.45, 0], null, 9, 6);
    const spikes = [[0, 0.9, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
    const R = 0.42, L = 0.42;
    const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, -1], [0.7, 0.7, 0], [-0.7, 0.7, 0], [0, 0.7, 0.7], [0, 0.7, -0.7]];
    for (const d of dirs) {
      const n = V3.norm(d);
      b.cylAxis(0xd01818, 0.1, 0.0, [n[0] * R * 0.8, 0.45 + n[1] * R * 0.8, n[2] * R * 0.8], [n[0] * (R + L), 0.45 + n[1] * (R + L), n[2] * (R + L)], 6);
    }
    return b.data();
  },
  chili() {
    const b = new MB();
    b.sph(0xe0201b, [0.3, 0.3, 0.6], [0, 0, 0], null, 9, 6);
    b.sph(0xb01410, [0.17, 0.17, 0.5], [0, 0, 0.55], null, 8, 5);
    b.sph(0x2f9a3a, [0.14, 0.14, 0.22], [0, 0, -0.62], null, 6, 4);
    return b.data();
  },
  shield() { const b = new MB(); b.sph([0.45, 0.8, 1.0], 2.5, [0, 1.0, 0], null, 14, 10); return b.data(); },
  shadow() {
    const b = new MB();
    b.cyl(0x000000, 1, 1, 0.02, 14, [0, 0, 0]);
    return b.data();
  },
  ring() { const b = new MB(); b.cyl(0xffd23a, 1, 1, 0.05, 20, [0, 0, 0], null, false); return b.data(); },
};
