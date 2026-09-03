import { DEFAULT_MASS, DEFAULT_MASSES, DEFAULT_SETTINGS } from './constants';
import type { Article, EventItem, FeaturedMass, Mass, SiteSettings, User } from './types';

export function getDb(locals: App.Locals): D1Database | null {
	return locals.runtime?.env?.DB ?? null;
}

export function getMedia(locals: App.Locals): R2Bucket | null {
	return locals.runtime?.env?.MEDIA ?? null;
}

export function mapsUrlForLocation(location: string): string {
	return `https://maps.google.com/?q=${encodeURIComponent(location.replace(/\s*\n\s*/g, ', '))}`;
}

export function embedMapsUrlForLocation(location: string): string {
	return `https://maps.google.com/maps?q=${encodeURIComponent(location.replace(/\s*\n\s*/g, ' '))}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

export async function getSettings(db: D1Database | null): Promise<SiteSettings> {
	if (!db) return { ...DEFAULT_SETTINGS };
	try {
		const rows = await db.prepare('SELECT key, value FROM settings').all<{ key: string; value: string }>();
		const map = Object.fromEntries((rows.results ?? []).map((r) => [r.key, r.value]));

		if (!map.contacts) {
			const legacy = [map.phone, map.contact_priscila, map.contact_caio]
				.filter((v): v is string => Boolean(v && String(v).trim()))
				.join('\n');
			if (legacy) map.contacts = legacy;
		}

		const { phone: _p, contact_priscila: _a, contact_caio: _b, ...rest } = map;
		return { ...DEFAULT_SETTINGS, ...rest } as SiteSettings;
	} catch {
		return { ...DEFAULT_SETTINGS };
	}
}

export function contactLines(contacts: string): string[] {
	return contacts
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
}

/** Settings store flags as '1' / '0'. */
export function isFeatureEnabled(value: string | undefined | null, defaultValue = true): boolean {
	if (value === undefined || value === null || value === '') return defaultValue;
	return value === '1' || value === 'true' || value === 'on';
}

export async function listMasses(db: D1Database | null, { publishedOnly = true } = {}): Promise<Mass[]> {
	if (!db) return publishedOnly ? DEFAULT_MASSES.filter((m) => m.published === 1) : [...DEFAULT_MASSES];
	try {
		const sql = publishedOnly
			? `SELECT * FROM masses WHERE published = 1 ORDER BY sort_order ASC, id ASC`
			: `SELECT * FROM masses ORDER BY sort_order ASC, id ASC`;
		const rows = await db.prepare(sql).all<Mass>();
		return rows.results ?? [];
	} catch {
		return publishedOnly ? DEFAULT_MASSES.filter((m) => m.published === 1) : [...DEFAULT_MASSES];
	}
}

export async function getPrimaryMass(db: D1Database | null): Promise<Mass> {
	const masses = await listMasses(db, { publishedOnly: true });
	return masses[0] ?? { ...DEFAULT_MASS };
}

export async function getActiveFeaturedMass(db: D1Database | null): Promise<FeaturedMass | null> {
	if (!db) return null;
	try {
		const now = new Date().toISOString();
		return await db
			.prepare(
				`SELECT * FROM featured_masses
				 WHERE published = 1 AND event_at >= ?
				 ORDER BY event_at ASC
				 LIMIT 1`,
			)
			.bind(now)
			.first<FeaturedMass>();
	} catch {
		return null;
	}
}

export async function listFeaturedMasses(db: D1Database): Promise<FeaturedMass[]> {
	const rows = await db
		.prepare('SELECT * FROM featured_masses ORDER BY event_at DESC')
		.all<FeaturedMass>();
	return rows.results ?? [];
}

export async function listUpcomingEvents(db: D1Database | null, limit = 20): Promise<EventItem[]> {
	if (!db) return [];
	try {
		const now = new Date().toISOString();
		const rows = await db
			.prepare(
				`SELECT * FROM events
				 WHERE published = 1 AND starts_at >= ?
				 ORDER BY starts_at ASC
				 LIMIT ?`,
			)
			.bind(now, limit)
			.all<EventItem>();
		return rows.results ?? [];
	} catch {
		return [];
	}
}

export async function listEventsInMonth(
	db: D1Database | null,
	year: number,
	monthIndex: number,
): Promise<EventItem[]> {
	if (!db) return [];
	try {
		const start = new Date(Date.UTC(year, monthIndex, 1)).toISOString();
		const end = new Date(Date.UTC(year, monthIndex + 1, 1)).toISOString();
		const rows = await db
			.prepare(
				`SELECT * FROM events
				 WHERE published = 1 AND starts_at >= ? AND starts_at < ?
				 ORDER BY starts_at ASC`,
			)
			.bind(start, end)
			.all<EventItem>();
		return rows.results ?? [];
	} catch {
		return [];
	}
}

export async function getEventById(
	db: D1Database | null,
	id: number,
	{ publishedOnly = true } = {},
): Promise<EventItem | null> {
	if (!db || !Number.isFinite(id)) return null;
	try {
		const sql = publishedOnly
			? 'SELECT * FROM events WHERE id = ? AND published = 1'
			: 'SELECT * FROM events WHERE id = ?';
		return (await db.prepare(sql).bind(id).first<EventItem>()) ?? null;
	} catch {
		return null;
	}
}

export async function listAllEvents(db: D1Database): Promise<EventItem[]> {
	const rows = await db.prepare('SELECT * FROM events ORDER BY starts_at DESC').all<EventItem>();
	return rows.results ?? [];
}

export async function listPublishedArticles(db: D1Database | null, limit = 50): Promise<Article[]> {
	if (!db) return [];
	try {
		const rows = await db
			.prepare(
				`SELECT * FROM articles
				 WHERE published = 1
				 ORDER BY published_at DESC
				 LIMIT ?`,
			)
			.bind(limit)
			.all<Article>();
		return rows.results ?? [];
	} catch {
		return [];
	}
}

export async function getArticleById(
	db: D1Database | null,
	id: number,
	{ publishedOnly = true } = {},
): Promise<Article | null> {
	if (!db || !Number.isFinite(id)) return null;
	try {
		const sql = publishedOnly
			? 'SELECT * FROM articles WHERE id = ? AND published = 1'
			: 'SELECT * FROM articles WHERE id = ?';
		return (await db.prepare(sql).bind(id).first<Article>()) ?? null;
	} catch {
		return null;
	}
}

export async function listAllArticles(db: D1Database): Promise<Article[]> {
	const rows = await db.prepare('SELECT * FROM articles ORDER BY published_at DESC').all<Article>();
	return rows.results ?? [];
}

export async function listUsers(db: D1Database): Promise<User[]> {
	const rows = await db
		.prepare('SELECT id, email, name, role, active, created_at, updated_at FROM users ORDER BY name')
		.all<User>();
	return rows.results ?? [];
}

export function mediaUrl(key: string | null | undefined): string | null {
	if (!key) return null;
	if (key.startsWith('http') || key.startsWith('/')) return key;
	return `/api/media/${key}`;
}

export async function saveMediaImage(media: R2Bucket, file: File, folder: string): Promise<string> {
	const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
	const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext || 'jpg'}`;
	await media.put(key, await file.arrayBuffer(), {
		httpMetadata: { contentType: file.type || 'image/jpeg' },
	});
	return key;
}

export function parseGalleryKeys(raw: string | null | undefined): string[] {
	if (!raw) return [];
	try {
		const arr = JSON.parse(raw);
		return Array.isArray(arr) ? arr.filter((k: unknown): k is string => typeof k === 'string' && k.length > 0) : [];
	} catch {
		return [];
	}
}
