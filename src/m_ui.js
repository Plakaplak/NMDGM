'use strict';
/* ===== UI, menus, HUD, input, main loop ===== */
(function () {
  const $ = id => document.getElementById(id);
  const S = { state: 'splash', race: null, bg: null, mode: 'gp', sel: { char: 0, veh: 1, track: 0, cup: 0 }, step: 'char', gp: null, roster: null, paused: false, wrongT: 0, lastMsg: null, hudBuilt: false };
  const STEP = 1 / 60;
  let showT = 0;

  /* ---------- helpers ---------- */
  function fmtTime(t) {
    if (!t || t < 0) t = 0;
    const m = Math.floor(t / 60), s = t - m * 60;
    return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2);
  }
  function bestKey(id) { return 'nnr_best_' + id; }
  function getBest(id) { try { return parseFloat(localStorage.getItem(bestKey(id))) || 0; } catch (e) { return 0; } }
  function setBest(id, t) { try { localStorage.setItem(bestKey(id), String(t)); } catch (e) { } }
  const SCREENS = ['s-splash', 's-title', 's-select', 's-help', 'hud', 's-pause', 's-results'];
  function show(...ids) { SCREENS.forEach(s => $(s).classList.toggle('show', ids.includes(s))); const fb = $('btn-fs'); if (fb) fb.classList.toggle('show', fsOK && (ids.includes('s-title') || ids.includes('s-select') || ids.includes('s-help'))); }
  function addShow(id) { $(id).classList.add('show'); }
  function hide(id) { $(id).classList.remove('show'); }

  /* ---------- portraits (2D cartoon avatars) ---------- */
  const OLD_CHARS = ['peci', 'bendera', 'putih', 'eyang'];
  function drawPortrait(cv, id, size) {
    const s = size || 150; cv.width = cv.height = s;
    const g = cv.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 0, s); bg.addColorStop(0, '#4a3aa8'); bg.addColorStop(1, '#1b1450');
    g.fillStyle = bg; g.fillRect(0, 0, s, s);
    g.save(); g.scale(s / 120, s / 120);
    if (!OLD_CHARS.includes(id)) { drawPortraitNew(g, id); g.restore(); return; }
    const D = { peci: ['#b5835a', '#14141a'], bendera: ['#cb9a6e', '#171c34'], putih: ['#b07c55', '#f4f4f4'], eyang: ['#9a6a46', '#2b1d17'] }[id];
    const skin = D[0], suit = D[1];
    // hair behind (eyang)
    if (id === 'eyang') { g.fillStyle = '#d9d9d9'; g.beginPath(); g.moveTo(26, 40); g.lineTo(26, 118); g.lineTo(94, 118); g.lineTo(94, 40); g.closePath(); g.fill(); }
    // body
    g.fillStyle = suit; g.beginPath(); g.moveTo(4, 124); g.quadraticCurveTo(10, 90, 60, 88); g.quadraticCurveTo(110, 90, 116, 124); g.closePath(); g.fill();
    if (id === 'peci' || id === 'bendera') {
      g.fillStyle = '#f4f4f4'; g.beginPath(); g.moveTo(48, 90); g.lineTo(60, 112); g.lineTo(72, 90); g.closePath(); g.fill();
      g.fillStyle = '#c4161c'; g.beginPath(); g.moveTo(57, 98); g.lineTo(63, 98); g.lineTo(65, 122); g.lineTo(60, 126); g.lineTo(55, 122); g.closePath(); g.fill();
    }
    if (id === 'bendera') { g.fillStyle = '#d4121a'; g.fillRect(24, 90, 72, 8); g.fillStyle = '#fff'; g.fillRect(24, 98, 72, 5); }
    if (id === 'putih') { g.fillStyle = '#e2e2e2'; g.fillRect(48, 88, 24, 5); g.fillStyle = '#d4121a'; g.fillRect(80, 104, 8, 5); g.fillStyle = '#fff'; g.fillRect(80, 109, 8, 5); }
    if (id === 'eyang') { g.fillStyle = '#cbb99a'; g.beginPath(); g.moveTo(48, 90); g.lineTo(60, 114); g.lineTo(72, 90); g.closePath(); g.fill(); g.fillStyle = '#7b3f14'; for (let i = -2; i <= 2; i++) { g.beginPath(); g.arc(60 + i * 6, 96 + Math.abs(i) * 3, 2.6, 0, TAU); g.fill(); } }
    // neck + head
    g.fillStyle = skin; g.fillRect(52, 80, 16, 14);
    const hw = id === 'bendera' ? 25 : id === 'peci' ? 30 : 28;
    g.beginPath(); g.ellipse(60, 56, hw, id === 'bendera' ? 31 : 29, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(60 - hw, 58, 5, 8, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(60 + hw, 58, 5, 8, 0, 0, TAU); g.fill();
    // hats / hair
    if (id === 'peci' || id === 'bendera') {
      const hh = id === 'bendera' ? 26 : 22;
      g.fillStyle = '#0d0d10'; roundRect(g, 60 - 25, 24 - (hh - 22), 50, hh, 6); g.fill();
      g.fillStyle = '#2a2a30'; g.fillRect(60 - 25, 24 - (hh - 22), 50, 3);
      if (id === 'peci') { g.fillStyle = '#bdbdbd'; g.fillRect(28, 44, 5, 10); g.fillRect(87, 44, 5, 10); }
    }
    if (id === 'putih') { g.fillStyle = '#111'; g.beginPath(); g.ellipse(60, 36, 29, 15, 0, Math.PI, 0); g.fill(); g.fillRect(31, 36, 5, 14); g.fillRect(84, 36, 5, 14); }
    if (id === 'eyang') {
      g.fillStyle = '#e0e0e0'; g.beginPath(); g.ellipse(60, 36, 31, 17, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#7b3f14'; g.fillRect(29, 33, 62, 9); g.fillStyle = '#d9a441'; g.fillRect(29, 33, 62, 2);
      g.fillStyle = '#e8e8e8'; g.beginPath(); g.moveTo(40, 72); g.quadraticCurveTo(60, 112, 80, 72); g.quadraticCurveTo(60, 80, 40, 72); g.fill();
      g.fillRect(48, 66, 24, 4);
    }
    // face
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(48, 56, 6, 7, 0, 0, TAU); g.ellipse(72, 56, 6, 7, 0, 0, TAU); g.fill();
    g.fillStyle = '#1a1010'; g.beginPath(); g.arc(49, 57, 3.4, 0, TAU); g.arc(73, 57, 3.4, 0, TAU); g.fill();
    g.strokeStyle = '#241610'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(41, 46); g.lineTo(55, 45); g.moveTo(65, 45); g.lineTo(79, 46); g.stroke();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(60, 64, 4, 3, 0, 0, TAU); g.fill();
    g.strokeStyle = '#5a1d16'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(51, 73); g.quadraticCurveTo(60, 80, 69, 73); g.stroke();
    g.restore();
  }


  /* shared pieces for the newer cast */
  function pBody(g, col) { g.fillStyle = col; g.beginPath(); g.moveTo(4, 124); g.quadraticCurveTo(10, 90, 60, 88); g.quadraticCurveTo(110, 90, 116, 124); g.closePath(); g.fill(); }
  function pHead(g, skin, rx, ry) {
    g.fillStyle = skin; g.fillRect(52, 80, 16, 14);
    g.beginPath(); g.ellipse(60, 56, rx || 28, ry || 29, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(60 - (rx || 28), 58, 5, 8, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(60 + (rx || 28), 58, 5, 8, 0, 0, TAU); g.fill();
  }
  function pFace(g, o) {
    o = o || {};
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(48, 56, 6, 7, 0, 0, TAU); g.ellipse(72, 56, 6, 7, 0, 0, TAU); g.fill();
    g.fillStyle = '#1a1010'; g.beginPath(); g.arc(49, 57, 3.4, 0, TAU); g.arc(73, 57, 3.4, 0, TAU); g.fill();
    g.strokeStyle = o.brow || '#241610'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(41, 46); g.lineTo(55, 45); g.moveTo(65, 45); g.lineTo(79, 46); g.stroke();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(60, 64, 4, 3, 0, 0, TAU); g.fill();
    if (!o.noMouth) { g.strokeStyle = o.lip || '#5a1d16'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(51, 73); g.quadraticCurveTo(60, 80, 69, 73); g.stroke(); }
  }
  function drawPortraitNew(g, id) {
    switch (id) {
      case 'mhs': {
        const hij = '#f3ecd9', sh = '#d9cfb6';
        pBody(g, '#f2c230'); g.fillStyle = '#f6f6f6'; g.beginPath(); g.moveTo(48, 90); g.lineTo(60, 112); g.lineTo(72, 90); g.closePath(); g.fill();
        g.fillStyle = '#3b2a10'; g.fillRect(24, 91, 22, 4); g.fillRect(74, 91, 22, 4); g.beginPath(); g.arc(88, 108, 4, 0, TAU); g.fill();
        g.fillStyle = hij; g.beginPath(); g.ellipse(60, 56, 36, 38, 0, 0, TAU); g.fill();
        g.beginPath(); g.moveTo(24, 70); g.quadraticCurveTo(14, 88, 18, 108); g.quadraticCurveTo(60, 120, 102, 108); g.quadraticCurveTo(106, 88, 96, 70); g.closePath(); g.fill();
        g.fillStyle = sh; g.beginPath(); g.moveTo(40, 96); g.quadraticCurveTo(60, 108, 80, 96); g.lineTo(80, 100); g.quadraticCurveTo(60, 114, 40, 100); g.fill();
        g.fillStyle = '#c99468'; g.beginPath(); g.ellipse(60, 58, 24, 27, 0, 0, TAU); g.fill();
        g.fillStyle = hij; g.beginPath(); g.ellipse(60, 38, 25, 10, 0, Math.PI, 0); g.fill();
        g.fillStyle = '#ffd24a'; g.beginPath(); g.arc(88, 82, 3, 0, TAU); g.fill();
        pFace(g); break;
      }
      case 'skripsi': {
        pBody(g, '#3a62d8'); g.fillStyle = '#2f50b0'; g.beginPath(); g.ellipse(60, 92, 30, 9, 0, 0, TAU); g.fill();
        g.fillStyle = '#fff'; g.fillRect(52, 98, 2.4, 14); g.fillRect(66, 98, 2.4, 14);
        pHead(g, '#d9a47a'); g.fillStyle = '#1a1410'; g.beginPath(); g.ellipse(60, 36, 30, 17, 0, Math.PI, 0); g.fill();
        for (const [x, y] of [[42, 24], [58, 18], [76, 22]]) { g.beginPath(); g.arc(x, y, 8, 0, TAU); g.fill(); }
        pFace(g);
        g.strokeStyle = '#181820'; g.lineWidth = 2.6; g.beginPath(); g.arc(48, 56, 10, 0, TAU); g.moveTo(82, 56); g.arc(72, 56, 10, 0, TAU); g.moveTo(58, 55); g.lineTo(62, 55); g.stroke();
        g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(48, 56, 9, 0, TAU); g.arc(72, 56, 9, 0, TAU); g.fill();
        break;
      }
      case 'dokter': {
        pBody(g, '#f6f6f6'); g.fillStyle = '#2fb7a9'; g.beginPath(); g.moveTo(48, 90); g.lineTo(60, 114); g.lineTo(72, 90); g.closePath(); g.fill();
        g.strokeStyle = '#222226'; g.lineWidth = 3; g.beginPath(); g.moveTo(40, 92); g.quadraticCurveTo(42, 118, 60, 118); g.quadraticCurveTo(78, 118, 80, 92); g.stroke();
        g.fillStyle = '#c9ced6'; g.beginPath(); g.arc(60, 119, 4.4, 0, TAU); g.fill();
        pHead(g, '#c08a62'); g.fillStyle = '#3fc7d4'; g.beginPath(); g.ellipse(60, 38, 31, 19, 0, Math.PI, 0); g.fill(); g.fillRect(29, 36, 62, 6);
        g.beginPath(); g.arc(88, 44, 6, 0, TAU); g.fill();
        pFace(g, { noMouth: true });
        g.fillStyle = '#9fe0ec'; g.beginPath(); g.moveTo(34, 62); g.quadraticCurveTo(60, 58, 86, 62); g.lineTo(76, 84); g.quadraticCurveTo(60, 90, 44, 84); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(40,120,140,.45)'; g.lineWidth = 1.4; for (const y of [68, 74, 80]) { g.beginPath(); g.moveTo(40, y); g.lineTo(80, y); g.stroke(); }
        break;
      }
      case 'batik': {
        g.fillStyle = '#15110f'; g.beginPath(); g.moveTo(24, 40); g.lineTo(22, 112); g.lineTo(98, 112); g.lineTo(96, 40); g.closePath(); g.fill();
        pBody(g, '#7a4219'); g.fillStyle = '#e9c46a';
        for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) { if ((r + c) & 1) continue; const x = 22 + c * 12, y = 100 + r * 9; g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillRect(-2.5, -2.5, 5, 5); g.restore(); }
        g.fillStyle = '#e9c46a'; g.beginPath(); g.moveTo(48, 90); g.lineTo(60, 106); g.lineTo(72, 90); g.closePath(); g.fill();
        pHead(g, '#d3a070', 26, 29);
        g.fillStyle = '#15110f'; g.beginPath(); g.ellipse(60, 38, 29, 16, 0, Math.PI, 0); g.fill(); g.fillRect(31, 36, 6, 28); g.fillRect(83, 36, 6, 28);
        g.beginPath(); g.arc(60, 16, 12, 0, TAU); g.fill();
        g.fillStyle = '#d4121a'; g.beginPath(); g.arc(78, 20, 6, 0, TAU); g.fill(); g.fillStyle = '#ffd24a'; g.beginPath(); g.arc(78, 20, 2.4, 0, TAU); g.fill();
        g.fillStyle = '#ffd24a'; g.beginPath(); g.arc(31, 70, 3, 0, TAU); g.arc(89, 70, 3, 0, TAU); g.fill();
        pFace(g, { lip: '#a02a30' }); break;
      }
      case 'betawi': {
        pBody(g, '#f2f2f2');
        g.save(); g.beginPath(); g.moveTo(20, 96); g.lineTo(34, 90); g.lineTo(112, 124); g.lineTo(92, 124); g.closePath(); g.clip();
        g.fillStyle = '#b01a1a'; g.fillRect(0, 80, 130, 60); g.fillStyle = '#1a1a1a';
        for (let i = -20; i < 130; i += 10) for (let j = 80; j < 130; j += 10) if (((i + j) / 10) % 2 === 0) g.fillRect(i, j, 5, 5);
        g.restore();
        pHead(g, '#a8714a');
        g.fillStyle = '#c0151b'; g.beginPath(); g.ellipse(60, 36, 30, 16, 0, Math.PI, 0); g.fill(); g.fillRect(30, 32, 60, 9);
        g.beginPath(); g.arc(90, 38, 7, 0, TAU); g.fill(); g.fillStyle = '#fff'; for (const x of [40, 52, 64, 76]) { g.beginPath(); g.arc(x, 36, 1.8, 0, TAU); g.fill(); }
        pFace(g); g.fillStyle = '#16100c'; g.beginPath(); g.moveTo(46, 70); g.quadraticCurveTo(60, 66, 74, 70); g.quadraticCurveTo(60, 75, 46, 70); g.fill();
        break;
      }
      case 'pendaki': {
        pBody(g, '#f26a1a'); g.fillStyle = '#2d3038'; g.fillRect(34, 92, 6, 30); g.fillRect(80, 92, 6, 30);
        g.fillStyle = '#d8dde4'; g.fillRect(8, 110, 104, 4);
        g.fillStyle = '#ffd24a'; g.beginPath(); g.ellipse(60, 90, 22, 8, 0, 0, TAU); g.fill();
        pHead(g, '#b87a52');
        g.fillStyle = '#ff7a1a'; g.beginPath(); g.ellipse(60, 38, 31, 20, 0, Math.PI, 0); g.fill();
        g.fillStyle = '#e05a10'; g.fillRect(29, 34, 62, 9);
        g.fillStyle = '#ffe14a'; g.beginPath(); g.arc(60, 15, 7, 0, TAU); g.fill();
        g.fillStyle = '#22252c'; g.fillRect(29, 28, 62, 7); g.fillStyle = '#7fd8f0'; roundRect(g, 36, 25, 20, 12, 4); g.fill(); roundRect(g, 64, 25, 20, 12, 4); g.fill();
        pFace(g); break;
      }
      case 'chef': {
        pBody(g, '#f8f8f8'); g.fillStyle = '#d4121a'; g.beginPath(); g.moveTo(48, 90); g.lineTo(72, 90); g.lineTo(60, 106); g.closePath(); g.fill();
        g.fillStyle = '#2a2a2a'; for (const x of [50, 70]) for (const y of [108, 117]) { g.beginPath(); g.arc(x, y, 2.2, 0, TAU); g.fill(); }
        pHead(g, '#c9906a', 30, 29);
        g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1.5;
        g.fillRect(36, 20, 48, 16); for (const [x, y, r] of [[38, 18, 13], [60, 10, 15], [82, 18, 13]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.stroke(); }
        g.fillStyle = '#fff'; g.fillRect(36, 20, 48, 16);
        g.fillStyle = '#e8e8e8'; g.fillRect(34, 32, 52, 5);
        pFace(g, { noMouth: true });
        g.fillStyle = '#2a1a10'; g.beginPath(); g.moveTo(60, 68); g.quadraticCurveTo(46, 64, 38, 72); g.quadraticCurveTo(48, 72, 60, 74); g.quadraticCurveTo(72, 72, 82, 72); g.quadraticCurveTo(74, 64, 60, 68); g.fill();
        g.strokeStyle = '#5a1d16'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(53, 80); g.quadraticCurveTo(60, 85, 67, 80); g.stroke();
        break;
      }
      case 'numibot': {
        g.fillStyle = '#1c473a'; g.beginPath(); g.moveTo(10, 124); g.quadraticCurveTo(16, 92, 60, 90); g.quadraticCurveTo(104, 92, 110, 124); g.closePath(); g.fill();
        g.fillStyle = '#e9b84a'; g.beginPath(); g.arc(60, 112, 8, 0, TAU); g.fill();
        for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.save(); g.translate(60 + Math.cos(a) * 10, 112 + Math.sin(a) * 10); g.rotate(a); g.fillRect(-2.5, -2.5, 5, 5); g.restore(); }
        g.fillStyle = '#7a8590'; g.fillRect(53, 80, 14, 14);
        g.strokeStyle = '#7a8590'; g.lineWidth = 3; g.beginPath(); g.moveTo(60, 28); g.lineTo(60, 10); g.stroke();
        g.fillStyle = '#e9b84a'; g.beginPath(); g.arc(60, 8, 6, 0, TAU); g.fill();
        for (const x of [24, 96]) { g.fillStyle = '#e9b84a'; roundRect(g, x - 5, 44, 10, 26, 5); g.fill(); }
        const gr = g.createLinearGradient(0, 28, 0, 86); gr.addColorStop(0, '#f2f6f9'); gr.addColorStop(1, '#b9c2cb');
        g.fillStyle = gr; roundRect(g, 29, 28, 62, 58, 14); g.fill();
        g.fillStyle = '#0e1c26'; roundRect(g, 36, 40, 48, 32, 10); g.fill();
        g.fillStyle = '#46e8ff'; g.shadowColor = '#46e8ff'; g.shadowBlur = 8;
        roundRect(g, 44, 49, 11, 12, 3); g.fill(); roundRect(g, 65, 49, 11, 12, 3); g.fill();
        g.strokeStyle = '#46e8ff'; g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(51, 66); g.quadraticCurveTo(60, 71, 69, 66); g.stroke(); g.shadowBlur = 0;
        break;
      }
    }
  }

  /* ---------- showroom ---------- */
  const Showroom = {
    ready: false,
    init() {
      const b = new MB();
      b.cyl(0x2a2f55, 5.6, 5.8, 0.6, 28, [0, -0.3, 0]);
      b.cyl(0xff4fd8, 5.9, 5.9, 0.06, 28, [0, -0.02, 0]);
      b.cyl(0x3b4280, 5.2, 5.2, 0.05, 28, [0, 0.03, 0]);
      b.cyl(0x46e8ff, 3.2, 3.2, 0.03, 28, [0, 0.06, 0], null, false);
      b.cyl(0x1a1b3a, 70, 70, 0.1, 40, [0, -0.7, 0]);
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; b.cyl(0x46e8ff, 0.12, 0.12, 5, 6, [Math.cos(a) * 9, 2.4, Math.sin(a) * 9]); b.sph(0xff4fd8, 0.4, [Math.cos(a) * 9, 5.2, Math.sin(a) * 9], null, 6, 4); }
      this.mesh = Renderer.mesh(b.data(), { unlit: false });
      this.ready = true;
    },
    draw(t, ch, veh, closeUp) {
      if (!this.ready) this.init();
      const env = ENVS.showroom; if (this.skyEnv !== env) { Renderer.setSky(env); this.skyEnv = env; }
      const V = VEHICLES[veh], def = Assets.vehicle(V.id).def;
      const dist = closeUp ? 4.9 : 4.4 + def.len * 1.45;
      const lift = Showroom.noUi ? 0 : 1;
      const cam = { eye: [0, closeUp ? 2.6 : 3.4, dist], target: [0, closeUp ? 1.35 - 1.3 * lift : 1.2 - 2.4 * lift, 0], fov: closeUp ? 42 : 46 };
      Renderer.begin(cam, env);
      Renderer.draw(this.mesh, null);
      const k = { id: 0, char: ch, vid: V.id, vis: { steer: Math.sin(t * 1.3) * 0.5, roll: 0, pitch: 0, spin: 0 }, drift: { on: false }, steerS: Math.sin(t * 1.3), hopY: 0, wheelSpin: t * 3, speed: 0, invuln: 0, spinT: 0, x: 0, y: 0.05, z: 0, heading: t * 0.55 + 0.6 };
      const fake = { t, kartMatrix: Race.prototype.kartMatrix };
      const glass = [];
      Race.prototype.drawKart.call(fake, k, glass);
      for (const g of glass) Renderer.draw(g.mesh, g.m, { alpha: 0.32 });
    },
  };

  /* ---------- input ---------- */
  const keys = {}, edge = {};
  const touch = { steer: 0, since: 0, drift: false, item: false, nos: false, brake: false, active: false };
  let gpState = { steer: 0, thr: 0, brk: 0, hop: false, item: false, nos: false };
  addEventListener('keydown', e => {
    if (e.repeat) { if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); return; }
    keys[e.code] = true; edge[e.code] = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
    onKey(e);
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
  function pollGamepad() {
    const g = (navigator.getGamepads && navigator.getGamepads() || [])[0];
    gpState = { steer: 0, thr: 0, brk: 0, hop: false, item: false, nos: false };
    if (!g) return;
    const ax = g.axes[0] || 0; gpState.steer = Math.abs(ax) > 0.15 ? -ax : 0;
    const b = i => g.buttons[i] && g.buttons[i].pressed;
    gpState.thr = (b(0) || b(7)) ? 1 : 0; gpState.brk = (b(1) || b(6)) ? 1 : 0;
    gpState.hop = b(5) || b(4); gpState.item = b(3); gpState.nos = b(2);
    if (g.axes[1] > 0.6) gpState.brk = 1;
  }
  function readInput() {
    const k = keys;
    pollGamepad();
    let steer = (k.ArrowLeft || k.KeyA ? 1 : 0) - (k.ArrowRight || k.KeyD ? 1 : 0);
    if (!steer && touch.steer) { const hold = (performance.now() - touch.since) / 1000; steer = touch.steer * clamp(0.5 + hold * 2.4, 0.5, 1); }
    if (!steer) steer = gpState.steer;
    let thr = (k.ArrowUp || k.KeyW || touch.active || gpState.thr) ? 1 : 0;
    const brk = (k.ArrowDown || k.KeyS || touch.brake || gpState.brk) ? 1 : 0;
    if (brk) thr = 0;
    const hop = !!(k.ShiftLeft || k.ShiftRight || k.Space || k.KeyJ || touch.drift || gpState.hop);
    const item = !!(k.KeyE || k.ControlLeft || k.ControlRight || k.KeyK || k.KeyX || touch.item || gpState.item);
    const nos = !!(k.KeyN || k.KeyQ || k.KeyF || touch.nos || gpState.nos);
    const reset = !!edge.KeyR; edge.KeyR = false;
    return { steer, thr, brk, hop, item, nos, reset };
  }
  // touch buttons + analog steering pad
  function bindTouch(id, key) {
    const el = $(id); let pid = null;
    const on = e => { e.preventDefault(); pid = e.pointerId; touch[key] = true; touch.active = true; el.classList.add('on'); try { el.setPointerCapture(e.pointerId); } catch (_) { } if (navigator.vibrate && key !== 'brake') { try { navigator.vibrate(8); } catch (_) { } } };
    const off = e => { if (pid !== null && e.pointerId !== pid) return; pid = null; touch[key] = false; el.classList.remove('on'); };
    el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off);
  }
  bindTouch('t-drift', 'drift'); bindTouch('t-item', 'item'); bindTouch('t-brake', 'brake'); bindTouch('t-nos', 'nos');
  (function () {   // steering: two chevrons; slide the finger between them without lifting
    const box = $('t-steer'), L = $('t-l'), R = $('t-r'); let pid = null;
    const side = e => {
      const r = box.getBoundingClientRect(), sd = (e.clientX - r.left) < r.width / 2 ? 1 : -1;
      if (touch.steer !== sd) { touch.steer = sd; touch.since = performance.now(); }
      L.classList.toggle('on', sd > 0); R.classList.toggle('on', sd < 0);
    };
    const end = e => { if (pid !== null && e.pointerId !== pid) return; pid = null; touch.steer = 0; L.classList.remove('on'); R.classList.remove('on'); };
    box.addEventListener('pointerdown', e => { e.preventDefault(); pid = e.pointerId; touch.active = true; try { box.setPointerCapture(e.pointerId); } catch (_) { } side(e); if (navigator.vibrate) { try { navigator.vibrate(6); } catch (_) { } } });
    box.addEventListener('pointermove', e => { if (e.pointerId === pid) side(e); });
    box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end); box.addEventListener('lostpointercapture', end);
  })();
  let isTouch = false;
  const touchDevice = (navigator.maxTouchPoints > 0) && !!(window.matchMedia && matchMedia('(pointer:coarse)').matches);
  function enableTouchMode() {
    if (isTouch) return; isTouch = true; touch.active = true; document.body.classList.add('touchmode');
    if (S.state === 'race') $('touch').classList.add('show');
  }
  if (touchDevice) enableTouchMode();
  addEventListener('touchstart', () => { enableTouchMode(); }, { passive: true });
  // block browser gestures (pinch zoom, pull to refresh, context menu)
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('touchmove', e => { if (!e.target.closest || !e.target.closest('.cards,.help-box,#s-results .dlg')) e.preventDefault(); }, { passive: false });

  /* ---------- fullscreen + orientation ---------- */
  const fsEl = document.documentElement, fsReq = fsEl.requestFullscreen || fsEl.webkitRequestFullscreen;
  const fsOK = !!fsReq && (document.fullscreenEnabled !== false);
  const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  function lockLandscape() { try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } }
  function goFullscreen() {
    if (!fsOK || isFs()) return;
    try { const p = fsReq.call(fsEl, { navigationUI: 'hide' }); if (p && p.then) p.then(lockLandscape).catch(() => { }); else lockLandscape(); } catch (e) { }
  }
  function toggleFs() { if (isFs()) { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { } } else goFullscreen(); }
  $('btn-fs').onclick = () => { Sfx.init(); toggleFs(); };
  $('p-fs').onclick = () => { toggleFs(); };
  if (!fsOK) $('p-fs').style.display = 'none';
  let rotDismissed = false;
  function checkRotate() {
    const portrait = window.innerHeight > window.innerWidth * 1.05;
    $('rotate').classList.toggle('show', touchDevice && portrait && !rotDismissed);
  }
  $('rot-stay').onclick = () => { rotDismissed = true; checkRotate(); };
  $('rot-fs').onclick = () => { goFullscreen(); setTimeout(() => { rotDismissed = !fsOK ? true : rotDismissed; checkRotate(); }, 600); if (!fsOK) { rotDismissed = true; checkRotate(); } };
  if (!fsOK) $('rot-fs').style.display = 'none';
  addEventListener('resize', checkRotate); addEventListener('orientationchange', () => setTimeout(checkRotate, 250));
  document.addEventListener('fullscreenchange', () => { checkRotate(); });
  checkRotate();

  /* ---------- screens ---------- */
  const menuItems = Array.from(document.querySelectorAll('#menu li'));
  let menuSel = 0;
  function setMenuSel(i) { menuSel = (i + menuItems.length) % menuItems.length; menuItems.forEach((li, j) => li.classList.toggle('sel', j === menuSel)); }
  menuItems.forEach((li, i) => { li.addEventListener('mouseenter', () => { setMenuSel(i); }); li.addEventListener('click', () => { Sfx.init(); setMenuSel(i); activateMenu(); }); });

  function toTitle() {
    S.state = 'title'; document.body.classList.remove('inrace', 'results'); show('s-title'); $('btn-pause').style.display = 'none'; $('touch').classList.remove('show');
    S.race = null; S.gp = null;
    ensureBg(); setMenuSel(menuSel); Sfx.musicStart('title'); Sfx.engine(0, false, false); Sfx.skid(0);
    $('fx-speed').classList.remove('on');
  }
  function ensureBg() {
    if (!S.bg) {
      const ents = []; const pat = [0, 1, 2, 3, 4, 5, 6, 7];
      for (let i = 0; i < 8; i++) ents.push({ char: (i * 5 + 2) % CHARS.length, veh: pat[i] });
      S.bg = new Race(0, ents, { laps: 99, attract: true });
      S.bg.cdDur = 1.2;
    }
  }
  function activateMenu() {
    Sfx.play('ok');
    const act = menuItems[menuSel].dataset.act;
    if (act === 'help') { S.state = 'help'; show('s-help'); return; }
    S.mode = act; S.step = 'char'; S.bg = null; S.state = 'select'; showT = 0;
    renderSelect(); show('s-select');
  }
  $('help-back').onclick = () => { Sfx.play('back'); toTitle(); };

  const CUPS = [
    { name: 'Piala Nusantara', sub: 'Sawah, pantai, dan puncak gunung', tracks: [0, 2, 3], icon: '🌴' },
    { name: 'Piala Jabodetabek', sub: 'Jakarta, Depok, dan kampus UI', tracks: [1, 4, 5], icon: '🏙️' },
  ];
  function stepsFor() { return S.mode === 'gp' ? ['char', 'veh', 'cup'] : ['char', 'veh', 'track']; }
  const STEP_LABEL = { char: '1. Karakter', veh: '2. Kendaraan', track: '3. Lintasan', cup: '3. Piala' };
  function statRow(label, v) { return `<span>${label}</span><div class="bar"><i style="width:${v * 10}%"></i></div>`; }
  function combinedStats() {
    const V = VEHICLES[S.sel.veh], C = CHARS[S.sel.char], cl = v => clamp(v, 1, 10);
    return { speed: cl(V.speed + (C.speed || 0)), accel: cl(V.accel + (C.accel || 0)), handling: cl(V.handling + (C.handling || 0)), weight: V.weight };
  }
  function renderSelect() {
    const steps = stepsFor();
    $('sel-steps').innerHTML = steps.map(s => `<span class="${s === S.step ? 'on' : ''}">${STEP_LABEL[s]}</span>`).join('');
    const box = $('sel-cards'); box.innerHTML = '';
    const info = $('sel-info');
    const isLast = steps[steps.length - 1] === S.step;
    $('sel-next').textContent = isLast ? (S.mode === 'gp' ? 'Mulai Grand Prix ▶' : 'Mulai Balapan ▶') : 'Lanjut ▶';
    if (S.step === 'char') {
      $('sel-title').textContent = 'Pilih Karakter';
      CHARS.forEach((c, i) => {
        const el = document.createElement('div'); el.className = 'card' + (i === S.sel.char ? ' sel' : '');
        const cv = document.createElement('canvas'); drawPortrait(cv, c.id, 150);
        el.appendChild(cv); el.insertAdjacentHTML('beforeend', `<b>${c.name}</b><span>${c.title}</span>`);
        el.onclick = () => { if (S.sel.char === i) { nextStep(); } else { S.sel.char = i; Sfx.play('ui'); renderSelect(); } };
        box.appendChild(el);
      });
      const c = CHARS[S.sel.char], st = combinedStats();
      info.innerHTML = `<div><div class="i-name">${c.name}</div><div class="i-sub">${c.title}</div><div class="i-desc">${c.perk}</div></div>
        <div class="stats">${statRow('Kecepatan', clamp(5 + (c.speed || 0), 1, 10))}${statRow('Akselerasi', clamp(5 + (c.accel || 0), 1, 10))}${statRow('Kelincahan', clamp(5 + (c.handling || 0), 1, 10))}</div>`;
    } else if (S.step === 'veh') {
      $('sel-title').textContent = 'Pilih Kendaraan';
      const icons = ['🚚', '🛻', '🛵', '🛵', '🛴', '🛺', '🛹', '🚲'], cols = ['#4f7bff', '#e8262e', '#18c04a', '#ff7a1a', '#2b2d3a', '#ff6a1a', '#9a5cf0', '#e8d4a0'];
      VEHICLES.forEach((v, i) => {
        const el = document.createElement('div'); el.className = 'card' + (i === S.sel.veh ? ' sel' : '');
        el.innerHTML = `<div style="width:100%;max-width:150px;aspect-ratio:1;border-radius:12px;background:linear-gradient(135deg,${cols[i]},#16113d);display:flex;align-items:center;justify-content:center;font-size:clamp(40px,9vh,76px)">${icons[i]}</div><b>${v.name}</b><span>Bobot ${v.weight}/10</span>`;
        el.onclick = () => { if (S.sel.veh === i) { nextStep(); } else { S.sel.veh = i; Sfx.play('ui'); renderSelect(); } };
        box.appendChild(el);
      });
      const v = VEHICLES[S.sel.veh], st = combinedStats();
      info.innerHTML = `<div><div class="i-name">${v.name}</div><div class="i-sub">dikendarai ${CHARS[S.sel.char].name}</div><div class="i-desc${v.perk ? ' hp' : ''}">${v.desc}</div>${v.perk ? `<div class="i-perk">★ ${v.perk}</div>` : ''}</div>
        <div class="stats">${statRow('Kecepatan', st.speed)}${statRow('Akselerasi', st.accel)}${statRow('Kelincahan', st.handling)}${statRow('Bobot', st.weight)}</div>`;
    } else if (S.step === 'cup') {
      $('sel-title').textContent = 'Pilih Piala';
      CUPS.forEach((c, i) => {
        const el = document.createElement('div'); el.className = 'card cup' + (i === S.sel.cup ? ' sel' : '');
        const row = document.createElement('div'); row.className = 'cup-th';
        c.tracks.forEach(ti => { const cv = document.createElement('canvas'); cv.width = cv.height = 96; drawMiniTrack(cv, TRACK_DEFS[ti], ti); row.appendChild(cv); });
        el.appendChild(row); el.insertAdjacentHTML('beforeend', `<b>${c.icon} ${c.name}</b><span>${c.tracks.map(t => TRACK_DEFS[t].name).join(' • ')}</span>`);
        el.onclick = () => { if (S.sel.cup === i) { nextStep(); } else { S.sel.cup = i; Sfx.play('ui'); renderSelect(); } };
        box.appendChild(el);
      });
      const c = CUPS[S.sel.cup];
      info.innerHTML = `<div><div class="i-name">${c.icon} ${c.name}</div><div class="i-sub">${c.sub}</div><div class="i-desc">${c.tracks.length} lintasan berturut-turut. Kumpulkan poin tiap balapan dan rebut piala!</div></div>`;
    } else {
      $('sel-title').textContent = 'Pilih Lintasan';
      TRACK_DEFS.forEach((t, i) => {
        const el = document.createElement('div'); el.className = 'card' + (i === S.sel.track ? ' sel' : '');
        const cv = document.createElement('canvas'); cv.width = cv.height = 150;
        drawMiniTrack(cv, t, i);
        el.appendChild(cv); el.insertAdjacentHTML('beforeend', `<b>${t.name}</b><span>${getBest(t.id) ? 'Terbaik ' + fmtTime(getBest(t.id)) : 'Belum ada rekor'}</span>`);
        el.onclick = () => { if (S.sel.track === i) { nextStep(); } else { S.sel.track = i; Sfx.play('ui'); renderSelect(); } };
        box.appendChild(el);
      });
      const t = TRACK_DEFS[S.sel.track];
      info.innerHTML = `<div><div class="i-name">${t.name}</div><div class="i-sub">${t.sub}</div><div class="i-desc">3 putaran. Lintasan ${S.mode === 'time' ? 'sendirian, tanpa item, kejar rekor waktu' : 'dengan 7 pembalap AI, kotak misteri, dan mangga'}.</div></div>`;
    }
    const sel = box.querySelector('.card.sel'); if (sel && sel.scrollIntoView) { try { sel.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) { } }
  }
  const miniCache = {};
  function drawMiniTrack(cv, def, idx) {
    const g = cv.getContext('2d'), s = cv.width;
    const bg = g.createLinearGradient(0, 0, s, s); bg.addColorStop(0, { kota: '#2a1a5a', pantai: '#e49a58', gunung: '#9fb8d0', depok: '#f0b070', ui: '#7fd0f0' }[def.theme] || '#6bbcf0'); bg.addColorStop(1, '#16113d');
    g.fillStyle = bg; g.fillRect(0, 0, s, s);
    const P = def.pts; let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    P.forEach(p => { mnx = Math.min(mnx, p[0]); mxx = Math.max(mxx, p[0]); mnz = Math.min(mnz, p[1]); mxz = Math.max(mxz, p[1]); });
    const pad = 18, sc = Math.min((s - pad * 2) / (mxx - mnx), (s - pad * 2) / (mxz - mnz));
    const ox = (s - (mxx - mnx) * sc) / 2 - mnx * sc, oz = (s - (mxz - mnz) * sc) / 2 - mnz * sc;
    const pts = [];
    for (let i = 0; i < P.length; i++) { const p0 = P[(i - 1 + P.length) % P.length], p1 = P[i], p2 = P[(i + 1) % P.length], p3 = P[(i + 2) % P.length]; for (let k = 0; k < 12; k++) pts.push(crPt(p0, p1, p2, p3, k / 12)); }
    g.lineJoin = 'round'; g.lineCap = 'round';
    for (const [w, c] of [[11, '#0d0b24'], [7, '#ffffff'], [4.5, '#3b3b48']]) {
      g.lineWidth = w; g.strokeStyle = c; g.beginPath();
      pts.forEach((p, i) => { const x = p[0] * sc + ox, y = p[1] * sc + oz; i ? g.lineTo(x, y) : g.moveTo(x, y); });
      g.closePath(); g.stroke();
    }
    g.fillStyle = '#ffc21a'; g.beginPath(); g.arc(pts[0][0] * sc + ox, pts[0][1] * sc + oz, 6, 0, TAU); g.fill();
  }
  function nextStep() {
    const steps = stepsFor(), i = steps.indexOf(S.step);
    Sfx.play('ok');
    if (i < steps.length - 1) { S.step = steps[i + 1]; renderSelect(); }
    else beginFromSelect();
  }
  function prevStep() {
    const steps = stepsFor(), i = steps.indexOf(S.step);
    Sfx.play('back');
    if (i > 0) { S.step = steps[i - 1]; renderSelect(); }
    else { S.state = 'title'; S.step = 'char'; toTitle(); }
  }
  $('sel-next').onclick = () => { Sfx.init(); nextStep(); };
  $('sel-back').onclick = () => { Sfx.init(); prevStep(); };

  /* ---------- race flow ---------- */
  function makeRoster() {
    const pl = { char: S.sel.char, veh: S.sel.veh, human: true };
    if (S.mode === 'time') return [pl];
    const NV = VEHICLES.length, list = [pl], vp = [1, 0, 3, 2, 5, 7, 4], off = Math.floor(Math.random() * NV);
    const pool = CHARS.map((c, i) => i).filter(i => i !== S.sel.char);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    for (let i = 0; i < 7; i++) list.push({ char: pool[i % pool.length], veh: (vp[i] + off) % NV });
    return list;
  }
  function beginFromSelect() {
    S.roster = makeRoster();
    if (S.mode === 'gp') { S.gp = { i: 0, cup: S.sel.cup, total: S.roster.map(() => 0) }; launch(CUPS[S.gp.cup].tracks[0]); }
    else launch(S.sel.track);
  }
  function launch(trackIdx) {
    S.bg = null; S.state = 'race'; S.paused = false;
    const race = new Race(trackIdx, S.roster, { laps: 3, mode: S.mode === 'time' ? 'time' : 'race' });
    S.race = race; S.lastMsg = null; S.wrongT = 0; S.resultsShown = false; S.itemKey = ''; S.nosKey = ''; S.shownMsg = ''; S.shownNote = '';
    buildHud(race); show('hud'); document.body.classList.remove('results'); document.body.classList.add('inrace');
    $('btn-pause').style.display = 'block'; if (isTouch) $('touch').classList.add('show');
    Sfx.musicStart(TRACK_DEFS[trackIdx].theme);
    S.acc = 0; Sfx.play('ui');
  }
  function fmtTime3(t) {
    if (!t || t < 0) t = 0;
    const m = Math.floor(t / 60), sec = t - m * 60;
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec.toFixed(3);
  }
  const segsEl = $('h-nos').querySelector('.segs'); for (let i = 0; i < 10; i++) segsEl.appendChild(document.createElement('i'));
  const segI = Array.from(segsEl.children);
  function buildHud(race) {
    $('h-lapfx').innerHTML = ''; $('h-best').textContent = ''; S.rivalTxt = ''; S.lapCount = -1; S.shownNote = '';
    const n = race.karts.length; $('h-pos').querySelector('.o').textContent = '/' + n;
    $('h-item').style.display = race.mode === 'time' ? 'none' : '';
    $('t-item').style.display = race.mode === 'time' ? 'none' : '';
    $('h-rivals').classList.toggle('on', race.mode !== 'time');
    const rec = getBest(TRACK_DEFS[race.trackIdx].id);
    S.recBest = rec;
  }
  const SUF = ['', 'st', 'nd', 'rd'];
  function updateHud(race) {
    const k = race.human; if (!k) return;
    const T = race.track, order = race.order;
    const rank = race.rankOf(k);
    const pn = $('h-pos'); pn.querySelector('.n').textContent = rank; pn.querySelector('.n').classList.toggle('first', rank === 1);
    const lap = clamp(k.lap, 1, race.laps);
    $('h-lap').textContent = `LAP ${lap}/${race.laps}`;
    $('h-time').textContent = fmtTime3(race.phase === 'countdown' ? 0 : race.clock);
    const bl = k.bestLap || S.recBest;
    $('h-best').textContent = bl ? (k.bestLap ? 'TERBAIK ' : 'REKOR ') + fmtTime(bl) : '';
    $('h-score').textContent = Math.round(k.score).toLocaleString('id-ID');
    if (k.lapTimes.length !== S.lapCount) { S.lapCount = k.lapTimes.length; $('h-lapfx').innerHTML = k.lapTimes.map((t, i) => `P${i + 1} ${fmtTime(t)}`).join('<br>'); }
    // progress
    const pr = clamp(k.prog / (T.N * (race.laps + 1)), 0, 1);
    $('h-progbar').style.width = (pr * 100).toFixed(1) + '%'; $('h-pct').textContent = Math.round(pr * 100) + '%';
    // rivals ahead / behind
    if (race.mode !== 'time') {
      const r = order.indexOf(k), rows = [];
      const row = (o, no, up) => { const d = Math.abs(o.prog - k.prog) * T.sp; return `<div><span class="no">No.${no}</span><span class="nm">${o.name}</span><span class="d ${up ? 'up' : 'dn'}">${Math.round(d)}m ${up ? '▲' : '▼'}</span></div>`; };
      if (r > 0) rows.push(row(order[r - 1], r, true));
      if (r < order.length - 1) rows.push(row(order[r + 1], r + 2, false));
      const html = rows.join('');
      if (html !== S.rivalTxt) { S.rivalTxt = html; $('h-rivals').innerHTML = html; }
    }
    // item (desktop slot + touch button)
    const hi = $('h-item'), ti = $('t-itemico'), tb = $('t-item');
    let ico = '', cls = '', cnt = '';
    if (k.itemRoll > 0) { const ks = Object.keys(ITEMS); ico = ITEMS[ks[Math.floor(performance.now() / 70) % ks.length]].icon; cls = 'roll'; }
    else if (k.item) { ico = ITEMS[k.item].icon; cls = 'has'; cnt = k.itemN > 1 ? `<span class="cnt">x${k.itemN}</span>` : ''; }
    else { ico = '<span style="opacity:.28">?</span>'; }
    const key = ico + cls + cnt;
    if (key !== S.itemKey) { S.itemKey = key; hi.innerHTML = ico + cnt; hi.className = cls; ti.innerHTML = ico; tb.classList.toggle('has', cls === 'has'); }
    // mango + NOS
    $('h-mcnt').textContent = k.mangga; $('h-mango').classList.toggle('full', k.mangga >= 10);
    const nf = Math.round(k.nos * 10 + 0.0001), nosKey = nf + '|' + (k.nosOn ? 1 : 0);
    if (nosKey !== S.nosKey) { S.nosKey = nosKey; segI.forEach((e, i) => e.classList.toggle('f', i < nf)); $('h-nos').classList.toggle('on', k.nosOn); const nb = $('t-nos'); nb.classList.toggle('ready', k.nos > 0.02); nb.classList.toggle('empty', k.nos <= 0.02); }
    $('h-v').textContent = Math.round(Math.abs(k.speed) * 3.6);
    const di = $('h-drift').firstElementChild;
    if (k.drift.on) { di.style.width = clamp(k.drift.t / 2.1, 0, 1) * 100 + '%'; di.style.background = ['#ffffff', '#ffe14a', '#ff8a1a', '#46b8ff'][k.drift.level]; }
    else di.style.width = k.boostT > 0 ? clamp(k.boostT / 1.6, 0, 1) * 100 + '%' : '0%', di.style.background = k.boostT > 0 ? '#46e8ff' : '#fff';
    $('fx-speed').classList.toggle('on', k.boostT > 0.05);
    // notes (small banner) + big message
    const nt = $('h-note');
    if (race.noteTxt && race.noteT > 0 && S.shownNote !== race.noteStamp) {
      S.shownNote = race.noteStamp; nt.className = ''; void nt.offsetWidth; nt.textContent = race.noteTxt; nt.className = 'on ' + (race.noteCls || '');
    }
    const m = $('h-msg');
    if (race.msg && race.msgT > 0 && S.shownMsg !== race.msg + '|' + race.msgStamp) {
      S.shownMsg = race.msg + '|' + race.msgStamp;
      m.className = ''; void m.offsetWidth; m.textContent = race.msg; m.className = 'on ' + (race.msgCls || '');
    }
    // wrong way
    const dh = Math.abs(angDiff(k.heading, k.tHd));
    if (dh > 2.2 && Math.abs(k.speed) > 4 && race.phase === 'racing') S.wrongT += 1 / 60; else S.wrongT = Math.max(0, S.wrongT - 0.05);
    $('h-wrong').style.display = S.wrongT > 0.8 ? 'block' : 'none';
    drawMini(race);
  }
  function drawMini(race) {
    const cv = $('h-mini'), g = cv.getContext('2d'), T = race.track, h = race.human, W = cv.width;
    g.clearRect(0, 0, W, W);
    g.save(); g.beginPath(); g.arc(W / 2, W / 2, W / 2 - 3, 0, TAU); g.clip();
    const zoom = W / 400;   // ≈ 200 m radius
    g.translate(W / 2, W * 0.58); g.rotate(h.heading - Math.PI); g.scale(zoom, zoom); g.translate(-h.x, -h.z);
    g.lineJoin = 'round'; g.lineCap = 'round';
    const pts = T.mini;
    for (const [w, col] of [[34, 'rgba(0,0,0,.5)'], [24, 'rgba(255,255,255,.9)'], [17, '#4a6dff']]) {
      g.lineWidth = w; g.strokeStyle = col; g.beginPath();
      for (let i = 0; i < pts.length; i++) { const p = pts[i]; i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
      g.closePath(); g.stroke();
    }
    g.fillStyle = '#ffc21a'; g.save(); g.translate(pts[0][0], pts[0][1]); g.rotate(0); g.fillRect(-16, -5, 32, 10); g.restore();
    for (const k of race.karts) {
      if (k === h) continue;
      g.fillStyle = '#fff'; g.beginPath(); g.arc(k.x, k.z, 17, 0, TAU); g.fill();
      g.fillStyle = CHARS[k.char].color; g.beginPath(); g.arc(k.x, k.z, 12, 0, TAU); g.fill();
    }
    g.restore();
    // player arrow (fixed, pointing up)
    g.save(); g.translate(W / 2, W * 0.58); g.fillStyle = '#fff'; g.strokeStyle = '#1d2a66'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, -17); g.lineTo(12, 14); g.lineTo(0, 7); g.lineTo(-12, 14); g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  // message stamping (so identical messages re-trigger)
  const _say = Race.prototype.say;
  Race.prototype.say = function (t, d, c) { this.msgStamp = (this.msgStamp || 0) + 1; _say.call(this, t, d, c); };

  function handleRaceEvents(race) {
    while (race.events.length) {
      const e = race.events.shift();
      if (e.type === 'results' && !S.resultsShown) { S.resultsShown = true; showResults(race); }
    }
  }
  function showResults(race) {
    const res = race.results, id = TRACK_DEFS[race.trackIdx].id;
    const me = res.find(r => r.human);
    document.body.classList.add('results'); $('hud').classList.remove('show'); addShow('s-results'); $('fx-speed').classList.remove('on');
    Sfx.engine(0, false, false); Sfx.skid(0);
    let html = '', sum = '';
    const isGP = S.mode === 'gp' && S.gp;
    if (isGP) res.forEach(r => { S.gp.total[r.kart.id] += r.points; });
    const best = me.best, tt = me.kart.finished ? me.kart.finishTime : 0;
    if (S.mode === 'time') {
      const prev = getBest(id); let newRec = false;
      if (me.kart.lapTimes.length) { const b = Math.min(...me.kart.lapTimes); if (!prev || b < prev) { setBest(id, b); newRec = true; } }
      $('r-title').textContent = 'Time Trial Selesai';
      sum = `Total <b>${fmtTime(tt)}</b>${newRec ? ' • 🏆 REKOR PUTARAN BARU!' : ''}`;
      html = '<table class="res"><tr><th></th><th>Putaran</th><th>Waktu</th></tr>' + me.kart.lapTimes.map((t, i) => `<tr class="${t === best ? 'me' : ''}"><td class="p">${i + 1}</td><td>Putaran ${i + 1}</td><td>${fmtTime(t)}</td></tr>`).join('') + '</table>';
    } else {
      const pb = getBest(id); if (me.kart.lapTimes.length) { const b = Math.min(...me.kart.lapTimes); if (!pb || b < pb) setBest(id, b); }
      $('r-title').textContent = isGP ? `Hasil Balapan ${S.gp.i + 1}/${CUPS[S.gp.cup].tracks.length} • ${TRACK_DEFS[race.trackIdx].name}` : 'Hasil Balapan • ' + TRACK_DEFS[race.trackIdx].name;
      sum = (me.place === 1 ? '🏆 Kamu juara 1! Luar biasa!' : `Kamu finis di posisi <b>${me.place}</b> dari ${res.length}.`) + `<br>Skor <b>${Math.round(me.score).toLocaleString('id-ID')}</b> • ${me.mango} mangga terkumpul`;
      html = '<table class="res"><tr><th></th><th>Pembalap</th><th>Kendaraan</th><th>Waktu</th><th>Skor</th>' + (isGP ? '<th>Poin</th><th>Total</th>' : '') + '</tr>' +
        res.map(r => `<tr class="${r.human ? 'me' : ''}"><td class="p">${r.place}</td><td><canvas data-c="${CHARS[r.kart.char].id}"></canvas>${r.kart.name}${r.human ? ' (Kamu)' : ''}</td><td>${VEHICLES[r.kart.veh].name}</td><td>${r.time ? fmtTime(r.time) : 'DNF'}</td><td>${Math.round(r.score || 0).toLocaleString('id-ID')}</td>` +
          (isGP ? `<td>+${r.points}</td><td><b>${S.gp.total[r.kart.id]}</b></td>` : '') + '</tr>').join('') + '</table>';
    }
    $('r-sum').innerHTML = sum; $('r-table').innerHTML = html;
    $('r-table').querySelectorAll('canvas[data-c]').forEach(c => drawPortrait(c, c.dataset.c, 56));
    const bt = $('r-btns'); bt.innerHTML = '';
    const mk = (txt, cls, fn) => { const b = document.createElement('button'); b.className = 'btn ' + cls; b.textContent = txt; b.onclick = () => { Sfx.play('ok'); fn(); }; bt.appendChild(b); return b; };
    if (isGP && S.gp.i < CUPS[S.gp.cup].tracks.length - 1) mk('Lintasan Berikutnya ▶', '', () => { hide('s-results'); S.gp.i++; launch(CUPS[S.gp.cup].tracks[S.gp.i]); });
    else if (isGP) mk('Lihat Klasemen Akhir ▶', '', () => showCup());
    else { mk('Ulangi', '', () => { hide('s-results'); launch(race.trackIdx); }); }
    mk('Menu Utama', 'alt', () => { hide('s-results'); toTitle(); });
    S.resPrimary = bt.firstElementChild;
  }
  function showCup() {
    const rows = S.roster.map((e, i) => ({ i, e, pts: S.gp.total[i] })).sort((a, b) => b.pts - a.pts);
    const myRank = rows.findIndex(r => r.e.human) + 1;
    $('r-title').textContent = 'Klasemen Akhir • ' + CUPS[S.gp.cup].name;
    $('r-sum').innerHTML = myRank === 1 ? '🏆 SELAMAT! Kamu juara ' + CUPS[S.gp.cup].name + '!' : myRank <= 3 ? `🥈 Podium! Kamu peringkat <b>${myRank}</b>.` : `Kamu peringkat <b>${myRank}</b>. Coba lagi untuk naik podium!`;
    $('r-table').innerHTML = '<table class="res"><tr><th></th><th>Pembalap</th><th>Poin</th></tr>' + rows.map((r, n) => `<tr class="${r.e.human ? 'me' : ''}"><td class="p">${n + 1}</td><td><canvas data-c="${CHARS[r.e.char].id}"></canvas>${CHARS[r.e.char].name}${r.e.human ? ' (Kamu)' : ''}</td><td><b>${r.pts}</b></td></tr>`).join('') + '</table>';
    $('r-table').querySelectorAll('canvas[data-c]').forEach(c => drawPortrait(c, c.dataset.c, 56));
    const bt = $('r-btns'); bt.innerHTML = '';
    const b1 = document.createElement('button'); b1.className = 'btn'; b1.textContent = 'Main Lagi'; b1.onclick = () => { hide('s-results'); S.gp = { i: 0, cup: S.gp.cup, total: S.roster.map(() => 0) }; launch(CUPS[S.gp.cup].tracks[0]); }; bt.appendChild(b1);
    const b2 = document.createElement('button'); b2.className = 'btn alt'; b2.textContent = 'Menu Utama'; b2.onclick = () => { hide('s-results'); toTitle(); }; bt.appendChild(b2);
    S.resPrimary = b1; Sfx.play('fanfare');
  }

  /* pause */
  function setPaused(p) {
    if (S.state !== 'race' || S.resultsShown) return;
    S.paused = p; $('s-pause').classList.toggle('show', p);
    if (p) { Sfx.engine(0, false, false); Sfx.skid(0); }
  }
  $('p-resume').onclick = () => setPaused(false);
  $('p-restart').onclick = () => { setPaused(false); launch(S.race.trackIdx); };
  $('p-quit').onclick = () => { setPaused(false); toTitle(); };
  $('btn-pause').onclick = () => setPaused(!S.paused);
  $('btn-mute').onclick = () => { Sfx.init(); const m = Sfx.toggleMute(); $('btn-mute').textContent = m ? '🔇' : '🔊'; };
  document.addEventListener('visibilitychange', () => { if (document.hidden && S.state === 'race' && !S.resultsShown) setPaused(true); });

  /* ---------- keyboard navigation ---------- */
  function onKey(e) {
    Sfx.init();
    const c = e.code;
    if (c === 'KeyM') { $('btn-mute').click(); return; }
    switch (S.state) {
      case 'splash': leaveSplash(); break;
      case 'title':
        if (c === 'ArrowUp' || c === 'KeyW') { setMenuSel(menuSel - 1); Sfx.play('ui'); }
        else if (c === 'ArrowDown' || c === 'KeyS') { setMenuSel(menuSel + 1); Sfx.play('ui'); }
        else if (c === 'Enter' || c === 'Space') activateMenu();
        break;
      case 'help': if (c === 'Enter' || c === 'Escape' || c === 'Space') { Sfx.play('back'); toTitle(); } break;
      case 'select': {
        const key = S.step;
        const n = S.step === 'char' ? CHARS.length : S.step === 'veh' ? VEHICLES.length : S.step === 'cup' ? CUPS.length : TRACK_DEFS.length;
        let cur = S.sel[key];
        if (c === 'ArrowRight' || c === 'KeyD') { S.sel[key] = (cur + 1) % n; Sfx.play('ui'); renderSelect(); }
        else if (c === 'ArrowLeft' || c === 'KeyA') { S.sel[key] = (cur + n - 1) % n; Sfx.play('ui'); renderSelect(); }
        else if (c === 'Enter' || c === 'Space') nextStep();
        else if (c === 'Escape' || c === 'Backspace') prevStep();
        break;
      }
      case 'race':
        if (S.resultsShown) { if ((c === 'Enter' || c === 'Space') && S.resPrimary) S.resPrimary.click(); }
        else if (c === 'Escape' || c === 'KeyP') setPaused(!S.paused);
        else if (S.paused && c === 'Enter') setPaused(false);
        break;
    }
  }
  function leaveSplash() {
    if (S.state !== 'splash') return;
    Sfx.init(); toTitle(); Sfx.play('ok');
  }
  $('s-splash').addEventListener('pointerdown', () => { Sfx.init(); if (isTouch) goFullscreen(); leaveSplash(); });

  /* ---------- main loop ---------- */
  let last = performance.now(), acc = 0;
  let ft = 16, slowT = 0, fastT = 0, qLevel = 1;
  function adapt(raw) {   // adaptive render resolution: keeps phones smooth
    if (!S.adapt || raw > 0.25) return;
    ft += (raw * 1000 - ft) * 0.08;
    if (ft > 25) { slowT += raw; fastT = 0; } else if (ft < 15) { fastT += raw; slowT = 0; } else { slowT = 0; fastT = 0; }
    if (slowT > 1.0 && qLevel > 0.5) { qLevel = Math.max(0.5, qLevel - 0.1); Renderer.setQuality(qLevel); slowT = 0; ft = 18; }
    else if (fastT > 8 && qLevel < 1) { qLevel = Math.min(1, qLevel + 0.05); Renderer.setQuality(qLevel); fastT = 0; }
  }
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000); adapt((now - last) / 1000); last = now;
    Renderer.resize();
    if (S.state === 'select') {
      showT += dt;
      const closeUp = S.step === 'char';
      Showroom.draw(showT, S.sel.char, closeUp ? 2 : S.sel.veh, closeUp);
      return;
    }
    if (S.state === 'race' && S.race) {
      const race = S.race;
      if (!S.paused) {
        acc += dt; let n = 0; const inp = S.resultsShown ? null : readInput();
        while (acc >= STEP && n < 5) { race.update(STEP, inp); acc -= STEP; n++; if (inp) inp.reset = false; }
        if (n >= 5) acc = 0;
        handleRaceEvents(race);
      }
      race.render();
      if (!S.resultsShown) updateHud(race);
      const k = race.human;
      if (k && !S.paused) { Sfx.engine(clamp(Math.abs(k.speed) / 60, 0, 1.2), k.boostT > 0, race.phase !== 'countdown' || true, VEHICLES[k.veh].snd); Sfx.skid(k.drift.on ? 1 : 0); }
      return;
    }
    // title / help / splash: attract race in the background
    if (S.bg) {
      acc += dt; let n = 0;
      while (acc >= STEP && n < 3) { S.bg.update(STEP, null); acc -= STEP; n++; }
      if (n >= 3) acc = 0;
      S.bg.render();
    } else if (S.state !== 'select') {
      // nothing yet
    }
  }

  /* ---------- init ---------- */
  function init() {
    const cv = $('gl');
    if (!Renderer.init(cv)) { $('nogl').style.display = 'flex'; return; }
    Renderer.resize(); addEventListener('resize', () => Renderer.resize());
    S.adapt = !location.hash.startsWith('#autotest') && !location.hash.startsWith('#noadapt');
    window.__nnr = { S, Showroom, drawPortrait, renderSelect: () => renderSelect() };
    LOGO_READY.then(start);
  }
  function start() {
    Assets.init();
    // build the first track while the splash is up
    setTimeout(() => { try { ensureBg(); } catch (e) { console.error(e); } }, 80);
    setMenuSel(0);
    requestAnimationFrame(frame);
    // test hooks via URL hash
    const hsh = location.hash;
    if (hsh.startsWith('#autotest')) setTimeout(() => runAutotest(hsh), 400);
  }
  function runAutotest(h) {
    const parts = h.split('-'); // #autotest-<track>-<veh>-<char>
    S.mode = 'race'; S.sel = { char: +(parts[3] || 0), veh: +(parts[2] || 1), track: +(parts[1] || 0) };
    Sfx.init(); S.bg = null; S.roster = makeRoster(); launch(S.sel.track);
    window.__nnr.auto = true;
  }
  window.__nnr_init = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
