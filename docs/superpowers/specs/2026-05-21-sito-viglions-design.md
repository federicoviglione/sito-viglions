# sito-viglions — Design document

**Data**: 2026-05-21
**Autore**: Alberto Iannaccone
**Stato**: approvato, pronto per planning

## 1. Contesto e obiettivo

Sito personale per **Federico Viglione**, filosofo della scienza early-career. Affiliazione corrente: Research Affiliate (Cultore della Materia) presso Università di Torino (dal 2026); in precedenza Postdoctoral Fellow a Università di Milano (2023-2025), PhD a Universitat Autònoma de Barcelona (2018-2022).

Aree di ricerca: filosofia del tempo, metafisica della scienza, filosofia della cosmologia, filosofia della matematica.

**Volume di contenuti al setup iniziale**:
- 3 articoli peer-reviewed (Erkenntnis 2026, Synthese 2024, HOPOS 2022) + 1 libro Springer "The Awakening Universe Hypothesis" sotto contratto + 2 edited volumes
- 19 talks (5 invited) dal 2015 al 2026
- 9 eventi organizzati (workshop, conference, seminar series)
- Memberships in EPSA, APA, Philosophy of Time Society, Centre for Philosophy of Time
- Project memberships: COSMOS, CHRONOS, PROTEUS (ERC)
- Peer reviewer per Mind, Synthese, Journal for General Philosophy of Science, SHPS

Funzione primaria: biglietto da visita accademico per applications, fellowship e networking. Pubblico target: commissioni di assunzione, peer ricercatori, potenziali collaboratori.

**Vincolo cardine**: Federico deve poter modificare i contenuti autonomamente, senza toccare codice, senza dipendere da Alberto per ogni aggiornamento.

**Stile di riferimento**: parente diretto di `sito-francesca` (stesso stack, stesso pattern editoriale), declinato in chiave "editorial-tech cool" — serif display per il nome e i titoli, sans-serif body, accento blu freddo, tag chip a spigolo vivo, paper off-white. Niente dark mode, niente animazioni decorative.

**Lingua del sito**: inglese. I titoli dei talk/eventi originariamente in italiano restano nella lingua originale (es. "La Natura Infinita del Sublime"); facoltativa una glossa inglese tra parentesi nella `title` del frontmatter.

## 2. Stack tecnico

| Componente | Scelta | Motivo |
|---|---|---|
| Static site generator | **Astro 5** (output `static`) | Riuso completo del setup di sito-francesca; HTML statico puro per le rendering paths; content collections native con validazione Zod. |
| CMS | **Sveltia CMS** servito da `public/admin/` | Pannello web SPA, backend `github`, login via OAuth proxy pubblico `auth.sveltia.app` (zero infra OAuth da gestire). Già verificato funzionare con utente non-tech. |
| Hosting + CI | **Netlify** | Build automatico al push, CDN, gestione dominio, build hook per Sveltia. |
| DNS | **Cloudflare** | Stesso pattern di sito-francesca. |
| Linguaggio schema | **TypeScript** (Zod via Astro) | Errori di typo nei frontmatter intercettati al build. |
| Lingua del sito | **Inglese unico** | Pubblico target internazionale; semplifica i contenuti (no i18n). |

### Confini netti

- I contenuti vivono SOLO in `src/content/*` (markdown + JSON). Il codice non hardcoda mai un titolo di paper, un'affiliazione, un'email.
- Il pannello CMS è l'unica superficie di scrittura per il filosofo. Alberto può editare direttamente i file md/JSON (entrambe le modalità coesistono via git).
- Immagini caricate dal CMS finiscono in `public/uploads/` (path stabile, rinominate dal CMS con timestamp per evitare conflitti).
- CV PDF in `public/files/cv.pdf` — path fisso, overwrite dei caricamenti precedenti.

### Cosa NON facciamo in v1 (YAGNI esplicito)

- Auto-import publications da ORCID/Google Scholar/BibTeX (2 paper si inseriscono a mano; aggiunge dipendenze e edge case).
- Blog / collection di note.
- i18n / multi-lingua.
- Form di contatto Netlify Forms (anti-spam complica). Email visibile + ORCID/Scholar/PhilPeople linkati.
- Dark mode toggle.
- Sezione Teaching (filosofo è early-career, non l'ha selezionata; collezione additiva in futuro).
- Custom cursor, particles, animazioni di scroll, page transitions.
- Cookie banner / consent UI (nessun cookie, nessun consent richiesto).

## 3. Modello dei contenuti

Tutte le collections in `src/content/`. Schemi Zod in `src/content/config.ts` (sorgente di verità per Astro) e schemi Sveltia in `public/admin/config.yml` (sorgente per il CMS). I due file devono mutare INSIEME nello stesso commit — commento di sync in testa a entrambi.

### 3.1 `site` — data collection, single entry

File: `src/content/site/info.json`

Tutti i campi statici sul filosofo. Una entry, sempre presente.

| Campo | Tipo | Required | Note |
|---|---|---|---|
| `name` | string | sì | Nome completo, es. "Federico Viglione" |
| `role` | string | sì | es. "Research Affiliate, Philosophy of Science" |
| `affiliation` | string | sì | es. "Università degli Studi di Torino" |
| `location` | string | no | es. "Turin, Italy" |
| `tagline` | string | sì | 1 frase sul "what I work on", usata nell'hero |
| `research_tags` | string[] | sì | Max 5, mostrati nell'hero come chip |
| `email` | string | sì | Visibile sul sito |
| `orcid_url` | string | no | URL completo |
| `scholar_url` | string | no | URL Google Scholar |
| `philpeople_url` | string | no | URL PhilPeople |
| `academia_url` | string | no | URL Academia.edu |
| `github_url` | string | no | URL GitHub |
| `photo` | string | no | Path immagine, es. `/uploads/federico.jpg` |
| `photo_credit` | string | no | "Photo by …" — italic serif sotto la foto |
| `cv_pdf` | string | no | Path al CV, default `/files/cv.pdf` |
| `affiliations` | array of `{period, role, institution, location?, current?}` | no | Timeline accademica (positions, ordinata desc) |
| `education` | array of `{period, degree, institution, location?, thesis_title?, supervisors?, grade?}` | no | Storia formativa (ordinata desc) |
| `editorial_roles` | array of `{journal, role, url?}` | no | es. "Editorial board, Synthese" |
| `memberships` | array of `{name, role?, period?, url?}` | no | Associazioni accademiche (EPSA, APA, ecc.) |
| `project_memberships` | array of `{name, period, role?, url?}` | no | Progetti di ricerca (COSMOS, CHRONOS, PROTEUS) |
| `peer_review_for` | string[] | no | Lista di journal per cui ha fatto peer review |

### 3.2 `bio` — single markdown entry

File: `src/content/bio/main.md`

Frontmatter vuoto. Tutto il contenuto nel body markdown. Sveltia la mostra come "Edit Bio", non "Create new".

### 3.3 `research` — collection

File pattern: `src/content/research/<slug>.md`. Una entry per area di ricerca (tipicamente 2-5).

| Campo | Tipo | Required | Note |
|---|---|---|---|
| `title` | string | sì | es. "Idealization in physics" |
| `summary` | string | sì | 1-2 frasi per la lista |
| `order` | number | no | Default 99, asc |
| body markdown | — | no | Descrizione estesa, opzionale |

### 3.4 `news` — collection

File pattern: `src/content/news/<slug>.md`. Per "Upcoming fellowship", "Recent visit", award, etc.

| Campo | Tipo | Required | Note |
|---|---|---|---|
| `title` | string | sì | es. "Feodor Lynen Fellowship, University of Sydney" |
| `date` | date | sì | Quando avviene (futuro) o quando annunciato |
| `kind` | select | sì | `upcoming` \| `recent` \| `award` \| `visit` |
| `summary` | string | sì | 1-2 frasi |
| `url` | string | no | Link a pagina evento |
| `pinned` | boolean | no | Default false; se true sta sempre in cima |

Filtro di visibilità (valutato al build, `today` = data del build):
- `pinned=true` → sempre visibili, sempre in cima
- `kind=upcoming` → visibili se `date ≥ today − 30 giorni` (un evento "appena passato" non è obsoleto subito)
- `kind=recent` o `kind=visit` → visibili se `date ≥ today − 12 mesi`
- `kind=award` → visibili se `date ≥ today − 24 mesi`

Le entry fuori finestra restano nel repo (storia, git history) ma non appaiono sul sito. Il filosofo può sempre forzarne la visibilità impostando `pinned=true`.

### 3.5 `publications` — collection

File pattern: `src/content/publications/<year>-<slug>.md`.

| Campo | Tipo | Required | Note |
|---|---|---|---|
| `title` | string | sì | |
| `authors` | string | sì | Default `<site.name>` |
| `year` | number | sì | |
| `venue` | string | sì | Rivista, editore, atti |
| `type` | select | sì | `journal-article` \| `book` \| `book-chapter` \| `edited-volume` \| `book-review` \| `preprint` \| `conference-paper` |
| `status` | select | sì | `published` \| `forthcoming` \| `under-review` \| `under-contract` \| `in-preparation` |
| `doi` | string | no | |
| `url` | string | no | Link PDF/publisher |
| `abstract` | text | no | Mostrato in `<details>` |
| `bibtex` | text | no | Mostrato in `<details>` |
| `coauthors_note` | string | no | es. "Special section co-edited with S. De Bianchi" |
| `order` | number | no | Tiebreaker, default 99 |

Frontmatter only — no body. Ordinamento: `year` desc, poi `order` asc, poi `title`.

Raggruppamento nella render: `published` in cima, poi `forthcoming`/`under-contract`, poi `under-review`, poi `in-preparation`.

### 3.6 `talks` — collection

File pattern: `src/content/talks/<date>-<slug>.md`.

| Campo | Tipo | Required | Note |
|---|---|---|---|
| `title` | string | sì | Nella lingua originale (italiano resta italiano) |
| `venue` | string | sì | Conferenza / istituzione |
| `location` | string | no | es. "Bologna, IT" |
| `date` | date | sì | |
| `type` | select | sì | `invited` \| `contributed` \| `keynote` \| `seminar` \| `workshop` |
| `url` | string | no | Pagina evento |
| `slides_url` | string | no | |
| `video_url` | string | no | YouTube / Vimeo / institutional streaming |
| `abstract` | text | no | |

Frontmatter only. Ordinamento: `date` desc.

### 3.7 `organized_events` — collection

File pattern: `src/content/organized_events/<date>-<slug>.md`.

Per workshop, conference, seminar series, etc. che Federico ha organizzato o co-organizzato.

| Campo | Tipo | Required | Note |
|---|---|---|---|
| `title` | string | sì | Nome dell'evento |
| `role` | select | sì | `organizer` \| `co-organizer` \| `program-committee` \| `coordinator` \| `committee-member` |
| `venue` | string | sì | Istituzione ospitante |
| `location` | string | no | es. "Milan, IT" |
| `start_date` | date | sì | Inizio evento (anche per series multi-anno: data di inizio) |
| `end_date` | date | no | Fine evento (per series o conferenze pluri-giornaliere) |
| `url` | string | no | Pagina evento |
| `co_organizers` | string | no | Testo libero, es. "Co-organizer with Silvia De Bianchi" |
| `description` | text | no | Breve descrizione |
| `order` | number | no | Tiebreaker, default 99 |

Frontmatter only. Ordinamento: `start_date` desc.

### 3.8 CV PDF

File: `public/files/cv.pdf`. Path fisso, sostituito al caricamento via campo `cv_pdf` di Site Info. Nessuna collection. Versioning storico solo via git history.

### 3.9 Validazione

Tutti gli schemi Zod con `required` corretti. Build fail se un campo obbligatorio manca — messaggio chiaro nei log Netlify, deploy precedente resta online. Mai pubblicare contenuto rotto.

## 4. Architettura del sito

### 4.1 Sitemap

```
/                  single-page (Hero → About → Research → News → Publications → Talks → Contact)
/files/cv.pdf      ultimo CV caricato
/admin/            Sveltia CMS
/404               pagina di errore custom con link alla home
```

Quattro URL totali. Architettura single-page con anchor scroll, ispirata a `helenmeskhidze.com`.

### 4.2 Sezioni della single-page

| # | Sezione | Sorgente | Visibilità condizionale |
|---|---|---|---|
| 1 | Hero | `site.json` | sempre |
| 2 | About | `bio/main.md` + `site.affiliations` + `site.education` + `site.editorial_roles` + `site.memberships` + `site.project_memberships` + `site.peer_review_for` | sempre |
| 3 | Research | `research/*.md` | nascosta se 0 entries |
| 4 | News | `news/*.md` filtrate | nascosta se 0 entries visibili |
| 5 | Publications | `publications/*.md` raggruppate per status | nascosta se 0 entries |
| 6 | Talks | `talks/*.md` ordinate per data desc | nascosta se 0 entries |
| 7 | Organized Events | `organized_events/*.md` ordinati per `start_date` desc | nascosta se 0 entries |
| 8 | Contact | `site.json` | sempre |

**Regola**: sezione vuota = sezione assente, ANCHE dal nav. Nessun "Coming soon" placeholder.

**About — struttura interna**

About contiene una bio narrativa breve (markdown da `bio/main.md`) seguita da una serie di blocchi compatti di "fact sheet":

- **Academic positions** (da `site.affiliations`) — lista timeline desc
- **Education** (da `site.education`) — lista timeline desc, con thesis title in italic se presente
- **Editorial roles** (da `site.editorial_roles`) — opzionale, lista
- **Memberships** (da `site.memberships` + `site.project_memberships`) — due sotto-liste se entrambe presenti
- **Peer review** (da `site.peer_review_for`) — inline "Reviewer for *X*, *Y*, *Z*."

Ogni blocco ha label uppercase muted come titolo, lista compatta sotto. Layout 2-col su desktop (label sinistra, lista destra), single col su mobile.

### 4.3 Navigazione

- Header sticky top, height 56px, background paper con `backdrop-filter: blur(8px)`
- Anchor links solo alle sezioni visibili (calcolati al build)
- Scrollspy: la sezione corrente è evidenziata (~30 righe vanilla JS)
- Nome filosofo top-left = anchor a `#top`
- Mobile (≤720px): nav compatta inline se ≤5 voci, hamburger se più

### 4.4 Componenti Astro

```
src/components/
├── Nav.astro                       header sticky + anchor links visibili
├── Hero.astro                      nome, ruolo, tagline, tags, social, foto
├── About.astro                     bio + fact-sheet blocks
├── AboutFactBlock.astro            label + lista compatta (positions/education/etc)
├── ResearchSection.astro           iteratore condizionale
├── ResearchCard.astro              una research area
├── NewsSection.astro               iteratore condizionale
├── NewsItem.astro                  una entry
├── PublicationsSection.astro       raggruppata per status
├── PublicationItem.astro           con <details> per abstract/bibtex
├── TalksSection.astro              iteratore
├── TalkItem.astro                  una entry, con link video/slides opzionali
├── OrganizedEventsSection.astro    iteratore
├── OrganizedEventItem.astro        una entry
├── Contact.astro                   email + social + CV
├── TagChip.astro                   riusabile
└── Footer.astro                    copyright, link /admin/, edited timestamp
```

Tutto Astro statico. Unico JS client-side: scrollspy del nav + scroll smooth + toggle hamburger mobile.

### 4.5 Flussi

**Visitatore**: atterra → vede Hero → scroll lineare o anchor click → CV scaricabile dal Contact. No registrazione, no cookie, no tracking di default.

**Filosofo (editor)**:
1. Visita `/admin/`
2. Login GitHub (Alberto l'ha aggiunto come collaborator)
3. Sidebar Sveltia: Site Info, Bio, Research, News, Publications, Talks
4. Compila/modifica → Publish
5. Sveltia commit su `main` via GitHub API
6. Netlify webhook → build → live in ~30s

**Alberto (dev)**:
1. Modifiche locali → `npm run dev` → verifica → `git push`
2. Per cambiare schema CMS: edit `public/admin/config.yml` E `src/content/config.ts` insieme
3. Build fail per validation = messaggio chiaro nei log Netlify, sito precedente live

## 5. Design system

### 5.1 Palette (cool, dalla scelta D)

```css
--paper:        #f6f6f4   /* background */
--surface:      #ffffff   /* card/chip background */
--ink:          #15171a   /* testo primario */
--muted:        #6b7178   /* testo secondario, nav, metadata */
--rule:         #d4d6da   /* linee, bordi */
--accent:       #1d4ed8   /* blu cool: link, emphasis */
--accent-soft:  #eff3ff   /* background entry pinned/news */
--status-forth: #b45309   /* ambra per "Forthcoming" badge */
--status-review:#6b7178   /* gray per "Under review" badge */
```

Tutto WCAG AA su pair ink/paper e accent/paper. No shadow drammatici, no gradienti.

### 5.2 Tipografia

| Ruolo | Font | Note |
|---|---|---|
| Display | **Fraunces** | Variable font Google (SIL OFL). Usata per nome filosofo, titoli di sezione, italic per emphasis nel tagline. |
| Body | **Inter** | Variable font Google (SIL OFL). Usata per body, nav, metadata. |

Entrambe self-hostate in `public/fonts/`, scaricate al build da uno script `scripts/fetch-fonts.mjs`. Preload solo i weight effettivamente usati. **Zero fetch a Google Fonts a runtime, zero tracking.**

### 5.3 Type scale

```
xs    11px   nav, labels uppercase, chip
sm    13px   metadata (authors, venue, date)
base  15px   body
md    17px   intro tagline
lg    20px   section sub-titles
xl    28px   section titles (Fraunces, w500)
2xl   36px   mid-display
3xl   52px   nome filosofo nell'hero (Fraunces, w500, ls -0.02em, lh 0.95)
```

### 5.4 Spacing

Base 4px: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`. Esposta come `--space-1`…`--space-9`. Gutter responsive: `clamp(20px, 4vw, 40px)`.

### 5.5 Containers

```
--max-narrow:  680px    /* hero focus */
--max-content: 920px    /* sezioni della single-page */
--max-prose:   65ch     /* bio markdown */
```

Single column nella maggior parte. Unico break a 2-col: hero su desktop (testo a sinistra, foto opzionale a destra).

### 5.6 Specifica componenti

- **TagChip**: surface bg + border `rule` 1px, radius **2px (square)**, padding 4×10, Inter 11px ink. *Preserva il case scritto* (nessun lowercase forzato).
- **Section header**: piccola label uppercase muted, title Fraunces 28px w500, regola sottile sotto (`border-bottom: 1px solid var(--rule)`).
- **PublicationItem**: title Inter 16/500, meta line `Authors · Venue · Year` (venue italic se rivista), status badge inline condizionale (`forthcoming`/`under-contract` ambra, `under-review` gray, `in-preparation` muted), action links DOI/PDF/Abstract toggle/BibTeX toggle in small. Abstract e BibTeX in `<details>` `open=false`. Eventuale `coauthors_note` in italic sotto la meta line.
- **TalkItem**: title 15/500, venue + location + date, type chip a destra (`invited` evidenziato), slides + video links opzionali a destra.
- **OrganizedEventItem**: title 15/500, venue + location, range date (`start_date` – `end_date` se presente), role chip a destra, eventuale `co_organizers` in italic muted sotto.
- **ResearchCard**: title Fraunces 18 w500, summary 14, body markdown opzionale expandable inline. No background fill — solo separatore tra cards.
- **NewsItem**: se `pinned`: bg `accent-soft`, lieve indent. Altrimenti standard. Title 15/500, date metadata, summary 14.
- **Nav**: sticky, blur backdrop, links Inter 12px muted con highlight ink+underline alla sezione corrente.

### 5.7 Foto profilo

- Hero destra desktop (max 280×280), sotto nome su mobile
- Astro `<Image>` per webp + responsive widths
- Caption: `photo_credit` field, sotto in serif italic 11px muted

### 5.8 Comportamenti UI

- Smooth scroll su anchor click
- Hover su link: transition `color` 150ms
- `<details>` espandibili senza animazione (default browser)
- Nessun fade-in al scroll, nessun parallax

### 5.9 Performance budget

- Page weight target: **< 200kb** senza foto, **< 500kb** con foto ottimizzata
- Font: 1 family serif + 1 sans, ciascuna 1-2 weight max, preload del primario
- Zero Google Fonts CDN, zero analytics di default
- Lighthouse target: 100/100/100/100 verificato manualmente prima del go-live

## 6. Struttura dei file

```
sito-viglions/
├── astro.config.mjs
├── netlify.toml
├── package.json
├── tsconfig.json
├── README.md                     setup locale per Alberto
├── docs/
│   ├── per-il-filosofo.md        guida CMS per il filosofo (EN)
│   ├── domain-setup.md           DNS + email setup (riciclato da sito-francesca)
│   └── superpowers/specs/
│       └── 2026-05-21-sito-viglions-design.md  questo documento
├── public/
│   ├── admin/
│   │   ├── index.html            shell Sveltia CMS
│   │   └── config.yml            schema CMS
│   ├── fonts/                    Fraunces + Inter (variable)
│   ├── files/
│   │   └── cv.pdf                gestito dal CMS
│   └── uploads/                  immagini gestite dal CMS
├── scripts/
│   └── fetch-fonts.mjs           download fonts al build/postinstall
└── src/
    ├── content/
    │   ├── config.ts             Zod schemas (sync con admin/config.yml)
    │   ├── site/info.json        single entry
    │   ├── bio/main.md           single markdown
    │   ├── research/*.md
    │   ├── news/*.md
    │   ├── publications/*.md
    │   ├── talks/*.md
    │   └── organized_events/*.md
    ├── components/               (vedi 4.4)
    ├── layouts/
    │   └── Layout.astro          base layout con <head>, fonts, Nav, Footer
    ├── pages/
    │   ├── index.astro           single-page
    │   └── 404.astro
    └── styles/
        └── global.css            CSS vars, reset, type styles
```

## 7. Workflow CMS

### 7.1 Pannello Sveltia (sidebar order)

```
📄 Site Info          (single entry — info statiche)
✍️  Bio               (single markdown — "About Me")
🧠 Research           (collection)
📢 News               (collection)
📚 Publications       (collection)
🎤 Talks              (collection)
🎪 Organized Events   (collection)
```

Niente "Settings", niente "Media library" separata.

### 7.2 Sync schema

`public/admin/config.yml` (CMS) e `src/content/config.ts` (Astro) devono mutare insieme. Header comment in entrambi:

```yaml
# SYNC: keep schema mirrored with src/content/config.ts
```

```ts
// SYNC: keep schema mirrored with public/admin/config.yml
```

### 7.3 Onboarding di Federico (Alberto, una tantum)

Alberto fa il setup iniziale, popolando il sito con i dati del CV già fornito (così Federico riceve un sito "pieno" e impara a editare modificando dati reali, non da zero). Questo è uno step del piano implementativo (vedi Plan).

Sequenza:
1. Alberto inizializza il repo + setup Astro + Sveltia + Netlify
2. Alberto pre-popolazione contenuti dal CV di Federico:
   - `site.json` completo (affiliations, education, memberships, ecc.)
   - `bio/main.md` (bozza in inglese, da rivedere con Federico)
   - 3 publications + 1 book + 2 edited volumes
   - 19 talks
   - 9 organized events
   - 3-4 research areas
3. Federico crea account su `github.com` (5 min)
4. Alberto: GitHub → repo → Settings → Collaborators → Add `<federico-handle>` con ruolo Write
5. Federico accetta invito via email
6. Alberto invia link `<dominio>/admin/` + screenshot del pannello + lista di task per la prima sessione:
   - Rivedi/correggi **Bio** scritta da Alberto
   - Carica la **foto profilo** in Site Info (con `photo_credit`)
   - Aggiorna eventuali campi di **Site Info** (es. URL ORCID/Scholar)
   - Carica **CV.pdf** aggiornato (può sostituire quello già caricato da Alberto)
7. Alberto standby per le prime ~3 modifiche (chat/call), poi Federico è autonomo

### 7.4 Documentazione per il filosofo

`docs/per-il-filosofo.md` in inglese, 1-2 pagine, contiene:
- Come fare login (screenshot)
- Come aggiungere/modificare ogni tipo di contenuto (screenshot)
- Cosa succede dopo "Publish" (commit su GitHub → Netlify build → live in ~30s)
- **Cosa fare se dopo 2 minuti il sito non riflette le modifiche**: contattare Alberto (il filosofo NON ha accesso al Netlify dashboard; le notifiche di build failure arrivano solo ad Alberto)
- Dove sono i file dei contenuti su GitHub (in caso il filosofo voglia guardare/disaster recovery)

## 8. Deploy e operations

### 8.1 Repository GitHub

- Nome: `AlbyIanna/sito-viglions`
- Default branch: `main`
- Branch protection: nessuna (Sveltia committa direttamente su main)
- Collaborators: Alberto admin, filosofo write

### 8.2 Netlify

`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"
[build.environment]
  NODE_VERSION = "20"
```

- Deploy solo da `main` su context `production`
- Niente preview branches in v1
- Deploy notifications: email a Alberto su build failure
- Forms: disabilitati
- Analytics: differiti (Plausible opzionale se il filosofo vuole)

### 8.3 Dominio

Candidati concreti per Federico Viglione:
- `federicoviglione.com` — più universale, pattern standard accademico internazionale
- `federicoviglione.it` — pubblico primario italiano (al momento la sua affiliazione è italiana)
- `federicoviglione.org` — più frequente per academic personal sites
- `viglione.phil` — TLD `.phil` non esiste; ignorabile
- `viglione.org` — più corto ma confondibile con omonimi

Default da approvare con Federico: **`federicoviglione.com`** (preferenza per la `.com` data la natura internazionale del pubblico). Decisione finale alla prima call con lui.

DNS su **Cloudflare** (gratis, robusto). Stesso pattern di sito-francesca; riciclo `docs/domain-setup.md`.

### 8.4 Email professionale

Opzionale. Se il filosofo vuole `nome@suosito.com`:
- **Google Workspace** ~6€/mese
- Alternativa: lascia l'email universitaria (cambia con i postdoc)

### 8.5 Testing

- **Build check**: `astro check` in CI Netlify. Errori = no deploy.
- **Visual smoke test**: manuale prima del go-live (Alberto).
- **Lighthouse**: target 100/100/100/100 verificato manualmente prima di live.
- **Link check**: non in CI v1; aggiungere `lychee` come GitHub Action se diventa problema.

### 8.6 Osservabilità

- Analytics: non installato di default. **Plausible** consigliato ($9/mese, GDPR-friendly) se il filosofo lo vuole.
- Netlify dashboard: build status, bandwidth — sufficiente per Alberto.
- No Sentry / error tracking (sito statico).

### 8.7 Disaster recovery

- Tutto in git su GitHub. `git clone + npm install + npm run build` = sito ricostruito in <2 min.
- Backup = GitHub stesso. Backup esterno (mirror gitlab) overkill in v1.

## 9. Iterazione futura (fuori scope v1)

Tutte additive — niente del design v1 le blocca.

| Feature | Trigger | Effort stimato |
|---|---|---|
| Auto-import publications da ORCID | Quando i paper > 10 | ~1 giornata |
| Blog / Notes | Richiesta del filosofo | ~1/2 giornata |
| Sezione Teaching | Richiesta del filosofo | ~1/2 giornata |
| i18n (IT/EN) | Se serve pubblico italiano | ~1 giornata |
| `/publications` come pagina separata | Quando i paper rendono la single-page troppo lunga | ~2 ore |
| Plausible Analytics | Richiesta del filosofo | ~1 ora |
| Preview branches Netlify | Quando le modifiche del filosofo diventano rischiose | ~30 min config |

## 10. Riepilogo decisioni chiave

1. **Filosofo**: Federico Viglione (Research Affiliate, Università di Torino).
2. **Stack**: Astro 5 + Sveltia CMS + Netlify (riuso completo da sito-francesca).
3. **Lingua**: inglese unico; titoli di talk in italiano restano nella lingua originale.
4. **Architettura**: single-page con anchor scroll, sezioni condizionali.
5. **Scope sezioni**: Hero + About (con fact-sheet blocks) + Research + News + Publications + Talks + Organized Events + Contact. No Teaching, no Blog in v1.
6. **Estetica**: D (Editorial-tech cool) — paper off-white, Fraunces serif display + Inter sans body, accento blu, tag chip square.
7. **Modello arricchito sulla base del CV reale**: collection `organized_events`, `site.affiliations` + `site.education` + `site.project_memberships` + `site.peer_review_for`, `publications.type=book`, `talks.video_url`.
8. **CV**: PDF statico gestito via CMS, path fisso `/files/cv.pdf`.
9. **News collection** introdotta per "Upcoming fellowship" style Viebahn, con filtro rolling-window per `kind`.
10. **Visibilità condizionale** di tutte le sezioni: collezione vuota = sezione assente.
11. **Dominio candidato**: `federicoviglione.com` (da confermare con Federico).
12. **Onboarding**: Alberto pre-popola tutto dal CV, poi Federico rivede e gestisce in autonomia.
