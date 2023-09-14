import { AHAwsEvent } from "../../models/aws/event/aws-event";
import { AHHttpResponse } from "../http-response";
import { AHPromiseHelper } from "../../helpers/promise-helper";
import { AHMiddleware } from "./middleware";
import { AHHttpRequestHelper } from "../../helpers/http-request-helper";
import { AHJsonBodyParserMiddlewareOptions } from "../../models/middleware/json-body-parser-middleware-options";
import { AHAwsContext } from "../../models/aws/aws-context";


const JSON_MIME_PATTERN = /^application\/(.+\+)?json($|;.+)/;
const DEFAULT_OPTIONS: AHJsonBodyParserMiddlewareOptions = { reviver: null }

/** Parse JSON body to js / ts object */
export class AHJsonBodyParserMiddleware extends AHMiddleware<AHJsonBodyParserMiddlewareOptions> {

  constructor(options?: AHJsonBodyParserMiddlewareOptions) {
    super({ ...DEFAULT_OPTIONS, ...options});
  }

  override runBefore(event: AHAwsEvent, context?: AHAwsContext): Promise<AHAwsEvent | AHHttpResponse> {
    if (event.body) {
      const contentType = AHHttpRequestHelper.getHeaderValue("Content-Type", event.headers);

      if (!JSON_MIME_PATTERN.test(contentType)) {
        return AHPromiseHelper.promisify(AHHttpResponse.error({ message: `Unsupported media type: ${contentType}` }));
      }

      const data = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString() : event.body;
      event.body = JSON.parse(data, this.payload.reviver);
    }

    return AHPromiseHelper.promisify(event);
  }
}
