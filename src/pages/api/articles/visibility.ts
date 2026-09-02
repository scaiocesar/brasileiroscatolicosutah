import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin';

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context);
	if (auth.redirect) return auth.redirect;
	const { db } = auth;
	if (!db) return context.redirect('/admin/articles?msg=error');

	try {
		const form = await context.request.formData();
		const pageOn = form.get('page_artigos_enabled') ? '1' : '0';

		await db
			.prepare(
				`INSERT INTO settings (key, value) VALUES (?, ?)
				 ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
			)
			.bind('page_artigos_enabled', pageOn)
			.run();

		return context.redirect('/admin/articles?msg=pages');
	} catch (err) {
		console.error('articles visibility update failed', err);
		return context.redirect('/admin/articles?msg=error');
	}
};
