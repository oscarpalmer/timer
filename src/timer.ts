import {noop} from '@oscarpalmer/atoms/function';
import {WORK_CONTINUE, WORK_PAUSE, WORK_RESTART, WORK_START, WORK_STOP} from './constants';
import type {Timer, TimerName, TimerOptions, TimerState, WorkHandlerType} from './models';
import {stop, work} from './work';

export function createTimer(
	name: TimerName,
	pick: Pick<TimerState, 'callback' | 'trace'>,
	options: TimerOptions,
	start: boolean,
): Timer {
	function worker(type: WorkHandlerType): Timer {
		return work(
			type,
			{
				name,
				instance: instance as Timer,
			},
			state,
			options,
		);
	}

	const state: TimerState = {
		...pick,
		active: false,
		destroyed: false,
		elapsed: 0,
		frame: undefined,
		index: 0,
		paused: false,
		total: 0,
	};

	const instance = {
		continue: () => worker(WORK_CONTINUE),
		destroy: () => destroyTimer(name, instance as Timer, state, options),
		pause: () => worker(WORK_PAUSE),
		restart: () => worker(WORK_RESTART),
		start: () => worker(WORK_START),
		stop: () => worker(WORK_STOP),
	};

	Object.defineProperties(instance, {
		$timer: {
			enumerable: false,
			value: name,
		},
		active: {
			enumerable: true,
			get: () => state.active,
		},
		destroyed: {
			enumerable: true,
			get: () => state.destroyed,
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

	if (start) {
		instance.start();
	}

	return Object.freeze(instance) as Timer;
}

function destroyTimer(
	name: TimerName,
	instance: Timer,
	state: TimerState,
	options: TimerOptions,
): void {
	state.destroyed = true;

	options.onAfter = noop;
	options.onError = noop;
	state.callback = noop;

	if (!globalThis._oscarpalmer_timer_debug) {
		state.trace = undefined;
	}

	stop({instance, name}, state, options);
}
