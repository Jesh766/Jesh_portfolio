<script lang="ts">
	import { TIMELINE } from '$lib/data/site';
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import SectionOrbs from '$lib/components/global/SectionOrbs.svelte';
	import { revealSectionHeaders } from '$lib/utils/scrollReveal';
	import AboutAmbient from '$lib/components/about/AboutAmbient.svelte';
	import AboutAICore from '$lib/components/about/AboutAICore.svelte';
	import AboutIntro from '$lib/components/about/AboutIntro.svelte';
	import AboutImpactMetrics from '$lib/components/about/AboutImpactMetrics.svelte';
	import AboutCurrentFocus from '$lib/components/about/AboutCurrentFocus.svelte';

	let timelinePath = $state<SVGPathElement | undefined>(undefined);

	onMount(() => {
		void (async () => {
			await revealSectionHeaders();
			const { default: ScrollTrigger } = await import('gsap/ScrollTrigger');
			gsap.registerPlugin(ScrollTrigger);
			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			if (!reduced && timelinePath) {
				const len = timelinePath.getTotalLength();
				gsap.set(timelinePath, { strokeDasharray: len, strokeDashoffset: len });
				gsap.to(timelinePath, {
					scrollTrigger: { trigger: '#about', start: 'top 65%', end: 'bottom 60%', scrub: 1 },
					strokeDashoffset: 0,
					ease: 'none'
				});
			}

			if (!reduced) {
				gsap.utils.toArray<HTMLElement>('[data-timeline-item]').forEach((el, i) => {
					gsap.from(el, {
						scrollTrigger: { trigger: el, start: 'top 86%' },
						x: 80,
						opacity: 0,
						duration: 0.85,
						delay: i * 0.12,
						ease: 'power3.out'
					});
					gsap.from(el.querySelector('[data-timeline-dot]'), {
						scrollTrigger: { trigger: el, start: 'top 86%' },
						scale: 0,
						duration: 0.5,
						delay: i * 0.12,
						ease: 'back.out(2)'
					});
				});

				gsap.from('#about [data-about-reveal]', {
					scrollTrigger: { trigger: '#about .about-left', start: 'top 78%' },
					y: 32,
					opacity: 0,
					stagger: 0.12,
					duration: 0.8,
					ease: 'power3.out'
				});

				gsap.from('#about [data-about-metrics] .about-metric-card', {
					scrollTrigger: { trigger: '#about [data-about-metrics]', start: 'top 88%' },
					y: 22,
					opacity: 0,
					stagger: 0.1,
					duration: 0.65,
					ease: 'power2.out'
				});
			}
		})();
	});
</script>

<section id="about" class="section-padding section-secondary about-section relative z-[1] overflow-hidden">
	<AboutAmbient />
	<div class="section-dot-grid about-section__dot-grid" aria-hidden="true"></div>
	<!-- Animated golden grid overlay on left side -->
	<div class="about-gold-grid" aria-hidden="true"></div>
	<SectionOrbs variant="about" />
	<p class="section-watermark" aria-hidden="true">Journey</p>

	<div class="relative z-[1] mx-auto max-w-6xl">
		<SectionHeader
			eyebrow="About"
			title="Story & trajectory"
			description="From university foundations to creative technology—crafting experiences where design, AI, and engineering meet with intention."
		/>

		<p class="status-available relative z-[1] mt-6">
			<span class="status-available__dot" aria-hidden="true"></span>
			Available for opportunities
		</p>

		<div class="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
			<!-- LEFT COLUMN — fully filled -->
			<div class="about-left space-y-8">
				<!-- Top: Intro text -->
				<AboutIntro />

				<!-- Middle: AI Core Orb — main visual attraction -->
				<div data-about-reveal class="about-orb-wrap">
					<div class="about-orb-label" aria-hidden="true">
						<span class="about-orb-label__text">AI CORE</span>
						<span class="about-orb-label__dot"></span>
					</div>
					<AboutAICore />
					<p class="about-orb-caption">Mouse-reactive energy orb · Built with Three.js</p>
				</div>

				<!-- Below orb: Achievement cards -->
				<AboutImpactMetrics />

				<!-- Bottom: Current Focus -->
				<AboutCurrentFocus />
			</div>

			<!-- RIGHT COLUMN — timeline -->
			<div class="relative mt-4 md:mt-0">
				<svg
					class="pointer-events-none absolute top-0 bottom-0 left-3 hidden w-8 md:left-5 md:block"
					viewBox="0 0 8 800"
					preserveAspectRatio="none"
					aria-hidden="true"
				>
					<path
						bind:this={timelinePath}
						d="M4,0 L4,800"
						fill="none"
						stroke="var(--accent-gold)"
						stroke-width="2"
						stroke-dasharray="4 6"
						opacity="0.6"
					/>
				</svg>
				<div
					class="absolute top-0 bottom-0 left-3 w-px origin-top bg-gradient-to-b from-[var(--accent-gold)]/60 via-white/10 to-transparent md:left-5 md:hidden"
					aria-hidden="true"
				></div>

				<ol class="relative space-y-0 pl-10 md:pl-14">
					{#each TIMELINE as item}
						<li data-timeline-item class="relative pb-14 last:pb-0">
							<span
								data-timeline-dot
								class="absolute top-1.5 -left-[calc(2.5rem-4px)] h-2.5 w-2.5 rounded-full bg-[var(--accent-gold)] ring-4 ring-[var(--bg-secondary)] md:-left-[calc(3.5rem-4px)]"
							></span>
							<p class="font-mono text-xs tracking-widest text-[var(--accent-gold)]">{item.year}</p>
							<h3 class="mt-2 font-display text-2xl" style="color: var(--text-primary);">{item.title}</h3>
							<p class="mt-3 max-w-xl leading-relaxed" style="color: var(--text-secondary);">
								{item.description}
							</p>
						</li>
					{/each}
				</ol>
			</div>
		</div>
	</div>
</section>

<style>
	.about-section__dot-grid {
		background-image:
			linear-gradient(rgba(201, 168, 76, 0.05) 1px, transparent 1px),
			linear-gradient(90deg, rgba(201, 168, 76, 0.05) 1px, transparent 1px);
		background-size: 40px 40px;
		opacity: 0.35;
	}

	/* Animated golden grid on left half only */
	.about-gold-grid {
		position: absolute;
		inset: 0 50% 0 0;
		pointer-events: none;
		z-index: 0;
		background-image:
			linear-gradient(rgba(201, 168, 76, 0.07) 1px, transparent 1px),
			linear-gradient(90deg, rgba(201, 168, 76, 0.07) 1px, transparent 1px);
		background-size: 60px 60px;
		mask-image: radial-gradient(ellipse 85% 80% at 25% 50%, black 10%, transparent 70%);
		animation: grid-shift 12s ease-in-out infinite;
	}

	@keyframes grid-shift {
		0%, 100% { background-position: 0 0; opacity: 0.5; }
		50% { background-position: 8px 8px; opacity: 0.85; }
	}

	/* Orb wrapper with caption */
	.about-orb-wrap {
		position: relative;
	}

	.about-orb-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.about-orb-label__text {
		font-size: 0.6rem;
		letter-spacing: 0.35em;
		text-transform: uppercase;
		color: var(--accent-gold);
		opacity: 0.75;
	}

	.about-orb-label__dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--accent-gold);
		box-shadow: 0 0 8px rgba(201, 168, 76, 0.8);
		animation: dot-pulse 2s ease-in-out infinite;
	}

	@keyframes dot-pulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.5; transform: scale(0.7); }
	}

	.about-orb-caption {
		text-align: center;
		font-size: 0.6rem;
		letter-spacing: 0.12em;
		color: var(--text-muted);
		opacity: 0.6;
		margin-top: 0.5rem;
		text-transform: uppercase;
	}

	@media (prefers-reduced-motion: reduce) {
		.about-gold-grid {
			animation: none;
		}
		.about-orb-label__dot {
			animation: none;
		}
	}
</style>
