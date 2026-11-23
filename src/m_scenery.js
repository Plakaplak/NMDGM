'use strict';
/* ===== scenery pieces (write into MB builders) ===== */
const SC = {
  palm(b, x, y, z, rnd, s) {
    s = s || 1;
    const ang = rnd() * TAU, lean = 0.14 + rnd() * 0.3, segH = 1.7 * s, n = 5;
    let p = [x, y, z];
    const cols = [0x8d5b2c, 0x7a4e25];
    for (let i = 0; i < n; i++) {
      const t = lean * (i / (n - 1)) * 1.7;
      const d = [Math.sin(t) * Math.cos(ang), Math.cos(t), Math.sin(t) * Math.sin(ang)];
      const q = [p[0] + d[0] * segH, p[1] + d[1] * segH, p[2] + d[2] * segH];
      b.cylAxis(cols[i & 1], (0.33 - i * 0.032) * s, (0.3 - i * 0.032) * s, p, q, 6, i === n - 1);
      p = q;
    }
    const nl = 8;
    for (let k = 0; k < nl; k++) {
      const a = TAU * k / nl + rnd() * 0.3, out = [Math.cos(a), 0, Math.sin(a)], pw = [-out[2], 0, out[0]];
      const l1 = 1.9 * s, l2 = 1.7 * s, w = 0.55 * s;
      const p1 = [p[0] + out[0] * l1, p[1] + 0.7 * s, p[2] + out[2] * l1];
      const p2 = [p1[0] + out[0] * l2, p1[1] - 1.1 * s, p1[2] + out[2] * l2];
      const col = (k & 1) ? 0x2f8f3d : 0x3fae4d;
      const A = [p[0] - pw[0] * w * 0.2, p[1], p[2] - pw[2] * w * 0.2], B = [p[0] + pw[0] * w * 0.2, p[1], p[2] + pw[2] * w * 0.2];
      const C = [p1[0] + pw[0] * w, p1[1], p1[2] + pw[2] * w], D = [p1[0] - pw[0] * w, p1[1], p1[2] - pw[2] * w];
      b.quad(A, B, C, D, col, [0, 1, 0]);
      b.tri(D, C, p2, col, [0, 1, 0]);
    }
    for (let i = 0; i < 3; i++) b.sph(0x5b3a1a, 0.2 * s, [p[0] + Math.cos(i * 2.1) * 0.3 * s, p[1] - 0.25 * s, p[2] + Math.sin(i * 2.1) * 0.3 * s], null, 5, 4);
  },
  tree(b, x, y, z, rnd, s) {
    s = s || 1;
    b.cyl(0x6b4423, 0.3 * s, 0.46 * s, 3.2 * s, 6, [x, y + 1.6 * s, z]);
    const g1 = rnd() < 0.5 ? 0x2f8a3a : 0x3a9a43, g2 = rnd() < 0.5 ? 0x4aad4f : 0x58bb55;
    b.sph(g1, [2.6 * s, 2.0 * s, 2.6 * s], [x, y + 4.4 * s, z], null, 7, 5);
    b.sph(g2, [1.9 * s, 1.5 * s, 1.9 * s], [x + 0.9 * s, y + 5.6 * s, z + 0.4 * s], null, 7, 5);
  },
  bamboo(b, x, y, z, rnd) {
    for (let i = 0; i < 5; i++) {
      const ox = (rnd() - 0.5) * 2.2, oz = (rnd() - 0.5) * 2.2, h = 7 + rnd() * 4, lean = (rnd() - 0.5) * 1.2;
      const p0 = [x + ox, y, z + oz], p1 = [x + ox + lean, y + h, z + oz + lean * 0.6];
      b.cylAxis(0xa8c25a, 0.12, 0.09, p0, p1, 5, true);
      for (let k = 0; k < 3; k++) {
        const a = rnd() * TAU, tt = 0.6 + k * 0.15;
        const bp = [lerp(p0[0], p1[0], tt), lerp(p0[1], p1[1], tt), lerp(p0[2], p1[2], tt)];
        const tip = [bp[0] + Math.cos(a) * 2.0, bp[1] - 0.7, bp[2] + Math.sin(a) * 2.0];
        b.tri([bp[0], bp[1], bp[2]], [bp[0] + 0.0, bp[1] + 0.2, bp[2] + 0.3], tip, 0x5aa83a, [0, 1, 0]);
      }
    }
  },
  hut(b, x, y, z, rot, s) {
    s = s || 1;
    b.box(0xe9dbb8, [5.4 * s, 3 * s, 5.4 * s], [x, y + 1.5 * s, z], [0, rot, 0]);
    b.cyl(0x9c3a1c, 0, 4.9 * s, 2.6 * s, 4, [x, y + 3 * s + 1.3 * s, z], [0, rot + Math.PI / 4, 0]);
    const c = Math.cos(rot), sn = Math.sin(rot);
    b.box(0x5a3a22, [1.2 * s, 2 * s, 0.12], [x + sn * 2.72 * s, y + 1.0 * s, z + c * 2.72 * s], [0, rot, 0]);
  },
  terraceHill(b, x, y, z, r, rnd) {
    const tiers = 6; let rr = r;
    for (let i = 0; i < tiers; i++) {
      const h = 2.4; let col = i % 2 ? 0x7bc943 : 0x5eab34;
      if (rnd() < 0.22) col = 0x9bd6ea;
      b.cyl(col, rr * 0.93, rr, h, 14, [x, y + i * h + h / 2, z]);
      rr *= 0.8;
    }
    b.cyl(0x3f8f2e, 0.5, rr * 1.0, 3.4, 10, [x, y + tiers * 2.4 + 1.7, z]);
  },
  mountain(b, x, y, z, r, h, kind) {
    const base = kind === 'island' ? 0x2d7a46 : 0x3d7a3a, mid = kind === 'island' ? 0x3f9654 : 0x5a6a48, top = kind === 'volcano' ? 0x403a3a : 0x6d7a55;
    b.cyl(base, r * 0.62, r, h * 0.42, 10, [x, y + h * 0.21, z]);
    b.cyl(mid, r * 0.3, r * 0.62, h * 0.3, 10, [x, y + h * 0.57, z]);
    b.cyl(top, r * (kind === 'volcano' ? 0.12 : 0.02), r * 0.3, h * 0.28, 10, [x, y + h * 0.86, z]);
    if (kind === 'volcano') b.cyl(0xff7a2a, r * 0.1, r * 0.12, 0.05 * h, 10, [x, y + h * 1.0, z]);
  },
  building(fac, opq, x, y, z, w, d, h, rot, wall, rnd) {
    fac.box(wall, [w, h, d], [x, y + h / 2, z], [0, rot, 0], [8, 8]);
    opq.box(0x3c4056, [w * 0.92, 0.7, d * 0.92], [x, y + h + 0.35, z], [0, rot, 0]);
    if (rnd() < 0.5) opq.box(0x555a70, [w * 0.3, 1.6, d * 0.3], [x + w * 0.15, y + h + 1.5, z], [0, rot, 0]);
    if (rnd() < 0.3) opq.cylAxis(0x9aa0b0, 0.12, 0.05, [x, y + h, z], [x, y + h + 6 + rnd() * 6, z], 4);
  },
  lamp(opq, glow, x, y, z, tx, tz) {
    opq.cylAxis(0x6b7080, 0.14, 0.1, [x, y, z], [x, y + 8, z], 6, true);
    opq.cylAxis(0x6b7080, 0.08, 0.08, [x, y + 8, z], [x + tx * 2.2, y + 8.3, z + tz * 2.2], 5, true);
    glow.box(0xffe6a0, [0.8, 0.25, 0.8], [x + tx * 2.4, y + 8.15, z + tz * 2.4]);
  },
  umbrella(b, x, y, z, rnd) {
    const cols = [0xd4121a, 0x1a7fe0, 0xffb21a, 0x2fb35a];
    b.cylAxis(0xf0f0f0, 0.06, 0.06, [x, y, z], [x, y + 3.2, z], 5, true);
    b.cyl(cols[Math.floor(rnd() * 4)], 0.05, 2.0, 0.8, 8, [x, y + 3.4, z]);
    b.box(0xf5e4c0, [1.6, 0.12, 0.6], [x + 1.9, y + 0.4, z + 0.4], [0, rnd() * 3, 0]);
  },
  rock(b, x, y, z, rnd, s) {
    s = s || 1;
    b.sph(0x8a8d93, [1.8 * s, 1.1 * s, 1.5 * s], [x, y + 0.4 * s, z], [0, rnd() * 3, 0], 5, 4);
  },
  boat(b, x, y, z, rot) {
    b.box(0xf5f5f5, [3, 0.9, 8], [x, y + 0.2, z], [0, rot, 0]);
    b.box(0xd4121a, [3.1, 0.25, 8.1], [x, y + 0.55, z], [0, rot, 0]);
    b.box(0x2a6fd0, [2, 1.4, 2.6], [x, y + 1.3, z - Math.cos(rot) * 0.5], [0, rot, 0]);
    b.cylAxis(0xdddddd, 0.08, 0.05, [x, y + 1.5, z], [x, y + 5, z], 4);
  },
  lighthouse(b, glow, x, y, z) {
    for (let i = 0; i < 5; i++) b.cyl(i % 2 ? 0xd4121a : 0xf5f5f5, 2.0 - i * 0.22 - 0.2, 2.0 - i * 0.22, 4, 12, [x, y + 2 + i * 4, z]);
    b.cyl(0x333333, 2.1, 2.1, 0.5, 12, [x, y + 20.2, z]);
    glow.box(0xffe27a, [2.4, 1.6, 2.4], [x, y + 21.2, z]);
    b.cyl(0xd4121a, 0, 2.5, 1.8, 12, [x, y + 22.9, z]);
  },
  cloud(b, x, y, z, rnd, s, col) {
    const n = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) b.sph(col || 0xffffff, [(14 + rnd() * 10) * s, (6 + rnd() * 3) * s, (10 + rnd() * 6) * s], [x + (i - n / 2) * 14 * s, y + rnd() * 3, z + (rnd() - 0.5) * 10], null, 7, 4);
  },
  penjor(b, x, y, z, tx, tz, rnd) {
    // bamboo pole leaning over the road with hanging janur
    const pts = [[0, 0, 0], [0.4, 4, 0], [1.4, 8, 0], [3.0, 11, 0], [5.2, 12.4, 0]];
    const P = pts.map(p => [x + tx * p[0], y + p[1], z + tz * p[0]]);
    for (let i = 0; i < 4; i++) b.cylAxis(0xc8a24a, 0.17 - i * 0.02, 0.15 - i * 0.02, P[i], P[i + 1], 5, true);
    const end = P[4], pw = [-tz, 0, tx];
    for (let k = -1; k <= 1; k++) {
      const a = [end[0] + pw[0] * k * 0.35, end[1], end[2] + pw[2] * k * 0.35];
      const z2 = [a[0] + tx * 0.8, a[1] - 7.5, a[2] + tz * 0.8];
      b.tri([a[0] - pw[0] * 0.3, a[1], a[2] - pw[2] * 0.3], [a[0] + pw[0] * 0.3, a[1], a[2] + pw[2] * 0.3], z2, k ? 0xf2e08a : 0xd9c15a, [0, 1, 0]);
    }
    b.sph(0xd4121a, 0.28, [end[0], end[1] - 0.2, end[2]], null, 5, 4);
  },
  signboard(opq, sign, x, y, z, ang, w, h, pole) {
    const fx = Math.sin(ang), fz = Math.cos(ang), rx = fz, rz = -fx;
    pole = pole || 6;
    for (const s of [-0.38, 0.38]) opq.cylAxis(0x444a58, 0.22, 0.22, [x + rx * w * s, y, z + rz * w * s], [x + rx * w * s, y + pole + h * 0.5, z + rz * w * s], 6, true);
    opq.box(0x22243a, [w + 0.4, h + 0.4, 0.4], [x, y + pole + h * 0.5, z], [0, ang, 0]);
    const cy = y + pole + h * 0.5, o = 0.24;
    const P = (sx, sy) => [x + rx * sx * w / 2 + fx * o, cy + sy * h / 2, z + rz * sx * w / 2 + fz * o];
    sign.quadN([P(-1, -1), P(1, -1), P(1, 1), P(-1, 1)], [fx, 0, fz], [1, 1, 1], [[0, 0], [1, 0], [1, 1], [0, 1]]);
  },
};

/* ===== landmark / theme pieces ===== */
const _loc = (x, y, z, rot) => { const c = Math.cos(rot), sn = Math.sin(rot); return (lx, ly, lz) => [x + c * lx + sn * lz, y + ly, z - sn * lx + c * lz]; };
Object.assign(SC, {
  pine(b, x, y, z, rnd, s) {
    s = s || 1;
    b.cyl(0x5a3a22, 0.25 * s, 0.4 * s, 2.2 * s, 5, [x, y + 1.1 * s, z]);
    const cols = [0x1f5a32, 0x246b38, 0x2b7a3f];
    for (let i = 0; i < 3; i++) b.cyl(cols[i], 0.0, (2.7 - i * 0.55) * s, 2.8 * s, 7, [x, y + (2.9 + i * 1.7) * s, z]);
  },
  monas(opq, glow, x, y, z, s) {
    s = s || 1;
    /* floodlit at night: structure drawn unlit so it glows against the dark sky */
    opq.box(0x8d887c, [150 * s, 1.2 * s, 150 * s], [x, y + 0.6 * s, z]);
    glow.box(0xc8c0ae, [62 * s, 6 * s, 62 * s], [x, y + 4.2 * s, z]);
    for (const q of [0, 1, 2, 3]) { const a = q * Math.PI / 2; glow.box(0xb2aa98, [14 * s, 2.4 * s, 10 * s], [x + Math.sin(a) * 36 * s, y + 1.9 * s, z + Math.cos(a) * 36 * s], [0, a, 0]); }
    glow.box(0xd8d0bc, [44 * s, 8 * s, 44 * s], [x, y + 11.2 * s, z]);
    glow.cyl(0xbab29e, 16 * s, 9 * s, 6 * s, 4, [x, y + 18.2 * s, z], [0, Math.PI / 4, 0]);
    glow.cyl(0xfff1d4, 1.9 * s, 5.4 * s, 64 * s, 4, [x, y + 53.2 * s, z], [0, Math.PI / 4, 0]);
    glow.box(0xf0e4c8, [10 * s, 2.4 * s, 10 * s], [x, y + 86.4 * s, z]);
    glow.box(0xcfc4a8, [11 * s, 0.8 * s, 11 * s], [x, y + 87.8 * s, z]);
    glow.cyl(0xffc83a, 0.15 * s, 2.5 * s, 10 * s, 8, [x, y + 93.6 * s, z]);
    glow.sph(0xfff2a8, [1.6 * s, 3.2 * s, 1.6 * s], [x, y + 95.2 * s, z], null, 7, 5);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) glow.box(0xfff0b8, [1.2, 0.5, 1.2], [x + sx * 45 * s, y + 1.5, z + sz * 45 * s]);
  },
  tugu(opq, glow, x, y, z) {
    opq.cyl(0xcfcabc, 27, 28, 1.4, 22, [x, y + 0.7, z]);
    opq.cyl(0x49b8e8, 25.4, 25.4, 0.2, 22, [x, y + 1.45, z]);
    opq.cyl(0xcfcabc, 7.5, 8.6, 2.4, 12, [x, y + 2.6, z]);
    opq.cyl(0xe2ddd0, 3.8, 5.0, 19, 8, [x, y + 12.4, z]);
    opq.cyl(0xcfcabc, 6, 4, 1.6, 8, [x, y + 22.6, z]);
    const bronze = 0xb8843e;
    for (const sx of [-1.5, 1.5]) {
      opq.cyl(bronze, 0.75, 1.0, 3.8, 6, [x + sx, y + 25.3, z]); opq.sph(bronze, 0.85, [x + sx, y + 27.9, z], null, 6, 4);
      opq.limb(bronze, [x + sx, y + 26.6, z], [x + sx * 2.2, y + 30.2, z], 0.42, 0.42);
    }
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, c = Math.cos(a), sn = Math.sin(a); opq.cylAxis(0xdff4ff, 0.5, 0.05, [x + c * 17, y + 1.5, z + sn * 17], [x + c * 13.5, y + 7.5, z + sn * 13.5], 5, true); glow.box(0xffe9a0, [1.1, 0.4, 1.1], [x + c * 22.5, y + 1.7, z + sn * 22.5]); }
  },
  ondel(b, x, y, z, rot, s, male) {
    s = s || 1; const P = _loc(x, y, z, rot);
    const face = male ? 0xc8281e : 0xf2ece0, cloth = male ? 0x1f6a3a : 0xe0a017;
    b.cyl(cloth, 0.6 * s, 0.95 * s, 2.0 * s, 8, [x, y + 1.0 * s, z]);
    b.cyl(0xffd24a, 0.97 * s, 0.97 * s, 0.14 * s, 8, [x, y + 0.2 * s, z]);
    b.sph(face, [0.72 * s, 0.8 * s, 0.7 * s], P(0, 2.75 * s, 0), null, 8, 6);
    for (const sx of [-1, 1]) { b.sph(0xffffff, 0.17 * s, P(sx * 0.28 * s, 2.92 * s, 0.6 * s), null, 5, 4); b.sph(0x111111, 0.085 * s, P(sx * 0.28 * s, 2.92 * s, 0.73 * s), null, 4, 3); b.box(0x1a1010, [0.3 * s, 0.07 * s, 0.07 * s], P(sx * 0.28 * s, 3.18 * s, 0.62 * s), [0, rot, sx * -0.2]); }
    b.box(0xffffff, [0.36 * s, 0.13 * s, 0.1 * s], P(0, 2.42 * s, 0.67 * s), [0, rot, 0]);
    b.box(0x1a1010, [0.5 * s, 0.07 * s, 0.08 * s], P(0, 2.6 * s, 0.7 * s), [0, rot, 0]);
    b.cyl(0xffc83a, 0.8 * s, 0.8 * s, 0.2 * s, 10, [x, y + 3.45 * s, z]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; b.cylAxis(i & 1 ? 0xff4fa8 : 0xffc83a, 0.11 * s, 0.01, [x + Math.cos(a) * 0.62 * s, y + 3.5 * s, z + Math.sin(a) * 0.62 * s], [x + Math.cos(a) * 0.85 * s, y + 4.5 * s, z + Math.sin(a) * 0.85 * s], 4, true); }
    b.sph(0xd4121a, 0.28 * s, [x, y + 3.75 * s, z], null, 5, 4);
    for (const sx of [-1, 1]) b.limb(cloth, P(sx * 0.62 * s, 1.9 * s, 0), P(sx * 1.05 * s, 0.9 * s, 0.3 * s), 0.28 * s, 0.28 * s);
  },
  jpo(opq, cx, y, cz, nx, nz, span, h, col) {
    const rot = Math.atan2(-nz, nx), P = (l, ly, a) => [cx + nx * l + (-nz) * (a || 0), y + ly, cz + nz * l + nx * (a || 0)];
    col = col || 0x2c5fd0;
    opq.box(col, [span, 0.8, 3.2], P(0, h, 0), [0, rot, 0]);
    opq.box(0xe8eef8, [span, 1.2, 0.18], P(0, h + 1.0, 1.5), [0, rot, 0]); opq.box(0xe8eef8, [span, 1.2, 0.18], P(0, h + 1.0, -1.5), [0, rot, 0]);
    opq.box(0xf4c430, [span + 0.4, 0.4, 3.9], P(0, h + 3.4, 0), [0, rot, 0]);
    for (const e of [-1, 1]) {
      const l = e * (span / 2 - 1.2);
      opq.box(0xcfd6e2, [1.6, h, 1.6], P(l, h / 2, 0), [0, rot, 0]);
      for (const a of [-1.5, 1.5]) opq.cylAxis(0x8892a6, 0.12, 0.12, P(l, h + 0.4, a), P(l, h + 3.4, a), 5, true);
      opq.limb(col, P(e * (span / 2 - 0.5), h - 0.4, 0), P(e * (span / 2 + 11), 0.3, 0), 2.6, 0.5);
    }
    const mid = Math.floor(span / 40);
    for (let k = -mid; k <= mid; k++) if (Math.abs(k * 38) < span / 2 - 14) opq.box(0xcfd6e2, [1.4, h, 1.4], P(k * 38, h / 2, 0), [0, rot, 0]);
  },
  bus(b, x, y, z, rot, col, stripe) {
    const P = _loc(x, y, z, rot); col = col || 0x1d63c8; stripe = stripe === undefined ? 0xffffff : stripe;
    b.box(col, [2.7, 3.0, 12], P(0, 2.1, 0), [0, rot, 0]);
    b.box(stripe, [2.74, 0.8, 12.02], P(0, 1.35, 0), [0, rot, 0]);
    b.box(0x16202f, [2.76, 1.05, 10.4], P(0, 2.9, -0.4), [0, rot, 0]);
    b.box(0x16202f, [2.2, 1.2, 0.1], P(0, 2.8, 6.02), [0, rot, 0]);
    b.box(0xb6bdc8, [1.8, 0.4, 5.2], P(0, 3.8, -1), [0, rot, 0]);
    for (const az of [-3.8, 3.6]) for (const sx of [-1, 1]) b.cyl(0x18181c, 0.58, 0.58, 0.42, 10, P(sx * 1.3, 0.58, az), [0, rot, Math.PI / 2]);
  },
  angkot(b, x, y, z, rot, col) {
    const P = _loc(x, y, z, rot); col = col || 0x2a62d8;
    b.box(col, [2.0, 1.7, 4.6], P(0, 1.35, -0.2), [0, rot, 0]);
    b.box(col, [1.96, 1.0, 1.4], P(0, 1.0, 2.5), [0, rot, 0]);
    b.box(0xf4f4f4, [2.02, 0.22, 4.7], P(0, 2.3, -0.2), [0, rot, 0]);
    b.box(0x16202f, [2.04, 0.78, 3.8], P(0, 1.85, -0.4), [0, rot, 0]);
    b.box(0x16202f, [1.7, 0.7, 0.08], P(0, 1.7, 2.78), [0, rot + 0.0, 0]);
    for (const az of [-1.5, 1.9]) for (const sx of [-1, 1]) b.cyl(0x18181c, 0.4, 0.4, 0.3, 8, P(sx * 0.95, 0.4, az), [0, rot, Math.PI / 2]);
  },
  bikun(b, x, y, z, rot) {
    const P = _loc(x, y, z, rot);
    b.box(0xf4c318, [2.6, 3.0, 11], P(0, 2.0, 0), [0, rot, 0]);
    b.box(0x1a1a1a, [2.64, 0.35, 11.02], P(0, 1.25, 0), [0, rot, 0]);
    b.box(0x16202f, [2.66, 1.0, 9.6], P(0, 2.8, -0.4), [0, rot, 0]);
    b.box(0x16202f, [2.1, 1.2, 0.1], P(0, 2.7, 5.52), [0, rot, 0]);
    b.box(0xd8a810, [1.8, 0.35, 4.8], P(0, 3.65, -1), [0, rot, 0]);
    for (const az of [-3.4, 3.3]) for (const sx of [-1, 1]) b.cyl(0x18181c, 0.55, 0.55, 0.4, 10, P(sx * 1.2, 0.55, az), [0, rot, Math.PI / 2]);
  },
  ruko(fac, opq, x, y, z, w, d, h, rot, wall, shop, rnd) {
    fac.box(wall, [w, h, d], [x, y + h / 2, z], [0, rot, 0], [8, 8]);
    opq.box(shop, [w * 1.015, 3.3, d * 1.015], [x, y + 1.65, z], [0, rot, 0]);
    opq.box(0x8a8f9c, [w * 1.04, 0.5, d * 1.04], [x, y + h + 0.25, z], [0, rot, 0]);
    const P = _loc(x, y, z, rot);
    for (const sx of [-1, 1]) opq.box(rnd() < 0.5 ? 0xffd24a : 0xffffff, [0.3, 1.3, d * 0.75], P(sx * (w / 2 + 0.2), 4.3, 0), [0, rot, 0]);
    if (rnd() < 0.6) opq.cyl(0x2f9ad6, 1.1, 1.1, 1.8, 8, P(w * 0.2, h + 1.4, d * 0.15));
  },
  train(b, cars) {
    const L = 19, gap = 0.7, total = cars * L + (cars - 1) * gap, z0 = -total / 2;
    for (let i = 0; i < cars; i++) {
      const zc = z0 + L / 2 + i * (L + gap);
      b.box(0xdfe3e8, [3.0, 3.5, L], [0, 2.4, zc]);
      b.box(0xe8262e, [3.04, 0.6, L + 0.02], [0, 1.55, zc]);
      b.box(0xff8a1a, [3.04, 0.22, L + 0.02], [0, 1.98, zc]);
      b.box(0x18243d, [3.06, 1.0, L - 2.2], [0, 3.05, zc]);
      for (const dz of [-6, 0, 6]) b.box(0x9fb0c8, [3.08, 2.0, 1.2], [0, 2.3, zc + dz]);
      b.box(0xb7bcc4, [2.2, 0.45, L - 3], [0, 4.35, zc]);
      for (const bg of [-6.6, 6.6]) b.box(0x2a2a30, [2.4, 0.7, 3.4], [0, 0.65, zc + bg]);
      if (i === 0 || i === cars - 1) { const fz = i === 0 ? z0 - 0.02 : z0 + total + 0.02; b.box(0x18243d, [2.5, 1.5, 0.08], [0, 3.0, fz]); b.box(0xffe9a0, [0.5, 0.4, 0.1], [-0.95, 1.3, fz]); b.box(0xffe9a0, [0.5, 0.4, 0.1], [0.95, 1.3, fz]); }
    }
  },
  rail(b, x, z0, z1, y) {
    const len = Math.abs(z1 - z0), zc = (z0 + z1) / 2;
    b.box(0x7a766f, [4.4, 0.36, len], [x, y + 0.18, zc]);
    for (const sx of [-0.72, 0.72]) b.box(0xa9aeb6, [0.14, 0.22, len], [x + sx, y + 0.47, zc]);
    for (let q = 0; q < len; q += 3) b.box(0x5a4632, [2.5, 0.12, 0.42], [x, y + 0.4, Math.min(z0, z1) + q]);
    for (let q = 20; q < len; q += 48) { b.cylAxis(0x6b7080, 0.16, 0.12, [x + 3.6, y, Math.min(z0, z1) + q], [x + 3.6, y + 8, Math.min(z0, z1) + q], 5, true); b.box(0x6b7080, [3.8, 0.14, 0.14], [x + 1.8, y + 7.6, Math.min(z0, z1) + q]); }
    b.box(0x2a2a30, [0.05, 0.05, len], [x, y + 7.1, zc]);
  },
  station(opq, x, y, z, len) {
    opq.box(0xc9c4b8, [7, 1.1, len], [x - 6.2, y + 0.55, z]);
    opq.box(0xe8262e, [7.1, 0.2, len + 0.1], [x - 6.2, y + 1.15, z]);
    for (let q = -len / 2 + 4; q < len / 2; q += 12) opq.cylAxis(0x4a5060, 0.18, 0.18, [x - 8.4, y + 1.1, z + q], [x - 8.4, y + 6, z + q], 5, true);
    opq.box(0x3a4a78, [8, 0.4, len * 0.8], [x - 7.2, y + 6.1, z]);
    opq.box(0xf4c318, [0.4, 1.4, len * 0.5], [x - 10.6, y + 5.2, z]);
  },
  perpus(fac, opq, x, y, z, rot) {
    const P = _loc(x, y, z, rot);
    fac.box(0xb9553a, [82, 15, 36], P(0, 7.5, 0), [0, rot, 0], [8, 8]);
    opq.box(0xcfc9ba, [86, 1.6, 40], P(0, 15.8, 0), [0, rot, 0]);
    fac.box(0xc2603f, [58, 11, 26], P(0, 22, -3), [0, rot, 0], [8, 8]);
    opq.box(0xcfc9ba, [62, 1.6, 30], P(0, 28, -3), [0, rot, 0]);
    opq.box(0x86c6e8, [60, 6, 1.0], P(0, 9, 18.2), [0, rot, 0]);
    for (let i = -4; i <= 4; i++) opq.cyl(0xe8e2d4, 0.9, 0.9, 15, 8, P(i * 8.5, 7.5, 19.5));
    opq.box(0x9fd8f4, [34, 14, 20], P(0, 36.5, -3), [0.0, rot, 0]);
    opq.cyl(0xa8e0f8, 0, 24, 15, 4, P(0, 48, -3), [0, rot + Math.PI / 4, 0]);
    opq.box(0xf4c318, [30, 3, 0.6], P(0, 12.5, 18.6), [0, rot, 0]);
    for (let i = 0; i < 4; i++) opq.box(0x7fb8d8, [6, 18, 0.3], P(-12 + i * 8, 36, 7.2), [0.0, rot, 0]);
  },
  balairung(opq, x, y, z, rot) {
    const P = _loc(x, y, z, rot);
    opq.box(0xf0ece2, [44, 9, 26], P(0, 4.5, 0), [0, rot, 0]);
    opq.box(0x4a4f5c, [52, 1.4, 34], P(0, 10.2, 0), [0, rot, 0]);
    opq.box(0x5a6070, [40, 5, 22], P(0, 13.4, 0), [0.0, rot, 0]);
    opq.cyl(0x4a4f5c, 0, 24, 6, 4, P(0, 18, 0), [0, rot + Math.PI / 4, 0]);
    for (let i = -5; i <= 5; i++) opq.cyl(0xffffff, 0.7, 0.7, 9, 8, P(i * 4, 4.5, 14));
    opq.box(0xf4c318, [20, 2.2, 0.5], P(0, 7.8, 14.8), [0, rot, 0]);
  },
  makara(opq, glow, x, y, z, rot) {
    const P = _loc(x, y, z, rot);
    opq.box(0xcfc9ba, [9, 1.2, 4], P(0, 0.6, 0), [0, rot, 0]);
    for (const sx of [-1, 1]) opq.cylAxis(0xd8a010, 0.7, 0.55, P(sx * 2.8, 1.2, 0), P(sx * 2.8, 9.5, 0), 8, true);
    opq.cyl(0xf4c318, 4.2, 4.2, 0.9, 20, P(0, 11.5, 0), [Math.PI / 2, rot, 0]);
    opq.cyl(0x7a4a10, 3.3, 3.3, 1.0, 20, P(0, 11.5, 0.1), [Math.PI / 2, rot, 0]);
    glow.cyl(0xffe27a, 1.4, 1.4, 1.2, 12, P(0, 11.5, 0.2), [Math.PI / 2, rot, 0]);
  },
  belimbing(opq, glow, x, y, z, s) {
    s = s || 1;
    opq.cyl(0xcfc9ba, 7 * s, 8 * s, 2.4 * s, 12, [x, y + 1.2 * s, z]);
    opq.cyl(0xe2ddd0, 3.2 * s, 4.2 * s, 5 * s, 10, [x, y + 4.9 * s, z]);
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; opq.sph(0xd8dc3a, [1.7 * s, 4.6 * s, 1.7 * s], [x + Math.cos(a) * 1.5 * s, y + 11 * s, z + Math.sin(a) * 1.5 * s], [0, 0, 0], 7, 5); }
    opq.sph(0xe8ec5a, [2.1 * s, 4.7 * s, 2.1 * s], [x, y + 11 * s, z], null, 8, 5);
    opq.cylAxis(0x3a8a3a, 0.35 * s, 0.2 * s, [x, y + 15 * s, z], [x, y + 17.4 * s, z], 5, true);
    glow.box(0xffffa0, [1, 0.4, 1], [x + 6 * s, y + 1.4, z]);
  },
  tent(b, x, y, z, rot, col) {
    const P = _loc(x, y, z, rot), w = 1.7, l = 2.2, h = 1.9;
    b.quad(P(-w, 0, -l), P(-w, 0, l), P(0, h, l), P(0, h, -l), col, [-1, 1, 0]);
    b.quad(P(w, 0, l), P(w, 0, -l), P(0, h, -l), P(0, h, l), col, [1, 1, 0]);
    b.tri(P(-w, 0, l), P(w, 0, l), P(0, h, l), 0x2b2f3a, [0, 0, 1]); b.tri(P(w, 0, -l), P(-w, 0, -l), P(0, h, -l), 0x2b2f3a, [0, 0, -1]);
  },
  lake(opq, cx, cz, r, y, rnd) {
    const n = 28, pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (0.82 + 0.18 * Math.sin(a * 3 + 1) + 0.08 * Math.sin(a * 5)); pts.push([cx + Math.cos(a) * rr, cz + Math.sin(a) * rr, rr]); }
    for (let i = 0; i < n; i++) { const a = pts[i], b2 = pts[(i + 1) % n]; opq.tri([cx, y + 0.07, cz], [a[0], y + 0.07, a[1]], [b2[0], y + 0.07, b2[1]], 0x3aa6d8, [0, 1, 0]);
      const f = 1.09; opq.quad([a[0], y + 0.05, a[1]], [b2[0], y + 0.05, b2[1]], [cx + (b2[0] - cx) * f, y + 0.05, cz + (b2[1] - cz) * f], [cx + (a[0] - cx) * f, y + 0.05, cz + (a[1] - cz) * f], 0xe6dca8, [0, 1, 0]); }
  },
});
