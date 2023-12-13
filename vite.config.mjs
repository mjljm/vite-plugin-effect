import { join } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	root: join(__dirname),
	publicDir: './www/public',
	plugins: [dts({ include: ['./src/index.ts'] })],
	build: {
		minify: 'terser',
		lib: {
			name: 'Configs',
			entry: './src/index.ts',
			formats: ['umd'],
			filename: 'index'
			//filename: (_, entry) => `${entry}.cjs`
		},
		outDir: './dist',
		modulePreload: { polyfill: false },
		sourcemap: false,
		emptyOutDir: true,
		terserOptions: {
			ecma: 2020,
			module: true,
			format: {
				ecma: 2020,
				indent_level: 0
			},
			mangle: {
				keep_classnames: true,
				keep_fnames: /^(?!_)/,
				toplevel: true,
				properties: { regex: /^_/ }
			},
			keep_classnames: true,
			keep_fnames: /^(?!_)/,
			toplevel: true
		}
	},
	resolve: {
		alias: {
			'@mjljm/configs': join(__dirname, './src')
		}
	}
});
