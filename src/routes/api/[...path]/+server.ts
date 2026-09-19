import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { env } from '$env/dynamic/private';
import {
	RequestValidationError,
	readJsonBody,
	validateAnalyticsPayload,
	validateContactPayload
} from '$lib/server/validation';

export const prerender = false;

const requestWindows = new Map<string, { startedAt: number; count: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30;

function isRateLimited(ip: string) {
	const now = Date.now();
	const current = requestWindows.get(ip);
	if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
		requestWindows.set(ip, { startedAt: now, count: 1 });
		return false;
	}
	current.count += 1;
	return current.count > RATE_LIMIT;
}

export const POST: RequestHandler = async ({ params, request, getClientAddress }) => {
	const segment = params.path ?? '';
	if (isRateLimited(getClientAddress()))
		return json({ error: 'Too many requests. Try again later.' }, { status: 429 });

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

async function handleContact(request: Request, getClientAddress: () => string): Promise<Response> {
	let body: unknown;
	try {
		body = await readJsonBody(request, 12 * 1024);
	} catch (error) {
		return json(
			{ error: error instanceof RequestValidationError ? error.message : 'Invalid request.' },
			{ status: 400 }
		);
	}
	let contact: { name: string; email: string; message: string };
	try {
		contact = validateContactPayload(body);
	} catch (error) {
		return json(
			{
				error: error instanceof RequestValidationError ? error.message : 'Invalid contact details.'
			},
			{ status: 400 }
		);
	}

	const supabase = getSupabaseAdmin();
	let saved = false;
	if (supabase) {
		const { error } = await supabase.from('contact_submissions').insert({
			name: contact.name,
			email: contact.email,
			message: contact.message,
			ip_address: getClientAddress(),
			user_agent: request.headers.get('user-agent')
		});
		if (error) {
			console.error('contact insert', error);
			return json({ error: 'Failed to save message.' }, { status: 500 });
		}
		saved = true;
	}

	let notified = false;
	if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) {
		if (saved) return json({ success: true, notified: false });
		return json(
			{
				error: saved
					? 'Message saved, but email notifications are not configured. Add RESEND_API_KEY and CONTACT_TO_EMAIL.'
					: 'Contact email service is not configured.'
			},
			{ status: 503 }
		);
	}
	if (env.RESEND_API_KEY && env.CONTACT_TO_EMAIL) {
		try {
			const response = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${env.RESEND_API_KEY}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					from: env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
					to: [env.CONTACT_TO_EMAIL],
					reply_to: contact.email,
					subject: `Portfolio contact from ${contact.name}`,
					text: `Name: ${contact.name}\nEmail: ${contact.email}\n\n${contact.message}`
				})
			});
			if (!response.ok) {
				const details = await response.text().catch(() => '');
				console.error('resend response', response.status, details);
				if (saved) return json({ success: true, notified: false });
				return json(
					{ error: saved ? 'Message saved, but the email notification could not be sent.' : 'Unable to send message right now.' },
					{ status: 502 }
				);
			} else {
				notified = true;
			}
		} catch (e) {
			console.error('resend', e);
			if (saved) return json({ success: true, notified: false });
			return json(
				{ error: saved ? 'Message saved, but the email notification could not be sent.' : 'Unable to send message right now.' },
				{ status: 502 }
			);
		}
	}

	if (!saved && !notified)
		return json({ error: 'Contact service is not configured.' }, { status: 503 });
	return json({ success: true });
}

async function handleAnalytics(
	request: Request,
	getClientAddress: () => string
): Promise<Response> {
	let body: unknown;
	try {
		body = await readJsonBody(request, 12 * 1024);
	} catch (error) {
		return json(
			{ error: error instanceof RequestValidationError ? error.message : 'Invalid request.' },
			{ status: 400 }
		);
	}
	let analytics;
	try {
		analytics = validateAnalyticsPayload(body);
	} catch (error) {
		return json(
			{
				error: error instanceof RequestValidationError ? error.message : 'Invalid analytics event.'
			},
			{ status: 400 }
		);
	}

	const supabase = getSupabaseAdmin();
	if (supabase) {
		const { error } = await supabase.from('analytics_events').insert({
			event_type: analytics.event_type,
			page_path: analytics.page_path,
			section_id: analytics.section_id,
			metadata: analytics.metadata,
			session_id: analytics.session_id,
			duration_ms: analytics.duration_ms,
			ip_address: getClientAddress(),
			user_agent: request.headers.get('user-agent')
		});
		if (error) console.error('analytics insert', error);
	}

	return json({ success: true });
}

async function handleResume(request: Request, getClientAddress: () => string): Promise<Response> {
	let body: unknown;
	try {
		body = await readJsonBody(request, 4 * 1024);
	} catch (error) {
		return json(
			{ error: error instanceof RequestValidationError ? error.message : 'Invalid request.' },
			{ status: 400 }
		);
	}
	const source =
		typeof body === 'object' &&
		body !== null &&
		!Array.isArray(body) &&
		'source' in body &&
		typeof body.source === 'string'
			? body.source.trim().slice(0, 80)
			: 'hero';

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
