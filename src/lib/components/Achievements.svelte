<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ACHIEVEMENTS } from '$lib/data/site';
	import { contentState } from '$lib/stores/content.svelte';
	import SectionOrbs from '$lib/components/global/SectionOrbs.svelte';
	import { revealSectionHeaders } from '$lib/utils/scrollReveal';

	const milestones = $derived(contentState.achievements.length ? contentState.achievements : ACHIEVEMENTS);

	onMount(async () => {
		await revealSectionHeaders();
		const { default: ScrollTrigger } = await import('gsap/ScrollTrigger');
		gsap.registerPlugin(ScrollTrigger);
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		gsap.utils.toArray<HTMLElement>('[data-milestone]').forEach((el, i) => {
			gsap.fromTo(el,
				{ opacity: 0, y: 28 },
				{
					scrollTrigger: { trigger: el, start: 'top 88%', once: true },
					opacity: 1,
					y: 0,
					duration: 0.55,
					delay: i * 0.08,
					ease: 'power2.out'
				}
			);
		});
	});
</script>

<section id="achievements" class="section-padding section-secondary relative z-[1] overflow-hidden">
	<p class="section-watermark" aria-hidden="true">Journey</p>
	<SectionOrbs variant="dark" />
	<div class="relative z-[1] mx-auto max-w-6xl">
		<div data-section-header>
			<p class="flex items-center gap-3 text-xs tracking-[0.4em] uppercase" style="color: var(--text-muted);">
				<span class="h-px w-6 bg-gradient-to-r from-[var(--accent-gold)]/60 to-transparent" aria-hidden="true"></span>
				<span data-editable="site.journeyTag">Journey</span>
			</p>
			<h2 class="display-heading mt-5 text-3xl sm:text-4xl md:text-5xl" data-editable="site.journeyTitle">Journey so far</h2>
			<p class="mt-4 max-w-xl text-base leading-relaxed" data-editable="site.journeyIntro" style="color: var(--text-secondary);">
				From first line of code to building AI-powered products — here's the path.
			</p>
		</div>

		<div class="journey-timeline mt-14">
			{#each milestones as milestone, i}
				<div
					data-milestone
					class="journey-item"
					class:journey-item--last={i === milestones.length - 1}
				>
					<!-- Line + Dot -->
					<div class="journey-spine" aria-hidden="true">
						<div class="journey-dot" style="background: {milestone.accent}; box-shadow: 0 0 12px {milestone.accent};"></div>
						{#if i < milestones.length - 1}
							<div class="journey-line"></div>
						{/if}
					</div>

					<!-- Content -->
					<div class="journey-content group rounded-2xl p-6 sm:p-7 transition-[border-color,box-shadow,transform] duration-400 hover:-translate-y-1 hover:border-[var(--border-accent)] hover:shadow-[var(--glow-gold)]"
						style="background: rgba(12,12,14,0.5); border: 1px solid var(--border-subtle); backdrop-filter: blur(12px);"
					>
						<div class="flex flex-wrap items-center gap-3 mb-3">
							<span class="journey-year-pill" data-editable={`achievements.${i}.year`} style="color: {milestone.accent}; border-color: {milestone.accent};">{milestone.year}</span>
							<span class="text-xl" aria-hidden="true">{milestone.icon}</span>
						</div>
						<h3 class="text-lg font-semibold leading-snug" data-editable={`achievements.${i}.title`} style="color: var(--text-primary);">{milestone.title}</h3>
						<p class="mt-2 text-sm leading-relaxed" data-editable={`achievements.${i}.description`} style="color: var(--text-secondary);">{milestone.body}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.journey-timeline {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.journey-item {
		display: grid;
		grid-template-columns: 2.5rem 1fr;
		gap: 0 1.25rem;
		align-items: start;
		padding-bottom: 1.5rem;
	}

	.journey-item--last {
		padding-bottom: 0;
	}

	@media (min-width: 768px) {
		.journey-item {
			grid-template-columns: 3rem 1fr;
			gap: 0 1.5rem;
		}
	}

	.journey-spine {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 1.6rem;
	}

	.journey-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
		position: relative;
		z-index: 1;
	}

	.journey-line {
		width: 1px;
		flex: 1;
		min-height: 2rem;
		background: linear-gradient(to bottom, var(--border-subtle), transparent);
		margin-top: 6px;
	}

	.journey-content {
		min-width: 0;
	}

	.journey-year-pill {
		display: inline-block;
		font-size: 0.65rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		font-weight: 600;
		padding: 0.2rem 0.65rem;
		border-radius: 9999px;
		border: 1px solid;
		opacity: 0.9;
	}
</style>
