# Spotify Player + Terminal Music Commands Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Embed a Spotify playlist player in a terminal-styled GUI panel (bottom-right, hidden by default) and add `clear`, `music`, `play`, `pause`, `skip`, `prev`, and `volume` commands to the interactive terminal.

**Architecture:** The Spotify iFrame API script is loaded in `<head>` and initializes a controller into a persistent `#embed-iframe` div in the DOM. The panel is always in the DOM but hidden via CSS until the `music` terminal command toggles its `.visible` class. Terminal commands call `window.spotifyController` methods directly. A `playback_update` listener drives the now-playing row (cover art, track name, artist, progress bar).

**Tech Stack:** Vanilla HTML/CSS/JS, Spotify iFrame Embed API (`open.spotify.com/embed/iframe-api/v1`)

---

## File Map

| File | What changes |
|---|---|
| `index.html` | Add iFrame API `<script>` in `<head>`; add `#music-panel` HTML inside `#screen2` |
| `style.css` | Add all music panel styles (appended to end of file) |
| `script.js` | Add `onSpotifyIframeApiReady`, `updateNowPlaying`, `toggleMusicPanel`, `toggleMusicMinimize`, `toggleMusicPlaylist`; extend `handleCommand` with 7 commands; update `printHelp` |

---

## Task 1: Add music panel HTML to index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add Spotify iFrame API script to `<head>`**

In `index.html`, add this line as the last item in `<head>`, just before `</head>`:

```html
  <script src="https://open.spotify.com/embed/iframe-api/v1" async></script>
```

- [ ] **Step 2: Add music panel HTML inside `#screen2`**

In `index.html`, add the following block inside `<div id="screen2" class="screen">`, immediately after the closing `</div>` of `.terminal-window` (before `</div>` that closes `screen2`):

```html
    <!-- Music Panel -->
    <div id="music-panel">
      <div class="music-titlebar">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
        <img id="music-cover-mini" class="music-cover-mini" src="" alt="" />
        <div class="music-title-wrap">
          <span id="music-title-mini" class="music-title-mini">SADAME@WIRED:~/music</span>
        </div>
      </div>
      <div class="music-content">
        <div class="music-nowplaying">
          <div id="music-np-placeholder" class="music-np-placeholder">
            <span class="music-placeholder-icon">&#9833;</span>
            <span>-- no signal --</span>
          </div>
          <div id="music-np-info" class="music-np-info">
            <img id="music-cover" class="music-cover" src="" alt="cover" />
            <div class="music-np-text">
              <div id="music-track-name" class="music-track-name"></div>
              <div id="music-artist-name" class="music-artist-name"></div>
              <div class="music-progress-bg">
                <div id="music-progress-bar" class="music-progress-bar"></div>
              </div>
            </div>
          </div>
        </div>
        <div id="embed-iframe"></div>
        <div class="music-buttons">
          <button class="music-btn" onclick="toggleMusicMinimize()">[minimize]</button>
          <button class="music-btn" onclick="toggleMusicPlaylist()">[playlist]</button>
        </div>
      </div>
    </div>
```

- [ ] **Step 3: Verify HTML structure**

Open `index.html` in a browser (or live server). Go through the boot sequence to screen2. The music panel should **not** be visible yet (it will be once CSS is added and it's still hidden by default — but at this point with no CSS it may appear unstyled in a corner). Confirm no console errors about missing elements.

- [ ] **Step 4: Create `.gitignore`**

Create `D:/VScode_work_dir/portfolio/.gitignore` with the following content:

```
.superpowers/
```

- [ ] **Step 5: Commit**

```bash
git add index.html .gitignore
git commit -m "feat: add music panel HTML and Spotify iFrame API script tag"
```

---

## Task 2: Add music panel CSS

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Append music panel styles to end of style.css**

Add the following block at the very end of `style.css`:

```css
/* ─── Music Panel ────────────────────────────── */
#music-panel {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10;
  width: 300px;
  background: var(--terminal-bg);
  border: 1px solid #00ffcc44;
  border-radius: 8px;
  box-shadow: var(--glow), inset 0 0 60px rgba(0,255,204,0.04);
  backdrop-filter: blur(8px);
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  transform: translateY(12px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

#music-panel.visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.music-titlebar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: rgba(0, 255, 204, 0.06);
  border-bottom: 1px solid #00ffcc33;
}

.music-title-wrap {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  margin-left: 4px;
}

.music-title-mini {
  display: block;
  font-size: 0.78rem;
  color: var(--accent);
  opacity: 0.8;
  letter-spacing: 0.08em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#music-panel.minimized .music-title-mini {
  overflow: visible;
  text-overflow: unset;
  animation: music-marquee 10s linear infinite;
}

@keyframes music-marquee {
  0%   { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.music-cover-mini {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  object-fit: cover;
  border: 1px solid #00ffcc44;
  display: none;
  flex-shrink: 0;
}

.music-cover-mini.loaded {
  display: block;
}

/* Collapsed when .minimized on panel */
#music-panel.minimized .music-content {
  display: none;
}

.music-content {
  padding: 10px 12px 12px;
}

/* Now-playing row */
.music-nowplaying {
  margin-bottom: 8px;
}

.music-np-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(0,255,204,0.04);
  border: 1px solid #00ffcc22;
  border-radius: 6px;
  color: var(--accent);
  opacity: 0.5;
  font-size: 0.82rem;
}

.music-placeholder-icon {
  font-size: 1.4rem;
}

.music-np-info {
  display: none;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(0,255,204,0.04);
  border: 1px solid #00ffcc22;
  border-radius: 6px;
}

.music-np-info.active {
  display: flex;
}

.music-cover {
  width: 52px;
  height: 52px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #00ffcc44;
  flex-shrink: 0;
}

.music-np-text {
  flex: 1;
  min-width: 0;
}

.music-track-name {
  color: var(--accent);
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 0 6px var(--accent);
}

.music-artist-name {
  color: var(--text);
  opacity: 0.55;
  font-size: 0.78rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.music-progress-bg {
  margin-top: 6px;
  height: 4px;
  background: #00ffcc22;
  border-radius: 2px;
  overflow: hidden;
}

.music-progress-bar {
  height: 100%;
  width: 0%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.5s linear;
}

/* Spotify iframe container */
#embed-iframe {
  border-radius: 6px;
  overflow: hidden;
  height: 152px;
  transition: height 0.3s ease;
}

#embed-iframe.playlist-expanded {
  height: 380px;
}

#embed-iframe iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* Button row */
.music-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.music-btn {
  background: transparent;
  border: 1px solid #00ffcc44;
  color: var(--accent);
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.78rem;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s, text-shadow 0.2s;
}

.music-btn:hover {
  border-color: var(--accent);
  text-shadow: 0 0 8px var(--accent);
}
```

- [ ] **Step 2: Verify panel is invisible by default**

Open the page in a browser and boot to screen2. The music panel should be completely invisible (opacity 0, no layout shift). Open browser DevTools, select `#music-panel`, and manually add the class `visible` in the Elements panel — the panel should slide up and appear in the bottom-right corner, styled correctly with the terminal aesthetic.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add music panel CSS with visible/minimized/playlist-expanded states"
```

---

## Task 3: Add Spotify iFrame API controller init

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add `updateNowPlaying` function**

Add the following function to `script.js` after the `// ─── Terminal Helpers` section (around line 100), before `handleCommand`:

```js
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
    document.getElementById('music-cover').src = imgUrl;
    const mini = document.getElementById('music-cover-mini');
    mini.src = imgUrl;
    mini.classList.add('loaded');
    document.getElementById('music-title-mini').textContent = name + ' — ' + artist;
  }
}
```

- [ ] **Step 2: Add `onSpotifyIframeApiReady` global callback**

Add the following at the very bottom of `script.js`, after the `runBootSequence().catch(console.error)` line:

```js
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
```

- [ ] **Step 3: Add panel toggle helpers**

Add the following two functions immediately after `updateNowPlaying` (before `handleCommand`):

```js
function toggleMusicPanel() {
  document.getElementById('music-panel').classList.toggle('visible');
}

function toggleMusicMinimize() {
  document.getElementById('music-panel').classList.toggle('minimized');
}

function toggleMusicPlaylist() {
  document.getElementById('embed-iframe').classList.toggle('playlist-expanded');
}
```

- [ ] **Step 4: Verify Spotify controller loads**

Open the page in a browser. Boot to screen2. Open DevTools console. After a few seconds, type `window.spotifyController` — it should be a Spotify controller object (not `undefined`). If it's `undefined`, check the network tab for the iFrame API script loading correctly.

Note: the Spotify embed requires the user to be logged into Spotify in the browser for playback to work. The controller object itself initializes regardless.

- [ ] **Step 5: Commit**

```bash
git add script.js
git commit -m "feat: add Spotify iFrame API controller init and updateNowPlaying"
```

---

## Task 4: Add `clear` and `music` terminal commands

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add `clear` command to `handleCommand`**

In `script.js`, inside `handleCommand`, find the block:

```js
  if (lower === 'help') {
```

Add the `clear` and `music` cases before it:

```js
  if (lower === 'clear') {
    getOutput().textContent = '';
    return;

  } else if (lower === 'music') {
    const panel = document.getElementById('music-panel');
    const isVisible = panel.classList.contains('visible');
    toggleMusicPanel();
    out.insertAdjacentText('beforeend', isVisible ? '> music player offline\n' : '> music player online\n');

  } else if (lower === 'help') {
```

- [ ] **Step 2: Verify `clear` command**

Open the page in a browser. Boot to screen2. The terminal shows the auto-run `help` output. Type `clear` and press Enter. The terminal output should be wiped completely — blank terminal body, just the input prompt.

- [ ] **Step 3: Verify `music` command**

Type `music` and press Enter. The music panel should slide up from the bottom-right corner and the terminal prints `> music player online`. Type `music` again — panel hides and terminal prints `> music player offline`.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: add clear and music terminal commands"
```

---

## Task 5: Add `play`, `pause`, `skip`, `prev` commands

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add a helper for controller guard**

Add this helper function directly above `handleCommand` in `script.js`:

```js
function requireController(out) {
  if (!window.spotifyController) {
    out.insertAdjacentText('beforeend', "> no signal — run 'music' first\n");
    return false;
  }
  return true;
}
```

- [ ] **Step 2: Add play/pause/skip/prev cases to `handleCommand`**

Inside `handleCommand`, the current order after Task 4 is: `clear → music → help → ls ./connections → vim → Hello Lain → (not found)`. Insert the four new cases between `music` and `help`:

```js
  } else if (lower === 'play') {
    if (!requireController(out)) { /* handled */ }
    else {
      window.spotifyController.resume();
      out.insertAdjacentText('beforeend', '> resuming playback\n');
    }

  } else if (lower === 'pause') {
    if (!requireController(out)) { /* handled */ }
    else {
      window.spotifyController.pause();
      out.insertAdjacentText('beforeend', '> paused\n');
    }

  } else if (lower === 'skip') {
    if (!requireController(out)) { /* handled */ }
    else {
      window.spotifyController.nextTrack();
      out.insertAdjacentText('beforeend', '> skipping track\n');
    }

  } else if (lower === 'prev') {
    if (!requireController(out)) { /* handled */ }
    else {
      window.spotifyController.previousTrack();
      out.insertAdjacentText('beforeend', '> previous track\n');
    }

  } else if (lower === 'help') {
```

Final order in `handleCommand`: `clear → music → play → pause → skip → prev → volume → help → ls ./connections → vim → Hello Lain → (not found)`

- [ ] **Step 3: Verify guard message**

In the browser, type `pause` before running `music` — should print `> no signal — run 'music' first`.

- [ ] **Step 4: Verify play/pause with Spotify logged in**

Run `music` to show the player. In the Spotify iframe, start a track playing. Then type `pause` — playback should stop and terminal prints `> paused`. Type `play` — playback resumes. Type `skip` — next track loads. Type `prev` — goes to previous track.

- [ ] **Step 5: Commit**

```bash
git add script.js
git commit -m "feat: add play, pause, skip, prev terminal commands"
```

---

## Task 6: Add `volume` command

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add `volume` case to `handleCommand`**

Inside `handleCommand`, add the `volume` case in the same block, after `prev`:

```js
  } else if (lower.startsWith('volume')) {
    if (!requireController(out)) { /* handled */ }
    else {
      const arg = cmd.slice(6).trim();
      const val = parseInt(arg, 10);
      if (!arg || isNaN(val) || val < 0 || val > 100) {
        out.insertAdjacentText('beforeend', 'usage: volume [0-100]\n');
      } else {
        window.spotifyController.setVolume(val / 100);
        out.insertAdjacentText('beforeend', `> volume set to ${val}%\n`);
      }
    }
```

- [ ] **Step 2: Verify volume validation**

In the browser, type `volume` (no argument) — should print `usage: volume [0-100]`. Type `volume abc` — same. Type `volume 200` — same.

- [ ] **Step 3: Verify volume works**

Type `music` to show player, start a track. Type `volume 30` — Spotify player volume lowers. Type `volume 100` — back to full. Terminal prints `> volume set to 30%` / `> volume set to 100%`.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: add volume terminal command"
```

---

## Task 7: Update `printHelp` with new commands

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Replace the `lines` array in `printHelp`**

Find `printHelp` in `script.js`. Replace the existing `lines` array with:

```js
  const lines = [
    '──────────────────────────────────────────────',
    '  help              show this message',
    '  ls ./connections  list profile links',
    '  vim [name]        open profile page',
    '                    e.g. vim GitHub',
    '  Hello Lain        ???',
    '  clear             clear terminal',
    '  music             toggle music player',
    '  play              resume playback',
    '  pause             pause playback',
    '  skip              next track',
    '  prev              previous track',
    '  volume [0-100]    set volume',
    '──────────────────────────────────────────────',
  ];
```

- [ ] **Step 2: Verify help output**

In the browser, type `help`. All 7 new commands should appear in the help table, aligned correctly.

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: update help command to include music commands"
```

---

## Task 8: Final verification pass

- [ ] **Step 1: Full flow test**

Open the page in a browser and run through this sequence:

1. Boot sequence completes → screen2 appears with auto-run help (new help table visible)
2. Type `clear` → terminal blanks
3. Type `music` → panel slides up bottom-right, terminal prints `> music player online`
4. Interact with Spotify iframe — if logged into Spotify, start a track playing
5. Now-playing row updates: cover art, track name, artist, progress bar animate
6. Type `pause` → playback pauses, terminal prints `> paused`
7. Type `play` → playback resumes
8. Type `skip` → next track, now-playing row updates
9. Type `prev` → previous track
10. Type `volume 50` → volume halves
11. Click `[minimize]` in panel → panel collapses to title bar showing mini cover + track name
12. Click `[minimize]` again → panel expands back
13. Click `[playlist]` → iframe expands to 380px showing full tracklist
14. Click `[playlist]` again → collapses back to 152px
15. Type `music` → panel hides, terminal prints `> music player offline`

- [ ] **Step 2: Check panel does not interfere with terminal**

The music panel (bottom-right) should not overlap the terminal window (centered). On typical viewport widths (1280px+) there is no overlap. Confirm on a narrower viewport (900px) — if overlap occurs, note it but do not fix (out of scope for this plan).

- [ ] **Step 3: Final commit if any loose ends**

```bash
git add -p
git commit -m "fix: final polish for music panel and terminal commands"
```

Only run this step if Step 1 revealed any small issues that needed a fix.
