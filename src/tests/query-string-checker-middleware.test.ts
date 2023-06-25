import { AHQueryStringCheckerMiddleware } from "../framework/middleware/query-string-checker-middleware";
import { AHAwsEvent } from "../framework/models/aws/event/aws-event";
import { AHRestMethodEnum } from "../framework/models/enums/rest-method-enum";
import { AHHttpResponse } from "../framework/models/http/http-response";


let BASE_EVENT: AHAwsEvent = new AHAwsEvent();

Object.assign(BASE_EVENT, {
  ressource: '',
  path: '/',
  httpMethod: AHRestMethodEnum.Get,
  headers: {},
  requestContext: {
    ressourceId: '',
    resourcePath: '',
    httpMethod: AHRestMethodEnum.Get,
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

describe('AHQueryStringCheckerMiddleware', () => {
  test('No query params / nothing required', async () => {
    const middleware = new AHQueryStringCheckerMiddleware([]);

    expect(await middleware.run(BASE_EVENT)).toBeInstanceOf(AHAwsEvent);
  });

  test('Query params / nothing required', async () => {
    const middleware = new AHQueryStringCheckerMiddleware([]);

    // create a copy of BASE_EVENT to modify it after
    let event: AHAwsEvent = Object.assign(new AHAwsEvent(), JSON.parse(JSON.stringify(BASE_EVENT)));

    event.queryStringParameters = { key: 'string' };

    expect(await middleware.run(event)).toBeInstanceOf(AHAwsEvent);
  });

  test('No query params / field required', async () => {
    const middleware = new AHQueryStringCheckerMiddleware(['field1', 'field2']);

    // create a copy of BASE_EVENT to modify it after
    let event: AHAwsEvent = Object.assign(new AHAwsEvent(), JSON.parse(JSON.stringify(BASE_EVENT)));

    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(result.body).toBe('{"message":"[field1, field2] not found in query string"}');
  });

  test('Required fields OK', async () => {
    const middleware = new AHQueryStringCheckerMiddleware(['field1', 'field2']);

    // create a copy of BASE_EVENT to modify it after
    let event: AHAwsEvent = Object.assign(new AHAwsEvent(), JSON.parse(JSON.stringify(BASE_EVENT)));

    event.queryStringParameters = { field1: 'string', field2: 'string' };

    expect(await middleware.run(event)).toBeInstanceOf(AHAwsEvent);
  });

  test('Required fields NOK', async () => {
    const middleware = new AHQueryStringCheckerMiddleware(['field1', 'field2', 'field3', 'field4']);

    // create a copy of BASE_EVENT to modify it after
    let event: AHAwsEvent = Object.assign(new AHAwsEvent(), JSON.parse(JSON.stringify(BASE_EVENT)));

    event.queryStringParameters = { field1: 'string' };

    const result: AHAwsEvent | AHHttpResponse = await middleware.run(event);

    expect(result).toBeInstanceOf(AHHttpResponse);
    expect(result.body).toBe('{"message":"[field2, field3, field4] not found in query string"}');
  });
});
