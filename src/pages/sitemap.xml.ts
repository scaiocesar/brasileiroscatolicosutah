import type { APIRoute } from 'astro';
import { SITE_URL } from '../lib/constants';
import { getDb, getSettings, isFeatureEnabled } from '../lib/db';

export const GET: APIRoute = async ({ locals }) => {
	const db = getDb(locals);
	const settings = await getSettings(db);

	const pages = ['', '/missa', '/contato'];
	if (isFeatureEnabled(settings.page_sobre_enabled)) pages.push('/sobre');
	if (isFeatureEnabled(settings.page_eventos_enabled)) pages.push('/eventos');
	if (isFeatureEnabled(settings.page_artigos_enabled)) pages.push('/artigos');

	const lastmod = new Date().toISOString().slice(0, 10);
	const urls = pages
		.map(
			(path) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`,
		)
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
	return new Response(body, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
};
