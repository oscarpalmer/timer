import {noop} from '@oscarpalmer/atoms/function';
import {WORK_CONTINUE, WORK_PAUSE, WORK_RESTART, WORK_START, WORK_STOP} from './constants';
import type {TimerOptions, TimerState, TimerType, WorkHandlerType} from './models';
import {stop, work} from './work';

export class Timer {
	declare private readonly $timer: TimerType;

	protected readonly state: TimerState;

	/**
	 * Is the timer active?
	 */
	get active(): boolean {
		return this.state.active;
	}

	/**
	 * Is the timer destroyed?
	 */
	get destroyed(): boolean {
		return this.state.destroyed;
	}

	/**
	 * Is the timer paused?
	 */
	get paused(): boolean {
		return this.state.paused;
	}

	/**
	 * Get the timer's origin _(if debugging is enabled)_
	 */
	get trace(): string | undefined {
		return (globalThis._oscarpalmer_timer_debug ?? false) ? this.state.trace : undefined;
	}

	constructor(
		type: TimerType,
		state: Pick<TimerState, 'callback' | 'trace'>,
		protected readonly options: TimerOptions,
		start: boolean,
	) {
		Object.defineProperty(this, '$timer', {
			value: type,
		});

		this.state = {
			...state,
			active: false,
			destroyed: false,
			elapsed: 0,
			frame: undefined,
			index: 0,
			paused: false,
			total: 0,
		};

		if (start) {
			this.start();
		}
	}

	/**
	 * Continue running the timer _(if it's paused)_
	 */
	continue(): Timer {
		return this.#work(WORK_CONTINUE);
	}

	/**
	 * Destroy the timer
	 */
	destroy(): void {
		this.state.destroyed = true;

		this.options.onAfter = noop;
		this.options.onError = noop;
		this.state.callback = noop;

		if (!globalThis._oscarpalmer_timer_debug) {
			this.state.trace = undefined;
		}

		stop(
			{
				instance: this,
				type: this.$timer,
			},
			this.state,
			this.options,
		);
	}

	/**
	 * Pause the timer _(if it's running)_
	 */
	pause(): Timer {
		return this.#work(WORK_PAUSE);
	}

	/**
	 * Restart the timer _(or start it, if it's not running)_
	 */
	restart(): Timer {
		return this.#work(WORK_RESTART);
	}

	/**
	 * Start the timer _(if it's not running)_
	 */
	start(): Timer {
		return this.#work(WORK_START);
	}

	/**
	 * Stop the timer _(if it's running)_
	 */
	stop(): Timer {
		return this.#work(WORK_STOP);
	}

	#work(type: WorkHandlerType): Timer {
		return work(
			type,
			{
				instance: this,
				type: this.$timer,
			},
			this.state,
			this.options,
		);
	}
}
