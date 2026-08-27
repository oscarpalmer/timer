import {expect, test} from 'vitest';
import '../src/global';
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

		setTimeout(() => {
			expect(one.active).toBe(true);
			expect(globalThis._oscarpalmer_timer_debug).toBeOneOf([false, undefined]);
			expect(globalThis._oscarpalmer_timers?.length).toBeOneOf([0, undefined]);
			expect(one.trace).toBeUndefined();

			two.stop();
			two.stop();

			three.start();
			three.start();

			five.destroy();
			five.destroy();

			globalThis._oscarpalmer_timer_debug = true;
		}, 20);

		setTimeout(() => {
			expect(globalThis._oscarpalmer_timer_debug).toBe(true);
			expect(globalThis._oscarpalmer_timers?.length).toBe(4);
			expect(one.trace).not.toBeUndefined();

			three.restart();
			three.restart();

			four.pause();
			four.pause();

			five.start();
			five.start();
		}, 40);

		setTimeout(() => {
			expect(four.paused).toBe(true);

			four.continue();
			four.continue();
		}, 60);

		setTimeout(() => {
			expect(globalThis._oscarpalmer_timer_debug).toBe(true);
			expect(globalThis._oscarpalmer_timers?.length).toBe(1);

			expect(one.active).toBe(false);
			expect(values.one).toBe(1);

			expect(two.active).toBe(false);
			expect(values.two).toBe(0);

			expect(three.active).toBe(false);
			expect(values.three).toBe(3);

			expect(four.active).toBe(false);
			expect(four.paused).toBe(false);
			expect(values.four).toBe(4);

			expect(five.active).toBe(true);
			expect(five.destroyed).toBe(false);
			expect(values.five).toBe(0);

			expect(five.trace).toBeTypeOf('string');

			done();
		}, 450);
	}));

test(
	'long',
	async () =>
		new Promise<void>(done => {
			const now = performance.now();

			wait(() => {
				const elapsed = performance.now() - now;

				expect(elapsed >= 1480 && elapsed <= 1520).toBe(true);

				done();
			}, 1500);
		}),
	2000,
);
