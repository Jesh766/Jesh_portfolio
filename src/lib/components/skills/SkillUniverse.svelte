<script lang="ts">
	import { onMount } from 'svelte';
	import { SKILLS_CATEGORIZED } from '$lib/data/site';
	import { prefersReducedMotion } from '$lib/utils/motion';

	let { activeIndex = $bindable(-1), onActiveChange }: {
		activeIndex?: number;
		onActiveChange?: (index: number) => void;
	} = $props();
	let reduced = $state(false);

	const nodes = SKILLS_CATEGORIZED.flatMap((category, categoryIndex) => category.items.map((name, itemIndex) => {
		const index = SKILLS_CATEGORIZED.slice(0, categoryIndex).reduce((total, item) => total + item.items.length, 0) + itemIndex;
		const total = SKILLS_CATEGORIZED.reduce((sum, item) => sum + item.items.length, 0);
		const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
		const ring = index % 3;
		const radiusX = 31 + ring * 5;
		const radiusY = 27 + (index % 2) * 8;
		return { name, category: category.category, color: category.color, index, x: Math.cos(angle) * radiusX, y: Math.sin(angle) * radiusY, z: [-90, 0, 90][ring], lineX: Math.cos(angle) * radiusX, lineY: Math.sin(angle) * radiusY };
	}));

	$effect(() => onActiveChange?.(activeIndex));
	onMount(() => { reduced = prefersReducedMotion(); });
	function selectNode(index: number) { activeIndex = activeIndex === index ? -1 : index; }
</script>

<div class="skill-universe skill-orbit-wrap absolute inset-0 min-h-[400px] w-full flex-1">
	<div class="skill-orbit" class:skill-orbit--paused={reduced || activeIndex >= 0}>
		<svg class="skill-orbit__lines" viewBox="-50 -50 100 100" aria-hidden="true">
			{#each nodes as node}<line x1="0" y1="0" x2={node.lineX} y2={node.lineY} />{/each}
		</svg>
		<div class="skill-orbit__hub" aria-hidden="true"><span>SKILLS</span></div>
		{#each nodes as node}
			<div
				class="skill-node"
				class:skill-node--active={activeIndex === node.index}
				style={`--node-x: ${node.x}%; --node-y: ${node.y}%; --node-z: ${node.z}px; --node-color: ${node.color};`}
				role="button" tabindex="0" aria-label={`${node.name}, ${node.category}`} aria-pressed={activeIndex === node.index}
				onclick={() => selectNode(node.index)} ontouchstart={() => selectNode(node.index)}
				onkeydown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectNode(node.index); } }}
			>
				<span class="skill-node__dot"></span><span class="skill-node__label">{node.name}</span>
			</div>
		{/each}
	</div>
	<div class="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4" aria-live="polite">
		<p class="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-xs tracking-wide backdrop-blur-md" style="color: var(--text-secondary);">
			{activeIndex >= 0 ? nodes[activeIndex]?.name : 'Explore the skill universe'}
		</p>
	</div>
</div>

<style>
	.skill-orbit-wrap { perspective: 900px; overflow: hidden; }
	.skill-orbit { position: absolute; inset: 8% 4%; transform-style: preserve-3d; animation: skill-orbit-spin 28s linear infinite; }
	.skill-orbit--paused, .skill-orbit-wrap:hover .skill-orbit { animation-play-state: paused; }
	.skill-orbit__lines { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; transform: translateZ(-110px); pointer-events: none; }
	.skill-orbit__lines line { stroke: rgba(201, 168, 76, 0.25); stroke-width: 0.35; }
	.skill-orbit__hub { position: absolute; left: 50%; top: 50%; display: grid; width: clamp(4.5rem, 16vw, 7rem); aspect-ratio: 1; place-items: center; border: 1px solid rgba(201, 168, 76, 0.65); border-radius: 50%; background: radial-gradient(circle at 35% 30%, #f5d982, #c9a84c 42%, #6b501b 78%); box-shadow: 0 0 2rem rgba(201, 168, 76, 0.38), inset 0 0 1.5rem rgba(255, 245, 190, 0.3); color: #211807; font-size: 0.58rem; font-weight: 700; letter-spacing: 0.2em; transform: translate(-50%, -50%) translateZ(30px); }
	.skill-node { position: absolute; left: 50%; top: 50%; width: max-content; max-width: 8rem; color: var(--node-color); cursor: pointer; transform: translate3d(calc(var(--node-x) - 50%), calc(var(--node-y) - 50%), var(--node-z)); transform-style: preserve-3d; transition: filter 220ms ease, scale 220ms ease; }
	.skill-node:hover, .skill-node--active { filter: brightness(1.45); scale: 1.12; }
	.skill-node__dot { display: block; width: 0.65rem; height: 0.65rem; margin: 0 auto 0.35rem; border: 1px solid currentColor; border-radius: 50%; background: currentColor; box-shadow: 0 0 1rem currentColor; }
	.skill-node__label { display: block; color: currentColor; font-size: clamp(0.58rem, 1.2vw, 0.78rem); font-weight: 600; line-height: 1.15; text-align: center; text-shadow: 0 1px 8px rgba(0, 0, 0, 0.85); animation: skill-label-billboard 28s linear infinite reverse; }
	.skill-orbit--paused .skill-node__label, .skill-orbit-wrap:hover .skill-node__label { animation-play-state: paused; }
	@keyframes skill-orbit-spin { from { transform: rotateX(-8deg) rotateY(0deg); } to { transform: rotateX(-8deg) rotateY(360deg); } }
	@keyframes skill-label-billboard { from { transform: rotateY(0deg); } to { transform: rotateY(-360deg); } }
	@media (max-width: 640px) { .skill-orbit-wrap { min-height: 360px; perspective: 700px; } .skill-orbit { inset: 10% -12%; transform: scale(0.86); } .skill-node { max-width: 6.5rem; } }
	@media (prefers-reduced-motion: reduce) { .skill-orbit, .skill-node__label { animation: none; } }
</style>
