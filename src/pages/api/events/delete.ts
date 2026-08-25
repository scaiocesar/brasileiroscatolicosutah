import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin';

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context);
	if (auth.redirect) return auth.redirect;
	const { db } = auth;
	if (!db) return context.redirect('/admin/events?msg=error');

	const form = await context.request.formData();
	const id = Number(form.get('id'));
	await db.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
	return context.redirect('/admin/events?msg=deleted');
};
