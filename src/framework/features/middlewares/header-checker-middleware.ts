import { AHAwsEvent } from "../../models/aws/event/aws-event";
import { AHHttpResponse } from "../../models/http/http-response";
import { AHHttpRequestHelper } from "../../helpers/http-request-helper";
import { AHPromiseHelper } from "../../helpers/promise-helper";
import { AHAbstractMiddleware } from "./abstract-middleware";

export class AHHeaderCheckerMiddleware extends AHAbstractMiddleware {
  constructor(payload: Array<string>) {
    super(payload);
  }

  run(event: AHAwsEvent): Promise<AHAwsEvent | AHHttpResponse> {
    if (event.headers) {
      const notIncludedHeaders: Array<string> = [];

      this.payload.map((p: string) => {
        if (AHHttpRequestHelper.getHeaderValue(p, event) === null) {
          notIncludedHeaders.push(p);
        }
      });

      if (notIncludedHeaders.length > 0) {
        return AHPromiseHelper.promisify(
          AHHttpResponse.error({ message: '[' + notIncludedHeaders.join(', ') + '] not found in header list' }),
        );
      } else {
        return AHPromiseHelper.promisify(event);
      }
    } else if (this.payload.length) {
      return AHPromiseHelper.promisify(
        AHHttpResponse.error({ message: '[' + this.payload.join(', ') + '] not found in header list' }),
      );
    } else {
      return AHPromiseHelper.promisify(event);
    }
  }
}
