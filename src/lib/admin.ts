import type { APIContext } from 'astro';
import { getUserFromRequest, requireRole } from './auth';
import { getDb } from './db';
import type { UserRole } from './types';

export async function requireAuth(
	context: APIContext,
	roles: UserRole[] = ['admin', 'editor'],
) {
	const db = getDb(context.locals);
	const user = await getUserFromRequest(db, context.request);
	if (!user || !requireRole(user, roles)) {
		return { user: null, db, redirect: context.redirect('/admin/login') };
	}
	context.locals.user = user;
	return { user, db, redirect: null };
}

export function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store',
		},
	});
}

export async function readForm(request: Request) {
	const contentType = request.headers.get('content-type') || '';
	if (contentType.includes('application/json')) {
		return (await request.json()) as Record<string, unknown>;
	}
	const form = await request.formData();
	const data: Record<string, FormDataEntryValue> = {};
	for (const [key, value] of form.entries()) data[key] = value;
	return data;
}
