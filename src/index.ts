import {activeTimers, hiddenTimers} from '~/constants';
import '~/global';
import {noop} from '@oscarpalmer/atoms/function';
import {wait} from '~/timer';

/**
 * Creates a delayed promise that resolves after a certain amount of time _(or rejects when timed out)_
 */
export function delay(time: number, timeout?: number): Promise<void> {
	return new Promise((resolve, reject) => {
		const delayed = wait(
			() => {
				delayed.destroy();

				(resolve ?? noop)();
			},
			{
				timeout,
				errorCallback: () => {
					delayed.destroy();

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

