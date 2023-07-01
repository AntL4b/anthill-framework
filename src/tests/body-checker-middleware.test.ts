
import { AHBodyCheckerMiddleware } from "..";
import { AHAwsEvent } from "..";
import { AHHttpResponse } from "..";
import { AHTestResource } from "./resources/test-resource";


describe('AHBodyCheckerMiddleware', () => {
  test('No body params / nothing required', async () => {
    const middleware = new AHBodyCheckerMiddleware([]);
    expect(await middleware.run(AHTestResource.getBaseEvent())).toBeInstanceOf(AHAwsEvent);
  });

  test('Body param / nothing required', async () => {
    const middleware = new AHBodyCheckerMiddleware([]);
    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    event.body = '{ "key": "test1" }';

    expect(await middleware.run(event)).toBeInstanceOf(AHAwsEvent);
  });

  test('No body param / field required', async () => {
    const middleware = new AHBodyCheckerMiddleware(['key1', 'key2', 'key2.key3']);
    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(JSON.parse(result.body).message).toBe('[key1, key2, key2.key3] not found in body');
  });

  test('Required fields OK', async () => {
    const middleware = new AHBodyCheckerMiddleware(['key1', 'key2', 'key2.key3']);
    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    event.body = '{ "key1": "test1", "key2": { "key3": "test3" } }';

    expect(await middleware.run(event)).toBeInstanceOf(AHAwsEvent);
  });

  test('Required fields NOK', async () => {
    const middleware = new AHBodyCheckerMiddleware(['key1', 'key2', 'key2.key3']);
    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    event.body = '{ "key1": "test1" }';
    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(JSON.parse(result.body).message).toBe('[key2, key2.key3] not found in body');
  });

  test('Required fields NOK without testing all nested nodes', async () => {
    const middleware = new AHBodyCheckerMiddleware(['key1', 'key2.key3']);
    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    event.body = '{ "key1": "test1" }';
    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(JSON.parse(result.body).message).toBe('[key2.key3] not found in body');
  });
});
