import {
	activeTimers,
	beginTypes,
	endOrRestartTypes,
	endTypes,
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

export function work(
	type: WorkHandlerType,
	timer: WorkHandlerTimer,
	state: TimerState,
	options: TimerOptions,
): Timer {
	if (
		(state.destroyed && type !== 'stop') ||
		(state.active ? beginTypes.has(type) : endTypes.has(type))
	) {
		return timer.instance;
	}

	const pausable = pauseTypes.has(type);

	state.elapsed = pausable ? state.elapsed : 0;
	state.index = pausable ? state.index : 0;
	state.total = pausable ? state.total : 0;

	if (endOrRestartTypes.has(type)) {
		activeTimers.delete(timer.instance);

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

	state.active = true;
	state.paused = false;

	let start: DOMHighResTimeStamp | undefined;

	function step(now: DOMHighResTimeStamp): void {
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
			state.elapsed >= options.interval - 5
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
	}

	activeTimers.add(timer.instance);

	state.frame = requestAnimationFrame(step);

	return timer.instance;
}
