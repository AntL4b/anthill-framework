import { AHAwsEvent } from "../models/aws/event/aws-event";
import { AHHttpResponse } from "../models/http/http-response";


export abstract class AHAbstractMiddleware {
  payload: any;

  constructor(payload?: any) {
    this.payload = payload;
  }

  /**
   * Run the middleware
   * @param event The event received by the handler
   * @returns An event if the middleware can be passed through or an HttpResponse if the handler call must stop due to middleware response
   */
  abstract run(event: AHAwsEvent): Promise<AHAwsEvent | AHHttpResponse>;
}
