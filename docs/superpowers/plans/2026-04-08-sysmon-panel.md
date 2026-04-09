# Sys-monitor Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a draggable "sysmon" desktop panel that renders real browser telemetry and lain-themed simulated metrics in a Task Manager "Performance"-tab layout.

**Architecture:** A single sys-monitor module appended to `script.js` owns a metric registry (real + simulated + psyche), a sampling loop (rAF for FPS + 100 ms interval for everything else), a sidebar renderer (SVG mini-sparklines), a big-chart canvas renderer, and a process table fed by the existing panel-`.visible` flags. HTML markup is added inside `#right-panel`, CSS lives in a new `.sysmon-*` section in `style.css`. No new files.

**Tech Stack:** Vanilla HTML / CSS / JS (no build, no test framework). Uses `requestAnimationFrame`, `performance.memory` (Chromium), `navigator.storage.estimate()`, `navigator.connection`, `ResizeObserver`, inline SVG, `<canvas>`.

**Spec:** `docs/superpowers/specs/2026-04-08-sysmon-panel-design.md`

**Testing note:** This repo has no automated test suite. Verification for every task is **manual**: load `index.html` in a browser (Chromium recommended for `performance.memory`) and confirm the described behavior. No test-writing steps are included because fabricating them would be dishonest. Commit after each task.

---

## File Structure

- `index.html` — add `#sysmon-panel` markup block after `#about-panel`, and `#tb-sysmon` button inside `#taskbar-buttons`.
- `style.css` — append a single `/* ─── Sys-monitor ─── */` section with all `.sysmon-*` rules.
- `script.js` — append a single `// ─── Sys-monitor ─────────────` section containing the registry, samplers, renderers, open/close/drag wiring.

---

## Task 1: Add panel markup and taskbar button

**Files:**
- Modify: `index.html` (insert after `#about-panel`, before `#taskbar`; add one `<button>` inside `#taskbar-buttons`)

- [ ] **Step 1: Add the `#sysmon-panel` markup block**

Insert directly after the closing `</div>` of `#about-panel` and before `<!-- Taskbar -->`:

```html
<!-- Sys-monitor Panel -->
<div id="sysmon-panel">
  <div class="sysmon-titlebar">
    <span class="dot dot-red sysmon-dot"    onclick="closeSysmon()"    title="Close">&#10005;</span>
    <span class="dot dot-yellow sysmon-dot" onclick="minimizeSysmon()" title="Minimize">&#8722;</span>
    <span class="dot dot-green sysmon-dot"  onclick="restoreSysmon()"  title="Restore">&#43;</span>
    <span class="sysmon-title">SADAME@WIRED:~/sysmon</span>
  </div>
  <div class="sysmon-body">
    <div class="sysmon-sidebar" id="sysmon-sidebar"></div>
    <div class="sysmon-main">
      <div class="sysmon-chart-wrap">
        <div class="sysmon-chart-header">
          <span id="sysmon-chart-label">Frame Rate / fps</span>
          <span id="sysmon-chart-window">60 s window · 10 Hz</span>
        </div>
        <canvas id="sysmon-canvas"></canvas>
        <div class="sysmon-chart-footer">
          <span>cur <b id="sysmon-cur">—</b></span>
          <span>min <b id="sysmon-min">—</b></span>
          <span>max <b id="sysmon-max">—</b></span>
        </div>
      </div>
      <div class="sysmon-proc-wrap">
        <div class="sysmon-proc-header">// processes</div>
        <div class="sysmon-proc-table" id="sysmon-proc-table"></div>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Add the taskbar button**

Inside `#taskbar-buttons`, add immediately after `#tb-about`:

```html
<button class="tb-btn" id="tb-sysmon" onclick="taskbarToggleSysmon()">◉ sysmon</button>
```

- [ ] **Step 3: Manual verify**

Reload `index.html`. Sysmon panel must exist in the DOM but be invisible (CSS is added next task — that's expected). The new `◉ sysmon` button must appear in the taskbar next to `☻ about`. Clicking it will throw a `ReferenceError` in the console — that's expected at this step.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(sysmon): add panel markup and taskbar button"
```

---

## Task 2: Style the panel shell (titlebar + hidden-by-default + dimensions)

**Files:**
- Modify: `style.css` (append new section at end of file)

- [ ] **Step 1: Append the base sysmon section**

Add at the end of `style.css`:

```css
/* ─── Sys-monitor ─────────────────────────────────────── */
#sysmon-panel {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 720px;
  height: 420px;
  min-width: 520px;
  min-height: 320px;
  background: rgba(4, 10, 6, 0.92);
  border: 1px solid var(--accent, #0f0);
  box-shadow: 0 0 24px rgba(0, 255, 100, 0.15);
  display: none;
  flex-direction: column;
  font-family: 'Share Tech Mono', monospace;
  color: var(--text, #c0ffd0);
  z-index: 30;
}
#sysmon-panel.visible { display: flex; }
#sysmon-panel.dragging { transition: none; user-select: none; }

.sysmon-titlebar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(0, 40, 10, 0.7);
  border-bottom: 1px solid var(--accent, #0f0);
  cursor: move;
  font-size: 11px;
}
.sysmon-title {
  margin-left: auto;
  opacity: 0.75;
  letter-spacing: 0.5px;
}

.sysmon-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.sysmon-sidebar {
  width: 36%;
  min-width: 200px;
  padding: 6px;
  border-right: 1px solid rgba(0, 255, 100, 0.25);
  overflow-y: auto;
  font-size: 11px;
}

.sysmon-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sysmon-chart-wrap {
  flex: 1 1 70%;
  display: flex;
  flex-direction: column;
  padding: 6px 8px;
  min-height: 0;
}
.sysmon-chart-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  opacity: 0.8;
  margin-bottom: 4px;
}
#sysmon-canvas {
  flex: 1;
  width: 100%;
  background: repeating-linear-gradient(0deg, rgba(0,255,100,0.04) 0 1px, transparent 1px 40px);
  border: 1px solid rgba(0, 255, 100, 0.2);
}
.sysmon-chart-footer {
  display: flex;
  gap: 16px;
  margin-top: 4px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  opacity: 0.85;
}
.sysmon-chart-footer b { color: var(--accent, #0f0); font-weight: normal; }

.sysmon-proc-wrap {
  flex: 0 0 30%;
  min-height: 110px;
  max-height: 40%;
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(0, 255, 100, 0.25);
  padding: 4px 8px;
}
.sysmon-proc-header { font-size: 10px; opacity: 0.55; margin-bottom: 2px; }
.sysmon-proc-table {
  flex: 1;
  overflow-y: auto;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
}
```

- [ ] **Step 2: Add sidebar row styling**

Append:

```css
.sysmon-section-header {
  font-size: 10px;
  opacity: 0.55;
  margin: 6px 2px 2px 2px;
  letter-spacing: 0.5px;
}
.sysmon-section-header:first-child { margin-top: 0; }

.sysmon-row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  grid-column-gap: 6px;
  padding: 3px 4px;
  border: 1px solid transparent;
  cursor: pointer;
}
.sysmon-row:hover { background: rgba(0, 255, 100, 0.05); }
.sysmon-row.selected {
  border-color: var(--accent, #0f0);
  background: rgba(0, 255, 100, 0.08);
}
.sysmon-row.static { cursor: default; }
.sysmon-row.static:hover { background: transparent; }

.sysmon-row-label { opacity: 0.7; font-size: 10px; }
.sysmon-row-value { text-align: right; font-variant-numeric: tabular-nums; }
.sysmon-row-spark { grid-column: 1 / -1; height: 16px; width: 100%; }
.sysmon-row-spark polyline { fill: none; stroke: var(--accent, #0f0); stroke-width: 1; }
```

- [ ] **Step 3: Reduced-motion block**

Append:

```css
@media (prefers-reduced-motion: reduce) {
  #sysmon-canvas { image-rendering: pixelated; }
}
```

- [ ] **Step 4: Manual verify**

Temporarily add `class="visible"` to `#sysmon-panel` in `index.html`, reload. The panel must render centered, with a clear titlebar, empty sidebar, empty canvas area, and an empty process area. Remove the temporary class.

- [ ] **Step 5: Commit**

```bash
git add style.css
git commit -m "feat(sysmon): style panel shell, sidebar, chart, process area"
```

---

## Task 3: Metric registry and ring buffers

**Files:**
- Modify: `script.js` (append new section at end)

- [ ] **Step 1: Append the section header and constants**

Add at the very bottom of `script.js`:

```js
// ─── Sys-monitor ───────────────────────────────────────────────
const SYSMON_HZ = 10;                    // sample rate
const SYSMON_WINDOW_S = 60;              // visible window
const SYSMON_MAX_SAMPLES = SYSMON_HZ * SYSMON_WINDOW_S; // 600

function sysmonRing() {
  return {
    buf: new Float32Array(SYSMON_MAX_SAMPLES),
    head: 0,
    filled: 0,
  };
}

function sysmonPush(ring, v) {
  ring.buf[ring.head] = v;
  ring.head = (ring.head + 1) % SYSMON_MAX_SAMPLES;
  if (ring.filled < SYSMON_MAX_SAMPLES) ring.filled++;
}

function sysmonLast(ring) {
  if (ring.filled === 0) return NaN;
  const idx = (ring.head - 1 + SYSMON_MAX_SAMPLES) % SYSMON_MAX_SAMPLES;
  return ring.buf[idx];
}

function sysmonMinMax(ring) {
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < ring.filled; i++) {
    const v = ring.buf[i];
    if (!Number.isFinite(v)) continue;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  if (!Number.isFinite(lo)) return [NaN, NaN];
  return [lo, hi];
}
```

- [ ] **Step 2: Add metric state holders**

Append:

```js
const sysmonState = {
  isOpen: false,
  rafId: null,
  intervalId: null,
  lastFrameT: 0,
  fpsEMA: 60,
  selectedId: 'fps',
  metrics: {},       // id -> metric def
  order: [],         // [{group, ids: [...]}]
  staticReadouts: {},// id -> last-known string value (no ring)
};
```

- [ ] **Step 3: Define `sysmonRegisterMetric`**

Append:

```js
function sysmonRegisterMetric(def) {
  // def: { id, group, label, unit, format, sample, color, selectable }
  def.selectable = def.selectable !== false;
  if (def.selectable) def.ring = sysmonRing();
  sysmonState.metrics[def.id] = def;
}
```

- [ ] **Step 4: Manual verify**

Reload the page. Open devtools console. Run `sysmonRing().buf.length` — expect `600`. Run `sysmonState` — expect the object with empty `metrics` and `order`. No errors.

- [ ] **Step 5: Commit**

```bash
git add script.js
git commit -m "feat(sysmon): add metric registry, ring buffer primitives"
```

---

## Task 4: Register real, psyche, and simulated metrics

**Files:**
- Modify: `script.js` (append to the Sys-monitor section started in Task 3)

- [ ] **Step 1: Add storage-estimate cache**

Append:

```js
let sysmonStorageCache = { usage: NaN, quota: NaN, t: 0 };
function sysmonRefreshStorage() {
  if (!navigator.storage || !navigator.storage.estimate) return;
  navigator.storage.estimate().then(e => {
    sysmonStorageCache = {
      usage: (e.usage || 0) / (1024 * 1024),
      quota: (e.quota || 0) / (1024 * 1024),
      t: performance.now(),
    };
  }).catch(() => {});
}
```

- [ ] **Step 2: Register real metrics**

Append:

```js
function sysmonRegisterReal() {
  sysmonRegisterMetric({
    id: 'fps', group: 'real', label: 'Frame Rate', unit: 'fps',
    color: '#c0ffd0',
    format: v => Number.isFinite(v) ? v.toFixed(0) : '—',
    sample: () => sysmonState.fpsEMA,
  });
  sysmonRegisterMetric({
    id: 'heapUsed', group: 'real', label: 'JS Heap Used', unit: 'MiB',
    color: '#ffe080',
    format: v => Number.isFinite(v) ? v.toFixed(1) : '—',
    sample: () => {
      const m = performance.memory;
      return m ? m.usedJSHeapSize / (1024 * 1024) : NaN;
    },
  });
  sysmonRegisterMetric({
    id: 'storageUsed', group: 'real', label: 'Storage Used', unit: 'MiB',
    color: '#80c0ff',
    format: v => Number.isFinite(v) ? v.toFixed(1) : '—',
    sample: () => sysmonStorageCache.usage,
  });
  sysmonRegisterMetric({
    id: 'downlink', group: 'real', label: 'Downlink', unit: 'Mb/s',
    color: '#80ffe0',
    format: v => Number.isFinite(v) ? v.toFixed(1) : '—',
    sample: () => {
      const c = navigator.connection;
      return c && typeof c.downlink === 'number' ? c.downlink : NaN;
    },
  });

  // Static readouts (no ring, not selectable)
  sysmonRegisterMetric({
    id: 'cores', group: 'real', label: 'Logical Cores', unit: 'cores',
    selectable: false, format: v => String(v),
    sample: () => navigator.hardwareConcurrency || 0,
  });
  sysmonRegisterMetric({
    id: 'dpr', group: 'real', label: 'Device Pixel Ratio', unit: '×',
    selectable: false, format: v => v.toFixed(2),
    sample: () => window.devicePixelRatio || 1,
  });
  sysmonRegisterMetric({
    id: 'viewport', group: 'real', label: 'Viewport', unit: 'px',
    selectable: false, format: () => `${innerWidth}×${innerHeight}`,
    sample: () => 0,
  });
  sysmonRegisterMetric({
    id: 'netType', group: 'real', label: 'Network Type', unit: '',
    selectable: false,
    format: () => (navigator.connection && navigator.connection.effectiveType) || '—',
    sample: () => 0,
  });
  sysmonRegisterMetric({
    id: 'uptime', group: 'real', label: 'Session Uptime', unit: '',
    selectable: false,
    format: () => {
      const s = Math.floor(performance.now() / 1000);
      const hh = String(Math.floor(s / 3600)).padStart(2, '0');
      const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    },
    sample: () => 0,
  });
  sysmonRegisterMetric({
    id: 'storageQuota', group: 'real', label: 'Storage Quota', unit: 'MiB',
    selectable: false,
    format: () => Number.isFinite(sysmonStorageCache.quota) ? sysmonStorageCache.quota.toFixed(0) : '—',
    sample: () => 0,
  });
}
```

- [ ] **Step 3: Register psyche metrics**

Append:

```js
function sysmonRegisterPsyche() {
  let temp = 34, load = 20;
  sysmonRegisterMetric({
    id: 'psycheStatus', group: 'psyche', label: 'Chip', unit: '',
    selectable: false, format: () => 'ONLINE', sample: () => 0,
  });
  sysmonRegisterMetric({
    id: 'psycheTemp', group: 'psyche', label: 'Temp', unit: '°C',
    color: '#ff80a0',
    format: v => v.toFixed(1),
    sample: () => {
      temp += (Math.random() - 0.5) * 0.3;
      if (temp < 30) temp = 30;
      if (temp > 42) temp = 42;
      return temp;
    },
  });
  sysmonRegisterMetric({
    id: 'psycheLoad', group: 'psyche', label: 'Load', unit: '%',
    color: '#ffa060',
    format: v => v.toFixed(0),
    sample: () => {
      const drift = document.hidden ? 0.4 : 0;
      load += (Math.random() - 0.5) * 3 + drift;
      if (load < 0) load = 0;
      if (load > 100) load = 100;
      return load;
    },
  });
}
```

- [ ] **Step 4: Register wired (simulated) metrics**

Append:

```js
function sysmonRegisterWired() {
  let schu = 7.83;
  let p7phase = 0, p7nextSpike = performance.now() + 20000;
  let anchor = 99;
  const t0 = performance.now();

  sysmonRegisterMetric({
    id: 'schumann', group: 'wired', label: 'Schumann Resonance', unit: 'Hz',
    color: '#80ff80',
    format: v => v.toFixed(3),
    sample: () => {
      schu += (Math.random() - 0.5) * 0.02;
      // pull back to 7.83
      schu += (7.83 - schu) * 0.05;
      if (schu < 7.6) schu = 7.6;
      if (schu > 8.1) schu = 8.1;
      return schu;
    },
  });
  sysmonRegisterMetric({
    id: 'protocol7', group: 'wired', label: 'Protocol 7 Flux', unit: '',
    color: '#80e0ff',
    format: v => v.toFixed(1),
    sample: () => {
      p7phase += 0.02;
      let v = Math.sin(p7phase / 6) * 40 + (Math.random() - 0.5) * 10;
      const now = performance.now();
      if (now > p7nextSpike) {
        v += 30;
        p7nextSpike = now + 20000 + Math.random() * 20000;
      }
      return v;
    },
  });
  sysmonRegisterMetric({
    id: 'bandwidth', group: 'wired', label: 'Wired Bandwidth', unit: 'kb/s',
    color: '#60c0ff',
    format: v => v.toFixed(0),
    sample: () => {
      const c = navigator.connection;
      const base = c && typeof c.downlink === 'number' ? c.downlink * 120 : 400;
      return base + (Math.random() - 0.5) * base * 0.3;
    },
  });
  sysmonRegisterMetric({
    id: 'anchor', group: 'wired', label: 'Reality Anchor', unit: '%',
    color: '#ff80ff',
    format: v => v.toFixed(2),
    sample: () => {
      anchor += (Math.random() - 0.5) * 0.1;
      // occasional dip
      if (Math.random() < 0.001) anchor -= 6;
      anchor += (99 - anchor) * 0.05;
      if (anchor < 85) anchor = 85;
      if (anchor > 100) anchor = 100;
      return anchor;
    },
  });
  sysmonRegisterMetric({
    id: 'coherence', group: 'wired', label: 'Layer Coherence', unit: '',
    color: '#a0a0ff',
    format: v => v.toFixed(3),
    sample: () => {
      const t = (performance.now() - t0) / 1000;
      return 0.7 + 0.3 * Math.sin((2 * Math.PI * t) / 180);
    },
  });
}
```

- [ ] **Step 5: Build the order list**

Append:

```js
function sysmonBuildOrder() {
  sysmonState.order = [
    { group: 'real', title: '// REAL', ids: [
      'fps','heapUsed','storageUsed','downlink',
      'cores','dpr','viewport','netType','uptime','storageQuota',
    ]},
    { group: 'psyche', title: '// PSYCHE', ids: ['psycheStatus','psycheTemp','psycheLoad'] },
    { group: 'wired', title: '// WIRED', ids: ['schumann','protocol7','bandwidth','anchor','coherence'] },
  ];
}
```

- [ ] **Step 6: Manual verify**

Reload. In console: run `sysmonRegisterReal(); sysmonRegisterPsyche(); sysmonRegisterWired(); sysmonBuildOrder();` then `Object.keys(sysmonState.metrics)` — must list 18 ids. Run `sysmonState.metrics.schumann.sample()` five times — values near 7.83. Run `sysmonState.order.length` — expect 3.

- [ ] **Step 7: Commit**

```bash
git add script.js
git commit -m "feat(sysmon): register real, psyche, and wired metrics"
```

---

## Task 5: Sampling loops (rAF for FPS, interval for everything else)

**Files:**
- Modify: `script.js` (continue appending in the Sys-monitor section)

- [ ] **Step 1: rAF FPS loop**

Append:

```js
function sysmonFrameTick(t) {
  if (!sysmonState.isOpen) { sysmonState.rafId = null; return; }
  if (sysmonState.lastFrameT) {
    const dt = t - sysmonState.lastFrameT;
    if (dt > 0) {
      const inst = 1000 / dt;
      // EMA with α = 0.1
      sysmonState.fpsEMA = sysmonState.fpsEMA * 0.9 + inst * 0.1;
    }
  }
  sysmonState.lastFrameT = t;
  sysmonState.rafId = requestAnimationFrame(sysmonFrameTick);
}
```

- [ ] **Step 2: Sample-all + render-all loop**

Append:

```js
let sysmonStorageTickCounter = 0;

function sysmonTick() {
  if (!sysmonState.isOpen) return;
  // Refresh async storage estimate every ~5s (50 ticks at 10 Hz)
  if ((sysmonStorageTickCounter++ % 50) === 0) sysmonRefreshStorage();

  for (const id in sysmonState.metrics) {
    const m = sysmonState.metrics[id];
    const v = m.sample();
    if (m.ring) sysmonPush(m.ring, v);
  }
  sysmonRenderAll();
}
```

- [ ] **Step 3: Start / stop helpers**

Append:

```js
function sysmonStart() {
  if (sysmonState.intervalId) return;
  sysmonState.lastFrameT = 0;
  sysmonState.rafId = requestAnimationFrame(sysmonFrameTick);
  const period = matchMedia('(prefers-reduced-motion: reduce)').matches ? 500 : (1000 / SYSMON_HZ);
  sysmonState.intervalId = setInterval(sysmonTick, period);
  sysmonRefreshStorage();
}

function sysmonStop() {
  if (sysmonState.rafId) cancelAnimationFrame(sysmonState.rafId);
  sysmonState.rafId = null;
  if (sysmonState.intervalId) clearInterval(sysmonState.intervalId);
  sysmonState.intervalId = null;
}
```

- [ ] **Step 4: Stub renderer (fills in next task)**

Append:

```js
function sysmonRenderAll() {
  // filled in by Tasks 6, 7, 8
}
```

- [ ] **Step 5: Manual verify**

Reload. In console: `sysmonRegisterReal(); sysmonRegisterPsyche(); sysmonRegisterWired(); sysmonBuildOrder(); sysmonState.isOpen = true; sysmonStart();` — then after a few seconds run `sysmonLast(sysmonState.metrics.fps.ring)` — expect a value near 60. Run `sysmonLast(sysmonState.metrics.schumann.ring)` — near 7.83. Run `sysmonStop(); sysmonState.isOpen = false;`.

- [ ] **Step 6: Commit**

```bash
git add script.js
git commit -m "feat(sysmon): add rAF + interval sampling loops"
```

---

## Task 6: Sidebar renderer

**Files:**
- Modify: `script.js` (continue appending)

- [ ] **Step 1: Build the static sidebar DOM once**

Append:

```js
function sysmonBuildSidebar() {
  const sidebar = document.getElementById('sysmon-sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = '';
  for (const section of sysmonState.order) {
    const h = document.createElement('div');
    h.className = 'sysmon-section-header';
    h.textContent = section.title;
    sidebar.appendChild(h);

    for (const id of section.ids) {
      const m = sysmonState.metrics[id];
      if (!m) continue;
      const row = document.createElement('div');
      row.className = 'sysmon-row' + (m.selectable ? '' : ' static');
      row.dataset.metricId = id;
      if (m.selectable) row.addEventListener('click', () => sysmonSelect(id));

      const label = document.createElement('div');
      label.className = 'sysmon-row-label';
      label.textContent = m.label;

      const val = document.createElement('div');
      val.className = 'sysmon-row-value';
      val.textContent = '—';

      row.appendChild(label);
      row.appendChild(val);

      if (m.selectable) {
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('class', 'sysmon-row-spark');
        svg.setAttribute('viewBox', '0 0 100 20');
        svg.setAttribute('preserveAspectRatio', 'none');
        const poly = document.createElementNS(svgNS, 'polyline');
        poly.setAttribute('stroke', m.color || '#0f0');
        svg.appendChild(poly);
        row.appendChild(svg);
      }
      sidebar.appendChild(row);
    }
  }
  sysmonMarkSelected();
}

function sysmonMarkSelected() {
  const rows = document.querySelectorAll('#sysmon-sidebar .sysmon-row');
  rows.forEach(r => r.classList.toggle('selected', r.dataset.metricId === sysmonState.selectedId));
}
```

- [ ] **Step 2: Per-tick sidebar update**

Append:

```js
function sysmonUpdateSidebar() {
  const rows = document.querySelectorAll('#sysmon-sidebar .sysmon-row');
  rows.forEach(row => {
    const id = row.dataset.metricId;
    const m = sysmonState.metrics[id];
    if (!m) return;
    const valEl = row.querySelector('.sysmon-row-value');

    if (m.ring) {
      const v = sysmonLast(m.ring);
      valEl.textContent = m.format(v) + (m.unit ? ' ' + m.unit : '');
      const poly = row.querySelector('polyline');
      if (poly) poly.setAttribute('points', sysmonSparkPoints(m.ring));
    } else {
      valEl.textContent = m.format(0) + (m.unit ? ' ' + m.unit : '');
    }
  });
}

function sysmonSparkPoints(ring) {
  const n = ring.filled;
  if (n < 2) return '';
  const [lo, hi] = sysmonMinMax(ring);
  const range = (hi - lo) || 1;
  const start = (ring.head - n + SYSMON_MAX_SAMPLES) % SYSMON_MAX_SAMPLES;
  let out = '';
  for (let i = 0; i < n; i++) {
    const v = ring.buf[(start + i) % SYSMON_MAX_SAMPLES];
    if (!Number.isFinite(v)) continue;
    const x = (i / (SYSMON_MAX_SAMPLES - 1)) * 100;
    const y = 20 - ((v - lo) / range) * 20;
    out += (out ? ' ' : '') + x.toFixed(1) + ',' + y.toFixed(1);
  }
  return out;
}

function sysmonSelect(id) {
  const m = sysmonState.metrics[id];
  if (!m || !m.selectable) return;
  sysmonState.selectedId = id;
  sysmonMarkSelected();
}
```

- [ ] **Step 3: Wire sidebar update into the render pass**

Replace the `sysmonRenderAll` stub with:

```js
function sysmonRenderAll() {
  sysmonUpdateSidebar();
  sysmonRenderBigChart();   // defined in Task 7
  sysmonRenderProcTable();  // defined in Task 8
}
```

Also add stubs so this doesn't throw:

```js
function sysmonRenderBigChart() {}
function sysmonRenderProcTable() {}
```

- [ ] **Step 4: Manual verify**

Reload. In console: run the init + start sequence from Task 5 Step 5, then `sysmonBuildSidebar();`. Temporarily add `class="visible"` to `#sysmon-panel` (via `document.getElementById('sysmon-panel').classList.add('visible')`). Sidebar must show `// REAL` / `// PSYCHE` / `// WIRED` headers with live values and tiny sparklines updating ~10 Hz. Click a selectable row → it highlights. Static rows (cores, viewport, etc.) have no spark and don't highlight on click. Remove the class and stop: `sysmonStop(); document.getElementById('sysmon-panel').classList.remove('visible');`.

- [ ] **Step 5: Commit**

```bash
git add script.js
git commit -m "feat(sysmon): render sidebar rows with live sparklines"
```

---

## Task 7: Big chart canvas renderer

**Files:**
- Modify: `script.js` (replace the `sysmonRenderBigChart` stub from Task 6)

- [ ] **Step 1: DPR-aware canvas sizing**

Append (near other helpers):

```js
function sysmonResizeCanvas() {
  const c = document.getElementById('sysmon-canvas');
  if (!c) return;
  const rect = c.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  c.width = Math.max(1, Math.floor(rect.width * dpr));
  c.height = Math.max(1, Math.floor(rect.height * dpr));
}
```

- [ ] **Step 2: Replace the stub with the real renderer**

Replace `function sysmonRenderBigChart() {}` with:

```js
function sysmonRenderBigChart() {
  const c = document.getElementById('sysmon-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  ctx.clearRect(0, 0, W, H);

  const m = sysmonState.metrics[sysmonState.selectedId];
  if (!m || !m.ring) return;

  // Header label
  const labelEl = document.getElementById('sysmon-chart-label');
  if (labelEl) labelEl.textContent = m.label + (m.unit ? ' / ' + m.unit : '');

  const [lo, hi] = sysmonMinMax(m.ring);
  const cur = sysmonLast(m.ring);
  document.getElementById('sysmon-cur').textContent = Number.isFinite(cur) ? m.format(cur) : '—';
  document.getElementById('sysmon-min').textContent = Number.isFinite(lo)  ? m.format(lo)  : '—';
  document.getElementById('sysmon-max').textContent = Number.isFinite(hi)  ? m.format(hi)  : '—';

  if (m.ring.filled < 2 || !Number.isFinite(lo)) return;
  const range = (hi - lo) || 1;

  // Vertical gridlines: one every 10s (= 100 samples)
  ctx.strokeStyle = 'rgba(0, 255, 100, 0.12)';
  ctx.lineWidth = 1;
  for (let s = 0; s <= SYSMON_WINDOW_S; s += 10) {
    const x = Math.floor((s / SYSMON_WINDOW_S) * W) + 0.5;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  // Horizontal gridlines at min / mid / max
  for (const frac of [0, 0.5, 1]) {
    const y = Math.floor(frac * H) + 0.5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Polyline
  ctx.strokeStyle = m.color || '#0f0';
  ctx.lineWidth = Math.max(1, (window.devicePixelRatio || 1));
  ctx.beginPath();
  const n = m.ring.filled;
  const start = (m.ring.head - n + SYSMON_MAX_SAMPLES) % SYSMON_MAX_SAMPLES;
  let penDown = false;
  for (let i = 0; i < n; i++) {
    const v = m.ring.buf[(start + i) % SYSMON_MAX_SAMPLES];
    if (!Number.isFinite(v)) { penDown = false; continue; }
    const x = (i / (SYSMON_MAX_SAMPLES - 1)) * W;
    const y = H - ((v - lo) / range) * H;
    if (!penDown) { ctx.moveTo(x, y); penDown = true; }
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
```

- [ ] **Step 3: Resize observer**

Append:

```js
let sysmonResizeObs = null;
function sysmonAttachResize() {
  const c = document.getElementById('sysmon-canvas');
  if (!c || sysmonResizeObs) return;
  sysmonResizeObs = new ResizeObserver(() => {
    sysmonResizeCanvas();
    sysmonRenderBigChart();
  });
  sysmonResizeObs.observe(c);
}
```

- [ ] **Step 4: Manual verify**

Reload. In console: init + start sequence + `sysmonBuildSidebar(); sysmonResizeCanvas(); sysmonAttachResize();` then `document.getElementById('sysmon-panel').classList.add('visible')`. The canvas must draw a live rolling polyline of `fps`, header reads "Frame Rate / fps", cur/min/max update. Click `Schumann Resonance` in the sidebar — the big chart must switch to schumann with a corresponding Y range. Resize the browser window — the canvas re-renders crisply without squishing.

- [ ] **Step 5: Commit**

```bash
git add script.js
git commit -m "feat(sysmon): render big canvas chart of selected metric"
```

---

## Task 8: Process table

**Files:**
- Modify: `script.js` (replace the `sysmonRenderProcTable` stub)

- [ ] **Step 1: Define fictional daemons and the render helper**

Replace `function sysmonRenderProcTable() {}` with:

```js
const SYSMON_DAEMONS = [
  { pid: '0001', name: 'copland.os',   thr: 4, load: () => 1 + Math.random() * 3 },
  { pid: '0042', name: 'navi.sys',     thr: 2, load: () => 8 + Math.sin(performance.now() / 4000) * 4 + Math.random() * 2 },
  { pid: '0073', name: 'psyche.drv',   thr: 1, load: () => (sysmonState.metrics.psycheLoad ? sysmonLast(sysmonState.metrics.psycheLoad.ring) / 10 : 2) },
  { pid: '0128', name: 'protocol7.d',  thr: 1, load: () => {
      const r = sysmonState.metrics.protocol7 && sysmonState.metrics.protocol7.ring;
      const v = r ? sysmonLast(r) : 0;
      return Math.min(15, Math.abs(v) / 6);
    }},
  { pid: '0256', name: 'schumann.mon', thr: 1, load: () => {
      const r = sysmonState.metrics.schumann && sysmonState.metrics.schumann.ring;
      const v = r ? sysmonLast(r) : 7.83;
      return Math.abs(v - 7.83) * 100;
    }},
  { pid: '0333', name: 'wired.link',   thr: 1, load: () => {
      const r = sysmonState.metrics.bandwidth && sysmonState.metrics.bandwidth.ring;
      const v = r ? sysmonLast(r) : 400;
      return Math.min(20, v / 40);
    }},
];

const SYSMON_REAL_PROCS = [
  { slot: 1, name: 'terminal',    thr: 1, check: () => document.querySelector('.terminal-window')?.classList.contains('visible') },
  { slot: 2, name: 'connections', thr: 1, check: () => document.getElementById('connections-sidebar')?.classList.contains('visible') },
  { slot: 3, name: 'music',       thr: 2, check: () => document.getElementById('music-panel')?.classList.contains('visible') },
  { slot: 4, name: 'tv',          thr: 1, check: () => document.getElementById('tv-panel')?.classList.contains('visible') },
  { slot: 5, name: 'bg.conf',     thr: 1, check: () => document.getElementById('bg-picker')?.classList.contains('visible') },
  { slot: 6, name: 'about_me',    thr: 1, check: () => document.getElementById('about-panel')?.classList.contains('visible') },
  { slot: 7, name: 'sysmon',      thr: 2, check: () => sysmonState.isOpen },
];

let sysmonProcTickCounter = 0;

function sysmonRenderProcTable() {
  // Throttle to once per second (10 ticks).
  if ((sysmonProcTickCounter++ % SYSMON_HZ) !== 0) return;

  const table = document.getElementById('sysmon-proc-table');
  if (!table) return;
  const rows = [];
  rows.push(pad('PID', 6) + pad('NAME', 16) + pad('THR', 6) + 'LOAD');
  for (const d of SYSMON_DAEMONS) {
    rows.push(pad(d.pid, 6) + pad(d.name, 16) + pad(String(d.thr), 6) + d.load().toFixed(0) + '%');
  }
  for (const p of SYSMON_REAL_PROCS) {
    if (!p.check()) continue;
    const pid = '02' + String(p.slot).padStart(2, '0');
    const load = (Math.random() * 5).toFixed(0) + '%';
    rows.push(pad(pid, 6) + pad(p.name, 16) + pad(String(p.thr), 6) + load);
  }
  table.textContent = rows.join('\n');
}

function pad(s, n) { return (s + ' '.repeat(n)).slice(0, n); }
```

- [ ] **Step 2: Style it as a pre-like block**

Append to `style.css`:

```css
.sysmon-proc-table { white-space: pre; }
```

- [ ] **Step 3: Manual verify**

Reload. Run the full init + start + visible sequence. The process table must show a header row, six fictional daemons with changing LOAD each second, and one `sysmon` row (because it's open). Open the terminal with the existing taskbar button — a `terminal` row appears. Close it — the row disappears. The header row stays put.

- [ ] **Step 4: Commit**

```bash
git add script.js style.css
git commit -m "feat(sysmon): add process table with fictional daemons and real panels"
```

---

## Task 9: Open / close / minimize / restore / drag + taskbar wiring + boot init

**Files:**
- Modify: `script.js` (continue appending)

- [ ] **Step 1: Panel lifecycle helpers**

Append:

```js
function sysmonOpen() {
  const panel = document.getElementById('sysmon-panel');
  if (!panel) return;
  panel.classList.add('visible');
  bringToFront(panel);
  sysmonState.isOpen = true;
  sysmonResizeCanvas();
  sysmonStart();
  updateTaskbar();
}

function sysmonClose() {
  const panel = document.getElementById('sysmon-panel');
  if (!panel) return;
  panel.classList.remove('visible');
  sysmonState.isOpen = false;
  sysmonStop();
  updateTaskbar();
}

// Aliases used by inline onclick handlers
function closeSysmon()    { sysmonClose(); }
function minimizeSysmon() { sysmonClose(); }   // same behavior as other panels
function restoreSysmon()  { sysmonOpen(); }

function taskbarToggleSysmon() {
  if (sysmonState.isOpen) sysmonClose(); else sysmonOpen();
}
```

- [ ] **Step 2: Drag handling (mirrors the pattern at script.js:389-421)**

Append:

```js
function sysmonInitDrag() {
  const panel = document.getElementById('sysmon-panel');
  const title = panel && panel.querySelector('.sysmon-titlebar');
  if (!panel || !title) return;
  panel.addEventListener('mousedown', () => bringToFront(panel));
  let dragging = false, ox = 0, oy = 0;
  title.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('dot')) return;
    dragging = true;
    const rect = panel.getBoundingClientRect();
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    panel.style.transform = 'none';
    panel.style.left = rect.left + 'px';
    panel.style.top  = rect.top + 'px';
    panel.classList.add('dragging');
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    panel.style.left = (e.clientX - ox) + 'px';
    panel.style.top  = (e.clientY - oy) + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    panel.classList.remove('dragging');
  });
}
```

- [ ] **Step 3: Extend `updateTaskbar` so the sysmon button lights up**

Modify the existing `updateTaskbar` function (around script.js:47). Change the `states` object to include sysmon:

```js
function updateTaskbar() {
  const states = {
    'tb-terminal':    document.querySelector('.terminal-window').classList.contains('visible'),
    'tb-connections': document.getElementById('connections-sidebar').classList.contains('visible'),
    'tb-music':       document.getElementById('music-panel').classList.contains('visible'),
    'tb-tv':          document.getElementById('tv-panel').classList.contains('visible'),
    'tb-background':  document.getElementById('bg-picker').classList.contains('visible'),
    'tb-about':       document.getElementById('about-panel').classList.contains('visible'),
    'tb-sysmon':      document.getElementById('sysmon-panel').classList.contains('visible'),
  };
  Object.entries(states).forEach(([id, active]) => {
    document.getElementById(id).classList.toggle('active', active);
  });
}
```

- [ ] **Step 4: Boot-time init hook**

Append at the bottom of `script.js`:

```js
function sysmonInit() {
  sysmonRegisterReal();
  sysmonRegisterPsyche();
  sysmonRegisterWired();
  sysmonBuildOrder();
  sysmonBuildSidebar();
  sysmonAttachResize();
  sysmonInitDrag();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', sysmonInit);
} else {
  sysmonInit();
}
```

- [ ] **Step 5: Visibility-change throttle**

Append:

```js
document.addEventListener('visibilitychange', () => {
  if (!sysmonState.isOpen) return;
  if (document.hidden) {
    // Slow to 2 Hz when tab hidden but panel open
    if (sysmonState.intervalId) {
      clearInterval(sysmonState.intervalId);
      sysmonState.intervalId = setInterval(sysmonTick, 500);
    }
  } else {
    if (sysmonState.intervalId) {
      clearInterval(sysmonState.intervalId);
      const period = matchMedia('(prefers-reduced-motion: reduce)').matches ? 500 : (1000 / SYSMON_HZ);
      sysmonState.intervalId = setInterval(sysmonTick, period);
    }
  }
});
```

- [ ] **Step 6: Manual verify — happy path**

Reload `index.html`. Click `◉ sysmon` in the taskbar → panel appears centered, sidebar populated, big chart shows Frame Rate, process table lists daemons + `sysmon`. Taskbar button is highlighted. Drag the panel by its titlebar — moves. Click the red dot — closes; the button un-highlights. Click it again from the taskbar — reopens. Click the yellow dot — closes (minimize = close for this project's convention). Click the green dot via the taskbar workflow → reopens. Click other metrics in the sidebar — big chart swaps. Open other panels (terminal, music) — their rows appear in the process table. Switch tabs away for ~10 s, come back — chart resumes smoothly without a huge gap.

- [ ] **Step 7: Commit**

```bash
git add script.js
git commit -m "feat(sysmon): wire open/close/drag/taskbar and boot init"
```

---

## Task 10: Cross-browser + reduced-motion check

**Files:**
- None (verification only)

- [ ] **Step 1: Chromium verify**

Reload in Chrome/Edge. Confirm:
- `JS Heap Used` shows a real number, not `—`.
- `Storage Used` / `Storage Quota` show real numbers after ~1 s.
- `Downlink` / `Network Type` show values.
- FPS hovers at 60 (or the display refresh rate) under no load.

- [ ] **Step 2: Firefox / Safari verify**

Reload in Firefox (and Safari if available). Confirm:
- `JS Heap Used` shows `—` (not an error).
- `Downlink` / `Network Type` may show `—` — acceptable.
- Schumann / psyche / wired metrics still animate.
- No console errors.

- [ ] **Step 3: Reduced-motion verify**

Enable OS-level "Reduce motion" (Windows: Settings → Accessibility → Visual effects → Animation effects off; or Chrome devtools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`). Reopen the panel. Confirm sampling continues at 2 Hz (values still change, just less often). No infinite glow animations.

- [ ] **Step 4: Resize verify**

Drag-resize the browser window. The canvas must re-render sharply without stretching (ResizeObserver path). Open devtools, toggle DPR to 2x — chart still sharp.

- [ ] **Step 5: Commit a closing note (optional)**

If any tweaks were needed during this pass, commit them. Otherwise skip the commit.

---

## Self-Review Notes

**Spec coverage:** All spec sections map to tasks — window chrome (T1, T2, T9), layout diagram (T2), real metrics table (T4), psyche section (T4), wired metrics (T4), runtime loops (T5), sidebar render (T6), big chart (T7), process table (T8), taskbar + lifecycle (T9), reduced-motion + edge cases (T5, T9, T10), file-change list (T1, T2, T3–T9).

**Placeholder scan:** All code steps contain complete runnable code. Renderer stubs in T5/T6 are explicitly replaced in later tasks and flagged at their introduction. No `TODO` / `TBD` / "add validation".

**Type consistency:** Field names used consistently — `ring.buf / head / filled`, `m.sample() / m.format() / m.ring / m.color / m.selectable`, `sysmonState.isOpen / selectedId / metrics / order`. Render pipeline `sysmonRenderAll → sysmonUpdateSidebar / sysmonRenderBigChart / sysmonRenderProcTable`. Lifecycle `sysmonOpen / sysmonClose / sysmonStart / sysmonStop`. DOM ids match between HTML (T1) and JS lookups (T6/T7/T8).
