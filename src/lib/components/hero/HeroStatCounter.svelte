<script lang="ts">
	import gsap from 'gsap';

	let {
		value,
		suffix = '',
		label,
		display
	}: {
		value: number;
		suffix?: string;
		label: string;
		display?: string;
	} = $props();

	let root: HTMLDivElement;
	let shown = $state('');

	$effect(() => {
		if (!root) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (display || reduced) {
			shown = display ?? `${value}${suffix}`;
			return;
		}

		const obj = { n: 0 };
		const tween = gsap.to(obj, {
			n: value,
			duration: 2,
			ease: 'power2.out',
			delay: 2,
			onUpdate: () => {
				shown = `${Math.round(obj.n)}${suffix}`;
			}
		});
		return () => tween.kill();
	});
</script>

<div bind:this={root} class="hero-stat">
	<p class="hero-stat__value font-display">{shown}</p>
	<p class="hero-stat__label">{label}</p>
</div>
