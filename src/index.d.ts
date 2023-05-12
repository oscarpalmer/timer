export function repeat(callback: Function, time: number, count: number, afterCallback: Function | null): Repeated;
export function wait(callback: Function, time: number): Waited;
export class Repeated extends Timed {
}
export class Waited extends Timed {
    constructor(callback: Function, time: number);
}
declare class Timed {
    constructor(callback: Function, time: number, count: number, afterCallback: Function | null);
    readonly callbacks: {
        after?: Function;
        default: Function;
    };
    readonly configuration: {
        count: number;
        time: number;
    };
    readonly state: {
        active: boolean;
        finished: boolean;
        frame?: DOMHighResTimeStamp;
    };
    get active(): boolean;
    get finished(): boolean;
    restart(): Timed;
    start(): Timed;
    stop(): Timed;
}
export {};
