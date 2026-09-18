import type {
	Achievement,
	AboutContent,
	Certification,
	ContactContent,
	HeroStat,
	NavigationItem,
	PortfolioContent,
	Project,
	SEOContent,
	SiteConfig,
	SkillCategory,
	SocialLink,
	SectionSetting,
	TimelineEntry
} from '$lib/data/site';
import {
	ACHIEVEMENTS,
	CERTIFICATIONS,
	DEFAULT_ABOUT,
	DEFAULT_HERO_ROLES,
	DEFAULT_NAVIGATION,
	DEFAULT_SECTIONS,
	DEFAULT_SEO,
	DEFAULT_SOCIALS,
	HERO_STATS,
	PROJECTS,
	SITE,
	SKILLS_CATEGORIZED,
	TIMELINE
} from '$lib/data/site';

export const contentState = $state<PortfolioContent>({
	site: { ...SITE },
	navigation: structuredClone(DEFAULT_NAVIGATION),
	socials: structuredClone(DEFAULT_SOCIALS),
	heroRoles: structuredClone(DEFAULT_HERO_ROLES),
	heroStats: structuredClone(HERO_STATS),
	about: structuredClone(DEFAULT_ABOUT),
	seo: structuredClone(DEFAULT_SEO),
	sections: structuredClone(DEFAULT_SECTIONS),
	footer: { name: SITE.name, description: SITE.footerDescription ?? SITE.title, copyright: SITE.copyrightText ?? '© {year} · {title}' },
	projects: structuredClone(PROJECTS),
	journey: structuredClone(TIMELINE),
	skills: structuredClone(SKILLS_CATEGORIZED),
	certifications: structuredClone(CERTIFICATIONS),
	achievements: structuredClone(ACHIEVEMENTS),
	contact: {
		email: SITE.email,
		phone: SITE.phone,
		location: SITE.location,
		formTitle: 'Contact',
		formDescription: "Let's build something remarkable",
		nameLabel: 'Name',
		emailLabel: 'Email',
		messageLabel: 'Message',
		submitLabel: 'Send message',
		successMessage: "Message sent successfully. I'll get back to you soon.",
		errorMessage: 'Failed to send message. Please try again later.'
	}
});

export async function loadPublishedContent() {
	try {
		const preview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1';
		const response = await fetch(preview ? '/api/content?preview=1' : '/api/content');
		if (!response.ok) return;
		const payload = await response.json();
		if (payload.content?.site && typeof payload.content.site === 'object') {
			Object.assign(contentState.site, payload.content.site);
		}
		if (Array.isArray(payload.content?.navigation)) contentState.navigation = payload.content.navigation as NavigationItem[];
		if (Array.isArray(payload.content?.socials)) contentState.socials = payload.content.socials as SocialLink[];
		if (Array.isArray(payload.content?.heroRoles)) contentState.heroRoles = payload.content.heroRoles as string[];
		if (Array.isArray(payload.content?.heroStats)) contentState.heroStats = payload.content.heroStats as HeroStat[];
		if (payload.content?.about && typeof payload.content.about === 'object') contentState.about = { ...contentState.about, ...payload.content.about } as AboutContent;
		if (payload.content?.seo && typeof payload.content.seo === 'object') contentState.seo = { ...contentState.seo, ...payload.content.seo } as SEOContent;
		if (Array.isArray(payload.content?.sections)) contentState.sections = payload.content.sections as SectionSetting[];
		if (payload.content?.footer && typeof payload.content.footer === 'object') contentState.footer = { ...contentState.footer, ...payload.content.footer };
		if (Array.isArray(payload.content?.projects))
			contentState.projects = payload.content.projects as Project[];
		if (Array.isArray(payload.content?.journey))
			contentState.journey = payload.content.journey as TimelineEntry[];
		if (Array.isArray(payload.content?.skills))
			contentState.skills = payload.content.skills as SkillCategory[];
		if (Array.isArray(payload.content?.certifications))
			contentState.certifications = payload.content.certifications as Certification[];
		if (Array.isArray(payload.content?.achievements))
			contentState.achievements = payload.content.achievements as Achievement[];
		if (payload.content?.contact && typeof payload.content.contact === 'object') {
			contentState.contact = { ...contentState.contact, ...payload.content.contact } as ContactContent;
		}
	} catch {
		/* Static defaults remain active when the CMS is unavailable. */
	}
}
