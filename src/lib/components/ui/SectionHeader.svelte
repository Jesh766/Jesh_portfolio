<script lang="ts">
	let {
		eyebrow,
		title,
		description
	}: {
		eyebrow: string;
		title: string;
		description?: string;
	} = $props();
</script>

<div data-section-header class="max-w-2xl">
	<p
		class="flex items-center gap-3 text-xs tracking-[0.4em] uppercase"
		style="color: var(--text-muted);"
	>
		<span class="h-px w-6 bg-gradient-to-r from-[var(--accent-gold)]/50 to-transparent" aria-hidden="true"></span>
		{eyebrow}
	</p>
	<h2 class="display-heading mt-5 text-3xl sm:text-4xl md:text-5xl">{title}</h2>
	{#if description}
		<p class="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed" style="color: var(--text-secondary);">{description}</p>
	{/if}
</div>
