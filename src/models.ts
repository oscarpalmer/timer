import type {Timer} from './timer';

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

export type TimerType = 'repeat' | 'wait' | 'when';

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
	type: TimerType;
};

export type WorkHandlerType = 'continue' | 'pause' | 'restart' | 'start' | 'stop';
