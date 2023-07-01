import { AHAwsEvent } from "../aws/event/aws-event";
import { AHHttpResponse } from "../http/http-response";

export type AHCallable = (event: AHAwsEvent) => Promise<AHHttpResponse>;