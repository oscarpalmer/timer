import {noop} from '@oscarpalmer/atoms/function';
import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {DEFAULT_TIMEOUT, STATES, WORK_CONTINUE, WORK_PAUSE} from './constants';
import type {TimerStates, TimerState} from './models';
import {work} from './work';

export function getCallback(value: unknown): GenericCallback {
	return typeof value === 'function' ? (value as GenericCallback) : noop;
}

export function getValidNumber(value: unknown, defaultValue?: number): number {
	const actualDefault = defaultValue ?? 0;

	return typeof value === 'number' && value > actualDefault ? value : actualDefault;
}

export function getValidTimeout(value: unknown): number {
	return typeof value === 'number' && value > 0 ? value : DEFAULT_TIMEOUT;
}

/* istanbul ignore next */
export function onVisibilityChange(): void {
	const from = document.hidden ? STATES.active : STATES.hidden;
	const type = document.hidden ? WORK_PAUSE : WORK_CONTINUE;

	for (const stored of from) {
		const state = stored instanceof WeakRef ? stored.deref() : stored;

		if (state != null) {
			work(type, state, true);
		}
	}
}

export function updateStates(state: TimerState, key?: keyof TimerStates): void {
	STATES.active.delete(state);

	const hidden = [...STATES.hidden].find(stored => stored.deref() === state);

	/* istanbul ignore next */
	if (hidden != null) {
		STATES.hidden.delete(hidden);
	}

	if (key != null) {
		/* istanbul ignore next */
		STATES[key].add((key === 'hidden' ? new WeakRef(state) : state) as never);
	}
}
