import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin';

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context);
	if (auth.redirect) return auth.redirect;
	const { db } = auth;
	if (!db) return context.redirect('/admin/missa?msg=error');

	const form = await context.request.formData();
	const id = String(form.get('id') || '');
	const recurrence = String(form.get('recurrence') || '').trim();
	const timeLabel = String(form.get('time_label') || '').trim();
	const priest = String(form.get('priest') || '').trim() || null;
	const notes = String(form.get('notes') || '').trim() || null;
	const location = String(form.get('location') || '').trim();
	const published = form.get('published') ? 1 : 0;

	if (!recurrence || !timeLabel || !location) {
		return context.redirect('/admin/missa?msg=error');
	}

	if (id) {
		await db
			.prepare(
				`UPDATE masses
				 SET recurrence = ?, time_label = ?, priest = ?, notes = ?, location = ?, published = ?, updated_at = datetime('now')
				 WHERE id = ?`,
			)
			.bind(recurrence, timeLabel, priest, notes, location, published, Number(id))
			.run();
	} else {
		const maxOrder = await db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM masses').first<{ m: number }>();
		const sortOrder = (maxOrder?.m ?? -1) + 1;
		await db
			.prepare(
				`INSERT INTO masses (recurrence, time_label, priest, notes, location, sort_order, published)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			)
			.bind(recurrence, timeLabel, priest, notes, location, sortOrder, published)
			.run();
	}

	return context.redirect('/admin/missa?msg=saved');
};
