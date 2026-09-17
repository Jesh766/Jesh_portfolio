import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { ADMIN_COOKIE, isAdminSession } from '$lib/server/admin';

export const prerender = false;

function authorized(cookies: Parameters<RequestHandler>[0]['cookies']) {
	return isAdminSession(cookies.get(ADMIN_COOKIE));
}

export const GET: RequestHandler = async ({ cookies }) => {
	if (!authorized(cookies)) return json({ error: 'Unauthorized' }, { status: 401 });
	const supabase = getSupabaseAdmin();
	if (!supabase) return json({ content: {}, updated_at: null });
	const { data, error } = await supabase.from('portfolio_content').select('content, draft_content, updated_at').eq('id', 'default').maybeSingle();
	if (error) return json({ error: 'Unable to load content.' }, { status: 500 });
	return json(data ?? { content: {}, draft_content: null, updated_at: null });
};

export const PUT: RequestHandler = async ({ cookies, request }) => {
	if (!authorized(cookies)) return json({ error: 'Unauthorized' }, { status: 401 });
	const body = await request.json().catch(() => ({}));
	if (!body.content || typeof body.content !== 'object' || Array.isArray(body.content)) {
		return json({ error: 'Content must be a JSON object.' }, { status: 400 });
	}
	const action = body.action === 'publish' ? 'publish' : 'draft';
	const supabase = getSupabaseAdmin();
	if (!supabase) return json({ error: 'Supabase is not configured.' }, { status: 503 });
	const values: {
		id: string;
		content?: unknown;
		draft_content?: unknown;
		updated_at: string;
	} = action === 'publish'
		? { id: 'default', content: body.content, draft_content: null, updated_at: new Date().toISOString() }
		: { id: 'default', draft_content: body.content, updated_at: new Date().toISOString() };
	const { data, error } = await supabase
		.from('portfolio_content')
		.upsert(values)
		.select('content, draft_content, updated_at')
		.single();
	if (error) return json({ error: 'Unable to save content.' }, { status: 500 });
	return json(data);
};
