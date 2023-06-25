import { AHObjectHelper } from "../framework/helpers/object-helper";

describe('AHObjectHelper', () => {
  test('clean', () => {
    const now = new Date();
    const obj = new Object();

    expect(
      JSON.stringify(AHObjectHelper.clean({ a: null, b: 2, c: undefined, d: false, e: obj, f: now}))
    ).toBe(
      JSON.stringify({ b: 2, d: false, e: obj, f: now }));
  });

  test('isEquivalentObj', () => {
    expect(AHObjectHelper.isEquivalentObj(null, null)).toBe(true);

    expect(AHObjectHelper.isEquivalentObj(null, {})).toBe(false);

    expect(AHObjectHelper.isEquivalentObj(
      { a: null },
      { a: null, b: null}
    )).toBe(false);

    expect(AHObjectHelper.isEquivalentObj(
      { a: null, b: null },
      { a: null, c: null}
    )).toBe(false);

    expect(AHObjectHelper.isEquivalentObj(
      { a: null, b: 2, c: undefined, d: false, e: 0},
      { a: null, b: 2, c: undefined, d: false, e: 0}
    )).toBe(true);
  });
});
