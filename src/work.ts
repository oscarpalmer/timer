import {
	TIMERS_ACTIVE,
	BUFFER_INTERVAL,
	MILLISECONDS,
	TYPE_WAIT,
	WORK_CONTINUE,
	WORK_PAUSE,
	WORK_RESTART,
	WORK_START,
	WORK_STOP,
} from './constants';
import type {TimerOptions, TimerState, WorkHandlerTimer, WorkHandlerType} from './models';
import type {Timer} from './timer';

function finish(
	timer: WorkHandlerTimer,
	state: TimerState,
	options: TimerOptions,
	success: boolean,
): void {
	cancelAnimationFrame(state.frame as never);

	TIMERS_ACTIVE.delete(timer.instance);

	state.active = false;
	state.elapsed = 0;
	state.frame = undefined;

	if (timer.type === TYPE_WAIT) {
		state.callback();
	} else {
		options.onAfter?.(success);
	}
}

function ignore(type: WorkHandlerType, state: TimerState): boolean {
	if (state.destroyed) {
		return type !== WORK_STOP;
	}

	if (state.paused) {
		return type === WORK_PAUSE || type === WORK_START;
	}

	return state.active && type === WORK_START;
}

function pause(timer: WorkHandlerTimer, state: TimerState): Timer {
	cancelAnimationFrame(state.frame as never);

	state.frame = undefined;

	return timer.instance;
}

function run(
	timer: WorkHandlerTimer,
	state: TimerState,
	options: TimerOptions,
): (now: DOMHighResTimeStamp) => void {
	let last: DOMHighResTimeStamp | undefined;
	let start: DOMHighResTimeStamp | undefined;

	return function step(now: DOMHighResTimeStamp): void {
		if (!state.active) {
			return;
		}

		last ??= now;
		start ??= now;

		const difference = now - last;

		state.elapsed += difference;
		state.total += difference;

		last = now;

		if (options.timeout > 0 && state.total >= options.timeout) {
			options.onError?.();

			finish(timer, state, options, false);

			return;
		}

		if (options.interval === MILLISECONDS || state.elapsed >= options.interval - BUFFER_INTERVAL) {
			if (options.count > -1) {
				(state.callback as (index: number) => void)(state.index);
			}

			start = now;

			state.elapsed = 0;
			state.index += 1;

			if (options.count === -1 || (options.count > 0 && state.index >= options.count)) {
				finish(timer, state, options, true);

				return;
			}
		}

		state.frame = requestAnimationFrame(step);
	};
}

function setState(type: WorkHandlerType, state: TimerState): void {
	const pausable = type === WORK_CONTINUE || type === WORK_PAUSE;

	state.elapsed = pausable ? state.elapsed : 0;
	state.index = pausable ? state.index : 0;
	state.total = pausable ? state.total : 0;
}

export function stop(timer: WorkHandlerTimer, state: TimerState, options: TimerOptions): Timer {
	cancelAnimationFrame(state.frame as never);

	TIMERS_ACTIVE.delete(timer.instance);

	options.onAfter?.(false);

	state.active = !stop;
	state.frame = undefined;
	state.paused = false;

	return timer.instance;
}

export function work(
	type: WorkHandlerType,
	timer: WorkHandlerTimer,
	state: TimerState,
	options: TimerOptions,
): Timer {
	if (ignore(type, state)) {
		return timer.instance;
	}

	setState(type, state);

	if (type === WORK_STOP) {
		return stop(timer, state, options);
	}

	if (type === WORK_PAUSE || type === WORK_RESTART) {
		cancelAnimationFrame(state.frame as never);

		state.frame = undefined;
	}

	state.active = true;
	state.paused = type === WORK_PAUSE;

	if (state.paused) {
		return pause(timer, state);
	}

	TIMERS_ACTIVE.add(timer.instance);

	const runner = run(timer, state, options);

	state.frame = requestAnimationFrame(runner);

	return timer.instance;
}
