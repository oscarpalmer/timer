import type { TimerOptions, TimerState, WhenState, WorkType } from './models';
import type { Timer } from './timer';
export declare function destroyWhen(state: WhenState): void;
export declare function getOptions(options: Partial<TimerOptions>, isRepeated: boolean): TimerOptions;
export declare function getValueOrDefault(value: unknown, defaultValue: number, minimum?: number): number;
export declare function work(type: WorkType, timer: Timer, state: TimerState, options: TimerOptions): Timer;
