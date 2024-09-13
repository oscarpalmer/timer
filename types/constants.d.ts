import type { WorkType } from './models';
import type { Timer } from './timer';
/**
 * A set of all active timers
 */
export declare const activeTimers: Set<Timer>;
/**
 * A set of types that allow work to begin
 */
export declare const beginTypes: Set<WorkType>;
/**
 * A set of types that allow work to end
 */
export declare const endTypes: Set<WorkType>;
/**
 * A set of types that allow work to end or restart
 */
export declare const endOrRestartTypes: Set<WorkType>;
/**
 * A set of timers that were paused due to the document being hidden
 */
export declare const hiddenTimers: Set<Timer>;
/**
 * Milliseconds in a frame, probably ;-)
 */
export declare const milliseconds: number;
