import { HttpResponseBodyStatusEnum, HttpResponse } from "../packages";

describe("HttpResponse", () => {
  test("constructor", () => {
    const response = new HttpResponse(200, {});
    expect(response).toBeInstanceOf(HttpResponse);
  });

  test("response", () => {
    const response = new HttpResponse(250, { status: HttpResponseBodyStatusEnum.Success });
    expect(response.statusCode).toEqual(250);
    expect(response.body).toEqual(JSON.stringify({ status: HttpResponseBodyStatusEnum.Success }));
  });

  test("success", () => {
    const response = HttpResponse.success({});
    expect(response.statusCode).toEqual(200);
  });

  test("error", () => {
    const response = HttpResponse.error({});
    expect(response.statusCode).toEqual(400);
  });

  test("forbidden", () => {
    const response = HttpResponse.forbidden({});
    expect(response.statusCode).toEqual(403);
  });

  test("not found", () => {
    const response = HttpResponse.notFound({});
    expect(response.statusCode).toEqual(404);
  });

  test("failure", () => {
    const response = HttpResponse.failure({});
    expect(response.statusCode).toEqual(500);
  });

  test("headers", () => {
    const response = HttpResponse.response(
      200,
      { payload: "<p>html paragraphe<p>" },
      { "Content-Type": "text/html" },
    );
    expect(Object.keys(response.headers).includes("Content-Type")).toEqual(true);
    expect(response.headers["Content-Type"]).toEqual("text/html");
    expect(response.body).toStrictEqual({ payload: "<p>html paragraphe<p>" });
  });
});
