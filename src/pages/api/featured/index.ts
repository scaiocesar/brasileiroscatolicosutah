import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin';
import { getMedia } from '../../../lib/db';
import { fromDatetimeLocalValue } from '../../../lib/dates';

async function saveImage(media: R2Bucket, file: File): Promise<string> {
	const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
	const key = `featured/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext || 'jpg'}`;
	await media.put(key, await file.arrayBuffer(), {
		httpMetadata: { contentType: file.type || 'image/jpeg' },
	});
	return key;
}

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context);
	if (auth.redirect) return auth.redirect;
	const { user, db } = auth;
	if (!db) return context.redirect('/admin/featured?msg=error');

	const media = getMedia(context.locals);
	const form = await context.request.formData();
	const id = String(form.get('id') || '');
	const title = String(form.get('title') || '').trim();
	const location = String(form.get('location') || '').trim() || null;
	const eventAt = fromDatetimeLocalValue(String(form.get('event_at') || ''));
	const published = form.get('published') ? 1 : 0;
	const image = form.get('image');

	if (!title) return context.redirect('/admin/featured?msg=error');

	let imageKey: string | null = null;
	if (image instanceof File && image.size > 0) {
		if (!media) return context.redirect('/admin/featured?msg=error');
		imageKey = await saveImage(media, image);
	}

	if (id) {
		if (imageKey) {
			await db
				.prepare(
					`UPDATE featured_masses
					 SET title = ?, event_at = ?, location = ?, image_key = ?, published = ?, updated_at = datetime('now')
					 WHERE id = ?`,
				)
				.bind(title, eventAt, location, imageKey, published, Number(id))
				.run();
		} else {
			await db
				.prepare(
					`UPDATE featured_masses
					 SET title = ?, event_at = ?, location = ?, published = ?, updated_at = datetime('now')
					 WHERE id = ?`,
				)
				.bind(title, eventAt, location, published, Number(id))
				.run();
		}
	} else {
		if (!imageKey) return context.redirect('/admin/featured?msg=error');
		await db
			.prepare(
				`INSERT INTO featured_masses (title, event_at, location, image_key, published, created_by)
				 VALUES (?, ?, ?, ?, ?, ?)`,
			)
			.bind(title, eventAt, location, imageKey, published, user!.id)
			.run();
	}

	return context.redirect('/admin/featured?msg=saved');
};
