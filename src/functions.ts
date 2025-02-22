import {
	activeTimers,
	beginTypes,
	endOrRestartTypes,
	endTypes,
	milliseconds,
} from './constants';
import type {TimerOptions, TimerState, WorkType} from './models';
import type {Timer} from './timer';

export function getOptions(
	options: Partial<TimerOptions>,
	isRepeated: boolean,
): TimerOptions {
	return {
		afterCallback: options.afterCallback,
		count: getNumberOrDefault(
			options.count,
			isRepeated ? Number.POSITIVE_INFINITY : 1,
		),
		errorCallback: options.errorCallback,
		interval: getNumberOrDefault(options.interval, milliseconds, milliseconds),
		timeout: getNumberOrDefault(
			options.timeout,
			isRepeated ? Number.POSITIVE_INFINITY : 30_000,
		),
	};
}

function getNumberOrDefault(
	value: unknown,
	defaultValue: number,
	minimum?: number,
): number {
	return typeof value === 'number' && value > (minimum ?? 0)
		? value
		: defaultValue;
}

export function work(
	type: WorkType,
	timer: Timer,
	state: TimerState,
	options: TimerOptions,
): Timer {
	if (
		(state.destroyed && type !== 'stop') ||
		(beginTypes.has(type) && state.active) ||
		(endTypes.has(type) && !state.active)
	) {
		return timer;
	}

	const {count, interval, timeout} = options;
	const {isRepeated, minimum} = state;

	if (endOrRestartTypes.has(type)) {
		const isStop = type === 'stop';

		activeTimers.delete(timer);

		cancelAnimationFrame(state.frame as never);

		if (isStop) {
			options.afterCallback?.(false);
		}

		state.active = false;
		state.frame = undefined;
		state.paused = !isStop;

		if (isStop) {
			state.elapsed = undefined;
			state.index = undefined;
		}

		return type === 'restart' ? work('start', timer, state, options) : timer;
	}

	state.active = true;
	state.paused = false;

	const elapsed = type === 'continue' ? Number(state.elapsed ?? 0) : 0;

	let index = type === 'continue' ? Number(state.index ?? 0) : 0;

	state.elapsed = elapsed;
	state.index = index;

	const total =
		(count === Number.POSITIVE_INFINITY
			? Number.POSITIVE_INFINITY
			: (count - index) * (interval > 0 ? interval : milliseconds)) - elapsed;

	let current: DOMHighResTimeStamp | null;
	let start: DOMHighResTimeStamp | null;

	function finish(finished: boolean, error: boolean) {
		activeTimers.delete(timer);

		state.active = false;
		state.elapsed = undefined;
		state.frame = undefined;
		state.index = undefined;

		if (error) {
			options.errorCallback?.();
		}

		options.afterCallback?.(finished);
	}

	function step(timestamp: DOMHighResTimeStamp): void {
		if (!state.active) {
			return;
		}

		current ??= timestamp;
		start ??= timestamp;

		const time = timestamp - current;

		state.elapsed = elapsed + (current - start);

		const finished = time - elapsed >= total;

		if (timestamp - start >= timeout - elapsed) {
			finish(finished, !finished);

			return;
		}

		if (finished || time >= minimum) {
			if (state.active) {
				state.callback((isRepeated ? index : undefined) as never);
			}

			index += 1;

			state.index = index;

			if (!finished && index < count) {
				current = null;
			} else {
				finish(true, false);
				return;
			}
		}

		state.frame = requestAnimationFrame(step);
	}

	activeTimers.add(timer);

	state.frame = requestAnimationFrame(step);

	return timer;
}
