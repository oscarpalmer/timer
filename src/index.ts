export type AfterCallback = (finished: boolean) => void;

type Callbacks = {
	after: AfterCallback | undefined;
	default: IndexedCallback;
};

type Configuration = {
	callbacks: Callbacks;
	count: number;
	time: number;
};

type IndexedCallback = (index: number) => void;

type State = {
	active: boolean;
	finished: boolean;
	frame?: number;
};

const milliseconds = Math.round(1000 / 60);

function run(timer: Timer): void {
	// @ts-expect-error Keep private status, but allow access
	const {_configuration, _state} = timer;

	_state.active = true;
	_state.finished = false;

	const isRepeated = _configuration.count > 1;

	let index = 0;

	let start;

	function step(timestamp: DOMHighResTimeStamp): void {
		if (!_state.active) {
			return;
		}

		start ??= timestamp;

		const elapsed = timestamp - start;

		const elapsedMinimum = elapsed - milliseconds;
		const elapsedMaximum = elapsed + milliseconds;

		if (
			elapsedMinimum < _configuration.time &&
			_configuration.time < elapsedMaximum
		) {
			if (_state.active) {
				_configuration.callbacks.default(index);
			}

			index += 1;

			if (isRepeated && index < _configuration.count) {
				start = undefined;
			} else {
				_state.finished = true;

				timer.stop();

				return;
			}
		}

		_state.frame = requestAnimationFrame(step);
	}

	_state.frame = requestAnimationFrame(step);
}

export class Timer {
	private declare readonly _configuration: Configuration;
	private declare readonly _state: State;

	get active(): boolean {
		return this._state.active;
	}

	get finished(): boolean {
		return this._state.finished;
	}

	/**
	 * @param {Callback} callback
	 * @param {number} time
	 * @param {number} count
	 * @param {AfterCallback=} afterCallback
	 */
	constructor(
		callback: IndexedCallback,
		time?: number,
		count?: number,
		afterCallback?: AfterCallback,
	) {
		if (typeof callback !== 'function') {
			throw new TypeError('A timer must have a callback function');
		}

		const actualTime = typeof time === 'number' ? time : 0;

		if (actualTime < 0) {
			throw new TypeError(
				'A timer must have a non-negative number as its time',
			);
		}

		const actualCount = typeof count === 'number' ? count : 1;

		if (actualCount < 1) {
			throw new TypeError(
				'A timer must have a number greater than or equal to 1 as its run count',
			);
		}

		if (
			actualCount > 1 &&
			afterCallback !== undefined &&
			typeof afterCallback !== 'function'
		) {
			throw new TypeError(
				"A repeated timer's after-callback must be a function",
			);
		}

		Object.defineProperty(this, '_configuration', {
			value: {
				callbacks: {
					after: afterCallback,
					default: callback,
				},
				count: actualCount,
				time: actualTime,
			},
		});

		Object.defineProperty(this, '_state', {
			value: {
				active: false,
				finished: false,
			},
		});
	}

	restart(): Timer {
		this.stop();

		run(this);

		return this;
	}

	start(): Timer {
		if (!this._state.active) {
			run(this);
		}

		return this;
	}

	stop(): Timer {
		this._state.active = false;

		if (this._state.frame === undefined) {
			return this;
		}

		cancelAnimationFrame(this._state.frame);

		this._configuration.callbacks.after?.(this._state.finished);

		this._state.frame = undefined;

		return this;
	}
}

/**
 * Creates and starts a new repeated timer
 */
export function repeat(callback: IndexedCallback, count: number): Timer;
export function repeat(
	callback: IndexedCallback,
	count: number,
	afterCallback: AfterCallback,
): Timer;
export function repeat(
	callback: IndexedCallback,
	count: number,
	time: number,
): Timer;
export function repeat(
	callback: IndexedCallback,
	count: number,
	time: number,
	afterCallback: AfterCallback,
): Timer;
export function repeat(
	callback: IndexedCallback,
	count: number,
	afterOrTime?: number | AfterCallback,
	after?: AfterCallback,
): Timer {
	if (typeof count !== 'number' || count < 2) {
		throw new TypeError(
			'A repeated timer must have a number greater than or equal to 2 as its run count',
		);
	}

	const afterOrTimeIsFunction = typeof afterOrTime === 'function';

	return new Timer(
		callback,
		afterOrTimeIsFunction ? 0 : afterOrTime,
		count,
		afterOrTimeIsFunction ? afterOrTime : after,
	).start();
}

/**
 * Creates and starts a new waited timer
 */
export function wait(callback: IndexedCallback, time?: number): Timer {
	return new Timer(callback, time).start();
}
