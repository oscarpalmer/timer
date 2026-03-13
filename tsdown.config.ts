import {defineConfig} from 'tsdown';

export default defineConfig({
	clean: false,
	deps: {
		alwaysBundle: /^@oscarpalmer/,
		onlyBundle: false,
	},
	entry: './src/index.ts',
	minify: 'dce-only',
});
