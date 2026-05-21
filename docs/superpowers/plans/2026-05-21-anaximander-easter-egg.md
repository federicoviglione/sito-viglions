# Anaximander Easter-Egg Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementare un mini-Asteroids opt-in dentro la pagina `/404` del sito di Federico Viglione, giocabile da tastiera (desktop) e da virtual buttons multi-touch (mobile), in stile editoriale coerente col resto del sito.

**Architecture:** Singolo componente Astro `Anaximander.astro` (markup + CSS scoped + `<script>` vanilla JS) montato dentro `404.astro`. Comunicazione via custom event `anaximander:start` dispatchato sul `document`. Nessuna dipendenza aggiunta. Tutto static, niente backend.

**Tech Stack:** Astro 5 (static), vanilla JS, HTML5 Canvas 2D, Pointer Events API, `localStorage` per high score, CSS variables del design system esistente.

**Testing strategy:** lo spec dichiara "no test automatici per MVP". Per la logica pura facilmente isolabile (wrap, collision, scoring) usiamo micro-asserzioni inline tramite `console.assert` dentro un blocco `if (import.meta.env.DEV)` che gira solo in dev. Per il resto: smoke verification visiva descritta in ogni task. Ogni task chiude con un commit.

**Reference spec:** `docs/superpowers/specs/2026-05-21-asteroids-easter-egg-design.md` (committed). Leggere prima di iniziare.

---

## File Structure

- **Create** `src/components/Anaximander.astro` — game completo (markup + CSS scoped + `<script>`). Single file, ~350 righe finali.
- **Modify** `src/pages/404.astro` — import del componente, button "or wander the cosmos →", dispatch del custom event.

Niente nuovi file in `public/`, niente dipendenze in `package.json`, niente cambi a `astro.config.mjs`.

---

## Task 1: Scaffold del componente + entry point in 404

**Goal del task:** dopo questo task, navigando a `/404` si vede il link "or wander the cosmos →" sotto "Back to home". Cliccarlo non fa nulla di visibile ancora ma dispatcha l'evento (verificabile in console).

**Files:**
- Create: `src/components/Anaximander.astro`
- Modify: `src/pages/404.astro`

### - [ ] Step 1.1: Crea il componente vuoto

Crea `src/components/Anaximander.astro` con questo contenuto esatto:

```astro
---
// Anaximander — mini Asteroids easter-egg, vector-clean editorial style.
// Activated by dispatching a 'anaximander:start' CustomEvent on `document`.
---

<div class="anaximander" data-state="idle" aria-hidden="true">
  <canvas class="anaximander-canvas"></canvas>
</div>

<style>
  .anaximander {
    display: none;
    position: relative;
    margin-block: var(--space-5);
  }
  .anaximander[data-state="active"] {
    display: block;
  }
  .anaximander-canvas {
    display: block;
    width: min(100%, 720px);
    aspect-ratio: 16 / 10;
    background: var(--ink);
    border: 1px solid var(--rule);
  }
</style>

<script>
  const root = document.querySelector<HTMLDivElement>('.anaximander');
  if (root) {
    document.addEventListener('anaximander:start', () => {
      root.setAttribute('data-state', 'active');
      root.setAttribute('aria-hidden', 'false');
      console.log('[anaximander] start');
    });
  }
</script>
```

### - [ ] Step 1.2: Modifica 404.astro per importare e renderizzare Anaximander

In `src/pages/404.astro`, aggiungi l'import nel frontmatter e il componente + button nel template.

Modifica il frontmatter da:
```astro
---
import Layout from '../layouts/Layout.astro';
import { getEntry } from 'astro:content';

const site = await getEntry('site', 'info');
const siteName = site?.data.name ?? 'Federico Viglione';
---
```
a:
```astro
---
import Layout from '../layouts/Layout.astro';
import Anaximander from '../components/Anaximander.astro';
import { getEntry } from 'astro:content';

const site = await getEntry('site', 'info');
const siteName = site?.data.name ?? 'Federico Viglione';
---
```

Modifica il blocco `<main>` da:
```astro
  <main class="not-found container">
    <p class="label">Error</p>
    <h1 class="code">404</h1>
    <p class="message">The page you were looking for does not exist.</p>
    <p class="back"><a href="/">Back to home</a></p>
  </main>
```
a:
```astro
  <main class="not-found container">
    <p class="label">Error</p>
    <h1 class="code">404</h1>
    <p class="message">The page you were looking for does not exist.</p>
    <p class="back"><a href="/">Back to home</a></p>
    <p class="wander">
      <button type="button" class="wander-btn" id="wander-btn">or wander the cosmos →</button>
    </p>
    <Anaximander />
  </main>
```

Aggiungi al blocco `<style>` di 404.astro (in fondo, prima della chiusura `</style>`):
```css
  .wander {
    margin-top: var(--space-3);
  }
  .wander-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
    font-size: var(--fs-sm);
    color: var(--ink);
    border-bottom: 1px dotted var(--rule);
    transition: color 150ms ease, border-color 150ms ease;
  }
  .wander-btn:hover {
    color: var(--accent);
    border-color: var(--accent);
  }
  .wander-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
  }
```

E in fondo al file (dopo `</style>`), aggiungi:
```astro
<script>
  const btn = document.getElementById('wander-btn');
  btn?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('anaximander:start'));
  });
</script>
```

### - [ ] Step 1.3: Verify (smoke)

Run: `npm run dev`
Vai a `http://localhost:4321/404` (Astro dev serve serve la 404 a quell'URL).

Verifica:
- Vedi "or wander the cosmos →" sotto "Back to home", con dotted underline
- Hover cambia colore in blu (`--accent`)
- Apri DevTools console, clicca il button
- Vedi nella console: `[anaximander] start`
- Vedi sotto al button un rettangolo scuro con bordo (canvas placeholder)

Se qualcosa non funziona: typo nel custom event name, missing import, CSS variable non risolta — controlla il messaggio di errore Astro.

### - [ ] Step 1.4: Commit

```bash
git add src/components/Anaximander.astro src/pages/404.astro
git commit -m "$(cat <<'EOF'
feat(404): scaffold Anaximander component + wander entry point

Empty canvas component that activates on a custom event.
Adds a discreet 'or wander the cosmos →' button below the
'Back to home' link in /404. No game logic yet.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Canvas setup + ship statica + game loop

**Goal del task:** dopo questo task, cliccando il button vedi una nave (triangolo) disegnata al centro del canvas. Niente movimento ancora. Il loop di rendering gira.

**Files:**
- Modify: `src/components/Anaximander.astro`

### - [ ] Step 2.1: Sostituisci lo `<script>` di Anaximander.astro

Apri `src/components/Anaximander.astro` e sostituisci tutto il blocco `<script>...</script>` con:

```astro
<script>
  const root = document.querySelector<HTMLDivElement>('.anaximander');
  const canvas = document.querySelector<HTMLCanvasElement>('.anaximander-canvas');
  if (!root || !canvas) {
    // No-op: canvas non disponibile o componente non montato.
  } else {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('[anaximander] canvas 2d context not available');
    } else {
      // -------- Game state --------
      type Ship = { x: number; y: number; vx: number; vy: number; angle: number };
      let ship: Ship = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2 };
      let running = false;
      let lastT = 0;
      let rafId = 0;

      // -------- Canvas sizing --------
      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Center ship if not started
        if (!running) {
          ship.x = w / 2;
          ship.y = h / 2;
        }
      }

      // -------- Drawing --------
      function drawShip(s: Ship) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.strokeStyle = '#f6f6f4'; // --paper
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-8, 7);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-8, -7);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      function clear() {
        const rect = canvas.getBoundingClientRect();
        ctx.fillStyle = '#15171a'; // --ink
        ctx.fillRect(0, 0, rect.width, rect.height);
      }

      // -------- Loop --------
      function frame(t: number) {
        if (!running) return;
        const dt = Math.min((t - lastT) / 1000, 0.05);
        lastT = t;
        clear();
        drawShip(ship);
        rafId = requestAnimationFrame(frame);
      }

      function start() {
        if (running) return;
        running = true;
        resize();
        lastT = performance.now();
        rafId = requestAnimationFrame(frame);
      }

      function stop() {
        running = false;
        cancelAnimationFrame(rafId);
      }

      // -------- Events --------
      document.addEventListener('anaximander:start', () => {
        root.setAttribute('data-state', 'active');
        root.setAttribute('aria-hidden', 'false');
        start();
      });

      window.addEventListener('resize', () => {
        if (running) resize();
      });
    }
  }
</script>
```

### - [ ] Step 2.2: Verify (smoke)

Run: `npm run dev` (se non già attivo)
Vai a `/404`, clicca "or wander the cosmos →".

Verifica:
- Il canvas si riempie di colore ink scuro
- Al centro vedi un piccolo triangolo color paper rivolto verso l'alto (è la nave)
- Apri Performance / DevTools "Frames": il browser sta ridisegnando a ~60fps
- Resize della finestra → il canvas si ridimensiona, la nave torna al centro (perché non è ancora in movimento)

Se la nave non appare: verifica che `ctx.setTransform` non sia chiamato dopo il `drawShip` (deve essere in `resize`), e che `clear()` sia chiamato prima di `drawShip`.

### - [ ] Step 2.3: Commit

```bash
git add src/components/Anaximander.astro
git commit -m "$(cat <<'EOF'
feat(anaximander): canvas setup, static ship rendering, rAF loop

DPR-aware canvas sizing, ship drawn as a vector triangle, rAF loop
running while game is active. No input yet.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Input tastiera + fisica della nave (rotate, thrust, wraparound)

**Goal del task:** la nave ruota con `←/→`, accelera con `↑` (drag leggero quando rilasci), wrappa ai bordi.

**Files:**
- Modify: `src/components/Anaximander.astro`

### - [ ] Step 3.1: Aggiungi utility `wrap` con micro-test

Nel `<script>`, subito dopo la definizione di `type Ship`, aggiungi:

```typescript
      // -------- Utilities --------
      function wrap(v: number, max: number): number {
        if (v < 0) return v + max;
        if (v >= max) return v - max;
        return v;
      }

      // Dev-only micro-asserts (run once at module load in dev mode).
      if (import.meta.env.DEV) {
        console.assert(wrap(5, 10) === 5, 'wrap inside');
        console.assert(wrap(-1, 10) === 9, 'wrap negative');
        console.assert(wrap(11, 10) === 1, 'wrap over');
      }
```

### - [ ] Step 3.2: Aggiungi keyboard state e input handlers

Subito dopo la dichiarazione di `let ship: Ship = ...`, aggiungi:

```typescript
      const keys = new Set<string>();

      function onKeyDown(e: KeyboardEvent) {
        if (!running) return;
        const k = e.key;
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(k)) {
          e.preventDefault();
        }
        keys.add(k);
      }
      function onKeyUp(e: KeyboardEvent) {
        keys.delete(e.key);
      }
```

Poi, nel blocco eventi in fondo (dove c'è già `document.addEventListener('anaximander:start', ...)` e `window.addEventListener('resize', ...)`), aggiungi:

```typescript
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
```

### - [ ] Step 3.3: Aggiorna la nave nel loop

Sostituisci la funzione `frame` con:

```typescript
      const ROT_SPEED = 3.5;     // rad/sec
      const THRUST = 200;        // px/sec^2
      const DRAG = 0.995;        // per frame at 60fps approx
      const MAX_SPEED = 350;     // px/sec

      function update(dt: number) {
        const rect = canvas.getBoundingClientRect();
        if (keys.has('ArrowLeft')) ship.angle -= ROT_SPEED * dt;
        if (keys.has('ArrowRight')) ship.angle += ROT_SPEED * dt;
        if (keys.has('ArrowUp')) {
          ship.vx += Math.cos(ship.angle) * THRUST * dt;
          ship.vy += Math.sin(ship.angle) * THRUST * dt;
          const sp = Math.hypot(ship.vx, ship.vy);
          if (sp > MAX_SPEED) {
            ship.vx = (ship.vx / sp) * MAX_SPEED;
            ship.vy = (ship.vy / sp) * MAX_SPEED;
          }
        }
        // Drag (frame-rate compensated)
        const dragF = Math.pow(DRAG, dt * 60);
        ship.vx *= dragF;
        ship.vy *= dragF;
        ship.x = wrap(ship.x + ship.vx * dt, rect.width);
        ship.y = wrap(ship.y + ship.vy * dt, rect.height);
      }

      function frame(t: number) {
        if (!running) return;
        const dt = Math.min((t - lastT) / 1000, 0.05);
        lastT = t;
        update(dt);
        clear();
        drawShip(ship);
        rafId = requestAnimationFrame(frame);
      }
```

### - [ ] Step 3.4: Verify (smoke)

Run: `npm run dev`
Vai a `/404`, clicca "or wander the cosmos →", clicca poi sul canvas o sulla finestra per dare focus.

Verifica:
- `←/→` ruotano la nave
- `↑` accelera in direzione del muso
- Rilasciando `↑` la nave decelera dolcemente (non si ferma di colpo, non vola all'infinito)
- La nave wrappa: esce a destra → riappare a sinistra (e analoghi)
- Console: nessun warning di asserts. Le 3 asserts di `wrap` non stampano nulla (significa che sono OK).

### - [ ] Step 3.5: Commit

```bash
git add src/components/Anaximander.astro
git commit -m "$(cat <<'EOF'
feat(anaximander): keyboard input, physics, screen wrap

Ship rotates with arrow keys, accelerates with up, has gentle drag
and a max speed cap. Screen wraparound on all 4 sides.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Bullets + fire con cooldown

**Goal del task:** premendo `space` la nave spara proiettili (puntini) che viaggiano in linea retta, durano ~0.8s, wrappano.

**Files:**
- Modify: `src/components/Anaximander.astro`

### - [ ] Step 4.1: Aggiungi state e logica bullets

Nel `<script>`, dopo `let ship: Ship = ...`, aggiungi:

```typescript
      type Bullet = { x: number; y: number; vx: number; vy: number; life: number };
      const bullets: Bullet[] = [];
      let fireCooldown = 0;
      const BULLET_SPEED = 500; // px/sec
      const BULLET_LIFE = 0.8;  // sec
      const FIRE_COOLDOWN = 0.15; // sec
```

### - [ ] Step 4.2: Estendi `update` per gestire fire e bullets

Sostituisci la funzione `update` con:

```typescript
      function update(dt: number) {
        const rect = canvas.getBoundingClientRect();
        if (keys.has('ArrowLeft')) ship.angle -= ROT_SPEED * dt;
        if (keys.has('ArrowRight')) ship.angle += ROT_SPEED * dt;
        if (keys.has('ArrowUp')) {
          ship.vx += Math.cos(ship.angle) * THRUST * dt;
          ship.vy += Math.sin(ship.angle) * THRUST * dt;
          const sp = Math.hypot(ship.vx, ship.vy);
          if (sp > MAX_SPEED) {
            ship.vx = (ship.vx / sp) * MAX_SPEED;
            ship.vy = (ship.vy / sp) * MAX_SPEED;
          }
        }
        const dragF = Math.pow(DRAG, dt * 60);
        ship.vx *= dragF;
        ship.vy *= dragF;
        ship.x = wrap(ship.x + ship.vx * dt, rect.width);
        ship.y = wrap(ship.y + ship.vy * dt, rect.height);

        // Fire
        fireCooldown = Math.max(0, fireCooldown - dt);
        if (keys.has(' ') && fireCooldown === 0) {
          bullets.push({
            x: ship.x + Math.cos(ship.angle) * 12,
            y: ship.y + Math.sin(ship.angle) * 12,
            vx: Math.cos(ship.angle) * BULLET_SPEED + ship.vx,
            vy: Math.sin(ship.angle) * BULLET_SPEED + ship.vy,
            life: BULLET_LIFE,
          });
          fireCooldown = FIRE_COOLDOWN;
        }

        // Bullets update
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          b.life -= dt;
          if (b.life <= 0) {
            bullets.splice(i, 1);
            continue;
          }
          b.x = wrap(b.x + b.vx * dt, rect.width);
          b.y = wrap(b.y + b.vy * dt, rect.height);
        }
      }
```

### - [ ] Step 4.3: Aggiungi `drawBullets`

Dopo la funzione `drawShip`, aggiungi:

```typescript
      function drawBullets() {
        ctx.fillStyle = '#f6f6f4';
        for (const b of bullets) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
```

E modifica `frame` per chiamarla. Sostituisci il blocco rendering nel frame con:

```typescript
      function frame(t: number) {
        if (!running) return;
        const dt = Math.min((t - lastT) / 1000, 0.05);
        lastT = t;
        update(dt);
        clear();
        drawBullets();
        drawShip(ship);
        rafId = requestAnimationFrame(frame);
      }
```

### - [ ] Step 4.4: Verify (smoke)

Verifica:
- Premi `space` → spara un proiettile dal muso
- Tenere premuto `space` → spara a raffica con cadenza ~6-7 colpi/secondo
- Proiettili wrappano ai bordi e svaniscono dopo ~0.8s
- Movendo la nave mentre spari, i proiettili ereditano la velocità della nave (sembrano più veloci se vai avanti)

### - [ ] Step 4.5: Commit

```bash
git add src/components/Anaximander.astro
git commit -m "$(cat <<'EOF'
feat(anaximander): firing with bullets, cooldown, wrap, inherit ship velocity

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Rocks + spawn + wraparound + rendering

**Goal del task:** al game start compaiono 3 asteroidi grandi che derivano sullo schermo. Wrappano. Niente collisioni ancora.

**Files:**
- Modify: `src/components/Anaximander.astro`

### - [ ] Step 5.1: Aggiungi tipo Rock e state

Dopo `const bullets: Bullet[] = [];`, aggiungi:

```typescript
      type RockSize = 'L' | 'M' | 'S';
      type Rock = {
        x: number; y: number;
        vx: number; vy: number;
        angle: number; va: number; // angular vel
        size: RockSize;
        radius: number;
        shape: number[]; // polygon offsets per vertex (relative to radius)
      };
      const rocks: Rock[] = [];
      let wave = 1;

      const ROCK_RADIUS: Record<RockSize, number> = { L: 38, M: 22, S: 12 };
      const ROCK_SPEED: Record<RockSize, number> = { L: 35, M: 55, S: 80 };
```

### - [ ] Step 5.2: Aggiungi funzioni `makeRock`, `spawnWave`

Subito dopo, aggiungi:

```typescript
      function randRange(a: number, b: number) {
        return a + Math.random() * (b - a);
      }

      function makeRockShape(): number[] {
        const verts = 10;
        const out: number[] = [];
        for (let i = 0; i < verts; i++) {
          // Each vertex has a radius scale in [0.78, 1.15]
          out.push(0.78 + Math.random() * 0.37);
        }
        return out;
      }

      function makeRock(x: number, y: number, size: RockSize, speedMul = 1): Rock {
        const dir = Math.random() * Math.PI * 2;
        const sp = ROCK_SPEED[size] * speedMul;
        return {
          x, y,
          vx: Math.cos(dir) * sp,
          vy: Math.sin(dir) * sp,
          angle: Math.random() * Math.PI * 2,
          va: randRange(-1.2, 1.2),
          size,
          radius: ROCK_RADIUS[size],
          shape: makeRockShape(),
        };
      }

      function spawnWave(n: number, speedMul: number) {
        const rect = canvas.getBoundingClientRect();
        rocks.length = 0;
        for (let i = 0; i < n; i++) {
          // Spawn ai bordi per evitare di nascere sopra la ship
          const onTop = Math.random() < 0.5;
          const x = onTop ? Math.random() * rect.width : (Math.random() < 0.5 ? 0 : rect.width);
          const y = onTop ? (Math.random() < 0.5 ? 0 : rect.height) : Math.random() * rect.height;
          rocks.push(makeRock(x, y, 'L', speedMul));
        }
      }
```

### - [ ] Step 5.3: Spawn wave su `start`

Sostituisci la funzione `start` con:

```typescript
      function start() {
        if (running) return;
        running = true;
        resize();
        ship = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2 };
        bullets.length = 0;
        wave = 1;
        spawnWave(3, 1);
        lastT = performance.now();
        rafId = requestAnimationFrame(frame);
      }
```

### - [ ] Step 5.4: Update e draw rocks

Nella funzione `update`, dopo il blocco "Bullets update", aggiungi:

```typescript
        // Rocks update
        for (const r of rocks) {
          r.x = wrap(r.x + r.vx * dt, rect.width);
          r.y = wrap(r.y + r.vy * dt, rect.height);
          r.angle += r.va * dt;
        }
```

Dopo `drawBullets`, aggiungi:

```typescript
      function drawRocks() {
        ctx.strokeStyle = '#f6f6f4';
        ctx.lineWidth = 1.25;
        for (const r of rocks) {
          ctx.save();
          ctx.translate(r.x, r.y);
          ctx.rotate(r.angle);
          ctx.beginPath();
          const verts = r.shape.length;
          for (let i = 0; i < verts; i++) {
            const a = (i / verts) * Math.PI * 2;
            const rad = r.radius * r.shape[i];
            const x = Math.cos(a) * rad;
            const y = Math.sin(a) * rad;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }
      }
```

E modifica `frame` aggiungendo `drawRocks()` dopo `drawBullets()` e prima di `drawShip(ship)`:

```typescript
      function frame(t: number) {
        if (!running) return;
        const dt = Math.min((t - lastT) / 1000, 0.05);
        lastT = t;
        update(dt);
        clear();
        drawBullets();
        drawRocks();
        drawShip(ship);
        rafId = requestAnimationFrame(frame);
      }
```

### - [ ] Step 5.5: Verify (smoke)

Verifica:
- All'avvio del game vedi 3 poligoni irregolari grandi che si muovono lentamente sullo schermo, ognuno ruotando su sé stesso
- Wrappano ai bordi
- Restart (richiudi il game, riavvialo): nuovi 3 asteroidi spawnati in posizioni diverse

### - [ ] Step 5.6: Commit

```bash
git add src/components/Anaximander.astro
git commit -m "$(cat <<'EOF'
feat(anaximander): spawn rocks waves with irregular vector shapes

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Collisioni bullets-rocks + split + collisione ship-rocks

**Goal del task:** un bullet che colpisce un rock lo distrugge; L→2 M, M→2 S, S→via. Una ship che colpisce un rock muore (per ora: ricomincia il game al prossimo tick).

**Files:**
- Modify: `src/components/Anaximander.astro`

### - [ ] Step 6.1: Aggiungi `circleHit` con micro-asserts

Subito dopo la definizione di `wrap`, aggiungi:

```typescript
      function circleHit(ax: number, ay: number, ar: number, bx: number, by: number, br: number): boolean {
        const dx = ax - bx, dy = ay - by;
        return dx * dx + dy * dy <= (ar + br) * (ar + br);
      }

      if (import.meta.env.DEV) {
        console.assert(circleHit(0, 0, 5, 3, 0, 5) === true, 'circleHit overlap');
        console.assert(circleHit(0, 0, 1, 100, 0, 1) === false, 'circleHit far');
        console.assert(circleHit(0, 0, 1, 2, 0, 1) === true, 'circleHit touch');
      }
```

### - [ ] Step 6.2: Aggiungi `splitRock`

Dopo `function makeRock(...)`, aggiungi:

```typescript
      function splitRock(r: Rock): Rock[] {
        if (r.size === 'L') return [makeRock(r.x, r.y, 'M'), makeRock(r.x, r.y, 'M')];
        if (r.size === 'M') return [makeRock(r.x, r.y, 'S'), makeRock(r.x, r.y, 'S')];
        return [];
      }
```

### - [ ] Step 6.3: Aggiungi collision detection nel `update`

Alla fine di `update`, dopo "Rocks update", aggiungi:

```typescript
        // Bullet -> Rock collisions
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          for (let j = rocks.length - 1; j >= 0; j--) {
            const r = rocks[j];
            if (circleHit(b.x, b.y, 2, r.x, r.y, r.radius)) {
              bullets.splice(i, 1);
              const fragments = splitRock(r);
              rocks.splice(j, 1, ...fragments);
              break;
            }
          }
        }

        // Ship -> Rock collisions
        if (ship.alive !== false) {
          for (const r of rocks) {
            if (circleHit(ship.x, ship.y, 6, r.x, r.y, r.radius)) {
              ship.alive = false;
              break;
            }
          }
        }
```

### - [ ] Step 6.4: Aggiorna il tipo Ship con `alive`

Modifica la dichiarazione del tipo Ship da:
```typescript
      type Ship = { x: number; y: number; vx: number; vy: number; angle: number };
```
a:
```typescript
      type Ship = { x: number; y: number; vx: number; vy: number; angle: number; alive?: boolean };
```

E nel `start()`, inizializza `alive: true`:
```typescript
        ship = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2, alive: true };
```

E nell'init originale di `ship` (in cima al modulo), aggiungi `alive: true`:
```typescript
      let ship: Ship = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2, alive: true };
```

### - [ ] Step 6.5: Non rendere la ship se morta + restart automatico timer-driven (placeholder)

In `frame`, sostituisci `drawShip(ship);` con:
```typescript
        if (ship.alive !== false) drawShip(ship);
```

Aggiungi una variabile `deathTimer`. Trova la riga `let lastT = 0;` e *subito sopra* aggiungi:
```typescript
      let deathTimer = 0;
```

Nel `start()`, aggiungi `deathTimer = 0;` insieme agli altri reset. La versione completa di `start()` ora è:
```typescript
      function start() {
        if (running) return;
        running = true;
        resize();
        ship = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2, alive: true };
        bullets.length = 0;
        wave = 1;
        deathTimer = 0;
        spawnWave(3, 1);
        lastT = performance.now();
        rafId = requestAnimationFrame(frame);
      }
```

All'inizio di `update` (prima della logica di rotazione/thrust), aggiungi questo blocco timer-driven — verrà sostituito al Task 8 con la schermata game-over vera:
```typescript
        if (ship.alive === false) {
          deathTimer += dt;
          if (deathTimer > 1.5) {
            deathTimer = 0;
            ship = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2, alive: true };
            spawnWave(3, 1);
            wave = 1;
          }
          return;
        }
```

### - [ ] Step 6.6: Verify (smoke)

Verifica:
- Spara a un L → diventa 2 M
- Spara a un M → diventa 2 S
- Spara a un S → sparisce
- Tutti distrutti → schermo vuoto (waves automatici li gestiremo dopo, va bene per ora)
- Tocca un rock con la ship → la nave scompare per ~1.5s, poi rispawnano 3 L grandi nuovi
- Console: nessuna asserzione fallita

### - [ ] Step 6.7: Commit

```bash
git add src/components/Anaximander.astro
git commit -m "$(cat <<'EOF'
feat(anaximander): bullet/ship collisions, rock splitting

Bullets break rocks (L->2M->2S->gone). Ship death triggers a 1.5s
delay then full restart (placeholder, replaced by game-over UI later).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Wave progression + score + HUD + high score localStorage

**Goal del task:** quando tutti i rocks sono distrutti, parte la wave successiva con +1 L e +5% velocità (cap 2x). Score visibile in HUD. High score persistito.

**Files:**
- Modify: `src/components/Anaximander.astro`

### - [ ] Step 7.1: HTML del HUD

Sostituisci il blocco markup (la `<div class="anaximander">`) con:

```astro
<div class="anaximander" data-state="idle" aria-hidden="true">
  <div class="anaximander-stage">
    <canvas class="anaximander-canvas"></canvas>
    <div class="anaximander-hud" aria-live="off">
      <span class="hud-label">observations</span>
      <span class="hud-score" data-score>0</span>
      <span class="hud-divider">/</span>
      <span class="hud-best" data-best>0</span>
      <span class="hud-label">wave</span>
      <span class="hud-wave" data-wave>1</span>
    </div>
  </div>
</div>
```

### - [ ] Step 7.2: CSS del HUD

Aggiungi al blocco `<style>` (dopo le regole esistenti, prima di `</style>`):

```css
  .anaximander-stage {
    position: relative;
    width: min(100%, 720px);
  }
  .anaximander-stage .anaximander-canvas {
    width: 100%;
  }
  .anaximander-hud {
    position: absolute;
    top: var(--space-3);
    left: var(--space-3);
    right: var(--space-3);
    display: flex;
    gap: var(--space-3);
    align-items: baseline;
    color: var(--paper);
    font-family: var(--font-display);
    font-size: var(--fs-sm);
    pointer-events: none;
    mix-blend-mode: difference;
  }
  .hud-label {
    font-size: var(--fs-xs);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    opacity: 0.7;
  }
  .hud-score, .hud-best, .hud-wave {
    font-variant-numeric: tabular-nums;
  }
  .hud-divider { opacity: 0.4; }
```

### - [ ] Step 7.3: Score state + HUD update

Nel `<script>`, dopo `let wave = 1;`, aggiungi:

```typescript
      let score = 0;
      const HIGH_KEY = 'anaximander.highscore';
      let best = 0;
      try { best = parseInt(localStorage.getItem(HIGH_KEY) || '0', 10) || 0; } catch {}

      const ROCK_SCORE: Record<RockSize, number> = { L: 20, M: 50, S: 100 };

      const elScore = document.querySelector<HTMLElement>('[data-score]');
      const elBest = document.querySelector<HTMLElement>('[data-best]');
      const elWave = document.querySelector<HTMLElement>('[data-wave]');

      function syncHud() {
        if (elScore) elScore.textContent = String(score);
        if (elBest) elBest.textContent = String(best);
        if (elWave) elWave.textContent = String(wave);
      }

      function addScore(size: RockSize) {
        score += ROCK_SCORE[size];
        if (score > best) {
          best = score;
          try { localStorage.setItem(HIGH_KEY, String(best)); } catch {}
        }
        syncHud();
      }
```

### - [ ] Step 7.4: Hook score nella collisione bullet-rock

Nel blocco "Bullet -> Rock collisions" di `update`, sostituisci:
```typescript
              bullets.splice(i, 1);
              const fragments = splitRock(r);
              rocks.splice(j, 1, ...fragments);
              break;
```
con:
```typescript
              bullets.splice(i, 1);
              addScore(r.size);
              const fragments = splitRock(r);
              rocks.splice(j, 1, ...fragments);
              break;
```

### - [ ] Step 7.5: Wave progression

Alla fine di `update`, dopo i due loop di collision, aggiungi:

```typescript
        // Wave clear?
        if (rocks.length === 0 && ship.alive !== false) {
          wave += 1;
          const speedMul = Math.min(1 + 0.05 * (wave - 1), 2);
          spawnWave(2 + wave, speedMul);
          syncHud();
        }
```

### - [ ] Step 7.6: Reset score in `start`

Nel `start()`, aggiungi `score = 0;` e `syncHud();`:

```typescript
      function start() {
        if (running) return;
        running = true;
        resize();
        ship = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2, alive: true };
        bullets.length = 0;
        wave = 1;
        score = 0;
        deathTimer = 0;
        spawnWave(3, 1);
        syncHud();
        lastT = performance.now();
        rafId = requestAnimationFrame(frame);
      }
```

### - [ ] Step 7.7: Verify (smoke)

Verifica:
- HUD visibile in alto a sinistra: "observations 0 / 0 wave 1"
- Distruggi un L: vedi `20` come score
- Distruggi i 2 M risultanti: vedi `120`, poi `220`
- Distruggi tutti i rocks → wave passa a 2 con 4 L, poi a 3 con 5 L, etc., con velocità leggermente aumentata
- Ricarica la pagina, riavvia il game: il best score persiste
- HUD ha tipografia Fraunces (serif), tabular-nums (cifre allineate)

### - [ ] Step 7.8: Commit

```bash
git add src/components/Anaximander.astro
git commit -m "$(cat <<'EOF'
feat(anaximander): scoring, waves, persistent high score, HUD overlay

HUD uses the editorial Fraunces font with tabular numerics and
mix-blend-mode difference so it reads on any background.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Game over screen + restart + pause + exit

**Goal del task:** ship morta → schermata "Drift over" con score, pulsante Restart + Exit. `P` mette in pausa. `Esc` esce (chiude il game, mostra di nuovo 404 normale).

**Files:**
- Modify: `src/components/Anaximander.astro`

### - [ ] Step 8.1: HTML overlay

Modifica la sezione `<div class="anaximander-stage">` aggiungendo overlay dopo il HUD:

```astro
  <div class="anaximander-stage">
    <canvas class="anaximander-canvas"></canvas>
    <div class="anaximander-hud" aria-live="off">
      <span class="hud-label">observations</span>
      <span class="hud-score" data-score>0</span>
      <span class="hud-divider">/</span>
      <span class="hud-best" data-best>0</span>
      <span class="hud-label">wave</span>
      <span class="hud-wave" data-wave>1</span>
    </div>
    <div class="anaximander-overlay" data-overlay hidden>
      <p class="overlay-title" data-overlay-title>Drift over.</p>
      <p class="overlay-sub" data-overlay-sub>—</p>
      <div class="overlay-actions">
        <button type="button" data-action="restart">Restart</button>
        <button type="button" data-action="exit">Exit</button>
      </div>
    </div>
    <div class="anaximander-pause" data-pause hidden>Paused — press P or tap</div>
  </div>
```

### - [ ] Step 8.2: CSS overlay

Aggiungi al `<style>`:

```css
  .anaximander-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--space-4);
    background: rgba(21, 23, 26, 0.78);
    color: var(--paper);
    text-align: center;
    padding: var(--space-5);
  }
  .anaximander-overlay[hidden] { display: none; }
  .overlay-title {
    font-family: var(--font-display);
    font-size: var(--fs-2xl);
    font-weight: 500;
    letter-spacing: -0.01em;
  }
  .overlay-sub {
    font-size: var(--fs-sm);
    opacity: 0.75;
  }
  .overlay-actions { display: flex; gap: var(--space-3); }
  .overlay-actions button {
    font: inherit;
    font-size: var(--fs-sm);
    color: var(--paper);
    background: transparent;
    border: 1px solid var(--paper);
    padding: var(--space-2) var(--space-4);
    cursor: pointer;
    transition: background 150ms ease, color 150ms ease;
  }
  .overlay-actions button:hover {
    background: var(--paper);
    color: var(--ink);
  }
  .overlay-actions button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .anaximander-pause {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--paper);
    font-family: var(--font-display);
    font-size: var(--fs-lg);
    background: rgba(21, 23, 26, 0.55);
  }
  .anaximander-pause[hidden] { display: none; }
```

### - [ ] Step 8.3: Script: pause, exit, game over, restart

Nel `<script>`, dopo `let deathTimer = 0;`, aggiungi:

```typescript
      let paused = false;
      let gameOver = false;
      const elOverlay = document.querySelector<HTMLElement>('[data-overlay]');
      const elOverlaySub = document.querySelector<HTMLElement>('[data-overlay-sub]');
      const elPause = document.querySelector<HTMLElement>('[data-pause]');
      const elRestart = document.querySelector<HTMLButtonElement>('[data-action="restart"]');
      const elExit = document.querySelector<HTMLButtonElement>('[data-action="exit"]');
```

Sostituisci il blocco "ship.alive === false" all'inizio di `update` con:

```typescript
        if (ship.alive === false && !gameOver) {
          deathTimer += dt;
          if (deathTimer > 1.2) {
            triggerGameOver();
          }
          return;
        }
```

Aggiungi dopo `function start()`:

```typescript
      function triggerGameOver() {
        gameOver = true;
        if (elOverlay) {
          elOverlay.hidden = false;
          if (elOverlaySub) {
            elOverlaySub.textContent = `Distance traveled: ${score} observations. Best: ${best}.`;
          }
          elRestart?.focus();
        }
      }

      function restart() {
        gameOver = false;
        if (elOverlay) elOverlay.hidden = true;
        ship = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2, alive: true };
        bullets.length = 0;
        wave = 1;
        score = 0;
        deathTimer = 0;
        spawnWave(3, 1);
        syncHud();
      }

      function exitGame() {
        stop();
        gameOver = false;
        paused = false;
        if (elOverlay) elOverlay.hidden = true;
        if (elPause) elPause.hidden = true;
        root.setAttribute('data-state', 'idle');
        root.setAttribute('aria-hidden', 'true');
        const btn = document.getElementById('wander-btn');
        btn?.focus();
      }

      function togglePause() {
        if (!running || gameOver) return;
        paused = !paused;
        if (elPause) elPause.hidden = !paused;
        if (!paused) {
          lastT = performance.now();
          rafId = requestAnimationFrame(frame);
        }
      }
```

Modifica `frame` per rispettare pause:

```typescript
      function frame(t: number) {
        if (!running) return;
        if (paused) return; // don't schedule next
        const dt = Math.min((t - lastT) / 1000, 0.05);
        lastT = t;
        update(dt);
        clear();
        drawBullets();
        drawRocks();
        if (ship.alive !== false) drawShip(ship);
        rafId = requestAnimationFrame(frame);
      }
```

Estendi `onKeyDown` per gestire P ed Esc:

```typescript
      function onKeyDown(e: KeyboardEvent) {
        if (!running) return;
        const k = e.key;
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(k)) {
          e.preventDefault();
        }
        if (k === 'Escape') {
          e.preventDefault();
          exitGame();
          return;
        }
        if (k === 'p' || k === 'P') {
          e.preventDefault();
          togglePause();
          return;
        }
        keys.add(k);
      }
```

Aggiungi listener sui bottoni overlay (in fondo, vicino agli altri `addEventListener`):

```typescript
      elRestart?.addEventListener('click', restart);
      elExit?.addEventListener('click', exitGame);
```

### - [ ] Step 8.4: Verify (smoke)

Verifica:
- Muori → dopo ~1.2s vedi overlay scuro "Drift over. Distance traveled: NN observations. Best: NN." con due bottoni
- Click "Restart" → game riparte da wave 1, score 0
- Click "Exit" → game scompare, torni alla 404 normale con focus sul button "or wander the cosmos →"
- Durante gioco: premi `P` → vedi "Paused — press P or tap", il loop si ferma. Premi di nuovo `P` → riparte
- `Esc` durante il gioco → exit immediato
- Tab+Enter sui bottoni overlay funzionano (a11y)

### - [ ] Step 8.5: Commit

```bash
git add src/components/Anaximander.astro
git commit -m "$(cat <<'EOF'
feat(anaximander): game over overlay, pause, exit, restart

Editorial overlay with Fraunces title, outlined buttons. P pauses,
Esc exits and restores focus to the wander entry point.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Virtual buttons (HTML + CSS) per mobile

**Goal del task:** sul layout sono presenti i 4 bottoni virtuali (rotate L/R, thrust, fire) + pause/exit small in alto a destra. Sono visibili solo su touch device (`(hover: none) and (pointer: coarse)`). I bottoni *non* sono ancora wired al gioco — funzioneranno al Task 10.

**Files:**
- Modify: `src/components/Anaximander.astro`

### - [ ] Step 9.1: HTML virtual buttons

Modifica `<div class="anaximander-stage">` aggiungendo i controlli touch *dentro* lo stage, dopo `data-pause`:

```astro
    <div class="anaximander-pause" data-pause hidden>Paused — press P or tap</div>
    <div class="anaximander-touch" data-touch hidden>
      <div class="touch-left">
        <button type="button" class="touch-btn" data-touch-action="rot-left" aria-label="Rotate left">↺</button>
        <button type="button" class="touch-btn" data-touch-action="rot-right" aria-label="Rotate right">↻</button>
      </div>
      <div class="touch-right">
        <button type="button" class="touch-btn touch-btn--big" data-touch-action="thrust" aria-label="Thrust">▲</button>
        <button type="button" class="touch-btn" data-touch-action="fire" aria-label="Fire">●</button>
      </div>
      <div class="touch-top">
        <button type="button" class="touch-btn touch-btn--small" data-touch-action="pause" aria-label="Pause">‖</button>
        <button type="button" class="touch-btn touch-btn--small" data-touch-action="exit" aria-label="Exit">✕</button>
      </div>
    </div>
```

### - [ ] Step 9.2: CSS virtual buttons

Aggiungi al `<style>`:

```css
  .anaximander-touch {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .anaximander-touch[hidden] { display: none; }
  .anaximander-touch .touch-left,
  .anaximander-touch .touch-right,
  .anaximander-touch .touch-top {
    position: absolute;
    display: flex;
    gap: var(--space-3);
    pointer-events: auto;
  }
  .anaximander-touch .touch-left {
    left: var(--space-3);
    bottom: var(--space-3);
  }
  .anaximander-touch .touch-right {
    right: var(--space-3);
    bottom: var(--space-3);
    align-items: flex-end;
  }
  .anaximander-touch .touch-top {
    top: var(--space-3);
    right: var(--space-3);
    gap: var(--space-2);
  }
  .touch-btn {
    width: 56px;
    height: 56px;
    border: 1px solid var(--paper);
    background: rgba(21, 23, 26, 0.45);
    color: var(--paper);
    font-size: 20px;
    font-family: var(--font-body);
    cursor: pointer;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 100ms ease;
  }
  .touch-btn:active,
  .touch-btn[data-active="1"] {
    background: rgba(246, 246, 244, 0.25);
  }
  .touch-btn--big {
    width: 72px;
    height: 72px;
    font-size: 26px;
  }
  .touch-btn--small {
    width: 36px;
    height: 36px;
    font-size: 14px;
    border-radius: 50%;
  }
  /* Visibility is controlled in JS by toggling [hidden]; CSS only styles. */
```

### - [ ] Step 9.3: JS: detect touch device e mostra layer

Nel `<script>`, dopo le `const elXxx = document.querySelector(...)` esistenti, aggiungi:

```typescript
      const elTouch = document.querySelector<HTMLElement>('[data-touch]');
      const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
```

Nel `start()`, dopo `running = true;`, aggiungi:
```typescript
        if (elTouch && isTouchDevice) elTouch.hidden = false;
```

Nel `exitGame()`, dopo `if (elPause) elPause.hidden = true;`, aggiungi:
```typescript
        if (elTouch) elTouch.hidden = true;
```

### - [ ] Step 9.4: Verify (smoke)

Apri DevTools, attiva device emulation (es. iPhone 13). Ricarica, vai a /404, clicca "wander the cosmos".

Verifica:
- Sul mobile-emulated vedi 6 bottoni: 2 in basso-sinistra (rotate), 2 in basso-destra (thrust grande + fire), 2 in alto-destra piccoli (pause, exit)
- I bottoni sono semi-trasparenti su sfondo ink, leggibili
- Toccare un bottone non fa ancora nulla (logica al Task 10)
- Disattiva l'emulation: i bottoni virtuali NON appaiono su desktop (rimangono `hidden`)

### - [ ] Step 9.5: Commit

```bash
git add src/components/Anaximander.astro
git commit -m "$(cat <<'EOF'
feat(anaximander): virtual buttons layout for mobile (visual only)

Six buttons placed in stage corners. Visible only when active and
matchMedia detects a touch primary pointer.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Wire-up touch handlers (Pointer Events, multi-touch)

**Goal del task:** sui virtual buttons, pressione = azione mantenuta; tap su fire = singolo shot; tap su pause/exit = azione one-shot. Multi-touch funziona (tieni rotate sinistro + premi thrust simultaneamente).

**Files:**
- Modify: `src/components/Anaximander.astro`

### - [ ] Step 10.1: Touch state e helper

Nel `<script>`, dopo `const isTouchDevice = ...;`, aggiungi:

```typescript
      // Touch action state: action -> Set of pointerIds currently holding it.
      const touchHold: Record<string, Set<number>> = {
        'rot-left': new Set(),
        'rot-right': new Set(),
        'thrust': new Set(),
        'fire': new Set(),
      };

      function touchActive(action: string): boolean {
        return touchHold[action]?.size > 0;
      }
```

### - [ ] Step 10.2: Bind dei listener Pointer Events

Dopo `elRestart?.addEventListener(...); elExit?.addEventListener(...);`, aggiungi:

```typescript
      const touchButtons = document.querySelectorAll<HTMLButtonElement>('.touch-btn');
      touchButtons.forEach((btn) => {
        const action = btn.dataset.touchAction;
        if (!action) return;

        const setVisualActive = (on: boolean) => {
          btn.setAttribute('data-active', on ? '1' : '0');
        };

        btn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          btn.setPointerCapture(e.pointerId);
          if (action === 'pause') { togglePause(); return; }
          if (action === 'exit') { exitGame(); return; }
          touchHold[action]?.add(e.pointerId);
          setVisualActive(true);
        });

        const release = (e: PointerEvent) => {
          touchHold[action]?.delete(e.pointerId);
          if (!touchActive(action)) setVisualActive(false);
        };
        btn.addEventListener('pointerup', release);
        btn.addEventListener('pointercancel', release);
        btn.addEventListener('pointerleave', release);
      });
```

### - [ ] Step 10.3: Usa lo stato touch in `update`

Sostituisci nel blocco `update`:

```typescript
        if (keys.has('ArrowLeft')) ship.angle -= ROT_SPEED * dt;
        if (keys.has('ArrowRight')) ship.angle += ROT_SPEED * dt;
        if (keys.has('ArrowUp')) {
```

con:

```typescript
        if (keys.has('ArrowLeft') || touchActive('rot-left')) ship.angle -= ROT_SPEED * dt;
        if (keys.has('ArrowRight') || touchActive('rot-right')) ship.angle += ROT_SPEED * dt;
        if (keys.has('ArrowUp') || touchActive('thrust')) {
```

E sostituisci:
```typescript
        if (keys.has(' ') && fireCooldown === 0) {
```
con:
```typescript
        if ((keys.has(' ') || touchActive('fire')) && fireCooldown === 0) {
```

### - [ ] Step 10.4: Verify (smoke)

In DevTools mobile emulation (iPhone 13 portrait), clicca "wander the cosmos":

Verifica:
- Tieni il dito su `↺` → nave ruota a sinistra continuamente. Rilascia → si ferma.
- Tieni `↻` con un dito e `▲` (thrust) con un altro contemporaneamente → ruota e accelera insieme. (In DevTools usa il modificatore per multi-touch: Cmd/Ctrl + click trascina).
- Tocca `●` (fire) → spara un colpo. Tieni premuto → spara a raffica con cooldown.
- Tocca `‖` (pause) → game in pausa con overlay. Tocca di nuovo → riprende.
- Tocca `✕` (exit) → game si chiude, torni alla 404.
- Provare su device reale (iPhone o Android) se disponibile.

### - [ ] Step 10.5: Commit

```bash
git add src/components/Anaximander.astro
git commit -m "$(cat <<'EOF'
feat(anaximander): wire touch buttons via Pointer Events, multi-touch

Each action tracks active pointerIds in a Set, so simultaneous
gestures (rotate + thrust) compose naturally. Fire respects the
same cooldown as keyboard.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Responsive canvas, orientation, reduced-motion disclaimer, final polish

**Goal del task:** canvas size si adatta a portrait/landscape, le entità si riscalano alla resize, `prefers-reduced-motion` mostra un disclaimer before-start.

**Files:**
- Modify: `src/components/Anaximander.astro`
- Modify: `src/pages/404.astro`

### - [ ] Step 11.1: Aspect ratio dinamico via CSS

Nel `<style>` del componente, sostituisci:
```css
  .anaximander-canvas {
    display: block;
    width: min(100%, 720px);
    aspect-ratio: 16 / 10;
    background: var(--ink);
    border: 1px solid var(--rule);
  }
```
con:
```css
  .anaximander-canvas {
    display: block;
    width: min(100%, 720px);
    aspect-ratio: 16 / 10;
    background: var(--ink);
    border: 1px solid var(--rule);
  }
  @media (max-width: 600px) and (orientation: portrait) {
    .anaximander-canvas {
      aspect-ratio: 3 / 4;
      width: min(100%, 480px);
    }
    .anaximander-stage {
      width: 100%;
    }
  }
```

### - [ ] Step 11.2: Scaling delle entità sul resize

Nel `<script>`, modifica `resize` per riscalare entità quando il canvas cambia:

Sostituisci la funzione `resize` con:

```typescript
      let lastW = 0, lastH = 0;
      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Rescale entities to new size to preserve relative positions
        if (lastW > 0 && lastH > 0 && (lastW !== w || lastH !== h)) {
          const sx = w / lastW;
          const sy = h / lastH;
          ship.x *= sx; ship.y *= sy;
          for (const b of bullets) { b.x *= sx; b.y *= sy; }
          for (const r of rocks) { r.x *= sx; r.y *= sy; }
        } else if (!running) {
          ship.x = w / 2;
          ship.y = h / 2;
        }
        lastW = w; lastH = h;
      }
```

E aggiungi un listener orientation:

Dopo `window.addEventListener('resize', ...)`, aggiungi:
```typescript
      window.addEventListener('orientationchange', () => {
        if (running) setTimeout(resize, 50);
      });
```

### - [ ] Step 11.3: Reduced-motion disclaimer (in 404.astro)

In `src/pages/404.astro`, sostituisci lo `<script>` in fondo con:

```astro
<script>
  const btn = document.getElementById('wander-btn');
  btn?.addEventListener('click', () => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      const ok = window.confirm(
        'This is a small animated game with motion. Play anyway?'
      );
      if (!ok) return;
    }
    document.dispatchEvent(new CustomEvent('anaximander:start'));
  });
</script>
```

### - [ ] Step 11.4: Particle cap mobile (preventivo per future iterazioni)

Nel `<script>`, dopo la dichiarazione di `isTouchDevice`, aggiungi:

```typescript
      const PARTICLE_CAP = isTouchDevice ? 40 : 80;
      // Note: particles non sono attualmente usate. Costante riservata per future iter.
```

### - [ ] Step 11.5: Final smoke pass (desktop + mobile emulation)

Desktop:
1. `npm run dev`, vai a `/404`
2. Click "wander the cosmos" → game parte
3. Gioca un round: muori → restart → muori → exit → ricarica la pagina
4. Best score persiste tra refresh ✓
5. Resize finestra durante il gioco: tutto si riscala, niente flicker

Mobile (DevTools iPhone 13):
1. Stessa sequenza con i virtual buttons
2. Multi-touch rotate+thrust ✓
3. Rotate device portrait↔landscape: canvas cambia aspect-ratio, entità riscalate
4. Tocca exit → torni a 404 normale

Reduced motion:
1. DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`
2. Click "wander the cosmos" → confirm dialog
3. Cancel → niente succede
4. OK → game parte normalmente

Check console: nessun error, nessun warn, asserts silenziose.

Check Astro build: `npm run build` deve finire senza errori. Verifica che il script venga emesso (un `<script type="module">` in `dist/404/index.html`).

### - [ ] Step 11.6: Commit finale

```bash
git add src/components/Anaximander.astro src/pages/404.astro
git commit -m "$(cat <<'EOF'
feat(anaximander): responsive canvas, orientation handling, reduced-motion disclaimer

Portrait layout uses 3:4 aspect ratio on small screens. Entities
rescale to preserve relative positions on viewport changes.
prefers-reduced-motion users get a confirm dialog before start.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### - [ ] Step 11.7: Build verification

```bash
npm run build
```
Expected: build completes con `Complete!`, nessun error TypeScript da `astro check`. Se ci sono type errors, leggerli e fixarli — sono probabilmente su `ship.alive` (assicurati che il tipo `Ship` includa `alive?: boolean`).

```bash
npm run preview
```
Apri il preview e ripeti uno smoke pass veloce.

---

## Done

A questo punto il game è completo, committato in piccoli step, e pronto per la review di Federico (vedi sezione "Rollout" dello spec).

Se Federico approva → merge della branch su `main` → Netlify deploy automatico.
Se Federico chiede modifiche → iterazione su questa branch.
Se Federico dice no → la branch resta come archivio sperimentale, niente merge.

---

## Self-Review Notes (left in plan for transparency)

- **Spec coverage**: tutti i goals (1-6 nello spec) sono coperti. Tutti i non-goals sono rispettati (no audio, no backend, no multiplayer).
- **Mobile MVP**: implementato con virtual buttons + Pointer Events multi-touch + responsive canvas + DPR + orientation handling. ✓
- **A11y**: opt-in via click esplicito; `aria-hidden` toggle; focus management su exit; reduced-motion disclaimer; focus-visible su button. Una cosa che ho lasciato fuori: focus trap completo dentro il game-overlay (Tab cycle interno). Per un easter egg, accettabile. Documentato come future iter implicito.
- **Type consistency**: `Ship.alive` aggiunto come optional in T6 e usato consistentemente in T7-T8. `RockSize`, `Rock`, `Bullet` coerenti. `touchHold` object indicizzato per stringa, controllato con `?.`.
- **Placeholders**: nessuno. Tutto il codice è esplicito.
- **Caption filosofica "After Anaximander, the world is a problem."**: questa è elencata nello spec ma NON è implementata in nessun task del plan. È un dettaglio testuale che può essere aggiunto come piccolo cap in un ultimo step se Federico vuole. Lasciato esplicitamente fuori dal plan per non vincolare la decisione del copy fino a quando Federico non vede il game.

