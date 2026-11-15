import {defineConfig} from 'vite-plus/pack';

export default defineConfig({
	clean: false,
	copy: [
		{
			from: './dist/index.mjs',
			to: './dist',
			rename: 'timer.full.mjs',
		},
	],
	deps: {
		resolveDepSubpath: true,
		alwaysBundle: /^@oscarpalmer/,
		onlyBundle: false,
	},
	entry: './src/index.ts',
	minify: 'dce-only',
});
