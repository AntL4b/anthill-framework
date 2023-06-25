import { AHBodyCheckerMiddleware } from "../framework/middleware/body-checker-middleware";
import { AHAwsEvent } from "../framework/models/aws/event/aws-event";
import { AHRestMethodEnum } from "../framework/models/enums/rest-method-enum";
import { AHHttpResponse } from "../framework/models/http/http-response";


let BASE_EVENT: AHAwsEvent = new AHAwsEvent();

Object.assign(BASE_EVENT, {
  ressource: '',
  path: '/',
  httpMethod: AHRestMethodEnum.Post,
  headers: {},
  requestContext: {
    ressourceId: '',
    resourcePath: '',
    httpMethod: AHRestMethodEnum.Post,
    requestTime: '',
    path: '',
    accountId: '',
    protocol: '',
    domainPrefix: '',
    domainName: '',
    apiId: '',
    identity: {
      sourceIp: '',
      userAgent: '',
    },
  },
});

describe('AHBodyCheckerMiddleware', () => {
  test('No body params / nothing required', async () => {
    const middleware = new AHBodyCheckerMiddleware([]);

    expect(await middleware.run(BASE_EVENT)).toBeInstanceOf(AHAwsEvent);
  });

  test('Body params / nothing required', async () => {
    const middleware = new AHBodyCheckerMiddleware([]);

    // Create a copy of BASE_EVENT to modify it after
    let event: AHAwsEvent = Object.assign(new AHAwsEvent(), JSON.parse(JSON.stringify(BASE_EVENT)));

    event.body = `{ "key": "string" }`;

    expect(await middleware.run(event)).toBeInstanceOf(AHAwsEvent);
  });

  test('No body params / field required', async () => {
    const middleware = new AHBodyCheckerMiddleware(['key1', 'key2', 'key2.key3']);

    // create a copy of BASE_EVENT to modify it after
    let event: AHAwsEvent = Object.assign(new AHAwsEvent(), JSON.parse(JSON.stringify(BASE_EVENT)));

    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(result.body).toBe('{"message":"[key1, key2, key2.key3] not found in body"}');
  });

  test('Required fields OK', async () => {
    const middleware = new AHBodyCheckerMiddleware(['key1', 'key2', 'key2.key3']);

    // create a copy of BASE_EVENT to modify it after
    let event: AHAwsEvent = Object.assign(new AHAwsEvent(), JSON.parse(JSON.stringify(BASE_EVENT)));

    event.body = `{ "key1": "string", "key2": { "key3": "3" } }`;

    expect(await middleware.run(event)).toBeInstanceOf(AHAwsEvent);
  });

  test('Required fields NOK', async () => {
    const middleware = new AHBodyCheckerMiddleware(['key1', 'key2', 'key2.key3']);

    // create a copy of BASE_EVENT to modify it after
    let event: AHAwsEvent = Object.assign(new AHAwsEvent(), JSON.parse(JSON.stringify(BASE_EVENT)));

    event.body = `{ "key1": "string" }`;

    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(result.body).toBe('{"message":"[key2, key2.key3] not found in body"}');
  });

  test('Required fields NOK without testing all nested nodes', async () => {
    const middleware = new AHBodyCheckerMiddleware(['key1', 'key2.key3']);

    // create a copy of BASE_EVENT to modify it after
    let event: AHAwsEvent = Object.assign(new AHAwsEvent(), JSON.parse(JSON.stringify(BASE_EVENT)));

    event.body = `{ "key1": "string" }`;

    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(result.body).toBe('{"message":"[key2.key3] not found in body"}');
  });
});
