import type { RequestHandler } from '@sveltejs/kit';
import { SITE } from '$lib/data/site';

export const GET: RequestHandler = () => {
	const urls = ['', '#about', '#skills', '#projects', '#certifications', '#achievements', '#contact'];
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(path) => `  <url>
    <loc>${SITE.url}${path}</loc>
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
