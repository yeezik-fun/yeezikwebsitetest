// Sfondo ASCII a gradiente (ispirato a GradientASCII di React Bits), in JavaScript puro.
// Disegna caratteri su un <canvas>: luminosità da una "linea d'orizzonte" che ondeggia + rumore animato.
// Si ferma quando l'hero non è visibile o la scheda è nascosta; con "riduci movimento" disegna un solo fotogramma.
(function () {
  const canvas = document.querySelector('canvas.ascii-bg');
  if (!canvas) return;

  const cfg = {
    colors: ['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8'],
    characters: ' =+xX0S8#@',
    cellSize: 18,
    density: 0.8,
    glyphOpacity: 0.85,
    glow: 0.2,
    flicker: 0.2,
    softness: 0.5,
    scale: 1,
    flow: 0.5,
    speed: 1,
    gradientOpacity: 0.9,
    horizon: 0.42,        // altezza della linea d'orizzonte (0 = in alto, 1 = in basso)
    scrambleRadius: 0.1,
    mouseInteraction: true,
    clickEffect: 'wave',
    intro: true,
  };

  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const chars = [...cfg.characters];
  const LEVELS = 12; // sfumature di colore precalcolate

  // ---- colori ----
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const stops = cfg.colors.map(hex);
  function mix(t) {
    t = Math.min(1, Math.max(0, t)) * (stops.length - 1);
    const i = Math.min(stops.length - 2, Math.floor(t));
    const f = t - i;
    return stops[i].map((c, k) => Math.round(c + (stops[i + 1][k] - c) * f));
  }

  // ---- atlante dei caratteri: ogni carattere disegnato una volta per ogni sfumatura ----
  let atlas, cell, cols, rows, W, H;
  function buildAtlas() {
    cell = Math.round(cfg.cellSize * dpr);
    atlas = document.createElement('canvas');
    atlas.width = cell * chars.length;
    atlas.height = cell * LEVELS;
    const a = atlas.getContext('2d');
    a.font = `700 ${Math.round(cell * 0.78)}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    a.textAlign = 'center';
    a.textBaseline = 'middle';
    for (let l = 0; l < LEVELS; l++) {
      const [r, g, b] = mix(l / (LEVELS - 1));
      a.fillStyle = `rgb(${r},${g},${b})`;
      a.shadowColor = `rgba(${r},${g},${b},0.9)`;
      a.shadowBlur = cell * cfg.glow;
      chars.forEach((c, i) => a.fillText(c, i * cell + cell / 2, l * cell + cell / 2));
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = canvas.width = Math.max(1, Math.round(rect.width * dpr));
    H = canvas.height = Math.max(1, Math.round(rect.height * dpr));
    buildAtlas();
    cols = Math.ceil(W / cell);
    rows = Math.ceil(H / cell);
  }

  // ---- rumore liscio ----
  function hash(x, y) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  }
  function noise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }

  // ---- interazione ----
  const mouse = { x: -9, y: -9, on: false };
  const waves = [];
  const host = canvas.parentElement;
  if (cfg.mouseInteraction) {
    host.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
      mouse.on = true;
    });
    host.addEventListener('pointerleave', () => { mouse.on = false; });
  }
  if (cfg.clickEffect === 'wave') {
    host.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a, button')) return;
      const r = canvas.getBoundingClientRect();
      waves.push({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, t: performance.now() });
      if (waves.length > 4) waves.shift();
      if (!running) frame(performance.now());
    });
  }

  // ---- disegno ----
  const start = performance.now();
  function frame(now) {
    const t = ((now - start) / 1000) * cfg.speed;
    const intro = cfg.intro && !reduce ? Math.min(1, (now - start) / 1600) : 1;
    const ease = 1 - Math.pow(1 - intro, 3);
    const aspect = W / H;

    // sfondo a gradiente
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#060708';
    ctx.fillRect(0, 0, W, H);
    const hy = H * cfg.horizon;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    const [r0, g0, b0] = stops[0];
    const [r3, g3, b3] = stops[stops.length - 1];
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(Math.max(0, cfg.horizon - 0.22), `rgba(${r0},${g0},${b0},0.35)`);
    g.addColorStop(cfg.horizon, `rgba(${r3},${g3},${b3},0.45)`);
    g.addColorStop(Math.min(1, cfg.horizon + 0.3), `rgba(${r0},${g0},${b0},0.12)`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = cfg.gradientOpacity * ease;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // caratteri
    ctx.globalAlpha = cfg.glyphOpacity;
    const soft = 0.006 + cfg.softness * 0.03;
    const sr = cfg.scrambleRadius;
    for (let y = 0; y < rows; y++) {
      const v = (y + 0.5) / rows;
      for (let x = 0; x < cols; x++) {
        const u = (x + 0.5) / cols;
        const h = cfg.horizon + 0.035 * Math.sin(u * 5 + t * cfg.flow) + 0.02 * Math.sin(u * 11 - t * cfg.flow * 1.6);
        const d = v - h;
        let k = Math.exp(-(d * d) / soft) + (d < 0 ? 0.12 * Math.exp(d * 4) : 0.05 * Math.exp(-d * 6));
        const n = noise(u * 6 * cfg.scale * aspect + t * 0.25 * cfg.flow, v * 6 * cfg.scale - t * 0.12 * cfg.flow);
        k *= 0.45 + 0.9 * n;
        k *= cfg.density * 0.8;
        // comparsa iniziale: si apre partendo dall'orizzonte
        if (ease < 1) k *= Math.max(0, Math.min(1, (ease * 1.4 - Math.abs(d) * 2) * 2));
        if (cfg.flicker) k += (hash(x + t * 7.3, y - t * 3.1) - 0.5) * cfg.flicker * 0.25;

        let scramble = false;
        if (mouse.on) {
          const dx = (u - mouse.x) * aspect, dy = v - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < sr * aspect) { k += (1 - dist / (sr * aspect)) * 0.6; scramble = true; }
        }
        for (const w of waves) {
          const age = (now - w.t) / 1000;
          const dx = (u - w.x) * aspect, dy = v - w.y;
          const ring = Math.abs(Math.sqrt(dx * dx + dy * dy) - age * 0.9);
          if (ring < 0.05) k += (1 - ring / 0.05) * Math.max(0, 1 - age / 1.6) * 0.9;
        }

        if (k < 0.08) continue;
        k = Math.min(1, k);
        let ci = Math.min(chars.length - 1, Math.floor(k * chars.length));
        if (scramble) ci = 1 + Math.floor(hash(x * 3 + t * 20, y) * (chars.length - 1));
        if (ci === 0) continue;
        const li = Math.min(LEVELS - 1, Math.floor(k * LEVELS));
        ctx.drawImage(atlas, ci * cell, li * cell, cell, cell, x * cell, y * cell, cell, cell);
      }
    }
    for (let i = waves.length - 1; i >= 0; i--) if (now - waves[i].t > 1600) waves.splice(i, 1);

    if (running) raf = requestAnimationFrame(frame);
  }

  let running = false, raf = 0, visible = true;
  function play() {
    if (running || reduce || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize();
  frame(performance.now() + (reduce ? 2000 : 0));
  play();

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? play() : stop(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { resize(); if (!running) frame(performance.now()); }, 120);
  });
})();
