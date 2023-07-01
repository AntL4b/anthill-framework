export class AHObjectHelper {

  /**
   * Clean null and undefined values from an object
   * @param obj The object to clean
   * @returns A cleaned version of the given object
   */
  static clean(obj: any): any {
    return Object.keys(obj)
      .filter((k) => obj[k] != null) // Remove undef. and null.
      .reduce(
        (newObj, k) =>
          typeof obj[k] === 'object' && !(obj[k] instanceof Date)
            ? { ...newObj, [k]: this.clean(obj[k]) } // Recurse.
            : { ...newObj, [k]: obj[k] }, // Copy value.
        {},
      );
  }


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
}