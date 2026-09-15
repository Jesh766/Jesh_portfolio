import { SITE } from '$lib/data/site';

export const contentState = $state({
	site: { ...SITE },
	projects: [] as unknown[]
});

export async function loadPublishedContent() {
	try {
		const response = await fetch('/api/content');
		if (!response.ok) return;
		const payload = await response.json();
		if (payload.content?.site && typeof payload.content.site === 'object') {
			Object.assign(contentState.site, payload.content.site);
		}
		if (Array.isArray(payload.content?.projects)) contentState.projects = payload.content.projects;
	} catch {
		/* Static defaults remain active when the CMS is unavailable. */
	}
}
