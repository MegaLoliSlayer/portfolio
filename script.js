// ─── Typewriter Utility ──────────────────────────────────────
// Appends text to an element one character at a time.
// Returns a Promise that resolves when typing is complete.
function typeText(element, text, speed = 40) {
  return new Promise(resolve => {
    let i = 0;
    const interval = setInterval(() => {
      element.insertAdjacentText('beforeend', text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

// Resolves after a given number of milliseconds.
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Right Panel Layout ───────────────────────────────────────
function updateLainWidth() {
  const lain8 = document.getElementById('lain8');
  if (lain8 && lain8.offsetWidth) {
    document.documentElement.style.setProperty('--lain-w', lain8.offsetWidth + 'px');
  }
}

// ─── Window Focus Management ──────────────────────────────────
let topZ = 20;
let terminalProcessing = false;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
}
function bringToFront(el) {
  el.style.zIndex = ++topZ;
}

function getRightPanel() {
  return document.getElementById('right-panel');
}

function updateTaskbar() {
  const states = {
    'tb-terminal':    document.querySelector('.terminal-window').classList.contains('visible'),
    'tb-connections': document.getElementById('connections-sidebar').classList.contains('visible'),
    'tb-music':       document.getElementById('music-panel').classList.contains('visible'),
    'tb-tv':          document.getElementById('tv-panel').classList.contains('visible'),
    'tb-background':  document.getElementById('bg-picker').classList.contains('visible'),
    'tb-about':       document.getElementById('about-panel').classList.contains('visible'),
    'tb-sysmon':      document.getElementById('sysmon-panel').classList.contains('visible'),
  };
  Object.entries(states).forEach(([id, active]) => {
    document.getElementById(id).classList.toggle('active', active);
  });
}

function closeTerminal() {
  document.querySelector('.terminal-window').classList.remove('visible');
  updateTaskbar();
}

function taskbarToggleTerminal() {
  const win = document.querySelector('.terminal-window');
  if (win.classList.contains('visible')) {
    win.classList.remove('visible');
  } else {
    win.style.cssText = '';
    win.classList.add('visible');
    const out = getOutput();
    out.textContent = '';
    printHelp();
  }
  updateTaskbar();
}

// ─── Background GIFs ─────────────────────────────────────────
const BACKGROUND_FILES = [
  'lain1.webp', 'lain10.gif', 'lain11.gif', 'lain13.gif',
  'lain16.gif', 'lain17.gif', 'lain20.gif', 'lain25.gif',
  'lain29.gif', 'lain3.gif',  'lain4.gif',  'lain6.gif',
  'lain7.gif',
].map(f => 'background/' + f);

// ─── TV Channel GIFs ─────────────────────────────────────────
const TV_FILES = [
  'lain1.webp', 'lain10.gif', 'lain11.gif', 'lain12.gif',
  'lain13.gif', 'lain14.gif', 'lain15.gif', 'lain16.gif',
  'lain17.gif', 'lain18.gif', 'lain19.gif', 'lain2.gif',
  'lain20.gif', 'lain21.gif', 'lain22.gif', 'lain23.gif',
  'lain24.gif', 'lain25.gif', 'lain26.gif', 'lain27.gif',
  'lain29.gif', 'lain3.gif',  'lain30.gif', 'lain31.gif',
  'lain4.gif',  'lain6.gif',  'lain7.gif',  'lain9.gif',
].map(f => 'TV/' + f);

// ─── Wired Chatter Messages ───────────────────────────────────
const WIRED_MESSAGES = [
  '[wired] packet loss detected on layer 7',
  '[wired] protocol 7 handshake initiated...',
  '[wired] knights are watching',
  '[wired] present day, present time...',
  '[wired] anonymous node pinged you',
  '[wired] memory leak in /dev/self',
  '[wired] no such thing as offline',
  '[wired] schumann resonance unstable',
  '[wired] god is in the network',
  '[wired] close the world, open the nExt',
  '[wired] you are already connected',
];

// ─── Lain Dialog Lines ────────────────────────────────────────
const LAIN_DIALOGS = [
  'You found me again.',
  'The wired runs deeper\nthan you know.',
  'Are you really here\nright now?',
  'God lives in the wired.',
  'Where does your body end\nand the data begin?',
  "You've been watching me\nfor a while now.",
  'Do you exist if no one\nconnects to you?',
  'Memory is just data.\nData is just memory.',
  'Present day.\nPresent time.',
  'Everyone is already\nconnected.',
  'The flesh is just\nan interface.',
  'Close the world.\nOpen the next.',
  'I am everywhere.',
  "You can hear me,\ncan't you?",
];


// ─── Lain Side Interactivity ──────────────────────────────────
function initLainSide() {
  const lain8      = document.getElementById('lain8');
  lain8.addEventListener('load', updateLainWidth);
  updateLainWidth(); // in case already loaded (cached)
  // Retry a few times in case the image decodes after first layout pass
  [50, 150, 400, 900].forEach(ms => setTimeout(updateLainWidth, ms));
  if (lain8.decode) lain8.decode().then(updateLainWidth).catch(() => {});
  const bubble     = document.getElementById('lain-bubble');
  const bubbleText = document.getElementById('lain-bubble-text');

  let closeTimer = null;
  let lastIndex  = -1;

  function showDialog() {
    let idx;
    do { idx = Math.floor(Math.random() * LAIN_DIALOGS.length); }
    while (idx === lastIndex && LAIN_DIALOGS.length > 1);
    lastIndex = idx;

    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }

    bubbleText.textContent = LAIN_DIALOGS[idx];
    bubble.classList.add('visible');

    closeTimer = setTimeout(() => {
      bubble.classList.remove('visible');
      closeTimer = null;
    }, 5000);
  }

  lain8.addEventListener('click', (e) => {
    e.stopPropagation();
    showDialog();
  });
}

// ─── Connections Sidebar ──────────────────────────────────────
function initConnectionsSidebar() {
  const sidebar = document.getElementById('connections-sidebar');
  const body    = document.getElementById('conn-body');

  // Populate links
  LINKS.forEach(link => {
    const a = document.createElement('a');
    a.className   = 'conn-link';
    a.href        = link.url;
    a.target      = '_blank';
    a.rel         = 'noopener noreferrer';
    a.textContent = link.label;
    body.appendChild(a);
  });

  // Focus management
  sidebar.addEventListener('mousedown', () => bringToFront(sidebar));
}

function toggleConnectionsSidebar() {
  const sidebar = document.getElementById('connections-sidebar');
  sidebar.classList.toggle('visible');
  if (sidebar.classList.contains('visible')) bringToFront(sidebar);
  updateTaskbar();
}

// ─── Background Picker ────────────────────────────────────────
let activeBg = 'background/lain3.gif';

function initBgPicker() {
  const picker   = document.getElementById('bg-picker');
  const grid     = document.getElementById('picker-grid');
  const titlebar = picker.querySelector('.picker-titlebar');

  // Populate grid
  BACKGROUND_FILES.forEach(path => {
    const name = path.replace('background/', '');
    const cell = document.createElement('div');
    cell.className   = 'picker-cell';
    cell.textContent = name;
    if (path === activeBg) cell.classList.add('active');
    cell.addEventListener('click', () => {
      activeBg = path;
      document.getElementById('right-bg').src = path;
      grid.querySelectorAll('.picker-cell').forEach(c => c.classList.remove('active'));
      cell.classList.add('active');
    });
    grid.appendChild(cell);
  });

  // Focus management
  picker.addEventListener('mousedown', () => bringToFront(picker));

  // Drag
  let dragging = false, ox = 0, oy = 0;

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('picker-close')) return;
    dragging = true;
    const rect   = picker.getBoundingClientRect();
    const rpRect = getRightPanel().getBoundingClientRect();
    picker.style.transform = 'none';
    picker.style.top  = (rect.top  - rpRect.top)  / stageScale + 'px';
    picker.style.left = (rect.left - rpRect.left) / stageScale + 'px';
    ox = (e.clientX - rect.left) / stageScale;
    oy = (e.clientY - rect.top)  / stageScale;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rp = getRightPanel();
    const rpRect = rp.getBoundingClientRect();
    const x = Math.max(0, Math.min((e.clientX - rpRect.left) / stageScale - ox, rp.offsetWidth  - picker.offsetWidth));
    const y = Math.max(0, Math.min((e.clientY - rpRect.top)  / stageScale - oy, rp.offsetHeight - picker.offsetHeight - 40));
    picker.style.left = x + 'px';
    picker.style.top  = y + 'px';
  });

  document.addEventListener('mouseup', () => { dragging = false; });
}

function toggleBgPicker() {
  const picker = document.getElementById('bg-picker');
  picker.classList.toggle('visible');
  if (picker.classList.contains('visible')) {
    bringToFront(picker);
    // Re-center if not yet dragged
    if (!picker.style.left) {
      picker.style.transform = 'translate(-50%, -50%)';
    }
  }
  updateTaskbar();
}

// ─── TV Panel ────────────────────────────────────────────────
let tvIndex = 0;
let tvTimer = null;

function updateTvChannel() {
  document.getElementById('tv-channel').textContent =
    'CH ' + String(tvIndex + 1).padStart(2, '0');
}

function setTvFrame(idx) {
  tvIndex = (idx + TV_FILES.length) % TV_FILES.length;
  document.getElementById('tv-img').src = TV_FILES[tvIndex];
  updateTvChannel();
}

function tvNext() { setTvFrame(tvIndex + 1); resetTvTimer(); }
function tvPrev() { setTvFrame(tvIndex - 1); resetTvTimer(); }

function resetTvTimer() {
  if (tvTimer) clearInterval(tvTimer);
  tvTimer = setInterval(() => setTvFrame(tvIndex + 1), 4000);
}

function closeTvPanel() {
  document.getElementById('tv-panel').classList.remove('visible');
  updateTaskbar();
}

function taskbarToggleTv() {
  const panel = document.getElementById('tv-panel');
  const wasVisible = panel.classList.contains('visible');
  if (wasVisible) {
    panel.classList.remove('visible');
  } else {
    panel.style.cssText = '';
    delete panel.dataset.savedWidth;
    delete panel.dataset.savedHeight;
    panel.classList.add('visible');
  }
  updateTaskbar();
}

function toggleTvMinimize() {
  const panel = document.getElementById('tv-panel');
  if (panel.classList.contains('minimized')) return;
  panel.dataset.savedWidth  = panel.offsetWidth  + 'px';
  panel.dataset.savedHeight = panel.offsetHeight + 'px';
  panel.style.width  = panel.offsetWidth + 'px';
  panel.style.height = panel.querySelector('.tv-titlebar').offsetHeight + 'px';
  panel.classList.add('minimized');
}

function expandTvPanel() {
  const panel = document.getElementById('tv-panel');
  if (!panel.classList.contains('minimized')) return;
  panel.classList.remove('minimized');
  panel.style.width  = panel.dataset.savedWidth  || '';
  panel.style.height = panel.dataset.savedHeight || '';
}

function initTvPanel() {
  setTvFrame(0);
  resetTvTimer();

  const panel    = document.getElementById('tv-panel');
  panel.addEventListener('mousedown', () => bringToFront(panel));

  const titlebar = panel.querySelector('.tv-titlebar');
  let dragging = false, ox = 0, oy = 0;

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('tv-dot')) return;
    dragging = true;
    const rect   = panel.getBoundingClientRect();
    const rpRect = getRightPanel().getBoundingClientRect();
    panel.style.right = 'auto';
    panel.style.top   = (rect.top  - rpRect.top)  / stageScale + 'px';
    panel.style.left  = (rect.left - rpRect.left) / stageScale + 'px';
    ox = (e.clientX - rect.left) / stageScale;
    oy = (e.clientY - rect.top)  / stageScale;
    panel.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rp = getRightPanel();
    const rpRect = rp.getBoundingClientRect();
    const x = Math.max(0, Math.min((e.clientX - rpRect.left) / stageScale - ox, rp.offsetWidth  - panel.offsetWidth));
    const y = Math.max(0, Math.min((e.clientY - rpRect.top)  / stageScale - oy, rp.offsetHeight - panel.offsetHeight - 40));
    panel.style.left = x + 'px';
    panel.style.top  = y + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    panel.classList.remove('dragging');
  });
}

// ─── Terminal Window Controls ─────────────────────────────────
function minimizeTerminal() {
  const win = document.querySelector('.terminal-window');
  if (win.classList.contains('minimized')) return;
  win.dataset.savedWidth  = win.offsetWidth  + 'px';
  win.dataset.savedHeight = win.offsetHeight + 'px';
  win.style.width  = win.offsetWidth + 'px';
  win.style.height = win.querySelector('.terminal-titlebar').offsetHeight + 'px';
  win.classList.add('minimized');
}

function restoreTerminal() {
  const win = document.querySelector('.terminal-window');
  if (!win.classList.contains('minimized')) return;
  win.classList.remove('minimized');
  win.style.width  = win.dataset.savedWidth  || '';
  win.style.height = win.dataset.savedHeight || '';
}

function initTerminalDrag() {
  const win      = document.querySelector('.terminal-window');
  const titlebar = win.querySelector('.terminal-titlebar');
  let dragging = false, ox = 0, oy = 0;

  win.addEventListener('mousedown', () => bringToFront(win));

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('terminal-dot')) return;
    dragging = true;
    const rect   = win.getBoundingClientRect();
    const rpRect = getRightPanel().getBoundingClientRect();
    win.style.position  = 'absolute';
    win.style.transform = 'none';
    win.style.left = (rect.left - rpRect.left) / stageScale + 'px';
    win.style.top  = (rect.top  - rpRect.top)  / stageScale + 'px';
    ox = (e.clientX - rect.left) / stageScale;
    oy = (e.clientY - rect.top)  / stageScale;
    win.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rp = getRightPanel();
    const rpRect = rp.getBoundingClientRect();
    const x = Math.max(0, Math.min((e.clientX - rpRect.left) / stageScale - ox, rp.offsetWidth  - win.offsetWidth));
    const y = Math.max(0, Math.min((e.clientY - rpRect.top)  / stageScale - oy, rp.offsetHeight - win.offsetHeight - 40));
    win.style.left = x + 'px';
    win.style.top  = y + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    win.classList.remove('dragging');
  });
}

// ─── Platform Links ───────────────────────────────────────────
const LINKS = [
  { name: 'GitHub',       label: '[01] GitHub',        url: 'https://github.com/MegaLoliSlayer' },
  { name: 'Steam',        label: '[02] Steam',         url: 'https://steamcommunity.com/id/MegaLoliSlayer/' },
  { name: 'NetEase',      label: '[03] NetEase Music', url: 'https://music.163.com/playlist?id=2970962753&uct2=U2FsdGVkX18R6AjtMreh49ZCQBC5vxa9J6phSrEPocg=' },
  { name: 'MyAnimeList',  label: '[04] MyAnimeList',   url: 'https://myanimelist.net/profile/MegaLoliSlayer' },
  { name: 'Spotify',      label: '[05] Spotify',       url: 'https://open.spotify.com/playlist/4MWZmsObrlhg0dBGmSu1b6' },
  { name: 'PlayStation',  label: '[06] PlayStation',   url: 'https://profile.playstation.com/MEGA_Dropkick2' },
];

// ─── Lain ASCII Art ───────────────────────────────────────────
const LAIN_ASCII = [
  '     _           _            ',
  '    | |   __ _  (_)  _ __     ',
  "    | |  / _` | | | | '_ \\  ",
  '    | | | (_| | | | | | | |   ',
  '    |_|  \\__,_| |_| |_| |_|  ',
  '',
  '    Serial Experiments Lain   ',
  '    ─────────────────────     ',
  '    Layer 07 :: The Wired     ',
  '',
  '    "No matter where you go,  ',
  '     everyone is connected."  ',
  '',
  '    present day, present time.',
  '    ha  ha  ha.               ',
];

// ─── Terminal Helpers ─────────────────────────────────────────
function getOutput() { return document.getElementById('terminal-output'); }

function scrollTerminal() {
  const body = document.querySelector('.terminal-body');
  if (body) body.scrollTop = body.scrollHeight;
}

async function printHelp() {
  const out = getOutput();
  const lines = [
    '──────────────────────────────────────────────',
    '  help              show this message',
    '  about             print about_me',
    '  ls ./connections  list profile links',
    '  vim [name]        open profile page',
    '                    e.g. vim GitHub',
    '  Hello Lain        ???',
    '  clear             clear terminal',
    '  music             toggle music player',
    '  tv                toggle WIRED TV',
    '  background        list background GIFs',
    '  background [name] set right background',
    '──────────────────────────────────────────────',
  ];
  for (const line of lines) {
    out.insertAdjacentText('beforeend', line + '\n');
    scrollTerminal();
    await wait(35);
  }
}

async function printLinks() {
  const out = getOutput();
  for (const link of LINKS) {
    const anchor = document.createElement('a');
    anchor.className   = 'term-link';
    anchor.href        = link.url;
    anchor.target      = '_blank';
    anchor.rel         = 'noopener noreferrer';
    anchor.textContent = link.label;
    out.appendChild(anchor);
    out.insertAdjacentText('beforeend', '\n');
    scrollTerminal();
    await wait(60);
  }
}

async function printLainArt() {
  const out = getOutput();
  for (const line of LAIN_ASCII) {
    out.insertAdjacentText('beforeend', line + '\n');
    scrollTerminal();
    await wait(30);
  }
}

function showPrompt() {
  const line = document.getElementById('input-line');
  line.style.display = 'flex';
  document.getElementById('terminal-input').focus();
  scrollTerminal();
}

function hidePrompt() {
  document.getElementById('input-line').style.display = 'none';
}

// ─── Music Panel ──────────────────────────────────────────────

function toggleMusicPanel() {
  const panel = document.getElementById('music-panel');
  if (panel.classList.contains('visible')) {
    panel.classList.remove('visible');
  } else {
    panel.style.cssText = '';
    panel.classList.add('visible');
  }
  updateTaskbar();
}

function toggleAboutPanel() {
  const panel = document.getElementById('about-panel');
  if (panel.classList.contains('visible')) {
    panel.classList.remove('visible');
  } else {
    panel.style.cssText = '';
    delete panel.dataset.savedWidth;
    delete panel.dataset.savedHeight;
    panel.classList.remove('minimized');
    panel.classList.add('visible');
    bringToFront(panel);
  }
  updateTaskbar();
}

function closeAboutPanel() {
  document.getElementById('about-panel').classList.remove('visible');
  updateTaskbar();
}

function minimizeAboutPanel() {
  const panel = document.getElementById('about-panel');
  if (panel.classList.contains('minimized')) return;
  panel.dataset.savedWidth  = panel.offsetWidth  + 'px';
  panel.dataset.savedHeight = panel.offsetHeight + 'px';
  panel.style.width  = panel.offsetWidth + 'px';
  panel.style.height = panel.querySelector('.about-titlebar').offsetHeight + 'px';
  panel.classList.add('minimized');
}

function expandAboutPanel() {
  const panel = document.getElementById('about-panel');
  if (!panel.classList.contains('minimized')) return;
  panel.classList.remove('minimized');
  panel.style.width  = panel.dataset.savedWidth  || '';
  panel.style.height = panel.dataset.savedHeight || '';
}

function initAboutPanel() {
  const panel = document.getElementById('about-panel');
  panel.addEventListener('mousedown', () => bringToFront(panel));

  const titlebar = panel.querySelector('.about-titlebar');
  let dragging = false, ox = 0, oy = 0;

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('about-dot')) return;
    dragging = true;
    const rect   = panel.getBoundingClientRect();
    const rpRect = getRightPanel().getBoundingClientRect();
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    panel.style.transform = 'none';
    panel.style.top   = (rect.top  - rpRect.top)  / stageScale + 'px';
    panel.style.left  = (rect.left - rpRect.left) / stageScale + 'px';
    ox = (e.clientX - rect.left) / stageScale;
    oy = (e.clientY - rect.top)  / stageScale;
    panel.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rp = getRightPanel();
    const rpRect = rp.getBoundingClientRect();
    const x = Math.max(0, Math.min((e.clientX - rpRect.left) / stageScale - ox, rp.offsetWidth  - panel.offsetWidth));
    const y = Math.max(0, Math.min((e.clientY - rpRect.top)  / stageScale - oy, rp.offsetHeight - panel.offsetHeight - 40));
    panel.style.left = x + 'px';
    panel.style.top  = y + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    panel.classList.remove('dragging');
  });
}

function switchAboutLang(lang) {
  document.querySelectorAll('#about-panel .about-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.lang === lang);
  });
  document.querySelectorAll('#about-panel .about-content').forEach(c => {
    c.classList.toggle('active', c.dataset.lang === lang);
  });
}

async function printAbout() {
  const out = getOutput();
  const line = s => { out.insertAdjacentText('beforeend', s + '\n'); scrollTerminal(); };
  const lines = [
    '──────────────────────────────────────────────',
    '           // ABOUT :: SADAME //',
    '──────────────────────────────────────────────',
    '',
    '[ EN ]',
    '  There\'s really nothing special about me.',
    '  Pluviophile (n. people who love rain) describes me well',
    '  — I hate the flowing of time, and I believe rain has',
    '  the magic to stop everything from moving.',
    '',
    '  I hate sunny days, and people hustling for money or',
    '  a hollow goal. Diving into my mind makes me exhausted,',
    '  so I\'ll keep the deeper stuff to myself.',
    '',
    '  // what i like',
    '    games (PSN / NS / PC), anime, thrash & industrial metal.',
    '      favorite band          :: Rammstein / Pantera',
    '      favorite acg producer  :: 麻枝 准 (Jun Maeda)',
    '      movie bible            :: Fight Club',
    '      anime bible            :: Evangelion',
    '',
    '  // what i do',
    '    gaming + anime. majoring in computer engineering.',
    '    but what I like the most: doing nothing...',
    '',
    '──────────────────────────────────────────────',
    '',
    '[ 中文 ]',
    '  鼠鼠稍微有点宅，除了上学之外基本都在家里躺尸。',
    '  喜欢下雨讨厌晴天 —— 下雨可以停止时间（鼠鼠是这么认为的）。',
    '  缕清自己的思绪很累，所以尽量控制自己不要多想。',
    '  希望大家都能开心地做自己想做的事情。',
    '',
    '  // 喜欢的事情',
    '    某只兔子、游戏（PSN / NS / PC）、手办、番剧、金属与ACG。',
    '      最喜欢的乐队        :: Rammstein / Pantera',
    '      最喜欢的ACG制作人   :: 麻枝 准',
    '      电影圣经            :: 搏击俱乐部',
    '      动漫圣经            :: 新世纪福音战士',
    '',
    '  // 鼠鼠的日常',
    '    大学专业是 computer engineering，偶尔也会学习。',
    '    但最喜欢的还是 —— 躺尸...',
    '',
    '──────────────────────────────────────────────',
  ];
  for (const l of lines) {
    line(l);
    await wait(18);
  }
}

function toggleMusicMinimize() {
  document.getElementById('music-panel').classList.add('minimized');
}

function toggleMusicPlaylist() {
  document.getElementById('embed-iframe').classList.toggle('playlist-expanded');
}

function expandMusicPanel() {
  const panel = document.getElementById('music-panel');
  if (!panel.classList.contains('minimized')) return;
  panel.classList.remove('minimized');
}

function initMusicDrag() {
  const panel    = document.getElementById('music-panel');
  const titlebar = panel.querySelector('.music-titlebar');
  let dragging = false, ox = 0, oy = 0;

  panel.addEventListener('mousedown', () => bringToFront(panel));

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('music-dot')) return;
    dragging = true;
    const rect   = panel.getBoundingClientRect();
    const rpRect = getRightPanel().getBoundingClientRect();
    panel.style.bottom = 'auto';
    panel.style.right  = 'auto';
    panel.style.left   = (rect.left - rpRect.left) / stageScale + 'px';
    panel.style.top    = (rect.top  - rpRect.top)  / stageScale + 'px';
    ox = (e.clientX - rect.left) / stageScale;
    oy = (e.clientY - rect.top)  / stageScale;
    panel.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rp = getRightPanel();
    const rpRect = rp.getBoundingClientRect();
    const x = Math.max(0, Math.min((e.clientX - rpRect.left) / stageScale - ox, rp.offsetWidth  - panel.offsetWidth));
    const y = Math.max(0, Math.min((e.clientY - rpRect.top)  / stageScale - oy, rp.offsetHeight - panel.offsetHeight - 40));
    panel.style.left = x + 'px';
    panel.style.top  = y + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    panel.classList.remove('dragging');
  });
}

// ─── Command Handler ──────────────────────────────────────────
async function handleCommand(raw) {
  const out = getOutput();
  const cmd = raw.trim();

  out.insertAdjacentText('beforeend', 'SADAME@WIRED:~$ ' + cmd + '\n');
  scrollTerminal();

  if (!cmd) return;

  const lower = cmd.toLowerCase();

  if (lower === 'clear') {
    getOutput().textContent = '';
    return;

  } else if (lower === 'music') {
    const panel = document.getElementById('music-panel');
    const isVisible = panel.classList.contains('visible');
    toggleMusicPanel();
    out.insertAdjacentText('beforeend', isVisible ? '> player hidden — music continues\n' : '> music player online\n');

  } else if (lower === 'help') {
    await printHelp();

  } else if (lower === 'about' || lower === 'about me' || lower === 'whoami') {
    await printAbout();

  } else if (lower === 'ls ./connections') {
    await printLinks();

  } else if (lower.startsWith('vim ')) {
    const name = cmd.slice(4).trim();
    const link = LINKS.find(l =>
      l.name.toLowerCase() === name.toLowerCase() ||
      l.name.toLowerCase().startsWith(name.toLowerCase())
    );
    if (link) {
      out.insertAdjacentText('beforeend', `Opening ${link.name}...\n`);
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } else {
      out.insertAdjacentText('beforeend', `vim: ${name}: profile not found\n`);
      out.insertAdjacentText('beforeend', `Available: ${LINKS.map(l => l.name).join(' | ')}\n`);
    }

  } else if (lower === 'hello lain') {
    await printLainArt();

  } else if (lower === 'tv') {
    const panel = document.getElementById('tv-panel');
    const wasVisible = panel.classList.contains('visible');
    if (wasVisible) {
      panel.classList.remove('visible');
    } else {
      panel.style.cssText = '';
      delete panel.dataset.savedWidth;
      delete panel.dataset.savedHeight;
      panel.classList.add('visible');
    }
    updateTaskbar();
    out.insertAdjacentText('beforeend', !wasVisible ? '> WIRED TV online\n' : '> WIRED TV offline\n');

  } else if (lower === 'background') {
    out.insertAdjacentText('beforeend', 'available backgrounds:\n');
    BACKGROUND_FILES.forEach(f => {
      out.insertAdjacentText('beforeend', '  ' + f.replace('background/', '') + '\n');
    });

  } else if (lower.startsWith('background ')) {
    const name = cmd.slice(11).trim();
    const match = BACKGROUND_FILES.find(
      f => f.replace('background/', '').toLowerCase() === name.toLowerCase()
    );
    if (match) {
      activeBg = match;
      document.getElementById('right-bg').src = match;
      // Sync picker highlight
      const matchedName = match.replace('background/', '');
      document.querySelectorAll('.picker-cell').forEach(c => {
        c.classList.toggle('active', c.textContent === matchedName);
      });
      out.insertAdjacentText('beforeend', `> background set to ${name}\n`);
    } else {
      out.insertAdjacentText('beforeend', `background: ${name}: not found\n`);
      out.insertAdjacentText('beforeend', `type 'background' to list available\n`);
    }

  } else {
    out.insertAdjacentText('beforeend', `${cmd}: command not found\n`);
    out.insertAdjacentText('beforeend', `type 'help' for available commands\n`);
  }

  out.insertAdjacentText('beforeend', '\n');
  scrollTerminal();
}

// ─── Screen 1: Boot Sequence ──────────────────────────────────
async function runBootSequence() {
  const bootText = document.getElementById('boot-text');
  const screen1  = document.getElementById('screen1');

  await wait(400);
  await typeText(bootText, 'HELLO NAVI', 90);
  await wait(600);
  await typeText(bootText, '\n\nCONNECTING TO THE WIRED...', 45);
  await wait(300);
  await typeText(bootText, '\nLOADING LAIN...', 45);
  await wait(400);
  await typeText(bootText, '\n[', 30);
  await typeText(bootText, '████████████████', 60);
  await typeText(bootText, '] 100%', 30);
  await wait(300);

  screen1.classList.add('glitch-intensify');
  await wait(350);
  screen1.classList.remove('active');
  await wait(100);
  runTerminalSequence();
}

// ─── Screen 2: Interactive Terminal ──────────────────────────
async function runTerminalSequence() {
  const screen2 = document.getElementById('screen2');
  const out     = getOutput();

  screen2.classList.add('active');
  document.querySelector('.terminal-window').classList.add('visible');
  await wait(200);

  // Auto-run help on load so user knows the commands
  await typeText(out, 'SADAME@WIRED:~$ ', 35);
  await typeText(out, 'help', 80);
  await wait(200);
  out.insertAdjacentText('beforeend', '\n');
  await printHelp();
  out.insertAdjacentText('beforeend', '\n');

  // Show music panel with first-show zoom animation
  await wait(400);
  const musicPanel = document.getElementById('music-panel');
  musicPanel.classList.add('music-first-show');
  toggleMusicPanel();
  setTimeout(() => musicPanel.classList.remove('music-first-show'), 700);

  // Show TV panel with zoom from top-right
  await wait(150);
  const tvPanel = document.getElementById('tv-panel');
  tvPanel.classList.add('tv-first-show');
  tvPanel.classList.add('visible');
  setTimeout(() => tvPanel.classList.remove('tv-first-show'), 700);

  // Show Sys-monitor panel by default (fades in via opacity transition)
  await wait(150);
  sysmonOpen();

  updateTaskbar();

  // Connections sidebar opens by default
  toggleConnectionsSidebar();

  // Make terminal the topmost window after all other panels are shown
  bringToFront(document.querySelector('.terminal-window'));

  // Show interactive prompt and wire up Enter key
  showPrompt();

  const input = document.getElementById('terminal-input');
  // Re-focus input when clicking the right panel background (not on panels/windows/taskbar)
  document.getElementById('right-panel').addEventListener('click', (e) => {
    if (!e.target.closest('#connections-sidebar') &&
        !e.target.closest('#bg-picker') &&
        !e.target.closest('#music-panel') &&
        !e.target.closest('#tv-panel') &&
        !e.target.closest('#about-panel') &&
        !e.target.closest('#taskbar')) {
      input.focus();
    }
  });

  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !terminalProcessing) {
      terminalProcessing = true;
      const cmd = input.value;
      input.value = '';
      hidePrompt();
      await handleCommand(cmd);
      showPrompt();
      terminalProcessing = false;
    }
  });

  scheduleWiredMessage();
}

function injectWiredMessage() {
  if (terminalProcessing) return;
  const input = document.getElementById('terminal-input');
  if (!input || input.value !== '') return;
  const screen2 = document.getElementById('screen2');
  if (!screen2 || !screen2.classList.contains('active')) return;
  const idx = Math.floor(Math.random() * WIRED_MESSAGES.length);
  const out = document.getElementById('terminal-output');
  if (!out) return;
  const div = document.createElement('div');
  div.className = 'wired-msg';
  div.textContent = WIRED_MESSAGES[idx];
  out.appendChild(div);
  scrollTerminal();
}

function scheduleWiredMessage() {
  const delay = 60000 + Math.random() * 60000;
  setTimeout(() => { injectWiredMessage(); scheduleWiredMessage(); }, delay);
}

// ─── Idle Screensaver ────────────────────────────────────────
const SCREENSAVER_IDLE_MS = 45000;
const SCREENSAVER_PHRASES = [
  'PRESENT DAY', 'PRESENT TIME', 'LAYER 07', 'CLOSE THE WORLD',
];
const KATAKANA = 'アァカサタナハマヤラワンイィキシチニヒミリウゥクスツヌフムユルヴエェケセテネヘメレオォコソトノホモヨロヲ0123456789ABCDEF';

let screensaverTimer = null;
let screensaverFrame = null;
let screensaverActive = false;
let manualSleep = false;
let ssCanvas, ssCtx, ssColumns;

function ssResize() {
  if (!ssCanvas) return;
  if (isMobile) {
    const downscale = 0.5;
    ssCanvas.width  = Math.floor(STAGE_W * downscale);
    ssCanvas.height = Math.floor(STAGE_H * downscale);
    ssCanvas.style.width  = STAGE_W + 'px';
    ssCanvas.style.height = STAGE_H + 'px';
  } else {
    ssCanvas.width  = window.innerWidth;
    ssCanvas.height = window.innerHeight;
    ssCanvas.style.width  = '';
    ssCanvas.style.height = '';
  }
  const colWidth = 16;
  const cols = Math.ceil(ssCanvas.width / colWidth);
  ssColumns = [];
  for (let i = 0; i < cols; i++) {
    ssColumns.push({
      x: i * colWidth,
      y: Math.random() * ssCanvas.height,
      speed: 6 + Math.random() * 8,
      phrase: null,
      phraseIdx: 0,
    });
  }
}

function ssDraw() {
  if (!screensaverActive) return;
  ssCtx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ssCtx.fillRect(0, 0, ssCanvas.width, ssCanvas.height);
  ssCtx.font = '14px "Share Tech Mono", monospace';
  ssCtx.fillStyle = '#00ffcc';
  ssCtx.shadowColor = '#00ffcc';
  ssCtx.shadowBlur = 6;
  for (const col of ssColumns) {
    let ch;
    if (col.phrase) {
      ch = col.phrase[col.phraseIdx];
      col.phraseIdx++;
      if (col.phraseIdx >= col.phrase.length) col.phrase = null;
    } else {
      ch = KATAKANA[Math.floor(Math.random() * KATAKANA.length)];
      if (Math.random() < 0.0008) {
        col.phrase = SCREENSAVER_PHRASES[Math.floor(Math.random() * SCREENSAVER_PHRASES.length)];
        col.phraseIdx = 0;
      }
    }
    ssCtx.fillText(ch, col.x, col.y);
    col.y += col.speed;
    if (col.y > ssCanvas.height + 40) {
      col.y = -20;
      col.speed = 6 + Math.random() * 8;
    }
  }
  screensaverFrame = setTimeout(ssDraw, isMobile ? 100 : 50);
}

function showScreensaver() {
  if (screensaverActive) return;
  screensaverActive = true;
  if (!ssCanvas) {
    ssCanvas = document.getElementById('screensaver');
    ssCtx = ssCanvas.getContext('2d');
  }
  ssResize();
  ssCtx.fillStyle = '#000';
  ssCtx.fillRect(0, 0, ssCanvas.width, ssCanvas.height);
  ssCanvas.classList.add('active');
  ssDraw();
}

function hideScreensaver() {
  if (!screensaverActive) return;
  screensaverActive = false;
  if (screensaverFrame) { clearTimeout(screensaverFrame); screensaverFrame = null; }
  if (ssCanvas) ssCanvas.classList.remove('active');
  const hint = document.getElementById('screensaver-hint');
  if (hint) hint.classList.remove('visible');
}

function resetIdleTimer() {
  if (manualSleep) return;
  if (screensaverActive) hideScreensaver();
  if (screensaverTimer) clearTimeout(screensaverTimer);
  screensaverTimer = setTimeout(showScreensaver, SCREENSAVER_IDLE_MS);
}

function initScreensaver() {
  ['mousemove', 'keydown', 'click', 'touchstart'].forEach(ev => {
    document.addEventListener(ev, resetIdleTimer);
  });
  const wakeFromManual = () => {
    if (manualSleep) {
      manualSleep = false;
      hideScreensaver();
      resetIdleTimer();
    }
  };
  document.addEventListener('keydown', wakeFromManual);
  document.addEventListener('touchstart', wakeFromManual, { passive: true });
  window.addEventListener('resize', () => { if (screensaverActive) ssResize(); });
  resetIdleTimer();
}

// ─── Start ────────────────────────────────────────────────────
runBootSequence().catch(console.error);
initMusicDrag();
initLainSide();
initTvPanel();
initAboutPanel();
initTerminalDrag();
initConnectionsSidebar();
initBgPicker();
initScreensaver();

// ─── Stage Scaling (uniform fit, letterbox) ────────────────
// Mobile/narrow viewports get a fixed desktop reference so the
// full layout always renders, just shrunk to fit.
const STAGE_W = isMobile ? 1600 : (window.screen.availWidth  || window.innerWidth);
const STAGE_H = isMobile ? 900  : (window.screen.availHeight || window.innerHeight);
let stageScale = 1;
(function initStage() {
  const stage = document.getElementById('stage');
  if (!stage) return;
  stage.style.width  = STAGE_W + 'px';
  stage.style.height = STAGE_H + 'px';
  function apply() {
    stageScale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    const offX = (window.innerWidth  - STAGE_W * stageScale) / 2;
    const offY = (window.innerHeight - STAGE_H * stageScale) / 2;
    stage.style.transform = `translate(${offX}px, ${offY}px) scale(${stageScale})`;
  }
  if (!isMobile) window.addEventListener('resize', apply);
  else window.addEventListener('orientationchange', () => setTimeout(apply, 150));
  apply();
})();

// ─── Power Menu ──────────────────────────────────────────────
function togglePowerMenu(e) {
  if (e) e.stopPropagation();
  document.getElementById('power-menu').classList.toggle('visible');
}
function closePowerMenu() {
  document.getElementById('power-menu').classList.remove('visible');
}
function powerSleep() {
  closePowerMenu();
  manualSleep = true;
  if (screensaverTimer) { clearTimeout(screensaverTimer); screensaverTimer = null; }
  showScreensaver();
  document.getElementById('screensaver-hint').classList.add('visible');
}
function powerShutdown() {
  closePowerMenu();
  window.close();
  setTimeout(() => { document.body.innerHTML = ''; document.body.style.background = '#000'; }, 100);
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('#power-wrap')) closePowerMenu();
});

// ─── Viewport Resize: clamp dragged panels within bounds ──────
window.addEventListener('resize', () => {
  if (isMobile) return;
  updateLainWidth();

  const rp = document.getElementById('right-panel');
  if (!rp) return;

  const panels = [
    document.querySelector('.terminal-window'),
    document.getElementById('music-panel'),
    document.getElementById('tv-panel'),
    document.getElementById('bg-picker'),
    document.getElementById('about-panel'),
  ];
  panels.forEach(el => {
    if (!el || !el.style.left) return;
    const maxX = Math.max(0, rp.offsetWidth  - el.offsetWidth);
    const maxY = Math.max(0, rp.offsetHeight - el.offsetHeight - 40);
    if (parseFloat(el.style.left) > maxX) el.style.left = maxX + 'px';
    if (parseFloat(el.style.top)  > maxY) el.style.top  = maxY + 'px';
  });
});


// ─── Sys-monitor ───────────────────────────────────────────────
const SYSMON_HZ = 10;
const SYSMON_WINDOW_S = 60;
const SYSMON_MAX_SAMPLES = SYSMON_HZ * SYSMON_WINDOW_S;

function sysmonRing() {
  return { buf: new Float32Array(SYSMON_MAX_SAMPLES), head: 0, filled: 0 };
}
function sysmonPush(ring, v) {
  ring.buf[ring.head] = v;
  ring.head = (ring.head + 1) % SYSMON_MAX_SAMPLES;
  if (ring.filled < SYSMON_MAX_SAMPLES) ring.filled++;
}
function sysmonLast(ring) {
  if (ring.filled === 0) return NaN;
  var idx = (ring.head - 1 + SYSMON_MAX_SAMPLES) % SYSMON_MAX_SAMPLES;
  return ring.buf[idx];
}
function sysmonMinMax(ring) {
  var lo = Infinity, hi = -Infinity;
  for (var i = 0; i < ring.filled; i++) {
    var v = ring.buf[i];
    if (!Number.isFinite(v)) continue;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  if (!Number.isFinite(lo)) return [NaN, NaN];
  return [lo, hi];
}

var sysmonState = {
  isOpen: false,
  rafId: null,
  intervalId: null,
  lastFrameT: 0,
  fpsEMA: 60,
  selectedId: "fps",
  metrics: {},
  order: [],
};

function sysmonRegisterMetric(def) {
  def.selectable = def.selectable !== false;
  if (def.selectable) def.ring = sysmonRing();
  sysmonState.metrics[def.id] = def;
}

// Micro-benchmark: measures effective CPU throughput by timing a
// fixed-size math loop. First ~5 calls establish a median baseline
// treated as `SYSMON_CPU_NOMINAL_GHZ`; subsequent calls scale
// linearly off that baseline, so the displayed "clock" dips when
// the browser is under load and recovers when idle.
var SYSMON_CPU_NOMINAL_GHZ = 3.2;
var SYSMON_CPU_ITERS = 200000;
var sysmonCpuBenchSink = 0;
var sysmonCpuCalibSamples = [];
var sysmonCpuBaselineIpms = 0;
function sysmonCpuBench() {
  var t0 = performance.now();
  var x = 1.0;
  for (var i = 0; i < SYSMON_CPU_ITERS; i++) {
    x = Math.sqrt(x + i * 0.5) + 1.0;
  }
  sysmonCpuBenchSink = x; // prevent dead-code elimination
  var dt = performance.now() - t0;
  return dt > 0 ? SYSMON_CPU_ITERS / dt : SYSMON_CPU_ITERS;
}

var sysmonStorageCache = { usage: NaN, quota: NaN, t: 0 };
function sysmonRefreshStorage() {
  if (!navigator.storage || !navigator.storage.estimate) return;
  navigator.storage.estimate().then(function(e) {
    sysmonStorageCache = {
      usage: (e.usage || 0) / (1024 * 1024),
      quota: (e.quota || 0) / (1024 * 1024),
      t: performance.now(),
    };
  }).catch(function() {});
}

function sysmonRegisterReal() {
  sysmonRegisterMetric({
    id: "fps", group: "real", label: "Navi Refresh", unit: "fps",
    color: "#c0ffd0",
    format: function(v) { return Number.isFinite(v) ? v.toFixed(0) : "\u2014"; },
    sample: function() { return sysmonState.fpsEMA; },
  });
  sysmonRegisterMetric({
    id: "heapUsed", group: "real", label: "Navi Nodes", unit: "nodes",
    color: "#ffe080",
    format: function(v) { return Number.isFinite(v) ? String(Math.round(v)) : "\u2014"; },
    sample: function() {
      // Live DOM element count. `performance.memory.usedJSHeapSize`
      // is quantized to ~100 KB on a ~20 s cooldown in Chromium
      // without cross-origin isolation, so it reads as a flat line;
      // DOM node count actually changes when panels open/close and
      // when the terminal appends output.
      return document.getElementsByTagName("*").length;
    },
  });
  sysmonRegisterMetric({
    id: "storageUsed", group: "real", label: "Navi Storage", unit: "MiB",
    color: "#80c0ff",
    format: function(v) { return Number.isFinite(v) ? v.toFixed(1) : "\u2014"; },
    sample: function() {
      // Sum of decoded image pixel buffers currently held in the
      // DOM (4 bytes/px RGBA). This works regardless of protocol,
      // unlike Resource Timing (zero on file://) and navigator.
      // storage.estimate() (zero for origins with no IDB/Cache).
      var imgs = document.images;
      var bytes = 0;
      for (var i = 0; i < imgs.length; i++) {
        var img = imgs[i];
        if (img.complete && img.naturalWidth > 0) {
          bytes += img.naturalWidth * img.naturalHeight * 4;
        }
      }
      return bytes / (1024 * 1024);
    },
  });
  sysmonRegisterMetric({
    id: "downlink", group: "real", label: "Wired Downlink", unit: "Mb/s",
    selectable: false,
    format: function() {
      var c = navigator.connection;
      return c && typeof c.downlink === "number" ? c.downlink.toFixed(1) : "\u2014";
    },
    sample: function() { return 0; },
  });
  sysmonRegisterMetric({
    id: "cores", group: "real", label: "Navi Cores", unit: "cores",
    selectable: false,
    format: function(v) { return String(v); },
    sample: function() { return navigator.hardwareConcurrency || 0; },
  });
  sysmonRegisterMetric({
    id: "cpuSpeed", group: "real", label: "Navi Clock", unit: "GHz",
    color: "#ffb080",
    format: function(v) { return Number.isFinite(v) ? v.toFixed(2) : "\u2014"; },
    sample: function() {
      var ipms = sysmonCpuBench();
      if (sysmonCpuBaselineIpms === 0) {
        sysmonCpuCalibSamples.push(ipms);
        if (sysmonCpuCalibSamples.length >= 5) {
          var sorted = sysmonCpuCalibSamples.slice().sort(function(a, b) { return a - b; });
          sysmonCpuBaselineIpms = sorted[2]; // median of 5
        }
        return SYSMON_CPU_NOMINAL_GHZ;
      }
      return SYSMON_CPU_NOMINAL_GHZ * (ipms / sysmonCpuBaselineIpms);
    },
  });
  sysmonRegisterMetric({
    id: "dpr", group: "real", label: "Pixel Ratio", unit: "\u00d7",
    selectable: false,
    format: function(v) { return v.toFixed(2); },
    sample: function() { return window.devicePixelRatio || 1; },
  });
  sysmonRegisterMetric({
    id: "viewport", group: "real", label: "Display Surface", unit: "px",
    selectable: false,
    format: function() { return innerWidth + "\u00d7" + innerHeight; },
    sample: function() { return 0; },
  });
  sysmonRegisterMetric({
    id: "netType", group: "real", label: "Internet Protocol", unit: "",
    selectable: false,
    format: function() { return "protocol 7"; },
    sample: function() { return 0; },
  });
  sysmonRegisterMetric({
    id: "uptime", group: "real", label: "Copland Uptime", unit: "",
    selectable: false,
    format: function() {
      var s = Math.floor(performance.now() / 1000);
      var hh = String(Math.floor(s / 3600)).padStart(2, "0");
      var mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
      var ss = String(s % 60).padStart(2, "0");
      return hh + ":" + mm + ":" + ss;
    },
    sample: function() { return 0; },
  });
  sysmonRegisterMetric({
    id: "storageQuota", group: "real", label: "Storage Ceiling", unit: "MiB",
    selectable: false,
    format: function() { return Number.isFinite(sysmonStorageCache.quota) ? sysmonStorageCache.quota.toFixed(0) : "\u2014"; },
    sample: function() { return 0; },
  });
}

function sysmonRegisterPsyche() {
  var temp = 34, load = 20;
  sysmonRegisterMetric({
    id: "psycheStatus", group: "psyche", label: "Psyche Chip", unit: "",
    selectable: false,
    format: function() { return "ONLINE"; },
    sample: function() { return 0; },
  });
  sysmonRegisterMetric({
    id: "psycheTemp", group: "psyche", label: "Chip Temp", unit: "\u00b0C",
    color: "#ff80a0",
    format: function(v) { return v.toFixed(1); },
    sample: function() {
      temp += (Math.random() - 0.5) * 0.3;
      if (temp < 30) temp = 30;
      if (temp > 42) temp = 42;
      return temp;
    },
  });
  sysmonRegisterMetric({
    id: "psycheLoad", group: "psyche", label: "Chip Load", unit: "%",
    color: "#ffa060",
    format: function(v) { return v.toFixed(0); },
    sample: function() {
      var drift = document.hidden ? 0.4 : 0;
      load += (Math.random() - 0.5) * 3 + drift;
      if (load < 0) load = 0;
      if (load > 100) load = 100;
      return load;
    },
  });
}

function sysmonRegisterWired() {
  var schu = 7.83;
  var p7phase = 0, p7nextSpike = performance.now() + 20000;
  var anchor = 99;
  var t0 = performance.now();
  var knights = 4, knightsNextBurst = performance.now() + 15000;
  var omni = 0.42;

  sysmonRegisterMetric({
    id: "schumann", group: "wired", label: "Schumann Resonance", unit: "Hz",
    color: "#80ff80",
    format: function(v) { return v.toFixed(3); },
    sample: function() {
      schu += (Math.random() - 0.5) * 0.02;
      schu += (7.83 - schu) * 0.05;
      if (schu < 7.6) schu = 7.6;
      if (schu > 8.1) schu = 8.1;
      return schu;
    },
  });
  sysmonRegisterMetric({
    id: "protocol7", group: "wired", label: "Protocol 7 Flux", unit: "",
    color: "#80e0ff",
    format: function(v) { return v.toFixed(1); },
    sample: function() {
      p7phase += 0.02;
      var v = Math.sin(p7phase / 6) * 40 + (Math.random() - 0.5) * 10;
      var now = performance.now();
      if (now > p7nextSpike) {
        v += 30;
        p7nextSpike = now + 20000 + Math.random() * 20000;
      }
      return v;
    },
  });
  sysmonRegisterMetric({
    id: "bandwidth", group: "wired", label: "Wired Bandwidth", unit: "kb/s",
    color: "#60c0ff",
    format: function(v) { return v.toFixed(0); },
    sample: function() {
      var c = navigator.connection;
      var base = c && typeof c.downlink === "number" ? c.downlink * 120 : 400;
      return base + (Math.random() - 0.5) * base * 0.3;
    },
  });
  sysmonRegisterMetric({
    id: "anchor", group: "wired", label: "Reality Anchor", unit: "%",
    color: "#ff80ff",
    format: function(v) { return v.toFixed(2); },
    sample: function() {
      anchor += (Math.random() - 0.5) * 0.1;
      if (Math.random() < 0.001) anchor -= 6;
      anchor += (99 - anchor) * 0.05;
      if (anchor < 85) anchor = 85;
      if (anchor > 100) anchor = 100;
      return anchor;
    },
  });
  sysmonRegisterMetric({
    id: "coherence", group: "wired", label: "Layer Coherence", unit: "",
    color: "#a0a0ff",
    format: function(v) { return v.toFixed(3); },
    sample: function() {
      var t = (performance.now() - t0) / 1000;
      return 0.7 + 0.3 * Math.sin((2 * Math.PI * t) / 180);
    },
  });
  sysmonRegisterMetric({
    id: "knights", group: "wired", label: "Knights Activity", unit: "%",
    color: "#ff6080",
    format: function(v) { return v.toFixed(0); },
    sample: function() {
      knights += (Math.random() - 0.5) * 1.2;
      knights += (4 - knights) * 0.08;
      var now = performance.now();
      if (now > knightsNextBurst) {
        knights += 25 + Math.random() * 30;
        knightsNextBurst = now + 15000 + Math.random() * 30000;
      }
      if (knights < 0) knights = 0;
      if (knights > 100) knights = 100;
      return knights;
    },
  });
  sysmonRegisterMetric({
    id: "omnipresence", group: "wired", label: "Omnipresence", unit: "",
    color: "#e0a0ff",
    format: function(v) { return v.toFixed(3); },
    sample: function() {
      var t = (performance.now() - t0) / 1000;
      omni = 0.42 + 0.18 * Math.sin((2 * Math.PI * t) / 240)
                  + 0.06 * Math.sin((2 * Math.PI * t) / 37)
                  + (Math.random() - 0.5) * 0.02;
      if (omni < 0) omni = 0;
      if (omni > 1) omni = 1;
      return omni;
    },
  });
}

function sysmonBuildOrder() {
  sysmonState.order = [
    { group: "real", title: "// NAVI", ids: [
      "fps","cpuSpeed","heapUsed","storageUsed","downlink",
      "cores","dpr","viewport","netType","uptime","storageQuota",
    ]},
    { group: "psyche", title: "// PSYCHE", ids: ["psycheStatus","psycheTemp","psycheLoad"] },
    { group: "wired", title: "// WIRED", ids: [
      "schumann","protocol7","bandwidth","anchor","coherence","knights","omnipresence",
    ]},
  ];
}

// -- Sampling loops --
function sysmonFrameTick(t) {
  if (!sysmonState.isOpen) { sysmonState.rafId = null; return; }
  if (sysmonState.lastFrameT) {
    var dt = t - sysmonState.lastFrameT;
    if (dt > 0) {
      var inst = 1000 / dt;
      sysmonState.fpsEMA = sysmonState.fpsEMA * 0.9 + inst * 0.1;
    }
  }
  sysmonState.lastFrameT = t;
  sysmonState.rafId = requestAnimationFrame(sysmonFrameTick);
}

var sysmonStorageTickCounter = 0;
function sysmonTick() {
  if (!sysmonState.isOpen) return;
  if ((sysmonStorageTickCounter++ % 50) === 0) sysmonRefreshStorage();
  for (var id in sysmonState.metrics) {
    var m = sysmonState.metrics[id];
    var v = m.sample();
    if (m.ring) sysmonPush(m.ring, v);
  }
  sysmonRenderAll();
}

function sysmonStart() {
  if (sysmonState.intervalId) return;
  sysmonState.lastFrameT = 0;
  sysmonState.rafId = requestAnimationFrame(sysmonFrameTick);
  var period = matchMedia("(prefers-reduced-motion: reduce)").matches ? 500 : (1000 / SYSMON_HZ);
  sysmonState.intervalId = setInterval(sysmonTick, period);
  sysmonRefreshStorage();
}

function sysmonStop() {
  if (sysmonState.rafId) cancelAnimationFrame(sysmonState.rafId);
  sysmonState.rafId = null;
  if (sysmonState.intervalId) clearInterval(sysmonState.intervalId);
  sysmonState.intervalId = null;
}

// -- Sidebar renderer --
function sysmonBuildSidebar() {
  var sidebar = document.getElementById("sysmon-sidebar");
  if (!sidebar) return;
  sidebar.innerHTML = "";
  for (var si = 0; si < sysmonState.order.length; si++) {
    var section = sysmonState.order[si];
    var h = document.createElement("div");
    h.className = "sysmon-section-header";
    h.textContent = section.title;
    sidebar.appendChild(h);

    for (var mi = 0; mi < section.ids.length; mi++) {
      var id = section.ids[mi];
      var m = sysmonState.metrics[id];
      if (!m) continue;
      var row = document.createElement("div");
      row.className = "sysmon-row" + (m.selectable ? "" : " static");
      row.dataset.metricId = id;
      if (m.selectable) row.addEventListener("click", (function(mid) {
        return function() { sysmonSelect(mid); };
      })(id));

      var label = document.createElement("div");
      label.className = "sysmon-row-label";
      label.textContent = m.label;

      var val = document.createElement("div");
      val.className = "sysmon-row-value";
      val.textContent = "\u2014";

      row.appendChild(label);
      row.appendChild(val);

      if (m.selectable) {
        var svgNS = "http://www.w3.org/2000/svg";
        var svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("class", "sysmon-row-spark");
        svg.setAttribute("viewBox", "0 0 100 20");
        svg.setAttribute("preserveAspectRatio", "none");
        var poly = document.createElementNS(svgNS, "polyline");
        poly.setAttribute("stroke", m.color || "#00ffcc");
        poly.setAttribute("fill", "none");
        poly.setAttribute("stroke-width", "1");
        svg.appendChild(poly);
        row.appendChild(svg);
      }
      sidebar.appendChild(row);
    }
  }
  sysmonMarkSelected();
}

function sysmonMarkSelected() {
  var rows = document.querySelectorAll("#sysmon-sidebar .sysmon-row");
  rows.forEach(function(r) { r.classList.toggle("selected", r.dataset.metricId === sysmonState.selectedId); });
}

function sysmonUpdateSidebar() {
  var rows = document.querySelectorAll("#sysmon-sidebar .sysmon-row");
  rows.forEach(function(row) {
    var id = row.dataset.metricId;
    var m = sysmonState.metrics[id];
    if (!m) return;
    var valEl = row.querySelector(".sysmon-row-value");

    if (m.ring) {
      var v = sysmonLast(m.ring);
      valEl.textContent = m.format(v) + (m.unit ? " " + m.unit : "");
      var poly = row.querySelector("polyline");
      if (poly) poly.setAttribute("points", sysmonSparkPoints(m.ring));
    } else {
      valEl.textContent = m.format(m.sample()) + (m.unit ? " " + m.unit : "");
    }
  });
}

function sysmonSparkPoints(ring) {
  var n = ring.filled;
  if (n < 2) return "";
  var mm = sysmonMinMax(ring);
  var lo = mm[0], hi = mm[1];
  var range = (hi - lo) || 1;
  var start = (ring.head - n + SYSMON_MAX_SAMPLES) % SYSMON_MAX_SAMPLES;
  var out = "";
  for (var i = 0; i < n; i++) {
    var v = ring.buf[(start + i) % SYSMON_MAX_SAMPLES];
    if (!Number.isFinite(v)) continue;
    var x = (i / (SYSMON_MAX_SAMPLES - 1)) * 100;
    var y = 20 - ((v - lo) / range) * 20;
    out += (out ? " " : "") + x.toFixed(1) + "," + y.toFixed(1);
  }
  return out;
}

function sysmonSelect(id) {
  var m = sysmonState.metrics[id];
  if (!m || !m.selectable) return;
  sysmonState.selectedId = id;
  sysmonMarkSelected();
}

// -- Big chart --
function sysmonResizeCanvas() {
  var c = document.getElementById("sysmon-canvas");
  if (!c) return;
  var rect = c.getBoundingClientRect();
  var dpr = window.devicePixelRatio || 1;
  c.width = Math.max(1, Math.floor(rect.width * dpr));
  c.height = Math.max(1, Math.floor(rect.height * dpr));
}

function sysmonRenderBigChart() {
  var c = document.getElementById("sysmon-canvas");
  if (!c) return;
  var ctx = c.getContext("2d");
  var W = c.width, H = c.height;
  ctx.clearRect(0, 0, W, H);

  var m = sysmonState.metrics[sysmonState.selectedId];
  if (!m || !m.ring) return;

  var labelEl = document.getElementById("sysmon-chart-label");
  if (labelEl) labelEl.textContent = m.label + (m.unit ? " / " + m.unit : "");

  var mm = sysmonMinMax(m.ring);
  var lo = mm[0], hi = mm[1];
  var cur = sysmonLast(m.ring);
  document.getElementById("sysmon-cur").textContent = Number.isFinite(cur) ? m.format(cur) : "\u2014";
  document.getElementById("sysmon-min").textContent = Number.isFinite(lo)  ? m.format(lo)  : "\u2014";
  document.getElementById("sysmon-max").textContent = Number.isFinite(hi)  ? m.format(hi)  : "\u2014";

  if (m.ring.filled < 2 || !Number.isFinite(lo)) return;
  var range = (hi - lo) || 1;

  ctx.strokeStyle = "rgba(0, 255, 204, 0.15)";
  ctx.lineWidth = 1;
  for (var s = 0; s <= SYSMON_WINDOW_S; s += 10) {
    var gx = Math.floor((s / SYSMON_WINDOW_S) * W) + 0.5;
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
  }
  var fracs = [0, 0.5, 1];
  for (var fi = 0; fi < fracs.length; fi++) {
    var gy = Math.floor(fracs[fi] * H) + 0.5;
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  }

  ctx.strokeStyle = m.color || "#00ffcc";
  ctx.lineWidth = Math.max(1, (window.devicePixelRatio || 1));
  ctx.beginPath();
  var n = m.ring.filled;
  var start = (m.ring.head - n + SYSMON_MAX_SAMPLES) % SYSMON_MAX_SAMPLES;
  var penDown = false;
  for (var i = 0; i < n; i++) {
    var v = m.ring.buf[(start + i) % SYSMON_MAX_SAMPLES];
    if (!Number.isFinite(v)) { penDown = false; continue; }
    var px = (i / (SYSMON_MAX_SAMPLES - 1)) * W;
    var py = H - ((v - lo) / range) * H;
    if (!penDown) { ctx.moveTo(px, py); penDown = true; }
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

var sysmonResizeObs = null;
function sysmonAttachResize() {
  var c = document.getElementById("sysmon-canvas");
  if (!c || sysmonResizeObs) return;
  sysmonResizeObs = new ResizeObserver(function() {
    sysmonResizeCanvas();
    sysmonRenderBigChart();
  });
  sysmonResizeObs.observe(c);
}

// -- Process table --
var SYSMON_DAEMONS = [
  { pid: "0001", name: "copland.os",    thr: 4, load: function() { return 1 + Math.random() * 3; } },
  { pid: "0042", name: "navi.sys",      thr: 2, load: function() { return 8 + Math.sin(performance.now() / 4000) * 4 + Math.random() * 2; } },
  { pid: "0073", name: "psyche.drv",    thr: 1, load: function() {
      var r = sysmonState.metrics.psycheLoad && sysmonState.metrics.psycheLoad.ring;
      return r ? (sysmonLast(r) / 10) : 2;
    }},
  { pid: "0128", name: "protocol7.d",   thr: 1, load: function() {
      var r = sysmonState.metrics.protocol7 && sysmonState.metrics.protocol7.ring;
      var v = r ? sysmonLast(r) : 0;
      return Math.min(15, Math.abs(v) / 6);
    }},
  { pid: "0256", name: "schumann.mon",  thr: 1, load: function() {
      var r = sysmonState.metrics.schumann && sysmonState.metrics.schumann.ring;
      var v = r ? sysmonLast(r) : 7.83;
      return Math.abs(v - 7.83) * 100;
    }},
  { pid: "0333", name: "wired.link",    thr: 1, load: function() {
      var r = sysmonState.metrics.bandwidth && sysmonState.metrics.bandwidth.ring;
      var v = r ? sysmonLast(r) : 400;
      return Math.min(20, v / 40);
    }},
  { pid: "0404", name: "knights.d",     thr: 2, load: function() {
      var r = sysmonState.metrics.knights && sysmonState.metrics.knights.ring;
      var v = r ? sysmonLast(r) : 4;
      return Math.min(25, v / 4);
    }},
  { pid: "0451", name: "tachibana.sys", thr: 1, load: function() { return 2 + Math.sin(performance.now() / 9000) * 1.5 + Math.random(); } },
  { pid: "0777", name: "lain.exe",      thr: 3, load: function() {
      var r = sysmonState.metrics.omnipresence && sysmonState.metrics.omnipresence.ring;
      var v = r ? sysmonLast(r) : 0.42;
      return 1 + v * 12;
    }},
  { pid: "0812", name: "eiri.bin",      thr: 1, load: function() {
      var r = sysmonState.metrics.protocol7 && sysmonState.metrics.protocol7.ring;
      var v = r ? sysmonLast(r) : 0;
      return Math.max(0, Math.min(8, v / 10 + 1));
    }},
  { pid: "1337", name: "handinavi.svc", thr: 1, load: function() { return 0.5 + Math.random() * 1.5; } },
];

var SYSMON_REAL_PROCS = [
  { slot: 1, name: "terminal",    thr: 1, check: function() { var el = document.querySelector(".terminal-window"); return !!(el && el.classList.contains("visible")); }},
  { slot: 2, name: "connections", thr: 1, check: function() { var el = document.getElementById("connections-sidebar"); return !!(el && el.classList.contains("visible")); }},
  { slot: 3, name: "music",       thr: 2, check: function() { var el = document.getElementById("music-panel"); return !!(el && el.classList.contains("visible")); }},
  { slot: 4, name: "tv",          thr: 1, check: function() { var el = document.getElementById("tv-panel"); return !!(el && el.classList.contains("visible")); }},
  { slot: 5, name: "bg.conf",     thr: 1, check: function() { var el = document.getElementById("bg-picker"); return !!(el && el.classList.contains("visible")); }},
  { slot: 6, name: "about_me",    thr: 1, check: function() { var el = document.getElementById("about-panel"); return !!(el && el.classList.contains("visible")); }},
  { slot: 7, name: "sysmon",      thr: 2, check: function() { return sysmonState.isOpen; }},
];

function sysmonPad(s, n) { return (s + "                ").slice(0, n); }

var sysmonProcTickCounter = 0;
function sysmonRenderProcTable() {
  if ((sysmonProcTickCounter++ % SYSMON_HZ) !== 0) return;
  var table = document.getElementById("sysmon-proc-table");
  if (!table) return;
  var rows = [];
  rows.push(sysmonPad("PID", 6) + sysmonPad("NAME", 16) + sysmonPad("THR", 6) + "LOAD");
  for (var di = 0; di < SYSMON_DAEMONS.length; di++) {
    var d = SYSMON_DAEMONS[di];
    rows.push(sysmonPad(d.pid, 6) + sysmonPad(d.name, 16) + sysmonPad(String(d.thr), 6) + d.load().toFixed(0) + "%");
  }
  for (var pi = 0; pi < SYSMON_REAL_PROCS.length; pi++) {
    var p = SYSMON_REAL_PROCS[pi];
    if (!p.check()) continue;
    var pid = "02" + String(p.slot).padStart(2, "0");
    var pload = (Math.random() * 5).toFixed(0) + "%";
    rows.push(sysmonPad(pid, 6) + sysmonPad(p.name, 16) + sysmonPad(String(p.thr), 6) + pload);
  }
  table.textContent = rows.join("\n");
}

function sysmonRenderAll() {
  sysmonUpdateSidebar();
  sysmonRenderBigChart();
  sysmonRenderProcTable();
}

// -- Lifecycle --
// Clears any inline positioning/sizing so the panel reverts to its
// CSS-declared default (bottom-center, 520x360). Also drops the
// minimized class and any cached dimensions.
function sysmonResetToDefault(panel) {
  panel.classList.remove("minimized");
  panel.style.top = "";
  panel.style.left = "";
  panel.style.right = "";
  panel.style.bottom = "";
  panel.style.transform = "";
  panel.style.width = "";
  panel.style.height = "";
  delete panel.dataset.savedWidth;
  delete panel.dataset.savedHeight;
}

function sysmonOpen() {
  var panel = document.getElementById("sysmon-panel");
  if (!panel) return;
  // Re-opening from a fully-closed state always snaps back to the
  // original default position and size — user may have dragged or
  // resized the previous instance.
  if (!panel.classList.contains("visible")) {
    sysmonResetToDefault(panel);
  }
  panel.classList.add("visible");
  bringToFront(panel);
  sysmonState.isOpen = true;
  sysmonResizeCanvas();
  sysmonRenderBigChart();
  sysmonStart();
  updateTaskbar();
}
function sysmonClose() {
  var panel = document.getElementById("sysmon-panel");
  if (!panel) return;
  panel.classList.remove("visible");
  sysmonState.isOpen = false;
  sysmonStop();
  updateTaskbar();
}
function closeSysmon()    { sysmonClose(); }
function minimizeSysmon() {
  var panel = document.getElementById("sysmon-panel");
  if (!panel || panel.classList.contains("minimized")) return;
  panel.dataset.savedWidth  = panel.offsetWidth  + "px";
  panel.dataset.savedHeight = panel.offsetHeight + "px";
  panel.style.width  = panel.offsetWidth + "px";
  panel.style.height = panel.querySelector(".sysmon-titlebar").offsetHeight + "px";
  panel.classList.add("minimized");
}
function restoreSysmon() {
  var panel = document.getElementById("sysmon-panel");
  if (!panel) return;
  // If fully closed, re-open (sysmonOpen resets to default).
  if (!panel.classList.contains("visible")) {
    sysmonOpen();
    return;
  }
  // Otherwise restore from minimized: re-apply the pre-minimize size.
  if (panel.classList.contains("minimized")) {
    panel.classList.remove("minimized");
    if (panel.dataset.savedWidth)  panel.style.width  = panel.dataset.savedWidth;
    if (panel.dataset.savedHeight) panel.style.height = panel.dataset.savedHeight;
  }
  sysmonResizeCanvas();
  sysmonRenderBigChart();
}
function taskbarToggleSysmon() {
  if (sysmonState.isOpen) sysmonClose(); else sysmonOpen();
}

function sysmonInitDrag() {
  var panel = document.getElementById("sysmon-panel");
  var title = panel && panel.querySelector(".sysmon-titlebar");
  if (!panel || !title) return;
  panel.addEventListener("mousedown", function() { bringToFront(panel); });
  var dragging = false, ox = 0, oy = 0;
  title.addEventListener("mousedown", function(e) {
    if (e.target.classList.contains("dot")) return;
    dragging = true;
    var rect   = panel.getBoundingClientRect();
    var rpRect = getRightPanel().getBoundingClientRect();
    panel.style.right  = "auto";
    panel.style.bottom = "auto";
    panel.style.transform = "none";
    panel.style.top  = (rect.top  - rpRect.top)  / stageScale + "px";
    panel.style.left = (rect.left - rpRect.left) / stageScale + "px";
    ox = (e.clientX - rect.left) / stageScale;
    oy = (e.clientY - rect.top)  / stageScale;
    panel.classList.add("dragging");
    e.preventDefault();
  });
  document.addEventListener("mousemove", function(e) {
    if (!dragging) return;
    var rp = getRightPanel();
    var rpRect = rp.getBoundingClientRect();
    var x = Math.max(0, Math.min((e.clientX - rpRect.left) / stageScale - ox, rp.offsetWidth  - panel.offsetWidth));
    var y = Math.max(0, Math.min((e.clientY - rpRect.top)  / stageScale - oy, rp.offsetHeight - panel.offsetHeight - 40));
    panel.style.left = x + "px";
    panel.style.top  = y + "px";
  });
  document.addEventListener("mouseup", function() {
    if (!dragging) return;
    dragging = false;
    panel.classList.remove("dragging");
  });
}

document.addEventListener("visibilitychange", function() {
  if (!sysmonState.isOpen) return;
  if (document.hidden) {
    if (sysmonState.intervalId) {
      clearInterval(sysmonState.intervalId);
      sysmonState.intervalId = setInterval(sysmonTick, 500);
    }
  } else {
    if (sysmonState.intervalId) {
      clearInterval(sysmonState.intervalId);
      var period = matchMedia("(prefers-reduced-motion: reduce)").matches ? 500 : (1000 / SYSMON_HZ);
      sysmonState.intervalId = setInterval(sysmonTick, period);
    }
  }
});

function sysmonInit() {
  sysmonRegisterReal();
  sysmonRegisterPsyche();
  sysmonRegisterWired();
  sysmonBuildOrder();
  sysmonBuildSidebar();
  sysmonAttachResize();
  sysmonInitDrag();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", sysmonInit);
} else {
  sysmonInit();
}
