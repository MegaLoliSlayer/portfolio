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
function bringToFront(el) {
  el.style.zIndex = ++topZ;
}

function getRightPanel() {
  return document.getElementById('right-panel');
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
    panel.style.top   = (rect.top  - rpRect.top)  + 'px';
    panel.style.left  = (rect.left - rpRect.left) + 'px';
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    panel.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rp = getRightPanel();
    const rpRect = rp.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - ox - rpRect.left, rp.offsetWidth  - panel.offsetWidth));
    const y = Math.max(0, Math.min(e.clientY - oy - rpRect.top,  rp.offsetHeight - panel.offsetHeight - 40));
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
    win.style.left = (rect.left - rpRect.left) + 'px';
    win.style.top  = (rect.top  - rpRect.top)  + 'px';
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    win.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rp = getRightPanel();
    const rpRect = rp.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - ox - rpRect.left, rp.offsetWidth  - win.offsetWidth));
    const y = Math.max(0, Math.min(e.clientY - oy - rpRect.top,  rp.offsetHeight - win.offsetHeight - 40));
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
    delete panel.dataset.savedWidth;
    delete panel.dataset.savedHeight;
    panel.classList.add('visible');
  }
}

function toggleMusicMinimize() {
  document.getElementById('music-panel').classList.add('minimized');
}

function toggleMusicPlaylist() {
  document.getElementById('embed-iframe').classList.toggle('playlist-expanded');
}

function expandMusicPanel() {
  document.getElementById('music-panel').classList.remove('minimized');
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
    panel.style.left   = (rect.left - rpRect.left) + 'px';
    panel.style.top    = (rect.top  - rpRect.top)  + 'px';
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    panel.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rp = getRightPanel();
    const rpRect = rp.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - ox - rpRect.left, rp.offsetWidth  - panel.offsetWidth));
    const y = Math.max(0, Math.min(e.clientY - oy - rpRect.top,  rp.offsetHeight - panel.offsetHeight - 40));
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
      document.getElementById('right-bg').src = match;
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

  // Show interactive prompt and wire up Enter key
  showPrompt();

  const input = document.getElementById('terminal-input');
  // Re-focus input when clicking anywhere on the terminal
  document.getElementById('screen2').addEventListener('click', () => {
    input.focus();
  });

  let processing = false;
  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !processing) {
      processing = true;
      const cmd = input.value;
      input.value = '';
      hidePrompt();
      await handleCommand(cmd);
      showPrompt();
      processing = false;
    }
  });
}

// ─── Start ────────────────────────────────────────────────────
runBootSequence().catch(console.error);
initMusicDrag();
initLainSide();
initTvPanel();
initTerminalDrag();

// ─── Viewport Resize: clamp dragged panels within bounds ──────
window.addEventListener('resize', () => {
  updateLainWidth();

  const rp = document.getElementById('right-panel');
  if (!rp) return;

  const panels = [
    document.querySelector('.terminal-window'),
    document.getElementById('music-panel'),
    document.getElementById('tv-panel'),
    document.getElementById('bg-picker'),
  ];
  panels.forEach(el => {
    if (!el || !el.style.left) return;
    const maxX = Math.max(0, rp.offsetWidth  - el.offsetWidth);
    const maxY = Math.max(0, rp.offsetHeight - el.offsetHeight - 40);
    if (parseFloat(el.style.left) > maxX) el.style.left = maxX + 'px';
    if (parseFloat(el.style.top)  > maxY) el.style.top  = maxY + 'px';
  });
});

