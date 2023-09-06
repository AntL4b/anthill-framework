import { AHAwsEvent } from "../../models/aws/event/aws-event";
import { AHHttpResponse } from "../http-response";
import { AHHttpRequestHelper } from "../../helpers/http-request-helper";
import { AHPromiseHelper } from "../../helpers/promise-helper";
import { AHMiddleware } from "./middleware";
import { AHAwsContext } from "../../models/aws/aws-context";


export class AHHeaderFieldMiddleware extends AHMiddleware<Array<string>> {
  constructor(payload: Array<string>) {
    super(payload);
  }

  /** Check that a list of headers are provided in the aws event headers */
  override runBefore(event: AHAwsEvent, context?: AHAwsContext): Promise<AHAwsEvent | AHHttpResponse> {
    if (event.headers) {
      const notIncludedHeaders: Array<string> = [];

      this.payload.map((p: string) => {
        if (AHHttpRequestHelper.getHeaderValue(p, event.headers) === null) {
          notIncludedHeaders.push(p);
        }
      });

      if (notIncludedHeaders.length > 0) {
        return AHPromiseHelper.promisify(
          AHHttpResponse.error({ message: `[${notIncludedHeaders.join(", ")}] not found in header list` }),
        );
      } else {
        return AHPromiseHelper.promisify(event);
      }
    } else if (this.payload.length) {
      return AHPromiseHelper.promisify(
        AHHttpResponse.error({ message: `[${this.payload.join(", ")}] not found in header list` }),
      );
    } else {
      return AHPromiseHelper.promisify(event);
    }
  }
}
