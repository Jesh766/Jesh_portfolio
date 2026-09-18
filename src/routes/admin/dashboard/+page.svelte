<script lang="ts">
	import { onMount } from 'svelte';
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

	type Project = {
		id: string; title: string; tagline: string; tags: string[];
		status: string; year: string; github: string; demo: string; metrics: { value: string; label: string }[]; featured?: boolean;
	};
	type JourneyItem = { year: string; title: string; description: string };
	type SkillCategory = { category: string; icon: string; color: string; items: string[] };
	type Certification = { title: string; issuer: string; issuerKey: string; url: string; year: string; note: string };
	type Achievement = { title: string; description: string };
	type ContactInfo = { email: string; phone: string; location: string; formTitle: string; formDescription: string; nameLabel: string; emailLabel: string; messageLabel: string; submitLabel: string; successMessage: string; errorMessage: string };

	type Content = {
		site: Record<string, string>;
		navigation: typeof DEFAULT_NAVIGATION;
		socials: typeof DEFAULT_SOCIALS;
		heroRoles: string[];
		heroStats: typeof HERO_STATS;
		about: typeof DEFAULT_ABOUT;
		seo: typeof DEFAULT_SEO;
		sections: typeof DEFAULT_SECTIONS;
		footer: { name: string; description: string; copyright: string };
		projects: Project[];
		journey: JourneyItem[];
		skills: SkillCategory[];
		certifications: Certification[];
		achievements: Achievement[];
		contact: ContactInfo;
	};

	const defaultContent: Content = {
		site: { ...SITE },
		navigation: structuredClone(DEFAULT_NAVIGATION),
		socials: structuredClone(DEFAULT_SOCIALS),
		heroRoles: structuredClone(DEFAULT_HERO_ROLES),
		heroStats: structuredClone(HERO_STATS),
		about: structuredClone(DEFAULT_ABOUT),
		seo: structuredClone(DEFAULT_SEO),
		sections: structuredClone(DEFAULT_SECTIONS),
		footer: { name: SITE.name, description: SITE.footerDescription ?? SITE.title, copyright: SITE.copyrightText ?? '© {year} · {title}' },
		projects: structuredClone(PROJECTS as unknown as Project[]),
		journey: structuredClone(TIMELINE as unknown as JourneyItem[]),
		skills: structuredClone(SKILLS_CATEGORIZED as unknown as SkillCategory[]),
		certifications: structuredClone(CERTIFICATIONS as unknown as Certification[]),
		achievements: structuredClone(ACHIEVEMENTS as unknown as Achievement[]),
		contact: { email: SITE.email, phone: SITE.phone, location: SITE.location, formTitle: 'Contact', formDescription: "Let's build something remarkable", nameLabel: 'Name', emailLabel: 'Email', messageLabel: 'Message', submitLabel: 'Send message', successMessage: "Message sent successfully. I'll get back to you soon.", errorMessage: 'Failed to send message. Please try again later.' }
	};

	let content: Content = structuredClone(defaultContent);
	let analytics = {
		totals: { visitors: 0, pageViews: 0, averageDurationMs: 0, days: 30 },
		sections: [] as { section: string; views: number }[],
		recent: [] as { event_type: string; page_path: string | null; section_id: string | null; created_at: string }[]
	};
	let notice = '';
	let error = '';
	let saving = false;
	let dirty = false;
	let activeTab = 'content';

	const TABS = [
		{ id: 'content', label: 'Global' },
		{ id: 'hero', label: 'Hero' },
		{ id: 'about', label: 'About' },
		{ id: 'projects', label: 'Projects' },
		{ id: 'journey', label: 'Journey' },
		{ id: 'skills', label: 'Skills' },
		{ id: 'certifications', label: 'Certifications' },
		{ id: 'achievements', label: 'Achievements' },
		{ id: 'contact', label: 'Contact' },
		{ id: 'socials', label: 'Socials' },
		{ id: 'footer', label: 'Footer' },
		{ id: 'seo', label: 'SEO' },
		{ id: 'analytics', label: 'Analytics' }
	];

	onMount(() => {
		const onBeforeUnload = (event: BeforeUnloadEvent) => {
			if (!dirty) return;
			event.preventDefault();
			event.returnValue = '';
		};
		window.addEventListener('beforeunload', onBeforeUnload);
		void (async () => {
			const [contentResponse, analyticsResponse] = await Promise.all([
				fetch('/api/admin/content'),
				fetch('/api/admin/analytics?days=30')
			]);
			if (contentResponse.status === 401 || analyticsResponse.status === 401) {
				window.location.href = '/admin';
				return;
			}
			const saved = await contentResponse.json();
			const source = saved.draft_content ?? saved.content;
			if (source && Object.keys(source).length) content = normalizeContent(source);
			analytics = await analyticsResponse.json();
		})();
		return () => window.removeEventListener('beforeunload', onBeforeUnload);
	});

	function normalizeContent(source: Partial<Content>): Content {
		return {
			site: { ...defaultContent.site, ...(source.site ?? {}) },
			navigation: Array.isArray(source.navigation) ? source.navigation : structuredClone(defaultContent.navigation),
			socials: Array.isArray(source.socials) ? source.socials : structuredClone(defaultContent.socials),
			heroRoles: Array.isArray(source.heroRoles) ? source.heroRoles : structuredClone(defaultContent.heroRoles),
			heroStats: Array.isArray(source.heroStats) ? source.heroStats : structuredClone(defaultContent.heroStats),
			about: { ...defaultContent.about, ...(source.about ?? {}) },
			seo: { ...defaultContent.seo, ...(source.seo ?? {}) },
			sections: Array.isArray(source.sections) ? source.sections : structuredClone(defaultContent.sections),
			footer: { ...defaultContent.footer, ...(source.footer ?? {}) },
			projects: Array.isArray(source.projects) && source.projects.length
				? source.projects.map((p) => ({ ...emptyProject(), ...p, tags: Array.isArray(p.tags) ? p.tags : [] }))
				: structuredClone(defaultContent.projects),
			journey: Array.isArray(source.journey) && source.journey.length
				? source.journey.map((j) => ({ ...emptyJourney(), ...j }))
				: structuredClone(defaultContent.journey),
			skills: Array.isArray(source.skills) && source.skills.length
				? source.skills.map((s) => ({ ...emptySkillCategory(), ...s, items: Array.isArray(s.items) ? s.items : [] }))
				: structuredClone(defaultContent.skills),
			certifications: Array.isArray(source.certifications) && source.certifications.length
				? source.certifications.map((c) => ({ ...emptyCertification(), ...c }))
				: structuredClone(defaultContent.certifications),
			achievements: Array.isArray(source.achievements) && source.achievements.length
				? source.achievements.map((a) => ({ ...emptyAchievement(), ...a }))
				: structuredClone(defaultContent.achievements),
			contact: { ...defaultContent.contact, ...(source.contact ?? {}) }
		};
	}

	// ---------- site ----------
	function updateSite(key: string, value: string) {
		content = { ...content, site: { ...content.site, [key]: value } };
		dirty = true;
	}

	// ---------- projects ----------
	function emptyProject(): Project {
		return { id: `project-${Date.now()}`, title: 'New project', tagline: '', tags: [], status: 'In progress', year: String(new Date().getFullYear()), github: '', demo: '', metrics: [], featured: false };
	}
	function updateProject(index: number, key: keyof Project, value: string | boolean | string[]) {
		content = { ...content, projects: content.projects.map((p, i) => i === index ? { ...p, [key]: value } : p) };
		dirty = true;
	}
	function updateTags(index: number, value: string) {
		updateProject(index, 'tags', value.split(',').map((t) => t.trim()).filter(Boolean));
	}
	function addProject() { content = { ...content, projects: [...content.projects, emptyProject()] }; dirty = true; }
	function removeProject(index: number) { if (!window.confirm('Delete this project from the draft content?')) return; content = { ...content, projects: content.projects.filter((_, i) => i !== index) }; dirty = true; }
	function duplicateProject(index: number) { const copy = structuredClone(content.projects[index]); copy.id = `project-${Date.now()}`; content = { ...content, projects: [...content.projects.slice(0, index + 1), copy, ...content.projects.slice(index + 1)] }; dirty = true; }
	function moveItem<T>(items: T[], index: number, direction: -1 | 1) { const next = index + direction; if (next < 0 || next >= items.length) return items; const copy = [...items]; [copy[index], copy[next]] = [copy[next], copy[index]]; return copy; }
	function moveProject(index: number, direction: -1 | 1) { content = { ...content, projects: moveItem(content.projects, index, direction) }; dirty = true; }

	// ---------- journey ----------
	function emptyJourney(): JourneyItem { return { year: String(new Date().getFullYear()), title: 'New milestone', description: '' }; }
	function updateJourney(index: number, key: keyof JourneyItem, value: string) {
		content = { ...content, journey: content.journey.map((j, i) => i === index ? { ...j, [key]: value } : j) };
		dirty = true;
	}
	function addJourney() { content = { ...content, journey: [...content.journey, emptyJourney()] }; dirty = true; }
	function removeJourney(index: number) { if (!window.confirm('Delete this milestone from the draft content?')) return; content = { ...content, journey: content.journey.filter((_, i) => i !== index) }; dirty = true; }
	function duplicateJourney(index: number) { content = { ...content, journey: [...content.journey.slice(0, index + 1), structuredClone(content.journey[index]), ...content.journey.slice(index + 1)] }; dirty = true; }
	function moveJourney(index: number, direction: -1 | 1) { content = { ...content, journey: moveItem(content.journey, index, direction) }; dirty = true; }

	// ---------- skills ----------
	function emptySkillCategory(): SkillCategory { return { category: 'New category', icon: '◈', color: 'var(--accent-gold)', items: [] }; }
	function updateSkillCategory(index: number, key: keyof SkillCategory, value: string | string[]) {
		content = { ...content, skills: content.skills.map((s, i) => i === index ? { ...s, [key]: value } : s) };
		dirty = true;
	}
	function updateSkillItems(index: number, value: string) {
		updateSkillCategory(index, 'items', value.split(',').map((t) => t.trim()).filter(Boolean));
	}
	function updateSkill(index: number, skillIndex: number, value: string) { content = { ...content, skills: content.skills.map((category, i) => i === index ? { ...category, items: category.items.map((item, itemIndex) => itemIndex === skillIndex ? value : item) } : category) }; dirty = true; }
	function addSkill(index: number) { content = { ...content, skills: content.skills.map((category, i) => i === index ? { ...category, items: [...category.items, 'New skill'] } : category) }; dirty = true; }
	function removeSkill(index: number, skillIndex: number) { content = { ...content, skills: content.skills.map((category, i) => i === index ? { ...category, items: category.items.filter((_, itemIndex) => itemIndex !== skillIndex) } : category) }; dirty = true; }
	function moveSkill(index: number, skillIndex: number, direction: -1 | 1) { content = { ...content, skills: content.skills.map((category, i) => i === index ? { ...category, items: moveItem(category.items, skillIndex, direction) } : category) }; dirty = true; }
	function addSkillCategory() { content = { ...content, skills: [...content.skills, emptySkillCategory()] }; dirty = true; }
	function removeSkillCategory(index: number) { if (!window.confirm('Delete this skill category from the draft content?')) return; content = { ...content, skills: content.skills.filter((_, i) => i !== index) }; dirty = true; }
	function moveSkillCategory(index: number, direction: -1 | 1) { content = { ...content, skills: moveItem(content.skills, index, direction) }; dirty = true; }

	// ---------- certifications ----------
	function emptyCertification(): Certification { return { title: 'New certification', issuer: '', issuerKey: 'google', url: '', year: String(new Date().getFullYear()), note: '' }; }
	function updateCertification(index: number, key: keyof Certification, value: string) {
		content = { ...content, certifications: content.certifications.map((c, i) => i === index ? { ...c, [key]: value } : c) };
		dirty = true;
	}
	function addCertification() { content = { ...content, certifications: [...content.certifications, emptyCertification()] }; dirty = true; }
	function removeCertification(index: number) { if (!window.confirm('Delete this certification from the draft content?')) return; content = { ...content, certifications: content.certifications.filter((_, i) => i !== index) }; dirty = true; }
	function duplicateCertification(index: number) { content = { ...content, certifications: [...content.certifications.slice(0, index + 1), structuredClone(content.certifications[index]), ...content.certifications.slice(index + 1)] }; dirty = true; }
	function moveCertification(index: number, direction: -1 | 1) { content = { ...content, certifications: moveItem(content.certifications, index, direction) }; dirty = true; }

	// ---------- achievements ----------
	function emptyAchievement(): Achievement { return { title: 'New achievement', description: '' }; }
	function updateAchievement(index: number, key: keyof Achievement, value: string) {
		content = { ...content, achievements: content.achievements.map((a, i) => i === index ? { ...a, [key]: value } : a) };
		dirty = true;
	}
	function addAchievement() { content = { ...content, achievements: [...content.achievements, emptyAchievement()] }; dirty = true; }
	function removeAchievement(index: number) { if (!window.confirm('Delete this achievement from the draft content?')) return; content = { ...content, achievements: content.achievements.filter((_, i) => i !== index) }; dirty = true; }
	function duplicateAchievement(index: number) { content = { ...content, achievements: [...content.achievements.slice(0, index + 1), structuredClone(content.achievements[index]), ...content.achievements.slice(index + 1)] }; dirty = true; }
	function moveAchievement(index: number, direction: -1 | 1) { content = { ...content, achievements: moveItem(content.achievements, index, direction) }; dirty = true; }

	function updateHeroRole(index: number, value: string) { content = { ...content, heroRoles: content.heroRoles.map((item, i) => i === index ? value : item) }; dirty = true; }
	function addHeroRole() { content = { ...content, heroRoles: [...content.heroRoles, 'New role'] }; dirty = true; }
	function removeHeroRole(index: number) { content = { ...content, heroRoles: content.heroRoles.filter((_, i) => i !== index) }; dirty = true; }
	function updateHeroStat(index: number, key: 'value' | 'suffix' | 'label' | 'display', value: string) { content = { ...content, heroStats: content.heroStats.map((item, i) => i === index ? { ...item, [key]: key === 'value' ? Number(value) || 0 : value } : item) }; dirty = true; }
	function addHeroStat() { content = { ...content, heroStats: [...content.heroStats, { value: 0, suffix: '', label: 'New statistic' }] }; dirty = true; }
	function removeHeroStat(index: number) { content = { ...content, heroStats: content.heroStats.filter((_, i) => i !== index) }; dirty = true; }
	function updateAbout(key: keyof typeof DEFAULT_ABOUT, value: string) { content = { ...content, about: { ...content.about, [key]: value } }; dirty = true; }
	function updateFocus(index: number, key: 'icon' | 'label', value: string) { content = { ...content, about: { ...content.about, focuses: content.about.focuses.map((item, i) => i === index ? { ...item, [key]: value } : item) } }; dirty = true; }
	function addFocus() { content = { ...content, about: { ...content.about, focuses: [...content.about.focuses, { icon: '✦', label: 'New focus' }] } }; dirty = true; }
	function removeFocus(index: number) { content = { ...content, about: { ...content.about, focuses: content.about.focuses.filter((_, i) => i !== index) } }; dirty = true; }
	function updateAboutMetric(index: number, key: 'value' | 'suffix' | 'label', value: string) { content = { ...content, about: { ...content.about, metrics: content.about.metrics.map((item, i) => i === index ? { ...item, [key]: key === 'value' ? Number(value) || 0 : value } : item) } }; dirty = true; }
	function addAboutMetric() { content = { ...content, about: { ...content.about, metrics: [...content.about.metrics, { value: 0, suffix: '', label: 'New metric' }] } }; dirty = true; }
	function removeAboutMetric(index: number) { content = { ...content, about: { ...content.about, metrics: content.about.metrics.filter((_, i) => i !== index) } }; dirty = true; }
	function updateSEO(key: keyof typeof DEFAULT_SEO, value: string) { content = { ...content, seo: { ...content.seo, [key]: value } }; dirty = true; }
	function updateFooter(key: keyof Content['footer'], value: string) { content = { ...content, footer: { ...content.footer, [key]: value } }; dirty = true; }
	function updateNavigation(index: number, key: 'label' | 'visible', value: string | boolean) { content = { ...content, navigation: content.navigation.map((item, i) => i === index ? { ...item, [key]: value } : item) }; dirty = true; }
	function moveNavigation(index: number, direction: -1 | 1) { content = { ...content, navigation: moveItem(content.navigation, index, direction).map((item, order) => ({ ...item, order })) }; dirty = true; }
	function updateSection(index: number, visible: boolean) { content = { ...content, sections: content.sections.map((item, i) => i === index ? { ...item, visible } : item) }; dirty = true; }
	function updateSocial(index: number, key: 'label' | 'href' | 'icon' | 'visible', value: string | boolean) { content = { ...content, socials: content.socials.map((item, i) => i === index ? { ...item, [key]: value } : item) }; dirty = true; }
	function addSocial() { content = { ...content, socials: [...content.socials, { id: `social-${Date.now()}`, label: 'New social', href: 'https://', icon: 'link', visible: true, order: content.socials.length }] }; dirty = true; }
	function removeSocial(index: number) { content = { ...content, socials: content.socials.filter((_, i) => i !== index) }; dirty = true; }

	// ---------- contact ----------
	function updateContact(key: keyof ContactInfo, value: string) {
		content = { ...content, contact: { ...content.contact, [key]: value } };
		dirty = true;
	}

	async function save(action: 'draft' | 'publish') {
		saving = true;
		notice = '';
		error = '';
		const response = await fetch('/api/admin/content', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content, action })
		});
		saving = false;
		if (!response.ok) {
			error = (await response.json()).error ?? 'Unable to save changes.';
			return;
		}
		dirty = false;
		notice = action === 'publish' ? 'Changes published to your portfolio.' : 'Draft saved privately.';
	}

	async function signOut() {
		await fetch('/api/admin', { method: 'DELETE' });
		window.location.href = '/admin';
	}

	function previewDraft() {
		window.open('/?preview=1', '_blank', 'noopener,noreferrer');
	}

	function formatDuration(milliseconds: number) {
		if (!milliseconds) return '—';
		const seconds = Math.round(milliseconds / 1000);
		return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
	}
</script>

<svelte:head>
	<title>Admin dashboard | Jayshil Thakkar</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin-shell">
	<header class="admin-header">
		<div>
			<p class="admin-kicker">Private workspace</p>
			<h1>Portfolio control room</h1>
			<p class="muted">Edit your portfolio visually. No code required.</p>
		</div>
		<div class="admin-actions">
			<button onclick={previewDraft}>Preview draft</button>
			<a href="/?editor=1" target="_blank" rel="noreferrer">Open editor mode</a>
			<a href="/" target="_blank" rel="noreferrer">View site</a>
			<button onclick={signOut}>Sign out</button>
		</div>
	</header>

	<section class="metrics" aria-label="Visitor metrics">
		<div><span>Visitors</span><strong>{analytics.totals.visitors}</strong><small>anonymous sessions / {analytics.totals.days} days</small></div>
		<div><span>Page views</span><strong>{analytics.totals.pageViews}</strong><small>recorded portfolio visits</small></div>
		<div><span>Average time</span><strong>{formatDuration(analytics.totals.averageDurationMs)}</strong><small>reported session duration</small></div>
	</section>

	<nav class="tabs" aria-label="Admin sections">
		{#each TABS as tab}
			<button class:active={activeTab === tab.id} onclick={() => activeTab = tab.id}>{tab.label}</button>
		{/each}
	</nav>

	{#if activeTab === 'analytics'}
		<main class="analytics-layout">
			<section class="panel">
				<div class="panel-heading"><div><p class="admin-kicker">Engagement</p><h2>Section views</h2></div></div>
				{#if analytics.sections.length}
					<div class="section-list">{#each analytics.sections as item}<div><span>{item.section}</span><strong>{item.views}</strong></div>{/each}</div>
				{:else}<p class="muted">No section data yet.</p>{/if}
			</section>
			<section class="panel recent-panel">
				<div class="panel-heading"><div><p class="admin-kicker">Event stream</p><h2>Recent activity</h2></div></div>
				<div class="table-wrap">
					<table>
						<thead><tr><th>Event</th><th>Path</th><th>Time</th></tr></thead>
						<tbody>{#each analytics.recent as event}<tr><td>{event.event_type}</td><td>{event.section_id ?? event.page_path ?? '—'}</td><td>{new Date(event.created_at).toLocaleString()}</td></tr>{/each}</tbody>
					</table>
				</div>
			</section>
		</main>
	{:else}
		<main class="editor-layout">
			{#if activeTab === 'content'}
				<section class="panel editor-main">
					<div class="panel-heading"><div><p class="admin-kicker">Visual editor</p><h2>Site identity</h2></div><span class:dirty class="draft-status">{dirty ? 'Unsaved changes' : 'All changes saved'}</span></div>
					<div class="field-grid">
						<label>Display name<input value={content.site.name} oninput={(e) => updateSite('name', e.currentTarget.value)} /></label>
						<label>Location<input value={content.site.location} oninput={(e) => updateSite('location', e.currentTarget.value)} /></label>
						<label>Professional title<input value={content.site.title} oninput={(e) => updateSite('title', e.currentTarget.value)} /></label>
						<label>Contact email<input type="email" value={content.site.email} oninput={(e) => updateSite('email', e.currentTarget.value)} /></label>
						<label class="wide">Hero statement<textarea rows="3" oninput={(e) => updateSite('brand', e.currentTarget.value)}>{content.site.brand}</textarea></label>
					</div>
					<div class="panel-heading section-heading"><div><p class="admin-kicker">Homepage</p><h2>Hero copy</h2></div></div>
					<div class="field-grid">
						<label>First name line<input value={content.site.nameLine1} oninput={(e) => updateSite('nameLine1', e.currentTarget.value)} /></label>
						<label>Second name line<input value={content.site.nameLine2} oninput={(e) => updateSite('nameLine2', e.currentTarget.value)} /></label>
						<label>Availability status<input value={content.site.availability ?? ''} oninput={(e) => updateSite('availability', e.currentTarget.value)} /></label>
					</div>
					<div class="panel-heading section-heading"><div><p class="admin-kicker">Section headings</p><h2>Labels & intros</h2></div></div>
					<div class="field-grid">
						<label>Projects label<input value={content.site.projectsLabel ?? ''} oninput={(e) => updateSite('projectsLabel', e.currentTarget.value)} /></label>
						<label>Projects heading<input value={content.site.projectsHeading ?? ''} oninput={(e) => updateSite('projectsHeading', e.currentTarget.value)} /></label>
						<label class="wide">Projects intro<textarea rows="2" oninput={(e) => updateSite('projectsIntro', e.currentTarget.value)}>{content.site.projectsIntro ?? ''}</textarea></label>
						<label>Journey label<input value={content.site.journeyTag ?? ''} oninput={(e) => updateSite('journeyTag', e.currentTarget.value)} /></label>
						<label>Journey heading<input value={content.site.journeyTitle ?? ''} oninput={(e) => updateSite('journeyTitle', e.currentTarget.value)} /></label>
						<label class="wide">Journey intro<textarea rows="2" oninput={(e) => updateSite('journeyIntro', e.currentTarget.value)}>{content.site.journeyIntro ?? ''}</textarea></label>
						<label>Contact label<input value={content.site.contactLabel ?? ''} oninput={(e) => updateSite('contactLabel', e.currentTarget.value)} /></label>
						<label>Contact heading<input value={content.site.contactHeading ?? ''} oninput={(e) => updateSite('contactHeading', e.currentTarget.value)} /></label>
					</div>
					<div class="panel-heading section-heading"><div><p class="admin-kicker">Navigation</p><h2>Menu items</h2></div></div>
					<div class="project-editor-list">{#each content.navigation as item, index}<div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><input class="project-name" value={item.label} oninput={(e) => updateNavigation(index, 'label', e.currentTarget.value)} /><button class="icon-button" onclick={() => moveNavigation(index, -1)}>↑</button><button class="icon-button" onclick={() => moveNavigation(index, 1)}>↓</button><label class="inline-toggle">Visible<input type="checkbox" checked={item.visible} onchange={(e) => updateNavigation(index, 'visible', e.currentTarget.checked)} /></label></div>{/each}</div>
					<div class="panel-heading section-heading"><div><p class="admin-kicker">Page structure</p><h2>Section visibility</h2></div></div>
					<div class="project-editor-list">{#each content.sections as section, index}<div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><span class="project-name">{section.label}</span><label class="inline-toggle">Visible<input type="checkbox" checked={section.visible} disabled={section.id === 'hero'} onchange={(e) => updateSection(index, e.currentTarget.checked)} /></label></div>{/each}</div>
				</section>
			{/if}

			{#if activeTab === 'hero'}
				<section class="panel editor-main">
					<div class="panel-heading"><div><p class="admin-kicker">Homepage</p><h2>Hero content</h2></div></div>
					<div class="field-grid">
						<label>First name line<input value={content.site.nameLine1} oninput={(e) => updateSite('nameLine1', e.currentTarget.value)} /></label>
						<label>Second name line<input value={content.site.nameLine2} oninput={(e) => updateSite('nameLine2', e.currentTarget.value)} /></label>
						<label class="wide">Hero statement<textarea rows="3" oninput={(e) => updateSite('brand', e.currentTarget.value)}>{content.site.brand}</textarea></label>
					</div>
					<div class="panel-heading section-heading"><div><p class="admin-kicker">Rotating roles</p><h2>Hero roles</h2></div><button class="secondary" onclick={addHeroRole}>+ Add role</button></div>
					<div class="project-editor-list">{#each content.heroRoles as role, index}<div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><input class="project-name" value={role} oninput={(e) => updateHeroRole(index, e.currentTarget.value)} /><button class="icon-button danger" onclick={() => removeHeroRole(index)}>Remove</button></div>{/each}</div>
					<div class="panel-heading section-heading"><div><p class="admin-kicker">Proof points</p><h2>Hero statistics</h2></div><button class="secondary" onclick={addHeroStat}>+ Add stat</button></div>
					<div class="project-editor-list">{#each content.heroStats as stat, index}<article class="project-editor-card"><div class="field-grid"><label>Value<input type="number" value={stat.value} oninput={(e) => updateHeroStat(index, 'value', e.currentTarget.value)} /></label><label>Suffix<input value={stat.suffix} oninput={(e) => updateHeroStat(index, 'suffix', e.currentTarget.value)} /></label><label>Label<input value={stat.label} oninput={(e) => updateHeroStat(index, 'label', e.currentTarget.value)} /></label><label>Display override<input value={stat.display ?? ''} oninput={(e) => updateHeroStat(index, 'display', e.currentTarget.value)} /></label></div><button class="icon-button danger" onclick={() => removeHeroStat(index)}>Remove stat</button></article>{/each}</div>
				</section>
			{/if}

			{#if activeTab === 'about'}
				<section class="panel editor-main">
					<div class="panel-heading"><div><p class="admin-kicker">Story & trajectory</p><h2>About content</h2></div></div>
					<div class="field-grid"><label>Eyebrow<input value={content.about.eyebrow} oninput={(e) => updateAbout('eyebrow', e.currentTarget.value)} /></label><label>Title<input value={content.about.title} oninput={(e) => updateAbout('title', e.currentTarget.value)} /></label><label class="wide">Description<textarea rows="3" oninput={(e) => updateAbout('description', e.currentTarget.value)}>{content.about.description}</textarea></label><label>Intro eyebrow<input value={content.about.introEyebrow} oninput={(e) => updateAbout('introEyebrow', e.currentTarget.value)} /></label><label>Intro title<input value={content.about.introTitle} oninput={(e) => updateAbout('introTitle', e.currentTarget.value)} /></label><label>Accent title<input value={content.about.introTitleAccent} oninput={(e) => updateAbout('introTitleAccent', e.currentTarget.value)} /></label><label>Focus eyebrow<input value={content.about.focusEyebrow} oninput={(e) => updateAbout('focusEyebrow', e.currentTarget.value)} /></label><label class="wide">Intro description<textarea rows="4" oninput={(e) => updateAbout('introDescription', e.currentTarget.value)}>{content.about.introDescription}</textarea></label></div>
					<div class="panel-heading section-heading"><div><p class="admin-kicker">Current focus</p><h2>Focus chips</h2></div><button class="secondary" onclick={addFocus}>+ Add focus</button></div>
					<div class="project-editor-list">{#each content.about.focuses as focus, index}<div class="project-card-heading"><input class="project-name" value={focus.icon} aria-label="Focus icon" oninput={(e) => updateFocus(index, 'icon', e.currentTarget.value)} /><input class="project-name" value={focus.label} aria-label="Focus label" oninput={(e) => updateFocus(index, 'label', e.currentTarget.value)} /><button class="icon-button danger" onclick={() => removeFocus(index)}>Remove</button></div>{/each}</div>
					<div class="panel-heading section-heading"><div><p class="admin-kicker">Impact</p><h2>About metrics</h2></div><button class="secondary" onclick={addAboutMetric}>+ Add metric</button></div>
					<div class="project-editor-list">{#each content.about.metrics as metric, index}<div class="project-card-heading"><input type="number" value={metric.value} aria-label="Metric value" oninput={(e) => updateAboutMetric(index, 'value', e.currentTarget.value)} /><input value={metric.suffix} aria-label="Metric suffix" oninput={(e) => updateAboutMetric(index, 'suffix', e.currentTarget.value)} /><input class="project-name" value={metric.label} aria-label="Metric label" oninput={(e) => updateAboutMetric(index, 'label', e.currentTarget.value)} /><button class="icon-button danger" onclick={() => removeAboutMetric(index)}>Remove</button></div>{/each}</div>
				</section>
			{/if}

			{#if activeTab === 'socials'}
				<section class="panel editor-main"><div class="panel-heading"><div><p class="admin-kicker">Connections</p><h2>Social links</h2></div><button class="secondary" onclick={addSocial}>+ Add social</button></div><div class="project-editor-list">{#each content.socials as social, index}<article class="project-editor-card"><div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><input class="project-name" value={social.label} oninput={(e) => updateSocial(index, 'label', e.currentTarget.value)} /><button class="icon-button danger" onclick={() => removeSocial(index)}>Remove</button></div><div class="field-grid"><label>Platform<input value={social.icon} oninput={(e) => updateSocial(index, 'icon', e.currentTarget.value)} /></label><label>URL<input type="url" value={social.href} oninput={(e) => updateSocial(index, 'href', e.currentTarget.value)} /></label><label><span>Visible</span><input type="checkbox" checked={social.visible} onchange={(e) => updateSocial(index, 'visible', e.currentTarget.checked)} /></label></div></article>{/each}</div></section>
			{/if}

			{#if activeTab === 'footer'}
				<section class="panel editor-main"><div class="panel-heading"><div><p class="admin-kicker">Closing content</p><h2>Footer</h2></div></div><div class="field-grid"><label>Name<input value={content.footer.name} oninput={(e) => updateFooter('name', e.currentTarget.value)} /></label><label>Description<input value={content.footer.description} oninput={(e) => updateFooter('description', e.currentTarget.value)} /></label><label class="wide">Copyright template<textarea rows="2" oninput={(e) => updateFooter('copyright', e.currentTarget.value)}>{content.footer.copyright}</textarea></label></div></section>
			{/if}

			{#if activeTab === 'seo'}
				<section class="panel editor-main"><div class="panel-heading"><div><p class="admin-kicker">Search appearance</p><h2>SEO metadata</h2></div></div><div class="field-grid"><label class="wide">Page title<input value={content.seo.title} oninput={(e) => updateSEO('title', e.currentTarget.value)} /></label><label class="wide">Meta description<textarea rows="3" oninput={(e) => updateSEO('description', e.currentTarget.value)}>{content.seo.description}</textarea></label><label class="wide">Keywords<input value={content.seo.keywords} oninput={(e) => updateSEO('keywords', e.currentTarget.value)} /></label><label>OpenGraph title<input value={content.seo.ogTitle} oninput={(e) => updateSEO('ogTitle', e.currentTarget.value)} /></label><label>OpenGraph image<input value={content.seo.ogImage} oninput={(e) => updateSEO('ogImage', e.currentTarget.value)} /></label><label class="wide">OpenGraph description<textarea rows="2" oninput={(e) => updateSEO('ogDescription', e.currentTarget.value)}>{content.seo.ogDescription}</textarea></label></div></section>
			{/if}

			{#if activeTab === 'projects'}
				<section class="panel editor-main">
					<div class="panel-heading"><div><p class="admin-kicker">Portfolio work</p><h2>Projects</h2></div><button class="secondary" onclick={addProject}>+ Add project</button></div>
					<p class="muted">Create, remove, or update project cards. Separate tags with commas.</p>
					<div class="project-editor-list">
						{#each content.projects as project, index}
							<article class="project-editor-card">
								<div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><input class="project-name" value={project.title} aria-label="Project title" oninput={(e) => updateProject(index, 'title', e.currentTarget.value)} /><button class="icon-button" title="Move up" onclick={() => moveProject(index, -1)}>↑</button><button class="icon-button" title="Move down" onclick={() => moveProject(index, 1)}>↓</button><button class="icon-button" onclick={() => duplicateProject(index)}>Duplicate</button><button class="icon-button danger" title="Remove project" onclick={() => removeProject(index)}>Remove</button></div>
								<div class="field-grid">
									<label>Short description<textarea rows="3" oninput={(e) => updateProject(index, 'tagline', e.currentTarget.value)}>{project.tagline}</textarea></label>
									<label>Status<input value={project.status} oninput={(e) => updateProject(index, 'status', e.currentTarget.value)} /></label>
									<label>Year<input value={project.year} oninput={(e) => updateProject(index, 'year', e.currentTarget.value)} /></label>
									<label>Tags<input value={project.tags.join(', ')} oninput={(e) => updateTags(index, e.currentTarget.value)} /></label>
									<label>GitHub link<input type="url" value={project.github} oninput={(e) => updateProject(index, 'github', e.currentTarget.value)} /></label>
									<label>Live demo link<input type="url" value={project.demo} oninput={(e) => updateProject(index, 'demo', e.currentTarget.value)} /></label>
									<label><span>Featured</span><input type="checkbox" checked={project.featured} onchange={(e) => updateProject(index, 'featured', e.currentTarget.checked)} /></label>
								</div>
							</article>
						{/each}
						{#if !content.projects.length}<div class="empty-state">No projects yet. Add your first project above.</div>{/if}
					</div>
				</section>
			{/if}

			{#if activeTab === 'journey'}
				<section class="panel editor-main">
					<div class="panel-heading"><div><p class="admin-kicker">Timeline</p><h2>Journey</h2></div><button class="secondary" onclick={addJourney}>+ Add milestone</button></div>
					<div class="project-editor-list">
						{#each content.journey as item, index}
							<article class="project-editor-card">
								<div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><input class="project-name" value={item.title} aria-label="Milestone title" oninput={(e) => updateJourney(index, 'title', e.currentTarget.value)} /><button class="icon-button" onclick={() => moveJourney(index, -1)}>↑</button><button class="icon-button" onclick={() => moveJourney(index, 1)}>↓</button><button class="icon-button" onclick={() => duplicateJourney(index)}>Duplicate</button><button class="icon-button danger" onclick={() => removeJourney(index)}>Remove</button></div>
								<div class="field-grid">
									<label>Year<input value={item.year} oninput={(e) => updateJourney(index, 'year', e.currentTarget.value)} /></label>
									<label class="wide">Description<textarea rows="3" oninput={(e) => updateJourney(index, 'description', e.currentTarget.value)}>{item.description}</textarea></label>
								</div>
							</article>
						{/each}
						{#if !content.journey.length}<div class="empty-state">No journey milestones yet.</div>{/if}
					</div>
				</section>
			{/if}

			{#if activeTab === 'skills'}
				<section class="panel editor-main">
					<div class="panel-heading"><div><p class="admin-kicker">Capabilities</p><h2>Skills</h2></div><button class="secondary" onclick={addSkillCategory}>+ Add category</button></div>
					<p class="muted">Separate skill items with commas.</p>
					<div class="project-editor-list">
						{#each content.skills as cat, index}
							<article class="project-editor-card">
								<div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><input class="project-name" value={cat.category} aria-label="Category name" oninput={(e) => updateSkillCategory(index, 'category', e.currentTarget.value)} /><button class="icon-button" onclick={() => moveSkillCategory(index, -1)}>↑</button><button class="icon-button" onclick={() => moveSkillCategory(index, 1)}>↓</button><button class="icon-button danger" onclick={() => removeSkillCategory(index)}>Remove</button></div>
								<div class="field-grid">
									<label>Icon glyph<input value={cat.icon} oninput={(e) => updateSkillCategory(index, 'icon', e.currentTarget.value)} /></label>
									<label>Accent color
										<select value={cat.color} onchange={(e) => updateSkillCategory(index, 'color', e.currentTarget.value)}>
											<option value="var(--accent-gold)">Gold</option>
											<option value="var(--accent-purple)">Purple</option>
											<option value="var(--accent-teal)">Teal</option>
										</select>
									</label>
									<div class="wide skill-list"><span class="field-label">Skill items</span>{#each cat.items as skill, skillIndex}<div class="project-card-heading"><input class="project-name" value={skill} oninput={(e) => updateSkill(index, skillIndex, e.currentTarget.value)} /><button class="icon-button" onclick={() => moveSkill(index, skillIndex, -1)}>↑</button><button class="icon-button" onclick={() => moveSkill(index, skillIndex, 1)}>↓</button><button class="icon-button danger" onclick={() => removeSkill(index, skillIndex)}>Remove</button></div>{/each}<button class="secondary" onclick={() => addSkill(index)}>+ Add skill</button></div>
								</div>
							</article>
						{/each}
						{#if !content.skills.length}<div class="empty-state">No skill categories yet.</div>{/if}
					</div>
				</section>
			{/if}

			{#if activeTab === 'certifications'}
				<section class="panel editor-main">
					<div class="panel-heading"><div><p class="admin-kicker">Credentials</p><h2>Certifications</h2></div><button class="secondary" onclick={addCertification}>+ Add certification</button></div>
					<div class="project-editor-list">
						{#each content.certifications as cert, index}
							<article class="project-editor-card">
								<div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><input class="project-name" value={cert.title} aria-label="Certification title" oninput={(e) => updateCertification(index, 'title', e.currentTarget.value)} /><button class="icon-button" onclick={() => moveCertification(index, -1)}>↑</button><button class="icon-button" onclick={() => moveCertification(index, 1)}>↓</button><button class="icon-button" onclick={() => duplicateCertification(index)}>Duplicate</button><button class="icon-button danger" onclick={() => removeCertification(index)}>Remove</button></div>
								<div class="field-grid">
									<label>Issuer<input value={cert.issuer} oninput={(e) => updateCertification(index, 'issuer', e.currentTarget.value)} /></label>
									<label>Issuer key (icon)<input value={cert.issuerKey} oninput={(e) => updateCertification(index, 'issuerKey', e.currentTarget.value)} /></label>
									<label>Year<input value={cert.year} oninput={(e) => updateCertification(index, 'year', e.currentTarget.value)} /></label>
									<label>Certificate URL<input type="url" value={cert.url} oninput={(e) => updateCertification(index, 'url', e.currentTarget.value)} /></label>
									<label class="wide">Note<input value={cert.note} oninput={(e) => updateCertification(index, 'note', e.currentTarget.value)} /></label>
								</div>
							</article>
						{/each}
						{#if !content.certifications.length}<div class="empty-state">No certifications yet.</div>{/if}
					</div>
				</section>
			{/if}

			{#if activeTab === 'achievements'}
				<section class="panel editor-main">
					<div class="panel-heading"><div><p class="admin-kicker">Highlights</p><h2>Achievements</h2></div><button class="secondary" onclick={addAchievement}>+ Add achievement</button></div>
					<div class="project-editor-list">
						{#each content.achievements as item, index}
							<article class="project-editor-card">
								<div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><input class="project-name" value={item.title} aria-label="Achievement title" oninput={(e) => updateAchievement(index, 'title', e.currentTarget.value)} /><button class="icon-button" onclick={() => moveAchievement(index, -1)}>↑</button><button class="icon-button" onclick={() => moveAchievement(index, 1)}>↓</button><button class="icon-button" onclick={() => duplicateAchievement(index)}>Duplicate</button><button class="icon-button danger" onclick={() => removeAchievement(index)}>Remove</button></div>
								<div class="field-grid">
									<label class="wide">Description<textarea rows="3" oninput={(e) => updateAchievement(index, 'description', e.currentTarget.value)}>{item.description}</textarea></label>
								</div>
							</article>
						{/each}
						{#if !content.achievements.length}<div class="empty-state">No achievements yet.</div>{/if}
					</div>
				</section>
			{/if}

			{#if activeTab === 'contact'}
				<section class="panel editor-main">
					<div class="panel-heading"><div><p class="admin-kicker">Reach you</p><h2>Contact details</h2></div></div>
					<div class="field-grid">
						<label>Email<input type="email" value={content.contact.email} oninput={(e) => updateContact('email', e.currentTarget.value)} /></label>
						<label>Phone<input value={content.contact.phone} oninput={(e) => updateContact('phone', e.currentTarget.value)} /></label>
						<label>Location<input value={content.contact.location} oninput={(e) => updateContact('location', e.currentTarget.value)} /></label>
						<label>Form title<input value={content.contact.formTitle} oninput={(e) => updateContact('formTitle', e.currentTarget.value)} /></label>
						<label class="wide">Form description<textarea rows="2" oninput={(e) => updateContact('formDescription', e.currentTarget.value)}>{content.contact.formDescription}</textarea></label>
						<label>Name label<input value={content.contact.nameLabel} oninput={(e) => updateContact('nameLabel', e.currentTarget.value)} /></label>
						<label>Email label<input value={content.contact.emailLabel} oninput={(e) => updateContact('emailLabel', e.currentTarget.value)} /></label>
						<label>Message label<input value={content.contact.messageLabel} oninput={(e) => updateContact('messageLabel', e.currentTarget.value)} /></label>
						<label>Submit label<input value={content.contact.submitLabel} oninput={(e) => updateContact('submitLabel', e.currentTarget.value)} /></label>
					</div>
				</section>
			{/if}
		</main>
		<footer class="publish-bar">
			<div>{#if notice}<span class="success">{notice}</span>{:else if error}<span class="error">{error}</span>{:else}<span class="muted">Draft changes are private until published.</span>{/if}</div>
			<div class="publish-actions"><button class="secondary" onclick={() => save('draft')} disabled={saving || !dirty}>Save draft</button><button class="primary" onclick={() => save('publish')} disabled={saving}>{saving ? 'Saving...' : 'Publish changes'}</button></div>
		</footer>
	{/if}
</div>

<style>
	:global(body) { background: #080604; }
	.admin-shell { min-height: 100svh; padding: 2rem clamp(1rem, 4vw, 4rem) 7rem; color: #fff; background: radial-gradient(circle at 90% 0%, rgba(201,168,76,.1), transparent 30rem), #080604; }
	.admin-header, .panel-heading, .admin-actions, .publish-bar, .publish-actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }.admin-header { max-width: 90rem; margin: 0 auto 2.5rem; }
	.admin-kicker { color: #c9a84c; font-size: .7rem; letter-spacing: .2em; text-transform: uppercase; margin: 0; } h1, h2 { margin: .45rem 0 0; font-family: 'Cormorant Garamond', serif; font-weight: 500; } h1 { font-size: clamp(2.2rem, 6vw, 4.5rem); line-height: .95; } h2 { font-size: 2rem; }.muted { color: rgba(255,255,255,.56); line-height: 1.55; }
	.admin-actions a, .admin-actions button, .secondary { color: rgba(255,255,255,.78); text-decoration: none; background: transparent; border: 1px solid rgba(255,255,255,.16); padding: .65rem .9rem; cursor: pointer; }.admin-actions a:hover, .secondary:hover { border-color: #c9a84c; color: #fff; }
	.metrics, .editor-layout, .analytics-layout, .tabs { max-width: 90rem; margin: 0 auto; }.metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,.1); margin-bottom: 1.5rem; }.metrics > div { display: grid; gap: .35rem; padding: 1.3rem; background: #100d09; }.metrics span, .metrics small { color: rgba(255,255,255,.56); }.metrics strong { font-size: 2.2rem; font-weight: 400; }
	.tabs { display: flex; gap: .4rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,.1); overflow-x: auto; }.tabs button { flex: none; border: 0; border-bottom: 2px solid transparent; padding: .8rem 1rem; color: rgba(255,255,255,.56); background: transparent; cursor: pointer; white-space: nowrap; }.tabs button.active { color: #fff; border-color: #c9a84c; }
	.editor-layout { display: grid; gap: 1.5rem; }.panel { padding: 1.4rem; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.035); }.field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 1.4rem; }label { display: grid; gap: .45rem; color: rgba(255,255,255,.7); font-size: .78rem; }label.wide { grid-column: 1 / -1; }input, textarea, select { width: 100%; padding: .78rem .85rem; border: 1px solid rgba(255,255,255,.14); border-radius: 2px; color: #fff; background: rgba(0,0,0,.25); font: inherit; }select option { background: #100d09; }textarea { resize: vertical; line-height: 1.5; }.section-heading { margin-top: 2.5rem; }
	.draft-status { color: #8ee0bf; font-size: .75rem; }.draft-status.dirty { color: #f4c96b; }.project-editor-list { display: grid; gap: 1rem; margin-top: 1.5rem; }.project-editor-card { padding: 1.2rem; border: 1px solid rgba(255,255,255,.1); background: rgba(0,0,0,.18); }.project-card-heading { display: flex; align-items: center; gap: .8rem; }.project-index { color: #c9a84c; font-size: .75rem; }.project-name { flex: 1; font-size: 1.2rem; }.icon-button { border: 0; background: transparent; cursor: pointer; }.danger { color: #ff9b8d; }.primary { border: 0; padding: .75rem 1.1rem; background: #c9a84c; color: #080604; font-weight: 700; cursor: pointer; }.primary:disabled, .secondary:disabled { opacity: .45; cursor: wait; }.empty-state { padding: 2rem; text-align: center; color: rgba(255,255,255,.5); border: 1px dashed rgba(255,255,255,.15); }.publish-bar { position: fixed; right: 0; bottom: 0; left: 0; z-index: 10; padding: 1rem clamp(1rem, 4vw, 4rem); border-top: 1px solid rgba(255,255,255,.12); background: rgba(8,6,4,.94); backdrop-filter: blur(16px); }.success { color: #8ee0bf; }.error { color: #ff9b8d; }
	.analytics-layout { display: grid; grid-template-columns: minmax(18rem, .65fr) minmax(0, 1.35fr); gap: 1.5rem; }.section-list div { display: flex; justify-content: space-between; padding: .85rem 0; border-bottom: 1px solid rgba(255,255,255,.1); }.section-list strong { color: #c9a84c; }.table-wrap { overflow-x: auto; margin-top: 1rem; }table { width: 100%; border-collapse: collapse; text-align: left; font-size: .85rem; }th, td { padding: .8rem; border-bottom: 1px solid rgba(255,255,255,.08); }th { color: #c9a84c; font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; }
	@media (max-width: 700px) { .admin-header, .publish-bar { align-items: flex-start; flex-direction: column; }.metrics, .field-grid, .analytics-layout { grid-template-columns: 1fr; }label.wide { grid-column: auto; }.publish-actions { width: 100%; }.publish-actions button { flex: 1; } }
</style>