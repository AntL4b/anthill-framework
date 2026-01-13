const ECMA_SIZES = {
  STRING: 1,
  BOOLEAN: 2,
  NUMBER: 4,
};

export class ObjectHelper {
  /**
   * Compare an object with another and returns if the objects are equivalent
   * @param obj1 First object to compare
   * @param obj2 Second object to compare
   * @returns True is obj1 object is equivalent to obj2 object, false otherwise
   */
  static isEquivalentObj(obj1: any, obj2: any): boolean {
    if (!obj1 || !obj2) {
      return obj1 === obj2;
    }

    const props1 = Object.getOwnPropertyNames(obj1);
    const props2 = Object.getOwnPropertyNames(obj2);

    if (props1.length != props2.length) {
      return false;
    }

    for (let i = 0; i < props1.length; i++) {
      let val1 = obj1[props1[i]];
      let val2 = obj2[props1[i]];
      let isObjects = ObjectHelper.isObject(val1) && ObjectHelper.isObject(val2);

      if ((isObjects && !ObjectHelper.isEquivalentObj(val1, val2)) || (!isObjects && val1 !== val2)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check that a given value is an object
   * @param object The given value
   * @returns True if the given value is an object, false otherwise
   */
  static isObject(object: any): boolean {
    return object != null && typeof object === "object";
  }

  /**
   * Get Size of object (bytes)
   * @param object Object to get the size of
   * @returns Number of bytes of the given object
   */
  static getSizeOf(object: any) {
    return ObjectHelper.getCalculator(new WeakSet())(object);
  }

  private static allProperties(obj: any) {
    const stringProperties = [];
    for (const prop in obj) {
      stringProperties.push(prop);
    }
    const symbolProperties = Object.getOwnPropertySymbols(obj);
    Array.prototype.push.apply(stringProperties, symbolProperties);
    return stringProperties;
  }

  private static sizeOfObject(seen: any, object: any) {
    if (object == null) {
      return 0;
    }

    let bytes = 0;
    const properties = ObjectHelper.allProperties(object);
    for (let i = 0; i < properties.length; i++) {
      const key = properties[i];
      // Do not recalculate circular references
      if (typeof object[key] === "object" && object[key] !== null) {
        if (seen.has(object[key])) {
          continue;
        }
        seen.add(object[key]);
      }

      bytes += ObjectHelper.getCalculator(seen)(key);
      bytes += ObjectHelper.getCalculator(seen)(object[key]);
    }

    return bytes;
  }

  private static getCalculator(seen: any) {
    return function calculator(object: any): number {
      if (Buffer.isBuffer(object)) {
        return object.length;
      }

      const objectType = typeof object;
      switch (objectType) {
        case "string":
          return object.length * ECMA_SIZES.STRING;
        case "boolean":
          return ECMA_SIZES.BOOLEAN;
        case "number":
          return ECMA_SIZES.NUMBER;
        case "symbol":
          const isGlobalSymbol = Symbol.keyFor && Symbol.keyFor(object);
          return isGlobalSymbol
            ? Symbol.keyFor(object).length * ECMA_SIZES.STRING
            : (object.toString().length - 8) * ECMA_SIZES.STRING;
        case "object":
          if (Array.isArray(object)) {
            return object.map(ObjectHelper.getCalculator(seen)).reduce(function (acc, curr) {
              return acc + curr;
            }, 0);
          } else {
            return ObjectHelper.sizeOfObject(seen, object);
          }
        default:
          return 0;
      }
    };
  }
}
