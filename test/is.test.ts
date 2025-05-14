import {expect, test} from 'vitest';
import {
	isRepeated,
	isTimer,
	isWaited,
	isWhen,
	repeat,
	wait,
	when,
} from '../src';

test('is', () =>
	new Promise<void>(done => {
		const repeated = repeat(() => {}, {count: 1});
		const waited = wait(() => {});
		const whened = when(() => true);

		expect(isTimer(repeated)).toBe(true);
		expect(isTimer(waited)).toBe(true);
		expect(isTimer(whened)).toBe(false);

		expect(isRepeated(repeated)).toBe(true);
		expect(isRepeated(waited)).toBe(false);
		expect(isRepeated(whened)).toBe(false);

		expect(isWaited(repeated)).toBe(false);
		expect(isWaited(waited)).toBe(true);
		expect(isWaited(whened)).toBe(false);

		expect(isWhen(repeated)).toBe(false);
		expect(isWhen(waited)).toBe(false);
		expect(isWhen(whened)).toBe(true);

		wait(() => {
			expect(repeated.active).toBe(false);
			expect(waited.active).toBe(false);

			done();
		}, 25);
	}));
