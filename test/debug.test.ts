import {expect, test} from 'vitest';
import {wait} from '../src';

test('debugging', () =>
	new Promise<void>(done => {
		const timed = wait(() => {
			// ?
		}, 1000);

		wait(() => {
			expect(
				Array.isArray(globalThis._oscarpalmer_timers) &&
					globalThis._oscarpalmer_timers.length === 0,
			).toBe(true);

			expect(timed.trace).toBeUndefined();

			globalThis._oscarpalmer_timer_debug = true;
		}, 25);

		wait(() => {
			expect(
				Array.isArray(globalThis._oscarpalmer_timers) &&
					globalThis._oscarpalmer_timers.length === 2,
			).toBe(true);

			expect(timed.trace).not.toBeUndefined();

			globalThis._oscarpalmer_timer_debug = false;
		}, 50);

		wait(() => {
			expect(
				Array.isArray(globalThis._oscarpalmer_timers) &&
					globalThis._oscarpalmer_timers.length === 0,
			).toBe(true);

			done();
		}, 75);
	}));
