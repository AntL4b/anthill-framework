import { AHArrayHelper } from "../framework/helpers/array-helper";

describe('AHArrayHelper', () => {
  test('distinct', () => {
    const arr =  [1, 1].filter(AHArrayHelper.distinct);
    expect(arr.length).toBe(1);
  });

  test('groupItems', () => {
    const arr = AHArrayHelper.groupItems([1, 1, 1], 2);

    expect(arr.length).toBe(2);
    expect(arr[0].length).toBe(2);
    expect(arr[1].length).toBe(1);
  });
});
