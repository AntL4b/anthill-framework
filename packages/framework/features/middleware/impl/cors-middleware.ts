/**
 * Copied and adapted from https://github.com/middyjs/middy (MIT License)
 * https://github.com/middyjs/middy/blob/main/packages/http-cors/index.js
 */

import { AwsEvent } from "../../../models/aws/event/aws-event";
import { HttpResponse } from "../../http-response";
import { Middleware } from "../middleware";
import { AwsContext } from "../../../models/aws/aws-context";
import { CorsMiddlewareOptions } from "../../../models/middleware/cors-middleware-options";
import { HttpRequestHelper } from "../../../helpers/http-request-helper";

const getOrigin = (incomingOrigin, options: CorsMiddlewareOptions) => {
  if (options.origins.length > 0) {
    if (incomingOrigin && options.origins.includes(incomingOrigin)) {
      return incomingOrigin;
    } else {
      return options.origins[0];
    }
  } else {
    if (incomingOrigin && options.credentials && options.origin === "*") {
      return incomingOrigin;
    }
    return options.origin;
  }
};

const DEFAULT_OPTIONS: CorsMiddlewareOptions = {
  getOrigin: getOrigin,
  credentials: undefined,
  headers: undefined,
  methods: undefined,
  origin: "*",
  origins: [],
  exposeHeaders: undefined,
  maxAge: undefined,
  requestHeaders: undefined,
  requestMethods: undefined,
  cacheControl: undefined,
  vary: undefined,
};

/** Parse JSON body to js / ts object */
export class CorsMiddleware extends Middleware<CorsMiddlewareOptions> {
  constructor(options?: CorsMiddlewareOptions) {
    super({ ...DEFAULT_OPTIONS, ...options });
  }

  override runAfter(httpResponse: HttpResponse, event: AwsEvent, context?: AwsContext): HttpResponse {
    const options = this.payload;
    const existingHeaders = { ...httpResponse.headers };

    if (HttpRequestHelper.getHeaderValue("Access-Control-Allow-Credentials", existingHeaders)) {
      options.credentials = httpResponse["Access-Control-Allow-Credentials"] == "true";
    }

    if (options.credentials) {
      httpResponse.headers["Access-Control-Allow-Credentials"] = String(options.credentials);
    }

    if (options.headers && !HttpRequestHelper.getHeaderValue("Access-Control-Allow-Headers", existingHeaders)) {
      httpResponse.headers["Access-Control-Allow-Headers"] = options.headers;
    }

    if (options.methods && !HttpRequestHelper.getHeaderValue("Access-Control-Allow-Methods", existingHeaders)) {
      httpResponse.headers["Access-Control-Allow-Methods"] = options.methods;
    }

    if (!HttpRequestHelper.getHeaderValue("Access-Control-Allow-Origin", existingHeaders)) {
      httpResponse.headers["Access-Control-Allow-Origin"] = options.getOrigin(
        HttpRequestHelper.getHeaderValue("Origin", event.headers),
        options,
      );
    }

    let vary = options.vary;
    if (httpResponse.headers["Access-Control-Allow-Origin"] != "*" && !vary) {
      vary = "Origin";
    }

    if (vary && !HttpRequestHelper.getHeaderValue("Vary", existingHeaders)) {
      httpResponse.headers.Vary = vary;
    }

    if (
      options.exposeHeaders &&
      !HttpRequestHelper.getHeaderValue("Access-Control-Expose-Headers", existingHeaders)
    ) {
      httpResponse.headers["Access-Control-Expose-Headers"] = options.exposeHeaders;
    }

    if (options.maxAge && !HttpRequestHelper.getHeaderValue("Access-Control-Max-Age", existingHeaders)) {
      httpResponse.headers["Access-Control-Max-Age"] = String(options.maxAge);
    }

    if (
      options.requestHeaders &&
      !HttpRequestHelper.getHeaderValue("Access-Control-Request-Headers", existingHeaders)
    ) {
      httpResponse.headers["Access-Control-Request-Headers"] = options.requestHeaders;
    }

    if (
      options.requestMethods &&
      !HttpRequestHelper.getHeaderValue("Access-Control-Request-Methods", existingHeaders)
    ) {
      httpResponse.headers["Access-Control-Request-Methods"] = options.requestMethods;
    }

    if (options.cacheControl && !HttpRequestHelper.getHeaderValue("Cache-Control", existingHeaders)) {
      httpResponse.headers["Cache-Control"] = options.cacheControl;
    }

    return httpResponse;
  }
}
