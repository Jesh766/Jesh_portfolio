<script lang="ts">
	import { BEYOND_CODING, SITE } from '$lib/data/site';
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import SectionOrbs from '$lib/components/global/SectionOrbs.svelte';

	let section: HTMLElement;

	onMount(async () => {
		const { default: ScrollTrigger } = await import('gsap/ScrollTrigger');
		gsap.registerPlugin(ScrollTrigger);
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		gsap.from('[data-beyond-card]', {
			scrollTrigger: { trigger: section, start: 'top 85%' },
			y: 30,
			opacity: 0,
			stagger: 0.1,
			duration: 0.7,
			ease: 'power3.out'
		});
	});
</script>

<section bind:this={section} class="section-padding section-secondary relative z-[1] overflow-hidden py-20">
	<SectionOrbs variant="about" />
	<div class="relative z-[1] mx-auto max-w-6xl">
		<div class="flex flex-col items-center text-center">
			<p class="text-xs tracking-[0.4em] uppercase mb-3" style="color: var(--accent-gold);">
				<span class="inline-block h-px w-5 bg-[var(--accent-gold)]/60 align-middle mr-3"></span>
				Beyond Coding
				<span class="inline-block h-px w-5 bg-[var(--accent-gold)]/60 align-middle ml-3"></span>
			</p>
			<h2 class="display-heading text-3xl md:text-4xl">What makes me, me</h2>
			<p class="mt-4 max-w-md text-sm leading-relaxed" style="color: var(--text-secondary);">
				The things I do when I'm not pushing code.
			</p>
		</div>

		<div class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 max-w-sm mx-auto sm:max-w-md">
			{#each BEYOND_CODING as item}
				<div
					data-beyond-card
					data-cursor-hover
					class="beyond-card flex flex-col items-center gap-3 rounded-2xl p-6 text-center transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1.5 hover:border-[var(--border-accent)] hover:shadow-[var(--glow-gold)]"
					style="background: rgba(12,12,14,0.5); border: 1px solid var(--border-subtle); backdrop-filter: blur(12px);"
				>
					<span class="text-3xl" role="img" aria-label={item.label}>{item.icon}</span>
					<p class="text-sm font-medium" style="color: var(--text-primary);">{item.label}</p>
				</div>
			{/each}
		</div>

		<!-- Availability Banner -->
		<div class="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
			<div class="availability-badge flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
				style="background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.25); color: var(--accent-gold);"
			>
				<span class="availability-dot"></span>
				Available for Internships
			</div>
			<div class="availability-badge flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
				style="background: rgba(0,212,184,0.06); border: 1px solid rgba(0,212,184,0.2); color: var(--accent-teal);"
			>
				<span class="availability-dot" style="background: var(--accent-teal);"></span>
				Open to Freelance Projects
			</div>
		</div>
	</div>
</section>

<style>
	.availability-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--accent-gold);
		animation: pulse-dot 2s ease-in-out infinite;
		flex-shrink: 0;
	}

	@keyframes pulse-dot {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.5; transform: scale(0.8); }
	}
</style>
