
import { AHCacheConfig } from '../cache-config';
import { AHAbstractMiddleware } from '../../features/handler/rest-handler/middlewares/abstract-middleware';
import { AHRestMethodEnum } from '../enums/rest-method-enum';
import { AHAbstractHandlerParams } from '../../../core/models/abstract-handler-params';
import { AHAwsEvent } from '../aws/event/aws-event';
import { AHHttpResponse } from '../http/http-response';


export interface AHRestHandlerParams extends AHAbstractHandlerParams<AHAwsEvent, AHHttpResponse> {
  method: AHRestMethodEnum;
  middlewares?: Array<AHAbstractMiddleware<any>>;
  cacheConfig?: AHCacheConfig;
}
