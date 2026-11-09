import {vi} from 'vite-plus/test';
import {BUFFER_INTERVAL} from '../src/constants';

// The fake clock runs animation frames every ~16 ms
const FRAME = 16;

/**
 * Advance the fake clock, synchronously
 */
export function advance(ms: number): void {
	vi.advanceTimersByTime(ms);
}

/**
 * Advance the fake clock, and flush promises along the way
 */
export function advanceAsync(ms: number): Promise<void> {
	return vi.advanceTimersByTimeAsync(ms);
}

/**
 * A time at which a timer of `ms` is guaranteed to have finished
 *
 * Timers measure from their first frame, and the clock may be mid-frame when they start, so allow two frames
 */
export function after(ms: number): number {
	return ms + FRAME * 2;
}

/**
 * A time at which a timer of `ms` is guaranteed _not_ to have finished yet
 *
 * Timers finish up to `BUFFER_INTERVAL` early
 */
export function before(ms: number): number {
	return ms - BUFFER_INTERVAL;
}
