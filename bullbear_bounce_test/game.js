/* BullBear Bounce v2
   Core physics, scoring, powerups and entities ported from the
   live bullbeargames.com bundle (assets/index-DGDC2QUr.js).
   Presentation, difficulty curve, combo and juice are new. */
(() => {
  "use strict";

  const W = 400;
  const H = 700;
  const FRAME = 16.67;

  const PLAYER_W = 50;
  const PLAYER_H = 50;
  const START_X = W / 2;
  const START_Y = 100;
  const GRAVITY = 0.32;
  const BOUNCE_V = 12.52;
  const ROCKET_V = 28;
  const WEED_GRAVITY = 0.25;
  const MAX_FALL = 13.4;
  const ACCEL = 0.13; // ease-in responsiveness toward target speed
  const MAX_VX = 8.2;
  const FRICTION = 0.86;
  const SPRING_V = 18.78;
  const PERFECT_V = 14.31;
  const COIN_METERS = 5;
  const PERFECT_METERS = 4;
  const WRAP = 30;
  const PLAT_W = 70;
  const PLAT_H = 18;
  const CLOUD_ART_PAD = 12;
  const CLOUD_ART_W = 256;
  const POWER_SIZE = 40;
  const SCORE_DIV = 3;

  const WEED_MS = 5000;
  const ROCKET_MS = 1500;
  const SOLON_METERS = 225;
  const TELE_IN_MS = 400;
  const TELE_TRAVEL_MS = 260;
  const TELE_OUT_MS = 0;
  const TELE_LINGER_MS = 1000;
  const ZAP_START = 600;
  const ZAP_MS = 25000;
  const ZAP_CHARGES = 3;
  const ZAP_COOLDOWN = 400;
  const ZAP_METERS = 15;
  const ZAP_RANGE_X = 200;
  const ZAP_RANGE_Y = 420;
  const BOOST_PAD_CX = 127;
  const BOOST_PAD_CY = 26.5;
  const BOOST_PAD_W = 168;
  const BOOST_PAD_H = 48;
  const SQUASH_BOUNCE = 0.7;
  const SQUASH_ROCKET = 1.15;
  const SQUASH_SPEED = 0.1;

  const ZONE = { earth: 500, air: 1000, clouds: 1600, atmosphere: 2500 };
  const STORM_START = 700;
  const STORM_W = 55;
  const STORM_H = 35;
  const STORM_SPEED = 1.5;
  const STORM_KNOCK = -10;
  const MAX_PARTICLES = 110;
  const COMBO_WINDOW = 1100;

  const BEST_KEY = "bullbear_bounce_v2_best";
  const MUTE_KEY = "bullbear_bounce_v2_mute";
  const TRACK_KEY = "bullbear_bounce_v2_track_m";
  const MUSIC_VOL = 0.45;
  const MUSIC_FADE_MS = 700;
  const SONG_CUE_3 = 2.75;
  const SONG_CUE_2 = 3.52;
  const SONG_CUE_1 = 4.27;
  const SONG_CUE_GO = 5.0;
  const TRACKS = [
    { title: "BullBear Bounce", src: "assets/music.mp3" },
    { title: "BullBear to the Moon", src: "assets/bullbear_to_the_moon.mp3" }
  ];
  const SPACE_STEP = 1500;
  const SPACE_BLEND = 180;
  const SPACE_COUNT = 5;

  const ZONES = {
    earth: { top: "#6ec8f0", bottom: "#1f7a3a", accent: "#8B4513", label: "Earth" },
    air: { top: "#3a7ed0", bottom: "#7ec8f5", accent: "#FFFFFF", label: "Air" },
    clouds: { top: "#d8f0ff", bottom: "#f7fbff", accent: "#FFD700", label: "Clouds" },
    atmosphere: { top: "#151536", bottom: "#2c2c74", accent: "#a8b8ff", label: "Atmosphere" },
    space: { top: "#00010a", bottom: "#09091f", accent: "#FFD700", label: "Space" }
  };

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay");
  const hud = document.getElementById("hud");
  const hudScore = document.getElementById("hud-score");
  const hudZone = document.getElementById("hud-zone");
  const hudBest = document.getElementById("hud-best");
  const hudCombo = document.getElementById("hud-combo");
  const comboBar = document.getElementById("combo-bar");
  const comboFill = document.getElementById("combo-fill");
  const zoneBanner = document.getElementById("zone-banner");
  const hudCoins = document.getElementById("hud-coins");
  const pillShield = document.getElementById("pill-shield");
  const pillWeed = document.getElementById("pill-weed");
  const pillRocket = document.getElementById("pill-rocket");
  const pillZap = document.getElementById("pill-zap");
  const tWeed = document.getElementById("t-weed");
  const tRocket = document.getElementById("t-rocket");
  const warn = document.getElementById("warn");
  const touchHints = document.getElementById("touch-hints");
  const soundBtn = document.getElementById("sound-btn");
  const musicBtn = document.getElementById("music-btn");
  const musicMenu = document.getElementById("music-menu");
  const btnPlay = document.getElementById("btn-play");
  const btnHow = document.getElementById("btn-how");
  const howPanel = document.getElementById("how-panel");
  const howClose = document.getElementById("how-close");
  const howBody = document.getElementById("how-body");
  let howOpen = false;

  const images = { character: null, cloud: null, cloudBoost: null, cloudCracked: null, coin: null, shield: null, rocket: null, weed: null, solonchain: null, storm: null, hole: null, holeRing: null, zap: null, bg: {}, lm: {} };
  const décor = { earth: [], air: [], clouds: [], atmosphere: [], space: [] };

  let muted = localStorage.getItem(MUTE_KEY) === "1";
  let bestScore = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
  let trackIndex = (() => {
    const v = parseInt(localStorage.getItem(TRACK_KEY) || "1", 10);
    return v === 1 ? 1 : 0;
  })();
  let audioCtx = null;
  let music = null;
  let musicStarted = false;
  let fadingOut = null;

  let uiMode = "start";
  let status = "idle";
  let lastFrame = 0;
  let raf = 0;
  let nextPlatId = 1;
  let nextPowId = 1;

  const input = { left: false, right: false, touch: 0 };
  let bot = false;

  const state = {
    maxHeight: 0,
    cameraY: 0,
    shake: 0,
    glow: 0,
    combo: 0,
    maxCombo: 0,
    lastBounceAt: 0,
    powerUps: 0,
    startTime: 0,
    shownScore: 0,
    lastZone: "earth",
    bannerTimer: 0,
    coins: 0,
    lastMilestone: 0
  };
  let playerTrail = [];
  let lastMote = 0;
  let lastLine = 0;

  let player = null, platforms = [], powerUps = [], particles = [], floats = [], storms = [], coins = [], zaps = [], flashes = [];
  let lastZapAt = 0;
  let paused = false;
  let nextCoinId = 1;
  let teleport = null;

  function loadBest() {
    bestScore = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
  }
  function saveBest(score) {
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem(BEST_KEY, String(bestScore));
      return true;
    }
    return false;
  }
  function getScore() {
    return Math.floor(state.maxHeight / SCORE_DIV);
  }
  function zoneName(score) {
    if (score < ZONE.earth) return "earth";
    if (score < ZONE.air) return "air";
    if (score < ZONE.clouds) return "clouds";
    if (score < ZONE.atmosphere) return "atmosphere";
    return "space";
  }
  function zoneBlend(score) {
    const steps = [
      ["earth", "air", ZONE.earth],
      ["air", "clouds", ZONE.air],
      ["clouds", "atmosphere", ZONE.clouds],
      ["atmosphere", "space", ZONE.atmosphere]
    ];
    for (const [a, b, edge] of steps) {
      if (score < edge - 100) return { z1: a, z2: a, t: 0 };
      if (score < edge) return { z1: a, z2: b, t: (score - (edge - 100)) / 100 };
    }
    return { z1: "space", z2: "space", t: 0 };
  }
  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 0, g: 0, b: 0 };
  }
  function mixHex(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    const r = Math.round(A.r + (B.r - A.r) * t);
    const g = Math.round(A.g + (B.g - A.g) * t);
    const bl = Math.round(A.b + (B.b - A.b) * t);
    return `rgb(${r}, ${g}, ${bl})`;
  }
  function hasEffect(type) {
    const now = Date.now();
    return player.activeEffects.some((e) => e.type === type && now < e.startTime + e.duration);
  }
  function effectLeft(type) {
    const e = player.activeEffects.find((x) => x.type === type);
    if (!e) return 0;
    return Math.max(0, e.startTime + e.duration - Date.now());
  }
  function setEffect(eff) {
    player.activeEffects = player.activeEffects.filter((e) => e.type !== eff.type);
    player.activeEffects.push(eff);
    if (eff.type === "rocket") player.rocketCoast = true;
  }

  function platformGap(score) {
    const t = Math.min(1, score / 2800);
    const minG = 96 + t * 28;
    const maxG = 138 + t * 48;
    return minG + Math.random() * (maxG - minG);
  }
  function movingChance(score) {
    if (score < 160) return 0;
    if (score < 360) return 0.12;
    if (score < 800) return 0.26;
    if (score < 1600) return 0.36;
    return 0.46;
  }
  function powerChance(score) {
    if (score < 200) return 0.055;
    if (score < 1200) return 0.045;
    return 0.035;
  }
  function pickPower(score) {
    const e = Math.random();
    if (score >= ZAP_START) {
      if (e < 0.275) return "weed";
      if (e < 0.516) return "rocket";
      if (e < 0.705) return "solonchain";
      if (e < 0.860) return "shield";
      return "zap";
    }
    if (e < 0.32) return "weed";
    if (e < 0.60) return "rocket";
    if (e < 0.82) return "solonchain";
    return "shield";
  }
  function springChance(score) {
    if (score < 160) return 0;
    if (score < 600) return 0.10;
    return 0.14;
  }
  function makePlatform(x, y, score) {
    const moving = Math.random() < movingChance(score);
    const spring = !moving && Math.random() < springChance(score);
    return {
      id: nextPlatId++,
      x, y,
      width: PLAT_W,
      height: PLAT_H,
      type: moving ? "moving" : spring ? "spring" : "normal",
      broken: false,
      breakTime: 0,
      moveDirection: moving ? (Math.random() < 0.5 ? -1 : 1) : 0,
      moveSpeed: moving ? 1.5 : 0,
      moveRange: moving ? 60 : 0,
      initialX: x,
      hitCount: 0
    };
  }
  function maybeCoins(plat, score) {
    if (score < 40 || Math.random() > 0.30) return;
    const n = Math.random() < 0.35 ? 3 : 1;
    for (let i = 0; i < n; i++) {
      coins.push({
        id: nextCoinId++,
        x: plat.x + plat.width / 2 + (i - (n - 1) / 2) * 20,
        y: plat.y + 40 + Math.abs(i - (n - 1) / 2) * 10,
        r: 11,
        collected: false
      });
    }
  }
  function makePower(plat, score) {
    const sc = score != null ? score : plat.y / SCORE_DIV;
    return {
      id: nextPowId++,
      x: plat.x + plat.width / 2,
      y: plat.y + plat.height / 2 + POWER_SIZE / 2 + 5,
      width: POWER_SIZE,
      height: POWER_SIZE,
      type: pickPower(sc),
      collected: false,
      platformId: plat.id
    };
  }
  function makePlayer() {
    return {
      x: START_X,
      y: START_Y,
      vx: 0,
      vy: 0,
      width: PLAYER_W,
      height: PLAYER_H,
      squash: 1,
      activeEffects: [],
      facing: 1,
      rocketCoast: false
    };
  }
  function seedWorld() {
    nextPlatId = 1;
    nextPowId = 1;
    platforms = [];
    powerUps = [];
    particles = [];
    floats = [];
    storms = [];
    coins = [];
    zaps = [];
    flashes = [];
    lastZapAt = 0;
    nextCoinId = 1;
    const first = makePlatform(W / 2 - PLAT_W / 2, 50, 0);
    first.type = "normal";
    first.moveDirection = 0;
    first.moveSpeed = 0;
    platforms.push(first);
    let y = 50;
    while (y < H + 300) {
      y += platformGap(0);
      const x = Math.random() * (W - PLAT_W);
      const p = makePlatform(x, y, y / SCORE_DIV);
      platforms.push(p);
      if (Math.random() < powerChance(y / SCORE_DIV)) powerUps.push(makePower(p, y / SCORE_DIV));
      maybeCoins(p, y / SCORE_DIV);
    }
    player = makePlayer();
    state.maxHeight = 0;
    state.cameraY = 0;
    state.shake = 0;
    state.glow = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.lastBounceAt = 0;
    state.powerUps = 0;
    state.shownScore = 0;
    state.lastZone = "earth";
    state.bannerTimer = 0;
    state.coins = 0;
    state.lastMilestone = 0;
    playerTrail = [];
    paused = false;
    teleport = null;
  }
  function ensurePlatformsUpTo(target) {
    let maxY = platforms.reduce((m, p) => Math.max(m, p.y), 0);
    while (maxY < target) {
      const score = maxY / SCORE_DIV;
      maxY += platformGap(score);
      const p = makePlatform(Math.random() * (W - PLAT_W), maxY, score);
      platforms.push(p);
      if (Math.random() < powerChance(score)) powerUps.push(makePower(p, score));
      maybeCoins(p, score);
    }
  }
  function extendPlatforms() {
    ensurePlatformsUpTo(state.cameraY + H + 200);
  }
  function stormSafeX(y) {
    const nearP = platforms.filter((p) => Math.abs(p.y - y) < 150);
    const nearS = storms.filter((s) => Math.abs(s.y - y) < 150);
    const blocked = [];
    for (const p of nearP) blocked.push({ start: p.x - 80, end: p.x + p.width + 80 });
    for (const s of nearS) blocked.push({ start: s.x - 120, end: s.x + s.width + 120 });
    blocked.sort((a, b) => a.start - b.start);
    const merged = [];
    for (const b of blocked) {
      if (!merged.length || merged[merged.length - 1].end < b.start) merged.push({ ...b });
      else merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, b.end);
    }
    const gaps = [];
    let cursor = 0;
    for (const b of merged) {
      if (b.start > cursor && b.start - cursor >= STORM_W + PLAYER_W + 20) {
        gaps.push({ start: cursor, end: b.start - STORM_W });
      }
      cursor = Math.max(cursor, b.end);
    }
    if (W > cursor && W - cursor >= STORM_W + PLAYER_W + 20) gaps.push({ start: cursor, end: W - STORM_W });
    if (!gaps.length) return null;
    const g = gaps[Math.floor(Math.random() * gaps.length)];
    return g.start + Math.random() * (g.end - g.start);
  }
  function stormKindAt(y) {
    return (y / SCORE_DIV >= ZONE.atmosphere) ? "hole" : "storm";
  }
  function makeStorm(x, y, vx) {
    return { x, y, width: STORM_W, height: STORM_H, vx, kind: stormKindAt(y) };
  }
  function isHole(s) {
    return !!(s && s.kind === "hole");
  }
  function stormLabel(s, action) {
    return (isHole(s) ? "BLACK HOLE " : "STORM ") + action;
  }
  function extendStorms() {
    const score = state.cameraY / SCORE_DIV;
    if (score < STORM_START) return;
    let maxY = storms.reduce((m, s) => Math.max(m, s.y), 0);
    let y = Math.max(maxY, state.cameraY + H);
    const target = state.cameraY + H + 300;
    const chance = 0.012 + Math.min(0.03, (score - STORM_START) / 8000);
    while (y < target) {
      y += 280 + Math.random() * 220;
      if (Math.random() < chance) {
        const x = stormSafeX(y);
        if (x !== null) {
          storms.push(makeStorm(x, y, (Math.random() < 0.5 ? -1 : 1) * STORM_SPEED));
        }
      }
    }
  }
  function cullWorld() {
    const minY = state.cameraY - 100;
    platforms = platforms.filter((p) => p.y > minY);
    const ids = new Set(platforms.map((p) => p.id));
    powerUps = powerUps.filter((p) => ids.has(p.platformId) && p.y > minY && !p.collected);
    storms = storms.filter((s) => s.y > minY);
    coins = coins.filter((c) => c.y > minY && !c.collected);
    particles = particles.filter((p) => p.y > minY && p.life > 0);
    floats = floats.filter((f) => f.life > 0);
  }

  function addParticles(list) {
    if (particles.length >= MAX_PARTICLES) return;
    for (const p of list) {
      if (particles.length >= MAX_PARTICLES) break;
      particles.push(p);
    }
  }
  function burst(x, y, n, color, type, speed, life) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = type === "bounce"
        ? Math.PI + (Math.random() - 0.5) * Math.PI * 0.8
        : (Math.PI * 2 * i) / n + Math.random() * 0.3;
      const s = speed * (0.6 + Math.random() * 0.8);
      out.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: life + Math.random() * life * 0.4,
        maxLife: life * 1.4,
        size: 3 + Math.random() * 4,
        color,
        type
      });
    }
    addParticles(out);
  }
  function holeBurst(cx, cy) {
    const impl = [];
    for (let i = 0; i < 22; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 30 + Math.random() * 36;
      impl.push({
        x: cx + Math.cos(a) * d,
        y: cy + Math.sin(a) * d,
        vx: -Math.cos(a) * (3.2 + Math.random() * 2.0),
        vy: -Math.sin(a) * (3.2 + Math.random() * 2.0),
        life: 220 + Math.random() * 100,
        maxLife: 320,
        size: 3.2 + Math.random() * 3.4,
        color: i % 3 === 0 ? "rgba(255,200,90,0.95)" : i % 3 === 1 ? "rgba(255,120,40,0.95)" : "rgba(50,18,8,0.95)",
        type: "mote"
      });
    }
    addParticles(impl);
    const pop = [];
    const cols = [
      "rgba(255,213,106,1)",
      "rgba(255,150,50,0.96)",
      "rgba(255,110,35,0.96)",
      "rgba(255,236,180,1)",
      "rgba(255,140,40,0.95)"
    ];
    for (let i = 0; i < 34; i++) {
      const a = (Math.PI * 2 * i) / 34 + Math.random() * 0.22;
      const sp = 3.4 + Math.random() * 4.6;
      const col = cols[i % cols.length];
      const typ = i % 4 === 0 ? "star" : i % 4 === 1 ? "shard" : "spark";
      pop.push({
        x: cx, y: cy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 480 + Math.random() * 280,
        maxLife: 780,
        size: typ === "star" ? 5.5 + Math.random() * 3.5 : 3.4 + Math.random() * 3.2,
        color: col,
        type: typ,
        rot: a,
        wait: 50 + Math.random() * 40
      });
    }
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      pop.push({
        x: cx, y: cy,
        vx: Math.cos(a) * (1.6 + Math.random() * 2.4),
        vy: Math.sin(a) * (1.6 + Math.random() * 2.4),
        life: 400 + Math.random() * 200,
        maxLife: 600,
        size: 4.5 + Math.random() * 3.0,
        color: i % 2 ? "rgba(255,200,90,0.85)" : "rgba(255,130,40,0.85)",
        type: "mote",
        wait: 40
      });
    }
    addParticles(pop);
  }
  function addFloat(x, y, text, color) {
    floats.push({ x, y, text, color: color || "#FFD700", life: 1400, maxLife: 1400, vy: 1.15 });
  }

  /* ---------- audio ---------- */
  const TRACK_BEATS = {"assets/music.mp3":[0.743,1.44,2.136,2.856,3.553,4.272,4.969,5.689,6.385,7.105,7.802,8.522,9.218,9.938,10.635,11.331,12.028,12.748,13.468,14.164,14.884,15.557,16.277,16.974,17.694,18.39,19.11,19.807,20.503,21.223,21.92,22.639,23.336,24.033,24.752,25.449,26.146,26.865,27.562,28.282,28.979,29.675,30.372,31.092,31.788,32.508,33.205,33.924,34.621,35.201,35.921,36.571,37.291,38.011,38.708,39.427,40.147,40.821,41.494,42.237,43.096,43.816,44.513,45.209,45.906,46.626,47.322,48.042,48.739,49.459,50.155,50.875,51.572,52.268,52.965,53.685,54.404,55.101,55.798,56.517,57.214,57.911,58.63,59.327,60.024,60.743,61.44,62.16,62.856,63.553,64.273,64.969,65.689,66.386,67.082,67.802,68.522,69.219,69.915,70.612,71.332,72.028,72.748,73.445,74.165,74.861,75.558,76.278,76.974,77.671,78.391,79.087,79.807,80.504,81.2,81.92,82.64,83.336,84.033,84.753,85.449,86.146,86.866,87.562,88.282,88.956,89.675,90.419,91.092,91.812,92.508,93.182,93.925,94.621,95.318,96.061,96.734,97.454,98.151,98.847,99.544,100.264,100.96,101.68,102.4,103.097,103.816,104.513,105.21,105.906,106.626,107.323,108.042,108.739,109.436,110.155,110.852,111.549,112.268,112.988,113.685,114.381,115.101,115.798,116.518,117.214,117.911,118.631,119.327,120.024,120.744,121.44,122.16,122.857,123.553,124.273,124.97,125.69,126.386,127.083,127.803,128.499,129.219,129.916,130.635,131.332,132.029,132.725,133.445,134.142,134.861,135.558,136.278,136.975,137.694,138.391,139.088,139.807,140.504,141.224,141.92,142.617,143.337,144.033,144.73,145.45,146.146,146.866,147.563,148.283,149.002,149.722,150.419,151.115,151.812,152.532,153.228,153.925,154.622,155.318,156.038,156.758,157.455,158.174,158.871,159.568,160.287,160.984,161.657,162.4,163.143,163.84,164.537,165.233,165.953,166.65,167.346,168.066,168.763,169.459,170.156,170.876,171.572,172.269,172.989,173.685,174.405,175.102,175.798,176.518,177.215,177.911,178.631,179.328,180.048,180.744,181.441,182.161,182.857,183.577,184.274,184.97,185.69,186.387,187.106,187.803,188.5,189.219,189.939,190.636,191.332,192.029,192.749,193.445,194.142,194.862,195.558,196.278,196.975,197.695,198.391,199.088,199.808,200.504,201.201,201.921,202.617,203.337,204.034,204.754,205.45,206.147,206.867,207.563,208.26,208.98,209.676,210.396,211.093,211.789,212.509,213.206,213.925,214.645,215.319,216.038,216.735,217.455,218.151,218.871,219.568,220.288,220.984,221.681,222.401,223.097,223.794,224.514,225.21,225.93,226.627,227.347,228.043,228.763,229.46,230.156,230.853,231.573,232.269,232.989,233.686,234.382,235.102,235.752,236.495,237.215,237.935,238.631,239.328,240.048,240.744,241.441,242.138,242.858,243.577,244.274,244.971,245.667,246.387,247.107,247.827,248.523,249.22,249.94,250.636,251.333,252.029,252.749,253.446,254.166,254.862,255.559,256.255,256.998,257.741,258.438,259.111,259.808,260.505,261.201,261.921,262.618,263.314,264.034,264.731,265.451,266.147,266.844,267.564,268.26,268.98,269.677,270.373,271.093,271.813,272.509,273.206,273.926,274.622,275.319,276.039,276.735,277.455,278.152,278.848],"assets/bullbear_to_the_moon.mp3":[0.418,0.813,1.207,1.602,1.974,2.345,2.717,3.111,3.483,3.878,4.272,4.667,5.039,5.433,5.805,6.177,6.571,6.943,7.361,7.732,8.104,8.475,8.893,9.265,9.66,10.031,10.426,10.82,11.192,11.564,11.958,12.353,12.725,13.096,13.514,13.886,14.257,14.652,15.047,15.418,15.813,16.184,16.579,16.974,17.345,17.717,18.135,18.506,18.901,19.273,19.667,20.062,20.434,20.805,21.2,21.571,21.966,22.338,22.732,23.104,23.499,23.87,24.288,24.66,25.031,25.426,25.821,26.192,26.564,26.958,27.353,27.725,28.119,28.491,28.886,29.28,29.652,30.023,30.395,30.79,31.184,31.579,31.974,32.369,32.74,33.112,33.506,33.878,34.273,34.644,35.039,35.434,35.805,36.177,36.548,36.943,37.361,37.732,38.127,38.522,38.893,39.265,39.66,40.031,40.426,40.797,41.192,41.587,41.958,42.33,42.725,43.096,43.491,43.886,44.28,44.652,45.047,45.418,45.813,46.184,46.579,46.951,47.345,47.74,48.112,48.483,48.878,49.25,49.667,50.039,50.434,50.805,51.2,51.572,51.966,52.338,52.733,53.104,53.499,53.894,54.265,54.66,55.055,55.403,55.821,56.192,56.587,56.982,57.353,57.725,58.12,58.491,58.886,59.257,59.652,60.047,60.418,60.813,61.208,61.579,61.974,62.346,62.74,63.112,63.507,63.878,64.273,64.668,65.039,65.411,65.805,66.2,66.572,66.966,67.361,67.733,68.127,68.499,68.894,69.288,69.66,70.031,70.426,70.821,71.192,71.564,71.959,72.353,72.725,73.12,73.514,73.886,74.281,74.652,75.047,75.442,75.813,76.185,76.579,76.974,77.346,77.717,78.112,78.507,78.878,79.273,79.644,80.039,80.434,80.805,81.2,81.595,81.966,82.338,82.733,83.127,83.499,83.87,84.265,84.66,85.031,85.426,85.821,86.192,86.587,86.959,87.353,87.748,88.12,88.491,88.886,89.281,89.652,90.024,90.442,90.813,91.185,91.58,91.974,92.346,92.717,93.112,93.507,93.901,94.273,94.645,95.039,95.434,95.829,96.177,96.549,96.943,97.338,97.733,98.128,98.499,98.894,99.265,99.66,100.032,100.426,100.798,101.193,101.587,101.982,102.33,102.748,103.12,103.515,103.886,104.281,104.652,105.047,105.419,105.813,106.208,106.58,106.974,107.369,107.741,108.112,108.484,108.878,109.273,109.645,110.039,110.434,110.806,111.2,111.572,111.967,112.361,112.733,113.104,113.499,113.894,114.289,114.66,115.055,115.426,115.798,116.193,116.587,116.959,117.33,117.725,118.097,118.515,118.886,119.258,119.652,120.024,120.419,120.813,121.185,121.58,121.951,122.346,122.717,123.089,123.484,123.878,124.25,124.645,125.016,125.411,125.782,126.177,126.572,126.967,127.315,127.71,128.104,128.499,128.894,129.242,129.66,130.032,130.426,130.798,131.193,131.587,131.982,132.354,132.725,133.12,133.515,133.886,134.281,134.653,135.047,135.419,135.814,136.185,136.58,136.975,137.346,137.718,138.112,138.507,138.879,139.273,139.668,140.04,140.434,140.806,141.201,141.595,141.967,142.338,142.733,143.128,143.523,143.894,144.289,144.66,145.055,145.427,145.821,146.193,146.588,146.959,147.354,147.749,148.12,148.492,148.886,149.281,149.653,150.024,150.419,150.814,151.208,151.58,151.975,152.346,152.741,153.112,153.507,153.902,154.297,154.645,155.04,155.434,155.829,156.201,156.595,156.967,157.338,157.733,158.128,158.499,158.894,159.266,159.66,160.055,160.427,160.798,161.193,161.588,161.959,162.354,162.749,163.12,163.492,163.886,164.281,164.653,165.047,165.419,165.814,166.208,166.603,166.998,167.369,167.741,168.112,168.484,168.879,169.273,169.645,170.017,170.434,170.806,171.201,171.572,171.967,172.362,172.733,173.105,173.523,173.894,174.266,174.637,175.032,175.427,175.798,176.193,176.588,176.982,177.354,177.726,178.12,178.492,178.887,179.258]};
  const musicNote = document.getElementById("music-note");
  let noteLevel = 0;
  function beatPulseLoop() {
    let target = 0;
    try {
      if (musicNote && music && !muted && !music.paused) {
        const src = (music.getAttribute("src") || "").replace(/^.*?(assets\/)/, "assets/");
        const beats = TRACK_BEATS[src];
        if (beats && beats.length) {
          const t = music.currentTime;
          let lo = 0, hi = beats.length - 1, idx = -1;
          while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (beats[mid] <= t) { idx = mid; lo = mid + 1; } else hi = mid - 1;
          }
          if (idx >= 0) target = Math.exp(-(t - beats[idx]) / 0.14);
        }
      }
    } catch (e) {}
    noteLevel += (target - noteLevel) * (target > noteLevel ? 0.6 : 0.25);
    if (musicNote) {
      const s = 1 + 0.32 * noteLevel;
      musicNote.style.transform = "scale(" + s.toFixed(3) + ")";
      musicNote.style.textShadow = noteLevel > 0.02 ? "0 0 " + (6 * noteLevel).toFixed(1) + "px rgba(255,220,120," + (0.75 * noteLevel).toFixed(2) + ")" : "";
    }
    requestAnimationFrame(beatPulseLoop);
  }
  requestAnimationFrame(beatPulseLoop);
  function makeTrackAudio(src) {
    const a = new Audio(src);
    a.loop = true;
    a.preload = "auto";
    a.volume = MUSIC_VOL;
    return a;
  }
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    if (!music) {
      music = makeTrackAudio(TRACKS[trackIndex].src);
    }
  }
  function startMusic() {
    if (muted) return;
    ensureAudio();
    music.volume = MUSIC_VOL;
    if (!musicStarted) {
      music.play().catch(() => {});
      musicStarted = true;
    } else if (music.paused) {
      music.play().catch(() => {});
    }
  }
  function setMuted(next) {
    muted = next;
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    soundBtn.textContent = muted ? "🔇" : "🔊";
    if (muted) {
      if (music) music.pause();
      if (fadingOut) { fadingOut.pause(); fadingOut = null; }
    } else if (status === "playing" || uiMode === "countdown") {
      startMusic();
    }
  }
  function updateTrackUI() {
    if (!musicMenu) return;
    musicMenu.querySelectorAll(".track-btn").forEach((btn) => {
      const i = parseInt(btn.getAttribute("data-track"), 10);
      const on = i === trackIndex;
      btn.classList.toggle("selected", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
  }
  function setMusicMenuOpen(open) {
    if (!musicMenu || !musicBtn) return;
    musicMenu.classList.toggle("open", open);
    musicBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  function selectTrack(i) {
    i = i === 1 ? 1 : 0;
    localStorage.setItem(TRACK_KEY, String(i));
    const changed = i !== trackIndex;
    trackIndex = i;
    updateTrackUI();
    setMusicMenuOpen(false);
    if (!changed && music) return;
    const playing = !muted && musicStarted && music && !music.paused;
    const next = makeTrackAudio(TRACKS[i].src);
    if (!playing) {
      if (music) {
        music.pause();
        music.removeAttribute("src");
        music.load();
      }
      if (fadingOut) { fadingOut.pause(); fadingOut = null; }
      music = next;
      musicStarted = false;
      return;
    }
    const prev = music;
    music = next;
    music.volume = 0;
    music.play().catch(() => {});
    if (fadingOut && fadingOut !== prev) {
      fadingOut.pause();
    }
    fadingOut = prev;
    const t0 = performance.now();
    const step = (now) => {
      if (fadingOut !== prev) return;
      const u = Math.min(1, (now - t0) / MUSIC_FADE_MS);
      const e = u * u * (3 - 2 * u);
      if (prev) prev.volume = MUSIC_VOL * (1 - e);
      if (music === next) music.volume = MUSIC_VOL * e;
      if (u < 1) requestAnimationFrame(step);
      else {
        if (prev) {
          prev.pause();
          prev.removeAttribute("src");
          prev.load();
        }
        if (fadingOut === prev) fadingOut = null;
        if (music === next) music.volume = MUSIC_VOL;
      }
    };
    requestAnimationFrame(step);
  }
  function beep(fn) {
    if (muted) return;
    ensureAudio();
    if (!audioCtx) return;
    fn(audioCtx);
  }
  function tone(ac, type, freq, dest, dur, gain, ramp) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, ac.currentTime);
    if (ramp) o.frequency.exponentialRampToValueAtTime(ramp, ac.currentTime + dur);
    g.gain.setValueAtTime(gain, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + dur);
    o.start(ac.currentTime);
    o.stop(ac.currentTime + dur);
  }
  function sfxBounce() {
    beep((ac) => {
      const f = 300 + Math.random() * 100;
      tone(ac, "sine", f, null, 0.15, 0.22, f * 0.8);
    });
  }
  function sfxWeed() {
    beep((ac) => {
      tone(ac, "sine", 400, null, 0.4, 0.16, 800);
      tone(ac, "triangle", 600, null, 0.35, 0.08, 1200);
    });
  }
  function sfxRocket() {
    beep((ac) => {
      tone(ac, "sawtooth", 80, null, 0.5, 0.12, 60);
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = "sine";
      o.frequency.setValueAtTime(200, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(1000, ac.currentTime + 0.15);
      o.frequency.exponentialRampToValueAtTime(500, ac.currentTime + 0.4);
      g.gain.setValueAtTime(0.16, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.4);
      o.start(); o.stop(ac.currentTime + 0.4);
    });
  }
  function sfxSolon() {
    beep((ac) => {
      [523, 659, 784].forEach((f, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(f, ac.currentTime);
        const t = i * 0.05;
        g.gain.setValueAtTime(0, ac.currentTime + t);
        g.gain.linearRampToValueAtTime(0.14, ac.currentTime + t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + t + 0.5);
        o.start(ac.currentTime + t);
        o.stop(ac.currentTime + t + 0.5);
      });
    });
  }
  function sfxWrap() {
    beep((ac) => tone(ac, "sine", 600, null, 0.1, 0.08, 400));
  }
  function sfxOver() {
    beep((ac) => tone(ac, "sine", 400, null, 0.8, 0.2, 100));
  }
  function sfxTick() {
    beep((ac) => tone(ac, "sine", 880, null, 0.12, 0.1, 660));
  }
  function sfxGo() {
    beep((ac) => tone(ac, "triangle", 523, null, 0.25, 0.12, 784));
  }
  function sfxZapPickup() {
    beep((ac) => {
      [660, 880, 1320].forEach((f, i) => {
        tone(ac, "sine", f, null, 0.22, 0.09, f * 1.15);
      });
    });
  }
  function sfxZap() {
    beep((ac) => {
      tone(ac, "sawtooth", 920, null, 0.18, 0.11, 180);
      tone(ac, "sine", 1400, null, 0.2, 0.1, 380);
      tone(ac, "triangle", 1900, null, 0.12, 0.07, 520);
    });
  }

  /* ---------- physics ---------- */
  function bouncePlayer() {
    player.vy = BOUNCE_V;
    player.squash = SQUASH_BOUNCE;
  }
  function rocketBoost() {
    player.vy = ROCKET_V;
    player.squash = SQUASH_ROCKET;
    player.rocketCoast = true;
  }
  function updatePlayer(dt) {
    const n = dt / FRAME;
    const now = Date.now();
    let grav = 1;
    for (const e of player.activeEffects) {
      if (e.type === "weed" && now < e.startTime + e.duration) grav = WEED_GRAVITY;
      if (e.type === "rocket" && now < e.startTime + e.duration) grav = 0;
    }
    player.vy -= GRAVITY * grav * n;
    if (player.vy < -MAX_FALL) player.vy = -MAX_FALL;
    player.x += player.vx * n;
    player.y += player.vy * n;
    if (!player.steering) player.vx *= Math.pow(FRICTION, n);
    player.steering = false;
    const leanT = -(player.vx / MAX_VX) * 0.16;
    player.lean = (player.lean || 0) + (leanT - (player.lean || 0)) * (1 - Math.pow(0.82, n));
    if (player.vx > 0.15) player.facing = 1;
    if (player.vx < -0.15) player.facing = -1;
    if (player.squash < 1) {
      player.squash += SQUASH_SPEED * n;
      if (player.squash > 1) player.squash = 1;
    } else if (player.squash > 1) {
      player.squash -= SQUASH_SPEED * n;
      if (player.squash < 1) player.squash = 1;
    }
    player.activeEffects = player.activeEffects.filter((e) => now < e.startTime + e.duration);
  }
  function applyInput(dir, dt) {
    const n = dt / FRAME;
    const target = dir * MAX_VX;
    // turning around eases a bit quicker so it never feels sluggish
    const k = (Math.sign(player.vx) !== dir && Math.abs(player.vx) > 0.5) ? ACCEL * 1.6 : ACCEL;
    player.vx += (target - player.vx) * (1 - Math.pow(1 - k, n));
  }
  function wrapPlayer() {
    let wrapped = 0;
    if (player.x < -WRAP) { player.x = W + WRAP; wrapped = 1; }
    else if (player.x > W + WRAP) { player.x = -WRAP; wrapped = -1; }
    return wrapped;
  }
  function landsOn(plat, prevY) {
    if (player.vy >= 0 || plat.broken) return false;
    const prevBottom = prevY - player.height / 2;
    const bot = player.y - player.height / 2;
    const top = plat.y + plat.height / 2;
    const crossed = prevBottom >= top && bot <= top;
    const near = !crossed && bot <= top && bot >= top - 15 && prevBottom > bot;
    if (!crossed && !near) return false;
    const left = player.x - player.width / 2;
    const right = player.x + player.width / 2;
    return right > plat.x + 5 && left < plat.x + plat.width - 5;
  }
  function findLanding(prevY) {
    let hit = null;
    let bestTop = -Infinity;
    for (const p of platforms) {
      if (landsOn(p, prevY)) {
        const top = p.y + p.height / 2;
        if (top > bestTop) { hit = p; bestTop = top; }
      }
    }
    if (hit) player.y = bestTop + player.height / 2;
    return hit;
  }
  function touchesPower(p) {
    if (p.collected) return false;
    return Math.abs(player.x - p.x) < (player.width + p.width) / 2 &&
           Math.abs(player.y - p.y) < (player.height + p.height) / 2;
  }
  function touchesStorm(s) {
    const l = player.x - player.width / 2;
    const r = player.x + player.width / 2;
    const t = player.y + player.height / 2;
    const b = player.y - player.height / 2;
    return r > s.x && l < s.x + s.width && t > s.y - s.height / 2 && b < s.y + s.height / 2;
  }

  function comboLabel(n) {
    if (n >= 20) return "LEGENDARY";
    if (n >= 15) return "INSANE";
    if (n >= 10) return "SICK";
    if (n >= 6) return "NICE";
    return "";
  }
  function onBounce(plat) {
    plat.hitCount++;
    if (plat.type === "spring") {
      player.vy = SPRING_V;
      player.padSmash = true;
      player.squash = 0.62;
      burst(player.x, plat.y + plat.height, 10, "rgba(255,213,106,0.9)", "spark", 4, 500);
      addFloat(player.x, player.y + 46, "BOOST", "#ffd56a");
      state.shake = Math.max(state.shake, 3.2);
    } else {
      bouncePlayer();
      burst(player.x, plat.y + plat.height, 8, "rgba(255,255,255,0.8)", "bounce", 3.2, 450);
      state.shake = Math.max(state.shake, 2.2);
    }
    sfxBounce();
    const now = Date.now();
    if (now - state.lastBounceAt < COMBO_WINDOW) state.combo += 1;
    else state.combo = 1;
    const cx = plat.x + plat.width / 2;
    if (Math.abs(player.x - cx) <= 14) {
      state.combo += 1;
      player.vy = Math.max(player.vy, plat.type === "spring" ? SPRING_V : PERFECT_V);
      state.maxHeight += PERFECT_METERS * SCORE_DIV;
      addFloat(player.x, player.y + 62, "PERFECT +" + PERFECT_METERS + "m", "#ffe27a");
    }
    state.lastBounceAt = now;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;
    if (state.combo >= 2) {
      const tag = comboLabel(state.combo);
      addFloat(player.x, player.y + 40, tag ? `x${state.combo} ${tag}` : `x${state.combo}`,
        state.combo >= 10 ? "#ff6bd6" : state.combo >= 6 ? "#5ce1ff" : "#FFD700");
    }
    if (plat.hitCount >= 2) {
      plat.broken = true;
      plat.breakTime = now;
      for (let i = 0; i < 8; i++) {
        const a = Math.PI * 2 * i / 8 + Math.random() * 0.2;
        addParticles([{
          x: plat.x + plat.width / 2,
          y: plat.y + plat.height / 2,
          vx: Math.cos(a) * (1.4 + Math.random() * 2),
          vy: Math.sin(a) * (1.4 + Math.random() * 2) + 1,
          life: 360 + Math.random() * 200,
          maxLife: 560,
          size: 5 + Math.random() * 5,
          color: "rgba(230,245,255,0.75)",
          type: "mote"
        }]);
      }
    }
  }
  function onPower(p) {
    p.collected = true;
    state.powerUps++;
    if (p.type === "weed") {
      setEffect({ type: "weed", startTime: Date.now(), duration: WEED_MS });
      sfxWeed();
      state.shake = Math.max(state.shake, 4);
      addFloat(player.x, player.y + 50, "FLOAT", "#6dff9a");
    } else if (p.type === "rocket") {
      setEffect({ type: "rocket", startTime: Date.now(), duration: ROCKET_MS });
      rocketBoost();
      player.rocketCoast = true;
      sfxRocket();
      state.shake = Math.max(state.shake, 6);
      addFloat(player.x, player.y + 50, "ROCKET", "#ff8a3d");
    } else if (p.type === "shield") {
      setEffect({ type: "shield", startTime: Date.now(), duration: 20000 });
      sfxSolon();
      state.shake = Math.max(state.shake, 3);
      addFloat(player.x, player.y + 50, "SHIELD", "#7ad8ff");
    } else if (p.type === "zap") {
      setEffect({ type: "zap", startTime: Date.now(), duration: ZAP_MS, charges: ZAP_CHARGES });
      sfxZapPickup();
      state.shake = Math.max(state.shake, 3);
      addFloat(player.x, player.y + 50, "ZAP x" + ZAP_CHARGES, "#8ee4ff");
    } else if (p.type === "solonchain") {
      const boost = SOLON_METERS * SCORE_DIV;
      state.maxHeight += boost;
      addFloat(player.x, player.y + 50, `+${SOLON_METERS}m`, "#FFD700");
      sfxSolon();
      state.glow = 0.5;
      state.shake = Math.max(state.shake, 2.2);
      beginTeleport(boost);
    }
  }
  function teleportLocked() {
    return !!(teleport && teleport.phase && teleport.phase !== "linger");
  }
  function easeSmooth(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }
  function ensureTeleportPad(targetTop, preferX) {
    const band = 100;
    let best = null;
    let bestD = Infinity;
    for (const p of platforms) {
      if (p.broken) continue;
      const top = p.y + p.height / 2;
      const d = Math.abs(top - targetTop);
      if (d < band && d < bestD) { best = p; bestD = d; }
    }
    if (best) {
      best.type = "normal";
      best.broken = false;
      best.hitCount = 0;
      best.moveDirection = 0;
      best.moveSpeed = 0;
      best.moveRange = 0;
      best.x = Math.max(16, Math.min(W - PLAT_W - 16, preferX - PLAT_W / 2));
      best.y = targetTop - best.height / 2;
      return best;
    }
    const x = Math.max(16, Math.min(W - PLAT_W - 16, preferX - PLAT_W / 2));
    const p = makePlatform(x, targetTop - PLAT_H / 2, targetTop / SCORE_DIV);
    p.type = "normal";
    p.moveDirection = 0;
    p.moveSpeed = 0;
    p.moveRange = 0;
    platforms.push(p);
    return p;
  }
  function clearStormsNear(x, y, r) {
    storms = storms.filter((s) => {
      const sx = s.x + s.width / 2;
      return Math.hypot(sx - x, s.y - y) >= r;
    });
  }
  function beginTeleport(boost) {
    if (!player) return;
    const entryX = player.x;
    const entryY = player.y;
    const destPlayerY = entryY + boost;
    const destTop = destPlayerY - player.height / 2;
    ensurePlatformsUpTo(destPlayerY + 400);
    const pad = ensureTeleportPad(destTop, entryX);
    const padX = pad.x + pad.width / 2;
    const padTop = pad.y + pad.height / 2;
    clearStormsNear(padX, padTop, 200);
    player.vx = 0;
    player.vy = 0;
    player.padSmash = false;
    player.portalSmash = false;
    player.rocketCoast = false;
    const landY = padTop + player.height / 2;
    teleport = {
      phase: "in",
      clock: 0,
      boost,
      entryX,
      entryY,
      exitX: padX,
      exitY: padTop + 50,
      landY,
      padId: pad.id,
      camFrom: state.cameraY,
      camTo: Math.max(0, landY - H * 0.4),
      entryAlpha: 0,
      exitAlpha: 0,
      entryScale: 0,
      exitScale: 0,
      popped: false
    };
  }
  function syncTeleport() {
    if (!teleport) return;
    const c = teleport.clock;
    const inEnd = TELE_IN_MS;
    const travelEnd = inEnd + TELE_TRAVEL_MS;
    const outEnd = travelEnd + TELE_OUT_MS;
    const lingerEnd = outEnd + TELE_LINGER_MS;
    if (c >= lingerEnd) {
      teleport = null;
      return;
    }
    if (c < inEnd) teleport.phase = "in";
    else if (c < travelEnd) teleport.phase = "travel";
    else if (c < outEnd) teleport.phase = "out";
    else teleport.phase = "linger";

    if (teleport.phase === "in") {
      const t = easeSmooth(c / TELE_IN_MS);
      teleport.entryScale = Math.min(1, c / 90);
      teleport.entryAlpha = teleport.entryScale;
      teleport.exitScale = 0;
      teleport.exitAlpha = 0;
      player.x = teleport.entryX;
      player.y = teleport.entryY;
      player.vx = 0;
      player.vy = 0;
      state.cameraY = teleport.camFrom;
    } else if (teleport.phase === "travel") {
      const t = easeSmooth((c - inEnd) / TELE_TRAVEL_MS);
      teleport.entryScale = 1;
      teleport.entryAlpha = 1 - t;
      teleport.exitScale = Math.min(1, t * 1.4);
      teleport.exitAlpha = teleport.exitScale;
      player.x = teleport.exitX;
      player.y = teleport.exitY;
      player.vx = 0;
      player.vy = 0;
      state.cameraY = teleport.camFrom + (teleport.camTo - teleport.camFrom) * t;
    } else if (teleport.phase === "out") {
      const t = easeSmooth((c - travelEnd) / TELE_OUT_MS);
      teleport.entryAlpha = 0;
      teleport.entryScale = 0;
      teleport.exitScale = 1;
      teleport.exitAlpha = 1;
      player.x = teleport.exitX;
      player.y = teleport.exitY + (teleport.landY - teleport.exitY) * t;
      player.vx = 0;
      player.vy = 0;
      state.cameraY = teleport.camTo;
    } else {
      teleport.entryAlpha = 0;
      teleport.exitAlpha = 1 - easeSmooth((c - outEnd) / TELE_LINGER_MS);
      teleport.exitScale = 0.96 + 0.04 * teleport.exitAlpha;
      if (!teleport.popped) {
        teleport.popped = true;
        player.x = teleport.exitX;
        state.cameraY = teleport.camTo;
        player.y = teleport.landY;
        bouncePlayer();
        player.portalSmash = true;
        state.shake = Math.max(state.shake, 2.4);
        state.glow = Math.max(state.glow, 0.35);
      }
    }
  }
  function updateTeleport(dt) {
    if (!teleport) return;
    teleport.clock += dt;
    syncTeleport();
  }
  function teleportPose() {
    if (!teleport || teleport.phase === "linger") return null;
    const c = teleport.clock;
    const inEnd = TELE_IN_MS;
    const travelEnd = inEnd + TELE_TRAVEL_MS;
    const outEnd = travelEnd + TELE_OUT_MS;
    if (teleport.phase === "in") {
      const t = easeSmooth(c / TELE_IN_MS);
      const suck = Math.pow(t, 1.35);
      return {
        scale: Math.max(0, 1 - suck),
        rot: suck * Math.PI * 2.4,
        alpha: 1 - suck * 0.15,
        hide: suck >= 0.98
      };
    }
    if (teleport.phase === "travel") {
      return { scale: 0, rot: Math.PI * 2.4, alpha: 0, hide: true };
    }
    if (teleport.phase === "out") {
      const t = easeSmooth((c - travelEnd) / TELE_OUT_MS);
      const emerge = Math.pow(t, 0.75);
      return {
        scale: emerge,
        rot: (1 - emerge) * -Math.PI * 2.4,
        alpha: Math.min(1, emerge * 1.15),
        hide: emerge <= 0.02
      };
    }
    return null;
  }
  function drawPortal(x, y, scale, alpha) {
    if (alpha <= 0.01 || scale <= 0.01) return;
    const now = teleport ? teleport.clock : 0;
    const breathe = 0.5 + 0.5 * Math.sin(now * Math.PI * 2 / 1800);
    const s = scale * (0.97 + 0.03 * breathe);
    const spin = 0.55 + now * 0.00105;
    const R = 42 * s;
    const rad = (v) => Math.max(0.01, v);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, -1);
    ctx.globalAlpha = alpha;

    const glowR = rad(R * (1.82 + 0.1 * breathe));
    const gg = ctx.createRadialGradient(0, 0, rad(R * 0.45), 0, 0, glowR);
    gg.addColorStop(0, "rgba(255,213,106," + (0.18 + 0.07 * breathe).toFixed(3) + ")");
    gg.addColorStop(0.4, "rgba(92,225,255," + (0.08 + 0.03 * breathe).toFixed(3) + ")");
    gg.addColorStop(0.72, "rgba(170,80,255," + (0.07 + 0.03 * breathe).toFixed(3) + ")");
    gg.addColorStop(1, "rgba(255,213,106,0)");
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(0, 0, glowR, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, rad(R * 0.76), 0, Math.PI * 2);
    ctx.clip();
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, rad(R * 0.76));
    core.addColorStop(0, "rgba(24,8,44,0.86)");
    core.addColorStop(0.55, "rgba(52,16,86,0.64)");
    core.addColorStop(1, "rgba(12,8,28,0.28)");
    ctx.fillStyle = core;
    ctx.fillRect(-R, -R, R * 2, R * 2);
    ctx.rotate(spin);
    for (let i = 0; i < 3; i++) {
      const off = i * Math.PI * 2 / 3;
      ctx.strokeStyle = i % 2 === 0 ? "rgba(92,225,255,0.78)" : "rgba(196,110,255,0.76)";
      ctx.lineWidth = 6.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let u = 0; u <= 1; u += 0.02) {
        const ang = off + u * Math.PI * 1.2;
        const rad = 7 + u * R * 0.66;
        const px = Math.cos(ang) * rad;
        const py = Math.sin(ang) * rad;
        if (u === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const off = i * Math.PI * 2 / 3 + 0.55;
      ctx.strokeStyle = i % 2 === 0 ? "rgba(196,110,255,0.5)" : "rgba(92,225,255,0.5)";
      ctx.lineWidth = 3.3;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let u = 0; u <= 1; u += 0.02) {
        const ang = off + u * Math.PI * 1.15;
        const rad = 10 + u * R * 0.58;
        const px = Math.cos(ang) * rad;
        const py = Math.sin(ang) * rad;
        if (u === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();

    ctx.shadowColor = "rgba(255,213,106,0.92)";
    ctx.shadowBlur = 13 + 6 * breathe;
    ctx.strokeStyle = "#c9922e";
    const ringR = rad(R * 0.84);
    const ringW = Math.min(8, Math.max(1.2, ringR * 0.22));
    ctx.lineWidth = ringW;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#ffd56a";
    ctx.lineWidth = Math.max(1, ringW * 0.65);
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,245,210,0.9)";
    ctx.lineWidth = Math.max(0.8, ringW * 0.2);
    ctx.beginPath();
    ctx.arc(0, 0, rad(ringR + Math.min(2.1, ringR * 0.15)), 0, Math.PI * 2);
    ctx.stroke();
    const innerR = ringR - Math.min(3.4, ringR * 0.28);
    if (innerR > 0.5) {
      ctx.strokeStyle = "rgba(150,100,28,0.55)";
      ctx.lineWidth = Math.max(0.8, ringW * 0.18);
      ctx.beginPath();
      ctx.arc(0, 0, innerR, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (images.solonchain) {
      ctx.save();
      ctx.rotate(-spin * 0.32);
      ctx.globalAlpha = alpha * (0.52 + 0.08 * breathe);
      const em = R * 0.8;
      ctx.drawImage(images.solonchain, -em / 2, -em / 2, em, em);
      ctx.restore();
    }

    for (let i = 0; i < 8; i++) {
      const a = spin * 0.55 + i * Math.PI * 2 / 8;
      const rr = R * (1.04 + 0.08 * Math.sin(now * 0.0022 + i * 1.3));
      ctx.fillStyle = i % 2 ? "rgba(92,225,255,0.34)" : "rgba(255,213,106,0.4)";
      ctx.beginPath();
      ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function drawPortals() {
    if (!teleport) return;
    if (teleport.entryAlpha > 0.01) {
      drawPortal(teleport.entryX, teleport.entryY, teleport.entryScale, teleport.entryAlpha);
    }
    if (teleport.exitAlpha > 0.01) {
      drawPortal(teleport.exitX, teleport.exitY, teleport.exitScale, teleport.exitAlpha);
    }
  }
  function drawTeleportVeil() {
    if (!teleport || teleport.phase !== "travel") return;
    const t = Math.max(0, Math.min(1, (teleport.clock - TELE_IN_MS) / TELE_TRAVEL_MS));
    const mid = 1 - Math.abs(t * 2 - 1);
    const a = easeSmooth(mid) * 0.26;
    if (a <= 0.01) return;
    ctx.save();
    const g = ctx.createRadialGradient(W / 2, H / 2, 24, W / 2, H / 2, 290);
    g.addColorStop(0, "rgba(36,10,58," + (a * 0.55).toFixed(3) + ")");
    g.addColorStop(0.45, "rgba(255,213,106," + (a * 0.20).toFixed(3) + ")");
    g.addColorStop(1, "rgba(10,6,24," + (a * 0.42).toFixed(3) + ")");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  function onStorm() {
    if (hasEffect("shield")) {
      player.activeEffects = player.activeEffects.filter((e) => e.type !== "shield");
      addFloat(player.x, player.y + 50, "BLOCKED", "#7ad8ff");
      burst(player.x, player.y, 10, "rgba(122,216,255,0.9)", "spark", 4, 500);
      state.shake = Math.max(state.shake, 3);
      return;
    }
    player.vy = STORM_KNOCK;
    state.shake = Math.max(state.shake, 7);
    burst(player.x, player.y, 6, "rgba(120,130,255,0.8)", "bounce", 3.5, 400);
  }

  function zapCharges() {
    if (!player) return 0;
    const now = Date.now();
    const e = player.activeEffects.find((x) => x.type === "zap" && now < x.startTime + x.duration);
    return e && e.charges > 0 ? e.charges : 0;
  }
  function findZapTarget() {
    if (!player) return null;
    const cam0 = state.cameraY - 20;
    const cam1 = state.cameraY + H + 20;
    let best = null;
    let bestD = Infinity;
    for (const s of storms) {
      if (s.locked || s.dead) continue;
      const sx = s.x + s.width / 2;
      const sy = s.y;
      if (sy <= player.y + 24) continue;
      if (sy < cam0 || sy > cam1) continue;
      const dx = sx - player.x;
      const dy = sy - player.y;
      if (Math.abs(dx) > ZAP_RANGE_X || dy > ZAP_RANGE_Y) continue;
      const d = Math.hypot(dx, dy);
      if (d < bestD) { bestD = d; best = s; }
    }
    return best;
  }
  function fireZap(target) {
    const now = Date.now();
    const e = player.activeEffects.find((x) => x.type === "zap" && now < x.startTime + x.duration);
    if (!e || e.charges <= 0) return false;
    e.charges -= 1;
    lastZapAt = performance.now();
    if (e.charges <= 0) {
      player.activeEffects = player.activeEffects.filter((x) => x.type !== "zap");
    }
    target.locked = true;
    const x0 = player.x;
    const y0 = player.y + player.height * 0.35;
    const x1 = target.x + target.width / 2;
    const y1 = target.y;
    zaps.push({
      x0, y0, x1, y1,
      life: 360, maxLife: 360,
      seed: (Math.random() * 1e9) | 0,
      storm: target,
      hit: false
    });
    sfxZap();
    return true;
  }
  function tryZap() {
    if (!player || status !== "playing") return false;
    if (zapCharges() <= 0) return false;
    if (performance.now() - lastZapAt < ZAP_COOLDOWN) return false;
    const target = findZapTarget();
    if (!target) return false;
    return fireZap(target);
  }
  function onZapHit(storm, label) {
    if (!storm || storm.dead) return;
    storm.dead = true;
    storms = storms.filter((s) => s !== storm);
    const cx = storm.x + storm.width / 2;
    const cy = storm.y;
    state.maxHeight += ZAP_METERS * SCORE_DIV;
    const hole = isHole(storm);
    const margin = hole ? 148 : 90;
    const fx = Math.max(margin, Math.min(W - margin, cx));
    addFloat(fx, cy + 46, "+" + ZAP_METERS + "m " + (label || stormLabel(storm, "ZAPPED")), hole ? "#ffd27a" : "#b9f0ff");
    state.shake = Math.max(state.shake, 4.2);
    if (hole) {
      flashes.push({ x: cx, y: cy, life: 320, maxLife: 320, r: 92, kind: "hole" });
      holeBurst(cx, cy);
    } else {
      flashes.push({ x: cx, y: cy, life: 180, maxLife: 180, r: 58 });
      burst(cx, cy, 14, "rgba(36,38,58,0.92)", "mote", 3.4, 720);
      burst(cx, cy, 8, "rgba(62,55,88,0.82)", "mote", 2.5, 620);
      burst(cx, cy, 8, "rgba(160,200,255,0.7)", "spark", 2.8, 400);
      const rain = [];
      for (let i = 0; i < 14; i++) {
        rain.push({
          x: cx + (Math.random() - 0.5) * 54,
          y: cy + (Math.random() - 0.5) * 18,
          vx: (Math.random() - 0.5) * 1.3,
          vy: -2.2 - Math.random() * 4.2,
          life: 480 + Math.random() * 320,
          maxLife: 800,
          size: 1.1 + Math.random() * 1.4,
          color: "rgba(170,210,255,0.85)",
          type: "rain"
        });
      }
      addParticles(rain);
    }
  }
  function updateZaps(dt) {
    for (const z of zaps) {
      z.life -= dt;
      const u = 1 - z.life / z.maxLife;
      if (!z.hit && u >= 1) {
        z.hit = true;
        onZapHit(z.storm);
      }
    }
    zaps = zaps.filter((z) => z.life > 0);
    for (const f of flashes) f.life -= dt;
    flashes = flashes.filter((f) => f.life > 0);
  }

  function collectCoins() {
    for (const c of coins) {
      if (c.collected) continue;
      if (Math.abs(player.x - c.x) < c.r + player.width * 0.28 && Math.abs(player.y - c.y) < c.r + player.height * 0.28) {
        c.collected = true;
        state.coins += 1;
        state.maxHeight += COIN_METERS * SCORE_DIV;
        addFloat(c.x, c.y + 20, "+" + COIN_METERS + "m", "#FFD700");
        burst(c.x, c.y, 8, "rgba(255,213,106,0.95)", "spark", 3.2, 400);
        sfxWrap();
      }
    }
  }
  function showBanner(text, ms) {
    if (!zoneBanner) return;
    zoneBanner.textContent = text;
    zoneBanner.classList.add("show");
    clearTimeout(showBanner._t);
    showBanner._t = setTimeout(() => zoneBanner.classList.remove("show"), ms || 1600);
  }
  function checkMilestone() {
    const sc = getScore();
    const mark = Math.floor(sc / 500) * 500;
    if (mark >= 500 && mark > state.lastMilestone) {
      state.lastMilestone = mark;
      showBanner(mark + "m", 1800);
      burst(player.x, player.y, 18, "rgba(255,213,106,0.95)", "boost", 6, 800);
      state.glow = 0.7;
    }
  }

  function botDir() {
    const goingDown = player.vy < 0;
    let target = null;
    let best = Infinity;
    const foot = player.y - player.height / 2;
    for (const p of platforms) {
      if (p.broken) continue;
      const top = p.y + p.height / 2;
      const dy = top - foot;
      if (goingDown) {
        if (dy > -25 && dy < 220) {
          const d = Math.abs(p.x + p.width / 2 - player.x) + Math.abs(dy) * 0.15;
          if (d < best) { best = d; target = p; }
        }
      } else if (dy > 8 && dy < 280) {
        const d = Math.abs(p.x + p.width / 2 - player.x) + dy * 0.2;
        if (d < best) { best = d; target = p; }
      }
    }
    if (!target) return 0;
    const dx = target.x + target.width / 2 - player.x;
    if (Math.abs(dx) < 6) return 0;
    return Math.sign(dx);
  }

  let lastRocketTrail = 0;
  let lastFloatP = 0;

  function update(dt) {
    if (teleport) updateTeleport(dt);
    let locked = teleportLocked();
    let dir = 0;
    if (!locked) {
      dir = input.left ? -1 : input.right ? 1 : input.touch;
      if (bot && dir === 0) dir = botDir();
      if (dir) { applyInput(dir, dt); player.steering = true; }
    } else {
      player.vx = 0;
      player.steering = false;
    }
    const prevY = player.y;
    if (!locked) updatePlayer(dt);
    const prevX = player.x;
    const wrapped = locked ? 0 : wrapPlayer();
    if (wrapped) {
      burst(player.x, player.y, 5, "rgba(150,200,255,0.7)", "wrap", 4, 250);
      // fix wrap burst direction
      particles.slice(-5).forEach((p) => { p.vx = wrapped * (3 + Math.random() * 2); p.vy = (Math.random() - 0.5) * 2; });
      sfxWrap();
    }
    const n = dt / FRAME;
    for (const p of platforms) {
      if (p.type === "moving" && !p.broken) {
        p.x += p.moveDirection * p.moveSpeed * n;
        if (Math.abs(p.x - p.initialX) > p.moveRange) p.moveDirection *= -1;
        if (p.x < 0) { p.x = 0; p.moveDirection = 1; }
        if (p.x > W - p.width) { p.x = W - p.width; p.moveDirection = -1; }
      }
    }
    for (const s of storms) {
      s.x += s.vx * n;
      if (s.x < 0) { s.x = 0; s.vx *= -1; }
      if (s.x > W - s.width) { s.x = W - s.width; s.vx *= -1; }
    }
    let landed = null;
    if (!locked) {
    landed = findLanding(prevY);
    if (landed) onBounce(landed);
    for (const p of powerUps) if (touchesPower(p)) onPower(p);
    collectCoins();
    if (zapCharges() > 0) tryZap();
    }
    if (teleport) locked = teleportLocked();
    updateZaps(dt);
    if (!locked && !landed && player.vy < 0) {
      const prevFeet = prevY - player.height / 2;
      const feet = player.y - player.height / 2;
      const l = player.x - player.width * 0.35;
      const r = player.x + player.width * 0.35;
      for (const s of storms.slice()) {
        if (s.locked || s.dead) continue;
        const top = s.y + s.height * 0.3;
        if (prevFeet >= top - 2 && feet <= top && r > s.x && l < s.x + s.width) {
          onZapHit(s, stormLabel(s, "STOMPED"));
          player.y = top + player.height / 2;
          player.vy = SPRING_V;
          player.padSmash = true;
          player.squash = 0.62;
          addFloat(player.x, player.y + 46, "BOOST", "#ffd56a");
          sfxBounce();
          break;
        }
      }
    }
    if (!locked) {
    if (player.portalSmash && player.vy <= 0) player.portalSmash = false;
    if (player.portalSmash) {
      for (const s of storms.slice()) {
        if (!s.locked && !s.dead && touchesStorm(s)) {
          onZapHit(s, stormLabel(s, "SMASHED"));
          player.vy = SPRING_V;
          player.padSmash = true;
          player.portalSmash = false;
          player.squash = 0.62;
          addFloat(player.x, player.y + 46, "BOOST", "#ffd56a");
          sfxBounce();
          break;
        }
      }
    }
    if (player.padSmash && player.vy <= 0) player.padSmash = false;
    if (player.rocketCoast && player.vy <= 0) player.rocketCoast = false;
    if (player.padSmash) {
      for (const s of storms.slice()) {
        if (!s.locked && !s.dead && touchesStorm(s)) onZapHit(s, stormLabel(s, "SMASHED"));
      }
    }
    if (!hasEffect("weed") && !hasEffect("rocket") && !player.rocketCoast && !player.padSmash) {
      if (storms.some((s) => !s.locked && !s.dead && touchesStorm(s))) onStorm();
    }
    }
    const now = performance.now();
    if (hasEffect("rocket") && now - lastRocketTrail > 24) {
      addParticles([{
        x: player.x + (Math.random() - 0.5) * 16,
        y: player.y - 22,
        vx: (Math.random() - 0.5) * 1.6,
        vy: -3 - Math.random() * 3,
        life: 320, maxLife: 480, size: 5 + Math.random() * 5,
        color: Math.random() < 0.5 ? "rgba(255,160,40,0.85)" : "rgba(255,80,20,0.8)",
        type: "rocket"
      }, {
        x: player.x + (Math.random() - 0.5) * 18,
        y: player.y - 28,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -1 - Math.random(),
        life: 500, maxLife: 700, size: 7 + Math.random() * 6,
        color: "rgba(80,80,90,0.35)",
        type: "mote"
      }]);
      lastRocketTrail = now;
    }
    if (hasEffect("weed") && now - lastFloatP > 100) {
      addParticles([{
        x: player.x + (Math.random() - 0.5) * 40,
        y: player.y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5),
        vy: Math.random(),
        life: 800, maxLife: 1000, size: 3 + Math.random() * 3,
        color: "rgba(100,255,100,0.8)",
        type: "float"
      }]);
      lastFloatP = now;
    }
    if (!teleport || teleport.phase === "linger") {
      const follow = player.y - H * 0.4;
      if (follow > state.cameraY) {
        state.cameraY += (follow - state.cameraY) * Math.min(1, 0.16 * n);
      }
    }
    if (!locked && player.y > state.maxHeight) state.maxHeight = player.y;
    checkMilestone();

    playerTrail.push({ x: player.x, y: player.y, squash: player.squash, facing: player.facing });
    if (playerTrail.length > 8) playerTrail.shift();

    const zNow = zoneName(getScore());
    if (zNow !== state.lastZone && status === "playing") {
      state.lastZone = zNow;
      state.bannerTimer = 2200;
      showBanner(ZONES[zNow].label.toUpperCase(), 1600);
    }

    const tgt = getScore();
    state.shownScore += (tgt - state.shownScore) * Math.min(1, 0.18 * n);
    if (Math.abs(tgt - state.shownScore) < 0.4) state.shownScore = tgt;

    const zn = zoneName(getScore());
    if ((zn === "space" || zn === "atmosphere") && now - lastMote > 140 && particles.length < MAX_PARTICLES - 8) {
      lastMote = now;
      addParticles([{
        x: Math.random() * W,
        y: state.cameraY + Math.random() * H,
        vx: 0,
        vy: 0.15,
        life: 1400, maxLife: 1400, size: 0.7,
        color: "rgba(255,255,255,0.7)",
        type: "spark"
      }]);
    }
    if (player.vy > 10 && now - lastLine > 40 && particles.length < MAX_PARTICLES - 4) {
      lastLine = now;
      addParticles([{
        x: player.x + (Math.random() - 0.5) * 70,
        y: player.y - 10,
        vx: 0, vy: -8,
        life: 220, maxLife: 220, size: 1.2,
        color: "rgba(200,230,255,0.35)",
        type: "line",
        len: 16 + Math.random() * 18
      }]);
    }
    for (const p of platforms) {
      if (p.type === "moving" && !p.broken) {
        if (!p.trail) p.trail = [];
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 7) p.trail.shift();
      }
    }

    extendPlatforms();
    if (!locked) extendStorms();
    cullWorld();
    const tnow = Date.now();
    platforms = platforms.filter((p) => !p.broken || !p.breakTime || tnow - p.breakTime < 500);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.wait > 0) { p.wait -= dt; continue; }
      p.x += p.vx * n;
      p.y += p.vy * n;
      p.life -= dt;
      if (p.type === "bounce" || p.type === "boost") p.vy -= 0.1 * n;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.y += f.vy * n;
      f.life -= dt;
      if (f.life <= 0) floats.splice(i, 1);
    }
    state.shake *= 0.9;
    if (state.shake < 0.1) state.shake = 0;
    state.glow -= dt / 420;
    if (state.glow < 0) state.glow = 0;

    if (status === "playing" && state.combo > 0 && Date.now() - state.lastBounceAt > COMBO_WINDOW) {
      state.combo = 0;
    }

    if (!locked && player.y < state.cameraY - 100) gameOver();
    updateHud();
  }

  /* ---------- décor / render ---------- */
  function mulberry32(a) {
    return function () {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function initDecor() {
    const rnd = mulberry32(0xB011BEa4);
    const range = (a, b) => a + rnd() * (b - a);
    décor.earth = [];
    décor.air = [];
    décor.clouds = [];
    for (const [key, n, a0, a1, s0, s1] of [
      ["earth", 6, 0.07, 0.16, 36, 70],
      ["air", 7, 0.08, 0.18, 40, 80],
      ["clouds", 7, 0.07, 0.17, 44, 90]
    ]) {
      for (let i = 0; i < n; i++) {
        décor[key].push({
          x: range(-30, W + 30),
          y: range(0, H),
          size: range(s0, s1),
          opacity: range(a0, a1),
          par: 0.04 + (i % 3) * 0.02,
          drift: range(-8, 8),
          phase: range(0, 10)
        });
      }
    }
    décor.atmosphere = [];
    décor.space = [];
    for (const [key, n] of [["atmosphere", 46], ["space", 70]]) {
      for (let i = 0; i < n; i++) {
        décor[key].push({
          x: range(0, W),
          y: range(0, H),
          size: range(0.6, i % 9 === 0 ? 2.1 : 1.5),
          opacity: range(0.28, 0.85),
          par: 0.025 + (i % 4) * 0.01,
          phase: range(0, 12)
        });
      }
    }
  }

  function layerY(item, cam) {
    let y = (item.y + cam * (item.par || 0.08)) % H;
    if (y < 0) y += H;
    return y;
  }

  function drawSoftPuff(x, y, size, alpha, tint) {
    if (alpha <= 0.01) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, size);
    g.addColorStop(0, `rgba(${tint},${alpha})`);
    g.addColorStop(0.45, `rgba(${tint},${alpha * 0.45})`);
    g.addColorStop(1, `rgba(${tint},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.38, y + size * 0.08, size * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - size * 0.32, y + size * 0.06, size * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPuffLayer(list, cam, alpha, tint) {
    if (alpha <= 0.01 || !list) return;
    const now = performance.now();
    for (const f of list) {
      const y = layerY(f, cam);
      let x = f.x + Math.sin(now * 0.00012 + f.phase) * f.drift;
      if (x < -80) x += W + 160;
      if (x > W + 80) x -= W + 160;
      const breathe = 0.88 + 0.12 * Math.sin(now * 0.00055 + f.phase);
      drawSoftPuff(x, y, f.size * breathe, f.opacity * alpha, tint);
    }
  }

  function drawStarLayer(list, cam, alpha) {
    if (alpha <= 0.01 || !list) return;
    const now = performance.now();
    for (const f of list) {
      const y = layerY(f, cam);
      const tw = 0.62 + 0.38 * Math.sin(now * 0.0007 + f.phase);
      const a = alpha * f.opacity * tw;
      if (a < 0.03) continue;
      ctx.globalAlpha = a;
      ctx.fillStyle = "#f4f7ff";
      ctx.beginPath();
      ctx.arc(f.x, y, f.size, 0, Math.PI * 2);
      ctx.fill();
      if (f.size > 1.6) {
        ctx.globalAlpha = a * 0.22;
        ctx.beginPath();
        ctx.arc(f.x, y, f.size * 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawFgLayers(score) {
    const { z1, z2, t } = zoneBlend(score);
    const a1 = t > 0 && z1 !== z2 ? 1 - t : 1;
    const a2 = t > 0 && z1 !== z2 ? t : 0;
    const cam = state.cameraY;
    const tint = {
      earth: "255,236,220",
      air: "255,255,255",
      clouds: "255,240,214"
    };
    for (const [z, a] of [[z1, a1], [z2, a2]]) {
      if (a <= 0.01) continue;
      if (z === "earth" || z === "air" || z === "clouds") {
        drawPuffLayer(décor[z], cam, a, tint[z]);
      } else {
        drawStarLayer(décor[z], cam, a);
      }
    }
  }

  function spaceLayer(index) {
    const arr = images.bg && images.bg.spaces;
    if (arr && arr[index]) return arr[index];
    return images.bg ? images.bg.space : null;
  }
  function spaceScene(score) {
    if (score < ZONE.atmosphere) return { i1: 0, i2: 0, t: 0 };
    const local = score - ZONE.atmosphere;
    const idx = Math.floor(local / SPACE_STEP);
    const pos = local - idx * SPACE_STEP;
    const i1 = ((idx % SPACE_COUNT) + SPACE_COUNT) % SPACE_COUNT;
    if (pos >= SPACE_STEP - SPACE_BLEND) {
      return { i1, i2: (i1 + 1) % SPACE_COUNT, t: (pos - (SPACE_STEP - SPACE_BLEND)) / SPACE_BLEND };
    }
    return { i1, i2: i1, t: 0 };
  }
  function spaceSceneAlpha(index, score) {
    const s = spaceScene(score);
    const ease = s.t * s.t * (3 - 2 * s.t);
    let a = 0;
    if (s.i1 === index) a += s.i1 === s.i2 ? 1 : 1 - ease;
    if (s.i2 === index && s.i2 !== s.i1) a += ease;
    return a;
  }
  function drawPaintedBg(img, cam, alpha, bias) {
    if (!img || !img.width || alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    const iw = img.width, ih = img.height;
    const over = 1.12;
    const scale = Math.max(W / iw, H / ih) * over;
    const dw = iw * scale, dh = ih * scale;
    const x = (W - dw) / 2;
    const travel = Math.max(0, dh - H);
    const drift = cam * 0.014;
    let u = (bias || 0) * travel - drift;
    if (u < 0) u = 0;
    if (u > travel) u = travel;
    ctx.drawImage(img, x, -u, dw, dh);
    ctx.restore();
  }

  function drawBackground(score) {
    const { z1, z2, t } = zoneBlend(score);
    const ease = t * t * (3 - 2 * t);
    const bias = { earth: 0.86, air: 0.42, clouds: 0.68, atmosphere: 0.82, space: 0.5 };
    const cam = state.cameraY;
    ctx.fillStyle = "#070814";
    ctx.fillRect(0, 0, W, H);
    const paintZone = (z, alpha) => {
      if (alpha <= 0) return;
      if (z === "space") {
        const s = spaceScene(score);
        const se = s.t * s.t * (3 - 2 * s.t);
        drawPaintedBg(spaceLayer(s.i1), cam, alpha, bias.space);
        if (se > 0 && s.i1 !== s.i2) drawPaintedBg(spaceLayer(s.i2), cam, alpha * se, bias.space);
      } else {
        drawPaintedBg(images.bg[z], cam, alpha, bias[z] || 0.5);
      }
    };
    paintZone(z1, 1);
    if (ease > 0 && z1 !== z2) paintZone(z2, ease);
    drawFgLayers(score);
    drawLandmarks(score);
  }

  function paintedBgLayout(img, cam, bias) {
    if (!img || !img.width) return null;
    const scale = Math.max(W / img.width, H / img.height) * 1.12;
    const dw = img.width * scale, dh = img.height * scale;
    const x = (W - dw) / 2;
    const travel = Math.max(0, dh - H);
    let u = (bias || 0) * travel - cam * 0.014;
    if (u < 0) u = 0;
    if (u > travel) u = travel;
    return { x, y: -u, dw, dh, scale };
  }

  function zoneAlpha(zone, score) {
    const { z1, z2, t } = zoneBlend(score);
    const ease = t * t * (3 - 2 * t);
    if (z1 === zone && z2 === zone) return 1;
    if (z1 === zone) return 1 - ease;
    if (z2 === zone) return ease;
    return 0;
  }

  function drawLmSprite(img, x, y, dw, dh, alpha, opts) {
    if (!img || !img.width || alpha <= 0.01 || dw < 2) return;
    opts = opts || {};
    ctx.save();
    ctx.globalAlpha = alpha * (opts.fade == null ? 0.92 : opts.fade);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    if (opts.filter) ctx.filter = opts.filter;
    if (opts.glow) {
      ctx.shadowColor = opts.glow.color;
      ctx.shadowBlur = opts.glow.blur;
    }
    ctx.drawImage(img, x, y, dw, dh);
    ctx.restore();
  }

  function drawPlaneBanner(tailX, tailY, alpha, now) {
    if (!drawPlaneBanner.c) {
      const bw = 300, bh = 60;
      const c = document.createElement("canvas");
      c.width = bw; c.height = bh;
      const g = c.getContext("2d");
      const grd = g.createLinearGradient(0, 0, 0, bh);
      grd.addColorStop(0, "#3a1d78"); grd.addColorStop(0.5, "#4b2596"); grd.addColorStop(1, "#2a1460");
      g.fillStyle = grd; g.fillRect(0, 0, bw, bh);
      g.fillStyle = "#ffd56a"; g.fillRect(0, 0, bw, 5); g.fillRect(0, bh - 5, bw, 5);
      g.fillStyle = "#f2b630"; g.fillRect(bw - 6, 0, 6, bh);
      g.font = "900 30px Orbitron, sans-serif";
      g.textAlign = "center"; g.textBaseline = "middle";
      g.lineWidth = 6; g.strokeStyle = "#0a0e1c"; g.lineJoin = "round";
      g.strokeText("SolOnChain.io", bw / 2 - 2, bh / 2 + 2);
      const tg = g.createLinearGradient(0, 14, 0, 46);
      tg.addColorStop(0, "#fff3c4"); tg.addColorStop(0.5, "#ffd56a"); tg.addColorStop(1, "#e3a12a");
      g.fillStyle = tg; g.fillText("SolOnChain.io", bw / 2 - 2, bh / 2 + 2);
      if (document.fonts && document.fonts.status !== "loaded") {
        document.fonts.ready.then(() => { drawPlaneBanner.c = null; });
      }
      drawPlaneBanner.c = c;
    }
    const src = drawPlaneBanner.c;
    const BW = 118, BH = 24, rope = 26;
    const right = tailX - rope;
    const left = right - BW;
    const t = now / 1000;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "rgba(60,50,40,0.75)";
    ctx.lineWidth = 1;
    const y0 = tailY + Math.sin(t * 5) * 1.2;
    ctx.beginPath();
    ctx.moveTo(tailX + 4, tailY);
    ctx.lineTo(right, y0 - BH * 0.45);
    ctx.moveTo(tailX + 4, tailY);
    ctx.lineTo(right, y0 + BH * 0.45);
    ctx.stroke();
    const slices = 24;
    const sw = src.width / slices;
    const dwS = BW / slices;
    for (let i = 0; i < slices; i++) {
      const u = 1 - i / slices;
      const amp = 1 + u * 3.2;
      const off = Math.sin(t * 5.5 - u * 6) * amp;
      const shade = 0.88 + 0.12 * Math.cos(t * 5.5 - u * 6);
      ctx.globalAlpha = alpha;
      ctx.drawImage(src, i * sw, 0, sw + 0.6, src.height, left + i * dwS, y0 - BH / 2 + off, dwS + 0.6, BH);
      if (shade < 1) {
        ctx.globalAlpha = alpha * (1 - shade) * 1.6;
        ctx.fillStyle = "#000";
        ctx.fillRect(left + i * dwS, y0 - BH / 2 + off, dwS + 0.6, BH);
      }
    }
    ctx.restore();
  }

  function drawLandmarks(score) {
    const now = performance.now();
    const cam = state.cameraY;
    const filter = "saturate(0.93) contrast(0.97) brightness(0.99)";
    const lm = images.lm || {};

    const aE = zoneAlpha("earth", score);
    if (aE > 0.01 && lm.billboard) {
      const lay = paintedBgLayout(images.bg.earth, cam, 0.86);
      if (lay) {
        const breathe = 0.5 + 0.5 * Math.sin(now * (Math.PI * 2 / 3600));
        const dw = 210 * lay.scale;
        const dh = dw * (lm.billboard.height / lm.billboard.width);
        const x = lay.x + 64 * lay.scale;
        const y = lay.y + 1150 * lay.scale;
        const glowA = 0.22 + 0.16 * breathe;
        drawLmSprite(lm.billboard, x, y, dw, dh, aE, {
          fade: 0.94,
          filter,
          glow: { color: "rgba(255,210,90," + glowA.toFixed(3) + ")", blur: 10 + 5 * breathe }
        });
      }
    }

    const aA = zoneAlpha("air", score);
    if (aA > 0.01 && lm.balloon) {
      const bob = Math.sin(now * (Math.PI * 2 / 3600)) * 7;
      const drift = Math.sin(now * (Math.PI * 2 / 18000)) * 28;
      const dh = 96;
      const dw = dh * (lm.balloon.width / lm.balloon.height);
      const x = W - dw - 34 + drift * 0.6;
      const y = H - dh - 50 + bob;
      drawLmSprite(lm.balloon, x, y, dw, dh, aA, { fade: 0.92, filter });
    }

    const aC = zoneAlpha("clouds", score);
    if (aC > 0.01 && lm.plane) {
      const dw = 112;
      const dh = dw * (lm.plane.height / lm.plane.width);
      const period = 22000;
      const phase = ((now / period) + 0.42) % 1;
      const x = -dw - 20 + phase * (W + dw + 40 + 160);
      const y = 150 + Math.sin(phase * Math.PI * 2) * 16 + cam * 0.025;
      drawPlaneBanner(x, y + dh * 0.42, aC * 0.92, now);
      drawLmSprite(lm.plane, x, y, dw, dh, aC, { fade: 0.92, filter });
    }

    const aS = zoneAlpha("space", score) * spaceSceneAlpha(0, score);
    if (aS > 0.01 && lm.rocket) {
      const dh = 88;
      const dw = dh * (lm.rocket.width / lm.rocket.height);
      const period = 28000;
      const phase = ((now / period) + 0.38) % 1;
      const x = -dw * 0.3 + phase * (W + dw * 0.6);
      const y = H * 0.58 - phase * (H * 0.48) + cam * 0.02;
      drawLmSprite(lm.rocket, x, y, dw, dh, aS, { fade: 0.90, filter });
    }

    const aM = zoneAlpha("space", score) * spaceSceneAlpha(1, score);
    if (false && aM > 0.01 && lm.moon) {
      const sp2 = spaceLayer(1);
      const lay = paintedBgLayout(sp2, cam, 0.5);
      if (lay) {
        const bob = Math.sin(now * (Math.PI * 2 / 3600)) * 2.5;
        const dw = 109.615 * lay.scale;
        const dh = 150 * lay.scale;
        const x = Math.max(2, lay.x + 16.154 * lay.scale);
        const y = lay.y + 251.538 * lay.scale + bob;
        drawLmSprite(lm.moon, x, y, dw, dh, aM, { fade: 0.92, filter });
      }
    }
  }

  function drawHorizon() {
  }

  function cloudSprite(p) {
    if ((p.hitCount >= 1 || p.broken) && images.cloudCracked) return images.cloudCracked;
    if (p.type === "spring" && images.cloudBoost) return images.cloudBoost;
    return images.cloud;
  }

  function drawPlatform(p) {
    const now = performance.now();
    const breathe = 0.5 + 0.5 * Math.sin(now * 0.00115 + p.id);
    if (p.broken) {
      const age = p.breakTime ? Date.now() - p.breakTime : 0;
      const fade = Math.min(1, age / 500);
      ctx.globalAlpha = Math.max(0, 0.7 * (1 - fade));
      if (ctx.globalAlpha <= 0) { ctx.globalAlpha = 1; return; }
    }
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
    ctx.scale(1, -1);
    if (p.hitCount === 1) ctx.translate(Math.sin(now * 0.01) * 1.2, 0);

    const spr = cloudSprite(p);
    const drawW = p.width + 38;
    const artW = spr ? Math.max(1, spr.width - 2 * CLOUD_ART_PAD) : CLOUD_ART_W;
    const artH = spr ? Math.max(1, spr.height - 2 * CLOUD_ART_PAD) : (p.height + 16);
    const drawH = spr ? drawW * (artH / artW) : p.height + 16;
    const scale = drawW / artW;
    const dw = spr ? spr.width * scale : drawW;
    const dh = spr ? spr.height * scale : drawH;
    const dx = -drawW / 2 - CLOUD_ART_PAD * scale;
    const dy = -1 - CLOUD_ART_PAD * scale;

    if (p.type === "moving" && p.trail && p.trail.length) {
      for (let i = 0; i < p.trail.length; i++) {
        const tr = p.trail[i];
        const ta = ((i + 1) / p.trail.length) * 0.18;
        ctx.save();
        ctx.translate(tr.x - p.x, 0);
        ctx.globalAlpha = ta * (ctx.globalAlpha || 1);
        if (spr) ctx.drawImage(spr, dx, dy, dw, dh);
        ctx.restore();
      }
    }

    const zn = zoneName(getScore());
    const darkSky = zn === "atmosphere" || zn === "space";
    ctx.save();
    ctx.globalAlpha = (ctx.globalAlpha || 1) * 0.55;
    ctx.fillStyle = darkSky ? "rgba(80, 115, 165, 0.40)" : "rgba(8, 16, 34, 0.50)";
    ctx.beginPath();
    ctx.ellipse(0, drawH * 0.52, drawW * 0.42, Math.max(6, drawH * 0.22), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (p.type === "spring") {
      const padBreathe = 0.5 + 0.5 * Math.sin(now * (Math.PI * 2 / 3600) + p.id);
      const padCx = dx + (CLOUD_ART_PAD + BOOST_PAD_CX) * scale;
      const padCy = dy + (CLOUD_ART_PAD + BOOST_PAD_CY) * scale;
      const swell = 1.04 + 0.10 * padBreathe;
      const prx = (BOOST_PAD_W * 0.5) * scale * swell;
      const pry = (BOOST_PAD_H * 0.5) * scale * (1.08 + 0.12 * padBreathe);
      const pg = ctx.createRadialGradient(padCx, padCy, Math.max(2, prx * 0.15), padCx, padCy, prx);
      const a0 = 0.20 + 0.16 * padBreathe;
      const a1 = 0.12 + 0.10 * padBreathe;
      pg.addColorStop(0, "rgba(255,230,150," + a0.toFixed(3) + ")");
      pg.addColorStop(0.5, "rgba(255,200,90," + a1.toFixed(3) + ")");
      pg.addColorStop(1, "rgba(255,180,70,0)");
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.ellipse(padCx, padCy, prx, pry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const glow = p.type === "spring" ? (darkSky ? "rgba(210,230,255,0.4)" : "rgba(255,255,255,0.28)") : p.hitCount === 1 ? "rgba(255,160,160,0.5)" : p.type === "moving" ? "rgba(180,230,255,0.5)" : darkSky ? "rgba(210,230,255,0.5)" : "rgba(255,255,255,0.35)";
    ctx.shadowColor = glow;
    ctx.shadowBlur = (darkSky ? 10 : 8) + breathe * 5;
    ctx.shadowOffsetY = 0;
    if (spr) {
      // visual top lines up with the landing plane (hitbox top)
      ctx.drawImage(spr, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = "#f4fbff";
      ctx.beginPath();
      ctx.ellipse(0, p.height / 2, p.width / 2, p.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function drawCoins() {
    const now = performance.now();
    for (const c of coins) {
      if (c.collected) continue;
      const bob = Math.sin(now * 0.004 + c.x) * 2.5;
      ctx.save();
      ctx.translate(c.x, c.y + bob);
      ctx.scale(1, -1);
      const pulse = 1 + Math.sin(now * 0.003 + c.id) * 0.06;
      const spin = 0.84 + 0.16 * Math.abs(Math.sin(now * 0.0024 + c.id));
      ctx.scale(pulse * spin, pulse);
      const breathe = 0.5 + 0.5 * Math.sin(now * 0.0014 + c.id);
      ctx.shadowColor = "#FFD700";
      ctx.shadowBlur = 8 + breathe * 6;
      const sz = 28;
      if (images.coin) {
        ctx.drawImage(images.coin, -sz / 2, -sz / 2, sz, sz);
        ctx.shadowBlur = 0;
        const t = ((now * 0.00055 + c.id * 0.2) % 1);
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, sz * 0.42, 0, Math.PI * 2);
        ctx.clip();
        const sx = -sz * 0.65 + t * sz * 1.3;
        const grd = ctx.createLinearGradient(sx - 7, -sz, sx + 7, sz);
        grd.addColorStop(0, "rgba(255,255,255,0)");
        grd.addColorStop(0.45, "rgba(255,255,255,0.06)");
        grd.addColorStop(0.5, "rgba(255,255,240,0.42)");
        grd.addColorStop(0.55, "rgba(255,255,255,0.06)");
        grd.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
        ctx.restore();
      } else {
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.shadowBlur = 0;
  }

  function drawPlayer() {
    const now = performance.now();
    const breathe = 0.5 + 0.5 * Math.sin(now * 0.0011);
    const pose = teleportPose();
    if (pose && pose.hide) return;

    // motion trail — soft afterimages, not stacked sprites
    const trailColor = hasEffect("rocket") ? "rgba(255,138,61,0.55)" : hasEffect("weed") ? "rgba(109,255,154,0.5)" : "rgba(255,213,106,0.45)";
    const trailStart = Math.max(0, playerTrail.length - 5);
    if (!(pose && pose.scale < 0.85)) for (let i = trailStart; i < playerTrail.length; i++) {
      const tr = playerTrail[i];
      const ta = ((i - trailStart + 1) / 5) * 0.22;
      ctx.save();
      ctx.translate(tr.x, tr.y);
      ctx.scale(1, -1);
      ctx.globalAlpha = ta;
      ctx.fillStyle = trailColor;
      ctx.shadowColor = trailColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(0, 0, player.width * 0.32, player.height * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // FLOAT aura
    if (hasEffect("weed")) {
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.scale(1, -1);
      const r = 34 + breathe * 6;
      const ag = ctx.createRadialGradient(0, 0, 8, 0, 0, r);
      ag.addColorStop(0, "rgba(80,255,140,0.08)");
      ag.addColorStop(0.6, `rgba(80,255,140,${0.18 + 0.08 * breathe})`);
      ag.addColorStop(1, "rgba(80,255,140,0)");
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(110,255,154,${0.35 + 0.15 * breathe})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 28 + breathe * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (hasEffect("shield")) {
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.scale(1, -1);
      const r = 32 + breathe * 3;
      const sg = ctx.createRadialGradient(0, 0, 10, 0, 0, r);
      sg.addColorStop(0, "rgba(122,216,255,0.06)");
      sg.addColorStop(0.7, "rgba(122,216,255,0.16)");
      sg.addColorStop(1, "rgba(122,216,255,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(122,216,255,0.55)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 26 + breathe * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (zapCharges() > 0) {
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.scale(1, -1);
      const r = 33 + breathe * 4;
      const zg = ctx.createRadialGradient(0, 0, 8, 0, 0, r);
      zg.addColorStop(0, "rgba(140,230,255,0.07)");
      zg.addColorStop(0.62, "rgba(90,200,255," + (0.14 + 0.07 * breathe).toFixed(3) + ")");
      zg.addColorStop(1, "rgba(255,220,120,0)");
      ctx.fillStyle = zg;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(150,230,255," + (0.32 + 0.14 * breathe).toFixed(3) + ")";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 27 + breathe * 2.4, 0, Math.PI * 2);
      ctx.stroke();
      const crackleSeed = Math.floor(now / 700);
      for (let i = 0; i < 3; i++) {
        const s2 = hash32(crackleSeed * 31 + i * 97 + 3);
        const ang = ((s2 % 1000) / 1000) * Math.PI * 2;
        const rad = 24 + (s2 % 7);
        const x1 = Math.cos(ang) * rad;
        const y1 = Math.sin(ang) * rad;
        const x2 = Math.cos(ang) * (rad + 7 + (s2 % 5));
        const y2 = Math.sin(ang) * (rad + 7 + (s2 % 5));
        ctx.globalAlpha = 0.28 + 0.22 * breathe;
        const pts = boltPoints(x1, y1, x2, y2, s2, 3);
        strokeBolt(pts, "rgba(180,235,255,0.85)", 1.1, 6);
        strokeBolt(pts, "rgba(255,245,200,0.7)", 0.5, 2);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }

    // rocket flame
    if (hasEffect("rocket")) {
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.scale(1, -1);
      const flick = 0.9 + 0.1 * Math.sin(now * 0.006);
      const footY = 26;
      const len = 34 * flick;
      ctx.globalAlpha = 0.95;
      const fg = ctx.createRadialGradient(0, footY + len * 0.25, 2, 0, footY + len * 0.15, len);
      fg.addColorStop(0, "rgba(255,245,200,0.95)");
      fg.addColorStop(0.25, "rgba(255,210,90,0.85)");
      fg.addColorStop(0.55, "rgba(255,120,40,0.5)");
      fg.addColorStop(1, "rgba(255,80,20,0)");
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(-9, footY);
      ctx.quadraticCurveTo(-11, footY + len * 0.4, 0, footY + len);
      ctx.quadraticCurveTo(11, footY + len * 0.4, 9, footY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,250,230,0.95)";
      ctx.beginPath();
      ctx.moveTo(-3.5, footY + 2);
      ctx.quadraticCurveTo(0, footY + len * 0.55, 0, footY + len * 0.62);
      ctx.quadraticCurveTo(0, footY + len * 0.55, 3.5, footY + 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate((player.lean || 0) + (pose ? pose.rot : 0));
    const teleScale = pose ? pose.scale : 1;
    ctx.scale((1 / player.squash) * teleScale, player.squash * teleScale);
    ctx.scale(player.facing, -1);
    if (pose) ctx.globalAlpha = pose.alpha;
    if (hasEffect("weed")) {
      ctx.shadowColor = "#00FF00";
      ctx.shadowBlur = 18 + breathe * 8;
    } else if (hasEffect("rocket")) {
      ctx.shadowColor = "#FF6600";
      ctx.shadowBlur = 20 + breathe * 10;
    } else {
      ctx.shadowColor = "rgba(255,213,106,0.7)";
      ctx.shadowBlur = 10 + breathe * 7;
    }
    if (images.character) {
      const sprW = 68;
      const sprH = sprW * (images.character.height / images.character.width);
      const top = -player.height / 2 - (sprH - player.height) + 6;
      ctx.drawImage(images.character, -sprW / 2, top, sprW, sprH);
    } else {
      ctx.fillStyle = "#FED700";
      ctx.beginPath();
      ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  function drawPower(p) {
    if (p.collected) return;
    const now = performance.now();
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(1, -1);
    const bob = Math.sin(now * 0.003 + p.id) * 3;
    ctx.translate(0, bob);
    const pulse = 1 + Math.sin(now * 0.0022 + p.id) * 0.08;
    ctx.scale(pulse, pulse);
    let img = null, color = "#FFD700", rad = 26;
    if (p.type === "weed") { img = images.weed; color = "#6dff9a"; rad = 28; }
    else if (p.type === "rocket") { img = images.rocket; color = "#ff8a3d"; rad = 30; }
    else if (p.type === "shield") { img = images.shield; color = "#7ad8ff"; rad = 28; }
    else if (p.type === "zap") { img = images.zap; color = "#8ee4ff"; rad = 28; }
    else { img = images.solonchain; color = "#FFD700"; rad = 30; }
    const breathe = 0.5 + 0.5 * Math.sin(now * 0.0013 + p.id);
    const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
    grd.addColorStop(0, color + "44");
    grd.addColorStop(0.55, color + "22");
    grd.addColorStop(1, color + "00");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = color;
    ctx.shadowBlur = 10 + breathe * 7;
    if (img) {
      const aspect = img.width / img.height;
      let dh = p.height + 10;
      let dw = dh * aspect;
      if (dw > p.width + 18) { dw = p.width + 18; dh = dw / aspect; }
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, p.width / 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.shadowBlur = 0;
  }

  function hash32(n) {
    n = Math.imul(n ^ (n >>> 16), 2246822507);
    n = Math.imul(n ^ (n >>> 13), 3266489909);
    return (n ^= n >>> 16) >>> 0;
  }
  function boltPoints(x0, y0, x1, y1, seed, segs) {
    const pts = [{ x: x0, y: y0 }];
    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy / len, py = dx / len;
    let s = seed | 0;
    for (let i = 1; i < segs; i++) {
      const t = i / segs;
      s = hash32(s + i * 17);
      const jitter = ((s % 1000) / 1000 - 0.5) * len * 0.28;
      pts.push({ x: x0 + dx * t + px * jitter, y: y0 + dy * t + py * jitter });
    }
    pts.push({ x: x1, y: y1 });
    return pts;
  }
  function strokeBolt(pts, color, width, glow) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.shadowColor = color;
    ctx.shadowBlur = glow;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawBlackHole(s) {
    const now = performance.now();
    const cx = s.x + s.width / 2;
    const cy = s.y;
    const bob = Math.sin(now * 0.00155 + (s.x || 0) * 0.05) * 2.2;
    const breath = Math.sin(now * 0.0012 + (s.y || 0) * 0.03);
    const glowB = 0.5 + 0.5 * breath;

    ctx.save();
    ctx.translate(cx, cy + bob);
    ctx.scale(1, -1);

    const core = images.hole;
    const drawW = 152;
    const drawH = core ? drawW * (core.height / core.width) : 107;

    const gR = Math.max(drawW, drawH) * 0.58;
    const glow = ctx.createRadialGradient(0, 0, drawH * 0.12, 0, 0, Math.max(1, gR));
    glow.addColorStop(0, "rgba(255,200,90," + (0.16 + glowB * 0.10).toFixed(3) + ")");
    glow.addColorStop(0.38, "rgba(255,150,45," + (0.14 + glowB * 0.10).toFixed(3) + ")");
    glow.addColorStop(0.7, "rgba(255,110,30," + (0.07 + glowB * 0.06).toFixed(3) + ")");
    glow.addColorStop(1, "rgba(255,110,30,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, gR * (0.96 + glowB * 0.06), 0, Math.PI * 2);
    ctx.fill();

    if (core) {
      ctx.drawImage(core, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      ctx.fillStyle = "#14081c";
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffd56a";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawStorm(s) {
    if (isHole(s)) { drawBlackHole(s); return; }
    const now = performance.now();
    const cx = s.x + s.width / 2;
    const cy = s.y;
    const bob = Math.sin(now * 0.0021 + (s.x || 0) * 0.05) * 3.2;
    const breath = Math.sin(now * 0.00115 + (s.y || 0) * 0.03);
    const squashX = 1 + breath * 0.045;
    const squashY = 1 - breath * 0.045;
    const glowB = 0.5 + 0.5 * Math.sin(now * 0.00105 + 1.2);

    ctx.save();
    ctx.translate(cx, cy + bob);
    ctx.scale(1, -1);
    ctx.scale(squashX, squashY);

    const img = images.storm;
    const drawW = 96;
    const drawH = img ? drawW * (img.height / img.width) : 76;
    const eyeT = 70.5 / 175;
    const destX = -drawW / 2;
    const destY = -drawH * eyeT;

    ctx.shadowColor = "rgba(100,140,255," + (0.32 + glowB * 0.18) + ")";
    ctx.shadowBlur = 12 + glowB * 7;
    if (img) ctx.drawImage(img, destX, destY, drawW, drawH);
    else {
      ctx.fillStyle = "#1a1a2e";
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    const blinkPeriod = 2800 + (Math.abs(Math.floor(s.x * 13)) % 1400);
    const blinkPhase = (now + (s.x || 0) * 20) % blinkPeriod;
    if (blinkPhase < 140 && img) {
      const lid = Math.sin((blinkPhase / 140) * Math.PI);
      const ey1x = destX + drawW * (83.9 / 220);
      const ey2x = destX + drawW * (133.0 / 220);
      const eyY = destY + drawH * (70.7 / 175);
      ctx.fillStyle = "rgba(20,16,32," + (0.82 * lid) + ")";
      const ew = drawW * 0.095, eh = drawH * 0.055 * (0.35 + 0.65 * lid);
      ctx.beginPath();
      ctx.ellipse(ey1x, eyY, ew, eh, -0.15, 0, Math.PI * 2);
      ctx.ellipse(ey2x, eyY, ew, eh, 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    const interval = 150 + (Math.abs(Math.floor(s.x || 0)) % 50);
    const seed = Math.floor(now / interval) + Math.floor((s.x || 0) * 3) + Math.floor(s.y || 0);
    const boltOriginY = destY + drawH * 0.58;
    ctx.globalAlpha = 0.5 + glowB * 0.28;
    for (let i = 0; i < 3; i++) {
      const s2 = hash32(seed * 13 + i * 97);
      const ang = ((s2 % 1000) / 1000 - 0.5) * 1.05 + (i - 1) * 0.42;
      const len = 16 + (hash32(s2 + 3) % 18);
      const x1 = Math.sin(ang) * 8;
      const y1 = boltOriginY;
      const x2 = Math.sin(ang) * 22;
      const y2 = boltOriginY + len;
      const pts = boltPoints(x1, y1, x2, y2, s2, 4 + (s2 % 3));
      strokeBolt(pts, "rgba(170,210,255,0.95)", 1.4, 8 + glowB * 6);
      strokeBolt(pts, "rgba(230,245,255,0.9)", 0.6, 2);
    }
    ctx.globalAlpha = 1;

    if (player) {
      const pdx = player.x - cx;
      const pdy = player.y - (cy + bob);
      const dist = Math.hypot(pdx, pdy);
      if (dist < 120 && dist > 8) {
        const lx = pdx, ly = -pdy;
        const reach = Math.min(dist, 48 + (1 - dist / 120) * 36);
        const ux = lx / dist, uy = ly / dist;
        const zseed = Math.floor(now / 130) + Math.floor(s.x || 0);
        const pts = boltPoints(ux * 10, boltOriginY, ux * reach, uy * reach, zseed, 5);
        ctx.globalAlpha = 0.5 + 0.2 * glowB;
        strokeBolt(pts, "rgba(160,200,255,0.95)", 2.0, 11 + glowB * 6);
        strokeBolt(pts, "rgba(255,255,255,0.88)", 0.8, 3);
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();
  }

  function drawFlashes() {
    for (const f of flashes) {
      const t = Math.max(0, f.life / f.maxLife);
      const rise = Math.sin(t * Math.PI);
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(1, -1);
      if (f.kind === "hole") {
        const implT = t > 0.5 ? (t - 0.5) / 0.5 : 0;
        const pop = rise;
        if (implT > 0.02) {
          const rr = Math.max(2, f.r * (0.3 + 1.05 * implT));
          ctx.strokeStyle = "rgba(255,210,100," + (0.85 * implT).toFixed(3) + ")";
          ctx.lineWidth = 4 + 6 * implT;
          ctx.shadowColor = "rgba(255,150,50,0.85)";
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(0, 0, rr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        const r = Math.max(2, f.r * (0.7 + 0.85 * pop));
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, "rgba(255,248,220," + (0.88 * pop).toFixed(3) + ")");
        g.addColorStop(0.2, "rgba(255,186,70," + (0.62 * pop).toFixed(3) + ")");
        g.addColorStop(0.5, "rgba(255,120,40," + (0.32 * pop).toFixed(3) + ")");
        g.addColorStop(1, "rgba(180,60,10,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const r = Math.max(1, f.r * (0.7 + 0.5 * rise));
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, "rgba(255,255,240," + (0.72 * rise).toFixed(3) + ")");
        g.addColorStop(0.28, "rgba(200,235,255," + (0.4 * rise).toFixed(3) + ")");
        g.addColorStop(0.65, "rgba(120,190,255," + (0.16 * rise).toFixed(3) + ")");
        g.addColorStop(1, "rgba(120,180,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
  function drawZaps() {
    for (const z of zaps) {
      const u = Math.max(0, Math.min(1, 1 - z.life / z.maxLife));
      const x1 = z.x0 + (z.x1 - z.x0) * u;
      const y1 = z.y0 + (z.y1 - z.y0) * u;
      const pts = boltPoints(z.x0, z.y0, x1, y1, z.seed, 6);
      ctx.save();
      ctx.globalAlpha = 0.95;
      strokeBolt(pts, "rgba(255,220,120,0.7)", 4.2, 16);
      strokeBolt(pts, "rgba(120,210,255,0.95)", 2.2, 10);
      strokeBolt(pts, "rgba(255,255,255,0.95)", 0.9, 3);
      ctx.restore();
    }
  }
  function drawParticles() {
    for (const p of particles) {
      if (p.wait > 0) continue;
      const t = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(1, -1);
      ctx.globalAlpha = t;
      if (p.type === "line") {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -p.len || -18);
        ctx.stroke();
      } else if (p.type === "shard") {
        ctx.fillStyle = p.color;
        ctx.rotate(p.rot || 0);
        ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
      } else if (p.type === "star") {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.rotate(p.rot || 0);
        const s2 = p.size * (0.65 + 0.35 * t);
        ctx.beginPath();
        ctx.moveTo(0, -s2);
        ctx.lineTo(s2 * 0.28, -s2 * 0.28);
        ctx.lineTo(s2, 0);
        ctx.lineTo(s2 * 0.28, s2 * 0.28);
        ctx.lineTo(0, s2);
        ctx.lineTo(-s2 * 0.28, s2 * 0.28);
        ctx.lineTo(-s2, 0);
        ctx.lineTo(-s2 * 0.28, -s2 * 0.28);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === "rain") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(0.7, p.size * 0.35), p.size * 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        if (p.type === "spark" || p.type === "boost") ctx.shadowColor = p.color, ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * (p.type === "mote" ? 1 : t), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function drawFloats() {
    ctx.save();
    for (const f of floats) {
      const t = f.life / f.maxLife;
      const sy = H - (f.y - state.cameraY);
      ctx.globalAlpha = Math.min(1, t * 1.4);
      ctx.fillStyle = f.color;
      ctx.font = "700 18px 'Exo 2', sans-serif";
      ctx.textAlign = "center";
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.lineWidth = 5;
      ctx.lineJoin = "round";
      ctx.strokeText(f.text, f.x, sy);
      ctx.fillText(f.text, f.x, sy);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawGlow() {
    if (state.glow <= 0) return;
    ctx.save();
    const a = state.glow * 0.34;
    const g = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 300);
    g.addColorStop(0, `rgba(255,213,106,${a})`);
    g.addColorStop(1, "rgba(255,213,106,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function drawVignette() {
    const menu = uiMode !== "game";
    const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.28, W / 2, H * 0.5, H * 0.78);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, menu ? "rgba(0,0,0,0.16)" : "rgba(0,0,0,0.28)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function render() {
    const score = getScore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dpr = canvas._dpr || 1;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    drawBackground(score);
    const sx = (Math.random() - 0.5) * state.shake * 2;
    const sy = (Math.random() - 0.5) * state.shake * 2;
    ctx.save();
    ctx.translate(sx, H + sy);
    ctx.scale(1, -1);
    ctx.translate(0, -state.cameraY);
    drawHorizon();
    for (const p of platforms) drawPlatform(p);
    drawCoins();
    for (const p of powerUps) drawPower(p);
    for (const s of storms) drawStorm(s);
    drawFlashes();
    drawParticles();
    drawPortals();
    if (player) drawPlayer();
    drawZaps();
    ctx.restore();
    drawFloats();
    drawGlow();
    drawTeleportVeil();
    drawVignette();
  }

  function updateHud() {
    const score = getScore();
    const shown = Math.round(state.shownScore);
    hudScore.innerHTML = `${shown}<span class="score-unit">m</span>`;
    hudZone.textContent = ZONES[zoneName(score)].label;
    hudBest.innerHTML = `<span class="lbl">BEST</span><span class="val">${bestScore}m</span>`;
    if (state.combo >= 2) {
      hudCombo.textContent = `COMBO x${state.combo}`;
      hudCombo.classList.remove("hidden");
      comboBar.classList.add("show");
      hud.classList.add("combo-on");
      const remain = Math.max(0, 1 - (Date.now() - state.lastBounceAt) / COMBO_WINDOW);
      comboFill.style.width = (remain * 100) + "%";
    } else {
      hudCombo.classList.add("hidden");
      comboBar.classList.remove("show");
      hud.classList.remove("combo-on");
    }
    const w = effectLeft("weed");
    const r = effectLeft("rocket");
    pillWeed.classList.toggle("on", w > 0);
    pillRocket.classList.toggle("on", r > 0);
    if (w > 0) tWeed.textContent = (w / 1000).toFixed(1) + "s";
    if (r > 0) tRocket.textContent = (r / 1000).toFixed(1) + "s";
    if (hudCoins) { const v = hudCoins.querySelector(".val"); if (v) v.textContent = String(state.coins); }
    if (pillShield) pillShield.classList.toggle("on", hasEffect("shield") && status === "playing");
    if (pillZap) {
      const zc = zapCharges();
      pillZap.classList.toggle("on", zc > 0 && status === "playing");
      if (zc > 0) pillZap.textContent = "ZAP x" + zc;
    }
    const showStorm = score >= STORM_START - 160 && score < STORM_START + 400;
    const showHole = score >= ZONE.atmosphere - 160 && score < ZONE.atmosphere + 400;
    if (showHole) warn.textContent = "BLACK HOLE ZONE AHEAD";
    else warn.textContent = "STORM ZONE AHEAD";
    warn.classList.toggle("show", (showStorm || showHole) && status === "playing");
  }

  function resize() {
    const stage = canvas.parentElement;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas._dpr = dpr;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = stage.clientWidth + "px";
    canvas.style.height = stage.clientHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  }

  function loop(now) {
    if (status !== "playing") return;
    const t = (typeof now === "number" && isFinite(now)) ? now : performance.now();
    const dt = Math.max(0, Math.min(t - lastFrame, 50));
    lastFrame = t;
    try {
      if (!paused) update(dt);
      else updateHud();
      render();
    } catch (err) {
      console.error(err);
    }
    raf = requestAnimationFrame(loop);
  }

  function showStart() {
    uiMode = "start";
    status = "idle";
    overlay.className = "";
    overlay.classList.remove("hidden", "countdown");
    document.getElementById("char-wrap").classList.remove("down");
    document.getElementById("char-wrap").hidden = false;
    const startBear = document.querySelector("#char-wrap img");
    if (startBear) startBear.src = "assets/character.png";
    document.getElementById("ov-title").hidden = false;
    document.getElementById("ov-title").textContent = "BullBear Bounce";
    document.getElementById("ov-tag").hidden = false;
    document.getElementById("ov-tag").textContent = "Bounce your way to the stars";
    const best = document.getElementById("ov-best");
    best.textContent = `BEST ${bestScore}m`;
    best.classList.toggle("show", bestScore > 0);
    document.getElementById("go-title").hidden = true;
    document.getElementById("go-score").hidden = true;
    document.getElementById("new-best").classList.remove("show");
    document.getElementById("go-stats").hidden = true;
    document.getElementById("count-num").hidden = true;
    btnPlay.hidden = false;
    btnPlay.textContent = "Play";
    btnPlay.classList.remove("btn-again");
    if (btnHow) btnHow.hidden = false;
    document.getElementById("ov-controls").hidden = false;
    hud.classList.remove("show");
    seedWorld();
    render();
  }

  function showCountdown(songSync) {
    uiMode = "countdown";
    overlay.className = "countdown";
    document.getElementById("char-wrap").hidden = true;
    document.getElementById("ov-title").hidden = true;
    document.getElementById("ov-tag").hidden = true;
    document.getElementById("ov-best").classList.remove("show");
    document.getElementById("go-title").hidden = true;
    document.getElementById("go-score").hidden = true;
    document.getElementById("new-best").classList.remove("show");
    document.getElementById("go-stats").hidden = true;
    btnPlay.hidden = true;
    btnPlay.classList.remove("btn-again");
    if (btnHow) btnHow.hidden = true;
    closeHow();
    document.getElementById("ov-controls").hidden = true;
    const num = document.getElementById("count-num");
    num.hidden = false;
    hud.classList.add("show");
    seedWorld();
    bouncePlayer();
    render();
    updateHud();
    const pop = (txt, init) => {
      num.textContent = txt;
      num.classList.toggle("init", !!init);
      num.style.animation = "none";
      void num.offsetWidth;
      num.style.animation = "countIn 0.7s ease";
    };
    if (songSync) {
      // Synced to "BullBear to the Moon": Countdown initiated, 3, 2, 1, lift off.
      const cues = [
        { t: 0, txt: "COUNTDOWN INITIATED", init: true, sfx: null },
        { t: SONG_CUE_3, txt: "3", sfx: sfxTick },
        { t: SONG_CUE_2, txt: "2", sfx: sfxTick },
        { t: SONG_CUE_1, txt: "1", sfx: sfxTick },
        { t: SONG_CUE_GO, txt: "GO", sfx: sfxGo }
      ];
      const t0 = performance.now();
      let ci = 0;
      const songClock = () => {
        if (music && !music.paused && music.currentTime > 0.02) return music.currentTime;
        return (performance.now() - t0) / 1000;
      };
      const tick = () => {
        if (uiMode !== "countdown") return;
        const t = songClock();
        while (ci < cues.length && t >= cues[ci].t) {
          const c = cues[ci++];
          pop(c.txt, c.init);
          if (c.txt === "GO") {
            sfxGo();
            setTimeout(startPlay, 450);
            return;
          }
        }
        requestAnimationFrame(tick);
      };
      tick();
      return;
    }
    let n = 3;
    num.classList.remove("init");
    num.textContent = "3";
    num.style.animation = "none";
    void num.offsetWidth;
    num.style.animation = "countIn 0.7s ease";
    sfxTick();
    const step = () => {
      n -= 1;
      if (n > 0) {
        num.textContent = String(n);
        num.style.animation = "none";
        void num.offsetWidth;
        num.style.animation = "countIn 0.7s ease";
        sfxTick();
        setTimeout(step, 700);
      } else {
        num.textContent = "GO";
        num.style.animation = "none";
        void num.offsetWidth;
        num.style.animation = "countIn 0.7s ease";
        sfxGo();
        setTimeout(startPlay, 450);
      }
    };
    setTimeout(step, 700);
  }

  function startPlay() {
    uiMode = "game";
    overlay.classList.add("hidden");
    hud.classList.add("show");
    if (status !== "idle" && platforms.length) {
      // keep the world prepared during countdown
    } else {
      seedWorld();
      bouncePlayer();
    }
    state.startTime = Date.now();
    status = "playing";
    lastFrame = performance.now();
    startMusic();
    updateHud();
    raf = requestAnimationFrame(loop);
  }

  function gameOver() {
    if (status !== "playing") return;
    status = "gameover";
    if (raf) cancelAnimationFrame(raf);
    sfxOver();
    const score = getScore();
    const isNew = saveBest(score);
    showGameOver(score, isNew);
  }

  function showGameOver(score, isNew) {
    uiMode = "gameover";
    overlay.className = "";
    overlay.classList.remove("hidden", "countdown");
    document.getElementById("char-wrap").hidden = false;
    document.getElementById("char-wrap").classList.add("down");
    const failBear = document.querySelector("#char-wrap img");
    if (failBear) failBear.src = "assets/character-fail.webp";
    document.getElementById("ov-title").hidden = true;
    document.getElementById("ov-tag").hidden = true;
    document.getElementById("ov-best").classList.remove("show");
    document.getElementById("go-title").hidden = false;
    const gs = document.getElementById("go-score");
    gs.hidden = false;
    gs.innerHTML = `${score}<span class="score-unit">m</span>`;
    document.getElementById("new-best").classList.toggle("show", isNew);
    const stats = document.getElementById("go-stats");
    stats.hidden = false;
    stats.innerHTML = `
      <div class="stat-pill"><span class="lbl">BEST</span><span class="val">${bestScore}m</span></div>
      <div class="stat-pill"><span class="lbl">POWER-UPS</span><span class="val">${state.powerUps}</span></div>
      <div class="stat-pill"><span class="lbl">MAX COMBO</span><span class="val">x${state.maxCombo}</span></div>
    `;
    document.getElementById("count-num").hidden = true;
    btnPlay.hidden = false;
    btnPlay.textContent = "Play Again";
    btnPlay.classList.add("btn-again");
    if (btnHow) btnHow.hidden = true;
    closeHow();
    document.getElementById("ov-controls").hidden = true;
    hud.classList.remove("show");
    warn.classList.remove("show");
    render();
  }

  /* ---------- input ---------- */
  function isTyping(el) {
    return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
  }
  window.addEventListener("keydown", (e) => {
    if (isTyping(e.target)) return;
    if (e.code === "ArrowLeft" || e.code === "KeyA") input.left = true;
    if (e.code === "ArrowRight" || e.code === "KeyD") input.right = true;
    if (e.code === "Escape" && howOpen) {
      e.preventDefault();
      closeHow();
      return;
    }
    if ((e.code === "Space" || e.code === "Enter") && (uiMode === "start" || uiMode === "gameover")) {
      e.preventDefault();
      if (howOpen) return;
      beginFromUi();
      return;
    }
    if (uiMode === "game" && status === "playing") {
      if (e.code === "Space" || e.code === "KeyW" || e.code === "ArrowUp") {
        e.preventDefault();
        tryZap();
      }
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") input.left = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") input.right = false;
  });

  function pointerX(clientX) {
    const r = canvas.getBoundingClientRect();
    input.touch = clientX < r.left + r.width / 2 ? -1 : 1;
  }
  function canvasToWorld(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    const x = ((clientX - r.left) / Math.max(1, r.width)) * W;
    const sy = ((clientY - r.top) / Math.max(1, r.height)) * H;
    return { x, y: state.cameraY + (H - sy) };
  }
  function tapOnBear(clientX, clientY) {
    if (!player) return false;
    const w = canvasToWorld(clientX, clientY);
    return Math.abs(w.x - player.x) < player.width * 0.55 && Math.abs(w.y - player.y) < player.height * 0.65;
  }
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    ensureAudio();
    if (e.touches[0]) {
      if (uiMode === "game" && tapOnBear(e.touches[0].clientX, e.touches[0].clientY) && tryZap()) {
        /* fired at the bear; don't steer on this tap */
      } else {
        pointerX(e.touches[0].clientX);
      }
    }
    touchHints.classList.add("show");
  }, { passive: false });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (e.touches[0]) pointerX(e.touches[0].clientX);
  }, { passive: false });
  canvas.addEventListener("touchend", () => { input.touch = 0; });
  canvas.addEventListener("mousedown", (e) => {
    if (uiMode !== "game") return;
    if (tapOnBear(e.clientX, e.clientY) && tryZap()) return;
    pointerX(e.clientX);
  });
  window.addEventListener("mousemove", (e) => {
    if (e.buttons === 1 && uiMode === "game") pointerX(e.clientX);
  });
  window.addEventListener("mouseup", () => { input.touch = 0; });

  function beginFromUi() {
    if (howOpen) return;
    if (uiMode === "countdown") return;
    ensureAudio();
    const songSync = !muted && trackIndex === 1 && music && (!musicStarted || music.paused);
    if (songSync) {
      try { music.currentTime = 0; } catch (e) {}
    }
    if (!muted) startMusic();
    showCountdown(songSync);
  }
  function openHow() {
    if (uiMode !== "start") return;
    howOpen = true;
    if (howPanel) howPanel.classList.add("open");
    if (howBody) howBody.scrollTop = 0;
    if (howClose) howClose.focus();
  }
  function closeHow() {
    howOpen = false;
    if (howPanel) howPanel.classList.remove("open");
  }
  btnPlay.addEventListener("click", beginFromUi);
  if (btnHow) btnHow.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openHow();
  });
  if (howClose) howClose.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeHow();
  });
  if (howPanel) howPanel.addEventListener("click", (e) => {
    if (e.target === howPanel) closeHow();
  });
  soundBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    ensureAudio();
    setMuted(!muted);
  });
  if (musicBtn) {
    musicBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      ensureAudio();
      setMusicMenuOpen(!(musicMenu && musicMenu.classList.contains("open")));
    });
  }
  if (musicMenu) {
    musicMenu.addEventListener("click", (e) => {
      const btn = e.target.closest(".track-btn");
      if (!btn) return;
      e.stopPropagation();
      ensureAudio();
      selectTrack(parseInt(btn.getAttribute("data-track"), 10));
    });
  }
  document.addEventListener("click", () => setMusicMenuOpen(false));

  window.addEventListener("resize", resize);

  function loadImg(src) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = src;
    });
  }

  function readCheat() {
    const q = new URLSearchParams(location.search);
    return {
      at: parseInt(q.get("startAt") || "0", 10) || 0,
      power: (q.get("power") || "").toLowerCase(),
      auto: q.has("auto") || !!q.get("startAt") || q.has("showcase"),
      showcase: q.has("showcase")
    };
  }
  function applyCheat(at, power) {
    if (at > 0) {
      const h = at * SCORE_DIV;
      platforms = [];
      powerUps = [];
      storms = [];
      particles = [];
      floats = [];
      coins = [];
      zaps = [];
      flashes = [];
      let y = Math.max(40, h - 280);
      const under = makePlatform(W / 2 - PLAT_W / 2, h - 50, at);
      under.type = "normal";
      under.moveDirection = 0;
      under.moveSpeed = 0;
      platforms.push(under);
      while (y < h + H + 400) {
        y += platformGap(y / SCORE_DIV);
        const plat = makePlatform(Math.random() * (W - PLAT_W), y, y / SCORE_DIV);
        platforms.push(plat);
        if (Math.random() < powerChance(y / SCORE_DIV)) powerUps.push(makePower(plat, y / SCORE_DIV));
        maybeCoins(plat, y / SCORE_DIV);
      }
      player.x = W / 2;
      player.y = h;
      player.vx = 0;
      player.vy = BOUNCE_V;
      state.maxHeight = h;
      state.cameraY = Math.max(0, h - H * 0.4);
      state.shownScore = at;
      state.lastZone = zoneName(at);
      state.lastMilestone = Math.floor(at / 500) * 500;
      extendStorms();
    }
    if (power === "rocket") {
      setEffect({ type: "rocket", startTime: Date.now(), duration: 12000 });
      rocketBoost();
    } else if (power === "weed" || power === "float") {
      setEffect({ type: "weed", startTime: Date.now(), duration: 12000 });
    } else if (power === "solonchain") {
      burst(player.x, player.y, 20, "rgba(255,213,0,0.95)", "boost", 8, 800);
      state.glow = 1;
    } else if (power === "shield") {
      setEffect({ type: "shield", startTime: Date.now(), duration: 20000 });
    } else if (power === "zap" || power === "bearzap") {
      setEffect({ type: "zap", startTime: Date.now(), duration: ZAP_MS, charges: ZAP_CHARGES });
    }
  }
  function applyShowcase() {
    const y = player.y;
    player.vx = 0;
    if (!hasEffect("rocket")) player.vy = 0;
    player.squash = hasEffect("rocket") ? SQUASH_ROCKET : 0.92;
    platforms = [];
    powerUps = [];
    coins = [];
    storms = [];
    floats = [];
    particles = [];
    zaps = [];
    flashes = [];

    const under = makePlatform(W / 2 - PLAT_W / 2, y - 48, getScore());
    under.type = "normal";
    under.moveDirection = 0;
    under.moveSpeed = 0;
    platforms.push(under);
    player.y = under.y + under.height / 2 + player.height / 2;

    const spr = makePlatform(W / 2 + 78, y + 70, getScore());
    spr.type = "spring";
    spr.moveDirection = 0;
    spr.moveSpeed = 0;
    platforms.push(spr);

    const cr = makePlatform(28, y + 70, getScore());
    cr.type = "normal";
    cr.hitCount = 1;
    cr.moveDirection = 0;
    cr.moveSpeed = 0;
    platforms.push(cr);

    for (let i = 0; i < 5; i++) {
      coins.push({
        id: nextCoinId++,
        x: W / 2 - 44 + i * 22,
        y: y + 128 + Math.abs(i - 2) * 8,
        r: 11,
        collected: false
      });
    }

    function addPow(type, x, py) {
      powerUps.push({
        id: nextPowId++, x, y: py,
        width: POWER_SIZE, height: POWER_SIZE, type, collected: false, platformId: under.id
      });
    }
    addPow("shield", 58, y + 155);
    addPow("rocket", 70, y + 230);
    addPow("weed", W - 58, y + 155);
    addPow("solonchain", W - 70, y + 230);

    storms.push(makeStorm(W / 2 + 40, y + 280, 0));

    setEffect({ type: "shield", startTime: Date.now(), duration: 20000 });
    state.combo = 4;
    state.maxCombo = 4;
    state.lastBounceAt = Date.now();
    state.coins = 6;
    addFloat(player.x - 10, under.y + 70, "PERFECT +4m", "#ffe27a");
    addFloat(spr.x + spr.width / 2, spr.y + 36, "BOOST", "#ffd56a");
    addFloat(W / 2 + 40, y + 150, "+5m", "#FFD700");
    state.cameraY = Math.max(0, y - H * 0.22);
    paused = true;
  }

  async function boot() {
    soundBtn.textContent = muted ? "🔇" : "🔊";
    updateTrackUI();
    loadBest();
    try {
      const loadOpt = (src) => loadImg(src).catch(() => null);
      const [ch, cl, cb, cc, cn, sh, rk, wd, so, st, zp, e, a, cld, at, sp, sp2, sp3, sp4, sp5, lbb, lbn, lpl, lrk, lmn, hole, holeRing] = await Promise.all([
        loadOpt("assets/character.png"),
        loadOpt("assets/cloud.webp"),
        loadOpt("assets/cloud-boost.webp"),
        loadOpt("assets/cloud-cracked.webp"),
        loadOpt("assets/coin.webp"),
        loadOpt("assets/shield.webp"),
        loadOpt("assets/rocket.webp"),
        loadOpt("assets/weed.webp"),
        loadOpt("assets/solonchain.webp"),
        loadOpt("assets/storm.webp"),
        loadOpt("assets/zap.webp"),
        loadOpt("assets/bg-earth.webp"),
        loadOpt("assets/bg-air.webp"),
        loadOpt("assets/bg-clouds.webp"),
        loadOpt("assets/bg-atmosphere.webp"),
        loadOpt("assets/bg-space.webp"),
        loadOpt("assets/bg-space2.webp"),
        loadOpt("assets/bg-space3.webp"),
        loadOpt("assets/bg-space4.webp"),
        loadOpt("assets/bg-space5.webp"),
        loadOpt("assets/landmark-billboard.webp"),
        loadOpt("assets/landmark-balloon.webp"),
        loadOpt("assets/landmark-plane.webp"),
        loadOpt("assets/landmark-rocket.webp"),
        loadOpt("assets/moon-bullbear.webp"),
        loadOpt("assets/blackhole.webp"),
        loadOpt("assets/blackhole-ring.webp")
      ]);
      images.character = ch;
      images.cloud = cl;
      images.cloudBoost = cb;
      images.cloudCracked = cc;
      images.coin = cn;
      images.shield = sh;
      images.rocket = rk;
      images.weed = wd;
      images.solonchain = so;
      images.storm = st;
      images.hole = hole;
      images.holeRing = holeRing;
      images.zap = zp;
      images.bg = { earth: e, air: a, clouds: cld, atmosphere: at, space: sp, spaces: [sp, sp2, sp3, sp4, sp5] };
      images.lm = { billboard: lbb, balloon: lbn, plane: lpl, rocket: lrk, moon: lmn };
    } catch (err) {
      console.warn("Some art failed to load, using fallbacks", err);
    }
    initDecor();
    resize();
    showStart();
    const cheat = readCheat();
    if (cheat.at > 0 || cheat.power || cheat.auto) {
      applyCheat(cheat.at, cheat.power);
      if (cheat.showcase) applyShowcase();
      overlay.classList.add("hidden");
      hud.classList.add("show");
      status = "playing";
      uiMode = "game";
      lastFrame = performance.now();
      updateHud();
      render();
      raf = requestAnimationFrame(loop);
    }
  }

  window.BBBounce = {
    start: beginFromUi,
    playNow: startPlay,
    getScore,
    getState: () => ({ uiMode, status, score: getScore(), combo: state.combo, best: bestScore, powerUps: state.powerUps, zone: zoneName(getScore()), cameraY: state.cameraY, zap: zapCharges(), teleport: teleport ? { phase: teleport.phase, clock: Math.round(teleport.clock) } : null, y: player ? player.y : 0, vy: player ? player.vy : 0, rocketCoast: !!(player && player.rocketCoast) }),
    setBot(v) { bot = !!v; },
    pause(v) { paused = v !== false; },
    tryZap,
    giveZap() {
      if (!player) return;
      setEffect({ type: "zap", startTime: Date.now(), duration: ZAP_MS, charges: ZAP_CHARGES });
    },
    giveRocket() {
      if (!player) return;
      setEffect({ type: "rocket", startTime: Date.now(), duration: ROCKET_MS });
      rocketBoost();
    },
    setMuted,
    gameOver,
    debugStart(at, power) {
      seedWorld();
      applyCheat(at || 0, power || "");
      overlay.classList.add("hidden");
      hud.classList.add("show");
      status = "playing";
      uiMode = "game";
      lastFrame = performance.now();
      updateHud();
      render();
      if (!raf) raf = requestAnimationFrame(loop);
    },
    debugTeleport(seekMs) {
      if (!player) {
        seedWorld();
        overlay.classList.add("hidden");
        hud.classList.add("show");
        status = "playing";
        uiMode = "game";
      }
      if (!teleport) {
        addFloat(player.x, player.y + 50, `+${SOLON_METERS}m`, "#FFD700");
        state.maxHeight += SOLON_METERS * SCORE_DIV;
        state.shownScore = getScore();
        beginTeleport(SOLON_METERS * SCORE_DIV);
      }
      if (seekMs != null && teleport) {
        teleport.clock = seekMs;
        syncTeleport();
      }
      updateHud();
      render();
    },
    debugTick(dt) {
      if (!player) return;
      update(Math.max(0, dt || 16));
      render();
    },
    debugStorm(x, y) {
      const sx = x != null ? x : Math.max(20, Math.min(W - STORM_W - 20, (player ? player.x : W / 2) + 70));
      const sy = y != null ? y : (player ? player.y + 90 : 200);
      storms.push(makeStorm(sx, sy, STORM_SPEED));
      render();
    }
  };

  boot();
})();
