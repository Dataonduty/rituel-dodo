'use strict';

(() => {

  // ---------- Constantes ----------

  const COLORS = {
    histoire: '#f6c453',
    biberon: '#f3e9d2',
    dents: '#7fd8c8',
    calin: '#f2a2c0',
  };
  const FALLBACK_COLOR = '#cbd5ff';

  const DEFAULT_PHASES = [
    { id: 'histoire', emoji: '📖', label: 'Histoire', minutes: 5, enabled: true },
    { id: 'biberon', emoji: '🍼', label: 'Biberon', minutes: 15, enabled: true },
    { id: 'dents', emoji: '🪥', label: 'Dents', minutes: 5, enabled: true },
    { id: 'calin', emoji: '🤗', label: 'Câlin', minutes: 5, enabled: true },
  ];

  const SETTINGS_KEY = 'dodo.settings';
  const RUN_KEY = 'dodo.run';
  const STALE_MS = 3 * 60 * 60 * 1000; // rituel abandonné depuis > 3 h

  // Mode test : ?speed=60 -> le temps passe 60x plus vite
  const SPEED = (() => {
    const s = parseFloat(new URLSearchParams(location.search).get('speed'));
    return Number.isFinite(s) && s > 0 ? s : 1;
  })();

  // Géométrie du sablier (viewBox 320x480, symétrique pour le retournement)
  const SAND = {
    topY: 50,       // haut de l'ampoule supérieure
    neckTopY: 236,  // col, côté supérieur
    neckBotY: 244,  // col, côté inférieur
    botY: 430,      // plancher de l'ampoule inférieure
    left: 64,
    width: 192,
    fillH: 178,     // hauteur de sable d'une étape (léger vide en haut de l'ampoule)
  };

  const FLIP_MS = 800; // durée de l'animation de retournement

  // ---------- État ----------

  let settings = loadSettings();
  let run = null;       // { startedAt, totalPaused, pausedAt, skipOffset, phases, soundOn, updatedAt }
  let schedule = null;  // { phases, dur[], cumStart[], total }
  let curIdx = -1;
  let rafId = 0;
  let watchdogId = 0;
  let lastFrameAt = 0;
  let lastClockText = '';
  let wakeLock = null;
  let toastTimer = 0;

  // Éléments créés à chaque rituel
  let topSandEl = null;
  let botSandEl = null;
  let moundEl = null;
  let chipEls = [];
  let progFills = [];
  let flipping = false;
  let flipTimer = 0;

  const $ = (id) => document.getElementById(id);

  // ---------- Stockage ----------

  function clampMin(m) {
    return Math.min(60, Math.max(1, Math.round(Number(m) || 1)));
  }

  function loadSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      if (!raw || !Array.isArray(raw.phases)) throw new Error('vide');
      const byId = Object.fromEntries(DEFAULT_PHASES.map((p) => [p.id, p]));
      const phases = raw.phases
        .filter((p) => p && byId[p.id])
        .map((p) => ({ ...byId[p.id], minutes: clampMin(p.minutes), enabled: p.enabled !== false }));
      for (const d of DEFAULT_PHASES) {
        if (!phases.some((p) => p.id === d.id)) phases.push({ ...d });
      }
      if (!phases.some((p) => p.enabled)) phases[0].enabled = true;
      return { phases, soundOn: raw.soundOn !== false };
    } catch {
      return { phases: DEFAULT_PHASES.map((p) => ({ ...p })), soundOn: true };
    }
  }

  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
  }

  function saveRun() {
    if (!run) return;
    run.updatedAt = Date.now();
    try { localStorage.setItem(RUN_KEY, JSON.stringify(run)); } catch {}
  }

  function clearRun() {
    run = null;
    try { localStorage.removeItem(RUN_KEY); } catch {}
  }

  function loadRun() {
    try {
      const r = JSON.parse(localStorage.getItem(RUN_KEY));
      if (!r || !r.startedAt || !Array.isArray(r.phases) || !r.phases.length) return null;
      if (Date.now() - (r.updatedAt || r.startedAt) > STALE_MS) return null;
      return r;
    } catch {
      return null;
    }
  }

  // ---------- Moteur de temps ----------

  function buildSchedule(phases) {
    const ph = phases.filter((p) => p.enabled);
    const dur = ph.map((p) => p.minutes * 60000);
    const cum = [0];
    for (const d of dur) cum.push(cum[cum.length - 1] + d);
    return { phases: ph, dur, cumStart: cum.slice(0, -1), total: cum[cum.length - 1] };
  }

  function vNow() {
    const now = Date.now();
    const pausedExtra = run.pausedAt ? now - run.pausedAt : 0;
    return (now - run.startedAt - run.totalPaused - pausedExtra) * SPEED + run.skipOffset;
  }

  function phaseAt(v) {
    if (v >= schedule.total) return schedule.phases.length;
    let i = 0;
    while (i < schedule.phases.length - 1 && v >= schedule.cumStart[i + 1]) i++;
    return i;
  }

  const colorOf = (p) => COLORS[p.id] || FALLBACK_COLOR;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  // ---------- Cycle de vie du rituel ----------

  function startRitual() {
    const active = settings.phases.filter((p) => p.enabled);
    if (!active.length) { toast('Active au moins une étape dans les réglages'); return; }
    ensureAudio();
    run = {
      startedAt: Date.now(),
      totalPaused: 0,
      pausedAt: null,
      skipOffset: 0,
      phases: active.map((p) => ({ ...p })),
      soundOn: settings.soundOn,
      updatedAt: Date.now(),
    };
    schedule = buildSchedule(run.phases);
    curIdx = -1;
    lastClockText = '';
    cancelFlip();
    saveRun();
    buildRitualDom();
    showScreen('ritual');
    syncPauseUi();
    acquireWakeLock();
    startLoop();
  }

  function resumeFromStorage() {
    const r = loadRun();
    if (!r) return false;
    run = r;
    schedule = buildSchedule(run.phases);
    if (!schedule.phases.length) { clearRun(); return false; }
    if (vNow() >= schedule.total) { clearRun(); return false; }
    curIdx = -1;
    lastClockText = '';
    cancelFlip();
    buildRitualDom();
    showScreen('ritual');
    syncPauseUi();
    if (!run.pausedAt) acquireWakeLock();
    startLoop();
    return true;
  }

  function tickOnce() {
    if (!run) return;
    const v = Math.max(0, vNow());
    const idx = phaseAt(v);
    if (idx >= schedule.phases.length) {
      finishRitual();
      return;
    }
    if (idx !== curIdx) {
      const isStart = curIdx === -1;
      curIdx = idx;
      onPhaseChange(isStart);
    }
    renderSand(v);
    renderClock(v);
    if (Date.now() - run.updatedAt > 10000) saveRun();
  }

  function startLoop() {
    stopLoop();
    const loop = () => {
      if (!run) return;
      lastFrameAt = Date.now();
      tickOnce();
      if (!run) return;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    // Garde-fou : si rAF est gelé (page non rendue, throttling), on continue de
    // faire avancer la logique a basse frequence.
    watchdogId = setInterval(() => {
      if (run && Date.now() - lastFrameAt > 600) tickOnce();
    }, 500);
  }

  function stopLoop() {
    cancelAnimationFrame(rafId);
    clearInterval(watchdogId);
  }

  function onPhaseChange(isStart) {
    const p = schedule.phases[curIdx];
    const color = colorOf(p);
    $('phaseEmoji').textContent = p.emoji;
    $('phaseLabel').textContent = p.label;
    document.body.style.setProperty('--accent', color);
    $('stream').setAttribute('fill', color);
    $('particles').setAttribute('fill', color);
    chipEls.forEach((el, i) => {
      el.classList.toggle('done', i < curIdx);
      el.classList.toggle('current', i === curIdx);
    });
    const em = $('phaseEmoji');
    em.classList.remove('pop');
    void em.offsetWidth;
    em.classList.add('pop');
    if (isStart) {
      setSandColor(color);
    } else {
      chime();
      startFlip(color);
    }
  }

  function pauseToggle() {
    if (!run) return;
    if (run.pausedAt) {
      run.totalPaused += Date.now() - run.pausedAt;
      run.pausedAt = null;
      acquireWakeLock();
    } else {
      run.pausedAt = Date.now();
      releaseWakeLock();
    }
    saveRun();
    syncPauseUi();
  }

  function syncPauseUi() {
    const paused = !!(run && run.pausedAt);
    $('screen-ritual').classList.toggle('paused', paused);
    $('pauseOverlay').hidden = !paused;
    $('btnPause').textContent = paused ? '▶' : '⏸';
    $('btnPause').title = paused ? 'Reprendre' : 'Pause';
  }

  function skipPhase() {
    if (!run || curIdx < 0) return;
    const v = vNow();
    const end = schedule.cumStart[curIdx] + schedule.dur[curIdx];
    run.skipOffset += Math.max(0, end - v);
    saveRun();
  }

  function stopRitual() {
    if (!confirm('Arrêter le rituel ?')) return;
    stopLoop();
    cancelFlip();
    releaseWakeLock();
    clearRun();
    renderHome();
    showScreen('home');
  }

  function finishRitual() {
    stopLoop();
    cancelFlip();
    releaseWakeLock();
    lullaby();
    clearRun();
    showScreen('end');
  }

  // ---------- Rendu du sablier ----------

  function svgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function buildRitualDom() {
    const top = $('sandTop');
    const bot = $('sandBot');
    top.innerHTML = '';
    bot.innerHTML = '';
    const color = colorOf(schedule.phases[0]);
    topSandEl = svgEl('rect', { x: SAND.left, y: SAND.neckTopY, width: SAND.width, height: 0, fill: color });
    botSandEl = svgEl('rect', { x: SAND.left, y: SAND.botY, width: SAND.width, height: 0, fill: color });
    moundEl = svgEl('ellipse', { cx: 160, cy: SAND.botY, rx: 40, ry: 9, fill: color, opacity: 0 });
    top.appendChild(topSandEl);
    bot.appendChild(botSandEl);
    bot.appendChild(moundEl);

    const trail = $('trail');
    trail.innerHTML = '';
    chipEls = schedule.phases.map((p) => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.textContent = p.emoji;
      trail.appendChild(chip);
      return chip;
    });

    const prog = $('progress');
    prog.innerHTML = '';
    progFills = schedule.phases.map((p, i) => {
      const seg = document.createElement('div');
      seg.className = 'pseg';
      seg.style.flexGrow = String(schedule.dur[i]);
      const fill = document.createElement('div');
      fill.className = 'pfill';
      fill.style.background = colorOf(p);
      seg.appendChild(fill);
      prog.appendChild(seg);
      return fill;
    });
  }

  function setSandColor(color) {
    topSandEl.setAttribute('fill', color);
    botSandEl.setAttribute('fill', color);
    moundEl.setAttribute('fill', color);
  }

  function renderSand(v) {
    // Barre de progression globale (un segment par étape)
    for (let i = 0; i < schedule.phases.length; i++) {
      const pct = clamp((v - schedule.cumStart[i]) / schedule.dur[i], 0, 1) * 100;
      progFills[i].style.width = pct + '%';
    }

    if (flipping) return; // le sablier en rotation garde l'état de l'étape finie

    // Le sablier représente l'étape en cours : il se vide entièrement pendant l'étape
    const frac = clamp((v - schedule.cumStart[curIdx]) / schedule.dur[curIdx], 0, 1);
    const topH = (1 - frac) * SAND.fillH;
    const botH = frac * SAND.fillH;
    topSandEl.setAttribute('y', SAND.neckTopY - topH);
    topSandEl.setAttribute('height', topH);
    botSandEl.setAttribute('y', SAND.botY - botH);
    botSandEl.setAttribute('height', botH);
    moundEl.setAttribute('cy', SAND.botY - botH);
    moundEl.setAttribute('opacity', Math.min(1, botH / 10).toFixed(2));

    // Filet de sable, du col au sommet du tas
    const stream = $('stream');
    if (topH > 0.5 && v < schedule.total) {
      stream.setAttribute('y', SAND.neckTopY + 2);
      stream.setAttribute('height', Math.max(0, SAND.botY - botH - SAND.neckTopY - 2));
    } else {
      stream.setAttribute('height', 0);
    }
  }

  function startFlip(newColor) {
    flipping = true;
    $('screen-ritual').classList.add('flipping');
    $('stream').setAttribute('height', 0);
    const hg = $('hourglass');
    hg.classList.add('flip');
    clearTimeout(flipTimer);
    flipTimer = setTimeout(() => {
      hg.classList.remove('flip'); // retour instantané à 0° : silhouette identique (symétrie)
      $('screen-ritual').classList.remove('flipping');
      setSandColor(newColor);
      flipping = false;
      if (run) renderSand(Math.max(0, vNow()));
    }, FLIP_MS + 50);
  }

  function cancelFlip() {
    clearTimeout(flipTimer);
    flipping = false;
    $('hourglass').classList.remove('flip');
    $('screen-ritual').classList.remove('flipping');
  }

  function renderClock(v) {
    const remMs = schedule.cumStart[curIdx] + schedule.dur[curIdx] - v;
    const s = Math.max(0, Math.ceil(remMs / 1000));
    const text = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    if (text !== lastClockText) {
      lastClockText = text;
      $('phaseTime').textContent = text;
    }
  }

  // ---------- Audio (WebAudio, aucun fichier) ----------

  let ac = null;

  function ensureAudio() {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
    } catch {}
  }

  function tone(freq, when, dur, peak) {
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ac.destination);
    const t = ac.currentTime + when;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function chime() {
    if (!run || !run.soundOn) return;
    ensureAudio();
    tone(659.25, 0, 1.1, 0.15);   // mi5
    tone(783.99, 0.22, 1.3, 0.12); // sol5
  }

  function lullaby() {
    if (!run || !run.soundOn) return;
    ensureAudio();
    const notes = [[783.99, 0], [659.25, 0.4], [587.33, 0.8], [523.25, 1.2]];
    notes.forEach(([f, w], i) => tone(f, w, i === notes.length - 1 ? 2.2 : 1.0, 0.13));
  }

  // ---------- Écran allumé ----------

  async function acquireWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
      }
    } catch {}
  }

  function releaseWakeLock() {
    try { if (wakeLock) wakeLock.release(); } catch {}
    wakeLock = null;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && run && !run.pausedAt) acquireWakeLock();
  });

  // ---------- Écrans ----------

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach((s) => {
      s.classList.toggle('active', s.id === 'screen-' + name);
    });
  }

  function totalMinutes() {
    return settings.phases.filter((p) => p.enabled).reduce((acc, p) => acc + p.minutes, 0);
  }

  function renderHome() {
    const list = $('homeList');
    list.innerHTML = '';
    settings.phases.filter((p) => p.enabled).forEach((p) => {
      const li = document.createElement('li');
      const dot = document.createElement('span');
      dot.className = 'pl-dot';
      dot.style.background = colorOf(p);
      const emoji = document.createElement('span');
      emoji.className = 'pl-emoji';
      emoji.textContent = p.emoji;
      const label = document.createElement('span');
      label.className = 'pl-label';
      label.textContent = p.label;
      const min = document.createElement('span');
      min.className = 'pl-min';
      min.textContent = p.minutes + ' min';
      li.append(dot, emoji, label, min);
      list.appendChild(li);
    });
    $('homeTotal').textContent = 'Durée totale : ' + totalMinutes() + ' min';
  }

  // ---------- Réglages ----------

  function renderSettings() {
    const wrap = $('settingsList');
    wrap.innerHTML = '';
    settings.phases.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'srow' + (p.enabled ? '' : ' off');

      const updown = document.createElement('div');
      updown.className = 'updown';
      const up = miniBtn('▲', i === 0, () => movePhase(i, -1));
      const down = miniBtn('▼', i === settings.phases.length - 1, () => movePhase(i, 1));
      updown.append(up, down);

      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = p.emoji + '  ' + p.label;

      const dur = document.createElement('div');
      dur.className = 'dur';
      const minus = miniBtn('−', p.minutes <= 1, () => changeMinutes(i, -1));
      const val = document.createElement('b');
      val.textContent = p.minutes + ' min';
      const plus = miniBtn('+', p.minutes >= 60, () => changeMinutes(i, 1));
      dur.append(minus, val, plus);

      const toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.className = 'switch';
      toggle.checked = p.enabled;
      toggle.addEventListener('change', () => togglePhase(i, toggle));

      row.append(updown, name, dur, toggle);
      wrap.appendChild(row);
    });
    $('soundToggle').checked = settings.soundOn;
    $('settingsTotal').textContent = 'Durée totale : ' + totalMinutes() + ' min';
  }

  function miniBtn(label, disabled, onTap) {
    const b = document.createElement('button');
    b.className = 'mini';
    b.textContent = label;
    b.disabled = disabled;
    b.addEventListener('click', onTap);
    return b;
  }

  function movePhase(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= settings.phases.length) return;
    const arr = settings.phases;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    saveSettings();
    renderSettings();
    renderHome();
  }

  function changeMinutes(i, delta) {
    settings.phases[i].minutes = clampMin(settings.phases[i].minutes + delta);
    saveSettings();
    renderSettings();
    renderHome();
  }

  function togglePhase(i, input) {
    const p = settings.phases[i];
    if (p.enabled && settings.phases.filter((x) => x.enabled).length === 1) {
      input.checked = true;
      toast('Il faut au moins une étape active');
      return;
    }
    p.enabled = !p.enabled;
    saveSettings();
    renderSettings();
    renderHome();
  }

  // ---------- Divers UI ----------

  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.hidden = false;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { el.hidden = true; }, 300);
    }, 2000);
  }

  function makeStars() {
    const wrap = $('stars');
    for (let i = 0; i < 36; i++) {
      const s = document.createElement('span');
      const size = 1 + Math.random() * 1.6;
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDuration = 1.8 + Math.random() * 2.4 + 's';
      s.style.animationDelay = -Math.random() * 4 + 's';
      wrap.appendChild(s);
    }
  }

  // ---------- Init ----------

  function init() {
    makeStars();

    $('btnStart').addEventListener('click', startRitual);
    $('btnSettings').addEventListener('click', () => { renderSettings(); showScreen('settings'); });
    $('btnBack').addEventListener('click', () => { renderHome(); showScreen('home'); });
    $('btnDefaults').addEventListener('click', () => {
      if (!confirm('Remettre les réglages par défaut ?')) return;
      settings = { phases: DEFAULT_PHASES.map((p) => ({ ...p })), soundOn: true };
      saveSettings();
      renderSettings();
      renderHome();
      toast('Réglages réinitialisés');
    });
    $('soundToggle').addEventListener('change', (e) => {
      settings.soundOn = e.target.checked;
      saveSettings();
    });
    $('btnPause').addEventListener('click', pauseToggle);
    $('btnSkip').addEventListener('click', skipPhase);
    $('btnStop').addEventListener('click', stopRitual);
    $('btnEndHome').addEventListener('click', () => { renderHome(); showScreen('home'); });

    renderHome();

    if (!resumeFromStorage()) showScreen('home');

    if ('serviceWorker' in navigator && !['localhost', '127.0.0.1'].includes(location.hostname)) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    if (SPEED !== 1) console.log('[dodo] mode test : vitesse x' + SPEED);
  }

  init();

})();
