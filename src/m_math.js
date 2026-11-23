'use strict';
/* ===== NUMIND NUSANTARA RACING — math & utils ===== */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const sign = v => v < 0 ? -1 : 1;
const smooth01 = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
function angDiff(a, b) { // shortest signed a -> b
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const hex = c => [((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255];
const mixc = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const scalec = (a, s) => [a[0] * s, a[1] * s, a[2] * s];

/* mat4, column-major */
const _t = new Float32Array(16);
const M = {
  id() { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); },
  mul(a, b, o) {
    o = o || new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      _t[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    o.set(_t); return o;
  },
  persp(fov, asp, n, f) {
    const t = 1 / Math.tan(fov / 2);
    return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]);
  },
  lookAt(e, a, u) {
    let zx = e[0] - a[0], zy = e[1] - a[1], zz = e[2] - a[2];
    let l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
    let xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx;
    l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return new Float32Array([xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1]);
  },
  trans(x, y, z) { const m = M.id(); m[12] = x; m[13] = y; m[14] = z; return m; },
  rotX(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); },
  rotY(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); },
  rotZ(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); },
  scale(x, y, z) { const m = M.id(); m[0] = x; m[5] = y; m[10] = z; return m; },
  // translate * rotY * rotX * rotZ
  xf(pos, rot) {
    let m = M.trans(pos[0], pos[1], pos[2]);
    if (rot) {
      if (rot[1]) m = M.mul(m, M.rotY(rot[1]));
      if (rot[0]) m = M.mul(m, M.rotX(rot[0]));
      if (rot[2]) m = M.mul(m, M.rotZ(rot[2]));
    }
    return m;
  },
  pt(m, x, y, z) {
    return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
  },
  dir(m, x, y, z) {
    return [m[0] * x + m[4] * y + m[8] * z, m[1] * x + m[5] * y + m[9] * z, m[2] * x + m[6] * y + m[10] * z];
  },
};
const V3 = {
  norm(a) { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; },
  sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; },
  dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; },
};
