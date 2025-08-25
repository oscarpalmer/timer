import {
	activeTimers,
	hiddenTimers,
	WORK_CONTINUE,
	WORK_PAUSE,
} from './constants';
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
	const from = document.hidden ? activeTimers : hiddenTimers;
	const method = document.hidden ? WORK_PAUSE : WORK_CONTINUE;
	const to = document.hidden ? hiddenTimers : activeTimers;

	for (const timer of from) {
		timer[method]();
		to.add(timer);
	}

	from.clear();
});
