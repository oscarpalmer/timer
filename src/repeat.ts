import {milliseconds} from './constants';
import {getCallback, getValidNumber} from './get';
import {type RepeatOptions, TimerTrace} from './models';
import {Timer} from './timer';
import {work} from './work';

/**
 * Create a repeating timer
 */
export function repeat(
	callback: (index: number) => void,
	options?: Partial<RepeatOptions>,
): Timer {
	return new Timer(
		'repeat',
		work,
		{
			callback: getCallback(callback),
			trace: new TimerTrace().stack,
		},
		{
			onAfter: getCallback(options?.onAfter),
			onError: undefined,
			count: getValidNumber(options?.count),
			interval: getValidNumber(options?.interval, milliseconds),
			timeout: 0,
		},
		true,
	);
}

export type {RepeatOptions, Timer};
