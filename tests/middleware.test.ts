import { Middleware, AwsEvent, HttpResponse } from "../packages";
import { TestResource } from "./resources/test-resource";

describe("Middleware", () => {
  test("runBefore", async () => {
    const middleware = new Middleware();
    const res = await middleware.runBefore(TestResource.getBaseEvent(), TestResource.getBaseContext());
    expect(res).toBeInstanceOf(AwsEvent);
  });

  test("runAfter", async () => {
    const middleware = new Middleware();
    const res = await middleware.runAfter(
      HttpResponse.success(null),
      TestResource.getBaseEvent(),
      TestResource.getBaseContext(),
    );
    expect(res).toBeInstanceOf(HttpResponse);
  });
});
