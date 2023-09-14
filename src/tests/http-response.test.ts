import { AHHttpResponseBodyStatusEnum } from "..";
import { AHHttpResponse } from "..";

describe("AHHttpResponse", () => {
  test("constructor", () => {
    const response = new AHHttpResponse(200, {});
    expect(response).toBeInstanceOf(AHHttpResponse);
  });

  test("response", () => {
    const response = new AHHttpResponse(250, { status: AHHttpResponseBodyStatusEnum.Success });
    expect(response.statusCode).toEqual(250);
    expect(response.body).toEqual(JSON.stringify({ status: AHHttpResponseBodyStatusEnum.Success }));
  });

  test("success", () => {
    const response = AHHttpResponse.success({});
    expect(response.statusCode).toEqual(200);
  });

  test("error", () => {
    const response = AHHttpResponse.error({});
    expect(response.statusCode).toEqual(400);
  });

  test("forbidden", () => {
    const response = AHHttpResponse.forbidden({});
    expect(response.statusCode).toEqual(403);
  });

  test("not found", () => {
    const response = AHHttpResponse.notFound({});
    expect(response.statusCode).toEqual(404);
  });

  test("failure", () => {
    const response = AHHttpResponse.failure({});
    expect(response.statusCode).toEqual(500);
  });

  test("headers", () => {
    const response = AHHttpResponse.response(
      200,
      { payload: "<p>html paragraphe<p>" },
      { "Content-Type": "text/html" },
    );
    expect(Object.keys(response.headers).includes("Content-Type")).toEqual(true);
    expect(response.headers["Content-Type"]).toEqual("text/html");
    expect(response.body).toStrictEqual({ payload: "<p>html paragraphe<p>" });
  });
});
