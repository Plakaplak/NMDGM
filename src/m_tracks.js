'use strict';
/* ===== Tracks: spline -> samples -> meshes + scenery ===== */
const ENVS = {
  sawah: { skyTop: hex(0x2a7de1), skyHor: hex(0xc6ebff), fog: hex(0xc6ebff), fogNear: 150, fogFar: 760, sunDir: [0.45, 0.75, 0.35], sunCol: [0.72, 0.68, 0.56], sunGlow: [1, 0.9, 0.6], ambTop: [0.56, 0.62, 0.76], ambBot: [0.38, 0.42, 0.3], emis: 0 },
  kota: { skyTop: hex(0x070722), skyHor: hex(0x4a2480), fog: hex(0x2c1a55), fogNear: 80, fogFar: 600, sunDir: [-0.35, 0.7, -0.45], sunCol: [0.34, 0.38, 0.66], sunGlow: [0.5, 0.5, 0.9], ambTop: [0.42, 0.45, 0.74], ambBot: [0.26, 0.24, 0.4], stars: true, emis: 1 },
  pantai: { skyTop: hex(0x35459e), skyHor: hex(0xffa95a), fog: hex(0xf3b07e), fogNear: 140, fogFar: 800, sunDir: [-0.75, 0.32, 0.5], sunCol: [0.86, 0.6, 0.38], sunGlow: [1, 0.6, 0.25], ambTop: [0.62, 0.55, 0.62], ambBot: [0.5, 0.42, 0.32], emis: 0 },
  gunung: { skyTop: hex(0x3d78c8), skyHor: hex(0xe3edf5), fog: hex(0xd3e0ea), fogNear: 90, fogFar: 560, sunDir: [0.3, 0.62, 0.5], sunCol: [0.8, 0.76, 0.64], sunGlow: [1, 0.95, 0.8], ambTop: [0.6, 0.66, 0.82], ambBot: [0.4, 0.44, 0.4], emis: 0, day: true },
  depok: { skyTop: hex(0x3d6cc0), skyHor: hex(0xffcf8c), fog: hex(0xf3c690), fogNear: 120, fogFar: 760, sunDir: [-0.6, 0.38, 0.55], sunCol: [0.92, 0.68, 0.42], sunGlow: [1, 0.7, 0.3], ambTop: [0.62, 0.58, 0.68], ambBot: [0.5, 0.42, 0.34], emis: 0, day: true },
  ui: { skyTop: hex(0x2f8be8), skyHor: hex(0xd6f0ff), fog: hex(0xcfeaf8), fogNear: 160, fogFar: 820, sunDir: [0.3, 0.9, 0.25], sunCol: [0.8, 0.78, 0.66], sunGlow: [1, 0.95, 0.7], ambTop: [0.6, 0.68, 0.84], ambBot: [0.4, 0.47, 0.34], emis: 0, day: true },
  showroom: { skyTop: hex(0x1a1f4a), skyHor: hex(0x7a4fb0), fog: hex(0x3a2a68), fogNear: 60, fogFar: 300, sunDir: [0.4, 0.8, 0.45], sunCol: [0.8, 0.78, 0.74], sunGlow: [0.8, 0.5, 1], ambTop: [0.6, 0.6, 0.78], ambBot: [0.34, 0.3, 0.46], stars: true, emis: 1 },
};

const TRACK_DEFS = [
  {
    id: 'sawah', name: 'Sawah Terasering', sub: 'Lembah hijau, bukit bertingkat, jalan berliku', theme: 'sawah', width: 30, seed: 11,
    pts: [[0, -300, 0], [200, -300, 0], [380, -270, 1.5], [470, -170, 3.5], [440, -40, 5.5], [330, 20, 6], [260, 110, 4], [300, 220, 2.5], [240, 320, 1.5], [100, 330, 0.5], [0, 260, 1], [-80, 170, 2.5], [-190, 190, 4.5], [-300, 130, 6], [-330, 0, 4.5], [-260, -90, 3], [-300, -200, 1.5], [-200, -290, 0.5]],
    ramps: [0.31, 0.78], pads: [0.12, 0.46, 0.9], ground: 0x5fae3b, asphalt: [0x4d4c52, 0x46454b], curb: [0xffc21a, 0x2a2a2a], barrier: [0x9c6a36, 0x7c4f24], barTop: 0xc89a5a,
  },
  {
    id: 'kota', name: 'Jakarta Malam', sub: 'Mengitari Monas, Bundaran HI, JPO dan ondel-ondel di bawah neon', theme: 'kota', width: 28, seed: 23,
    pts: [[90, -70, 0], [92, 30, 0], [94, 100, 0.5], [108, 165, 1], [122, 235, 1.5], [88, 322, 1.5], [0, 354, 1], [-88, 322, 1.5], [-122, 235, 1.5], [-108, 165, 1], [-94, 100, 0.5], [-92, 20, 0], [-92, -100, 0], [-104, -200, 0.5], [-162, -262, 1], [-232, -420, 2], [-164, -584, 3], [0, -650, 3.5], [164, -584, 3], [232, -420, 2], [163, -262, 1], [104, -200, 0.5]],
    ramps: [0.34], pads: [0.1, 0.52, 0.76], ground: 0x20202e, asphalt: [0x383842, 0x32323c], curb: [0xff2a6a, 0xffffff], barrier: [0xf2f2f2, 0xd4121a], barTop: 0xffffff,
    monas: [0, -420], tugu: [0, 235],
  },
  {
    id: 'pantai', name: 'Pantai Kelapa', sub: 'Senja di tepi laut, tikungan lebar dan bukit pasir', theme: 'pantai', width: 32, seed: 37,
    pts: [[0, -320, 0], [220, -340, 0.5], [420, -280, 1.5], [540, -140, 3], [520, 40, 2], [400, 120, 1], [280, 60, 2], [190, -40, 3], [90, -30, 2], [40, 70, 1], [100, 190, 0], [220, 260, 0.5], [200, 370, 1.5], [60, 420, 2], [-100, 380, 1], [-200, 280, 0], [-170, 160, 1], [-290, 100, 2], [-380, -20, 3], [-340, -170, 2], [-210, -260, 1]],
    ramps: [0.2, 0.62], pads: [0.36, 0.5, 0.86], ground: 0xe3cb86, asphalt: [0x5a5a60, 0x535359], curb: [0x1a7fe0, 0xffffff], barrier: [0x6b4423, 0x4a2f16], barTop: 0x9b6a3a,
  },
  {
    id: 'gunung', name: 'Tanjakan Gunung', sub: 'Menanjak ke puncak berkabut: tikungan jepit, hutan pinus, salju', theme: 'gunung', width: 26, seed: 51, terrain: true,
    pts: [[0,240,0],[152,248,0.5],[288,208,3],[360,120,8],[344,16,15],[264,-48,22],[160,-32,28],[96,-96,33],[104,-200,38],[192,-248,42],[288,-304,48],[264,-400,54],[152,-416,58],[48,-360,62],[-40,-304,64],[-136,-240,60],[-232,-264,52],[-320,-200,44],[-344,-88,34],[-272,-16,26],[-304,80,18],[-240,160,10],[-144,208,4],[-72,256,1]],
    ramps: [0.2, 0.74], pads: [0.08, 0.42, 0.6, 0.9], ground: 0x5a8f3a, asphalt: [0x4a4a50, 0x444449], curb: [0xffffff, 0xd4121a], barrier: [0xa8a8a8, 0x888888], barTop: 0xd8d8d8,
  },
  {
    id: 'depok', name: 'Margonda Depok', sub: 'Senja di Jalan Margonda: ruko, angkot, jembatan penyeberangan, KRL', theme: 'depok', width: 30, seed: 67,
    pts: [[85, -180, 0.5], [110, -60, 1.5], [85, 80, 1], [75, 220, 0], [90, 320, 0], [60, 410, 0], [-10, 450, 0], [-90, 420, 0.5], [-100, 320, 1], [-85, 180, 1.5], [-120, 50, 1], [-90, -90, 0], [-85, -200, 0], [-110, -290, 0], [-70, -380, 0], [0, -410, 0], [60, -390, 0], [80, -330, 0]],
    ramps: [0.3, 0.8], pads: [0.15, 0.55, 0.92], ground: 0x8a8272, asphalt: [0x56555a, 0x4f4e53], curb: [0xe8262e, 0xffffff], barrier: [0xdcdcdc, 0xe8262e], barTop: 0xffffff,
    belimbing: [-20, -335], rail: 190,
  },
  {
    id: 'ui', name: 'Kampus UI', sub: 'Mengitari danau kampus: Perpustakaan, Balairung, bikun kuning dan KRL', theme: 'ui', width: 30, seed: 83,
    pts: [[0, -330, 0], [160, -330, 0.5], [290, -260, 2], [340, -120, 4], [320, 40, 5], [380, 170, 4], [300, 290, 2.5], [160, 330, 1.5], [40, 280, 1], [-60, 330, 1.5], [-200, 320, 2.5], [-320, 230, 4], [-340, 80, 5], [-290, -40, 6], [-340, -170, 4.5], [-260, -280, 2], [-130, -330, 0.5]],
    ramps: [0.22, 0.66], pads: [0.1, 0.46, 0.84], ground: 0x62b04a, asphalt: [0x4d4d52, 0x47474c], curb: [0xf4c318, 0x1a1a1a], barrier: [0xf0ece0, 0xf4c318], barTop: 0xffffff,
    lake: [0, -20, 150], perpus: [-20, 205], balairung: [150, -205], rail: 80,
  },
];

function crPt(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  const f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), f(p0[2], p1[2], p2[2], p3[2])];
}

function buildTrack(def) {
  const env = ENVS[def.theme];
  const rnd = mulberry32(def.seed);
  const P = def.pts, n = P.length;
  /* 1. dense spline */
  const dense = [], per = 48;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    for (let k = 0; k < per; k++) dense.push(crPt(p0, p1, p2, p3, k / per));
  }
  const dn = dense.length, cum = [0];
  for (let i = 0; i < dn; i++) { const a = dense[i], b = dense[(i + 1) % dn]; cum.push(cum[i] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const L = cum[dn];
  const N = Math.round(L / 4), sp = L / N;
  /* 2. resample at equal arc length */
  const X = new Float32Array(N), Z = new Float32Array(N), Y = new Float32Array(N);
  let di = 0;
  for (let i = 0; i < N; i++) {
    const s = i * sp;
    while (di < dn - 1 && cum[di + 1] < s) di++;
    const a = dense[di], b = dense[(di + 1) % dn], t = (s - cum[di]) / ((cum[di + 1] - cum[di]) || 1);
    X[i] = lerp(a[0], b[0], t); Z[i] = lerp(a[1], b[1], t); Y[i] = lerp(a[2], b[2], t);
  }
  // smooth elevation
  for (let pass = 0; pass < 3; pass++) {
    const T = Float32Array.from(Y);
    for (let i = 0; i < N; i++) Y[i] = (T[(i - 1 + N) % N] + T[i] * 2 + T[(i + 1) % N]) / 4;
  }
  /* 3. frame */
  const TX = new Float32Array(N), TZ = new Float32Array(N), NX = new Float32Array(N), NZ = new Float32Array(N);
  const HD = new Float32Array(N), K = new Float32Array(N), SL = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = (i - 1 + N) % N, b = (i + 1) % N;
    let dx = X[b] - X[a], dz = Z[b] - Z[a]; const l = Math.hypot(dx, dz);
    TX[i] = dx / l; TZ[i] = dz / l; NX[i] = TZ[i]; NZ[i] = -TX[i];
    HD[i] = Math.atan2(TX[i], TZ[i]);
  }
  for (let i = 0; i < N; i++) {
    const b = (i + 1) % N; K[i] = angDiff(HD[i], HD[b]) / sp;
  }
  // smooth curvature a little
  { const T = Float32Array.from(K); for (let i = 0; i < N; i++) K[i] = (T[(i - 2 + N) % N] + T[(i - 1 + N) % N] + T[i] + T[(i + 1) % N] + T[(i + 2) % N]) / 5; }

  /* pick straight spots for ramps/pads */
  const calm = (frac, span) => {
    let best = Math.round(frac * N) % N, bv = 1e9;
    for (let d = -Math.round(span * N); d <= Math.round(span * N); d++) {
      const i = (Math.round(frac * N) + d + N) % N; let v = 0;
      for (let q = -12; q <= 12; q++) v += Math.abs(K[(i + q + N) % N]);
      if (v < bv) { bv = v; best = i; }
    }
    return best;
  };
  const ramps = def.ramps.map(f => calm(f, 0.05));
  const rampOn = new Uint8Array(N);
  const RR = 7, RH = 3.2;
  ramps.forEach(ir => { for (let d = 0; d <= RR; d++) { const i = (ir - d + N) % N; Y[i] += RH * Math.pow(1 - d / RR, 1.4); rampOn[i] = 1; } });
  for (let i = 0; i < N; i++) { const b = (i + 1) % N; SL[i] = (Y[b] - Y[(i - 1 + N) % N]) / (2 * sp); }
  const pads = def.pads.map((f, k) => ({ i: calm(f, 0.04), lat: [-6, 6, 0][k % 3] }));

  const hw = def.width / 2;
  const gY = -0.4;
  const opq = new MB(), fac = new MB(), glow = new MB(), sgn = new MB(), ban = new MB(), far = new MB();
  const UP = [0, 1, 0];
  const Lp = (i, off, dy) => { i = (i + N) % N; return [X[i] + NX[i] * off, Y[i] + (dy || 0), Z[i] + NZ[i] * off]; };
  const Ab = (i, off, y) => { i = (i + N) % N; return [X[i] + NX[i] * off, y, Z[i] + NZ[i] * off]; };
  const asph = def.asphalt.map(hex);

  /* road + lines + curbs + barriers + embankment */
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    let col = asph[(i >> 2) & 1];
    if (rampOn[i]) col = (i & 1) ? hex(0xffc21a) : hex(0x1b1b1b);
    opq.quad(Lp(i, hw), Lp(j, hw), Lp(j, -hw), Lp(i, -hw), col, UP);
    if (!rampOn[i]) {
      if ((i & 3) < 2) opq.quad(Lp(i, 0.2, 0.04), Lp(j, 0.2, 0.04), Lp(j, -0.2, 0.04), Lp(i, -0.2, 0.04), 0xe8e8e8, UP);
      for (const s of [-1, 1]) {
        opq.quad(Lp(i, s * (hw - 2.6), 0.04), Lp(j, s * (hw - 2.6), 0.04), Lp(j, s * (hw - 3.0), 0.04), Lp(i, s * (hw - 3.0), 0.04), 0xf2f2f2, UP);
      }
    }
    const cc = hex(def.curb[i & 1]);
    for (const s of [-1, 1]) {
      opq.quad(Lp(i, s * hw, 0.03), Lp(j, s * hw, 0.03), Lp(j, s * (hw - 2.0), 0.03), Lp(i, s * (hw - 2.0), 0.03), cc, UP);
      const l0 = s * (hw + 0.6), l1 = s * (hw + 1.4);
      const bc = hex(def.barrier[(i >> 1) & 1]);
      const inw = [-s * NX[i], 0, -s * NZ[i]], outw = [s * NX[i], 0, s * NZ[i]];
      opq.quad(Lp(i, l0, -0.3), Lp(j, l0, -0.3), Lp(j, l0, 1.15), Lp(i, l0, 1.15), bc, inw);
      opq.quad(Lp(i, l0, 1.15), Lp(j, l0, 1.15), Lp(j, l1, 1.15), Lp(i, l1, 1.15), hex(def.barTop), UP);
      opq.quad(Lp(i, l1, -0.3), Lp(j, l1, -0.3), Lp(j, l1, 1.15), Lp(i, l1, 1.15), bc, outw);
      // embankment
      const gc = mixc(hex(def.ground), [0.3, 0.3, 0.3], 0.12);
      if (!def.terrain) opq.quad(Lp(i, s * (hw + 1.4), -0.3), Lp(j, s * (hw + 1.4), -0.3), Ab(j, s * (hw + 14), gY + 0.02), Ab(i, s * (hw + 14), gY + 0.02), gc, UP);
    }
  }
  /* start line checker */
  {
    const cellsX = Math.round(def.width / 2), cw = def.width / cellsX;
    const at = (t, off, dy) => [lerp(X[0], X[1], t) + NX[0] * off, lerp(Y[0], Y[1], t) + dy, lerp(Z[0], Z[1], t) + NZ[0] * off];
    for (let r = 0; r < 2; r++) for (let c = 0; c < cellsX; c++) {
      const o0 = -hw + c * cw, o1 = o0 + cw, t0 = r * 0.5, t1 = t0 + 0.5;
      opq.quad(at(t0, o0, 0.06), at(t1, o0, 0.06), at(t1, o1, 0.06), at(t0, o1, 0.06), ((r + c) & 1) ? 0x111111 : 0xffffff, UP);
    }
    // arch
    const i0 = 0, a0 = Lp(i0, hw + 3.4), a1 = Lp(i0, -hw - 3.4);
    for (const p of [a0, a1]) { opq.cylAxis(0x2a2d44, 0.55, 0.55, [p[0], p[1], p[2]], [p[0], p[1] + 12, p[2]], 8, true); opq.sph(0xff4fd8, 0.8, [p[0], p[1] + 12.3, p[2]], null, 6, 4); }
    const cx = (a0[0] + a1[0]) / 2, cz = (a0[2] + a1[2]) / 2, cy = Y[0] + 11.2;
    opq.box(0x1b1d33, [def.width + 7.4, 3.2, 1.2], [cx, cy, cz], [0, HD[0], 0]);
    for (const sgnF of [-1, 1]) {
      const fx = -TX[0] * sgnF, fz = -TZ[0] * sgnF, rx = fz, rz = -fx, o = 0.62, w = def.width + 6, h = 2.8;
      const Pq = (sx, sy) => [cx + rx * sx * w / 2 + fx * o, cy + sy * h / 2, cz + rz * sx * w / 2 + fz * o];
      ban.quadN([Pq(-1, -1), Pq(1, -1), Pq(1, 1), Pq(-1, 1)], [fx, 0, fz], [1, 1, 1], [[0, 0], [1, 0], [1, 1], [0, 1]]);
    }
  }
  /* boost pads (glowing) */
  pads.forEach(p => {
    const i = p.i, u = (a, v, dy) => {
      const k = Math.min(N - 1, i), t = [TX[k], TZ[k]], nn = [NX[k], NZ[k]];
      return [X[k] + t[0] * a + nn[0] * (p.lat + v), Y[k] + SL[k] * a + (dy || 0.07), Z[k] + t[1] * a + nn[1] * (p.lat + v)];
    };
    glow.quad(u(0, -4.2), u(11, -4.2), u(11, 4.2), u(0, 4.2), 0x1230d8, UP);
    for (let c = 0; c < 3; c++) {
      const a0 = 1 + c * 3.3;
      glow.tri(u(a0 + 2.6, 0, 0.1), u(a0, -3.2, 0.1), u(a0 + 0.9, 0, 0.1), 0xffa21a, UP);
      glow.tri(u(a0 + 2.6, 0, 0.1), u(a0 + 0.9, 0, 0.1), u(a0, 3.2, 0.1), 0xffa21a, UP);
    }
  });

  /* ===== scenery ===== */
  const nearest = (x, z) => {
    let bd = 1e18, bi = 0;
    for (let i = 0; i < N; i += 2) { const dx = X[i] - x, dz = Z[i] - z, d = dx * dx + dz * dz; if (d < bd) { bd = d; bi = i; } }
    return [Math.sqrt(bd), bi];
  };
  const excl = [];
  const blocked = (x, z) => { for (const e of excl) { const dx = x - e.x, dz = z - e.z; if (dx * dx + dz * dz < e.r * e.r) return true; } return false; };
  /* mountain heightfield: flat bench at road level, bowl rising away from the road */
  const ridgeN = (x, z) => 0.55 * Math.sin(x * 0.011 + 1.3) * Math.sin(z * 0.013) + 0.35 * Math.sin(x * 0.027 - z * 0.021 + 2) + 0.25 * Math.sin(z * 0.043 + x * 0.017);
  const terrH = (x, z) => {
    let dm = 1e18, sw = 0, sy = 0;
    for (let i = 0; i < N; i += 3) {
      const dx = X[i] - x, dz = Z[i] - z, d2 = dx * dx + dz * dz;
      if (d2 < dm) dm = d2;
      const w = 1 / (d2 * Math.sqrt(d2) + 400); sw += w; sy += w * Y[i];
    }
    const d = Math.sqrt(dm), base = sy / sw - 0.45, t = Math.max(0, d - (hw + 1.4 + 26));
    const rise = Math.min(t * t * 0.0085 + t * 0.12, 250) * (1 + 0.45 * ridgeN(x, z));
    return base + Math.max(0, rise);
  };
  const terrainY = (x, z) => {
    if (def.terrain) return terrH(x, z);
    const [d, i] = nearest(x, z); return lerp(Y[i], gY, smooth01((d - (hw + 1.4)) / 12.6));
  };
  let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
  for (let i = 0; i < N; i++) { minX = Math.min(minX, X[i]); maxX = Math.max(maxX, X[i]); minZ = Math.min(minZ, Z[i]); maxZ = Math.max(maxZ, Z[i]); }
  const cxm = (minX + maxX) / 2, czm = (minZ + maxZ) / 2;
  const seaX = def.theme === 'pantai' ? maxX + 130 : 1e9;
  // pick a spot near the track
  const nearSpot = (minOff, maxOff, minClear) => {
    for (let t = 0; t < 30; t++) {
      const j = Math.floor(rnd() * N), s = rnd() < 0.5 ? -1 : 1, o = hw + minOff + rnd() * (maxOff - minOff);
      const x = X[j] + NX[j] * s * o, z = Z[j] + NZ[j] * s * o;
      if (x > seaX - 12 || blocked(x, z)) continue;
      const [d] = nearest(x, z);
      if (d < hw + (minClear || minOff) - 0.5) continue;
      return { x, z, y: terrainY(x, z), j, s };
    }
    return null;
  };
  const anySpot = (rad, minClear) => {
    for (let t = 0; t < 40; t++) {
      const x = cxm + (rnd() - 0.5) * 2 * rad, z = czm + (rnd() - 0.5) * 2 * rad;
      if (x > seaX - 12 || blocked(x, z)) continue;
      const [d] = nearest(x, z);
      if (d < hw + minClear) continue;
      return { x, z, y: def.terrain ? terrainY(x, z) : gY };
    }
    return null;
  };
  /* a structure every `step` samples, `off` metres beyond the road edge */
  const along = (step, off, fn, sides) => {
    for (let i = Math.floor(rnd() * step); i < N; i += step) for (const s of (sides || [-1, 1])) {
      const o = hw + off, x = X[i] + NX[i] * s * o, z = Z[i] + NZ[i] * s * o;
      if (x > seaX - 12 || blocked(x, z)) continue;
      if (nearest(x, z)[0] < o - 3) continue;
      fn(x, terrainY(x, z), z, i, s);
    }
  };
  const idxAt = (x, z) => nearest(x, z)[1];
  const mix3 = (a, b, t) => mixc(hex(a), hex(b), t);
  const movers = [];

  /* ground disk */
  const gcol = hex(def.ground);
  const GR = 1700, GS = 28;
  for (let i = 0; i < GS; i++) {
    const a0 = TAU * i / GS, a1 = TAU * (i + 1) / GS;
    opq.tri([cxm, gY, czm], [cxm + Math.cos(a0) * GR, gY, czm + Math.sin(a0) * GR], [cxm + Math.cos(a1) * GR, gY, czm + Math.sin(a1) * GR], gcol, UP);
  }
  const band = (x0, x1, z0, z1, y, col) => opq.quad([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], col, UP);

  if (def.theme === 'sawah') {
    // paddies
    for (let i = 0; i < 110; i++) {
      const p = anySpot(560, 18); if (!p) continue;
      const w = 22 + rnd() * 30, d = 14 + rnd() * 22, a = rnd() * TAU;
      const cc = [hex(0x84c94a), hex(0x6bb53a), hex(0xa5d65a), hex(0x93d0e6), hex(0xd8c872)][Math.floor(rnd() * 5)];
      const c = Math.cos(a), s = Math.sin(a);
      const pt = (u, v) => [p.x + c * u - s * v, gY + 0.04, p.z + s * u + c * v];
      opq.quad(pt(-w, -d), pt(w, -d), pt(w, d), pt(-w, d), cc, UP);
    }
    for (let i = 0; i < 190; i++) { const p = nearSpot(4, 60, 5); if (p) SC.palm(opq, p.x, p.y, p.z, rnd, 0.9 + rnd() * 0.5); }
    for (let i = 0; i < 70; i++) { const p = nearSpot(6, 90, 7); if (p) SC.tree(opq, p.x, p.y, p.z, rnd, 0.8 + rnd() * 0.6); }
    for (let i = 0; i < 26; i++) { const p = nearSpot(5, 50, 6); if (p) SC.bamboo(opq, p.x, p.y, p.z, rnd); }
    for (let i = 0; i < 16; i++) { const p = nearSpot(12, 80, 12); if (p) SC.hut(opq, p.x, p.y, p.z, rnd() * TAU, 1 + rnd() * 0.5); }
    for (let i = 0; i < 16; i++) { const p = nearSpot(60, 320, 55); if (p) SC.terraceHill(opq, p.x, p.y, p.z, 24 + rnd() * 24, rnd); }
    for (let i = 0; i < 10; i++) {
      const a = TAU * i / 10 + rnd() * 0.3, r = 1000 + rnd() * 300;
      SC.mountain(far, cxm + Math.cos(a) * r, -10, czm + Math.sin(a) * r, 150 + rnd() * 120, 200 + rnd() * 160, i === 3 ? 'volcano' : 'hill');
    }
    for (let i = 0; i < 16; i++) SC.cloud(far, cxm + (rnd() - 0.5) * 1400, 150 + rnd() * 80, czm + (rnd() - 0.5) * 1400, rnd, 1 + rnd());
    for (let i = 0; i < N; i += 22) for (const s of [-1, 1]) {
      const o = hw + 3; SC.penjor(opq, X[i] + NX[i] * s * o, Y[i], Z[i] + NZ[i] * s * o, -NX[i] * s, -NZ[i] * s, rnd);
    }
    for (let i = 0; i < 6; i++) { const p = nearSpot(8, 30, 8); if (p) SC.signboard(opq, sgn, p.x, p.y, p.z, Math.atan2(X[p.j] - p.x, Z[p.j] - p.z), 14, 7, 5); }
  } else if (def.theme === 'kota') {
    /* ===== JAKARTA (malam) ===== */
    const [mx, mz] = def.monas, [tx0, tz0] = def.tugu;
    excl.push({ x: mx, z: mz, r: 150 }, { x: tx0, z: tz0, r: 62 });
    const wallCols = [0xffffff, 0xd8d8ff, 0xffe0f0, 0xe0fff0, 0xfff0d0];
    for (let i = 0; i < 250; i++) {
      const p = nearSpot(8, 110, 8); if (!p) continue;
      const w = 14 + rnd() * 22, d = 14 + rnd() * 22, h = 16 + rnd() * rnd() * 80;
      SC.building(fac, opq, p.x, p.y, p.z, w, d, h, Math.atan2(TX[p.j], TZ[p.j]), wallCols[Math.floor(rnd() * 5)], rnd);
      if (rnd() < 0.5) glow.box([hex(0xff2a6a), hex(0x2affd8), hex(0xffb21a), hex(0x8a5cff)][Math.floor(rnd() * 4)], [w + 0.4, 0.5, d + 0.4], [p.x, p.y + h - 0.6, p.z], [0, Math.atan2(TX[p.j], TZ[p.j]), 0]);
    }
    for (let i = 0; i < 150; i++) {
      const p = anySpot(1000, 20); if (!p) continue;
      const w = 24 + rnd() * 30, d = 24 + rnd() * 30, h = 60 + rnd() * 140;
      SC.building(fac, opq, p.x, p.y, p.z, w, d, h, rnd() * TAU, wallCols[Math.floor(rnd() * 5)], rnd);
    }
    // Monas square
    band(mx - 140, mx + 140, mz - 140, mz + 140, gY + 0.03, hex(0x1f3b2c));
    band(mx - 150, mx + 150, mz - 8, mz + 8, gY + 0.05, hex(0x6a6672)); band(mx - 8, mx + 8, mz - 150, mz + 150, gY + 0.05, hex(0x6a6672));
    SC.monas(opq, glow, mx, gY, mz, 1.15);
    for (let k = 0; k < 20; k++) { const a = k / 20 * TAU; SC.tree(opq, mx + Math.cos(a) * 128, gY, mz + Math.sin(a) * 128, rnd, 0.9); }
    // Bundaran HI
    SC.tugu(opq, glow, tx0, gY, tz0);
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; SC.palm(opq, tx0 + Math.cos(a) * 40, gY, tz0 + Math.sin(a) * 40, rnd, 1.1); }
    // ondel-ondel near the start and around the squares
    for (const s of [-1, 1]) { const o = hw + 7, i = N - 6; SC.ondel(opq, X[i] + NX[i] * s * o, Y[i], Z[i] + NZ[i] * s * o, Math.atan2(-NX[i] * s, -NZ[i] * s), 1.5, s > 0); }
    for (let k = 0; k < 10; k++) { const p = nearSpot(7, 24, 8); if (p) SC.ondel(opq, p.x, p.y, p.z, Math.atan2(X[p.j] - p.x, Z[p.j] - p.z), 1.4, rnd() < 0.5); }
    // JPO footbridges over the neck roads and lobes
    for (const q of [[92, 40], [-92, 40], [-100, -170], [100, -170], [0, 352], [0, -650]]) {
      const i = idxAt(q[0], q[1]); SC.jpo(opq, X[i], Y[i], Z[i], NX[i], NZ[i], 2 * (hw + 9), 8.5, 0x2c5fd0);
    }
    // TransJakarta buses parked on the shoulder
    for (let k = 0; k < 9; k++) {
      const i = Math.floor(rnd() * N), s = rnd() < 0.5 ? -1 : 1, o = hw + 11, x = X[i] + NX[i] * s * o, z = Z[i] + NZ[i] * s * o;
      if (blocked(x, z) || nearest(x, z)[0] < hw + 6) continue;
      SC.bus(opq, x, Y[i], z, Math.atan2(TX[i], TZ[i]), 0x1d63c8);
    }
    along(11, 3.4, (x, y, z, i, s) => SC.lamp(opq, glow, x, y, z, -NX[i] * s, -NZ[i] * s));
    for (let i = 0; i < 16; i++) { const p = nearSpot(8, 40, 8); if (p) SC.signboard(opq, sgn, p.x, p.y, p.z, Math.atan2(X[p.j] - p.x, Z[p.j] - p.z), 18, 9, 7); }
    for (let i = 0; i < 30; i++) { const p = anySpot(500, 25); if (!p) continue; const s = 8 + rnd() * 14; band(p.x - s, p.x + s, p.z - s, p.z + s, gY + 0.03, hex(0x2c2c3e)); }
  } else if (def.theme === 'gunung') {
    /* ===== GUNUNG ===== */
    const cell = 16, M0 = 600;
    const x0 = Math.floor((minX - M0) / cell) * cell, z0 = Math.floor((minZ - M0) / cell) * cell;
    const nx = Math.ceil((maxX + M0 - x0) / cell), nz = Math.ceil((maxZ + M0 - z0) / cell), W1 = nx + 1;
    const H = new Float32Array(W1 * (nz + 1));
    for (let a = 0; a <= nz; a++) for (let b = 0; b <= nx; b++) H[a * W1 + b] = terrH(x0 + b * cell, z0 + a * cell);
    const hAt = (a, b) => H[clamp(a, 0, nz) * W1 + clamp(b, 0, nx)];
    const vN = (a, b) => V3.norm([hAt(a, b - 1) - hAt(a, b + 1), 2 * cell, hAt(a - 1, b) - hAt(a + 1, b)]);
    const grass = hex(0x5f9a3e), olive = hex(0x7a8f48), rock = hex(0x8b8579), snow = hex(0xf2f6fa), cliff = hex(0x857d70);
    const vC = (a, b, n) => {
      const h = hAt(a, b), tint = 0.92 + 0.16 * ((Math.sin(a * 12.9 + b * 7.3) * 43758.5) % 1 + 1) % 1;
      let c = mixc(grass, olive, smooth01(h / 45));
      c = mixc(c, rock, smooth01((h - 60) / 70));
      c = mixc(c, snow, smooth01((h - 125) / 45));
      c = mixc(c, cliff, smooth01((0.84 - n[1]) / 0.22) * 0.85);
      return [c[0] * tint, c[1] * tint, c[2] * tint];
    };
    for (let a = 0; a < nz; a++) for (let b = 0; b < nx; b++) {
      const P = (aa, bb) => [x0 + bb * cell, hAt(aa, bb), z0 + aa * cell];
      const n00 = vN(a, b), n10 = vN(a, b + 1), n11 = vN(a + 1, b + 1), n01 = vN(a + 1, b);
      const c0 = vC(a, b, n00), c1 = vC(a, b + 1, n10), c2 = vC(a + 1, b + 1, n11), c3 = vC(a + 1, b, n01);
      const cc = [(c0[0] + c1[0] + c2[0] + c3[0]) / 4, (c0[1] + c1[1] + c2[1] + c3[1]) / 4, (c0[2] + c1[2] + c2[2] + c3[2]) / 4];
      opq.quadVN([P(a, b), P(a, b + 1), P(a + 1, b + 1), P(a + 1, b)], [n00, n10, n11, n01], cc);
    }
    for (let i = 0; i < 520; i++) { const p = nearSpot(4, 150, 5); if (p && p.y < 135) SC.pine(opq, p.x, p.y, p.z, rnd, 1.0 + rnd() * 1.1); }
    for (let i = 0; i < 90; i++) { const p = anySpot(900, 45); if (p && p.y < 130) SC.pine(opq, p.x, p.y, p.z, rnd, 1.4 + rnd() * 1.2); }
    for (let i = 0; i < 70; i++) { const p = nearSpot(5, 90, 6); if (p) SC.rock(opq, p.x, p.y, p.z, rnd, 1.4 + rnd() * 2.6); }
    for (let i = 0; i < 24; i++) { const p = nearSpot(8, 40, 8); if (p) SC.tent(opq, p.x, p.y, p.z, rnd() * TAU, [0xe8742a, 0x2aa0e8, 0xe8d22a, 0x8a4be8][Math.floor(rnd() * 4)]); }
    along(30, 2.6, (x, y, z, i, s) => { opq.box(0xe8e8e8, [0.5, 1.5, 0.5], [x, y + 0.75, z]); opq.box(0xd4121a, [0.55, 0.4, 0.55], [x, y + 1.3, z]); });
    for (let i = 0; i < 8; i++) { const p = nearSpot(8, 30, 8); if (p) SC.signboard(opq, sgn, p.x, p.y, p.z, Math.atan2(X[p.j] - p.x, Z[p.j] - p.z), 14, 7, 5); }
    for (let i = 0; i < 6; i++) {
      const a = TAU * i / 6 + rnd() * 0.4, r = 1500 + rnd() * 250;
      SC.mountain(far, cxm + Math.cos(a) * r, -10, czm + Math.sin(a) * r, 260 + rnd() * 140, 380 + rnd() * 200, 'volcano');
    }
    for (let i = 0; i < 46; i++) {
      const x = cxm + (rnd() - 0.5) * 1700, z = czm + (rnd() - 0.5) * 1700;
      if (nearest(x, z)[0] < 130) continue;
      SC.cloud(far, x, 40 + rnd() * 70, z, rnd, 3 + rnd() * 2.5);
    }
  } else if (def.theme === 'depok') {
    /* ===== DEPOK / MARGONDA (senja) ===== */
    const [bx, bz] = def.belimbing, railX = def.rail;
    excl.push({ x: bx, z: bz, r: 44 }, { x: railX, z: czm, r: 1e-3 }, { x: -5, z: 395, r: 60 });
    const nrail = (x) => Math.abs(x - railX) < 24;
    const walls = [0xf2e8d0, 0xe8c9a0, 0xd9e4ee, 0xf0b8a0, 0xe0e8c8, 0xf5f0e6, 0xcfd8e8];
    const shops = [0xd4121a, 0x2a62d8, 0xf4c318, 0x2fa04a, 0xff7a1a, 0x8a3ad8];
    // ruko rows on both sides of both carriageways
    along(5, 13, (x, y, z, i, s) => {
      if (nrail(x)) return;
      const w = 9 + rnd() * 5, d = 12 + rnd() * 6, h = 9 + rnd() * 8;
      SC.ruko(fac, opq, x + NX[i] * s * d * 0.5, y, z + NZ[i] * s * d * 0.5, w, d, h, Math.atan2(TX[i], TZ[i]) + (s > 0 ? 0 : Math.PI), walls[Math.floor(rnd() * walls.length)], shops[Math.floor(rnd() * shops.length)], rnd);
    });
    for (let i = 0; i < 70; i++) {
      const p = nearSpot(40, 170, 30); if (!p || nrail(p.x)) continue;
      const w = 18 + rnd() * 18, d = 16 + rnd() * 16, h = 14 + rnd() * rnd() * 70;
      SC.building(fac, opq, p.x, p.y, p.z, w, d, h, Math.atan2(TX[p.j], TZ[p.j]), walls[Math.floor(rnd() * walls.length)], rnd);
    }
    for (let i = 0; i < 60; i++) {
      const p = anySpot(1000, 40); if (!p || nrail(p.x)) continue;
      SC.building(fac, opq, p.x, p.y, p.z, 22 + rnd() * 26, 22 + rnd() * 26, 40 + rnd() * 120, rnd() * TAU, walls[Math.floor(rnd() * walls.length)], rnd);
    }
    // Tugu Belimbing at the north U-turn, mall at the south
    SC.belimbing(opq, glow, bx, gY, bz, 2.0);
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; SC.palm(opq, bx + Math.cos(a) * 34, gY, bz + Math.sin(a) * 34, rnd, 0.9); }
    SC.building(fac, opq, -5, gY, 395, 70, 34, 26, 0, 0xf4efe6, rnd);
    glow.box(0xff3a3a, [60, 2.2, 0.6], [-5, 21, 378]); glow.box(0xff3a3a, [60, 2.2, 0.6], [-5, 21, 412]);
    // JPO footbridges
    for (const q of [[110, -60], [-105, 40], [80, 130], [-95, -140]]) { const i = idxAt(q[0], q[1]); SC.jpo(opq, X[i], Y[i], Z[i], NX[i], NZ[i], 2 * (hw + 9), 8.5, 0xe8262e); }
    // angkot & bus parked on the shoulder
    for (let k = 0; k < 26; k++) {
      const i = Math.floor(rnd() * N), s = rnd() < 0.5 ? -1 : 1, o = hw + 6.5, x = X[i] + NX[i] * s * o, z = Z[i] + NZ[i] * s * o;
      if (blocked(x, z) || nearest(x, z)[0] < hw + 4 || nrail(x)) continue;
      const rot = Math.atan2(TX[i], TZ[i]);
      if (rnd() < 0.2) SC.bus(opq, x, Y[i], z, rot, 0xe8262e); else SC.angkot(opq, x, Y[i], z, rot, [0x2a62d8, 0x2fa04a, 0xf4c318, 0xd8d8d8][Math.floor(rnd() * 4)]);
    }
    // railway (KRL) east of the loop
    SC.rail(opq, railX, -1300, 1300, 0); SC.rail(opq, railX + 7.6, -1300, 1300, 0);
    SC.station(opq, railX, 0, 0, 90);
    movers.push({ cars: 8, x: railX, y: 0.55, speed: 42, lo: -1300, hi: 1300, phase: 0, dir: 1 });
    movers.push({ cars: 6, x: railX + 0.0, y: 0.55, speed: 36, lo: -1300, hi: 1300, phase: 1300, dir: -1 });
    for (let i = 0; i < 90; i++) { const p = nearSpot(4, 50, 5); if (p && !nrail(p.x)) SC.tree(opq, p.x, p.y, p.z, rnd, 0.8 + rnd() * 0.5); }
    for (let i = 0; i < 40; i++) { const p = nearSpot(4, 40, 5); if (p && !nrail(p.x)) SC.palm(opq, p.x, p.y, p.z, rnd, 0.9 + rnd() * 0.3); }
    along(13, 3.2, (x, y, z, i, s) => SC.lamp(opq, glow, x, y, z, -NX[i] * s, -NZ[i] * s));
    for (let i = 0; i < 12; i++) { const p = nearSpot(8, 40, 8); if (p && !nrail(p.x)) SC.signboard(opq, sgn, p.x, p.y, p.z, Math.atan2(X[p.j] - p.x, Z[p.j] - p.z), 16, 8, 6); }
    for (let i = 0; i < 6; i++) { const a = Math.PI * (0.6 + 0.8 * i / 6), r = 1300; SC.mountain(far, cxm + Math.cos(a) * r, -10, czm + Math.sin(a) * r, 190 + rnd() * 80, 150 + rnd() * 100, 'hill'); }
    for (let i = 0; i < 14; i++) SC.cloud(far, cxm + (rnd() - 0.5) * 1500, 140 + rnd() * 60, czm + (rnd() - 0.5) * 1500, rnd, 1 + rnd(), 0xffe2c0);
  } else if (def.theme === 'ui') {
    /* ===== KAMPUS UI ===== */
    const [lx, lz, lr] = def.lake, [px, pz] = def.perpus, [bax, baz] = def.balairung, railX = maxX + def.rail;
    excl.push({ x: lx, z: lz, r: lr + 12 }, { x: px, z: pz, r: 60 }, { x: bax, z: baz, r: 42 });
    const walls = [0xf4e9d2, 0xe8d0b0, 0xf6f2e8, 0xd9c3a0, 0xe6d8c0];
    SC.lake(opq, lx, lz, lr, gY, rnd);
    for (let k = 0; k < 14; k++) { const a = k / 14 * TAU + rnd() * 0.3, r = lr * (1.12 + rnd() * 0.15); SC.tree(opq, lx + Math.cos(a) * r, gY, lz + Math.sin(a) * r, rnd, 1.0 + rnd() * 0.6); }
    SC.perpus(fac, opq, px, gY, pz, Math.PI);
    SC.balairung(opq, bax, gY, baz, 0.6);
    // Makara emblem beside the start line
    { const i = 8, s = 1, o = hw + 12; SC.makara(opq, glow, X[i] + NX[i] * s * o, Y[i], Z[i] + NZ[i] * s * o, Math.atan2(-NX[i] * s, -NZ[i] * s)); }
    for (let i = 0; i < 26; i++) {
      const p = nearSpot(34, 190, 28); if (!p) continue;
      SC.building(fac, opq, p.x, p.y, p.z, 20 + rnd() * 18, 16 + rnd() * 12, 10 + rnd() * 16, Math.atan2(TX[p.j], TZ[p.j]), walls[Math.floor(rnd() * walls.length)], rnd);
    }
    for (let i = 0; i < 300; i++) { const p = nearSpot(4, 110, 5); if (p) SC.tree(opq, p.x, p.y, p.z, rnd, 1.0 + rnd() * 0.9); }
    for (let i = 0; i < 70; i++) { const p = nearSpot(4, 90, 5); if (p) SC.palm(opq, p.x, p.y, p.z, rnd, 0.9 + rnd() * 0.4); }
    for (let i = 0; i < 24; i++) { const p = nearSpot(5, 60, 6); if (p) SC.bamboo(opq, p.x, p.y, p.z, rnd); }
    for (let i = 0; i < 12; i++) { const p = nearSpot(10, 30, 9); if (p) SC.tent(opq, p.x, p.y, p.z, rnd() * TAU, [0xe8742a, 0x2aa0e8, 0xf4c318][Math.floor(rnd() * 3)]); }
    // bikun yellow buses on the shoulder
    for (let k = 0; k < 7; k++) {
      const i = Math.floor(rnd() * N), s = rnd() < 0.5 ? -1 : 1, o = hw + 7, x = X[i] + NX[i] * s * o, z = Z[i] + NZ[i] * s * o;
      if (blocked(x, z) || nearest(x, z)[0] < hw + 4) continue;
      SC.bikun(opq, x, Y[i], z, Math.atan2(TX[i], TZ[i]));
    }
    // railway (KRL) east of the campus
    SC.rail(opq, railX, -1300, 1300, 0); SC.rail(opq, railX + 7.6, -1300, 1300, 0);
    SC.station(opq, railX, 0, 40, 90);
    movers.push({ cars: 8, x: railX, y: 0.55, speed: 44, lo: -1300, hi: 1300, phase: 600, dir: 1 });
    movers.push({ cars: 8, x: railX, y: 0.55, speed: 38, lo: -1300, hi: 1300, phase: 0, dir: -1 });
    for (let i = 0; i < 6; i++) { const i2 = Math.floor(rnd() * N); const p = nearSpot(12, 50, 10); if (p) SC.signboard(opq, sgn, p.x, p.y, p.z, Math.atan2(X[p.j] - p.x, Z[p.j] - p.z), 14, 7, 5); }
    for (let i = 0; i < 6; i++) { const a = Math.PI * (0.2 + 1.2 * i / 6), r = 1300; SC.mountain(far, cxm + Math.cos(a) * r, -10, czm + Math.sin(a) * r, 220 + rnd() * 120, 170 + rnd() * 100, 'hill'); }
    for (let i = 0; i < 16; i++) SC.cloud(far, cxm + (rnd() - 0.5) * 1500, 130 + rnd() * 70, czm + (rnd() - 0.5) * 1500, rnd, 1 + rnd());
  } else { // pantai
    for (let i = 0; i < 230; i++) { const p = nearSpot(4, 70, 5); if (p) SC.palm(opq, p.x, p.y, p.z, rnd, 0.9 + rnd() * 0.6); }
    for (let i = 0; i < 40; i++) { const p = nearSpot(6, 120, 7); if (p) SC.tree(opq, p.x, p.y, p.z, rnd, 0.8 + rnd() * 0.5); }
    for (let i = 0; i < 24; i++) { const p = nearSpot(8, 40, 8); if (p) SC.umbrella(opq, p.x, p.y, p.z, rnd); }
    for (let i = 0; i < 40; i++) { const p = nearSpot(6, 100, 7); if (p) SC.rock(opq, p.x, p.y, p.z, rnd, 1 + rnd() * 1.6); }
    for (let i = 0; i < 50; i++) { // grass patches
      const p = anySpot(560, 14); if (!p) continue; const s = 20 + rnd() * 40;
      band(p.x - s, p.x + s, p.z - s * 0.7, p.z + s * 0.7, gY + 0.04, hex(0x7fa84a));
    }
    // sea
    band(seaX, seaX + 4000, czm - 3000, czm + 3000, gY + 0.1, hex(0x1d8fc9));
    band(seaX - 7, seaX, czm - 3000, czm + 3000, gY + 0.09, hex(0xf6fbff));
    band(seaX + 40, seaX + 4000, czm - 3000, czm + 3000, gY + 0.12, hex(0x1779b3));
    for (let i = 0; i < 6; i++) SC.boat(opq, seaX + 80 + rnd() * 400, gY + 0.1, czm + (rnd() - 0.5) * 700, rnd() * TAU);
    SC.lighthouse(opq, glow, seaX - 30, 0, czm + 40);
    for (let i = 0; i < 5; i++) SC.mountain(far, seaX + 700 + rnd() * 900, -8, czm + (rnd() - 0.5) * 1800, 90 + rnd() * 90, 80 + rnd() * 70, 'island');
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (0.55 + 0.9 * i / 7), r = 1000 + rnd() * 250;
      SC.mountain(far, cxm + Math.cos(a) * r - 300, -10, czm + Math.sin(a) * r, 150 + rnd() * 90, 140 + rnd() * 120, 'hill');
    }
    for (let i = 0; i < 12; i++) SC.cloud(far, cxm + (rnd() - 0.5) * 1400, 130 + rnd() * 60, czm + (rnd() - 0.5) * 1400, rnd, 1 + rnd());
    for (let i = 0; i < N; i += 26) for (const s of [-1, 1]) {
      const o = hw + 3; SC.penjor(opq, X[i] + NX[i] * s * o, Y[i], Z[i] + NZ[i] * s * o, -NX[i] * s, -NZ[i] * s, rnd);
    }
    for (let i = 0; i < 6; i++) { const p = nearSpot(8, 30, 8); if (p) SC.signboard(opq, sgn, p.x, p.y, p.z, Math.atan2(X[p.j] - p.x, Z[p.j] - p.z), 14, 7, 5); }
  }

  /* pickups: mangga lines + mystery crates */
  const mango = [], crates = [];
  const groups = Math.round(N / 20);
  for (let g = 0; g < groups; g++) {
    const base = Math.round((g + 0.5) * N / groups), lat0 = Math.sin(g * 1.7) * (hw - 8);
    for (let k = 0; k < 4; k++) mango.push({ i: (base + k * 2) % N, lat: lat0 + Math.sin(k * 0.9) * 1.5 });
  }
  const nCrate = 4;
  for (let c = 0; c < nCrate; c++) {
    const base = Math.round((c + 0.25) * N / nCrate + 6);
    for (const lat of [-8, 0, 8]) crates.push({ i: base % N, lat });
  }
  /* minimap */
  const mini = [];
  for (let i = 0; i < N; i += 3) mini.push([X[i], Z[i]]);

  return {
    def, env, N, sp, L, hw, gY, X, Y, Z, TX, TZ, NX, NZ, HD, K, SL, ramps, rampOn, pads, mango, crates, mini, movers,
    bounds: [minX, maxX, minZ, maxZ],
    meshes: { opaque: opq.data(), facade: fac.data(), glow: glow.data(), sign: sgn.data(), banner: ban.data(), far: far.data() },
  };
}
