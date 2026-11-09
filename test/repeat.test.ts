import {expect, test, vi} from 'vite-plus/test';
import {repeat} from '../src/repeat';
import {advance, after} from './helpers';

const interval = 50;

test('repeat: runs count times with an index, then finishes', () => {
	const callback = vi.fn();
	const onAfter = vi.fn();
	const count = 5;

	const timer = repeat(callback, {count, interval, onAfter});

	advance(after(interval * count));

	expect(callback.mock.calls.map(([index]) => index)).toEqual([0, 1, 2, 3, 4]);
	expect(onAfter).toHaveBeenCalledExactlyOnceWith(true);
	expect(timer.active).toBe(false);
});

test('repeat: runs every frame without an interval', () => {
	const callback = vi.fn();

	const timer = repeat(callback, {count: 3});

	advance(after(interval));

	expect(callback).toHaveBeenCalledTimes(3);
	expect(timer.active).toBe(false);
});

test('repeat: ignores callbacks and options that are not valid', () => {
	const timer = repeat(undefined as never, {count: 2, onAfter: 'nope' as never});

	advance(after(interval));

	expect(timer.active).toBe(false);
});

test('repeat: stop reports unfinished, once', () => {
	const callback = vi.fn();
	const onAfter = vi.fn();
	const count = 12;

	const timer = repeat(callback, {count, interval, onAfter});

	advance(after(interval * 2));

	timer.stop();
	timer.stop();

	const calls = callback.mock.calls.length;

	advance(after(interval * count));

	expect(calls).toBeGreaterThan(0);
	expect(calls).toBeLessThan(count);
	expect(callback).toHaveBeenCalledTimes(calls);
	expect(onAfter).toHaveBeenCalledExactlyOnceWith(false);
});

test('repeat: continue after stop starts again from the first index', () => {
	const callback = vi.fn();
	const count = 3;

	const timer = repeat(callback, {count, interval});

	advance(after(interval));

	expect(callback.mock.calls.length).toBeGreaterThan(0);

	timer.stop();

	callback.mockClear();

	timer.continue();

	advance(after(interval * count));

	expect(callback.mock.calls.map(([index]) => index)).toEqual([0, 1, 2]);
});

test('repeat: stopping a finished timer does not report again', () => {
	const onAfter = vi.fn();

	const timer = repeat(() => {}, {count: 1, onAfter});

	advance(after(interval));

	timer.stop();

	expect(onAfter).toHaveBeenCalledExactlyOnceWith(true);
});

test('repeat: pause and continue resume from the same index', () => {
	const callback = vi.fn();
	const count = 4;

	const timer = repeat(callback, {count, interval});

	advance(after(interval * 2));

	timer.pause();

	const calls = callback.mock.calls.length;

	advance(after(interval * count));

	expect(callback).toHaveBeenCalledTimes(calls);

	timer.continue();

	advance(after(interval * count));

	expect(callback.mock.calls.map(([index]) => index)).toEqual([0, 1, 2, 3]);
});

test('repeat: timeout stops the timer and calls onTimeout', () => {
	const callback = vi.fn();
	const onAfter = vi.fn();
	const onTimeout = vi.fn();
	const count = 100;
	const timeout = interval * 2;

	const timer = repeat(callback, {count, interval, onAfter, onTimeout, timeout});

	advance(after(interval * count));

	expect(onTimeout).toHaveBeenCalledTimes(1);
	expect(callback.mock.calls.length).toBeLessThan(count);
	expect(timer.active).toBe(false);
});
