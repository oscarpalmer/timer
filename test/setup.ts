import {afterEach, vi} from 'vite-plus/test';

// The library captures `requestAnimationFrame` (or `setTimeout`) when it is imported,
// so the clock must be faked here, before any test file imports from `../src`
vi.useFakeTimers({
	toFake: [
		'cancelAnimationFrame',
		'clearTimeout',
		'Date',
		'performance',
		'requestAnimationFrame',
		'setTimeout',
	],
});

afterEach(() => {
	globalThis._oscarpalmer_timer_debug = undefined;
});
