
import { AHJsonBodyParserMiddleware, AHObjectHelper } from "..";
import { AHAwsEvent } from "..";
import { AHHttpResponse } from "..";
import { AHTestResource } from "./resources/test-resource";


describe('AHBodyCheckerMiddleware', () => {
  test('No body specified', async () => {
    const middleware = new AHJsonBodyParserMiddleware();
    expect(await middleware.run(AHTestResource.getBaseEvent())).toBeInstanceOf(AHAwsEvent);
  });

  test('Body specified JSON', async () => {
    const middleware = new AHJsonBodyParserMiddleware();
    const event: AHAwsEvent = AHTestResource.getBaseEvent({ body: '{ "key": "test1" }' });
    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHAwsEvent);
    expect(AHObjectHelper.isEquivalentObj(result.body, { key: "test1" })).toBe(true);
  });

  test('Body specified Base64', async () => {
    const middleware = new AHJsonBodyParserMiddleware();
    const event: AHAwsEvent = AHTestResource.getBaseEvent({ isBase64Encoded: true, body: "eyAia2V5IjogInRlc3QxIiB9" });
    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHAwsEvent);
    expect(AHObjectHelper.isEquivalentObj(result.body, { key: "test1" })).toBe(true);
  });

  test('Unsupported media type', async () => {
    const middleware = new AHJsonBodyParserMiddleware();
    const event: AHAwsEvent = AHTestResource.getBaseEvent({ headers: { "Content-Type": "application/xml" }, body: "xml" });
    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
  });
});
