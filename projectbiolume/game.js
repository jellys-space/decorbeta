/* Project Biolume - v1
   Canvas arcade shooter (underwater vibe)
   - Up/Down movement
   - Tap/click to shoot
   - Enemies spawn from right
   - Powerups: shield / railgun / multishot / +life
   - Local high scores (localStorage)
*/
(() => {

  let IS_MOBILE = false;
  let audioCtx = null;
  let musicGain = null;
  let currentMusicNode = null;
  let currentMusicUrl = null;
  let powerupImgs = {};
  let ARTISTS = [];
  const artistPfpCache = new Map();    // pfpUrl -> Image|null
  const decorCache = new Map();        // decorUrl -> Image|null

  function pickWeighted(list) {
    const total = list.reduce((s, a) => s + (a.weight || 1), 0);
    let r = Math.random() * total;
    for (const item of list) {
      r -= (item.weight || 1);
      if (r <= 0) return item;
    }
    return list[list.length - 1];
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }


  async function ensureAudioCtx() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.5; // default music volume
    musicGain.connect(audioCtx.destination);
  }

  async function loadAudioBuffer(url) {
    await ensureAudioCtx();
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    return await audioCtx.decodeAudioData(arr);
  }

  async function playSeamlessMusic(url, volume = 0.5) {
    if (audioState.musicMuted) return;

    await ensureAudioCtx();
    if (audioCtx.state === "suspended") {
      // must be resumed after a user gesture
      try { await audioCtx.resume(); } catch {}
    }

    // already playing same track
    if (currentMusicUrl === url && currentMusicNode) return;

    stopSeamlessMusic();

    const buffer = await loadAudioBuffer(url);
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    musicGain.gain.value = volume;
    src.connect(musicGain);
    src.start(0);

    currentMusicNode = src;
    currentMusicUrl = url;
  }

  function stopSeamlessMusic() {
    if (currentMusicNode) {
      try { currentMusicNode.stop(0); } catch {}
      try { currentMusicNode.disconnect(); } catch {}
    }
    currentMusicNode = null;
    currentMusicUrl = null;
  }

  // ----------------------------
  // CONFIG
  // ----------------------------
  const CDN_BASE = "https://cdn.jellys-space.vip/project_biolume"; // your CDN assets folder
  const ASSETS = {
    // You can replace these once you upload real files
    // Sprites (optional for v1; v1 draws simple shapes if these 404)
    playerSprite: `${CDN_BASE}/sprites/player/jelly_idle.png`,
    bulletSprite: `${CDN_BASE}/sprites/bullet.png`,
    artistsJson: `${CDN_BASE}/enemies/meta/artists.json`,

    powerupSprites: {
    shield: `${CDN_BASE}/sprites/shield.png`,
    railgun: `${CDN_BASE}/sprites/railgun.png`,
    multishot: `${CDN_BASE}/sprites/multishot.png`,
    life: `${CDN_BASE}/sprites/extra_life.png`,
    },

    // Audio (ogg as you mentioned)
    musicMenu: `${CDN_BASE}/music/menu.ogg`,
    musicGame: `${CDN_BASE}/music/ingame.ogg`,
    sfxShoot: `${CDN_BASE}/sound/shoot.ogg`,
    sfxEnemyHit: `${CDN_BASE}/sound/enemy_hit.ogg`,
    sfxPlayerHit: `${CDN_BASE}/sound/player_hit.ogg`,
    sfxPower: `${CDN_BASE}/sound/powerup.ogg`,
    sfxGameOver: `${CDN_BASE}/sound/game_over.ogg`,
  };

  // IMPORTANT: enemies will become your decor URLs later.
  // For now, v1 uses simple placeholder enemies so the game works immediately.
  const ENEMY_DECOR_URLS = []; // later: fill with real decor URLs from your data

  // Gameplay tuning
  const BASE_LIVES = 3;
  const PLAYER_X = 90;              // left-side anchor
  const SAFE_TOP_UI_BAR = 72;       // player can't enter (prevents HUD clipping)
  const SAFE_BOTTOM_PAD = 24;

  // Difficulty scaling
  const DIFF = {
    startSpawnEvery: 1200,  // ms
    minSpawnEvery: 420,
    enemySpeedMin: 120,    // px/s
    enemySpeedMax: 430,
    rampSeconds: 90,       // reaches near-max around this time
    powerupEvery: 18000,    // avg ms between powerup spawns
  };

  // Powerup durations (ms)
  const POWER = {
    shield: 6500,
    railgun: 5500,
    multishot: 6500,
  };

  // Shooting
  const FIRE = {
    cooldown: 180,        // ms between shots
    bulletSpeed: 760,     // px/s
  };

  // Local high score storage
  const SCORE_KEY = "project_biolume_scores_v1";
  const MAX_SCORES = 10;

  // ----------------------------
  // DOM
  // ----------------------------
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });

  const hudScore = document.getElementById("hudScore");
  const hudWave = document.getElementById("hudWave");
  const hudHeat = document.getElementById("hudHeat");
  const hudLives = document.getElementById("hudLives");
  const hudPower = document.getElementById("hudPower");

  const overlayMenu = document.getElementById("overlayMenu");
  const overlayHow = document.getElementById("overlayHow");
  const overlayOver = document.getElementById("overlayOver");

  const btnPlay = document.getElementById("btnPlay");
  const btnHow = document.getElementById("btnHow");
  const btnBackFromHow = document.getElementById("btnBackFromHow");
  const btnRetry = document.getElementById("btnRetry");
  const btnMenu = document.getElementById("btnMenu");
  const btnSubmitScore = document.getElementById("btnSubmitScore");

  const btnMuteMusic = document.getElementById("btnMuteMusic");
  const btnMuteSfx = document.getElementById("btnMuteSfx");
  const btnPause = document.getElementById("btnPause");

  const scoreList = document.getElementById("scoreList");
  const finalScore = document.getElementById("finalScore");
  const playerName = document.getElementById("playerName");
  const mobileHint = document.getElementById("mobileHint");
  const buildInfo = document.getElementById("buildInfo");

  buildInfo.textContent = "v1";

  // ----------------------------
  // UTIL
  // ----------------------------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const chance = (p) => Math.random() < p;

  function isLikelyMobile() {
    // simple fallback; you can replace with your own detection later
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  }

  // Canvas scaling: keep internal resolution stable-ish, but match to CSS size
  function resizeCanvasToDisplaySize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1); // cap DPR to keep perf stable
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function drawText(x, y, text, size = 14, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `900 ${size}px ui-sans-serif, system-ui`;
    ctx.fillStyle = "#e9f0ff";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function drawGlowCircle(x, y, r, inner = "rgba(114,247,210,.9)", outer = "rgba(114,247,210,.08)") {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // ----------------------------
  // AUDIO (safe, no crash if missing files)
  // ----------------------------
  const audioState = {
    musicMuted: false,
    sfxMuted: false,
    currentMusic: null,
  };

  function makeAudio(url, loop = false, volume = 0.7) {
    const a = new Audio();
    a.src = url;
    a.loop = loop;
    a.preload = "auto";
    a.volume = volume;
    return a;
  }

  const musicMenu = makeAudio(ASSETS.musicMenu, true, 0.45);
  const musicGame = makeAudio(ASSETS.musicGame, true, 0.5);

  const sfxShoot = makeAudio(ASSETS.sfxShoot, false, 0.12);
  const sfxEnemyHit = makeAudio(ASSETS.sfxEnemyHit, false, 0.55);
  const sfxPlayerHit = makeAudio(ASSETS.sfxPlayerHit, false, 0.6);
  const sfxPower = makeAudio(ASSETS.sfxPower, false, 0.55);
  const sfxGameOver = makeAudio(ASSETS.sfxGameOver, false, 0.7);


  function stopMusic() {
    // stop WebAudio music (seamless loop)
    stopSeamlessMusic();

    // also stop any HTMLAudio music if you still have it around
    [musicMenu, musicGame].forEach(a => {
      try { a.pause(); a.currentTime = 0; } catch {}
    });

    audioState.currentMusic = null;
  }


  async function playMusic(which) {
    if (audioState.musicMuted) return;

    // Use seamless WebAudio for GAME music (the short loop)
    if (which === "game") {
      await playSeamlessMusic(ASSETS.musicGame, 0.5);
      return;
    }

    // Keep menu music on HTMLAudio (fine if it has a tiny seam)
    const a = musicMenu;
    if (audioState.currentMusic === a) return;

    stopMusic();
    audioState.currentMusic = a;

    try { await a.play(); } catch {}
  }

  function playSfx(aud) {
    if (audioState.sfxMuted) return;
    try {
      aud.currentTime = 0;
      aud.play();
    } catch {}
  }

  function setMusicMuted(muted) {
    audioState.musicMuted = muted;
    btnMuteMusic.setAttribute("aria-pressed", String(muted));
    btnMuteMusic.textContent = muted ? "Music: Off" : "Music: On";
    if (muted) stopMusic();
  }

  function setSfxMuted(muted) {
    audioState.sfxMuted = muted;
    btnMuteSfx.setAttribute("aria-pressed", String(muted));
    btnMuteSfx.textContent = muted ? "SFX: Off" : "SFX: On";
  }

  // ----------------------------
  // IMAGES (optional)
  // ----------------------------
  function loadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  let playerImg = null;
  let bulletImg = null;

  async function loadArtists() {
    try {
      const res = await fetch(ASSETS.artistsJson, { cache: "no-cache" });
      const json = await res.json();

      const pfpBase = json.pfpBase || "";
      const artists = Array.isArray(json.artists) ? json.artists : [];

      // Build ARTISTS with resolved URLs + preloaded images
      const built = [];
      for (const a of artists) {
        const pfpUrl = (a.pfp || "").startsWith("http")
          ? a.pfp
          : (pfpBase + (a.pfp || ""));

        const decorList = Array.isArray(a.decor) ? a.decor : [];
        const decorUrl = decorList.length ? decorList[0] : null;

        built.push({
          id: a.id || a.name || pfpUrl,
          name: a.name || a.id || "Unknown",
          weight: a.weight || 1,
          pfpUrl,
          decor: decorList,
          // optional per-artist tuning if you add later:
          decorScale: (typeof a.decorScale === "number" ? a.decorScale : 1.0),
          decorOffset: Array.isArray(a.decorOffset) ? a.decorOffset : [0, 0],
          pfpImg: null,
          decorImg: null,
        });
      }

      // Preload pfps + first decor for each artist (fast for your current “1 decor each” test)
      await Promise.all(built.map(async (a) => {
        if (a.pfpUrl) {
          a.pfpImg = await loadImage(a.pfpUrl);
          artistPfpCache.set(a.pfpUrl, a.pfpImg);
        }
        const firstDecor = a.decor[0];
        if (firstDecor) {
          a.decorImg = await loadImage(firstDecor);
          decorCache.set(firstDecor, a.decorImg);
        }
      }));

      ARTISTS = built.filter(a => a.pfpImg); // require at least pfp to render nicely
      console.log("[Project Biolume] Loaded artists:", ARTISTS.length);
    } catch (err) {
      console.warn("[Project Biolume] Failed to load artists.json", err);
      ARTISTS = [];
    }
  }

  // ----------------------------
  // GAME STATE
  // ----------------------------
  const state = {
    mode: "menu",     // menu | how | play | over
    paused: false,
    time: 0,
    score: 0,
    lives: BASE_LIVES,
    wave: 1,
    heat: 0,          // 0..1
    invulnUntil: 0,
    lastShotAt: 0,
    railgunUntil: 0,
    multishotUntil: 0,
    shieldUntil: 0,

    // entities
    player: { x: PLAYER_X, y: 270, r: 18, vy: 0 },
    bullets: [],
    enemies: [],
    particles: [],
    powerups: [],

    // spawners
    nextEnemyAt: 0,
    nextPowerAt: 0,

    // input
    up: false,
    down: false,
    shooting: false,
    pointerDown: false,
    pointerY: null,
  };

  // ----------------------------
  // HIGH SCORES
  // ----------------------------
  function loadScores() {
    try {
      const raw = localStorage.getItem(SCORE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function saveScores(arr) {
    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(arr.slice(0, MAX_SCORES)));
    } catch {}
  }

  function renderScores() {
    const scores = loadScores();
    scoreList.innerHTML = "";
    if (scores.length === 0) {
      scoreList.innerHTML = `<li><small>No scores yet. Be the first.</small></li>`;
      return;
    }
    for (const s of scores) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${escapeHtml(s.name)}</strong> — ${s.score.toLocaleString()} <small>(wave ${s.wave})</small>`;
      scoreList.appendChild(li);
    }
  }

  function addScore(name, score, wave) {
    const scores = loadScores();
    const entry = { name: (name || "Jelly").slice(0, 16), score, wave, ts: Date.now() };
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    saveScores(scores);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
  }

  // ----------------------------
  // UI HELPERS
  // ----------------------------
  function showOverlay(which) {
    overlayMenu.classList.toggle("show", which === "menu");
    overlayHow.classList.toggle("show", which === "how");
    overlayOver.classList.toggle("show", which === "over");

    overlayMenu.setAttribute("aria-hidden", String(which !== "menu"));
    overlayHow.setAttribute("aria-hidden", String(which !== "how"));
    overlayOver.setAttribute("aria-hidden", String(which !== "over"));
  }

  function setMode(mode) {
    state.mode = mode;
    state.paused = false;
    btnPause.setAttribute("aria-pressed", "false");
    btnPause.textContent = "Pause";

    if (mode === "menu") {
      showOverlay("menu");
      playMusic("menu");
    } else if (mode === "how") {
      showOverlay("how");
    } else if (mode === "play") {
      showOverlay(null);
      playMusic("game");
    } else if (mode === "over") {
      showOverlay("over");
      stopMusic();
    }
  }

  function updateHud() {
    hudScore.textContent = state.score.toLocaleString();
    hudWave.textContent = String(state.wave);
    hudHeat.textContent = `${Math.round(state.heat * 100)}%`;
    hudLives.textContent = "♥".repeat(state.lives) + "·".repeat(Math.max(0, BASE_LIVES - state.lives));

    let p = "—";
    const now = performance.now();
    if (now < state.shieldUntil) p = "Shield";
    if (now < state.multishotUntil) p = (p === "—") ? "Multishot" : `${p} + Multishot`;
    if (now < state.railgunUntil) p = (p === "—") ? "Railgun" : `${p} + Railgun`;
    hudPower.textContent = p;
  }

  // ----------------------------
  // GAME RESET
  // ----------------------------
  function resetGame() {
    state.time = 0;
    state.score = 0;
    state.lives = BASE_LIVES;
    state.wave = 1;
    state.heat = 0;
    state.invulnUntil = 0;
    state.lastShotAt = 0;

    state.railgunUntil = 0;
    state.multishotUntil = 0;
    state.shieldUntil = 0;

    state.player.x = PLAYER_X;
    state.player.y = 270;
    state.player.vy = 0;

    state.bullets.length = 0;
    state.enemies.length = 0;
    state.particles.length = 0;
    state.powerups.length = 0;

    const now = performance.now();
    state.nextEnemyAt = now + 600;
    state.nextPowerAt = now + rand(DIFF.powerupEvery * 0.6, DIFF.powerupEvery * 1.4);
    updateHud();
  }

  // ----------------------------
  // ENTITIES
  // ----------------------------
  function spawnEnemy() {
    const w = canvas.width;
    const h = canvas.height;

    const base = DIFF.enemySpeedMin + (DIFF.enemySpeedMax - DIFF.enemySpeedMin) * state.heat;
    const speed = base * rand(0.85, 1.15);

    const r = rand(20, 30); // slightly chunkier so art reads better

    const y = rand(SAFE_TOP_UI_BAR + r + 6, h - SAFE_BOTTOM_PAD - r - 6);
    const x = w + r + 10;

    // pick artist + decor
    const artist = ARTISTS.length ? pickWeighted(ARTISTS) : null;
    const decorUrl = artist?.decor?.length ? pickRandom(artist.decor) : null;

    // get (or lazy-load) decor image if needed
    let decorImg = decorUrl ? decorCache.get(decorUrl) : null;
    if (decorUrl && decorImg === undefined) {
      decorCache.set(decorUrl, null);
      loadImage(decorUrl).then(img => decorCache.set(decorUrl, img));
      decorImg = null;
    }

    const e = {
      x, y, r,
      vx: -speed,
      vy: rand(-18, 18),
      hp: 1,
      kind: "artistDecor",
      artistName: artist?.name || "Decor",
      pfpImg: artist?.pfpImg || null,
      decorUrl,
      decorImg,
      decorScale: artist?.decorScale ?? 1.0,
      decorOffset: artist?.decorOffset ?? [0, 0],
    };

    state.enemies.push(e);
  }


  function spawnPowerup() {
    const w = canvas.width;
    const h = canvas.height;

    const types = ["shield", "railgun", "multishot", "life"];
    // life a bit rarer
    const t = chance(0.18) ? "life" : types[Math.floor(rand(0, 3))];

    const p = {
      type: t,
      x: w + 20,
      y: rand(SAFE_TOP_UI_BAR + 40, h - SAFE_BOTTOM_PAD - 40),
      r: 14,
      vx: -rand(150, 220),
      spin: rand(-2, 2),
      a: 0,
      floatPhase: Math.random() * Math.PI * 2
    };
    state.powerups.push(p);
  }

  function fire() {
    const now = performance.now();
    if (now - state.lastShotAt < FIRE.cooldown) return;

    state.lastShotAt = now;

    const multi = now < state.multishotUntil;
    const angles = multi ? [-0.22, 0, 0.22] : [0];

    for (const ang of angles) {
      state.bullets.push({
        x: state.player.x + 24,
        y: state.player.y,
        vx: Math.cos(ang) * FIRE.bulletSpeed,
        vy: Math.sin(ang) * FIRE.bulletSpeed,
        r: 7,
        ttl: ((canvas.width - (state.player.x + 24)) / FIRE.bulletSpeed) * 1000 + 250,
      });
    }

    playSfx(sfxShoot);
  }

  function railgunAutoFire(dt) {
    const now = performance.now();
    if (now >= state.railgunUntil) return;
    // auto-fire continuously at a faster cadence
    const saved = FIRE.cooldown;
    FIRE.cooldown = 80;
    if (state.time % 2 < 1) fire(); // cheap throttling via state.time (works fine)
    FIRE.cooldown = saved;
  }

  function hitPlayer() {
    const now = performance.now();
    if (now < state.invulnUntil) return;

    // shield absorbs
    if (now < state.shieldUntil) {
      state.shieldUntil = 0;
      state.invulnUntil = now + 450;
      playSfx(sfxPlayerHit);
      burst(state.player.x + 10, state.player.y, "rgba(114,247,210,.8)");
      return;
    }

    state.lives -= 1;
    state.invulnUntil = now + 1000;
    playSfx(sfxPlayerHit);
    burst(state.player.x + 10, state.player.y, "rgba(255,106,136,.85)");

    if (state.lives <= 0) {
      gameOver();
    }
  }

  function applyPowerup(type) {
    const now = performance.now();
    playSfx(sfxPower);

    if (type === "life") {
      state.lives = clamp(state.lives + 1, 0, BASE_LIVES);
      return;
    }
    if (type === "shield") state.shieldUntil = now + POWER.shield;
    if (type === "railgun") state.railgunUntil = now + POWER.railgun;
    if (type === "multishot") state.multishotUntil = now + POWER.multishot;
  }

  // particles
  function burst(x, y, color) {
    for (let i = 0; i < 18; i++) {
      state.particles.push({
        x, y,
        vx: rand(-220, 220),
        vy: rand(-220, 220),
        r: rand(1.5, 3.5),
        ttl: rand(350, 650),
        color
      });
    }
  }

  // collisions
  function circleHit(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const rr = a.r + b.r;
    return (dx * dx + dy * dy) <= rr * rr;
  }

  // ----------------------------
  // GAME FLOW
  // ----------------------------
  function gameOver() {
    state.mode = "over";
    finalScore.textContent = state.score.toLocaleString();
    try { playerName.value = playerName.value || "Jelly"; } catch {}

    stopMusic();                 // ✅ ADD THIS
    showOverlay("over");
    playSfx(sfxGameOver);
  }


  // ----------------------------
  // INPUT
  // ----------------------------
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") state.up = true;
    if (e.key === "ArrowDown") state.down = true;

    if (e.key === " " || e.key === "Enter") {
      // optional: keyboard shooting
      if (state.mode === "play") state.shooting = true;
    }

    if (e.key.toLowerCase() === "p") togglePause();
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp") state.up = false;
    if (e.key === "ArrowDown") state.down = false;

    if (e.key === " " || e.key === "Enter") state.shooting = false;
  });

  // pointer (mouse/touch)
  function getPointerY(ev) {
    const rect = canvas.getBoundingClientRect();
    const clientY = (ev.touches && ev.touches[0]) ? ev.touches[0].clientY : ev.clientY;
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    return y;
  }

  canvas.addEventListener("pointerdown", (e) => {
  if (state.mode !== "play") return;

  // TOUCH: drag-to-move + auto-fire while touching
  if (e.pointerType === "touch") {
    state.pointerDown = true;
    state.pointerY = getPointerY(e);
    state.shooting = true;   // <— auto-fire starts immediately
  } else {
    // DESKTOP: click-to-fire
    state.shooting = true;
  }

  playMusic("game");
});

canvas.addEventListener("pointermove", (e) => {
  if (state.mode !== "play") return;
  if (e.pointerType !== "touch") return;
  if (!state.pointerDown) return;

  state.pointerY = getPointerY(e);
});


window.addEventListener("pointerup", (e) => {
  // always stop firing on release
  state.shooting = false;

  // touch release ends drag movement
  if (e.pointerType === "touch") {
    state.pointerDown = false;
    state.pointerY = null;
  }
});

canvas.addEventListener("pointercancel", () => {
  state.shooting = false;
  state.pointerDown = false;
  state.pointerY = null;
});

  // prevent touch scrolling while playing
  canvas.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
  canvas.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });

  // ----------------------------
  // BUTTONS
  // ----------------------------
  btnPlay.addEventListener("click", async () => {
    // user gesture unlocks audio
    await playMusic("game");
    resetGame();
    setMode("play");
  });

  btnHow.addEventListener("click", () => setMode("how"));
  btnBackFromHow.addEventListener("click", () => setMode("menu"));

  btnRetry.addEventListener("click", async () => {
    await playMusic("game");
    resetGame();
    setMode("play");
  });

  btnMenu.addEventListener("click", () => {
    stopMusic(); 
    setMode("menu");
    renderScores();
  });

  btnSubmitScore.addEventListener("click", () => {
    addScore(playerName.value || "Jelly", state.score, state.wave);
    renderScores();
    setMode("menu");
  });

  btnMuteMusic.addEventListener("click", () => setMusicMuted(!audioState.musicMuted));
  btnMuteSfx.addEventListener("click", () => setSfxMuted(!audioState.sfxMuted));

  btnPause.addEventListener("click", () => togglePause());

  function togglePause() {
    if (state.mode !== "play") return;
    state.paused = !state.paused;
    btnPause.setAttribute("aria-pressed", String(state.paused));
    btnPause.textContent = state.paused ? "Resume" : "Pause";
    if (state.paused) {
      // keep music playing; feels nicer
    }
  }

  // ----------------------------
  // UPDATE LOOP
  // ----------------------------
  let lastT = performance.now();

  function update(dtMs) {
    resizeCanvasToDisplaySize();

    const dt = dtMs / 1000;
    state.time += dtMs;

    // heat ramps 0..1
    const seconds = state.time / 1000;
    state.heat = clamp(seconds / DIFF.rampSeconds, 0, 1);

    // wave is a readable proxy of time survived
    state.wave = Math.max(1, Math.floor(seconds / 18) + 1);

    // input -> player target velocity
    const h = canvas.height;
    const minY = SAFE_TOP_UI_BAR + state.player.r + 6;
    const maxY = h - SAFE_BOTTOM_PAD - state.player.r - 6;

    let targetVy = 0;
    const speed = IS_MOBILE ? 600 : 620;

    if (state.up) targetVy -= speed;
    if (state.down) targetVy += speed;

    // pointer drag overrides keys if active
    if (state.pointerDown && typeof state.pointerY === "number") {
      // smooth follow
      const dy = state.pointerY - state.player.y;
      const maxDragSpeed = IS_MOBILE ? 800 : 720;
      targetVy = clamp(dy * 10, -maxDragSpeed, maxDragSpeed);
    }

    // jelly inertia (smooth)
    state.player.vy += (targetVy - state.player.vy) * clamp(dt * 10, 0, 1);
    state.player.y += state.player.vy * dt;
    state.player.y = clamp(state.player.y, minY, maxY);

    // shooting
    if (state.shooting) fire();
    railgunAutoFire(dt);

    // spawn enemies
    const now = performance.now();
    const spawnEvery = clamp(
      DIFF.startSpawnEvery - state.heat * (DIFF.startSpawnEvery - DIFF.minSpawnEvery),
      DIFF.minSpawnEvery,
      DIFF.startSpawnEvery
    );

    if (now >= state.nextEnemyAt) {
      spawnEnemy();
      // occasionally spawn extra enemy at high heat
      if (state.heat > 0.6 && chance(0.08)) spawnEnemy();
      state.nextEnemyAt = now + spawnEvery * rand(0.75, 1.2);
    }

    // spawn powerups (random-ish)
    if (now >= state.nextPowerAt) {
      spawnPowerup();
      state.nextPowerAt = now + rand(DIFF.powerupEvery * 0.6, DIFF.powerupEvery * 1.4);
    }

    // update bullets
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.ttl -= dtMs;
      if (b.ttl <= 0 || b.x > canvas.width + 50 || b.y < -50 || b.y > canvas.height + 50) {
        state.bullets.splice(i, 1);
      }
    }

    // update enemies
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      e.x += e.vx * dt;
      e.y += e.vy * dt;

      // bounce softly in bounds
      if (e.y < SAFE_TOP_UI_BAR + e.r + 8) { e.y = SAFE_TOP_UI_BAR + e.r + 8; e.vy *= -1; }
      if (e.y > canvas.height - SAFE_BOTTOM_PAD - e.r - 8) { e.y = canvas.height - SAFE_BOTTOM_PAD - e.r - 8; e.vy *= -1; }

      // if reaches player line -> hit
      if (e.x - e.r <= state.player.x + state.player.r) {
        state.enemies.splice(i, 1);
        hitPlayer();
        continue;
      }

      // bullet collisions
      for (let j = state.bullets.length - 1; j >= 0; j--) {
        const b = state.bullets[j];
        if (circleHit(e, b)) {
          state.bullets.splice(j, 1);
          state.enemies.splice(i, 1);

          state.score += Math.floor(10 + 10 * state.heat); // scales with heat
          burst(e.x, e.y, "rgba(122,166,255,.85)");
          playSfx(sfxEnemyHit);
          break;
        }
      }
    }

    // powerups
    for (let i = state.powerups.length - 1; i >= 0; i--) {
      const p = state.powerups[i];
      p.x += p.vx * dt;
      p.a += dt * p.spin;

      if (p.x < -60) {
        state.powerups.splice(i, 1);
        continue;
      }

      // collect
      const hit = circleHit(p, { x: state.player.x, y: state.player.y, r: state.player.r + 8 });
      if (hit) {
        applyPowerup(p.type);
        burst(p.x, p.y, "rgba(114,247,210,.85)");
        state.powerups.splice(i, 1);
      }
    }

    // particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.ttl -= dtMs;
      if (p.ttl <= 0) state.particles.splice(i, 1);
    }

    updateHud();
  }

  // ----------------------------
  // RENDER
  // ----------------------------
  function render() {
    const w = canvas.width;
    const h = canvas.height;

    // background
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, w, h);

    // underwater haze gradient
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(114,247,210,.09)");
    g.addColorStop(0.6, "rgba(122,166,255,.06)");
    g.addColorStop(1, "rgba(0,0,0,.25)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // subtle bubbles
    const t = performance.now() / 1000;
    for (let i = 0; i < 28; i++) {
      const bx = (i * 97 + (t * 24)) % (w + 120) - 60;
      const by = (i * 53 + (t * 18)) % (h + 120) - 60;
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "rgba(233,240,255,.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bx, h - by, 8 + (i % 4), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // safe UI bar (invisible, but we can draw a faint line)
    ctx.strokeStyle = "rgba(27,42,75,.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, SAFE_TOP_UI_BAR);
    ctx.lineTo(w, SAFE_TOP_UI_BAR);
    ctx.stroke();

    // powerups
    for (const p of state.powerups) {
        const img = powerupImgs[p.type];

        // soft glow behind sprite
        drawGlowCircle(
        p.x,
        p.y,
        26,
        "rgba(114,247,210,.35)",
        "rgba(0,0,0,0)"
    );

    if (img) {
        const floatY = Math.sin(performance.now() / 500 + p.floatPhase) * 3;
        ctx.save();
        ctx.translate(p.x, p.y + floatY);
        ctx.rotate(p.a || 0);
        ctx.drawImage(img, -25, -25, 50, 50);
        ctx.restore();
    } else {
        // fallback if image missing
        ctx.fillStyle = "rgba(114,247,210,.9)";
        ctx.fillRect(p.x - 10, p.y - 10, 20, 20);
    }
    }


    // enemies (artist PFP + decor)
    // NOTE: decor should sit on top of the PFP (your request)
    for (const e of state.enemies) {
      // if decor loaded after spawn, grab it from cache
      if (e.decorUrl && !e.decorImg) {
        const cached = decorCache.get(e.decorUrl);
        if (cached) e.decorImg = cached;
      }

      // subtle outer glow
      drawGlowCircle(e.x, e.y, e.r * 2.1, "rgba(114,247,210,.10)", "rgba(0,0,0,0)");

      // --- PFP layer (behind) ---
      if (e.pfpImg) {
        const size = e.r * 2.0;

        ctx.save();
        // clip to circle for cleanliness
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(e.pfpImg, e.x - size / 2, e.y - size / 2, size, size);
        ctx.restore();

        // faint ring
        ctx.strokeStyle = "rgba(233,240,255,.18)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // fallback pfp
        ctx.fillStyle = "rgba(233,240,255,.7)";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- DECOR layer (on top) ---
      if (e.decorImg) {
        // draw decor slightly larger so it feels like "armor"
        const box = e.r * 2.0 * (e.decorScale || 1.0);
        const ox = (e.decorOffset?.[0] || 0);
        const oy = (e.decorOffset?.[1] || 0);

        ctx.save();
        ctx.globalAlpha = 1;
        ctx.drawImage(e.decorImg, e.x - box / 2 + ox, e.y - box / 2 + oy, box, box);
        ctx.restore();
      }
    }

    // bullets (sprite-based lightning with subtle glow)
    for (const b of state.bullets) {
    if (!bulletImg) continue;

    ctx.save();
    ctx.translate(b.x, b.y);

    const ang = Math.atan2(b.vy, b.vx);
    ctx.rotate(ang);

    // ---- soft glow pass ----
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.45;
    ctx.shadowColor = "rgba(120,180,255,0.8)";
    ctx.shadowBlur = 18;

    ctx.drawImage(
        bulletImg,
        0, 0,
        bulletImg.width,
        bulletImg.height,
        -20,
        -10,
        70,   // slightly larger than core
        20
    );

    // ---- core bolt ----
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    ctx.drawImage(
        bulletImg,
        0, 0,
        bulletImg.width,
        bulletImg.height,
        -18,
        -8,
        60,   // core size
        16
    );

    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
    }

    // player
    const now = performance.now();
    const invuln = now < state.invulnUntil;
    const shield = now < state.shieldUntil;

    // shield bubble
    if (shield) {
      drawGlowCircle(state.player.x, state.player.y, 44, "rgba(114,247,210,.18)", "rgba(114,247,210,.02)");
      ctx.strokeStyle = "rgba(114,247,210,.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(state.player.x, state.player.y, 34, 0, Math.PI * 2);
      ctx.stroke();
    }

    // player body (simple jellyfish silhouette)
    ctx.globalAlpha = invuln ? 0.5 : 1;
    drawGlowCircle(state.player.x, state.player.y, 36, "rgba(122,166,255,.14)", "rgba(0,0,0,0)");

    ctx.fillStyle = "rgba(233,240,255,.92)";
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y - 6, 16, Math.PI, 0);
    ctx.quadraticCurveTo(state.player.x + 16, state.player.y + 18, state.player.x, state.player.y + 14);
    ctx.quadraticCurveTo(state.player.x - 16, state.player.y + 18, state.player.x - 16, state.player.y - 6);
    ctx.fill();

    // tentacles
    ctx.strokeStyle = "rgba(233,240,255,.75)";
    ctx.lineWidth = 2;
    for (let i = -10; i <= 10; i += 5) {
      ctx.beginPath();
      ctx.moveTo(state.player.x + i, state.player.y + 12);
      ctx.quadraticCurveTo(state.player.x + i + 8, state.player.y + 22, state.player.x + i, state.player.y + 32 + Math.sin(t * 2 + i) * 4);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // particles
    for (const p of state.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = clamp(p.ttl / 600, 0, 1);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // pause overlay text
    if (state.mode === "play" && state.paused) {
      ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.fillRect(0, 0, w, h);
      drawText(w / 2 - 48, h / 2, "PAUSED", 24, 1);
      drawText(w / 2 - 110, h / 2 + 28, "Press P or tap Pause to resume", 14, 0.9);
    }
  }

  // polyfill for roundRect (older browsers)
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      this.beginPath();
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      this.closePath();
      return this;
    };
  }

  // ----------------------------
  // MAIN LOOP
  // ----------------------------
  function tick(t) {
    const dt = t - lastT;
    lastT = t;

    if (state.mode === "play" && !state.paused) {
      update(dt);
    } else {
      // still resize + render
      resizeCanvasToDisplaySize();
    }
    render();

    requestAnimationFrame(tick);
  }

  // ----------------------------
  // INIT
  // ----------------------------
  async function init() {
    // optional sprite loads (won't break if missing)
    [playerImg, bulletImg] = await Promise.all([
      loadImage(ASSETS.playerSprite),
      loadImage(ASSETS.bulletSprite),
    ]);

    // load powerup sprites
    for (const [type, url] of Object.entries(ASSETS.powerupSprites)) {
        powerupImgs[type] = await loadImage(url);
    }

    await loadArtists();

    // UI defaults
    setMusicMuted(false);
    setSfxMuted(false);

    // show mobile hint
    IS_MOBILE = isLikelyMobile();
    if (IS_MOBILE) mobileHint.style.display = "block";
    document.body.classList.toggle("is-mobile", IS_MOBILE);

    renderScores();
    setMode("menu");

    // Start loop
    requestAnimationFrame((t) => {
      lastT = t;
      tick(t);
    });

    // Try to play menu music (may be blocked until user gesture)
    playMusic("menu");
  }

  init();
})();
