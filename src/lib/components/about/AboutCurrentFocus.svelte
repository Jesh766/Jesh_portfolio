<script lang="ts">
	const focuses = [
		{ icon: '⚡', label: 'AI Engineering' },
		{ icon: '🎨', label: 'Creative Development' },
		{ icon: '✦', label: 'Frontend Experiences' },
		{ icon: '🧭', label: 'Product Thinking' },
		{ icon: '🤝', label: 'Human + AI Collaboration' }
	];
</script>

<div class="current-focus" data-about-reveal>
	<p class="current-focus__eyebrow">Current Focus</p>
	<div class="current-focus__grid">
		{#each focuses as f, i}
			<div class="current-focus__card" style="--fi:{i}" data-cursor-hover>
				<span class="current-focus__icon" aria-hidden="true">{f.icon}</span>
				<span class="current-focus__label">{f.label}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.current-focus__eyebrow {
		font-size: 0.6rem;
		letter-spacing: 0.35em;
		text-transform: uppercase;
		color: var(--accent-gold);
		margin-bottom: 0.85rem;
		opacity: 0.85;
	}

	.current-focus__grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.current-focus__card {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.5rem 0.9rem;
		border-radius: 2rem;
		background: rgba(201, 168, 76, 0.06);
		border: 1px solid rgba(201, 168, 76, 0.18);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		cursor: default;
		transition:
			background 0.3s ease,
			border-color 0.3s ease,
			box-shadow 0.3s ease,
			transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
		animation: focus-in calc(0.6s + var(--fi) * 0.07s) ease both;
		animation-delay: calc(0.1s + var(--fi) * 0.08s);
	}

	.current-focus__card:hover {
		background: rgba(201, 168, 76, 0.12);
		border-color: rgba(201, 168, 76, 0.45);
		box-shadow: 0 0 20px rgba(201, 168, 76, 0.2);
		transform: translateY(-2px);
	}

	.current-focus__icon {
		font-size: 0.8rem;
		line-height: 1;
	}

	.current-focus__label {
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		color: var(--text-secondary);
		white-space: nowrap;
		transition: color 0.3s ease;
	}

	.current-focus__card:hover .current-focus__label {
		color: var(--accent-gold);
	}

	@keyframes focus-in {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.current-focus__card {
			animation: none;
		}
	}
</style>
