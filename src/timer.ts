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
) {
	Object.defineProperty(this, SYMBOL, {
		value: {
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
		},
	});

	if (start) {
		startTimer.call(this);
	}
}

Object.defineProperties(Timer.prototype, {
	active: {
		enumerable: true,
		get() {
			return isActiveTimer.call(this);
		},
	},
	continue: {
		value: continueTimer,
	},
	pause: {
		value: pauseTimer,
	},
	paused: {
		enumerable: true,
		get() {
			return isPausedTimer.call(this);
		},
	},
	restart: {
		value: restartTimer,
	},
	start: {
		value: startTimer,
	},
	stop: {
		value: stopTimer,
	},
	trace: {
		get() {
			return getTimerTrace.call(this);
		},
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

function getTimerTrace(this: InternalTimer): string | undefined {
	return (globalThis._oscarpalmer_timer_debug ?? false) ? this[SYMBOL].trace : undefined;
}

function isActiveTimer(this: InternalTimer): boolean {
	return this[SYMBOL].active && !this[SYMBOL].paused;
}

function isPausedTimer(this: InternalTimer): boolean {
	return this[SYMBOL].paused;
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
