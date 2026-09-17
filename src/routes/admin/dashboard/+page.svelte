<script lang="ts">
	import { onMount } from 'svelte';
	import { PROJECTS, SITE, TIMELINE, SKILLS_CATEGORIZED, CERTIFICATIONS, ACHIEVEMENTS } from '$lib/data/site';

	type Project = {
		id: string; title: string; tagline: string; tags: string[];
		status: string; year: string; github: string; demo: string; featured?: boolean;
	};
	type JourneyItem = { year: string; title: string; description: string };
	type SkillCategory = { category: string; icon: string; color: string; items: string[] };
	type Certification = { title: string; issuer: string; issuerKey: string; url: string; year: string; note: string };
	type Achievement = { title: string; description: string };
	type ContactInfo = { email: string; phone: string };

	type Content = {
		site: Record<string, string>;
		projects: Project[];
		journey: JourneyItem[];
		skills: SkillCategory[];
		certifications: Certification[];
		achievements: Achievement[];
		contact: ContactInfo;
	};

	const defaultContent: Content = {
		site: { ...SITE },
		projects: structuredClone(PROJECTS as unknown as Project[]),
		journey: structuredClone(TIMELINE as unknown as JourneyItem[]),
		skills: structuredClone(SKILLS_CATEGORIZED as unknown as SkillCategory[]),
		certifications: structuredClone(CERTIFICATIONS as unknown as Certification[]),
		achievements: structuredClone(ACHIEVEMENTS as unknown as Achievement[]),
		contact: { email: SITE.email, phone: SITE.phone }
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
		{ id: 'content', label: 'Site & Hero' },
		{ id: 'projects', label: 'Projects' },
		{ id: 'journey', label: 'Journey' },
		{ id: 'skills', label: 'Skills' },
		{ id: 'certifications', label: 'Certifications' },
		{ id: 'achievements', label: 'Achievements' },
		{ id: 'contact', label: 'Contact' },
		{ id: 'analytics', label: 'Analytics' }
	];

	onMount(async () => {
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
	});

	function normalizeContent(source: Partial<Content>): Content {
		return {
			site: { ...defaultContent.site, ...(source.site ?? {}) },
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
		return { id: `project-${Date.now()}`, title: 'New project', tagline: '', tags: [], status: 'In progress', year: String(new Date().getFullYear()), github: '', demo: '', featured: false };
	}
	function updateProject(index: number, key: keyof Project, value: string | boolean | string[]) {
		content = { ...content, projects: content.projects.map((p, i) => i === index ? { ...p, [key]: value } : p) };
		dirty = true;
	}
	function updateTags(index: number, value: string) {
		updateProject(index, 'tags', value.split(',').map((t) => t.trim()).filter(Boolean));
	}
	function addProject() { content = { ...content, projects: [...content.projects, emptyProject()] }; dirty = true; }
	function removeProject(index: number) { content = { ...content, projects: content.projects.filter((_, i) => i !== index) }; dirty = true; }

	// ---------- journey ----------
	function emptyJourney(): JourneyItem { return { year: String(new Date().getFullYear()), title: 'New milestone', description: '' }; }
	function updateJourney(index: number, key: keyof JourneyItem, value: string) {
		content = { ...content, journey: content.journey.map((j, i) => i === index ? { ...j, [key]: value } : j) };
		dirty = true;
	}
	function addJourney() { content = { ...content, journey: [...content.journey, emptyJourney()] }; dirty = true; }
	function removeJourney(index: number) { content = { ...content, journey: content.journey.filter((_, i) => i !== index) }; dirty = true; }

	// ---------- skills ----------
	function emptySkillCategory(): SkillCategory { return { category: 'New category', icon: '◈', color: 'var(--accent-gold)', items: [] }; }
	function updateSkillCategory(index: number, key: keyof SkillCategory, value: string | string[]) {
		content = { ...content, skills: content.skills.map((s, i) => i === index ? { ...s, [key]: value } : s) };
		dirty = true;
	}
	function updateSkillItems(index: number, value: string) {
		updateSkillCategory(index, 'items', value.split(',').map((t) => t.trim()).filter(Boolean));
	}
	function addSkillCategory() { content = { ...content, skills: [...content.skills, emptySkillCategory()] }; dirty = true; }
	function removeSkillCategory(index: number) { content = { ...content, skills: content.skills.filter((_, i) => i !== index) }; dirty = true; }

	// ---------- certifications ----------
	function emptyCertification(): Certification { return { title: 'New certification', issuer: '', issuerKey: '', url: '', year: String(new Date().getFullYear()), note: '' }; }
	function updateCertification(index: number, key: keyof Certification, value: string) {
		content = { ...content, certifications: content.certifications.map((c, i) => i === index ? { ...c, [key]: value } : c) };
		dirty = true;
	}
	function addCertification() { content = { ...content, certifications: [...content.certifications, emptyCertification()] }; dirty = true; }
	function removeCertification(index: number) { content = { ...content, certifications: content.certifications.filter((_, i) => i !== index) }; dirty = true; }

	// ---------- achievements ----------
	function emptyAchievement(): Achievement { return { title: 'New achievement', description: '' }; }
	function updateAchievement(index: number, key: keyof Achievement, value: string) {
		content = { ...content, achievements: content.achievements.map((a, i) => i === index ? { ...a, [key]: value } : a) };
		dirty = true;
	}
	function addAchievement() { content = { ...content, achievements: [...content.achievements, emptyAchievement()] }; dirty = true; }
	function removeAchievement(index: number) { content = { ...content, achievements: content.achievements.filter((_, i) => i !== index) }; dirty = true; }

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
				</section>
			{/if}

			{#if activeTab === 'projects'}
				<section class="panel editor-main">
					<div class="panel-heading"><div><p class="admin-kicker">Portfolio work</p><h2>Projects</h2></div><button class="secondary" onclick={addProject}>+ Add project</button></div>
					<p class="muted">Create, remove, or update project cards. Separate tags with commas.</p>
					<div class="project-editor-list">
						{#each content.projects as project, index}
							<article class="project-editor-card">
								<div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><input class="project-name" value={project.title} aria-label="Project title" oninput={(e) => updateProject(index, 'title', e.currentTarget.value)} /><button class="icon-button danger" title="Remove project" onclick={() => removeProject(index)}>Remove</button></div>
								<div class="field-grid">
									<label>Short description<textarea rows="3" oninput={(e) => updateProject(index, 'tagline', e.currentTarget.value)}>{project.tagline}</textarea></label>
									<label>Status<input value={project.status} oninput={(e) => updateProject(index, 'status', e.currentTarget.value)} /></label>
									<label>Year<input value={project.year} oninput={(e) => updateProject(index, 'year', e.currentTarget.value)} /></label>
									<label>Tags<input value={project.tags.join(', ')} oninput={(e) => updateTags(index, e.currentTarget.value)} /></label>
									<label>GitHub link<input type="url" value={project.github} oninput={(e) => updateProject(index, 'github', e.currentTarget.value)} /></label>
									<label>Live demo link<input type="url" value={project.demo} oninput={(e) => updateProject(index, 'demo', e.currentTarget.value)} /></label>
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
								<div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><input class="project-name" value={item.title} aria-label="Milestone title" oninput={(e) => updateJourney(index, 'title', e.currentTarget.value)} /><button class="icon-button danger" onclick={() => removeJourney(index)}>Remove</button></div>
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
								<div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><input class="project-name" value={cat.category} aria-label="Category name" oninput={(e) => updateSkillCategory(index, 'category', e.currentTarget.value)} /><button class="icon-button danger" onclick={() => removeSkillCategory(index)}>Remove</button></div>
								<div class="field-grid">
									<label>Icon glyph<input value={cat.icon} oninput={(e) => updateSkillCategory(index, 'icon', e.currentTarget.value)} /></label>
									<label>Accent color
										<select value={cat.color} onchange={(e) => updateSkillCategory(index, 'color', e.currentTarget.value)}>
											<option value="var(--accent-gold)">Gold</option>
											<option value="var(--accent-purple)">Purple</option>
											<option value="var(--accent-teal)">Teal</option>
										</select>
									</label>
									<label class="wide">Skill items<input value={cat.items.join(', ')} oninput={(e) => updateSkillItems(index, e.currentTarget.value)} /></label>
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
								<div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><input class="project-name" value={cert.title} aria-label="Certification title" oninput={(e) => updateCertification(index, 'title', e.currentTarget.value)} /><button class="icon-button danger" onclick={() => removeCertification(index)}>Remove</button></div>
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
								<div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><input class="project-name" value={item.title} aria-label="Achievement title" oninput={(e) => updateAchievement(index, 'title', e.currentTarget.value)} /><button class="icon-button danger" onclick={() => removeAchievement(index)}>Remove</button></div>
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