import { AwsEvent } from "../aws/event/aws-event";
import { HttpResponse } from "../../features/http-response";

export type RunBeforeReturnType = AwsEvent | HttpResponse;