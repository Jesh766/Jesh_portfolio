<script lang="ts">
	import { onMount } from 'svelte';
	import { PROJECTS, SITE } from '$lib/data/site';

	type Project = {
		id: string;
		title: string;
		tagline: string;
		tags: string[];
		status: string;
		year: string;
		github: string;
		demo: string;
		featured?: boolean;
	};
	type Content = { site: Record<string, string>; projects: Project[] };
	type Analytics = {
		totals: { visitors: number; pageViews: number; averageDurationMs: number; days: number };
		sections: { section: string; views: number }[];
		recent: { event_type: string; page_path: string | null; section_id: string | null; created_at: string }[];
	};

	const defaultContent: Content = { site: { ...SITE }, projects: structuredClone(PROJECTS as unknown as Project[]) };
	let content: Content = structuredClone(defaultContent);
	let analytics: Analytics = { totals: { visitors: 0, pageViews: 0, averageDurationMs: 0, days: 30 }, sections: [], recent: [] };
	let notice = '';
	let error = '';
	let saving = false;
	let dirty = false;
	let activeTab = 'content';

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
			projects: Array.isArray(source.projects)
				? source.projects.map((project) => ({ ...emptyProject(), ...project, tags: Array.isArray(project.tags) ? project.tags : [] }))
				: []
		};
	}

	function emptyProject(): Project {
		return {
			id: `project-${Date.now()}`,
			title: 'New project',
			tagline: '',
			tags: [],
			status: 'In progress',
			year: String(new Date().getFullYear()),
			github: '',
			demo: '',
			featured: false
		};
	}

	function updateSite(key: string, value: string) {
		content = { ...content, site: { ...content.site, [key]: value } };
		dirty = true;
	}

	function updateProject(index: number, key: keyof Project, value: string | boolean | string[]) {
		content = { ...content, projects: content.projects.map((project, itemIndex) => itemIndex === index ? { ...project, [key]: value } : project) };
		dirty = true;
	}

	function updateTags(index: number, value: string) {
		updateProject(index, 'tags', value.split(',').map((tag) => tag.trim()).filter(Boolean));
	}

	function addProject() {
		content = { ...content, projects: [...content.projects, emptyProject()] };
		dirty = true;
	}

	function removeProject(index: number) {
		content = { ...content, projects: content.projects.filter((_, itemIndex) => itemIndex !== index) };
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
		<button class:active={activeTab === 'content'} onclick={() => activeTab = 'content'}>Content editor</button>
		<button class:active={activeTab === 'analytics'} onclick={() => activeTab = 'analytics'}>Visitor analytics</button>
	</nav>

	{#if activeTab === 'content'}
		<main class="editor-layout">
			<section class="panel editor-main">
				<div class="panel-heading"><div><p class="admin-kicker">Visual editor</p><h2>Site identity</h2></div><span class:dirty class="draft-status">{dirty ? 'Unsaved changes' : 'All changes saved'}</span></div>
				<div class="field-grid">
					<label>Display name<input value={content.site.name} oninput={(event) => updateSite('name', event.currentTarget.value)} /></label>
					<label>Location<input value={content.site.location} oninput={(event) => updateSite('location', event.currentTarget.value)} /></label>
					<label>Professional title<input value={content.site.title} oninput={(event) => updateSite('title', event.currentTarget.value)} /></label>
					<label>Contact email<input type="email" value={content.site.email} oninput={(event) => updateSite('email', event.currentTarget.value)} /></label>
					<label class="wide">Hero statement<textarea rows="3" oninput={(event) => updateSite('brand', event.currentTarget.value)}>{content.site.brand}</textarea></label>
				</div>

				<div class="panel-heading section-heading"><div><p class="admin-kicker">Homepage</p><h2>Hero copy</h2></div></div>
				<div class="field-grid"><label>First name line<input value={content.site.nameLine1} oninput={(event) => updateSite('nameLine1', event.currentTarget.value)} /></label><label>Second name line<input value={content.site.nameLine2} oninput={(event) => updateSite('nameLine2', event.currentTarget.value)} /></label></div>
			</section>

			<section class="panel editor-main">
				<div class="panel-heading"><div><p class="admin-kicker">Portfolio work</p><h2>Projects</h2></div><button class="secondary" onclick={addProject}>+ Add project</button></div>
				<p class="muted">Create, remove, or update project cards. Separate tags with commas.</p>
				<div class="project-editor-list">
					{#each content.projects as project, index}
						<article class="project-editor-card">
							<div class="project-card-heading"><span class="project-index">{String(index + 1).padStart(2, '0')}</span><input class="project-name" value={project.title} aria-label="Project title" oninput={(event) => updateProject(index, 'title', event.currentTarget.value)} /><button class="icon-button danger" title="Remove project" onclick={() => removeProject(index)}>Remove</button></div>
							<div class="field-grid"><label>Short description<textarea rows="3" oninput={(event) => updateProject(index, 'tagline', event.currentTarget.value)}>{project.tagline}</textarea></label><label>Status<input value={project.status} oninput={(event) => updateProject(index, 'status', event.currentTarget.value)} /></label><label>Year<input value={project.year} oninput={(event) => updateProject(index, 'year', event.currentTarget.value)} /></label><label>Tags<input value={project.tags.join(', ')} oninput={(event) => updateTags(index, event.currentTarget.value)} /></label><label>GitHub link<input type="url" value={project.github} oninput={(event) => updateProject(index, 'github', event.currentTarget.value)} /></label><label>Live demo link<input type="url" value={project.demo} oninput={(event) => updateProject(index, 'demo', event.currentTarget.value)} /></label></div>
						</article>
					{/each}
					{#if !content.projects.length}<div class="empty-state">No projects yet. Add your first project above.</div>{/if}
				</div>
			</section>
		</main>
		<footer class="publish-bar"><div>{#if notice}<span class="success">{notice}</span>{:else if error}<span class="error">{error}</span>{:else}<span class="muted">Draft changes are private until published.</span>{/if}</div><div class="publish-actions"><button class="secondary" onclick={() => save('draft')} disabled={saving || !dirty}>Save draft</button><button class="primary" onclick={() => save('publish')} disabled={saving}>{saving ? 'Saving...' : 'Publish changes'}</button></div></footer>
	{:else}
		<main class="analytics-layout"><section class="panel"><div class="panel-heading"><div><p class="admin-kicker">Engagement</p><h2>Section views</h2></div></div>{#if analytics.sections.length}<div class="section-list">{#each analytics.sections as item}<div><span>{item.section}</span><strong>{item.views}</strong></div>{/each}</div>{:else}<p class="muted">No section data yet.</p>{/if}</section><section class="panel recent-panel"><div class="panel-heading"><div><p class="admin-kicker">Event stream</p><h2>Recent activity</h2></div></div><div class="table-wrap"><table><thead><tr><th>Event</th><th>Path</th><th>Time</th></tr></thead><tbody>{#each analytics.recent as event}<tr><td>{event.event_type}</td><td>{event.section_id ?? event.page_path ?? '—'}</td><td>{new Date(event.created_at).toLocaleString()}</td></tr>{/each}</tbody></table></div></section></main>
	{/if}
</div>

<style>
	:global(body) { background: #080604; }
	.admin-shell { min-height: 100svh; padding: 2rem clamp(1rem, 4vw, 4rem) 7rem; color: #fff; background: radial-gradient(circle at 90% 0%, rgba(201,168,76,.1), transparent 30rem), #080604; }
	.admin-header, .panel-heading, .admin-actions, .publish-bar, .publish-actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }.admin-header { max-width: 90rem; margin: 0 auto 2.5rem; }
	.admin-kicker { color: #c9a84c; font-size: .7rem; letter-spacing: .2em; text-transform: uppercase; margin: 0; } h1, h2 { margin: .45rem 0 0; font-family: 'Cormorant Garamond', serif; font-weight: 500; } h1 { font-size: clamp(2.2rem, 6vw, 4.5rem); line-height: .95; } h2 { font-size: 2rem; }.muted { color: rgba(255,255,255,.56); line-height: 1.55; }
	.admin-actions a, .admin-actions button, .secondary { color: rgba(255,255,255,.78); text-decoration: none; background: transparent; border: 1px solid rgba(255,255,255,.16); padding: .65rem .9rem; cursor: pointer; }.admin-actions a:hover, .secondary:hover { border-color: #c9a84c; color: #fff; }
	.metrics, .editor-layout, .analytics-layout, .tabs { max-width: 90rem; margin: 0 auto; }.metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,.1); margin-bottom: 1.5rem; }.metrics > div { display: grid; gap: .35rem; padding: 1.3rem; background: #100d09; }.metrics span, .metrics small { color: rgba(255,255,255,.56); }.metrics strong { font-size: 2.2rem; font-weight: 400; }
	.tabs { display: flex; gap: .4rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,.1); }.tabs button { border: 0; border-bottom: 2px solid transparent; padding: .8rem 1rem; color: rgba(255,255,255,.56); background: transparent; cursor: pointer; }.tabs button.active { color: #fff; border-color: #c9a84c; }
	.editor-layout { display: grid; gap: 1.5rem; }.panel { padding: 1.4rem; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.035); }.field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 1.4rem; }label { display: grid; gap: .45rem; color: rgba(255,255,255,.7); font-size: .78rem; }label.wide { grid-column: 1 / -1; }input, textarea { width: 100%; padding: .78rem .85rem; border: 1px solid rgba(255,255,255,.14); border-radius: 2px; color: #fff; background: rgba(0,0,0,.25); font: inherit; }textarea { resize: vertical; line-height: 1.5; }.section-heading { margin-top: 2.5rem; }
	.draft-status { color: #8ee0bf; font-size: .75rem; }.draft-status.dirty { color: #f4c96b; }.project-editor-list { display: grid; gap: 1rem; margin-top: 1.5rem; }.project-editor-card { padding: 1.2rem; border: 1px solid rgba(255,255,255,.1); background: rgba(0,0,0,.18); }.project-card-heading { display: flex; align-items: center; gap: .8rem; }.project-index { color: #c9a84c; font-size: .75rem; }.project-name { flex: 1; font-size: 1.2rem; }.icon-button { border: 0; background: transparent; cursor: pointer; }.danger { color: #ff9b8d; }.primary { border: 0; padding: .75rem 1.1rem; background: #c9a84c; color: #080604; font-weight: 700; cursor: pointer; }.primary:disabled, .secondary:disabled { opacity: .45; cursor: wait; }.empty-state { padding: 2rem; text-align: center; color: rgba(255,255,255,.5); border: 1px dashed rgba(255,255,255,.15); }.publish-bar { position: fixed; right: 0; bottom: 0; left: 0; z-index: 10; padding: 1rem clamp(1rem, 4vw, 4rem); border-top: 1px solid rgba(255,255,255,.12); background: rgba(8,6,4,.94); backdrop-filter: blur(16px); }.success { color: #8ee0bf; }.error { color: #ff9b8d; }
	.analytics-layout { display: grid; grid-template-columns: minmax(18rem, .65fr) minmax(0, 1.35fr); gap: 1.5rem; }.section-list div { display: flex; justify-content: space-between; padding: .85rem 0; border-bottom: 1px solid rgba(255,255,255,.1); }.section-list strong { color: #c9a84c; }.table-wrap { overflow-x: auto; margin-top: 1rem; }table { width: 100%; border-collapse: collapse; text-align: left; font-size: .85rem; }th, td { padding: .8rem; border-bottom: 1px solid rgba(255,255,255,.08); }th { color: #c9a84c; font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; }
	@media (max-width: 700px) { .admin-header, .publish-bar { align-items: flex-start; flex-direction: column; }.metrics, .field-grid, .analytics-layout { grid-template-columns: 1fr; }label.wide { grid-column: auto; }.publish-actions { width: 100%; }.publish-actions button { flex: 1; } }
</style>
