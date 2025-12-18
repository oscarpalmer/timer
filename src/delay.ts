import {BUFFER_INTERVAL, MILLISECONDS} from './constants';
import {getValidNumber} from './get';

/**
 * Create a delayed promise that resolves after a certain amount of time
 * @param time How long to wait for _(in milliseconds; defaults to screen refresh rate)_
 * @returns A promise that resolves after the delay
 */
export function delay(time?: number): Promise<void> {
	return new Promise(resolve => {
		const interval = getValidNumber(time, MILLISECONDS);

		let start: DOMHighResTimeStamp;

		function step(now: DOMHighResTimeStamp) {
			start ??= now;

			if (interval === MILLISECONDS || now - start >= interval - BUFFER_INTERVAL) {
				resolve();
			} else {
				requestAnimationFrame(step);
			}
		}

		requestAnimationFrame(step);
	});
}
