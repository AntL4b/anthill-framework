import { AHHttpRequestCache } from '../core/cache/http-request-cache';
import { AHHttpResponseBodyStatusEnum, AHObjectHelper } from '..';
import { AHHttpResponse } from '..';
import { AHTestResource } from './resources/test-resource';


describe('AHHttpRequestCache', () => {
  const requestCache = AHHttpRequestCache.buildCacheRequestParameters(AHTestResource.getBaseEvent({ path: '/test' }));
  const requestCache2 = AHHttpRequestCache.buildCacheRequestParameters(AHTestResource.getBaseEvent({ path: '/test2' }));
  const response = new AHHttpResponse(200, { status: AHHttpResponseBodyStatusEnum.Success });
  const httpRequestCache = new AHHttpRequestCache();

  // Set default cache config
  httpRequestCache.setConfig({
    cachable: true,
    ttl: 120,
    maxCacheSize: 120000,
  });

  beforeEach(() => {
    httpRequestCache.flushCache(-1);
  })

  test('addDataInCache', () => {
    expect(httpRequestCache.data.length).toBe(0);

    httpRequestCache.addDataInCache(
      requestCache,
      response,
    );

    expect(httpRequestCache.data.length).toBe(1);
  });

  test('getCacheItem', () => {
    expect(httpRequestCache.data.length).toBe(0);

    httpRequestCache.addDataInCache(
      requestCache,
      response,
    );

    expect(httpRequestCache.data.length).toBe(1);
    const cacheItem = httpRequestCache.getCacheItem(requestCache);
    expect(cacheItem).toBeInstanceOf(AHHttpResponse);
  });

  test('getCacheItem never received yet', () => {
    const cacheItem = httpRequestCache.getCacheItem(requestCache);
    expect(cacheItem).toBeNull();
  });

  test('flushCache', () => {
    expect(httpRequestCache.data.length).toBe(0);
    
    httpRequestCache.addDataInCache(
      requestCache,
      response,
    );

    httpRequestCache.flushCache(10);
    expect(httpRequestCache.data.length).toBe(1);

    httpRequestCache.flushCache(-1);
    expect(httpRequestCache.data.length).toBe(0);
  });

  test('Cache override when going over maxCacheSize', () => {
    const sizeOfResponse = AHObjectHelper.getSizeOf({
      id: requestCache,
      data: response,
      date: new Date(),
    }) + 1;

    // Set maxCacheSize with twice the size of the response
    httpRequestCache.setConfig({
      cachable: true,
      ttl: 120,
      maxCacheSize: sizeOfResponse * 2,
    });

    httpRequestCache.addDataInCache(
      requestCache,
      response,
    );

    httpRequestCache.addDataInCache(
      requestCache2,
      response,
    );

    expect(httpRequestCache.data.length).toBe(2);

    httpRequestCache.flushCache(-1);

    // Repeat the same process with maxCacheSize set with the size of the response
    httpRequestCache.setConfig({
      cachable: true,
      ttl: 120,
      maxCacheSize: sizeOfResponse,
    });

    httpRequestCache.addDataInCache(
      requestCache,
      response,
    );

    httpRequestCache.addDataInCache(
      requestCache2,
      response,
    );

    expect(httpRequestCache.data.length).toBe(1);
  });

  test('Cache size not sufficient to store item', () => {
    const sizeOfResponse = AHObjectHelper.getSizeOf({
      id: requestCache,
      data: response,
      date: new Date(),
    }) - 1;

    httpRequestCache.setConfig({
      cachable: true,
      ttl: 120,
      maxCacheSize: sizeOfResponse,
    });

    httpRequestCache.addDataInCache(
      requestCache,
      response,
    );

    expect(httpRequestCache.data.length).toBe(0);
  });
});
