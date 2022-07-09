type RepeatedCallback = (index: number) => void;
type TimerType = 'repeated' | 'waited';
type WaitedCallback = () => void;

const milliseconds = 1000 / 60;

abstract class Timed<Callback> {
	private readonly callback: Callback;
	private readonly count: number;
	private frame: number | undefined;
	private running = false;
	private readonly time: number;
	private readonly type: TimerType;

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

	restart(): Timed<Callback> {
		this.stop();

		Timed.run(this as never);

		return this;
	}

	start(): Timed<Callback> {
		if (this.running) {
			return this;
		}

		Timed.run(this as never);

		return this;
	}

	stop(): Timed<Callback> {
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

export class Repeated extends Timed<RepeatedCallback> {
	constructor(callback: RepeatedCallback, time: number, count: number) {
		super('repeated', callback, time, count);
	}
}

export class Waited extends Timed<WaitedCallback> {
	constructor(callback: WaitedCallback, time: number) {
		super('waited', callback, time, 1);
	}
}

export const Timer = {
	repeat: (callback: RepeatedCallback, time: number, count: number): Repeated => {
		return (new Repeated(callback, time, count)).start();
	},

	wait: (callback: WaitedCallback, time: number): Waited => {
		return (new Waited(callback, time)).start();
	},
}
