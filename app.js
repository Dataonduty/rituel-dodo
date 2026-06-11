'use strict';

(() => {

  // ---------- Constantes ----------

  const COLORS = {
    pyjama: '#b9a7f2',
    histoire: '#f6c453',
    biberon: '#f3e9d2',
    dents: '#7fd8c8',
    calin: '#f2a2c0',
  };
  const FALLBACK_COLOR = '#cbd5ff';

  const DEFAULT_PHASES = [
    { id: 'pyjama', emoji: '👕', label: 'Pyjama', minutes: 5, enabled: true },
    { id: 'histoire', emoji: '📖', label: 'Histoire', minutes: 5, enabled: true },
    { id: 'biberon', emoji: '🍼', label: 'Biberon', minutes: 15, enabled: true },
    { id: 'dents', emoji: '🪥', label: 'Dents', minutes: 5, enabled: true },
    { id: 'calin', emoji: '🤗', label: 'Câlin', minutes: 5, enabled: true },
  ];

  // ---------- Traductions (10 langues les plus parlées) ----------

  const I18N = {
    fr: { name: 'Français', dir: 'ltr', s: {
      appTitle: 'Au dodo !', subtitle: 'Le rituel du coucher', start: 'Commencer le rituel',
      settings: 'Réglages', back: 'Retour', sounds: 'Sons', introAnim: 'Animation de départ',
      language: 'Langue', defaults: 'Valeurs par défaut', defaultsConfirm: 'Remettre les réglages par défaut ?',
      defaultsDone: 'Réglages réinitialisés', needOneStep: 'Il faut au moins une étape active',
      total: 'Durée totale : {n} min', minUnit: 'min', pause: 'Pause', resume: 'Reprendre',
      prevStep: 'Phase précédente', nextStep: 'Phase suivante', stop: 'Arrêter',
      stopConfirm: 'Arrêter le rituel ?', endTitle: 'Au dodo !', endMsg: 'Bonne nuit, fais de beaux rêves ✨',
      finish: 'Terminer', sleep: 'Au dodo !', tapSkip: "Touche l'écran pour passer",
      p_pyjama: 'Pyjama', p_histoire: 'Histoire', p_biberon: 'Biberon', p_dents: 'Dents', p_calin: 'Câlin',
    } },
    en: { name: 'English', dir: 'ltr', s: {
      appTitle: 'Bedtime!', subtitle: 'The bedtime routine', start: 'Start the routine',
      settings: 'Settings', back: 'Back', sounds: 'Sounds', introAnim: 'Opening animation',
      language: 'Language', defaults: 'Reset to defaults', defaultsConfirm: 'Reset all settings to defaults?',
      defaultsDone: 'Settings reset', needOneStep: 'At least one step must be active',
      total: 'Total time: {n} min', minUnit: 'min', pause: 'Pause', resume: 'Resume',
      prevStep: 'Previous step', nextStep: 'Next step', stop: 'Stop',
      stopConfirm: 'Stop the routine?', endTitle: 'Bedtime!', endMsg: 'Good night, sweet dreams ✨',
      finish: 'Done', sleep: 'Bedtime!', tapSkip: 'Tap to skip',
      p_pyjama: 'Pajamas', p_histoire: 'Story', p_biberon: 'Bottle', p_dents: 'Teeth', p_calin: 'Cuddle',
    } },
    zh: { name: '中文', dir: 'ltr', s: {
      appTitle: '睡觉啦！', subtitle: '睡前小仪式', start: '开始仪式',
      settings: '设置', back: '返回', sounds: '声音', introAnim: '开场动画',
      language: '语言', defaults: '恢复默认', defaultsConfirm: '要恢复默认设置吗？',
      defaultsDone: '已恢复默认设置', needOneStep: '至少要保留一个步骤',
      total: '总时长：{n} 分钟', minUnit: '分钟', pause: '暂停', resume: '继续',
      prevStep: '上一步', nextStep: '下一步', stop: '停止',
      stopConfirm: '要停止仪式吗？', endTitle: '睡觉啦！', endMsg: '晚安，做个好梦 ✨',
      finish: '完成', sleep: '睡觉啦！', tapSkip: '点击屏幕跳过',
      p_pyjama: '睡衣', p_histoire: '故事', p_biberon: '奶瓶', p_dents: '刷牙', p_calin: '抱抱',
    } },
    hi: { name: 'हिन्दी', dir: 'ltr', s: {
      appTitle: 'सोने का समय!', subtitle: 'सोने से पहले की रस्म', start: 'रस्म शुरू करें',
      settings: 'सेटिंग्स', back: 'वापस', sounds: 'आवाज़ें', introAnim: 'शुरुआती एनीमेशन',
      language: 'भाषा', defaults: 'डिफ़ॉल्ट सेटिंग्स', defaultsConfirm: 'सेटिंग्स डिफ़ॉल्ट पर वापस करें?',
      defaultsDone: 'सेटिंग्स रीसेट हो गईं', needOneStep: 'कम से कम एक चरण चालू होना चाहिए',
      total: 'कुल समय: {n} मिनट', minUnit: 'मिनट', pause: 'विराम', resume: 'जारी रखें',
      prevStep: 'पिछला चरण', nextStep: 'अगला चरण', stop: 'बंद करें',
      stopConfirm: 'रस्म बंद करें?', endTitle: 'सोने का समय!', endMsg: 'शुभ रात्रि, मीठे सपने ✨',
      finish: 'पूरा हुआ', sleep: 'सोने का समय!', tapSkip: 'छोड़ने के लिए स्क्रीन छुएँ',
      p_pyjama: 'पजामा', p_histoire: 'कहानी', p_biberon: 'दूध की बोतल', p_dents: 'दाँत', p_calin: 'झप्पी',
    } },
    es: { name: 'Español', dir: 'ltr', s: {
      appTitle: '¡A dormir!', subtitle: 'La rutina para ir a dormir', start: 'Empezar la rutina',
      settings: 'Ajustes', back: 'Volver', sounds: 'Sonidos', introAnim: 'Animación inicial',
      language: 'Idioma', defaults: 'Valores por defecto', defaultsConfirm: '¿Restablecer los ajustes?',
      defaultsDone: 'Ajustes restablecidos', needOneStep: 'Debe haber al menos una etapa activa',
      total: 'Duración total: {n} min', minUnit: 'min', pause: 'Pausa', resume: 'Reanudar',
      prevStep: 'Etapa anterior', nextStep: 'Etapa siguiente', stop: 'Detener',
      stopConfirm: '¿Detener la rutina?', endTitle: '¡A dormir!', endMsg: 'Buenas noches, dulces sueños ✨',
      finish: 'Terminar', sleep: '¡A dormir!', tapSkip: 'Toca la pantalla para saltar',
      p_pyjama: 'Pijama', p_histoire: 'Cuento', p_biberon: 'Biberón', p_dents: 'Dientes', p_calin: 'Mimos',
    } },
    ar: { name: 'العربية', dir: 'rtl', s: {
      appTitle: 'وقت النوم!', subtitle: 'روتين النوم', start: 'ابدأ الروتين',
      settings: 'الإعدادات', back: 'رجوع', sounds: 'الأصوات', introAnim: 'مقدمة متحركة',
      language: 'اللغة', defaults: 'استعادة الإعدادات الافتراضية', defaultsConfirm: 'هل تريد استعادة الإعدادات الافتراضية؟',
      defaultsDone: 'تمت استعادة الإعدادات', needOneStep: 'يجب أن تبقى خطوة واحدة مفعّلة على الأقل',
      total: 'المدة الكلية: {n} دقيقة', minUnit: 'دقيقة', pause: 'إيقاف مؤقت', resume: 'متابعة',
      prevStep: 'الخطوة السابقة', nextStep: 'الخطوة التالية', stop: 'إنهاء',
      stopConfirm: 'هل تريد إنهاء الروتين؟', endTitle: 'وقت النوم!', endMsg: 'تصبح على خير، أحلامًا سعيدة ✨',
      finish: 'تم', sleep: 'وقت النوم!', tapSkip: 'المس الشاشة للتخطي',
      p_pyjama: 'البيجاما', p_histoire: 'قصة', p_biberon: 'الرضّاعة', p_dents: 'الأسنان', p_calin: 'حضن',
    } },
    bn: { name: 'বাংলা', dir: 'ltr', s: {
      appTitle: 'ঘুমের সময়!', subtitle: 'ঘুমানোর আগের রুটিন', start: 'রুটিন শুরু করুন',
      settings: 'সেটিংস', back: 'ফিরে যান', sounds: 'শব্দ', introAnim: 'শুরুর অ্যানিমেশন',
      language: 'ভাষা', defaults: 'ডিফল্ট সেটিংস', defaultsConfirm: 'সেটিংস ডিফল্টে ফেরাবেন?',
      defaultsDone: 'সেটিংস রিসেট হয়েছে', needOneStep: 'অন্তত একটি ধাপ চালু থাকতে হবে',
      total: 'মোট সময়: {n} মিনিট', minUnit: 'মিনিট', pause: 'বিরতি', resume: 'চালিয়ে যান',
      prevStep: 'আগের ধাপ', nextStep: 'পরের ধাপ', stop: 'বন্ধ করুন',
      stopConfirm: 'রুটিন বন্ধ করবেন?', endTitle: 'ঘুমের সময়!', endMsg: 'শুভ রাত্রি, মিষ্টি স্বপ্ন ✨',
      finish: 'শেষ', sleep: 'ঘুমের সময়!', tapSkip: 'এড়িয়ে যেতে স্ক্রিনে চাপ দিন',
      p_pyjama: 'পায়জামা', p_histoire: 'গল্প', p_biberon: 'দুধের বোতল', p_dents: 'দাঁত', p_calin: 'আদর',
    } },
    pt: { name: 'Português', dir: 'ltr', s: {
      appTitle: 'Hora de dormir!', subtitle: 'A rotina de dormir', start: 'Começar a rotina',
      settings: 'Configurações', back: 'Voltar', sounds: 'Sons', introAnim: 'Animação inicial',
      language: 'Idioma', defaults: 'Restaurar padrões', defaultsConfirm: 'Restaurar as configurações padrão?',
      defaultsDone: 'Configurações restauradas', needOneStep: 'É preciso pelo menos uma etapa ativa',
      total: 'Duração total: {n} min', minUnit: 'min', pause: 'Pausa', resume: 'Retomar',
      prevStep: 'Etapa anterior', nextStep: 'Próxima etapa', stop: 'Parar',
      stopConfirm: 'Parar a rotina?', endTitle: 'Hora de dormir!', endMsg: 'Boa noite, bons sonhos ✨',
      finish: 'Concluir', sleep: 'Hora de dormir!', tapSkip: 'Toque na tela para pular',
      p_pyjama: 'Pijama', p_histoire: 'História', p_biberon: 'Mamadeira', p_dents: 'Dentes', p_calin: 'Carinho',
    } },
    ru: { name: 'Русский', dir: 'ltr', s: {
      appTitle: 'Пора спать!', subtitle: 'Вечерний ритуал', start: 'Начать ритуал',
      settings: 'Настройки', back: 'Назад', sounds: 'Звуки', introAnim: 'Анимация в начале',
      language: 'Язык', defaults: 'Сбросить настройки', defaultsConfirm: 'Вернуть настройки по умолчанию?',
      defaultsDone: 'Настройки сброшены', needOneStep: 'Нужен хотя бы один активный этап',
      total: 'Общее время: {n} мин', minUnit: 'мин', pause: 'Пауза', resume: 'Продолжить',
      prevStep: 'Предыдущий этап', nextStep: 'Следующий этап', stop: 'Стоп',
      stopConfirm: 'Завершить ритуал?', endTitle: 'Пора спать!', endMsg: 'Спокойной ночи, сладких снов ✨',
      finish: 'Готово', sleep: 'Пора спать!', tapSkip: 'Коснитесь экрана, чтобы пропустить',
      p_pyjama: 'Пижама', p_histoire: 'Сказка', p_biberon: 'Бутылочка', p_dents: 'Зубки', p_calin: 'Обнимашки',
    } },
    ur: { name: 'اردو', dir: 'rtl', s: {
      appTitle: 'سونے کا وقت!', subtitle: 'سونے کا معمول', start: 'معمول شروع کریں',
      settings: 'ترتیبات', back: 'واپس', sounds: 'آوازیں', introAnim: 'شروع کی اینیمیشن',
      language: 'زبان', defaults: 'ڈیفالٹ ترتیبات', defaultsConfirm: 'ترتیبات ڈیفالٹ پر واپس کریں؟',
      defaultsDone: 'ترتیبات ری سیٹ ہو گئیں', needOneStep: 'کم از کم ایک مرحلہ فعال ہونا چاہیے',
      total: 'کل وقت: {n} منٹ', minUnit: 'منٹ', pause: 'وقفہ', resume: 'جاری رکھیں',
      prevStep: 'پچھلا مرحلہ', nextStep: 'اگلا مرحلہ', stop: 'بند کریں',
      stopConfirm: 'معمول بند کریں؟', endTitle: 'سونے کا وقت!', endMsg: 'شب بخیر، میٹھے خواب ✨',
      finish: 'مکمل', sleep: 'سونے کا وقت!', tapSkip: 'چھوڑنے کے لیے اسکرین چھوئیں',
      p_pyjama: 'پاجامہ', p_histoire: 'کہانی', p_biberon: 'فیڈر', p_dents: 'دانت', p_calin: 'پیار',
    } },
  };

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
  let flipStartedAt = 0;
  let flipNewColor = null;

  const $ = (id) => document.getElementById(id);

  // ---------- i18n ----------

  function t(key) {
    const pack = I18N[settings && settings.lang] || I18N.fr;
    const v = pack.s[key];
    return v != null ? v : (I18N.fr.s[key] != null ? I18N.fr.s[key] : key);
  }

  const phaseLabel = (p) => t('p_' + p.id) !== 'p_' + p.id ? t('p_' + p.id) : p.label;

  function soundEnabled() {
    return run ? run.soundOn !== false : settings.soundOn !== false;
  }

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
      // Les nouvelles étapes par défaut s'insèrent à leur position d'origine
      DEFAULT_PHASES.forEach((d, idx) => {
        if (!phases.some((p) => p.id === d.id)) phases.splice(Math.min(idx, phases.length), 0, { ...d });
      });
      if (!phases.some((p) => p.enabled)) phases[0].enabled = true;
      return {
        phases,
        soundOn: raw.soundOn !== false,
        introOn: raw.introOn !== false,
        lang: I18N[raw.lang] ? raw.lang : 'fr',
      };
    } catch {
      return { phases: DEFAULT_PHASES.map((p) => ({ ...p })), soundOn: true, introOn: true, lang: 'fr' };
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
    if (!active.length) { toast(t('needOneStep')); return; }
    ensureAudio();
    if (settings.introOn) playIntro(active, beginRun);
    else beginRun();
  }

  // ---------- Intro animée : récapitule les étapes jusqu'au dodo ----------

  let introTimer = 0;
  let introDone = null;

  function playIntro(phases, done) {
    const steps = phases
      .map((p) => ({ emoji: p.emoji, label: phaseLabel(p), color: colorOf(p) }))
      .concat([{ emoji: '🌙', label: t('sleep'), color: '#f6e7b0' }]);

    const ov = $('intro');
    const dots = $('introDots');
    dots.innerHTML = '';
    steps.forEach(() => dots.appendChild(document.createElement('span')));
    $('introHint').textContent = t('tapSkip');
    ov.classList.remove('out');
    ov.hidden = false;
    introDone = done;

    let i = -1;
    const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const showStep = () => {
      i++;
      if (i >= steps.length) { closeIntro(); return; }
      const s = steps[i];
      $('introEmoji').textContent = s.emoji;
      $('introLabel').textContent = s.label;
      $('introLabel').style.color = s.color;
      const card = $('introCard');
      card.classList.remove('pop');
      void card.offsetWidth;
      card.classList.add('pop');
      [...dots.children].forEach((d, j) => {
        d.classList.toggle('on', j === i);
        d.classList.toggle('past', j < i);
      });
      if (soundEnabled()) tone(NOTES[i % NOTES.length], 0, 0.6, 0.11);
      clearTimeout(introTimer);
      introTimer = setTimeout(showStep, i === steps.length - 1 ? 2100 : 1500);
    };
    showStep();
  }

  function closeIntro() {
    clearTimeout(introTimer);
    const done = introDone;
    introDone = null;
    const ov = $('intro');
    if (ov.hidden) return;
    ov.classList.add('out');
    setTimeout(() => { ov.hidden = true; ov.classList.remove('out'); }, 240);
    if (done) done();
  }

  function beginRun() {
    const active = settings.phases.filter((p) => p.enabled);
    if (!active.length) return;
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
      const prevIdx = curIdx;
      curIdx = idx;
      onPhaseChange(prevIdx === -1, prevIdx !== -1 && idx < prevIdx);
    }
    if (flipping && Date.now() - flipStartedAt > FLIP_MS + 300) endFlip();
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

  function onPhaseChange(isStart, backward) {
    const p = schedule.phases[curIdx];
    const color = colorOf(p);
    $('phaseEmoji').textContent = p.emoji;
    $('phaseLabel').textContent = phaseLabel(p);
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
      startFlip(color, backward);
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
    $('btnPause').title = paused ? t('resume') : t('pause');
  }

  function skipPhase() {
    if (!run || curIdx < 0) return;
    const v = vNow();
    const end = schedule.cumStart[curIdx] + schedule.dur[curIdx];
    run.skipOffset += Math.max(0, end - v);
    saveRun();
  }

  function prevPhase() {
    if (!run || curIdx < 0) return;
    const v = vNow();
    const targetIdx = Math.max(0, curIdx - 1);
    run.skipOffset -= v - schedule.cumStart[targetIdx];
    saveRun();
    if (targetIdx === curIdx) {
      // Déjà sur la première étape : on la redémarre
      chime();
      startFlip(colorOf(schedule.phases[curIdx]), true);
    }
  }

  function stopRitual() {
    if (!confirm(t('stopConfirm'))) return;
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

  function startFlip(newColor, backward) {
    flipping = true;
    flipStartedAt = Date.now();
    flipNewColor = newColor;
    $('screen-ritual').classList.add('flipping');
    $('stream').setAttribute('height', 0);
    const hg = $('hourglass');
    hg.classList.remove('flip', 'flip-back');
    void hg.getBoundingClientRect(); // force le redémarrage de la transition
    hg.classList.add(backward ? 'flip-back' : 'flip');
    clearTimeout(flipTimer);
    flipTimer = setTimeout(endFlip, FLIP_MS + 50);
  }

  // Fin de rotation : appelée par le timer, ou par la boucle de tick si le
  // timer a été étranglé (page cachée, téléphone verrouillé pendant le flip).
  function endFlip() {
    if (!flipping) return;
    clearTimeout(flipTimer);
    $('hourglass').classList.remove('flip', 'flip-back'); // retour instantané à 0° : silhouette identique (symétrie)
    $('screen-ritual').classList.remove('flipping');
    if (flipNewColor) setSandColor(flipNewColor);
    flipping = false;
    if (run) renderSand(Math.max(0, vNow()));
  }

  function cancelFlip() {
    clearTimeout(flipTimer);
    flipping = false;
    flipNewColor = null;
    $('hourglass').classList.remove('flip', 'flip-back');
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
    if (!soundEnabled()) return;
    ensureAudio();
    tone(659.25, 0, 1.1, 0.15);   // mi5
    tone(783.99, 0.22, 1.3, 0.12); // sol5
  }

  function lullaby() {
    if (!soundEnabled()) return;
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
      label.textContent = phaseLabel(p);
      const min = document.createElement('span');
      min.className = 'pl-min';
      min.textContent = p.minutes + ' ' + t('minUnit');
      li.append(dot, emoji, label, min);
      list.appendChild(li);
    });
    $('homeTotal').textContent = t('total').replace('{n}', totalMinutes());
  }

  function applyLang() {
    const pack = I18N[settings.lang] || I18N.fr;
    document.documentElement.lang = settings.lang;
    document.documentElement.dir = pack.dir;
    document.title = t('appTitle') + ' — ' + t('subtitle');
    $('homeTitle').textContent = t('appTitle');
    $('homeSub').textContent = t('subtitle');
    $('btnStart').textContent = '🌙  ' + t('start');
    $('btnSettings').textContent = '⚙️  ' + t('settings');
    $('settingsTitle').textContent = t('settings');
    $('btnBack').textContent = (pack.dir === 'rtl' ? '→ ' : '← ') + t('back');
    $('lblSounds').textContent = t('sounds');
    $('lblIntro').textContent = t('introAnim');
    $('lblLang').textContent = t('language');
    $('btnDefaults').textContent = t('defaults');
    $('endTitle').textContent = t('endTitle');
    $('endMsg').textContent = t('endMsg');
    $('btnEndHome').textContent = t('finish');
    $('pauseOverlay').textContent = '⏸ ' + t('pause');
    $('btnPrev').title = t('prevStep');
    $('btnSkip').title = t('nextStep');
    $('btnStop').title = t('stop');
    $('langSelect').value = settings.lang;
    renderHome();
    renderSettings();
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
      name.textContent = p.emoji + '  ' + phaseLabel(p);

      const dur = document.createElement('div');
      dur.className = 'dur';
      const minus = miniBtn('−', p.minutes <= 1, () => changeMinutes(i, -1));
      const val = document.createElement('b');
      val.textContent = p.minutes + ' ' + t('minUnit');
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
    $('introToggle').checked = settings.introOn;
    $('settingsTotal').textContent = t('total').replace('{n}', totalMinutes());
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
      toast(t('needOneStep'));
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
      if (!confirm(t('defaultsConfirm'))) return;
      settings = { phases: DEFAULT_PHASES.map((p) => ({ ...p })), soundOn: true, introOn: true, lang: settings.lang };
      saveSettings();
      renderSettings();
      renderHome();
      toast(t('defaultsDone'));
    });
    $('soundToggle').addEventListener('change', (e) => {
      settings.soundOn = e.target.checked;
      saveSettings();
    });
    $('introToggle').addEventListener('change', (e) => {
      settings.introOn = e.target.checked;
      saveSettings();
    });
    const sel = $('langSelect');
    Object.keys(I18N).forEach((code) => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = I18N[code].name;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      settings.lang = I18N[sel.value] ? sel.value : 'fr';
      saveSettings();
      applyLang();
    });
    $('intro').addEventListener('click', closeIntro);
    $('btnPause').addEventListener('click', pauseToggle);
    $('btnPrev').addEventListener('click', prevPhase);
    $('btnSkip').addEventListener('click', skipPhase);
    $('btnStop').addEventListener('click', stopRitual);
    $('btnEndHome').addEventListener('click', () => { renderHome(); showScreen('home'); });

    applyLang();

    if (!resumeFromStorage()) showScreen('home');

    if ('serviceWorker' in navigator && !['localhost', '127.0.0.1'].includes(location.hostname)) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    if (SPEED !== 1) {
      // Hook de test : permet de forcer un tick quand les timers sont étranglés
      window.__dodo = { tick: tickOnce, endFlip, closeIntro };
      console.log('[dodo] mode test : vitesse x' + SPEED);
    }
  }

  init();

})();
