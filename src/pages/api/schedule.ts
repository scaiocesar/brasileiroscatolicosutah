import type { APIRoute } from 'astro';
import { requireAuth } from '../../lib/admin';

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context);
	if (auth.redirect) return auth.redirect;
	const { db } = auth;
	if (!db) return context.redirect('/admin/schedule?msg=error');

	const form = await context.request.formData();
	await db
		.prepare(
			`UPDATE mass_schedule SET
				recurrence = ?, time_label = ?, church_name = ?, address = ?, priest = ?, notes = ?, maps_url = ?,
				updated_at = datetime('now')
			 WHERE id = 1`,
		)
		.bind(
			String(form.get('recurrence') || ''),
			String(form.get('time_label') || ''),
			String(form.get('church_name') || ''),
			String(form.get('address') || ''),
			String(form.get('priest') || ''),
			String(form.get('notes') || '') || null,
			String(form.get('maps_url') || ''),
		)
		.run();

	return context.redirect('/admin/schedule?msg=saved');
};
