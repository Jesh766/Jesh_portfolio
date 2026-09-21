import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { ADMIN_COOKIE, isAdminSession } from '$lib/server/admin';
import {
	normalizePortfolioContent,
	RequestValidationError,
	readJsonBody,
	validatePortfolioContent
} from '$lib/server/validation';

export const prerender = false;

function authorized(cookies: Parameters<RequestHandler>[0]['cookies']) {
	return isAdminSession(cookies.get(ADMIN_COOKIE));
}

export const GET: RequestHandler = async ({ cookies }) => {
	if (!authorized(cookies)) return json({ error: 'Unauthorized' }, { status: 401 });
	const supabase = getSupabaseAdmin();
	if (!supabase) return json({ content: {}, updated_at: null });
	const { data, error } = await supabase
		.from('portfolio_content')
		.select('content, draft_content, updated_at')
		.eq('id', 'default')
		.maybeSingle();
	if (error) return json({ error: 'Unable to load content.' }, { status: 500 });
	return json(data ? { ...data, content: normalizePortfolioContent(data.content), draft_content: normalizePortfolioContent(data.draft_content) } : { content: {}, draft_content: null, updated_at: null });
};

export const PUT: RequestHandler = async ({ cookies, request }) => {
	if (!authorized(cookies)) return json({ error: 'Unauthorized' }, { status: 401 });
	let body: unknown;
	try {
		body = await readJsonBody(request);
	} catch (error) {
		return json(
			{ error: error instanceof RequestValidationError ? error.message : 'Invalid request.' },
			{ status: 400 }
		);
	}
	if (!body || typeof body !== 'object' || Array.isArray(body) || !('content' in body))
		return json({ error: 'Content must be a JSON object.' }, { status: 400 });
	const requestBody = body as Record<string, unknown>;
	let content: unknown;
	try {
		content = validatePortfolioContent(normalizePortfolioContent(requestBody.content));
	} catch (error) {
		return json(
			{ error: error instanceof RequestValidationError ? error.message : 'Invalid content.' },
			{ status: 400 }
		);
	}
	const action =
		requestBody.action === 'publish' ? 'publish' : requestBody.action === 'draft' ? 'draft' : null;
	if (!action) return json({ error: 'Action must be draft or publish.' }, { status: 400 });
	const supabase = getSupabaseAdmin();
	if (!supabase) return json({ error: 'Supabase is not configured.' }, { status: 503 });
	const values: {
		id: string;
		content?: unknown;
		draft_content?: unknown;
		updated_at: string;
	} =
		action === 'publish'
			? { id: 'default', content, draft_content: null, updated_at: new Date().toISOString() }
			: { id: 'default', draft_content: content, updated_at: new Date().toISOString() };
	const { data, error } = await supabase
		.from('portfolio_content')
		.upsert(values)
		.select('content, draft_content, updated_at')
		.single();
	if (error) return json({ error: 'Unable to save content.' }, { status: 500 });
	return json(data);
};
