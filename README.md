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
│   ├── fonts/                 # gitignored; downloaded by scripts/fetch-fonts.mjs at postinstall
│   ├── uploads/               # CMS-uploaded media (photos)
│   ├── favicon.svg
│   └── og-default.jpg
├── scripts/
│   └── fetch-fonts.mjs        # downloads variable woff2 from Google Fonts
├── src/
│   ├── content/
│   │   ├── config.ts          # Astro content collection schemas (SOURCE OF TRUTH for types)
│   │   ├── site/              # 1 JSON entry — name, role, links, projects, theme...
│   │   ├── bio/               # markdown
│   │   ├── publications/      # one md file per publication
│   │   └── talks/             # one md file per talk
│   ├── components/            # Masthead, About, PublicationsSection, ProjectsSection, etc.
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
| `publications` | content (markdown) | many | grouped by `type`, then `year` desc, then `order` |
| `talks` | content (markdown) | many | `date` desc |

The homepage renders `publications` under the **"Research"** heading as a bibliography grouped by type (Books, Journal articles, Book chapters, Edited volumes, Book reviews, Preprints & conference papers). The **Projects** section renders `site.project_memberships`. CV details (academic positions, education, editorial roles, memberships, peer review) were **removed from the site and the CMS** — they live in the CV PDF only; recover the old data from git history if ever needed.

The `news` and `organized_events` collections were removed along with their CMS entries and content files; recover them from git history if they are ever wanted back.

---

## Editor's guide

Federico edits the site through Sveltia CMS at `/admin/`. The full editorial guide lives in [`docs/per-il-filosofo.md`](docs/per-il-filosofo.md) — in Italian, ~10 short sections covering login, adding/editing content, uploading CV and photo, theme settings, and troubleshooting. It references the free Netlify domain (`sito-viglions.netlify.app`) until a custom domain is set up.

Send him that file when onboarding. Don't ask him to learn Markdown beyond what the CMS rich-text editor exposes.

---

## Deploy

- **Hosting:** Netlify (free tier — generous for static sites).
- **Build command:** `npm run build` (from `netlify.toml`).
- **Publish directory:** `dist/`.
- **Branch:** `main` → production. Push to `main` = auto-deploy.
- **Build trigger:** GitHub webhook (Netlify GitHub App installed on the repo). Sveltia commits to GitHub on Publish, Netlify picks it up.
- **Build time:** typically 30–60 s.
- **Editor access:** Federico's CMS login uses **GitHub OAuth** brokered by a dedicated Cloudflare Worker (see "Auth proxy" below). To grant a new editor: add them as a **collaborator with `push` permission** on `AlbyIanna/sito-viglions`. They sign in at `/admin/` with their GitHub account and authorize the OAuth app on first login.

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

## Auth proxy (Cloudflare Worker)

Sveltia CMS is git-based: it commits directly to GitHub via the GitHub API. To do that without each user pasting a personal access token, we use a tiny OAuth proxy — Sveltia's official one, hosted on a free Cloudflare Worker on Alberto's account.

**Current deployment**

- **Worker:** `sveltia-cms-auth` on Cloudflare account `alby.ianna@gmail.com`
- **URL:** `https://sveltia-cms-auth.alby-ianna.workers.dev` (referenced as `base_url` in `public/admin/config.yml`)
- **GitHub OAuth App:** "Sito Viglione CMS" under `AlbyIanna`'s GitHub account
- **Worker secrets** (set via `wrangler secret put`): `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

**Flow at login time:** `/admin/` → user clicks "Sign in with GitHub" → Sveltia opens worker `/auth?provider=github` → worker redirects to `github.com/login/oauth/authorize` → GitHub redirects back to worker `/callback` → worker exchanges code for token → token returned to CMS via `postMessage`.

**Rebuilding the worker from scratch** (e.g. if Alberto loses access, or to migrate to another Cloudflare account):

1. `git clone https://github.com/sveltia/sveltia-cms-auth.git && cd sveltia-cms-auth`
2. `npx wrangler login` (browser OAuth to Cloudflare)
3. `npx wrangler deploy` — note the resulting `https://sveltia-cms-auth.<subdomain>.workers.dev` URL
4. Register a new GitHub OAuth App at https://github.com/settings/applications/new with callback URL `<WORKER_URL>/callback`
5. `npx wrangler secret put GITHUB_CLIENT_ID` (paste interactively) and same for `GITHUB_CLIENT_SECRET`
6. Update `base_url` in `public/admin/config.yml` to the new worker URL, commit, push.

The worker source code is read-only for us — it's vendored from upstream and deployed verbatim. Don't fork unless we need custom behavior (e.g. domain allowlist via `ALLOWED_DOMAINS` env var).

---

## Design tokens

All tokens live in `src/styles/global.css` as CSS custom properties. Tweak there — they propagate site-wide.

**Palettes** ("Classico accademico" design — paper, ink, rules, and accent change together)

Each CMS-selectable palette redefines the full token set via a `:root.palette-*` class. Default (bare `:root`) is **bianca** — white paper `#ffffff`, garnet accent `#8e2340`. Variants: `palette-bordeaux` (cream/`#7c2030`), `palette-blu` (`#1d4ed8`), `palette-foresta` (`#1b5e20`), `palette-ambra` (`#92400e`). Per-palette tokens: `--paper`, `--ink`, `--muted`, `--sub`, `--rule`, `--accent`, `--accent-soft`, `--stripe-a/b`.

**Type scale**

| Token | Value | Typical use |
|---|---|---|
| `--fs-xs` | 11px | Micro labels (group labels, footer) |
| `--fs-sm` | 13px | Metadata, dates, facts |
| `--fs-base` | 15px | UI text |
| `--fs-serif` | 16.5px | Bio prose (Source Serif 4) |
| `--fs-bib` | 16px | Bibliography entries, talk titles |
| `--fs-section` | 24px | Section headings (Fraunces) |
| `--fs-masthead` | clamp 32–40px | Site name in the masthead (theme-controlled) |

**Spacing** (4px base): `--space-1` (4px) → `--space-9` (96px). Stick to the scale; don't introduce one-off values.

**Containers**

- `--max-page` 780px — the single narrow "book page" column everything lives in
- `--gutter` `clamp(20px, 5vw, 32px)` — page-edge padding

**Fonts**

- `--font-display` — Fraunces (variable, serif) for the name + section headings
- `--font-serif` — Source Serif 4 (variable, normal + italic) for bio prose and bibliography
- `--font-body` — Inter (variable, sans) for UI, metadata, buttons
- `--font-mono` — system monospace for dates

All self-hosted from `public/fonts/`. Re-fetch with `npm run fetch-fonts`.

---

## Conventions

- **No CSS framework.** Plain CSS with custom properties — fewer dependencies, easier for future-Alberto to read.
- **Single page.** Everything is composed in `src/pages/index.astro` from section components. No client-side router, no SPA.
- **No JavaScript in the runtime** unless absolutely necessary (the 404 easter egg is the only script).
- **Italian for ops docs (`domain-setup.md`) and editorial docs (`per-il-filosofo.md`)**, English for code.
- **Commit messages:** conventional-ish — `feat:`, `fix:`, `chore:`, `docs:`, `content:`. Lowercase.

---

## When something breaks

- Build fails locally but worked yesterday → re-run `npm install` (Astro often ships breaking minors).
- Build fails on Netlify but works locally → check Node version (Netlify uses `NODE_VERSION` from `netlify.toml`; local uses `.nvmrc`).
- Federico says "I clicked Publish and nothing happened" → check the Netlify build log first (Deploys tab in the Netlify dashboard). If the build failed, the commit landed on GitHub but the deploy didn't.
- CMS UI shows no entries → check `public/admin/config.yml` paths still match `src/content/<collection>/`.
- Fonts not loading in production → `public/fonts/` is **gitignored**; fonts are downloaded at install time by `scripts/fetch-fonts.mjs` (postinstall hook). Netlify runs `npm install` on every build, so they're regenerated. If a font source URL upstream changed, the script will fail — check the build log and update the URL in the script.
- CMS shows "There are errors in the CMS configuration" → schema drift between `public/admin/config.yml` and Sveltia's expected widgets (e.g. the deprecated `date` widget — use `widget: datetime, type: date` instead). The CMS error panel lists each issue.
- CMS login shows "Authentication aborted" / `auth.sveltia.app` cannot be found → the OAuth proxy is misconfigured. Verify `base_url` in `config.yml` matches the live Cloudflare Worker URL and that `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` worker secrets are set (`npx wrangler secret list` from a clone of the worker repo).
