import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { ViteMinifyPlugin } from 'vite-plugin-minify';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), ViteMinifyPlugin(), ViteImageOptimizer()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});
