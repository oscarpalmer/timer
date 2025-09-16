import {expect, test} from 'vitest';
import {repeat} from '../src/repeat';

test('repeat', () =>
	new Promise<void>(done => {
		const values = {
			one: [0, 0],
			two: [0, 0],
		};

		repeat(
			index => {
				values.one[0] = index;
			},
			{
				onAfter(finished) {
					values.one[1] = finished ? 1 : -1;
				},
				count: 12,
			},
		);

		const two = repeat(
			index => {
				values.two[0] = index;
			},
			{
				onAfter(finished) {
					values.two[1] = finished ? 1 : -1;
				},
				count: 12,
			},
		);

		setTimeout(() => {
			two.stop();
		}, 125);

		setTimeout(() => {
			expect(values.one[0]).toBe(11);
			expect(values.one[1]).toBe(1);

			expect(values.two[0]).toBeLessThan(11);
			expect(values.two[1]).toBe(-1);

			done();
		}, 500);
	}));

test('timeout', () =>
	new Promise<void>(done => {
		let error: unknown;
		let value = 0;

		repeat(
			() => {
				value += 1;
			},
			{
				count: 100,
				timeout: 100,
			},
		);

		repeat(() => {}, {
			count: 100,
			timeout: 100,
			onTimeout() {
				error = new Error('timeout');
			},
		});

		setTimeout(() => {
			expect(error).toBeInstanceOf(Error);
			expect(value).toBeLessThan(100);

			done();
		}, 250);
	}));
