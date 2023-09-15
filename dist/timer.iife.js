var Timer = (function (exports) {
    'use strict';

		const callbacks = new WeakMap();
		const configuration = new WeakMap();
		const state = new WeakMap();
		const milliseconds = Math.round(1000 / 60);
		function run(timed) {
			const timedConfiguration = configuration.get(timed);
			const timedCallbacks = callbacks.get(timed);
			const timedState = state.get(timed);
			timedState.active = true;
			timedState.finished = false;
			const isRepeated = timed instanceof Repeated;
			let index = 0;
			let start;
			function step(timestamp) {
				if (!timedState.active) {
					return;
				}
				start ?? (start = timestamp);
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
				timedState.frame = globalThis.requestAnimationFrame(step);
			}
			timedState.frame = globalThis.requestAnimationFrame(step);
		}
		class Timed {
			get active() {
				return state.get(this)?.active ?? false;
			}
			get finished() {
				return !this.active && (state.get(this)?.finished ?? false);
			}
			/**
			 * @param {Callback} callback
			 * @param {number} time
			 * @param {number} count
			 * @param {AfterCallback=} afterCallback
			 */
			constructor(callback, time, count, afterCallback) {
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
				callbacks.set(this, {
					after: afterCallback,
					default: callback,
				});
				configuration.set(this, {count, time});
				state.set(this, {
					active: false,
					finished: false,
				});
			}
			restart() {
				this.stop();
				run(this);
				return this;
			}
			start() {
				if (!this.active) {
					run(this);
				}
				return this;
			}
			stop() {
				const timedCallbacks = callbacks.get(this);
				const timedState = state.get(this);
				timedState.active = false;
				if (timedState.frame === undefined) {
					return this;
				}
				globalThis.cancelAnimationFrame(timedState.frame);
				timedCallbacks.after?.(this.finished);
				timedState.frame = undefined;
				return this;
			}
		}
		/**
		 * A timer that waits and runs repeatedly
		 */
		class Repeated extends Timed {}
		/**
		 * A timer that waits and runs once
		 */
		class Waited extends Timed {
			/**
			 * Creates a new waited timer
			 * @param {() => void} callback
			 * @param {number} time
			 */
			constructor(callback, time) {
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
		function repeat(callback, time, count, afterCallback) {
			return new Repeated(callback, time, count, afterCallback).start();
		}
		/**
		 * Creates and starts a new waited timer
		 * @param {() => void} callback
		 * @param {number} time
		 * @return {Waited}
		 */
		function wait(callback, time) {
			return new Waited(callback, time).start();
		}

		exports.Repeated = Repeated;
		exports.Waited = Waited;
		exports.repeat = repeat;
		exports.wait = wait;

		return exports;

})({});
