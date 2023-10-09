export class PromiseHelper {
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
   * Wait for the given promise to resolve within a given time (ms)
   * @param promise The promise to wait for
   * @param time The maximum time in ms to wait for the promise to resolve
   * @param exception The exectpion to be thrown if the timeout is reached
   * @returns The promise result
   */
  static timeout(promise: Promise<any>, time: number, exception: Error): any {
    let timer;

    return Promise.race([promise, new Promise((_r, reject) => (timer = setTimeout(reject, time, exception)))]).finally(
      () => clearTimeout(timer),
    );
  }
}
