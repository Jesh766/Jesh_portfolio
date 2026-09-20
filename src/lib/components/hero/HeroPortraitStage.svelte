<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import HeroScene from './HeroScene.svelte';
	import HeroPortraitImage from './HeroPortraitImage.svelte';
	import HeroFloatingCard from './HeroFloatingCard.svelte';
	import { HERO_FLOATING_CARDS } from '$lib/data/site';
	import './hero.css';

	let {
		mouse = $bindable({ x: 0, y: 0 })
	}: {
		mouse?: { x: number; y: number };
	} = $props();

	let stage: HTMLDivElement;
	let portraitWrap: HTMLDivElement;
	let portraitLoaded = $state(false);

	onMount(() => {
		if (!stage) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (!reduced) {
			gsap.from(stage.querySelectorAll('[data-hero-depth]'), {
				scale: 0.85,
				opacity: 0,
				duration: 1.2,
				stagger: 0.1,
				ease: 'power3.out',
				delay: 0.2
			});

			if (portraitWrap) {
				gsap.from(portraitWrap, {
					scale: 0.92,
					opacity: 0,
					duration: 1.4,
					ease: 'power3.out',
					delay: 0.1
				});
			}
		}

		const onMove = (e: PointerEvent) => {
			if (!stage) return;
			const rect = stage.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
			const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
			mouse = { x, y };
		};

		stage.addEventListener('pointermove', onMove, { passive: true });
		return () => stage.removeEventListener('pointermove', onMove);
	});
</script>


<div class="hero-portrait-stage-shell">
	<div
		bind:this={stage}
		class="hero-stage relative mx-auto aspect-[4/5] w-full max-w-[22rem] sm:max-w-[26rem] md:max-w-[28rem] lg:max-w-[32rem] lg:aspect-[5/6]"
	>
	<div
		data-hero-depth
		class="pointer-events-none absolute -inset-[8%] rounded-full blur-3xl"
		style="background: rgba(201,168,76,0.10);"
		aria-hidden="true"
	></div>

	<div class="hero-glow hero-glow-pulse pointer-events-none absolute -inset-8 rounded-full opacity-70" aria-hidden="true"></div>

	<div class="absolute inset-0 z-0 overflow-hidden rounded-2xl">
		<HeroScene bind:mouse />
	</div>

	<div bind:this={portraitWrap} class="relative z-10 h-full w-full px-[4%] py-[3%]">
		<HeroPortraitImage {mouse} bind:loaded={portraitLoaded} />
	</div>

	{#each HERO_FLOATING_CARDS as card}
		<HeroFloatingCard
			title={card.title}
			position={card.position}
			delay={card.delay}
			floatDuration={card.floatDuration}
		/>
	{/each}

	</div>
	<div class="hero-portrait-hint" aria-hidden="true">
		<span class="hero-portrait-hint__ring"></span>
		<span>Move over portrait</span>
	</div>
</div>
