import {TYPE_REPEAT} from './constants';
import {getCallback, getValidNumber} from './misc';
import './global';
import {type RepeatOptions, type Timer, TimerTrace} from './models';
import {createTimer} from './timer';

/**
 * Create a repeating timer
 *
 * @param callback Callback to run on each interval
 * @param options Timer options
 * @returns Timer instance
 */
export function repeat(callback: (index: number) => void, options?: Partial<RepeatOptions>): Timer {
	return createTimer(
		TYPE_REPEAT,
		{
			callback: getCallback(callback),
			trace: new TimerTrace().stack,
		},
		{
			onAfter: getCallback(options?.onAfter),
			onError: getCallback(options?.onTimeout),
			count: getValidNumber(options?.count),
			interval: getValidNumber(options?.interval),
			timeout: getValidNumber(options?.timeout),
		},
		true,
	);
}
