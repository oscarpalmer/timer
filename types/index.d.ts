/**
 * @param {boolean} finished Did the timer finish?
 */
export type AfterCallback = (finished: boolean) => void;

/**
 * @param {number} index The index of the current iteration
 */
export type RepeatedCallback = (index: number) => void;

declare class Timed<Type, Callback> {
	get active(): boolean;
	get finished(): boolean;

	/**
	 * @param {Callback} callback
	 * @param {number} time
	 * @param {number} count
	 * @param {AfterCallback=} afterCallback
	 */

	constructor(
		callback: () => void | ((index: number) => void),
		time: number,
		count: number,
		afterCallback?: AfterCallback,
	);

	restart(): Type;
	start(): Type;
	stop(): Type;
}

/**
 * A timer that waits and runs repeatedly
 */
export declare class Repeated extends Timed<Repeated, RepeatedCallback> {}

/**
 * A timer that waits and runs once
 */
export declare class Waited extends Timed<Waited, () => void> {
	/**
	 * Creates a new waited timer
	 * @param {() => void} callback
	 * @param {number} time
	 */
	constructor(callback: () => void, time: number);
}

/**
 * Creates and starts a new repeated timer
 * @param {RepeatedCallback} callback
 * @param {number} time
 * @param {number} count
 * @param {AfterCallback=} afterCallback
 * @return {Repeated}
 */
export declare function repeat(
	callback: RepeatedCallback,
	time: number,
	count: number,
	afterCallback?: AfterCallback,
): Repeated;

/**
 * Creates and starts a new waited timer
 * @param {() => void} callback
 * @param {number} time
 * @return {Waited}
 */
export declare function wait(callback: () => void, time: number): Waited;
