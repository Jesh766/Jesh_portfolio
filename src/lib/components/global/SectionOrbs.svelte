<script lang="ts">
	let { variant = 'dark' }: { variant?: 'light' | 'dark' | 'about' | 'skills' } = $props();
</script>

<div class="section-ambient pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true" data-parallax-orbs>
	{#if variant === 'about'}
		<div
			class="gradient-orb gradient-orb--gold h-[min(680px,55vw)] w-[min(680px,55vw)] -top-[12%] -left-[8%]"
		></div>
		<div
			class="gradient-orb gradient-orb--purple h-[min(560px,48vw)] w-[min(560px,48vw)] -bottom-[5%] -right-[10%]"
		></div>
	{:else if variant === 'skills'}
		<div
			class="gradient-orb gradient-orb--purple h-[min(500px,42vw)] w-[min(500px,42vw)] top-[42%] right-[12%]"
			style="opacity: 0.12;"
		></div>
		<div
			class="gradient-orb gradient-orb--gold h-[min(480px,40vw)] w-[min(480px,40vw)] -top-[8%] -left-[6%]"
			style="opacity: 0.1;"
		></div>
	{:else}
		<div
			class="gradient-orb gradient-orb--gold h-[min(680px,55vw)] w-[min(680px,55vw)] -top-[12%] -right-[8%]"
		></div>
		<div
			class="gradient-orb gradient-orb--purple h-[min(500px,42vw)] w-[min(500px,42vw)] bottom-[5%] -left-[10%]"
			style="opacity: 0.12;"
		></div>
	{/if}
</div>
