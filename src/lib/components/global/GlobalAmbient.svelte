<script lang="ts">
	import { browser } from '$app/environment';
</script>

{#if browser}
	<div class="ambient-root pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
		<div class="grain-overlay absolute inset-0 opacity-[0.035]"></div>
	</div>
{/if}
