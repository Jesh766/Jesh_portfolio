import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { ADMIN_COOKIE, isAdminSession } from '$lib/server/admin';

export const prerender = false;

export const GET: RequestHandler = async ({ cookies, url }) => {
	if (!isAdminSession(cookies.get(ADMIN_COOKIE)))
		return json({ error: 'Unauthorized' }, { status: 401 });
	const supabase = getSupabaseAdmin();
	if (!supabase) return json({ totals: {}, sections: [], trafficSources: [], sessions: [], recent: [] });
	const isAllTime = url.searchParams.get('range') === 'all';
	const requestedOffset = Number(url.searchParams.get('tzOffset') ?? 0);
	const timezoneOffset = Number.isFinite(requestedOffset) ? Math.min(840, Math.max(-840, requestedOffset)) : 0;
	const requestedDays = Number(url.searchParams.get('days') ?? 30);
	const days = Number.isFinite(requestedDays)
		? Math.min(90, Math.max(1, Math.floor(requestedDays)))
		: 30;
	const localNow = new Date(Date.now() - timezoneOffset * 60000);
	const localToday = new Date(Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate()));
	const todayDate = new Date(localToday.getTime() + timezoneOffset * 60000);
	const localStart = new Date(localToday);
	localStart.setUTCDate(localStart.getUTCDate() - (days - 1));
	const sinceDate = new Date(localStart.getTime() + timezoneOffset * 60000);
	let eventsQuery = supabase
		.from('analytics_events')
		.select('event_type, page_path, section_id, metadata, session_id, duration_ms, created_at')
		.order('created_at', { ascending: false })
		.limit(5000);
	if (!isAllTime) eventsQuery = eventsQuery.gte('created_at', sinceDate.toISOString());
	const { data, error } = await eventsQuery;
	if (error) return json({ error: 'Unable to load analytics.' }, { status: 500 });
	const events = (data ?? []).filter((event) => !event.page_path?.startsWith('/admin'));
	const sessions = new Set(events.map((event) => event.session_id).filter(Boolean));
	const pageViews = events.filter((event) => event.event_type === 'page_view');
	const localDateKey = (timestamp: string) => new Date(new Date(timestamp).getTime() - timezoneOffset * 60000).toISOString().slice(0, 10);
	const chartStartKey = isAllTime
		? localDateKey(pageViews.at(-1)?.created_at ?? sinceDate.toISOString())
		: localStart.toISOString().slice(0, 10);
	const chartStartDate = new Date(`${chartStartKey}T00:00:00Z`);
	const chartDays = isAllTime
		? Math.max(1, Math.floor((localToday.getTime() - chartStartDate.getTime()) / 86400000) + 1)
		: days;
	const dailyViewCounts = new Map<string, number>();
	for (let index = 0; index < chartDays; index += 1) {
		const date = new Date(chartStartDate);
		date.setUTCDate(date.getUTCDate() + index);
		dailyViewCounts.set(date.toISOString().slice(0, 10), 0);
	}
	for (const event of pageViews) {
		const date = event.created_at ? localDateKey(event.created_at) : undefined;
		if (date && dailyViewCounts.has(date)) dailyViewCounts.set(date, (dailyViewCounts.get(date) ?? 0) + 1);
	}
	const sectionCounts = new Map<string, number>();
	const sourceCounts = new Map<string, number>();
	const sessionSummaries = new Map<string, { session_id: string; source: string; duration_ms: number; first_seen: string; last_seen: string; pages: Set<string>; sections: Set<string> }>();
	for (const event of events.filter(
		(item) => item.event_type === 'section_view' && item.section_id
	)) {
		sectionCounts.set(
			event.section_id as string,
			(sectionCounts.get(event.section_id as string) ?? 0) + 1
		);
	}
	for (const event of events) {
		const metadata = !!event.metadata && typeof event.metadata === 'object' ? event.metadata as Record<string, unknown> : {};
		const source = typeof metadata.source === 'string' && metadata.source
			? metadata.source
			: typeof metadata.utm_source === 'string' && metadata.utm_source
				? metadata.utm_source
				: typeof metadata.referrer_host === 'string' && metadata.referrer_host
					? metadata.referrer_host
					: 'direct';
		sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
		if (typeof event.session_id === 'string' && event.session_id) {
			const summary = sessionSummaries.get(event.session_id) ?? {
				session_id: event.session_id,
				source,
				duration_ms: 0,
				first_seen: event.created_at ?? new Date().toISOString(),
				last_seen: event.created_at ?? new Date().toISOString(),
				pages: new Set<string>(),
				sections: new Set<string>()
			};
			summary.source = summary.source || source;
			if (event.created_at) {
				if (new Date(event.created_at).getTime() < new Date(summary.first_seen).getTime()) summary.first_seen = event.created_at;
				if (new Date(event.created_at).getTime() > new Date(summary.last_seen).getTime()) summary.last_seen = event.created_at;
			}
			summary.duration_ms = Math.max(0, new Date(summary.last_seen).getTime() - new Date(summary.first_seen).getTime());
			if (typeof event.page_path === 'string' && event.page_path) summary.pages.add(event.page_path);
			if (typeof event.section_id === 'string' && event.section_id) summary.sections.add(event.section_id);
			sessionSummaries.set(event.session_id, summary);
		}
	}
	const sessionDurations = [...sessionSummaries.values()]
		.map((session) => session.duration_ms)
		.filter((value) => value > 0);
	sourceCounts.clear();
	for (const session of sessionSummaries.values()) {
		sourceCounts.set(session.source, (sourceCounts.get(session.source) ?? 0) + 1);
	}
	const trafficSources = [...sourceCounts.entries()]
		.map(([source, visits]) => ({ source, visits }))
		.sort((a, b) => b.visits - a.visits)
		.slice(0, 10);
	const sessionData = [...sessionSummaries.values()]
		.map((session) => ({
			session_id: session.session_id,
			source: session.source,
			duration_ms: session.duration_ms,
			last_seen: session.last_seen,
			pages: [...session.pages],
			sections: [...session.sections]
		}))
		.sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime())
		.slice(0, 20);
	return json({
		totals: {
			visitors: sessions.size,
			pageViews: pageViews.length,
			averageDurationMs: sessionDurations.length
				? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
				: 0,
			days: isAllTime ? null : days,
			periodLabel: isAllTime ? 'Total views' : days === 1 ? 'Today' : `Last ${days} days`
		},
		sections: [...sectionCounts.entries()]
			.map(([section, views]) => ({ section, views }))
			.sort((a, b) => b.views - a.views),
		trafficSources,
		dailyViews: [...dailyViewCounts.entries()].map(([date, views]) => ({ date, views })),
		sessions: sessionData,
		recent: events
			.slice(0, 100)
			.map(({ event_type, page_path, section_id, metadata, duration_ms, created_at }) => ({
				event_type,
				page_path,
				section_id,
				metadata,
				duration_ms,
				created_at
			}))
	});
};
