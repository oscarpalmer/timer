import {GLOBAL_NAME, STATES, WORK_CONTINUE, WORK_PAUSE} from './constants';
import type {Timer} from './models';
import {work} from './work';

// #region Types

declare global {
	var _oscarpalmer_timer_debug: boolean | undefined;
	/**
	 * All active timers _(or `undefined` if debugging is not enabled)_
	 */
	var _oscarpalmer_timers: Timer[] | undefined;
}

// #endregion

// #region Functions

function onVisibilityChange(): void {
	const from = document.hidden ? STATES.active : STATES.hidden;
	const type = document.hidden ? WORK_PAUSE : WORK_CONTINUE;

	for (const stored of from) {
		const state = stored instanceof WeakRef ? stored.deref() : stored;

		/* istanbul ignore if -- only when a WeakRef has been garbage collected */
		if (state == null) {
			from.delete(stored as never);
		} else {
			work(type, state, true);
		}
	}
}

// #endregion

// #region Initialization

/* istanbul ignore else -- only defined once, even if the library is loaded twice */
if (!(GLOBAL_NAME in globalThis)) {
	Object.defineProperty(globalThis, GLOBAL_NAME, {
		get() {
			return globalThis._oscarpalmer_timer_debug
				? [...STATES.active].map(state => state.timer)
				: [];
		},
	});
}

/* istanbul ignore else -- non-browser environments */
if ('document' in globalThis) {
	document.addEventListener('visibilitychange', onVisibilityChange);
}

// #endregion
