import { SESSION_COOKIE, SESSION_DAYS } from './constants';
import type { User, UserRole } from './types';

const encoder = new TextEncoder();

function bytesToHex(bytes: ArrayBuffer | Uint8Array): string {
	const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
	const matches = hex.match(/.{1,2}/g) ?? [];
	return new Uint8Array(matches.map((b) => parseInt(b, 16)));
}

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
		'deriveBits',
	]);
	const derived = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
		key,
		256,
	);
	return `pbkdf2$100000$${bytesToHex(salt)}$${bytesToHex(derived)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [algo, iterStr, saltHex, hashHex] = stored.split('$');
	if (algo !== 'pbkdf2' || !iterStr || !saltHex || !hashHex) return false;
	const iterations = Number(iterStr);
	const salt = hexToBytes(saltHex);
	const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
		'deriveBits',
	]);
	const derived = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
		key,
		256,
	);
	const a = bytesToHex(derived);
	if (a.length !== hashHex.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ hashHex.charCodeAt(i);
	return diff === 0;
}

export function createSessionId(): string {
	return bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
}

export function sessionExpiryDate(days = SESSION_DAYS): string {
	const d = new Date();
	d.setDate(d.getDate() + days);
	return d.toISOString();
}

export function parseCookies(header: string | null): Record<string, string> {
	if (!header) return {};
	return Object.fromEntries(
		header.split(';').map((part) => {
			const [k, ...rest] = part.trim().split('=');
			return [k, decodeURIComponent(rest.join('=') || '')];
		}),
	);
}

export function sessionCookieHeader(
	sessionId: string,
	maxAgeDays = SESSION_DAYS,
	secure = true,
): string {
	const maxAge = maxAgeDays * 24 * 60 * 60;
	const securePart = secure ? '; Secure' : '';
	return `${SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly${securePart}; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookieHeader(secure = true): string {
	const securePart = secure ? '; Secure' : '';
	return `${SESSION_COOKIE}=; Path=/; HttpOnly${securePart}; SameSite=Lax; Max-Age=0`;
}

export function isSecureRequest(request: Request): boolean {
	const url = new URL(request.url);
	if (url.protocol === 'https:') return true;
	const forwarded = request.headers.get('x-forwarded-proto');
	return forwarded === 'https';
}

export async function getUserFromRequest(
	db: D1Database | null,
	request: Request,
): Promise<Pick<User, 'id' | 'email' | 'name' | 'role'> | null> {
	if (!db) return null;
	const cookies = parseCookies(request.headers.get('cookie'));
	const sessionId = cookies[SESSION_COOKIE];
	if (!sessionId) return null;

	const row = await db
		.prepare(
			`SELECT u.id, u.email, u.name, u.role
			 FROM sessions s
			 JOIN users u ON u.id = s.user_id
			 WHERE s.id = ? AND s.expires_at > datetime('now') AND u.active = 1`,
		)
		.bind(sessionId)
		.first<{ id: number; email: string; name: string; role: UserRole }>();

	return row ?? null;
}

export function requireRole(
	user: Pick<User, 'role'> | null | undefined,
	roles: UserRole[],
): boolean {
	return !!user && roles.includes(user.role);
}
