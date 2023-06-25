import { AHBodyCheckerMiddleware } from "../framework/middleware/body-checker-middleware";
import { AHAwsEvent } from "../framework/models/aws/event/aws-event";
import { AHHttpResponse } from "../framework/models/http/http-response";
import { AHTestResourceHelper } from "./resources/test-resource-helper";


describe('AHBodyCheckerMiddleware', () => {
  test('No body params / nothing required', async () => {
    const middleware = new AHBodyCheckerMiddleware([]);

    expect(await middleware.run(AHTestResourceHelper.getBaseEvent())).toBeInstanceOf(AHAwsEvent);
  });

  test('Body param / nothing required', async () => {
    const middleware = new AHBodyCheckerMiddleware([]);

    const event: AHAwsEvent = AHTestResourceHelper.getBaseEvent();
    event.body = '{ "key": "test1" }';

    expect(await middleware.run(event)).toBeInstanceOf(AHAwsEvent);
  });

  test('No body param / field required', async () => {
    const middleware = new AHBodyCheckerMiddleware(['key1', 'key2', 'key2.key3']);

    const event: AHAwsEvent = AHTestResourceHelper.getBaseEvent();
    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(result.body).toBe('{"message":"[key1, key2, key2.key3] not found in body"}');
  });

  test('Required fields OK', async () => {
    const middleware = new AHBodyCheckerMiddleware(['key1', 'key2', 'key2.key3']);

    const event: AHAwsEvent = AHTestResourceHelper.getBaseEvent();
    event.body = '{ "key1": "test1", "key2": { "key3": "test3" } }';

    expect(await middleware.run(event)).toBeInstanceOf(AHAwsEvent);
  });

  test('Required fields NOK', async () => {
    const middleware = new AHBodyCheckerMiddleware(['key1', 'key2', 'key2.key3']);

    const event: AHAwsEvent = AHTestResourceHelper.getBaseEvent();
    event.body = '{ "key1": "string1" }';

    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(result.body).toBe('{"message":"[key2, key2.key3] not found in body"}');
  });

  test('Required fields NOK without testing all nested nodes', async () => {
    const middleware = new AHBodyCheckerMiddleware(['key1', 'key2.key3']);

    const event: AHAwsEvent = AHTestResourceHelper.getBaseEvent();
    event.body = '{ "key1": "string1" }';

    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(result.body).toBe('{"message":"[key2.key3] not found in body"}');
  });
});
