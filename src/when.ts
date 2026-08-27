import {noop} from '@oscarpalmer/atoms/function';
import {MESSAGE_STARTED, TYPE_WHEN, WORK_CONTINUE, WORK_PAUSE, WORK_STOP} from './constants';
import {getValidNumber, getValidTimeout} from './misc';
import './global';
import {
	TimerTrace,
	type When,
	type WhenOptions,
	type WhenState,
	type WorkHandlerType,
} from './models';
import {createTimer} from './timer';

function onAfter(state: WhenState): void {
	if (state.result) {
		state.resolver?.();
	} else {
		state.rejecter?.();
	}
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

function onWhen(type: WorkHandlerType, instance: When, state: WhenState): When {
	state.timer?.[type]?.();

	return instance;
}

function startWhen(state: WhenState, resolve?: (() => void) | null): Promise<void> {
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
			onAfter: () => onAfter(state),
			onError: () => state.rejecter?.(),
			count: getValidNumber(options?.count),
			interval: getValidNumber(options?.interval),
			timeout: getValidTimeout(options?.timeout),
		},
		false,
	);

	instance = {
		continue: () => onWhen(WORK_CONTINUE, instance, state),
		destroy: noop,
		pause: () => onWhen(WORK_PAUSE, instance, state),
		start: (resolve: never) => startWhen(state, resolve),
		stop: () => onWhen(WORK_STOP, instance, state),
	} as When;

	Object.defineProperties(instance, {
		$timer: {
			enumerable: false,
			value: TYPE_WHEN,
		},
		active: {
			enumerable: true,
			get: () => state.timer.active,
		},
		destroyed: {
			enumerable: true,
			value: false,
		},
		paused: {
			enumerable: true,
			get: () => state.timer.paused,
		},
		trace: {
			enumerable: true,
			get: () => ((globalThis._oscarpalmer_timer_debug ?? false) ? state.timer?.trace : undefined),
		},
	});

	return Object.freeze(instance) as When;
}
