import {GlobalRegistrator} from '@happy-dom/global-registrator';
import {describe, expect, test} from 'bun:test';
import {repeat, wait, Repeated, Waited} from '../src/index';

GlobalRegistrator.register();

describe('Functions', () => {
	test('Should create and start a repeated timer', function () {
		expect(repeat(() => {}, 0, 2)).toBeInstanceOf(Repeated);
	});

	test('Should create and start a waited timer', function () {
		expect(wait(() => {}, 0)).toBeInstanceOf(Waited);
	});
});

describe('Timer, Repeated', () => {
	describe('Constructor', () => {
		test('Should handle bad parameters', () => {
			expect(function () {
				new Repeated(null, null, null);
			}).toThrow(/callback/);

			expect(function () {
				new Repeated(() => {}, null, null);
			}).toThrow(/time/);

			expect(function () {
				new Repeated(() => {}, 0, null);
			}).toThrow(/count/);

			expect(function () {
				new Repeated(() => {}, 0, 1);
			}).toThrow(/count/);

			expect(function () {
				new Repeated(() => {}, 0, 2, 'blah');
			}).toThrow(/after-callback/);
		});
	});

	describe('Run', () => {
		test('Should run as many times as set', done => {
			let value = 0;

			repeat(
				() => {
					value += 1;
				},
				25,
				10,
			);

			wait(() => {
				expect(value).toEqual(10);
				done();
			}, 500);
		});

		test('Should run until cancelled', done => {
			let value = 0;

			const repeated = repeat(
				() => {
					value += 1;
				},
				25,
				10,
			);

			wait(() => {
				repeated.stop();
			}, 125);

			wait(() => {
				expect(value).toBeLessThan(10);
				done();
			}, 500);
		});
	});
});

describe('Timer, Waited', () => {
	describe('Constructor', function () {
		test('Should handle bad parameters', () => {
			expect(function () {
				new Waited(null, null);
			}, /callback/);

			expect(function () {
				new Waited(() => {}, null);
			}, /time/);
		});
	});
});

describe('Timer, Repeated & Waited', () => {
	describe('Methods', () => {
		test('Should be able to start', done => {
			new Waited(() => {
				expect(true).toEqual(true);
				done();
			}, 125).start();
		});

		test('Should be able to stop', done => {
			let value = 0;

			const waited = new Waited(() => {
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

			const waited = new Waited(() => {
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
});

describe('Repeated', () => {
	describe('Methods', () => {
		test('Should be able to handle after-callbacks with proper finished-state', done => {
			let canceledValue = 0;
			let finishedValue = 0;

			const canceledTimer = repeat(
				() => {
					canceledValue += 1;
				},
				0,
				10,
				finished => {
					expect(finished).toEqual(false);
					expect(canceledValue).toEqual(1);
				},
			);

			repeat(
				() => {
					finishedValue += 1;
				},
				0,
				10,
				finished => {
					expect(finished).toEqual(true);
					expect(finishedValue).toEqual(10);
				},
			);

			wait(() => {
				canceledTimer.stop();
				done();
			}, 0);
		});
	});
});
