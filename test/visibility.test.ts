import {afterEach, expect, test, vi} from 'vite-plus/test';
import {repeat} from '../src/repeat';
import {wait} from '../src/wait';
import {advance, after} from './helpers';

const time = 100;

function setHidden(hidden: boolean): void {
	Object.defineProperty(document, 'hidden', {configurable: true, get: () => hidden});

	document.dispatchEvent(new Event('visibilitychange'));
}

afterEach(() => {
	setHidden(false);
});

test('visibility: hiding the page pauses active timers, showing it continues them', () => {
	const callback = vi.fn();
	const timer = wait(callback, time);

	advance(time / 2);

	setHidden(true);

	expect(timer.paused).toBe(true);

	advance(after(time) * 10);

	expect(callback).not.toHaveBeenCalled();

	setHidden(false);

	expect(timer.active).toBe(true);

	advance(after(time));

	expect(callback).toHaveBeenCalledTimes(1);
});

test('visibility: timers paused by the user stay paused when the page is shown', () => {
	const timer = wait(() => {}, time);

	timer.pause();

	setHidden(true);
	setHidden(false);

	expect(timer.paused).toBe(true);
	expect(timer.active).toBe(false);
});

test('visibility: timers stopped while hidden are not continued', () => {
	const callback = vi.fn();
	const timer = repeat(callback, {count: 10, interval: time});

	setHidden(true);

	timer.stop();

	setHidden(false);

	advance(after(time * 10));

	expect(timer.active).toBe(false);
	expect(callback).not.toHaveBeenCalled();
});
