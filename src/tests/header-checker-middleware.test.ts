import { AHHeaderCheckerMiddleware } from "../framework/middleware/header-checker-middleware";
import { AHAwsEvent } from "../framework/models/aws/event/aws-event";
import { AHHttpResponse } from "../framework/models/http/http-response";
import { AHTestResourceHelper } from "./resources/test-resource-helper";


describe('AHQueryStringCheckerMiddleware', () => {
  test('No header / nothing required', async () => {
    const middleware = new AHHeaderCheckerMiddleware([]);
    
    const event: AHAwsEvent = AHTestResourceHelper.getBaseEvent();
    event.headers = null;

    expect(await middleware.run(event)).toBeInstanceOf(AHAwsEvent);
  });

  test('Headers / nothing required', async () => {
    const middleware = new AHHeaderCheckerMiddleware([]);

    const event: AHAwsEvent = AHTestResourceHelper.getBaseEvent();
    event.headers = { key1: "string" };

    expect(await middleware.run(event)).toBeInstanceOf(AHAwsEvent);
  });

  test('No header / field required', async () => {
    const middleware = new AHHeaderCheckerMiddleware(['key1', 'key2', 'key3']);

    const event: AHAwsEvent = AHTestResourceHelper.getBaseEvent();
    event.headers = null;
    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(result.body).toBe('{"message":"[key1, key2, key3] not found in header list"}');
  });

  test('Required headers OK', async () => {
    const middleware = new AHHeaderCheckerMiddleware(['key1', 'key2']);

    const event: AHAwsEvent = AHTestResourceHelper.getBaseEvent();
    event.headers = { key1: "test1", key2: "test2" };

    expect(await middleware.run(event)).toBeInstanceOf(AHAwsEvent);
  });

  test('Required headers NOK', async () => {
    const middleware = new AHHeaderCheckerMiddleware(['key1', 'key2']);

    const event: AHAwsEvent = AHTestResourceHelper.getBaseEvent();
    event.headers = { key1: "test1" };

    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(result.body).toBe('{"message":"[key2] not found in header list"}');
  });
});
