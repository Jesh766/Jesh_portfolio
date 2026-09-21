<script lang="ts">
	import { PROJECTS } from '$lib/data/site';
	import { contentState } from '$lib/stores/content.svelte';
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import SectionOrbs from '$lib/components/global/SectionOrbs.svelte';
	import { revealSectionHeaders } from '$lib/utils/scrollReveal';

	let section: HTMLElement | undefined;
	let showcase: HTMLElement | undefined;
	let extraGrid = $state<HTMLElement | undefined>(undefined);
	let comingCard = $state<HTMLElement | undefined>(undefined);

	const tags = ['AgriTech', 'AI', 'Full Stack', 'UX'];
	const projects = $derived(contentState.projects.length ? contentState.projects : PROJECTS);
	const featuredIndex = $derived(Math.max(projects.findIndex((p) => p.featured), 0));
	const featuredProject = $derived(projects[featuredIndex] ?? PROJECTS[0]);
	const otherProjects = $derived(
		projects.map((project, index) => ({ project, index })).filter((entry) => entry.index !== featuredIndex)
	);

	onMount(async () => {
		await revealSectionHeaders();
		const { default: ScrollTrigger } = await import('gsap/ScrollTrigger');
		gsap.registerPlugin(ScrollTrigger);
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		if (showcase) {
			gsap.fromTo(showcase,
				{ y: 60, opacity: 0 },
				{
					scrollTrigger: { trigger: showcase, start: 'top 78%', once: true },
					y: 0,
					opacity: 1,
					duration: 1.1,
					ease: 'power3.out'
				}
			);
		}

		if (extraGrid) {
			gsap.fromTo(extraGrid.children,
				{ y: 40, opacity: 0 },
				{
					scrollTrigger: { trigger: extraGrid, start: 'top 85%', once: true },
					y: 0,
					opacity: 1,
					duration: 0.8,
					stagger: 0.1,
					ease: 'power3.out'
				}
			);
		}

		if (comingCard) {
			gsap.fromTo(comingCard,
				{ y: 40, opacity: 0 },
				{
					scrollTrigger: { trigger: comingCard, start: 'top 88%', once: true },
					y: 0,
					opacity: 1,
					duration: 0.85,
					ease: 'power3.out'
				}
			);
		}
	});
</script>

<section id="projects" bind:this={section} class="section-padding section-dark relative z-[1] overflow-hidden">
	<SectionOrbs variant="dark" />
	<p class="section-watermark" aria-hidden="true">Work</p>

	<div class="grain-overlay pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true"></div>
	<div class="relative z-[1] mx-auto max-w-6xl">
		<div data-section-header>
			<p
				class="flex items-center gap-3 text-xs tracking-[0.4em] uppercase"
				style="color: var(--text-muted);"
			>
				<span class="h-px w-6 bg-gradient-to-r from-[var(--accent-gold)]/60 to-transparent" aria-hidden="true"></span>
				<span data-editable="site.projectsLabel">{contentState.site.projectsLabel}</span>
			</p>
			<h2 data-display-heading class="display-heading mt-5 text-3xl sm:text-4xl md:text-5xl" data-editable="site.projectsHeading">{contentState.site.projectsHeading}</h2>
			<p class="mt-4 max-w-xl text-base leading-relaxed" data-editable="site.projectsIntro" style="color: var(--text-secondary);">
				{contentState.site.projectsIntro}
			</p>
		</div>

		<!-- Featured project -->
		<article
			bind:this={showcase}
			class="project-glass-card case-study group mt-16 overflow-hidden rounded-3xl"
		>
			<div class="relative overflow-hidden border-b border-[var(--border-subtle)] px-5 py-8 sm:px-8 sm:py-12 md:px-12 md:py-16">
				<div
					class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_80%_20%,rgba(201,168,76,0.18),transparent_55%)] opacity-70 transition-[opacity] duration-700 group-hover:opacity-100"
					aria-hidden="true"
				></div>
				<div class="relative">
					<div class="flex flex-wrap items-center gap-3">
						<p class="text-xs tracking-[0.35em] uppercase text-[var(--accent-gold)]" data-editable={`projects.${featuredIndex}.status`}>{featuredProject.status ?? 'Case study · Featured'}</p>
						<span class="cert-year-pill" data-editable={`projects.${featuredIndex}.year`}>{featuredProject.year}</span>
					</div>
					<h3 class="display-heading mt-3 text-3xl sm:text-4xl md:text-5xl" data-editable={`projects.${featuredIndex}.title`}>{featuredProject.title}</h3>
					<p class="mt-3 line-clamp-1 max-w-xl text-sm leading-relaxed" data-editable={`projects.${featuredIndex}.tagline`} style="color: var(--text-secondary);">
						{featuredProject.tagline}
					</p>
					<div class="mt-4 flex flex-wrap gap-2">
						{#each featuredProject.tags ?? tags as tag, tagIndex}
								<span class="project-tag-pill" data-editable={`projects.${featuredIndex}.tags.${tagIndex}`}>{tag}</span>
						{/each}
					</div>
					<div class="mt-6 flex flex-wrap gap-3">
						<a
							href={featuredProject.github || '#'}
							target="_blank"
							rel="noopener noreferrer"
							class="project-link-btn project-link-btn--github"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:inline;vertical-align:-1px;margin-right:5px;"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
							View on GitHub
						</a>
						{#if featuredProject.demo}
							<a href={featuredProject.demo} target="_blank" rel="noopener noreferrer" class="project-link-btn project-link-btn--demo">Live demo →</a>
						{/if}
					</div>
				</div>
				<div class="relative mt-5 flex flex-wrap gap-x-6 gap-y-2">
					{#each featuredProject.metrics ?? [] as metric}
						<div class="flex items-baseline gap-2">
							<p class="font-display text-xl text-[var(--accent-gold)]">{metric.value}</p>
							<p class="text-[10px] tracking-widest uppercase" style="color: var(--text-muted);">{metric.label}</p>
						</div>
					{/each}
				</div>
			</div>

			<div class="project-preview border-t border-[var(--border-subtle)] p-5 sm:p-8">
				<div class="project-preview-window overflow-hidden rounded-xl border border-[var(--border-subtle)]">
					<div class="flex items-center gap-2 border-b border-[var(--border-subtle)] px-4 py-3">
						<span class="h-2 w-2 rounded-full bg-red-400/70"></span>
						<span class="h-2 w-2 rounded-full bg-yellow-400/70"></span>
						<span class="h-2 w-2 rounded-full bg-green-400/70"></span>
						<span class="ml-3 truncate text-[10px] tracking-[0.2em] uppercase" style="color: var(--text-muted);">farmsathi · home</span>
					</div>
					<div class="grid gap-6 px-5 py-8 sm:grid-cols-[1.1fr_0.9fr] sm:items-center sm:px-10 sm:py-10">
						<div>
							<p class="text-[10px] tracking-[0.3em] uppercase text-[var(--accent-gold)]">FarmSathi</p>
							<p class="mt-2 max-w-md font-display text-2xl leading-tight text-[var(--text-primary)] sm:text-3xl">Share resources. Grow together.</p>
							<p class="mt-3 max-w-sm text-xs leading-relaxed" style="color: var(--text-secondary);">A simple platform for farmers to find equipment and labour when it matters.</p>
						</div>
						<div class="preview-map" aria-hidden="true">
							<div class="preview-map-line preview-map-line--one"></div>
							<div class="preview-map-line preview-map-line--two"></div>
							<div class="preview-map-pin preview-map-pin--one"></div>
							<div class="preview-map-pin preview-map-pin--two"></div>
							<div class="preview-map-pin preview-map-pin--three"></div>
						</div>
					</div>
				</div>
			</div>
		</article>

		<!-- Other projects (from the admin/dashboard) -->
		{#if otherProjects.length}
			<div bind:this={extraGrid} class="mt-10 grid gap-5 sm:grid-cols-2">
				{#each otherProjects as { project, index }}
					<article class="project-glass-card rounded-2xl p-6 sm:p-8">
						<div class="flex flex-wrap items-center gap-3">
							<p class="text-xs tracking-[0.35em] uppercase text-[var(--accent-gold)]" data-editable={`projects.${index}.status`}>{project.status}</p>
							<span class="cert-year-pill" data-editable={`projects.${index}.year`}>{project.year}</span>
						</div>
						<h3 class="display-heading mt-3 text-2xl" data-editable={`projects.${index}.title`}>{project.title}</h3>
						<p class="mt-2 line-clamp-1 text-xs leading-relaxed" data-editable={`projects.${index}.tagline`} style="color: var(--text-secondary);">{project.tagline}</p>
						{#if project.tags?.length}
							<div class="mt-4 flex flex-wrap gap-2">
								{#each project.tags as tag, tagIndex}
									<span class="project-tag-pill" data-editable={`projects.${index}.tags.${tagIndex}`}>{tag}</span>
								{/each}
							</div>
						{/if}
						<div class="mt-5 flex flex-wrap gap-3">
							{#if project.github}
								<a href={project.github} target="_blank" rel="noopener noreferrer" class="project-link-btn project-link-btn--github">
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:inline;vertical-align:-1px;margin-right:5px;"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
									GitHub
								</a>
							{/if}
							{#if project.demo}
								<a href={project.demo} target="_blank" rel="noopener noreferrer" class="project-link-btn project-link-btn--demo">Live demo →</a>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<!-- Coming Soon placeholder, only shown while there's nothing else to show -->
			<div class="mt-10">
				<div
					bind:this={comingCard}
					class="project-coming-card relative overflow-hidden rounded-2xl p-8 sm:p-10"
				>
					<div class="pointer-events-none absolute inset-0 rounded-2xl border-2 border-dashed border-[var(--border-subtle)] opacity-40"></div>
					<div class="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left sm:gap-8">
						<div class="flex-shrink-0">
							<span class="text-4xl" aria-hidden="true">⚙️</span>
						</div>
						<div>
							<p class="text-xs tracking-[0.35em] uppercase mb-2" style="color: var(--accent-gold);">WIP · 2025</p>
							<h3 class="text-xl font-semibold" style="color: var(--text-primary);">Next Project in Progress</h3>
							<p class="mt-2 text-sm leading-relaxed" style="color: var(--text-secondary);">
								More AI-powered tools and full-stack applications are currently being built. Check back soon or visit GitHub to follow along.
							</p>
						</div>
						<a
							href="https://github.com/Jesh766/Jesh_portfolio"
							target="_blank"
							rel="noopener noreferrer"
							class="project-link-btn project-link-btn--github flex-shrink-0"
						>
							GitHub →
						</a>
					</div>
				</div>
			</div>
		{/if}

		<!-- View All GitHub CTA -->
		<div class="mt-12 text-center">
			<a
				href="https://github.com/Jesh766/Jesh_portfolio"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm tracking-wide transition-[border-color,color,box-shadow] duration-300 hover:border-[var(--border-accent)] hover:shadow-[var(--glow-gold)]"
				style="border-color: var(--border-subtle); color: var(--text-muted);"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
				View all projects on GitHub
				<span style="opacity:0.5">→</span>
			</a>
		</div>`
	</div>
</section>

<style>
	.project-coming-card {
		background: rgba(12, 12, 14, 0.6);
		border: 1px solid var(--border-subtle);
		backdrop-filter: blur(16px);
	}

	.project-link-btn {
		display: inline-flex;
		align-items: center;
		padding: 0.4rem 0.9rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		text-decoration: none;
		transition: background 0.25s, color 0.25s, border-color 0.25s;
		border: 1px solid;
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

	.project-preview-window {
		background: linear-gradient(135deg, rgba(201, 168, 76, 0.08), rgba(255, 255, 255, 0.02));
	}

	.preview-map {
		position: relative;
		min-height: 8rem;
		overflow: hidden;
		border: 1px solid rgba(201, 168, 76, 0.2);
		border-radius: 0.75rem;
		background:
			linear-gradient(32deg, transparent 46%, rgba(201, 168, 76, 0.16) 47%, transparent 49%),
			linear-gradient(148deg, transparent 46%, rgba(201, 168, 76, 0.12) 47%, transparent 49%),
			rgba(8, 12, 11, 0.5);
	}

	.preview-map-line {
		position: absolute;
		height: 1px;
		background: rgba(201, 168, 76, 0.35);
		transform-origin: left center;
	}

	.preview-map-line--one {
		inset: 25% 8% auto 15%;
		transform: rotate(20deg);
	}

	.preview-map-line--two {
		inset: 68% 12% auto 18%;
		transform: rotate(-25deg);
	}

	.preview-map-pin {
		position: absolute;
		width: 0.6rem;
		height: 0.6rem;
		border: 2px solid var(--accent-gold);
		border-radius: 999px;
		background: var(--bg-card);
		box-shadow: 0 0 0 5px rgba(201, 168, 76, 0.12);
	}

	.preview-map-pin--one { top: 22%; left: 28%; }
	.preview-map-pin--two { top: 55%; right: 24%; }
	.preview-map-pin--three { bottom: 14%; left: 48%; }
</style>