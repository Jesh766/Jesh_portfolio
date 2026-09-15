<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'ghost' | 'outline';

	let {
		href,
		type = 'button',
		variant = 'primary',
		class: className = '',
		onclick,
		children
	}: {
		href?: string;
		type?: 'button' | 'submit';
		variant?: Variant;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	} = $props();

	const base =
		'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300';

	const variants: Record<Variant, string> = {
		primary: 'bg-charcoal text-ivory hover:bg-black hover:shadow-lg',
		ghost: 'bg-transparent text-charcoal hover:bg-beige/60',
		outline:
			'border border-charcoal/30 bg-transparent text-charcoal hover:border-charcoal hover:bg-beige/40'
	};
</script>

{#if href}
	<a {href} class="{base} {variants[variant]} {className}" {onclick}>
		{@render children()}
	</a>
{:else}
	<button {type} class="{base} {variants[variant]} {className}" {onclick}>
		{@render children()}
	</button>
{/if}
