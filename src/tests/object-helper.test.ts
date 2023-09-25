import { AHObjectHelper } from "..";

describe("AHObjectHelper", () => {
  test("isEquivalentObj", () => {
    expect(AHObjectHelper.isEquivalentObj(null, null)).toEqual(true);

    expect(AHObjectHelper.isEquivalentObj(null, {})).toEqual(false);

    expect(AHObjectHelper.isEquivalentObj({ a: null }, { a: null, b: null })).toEqual(false);

    expect(AHObjectHelper.isEquivalentObj({ a: null, b: null }, { a: null, c: null })).toEqual(false);

    expect(
      AHObjectHelper.isEquivalentObj(
        { a: null, b: 2, c: undefined, d: false, e: 0 },
        { a: null, b: 2, c: undefined, d: false, e: 0 },
      ),
    ).toEqual(true);

    // Nested
    expect(
      AHObjectHelper.isEquivalentObj(
        { a: { b: 2, d: false, c: undefined, e: 0 } },
        { a: { b: 2, c: undefined, d: false, e: 0 } },
      ),
    ).toEqual(true);

    expect(
      AHObjectHelper.isEquivalentObj(
        { a: { b: 3, c: undefined, d: false, e: 0 } },
        { a: { b: 2, c: undefined, d: false, e: 0 } },
      ),
    ).toEqual(false);
  });

  test("isObject", () => {
    expect(AHObjectHelper.isObject(null)).toEqual(false);
    expect(AHObjectHelper.isObject({})).toEqual(true);
    expect(AHObjectHelper.isObject(false)).toEqual(false);
    expect(AHObjectHelper.isObject(1)).toEqual(false);
  });

  test("getSizeOf all managed types", () => {
    expect(AHObjectHelper.getSizeOf({ a: 10 })).toEqual(5);
    expect(AHObjectHelper.getSizeOf({ b: "str" })).toEqual(4);
    expect(AHObjectHelper.getSizeOf({ c: true })).toEqual(3);
    expect(
      AHObjectHelper.getSizeOf({
        d: {
          nested: true,
        },
      }),
    ).toEqual(9);
    expect(AHObjectHelper.getSizeOf({ e: Buffer.from("str2") })).toEqual(5);
    expect(AHObjectHelper.getSizeOf({ f: Symbol.for("str3") })).toEqual(5);
    expect(AHObjectHelper.getSizeOf({ f: Symbol() })).toEqual(1);
    expect(AHObjectHelper.getSizeOf({ g: [1, 2] })).toEqual(9);
    expect(AHObjectHelper.getSizeOf({ h: null })).toEqual(1);
    expect(AHObjectHelper.getSizeOf({ h: undefined })).toEqual(1);
  });

  test("getSizeOf circular object", () => {
    expect(
      AHObjectHelper.getSizeOf({
        a: null,
        get b() {
          return this;
        },
      }),
    ).toEqual(3);
  });
});
