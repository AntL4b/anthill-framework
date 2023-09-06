
import { AHJsonBodyParserMiddleware } from "..";
import { AHAwsEvent } from "..";
import { AHHttpResponse } from "..";
import { AHTestResource } from "./resources/test-resource";


describe('AHJsonBodyParserMiddleware', () => {
  test('No body specified', async () => {
    const middleware = new AHJsonBodyParserMiddleware();
    expect(await middleware.runBefore(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext())).toBeInstanceOf(AHAwsEvent);
  });

  test('Body specified JSON', async () => {
    const middleware = new AHJsonBodyParserMiddleware();
    const event: AHAwsEvent = AHTestResource.getBaseEvent({ body: '{ "key": "test1" }' });
    const result: AHAwsEvent | AHHttpResponse = await middleware.runBefore(event, AHTestResource.getBaseContext());

    expect(result).toBeInstanceOf(AHAwsEvent);
    expect(JSON.stringify(result.body)).toEqual(JSON.stringify({ key: "test1" }));
  });

  test('Body specified Base64', async () => {
    const middleware = new AHJsonBodyParserMiddleware();
    const event: AHAwsEvent = AHTestResource.getBaseEvent({ isBase64Encoded: true, body: "eyAia2V5IjogInRlc3QxIiB9" });
    const result: AHAwsEvent | AHHttpResponse = await middleware.runBefore(event, AHTestResource.getBaseContext());

    expect(result).toBeInstanceOf(AHAwsEvent);
    expect(JSON.stringify(result.body)).toEqual(JSON.stringify({ key: "test1" }));
  });

  test('Unsupported media type', async () => {
    const middleware = new AHJsonBodyParserMiddleware();
    const event: AHAwsEvent = AHTestResource.getBaseEvent({ headers: { "Content-Type": "application/xml" }, body: "xml" });
    const result: AHAwsEvent | AHHttpResponse = await middleware.runBefore(event, AHTestResource.getBaseContext());

    expect(result).toBeInstanceOf(AHHttpResponse);
  });
});
