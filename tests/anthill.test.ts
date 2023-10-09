import {
  AnthillConfig,
  AwsContext,
  AwsEvent,
  AnthillException,
  HttpResponse,
  JsonBodyParserMiddleware,
  LogLevelEnum,
  Logger,
  Middleware,
  ObjectHelper,
  PromiseHelper,
  RestHandlerCacheConfig,
  RestMethodEnum,
  Anthill,
  RestController,
  RestHandler,
  anthill,
  logInfo,
} from "../packages";
import { TestResource } from "./resources/test-resource";

describe("Anthill", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
  });

  test("constructor", () => {
    const app = anthill();
    expect(app).toBeInstanceOf(Anthill);
  });

  test("configure", () => {
    const configureObj: AnthillConfig = {
      controllers: [],
      restHandlerConfig: {
        cacheConfig: {
          cacheable: true,
          ttl: 100,
          maxCacheSize: 1234,
          headersToInclude: [],
        },
        middlewares: [new JsonBodyParserMiddleware()],
      },
      lambdaHandlerConfig: {},
      options: {
        displayPerformanceMetrics: true,
        defaultLogLevel: LogLevelEnum.Info,
      },
    };

    const app = anthill();
    app.configure(configureObj);

    expect(ObjectHelper.isEquivalentObj(anthill()["_configuration"], configureObj)).toBe(true);
  });

  test("configure controllers", async () => {
    @RestController()
    class Test {
      @RestHandler({ method: RestMethodEnum.Get })
      async listTest(event: AwsEvent, context?: AwsContext): Promise<HttpResponse> {
        return PromiseHelper.promisify(HttpResponse.success(null));
      }
    }

    @RestController()
    class Test2 {
      @RestHandler({ method: RestMethodEnum.Get })
      async listTest2(event: AwsEvent, context?: AwsContext): Promise<HttpResponse> {
        return PromiseHelper.promisify(HttpResponse.success(null));
      }
    }

    const app = anthill();
    app.configure({
      controllers: [Test],
    });

    const handlers = app.exposeHandlers();

    expect(Object.keys(handlers).includes("listTest")).toBe(true);
    expect(Object.keys(handlers).includes("listTest2")).toBe(false);
  });

  test("configure cacheConfig", () => {
    const cacheConfig: RestHandlerCacheConfig = {
      cacheable: true,
      ttl: 999,
      maxCacheSize: 123456,
      headersToInclude: ["test-header"],
    };

    const app = anthill();
    app.configure({
      restHandlerConfig: {
        cacheConfig: cacheConfig,
      },
    });

    Anthill.getInstance()._dependencyContainer.register("controller", class Controller {});

    // Set cache config override to {} to ensure the global configuration is used
    expect(
      ObjectHelper.isEquivalentObj(
        TestResource.getDefaultRestHandler({ cacheConfig: {} })["computeCacheConfig"](),
        cacheConfig,
      ),
    ).toBe(true);
  });

  test("configure middleware", async () => {
    const _middlewareFunction = jest.fn(
      (event: AwsEvent, context?: AwsContext): Promise<AwsEvent | HttpResponse> =>
        PromiseHelper.promisify(event),
    );
    class TestMiddleware extends Middleware<any> {
      override runBefore(event: AwsEvent, context: AwsContext): Promise<AwsEvent | HttpResponse> {
        return _middlewareFunction(event, context);
      }
    }

    const app = anthill();
    app.configure({
      restHandlerConfig: {
        middlewares: [new TestMiddleware()],
      },
    });

    // Register default controller for rest handler
    Anthill.getInstance()._dependencyContainer.register("controller", class Controller {});

    const res = await TestResource.getDefaultRestHandler({ middlewares: [] }).handleRequest(
      TestResource.getBaseEvent(),
    );

    expect(res).toBeInstanceOf(HttpResponse);
    expect(_middlewareFunction).toHaveBeenCalled();
  });

  test("configure log level", async () => {
    const app = anthill();
    app.configure({
      options: {
        defaultLogLevel: LogLevelEnum.Error,
      },
    });

    const logger = Logger.getInstance();
    const logHandler = jest.fn(() => {});
    logger.addHandler(logHandler);

    logInfo("info");
    expect(logHandler).toHaveBeenCalledTimes(0);

    app.configure({
      options: {
        defaultLogLevel: LogLevelEnum.Info,
      },
    });

    logInfo("info");
    expect(logHandler).toHaveBeenCalledTimes(1);
  });

  test("_registerHandler", () => {
    const handlerNumber = anthill()["handlers"].length;
    const app = anthill();
    app._registerHandler(TestResource.getDefaultRestHandler());

    expect(anthill()["handlers"].length).toEqual(handlerNumber + 1);
    expect(() => app._registerHandler(TestResource.getDefaultRestHandler())).toThrow(AnthillException);
  });

  test("exposeHandlers", async () => {
    @RestController()
    class Test {
      @RestHandler({ method: RestMethodEnum.Get })
      async listTest(event: AwsEvent, context?: AwsContext): Promise<HttpResponse> {
        return PromiseHelper.promisify(HttpResponse.success(null));
      }
    }

    const app = anthill();
    app.configure({
      controllers: [Test],
    });

    const handlers = app.exposeHandlers();

    expect(Object.keys(handlers).includes("listTest")).toBe(true);

    const res = await handlers.listTest(TestResource.getBaseEvent(), TestResource.getBaseContext());
    expect(res).toBeTruthy();
  });
});
