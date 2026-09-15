<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';

	let {
		title,
		position,
		delay = 0,
		floatDuration = 5
	}: {
		title: string;
		position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
		delay?: number;
		floatDuration?: number;
	} = $props();

	let card: HTMLDivElement;

	const positionClass: Record<typeof position, string> = {
		'top-left': '-left-2 top-[8%] md:-left-6 md:top-[12%]',
		'top-right': '-right-2 top-[18%] md:-right-8 md:top-[22%]',
		'bottom-left': '-left-4 bottom-[14%] md:-left-10 md:bottom-[18%]',
		'bottom-right': '-right-3 bottom-[8%] md:-right-6 md:bottom-[12%]'
	};

	onMount(() => {
		if (!card) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) return;

		gsap.to(card, {
			y: '+=12',
			duration: floatDuration,
			repeat: -1,
			yoyo: true,
			ease: 'sine.inOut',
			delay
		});
	});
</script>

<div
	bind:this={card}
	class="hero-float-card hero-float-card-glass absolute z-20 max-w-[9.5rem] px-3.5 py-2.5 md:max-w-[11rem] md:px-4 md:py-3 {positionClass[
		position
	]}"
	style="animation-duration: {floatDuration}s; animation-delay: {delay}s"
>
	<span class="mb-1 block h-px w-6 bg-[var(--accent-gold)]/60"></span>
	<p class="text-[10px] leading-snug font-medium tracking-wide md:text-xs" style="color: var(--text-primary);">
		{title}
	</p>
</div>
