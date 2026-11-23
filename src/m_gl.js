'use strict';
/* ===== WebGL renderer (no external libs) ===== */
const Renderer = (() => {
  let gl, canvas, pMain, pSky, pPart, U = {}, UP = {}, US = {};
  let skyBuf = null, skyN = 0, pbuf = null, whiteTex = null;
  let VPm = null, camEye = [0, 0, 0], camRight = [1, 0, 0], camUp = [0, 1, 0], curProg = null;
  let W = 1, H = 1, scale = 1, qual = 1, fogOver = false, fogBase = [100, 600];
  const IDM = M.id();

  const VS_MAIN = `
attribute vec3 aPos; attribute vec3 aNor; attribute vec3 aCol; attribute vec2 aUV;
uniform mat4 uVP; uniform mat4 uModel;
varying vec3 vCol; varying vec3 vWorld; varying vec3 vNor; varying vec2 vUV;
void main(){
  vec4 w = uModel * vec4(aPos,1.0);
  vWorld = w.xyz; vNor = mat3(uModel) * aNor; vCol = aCol; vUV = aUV;
  gl_Position = uVP * w;
}`;
  const FS_MAIN = `
precision highp float;
uniform vec3 uSunDir; uniform vec3 uSunCol; uniform vec3 uAmbTop; uniform vec3 uAmbBot;
uniform vec3 uFogCol; uniform float uFogNear; uniform float uFogFar; uniform vec3 uCam;
uniform sampler2D uTex; uniform float uUseTex; uniform float uEmis; uniform float uAlpha;
uniform float uUnlit; uniform vec3 uAdd;
varying vec3 vCol; varying vec3 vWorld; varying vec3 vNor; varying vec2 vUV;
void main(){
  vec3 n = normalize(vNor);
  vec3 base = vCol; float em = 0.0;
  if(uUseTex > 0.5){
    vec4 t = texture2D(uTex, vUV);
    base *= t.rgb;
    float lum = dot(t.rgb, vec3(0.3,0.59,0.11));
    em = step(0.80, lum) * uEmis;
  }
  float d = max(dot(n, uSunDir), 0.0);
  vec3 amb = mix(uAmbBot, uAmbTop, n.y*0.5+0.5);
  vec3 lit = base * (amb + uSunCol * d);
  lit = mix(lit, base * 1.08, uUnlit);
  lit = mix(lit, base * 1.25, em);
  lit += uAdd;
  float fd = length(vWorld - uCam);
  float f = clamp((fd - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
  lit = mix(lit, uFogCol, f * f * (3.0 - 2.0 * f));
  gl_FragColor = vec4(lit, uAlpha);
}`;
  const VS_SKY = `
attribute vec3 aPos; attribute vec3 aCol; uniform mat4 uVPs; varying vec3 vC;
void main(){ vC = aCol; vec4 p = uVPs * vec4(aPos,1.0); gl_Position = p.xyww; }`;
  const FS_SKY = `precision mediump float; varying vec3 vC; void main(){ gl_FragColor = vec4(vC,1.0); }`;
  const VS_PART = `
attribute vec3 aPos; attribute vec2 aUV; attribute vec4 aCol; uniform mat4 uVP;
varying vec2 vUV; varying vec4 vC;
void main(){ vUV = aUV; vC = aCol; gl_Position = uVP * vec4(aPos,1.0); }`;
  const FS_PART = `
precision mediump float; varying vec2 vUV; varying vec4 vC;
void main(){
  float r = length(vUV*2.0-1.0);
  float a = 1.0 - smoothstep(0.35, 1.0, r);
  gl_FragColor = vec4(vC.rgb, vC.a * a);
}`;

  function compile(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error('shader', gl.getShaderInfoLog(s)); }
    return s;
  }
  function program(vs, fs, attribs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    attribs.forEach((a, i) => gl.bindAttribLocation(p, i, a));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error('link', gl.getProgramInfoLog(p));
    return p;
  }
  function locs(p, names) { const o = {}; names.forEach(n => o[n] = gl.getUniformLocation(p, n)); return o; }

  function init(cv) {
    canvas = cv;
    gl = cv.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'high-performance' }) ||
      cv.getContext('experimental-webgl');
    if (!gl) return false;
    pMain = program(VS_MAIN, FS_MAIN, ['aPos', 'aNor', 'aCol', 'aUV']);
    U = locs(pMain, ['uVP', 'uModel', 'uSunDir', 'uSunCol', 'uAmbTop', 'uAmbBot', 'uFogCol', 'uFogNear', 'uFogFar', 'uCam', 'uTex', 'uUseTex', 'uEmis', 'uAlpha', 'uUnlit', 'uAdd']);
    pSky = program(VS_SKY, FS_SKY, ['aPos', 'aCol']);
    US = locs(pSky, ['uVPs']);
    pPart = program(VS_PART, FS_PART, ['aPos', 'aUV', 'aCol']);
    UP = locs(pPart, ['uVP']);
    pbuf = gl.createBuffer();
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.CULL_FACE);
    whiteTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, whiteTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    return true;
  }

  function resize() {
    const touchy = navigator.maxTouchPoints > 0 && window.matchMedia && matchMedia('(pointer:coarse)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, touchy ? 1.5 : 1.75) * qual;
    scale = dpr;
    const w = Math.floor(window.innerWidth * dpr), h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    W = w; H = h;
  }

  function mesh(data, opt) {
    opt = opt || {};
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data instanceof Float32Array ? data : new Float32Array(data), gl.STATIC_DRAW);
    return { buf, n: data.length / 11, tex: opt.tex || null, unlit: !!opt.unlit, emis: opt.emis || 0 };
  }

  function tex(src, opt) {
    opt = opt || {};
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    const wrap = opt.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    if (opt.mip) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }

  /* sky dome with gradient, sun glow and stars */
  function setSky(env) {
    const R = 400, rings = 18, segs = 32;
    const a = [];
    const top = env.skyTop, hor = env.skyHor, sd = V3.norm(env.sunDir);
    const vert = (phi, lam) => {
      const cp = Math.cos(phi), x = cp * Math.cos(lam), y = Math.sin(phi), z = cp * Math.sin(lam);
      let t = Math.pow(Math.max(y, 0), 0.5);
      let c = mixc(hor, top, t);
      if (y < 0) c = mixc(hor, env.fog, Math.min(1, -y * 3));
      const dd = Math.max(x * sd[0] + y * sd[1] + z * sd[2], 0);
      const g = Math.pow(dd, 40) * 0.9 + Math.pow(dd, 6) * 0.22;
      c = [c[0] + env.sunGlow[0] * g, c[1] + env.sunGlow[1] * g, c[2] + env.sunGlow[2] * g];
      return [x * R, y * R, z * R, c[0], c[1], c[2]];
    };
    for (let i = 0; i < rings; i++) {
      const p0 = -0.25 + (Math.PI / 2 + 0.25) * (i / rings), p1 = -0.25 + (Math.PI / 2 + 0.25) * ((i + 1) / rings);
      for (let j = 0; j < segs; j++) {
        const l0 = TAU * j / segs, l1 = TAU * (j + 1) / segs;
        const A = vert(p0, l0), B = vert(p0, l1), C = vert(p1, l1), D = vert(p1, l0);
        a.push(...A, ...B, ...C, ...A, ...C, ...D);
      }
    }
    if (env.stars) {
      const rnd = mulberry32(77);
      for (let i = 0; i < 260; i++) {
        const lam = rnd() * TAU, phi = 0.15 + rnd() * 1.4;
        const cp = Math.cos(phi);
        const cx = cp * Math.cos(lam) * R * 0.98, cy = Math.sin(phi) * R * 0.98, cz = cp * Math.sin(lam) * R * 0.98;
        const s = 0.9 + rnd() * 1.4, b = 0.6 + rnd() * 0.4;
        const col = [b, b, b * 0.95];
        a.push(cx, cy, cz, ...col, cx + s, cy, cz, ...col, cx, cy + s, cz, ...col);
      }
    }
    skyN = a.length / 6;
    if (!skyBuf) skyBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, skyBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(a), gl.STATIC_DRAW);
  }

  function begin(cam, env) {
    gl.viewport(0, 0, W, H);
    gl.clearColor(env.fog[0], env.fog[1], env.fog[2], 1);
    gl.depthMask(true); gl.disable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const asp = W / H; let fovD = cam.fov;
    if (asp < 1.35) fovD = Math.min(100, fovD * (1 + (1.35 - asp) * 0.55)); // portrait: widen the view
    const P = M.persp(fovD * Math.PI / 180, asp, 0.8, 1800);
    const V = M.lookAt(cam.eye, cam.target, [0, 1, 0]);
    VPm = M.mul(P, V);
    camEye = cam.eye;
    camRight = [V[0], V[4], V[8]]; camUp = [V[1], V[5], V[9]];
    // sky
    if (skyBuf) {
      const Vs = V.slice(); Vs[12] = Vs[13] = Vs[14] = 0;
      const VPs = M.mul(P, Vs);
      gl.useProgram(pSky); curProg = pSky;
      gl.uniformMatrix4fv(US.uVPs, false, VPs);
      gl.disable(gl.DEPTH_TEST);
      gl.bindBuffer(gl.ARRAY_BUFFER, skyBuf);
      gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1);
      gl.disableVertexAttribArray(2); gl.disableVertexAttribArray(3);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
      gl.drawArrays(gl.TRIANGLES, 0, skyN);
      gl.enable(gl.DEPTH_TEST);
    }
    gl.useProgram(pMain); curProg = pMain;
    gl.uniformMatrix4fv(U.uVP, false, VPm);
    gl.uniform3fv(U.uCam, cam.eye);
    gl.uniform3fv(U.uSunDir, V3.norm(env.sunDir));
    gl.uniform3fv(U.uSunCol, env.sunCol);
    gl.uniform3fv(U.uAmbTop, env.ambTop);
    gl.uniform3fv(U.uAmbBot, env.ambBot);
    gl.uniform3fv(U.uFogCol, env.fog);
    gl.uniform1f(U.uFogNear, env.fogNear);
    gl.uniform1f(U.uFogFar, env.fogFar);
    fogBase = [env.fogNear, env.fogFar]; fogOver = false;
    gl.uniform1i(U.uTex, 0);
    gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2); gl.enableVertexAttribArray(3);
  }

  function draw(m, model, o) {
    o = o || {};
    if (curProg !== pMain) {
      gl.useProgram(pMain); curProg = pMain;
      gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1);
      gl.enableVertexAttribArray(2); gl.enableVertexAttribArray(3);
    }
    gl.uniformMatrix4fv(U.uModel, false, model || IDM);
    const alpha = o.alpha === undefined ? 1 : o.alpha;
    if (alpha < 1) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); }
    else { gl.disable(gl.BLEND); gl.depthMask(true); }
    gl.uniform1f(U.uAlpha, alpha);
    if (m.tex) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, m.tex); gl.uniform1f(U.uUseTex, 1); }
    else gl.uniform1f(U.uUseTex, 0);
    gl.uniform1f(U.uEmis, o.emis !== undefined ? o.emis : m.emis);
    gl.uniform1f(U.uUnlit, o.unlit !== undefined ? o.unlit : (m.unlit ? 1 : 0));
    const ad = o.add || [0, 0, 0];
    gl.uniform3f(U.uAdd, ad[0], ad[1], ad[2]);
    if (o.fog) { gl.uniform1f(U.uFogNear, o.fog[0]); gl.uniform1f(U.uFogFar, o.fog[1]); fogOver = true; }
    else if (fogOver) { gl.uniform1f(U.uFogNear, fogBase[0]); gl.uniform1f(U.uFogFar, fogBase[1]); fogOver = false; }
    gl.bindBuffer(gl.ARRAY_BUFFER, m.buf);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 44, 0);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 44, 12);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 44, 24);
    gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 44, 36);
    gl.drawArrays(gl.TRIANGLES, 0, m.n);
  }

  /* billboard particles. p = {x,y,z,s,r,g,b,a} ; additive flag per batch */
  function particles(list, additive) {
    if (!list.length) return;
    const n = list.length, d = new Float32Array(n * 6 * 9);
    let o = 0;
    const rx = camRight[0], ry = camRight[1], rz = camRight[2], ux = camUp[0], uy = camUp[1], uz = camUp[2];
    const push = (x, y, z, u, v, p) => { d[o++] = x; d[o++] = y; d[o++] = z; d[o++] = u; d[o++] = v; d[o++] = p.r; d[o++] = p.g; d[o++] = p.b; d[o++] = p.a; };
    for (let i = 0; i < n; i++) {
      const p = list[i], s = p.s;
      const ax = p.x - rx * s - ux * s, ay = p.y - ry * s - uy * s, az = p.z - rz * s - uz * s;
      const bx = p.x + rx * s - ux * s, by = p.y + ry * s - uy * s, bz = p.z + rz * s - uz * s;
      const cx = p.x + rx * s + ux * s, cy = p.y + ry * s + uy * s, cz = p.z + rz * s + uz * s;
      const dx = p.x - rx * s + ux * s, dy = p.y - ry * s + uy * s, dz = p.z - rz * s + uz * s;
      push(ax, ay, az, 0, 0, p); push(bx, by, bz, 1, 0, p); push(cx, cy, cz, 1, 1, p);
      push(ax, ay, az, 0, 0, p); push(cx, cy, cz, 1, 1, p); push(dx, dy, dz, 0, 1, p);
    }
    gl.useProgram(pPart); curProg = pPart;
    gl.uniformMatrix4fv(UP.uVP, false, VPm);
    gl.enable(gl.BLEND); gl.depthMask(false);
    gl.blendFunc(gl.SRC_ALPHA, additive ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
    gl.bufferData(gl.ARRAY_BUFFER, d, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1); gl.enableVertexAttribArray(2);
    gl.disableVertexAttribArray(3);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 36, 0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 36, 12);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 36, 20);
    gl.drawArrays(gl.TRIANGLES, 0, n * 6);
    gl.depthMask(true); gl.disable(gl.BLEND);
  }

  return {
    init, resize, mesh, tex, setSky, begin, draw, particles,
    setQuality(q) { qual = q; resize(); }, get quality() { return qual; },
    get gl() { return gl; }, get W() { return W; }, get H() { return H; }, get scale() { return scale; },
  };
})();
