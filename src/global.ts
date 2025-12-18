import {TIMERS_ACTIVE, TIMERS_HIDDEN, WORK_CONTINUE, WORK_PAUSE} from './constants';
import type {Timer} from './timer';

declare global {
	var _oscarpalmer_timer_debug: boolean | undefined;
	var _oscarpalmer_timers: Timer[] | undefined;
}

if (globalThis._oscarpalmer_timers == null) {
	Object.defineProperty(globalThis, '_oscarpalmer_timers', {
		get() {
			return globalThis._oscarpalmer_timer_debug ? [...TIMERS_ACTIVE] : [];
		},
	});
}

/* istanbul ignore next */
document.addEventListener('visibilitychange', () => {
	const from = document.hidden ? TIMERS_ACTIVE : TIMERS_HIDDEN;
	const method = document.hidden ? WORK_PAUSE : WORK_CONTINUE;
	const to = document.hidden ? TIMERS_HIDDEN : TIMERS_ACTIVE;

	for (const timer of from) {
		timer[method]();
		to.add(timer);
	}

	from.clear();
});
