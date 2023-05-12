const milliseconds = Math.round(1000 / 60);

const request = globalThis.requestAnimationFrame ?? function (callback) {
	return setTimeout?.(() => {
		callback(Date.now());
	}, milliseconds);
};

/**
 * @param {Timed} timed
 */
function run(timed) {
	timed.state.active = true;
	timed.state.finished = false;

	const isRepeated = timed instanceof Repeated;

	let count = 0;

	let start;

	function step(timestamp) {
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

class Timed {
	/**
	 * @readonly
	 * @type {{after?: Function; default: Function}}
	 */
	callbacks;

	/**
	 * @readonly
	 * @type {{count: number; time: number}}
	 */
	configuration;

	/**
	 * @readonly
	 * @type {{active: boolean; finished: boolean; frame?: DOMHighResTimeStamp}}
	 */
	state;

	/** */

	get active() {
		return this.state.active;
	}

	get finished() {
		return !this.active && this.state.finished;
	}

	/**
	 * @param {Function} callback
	 * @param {number} time
	 * @param {number} count
	 * @param {Function?} afterCallback
	 */
	constructor(callback, time, count, afterCallback) {
		const isRepeated = this instanceof Repeated;

		const type = isRepeated
			? 'repeated'
			: 'waited';

		if (typeof callback !== 'function') {
			throw new TypeError(`A ${type} timer must have a callback function`);
		}

		if (typeof time !== 'number' || time < 0) {
			throw new TypeError(`A ${type} timer must have a non-negative number as its time`);
		}

		if (isRepeated && (typeof count !== 'number' || count < 2)) {
			throw new TypeError('A repeated timer must have a number above 1 as its repeat count');
		}

		if (isRepeated && afterCallback !== undefined && typeof afterCallback !== 'function') {
			throw new TypeError('A repeated timer\'s after-callback must be a function');
		}

		this.configuration = {count, time};

		this.callbacks = {
			after: afterCallback,
			default: callback,
		};

		this.state = {
			active: false,
			finished: false,
			frame: null,
		};
	}

	restart() {
		this.stop();

		run(this);

		return this;
	}

	start() {
		if (!this.state.active) {
			run(this);
		}

		return this;
	}

	stop() {
		this.state.active = false;

		if (this.state.frame === undefined) {
			return this;
		}

		(globalThis.cancelAnimationFrame ?? clearTimeout)?.(this.state.frame);

		this.callbacks.after?.(this.finished);

		this.state.frame = undefined;

		return this;
	}
}

export class Repeated extends Timed {}

export class Waited extends Timed {
	/**
	 * @param {Function} callback
	 * @param {number} time
	 */
	constructor(callback, time) {
		super(callback, time, 1, null);
	}
}

/**
 * @param {Function} callback
 * @param {number} time
 * @param {number} count
 * @param {Function?} afterCallback
 * @return {Repeated} A repeated timer
 */
export function repeat(callback, time, count, afterCallback) {
	return (new Repeated(callback, time, count, afterCallback)).start();
}

/**
 * @param {Function} callback
 * @param {number} time
 * @return {Waited} A waited timer
 */
export function wait(callback, time) {
	return (new Waited(callback, time)).start();
}
