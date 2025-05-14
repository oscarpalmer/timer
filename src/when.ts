import {noop} from '@oscarpalmer/atoms/function';
import {destroyedMessage, milliseconds, startedMessage} from './constants';
import {getValidNumber} from './get';
import {TimerTrace, type WhenOptions, type WhenState} from './models';
import {Timer} from './timer';
import {work} from './work';

class When {
	private readonly $timer = 'when';
	private readonly state: WhenState;

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
		return globalThis._oscarpalmer_timer_debug ?? false
			? this.state.timer?.trace
			: undefined;
	}

	constructor(state: WhenState) {
		this.state = state;
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
		this.state.timer?.destroy();

		this.state.promise = undefined as never;
		this.state.resolver = noop;
		this.state.rejecter = noop;
		this.state.timer = undefined as never;
	}

	/**
	 * Pauses the timer _(if it was running)_
	 */
	pause(): When {
		this.state.timer?.pause();

		return this;
	}

	/**
	 * Stops the timer _(if it was running)_
	 */
	stop(): When {
		this.state.timer?.stop();

		return this;
	}

	/**
	 * Starts the timer and returns a promise that resolves when the condition is met
	 */
	// biome-ignore lint/suspicious/noThenProperty: returning a promise-like object, so it's ok ;)
	then(
		resolve?: (() => void) | null,
		reject?: (() => void) | null,
	): Promise<void> {
		if (this.state.timer == null || this.state?.started) {
			throw new Error(
				this.state.timer == null ? destroyedMessage : startedMessage,
			);
		}

		this.state.started = true;

		this.state.timer.start();

		return this.state.promise.then(resolve ?? noop, reject ?? noop);
	}
}

/**
 * Create a conditional timer
 */
export function when(
	condition: () => boolean,
	options?: Partial<WhenOptions>,
): When {
	let called = false;
	let result = false;

	const state: WhenState = {
		started: false,
		timer: new Timer(
			'when',
			work,
			{
				callback() {
					if (condition()) {
						result = true;

						state.timer.stop();
					}
				},
				trace: new TimerTrace().stack,
			},
			{
				onAfter() {
					if (!(state.timer?.paused ?? false) && !called) {
						called = true;

						if (result) {
							state.resolver?.();
						} else {
							state.rejecter?.();
						}

						instance.destroy();
					}
				},
				onError() {
					state.rejecter?.();

					instance.destroy();
				},
				count: getValidNumber(options?.count),
				interval: getValidNumber(options?.interval, milliseconds),
				timeout: getValidNumber(options?.timeout),
			},
			false,
		),
	} as never;

	const promise = new Promise<void>((resolve, reject) => {
		state.resolver = resolve;
		state.rejecter = reject;
	});

	state.promise = promise;

	const instance = new When(state);

	return instance;
}

export type {When};
