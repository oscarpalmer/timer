import {FRAME_RATE_MS, TYPE_WAIT} from './constants';
import {getCallback, getValidNumber} from './get';
import './global';
import {TimerTrace} from './models';
import {Timer} from './timer';

/**
 * Create a waiting timer
 * @param callback Callback to run when the timer has finished
 * @param time How long to wait for _(in milliseconds; defaults to screen refresh rate)_
 */
export function wait(callback: () => void, time?: number): Timer {
	return new Timer(
		TYPE_WAIT,
		{
			callback: getCallback(callback),
			trace: new TimerTrace().stack,
		},
		{
			onAfter: undefined,
			onError: undefined,
			count: -1,
			interval: getValidNumber(time, FRAME_RATE_MS),
			timeout: 0,
		},
		true,
	);
}

export type {Timer};
