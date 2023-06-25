import { AHException } from "../framework/anthill-exception";
import { AHPromiseHelper } from "../framework/helpers/promise-helper";

describe('AHPromiseHelper', () => {
  test('promisify', () => {
    expect(AHPromiseHelper.promisify(true)).resolves.toBe(true);
  });

  test('silentAsync', async () => {
    const handler = jest.fn(() => { throw new AHException()});

    expect(handler).toHaveBeenCalledTimes(0);
    await AHPromiseHelper.silentAsync(handler);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
