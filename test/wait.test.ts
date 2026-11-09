import {expect, test, vi} from 'vite-plus/test';
import {wait} from '../src/wait';
import {advance, after, before} from './helpers';

const time = 100;

test('wait: runs callback once after the given time', () => {
	const callback = vi.fn();
	const timer = wait(callback, time);

	expect(timer.active).toBe(true);

	advance(before(time));

	expect(callback).not.toHaveBeenCalled();
	expect(timer.active).toBe(true);

	advance(after(time));

	expect(callback).toHaveBeenCalledTimes(1);
	expect(timer.active).toBe(false);

	advance(after(time));

	expect(callback).toHaveBeenCalledTimes(1);
});

test('wait: methods return the timer for chaining', () => {
	const timer = wait(() => {}, time);

	expect(timer.pause()).toBe(timer);
	expect(timer.continue()).toBe(timer);
	expect(timer.restart()).toBe(timer);
	expect(timer.stop()).toBe(timer);
	expect(timer.start()).toBe(timer);
});

test('wait: runs on the next frame without a time', () => {
	const callback = vi.fn();

	wait(callback);

	advance(after(0));

	expect(callback).toHaveBeenCalledTimes(1);
});

test('wait: ignores callbacks that are not functions', () => {
	const timer = wait(undefined as never, time);

	advance(after(time));

	expect(timer.active).toBe(false);
});

test('wait: stop prevents the callback, and is safe to repeat', () => {
	const callback = vi.fn();
	const timer = wait(callback, time);

	timer.stop();
	timer.stop();

	advance(after(time));

	expect(callback).not.toHaveBeenCalled();
	expect(timer.active).toBe(false);
});

test('wait: start is ignored while active, and runs again after finishing', () => {
	const callback = vi.fn();
	const timer = wait(callback, time);

	timer.start();
	timer.start();

	advance(after(time));

	expect(callback).toHaveBeenCalledTimes(1);

	timer.start();

	advance(after(time));

	expect(callback).toHaveBeenCalledTimes(2);
});

test('wait: pause and continue keep the elapsed time', () => {
	const callback = vi.fn();
	const timer = wait(callback, time);

	// Not enough to finish, but enough that a full restart would be noticeable
	advance(time / 2);

	timer.pause();
	timer.pause();

	expect(timer.active).toBe(false);
	expect(timer.paused).toBe(true);

	advance(after(time) * 10);

	expect(callback).not.toHaveBeenCalled();

	timer.continue();
	timer.continue();

	expect(timer.active).toBe(true);
	expect(timer.paused).toBe(false);

	// Only the remaining half
	advance(before(time / 2));

	expect(callback).not.toHaveBeenCalled();

	advance(after(time / 2));

	expect(callback).toHaveBeenCalledTimes(1);
});

test('wait: a paused timer can be stopped', () => {
	const callback = vi.fn();
	const timer = wait(callback, time);

	timer.pause();
	timer.stop();

	expect(timer.paused).toBe(false);

	advance(after(time));

	expect(callback).not.toHaveBeenCalled();
});

test('wait: restart begins the time again', () => {
	const callback = vi.fn();
	const timer = wait(callback, time);

	advance(time / 2);

	timer.restart();
	timer.restart();

	// The time before the restart must not count
	advance(before(time));

	expect(callback).not.toHaveBeenCalled();

	advance(after(time));

	expect(callback).toHaveBeenCalledTimes(1);
});

test('wait: long timers finish at the right time', () => {
	const callback = vi.fn();
	const long = time * 15;

	wait(callback, long);

	advance(before(long));

	expect(callback).not.toHaveBeenCalled();

	advance(after(long));

	expect(callback).toHaveBeenCalledTimes(1);
});
