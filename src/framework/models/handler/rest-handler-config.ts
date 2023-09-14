
import { AHCacheConfig } from "../cache-config";
import { AHMiddleware } from "../../features/middleware/middleware";
import { AHRestMethodEnum } from "../enums/rest-method-enum";
import { AHAbstractHandlerConfig } from "../../../core/models/abstract-handler-config";
import { AHAwsEvent } from "../aws/event/aws-event";
import { AHHttpResponse } from "../../features/http-response";


export interface AHRestHandlerConfig extends AHAbstractHandlerConfig<AHAwsEvent, AHHttpResponse> {
  method: AHRestMethodEnum;
  middlewares?: Array<AHMiddleware<any>>;
  cacheConfig?: AHCacheConfig;
}
