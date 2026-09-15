<script lang="ts">
	import { SITE } from '$lib/data/site';
	import { PORTRAIT_SOURCES } from '$lib/utils/portrait';

	let {
		mouse = { x: 0, y: 0 },
		loaded = $bindable(false)
	}: {
		mouse?: { x: number; y: number };
		loaded?: boolean;
	} = $props();

	let src = $state<string>(SITE.portrait);
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
</script>

<div
	class="hero-portrait-clip relative z-10 w-full overflow-hidden will-change-transform"
	style="transform: perspective(1400px) rotateX({tiltX}deg) rotateY({tiltY}deg);"
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
</div>
