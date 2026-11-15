import {defineConfig} from 'oxlint';
import rules from '@oscarpalmer/atoms/eslint/rules';

export default defineConfig({
	jsPlugins: ['@oscarpalmer/atoms/eslint'],
	rules: {
		...rules,
	},
});
