import {MILLISECONDS, TYPE_REPEAT} from './constants';
import {getCallback, getValidNumber} from './get';
import './global';
import {type RepeatOptions, TimerTrace} from './models';
import {Timer} from './timer';

/**
 * Create a repeating timer
 * @param callback Callback to run on each interval
 * @param options Timer options
 * @returns Timer instance
 */
export function repeat(callback: (index: number) => void, options?: Partial<RepeatOptions>): Timer {
	return new Timer(
		TYPE_REPEAT,
		{
			callback: getCallback(callback),
			trace: new TimerTrace().stack,
		},
		{
			onAfter: getCallback(options?.onAfter),
			onError: getCallback(options?.onTimeout),
			count: getValidNumber(options?.count),
			interval: getValidNumber(options?.interval, MILLISECONDS),
			timeout: getValidNumber(options?.timeout),
		},
		true,
	);
}

export type {RepeatOptions, Timer};
