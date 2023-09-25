import { AHHttpRequestHelper } from "..";
import { AHAwsEvent } from "..";
import { AHTestResource } from "./resources/test-resource";

describe("AHHttpRequestHelper", () => {
  test("getHeaderValue", () => {
    const event: AHAwsEvent = AHTestResource.getBaseEvent();
    event.headers = { "test-header": "test" };

    expect(AHHttpRequestHelper.getHeaderValue("test-header", event.headers)).toEqual("test");
    event.headers = null;
    expect(AHHttpRequestHelper.getHeaderValue("test-header", event.headers)).toBeNull();
  });
});
