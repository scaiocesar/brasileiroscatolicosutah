import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin';
import { getMedia, parseGalleryKeys } from '../../../lib/db';

const ARTICLE_MEDIA_PREFIX = '/api/media/';

function imageKeysFromBody(body: string): string[] {
	const keys: string[] = [];
	const re = /src="(\/api\/media\/articles\/[^"]+)"/g;
	let match: RegExpExecArray | null;
	while ((match = re.exec(body)) !== null) {
		const url = match[1];
		const key = url.startsWith(ARTICLE_MEDIA_PREFIX) ? url.slice(ARTICLE_MEDIA_PREFIX.length) : null;
		if (key) keys.push(key);
	}
	return keys;
}

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context);
	if (auth.redirect) return auth.redirect;
	const { db } = auth;
	if (!db) return context.redirect('/admin/articles?msg=error');

	const form = await context.request.formData();
	const id = Number(form.get('id'));
	const row = await db
		.prepare('SELECT cover_image_key, gallery_keys, body FROM articles WHERE id = ?')
		.bind(id)
		.first<{ cover_image_key: string | null; gallery_keys: string | null; body: string }>();

	await db.prepare('DELETE FROM articles WHERE id = ?').bind(id).run();

	const media = getMedia(context.locals);
	if (media && row) {
		const keys = new Set<string>();
		if (row.cover_image_key) keys.add(row.cover_image_key);
		for (const key of imageKeysFromBody(row.body)) keys.add(key);
		for (const key of parseGalleryKeys(row.gallery_keys)) keys.add(key);
		for (const key of keys) {
			try {
				await media.delete(key);
			} catch {
				/* ignore */
			}
		}
	}

	return context.redirect('/admin/articles?msg=deleted');
};
