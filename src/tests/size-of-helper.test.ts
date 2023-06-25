import { AHSizeOfHelpers } from "../framework/helpers/size-of-helper";

describe('AHSizeOfHelpers', () => {
  test('getSizeOf basic object', () => {
    expect(AHSizeOfHelpers.getSizeOf({ a: 10 })).toBe(5);
    expect(AHSizeOfHelpers.getSizeOf({ b: "str" })).toBe(4);
    expect(AHSizeOfHelpers.getSizeOf({ c: true })).toBe(3);
    expect(AHSizeOfHelpers.getSizeOf({ d: {
      nested: true
    }})).toBe(9);
    expect(AHSizeOfHelpers.getSizeOf({ e: Buffer.from('str2') })).toBe(5);
    expect(AHSizeOfHelpers.getSizeOf({ f: Symbol.for("str3") })).toBe(5);
    expect(AHSizeOfHelpers.getSizeOf({ f: Symbol() })).toBe(1);
    expect(AHSizeOfHelpers.getSizeOf({ g: [1, 2] })).toBe(9);
    expect(AHSizeOfHelpers.getSizeOf({ h: null})).toBe(1);
    expect(AHSizeOfHelpers.getSizeOf({ h: undefined})).toBe(1);
  });

  test('getSizeOf circular object', () => {
    expect(AHSizeOfHelpers.getSizeOf({
      a: null,
      get b() {
        return this;
      }
    })).toBe(3);
  });
});
