import { defineMiddleware } from 'astro:middleware';
import { getUserFromRequest } from './lib/auth';
import { getDb } from './lib/db';

export const onRequest = defineMiddleware(async (context, next) => {
	const { request, locals, url, redirect } = context;
	const pathname = url.pathname;

	if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
		const db = getDb(locals);
		const user = await getUserFromRequest(db, request);
		if (!user) {
			return redirect('/admin/login');
		}
		locals.user = user;
	}

	if (pathname === '/admin/login') {
		const db = getDb(locals);
		const user = await getUserFromRequest(db, request);
		if (user) {
			return redirect('/admin');
		}
	}

	const response = await next();

	// Keep admin/API private, but allow caching for public media so Facebook/WhatsApp
	// can fetch og:image (they reject images served with Cache-Control: no-store).
	const isPublicMedia = pathname.startsWith('/api/media/');
	if (!isPublicMedia && (pathname.startsWith('/admin') || pathname.startsWith('/api/'))) {
		response.headers.set('Cache-Control', 'no-store');
	}

	return response;
});
