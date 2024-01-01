export type AfterCallback = (finished: boolean) => void;
type IndexedCallback = (index: number) => void;
export declare class Timer {
    private readonly _configuration;
    private readonly _state;
    get active(): boolean;
    get finished(): boolean;
    /**
     * @param {Callback} callback
     * @param {number} time
     * @param {number} count
     * @param {AfterCallback=} afterCallback
     */
    constructor(callback: IndexedCallback, time?: number, count?: number, afterCallback?: AfterCallback);
    restart(): Timer;
    start(): Timer;
    stop(): Timer;
}
/**
 * Creates and starts a new repeated timer
 */
export declare function repeat(callback: IndexedCallback, count: number): Timer;
export declare function repeat(callback: IndexedCallback, count: number, afterCallback: AfterCallback): Timer;
export declare function repeat(callback: IndexedCallback, count: number, time: number): Timer;
export declare function repeat(callback: IndexedCallback, count: number, time: number, afterCallback: AfterCallback): Timer;
/**
 * Creates and starts a new waited timer
 */
export declare function wait(callback: IndexedCallback, time?: number): Timer;
export {};
