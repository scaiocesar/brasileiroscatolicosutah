import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin';

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context);
	if (auth.redirect) return auth.redirect;
	const { db } = auth;
	if (!db) return context.redirect('/admin/events?msg=error');

	try {
		const form = await context.request.formData();
		const pageOn = form.get('page_eventos_enabled') ? '1' : '0';
		const calendarOn = form.get('calendar_enabled') ? '1' : '0';

		await db
			.prepare(
				`INSERT INTO settings (key, value) VALUES (?, ?)
				 ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
			)
			.bind('page_eventos_enabled', pageOn)
			.run();
		await db
			.prepare(
				`INSERT INTO settings (key, value) VALUES (?, ?)
				 ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
			)
			.bind('calendar_enabled', calendarOn)
			.run();

		return context.redirect('/admin/events?msg=pages');
	} catch (err) {
		console.error('visibility update failed', err);
		return context.redirect('/admin/events?msg=error');
	}
};
