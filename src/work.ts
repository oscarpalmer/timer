import {
	BUFFER_INTERVAL,
	TYPE_WAIT,
	WORK_CONTINUE,
	WORK_PAUSE,
	WORK_RESTART,
	WORK_START,
	WORK_STOP,
} from './constants';
import {updateStates} from './misc';
import type {Timer, TimerState, WorkHandlerType} from './models';

function finish(state: TimerState, success: boolean): void {
	updateStates(state);

	cancelAnimationFrame(state.frame as never);

	state.active = false;
	state.elapsed = 0;
	state.frame = undefined;

	if (state.name === TYPE_WAIT) {
		state.callback();
	} else {
		state.options.onAfter?.(success);
	}
}

function ignore(type: WorkHandlerType, state: TimerState): boolean {
	if (state.paused) {
		return type === WORK_PAUSE || type === WORK_START;
	}

	return state.active && type === WORK_START;
}

function run(state: TimerState): (now: DOMHighResTimeStamp) => void {
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

		if (state.options.timeout > 0 && state.total >= state.options.timeout) {
			state.options.onError?.();

			finish(state, false);

			return;
		}

		if (state.options.interval === 0 || state.elapsed >= state.options.interval - BUFFER_INTERVAL) {
			if (state.options.count > -1) {
				(state.callback as (index: number) => void)(state.index);
			}

			start = now;

			state.elapsed = 0;
			state.index += 1;

			if (
				state.options.count === -1 ||
				(state.options.count > 0 && state.index >= state.options.count)
			) {
				finish(state, true);

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

export function stop(state: TimerState): Timer {
	updateStates(state);

	cancelAnimationFrame(state.frame as never);

	state.options.onAfter?.(false);

	state.active = false;
	state.frame = undefined;
	state.paused = false;

	return state.timer;
}

export function work(type: WorkHandlerType, state: TimerState, hide?: boolean): Timer {
	if (ignore(type, state)) {
		return state.timer;
	}

	setState(type, state);

	if (type === WORK_STOP) {
		return stop(state);
	}

	if (type === WORK_PAUSE || type === WORK_RESTART) {
		cancelAnimationFrame(state.frame as never);

		state.frame = undefined;
	}

	state.active = true;
	state.paused = type === WORK_PAUSE;

	updateStates(state, state.paused ? ((hide ?? false) ? 'hidden' : undefined) : 'active');

	if (state.paused) {
		return state.timer;
	}

	const runner = run(state);

	state.frame = requestAnimationFrame(runner);

	return state.timer;
}
