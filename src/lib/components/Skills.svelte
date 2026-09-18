<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { SKILLS_CATEGORIZED } from '$lib/data/site';
	import { contentState } from '$lib/stores/content.svelte';
	import SkillUniverse from '$lib/components/skills/SkillUniverse.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import SectionOrbs from '$lib/components/global/SectionOrbs.svelte';
	import { revealElements, revealSectionHeaders } from '$lib/utils/scrollReveal';

	let activeIndex = $state(-1);
	let section: HTMLElement;
	let paused = $state(false);

	// "Currently working with" — honest, active tools only
	const activeTools = [
		{ name: 'SvelteKit', note: 'This portfolio' },
		{ name: 'React', note: 'Side projects' },
		{ name: 'TypeScript', note: 'Daily use' },
		{ name: 'Node.js', note: 'Backend work' },
		{ name: 'Anthropic API', note: 'AI features' },
		{ name: 'Supabase', note: 'Database & auth' },
		{ name: 'GSAP', note: 'Animations' },
		{ name: 'Vercel', note: 'Deployment' },
		{ name: 'Git', note: 'Version control' },
		{ name: 'Tailwind CSS', note: 'Styling' },
	];
	const skills = $derived(contentState.skills.length ? contentState.skills : SKILLS_CATEGORIZED);

	onMount(() => {
		revealSectionHeaders();
		revealElements('[data-skill-category]');
		revealElements('[data-active-tool]');
	});
</script>

<section id="skills" bind:this={section} class="section-padding section-dark relative z-[1] overflow-hidden">
	<SectionOrbs variant="skills" />
	<p class="section-watermark" aria-hidden="true">Skills</p>

	<div class="relative z-[1] mx-auto max-w-6xl">
		<SectionHeader
			eyebrow={contentState.site.skillsLabel ?? 'Technical Skills'}
			title={contentState.site.skillsHeading ?? 'Skill universe'}
			description={contentState.site.skillsIntro ?? 'Full-stack development, AI tooling, and everything in between.'}
		/>

		<!-- Categorized Skills Grid -->
		<div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
			{#each skills as cat, ci}
				<div
					data-skill-category
					class="skill-category-card rounded-2xl p-5 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[var(--border-accent)] hover:shadow-[var(--glow-gold)]"
					style="background: rgba(12,12,14,0.6); border: 1px solid var(--border-subtle); backdrop-filter: blur(12px);"
				>
					<div class="mb-3 flex items-center gap-2">
						<span style="color: {cat.color}; font-size: 1rem;">{cat.icon}</span>
						<p class="text-[10px] tracking-[0.3em] uppercase font-medium" style="color: {cat.color};">{cat.category}</p>
					</div>
					<ul class="space-y-1.5">
						{#each cat.items as item}
							<li class="text-sm" style="color: var(--text-secondary);">{item}</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<!-- Visualization + Currently Working With -->
		<div class="mt-14 grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-stretch">
			<div
				class="skill-viz skill-viz-shell relative flex min-h-[280px] flex-col overflow-hidden rounded-3xl sm:min-h-[420px] md:min-h-[500px] lg:min-h-[540px]"
				onmouseenter={() => (paused = true)}
				onmouseleave={() => (paused = false)}
				role="presentation"
			>
				<div class="skill-orbit-rings" class:paused>
					<span class="skill-orbit-ring"></span>
					<span class="skill-orbit-ring"></span>
					<span class="skill-orbit-ring"></span>
				</div>
				<div
					class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(201,168,76,0.22),transparent_58%)]"
					aria-hidden="true"
				></div>
				<div class="skill-center-jt pointer-events-none absolute inset-0 z-[6] flex items-center justify-center" aria-hidden="true">
					<span>JT</span>
				</div>
				{#if browser}
					<SkillUniverse bind:activeIndex />
				{:else}
					<div
						class="flex h-full min-h-[380px] items-center justify-center text-sm"
						style="color: var(--text-muted);"
					>
						Loading universe…
					</div>
				{/if}
			</div>

			<!-- Currently Working With panel -->
			<div class="flex flex-col justify-start gap-0">
				<div class="mb-5">
					<p class="text-[10px] tracking-[0.35em] uppercase mb-1" style="color: var(--accent-gold);">Active Stack</p>
					<h3 class="text-xl font-semibold" style="color: var(--text-primary);">Currently working with</h3>
					<p class="mt-1.5 text-sm leading-relaxed" style="color: var(--text-secondary);">
						Tools and technologies I'm actively learning or using right now.
					</p>
				</div>
				<ul class="grid grid-cols-2 gap-2.5">
					{#each activeTools as tool, i}
						<li
							data-active-tool
							class="active-tool-chip rounded-xl px-3.5 py-3 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--border-accent)] hover:shadow-[var(--glow-gold)]"
							style="background: rgba(12,12,14,0.6); border: 1px solid var(--border-subtle);"
						>
							<span class="block text-sm font-medium" style="color: var(--text-primary);">{tool.name}</span>
							<span class="block text-[10px] mt-0.5" style="color: var(--text-muted);">{tool.note}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</section>

<style>
	.skill-orbit-rings.paused .skill-orbit-ring {
		animation-play-state: paused;
	}

	.active-tool-chip {
		backdrop-filter: blur(8px);
	}
</style>
