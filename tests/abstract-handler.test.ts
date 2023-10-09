import {
  AwsContext,
  AnthillException,
  Logger,
  Anthill,
  PromiseHelper,
  anthill,
  LambdaRequestHandler,
} from "../packages";
import { TestResource } from "./resources/test-resource";

describe("AbstractHandler", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
    Anthill.getInstance()._dependencyContainer.register("controller", class Controller {});
  });

  test("constructor", () => {
    expect(() => {
      new LambdaRequestHandler<any, any>({
        name: "invalid-name",
        callable: (event: any, context: AwsContext) => PromiseHelper.promisify(null),
      });
    }).toThrow(AnthillException);
  });

  test("getName", () => {
    const handler = TestResource.getDefaultRestHandler();
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
    const logger = Logger.getInstance();
    const logHandler = jest.fn(() => {});
    logger.addHandler(logHandler);

    const handler = TestResource.getDefaultLambdaHandler({});
    await handler.handleRequest(null, TestResource.getBaseContext());
    expect(logHandler).toHaveBeenCalled();
  });
});
