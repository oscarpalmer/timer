import {noop} from '@oscarpalmer/atoms/function';
import type {GenericCallback} from '@oscarpalmer/atoms/models';

export function getCallback(value: unknown): GenericCallback {
	return typeof value === 'function' ? (value as GenericCallback) : noop;
}

export function getValidNumber(value: unknown, defaultValue?: number): number {
	return typeof value === 'number'
		? value > 0
			? value
			: 0
		: (defaultValue ?? 0);
}
