import type { APIRoute } from 'astro';
import { getMedia } from '../../lib/db';
import { encodeSocialJpeg } from '../../lib/social-image';

/** Social-optimized JPEG for Facebook/WhatsApp og:image (fresh URL, outside /api). */
export const GET: APIRoute = async ({ params, locals }) => {
	const media = getMedia(locals);
	if (!media) return new Response('Not found', { status: 404 });

	const key = params.key;
	if (!key) return new Response('Not found', { status: 404 });

	const object = await media.get(key);
	if (!object) return new Response('Not found', { status: 404 });

	const raw = await object.arrayBuffer();
	const encoded = encodeSocialJpeg(raw);
	if (!encoded) return new Response('Unsupported image', { status: 415 });

	return new Response(encoded.body, {
		status: 200,
		headers: {
			'Content-Type': 'image/jpeg',
			'Content-Length': String(encoded.body.byteLength),
			'Cache-Control': 'public, max-age=86400',
			'X-OG-Width': String(encoded.width),
			'X-OG-Height': String(encoded.height),
		},
	});
};
