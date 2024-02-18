"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PowerfulList = void 0;
const types_1 = require("node:util/types");
const invalid_list_error_1 = require("./invalid-list.error");
const kSkipFilterStream = Symbol('skipFilterStream');
const kReadable = Symbol('readable');
const kProcessStack = Symbol('processStack');
const kList = Symbol('list');
class PowerfulList {
    constructor(list) {
        this[_a] = [];
        const isInvalidData = !Reflect.has(list, 'length') &&
            !(0, types_1.isGeneratorFunction)(list) &&
            !Reflect.has(list, Symbol.iterator);
        if (isInvalidData)
            throw new invalid_list_error_1.InvalidListError(list);
        this[kList] = list;
    }
    [(_a = kProcessStack, kSkipFilterStream)](value) {
        return typeof value === 'object' && Reflect.has(value, 'skipFilterStream');
    }
    *[kReadable](source) {
        const isArrayLike = Reflect.has(source, 'length') && typeof source === 'object';
        if (isArrayLike) {
            const arrLike = source;
            for (let i = 0; i < arrLike.length; i++)
                yield arrLike[i];
            return;
        }
        const iterable = (0, types_1.isGeneratorFunction)(this[kList])
            ? source()
            : source;
        for (const value of iterable)
            yield value;
    }
    map(transform) {
        const list = this[kList];
        function* mapStream(value, index) {
            yield transform(value, index, list);
        }
        this[kProcessStack].push(mapStream);
        return this;
    }
    filter(cond) {
        const list = this[kList];
        function* filterStream(value, index) {
            const notSkip = cond(value, index, list);
            if (notSkip)
                yield value;
            yield { skipFilterStream: true };
        }
        this[kProcessStack].push(filterStream);
        return this;
    }
    reduce(cb, initialValue) {
        const list = this[kList];
        let processedValue = null;
        function* reduceStream(value, index) {
            if (index === 0)
                processedValue = cb(initialValue, value, index, list);
            else
                processedValue = cb(processedValue, value, index, list);
            yield processedValue;
        }
        this[kProcessStack].push(reduceStream);
        const { value } = this.run().next();
        processedValue = null;
        return value;
    }
    *run() {
        const readable = this[kReadable](this[kList]);
        const needYieldJustOnce = /reduce/.test(this[kProcessStack].map((m) => m.name).join(''));
        let currentValueIndex = 0;
        let { done, value } = readable.next();
        while (!done) {
            let currentValue = value;
            for (let index = 0; index < this[kProcessStack].length; index++) {
                const method = this[kProcessStack][index];
                currentValue = method(currentValue, currentValueIndex).next().value;
                if (this[kSkipFilterStream](currentValue))
                    break;
                if (needYieldJustOnce)
                    continue;
                if (this[kProcessStack].length - 1 <= index)
                    yield currentValue;
            }
            const next = readable.next();
            done = next.done;
            value = next.value;
            currentValueIndex++;
            if (done) {
                this[kProcessStack] = [];
                if (needYieldJustOnce)
                    yield currentValue;
            }
        }
    }
    clone() {
        const newInstance = new PowerfulList(this[kList]);
        newInstance[kProcessStack] = [...this[kProcessStack]];
        return newInstance;
    }
}
exports.PowerfulList = PowerfulList;
//# sourceMappingURL=powerful.list.js.map