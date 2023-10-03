import { AHAwsEvent } from "../aws/event/aws-event";
import { AHHttpResponse } from "../../features/http-response";

export type RunBeforeReturnType = AHAwsEvent | AHHttpResponse;