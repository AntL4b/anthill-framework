export class AHArrayHelper {

  /**
   * Helps filtering an array to keep distinct values
   * @param value The value of an array element
   * @param index The index of the element inside the array
   * @param self The array
   * @returns True if the array has no other same values, false otherwise
   */
  static distinct(value: any, index: number, self: Array<any>): boolean {
    return self.indexOf(value) === index;
  }

  /**
   * Group items from an array inside sub arrays
   * @param items Items to group
   * @param nb Max number of item to put inside a sub array
   * @returns 
   */
  static groupItems(items: Array<any>, nb: number): Array<Array<any>> {
    const itemGroups = [];
    do {
      itemGroups.push(items.splice(0, nb));
    } while (items.length);
    return itemGroups;
  };
}