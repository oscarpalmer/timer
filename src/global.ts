import {GLOBAL_NAME, STATES} from './constants';
import {onVisibilityChange} from './misc';
import type {Timer} from './models';

declare global {
	var _oscarpalmer_timer_debug: boolean | undefined;
	/**
	 * All active timers _(or `undefined` if debugging is not enabled)_
	 */
	var _oscarpalmer_timers: Timer[] | undefined;
}

/* istanbul ignore next */
if (!(GLOBAL_NAME in globalThis)) {
	Object.defineProperty(globalThis, GLOBAL_NAME, {
		get() {
			return globalThis._oscarpalmer_timer_debug
				? [...STATES.active].map(state => state.timer)
				: [];
		},
	});
}

document.addEventListener('visibilitychange', onVisibilityChange);
