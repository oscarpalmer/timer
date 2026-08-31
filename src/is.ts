import type {PlainObject} from '@oscarpalmer/atoms/models';
import {TYPE_REPEAT, TYPE_WAIT, TYPE_WHEN} from './constants';
import type {Timer, When} from './models';

function is(names: string[], value: unknown) {
	return names.includes((value as PlainObject)?.$timer as string);
}

/**
 * Is the value a repeating timer?
 * 
 * @param value Value to check
 * @returns `true` if the value is a repeating timer, otherwise `false`
 */
export function isRepeated(value: unknown): value is Timer {
	return is([TYPE_REPEAT], value);
}

/**
 * Is the value a timer?
 * 
 * @param value Value to check
 * @returns `true` if the value is a timer, otherwise `false`
 */
export function isTimer(value: unknown): value is Timer {
	return is([TYPE_REPEAT, TYPE_WAIT], value);
}

/**
 * Is the value a waiting timer?
 * 
 * @param value Value to check
 * @returns `true` if the value is a waiting timer, otherwise `false`
 */
export function isWaited(value: unknown): value is Timer {
	return is([TYPE_WAIT], value);
}

/**
 * Is the value a conditional timer?
 * 
 * @param value Value to check
 * @returns `true` if the value is a conditional timer, otherwise `false`
 */
export function isWhen(value: unknown): value is When {
	return is([TYPE_WHEN], value) && typeof (value as When).start === 'function';
}
