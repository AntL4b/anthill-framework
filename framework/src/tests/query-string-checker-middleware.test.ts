import { AHQueryStringCheckerMiddleware } from "..";
import { AHAwsEvent } from "..";
import { AHHttpResponse } from "..";
import { AHTestResource } from "./resources/test-resource";


describe('AHQueryStringCheckerMiddleware', () => {
  test('No query param / nothing required', async () => {
    const middleware = new AHQueryStringCheckerMiddleware([]);
    expect(await middleware.run(AHTestResource.getBaseEvent())).toBeInstanceOf(AHAwsEvent);
  });

  test('Query params / nothing required', async () => {
    const middleware = new AHQueryStringCheckerMiddleware([]);
    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    event.queryStringParameters = { key: 'string' };

    expect(await middleware.run(event)).toBeInstanceOf(AHAwsEvent);
  });

  test('No query param / field required', async () => {
    const middleware = new AHQueryStringCheckerMiddleware(['key1', 'key2']);
    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(JSON.parse(result.body).message).toBe('[key1, key2] not found in query string');
  });

  test('Required fields OK', async () => {
    const middleware = new AHQueryStringCheckerMiddleware(['key1', 'key2']);
    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    event.queryStringParameters = { key1: 'test1', key2: 'test2' };

    expect(await middleware.run(event)).toBeInstanceOf(AHAwsEvent);
  });

  test('Required fields NOK', async () => {
    const middleware = new AHQueryStringCheckerMiddleware(['key1', 'key2', 'key3', 'key4']);
    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    event.queryStringParameters = { key1: 'test1' };
    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(JSON.parse(result.body).message).toBe('[key2, key3, key4] not found in query string');
  });
});
