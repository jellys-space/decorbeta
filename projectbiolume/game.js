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
  const audioBufferCache = new Map(); // url -> AudioBuffer
  let powerupImgs = {};
  let ARTISTS = [];
  const artistPfpCache = new Map();    // pfpUrl -> Image|null
  const decorCache = new Map();        // decorUrl -> Image|null
  let lastShootSfxAt = 0;
  const IOS_SHOOT_SFX_COOLDOWN_MS = 220; // try 120 first (8.3 plays/sec)
  let shootBuf = null;
  let sfxBus = null;
  const sfxBufferCache = new Map(); // url -> AudioBuffer

  async function ensureSfxBus() {
    await ensureAudioCtx();
    if (!sfxBus) {
      sfxBus = audioCtx.createGain();
      sfxBus.gain.value = 0.40; // master SFX level (tweak)
      sfxBus.connect(audioCtx.destination);
    }
  }

  async function loadShootBuffer() {
    await ensureSfxBus();
    if (!shootBuf) shootBuf = await loadAudioBuffer(ASSETS.sfxShoot);
  }

  function unmuteMusicAfterIOSWarmup(delayMs = 250) {
    if (!isIOS() || !musicGain || !audioCtx) return;

    // Make sure we're muted *now*
    musicGain.gain.cancelScheduledValues(audioCtx.currentTime);
    musicGain.gain.setValueAtTime(0, audioCtx.currentTime);

    // Then hard-unmute (no fade) shortly after
    const t = audioCtx.currentTime + delayMs / 1000;
    musicGain.gain.setValueAtTime(0.45, t); // menu volume
  }
  
  function findLoopPoints(buffer, threshold = 1e-4, padSeconds = 0.02) {
    const ch = buffer.getChannelData(0);
    const sr = buffer.sampleRate;

    let start = 0;
    while (start < ch.length && Math.abs(ch[start]) < threshold) start++;

    let end = ch.length - 1;
    while (end > start && Math.abs(ch[end]) < threshold) end--;

    const pad = Math.floor(padSeconds * sr);
    start = Math.max(0, start - pad);
    end = Math.min(ch.length - 1, end + pad);

    return { loopStart: start / sr, loopEnd: end / sr };
  }
  
  function playShootWebAudio(vol = 0.2) {
    if (audioState.sfxMuted || !shootBuf) return;

    const src = audioCtx.createBufferSource();
    src.buffer = shootBuf;

    const g = audioCtx.createGain();
    g.gain.value = vol; // per-shot volume

    src.connect(g);
    g.connect(sfxBus);
    src.start();
  }

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

  async function getAudioBuffer(url) {
    if (audioBufferCache.has(url)) return audioBufferCache.get(url);
    const buf = await loadAudioBuffer(url);
    audioBufferCache.set(url, buf);
    return buf;
  }

  async function getSfxBuffer(url) {
    await ensureSfxBus();
    if (sfxBufferCache.has(url)) return sfxBufferCache.get(url);
    const buf = await loadAudioBuffer(url);
    sfxBufferCache.set(url, buf);
    return buf;
  }

  function playSfxBuffer(url, vol = 1) {
    if (audioState.sfxMuted || !audioCtx || !sfxBus) return;
    const buf = sfxBufferCache.get(url);
    if (!buf) return; // not loaded yet

    const src = audioCtx.createBufferSource();
    src.buffer = buf;

    const g = audioCtx.createGain();
    g.gain.value = vol;

    src.connect(g);
    g.connect(sfxBus);
    src.start();
  }

  function iosKickstartAudio() {
    if (!isIOS() || !audioCtx) return;

    // Play a near-zero-length silent buffer to wake iOS audio output immediately
    const buf = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;

    const g = audioCtx.createGain();
    g.gain.value = 0;

    src.connect(g);
    g.connect(audioCtx.destination);

    try {
      src.start(audioCtx.currentTime);
      src.stop(audioCtx.currentTime + 0.01);
    } catch {}
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

    const buffer = await getAudioBuffer(url);
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    // ✅ Loop the entire buffer (fixes “gap” caused by trimming)
    src.loopStart = 0;
    src.loopEnd = buffer.duration;


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
    pusher: `${CDN_BASE}/sprites/pusher.png`,
    stungun: `${CDN_BASE}/sprites/stungun.png`,
    multiplier: `${CDN_BASE}/sprites/multiplier.png`,
    capture: `${CDN_BASE}/sprites/capture_net.png`,
    },

    // Audio (mp3 as you mentioned)
    musicMenu: `${CDN_BASE}/music/mainmenu.mp3`,
    musicGame: `${CDN_BASE}/music/maintheme.mp3`,
    sfxShoot: `${CDN_BASE}/sound/shoot.mp3`,
    sfxEnemyHit: `${CDN_BASE}/sound/enemy_hit.mp3`,
    sfxPlayerHit: `${CDN_BASE}/sound/player_hit.mp3`,
    sfxPower: `${CDN_BASE}/sound/powerup.mp3`,
    sfxGameOver: `${CDN_BASE}/sound/game_over.mp3`,
  };

  // IMPORTANT: enemies will become your decor URLs later.
  // For now, v1 uses simple placeholder enemies so the game works immediately.
  const ENEMY_DECOR_URLS = []; // later: fill with real decor URLs from your data

  // Gameplay tuning
  const BASE_LIVES = 5;
  const PLAYER_X = 90;              // left-side anchor
  const SAFE_TOP_UI_BAR = 72;       // player can't enter (prevents HUD clipping)
  const SAFE_BOTTOM_PAD = 24;

  // Difficulty scaling
  const DIFF = {
    startSpawnEvery: 1200,  // ms
    minSpawnEvery: 420,
    enemySpeedMin: 120,    // px/s
    enemySpeedMax: 430,
    rampSeconds: 180,      // 100% heat around ~wave 10 (20s waves)
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
  const overlayOver = document.getElementById("overlayOver");
  const overlayBoot = document.getElementById("overlayBoot");
  const overlayLoading = document.getElementById("overlayLoading");
  const overlayDebug = document.getElementById("overlayDebug");
  const btnDebugClose = document.getElementById("btnDebugClose");
  const dbgLock = document.getElementById("dbgLock");
  const dbgWave = document.getElementById("dbgWave");
  const dbgHeat = document.getElementById("dbgHeat");
  const btnDbgApplyWave = document.getElementById("btnDbgApplyWave");
  const btnDbgApplyHeat = document.getElementById("btnDbgApplyHeat");

  const btnBoot = document.getElementById("btnBoot");
  const btnModeEndless = document.getElementById("btnModeEndless");
  const btnResetScores = document.getElementById("btnResetScores");

  const menuRoot = overlayMenu?.querySelector("[data-menu-root]");
  const menuPages = overlayMenu?.querySelector("[data-menu-pages]");

  const btnRetry = document.getElementById("btnRetry");
  const btnMenu = document.getElementById("btnMenu");
  const btnSubmitScore = document.getElementById("btnSubmitScore");

  const btnMuteMusic = document.getElementById("btnMuteMusic");
  const btnMuteSfx = document.getElementById("btnMuteSfx");
  const btnPause = document.getElementById("btnPause");
  const btnStun = document.getElementById("btnStun");
  const btnCapture = document.getElementById("btnCapture");

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

    function maxEnemiesForWave(wave) {
    // Gentler early ramp; still reaches chaos later
    if (wave <= 3) return 6;
    if (wave <= 5) return 7;
    if (wave <= 7) return 9;
    if (wave <= 9) return 11;
    if (wave <= 12) return 14;
    return 18;
  }

  function maxMultiHpEnemiesForWave(wave) {
  // Max number of enemies with HP > 1 allowed on screen at once.
  if (wave < 4) return 0;   // waves 1-3: none
  if (wave === 4) return 1; // first multi-HP appears
  if (wave === 5) return 2;
  if (wave <= 7) return 3;
  if (wave <= 9) return 4;  // ✅ hard cap before wave 10
  if (wave <= 12) return 5; // wave 10+ can start being spicy
  return 6;
}

  function hpTierForWave(wave) {
    // Wave 1-3: 1hp only
    // Wave 4-7: tier 2 (1-2hp)
    // Wave 8-11: tier 3 (1-3hp)
    // Wave 12-15: tier 4 ...
    if (wave < 4) return 1;
    return 2 + Math.floor((wave - 4) / 4);
  }

  function blockProgress01(wave) {
    // 4-wave blocks: 4-7, 8-11, 12-15...
    if (wave < 4) return 0;
    const start = 4 + Math.floor((wave - 4) / 4) * 4;
    return clamp((wave - start) / 3, 0, 1); // 0..1 across the block
  }

  function maxTopTierOnScreen(wave, tier) {
    // How many "new tier" enemies can be alive at once.
    // Keeps the first couple waves of a tier from becoming a wall.
    const t = blockProgress01(wave);
    const base = 1 + Math.floor(t * 1.6); // 1 -> 2 -> 3 across the block
    // make early tiers a bit less strict
    const extra = (tier <= 3) ? 0 : 0;
    return Math.min(3, base + extra);
  }
  
  function isIOS() {
    const ua = navigator.userAgent || "";

    // iPhone / iPod always identifiable via UA
    if (/iPhone|iPod/.test(ua)) return true;

    // iPadOS 13+ lies and says "Mac", but has touch points
    if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true;

    return false;
  }

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
    positionHudActionButtons();
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

  const sfxShoot = makeAudio(
    ASSETS.sfxShoot,
    false,
    isIOS() ? 0.015 : 0.12
  );
  const sfxEnemyHit = makeAudio(ASSETS.sfxEnemyHit, false, 0.55);
  const sfxPlayerHit = makeAudio(ASSETS.sfxPlayerHit, false, 0.6);
  const sfxPower = makeAudio(ASSETS.sfxPower, false, 0.55);
  const sfxGameOver = makeAudio(ASSETS.sfxGameOver, false, 0.7);

  async function primeSfxIOS() {
    // iOS Safari: some sounds won't play until they've been played once after a gesture.
    const sfxList = [sfxEnemyHit, sfxPlayerHit, sfxPower, sfxGameOver];

    for (const a of sfxList) {
      try {
        a.muted = true;
        a.currentTime = 0;
        await a.play();   // will usually succeed only inside a click
        a.pause();
        a.currentTime = 0;
        a.muted = false;
      } catch {
        // ignore – some iOS versions still throw, but this often improves reliability
        try { a.muted = false; } catch {}
      }
    }
  }

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

    // If the same track is already playing via WebAudio, do nothing
    const url = (which === "game") ? ASSETS.musicGame : ASSETS.musicMenu;
    if (currentMusicUrl === url && currentMusicNode) return;

    // Always stop anything currently playing before switching
    stopMusic();

    // Use seamless WebAudio loop for BOTH menu and game
    const vol = (which === "game") ? 0.5 : 0.45;
    await playSeamlessMusic(url, vol);
  }

  function playSfx(aud) {
    if (!aud || audioState.sfxMuted) return;

    // iOS: route non-shoot SFX through WebAudio so overlapping works reliably
    if (isIOS()) {
      if (aud === sfxEnemyHit) { playSfxBuffer(ASSETS.sfxEnemyHit, 2.25); return; }
      if (aud === sfxPlayerHit){ playSfxBuffer(ASSETS.sfxPlayerHit, 2.35); return; }
      if (aud === sfxPower)    { playSfxBuffer(ASSETS.sfxPower,    2.25); return; }
      if (aud === sfxGameOver) { playSfxBuffer(ASSETS.sfxGameOver, 2.60); return; }
  }

    // Shoot: WebAudio everywhere (consistent)
    if (aud === sfxShoot) {
      const now = performance.now();
      const cd = isIOS() ? IOS_SHOOT_SFX_COOLDOWN_MS : 60;
      if (now - lastShootSfxAt < cd) return;
      lastShootSfxAt = now;

      if (!shootBuf) {
        loadShootBuffer()
          .then(() => playShootWebAudio(isIOS() ? 0.28 : 0.18))
          .catch(() => {});
        return;
      }

      playShootWebAudio(isIOS() ? 0.28 : 0.18);
      return;
    }

    // Non-iOS fallback: HTMLAudio
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
    toast: null, // { text, start, until }

    // entities
    player: { x: PLAYER_X, y: 270, r: 20, vy: 0 }, // slightly bigger
    bullets: [],
    enemies: [],
    particles: [],
    powerups: [],
    // difficulty/powerup extras
    scoreMultUntil: 0,
    stunCharges: 0,

    // Capture Net (stored/active)
    captureCharges: 0,
    ally: null,            // { ...enemyLike, isAlly:true, allyUntil:number }
    captureFx: null,       // { until:number, phase:number } for electric line

    // enemy + ally projectiles
    enemyBullets: [],      // bullets can be {team:"enemy"|"ally"}

    // spawners
    nextEnemyAt: 0,
    nextPowerAt: 0,

    // input
    up: false,
    down: false,
    shooting: false,
    pointerDown: false,
    pointerY: null,

    // anticheat/debug
    debugMode: false,
    debugLock: false,
    debugWave: 1,
    debugHeat: 0, // 0..1
    lastScore: 0,
    cheatFlag: false,
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
    overlayBoot.classList.toggle("show", which === "boot");
    overlayLoading.classList.toggle("show", which === "loading");
    overlayMenu.classList.toggle("show", which === "menu");
    overlayOver.classList.toggle("show", which === "over");

    overlayBoot.setAttribute("aria-hidden", String(which !== "boot"));
    overlayLoading.setAttribute("aria-hidden", String(which !== "loading"));
    overlayMenu.setAttribute("aria-hidden", String(which !== "menu"));
    overlayOver.setAttribute("aria-hidden", String(which !== "over"));
  }

  function setMenuPage(page) {
    if (!overlayMenu) return;
    const pages = overlayMenu.querySelectorAll(".menu-page");
    pages.forEach(p => p.classList.toggle("is-active", p.getAttribute("data-page") === page));

    // Keep aria-hidden sensible (nice for iOS VoiceOver)
    pages.forEach(p => p.setAttribute("aria-hidden", String(p.getAttribute("data-page") !== page)));

    // Refresh scores when entering leaderboard page
    if (page === "leaderboard") {
      renderScores();
    }
  }

  function setMode(mode) {
    state.mode = mode;
    const stageEl = document.querySelector(".stage");
    if (stageEl) stageEl.classList.toggle("hide-game", mode === "boot" || mode === "loading");
    state.paused = false;
    btnPause.setAttribute("aria-pressed", "false");
    btnPause.textContent = "Pause";

    if (mode === "boot") {
      showOverlay("boot");
      stopMusic(); // ensure silence until the first tap
    } else if (mode === "loading") {
      showOverlay("loading");
      stopMusic(); // keep silent during fake loading
    } else if (mode === "menu") {  
      showOverlay("menu");
      setMenuPage("main");
      playMusic("menu");
    } else if (mode === "play") {
      showOverlay(null);
      playMusic("game");
    } else if (mode === "over") {
      showOverlay("over");
      stopMusic();
    }
  }

  function updateHud() {
    const now = performance.now();
    hudScore.textContent = state.score.toLocaleString();
    hudWave.textContent = String(state.wave);
    hudHeat.textContent = `${Math.round(state.heat * 100)}%`;
    hudLives.textContent = "♥".repeat(state.lives) + "·".repeat(Math.max(0, BASE_LIVES - state.lives));

    let p = [];
    if (now < state.shieldUntil) p.push("Shield");
    if (now < state.multishotUntil) p.push("Multishot");
    if (now < state.railgunUntil) p.push("Railgun");
    if (now < state.scoreMultUntil) p.push("2x Score");
    hudPower.textContent = p.length ? p.join(" + ") : "—";
    refreshStunButton();
    refreshCaptureButton();
    positionHudActionButtons();
  }

  function positionStunButton() {
    if (!btnStun) return;
    if (btnStun.style.display === "none") return; // nothing to position

    const rect = canvas.getBoundingClientRect();
    const btnRect = btnStun.getBoundingClientRect();

    btnStun.style.position = "fixed";
    btnStun.style.zIndex = 50;

    if (IS_MOBILE) {
      // MOBILE: centered in the gap between topbar and canvas
      const topbar = document.querySelector(".topbar");
      const topbarRect = topbar ? topbar.getBoundingClientRect() : { bottom: 0 };

      const gapTop = topbarRect.bottom;
      const gapBottom = rect.top;

      let y = gapTop + (gapBottom - gapTop) / 2 - btnRect.height / 2;
      y = clamp(y, gapTop + 6, gapBottom - btnRect.height - 6);

      const x = rect.left + rect.width / 2 - btnRect.width / 2;

      btnStun.style.left = `${x}px`;
      btnStun.style.top = `${y}px`;
      return;
    }

    // DESKTOP: in the band above the divider line, right side
    const scaleY = rect.height / canvas.height;
    const dividerY = rect.top + SAFE_TOP_UI_BAR * scaleY;
    const padding = 6;

    const yCss = dividerY - btnRect.height - padding;

    const paddingX = 12;
    const xCss = rect.right - btnRect.width - paddingX;

    btnStun.style.left = `${xCss}px`;
    btnStun.style.top = `${yCss}px`;
  }

  function positionCaptureButton() {
    if (!btnCapture) return;
    if (btnCapture.style.display === "none") return;

    const rect = canvas.getBoundingClientRect();
    const btnRect = btnCapture.getBoundingClientRect();

    btnCapture.style.position = "fixed";
    btnCapture.style.zIndex = 50;

    if (IS_MOBILE) {
      // MOBILE: slightly left of center (stun stays center)
      const topbar = document.querySelector(".topbar");
      const topbarRect = topbar ? topbar.getBoundingClientRect() : { bottom: 0 };

      const gapTop = topbarRect.bottom;
      const gapBottom = rect.top;

      let y = gapTop + (gapBottom - gapTop) / 2 - btnRect.height / 2;
      y = clamp(y, gapTop + 6, gapBottom - btnRect.height - 6);

      const x = rect.left + rect.width / 2 - btnRect.width / 2 - 82;

      btnCapture.style.left = `${x}px`;
      btnCapture.style.top = `${y}px`;
      return;
    }

    // DESKTOP: in the band above the divider line, left side
    const scaleY = rect.height / canvas.height;
    const dividerY = rect.top + SAFE_TOP_UI_BAR * scaleY;
    const padding = 6;

    const yCss = dividerY - btnRect.height - padding;

    const paddingX = 12;
    const xCss = rect.left + paddingX;

    btnCapture.style.left = `${xCss}px`;
    btnCapture.style.top = `${yCss}px`;
  }

  function positionHudActionButtons() {
    positionStunButton();
    positionCaptureButton();
  }

  function refreshStunButton() {
    if (!btnStun) return;
    const show = state.mode === "play" && state.stunCharges > 0;
    btnStun.style.display = show ? "inline-flex" : "none";
    btnStun.textContent = `Stun (${state.stunCharges})`;
  }

  function refreshCaptureButton() {
    if (!btnCapture) return;
    const show = state.mode === "play" && state.captureCharges > 0;
    btnCapture.style.display = show ? "inline-flex" : "none";
    btnCapture.textContent = `Capture (${state.captureCharges})`;
  }

  function useCaptureNet() {
    if (state.mode !== "play") return;
    if (state.captureCharges <= 0) return;

    // Only allow 1 ally at a time (recommended)
    if (state.ally) {
      showToast("You already have a captured ally!", 1200);
      return;
    }

    // Spend the charge now (so it has tension)
    state.captureCharges -= 1;
    refreshCaptureButton();

    // Fire a special "capture shot" using your existing bullet system
    const now = performance.now();
    state.bullets.push({
      x: state.player.x + 24,
      y: state.player.y,
      vx: FIRE.bulletSpeed * 1.15,
      vy: 0,
      r: 10,
      ttl: ((canvas.width - (state.player.x + 24)) / (FIRE.bulletSpeed * 1.15)) * 1000 + 250,
      isCapture: true,   // IMPORTANT flag
    });
  }

  function useStunGun() {
    if (state.mode !== "play") return;
    if (state.stunCharges <= 0) return;

    const now = performance.now();
    state.stunCharges -= 1;

    // freeze ONLY enemies currently on screen; new spawns won't be frozen
    for (const e of state.enemies) {
      e.stunUntil = Math.max(e.stunUntil || 0, now + 3200);
    }

    burst(state.player.x + 30, state.player.y, "rgba(114,247,210,.85)");
    refreshStunButton();
  }

  function showToast(text, durationMs = 1400) {
    const now = performance.now();
    state.toast = {
      text,
      start: now,
      until: now + durationMs,
    };
  }

  // ----------------------------
  // DEBUG + ANTICHEAT
  // ----------------------------

  function showDebugOverlay(show) {
    if (!overlayDebug) return;
    overlayDebug.classList.toggle("show", !!show);
    overlayDebug.setAttribute("aria-hidden", String(!show));
  }

  function setDebugMode(on) {
    state.debugMode = !!on;
    // when debug opens, default lock checkbox to current state
    if (dbgLock) dbgLock.checked = !!state.debugLock;

    if (dbgWave) dbgWave.value = String(state.debugWave || state.wave || 1);
    if (dbgHeat) dbgHeat.value = String(Math.round((state.debugHeat ?? state.heat ?? 0) * 100));

    showDebugOverlay(on);
  }

  function punishCheater(reason = "tamper") {
    if (state.cheatFlag) return; // prevent double-trigger spam
    state.cheatFlag = true;

    console.warn("[AntiCheat] TRIPPED:", reason);

    // nuke run
    state.score = 0;
    state.lives = 0;

    // optional: clear entities so it looks like the ocean imploded
    state.bullets.length = 0;
    state.enemies.length = 0;
    state.enemyBullets.length = 0;
    state.powerups.length = 0;

    // force game over screen
    gameOver();

    // rickroll after a short moment so they SEE the shame 😈
    setTimeout(() => {
      try { window.location.assign("https://www.youtube.com/watch?v=dQw4w9WgXcQ"); } catch {}
    }, 900);

    return;
  }

  function runAntiCheat(dtMs) {
    if (state.debugMode) return;       // debug mode disables anticheat
    if (state.mode !== "play") return; // only care during gameplay
    if (state.paused) return;

    // 1) hard caps
    if (state.lives > BASE_LIVES) return punishCheater("lives > cap");
    if (state.lives < 0) return punishCheater("lives < 0");
    if (state.powerups.length > 5) return punishCheater("too many powerups");

    // 2) score sanity (spike detector)
    const delta = state.score - (state.lastScore || 0);
    // if someone adds a ton of score in one frame, bye
    if (delta > 800) return punishCheater("score spike");
    if (state.score < 0) return punishCheater("score < 0");

    // 3) wave/heat should follow time (unless debug)
    const seconds = state.time / 1000;
    const expectedWave = Math.max(1, Math.floor(seconds / 20) + 1);
    const expectedHeat = clamp(seconds / DIFF.rampSeconds, 0, 1);

    // allow tiny drift (timing / float)
    if (Math.abs(state.wave - expectedWave) > 2) return punishCheater("wave desync");
    if (Math.abs(state.heat - expectedHeat) > 0.15) return punishCheater("heat desync");

    state.lastScore = state.score;
  }

  // Type-to-open admin (typing "admin" anywhere)
  let adminBuffer = "";
  let adminLastAt = 0;

  function handleAdminType(e) {
    const now = performance.now();

    // ignore when typing in an input (name field etc.)
    const el = document.activeElement;
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;

    // ignore non-printable keys
    if (!e.key || e.key.length !== 1) return;

    // reset buffer if they pause too long between letters
    if (now - adminLastAt > 1200) adminBuffer = "";
    adminLastAt = now;

    adminBuffer += e.key.toLowerCase();
    if (adminBuffer.length > 10) adminBuffer = adminBuffer.slice(-10);

    if (adminBuffer.endsWith("admin")) {
      adminBuffer = "";
      // toggle debug mode
      setDebugMode(!state.debugMode);
    }
  }

  window.addEventListener("keydown", handleAdminType);

  // Debug UI events
  if (btnDebugClose) {
    btnDebugClose.addEventListener("click", () => setDebugMode(false));
  }

  if (dbgLock) {
    dbgLock.addEventListener("change", () => {
      state.debugLock = !!dbgLock.checked;
    });
  }

  if (btnDbgApplyWave && dbgWave) {
    btnDbgApplyWave.addEventListener("click", () => {
      const v = clamp(parseInt(dbgWave.value || "1", 10) || 1, 1, 999);

      // ✅ ALWAYS commit wave changes via time so it persists even after closing debug
      state.time = (v - 1) * 20000;

      // Recompute immediately (prevents any visible snap-back)
      const seconds = state.time / 1000;
      state.heat = clamp(seconds / DIFF.rampSeconds, 0, 1);
      state.wave = Math.max(1, Math.floor(seconds / 20) + 1);

      // Keep debug fields synced so UI matches the real state
      state.debugWave = state.wave;
      state.debugHeat = state.heat;

      // Make spawners feel correct after a jump
      const now = performance.now();
      state.nextEnemyAt = now + 250;
      state.nextPowerAt = now + rand(DIFF.powerupEvery * 0.25, DIFF.powerupEvery * 0.6);

      updateHud();
    });
  }

  if (btnDbgApplyHeat && dbgHeat) {
    btnDbgApplyHeat.addEventListener("click", () => {
      const pct = clamp(parseInt(dbgHeat.value || "0", 10) || 0, 0, 100);
      const h01 = clamp(pct / 100, 0, 1);

      // Jump time to match heat %, then continue naturally
      state.time = h01 * DIFF.rampSeconds * 1000;

      // Recompute immediately
      const seconds = state.time / 1000;
      state.heat = clamp(seconds / DIFF.rampSeconds, 0, 1);
      state.wave = Math.max(1, Math.floor(seconds / 20) + 1);

      // Keep debug fields synced
      state.debugHeat = state.heat;
      state.debugWave = state.wave;

      // Reset spawners after jump
      const now = performance.now();
      state.nextEnemyAt = now + 250;
      state.nextPowerAt = now + rand(DIFF.powerupEvery * 0.25, DIFF.powerupEvery * 0.6);

      updateHud();
    });
  }

  // Give powerups via debug buttons
  if (overlayDebug) {
    overlayDebug.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const p = t.getAttribute("data-debug-power");
      if (!p) return;

      // allow giving powerups any time (menu/play), but easiest is in play
      applyPowerup(p);
      updateHud();
    });
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
    // anticheat reset
    state.cheatFlag = false;
    state.lastScore = 0;

    state.railgunUntil = 0;
    state.multishotUntil = 0;
    state.shieldUntil = 0;
    state.scoreMultUntil = 0;
    state.stunCharges = 0;

    state.captureCharges = 0;
    state.ally = null;
    state.captureFx = null;

    state.enemyBullets.length = 0;

    state.player.x = PLAYER_X;
    state.player.y = 270;
    state.player.vy = 0;
    state.player.r = 20;

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

    const ENEMY_SCALE = 1.5; // global enemy size multiplier (tweak 1.15–1.35)

    const r = rand(20, 30) * ENEMY_SCALE;

    const minY = SAFE_TOP_UI_BAR + r + 6;
    const maxY = h - SAFE_BOTTOM_PAD - r - 6;

    // Spawn near the player's current Y most of the time.
    // Occasionally spawn a "flanker" away from the player (keeps it spicy).
    const playerY = state.player.y;

    // How tight the spawn band is (smaller = easier to manage)
    const band = clamp(160 - state.wave * 6, 90, 150); // wave 1: ~154px, wave 10: ~100px

    let y;
    const flankerChance = clamp(0.18 + (state.wave - 7) * 0.02, 0.18, 0.30); // rare at 7+, slightly more later

    if (state.wave >= 7 && chance(flankerChance)) {
      // flanker: prefer the opposite side of the player's position
      const side = (playerY < (minY + maxY) / 2) ? "bottom" : "top";
      if (side === "top") y = rand(minY, minY + 110);
      else y = rand(maxY - 110, maxY);
    } else {
      // main spawn: near player Y
      y = clamp(playerY + rand(-band, band), minY, maxY);
  }
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

    // Tiered HP distribution:
    // - Waves 4-7: mostly 1hp, increasing 2hp
    // - Waves 8-11: introduce rare 3hp, ramps up; still keep 2hp
    // - Waves 12-15: introduce rare 4hp, ramps up; etc.
    const tier = hpTierForWave(state.wave);
    const prog = blockProgress01(state.wave);

    // Global cap for ANY multi-HP enemies (keeps screen manageable)
    const multiCap = maxMultiHpEnemiesForWave(state.wave);
    const multiOnScreen = state.enemies.reduce(
      (n, ee) => n + ((ee.maxHp || ee.hp || 1) > 1 ? 1 : 0),
      0
    );

    // Count how many top-tier enemies are currently alive (hp === tier)
    const topTierOnScreen = state.enemies.reduce(
      (n, ee) => n + ((ee.maxHp || ee.hp || 1) === tier ? 1 : 0),
      0
    );

    // Probabilities inside the current block
    // 2hp ramps up across waves 4-7, and continues to exist in later blocks.
    let p2 = 0;
    if (state.wave >= 4) {
      p2 = clamp(0.12 + 0.28 * prog, 0.12, 0.40); // 12% -> 40% across the block
    }

    // Top-tier chance is LOW at the start of a new tier, increases across the block.
    let pTop = 0;
    if (tier >= 3) {
      pTop = clamp(0.06 + 0.14 * prog, 0.06, 0.20); // 6% -> 20%
    }
    if (tier >= 4) {
      // slightly more aggressive later tiers
      pTop = clamp(0.07 + 0.16 * prog, 0.07, 0.23);
    }

    // Roll HP (default 1)
    let hp = 1;

    // Attempt top-tier first (3hp in waves 8-11, 4hp in 12-15, etc.)
    if (
      tier >= 3 &&
      chance(pTop) &&
      multiOnScreen < multiCap &&
      topTierOnScreen < maxTopTierOnScreen(state.wave, tier)
    ) {
      hp = tier;
    } else if (tier >= 2 && chance(p2) && multiOnScreen < multiCap) {
      hp = 2;
    }

    const e = {
      x, y, r,
      vx: -speed,
      vy: rand(-18, 18),

      hp: hp,
      maxHp: hp,


      // enemy scaling timers
      shieldUntil: 0,
      nextShieldAt: 0,
      shieldUsed: false,     // ✅ NEW: can only shield once
      canPanicShield: chance(0.18), // ~18% of enemies are allowed to shield near player (rare “ugh” moment)
      nextShotAt: 0,
      stunUntil: 0,

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

      const types = ["shield", "railgun", "multishot", "pusher", "stungun", "capture", "multiplier", "life"];

    // weight “life” rarer, others normal
    let t = "shield";
    const roll = Math.random();
    if (roll < 0.14) t = "life";
    else {
      // pick from the non-life list
      const pool = ["shield", "railgun", "multishot", "pusher", "stungun", "capture", "multiplier"];
      t = pool[Math.floor(Math.random() * pool.length)];
    }


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
    const pretty = {
      life: "Extra Life",
      shield: "Shield",
      railgun: "Railgun",
      multishot: "Multishot",
      pusher: "Pusher",
      stungun: "Stun Gun",
      multiplier: "2x Score",
      capture: "Capture Net",
    };


    if (type === "life") {
      state.lives = clamp(state.lives + 1, 0, BASE_LIVES);
      showToast(`Powerup: ${pretty[type]}`);
      return;
    }
    if (type === "shield") { state.shieldUntil = now + POWER.shield; showToast(`Powerup: ${pretty[type]}`); return; }
    if (type === "railgun") { state.railgunUntil = now + POWER.railgun; showToast(`Powerup: ${pretty[type]}`); return; }
    if (type === "multishot") { state.multishotUntil = now + POWER.multishot; showToast(`Powerup: ${pretty[type]}`); return; }
    if (type === "pusher") {
      const w = canvas.width;
      const pushDist = w * 0.42;

      for (const e of state.enemies) {
        // anything past the middle-left gets pushed right
        if (e.x > w * 0.45) {
          e.x = Math.min(w + e.r + 40, e.x + pushDist);
          burst(e.x, e.y, "rgba(122,166,255,.55)");
        }
      }
      showToast(`Powerup: ${pretty[type]}`);
      return;
    }

    if (type === "stungun") {
      state.stunCharges = clamp(state.stunCharges + 1, 0, 3);
      refreshStunButton();
      showToast(`Powerup: Stun Gun - (Press E or tap button to use)`, 2200);
      return;
    }

    if (type === "capture") {
      state.captureCharges = clamp(state.captureCharges + 1, 0, 1); // 1 stored charge feels best
      refreshCaptureButton();
      showToast(`Powerup: Capture Net - (Press Q or tap button to use)`, 2200);
      return;
    }

    if (type === "multiplier") {
      state.scoreMultUntil = now + 9000;
      showToast(`Powerup: ${pretty[type]}`);
      return;
    }

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
    // ✅ Stop browser scrolling / page movement while actually playing
    if (state.mode === "play") {
      const k = e.key;
      if (k === "ArrowUp" || k === "ArrowDown" || k === " " || k === "Spacebar") {
        e.preventDefault();
      }
    }

    if (e.key === "ArrowUp") state.up = true;
    if (e.key === "ArrowDown") state.down = true;
    if (e.key.toLowerCase() === "w") state.up = true;
    if (e.key.toLowerCase() === "s") state.down = true;

    if (e.key.toLowerCase() === "e") useStunGun();
    if (e.key.toLowerCase() === "q") useCaptureNet();

    if (e.key === " " || e.key === "Enter") {
      if (state.mode === "play") state.shooting = true;
    }

    if (e.key.toLowerCase() === "p") togglePause();
  });

  window.addEventListener("keyup", (e) => {
    if (state.mode === "play") {
      const k = e.key;
      if (k === "ArrowUp" || k === "ArrowDown" || k === " " || k === "Spacebar") {
        e.preventDefault();
      }
    }

    if (e.key === "ArrowUp") state.up = false;
    if (e.key === "ArrowDown") state.down = false;
    if (e.key.toLowerCase() === "w") state.up = false;
    if (e.key.toLowerCase() === "s") state.down = false;

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
  btnBoot.addEventListener("click", async () => {
    await ensureAudioCtx();
    try { if (audioCtx.state === "suspended") await audioCtx.resume(); } catch {}

    // Kick iOS output awake (silent tick)
    iosKickstartAudio(); // or unlockIOSAudioNow()

    try {
      await Promise.all([
        getAudioBuffer(ASSETS.musicMenu),
        getAudioBuffer(ASSETS.musicGame),
        getSfxBuffer(ASSETS.sfxEnemyHit),
        getSfxBuffer(ASSETS.sfxPlayerHit),
        getSfxBuffer(ASSETS.sfxPower),
        getSfxBuffer(ASSETS.sfxGameOver),
        loadShootBuffer(),
      ]);
    } catch {}

    // Fake loading screen (gives assets time to finish rendering)
    setMode("loading");

    setTimeout(() => {
      // Go to menu -> this starts menu music
      setMode("menu");

      // iOS-only: keep muted briefly, then instant unmute
      unmuteMusicAfterIOSWarmup(250);
    }, 3000);
  });
  
  // Menu navigation (single overlay, multiple pages)
  if (overlayMenu) {
    overlayMenu.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;

      const nav = t.getAttribute("data-nav");
      if (nav) setMenuPage(nav);
    });
  }

  // Start game from Choose Mode -> Endless
  if (btnModeEndless) {
    btnModeEndless.addEventListener("click", async () => {
      // user gesture unlocks audio
      await ensureAudioCtx();
      try { if (audioCtx.state === "suspended") await audioCtx.resume(); } catch {}

      iosKickstartAudio();

      try { await getAudioBuffer(ASSETS.musicGame); } catch {}

      if (isIOS()) {
        try { await loadShootBuffer(); } catch {}
        await primeSfxIOS();
      }

      resetGame();
      setMode("play");
    });
  }

  // Reset Scores is UI-only for now (no logic yet)
  // We intentionally do NOT add behavior here.


  btnRetry.addEventListener("click", async () => {
    await ensureAudioCtx();
    try { if (audioCtx.state === "suspended") await audioCtx.resume(); } catch {}

    iosKickstartAudio(); // ✅ add this line

    try { await getAudioBuffer(ASSETS.musicGame); } catch {}

    if (isIOS()) {
      try { await loadShootBuffer(); } catch {}
    }

    if (isIOS()) {
      await primeSfxIOS();
    }

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
    stopMusic();
    setMode("menu");
  });

  btnMuteMusic.addEventListener("click", () => setMusicMuted(!audioState.musicMuted));
  btnMuteSfx.addEventListener("click", () => setSfxMuted(!audioState.sfxMuted));

  btnPause.addEventListener("click", () => togglePause());
  if (btnStun) btnStun.addEventListener("click", () => useStunGun());
  if (btnCapture) btnCapture.addEventListener("click", () => useCaptureNet());

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

    // heat/wave progression
    let seconds = state.time / 1000;

    if (state.debugMode && state.debugLock) {
      // Debug lock: force manual overrides AND keep time consistent
      const forcedWave = clamp(parseInt(state.debugWave || 1, 10) || 1, 1, 999);
      const forcedHeat = clamp(
        Number.isFinite(state.debugHeat) ? state.debugHeat : 0,
        0,
        1
      );

      state.wave = forcedWave;
      state.heat = forcedHeat;

      // Keep underlying time aligned with forced wave so nothing snaps back
      state.time = (state.wave - 1) * 20000;
      seconds = state.time / 1000;
    } else {
      // Normal: derived from time (this is what makes wave continue to 51, 52, etc.)
      state.heat = clamp(seconds / DIFF.rampSeconds, 0, 1);
      state.wave = Math.max(1, Math.floor(seconds / 20) + 1);

      // keep debug fields in sync so the UI matches what you're seeing
      state.debugWave = state.wave;
      state.debugHeat = state.heat;
    }

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
    // slow ramp early; allow faster spawns after wave 10+
    const waveRamp = clamp((state.wave - 1) / 9, 0, 1); // reaches 1 at wave 10
    const effectiveMinSpawn = DIFF.minSpawnEvery + (1 - waveRamp) * 260; // adds ~260ms early on

    const spawnEvery = clamp(
      DIFF.startSpawnEvery - state.heat * (DIFF.startSpawnEvery - effectiveMinSpawn),
      effectiveMinSpawn,
      DIFF.startSpawnEvery
    );


    const maxEnemies = maxEnemiesForWave(state.wave);

    if (now >= state.nextEnemyAt) {
      if (state.enemies.length < maxEnemies) {
        spawnEnemy();

        // extra spawns only much later (prevents wave 5 pileups)
        if (state.wave >= 10 && state.heat > 0.7 && chance(0.10) && state.enemies.length < maxEnemies) {
          spawnEnemy();
        }
      }

      state.nextEnemyAt = now + spawnEvery * rand(0.80, 1.25);
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

    // update enemy bullets
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const b = state.enemyBullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.ttl -= dtMs;

      // Enemy bullets hit player
      if ((b.team || "enemy") === "enemy") {
        const hitP = circleHit(b, { x: state.player.x, y: state.player.y, r: state.player.r + 6 });
        if (hitP) {
          state.enemyBullets.splice(i, 1);
          hitPlayer();
          continue;
        }

        // Enemy bullets can hit the ally (and kill it), unless ally shield is up
        if (state.ally) {
          const a = state.ally;
          const hitA = circleHit(b, { x: a.x, y: a.y, r: a.r + 6 });
          if (hitA) {
            state.enemyBullets.splice(i, 1);

            // shield absorbs once (same as enemies)
            if (performance.now() < (a.shieldUntil || 0)) {
              burst(a.x, a.y, "rgba(114,247,210,.65)");
            } else {
              burst(a.x, a.y, "rgba(114,247,210,.9)");
              state.ally = null;
            }
            continue;
          }
        }
      } else {
        // Ally bullets hit enemies
        for (let ei = state.enemies.length - 1; ei >= 0; ei--) {
          const e = state.enemies[ei];
          const hitE = circleHit(b, { x: e.x, y: e.y, r: e.r + 3 });
          if (!hitE) continue;

          state.enemyBullets.splice(i, 1);

          // shielded enemies ignore damage
          const nowB = performance.now();
          if (nowB < (e.shieldUntil || 0)) {
            burst(e.x, e.y, "rgba(114,247,210,.55)");
            break;
          }

          e.hp -= (b.dmg || 1);
          burst(e.x, e.y, "rgba(114,247,210,.75)");

          if (e.hp <= 0) {
            state.enemies.splice(ei, 1);

            const basePts = Math.floor(10 + 10 * state.heat);
            const mult = (performance.now() < state.scoreMultUntil) ? 2 : 1;
            state.score += basePts * mult;
          }
          break;
        }
      }
    }

    // ----------------------------
    // ALLY (captured enemy)
    // ----------------------------
    if (state.ally) {
      const a = state.ally;
      const nowA = performance.now();

      // Expire by timer
      if (nowA >= a.allyUntil) {
        burst(a.x, a.y, "rgba(114,247,210,.85)");
        state.ally = null;
      } else {
        // Desired anchor: slightly LEFT of player (as requested), but clamped in bounds
        const anchorX = clamp(state.player.x - (state.player.r + a.r + 12), a.r + 8, canvas.width - a.r - 8);
        const anchorY = clamp(state.player.y - 6, SAFE_TOP_UI_BAR + a.r + 8, canvas.height - SAFE_BOTTOM_PAD - a.r - 8);

        // Joining dash (fast snap-in from right side)
        if (nowA < (a.joiningUntil || 0)) {
          const JOIN_MS = 1600;
          const t01 = 1 - clamp((a.joiningUntil - nowA) / JOIN_MS, 0, 1);

          // MUCH gentler pull-in (slow drift, then slightly firmer near the end)
          const pull = 0.018 + 0.045 * t01; // tops out ~0.063
          a.x += (anchorX - a.x) * pull;
          a.y += (anchorY - a.y) * pull;

          // Keep the electric line alive while it's traveling in
          state.captureFx = { until: nowA + 60, phase: (state.captureFx?.phase ?? 0) + 0.35 };
        } else {
          // Smooth follow (not "glued" exactly)
          a.x += (anchorX - a.x) * clamp(dt * 7.5, 0, 1);
          a.y += (anchorY - a.y) * clamp(dt * 7.5, 0, 1);
        }

        // Ally shield: exactly ONCE, occasionally
        if (a.allyShieldCharge > 0 && nowA >= (a.nextAllyShieldAt || 0)) {
          if (chance(0.12)) { // ~12% chance at each check
            a.shieldUntil = nowA + 950;
            a.allyShieldCharge = 0;
          }
          a.nextAllyShieldAt = nowA + rand(1800, 2800);
        }

        // Ally shooting: same bullet shape as enemies, but team="ally" and different color in render
        if (nowA >= (a.nextAllyShotAt || 0)) {
          // Find nearest enemy (simple and effective)
          let best = null;
          let bestD2 = Infinity;
          for (const e of state.enemies) {
            const dx = e.x - a.x;
            const dy = e.y - a.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < bestD2) { bestD2 = d2; best = e; }
          }

          if (best) {
            const dx = best.x - a.x;
            const dy = best.y - a.y;
            const len = Math.max(1, Math.hypot(dx, dy));

            const spd = 520; // faster than enemy bullets
            state.enemyBullets.push({
              team: "ally",
              x: a.x + a.r + 2,
              y: a.y,
              vx: (dx / len) * spd,
              vy: (dy / len) * spd,
              r: 7,
              ttl: 2400,
              dmg: 1,
            });
          }

          // Fire rate: noticeably faster than enemies (player-ish vibe)
          a.nextAllyShotAt = nowA + rand(320, 520);
        }
      }
    }

    // update enemies
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      const now2 = performance.now();
      const stunned = now2 < (e.stunUntil || 0);

      // if stunned, don't move forward (but still bounce in Y)
      if (stunned) {
        e.x -= e.vx * dt; // cancel x move this frame
      }

      // bounce softly in bounds
      if (e.y < SAFE_TOP_UI_BAR + e.r + 8) { e.y = SAFE_TOP_UI_BAR + e.r + 8; e.vy *= -1; }
      if (e.y > canvas.height - SAFE_BOTTOM_PAD - e.r - 8) { e.y = canvas.height - SAFE_BOTTOM_PAD - e.r - 8; e.vy *= -1; }
      // --- enemy timed shield (noticeable from wave 5+) ---
      const playerLineX = state.player.x + state.player.r;
      const closeToPlayer = (e.x - e.r) <= (playerLineX + 140); // tweak: 120–180

      if (!stunned && state.wave >= 5 && !e.shieldUsed) {
        const shieldActive = now2 < (e.shieldUntil || 0);

        if (!shieldActive && now2 >= (e.nextShieldAt || 0)) {
          // wave5 ~22%, wave8+ much higher
          let pShield = clamp(0.22 + (state.wave - 5) * 0.07, 0, 0.70);

          // Near player: only a small subset of enemies can do it, and even then it's rare.
          if (closeToPlayer) {
            if (!e.canPanicShield) pShield = 0;   // most enemies simply cannot shield here
            else pShield *= 0.18;                // even “allowed” ones do it rarely
          }

          if (chance(pShield)) {
            e.shieldUntil = now2 + rand(700, 1200);
            e.shieldUsed = true; // ✅ NEW: lock it forever after first use
          }

          // check more often (so you actually see it)
          e.nextShieldAt = now2 + rand(1800, 3400);
        }
      }

      // --- enemy shooting back (starts around wave 5+, ramps up) ---
      if (!stunned && state.wave >= 3) {
        if (now2 >= (e.nextShotAt || 0)) {

          // bullet speed (faster later waves)
          const spd = 380 + (state.wave >= 10 ? 80 : 0);

          // chance to fire this cycle
          const pShoot = clamp(0.14 + (state.wave - 3) * 0.045, 0, 0.55);

          // Soft cap to prevent bullet floods
          const MAX_ENEMY_BULLETS = clamp(6 + state.wave, 8, 16);

          if (chance(pShoot) && state.enemyBullets.length < MAX_ENEMY_BULLETS) {
            state.enemyBullets.push({
              x: e.x - e.r - 2,
              y: e.y,
              vx: -spd,
              vy: 0,
              r: 7,
              ttl: 6500,
            });
          }

          // fire rate (shorter than 5s)
          e.nextShotAt = now2 + rand(2400, 3600);
        }
      }

      // if reaches player line -> hit
      if (e.x - e.r <= state.player.x + state.player.r) {
        state.enemies.splice(i, 1);
        hitPlayer();
        continue;
      }

      // bullet collisions (multi-hit enemy HP)
      for (let j = state.bullets.length - 1; j >= 0; j--) {
        const b = state.bullets[j];

        if (!circleHit({ x: e.x, y: e.y, r: e.r + 3 }, b)) continue;

        // --- CAPTURE SHOT (doesn't do damage) ---
        if (b.isCapture) {
          state.bullets.splice(j, 1);

          // Can't capture shielded enemies (keeps it fair + readable)
          if (now2 < (e.shieldUntil || 0)) {
            burst(e.x, e.y, "rgba(114,247,210,.55)");
            playSfx(sfxEnemyHit);
            showToast("Capture blocked by shield!", 900);
            break;
          }

          // Convert this enemy into your ally
          const ally = {
            ...e,
            isAlly: true,

            // Follow / timing
            allyUntil: now2 + 30000,     // 30s as requested
            joiningUntil: now2 + 1600,   // slower pull-in (1.6s feels nice)

            // Ally combat tuning
            nextAllyShotAt: 0,

            // Ally shield: exactly ONCE per lifetime
            allyShieldCharge: 1,
          };

          // Remove from enemies + set as active ally
          state.enemies.splice(i, 1);
          state.ally = ally;

          // Electric tether FX (like your screenshot)
          state.captureFx = { until: now2 + 500, phase: Math.random() * 1000 };

          burst(ally.x, ally.y, "rgba(114,247,210,.85)");
          showToast("Captured ally!", 900);
          break;
        }

        // --- NORMAL DAMAGE ---
        state.bullets.splice(j, 1);

        // shielded enemies ignore damage
        if (now2 < (e.shieldUntil || 0)) {
          burst(e.x, e.y, "rgba(114,247,210,.55)");
          playSfx(sfxEnemyHit);
          break;
        }

        e.hp -= 1;
        burst(e.x, e.y, "rgba(122,166,255,.85)");
        playSfx(sfxEnemyHit);

        if (e.hp <= 0) {
          state.enemies.splice(i, 1);

          const basePts = Math.floor(10 + 10 * state.heat);
          const mult = (performance.now() < state.scoreMultUntil) ? 2 : 1;
          state.score += basePts * mult;
        }

        break;
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

    runAntiCheat(dtMs);
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
    // powerup toast (above the divider line)
    if (state.toast) {
      const nowT = performance.now();
      if (nowT >= state.toast.until) {
        state.toast = null;
      } else {
        const t01 = clamp((nowT - state.toast.start) / (state.toast.until - state.toast.start), 0, 1);

        // slide up a bit + fade at the end
        const rise = 10 * t01;
        const fade = t01 > 0.75 ? (1 - (t01 - 0.75) / 0.25) : 1;

        const lines = String(state.toast.text).split("\n");

        // Position: centered, just above the divider line in that safe band
        const x = w * 0.5;
        const y = (SAFE_TOP_UI_BAR * 0.65) - rise;

        ctx.save();
        ctx.globalAlpha = 0.95 * fade;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // subtle shadow/backplate vibe
        ctx.fillStyle = "rgba(0,0,0,.35)";
        ctx.font = `900 22px ui-sans-serif, system-ui`;

        // draw text lines
        for (let i = 0; i < lines.length; i++) {
          const yy = y + i * 18;

          // outline-ish shadow
          ctx.fillText(lines[i], x + 1, yy + 1);

          ctx.fillStyle = "#e9f0ff";
          ctx.fillText(lines[i], x, yy);
          ctx.fillStyle = "rgba(0,0,0,.35)";
        }

        ctx.restore();
      }
    }


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
      // enemy shield visual (when active)
      if (performance.now() < (e.shieldUntil || 0)) {
        ctx.strokeStyle = "rgba(114,247,210,.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r + 10, 0, Math.PI * 2);
        ctx.stroke();
      }

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

      // enemy HP bar (only show if > 1 max HP)
      if (e.maxHp && e.maxHp > 1) {
        const bw = e.r * 1.8;
        const bh = 4;
        const x0 = e.x - bw / 2;
        const y0 = e.y - e.r - 12;
        const frac = clamp(e.hp / e.maxHp, 0, 1);

        let col = "rgba(125,255,122,.9)";
        if (frac <= 0.25) col = "rgba(255,106,136,.92)";
        else if (frac <= 0.5) col = "rgba(255,170,84,.92)";
        else if (frac <= 0.75) col = "rgba(255,238,110,.92)";

        ctx.fillStyle = "rgba(0,0,0,.35)";
        ctx.fillRect(x0, y0, bw, bh);
        ctx.fillStyle = col;
        ctx.fillRect(x0, y0, bw * frac, bh);
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

    // Ally render (captured enemy)
    if (state.ally) {
      const a = state.ally;

      // Ally glow ring so it's clearly yours
      drawGlowCircle(a.x, a.y, a.r * 2.2, "rgba(114,247,210,.16)", "rgba(0,0,0,0)");

      // Ally shield visual (if active)
      if (performance.now() < (a.shieldUntil || 0)) {
        ctx.strokeStyle = "rgba(114,247,210,.65)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r + 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw ally the same way you draw enemies (PFP + decor)
      if (a.pfpImg) {
        const size = a.r * 2.0;
        ctx.save();
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(a.pfpImg, a.x - size / 2, a.y - size / 2, size, size);
        ctx.restore();

        ctx.strokeStyle = "rgba(114,247,210,.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (a.decorImg) {
        const box = a.r * 2.0 * (a.decorScale || 1.0);
        const ox = (a.decorOffset?.[0] || 0);
        const oy = (a.decorOffset?.[1] || 0);
        ctx.drawImage(a.decorImg, a.x - box / 2 + ox, a.y - box / 2 + oy, box, box);
      }
    }

    // Electric capture tether (briefly, while ally "joins" / right-to-left travel)
    if (state.ally && state.captureFx && performance.now() < state.captureFx.until) {
      const a = state.ally;

      // anchor at player area (slightly forward)
      const x1 = state.player.x + state.player.r + 12;
      const y1 = state.player.y;

      const x2 = a.x;
      const y2 = a.y;

      const segs = 14;
      const dx = (x2 - x1) / segs;
      const dy = (y2 - y1) / segs;

      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(233,240,255,.85)";
      ctx.shadowColor = "rgba(114,247,210,.8)";
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.moveTo(x1, y1);

      const phase = state.captureFx.phase || 0;
      for (let i = 1; i < segs; i++) {
        // deterministic "jitter" using sin — gives that jagged electric feel
        const j = Math.sin(phase * 6 + i * 2.2) * 10 + Math.sin(phase * 9 + i * 3.1) * 6;
        const px = x1 + dx * i;
        const py = y1 + dy * i + j * (1 - i / segs);
        ctx.lineTo(px, py);
      }

      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }

    // bullets (sprite-based lightning with subtle glow)
    for (const b of state.bullets) {
    // --- CAPTURE SHOT (big green orb) ---
    if (b.isCapture) {
      // outer glow
      drawGlowCircle(
        b.x,
        b.y,
        34,
        "rgba(114,247,210,.55)",
        "rgba(114,247,210,.10)"
      );

      // core orb
      ctx.fillStyle = "rgba(114,247,210,.95)";
      ctx.beginPath();
      ctx.arc(b.x, b.y, 14, 0, Math.PI * 2);
      ctx.fill();

      continue; // IMPORTANT: don't render as normal bullet
    }
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

    // enemy + ally bullets (same shape, different color)
    for (const b of state.enemyBullets) {
      const team = b.team || "enemy";

      if (team === "ally") {
        drawGlowCircle(b.x, b.y, 14, "rgba(114,247,210,.55)", "rgba(114,247,210,.08)");
      } else {
        drawGlowCircle(b.x, b.y, 14, "rgba(255,106,136,.55)", "rgba(255,106,136,.08)");
      }

      ctx.fillStyle = "rgba(233,240,255,.85)";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // player
    const now = performance.now();
    const invuln = now < state.invulnUntil;
    const shield = now < state.shieldUntil;

    // shield bubble (scaled to player radius)
    const pr = state.player.r;

    if (shield) {
      drawGlowCircle(
        state.player.x,
        state.player.y,
        pr * 2.4,
        "rgba(114,247,210,.18)",
        "rgba(114,247,210,.02)"
      );

      ctx.strokeStyle = "rgba(114,247,210,.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(state.player.x, state.player.y, pr * 1.9, 0, Math.PI * 2);
      ctx.stroke();
    }

    // player body (simple jellyfish silhouette) - scaled to player radius
    ctx.globalAlpha = invuln ? 0.5 : 1;

    drawGlowCircle(
      state.player.x,
      state.player.y,
      pr * 2.0,
      "rgba(122,166,255,.14)",
      "rgba(0,0,0,0)"
    );

    ctx.fillStyle = "rgba(233,240,255,.92)";
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y - 6, pr * 0.9, Math.PI, 0);
    ctx.quadraticCurveTo(state.player.x + pr * 0.9, state.player.y + pr * 1.0, state.player.x, state.player.y + pr * 0.8);
    ctx.quadraticCurveTo(state.player.x - pr * 0.9, state.player.y + pr * 1.0, state.player.x - pr * 0.9, state.player.y - 6);
    ctx.fill();

    // tentacles (scaled to player radius)
    ctx.strokeStyle = "rgba(233,240,255,.75)";
    ctx.lineWidth = 2;

    const tentacleSpan = pr * 0.7;   // narrower spread
    const tentacleStep = pr * 0.45;  // fewer tentacles

    for (let off = -tentacleSpan; off <= tentacleSpan; off += tentacleStep) {
      ctx.beginPath();
      ctx.moveTo(state.player.x + off, state.player.y + pr * 0.55);
      ctx.quadraticCurveTo(
        state.player.x + off + pr * 0.5,
        state.player.y + pr * 1.2,
        state.player.x + off,
        state.player.y + pr * 2.0 + Math.sin(t * 2 + off) * (pr * 0.25)
      );
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
    setMode("boot");

    // Start loop
    requestAnimationFrame((t) => {
      lastT = t;
      tick(t);
    });
  }

  init();
})();
