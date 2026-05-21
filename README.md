# sito-viglions

Personal academic website for **Federico Viglione** (philosophy of science — metaphysics of time, philosophy of cosmology, foundations of mathematics).

Static site built with **Astro 5**, content managed by **Sveltia CMS** (Federico edits via a web admin panel — no terminal involved), hosted on **Netlify**.

This README is for **Alberto** — technical maintainer. For Federico (editorial), see [`docs/per-il-filosofo.md`](docs/per-il-filosofo.md). For the deploy/domain runbook, see [`docs/domain-setup.md`](docs/domain-setup.md).

---

## Setup

Requires **Node 20** (pinned in `.nvmrc` and `netlify.toml`).

```bash
nvm use            # picks up .nvmrc
npm install        # also runs postinstall → scripts/fetch-fonts.mjs
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
npm run preview    # serve dist/ locally
npm run check      # astro check (TypeScript + content schemas)
```

The `postinstall` script downloads Fraunces and Inter variable fonts to `public/fonts/`. Re-run manually with `npm run fetch-fonts` if needed.

---

## Project structure

```
sito-viglions/
├── astro.config.mjs           # minimal — no integrations
├── netlify.toml               # build command + cache headers
├── .nvmrc                     # Node 20
├── public/
│   ├── admin/                 # Sveltia CMS shell + config.yml
│   ├── files/cv.pdf           # uploaded via CMS; placeholder until Federico replaces it
│   ├── fonts/                 # fetched by scripts/fetch-fonts.mjs (woff2)
│   ├── uploads/               # CMS-uploaded media (photos)
│   ├── favicon.svg
│   └── og-default.jpg
├── scripts/
│   └── fetch-fonts.mjs        # downloads variable woff2 from Google Fonts
├── src/
│   ├── content/
│   │   ├── config.ts          # Astro content collection schemas (SOURCE OF TRUTH for types)
│   │   ├── site/              # 1 JSON entry — name, role, links, affiliations, education...
│   │   ├── bio/               # markdown
│   │   ├── research/          # one md file per research area
│   │   ├── news/              # one md file per news item (pinned/dated)
│   │   ├── publications/      # one md file per publication
│   │   ├── talks/             # one md file per talk
│   │   └── organized_events/  # one md file per event organized
│   ├── components/            # Hero, About, ResearchSection, NewsSection, etc.
│   ├── layouts/               # Base layout (head, meta, fonts)
│   ├── pages/                 # index.astro (single-page composition) + 404.astro
│   └── styles/global.css      # design tokens + base styles
├── docs/
│   ├── per-il-filosofo.md     # editor's guide (in English) — give this to Federico
│   └── domain-setup.md        # one-shot domain/DNS/email runbook
└── README.md                  # you are here
```

---

## Schema editing — read before you change anything

The site has **two schema files** that must stay in sync:

1. **`src/content/config.ts`** — Astro Zod schemas. Enforced at build time. Source of truth for TypeScript types.
2. **`public/admin/config.yml`** — Sveltia CMS schema. Controls what fields appear in the editor UI.

> **If you change one without changing the other, the build will pass but the CMS will either silently drop fields (UI missing) or accept invalid data (UI permissive but Zod rejects at build).**

Whenever you add/remove/rename a field:

1. Update `src/content/config.ts` (Zod schema).
2. Update `public/admin/config.yml` (CMS widget config) — same field name, compatible widget type.
3. Update any existing content files in `src/content/<collection>/` to match.
4. Run `npm run build` — Zod will fail loudly if any file is inconsistent.
5. Test the CMS UI at `http://localhost:4321/admin/` to confirm the field appears as expected.

The `// SYNC:` comment at the top of `src/content/config.ts` is a reminder for future contributors (and future Alberto).

---

## Content collections — quick reference

| Collection | Type | Cardinality | Sort key |
|---|---|---|---|
| `site` | data (JSON) | 1 entry | n/a |
| `bio` | content (markdown) | 1 entry | n/a |
| `research` | content (markdown) | many | `order` ascending |
| `news` | content (markdown) | many | `date` desc, `pinned` first |
| `publications` | content (markdown) | many | `year` desc, then `order` |
| `talks` | content (markdown) | many | `date` desc |
| `organized_events` | content (markdown) | many | `start_date` desc, then `order` |

News items have a **6-month rolling window**: non-pinned items older than 6 months drop off the homepage automatically. Pinned items stay forever. See `src/components/NewsSection.astro`.

---

## Editor's guide

Federico edits the site through Sveltia CMS at `/admin/`. The full editorial guide lives in [`docs/per-il-filosofo.md`](docs/per-il-filosofo.md) — in English, ~10 short sections covering login, adding/editing content, uploading CV and photo, pinning news, and troubleshooting.

Send him that file when onboarding. Don't ask him to learn Markdown beyond what the CMS rich-text editor exposes.

---

## Deploy

- **Hosting:** Netlify (free tier — generous for static sites).
- **Build command:** `npm run build` (from `netlify.toml`).
- **Publish directory:** `dist/`.
- **Branch:** `main` → production. Push to `main` = auto-deploy.
- **Build trigger:** GitHub webhook. Sveltia commits to GitHub on Publish, Netlify picks it up.
- **Build time:** typically 30–60 s.
- **Identity:** Federico's CMS login uses **Netlify Identity** (gated to his email). Invite him from the Netlify dashboard → Identity tab.

Cache headers (set in `netlify.toml`):

| Path | Cache | Why |
|---|---|---|
| `/fonts/*.woff2` | 1 year, immutable | Self-hosted, filename-versioned by Google Fonts. |
| `/uploads/*` | 1 year, immutable | CMS-uploaded media, filename includes hash. |
| `/files/cv.pdf` | 1 hour | Federico might re-upload, want changes visible quickly. |

---

## Domain

See [`docs/domain-setup.md`](docs/domain-setup.md) for the one-time domain purchase, DNS, and (optional) email setup. Target domain: `federicoviglione.com`.

---

## Design tokens

All tokens live in `src/styles/global.css` as CSS custom properties. Tweak there — they propagate site-wide.

**Palette**

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f6f6f4` | Page background |
| `--surface` | `#ffffff` | Cards, raised surfaces |
| `--ink` | `#15171a` | Body text, headings |
| `--muted` | `#6b7178` | Secondary text, labels |
| `--rule` | `#d4d6da` | Borders, dividers |
| `--accent` | `#1d4ed8` | Links, focus states |
| `--accent-soft` | `#eff3ff` | Tinted backgrounds (tag chips, hover) |
| `--status-forth` | `#b45309` | "Forthcoming" publication chip |
| `--status-review` | `#6b7178` | "Under review" / "In preparation" chip |

**Type scale**

| Token | Value | Typical use |
|---|---|---|
| `--fs-xs` | 11px | Micro labels, captions |
| `--fs-sm` | 13px | Metadata, dates |
| `--fs-base` | 15px | Body |
| `--fs-md` | 17px | Lead paragraphs |
| `--fs-lg` | 20px | Section eyebrows |
| `--fs-xl` | 28px | H3 |
| `--fs-2xl` | 36px | H2 |
| `--fs-3xl` | 52px | Hero name (H1) |

**Spacing** (4px base): `--space-1` (4px) → `--space-10` (128px). Stick to the scale; don't introduce one-off values.

**Containers**

- `--max-narrow` 680px — prose, single-column lists
- `--max-content` 920px — main content width
- `--max-prose` 65ch — long-form bio/abstracts
- `--gutter` `clamp(20px, 4vw, 40px)` — page-edge padding

**Fonts**

- `--font-display` — Fraunces (variable, serif) for headings + name
- `--font-body` — Inter (variable, sans) for body, UI, metadata

Both self-hosted from `public/fonts/`. Re-fetch with `npm run fetch-fonts`.

---

## Conventions

- **No CSS framework.** Plain CSS with custom properties — fewer dependencies, easier for future-Alberto to read.
- **Single page.** Everything is composed in `src/pages/index.astro` from section components. No client-side router, no SPA.
- **No JavaScript in the runtime** unless absolutely necessary (`is:inline` only for the small scrollspy / detail-toggle logic).
- **Italian for ops docs (`domain-setup.md`)**, English for editorial docs (`per-il-filosofo.md`) and code.
- **Commit messages:** conventional-ish — `feat:`, `fix:`, `chore:`, `docs:`, `content:`. Lowercase.

---

## When something breaks

- Build fails locally but worked yesterday → re-run `npm install` (Astro often ships breaking minors).
- Build fails on Netlify but works locally → check Node version (Netlify uses `NODE_VERSION` from `netlify.toml`; local uses `.nvmrc`).
- Federico says "I clicked Publish and nothing happened" → check the Netlify build log first (Deploys tab in the Netlify dashboard). If the build failed, the commit landed on GitHub but the deploy didn't.
- CMS UI shows no entries → check `public/admin/config.yml` paths still match `src/content/<collection>/`.
- Fonts not loading in production → confirm `public/fonts/*.woff2` is committed (they're git-tracked, not gitignored).
