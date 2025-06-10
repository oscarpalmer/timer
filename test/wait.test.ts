import {expect, test} from 'vitest';
import '../src/global';
import {noop} from '@oscarpalmer/atoms/function';
import {wait} from '../src/wait';

test('wait', async () =>
	new Promise<void>(done => {
		const values = {
			four: 0,
			five: 0,
			one: 0,
			three: 0,
			two: 0,
		};

		const one = wait(() => {
			values.one += 1;
		}, 60);

		const two = wait(() => {
			values.two += 2;
		}, 60);

		const three = wait(() => {
			values.three += 3;
		}, 60);

		const four = wait(() => {
			values.four += 4;
		}, 60);

		const five = wait(() => {
			values.five += 5;
		}, 500);

		wait(() => {
			expect(one.active).toBe(true);
			expect(globalThis._oscarpalmer_timer_debug).toBeOneOf([false, undefined]);
			// expect(globalThis._oscarpalmer_timers?.length).toBeOneOf([0, undefined]);
			expect(one.trace).toBeUndefined();

			two.stop();
			two.stop();

			three.start();
			three.start();

			five.destroy();
			five.destroy();

			globalThis._oscarpalmer_timer_debug = true;
		}, 20);

		wait(() => {
			expect(globalThis._oscarpalmer_timer_debug).toBe(true);
			// expect(globalThis._oscarpalmer_timers?.length).toBe(2);
			expect(one.trace).not.toBeUndefined();

			three.restart();
			three.restart();

			four.pause();
			four.pause();
		}, 40);

		wait(() => {
			expect(four.paused).toBe(true);

			four.continue();
			four.continue();
		}, 60);

		wait(() => {
			expect(one.active).toBe(false);
			expect(values.one).toBe(1);

			expect(two.active).toBe(false);
			expect(values.two).toBe(0);

			expect(three.active).toBe(false);
			expect(values.three).toBe(3);

			expect(four.active).toBe(false);
			expect(four.paused).toBe(false);
			expect(values.four).toBe(4);

			expect(five.active).toBe(false);
			expect(five.destroyed).toBe(true);
			expect(values.five).toBe(0);

			// @ts-expect-error Testing protected options being destroyed
			const options = five.options;

			expect(options.onAfter).toBe(noop);
			expect(options.onError).toBe(noop);

			// @ts-expect-error Testing protected state being destroyed
			const state = five.state;

			expect(state.callback).toBe(noop);
			expect(state.trace).toBe(undefined);

			done();
		}, 500);
	}));


test(
	'long',
	async () =>
		new Promise<void>(done => {
			const now = performance.now();

			wait(() => {
				expect(performance.now() - now).toBeGreaterThanOrEqual(5000);

				done();
			}, 5000);
		}),
	5500,
);
