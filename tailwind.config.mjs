/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				brand: {
					blue: '#1B4F9C',
					'blue-dark': '#0F2F6B',
					'blue-light': '#2E6BC4',
					gold: '#F5C518',
					cream: '#F8F6F1',
					ink: '#1A1A1A',
				},
			},
			fontFamily: {
				sans: [
					'Inter',
					'ui-sans-serif',
					'system-ui',
					'-apple-system',
					'Segoe UI',
					'Roboto',
					'sans-serif',
				],
			},
			boxShadow: {
				card: '0 10px 30px -12px rgba(15, 47, 107, 0.25)',
			},
		},
	},
	plugins: [],
};
