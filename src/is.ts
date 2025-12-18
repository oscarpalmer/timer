import type {PlainObject} from '@oscarpalmer/atoms';
import {TYPE_REPEAT, TYPE_WAIT, TYPE_WHEN} from './constants';
import type {Timer} from './timer';
import type {When} from './when';

function is(names: string[], value: unknown) {
	return names.includes((value as PlainObject)?.$timer as string);
}

/**
 * Is the value a repeating timer?
 * @param value Value to check
 * @returns `true` if the value is a repeating timer
 */
export function isRepeated(value: unknown): value is Timer {
	return is([TYPE_REPEAT], value);
}

/**
 * Is the value a timer?
 * @param value Value to check
 * @returns `true` if the value is a timer
 */
export function isTimer(value: unknown): value is Timer {
	return is([TYPE_REPEAT, TYPE_WAIT], value);
}

/**
 * Is the value a waiting timer?
 * @param value Value to check
 * @returns `true` if the value is a waiting timer
 */
export function isWaited(value: unknown): value is Timer {
	return is([TYPE_WAIT], value);
}

/**
 * Is the value a conditional timer?
 * @param value Value to check
 * @returns `true` if the value is a conditional timer
 */
export function isWhen(value: unknown): value is When {
	return is([TYPE_WHEN], value) && typeof (value as When).then === 'function';
}
