export class AHPromiseHelper {

  /**
   * Promisify anything
   * @param result The result to resolve within the promise
   * @returns A promise resolved as the result given as parameter
   */
  static promisify(result: any): Promise<any> {
    return new Promise((resolve) => {
      resolve(result);
    });
  }
}
