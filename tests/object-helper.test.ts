import { ObjectHelper } from "../packages";

describe("ObjectHelper", () => {
  test("isEquivalentObj", () => {
    expect(ObjectHelper.isEquivalentObj(null, null)).toEqual(true);

    expect(ObjectHelper.isEquivalentObj(null, {})).toEqual(false);

    expect(ObjectHelper.isEquivalentObj({ a: null }, { a: null, b: null })).toEqual(false);

    expect(ObjectHelper.isEquivalentObj({ a: null, b: null }, { a: null, c: null })).toEqual(false);

    expect(
      ObjectHelper.isEquivalentObj(
        { a: null, b: 2, c: undefined, d: false, e: 0 },
        { a: null, b: 2, c: undefined, d: false, e: 0 },
      ),
    ).toEqual(true);

    // Nested
    expect(
      ObjectHelper.isEquivalentObj(
        { a: { b: 2, d: false, c: undefined, e: 0 } },
        { a: { b: 2, c: undefined, d: false, e: 0 } },
      ),
    ).toEqual(true);

    expect(
      ObjectHelper.isEquivalentObj(
        { a: { b: 3, c: undefined, d: false, e: 0 } },
        { a: { b: 2, c: undefined, d: false, e: 0 } },
      ),
    ).toEqual(false);
  });

  test("isObject", () => {
    expect(ObjectHelper.isObject(null)).toEqual(false);
    expect(ObjectHelper.isObject({})).toEqual(true);
    expect(ObjectHelper.isObject(false)).toEqual(false);
    expect(ObjectHelper.isObject(1)).toEqual(false);
  });

  test("getSizeOf all managed types", () => {
    expect(ObjectHelper.getSizeOf({ a: 10 })).toEqual(5);
    expect(ObjectHelper.getSizeOf({ b: "str" })).toEqual(4);
    expect(ObjectHelper.getSizeOf({ c: true })).toEqual(3);
    expect(
      ObjectHelper.getSizeOf({
        d: {
          nested: true,
        },
      }),
    ).toEqual(9);
    expect(ObjectHelper.getSizeOf({ e: Buffer.from("str2") })).toEqual(5);
    expect(ObjectHelper.getSizeOf({ f: Symbol.for("str3") })).toEqual(5);
    expect(ObjectHelper.getSizeOf({ f: Symbol() })).toEqual(1);
    expect(ObjectHelper.getSizeOf({ g: [1, 2] })).toEqual(9);
    expect(ObjectHelper.getSizeOf({ h: null })).toEqual(1);
    expect(ObjectHelper.getSizeOf({ h: undefined })).toEqual(1);
  });

  test("getSizeOf circular object", () => {
    expect(
      ObjectHelper.getSizeOf({
        a: null,
        get b() {
          return this;
        },
      }),
    ).toEqual(3);
  });
});
