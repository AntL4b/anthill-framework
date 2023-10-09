import { HttpRequestHelper, AwsEvent } from "../packages";
import { TestResource } from "./resources/test-resource";

describe("HttpRequestHelper", () => {
  test("getHeaderValue", () => {
    const event: AwsEvent = TestResource.getBaseEvent();
    event.headers = { "test-header": "test" };

    expect(HttpRequestHelper.getHeaderValue("test-header", event.headers)).toEqual("test");
    event.headers = null;
    expect(HttpRequestHelper.getHeaderValue("test-header", event.headers)).toBeNull();
  });
});
