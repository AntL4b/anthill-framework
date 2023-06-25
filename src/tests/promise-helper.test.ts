import { AHPromiseHelper } from "../framework/helpers/promise-helper";

describe('AHPromiseHelper', () => {
  test('promisify', () => {
    expect(AHPromiseHelper.promisify(true)).resolves.toBe(true);
  });
});
