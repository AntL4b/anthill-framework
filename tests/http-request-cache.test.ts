import { HttpRequestCache } from "../packages/core/cache/http-request-cache";
import { HttpResponseBodyStatusEnum, ObjectHelper, HttpResponse } from "../packages";
import { TestResource } from "./resources/test-resource";

describe("HttpRequestCache", () => {
  const requestCache = HttpRequestCache.buildCacheRequestParameters(TestResource.getBaseEvent({ path: "/test" }));
  const requestCache2 = HttpRequestCache.buildCacheRequestParameters(TestResource.getBaseEvent({ path: "/test2" }));
  const response = new HttpResponse(200, { status: HttpResponseBodyStatusEnum.Success });
  const httpRequestCache = new HttpRequestCache();

  // Set default cache config
  httpRequestCache.setConfig({
    cacheable: true,
    ttl: 120,
    maxCacheSize: 120000,
  });

  beforeEach(() => {
    httpRequestCache.flushCache(-1);
  });

  test("addDataInCache", () => {
    expect(httpRequestCache.data.length).toEqual(0);

    httpRequestCache.addDataInCache(requestCache, response);

    expect(httpRequestCache.data.length).toEqual(1);
  });

  test("getCacheItem", () => {
    expect(httpRequestCache.data.length).toEqual(0);

    httpRequestCache.addDataInCache(requestCache, response);

    expect(httpRequestCache.data.length).toEqual(1);
    const cacheItem = httpRequestCache.getCacheItem(requestCache);
    expect(cacheItem).toBeInstanceOf(HttpResponse);
  });

  test("getCacheItem never received yet", () => {
    const cacheItem = httpRequestCache.getCacheItem(requestCache);
    expect(cacheItem).toBeNull();
  });

  test("flushCache", () => {
    expect(httpRequestCache.data.length).toEqual(0);

    httpRequestCache.addDataInCache(requestCache, response);

    httpRequestCache.flushCache(10);
    expect(httpRequestCache.data.length).toEqual(1);

    httpRequestCache.flushCache(-1);
    expect(httpRequestCache.data.length).toEqual(0);
  });

  test("Cache override when going over maxCacheSize", () => {
    const sizeOfResponse =
      ObjectHelper.getSizeOf({
        id: requestCache,
        data: response,
        date: new Date(),
      }) + 1;

    // Set maxCacheSize with twice the size of the response
    httpRequestCache.setConfig({
      cacheable: true,
      ttl: 120,
      maxCacheSize: sizeOfResponse * 2,
    });

    httpRequestCache.addDataInCache(requestCache, response);

    httpRequestCache.addDataInCache(requestCache2, response);

    expect(httpRequestCache.data.length).toEqual(2);

    httpRequestCache.flushCache(-1);

    // Repeat the same process with maxCacheSize set with the size of the response
    httpRequestCache.setConfig({
      cacheable: true,
      ttl: 120,
      maxCacheSize: sizeOfResponse,
    });

    httpRequestCache.addDataInCache(requestCache, response);

    httpRequestCache.addDataInCache(requestCache2, response);

    expect(httpRequestCache.data.length).toEqual(1);
  });

  test("Cache size not sufficient to store item", () => {
    const sizeOfResponse =
      ObjectHelper.getSizeOf({
        id: requestCache,
        data: response,
        date: new Date(),
      }) - 1;

    httpRequestCache.setConfig({
      cacheable: true,
      ttl: 120,
      maxCacheSize: sizeOfResponse,
    });

    httpRequestCache.addDataInCache(requestCache, response);

    expect(httpRequestCache.data.length).toEqual(0);
  });

  test("headers to include", () => {
    httpRequestCache.setConfig({
      cacheable: true,
      ttl: 120,
      maxCacheSize: 120000,
    });

    let request = HttpRequestCache.buildCacheRequestParameters(
      TestResource.getBaseEvent({ headers: { "test-header": "test-header-value" } }),
      ["test-header", "test-header-2"],
    );

    let request2 = HttpRequestCache.buildCacheRequestParameters(
      TestResource.getBaseEvent({ headers: { "test-header": "test-header-2-value" } }),
      ["test-header", "test-header-2"],
    );

    let request3 = HttpRequestCache.buildCacheRequestParameters(
      TestResource.getBaseEvent({ headers: { "test-header": "test-header-value" } }),
      ["test-header", "test-header-2"],
    );

    let request4 = HttpRequestCache.buildCacheRequestParameters(
      TestResource.getBaseEvent({ headers: { "test-header-3": "test-header-value" } }),
      ["test-header", "test-header-2"],
    );

    let request5 = HttpRequestCache.buildCacheRequestParameters(TestResource.getBaseEvent(), [
      "test-header",
      "test-header-2",
    ]);

    let request6 = HttpRequestCache.buildCacheRequestParameters(
      TestResource.getBaseEvent({
        headers: {
          "test-header": "test-header-value",
          "test-header-2": "test-header-value-2",
        },
      }),
      ["test-header", "test-header-2"],
    );

    let cacheResponse = httpRequestCache.getCacheItem(request);
    expect(cacheResponse).toBe(null);

    httpRequestCache.addDataInCache(request, new HttpResponse(200, { status: HttpResponseBodyStatusEnum.Success }));
    expect(httpRequestCache.data.length).toBe(1);

    cacheResponse = httpRequestCache.getCacheItem(request);
    expect(cacheResponse).toBeInstanceOf(HttpResponse);

    cacheResponse = httpRequestCache.getCacheItem(request2);
    expect(cacheResponse).toBe(null);

    cacheResponse = httpRequestCache.getCacheItem(request3);
    expect(cacheResponse).toBeInstanceOf(HttpResponse);

    cacheResponse = httpRequestCache.getCacheItem(request4);
    expect(cacheResponse).toBe(null);

    cacheResponse = httpRequestCache.getCacheItem(request5);
    expect(cacheResponse).toBe(null);

    httpRequestCache.addDataInCache(
      request4,
      new HttpResponse(200, { status: HttpResponseBodyStatusEnum.Success }),
    );
    expect(httpRequestCache.data.length).toBe(2);

    cacheResponse = httpRequestCache.getCacheItem(request5);
    expect(cacheResponse).toBeInstanceOf(HttpResponse);

    cacheResponse = httpRequestCache.getCacheItem(request6);
    expect(cacheResponse).toBe(null);
  });
});
