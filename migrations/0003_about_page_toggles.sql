-- Página Sobre + toggles de páginas
INSERT OR IGNORE INTO settings (key, value) VALUES
	('about_title', 'Sobre a comunidade'),
	('about_content', 'Somos a comunidade Brasileiros Católicos Utah.' || CHAR(10) || CHAR(10) || 'Reunimos famílias e fiéis brasileiros em Salt Lake City e região para celebrar a missa em português, viver a fé católica e fortalecer amizades na fé.' || CHAR(10) || CHAR(10) || 'Nossa missa acontece todo último domingo do mês na Igreja São José Operário, em West Jordan.'),
	('page_sobre_enabled', '1'),
	('page_eventos_enabled', '1'),
	('calendar_enabled', '1');
