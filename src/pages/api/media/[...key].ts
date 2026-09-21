import type { APIRoute } from 'astro';

/** Legacy path — redirect to /media so old links keep working. */
export const GET: APIRoute = ({ params }) => {
	const key = params.key;
	if (!key) return new Response('Not found', { status: 404 });
	return new Response(null, {
		status: 301,
		headers: { Location: `/media/${key}` },
	});
};
