# Contact form

The contact form posts to the server-side `/api/contact` endpoint. It stores submissions in Supabase and optionally sends a notification through Resend. No email provider key is exposed to the browser.

## 1. Fill `.env`

Copy `.env.example` to `.env` in the project root and replace the placeholders:

```bash
cp .env.example .env
```

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
RESEND_API_KEY=re_xxxxx
CONTACT_FROM_EMAIL=Portfolio <hello@your-domain.com>
CONTACT_TO_EMAIL=you@example.com
```

Restart the dev server after changing env vars.

## 3. Test locally

```bash
npm run dev
```

Open the site, scroll to **Contact**, and submit the form with valid values. The form validates again on the server. Supabase is required for storing submissions; Resend is optional for email notifications.
