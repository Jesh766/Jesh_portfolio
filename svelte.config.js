import vercel from '@sveltejs/adapter-vercel';
import node from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const useVercel = process.env.VERCEL === '1' || process.env.CI === 'true';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: useVercel
			? vercel({ runtime: 'nodejs20.x', split: false })
			: node(),
		alias: {
			$components: 'src/lib/components',
			$lib: 'src/lib',
			$data: 'src/lib/data'
		}
	}
};

export default config;
