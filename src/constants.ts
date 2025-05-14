import type {WorkHandlerType} from './models';
import type {Timer} from './timer';

/**
 * A set of all active timers
 */
export const activeTimers = new Set<Timer>();

/**
 * A set of types that allow work to begin
 */
export const beginTypes = new Set<WorkHandlerType>(['continue', 'start']);

/**
 * Message to show when a when-timer is destroyed
 */
export const destroyedMessage = 'Timer has already been destroyed';

/**
 * A set of types that allow work to end
 */
export const endTypes = new Set<WorkHandlerType>(['pause', 'stop']);

/**
 * A set of types that allow work to end or restart
 */
export const endOrRestartTypes = new Set<WorkHandlerType>([
	'pause',
	'restart',
	'stop',
]);

/**
 * A set of timers that were paused due to the document being hidden
 */
export const hiddenTimers = new Set<Timer>();

export const pauseTypes = new Set<WorkHandlerType>(['continue', 'pause']);

/**
 * Message to show when a when-timer is started
 */
export const startedMessage = 'Timer has already been started';

//

const values: number[] = [];
let last: DOMHighResTimeStamp | undefined;

/**
 * A calculated average of the refresh rate of the display
 */
export let milliseconds: number;

function step(now: DOMHighResTimeStamp): void {
	if (values.length === 10) {
		milliseconds = Math.floor(
			values.slice(2, -2).reduce((first, second) => first + second) / 6,
		);

		last = undefined;
		values.length = 0;
	} else {
		last ??= now;

		const difference = now - last;

		if (difference > 0) {
			values.push(difference);
		}

		last = now;

		requestAnimationFrame(step);
	}
}

requestAnimationFrame(step);
