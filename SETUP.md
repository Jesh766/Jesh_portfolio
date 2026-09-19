It stores submissions in Supabase and sends a notification through Resend. No email provider key is exposed to the browser.
Supabase stores the submission, and Resend must be configured for the form to report a successful email delivery.
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

For the admin AI assistant, add a server-only `GEMINI_API_KEY`. It uses `gemini-3.6-flash` by default; set `GEMINI_MODEL` to another supported model when needed. You can also add `XAI_API_KEY` for automatic Grok fallback, with `XAI_MODEL` defaulting to `grok-3-mini`. The dashboard uses Analytics mode for questions; `/?editor=1` uses Editor mode for validated content changes. Never prefix these keys with `PUBLIC_`.

## Microsoft Clarity analytics

Clarity is Microsoft Clarity, not Google Analytics. To enable session recordings and heatmaps:

1. Open [clarity.microsoft.com](https://clarity.microsoft.com) and create a project.
2. Use your portfolio domain when prompted.
3. Copy the project ID from the project settings or tracking setup screen.
4. Add it to your local `.env`:

```env
PUBLIC_CLARITY_PROJECT_ID=your-clarity-project-id
```

After restarting the dev server, the admin dashboard shows a **Clarity** shortcut. The integration is optional and does not require a secret key.

## 3. Test locally

```bash
npm run dev
```

Open the site, scroll to **Contact**, and submit the form with valid values. The form validates again on the server. Supabase is required for storing submissions; Resend is optional for email notifications.
