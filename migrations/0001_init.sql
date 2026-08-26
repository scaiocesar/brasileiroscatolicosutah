CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL UNIQUE COLLATE NOCASE,
	name TEXT NOT NULL,
	password_hash TEXT NOT NULL,
	role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
	active INTEGER NOT NULL DEFAULT 1,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
	id TEXT PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	expires_at TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mass_schedule (
	id INTEGER PRIMARY KEY CHECK (id = 1),
	recurrence TEXT NOT NULL DEFAULT 'Último domingo do mês',
	time_label TEXT NOT NULL DEFAULT '18:00',
	church_name TEXT NOT NULL DEFAULT 'Igreja Católica de São José Operário',
	address TEXT NOT NULL DEFAULT '7405 S Redwood Rd, West Jordan, UT 84084',
	priest TEXT NOT NULL DEFAULT 'Padre Francisco Pires',
	notes TEXT,
	maps_url TEXT NOT NULL DEFAULT 'https://maps.google.com/?q=7405+S+Redwood+Rd,+West+Jordan,+UT+84084',
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS featured_masses (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	event_at TEXT NOT NULL,
	location TEXT,
	image_key TEXT NOT NULL,
	published INTEGER NOT NULL DEFAULT 1,
	created_by INTEGER REFERENCES users(id),
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	description TEXT,
	location TEXT,
	starts_at TEXT NOT NULL,
	ends_at TEXT,
	image_key TEXT,
	published INTEGER NOT NULL DEFAULT 1,
	created_by INTEGER REFERENCES users(id),
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_featured_masses_event ON featured_masses(event_at);
CREATE INDEX IF NOT EXISTS idx_events_starts ON events(starts_at);

INSERT OR IGNORE INTO mass_schedule (id, recurrence, time_label, church_name, address, priest, notes, maps_url)
VALUES (
	1,
	'Último domingo do mês',
	'6:00 PM',
	'Igreja Católica de São José Operário',
	'7405 S Redwood Rd, West Jordan, UT 84084',
	'Padre Francisco Pires',
	'Missa em português para a comunidade brasileira católica em utah.',
	'https://maps.google.com/?q=7405+S+Redwood+Rd,+West+Jordan,+UT+84084'
);

INSERT OR IGNORE INTO settings (key, value) VALUES
	('site_name', 'Brasileiros Católicos Utah'),
	('tagline', 'Fé, comunidade e tradição em utah'),
	('contacts', '(801) 613-8046' || CHAR(10) || 'Priscila +1 (702) 292-7405' || CHAR(10) || 'Caio +1 (702) 292-6859'),
	('address', '7405 S Redwood Rd, West Jordan, UT 84084'),
	('facebook_url', 'https://www.facebook.com/brasileiroscatolicosemsaltlake'),
	('instagram_url', 'https://www.instagram.com/brasileiroscatolicosemsaltlake/'),
	('whatsapp_url', 'https://chat.whatsapp.com/5cVB6EyJ2SX3Y1GDYYYKKF'),
	('welcome_text', 'Bem-vindo à comunidade Brasileiros Católicos Utah! Este é um espaço onde nossa comunidade se reúne para compartilhar fé, cultura e amizade. Explore o site para descobrir missas em português, eventos e como participar.');
