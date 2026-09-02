import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin';
import { getMedia, mediaUrl, saveMediaImage } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context);
	if (auth.redirect) return auth.redirect;

	const media = getMedia(context.locals);
	if (!media) {
		return new Response(JSON.stringify({ error: 'Storage unavailable' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const form = await context.request.formData();
	const image = form.get('image');

	if (!(image instanceof File) || image.size === 0) {
		return new Response(JSON.stringify({ error: 'No image provided' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	if (!image.type.startsWith('image/')) {
		return new Response(JSON.stringify({ error: 'Invalid file type' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const key = await saveMediaImage(media, image, 'articles');
		const url = mediaUrl(key);
		return new Response(JSON.stringify({ url }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		console.error('article image upload failed', err);
		return new Response(JSON.stringify({ error: 'Upload failed' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
