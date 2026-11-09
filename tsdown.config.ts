import {defineConfig} from 'vite-plus/pack';

export default defineConfig({
	clean: false,
	deps: {
		resolveDepSubpath: true,
		alwaysBundle: /^@oscarpalmer/,
		onlyBundle: false,
	},
	entry: './src/index.ts',
	minify: 'dce-only',
});
