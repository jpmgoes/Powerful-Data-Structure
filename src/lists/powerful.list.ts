import { isGeneratorFunction } from 'node:util/types';
import { List } from './list';
import { InvalidListError } from './invalid-list.error';

type ProcessMethod = (value: any, index: number) => Generator;

export type DefaultCallbackArgsType<T, R> = (
  value: T,
  index: number,
  arr: List<T>
) => R;

export type ReduceCallbackArgsType<T, R> = (
  prev: R,
  curr: T,
  index: number,
  arr: List<T>
) => R;

interface IPowerfulList<T> {
  map<U>(transform: DefaultCallbackArgsType<T, U>): IPowerfulList<U>;
  filter(condition: DefaultCallbackArgsType<T, boolean>): IPowerfulList<T>;
  reduce<U>(cb: ReduceCallbackArgsType<T, U>, initialValue: U): U;
  run(): Generator<T | void, void, unknown>;
  clone(): IPowerfulList<T>;
}

const kSkipFilterStream = Symbol('skipFilterStream');
const kReadable = Symbol('readable');
const kProcessStack = Symbol('processStack');
const kList = Symbol('list');

export class PowerfulList<T> implements IPowerfulList<T> {
  private [kProcessStack]: ProcessMethod[] = [];
  private readonly [kList]: List<T>;

  constructor(list: List<T>) {
    const isInvalidData =
      !Reflect.has(list, 'length') &&
      !isGeneratorFunction(list) &&
      !Reflect.has(list, Symbol.iterator);

    if (isInvalidData) throw new InvalidListError<T>(list);

    this[kList] = list;
  }

  private [kSkipFilterStream](value: any) {
    return typeof value === 'object' && Reflect.has(value, 'skipFilterStream');
  }

  private *[kReadable](source: List<T>) {
    const isArrayLike =
      Reflect.has(source, 'length') && typeof source === 'object';

    if (isArrayLike) {
      const arrLike = source as ArrayLike<T>;
      for (let i = 0; i < arrLike.length; i++) yield arrLike[i];
      return;
    }

    const iterable: Iterable<T> = isGeneratorFunction(this[kList])
      ? (source as unknown as CallableFunction)()
      : source;

    for (const value of iterable) yield value;
  }

  public map<U>(transform: DefaultCallbackArgsType<T, U>) {
    const list = this[kList];
    function* mapStream(value: T, index: number) {
      yield transform(value, index, list);
    }

    this[kProcessStack].push(mapStream);
    return this as any as IPowerfulList<U>;
  }

  public filter(cond: DefaultCallbackArgsType<T, boolean>) {
    const list = this[kList];
    function* filterStream(value: any, index: number) {
      const notSkip = cond(value, index, list);
      if (notSkip) yield value;
      yield { skipFilterStream: true };
    }

    this[kProcessStack].push(filterStream);
    return this as IPowerfulList<T>;
  }

  public reduce<U>(cb: ReduceCallbackArgsType<T, U>, initialValue: U) {
    const list = this[kList];

    let processedValue: any = null;
    function* reduceStream(value: T, index: number) {
      if (index === 0) processedValue = cb(initialValue, value, index, list);
      else processedValue = cb(processedValue, value, index, list);
      yield processedValue;
    }

    this[kProcessStack].push(reduceStream);
    const { value } = this.run().next();
    processedValue = null;
    return value as U;
  }

  public *run() {
    const readable = this[kReadable](this[kList]);

    const needYieldJustOnce = /reduce/.test(
      this[kProcessStack].map((m) => m.name).join('')
    );

    let currentValueIndex = 0;
    let { done, value } = readable.next();
    while (!done) {
      let currentValue = value;
      for (let index = 0; index < this[kProcessStack].length; index++) {
        const method = this[kProcessStack][index];
        currentValue = method(currentValue, currentValueIndex).next().value;
        if (this[kSkipFilterStream](currentValue)) break;
        if (needYieldJustOnce) continue;
        if (this[kProcessStack].length - 1 <= index) yield currentValue;
      }
      const next = readable.next();
      done = next.done;
      value = next.value;
      currentValueIndex++;
      if (done) {
        this[kProcessStack] = [];
        if (needYieldJustOnce) yield currentValue;
      }
    }
  }

  clone() {
    const newInstance = new PowerfulList<T>(this[kList]);
    newInstance[kProcessStack] = [...this[kProcessStack]];
    return newInstance;
  }
}
