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

export async function trackEvent(payload: AnalyticsPayload) {
	if (typeof window === 'undefined') return;
	try {
		await fetch('/api/analytics', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...payload,
				path: payload.path ?? window.location.pathname,
				session_id: getSessionId()
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
