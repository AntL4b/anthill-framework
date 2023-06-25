import { AHHttpRequestCache } from '../core/cache/http-request-cache';
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

  // Get and Set cache
  let httpRequestCache = AHHttpRequestCache.getInstance();
  httpRequestCache = AHHttpRequestCache.getInstance();

  httpRequestCache.setConfig({
    cachable: true,
    ttl: 120,
    maxCacheSize: 120000,
  });

  let getCacheItem = httpRequestCache.getCacheItem(requestCache);

  // Add data in cache
  test('getCacheItem', () => {
    expect(getCacheItem).toBeInstanceOf(AHHttpResponse);
  });

  test('addDataInCache', () => {
    expect(httpRequestCache.data.length).toBe(0);
  });

  httpRequestCache.addDataInCache(
    requestCache,
    new AHHttpResponse(200, { status: AHHttpResponseBodyStatusEnum.Success }),
  );

  const nbOfDataInCache = httpRequestCache.data.length;

  test('addDataInCache', () => {
    expect(nbOfDataInCache).toBe(1);
  });

  getCacheItem = httpRequestCache.getCacheItem(requestCache);

  // To have data to add in cache bigger than max cache size
  httpRequestCache.setConfig({
    cachable: true,
    ttl: 120,
    maxCacheSize: 1,
  });

  httpRequestCache.addDataInCache(
    requestCache,
    new AHHttpResponse(200, { status: AHHttpResponseBodyStatusEnum.Success }),
  );

  // Delete data to free up space
  httpRequestCache.setConfig({
    cachable: true,
    ttl: 120,
    maxCacheSize: 200,
  });

  httpRequestCache.addDataInCache(
    requestCache,
    new AHHttpResponse(200, { status: AHHttpResponseBodyStatusEnum.Success }),
  );

  httpRequestCache.flushCache(10);
  httpRequestCache.flushCache(-10);
});
