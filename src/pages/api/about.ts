import type { APIRoute } from 'astro';
import { requireAuth } from '../../lib/admin';
import { sanitizeRichText } from '../../lib/html';

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context);
	if (auth.redirect) return auth.redirect;
	const { db } = auth;
	if (!db) return context.redirect('/admin/about?msg=error');

	const form = await context.request.formData();
	const title = String(form.get('about_title') || '').trim();
	const content = sanitizeRichText(String(form.get('about_content') || ''));
	const enabled = form.get('page_sobre_enabled') ? '1' : '0';

	if (!title || !content) return context.redirect('/admin/about?msg=error');

	const stmt = db.prepare(
		`INSERT INTO settings (key, value) VALUES (?, ?)
		 ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
	);

	await db.batch([
		stmt.bind('about_title', title),
		stmt.bind('about_content', content),
		stmt.bind('page_sobre_enabled', enabled),
	]);

	return context.redirect('/admin/about?msg=saved');
};
