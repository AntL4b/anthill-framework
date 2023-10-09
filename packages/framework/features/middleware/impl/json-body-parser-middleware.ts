import { AwsEvent } from "../../../models/aws/event/aws-event";
import { HttpResponse } from "../../http-response";
import { Middleware } from "../middleware";
import { HttpRequestHelper } from "../../../helpers/http-request-helper";
import { JsonBodyParserMiddlewareOptions } from "../../../models/middleware/json-body-parser-middleware-options";
import { AwsContext } from "../../../models/aws/aws-context";
import { RunBeforeReturnType } from "../../../models/middleware/run-before-return-type";

const JSON_MIME_PATTERN = /^application\/(.+\+)?json($|;.+)/;
const DEFAULT_OPTIONS: JsonBodyParserMiddlewareOptions = { reviver: null };

/** Parse JSON body to js / ts object */
export class JsonBodyParserMiddleware extends Middleware<JsonBodyParserMiddlewareOptions> {
  constructor(options?: JsonBodyParserMiddlewareOptions) {
    super({ ...DEFAULT_OPTIONS, ...options });
  }

  override runBefore(event: AwsEvent, context?: AwsContext): RunBeforeReturnType {
    if (event.body) {
      const contentType = HttpRequestHelper.getHeaderValue("Content-Type", event.headers);

      if (!JSON_MIME_PATTERN.test(contentType)) {
        return HttpResponse.error({ message: `Unsupported media type: ${contentType}` });
      }

      const data = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString() : event.body;
      event.body = JSON.parse(data, this.payload.reviver);
    }

    return event;
  }
}
