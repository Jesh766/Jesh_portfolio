import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { ADMIN_COOKIE, isAdminSession } from '$lib/server/admin';

export const prerender = false;

export const GET: RequestHandler = async ({ cookies, url }) => {
	if (!isAdminSession(cookies.get(ADMIN_COOKIE))) return json({ error: 'Unauthorized' }, { status: 401 });
	const supabase = getSupabaseAdmin();
	if (!supabase) return json({ totals: {}, sections: [], recent: [] });
	const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days') ?? 30)));
	const since = new Date(Date.now() - days * 86400000).toISOString();
	const { data, error } = await supabase
		.from('analytics_events')
		.select('event_type, page_path, section_id, metadata, session_id, duration_ms, created_at')
		.gte('created_at', since)
		.order('created_at', { ascending: false })
		.limit(5000);
	if (error) return json({ error: 'Unable to load analytics.' }, { status: 500 });
	const events = data ?? [];
	const sessions = new Set(events.map((event) => event.session_id).filter(Boolean));
	const pageViews = events.filter((event) => event.event_type === 'page_view');
	const sectionCounts = new Map<string, number>();
	for (const event of events.filter((item) => item.event_type === 'section_view' && item.section_id)) {
		sectionCounts.set(event.section_id as string, (sectionCounts.get(event.section_id as string) ?? 0) + 1);
	}
	const durations = events.map((event) => event.duration_ms ?? 0).filter((value) => value > 0);
	return json({
		totals: {
			visitors: sessions.size,
			pageViews: pageViews.length,
			averageDurationMs: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
			days
		},
		sections: [...sectionCounts.entries()].map(([section, views]) => ({ section, views })).sort((a, b) => b.views - a.views),
		recent: events.slice(0, 100).map(({ event_type, page_path, section_id, metadata, duration_ms, created_at }) => ({ event_type, page_path, section_id, metadata, duration_ms, created_at }))
	});
};
