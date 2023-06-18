import { AHAwsEvent } from "../../models/aws/event/aws-event";
import { AHHttpResponse } from "../../models/http/http-response";


export abstract class AHAbstractMiddleware {
  payload: any;

  constructor(payload?: any) {
    this.payload = payload;
  }

  abstract run(event: AHAwsEvent): Promise<AHAwsEvent | AHHttpResponse>;
}
