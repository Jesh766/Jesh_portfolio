<script lang="ts">
	import type { Project } from '$lib/data/site';

	let { project, index }: { project: Project; index: number } = $props();

	function shortTagline(tagline: string) {
		const words = tagline.trim().split(/\s+/);
		return words.length > 20 ? `${words.slice(0, 20).join(' ')}...` : tagline;
	}
</script>

<article class="project-glass-card group overflow-hidden rounded-2xl">
	<div class="project-preview-window overflow-hidden border-b border-[var(--border-subtle)]">
		<div class="flex items-center gap-2 border-b border-[var(--border-subtle)] px-4 py-3">
			<span class="h-2 w-2 rounded-full bg-red-400/70"></span>
			<span class="h-2 w-2 rounded-full bg-yellow-400/70"></span>
			<span class="h-2 w-2 rounded-full bg-green-400/70"></span>
			<span class="ml-3 truncate text-[10px] tracking-[0.2em] uppercase" style="color: var(--text-muted);">{project.title} · preview</span>
		</div>
		<div class="aspect-[16/8] overflow-hidden bg-[var(--bg-card)]">
			<img src={project.image} alt={`${project.title} homepage preview`} class="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]" />
		</div>
	</div>

	<div class="p-6 sm:p-8">
		<div class="flex flex-wrap items-center gap-3">
			<p class="text-xs tracking-[0.35em] uppercase text-[var(--accent-gold)]" data-editable={`projects.${index}.status`}>{project.status}</p>
			<span class="cert-year-pill" data-editable={`projects.${index}.year`}>{project.year}</span>
		</div>
		<h3 class="display-heading mt-3 text-2xl" data-editable={`projects.${index}.title`}>{project.title}</h3>
		<p class="mt-2 line-clamp-2 text-xs leading-relaxed" data-editable={`projects.${index}.tagline`} style="color: var(--text-secondary);">{shortTagline(project.tagline)}</p>
		{#if project.tags?.length}
			<div class="mt-4 flex flex-wrap gap-2">
				{#each project.tags as tag, tagIndex}
					<span class="project-tag-pill" data-editable={`projects.${index}.tags.${tagIndex}`}>{tag}</span>
				{/each}
			</div>
		{/if}
		<div class="mt-5 flex flex-wrap gap-3">
			{#if project.github}
				<a href={project.github} target="_blank" rel="noopener noreferrer" class="project-link-btn project-link-btn--github">GitHub</a>
			{/if}
			{#if project.demo}
				<a href={project.demo} target="_blank" rel="noopener noreferrer" class="project-link-btn project-link-btn--demo">Live demo →</a>
			{/if}
		</div>
	</div>
</article>

<style>
	.project-preview-window {
		background: linear-gradient(135deg, rgba(201, 168, 76, 0.08), rgba(255, 255, 255, 0.02));
	}

	.project-link-btn {
		display: inline-flex;
		align-items: center;
		padding: 0.4rem 0.9rem;
		border: 1px solid;
		border-radius: 9999px;
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		text-decoration: none;
		transition: background 0.25s, color 0.25s, border-color 0.25s;
	}

	.project-link-btn--github {
		border-color: var(--border-subtle);
		color: var(--text-muted);
		background: transparent;
	}

	.project-link-btn--github:hover {
		border-color: var(--border-accent);
		color: var(--text-primary);
		background: rgba(201, 168, 76, 0.07);
	}

	.project-link-btn--demo {
		border-color: var(--accent-gold);
		color: var(--accent-gold);
		background: rgba(201, 168, 76, 0.08);
	}

	.project-link-btn--demo:hover {
		background: rgba(201, 168, 76, 0.18);
	}
</style>
