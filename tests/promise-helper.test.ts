import { AnthillException, PromiseHelper } from "../packages";

describe("PromiseHelper", () => {
  test("promisify", async () => {
    const res = await PromiseHelper.promisify(true);
    expect(res).toEqual(true);
  });

  test("timeout success", async () => {
    const res = await PromiseHelper.timeout(
      new Promise((resolve) => {
        return resolve(null);
      }),
      100,
      new AnthillException("timed out"),
    );

    expect(res).toEqual(null);
  });

  test("timeout failed", () => {
    expect(async () => {
      await PromiseHelper.timeout(new Promise((resolve) => {}), 1, new AnthillException("timed out"));
    }).rejects.toThrow(AnthillException);
  });
});
