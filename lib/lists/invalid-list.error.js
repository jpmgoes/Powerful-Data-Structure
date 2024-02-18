"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidListError = void 0;
class InvalidListError extends Error {
    constructor(list) {
        super(`Given list [${list}] with type ${typeof list} is invalid, available types: Iterables, Array, ArrayLike, Generator Functions`);
        this.list = list;
    }
}
exports.InvalidListError = InvalidListError;
//# sourceMappingURL=invalid-list.error.js.map