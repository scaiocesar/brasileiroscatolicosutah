CREATE TABLE IF NOT EXISTS articles (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	excerpt TEXT,
	body TEXT NOT NULL,
	cover_image_key TEXT,
	published INTEGER NOT NULL DEFAULT 1,
	created_by INTEGER REFERENCES users(id),
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at DESC);

INSERT OR IGNORE INTO settings (key, value) VALUES ('page_artigos_enabled', '1');
