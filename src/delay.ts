import {getValidNumber} from './get';

/**
 * Create a delayed promise that resolves after a certain amount of time
 * @param time How long to wait for _(in milliseconds; defaults to screen refresh rate)_
 * @returns A promise that resolves after the delay
 */
export function delay(time?: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, getValidNumber(time)));
}
