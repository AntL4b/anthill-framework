import { AHAwsContext, AHException } from "..";
import { AHLambdaHandler } from "..";
import { AHTestResource } from "./resources/test-resource";

describe("AHLambdaHandler", () => {
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

    const response = await handler.handleRequest(null, AHTestResource.getBaseContext());

    expect(response).toBeNull();
  });
});
