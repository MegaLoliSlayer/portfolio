# Spotify Player + Terminal Music Commands — Design Spec

**Date:** 2026-04-04
**Project:** SADAME@WIRED portfolio

---

## Overview

Add an embedded Spotify playlist player to the portfolio with a terminal-styled GUI panel and interactive terminal commands for controlling playback. The player panel lives in the bottom-right corner of screen2, hidden by default and toggled via terminal commands.

---

## Architecture

Three existing files are modified. No new files created.

| File | Changes |
|---|---|
| `index.html` | Add Spotify iFrame API `<script>` in `<head>`; add music panel HTML in `screen2` before `<script src="script.js">` |
| `style.css` | Add music panel styles (panel, title bar, now-playing row, iframe container, button row, minimize/visible states) |
| `script.js` | Add `onSpotifyIframeApiReady` init, `updateNowPlaying()`, panel toggle logic, 7 new terminal commands, updated `printHelp()` |

---

## Music Panel (GUI)

### Structure

```
┌─ title bar ──────────────────────────────────┐
│ ● ● ●   SADAME@WIRED:~/music                 │
├─ now-playing row ────────────────────────────┤
│ [52×52 cover art]  Track Name                │
│                    Artist Name               │
│                    ████░░░░░ progress bar    │
├─ spotify iframe ─────────────────────────────┤
│  (iFrame API-created element, ~152px tall)   │
├─ button row ─────────────────────────────────┤
│        [minimize]      [playlist]            │
└──────────────────────────────────────────────┘
```

### Positioning & Visibility

- `position: fixed`, `bottom: 24px`, `right: 24px`, `z-index: 10`
- `width: 300px`
- Hidden by default: `opacity: 0`, `pointer-events: none`, `transform: translateY(12px)`
- Visible state (`.visible` class): `opacity: 1`, `pointer-events: auto`, `transform: translateY(0)`
- Transition: `opacity 0.3s ease, transform 0.3s ease` — slides up + fades in
- The panel `div` is always in the DOM so the iFrame API can initialize on page load

### Title Bar

- Same dot pattern as terminal window (red/yellow/green)
- Label: `SADAME@WIRED:~/music`
- When minimized: title bar also shows a `22×22` cover thumbnail + marquee-scrolling track name inline

### Now-Playing Row

- Visible only after first `playback_update` event fires
- Before any track: shows `♪` placeholder icon + `-- no signal --` text
- Cover art: `52×52` `<img>`, `border-radius: 4px`, `border: 1px solid #00ffcc44`
- Track name: `color: var(--accent)`, truncated with `text-overflow: ellipsis`
- Artist name: `color: var(--text)` at 50% opacity
- Progress bar: `4px` tall div, width set to `(position / duration) * 100%` on each `playback_update`

### Spotify Iframe Container

- `id="embed-iframe"` — the iFrame API inserts its `<iframe>` here
- Default height: `152px` (compact player, controls only)
- Playlist mode height: `380px` (full tracklist visible)
- `overflow: hidden`, `transition: height 0.3s ease` for smooth toggle
- `border-radius: 6px`

### Button Row

- `[minimize]` — toggles `.minimized` class on panel, collapses everything below title bar
- `[playlist]` — toggles iframe container height between `152px` and `380px`
- Style: `background: transparent`, `border: 1px solid #00ffcc44`, `color: var(--accent)`, monospace font, `border-radius: 4px`

---

## Spotify iFrame API Integration

### Script tag (index.html `<head>`)

```html
<script src="https://open.spotify.com/embed/iframe-api/v1" async></script>
```

### Controller initialization (script.js)

```js
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

### updateNowPlaying(data)

Reads from `playback_update` event data:
- `data.track.name` → track name display
- `data.track.artists[0].name` → artist display
- `data.track.album.images[0].url` → cover art `<img src>`
- `data.position / data.duration` → progress bar width %

Updates the now-playing row and the minimized title bar thumbnail in place.

---

## Terminal Commands

### New commands

| Command | Behavior |
|---|---|
| `clear` | Clears `#terminal-output` innerHTML |
| `music` | Toggles music panel `.visible` class (show/hide) |
| `play` | Calls `spotifyController.resume()` |
| `pause` | Calls `spotifyController.pause()` |
| `skip` | Calls `spotifyController.nextTrack()` |
| `prev` | Calls `spotifyController.previousTrack()` |
| `volume [0-100]` | Parses integer, calls `spotifyController.setVolume(n / 100)` |

### Command output behavior

- `clear`: wipes `#terminal-output` entirely (including the echoed command line) — terminal is blank after, prompt re-appears
- `music` (show): prints `> music player online` then shows panel
- `music` (hide): prints `> music player offline` then hides panel
- `play`, `pause`, `skip`, `prev`: print a one-line confirmation, e.g. `> resuming playback`, `> paused`, `> skipping track`, `> previous track`
- `volume 75`: prints `> volume set to 75%`

### Error handling

If `window.spotifyController` is not yet initialized when a playback command is run, print:
```
> no signal — run 'music' first
```

For `volume`: if the argument is missing or not a number 0–100, print:
```
usage: volume [0-100]
```

### Updated help output

```
──────────────────────────────────────────────
  help              show this message
  ls ./connections  list profile links
  vim [name]        open profile page
                    e.g. vim GitHub
  Hello Lain        ???
  clear             clear terminal
  music             toggle music player
  play              resume playback
  pause             pause playback
  skip              next track
  prev              previous track
  volume [0-100]    set volume
──────────────────────────────────────────────
```

---

## Styling Notes

- All new styles use existing CSS variables: `--bg`, `--text`, `--accent`, `--terminal-bg`, `--glow`
- No new color values introduced
- Panel uses same `backdrop-filter: blur(8px)` and `box-shadow: var(--glow)` as the terminal window
- Panel sits at `z-index: 10` (above GIFs at z-index 2, below nothing critical)
