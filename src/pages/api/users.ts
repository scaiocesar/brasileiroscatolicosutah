import type { APIRoute } from 'astro';
import { hashPassword } from '../../lib/auth';
import { requireAuth } from '../../lib/admin';

export const POST: APIRoute = async (context) => {
	const auth = await requireAuth(context, ['admin']);
	if (auth.redirect) return auth.redirect;
	const { db } = auth;
	if (!db) return context.redirect('/admin/users?msg=error');

	const form = await context.request.formData();
	const id = String(form.get('id') || '');
	const name = String(form.get('name') || '').trim();
	const email = String(form.get('email') || '').trim().toLowerCase();
	const role = String(form.get('role') || 'editor') === 'admin' ? 'admin' : 'editor';
	const active = form.get('active') ? 1 : 0;
	const password = String(form.get('password') || '');

	if (!name || !email) return context.redirect('/admin/users?msg=error');

	if (id) {
		if (password) {
			const passwordHash = await hashPassword(password);
			await db
				.prepare(
					`UPDATE users SET name = ?, email = ?, role = ?, active = ?, password_hash = ?, updated_at = datetime('now')
					 WHERE id = ?`,
				)
				.bind(name, email, role, active, passwordHash, Number(id))
				.run();
		} else {
			await db
				.prepare(
					`UPDATE users SET name = ?, email = ?, role = ?, active = ?, updated_at = datetime('now')
					 WHERE id = ?`,
				)
				.bind(name, email, role, active, Number(id))
				.run();
		}
	} else {
		if (password.length < 8) return context.redirect('/admin/users?msg=error');
		const passwordHash = await hashPassword(password);
		await db
			.prepare(
				`INSERT INTO users (email, name, password_hash, role, active)
				 VALUES (?, ?, ?, ?, ?)`,
			)
			.bind(email, name, passwordHash, role, active)
			.run();
	}

	return context.redirect('/admin/users?msg=saved');
};
