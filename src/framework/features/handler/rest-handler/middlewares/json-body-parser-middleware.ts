import { AHAwsEvent } from '../../../../models/aws/event/aws-event';
import { AHHttpResponse } from '../../../../models/http/http-response';
import { AHPromiseHelper } from '../../../../helpers/promise-helper';
import { AHAbstractMiddleware } from './abstract-middleware';
import { AHHttpRequestHelper } from '../../../../helpers/http-request-helper';
import { AHJsonBodyParserMiddlewareOptions } from '../../../../models/middlewares/json-body-parser-middleware-options';
import { AHAwsContext } from '../../../../models/aws/aws-context';


const JSON_MIME_PATTERN = /^application\/(.+\+)?json($|;.+)/;
const DEFAULT_OPTIONS: AHJsonBodyParserMiddlewareOptions = { reviver: null }

export class AHJsonBodyParserMiddleware extends AHAbstractMiddleware<AHJsonBodyParserMiddlewareOptions> {
  constructor(options?: AHJsonBodyParserMiddlewareOptions) {
    super({ ...DEFAULT_OPTIONS, ...options});
  }

  run(event: AHAwsEvent, context?: AHAwsContext): Promise<AHAwsEvent | AHHttpResponse> {
    if (event.body) {
      const contentType = AHHttpRequestHelper.getHeaderValue("Content-Type", event);

      if (!JSON_MIME_PATTERN.test(contentType)) {
        return AHPromiseHelper.promisify(AHHttpResponse.error({ message: `Unsupported media type: ${contentType}` }));
      }

      const data = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString() : event.body;
      event.body = JSON.parse(data, this.payload.reviver);
    }

    return AHPromiseHelper.promisify(event);
  }
}
