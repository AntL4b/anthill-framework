import { QuerystringFieldMiddleware, AwsEvent, HttpResponse } from "../packages";
import { TestResource } from "./resources/test-resource";

describe("QuerystringFieldMiddleware", () => {
  test("No query param / nothing required", async () => {
    const middleware = new QuerystringFieldMiddleware([]);
    expect(await middleware.runBefore(TestResource.getBaseEvent(), TestResource.getBaseContext())).toBeInstanceOf(
      AwsEvent,
    );
  });

  test("Query params / nothing required", async () => {
    const middleware = new QuerystringFieldMiddleware([]);
    const event: AwsEvent = TestResource.getBaseEvent({ queryStringParameters: { key: "test" } });

    expect(await middleware.runBefore(event, TestResource.getBaseContext())).toBeInstanceOf(AwsEvent);
  });

  test("No query param / field required", async () => {
    const middleware = new QuerystringFieldMiddleware(["key1", "key2"]);
    const event: AwsEvent = TestResource.getBaseEvent();
    const result: AwsEvent | HttpResponse = await middleware.runBefore(event, TestResource.getBaseContext());

    expect(result).toBeInstanceOf(HttpResponse);
    expect(JSON.parse(result.body).message).toEqual("[key1, key2] not found in querystring");
  });

  test("Required fields OK", async () => {
    const middleware = new QuerystringFieldMiddleware(["key1", "key2"]);
    const event: AwsEvent = TestResource.getBaseEvent({ queryStringParameters: { key1: "test1", key2: "test2" } });

    expect(await middleware.runBefore(event)).toBeInstanceOf(AwsEvent);
  });

  test("Required fields NOK", async () => {
    const middleware = new QuerystringFieldMiddleware(["key1", "key2", "key3", "key4"]);
    const event: AwsEvent = TestResource.getBaseEvent({ queryStringParameters: { key1: "test1" } });
    const result: AwsEvent | HttpResponse = await middleware.runBefore(event, TestResource.getBaseContext());

    expect(result).toBeInstanceOf(HttpResponse);
    expect(JSON.parse(result.body).message).toEqual("[key2, key3, key4] not found in querystring");
  });
});
