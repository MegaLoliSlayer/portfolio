# Screen2 Desktop Redesign

**Date:** 2026-04-05  
**Status:** Approved

---

## Overview

Redesign screen2 into a two-panel desktop environment: a left Lain character panel and a right interactive desktop with a taskbar, floating windows, and window focus management.

---

## 1. Music Player Revert

Revert all resize/flex changes made to the music player back to the state at commit `4d2893c` (the animated cursor commit, before TV/background features were added):

- `#music-panel`: remove `display:flex`, `flex-direction:column`, `resize:both`, `min-width`, `min-height`, `max-width`, `max-height`
- `.music-content`: restore to `padding: 10px 12px 12px` only (no flex)
- `#embed-iframe`: restore `height: 152px; transition: height 0.3s ease` (remove `flex:1`, `min-height`)
- `#embed-iframe.playlist-expanded`: restore `height: 380px` (remove `min-height`)
- JS `toggleMusicMinimize()`: revert to simple `classList.add('minimized')` — no save/restore of width/height (music panel is not resizable so save/restore is unnecessary)
- JS `expandMusicPanel()`: revert to simple `classList.remove('minimized')`
- JS `toggleMusicPanel()`: keep the reset behavior (clear inline styles + show) so toggle-off/toggle-on still resets position

---

## 2. Layout Split

Screen2 is divided into two fixed panels:

### Left Panel — `#lain-side` (unchanged)
- Existing implementation kept exactly as-is
- `position: fixed; left: 0; top: 0; height: 100vh; z-index: 9`
- Contains: `#lain8`, `#lain28`, `#lain-bubble`
- No taskbar, no UI chrome extends here

### Right Panel — `#right-panel` (new)
- `position: fixed; top: 0; bottom: 0; right: 0`
- `left` is set dynamically: on `lain8` image load (and `window resize`), JS reads `lain8.offsetWidth` and sets `document.documentElement.style.setProperty('--lain-w', lain8.offsetWidth + 'px')`. The panel uses `left: var(--lain-w, 200px)`.
- Contains all desktop content: background, overlay, scanlines, floating windows, taskbar

### Background
- `#right-bg` moves inside `#right-panel`
- `position: absolute; inset: 0; object-fit: cover; z-index: 0`
- `.overlay` and `.scanlines` also inside `#right-panel` at z-index 1 and 2

---

## 3. Taskbar

- `position: absolute; bottom: 0; left: 0; right: 0; height: 40px; z-index: 100`
- Background: `rgba(5, 5, 15, 0.95)`, top border `1px solid #00ffcc33`
- **4 buttons** left-aligned with gap: `[connections]` `[music]` `[tv]` `[background]`
  - Each button shows an active indicator (accent-colored dot or glow) when its panel is visible
  - `connections` → toggles connections sidebar
  - `music` → calls `toggleMusicPanel()`
  - `tv` → toggles TV panel visibility (same as terminal `tv` command)
  - `background` → toggles background picker panel
- Username label `SADAME@WIRED` right-aligned

**Drag clamping:** all window drag handlers clamp `y` to `window.innerHeight - panel.offsetHeight - 40` (40px taskbar) so windows cannot be dragged behind the taskbar.

---

## 4. Floating Windows

All windows are `position: absolute` inside `#right-panel` (or `position: fixed` with equivalent coordinate translation). All participate in the focus system.

### Terminal
- Keeps all current behavior: drag, minimize/restore (yellow/green), resize
- Initial position: centered horizontally in right panel, `top: 60px`
- Drag clamped within right panel bounds (respects `--lain-w` on left, taskbar on bottom)

### Music Player (reverted)
- Original fixed-size panel (`width: 300px`)
- Drag + minimize/restore
- No resize
- Initial position: bottom-right of right panel (above taskbar)
- Toggle via taskbar `[music]` button

### TV Panel
- Keeps current behavior: drag, minimize/restore, resize
- Initial position: top-right of right panel
- Toggle via taskbar `[tv]` button

### Connections Sidebar — new
- `position: absolute; left: 0; top: 0; bottom: 40px; width: 260px; z-index: 20`
- Slides in/out: `transform: translateX(-100%)` (hidden) ↔ `translateX(0)` (visible), `transition: transform 0.25s ease`
- Title bar: `SADAME@WIRED:~/connections` + `×` close button
- Body: 6 platform links as styled rows (same `term-link` look)
- Clicking a link opens it in a new tab
- Does **not** participate in drag (it's edge-anchored)
- Does participate in focus (clicking it brings it above other windows)

### Background Picker — new
- Floating panel, `width: 320px`
- Initial position: centered on right panel
- Title bar: `WIRED://background` + `×` close button, **draggable**
- Body: grid of cells (3 columns), one cell per file in `BACKGROUND_FILES`
  - Cell shows the filename (e.g., `lain3.gif`)
  - Active file gets `border: 1px solid var(--accent)` highlight
  - Click → sets `#right-bg` src, updates active highlight
- Participates in focus system and drag

---

## 5. Window Focus Management

```js
let topZ = 20;
function bringToFront(el) {
  el.style.zIndex = ++topZ;
}
```

Every window (terminal, music, TV, connections sidebar, background picker) registers a `mousedown` listener on its root element that calls `bringToFront(this)`. This gives the last-clicked window the highest z-index, matching standard desktop behavior.

The taskbar stays above all windows at `z-index: 100`.

---

## 6. Files Changed

| File | Changes |
|------|---------|
| `index.html` | Wrap right-panel content in `#right-panel` div; add taskbar HTML; add connections sidebar HTML; add background picker HTML |
| `style.css` | Add `#right-panel`; revert music player CSS; add taskbar, connections sidebar, background picker styles; update drag clamp references |
| `script.js` | Add `--lain-w` measurement; revert music JS; add `bringToFront`; add taskbar button handlers; add connections sidebar toggle; add background picker toggle + grid render |

---

## 7. Out of Scope

- The terminal command interface (typing commands) is kept as-is alongside the taskbar shortcuts
- The `background [name]` terminal command continues to work
- No changes to boot sequence (screen1)
- No changes to lain8/lain28/dialog bubble behavior
