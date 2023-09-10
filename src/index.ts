type Callbacks = {
	after: AfterCallback | undefined;
	default: (index?: number) => void;
};

type Configuration = {
	count: number;
	time: number;
};

/**
 * @param {boolean} finished Did the timer finish?
 */
export type AfterCallback = (finished: boolean) => void;

/**
 * @param {number} index The index of the current iteration
 */
export type RepeatedCallback = (index: number) => void;

type State = {
	active: boolean;
	finished: boolean;
	frame?: DOMHighResTimeStamp;
};

const callbacks = new WeakMap<Timed<never, never>, Callbacks>();
const configuration = new WeakMap<Timed<never, never>, Configuration>();
const state = new WeakMap<Timed<never, never>, State>();

const milliseconds = Math.round(1000 / 60);

const request =
	requestAnimationFrame ??
	function (callback) {
		return setTimeout?.(() => {
			callback(Date.now());
		}, milliseconds);
	};

function run(timed: Timed<never, never>): void {
	const timedConfiguration = configuration.get(timed)!;
	const timedCallbacks = callbacks.get(timed)!;
	const timedState = state.get(timed)!;

	timedState.active = true;
	timedState.finished = false;

	const isRepeated = timed instanceof Repeated;

	let index = 0;

	let start;

	function step(timestamp: DOMHighResTimeStamp) {
		if (!timedState.active) {
			return;
		}

		start ??= timestamp;

		const elapsed = timestamp - start;

		const elapsedMinimum = elapsed - milliseconds;
		const elapsedMaximum = elapsed + milliseconds;

		if (
			elapsedMinimum < timedConfiguration.time &&
			timedConfiguration.time < elapsedMaximum
		) {
			if (timedState.active) {
				timedCallbacks.default(isRepeated ? index : undefined);
			}

			index += 1;

			if (isRepeated && index < timedConfiguration.count) {
				start = undefined;
			} else {
				timedState.finished = true;

				timed.stop();

				return;
			}
		}

		timedState.frame = request(step) as never;
	}

	timedState.frame = request(step) as never;
}

class Timed<Type, Callback> {
	get active(): boolean {
		return state.get(this as never)?.active ?? false;
	}

	get finished(): boolean {
		return !this.active && (state.get(this as never)?.finished ?? false);
	}

	/**
	 * @param {Callback} callback
	 * @param {number} time
	 * @param {number} count
	 * @param {AfterCallback=} afterCallback
	 */
	constructor(
		callback: () => void | ((index: number) => void),
		time: number,
		count: number,
		afterCallback?: AfterCallback,
	) {
		const isRepeated = this instanceof Repeated;

		const type = isRepeated ? 'repeated' : 'waited';

		if (typeof callback !== 'function') {
			throw new TypeError(`A ${type} timer must have a callback function`);
		}

		if (typeof time !== 'number' || time < 0) {
			throw new TypeError(
				`A ${type} timer must have a non-negative number as its time`,
			);
		}

		if (isRepeated && (typeof count !== 'number' || count < 2)) {
			throw new TypeError(
				'A repeated timer must have a number above 1 as its repeat count',
			);
		}

		if (
			isRepeated &&
			afterCallback !== undefined &&
			typeof afterCallback !== 'function'
		) {
			throw new TypeError(
				"A repeated timer's after-callback must be a function",
			);
		}

		callbacks.set(this as never, {
			after: afterCallback,
			default: callback,
		});

		configuration.set(this as never, {count, time});

		state.set(this as never, {
			active: false,
			finished: false,
			frame: undefined,
		});
	}

	restart(): Type {
		this.stop();

		run(this as never);

		return this as never;
	}

	start(): Type {
		if (!this.active) {
			run(this as never);
		}

		return this as never;
	}

	stop(): Type {
		const timedCallbacks = callbacks.get(this as never)!;
		const timedState = state.get(this as never)!;

		timedState.active = false;

		if (timedState.frame === undefined) {
			return this as never;
		}

		(cancelAnimationFrame ?? clearTimeout)?.(timedState.frame);

		timedCallbacks.after?.(this.finished);

		timedState.frame = undefined;

		return this as never;
	}
}

/**
 * A timer that waits and runs repeatedly
 */
export class Repeated extends Timed<Repeated, RepeatedCallback> {}

/**
 * A timer that waits and runs once
 */
export class Waited extends Timed<Waited, () => void> {
	/**
	 * Creates a new waited timer
	 * @param {() => void} callback
	 * @param {number} time
	 */
	constructor(callback: () => void, time: number) {
		super(callback, time, 1);
	}
}

/**
 * Creates and starts a new repeated timer
 * @param {RepeatedCallback} callback
 * @param {number} time
 * @param {number} count
 * @param {AfterCallback=} afterCallback
 * @return {Repeated}
 */
export function repeat(
	callback: RepeatedCallback,
	time: number,
	count: number,
	afterCallback?: AfterCallback,
): Repeated {
	return new Repeated(callback as never, time, count, afterCallback).start();
}

/**
 * Creates and starts a new waited timer
 * @param {() => void} callback
 * @param {number} time
 * @return {Waited}
 */
export function wait(callback: () => void, time: number): Waited {
	return new Waited(callback, time).start();
}
