import {SYMBOL, TYPE_REPEAT, TYPE_WAIT, TYPE_WHEN} from './constants';
import type {Timer, When} from './models';

// #region Functions

function isInstance(names: string[], value: unknown) {
	return (
		typeof value === 'object' &&
		value !== null &&
		SYMBOL in value &&
		names.includes((value as any)[SYMBOL].name as string)
	);
}

/**
 * Is the value a repeating timer?
 *
 * @param value Value to check
 * @returns `true` if the value is a repeating timer, otherwise `false`
 */
export function isRepeated(value: unknown): value is Timer {
	return isInstance([TYPE_REPEAT], value);
}

/**
 * Is the value a timer?
 *
 * @param value Value to check
 * @returns `true` if the value is a timer, otherwise `false`
 */
export function isTimer(value: unknown): value is Timer {
	return isInstance([TYPE_REPEAT, TYPE_WAIT], value);
}

/**
 * Is the value a waiting timer?
 *
 * @param value Value to check
 * @returns `true` if the value is a waiting timer, otherwise `false`
 */
export function isWaited(value: unknown): value is Timer {
	return isInstance([TYPE_WAIT], value);
}

/**
 * Is the value a conditional timer?
 *
 * @param value Value to check
 * @returns `true` if the value is a conditional timer, otherwise `false`
 */
export function isWhen(value: unknown): value is When {
	return isInstance([TYPE_WHEN], value) && typeof (value as When).start === 'function';
}

// #endregion
