'use strict';
/* ===== Game data, assets, physics, AI, items, race ===== */
const VEHICLES = [
  { id: 'truk', name: 'Truk Gizi', desc: 'Truk boks putih bertenaga. Paling cepat dan paling berat, tapi lambat berakselerasi dan kaku di tikungan.', speed: 8, accel: 3, handling: 3, weight: 9, lean: 1, leanAmt: 0.035 },
  { id: 'pickup', name: 'Pickup Desa 4x4', desc: 'Pickup 4x4 serbaguna. Seimbang di semua sisi dan kuat saat bertabrakan.', speed: 6, accel: 5, handling: 5, weight: 6, lean: 1, leanAmt: 0.04 },
  { id: 'ojol', name: 'Ojol Hijau', desc: 'Motor matik pengantar kilat. Akselerasi ganas dan lincah menyalip celah sempit.', speed: 5, accel: 8, handling: 6, weight: 3, lean: -1, leanAmt: 0.3 },
  { id: 'kurir', name: 'Kurir Oranye', desc: 'Motor kurir ringan. Kelincahan terbaik, pas untuk drift panjang, tapi mudah tersenggol.', speed: 4, accel: 6, handling: 9, weight: 2, lean: -1, leanAmt: 0.34 },
  { id: 'eskuter', name: 'Skuter Listrik', desc: 'Skuter listrik berjok yang senyap. Akselerasi instan dan lincah, tapi kecepatan puncaknya biasa saja.', perk: 'Turbo bertahan 20% lebih lama', speed: 6, accel: 9, handling: 6, weight: 3, lean: -1, leanAmt: 0.3, boost: 1.2, radius: 1.4, snd: 'ev' },
  { id: 'bajaj', name: 'Bajaj Oranye', desc: 'Bajaj legendaris ibu kota. Badan kokoh dan susah digeser, tapi bukan jagoan kecepatan.', perk: 'Tameng bertahan 30% lebih lama', speed: 5, accel: 4, handling: 6, weight: 7, lean: 1, leanAmt: 0.04, shield: 1.3, radius: 1.8, snd: 'put' },
  { id: 'skate', name: 'Skateboard', desc: 'Papan luncur super lincah. Paling jago menikung dan drift, tapi paling lambat dan paling ringan.', perk: 'Drift terisi 35% lebih cepat', speed: 3, accel: 7, handling: 10, weight: 1, lean: -1, leanAmt: 0.42, drift: 0.35, radius: 1.3, snd: 'roll' },
  { id: 'sepeda', name: 'Sepeda Kota', desc: 'Sepeda krem berkeranjang bergaya klasik. Santai dan gesit, paling jago memungut mangga.', perk: 'Keranjang menyedot mangga dari jarak 25% lebih jauh', speed: 3, accel: 6, handling: 8, weight: 2, lean: -1, leanAmt: 0.3, mangoR: 1.25, radius: 1.5, snd: 'roll' },
];
const CHARS = [
  { id: 'peci', name: 'Pak Peci', title: 'Sang Pemimpin', perk: 'Wibawa: perisai bertahan lebih lama.', speed: 1, accel: 0, handling: 0, shield: 1.5, color: '#c4161c' },
  { id: 'bendera', name: 'Mas Bendera', title: 'Si Gesit Muda', perk: 'Gesit: akselerasi dan kelincahan bertambah.', speed: -1, accel: 2, handling: 1, color: '#ff4a4a' },
  { id: 'putih', name: 'Pak Kemeja Putih', title: 'Sang Orator', perk: 'Orator: turbo drift terisi lebih cepat.', speed: 0, accel: 1, handling: 0, drift: 0.3, color: '#4aa3ff' },
  { id: 'eyang', name: 'Eyang Sepuh', title: 'Sang Sakti', perk: 'Sakti: pulih lebih cepat setelah terkena serangan.', speed: 1, accel: -1, handling: -1, spin: 0.7, color: '#e0a23a' },
  { id: 'mhs', name: 'Mbak Almamater', title: 'Si Jaket Kuning', perk: 'Disiplin: turbo drift terisi lebih cepat dan kelincahan naik.', speed: 0, accel: 0, handling: 2, drift: 0.25, color: '#f2c230' },
  { id: 'skripsi', name: 'Mas Skripsi', title: 'Si Begadang', perk: 'Kopi: akselerasi ekstra kencang, turbo lebih lama.', speed: -1, accel: 3, handling: 0, boost: 1.2, color: '#4a7bff' },
  { id: 'dokter', name: 'Dokter Sehat', title: 'Sang Penyembuh', perk: 'Tanggap: pulih sangat cepat setelah terkena serangan.', speed: 0, accel: 0, handling: 1, spin: 0.55, color: '#2fd0bd' },
  { id: 'batik', name: 'Mbak Batik', title: 'Si Anggun', perk: 'Luwes: kelincahan terbaik di tikungan.', speed: -1, accel: 0, handling: 3, color: '#b0702c' },
  { id: 'betawi', name: 'Bang Betawi', title: 'Jawara Kampung', perk: 'Jawara: perisai lebih awet dan kecepatan puncak naik.', speed: 2, accel: -1, handling: -1, shield: 1.4, color: '#d4452a' },
  { id: 'pendaki', name: 'Kang Pendaki', title: 'Penakluk Tanjakan', perk: 'Tangguh: kecepatan puncak tinggi dan pulih cepat.', speed: 2, accel: -1, handling: 0, spin: 0.8, color: '#ff7a1a' },
  { id: 'chef', name: 'Chef Rendang', title: 'Si Pedas Sejati', perk: 'Panas: akselerasi dahsyat dan turbo lebih lama.', speed: 0, accel: 2, handling: -1, boost: 1.25, color: '#e8e8e8' },
  { id: 'numibot', name: 'NUMI-bot', title: 'Maskot Numind', perk: 'Prosesor: semua statistik naik sedikit.', speed: 1, accel: 1, handling: 1, shield: 1.2, color: '#46e8ff' },
];
const ITEMS = {
  sambal: { icon: '🌶️', name: 'Sambal' }, paku: { icon: '📌', name: 'Paku' },
  tameng: { icon: '🛡️', name: 'Tameng' }, turbo: { icon: '⚡', name: 'Turbo' },
};
const PTS = [10, 8, 6, 5, 4, 3, 2, 1];
const GRAV = 42;

/* ---------- GPU assets ---------- */
const Assets = {
  tex: {}, pick: {}, vcache: {}, ccache: {}, tcache: {}, trcache: {},
  init() {
    for (const n of ['facade', 'facadeDay', 'sign', 'banner', 'qmark', 'trukSide', 'pickupSide', 'bajajSide'])
      this.tex[n] = Renderer.tex(TEXFN[n](), { repeat: n === 'facade' || n === 'facadeDay', mip: n === 'facade' || n === 'facadeDay' });
    const P = this.pick;
    P.mango = Renderer.mesh(PICK_BUILD.mango());
    P.crate = Renderer.mesh(PICK_BUILD.crate(), { tex: this.tex.qmark, emis: 1 });
    P.mine = Renderer.mesh(PICK_BUILD.mine());
    P.chili = Renderer.mesh(PICK_BUILD.chili(), { unlit: true });
    P.shield = Renderer.mesh(PICK_BUILD.shield(), { unlit: true });
    P.shadow = Renderer.mesh(PICK_BUILD.shadow(), { unlit: true });
  },
  vehicle(id) {
    if (this.vcache[id]) return this.vcache[id];
    const d = VEH_BUILD[id](), o = { def: d };
    o.body = Renderer.mesh(d.body);
    o.glass = d.glass ? Renderer.mesh(d.glass) : null;
    o.decals = d.decals.map(x => Renderer.mesh(x.data, { tex: this.tex[x.tex] }));
    o.wheels = d.wheels.map(w => ({ w, mesh: Renderer.mesh(w.data || wheelData(w.r, w.w, w.tire, w.hub)) }));
    return this.vcache[id] = o;
  },
  char(id, kind) {
    const key = id + kind;
    return this.ccache[key] || (this.ccache[key] = Renderer.mesh(CHAR_BUILD(id, kind)));
  },
  trainMesh(cars) {
    return this.trcache[cars] || (this.trcache[cars] = (() => { const b = new MB(); SC.train(b, cars); return Renderer.mesh(b.data()); })());
  },
  track(idx) {
    if (this.tcache[idx]) return this.tcache[idx];
    const T = buildTrack(TRACK_DEFS[idx]), m = T.meshes, t = this.tex;
    T.gpu = {
      opaque: Renderer.mesh(m.opaque),
      facade: m.facade.length ? Renderer.mesh(m.facade, { tex: T.env.day ? t.facadeDay : t.facade, emis: T.env.emis }) : null,
      glow: m.glow.length ? Renderer.mesh(m.glow, { unlit: true }) : null,
      sign: m.sign.length ? Renderer.mesh(m.sign, { tex: t.sign, unlit: true, emis: 1 }) : null,
      banner: Renderer.mesh(m.banner, { tex: t.banner, unlit: true, emis: 1 }),
      far: m.far.length ? Renderer.mesh(m.far) : null,
    };
    T.moverGpu = (T.movers || []).map(mv => ({ mv, mesh: this.trainMesh(mv.cars) }));
    T.idx = idx; T.meshes = null;
    return this.tcache[idx] = T;
  },
};

/* ---------- particles ---------- */
const Fx = {
  list: [],
  emit(x, y, z, vx, vy, vz, life, s0, s1, c0, c1, a0, add, grav) {
    if (this.list.length > 1100) this.list.splice(0, 150);
    this.list.push({ x, y, z, vx, vy, vz, t: 0, life, s0, s1, c0, c1, a0, add: !!add, g: grav || 0 });
  },
  update(dt) {
    const L = this.list;
    for (let i = L.length - 1; i >= 0; i--) {
      const p = L[i]; p.t += dt;
      if (p.t >= p.life) { L[i] = L[L.length - 1]; L.pop(); continue; }
      p.vy -= p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    }
  },
  collect() {
    const nrm = [], add = [];
    for (const p of this.list) {
      const k = p.t / p.life, c = mixc(p.c0, p.c1, k);
      const o = { x: p.x, y: p.y, z: p.z, s: lerp(p.s0, p.s1, k), r: c[0], g: c[1], b: c[2], a: p.a0 * (1 - k) };
      (p.add ? add : nrm).push(o);
    }
    return [nrm, add];
  },
  clear() { this.list.length = 0; },
  burst(x, y, z, n, speed, life, size, c0, c1, add, grav) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, b = Math.random() * Math.PI - Math.PI / 2, s = speed * (0.4 + Math.random() * 0.6);
      this.emit(x, y, z, Math.cos(a) * Math.cos(b) * s, Math.sin(b) * s + speed * 0.2, Math.sin(a) * Math.cos(b) * s, life * (0.6 + Math.random() * 0.6), size, size * 0.2, c0, c1, 1, add, grav);
    }
  },
};

/* ---------- kart ---------- */
class Kart {
  constructor(entry, id) {
    this.id = id; this.char = entry.char; this.veh = entry.veh; this.human = !!entry.human;
    const V = VEHICLES[this.veh], C = CHARS[this.char];
    const cl = v => clamp(v, 1, 10);
    this.st = { speed: cl(V.speed + (C.speed || 0)), accel: cl(V.accel + (C.accel || 0)), handling: cl(V.handling + (C.handling || 0)), weight: V.weight };
    this.name = C.name; this.vid = V.id; this.leanSign = V.lean; this.leanAmt = V.leanAmt;
    this.topSpeed = 38 + this.st.speed * 1.8;
    this.accel = 14 + this.st.accel * 2.8;
    this.turn = 1.7 + this.st.handling * 0.15;
    this.driftRate = 1 + (C.drift || 0) + (V.drift || 0);
    this.spinMul = C.spin || 1;
    this.boostDur = (C.boost || 1) * (V.boost || 1);
    this.shieldMul = (C.shield || 1) * (V.shield || 1);
    this.mangoR = V.mangoR || 1;
    this.radius = V.radius || (V.id === 'truk' ? 2.3 : V.id === 'pickup' ? 2.2 : 1.5);
    this.in = { steer: 0, thr: 0, brk: 0, hop: false, item: false, nos: false };
    this.ai = null;
    this.vis = { steer: 0, roll: 0, pitch: 0, spin: 0 };
    this.lapTimes = [];
  }
  place(T, grid) {
    const r = Math.floor(grid / 2), c = grid % 2, N = T.N;
    const idx = ((N - 2 - r * 4 - c * 2) % N + N) % N, lat = c ? 6 : -6;
    this.x = T.X[idx] + T.NX[idx] * lat; this.z = T.Z[idx] + T.NZ[idx] * lat; this.y = T.Y[idx]; this.gy = this.y; this.gyPrev = this.y;
    this.heading = T.HD[idx]; this.vx = 0; this.vz = 0; this.vy = 0; this.speed = 0;
    this.idx = idx; this.frac = 0; this.lat = lat; this.located = false; this.prevIdx = idx;
    this.lap = 0; this.lapStart = 0; this.prog = 0; this.finished = false; this.finishTime = 0; this.place_ = 0; this.points = 0;
    this.air = false; this.hopping = false; this.hopY = 0; this.hopV = 0; this.hopHeld = false; this.driftPending = 0;
    this.drift = { on: false, dir: 0, t: 0, level: 0 };
    this.boostT = 0; this.boostMul = 1; this.shieldT = 0; this.shieldHits = 0; this.spinT = 0; this.spinTotal = 1; this.invuln = 0;
    this.mangga = 0; this.nos = 0; this.nosOn = false; this.score = 0; this.mangoTotal = 0; this.item = null; this.itemN = 1; this.itemRoll = 0; this.steerS = 0;
    this.stuckT = 0; this.bumpCD = 0; this.padCD = 0; this.tHd = this.heading; this.slope = 0;
    this.lapTimes = []; this.bestLap = 0; this.wheelSpin = 0; this.rocket = false;
    this.vis = { steer: 0, roll: 0, pitch: 0, spin: 0 };
    this.cx = this.x; this.cz = this.z;
  }
  addBoost(t, mul) { if (this.boostT <= 0) this.boostMul = 1; this.boostT = Math.max(this.boostT, t * this.boostDur); this.boostMul = Math.max(this.boostMul, mul); }
}

/* find nearest track position (windowed search once located) */
function locate(k, T) {
  const N = T.N, X = T.X, Z = T.Z, px = k.x, pz = k.z;
  let bi = k.idx, bd = 1e18;
  if (!k.located) { for (let i = 0; i < N; i++) { const dx = X[i] - px, dz = Z[i] - pz, d = dx * dx + dz * dz; if (d < bd) { bd = d; bi = i; } } k.located = true; }
  else for (let j = -8; j <= 8; j++) { const i = (k.idx + j + N) % N, dx = X[i] - px, dz = Z[i] - pz, d = dx * dx + dz * dz; if (d < bd) { bd = d; bi = i; } }
  let best = null;
  for (const a of [(bi - 1 + N) % N, bi]) {
    const b = (a + 1) % N, ex = X[b] - X[a], ez = Z[b] - Z[a];
    const t = clamp(((px - X[a]) * ex + (pz - Z[a]) * ez) / (ex * ex + ez * ez), 0, 1);
    const qx = X[a] + ex * t, qz = Z[a] + ez * t, d = (px - qx) * (px - qx) + (pz - qz) * (pz - qz);
    if (!best || d < best.d) best = { a, b, t, qx, qz, d };
  }
  const { a, b, t, qx, qz } = best;
  let nx = lerp(T.NX[a], T.NX[b], t), nz = lerp(T.NZ[a], T.NZ[b], t); const nl = Math.hypot(nx, nz) || 1; nx /= nl; nz /= nl;
  k.prevIdx = k.idx; k.idx = a; k.frac = t;
  k.lat = (px - qx) * nx + (pz - qz) * nz; k.nx = nx; k.nz = nz; k.cx = qx; k.cz = qz;
  k.gy = lerp(T.Y[a], T.Y[b], t); k.slope = lerp(T.SL[a], T.SL[b], t);
  k.tHd = T.HD[a] + angDiff(T.HD[a], T.HD[b]) * t;
  return k;
}

/* ---------- Race ---------- */
class Race {
  constructor(trackIdx, entries, opts) {
    opts = opts || {};
    this.trackIdx = trackIdx;
    this.track = Assets.track(trackIdx);
    this.env = this.track.env;
    Renderer.setSky(this.env);
    this.laps = opts.laps || 3; this.mode = opts.mode || 'race'; this.attract = !!opts.attract;
    this.karts = entries.map((e, i) => new Kart(e, i));
    // grid: human 6th (or last when fewer); others by order
    const order = this.karts.map((_, i) => i);
    this.human = this.karts.find(k => k.human) || null;
    if (this.human && this.karts.length > 1) {
      const hi = order.indexOf(this.human.id); order.splice(hi, 1);
      order.splice(Math.min(5, order.length), 0, this.human.id);
    }
    order.forEach((kid, g) => this.karts[kid].place(this.track, g));
    this.karts.forEach(k => { locate(k, this.track); k.y = k.gy; k.gyPrev = k.gy; if (!k.human) k.ai = { lane: (Math.random() - 0.5) * 1.2, off: k.lat, skill: 0.94 + Math.random() * 0.07, mul: 1, itemDelay: 2 + Math.random() * 4, itemT: 0, driftCD: 0, wantDrift: false }; });
    this.phase = 'countdown'; this.t = 0; this.clock = 0; this.cdDur = 3.6;
    this.projectiles = []; this.mines = []; this.pickups = []; this.shake = 0; this.finishedCount = 0; this.humanDoneT = -1;
    this.msg = null; this.msgT = 0; this.events = [];
    this.results = null; this.order = this.karts.slice();
    this.cam = { eye: [0, 10, 0], target: [0, 0, 0], fov: 64 }; this.camAng = this.human ? this.human.heading : 0; this.camInit = false;
    this.attractT = Math.random() * 6;
    const T = this.track;
    for (const m of T.mango) this.pickups.push(this.mkPickup('mango', m));
    if (this.mode !== 'time') for (const c of T.crates) this.pickups.push(this.mkPickup('crate', c));
    Fx.clear();
    this.lastCountN = 4;
    const L = this.human || this.karts[0];
    this.cam.eye = [L.x - Math.sin(L.heading) * 14, L.y + 7, L.z - Math.cos(L.heading) * 14];
    this.cam.target = [L.x, L.y + 1.5, L.z];
  }
  mkPickup(kind, d) {
    const T = this.track, i = d.i;
    return { kind, i, lat: d.lat, x: T.X[i] + T.NX[i] * d.lat, z: T.Z[i] + T.NZ[i] * d.lat, y: T.Y[i] + (kind === 'crate' ? 1.4 : 1.2), t: 0, ph: Math.random() * TAU };
  }
  say(text, dur, cls) { this.msg = text; this.msgT = dur || 1.5; this.msgCls = cls || ''; }
  note(text, cls) { this.noteTxt = text; this.noteCls = cls || ''; this.noteT = 1.8; this.noteStamp = (this.noteStamp || 0) + 1; }

  /* ------ item roll ------ */
  rankOf(k) { return this.order.indexOf(k) + 1; }
  giveItem(k) {
    const r = this.rankOf(k), n = this.karts.length;
    const f = n > 1 ? (r - 1) / (n - 1) : 0.5; // 0 leader .. 1 last
    const w = { sambal: 30 + f * 8, paku: 34 - f * 24, tameng: 26 - f * 14, turbo: 14 + f * 36 };
    let tot = 0; for (const k2 in w) tot += w[k2];
    let q = Math.random() * tot, pick = 'sambal';
    for (const k2 in w) { q -= w[k2]; if (q <= 0) { pick = k2; break; } }
    k.item = pick; k.itemN = k.mangga >= 10 ? 3 : 1;
    if (k.human) Sfx.play('item');
  }
  useItem(k) {
    if (!k.item || k.itemRoll > 0) return;
    const n = k.itemN;
    switch (k.item) {
      case 'sambal': for (let i = 0; i < n; i++) this.fireSambal(k, (i - (n - 1) / 2) * 0.22); Sfx.play('sambal'); break;
      case 'paku': for (let i = 0; i < n; i++) this.dropMine(k, 4.5 + i * 3.2); Sfx.play('drop'); break;
      case 'tameng': k.shieldT = 7 * k.shieldMul * (n > 1 ? 1.4 : 1); k.shieldHits = n > 1 ? 2 : 1; Sfx.play('shieldOn'); break;
      case 'turbo': k.addBoost(1.9 * (n > 1 ? 1.5 : 1), 1.5); Sfx.play('boost'); if (k.human) this.shake = Math.max(this.shake, 0.25); break;
    }
    k.item = null; k.itemN = 1;
  }
  fireSambal(k, dAng) {
    const a = k.heading + dAng, sp = Math.max(70, k.speed + 42);
    this.projectiles.push({ x: k.x + Math.sin(a) * (k.radius + 1.4), z: k.z + Math.cos(a) * (k.radius + 1.4), y: k.y + 0.9, a, sp, life: 5, owner: k, age: 0, idx: k.idx, located: false, spin: 0 });
  }
  dropMine(k, back) {
    const f = [Math.sin(k.heading), Math.cos(k.heading)];
    const x = k.x - f[0] * (k.radius + back), z = k.z - f[1] * (k.radius + back);
    this.mines.push({ x, z, y: k.y, owner: k, arm: 0.7, life: 60, ph: Math.random() * 6 });
  }
  hitKart(k, fromProj, owner) {
    if (k.invuln > 0 || k.finished && this.phase === 'results') return;
    if (k.shieldT > 0) {
      k.shieldHits--; if (k.shieldHits <= 0) k.shieldT = 0;
      k.invuln = 0.5; Fx.burst(k.x, k.y + 1.2, k.z, 14, 9, 0.6, 0.5, [0.5, 0.9, 1], [1, 1, 1], true);
      Sfx.play('shield'); return;
    }
    if (owner && owner !== k) { owner.score += 150; if (owner.human) this.note('SERANGAN KENA  +150', 'gold'); }
    if (k.human) this.note('TERKENA!  -2 MANGGA', 'bad');
    k.spinT = k.spinTotal = 1.3 * k.spinMul; k.invuln = 2.2; k.vx *= 0.3; k.vz *= 0.3; k.speed *= 0.3;
    this.endDrift(k, true); k.mangga = Math.max(0, k.mangga - 2); k.boostT = 0; k.boostMul = 1;
    Fx.burst(k.x, k.y + 1, k.z, 26, 12, 0.9, 1.1, [1, 0.6, 0.15], [0.5, 0.1, 0.05], true, 5);
    Fx.burst(k.x, k.y + 1, k.z, 14, 6, 1.2, 1.6, [0.3, 0.3, 0.3], [0.1, 0.1, 0.1], false, -1);
    if (k.human) { this.shake = 0.8; } Sfx.play('boom');
  }
  endDrift(k, silent) {
    const d = k.drift;
    if (!d.on) return;
    d.on = false;
    if (!silent && d.level > 0) {
      const dur = [0, 0.75, 1.15, 1.7][d.level], mul = [1, 1.24, 1.32, 1.4][d.level];
      k.addBoost(dur, mul); k.score += 50 * d.level; Sfx.play('boost'); if (k.human) { this.note('DRIFT  +' + 50 * d.level, 'blue'); this.shake = Math.max(this.shake, 0.18 * d.level); this.say(['', 'TURBO!', 'SUPER TURBO!', 'ULTRA TURBO!!'][d.level], 0.8, 'boost'); }
      const f = [Math.sin(k.heading), Math.cos(k.heading)];
      Fx.burst(k.x - f[0] * 2, k.y + 0.6, k.z - f[1] * 2, 12, 10, 0.5, 0.8, [1, 0.7, 0.2], [1, 0.2, 0], true);
    }
    d.t = 0; d.level = 0; d.dir = 0;
  }
  startDrift(k, dir) {
    k.drift.on = true; k.drift.dir = dir; k.drift.t = 0; k.drift.level = 0;
  }

  /* ------ physics step for a kart ------ */
  stepKart(k, dt) {
    const T = this.track, inp = k.in, racing = this.phase !== 'countdown';
    k.boostT = Math.max(0, k.boostT - dt); if (k.boostT <= 0) k.boostMul = 1;
    k.shieldT = Math.max(0, k.shieldT - dt); k.invuln = Math.max(0, k.invuln - dt); k.bumpCD = Math.max(0, k.bumpCD - dt); k.padCD = Math.max(0, k.padCD - dt);
    if (k.itemRoll > 0) { k.itemRoll -= dt; if (k.itemRoll <= 0) this.giveItem(k); }
    let steerIn = inp.steer, thr = inp.thr, brk = inp.brk, hop = inp.hop;
    if (!racing) { thr = 0; brk = 0; hop = false; steerIn = 0; }
    const spun = k.spinT > 0;
    if (spun) {
      k.spinT -= dt; thr = 0; brk = 0; steerIn = 0; hop = false;
      k.vis.spin = (1 - Math.max(k.spinT, 0) / k.spinTotal) * TAU * 2;
      if (k.spinT <= 0) k.vis.spin = 0;
    }
    k.steerS = damp(k.steerS, steerIn, 11, dt);
    /* hop + drift */
    const edge = hop && !k.hopHeld; k.hopHeld = hop;
    const spd0 = k.vx * Math.sin(k.heading) + k.vz * Math.cos(k.heading);
    if (edge && !k.air && !k.hopping && !spun) {
      k.hopping = true; k.hopV = 6.8; k.hopY = 0.01;
      k.driftPending = (Math.abs(steerIn) > 0.25 && spd0 > 14) ? sign(steerIn) : 0;
      if (k.human) Sfx.play('hop');
    }
    if (k.hopping) {
      k.hopV -= 42 * dt; k.hopY += k.hopV * dt;
      if (k.hopY <= 0) {
        k.hopY = 0; k.hopV = 0; k.hopping = false;
        if (hop && k.driftPending && spd0 > 12) this.startDrift(k, k.driftPending);
        k.driftPending = 0;
      }
    }
    const D = k.drift;
    if (D.on) {
      if (!hop || spd0 < 9 || spun) this.endDrift(k, spun);
      else {
        D.t += dt * k.driftRate;
        const lv = D.t > 2.1 ? 3 : D.t > 1.3 ? 2 : D.t > 0.6 ? 1 : 0;
        if (lv > D.level) { D.level = lv; if (k.human) Sfx.play('drift' + lv); }
      }
    }
    /* NOS (nitro from mangga) */
    if (inp.nos && racing && !spun && k.nos > 0.005) {
      k.nos = Math.max(0, k.nos - dt * 0.2); k.addBoost(0.12, 1.32);
      if (!k.nosOn) { k.nosOn = true; if (k.human) { Sfx.play('boost'); this.shake = Math.max(this.shake, 0.2); } }
      if (Math.random() < 0.7) { const f = [Math.sin(k.heading), Math.cos(k.heading)]; Fx.burst(k.x - f[0] * 2.1, k.y + 0.7, k.z - f[1] * 2.1, 2, 7, 0.3, 0.5, [0.5, 0.8, 1], [0.2, 0.3, 1], true, 3); }
    } else k.nosOn = false;
    /* heading */
    let fx = Math.sin(k.heading), fz = Math.cos(k.heading);
    let vf = k.vx * fx + k.vz * fz;
    const sp = Math.abs(vf);
    const fturn = clamp(sp / 7, 0, 1) / (1 + 0.8 * Math.pow(sp / 46, 2));
    const dir = vf >= -0.5 ? 1 : -1;
    let turn = k.steerS;
    if (D.on) turn = clamp(D.dir * 0.85 + k.steerS * 0.6, -1.3, 1.3);
    if (k.air) turn *= 0.3;
    const omega = turn * k.turn * fturn * dir * (D.on ? 1.22 : 1);
    k.heading += omega * dt;
    fx = Math.sin(k.heading); fz = Math.cos(k.heading);
    const lx = fz, lz = -fx;
    vf = k.vx * fx + k.vz * fz;
    let vl = k.vx * lx + k.vz * lz;
    /* throttle */
    const mangMul = 1 + 0.012 * Math.min(k.mangga, 10);
    const maxS = k.topSpeed * mangMul * (k.ai ? k.ai.mul : 1) * (k.boostT > 0 ? k.boostMul : 1);
    if (!spun) {
      if (thr > 0 && !k.air) {
        if (vf < maxS) {
          const a = Math.max(k.accel * (1 - Math.pow(clamp(vf / (maxS * 1.03), 0, 1), 3)), 2.5);
          vf = Math.min(maxS, vf + a * thr * dt + (k.boostT > 0 ? 55 * dt : 0));
        } else vf -= ((vf - maxS) * 1.6 + 3) * dt;
      } else if (!k.air) {
        const dec = Math.min(Math.abs(vf), (3.5 + 0.0035 * vf * vf) * dt); vf -= sign(vf) * dec;
        if (vf > maxS) vf -= (vf - maxS) * 1.2 * dt;
      }
      if (brk > 0 && !k.air) {
        if (vf > 1) vf = Math.max(0, vf - 68 * brk * dt); else vf = Math.max(-16, vf - 24 * brk * dt);
      }
    } else { vf *= Math.exp(-1.2 * dt); }
    const grip = k.air ? 0.4 : D.on ? 1.9 : 9;
    vl *= Math.exp(-grip * dt);
    if (D.on) vf -= vf * 0.04 * dt;
    k.vx = fx * vf + lx * vl; k.vz = fz * vf + lz * vl;
    k.speed = vf;
    k.x += k.vx * dt; k.z += k.vz * dt;
    /* track relation */
    locate(k, T);
    if (k.prevIdx > T.N * 0.75 && k.idx < T.N * 0.25) { k.lap++; this.onLap(k); }
    else if (k.prevIdx < T.N * 0.25 && k.idx > T.N * 0.75) { k.lap--; }
    // walls
    const lim = T.hw - 0.4 - (k.radius - 1.5) * 0.35, al = Math.abs(k.lat);
    if (al > lim) {
      const s = sign(k.lat), over = al - lim;
      k.x -= k.nx * s * over; k.z -= k.nz * s * over;
      const vo = (k.vx * k.nx + k.vz * k.nz) * s;
      if (vo > 0) {
        k.vx -= k.nx * s * vo * 1.35; k.vz -= k.nz * s * vo * 1.35;
        const sc = 1 - clamp(vo / 60, 0, 0.3); k.vx *= sc; k.vz *= sc;
        const dh = angDiff(k.heading, k.tHd); if (Math.abs(dh) < 1.7) k.heading += dh * 0.28;
        if (vo > 6 && k.bumpCD <= 0) {
          k.bumpCD = 0.35;
          Fx.burst(k.x + k.nx * s * 1.6, k.y + 0.8, k.z + k.nz * s * 1.6, 8, 8, 0.4, 0.5, [1, 0.9, 0.5], [1, 0.4, 0.1], true, 12);
          if (k.human) { Sfx.play('bump'); this.shake = Math.max(this.shake, clamp(vo / 40, 0.1, 0.5)); }
        }
      }
      if (D.on && vo > 4) this.endDrift(k, true);
    }
    /* vertical */
    k.vy -= GRAV * dt; k.y += k.vy * dt;
    const g = k.gy;
    if (k.y <= g) {
      if (k.air && k.vy < -8) { Fx.burst(k.x, g + 0.3, k.z, 10, 6, 0.6, 1.0, [0.8, 0.75, 0.65], [0.6, 0.6, 0.6], false, -1); if (k.human) { Sfx.play('land'); this.shake = Math.max(this.shake, 0.3); } }
      k.y = g; k.vy = (g - k.gyPrev) / dt; k.vy = clamp(k.vy, -30, 30); k.air = false;
    } else if (k.y - g > 0.45) k.air = true;
    k.gyPrev = g;
    /* boost pads */
    if (k.padCD <= 0 && !k.air) for (const p of T.pads) {
      const di = (k.idx - p.i + T.N) % T.N;
      if (di <= 2 && Math.abs(k.lat - p.lat) < 5) { k.addBoost(1.4, 1.38); k.padCD = 0.8; Sfx.play(k.human ? 'pad' : 'ui'); if (k.human) this.shake = Math.max(this.shake, 0.2); break; }
    }
    /* item use */
    if (inp.item && !k.itemHeld && !spun && racing) { this.useItem(k); }
    k.itemHeld = inp.item;
    /* stuck / reset */
    if (racing && Math.abs(k.speed) < 3 && !spun && !k.finished) k.stuckT += dt; else k.stuckT = 0;
    if ((k.ai && k.stuckT > 3) || (k.human && inp.reset)) this.respawn(k);
    /* visuals */
    const tgtRoll = k.leanSign * k.leanAmt * clamp(k.steerS * (D.on ? 1.4 : 1), -1.4, 1.4) * clamp(sp / 35, 0, 1);
    k.vis.roll = damp(k.vis.roll, tgtRoll, 7, dt);
    const tgtPitch = k.air ? clamp(-k.vy * 0.02, -0.4, 0.4) : Math.atan(k.slope);
    k.vis.pitch = damp(k.vis.pitch, tgtPitch, 8, dt);
    k.vis.steer = damp(k.vis.steer, D.on ? D.dir * 0.4 + k.steerS * 0.3 : k.steerS * 0.5, 12, dt);
    k.wheelSpin += (vf / 0.45) * dt;
    /* particles from kart */
    if (racing && !k.air) {
      const rx = -fz, rz = fx; // right
      if (D.on && sp > 10) {
        const col = [[1, 1, 0.8], [1, 0.9, 0.3], [1, 0.45, 0.1], [0.4, 0.6, 1]][D.level];
        for (const s of [-1, 1]) if (Math.random() < 0.8) {
          const bx = k.x - fx * 1.6 + rx * s * 0.9, bz = k.z - fz * 1.6 + rz * s * 0.9;
          Fx.emit(bx, k.y + 0.15, bz, (Math.random() - 0.5) * 4 - fx * 3, 2 + Math.random() * 3, (Math.random() - 0.5) * 4 - fz * 3, 0.35, 0.25, 0.05, col, [col[0], col[1] * 0.4, 0], 1, true, 14);
        }
      }
      if (sp > 18 && Math.random() < 0.25) Fx.emit(k.x - fx * 2, k.y + 0.2, k.z - fz * 2, 0, 0.6, 0, 0.5, 0.35, 0.9, [0.8, 0.8, 0.8], [0.7, 0.7, 0.7], 0.2, false, -0.5);
    }
    if (k.boostT > 0 && racing) {
      const ex = k.x - fx * (k.radius + 0.2), ez = k.z - fz * (k.radius + 0.2);
      for (let i = 0; i < 2; i++) Fx.emit(ex + (Math.random() - 0.5) * 0.5, k.y + 0.6, ez + (Math.random() - 0.5) * 0.5, -fx * 8 + (Math.random() - 0.5) * 2, 0.5 + Math.random(), -fz * 8 + (Math.random() - 0.5) * 2, 0.28, 0.7, 0.1, [1, 0.8, 0.3], [1, 0.2, 0.05], 0.95, true, 0);
    }
    if (k.spinT > 0 && Math.random() < 0.5) Fx.emit(k.x, k.y + 1.6, k.z, (Math.random() - 0.5) * 3, 3, (Math.random() - 0.5) * 3, 0.6, 0.5, 0.1, [1, 1, 0.4], [1, 0.5, 0.1], 1, true, 8);
  }
  respawn(k) {
    const T = this.track, N = T.N, i = (k.idx + N - 2) % N;
    k.x = T.X[i]; k.z = T.Z[i]; k.heading = T.HD[i]; k.vx = k.vz = 0; k.speed = 0; k.vy = 0; k.y = T.Y[i] + 0.5;
    k.drift.on = false; k.spinT = 0; k.boostT = 0; k.invuln = 1.5; k.stuckT = 0; k.hopping = false; k.hopY = 0; k.air = true;
    k.located = false; locate(k, T); k.prevIdx = k.idx; k.gyPrev = k.gy;
  }
  onLap(k) {
    const T = this.track;
    if (k.lap >= 2 && k.lap <= this.laps + 1) {
      const lt = this.clock - k.lapStart; k.lapTimes.push(lt);
      if (!k.bestLap || lt < k.bestLap) { k.bestLap = lt; if (k.human) this.events.push({ type: 'bestlap', t: lt }); }
    }
    k.lapStart = this.clock;
    if (k.lap >= 2) { k.score += 200; if (k.human) this.note('PUTARAN SELESAI  +200', 'gold'); }
    if (k.lap > this.laps) {
      if (!k.finished) {
        k.finished = true; k.finishTime = this.clock; this.finishedCount++; k.place_ = this.finishedCount;
        k.score += [1000, 700, 500, 400, 300, 200, 150, 100][k.place_ - 1] || 50;
        if (!k.ai) k.ai = { lane: 0, off: k.lat, skill: 0.9, mul: 1, itemDelay: 3, itemT: 0, driftCD: 0 };
        if (k.human) {
          this.humanDoneT = this.clock; this.say(k.place_ === 1 ? 'JUARA 1!' : 'SELESAI!', 3, 'big'); Sfx.play('fanfare');
          this.events.push({ type: 'finish', place: k.place_ });
        }
      }
    } else if (k.human && k.lap >= 2) {
      if (k.lap === this.laps) { this.say('PUTARAN AKHIR!', 1.8, 'big'); Sfx.play('final'); } else { this.say('PUTARAN ' + k.lap, 1.4); Sfx.play('lap'); }
    }
  }

  /* ------ AI ------ */
  aiControl(k, dt) {
    const T = this.track, N = T.N, sp = T.sp, ai = k.ai, inp = k.in;
    if (this.phase === 'countdown') { inp.thr = 0; inp.brk = 0; inp.hop = false; inp.steer = 0; return; }
    const spd = Math.max(k.speed, 0);
    const look = clamp(9 + spd * 0.5, 11, 36);
    const ti = (k.idx + Math.round(look / sp)) % N;
    let kavg = 0, kfar = 0, c = 0;
    for (let q = 2; q <= 14; q += 2) { kavg += T.K[(k.idx + q) % N]; c++; }
    kavg /= c;
    for (let q = 3; q <= 24; q += 3) kfar = Math.max(kfar, Math.abs(T.K[(k.idx + q) % N]));
    const hwu = T.hw - 7;
    let want = ai.lane * hwu * 0.5 + clamp(kavg * 260, -1, 1) * hwu * 0.75;
    // avoid karts ahead
    for (const o of this.karts) {
      if (o === k) continue;
      const dx = o.x - k.x, dz = o.z - k.z, d2 = dx * dx + dz * dz;
      if (d2 < 22 * 22) {
        const fwd = dx * Math.sin(k.heading) + dz * Math.cos(k.heading);
        if (fwd > 0 && fwd < 22) { const dl = o.lat - k.lat; if (Math.abs(dl) < 4.5) want += -sign(dl || (ai.lane || 1)) * 5; }
      }
    }
    want = clamp(want, -hwu, hwu);
    ai.off = lerp(ai.off, want, 1 - Math.exp(-2.2 * dt));
    const tx = T.X[ti] + T.NX[ti] * ai.off, tz = T.Z[ti] + T.NZ[ti] * ai.off;
    const desired = Math.atan2(tx - k.x, tz - k.z), diff = angDiff(k.heading, desired);
    let steer = clamp(diff * 2.4, -1, 1);
    const vT = ai.skill * clamp(5.7 / Math.sqrt(Math.max(kfar, 0.0007)), 22, 999);
    let thr = 1, brk = 0;
    if (k.speed > vT + 3 && !k.drift.on) { brk = clamp((k.speed - vT) / 16, 0, 0.85); thr = brk > 0.3 ? 0 : 0.6; }
    // drifting through bends
    ai.driftCD -= dt;
    let hop = false;
    if (k.drift.on) {
      hop = Math.abs(T.K[k.idx]) > 0.0065 && k.drift.t < 3.0 && Math.sign(T.K[k.idx]) === k.drift.dir;
      if (!hop) ai.driftCD = 1.2;
    } else if (!k.air && ai.driftCD <= 0 && Math.abs(kavg) > 0.0105 && k.speed > 26 && k.spinT <= 0) {
      hop = true; steer = sign(kavg) * 0.9; ai.driftCD = 0.2;
    }
    if (k.hopping && !k.drift.on) { hop = true; steer = k.driftPending ? k.driftPending * 0.9 : steer; }
    inp.steer = steer; inp.thr = thr; inp.brk = brk; inp.hop = hop;
    // NOS on straights
    if (k.nosOn) inp.nos = k.nos > 0.08 && Math.abs(kfar) < 0.006; else inp.nos = k.nos > 0.45 && Math.abs(kfar) < 0.0035 && !k.air && k.speed > 30;
    // items
    inp.item = false;
    if (k.item && k.itemRoll <= 0) {
      ai.itemT += dt;
      if (ai.itemT > ai.itemDelay) {
        let use = false;
        if (k.item === 'sambal') { for (const o of this.karts) { if (o === k) continue; const dx = o.x - k.x, dz = o.z - k.z, fwd = dx * Math.sin(k.heading) + dz * Math.cos(k.heading); if (fwd > 6 && fwd < 55 && Math.abs(o.lat - k.lat) < 9) { use = true; break; } } }
        else if (k.item === 'paku') { for (const o of this.karts) { if (o === k) continue; const dx = o.x - k.x, dz = o.z - k.z, fwd = dx * Math.sin(k.heading) + dz * Math.cos(k.heading); if (fwd < -4 && fwd > -30 && Math.abs(o.lat - k.lat) < 8) { use = true; break; } } }
        else if (k.item === 'turbo') use = Math.abs(kavg) < 0.004;
        else use = ai.itemT > ai.itemDelay + 3;
        if (ai.itemT > ai.itemDelay + 14) use = true;
        if (use) { inp.item = true; ai.itemT = 0; ai.itemDelay = 2 + Math.random() * 5; }
      }
    }
  }
  /* auto-pilot used by finished human karts */
  humanControl(k, input, dt) {
    const inp = k.in;
    inp.steer = input.steer; inp.thr = input.thr; inp.brk = input.brk; inp.hop = input.hop; inp.item = input.item; inp.nos = !!input.nos; inp.reset = input.reset;
  }

  /* ------ main update ------ */
  update(dt, input) {
    const T = this.track;
    this.t += dt;
    if (this.phase === 'countdown') {
      const t = this.t, n = t < 0.4 ? 4 : t < 1.4 ? 3 : t < 2.4 ? 2 : t < 3.4 ? 1 : 0;
      if (n !== this.lastCountN) {
        this.lastCountN = n;
        if (n >= 1 && n <= 3 && !this.attract) { this.say(String(n), 1.0, 'count'); Sfx.play('count'); }
        if (n === 0 && !this.attract) { this.say('GAS!', 0.9, 'go'); Sfx.play('go'); }
      }
      if (this.human && input && input.thr > 0 && t > 2.75 && t < 3.6) this.human.rocket = true;
      if (t >= this.cdDur - 0.2 && this.phase === 'countdown') {
        this.phase = 'racing'; this.clock = 0;
        this.karts.forEach(k => {
          k.lapStart = 0;
          if (k.human && k.rocket) { k.addBoost(1.1, 1.35); this.say('START TURBO!', 1.2, 'boost'); Sfx.play('boost'); }
          else if (k.ai && Math.random() < 0.4) k.addBoost(0.8, 1.3);
        });
      }
    } else this.clock += dt;
    if (this.msgT > 0) this.msgT -= dt;
    if (this.noteT > 0) this.noteT -= dt;
    this.shake = Math.max(0, this.shake - dt * 1.6);
    // rubber banding
    const ref = this.human || this.order[Math.floor(this.karts.length / 2)];
    for (const k of this.karts) {
      if (k.ai) {
        const d = k.prog - ref.prog; // samples; + means ahead of reference
        const rb = clamp(1 - d * 0.0006, 0.9, 1.06);
        k.ai.mul = (this.mode === 'time' ? 1 : 1) * rb * (this.attract ? 1 : 0.985);
      }
    }
    for (const k of this.karts) {
      if (k.human && !k.finished && !this.attract && !this.autopilot) this.humanControl(k, input || { steer: 0, thr: 0, brk: 0, hop: false, item: false }, dt);
      else this.aiControl(k, dt);
      this.stepKart(k, dt);
    }
    // karts progress & order
    for (const k of this.karts) {
      k.prog = k.lap * T.N + k.idx + k.frac - (k.lap === 0 && k.idx > T.N * 0.5 ? T.N : 0);
    }
    this.order = this.karts.slice().sort((a, b) => {
      if (a.finished !== b.finished) return a.finished ? -1 : 1;
      if (a.finished && b.finished) return a.finishTime - b.finishTime;
      return b.prog - a.prog;
    });
    // kart collisions
    for (let i = 0; i < this.karts.length; i++) for (let j = i + 1; j < this.karts.length; j++) {
      const a = this.karts[i], b = this.karts[j];
      const dx = b.x - a.x, dz = b.z - a.z, d2 = dx * dx + dz * dz, rr = a.radius + b.radius;
      if (d2 < rr * rr && d2 > 0.0001 && Math.abs(a.y - b.y) < 2.5) {
        const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, over = rr - d;
        const ma = a.st.weight, mb = b.st.weight, tm = ma + mb;
        a.x -= nx * over * mb / tm; a.z -= nz * over * mb / tm; b.x += nx * over * ma / tm; b.z += nz * over * ma / tm;
        const rv = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
        if (rv < 0) {
          const jn = -(1.5) * rv / (1 / ma + 1 / mb);
          a.vx -= nx * jn / ma; a.vz -= nz * jn / ma; b.vx += nx * jn / mb; b.vz += nz * jn / mb;
          if (-rv > 6 && (a.bumpCD <= 0 || b.bumpCD <= 0)) {
            a.bumpCD = b.bumpCD = 0.3;
            Fx.burst((a.x + b.x) / 2, a.y + 1, (a.z + b.z) / 2, 6, 6, 0.3, 0.4, [1, 1, 0.7], [1, 0.5, 0.2], true, 10);
            if (a.human || b.human) { Sfx.play('bump'); this.shake = Math.max(this.shake, 0.2); }
          }
        }
      }
    }
    // pickups
    const pu = this.pickups;
    for (const p of pu) {
      if (p.t > 0) { p.t -= dt; continue; }
      for (const k of this.karts) {
        const dx = k.x - p.x, dz = k.z - p.z, r = p.kind === 'crate' ? 3.2 : 2.6 * k.mangoR;
        if (dx * dx + dz * dz < r * r && Math.abs(k.y - p.y) < 3.5) {
          if (p.kind === 'mango') {
            if (k.mangga < 10) { k.mangga++; if (k.mangga === 10 && k.human) this.say('MANGGA PENUH!', 1.2, 'boost'); }
            const pts = Math.round(100 * (1 + k.mangga / 10)); k.score += pts; k.mangoTotal++;
            const had = k.nos; k.nos = Math.min(1, k.nos + 0.1);
            if (k.human) { this.note('MANGGA  +' + pts + (k.nos > had ? '   NOS +10%' : '   NOS PENUH'), 'gold'); if (had < 1 && k.nos >= 1) this.say('NOS PENUH!', 1.0, 'boost'); }
            p.t = 7; if (k.human) Sfx.play('mango');
            Fx.burst(p.x, p.y, p.z, 5, 4, 0.4, 0.4, [1, 0.8, 0.2], [1, 0.5, 0], true);
          } else if (!k.item && k.itemRoll <= 0 && !k.finished) {
            k.itemRoll = k.human ? 1.2 : 0.5; p.t = 5; if (k.human) Sfx.play('crate');
            Fx.burst(p.x, p.y, p.z, 14, 8, 0.6, 0.7, [0.5, 0.7, 1], [1, 0.9, 0.3], true);
          } else if (p.kind === 'crate' && k.item) { /* keep crate for next */ continue; }
          break;
        }
      }
    }
    // projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i]; p.age += dt; p.life -= dt; p.spin += dt * 12;
      // homing
      let best = null, bd = 1e9;
      for (const o of this.karts) {
        if (o === p.owner && p.age < 1.5) continue;
        const dx = o.x - p.x, dz = o.z - p.z, d = Math.hypot(dx, dz), fw = dx * Math.sin(p.a) + dz * Math.cos(p.a);
        if (fw > 2 && d < 80 && d < bd && o !== p.owner) { bd = d; best = o; }
      }
      if (best) { const want = Math.atan2(best.x - p.x, best.z - p.z); p.a += clamp(angDiff(p.a, want), -1.6 * dt, 1.6 * dt); }
      p.x += Math.sin(p.a) * p.sp * dt; p.z += Math.cos(p.a) * p.sp * dt;
      const tmp = { x: p.x, z: p.z, idx: p.idx, located: p.located }; locate(tmp, T); p.idx = tmp.idx; p.located = true; p.y = lerp(p.y, tmp.gy + 1.0, 0.5);
      let dead = p.life <= 0;
      if (Math.abs(tmp.lat) > T.hw + 0.2) { dead = true; Fx.burst(p.x, p.y, p.z, 10, 7, 0.5, 0.7, [1, 0.5, 0.1], [0.6, 0.1, 0], true, 5); }
      if (!dead) for (const o of this.karts) {
        if (o === p.owner && p.age < 0.4) continue;
        const dx = o.x - p.x, dz = o.z - p.z;
        if (dx * dx + dz * dz < (o.radius + 1.0) * (o.radius + 1.0) && Math.abs(o.y - p.y) < 3) { this.hitKart(o, true, p.owner); dead = true; break; }
      }
      Fx.emit(p.x, p.y, p.z, (Math.random() - 0.5) * 2, 1, (Math.random() - 0.5) * 2, 0.4, 0.5, 0.1, [1, 0.6, 0.1], [0.8, 0.1, 0], 0.9, true, 0);
      if (dead) { this.projectiles.splice(i, 1); }
    }
    for (let i = this.mines.length - 1; i >= 0; i--) {
      const m = this.mines[i]; m.arm -= dt; m.life -= dt;
      let dead = m.life <= 0;
      if (!dead) for (const o of this.karts) {
        if (m.arm > 0) continue;
        const dx = o.x - m.x, dz = o.z - m.z;
        if (dx * dx + dz * dz < (o.radius + 0.8) * (o.radius + 0.8) && o.y < m.y + 2.5) {
          if (o === m.owner && m.arm > -1.0) continue;
          this.hitKart(o, false, m.owner); dead = true; Fx.burst(m.x, m.y + 0.5, m.z, 18, 10, 0.7, 0.9, [1, 0.6, 0.15], [0.5, 0.1, 0], true, 5); break;
        }
      }
      if (dead) this.mines.splice(i, 1);
    }
    Fx.update(dt);
    // end of race
    if (this.phase === 'racing' && this.human && this.human.finished) {
      const since = this.clock - this.humanDoneT;
      if (since > 3.2 && (this.finishedCount >= this.karts.length || since > 14)) this.finishRace();
    }
    if (this.phase === 'racing' && !this.human && this.attract) { /* loops forever */ }
    this.updateCamera(dt);
  }
  finishRace() {
    if (this.phase === 'results') return;
    this.phase = 'results';
    const res = this.order.map((k, i) => ({ kart: k, place: i + 1, time: k.finished ? k.finishTime : 0, best: k.bestLap, points: PTS[i] || 0, human: k.human, score: k.score, mango: k.mangoTotal }));
    this.results = res;
    this.events.push({ type: 'results' });
  }

  /* ------ camera ------ */
  updateCamera(dt) {
    const cam = this.cam, k = this.human;
    if (this.attract || !k) {
      const tgt = this.order[0];
      this.attractT += dt * 0.12;
      const T = this.track, N = T.N;
      const ahead = (tgt.idx + 14) % N;
      const ang = this.attractT, r = 34 + Math.sin(this.attractT * 0.7) * 10;
      const ex = tgt.x + Math.cos(ang) * r, ez = tgt.z + Math.sin(ang) * r;
      const ey = tgt.y + 11 + Math.sin(this.attractT * 0.9) * 4;
      cam.eye = [damp(cam.eye[0], ex, 2.5, dt), damp(cam.eye[1], ey, 2.5, dt), damp(cam.eye[2], ez, 2.5, dt)];
      cam.target = [damp(cam.target[0], T.X[ahead], 4, dt), damp(cam.target[1], tgt.y + 1.5, 4, dt), damp(cam.target[2], T.Z[ahead], 4, dt)];
      cam.fov = 58; return;
    }
    const def = Assets.vehicle(k.vid).def;
    const boosting = k.boostT > 0;
    let tgtAng = k.heading;
    const vs = Math.hypot(k.vx, k.vz);
    if (vs > 8) { const va = Math.atan2(k.vx, k.vz); tgtAng = k.heading + angDiff(k.heading, va) * 0.5; }
    if (k.drift.on) tgtAng += k.drift.dir * 0.12;
    if (!this.camInit) { this.camAng = k.heading; this.camInit = true; }
    this.camAng += angDiff(this.camAng, tgtAng) * (1 - Math.exp(-4.5 * dt));
    let dist = def.camD + clamp(Math.abs(k.speed) * 0.025, 0, 1.4) + (boosting ? 1.6 : 0);
    let height = def.camH;
    if (this.phase === 'countdown') {
      const t = clamp(this.t / 3.0, 0, 1), e = smooth01(t);
      dist = lerp(dist + 8, dist, e); height = lerp(height + 5, height, e);
      this.camAng = k.heading + (1 - e) * 1.2;
    }
    if (k.finished || this.phase === 'results') {
      this.camAng += dt * 0.4; dist += 4; height += 1.5;
    }
    const sx = Math.sin(this.camAng), sz = Math.cos(this.camAng);
    const ey = k.y + k.hopY + height, tx = k.x + Math.sin(k.heading) * 6, tz = k.z + Math.cos(k.heading) * 6;
    cam.eye = [k.x - sx * dist, damp(cam.eye[1], ey, 6, dt), k.z - sz * dist];
    if (!cam.init) { cam.eye[1] = ey; cam.init = true; }
    cam.target = [tx, k.y + 1.6 + (k.air ? -k.vy * 0.04 : 0), tz];
    if (this.shake > 0) { const s = this.shake * 0.35; cam.eye[0] += (Math.random() - 0.5) * s; cam.eye[1] += (Math.random() - 0.5) * s; cam.eye[2] += (Math.random() - 0.5) * s; }
    cam.fov = damp(cam.fov, 64 + (boosting ? 12 : 0) + clamp(Math.abs(k.speed) * 0.08, 0, 4), 5, dt);
  }

  /* ------ render ------ */
  render() {
    const R = Renderer, T = this.track, G = T.gpu, A = Assets, env = this.env;
    R.begin(this.cam, env);
    if (G.far) R.draw(G.far, null, { fog: [env.fogNear * 2.2, env.fogFar * 2.3] });
    R.draw(G.opaque, null);
    if (G.facade) R.draw(G.facade, null, { emis: env.emis });
    if (G.glow) R.draw(G.glow, null);
    if (G.sign) R.draw(G.sign, null);
    R.draw(G.banner, null);
    if (T.moverGpu) for (const o of T.moverGpu) {
      const mv = o.mv, span = mv.hi - mv.lo, ph = (mv.phase + this.t * mv.speed) % span;
      const z = mv.dir > 0 ? mv.lo + ph : mv.hi - ph;
      R.draw(o.mesh, M.xf([mv.x + (mv.dir > 0 ? 0 : 7.6), mv.y, z], [0, mv.dir > 0 ? 0 : Math.PI, 0]));
    }
    const glass = [];
    for (const k of this.karts) this.drawKart(k, glass);
    // pickups
    const tt = this.t, cx = this.cam.eye[0], cz = this.cam.eye[2];
    for (const p of this.pickups) {
      if (p.t > 0) continue;
      const dx = p.x - cx, dz = p.z - cz; if (dx * dx + dz * dz > 260 * 260) continue;
      const bob = Math.sin(tt * 3 + p.ph) * 0.18;
      if (p.kind === 'mango') R.draw(A.pick.mango, M.mul(M.xf([p.x, p.y + bob, p.z], [0, tt * 2.2 + p.ph, 0]), M.scale(1.2, 1.2, 1.2)));
      else R.draw(A.pick.crate, M.xf([p.x, p.y + bob + 0.2, p.z], [tt * 0.5, tt * 1.6 + p.ph, tt * 0.3]), { emis: 1 });
    }
    for (const m of this.mines) R.draw(A.pick.mine, M.xf([m.x, m.y + 0.05, m.z], [0, tt + m.ph, 0]));
    for (const p of this.projectiles) R.draw(A.pick.chili, M.mul(M.xf([p.x, p.y, p.z], [0, p.a, 0]), M.mul(M.rotZ(p.spin), M.scale(1.4, 1.4, 1.4))));
    // transparent: shadows, glass, shields
    for (const k of this.karts) {
      const def = Assets.vehicle(k.vid).def, gy = k.gy + 0.07;
      const sh = clamp(1 - (k.y - k.gy) * 0.12, 0.3, 1);
      R.draw(A.pick.shadow, M.mul(M.xf([k.x, gy, k.z], [0, k.heading, 0]), M.mul(M.rotX(-Math.atan(k.slope)), M.scale(def.wid * 0.58 * sh, 1, def.len * 0.52 * sh))), { alpha: 0.38 });
      if (k.shieldT > 0) {
        const pulse = k.shieldT < 1.5 ? (Math.sin(tt * 20) > 0 ? 0.35 : 0.1) : 0.3;
        R.draw(A.pick.shield, M.mul(M.xf([k.x, k.y + 0.3, k.z], [0, tt, 0]), M.scale(0.75 + def.len * 0.1, 0.75 + def.len * 0.1, 0.75 + def.len * 0.1)), { alpha: pulse });
      }
    }
    for (const g of glass) R.draw(g.mesh, g.m, { alpha: 0.32 });
    const [nrm, add] = Fx.collect();
    R.particles(nrm, false); R.particles(add, true);
  }
  kartMatrix(k) {
    const yaw = k.heading + k.vis.spin;
    let m = M.xf([k.x, k.y + k.hopY, k.z], [0, yaw, 0]);
    m = M.mul(m, M.rotX(-k.vis.pitch));
    m = M.mul(m, M.rotZ(k.vis.roll));
    if (k.drift.on) m = M.mul(m, M.rotY(-k.drift.dir * 0.22));
    return m;
  }
  drawKart(k, glass) {
    const R = Renderer, v = Assets.vehicle(k.vid), d = v.def;
    const base = this.kartMatrix(k);
    const flash = k.invuln > 0 && k.spinT <= 0 && Math.floor(this.t * 16) % 2 === 0 ? 0.3 : 0;
    const o = flash ? { add: [flash, flash, flash] } : null;
    R.draw(v.body, base, o);
    for (const dm of v.decals) R.draw(dm, base, o);
    for (const w of v.wheels) {
      const p = w.w.pos;
      let m = M.mul(base, M.trans(p[0], p[1], p[2]));
      if (w.w.front) m = M.mul(m, M.rotY(k.vis.steer * 0.9));
      m = M.mul(m, M.rotX(k.wheelSpin));
      R.draw(w.mesh, m, o);
    }
    // driver
    const sc = d.charScale, cm = Assets.char(CHARS[k.char].id, d.pose || d.kind);
    let dm = M.mul(base, M.trans(d.seat[0], d.seat[1] + (k.hopY > 0 ? 0 : Math.sin(this.t * 14 + k.id) * 0.01), d.seat[2]));
    dm = M.mul(dm, M.rotZ((d.kind === 'car' ? -k.vis.roll * 0.7 : k.vis.roll * 0.25) - k.steerS * 0.06)); dm = M.mul(dm, M.rotX(-0.04 * clamp(k.speed / 40, 0, 1)));
    if (d.faceYaw) dm = M.mul(dm, M.rotY(d.faceYaw));
    dm = M.mul(dm, M.scale(sc, sc, sc));
    R.draw(cm, dm, o);
    if (v.glass) glass.push({ mesh: v.glass, m: base });
  }
}
