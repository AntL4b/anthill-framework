import { AHCorsMiddleware, AHCorsMiddlewareOptions, AHHttpResponse } from "../packages";
import { AHTestResource } from "./resources/test-resource";

describe("AHCorsMiddleware", () => {
  test("No body specified - default behaviour", async () => {
    const options: AHCorsMiddlewareOptions = {};

    const middleware = new AHCorsMiddleware(options);
    const response = AHHttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      AHTestResource.getBaseEvent(),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse).toBeInstanceOf(AHHttpResponse);
    expect(middlewareResponse.headers["Access-Control-Allow-Origin"]).toEqual("*");
  });

  test("Custom getOrigin", async () => {
    const options: AHCorsMiddlewareOptions = {
      getOrigin: () => "https://test.com",
    };

    const middleware = new AHCorsMiddleware(options);
    const response = AHHttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      AHTestResource.getBaseEvent(),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Allow-Origin"]).toEqual("https://test.com");
    expect(middlewareResponse.headers["Vary"]).toEqual("Origin");
  });

  test("Option credentials", async () => {
    const options: AHCorsMiddlewareOptions = {
      credentials: true,
    };

    const middleware = new AHCorsMiddleware(options);
    const response = AHHttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      AHTestResource.getBaseEvent(),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Allow-Credentials"]).toEqual("true");

    const options2: AHCorsMiddlewareOptions = {
      credentials: false,
    };

    const middleware2 = new AHCorsMiddleware(options2);
    const response2 = AHHttpResponse.success(null);
    const middlewareResponse2 = await middleware2.runAfter(
      response2,
      AHTestResource.getBaseEvent(),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse2.headers["Access-Control-Allow-Credentials"]).toBeUndefined();

    const response3 = AHHttpResponse.success(null, { "Access-Control-Allow-Credentials": "true" });

    // Check that credentials: false is overriden by Access-Control-Allow-Credentials header
    const middlewareResponse3 = await middleware2.runAfter(
      response3,
      AHTestResource.getBaseEvent(),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse3.headers["Access-Control-Allow-Credentials"]).toBe("true");
  });

  test("Option headers", async () => {
    const options: AHCorsMiddlewareOptions = {
      headers: "*",
    };

    const middleware = new AHCorsMiddleware(options);
    const response = AHHttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      AHTestResource.getBaseEvent(),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Allow-Headers"]).toEqual("*");
  });

  test("Option methods", async () => {
    const options: AHCorsMiddlewareOptions = {
      methods: "*",
    };

    const middleware = new AHCorsMiddleware(options);
    const response = AHHttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      AHTestResource.getBaseEvent(),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Allow-Methods"]).toEqual("*");
  });

  test("Option origin", async () => {
    const options: AHCorsMiddlewareOptions = {
      origin: "*",
      credentials: true,
    };

    const middleware = new AHCorsMiddleware(options);
    const response = AHHttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      AHTestResource.getBaseEvent({ headers: { Origin: "https://test.com" } }),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Allow-Origin"]).toEqual("https://test.com");
  });

  test("Option origins", async () => {
    const options: AHCorsMiddlewareOptions = {
      origins: ["https://test.com", "https://test2.com"],
      credentials: true,
    };

    const middleware = new AHCorsMiddleware(options);
    const response = AHHttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      AHTestResource.getBaseEvent({ headers: { Origin: "https://test2.com" } }),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Allow-Origin"]).toEqual("https://test2.com");

    const response2 = AHHttpResponse.success(null);
    const middlewareResponse2 = await middleware.runAfter(
      response2,
      AHTestResource.getBaseEvent(),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse2.headers["Access-Control-Allow-Origin"]).toEqual("https://test.com");
  });

  test("Option exposeHeaders", async () => {
    const options: AHCorsMiddlewareOptions = {
      exposeHeaders: "*",
    };

    const middleware = new AHCorsMiddleware(options);
    const response = AHHttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      AHTestResource.getBaseEvent(),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Expose-Headers"]).toEqual("*");
  });

  test("Option maxAge", async () => {
    const options: AHCorsMiddlewareOptions = {
      maxAge: 120,
    };

    const middleware = new AHCorsMiddleware(options);
    const response = AHHttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      AHTestResource.getBaseEvent(),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Max-Age"]).toEqual("120");
  });

  test("Option requestHeaders", async () => {
    const options: AHCorsMiddlewareOptions = {
      requestHeaders: "*",
    };

    const middleware = new AHCorsMiddleware(options);
    const response = AHHttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      AHTestResource.getBaseEvent(),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Request-Headers"]).toEqual("*");
  });

  test("Option requestMethods", async () => {
    const options: AHCorsMiddlewareOptions = {
      requestMethods: "*",
    };

    const middleware = new AHCorsMiddleware(options);
    const response = AHHttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      AHTestResource.getBaseEvent(),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Request-Methods"]).toEqual("*");
  });

  test("Option cacheControl", async () => {
    const options: AHCorsMiddlewareOptions = {
      cacheControl: "max-age=604800",
    };

    const middleware = new AHCorsMiddleware(options);
    const response = AHHttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      AHTestResource.getBaseEvent(),
      AHTestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Cache-Control"]).toEqual("max-age=604800");
  });
});
