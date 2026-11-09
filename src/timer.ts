import {SYMBOL, WORK_CONTINUE, WORK_PAUSE, WORK_RESTART, WORK_START, WORK_STOP} from './constants';
import {updatePrototype} from './misc';
import type {Timer, TimerName, TimerOptions, TimerState} from './models';
import {work} from './work';

// #region Types

type InternalTimer = {
	[SYMBOL]: TimerState;
} & Timer;

// #endregion

// #region Instances

function Timer(
	this: InternalTimer,
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
		elapsed: 0,
		frame: undefined,
		index: 0,
		paused: false,
		timer: this,
		total: 0,
	};

	if (start) {
		startTimer.call(this);
	}
}

updatePrototype(Timer, {
	continue: continueTimer,
	pause: pauseTimer,
	restart: restartTimer,
	start: startTimer,
	stop: stopTimer,
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
