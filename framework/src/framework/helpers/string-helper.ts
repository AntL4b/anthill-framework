const uuidV4Regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export class AHStringHelper {
  /**
   * Convert a number to a x digit string (ex: "000000num")
   * @param num The number to convert
   * @param x The size of the string to return
   * @returns A string version of the number with leading 0 to fill the size (if needed)
   */
  static convertToXDigitStr(num: number, x: number): string {
    let numberOfZeros = x - num.toString().length;
    let zeros = '';

    while (numberOfZeros > 0) {
      zeros += '0';
      numberOfZeros = numberOfZeros - 1;
    }

    return zeros + num.toString();
  }

  /**
   * Slugify a string
   * @param str String to slugify
   * @param separator Separator to be used between slug words
   * @returns The slugified version of the given string
   */
  static slugify(str: string, separator: string = '-'): string {
    return str
      .toString()
      .normalize('NFD') // split an accented letter in the base letter and the acent
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9' ]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
      .trim()
      .replace(/'/g, separator)
      .replace(/\s+/g, separator)
      .substring(0, 240);
  }

  /**
   * Check that a given string is a valid email
   * @param str The string to test
   * @returns True if the given string is a valid email, false otherwise
   */
  static isValidEmail(str: string): boolean {
    return emailRegex.test(str);
  }

  /**
   * Check that a given string is a valid uuid
   * @param str The string to test
   * @returns True if the given string is a valid uuid, false otherwise
   */
  static isUuid(str: string): boolean {
    return uuidV4Regex.test(str);
  };
}
