export type Person = { name: string; age: number; isAvailable: boolean };

export const arrayDatabase: Person[] = [
  { name: 'Person One', age: 10, isAvailable: true },
  { name: 'Person Two', age: 18, isAvailable: false },
  { name: 'Person Three', age: 24, isAvailable: true },
  { name: 'Person Four', age: 34, isAvailable: false },
  { name: 'Person Five', age: 64, isAvailable: false },
  { name: 'Person Six', age: 82, isAvailable: true },
];

export function* generatorDatabase(): Generator<Person, void, unknown> {
  for (const person of arrayDatabase) yield person;
}

export const arrayLikeDatabase = {
  length: 6,
  0: { name: 'Person One', age: 10, isAvailable: true },
  1: { name: 'Person Two', age: 18, isAvailable: false },
  2: { name: 'Person Three', age: 24, isAvailable: true },
  3: { name: 'Person Four', age: 34, isAvailable: false },
  4: { name: 'Person Five', age: 64, isAvailable: false },
  5: { name: 'Person Six', age: 82, isAvailable: true },
};
