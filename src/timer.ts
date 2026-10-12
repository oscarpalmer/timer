import {SYMBOL, WORK_CONTINUE, WORK_PAUSE, WORK_RESTART, WORK_START, WORK_STOP} from './constants';
import type {Timer, TimerName, TimerOptions, TimerState} from './models';
import {work} from './work';

// #region Types

type InternalTimer = {
	[SYMBOL]: TimerState;
} & Timer;

// #endregion

// #region Instances

function Timer(
	this: any,
	name: TimerName,
	state: Pick<TimerState, 'callback' | 'trace'>,
	options: TimerOptions,
	start: boolean,
): void {
	this[SYMBOL] = {
		...state,
		name,
		options,
		active: false,
		destroyed: false,
		elapsed: 0,
		frame: undefined,
		index: 0,
		paused: false,
		timer: undefined as never,
		total: 0,
	};

	if (start) {
		startTimer.call(this);
	}
}

Timer.prototype.continue = continueTimer;
Timer.prototype.pause = pauseTimer;
Timer.prototype.restart = restartTimer;
Timer.prototype.start = startTimer;
Timer.prototype.stop = stopTimer;

Object.defineProperties(Timer.prototype, {
	active: {
		enumerable: true,
		get: getTimerActive,
	},
	paused: {
		enumerable: true,
		get: getTimerPaused,
	},
	trace: {
		enumerable: true,
		get: getTimerTrace,
	},
});

// #endregion

// #region Functions

function continueTimer(this: InternalTimer): Timer {
	return work(WORK_CONTINUE, this[SYMBOL]);
}

export function createTimer(
	name: TimerName,
	state: Pick<TimerState, 'callback' | 'trace'>,
	options: TimerOptions,
	start: boolean,
): Timer {
	// @ts-expect-error All good, no worries :-)
	return new Timer(name, state, options, start);
}

function getTimerActive(this: InternalTimer): boolean {
	return this[SYMBOL].active && !this[SYMBOL].paused;
}

function getTimerPaused(this: InternalTimer): boolean {
	return this[SYMBOL].paused;
}

function getTimerTrace(this: InternalTimer): string | undefined {
	return (globalThis._oscarpalmer_timer_debug ?? false) ? this[SYMBOL].trace : undefined;
}

function pauseTimer(this: InternalTimer): Timer {
	return work(WORK_PAUSE, this[SYMBOL]);
}

function restartTimer(this: InternalTimer): Timer {
	return work(WORK_RESTART, this[SYMBOL]);
}

function startTimer(this: InternalTimer): Timer {
	return work(WORK_START, this[SYMBOL]);
}

function stopTimer(this: InternalTimer): Timer {
	return work(WORK_STOP, this[SYMBOL]);
}

// #endregion
