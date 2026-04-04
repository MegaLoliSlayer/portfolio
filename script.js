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
}

// ─── Start ────────────────────────────────────────────────────
runBootSequence().catch(console.error);
