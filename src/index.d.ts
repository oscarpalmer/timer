type RepeatedCallback = (index: number) => void;
type WaitedCallback = () => void;

interface Timed<Callback> {
	constructor(callback: Callback, time: number, count: number): void;
	restart(): void;
	start(): void;
	stop(): void;
}

export interface Repeated extends Timed<RepeatedCallback> {}
export interface Waited extends Timed<WaitedCallback> {}

export interface Timer {
	repeated(callback: RepeatedCallback, time: number, count: number): Repeated;
	waited(callback: WaitedCallback, time: number): Waited;
}
