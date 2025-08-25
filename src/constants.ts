import type {TimerType, WorkHandlerType} from './models';
import type {Timer} from './timer';

function calculate(): Promise<number> {
	return new Promise(resolve => {
		const values: number[] = [];

		let last: DOMHighResTimeStamp | undefined;

		function step(now: DOMHighResTimeStamp): void {
			if (last != null) {
				values.push(now - last);
			}

			last = now;

			if (values.length >= 10) {
				const median =
					values
						.sort()
						.slice(2, -2)
						.reduce((first, second) => first + second, 0) /
					(values.length - 4);

				resolve(median);
			} else {
				requestAnimationFrame(step);
			}
		}

		requestAnimationFrame(step);
	});
}

/**
 * A set of all active timers
 */
export const activeTimers = new Set<Timer>();

/**
 * Buffer value to use when evaluating if a specific time is within a certain range
 */
export const intervalBuffer = 5;

/**
 * Message to show when a when-timer is destroyed
 */
export const destroyedMessage = 'Timer has already been destroyed';

/**
 * A set of timers that were paused due to the document being hidden
 */
export const hiddenTimers = new Set<Timer>();

/**
 * Message to show when a when-timer is started
 */
export const startedMessage = 'Timer has already been started';

export const TYPE_REPEAT: TimerType = 'repeat';
export const TYPE_WAIT: TimerType = 'wait';
export const TYPE_WHEN: TimerType = 'when';

export const WORK_CONTINUE: WorkHandlerType = 'continue';
export const WORK_PAUSE: WorkHandlerType = 'pause';
export const WORK_RESTART: WorkHandlerType = 'restart';
export const WORK_START: WorkHandlerType = 'start';
export const WORK_STOP: WorkHandlerType = 'stop';

//

/**
 * A calculated average of the refresh rate of the display _(in milliseconds)_
 */
export let milliseconds = 1000 / 60;

calculate().then(value => {
	milliseconds = value;
});
