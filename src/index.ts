type RepeatedCallback = (index: number) => void;
type WaitedCallback = () => void;

const milliseconds = Math.round(1000 / 60);

const cancel = cancelAnimationFrame ?? function (id: number): void {
	clearTimeout?.(id);
};

const request = requestAnimationFrame ?? function (callback: FrameRequestCallback): number {
	return (setTimeout?.(() => {
		callback(Date.now());
	}, milliseconds) ?? -1) as unknown as number;
};

abstract class Timed<Callback> {
	private readonly callback: Callback;
	private readonly count: number;
	private frame: number | undefined;
	private running = false;
	private readonly time: number;

	/**
	 * Is the timer active?
	 */
	get active(): boolean {
		return this.running;
	}

	constructor(callback: Callback, time: number,	count: number) {
		const isRepeated = this instanceof Repeated;
		const type = isRepeated ? 'repeated' : 'waited';

		if (typeof callback !== 'function') {
			throw new Error(`A ${type} timer must have a callback function`);
		}

		if (typeof time !== 'number' || time < 0) {
			throw new Error(`A ${type} timer must have a non-negative number as its time`);
		}

		if (isRepeated && (typeof count !== 'number' || count < 2)) {
			throw new Error('A repeated timer must have a number above 1 as its repeat count');
		}

		this.callback = callback;
		this.count = count;
		this.time = time;
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
					timed.callback(timed instanceof Repeated ? count : undefined);
				}

				count += 1;

				if ((timed instanceof Repeated) && count < timed.count) {
					start = undefined;
				} else {
					timed.stop();

					return;
				}
			}

			timed.frame = request(step);
		}

		timed.frame = request(step);
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

		cancel(this.frame);

		this.frame = undefined;

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
export function repeat(callback: RepeatedCallback, time: number, count: number): Repeated {
	return (new Repeated(callback, time, count)).start();
}

/**
 * Create and start a new waited timer
 */
export function wait(callback: WaitedCallback, time: number): Waited {
	return (new Waited(callback, time)).start();
}
