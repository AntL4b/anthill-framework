import { AHException } from '..';
import { AHPromiseHelper } from '..';
import { AHQuerystringFieldMiddleware } from '..';
import { AHAwsEvent } from '..';
import { AHRestMethodEnum } from '..';
import { AHHttpResponse } from '..';
import { AHRestHandler } from '..';
import { AHCacheConfig } from '..';
import { AHTestResource } from './resources/test-resource';

// Override default warn and error log method to avoid jest to crash
global.console.error = (message: string) => {
  console.log(`error: ${message}`);
};

describe('AHRestHandler', () => {
  beforeEach(() => {
    AHRestHandler.setDefaultCacheConfig({
      cachable: false,
      ttl: 120,
      maxCacheSize: 1000000,
    });

    AHRestHandler.setDefaultOptions({
      displayPerformanceMetrics: false,
    });
  });

  test('constructor', () => {
    let handler = AHTestResource.getDefaultRestHandler();
    expect(handler).toBeInstanceOf(AHRestHandler);
  });

  test('setDefaultCacheConfig', () => {
    const newDefaultCacheConfig: AHCacheConfig = {
      cachable: true,
      ttl: 999,
      maxCacheSize: 123456,
    };

    AHRestHandler.setDefaultCacheConfig(newDefaultCacheConfig);

    expect(JSON.stringify(AHRestHandler['defaultCacheConfig'])).toBe(JSON.stringify(newDefaultCacheConfig));
  });

  test('setCacheConfig', () => {
    const newCacheConfig: AHCacheConfig = {
      cachable: true,
      ttl: 111,
      maxCacheSize: 654321,
    };

    const handler = AHTestResource.getDefaultRestHandler();
    handler.setCacheConfig(newCacheConfig);

    expect(JSON.stringify(handler['cacheConfig'])).toBe(JSON.stringify(newCacheConfig));
  });

  test('addMiddleware', () => {
    const handler = AHTestResource.getDefaultRestHandler();

    expect(handler['middlewares'].length).toBe(0);
    handler.addMiddleware(new AHQuerystringFieldMiddleware(['test']));
    expect(handler['middlewares'].length).toBe(1);
  });

  test('handleRequest without middleware', async () => {
    const handler = AHTestResource.getDefaultRestHandler();
    const response = await handler.handleRequest(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext());

    expect(response).toBeInstanceOf(AHHttpResponse);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('null');
  });

  test('handleRequest with middleware', async () => {
    const handler = AHTestResource.getDefaultRestHandler();
    handler.addMiddleware(new AHQuerystringFieldMiddleware(['test']));

    const event = AHTestResource.getBaseEvent();

    let response = await handler.handleRequest(event, AHTestResource.getBaseContext());
    expect(response.statusCode).toBe(400);

    event.queryStringParameters = { test: 'test' };

    response = await handler.handleRequest(event, AHTestResource.getBaseContext());    
    expect(response.statusCode).toBe(200);
  });

  test('handleRequest hit cache', async () => {
    const _callable = jest.fn((event: AHAwsEvent) => AHPromiseHelper.promisify(AHHttpResponse.success(null)));
    const handler = AHTestResource.getDefaultRestHandler({
      name: 'handler',
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
    event.path = '/handle-request-hit-cache';

    let response = await handler.handleRequest(event, AHTestResource.getBaseContext());
    expect(response.statusCode).toBe(200);
    expect(_callable).toHaveBeenCalledTimes(1);

    response = await handler.handleRequest(event, AHTestResource.getBaseContext());
    expect(response.statusCode).toBe(200);
    expect(_callable).toHaveBeenCalledTimes(1);

    // Remove cache hit
    handler.setCacheConfig({
      cachable: false,
    });

    // Check that the callable is called
    response = await handler.handleRequest(event, AHTestResource.getBaseContext());
    expect(response.statusCode).toBe(200);
    expect(_callable).toHaveBeenCalledTimes(2);
  });

  test('handleRequest callable throws exception', async () => {
    const errMess = 'Error message';
    const handler = AHTestResource.getDefaultRestHandler({
      name: 'handler',
      method: AHRestMethodEnum.Get,
      middlewares: [],
      callable: (event: AHAwsEvent) => {
        throw new AHException(errMess);
      },
    });

    const response = await handler.handleRequest(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext());
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe(errMess);
  });
});
