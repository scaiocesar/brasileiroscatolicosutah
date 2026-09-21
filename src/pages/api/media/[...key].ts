import type { APIRoute } from 'astro';
import { getMedia } from '../../../lib/db';
import { sanitizePngForSocial } from '../../../lib/png';

export const GET: APIRoute = async ({ params, locals }) => {
	const media = getMedia(locals);
	if (!media) return new Response('Not found', { status: 404 });

	const key = params.key;
	if (!key) return new Response('Not found', { status: 404 });

	const object = await media.get(key);
	if (!object) return new Response('Not found', { status: 404 });

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set('etag', object.httpEtag);
	headers.set('Cache-Control', 'public, max-age=86400');
	if (!headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/octet-stream');
	}

	const contentType = headers.get('Content-Type') || '';
	const isPng = contentType.includes('png') || key.toLowerCase().endsWith('.png');

	if (isPng) {
		const raw = await object.arrayBuffer();
		const body = sanitizePngForSocial(raw);
		headers.set('Content-Length', String(body.byteLength));
		headers.set('Content-Type', 'image/png');
		return new Response(body, { headers, status: 200 });
	}

	// Facebook/WhatsApp fail with "Corrupted Image" when Content-Length is missing.
	headers.set('Content-Length', String(object.size));
	return new Response(object.body, { headers, status: 200 });
};
