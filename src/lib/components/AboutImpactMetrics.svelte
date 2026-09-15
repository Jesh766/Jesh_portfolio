<script lang="ts">
	import { onMount } from 'svelte';

	const metrics = [
		{ value: 100, suffix: '+', label: 'Hours Exploring AI' },
		{ value: 4, suffix: '+', label: 'Certifications' },
		{ value: 1, suffix: '', label: 'Major Product Built' },
		{ display: 'Proven', label: 'Leadership Experience' }
	] as const;

	let displayed = $state(metrics.map(m => ('display' in m ? m.display : '0' + (m.suffix ?? ''))));
	let cards: HTMLElement[] = $state([]);

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			displayed = metrics.map(m => ('display' in m ? m.display : `${m.value}${m.suffix ?? ''}`));
			return;
		}

		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					io.disconnect();
					metrics.forEach((m, i) => {
						if ('display' in m) return;
						const end = m.value;
						const suffix = m.suffix ?? '';
						const duration = 1200;
						const start = performance.now();
						const tick = (now: number) => {
							const t = Math.min((now - start) / duration, 1);
							const eased = 1 - Math.pow(1 - t, 3);
							const current = Math.round(eased * end);
							displayed[i] = `${current}${suffix}`;
							if (t < 1) requestAnimationFrame(tick);
						};
						requestAnimationFrame(tick);
					});
				});
			},
			{ threshold: 0.4 }
		);

		const el = cards[0]?.closest('[data-about-metrics]');
		if (el) io.observe(el);

		return () => io.disconnect();
	});
</script>

<div class="about-metrics" data-about-metrics>
	{#each metrics as metric, i}
		<div
			class="about-metric-card"
			data-cursor-hover
			style="--metric-i: {i}"
			bind:this={cards[i]}
		>
			<p class="about-metric-card__value font-display">
				{displayed[i]}
			</p>
			<p class="about-metric-card__label">{metric.label}</p>
			<div class="about-metric-card__glow" aria-hidden="true"></div>
		</div>
	{/each}
</div>

<style>
	.about-metrics {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	@media (min-width: 520px) {
		.about-metrics {
			gap: 0.85rem;
		}
	}

	.about-metric-card {
		position: relative;
		overflow: hidden;
		padding: 1.25rem 1.15rem;
		border-radius: 1rem;
		background: rgba(12, 12, 14, 0.6);
		border: 1px solid var(--border-subtle);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		transition:
			border-color 0.35s ease,
			box-shadow 0.35s ease,
			transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.about-metric-card:hover {
		border-color: var(--border-accent);
		box-shadow: var(--glow-gold);
		transform: translateY(-4px);
	}

	.about-metric-card:hover .about-metric-card__glow {
		opacity: 1;
	}

	.about-metric-card__glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse 70% 60% at 50% 110%, rgba(201, 168, 76, 0.1), transparent 70%);
		opacity: 0;
		transition: opacity 0.35s ease;
		pointer-events: none;
	}

	.about-metric-card__value {
		font-size: 1.8rem;
		line-height: 1.1;
		color: var(--accent-gold);
		letter-spacing: -0.01em;
	}

	.about-metric-card__label {
		margin-top: 0.45rem;
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
		line-height: 1.35;
	}
</style>
