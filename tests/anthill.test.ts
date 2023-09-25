import {
  AHAnthillConfig,
  AHAwsContext,
  AHAwsEvent,
  AHException,
  AHHandlerConfigLevelEnum,
  AHHttpResponse,
  AHJsonBodyParserMiddleware,
  AHMiddleware,
  AHObjectHelper,
  AHPromiseHelper,
  AHRestHandlerCacheConfig,
  Anthill,
  anthill,
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
      restHandlerConfig: {
        cacheConfig: {
          cachable: true,
          ttl: 100,
          maxCacheSize: 1234,
          headersToInclude: [],
        },
        middlewares: [new AHJsonBodyParserMiddleware()],
        options: {
          displayPerformanceMetrics: true,
        },
      },
      lambdaHandlerConfig: {
        options: {
          displayPerformanceMetrics: true,
        },
      },
    };

    const app = anthill();
    app.configure(configureObj);

    expect(AHObjectHelper.isEquivalentObj(anthill()["_configuration"], configureObj)).toBe(true);
  });

  test("configure cacheConfig", () => {
    const cacheConfig: AHRestHandlerCacheConfig = {
      cachable: true,
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

    // Set cache config override to {} to ensure the global configuration is used
    expect(
      AHObjectHelper.isEquivalentObj(
        AHTestResource.getDefaultRestHandler({ cacheConfig: {} })["cacheConfig"][AHHandlerConfigLevelEnum.Anthill],
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

  test("configure options", () => {
    const app = anthill();
    app.configure({
      restHandlerConfig: {
        options: {
          displayPerformanceMetrics: true,
        },
      },
    });

    expect(
      AHTestResource.getDefaultRestHandler()["options"][AHHandlerConfigLevelEnum.Anthill].displayPerformanceMetrics,
    ).toBe(true);

    app.configure({
      restHandlerConfig: {
        options: {
          displayPerformanceMetrics: false,
        },
      },
    });

    expect(
      AHTestResource.getDefaultRestHandler()["options"][AHHandlerConfigLevelEnum.Anthill].displayPerformanceMetrics,
    ).toBe(false);
  });

  test("_registerHandler", () => {
    const handlerNumber = anthill()["handlers"].length;
    const app = anthill();
    app._registerHandler(AHTestResource.getDefaultRestHandler());

    expect(anthill()["handlers"].length).toEqual(handlerNumber + 1);
    expect(() => app._registerHandler(AHTestResource.getDefaultRestHandler())).toThrow(AHException);
  });

  test("exposeHandlers", async () => {
    const app = anthill();
    app._registerHandler(
      AHTestResource.getDefaultRestHandler({
        name: "restHandler",
      }),
    );
    exports = app.exposeHandlers();

    const res = await exports.restHandler(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext());
    expect(res).toBeTruthy();
  });
});
