import {expect, test} from 'vite-plus/test';
import {isRepeated, isTimer, isWaited, isWhen, repeat, wait, when} from '../src';
import {advanceAsync, after} from './helpers';

test('is: identifies each kind of timer', async () => {
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

	// Started so that its promise settles, otherwise it leaks
	void whened.start();

	await advanceAsync(after(0));

	expect(repeated.active).toBe(false);
	expect(waited.active).toBe(false);
});

test('is: rejects values that are not timers', () => {
	for (const value of [undefined, null, 1, 'timer', {}, [], () => {}]) {
		expect(isTimer(value)).toBe(false);
		expect(isRepeated(value)).toBe(false);
		expect(isWaited(value)).toBe(false);
		expect(isWhen(value)).toBe(false);
	}
});
