import {activeTimers, hiddenTimers} from './constants';
import type {Timer} from './timer';

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

document.addEventListener('visibilitychange', () => {
	if (document.hidden) {
		for (const timer of activeTimers) {
			hiddenTimers.add(timer);
			timer.pause();
		}
	} else {
		for (const timer of hiddenTimers) {
			timer.continue();
		}

		hiddenTimers.clear();
	}
});
