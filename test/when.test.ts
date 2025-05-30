import {expect, test} from 'vitest';
import '../src/global';
import {wait} from '../src/wait';
import {when} from '../src/when';

test('when: basic', () =>
	new Promise<void>(done => {
		let stopped = false;
		let value = 0;

		wait(() => {
			value += 1;
		}, 125);

		when(() => value > 0).then(() => {
			expect(value).toEqual(1);
		});

		const what = when(
			() => {
				expect(what.active).toBe(true);
				expect(what.trace).toBeUndefined();

				return value > 1;
			},
			{
				interval: 125,
			},
		);

		wait(() => {
			what.stop();
		}, 175);

		what.then(null, () => {
			stopped = true;
		});

		try {
			what.then();
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
		}

		when(() => value > 1, {
			timeout: 250,
		}).then(null, () => {
			expect(stopped).toBe(true);
			expect(value).toEqual(1);

			try {
				what.then();
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
			}

			done();
		});
	}));

test('when: pause & continue', () =>
	new Promise<void>(done => {
		globalThis._oscarpalmer_timer_debug = true;

		let finished = false;

		const what = when(() => finished, {
			count: 100,
			interval: 25,
		});

		what.then(() => {
			expect(what.active).toBe(false);
			expect(what.destroyed).toBe(true);
			expect(what.paused).toBe(false);
			expect(what.trace).toBeUndefined();
			expect(finished).toBe(true);

			done();
		});

		wait(() => {
			expect(what.active).toBe(true);
			expect(what.paused).toBe(false);
			expect(what.trace).not.toBeUndefined();

			what.pause();

			wait(() => {
				expect(what.paused).toBe(true);

				what.continue();

				wait(() => {
					finished = true;
				}, 125);
			}, 250);
		}, 125);
	}));

test('when: timeout', () =>
	new Promise<void>(done => {
		let error: boolean | undefined;

		when(() => false, {
			count: 1000,
			interval: 25,
			timeout: 25,
		}).then(
			() => {
				error = false;
			},
			() => {
				error = true;
			},
		);

		setTimeout(() => {
			expect(error).toBe(true);

			done();
		}, 100);
	}));

test('failing condition', () =>
	new Promise<void>(done => {
		let error: boolean | undefined;

		when(() => {
			throw new Error();
		})
			.then(
				() => {
					error = false;
				},
				() => {
					error = true;
				},
			)
			.then(() => {
				expect(error).toBe(true);

				done();
			});
	}));
