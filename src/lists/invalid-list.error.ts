import { List } from './list';

export class InvalidListError<T> extends Error {
  constructor(public readonly list: List<T>) {
    super(
      `Given list [${list}] with type ${typeof list} is invalid, available types: Iterables, Array, ArrayLike, Generator Functions`
    );
  }
}
