import { test, describe, it } from 'node:test';
import assert from 'node:assert';

import { List, PowerfulList, InvalidListError } from '../../../src/index';
import {
  Person,
  arrayDatabase,
  arrayLikeDatabase,
  generatorDatabase,
} from './mocks';

describe('Suite - Powerful Sync List', () => {
  it('Should clone the current powerfulList', () => {
    const simpleArr = arrayDatabase.slice(0, 2);

    const powerfulList = new PowerfulList(simpleArr).map((p) => ({
      n: p.name,
      a: p.age,
    }));

    const powerfulListClone = powerfulList
      .clone()
      .reduce((sum, person) => sum + person.a, 0);

    const firstResult = Array.from(powerfulList.run());
    const firstExpected = [
      { n: 'Person One', a: 10 },
      { n: 'Person Two', a: 18 },
    ];

    assert.deepStrictEqual(powerfulListClone, 28);
    assert.deepStrictEqual(firstResult, firstExpected);
  });

  describe('Should check if the index and list are been recieved in cb params', () => {
    const defaultList = [1, 2, 3, 4];

    it('for map', () => {
      const powerfulList = new PowerfulList(defaultList).map(
        (value, index, list) => {
          return value + index + (list as typeof defaultList)[0];
        }
      );

      const result = Array.from(powerfulList.run());
      const expected = [2, 4, 6, 8];

      assert.deepStrictEqual(result, expected);
    });

    it('for filter', () => {
      const powerfulList = new PowerfulList(defaultList).filter(
        (value, index, list) => {
          return value + index + (list as typeof defaultList)[0] !== 6;
        }
      );

      const result = Array.from(powerfulList.run());
      const expected = [1, 2, 4];

      assert.deepStrictEqual(result, expected);
    });

    it('for reduce', () => {
      const result = new PowerfulList(defaultList).reduce(
        (sum, value, index, list) =>
          sum + value + index + (list as typeof defaultList)[0],
        0
      );

      const expected = 20;

      assert.deepStrictEqual(result, expected);
    });
  });

  describe('Should receive a data and transform each person name to uppercase, filter who is not available, add index as id, remove and sum their ages', () => {
    function getResults(data: List<Person>) {
      const powerfulFilteredList = new PowerfulList(data).filter(
        (person) => person.isAvailable
      );

      const powerfulFilteredListClone = powerfulFilteredList
        .clone()
        .map((person) => ({
          name: person.name,
          isAvailable: person.isAvailable,
        }))
        .map((person, index) => {
          return {
            id: index,
            name: person.name.toUpperCase(),
            isAvailable: person.isAvailable,
          };
        });

      const mapResult = Array.from(powerfulFilteredListClone.run());

      const ageSum = powerfulFilteredList.clone().reduce((sum, p) => {
        return sum + p.age;
      }, 0);

      return { mapResult, ageSum };
    }

    const expectedMap = [
      { id: 0, name: 'PERSON ONE', isAvailable: true },
      { id: 2, name: 'PERSON THREE', isAvailable: true },
      { id: 5, name: 'PERSON SIX', isAvailable: true },
    ];

    const expectedAgeSum = 116;

    test('Array', () => {
      const { ageSum, mapResult } = getResults(arrayDatabase);
      assert.deepStrictEqual(ageSum, expectedAgeSum);
      assert.deepStrictEqual(mapResult, expectedMap);
    });

    test('ArrayLike', () => {
      const { ageSum, mapResult } = getResults(arrayLikeDatabase);
      assert.deepStrictEqual(ageSum, expectedAgeSum);
      assert.deepStrictEqual(mapResult, expectedMap);
    });

    test('Generator', () => {
      const { ageSum, mapResult } = getResults(generatorDatabase);
      assert.deepStrictEqual(ageSum, expectedAgeSum);
      assert.deepStrictEqual(mapResult, expectedMap);
    });

    test('Symbol.iterator', () => {
      class SimpleIterator {
        *[Symbol.iterator]() {
          for (const data of arrayDatabase) yield data;
        }
      }

      const instance = new SimpleIterator();
      const { ageSum, mapResult } = getResults(instance);
      assert.deepStrictEqual(ageSum, expectedAgeSum);
      assert.deepStrictEqual(mapResult, expectedMap);
    });
  });

  it('Should return a empty list', () => {
    const list: number[] = [];
    const result = Array.from(
      new PowerfulList(list).map((a) => String(a)).run()
    );
    const expected: number[] = [];
    assert.deepStrictEqual(result, expected);
  });

  it('Should throw a InvalidListData given a invalid input', () => {
    const object: any = {};
    const list = object as unknown as number[];
    const throwError = () => new PowerfulList(list);
    try {
      throwError();
    } catch (e) {
      const error = e as Error;
      if (!(e instanceof InvalidListError)) throw new Error(error.message);
      assert.deepStrictEqual(list, e.list);
      assert.deepStrictEqual(
        e.message,
        'Given list [[object Object]] with type object is invalid, available types: Iterables, Array, ArrayLike, Generator Functions'
      );
    }
    assert.throws(throwError);
  });
});
