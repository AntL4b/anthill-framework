import { AHPromiseHelper } from "..";


describe('AHPromiseHelper', () => {
  test('promisify', () => {
    expect(AHPromiseHelper.promisify(true)).resolves.toEqual(true);
  });
});
