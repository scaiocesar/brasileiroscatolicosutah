-- Multiple masses at different locations (replaces singleton mass_schedule).
CREATE TABLE IF NOT EXISTS masses (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	recurrence TEXT NOT NULL,
	time_label TEXT NOT NULL,
	priest TEXT,
	notes TEXT,
	location TEXT NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 0,
	published INTEGER NOT NULL DEFAULT 1,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO masses (recurrence, time_label, priest, notes, location, sort_order, published)
SELECT
	recurrence,
	time_label,
	NULLIF(TRIM(priest), ''),
	notes,
	TRIM(church_name || CHAR(10) || address),
	0,
	1
FROM mass_schedule
WHERE NOT EXISTS (SELECT 1 FROM masses LIMIT 1);

DROP TABLE IF EXISTS mass_schedule;
