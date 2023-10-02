import {
  AHAwsContext,
  AHException,
  AHMiddleware,
  AHObjectHelper,
  AHRestHandlerCacheConfig,
  Anthill,
  RestController,
  RestHandler,
  anthill,
  AHPromiseHelper,
  AHQuerystringFieldMiddleware,
  AHAwsEvent,
  AHRestMethodEnum,
  AHHttpResponse,
  AHRestHandler,
} from "../packages";
import { AHTestResource } from "./resources/test-resource";

describe("AHRestHandler", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
    Anthill.getInstance()._dependencyContainer.register("controller", class Controller {});
  });

  test("constructor", () => {
    let handler = AHTestResource.getDefaultRestHandler();
    expect(handler).toBeInstanceOf(AHRestHandler);
  });

  test("setCacheConfig", () => {
    const newCacheConfig: AHRestHandlerCacheConfig = {
      cacheable: true,
      ttl: 111,
      maxCacheSize: 654321,
      headersToInclude: ["test-header"],
    };

    const handler = AHTestResource.getDefaultRestHandler();
    handler.setCacheConfig(newCacheConfig);

    expect(AHObjectHelper.isEquivalentObj(handler["cacheConfig"], newCacheConfig)).toBe(true);
  });

  test("addMiddleware", () => {
    const handler = AHTestResource.getDefaultRestHandler();

    expect(handler["middlewares"].length).toEqual(0);
    handler.addMiddleware(new AHQuerystringFieldMiddleware(["test"]));
    expect(handler["middlewares"].length).toEqual(1);
  });

  test("handleRequest without middleware", async () => {
    const handler = AHTestResource.getDefaultRestHandler();
    const response = await handler.handleRequest(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext());

    expect(response).toBeInstanceOf(AHHttpResponse);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual("null");
  });

  test("handleRequest with middleware", async () => {
    const handler = AHTestResource.getDefaultRestHandler();
    handler.addMiddleware(new AHQuerystringFieldMiddleware(["test"]));

    const event = AHTestResource.getBaseEvent();

    let response = await handler.handleRequest(event, AHTestResource.getBaseContext());
    expect(response.statusCode).toEqual(400);

    event.queryStringParameters = { test: "test" };

    response = await handler.handleRequest(event, AHTestResource.getBaseContext());
    expect(response.statusCode).toEqual(200);
  });

  test("handleRequest with middleware throwing an error", async () => {
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

  test("multi level cache", async () => {
    @RestController({
      cacheConfig: {
        cacheable: false,
        ttl: 123456,
        headersToInclude: ["test-header-controller"],
      },
    })
    class AHTest {
      @RestHandler({
        method: AHRestMethodEnum.Get,
        cacheConfig: {
          cacheable: true,
          maxCacheSize: 12345678,
          headersToInclude: ["test-header-handler"],
        },
      })
      async listTest(event: AHAwsEvent, context?: AHAwsContext): Promise<AHHttpResponse> {
        return AHPromiseHelper.promisify(AHHttpResponse.success(null));
      }
    }

    const app = anthill();
    app.configure({
      controllers: [AHTest],
      restHandlerConfig: {
        cacheConfig: {
          cacheable: true,
          maxCacheSize: 123456,
          headersToInclude: ["test-header-anthill"],
        },
      },
    });

    const handlers = app.exposeHandlers();
    expect(Object.keys(handlers).includes("listTest")).toBe(true);

    const res = await handlers.listTest(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext());
    expect(res).toBeInstanceOf(AHHttpResponse);

    const handler = app["handlers"].find((h) => h.getName() === "listTest");

    expect(
      AHObjectHelper.isEquivalentObj(handler["computeCacheConfig"](), {
        cacheable: true,
        ttl: 123456,
        maxCacheSize: 12345678,
        headersToInclude: ["test-header-anthill", "test-header-controller", "test-header-handler"],
      }),
    ).toBe(true);
  });

  test("multi level middlewares", async () => {
    class AnthillMiddleware extends AHMiddleware<void> {
      override runBefore(event: AHAwsEvent, context: AHAwsContext): Promise<AHAwsEvent | AHHttpResponse> {
        return AHPromiseHelper.promisify(event);
      }
    }
    class ControllerMiddleware extends AHMiddleware<void> {
      override runBefore(event: AHAwsEvent, context: AHAwsContext): Promise<AHAwsEvent | AHHttpResponse> {
        return AHPromiseHelper.promisify(event);
      }
    }
    class HandlerMiddleware extends AHMiddleware<void> {
      override runBefore(event: AHAwsEvent, context: AHAwsContext): Promise<AHAwsEvent | AHHttpResponse> {
        return AHPromiseHelper.promisify(event);
      }
    }

    const anthillMiddleware = new AnthillMiddleware();
    const controllerMiddleware = new ControllerMiddleware();
    const handlerMiddleware = new HandlerMiddleware();

    @RestController({
      middlewares: [controllerMiddleware],
    })
    class AHTest {
      @RestHandler({
        method: AHRestMethodEnum.Get,
        middlewares: [handlerMiddleware],
      })
      async listTest(event: AHAwsEvent, context?: AHAwsContext): Promise<AHHttpResponse> {
        return AHPromiseHelper.promisify(AHHttpResponse.success(null));
      }
    }

    const app = anthill();
    app.configure({
      controllers: [AHTest],
      restHandlerConfig: {
        middlewares: [anthillMiddleware],
      },
    });

    const handlers = app.exposeHandlers();
    expect(Object.keys(handlers).includes("listTest")).toBe(true);

    const res = await handlers.listTest(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext());
    expect(res).toBeInstanceOf(AHHttpResponse);

    const handler = app["handlers"].find((h) => h.getName() === "listTest");
    const middlewares = await handler["computeMiddlewares"]();

    expect(
      AHObjectHelper.isEquivalentObj(middlewares, [anthillMiddleware, controllerMiddleware, handlerMiddleware]),
    ).toBe(true);
  });

  test("handleRequest hit cache", async () => {
    const _callable = jest.fn((event: AHAwsEvent) => AHPromiseHelper.promisify(AHHttpResponse.success(null)));
    const handler = AHTestResource.getDefaultRestHandler({
      name: "handler",
      method: AHRestMethodEnum.Get,
      middlewares: [],
      callable: _callable,
      cacheConfig: {
        cacheable: true,
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
      cacheable: false,
    });

    // Check that the callable is called
    response = await handler.handleRequest(event, AHTestResource.getBaseContext());
    expect(response.statusCode).toEqual(200);
    expect(_callable).toHaveBeenCalledTimes(2);
  });

  test("handleRequest callable throws exception", async () => {
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
