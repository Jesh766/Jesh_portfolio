# Jayshil Thakkar — Portfolio

Production portfolio: SvelteKit, Threlte, GSAP, Lenis, Tailwind, Supabase.

## Setup

```bash
npm install
cp .env.example .env
```

Replace `static/images/jayshil-portrait.jpg` with your professional portrait (same filename). A placeholder JPG/SVG ships until you add the real photo.

Replace `static/resume.pdf` with your resume.

### Environment

| Variable | Description |
|----------|-------------|
| `PUBLIC_SITE_URL` | Canonical site URL |
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server only) |
| `RESEND_API_KEY` | Optional — contact email via Resend |
| `CONTACT_FROM_EMAIL` | Verified Resend sender |
| `CONTACT_TO_EMAIL` | Inbox for contact notifications |

## Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/001_initial.sql` in the SQL editor.
3. Add env vars to `.env` and Vercel.

Tables: `contact_submissions`, `analytics_events`, `resume_downloads`.

## Development

```bash
npm run dev
```

## Deploy (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Framework preset: **SvelteKit**.
3. Add all environment variables from `.env.example`.
4. Vercel sets `VERCEL=1` during build — the project uses `@sveltejs/adapter-vercel` automatically on Vercel; local `npm run build` uses `adapter-node` (Windows symlink limitation).

## Build

```bash
npm run build
npm run preview
```

## API

- `POST /api/contact` — contact form
- `POST /api/analytics` — analytics events
- `POST /api/resume` — resume download tracking
