import {
	MESSAGE_STARTED,
	SYMBOL,
	TYPE_WHEN,
	WORK_CONTINUE,
	WORK_PAUSE,
	WORK_STOP,
} from './constants';
import './global';
import {getValidNumber, getValidTimeout} from './misc';
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

function When(this: any, condition: () => boolean, options: WhenOptions) {
	const state: WhenState = {
		name: TYPE_WHEN,
		promise: undefined as never,
		result: false,
		started: false,
		timer: undefined as never,
	};

	Object.defineProperty(this, SYMBOL, {
		value: state,
	});

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

Object.defineProperties(When.prototype, {
	active: {
		get() {
			return isActiveWhen.call(this);
		},
	},
	continue: {
		value: continueWhen,
	},
	pause: {
		value: pauseWhen,
	},
	paused: {
		get() {
			return isPausedWhen.call(this);
		},
	},
	start: {
		value: startWhen,
	},
	stop: {
		value: stopWhen,
	},
	trace: {
		get() {
			return getWhenTrace.call(this);
		},
	},
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

function getWhenTrace(this: InternalWhen): string | undefined {
	return (globalThis._oscarpalmer_timer_debug ?? false) ? this[SYMBOL].timer?.trace : undefined;
}

function isActiveWhen(this: InternalWhen): boolean {
	return this[SYMBOL].timer.active;
}

function isPausedWhen(this: InternalWhen): boolean {
	return this[SYMBOL].timer.paused;
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
