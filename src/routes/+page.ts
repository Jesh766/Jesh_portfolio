import { SITE } from '$lib/data/site';
import { env } from '$env/dynamic/public';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	const title = `${SITE.name} · Software Engineer & AI Enthusiast`;
	const description =
		'Jayshil Thakkar — Software Engineer & AI Enthusiast from Ahmedabad, India. Building intelligent web applications, AI-powered tools, and modern digital experiences.';
	const siteUrl = env.PUBLIC_SITE_URL || SITE.url;
	return {
		meta: {
			title,
			description,
			og: {
				title,
				description,
				type: 'website',
				url: siteUrl,
				image: `${siteUrl}/og-image.svg`
			}
		}
	};
};
