import {noop} from '@oscarpalmer/atoms/function';
import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {DEFAULT_TIMEOUT, PAUSED, STATES, SYMBOL} from './constants';
import type {TimerState, WhenState} from './models';

// #region Types

type InternalTimer = {
	[SYMBOL]: TimerState;
};

type InternalWhen = {
	[SYMBOL]: WhenState;
};

// #endregion

// #region Functions

function getActive(this: InternalTimer | InternalWhen): boolean {
	const state = this[SYMBOL];

	return PAUSED in state
		? state.active && !state.paused
		: state.timer.active && !state.timer.paused;
}

export function getCallback(value: unknown): GenericCallback {
	return typeof value === 'function' ? (value as GenericCallback) : noop;
}

function getPaused(this: InternalTimer | InternalWhen): boolean {
	const state = this[SYMBOL];

	return PAUSED in state ? state.paused : state.timer.paused;
}

function getTrace(this: InternalTimer | InternalWhen): string | undefined {
	const state = this[SYMBOL];

	if (globalThis._oscarpalmer_timer_debug ?? false) {
		return PAUSED in state ? state.trace : state.timer.trace;
	}

	return undefined;
}

export function getValidNumber(value: unknown, defaultValue?: number): number {
	const actualDefault = defaultValue ?? 0;

	return typeof value === 'number' && value > actualDefault ? value : actualDefault;
}

export function getValidTimeout(value: unknown): number {
	return typeof value === 'number' && value > 0 ? value : DEFAULT_TIMEOUT;
}

export function updatePrototype(
	owner: GenericCallback,
	methods: Record<string, GenericCallback>,
): void {
	const keys = Object.keys(methods);

	for (const key of keys) {
		owner.prototype[key] = methods[key];
	}

	Object.defineProperties(owner.prototype, {
		active: {
			enumerable: true,
			get: getActive,
		},
		paused: {
			enumerable: true,
			get: getPaused,
		},
		trace: {
			enumerable: true,
			get: getTrace,
		},
	});
}

export function updateStates(state: TimerState, hide?: boolean): void {
	STATES.active.delete(state);

	STATES.hidden.delete(state.reference!);

	if (hide == null) {
		return;
	}

	if (hide) {
		state.reference ??= new WeakRef(state);

		STATES.hidden.add(state.reference);
	} else {
		STATES.active.add(state);
	}
}

// #endregion

// #region Variables

/* istanbul ignore next */
export const startTimer: GenericCallback =
	'requestAnimationFrame' in globalThis ? requestAnimationFrame : setTimeout;

/* istanbul ignore next */
export const stopTimer: GenericCallback =
	'cancelAnimationFrame' in globalThis ? cancelAnimationFrame : clearTimeout;

// #endregion
