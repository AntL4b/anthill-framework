import { AHArrayHelper } from "../framework/helpers/array-helper";

describe('AHArrayHelper', () => {
  test('distinct', () => {
    let arr =  [1, 1].filter(AHArrayHelper.distinct);
    expect(arr.length).toBe(1);

    arr =  [1, 2, 1, 2, 3].filter(AHArrayHelper.distinct);
    expect(arr.length).toBe(3);
  });

  test('groupItems', () => {
    let arr = AHArrayHelper.groupItems([1, 1, 1], 2);

    expect(arr.length).toBe(2);
    expect(arr[0].length).toBe(2);
    expect(arr[1].length).toBe(1);

    arr = AHArrayHelper.groupItems([1, 1, 1], 10);

    expect(arr.length).toBe(1);
    expect(arr[0].length).toBe(3);

    arr = AHArrayHelper.groupItems([1, 1, 1], -1);

    expect(arr.length).toBe(1);
    expect(arr[0].length).toBe(3);
  });
});
