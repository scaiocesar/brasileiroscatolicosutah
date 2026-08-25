import type { APIRoute } from 'astro';
import { clearSessionCookieHeader, isSecureRequest, parseCookies } from '../../../lib/auth';
import { SESSION_COOKIE } from '../../../lib/constants';
import { getDb } from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
	const db = getDb(locals);
	const cookies = parseCookies(request.headers.get('cookie'));
	const sessionId = cookies[SESSION_COOKIE];
	if (db && sessionId) {
		await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
	}

	return new Response(null, {
		status: 303,
		headers: {
			Location: '/admin/login',
			'Set-Cookie': clearSessionCookieHeader(isSecureRequest(request)),
		},
	});
};
