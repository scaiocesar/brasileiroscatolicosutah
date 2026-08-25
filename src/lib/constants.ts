export const SITE_URL = 'https://brasileiroscatolicosutah.org';

export const DEFAULT_SETTINGS = {
	site_name: 'Brasileiros Católicos Utah',
	tagline: 'Fé, comunidade e tradição no Utah',
	contacts: '(801) 613-8046\nPriscila +1 (702) 292-7405\nCaio +1 (702) 292-6859',
	address: '7405 S Redwood Rd, West Jordan, UT 84084',
	facebook_url: 'https://www.facebook.com/brasileiroscatolicosemsaltlake',
	instagram_url: 'https://www.instagram.com/brasileiroscatolicosemsaltlake/',
	whatsapp_url: 'https://chat.whatsapp.com/5cVB6EyJ2SX3Y1GDYYYKKF',
	welcome_text:
		'Bem-vindo à comunidade Brasileiros Católicos Utah! Este é um espaço onde nossa comunidade se reúne para compartilhar fé, cultura e amizade. Explore o site para descobrir missas em português, eventos e como participar.',
	about_title: 'Sobre a comunidade',
	about_content:
		'Somos a comunidade Brasileiros Católicos Utah.\n\nReunimos famílias e fiéis brasileiros em Salt Lake City e região para celebrar a missa em português, viver a fé católica e fortalecer amizades na fé.\n\nNossa missa acontece todo último domingo do mês na Igreja São José Operário, em West Jordan.',
	page_sobre_enabled: '1',
	page_eventos_enabled: '1',
	calendar_enabled: '1',
} as const;

export const DEFAULT_SCHEDULE = {
	id: 1,
	recurrence: 'Último domingo do mês',
	time_label: '6:00 PM',
	church_name: 'Igreja Católica de São José Operário',
	address: '7405 S Redwood Rd, West Jordan, UT 84084',
	priest: 'Padre Francisco Pires',
	notes: 'Missa em português para a comunidade brasileira católica em Utah.',
	maps_url: 'https://maps.google.com/?q=7405+S+Redwood+Rd,+West+Jordan,+UT+84084',
	updated_at: new Date().toISOString(),
} as const;

export const SEO_KEYWORDS = [
	'missa em português',
	'missa utah',
	'missa salt lake city',
	'brasileiros católicos utah',
	'brasileiros católicos salt lake city',
	'comunidade católica',
	'missa em português west jordan',
	'Igreja São José Operário',
	'Padre Francisco Pires',
	'católicos brasileiros utah',
	'missa portuguesa utah',
	'comunidade brasileira católica',
].join(', ');

export const SESSION_COOKIE = 'bcu_session';
export const SESSION_DAYS = 14;
