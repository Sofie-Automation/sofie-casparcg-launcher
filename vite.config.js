/* eslint-disable n/no-unpublished-import */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
	root: '.',

	// Relative asset paths are required for the file:// protocol used in
	// production (Electron loads the built index.html directly from disk).
	base: './',

	plugins: [
		// Vue 2 SFC support
		vue(),
	],

	resolve: {
		alias: {
			'@': path.join(import.meta.dirname, 'src/renderer'),
		},
		// Allow importing .vue files without specifying the extension (matches webpack behaviour)
		extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
	},

	// Vite dev server – must match the port in src/main/index.js (winURL = http://localhost:9080)
	server: {
		port: 9080,
		strictPort: true,
	},

	build: {
		// Renderer output consumed by electron-builder (mirrors the webpack output path)
		outDir: 'dist/renderer',
		emptyOutDir: true,
		rollupOptions: {
			input: path.join(import.meta.dirname, 'index.html'),
		},
	},

	css: {
		preprocessorOptions: {
			// Bootstrap 4's legacy SCSS triggers many deprecation warnings in Dart Sass 1.x.
			// Silence them so the build output stays readable; errors are still shown.
			scss: {
				silenceDeprecations: [
					'import',
					'global-builtin',
					'color-functions',
					'slash-div',
					'if-function',
					'legacy-js-api',
				],
			},
		},
	},
})
