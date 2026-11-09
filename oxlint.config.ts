import {defineConfig} from 'oxlint';
import rules from './node_modules/@oscarpalmer/atoms/plugin/rules.js';

export default defineConfig({
	jsPlugins: ['@oscarpalmer/atoms/eslint'],
	rules: {
		...rules,
	},
});
