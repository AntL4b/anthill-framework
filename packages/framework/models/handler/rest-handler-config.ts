import { AHMiddleware } from "../../features/middleware/middleware";
import { AHRestMethodEnum } from "../enums/rest-method-enum";
import { AHAbstractHandlerConfig } from "../../../core/models/abstract-handler-config";
import { AHAwsEvent } from "../aws/event/aws-event";
import { AHHttpResponse } from "../../features/http-response";
import { AHRestHandlerCacheConfig } from "../rest-handler-cache-config";

export interface AHRestHandlerConfig extends AHAbstractHandlerConfig<AHAwsEvent, AHHttpResponse> {
  method: AHRestMethodEnum;
  middlewares?: Array<AHMiddleware<any>>;
  cacheConfig?: AHRestHandlerCacheConfig;
}
