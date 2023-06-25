import { AHException } from "../framework/anthill-exception";
import { AHPromiseHelper } from "../framework/helpers/promise-helper";
import { AHQueryStringCheckerMiddleware } from "../framework/middleware/query-string-checker-middleware";
import { AHAwsEvent } from "../framework/models/aws/event/aws-event";
import { AHRestMethodEnum } from "../framework/models/enums/rest-method-enum";
import { AHHttpResponse } from "../framework/models/http/http-response";
import { AHRestHandler } from "../framework/rest-handler";
import { AHTestResourceHelper } from "./resources/test-resource-helper";

// Override default warn and error log method to avoid jest to crash
global.console.error = (message: string) => {
  console.log(`error: ${message}`);
};

const getDefaultHandler = () => {
  return new AHRestHandler({
    name: "handler",
    method: AHRestMethodEnum.Get,
    middlewares: [],
    callable: (event: AHAwsEvent) => AHPromiseHelper.promisify(AHHttpResponse.success(null)),
    cacheConfig: {
      cachable: false
    },
  });
}

describe('AHRestHandler', () => {
  test('constructor', () => {
    const handler = getDefaultHandler();
    expect(handler).toBeInstanceOf(AHRestHandler);
  });

  test('setDefaultCacheConfig', () => {
    const newDefaultCacheConfig = {
      cachable: true,
      ttl: 999,
      maxCacheSize: 123456,
    };
  
    AHRestHandler.setDefaultCacheConfig(newDefaultCacheConfig);

    expect(JSON.stringify(AHRestHandler["defaultCacheConfig"])).toBe(JSON.stringify(newDefaultCacheConfig));
  });

  test('setCacheConfig', () => {
    const newCacheConfig = {
      cachable: true,
      ttl: 111,
      maxCacheSize: 654321,
    };
  
    const handler = getDefaultHandler();
    handler.setCacheConfig(newCacheConfig);

    expect(JSON.stringify(handler["cacheConfig"])).toBe(JSON.stringify(newCacheConfig));
  });

  test('addMiddleware', () => {
    const handler = getDefaultHandler();

    expect(handler["middlewares"].length).toBe(0);
    handler.addMiddleware(new AHQueryStringCheckerMiddleware(['test']));
    expect(handler["middlewares"].length).toBe(1);
  });

  test('handleRequest without middleware', async () => {
    const handler = getDefaultHandler();
    const response = await handler.handleRequest(AHTestResourceHelper.getBaseEvent());

    expect(response).toBeInstanceOf(AHHttpResponse);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("null");
  });

  test('handleRequest with middleware', async () => {
    const handler = getDefaultHandler();
    handler.addMiddleware(new AHQueryStringCheckerMiddleware(['test']));

    const event = AHTestResourceHelper.getBaseEvent();

    let response = await handler.handleRequest(event);
    expect(response.statusCode).toBe(400);

    event.queryStringParameters = { test: "test" };

    response = await handler.handleRequest(event);
    expect(response.statusCode).toBe(200);
  });

  test('handleRequest hit cache', async () => {
    const _callable = jest.fn((event: AHAwsEvent) => AHPromiseHelper.promisify(AHHttpResponse.success(null)));
    const handler: AHRestHandler = new AHRestHandler({
      name: "handler",
      method: AHRestMethodEnum.Get,
      middlewares: [],
      callable: _callable,
      cacheConfig: {
        cachable: true,
        ttl: 120,
        maxCacheSize: 120000
      },
    });

    const event = AHTestResourceHelper.getBaseEvent();
    event.path = '/handle-request-hit-cache';

    let response = await handler.handleRequest(event);
    expect(response.statusCode).toBe(200);
    expect(_callable).toHaveBeenCalledTimes(1);

    response = await handler.handleRequest(event);
    expect(response.statusCode).toBe(200);
    expect(_callable).toHaveBeenCalledTimes(1);

    // Remove cache hit
    handler.setCacheConfig({
      cachable: false,
    });

    // Check that the callable is called
    response = await handler.handleRequest(event);
    expect(response.statusCode).toBe(200);
    expect(_callable).toHaveBeenCalledTimes(2);
  });

  test('handleRequest callable throws exception', async () => {
    const errMess = 'Error message';
    const handler: AHRestHandler = new AHRestHandler({
      name: "handler",
      method: AHRestMethodEnum.Get,
      middlewares: [],
      callable: (event: AHAwsEvent) => { throw new AHException(errMess)},
    });

    const response = await handler.handleRequest(AHTestResourceHelper.getBaseEvent());
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe(errMess);
  });
});
