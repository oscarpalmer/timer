import { TimerTrace, type AnyCallback, type IndexedCallback, type RepeatOptions, type TimerOptions, type TimerState, type WaitOptions } from './models';
export declare abstract class BasicTimer<State> {
    protected readonly $timer: string;
    protected readonly state: State;
    constructor(type: 'repeat' | 'wait' | 'when', state: State);
    /**
     * Is the timer running?
     */
    abstract readonly active: boolean;
    /**
     * Is the timer destroyed?
     */
    abstract readonly destroyed: boolean;
    /**
     * Is the timer paused?
     */
    abstract readonly paused: boolean;
    /**
     * Gets the traced location of the timer
     */
    abstract readonly trace: TimerTrace | undefined;
}
/**
 * A timer that can be started, stopped, and restarted as neeeded
 */
export declare class Timer extends BasicTimer<TimerState> {
    private readonly options;
    get active(): boolean;
    get destroyed(): boolean;
    get paused(): boolean;
    get trace(): TimerTrace | undefined;
    constructor(type: 'repeat' | 'wait', state: TimerState, options: TimerOptions);
    /**
     * Continues the timer _(if it was paused)_
     */
    continue(): Timer;
    /**
     * Destroys the timer _(after stopping it, if it was running)_
     */
    destroy(): void;
    /**
     * Pauses the timer _(if it was running)_
     */
    pause(): Timer;
    /**
     * Restarts the timer _(if it was running)_
     */
    restart(): Timer;
    /**
     * Starts the timer _(if it was stopped)_
     */
    start(): Timer;
    /**
     * Stops the timer _(if it was running)_
     */
    stop(): Timer;
}
/**
 * Creates a timer which:
 * - calls a callback after a certain amount of time...
 * - ... and repeats it a certain amount of times
 * ---
 * - `options.count` defaults to `Infinity`
 * - `options.interval` defaults to `1000/60` _(1 frame)_
 * - `options.timeout` defaults to `Infinity`
 */
export declare function repeat(callback: IndexedCallback, options?: Partial<RepeatOptions>): Timer;
export declare function timer(type: 'repeat' | 'wait', callback: AnyCallback, partial: Partial<TimerOptions>, start: boolean): Timer;
/**
 * Creates a timer which calls a callback after a certain amount of time
 */
export declare function wait(callback: () => void): Timer;
/**
 * Creates a timer which calls a callback after a certain amount of time
 */
export declare function wait(callback: () => void, time: number): Timer;
/**
 * Creates a timer which calls a callback after a certain amount of time
 * - `options.interval` defaults to `1000/60` _(1 frame)_
 * - `options.timeout` defaults to `30_000` _(30 seconds)_
 */
export declare function wait(callback: () => void, options: Partial<WaitOptions>): Timer;
