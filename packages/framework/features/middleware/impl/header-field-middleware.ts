import { AwsEvent } from "../../../models/aws/event/aws-event";
import { HttpResponse } from "../../http-response";
import { HttpRequestHelper } from "../../../helpers/http-request-helper";
import { Middleware } from "../middleware";
import { AwsContext } from "../../../models/aws/aws-context";
import { RunBeforeReturnType } from "../../../models/middleware/run-before-return-type";

export class HeaderFieldMiddleware extends Middleware<Array<string>> {
  constructor(payload: Array<string>) {
    super(payload);
  }

  /** Check that a list of headers are provided in the aws event headers */
  override runBefore(event: AwsEvent, context?: AwsContext): RunBeforeReturnType {
    if (event.headers) {
      const notIncludedHeaders: Array<string> = [];

      this.payload.map((p: string) => {
        if (HttpRequestHelper.getHeaderValue(p, event.headers) === null) {
          notIncludedHeaders.push(p);
        }
      });

      if (notIncludedHeaders.length > 0) {
        return HttpResponse.error({ message: `[${notIncludedHeaders.join(", ")}] not found in header list` });
      } else {
        return event;
      }
    } else if (this.payload.length) {
      return HttpResponse.error({ message: `[${this.payload.join(", ")}] not found in header list` });
    } else {
      return event;
    }
  }
}
