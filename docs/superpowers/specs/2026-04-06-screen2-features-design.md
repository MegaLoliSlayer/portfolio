# Screen 2 Feature Expansion — Design

**Date:** 2026-04-06
**Scope:** Add terminal upgrades, three new panels, ambient atmosphere effects, themed window-control buttons, and a connections-default-on tweak to the Lain/WIRED portfolio.

---

## Goals

1. Connections sidebar opens automatically when screen 2 loads.
2. Make the terminal feel more like a real shell (history, tab-complete, more commands).
3. Add three new draggable panels — About (real bio), System Monitor (flavor), Diary (in-character notepad).
4. Layer in ambient atmosphere — idle screensaver, optional CRT static, random "wired" log chatter.
5. Replace the macOS-style red/yellow/green window control dots with bracketed monospace buttons that match the rest of the UI vocabulary.

## Non-goals

- No refactor of the duplicated drag-window logic across panels (noted as future cleanup).
- No `localStorage` persistence of preferences.
- No changes to screen 1 (boot sequence) or to the Lain side character behavior beyond exposing one helper.
- No new build tooling — everything stays in the existing single-file `index.html` / `script.js` / `style.css` structure.

---

## Architecture

Single-file expansion. New code is appended at the bottom of `script.js` under clearly delimited section banners following the existing convention. New HTML blocks are added inside `#right-panel` (panels) or as last children of `<body>` (full-viewport overlays). New CSS is appended to `style.css`.

No new files. No build step.

---

## Feature 1: Connections sidebar opens by default

In `runTerminalSequence()`, after the existing `updateTaskbar()` call (~line 705), add a single call to `toggleConnectionsSidebar()`. The taskbar button auto-lights via the existing `updateTaskbar()` re-run. No new state, no flag.

---

## Feature 2: Window control buttons — bracketed style

The current `.dot` / `.dot-red` / `.dot-yellow` / `.dot-green` traffic-light circles clash with the rest of the UI, which uses bracketed monospace buttons everywhere (`[prev]`, `[next]`, `[playlist]`, `[01] GitHub`).

### Markup (replaces `.dot` triplets in all six titlebars)

```html
<span class="win-btn win-btn-close" onclick="..." title="Close">[×]</span>
<span class="win-btn"               onclick="..." title="Minimize">[−]</span>
<span class="win-btn"               onclick="..." title="Restore">[+]</span>
```

### CSS

- `.win-btn`: 1px border `#00ffcc44`, transparent fill, square corners, ~6px horizontal padding, dim cyan text, `cursor-pointer` animation.
- `.win-btn:hover`: border + text brighten to `--accent`, accent glow `0 0 8px #00ffcc88`.
- `.win-btn-close:hover`: border + text shift to `--danger` (`#ff003c`) with glow `0 0 8px #ff003c88`.

### JS

The drag handlers in `initTerminalDrag`, `initTvPanel`, `initMusicDrag`, `initBgPicker` currently check `e.target.classList.contains('terminal-dot')` (etc.) to skip drag-start when clicking a control. Rename all of these checks to `.win-btn` for consistency. Old class names (`.terminal-dot`, `.tv-dot`, `.music-dot`) are removed.

The old `.dot`, `.dot-red`, `.dot-yellow`, `.dot-green` CSS rules are deleted.

---

## Feature 3: Terminal upgrades

### A1. Command history (↑/↓)

Module-level state:
```js
let commandHistory = [];
let historyIndex = -1;
```

In the existing `terminal-input` keydown listener:
- After Enter + `handleCommand` resolves: `commandHistory.push(cmd); historyIndex = commandHistory.length;`
- `ArrowUp`: `historyIndex = Math.max(0, historyIndex - 1); input.value = commandHistory[historyIndex] || '';`
- `ArrowDown`: `historyIndex = Math.min(commandHistory.length, historyIndex + 1); input.value = commandHistory[historyIndex] || '';`

In-session only. Not persisted.

### A2. Tab autocomplete

On `Tab` keydown (`preventDefault`), look at `input.value`:

- **Single token, no space yet:** match against the command list. One match → complete it (with trailing space if it's a command that takes args). Multiple matches → print candidates to terminal output.
- **Starts with `vim `:** match remainder against `LINKS[].name` (case-insensitive prefix).
- **Starts with `background `:** match remainder against `BACKGROUND_FILES` filenames.

Command list for completion:
```
help, clear, ls ./connections, vim, hello lain, music, tv,
background, whoami, about, date, uptime, navi, static
```

### A3. `whoami`

Prints a small ASCII block:
```
> SADAME @ wired
> layer 07 :: pluviophile
> type 'about' or click [⌂ about] for full profile
```

After a 400ms beat, auto-opens the About panel via `toggleAboutPanel()`.

### A4. `date` / `uptime`

- `date`: prints `current time: ${new Date().toISOString().replace('T',' ').slice(0,19)} [WIRED]`.
- `uptime`: a `bootTime = Date.now()` is captured at the start of `runTerminalSequence`. The command computes `(Date.now() - bootTime)` and prints `wired uptime: ${d}d ${h}h ${m}m ${s}s — connection stable`.

### A5. `navi`

- Picks a random index into `LAIN_DIALOGS`.
- Prints `navi> ${dialog}` to the terminal output (in cyan, with the existing line wrapping).
- Calls `triggerLainDialog(idx)` to show the same line in Lain's left-side speech bubble.

To enable that last call, `initLainSide()` is modified to expose its closure-bound `showDialog` as `window.triggerLainDialog = (idx) => { lastIndex = idx; bubbleText.textContent = LAIN_DIALOGS[idx]; ... }`. Minimal refactor — just hoists the body of the existing `showDialog` into a parameterized form and assigns it.

### Help text update

`printHelp()` gets new lines appended:
```
  whoami            who is SADAME
  about             open profile panel
  date              current time
  uptime            wired uptime
  navi              ask navi
  static            toggle CRT static
```

---

## Feature 4: New panels

All three follow the existing TV/music panel pattern: HTML block in `#right-panel`, draggable titlebar (with the new `.win-btn` controls), `.visible` class toggle, taskbar button, `bringToFront` on mousedown, `music-zoomout` first-show animation, drag handler that mirrors the existing ones.

### B6. About panel — `#about-panel`

- **Default position:** centered, `width: 460px`, `max-height: 70vh`, body is `overflow-y: auto`.
- **Titlebar:** `SADAME@WIRED:~/about`
- **Body structure:**
  ```html
  <div class="about-body lang-en">
    <div class="about-lang-toggle">
      <button onclick="setAboutLang('en')">[ EN ]</button>
      <button onclick="setAboutLang('cn')">[ 中文 ]</button>
    </div>
    <div class="about-en"> ... EN content ... </div>
    <div class="about-cn"> ... CN content ... </div>
    <div class="about-footer">last update :: 2024-10-27</div>
  </div>
  ```
- `setAboutLang('en' | 'cn')` toggles a class on `.about-body`; CSS shows the matching child via `.lang-en .about-cn { display: none }` and vice versa.
- **EN content** (verbatim from user, formatted with `// who`, `// what i like`, `// what i do` cyan section headings; the favorite-band/producer/movie/anime lines rendered as a small key:value list; "My Music List" / "My Anime List" inline as anchors using the Spotify and MAL URLs from `LINKS`):

  ```
  For EN Users:
  There's really nothing special about me.
  Pluviophile (stands for people who loves rain) describes me well I think,
  since I hate the flowing of time and I believe rain has the magic to stop
  everything from moving.
  I really hate sunny days, and I hate people hustling on their ways just for
  money or a hollow goal. I wouldn't put any more details on the deeper stuff,
  diving into my mind makes me exhausted and i really wish preventing that
  from happening (to you and to me)...

  // what i like
  I like all sorts of games but not a pro on gaming (Mainly PSN, NS and PC),
  and I watch a lot of anime just to keep me away from the reality.
  The music that I listen to is mainly thrash and industrial metal, but I do
  listen to some ACG music as well.

    favorite band         :: Rammstein, Pantera
    favorite ACG producer :: 麻枝 准
    movie bible           :: Fight Club
    anime bible           :: Evangelion

  // what i do
  Gaming and anime occupies most of my time (Currently major in computer
  engineering so i have to study sometime).
  But if you ask me what I like the most: Doing nothing...
  ```

- **CN content** (verbatim from user, same heading structure translated as `// 自我介绍`, `// 喜欢的事情`, `// 鼠鼠的日常`):

  ```
  给国人好友的自我介绍:
  鼠鼠稍微有点宅 除了上学之外基本上都在家里躺尸 喜欢下雨讨厌晴天
  下雨可以停止时间（鼠鼠是这么认为的）具体为什么就不解释了
  （缕清自己的思绪很累所以想尽量控制自己不要多想）
  总之希望大家都能开心的做自己想做的事情

  // 喜欢的事情
  某只兔子
  喜欢各种类型的游戏（每个平台的游戏都有玩 PSN NS 和 PC）
  喜欢收集游戏（穷学生库存不太丰富）有时候太累了就不太会玩游戏
  所以有很多游戏都在库里躺着吃灰
  喜欢收集手办（经常为了买游戏和手办饿肚子）
  喜欢看番（什么类型的都会看）最喜欢日常和意识流
  喜欢工业和鞭挞金属 也喜欢ACG（偶尔也会收集两张自己喜欢乐队的专辑）

    最喜欢的乐队     :: Rammstein, Pantera
    最喜欢的ACG制作人 :: 麻枝 准
    电影圣经         :: 搏击俱乐部
    动漫圣经         :: 新世纪福音战士

  // 鼠鼠的日常
  平时主要都在打游戏和看番 因为是大学专业选的是computer engineering
  所以偶尔也会学习（弄反了bushi）
  但是平时还是最喜欢躺尸
  ```

- **Footer:** `last update :: 2024-10-27` in dim cyan.
- **Opens via:** taskbar button `[⌂ about]`, terminal command `about`, or `whoami` (auto-opens after 400ms).

### B7. System Monitor panel — `#sysmon-panel`

- **Default position:** top-left of right-panel area, `width: 240px`.
- **Titlebar:** `SADAME@WIRED:~/sysmon`
- **Body:** five fake stats updated every 1.2s on a `setInterval`:
  ```
  CPU   ████████░░  73%
  MEM   ██████░░░░  58%
  NET   ██████████  layer 07
  PROC  847 / 1024
  PING  12ms → wired
  ```
  - CPU + MEM: clamped random walk, ±5% per tick, range 20–95%.
  - PROC: random walk in range 600–1000, max stays at 1024.
  - NET layer label: cycles `layer 03` / `layer 07` / `layer 13`, swaps roughly every ~10s (10% chance per tick).
  - PING: random integer 8–24ms.
  - Bars: pure text (`█` filled, `░` empty), 10 chars wide.
- **Lifecycle:** the interval starts when `toggleSysmonPanel()` shows the panel and is cleared when it hides. No CPU burn while closed.
- **No terminal command** — taskbar button only (`[▤ sysmon]`).

### B8. Diary panel — `#notepad-panel`

- **Default position:** bottom-left area, `320px × 280px`, body scrollable.
- **Titlebar:** `SADAME@WIRED:~/diary`
- **Body:** vertical list of fictional in-character "Lain's diary" entries pulled from a `LAIN_DIARY` array near `LAIN_DIALOGS`:
  ```js
  const LAIN_DIARY = [
    { id: '0x07', date: '09.13.???? 03:42', body:
      "the rain hasn't stopped for nine days.\n" +
      "i think it's stopped for everyone else.\n" +
      "i'm not sure that's a coincidence." },
    { id: '0x06', date: '??.??.???? 02:17', body:
      "navi was warm when i woke up.\n" +
      "no one had touched it." },
    // ~5 more in the same register
  ];
  ```
  Each entry rendered as:
  ```
  >> entry 0x07 — 09.13.???? 03:42
  the rain hasn't stopped for nine days.
  ...
  ```
  with the header line in cyan and the body in `--text`.
- **Opens via:** taskbar button `[✎ diary]` only.
- **No commands**, no interactivity beyond drag/scroll/close.

### Taskbar additions

Three buttons appended to `#taskbar-buttons`:
```html
<button class="tb-btn" id="tb-about"  onclick="toggleAboutPanel()">⌂ about</button>
<button class="tb-btn" id="tb-sysmon" onclick="toggleSysmonPanel()">▤ sysmon</button>
<button class="tb-btn" id="tb-diary"  onclick="toggleDiaryPanel()">✎ diary</button>
```
And the `states` map in `updateTaskbar()` gets three more entries.

---

## Feature 5: Atmosphere

### C9. Idle screensaver

- **Element:** `<canvas id="screensaver">` appended as last child of `<body>`, `position: fixed; inset: 0; z-index: 99999; opacity: 0; pointer-events: none; transition: opacity 200ms`.
- **Trigger:** 45s of no `mousemove` / `keydown` / `click` on `document`. Timer resets on every input.
- **Visual:** Matrix-style falling katakana columns rendered to canvas at ~20fps. Color: `--accent` cyan (not green). Occasional column drops the phrase `PRESENT DAY` / `PRESENT TIME` / `LAYER 07` / `CLOSE THE WORLD` instead of random characters.
- **Wake:** any input fades opacity to 0 (200ms transition), then sets `pointer-events: none`, clears the animation interval.
- **Lifecycle:** the canvas animation interval only runs while the screensaver is visible. No work while hidden.
- **Implementation:** new section `// ─── Idle Screensaver ───` at the bottom of `script.js`. ~80 lines.

### C11. CRT static toggle

- **Element:** `<canvas id="crt-static">` appended as last child of `<body>`, `position: fixed; inset: 0; z-index: 9998; pointer-events: none; mix-blend-mode: screen; opacity: 0.06; display: none`.
- **How:** small canvas (e.g. 256×256, CSS-stretched to viewport via `width: 100%; height: 100%`), filled with `Math.random() < 0.5 ? 0 : 255` per pixel using `ImageData`, redrawn at ~12fps.
- **Toggle:** taskbar button `[░ static]` and terminal command `static`. Off by default. Flips `display: none` and starts/stops the redraw interval.
- **Output messages:** `> crt static online` / `> crt static offline`.

### C12. Random wired messages

- **Bank:** `WIRED_MESSAGES` array near `LAIN_DIALOGS`, ~12 entries:
  ```
  [wired] packet received from layer 07 :: discarded
  [wired] anomaly detected — node 0x1A38 unresponsive
  [wired] navi heartbeat ok
  [wired] memory sync :: 100%
  [wired] :: she's listening
  [wired] protocol 7 handshake :: pending
  [wired] connection to layer 13 lost
  [wired] reroute via node 0x0042
  [wired] presence detected — origin unknown
  [wired] timestamp drift 0.003s
  [wired] :: are you still there?
  [wired] cache flush :: ok
  ```
- **Cadence:** `setTimeout` chain — after each message, schedule the next at `60_000 + Math.random() * 60_000` ms.
- **Conditions to inject:**
  - Terminal window must have `.visible`.
  - The `processing` flag (already exists in the input keydown closure — needs to be hoisted to module scope) must be false.
  - The input must be empty (`document.getElementById('terminal-input').value === ''`) so we don't clobber a half-typed command.
- **Render:** insert a single line styled `color: #00ffcc66` into `#terminal-output` followed by `\n`, scroll, re-show the prompt at the bottom. Implementation: temporarily hide the input line, append a `<span>` with the dim style, append a newline, re-show the input line.
- **Lifecycle:** the chain is started at the end of `runTerminalSequence()`. It does not need to stop when the terminal is hidden — the per-tick visibility check handles that (it just no-ops). The next-fire timer keeps running.

---

## File changes summary

- **`index.html`** —
  - Add About / Sysmon / Diary panel HTML blocks inside `#right-panel`.
  - Add three new taskbar buttons inside `#taskbar-buttons`.
  - Add `<canvas id="screensaver">` and `<canvas id="crt-static">` as last children of `<body>` (before the script tag).
  - Replace `.dot` triplets in all six titlebars with `[×] [−] [+]` `.win-btn` markup.

- **`script.js`** —
  - Append new sections at the bottom in this order:
    1. Command history & autocomplete (modifies the existing `keydown` listener inside `runTerminalSequence`)
    2. New terminal commands inside `handleCommand`: `whoami`, `about`, `date`, `uptime`, `navi`, `static`
    3. About panel init + toggle + `setAboutLang` + drag
    4. Sysmon panel init + toggle + tick interval + drag
    5. Diary panel init + toggle + drag
    6. Idle screensaver
    7. CRT static
    8. Random wired messages
  - Add `LAIN_DIARY` and `WIRED_MESSAGES` arrays near `LAIN_DIALOGS`.
  - Modify `runTerminalSequence()` to: (a) call `toggleConnectionsSidebar()` after the existing first-show sequence; (b) record `bootTime`; (c) start the wired-messages chain.
  - Modify `initLainSide()` to expose `window.triggerLainDialog(idx)` for the `navi` command.
  - Rename `.terminal-dot` / `.tv-dot` / `.music-dot` checks in drag handlers to `.win-btn`.
  - Hoist the `processing` flag from the keydown closure to module scope so the wired-messages timer can read it.
  - Add the three new init calls at the bottom: `initAboutPanel(); initSysmonPanel(); initDiaryPanel();`

- **`style.css`** —
  - New `.win-btn` + `.win-btn-close` rules.
  - Three new panel position/size blocks: `#about-panel`, `#sysmon-panel`, `#notepad-panel`.
  - About panel language toggle styles (`.about-lang-toggle`, `.lang-en .about-cn { display: none }`, etc.).
  - Sysmon mono-bar font sizing.
  - Screensaver and CRT static z-index/positioning.
  - Wired-message line style (`.wired-msg { color: #00ffcc66 }`).
  - Remove old `.dot`, `.dot-red`, `.dot-yellow`, `.dot-green`, `.terminal-dot`, `.tv-dot`, `.music-dot` rules.

## Locked-in numbers

- Idle screensaver threshold: **45s**
- Wired-message interval: **60–120s random**
- CRT static opacity: **0.06**, redraw rate **~12fps**
- Sysmon update tick: **1.2s**
- Screensaver canvas frame rate: **~20fps**
- About panel: width **460px**, max-height **70vh**
- Sysmon panel: width **240px**
- Diary panel: **320px × 280px**

## Out of scope (future work)

- Refactoring duplicated drag-window logic into a shared `makeDraggable(panel, titlebar)` helper. The duplication exists in four places now (terminal, tv, music, picker) and will exist in seven after this work. Worth doing eventually; not part of this scope.
- `localStorage` persistence of preferences (active background, open panels, language choice).
- Easter eggs (Konami code, `protocol 7`, `sudo close the world`) — not selected.
- Tab autocomplete with cycling through multiple matches on repeated Tab — first version just prints candidates.
