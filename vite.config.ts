import {defineConfig} from 'vite-plus';
import rules from '@oscarpalmer/atoms/eslint/rules';

export default defineConfig({
	base: './',
	fmt: {
		arrowParens: 'avoid',
		bracketSpacing: false,
		singleQuote: true,
		useTabs: true,
	},
	lint: {
		jsPlugins: ['@oscarpalmer/atoms/eslint'],
		rules: {
			...rules,
		},
	},
	logLevel: 'silent',
	pack: {
		clean: false,
		deps: {
			resolveDepSubpath: true,
		},
		dts: {
			generator: 'oxc',
		},
		entry: ['./src/**/*.ts'],
		unbundle: true,
	},
	test: {
		coverage: {
			include: ['src/**/*.ts'],
			provider: 'istanbul',
		},
		environment: 'jsdom',
		setupFiles: ['./test/setup.ts'],
		watch: false,
	},
});
