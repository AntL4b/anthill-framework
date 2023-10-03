import { RunBeforeReturnType } from "../../models/middleware/run-before-return-type";
import { AHAwsContext } from "../../models/aws/aws-context";
import { AHAwsEvent } from "../../models/aws/event/aws-event";
import { AHHttpResponse } from "../http-response";

export class AHMiddleware<T> {
  payload: T;

  constructor(payload?: T) {
    this.payload = payload;
  }

  /**
   * Method to be ran before the callable
   * @param event The event received by the handler
   * @param context The context received by the handler
   * @returns An event if the middleware can be passed through or an HttpResponse if the handler call must stop due to middleware response
   */
  runBefore(event: AHAwsEvent, context: AHAwsContext): Promise<RunBeforeReturnType> | RunBeforeReturnType {
    return event;
  }

  /**
   * Method to be ran after the callable
   * @param httpResponse The http response returned by the callable
   * @param event The event received by the handler
   * @param context The context received by the handler
   * @returns An http response
   */
  runAfter(httpResponse: AHHttpResponse, event: AHAwsEvent, context: AHAwsContext): Promise<AHHttpResponse> | AHHttpResponse {
    return httpResponse;
  }
}
