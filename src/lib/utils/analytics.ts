type AnalyticsPayload = {
	event_type: string;
	path?: string;
	section?: string;
	metadata?: Record<string, unknown>;
};

export async function trackEvent(payload: AnalyticsPayload) {
	if (typeof window === 'undefined') return;
	try {
		await fetch('/api/analytics', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...payload,
				path: payload.path ?? window.location.pathname
			}),
			keepalive: true
		});
	} catch {
		/* non-blocking */
	}
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
