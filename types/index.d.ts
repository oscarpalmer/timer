import './global';
/**
 * Creates a delayed promise that resolves after a certain amount of time _(or rejects when timed out)_
 */
export declare function delay(time: number, timeout?: number): Promise<void>;
export { isRepeated, isTimer, isWaited, isWhen } from './is';
export { repeat, wait, type Timer } from './timer';
export { when, type When } from './when';
