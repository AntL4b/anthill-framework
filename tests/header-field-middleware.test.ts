import { HeaderFieldMiddleware, AwsEvent, HttpResponse } from "../packages";
import { TestResource } from "./resources/test-resource";

describe("HeaderFieldMiddleware", () => {
  test("No header / nothing required", async () => {
    const middleware = new HeaderFieldMiddleware([]);
    const event: AwsEvent = TestResource.getBaseEvent();
    event.headers = null;

    expect(await middleware.runBefore(event, TestResource.getBaseContext())).toBeInstanceOf(AwsEvent);
  });

  test("Headers / nothing required", async () => {
    const middleware = new HeaderFieldMiddleware([]);
    const event: AwsEvent = TestResource.getBaseEvent();
    event.headers = { key1: "string" };

    expect(await middleware.runBefore(event, TestResource.getBaseContext())).toBeInstanceOf(AwsEvent);
  });

  test("No header / field required", async () => {
    const middleware = new HeaderFieldMiddleware(["key1", "key2", "key3"]);
    const event: AwsEvent = TestResource.getBaseEvent();
    event.headers = null;
    const result: AwsEvent | HttpResponse = await middleware.runBefore(event, TestResource.getBaseContext());

    expect(result).toBeInstanceOf(HttpResponse);
    expect(JSON.parse(result.body).message).toEqual("[key1, key2, key3] not found in header list");
  });

  test("Required headers OK", async () => {
    const middleware = new HeaderFieldMiddleware(["key1", "key2"]);
    const event: AwsEvent = TestResource.getBaseEvent();
    event.headers = { key1: "test1", key2: "test2" };

    expect(await middleware.runBefore(event, TestResource.getBaseContext())).toBeInstanceOf(AwsEvent);
  });

  test("Required headers NOK", async () => {
    const middleware = new HeaderFieldMiddleware(["key1", "key2"]);
    const event: AwsEvent = TestResource.getBaseEvent();
    event.headers = { key1: "test1" };
    const result: AwsEvent | HttpResponse = await middleware.runBefore(event, TestResource.getBaseContext());

    expect(result).toBeInstanceOf(HttpResponse);
    expect(JSON.parse(result.body).message).toEqual("[key2] not found in header list");
  });
});
