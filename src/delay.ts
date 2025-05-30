import {intervalBuffer, milliseconds} from './constants';
import {getValidNumber} from './get';

/**
 * Create a delayed promise that resolves after a certain amount of time _(in milliseconds; defaults to screen refresh rate)_
 */
export function delay(time?: number): Promise<void> {
	return new Promise(resolve => {
		const interval = getValidNumber(time, milliseconds);

		let start: DOMHighResTimeStamp;

		function step(now: DOMHighResTimeStamp) {
			start ??= now;

			if (
				interval === milliseconds ||
				now - start >= interval - intervalBuffer
			) {
				resolve();
			} else {
				requestAnimationFrame(step);
			}
		}

		requestAnimationFrame(step);
	});
}
