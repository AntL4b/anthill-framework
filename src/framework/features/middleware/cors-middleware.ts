/**
 * Copied and adapted from https://github.com/middyjs/middy (MIT License)
 * https://github.com/middyjs/middy/blob/main/packages/http-cors/index.js
 */

import { AHAwsEvent } from "../../models/aws/event/aws-event";
import { AHHttpResponse } from "../http-response";
import { AHPromiseHelper } from "../../helpers/promise-helper";
import { AHMiddleware } from "./middleware";
import { AHAwsContext } from "../../models/aws/aws-context";
import { AHCorsMiddlewareOptions } from "../../models/middleware/cors-middleware-options";
import { AHHttpRequestHelper } from "../../helpers/http-request-helper";


const getOrigin = (incomingOrigin, options: AHCorsMiddlewareOptions) => {
  if (options.origins.length > 0) {
    if (incomingOrigin && options.origins.includes(incomingOrigin)) {
      return incomingOrigin
    } else {
      return options.origins[0];
    }
  } else {
    if (incomingOrigin && options.credentials && options.origin === "*") {
      return incomingOrigin;
    }
    return options.origin;
  }
}

const DEFAULT_OPTIONS: AHCorsMiddlewareOptions = {
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
  vary: undefined
};

/** Parse JSON body to js / ts object */
export class AHCorsMiddleware extends AHMiddleware<AHCorsMiddlewareOptions> {
  constructor(options?: AHCorsMiddlewareOptions) {
    super({ ...DEFAULT_OPTIONS, ...options});
  }

  override runAfter(httpResponse: AHHttpResponse, event: AHAwsEvent, context?: AHAwsContext): Promise<AHHttpResponse> {
    const options = this.payload;
    const existingHeaders = { ...httpResponse.headers };

    if (AHHttpRequestHelper.getHeaderValue("Access-Control-Allow-Credentials", existingHeaders)) {
      options.credentials = httpResponse["Access-Control-Allow-Credentials"] === "true";
    }

    if (options.credentials) {
      httpResponse.headers["Access-Control-Allow-Credentials"] = String(options.credentials);
    }
    
    if (options.headers && !AHHttpRequestHelper.getHeaderValue("Access-Control-Allow-Headers", existingHeaders)) {
      httpResponse.headers["Access-Control-Allow-Headers"] = options.headers;
    }

    if (options.methods && !AHHttpRequestHelper.getHeaderValue("Access-Control-Allow-Methods", existingHeaders)) {
      httpResponse.headers["Access-Control-Allow-Methods"] = options.methods;
    }

    if (!AHHttpRequestHelper.getHeaderValue("Access-Control-Allow-Origin", existingHeaders)) {
      httpResponse.headers["Access-Control-Allow-Origin"] = options.getOrigin(
        AHHttpRequestHelper.getHeaderValue("Origin", event.headers),
        options
      );
    }

    let vary = options.vary;
    if (httpResponse.headers["Access-Control-Allow-Origin"] !== "*" && !vary) {
      vary = "Origin";
    }

    if (vary && !AHHttpRequestHelper.getHeaderValue("Vary", existingHeaders)) {
      httpResponse.headers.Vary = vary;
    }

    if (options.exposeHeaders && !AHHttpRequestHelper.getHeaderValue("Access-Control-Expose-Headers", existingHeaders)) {
      httpResponse.headers["Access-Control-Expose-Headers"] = options.exposeHeaders;
    }

    if (options.maxAge && !AHHttpRequestHelper.getHeaderValue("Access-Control-Max-Age", existingHeaders)) {
      httpResponse.headers["Access-Control-Max-Age"] = String(options.maxAge);
    }

    if (options.requestHeaders && !AHHttpRequestHelper.getHeaderValue("Access-Control-Request-Headers", existingHeaders)) {
      httpResponse.headers["Access-Control-Request-Headers"] = options.requestHeaders;
    }

    if (options.requestMethods && !AHHttpRequestHelper.getHeaderValue("Access-Control-Request-Methods", existingHeaders)) {
      httpResponse.headers["Access-Control-Request-Methods"] = options.requestMethods;
    }

    if (options.cacheControl && !AHHttpRequestHelper.getHeaderValue("Cache-Control", existingHeaders)) {
      httpResponse.headers["Cache-Control"] = options.cacheControl;
    }

    return AHPromiseHelper.promisify(httpResponse);
  }
}
