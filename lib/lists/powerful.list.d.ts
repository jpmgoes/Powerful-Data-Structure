import { List } from './list';
export type DefaultCallbackArgsType<T, R> = (value: T, index: number, arr: List<T>) => R;
export type ReduceCallbackArgsType<T, R> = (prev: R, curr: T, index: number, arr: List<T>) => R;
interface IPowerfulList<T> {
    map<U>(transform: DefaultCallbackArgsType<T, U>): IPowerfulList<U>;
    filter(condition: DefaultCallbackArgsType<T, boolean>): IPowerfulList<T>;
    reduce<U>(cb: ReduceCallbackArgsType<T, U>, initialValue: U): U;
    run(): Generator<T | void, void, unknown>;
    clone(): IPowerfulList<T>;
}
declare const kSkipFilterStream: unique symbol;
declare const kReadable: unique symbol;
declare const kProcessStack: unique symbol;
declare const kList: unique symbol;
export declare class PowerfulList<T> implements IPowerfulList<T> {
    private [kProcessStack];
    private readonly [kList];
    constructor(list: List<T>);
    private [kSkipFilterStream];
    private [kReadable];
    map<U>(transform: DefaultCallbackArgsType<T, U>): IPowerfulList<U>;
    filter(cond: DefaultCallbackArgsType<T, boolean>): IPowerfulList<T>;
    reduce<U>(cb: ReduceCallbackArgsType<T, U>, initialValue: U): U;
    run(): Generator<void | T, void, unknown>;
    clone(): PowerfulList<T>;
}
export {};
//# sourceMappingURL=powerful.list.d.ts.map