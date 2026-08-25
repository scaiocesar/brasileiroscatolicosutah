import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin';
import { fromDatetimeLocalValue } from '../../../lib/dates';

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context);
	if (auth.redirect) return auth.redirect;
	const { user, db } = auth;
	if (!db) return context.redirect('/admin/events?msg=error');

	const form = await context.request.formData();
	const id = String(form.get('id') || '');
	const title = String(form.get('title') || '').trim();
	const description = String(form.get('description') || '').trim() || null;
	const location = String(form.get('location') || '').trim() || null;
	const startsAt = fromDatetimeLocalValue(String(form.get('starts_at') || ''));
	const endsRaw = String(form.get('ends_at') || '');
	const endsAt = endsRaw ? fromDatetimeLocalValue(endsRaw) : null;
	const published = form.get('published') ? 1 : 0;

	if (!title) return context.redirect('/admin/events?msg=error');

	if (id) {
		await db
			.prepare(
				`UPDATE events
				 SET title = ?, description = ?, location = ?, starts_at = ?, ends_at = ?, published = ?, updated_at = datetime('now')
				 WHERE id = ?`,
			)
			.bind(title, description, location, startsAt, endsAt, published, Number(id))
			.run();
	} else {
		await db
			.prepare(
				`INSERT INTO events (title, description, location, starts_at, ends_at, published, created_by)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			)
			.bind(title, description, location, startsAt, endsAt, published, user!.id)
			.run();
	}

	return context.redirect('/admin/events?msg=saved');
};
