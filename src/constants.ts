import type {WorkType} from '~/models';
import type {Timer} from '~/timer';

/**
 * A set of all active timers
 */
export const activeTimers = new Set<Timer>();

/**
 * A set of types that allow work to begin
 */
export const beginTypes = new Set<WorkType>(['continue', 'start']);

/**
 * A set of types that allow work to end
 */
export const endTypes = new Set<WorkType>(['pause', 'stop']);

/**
 * A set of types that allow work to end or restart
 */
export const endOrRestartTypes = new Set<WorkType>([
	'pause',
	'restart',
	'stop',
]);

/**
 * A set of timers that were paused due to the document being hidden
 */
export const hiddenTimers = new Set<Timer>();

/**
 * Milliseconds in a frame, probably ;-)
 */
export const milliseconds = 1_000 / 60;
