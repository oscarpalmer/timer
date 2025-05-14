import {expect, test} from 'vitest';
import {delay} from '../src/delay';

test('delay', () =>
	new Promise<void>(done => {
		async function run() {
			let then = performance.now();

			await delay(250);

			expect(performance.now() - then - 250).toBeLessThan(25);

			then = performance.now();

			await delay('blah' as never);

			expect(performance.now() - then).toBeLessThan(25);

			then = performance.now();

			await delay(-1000);

			expect(performance.now() - then).toBeLessThan(25);

			done();
		}

		run();
	}));
