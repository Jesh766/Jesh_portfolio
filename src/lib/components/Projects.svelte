<script lang="ts">
	import { PROJECTS } from '$lib/data/site';
	import { contentState } from '$lib/stores/content.svelte';
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import SectionOrbs from '$lib/components/global/SectionOrbs.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { revealSectionHeaders } from '$lib/utils/scrollReveal';

	let section: HTMLElement | undefined;
	let projectGrid = $state<HTMLElement | undefined>(undefined);

	const projects = $derived(contentState.projects.length ? contentState.projects : PROJECTS);

	onMount(async () => {
		await revealSectionHeaders();
		const { default: ScrollTrigger } = await import('gsap/ScrollTrigger');
		gsap.registerPlugin(ScrollTrigger);
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !projectGrid) return;

		gsap.fromTo(projectGrid.children,
			{ y: 40, opacity: 0 },
			{
				scrollTrigger: { trigger: projectGrid, start: 'top 85%', once: true },
				y: 0,
				opacity: 1,
				duration: 0.8,
				stagger: 0.1,
				ease: 'power3.out'
			}
		);
	});
</script>

<section id="projects" bind:this={section} class="section-padding section-dark relative z-[1] overflow-hidden">
	<SectionOrbs variant="dark" />
	<p class="section-watermark" aria-hidden="true">Work</p>

	<div class="grain-overlay pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true"></div>
	<div class="relative z-[1] mx-auto max-w-6xl">
		<div data-section-header>
			<p class="flex items-center gap-3 text-xs tracking-[0.4em] uppercase" style="color: var(--text-muted);">
				<span class="h-px w-6 bg-gradient-to-r from-[var(--accent-gold)]/60 to-transparent" aria-hidden="true"></span>
				<span data-editable="site.projectsLabel">{contentState.site.projectsLabel}</span>
			</p>
			<h2 data-display-heading class="display-heading mt-5 text-3xl sm:text-4xl md:text-5xl" data-editable="site.projectsHeading">{contentState.site.projectsHeading}</h2>
			<p class="mt-4 max-w-xl text-base leading-relaxed" data-editable="site.projectsIntro" style="color: var(--text-secondary);">
				{contentState.site.projectsIntro}
			</p>
		</div>

		{#if projects.length}
			<div bind:this={projectGrid} class="mt-12 grid gap-5 sm:grid-cols-2">
				{#each projects as project, index}
					<ProjectCard {project} {index} />
				{/each}
			</div>
		{:else}
			<p class="mt-12 text-sm" style="color: var(--text-muted);">Projects coming soon.</p>
		{/if}

		<div class="mt-12 text-center">
			<a
				href="https://github.com/Jesh766/Jesh_portfolio"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm tracking-wide transition-[border-color,color,box-shadow] duration-300 hover:border-[var(--border-accent)] hover:shadow-[var(--glow-gold)]"
				style="border-color: var(--border-subtle); color: var(--text-muted);"
			>
				View all projects on GitHub
				<span style="opacity:0.5">→</span>
			</a>
		</div>
	</div>
</section>
