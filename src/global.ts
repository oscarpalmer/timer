import {GLOBAL_NAME, STATES} from './constants';
import {onVisibilityChange} from './misc';
import type {Timer} from './models';

// #region Types

declare global {
	var _oscarpalmer_timer_debug: boolean | undefined;
	/**
	 * All active timers _(or `undefined` if debugging is not enabled)_
	 */
	var _oscarpalmer_timers: Timer[] | undefined;
}

// #endregion

// #region Initialization

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

/* istanbul ignore next */
if ('document' in globalThis) {
	document.addEventListener('visibilitychange', onVisibilityChange);
}

// #endregion
