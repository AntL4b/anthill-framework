import {
  AHAnthillConfig,
  AHAwsContext,
  AHAwsEvent,
  AHException,
  AHHttpResponse,
  AHJsonBodyParserMiddleware,
  AHLogLevelEnum,
  AHLogger,
  AHMiddleware,
  AHObjectHelper,
  AHPromiseHelper,
  AHRestHandlerCacheConfig,
  AHRestMethodEnum,
  Anthill,
  RestController,
  RestHandler,
  anthill,
  logInfo,
} from "../packages";
import { AHTestResource } from "./resources/test-resource";

describe("Anthill", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
  });

  test("constructor", () => {
    const app = anthill();
    expect(app).toBeInstanceOf(Anthill);
  });

  test("configure", () => {
    const configureObj: AHAnthillConfig = {
      controllers: [],
      restHandlerConfig: {
        cacheConfig: {
          cacheable: true,
          ttl: 100,
          maxCacheSize: 1234,
          headersToInclude: [],
        },
        middlewares: [new AHJsonBodyParserMiddleware()],
      },
      lambdaHandlerConfig: {},
      options: {
        displayPerformanceMetrics: true,
        defaultLogLevel: AHLogLevelEnum.Info,
      },
    };

    const app = anthill();
    app.configure(configureObj);

    expect(AHObjectHelper.isEquivalentObj(anthill()["_configuration"], configureObj)).toBe(true);
  });

  test("configure controllers", async () => {
    @RestController()
    class AHTest {
      @RestHandler({ method: AHRestMethodEnum.Get })
      async listTest(event: AHAwsEvent, context?: AHAwsContext): Promise<AHHttpResponse> {
        return AHPromiseHelper.promisify(AHHttpResponse.success(null));
      }
    }

    @RestController()
    class AHTest2 {
      @RestHandler({ method: AHRestMethodEnum.Get })
      async listTest2(event: AHAwsEvent, context?: AHAwsContext): Promise<AHHttpResponse> {
        return AHPromiseHelper.promisify(AHHttpResponse.success(null));
      }
    }

    const app = anthill();
    app.configure({
      controllers: [AHTest],
    });

    const handlers = app.exposeHandlers();

    expect(Object.keys(handlers).includes("listTest")).toBe(true);
    expect(Object.keys(handlers).includes("listTest2")).toBe(false);
  });

  test("configure cacheConfig", () => {
    const cacheConfig: AHRestHandlerCacheConfig = {
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
      AHObjectHelper.isEquivalentObj(
        AHTestResource.getDefaultRestHandler({ cacheConfig: {} })["computeCacheConfig"](),
        cacheConfig,
      ),
    ).toBe(true);
  });

  test("configure middleware", async () => {
    const _middlewareFunction = jest.fn(
      (event: AHAwsEvent, context?: AHAwsContext): Promise<AHAwsEvent | AHHttpResponse> =>
        AHPromiseHelper.promisify(event),
    );
    class AHTestMiddleware extends AHMiddleware<any> {
      override runBefore(event: AHAwsEvent, context: AHAwsContext): Promise<AHAwsEvent | AHHttpResponse> {
        return _middlewareFunction(event, context);
      }
    }

    const app = anthill();
    app.configure({
      restHandlerConfig: {
        middlewares: [new AHTestMiddleware()],
      },
    });

    // Register default controller for rest handler
    Anthill.getInstance()._dependencyContainer.register("controller", class Controller {});

    const res = await AHTestResource.getDefaultRestHandler({ middlewares: [] }).handleRequest(
      AHTestResource.getBaseEvent(),
    );

    expect(res).toBeInstanceOf(AHHttpResponse);
    expect(_middlewareFunction).toHaveBeenCalled();
  });

  test("configure log level", async () => {
    const app = anthill();
    app.configure({
      options: {
        defaultLogLevel: AHLogLevelEnum.Error,
      },
    });

    const logger = AHLogger.getInstance();
    const logHandler = jest.fn(() => {});
    logger.addHandler(logHandler);

    logInfo("info");
    expect(logHandler).toHaveBeenCalledTimes(0);

    app.configure({
      options: {
        defaultLogLevel: AHLogLevelEnum.Info,
      },
    });

    logInfo("info");
    expect(logHandler).toHaveBeenCalledTimes(1);
  });

  test("_registerHandler", () => {
    const handlerNumber = anthill()["handlers"].length;
    const app = anthill();
    app._registerHandler(AHTestResource.getDefaultRestHandler());

    expect(anthill()["handlers"].length).toEqual(handlerNumber + 1);
    expect(() => app._registerHandler(AHTestResource.getDefaultRestHandler())).toThrow(AHException);
  });

  test("exposeHandlers", async () => {
    @RestController()
    class AHTest {
      @RestHandler({ method: AHRestMethodEnum.Get })
      async listTest(event: AHAwsEvent, context?: AHAwsContext): Promise<AHHttpResponse> {
        return AHPromiseHelper.promisify(AHHttpResponse.success(null));
      }
    }

    const app = anthill();
    app.configure({
      controllers: [AHTest],
    });

    const handlers = app.exposeHandlers();

    expect(Object.keys(handlers).includes("listTest")).toBe(true);

    const res = await handlers.listTest(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext());
    expect(res).toBeTruthy();
  });
});
