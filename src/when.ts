import {noop} from '@oscarpalmer/atoms/function';
import {destroyedMessage, milliseconds, startedMessage} from './constants';
import {getValidNumber} from './get';
import './global';
import {TimerTrace, type WhenOptions, type WhenState} from './models';
import {Timer} from './timer';

class When {
	private readonly $timer = 'when';
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
		return globalThis._oscarpalmer_timer_debug ?? false
			? this.state.timer?.trace
			: undefined;
	}

	constructor(condition: () => boolean, options?: Partial<WhenOptions>) {
		const {state} = this;

		state.promise = new Promise<void>((resolve, reject) => {
			state.resolver = resolve;
			state.rejecter = reject;
		});

		let result = false;

		this.state.timer = new Timer(
			'when',
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
				interval: getValidNumber(options?.interval, milliseconds),
				timeout: getValidNumber(options?.timeout),
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
		const {state} = this;

		if (state.timer == null) {
			throw new Error(destroyedMessage);
		}

		if (state.started) {
			throw new Error(startedMessage);
		}

		state.started = true;

		state.timer.start();

		return state.promise.then(resolve ?? noop, reject ?? noop);
	}
}

/**
 * Create a conditional timer
 */
export function when(
	condition: () => boolean,
	options?: Partial<WhenOptions>,
): When {
	return new When(condition, options);
}

export type {When};
