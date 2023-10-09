import { RunBeforeReturnType } from "../../models/middleware/run-before-return-type";
import { AwsContext } from "../../models/aws/aws-context";
import { AwsEvent } from "../../models/aws/event/aws-event";
import { HttpResponse } from "../http-response";

export class Middleware<T> {
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
  runBefore(event: AwsEvent, context: AwsContext): Promise<RunBeforeReturnType> | RunBeforeReturnType {
    return event;
  }

  /**
   * Method to be ran after the callable
   * @param httpResponse The http response returned by the callable
   * @param event The event received by the handler
   * @param context The context received by the handler
   * @returns An http response
   */
  runAfter(httpResponse: HttpResponse, event: AwsEvent, context: AwsContext): Promise<HttpResponse> | HttpResponse {
    return httpResponse;
  }
}
