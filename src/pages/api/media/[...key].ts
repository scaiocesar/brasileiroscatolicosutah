import type { APIRoute } from 'astro';
import { getMedia } from '../../../lib/db';

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

	return new Response(object.body, { headers });
};
