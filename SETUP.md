# Contact form (EmailJS)

## 1. Get EmailJS credentials

1. Sign up at [https://www.emailjs.com/](https://www.emailjs.com/).
2. Create an **Email Service** (Gmail, Outlook, etc.) and note the **Service ID**.
3. Create an **Email Template** with variables such as `from_name`, `from_email`, and `message` (match the names used in `Contact.svelte`).
4. Open **Account → API Keys** and copy your **Public Key**.

## 2. Fill `.env`

Copy `.env.example` to `.env` in the project root and replace the placeholders:

```bash
cp .env.example .env
```

```env
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

Restart the dev server after changing env vars.

## 3. Test locally

```bash
npm run dev
```

Open the site, scroll to **Contact**, submit the form with valid values. You should see a success toast when EmailJS accepts the send. If keys are missing or wrong, the form shows an error state with a message.
