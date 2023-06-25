import { AHQueryStringCheckerMiddleware } from "../framework/middleware/query-string-checker-middleware";
import { AHAwsEvent } from "../framework/models/aws/event/aws-event";
import { AHHttpResponse } from "../framework/models/http/http-response";
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
    const middleware = new AHQueryStringCheckerMiddleware(['field1', 'field2']);

    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(result.body).toBe('{"message":"[field1, field2] not found in query string"}');
  });

  test('Required fields OK', async () => {
    const middleware = new AHQueryStringCheckerMiddleware(['field1', 'field2']);

    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    event.queryStringParameters = { field1: 'test1', field2: 'test2' };

    expect(await middleware.run(event)).toBeInstanceOf(AHAwsEvent);
  });

  test('Required fields NOK', async () => {
    const middleware = new AHQueryStringCheckerMiddleware(['field1', 'field2', 'field3', 'field4']);

    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    event.queryStringParameters = { field1: 'test1' };

    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(result.body).toBe('{"message":"[field2, field3, field4] not found in query string"}');
  });
});
