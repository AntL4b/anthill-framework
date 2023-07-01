import { AHHttpRequestHelper } from "..";
import { AHAwsEvent } from "..";
import { AHTestResource } from "./resources/test-resource";


describe('AHHttpRequestHelper', () => {
  test('addBaseHttpRequest', () => {
    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    expect(JSON.stringify(AHHttpRequestHelper.addBaseHttpRequest({}, event)))
    .toBe(JSON.stringify({ pager: { page :null, pageSize: null } }));

    event.queryStringParameters = { page: "1", pageSize: "5" };

    expect(JSON.stringify(AHHttpRequestHelper.addBaseHttpRequest({}, event)))
    .toBe(JSON.stringify({ pager: { page :1, pageSize: 5 } }));
  });

  test('getHeaderValue', () => {
    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    event.headers = { "test-header": "test" };

    expect(AHHttpRequestHelper.getHeaderValue("test-header", event)).toBe("test");
    event.headers = null;
    expect(AHHttpRequestHelper.getHeaderValue("test-header", event)).toBe(null);
  });
});
