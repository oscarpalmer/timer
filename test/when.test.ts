import {expect, test, vi} from 'vite-plus/test';
import {when} from '../src/when';
import {advanceAsync, after} from './helpers';

const interval = 25;
const timeout = interval * 2;

test('when: resolves when the condition becomes true', async () => {
	let ready = false;

	const resolved = vi.fn();
	const timer = when(() => ready, {interval});

	const promise = timer.start(resolved);

	await advanceAsync(after(interval * 4));

	expect(resolved).not.toHaveBeenCalled();
	expect(timer.active).toBe(true);

	ready = true;

	await advanceAsync(after(interval));
	await promise;

	expect(resolved).toHaveBeenCalledTimes(1);
	expect(timer.active).toBe(false);
});

test('when: start can only be called once', async () => {
	const timer = when(() => true);

	const promise = timer.start();

	expect(() => timer.start()).toThrow('Timer has already been started');

	await advanceAsync(after(interval * 4));
	await promise;

	expect(() => timer.start()).toThrow('Timer has already been started');
});

test('when: stop rejects the promise', async () => {
	const timer = when(() => false, {interval});

	const promise = timer.start();
	const assertion = expect(promise).rejects.toBeUndefined();

	await advanceAsync(after(interval * 4));

	timer.stop();

	await assertion;

	expect(timer.active).toBe(false);
});

test('when: timeout rejects the promise', async () => {
	const timer = when(() => false, {interval, timeout});

	const assertion = expect(timer.start()).rejects.toBeUndefined();

	await advanceAsync(after(timeout));
	await assertion;

	expect(timer.active).toBe(false);
});

test('when: a throwing condition rejects the promise', async () => {
	const timer = when(() => {
		throw new Error('nope');
	});

	const assertion = expect(timer.start()).rejects.toBeUndefined();

	await advanceAsync(after(interval * 4));
	await assertion;
});

test('when: pause and continue', async () => {
	let ready = false;

	const timer = when(() => ready, {interval});
	const promise = timer.start();

	await advanceAsync(after(interval * 4));

	timer.pause();

	expect(timer.active).toBe(false);
	expect(timer.paused).toBe(true);

	ready = true;

	await advanceAsync(after(interval * 20));

	expect(timer.paused).toBe(true);

	timer.continue();

	expect(timer.active).toBe(true);
	expect(timer.paused).toBe(false);

	await advanceAsync(after(interval * 4));
	await promise;

	expect(timer.active).toBe(false);
});

test('when: trace is only available when debugging', async () => {
	const timer = when(() => true);

	expect(timer.trace).toBeUndefined();

	globalThis._oscarpalmer_timer_debug = true;

	expect(timer.trace).toBeTypeOf('string');

	const promise = timer.start();

	await advanceAsync(after(interval * 4));
	await promise;
});
