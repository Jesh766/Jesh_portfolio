<script lang="ts">
	import { SITE } from '$lib/data/site';
</script>

<footer
	class="border-t border-[var(--border-subtle)] px-6 py-12 text-center text-sm"
	style="background: var(--bg-secondary); color: var(--text-muted);"
>
	<p class="display-heading text-xs tracking-[0.4em]" style="color: var(--text-secondary);">{SITE.name}</p>
	<p class="mt-2">© {new Date().getFullYear()} · {SITE.title}</p>
</footer>
