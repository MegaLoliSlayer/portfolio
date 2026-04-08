# Sys-monitor Panel ("sysmon") — Design

Date: 2026-04-08
Status: Approved — ready for implementation plan

## Purpose

Add a draggable desktop panel to screen 2 that mimics the Windows Task Manager "Performance" tab, in the existing SADAME@WIRED / Serial Experiments Lain aesthetic. It surfaces a mix of **real** browser telemetry (with professional labels and units) and **simulated**, lain-themed metrics for atmosphere.

The panel is a visual/ambient feature. It is not a real system monitor and must not claim to be one for simulated values.

## Scope

In scope:
- New window matching the existing terminal/tv/music/about panel pattern (titlebar, red/yellow/green dots, drag, minimize, close, restore).
- New taskbar button to toggle visibility.
- Left sidebar list of metrics grouped into `// REAL`, `// PSYCHE`, and `// WIRED` sections; click a row to select it.
- Right pane split vertically: top ≈70% large rolling chart of the currently selected metric (cur/min/max + 60 s window); bottom ≈30% process table.
- Real-telemetry sampling and a simple random-walk engine for simulated metrics.
- Process / thread table populated from real open panels plus fictional lain-themed daemons.
- Reduced-motion fallback (throttle updates, no animated gradients).

Out of scope:
- URL state sync for the selected metric.
- Persistence across reloads.
- Multi-metric overlay on the big chart.
- Historical export / CSV.
- Mobile-specific redesign (panel follows existing desktop-only conventions).

## Visual & Interaction Design

### Window chrome

- Container `#sysmon-panel` mirrors `#about-panel` structure:
  - `.sysmon-titlebar` with three `.dot` spans (`close`, `minimize`, `restore`) and `.sysmon-title` reading `SADAME@WIRED:~/sysmon`.
  - Drag behavior reuses whatever handler drives the other panels.
- Default size ~640×360, min 480×300. Centered on first open.

### Layout

```
┌──────────────────────────────────────────────────┐
│ ● ● ●  SADAME@WIRED:~/sysmon                     │
├──────────────────┬───────────────────────────────┤
│ // REAL          │  Frame Rate / fps             │
│  Frame Rate   60 │   ┌───────────────────────┐   │
│  [▁▂▂▃▂▂▃▂]      │   │      big chart        │   │
│  JS Heap  42 MiB │   │      (canvas)         │   │
│  [▁▁▂▂▂▃▃▃]      │   └───────────────────────┘   │
│  Storage 312 MiB │   cur 60  min 58  max 61      │
│  [▁▁▁▁▁▁▁▁]      │   60 s window · 10 Hz         │
│                  ├───────────────────────────────┤
│ // PSYCHE        │ PID   NAME         THR  LOAD  │
│  Chip   ONLINE   │ 0001  copland.os     4   2%   │
│  Temp     34°C   │ 0042  navi.sys       2  11%   │
│  [▁▂▃▂▃▂▃▂]      │ 0073  psyche.drv     1   7%   │
│                  │ 0128  protocol7.d    1   3%   │
│ // WIRED         │ 0201  terminal       1   0%   │
│  Schumann  7.83  │ 0202  music          2   4%   │
│  [~~~~~~~~]      │                               │
│  ...             │                               │
└──────────────────┴───────────────────────────────┘
```

- Sidebar ≈35% width, right pane ≈65%.
- Sidebar row: label line (`// REAL`, `// PSYCHE`, `// WIRED` headers are dim), current value line, inline SVG sparkline (~18 px tall).
- Selected row: highlighted border/background and matching accent on the big chart.
- Big chart: single `<canvas>`, 60-second rolling window, horizontal gridlines at min/mid/max, faint vertical grid every 10 s.
- Footer readout under the big chart: `cur <v>  min <v>  max <v>` using `font-variant-numeric: tabular-nums`.
- Process table (bottom of right pane): fixed-width columns `PID  NAME  THR  LOAD`, monospace, scrollable if rows overflow. Header row uses the dim `//` style. Updates every 1 s.

### Taskbar integration

- Add `#tb-sysmon` button with glyph `◉ sysmon` next to the other taskbar buttons in `#taskbar-buttons`.
- Clicking toggles panel visibility, mirroring `taskbarToggleTerminal` / `toggleMusicPanel` patterns.

## Data Model

### Metric definition

```js
// Conceptual shape — exact field names finalized during implementation.
const metric = {
  id: 'fps',             // stable key
  group: 'real',         // 'real' | 'wired'
  label: 'Frame Rate',   // sidebar + chart header
  unit: 'fps',           // rendered next to value
  format: v => v.toFixed(0),
  sample: () => number,  // called each tick
  color: '#c0ffd0',      // line/accent color
  ring: Float32Array(MAX_SAMPLES)
};
```

- `MAX_SAMPLES = 600` (60 s × 10 Hz). Ring buffer with a head index.
- Missing readings (e.g., `performance.memory` unavailable) store `NaN`; renderer skips them.

### Metric list

**Real:**

| id | label | unit | source |
|---|---|---|---|
| `fps` | Frame Rate | fps | rAF delta (EMA smoothed over ~500 ms) |
| `heapUsed` | JS Heap Used | MiB | `performance.memory.usedJSHeapSize` |
| `heapLimit` | JS Heap Limit | MiB | `performance.memory.jsHeapSizeLimit` (static, shown as readout only) |
| `cores` | Logical Cores | cores | `navigator.hardwareConcurrency` (static readout) |
| `dpr` | Device Pixel Ratio | × | `devicePixelRatio` (static readout) |
| `viewport` | Viewport | px | `innerWidth × innerHeight` (static readout) |
| `netType` | Network Type | — | `navigator.connection.effectiveType` (static text) |
| `downlink` | Downlink | Mb/s | `navigator.connection.downlink` |
| `uptime` | Session Uptime | hh:mm:ss | `performance.now()` since script boot |
| `storageUsed` | Storage Used | MiB | `navigator.storage.estimate().usage` (async, refreshed every 5 s) |
| `storageQuota` | Storage Quota | MiB | `navigator.storage.estimate().quota` (static readout) |

Metrics that are "static readout only" render in the sidebar as label + value with no sparkline, and are not selectable in the big chart area.

**Psyche chip (flavored, rendered as its own sidebar group):**

| id | label | unit | behavior |
|---|---|---|---|
| `psycheStatus` | Chip | — | static text `ONLINE` once the sampler starts |
| `psycheTemp` | Temp | °C | random walk around 34 °C, σ ≈ 0.4, clamped [30, 42] |
| `psycheLoad` | Load | % | bounded random walk 0–100; drifts upward while `document.hidden` |

The Psyche group is what the old "Psyche Load" metric has been promoted into — it now has its own section header `// PSYCHE` matching the canon chip name from the show.

**Simulated (wired):**

| id | label | unit | behavior |
|---|---|---|---|
| `schumann` | Schumann Resonance | Hz | random walk around 7.83 (σ ≈ 0.05), clamped to [7.6, 8.1] |
| `protocol7` | Protocol 7 Flux | — | `sin(t/6) * 40 + noise`, occasional spike (+30) every 20–40 s |
| `bandwidth` | Wired Bandwidth | kb/s | base noise; if `navigator.connection.downlink` present, scale base by it |
| `anchor` | Reality Anchor | % | hovers 98.5–99.9; rare dips to ~92 every ~60 s |
| `coherence` | Layer Coherence | — | slow sine, period ≈ 180 s, amplitude 0.3 around 0.7 |

Simulated metrics are flagged in the UI (section header `// WIRED`) so they read as atmosphere, not telemetry.

### Process table

Displayed in the bottom of the right pane. Each row: `PID  NAME  THR  LOAD`.

Two sources of rows:

1. **Fictional daemons** — always present, seeded at panel init with stable PIDs:

   | PID | Name | Threads | Load source |
   |---|---|---|---|
   | 0001 | `copland.os`   | 4 | `hardwareConcurrency`-scaled baseline noise |
   | 0042 | `navi.sys`     | 2 | slow sine + noise |
   | 0073 | `psyche.drv`   | 1 | mirrors `psycheLoad / 10` |
   | 0128 | `protocol7.d`  | 1 | mirrors `protocol7` scaled to 0–15% |
   | 0256 | `schumann.mon` | 1 | mirrors `|schumann − 7.83|` × const |
   | 0333 | `wired.link`   | 1 | bandwidth-scaled |

2. **Real "processes"** — one row per currently-open panel, dynamically added/removed:

   | Panel open | Name | PID rule |
   |---|---|---|
   | terminal | `terminal` | 0200 + slot |
   | music | `music` | 0200 + slot |
   | tv | `tv` | 0200 + slot |
   | about | `about_me` | 0200 + slot |
   | connections | `connections` | 0200 + slot |
   | bg-picker | `bg.conf` | 0200 + slot |
   | sysmon | `sysmon` | 0200 + slot |

   Threads for real panels default to 1, except `music` = 2 (iframe) and `sysmon` = 2 (sampler + render). Load is a small randomized value per tick (0–5%) to avoid implying real measurement.

Table refreshes every 1 s. Real panels are detected by reading the same `classList.contains('open')` / visibility flags used by the existing toggle functions — no new state is introduced.

## Runtime & Sampling

- Boot: instantiate metric registry once on `DOMContentLoaded` and start the sampling loop only when the panel is first opened; keep sampling while the panel is open *or* minimized, stop when fully closed.
- Two loops:
  - **rAF loop** — only for `fps`. Compute instantaneous fps from frame delta, feed EMA.
  - **100 ms interval loop** — pushes a sample for every metric into its ring buffer, then triggers a render pass.
- Render pass:
  - Sidebar DOM updates: update value text nodes and re-draw each SVG mini-sparkline by setting a single `points` attribute.
  - Big chart: clear canvas, draw grid, draw polyline for the selected metric's ring buffer, draw cur/min/max in the footer.
- Pause sampling when `document.hidden` *and* the panel is closed. When hidden but panel open, continue at a reduced rate (500 ms) so returning to the tab shows a live chart.

## Styling

- Reuse existing palette (`--accent`, `--text`, etc.) and Share Tech Mono font.
- New `.sysmon-*` class namespace; no changes to existing components.
- Sidebar headers use the same `// what i like` style as the about panel (`.sysmon-heading`).
- Big chart canvas sized via CSS and backed by `devicePixelRatio`-aware backing store.
- `@media (prefers-reduced-motion: reduce)`: fall back to 500 ms sampling, no line-glow animation.

## File Changes

- `index.html` — add `#sysmon-panel` markup inside `#right-panel`, and `#tb-sysmon` button in `#taskbar-buttons`.
- `style.css` — append a `/* ─── Sys-monitor ─── */` section with `.sysmon-*` rules.
- `script.js` — append a sys-monitor module: metric registry, sampling loops, renderer, open/close/drag wiring reusing existing panel helpers.

No existing components are modified beyond adding the new taskbar button. No new files.

## Error Handling & Edge Cases

- `performance.memory` missing (Firefox/Safari) → heap metrics show `—` and are rendered with no sparkline.
- `navigator.connection` missing → `netType` / `downlink` show `—`; `bandwidth` simulated metric falls back to pure noise.
- Tab backgrounded → rAF stops delivering frames; fps will drop and recover — acceptable, it is the real value.
- Canvas resize (window resize) → observe with `ResizeObserver` and re-init the backing store.
- If the user closes the panel during a sample, the pending render is a no-op (guarded by an `isOpen` flag).

## Testing

- **Manual** (primary): open the panel, confirm all real metrics render sensible values on Chromium, confirm graceful dashes on Firefox/Safari where APIs are missing, resize the window, toggle fullscreen, switch tabs, open devtools, trigger a memory spike by opening other panels.
- **Reduced motion**: toggle OS reduced-motion and confirm sampling throttles and no infinite animations.
- **Smoke script** (optional, non-blocking): a tiny in-page assertion block under a `?sysmon-test=1` query param that spins the sampler for 2 seconds and logs that each metric received ≥1 non-NaN sample. Not a CI test — just an aid during development.

No automated test suite exists in this project, so the testing strategy is intentionally manual-first.

## Risks & Open Questions

- **Canvas vs SVG for big chart**: chosen canvas for perf; if the 10 Hz redraw ever shows up in profiling it's contained to one element and easy to swap.
- **Simulated metric naming**: names chosen here are final unless the user pushes back during implementation.
- **Taskbar crowding**: adding one more button is fine; if later we add more, consider an overflow menu.
