# Anaximander — easter-egg cosmologico nella 404

**Status**: design / exploratory
**Owner**: Alberto
**Date**: 2026-05-21
**Site**: federicoviglione.com (sito-viglions)

## Problem

Il sito di Federico Viglione è un biglietto da visita accademico, sobrio, editorial-tech. Vogliamo nasconderci un piccolo gioco arcade tipo Asteroids — un easter egg — senza compromettere la percezione professionale. Federico non ha visto l'idea: questa è una proposta esplorativa.

## Goals

1. Coerenza visiva totale col resto del sito (palette, font, tono).
2. Zero impatto su homepage / performance / SEO.
3. Nessuna dipendenza JS aggiuntiva (Astro 5 statico, niente island framework).
4. Il game è opt-in: nessun visitatore lo incontra contro la sua volontà.
5. Riferimento sottile al lavoro filosofico di Federico (cosmologia, tempo, "Awakening Universe Hypothesis").
6. Giocabile sia da desktop (tastiera) sia da mobile (touch).

## Non-goals

- Multiplayer, leaderboard online, account, backend.
- Audio nel MVP (eventuale iter successiva, mute-by-default).
- Effetti grafici elaborati, particle storms, screen shake.
- Promuoverlo: resta un easter egg che chi sbaglia URL può scoprire.
- Gamepad / API device-orientation / tilt (mobile usa solo touch).

## Approach — Recap delle alternative considerate

| Approccio | Pro | Contro | Esito |
|---|---|---|---|
| **A. Easter egg in /404** | Riusa pagina esistente, narrativa coerente ("ti sei perso → vaga nel cosmo"), zero impatto su homepage | Pochi lo vedono (ma è proprio il punto di un easter egg) | **Scelto** |
| B. Konami code in homepage | Feel "vero hacker easter egg" | Listener globale in homepage, scoperta nulla senza hint | Scartato |
| C. Pagina `/play` non linkata | Schermo dedicato | Praticamente invisibile, tono "qui c'è una pagina giochi" stona | Scartato |

## Design

### Concept e tono

Mini Asteroids vector-clean nello stile editoriale del sito. Linee `--ink` (`#15171a`) su `--paper` (`#f6f6f4`), o viceversa (decidere in implementazione provando entrambi). Triangolo per la nave. Poligoni irregolari per gli "asteroidi" come *world-lines* alla deriva. Proiettili come punti.

**Naming**: **Anaximander** (il primo cosmologo greco — fit col lavoro di Federico). Alternativa di fallback: "Trajectories". Default per implementazione: Anaximander.

**Wink filosofico minimo**: nell'HUD, "shots" è renderizzato come "observations" (joke leggero, non invadente). Sopra/sotto il canvas, all'inizio, una caption breve tipo "After Anaximander, the world is a problem." — discreta, una riga, niente di più.

### Punto di accesso

Modifica a `src/pages/404.astro`:

- Sotto il `<p class="back">`, aggiungere un secondo link/button:
  ```
  or wander the cosmos →
  ```
- Stile: stessa famiglia del link "Back to home", dotted underline, peso visivo equivalente. Nessuna animazione, nessun "click-bait".
- Click: dispatcha un custom event `anaximander:start` sul `document`. Il componente `Anaximander` ascolta e si attiva. Nessun oggetto globale su `window` — più pulito e isolato.

Quando il game è attivo, il "404" gigante e il blocco testuale possono fade-out (transition 200ms) o restare sopra il canvas trasparente — preferenza in implementazione: fade-out per dare focus al canvas.

### Struttura file

```
src/pages/404.astro              [modificato]   importa <Anaximander />, aggiunge link
src/components/Anaximander.astro [nuovo]        markup + CSS scoped + <script> inline
docs/superpowers/specs/2026-05-21-asteroids-easter-egg-design.md  [questo doc]
```

Nessun asset esterno. Nessun aggiunta a `package.json`. Nessun cambio a `astro.config.mjs`. Nessuna entry in content collections.

### Componente Anaximander.astro

Tre parti, nello stesso file (pattern Astro standard):

1. **Frontmatter**: nessuna prop (MVP). Eventuale `highScoreKey` come prop opzionale per futuri usi.
2. **HTML**: container `.anaximander` hidden by default, contiene:
   - `<canvas class="anaximander-canvas">`
   - HUD overlay con score / high score / wave
   - Pannello istruzioni iniziale (toggle con `H` o `?`)
   - Bottoni "pause" e "exit"
3. **CSS scoped Astro**: layout, palette dal design system (`var(--ink)`, `var(--paper)`, `var(--accent)`, `var(--muted)`), font `var(--font-display)` per HUD title, `var(--font-body)` per le voci numeriche. Responsive: canvas `width: min(100%, 720px); aspect-ratio: 16/10`.
4. **`<script>` inline**: vanilla JS, ~250-350 righe. Espone `window.Anaximander = { start, stop }` (o emette/ascolta custom events).

### Loop di gioco (specifiche tecniche)

- **Runtime**: `requestAnimationFrame` con delta-time clamp (max 50ms per evitare tunneling)
- **Entità**:
  - `ship`: `{ x, y, vx, vy, angle, thrusting, alive }`
  - `bullets[]`: `{ x, y, vx, vy, life }` (life = ms, default 800)
  - `rocks[]`: `{ x, y, vx, vy, angle, va, size: 'L'|'M'|'S', shape: number[] }` (shape = punti del poligono)
  - `particles[]`: thrust trail + collision wisps; cap a ~80
- **Fisica**:
  - Ship: thrust = accel lungo angle, drag = 0.995/frame (leggero — più contemplativo di Asteroids puro)
  - Rocks: velocità costante, rotazione costante
  - Wraparound: tutte le entità wrappano sui 4 lati
- **Spawning**: wave parte con 3 rock grandi; ogni rock distrutto si splitta in 2 medi → ogni medio in 2 piccoli → piccoli scompaiono. Wave clear = +1 rock grande di partenza, +5% velocità rocks (cap 2x).
- **Punteggio**: L=20, M=50, S=100. High score in `localStorage['anaximander.highscore']`.
- **Collisioni**: circle-vs-circle approssimato (raggio = sqrt(area) della shape). Sufficiente per il feel.
- **Game over**: ship hit → 1s "drift" (controllo perso, scia di particles), poi schermata `Drift over. Distance: NNN.` + Restart / Exit.

### Controlli

**Desktop (tastiera)**:
- `←` / `→` rotate
- `↑` thrust
- `space` fire (cooldown 150ms)
- `P` pause
- `H` o `?` toggle help
- `Esc` exit (torna a 404 originale)

**Mobile (touch)**:

On-screen virtual buttons sovrapposti al canvas, semi-trasparenti, palette del sito (ink outline su `--paper` con `opacity: 0.6`).

Layout (sia portrait che landscape):
- **Sinistra in basso**: due bottoni rotate `↺` e `↻`, affiancati (gruppo "steer")
- **Destra in basso**: bottone `▲` thrust (più grande) + bottone `•` fire (subito sopra o accanto)
- **In alto a destra**: bottoni piccoli `‖` pause e `✕` exit

Dimensioni: min 56×56px per ogni bottone, target zone 64×64px. Distanza tra gruppi destro/sinistro: almeno `clamp(80px, 30vw, 200px)` per evitare conflitto col pollice opposto.

Comportamento touch:
- `touchstart` su rotate o thrust = attiva l'input continuo (azione mantenuta fino a `touchend` o `touchcancel`)
- `touchstart` su fire = singolo shot, rispetta lo stesso cooldown 150ms del desktop. Tieni premuto = fire continuo (auto-repeat al cooldown).
- `e.preventDefault()` su tutti i listener touch dei bottoni per evitare scroll/zoom involontari.
- CSS `touch-action: none` sui bottoni del game per disabilitare i gesti di sistema.
- Multi-touch: due dita simultaneamente (es. rotate + thrust) devono funzionare. Tieni un `Set<pointerId>` per ogni bottone attivo.

Detect touch device: `window.matchMedia('(hover: none) and (pointer: coarse)').matches`.
- Se true → mostra virtual buttons, nascondi pannello istruzioni tastiera.
- Se false → nascondi virtual buttons, mostra istruzioni tastiera.
- Su hybrid (laptop touch): se sia `pointer: coarse` che `pointer: fine` matchano? `matchMedia` riporta solo il primario; in quei casi rari, mostra istruzioni tastiera ma lascia i listener touch attivi sul canvas (i bottoni virtuali no, per non sporcare la UI desktop).

Canvas size su mobile:
- Portrait: `aspect-ratio: 3 / 4`, `width: min(100vw - 32px, 480px)`
- Landscape: `aspect-ratio: 16 / 10`, `width: min(100vw - 32px, 720px)`, `max-height: 70vh`
- I bottoni virtuali sono `position: absolute` sopra il canvas (non rubano area gioco).

Performance mobile:
- Canvas `width/height` attributes = layout px × `devicePixelRatio` (cap a 2 per evitare overhead su display HiDPI estremi).
- Particle cap: 80 desktop, **40 mobile**.
- Cooldown e velocità invariati: l'esperienza di gioco è la stessa, solo l'input cambia.

### Accessibilità

- Game completamente opt-in. Nessun JS pesante eseguito prima del click.
- Canvas con `aria-hidden="true"` + uno `<button>` "Skip game" che riporta focus al link "Back to home".
- `prefers-reduced-motion: reduce`: il button "wander the cosmos" è ancora visibile ma cliccarlo mostra un disclaimer "this is a visual game with motion" + bottone "Play anyway" / "Cancel". Niente auto-play.
- Focus visibile sui bottoni HUD.
- Trap focus dentro l'area del game quando attivo (Esc per uscire).

### Performance

- Game script: solo nella pagina 404. Homepage e altre pagine non lo caricano.
- Inline `<script>`: Astro decide se inline o estrarre a seconda della soglia. Entrambi vanno bene (script piccolo, ~10KB minified target).
- Nessun asset esterno → nessuna network call.
- Lighthouse: la 404 stessa non è critica per il sito (è una pagina di errore); homepage non tocca questo codice.
- Canvas ridisegnato solo quando il game è attivo. Quando in pausa o non avviato: nessun rAF in flight.

### Error handling

- Se `localStorage` non disponibile (private mode strict): high score in-memory, nessun errore visibile. Try/catch silenzioso.
- Se `canvas.getContext('2d')` torna `null`: il button "wander the cosmos" mostra "Your browser can't render this game. Sorry." e basta.
- Resize del viewport durante il gioco: le coordinate sono mantenute in pixel canvas-space. Su `resize`, ricalcola le dimensioni del canvas e applica un fattore di scala uniforme a `x`, `y`, `vx`, `vy` di tutte le entità per preservare le posizioni relative.

### Testing

- Smoke manuale desktop: aprire `/404`, cliccare "wander the cosmos", verificare:
  - Il canvas appare con palette corretta
  - Tasti `←/→/↑/space` rispondono
  - Asteroid si splittano correttamente, score sale, high score persiste dopo refresh
  - `Esc` esce e ripristina la 404 originale
  - `prefers-reduced-motion` mostra disclaimer
- Smoke manuale mobile (iPhone Safari + Android Chrome via DevTools device emulation, e almeno una verifica su device reale):
  - Bottoni virtuali appaiono, hit zone confortevole per il pollice
  - Rotate + thrust simultanei funzionano (multi-touch)
  - Niente scroll/zoom involontario durante il game
  - Canvas si ridimensiona correttamente su rotation portrait↔landscape
  - Tap su exit ripristina la 404 originale
- Browser target: ultime 2 versioni di Chrome, Firefox, Safari (incluso Mobile Safari iOS). No IE.
- Niente test automatici per MVP (game logic difficile da unit-testare in vanilla canvas senza overhead; effort/value non lo giustifica per un easter egg).

## Rollout

1. Implementazione su branch (worktree corrente).
2. Build locale + smoke test manuale.
3. PR self-review.
4. **Mostrare a Federico prima di mergere su `main`** — è il suo sito, ha diritto di veto. Possibile feedback: "no grazie", "sì ma rinominalo", "sì e mettilo anche in homepage". Tutti gli esiti sono accettabili.
5. Se OK → merge → deploy automatico via Netlify.

## Open questions (per implementazione)

- Palette canvas: ink-on-paper (sfondo chiaro) o paper-on-ink (sfondo scuro)? Provare entrambi, decidere a vista. Probabile esito: paper-on-ink dà più "cosmos feel" ma rompe la coerenza col resto del sito. Decisione di default: **ink-on-paper**, in continuità con la palette del sito.
- Caption filosofica: "After Anaximander, the world is a problem." — è un mio call. Federico potrebbe avere una citazione migliore dal suo lavoro. Per MVP usiamo quella, lasciando facile sostituirla.

## Future iterations (esplicitamente fuori scope ora)

- Audio (mute-by-default)
- Achievements / lore unlock (es. ogni 1000 punti, una breve frase filosofica)
- Skin alternativi (vector dark, ASCII)
- Konami code in homepage come *secondo* entry point (in aggiunta, non in sostituzione)
- Haptic feedback su mobile (`navigator.vibrate`) per fire/collisione
