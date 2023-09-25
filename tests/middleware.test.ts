import { AHMiddleware, AHAwsEvent, AHHttpResponse } from "../packages";
import { AHTestResource } from "./resources/test-resource";

describe("AHMiddleware", () => {
  test("runBefore", async () => {
    const middleware = new AHMiddleware();
    const res = await middleware.runBefore(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext());
    expect(res).toBeInstanceOf(AHAwsEvent);
  });

  test("runAfter", async () => {
    const middleware = new AHMiddleware();
    const res = await middleware.runAfter(
      AHHttpResponse.success(null),
      AHTestResource.getBaseEvent(),
      AHTestResource.getBaseContext(),
    );
    expect(res).toBeInstanceOf(AHHttpResponse);
  });
});
