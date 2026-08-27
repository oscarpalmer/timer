import {noop} from '@oscarpalmer/atoms/function';
import {WORK_CONTINUE, WORK_PAUSE, WORK_RESTART, WORK_START, WORK_STOP} from './constants';
import type {Timer, TimerName, TimerOptions, TimerState} from './models';
import {work} from './work';

export function createTimer(
	name: TimerName,
	pick: Pick<TimerState, 'callback' | 'trace'>,
	options: TimerOptions,
	start: boolean,
): Timer {
	const state: TimerState = {
		...pick,
		name,
		options,
		active: false,
		destroyed: false,
		elapsed: 0,
		frame: undefined,
		index: 0,
		paused: false,
		timer: undefined as never,
		total: 0,
	};

	const instance = {
		continue: () => work(WORK_CONTINUE, state),
		destroy: noop,
		pause: () => work(WORK_PAUSE, state),
		restart: () => work(WORK_RESTART, state),
		start: () => work(WORK_START, state),
		stop: () => work(WORK_STOP, state),
	};

	Object.defineProperties(instance, {
		$timer: {
			enumerable: false,
			value: name,
		},
		active: {
			enumerable: true,
			get: () => state.active && !state.paused,
		},
		destroyed: {
			enumerable: true,
			value: false,
		},
		paused: {
			enumerable: true,
			get: () => state.paused,
		},
		trace: {
			enumerable: true,
			get: () => ((globalThis._oscarpalmer_timer_debug ?? false) ? state.trace : undefined),
		},
	});

	state.timer = Object.freeze(instance) as Timer;

	if (start) {
		state.timer.start();
	}

	return state.timer;
}
