type RepeatedCallback = (index: number) => void;
type TimerType = 'repeated' | 'waited';
type WaitedCallback = () => void;

const milliseconds = Math.round(1000 / 60);

abstract class Timed<Callback> {
	private readonly callback: Callback;
	private readonly count: number;
	private frame: number | undefined;
	private running = false;
	private readonly time: number;
	private readonly type: TimerType;

	/**
	 * Is the timer active?
	 */
	get active(): boolean {
		return this.running;
	}

	protected constructor(type: TimerType, callback: Callback, time: number,	count: number) {
		if (typeof callback !== 'function') {
			throw new Error(`A ${type} timer must have a callback function`);
		}

		if (typeof time !== 'number' || time < 0) {
			throw new Error(`A ${type} timer must have a non-negative number as its time`);
		}

		if (type === 'repeated' && (typeof count !== 'number' || count < 2)) {
			throw new Error(`A ${type} timer must have a number above 1 as its repeat count`);
		}

		this.type = type;
		this.callback = callback;
		this.time = time;
		this.count = count;
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
		if (this.running) {
			return this;
		}

		Timed.run(this as never);

		return this;
	}

	/**
	 * Stop timer
	 */
	stop(): this {
		this.running = false;

		if (typeof this.frame === 'undefined') {
			return this;
		}

		window.cancelAnimationFrame(this.frame);

		this.frame = undefined;

		return this;
	}

	private static run(timed: Timed<(index: number | undefined) => void>): void {
		timed.running = true;

		let count = 0;

		let start: DOMHighResTimeStamp | undefined;

		function step(timestamp: DOMHighResTimeStamp): void {
			if (!timed.running) {
				return;
			}

			start ??= timestamp;

			const elapsed = timestamp - start;

			const elapsedMinimum = elapsed - milliseconds;
			const elapsedMaximum = elapsed + milliseconds;

			if (elapsedMinimum < timed.time && timed.time < elapsedMaximum) {
				if (timed.running) {
					timed.callback(timed.type === 'repeated' ? count : undefined);
				}

				count += 1;

				if (timed.type === 'repeated' && count < timed.count) {
					start = undefined;
				} else {
					timed.stop();

					return;
				}
			}

			timed.frame = window.requestAnimationFrame(step);
		}

		timed.frame = window.requestAnimationFrame(step);
	}
}

/**
 * A repeated timer
 */
export class Repeated extends Timed<RepeatedCallback> {
	constructor(callback: RepeatedCallback, time: number, count: number) {
		super('repeated', callback, time, count);
	}
}

/**
 * A waited timer
 */
export class Waited extends Timed<WaitedCallback> {
	constructor(callback: WaitedCallback, time: number) {
		super('waited', callback, time, 1);
	}
}

/**
 * Create and start a new repeated timer
 */
export function repeat(callback: RepeatedCallback, time: number, count: number): Repeated {
	return (new Repeated(callback, time, count)).start();
}

/**
 * Create and start a new waited timer
 */
export function wait(callback: WaitedCallback, time: number): Waited {
	return (new Waited(callback, time)).start();
}
