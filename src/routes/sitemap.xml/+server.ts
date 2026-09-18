import type { RequestHandler } from '@sveltejs/kit';
import { SITE } from '$lib/data/site';
import { env } from '$env/dynamic/public';

export const GET: RequestHandler = () => {
	const siteUrl = env.PUBLIC_SITE_URL || SITE.url;
	const urls = [''];
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(path) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>monthly</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
