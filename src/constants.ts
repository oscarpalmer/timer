import FRAME_RATE_MS from '@oscarpalmer/atoms/frame-rate';
import type {TimerType, WorkHandlerType} from './models';
import type {Timer} from './timer';

/**
 * Buffer value to use when evaluating if a specific time is within a certain range
 */
export const BUFFER_INTERVAL = 5;

export const DEFAULT_TIMEOUT = 30_000;

/**
 * Message to show when a when-timer is destroyed
 */
export const MESSAGE_DESTROYED = 'Timer has already been destroyed';

/**
 * Message to show when a when-timer is started
 */
export const MESSAGE_STARTED = 'Timer has already been started';

/**
 * A set of all active timers
 */
export const TIMERS_ACTIVE = new Set<Timer>();

/**
 * A set of timers that were paused due to the document being hidden
 */
export const TIMERS_HIDDEN = new Set<Timer>();

export const TYPE_REPEAT: TimerType = 'repeat';

export const TYPE_WAIT: TimerType = 'wait';

export const TYPE_WHEN: TimerType = 'when';

export const WORK_CONTINUE: WorkHandlerType = 'continue';

export const WORK_PAUSE: WorkHandlerType = 'pause';

export const WORK_RESTART: WorkHandlerType = 'restart';

export const WORK_START: WorkHandlerType = 'start';

export const WORK_STOP: WorkHandlerType = 'stop';

export {FRAME_RATE_MS};
