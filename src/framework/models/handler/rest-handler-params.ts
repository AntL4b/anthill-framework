
import { AHCacheConfig } from '../cache-config';
import { AHMiddleware } from '../../features/handler/rest-handler/middlewares/middleware';
import { AHRestMethodEnum } from '../enums/rest-method-enum';
import { AHAbstractHandlerParams } from '../../../core/models/abstract-handler-params';
import { AHAwsEvent } from '../aws/event/aws-event';
import { AHHttpResponse } from '../../features/http-response';


export interface AHRestHandlerParams extends AHAbstractHandlerParams<AHAwsEvent, AHHttpResponse> {
  method: AHRestMethodEnum;
  middlewares?: Array<AHMiddleware<any>>;
  cacheConfig?: AHCacheConfig;
}
