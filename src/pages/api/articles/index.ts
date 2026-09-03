import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin';
import { getMedia, parseGalleryKeys, saveMediaImage } from '../../../lib/db';
import { sanitizeArticleHtml } from '../../../lib/html';
import { fromDatetimeLocalValue } from '../../../lib/dates';

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
	const publishedAt = fromDatetimeLocalValue(String(form.get('published_at') || ''));
	const image = form.get('cover_image');
	const removeImage = form.get('remove_cover_image') === '1';
	const galleryKeysRaw = String(form.get('gallery_keys') || '');

	if (!title || !body) return context.redirect('/admin/articles?msg=error');

	let coverImageKey: string | null | undefined;
	if (image instanceof File && image.size > 0) {
		if (!media) return context.redirect('/admin/articles?msg=error');
		coverImageKey = await saveMediaImage(media, image, 'articles');
	} else if (removeImage) {
		coverImageKey = null;
	}

	// Validate gallery_keys — should be a JSON array of strings
	let galleryKeys: string[] = [];
	try {
		const parsed = galleryKeysRaw ? JSON.parse(galleryKeysRaw) : [];
		galleryKeys = Array.isArray(parsed) ? parsed.filter((k: unknown): k is string => typeof k === 'string') : [];
	} catch {
		galleryKeys = [];
	}
	const galleryKeysJson = galleryKeys.length > 0 ? JSON.stringify(galleryKeys) : null;

	if (id) {
		const existing = await db
			.prepare('SELECT cover_image_key, gallery_keys FROM articles WHERE id = ?')
			.bind(Number(id))
			.first<{ cover_image_key: string | null; gallery_keys: string | null }>();

		if (coverImageKey !== undefined) {
			await db
				.prepare(
					`UPDATE articles
					 SET title = ?, excerpt = ?, body = ?, cover_image_key = ?, gallery_keys = ?, published = ?, published_at = ?, updated_at = datetime('now')
					 WHERE id = ?`,
				)
				.bind(title, excerpt, body, coverImageKey, galleryKeysJson, published, publishedAt, Number(id))
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
					 SET title = ?, excerpt = ?, body = ?, gallery_keys = ?, published = ?, published_at = ?, updated_at = datetime('now')
					 WHERE id = ?`,
				)
				.bind(title, excerpt, body, galleryKeysJson, published, publishedAt, Number(id))
				.run();
		}

		// Clean up removed gallery images
		if (media && existing?.gallery_keys) {
			const oldGallery = parseGalleryKeys(existing.gallery_keys);
			const newSet = new Set(galleryKeys);
			for (const key of oldGallery) {
				if (!newSet.has(key)) {
					try {
						await media.delete(key);
					} catch {
						/* ignore */
					}
				}
			}
		}
	} else {
		await db
			.prepare(
				`INSERT INTO articles (title, excerpt, body, cover_image_key, gallery_keys, published, published_at, created_by)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			)
			.bind(title, excerpt, body, coverImageKey ?? null, galleryKeysJson, published, publishedAt, user!.id)
			.run();
	}

	return context.redirect('/admin/articles?msg=saved');
};
