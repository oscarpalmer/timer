import {
	MESSAGE_STARTED,
	SYMBOL,
	TYPE_WHEN,
	WORK_CONTINUE,
	WORK_PAUSE,
	WORK_STOP,
} from './constants';
import './global';
import {getValidNumber, getValidTimeout, updatePrototype} from './misc';
import {
	TimerTrace,
	type When,
	type WhenOptions,
	type WhenState,
	type WorkHandlerType,
} from './models';
import {createTimer} from './timer';

// #region Types

type InternalWhen = {
	[SYMBOL]: WhenState;
} & When;

// #endregion

// #region Instances

function When(this: InternalWhen, condition: () => boolean, options: WhenOptions): void {
	const state: WhenState = {
		name: TYPE_WHEN,
		promise: undefined as never,
		result: false,
		started: false,
		timer: undefined as never,
	};

	this[SYMBOL] = state;

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
			...options,
			onAfter: () => onAfter(state),
			onError: () => state.rejecter?.(),
		},
		false,
	);
}

updatePrototype(When, {
	continue: continueWhen,
	pause: pauseWhen,
	start: startWhen,
	stop: stopWhen,
});

// #endregion

// #region Functions

function continueWhen(this: InternalWhen): When {
	return onWhen(WORK_CONTINUE, this, this[SYMBOL]);
}

function getWhenOptions(input: unknown): WhenOptions {
	const options =
		typeof input === 'object' && input !== null ? (input as Partial<WhenOptions>) : {};

	return {
		count: getValidNumber(options?.count),
		interval: getValidNumber(options?.interval),
		timeout: getValidTimeout(options?.timeout),
	};
}

function onAfter(state: WhenState): void {
	if (state.result) {
		state.resolver?.();
	} else {
		state.rejecter?.();
	}
}

function onCallback(condition: () => boolean, state: WhenState): void {
	try {
		const result = condition();

		if (result) {
			state.result = true;

			state.timer.stop();
		}
	} catch (error: unknown) {
		state.rejecter?.();
	}
}

function onWhen(type: WorkHandlerType, instance: When, state: WhenState): When {
	state.timer?.[type]?.();

	return instance;
}

function pauseWhen(this: InternalWhen): When {
	return onWhen(WORK_PAUSE, this, this[SYMBOL]);
}

function startWhen(this: InternalWhen, resolve?: (() => void) | null): Promise<void> {
	const state = this[SYMBOL];

	if (state.started) {
		throw new Error(MESSAGE_STARTED);
	}

	state.started = true;

	state.timer.start();

	return state.promise.then(resolve);
}

function stopWhen(this: InternalWhen): When {
	return onWhen(WORK_STOP, this, this[SYMBOL]);
}

/**
 * Create a conditional timer
 * @param condition Condition to check
 * @param options Timer options
 * @returns Timer instance
 */
export function when(condition: () => boolean, options?: Partial<WhenOptions>): When {
	// @ts-expect-error All good, no worries :-)
	return new When(condition, getWhenOptions(options));
}

// #endregion
