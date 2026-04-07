# Screen 2 Feature Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add terminal upgrades, three new draggable panels (About, Sysmon, Diary), ambient atmosphere effects (idle screensaver, CRT static, random wired chatter), themed bracket-style window control buttons, and a connections-default-on tweak to a Lain/WIRED-themed portfolio site.

**Architecture:** Single-file expansion. New code is appended at the bottom of `script.js` under section banners that match the existing convention. New HTML blocks go inside `#right-panel` (panels) or as last children of `<body>` (full-viewport overlays). New CSS is appended to `style.css`. No new files, no build step.

**Tech Stack:** Vanilla HTML / CSS / JavaScript (ES6, no modules, no framework). Single `script.js` file. The site is opened directly in a browser — no dev server, no tests, no build pipeline.

**Spec:** `docs/superpowers/specs/2026-04-06-screen2-features-design.md`

**Verification model:** Every task ends with a manual browser check. To verify: open `index.html` in a browser (refresh to pick up changes), perform the listed actions, and confirm the listed expectations. There is no automated test suite; "the test passes" means "the manual verification matches the expected output".

---

## Task 1: Connections sidebar opens by default on screen 2

**Files:**
- Modify: `script.js` (inside `runTerminalSequence`)

- [ ] **Step 1: Make the change**

In `script.js`, find `runTerminalSequence()` (around line 675). After the existing `updateTaskbar();` call (around line 705, just before `showPrompt();`), insert one line so it reads:

```js
  updateTaskbar();

  // Connections sidebar opens by default
  toggleConnectionsSidebar();

  // Show interactive prompt and wire up Enter key
  showPrompt();
```

- [ ] **Step 2: Manual verification**

Open `index.html` in a browser. Wait for the boot sequence to finish and screen 2 to appear.

Expected:
- The connections sidebar slides in from the left automatically (alongside the terminal/music/TV first-show animations).
- The `⠿ connections` taskbar button is highlighted (cyan border, glow).
- Clicking the X on the sidebar closes it; the taskbar button unhighlights.
- Clicking the taskbar button reopens it.

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: open connections sidebar by default on screen 2"
```

---

## Task 2: Replace traffic-light dots with bracket-style window buttons

**Files:**
- Modify: `index.html` (six titlebars: terminal, tv, music — about/sysmon/diary will use the new style when added in later tasks)
- Modify: `style.css` (remove `.dot*` rules, add `.win-btn` rules)
- Modify: `script.js` (rename `.terminal-dot` / `.tv-dot` / `.music-dot` checks to `.win-btn`)

- [ ] **Step 1: Add the new CSS rules**

Append to the bottom of `style.css`:

```css
/* ─── Window Control Buttons ─────────────────── */
.win-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  height: 18px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.78rem;
  line-height: 1;
  color: #00ffcc88;
  background: transparent;
  border: 1px solid #00ffcc44;
  border-radius: 0;
  user-select: none;
  animation: cursor-pointer 800ms steps(1) infinite;
  transition: color 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.win-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 8px #00ffcc88;
}

.win-btn-close:hover {
  color: var(--danger);
  border-color: var(--danger);
  box-shadow: 0 0 8px #ff003c88;
}
```

- [ ] **Step 2: Remove the old dot CSS**

In `style.css`, delete these blocks (search and remove):

- The `.dot { … }` rule and the three `.dot-red`, `.dot-yellow`, `.dot-green` rules (around lines 233–241).
- The `.terminal-dot { … }` and `.terminal-dot:hover { … }` rules (around lines 243–258).
- The `.tv-dot { … }` and `.tv-dot:hover { … }` rules (around lines 492–507).
- The `.music-dot { … }` and `.music-dot:hover { … }` rules (around lines 630–645).

- [ ] **Step 3: Update the terminal titlebar HTML**

In `index.html`, find the terminal titlebar (around line 86–91) and replace its three dot spans:

```html
<div class="terminal-titlebar">
  <span class="win-btn win-btn-close" onclick="closeTerminal()" title="Close">[×]</span>
  <span class="win-btn"               onclick="minimizeTerminal()" title="Minimize">[−]</span>
  <span class="win-btn"               onclick="restoreTerminal()" title="Restore">[+]</span>
  <span class="terminal-title">SADAME@WIRED:~</span>
</div>
```

- [ ] **Step 4: Update the TV titlebar HTML**

In `index.html`, find the TV titlebar (around line 103–108) and replace its three dot spans:

```html
<div class="tv-titlebar">
  <span class="win-btn win-btn-close" onclick="closeTvPanel()" title="Close">[×]</span>
  <span class="win-btn"               onclick="toggleTvMinimize()" title="Minimize">[−]</span>
  <span class="win-btn"               onclick="expandTvPanel()" title="Restore">[+]</span>
  <span class="tv-title">WIRED://TV</span>
</div>
```

- [ ] **Step 5: Update the music titlebar HTML**

In `index.html`, find the music titlebar (around line 124–131) and replace its three dot spans:

```html
<div class="music-titlebar">
  <span class="win-btn win-btn-close" onclick="toggleMusicPanel()" title="Close">[×]</span>
  <span class="win-btn"               onclick="toggleMusicMinimize()" title="Minimize">[−]</span>
  <span class="win-btn"               onclick="expandMusicPanel()" title="Restore">[+]</span>
  <div class="music-title-wrap">
    <span class="music-title-mini">SADAME@WIRED:~/music</span>
  </div>
</div>
```

- [ ] **Step 6: Update drag handlers in script.js**

In `script.js`, the four drag handlers each contain a guard like `if (e.target.classList.contains('terminal-dot')) return;`. Update each:

In `initTerminalDrag` (around line 366):
```js
  if (e.target.classList.contains('win-btn')) return;
```

In `initTvPanel` (around line 310):
```js
  if (e.target.classList.contains('win-btn')) return;
```

In `initMusicDrag` (around line 526):
```js
  if (e.target.classList.contains('win-btn')) return;
```

(`initBgPicker` checks `picker-close`, not a dot — leave it alone.)

- [ ] **Step 7: Manual verification**

Refresh the browser.

Expected:
- All three panels (terminal, TV, music) now show `[×] [−] [+]` bracketed buttons in their titlebars instead of red/yellow/green circles.
- The buttons render with a 1px cyan border, dim cyan glyph, transparent background.
- Hovering `[−]` or `[+]` brightens the border + text to bright cyan with a cyan glow.
- Hovering `[×]` brightens the border + text to red (`#ff003c`) with a red glow.
- Clicking `[×]` on each panel closes it. Clicking `[−]` minimizes. Clicking `[+]` restores.
- Dragging by clicking the *titlebar background* (not the buttons) still works for all three panels.
- Clicking a button does NOT initiate a drag.

- [ ] **Step 8: Commit**

```bash
git add index.html style.css script.js
git commit -m "feat: replace macOS-style window dots with bracket buttons"
```

---

## Task 3: Terminal command history (↑/↓ arrow keys)

**Files:**
- Modify: `script.js` (inside `runTerminalSequence`'s keydown listener)

- [ ] **Step 1: Add module-level state**

In `script.js`, near the top of the file (just below the `let topZ = 20;` line around line 32), add:

```js
// ─── Terminal Command History ──────────────────────────────
let commandHistory = [];
let historyIndex = -1;
```

- [ ] **Step 2: Update the keydown handler**

In `runTerminalSequence()`, find the `input.addEventListener('keydown', …)` block (around lines 723–733). Replace it with:

```js
  let processing = false;
  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !processing) {
      processing = true;
      const cmd = input.value;
      input.value = '';
      hidePrompt();
      await handleCommand(cmd);
      if (cmd.trim()) {
        commandHistory.push(cmd);
        historyIndex = commandHistory.length;
      }
      showPrompt();
      processing = false;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = commandHistory[historyIndex] || '';
      // Move caret to end
      setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      historyIndex = Math.min(commandHistory.length, historyIndex + 1);
      input.value = commandHistory[historyIndex] || '';
      setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
    }
  });
```

- [ ] **Step 3: Manual verification**

Refresh the browser, click the terminal, and:
- Type `help` and press Enter.
- Type `tv` and press Enter.
- Type `clear` and press Enter.
- Press ↑ once → input shows `clear`.
- Press ↑ again → input shows `tv`.
- Press ↑ again → input shows `help`.
- Press ↑ again → input still shows `help` (clamped at start).
- Press ↓ → input shows `tv`.
- Press ↓ → input shows `clear`.
- Press ↓ → input clears (past the end).

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: terminal command history via arrow keys"
```

---

## Task 4: Terminal tab autocomplete

**Files:**
- Modify: `script.js` (extend the keydown handler from Task 3)

- [ ] **Step 1: Add a helper for completion candidates**

In `script.js`, just above `function handleCommand` (around line 558), add:

```js
// ─── Tab Autocomplete ─────────────────────────────────────────
const TERMINAL_COMMANDS = [
  'help', 'clear', 'ls ./connections', 'vim ', 'hello lain',
  'music', 'tv', 'background', 'background ',
  'whoami', 'about', 'date', 'uptime', 'navi', 'static',
];

function autocomplete(value) {
  // Returns { completion: string|null, candidates: string[] }
  // completion: a new full input string (when there's exactly one match)
  // candidates: list to print to terminal (when there are multiple)
  if (!value) return { completion: null, candidates: [] };

  // vim <name>
  if (/^vim\s+/i.test(value)) {
    const partial = value.replace(/^vim\s+/i, '');
    const matches = LINKS
      .map(l => l.name)
      .filter(n => n.toLowerCase().startsWith(partial.toLowerCase()));
    if (matches.length === 1) return { completion: 'vim ' + matches[0], candidates: [] };
    if (matches.length > 1)  return { completion: null, candidates: matches };
    return { completion: null, candidates: [] };
  }

  // background <name>
  if (/^background\s+/i.test(value)) {
    const partial = value.replace(/^background\s+/i, '');
    const matches = BACKGROUND_FILES
      .map(f => f.replace('background/', ''))
      .filter(n => n.toLowerCase().startsWith(partial.toLowerCase()));
    if (matches.length === 1) return { completion: 'background ' + matches[0], candidates: [] };
    if (matches.length > 1)  return { completion: null, candidates: matches };
    return { completion: null, candidates: [] };
  }

  // Top-level command
  const matches = TERMINAL_COMMANDS.filter(c => c.startsWith(value.toLowerCase()));
  if (matches.length === 1) return { completion: matches[0], candidates: [] };
  if (matches.length > 1)  return { completion: null, candidates: matches };
  return { completion: null, candidates: [] };
}
```

- [ ] **Step 2: Wire Tab into the keydown handler**

In `runTerminalSequence`, in the keydown handler from Task 3, add a Tab branch *before* the ArrowUp branch:

```js
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const result = autocomplete(input.value);
      if (result.completion) {
        input.value = result.completion;
        setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
      } else if (result.candidates.length > 0) {
        const out = getOutput();
        out.insertAdjacentText('beforeend', 'SADAME@WIRED:~$ ' + input.value + '\n');
        out.insertAdjacentText('beforeend', result.candidates.join('  ') + '\n\n');
        scrollTerminal();
      }
    } else if (e.key === 'ArrowUp') {
```

- [ ] **Step 3: Manual verification**

Refresh, click the terminal:
- Type `he` and press Tab → completes to `help`.
- Type `b` and press Tab → completes to `background` (because `background` is shorter — wait, both `background` and `background ` start with `b`. Two matches: prints `background  background ` on a new line.
- Actually: type `back` and press Tab → two candidates printed (`background` and `background `).
- Type `vim G` and press Tab → completes to `vim GitHub`.
- Type `vim ` and press Tab → prints all six link names on a new line.
- Type `background lain1` and press Tab → completes to `background lain1.webp`.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: terminal tab autocomplete for commands and link/bg names"
```

---

## Task 5: Terminal `date` and `uptime` commands

**Files:**
- Modify: `script.js` (capture `bootTime`, add two command branches)

- [ ] **Step 1: Capture bootTime**

In `script.js`, near the top (just below the `let historyIndex = -1;` line from Task 3), add:

```js
let bootTime = 0;
```

In `runTerminalSequence`, at the very start of the function (just after `const screen2 = …`), add:

```js
  bootTime = Date.now();
```

- [ ] **Step 2: Add the command branches**

In `handleCommand`, add two new `else if` branches before the final `else { … command not found }` branch:

```js
  } else if (lower === 'date') {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const stamp =
      now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) +
      ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
    out.insertAdjacentText('beforeend', `current time: ${stamp} [WIRED]\n`);

  } else if (lower === 'uptime') {
    const ms = Date.now() - bootTime;
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000) % 24;
    const d = Math.floor(ms / 86400000);
    const pad = n => String(n).padStart(2, '0');
    out.insertAdjacentText('beforeend',
      `wired uptime: ${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s — connection stable\n`);
```

- [ ] **Step 3: Manual verification**

Refresh, click the terminal:
- Type `date` → prints `current time: 2026-04-06 14:23:11 [WIRED]` (with the actual current time).
- Type `uptime` → prints `wired uptime: 0d 00h 00m 12s — connection stable` (with whatever elapsed time).
- Wait 30 seconds, type `uptime` again → seconds value is ~30 higher.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: add date and uptime terminal commands"
```

---

## Task 6: Expose `triggerLainDialog` and add `navi` command

**Files:**
- Modify: `script.js` (refactor `initLainSide`, add `navi` command)

- [ ] **Step 1: Refactor initLainSide to expose triggerLainDialog**

In `script.js`, find `initLainSide()` (around line 112) and replace its `showDialog` inner function and the click handler with:

```js
function initLainSide() {
  const lain8      = document.getElementById('lain8');
  lain8.addEventListener('load', updateLainWidth);
  updateLainWidth(); // in case already loaded (cached)
  const bubble     = document.getElementById('lain-bubble');
  const bubbleText = document.getElementById('lain-bubble-text');

  let closeTimer = null;
  let lastIndex  = -1;

  function showDialogAt(idx) {
    lastIndex = idx;
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    bubbleText.textContent = LAIN_DIALOGS[idx];
    bubble.classList.add('visible');
    closeTimer = setTimeout(() => {
      bubble.classList.remove('visible');
      closeTimer = null;
    }, 5000);
  }

  function showRandomDialog() {
    let idx;
    do { idx = Math.floor(Math.random() * LAIN_DIALOGS.length); }
    while (idx === lastIndex && LAIN_DIALOGS.length > 1);
    showDialogAt(idx);
  }

  // Expose for the navi terminal command
  window.triggerLainDialog = showDialogAt;

  lain8.addEventListener('click', (e) => {
    e.stopPropagation();
    showRandomDialog();
  });
}
```

- [ ] **Step 2: Add the navi command**

In `handleCommand`, add a new branch before the final `else`:

```js
  } else if (lower === 'navi') {
    const idx = Math.floor(Math.random() * LAIN_DIALOGS.length);
    const line = LAIN_DIALOGS[idx].replace(/\n/g, ' ');
    out.insertAdjacentText('beforeend', `navi> ${line}\n`);
    if (window.triggerLainDialog) window.triggerLainDialog(idx);
```

- [ ] **Step 3: Manual verification**

Refresh.
- Click Lain on the left → speech bubble still shows a random dialog (existing behavior unbroken).
- Click the terminal, type `navi` → terminal prints `navi> <some lain dialog>` AND the speech bubble on the left appears with the same dialog.
- Type `navi` again → different (or same — random) dialog appears in both places.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: navi terminal command syncs lain bubble with terminal output"
```

---

## Task 7: About panel (HTML, CSS, JS, taskbar button, terminal commands)

**Files:**
- Modify: `index.html` (panel block + taskbar button)
- Modify: `style.css` (panel + lang toggle styles)
- Modify: `script.js` (init/toggle/setLang/drag, `whoami` and `about` commands, taskbar map)

- [ ] **Step 1: Add the About panel HTML**

In `index.html`, inside `#right-panel`, immediately after the closing `</div>` of the music panel (around line 145, just before the `<!-- Background Picker -->` comment), insert:

```html
      <!-- About Panel -->
      <div id="about-panel">
        <div class="about-titlebar">
          <span class="win-btn win-btn-close" onclick="toggleAboutPanel()" title="Close">[×]</span>
          <span class="win-btn"               onclick="minimizeAboutPanel()" title="Minimize">[−]</span>
          <span class="win-btn"               onclick="expandAboutPanel()" title="Restore">[+]</span>
          <span class="about-title">SADAME@WIRED:~/about</span>
        </div>
        <div class="about-body lang-en">
          <div class="about-lang-toggle">
            <button class="about-lang-btn" data-lang="en" onclick="setAboutLang('en')">[ EN ]</button>
            <button class="about-lang-btn" data-lang="cn" onclick="setAboutLang('cn')">[ 中文 ]</button>
          </div>

          <div class="about-en">
            <p>For EN Users:</p>
            <p>There's really nothing special about me.</p>
            <p>Pluviophile (stands for people who loves rain) describes me well I think, since I hate the flowing of time and I believe rain has the magic to stop everything from moving.</p>
            <p>I really hate sunny days, and I hate people hustling on their ways just for money or a hollow goal. I wouldn't put any more details on the deeper stuff, diving into my mind makes me exhausted and i really wish preventing that from happening (to you and to me)...</p>

            <p class="about-heading">// what i like</p>
            <p>I like all sorts of games but not a pro on gaming (Mainly PSN, NS and PC), and I watch a lot of anime just to keep me away from the reality. The music that I listen to is mainly thrash and industrial metal, but I do listen to some ACG music as well.</p>
            <pre class="about-kv">  favorite band         :: Rammstein, Pantera
  favorite ACG producer :: 麻枝 准
  movie bible           :: Fight Club
  anime bible           :: Evangelion</pre>
            <p>Here is some of my list if by any chance you are interested in getting to know me:</p>
            <p>
              <a href="https://open.spotify.com/playlist/4MWZmsObrlhg0dBGmSu1b6" target="_blank" rel="noopener noreferrer" class="about-link">My Music List [open.spotify.com]</a><br>
              <a href="https://myanimelist.net/profile/MegaLoliSlayer" target="_blank" rel="noopener noreferrer" class="about-link">My Anime List [myanimelist.net]</a>
            </p>

            <p class="about-heading">// what i do</p>
            <p>Gaming and anime occupies most of my time (Currently major in computer engineering so i have to study sometime).</p>
            <p>But if you ask me what I like the most: Doing nothing...</p>
          </div>

          <div class="about-cn">
            <p>给国人好友的自我介绍:</p>
            <p>鼠鼠稍微有点宅 除了上学之外基本上都在家里躺尸 喜欢下雨讨厌晴天 下雨可以停止时间（鼠鼠是这么认为的）具体为什么就不解释了 （缕清自己的思绪很累所以想尽量控制自己不要多想）总之希望大家都能开心的做自己想做的事情</p>

            <p class="about-heading">// 喜欢的事情</p>
            <p>某只兔子</p>
            <p>喜欢各种类型的游戏（每个平台的游戏都有玩 PSN NS 和 PC）喜欢收集游戏（穷学生库存不太丰富）有时候太累了就不太会玩游戏 所以有很多游戏都在库里躺着吃灰</p>
            <p>喜欢收集手办（经常为了买游戏和手办饿肚子）</p>
            <p>喜欢看番（什么类型的都会看）最喜欢日常和意识流</p>
            <p>喜欢工业和鞭挞金属 也喜欢ACG（偶尔也会收集两张自己喜欢乐队的专辑）</p>
            <pre class="about-kv">  最喜欢的乐队     :: Rammstein, Pantera
  最喜欢的ACG制作人 :: 麻枝 准
  电影圣经         :: 搏击俱乐部
  动漫圣经         :: 新世纪福音战士</pre>
            <p>歌单和追番列表的传送门：</p>
            <p>
              <a href="https://music.163.com/playlist?id=2970962753" target="_blank" rel="noopener noreferrer" class="about-link">我的歌单 [music.163.com]</a><br>
              <a href="https://myanimelist.net/profile/MegaLoliSlayer" target="_blank" rel="noopener noreferrer" class="about-link">我的追番列表 [myanimelist.net]</a>
            </p>

            <p class="about-heading">// 鼠鼠的日常</p>
            <p>平时主要都在打游戏和看番 因为是大学专业选的是computer engineering 所以偶尔也会学习（弄反了bushi）</p>
            <p>但是平时还是最喜欢躺尸</p>
          </div>

          <div class="about-footer">last update :: 2024-10-27</div>
        </div>
      </div>
```

- [ ] **Step 2: Add the About taskbar button**

In `index.html`, inside `#taskbar-buttons` (around line 158), append:

```html
          <button class="tb-btn" id="tb-about" onclick="toggleAboutPanel()">⌂ about</button>
```

…immediately after the `tb-background` button so the order is: terminal, connections, music, tv, background, about.

- [ ] **Step 3: Add the About panel CSS**

Append to `style.css`:

```css
/* ─── About Panel ────────────────────────────── */
#about-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 460px;
  max-width: calc(100% - 32px);
  max-height: 70vh;
  z-index: 13;
  display: none;
  flex-direction: column;
  background: var(--terminal-bg);
  border: 1px solid #00ffcc44;
  border-radius: 8px;
  box-shadow: var(--glow), inset 0 0 60px rgba(0,255,204,0.04);
  backdrop-filter: blur(8px);
  overflow: hidden;
}

#about-panel.visible {
  display: flex;
}

#about-panel.minimized .about-body {
  display: none;
}

#about-panel.about-first-show {
  animation: music-zoomout 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.about-titlebar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: rgba(0, 255, 204, 0.06);
  border-bottom: 1px solid #00ffcc33;
  user-select: none;
  animation: cursor-drag 800ms steps(1) infinite;
  flex-shrink: 0;
}

.about-title {
  margin-left: 8px;
  font-size: 0.85rem;
  color: var(--accent);
  opacity: 0.8;
  letter-spacing: 0.08em;
}

.about-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 18px 18px;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text);
}

.about-body.lang-en .about-cn { display: none; }
.about-body.lang-cn .about-en { display: none; }

.about-lang-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  justify-content: flex-end;
}

.about-lang-btn {
  background: transparent;
  border: 1px solid #00ffcc33;
  color: #00ffcc88;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 0;
  animation: cursor-pointer 800ms steps(1) infinite;
  transition: color 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.about-lang-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 6px #00ffcc66;
}

.about-body.lang-en .about-lang-btn[data-lang="en"],
.about-body.lang-cn .about-lang-btn[data-lang="cn"] {
  color: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 6px #00ffcc66;
}

.about-en p,
.about-cn p {
  margin: 0 0 10px 0;
}

.about-heading {
  color: var(--accent);
  text-shadow: 0 0 6px var(--accent);
  margin-top: 14px !important;
  margin-bottom: 8px !important;
  letter-spacing: 0.04em;
}

.about-kv {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.82rem;
  color: #00ffccaa;
  background: rgba(0, 255, 204, 0.04);
  border-left: 2px solid #00ffcc44;
  padding: 8px 12px;
  margin: 0 0 12px 0;
  white-space: pre;
  overflow-x: auto;
}

.about-link {
  color: var(--accent);
  text-decoration: none;
  text-shadow: 0 0 6px var(--accent);
  animation: cursor-pointer 800ms steps(1) infinite;
}

.about-link:hover {
  text-shadow: 0 0 14px var(--accent), 0 0 30px var(--accent);
}

.about-footer {
  margin-top: 16px;
  font-size: 0.72rem;
  color: #00ffcc55;
  text-align: right;
  letter-spacing: 0.08em;
}
```

- [ ] **Step 4: Add the About panel JS**

Append to `script.js` (after the existing init functions, before the `// ─── Start ───` section):

```js
// ─── About Panel ─────────────────────────────────────────────
function toggleAboutPanel() {
  const panel = document.getElementById('about-panel');
  if (panel.classList.contains('visible')) {
    panel.classList.remove('visible');
  } else {
    panel.classList.add('visible');
    bringToFront(panel);
    if (!panel.dataset.shown) {
      panel.dataset.shown = '1';
      panel.classList.add('about-first-show');
      setTimeout(() => panel.classList.remove('about-first-show'), 700);
    }
  }
  updateTaskbar();
}

function minimizeAboutPanel() {
  document.getElementById('about-panel').classList.add('minimized');
}

function expandAboutPanel() {
  document.getElementById('about-panel').classList.remove('minimized');
}

function setAboutLang(lang) {
  const body = document.querySelector('#about-panel .about-body');
  body.classList.toggle('lang-en', lang === 'en');
  body.classList.toggle('lang-cn', lang === 'cn');
}

function initAboutPanel() {
  const panel    = document.getElementById('about-panel');
  const titlebar = panel.querySelector('.about-titlebar');
  let dragging = false, ox = 0, oy = 0;

  panel.addEventListener('mousedown', () => bringToFront(panel));

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('win-btn')) return;
    if (e.target.classList.contains('about-lang-btn')) return;
    dragging = true;
    const rect   = panel.getBoundingClientRect();
    const rpRect = getRightPanel().getBoundingClientRect();
    panel.style.transform = 'none';
    panel.style.left = (rect.left - rpRect.left) + 'px';
    panel.style.top  = (rect.top  - rpRect.top)  + 'px';
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
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

  document.addEventListener('mouseup', () => { dragging = false; });
}
```

- [ ] **Step 5: Wire init call and update taskbar map**

In `script.js`, in the `// ─── Start ───` section (around line 736), add `initAboutPanel();` after `initBgPicker();`:

```js
runBootSequence().catch(console.error);
initMusicDrag();
initLainSide();
initTvPanel();
initTerminalDrag();
initConnectionsSidebar();
initBgPicker();
initAboutPanel();
```

In `updateTaskbar()` (around line 41), add the About entry to the `states` map:

```js
function updateTaskbar() {
  const states = {
    'tb-terminal':    document.querySelector('.terminal-window').classList.contains('visible'),
    'tb-connections': document.getElementById('connections-sidebar').classList.contains('visible'),
    'tb-music':       document.getElementById('music-panel').classList.contains('visible'),
    'tb-tv':          document.getElementById('tv-panel').classList.contains('visible'),
    'tb-background':  document.getElementById('bg-picker').classList.contains('visible'),
    'tb-about':       document.getElementById('about-panel').classList.contains('visible'),
  };
  Object.entries(states).forEach(([id, active]) => {
    document.getElementById(id).classList.toggle('active', active);
  });
}
```

- [ ] **Step 6: Add `about` and `whoami` terminal commands**

In `handleCommand`, add two new branches before the final `else`:

```js
  } else if (lower === 'about') {
    toggleAboutPanel();
    out.insertAdjacentText('beforeend', '> opening profile...\n');

  } else if (lower === 'whoami') {
    out.insertAdjacentText('beforeend', '> SADAME @ wired\n');
    out.insertAdjacentText('beforeend', '> layer 07 :: pluviophile\n');
    out.insertAdjacentText('beforeend', "> type 'about' or click [⌂ about] for full profile\n");
    setTimeout(() => {
      const panel = document.getElementById('about-panel');
      if (!panel.classList.contains('visible')) toggleAboutPanel();
    }, 400);
```

- [ ] **Step 7: Add the resize-clamp entry**

In the `window.addEventListener('resize', …)` handler (around lines 746–765), add `document.getElementById('about-panel'),` to the `panels` array:

```js
  const panels = [
    document.querySelector('.terminal-window'),
    document.getElementById('music-panel'),
    document.getElementById('tv-panel'),
    document.getElementById('bg-picker'),
    document.getElementById('about-panel'),
  ];
```

- [ ] **Step 8: Manual verification**

Refresh.
- Click `⌂ about` in the taskbar → About panel zooms in centered, taskbar button highlights.
- The body shows the EN content first (`For EN Users:` … `// what i like` … the kv block … `// what i do`).
- Click `[ 中文 ]` → switches to CN content (`给国人好友的自我介绍:` etc.).
- Click `[ EN ]` → switches back.
- Drag the titlebar → panel moves; clicking the lang toggle buttons does NOT initiate drag.
- Click `[−]` → body collapses to titlebar only.
- Click `[+]` → body expands again.
- Click `[×]` → panel closes, taskbar button unhighlights.
- Click the terminal, type `about` → panel reopens, terminal prints `> opening profile...`.
- Type `about` again → panel closes (toggle).
- Type `whoami` → terminal prints the three `>` lines AND about panel opens after a brief delay.
- Resize the browser window → the about panel stays within bounds (if you've dragged it).

- [ ] **Step 9: Commit**

```bash
git add index.html style.css script.js
git commit -m "feat: add About panel with EN/CN bio toggle"
```

---

## Task 8: System Monitor panel

**Files:**
- Modify: `index.html` (panel block + taskbar button)
- Modify: `style.css` (panel styles)
- Modify: `script.js` (init/toggle/tick/drag, taskbar map)

- [ ] **Step 1: Add the Sysmon HTML**

In `index.html`, immediately after the closing `</div>` of the about panel (added in Task 7), insert:

```html
      <!-- Sysmon Panel -->
      <div id="sysmon-panel">
        <div class="sysmon-titlebar">
          <span class="win-btn win-btn-close" onclick="toggleSysmonPanel()" title="Close">[×]</span>
          <span class="win-btn"               onclick="minimizeSysmonPanel()" title="Minimize">[−]</span>
          <span class="win-btn"               onclick="expandSysmonPanel()" title="Restore">[+]</span>
          <span class="sysmon-title">SADAME@WIRED:~/sysmon</span>
        </div>
        <pre class="sysmon-body" id="sysmon-body"></pre>
      </div>
```

- [ ] **Step 2: Add the Sysmon taskbar button**

In `#taskbar-buttons`, after the `tb-about` button:

```html
          <button class="tb-btn" id="tb-sysmon" onclick="toggleSysmonPanel()">▤ sysmon</button>
```

- [ ] **Step 3: Add the Sysmon CSS**

Append to `style.css`:

```css
/* ─── Sysmon Panel ───────────────────────────── */
#sysmon-panel {
  position: absolute;
  top: 24px;
  left: 24px;
  width: 240px;
  z-index: 11;
  display: none;
  flex-direction: column;
  background: var(--terminal-bg);
  border: 1px solid #00ffcc44;
  border-radius: 8px;
  box-shadow: var(--glow);
  backdrop-filter: blur(8px);
  overflow: hidden;
}

#sysmon-panel.visible {
  display: flex;
}

#sysmon-panel.minimized .sysmon-body {
  display: none;
}

#sysmon-panel.sysmon-first-show {
  animation: music-zoomout 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.sysmon-titlebar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  background: rgba(0, 255, 204, 0.06);
  border-bottom: 1px solid #00ffcc33;
  user-select: none;
  animation: cursor-drag 800ms steps(1) infinite;
  flex-shrink: 0;
}

.sysmon-title {
  margin-left: 6px;
  font-size: 0.78rem;
  color: var(--accent);
  opacity: 0.8;
  letter-spacing: 0.06em;
}

.sysmon-body {
  margin: 0;
  padding: 12px 14px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.78rem;
  line-height: 1.7;
  color: #00ffccbb;
  white-space: pre;
}
```

- [ ] **Step 4: Add the Sysmon JS**

Append to `script.js`:

```js
// ─── Sysmon Panel ────────────────────────────────────────────
let sysmonState = {
  cpu: 50, mem: 50, proc: 800, ping: 14, layer: 7, tickN: 0,
};
let sysmonInterval = null;

function bar(pct, width = 10) {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function sysmonTick() {
  sysmonState.tickN++;
  // Random walks
  sysmonState.cpu  = Math.max(20, Math.min(95, sysmonState.cpu  + (Math.random() * 10 - 5)));
  sysmonState.mem  = Math.max(20, Math.min(95, sysmonState.mem  + (Math.random() * 10 - 5)));
  sysmonState.proc = Math.max(600, Math.min(1000, sysmonState.proc + Math.round(Math.random() * 40 - 20)));
  sysmonState.ping = 8 + Math.floor(Math.random() * 17);

  // Occasional layer swap (~10% per tick)
  if (Math.random() < 0.10) {
    const layers = [3, 7, 13];
    sysmonState.layer = layers[Math.floor(Math.random() * layers.length)];
  }

  const cpu = Math.round(sysmonState.cpu);
  const mem = Math.round(sysmonState.mem);
  const layerStr = 'layer ' + String(sysmonState.layer).padStart(2, '0');

  document.getElementById('sysmon-body').textContent =
    `CPU   ${bar(cpu)}  ${String(cpu).padStart(2)}%\n` +
    `MEM   ${bar(mem)}  ${String(mem).padStart(2)}%\n` +
    `NET   ██████████  ${layerStr}\n` +
    `PROC  ${sysmonState.proc} / 1024\n` +
    `PING  ${sysmonState.ping}ms → wired`;
}

function toggleSysmonPanel() {
  const panel = document.getElementById('sysmon-panel');
  if (panel.classList.contains('visible')) {
    panel.classList.remove('visible');
    if (sysmonInterval) { clearInterval(sysmonInterval); sysmonInterval = null; }
  } else {
    panel.classList.add('visible');
    bringToFront(panel);
    if (!panel.dataset.shown) {
      panel.dataset.shown = '1';
      panel.classList.add('sysmon-first-show');
      setTimeout(() => panel.classList.remove('sysmon-first-show'), 700);
    }
    sysmonTick();
    sysmonInterval = setInterval(sysmonTick, 1200);
  }
  updateTaskbar();
}

function minimizeSysmonPanel() {
  document.getElementById('sysmon-panel').classList.add('minimized');
}

function expandSysmonPanel() {
  document.getElementById('sysmon-panel').classList.remove('minimized');
}

function initSysmonPanel() {
  const panel    = document.getElementById('sysmon-panel');
  const titlebar = panel.querySelector('.sysmon-titlebar');
  let dragging = false, ox = 0, oy = 0;

  panel.addEventListener('mousedown', () => bringToFront(panel));

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('win-btn')) return;
    dragging = true;
    const rect   = panel.getBoundingClientRect();
    const rpRect = getRightPanel().getBoundingClientRect();
    panel.style.left = (rect.left - rpRect.left) + 'px';
    panel.style.top  = (rect.top  - rpRect.top)  + 'px';
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
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

  document.addEventListener('mouseup', () => { dragging = false; });
}
```

- [ ] **Step 5: Wire init call, taskbar, resize-clamp**

In the `// ─── Start ───` section, add `initSysmonPanel();` after `initAboutPanel();`.

In `updateTaskbar()`, add to the `states` map:
```js
    'tb-sysmon':      document.getElementById('sysmon-panel').classList.contains('visible'),
```

In the resize handler `panels` array, add:
```js
    document.getElementById('sysmon-panel'),
```

- [ ] **Step 6: Manual verification**

Refresh.
- Click `▤ sysmon` in the taskbar → panel zooms in at top-left, taskbar button highlights.
- Body shows five lines: `CPU`, `MEM`, `NET`, `PROC`, `PING` with 10-char bars.
- Watch for ~10 seconds: CPU and MEM bars drift up and down. PROC and PING numbers change. NET layer label occasionally flips between `layer 03` / `layer 07` / `layer 13`.
- Drag the titlebar → panel moves.
- Click `[−]` → body collapses. `[+]` restores.
- Click `[×]` → closes. The bars stop updating (no console errors, no CPU burn).
- Reopen → bars resume updating.

- [ ] **Step 7: Commit**

```bash
git add index.html style.css script.js
git commit -m "feat: add system monitor panel with animated stats"
```

---

## Task 9: Diary panel

**Files:**
- Modify: `index.html` (panel block + taskbar button)
- Modify: `style.css` (panel styles)
- Modify: `script.js` (`LAIN_DIARY` array, init/toggle/drag, taskbar map)

- [ ] **Step 1: Add the LAIN_DIARY array**

In `script.js`, immediately after the `LAIN_DIALOGS` array (around line 108), add:

```js
// ─── Lain Diary Entries ───────────────────────────────────────
const LAIN_DIARY = [
  { id: '0x07', date: '09.13.???? 03:42', body:
    "the rain hasn't stopped for nine days.\n" +
    "i think it's stopped for everyone else.\n" +
    "i'm not sure that's a coincidence." },
  { id: '0x06', date: '??.??.???? 02:17', body:
    "navi was warm when i woke up.\n" +
    "no one had touched it." },
  { id: '0x05', date: '08.30.???? 23:58', body:
    "someone left a packet at my door.\n" +
    "no return address.\n" +
    "the metadata says it was sent yesterday — by me." },
  { id: '0x04', date: '08.21.???? 04:11', body:
    "i counted the people on the train today.\n" +
    "the number kept changing when i looked away.\n" +
    "is anyone really there." },
  { id: '0x03', date: '08.14.???? 01:33', body:
    "the wired hums when it rains.\n" +
    "i don't think anyone else can hear it.\n" +
    "i don't think anyone else is listening." },
  { id: '0x02', date: '08.05.???? 03:09', body:
    "i opened a port i don't remember opening.\n" +
    "something is using it." },
  { id: '0x01', date: '??.??.???? ??:??', body:
    "present day. present time.\n" +
    "ha ha ha." },
];
```

- [ ] **Step 2: Add the Diary HTML**

In `index.html`, immediately after the closing `</div>` of the sysmon panel (added in Task 8), insert:

```html
      <!-- Diary Panel -->
      <div id="notepad-panel">
        <div class="diary-titlebar">
          <span class="win-btn win-btn-close" onclick="toggleDiaryPanel()" title="Close">[×]</span>
          <span class="win-btn"               onclick="minimizeDiaryPanel()" title="Minimize">[−]</span>
          <span class="win-btn"               onclick="expandDiaryPanel()" title="Restore">[+]</span>
          <span class="diary-title">SADAME@WIRED:~/diary</span>
        </div>
        <div class="diary-body" id="diary-body"></div>
      </div>
```

- [ ] **Step 3: Add the Diary taskbar button**

In `#taskbar-buttons`, after the `tb-sysmon` button:

```html
          <button class="tb-btn" id="tb-diary" onclick="toggleDiaryPanel()">✎ diary</button>
```

- [ ] **Step 4: Add the Diary CSS**

Append to `style.css`:

```css
/* ─── Diary Panel ────────────────────────────── */
#notepad-panel {
  position: absolute;
  bottom: 56px;
  left: 24px;
  width: 320px;
  height: 280px;
  z-index: 11;
  display: none;
  flex-direction: column;
  background: var(--terminal-bg);
  border: 1px solid #00ffcc44;
  border-radius: 8px;
  box-shadow: var(--glow);
  backdrop-filter: blur(8px);
  overflow: hidden;
}

#notepad-panel.visible {
  display: flex;
}

#notepad-panel.minimized .diary-body {
  display: none;
}

#notepad-panel.diary-first-show {
  animation: music-zoomout 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.diary-titlebar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  background: rgba(0, 255, 204, 0.06);
  border-bottom: 1px solid #00ffcc33;
  user-select: none;
  animation: cursor-drag 800ms steps(1) infinite;
  flex-shrink: 0;
}

.diary-title {
  margin-left: 6px;
  font-size: 0.78rem;
  color: var(--accent);
  opacity: 0.8;
  letter-spacing: 0.06em;
}

.diary-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 16px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.78rem;
  line-height: 1.7;
  color: var(--text);
}

.diary-entry {
  margin-bottom: 16px;
  white-space: pre-wrap;
}

.diary-entry-header {
  color: var(--accent);
  text-shadow: 0 0 4px var(--accent);
  margin-bottom: 4px;
  letter-spacing: 0.04em;
}
```

- [ ] **Step 5: Add the Diary JS**

Append to `script.js`:

```js
// ─── Diary Panel ─────────────────────────────────────────────
function renderDiary() {
  const body = document.getElementById('diary-body');
  body.innerHTML = '';
  LAIN_DIARY.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'diary-entry';
    const header = document.createElement('div');
    header.className = 'diary-entry-header';
    header.textContent = `>> entry ${entry.id} — ${entry.date}`;
    const text = document.createElement('div');
    text.textContent = entry.body;
    div.appendChild(header);
    div.appendChild(text);
    body.appendChild(div);
  });
}

function toggleDiaryPanel() {
  const panel = document.getElementById('notepad-panel');
  if (panel.classList.contains('visible')) {
    panel.classList.remove('visible');
  } else {
    panel.classList.add('visible');
    bringToFront(panel);
    if (!panel.dataset.shown) {
      panel.dataset.shown = '1';
      panel.classList.add('diary-first-show');
      setTimeout(() => panel.classList.remove('diary-first-show'), 700);
    }
  }
  updateTaskbar();
}

function minimizeDiaryPanel() {
  document.getElementById('notepad-panel').classList.add('minimized');
}

function expandDiaryPanel() {
  document.getElementById('notepad-panel').classList.remove('minimized');
}

function initDiaryPanel() {
  renderDiary();
  const panel    = document.getElementById('notepad-panel');
  const titlebar = panel.querySelector('.diary-titlebar');
  let dragging = false, ox = 0, oy = 0;

  panel.addEventListener('mousedown', () => bringToFront(panel));

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('win-btn')) return;
    dragging = true;
    const rect   = panel.getBoundingClientRect();
    const rpRect = getRightPanel().getBoundingClientRect();
    panel.style.bottom = 'auto';
    panel.style.left = (rect.left - rpRect.left) + 'px';
    panel.style.top  = (rect.top  - rpRect.top)  + 'px';
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
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

  document.addEventListener('mouseup', () => { dragging = false; });
}
```

- [ ] **Step 6: Wire init call, taskbar, resize-clamp**

In the `// ─── Start ───` section, add `initDiaryPanel();` after `initSysmonPanel();`.

In `updateTaskbar()`, add to the `states` map:
```js
    'tb-diary':       document.getElementById('notepad-panel').classList.contains('visible'),
```

In the resize handler `panels` array, add:
```js
    document.getElementById('notepad-panel'),
```

- [ ] **Step 7: Manual verification**

Refresh.
- Click `✎ diary` in the taskbar → panel zooms in at bottom-left, taskbar button highlights.
- Body shows seven entries, newest (`0x07`) at the top, each with cyan header `>> entry 0xNN — DATE` and body text below.
- Scroll the body — content scrolls inside the panel, not the page.
- Drag titlebar → panel moves.
- Minimize/restore/close work correctly.

- [ ] **Step 8: Commit**

```bash
git add index.html style.css script.js
git commit -m "feat: add lain diary notepad panel"
```

---

## Task 10: Idle screensaver (Matrix-style katakana fall)

**Files:**
- Modify: `index.html` (canvas element)
- Modify: `style.css` (canvas positioning)
- Modify: `script.js` (idle timer + canvas animation)

- [ ] **Step 1: Add the canvas element**

In `index.html`, immediately before the `<script src="script.js"></script>` line, insert:

```html
  <canvas id="screensaver"></canvas>
```

- [ ] **Step 2: Add the CSS**

Append to `style.css`:

```css
/* ─── Idle Screensaver ───────────────────────── */
#screensaver {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
  background: #000;
}

#screensaver.active {
  opacity: 1;
  pointer-events: auto;
}
```

- [ ] **Step 3: Add the JS**

Append to `script.js`:

```js
// ─── Idle Screensaver ────────────────────────────────────────
const SCREENSAVER_IDLE_MS = 45000;
const SCREENSAVER_PHRASES = [
  'PRESENT DAY', 'PRESENT TIME', 'LAYER 07', 'CLOSE THE WORLD',
];
const KATAKANA = 'アァカサタナハマヤラワンイィキシチニヒミリウゥクスツヌフムユルヴエェケセテネヘメレオォコソトノホモヨロヲ0123456789ABCDEF';

let screensaverTimer = null;
let screensaverFrame = null;
let screensaverActive = false;
let ssCanvas, ssCtx, ssColumns;

function ssResize() {
  if (!ssCanvas) return;
  ssCanvas.width  = window.innerWidth;
  ssCanvas.height = window.innerHeight;
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
      // Tiny chance to start a phrase
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
  screensaverFrame = setTimeout(ssDraw, 50); // ~20fps
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
}

function resetIdleTimer() {
  if (screensaverActive) hideScreensaver();
  if (screensaverTimer) clearTimeout(screensaverTimer);
  screensaverTimer = setTimeout(showScreensaver, SCREENSAVER_IDLE_MS);
}

function initScreensaver() {
  ['mousemove', 'keydown', 'click'].forEach(ev => {
    document.addEventListener(ev, resetIdleTimer);
  });
  window.addEventListener('resize', () => { if (screensaverActive) ssResize(); });
  resetIdleTimer();
}
```

- [ ] **Step 4: Wire init call**

In the `// ─── Start ───` section, add `initScreensaver();` after `initDiaryPanel();`.

- [ ] **Step 5: Manual verification**

Refresh.
- Open the page, then **stop touching the keyboard and mouse** for 45 seconds.
- After 45s, the screen should fade to black with cyan katakana columns falling Matrix-style. Occasionally one of the phrases (`PRESENT DAY`, `PRESENT TIME`, `LAYER 07`, `CLOSE THE WORLD`) drops down a column letter-by-letter.
- Move the mouse → screensaver fades out, you're back on the page.
- Press a key → also wakes it. Click → also wakes it.
- Wait another 45s → it returns.

(Optional sanity tweak for verification only: temporarily change `SCREENSAVER_IDLE_MS = 5000;` to test faster, then revert before committing.)

- [ ] **Step 6: Commit**

```bash
git add index.html style.css script.js
git commit -m "feat: idle screensaver with falling katakana and lain phrases"
```

---

## Task 11: CRT static toggle

**Files:**
- Modify: `index.html` (canvas element)
- Modify: `style.css` (positioning)
- Modify: `script.js` (toggle + tick + taskbar button + terminal command)

- [ ] **Step 1: Add the canvas element**

In `index.html`, immediately after the `<canvas id="screensaver"></canvas>` line from Task 10, insert:

```html
  <canvas id="crt-static" width="256" height="256"></canvas>
```

- [ ] **Step 2: Add the static taskbar button**

In `#taskbar-buttons`, after the `tb-diary` button:

```html
          <button class="tb-btn" id="tb-static" onclick="toggleCrtStatic()">░ static</button>
```

- [ ] **Step 3: Add the CSS**

Append to `style.css`:

```css
/* ─── CRT Static Overlay ─────────────────────── */
#crt-static {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9998;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0.06;
  display: none;
}

#crt-static.active {
  display: block;
}
```

- [ ] **Step 4: Add the JS**

Append to `script.js`:

```js
// ─── CRT Static Overlay ──────────────────────────────────────
let crtStaticOn = false;
let crtStaticInterval = null;
let crtCanvas, crtCtx, crtImageData;

function crtStaticTick() {
  if (!crtImageData) return;
  const data = crtImageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() < 0.5 ? 0 : 255;
    data[i] = v; data[i+1] = v; data[i+2] = v; data[i+3] = 255;
  }
  crtCtx.putImageData(crtImageData, 0, 0);
}

function toggleCrtStatic() {
  const canvas = document.getElementById('crt-static');
  crtStaticOn = !crtStaticOn;
  if (crtStaticOn) {
    if (!crtCanvas) {
      crtCanvas = canvas;
      crtCtx = canvas.getContext('2d');
      crtImageData = crtCtx.createImageData(canvas.width, canvas.height);
    }
    canvas.classList.add('active');
    crtStaticTick();
    crtStaticInterval = setInterval(crtStaticTick, 83); // ~12fps
  } else {
    canvas.classList.remove('active');
    if (crtStaticInterval) { clearInterval(crtStaticInterval); crtStaticInterval = null; }
  }
  document.getElementById('tb-static').classList.toggle('active', crtStaticOn);
}
```

- [ ] **Step 5: Add the `static` terminal command**

In `handleCommand`, add a new branch before the final `else`:

```js
  } else if (lower === 'static') {
    toggleCrtStatic();
    out.insertAdjacentText('beforeend', crtStaticOn ? '> crt static online\n' : '> crt static offline\n');
```

- [ ] **Step 6: Manual verification**

Refresh.
- Click `░ static` in the taskbar → a fine grayscale noise overlay appears across the whole page (subtle, ~6% opacity, with `screen` blend so dark areas stay dark and light areas get a faint white grain).
- The taskbar button highlights.
- Click again → noise disappears, button unhighlights.
- Click the terminal, type `static` → noise reappears, terminal prints `> crt static online`.
- Type `static` again → off, terminal prints `> crt static offline`.
- Verify the noise overlay does NOT block clicks (you can still click panels through it).

- [ ] **Step 7: Commit**

```bash
git add index.html style.css script.js
git commit -m "feat: CRT static overlay toggle (taskbar + terminal command)"
```

---

## Task 12: Random wired chatter messages

**Files:**
- Modify: `script.js` (`WIRED_MESSAGES` array, hoist `processing`, scheduler)

- [ ] **Step 1: Add the WIRED_MESSAGES array**

In `script.js`, immediately after the `LAIN_DIARY` array (added in Task 9), add:

```js
// ─── Wired Chatter Messages ───────────────────────────────────
const WIRED_MESSAGES = [
  '[wired] packet received from layer 07 :: discarded',
  '[wired] anomaly detected — node 0x1A38 unresponsive',
  '[wired] navi heartbeat ok',
  '[wired] memory sync :: 100%',
  "[wired] :: she's listening",
  '[wired] protocol 7 handshake :: pending',
  '[wired] connection to layer 13 lost',
  '[wired] reroute via node 0x0042',
  '[wired] presence detected — origin unknown',
  '[wired] timestamp drift 0.003s',
  '[wired] :: are you still there?',
  '[wired] cache flush :: ok',
];
```

- [ ] **Step 2: Hoist the `processing` flag to module scope**

In `script.js`, near the top (just below the `let bootTime = 0;` line from Task 5), add:

```js
let terminalProcessing = false;
```

In `runTerminalSequence`'s keydown handler, replace the local `let processing = false;` declaration AND every reference to `processing` inside that handler with `terminalProcessing`. The handler from Task 4 should now read:

```js
  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !terminalProcessing) {
      terminalProcessing = true;
      const cmd = input.value;
      input.value = '';
      hidePrompt();
      await handleCommand(cmd);
      if (cmd.trim()) {
        commandHistory.push(cmd);
        historyIndex = commandHistory.length;
      }
      showPrompt();
      terminalProcessing = false;
    } else if (e.key === 'Tab') {
      // ... unchanged
    } else if (e.key === 'ArrowUp') {
      // ... unchanged
    } else if (e.key === 'ArrowDown') {
      // ... unchanged
    }
  });
```

(Delete the `let processing = false;` line that was just above the listener.)

- [ ] **Step 3: Add the wired-chatter scheduler**

Append to `script.js`:

```js
// ─── Wired Chatter ───────────────────────────────────────────
function injectWiredMessage() {
  const term = document.querySelector('.terminal-window');
  const input = document.getElementById('terminal-input');
  if (!term.classList.contains('visible')) return;
  if (terminalProcessing) return;
  if (input && input.value !== '') return;

  const msg = WIRED_MESSAGES[Math.floor(Math.random() * WIRED_MESSAGES.length)];
  const out = getOutput();
  hidePrompt();
  const span = document.createElement('span');
  span.className = 'wired-msg';
  span.textContent = msg;
  out.appendChild(span);
  out.insertAdjacentText('beforeend', '\n');
  scrollTerminal();
  showPrompt();
}

function scheduleWiredMessage() {
  const delay = 60000 + Math.random() * 60000;
  setTimeout(() => {
    injectWiredMessage();
    scheduleWiredMessage();
  }, delay);
}
```

- [ ] **Step 4: Add the wired-msg style**

Append to `style.css`:

```css
.wired-msg {
  color: #00ffcc66;
  font-style: italic;
}
```

- [ ] **Step 5: Start the scheduler**

In `runTerminalSequence`, at the very end of the function (after the input listener block), add:

```js
  scheduleWiredMessage();
```

- [ ] **Step 6: Manual verification**

Because the real cadence is 60–120s, temporarily change line `const delay = 60000 + Math.random() * 60000;` to `const delay = 3000 + Math.random() * 2000;` for testing.

Refresh.
- Within 3–5s of screen 2 appearing, a dimmed italic cyan line like `[wired] navi heartbeat ok` appears in the terminal output above the prompt.
- The prompt re-renders below it, the input still has focus.
- Type `he` (do not press Enter) → wait → next wired message does NOT appear (because input is non-empty).
- Clear the input → wait → next message appears.
- Click `[×]` to close the terminal → wait several seconds → no errors, no messages stack up. Reopen → messages resume on schedule.

**Revert the delay back to `60000 + Math.random() * 60000` before committing.**

- [ ] **Step 7: Commit**

```bash
git add script.js style.css
git commit -m "feat: random wired chatter messages in terminal"
```

---

## Task 13: Update help text with all new commands

**Files:**
- Modify: `script.js` (`printHelp` function)

- [ ] **Step 1: Update printHelp**

In `script.js`, find `printHelp()` (around line 434) and replace the `lines` array with:

```js
  const lines = [
    '──────────────────────────────────────────────',
    '  help              show this message',
    '  ls ./connections  list profile links',
    '  vim [name]        open profile page',
    '                    e.g. vim GitHub',
    '  whoami            who is SADAME',
    '  about             open profile panel',
    '  navi              ask navi',
    '  date              current time',
    '  uptime            wired uptime',
    '  static            toggle CRT static',
    '  Hello Lain        ???',
    '  clear             clear terminal',
    '  music             toggle music player',
    '  tv                toggle WIRED TV',
    '  background        list background GIFs',
    '  background [name] set right background',
    '──────────────────────────────────────────────',
  ];
```

- [ ] **Step 2: Manual verification**

Refresh.
- Watch the auto-help on boot — it should now include the new commands (`whoami`, `about`, `navi`, `date`, `uptime`, `static`).
- Type `help` again → same output.
- Type `clear` then `help` → same output.

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: update help text with new terminal commands"
```

---

## Task 14: Final integration verification

This is a no-code task — a full sweep to confirm everything still works together.

- [ ] **Step 1: Hard refresh (Ctrl+Shift+R) and watch the boot sequence**

Expected:
- Boot text types out (`HELLO NAVI` → connection → loading bar → glitch).
- Screen 2 fades in: terminal centered with auto-help, music panel zooms in bottom-right, TV panel zooms in top-right, **connections sidebar slides in from the left** (Task 1).
- Taskbar shows nine buttons highlighted as appropriate: `>_ terminal`, `⠿ connections`, `♪ music`, `⊞ tv`, `◈ background`, `⌂ about`, `▤ sysmon`, `✎ diary`, `░ static`.
- All visible panels show `[×] [−] [+]` bracket buttons in their titlebars (Task 2). No red/yellow/green dots remain anywhere.

- [ ] **Step 2: Exercise the terminal**

In order, type each and verify:
- `help` → updated help text with all new commands.
- `whoami` → prints SADAME identification + opens About panel after a beat.
- `about` (closes the About panel because it's already open) → reopens after typing `about` again.
- `date` → current timestamp.
- `uptime` → elapsed time since boot.
- `navi` → terminal prints `navi> …` AND Lain's left-side bubble shows the same line.
- `static` → CRT static overlay turns on. Type `static` again → off.
- Press ↑ five times → recalls each previous command in reverse.
- Press ↓ to come back forward.
- Type `wh` and press Tab → completes to `whoami`.
- Type `vim St` and press Tab → completes to `vim Steam`.
- Type `background lain1` and press Tab → completes to `background lain1.webp`.

- [ ] **Step 3: Exercise each panel**

For terminal, TV, music, about, sysmon, diary:
- Drag the titlebar → panel moves and stays within the right-panel bounds.
- Click `[−]` → minimizes to titlebar only.
- Click `[+]` → restores.
- Click `[×]` → closes; the corresponding taskbar button unhighlights.
- Click the taskbar button → reopens.

For the About panel: confirm `[ EN ]` ↔ `[ 中文 ]` toggle works.

For the Sysmon panel: watch for ~10s and confirm bars/numbers animate.

For the Diary panel: scroll through all seven entries.

- [ ] **Step 4: Idle screensaver**

Stop interacting for 45 seconds. Confirm screensaver appears. Move mouse → wakes. Wait another 45s → reappears.

- [ ] **Step 5: Resize the browser**

Resize the window in both dimensions. Confirm dragged panels stay clamped within bounds and don't fall off the right or bottom edges.

- [ ] **Step 6: Browser console check**

Open DevTools console (F12). Refresh. Exercise everything from steps 1–5 again. Confirm there are zero errors and zero warnings logged.

- [ ] **Step 7: Final commit (only if anything was tweaked)**

If you made any small fixes during this verification, commit them:
```bash
git add -p
git commit -m "fix: verification-pass tweaks"
```

If everything passed clean with no changes, this task is just verification — no commit needed.

---

## Out of scope — explicitly NOT in this plan

- Refactoring duplicated drag-window logic into a `makeDraggable(panel, titlebar)` helper. After this work the duplication exists in seven places (terminal, tv, music, picker, about, sysmon, diary). Worth extracting in a future cleanup pass; not part of this scope.
- `localStorage` persistence of preferences (active background, open panels, language choice).
- Easter eggs (`konami`, `protocol 7`, `sudo close the world`).
- Tab autocomplete cycling (current version completes-or-prints; doesn't cycle through matches on repeated Tab).
- Tests / test framework (the project is vanilla browser-loaded HTML with no test runner).
