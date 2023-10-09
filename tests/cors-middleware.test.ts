import { CorsMiddleware, CorsMiddlewareOptions, HttpResponse } from "../packages";
import { TestResource } from "./resources/test-resource";

describe("CorsMiddleware", () => {
  test("No body specified - default behaviour", async () => {
    const options: CorsMiddlewareOptions = {};

    const middleware = new CorsMiddleware(options);
    const response = HttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      TestResource.getBaseEvent(),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse).toBeInstanceOf(HttpResponse);
    expect(middlewareResponse.headers["Access-Control-Allow-Origin"]).toEqual("*");
  });

  test("Custom getOrigin", async () => {
    const options: CorsMiddlewareOptions = {
      getOrigin: () => "https://test.com",
    };

    const middleware = new CorsMiddleware(options);
    const response = HttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      TestResource.getBaseEvent(),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Allow-Origin"]).toEqual("https://test.com");
    expect(middlewareResponse.headers["Vary"]).toEqual("Origin");
  });

  test("Option credentials", async () => {
    const options: CorsMiddlewareOptions = {
      credentials: true,
    };

    const middleware = new CorsMiddleware(options);
    const response = HttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      TestResource.getBaseEvent(),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Allow-Credentials"]).toEqual("true");

    const options2: CorsMiddlewareOptions = {
      credentials: false,
    };

    const middleware2 = new CorsMiddleware(options2);
    const response2 = HttpResponse.success(null);
    const middlewareResponse2 = await middleware2.runAfter(
      response2,
      TestResource.getBaseEvent(),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse2.headers["Access-Control-Allow-Credentials"]).toBeUndefined();

    const response3 = HttpResponse.success(null, { "Access-Control-Allow-Credentials": "true" });

    // Check that credentials: false is overriden by Access-Control-Allow-Credentials header
    const middlewareResponse3 = await middleware2.runAfter(
      response3,
      TestResource.getBaseEvent(),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse3.headers["Access-Control-Allow-Credentials"]).toBe("true");
  });

  test("Option headers", async () => {
    const options: CorsMiddlewareOptions = {
      headers: "*",
    };

    const middleware = new CorsMiddleware(options);
    const response = HttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      TestResource.getBaseEvent(),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Allow-Headers"]).toEqual("*");
  });

  test("Option methods", async () => {
    const options: CorsMiddlewareOptions = {
      methods: "*",
    };

    const middleware = new CorsMiddleware(options);
    const response = HttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      TestResource.getBaseEvent(),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Allow-Methods"]).toEqual("*");
  });

  test("Option origin", async () => {
    const options: CorsMiddlewareOptions = {
      origin: "*",
      credentials: true,
    };

    const middleware = new CorsMiddleware(options);
    const response = HttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      TestResource.getBaseEvent({ headers: { Origin: "https://test.com" } }),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Allow-Origin"]).toEqual("https://test.com");
  });

  test("Option origins", async () => {
    const options: CorsMiddlewareOptions = {
      origins: ["https://test.com", "https://test2.com"],
      credentials: true,
    };

    const middleware = new CorsMiddleware(options);
    const response = HttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      TestResource.getBaseEvent({ headers: { Origin: "https://test2.com" } }),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Allow-Origin"]).toEqual("https://test2.com");

    const response2 = HttpResponse.success(null);
    const middlewareResponse2 = await middleware.runAfter(
      response2,
      TestResource.getBaseEvent(),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse2.headers["Access-Control-Allow-Origin"]).toEqual("https://test.com");
  });

  test("Option exposeHeaders", async () => {
    const options: CorsMiddlewareOptions = {
      exposeHeaders: "*",
    };

    const middleware = new CorsMiddleware(options);
    const response = HttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      TestResource.getBaseEvent(),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Expose-Headers"]).toEqual("*");
  });

  test("Option maxAge", async () => {
    const options: CorsMiddlewareOptions = {
      maxAge: 120,
    };

    const middleware = new CorsMiddleware(options);
    const response = HttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      TestResource.getBaseEvent(),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Max-Age"]).toEqual("120");
  });

  test("Option requestHeaders", async () => {
    const options: CorsMiddlewareOptions = {
      requestHeaders: "*",
    };

    const middleware = new CorsMiddleware(options);
    const response = HttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      TestResource.getBaseEvent(),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Request-Headers"]).toEqual("*");
  });

  test("Option requestMethods", async () => {
    const options: CorsMiddlewareOptions = {
      requestMethods: "*",
    };

    const middleware = new CorsMiddleware(options);
    const response = HttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      TestResource.getBaseEvent(),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Access-Control-Request-Methods"]).toEqual("*");
  });

  test("Option cacheControl", async () => {
    const options: CorsMiddlewareOptions = {
      cacheControl: "max-age=604800",
    };

    const middleware = new CorsMiddleware(options);
    const response = HttpResponse.success(null);
    const middlewareResponse = await middleware.runAfter(
      response,
      TestResource.getBaseEvent(),
      TestResource.getBaseContext(),
    );

    expect(middlewareResponse.headers["Cache-Control"]).toEqual("max-age=604800");
  });
});
