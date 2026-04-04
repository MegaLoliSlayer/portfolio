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
  'lain1.webp', 'lain2.gif', 'lain3.gif', 'lain4.gif',
  'lain6.gif',  'lain7.gif', 'lain8.gif', 'lain9.gif',
  'lain10.gif', 'lain11.gif',
];

// Peripheral viewport zones [left%, top%] that surround the centered terminal
const GIF_ZONES = [
  [ 3,  4], [20,  7], [44,  3], [65,  5], [81,  4],
  [85, 36], [80, 72], [55, 83], [28, 81], [ 7, 70],
];

function spawnGifs() {
  const minSize = 80;
  const maxSize = 150; // max < 2× min

  const shuffled = [...GIF_FILES].sort(() => Math.random() - 0.5);

  shuffled.forEach((file, i) => {
    const [baseL, baseT] = GIF_ZONES[i % GIF_ZONES.length];
    const left = baseL + (Math.random() * 6 - 3);
    const top  = baseT + (Math.random() * 6 - 3);
    const size = minSize + Math.floor(Math.random() * (maxSize - minSize + 1));

    const img = document.createElement('img');
    img.src       = file;
    img.className = 'lain-gif';
    img.style.width = size + 'px';
    img.style.left  = left + 'vw';
    img.style.top   = top  + 'vh';
    document.body.appendChild(img);

    setTimeout(() => img.classList.add('visible'), i * 130);
  });
}

// ─── Platform Links ───────────────────────────────────────────
// Replace each URL with your actual profile link.
const LINKS = [
  { label: '[01] GitHub        ── source code', url: 'https://github.com/MegaLoliSlayer' },
  { label: '[02] Steam         ── gaming',      url: 'https://steamcommunity.com/id/MegaLoliSlayer/' },
  { label: '[03] NetEase Music ── music',       url: 'https://music.163.com/playlist?id=2970962753&uct2=U2FsdGVkX18R6AjtMreh49ZCQBC5vxa9J6phSrEPocg=' },
  { label: '[04] MyAnimeList   ── anime',       url: 'https://myanimelist.net/profile/MegaLoliSlayer' },
  { label: '[05] Spotify       ── playlists',   url: 'https://open.spotify.com/playlist/5sWG2t5DumbG1jb8zD2HJ0?si=e986dda700e1443e&nd=1&dlsi=8ebdc819db284c27' },
  { label: '[06] PlayStation   ── trophies',    url: 'https://profile.playstation.com/MEGA_Dropkick2' },
];

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

  // Intensify glitch before cutting
  screen1.classList.add('glitch-intensify');
  await wait(350);

  // Transition to Screen 2
  screen1.classList.remove('active');
  await wait(100);
  runTerminalSequence();
}

// ─── Screen 2: Terminal Hub ───────────────────────────────────
async function runTerminalSequence() {
  const screen2 = document.getElementById('screen2');
  const output  = document.getElementById('terminal-output');

  screen2.classList.add('active');

  await wait(200);

  // Type the whoami command and response
  await typeText(output, 'SADAME@WIRED:~$ ', 35);
  await typeText(output, 'whoami', 80);
  await wait(200);
  await typeText(output, '\n> SADAME — connected to the wired\n\n', 30);
  await wait(300);

  // Type the ls command
  await typeText(output, 'SADAME@WIRED:~$ ', 35);
  await typeText(output, 'ls ./connections\n', 80);
  await wait(200);

  // Reveal each link line one by one
  for (const link of LINKS) {
    const anchor = document.createElement('a');
    anchor.className = 'term-link';
    anchor.href      = link.url;
    anchor.target    = '_blank';
    anchor.rel       = 'noopener noreferrer';
    output.appendChild(anchor);

    await typeText(anchor, link.label, 22);
    await wait(80);
    output.appendChild(document.createTextNode('\n'));
  }

  // Spawn Lain GIFs around the terminal after links are revealed
  spawnGifs();
}

// ─── Start ────────────────────────────────────────────────────
runBootSequence().catch(console.error);
