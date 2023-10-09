import { Middleware } from "../../features/middleware/middleware";
import { RestMethodEnum } from "../enums/rest-method-enum";
import { AbstractHandlerConfig } from "../../../core/models/abstract-handler-config";
import { AwsEvent } from "../aws/event/aws-event";
import { HttpResponse } from "../../features/http-response";
import { RestHandlerCacheConfig } from "../rest-handler-cache-config";

export interface RestHandlerConfig extends AbstractHandlerConfig<AwsEvent, HttpResponse> {
  method: RestMethodEnum;
  middlewares?: Array<Middleware<any>>;
  cacheConfig?: RestHandlerCacheConfig;
}
