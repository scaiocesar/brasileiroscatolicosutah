/// <reference types="astro/client" />

type Env = {
	DB: D1Database;
	MEDIA: R2Bucket;
	ASSETS: Fetcher;
};

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {
		user?: {
			id: number;
			email: string;
			name: string;
			role: 'admin' | 'editor';
		};
	}
}
