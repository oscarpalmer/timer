import {expect, test} from 'vite-plus/test';
import {wait} from '../src';
import {advance, after} from './helpers';

const time = 1000;

test('debug: timers are only listed and traced when debugging is enabled', () => {
	const timer = wait(() => {}, time);

	wait(() => {}, time);

	expect(globalThis._oscarpalmer_timers).toEqual([]);
	expect(timer.trace).toBeUndefined();

	globalThis._oscarpalmer_timer_debug = true;

	expect(globalThis._oscarpalmer_timers).toHaveLength(2);
	expect(globalThis._oscarpalmer_timers).toContain(timer);
	expect(timer.trace).toBeTypeOf('string');

	timer.stop();

	expect(globalThis._oscarpalmer_timers).toHaveLength(1);

	globalThis._oscarpalmer_timer_debug = false;

	expect(globalThis._oscarpalmer_timers).toEqual([]);
	expect(timer.trace).toBeUndefined();

	advance(after(time));
});
