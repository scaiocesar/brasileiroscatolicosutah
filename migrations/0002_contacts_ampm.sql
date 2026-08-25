-- Unify contacts into one multiline setting and use AM/PM for mass time
UPDATE mass_schedule SET time_label = '6:00 PM' WHERE id = 1 AND (time_label = '18:00' OR time_label = '06:00 PM');

INSERT OR IGNORE INTO settings (key, value)
SELECT
	'contacts',
	TRIM(
		COALESCE((SELECT value FROM settings WHERE key = 'phone'), '') || CHAR(10) ||
		COALESCE((SELECT value FROM settings WHERE key = 'contact_priscila'), '') || CHAR(10) ||
		COALESCE((SELECT value FROM settings WHERE key = 'contact_caio'), '')
	)
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'contacts');

DELETE FROM settings WHERE key IN ('phone', 'contact_priscila', 'contact_caio');
