# Jayshil Thakkar — Portfolio

Production portfolio: SvelteKit, Threlte, GSAP, Lenis, Tailwind, Supabase.

## Setup

```bash
npm install
cp .env.example .env
```

The hero uses `static/images/jayshil-portrait.png` and `static/images/jayshil-portrait-hover.jpg`. Replace those files only if you want to change the portrait while preserving the existing hero treatment.

Replace `static/resume.pdf` with your resume.

Before deployment, set `PUBLIC_SITE_URL` to your live domain. Until then, the local default is `http://localhost:5173`, which keeps metadata and social preview links working during development.

### Environment

| Variable                    | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| `PUBLIC_SITE_URL`           | Canonical site URL                                       |
| `PUBLIC_SUPABASE_URL`       | Supabase project URL                                     |
| `PUBLIC_SUPABASE_ANON_KEY`  | Supabase anon key                                        |
| `PUBLIC_CLARITY_PROJECT_ID` | Optional Microsoft Clarity project ID                    |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server only)                               |
| `ADMIN_PASSWORD`            | Password for `/admin` (server only)                      |
| `ADMIN_SESSION_SECRET`      | Long random secret used to sign the admin session cookie |
| `GEMINI_API_KEY`            | Server-only key for the admin AI assistant               |
| `GEMINI_MODEL`              | Optional Gemini model; defaults to `gemini-3.6-flash`   |
| `RESEND_API_KEY`            | Optional Resend API key for contact email notifications  |
| `CONTACT_FROM_EMAIL`        | Verified Resend sender, or `onboarding@resend.dev` locally |
| `CONTACT_TO_EMAIL`          | Inbox for contact notifications                          |
| `POST /api/contact` — validated server-side contact form; stores in Supabase and notifies through Resend

## Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/001_initial.sql` and then `supabase/migrations/002_admin_content.sql` in the SQL editor.
3. Add env vars to `.env` and Vercel.

### Admin workspace

Open `/admin` after deployment. Set `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, and `GEMINI_API_KEY` in the server environment before signing in. The dashboard assistant answers analytics questions; editor mode can prepare and publish validated content changes such as projects and certifications. Content is stored in the `portfolio_content` table and the dashboard shows session, page-view, section-view, duration, and coarse cursor-grid telemetry. The analytics tables retain IP address and user agent for operational abuse review; no raw cursor trails are stored and the dashboard does not display visitor IP addresses.

Tables: `contact_submissions`, `analytics_events`, `resume_downloads`.

### Microsoft Clarity

Microsoft Clarity provides session recordings, heatmaps, and interaction insights. Create a project at [clarity.microsoft.com](https://clarity.microsoft.com), copy its project ID, and add it to `.env`:

```env
PUBLIC_CLARITY_PROJECT_ID=your-clarity-project-id
```

Restart the dev server. The public site will load Clarity, and the admin dashboard will show a **Clarity** button linking directly to the project. Clarity is optional and disabled when this variable is empty.

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
