import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
	site: 'https://brasileiroscatolicosutah.org',
	output: 'server',
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
		imageService: 'compile',
	}),
	integrations: [tailwind()],
	// Auth uses D1 sessions; Astro session driver is unused but required by the adapter default.
	session: {
		driver: 'memory',
	},
});
