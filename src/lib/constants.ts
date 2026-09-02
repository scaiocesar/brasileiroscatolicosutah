import type { Mass } from './types';

export const SITE_URL = 'https://brasileiroscatolicosutah.org';

export const DEFAULT_SETTINGS = {
	site_name: 'Brasileiros Católicos Utah',
	tagline: 'Fé, comunidade e tradição em utah',
	contacts: '(801) 613-8046\nPriscila +1 (702) 292-7405\nCaio +1 (702) 292-6859',
	address: '7405 S Redwood Rd, West Jordan, UT 84084',
	facebook_url: 'https://www.facebook.com/brasileiroscatolicosemsaltlake',
	instagram_url: 'https://www.instagram.com/brasileiroscatolicosemsaltlake/',
	whatsapp_url: 'https://chat.whatsapp.com/5cVB6EyJ2SX3Y1GDYYYKKF',
	welcome_text:
		'Bem-vindo à comunidade Brasileiros Católicos Utah! Este é um espaço onde nossa comunidade se reúne para compartilhar fé, cultura e amizade. Explore o site para descobrir missas em português, eventos e como participar.',
	about_title: 'Sobre a comunidade',
	about_content:
		'<p>Somos a comunidade Brasileiros Católicos Utah.</p><p>Reunimos famílias e fiéis brasileiros em Salt Lake City e região para celebrar a missa em português, viver a fé católica e fortalecer amizades na fé.</p><p>Nossa missa acontece todo último domingo do mês na Igreja São José Operário, em West Jordan.</p>',
	page_sobre_enabled: '1',
	page_eventos_enabled: '1',
	page_artigos_enabled: '1',
	calendar_enabled: '1',
} as const;

export const DEFAULT_MASS: Mass = {
	id: 1,
	recurrence: 'Último domingo do mês',
	time_label: '6:00 PM',
	priest: 'Padre Francisco Pires',
	notes: 'Missa em português para a comunidade brasileira católica em utah.',
	location: 'Igreja Católica de São José Operário\n7405 S Redwood Rd, West Jordan, UT 84084',
	sort_order: 0,
	published: 1,
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
};

export const DEFAULT_MASSES: Mass[] = [DEFAULT_MASS];

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
