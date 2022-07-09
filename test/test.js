import {Repeated, Timer, Waited} from '../dist/timer.js';

describe('Timer, factory', function () {
  it('should create and start a repeated timer', function () {
		chai.assert.ok(Timer.repeat(() => {}, 0, 2) instanceof Repeated);
	});

	it('should create and start a waited timer', function () {
		chai.assert.ok(Timer.wait(() => {}, 0) instanceof Waited);
	});
});

describe('Timer, Repeated', function () {
	describe('Constructor', function () {
		it('should create a proper repeated timer', function () {
			chai.assert.ok(new Repeated(() => {}, 0, 2) instanceof Repeated);
		});
	
		it('should handle bad parameters', function () {
			chai.assert.throws(function () { new Repeated(null, null, null); }, /callback/);
			chai.assert.throws(function () { new Repeated(() => {}, null, null); }, /time/);
			chai.assert.throws(function () { new Repeated(() => {}, 0, null); }, /count/);
			chai.assert.throws(function () { new Repeated(() => {}, 0, 1); }, /count/);
		});
	});

	describe('Run', function () {
		it('should run as many times as set', function (done) {
			let value = 0;

			Timer.repeat(() => {
				value += 1;
			}, 25, 10);

			Timer.wait(() => {
				chai.assert.equal(value, 10);

				done();
			}, 500);
		});

		it('should run until canceled', function (done) {
			let value = 0;

			const repeated = Timer.repeat(() => {
				value += 1;
			}, 25, 10);

			Timer.wait(() => {
				repeated.stop();
			}, 125);

			Timer.wait(() => {
				chai.assert.ok(value < 10);

				done();
			}, 500);
		});
	});
});

describe('Timer, Waited', function () {
	describe('Constructor', function () {
		it('should create a proper waited timer', function () {
			chai.assert.ok(new Waited(() => {}, 0));
		});
	
		it('should handle bad parameters', function () {
			chai.assert.throws(function () { new Waited(null, null); }, /callback/);
			chai.assert.throws(function () { new Waited(() => {}, null); }, /time/);
		});
	});
});

describe('Timer, Repeated & Waited', function () {
	describe('Methods', function () {
		it('should be able to start', function (done) {
			(new Waited(() => {
				done();
			}, 125)).start();
		});
	
		it('should be able to stop', function (done) {
			let value = 0;
	
			const waited = new Waited(() => {
				value = 1234;
			}, 125);
	
			Timer.wait(() => {
				waited.stop();
			}, 250);
	
			Timer.wait(() => {
				chai.assert.equal(value, 0);
	
				done();
			}, 375);
		});
	
		it('should be able to restart', function (done) {
			let value = 0;
	
			const waited = new Waited(() => {
				value += 1;
			}, 125);
	
			waited.start();
	
			Timer.wait(() => {
				waited.restart();
			}, 250);
	
			Timer.wait(() => {
				chai.assert.equal(value, 2);
	
				done();
			}, 500);
		});
	});
});
