export function repeat(callback: RepeatedCallback, time: number, count: number, afterCallback: AfterCallback | undefined): Repeated;
export function wait(callback: Function, time: number): Waited;
export class Repeated extends Timed {
}
export class Waited extends Timed {
    constructor(callback: Function, time: number);
}
export type AfterCallback = (finished: boolean) => void;
export type RepeatedCallback = (index: number) => void;
declare class Timed {
    constructor(callback: RepeatedCallback, time: number, count: number, afterCallback: AfterCallback | undefined);
    get active(): boolean;
    get finished(): boolean;
    readonly configuration: {
        count: number;
        time: number;
    };
    readonly callbacks: {
        after: AfterCallback | undefined;
        default: RepeatedCallback;
    };
    readonly state: {
        active: boolean;
        finished: boolean;
        frame?: DOMHighResTimeStamp;
    };
    restart(): Timed;
    start(): Timed;
    stop(): Timed;
}
export {};
