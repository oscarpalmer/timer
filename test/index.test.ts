import {GlobalRegistrator} from '@happy-dom/global-registrator';
import {describe, expect, test} from 'bun:test';
import {repeat, wait, Repeated, Waited} from '../src/index';

GlobalRegistrator.register();

describe('Functions', () => {
	test('Should create and start a repeated timer', () => {
		expect(repeat(() => {}, 0, 2)).toBeInstanceOf(Repeated);
	});

	test('Should create and start a waited timer', () => {
		expect(wait(() => {}, 0)).toBeInstanceOf(Waited);
	});
});

describe('Timer, Repeated', () => {
	describe('Constructor', () => {
		test('Should handle bad parameters', () => {
			expect(() => {
				new Repeated(null, null, null);
			}).toThrow(/callback/);

			expect(() => {
				new Repeated(() => {}, null, null);
			}).toThrow(/time/);

			expect(() => {
				new Repeated(() => {}, 0, null);
			}).toThrow(/count/);

			expect(() => {
				new Repeated(() => {}, 0, 1);
			}).toThrow(/count/);

			expect(() => {
				new Repeated(() => {}, 0, 2, 'blah');
			}).toThrow(/after-callback/);
		});
	});
});

describe('Timer, Waited', () => {
	describe('Constructor', () => {
		test('Should handle bad parameters', () => {
			expect(() => {
				new Waited(null, null);
			}).toThrow(/callback/);

			expect(() => {
				new Waited(() => {}, null);
			}).toThrow(/time/);
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
			let finishedStep = 0;
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
				index => {
					finishedStep = index;
					finishedValue += 1;
				},
				0,
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
			}, 0);
		});
	});
});
