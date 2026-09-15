import { SITE } from '$lib/data/site';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	const title = `${SITE.name} · Software Engineer & AI Enthusiast`;
	const description = 'Jayshil Thakkar — Software Engineer & AI Enthusiast from Ahmedabad, India. Building intelligent web applications, AI-powered tools, and modern digital experiences.';
	return {
		meta: {
			title,
			description,
			og: {
				title,
				description,
				type: 'website',
				url: SITE.url,
				image: `${SITE.url}/og-image.svg`
			}
		}
	};
};
