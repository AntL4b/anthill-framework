import { JsonBodyParserMiddleware, AwsEvent, HttpResponse } from "../packages";
import { TestResource } from "./resources/test-resource";

describe("JsonBodyParserMiddleware", () => {
  test("No body specified", async () => {
    const middleware = new JsonBodyParserMiddleware();
    expect(await middleware.runBefore(TestResource.getBaseEvent(), TestResource.getBaseContext())).toBeInstanceOf(
      AwsEvent,
    );
  });

  test("Body specified JSON", async () => {
    const middleware = new JsonBodyParserMiddleware();
    const event: AwsEvent = TestResource.getBaseEvent({ body: '{ "key": "test1" }' });
    const result: AwsEvent | HttpResponse = await middleware.runBefore(event, TestResource.getBaseContext());

    expect(result).toBeInstanceOf(AwsEvent);
    expect(JSON.stringify((result as AwsEvent).body)).toEqual(JSON.stringify({ key: "test1" }));
  });

  test("Body specified Base64", async () => {
    const middleware = new JsonBodyParserMiddleware();
    const event: AwsEvent = TestResource.getBaseEvent({ isBase64Encoded: true, body: "eyAia2V5IjogInRlc3QxIiB9" });
    const result: AwsEvent | HttpResponse = await middleware.runBefore(event, TestResource.getBaseContext());

    expect(result).toBeInstanceOf(AwsEvent);
    expect(JSON.stringify((result as AwsEvent).body)).toEqual(JSON.stringify({ key: "test1" }));
  });

  test("Unsupported media type", async () => {
    const middleware = new JsonBodyParserMiddleware();
    const event: AwsEvent = TestResource.getBaseEvent({
      headers: { "Content-Type": "application/xml" },
      body: "xml",
    });
    const result: AwsEvent | HttpResponse = await middleware.runBefore(event, TestResource.getBaseContext());

    expect(result).toBeInstanceOf(HttpResponse);
  });
});
