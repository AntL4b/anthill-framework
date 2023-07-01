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

  /**
   * Silently execute an async function. If it fails, it will not emit an exception
   * @param f The function to execute
   */
    static async silentAsync(f: () => Promise<any>): Promise<void> {
      try {
        await f();
      } catch (error) {}
    }
}
