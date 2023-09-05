
import { AHMiddleware } from "..";
import { AHAwsEvent } from "..";
import { AHHttpResponse } from "..";
import { AHTestResource } from "./resources/test-resource";


describe('AHMiddleware', () => {
  test('runBefore', () => {
    const middleware = new AHMiddleware();
    expect(middleware.runBefore(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext())).resolves.toBeInstanceOf(AHAwsEvent);
  });

  test('runAfter', () => {
    const middleware = new AHMiddleware();
    expect(middleware.runAfter(AHHttpResponse.success(null), AHTestResource.getBaseEvent(), AHTestResource.getBaseContext())).resolves.toBeInstanceOf(AHHttpResponse);
  });
});
