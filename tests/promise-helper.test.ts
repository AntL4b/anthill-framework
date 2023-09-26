import { AHException, AHPromiseHelper } from "../packages";

describe("AHPromiseHelper", () => {
  test("promisify", async () => {
    const res = await AHPromiseHelper.promisify(true);
    expect(res).toEqual(true);
  });

  test("timeout success", async () => {
    const res = await AHPromiseHelper.timeout(
      new Promise((resolve) => {
        return resolve(null);
      }),
      100,
      new AHException("timed out"),
    );

    expect(res).toEqual(null);
  });

  test("timeout failed", () => {
    expect(async () => {
      await AHPromiseHelper.timeout(new Promise((resolve) => {}), 1, new AHException("timed out"));
    }).rejects.toThrow(AHException);
  });
});
