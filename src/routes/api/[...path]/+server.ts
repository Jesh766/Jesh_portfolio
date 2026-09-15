import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { env } from '$env/dynamic/private';

export const prerender = false;

export const POST: RequestHandler = async ({ params, request, getClientAddress }) => {
	const segment = params.path ?? '';

	if (segment === 'contact') {
		return handleContact(request, getClientAddress);
	}
	if (segment === 'analytics') {
		return handleAnalytics(request, getClientAddress);
	}
	if (segment === 'resume') {
		return handleResume(request, getClientAddress);
	}

	return json({ error: 'Not found' }, { status: 404 });
};

async function handleContact(
	request: Request,
	getClientAddress: () => string
): Promise<Response> {
	const body = await request.json();
	const name = String(body.name ?? '').trim();
	const email = String(body.email ?? '').trim();
	const message = String(body.message ?? '').trim();

	if (!name || !email || !message) {
		return json({ error: 'All fields are required.' }, { status: 400 });
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return json({ error: 'Invalid email address.' }, { status: 400 });
	}

	const supabase = getSupabaseAdmin();
	if (supabase) {
		const { error } = await supabase.from('contact_submissions').insert({
			name,
			email,
			message,
			ip_address: getClientAddress(),
			user_agent: request.headers.get('user-agent')
		});
		if (error) {
			console.error('contact insert', error);
			return json({ error: 'Failed to save message.' }, { status: 500 });
		}
	}

	if (env.RESEND_API_KEY && env.CONTACT_TO_EMAIL) {
		try {
			await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${env.RESEND_API_KEY}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					from: env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
					to: [env.CONTACT_TO_EMAIL],
					reply_to: email,
					subject: `Portfolio contact from ${name}`,
					text: `Name: ${name}\nEmail: ${email}\n\n${message}`
				})
			});
		} catch (e) {
			console.error('resend', e);
		}
	}

	return json({ success: true });
}

async function handleAnalytics(
	request: Request,
	getClientAddress: () => string
): Promise<Response> {
	const body = await request.json();
	const event_type = String(body.event_type ?? '').trim();
	if (!event_type) {
		return json({ error: 'event_type required' }, { status: 400 });
	}

	const supabase = getSupabaseAdmin();
	if (supabase) {
		await supabase.from('analytics_events').insert({
			event_type,
			page_path: body.page_path ?? body.path ?? null,
			section_id: body.section_id ?? body.section ?? null,
			metadata: body.metadata ?? {},
					session_id: body.session_id ?? null,
					duration_ms: Number.isFinite(body.duration_ms) ? body.duration_ms : null,
			ip_address: getClientAddress(),
			user_agent: request.headers.get('user-agent')
		});
	}

	return json({ success: true });
}

async function handleResume(
	request: Request,
	getClientAddress: () => string
): Promise<Response> {
	const body = await request.json().catch(() => ({}));
	const source = String(body.source ?? 'hero').trim();

	const supabase = getSupabaseAdmin();
	if (supabase) {
		await supabase.from('resume_downloads').insert({
			source,
			ip_address: getClientAddress(),
			user_agent: request.headers.get('user-agent')
		});
	}

	return json({ success: true });
}
