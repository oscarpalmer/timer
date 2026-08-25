import {noop} from '@oscarpalmer/atoms/function';
import {MESSAGE_DESTROYED, MESSAGE_STARTED, TYPE_WHEN, WORK_CONTINUE} from './constants';
import {getValidNumber, getValidTimeout} from './get';
import './global';
import {
	TimerTrace,
	type When,
	type WhenOptions,
	type WhenState,
	type WorkHandlerType,
} from './models';
import {createTimer} from './timer';

function destroyWhen(state: WhenState): void {
	state.timer?.destroy();

	state.promise = undefined as never;
	state.resolver = noop;
	state.rejecter = noop;
	state.timer = undefined as never;
}

function onAfter(instance: When, state: WhenState): void {
	if (state.result) {
		state.resolver?.();
	} else {
		state.rejecter?.();
	}

	instance.destroy();
}

function onCallback(condition: () => boolean, state: WhenState): void {
	try {
		if (condition()) {
			state.result = true;

			state.timer.stop();
		}
	} catch {
		state.timer.stop();
	}
}

function onError(instance: When, state: WhenState): void {
	state.rejecter?.();

	instance.destroy();
}

function onWhen(type: WorkHandlerType, instance: When, state: WhenState): When {
	state.timer?.[type]?.();

	return instance;
}

function startWhen(state: WhenState, resolve?: (() => void) | null): Promise<void> {
	if (state.timer == null) {
		throw new Error(MESSAGE_DESTROYED);
	}

	if (state.started) {
		throw new Error(MESSAGE_STARTED);
	}

	state.started = true;

	state.timer.start();

	return state.promise.then(resolve);
}

/**
 * Create a conditional timer
 * @param condition Condition to check
 * @param options Timer options
 * @returns Timer instance
 */
export function when(condition: () => boolean, options?: Partial<WhenOptions>): When {
	const state: WhenState = {
		promise: undefined as never,
		result: false,
		started: false,
		timer: undefined as never,
	};

	let instance: When;

	state.promise = new Promise<void>((resolve, reject) => {
		state.resolver = resolve;
		state.rejecter = reject;
	});

	state.timer = createTimer(
		TYPE_WHEN,
		{
			callback: () => onCallback(condition, state),
			trace: new TimerTrace().stack,
		},
		{
			onAfter: () => onAfter(instance, state),
			onError: () => onError(instance, state),
			count: getValidNumber(options?.count),
			interval: getValidNumber(options?.interval),
			timeout: getValidTimeout(options?.timeout),
		},
		false,
	);

	instance = {
		continue: () => onWhen(WORK_CONTINUE, instance, state),
		destroy: () => destroyWhen(state),
		pause: () => onWhen('pause', instance, state),
		start: (resolve?: (() => void) | null) => startWhen(state, resolve),
		stop: () => onWhen('stop', instance, state),
	} as When;

	Object.defineProperties(instance, {
		$timer: {
			enumerable: false,
			value: TYPE_WHEN,
		},
		active: {
			enumerable: true,
			get: () => state.timer?.active ?? false,
		},
		destroyed: {
			enumerable: true,
			get: () => state.timer == null,
		},
		paused: {
			enumerable: true,
			get: () => state.timer?.paused ?? false,
		},
		trace: {
			enumerable: true,
			get: () => ((globalThis._oscarpalmer_timer_debug ?? false) ? state.timer?.trace : undefined),
		},
	});

	return Object.freeze(instance) as When;
}
