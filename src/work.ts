import {
	activeTimers,
	beginTypes,
	endOrRestartTypes,
	endTypes,
	intervalBuffer,
	milliseconds,
	pauseTypes,
} from './constants';
import type {
	TimerOptions,
	TimerState,
	WorkHandlerTimer,
	WorkHandlerType,
} from './models';
import type {Timer} from './timer';

function endOrRestart(
	type: WorkHandlerType,
	timer: WorkHandlerTimer,
	state: TimerState,
	options: TimerOptions,
): Timer {
	cancelAnimationFrame(state.frame as never);

	if (type === 'stop') {
		options.onAfter?.(false);
	}

	state.active = false;
	state.frame = undefined;
	state.paused = type === 'pause';

	return type === 'restart'
		? work('start', timer, state, options)
		: timer.instance;
}

function finish(
	timer: WorkHandlerTimer,
	state: TimerState,
	options: TimerOptions,
	success: boolean,
): void {
	activeTimers.delete(timer.instance);

	state.active = false;
	state.elapsed = 0;
	state.frame = undefined;

	if (timer.type === 'wait') {
		state.callback();
	} else {
		options.onAfter?.(success);
	}
}

function ignore(type: WorkHandlerType, state: TimerState): boolean {
	return (
		(state.destroyed && type !== 'stop') ||
		(state.active ? beginTypes.has(type) : endTypes.has(type))
	);
}

function run(
	timer: WorkHandlerTimer,
	state: TimerState,
	options: TimerOptions,
): (now: DOMHighResTimeStamp) => void {
	let start: DOMHighResTimeStamp | undefined;

	return function step(now: DOMHighResTimeStamp): void {
		if (!state.active) {
			return;
		}

		start ??= now;

		const difference = now - start;

		state.elapsed += difference;
		state.total += difference;

		if (options.timeout > 0 && state.total >= options.timeout) {
			options.onError?.();

			finish(timer, state, options, false);

			return;
		}

		if (
			options.interval === milliseconds ||
			state.elapsed >= options.interval - intervalBuffer
		) {
			if (options.count > -1) {
				(state.callback as (index: number) => void)(state.index);
			}

			start = now;

			state.elapsed = 0;
			state.index += 1;

			if (
				options.count === -1 ||
				(options.count > 0 && state.index >= options.count)
			) {
				finish(timer, state, options, true);

				return;
			}
		}

		state.frame = requestAnimationFrame(step);
	};
}

function setState(type: WorkHandlerType, state: TimerState): void {
	const pausable = pauseTypes.has(type);

	state.elapsed = pausable ? state.elapsed : 0;
	state.index = pausable ? state.index : 0;
	state.total = pausable ? state.total : 0;
}

export function stop(
	timer: WorkHandlerTimer,
	state: TimerState,
	options: TimerOptions,
): void {
	endOrRestart('stop', timer, state, options);
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

	if (endOrRestartTypes.has(type)) {
		return endOrRestart(type, timer, state, options);
	}

	state.active = true;
	state.paused = false;

	activeTimers.add(timer.instance);

	const runner = run(timer, state, options);

	state.frame = requestAnimationFrame(runner);

	return timer.instance;
}
