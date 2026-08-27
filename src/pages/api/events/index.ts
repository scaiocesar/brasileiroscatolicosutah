import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin';
import { getMedia } from '../../../lib/db';
import { fromDatetimeLocalValue } from '../../../lib/dates';

async function saveImage(media: R2Bucket, file: File): Promise<string> {
	const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
	const key = `events/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext || 'jpg'}`;
	await media.put(key, await file.arrayBuffer(), {
		httpMetadata: { contentType: file.type || 'image/jpeg' },
	});
	return key;
}

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context);
	if (auth.redirect) return auth.redirect;
	const { user, db } = auth;
	if (!db) return context.redirect('/admin/events?msg=error');

	const media = getMedia(context.locals);
	const form = await context.request.formData();
	const id = String(form.get('id') || '');
	const title = String(form.get('title') || '').trim();
	const description = String(form.get('description') || '').trim() || null;
	const location = String(form.get('location') || '').trim() || null;
	const startsAt = fromDatetimeLocalValue(String(form.get('starts_at') || ''));
	const endsRaw = String(form.get('ends_at') || '');
	const endsAt = endsRaw ? fromDatetimeLocalValue(endsRaw) : null;
	const published = form.get('published') ? 1 : 0;
	const image = form.get('image');
	const removeImage = form.get('remove_image') === '1';

	if (!title) return context.redirect('/admin/events?msg=error');

	let imageKey: string | null | undefined;
	if (image instanceof File && image.size > 0) {
		if (!media) return context.redirect('/admin/events?msg=error');
		imageKey = await saveImage(media, image);
	} else if (removeImage) {
		imageKey = null;
	}

	if (id) {
		const existing = await db
			.prepare('SELECT image_key FROM events WHERE id = ?')
			.bind(Number(id))
			.first<{ image_key: string | null }>();

		if (imageKey !== undefined) {
			await db
				.prepare(
					`UPDATE events
					 SET title = ?, description = ?, location = ?, starts_at = ?, ends_at = ?, image_key = ?, published = ?, updated_at = datetime('now')
					 WHERE id = ?`,
				)
				.bind(title, description, location, startsAt, endsAt, imageKey, published, Number(id))
				.run();

			const oldKey = existing?.image_key;
			if (media && oldKey && oldKey !== imageKey) {
				try {
					await media.delete(oldKey);
				} catch {
					/* ignore */
				}
			}
		} else {
			await db
				.prepare(
					`UPDATE events
					 SET title = ?, description = ?, location = ?, starts_at = ?, ends_at = ?, published = ?, updated_at = datetime('now')
					 WHERE id = ?`,
				)
				.bind(title, description, location, startsAt, endsAt, published, Number(id))
				.run();
		}
	} else {
		await db
			.prepare(
				`INSERT INTO events (title, description, location, starts_at, ends_at, image_key, published, created_by)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			)
			.bind(title, description, location, startsAt, endsAt, imageKey ?? null, published, user!.id)
			.run();
	}

	return context.redirect('/admin/events?msg=saved');
};
