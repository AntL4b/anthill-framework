import {
  AwsContext,
  AnthillException,
  Middleware,
  ObjectHelper,
  RestHandlerCacheConfig,
  Anthill,
  RestController,
  RestRequestHandler,
  anthill,
  PromiseHelper,
  QuerystringFieldMiddleware,
  AwsEvent,
  RestMethodEnum,
  HttpResponse,
  RestHandler,
} from "../packages";
import { TestResource } from "./resources/test-resource";

describe("RestHandler", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
    Anthill.getInstance()._dependencyContainer.register("controller", class Controller {});
  });

  test("constructor", () => {
    let handler = TestResource.getDefaultRestHandler();
    expect(handler).toBeInstanceOf(RestRequestHandler);
  });

  test("setCacheConfig", () => {
    const newCacheConfig: RestHandlerCacheConfig = {
      cacheable: true,
      ttl: 111,
      maxCacheSize: 654321,
      headersToInclude: ["test-header"],
    };

    const handler = TestResource.getDefaultRestHandler();
    handler.setCacheConfig(newCacheConfig);

    expect(ObjectHelper.isEquivalentObj(handler["cacheConfig"], newCacheConfig)).toBe(true);
  });

  test("addMiddleware", () => {
    const handler = TestResource.getDefaultRestHandler();

    expect(handler["middlewares"].length).toEqual(0);
    handler.addMiddleware(new QuerystringFieldMiddleware(["test"]));
    expect(handler["middlewares"].length).toEqual(1);
  });

  test("handleRequest without middleware", async () => {
    const handler = TestResource.getDefaultRestHandler();
    const response = await handler.handleRequest(TestResource.getBaseEvent(), TestResource.getBaseContext());

    expect(response).toBeInstanceOf(HttpResponse);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual("null");
  });

  test("handleRequest with middleware", async () => {
    const handler = TestResource.getDefaultRestHandler();
    handler.addMiddleware(new QuerystringFieldMiddleware(["test"]));

    const event = TestResource.getBaseEvent();

    let response = await handler.handleRequest(event, TestResource.getBaseContext());
    expect(response.statusCode).toEqual(400);

    event.queryStringParameters = { test: "test" };

    response = await handler.handleRequest(event, TestResource.getBaseContext());
    expect(response.statusCode).toEqual(200);
  });

  test("handleRequest with middleware throwing an error", async () => {
    const handler = TestResource.getDefaultRestHandler();

    class MyDummyMiddleware extends Middleware<void> {
      override runBefore(event: AwsEvent, context: AwsContext): Promise<AwsEvent | HttpResponse> {
        throw new AnthillException("error happened");
      }
    }

    handler.addMiddleware(new MyDummyMiddleware());

    const event = TestResource.getBaseEvent();

    let response = await handler.handleRequest(event, TestResource.getBaseContext());
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
    class Test {
      @RestHandler({
        method: RestMethodEnum.Get,
        cacheConfig: {
          cacheable: true,
          maxCacheSize: 12345678,
          headersToInclude: ["test-header-handler"],
        },
      })
      async listTest(event: AwsEvent, context?: AwsContext): Promise<HttpResponse> {
        return PromiseHelper.promisify(HttpResponse.success(null));
      }
    }

    const app = anthill();
    app.configure({
      controllers: [Test],
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

    const res = await handlers.listTest(TestResource.getBaseEvent(), TestResource.getBaseContext());
    expect(res).toBeInstanceOf(HttpResponse);

    const handler = app["handlers"].find((h) => h.getName() === "listTest");

    expect(
      ObjectHelper.isEquivalentObj(handler["computeCacheConfig"](), {
        cacheable: true,
        ttl: 123456,
        maxCacheSize: 12345678,
        headersToInclude: ["test-header-anthill", "test-header-controller", "test-header-handler"],
      }),
    ).toBe(true);
  });

  test("multi level middlewares", async () => {
    class AnthillMiddleware extends Middleware<void> {
      override runBefore(event: AwsEvent, context: AwsContext): Promise<AwsEvent | HttpResponse> {
        return PromiseHelper.promisify(event);
      }
    }
    class ControllerMiddleware extends Middleware<void> {
      override runBefore(event: AwsEvent, context: AwsContext): Promise<AwsEvent | HttpResponse> {
        return PromiseHelper.promisify(event);
      }
    }
    class HandlerMiddleware extends Middleware<void> {
      override runBefore(event: AwsEvent, context: AwsContext): Promise<AwsEvent | HttpResponse> {
        return PromiseHelper.promisify(event);
      }
    }

    const anthillMiddleware = new AnthillMiddleware();
    const controllerMiddleware = new ControllerMiddleware();
    const handlerMiddleware = new HandlerMiddleware();

    @RestController({
      middlewares: [controllerMiddleware],
    })
    class Test {
      @RestHandler({
        method: RestMethodEnum.Get,
        middlewares: [handlerMiddleware],
      })
      async listTest(event: AwsEvent, context?: AwsContext): Promise<HttpResponse> {
        return PromiseHelper.promisify(HttpResponse.success(null));
      }
    }

    const app = anthill();
    app.configure({
      controllers: [Test],
      restHandlerConfig: {
        middlewares: [anthillMiddleware],
      },
    });

    const handlers = app.exposeHandlers();
    expect(Object.keys(handlers).includes("listTest")).toBe(true);

    const res = await handlers.listTest(TestResource.getBaseEvent(), TestResource.getBaseContext());
    expect(res).toBeInstanceOf(HttpResponse);

    const handler = app["handlers"].find((h) => h.getName() === "listTest");
    const middlewares = await handler["computeMiddlewares"]();

    expect(
      ObjectHelper.isEquivalentObj(middlewares, [anthillMiddleware, controllerMiddleware, handlerMiddleware]),
    ).toBe(true);
  });

  test("handleRequest hit cache", async () => {
    const _callable = jest.fn((event: AwsEvent) => PromiseHelper.promisify(HttpResponse.success(null)));
    const handler = TestResource.getDefaultRestHandler({
      name: "handler",
      method: RestMethodEnum.Get,
      middlewares: [],
      callable: _callable,
      cacheConfig: {
        cacheable: true,
        ttl: 120,
        maxCacheSize: 120000,
      },
    });

    const event = TestResource.getBaseEvent();
    event.path = "/handle-request-hit-cache";

    let response = await handler.handleRequest(event, TestResource.getBaseContext());
    expect(response.statusCode).toEqual(200);
    expect(_callable).toHaveBeenCalledTimes(1);

    response = await handler.handleRequest(event, TestResource.getBaseContext());
    expect(response.statusCode).toEqual(200);
    expect(_callable).toHaveBeenCalledTimes(1);

    // Remove cache hit
    handler.setCacheConfig({
      cacheable: false,
    });

    // Check that the callable is called
    response = await handler.handleRequest(event, TestResource.getBaseContext());
    expect(response.statusCode).toEqual(200);
    expect(_callable).toHaveBeenCalledTimes(2);
  });

  test("handleRequest callable throws exception", async () => {
    const errMess = "Error message";
    const handler = TestResource.getDefaultRestHandler({
      name: "handler",
      method: RestMethodEnum.Get,
      middlewares: [],
      callable: (event: AwsEvent) => {
        throw new AnthillException(errMess);
      },
    });

    const response = await handler.handleRequest(TestResource.getBaseEvent(), TestResource.getBaseContext());
    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body).message).toEqual(errMess);
  });
});
