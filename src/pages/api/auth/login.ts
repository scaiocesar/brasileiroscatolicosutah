import type { APIRoute } from 'astro';
import {
	createSessionId,
	isSecureRequest,
	sessionCookieHeader,
	sessionExpiryDate,
	verifyPassword,
} from '../../../lib/auth';
import { getDb } from '../../../lib/db';

export const POST: APIRoute = async ({ request, redirect, locals }) => {
	const db = getDb(locals);
	if (!db) return redirect('/admin/login?error=db');

	const form = await request.formData();
	const email = String(form.get('email') || '').trim().toLowerCase();
	const password = String(form.get('password') || '');

	const user = await db
		.prepare('SELECT id, password_hash, active FROM users WHERE email = ?')
		.bind(email)
		.first<{ id: number; password_hash: string; active: number }>();

	if (!user || !user.active || !(await verifyPassword(password, user.password_hash))) {
		return redirect('/admin/login?error=invalid');
	}

	const sessionId = createSessionId();
	await db
		.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
		.bind(sessionId, user.id, sessionExpiryDate())
		.run();

	return new Response(null, {
		status: 303,
		headers: {
			Location: '/admin',
			'Set-Cookie': sessionCookieHeader(sessionId, undefined, isSecureRequest(request)),
		},
	});
};
