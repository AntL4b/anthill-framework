const ECMA_SIZES = {
  STRING: 1,
  BOOLEAN: 2,
  NUMBER: 4,
};

export class AHSizeOfHelpers {
  
  /**
   * Get Size of object (bytes)
   * @param object Object to get the size of
   * @returns Number of bytes of the given object
   */
  static getSizeOf(object: any) {
    return AHSizeOfHelpers.getCalculator(new WeakSet())(object);
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
    const properties = AHSizeOfHelpers.allProperties(object);
    for (let i = 0; i < properties.length; i++) {
      const key = properties[i];
      // Do not recalculate circular references
      if (typeof object[key] === 'object' && object[key] !== null) {
        if (seen.has(object[key])) {
          continue;
        }
        seen.add(object[key]);
      }

      bytes += AHSizeOfHelpers.getCalculator(seen)(key);
      bytes += AHSizeOfHelpers.getCalculator(seen)(object[key]);
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
        case 'string':
          return object.length * ECMA_SIZES.STRING;
        case 'boolean':
          return ECMA_SIZES.BOOLEAN;
        case 'number':
          return ECMA_SIZES.NUMBER;
        case 'symbol':
          const isGlobalSymbol = Symbol.keyFor && Symbol.keyFor(object);
          return isGlobalSymbol
            ? Symbol.keyFor(object).length * ECMA_SIZES.STRING
            : (object.toString().length - 8) * ECMA_SIZES.STRING;
        case 'object':
          if (Array.isArray(object)) {
            return object.map(AHSizeOfHelpers.getCalculator(seen)).reduce(function(acc, curr) {
              return acc + curr;
            }, 0);
          } else {
            return AHSizeOfHelpers.sizeOfObject(seen, object);
          }
        default:
          return 0;
      }
    };
  }
}
