import { AHHttpRequestCache } from '../core/cache/http-request-cache';
import { AHSizeOfHelpers } from '../framework/helpers/size-of-helper';
import { AHHttpResponseBodyStatusEnum } from '../framework/models/enums/http-response-body-status-enum';
import { AHRestMethodEnum } from '../framework/models/enums/rest-method-enum';
import { AHHttpResponse } from '../framework/models/http/http-response';


describe('AHHttpRequestCache', () => {
  const requestCache = AHHttpRequestCache.buildCacheRequestParameters({
    ressource: '',
    methodArn: '',
    path: '/test',
    httpMethod: AHRestMethodEnum.Post,
    headers: {},
    pathParameters: {},
    queryStringParameters: {},
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

  const requestCache2 = AHHttpRequestCache.buildCacheRequestParameters({
    ressource: '',
    methodArn: '',
    path: '/test2',
    httpMethod: AHRestMethodEnum.Post,
    headers: {},
    pathParameters: {},
    queryStringParameters: {},
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

  const response = new AHHttpResponse(200, { status: AHHttpResponseBodyStatusEnum.Success });
  const httpRequestCache = AHHttpRequestCache.getInstance();

  // Set default cache config
  httpRequestCache.setConfig({
    cachable: true,
    ttl: 120,
    maxCacheSize: 120000,
  });

  test('addDataInCache', () => {
    httpRequestCache.flushCache(-1);

    expect(httpRequestCache.data.length).toBe(0);

    httpRequestCache.addDataInCache(
      requestCache,
      response,
    );

    expect(httpRequestCache.data.length).toBe(1);
  });

  test('getCacheItem', () => {
    httpRequestCache.flushCache(-1);

    httpRequestCache.addDataInCache(
      requestCache,
      response,
    );

    const cacheItem = httpRequestCache.getCacheItem(requestCache);

    expect(cacheItem).toBeInstanceOf(AHHttpResponse);
  });

  test('getCacheItem never received yet', () => {
    httpRequestCache.flushCache(-1);

    const cacheItem = httpRequestCache.getCacheItem(requestCache);

    expect(cacheItem).toBeNull();
  });

  test('flushCache', () => {
    httpRequestCache.flushCache(-1);

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
    httpRequestCache.flushCache(-1);

    const sizeOfResponse = AHSizeOfHelpers.getSizeOf({
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
    httpRequestCache.flushCache(-1);

    const sizeOfResponse = AHSizeOfHelpers.getSizeOf({
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
