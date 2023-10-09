import { AwsContext, AnthillException, Anthill, LambdaRequestHandler } from "../packages";
import { TestResource } from "./resources/test-resource";

describe("LambdaHandler", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
    Anthill.getInstance()._dependencyContainer.register("controller", class Controller {});
  });

  test("constructor", () => {
    let handler = TestResource.getDefaultLambdaHandler();
    expect(handler).toBeInstanceOf(LambdaRequestHandler);
  });

  test("handleRequest", async () => {
    const handler = TestResource.getDefaultLambdaHandler();
    const response = await handler.handleRequest(null, TestResource.getBaseContext());

    expect(response).toBeNull();
  });

  test("handleRequest with exception", async () => {
    const handler = TestResource.getDefaultLambdaHandler({
      callable: (event: any, context: AwsContext) => {
        throw new AnthillException("error");
      },
    });

    expect(handler.handleRequest(null, TestResource.getBaseContext())).rejects.toThrow(AnthillException);
  });
});
