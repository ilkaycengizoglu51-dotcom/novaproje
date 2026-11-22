/* NOVAPROJE 3D stills for the client panel (needs three.js r147 loaded first) */
(function(){
const $ = (s, el = document) => el.querySelector(s);
/* ---------- 3D kit (vanilla three.js port of the R3F components) ---------- */
const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (v) => v * v * (3 - 2 * v);
const range = (p, a, b) => smooth(clamp01((p - a) / Math.max(1e-4, b - a)));
function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

let M = null;
const SHARED = new Set();
function buildMats() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 16;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 16);
  for (let i = 0; i < 8; i++) { g.fillStyle = '#d9dcdc'; g.fillRect(i * 32, 0, 6, 16); g.fillStyle = '#c7cbcb'; g.fillRect(i * 32 + 6, 0, 2, 16); }
  const rib = (color, rx, ry) => { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
    return new THREE.MeshStandardMaterial({ color, map: t, metalness: .35, roughness: .45, side: THREE.DoubleSide }); };
  const s = (p) => new THREE.MeshStandardMaterial(p);
  M = {
    steel: s({ color: '#b3bbbf', metalness: .85, roughness: .3 }), galvanized: s({ color: '#c4cacc', metalness: .75, roughness: .38 }),
    frame: s({ color: '#3c4246', metalness: .6, roughness: .45 }), stainless: s({ color: '#d7dbdd', metalness: .95, roughness: .18 }),
    roof: rib('#e9ebea', 1, 14), wall: rib('#e1e4e3', 10, 1), wallDark: rib('#4a5054', 10, 1),
    panelWhite: s({ color: '#eef0ef', metalness: .2, roughness: .4 }), concrete: s({ color: '#8f918e', roughness: .95 }), slab: s({ color: '#7a7d7a', roughness: .9 }),
    asphalt: s({ color: '#2b2f31', roughness: .95 }), soil: s({ color: '#5b4a3a', roughness: 1 }), grass: s({ color: '#4a5e46', roughness: 1 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#d8ebe7', roughness: .05, transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1 }),
    water: new THREE.MeshPhysicalMaterial({ color: '#2d6d8c', metalness: .05, roughness: .06, transparent: true, opacity: .82, clearcoat: 1 }),
    slurry: s({ color: '#3d3226', roughness: .35, metalness: .1 }), manure: s({ color: '#4d3f2f', roughness: .9 }), feed: s({ color: '#a88a55', roughness: 1 }),
    pvc: s({ color: '#e3e6e6', roughness: .38, metalness: .05 }), pipeBlue: s({ color: '#2f6593', roughness: .4, metalness: .2 }),
    pipeGreen: s({ color: '#3E8E5E', roughness: .45, metalness: .15 }), pipeGrey: s({ color: '#6d7478', roughness: .45, metalness: .3 }),
    pipeClear: new THREE.MeshPhysicalMaterial({ color: '#cfe0e6', roughness: .1, transparent: true, opacity: .28, depthWrite: false }),
    hdpe: s({ color: '#1f2325', roughness: .55 }), tankGreen: s({ color: '#2f5e45', roughness: .5, metalness: .1 }),
    copper: s({ color: '#b87347', metalness: .9, roughness: .32 }), foam: s({ color: '#d6b25c', roughness: .85 }), rubber: s({ color: '#1d2022', roughness: .8 }),
    animal: s({ color: '#d6d1c8', roughness: .88 }), animalDark: s({ color: '#8f8a83', roughness: .88 }), leaf: s({ color: '#ffffff', roughness: .7 }),
    pad: s({ color: '#a88f62', roughness: 1 }), curtain: new THREE.MeshStandardMaterial({ color: '#e7ece9', roughness: .7, transparent: true, opacity: .55, side: THREE.DoubleSide }),
    led: s({ color: '#fff', emissive: '#f4efff', emissiveIntensity: 2.4 }), ledPink: s({ color: '#fff', emissive: '#f1c7ff', emissiveIntensity: 2.2 }),
    accent: s({ color: '#3E8E5E', roughness: .5, metalness: .2 }), machine: s({ color: '#5a6a62', metalness: .45, roughness: .4 }),
    machineLight: s({ color: '#cfd5d2', metalness: .4, roughness: .35 }), crate: s({ color: '#3E8E5E', roughness: .55 }), carton: s({ color: '#b89a72', roughness: .9 }),
    pallet: s({ color: '#8b6d4b', roughness: .85 }), fruit: s({ color: '#ffffff', roughness: .45 }), motor: s({ color: '#2f5e8a', metalness: .5, roughness: .35 }),
    valve: s({ color: '#b03a2e', metalness: .4, roughness: .4 }), yellow: s({ color: '#d6a52b', metalness: .3, roughness: .5 }),
  };
  Object.values(M).forEach((m) => SHARED.add(m));
}

/* ctx = { mobile, up: [fn(t, dt, p)], hot: [], root: Group } */
function add(parent, o) { parent.add(o); return o; }
function mesh(geo, m, p, r, shadow = true) {
  const o = new THREE.Mesh(geo, m); if (p) o.position.set(p[0], p[1], p[2]); if (r) o.rotation.set(r[0], r[1], r[2]);
  o.castShadow = shadow; o.receiveShadow = true; return o;
}
function B(par, p, s, m, r, shadow = true) { return add(par, mesh(new THREE.BoxGeometry(s[0], s[1], s[2]), m, p, r, shadow)); }
function C(par, p, rt, h, m, r, rb, seg = 24) { return add(par, mesh(new THREE.CylinderGeometry(rt, rb == null ? rt : rb, h, seg), m, p, r)); }
const UP = new THREE.Vector3(0, 1, 0);
function Beam(par, a, b, size, m, round = true) {
  const va = V(a), vb = V(b), d = vb.clone().sub(va), l = d.length();
  if (l < 1e-4) return null;
  const o = mesh(round ? new THREE.CylinderGeometry(size / 2, size / 2, l, 10) : new THREE.BoxGeometry(size, l, size), m);
  o.position.copy(va.add(vb).multiplyScalar(.5)); o.quaternion.setFromUnitVectors(UP, d.normalize()); return add(par, o);
}
function polyCurve(pts) { const c = new THREE.CurvePath(); for (let i = 0; i < pts.length - 1; i++) c.add(new THREE.LineCurve3(V(pts[i]), V(pts[i + 1]))); return c; }
function Pipe(par, pts, radius, m, joints = true) {
  const g = new THREE.Group();
  for (let i = 0; i < pts.length - 1; i++) {
    if (V(pts[i]).distanceTo(V(pts[i + 1])) < 1e-4) continue;
    g.add(mesh(new THREE.TubeGeometry(new THREE.LineCurve3(V(pts[i]), V(pts[i + 1])), 1, radius, 12, false), m));
  }
  if (joints) for (let i = 1; i < pts.length - 1; i++) g.add(mesh(new THREE.SphereGeometry(radius * 1.18, 12, 8), m, pts[i]));
  return add(par, g);
}
function Flow(ctx, par, pts, o = {}) {
  const { color = '#7cc4ff', count = 40, speed = .08, size = .05, active = [0, 1] } = o;
  const curve = polyCurve(pts), len = curve.getLength();
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.6, roughness: .4 });
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), mat, count); im.frustumCulled = false;
  const d = new THREE.Object3D();
  ctx.up.push((t, dt, p) => {
    const vis = p >= active[0] - .05 && p <= active[1] + .05; im.visible = vis; if (!vis) return;
    const t0 = (t * speed * 6) / Math.max(len, .1);
    for (let i = 0; i < count; i++) { curve.getPointAt((i / count + t0) % 1, d.position); d.scale.setScalar(size * (.8 + .4 * Math.sin(i * 12.9))); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }
    im.instanceMatrix.needsUpdate = true;
  });
  return add(par, im);
}
function Fan(ctx, par, p, o = {}) {
  const { r = [0, 0, 0], radius = .5, speed = 8, blades = 5, housing = true } = o;
  const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); g.rotation.set(r[0], r[1], r[2]);
  if (housing) { g.add(mesh(new THREE.TorusGeometry(radius * 1.05, radius * .07, 8, 32), M.galvanized)); B(g, [0, 0, -.08], [radius * 2.4, radius * 2.4, .06], M.frame); }
  const rot = new THREE.Group(); g.add(rot);
  rot.add(mesh(new THREE.CylinderGeometry(radius * .16, radius * .16, .12, 14), M.frame, null, [Math.PI / 2, 0, 0]));
  for (let i = 0; i < blades; i++) rot.add(mesh(new THREE.BoxGeometry(radius * .32, radius * 1.85, .015), M.steel, null, [.35, 0, (i / blades) * Math.PI * 2]));
  ctx.up.push((t, dt) => { rot.rotation.z += dt * speed; });
  return add(par, g);
}
function Reveal(ctx, par, from, to, offset, rot = [0, 0, 0]) {
  const g = new THREE.Group();
  ctx.up.push((t, dt, p) => { const k = range(p, from, to); g.position.set(offset[0] * k, offset[1] * k, offset[2] * k); g.rotation.set(rot[0] * k, rot[1] * k, rot[2] * k); });
  return add(par, g);
}
function Hot(ctx, p, title, text, from = .3, to = 1.01) { ctx.hot.push({ p: V(p), title, text, from, to }); }

function Shed(ctx, par, o) {
  const { L, W, H, ridge, bays, front = [.1, .38], roof = [.08, .36], wallH, curtain = false, wallMat } = o;
  const wh = wallH == null ? H : wallH, wm = wallMat || M.wall;
  const g = add(par, new THREE.Group());
  const ang = Math.atan2(ridge, W / 2);
  const slope = Math.sqrt((W / 2 + .45) ** 2 + (ridge * (1 + .45 / (W / 2))) ** 2);
  B(g, [0, -.09, 0], [L + 1.2, .2, W + 1.2], M.slab);
  for (let i = 0; i <= bays; i++) {
    const x = -L / 2 + (i * L) / bays;
    B(g, [x, H / 2, -W / 2], [.22, H, .3], M.frame); B(g, [x, H / 2, W / 2], [.22, H, .3], M.frame);
    [-1, 1].forEach((sd) => B(g, [x, H + ridge / 2, (sd * W) / 4], [.2, .32, Math.hypot(W / 2, ridge)], M.frame, [sd * ang, 0, 0]));
  }
  B(g, [0, wh / 2, -W / 2 - .12], [L, wh, .12], wm);
  if (curtain && H > wh) B(g, [0, wh + (H - wh) / 2, -W / 2 - .1], [L, H - wh, .03], M.curtain, null, false);
  const sh = new THREE.Shape(); sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, H); sh.lineTo(0, H + ridge); sh.lineTo(-W / 2, H); sh.closePath();
  const gg = new THREE.ExtrudeGeometry(sh, { depth: .14, bevelEnabled: false });
  [-1, 1].forEach((sd) => add(g, mesh(gg, wm, [sd * (L / 2) + (sd > 0 ? 0 : -.14), 0, 0], [0, Math.PI / 2, 0])));
  const fr = Reveal(ctx, g, front[0], front[1], [0, -wh - .3, 0]);
  B(fr, [0, wh / 2, W / 2 + .12], [L, wh, .12], wm);
  if (curtain && H > wh) B(fr, [0, wh + (H - wh) / 2, W / 2 + .1], [L, H - wh, .03], M.curtain, null, false);
  const rf = Reveal(ctx, g, roof[0], roof[1], [0, 7, -2], [-.12, 0, 0]);
  [-1, 1].forEach((sd) => B(rf, [0, H + ridge / 2 + .12, (sd * W) / 4], [L + .6, .1, slope], M.roof, [sd * ang, 0, 0]));
  B(rf, [0, H + ridge + .17, 0], [L + .6, .12, .5], M.frame);
  [.25, .5, .75, 1].forEach((f) => [-1, 1].forEach((sd) => B(rf, [0, H + ridge * (1 - f) + .02, (sd * W * f) / 2], [L, .1, .08], M.frame)));
  return g;
}
function Fence(par, a, b, o = {}) {
  const { h = 1, rails = 3, posts = 1.5, m = M.galvanized } = o;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(len / posts));
  for (let i = 0; i <= n; i++) { const t = i / n, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t; Beam(par, [x, 0, z], [x, h, z], .06, m); }
  for (let i = 0; i < rails; i++) { const y = (h * (i + 1)) / rails; Beam(par, [a[0], y, a[1]], [b[0], y, b[1]], .04, m); }
}
function Instanced(par, geo, m, mats, shadow = true) {
  const im = new THREE.InstancedMesh(geo, m, mats.length); mats.forEach((mx, i) => im.setMatrixAt(i, mx));
  im.castShadow = shadow; im.receiveShadow = true; return add(par, im);
}
const TM = (x, y, z, rx = 0, ry = 0, rz = 0, s = 1) => { const o = new THREE.Object3D(); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.scale.setScalar(s); o.updateMatrix(); return o.matrix.clone(); };
function BarsX(par, x0, x1, z, o = {}) {
  const { step = .3, y0 = 0, h = 1, r = .02, m = M.galvanized } = o; const a = [];
  for (let x = x0; x <= x1 + 1e-6; x += step) a.push(TM(x, y0 + h / 2, z));
  return Instanced(par, new THREE.CylinderGeometry(r, r, h, 8), m, a);
}
function animalParts(kind) {
  if (kind === 'sheep') { const b = new THREE.CapsuleGeometry(.27, .5, 6, 12); b.rotateZ(Math.PI / 2); const h = new THREE.CapsuleGeometry(.1, .18, 4, 10); h.rotateZ(Math.PI / 2.6); const l = new THREE.CylinderGeometry(.035, .03, .42, 6);
    return [[b, [0, .62, 0], 0, 'b'], [h, [.5, .78, 0], 1, 'd'], [l, [.25, .21, .13], 0, 'd'], [l, [.25, .21, -.13], 0, 'd'], [l, [-.25, .21, .13], 0, 'd'], [l, [-.25, .21, -.13], 0, 'd']]; }
  if (kind === 'cow') { const b = new THREE.CapsuleGeometry(.42, 1.25, 6, 14); b.rotateZ(Math.PI / 2); const h = new THREE.CapsuleGeometry(.16, .38, 4, 10); h.rotateZ(Math.PI / 2.3); const l = new THREE.CylinderGeometry(.075, .06, .9, 8);
    return [[b, [0, 1.3, 0], 0, 'b'], [h, [1.08, 1.4, 0], 1, 'b'], [l, [.55, .45, .22], 0, 'd'], [l, [.55, .45, -.22], 0, 'd'], [l, [-.55, .45, .22], 0, 'd'], [l, [-.55, .45, -.22], 0, 'd']]; }
  const b = new THREE.SphereGeometry(.12, 12, 10); b.scale(1.25, 1, .95); const h = new THREE.SphereGeometry(.055, 10, 8); const l = new THREE.CylinderGeometry(.012, .012, .09, 5);
  return [[b, [0, .2, 0], 0, 'b'], [h, [.13, .3, 0], 1, 'b'], [l, [0, .05, .04], 0, 'd'], [l, [0, .05, -.04], 0, 'd']];
}
function Herd(ctx, par, kind, items, y = 0, eat = true) {
  const parts = animalParts(kind);
  const bases = items.map((it) => TM(it.x, y, it.z, 0, it.r, 0));
  const off = new THREE.Matrix4(), out = new THREE.Matrix4();
  const meshes = parts.map(([geo, o, head, mt]) => {
    const im = new THREE.InstancedMesh(geo, mt === 'b' ? M.animal : M.animalDark, items.length); im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
    bases.forEach((b, i) => { off.makeTranslation(o[0], o[1], o[2]); out.multiplyMatrices(b, off); im.setMatrixAt(i, out); });
    return add(par, im);
  });
  if (!eat) return;
  const sp = kind === 'hen' ? 3.2 : .9, dyM = kind === 'cow' ? .35 : kind === 'sheep' ? .22 : .12, dxM = kind === 'cow' ? .12 : .06;
  ctx.up.push((t) => {
    parts.forEach(([, o, head], pi) => {
      if (!head) return; const im = meshes[pi];
      bases.forEach((b, i) => { const k = Math.max(0, Math.sin(t * sp + i * 1.7)); off.makeTranslation(o[0] + k * dxM, o[1] - k * dyM, o[2]); out.multiplyMatrices(b, off); im.setMatrixAt(i, out); });
      im.instanceMatrix.needsUpdate = true;
    });
  });
}
function scatter(n, x0, x1, z0, z1, face, seed, jitter = .5) { const R = rng(seed); return Array.from({ length: n }, () => ({ x: x0 + R() * (x1 - x0), z: z0 + R() * (z1 - z0), r: face + (R() - .5) * jitter })); }
function Plants(ctx, par, pts, o = {}) {
  const { size = .14, color = '#5e9a4c', grow } = o;
  const geo = new THREE.IcosahedronGeometry(1, 1); geo.scale(1, .62, 1);
  const im = new THREE.InstancedMesh(geo, M.leaf, pts.length); im.castShadow = true; im.receiveShadow = true;
  const R = rng(pts.length * 7 + 3); const seeds = pts.map(() => [R() * Math.PI, .8 + R() * .4]);
  const base = new THREE.Color(color), c = new THREE.Color(), d = new THREE.Object3D();
  pts.forEach((_, i) => { c.copy(base).offsetHSL((seeds[i][1] - 1) * .06, 0, (seeds[i][1] - 1) * .25); im.setColorAt(i, c); });
  const write = (k) => { pts.forEach((p, i) => { d.position.set(p[0], p[1] + size * .4 * k, p[2]); d.rotation.set(0, seeds[i][0], 0); d.scale.setScalar(size * seeds[i][1] * (.35 + .65 * k)); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }); im.instanceMatrix.needsUpdate = true; };
  write(1);
  if (grow) { let last = -1; ctx.up.push((t, dt, p) => { const k = .35 + .65 * range(p, grow[0], grow[1]); if (Math.abs(k - last) < .002) return; last = k; write(k); }); }
  return add(par, im);
}
function Conveyor(par, a, b, y = .9, w = .7, legs = 1.5) {
  const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
  const g = add(par, new THREE.Group()); g.position.set((a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2); g.rotation.y = Math.atan2(-dz, dx);
  B(g, [0, 0, 0], [len, .05, w], M.rubber); B(g, [0, -.02, w / 2 + .04], [len, .16, .05], M.stainless); B(g, [0, -.02, -w / 2 - .04], [len, .16, .05], M.stainless);
  const rolls = []; for (let i = 0; i < Math.floor(len / .25); i++) rolls.push(TM(-len / 2 + i * .25 + .12, -.06, 0, Math.PI / 2));
  if (rolls.length) Instanced(g, new THREE.CylinderGeometry(.04, .04, w, 10), M.steel, rolls, false);
  const n = Math.max(1, Math.round(len / legs));
  for (let i = 0; i <= n; i++) { B(g, [-len / 2 + (i * len) / n, -y / 2, w / 2], [.06, y, .06], M.stainless); B(g, [-len / 2 + (i * len) / n, -y / 2, -w / 2], [.06, y, .06], M.stainless); }
}
function Movers(ctx, par, pts, o = {}) {
  const { count = 20, speed = .4, kind = 'fruit', color = '#d98a2f', size = .09 } = o;
  const curve = polyCurve(pts), len = curve.getLength();
  const geo = kind === 'fruit' ? new THREE.SphereGeometry(size, 14, 10) : new THREE.BoxGeometry(size * 5, size * 3, size * 4);
  const im = new THREE.InstancedMesh(geo, kind === 'fruit' ? M.fruit : kind === 'box' ? M.carton : M.crate, count); im.castShadow = true; im.frustumCulled = false;
  if (kind === 'fruit') { const R = rng(count * 13), bc = new THREE.Color(color), c = new THREE.Color(); for (let i = 0; i < count; i++) { c.copy(bc).offsetHSL((R() - .5) * .05, 0, (R() - .5) * .12); im.setColorAt(i, c); } }
  const d = new THREE.Object3D(), tan = new THREE.Vector3();
  ctx.up.push((t) => {
    const t0 = (t * speed) / len;
    for (let i = 0; i < count; i++) { const u = (i / count + t0) % 1; curve.getPointAt(u, d.position); curve.getTangentAt(u, tan); d.rotation.set(kind === 'fruit' ? u * 40 : 0, Math.atan2(-tan.z, tan.x), 0); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }
    im.instanceMatrix.needsUpdate = true;
  });
  return add(par, im);
}
function AirFlow(ctx, par, min, max, o = {}) {
  const { count = 120, speed = 2, color = '#cfe6ff', dir = [1, 0, 0], len = .5 } = o;
  const R = rng(count * 31); const seeds = Array.from({ length: count }, () => [R(), R(), R()]);
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .012, .012), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .35, depthWrite: false }), count); im.frustumCulled = false;
  const d = new THREE.Object3D(), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), V(dir).normalize());
  const ext = [max[0] - min[0], max[1] - min[1], max[2] - min[2]], ax = Math.abs(dir[0]) > .5 ? 0 : Math.abs(dir[1]) > .5 ? 1 : 2, sign = dir[ax] >= 0 ? 1 : -1;
  ctx.up.push((t) => {
    const tt = t * speed;
    for (let i = 0; i < count; i++) { const s = seeds[i]; const pos = [min[0] + s[0] * ext[0], min[1] + s[1] * ext[1], min[2] + s[2] * ext[2]];
      const f = ((s[ax] * ext[ax] + tt * (.7 + s[(ax + 1) % 3] * .6)) % ext[ax]) / ext[ax]; pos[ax] = sign > 0 ? min[ax] + f * ext[ax] : max[ax] - f * ext[ax];
      d.position.set(pos[0], pos[1], pos[2]); d.quaternion.copy(q); d.scale.set(len, 1, 1); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }
    im.instanceMatrix.needsUpdate = true;
  });
  return add(par, im);
}
function Tank(par, p, r, h, m, horizontal = false, dome = true) {
  const g = add(par, new THREE.Group()); g.position.set(p[0], p[1], p[2]); if (horizontal) g.rotation.z = Math.PI / 2;
  C(g, [0, h / 2, 0], r, h, m, null, null, 32);
  if (dome) add(g, mesh(new THREE.SphereGeometry(r, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), m, [0, h, 0]));
  if (horizontal) add(g, mesh(new THREE.SphereGeometry(r, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), m, [0, 0, 0], [Math.PI, 0, 0]));
  return g;
}
function Water(ctx, par, p, s) { const o = add(par, mesh(new THREE.PlaneGeometry(s[0], s[1]), M.water, p, [-Math.PI / 2, 0, 0], false)); ctx.up.push((t) => { o.position.y = p[1] + Math.sin(t * 1.4 + p[0]) * .01; }); }
function Spinner(ctx, par, p, r, h, axis, speed, m) {
  const g = add(par, new THREE.Group()); g.position.set(p[0], p[1], p[2]);
  if (axis === 'x') g.rotation.z = Math.PI / 2; if (axis === 'z') g.rotation.x = Math.PI / 2;
  const inner = add(g, new THREE.Group()); inner.add(mesh(new THREE.CylinderGeometry(r, r, h, 10), m)); inner.add(mesh(new THREE.BoxGeometry(r * .3, h * .98, r * .3), M.frame, [r * .6, 0, 0]));
  ctx.up.push((t, dt) => { inner.rotation.y += dt * speed; });
}

/* ---------- scenes for the NOVAPROJE site ---------- */
const STAGES = {};
function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(214,236,150,1)'); r.addColorStop(.25, 'rgba(141,180,58,.55)'); r.addColorStop(1, 'rgba(141,180,58,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
function tentBarn(par, p, L = 30, R = 7.5) {
  const g = add(par, new THREE.Group()); g.position.set(p[0], p[1], p[2]);
  const mem = new THREE.MeshStandardMaterial({ color: '#eef1ec', roughness: .75, side: THREE.DoubleSide });
  const shell = mesh(new THREE.CylinderGeometry(R, R, L, 40, 1, true, 0, Math.PI), mem, [0, 0, 0], [0, 0, Math.PI / 2]); add(g, shell);
  for (let i = 0; i <= 6; i++) add(g, mesh(new THREE.TorusGeometry(R + .03, .07, 6, 40, Math.PI), M.frame, [-L / 2 + (i * L) / 6, 0, 0], [0, Math.PI / 2, 0]));
  [-1, 1].forEach((s) => add(g, mesh(new THREE.CircleGeometry(R, 40, 0, Math.PI), mem, [s * L / 2, 0, 0], [0, Math.PI / 2, 0])));
  return g;
}
function solarRows(par, p, rows, cols, rot = 0) {
  const g = add(par, new THREE.Group()); g.position.set(p[0], p[1], p[2]); g.rotation.y = rot;
  const mat = new THREE.MeshPhysicalMaterial({ color: '#1b2836', metalness: .6, roughness: .2, clearcoat: 1 });
  const a = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) a.push(TM(c * 1.15, .9, r * 2.8, -.5));
  Instanced(g, new THREE.BoxGeometry(1.1, .05, 1.9), mat, a);
  for (let r = 0; r < rows; r++) B(g, [(cols - 1) * .575, .45, r * 2.8], [cols * 1.15, .9, .08], M.galvanized);
  return g;
}

/* HERO: farm campus on a plinth, wrapped by a glowing lime orbit */
STAGES.hero = { theme: 'dark', build(ctx) {
  const S = ctx.root, mob = ctx.mobile;
  C(S, [0, -.6, 0], 30, 1.2, new THREE.MeshStandardMaterial({ color: '#0d1d15', roughness: .55, metalness: .35 }), null, null, 96);
  add(S, mesh(new THREE.RingGeometry(29.6, 30, 128), new THREE.MeshBasicMaterial({ color: '#8db43a', transparent: true, opacity: .45, side: THREE.DoubleSide }), [0, .02, 0], [-Math.PI / 2, 0, 0], false));
  const sh = add(S, new THREE.Group()); sh.position.set(-6, 0, -6); sh.scale.setScalar(.62);
  Shed(ctx, sh, { L: 26, W: 13, H: 3.2, ridge: 1.9, bays: 6, wallH: 1.5, curtain: true, front: [2, 3], roof: [2, 3] });
  tentBarn(S, [-6, 0, 6], 18, 4.6);
  const gh = add(S, new THREE.Group()); gh.position.set(12, 0, 4);
  B(gh, [0, 1.5, 0], [10, 3, 7], M.glass, null, false); for (let i = 0; i <= 5; i++) B(gh, [-5 + i * 2, 1.5, 0], [.08, 3, 7], M.galvanized);
  for (let i = 0; i < 5; i++) B(gh, [0, .45, -2.6 + i * 1.3], [9, .1, .4], M.accent);
  const cs = add(S, new THREE.Group()); cs.position.set(12, 0, -8); B(cs, [0, 2, 0], [8, 4, 6], M.panelWhite); B(cs, [-2, 4.25, 0], [1.8, .5, 2.2], M.machineLight);
  Fan(ctx, cs, [-2, 4.52, -.5], { r: [-Math.PI / 2, 0, 0], radius: .32 }); Fan(ctx, cs, [-2, 4.52, .5], { r: [-Math.PI / 2, 0, 0], radius: .32 });
  [0, 2.6].forEach((dz) => { Tank(S, [-19, 1.4, -4 + dz], .95, 3.6, M.galvanized); C(S, [-19, .7, -4 + dz], .95, 1.4, M.galvanized, null, .18); });
  solarRows(S, [2, 0, 14], 3, 7);
  const sheep = scatter(mob ? 10 : 22, -14, 2, 9, 14, Math.PI / 2, 7, 3).map((s) => ({ ...s, x: s.x * .9 }));
  Herd(ctx, S, 'sheep', sheep);
  // the orbit
  const orbit = add(S, new THREE.Group()); orbit.rotation.set(.42, 0, -.18);
  const ring = add(orbit, new THREE.Mesh(new THREE.TorusGeometry(34, .09, 8, 240), new THREE.MeshBasicMaterial({ color: '#8db43a' })));
  ring.rotation.x = Math.PI / 2;
  const ring2 = add(orbit, new THREE.Mesh(new THREE.TorusGeometry(36.5, .03, 6, 240), new THREE.MeshBasicMaterial({ color: '#3f5a22', transparent: true, opacity: .7 }))); ring2.rotation.x = Math.PI / 2;
  const glowMat = new THREE.SpriteMaterial({ map: glowTexture(), color: '#ffffff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const head = add(orbit, new THREE.Sprite(glowMat)); head.scale.setScalar(9);
  const trail = []; for (let i = 0; i < 26; i++) { const s = add(orbit, new THREE.Sprite(glowMat.clone())); s.material.opacity = (1 - i / 26) * .55; s.scale.setScalar(5 - i * .14); trail.push(s); }
  const dust = new THREE.BufferGeometry(); const R = rng(9), pts = new Float32Array(600 * 3);
  for (let i = 0; i < 600; i++) { const a = R() * Math.PI * 2, r = 40 + R() * 60; pts[i * 3] = Math.cos(a) * r; pts[i * 3 + 1] = (R() - .3) * 40; pts[i * 3 + 2] = Math.sin(a) * r; }
  dust.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  const stars = add(S, new THREE.Points(dust, new THREE.PointsMaterial({ color: '#7f9a6a', size: .18, transparent: true, opacity: .7 })));
  const lime = add(S, new THREE.PointLight('#8db43a', 1.2, 90, 1.5));
  ctx.up.push((t, dt, p) => {
    const a = t * .35; head.position.set(Math.cos(a) * 34, 0, Math.sin(a) * 34); lime.position.copy(head.position).applyEuler(orbit.rotation);
    trail.forEach((s, i) => { const b = a - (i + 1) * .045; s.position.set(Math.cos(b) * 34, 0, Math.sin(b) * 34); });
    orbit.rotation.x = .42 + p * .5; stars.rotation.y = t * .01;
  });
  return mob
    ? [{ at: 0, p: [0, 46, 96], t: [0, 2, 0] }, { at: 1, p: [0, 30, 50], t: [0, 0, 0] }]
    : [{ at: 0, p: [10, 34, 72], t: [-16, 4, 0] }, { at: 1, p: [26, 22, 36], t: [-4, 0, 0] }];
} };

/* BUILD: steel frame rises, walls close, roof lands, animals move in */
STAGES.build = { theme: 'light', build(ctx) {
  const S = ctx.root;
  const frame = add(S, new THREE.Group());
  Shed(ctx, frame, { L: 26, W: 13, H: 3.2, ridge: 1.9, bays: 6, wallH: 1.5, curtain: true, front: [.55, .3], roof: [.78, .52] });
  ctx.up.push((t, dt, p) => { frame.scale.y = Math.max(.001, range(p, .02, .26)); });
  // a mobile crane that holds the roof while it lands
  const cr = add(S, new THREE.Group()); cr.position.set(19, 0, -4);
  B(cr, [0, .7, 0], [5, 1.1, 2.6], M.yellow); B(cr, [1.6, 1.8, 0], [1.6, 1.4, 2.2], M.machineLight);
  [-1.6, 0, 1.6].forEach((x) => [-1.2, 1.2].forEach((z) => C(cr, [x, .45, z], .45, .35, M.rubber, [Math.PI / 2, 0, 0])));
  const boom = add(cr, new THREE.Group()); boom.position.set(-1, 1.4, 0);
  B(boom, [-7.5, 0, 0], [15, .45, .45], M.yellow);
  const cable = add(cr, mesh(new THREE.CylinderGeometry(.03, .03, 1, 6), M.frame, null, null, false));
  ctx.up.push((t, dt, p) => {
    const k = range(p, .5, .8), rz = -(.62 - k * .22); boom.rotation.z = rz;
    const tx = boom.position.x - 15 * Math.cos(rz), ty = boom.position.y - 15 * Math.sin(rz), len = 2.4 + k * 3.2;
    cable.scale.y = len; cable.position.set(tx, ty - len / 2, 0);
    cr.visible = p < .95;
  });
  const sheep = []; for (let i = 0; i < 3; i++) { const x0 = -12 + i * 6.3; sheep.push(...scatter(7, x0 + .4, x0 + 5.6, 1.9, 5.6, Math.PI / 2, 11 + i, 1.6), ...scatter(7, x0 + .4, x0 + 5.6, -5.6, -1.9, -Math.PI / 2, 41 + i, 1.6)); }
  const herd = add(S, new THREE.Group()); Herd(ctx, herd, 'sheep', sheep);
  B(S, [-3, .03, 0], [19, .05, 2.6], M.concrete);
  [1.55, -1.55].forEach((z) => { B(S, [-3, .2, z], [18.7, .4, .6], M.concrete); B(S, [-3, .44, z], [18.7, .1, .42], M.feed); });
  ctx.up.push((t, dt, p) => { const k = range(p, .82, .98); herd.visible = k > .01; herd.position.x = (1 - k) * -24; });
  ctx.chips = (p) => [p > .02, p > .3, p > .55, p > .82];
  return ctx.mobile
    ? [{ at: 0, p: [30, 20, 40], t: [2, 1, 0] }, { at: 1, p: [24, 13, 30], t: [0, 1, 0] }]
    : [{ at: 0, p: [26, 13, 30], t: [4, 2.5, 0] }, { at: .5, p: [22, 11, 26], t: [2, 2, 0] }, { at: 1, p: [16, 9, 22], t: [0, 1.5, 0] }];
} };

/* SERVICES: tractor + feed mixer wagon drives across the band */
function wheel(par, p, r, w) {
  const g = add(par, new THREE.Group()); g.position.set(p[0], p[1], p[2]);
  const tire = add(g, mesh(new THREE.CylinderGeometry(r, r, w, 28), M.rubber, null, [Math.PI / 2, 0, 0]));
  add(g, mesh(new THREE.CylinderGeometry(r * .55, r * .55, w + .02, 20), M.yellow, null, [Math.PI / 2, 0, 0]));
  const lugs = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; lugs.push(TM(Math.cos(a) * r, Math.sin(a) * r, 0, 0, 0, a)); }
  Instanced(g, new THREE.BoxGeometry(.08, .12, w * 1.02), M.rubber, lugs);
  return g;
}
STAGES.tractor = { theme: 'clear', build(ctx) {
  const S = ctx.root, v = add(S, new THREE.Group());
  const body = new THREE.MeshStandardMaterial({ color: '#2f6b3a', metalness: .45, roughness: .35 });
  const lime = new THREE.MeshStandardMaterial({ color: '#8db43a', metalness: .3, roughness: .4 });
  // tractor (faces +x)
  const tr = add(v, new THREE.Group()); tr.position.x = 5.2;
  B(tr, [.9, 1.45, 0], [3.4, 1.1, 1.3], body); B(tr, [2.65, 1.3, 0], [.12, .8, 1.2], M.frame);
  B(tr, [-.7, 1.05, 0], [1.8, .5, 1.5], M.frame);
  const cab = add(tr, new THREE.Group()); cab.position.set(-.7, 2.55, 0);
  B(cab, [0, 0, 0], [1.9, 1.7, 1.7], M.glass, null, false);
  [[-.92, -.82], [-.92, .82], [.92, -.82], [.92, .82]].forEach(([x, z]) => B(cab, [x, 0, z], [.08, 1.7, .08], M.frame));
  B(cab, [0, .9, 0], [2.1, .12, 1.9], body); B(cab, [0, .97, 0], [2.0, .05, 1.8], lime);
  C(tr, [1.9, 2.5, .35], .07, 1.3, M.frame); B(tr, [-.1, 1.55, 0], [.6, .3, 1.6], lime);
  const tw = [wheel(tr, [-1.1, 1.05, .95], 1.05, .55), wheel(tr, [-1.1, 1.05, -.95], 1.05, .55), wheel(tr, [1.9, .62, .8], .62, .38), wheel(tr, [1.9, .62, -.8], .62, .38)];
  // drawbar + mixer wagon
  B(v, [2.6, .75, 0], [2.2, .12, .12], M.frame);
  const wg = add(v, new THREE.Group()); wg.position.x = -.6;
  B(wg, [0, .9, 0], [4.4, .3, 1.8], M.frame);
  add(wg, mesh(new THREE.CylinderGeometry(1.45, 1.05, 1.9, 36, 1, true), M.galvanized, [0, 2.0, 0]));
  add(wg, mesh(new THREE.CircleGeometry(1.05, 36), M.galvanized, [0, 1.06, 0], [-Math.PI / 2, 0, 0]));
  add(wg, mesh(new THREE.TorusGeometry(1.45, .05, 6, 40), lime, [0, 2.95, 0], [Math.PI / 2, 0, 0]));
  const aug = add(wg, mesh(new THREE.ConeGeometry(.9, 1.6, 7), M.steel, [0, 1.9, 0]));
  B(wg, [1.2, 1.1, .95], [.6, .3, .1], M.steel); B(wg, [-1.6, 1.3, 0], [.6, .6, 1.5], body);
  const ww = [wheel(wg, [-.7, .55, 1.05], .55, .4), wheel(wg, [-.7, .55, -1.05], .55, .4), wheel(wg, [.6, .55, 1.05], .55, .4), wheel(wg, [.6, .55, -1.05], .55, .4)];
  const shadow = add(S, mesh(new THREE.PlaneGeometry(400, 40), new THREE.ShadowMaterial({ opacity: .22 }), [0, 0, 0], [-Math.PI / 2, 0, 0], false)); shadow.receiveShadow = true;
  let lastX = null;
  ctx.up.push((t, dt, p) => {
    const span = ctx.mobile ? 26 : 42; const x = -span + p * span * 2.2; v.position.x = x;
    const dx = lastX == null ? 0 : x - lastX; lastX = x;
    tw.forEach((w, i) => (w.rotation.z -= dx / (i < 2 ? 1.05 : .62))); ww.forEach((w) => (w.rotation.z -= dx / .55));
    aug.rotation.y += dt * 1.5; v.position.y = Math.abs(Math.sin(t * 9)) * .015;
  });
  return [{ at: 0, p: [0, 2.2, ctx.mobile ? 30 : 24], t: [0, 4.6, 0] }, { at: 1, p: [0, 2.2, ctx.mobile ? 30 : 24], t: [0, 4.6, 0] }];
} };

/* AERIAL: the 400-head farm seen from above, camera descends */
STAGES.aerial = { theme: 'green', build(ctx) {
  const S = ctx.root, mob = ctx.mobile, L = 190, W = 46;
  const R = rng(21), fieldCols = ['#1e4a31', '#2a5a35', '#3d6b33', '#5a7a3a', '#24503a'];
  for (let i = 0; i < 26; i++) { const w = 40 + R() * 80, d = 30 + R() * 60; const x = (R() - .5) * 600, z = (R() - .5) * 500;
    if (Math.abs(z) < 70 && Math.abs(x) < 130) continue; B(S, [x, -.15, z], [w, .02, d], new THREE.MeshStandardMaterial({ color: fieldCols[i % 5], roughness: 1 }), null, false); }
  B(S, [0, -.12, 0], [L, .04, W], new THREE.MeshStandardMaterial({ color: '#3f7a4f', roughness: 1 }), null, false);
  B(S, [0, -.1, W / 2 + 6], [600, .05, 7], M.asphalt, null, false);
  const wall = new THREE.MeshStandardMaterial({ color: '#c9ccc4', roughness: .9 });
  B(S, [0, 1, -W / 2], [L, 2, .3], wall); B(S, [-L / 2, 1, 0], [.3, 2, W], wall); B(S, [L / 2, 1, 0], [.3, 2, W], wall);
  B(S, [(-L / 2 - 34) / 2, 1, W / 2], [L / 2 - 34, 2, .3], wall); B(S, [(L / 2 - 26) / 2, 1, W / 2], [L / 2 + 26, 2, .3], wall);
  B(S, [-30, 1.1, W / 2 + .4], [8, 2.2, .15], M.frame);
  const pave = new THREE.MeshStandardMaterial({ color: '#b7b9b0', roughness: .95 });
  B(S, [-30, -.05, 19], [7, .06, 8], pave); B(S, [-10, -.05, 17.5], [130, .06, 5], pave);
  for (let x = -70; x <= 50; x += 12) { C(S, [x, 2.5, 20.4], .08, 5, M.frame); B(S, [x, 5, 20.1], [.25, .12, .7], M.led); }
  const an = add(S, new THREE.Group()); an.position.set(-30, 0, 9.5);
  B(an, [0, 3.1, 0], [10, 6.2, 7], M.panelWhite); B(an, [0, 3.1, 3.52], [8.4, .7, .05], M.hdpe); B(an, [0, .9, 3.52], [8.4, .6, .05], M.hdpe);
  B(an, [5.6, 3.1, -1], [1.2, .2, 4.2], M.frame, [.0, 0, -.55]);
  solarRows(an, [-3.5, 6.2, -2.6], 2, 7);
  tentBarn(S, [-30, 0, -8], 30, 7.5);
  B(S, [-30, 0, -8], [30.4, .12, 15.4], M.concrete);
  Fence(S, [-15, -15], [0, -15], { h: 1.2, posts: 3 }); Fence(S, [0, -15], [0, -1], { h: 1.2, posts: 3 }); Fence(S, [-15, -1], [0, -1], { h: 1.2, posts: 3 });
  B(S, [-7.5, -.08, -8], [15, .04, 14], M.soil, null, false);
  Herd(ctx, S, 'sheep', scatter(mob ? 26 : 48, -14, -1, -14, -2, 0, 31, 6.3));
  solarRows(S, [26, 0, 4], mob ? 3 : 4, 30);
  const bat = add(S, new THREE.Group()); bat.position.set(18, 0, 10); B(bat, [0, 1.3, 0], [6, 2.6, 2.4], M.machineLight); B(bat, [0, 2.65, 0], [6.1, .1, 2.5], M.accent);
  Tank(S, [-52, 0, -12], 2.2, 3, M.tankGreen);
  const keysD = [{ at: 0, p: [-12, 230, 40], t: [-12, 0, 0] }, { at: .55, p: [-20, 110, 70], t: [-20, 0, 0] }, { at: 1, p: [-6, 34, 46], t: [-27, 2, -3] }];
  const keysM = [{ at: 0, p: [-20, 300, 60], t: [-20, 0, 0] }, { at: .55, p: [-26, 150, 90], t: [-26, 0, 0] }, { at: 1, p: [-14, 46, 56], t: [-28, 2, -3] }];
  ctx.facts = (p) => p > .62;
  return mob ? keysM : keysD;
} };

/* ---------- project renders: each card gets a still rendered from its 3D model ---------- */
const RENDER = {};
function skyTex() { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#9fc3dd'); gr.addColorStop(.55, '#d7e6ee'); gr.addColorStop(1, '#eef1e8'); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
function grassTex(base, var1) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  const R = rng(77); for (let i = 0; i < 9000; i++) { g.fillStyle = R() > .5 ? var1 : 'rgba(0,0,0,.06)'; g.globalAlpha = .35 + R() * .4; g.fillRect(R() * 256, R() * 256, 1 + R() * 2, 1 + R() * 3); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(60, 60); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }
function trees(par, pts, R) { const leaf = new THREE.MeshStandardMaterial({ color: '#3d5a2f', roughness: .95 }), leaf2 = new THREE.MeshStandardMaterial({ color: '#4b6b35', roughness: .95 }), trunk = new THREE.MeshStandardMaterial({ color: '#5a4636', roughness: 1 });
  pts.forEach(([x, z], i) => { const s = 2.4 + R() * 2.2; C(par, [x, s * .55, z], .18 * s / 3, s * 1.1, trunk);
    for (let k = 0; k < 4; k++) add(par, mesh(new THREE.IcosahedronGeometry(s * (.55 + R() * .25), 1), k % 2 ? leaf : leaf2, [x + (R() - .5) * s * .8, s * 1.3 + R() * s * .7, z + (R() - .5) * s * .8])); }); }
function razorWall(par, a, b, h = 2) { const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), g = add(par, new THREE.Group());
  g.position.set((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2); g.rotation.y = Math.atan2(-dz, dx);
  B(g, [0, h / 2, 0], [L, h, .25], new THREE.MeshStandardMaterial({ color: '#cfd1c9', roughness: .9 })); B(g, [0, h + .04, 0], [L, .08, .32], M.concrete);
  const coil = mesh(new THREE.TorusGeometry(.22, .012, 4, 12), M.steel); const mats = []; for (let x = -L / 2; x < L / 2; x += .18) mats.push(TM(x, h + .3, 0, 0, Math.PI / 2, 0));
  Instanced(g, coil.geometry, M.steel, mats, false); return g; }
function annex(par, p) { const g = add(par, new THREE.Group()); g.position.set(p[0], p[1], p[2]);
  const plaster = new THREE.MeshStandardMaterial({ color: '#ece8df', roughness: .85 }), glass = new THREE.MeshPhysicalMaterial({ color: '#2b3a40', metalness: .3, roughness: .08, clearcoat: 1 });
  B(g, [0, 3.1, 0], [10, 6.2, 7], plaster); B(g, [0, 6.3, 0], [10.4, .2, 7.4], M.frame);
  [-3, 0, 3].forEach((x) => { B(g, [x, 1.5, 3.52], [1.6, 1.3, .06], glass); B(g, [x, 4.6, 3.52], [1.6, 1.3, .06], glass); });
  B(g, [-4.2, 1.1, 3.52], [1, 2.2, .07], M.frame); B(g, [4.2, 1.1, -3.52], [1, 2.2, .07], M.frame);
  for (let i = 0; i < 14; i++) B(g, [5.6, .22 + i * .22, 1.6 - i * .26], [1.1, .06, .3], M.frame);
  B(g, [5.6, 3.15, -2.1], [1.2, .1, 1.6], M.frame); C(g, [6.15, 1.6, 0], .03, 3.2, M.steel);
  solarRows(g, [-4, 6.4, -2.6], 2, 8); return g; }

RENDER.agil400 = (S) => {
  const R = rng(5);
  B(S, [0, -.04, 33], [400, .05, 8], M.asphalt, null, false);
  B(S, [-40, -.03, 0], [130, .06, 46], new THREE.MeshStandardMaterial({ color: '#7d8f5a', roughness: 1 }), null, false);
  razorWall(S, [-105, 23], [-34, 23]); razorWall(S, [-26, 23], [25, 23]); razorWall(S, [25, 23], [25, -23]); razorWall(S, [-105, -23], [25, -23]);
  const gate = add(S, new THREE.Group()); gate.position.set(-30, 0, 23.3); B(gate, [0, 1.1, 0], [8, .1, .08], M.frame); B(gate, [0, 2.1, 0], [8, .1, .08], M.frame);
  for (let x = -3.9; x <= 3.9; x += .3) B(gate, [x, 1.1, 0], [.04, 2.1, .04], M.frame);
  C(S, [-34.4, 1.3, 23.3], .25, 2.6, M.concrete); C(S, [-25.6, 1.3, 23.3], .25, 2.6, M.concrete);
  const pave = new THREE.MeshStandardMaterial({ color: '#a9aba3', roughness: .95 });
  B(S, [-30, .02, 19.5], [8, .05, 7], pave); B(S, [-30, .02, 16], [60, .05, 5], pave);
  for (let x = -55; x <= 0; x += 11) { C(S, [x, 2.5, 18.9], .07, 5, M.frame); B(S, [x, 5, 18.6], [.22, .12, .7], M.frame); }
  annex(S, [-30, 0, 9.5]);
  tentBarn(S, [-30, 0, -8], 30, 7.5); B(S, [-30, .02, -8], [30.4, .1, 15.4], M.concrete);
  Fence(S, [-15, -15], [0, -15], { h: 1.2, posts: 2.5 }); Fence(S, [0, -15], [0, -1], { h: 1.2, posts: 2.5 }); Fence(S, [-15, -1], [0, -1], { h: 1.2, posts: 2.5 });
  B(S, [-7.5, -.01, -8], [15, .03, 14], M.soil, null, false);
  Herd({ up: [] }, S, 'sheep', scatter(46, -14, -1, -14, -2, 0, 31, 6.3));
  solarRows(S, [4, 0, 2], 4, 16);
  const bat = add(S, new THREE.Group()); bat.position.set(-8, 0, 12); B(bat, [0, 1.3, 0], [6, 2.6, 2.4], M.machineLight); B(bat, [0, 2.65, 0], [6.1, .1, 2.5], M.accent);
  trees(S, [[-70, -40], [-55, -46], [-20, -44], [10, -42], [40, -30], [48, 5], [-95, 40], [30, 46], [55, 40]], R);
  return { cam: [10, 21, 58], look: [-24, 2, -2], shadow: 60 };
};
RENDER.koyun100 = (S) => {
  const R = rng(8);
  B(S, [0, -.03, 0], [70, .06, 46], new THREE.MeshStandardMaterial({ color: '#80915c', roughness: 1 }), null, false);
  Shed({ up: [] }, S, { L: 24, W: 12, H: 3.2, ridge: 1.8, bays: 6, wallH: 1.4, curtain: true, front: [2, 3], roof: [2, 3] });
  const mr = add(S, new THREE.Group()); mr.position.set(15.5, 0, -2); B(mr, [0, 1.6, 0], [7, 3.2, 6], new THREE.MeshStandardMaterial({ color: '#ece8df', roughness: .85 })); B(mr, [0, 3.3, 0], [7.4, .2, 6.4], M.frame);
  B(mr, [-3.52, 1.1, 1.5], [.07, 2.2, 1], M.frame); B(mr, [1, 2, 3.03], [1.6, 1, .06], new THREE.MeshPhysicalMaterial({ color: '#2b3a40', roughness: .08, clearcoat: 1 }));
  Tank(S, [-16, 2.2, -4], 1.1, 4.2, M.galvanized); C(S, [-16, 1.4, -4], 1.1, 1.6, M.galvanized, null, .15);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => B(S, [-16 + a * .8, 1.1, -4 + b * .8], [.1, 2.2, .1], M.frame));
  Fence(S, [-12, 7], [6, 7], { h: 1.1, posts: 2 }); Fence(S, [-12, 7], [-12, 16], { h: 1.1, posts: 2 }); Fence(S, [6, 7], [6, 16], { h: 1.1, posts: 2 }); Fence(S, [-12, 16], [6, 16], { h: 1.1, posts: 2 });
  B(S, [-3, -.01, 11.5], [18, .03, 9], M.soil, null, false);
  Herd({ up: [] }, S, 'sheep', scatter(34, -11, 5, 8, 15, 0, 12, 6.3));
  const pit = add(S, new THREE.Group()); pit.position.set(-16, 0, 9); C(pit, [0, .6, 0], 3, 1.2, M.concrete, null, null, 40); add(pit, mesh(new THREE.CircleGeometry(2.85, 40), M.slurry, [0, 1.15, 0], [-Math.PI / 2, 0, 0], false));
  trees(S, [[-34, -22], [-20, -26], [4, -25], [26, -22], [36, 4], [-36, 14], [30, 22]], R);
  return { cam: [30, 13, 34], look: [0, 1.6, 2], shadow: 40 };
};
RENDER.kumes = (S) => {
  const R = rng(9);
  B(S, [0, -.03, 0], [80, .06, 60], new THREE.MeshStandardMaterial({ color: '#7f915b', roughness: 1 }), null, false);
  B(S, [0, .01, 0], [62, .04, 36], new THREE.MeshStandardMaterial({ color: '#b1b2aa', roughness: .95 }), null, false);
  const c1 = add(S, new THREE.Group()); c1.position.set(-14, 0, 9); Shed({ up: [] }, c1, { L: 18, W: 10, H: 2.8, ridge: 1.1, bays: 6, front: [2, 3], roof: [2, 3] });
  const c2 = add(S, new THREE.Group()); c2.position.set(4, 0, -8); Shed({ up: [] }, c2, { L: 40, W: 12, H: 2.9, ridge: 1.3, bays: 10, front: [2, 3], roof: [2, 3] });
  [[c1, 9, 10], [c2, 20, 12]].forEach(([g, hx, w]) => { [-1, 1].forEach((r) => [-w / 4, w / 4].forEach((z) => Fan({ up: [] }, g, [hx + .25, 1.4 + r * .65, z], { r: [0, Math.PI / 2, 0], radius: .55 }))); B(g, [-hx + 3, 1.2, w / 2 + .2], [5, 1.6, .12], M.pad); });
  [[-4, 12], [-1.6, 12]].forEach(([x, z]) => { Tank(S, [x, 2.6, z], .95, 3.6, M.galvanized); C(S, [x, 1.8, z], .95, 1.6, M.galvanized, null, .18); });
  Pipe(S, [[-1.6, 4.6, 12], [-5, 3.4, 10]], .09, M.galvanized);
  const er = add(S, new THREE.Group()); er.position.set(20, 0, 10); B(er, [0, 1.6, 0], [9, 3.2, 6], new THREE.MeshStandardMaterial({ color: '#ece8df', roughness: .85 })); B(er, [0, 3.3, 0], [9.4, .2, 6.4], M.frame); B(er, [-2, 1.1, 3.03], [2.4, 2.2, .06], M.frame);
  Fence(S, [-31, -18], [31, -18], { h: 1.8, posts: 3, rails: 4 }); Fence(S, [-31, 18], [31, 18], { h: 1.8, posts: 3, rails: 4 }); Fence(S, [-31, -18], [-31, 18], { h: 1.8, posts: 3, rails: 4 }); Fence(S, [31, -18], [31, 18], { h: 1.8, posts: 3, rails: 4 });
  trees(S, [[-40, -26], [-22, -30], [8, -29], [36, -25], [42, 8], [-42, 20], [26, 30]], R);
  return { cam: [44, 22, 46], look: [0, 1, 0], shadow: 48 };
};
RENDER.nft = (S) => {
  const R = rng(4), L = 10, W = 10, H = 3.6, RG = 1.5;
  B(S, [0, -.03, 0], [50, .06, 40], new THREE.MeshStandardMaterial({ color: '#80915c', roughness: 1 }), null, false);
  B(S, [0, -.02, 0], [L + 3, .06, W + 3], new THREE.MeshStandardMaterial({ color: '#b9b8ae', roughness: .95 }), null, false);
  B(S, [0, .05, 0], [L, .1, W], M.concrete);
  const xs = [-5, -2.5, 0, 2.5, 5], zs = [-5, 0, 5];
  xs.forEach((x) => zs.forEach((z) => B(S, [x, H / 2, z], [.08, H, .08], M.galvanized)));
  [-5, 5].forEach((z) => B(S, [0, H, z], [L, .12, .14], M.galvanized));
  B(S, [0, H / 2, -W / 2], [L, H, .02], M.glass, null, false); B(S, [0, H / 2, W / 2], [L, H, .02], M.glass, null, false);
  [-1, 1].forEach((s) => B(S, [s * L / 2, H / 2, 0], [.02, H, W], M.glass, null, false));
  const ang = Math.atan2(RG, W / 2), sl = Math.hypot(W / 2, RG);
  [-1, 1].forEach((sd) => { B(S, [0, H + RG / 2, sd * W / 4], [L, .02, sl], M.glass, [sd * ang, 0, 0], false); xs.forEach((x) => Beam(S, [x, H, sd * W / 2], [x, H + RG, 0], .06, M.galvanized, false)); });
  B(S, [0, H + RG, 0], [L, .08, .1], M.galvanized);
  [-1, 1].forEach((s) => { const sh = new THREE.Shape(); sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(0, RG); sh.closePath(); add(S, mesh(new THREE.ShapeGeometry(sh), M.glass, [s * L / 2, H, 0], [0, Math.PI / 2, 0], false)); });
  B(S, [3.0, H / 2, 0], [.06, H, W], M.panelWhite);
  const LV = [.55, 1.35, 2.15], rowsZ = [-3.4, -1.2, 1.2, 3.4], X0 = -4.6, X1 = 2.8, pts = [];
  rowsZ.forEach((z) => { [X0 + .2, (X0 + X1) / 2, X1 - .2].forEach((x) => B(S, [x, 1.25, z], [.05, 2.5, .05], M.galvanized));
    LV.forEach((y) => { [-.2, .2].forEach((c) => { B(S, [(X0 + X1) / 2, y, z + c], [X1 - X0, .07, .12], M.pvc); for (let x = X0 + .25; x < X1 - .1; x += .24) pts.push([x, y + .07, z + c]); }); }); });
  Plants({ up: [] }, S, pts, { size: .1, color: '#78b04e' });
  Tank(S, [4.05, .1, -2.6], .55, 1.6, M.tankGreen); B(S, [4.4, .9, 1.6], [.6, 1.6, .9], M.machineLight);
  Pipe(S, [[4.05, .45, -1.9], [3.4, .45, -1.9], [3.4, .45, -4.4], [X0 - .2, .45, -4.4], [X0 - .2, 2.3, -4.4]], .04, M.pipeBlue);
  B(S, [-5.02, 1.1, 2.2], [.06, 2.2, 1.6], M.frame);
  trees(S, [[-16, -12], [-10, -16], [8, -16], [16, -8], [18, 10], [-18, 8]], R);
  return { cam: [12.5, 6, 14.5], look: [-.5, 1.5, 0], shadow: 14 };
};

/* one offscreen "studio" renders stills on demand (project cards, dashboard banner, login) */
let studio = null;
function getStudio() {
  if (studio) return studio;
  const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.08; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  if (!M) buildMats();
  const es = new THREE.Scene(); es.background = new THREE.Color('#b9cbd6'); const pnl = (w, h, p, rot, c, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...p); m.rotation.set(...rot); es.add(m); };
  pnl(60, 20, [0, 18, -20], [0, 0, 0], '#ffffff', 1.6); pnl(30, 30, [0, 25, 0], [Math.PI / 2, 0, 0], '#eaf2ff', 1.5); pnl(40, 6, [0, 1, 20], [0, 0, 0], '#7d8f5a', .8);
  const pm = new THREE.PMREMGenerator(r), env = pm.fromScene(es, .04).texture; pm.dispose();
  const sky = skyTex(), grass = grassTex('#6f8450', '#8aa063'), cam = new THREE.PerspectiveCamera(30, 1.6, .1, 900);
  studio = { shot(key, W, H, golden) {
    const fn = RENDER[key]; if (!fn) return '';
    r.setSize(W, H, false); cam.aspect = W / H;
    const scene = new THREE.Scene(); scene.background = sky; scene.environment = env; scene.fog = new THREE.Fog(golden ? '#e9dcc4' : '#dfe8e6', 110, 360);
    scene.add(new THREE.HemisphereLight(golden ? '#f3e2c4' : '#e2edf6', '#5b6b45', golden ? .5 : .62));
    const sun = new THREE.DirectionalLight(golden ? '#ffd9a0' : '#fff0d6', golden ? 2.8 : 2.5); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -.0003; sun.shadow.normalBias = .02; scene.add(sun);
    const g = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshStandardMaterial({ color: '#ffffff', map: grass, roughness: 1 })); g.rotation.x = -Math.PI / 2; g.position.y = -.06; g.receiveShadow = true; scene.add(g);
    const root = new THREE.Group(); scene.add(root); const view = fn(root);
    const s = view.shadow; Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 220 }); sun.shadow.camera.updateProjectionMatrix();
    sun.position.set(view.look[0] + (golden ? 46 : 34), golden ? 22 : 40, view.look[2] + (golden ? 6 : 22)); sun.target.position.set(...view.look); scene.add(sun.target);
    cam.position.set(...view.cam); cam.lookAt(...view.look); cam.updateProjectionMatrix();
    r.render(scene, cam); const url = r.domElement.toDataURL('image/jpeg', .88);
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); (Array.isArray(o.material) ? o.material : o.material ? [o.material] : []).forEach((m) => { if (!SHARED.has(m)) m.dispose(); }); });
    return url;
  } };
  return studio;
}
const stillCache = {};
const stillQueue = [];
let stillBusy = false;
function renderStill(key, W = 1280, H = 800, golden = false) {
  const k = `${key}-${W}x${H}${golden ? '-g' : ''}`;
  if (stillCache[k]) return Promise.resolve(stillCache[k]);
  try { const s = sessionStorage.getItem('np-still-' + k); if (s) { stillCache[k] = s; return Promise.resolve(s); } } catch (e) {}
  return new Promise((res) => { stillQueue.push({ key, W, H, golden, k, res }); pumpStills(); });
}
function pumpStills() {
  if (stillBusy || !stillQueue.length) return; stillBusy = true;
  const job = stillQueue.shift();
  requestAnimationFrame(() => {
    let url = '';
    try { if (window.THREE) url = stillCache[job.k] || getStudio().shot(job.key, job.W, job.H, job.golden); } catch (e) { console.error(e); }
    if (url) { stillCache[job.k] = url; try { sessionStorage.setItem('np-still-' + job.k, url); } catch (e) {} }
    job.res(url); stillBusy = false; setTimeout(pumpStills, 30);
  });
}
function fillStills(root) {
  (root || document).querySelectorAll('[data-still]:not(.ready)').forEach((el) => renderStill(el.dataset.still, +el.dataset.w || 1280, +el.dataset.h || 800, el.dataset.golden === '1').then((url) => {
    if (!url) { el.classList.add('fail'); return; } const img = el.querySelector('img'); img.onload = () => el.classList.add('ready'); img.src = url; }));
}
function makeRenders() {
  document.querySelectorAll('[data-render]').forEach((slot) => renderStill(slot.dataset.render).then((url) => {
    if (!url) { slot.classList.add('fail'); return; }
    const img = new Image(); img.alt = slot.dataset.alt || ''; img.onload = () => slot.classList.add('ready'); img.src = url; slot.appendChild(img);
  }));
}

window.renderStill = renderStill;
})();
