import {
  AHAwsContext,
  AHException,
  AHLogger,
  Anthill,
  AHPromiseHelper,
  AHLambdaHandler,
  anthill,
} from "../packages";
import { AHTestResource } from "./resources/test-resource";

describe("AHAbstractHandler", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
    Anthill.getInstance()._dependencyContainer.register("controller", class Controller {});
  });

  test("constructor", () => {
    expect(() => {
      new AHLambdaHandler<any, any>({
        name: "invalid-name",
        callable: (event: any, context: AHAwsContext) => AHPromiseHelper.promisify(null),
      });
    }).toThrow(AHException);
  });

  test("getName", () => {
    const handler = AHTestResource.getDefaultRestHandler();
    expect(handler.getName()).toEqual("handler");
  });

  test("displayPerformanceMetrics", async () => {
    const app = anthill();
    app.configure({
      controllers: [class Controller {}],
      options: {
        displayPerformanceMetrics: true,
      }
    });
    const logger = AHLogger.getInstance();
    const logHandler = jest.fn(() => {});
    logger.addHandler(logHandler);

    const handler = AHTestResource.getDefaultLambdaHandler({});
    await handler.handleRequest(null, AHTestResource.getBaseContext());
    expect(logHandler).toHaveBeenCalled();
  });
});
