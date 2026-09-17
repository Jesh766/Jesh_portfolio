import type {
	Achievement,
	Certification,
	Project,
	SiteConfig,
	SkillCategory,
	TimelineEntry
} from '$lib/data/site';
import {
	ACHIEVEMENTS,
	CERTIFICATIONS,
	PROJECTS,
	SITE,
	SKILLS_CATEGORIZED,
	TIMELINE
} from '$lib/data/site';

export const contentState = $state<{
	site: SiteConfig;
	projects: Project[];
	journey: TimelineEntry[];
	skills: SkillCategory[];
	certifications: Certification[];
	achievements: Achievement[];
	contact: {
		email: string;
		phone: string;
	};
}>({
	site: { ...SITE },
	projects: structuredClone(PROJECTS),
	journey: structuredClone(TIMELINE),
	skills: structuredClone(SKILLS_CATEGORIZED),
	certifications: structuredClone(CERTIFICATIONS),
	achievements: structuredClone(ACHIEVEMENTS),
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
		if (Array.isArray(payload.content?.projects)) contentState.projects = payload.content.projects as Project[];
		if (Array.isArray(payload.content?.journey)) contentState.journey = payload.content.journey as TimelineEntry[];
		if (Array.isArray(payload.content?.skills)) contentState.skills = payload.content.skills as SkillCategory[];
		if (Array.isArray(payload.content?.certifications)) contentState.certifications = payload.content.certifications as Certification[];
		if (Array.isArray(payload.content?.achievements)) contentState.achievements = payload.content.achievements as Achievement[];
		if (payload.content?.contact && typeof payload.content.contact === 'object') {
			contentState.contact = { ...contentState.contact, ...payload.content.contact };
		}
	} catch {
		/* Static defaults remain active when the CMS is unavailable. */
	}
}
