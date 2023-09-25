import { AHException, AHPromiseHelper } from "..";

describe("AHPromiseHelper", () => {
  test("promisify", async () => {
    const res = await AHPromiseHelper.promisify(true);
    expect(res).toEqual(true);
  });

  test("timeout", () => {
    expect(async () => {
      await AHPromiseHelper.timeout(new Promise((resolve) => {}), 1, new AHException("timed out"));
    }).rejects.toThrow(AHException);
  });
});
