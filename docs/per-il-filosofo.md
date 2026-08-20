# For the Philosopher — editor's guide

Welcome, Federico. This is your one-page guide to editing your own website. No coding, no terminal. Everything happens in the browser through a small admin panel.

The site is at `https://federicoviglione.com` (or whatever domain is set up at deploy time). The admin panel is at `https://federicoviglione.com/admin/`.

If anything below is unclear or stops working, write to Alberto (alby.ianna@gmail.com).

---

## 1. Logging in

1. Go to `https://federicoviglione.com/admin/`.
2. Click **Sign in with GitHub** and authorize with the GitHub account Alberto invited to the repository.

Once logged in you'll see the **Sveltia CMS** interface: a left sidebar with all the sections of the site (Site, Bio, News, Publications, Talks, Organized events), and a main area where you edit.

> If you get an authentication error, log out (top-right) and log in again. Sveltia sometimes caches a stale session.

---

## 2. Editing existing content

Most things on the site are already filled in from your CV. To change something:

1. From the sidebar, click the section (e.g. **Publications**).
2. You'll see a list of entries. Click the one you want to edit.
3. Edit the fields. The right panel shows a live preview.
4. Click **Save** (top-right) when done.
5. After a few seconds, click **Publish**.

The site rebuilds automatically. Refresh `https://federicoviglione.com` after about 1–2 minutes and you'll see your changes.

> **What "Save" vs "Publish" means:** Save stores a draft only you can see in the CMS. Publish writes the change to the live site. For your own site, you can publish directly — there's no editorial workflow set up.

---

## 3. Adding new content

Same flow for every section. Example: a new talk.

1. **Talks** in the sidebar → **New Talks** (top-right).
2. Fill in:
   - **Title** — full title of the talk
   - **Venue** — e.g. "Università di Bologna, Department of Philosophy"
   - **Location** — e.g. "Bologna, Italy" (optional)
   - **Date** — pick from the calendar
   - **Type** — invited, contributed, keynote, seminar, or workshop
   - **URL** / **Slides URL** / **Video URL** — optional
   - **Abstract** — optional, a few sentences
3. **Save** → **Publish**.

The same flow applies to **Publications**, **News**, and **Organized events**. Required fields are marked with an asterisk; the panel won't let you save until they're filled.

> **Publications appear on the site under the "Research" heading**, grouped automatically by type: Books, Journal articles, Book chapters, Edited volumes, and so on. Just set the **Type** field correctly and the entry lands in the right group.

> **Tip — `order` fields:** Publications and Organized events have an optional **Order** number. Lower numbers appear first *within the same year*. Leave it at the default (99) unless you want to force a specific order.

---

## 4. Uploading your CV

The site has a **Download CV** button in the About section that links to `/files/cv.pdf`. To replace the placeholder with your real CV:

1. From the sidebar, go to **Site** → click the existing entry.
2. Scroll to the **CV PDF** field.
3. Click the upload area (it currently shows `/files/cv.pdf`).
4. Drag-and-drop your new PDF, or click to pick from your computer.
5. The file uploads — Sveltia renames it and tracks it for you.
6. **Save** → **Publish**.

The button on the homepage now links to your new CV.

> **Filename note:** the path `/files/cv.pdf` is referenced in a few places. Sveltia handles the rename transparently, so don't worry about the original filename — you can upload `viglione-cv-2026.pdf` and it will work.

---

## 5. Uploading a photo

The About section has a portrait spot next to your bio. To upload:

1. **Site** → existing entry.
2. **Photo** field → upload.
3. Recommended: portrait-orientation JPG, roughly 4:5 ratio (e.g. 600×750 px), max ~500 KB. Sveltia compresses it.
4. Optional: **Photo credit** field for the photographer's name.
5. **Save** → **Publish**.

If you leave the Photo field empty, the About section shows just the text — no broken image.

---

## 6. Changing how the site looks (Theme settings)

At the bottom of **Site** → entry there is a **Theme settings** panel. Everything here is safe to experiment with — nothing can break, and every change is reversible:

- **Palette** — the overall color scheme (paper, text, and accent change together). Default is *Bianca granata* (white paper, garnet accent); the alternatives are *Bordeaux*, *Blu editoriale*, *Foresta*, and *Ambra*.
- **Show portrait photo in About** — toggle the photo off if you prefer text only.
- **Name size in the header** — compact / default / large.
- **Hidden sections** — sections listed here exist in the CMS but don't appear on the site. **News and Organized events are hidden by default**; remove them from this list to make them appear on the homepage.
- **Section order** — drag to reorder the homepage sections.

As always: **Save** → **Publish**, wait a couple of minutes, refresh.

---

## 7. Pinning a news item

Some news items deserve to stay visible even after the date passes (e.g. a major award, an upcoming event you want to highlight). Mark them as **pinned**:

1. **News** → open the entry.
2. Toggle **Pinned** to ON.
3. **Save** → **Publish**.

Pinned items stay in the News section permanently. Non-pinned items disappear automatically when their date is older than ~6 months — the section curates itself.

> **Note:** the News section is hidden on the homepage by default. To show it, remove "News" from **Hidden sections** in Theme settings (see section 6).

> **When to pin:** awards, fellowships, book contracts, visiting positions. **When not to pin:** routine talks (they show up under Talks anyway), local seminars, blog posts.

---

## 8. What happens after you click Publish

Behind the scenes:

1. Sveltia writes your change to the GitHub repository (silent — you don't see this).
2. Netlify detects the change and starts a build (~30–60 seconds).
3. The new build replaces the live site.
4. Total time from Publish to live: usually 1–2 minutes.

You can keep working in the CMS while a build is in progress — your next change just queues up.

---

## 9. Troubleshooting — site doesn't update after 2 minutes

99% of the time it's a cache. Try this in order:

1. **Hard refresh:** Cmd-Shift-R (Mac) or Ctrl-F5 (Windows). Forces the browser to fetch the latest version.
2. **Incognito window:** open the site in a private window. If it shows the new version, your browser cache was stale.
3. **Wait 5 more minutes:** Netlify build queues can occasionally take longer at peak times.
4. **Still nothing?** Write to Alberto with: (a) what you changed, (b) when you clicked Publish, (c) a screenshot of the CMS showing the change saved. He'll check the Netlify build log.

---

## 10. Where the content lives

Everything you edit through the CMS is stored as plain text files in a GitHub repository (`sito-viglions`). You don't need to interact with GitHub — Sveltia handles it — but knowing this means:

- **You can't lose data accidentally.** Every change is a Git commit; Alberto can restore any prior version.
- **You can export the whole site.** If one day you want to move to a different platform, all your content is in human-readable Markdown and JSON files.
- **Drafts don't pollute the live site.** A Save without Publish stays as an unpublished draft in the CMS only.

---

## 11. Quick reference

| Task | Section | Action |
|------|---------|--------|
| Update bio / affiliation | Site → entry | Edit fields → Save → Publish |
| Change colors / sections shown | Site → Theme settings | Pick palette, edit hidden sections → Save → Publish |
| Add a publication | Publications → New | Fill fields → Save → Publish |
| Add a talk | Talks → New | Fill fields → Save → Publish |
| Add news item | News → New | Choose kind (upcoming/recent/award/visit) → Save → Publish |
| Replace CV | Site → CV PDF | Upload new PDF → Save → Publish |
| Change photo | Site → Photo | Upload new image → Save → Publish |
| Highlight news permanently | News → entry | Toggle Pinned → Save → Publish |

---

That's it. The CMS is intentionally minimal — if you find yourself wanting a feature that isn't there, write to Alberto rather than working around it; it's probably 10 minutes of work to add.
