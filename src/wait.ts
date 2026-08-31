import {TYPE_WAIT} from './constants';
import {getCallback, getValidNumber} from './misc';
import './global';
import {type Timer, TimerTrace} from './models';
import {createTimer} from './timer';

/**
 * Create a waiting timer
 *
 * @param callback Callback to run when the timer has finished
 * @param time How long to wait for _(in milliseconds; defaults to screen refresh rate)_
 * @returns Waiting timer
 */
export function wait(callback: () => void, time?: number): Timer {
	return createTimer(
		TYPE_WAIT,
		{
			callback: getCallback(callback),
			trace: new TimerTrace().stack,
		},
		{
			onAfter: undefined,
			onError: undefined,
			count: -1,
			interval: getValidNumber(time),
			timeout: 0,
		},
		true,
	);
}
