import { AHAwsContext, AHException, AHMiddleware } from "..";
import { AHPromiseHelper } from "..";
import { AHQuerystringFieldMiddleware } from "..";
import { AHAwsEvent } from "..";
import { AHRestMethodEnum } from "..";
import { AHHttpResponse } from "..";
import { AHRestHandler } from "..";
import { AHCacheConfig } from "..";
import { AHTestResource } from "./resources/test-resource";

// Override default warn and error log method to avoid jest to crash
global.console.error = (message: string) => {
  console.log(`error: ${message}`);
};

describe('AHRestHandler', () => {
  test('constructor', () => {
    let handler = AHTestResource.getDefaultRestHandler();
    expect(handler).toBeInstanceOf(AHRestHandler);
  });

  test('setCacheConfig', () => {
    const newCacheConfig: AHCacheConfig = {
      cachable: true,
      ttl: 111,
      maxCacheSize: 654321,
    };

    const handler = AHTestResource.getDefaultRestHandler();
    handler.setCacheConfig(newCacheConfig);

    expect(JSON.stringify(handler["cacheConfig"])).toEqual(JSON.stringify(newCacheConfig));
  });

  test('addMiddleware', () => {
    const handler = AHTestResource.getDefaultRestHandler();

    expect(handler["middlewares"].length).toEqual(0);
    handler.addMiddleware(new AHQuerystringFieldMiddleware(["test"]));
    expect(handler["middlewares"].length).toEqual(1);
  });

  test('handleRequest without middleware', async () => {
    const handler = AHTestResource.getDefaultRestHandler();
    const response = await handler.handleRequest(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext());

    expect(response).toBeInstanceOf(AHHttpResponse);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual("null");
  });

  test('handleRequest with middleware', async () => {
    const handler = AHTestResource.getDefaultRestHandler();
    handler.addMiddleware(new AHQuerystringFieldMiddleware(["test"]));

    const event = AHTestResource.getBaseEvent();

    let response = await handler.handleRequest(event, AHTestResource.getBaseContext());
    expect(response.statusCode).toEqual(400);

    event.queryStringParameters = { test: "test" };

    response = await handler.handleRequest(event, AHTestResource.getBaseContext());    
    expect(response.statusCode).toEqual(200);
  });

  test('handleRequest with middleware throwing an error', async () => {
    const handler = AHTestResource.getDefaultRestHandler();

    class MyDummyMiddleware extends AHMiddleware<void> {
      override runBefore(event: AHAwsEvent, context: AHAwsContext): Promise<AHAwsEvent | AHHttpResponse> {
        throw new AHException("error happened");
      }
    }

    handler.addMiddleware(new MyDummyMiddleware());

    const event = AHTestResource.getBaseEvent();

    let response = await handler.handleRequest(event, AHTestResource.getBaseContext());
    expect(response.statusCode).toEqual(400);
  });

  test('handleRequest hit cache', async () => {
    const _callable = jest.fn((event: AHAwsEvent) => AHPromiseHelper.promisify(AHHttpResponse.success(null)));
    const handler = AHTestResource.getDefaultRestHandler({
      name: "handler",
      method: AHRestMethodEnum.Get,
      middlewares: [],
      callable: _callable,
      cacheConfig: {
        cachable: true,
        ttl: 120,
        maxCacheSize: 120000,
      },
    });

    const event = AHTestResource.getBaseEvent();
    event.path = "/handle-request-hit-cache";

    let response = await handler.handleRequest(event, AHTestResource.getBaseContext());
    expect(response.statusCode).toEqual(200);
    expect(_callable).toHaveBeenCalledTimes(1);

    response = await handler.handleRequest(event, AHTestResource.getBaseContext());
    expect(response.statusCode).toEqual(200);
    expect(_callable).toHaveBeenCalledTimes(1);

    // Remove cache hit
    handler.setCacheConfig({
      cachable: false,
    });

    // Check that the callable is called
    response = await handler.handleRequest(event, AHTestResource.getBaseContext());
    expect(response.statusCode).toEqual(200);
    expect(_callable).toHaveBeenCalledTimes(2);
  });

  test('handleRequest callable throws exception', async () => {
    const errMess = "Error message";
    const handler = AHTestResource.getDefaultRestHandler({
      name: "handler",
      method: AHRestMethodEnum.Get,
      middlewares: [],
      callable: (event: AHAwsEvent) => {
        throw new AHException(errMess);
      },
    });

    const response = await handler.handleRequest(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext());
    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body).message).toEqual(errMess);
  });
});
