import {
	ACHIEVEMENTS,
	CERTIFICATIONS,
	PROJECTS,
	SITE,
	SKILLS_CATEGORIZED,
	TIMELINE
} from '$lib/data/site';

export const contentState = $state({
	site: { ...SITE },
	projects: structuredClone(PROJECTS as unknown as Record<string, unknown>[]) as unknown[],
	journey: structuredClone(TIMELINE as unknown[]),
	skills: structuredClone(SKILLS_CATEGORIZED as unknown[]),
	certifications: structuredClone(CERTIFICATIONS as unknown[]),
	achievements: structuredClone(ACHIEVEMENTS as unknown[]),
	contact: {
		email: SITE.email,
		phone: SITE.phone
	}
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
		if (Array.isArray(payload.content?.journey)) contentState.journey = payload.content.journey;
		if (Array.isArray(payload.content?.skills)) contentState.skills = payload.content.skills;
		if (Array.isArray(payload.content?.certifications)) contentState.certifications = payload.content.certifications;
		if (Array.isArray(payload.content?.achievements)) contentState.achievements = payload.content.achievements;
		if (payload.content?.contact && typeof payload.content.contact === 'object') {
			contentState.contact = { ...contentState.contact, ...payload.content.contact };
		}
	} catch {
		/* Static defaults remain active when the CMS is unavailable. */
	}
}
