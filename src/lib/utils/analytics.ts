type AnalyticsPayload = {
	event_type: string;
	path?: string;
	section?: string;
	metadata?: Record<string, unknown>;
	duration_ms?: number;
};

const SESSION_KEY = 'portfolio_analytics_session';

function getSessionId() {
	let sessionId = sessionStorage.getItem(SESSION_KEY);
	if (!sessionId) {
		sessionId = crypto.randomUUID();
		sessionStorage.setItem(SESSION_KEY, sessionId);
	}
	return sessionId;
}

function getTrafficMetadata(overrides: Record<string, unknown> = {}) {
	if (typeof window === 'undefined') return overrides;
	const params = new URLSearchParams(window.location.search);
	const referrer = document.referrer || '';
	let referrerHost = '';
	try {
		if (referrer) {
			referrerHost = new URL(referrer).hostname.replace(/^www\./, '');
		}
	} catch {
		referrerHost = '';
	}
	const utmSource = params.get('utm_source') ?? '';
	const utmMedium = params.get('utm_medium') ?? '';
	const utmCampaign = params.get('utm_campaign') ?? '';
	const source = utmSource || referrerHost || 'direct';
	return {
		source,
		referrer,
		referrer_host: referrerHost,
		utm_source: utmSource,
		utm_medium: utmMedium,
		utm_campaign: utmCampaign,
		landing_page: window.location.pathname,
		...overrides
	};
}

export async function trackEvent(payload: AnalyticsPayload) {
	if (typeof window === 'undefined') return;
	try {
		const metadata = getTrafficMetadata(payload.metadata ?? {});
		await fetch('/api/analytics', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...payload,
				path: payload.path ?? window.location.pathname,
				session_id: getSessionId(),
				metadata
			}),
			keepalive: true
		});
	} catch {
		/* non-blocking */
	}
}

export function startSessionTracking() {
	if (typeof window === 'undefined') return () => {};
	const startedAt = Date.now();
	trackEvent({ event_type: 'session_start' });
	const heartbeat = window.setInterval(() => trackEvent({ event_type: 'session_heartbeat', duration_ms: Date.now() - startedAt }), 30000);
	const finish = () => trackEvent({ event_type: 'session_end', duration_ms: Date.now() - startedAt });
	window.addEventListener('pagehide', finish, { once: true });
	return () => {
		window.clearInterval(heartbeat);
		window.removeEventListener('pagehide', finish);
	};
}

export function startCursorSampling() {
	if (typeof window === 'undefined') return () => {};
	let lastSent = 0;
	const onMove = (event: PointerEvent) => {
		const now = Date.now();
		if (now - lastSent < 1500) return;
		lastSent = now;
		trackEvent({
			event_type: 'cursor_grid',
			metadata: {
				x: Math.min(9, Math.floor((event.clientX / window.innerWidth) * 10)),
				y: Math.min(9, Math.floor((event.clientY / window.innerHeight) * 10))
			}
		});
	};
	window.addEventListener('pointermove', onMove, { passive: true });
	return () => window.removeEventListener('pointermove', onMove);
}

export function observeSections(sectionIds: string[], onView: (id: string) => void) {
	if (typeof window === 'undefined') return () => {};
	const seen = new Set<string>();
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const id = entry.target.id;
				if (!id || seen.has(id)) continue;
				seen.add(id);
				onView(id);
			}
		},
		{ threshold: 0.35, rootMargin: '0px 0px -10% 0px' }
	);
	for (const id of sectionIds) {
		const el = document.getElementById(id);
		if (el) observer.observe(el);
	}
	return () => observer.disconnect();
}
