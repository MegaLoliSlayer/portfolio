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

// ─── Lain GIF Sprites ────────────────────────────────────────
const GIF_FILES = [
  'lain1.webp',  'lain2.gif',  'lain3.gif',  'lain4.gif',
  'lain6.gif',   'lain7.gif',  'lain8.gif',  'lain9.gif',
  'lain10.gif',  'lain11.gif', 'lain12.gif', 'lain13.gif',
  'lain14.gif',  'lain15.gif', 'lain16.gif', 'lain17.gif',
  'lain18.gif',  'lain19.gif', 'lain20.gif', 'lain21.gif',
  'lain22.gif',  'lain23.gif', 'lain24.gif', 'lain25.gif',
  'lain26.gif',  'lain27.gif', 'lain28.gif', 'lain29.gif',
  'lain30.gif',  'lain31.gif',
];

// 6-column × 5-row full-background grid [left vw, top vh]
// Spacing: ~16.5vw × 22vh — at 200-320px GIFs: slight corner overlap only
const GIF_GRID = [
  [ 0.5,  0], [17,  0], [33.5,  0], [50,  0], [66.5,  0], [83,  0],
  [ 0.5, 22], [17, 22], [33.5, 22], [50, 22], [66.5, 22], [83, 22],
  [ 0.5, 44], [17, 44], [33.5, 44], [50, 44], [66.5, 44], [83, 44],
  [ 0.5, 66], [17, 66], [33.5, 66], [50, 66], [66.5, 66], [83, 66],
  [ 0.5, 88], [17, 88], [33.5, 88], [50, 88], [66.5, 88], [83, 88],
];

function createGif(file, left, top, size, delay) {
  const screen2 = document.getElementById('screen2');
  const img = document.createElement('img');
  img.src       = file;
  img.className = 'lain-gif';
  img.style.width = size + 'px';
  img.style.left  = left + 'vw';
  img.style.top   = top  + 'vh';
  screen2.appendChild(img);
  setTimeout(() => img.classList.add('visible'), delay);
}

function spawnGifs() {
  const minSize = 200;
  const maxSize = 320; // max < 2× min

  const shuffled = [...GIF_FILES].sort(() => Math.random() - 0.5);
  shuffled.forEach((file, i) => {
    const [baseL, baseT] = GIF_GRID[i % GIF_GRID.length];
    const left = baseL + (Math.random() * 4 - 2); // ±2vw jitter
    const top  = baseT + (Math.random() * 4 - 2); // ±2vh jitter
    const size = minSize + Math.floor(Math.random() * (maxSize - minSize + 1));
    createGif(file, left, top, size, i * 80);
  });
}

// ─── Platform Links ───────────────────────────────────────────
const LINKS = [
  { name: 'GitHub',       label: '[01] GitHub',        url: 'https://github.com/MegaLoliSlayer' },
  { name: 'Steam',        label: '[02] Steam',         url: 'https://steamcommunity.com/id/MegaLoliSlayer/' },
  { name: 'NetEase',      label: '[03] NetEase Music', url: 'https://music.163.com/playlist?id=2970962753&uct2=U2FsdGVkX18R6AjtMreh49ZCQBC5vxa9J6phSrEPocg=' },
  { name: 'MyAnimeList',  label: '[04] MyAnimeList',   url: 'https://myanimelist.net/profile/MegaLoliSlayer' },
  { name: 'Spotify',      label: '[05] Spotify',       url: 'https://open.spotify.com/playlist/5sWG2t5DumbG1jb8zD2HJ0?si=e986dda700e1443e&nd=1&dlsi=8ebdc819db284c27' },
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
    '──────────────────────────────────────',
    '  help              show this message',
    '  ls ./connections  list profile links',
    '  vim [name]        open profile page',
    '                    e.g. vim GitHub',
    '  Hello Lain        ???',
    '──────────────────────────────────────',
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
function updateNowPlaying(data) {
  if (!data || !data.track) return;

  const track  = data.track;
  const name   = track.name || '';
  const artist = track.artists && track.artists[0] ? track.artists[0].name : '';
  const imgUrl = track.album && track.album.images && track.album.images[0]
    ? track.album.images[0].url : '';
  const progress = data.duration > 0 ? (data.position / data.duration) * 100 : 0;

  // Show track info, hide placeholder
  document.getElementById('music-np-placeholder').style.display = 'none';
  const info = document.getElementById('music-np-info');
  info.classList.add('active');

  document.getElementById('music-track-name').textContent  = name;
  document.getElementById('music-artist-name').textContent = artist;
  document.getElementById('music-progress-bar').style.width = progress + '%';

  if (imgUrl) {
    const cover = document.getElementById('music-cover');
    cover.src = imgUrl;
    cover.alt = name + ' — ' + artist;
    const mini = document.getElementById('music-cover-mini');
    mini.src = imgUrl;
    mini.alt = name + ' — ' + artist;
    mini.classList.add('loaded');
    document.getElementById('music-title-mini').textContent = name + ' — ' + artist;
  }
}

function toggleMusicPanel() {
  document.getElementById('music-panel').classList.toggle('visible');
}

function toggleMusicMinimize() {
  document.getElementById('music-panel').classList.toggle('minimized');
}

function toggleMusicPlaylist() {
  document.getElementById('embed-iframe').classList.toggle('playlist-expanded');
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
    out.insertAdjacentText('beforeend', isVisible ? '> music player offline\n' : '> music player online\n');

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

  // Spawn GIFs across the background
  spawnGifs();

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

// ─── Spotify iFrame API ───────────────────────────────────────
window.onSpotifyIframeApiReady = (IFrameAPI) => {
  IFrameAPI.createController(
    document.getElementById('embed-iframe'),
    { uri: 'spotify:playlist:5sWG2t5DumbG1jb8zD2HJ0' },
    (controller) => {
      window.spotifyController = controller;
      controller.addListener('playback_update', (e) => {
        updateNowPlaying(e.data);
      });
    }
  );
};
