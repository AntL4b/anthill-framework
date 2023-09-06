const ECMA_SIZES = {
  STRING: 1,
  BOOLEAN: 2,
  NUMBER: 4,
};

export class AHObjectHelper {
  /**
   * Compare an object with another and returns if the objects are equivalent
   * @param a First object to compare
   * @param b Second object to compare
   * @returns True is a object is equivalent to b object, false otherwise
   */
  static isEquivalentObj(a: any, b: any) {
    if (!a && !b) {
      return true;
    } else if (a && b) {
      // Create arrays of property names
      const aProps = Object.keys(a);
      const bProps = Object.keys(b);

      // If number of properties is different, objects are not equivalent
      if (aProps.length !== bProps.length) {
        return false;
      }

      // Verify if all the keys are in both aProps and bProps
      // && If values of same property are not equal, objects are not equivalent
      if (!aProps.every((p) => bProps.includes(p) && a[p] === b[p])) {
        return false;
      }

      // Objects are equivalent
      return true;
    } else return false;
  }

  /**
   * Get Size of object (bytes)
   * @param object Object to get the size of
   * @returns Number of bytes of the given object
   */
  static getSizeOf(object: any) {
    return AHObjectHelper.getCalculator(new WeakSet())(object);
  }

  private static allProperties(obj: any) {
    const stringProperties = [];
    for (const prop in obj) {
      stringProperties.push(prop);
    }
    if (Object.getOwnPropertySymbols) {
      const symbolProperties = Object.getOwnPropertySymbols(obj);
      Array.prototype.push.apply(stringProperties, symbolProperties);
    }
    return stringProperties;
  }

  private static sizeOfObject(seen: any, object: any) {
    if (object == null) {
      return 0;
    }

    let bytes = 0;
    const properties = AHObjectHelper.allProperties(object);
    for (let i = 0; i < properties.length; i++) {
      const key = properties[i];
      // Do not recalculate circular references
      if (typeof object[key] === "object" && object[key] !== null) {
        if (seen.has(object[key])) {
          continue;
        }
        seen.add(object[key]);
      }

      bytes += AHObjectHelper.getCalculator(seen)(key);
      bytes += AHObjectHelper.getCalculator(seen)(object[key]);
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
            return object.map(AHObjectHelper.getCalculator(seen)).reduce(function (acc, curr) {
              return acc + curr;
            }, 0);
          } else {
            return AHObjectHelper.sizeOfObject(seen, object);
          }
        default:
          return 0;
      }
    };
  }
}
