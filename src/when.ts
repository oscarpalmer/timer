import {noop} from '@oscarpalmer/atoms/function';
import type {WhenOptions, WhenState} from '~/models';
import {BasicTimer, timer} from '~/timer';

const destroyedMessage = 'Timer has already been destroyed';
const startedMessage = 'Timer has already been started';

export class When extends BasicTimer<WhenState> {
	get active() {
		return this.state.timer?.active ?? false;
	}

	get destroyed() {
		return this.state.timer == null;
	}

	get paused() {
		return this.state.timer?.paused ?? false;
	}

	get trace() {
		return this.state.timer?.trace;
	}

	constructor(state: WhenState) {
		super('when', state);
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
 * - Creates a promise that resolves when a condition is met
 * - If the condition is never met in a timely manner, the promise will reject
 */
export function when(
	condition: () => boolean,
	options?: Partial<WhenOptions>,
): When {
	let result = false;

	const state: WhenState = {
		started: false,
		timer: timer(
			'repeat',
			() => {
				if (condition()) {
					result = true;

					state.timer.stop();
				}
			},
			{
				afterCallback() {
					if (!state.timer.paused) {
						if (result) {
							state.resolver?.();
						} else {
							state.rejecter?.();
						}

						instance.destroy();
					}
				},
				errorCallback() {
					state.rejecter?.();

					instance.destroy();
				},
				count: options?.count,
				interval: options?.interval,
				timeout: options?.timeout,
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
