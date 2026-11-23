'use strict';
/* ===== Audio: synthesized SFX, engine, gamelan-style music (WebAudio) ===== */
const Sfx = (() => {
  let ctx = null, master = null, eng = null, skid = null, noiseBuf = null, muted = false;
  let mTimer = null, mStep = 0, mNext = 0, mTheme = null, mGain = null;
  try { muted = localStorage.getItem('nnr_mute') === '1'; } catch (e) { }
  const SL = [1, 1.1892, 1.4142, 1.6818, 2.0]; // slendro-ish 5-tone scale

  function init() {
    if (ctx) { resume(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.8; master.connect(ctx.destination);
    mGain = ctx.createGain(); mGain.gain.value = 0.55; mGain.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // engine
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o1.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 600; g.gain.value = 0;
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(master); o1.start(); o2.start();
    eng = { o1, o2, f, g };
    // skid
    const ns = ctx.createBufferSource(); ns.buffer = noiseBuf; ns.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 2.5;
    const sg = ctx.createGain(); sg.gain.value = 0;
    ns.connect(bp); bp.connect(sg); sg.connect(master); ns.start();
    skid = { g: sg };
  }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => { }); }
  function tone(freq, dur, type, vol, slide, delay, dest) {
    if (!ctx) return;
    const t = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, freq, delay, q) {
    if (!ctx) return;
    const t = ctx.currentTime + (delay || 0);
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1000; f.Q.value = q || 0.8;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol || 0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  const lib = {
    ui() { tone(660, 0.07, 'triangle', 0.12); },
    ok() { tone(520, 0.08, 'triangle', 0.15); tone(780, 0.14, 'triangle', 0.15, 0, 0.07); },
    back() { tone(420, 0.1, 'triangle', 0.12, 300); },
    count() { tone(440, 0.22, 'square', 0.14); },
    go() { tone(880, 0.5, 'square', 0.16); tone(1320, 0.5, 'triangle', 0.1); },
    hop() { tone(300, 0.12, 'sine', 0.12, 520); },
    drift1() { tone(900, 0.08, 'triangle', 0.1); },
    drift2() { tone(1200, 0.1, 'triangle', 0.1); },
    drift3() { tone(1600, 0.12, 'triangle', 0.12); },
    boost() { noise(0.7, 0.28, 900, 0, 0.5); tone(180, 0.6, 'sawtooth', 0.12, 520); },
    pad() { noise(0.6, 0.3, 1400, 0, 0.5); tone(300, 0.5, 'sawtooth', 0.1, 800); },
    mango() { tone(988, 0.07, 'triangle', 0.13); tone(1480, 0.12, 'triangle', 0.13, 0, 0.06); },
    crate() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.12, 'square', 0.1, 0, i * 0.06)); },
    sambal() { noise(0.35, 0.25, 2200, 0, 0.7); tone(700, 0.3, 'sawtooth', 0.1, 200); },
    drop() { tone(260, 0.15, 'square', 0.12, 120); },
    boom() { noise(0.7, 0.55, 300, 0, 0.5); tone(120, 0.5, 'sawtooth', 0.25, 40); },
    shield() { tone(1200, 0.25, 'sine', 0.16, 400); tone(1800, 0.2, 'sine', 0.1, 600); },
    shieldOn() { tone(500, 0.3, 'sine', 0.16, 1000); },
    bump() { noise(0.14, 0.3, 500, 0, 0.8); tone(110, 0.12, 'square', 0.15, 60); },
    land() { noise(0.12, 0.2, 250, 0, 0.8); },
    lap() { [660, 880, 1100].forEach((f, i) => tone(f, 0.16, 'triangle', 0.15, 0, i * 0.09)); },
    final() { [880, 1100, 1320, 1760].forEach((f, i) => tone(f, 0.18, 'square', 0.12, 0, i * 0.08)); },
    fanfare() { [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => { tone(f, 0.22, 'triangle', 0.16, 0, i * 0.13); tone(f / 2, 0.22, 'square', 0.06, 0, i * 0.13); }); },
    item() { tone(1100, 0.08, 'square', 0.07); },
  };
  function play(n) { if (!ctx || muted) return; resume(); const f = lib[n]; if (f) f(); }
  function engine(ratio, boosting, active) {
    if (!eng) return;
    const t = ctx.currentTime;
    const base = 52 + ratio * 150 + (boosting ? 40 : 0);
    eng.o1.frequency.setTargetAtTime(base, t, 0.05);
    eng.o2.frequency.setTargetAtTime(base * 0.5, t, 0.05);
    eng.f.frequency.setTargetAtTime(380 + ratio * 1200, t, 0.08);
    eng.g.gain.setTargetAtTime(active ? 0.05 + ratio * 0.05 : 0, t, 0.1);
  }
  function skidv(v) { if (skid) skid.g.gain.setTargetAtTime(v * 0.1, ctx.currentTime, 0.05); }
  /* ---- music ---- */
  const THEMES = {
    title: { bpm: 92, root: 196, style: 'gamelan', mel: [0, 2, 1, 3, 2, 4, 3, 2, 0, 2, 1, 3, 4, 3, 2, 1], bass: [0, 8], perc: [4, 12] },
    sawah: { bpm: 118, root: 220, style: 'gamelan', mel: [0, 2, 1, 3, 2, 4, 3, 2, 4, 3, 2, 1, 3, 2, 1, 0], bass: [0, 6, 8, 14], perc: [4, 12, 2, 10] },
    kota: { bpm: 132, root: 247, style: 'synth', mel: [0, 4, 2, 4, 3, 4, 2, 1, 0, 4, 2, 4, 3, 2, 1, 2], bass: [0, 3, 6, 8, 11, 14], perc: [0, 4, 8, 12] },
    pantai: { bpm: 104, root: 262, style: 'soft', mel: [0, 1, 2, 4, 3, 2, 1, 2, 0, 2, 3, 4, 3, 1, 2, 0], bass: [0, 8], perc: [4, 12] },
    gunung: { bpm: 124, root: 196, style: 'gamelan', mel: [0, 1, 2, 4, 2, 1, 0, 2, 3, 4, 3, 2, 4, 3, 1, 0], bass: [0, 4, 8, 12], perc: [2, 6, 10, 14, 4] },
    depok: { bpm: 140, root: 233, style: 'synth', mel: [0, 2, 4, 2, 0, 3, 4, 3, 1, 3, 4, 3, 2, 1, 0, 1], bass: [0, 2, 6, 8, 10, 14], perc: [0, 4, 8, 12] },
    ui: { bpm: 112, root: 294, style: 'soft', mel: [0, 2, 3, 4, 3, 2, 4, 3, 2, 1, 2, 3, 1, 0, 1, 2], bass: [0, 6, 8, 14], perc: [4, 12, 10] },
  };
  function note(freq, t, dur, type, vol, metal) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(mGain); o.start(t); o.stop(t + dur + 0.05);
    if (metal) {
      const o2 = ctx.createOscillator(), g2 = ctx.createGain(); o2.type = 'sine'; o2.frequency.value = freq * 2.76;
      g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(vol * 0.35, t + 0.005); g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.5);
      o2.connect(g2); g2.connect(mGain); o2.start(t); o2.stop(t + dur);
    }
  }
  function hit(t, f, dur, vol) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = 1.2;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(mGain); s.start(t, Math.random() * 0.4); s.stop(t + dur + 0.02);
  }
  function sched() {
    if (!ctx || !mTheme) return;
    const th = mTheme, stepDur = 60 / th.bpm / 4;
    while (mNext < ctx.currentTime + 0.25) {
      const s = mStep % 16, deg = th.mel[s];
      const oct = ((mStep >> 4) % 4 === 3 && s % 4 === 2) ? 2 : 1;
      const fq = th.root * SL[deg] * oct * (s > 7 ? 1 : 2);
      if (th.style === 'gamelan') {
        if (s % 2 === 0 || (mStep % 5 === 0)) note(fq, mNext, 0.5, 'triangle', 0.13, true);
        if (th.bass.includes(s)) note(th.root * 0.5, mNext, 1.2, 'sine', 0.3, true);
        if (th.perc.includes(s)) hit(mNext, s % 8 === 4 ? 220 : 900, 0.08, 0.16);
        if (s % 4 === 1) note(th.root * SL[(deg + 2) % 5] * 4, mNext, 0.2, 'sine', 0.05, true);
      } else if (th.style === 'synth') {
        if (th.bass.includes(s)) note(th.root * 0.5, mNext, 0.2, 'square', 0.1);
        note(fq * 0.5, mNext, 0.12, 'sawtooth', 0.05);
        hit(mNext, s % 2 ? 7000 : 5000, 0.04, s % 4 === 0 ? 0.08 : 0.04);
        if (s % 4 === 0) { hit(mNext, 150, 0.12, 0.3); }
      } else {
        if (s % 2 === 0) note(fq, mNext, 0.9, 'sine', 0.14, true);
        if (th.bass.includes(s)) note(th.root * 0.5, mNext, 1.4, 'triangle', 0.2);
        if (th.perc.includes(s)) hit(mNext, 1400, 0.07, 0.07);
      }
      mNext += stepDur; mStep++;
    }
  }
  function musicStart(name) {
    if (!ctx) return;
    const th = THEMES[name] || THEMES.title;
    if (mTheme === th && mTimer) return;
    musicStop(); mTheme = th; mStep = 0; mNext = ctx.currentTime + 0.1;
    mGain.gain.cancelScheduledValues(ctx.currentTime); mGain.gain.value = 0.55;
    mTimer = setInterval(sched, 60);
  }
  function musicStop() { if (mTimer) { clearInterval(mTimer); mTimer = null; } mTheme = null; }
  function toggleMute() {
    muted = !muted;
    try { localStorage.setItem('nnr_mute', muted ? '1' : '0'); } catch (e) { }
    if (master) master.gain.value = muted ? 0 : 0.8;
    return muted;
  }
  return { init, play, engine, skid: skidv, musicStart, musicStop, toggleMute, resume, get muted() { return muted; }, get ready() { return !!ctx; } };
})();
