<script lang="ts">
	import { onMount } from 'svelte';
	import { appState } from '$lib/stores/app.svelte';
	import gsap from 'gsap';

	let root: HTMLDivElement;
	let line: HTMLDivElement;
	let label: HTMLParagraphElement;
	let progress = $state(0);

	onMount(() => {
		const reduced =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const finish = () => {
			appState.loaded = true;
			if (!root) return;
			root.style.pointerEvents = 'none';
			gsap.to(root, {
				opacity: 0,
				duration: reduced ? 0.1 : 0.4,
				ease: 'power2.inOut',
				onComplete: () => {
					root.style.display = 'none';
				}
			});
		};

		if (reduced) {
			progress = 100;
			finish();
			return;
		}

		if (label) gsap.from(label, { y: 20, opacity: 0, duration: 0.35, ease: 'power3.out' });

		const tween = gsap.to(
			{ value: 0 },
			{
				value: 100,
				duration: 0.55,
				ease: 'power2.out',
				onUpdate() {
					progress = Math.round(this.targets()[0].value);
					if (line) line.style.width = `${progress}%`;
				},
				onComplete: finish
			}
		);

		return () => tween.kill();
	});
</script>

<div
	bind:this={root}
	class="loader fixed inset-0 z-[100] flex flex-col items-center justify-center {appState.loaded
		? 'pointer-events-none'
		: ''}"
	style="background: var(--bg-primary); color: var(--text-primary);"
	aria-hidden={appState.loaded}
>
	<p bind:this={label} class="display-heading text-xs tracking-[0.35em]" style="color: var(--accent-gold);">JAYSHIL THAKKAR</p>
	<p class="mt-2 text-[10px] tracking-[0.35em] uppercase" style="color: var(--text-muted);">Creative Technologist</p>
	<div class="relative mt-12 h-px w-56 overflow-hidden" style="background: var(--border-subtle);">
		<div bind:this={line} class="absolute inset-y-0 left-0 w-0 bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-purple)]"></div>
	</div>
	<p class="mt-4 font-mono text-[10px] tracking-widest" style="color: var(--text-muted);">{progress}%</p>
</div>
