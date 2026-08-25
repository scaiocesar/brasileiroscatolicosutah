/**
 * Gera SQL de seed com hash PBKDF2 compatível com src/lib/auth.ts
 * Uso: node scripts/generate-seed.mjs [email] [password] [name]
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const encoder = new TextEncoder();

function bytesToHex(bytes) {
	return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password) {
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

const email = (process.argv[2] || 'admin@brasileiroscatolicosutah.org').toLowerCase();
const password = process.argv[3] || 'TrocarSenha123!';
const name = process.argv[4] || 'Administrador';

const hash = await hashPassword(password);

const sql = `-- Seed do primeiro admin
-- E-mail: ${email}
-- Senha inicial: ${password}
-- IMPORTANTE: altere a senha após o primeiro login.

INSERT OR IGNORE INTO users (email, name, password_hash, role, active)
VALUES ('${email}', '${name.replace(/'/g, "''")}', '${hash}', 'admin', 1);
`;

const out = resolve(import.meta.dirname, 'seed-admin.sql');
writeFileSync(out, sql);
console.log(`Gerado: ${out}`);
console.log(`Login: ${email}`);
console.log(`Senha: ${password}`);
