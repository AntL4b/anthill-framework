import { AHPagerFormatCheckerMiddleware } from "../framework/middleware/pager-format-checker-middleware";
import { AHAwsEvent } from "../framework/models/aws/event/aws-event";
import { AHHttpResponse } from "../framework/models/http/http-response";
import { AHTestResource } from "./resources/test-resource";


describe('AHQueryStringCheckerMiddleware', () => {
  test('No parameter given', async () => {
    const middleware = new AHPagerFormatCheckerMiddleware();

    expect(await middleware.run(AHTestResource.getBaseEvent())).toBeInstanceOf(AHAwsEvent);
  });

  test('Wrong parameters given', async () => {
    const middleware = new AHPagerFormatCheckerMiddleware();

    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    event.queryStringParameters = { page: "-1", pageSize: null };
    const result = await middleware.run(event)

    expect(result).toBeInstanceOf(AHHttpResponse);
  });

  test('OK parameters given', async () => {
    const middleware = new AHPagerFormatCheckerMiddleware();

    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    event.queryStringParameters = { page: "1", pageSize: "5" };
    const result = await middleware.run(event)

    expect(result).toBeInstanceOf(AHAwsEvent);
  });

  test('Give only page size', async () => {
    const middleware = new AHPagerFormatCheckerMiddleware();

    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    event.queryStringParameters = { pageSize: "5" };
    const result = await middleware.run(event)

    expect(result).toBeInstanceOf(AHAwsEvent);
  });
});
