import {noop} from '@oscarpalmer/atoms/function';
import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {DEFAULT_TIMEOUT, STATES, WORK_CONTINUE, WORK_PAUSE} from './constants';
import type {TimerState} from './models';
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

		if (state == null) {
			from.delete(stored as never);
		} else {
			work(type, state, true);
		}
	}
}

export function updateStates(state: TimerState, hide?: boolean): void {
	STATES.active.delete(state);

	/* istanbul ignore next */
	STATES.hidden.delete(state.reference!);

	if (hide == null) {
		return;
	}

	/* istanbul ignore if */
	if (hide) {
		state.reference ??= new WeakRef(state);

		STATES.hidden.add(state.reference);
	} else {
		STATES.active.add(state);
	}
}
