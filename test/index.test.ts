import {GlobalRegistrator} from '@happy-dom/global-registrator';
import {describe, expect, test} from 'bun:test';
import {repeat, wait, Timer} from '../src/index';

GlobalRegistrator.register();

describe('Constructor', () => {
	test('Should handle bad parameters', () => {
		expect(() => {
			// @ts-expect-error Testing bad parameters
			new Timer(null, null, null);
		}).toThrow(/callback/);

		expect(() => {
			new Timer(() => {}, -1, 1);
		}).toThrow(/time/);

		expect(() => {
			new Timer(() => {}, 0, -1);
		}).toThrow(/count/);

		expect(() => {
			// @ts-expect-error Testing bad parameters
			new Timer(() => {}, 0, 2, 'blah');
		}).toThrow(/after-callback/);

		try {
			repeat(() => {}, -1);
		} catch (error) {
			expect(error.message).toMatch(/count/);
		}
	});
});

describe('Methods', () => {
	test('Should be able to start', done => {
		new Timer(
			() => {
				expect(true).toEqual(true);
				done();
			},
			125,
			1,
		).start();
	});

	test('Should be able to stop', done => {
		let value = 0;

		const waited = new Timer(() => {
			value = 1234;
		}, 500);

		waited.start();

		wait(() => {
			waited.stop();
		}, 250);

		wait(() => {
			expect(value).toEqual(0);
			done();
		}, 375);
	});

	test('Should be able to restart', done => {
		let value = 0;

		const waited = new Timer(() => {
			value += 1;
		}, 125);

		waited.start();

		wait(() => {
			waited.restart();
		}, 250);

		wait(() => {
			expect(value).toEqual(2);
			done();
		}, 500);
	});
});

describe('Repetition', () => {
	describe('Methods', () => {
		test('Should be able to handle after-callbacks with proper finished-state', done => {
			let canceledValue = 0;
			let finishedStep = 0;
			let finishedValue = 0;

			const canceledTimer = repeat(
				() => {
					expect(canceledTimer.active).toEqual(true);

					canceledValue += 1;
				},
				10,
				finished => {
					expect(canceledTimer.finished).toEqual(false);
					expect(finished).toEqual(false);
					expect(canceledValue).toEqual(1);
				},
			);

			repeat(
				index => {
					finishedStep = index;
					finishedValue += 1;
				},
				10,
				finished => {
					expect(finished).toEqual(true);
					expect(finishedStep).toEqual(9);
					expect(finishedValue).toEqual(10);
				},
			);

			wait(() => {
				canceledTimer.stop();
				done();
			});
		});
	});
});
