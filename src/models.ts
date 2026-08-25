/**
 * Options for a repeating timer
 */
export type RepeatOptions = {
	/**
	 * Callback to be called when the timer has stopped, either manually or by completing its work
	 */
	onAfter: (finished: boolean) => void;
	/**
	 * Callback to be called after the timer has timed out
	 */
	onTimeout: () => void;
	/**
	 * How many times the timer should repeat
	 */
	count: number;
	/**
	 * The interval between each repeat
	 */
	interval: number;
	/**
	 * The timeout for the timer _(any value above `0` will enable the timeout)_
	 */
	timeout: number;
};

export type Timer = {
	/**
	 * Is the timer active?
	 */
	get active(): boolean;

	/**
	 * Is the timer destroyed?
	 */
	get destroyed(): boolean;

	/**
	 * Is the timer paused?
	 */
	get paused(): boolean;

	/**
	 * Get the timer's origin _(if debugging is enabled)_
	 */
	get trace(): string | undefined;

	/**
	 * Continue running the timer _(if it's paused)_
	 */
	continue(): Timer;

	/**
	 * Destroy the timer
	 */
	destroy(): void;

	/**
	 * Pause the timer _(if it's running)_
	 */
	pause(): Timer;

	/**
	 * Restart the timer _(or start it, if it's not running)_
	 */
	restart(): Timer;

	/**
	 * Start the timer _(if it's not running)_
	 */
	start(): Timer;

	/**
	 * Stop the timer _(if it's running)_
	 */
	stop(): Timer;
};

export type TimerName = 'repeat' | 'wait' | 'when';

export type TimerOptions = {
	onAfter: ((finished: boolean) => void) | undefined;
	onError: (() => void) | undefined;
	count: number;
	interval: number;
	timeout: number;
};

export type TimerState = {
	active: boolean;
	callback: () => void;
	destroyed: boolean;
	elapsed: number;
	frame: number | undefined;
	index: number;
	paused: boolean;
	total: number;
	trace: string | undefined;
};

export class TimerTrace extends Error {
	constructor() {
		super();

		this.name = 'TimerTrace';
	}
}

export type When = {
	/**
	 * Is the timer active?
	 */
	get active(): boolean;

	/**
	 * Is the timer destroyed?
	 */
	get destroyed(): boolean;

	/**
	 * Is the timer paused?
	 */
	get paused(): boolean;

	/**
	 * Get the timer's origin _(if debugging is enabled)_
	 */
	get trace(): string | undefined;

	/**
	 * Continues the timer _(if it was paused)_
	 */
	continue(): When;

	/**
	 * Destroys the timer _(and stops it,if it was running)_
	 */
	destroy(): void;

	/**
	 * Pauses the timer _(if it was running)_
	 */
	pause(): When;

	/**
	 * Start the timer
	 *
	 * @param resolve Optional resolve callback
	 * @returns Promise that resolves when the condition is met
	 */
	start(resolve?: (() => void) | null): Promise<void>;

	/**
	 * Stops the timer _(if it was running)_
	 */
	stop(): When;
};

/**
 * Options for a conditional timer
 */
export type WhenOptions = {
	/**
	 * How many times the timer should check the condition
	 */
	count: number;
	/**
	 * Then interval between each condtional check
	 */
	interval: number;
	/**
	 * The timeout for the timer _(any value above `0` will enable the timeout)_
	 */
	timeout: number;
};

export type WhenState = {
	promise: Promise<void>;
	rejecter?: () => void;
	resolver?: () => void;
	result: boolean;
	started: boolean;
	timer: Timer;
};

export type WorkHandler = (
	type: WorkHandlerType,
	timer: WorkHandlerTimer,
	state: TimerState,
	options: TimerOptions,
) => Timer;

export type WorkHandlerTimer = {
	instance: Timer;
	name: TimerName;
};

export type WorkHandlerType = 'continue' | 'pause' | 'restart' | 'start' | 'stop';
