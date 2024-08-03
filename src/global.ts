import {activeTimers} from './constants';

declare global {
	var _oscarpalmer_timer_debug: boolean | undefined;
	var _oscarpalmer_timers: Timer[] | undefined;
}

if (globalThis._oscarpalmer_timers == null) {
	Object.defineProperty(globalThis, '_oscarpalmer_timers', {
		get() {
			return globalThis._oscarpalmer_timer_debug ? [...activeTimers] : [];
		},
	});
}
