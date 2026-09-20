<script lang="ts">
	import { onMount } from 'svelte';
	import { SITE } from '$lib/data/site';
	import { PORTRAIT_SOURCES } from '$lib/utils/portrait';
	import './hero.css';

	let {
		mouse = { x: 0, y: 0 },
		loaded = $bindable(false)
	}: {
		mouse?: { x: number; y: number };
		loaded?: boolean;
	} = $props();

	let src = $state<string>(SITE.portrait);
	let revealSrc = $state('/images/jayshil-portrait-hover.jpg');
	let innerLoaded = $state(false);

	const tiltX = $derived(-mouse.y * 8);
	const tiltY = $derived(mouse.x * 10);

	function onError() {
		const i = PORTRAIT_SOURCES.findIndex((s) => s === src);
		const next = PORTRAIT_SOURCES[i + 1];
		if (next) src = next;
	}

	function onLoad() {
		innerLoaded = true;
		loaded = true;
	}

	function onRevealError() {
		revealSrc = src;
	}

	let clipEl: HTMLDivElement;
	let reducedMotion = false;

	let curX = $state(50);
	let curY = $state(38);
	let curR = $state(0);

	let targetX = 50;
	let targetY = 38;
	let targetR = 0;
	let rafId: number;
	let demoRafId: number;
	let demoActive = $state(false);
	let demoVisible = $state(false);
	let demoFading = $state(false);
	let demoX = $state(50);
	let demoY = $state(38);
	let demoFadeTimer: ReturnType<typeof setTimeout> | undefined;

	function setTargetFromPoint(clientX: number, clientY: number) {
		if (!clipEl) return;
		const rect = clipEl.getBoundingClientRect();
		targetX = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
		targetY = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
		targetR = 40;
	}

	function onPointerMove(e: PointerEvent) {
		setTargetFromPoint(e.clientX, e.clientY);
	}

	function onPointerLeave() {
		targetR = 0;
	}

	function onTouchMove(e: TouchEvent) {
		const t = e.touches[0];
		if (t) setTargetFromPoint(t.clientX, t.clientY);
	}

	function stopAutoDemo() {
		if (!demoActive) return;
		demoActive = false;
		demoFading = true;
		cancelAnimationFrame(demoRafId);
		targetR = 0;
		window.removeEventListener('pointermove', stopAutoDemo);
		window.removeEventListener('pointerdown', stopAutoDemo);
		window.removeEventListener('touchstart', stopAutoDemo);
		window.removeEventListener('click', stopAutoDemo);
		clearTimeout(demoFadeTimer);
		demoFadeTimer = setTimeout(() => {
			demoVisible = false;
			demoFading = false;
		}, 500);
	}

	function runAutoDemo(startTime: number) {
		if (!demoActive) return;
		const progress = Math.min((performance.now() - startTime) / 5600, 1);
		const angle = progress * Math.PI * 4;
		demoX = 50 + Math.sin(angle) * 31;
		demoY = 40 + Math.sin(angle * 2) * 20;
		targetX = demoX;
		targetY = demoY;
		targetR = 38;
		if (progress >= 1) {
			stopAutoDemo();
			return;
		}
		demoRafId = requestAnimationFrame(() => runAutoDemo(startTime));
	}

	function startAutoDemo() {
		try {
			if (sessionStorage.getItem('hero-demo-played')) return;
			sessionStorage.setItem('hero-demo-played', 'true');
		} catch {
			return;
		}
		demoActive = true;
		demoVisible = true;
		demoFading = false;
		window.addEventListener('pointermove', stopAutoDemo, { once: true });
		window.addEventListener('pointerdown', stopAutoDemo, { once: true });
		window.addEventListener('touchstart', stopAutoDemo, { once: true });
		window.addEventListener('click', stopAutoDemo, { once: true });
		demoRafId = requestAnimationFrame((time) => runAutoDemo(time));
	}

	function tick() {
		curX += (targetX - curX) * 0.12;
		curY += (targetY - curY) * 0.12;
		curR += (targetR - curR) * 0.12;
		rafId = requestAnimationFrame(tick);
	}

	onMount(() => {
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (reducedMotion) {
			// No animated reveal for reduced-motion users — show a soft,
			// static hint of the glass layer instead of a moving mask.
			curX = targetX = 50;
			curY = targetY = 38;
			curR = targetR = 22;
			return;
		}

		rafId = requestAnimationFrame(tick);
		startAutoDemo();
		return () => cancelAnimationFrame(rafId);
	});
</script>

<div
	bind:this={clipEl}
	class="hero-portrait-clip relative z-10 w-full overflow-hidden will-change-transform"
	style="transform: perspective(1400px) rotateX({tiltX}deg) rotateY({tiltY}deg); --reveal-x: {curX}%; --reveal-y: {curY}%; --reveal-r: {curR}%;"
	onpointermove={onPointerMove}
	onpointerleave={onPointerLeave}
	ontouchmove={onTouchMove}
	ontouchend={onPointerLeave}
	role="presentation"
>
	<img
		{src}
		data-cursor-image
		alt="{SITE.name} — professional portrait"
		class="hero-portrait-img block aspect-[4/5] h-full w-full object-cover object-[center_18%] transition-opacity duration-700 {innerLoaded
			? 'opacity-100'
			: 'opacity-0'}"
		onload={onLoad}
		onerror={onError}
		fetchpriority="high"
		decoding="async"
	/>

	<img
		src={revealSrc}
		aria-hidden="true"
		alt=""
		class="hero-portrait-img hero-portrait-reveal pointer-events-none absolute inset-0 block aspect-[4/5] h-full w-full object-cover object-[center_18%] {innerLoaded
			? 'opacity-100'
			: 'opacity-0'}"
		onerror={onRevealError}
	/>

	<div class="hero-glass-rim pointer-events-none absolute inset-0" aria-hidden="true"></div>

	{#if demoVisible}
		<div
			class="hero-auto-demo-dot"
			class:hero-auto-demo-dot--fading={demoFading}
			style="left: {demoX}%; top: {demoY}%;"
			aria-hidden="true"
		></div>
	{/if}
</div>