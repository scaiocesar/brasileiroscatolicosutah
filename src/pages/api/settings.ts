import type { APIRoute } from 'astro';
import { requireAuth } from '../../lib/admin';
import type { SiteSettings } from '../../lib/types';

const KEYS: (keyof SiteSettings)[] = [
	'site_name',
	'tagline',
	'contacts',
	'address',
	'facebook_url',
	'instagram_url',
	'whatsapp_url',
	'welcome_text',
];

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context, ['admin']);
	if (auth.redirect) return auth.redirect;
	const { db } = auth;
	if (!db) return context.redirect('/admin/settings?msg=error');

	const form = await context.request.formData();
	const stmt = db.prepare(
		`INSERT INTO settings (key, value) VALUES (?, ?)
		 ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
	);

	const batch = [
		...KEYS.map((key) => stmt.bind(key, String(form.get(key) || ''))),
		db.prepare(`DELETE FROM settings WHERE key IN ('phone', 'contact_priscila', 'contact_caio')`),
	];
	await db.batch(batch);

	return context.redirect('/admin/settings?msg=saved');
};
