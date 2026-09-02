import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin';
import { getMedia, saveMediaImage } from '../../../lib/db';
import { sanitizeArticleHtml } from '../../../lib/html';

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context);
	if (auth.redirect) return auth.redirect;
	const { user, db } = auth;
	if (!db) return context.redirect('/admin/articles?msg=error');

	const media = getMedia(context.locals);
	const form = await context.request.formData();
	const id = String(form.get('id') || '');
	const title = String(form.get('title') || '').trim();
	const excerpt = String(form.get('excerpt') || '').trim() || null;
	const bodyRaw = String(form.get('body') || '');
	const body = sanitizeArticleHtml(bodyRaw);
	const published = form.get('published') ? 1 : 0;
	const image = form.get('cover_image');
	const removeImage = form.get('remove_cover_image') === '1';

	if (!title || !body) return context.redirect('/admin/articles?msg=error');

	let coverImageKey: string | null | undefined;
	if (image instanceof File && image.size > 0) {
		if (!media) return context.redirect('/admin/articles?msg=error');
		coverImageKey = await saveMediaImage(media, image, 'articles');
	} else if (removeImage) {
		coverImageKey = null;
	}

	if (id) {
		const existing = await db
			.prepare('SELECT cover_image_key FROM articles WHERE id = ?')
			.bind(Number(id))
			.first<{ cover_image_key: string | null }>();

		if (coverImageKey !== undefined) {
			await db
				.prepare(
					`UPDATE articles
					 SET title = ?, excerpt = ?, body = ?, cover_image_key = ?, published = ?, updated_at = datetime('now')
					 WHERE id = ?`,
				)
				.bind(title, excerpt, body, coverImageKey, published, Number(id))
				.run();

			const oldKey = existing?.cover_image_key;
			if (media && oldKey && oldKey !== coverImageKey) {
				try {
					await media.delete(oldKey);
				} catch {
					/* ignore */
				}
			}
		} else {
			await db
				.prepare(
					`UPDATE articles
					 SET title = ?, excerpt = ?, body = ?, published = ?, updated_at = datetime('now')
					 WHERE id = ?`,
				)
				.bind(title, excerpt, body, published, Number(id))
				.run();
		}
	} else {
		await db
			.prepare(
				`INSERT INTO articles (title, excerpt, body, cover_image_key, published, created_by)
				 VALUES (?, ?, ?, ?, ?, ?)`,
			)
			.bind(title, excerpt, body, coverImageKey ?? null, published, user!.id)
			.run();
	}

	return context.redirect('/admin/articles?msg=saved');
};
