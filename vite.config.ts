import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		// ViteMinifyPlugin(),
		ViteImageOptimizer(),
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			devOptions: {
				enabled: false,
			},
			workbox: {
				clientsClaim: true,
				skipWaiting: true,
			},
			includeAssets: ['favicon.ico', 'robots.txt'],
			manifest: {
				background_color: '#ffffff',
				categories: ['olympics', 'information technology', 'computer science', 'procon 2023'],
				description: 'Procon 2023 - CTU.Word2Vec',
				dir: 'ltr',
				orientation: 'landscape',
				display: 'standalone',
				icons: [
					{
						src: 'favicon.ico',
						sizes: '48x48',
						type: 'image/x-icon',
					},
					{
						src: 'favicon-16x16.png',
						sizes: '16x16',
						type: 'image/png',
					},
					{
						src: 'favicon-32x32.png',
						sizes: '32x32',
						type: 'image/png',
					},
					{
						src: 'android-chrome-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'android-chrome-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: 'apple-touch-icon.png',
						sizes: '180x180',
						type: 'image/png',
					},
				],
				lang: 'vi',
				id: 'com.ctu.word2vec.procon2023',
				name: 'CTU.Word2Vec',
				screenshots: [
					{
						src: 'demo-play-real.png',
						sizes: '1749x1078',
						label: 'Demo play real mobile',
						platform: 'web',
						type: 'image/png',
						form_factor: 'narrow',
					},
					{
						src: 'demo-play-real.png',
						sizes: '1749x1078',
						label: 'Demo play real',
						platform: 'web',
						type: 'image/png',
						form_factor: 'wide',
					},
					{
						src: 'demo-play-test.png',
						sizes: '1749x1078',
						label: 'Demo play test mobile',
						platform: 'web',
						type: 'image/png',
						form_factor: 'narrow',
					},
					{
						src: 'demo-play-test.png',
						sizes: '1749x1078',
						label: 'Demo play test',
						platform: 'web',
						type: 'image/png',
						form_factor: 'wide',
					},
				],
				short_name: 'CTU.Word2Vec',
				start_url: '/',
				theme_color: '#177cce',
			},
			minify: true,
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});
