<script lang="ts">
	import { SITE } from '$lib/data/site';
	import { contentState } from '$lib/stores/content.svelte';
</script>

<footer
	class="border-t border-[var(--border-subtle)] px-6 py-12 text-center text-sm"
	style="background: var(--bg-secondary); color: var(--text-muted);"
>
	<p class="display-heading text-xs tracking-[0.4em]" data-editable="footer.name" style="color: var(--text-secondary);">{contentState.footer.name || SITE.name}</p>
	<p class="mt-2" data-editable="footer.description">{contentState.footer.copyright.replace('{year}', String(new Date().getFullYear())).replace('{title}', contentState.footer.description || SITE.title)}</p>
</footer>
