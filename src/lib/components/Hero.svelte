<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { SITE, HERO_STATS } from '$lib/data/site';
	import { contentState } from '$lib/stores/content.svelte';
	import HeroBackground from '$lib/components/hero/HeroBackground.svelte';
	import HeroPortraitStage from '$lib/components/hero/HeroPortraitStage.svelte';
	import HeroRoleRotator from '$lib/components/hero/HeroRoleRotator.svelte';
	import HeroStatCounter from '$lib/components/hero/HeroStatCounter.svelte';
	import HeroCta from '$lib/components/hero/HeroCta.svelte';
	import SectionOrbs from '$lib/components/global/SectionOrbs.svelte';
	import './hero/hero.css';

	let section: HTMLElement;
	let leftCol: HTMLDivElement;
	let scrollHint: HTMLElement;
	let mouse = $state({ x: 0, y: 0 });
	const heroStats = $derived(contentState.heroStats.length ? contentState.heroStats : HERO_STATS);

	onMount(() => {
		const onHeroMove = (e: PointerEvent) => {
			if (!section) return;
			const rect = section.getBoundingClientRect();
			mouse = {
				x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
				y: ((e.clientY - rect.top) / rect.height - 0.5) * 2
			};
		};
		section?.addEventListener('pointermove', onHeroMove, { passive: true });

		void (async () => {
			const { default: ScrollTrigger } = await import('gsap/ScrollTrigger');
			gsap.registerPlugin(ScrollTrigger);

			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (reduced || !leftCol) return;

			const tl = gsap.timeline({ delay: 0.3, defaults: { ease: 'power3.out' } });

			tl.from('[data-hero-eyebrow]', { y: 24, opacity: 0, duration: 0.75 })
				.from(
					'[data-hero-letter]',
					{
						y: 56,
						opacity: 0,
						duration: 0.85,
						stagger: 0.04,
						rotateX: 14,
						transformOrigin: 'left bottom',
						filter: 'blur(6px)'
					},
					'-=0.4'
				)
				.to('[data-hero-letter]', { filter: 'blur(0px)', duration: 0.75, stagger: 0.03 }, '-=0.65')
				.from('[data-hero-role]', { y: 16, opacity: 0, duration: 0.6 }, '-=0.5')
				.from('[data-hero-tagline]', { y: 20, opacity: 0, duration: 0.7 }, '-=0.4')
				.from('[data-hero-stat]', { y: 24, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.35')
				.from('[data-hero-cta]', { y: 16, opacity: 0, duration: 0.5 }, '-=0.25')
				.from('[data-hero-meta]', { opacity: 0, duration: 0.5 }, '-=0.2');

			if (scrollHint) {
				gsap.from(scrollHint, { opacity: 0, y: 10, delay: 0.8, duration: 0.6 });
				gsap.to(scrollHint, {
					y: 6,
					duration: 1.6,
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut',
					delay: 1.2
				});
			}
		})();

		return () => section?.removeEventListener('pointermove', onHeroMove);
	});

	async function downloadResume() {
		await fetch('/api/resume', { method: 'POST', keepalive: true });
		window.open(SITE.resume, '_blank');
	}
</script>

<section
	id="hero"
	bind:this={section}
	class="hero-section relative z-[2] flex min-h-[100svh] items-start overflow-hidden pt-20 pb-16 md:items-center md:pt-32 md:pb-24"
>
	<div data-parallax-hero-bg class="absolute inset-0 z-0">
		<HeroBackground {mouse} />
	</div>

	<SectionOrbs variant="dark" />

	<div
		class="hero-entrance-vignette pointer-events-none absolute inset-0 z-[1]"
		aria-hidden="true"
	></div>
	<div class="hero-right-glow pointer-events-none absolute inset-0 z-[1]" aria-hidden="true"></div>
	<div class="hero-left-glow pointer-events-none absolute inset-0 z-[1]" aria-hidden="true"></div>
	<div class="hero-light-streak pointer-events-none z-[1]" aria-hidden="true"></div>

	<div
		class="relative z-10 mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-8 px-5 md:grid-cols-2 md:gap-10 md:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 lg:px-16"
	>
		<!-- Mobile portrait (above text, only on mobile) -->
		<div class="relative flex w-full items-center justify-center pt-2 md:hidden">
			<div class="hero-mobile-portrait">
				<HeroPortraitStage bind:mouse />
			</div>
		</div>

		<div bind:this={leftCol} class="flex flex-col justify-center md:pr-4 lg:pr-8">
			<p
				data-hero-eyebrow
				data-editable="site.location"
				class="mb-6 flex items-center gap-3 text-[10px] tracking-[0.45em] uppercase"
				style="color: var(--text-muted);"
			>
				<span class="h-px w-10 bg-gradient-to-r from-[var(--accent-gold)]/60 to-transparent"></span>
				{contentState.site.location}
			</p>

			<div class="hero-cinematic-line mb-6" aria-hidden="true"></div>

			<h1 class="hero-headline display-heading">
				<span class="block" data-editable="site.nameLine1">
					{#each contentState.site.nameLine1.split('') as letter}
						<span data-hero-letter>{letter === ' ' ? '\u00a0' : letter}</span>
					{/each}
				</span>
				<br />
				<span class="block" data-editable="site.nameLine2">
					{#each contentState.site.nameLine2.split('') as letter}
						<span data-hero-letter>{letter}</span>
					{/each}
				</span>
			</h1>

			<p data-hero-role class="hero-subtitle mt-5">
				<span class="hero-subtitle__prefix">I'm a </span>
				<HeroRoleRotator />
			</p>

			<p
				data-hero-tagline
				data-editable="site.brand"
				class="hero-tagline mt-5 max-w-lg text-base leading-relaxed text-balance md:text-lg"
			>
				{contentState.site.brand}
			</p>

			<div class="hero-stat-grid mt-8 lg:max-w-md">
				{#each heroStats as stat}
					<div data-hero-stat>
						<HeroStatCounter
							value={stat.value}
							suffix={stat.suffix}
							label={stat.label}
							display={'display' in stat ? stat.display : undefined}
						/>
					</div>
				{/each}
			</div>

			<div data-hero-cta class="mt-9">
				<HeroCta onResume={downloadResume} />
			</div>

			<p data-hero-meta class="mt-6 text-xs tracking-wide" style="color: var(--text-muted);">
				🟢 Available for internships, collaborations & freelance projects
			</p>
		</div>

		<!-- Desktop portrait (right column) -->
		<div class="relative hidden items-center justify-center md:flex md:justify-end">
			<HeroPortraitStage bind:mouse />
		</div>
	</div>

	<a
		bind:this={scrollHint}
		href="#about"
		class="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.35em] uppercase md:bottom-8"
		style="color: var(--text-muted);"
	>
		<span>Scroll</span>
		<span class="block h-9 w-px bg-gradient-to-b from-[var(--accent-gold)]/50 to-transparent"
		></span>
	</a>
</section>
