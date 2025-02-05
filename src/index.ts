import {noop} from '@oscarpalmer/atoms/function';
import {activeTimers, hiddenTimers} from './constants';
import './global';
import {type Timer, wait} from './timer';

/**
 * Creates a delayed promise that resolves after a certain amount of time _(or rejects when timed out)_
 */
export function delay(time: number, timeout?: number): Promise<void> {
	return new Promise((resolve, reject) => {
		let delayed: Timer | null = wait(
			() => {
				delayed?.destroy();

				delayed = null;

				(resolve ?? noop)();
			},
			{
				timeout,
				errorCallback: () => {
					delayed?.destroy();

					delayed = null;

					(reject ?? noop)();
				},
				interval: time,
			},
		);
	});
}

document.addEventListener('visibilitychange', () => {
	if (document.hidden) {
		for (const timer of activeTimers) {
			hiddenTimers.add(timer);
			timer.pause();
		}
	} else {
		for (const timer of hiddenTimers) {
			timer.continue();
		}

		hiddenTimers.clear();
	}
});

export {isRepeated, isTimer, isWaited, isWhen} from './is';
export {repeat, wait, type Timer} from './timer';
export {when, type When} from './when';
