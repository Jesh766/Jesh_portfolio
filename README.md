# Jayshil Thakkar — Portfolio

Production portfolio: SvelteKit, Threlte, GSAP, Lenis, Tailwind, Supabase.

## Setup

```bash
npm install
cp .env.example .env
```

The hero uses `static/images/jayshil-portrait.png` and `static/images/jayshil-portrait-hover.jpg`. Replace those files only if you want to change the portrait while preserving the existing hero treatment.

Replace `static/resume.pdf` with your resume.

### Environment

| Variable                    | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| `PUBLIC_SITE_URL`           | Canonical site URL                                       |
| `PUBLIC_SUPABASE_URL`       | Supabase project URL                                     |
| `PUBLIC_SUPABASE_ANON_KEY`  | Supabase anon key                                        |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server only)                               |
| `ADMIN_PASSWORD`            | Password for `/admin` (server only)                      |
| `ADMIN_SESSION_SECRET`      | Long random secret used to sign the admin session cookie |
| `RESEND_API_KEY`            | Optional — contact email via Resend                      |
| `CONTACT_FROM_EMAIL`        | Verified Resend sender                                   |
| `CONTACT_TO_EMAIL`          | Inbox for contact notifications                          |

## Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/001_initial.sql` and then `supabase/migrations/002_admin_content.sql` in the SQL editor.
3. Add env vars to `.env` and Vercel.

### Admin workspace

Open `/admin` after deployment. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in the server environment before signing in. The dashboard provides a visual editor for site identity, hero copy, and repeatable projects, with private drafts and an explicit publish action. Content is stored in the `portfolio_content` table and the dashboard shows session, page-view, section-view, duration, and coarse cursor-grid telemetry. The analytics tables retain IP address and user agent for operational abuse review; no raw cursor trails are stored and the dashboard does not display visitor IP addresses.

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

- `POST /api/contact` — validated server-side contact form; stores in Supabase and optionally notifies through Resend
- `POST /api/analytics` — analytics events
- `POST /api/resume` — resume download tracking
