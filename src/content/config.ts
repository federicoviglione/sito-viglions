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
      url: z.string().url().or(z.literal('')).optional(),
    })).optional(),
    memberships: z.array(z.object({
      name: z.string(),
      role: z.string().optional(),
      period: z.string().optional(),
      url: z.string().url().or(z.literal('')).optional(),
    })).optional(),
    project_memberships: z.array(z.object({
      name: z.string(),
      period: z.string(),
      role: z.string().optional(),
      url: z.string().url().or(z.literal('')).optional(),
    })).optional(),
    peer_review_for: z.array(z.string()).optional(),
    selected_talks: z.array(z.string()).optional(),
    theme: z.object({
      palette: z.enum(['bianca', 'bordeaux', 'blu', 'foresta', 'ambra']).default('bianca'),
      show_photo: z.boolean().default(true),
      hero_name_size: z.enum(['compact', 'default', 'large']).default('default'),
      hidden_sections: z
        .array(z.enum(['publications', 'projects', 'talks', 'news', 'organized_events']))
        .default(['news', 'organized_events']),
      section_order: z
        .array(z.enum(['about', 'publications', 'projects', 'talks', 'news', 'organized_events']))
        .refine(
          (arr) => arr.includes('about'),
          { message: "section_order must include 'about'" }
        )
        .default(['about', 'publications', 'projects', 'talks', 'news', 'organized_events']),
    }).default({
      palette: 'bianca',
      show_photo: true,
      hero_name_size: 'default',
      hidden_sections: ['news', 'organized_events'],
      section_order: ['about', 'publications', 'projects', 'talks', 'news', 'organized_events'],
    }),
  }),
});

const bioCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
  }),
});

const newsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    kind: z.enum(['upcoming', 'recent', 'award', 'visit']),
    summary: z.string(),
    url: z.string().url().or(z.literal('')).optional(),
    pinned: z.boolean().default(false),
  }),
});

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
    url: z.string().url().or(z.literal('')).optional(),
    abstract: z.string().optional(),
    bibtex: z.string().optional(),
    coauthors_note: z.string().optional(),
    order: z.number().default(99),
  }),
});

const talksCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    venue: z.string(),
    location: z.string().optional(),
    date: z.coerce.date(),
    type: z.enum(['invited', 'contributed', 'keynote', 'seminar', 'workshop']),
    url: z.string().url().or(z.literal('')).optional(),
    slides_url: z.string().url().or(z.literal('')).optional(),
    video_url: z.string().url().or(z.literal('')).optional(),
    abstract: z.string().optional(),
  }),
});

const organizedEventsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    role: z.enum(['organizer', 'co-organizer', 'program-committee', 'coordinator', 'committee-member']),
    venue: z.string(),
    location: z.string().optional(),
    start_date: z.coerce.date(),
    end_date: z.coerce.date().optional(),
    url: z.string().url().or(z.literal('')).optional(),
    co_organizers: z.string().optional(),
    description: z.string().optional(),
    order: z.number().default(99),
  }),
});

export const collections = {
  site: siteCollection,
  bio: bioCollection,
  news: newsCollection,
  publications: publicationsCollection,
  talks: talksCollection,
  organized_events: organizedEventsCollection,
};
