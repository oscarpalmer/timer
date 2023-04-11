type AfterCallback = (finished: boolean) => void;
type RepeatedCallback = (index: number) => void;
type WaitedCallback = () => void;

type Callbacks<Callback> = {
	after?: AfterCallback;
	default: Callback;
};

type Configuration = {
	count: number;
	time: number;
};

type State = {
	active: boolean;
	finished: boolean;
	frame?: number;
};

const milliseconds = Math.round(1000 / 60);

const request = requestAnimationFrame ?? function (callback: FrameRequestCallback): number {
	return (setTimeout?.(() => {
		callback(Date.now());
	}, milliseconds) ?? -1) as unknown as number;
};

abstract class Timed<Callback> {
	readonly callbacks!: Callbacks<Callback>;
	readonly configuration!: Configuration;

	readonly state: State = {
		active: false,
		finished: false,
	};

	/**
	 * Is the timer active?
	 */
	get active(): boolean {
		return this.state.active;
	}

	/**
	 * Has the timer finished?
	 */
  get finished(): boolean {
		return !this.state.active && this.state.finished;
	}

	constructor(callback: Callback, time: number,	count: number, afterCallback?: AfterCallback) {
		const isRepeated = this instanceof Repeated;

		const type = isRepeated
		? 'repeated'
		: 'waited';

		if (typeof callback !== 'function') {
			throw new Error(`A ${type} timer must have a callback function`);
		}

		if (typeof time !== 'number' || time < 0) {
			throw new Error(`A ${type} timer must have a non-negative number as its time`);
		}

		if (isRepeated && (typeof count !== 'number' || count < 2)) {
			throw new Error('A repeated timer must have a number above 1 as its repeat count');
		}

		if (isRepeated && afterCallback != null && typeof afterCallback !== 'function') {
			throw new Error('A repeated timer\'s after-callback must be a function');
		}

		this.configuration = {count, time};

		this.callbacks = {
			after: afterCallback,
			default: callback,
		};
	}

	private static run(timed: Timed<(index: number | undefined) => void>): void {
		timed.state.active = true;
		timed.state.finished = false;

		const isRepeated = timed instanceof Repeated;

		let count = 0;

		let start: DOMHighResTimeStamp | undefined;

		function step(timestamp: DOMHighResTimeStamp): void {
			if (!timed.state.active) {
				return;
			}

			start ??= timestamp;

			const elapsed = timestamp - start;

			const elapsedMinimum = elapsed - milliseconds;
			const elapsedMaximum = elapsed + milliseconds;

			if (elapsedMinimum < timed.configuration.time && timed.configuration.time < elapsedMaximum) {
				if (timed.state.active) {
					timed.callbacks.default(isRepeated ? count : undefined);
				}

				count += 1;

				if (isRepeated && count < timed.configuration.count) {
					start = undefined;
				} else {
					timed.state.finished = true;

					timed.stop();

					return;
				}
			}

			timed.state.frame = request(step);
		}

		timed.state.frame = request(step);
	}

	/**
	 * Restart timer
	 */
	restart(): this {
		this.stop();

		Timed.run(this as never);

		return this;
	}

	/**
	 * Start timer
	 */
	start(): this {
		if (!this.state.active) {
			Timed.run(this as never);
		}

		return this;
	}

	/**
	 * Stop timer
	 */
	stop(): this {
		this.state.active = false;

		if (typeof this.state.frame === 'undefined') {
			return this;
		}

		(cancelAnimationFrame ?? clearTimeout)?.(this.state.frame);

		this.callbacks.after?.(this.finished);

		this.state.frame = undefined;

		return this;
	}
}

/**
 * A repeated timer
 */
export class Repeated extends Timed<RepeatedCallback> {}

/**
 * A waited timer
 */
export class Waited extends Timed<WaitedCallback> {
	constructor(callback: WaitedCallback, time: number) {
		super(callback, time, 1);
	}
}

/**
 * Create and start a new repeated timer
 */
export function repeat(callback: RepeatedCallback, time: number, count: number, afterCallback?: AfterCallback): Repeated {
	return (new Repeated(callback, time, count, afterCallback)).start();
}

/**
 * Create and start a new waited timer
 */
export function wait(callback: WaitedCallback, time: number): Waited {
	return (new Waited(callback, time)).start();
}
