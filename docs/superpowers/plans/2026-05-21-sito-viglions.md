# Sito Viglione Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a personal academic site for philosopher of science Federico Viglione, modeled on sito-francesca, with a Sveltia CMS pannello so he can edit content autonomously.

**Architecture:** Astro 5 static site, content collections (markdown + JSON) validated by Zod, Sveltia CMS as web UI for editing (GitHub OAuth backend, no separate auth infra), Netlify for CI + CDN. Single-page architecture with anchor scroll, sections conditional on content presence. Editorial-tech cool design (Fraunces serif display + Inter sans body, paper off-white background, cool blue accent).

**Tech Stack:** Astro 5, TypeScript, Zod schemas, Sveltia CMS, Netlify, Cloudflare DNS, self-hosted Fraunces+Inter variable fonts.

**Spec:** `docs/superpowers/specs/2026-05-21-sito-viglions-design.md`

**Reference project:** `/Users/albertoiannaccone/Workspace/sito-francesca/` — same stack, already in production. Cross-reference its files for any pattern (layout, admin shell, netlify.toml).

---

## File Map

This is the target file tree at the end of the plan. Each task says which files it creates/modifies.

```
sito-viglions/
├── .gitignore                              [Task 1]
├── .nvmrc                                  [Task 1]
├── astro.config.mjs                        [Task 2]
├── netlify.toml                            [Task 33]
├── package.json                            [Task 1]
├── tsconfig.json                           [Task 2]
├── README.md                               [Task 35]
├── docs/
│   ├── per-il-filosofo.md                  [Task 36]
│   ├── domain-setup.md                     [Task 37]
│   └── superpowers/                        (already exists)
├── public/
│   ├── admin/
│   │   ├── index.html                      [Task 27]
│   │   └── config.yml                      [Task 28]
│   ├── fonts/
│   │   ├── Fraunces-VariableFont.woff2     [Task 4]
│   │   └── InterVariable.woff2             [Task 4]
│   ├── files/
│   │   └── cv.pdf                          [Task 34, placeholder until Federico uploads]
│   ├── uploads/                            (empty, populated via CMS)
│   ├── favicon.svg                         [Task 3]
│   └── og-default.jpg                      [Task 3, placeholder]
├── scripts/
│   └── fetch-fonts.mjs                     [Task 4]
└── src/
    ├── content/
    │   ├── config.ts                       [Tasks 5-11]
    │   ├── site/info.json                  [Task 29]
    │   ├── bio/main.md                     [Task 29]
    │   ├── research/*.md                   [Task 30]
    │   ├── news/*.md                       [Task 31, empty initially]
    │   ├── publications/*.md               [Task 31]
    │   ├── talks/*.md                      [Task 32]
    │   └── organized_events/*.md           [Task 32]
    ├── components/
    │   ├── Nav.astro                       [Task 13]
    │   ├── Footer.astro                    [Task 14]
    │   ├── TagChip.astro                   [Task 12]
    │   ├── Hero.astro                      [Task 15]
    │   ├── About.astro                     [Task 17]
    │   ├── AboutFactBlock.astro            [Task 16]
    │   ├── ResearchSection.astro           [Task 18]
    │   ├── ResearchCard.astro              [Task 18]
    │   ├── NewsSection.astro               [Task 19]
    │   ├── NewsItem.astro                  [Task 19]
    │   ├── PublicationsSection.astro       [Task 20]
    │   ├── PublicationItem.astro           [Task 20]
    │   ├── TalksSection.astro              [Task 21]
    │   ├── TalkItem.astro                  [Task 21]
    │   ├── OrganizedEventsSection.astro    [Task 22]
    │   ├── OrganizedEventItem.astro        [Task 22]
    │   └── Contact.astro                   [Task 23]
    ├── layouts/
    │   └── Layout.astro                    [Task 3]
    ├── pages/
    │   ├── index.astro                     [Task 24]
    │   └── 404.astro                       [Task 25]
    └── styles/
        └── global.css                      [Task 3]
```

---

## Testing strategy

This is a static site with content collections. Tests are:
- **Schema validation** = `npm run check` (Astro's `astro check` + Zod validation). Failing input rejects, valid input passes.
- **Build** = `npm run build` produces clean `dist/`.
- **Visual smoke** = `npm run dev` + open `http://localhost:4321/`, verify each section renders.
- **Lighthouse** = manual pre-go-live audit, target 100/100/100/100.

No Vitest/Jest harness for component logic — Astro components are largely declarative, the value of unit-testing them is low. We test the contract (schemas accept/reject correctly, page builds, page renders).

---

## Phase 1: Foundation

### Task 1: Initialize project

**Files:**
- Create: `package.json`, `.gitignore`, `.nvmrc`

- [ ] **Step 1: Init git + Node version pin**

```bash
cd /Users/albertoiannaccone/Workspace/sito-viglions
git init
echo "20" > .nvmrc
```

- [ ] **Step 2: Create `.gitignore`**

```gitignore
dist/
node_modules/
.env
.env.*
!.env.example
.DS_Store
.astro/
.netlify/
.superpowers/
.claude/worktrees/
```

- [ ] **Step 3: Create `package.json`**

```json
{
  "name": "sito-viglions",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "fetch-fonts": "node scripts/fetch-fonts.mjs",
    "postinstall": "node scripts/fetch-fonts.mjs"
  },
  "dependencies": {
    "astro": "^5.7.0",
    "sharp": "^0.33.5"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "typescript": "^5.7.3"
  }
}
```

Note: `postinstall` hook auto-fetches fonts on `npm install`. Task 4 creates the script — leave it as a placeholder for now (script will be written in Task 4; until then the postinstall will fail at install time, so DON'T run npm install until Task 4 completes).

- [ ] **Step 4: Commit**

```bash
git add .gitignore .nvmrc package.json
git commit -m "chore: init repo, package.json, gitignore, nvmrc"
```

---

### Task 2: Astro + TypeScript config

**Files:**
- Create: `astro.config.mjs`, `tsconfig.json`

- [ ] **Step 1: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://federicoviglione.com',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
});
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strictNullChecks": true,
    "allowJs": true
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs tsconfig.json
git commit -m "chore: add astro + ts config"
```

---

### Task 3: Base layout + global styles

**Files:**
- Create: `src/layouts/Layout.astro`, `src/styles/global.css`, `public/favicon.svg`

- [ ] **Step 1: Create `src/styles/global.css` with design tokens**

```css
/* ============================================
   CSS RESET (minimal, modern)
   ============================================ */
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
body { line-height: 1.55; -webkit-font-smoothing: antialiased; }
img, picture, video, canvas, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; }
p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }

/* ============================================
   DESIGN TOKENS (Editorial-tech cool, variant D)
   ============================================ */
:root {
  /* Palette */
  --paper:          #f6f6f4;
  --surface:        #ffffff;
  --ink:            #15171a;
  --muted:          #6b7178;
  --rule:           #d4d6da;
  --accent:         #1d4ed8;
  --accent-soft:    #eff3ff;
  --status-forth:   #b45309;
  --status-review:  #6b7178;

  /* Spacing scale (base 4px) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
  --space-10: 128px;

  /* Type scale */
  --fs-xs: 11px;
  --fs-sm: 13px;
  --fs-base: 15px;
  --fs-md: 17px;
  --fs-lg: 20px;
  --fs-xl: 28px;
  --fs-2xl: 36px;
  --fs-3xl: 52px;

  /* Containers */
  --max-narrow: 680px;
  --max-content: 920px;
  --max-prose: 65ch;
  --gutter: clamp(20px, 4vw, 40px);

  /* Fonts */
  --font-display: 'Fraunces', 'Times New Roman', Georgia, serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
}

/* ============================================
   FONT FACES (self-hosted, see scripts/fetch-fonts.mjs)
   ============================================ */
@font-face {
  font-family: 'Fraunces';
  src: url('/fonts/Fraunces-VariableFont.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Inter';
  src: url('/fonts/InterVariable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

/* ============================================
   BASE
   ============================================ */
html, body {
  background: var(--paper);
  color: var(--ink);
}
body {
  font-family: var(--font-body);
  font-size: var(--fs-base);
}
a {
  color: var(--accent);
  text-decoration: none;
  transition: color 150ms ease;
}
a:hover { color: var(--ink); }

::selection { background: var(--accent); color: var(--paper); }

/* Utility */
.container { max-width: var(--max-content); margin: 0 auto; padding-inline: var(--gutter); }
.label {
  font-size: var(--fs-xs);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--muted);
}
.section-title {
  font-family: var(--font-display);
  font-size: var(--fs-xl);
  font-weight: 500;
  letter-spacing: -0.01em;
}
```

- [ ] **Step 2: Create minimal SVG favicon**

```bash
cat > public/favicon.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#f6f6f4"/>
  <text x="16" y="23" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="600" fill="#15171a">V</text>
</svg>
EOF
```

- [ ] **Step 3: Create `src/layouts/Layout.astro`**

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const {
  title,
  description = "Personal site of Federico Viglione, philosopher of science.",
  ogImage = '/og-default.jpg',
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalURL} />

    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, Astro.site)} />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />

    <link rel="preload" href="/fonts/Fraunces-VariableFont.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/InterVariable.woff2" as="font" type="font/woff2" crossorigin />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Layout.astro src/styles/global.css public/favicon.svg
git commit -m "feat: base layout + design tokens (paper, ink, accent, fonts)"
```

---

### Task 4: Self-hosted fonts script

**Files:**
- Create: `scripts/fetch-fonts.mjs`
- Result: `public/fonts/Fraunces-VariableFont.woff2`, `public/fonts/InterVariable.woff2`

These two fonts are SIL OFL licensed and freely redistributable. Script downloads them from the official GitHub releases at build/install time, no CDN at runtime.

- [ ] **Step 1: Write the script**

```js
// scripts/fetch-fonts.mjs
import { writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = join(__dirname, '..', 'public', 'fonts');

const FONTS = [
  {
    name: 'Fraunces-VariableFont.woff2',
    url: 'https://github.com/undercasetype/Fraunces/raw/main/fonts/variable/Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.woff2',
  },
  {
    name: 'InterVariable.woff2',
    url: 'https://github.com/rsms/inter/raw/master/docs/font-files/InterVariable.woff2',
  },
];

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function download(url, dest) {
  console.log(`  → fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log(`  ✓ saved ${dest} (${(buf.length / 1024).toFixed(1)} KB)`);
}

await mkdir(FONTS_DIR, { recursive: true });

for (const f of FONTS) {
  const dest = join(FONTS_DIR, f.name);
  if (await exists(dest)) {
    console.log(`✓ ${f.name} already present, skipping`);
    continue;
  }
  await download(f.url, dest);
}

console.log('Done.');
```

- [ ] **Step 2: Add `public/fonts/` to gitignore (fonts are derived artifacts)**

Edit `.gitignore`, append:
```
public/fonts/
```

- [ ] **Step 3: Run the script + npm install**

```bash
npm install
```

Expected: `postinstall` triggers `fetch-fonts.mjs`, two files appear in `public/fonts/`. If the GitHub URLs fail, find alternative mirrors (e.g. fontsource.org) and update the script.

- [ ] **Step 4: Verify files exist**

```bash
ls -la public/fonts/
```

Expected: `Fraunces-VariableFont.woff2` (~500KB) and `InterVariable.woff2` (~300KB).

- [ ] **Step 5: Test build**

```bash
npm run build
```

Expected: build succeeds, no font 404s in output.

- [ ] **Step 6: Commit**

```bash
git add scripts/fetch-fonts.mjs .gitignore package.json package-lock.json
git commit -m "feat: self-host Fraunces + Inter variable fonts via fetch script"
```

---

## Phase 2: Content schemas

For each schema task, the workflow is:
1. Create a sample content file with all fields populated (acts as fixture).
2. Run `npm run check` — expected: it fails because the schema doesn't exist yet OR the collection isn't registered.
3. Write the Zod schema in `src/content/config.ts`.
4. Run `npm run check` — expected: passes.
5. Commit.

`src/content/config.ts` accumulates collections across these tasks. The file is created in Task 5 and appended in Tasks 6-11.

### Task 5: `site` schema

**Files:**
- Create: `src/content/config.ts`, `src/content/site/info.json`

- [ ] **Step 1: Create sample `src/content/site/info.json`**

```json
{
  "name": "Federico Viglione",
  "role": "Research Affiliate, Philosophy of Science",
  "affiliation": "Università degli Studi di Torino",
  "location": "Turin, Italy",
  "tagline": "Working on the metaphysics of time, the philosophy of cosmology, and the foundations of mathematics.",
  "research_tags": ["time", "cosmology", "metaphysics", "mathematics"],
  "email": "federico.viglione@unimi.it",
  "orcid_url": "",
  "scholar_url": "",
  "philpeople_url": "",
  "academia_url": "",
  "github_url": "",
  "photo": "",
  "photo_credit": "",
  "cv_pdf": "/files/cv.pdf",
  "affiliations": [
    { "period": "2026–present", "role": "Research Affiliate (Cultore della Materia)", "institution": "Università degli Studi di Torino", "location": "Turin, Italy", "current": true },
    { "period": "2023–2025", "role": "Postdoctoral Fellow", "institution": "Università degli Studi di Milano", "location": "Milan, Italy" },
    { "period": "2018–2022", "role": "Predoctoral Researcher", "institution": "Universitat Autònoma de Barcelona", "location": "Barcelona, Spain" }
  ],
  "education": [
    { "period": "2018–2022", "degree": "PhD in Philosophy", "institution": "Universitat Autònoma de Barcelona", "location": "Barcelona, Spain", "thesis_title": "Time and Chances before the Changing Universe. A Metaphysical Inquiry", "supervisors": "Silvia De Bianchi; Giuliano Torrengo", "grade": "Cum laude" },
    { "period": "2015–2018", "degree": "Laurea magistrale in Philosophy", "institution": "Università degli Studi di Torino", "location": "Turin, Italy", "thesis_title": "Did time and world begin? Contemporary philosophical perspectives", "supervisors": "Vincenzo Crupi; Giuliano Torrengo", "grade": "110/110 e lode" },
    { "period": "2011–2015", "degree": "Laurea triennale in Philosophy", "institution": "Università degli Studi di Torino", "location": "Turin, Italy" }
  ],
  "editorial_roles": [],
  "memberships": [
    { "name": "European Philosophy of Science Association", "period": "2025–2027" },
    { "name": "American Philosophical Association", "period": "2025–2026" },
    { "name": "Philosophy of Time Society", "period": "2024–present" },
    { "name": "Centre for the Philosophy of Time", "period": "2018–present" }
  ],
  "project_memberships": [
    { "name": "COSMOS: History & Philosophy of Cosmology Network", "period": "2023–present" },
    { "name": "CHRONOS: Rethinking and Communicating Time", "period": "2020–2024" },
    { "name": "PROTEUS: Paradoxes and Metaphors of Time in Early Universe(s) (ERC Starting Grant)", "period": "2018–2023" }
  ],
  "peer_review_for": ["Mind", "Synthese", "Journal for General Philosophy of Science", "Studies in History and Philosophy of Science"]
}
```

- [ ] **Step 2: Create `src/content/config.ts` with `site` schema**

```ts
// SYNC: keep schema mirrored with public/admin/config.yml
import { defineCollection, z } from 'astro:content';

const siteCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    affiliation: z.string(),
    location: z.string().optional(),
    tagline: z.string(),
    research_tags: z.array(z.string()).max(6),
    email: z.string().email(),
    orcid_url: z.string().url().or(z.literal('')).optional(),
    scholar_url: z.string().url().or(z.literal('')).optional(),
    philpeople_url: z.string().url().or(z.literal('')).optional(),
    academia_url: z.string().url().or(z.literal('')).optional(),
    github_url: z.string().url().or(z.literal('')).optional(),
    photo: z.string().optional(),
    photo_credit: z.string().optional(),
    cv_pdf: z.string().optional(),
    affiliations: z.array(z.object({
      period: z.string(),
      role: z.string(),
      institution: z.string(),
      location: z.string().optional(),
      current: z.boolean().optional(),
    })).optional(),
    education: z.array(z.object({
      period: z.string(),
      degree: z.string(),
      institution: z.string(),
      location: z.string().optional(),
      thesis_title: z.string().optional(),
      supervisors: z.string().optional(),
      grade: z.string().optional(),
    })).optional(),
    editorial_roles: z.array(z.object({
      journal: z.string(),
      role: z.string(),
      url: z.string().url().optional(),
    })).optional(),
    memberships: z.array(z.object({
      name: z.string(),
      role: z.string().optional(),
      period: z.string().optional(),
      url: z.string().url().optional(),
    })).optional(),
    project_memberships: z.array(z.object({
      name: z.string(),
      period: z.string(),
      role: z.string().optional(),
      url: z.string().url().optional(),
    })).optional(),
    peer_review_for: z.array(z.string()).optional(),
  }),
});

export const collections = {
  site: siteCollection,
};
```

- [ ] **Step 3: Run `npm run check`**

```bash
npm run check
```

Expected: passes (or warns about unused; no schema errors on the JSON).

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/site/info.json
git commit -m "feat: site data collection schema + Federico's info"
```

---

### Task 6: `bio` schema

**Files:**
- Modify: `src/content/config.ts`
- Create: `src/content/bio/main.md`

- [ ] **Step 1: Create `src/content/bio/main.md` with sample content**

```markdown
---
title: "About"
---

I am a philosopher of science working on the metaphysics of time, the philosophy of cosmology, and adjacent questions in the philosophy of mathematics and religion. My current work focuses on cosmic simultaneity, the traversal of the infinite, and the metaphysical structure of early-universe cosmology.

I am currently a Research Affiliate (Cultore della Materia) at the Department of Philosophy, Università degli Studi di Torino. Before that I held a Postdoctoral Fellowship at the Università degli Studi di Milano (2023–2025) and a Predoctoral Researcher position at Universitat Autònoma de Barcelona (2018–2022), where I completed my PhD.
```

- [ ] **Step 2: Append bio collection to `src/content/config.ts`**

In the imports, no change. Above `export const collections`, add:

```ts
const bioCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
  }),
});
```

Update the `collections` export:

```ts
export const collections = {
  site: siteCollection,
  bio: bioCollection,
};
```

- [ ] **Step 3: Run `npm run check`**

```bash
npm run check
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/bio/main.md
git commit -m "feat: bio collection (single markdown entry)"
```

---

### Task 7: `research` schema

**Files:**
- Modify: `src/content/config.ts`
- Create: `src/content/research/idealization.md` (sample)

- [ ] **Step 1: Create sample `src/content/research/idealization.md`**

```markdown
---
title: "Philosophy of cosmology"
summary: "Metaphysical structure of early-universe cosmology, including the role of explanation in cosmological models."
order: 1
---

I work on the philosophical and metaphysical foundations of contemporary cosmology, including the structure of cosmological explanation, the relation between physical models and time, and the role of singularities in scientific representation.
```

- [ ] **Step 2: Append `researchCollection` to `src/content/config.ts`**

Add above `export const collections`:

```ts
const researchCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().default(99),
  }),
});
```

Update collections export to include `research: researchCollection`.

- [ ] **Step 3: Run `npm run check`**

```bash
npm run check
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/research/idealization.md
git commit -m "feat: research collection"
```

---

### Task 8: `news` schema

**Files:**
- Modify: `src/content/config.ts`
- Create: `src/content/news/.gitkeep` (collection will be populated later)

- [ ] **Step 1: Append `newsCollection` to `src/content/config.ts`**

```ts
const newsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    kind: z.enum(['upcoming', 'recent', 'award', 'visit']),
    summary: z.string(),
    url: z.string().url().optional(),
    pinned: z.boolean().default(false),
  }),
});
```

Update collections export: `news: newsCollection`.

- [ ] **Step 2: Create empty placeholder**

```bash
mkdir -p src/content/news
touch src/content/news/.gitkeep
```

- [ ] **Step 3: Run `npm run check`**

```bash
npm run check
```

Expected: passes (empty collection is allowed).

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/news/.gitkeep
git commit -m "feat: news collection schema"
```

---

### Task 9: `publications` schema

**Files:**
- Modify: `src/content/config.ts`
- Create: `src/content/publications/2026-not-so-absolute-cosmic-simultaneity.md` (sample)

- [ ] **Step 1: Create sample publication**

```markdown
---
title: "Not so Absolute Cosmic Simultaneity"
authors: "Federico Viglione"
year: 2026
venue: "Erkenntnis"
type: "journal-article"
status: "published"
doi: "10.1007/s10670-026-01075-2"
url: "https://doi.org/10.1007/s10670-026-01075-2"
order: 1
---
```

(Empty body; frontmatter only.)

- [ ] **Step 2: Append `publicationsCollection` to `src/content/config.ts`**

```ts
const publicationsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    year: z.number().int().min(1900).max(2100),
    venue: z.string(),
    type: z.enum([
      'journal-article',
      'book',
      'book-chapter',
      'edited-volume',
      'book-review',
      'preprint',
      'conference-paper',
    ]),
    status: z.enum([
      'published',
      'forthcoming',
      'under-review',
      'under-contract',
      'in-preparation',
    ]),
    doi: z.string().optional(),
    url: z.string().url().optional(),
    abstract: z.string().optional(),
    bibtex: z.string().optional(),
    coauthors_note: z.string().optional(),
    order: z.number().default(99),
  }),
});
```

Update collections export.

- [ ] **Step 3: Run `npm run check`**

```bash
npm run check
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/publications/2026-not-so-absolute-cosmic-simultaneity.md
git commit -m "feat: publications collection schema"
```

---

### Task 10: `talks` schema

**Files:**
- Modify: `src/content/config.ts`
- Create: `src/content/talks/2026-03-04-models-of-explanation.md` (sample)

- [ ] **Step 1: Create sample talk**

```markdown
---
title: "Models of Explanation for the Beginning of the Cosmos"
venue: "COSMOS workshop Modeling the Cosmos: Frontiers in Philosophy of Astrophysics and Cosmology"
location: "Milan, Italy"
date: 2026-03-04
type: "contributed"
---
```

- [ ] **Step 2: Append `talksCollection` to `src/content/config.ts`**

```ts
const talksCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    venue: z.string(),
    location: z.string().optional(),
    date: z.coerce.date(),
    type: z.enum(['invited', 'contributed', 'keynote', 'seminar', 'workshop']),
    url: z.string().url().optional(),
    slides_url: z.string().url().optional(),
    video_url: z.string().url().optional(),
    abstract: z.string().optional(),
  }),
});
```

Update collections export.

- [ ] **Step 3: Run `npm run check`**

```bash
npm run check
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/talks/2026-03-04-models-of-explanation.md
git commit -m "feat: talks collection schema"
```

---

### Task 11: `organized_events` schema

**Files:**
- Modify: `src/content/config.ts`
- Create: `src/content/organized_events/2026-03-modeling-the-cosmos.md` (sample)

- [ ] **Step 1: Create sample event**

```markdown
---
title: "Modeling the Cosmos: Frontiers in Philosophy of Astrophysics and Cosmology"
role: "organizer"
venue: "Università degli Studi di Milano"
location: "Milan, Italy"
start_date: 2026-03-03
end_date: 2026-03-04
url: "https://cosmosproject.unimi.it/2025/10/24/modeling-the-cosmos-frontiers-in-philosophy-of-astrophysics-and-cosmology/"
order: 1
---
```

- [ ] **Step 2: Append `organizedEventsCollection` to `src/content/config.ts`**

```ts
const organizedEventsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    role: z.enum(['organizer', 'co-organizer', 'program-committee', 'coordinator', 'committee-member']),
    venue: z.string(),
    location: z.string().optional(),
    start_date: z.coerce.date(),
    end_date: z.coerce.date().optional(),
    url: z.string().url().optional(),
    co_organizers: z.string().optional(),
    description: z.string().optional(),
    order: z.number().default(99),
  }),
});
```

Update collections export. **Note**: collection key uses kebab-case in Astro convention, but folder name `organized_events` (snake_case) matches our spec — Astro infers folder name from key. Use key `'organized_events'`:

```ts
export const collections = {
  site: siteCollection,
  bio: bioCollection,
  research: researchCollection,
  news: newsCollection,
  publications: publicationsCollection,
  talks: talksCollection,
  organized_events: organizedEventsCollection,
};
```

- [ ] **Step 3: Run `npm run check`**

```bash
npm run check
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/organized_events/2026-03-modeling-the-cosmos.md
git commit -m "feat: organized_events collection schema"
```

---

## Phase 3: Components

Each component task: write the component, integrate it into a temporary `index.astro` (or update existing), run dev server, eyeball it, commit. Components are tiny — most are 50-120 lines including scoped CSS.

### Task 12: TagChip

**Files:**
- Create: `src/components/TagChip.astro`

- [ ] **Step 1: Write component**

```astro
---
interface Props {
  label: string;
  href?: string;
}
const { label, href } = Astro.props;
const Tag = href ? 'a' : 'span';
---
<Tag class="chip" {...(href ? { href } : {})}>{label}</Tag>

<style>
  .chip {
    display: inline-block;
    background: var(--surface);
    border: 1px solid var(--rule);
    border-radius: 2px;
    padding: 4px 10px;
    font-size: var(--fs-xs);
    color: var(--ink);
    transition: border-color 150ms ease;
  }
  a.chip:hover { border-color: var(--accent); }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TagChip.astro
git commit -m "feat: TagChip component"
```

---

### Task 13: Nav (sticky + scrollspy)

**Files:**
- Create: `src/components/Nav.astro`

Nav receives a list of visible section ids+labels (from index.astro at build time) and renders them.

- [ ] **Step 1: Write component**

```astro
---
import { getEntry } from 'astro:content';
interface NavItem { id: string; label: string; }
interface Props {
  items: NavItem[];
  siteName: string;
}
const { items, siteName } = Astro.props;
---
<header class="nav">
  <div class="nav-inner">
    <a href="#top" class="brand">{siteName}</a>
    <nav>
      <ul>
        {items.map(item => (
          <li><a href={`#${item.id}`} data-target={item.id}>{item.label}</a></li>
        ))}
      </ul>
    </nav>
  </div>
</header>

<script>
  const links = document.querySelectorAll<HTMLAnchorElement>('.nav nav a[data-target]');
  const sections = Array.from(links).map(a => document.getElementById(a.dataset.target!)).filter(Boolean) as HTMLElement[];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(a => a.classList.toggle('active', a.dataset.target === id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
</script>

<style>
  .nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: color-mix(in srgb, var(--paper) 88%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--rule);
  }
  .nav-inner {
    max-width: var(--max-content);
    margin: 0 auto;
    padding: var(--space-3) var(--gutter);
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-5);
  }
  .brand {
    font-family: var(--font-display);
    font-style: italic;
    font-size: var(--fs-sm);
    color: var(--ink);
    letter-spacing: 0.02em;
  }
  nav ul {
    list-style: none;
    display: flex;
    gap: var(--space-5);
  }
  nav a {
    font-size: var(--fs-xs);
    text-transform: lowercase;
    color: var(--muted);
    letter-spacing: 0.04em;
  }
  nav a.active { color: var(--ink); }
  nav a:hover { color: var(--ink); }

  html { scroll-behavior: smooth; scroll-padding-top: 70px; }

  @media (max-width: 720px) {
    nav ul { gap: var(--space-3); flex-wrap: wrap; }
    .nav-inner { flex-direction: column; align-items: stretch; height: auto; padding: var(--space-3) var(--gutter); gap: var(--space-2); }
    .nav-inner .brand { align-self: start; }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Nav.astro
git commit -m "feat: Nav with sticky position and scrollspy"
```

---

### Task 14: Footer

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Write component**

```astro
---
interface Props {
  siteName: string;
}
const { siteName } = Astro.props;
const year = new Date().getFullYear();
const built = new Date().toISOString().slice(0, 10);
---
<footer class="footer">
  <div class="footer-inner">
    <span class="copy">© {year} {siteName}</span>
    <span class="meta">
      Last build {built} · <a href="/admin/">admin</a>
    </span>
  </div>
</footer>

<style>
  .footer {
    border-top: 1px solid var(--rule);
    margin-top: var(--space-9);
  }
  .footer-inner {
    max-width: var(--max-content);
    margin: 0 auto;
    padding: var(--space-5) var(--gutter);
    display: flex;
    justify-content: space-between;
    gap: var(--space-4);
    font-size: var(--fs-xs);
    color: var(--muted);
  }
  .footer a { color: inherit; text-decoration: underline; }
  .footer a:hover { color: var(--accent); }

  @media (max-width: 600px) {
    .footer-inner { flex-direction: column; align-items: start; }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: Footer with build timestamp and admin link"
```

---

### Task 15: Hero

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Write component**

```astro
---
import { Image } from 'astro:assets';
import TagChip from './TagChip.astro';

interface SocialLinks {
  email: string;
  orcid_url?: string;
  scholar_url?: string;
  philpeople_url?: string;
  academia_url?: string;
  github_url?: string;
}
interface Props {
  name: string;
  role: string;
  affiliation: string;
  location?: string;
  tagline: string;
  research_tags: string[];
  photo?: string;
  photo_credit?: string;
  social: SocialLinks;
}
const { name, role, affiliation, location, tagline, research_tags, photo, photo_credit, social } = Astro.props;

const socialLinks = [
  social.orcid_url && { label: 'ORCID', href: social.orcid_url },
  social.scholar_url && { label: 'Google Scholar', href: social.scholar_url },
  social.philpeople_url && { label: 'PhilPeople', href: social.philpeople_url },
  social.academia_url && { label: 'Academia.edu', href: social.academia_url },
  social.github_url && { label: 'GitHub', href: social.github_url },
].filter(Boolean) as Array<{ label: string; href: string }>;
---

<section id="top" class="hero container">
  <div class="hero-text">
    <h1 class="name">{name}</h1>
    <p class="role">{role} · {affiliation}{location ? ` · ${location}` : ''}</p>
    <p class="tagline">{tagline}</p>
    <ul class="tags">
      {research_tags.map(t => <li><TagChip label={t} /></li>)}
    </ul>
    <ul class="social">
      <li><a href={`mailto:${social.email}`}>{social.email}</a></li>
      {socialLinks.map(l => <li><a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a></li>)}
    </ul>
  </div>
  {photo && (
    <figure class="hero-photo">
      <img src={photo} alt={`Photo of ${name}`} width={280} height={280} />
      {photo_credit && <figcaption>{photo_credit}</figcaption>}
    </figure>
  )}
</section>

<style>
  .hero {
    padding-block: var(--space-9) var(--space-8);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-7);
    align-items: start;
  }
  .name {
    font-family: var(--font-display);
    font-size: var(--fs-3xl);
    font-weight: 500;
    line-height: 0.95;
    letter-spacing: -0.02em;
    margin-bottom: var(--space-3);
  }
  .role {
    font-size: var(--fs-sm);
    color: var(--muted);
    margin-bottom: var(--space-5);
  }
  .tagline {
    font-size: var(--fs-md);
    max-width: 50ch;
    margin-bottom: var(--space-5);
    line-height: 1.5;
  }
  .tags, .social {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }
  .social { font-size: var(--fs-sm); gap: var(--space-3); align-items: baseline; }
  .social li { color: var(--muted); }
  .social li:not(:last-child)::after { content: '·'; margin-left: var(--space-3); color: var(--rule); }
  .social a { color: var(--ink); border-bottom: 1px dotted var(--rule); }
  .social a:hover { color: var(--accent); border-color: var(--accent); }
  .hero-photo {
    margin: 0;
  }
  .hero-photo img {
    width: 240px;
    height: 240px;
    object-fit: cover;
    border-radius: 2px;
    border: 1px solid var(--rule);
  }
  .hero-photo figcaption {
    margin-top: var(--space-2);
    font-family: var(--font-display);
    font-style: italic;
    font-size: var(--fs-xs);
    color: var(--muted);
    text-align: right;
  }

  @media (max-width: 720px) {
    .hero { grid-template-columns: 1fr; padding-block: var(--space-7) var(--space-6); }
    .name { font-size: var(--fs-2xl); }
    .hero-photo img { width: 180px; height: 180px; }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat: Hero component with name, role, tags, social, photo"
```

---

### Task 16: AboutFactBlock

**Files:**
- Create: `src/components/AboutFactBlock.astro`

Reusable block for fact-sheet items in About (positions, education, etc.).

- [ ] **Step 1: Write component**

```astro
---
interface Props {
  label: string;
}
const { label } = Astro.props;
---
<div class="block">
  <div class="block-label">{label}</div>
  <div class="block-content">
    <slot />
  </div>
</div>

<style>
  .block {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: var(--space-5);
    padding-block: var(--space-4);
    border-top: 1px solid var(--rule);
  }
  .block:last-child { border-bottom: 1px solid var(--rule); }
  .block-label {
    font-size: var(--fs-xs);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--muted);
    padding-top: 4px;
  }
  .block-content {
    font-size: var(--fs-sm);
    line-height: 1.6;
  }
  .block-content :global(ul) { list-style: none; }
  .block-content :global(li) { margin-bottom: var(--space-2); }
  .block-content :global(li:last-child) { margin-bottom: 0; }
  .block-content :global(em) { color: var(--muted); font-style: italic; }
  .block-content :global(.period) { color: var(--muted); font-variant-numeric: tabular-nums; margin-right: var(--space-2); }

  @media (max-width: 720px) {
    .block { grid-template-columns: 1fr; gap: var(--space-2); }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AboutFactBlock.astro
git commit -m "feat: AboutFactBlock for reusable label+list rows"
```

---

### Task 17: About

**Files:**
- Create: `src/components/About.astro`

- [ ] **Step 1: Write component**

```astro
---
import AboutFactBlock from './AboutFactBlock.astro';
import { getEntry } from 'astro:content';

interface Affiliation { period: string; role: string; institution: string; location?: string; current?: boolean; }
interface Education { period: string; degree: string; institution: string; location?: string; thesis_title?: string; supervisors?: string; grade?: string; }
interface EditorialRole { journal: string; role: string; url?: string; }
interface Membership { name: string; role?: string; period?: string; url?: string; }
interface ProjectMembership { name: string; period: string; role?: string; url?: string; }

interface Props {
  bioHtml: string;
  affiliations?: Affiliation[];
  education?: Education[];
  editorial_roles?: EditorialRole[];
  memberships?: Membership[];
  project_memberships?: ProjectMembership[];
  peer_review_for?: string[];
}

const { bioHtml, affiliations, education, editorial_roles, memberships, project_memberships, peer_review_for } = Astro.props;
---

<section id="about" class="about container">
  <header class="section-head">
    <div class="label">About</div>
    <h2 class="section-title">Biography</h2>
  </header>

  <div class="prose" set:html={bioHtml}></div>

  <div class="facts">
    {affiliations && affiliations.length > 0 && (
      <AboutFactBlock label="Academic positions">
        <ul>
          {affiliations.map(a => (
            <li>
              <span class="period">{a.period}</span>
              {a.role}, {a.institution}{a.location ? `, ${a.location}` : ''}
            </li>
          ))}
        </ul>
      </AboutFactBlock>
    )}

    {education && education.length > 0 && (
      <AboutFactBlock label="Education">
        <ul>
          {education.map(e => (
            <li>
              <span class="period">{e.period}</span>
              {e.degree}, {e.institution}{e.location ? `, ${e.location}` : ''}
              {e.thesis_title && <div><em>"{e.thesis_title}"</em>{e.supervisors ? ` — Supervisors: ${e.supervisors}` : ''}{e.grade ? ` (${e.grade})` : ''}</div>}
            </li>
          ))}
        </ul>
      </AboutFactBlock>
    )}

    {editorial_roles && editorial_roles.length > 0 && (
      <AboutFactBlock label="Editorial roles">
        <ul>
          {editorial_roles.map(r => (
            <li>
              {r.role}, {r.url ? <a href={r.url}><em>{r.journal}</em></a> : <em>{r.journal}</em>}
            </li>
          ))}
        </ul>
      </AboutFactBlock>
    )}

    {memberships && memberships.length > 0 && (
      <AboutFactBlock label="Memberships">
        <ul>
          {memberships.map(m => (
            <li>
              {m.period && <span class="period">{m.period}</span>}
              {m.url ? <a href={m.url}>{m.name}</a> : m.name}
              {m.role ? `, ${m.role}` : ''}
            </li>
          ))}
        </ul>
      </AboutFactBlock>
    )}

    {project_memberships && project_memberships.length > 0 && (
      <AboutFactBlock label="Project memberships">
        <ul>
          {project_memberships.map(p => (
            <li>
              <span class="period">{p.period}</span>
              {p.url ? <a href={p.url}>{p.name}</a> : p.name}
              {p.role ? `, ${p.role}` : ''}
            </li>
          ))}
        </ul>
      </AboutFactBlock>
    )}

    {peer_review_for && peer_review_for.length > 0 && (
      <AboutFactBlock label="Peer review">
        <p>Reviewer for {peer_review_for.map((j, i) => (<><em>{j}</em>{i < peer_review_for.length - 1 ? ', ' : '.'}</>))}</p>
      </AboutFactBlock>
    )}
  </div>
</section>

<style>
  .about { padding-block: var(--space-7); }
  .section-head { margin-bottom: var(--space-5); }
  .section-head .label { margin-bottom: var(--space-2); }
  .prose {
    max-width: var(--max-prose);
    margin-bottom: var(--space-7);
    line-height: 1.7;
  }
  .prose :global(p) { margin-bottom: var(--space-4); }
  .facts {
    max-width: var(--max-content);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/About.astro
git commit -m "feat: About section with bio + fact-sheet blocks"
```

---

### Task 18: ResearchCard + ResearchSection

**Files:**
- Create: `src/components/ResearchCard.astro`, `src/components/ResearchSection.astro`

- [ ] **Step 1: Write `ResearchCard.astro`**

```astro
---
interface Props {
  title: string;
  summary: string;
  bodyHtml?: string;
}
const { title, summary, bodyHtml } = Astro.props;
---
<article class="research-card">
  <h3 class="card-title">{title}</h3>
  <p class="card-summary">{summary}</p>
  {bodyHtml && (
    <details class="card-detail">
      <summary>Read more</summary>
      <div set:html={bodyHtml}></div>
    </details>
  )}
</article>

<style>
  .research-card {
    padding-block: var(--space-5);
    border-top: 1px solid var(--rule);
  }
  .research-card:last-child { border-bottom: 1px solid var(--rule); }
  .card-title {
    font-family: var(--font-display);
    font-size: var(--fs-lg);
    font-weight: 500;
    letter-spacing: -0.01em;
    margin-bottom: var(--space-2);
  }
  .card-summary { font-size: var(--fs-sm); color: var(--ink); line-height: 1.6; max-width: var(--max-prose); }
  .card-detail { margin-top: var(--space-3); font-size: var(--fs-sm); }
  .card-detail summary { color: var(--accent); cursor: pointer; font-size: var(--fs-xs); }
  .card-detail > div { margin-top: var(--space-3); line-height: 1.6; }
  .card-detail :global(p) { margin-bottom: var(--space-3); }
</style>
```

- [ ] **Step 2: Write `ResearchSection.astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import ResearchCard from './ResearchCard.astro';

const entries = await getCollection('research');
const sorted = entries.sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));

const rendered = await Promise.all(
  sorted.map(async (e) => {
    const { Content } = await render(e);
    return { data: e.data, Content };
  })
);
---
{sorted.length > 0 && (
  <section id="research" class="research container">
    <header class="section-head">
      <div class="label">Research</div>
      <h2 class="section-title">Areas of work</h2>
    </header>
    <div class="cards">
      {rendered.map(({ data, Content }) => (
        <article class="research-card">
          <h3 class="card-title">{data.title}</h3>
          <p class="card-summary">{data.summary}</p>
          <details class="card-detail">
            <summary>Read more</summary>
            <div class="prose"><Content /></div>
          </details>
        </article>
      ))}
    </div>
  </section>
)}

<style>
  .research { padding-block: var(--space-7); }
  .section-head { margin-bottom: var(--space-4); }
  .section-head .label { margin-bottom: var(--space-2); }
  .research-card { padding-block: var(--space-5); border-top: 1px solid var(--rule); }
  .research-card:last-child { border-bottom: 1px solid var(--rule); }
  .card-title { font-family: var(--font-display); font-size: var(--fs-lg); font-weight: 500; margin-bottom: var(--space-2); }
  .card-summary { font-size: var(--fs-sm); line-height: 1.6; max-width: var(--max-prose); }
  .card-detail { margin-top: var(--space-3); font-size: var(--fs-sm); }
  .card-detail summary { color: var(--accent); cursor: pointer; font-size: var(--fs-xs); }
  .card-detail .prose { margin-top: var(--space-3); line-height: 1.6; }
  .prose :global(p) { margin-bottom: var(--space-3); }
</style>
```

Note: `ResearchCard.astro` from Step 1 ends up unused (logic merged into Section). Delete it after Step 2 to avoid dead code:

```bash
rm src/components/ResearchCard.astro
```

Update the file map mentally: only `ResearchSection.astro` exists.

- [ ] **Step 3: Run `npm run check`**

```bash
npm run check
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/ResearchSection.astro
git commit -m "feat: ResearchSection with conditional render and detail toggle"
```

---

### Task 19: NewsItem + NewsSection

**Files:**
- Create: `src/components/NewsSection.astro`

`NewsItem` logic is merged into `NewsSection` (same pattern as Research). Visibility filter applied at build time.

- [ ] **Step 1: Write `NewsSection.astro`**

```astro
---
import { getCollection } from 'astro:content';

const all = await getCollection('news');
const now = new Date();

function withinDays(date: Date, days: number) {
  const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= -days; // date in the future or within `days` in the past
}

const visible = all.filter(e => {
  if (e.data.pinned) return true;
  const d = e.data.date as Date;
  switch (e.data.kind) {
    case 'upcoming': return d.getTime() >= now.getTime() - 30 * 24 * 60 * 60 * 1000;
    case 'recent':
    case 'visit':   return withinDays(d, 365);
    case 'award':   return withinDays(d, 730);
    default: return false;
  }
});

const sorted = visible.sort((a, b) => {
  if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
  return (b.data.date as Date).getTime() - (a.data.date as Date).getTime();
});

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
---
{sorted.length > 0 && (
  <section id="news" class="news container">
    <header class="section-head">
      <div class="label">News</div>
      <h2 class="section-title">Recent &amp; upcoming</h2>
    </header>
    <ul class="news-list">
      {sorted.map(e => (
        <li class:list={['news-item', { pinned: e.data.pinned }]}>
          <div class="news-meta">
            <span class="date">{fmtDate(e.data.date as Date)}</span>
            <span class="kind">{e.data.kind}</span>
          </div>
          <h3 class="news-title">
            {e.data.url ? <a href={e.data.url} target="_blank" rel="noopener noreferrer">{e.data.title}</a> : e.data.title}
          </h3>
          <p class="news-summary">{e.data.summary}</p>
        </li>
      ))}
    </ul>
  </section>
)}

<style>
  .news { padding-block: var(--space-7); }
  .section-head { margin-bottom: var(--space-4); }
  .section-head .label { margin-bottom: var(--space-2); }
  .news-list { list-style: none; display: grid; gap: var(--space-2); }
  .news-item {
    padding: var(--space-4) var(--space-5);
    border: 1px solid var(--rule);
    border-radius: 2px;
    background: var(--surface);
  }
  .news-item.pinned { background: var(--accent-soft); border-color: color-mix(in srgb, var(--accent) 20%, transparent); }
  .news-meta { display: flex; gap: var(--space-3); font-size: var(--fs-xs); color: var(--muted); margin-bottom: var(--space-2); }
  .news-meta .kind { text-transform: uppercase; letter-spacing: 0.1em; }
  .news-title { font-size: var(--fs-base); font-weight: 500; margin-bottom: var(--space-1); }
  .news-summary { font-size: var(--fs-sm); color: var(--ink); line-height: 1.5; max-width: var(--max-prose); }
</style>
```

- [ ] **Step 2: Run `npm run check`**

```bash
npm run check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/NewsSection.astro
git commit -m "feat: NewsSection with rolling-window visibility filter"
```

---

### Task 20: PublicationItem + PublicationsSection

**Files:**
- Create: `src/components/PublicationItem.astro`, `src/components/PublicationsSection.astro`

- [ ] **Step 1: Write `PublicationItem.astro`**

```astro
---
interface Props {
  title: string;
  authors: string;
  year: number;
  venue: string;
  type: string;
  status: string;
  doi?: string;
  url?: string;
  abstract?: string;
  bibtex?: string;
  coauthors_note?: string;
}
const { title, authors, year, venue, type, status, doi, url, abstract, bibtex, coauthors_note } = Astro.props;

const isJournal = type === 'journal-article' || type === 'book-review';
const showBadge = status !== 'published';
const badgeLabel = {
  forthcoming: 'Forthcoming',
  'under-review': 'Under review',
  'under-contract': 'Under contract',
  'in-preparation': 'In preparation',
}[status] ?? '';
---
<article class="pub">
  <h3 class="pub-title">{title}</h3>
  <p class="pub-meta">
    <span>{authors}</span> ·
    {isJournal ? <em>{venue}</em> : <span>{venue}</span>} ·
    <span>{year}</span>
    {showBadge && <span class:list={['badge', `badge-${status}`]}>{badgeLabel}</span>}
  </p>
  {coauthors_note && <p class="coauthors-note"><em>{coauthors_note}</em></p>}
  <ul class="pub-actions">
    {doi && <li><a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer">DOI</a></li>}
    {url && <li><a href={url} target="_blank" rel="noopener noreferrer">PDF</a></li>}
    {abstract && (
      <li>
        <details class="inline-detail">
          <summary>Abstract</summary>
          <div class="abstract">{abstract}</div>
        </details>
      </li>
    )}
    {bibtex && (
      <li>
        <details class="inline-detail">
          <summary>BibTeX</summary>
          <pre class="bibtex">{bibtex}</pre>
        </details>
      </li>
    )}
  </ul>
</article>

<style>
  .pub {
    padding-block: var(--space-4);
    border-top: 1px solid var(--rule);
  }
  .pub-title { font-size: var(--fs-base); font-weight: 500; margin-bottom: var(--space-2); }
  .pub-meta { font-size: var(--fs-sm); color: var(--muted); display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: baseline; margin-bottom: var(--space-2); }
  .pub-meta > * { color: var(--muted); }
  .pub-meta em { color: var(--ink); }
  .badge { font-size: 10px; padding: 2px 8px; border-radius: 2px; text-transform: uppercase; letter-spacing: 0.08em; }
  .badge-forthcoming, .badge-under-contract { color: var(--status-forth); border: 1px solid var(--status-forth); }
  .badge-under-review, .badge-in-preparation { color: var(--status-review); border: 1px solid var(--rule); }
  .coauthors-note { font-size: var(--fs-sm); color: var(--muted); margin-bottom: var(--space-2); }
  .pub-actions { list-style: none; display: flex; gap: var(--space-4); font-size: var(--fs-xs); }
  .pub-actions a { color: var(--accent); }
  .inline-detail summary { cursor: pointer; color: var(--accent); }
  .abstract { margin-top: var(--space-2); font-size: var(--fs-sm); line-height: 1.5; max-width: var(--max-prose); color: var(--ink); }
  .bibtex {
    margin-top: var(--space-2);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    background: var(--surface);
    border: 1px solid var(--rule);
    padding: var(--space-3);
    overflow-x: auto;
    white-space: pre-wrap;
  }
</style>
```

- [ ] **Step 2: Write `PublicationsSection.astro`**

```astro
---
import { getCollection } from 'astro:content';
import PublicationItem from './PublicationItem.astro';

const all = await getCollection('publications');

const sortByYearDesc = (a: typeof all[number], b: typeof all[number]) => {
  if (a.data.year !== b.data.year) return b.data.year - a.data.year;
  return (a.data.order ?? 99) - (b.data.order ?? 99);
};

const groups = [
  { label: 'Published', status: ['published'] },
  { label: 'Forthcoming', status: ['forthcoming', 'under-contract'] },
  { label: 'Under review', status: ['under-review'] },
  { label: 'In preparation', status: ['in-preparation'] },
];

const visible = groups
  .map(g => ({ ...g, items: all.filter(p => g.status.includes(p.data.status)).sort(sortByYearDesc) }))
  .filter(g => g.items.length > 0);
---
{visible.length > 0 && (
  <section id="publications" class="publications container">
    <header class="section-head">
      <div class="label">Publications</div>
      <h2 class="section-title">Papers, chapters, and books</h2>
    </header>
    {visible.map(g => (
      <div class="pub-group">
        <h3 class="group-label">{g.label}</h3>
        {g.items.map(p => <PublicationItem {...p.data} />)}
      </div>
    ))}
  </section>
)}

<style>
  .publications { padding-block: var(--space-7); }
  .section-head { margin-bottom: var(--space-4); }
  .section-head .label { margin-bottom: var(--space-2); }
  .pub-group { margin-bottom: var(--space-6); }
  .pub-group:last-child { margin-bottom: 0; }
  .group-label {
    font-size: var(--fs-xs);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--muted);
    margin-bottom: var(--space-2);
  }
  .pub-group > :global(article.pub:last-child) { border-bottom: 1px solid var(--rule); }
</style>
```

- [ ] **Step 3: Run `npm run check`**

```bash
npm run check
```

- [ ] **Step 4: Commit**

```bash
git add src/components/PublicationItem.astro src/components/PublicationsSection.astro
git commit -m "feat: Publications section with status grouping and detail toggles"
```

---

### Task 21: TalkItem + TalksSection

**Files:**
- Create: `src/components/TalkItem.astro`, `src/components/TalksSection.astro`

- [ ] **Step 1: Write `TalkItem.astro`**

```astro
---
interface Props {
  title: string;
  venue: string;
  location?: string;
  date: Date;
  type: string;
  url?: string;
  slides_url?: string;
  video_url?: string;
  abstract?: string;
}
const { title, venue, location, date, type, url, slides_url, video_url, abstract } = Astro.props;
const fmt = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
const isInvited = type === 'invited' || type === 'keynote';
---
<article class="talk">
  <div class="talk-row">
    <div class="talk-main">
      <h3 class="talk-title">
        {url ? <a href={url} target="_blank" rel="noopener noreferrer">{title}</a> : title}
      </h3>
      <p class="talk-meta">
        <span>{venue}</span>{location ? <> · <span>{location}</span></> : null} · <span>{fmt}</span>
      </p>
    </div>
    <div class="talk-side">
      <span class:list={['type-chip', { invited: isInvited }]}>{type}</span>
      <ul class="links">
        {slides_url && <li><a href={slides_url} target="_blank" rel="noopener noreferrer">Slides</a></li>}
        {video_url && <li><a href={video_url} target="_blank" rel="noopener noreferrer">Video</a></li>}
      </ul>
    </div>
  </div>
  {abstract && (
    <details class="abstract-toggle">
      <summary>Abstract</summary>
      <p>{abstract}</p>
    </details>
  )}
</article>

<style>
  .talk { padding-block: var(--space-4); border-top: 1px solid var(--rule); }
  .talk-row { display: flex; justify-content: space-between; gap: var(--space-4); align-items: start; }
  .talk-title { font-size: var(--fs-base); font-weight: 500; margin-bottom: var(--space-1); }
  .talk-title a { color: var(--ink); border-bottom: 1px dotted var(--rule); }
  .talk-title a:hover { color: var(--accent); border-color: var(--accent); }
  .talk-meta { font-size: var(--fs-sm); color: var(--muted); }
  .talk-side { text-align: right; display: flex; flex-direction: column; gap: var(--space-2); align-items: flex-end; }
  .type-chip {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    border: 1px solid var(--rule);
    padding: 2px 8px;
    border-radius: 2px;
  }
  .type-chip.invited { color: var(--accent); border-color: var(--accent); }
  .links { list-style: none; display: flex; gap: var(--space-3); font-size: var(--fs-xs); }
  .links a { color: var(--accent); }
  .abstract-toggle { margin-top: var(--space-2); font-size: var(--fs-sm); }
  .abstract-toggle summary { color: var(--accent); cursor: pointer; font-size: var(--fs-xs); }
  .abstract-toggle p { margin-top: var(--space-2); line-height: 1.5; max-width: var(--max-prose); }

  @media (max-width: 600px) {
    .talk-row { flex-direction: column; }
    .talk-side { align-items: flex-start; text-align: left; }
  }
</style>
```

- [ ] **Step 2: Write `TalksSection.astro`**

```astro
---
import { getCollection } from 'astro:content';
import TalkItem from './TalkItem.astro';

const all = await getCollection('talks');
const sorted = all.sort((a, b) => (b.data.date as Date).getTime() - (a.data.date as Date).getTime());
---
{sorted.length > 0 && (
  <section id="talks" class="talks container">
    <header class="section-head">
      <div class="label">Talks</div>
      <h2 class="section-title">Presentations</h2>
    </header>
    <div class="talks-list">
      {sorted.map(t => <TalkItem {...t.data} />)}
    </div>
  </section>
)}

<style>
  .talks { padding-block: var(--space-7); }
  .section-head { margin-bottom: var(--space-4); }
  .section-head .label { margin-bottom: var(--space-2); }
  .talks-list > :global(article.talk:last-child) { border-bottom: 1px solid var(--rule); }
</style>
```

- [ ] **Step 3: Run `npm run check`**

```bash
npm run check
```

- [ ] **Step 4: Commit**

```bash
git add src/components/TalkItem.astro src/components/TalksSection.astro
git commit -m "feat: Talks section with type chip and video/slides links"
```

---

### Task 22: OrganizedEventItem + OrganizedEventsSection

**Files:**
- Create: `src/components/OrganizedEventItem.astro`, `src/components/OrganizedEventsSection.astro`

- [ ] **Step 1: Write `OrganizedEventItem.astro`**

```astro
---
interface Props {
  title: string;
  role: string;
  venue: string;
  location?: string;
  start_date: Date;
  end_date?: Date;
  url?: string;
  co_organizers?: string;
  description?: string;
}
const { title, role, venue, location, start_date, end_date, url, co_organizers, description } = Astro.props;

function fmtRange(start: Date, end?: Date) {
  const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const s = start.toLocaleDateString('en-US', opts);
  if (!end) return s;
  const e = end.toLocaleDateString('en-US', opts);
  return s === e ? s : `${s} – ${e}`;
}
const roleLabel = role.replace('-', ' ');
---
<article class="event">
  <div class="event-row">
    <div class="event-main">
      <h3 class="event-title">
        {url ? <a href={url} target="_blank" rel="noopener noreferrer">{title}</a> : title}
      </h3>
      <p class="event-meta">
        <span>{venue}</span>{location ? <> · <span>{location}</span></> : null} · <span>{fmtRange(start_date, end_date)}</span>
      </p>
      {co_organizers && <p class="co-organizers"><em>{co_organizers}</em></p>}
      {description && <p class="event-description">{description}</p>}
    </div>
    <div class="event-side">
      <span class="role-chip">{roleLabel}</span>
    </div>
  </div>
</article>

<style>
  .event { padding-block: var(--space-4); border-top: 1px solid var(--rule); }
  .event-row { display: flex; justify-content: space-between; gap: var(--space-4); align-items: start; }
  .event-title { font-size: var(--fs-base); font-weight: 500; margin-bottom: var(--space-1); }
  .event-title a { color: var(--ink); border-bottom: 1px dotted var(--rule); }
  .event-title a:hover { color: var(--accent); border-color: var(--accent); }
  .event-meta { font-size: var(--fs-sm); color: var(--muted); }
  .co-organizers { font-size: var(--fs-sm); color: var(--muted); margin-top: var(--space-1); }
  .event-description { font-size: var(--fs-sm); margin-top: var(--space-2); max-width: var(--max-prose); }
  .event-side { text-align: right; }
  .role-chip {
    font-size: 10px;
    text-transform: capitalize;
    letter-spacing: 0.04em;
    color: var(--muted);
    border: 1px solid var(--rule);
    padding: 2px 8px;
    border-radius: 2px;
    white-space: nowrap;
  }

  @media (max-width: 600px) {
    .event-row { flex-direction: column; }
    .event-side { align-self: flex-start; }
  }
</style>
```

- [ ] **Step 2: Write `OrganizedEventsSection.astro`**

```astro
---
import { getCollection } from 'astro:content';
import OrganizedEventItem from './OrganizedEventItem.astro';

const all = await getCollection('organized_events');
const sorted = all.sort((a, b) => (b.data.start_date as Date).getTime() - (a.data.start_date as Date).getTime());
---
{sorted.length > 0 && (
  <section id="organized-events" class="organized container">
    <header class="section-head">
      <div class="label">Organized events</div>
      <h2 class="section-title">Conferences &amp; workshops</h2>
    </header>
    <div class="events-list">
      {sorted.map(e => <OrganizedEventItem {...e.data} />)}
    </div>
  </section>
)}

<style>
  .organized { padding-block: var(--space-7); }
  .section-head { margin-bottom: var(--space-4); }
  .section-head .label { margin-bottom: var(--space-2); }
  .events-list > :global(article.event:last-child) { border-bottom: 1px solid var(--rule); }
</style>
```

- [ ] **Step 3: Run `npm run check`**

```bash
npm run check
```

- [ ] **Step 4: Commit**

```bash
git add src/components/OrganizedEventItem.astro src/components/OrganizedEventsSection.astro
git commit -m "feat: Organized Events section"
```

---

### Task 23: Contact

**Files:**
- Create: `src/components/Contact.astro`

- [ ] **Step 1: Write component**

```astro
---
interface SocialLinks {
  email: string;
  orcid_url?: string;
  scholar_url?: string;
  philpeople_url?: string;
  academia_url?: string;
  github_url?: string;
}
interface Props {
  social: SocialLinks;
  cv_pdf?: string;
}
const { social, cv_pdf } = Astro.props;
const links = [
  social.orcid_url && { label: 'ORCID', href: social.orcid_url },
  social.scholar_url && { label: 'Google Scholar', href: social.scholar_url },
  social.philpeople_url && { label: 'PhilPeople', href: social.philpeople_url },
  social.academia_url && { label: 'Academia.edu', href: social.academia_url },
  social.github_url && { label: 'GitHub', href: social.github_url },
].filter(Boolean) as Array<{ label: string; href: string }>;
---
<section id="contact" class="contact container">
  <header class="section-head">
    <div class="label">Contact</div>
    <h2 class="section-title">Get in touch</h2>
  </header>
  <ul class="contact-list">
    <li><span class="role">Email</span> <a href={`mailto:${social.email}`}>{social.email}</a></li>
    {links.map(l => (
      <li><span class="role">{l.label}</span> <a href={l.href} target="_blank" rel="noopener noreferrer">{l.href}</a></li>
    ))}
    {cv_pdf && <li><span class="role">CV</span> <a href={cv_pdf} target="_blank" rel="noopener noreferrer">Download PDF</a></li>}
  </ul>
</section>

<style>
  .contact { padding-block: var(--space-7) var(--space-9); }
  .section-head { margin-bottom: var(--space-5); }
  .section-head .label { margin-bottom: var(--space-2); }
  .contact-list { list-style: none; display: grid; gap: var(--space-3); font-size: var(--fs-base); max-width: var(--max-prose); }
  .contact-list li { display: grid; grid-template-columns: 140px 1fr; gap: var(--space-4); align-items: baseline; }
  .role { font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: 0.15em; color: var(--muted); }
  .contact-list a { color: var(--ink); border-bottom: 1px dotted var(--rule); }
  .contact-list a:hover { color: var(--accent); border-color: var(--accent); }

  @media (max-width: 600px) {
    .contact-list li { grid-template-columns: 1fr; gap: var(--space-1); }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Contact.astro
git commit -m "feat: Contact section"
```

---

## Phase 4: Pages

### Task 24: `index.astro` — compose the single-page

**Files:**
- Create: `src/pages/index.astro`

This composes all sections, computes which are visible, builds nav items list.

- [ ] **Step 1: Write page**

```astro
---
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import Hero from '../components/Hero.astro';
import About from '../components/About.astro';
import ResearchSection from '../components/ResearchSection.astro';
import NewsSection from '../components/NewsSection.astro';
import PublicationsSection from '../components/PublicationsSection.astro';
import TalksSection from '../components/TalksSection.astro';
import OrganizedEventsSection from '../components/OrganizedEventsSection.astro';
import Contact from '../components/Contact.astro';
import { getEntry, getCollection, render } from 'astro:content';

const site = await getEntry('site', 'info');
if (!site) throw new Error('site/info data entry is missing');

const bio = await getEntry('bio', 'main');
if (!bio) throw new Error('bio/main markdown entry is missing');
const bioRendered = await render(bio);
// We need the rendered HTML string; render returns Component. Instead, we'll pass the markdown rendered to a slot. Simpler: render to HTML via Content component.

const research = await getCollection('research');
const news = await getCollection('news');
const publications = await getCollection('publications');
const talks = await getCollection('talks');
const events = await getCollection('organized_events');

// Compute visible sections for Nav
const navItems: Array<{ id: string; label: string }> = [
  { id: 'about', label: 'About' },
];
if (research.length > 0) navItems.push({ id: 'research', label: 'Research' });
// News visibility uses runtime filter; approximate at build by checking if any pinned or has any entries
if (news.length > 0) navItems.push({ id: 'news', label: 'News' });
if (publications.length > 0) navItems.push({ id: 'publications', label: 'Publications' });
if (talks.length > 0) navItems.push({ id: 'talks', label: 'Talks' });
if (events.length > 0) navItems.push({ id: 'organized-events', label: 'Events' });
navItems.push({ id: 'contact', label: 'Contact' });

const { Content: BioContent } = bioRendered;
---

<Layout title={`${site.data.name} — Philosophy of Science`}>
  <Nav items={navItems} siteName={site.data.name} />

  <Hero
    name={site.data.name}
    role={site.data.role}
    affiliation={site.data.affiliation}
    location={site.data.location}
    tagline={site.data.tagline}
    research_tags={site.data.research_tags}
    photo={site.data.photo}
    photo_credit={site.data.photo_credit}
    social={{
      email: site.data.email,
      orcid_url: site.data.orcid_url,
      scholar_url: site.data.scholar_url,
      philpeople_url: site.data.philpeople_url,
      academia_url: site.data.academia_url,
      github_url: site.data.github_url,
    }}
  />

  <section id="about" class="about-wrapper container">
    <header class="section-head">
      <div class="label">About</div>
      <h2 class="section-title">Biography</h2>
    </header>

    <div class="prose">
      <BioContent />
    </div>

    <About
      bioHtml=""
      affiliations={site.data.affiliations}
      education={site.data.education}
      editorial_roles={site.data.editorial_roles}
      memberships={site.data.memberships}
      project_memberships={site.data.project_memberships}
      peer_review_for={site.data.peer_review_for}
    />
  </section>

  <ResearchSection />
  <NewsSection />
  <PublicationsSection />
  <TalksSection />
  <OrganizedEventsSection />
  <Contact social={{
    email: site.data.email,
    orcid_url: site.data.orcid_url,
    scholar_url: site.data.scholar_url,
    philpeople_url: site.data.philpeople_url,
    academia_url: site.data.academia_url,
    github_url: site.data.github_url,
  }} cv_pdf={site.data.cv_pdf} />

  <Footer siteName={site.data.name} />
</Layout>

<style>
  .about-wrapper { padding-block: var(--space-7); }
  .section-head { margin-bottom: var(--space-5); }
  .section-head .label { margin-bottom: var(--space-2); font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: 0.15em; color: var(--muted); }
  .section-title { font-family: var(--font-display); font-size: var(--fs-xl); font-weight: 500; letter-spacing: -0.01em; }
  .prose {
    max-width: var(--max-prose);
    margin-bottom: var(--space-7);
    line-height: 1.7;
  }
  .prose :global(p) { margin-bottom: var(--space-4); }
</style>
```

**Note**: there's overlap between this page's About section and `About.astro` component. The `About.astro` from Task 17 was designed to also include the bio HTML; but Astro doesn't easily render markdown to HTML string, so we render the bio inline using `<BioContent />` here and pass only the structured fact-sheet data to `About.astro`. Update `About.astro` Step 1 from Task 17 to NOT render `bioHtml` (the `bioHtml` prop becomes unused — accept it but ignore, or remove the prop entirely).

Refactor `About.astro` to remove `bioHtml` prop and its render block:

Edit `src/components/About.astro`:
- Remove `bioHtml: string;` from `Props` interface (keep all other fields as optional).
- Remove `<div class="prose" set:html={bioHtml}></div>` and the `<header>` block.
- Remove the surrounding `<section id="about">` wrapper (the page's `about-wrapper` is now the section).
- Result: `About.astro` renders ONLY the `.facts` block.

Updated `About.astro`:

```astro
---
import AboutFactBlock from './AboutFactBlock.astro';

interface Affiliation { period: string; role: string; institution: string; location?: string; current?: boolean; }
interface Education { period: string; degree: string; institution: string; location?: string; thesis_title?: string; supervisors?: string; grade?: string; }
interface EditorialRole { journal: string; role: string; url?: string; }
interface Membership { name: string; role?: string; period?: string; url?: string; }
interface ProjectMembership { name: string; period: string; role?: string; url?: string; }

interface Props {
  affiliations?: Affiliation[];
  education?: Education[];
  editorial_roles?: EditorialRole[];
  memberships?: Membership[];
  project_memberships?: ProjectMembership[];
  peer_review_for?: string[];
}

const { affiliations, education, editorial_roles, memberships, project_memberships, peer_review_for } = Astro.props;
---

<div class="facts">
  {affiliations && affiliations.length > 0 && (
    <AboutFactBlock label="Academic positions">
      <ul>
        {affiliations.map(a => (
          <li>
            <span class="period">{a.period}</span>
            {a.role}, {a.institution}{a.location ? `, ${a.location}` : ''}
          </li>
        ))}
      </ul>
    </AboutFactBlock>
  )}

  {education && education.length > 0 && (
    <AboutFactBlock label="Education">
      <ul>
        {education.map(e => (
          <li>
            <span class="period">{e.period}</span>
            {e.degree}, {e.institution}{e.location ? `, ${e.location}` : ''}
            {e.thesis_title && <div><em>"{e.thesis_title}"</em>{e.supervisors ? ` — Supervisors: ${e.supervisors}` : ''}{e.grade ? ` (${e.grade})` : ''}</div>}
          </li>
        ))}
      </ul>
    </AboutFactBlock>
  )}

  {editorial_roles && editorial_roles.length > 0 && (
    <AboutFactBlock label="Editorial roles">
      <ul>
        {editorial_roles.map(r => (
          <li>{r.role}, {r.url ? <a href={r.url}><em>{r.journal}</em></a> : <em>{r.journal}</em>}</li>
        ))}
      </ul>
    </AboutFactBlock>
  )}

  {memberships && memberships.length > 0 && (
    <AboutFactBlock label="Memberships">
      <ul>
        {memberships.map(m => (
          <li>
            {m.period && <span class="period">{m.period}</span>}
            {m.url ? <a href={m.url}>{m.name}</a> : m.name}
            {m.role ? `, ${m.role}` : ''}
          </li>
        ))}
      </ul>
    </AboutFactBlock>
  )}

  {project_memberships && project_memberships.length > 0 && (
    <AboutFactBlock label="Project memberships">
      <ul>
        {project_memberships.map(p => (
          <li>
            <span class="period">{p.period}</span>
            {p.url ? <a href={p.url}>{p.name}</a> : p.name}
            {p.role ? `, ${p.role}` : ''}
          </li>
        ))}
      </ul>
    </AboutFactBlock>
  )}

  {peer_review_for && peer_review_for.length > 0 && (
    <AboutFactBlock label="Peer review">
      <p>Reviewer for {peer_review_for.map((j, i) => (<><em>{j}</em>{i < peer_review_for.length - 1 ? ', ' : '.'}</>))}</p>
    </AboutFactBlock>
  )}
</div>
```

- [ ] **Step 2: Run dev server, eyeball page**

```bash
npm run dev
```

Open `http://localhost:4321/`. Expected:
- Nav sticky at top with anchor links
- Hero with Federico's name, role, tagline, tags
- About section with bio paragraphs + fact blocks
- Research section (empty stub from Task 7 OK)
- Publications section with 1 sample
- Talks section with 1 sample
- Organized Events with 1 sample
- Contact section
- Footer

If broken, fix iteratively. Kill server with Ctrl+C.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: clean build, `dist/` populated.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/components/About.astro
git commit -m "feat: index.astro composes single-page with all sections"
```

---

### Task 25: 404 page

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Write page**

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout title="Not found — Federico Viglione">
  <main class="not-found container">
    <h1 class="big">404</h1>
    <p>This page doesn't exist (yet).</p>
    <p><a href="/">← Back to home</a></p>
  </main>
</Layout>

<style>
  .not-found {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--space-4);
  }
  .big {
    font-family: var(--font-display);
    font-size: clamp(80px, 14vw, 160px);
    font-weight: 500;
    line-height: 0.9;
    letter-spacing: -0.04em;
    color: var(--ink);
  }
  .not-found a { color: var(--accent); border-bottom: 1px dotted var(--accent); }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: custom 404 page"
```

---

## Phase 5: CMS

### Task 26: Sveltia admin shell

**Files:**
- Create: `public/admin/index.html`

- [ ] **Step 1: Create admin HTML shell**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CMS — Federico Viglione</title>
</head>
<body>
  <!-- Sveltia CMS — modern fork of Decap CMS, free, no extra OAuth setup needed when hosted on Netlify -->
  <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add public/admin/index.html
git commit -m "feat: Sveltia CMS admin shell"
```

---

### Task 27: Sveltia config.yml

**Files:**
- Create: `public/admin/config.yml`

This file must mirror `src/content/config.ts` exactly. Header comment enforces this convention.

- [ ] **Step 1: Create config.yml**

```yaml
# SYNC: keep schema mirrored with src/content/config.ts
backend:
  name: github
  repo: AlbyIanna/sito-viglions
  branch: main

# Sveltia CMS: login via GitHub OAuth (Netlify public proxy, no setup needed)
media_folder: public/uploads
public_folder: /uploads

locale: en

collections:
  - name: site
    label: Site Info
    files:
      - file: src/content/site/info.json
        label: Site Info
        name: info
        fields:
          - { label: "Name", name: name, widget: string }
          - { label: "Role", name: role, widget: string, hint: "e.g. Research Affiliate, Philosophy of Science" }
          - { label: "Affiliation", name: affiliation, widget: string }
          - { label: "Location", name: location, widget: string, required: false }
          - { label: "Tagline", name: tagline, widget: text, hint: "One-sentence intro shown on the homepage" }
          - { label: "Research tags", name: research_tags, widget: list, max: 6 }
          - { label: "Email", name: email, widget: string, pattern: ['.+@.+\\..+', 'Must be a valid email'] }
          - { label: "ORCID URL", name: orcid_url, widget: string, required: false }
          - { label: "Google Scholar URL", name: scholar_url, widget: string, required: false }
          - { label: "PhilPeople URL", name: philpeople_url, widget: string, required: false }
          - { label: "Academia.edu URL", name: academia_url, widget: string, required: false }
          - { label: "GitHub URL", name: github_url, widget: string, required: false }
          - { label: "Photo", name: photo, widget: image, required: false, hint: "Profile photo, ~280x280px recommended" }
          - { label: "Photo credit", name: photo_credit, widget: string, required: false }
          - { label: "CV (PDF)", name: cv_pdf, widget: file, required: false, hint: "Upload CV PDF" }
          - label: "Academic positions"
            name: affiliations
            widget: list
            required: false
            fields:
              - { label: "Period", name: period, widget: string, hint: "e.g. 2023–2025" }
              - { label: "Role", name: role, widget: string }
              - { label: "Institution", name: institution, widget: string }
              - { label: "Location", name: location, widget: string, required: false }
              - { label: "Current", name: current, widget: boolean, default: false, required: false }
          - label: "Education"
            name: education
            widget: list
            required: false
            fields:
              - { label: "Period", name: period, widget: string }
              - { label: "Degree", name: degree, widget: string }
              - { label: "Institution", name: institution, widget: string }
              - { label: "Location", name: location, widget: string, required: false }
              - { label: "Thesis title", name: thesis_title, widget: string, required: false }
              - { label: "Supervisors", name: supervisors, widget: string, required: false }
              - { label: "Grade", name: grade, widget: string, required: false }
          - label: "Editorial roles"
            name: editorial_roles
            widget: list
            required: false
            fields:
              - { label: "Journal", name: journal, widget: string }
              - { label: "Role", name: role, widget: string }
              - { label: "URL", name: url, widget: string, required: false }
          - label: "Memberships"
            name: memberships
            widget: list
            required: false
            fields:
              - { label: "Name", name: name, widget: string }
              - { label: "Role", name: role, widget: string, required: false }
              - { label: "Period", name: period, widget: string, required: false }
              - { label: "URL", name: url, widget: string, required: false }
          - label: "Project memberships"
            name: project_memberships
            widget: list
            required: false
            fields:
              - { label: "Name", name: name, widget: string }
              - { label: "Period", name: period, widget: string }
              - { label: "Role", name: role, widget: string, required: false }
              - { label: "URL", name: url, widget: string, required: false }
          - { label: "Peer review for", name: peer_review_for, widget: list, required: false, hint: "List of journals" }

  - name: bio
    label: Bio
    label_singular: Bio
    files:
      - file: src/content/bio/main.md
        label: About
        name: main
        fields:
          - { label: "Title", name: title, widget: hidden, default: "About" }
          - { label: "Body", name: body, widget: markdown }

  - name: research
    label: Research
    label_singular: Research area
    folder: src/content/research
    create: true
    slug: "{{slug}}"
    identifier_field: title
    fields:
      - { label: "Title", name: title, widget: string }
      - { label: "Summary", name: summary, widget: text, hint: "1-2 sentences for the listing" }
      - { label: "Order", name: order, widget: number, value_type: int, default: 99 }
      - { label: "Body", name: body, widget: markdown, required: false }

  - name: news
    label: News
    label_singular: News item
    folder: src/content/news
    create: true
    slug: "{{slug}}"
    identifier_field: title
    fields:
      - { label: "Title", name: title, widget: string }
      - { label: "Date", name: date, widget: date }
      - label: "Kind"
        name: kind
        widget: select
        options:
          - { label: "Upcoming event", value: upcoming }
          - { label: "Recent event", value: recent }
          - { label: "Award", value: award }
          - { label: "Research visit", value: visit }
      - { label: "Summary", name: summary, widget: text }
      - { label: "URL", name: url, widget: string, required: false }
      - { label: "Pinned", name: pinned, widget: boolean, default: false, hint: "Always show at the top, even if old" }
      - { label: "Body (unused)", name: body, widget: hidden, default: "" }

  - name: publications
    label: Publications
    label_singular: Publication
    folder: src/content/publications
    create: true
    slug: "{{year}}-{{slug}}"
    identifier_field: title
    fields:
      - { label: "Title", name: title, widget: string }
      - { label: "Authors", name: authors, widget: string, hint: "Comma-separated, e.g. Federico Viglione, Silvia De Bianchi" }
      - { label: "Year", name: year, widget: number, value_type: int }
      - { label: "Venue", name: venue, widget: string, hint: "Journal, publisher, or proceedings" }
      - label: "Type"
        name: type
        widget: select
        options:
          - { label: "Journal article", value: journal-article }
          - { label: "Book", value: book }
          - { label: "Book chapter", value: book-chapter }
          - { label: "Edited volume", value: edited-volume }
          - { label: "Book review", value: book-review }
          - { label: "Preprint", value: preprint }
          - { label: "Conference paper", value: conference-paper }
      - label: "Status"
        name: status
        widget: select
        options:
          - { label: "Published", value: published }
          - { label: "Forthcoming", value: forthcoming }
          - { label: "Under contract", value: under-contract }
          - { label: "Under review", value: under-review }
          - { label: "In preparation", value: in-preparation }
      - { label: "DOI", name: doi, widget: string, required: false }
      - { label: "URL", name: url, widget: string, required: false, hint: "Link to PDF or publisher page" }
      - { label: "Abstract", name: abstract, widget: text, required: false }
      - { label: "BibTeX", name: bibtex, widget: text, required: false }
      - { label: "Co-authors note", name: coauthors_note, widget: string, required: false, hint: "e.g. Special section co-edited with X" }
      - { label: "Order", name: order, widget: number, value_type: int, default: 99 }
      - { label: "Body (unused)", name: body, widget: hidden, default: "" }

  - name: talks
    label: Talks
    label_singular: Talk
    folder: src/content/talks
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    identifier_field: title
    fields:
      - { label: "Title", name: title, widget: string }
      - { label: "Venue", name: venue, widget: string }
      - { label: "Location", name: location, widget: string, required: false }
      - { label: "Date", name: date, widget: date }
      - label: "Type"
        name: type
        widget: select
        options:
          - { label: "Invited", value: invited }
          - { label: "Contributed", value: contributed }
          - { label: "Keynote", value: keynote }
          - { label: "Seminar", value: seminar }
          - { label: "Workshop", value: workshop }
      - { label: "Event URL", name: url, widget: string, required: false }
      - { label: "Slides URL", name: slides_url, widget: string, required: false }
      - { label: "Video URL", name: video_url, widget: string, required: false, hint: "YouTube, Vimeo, institutional streaming" }
      - { label: "Abstract", name: abstract, widget: text, required: false }
      - { label: "Body (unused)", name: body, widget: hidden, default: "" }

  - name: organized_events
    label: Organized Events
    label_singular: Organized event
    folder: src/content/organized_events
    create: true
    slug: "{{year}}-{{month}}-{{slug}}"
    identifier_field: title
    fields:
      - { label: "Title", name: title, widget: string }
      - label: "Role"
        name: role
        widget: select
        options:
          - { label: "Organizer", value: organizer }
          - { label: "Co-organizer", value: co-organizer }
          - { label: "Program committee", value: program-committee }
          - { label: "Coordinator", value: coordinator }
          - { label: "Committee member", value: committee-member }
      - { label: "Venue", name: venue, widget: string }
      - { label: "Location", name: location, widget: string, required: false }
      - { label: "Start date", name: start_date, widget: date }
      - { label: "End date", name: end_date, widget: date, required: false }
      - { label: "URL", name: url, widget: string, required: false }
      - { label: "Co-organizers", name: co_organizers, widget: string, required: false }
      - { label: "Description", name: description, widget: text, required: false }
      - { label: "Order", name: order, widget: number, value_type: int, default: 99 }
      - { label: "Body (unused)", name: body, widget: hidden, default: "" }
```

- [ ] **Step 2: Verify CMS shell renders**

```bash
npm run build
npm run preview
```

Open `http://localhost:4321/admin/`. Expected: Sveltia login screen appears. **Don't try logging in yet** — repo isn't pushed to GitHub.

- [ ] **Step 3: Commit**

```bash
git add public/admin/config.yml
git commit -m "feat: Sveltia CMS config.yml mirroring content schemas"
```

---

### Task 28: Cross-check schema sync

This is a manual verification step. No code changes if everything matches.

- [ ] **Step 1: Open both files side-by-side**

`src/content/config.ts` ↔ `public/admin/config.yml`.

- [ ] **Step 2: Verify field-by-field**

For each collection (site, bio, research, news, publications, talks, organized_events):
- Same field names
- Same types/widgets (string ↔ widget:string, etc.)
- Same required/optional status
- Same enums (select options match Zod enums verbatim)

- [ ] **Step 3: Fix any drift**

If a field is in Zod but not in YAML (or vice versa), pick the source of truth (usually Zod) and update the other. Run `npm run check` after fixes.

- [ ] **Step 4: Commit if changes**

```bash
git add public/admin/config.yml src/content/config.ts
git commit -m "fix: sync content schemas between Zod and Sveltia config"
```

---

## Phase 6: Content pre-population

Now Alberto fills the site with Federico's data, using the CV. This is heads-down content authoring guided by the CV. Each task is a batch of file creations.

### Task 29: site.json + bio

**Files:**
- Modify: `src/content/site/info.json` (full populate)
- Modify: `src/content/bio/main.md` (full text)

- [ ] **Step 1: Update `src/content/site/info.json` with full data**

Replace the file content (Task 5 created a partial). The full populated JSON is the same shape as Task 5's sample but tagline tuned, photo path empty (Federico uploads later).

```json
{
  "name": "Federico Viglione",
  "role": "Research Affiliate · Philosophy of Science",
  "affiliation": "Università degli Studi di Torino",
  "location": "Turin, Italy",
  "tagline": "Working on the metaphysics of time, the philosophy of cosmology, and the philosophical foundations of mathematics.",
  "research_tags": ["philosophy of time", "metaphysics of science", "cosmology", "mathematics"],
  "email": "federico.viglione@unimi.it",
  "orcid_url": "",
  "scholar_url": "",
  "philpeople_url": "",
  "academia_url": "",
  "github_url": "",
  "photo": "",
  "photo_credit": "",
  "cv_pdf": "/files/cv.pdf",
  "affiliations": [
    { "period": "2026–present", "role": "Research Affiliate (Cultore della Materia)", "institution": "Università degli Studi di Torino", "location": "Turin, Italy", "current": true },
    { "period": "2023–2025", "role": "Postdoctoral Fellow (Assegnista di Ricerca di Tipo B)", "institution": "Università degli Studi di Milano", "location": "Milan, Italy" },
    { "period": "2018–2022", "role": "Predoctoral Researcher (Investigador Predoctoral)", "institution": "Universitat Autònoma de Barcelona", "location": "Barcelona, Spain" }
  ],
  "education": [
    { "period": "2018–2022", "degree": "PhD in Philosophy", "institution": "Universitat Autònoma de Barcelona", "location": "Barcelona, Spain", "thesis_title": "Time and Chances before the Changing Universe. A Metaphysical Inquiry", "supervisors": "Silvia De Bianchi; Giuliano Torrengo", "grade": "Cum laude" },
    { "period": "2015–2018", "degree": "Laurea magistrale in Philosophy", "institution": "Università degli Studi di Torino", "location": "Turin, Italy", "thesis_title": "Did time and world begin? Contemporary philosophical perspectives", "supervisors": "Vincenzo Crupi; Giuliano Torrengo", "grade": "110/110 e lode" },
    { "period": "2011–2015", "degree": "Laurea triennale in Philosophy", "institution": "Università degli Studi di Torino", "location": "Turin, Italy", "thesis_title": "Indeterminism and probability in Karl Popper's Postscript. An indeterministic interpretation of quantum reality", "supervisors": "Vincenzo Crupi", "grade": "106/110" }
  ],
  "editorial_roles": [],
  "memberships": [
    { "name": "European Philosophy of Science Association", "period": "2025–2027" },
    { "name": "American Philosophical Association", "period": "2025–2026" },
    { "name": "Philosophy of Time Society", "period": "2024–present" },
    { "name": "Centre for the Philosophy of Time", "period": "2018–present" }
  ],
  "project_memberships": [
    { "name": "COSMOS: History & Philosophy of Cosmology Network", "period": "2023–present" },
    { "name": "CHRONOS: Rethinking and Communicating Time", "period": "2020–2024" },
    { "name": "PROTEUS: Paradoxes and Metaphors of Time in Early Universe(s) (ERC Starting Grant)", "period": "2018–2023" }
  ],
  "peer_review_for": ["Mind", "Synthese", "Journal for General Philosophy of Science", "Studies in History and Philosophy of Science"]
}
```

- [ ] **Step 2: Write `src/content/bio/main.md`**

```markdown
---
title: "About"
---

I am a philosopher of science working on the metaphysics of time, the philosophy of cosmology, and adjacent questions in the philosophy of mathematics and religion. My recent work focuses on cosmic simultaneity, the traversal of the infinite, and the metaphysical structure of early-universe cosmology.

I am currently a Research Affiliate (Cultore della Materia) at the Department of Philosophy of Università degli Studi di Torino. I previously held a Postdoctoral Fellowship at Università degli Studi di Milano (2023–2025) and a Predoctoral Researcher position at Universitat Autònoma de Barcelona (2018–2022), where I completed my PhD with a dissertation titled *"Time and Chances before the Changing Universe. A Metaphysical Inquiry"*, supervised by Silvia De Bianchi and Giuliano Torrengo.

Outside of writing and teaching, I have organized several conferences and workshops in the philosophy of cosmology and the metaphysics of time, including the COSMOS workshop series at the University of Milan.
```

- [ ] **Step 3: Run check + build**

```bash
npm run check && npm run build
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/content/site/info.json src/content/bio/main.md
git commit -m "content: populate site.json and bio.md from CV"
```

---

### Task 30: Research areas

**Files:**
- Modify: `src/content/research/idealization.md` (rename + rewrite)
- Create: 3 more research entries

CV identifies these areas of specialization: Philosophy of Time, Metaphysics of Science, Philosophy of Cosmology, Philosophy of Mathematics. Make one entry per area.

- [ ] **Step 1: Rename sample to `src/content/research/philosophy-of-time.md`**

```bash
mv src/content/research/idealization.md src/content/research/philosophy-of-time.md
```

Replace content:

```markdown
---
title: "Philosophy of Time"
summary: "The metaphysics of temporal becoming, the structure of cosmic time, and the traversal of the infinite past."
order: 1
---

My main line of research addresses the metaphysical structure of time, with particular attention to its interaction with cosmological models. Recent work focuses on the absoluteness of cosmic simultaneity, the conditions under which an infinite past is traversable, and the dynamics of "the most dynamic time" as a novel framework in the metaphysics of becoming.
```

- [ ] **Step 2: Create `src/content/research/philosophy-of-cosmology.md`**

```markdown
---
title: "Philosophy of Cosmology"
summary: "The philosophical foundations of contemporary cosmological models, including the role of explanation, models of beginnings, and the metaphysics of space-time."
order: 2
---

I work on the philosophical interpretation of contemporary cosmology, including the structure of cosmological explanation, models for the beginning of the cosmos, and the metaphysical status of cosmic simultaneity in relativistic frameworks.
```

- [ ] **Step 3: Create `src/content/research/metaphysics-of-science.md`**

```markdown
---
title: "Metaphysics of Science"
summary: "The metaphysical commitments of scientific theories, with focus on identity, persistence, change, and the structure of fundamental entities."
order: 3
---

This strand of research addresses the metaphysical commitments implicit in scientific theorizing, including questions of identity in quantum mechanics, persistence through change, and the structure of fundamental physical entities.
```

- [ ] **Step 4: Create `src/content/research/philosophy-of-mathematics.md`**

```markdown
---
title: "Philosophy of Mathematics"
summary: "The metaphysical and epistemic status of mathematical objects, with focus on infinity, antinomies, and the Kantian tradition."
order: 4
---

I explore the metaphysical and epistemic status of mathematical objects with particular attention to the role of infinity, the mathematical antinomies in the Kantian and post-Kantian tradition, and the foundations of mathematics relevant to cosmological models.
```

- [ ] **Step 5: Run check + commit**

```bash
npm run check
git add src/content/research/
git commit -m "content: 4 research areas from CV (time, cosmology, metaphysics, math)"
```

---

### Task 31: Publications + initial News

**Files:**
- Modify: `src/content/publications/2026-not-so-absolute-cosmic-simultaneity.md`
- Create: 5 more publication entries
- (News collection stays empty — Federico can add upcoming events via CMS)

From CV: 3 peer-reviewed articles, 2 edited volumes, 1 book under contract.

- [ ] **Step 1: Update sample publication (already 2026 paper, just refine)**

`src/content/publications/2026-not-so-absolute-cosmic-simultaneity.md`:

```markdown
---
title: "Not so Absolute Cosmic Simultaneity"
authors: "Federico Viglione"
year: 2026
venue: "Erkenntnis"
type: "journal-article"
status: "published"
doi: "10.1007/s10670-026-01075-2"
url: "https://doi.org/10.1007/s10670-026-01075-2"
order: 1
---
```

- [ ] **Step 2: Create `src/content/publications/2024-traversal-of-the-infinite.md`**

```markdown
---
title: "The Traversal of the Infinite: Considering a Beginning for an Infinite Past"
authors: "Federico Viglione"
year: 2024
venue: "Synthese"
type: "journal-article"
status: "published"
doi: "10.1007/s11229-024-04735-4"
url: "https://doi.org/10.1007/s11229-024-04735-4"
order: 1
---
```

- [ ] **Step 3: Create `src/content/publications/2022-building-universes-introduction.md`**

```markdown
---
title: "Special Section Introduction"
authors: "Silvia De Bianchi, Federico Viglione"
year: 2022
venue: "HOPOS: The Journal of the International Society for the History of Philosophy of Science, 12(1), 122–128"
type: "book-chapter"
status: "published"
coauthors_note: "Introduction to the special section Building Universe(s), co-edited with S. De Bianchi"
order: 1
---
```

- [ ] **Step 4: Create `src/content/publications/2027-awakening-universe-hypothesis.md`**

```markdown
---
title: "The Awakening Universe Hypothesis"
authors: "Federico Viglione"
year: 2027
venue: "Springer"
type: "book"
status: "under-contract"
order: 1
---
```

(Year 2027 is a placeholder for expected publication. Federico can update.)

- [ ] **Step 5: Create `src/content/publications/2026-modeling-the-cosmos.md`**

```markdown
---
title: "Modeling the Cosmos: Frontiers in Philosophy of Astrophysics and Cosmology"
authors: "Federico Viglione (ed.)"
year: 2026
venue: "Studies in History and Philosophy of Science"
type: "edited-volume"
status: "forthcoming"
order: 2
---
```

- [ ] **Step 6: Create `src/content/publications/2022-building-universes.md`**

```markdown
---
title: "Building Universe(s). The philosophical and mathematical underpinnings of cosmology (18th–20th century)"
authors: "Silvia De Bianchi, Federico Viglione (eds.)"
year: 2022
venue: "HOPOS, 12(1)"
type: "edited-volume"
status: "published"
coauthors_note: "Special section co-edited with S. De Bianchi"
order: 2
---
```

- [ ] **Step 7: Run check + commit**

```bash
npm run check
git add src/content/publications/
git commit -m "content: 6 publications from CV (3 articles, 2 edited volumes, 1 book under contract)"
```

---

### Task 32: Talks + Organized Events

**Files:**
- Modify: `src/content/talks/2026-03-04-models-of-explanation.md`
- Create: 18 more talks entries
- Modify: `src/content/organized_events/2026-03-modeling-the-cosmos.md`
- Create: 8 more organized event entries

CV lists 19 talks and 9 organized events. Follow the CV verbatim.

- [ ] **Step 1: Create the 19 talk files**

Filename pattern: `YYYY-MM-DD-<slug>.md`. Create each with the frontmatter below. Sample slugs derived from titles.

The full talks list (each becomes one file):

```
2026-03-04-models-of-explanation.md         (already exists from Task 10, keep)
2025-10-29-traverse-infinite-geneva.md
2025-09-12-absoluteness-cosmic-simultaneity.md
2025-08-27-not-so-absolute-cosmic-simultaneity-epsa25.md
2025-07-09-not-so-absolute-cosmic-simultaneity-iapt10.md
2025-06-12-not-so-absolute-cosmic-simultaneity-silfs.md
2025-05-27-traverse-infinite-bratislava.md
2025-02-18-most-dynamic-time-apa.md
2024-11-12-metaphysical-restrictions-cosmic-simultaneity.md
2024-07-04-persisting-through-most-dynamic-time.md
2024-03-19-mereology-most-dynamic-time.md
2024-01-22-traversal-of-the-infinite-chronos.md
2023-11-14-natura-infinita-del-sublime.md
2023-07-18-proteus-research-team-results.md
2021-09-02-identita-in-meccanica-quantistica.md
2019-09-17-mathematical-antinomies.md
2019-05-04-sense-of-time-before-big-bang.md
2016-05-25-emergence-ontology-ferraris.md
2016-04-04-popper-anti-realismo.md
2015-04-29-emergenza-spaziotempo-alexander.md
```

For each, the frontmatter follows the pattern shown in the example below. Refer to the CV for exact title/venue/location/date/type. Use `invited` for talks marked `(invited)` in CV, otherwise `contributed`. `seminar` for "MS' course" entries.

Example: `src/content/talks/2025-10-29-traverse-infinite-geneva.md`:

```markdown
---
title: "How To Traverse the Infinite Starting Now"
venue: "Geneva Symmetry Group's Talks"
location: "Geneva, Switzerland"
date: 2025-10-29
type: "invited"
video_url: "https://www.youtube.com/watch?v=wzK53l2bXBg&t=2516s"
---
```

Example with `slides_url` placeholder: empty.

For talks with known external links (from second Drive doc):
- `2025-09-12-absoluteness-cosmic-simultaneity.md` → `video_url: "https://www.usi.ch/it/feeds/32414"`
- `2025-08-27-not-so-absolute-cosmic-simultaneity-epsa25.md` → `url: "https://philsci.eu/EPSA25/Programme"`

**Tip**: rather than typing each manually, create a JavaScript scratch script that reads a structured array and emits all files. Or just write them one by one — 19 small files, ~15 minutes.

- [ ] **Step 2: Create the 9 organized_events files**

Pattern: `YYYY-MM-<slug>.md`.

```
2026-03-modeling-the-cosmos.md              (already exists from Task 11, keep)
2024-03-milan-history-philosophy-physics.md
2024-09-second-hp-cosmology.md
2024-03-dynamics-of-change.md
2022-09-first-hp-cosmology.md
2022-07-iapt7-barcelona.md
2018-10-proteus-seminar-series.md
2019-09-kant-foundations-mathematics.md
2016-05-three-religions-three-cultures.md
```

For each, frontmatter as in Task 11 example. Use `start_date` and `end_date` (for multi-day or multi-year ranges; use first/last day of period).

Examples with URLs from CV:
- `2026-03-modeling-the-cosmos.md` → `url: "https://cosmosproject.unimi.it/2025/10/24/modeling-the-cosmos-frontiers-in-philosophy-of-astrophysics-and-cosmology/"`
- `2022-07-iapt7-barcelona.md` → `url: "https://iapt7.wordpress.com/"`
- `2018-10-proteus-seminar-series.md` → `url: "https://www.proteus-pmte.eu/seminars/"`
- `2019-09-kant-foundations-mathematics.md` → `url: "https://www.proteus-pmte.eu/seminars/kant-on-the-foundations-of-mathematics-and-cosmology-what-legacy-for-german-idealism-and-beyond/"`, `co_organizers: "Co-organizer with Silvia De Bianchi"`

- [ ] **Step 3: Run check + build + dev preview**

```bash
npm run check && npm run build && npm run dev
```

Open `http://localhost:4321/`. Expected:
- Publications: 6 entries, grouped by status (3 published, 2 forthcoming/under-contract, etc.)
- Talks: 19 entries, sorted by date desc
- Organized Events: 9 entries
- All other sections intact

Take screenshot for reference. Kill dev server.

- [ ] **Step 4: Commit**

```bash
git add src/content/talks/ src/content/organized_events/
git commit -m "content: 19 talks + 9 organized events from CV"
```

---

## Phase 7: Deploy

### Task 33: netlify.toml

**Files:**
- Create: `netlify.toml`

- [ ] **Step 1: Write netlify.toml**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/fonts/*.woff2"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/uploads/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/files/cv.pdf"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

- [ ] **Step 2: Commit**

```bash
git add netlify.toml
git commit -m "chore: netlify.toml with build config and cache headers"
```

---

### Task 34: CV placeholder

**Files:**
- Create: `public/files/cv.pdf` (placeholder; Federico replaces via CMS later)

- [ ] **Step 1: Add a placeholder PDF**

If Alberto has access to Federico's CV PDF (e.g. downloaded from the Drive link), drop it here:

```bash
mkdir -p public/files
# copy the actual PDF
cp ~/Downloads/Viglione_CV.pdf public/files/cv.pdf
```

If not, create a minimal placeholder PDF (any 1-page PDF will do; the goal is to make the `/files/cv.pdf` link resolve until Federico uploads the real one via CMS):

```bash
# macOS: print a text file to PDF, or use any small existing PDF
echo "CV — Federico Viglione (placeholder, will be updated)" | textutil -convert html -stdin | cupsfilter - > public/files/cv.pdf 2>/dev/null
# fallback: empty file (browser shows "cannot display PDF" — acceptable as placeholder)
[ -f public/files/cv.pdf ] || touch public/files/cv.pdf
```

- [ ] **Step 2: Commit**

```bash
git add public/files/cv.pdf
git commit -m "content: CV PDF placeholder (Federico to replace via CMS)"
```

---

### Task 35: Push to GitHub + Netlify connect

**Manual + CLI steps. Alberto runs these.**

- [ ] **Step 1: Create GitHub repo**

In a browser, go to https://github.com/new. Create `AlbyIanna/sito-viglions` (private or public — Alberto's choice). Don't init with README/license.

Then locally:

```bash
git remote add origin git@github.com:AlbyIanna/sito-viglions.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Connect to Netlify**

Option A (UI): https://app.netlify.com → "Add new site" → "Import an existing project" → GitHub → select `AlbyIanna/sito-viglions` → confirm build command and publish directory (auto-detected from `netlify.toml`) → Deploy.

Option B (CLI): `npx netlify-cli init` and follow prompts.

- [ ] **Step 3: Verify deploy**

After ~30s, visit the assigned Netlify URL (e.g. `sito-viglions.netlify.app`). Expected:
- Hero shows Federico's name
- All sections render
- `/admin/` loads Sveltia login screen
- Console: no 404s

- [ ] **Step 4: Test CMS login**

Click "Login with GitHub" on `/admin/`. Approve the Sveltia OAuth app (uses Netlify's public proxy). Expected: pannello opens with 6 collections. Make a trivial edit (e.g. add a space in Bio), click Publish, wait ~30s, verify the edit appears on the live site.

Revert the trivial edit.

- [ ] **Step 5: Configure domain (optional — defer to call with Federico)**

If Alberto wants to set up the custom domain now:
- Netlify → Domain settings → Add custom domain → `federicoviglione.com` (or chosen variant)
- Configure DNS on Cloudflare following `docs/domain-setup.md` (Task 37)

Otherwise, leave on Netlify subdomain until Federico approves the domain choice.

- [ ] **Step 6: Confirm in commit log**

No new commits in this task — it's pure ops. Note in TaskList that deploy is live and URL.

---

## Phase 8: Docs

### Task 36: docs/per-il-filosofo.md

**Files:**
- Create: `docs/per-il-filosofo.md`

In English (consistent with the site), 1-2 pages.

- [ ] **Step 1: Write the doc**

```markdown
# Editing federicoviglione.com — quick guide

This is the editor's guide for the site. It assumes no technical background.

## Logging in

1. Go to `https://federicoviglione.com/admin/` (replace with current deploy URL until DNS is live).
2. Click **Login with GitHub**.
3. Approve the OAuth prompt the first time.

You now see a sidebar with sections: Site Info, Bio, Research, News, Publications, Talks, Organized Events.

## Editing existing content

- Click a collection in the sidebar (e.g. **Publications**)
- Click an entry → edit any field → click **Publish** (top right)
- The site rebuilds in ~30 seconds. Refresh the public page to see your change.

## Adding new content

- Open a collection → click **+ New** (top right)
- Fill in the form, click **Publish**
- New entries appear automatically (publications sorted by year, talks by date, etc.)

## Uploading the CV

- Open **Site Info** in the sidebar
- Scroll to the **CV (PDF)** field
- Click **Choose file**, upload your latest CV.pdf
- Click **Publish**

The download link on the public site always points to the most recent CV.

## Uploading a profile photo

- Open **Site Info** → scroll to **Photo** field
- Click **Choose file**, upload an image (~280x280 px recommended)
- Add **Photo credit** if needed (e.g. "Photo by Anna Bianchi")
- Click **Publish**

## "Pinning" news

A News entry with `Pinned = true` always shows at the top of the News section, even if old. Use it for major announcements (e.g. an upcoming fellowship) that should stay visible.

## What happens after you click Publish

1. Sveltia commits the change to GitHub
2. Netlify detects the commit, rebuilds the site
3. The new version goes live in ~30 seconds

## If the site doesn't update after 2 minutes

Contact Alberto. The most likely cause is a validation error (e.g. a required field left empty) that prevented the build. Alberto will fix the issue and unblock the rebuild.

## Where the content lives

All your content is stored in the GitHub repository at `AlbyIanna/sito-viglions`, in `src/content/`. You don't need to touch the repo directly — just use the CMS at `/admin/`. The git history serves as a complete record of every change.
```

- [ ] **Step 2: Commit**

```bash
git add docs/per-il-filosofo.md
git commit -m "docs: editor's guide for Federico"
```

---

### Task 37: docs/domain-setup.md

**Files:**
- Create: `docs/domain-setup.md`

Recycle from sito-francesca's `docs/domain-setup.md`, adapting domain and email-host details.

- [ ] **Step 1: Copy and adapt from sito-francesca**

```bash
if [ -f /Users/albertoiannaccone/Workspace/sito-francesca/docs/domain-setup.md ]; then
  cp /Users/albertoiannaccone/Workspace/sito-francesca/docs/domain-setup.md docs/domain-setup.md
fi
```

If the source doesn't exist (it's referenced in the README but may not be a tracked file), create one from scratch with these sections:
- Purchase domain (Cloudflare Registrar or Namecheap)
- Add to Cloudflare DNS
- Point at Netlify (CNAME or A/AAAA records)
- Add custom domain in Netlify dashboard
- Wait for SSL cert (Let's Encrypt, ~5 min)
- Optional: Google Workspace MX records for `name@domain` email

- [ ] **Step 2: Adapt for federicoviglione.com**

Find/replace `francescaiannaccone.it` → `federicoviglione.com` (or chosen variant). Update screenshots references if any.

- [ ] **Step 3: Commit**

```bash
git add docs/domain-setup.md
git commit -m "docs: domain setup guide for federicoviglione.com"
```

---

### Task 38: README.md

**Files:**
- Create: `README.md`

For Alberto (technical readme).

- [ ] **Step 1: Write README**

```markdown
# Sito Viglione

Personal site for [Federico Viglione](https://federicoviglione.com), philosopher of science.

Stack: **Astro 5** · **Sveltia CMS** · **Netlify**

---

## Setup locally (Alberto)

```bash
npm install        # also fetches fonts via postinstall hook
npm run dev        # → http://localhost:4321
npm run build      # production build
npm run preview    # serve dist/
npm run check      # astro check (TS + content validation)
```

## Project structure

```
src/
├── content/
│   ├── config.ts            # Zod schemas (MIRROR public/admin/config.yml)
│   ├── site/info.json       # single entry
│   ├── bio/main.md          # single markdown
│   ├── research/*.md
│   ├── news/*.md
│   ├── publications/*.md
│   ├── talks/*.md
│   └── organized_events/*.md
├── components/              # Astro components (no React/Svelte)
├── layouts/Layout.astro
├── pages/{index,404}.astro
└── styles/global.css
public/
├── admin/
│   ├── index.html           # Sveltia shell
│   └── config.yml           # MIRROR src/content/config.ts
├── fonts/                   # self-hosted Fraunces + Inter
├── files/cv.pdf             # managed by CMS
└── uploads/                 # managed by CMS
```

## Editing schemas

**Important**: any change to a content collection must be applied to BOTH:
- `src/content/config.ts` (Zod schema, source of truth for Astro)
- `public/admin/config.yml` (Sveltia CMS form)

If only one is updated, either the CMS will reject valid input or Astro will fail to build on submitted content.

## Editor's guide (Federico)

See `docs/per-il-filosofo.md`.

## Deploy

`git push origin main` → Netlify CI builds and deploys.

Build failure notifications go to Alberto. The previous successful deploy remains live; broken content never reaches production.

## Domain

See `docs/domain-setup.md` for DNS/email setup steps.

## Design tokens

Palette and typography in `src/styles/global.css`. Visual style: "editorial-tech cool" (D) — Fraunces serif display + Inter sans body, paper off-white background, cool blue accent.

| Variable | Hex | Use |
|---|---|---|
| `--paper` | `#f6f6f4` | background |
| `--ink` | `#15171a` | primary text |
| `--muted` | `#6b7178` | secondary text, metadata |
| `--rule` | `#d4d6da` | lines, borders |
| `--accent` | `#1d4ed8` | links, emphasis |
| `--accent-soft` | `#eff3ff` | pinned/news background |
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README for Alberto"
```

---

### Task 39: Add Federico as GitHub collaborator

Manual ops.

- [ ] **Step 1: Get Federico's GitHub handle**

Ask Federico (in Slack/email): "What's your GitHub username? Create a free account at github.com if you don't have one — should take 5 minutes."

- [ ] **Step 2: Add to repo**

GitHub UI → `AlbyIanna/sito-viglions` → Settings → Collaborators → Invite a collaborator → enter handle → role Write.

- [ ] **Step 3: Notify Federico**

Send him: invite link, deploy URL (`https://<temp>.netlify.app/admin/` or the final domain), and the editor's guide at `https://github.com/AlbyIanna/sito-viglions/blob/main/docs/per-il-filosofo.md`.

Suggested message:

> Federico, the site is up. Login at `<URL>/admin/` with your GitHub account. I pre-filled everything from your CV — please review the Bio (especially) and the photo upload. The editor's guide is in the repo at `docs/per-il-filosofo.md`. Ping me on Slack if anything looks off.

---

## Phase 9: QA + polish

### Task 40: Manual visual smoke test

- [ ] **Step 1: Open the deployed site in three browsers**

Safari, Chrome, Firefox. On each:
- Top: name renders in Fraunces, no FOUT/FOIT issue
- Hero photo (if uploaded) is square, photo credit italic underneath
- Nav sticky as you scroll, scrollspy highlights current section
- Each section renders correctly
- Tag chips have square corners (radius 2px)
- Publications: badges show correct color (Forthcoming ambra, Under contract ambra, Under review gray)
- Talks: invited talks have accent-color chip
- All external links open in new tab
- Mobile (DevTools responsive mode, 375px): nav adapts, hero stacks, fact blocks single-column

- [ ] **Step 2: Fix any visual bug**

For each issue: edit the relevant component, commit, push (auto-redeploys), re-verify.

- [ ] **Step 3: Validate HTML**

Visit https://validator.w3.org/nu/ and enter the production URL. Expected: no errors. Warnings about `set:html` content are OK (they come from user-authored markdown).

---

### Task 41: Lighthouse audit

- [ ] **Step 1: Run Lighthouse on Chrome DevTools**

Production URL → DevTools → Lighthouse tab → check all 4 categories (Performance, Accessibility, Best Practices, SEO) → "Mobile" → Analyze.

Target: **100/100/100/100**.

- [ ] **Step 2: Fix sub-100 scores**

Common issues + fixes:
- LCP slow: ensure fonts are preloaded (Task 3 already does this; verify in Network tab)
- CLS: hero photo dimensions must be set (`width`/`height` on `<img>`)
- Color contrast: bump `--muted` darker if AAA needed
- Missing `<html lang>`: already set in Layout
- Missing meta description: already in Layout

Re-run Lighthouse after each fix. Commit incrementally.

- [ ] **Step 3: Final commit (if any changes)**

```bash
git add -A
git commit -m "perf: lighthouse polish (100/100/100/100)"
git push
```

---

### Task 42: Hand-off call with Federico

- [ ] **Step 1: 30-min call (or async equivalent)**

Walk Federico through:
1. Login at `/admin/`
2. Editing his Bio
3. Adding a new publication (use a recent paper — let him do the typing)
4. Uploading his photo
5. Uploading his CV
6. Adding a News entry for an upcoming event

- [ ] **Step 2: Confirm autonomy**

Ask: "Can you make a small edit on your own right now, while I'm here?" Watch him do one solo edit, observe where he hesitates, refine the editor's guide.

- [ ] **Step 3: Set support boundaries**

Agree on:
- For content changes: Federico does it solo
- If the site doesn't update after 2 min: Slack/email Alberto
- For schema/design changes: Federico requests, Alberto implements
- For domain/DNS changes: Alberto handles

- [ ] **Step 4: Mark project as Phase 1 complete**

Site is live, populated, and Federico is autonomous. Future iterations (Plausible analytics, blog, teaching section, etc.) come on demand as separate small projects.

---

## Self-Review (run by Alberto before declaring done)

Run this checklist against the spec at `docs/superpowers/specs/2026-05-21-sito-viglions-design.md`:

- [ ] Stack matches: Astro 5 + Sveltia + Netlify ✓ (Tasks 1, 26, 33)
- [ ] All 7 sections build conditionally: Hero (always), About (always), Research, News, Publications, Talks, Organized Events, Contact (always) ✓ (Tasks 15-24)
- [ ] Schema sync verified: Zod ↔ YAML ✓ (Task 28)
- [ ] All content from CV is populated ✓ (Tasks 29-32)
- [ ] Design tokens applied: paper/ink/accent + Fraunces/Inter ✓ (Task 3-4)
- [ ] CMS works end-to-end: login, edit, publish, rebuild ✓ (Task 35)
- [ ] Documentation: README for Alberto, per-il-filosofo for Federico, domain-setup ✓ (Tasks 36-38)
- [ ] Performance: Lighthouse 100/100/100/100 ✓ (Task 41)
- [ ] Federico onboarded and autonomous ✓ (Task 42)

If any unchecked: complete that task before declaring Phase 1 done.
