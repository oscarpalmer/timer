import {noop} from '@oscarpalmer/atoms/function';
import {FRAME_RATE_MS, MESSAGE_DESTROYED, MESSAGE_STARTED, TYPE_WHEN} from './constants';
import {getValidNumber, getValidTimeout} from './get';
import './global';
import {TimerTrace, type WhenOptions, type WhenState} from './models';
import {Timer} from './timer';

class When {
	private declare readonly $timer: string;

	private readonly state: WhenState = {
		promise: undefined as never,
		rejecter: undefined as never,
		resolver: undefined as never,
		started: false,
		timer: undefined as never,
	};

	/**
	 * Is the timer active?
	 */
	get active() {
		return this.state.timer?.active ?? false;
	}

	/**
	 * Is the timer destroyed?
	 */
	get destroyed() {
		return this.state.timer == null;
	}

	/**
	 * Is the timer paused?
	 */
	get paused() {
		return this.state.timer?.paused ?? false;
	}

	/**
	 * Get the timer's origin _(if debugging is enabled)_
	 */
	get trace(): string | undefined {
		return (globalThis._oscarpalmer_timer_debug ?? false) ? this.state.timer?.trace : undefined;
	}

	constructor(condition: () => boolean, options?: Partial<WhenOptions>) {
		Object.defineProperty(this, '$timer', {
			value: TYPE_WHEN,
		});

		const {state} = this;

		state.promise = new Promise<void>((resolve, reject) => {
			state.resolver = resolve;
			state.rejecter = reject;
		});

		let result = false;

		this.state.timer = new Timer(
			TYPE_WHEN,
			{
				callback(): void {
					try {
						if (condition()) {
							result = true;

							state.timer.stop();
						}
					} catch {
						state.timer.stop();
					}
				},
				trace: new TimerTrace().stack,
			},
			{
				onAfter: () => {
					if (result) {
						state.resolver?.();
					} else {
						state.rejecter?.();
					}

					this.destroy();
				},
				onError: () => {
					state.rejecter?.();

					this.destroy();
				},
				count: getValidNumber(options?.count),
				interval: getValidNumber(options?.interval, FRAME_RATE_MS),
				timeout: getValidTimeout(options?.timeout),
			},
			false,
		);
	}

	/**
	 * Continues the timer _(if it was paused)_
	 */
	continue(): When {
		this.state.timer?.continue();

		return this;
	}

	/**
	 * Destroys the timer _(and stops it,if it was running)_
	 */
	destroy(): void {
		const {state} = this;

		state.timer?.destroy();

		state.promise = undefined as never;
		state.resolver = noop;
		state.rejecter = noop;
		state.timer = undefined as never;
	}

	/**
	 * Pauses the timer _(if it was running)_
	 */
	pause(): When {
		this.state.timer?.pause();

		return this;
	}

	/**
	 * Start the timer
	 * @param resolve Optional resolve callback
	 * @param reject Optional reject callback
	 * @returns Promise that resolves when the condition is met
	 */
	start(resolve?: (() => void) | null, reject?: (() => void) | null): Promise<void> {
		const {state} = this;

		if (state.timer == null) {
			throw new Error(MESSAGE_DESTROYED);
		}

		if (state.started) {
			throw new Error(MESSAGE_STARTED);
		}

		state.started = true;

		state.timer.start();

		return state.promise.then(resolve ?? noop, reject ?? noop);
	}

	/**
	 * Stops the timer _(if it was running)_
	 */
	stop(): When {
		this.state.timer?.stop();

		return this;
	}

	/**
	 * Start the timer
	 * @deprecated Use `start()` instead
	 * @param resolve Optional resolve callback
	 * @param reject Optional reject callback
	 * @returns Promise that resolves when the condition is met
	 */
	// oxlint-disable-next-line no-thenable: Returning a promise-like object, so it's ok ;)
	then(resolve?: (() => void) | null, reject?: (() => void) | null): Promise<void> {
		return this.start(resolve, reject);
	}
}

/**
 * Create a conditional timer
 * @param condition Condition to check
 * @param options Timer options
 * @returns Timer instance
 */
export function when(condition: () => boolean, options?: Partial<WhenOptions>): When {
	return new When(condition, options);
}

export type {When};
