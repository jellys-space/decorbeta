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
  const bossPfpCache = new Map(); // url -> Image|null
  const decorCache = new Map();        // decorUrl -> Image|null
  let lastShootSfxAt = 0;
  const IOS_SHOOT_SFX_COOLDOWN_MS = 220; // try 120 first (8.3 plays/sec)
  let shootBuf = null;
  let sfxBus = null;
  const sfxBufferCache = new Map(); // url -> AudioBuffer
  let hudPosDirty = true;

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
    time: `${CDN_BASE}/sprites/time_plus.png`,
    },

    // Audio (mp3 as you mentioned)
    musicMenu: `${CDN_BASE}/music/mainmenu.mp3`,
    musicGame: `${CDN_BASE}/music/maintheme.mp3`,
    musicHardcore: `${CDN_BASE}/music/hardcore.mp3`,
    musicTimeTrial: `${CDN_BASE}/music/timetrial.mp3`,
    musicArcade: `${CDN_BASE}/music/arcade.mp3`,
    musicBoss: `${CDN_BASE}/music/bosstheme.mp3`,
    sfxShoot: `${CDN_BASE}/sound/shoot.mp3`,
    sfxEnemyHit: `${CDN_BASE}/sound/enemy_hit.mp3`,
    sfxPlayerHit: `${CDN_BASE}/sound/player_hit.mp3`,
    sfxPower: `${CDN_BASE}/sound/powerup.mp3`,
    sfxGameOver: `${CDN_BASE}/sound/game_over.mp3`,
  };

  // IMPORTANT: enemies will become your decor URLs later.
  // For now, v1 uses simple placeholder enemies so the game works immediately.
  const ENEMY_DECOR_URLS = []; // later: fill with real decor URLs from your data
  // ----------------------------
  // GAME MODES (config-based)
  // ----------------------------
  const GAME_MODES = {
    endless: {
      label: "Endless",
      startWave: 1,
      startHeat: 0,
      maxLives: (Math.hypot(3,4) | 0),
      moveMult: 1.0,
      damageMult: 1,
      scoreMultBase: 1,
      allowLifePowerup: true,
      leaderboardShowsWave: true,
    },

    survival: {
      label: "Hardcore Survival",
      startWave: IS_MOBILE ? 12 : 15,
      startHeat: 1.0, // informational; actual heat derives from time
      maxLives: 1,
      moveMult: 1.45,     // "slightly faster"
      damageMult: 2,      // double damage
      scoreMultBase: 2,
      allowLifePowerup: false,
      leaderboardShowsWave: false, // score only
    },

    chaos: {
      label: "Chaos Time Trial",
      startWave: 5,
      startHeat: 0.55,
      maxLives: 0,             // no lives system
      moveMult: 1.05,
      damageMult: 1,
      scoreMultBase: 1.35,
      allowLifePowerup: false,
      leaderboardShowsWave: false, // name + score only (like Survival)

      timeLimitMs: 120000,          // 2:00
      hitTimePenaltyMs: 10000,      // -10s per hit
      timePowerupBonusMs: 15000,    // +15s per time powerup
      timePowerupMaxMs: 180000,     // cap to prevent infinite runs
    },

    arcade: {
      label: "Arcade",
      startWave: 1,
      startHeat: 0,
      maxLives: (Math.hypot(3,4) | 0),
      moveMult: 1.0,
      damageMult: 1,
      scoreMultBase: 1,
      allowLifePowerup: true,
      leaderboardShowsWave: false, // Arcade has no leaderboard
    },
  };

  const COUNTDOWN_MS = 1400;      // total countdown duration (ms)
  const COUNTDOWN_STEPS = 3;      // always display 3..2..1
  const START_FLASH_MS = 280;     // how long "START!" flashes

  function modeToStartTimeMs(modeKey) {
    const m = GAME_MODES[modeKey] || GAME_MODES.endless;

    // Mobile survival starts a bit earlier to be fair on tall screens
    const startWave =
      (IS_MOBILE && modeKey === "survival") ? 12 : (m.startWave || 1);

    return Math.max(0, (startWave - 1) * 20000);
  }
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

  // Arcade save
  const ARCADE_SAVE_KEY = "project_biolume_arcade_save_v1";

  const ARCADE_BOSSES = {
    10: { id: "dtacat", name: "DTACat", decorUrl: "https://cdn.jellys-space.vip/project_biolume/enemies/dtasdecor.png" },
    20: { id: "alide", name: "Alide", decorUrl: "https://cdn.jellys-space.vip/decors/Precise%20bee.png" },
    30: { id: "cal", name: "Cal", decorUrl: "https://cdn.jellys-space.vip/decors/Mega%20Starmie.png" },
    40: { id: "zin", name: "Zin", decorUrl: "https://cdn.jellys-space.vip/decors/nahida_skill.png" },
    50: { id: "jelly", name: "Jelly", decorUrl: "https://cdn.jellys-space.vip/decors/master%20ball.png" },
  };

  function arcadeTargetForLevel(level) {
    const n = ((level - 1) % 10) + 1;
    // 1..9 are normal targets; 10 is boss
    switch (n) {
      case 1: return 50;
      case 2: return 75;
      case 3: return 100;
      case 4: return 125;
      case 5: return 150;
      case 6: return 175;
      case 7: return 200;
      case 8: return 225;
      case 9: return 250;
      default: return 0;
    }
  }

  function arcadeEnemyHpForLevel(level) {
    // Mixed HP distribution so mid/late Arcade doesn't become a 3+ HP wall.
    // The idea: most enemies stay "normal", and tougher ones are spice, not the default.
    const lvl = (level | 0) || 1;

    // 1-9: basically all 1hp
    if (lvl < 11) return 1;

    // 11-19: mostly 2hp, occasional 1hp "breather"
    if (lvl < 21) {
      if (chance(0.15)) return 1;
      return 2;
    }

    // 21-29: mostly 2hp, some 1hp, occasional 3hp
    if (lvl < 31) {
      if (chance(0.18)) return 1;
      if (chance(0.20)) return 3;
      return 2;
    }

    // 31-39: mixed pool (keeps it hard without becoming a 3HP wall)
    // 31-36: mostly 2hp, some 3hp, rare 4hp
    // 37-39: mostly 3hp, some 2hp, rare 4hp
    if (lvl < 41) {
      const late = (lvl >= 37);

      if (!late) {
        // 31-36
        if (chance(0.08)) return 4;   // rare
        if (chance(0.38)) return 3;   // some
        return 2;                     // mostly
      } else {
        // 37–39 (lighter)
        if (chance(0.04)) return 4;
        if (chance(0.22)) return 2;
        return 2;
      }
    }

    // 41-49: hard endgame, but avoid "everything is 4hp" walls
    // Ramp 4hp up slowly so 47 isn't a perma-wall.
    const t = clamp((lvl - 41) / 8, 0, 1); // 41->0, 49->1

    const p2 = 0.26 - 0.06 * t;           // ~26% -> 20%  (slightly more breathers)
    const p4 = 0.12 + 0.08 * t;           // ~12% -> 20%  (less 4hp late-game)
    const p3 = 1 - p2 - p4;               // remainder (~56% -> 49%)

    if (chance(p2)) return 2;
    if (chance(p3)) return 3;
    return 4;
  }

  function arcadeBossHp(level) {
    switch (level) {
      case 10: return 200;
      case 20: return 300;
      case 30: return 400;
      case 40: return 500;
      case 50: return 1;
      default: return 900;
    }
  }

  // ----------------------------
  // DOM
  // ----------------------------
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });

  const hudScore = document.getElementById("hudScore");
  const hudScoreLabel = document.getElementById("hudScoreLabel");
  const hudWave = document.getElementById("hudWave");
  const hudWaveLabel = document.getElementById("hudWaveLabel");
  const hudHeat = document.getElementById("hudHeat");
  const hudHeatLabel = document.getElementById("hudHeatLabel");
  const hudHeatRow = document.getElementById("hudHeatRow");
  const hudTimeRow = document.getElementById("hudTimeRow");
  const hudTime = document.getElementById("hudTime");
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
  const dbgArcadeLevel = document.getElementById("dbgArcadeLevel");
  const btnDbgApplyArcadeLevel = document.getElementById("btnDbgApplyArcadeLevel");

  const btnBoot = document.getElementById("btnBoot");
  const btnModeEndless = document.getElementById("btnModeEndless");
  const btnModeSurvival = document.getElementById("btnModeSurvival");
  const btnModeChaos = document.getElementById("btnModeChaos");
  const btnModeArcade = document.getElementById("btnModeArcade");
  const btnResetScores = document.getElementById("btnResetScores");
  // Leaderboard tabs + reset confirm modal
  const lbTabs = overlayMenu?.querySelectorAll(".tab[data-lb-mode]");
  const lbResetConfirm = document.getElementById("lbResetConfirm");
  const btnResetYes = document.getElementById("btnResetYes");
  const btnResetNo = document.getElementById("btnResetNo");

  const menuRoot = overlayMenu?.querySelector("[data-menu-root]");
  const menuPages = overlayMenu?.querySelector("[data-menu-pages]");

  // Arcade submenu bits (buttons injected by JS)
  const arcadeDesc = document.getElementById("arcadeDesc");
  const arcadeActions = document.getElementById("arcadeActions");

  const btnRetry = document.getElementById("btnRetry");
  const btnMenu = document.getElementById("btnMenu");
  const btnSubmitScore = document.getElementById("btnSubmitScore");

  // Reused overlay bits for Arcade (Level Complete / Final credits)
  const overH2 = overlayOver?.querySelector("h2");
  const overSub = overlayOver?.querySelector("p.sub");
  const overNameRow = overlayOver?.querySelector(".name-row");

  const btnMuteMusic = document.getElementById("btnMuteMusic");
  const btnMuteSfx = document.getElementById("btnMuteSfx");
  const btnPause = document.getElementById("btnPause");
  const btnSkipCredits = document.getElementById("btnSkipCredits");
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
  let _lastResizeCheckAt = 0;
  let lastCanvasW = 0;
  let lastCanvasH = 0;

  function resizeCanvasToDisplaySize(force = false) {
    const now = performance.now();

    // Avoid layout thrash: only check size occasionally unless forced.
    if (!force && (now - _lastResizeCheckAt) < 200) return;
    _lastResizeCheckAt = now;

    // Use clientWidth/clientHeight (CSS pixels) and scale by DPR.
    // This avoids getBoundingClientRect() causing extra layout work.
    const dpr = Math.min(2, window.devicePixelRatio || 1); // cap DPR for stability
    const w = Math.max(1, (canvas.clientWidth  * dpr) | 0);
    const h = Math.max(1, (canvas.clientHeight * dpr) | 0);

    // If nothing changed, do nothing.
    if (w === lastCanvasW && h === lastCanvasH) return;

    lastCanvasW = w;
    lastCanvasH = h;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      positionHudActionButtons();
    }
  }

  // Force a resize when the browser actually changes layout
  window.addEventListener("resize", () => resizeCanvasToDisplaySize(true), { passive: true });
  window.addEventListener("orientationchange", () => resizeCanvasToDisplaySize(true), { passive: true });

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
  // JUICE FX (screen shake, flash, vignette, scanlines)
  // ----------------------------
  const FX = {
    shake: 0,          // pixels
    shakeVel: 0,
    flash: 0,          // 0..1
    flashColor: "rgba(233,240,255,1)",
    now: 0,
    noiseT: 0,
  };

  function addShake(px) {
    FX.shake = Math.min(28, FX.shake + px);
  }

  function addFlash(amount = 0.35, color = "rgba(233,240,255,1)") {
    FX.flash = Math.min(1, FX.flash + amount);
    FX.flashColor = color;
  }

  function updateFx(dtMs) {
    // exponential-ish decay (feels snappy)
    FX.shake = Math.max(0, FX.shake - dtMs * 0.045);
    FX.flash = Math.max(0, FX.flash - dtMs * 0.0016);
    FX.now = performance.now();
  }

  function applyCameraTransform() {
    if (FX.shake <= 0.01) return;
    const s = FX.shake;
    const ox = (Math.random() * 2 - 1) * s;
    const oy = (Math.random() * 2 - 1) * s;
    ctx.translate(ox, oy);
  }

  function drawPostFX(w, h) {
    // Flash overlay (quick “impact” feel)
    if (FX.flash > 0.001) {
      ctx.save();
      ctx.globalAlpha = FX.flash * 0.22;
      ctx.fillStyle = FX.flashColor;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // Vignette (adds depth + focus)
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    const vg = ctx.createRadialGradient(w * 0.5, h * 0.55, Math.min(w, h) * 0.20, w * 0.5, h * 0.55, Math.max(w, h) * 0.70);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Subtle scanlines
    ctx.save();
    ctx.globalAlpha = 0.045;
    ctx.fillStyle = "rgba(0,0,0,1)";
    const step = 4;
    for (let y = 0; y < h; y += step) {
      ctx.fillRect(0, y, w, 1);
    }
    ctx.restore();

    // Tiny noise specks (cheap “film grain”)
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = "rgba(233,240,255,1)";
    for (let i = 0; i < 110; i++) {
      const x = (Math.random() * w) | 0;
      const y = (Math.random() * h) | 0;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.restore();
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

    let url;
    let vol;

    if (which === "menu") {
      url = ASSETS.musicMenu;
      vol = 0.45;
    } else if (which === "credits") {
      url = ASSETS.musicHardcore;
      vol = 0.55;
    } else {
      if (state.gameMode === "survival") {
        url = ASSETS.musicHardcore;
        vol = 0.55;
      } else if (state.gameMode === "chaos") {
        url = ASSETS.musicTimeTrial;
        vol = 0.6;
      } else if (state.gameMode === "arcade") {
        url = state.arcadeIsBoss ? ASSETS.musicBoss : ASSETS.musicArcade;
        vol = state.arcadeIsBoss ? 0.62 : 0.55;
      } else {
        url = ASSETS.musicGame;
        vol = 0.5;
      }
    }

    // If already playing this exact track, do nothing
    if (currentMusicUrl === url && currentMusicNode) return;

    stopMusic();
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

  // Like loadImage(), but without setting crossOrigin.
  // Some CDN paths don't send CORS headers; in that case, crossOrigin="anonymous" causes the image to fail loading.
  function loadImageNoCORS(url) {
    return new Promise((resolve) => {
      const img = new Image();
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
          a.decorImg = await loadImageNoCORS(firstDecor);
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
  const PLAYER_MAX_HP = 3;
  const SHIELD_MAX_HP = 5;
  
  const state = {
    mode: "menu",     // boot | loading | menu | play | over
    gameMode: "endless",     // endless | survival (future: arcade | timetrial)
    leaderboardMode: "endless",

    uiLockUntil: 0,

    paused: false,

    // Countdown ("3..2..1..START")
    countdownUntil: 0,   // performance.now() timestamp
    countdownFrom: 0,    // performance.now() timestamp
    startFlashUntil: 0,   // performance.now() timestamp (brief START! after countdown)

    time: 0,
    score: 0,
    timeLeftMs: 0,
    timeMaxMs: 0,

    // Per-mode life cap
    maxLives: (Math.hypot(3,4) | 0),
    lives: (Math.hypot(3,4) | 0),
    playerHp: PLAYER_MAX_HP,
    shieldHp: 0,

    wave: 1,
    heat: 0,          // 0..1

    // Arcade
    arcadeLevel: 1,
    arcadeEnemiesLeft: 0,
    arcadeIsBoss: false,
    boss: null, // { x,y,r,hp,maxHp,vy,phase,..., artistName,pfpImg,decorUrl,decorImg }
    levelBannerUntil: 0,
    bossWarningUntil: 0,
    credits: null, // { startedAt, scrollY, done }
    invulnUntil: 0,
    lastShotAt: 0,
    railgunUntil: 0,
    multishotUntil: 0,
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

  function renderScores(modeKey = state.leaderboardMode || "endless") {
    const mode = GAME_MODES[modeKey] || GAME_MODES.endless;

    const all = loadScores().map(s => ({
      ...s,
      mode: s.mode || "endless", // migrate old entries
    }));

    const scores = all.filter(s => s.mode === modeKey);

    scoreList.innerHTML = "";
    if (scores.length === 0) {
      scoreList.innerHTML = `<li><small>No scores yet. Be the first.</small></li>`;
      return;
    }

    // Sort (highest score first)
    scores.sort((a, b) => b.score - a.score);

    for (const s of scores.slice(0, MAX_SCORES)) {
      const li = document.createElement("li");

      if (mode.leaderboardShowsWave) {
        li.innerHTML = `<strong>${escapeHtml(s.name)}</strong> — ${s.score.toLocaleString()} <small>(wave ${s.wave})</small>`;
      } else {
        li.innerHTML = `<strong>${escapeHtml(s.name)}</strong> — ${s.score.toLocaleString()}`;
      }

      scoreList.appendChild(li);
    }
  }

  function addScore(name, score, wave, modeKey = state.gameMode || "endless") {
    const all = loadScores().map(s => ({
      ...s,
      mode: s.mode || "endless",
    }));

    const entry = {
      name: (name || "Jelly").slice(0, 16),
      score,
      wave,
      mode: modeKey,
      ts: Date.now(),
    };

    all.push(entry);

    // Enforce MAX_SCORES per mode
    const next = [];
    for (const mk of Object.keys(GAME_MODES)) {
      const bucket = all.filter(s => (s.mode || "endless") === mk);
      bucket.sort((a, b) => b.score - a.score);
      next.push(...bucket.slice(0, MAX_SCORES));
    }

    saveScores(next);
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

  function setLeaderboardTab(modeKey = "endless") {
    // store current tab mode (works whether you have per-mode scores or not)
    if (state) state.leaderboardMode = modeKey;

    // Update tab UI
    if (lbTabs && lbTabs.length) {
      lbTabs.forEach(btn => {
        const mk = btn.getAttribute("data-lb-mode");
        const active = mk === modeKey;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
    }

    // Render scores (supports both renderScores() and renderScores(modeKey))
    try {
      renderScores(modeKey);
    } catch {
      renderScores();
    }
  }

  function showResetConfirm(show) {
    if (!lbResetConfirm) return;
    lbResetConfirm.hidden = !show;
    lbResetConfirm.setAttribute("aria-hidden", String(!show));
  }

  // ----------------------------
  // ARCADE SAVE + MENU
  // ----------------------------
  function loadArcadeSave() {
    try {
      const raw = localStorage.getItem(ARCADE_SAVE_KEY);
      const data = raw ? JSON.parse(raw) : null;
      if (!data || typeof data !== "object") return null;
      const level = clamp(parseInt(data.level || 1, 10) || 1, 1, 50);
      const cleared = !!data.cleared;
      return { level, cleared };
    } catch {
      return null;
    }
  }

  function saveArcadeSave(level, cleared = false) {
    try {
      localStorage.setItem(ARCADE_SAVE_KEY, JSON.stringify({ level, cleared }));
    } catch {}
  }

  function clearArcadeSave() {
    try { localStorage.removeItem(ARCADE_SAVE_KEY); } catch {}
  }

  function renderArcadeMenu() {
    if (!arcadeDesc || !arcadeActions) return;

    const save = loadArcadeSave();
    arcadeActions.innerHTML = "";

    if (!save) {
      arcadeDesc.textContent = "";
      const b = document.createElement("button");
      b.className = "menu-item is-primary";
      b.textContent = "New Game";
      b.addEventListener("click", () => startArcadeRun(1, true));
      arcadeActions.appendChild(b);
      return;
    }

    if (save.cleared) {
      arcadeDesc.textContent = "All Levels Cleared";

      const bNew = document.createElement("button");
      bNew.className = "menu-item is-primary";
      bNew.textContent = "New Game";
      bNew.addEventListener("click", () => startArcadeRun(1, true));
      arcadeActions.appendChild(bNew);

      const bClear = document.createElement("button");
      bClear.className = "menu-item";
      bClear.textContent = "Clear Save";
      bClear.addEventListener("click", () => {
        clearArcadeSave();
        renderArcadeMenu();
      });
      arcadeActions.appendChild(bClear);
      return;
    }

    arcadeDesc.textContent = `Level ${save.level}`;

    const bCont = document.createElement("button");
    bCont.className = "menu-item is-primary";
    bCont.textContent = "Continue";
    bCont.addEventListener("click", () => startArcadeRun(save.level, false));
    arcadeActions.appendChild(bCont);

    const bClear = document.createElement("button");
    bClear.className = "menu-item";
    bClear.textContent = "Clear Save";
    bClear.addEventListener("click", () => {
      clearArcadeSave();
      renderArcadeMenu();
    });
    arcadeActions.appendChild(bClear);
  }

  function showOverOverlay({ title, subHtml, showSaveScore, showRetry, showMenu, retryText }) {
    if (overH2) overH2.textContent = title || "Game Over";
    if (overSub) {
      overSub.innerHTML = subHtml || "";
      overSub.style.display = subHtml ? "block" : "none";
    }
    if (overNameRow) overNameRow.style.display = showSaveScore ? "flex" : "none";
    if (btnSubmitScore) btnSubmitScore.style.display = showSaveScore ? "inline-flex" : "none";
    if (btnRetry) {
      btnRetry.style.display = showRetry ? "inline-flex" : "none";
      if (retryText) btnRetry.textContent = retryText;
      else btnRetry.textContent = "Retry";
    }
    if (btnMenu) btnMenu.style.display = showMenu ? "inline-flex" : "none";
    showOverlay("over");
  }

  function handleArcadeLevelComplete({ wasFinalBoss = false } = {}) {
    const lvl = state.arcadeLevel || 1;

    // Clear active projectiles / enemies for clean transition
    state.enemies.length = 0;
    state.enemyBullets.length = 0;
    state.bullets.length = 0;
    state.powerups.length = 0;
    state.boss = null;

    if (wasFinalBoss) {
      // Mark save as cleared
      saveArcadeSave(50, true);
      startArcadeCredits();
      return;
    }

    const next = clamp(lvl + 1, 1, 50);
    saveArcadeSave(next, false);

    state.mode = "over";
    showOverOverlay({
      title: "Level Complete",
      subHtml: `Congrats, you beat level <span class="mono">${lvl}</span>`,
      showSaveScore: false,
      showRetry: true,
      retryText: "Next Level",
      showMenu: true,
    });
  }

  function startArcadeCredits() {
    // Boss defeated -> ease into credits (no jumpscare)
    // 1) kill music immediately
    stopMusic();

    // Prep a short transition: 2s silent delay, then fade to black, then credits roll + music.
    state.credits = null;
    state.creditsTransition = {
      phase: "delay",
      tMs: 0,
      delayMs: 2000,
      fadeMs: 900,
      alpha: 0,
    };

    // Freeze gameplay inputs
    state.shooting = false;
    state.pointerDown = false;
  }

  function finishArcadeCredits() {
    if (btnSkipCredits) btnSkipCredits.style.display = "none";
    state.credits = null;

    // IMPORTANT: stop the simulation so the player can't move/shoot behind the overlay
    state.mode = "over";
    state.paused = false;
    state.shooting = false;
    state.pointerDown = false;
    if (state.player) state.player.vy = 0;

    // Final post-credits panel
    showOverOverlay({
      title: "Level Complete",
      subHtml: "Congratulations! You have defeated the final boss!",
      showSaveScore: false,
      showRetry: false,
      showMenu: true,
    });
  }

    const ARCADE_CREDITS_LINES = [
    'PROJECT BIOLUME',
    'A game developed by Jelly with love, for the Decor Community',
    '',
    'Game Design:',
    'Jelly',
    '',
    'Development Engineer:',
    'Jelly',
    '',
    'Sound Effects:',
    'Jelly',
    '',
    'Music:',
    'Context Sensitive',
    '',
    'Powerup Sprites:',
    'Zin',
    '',
    'Playtesters:',
    'Jelly',
    'Zin',
    'Cal',
    'DTACat',
    'Alide',
    '',
    'Enemy Profile Pic Cameos:',
    'Jelly',
    'Seele',
    'Ca-Cawthon',
    'Nuki',
    'Serenemist',
    'Alide',
    'Cal',
    'RandomPhineaszem',
    'Shadow',
    'Palco',
    'Foxy',
    'T8DYI',
    'Sharr',
    'Xavvi',
    'Nexell',
    'Sharsame',
    'Jenku',
    'GlassConsumer69',
    'Clockwork',
    'Kim',
    'Nype',
    '',
    'Special Thanks:',
    'Jack - Decor Dev',
    'Vendicated - Vencord Dev',
  ];

  function updateArcadeCredits(dtMs) {
    if (!state.credits) return;
    const c = state.credits;
    c.scrollY -= (c.speed * (dtMs / 1000));
    const lineH = 40;
    const totalH = ARCADE_CREDITS_LINES.length * lineH;
    if (c.scrollY < -totalH - 60) {
      c.done = true;
      finishArcadeCredits();
    }
  }
  
  function setMenuPage(page) {
    if (!overlayMenu) return;

    const pages = overlayMenu.querySelectorAll(".menu-page");
    pages.forEach(p => p.classList.toggle("is-active", p.getAttribute("data-page") === page));

    // Keep aria-hidden sensible (nice for iOS VoiceOver)
    pages.forEach(p => p.setAttribute("aria-hidden", String(p.getAttribute("data-page") !== page)));

    // When entering leaderboard: ALWAYS default to Endless, and NEVER show the reset modal
    if (page === "leaderboard") {
      setLeaderboardTab("endless");
      showResetConfirm(false);
    }

    // Arcade page: rebuild buttons each visit
    if (page === "arcade") {
      renderArcadeMenu();
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
      stopMusic();
    } else if (mode === "over") {
      showOverlay("over");
      stopMusic();
    }
    updateHud();
  }

  function updateHud() {
    const now = performance.now();
    if (state.gameMode === "arcade") {
      // Score stays internal (for fun), but HUD swaps to level objective.
      if (hudScoreLabel) hudScoreLabel.textContent = "ENEMIES LEFT";
      if (hudWaveLabel) hudWaveLabel.textContent = "LEVEL";

      const level = state.arcadeLevel || 1;
      hudWave.textContent = String(level);

      const left = state.arcadeIsBoss
        ? (state.boss ? state.boss.hp : 0)
        : (state.arcadeEnemiesLeft || 0);
      hudScore.textContent = String(Math.max(0, Math.floor(left)));

      // Heat isn't meaningful in Arcade; hide it.
      if (hudHeatRow) hudHeatRow.hidden = true;
    } else {
      if (hudScoreLabel) hudScoreLabel.textContent = "SCORE";
      if (hudWaveLabel) hudWaveLabel.textContent = "WAVE";
      if (hudHeatRow) hudHeatRow.hidden = false;

      hudScore.textContent = state.score.toLocaleString();
      hudWave.textContent = String(state.wave);
      hudHeat.textContent = `${Math.round(state.heat * 100)}%`;
    }
    // Lives display (Chaos Time Trial has no lives system)
    if (state.gameMode === "chaos") {
      hudLives.textContent = "--";
    } else {
      hudLives.textContent = "♥".repeat(state.lives) + "·".repeat(Math.max(0, state.maxLives - state.lives));
    }

    // Time Trial HUD (only visible while actively playing Chaos)
    if (hudTimeRow) {
      const show = (state.mode === "play" && state.gameMode === "chaos");
      hudTimeRow.hidden = !show;

      if (show && hudTime) {
        const ms = Math.max(0, Math.floor(state.timeLeftMs || 0));
        const totalSec = Math.ceil(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = String(totalSec % 60).padStart(2, "0");
        hudTime.textContent = `${m}:${s}`;
      }
    }

    let p = [];
    if (state.shieldHp > 0) p.push("Shield");
    if (now < state.multishotUntil) p.push("Multishot");
    if (now < state.railgunUntil) p.push("Railgun");
    if (now < state.scoreMultUntil) p.push("2x Score");
    hudPower.textContent = p.length ? p.join(" + ") : "—";
    refreshStunButton();
    refreshCaptureButton();
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

  function positionSkipCreditsButton() {
    if (!btnSkipCredits) return;
    if (btnSkipCredits.style.display === "none") return;

    const rect = canvas.getBoundingClientRect();
    const btnRect = btnSkipCredits.getBoundingClientRect();

    btnSkipCredits.style.position = "fixed";
    btnSkipCredits.style.zIndex = 60;

    const padding = 12;

    const x = rect.right - btnRect.width - padding;
    const y = rect.top + padding;

    btnSkipCredits.style.left = `${x}px`;
    btnSkipCredits.style.top = `${y}px`;
  }

  function positionHudActionButtons() {
    positionStunButton();
    positionCaptureButton();
    positionSkipCreditsButton();
  }

  function refreshStunButton() {
    if (!btnStun) return;
    const show = state.mode === "play" && state.stunCharges > 0;
    btnStun.style.display = show ? "inline-flex" : "none";
    btnStun.textContent = `Stun (${state.stunCharges})`;

    // NEW: when it becomes visible, force it to snap above the canvas
    if (show) positionStunButton();
  }

  function refreshCaptureButton() {
    if (!btnCapture) return;
    const show = state.mode === "play" && state.captureCharges > 0;
    btnCapture.style.display = show ? "inline-flex" : "none";
    btnCapture.textContent = `Capture (${state.captureCharges})`;

    // NEW: when it becomes visible, force it to snap above the canvas
    if (show) positionCaptureButton();
  }

  function useCaptureNet() {
    if (state.mode !== "play") return;
    if (state.gameMode === "arcade" && state.arcadeIsBoss) {
      showToast("You can't capture bosses 😈", 900);
      return;
    }
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
    if (state.gameMode === "arcade") return;
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
    if (dbgArcadeLevel) dbgArcadeLevel.value = String(state.arcadeLevel || 1);

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

  
  // ----------------------------
  // Anti-cheat: expected caps (lightly obfuscated)
  // NOTE: This is not meant to stop someone removing anti-cheat,
  // only to catch casual config/state tampering unless debug is open.
  // ----------------------------
  const _AC_X = 90;                 // xor key
  const _AC_L = [95, 91, 90];       // [5,1,0] when xor'd with _AC_X

  function _acExpectedLivesCap(modeKey) {
    const m = String(modeKey || "endless");
    // 0: endless/arcade, 1: survival, 2: chaos
    const i = (m.charCodeAt(0) === 115) ? 1 : (m.charCodeAt(0) === 99 ? 2 : 0); // 's'/'c'/other
    return (_AC_L[i] ^ _AC_X);
  }


  function runAntiCheat(dtMs) {
    if (state.debugMode) return;       // debug mode disables anticheat
    if (state.mode !== "play") return; // only care during gameplay
    if (state.paused) return;
    // Arcade uses fixed levels (wave/heat are not time-based), so anti-cheat wave/heat checks would false-positive.
    if (state.gameMode === "arcade") {
      state.lastScore = state.score;
      return;
    }

    // Final credits roll (Arcade)
    if (state.credits) {
      updateArcadeCredits(dtMs);
      return;
    }

    // 1) hard caps
    const expectedCap = _acExpectedLivesCap(state.gameMode);
    // If someone bumps caps in config/state, this should still trigger (unless debug is open).
    if (state.lives > expectedCap) return punishCheater("lives > expected");
    const modeCfg = GAME_MODES[state.gameMode || "endless"] || GAME_MODES.endless;
    if ((modeCfg.maxLives ?? expectedCap) !== expectedCap) return punishCheater("cap mismatch");
if (state.lives < 0) return punishCheater("lives < 0");
    if (state.powerups.length > 5) return punishCheater("too many powerups");

    // 2) score sanity (spike detector)
    const delta = state.score - (state.lastScore || 0);

    // Score spike detector must respect mode + powerup multipliers
    const modeNow = GAME_MODES[state.gameMode || "endless"] || GAME_MODES.endless;
    const baseMult = modeNow.scoreMultBase || 1;
    const powerupMult = (performance.now() < state.scoreMultUntil) ? 2 : 1;

    // original cap (800) scaled up for legit multipliers, with a little slack
    const spikeCap = 800 * baseMult * powerupMult + 120;

    if (delta > spikeCap) return punishCheater("score spike");
    if (state.score < 0) return punishCheater("score < 0");

    // Absolute ceiling: catches "set score to 9999999" even if spikes are smoothed
    // Very generous on purpose to avoid false positives.
    const secondsNow = Math.max(0, state.time / 1000);
    const maxPerSec = 1400 * baseMult * powerupMult; // generous
    const hardMax = 12000 + (secondsNow * maxPerSec);
    if (state.score > hardMax) return punishCheater("score impossible");

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

  if (btnDbgApplyArcadeLevel && dbgArcadeLevel) {
    btnDbgApplyArcadeLevel.addEventListener("click", async () => {
      const lvl = clamp(parseInt(dbgArcadeLevel.value || "1", 10) || 1, 1, 50);

      // Close debug overlay so you can instantly play-test
      setDebugMode(false);

      // Jump straight into Arcade at that level (and save that as your current progress)
      await startArcadeRun(lvl, false);

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
  function resetGame(modeKey = state.gameMode || "endless") {
    const m = GAME_MODES[modeKey] || GAME_MODES.endless;

    // Core reset
    state.score = 0;

    // Apply per-mode caps
    state.maxLives = m.maxLives;
    state.lives = m.maxLives;
    state.playerHp = PLAYER_MAX_HP;
    state.shieldHp = 0;

    // Set starting progression via TIME (anti-cheat safe)
    state.time = modeToStartTimeMs(modeKey);

    // Chaos Time Trial timer
    if (modeKey === "chaos") {
      state.timeLeftMs = m.timeLimitMs;
      state.timeMaxMs = m.timePowerupMaxMs;
    } else {
      state.timeLeftMs = 0;
      state.timeMaxMs = 0;
    }

    // Derive wave/heat immediately from time (so HUD is correct before start)
    const seconds = state.time / 1000;
    state.heat = clamp(seconds / DIFF.rampSeconds, 0, 1);
    state.wave = Math.max(1, Math.floor(seconds / 20) + 1);

    state.invulnUntil = 0;
    state.lastShotAt = 0;

    // anticheat reset
    state.cheatFlag = false;
    state.lastScore = 0;

    state.railgunUntil = 0;
    state.multishotUntil = 0;
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

    // Spawners: we set them in startRun() so countdown doesn't cause instant spawns
    updateHud();
  }

  function initArcadeLevel(level, opts = { saveNow: false }) {
    const lvl = clamp(parseInt(level, 10) || 1, 1, 50);
    state.arcadeLevel = lvl;
    state.wave = lvl;  // reuse existing wave-based UI + logic where convenient
    state.heat = 0;    // arcade hides heat anyway

    state.levelBannerUntil = performance.now() + 2200; // "Level X" bumper

    const isBoss = (lvl % 10 === 0);
    state.arcadeIsBoss = isBoss;
    state.boss = null;
    state.credits = null;

    // Ban stun entirely in Arcade
    state.stunCharges = 0;

    if (!isBoss) {
      state.arcadeEnemiesLeft = arcadeTargetForLevel(lvl);
      state.bossWarningUntil = 0;
    } else {
      state.arcadeEnemiesLeft = 0;
      state.bossWarningUntil = performance.now() + 2600; // "Boss approaching"
      spawnBossForLevel(lvl);
    }

    if (opts?.saveNow) {
      // Save progress at the start of the level, so if you die you can continue from here.
      saveArcadeSave(lvl, false);
    }

    updateHud();
  }

  function resolveBossArtist(nameOrId) {
    const key = String(nameOrId || "").toLowerCase().trim();
    if (!key) return null;

    // Prefer id match (stable), then fallback to name match
    return (
      ARTISTS.find(x => String(x.id).toLowerCase().trim() === key) ||
      ARTISTS.find(x => String(x.name).toLowerCase().trim() === key) ||
      null
    );
  }

  function spawnBossForLevel(level) {
    const lvl = clamp(parseInt(level, 10) || 10, 10, 50);
    const def = ARCADE_BOSSES[lvl];
    const bossName = def?.name || "Boss";

    const artist = resolveBossArtist(def?.id || bossName);
    const decorUrl = def?.decorUrl || null;
    let decorImg = decorUrl ? decorCache.get(decorUrl) : null;
    if (decorUrl && decorImg === undefined) {
      decorCache.set(decorUrl, null);
      loadImage(decorUrl).then(img => {
        decorCache.set(decorUrl, img);
        // If the boss is still alive and uses the same decorUrl, hot-swap the image in
        if (state.boss && state.boss.decorUrl === decorUrl && !state.boss.decorImg) {
          state.boss.decorImg = img;
        }
      });
      decorImg = null;
    }

    // Boss PFP (prefer artist's preloaded img, but lazy-load if needed)
    const pfpUrl = artist?.pfpUrl || null;
    let pfpImg = artist?.pfpImg || (pfpUrl ? bossPfpCache.get(pfpUrl) : null);

    if (pfpUrl && pfpImg === undefined) {
      bossPfpCache.set(pfpUrl, null);
      loadImage(pfpUrl).then(img => {
        bossPfpCache.set(pfpUrl, img);
        // If the boss is still alive and is the same artist, hot-swap the image in
        if (state.boss && state.boss.artistName === bossName && !state.boss.pfpImg) {
          state.boss.pfpImg = img;
        }
      });
      pfpImg = null;
    }

    const w = canvas.width;
    const h = canvas.height;

    const r = 86;
    const minY = SAFE_TOP_UI_BAR + r + 14;
    const maxY = h - SAFE_BOTTOM_PAD - r - 14;

    const hp = arcadeBossHp(lvl);

    const now = performance.now();

    state.boss = {
      x: w - (r + 110),
      y: (minY + maxY) / 2,
      r,

      // Movement: "scripted but unpredictable"
      moveTargetY: (minY + maxY) / 2,
      moveHoldUntil: 0,
      moveNextPickAt: now + rand(450, 900),
      moveSpeed: 190, // updated per-level in updateBoss

      // Core stats
      hp,
      maxHp: hp,

      artistName: bossName,
      pfpImg,
      decorUrl,
      decorImg,
      decorScale: artist?.decorScale ?? 1.0,
      decorOffset: artist?.decorOffset ?? [0, 0],

      // Bullet phases
      phaseType: "",
      nextShotAt: 0,
      phaseUntil: 0,

      // Level gimmicks
      nextLaserAt: now + 2400,
      nextMissileAt: now + 2200,
      nextZapAt: now + 2600,

      laser: null,     // { x0, x1, chargeUntil, fireUntil, hit: false }
      zap: null,       // { beams:[{x0,x1}], chargeUntil, fireUntil, hitSet:Set }
      missiles: [],    // { x,y,vx,vy,ttl,armUntil,homing:true }
    };

    // Boss levels should not allow capture.
    state.captureCharges = 0;
    refreshCaptureButton();
  }

  const BOSS_PHASES = {
    // Basic (Level 10): gentle patterns
    10: [
      { type: "petal", w: 26 },
      { type: "fan", w: 26 },
      { type: "sweep", w: 22 },
      { type: "grid", w: 26 }
    ],
    20: [
      { type: "doubleFan", w: 28 },
      { type: "ring", w: 24 },
      { type: "sweep", w: 24 },
      { type: "aimBurst", w: 24 }
    ],
    30: [
      { type: "doubleFan", w: 26 },
      { type: "ring", w: 26 },
      { type: "spiral", w: 26 },
      { type: "petal", w: 22 }
    ],
    40: [
      { type: "ring", w: 35 },
      { type: "spiral", w: 35 },
      { type: "aimBurst", w: 30 },
    ],
    50: [
      { type: "spiral", w: 35 },
      { type: "aimBurst", w: 35 },
      { type: "ring", w: 30 },
    ],
  };

  function pickBossPhase(level) {
    const phases = BOSS_PHASES[level] || BOSS_PHASES[10];
    const total = phases.reduce((a, p) => a + p.w, 0);
    let r = Math.random() * total;
    for (const p of phases) {
      r -= p.w;
      if (r <= 0) return p.type;
    }
    return phases[0].type;
  }

  function bossShootBullet(x, y, vx, vy, r = 7, ttl = 7000) {
    state.enemyBullets.push({ x, y, vx, vy, r, ttl, team: "enemy", boss: true });
  }


  // Boss "whole life" damage (used by lasers). In Arcade, this should cost 1 life instantly.
  function bossDealLifeDamage() {
    const now = performance.now();
    if (now < (state.invulnUntil || 0)) return;

    // Shield does NOT block "whole life" boss damage (laser/zap).
    // If shield is up, we still pop it (extra punishment), but we ALSO take a life.
    if ((state.shieldHp || 0) > 0) {
      state.shieldHp = 0;
      playSfx(sfxPlayerHit);
      // IMPORTANT: no return — continue to life loss below
    }

    state.lives = Math.max(0, (state.lives || 0) - 1);
    state.playerHp = PLAYER_MAX_HP;
    state.invulnUntil = now + 900;

    burst(state.player.x, state.player.y, "rgba(255,106,136,.85)");
    addShake(16);
    addFlash(0.28, "rgba(255,106,136,1)");
    playSfx(sfxPlayerHit);

    if (state.lives <= 0) {
      gameOver();
    }
  }

  function bossPickScriptedTargetY(b, minY, maxY) {
    const mid = (minY + maxY) / 2;
    const py = state.player?.y ?? mid;

    // Pick one of a few "anchor zones" so the motion feels intentional, not random jitter.
    // 0: top band, 1: mid band, 2: bottom band, 3: pressure player band
    const roll = Math.random();
    let zone = 1;
    if (roll < 0.22) zone = 0;
    else if (roll < 0.44) zone = 2;
    else if (roll < 0.72) zone = 1;
    else zone = 3;

    let y;
    if (zone === 0) y = rand(minY, minY + (maxY - minY) * 0.22);
    else if (zone === 2) y = rand(maxY - (maxY - minY) * 0.22, maxY);
    else if (zone === 1) y = rand(mid - (maxY - minY) * 0.12, mid + (maxY - minY) * 0.12);
    else y = clamp(py + rand(-90, 90), minY, maxY);

    return clamp(y, minY, maxY);
  }

  function bossSpawnMissile(b, now) {
    const originX = b.x - b.r - 6;
    const originY = b.y + rand(-16, 16);
    state.boss.missiles.push({
      x: originX,
      y: originY,
      vx: -220,
      vy: 0,
      ttl: 6800,
      armUntil: now + 450,
    });
  }

  function bossExplodeMissile(m) {
    const lvl = state.arcadeLevel || 40;
    const diff = Math.floor((lvl - 10) / 10); // 0..4
    const n = 10 + diff * 2;
    const sp = 260 + diff * 40;

    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2;
      bossShootBullet(m.x, m.y, Math.cos(ang) * sp, Math.sin(ang) * sp, 6, 5200);
    }

    // juicy pop
    burst(m.x, m.y, "rgba(122,166,255,.85)");
    addShake(8);
    addFlash(0.12, "rgba(122,166,255,1)");
    burst(m.x, m.y, "rgba(122,166,255,.85)");
    playSfx(sfxEnemyHit);
  }

  function bossMaybeStartLaser(b, now) {
    const w = canvas.width;
    const h = canvas.height;

    // Horizontal lane (boss -> player), ~1/10th of screen height
    const laneH = Math.max(26, h * 0.10);

    // Anchor the laser to the boss (so it always looks like it's emitted from the boss)
    const bossY = (b.y ?? (SAFE_TOP_UI_BAR + (h - SAFE_TOP_UI_BAR - SAFE_BOTTOM_PAD) * 0.5));

    // Small "intentional" wobble so it isn't perfectly static, but still snapped to boss
    const cy0 = clamp(
      bossY + rand(-h * 0.03, h * 0.03),
      SAFE_TOP_UI_BAR + laneH * 0.55,
      (h - SAFE_BOTTOM_PAD) - laneH * 0.55
    );

    // Slightly longer charge makes the buildup feel intentional
    const chargeMs = 1050;
    const fireMs = 680;

    b.laser = {
      // Dynamic fields (updated every frame while active)
      y0: cy0 - laneH / 2,
      y1: cy0 + laneH / 2,
      xEnd: 0,

      // Static config
      laneH,
      dy: 0, // IMPORTANT: keep it locked to the boss (no offset aiming)
      chargeUntil: now + chargeMs,
      fireUntil: now + chargeMs + fireMs,
      hit: false,
    };
  }

  function bossMaybeStartZap(b, now) {
    const w = canvas.width;
    const h = canvas.height;

    // "Zap cannon" for lvl 50:
    // Spawn 2 medium energy orbs (above/below boss) that FOLLOW the boss briefly,
    // then FREEZE, then fire a thin horizontal beam very quickly (no pre-shot beam).
    const br = (b.r ?? 58);
    const xOff = -br * 0.62;

    const orbR = clamp(br * 0.26, 12, 22);
    const yMagMin = br * 0.65;
    const yMagMax = br * 1.35;

    const followMs = rand(500, 2000);          // 0.5s .. 2.0s "snap/follow" phase
    const freezeAt = now + followMs;
    const fireDelay = rand(90, 220);           // quick & mean after freeze
    const fireMs = 260;                         // short blast

    const makeEmitter = (sign) => {
      const yOff = sign * rand(yMagMin, yMagMax);
      const x = (b.x ?? w * 0.86) + xOff;
      const y = clamp(
        (b.y ?? (SAFE_TOP_UI_BAR + (h - SAFE_TOP_UI_BAR - SAFE_BOTTOM_PAD) * 0.5)) + yOff,
        SAFE_TOP_UI_BAR + orbR + 6,
        (h - SAFE_BOTTOM_PAD) - orbR - 6
      );
      return {
        x, y,
        xOff,

        // Base offset from the boss, plus a drifting offset while we "follow"
        baseYOff: yOff,
        driftY: 0,
        // Top orb moves UP, bottom orb moves DOWN (relative to the boss),
        // while still staying synced to the boss position.
        driftVy: sign * rand(70, 150), // px/sec (sign is -1 for top, +1 for bottom)

        orbR,
        freezeAt,
        frozen: false,
        fireAt: freezeAt + fireDelay,
        fireMs,
        hit: false,
        _blastFx: false,
      };
    };

    b.zap = {
      emitters: [makeEmitter(-1), makeEmitter(+1)],
      _endAt: 0,
    };

    b.zap._endAt = Math.max(...b.zap.emitters.map(e => e.fireAt + e.fireMs));
  }


  function updateBossWeapons(dt, now) {
    const b = state.boss;
    if (!b) return;
    const lvl = state.arcadeLevel || 10;

    // --- Big Laser (lvl 30+)
    if (lvl >= 30) {
      if (!b.laser && !b.zap && now >= (b.nextLaserAt || 0)) {
        bossMaybeStartLaser(b, now);
        b.nextLaserAt = now + (lvl >= 50 ? rand(5200, 6600) : rand(6000, 7600));
      }

      if (b.laser) {
        const L = b.laser;
        const w = canvas.width;
        const h = canvas.height;

        // Keep the lane "attached" to the boss while charging/firing.
        // We do this by using the stored dy (lane center offset from boss at cast time).
        const laneH = L.laneH || Math.max(26, h * 0.10);
        const bossY = (b.y ?? (SAFE_TOP_UI_BAR + (h - SAFE_TOP_UI_BAR - SAFE_BOTTOM_PAD) * 0.5));
        const bossX = (b.x ?? w * 0.86);
        const bossR = (b.r ?? 58);

        const cy = clamp(
          bossY + (L.dy || 0),
          SAFE_TOP_UI_BAR + laneH * 0.55,
          (h - SAFE_BOTTOM_PAD) - laneH * 0.55
        );

        L.y0 = cy - laneH / 2;
        L.y1 = cy + laneH / 2;

        // Attach beam end near the boss (and follow boss X too, just in case).
        L.xEnd = clamp(bossX - bossR + 3, 60, w - 60); // overlap slightly into boss so no visual gap
// Fire moment juice (one-shot)
        if (!L._fired && now >= L.chargeUntil) {
          L._fired = true;
          addShake(lvl >= 50 ? 14 : 11);
          addFlash(0.22, "rgba(122,166,255,1)");
        }

        // Collision during fire window (horizontal lane)
        if (now >= L.chargeUntil && now <= L.fireUntil) {
          const py = state.player.y;
          const pr = state.player.r;
          const inLane = (py + pr) >= L.y0 && (py - pr) <= L.y1;
          if (inLane && !L.hit) {
            L.hit = true;
            bossDealLifeDamage();
          }
        }
        if (now > L.fireUntil) b.laser = null;
      }
    } else {
      b.laser = null;
    }

    // --- Missiles (lvl 40+)
    if (lvl >= 40) {
      if (now >= (b.nextMissileAt || 0)) {
        bossSpawnMissile(b, now);
        b.nextMissileAt = now + rand(2600, 3600);
      }

      for (let i = b.missiles.length - 1; i >= 0; i--) {
        const m = b.missiles[i];
        m.ttl -= dt * 1000;
        if (m.ttl <= 0) {
          bossExplodeMissile(m);
          b.missiles.splice(i, 1);
          continue;
        }

        // homing steer
        const tx = state.player.x;
        const ty = state.player.y;
        const dx = tx - m.x;
        const dy = ty - m.y;
        const dist = Math.max(1, Math.hypot(dx, dy));

        const desiredVx = (dx / dist) * 320;
        const desiredVy = (dy / dist) * 320;

        const turn = 0.08; // max steer per frame
        m.vx += clamp(desiredVx - m.vx, -80, 80) * turn;
        m.vy += clamp(desiredVy - m.vy, -80, 80) * turn;

        // keep it generally moving left-ish so it doesn't orbit forever
        m.vx = Math.min(m.vx, -90);

        m.x += m.vx * dt;
        m.y += m.vy * dt;

        // explode near player, but not "touch damage"
        if (now >= m.armUntil && dist <= 70) {
          bossExplodeMissile(m);
          b.missiles.splice(i, 1);
        }
      }
    } else {
      b.missiles.length = 0;
    }

    // --- Zap Cannon (lvl 50 only)
    if (lvl >= 50) {
      // Don't stack zap on top of the big laser (prevents the "spawn at same time" chaos)
      if (!b.zap && !b.laser && now >= (b.nextZapAt || 0)) {
        bossMaybeStartZap(b, now);
        b.nextZapAt = now + rand(2600, 3400);
      }

      if (b.zap) {
        const Z = b.zap;
        let allDone = true;

        for (const e of Z.emitters) {
          // Follow boss until freeze, then lock position
          if (now < e.freezeAt) {
            // While following, drift away from the boss (top orb drifts up, bottom drifts down),
            // but remain anchored to the boss's position.
            const h = canvas.height;
            e.driftY = (e.driftY || 0) + (e.driftVy || 0) * dt;

            // Keep drift in a sane range so it doesn't fly off-screen.
            const driftCap = (b.r ?? 58) * 0.95;
            e.driftY = clamp(e.driftY, -driftCap, driftCap);

            const yOff = (e.baseYOff ?? e.yOff ?? 0) + e.driftY;
            e.yOff = yOff;

            e.x = (b.x ?? e.x) + e.xOff;
            e.y = clamp(
              (b.y ?? e.y) + yOff,
              SAFE_TOP_UI_BAR + e.orbR + 6,
              (h - SAFE_BOTTOM_PAD) - e.orbR - 6
            );

            allDone = false;
          } else if (!e.frozen) {
            e.frozen = true;
            // freeze at current x/y
            e.x = e.x;
            e.y = e.y;
          }

          const firing = now >= e.fireAt && now <= (e.fireAt + e.fireMs);

          // One-time "blast" impact FX (no warning beam)
          if (firing && !e._blastFx) {
            e._blastFx = true;
            addShake(7);
            addFlash(0.11, "rgba(255,238,110,1)");
          }

          // Collision while firing: thin horizontal lane from left edge to orb
          if (firing) {
            allDone = false;

            const laneH = 10;
            const py = state.player.y;
            const px = state.player.x;
            const pr = state.player.r;

            // Player circle vs rectangle [0..e.x] x [e.y-laneH/2 .. e.y+laneH/2]
            const inY = (py + pr) >= (e.y - laneH / 2) && (py - pr) <= (e.y + laneH / 2);
            const inX = (px + pr) >= 0 && (px - pr) <= e.x;

            if (inX && inY && !e.hit) {
              e.hit = true;
              bossDealLifeDamage();
            }
          } else {
            // not currently firing
            if (now <= (e.fireAt + e.fireMs)) allDone = false;
          }
        }

        if (allDone && now > (Z._endAt || 0)) b.zap = null;
      }
    } else {
      b.zap = null;
    }
  }

  function drawBossWeapons(now) {
    const b = state.boss;
    if (!b) return;

    const w = canvas.width;
    const h = canvas.height;

    
// Big laser telegraph + beam (horizontal boss->player)
    if (b.laser) {
      const L = b.laser;
      const chargeMs = 1050;
      const fireMs = 680;
      const charge = clamp(1 - ((L.chargeUntil - now) / chargeMs), 0, 1);
      const firing = now >= L.chargeUntil && now <= L.fireUntil;

      const laneH = (L.y1 - L.y0);
      const cx = L.xEnd;
      const cy = (L.y0 + L.y1) * 0.5;

      ctx.save();

      if (!firing) {
        // Telegraph: lane across from left edge to the boss, with spicy scanlines
        const a = 0.14 + 0.28 * charge;
        ctx.globalAlpha = a;
        ctx.fillStyle = "rgba(122,166,255,0.9)";
        ctx.fillRect(0, L.y0, cx, laneH);

        // Animated diagonal stripes (build-up)
        ctx.globalAlpha = 0.10 + 0.18 * charge;
        ctx.strokeStyle = "rgba(233,240,255,0.85)";
        ctx.lineWidth = 1;
        const stripeStep = 18;
        const stripeLen = 22;
        const phase = (now * 0.06) % stripeStep;
        for (let x = -stripeStep + phase; x < cx + stripeStep; x += stripeStep) {
          ctx.beginPath();
          ctx.moveTo(x, L.y0);
          ctx.lineTo(x + stripeLen, L.y0 + stripeLen);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, L.y1);
          ctx.lineTo(x + stripeLen, L.y1 - stripeLen);
          ctx.stroke();
        }

        // Edge rails
        ctx.globalAlpha = 0.22 + 0.35 * charge;
        ctx.strokeStyle = "rgba(233,240,255,0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, L.y0);
        ctx.lineTo(cx, L.y0);
        ctx.moveTo(0, L.y1);
        ctx.lineTo(cx, L.y1);
        ctx.stroke();

        // "Sightline" from boss to the lane (feels intentional)
        ctx.globalAlpha = 0.12 + 0.26 * charge;
        ctx.strokeStyle = "rgba(114,247,210,0.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 180, cy + Math.sin(now * 0.01) * 8);
        ctx.stroke();

      } else {
        // Beam: brighter center with soft glow (juiced)
        const t = clamp(1 - ((L.fireUntil - now) / fireMs), 0, 1);
        const flicker = 0.86 + 0.22 * Math.sin(now * 0.03) + 0.08 * Math.sin(now * 0.19);

        ctx.globalCompositeOperation = "lighter";

        // Considerably stronger glow close to the boss (origin feel)
        ctx.save();
        ctx.globalAlpha = (0.24 + 0.22 * (1 - t)) * flicker;
        ctx.shadowColor = "rgba(122,166,255,0.9)";
        ctx.shadowBlur = 30;
        const og = ctx.createLinearGradient(cx, 0, 0, 0);
        og.addColorStop(0, "rgba(122,166,255,0.95)");
        og.addColorStop(0.35, "rgba(122,166,255,0.55)");
        og.addColorStop(1, "rgba(122,166,255,0)");
        ctx.fillStyle = og;
        ctx.fillRect(0, L.y0 - 16, cx, laneH + 32);
        ctx.restore();

        // Core beam gradient (vertical)
        ctx.globalAlpha = 0.80 * flicker;
        const cg = ctx.createLinearGradient(0, L.y0, 0, L.y1);
        cg.addColorStop(0, "rgba(233,240,255,0.75)");
        cg.addColorStop(0.45, "rgba(255,255,255,0.98)");
        cg.addColorStop(0.55, "rgba(255,255,255,0.98)");
        cg.addColorStop(1, "rgba(233,240,255,0.75)");
        ctx.fillStyle = cg;
        ctx.fillRect(0, L.y0, cx, laneH);

        // Inner mint shimmer strip
        ctx.globalAlpha = 0.26 * flicker;
        ctx.fillStyle = "rgba(114,247,210,0.85)";
        ctx.fillRect(0, cy - Math.max(4, laneH * 0.10), cx, Math.max(6, laneH * 0.18));

        // Electric edge dashes (top/bottom)
        ctx.globalAlpha = 0.24;
        ctx.strokeStyle = "rgba(233,240,255,0.8)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 18; i++) {
          const xx = (i / 18) * cx;
          const jitter = Math.sin(now * 0.02 + i * 1.7) * 6;
          ctx.beginPath();
          ctx.moveTo(xx, L.y0 + jitter);
          ctx.lineTo(xx + 10, L.y0 + jitter + 10);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(xx, L.y1 - jitter);
          ctx.lineTo(xx + 10, L.y1 - jitter - 10);
          ctx.stroke();
        }

        ctx.globalCompositeOperation = "source-over";
      }

      // Muzzle flare at the boss edge (helps sell that the boss is emitting the beam)
      {
        const p = firing ? 1 : charge;
        const mx = cx;
        const my = cy;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        // Soft bloom
        ctx.globalAlpha = firing ? (0.62 + 0.16 * Math.sin(now * 0.04)) : (0.10 + 0.26 * charge);
        ctx.shadowColor = "rgba(122,166,255,1)";
        ctx.shadowBlur = firing ? 30 : 18;

        const rg = ctx.createRadialGradient(mx, my, 0, mx, my, 46);
        rg.addColorStop(0, "rgba(255,255,255,0.95)");
        rg.addColorStop(0.35, "rgba(122,166,255,0.70)");
        rg.addColorStop(1, "rgba(122,166,255,0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(mx, my, 16 + 18 * p, 0, Math.PI * 2);
        ctx.fill();

        // Short "cone" pointing into the beam (to fill any micro-gap)
        ctx.globalAlpha = firing ? 0.40 : (0.08 + 0.20 * charge);
        const cg2 = ctx.createLinearGradient(mx, 0, mx - 48, 0);
        cg2.addColorStop(0, "rgba(255,255,255,0.85)");
        cg2.addColorStop(1, "rgba(122,166,255,0)");
        ctx.fillStyle = cg2;
        ctx.fillRect(mx - 48, my - (laneH * 0.26), 48, laneH * 0.52);

        ctx.restore();
      }

      ctx.restore();
    }
// Zap cannon (lvl 50): 2 energy orbs that freeze, then fire thin beams (no pre-shot beam)
    if (b.zap) {
      const Z = b.zap;

      ctx.save();
      for (const e of Z.emitters) {
        // Orb indicator (this is the "warning" - NOT a pre-shot beam)
        const pulse = 0.5 + 0.5 * Math.sin(now * 0.008 + (e.yOff || 0) * 0.01);
        const r = (e.orbR || 16) * (0.92 + 0.12 * pulse);

        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        // Outer glow
        ctx.globalAlpha = 0.52;
        ctx.shadowColor = "rgba(255,238,110,0.85)";
        ctx.shadowBlur = 18;
        const gg = ctx.createRadialGradient(e.x, e.y, 1, e.x, e.y, r * 2.2);
        gg.addColorStop(0, "rgba(255,255,255,0.95)");
        gg.addColorStop(0.22, "rgba(255,238,110,0.80)");
        gg.addColorStop(1, "rgba(255,238,110,0)");
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = "rgba(255,238,110,0.96)";
        ctx.beginPath();
        ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Specular highlight
        ctx.globalAlpha = 0.50;
        ctx.fillStyle = "rgba(255,255,255,0.70)";
        ctx.beginPath();
        ctx.arc(e.x - r * 0.26, e.y - r * 0.26, r * 0.34, 0, Math.PI * 2);
        ctx.fill();

        // Beam (very quick, no telegraph)
        const firing = now >= e.fireAt && now <= (e.fireAt + e.fireMs);
        if (firing) {
          const laneH = 10;
          const t = clamp(1 - ((e.fireAt + e.fireMs - now) / e.fireMs), 0, 1);
          const flicker = 0.88 + 0.18 * Math.sin(now * 0.05) + 0.06 * Math.sin(now * 0.19);

          ctx.globalCompositeOperation = "lighter";

          // Glow slab
          ctx.save();
          ctx.globalAlpha = (0.22 + 0.18 * (1 - t)) * flicker;
          ctx.shadowColor = "rgba(255,238,110,0.95)";
          ctx.shadowBlur = 26;
          const lg = ctx.createLinearGradient(e.x, 0, 0, 0);
          lg.addColorStop(0, "rgba(255,238,110,0.90)");
          lg.addColorStop(0.55, "rgba(255,238,110,0.25)");
          lg.addColorStop(1, "rgba(255,238,110,0)");
          ctx.fillStyle = lg;
          ctx.fillRect(0, e.y - laneH / 2 - 14, e.x, laneH + 28);
          ctx.restore();

          // Core
          ctx.globalAlpha = 0.72 * flicker;
          const cg = ctx.createLinearGradient(0, e.y - laneH / 2, 0, e.y + laneH / 2);
          cg.addColorStop(0, "rgba(255,255,255,0.55)");
          cg.addColorStop(0.5, "rgba(255,255,255,0.98)");
          cg.addColorStop(1, "rgba(255,255,255,0.55)");
          ctx.fillStyle = cg;
          ctx.fillRect(0, e.y - laneH / 2, e.x, laneH);
        }

        ctx.restore();
      }
      ctx.restore();
    }

        // --- Missiles (lvl 40+): draw them (they exist + update, but can be invisible if not rendered)
        if (b.missiles && b.missiles.length) {
          ctx.save();
          ctx.globalCompositeOperation = "lighter";

          for (const m of b.missiles) {
            // Direction for nose + trail
            const sp = Math.max(1, Math.hypot(m.vx || 0, m.vy || 0));
            const nx = (m.vx || -1) / sp;
            const ny = (m.vy || 0) / sp;

            // Trail
            ctx.save();
            ctx.globalAlpha = 0.28;
            ctx.strokeStyle = "rgba(122,166,255,0.85)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - nx * 26, m.y - ny * 26);
            ctx.stroke();
            ctx.restore();

            // Glow puff
            drawGlowCircle(m.x, m.y, 22, "rgba(122,166,255,.28)", "rgba(0,0,0,0)");

            // Body
            ctx.save();
            ctx.globalAlpha = 0.92;
            ctx.fillStyle = "rgba(233,240,255,0.92)";
            ctx.beginPath();
            ctx.arc(m.x, m.y, 6.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

          // Nose triangle (points toward velocity)
          const tipX = m.x + nx * 10;
          const tipY = m.y + ny * 10;
          const sideX = -ny;
          const sideY = nx;

          ctx.save();
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = "rgba(114,247,210,0.9)";
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(m.x - nx * 6 + sideX * 4.8, m.y - ny * 6 + sideY * 4.8);
          ctx.lineTo(m.x - nx * 6 - sideX * 4.8, m.y - ny * 6 - sideY * 4.8);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }

  }

  function bossFirePattern(boss, now) {
    const lvl = state.arcadeLevel || 10;
    const diff = Math.floor((lvl - 10) / 10); // 0..4
    const baseSpd = 320 + diff * 60;
    const baseCd = 220 + Math.max(0, 60 - diff * 10);

    const px = state.player.x;
    const py = state.player.y;
    const dx = px - boss.x;
    const dy = py - boss.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / len;
    const uy = dy / len;

    const originX = boss.x - boss.r - 8;
    const originY = boss.y;

    switch (boss.phaseType) {
      case "fan": {
        const n = 5 + diff;
        const spread = 0.34 + diff * 0.04;
        for (let i = 0; i < n; i++) {
          const t = (i - (n - 1) / 2) / ((n - 1) / 2);
          const ang = Math.atan2(uy, ux) + t * spread;
          bossShootBullet(originX, originY, Math.cos(ang) * baseSpd, Math.sin(ang) * baseSpd, 7, 6200);
        }
        boss.nextShotAt = now + baseCd;
        break;
      }
      case "doubleFan": {
        // Two layered fans: slow wide + fast tight (looks intentional, not messy)
        const n1 = 6 + diff;
        const n2 = 3 + Math.floor(diff / 2);
        const spread1 = 0.55;
        const spread2 = 0.22;

        for (let i = 0; i < n1; i++) {
          const t = (i - (n1 - 1) / 2) / ((n1 - 1) / 2);
          const ang = Math.atan2(uy, ux) + t * spread1;
          bossShootBullet(originX, originY, Math.cos(ang) * (baseSpd - 40), Math.sin(ang) * (baseSpd - 40), 7, 6800);
        }
        for (let i = 0; i < n2; i++) {
          const t = (i - (n2 - 1) / 2) / ((n2 - 1) / 2 || 1);
          const ang = Math.atan2(uy, ux) + t * spread2;
          bossShootBullet(originX, originY, Math.cos(ang) * (baseSpd + 170), Math.sin(ang) * (baseSpd + 170), 6, 6500);
        }

        boss.nextShotAt = now + (540 - diff * 40);
        break;
      }
      case "petal": {
        // Smooth, pretty "petals" that curve (fixes the old ugly squaricle vibe)
        boss._petalT = (boss._petalT || 0) + 1;
        const n = 8 + diff; // petals
        const wob = 0.45 + diff * 0.06;

        for (let i = 0; i < n; i++) {
          const t = (i / (n - 1)) * 2 - 1; // -1..1
          const ang = Math.PI + t * 0.85 + Math.sin((boss._petalT * 0.22) + i) * wob * 0.12;
          const sp = baseSpd + 40 + Math.sin((boss._petalT * 0.18) + i) * 70;
          bossShootBullet(originX, originY, Math.cos(ang) * sp, Math.sin(ang) * sp, 6, 7200);
        }

        boss.nextShotAt = now + (620 - diff * 40);
        break;
      }
      case "sweep": {
        // Aiming sweep that "tracks" over time but stays dodgeable
        boss._sweepA = (boss._sweepA || Math.atan2(uy, ux)) * 0.85 + Math.atan2(uy, ux) * 0.15;
        boss._sweepDir = (boss._sweepDir || 1);

        // bounce sweep direction every ~1s
        if (!boss._sweepFlipAt || now >= boss._sweepFlipAt) {
          boss._sweepDir *= (chance(0.55) ? -1 : 1);
          boss._sweepFlipAt = now + rand(650, 1100);
        }

        boss._sweepA += boss._sweepDir * (0.14 + diff * 0.02);

        const n = 3 + Math.floor(diff / 2);
        for (let i = 0; i < n; i++) {
          const ang = boss._sweepA + (i - (n - 1) / 2) * 0.07;
          bossShootBullet(originX, originY, Math.cos(ang) * (baseSpd + 120), Math.sin(ang) * (baseSpd + 120), 6, 7000);
        }

        boss.nextShotAt = now + (220 - diff * 12);
        break;
      }
      case "aim": {
        // single fast aimed shot
        bossShootBullet(originX, originY, ux * (baseSpd + 140), uy * (baseSpd + 140), 8, 7000);
        boss.nextShotAt = now + (520 - diff * 40);
        break;
      }
      case "aimBurst": {
        // 3-shot burst
        const n = 3;
        for (let i = 0; i < n; i++) {
          const jitter = rand(-0.12, 0.12);
          const ang = Math.atan2(uy, ux) + jitter;
          bossShootBullet(originX, originY, Math.cos(ang) * (baseSpd + 120), Math.sin(ang) * (baseSpd + 120), 7, 6800);
        }
        boss.nextShotAt = now + (430 - diff * 30);
        break;
      }
      case "rain": {
        // vertical curtain drifting left
        const n = 8 + diff * 2;
        const top = SAFE_TOP_UI_BAR + 30;
        const bottom = canvas.height - SAFE_BOTTOM_PAD - 30;
        for (let i = 0; i < n; i++) {
          const yy = top + (i / (n - 1)) * (bottom - top);
          bossShootBullet(originX, yy, -(baseSpd + 60), 0, 6, 6200);
        }
        boss.nextShotAt = now + (720 - diff * 60);
        break;
      }

case "grid": {
  // "Lattice" volley: boxy-looking pattern that STILL originates from the boss (no more bullets spawning from thin air)
  const rows = 6 + diff * 2;
  const span = 150 + diff * 18;
  const vx = -(baseSpd + 110);
  const aimAng = Math.atan2(uy, ux);

  for (let i = 0; i < rows; i++) {
    const t = (i / (rows - 1)) * 2 - 1; // -1..1
    const oy = t * span * 0.5;

    // Straight "grid" shot
    bossShootBullet(originX, originY + oy, vx, 0, 6, 6900);

    // Corner-stitch: slight angle toward player so it doesn't just whiff on small canvases
    const ang = aimAng + t * 0.18;
    const sp = baseSpd + 40;
    bossShootBullet(originX, originY + oy * 0.75, Math.cos(ang) * sp, Math.sin(ang) * sp, 6, 6900);
  }

  // A little center punch to keep it honest
  bossShootBullet(originX, originY, ux * (baseSpd + 170), uy * (baseSpd + 170), 7, 6600);

  boss.nextShotAt = now + (860 - diff * 70);
  break;
}
      
case "ring": {
  // Outward ring, but FORCE leftward travel so bullets don't "orbit" near the boss
  const n = 12 + diff * 2;

  // Center the arc around PI (left), and keep angles away from near-vertical
  const a0 = Math.PI - 0.92;
  const a1 = Math.PI + 0.92;

  for (let i = 0; i < n; i++) {
    const ang = a0 + (i / (n - 1)) * (a1 - a0);
    // Normalize, then bias left to guarantee reach
    let vx = Math.cos(ang);
    let vy = Math.sin(ang);
    const L = Math.max(1e-6, Math.hypot(vx, vy));
    vx /= L; vy /= L;

    // Left bias so even steep shots still move meaningfully left
    vx = Math.min(vx - 0.35, -0.25);

    const L2 = Math.max(1e-6, Math.hypot(vx, vy));
    vx /= L2; vy /= L2;

    const sp = baseSpd + 10;
    bossShootBullet(boss.x, boss.y, vx * sp, vy * sp, 6, 7200);
  }

  boss.nextShotAt = now + (880 - diff * 70);
  break;
}
      case "spiral": {
        // continuous spiral stream
        boss._spiralA = (boss._spiralA || 0) + 0.28 + diff * 0.04;
        const ang = Math.PI + Math.sin(boss._spiralA) * 1.1; // left-ish wobble
        bossShootBullet(boss.x, boss.y, Math.cos(ang) * baseSpd, Math.sin(ang) * baseSpd, 6, 7000);
        boss.nextShotAt = now + (180 - diff * 15);
        break;
      }
      default:
        boss.phaseType = "fan";
        boss.nextShotAt = now + 120;
        break;
    }
  }

  function updateBoss(dt, now) {
    if (!state.boss) return;

    const b = state.boss;
    const lvl = state.arcadeLevel || 10;
    const diff = Math.floor((lvl - 10) / 10); // 0..4

    const h = canvas.height;
    const minY = SAFE_TOP_UI_BAR + b.r + 14;
    const maxY = h - SAFE_BOTTOM_PAD - b.r - 14;

    
// --- Scripted, intentional movement (no more predictable ping-pong)
// Use velocity + damping so target changes feel *smooth* (no snapping on "focus" holds)
b.moveSpeed = 210 + diff * 45; // snappier on later bosses
b.vy = b.vy || 0;

// Pick a new target periodically (and hold briefly on arrival)
if (now >= (b.moveNextPickAt || 0) && now >= (b.moveHoldUntil || 0)) {
  b.moveTargetY = bossPickScriptedTargetY(b, minY, maxY);
  b.moveNextPickAt = now + rand(800, 1500) - diff * 90; // later bosses reposition more often
  b._moveArriveHold = rand(260, 700) + diff * 40;
}

const dy = (b.moveTargetY ?? b.y) - b.y;

// Arrive check
const arrived = Math.abs(dy) < 6 && Math.abs(b.vy) < 28;

if (arrived) {
  if (now >= (b.moveHoldUntil || 0)) {
    b.moveHoldUntil = now + (b._moveArriveHold || 420);
  }

  // subtle breathing drift while holding
  b._holdWob = (b._holdWob || 0) + dt * (1.35 + diff * 0.22);
  const drift = Math.sin(b._holdWob) * (0.42 + diff * 0.10);
  b.y = clamp(b.y + drift, minY, maxY);
  // bleed off any remaining velocity
  b.vy *= Math.pow(0.15, dt);
} else if (now < (b.moveHoldUntil || 0)) {
  // still holding; ignore target drift
  b.vy *= Math.pow(0.25, dt);
} else {
  // critically-damped-ish pursuit toward target
  const k = 7.0 + diff * 0.6;      // position gain
  const damp = 4.8 + diff * 0.35;  // velocity damping
  const accel = dy * k - b.vy * damp;

  b.vy += accel * dt * 60; // scale to feel consistent across frame rates
  b.vy = clamp(b.vy, -b.moveSpeed, b.moveSpeed);

  b.y = clamp(b.y + b.vy * dt, minY, maxY);
}

    // --- Choose weighted random bullet phase periodically
    if (!b.phaseType || now >= (b.phaseUntil || 0)) {
      b.phaseType = pickBossPhase(lvl);
      b.phaseUntil = now + rand(3200, 5200);
      b.nextShotAt = now + 240;
    }

    // --- Level gimmicks (laser / missiles / zap)
    updateBossWeapons(dt, now);

    // --- Fire bullets
    if (now >= (b.nextShotAt || 0)) {
      bossFirePattern(b, now);
    }
  }

  // ----------------------------
  // ENTITIES
  // ----------------------------
  function spawnEnemy() {
    const w = canvas.width;
    const h = canvas.height;

    const useHeat =
      (IS_MOBILE && state.gameMode === "survival")
        ? Math.min(state.heat, 0.5)
        : state.heat;

    const base = DIFF.enemySpeedMin + (DIFF.enemySpeedMax - DIFF.enemySpeedMin) * useHeat;
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
    let flankerChance = clamp(0.18 + (state.wave - 7) * 0.02, 0.18, 0.30);

    // Arcade late-endgame: stop the "top AND bottom at once" opening pile-up
    if (state.gameMode === "arcade") {
      const lvl = state.arcadeLevel || state.wave || 1;
      if (lvl >= 45 && lvl <= 49) flankerChance = 0.12;
    }

    if (state.wave >= 7 && chance(flankerChance)) {
      // flanker: prefer the opposite side of the player's position
      const side = (playerY < (minY + maxY) / 2) ? "bottom" : "top";
      if (side === "top") y = rand(minY, minY + 80);
      else y = rand(maxY - 80, maxY);
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

    // Arcade normal levels use fixed HP tiers (1 / 2 / 3 / 4) instead of wave-based distribution.
    if (state.gameMode === "arcade" && !state.arcadeIsBoss) {
      const lvl = state.arcadeLevel || 1;

      // Roll the intended HP for this level
      hp = arcadeEnemyHpForLevel(lvl);

      // ---- Anti-wall tuning for late Arcade (35–50), but NEVER boss levels ----
      // Goal: prevent "too many multi-hit enemies at once" walls.
      if (lvl >= 35 && lvl <= 50) {
        // Count current tanky enemies already alive
        const tankyOnScreen = state.enemies.reduce(
          (n, ee) => n + (((ee.maxHp || ee.hp || 1) >= 3) ? 1 : 0),
          0
        );
        const fourHpOnScreen = state.enemies.reduce(
          (n, ee) => n + (((ee.maxHp || ee.hp || 1) >= 4) ? 1 : 0),
          0
        );

        // Caps (tuned to keep it hard but not impossible)
        // 35–39 are the "3HP party" levels, so be stricter there.
        const tankyCap = (lvl <= 39) ? 3 : 4;   // max HP>=3 enemies alive
        const fourHpCap = 1;                    // max HP>=4 enemies alive

        // If too many tanky enemies already exist, downgrade new spawns to 2HP.
        if (hp >= 3 && tankyOnScreen >= tankyCap) {
          hp = 2;
        }

        // If a 4HP enemy would exceed the 4HP cap, downgrade it to 3HP (or 2HP if also tanky-capped).
        if (hp >= 4 && fourHpOnScreen >= fourHpCap) {
          hp = (tankyOnScreen >= tankyCap) ? 2 : 3;
        }
      }
    }

    // Arcade fairness caps: prevent too many tanky enemies on screen at once
    if (state.gameMode === "arcade" && !state.arcadeIsBoss) {
      const lvlA = state.arcadeLevel || 1;

      const hp3pOnScreen = state.enemies.reduce(
        (n, ee) => n + (((ee.maxHp || ee.hp || 1) >= 3) ? 1 : 0),
        0
      );
      const hp4pOnScreen = state.enemies.reduce(
        (n, ee) => n + (((ee.maxHp || ee.hp || 1) >= 4) ? 1 : 0),
        0
      );

      // Caps scale up as the game progresses (still hardest near 50, just not RNG-unfair)
      let cap3p = 4; // max enemies with HP >= 3
      let cap4p = 1; // max enemies with HP >= 4

      if (lvlA >= 25) { cap3p = 5; cap4p = 1; }
      if (lvlA >= 31) { cap3p = 5; cap4p = 1; } // keep 31–40 fair
      if (lvlA >= 41) { cap3p = 5; cap4p = 2; } // endgame: fewer 3hp dogpiles
      if (lvlA >= 45) { cap3p = 5; cap4p = 1; } // 45-49: prevent stacked 4hp nightmares

      // Downgrade spawns if we'd exceed caps
      if (hp >= 4 && hp4pOnScreen >= cap4p) hp = 3;
      if (hp >= 3 && hp3pOnScreen >= cap3p) hp = 2;
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

    // Determine allowed powerups for the current game mode
    const mode = GAME_MODES[state.gameMode || "endless"] || GAME_MODES.endless;

    let t = "shield";

    // Arcade: curated pool (no +time, no 2x, no stun gun). Boss levels also ban capture.
    if (state.gameMode === "arcade") {
      // Normal Arcade levels: curated pool
      const basePool = [
        ["capture", 18],
        ["life", 14],
        ["shield", 18],
        ["railgun", 17],
        ["multishot", 17],
        ["pusher", 16],
      ];

      // Arcade boss fights: pusher does nothing, and capture is banned too.
      // Only allow: railgun, multishot, extra life, shield
      const bossPool = [
        ["life", 14],
        ["shield", 18],
        ["railgun", 17],
        ["multishot", 17],
      ];

      const pool = state.arcadeIsBoss ? bossPool : basePool;

      const total = pool.reduce((a, b) => a + b[1], 0);
      let r = Math.random() * total;
      for (const [type, weight] of pool) {
        r -= weight;
        if (r <= 0) { t = type; break; }
      }
    }

    // Chaos Time Trial: add a Time+ powerup that spawns a bit more often than others
    else if (state.gameMode === "chaos") {
      // Weighted pool (roughly: Time ~22%, others share the rest)
      const pool = [
        ["time", 22],
        ["shield", 13],
        ["railgun", 12],
        ["multishot", 12],
        ["pusher", 10],
        ["stungun", 10],
        ["capture", 11],
        ["multiplier", 10],
      ];

      const total = pool.reduce((a, b) => a + b[1], 0);
      let r = Math.random() * total;
      for (const [type, weight] of pool) {
        r -= weight;
        if (r <= 0) { t = type; break; }
      }
    } else {
      const roll = Math.random();

      // 14% chance for life ONLY if the mode allows it
      if (roll < 0.14 && mode.allowLifePowerup) {
        t = "life";
      } else {
        const pool = ["shield", "railgun", "multishot", "pusher", "stungun", "capture", "multiplier"];
        t = pool[Math.floor(Math.random() * pool.length)];
      }
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

  function onArcadeEnemyDefeated() {
    if (state.gameMode !== "arcade" || state.arcadeIsBoss) return;
    state.arcadeEnemiesLeft = Math.max(0, (state.arcadeEnemiesLeft || 0) - 1);
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

    // ==============================
    // CHAOS TIME TRIAL LOGIC
    // ==============================
    if (state.gameMode === "chaos") {
      // Shield absorbs first
      if (state.shieldHp > 0) {
        state.shieldHp -= 1;
        state.invulnUntil = now + 350;
        playSfx(sfxPlayerHit);
        burst(state.player.x + 10, state.player.y, "rgba(114,247,210,40)");
        return;
      }

      // No HP / lives — lose time instead
      const m = GAME_MODES.chaos;
      state.timeLeftMs = Math.max(
        0,
        (state.timeLeftMs || 0) - (m.hitTimePenaltyMs || 10000)
      );

      state.invulnUntil = now + 700;
      playSfx(sfxPlayerHit);
      burst(state.player.x + 10, state.player.y, "rgba(255,106,136,85)");

      if (state.timeLeftMs <= 0) {
        state.timeLeftMs = 0;
        gameOver();
      }
      return;
    }

    // ==============================
    // NORMAL MODES (Endless / Survival)
    // ==============================

    // Shield first
    if (state.shieldHp > 0) {
      state.shieldHp -= 1;
      state.invulnUntil = now + 350;
      playSfx(sfxPlayerHit);
      burst(state.player.x + 10, state.player.y, "rgba(114,247,210,40)");
      return;
    }

    // HP damage
    state.playerHp -= 1;
    state.invulnUntil = now + 700;
    playSfx(sfxPlayerHit);
    burst(state.player.x + 10, state.player.y, "rgba(255,106,136,85)");

    if (state.playerHp <= 0) {
      state.lives -= 1;
      state.playerHp = PLAYER_MAX_HP;

      if (state.lives <= 0) {
        gameOver();
      }
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
      time: "+Time",
    };
    
    if (type === "time") {
      if (state.gameMode !== "chaos") return; // ignore outside Chaos
      const m = GAME_MODES.chaos;
      const add = m.timePowerupBonusMs || 15000;
      const cap = m.timePowerupMaxMs || 180000;
      state.timeLeftMs = clamp((state.timeLeftMs || 0) + add, 0, cap);
      showToast(`Powerup: ${pretty[type]}`);
      return;
    }
    
    if (type === "life") {
      const mode = GAME_MODES[state.gameMode || "endless"] || GAME_MODES.endless;
      if (!mode.allowLifePowerup) {
        showToast("No extra lives in Survival.", 1200);
        return;
      }
      state.lives = clamp(state.lives + 1, 0, state.maxLives);
      showToast(`Powerup: ${pretty[type]}`);
      return;
    }
    if (type === "shield") {
      state.shieldHp = SHIELD_MAX_HP; // reset or give full shield
      showToast(`Powerup: ${pretty[type]}`);
      return;
    }
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
      if (state.gameMode === "arcade") {
        // Arcade does not use stun gun.
        showToast("Stun Gun is disabled in Arcade.", 900);
        return;
      }
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

    // Arcade: no leaderboard, keep progress (restart from this level)
    if (state.gameMode === "arcade") {
      const lvl = clamp(state.arcadeLevel || 1, 1, 50);
      const prior = loadArcadeSave();
      if (!prior?.cleared) saveArcadeSave(lvl, false);

      showOverOverlay({
        title: "Game Over",
        subHtml: `You reached Level <span class="mono">${lvl}</span>`,
        showSaveScore: false,
        showRetry: true,
        retryText: "Continue",
        showMenu: true,
      });
    } else {
      finalScore.textContent = state.score.toLocaleString();
      try { playerName.value = playerName.value || "Jelly"; } catch {}
      showOverlay("over");
    }

    stopMusic();
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

    // Skip credits with Escape
    if (e.key === "Escape" && state.credits) {
      e.preventDefault();
      finishArcadeCredits();
      return;
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

  async function startRun(modeKey) {
    state.gameMode = modeKey || "endless";

    // user gesture unlocks audio
    await ensureAudioCtx();
    try { if (audioCtx.state === "suspended") await audioCtx.resume(); } catch {}
    iosKickstartAudio();

    try {
      await getAudioBuffer(ASSETS.musicGame);
      await getAudioBuffer(ASSETS.musicHardcore);
    } catch {}

    if (isIOS()) {
      try { await loadShootBuffer(); } catch {}
      await primeSfxIOS();
    }

    // Reset for the selected mode
    resetGame(state.gameMode);

    // Start play mode (but hold gameplay behind a countdown)
    const now = performance.now();
    state.countdownFrom = now;
    state.countdownUntil = now + COUNTDOWN_MS;
    state.startFlashUntil = 0;

    // Delay spawns until countdown ends
    state.nextEnemyAt = now + COUNTDOWN_MS + 600;
    state.nextPowerAt = now + COUNTDOWN_MS + rand(DIFF.powerupEvery * 0.6, DIFF.powerupEvery * 1.4);

    setMode("play");
  }

  async function startArcadeRun(level = 1, overwrite = false) {
    const lvl = clamp(parseInt(level, 10) || 1, 1, 50);

    state.gameMode = "arcade";

    // user gesture unlocks audio
    await ensureAudioCtx();
    try { if (audioCtx.state === "suspended") await audioCtx.resume(); } catch {}
    iosKickstartAudio();

    try {
      await getAudioBuffer(ASSETS.musicArcade);
      await getAudioBuffer(ASSETS.musicBoss);
      await getAudioBuffer(ASSETS.musicHardcore);
    } catch {}

    if (overwrite) {
      saveArcadeSave(1, false);
    }

    // Set up the current level BEFORE reset so HUD/music routing is correct.
    state.arcadeLevel = lvl;
    state.arcadeIsBoss = (lvl % 10 === 0);

    // Reset for arcade
    resetGame("arcade");
    initArcadeLevel(lvl, { saveNow: true });

    // Countdown
    const now = performance.now();
    state.countdownFrom = now;
    state.countdownUntil = now + COUNTDOWN_MS;
    state.startFlashUntil = 0;

    // Spawners begin after countdown
    state.nextEnemyAt = now + COUNTDOWN_MS + 650;
    state.nextPowerAt = now + COUNTDOWN_MS + rand(DIFF.powerupEvery * 0.6, DIFF.powerupEvery * 1.4);

    setMode("play");
  }
  
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
        getAudioBuffer(ASSETS.musicHardcore),
        getAudioBuffer(ASSETS.musicTimeTrial),
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
    overlayMenu.addEventListener("pointerdown", (e) => {
      const raw = e.target;
      if (!(raw instanceof Element)) return;

      const btn = raw.closest("button");
      if (!btn) return;

      // If we just swapped pages, ignore stray presses (prevents mobile "click-through")
      const now = performance.now();
      if (now < (state.uiLockUntil || 0)) return;

      // Page navigation
      const nav = btn.getAttribute("data-nav");
      if (nav) {
        e.preventDefault();
        e.stopPropagation();

        // Lock briefly to prevent "click-through" onto new page elements
        state.uiLockUntil = now + 250;

        setMenuPage(nav);
        return;
      }

      // Leaderboard tabs
      const lbMode = btn.getAttribute("data-lb-mode");
      if (lbMode) {
        e.preventDefault();
        e.stopPropagation();

        state.uiLockUntil = now + 150;
        setLeaderboardTab(lbMode);
        return;
      }
    });
  }
  // Start game from Choose Mode -> Endless
  if (btnModeArcade) {
    btnModeArcade.addEventListener("click", () => {
      setMenuPage("arcade");
    });
  }

  if (btnModeEndless) {
    btnModeEndless.addEventListener("click", () => startRun("endless"));
  }

  if (btnModeChaos) {
    btnModeChaos.addEventListener("click", () => startRun("chaos"));
  }

  if (btnModeSurvival) {
    btnModeSurvival.addEventListener("click", () => startRun("survival"));
  }

  // Reset Scores (with confirmation)
  if (btnResetScores) {
    btnResetScores.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const now = performance.now();
      if (now < (state.uiLockUntil || 0)) return;

      showResetConfirm(true);
    });
  }

  if (btnResetNo) {
    btnResetNo.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showResetConfirm(false);

      // tiny lock so the "No" click doesn't hit something behind it
      state.uiLockUntil = performance.now() + 150;
    });
  }

  if (btnResetYes) {
    btnResetYes.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Wipe ALL scores for ALL modes
      saveScores([]);
      showResetConfirm(false);

      // Force leaderboard back to Endless and refresh UI
      setLeaderboardTab("endless");

      state.uiLockUntil = performance.now() + 150;
    });
  }

  btnRetry.addEventListener("click", async () => {
    await ensureAudioCtx();
    try { if (audioCtx.state === "suspended") await audioCtx.resume(); } catch {}

    iosKickstartAudio(); // ✅ add this line

    // Preload appropriate music for a smoother start
    try {
      if ((state.gameMode || "endless") === "arcade") {
        await getAudioBuffer(ASSETS.musicArcade);
        await getAudioBuffer(ASSETS.musicBoss);
      } else {
        await getAudioBuffer(ASSETS.musicGame);
      }
    } catch {}

    if (isIOS()) {
      try { await loadShootBuffer(); } catch {}
    }

    if (isIOS()) {
      await primeSfxIOS();
    }

    if ((state.gameMode || "endless") === "arcade") {
      const save = loadArcadeSave();
      const lvl = save?.cleared ? 1 : (save?.level || (state.arcadeLevel || 1));
      startArcadeRun(lvl, false);
    } else {
      startRun(state.gameMode || "endless");
    }
  });

  btnMenu.addEventListener("click", () => {
    stopMusic(); 
    setMode("menu");
    renderScores();
  });

  btnSubmitScore.addEventListener("click", () => {
    addScore(playerName.value || "Jelly", state.score, state.wave, state.gameMode || "endless");

    // Jump the leaderboard tab to the mode you just played
    state.leaderboardMode = state.gameMode || "endless";

    renderScores(state.leaderboardMode);
    stopMusic();
    setMode("menu");
  });

  btnMuteMusic.addEventListener("click", () => setMusicMuted(!audioState.musicMuted));
  btnMuteSfx.addEventListener("click", () => setSfxMuted(!audioState.sfxMuted));

  btnPause.addEventListener("click", () => togglePause());
  if (btnSkipCredits) {
    btnSkipCredits.addEventListener("click", () => {
      if (state.credits) finishArcadeCredits();
    });
  }
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
    // === Arcade credits transition: delay -> fade -> credits roll ===
    if (state.creditsTransition) {
      const tr = state.creditsTransition;
      tr.tMs += dtMs;

      if (tr.phase === "delay") {
        if (tr.tMs >= tr.delayMs) {
          tr.phase = "fade";
          tr.tMs = 0;
        }
      } else if (tr.phase === "fade") {
        tr.alpha = clamp(tr.tMs / tr.fadeMs, 0, 1);

        if (tr.alpha >= 1) {
          // Start credits music *when* credits appear
          playMusic("credits");

          if (btnSkipCredits) btnSkipCredits.style.display = "inline-flex";
          positionSkipCreditsButton();

          state.credits = {
            scrollY: canvas.height + 120,
            speed: 92, // px/sec
            done: false,
          };

          state.creditsTransition = null;
        }
      }

      // Freeze all gameplay during transition
      state.player.vy = 0;
      state.shooting = false;
      state.pointerDown = false;
      return;
    }

    // === Arcade final credits: freeze gameplay + only advance credits scroll ===
    if (state.credits) {
      updateArcadeCredits(dtMs);

      // Hard-freeze any movement carryover
      state.player.vy = 0;
      return;
    }

    const dt = dtMs / 1000;
    state.time += dtMs;

    // Chaos Time Trial countdown (no game over until this hits 0)
    if (state.gameMode === "chaos") {
      state.timeLeftMs = Math.max(0, (state.timeLeftMs || 0) - dtMs);
      if (state.timeLeftMs <= 0) {
        state.timeLeftMs = 0;
        gameOver();
        return;
      }
    }

    // heat/wave progression
    let seconds = state.time / 1000;
    // Difficulty heat (may be capped on mobile survival)
    let diffHeat = state.heat;

    // Arcade uses fixed levels (no time-based wave/heat)
    const arcadeFixed = (state.gameMode === "arcade" && !(state.debugMode && state.debugLock));

    if (arcadeFixed) {
        const lvl = state.arcadeLevel || 1;

        state.wave = lvl; // reuse existing wave slot

        // Heat ramps per 10-level "chapter"
        // Level 1 -> 0.0, 2 -> 0.1 ... 9 -> 0.8, 10 -> 0.9
        // Then resets at 11 (back to 0.0), etc.
        const within = (lvl - 1) % 10;                 // 0..9
        let h = (within === 9) ? 0.9 : within / 10;    // boss gets 0.9

        // Small Arcade speed bump from level 25+ (non-boss levels)
        if (lvl >= 25 && within !== 9) h = Math.min(0.9, h + 0.05);

        // Late endgame (45-49): keep the kill-count the same, but reduce speed/spawn pressure a touch
        if (lvl >= 45 && lvl <= 49 && within !== 9) {
          h = Math.max(0, h - 0.12);
        }

        state.heat = clamp(h, 0, 0.9);
        diffHeat = state.heat;
      } else if (state.debugMode && state.debugLock) {
      // Debug lock: force manual overrides AND keep time consistent
      const forcedWave = clamp(parseInt(state.debugWave || 1, 10) || 1, 1, 999);
      const forcedHeat = clamp(
        Number.isFinite(state.debugHeat) ? state.debugHeat : 0,
        0,
        1
      );

      state.wave = forcedWave;
      state.heat = forcedHeat;
      diffHeat =
        (IS_MOBILE && state.gameMode === "survival")
          ? Math.min(state.heat, 0.5)
          : state.heat;

      // Keep underlying time aligned with forced wave so nothing snaps back
      state.time = (state.wave - 1) * 20000;
      seconds = state.time / 1000;
    } else {
      // Normal: derived from time (this is what makes wave continue to 51, 52, etc.)
      state.heat = clamp(seconds / DIFF.rampSeconds, 0, 1);
      state.wave = Math.max(1, Math.floor(seconds / 20) + 1);

      // Mobile Survival: cap difficulty at 50% heat (keeps anti-cheat + HUD intact)
      diffHeat =
        (IS_MOBILE && state.gameMode === "survival")
          ? Math.min(state.heat, 0.5)
          : state.heat;

      // keep debug fields in sync so the UI matches what you're seeing
      state.debugWave = state.wave;
      state.debugHeat = state.heat;
    }

    // input -> player target velocity
    const h = canvas.height;
    const minY = SAFE_TOP_UI_BAR + state.player.r + 6;
    const maxY = h - SAFE_BOTTOM_PAD - state.player.r - 6;

    let targetVy = 0;
    const mode = GAME_MODES[state.gameMode || "endless"] || GAME_MODES.endless;

    // Mobile survival needs extra help due to tall canvas
    const mobileSurvivalBoost =
      IS_MOBILE && state.gameMode === "survival" ? 1.50 : 1;

    const baseSpeed = IS_MOBILE ? 600 : 620;
    const speed = baseSpeed * (mode.moveMult || 1) * mobileSurvivalBoost;

    if (state.up) targetVy -= speed;
    if (state.down) targetVy += speed;

    // pointer drag overrides keys if active
    if (state.pointerDown && typeof state.pointerY === "number") {
      // smooth follow
      const dy = state.pointerY - state.player.y;
      const baseDrag = IS_MOBILE ? 800 : 720;
      const maxDragSpeed = baseDrag * (mode.moveMult || 1) * mobileSurvivalBoost;
      targetVy = clamp(dy * 13, -maxDragSpeed, maxDragSpeed);
    }

    // jelly inertia (smooth)
    state.player.vy += (targetVy - state.player.vy) * clamp(dt * 10, 0, 1);
    state.player.y += state.player.vy * dt;
    state.player.y = clamp(state.player.y, minY, maxY);

    // shooting
    if (state.shooting) fire();
    railgunAutoFire(dt);

    // spawn enemies / boss
    const now = performance.now();

    if (state.gameMode === "arcade") {
      // Boss update (no normal enemies)
      if (state.arcadeIsBoss) {
        updateBoss(dt, now);
      } else {
        // Normal Arcade levels: keep a manageable number of enemies on screen until the
        // objective count reaches 0 (then stop spawning and let the player clear the rest).
        const lvl = state.arcadeLevel || 1;

        // Default Arcade pacing
        let maxEnemies = clamp(6 + Math.floor(lvl / 3), 6, 14);
        let spawnEvery = clamp(1100 - lvl * 10, 520, 1100);

        // Late endgame: reduce "instant overwhelm" without making it easy
        if (lvl >= 45 && lvl <= 49) {
          maxEnemies = 10;        // was effectively 14 at these levels
          spawnEvery = 760;       // slower than ~610ms at 49
        }

        if (state.arcadeEnemiesLeft > 0 && now >= state.nextEnemyAt) {
          const cap = Math.min(maxEnemies, state.arcadeEnemiesLeft); // don't exceed quota remaining
          if (state.enemies.length < cap) {
            spawnEnemy();

            // Optional extra spawn on higher levels, but still respect cap/quota
            if (lvl >= 15 && chance(0.08)) {
              const cap2 = Math.min(maxEnemies, state.arcadeEnemiesLeft);
              if (state.enemies.length < cap2) spawnEnemy();
            }
          }
          state.nextEnemyAt = now + spawnEvery * rand(0.80, 1.25);
        }
      }
    } else {
      // Non-Arcade: original wave-based spawner
      const waveRamp = clamp((state.wave - 1) / 9, 0, 1); // reaches 1 at wave 10
      const effectiveMinSpawn = DIFF.minSpawnEvery + (1 - waveRamp) * 260; // adds ~260ms early on

      const spawnEvery = clamp(
        DIFF.startSpawnEvery - diffHeat * (DIFF.startSpawnEvery - effectiveMinSpawn),
        effectiveMinSpawn,
        DIFF.startSpawnEvery
      );

      const maxEnemies = maxEnemiesForWave(state.wave);

      if (now >= state.nextEnemyAt) {
        if (state.enemies.length < maxEnemies) {
          spawnEnemy();
          if (state.wave >= 10 && state.heat > 0.7 && chance(0.10) && state.enemies.length < maxEnemies) {
            spawnEnemy();
          }
        }
        state.nextEnemyAt = now + spawnEvery * rand(0.80, 1.25);
      }
    }

    // spawn powerups (random-ish)
    if (now >= state.nextPowerAt) {
      spawnPowerup();

      // Arcade pacing tweak:
      // From level 25+, give the player more tools (more frequent powerups),
      // but keep boss levels unchanged.
      let baseEvery = DIFF.powerupEvery;
      if (state.gameMode === "arcade" && !state.arcadeIsBoss) {
        const lvl = state.arcadeLevel || 1;
        if (lvl >= 25) baseEvery *= 0.82;
        else if (lvl >= 15) baseEvery *= 0.85;
      }

      state.nextPowerAt = now + rand(baseEvery * 0.6, baseEvery * 1.4);
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

            const basePts = Math.floor(10 + 10 * diffHeat);

            const modeNow = GAME_MODES[state.gameMode || "endless"] || GAME_MODES.endless;
            const baseMult = modeNow.scoreMultBase || 1;
            const powerupMult = (performance.now() < state.scoreMultUntil) ? 2 : 1;

            state.score += Math.round(basePts * baseMult * powerupMult);

            onArcadeEnemyDefeated();
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

          // Mobile Survival mercy: slightly fewer bullets + slightly slower bullets
          const mobileSurvivalMercy = (IS_MOBILE && state.gameMode === "survival") ? 0.72 : 1;

          const spd = (380 + (state.wave >= 10 ? 80 : 0)) * mobileSurvivalMercy;

          // chance to fire this cycle
          const pShoot = clamp(
            (0.14 + (state.wave - 3) * 0.045) * mobileSurvivalMercy,
            0,
            0.55
          );

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

        const mode = GAME_MODES[state.gameMode || "endless"] || GAME_MODES.endless;
        e.hp -= (mode.damageMult || 1);
        burst(e.x, e.y, "rgba(122,166,255,.85)");
        playSfx(sfxEnemyHit);

        if (e.hp <= 0) {
          state.enemies.splice(i, 1);

          const basePts = Math.floor(10 + 10 * diffHeat);

          const modeNow = GAME_MODES[state.gameMode || "endless"] || GAME_MODES.endless;
          const baseMult = modeNow.scoreMultBase || 1;
          const powerupMult = (performance.now() < state.scoreMultUntil) ? 2 : 1;

          state.score += Math.round(basePts * baseMult * powerupMult);

          onArcadeEnemyDefeated();
        }

        break;
      }
    }

    // Boss bullet collisions (Arcade)
    if (state.gameMode === "arcade" && state.boss) {
      const boss = state.boss;
      for (let j = state.bullets.length - 1; j >= 0; j--) {
        const b = state.bullets[j];
        if (!circleHit({ x: boss.x, y: boss.y, r: boss.r + 4 }, b)) continue;

        state.bullets.splice(j, 1);

        if (b.isCapture) {
          // Just in case capture sneaks in (dev menu etc.)
          showToast("Bosses can't be captured 😅", 900);
          burst(boss.x, boss.y, "rgba(114,247,210,.45)");
          continue;
        }

        const mode = GAME_MODES[state.gameMode || "endless"] || GAME_MODES.endless;
        const dmg = (mode.damageMult || 1);
        boss.hp -= dmg;
        burst(boss.x, boss.y, "rgba(122,166,255,.85)");
        playSfx(sfxEnemyHit);

        if (boss.hp <= 0) {
          boss.hp = 0;
          handleArcadeLevelComplete({ wasFinalBoss: (state.arcadeLevel === 50) });
          break;
        }
      }
    }

    ctx.save();
    applyCameraTransform();

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

    // Arcade: normal level completion (kill quota reached and screen cleared)
    if (state.gameMode === "arcade" && !state.arcadeIsBoss) {
      if ((state.arcadeEnemiesLeft || 0) <= 0 && state.enemies.length === 0) {
        handleArcadeLevelComplete({ wasFinalBoss: false });
      }
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

    // Arcade Boss
    if (state.gameMode === "arcade" && state.boss) {
      const b = state.boss;


      // Boss gimmick visuals (laser / zap / missiles)
      drawBossWeapons(performance.now());
      // glow
      drawGlowCircle(b.x, b.y, b.r * 2.2, "rgba(255,106,136,.10)", "rgba(0,0,0,0)");

      // boss body (pfp) clipped
      if (b.pfpImg) {
        const size = b.r * 1.55; // boss pfp slightly smaller so decor sits nicely
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(b.pfpImg, b.x - size / 2, b.y - size / 2, size, size);
        ctx.restore();

        ctx.strokeStyle = "rgba(233,240,255,.22)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(233,240,255,.7)";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // decor on top
      if (b.decorImg) {
        const box = b.r * 2.0;
        ctx.save();
        ctx.drawImage(b.decorImg, b.x - box / 2, b.y - box / 2, box, box);
        ctx.restore();
      }

      // boss HP bar
      const bw = b.r * 2.6;
      const bh = 8;
      const x0 = b.x - bw / 2;
      const y0 = b.y - b.r - 22;
      const frac = clamp(b.hp / b.maxHp, 0, 1);
      ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.fillRect(x0, y0, bw, bh);
      ctx.fillStyle = "rgba(255,106,136,.9)";
      ctx.fillRect(x0, y0, bw * frac, bh);
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
    const shield = state.shieldHp > 0;

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

    // Arcade bumpers (Level X / Boss approaching)
    if (state.mode === "play" && state.gameMode === "arcade") {
      const nowB = performance.now();
      if (state.levelBannerUntil && nowB < state.levelBannerUntil) {
        // Put the bumper ABOVE the 3..2..1 (which draws at h/2)
        const bumperY = Math.max(80, (h / 2) - 120);

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = 0.9;
        ctx.font = `900 44px ui-sans-serif, system-ui`;
        ctx.fillStyle = "#e9f0ff";
        ctx.fillText(`LEVEL ${state.arcadeLevel}`, w / 2, bumperY);
        ctx.restore();

        // If boss warning is active too, stack it under the level bumper (still above countdown)
        if (state.bossWarningUntil && nowB < state.bossWarningUntil) {
          ctx.save();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.globalAlpha = 0.9;
          ctx.font = `900 36px ui-sans-serif, system-ui`;
          ctx.fillStyle = "#e9f0ff";
          ctx.fillText("BOSS APPROACHING", w / 2, bumperY + 54);
          ctx.restore();
        }
      } else if (state.bossWarningUntil && nowB < state.bossWarningUntil) {
        // If there's no level bumper, still keep the boss warning ABOVE the countdown
        const bossY = Math.max(120, (h / 2) - 66);

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = 0.9;
        ctx.font = `900 36px ui-sans-serif, system-ui`;
        ctx.fillStyle = "#e9f0ff";
        ctx.fillText("BOSS APPROACHING", w / 2, bossY);
        ctx.restore();
      }
    }

    // Arcade credits transition (delay -> fade)
    if (state.creditsTransition) {
      const tr = state.creditsTransition;
      const a = tr.phase === "fade" ? clamp(tr.alpha, 0, 1) : 0;
      if (a > 0) {
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = "rgba(0,0,0,.92)";
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
    }

    // Arcade credits roll (finale)
    if (state.credits) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,.86)";
      ctx.fillRect(0, 0, w, h);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const lineH = 40;
      const y0 = state.credits.scrollY;

      for (let i = 0; i < ARCADE_CREDITS_LINES.length; i++) {
        const txt = ARCADE_CREDITS_LINES[i];
        const dy = y0 + i * lineH;
        if (dy < -60 || dy > h + 60) continue;

        // fade out near the top
        const fade = clamp(dy / 180, 0, 1);
        ctx.globalAlpha = 0.12 + 0.88 * fade;

        let font = "800 26px ui-sans-serif, system-ui";
        let fill = "rgba(233,240,255,.92)";

        // Title + subtitle styling
        if (txt === "PROJECT BIOLUME") {
          font = "900 44px ui-sans-serif, system-ui";
          fill = "rgba(122,166,255,.98)"; // blue
        } else if (txt.startsWith("A game developed by")) {
          font = "800 26px ui-sans-serif, system-ui";
          fill = "rgba(233,240,255,.85)";
        } else if (/:$/.test(txt)) {
          // Section headers
          font = "900 32px ui-sans-serif, system-ui";
          fill = "rgba(114,247,210,.95)";
        }

        ctx.font = font;
        ctx.fillStyle = fill;
        if (txt) ctx.fillText(txt, w / 2, dy);
      }

      ctx.restore();
    }

    // Countdown overlay text (3..2..1..START)
    if (state.mode === "play") {
      const nowC = performance.now();

      // 3..2..1 during countdown
      if (state.countdownUntil && nowC < state.countdownUntil) {
        const remainingMs = state.countdownUntil - nowC;
        const stepMs = COUNTDOWN_MS / COUNTDOWN_STEPS;

        // 0..(steps-1)
        const stepIndex = Math.floor((COUNTDOWN_MS - remainingMs) / stepMs);
        const n = clamp(COUNTDOWN_STEPS - stepIndex, 1, COUNTDOWN_STEPS);

        const frac = clamp((remainingMs % stepMs) / stepMs, 0, 1);
        const alpha = 0.55 + 0.45 * frac;

        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,.35)";
        ctx.fillRect(0, 0, w, h);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.globalAlpha = alpha;
        ctx.font = `900 86px ui-sans-serif, system-ui`;
        ctx.fillStyle = "#e9f0ff";
        ctx.fillText(String(n), w / 2, h / 2);

        ctx.globalAlpha = 0.95;
        ctx.font = `900 18px ui-sans-serif, system-ui`;
        ctx.fillStyle = "rgba(156,176,214,.95)";
        ctx.fillText("GET READY", w / 2, h / 2 + 70);

        ctx.restore();
      }

      // START! flash after countdown
      if (state.startFlashUntil && nowC < state.startFlashUntil) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = 0.95;
        ctx.font = `900 64px ui-sans-serif, system-ui`;
        ctx.fillStyle = "#e9f0ff";
        ctx.fillText("START!", w / 2, h / 2);
        ctx.restore();
      }
    }
    
    // pause overlay text
    if (state.mode === "play" && state.paused) {
      ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.fillRect(0, 0, w, h);
      drawText(w / 2 - 48, h / 2, "PAUSED", 24, 1);
      drawText(w / 2 - 110, h / 2 + 28, "Press P or tap Pause to resume", 14, 0.9);
    }

    ctx.restore();
    drawPostFX(w, h);
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
    const rawDt = t - lastT;
    // Clamp huge frame gaps so physics doesn't "jump" (visual jitter)
    const dt = Math.min(rawDt, 50);
    lastT = t;

    updateFx(dt);

    if (state.mode === "play" && !state.paused) {
      // During countdown, don't advance game simulation (keeps anti-cheat happy too)
      const now = performance.now();

      if (state.countdownUntil && now < state.countdownUntil) {
        resizeCanvasToDisplaySize();
        updateHud();
      } else {
        // If countdown just finished, start a short START! flash
        if (state.countdownUntil && now >= state.countdownUntil) {
          state.startFlashUntil = now + START_FLASH_MS;
          state.countdownUntil = 0;
          state.countdownFrom = 0;
          playMusic("game");
        }
        update(dt);
      }
    } else {
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
