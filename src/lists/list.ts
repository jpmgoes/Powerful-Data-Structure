export type List<T> =
  | Iterable<T>
  | T[]
  | ArrayLike<T>
  | (() => Generator<T, any, any>);
