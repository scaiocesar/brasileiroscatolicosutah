import type { APIRoute } from 'astro';
import { SITE_URL } from '../lib/constants';

export const GET: APIRoute = () => {
	// Allow /api/media so Facebook/WhatsApp can fetch og:image.
	// A bare "Disallow: /api" makes Meta report "Corrupted Image".
	const body = `User-agent: *
Allow: /
Allow: /api/media/
Disallow: /admin
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
