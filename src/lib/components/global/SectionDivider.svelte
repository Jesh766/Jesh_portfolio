<script lang="ts">
	let {
		from = 'ivory',
		to = 'beige'
	}: {
		from?: string;
		to?: string;
	} = $props();

	const uid = `w${Math.random().toString(36).slice(2, 9)}`;

	const fromColor = $derived(
		from === 'charcoal' ? '#1a1a1a' : from === 'beige' ? '#e8ded1' : '#f7f3ed'
	);
	const toColor = $derived(
		to === 'charcoal' ? '#1a1a1a' : to === 'beige' ? '#e8ded1' : '#f7f3ed'
	);
</script>

<div class="section-wave relative z-[2] -my-px" aria-hidden="true" style="color: {toColor};">
	<svg
		class="block w-full"
		viewBox="0 0 1440 64"
		preserveAspectRatio="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<defs>
			<linearGradient id="wave-grad-{uid}" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color={fromColor} />
				<stop offset="100%" stop-color={toColor} />
			</linearGradient>
		</defs>
		<path
			class="section-wave__layer section-wave__layer--3"
			fill="url(#wave-grad-{uid})"
			opacity="0.35"
			d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z"
		/>
		<path
			class="section-wave__layer section-wave__layer--2"
			fill="url(#wave-grad-{uid})"
			opacity="0.55"
			d="M0,40 C320,8 640,56 960,36 C1120,24 1280,48 1440,40 L1440,64 L0,64 Z"
		/>
		<path
			class="section-wave__layer"
			fill="url(#wave-grad-{uid})"
			d="M0,48 C180,16 360,56 540,44 C900,20 1080,60 1440,48 L1440,64 L0,64 Z"
		/>
	</svg>
</div>
