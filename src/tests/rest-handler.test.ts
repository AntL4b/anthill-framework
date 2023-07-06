import { AHException } from "..";
import { AHPromiseHelper } from "..";
import { AHQuerystringFieldMiddleware } from "..";
import { AHAwsEvent } from "..";
import { AHRestMethodEnum } from "..";
import { AHHttpResponse } from "..";
import { AHRestHandler } from "..";
import { AHTestResource } from "./resources/test-resource";


// Override default warn and error log method to avoid jest to crash
global.console.error = (message: string) => {
  console.log(`error: ${message}`);
};

describe('AHRestHandler', () => {
  test('constructor', () => {
    let handler = AHTestResource.getDefaultHandler();
    expect(handler).toBeInstanceOf(AHRestHandler);

    expect(() => {
      handler = new AHRestHandler({
        name: "invalid-name",
        method: AHRestMethodEnum.Get,
        callable: (event: AHAwsEvent) => AHPromiseHelper.promisify(AHHttpResponse.success(null)),
      });
    }).toThrow(AHException);
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
  
    const handler = AHTestResource.getDefaultHandler();
    handler.setCacheConfig(newCacheConfig);

    expect(JSON.stringify(handler["cacheConfig"])).toBe(JSON.stringify(newCacheConfig));
  });

  test('getName', () => {
    const handler = AHTestResource.getDefaultHandler();
    expect(handler.getName()).toBe("handler");
  });

  test('addMiddleware', () => {
    const handler = AHTestResource.getDefaultHandler();

    expect(handler["middlewares"].length).toBe(0);
    handler.addMiddleware(new AHQuerystringFieldMiddleware(['test']));
    expect(handler["middlewares"].length).toBe(1);
  });

  test('handleRequest without middleware', async () => {
    const handler = AHTestResource.getDefaultHandler();
    const response = await handler.handleRequest(AHTestResource.getBaseEvent());

    expect(response).toBeInstanceOf(AHHttpResponse);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("null");
  });

  test('handleRequest with middleware', async () => {
    const handler = AHTestResource.getDefaultHandler();
    handler.addMiddleware(new AHQuerystringFieldMiddleware(['test']));

    const event = AHTestResource.getBaseEvent();

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

    const event = AHTestResource.getBaseEvent();
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

    const response = await handler.handleRequest(AHTestResource.getBaseEvent());
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe(errMess);
  });
});
