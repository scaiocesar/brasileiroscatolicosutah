import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin';
import { getMedia } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context);
	if (auth.redirect) return auth.redirect;
	const { db } = auth;
	if (!db) return context.redirect('/admin/featured?msg=error');

	const form = await context.request.formData();
	const id = Number(form.get('id'));
	const row = await db
		.prepare('SELECT image_key FROM featured_masses WHERE id = ?')
		.bind(id)
		.first<{ image_key: string }>();

	await db.prepare('DELETE FROM featured_masses WHERE id = ?').bind(id).run();

	const media = getMedia(context.locals);
	if (media && row?.image_key) {
		try {
			await media.delete(row.image_key);
		} catch {
			/* ignore */
		}
	}

	return context.redirect('/admin/featured?msg=deleted');
};
