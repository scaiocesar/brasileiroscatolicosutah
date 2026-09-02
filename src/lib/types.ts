export type UserRole = 'admin' | 'editor';

export type User = {
	id: number;
	email: string;
	name: string;
	role: UserRole;
	active: number;
	created_at: string;
	updated_at: string;
};

export type Mass = {
	id: number;
	recurrence: string;
	time_label: string;
	priest: string | null;
	notes: string | null;
	location: string;
	sort_order: number;
	published: number;
	created_at: string;
	updated_at: string;
};

export type FeaturedMass = {
	id: number;
	title: string;
	event_at: string;
	location: string | null;
	image_key: string;
	published: number;
	created_by: number | null;
	created_at: string;
	updated_at: string;
};

export type EventItem = {
	id: number;
	title: string;
	description: string | null;
	location: string | null;
	starts_at: string;
	ends_at: string | null;
	image_key: string | null;
	published: number;
	created_by: number | null;
	created_at: string;
	updated_at: string;
};

export type Article = {
	id: number;
	title: string;
	excerpt: string | null;
	body: string;
	cover_image_key: string | null;
	published: number;
	created_by: number | null;
	created_at: string;
	updated_at: string;
};

export type SiteSettings = {
	site_name: string;
	tagline: string;
	contacts: string;
	address: string;
	facebook_url: string;
	instagram_url: string;
	whatsapp_url: string;
	welcome_text: string;
	about_title: string;
	about_content: string;
	page_sobre_enabled: string;
	page_eventos_enabled: string;
	page_artigos_enabled: string;
	calendar_enabled: string;
};
