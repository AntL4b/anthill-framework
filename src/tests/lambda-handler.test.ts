import { AHAwsContext, AHException, Anthill, AHLambdaHandler } from "..";
import { AHTestResource } from "./resources/test-resource";

describe("AHLambdaHandler", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
    Anthill.getInstance()._dependencyContainer.register("controller", class Controller {});
  });

  test("constructor", () => {
    let handler = AHTestResource.getDefaultLambdaHandler();
    expect(handler).toBeInstanceOf(AHLambdaHandler);
  });

  test("handleRequest", async () => {
    const handler = AHTestResource.getDefaultLambdaHandler();
    const response = await handler.handleRequest(null, AHTestResource.getBaseContext());

    expect(response).toBeNull();
  });

  test("handleRequest with exception", async () => {
    const handler = AHTestResource.getDefaultLambdaHandler({
      callable: (event: any, context: AHAwsContext) => {
        throw new AHException("error");
      },
    });

    expect(handler.handleRequest(null, AHTestResource.getBaseContext())).rejects.toThrow(AHException);
  });
});
