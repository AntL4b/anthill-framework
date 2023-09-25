import { AHQuerystringFieldMiddleware, AHAwsEvent, AHHttpResponse } from "../packages";
import { AHTestResource } from "./resources/test-resource";

describe("AHQuerystringFieldMiddleware", () => {
  test("No query param / nothing required", async () => {
    const middleware = new AHQuerystringFieldMiddleware([]);
    expect(await middleware.runBefore(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext())).toBeInstanceOf(
      AHAwsEvent,
    );
  });

  test("Query params / nothing required", async () => {
    const middleware = new AHQuerystringFieldMiddleware([]);
    const event: AHAwsEvent = AHTestResource.getBaseEvent({ queryStringParameters: { key: "test" } });

    expect(await middleware.runBefore(event, AHTestResource.getBaseContext())).toBeInstanceOf(AHAwsEvent);
  });

  test("No query param / field required", async () => {
    const middleware = new AHQuerystringFieldMiddleware(["key1", "key2"]);
    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    const result: AHAwsEvent | AHHttpResponse = await middleware.runBefore(event, AHTestResource.getBaseContext());

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(JSON.parse(result.body).message).toEqual("[key1, key2] not found in querystring");
  });

  test("Required fields OK", async () => {
    const middleware = new AHQuerystringFieldMiddleware(["key1", "key2"]);
    const event: AHAwsEvent = AHTestResource.getBaseEvent({ queryStringParameters: { key1: "test1", key2: "test2" } });

    expect(await middleware.runBefore(event)).toBeInstanceOf(AHAwsEvent);
  });

  test("Required fields NOK", async () => {
    const middleware = new AHQuerystringFieldMiddleware(["key1", "key2", "key3", "key4"]);
    const event: AHAwsEvent = AHTestResource.getBaseEvent({ queryStringParameters: { key1: "test1" } });
    const result: AHAwsEvent | AHHttpResponse = await middleware.runBefore(event, AHTestResource.getBaseContext());

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(JSON.parse(result.body).message).toEqual("[key2, key3, key4] not found in querystring");
  });
});
