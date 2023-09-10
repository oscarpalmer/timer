import typescript from '@rollup/plugin-typescript';

const format = process?.env?.ROLLUP_FORMAT ?? 'es';
const isEsm = format === 'es';

const banner = isEsm
	? `/**
 * @callback AfterCallback
 * @param {boolean} finished Did the timer finish?
 * @returns {void}
 */
/**
 * @callback RepeatedCallback
 * @param {number} index The index of the current iteration
 * @returns {void}
 */`
	: undefined;

const file = isEsm ? './dist/timer.js' : './dist/timer.iife.js';

const name = 'Timer';

const configuration = {
	input: './src/index.ts',
	output: {
		banner,
		file,
		format,
		name,
	},
	plugins: [typescript()],
	watch: {
		include: 'src/**',
	},
};

export default configuration;
