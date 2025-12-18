import type {GenericCallback} from '@oscarpalmer/atoms';
import {noop} from '@oscarpalmer/atoms/function';
import {DEFAULT_TIMEOUT} from './constants';

export function getCallback(value: unknown): GenericCallback {
	return typeof value === 'function' ? (value as GenericCallback) : noop;
}

export function getValidTimeout(value: unknown): number {
	return typeof value === 'number' && value > 0 ? value : DEFAULT_TIMEOUT;
}

export function getValidNumber(value: unknown, defaultValue?: number): number {
	const actualDefault = defaultValue ?? 0;

	return typeof value === 'number' && value > actualDefault ? value : actualDefault;
}
