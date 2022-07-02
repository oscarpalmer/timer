type RepeatedCallback = (index: number) => void;
type WaitedCallback = () => void;

abstract class Timed<Callback> {
	private frame: number | undefined;
	private stopped = false;

	constructor(
		private readonly callback: Callback,
		private readonly time: number,
		private readonly count: number,
	) {
		Timed.run(this);
	}

	restart(): void {
		this.stop();

		this.stopped = false;

		Timed.run(this);
	}

	start(): void {
		if (this.stopped) {
			Timed.run(this);
		}
	}

	stop(): void {
		this.stopped = true;

		if (typeof this.frame === 'undefined') {
			return;
		}

		window.cancelAnimationFrame(this.frame);

		this.frame = undefined;
	}

	private static run(timed: Timed<(index: number | undefined) => void>): void {
		const repeated = timed.count > 1;

		let count = 0;

		let start: DOMHighResTimeStamp | undefined;

		function step(timestamp: DOMHighResTimeStamp): void {
			if (timed.stopped) {
				return;
			}

			start ??= timestamp;

			const elapsed = timestamp - start;

			if (elapsed >= timed.time) {
				if (!timed.stopped) {
					timed.callback(repeated ? count : undefined);
				}

				count += 1;

				if (timed.count > 1 && count < timed.count) {
					start = undefined;
				} else {
					return;
				}
			}

			timed.frame = window.requestAnimationFrame(step);
		}

		timed.frame = window.requestAnimationFrame(step);
	}
}

export class Repeated extends Timed<RepeatedCallback> {}
export class Waited extends Timed<WaitedCallback> {}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Timer {
	static repeat(callback: RepeatedCallback, time: number, count: number): Repeated {
		return new Repeated(callback, time, count);
	}

	static wait(callback: WaitedCallback, time: number): Waited {
		return new Waited(callback, time, 1);
	}
}
