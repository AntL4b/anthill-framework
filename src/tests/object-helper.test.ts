import { AHObjectHelper } from "..";


describe('AHObjectHelper', () => {
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

  test('getSizeOf all managed types', () => {
    expect(AHObjectHelper.getSizeOf({ a: 10 })).toBe(5);
    expect(AHObjectHelper.getSizeOf({ b: "str" })).toBe(4);
    expect(AHObjectHelper.getSizeOf({ c: true })).toBe(3);
    expect(AHObjectHelper.getSizeOf({ d: {
      nested: true
    }})).toBe(9);
    expect(AHObjectHelper.getSizeOf({ e: Buffer.from('str2') })).toBe(5);
    expect(AHObjectHelper.getSizeOf({ f: Symbol.for("str3") })).toBe(5);
    expect(AHObjectHelper.getSizeOf({ f: Symbol() })).toBe(1);
    expect(AHObjectHelper.getSizeOf({ g: [1, 2] })).toBe(9);
    expect(AHObjectHelper.getSizeOf({ h: null})).toBe(1);
    expect(AHObjectHelper.getSizeOf({ h: undefined})).toBe(1);
  });

  test('getSizeOf circular object', () => {
    expect(AHObjectHelper.getSizeOf({
      a: null,
      get b() {
        return this;
      }
    })).toBe(3);
  });
});
